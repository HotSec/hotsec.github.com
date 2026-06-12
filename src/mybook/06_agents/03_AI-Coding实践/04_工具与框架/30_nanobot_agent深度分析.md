# nanobot Agent 深度分析

> 源码路径：`third/nanobot/nanobot/agent/`
> 本文聚焦 `agent/` 目录的全部 11 个顶层模块 + `tools/` 下 24 个文件，覆盖从入口、运行时、工具系统到记忆管理的完整链路。

---

## 零、分层架构总览

`agent/` 目录按职责可切为 7 层：

```
Layer 1: Entry & Orchestration
  loop.py ─── AgentLoop ─── Turn 状态机 + per-session dispatch + concurrency control

Layer 2: Core Runtime
  runner.py ─── AgentRunner ─── LLM 迭代循环 + 工具执行 + 上下文治理 + 注入
  context.py ─── ContextBuilder ─── system prompt + message + runtime context 组装

Layer 3: Memory & Persistence
  memory.py ─── MemoryStore + Consolidator + Dream
  autocompact.py ─── AutoCompact ─── TTL 驱动的空闲会话归档

Layer 4: Hook System
  hook.py ─── AgentHook / CompositeHook / SDKCaptureHook
  progress_hook.py ─── AgentProgressHook

Layer 5: Subagent
  subagent.py ─── SubagentManager

Layer 6: Model & Skills
  model_presets.py ─── 运行时模型预设切换
  skills.py ─── SkillsLoader ─── skill 文件加载与可用性检查

Layer 7: Tool System (tools/)
  base.py ─── Tool / Schema / @tool_parameters
  registry.py ─── ToolRegistry
  loader.py ─── ToolLoader（pkgutil + entry_points 双渠道）
  context.py ─── ToolContext / RequestContext / ContextAware
  runtime_state.py ─── RuntimeState Protocol
  file_state.py ─── FileStates / FileStateStore
  schema.py ─── 具体 Schema 类型
  16 个具体工具实现
```

**调用关系**：`AgentLoop.run()` 创建 `AgentRunner` → `runner.run(spec)` → `provider.chat_with_retry(...)` → 工具执行 → 结果写回 `MessageBus` → `AgentLoop._dispatch` 处理出站。

---

## 一、Layer 1：AgentLoop — Turn 状态机 + per-session 调度

[`agent/loop.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/loop.py)（~1830 行）

### 1.1 `TurnContext` 数据结构

```python
@dataclass
class TurnContext:
    msg: InboundMessage
    session: Session
    state: TurnState               # 当前状态
    initial_messages: list[dict]    # 给 AgentRunner 的初始消息
    tools: ToolRegistry | None
    model: str
    max_iterations: int
    hook: AgentHook | None          # 通过 AgentProgressHook 桥接到外部
    checkpoint_callback: Callable
    injection_callback: Callable
    goal_active_predicate: Callable
    outbound: OutboundMessage       # 最终产出
    trace: list[StateTraceEntry]    # 状态跳转记录
```

### 1.2 Turn 状态机 8 个 Handler

| 状态 | Handler | 核心逻辑 |
|---|---|---|
| `RESTORE` | `_state_restore` | ① `_restore_pending_user_turn`：上次 Turn 崩溃时补 synthetic assistant；② `_restore_runtime_checkpoint`：物化未完成的 tool_calls/results；③ `extract_documents`：PDF/Office → Markdown |
| `COMPACT` | `_state_compact` | ① `auto_compact.prepare_session()`：TTL expired session → 重载 + 获取摘要；② `Consolidator.maybe_consolidate_by_tokens()`：token 超预算则分段压缩 |
| `COMMAND` | `_state_command` | ① 解析前缀 `/command`；② `CommandRegistry.can_handle` 匹配；③ 成功 → `shortcut`（跳过 BUILD/RUN/SAVE）；④ 失败 → `dispatch`（正常 LLM 处理） |
| `BUILD` | `_state_build` | ① `ContextBuilder.build_system_prompt(...)`；② `ContextBuilder.build_messages(...)`；③ 检查 `initial_messages` 最后一条是否为 user（否则插入占位） |
| `RUN` | `_state_run` | ① `AgentRunner.run(spec)`；② 通过 `AgentProgressHook` 流式推送进度；③ 处理 `/goal` 命令的 `originating_command` 回执 |
| `SAVE` | `_state_save` | ① `_save_turn`：写 session history（剥离 media/image blocks、清 timestamp、追加 latency_ms）；② `_auto_dream`：`Consolidator.trigger()` + `MemoryStore.auto_commit()` |
| `RESPOND` | `_state_respond` | ① `_build_outbound`：拼 `OutboundMessage`；② `_should_suppress`：message 工具已发过 → 静默；③ `_resolve_multi_recipient`：分渠道拆消息 |
| `DONE` | — | 结束 `_process_message`，返回 `ctx.outbound` |

### 1.3 `AgentLoop.run()` 主循环

```python
async def run(self):
    await self._connect_mcp()
    while self._running:
        msg = await asyncio.wait_for(self.bus.consume_inbound(), timeout=1.0)
        # ① runtime_control（mcp reconnect）
        # ② 优先级命令 /stop /restart → inline dispatch
        # ③ 已有 pending queue → 消息注入
        # ④ 创建新 asyncio.Task
```

**关键设计**：
- **timeout=1s**：`consume_inbound` 不忙等，间隙执行 `auto_compact.check_expired`
- **per-session 串行**：`asyncio.Lock` + `asyncio.Semaphore`（默认并发=3）
- **中途注入**：新消息入 `_pending_queues[key]`（maxsize=20），不创建新 task

### 1.4 `_dispatch` 三层容错

```python
async def _dispatch(self, msg):
    async with locks[session_key], concurrency_gate:
        pending = asyncio.Queue(maxsize=20)
        self._pending_queues[session_key] = pending
        try:
            response = await self._process_message(msg, ...)
            await self.bus.publish_outbound(response)
        except asyncio.CancelledError:           # /stop 触发
            self._restore_runtime_checkpoint(session)  # 物化已完成的 tool 结果
            self.sessions.save(session)
            raise
        finally:
            # drain pending → 重新发布到 inbound（不吞消息）
            for item in drain(pending):
                await self.bus.publish_inbound(item)
```

### 1.5 Checkpoint 机制

**写入时机**（AgentRunner 内部回调）：
- `"awaiting_tools"` — assistant_message + 待执行的 tool_calls
- `"tools_completed"` — assistant_message + 已完成的 tool_results
- `"final_response"` — assistant_message

**恢复逻辑**（`_restore_runtime_checkpoint`）：
1. 还原 assistant_message
2. 还原 completed_tool_results
3. 对 pending_tool_calls 插入 synthetic tool error
4. 去重：与 session.messages 末尾做重叠检测（对比 `role + content + tool_call_id + name + tool_calls + reasoning`）
5. 只追加不重叠的部分

---

## 二、Layer 2：AgentRunner — 协议无关的 LLM 循环

[`agent/runner.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/runner.py)（~1650 行）

### 2.1 数据结构

```python
@dataclass(slots=True)
class AgentRunSpec:
    initial_messages: list          # 初始消息（含 system prompt + history）
    tools: ToolRegistry
    model: str
    max_iterations: int             # 默认 100
    concurrent_tools: bool = False
    max_tool_result_chars: int = 20000
    hook: AgentHook                 # 生命周期回调
    injection_callback: Callable    # 中途消息注入
    checkpoint_callback: Callable   # 运行时持久化
    goal_active_predicate: Callable
    goal_continue_message: str | None
    context_window_tokens: int
    completion_tokens: int
    fail_on_tool_error: bool = False
    finalize_on_max_iterations: bool = True
    ...

@dataclass(slots=True)
class AgentRunResult:
    final_content: str | None
    messages: list                  # 完整历史
    tools_used: list[str]
    usage: dict[str, int]
    stop_reason: str                # completed / max_iterations / error / tool_error
    had_injections: bool
    tool_events: list
```

### 2.2 `_run_core` 6 阶段完整流程

```
for iteration in range(max_iterations):
    ┌─────────────────────────────────────────────────────┐
    │ 阶段 1: 上下文治理 (Context Governance)             │
    │  _drop_orphan_tool_results → _backfill_missing      │
    │  → _microcompact → _apply_tool_result_budget        │
    │  → _snip_history → _drop_orphan → _backfill         │
    ├─────────────────────────────────────────────────────┤
    │ 阶段 2: _request_model                              │
    │  wants_streaming? → chat_stream_with_retry           │
    │  wants_progress?  → chat_stream_with_retry(to progress)│
    │  else             → chat_with_retry                  │
    ├─────────────────────────────────────────────────────┤
    │ 阶段 3a: should_execute_tools → tool execution      │
    │  a. emit_checkpoint("awaiting_tools")                │
    │  b. _partition_tool_batches                         │
    │  c. asyncio.gather / serial                         │
    │  d. 每个 tool_result → emit_checkpoint("tools_completed")│
    │  e. append to messages                              │
    │  f. continue 下一轮                                  │
    ├─────────────────────────────────────────────────────┤
    │ 阶段 3b: 文本收尾分支                                │
    │  空响应 → 重试(_MAX_EMPTY_RETRIES=2) → 最终化重试   │
    │  length → append assistant + "Please continue" → continue│
    │  正常 → break                                       │
    ├─────────────────────────────────────────────────────┤
    │ 阶段 4: drain injections (4 个时机)                  │
    │  a. 工具错误后                                       │
    │  b. 工具执行完成                                     │
    │  c. LLM 正常响应后(含 goal_continue)                 │
    │  d. max_iterations 后                                │
    │  上限: _MAX_INJECTIONS_PER_TURN=3, _MAX_INJECTION_CYCLES=5│
    └─────────────────────────────────────────────────────┘
```

**关键：messages vs messages_for_model**
`messages` 是持久化历史（append-only），`messages_for_model` 是给 LLM 的修补版。所有 snip/microcompact/role-alternation 只改后者，`save_skip` 永远指向原 messages 的位置。

### 2.3 `_microcompact` 细节

保留最近 10 个 `_COMPACTABLE_TOOLS`（`read_file`/`exec`/`grep`/`web_search`/`web_fetch`/`list_dir`）完整结果；更早的替换为 `[tool_name result omitted from context]`。只在内容 ≥ 500 字符时才替换。

### 2.4 `_snip_history` 容错

`budget = context_window_tokens - max_output - 1024`，从尾部向前保留。若裁剪后不以 `user` 起始 → 回溯到最近 user，或插入 synthetic user message（应对 GLM/Zhipu 等 provider 拒收 `system→assistant` 序列）。

### 2.5 `_request_model` 三种路径

```python
if wants_streaming:           # AgentHook.wants_streaming() → 全流式
    coro = provider.chat_stream_with_retry(on_content_delta=_stream)
elif wants_progress_streaming:  # progress_callback → 进度增量（去 think 块）
    coro = provider.chat_stream_with_retry(on_content_delta=_stream_progress)
else:                         # 非流式
    coro = provider.chat_with_retry(**kwargs)
outer_timeout_s = None if streaming else timeout_s  # 流式不做墙钟超时
```

**`_stream_progress`** 用 `IncrementalThinkExtractor` 剥离 ` response...` 块，只推送非 think 增量文字。

**`live_file_edits`**：`StreamingFileEditTracker` 跟踪流式 tool_call_delta，LLM 返回后 `flush → apply_final_call_ids → error_unmatched`。

### 2.6 工具执行安全纵深

| 防护层 | 触发条件 | 行为 |
|---|---|---|
| SSRF 检测 | 匹配 `_SSRF_MARKERS` | 不重试，返回安全说明 soft payload |
| 工作区越界（soft） | 匹配 `_WORKSPACE_VIOLATION_MARKERS` | soft block + hint |
| 工作区越界（escalation） | 相同 `(tool, target_hash)` 重复 | 更强的拒绝说明 |
| 重复外访限流 | 同一 (tool, params_hash) ≥3 次 | 拒绝 + 提示寻求用户指导 |
| `fail_on_tool_error` | flag 开启 + 非 transient | fatal_error 退出 run |

### 2.7 `_run_tool` 单工具执行流程

```
1. 重复外访限流（_MAX_DUPLICATE_EXTERNAL_LOOKUP=3）
2. ToolRegistry.prepare_call → 名称解析 + 类型强转 + JSON Schema 校验
3. 文件编辑事件 start（prepare_file_edit_trackers + build_file_edit_start_event）
4. tool.execute(**params)
5. 结果分类：
   a. 正常 → 文件编辑事件 end → (result, {"status":"ok"}, None)
   b. 异常 → 文件编辑事件 error → SSRF/workplace_violation/fatal_error 分类
6. normalize_tool_result → maybe_persist + truncate
```

---

## 三、Layer 2：ContextBuilder — system prompt + message 组装

[`agent/context.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/context.py)（~300 行）

### 3.1 `build_system_prompt` 组装顺序

```python
def build_system_prompt(self, ...):
    parts = [
        identity       # identity.md 模板渲染（workspace, runtime, channel 变量替换）
        bootstrap      # AGENTS.md / SOUL.md / USER.md 文件级拼接
        tool_contract  # tool_contract.md 工具使用协议
        Memory         # MEMORY.md 长时记忆，仅 non-template 时注入
        Active Skills  # always skill 的原文
        Skills Summary # 可用技能列表
        Recent History # history.jsonl 最近 50 条
        Archived Context Summary  # session_summary（AutoCompact 产物）
    ]
    return "\n\n---\n\n".join(parts)
```

### 3.2 `build_messages` 组装

```python
def build_messages(self, history, current_message, ...):
    # 1. runtime_ctx = _build_runtime_context(channel, chat_id, time)
    #    格式：[Runtime Context]\nCurrent Time: ...\nChannel: ...\n...
    # 2. user_content = _build_user_content(text, media)
    #    media → [image_url_block_base64, ..., text_block]
    # 3. merged = user_content + "\n\n" + runtime_ctx
    #    Runtime 在尾部（每 turn 变化），user 前缀稳定 → prompt cache 友好
    # 4. messages = [system, *history, {"role": user/assistant, "content": merged}]
    # 5. 若最后一条 role == current_role → merge（防 consecutive same-role）
```

**媒体处理管线**：
- `extract_documents`：PDF/Office → Markdown（PyMuPDF/libreoffice）
- `_build_user_content`：图片 → base64 data URI 编码为 `image_url` 块
- `_sanitize_persisted_blocks`：保存时 image_url 块 → `"[image: path/to/file]"`

---

## 四、Layer 3：MemoryStore + Consolidator + Dream

[`agent/memory.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/memory.py)（~1100 行）

### 4.1 MemoryStore：纯文件 I/O

```
workspace/
├── MEMORY.md          # LLM 可编辑的长时记忆
├── SOUL.md            # Agent 身份（不可变）
├── USER.md            # 用户偏好
└── memory/
    ├── MEMORY.md      # 工作区记忆
    ├── history.jsonl  # append-only 事件日志
    ├── .cursor        # 自增 cursor
    └── .dream_cursor  # Dream 已处理到的 cursor
```

- **原子写**：`tmp → flush → os.fsync → os.replace → os.fsync(dir_fd)`
- **线程安全**：`threading.Lock` 保护 cursor + append
- **GitStore**：基于 pygit2（可选），跟踪 `SOUL.md/USER.md/MEMORY.md/.dream_cursor`
- **`enforce_file_cap`**：`FILE_MAX_MESSAGES=2000` 时打包归档到 `memory_dir`

### 4.2 Consolidator：token-budget 驱动压缩

```
maybe_consolidate_by_tokens(session):
  1. budget = context_window - max_completion - 1024
  2. target = budget * consolidation_ratio
  3. 先处理 replay overflow（replay_max_messages 裁剪）
  4. estimate_session_prompt_tokens → if < budget: return
  5. 循环最多 _MAX_CONSOLIDATION_ROUNDS=5：
     a. pick_consolidation_boundary → user-turn 边界切割
     b. archive(chunk) → LLM 摘要 → append_history(max_chars=8000)
     c. LLM 失败 → raw_archive 兜底（直接 dump 格式化文本）
     d. 重新 estimate → < target 或 无边界 → break
  6. persist_last_summary → session.metadata["_last_summary"]
```

### 4.3 Dream：双阶段记忆演化

- 每 2 小时（`DreamConfig.interval_h=2`）触发
- `build_dream_prompt`：取 20 条未处理的 history.jsonl entry → 渲染 `dream.md` 模板
- `build_dream_tools`：限制工具集（只 read/edit/write/apply_patch），只能编辑 `SOUL.md/USER.md/MEMORY.md/skills/`
- `dream_session_key`：`dream:20260611-143000` 格式
- 完成后：更新 `.dream_cursor` → `auto_commit` → `prune_dream_sessions(keep=10)`

---

## 五、Layer 3：AutoCompact — TTL 空闲会话归档

[`agent/autocompact.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/autocompact.py)（96 行）

```python
class AutoCompact:
    _RECENT_SUFFIX_MESSAGES = 8
    _INTERNAL_SESSION_PREFIXES = ("dream:",)

    def check_expired(self, schedule_background, active_session_keys):
        """每 tick（AgentLoop 的 1s timeout 间隙）调用"""
        for info in self.sessions.list_sessions():
            key = info.get("key")
            if key and not internal(key) and key not in active_session_keys:
                if TTL_expired(info["updated_at"], now):
                    schedule_background(self._archive(key))

    async def _archive(self, key):
        summary = await self.consolidator.compact_idle_session(key, last_8_msgs)
        # 失败 → 静默吞异常

    def prepare_session(self, session, key):
        # Hot path: _summaries[mem] dict → 进程未重启
        # Cold path: session.metadata["_last_summary"] → 进程重启后
        return session, formatted_summary_or_None
```

**两速查找**：内存 dict 优先（同一个进程周期内），fallback 到 session metadata（跨越重启）。

---

## 六、Layer 4：Hook 系统

### 6.1 AgentHook 生命周期

[`agent/hook.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/hook.py)（~170 行）

```python
class AgentHook:
    # Run 级别
    async before_run(context)       # 收到 AgentRunSpec
    async after_run(context)        # 正常完成
    async on_error(context)         # 异常快照（stop_reason + error）
    async on_finally(context)       # 无条件 finally

    # Iteration 级别
    def wants_streaming() → bool
    async before_iteration(context)
    async on_stream(context, delta)
    async on_stream_end(context, resuming=True/False)
    async emit_reasoning(delta)
    async emit_reasoning_end()
    async before_execute_tools(context)
    async after_iteration(context)

    # Content
    def finalize_content(context, content) → str | None
```

### 6.2 CompositeHook 容错

```python
class CompositeHook(AgentHook):
    async def _for_each_hook_safe(self, method_name, *args, **kwargs):
        for hook in self._hooks:
            try:
                await getattr(hook, method_name)(*args, **kwargs)
            except Exception:
                logger.exception("Hook %s.%s failed", hook, method_name)
                # 不崩主循环
```

- `finalize_content` 是管道（无异常隔离，bug 应暴露）
- `wants_streaming()` 是 OR 逻辑（任何一个需要就启用流式）

### 6.3 AgentProgressHook

[`agent/progress_hook.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/progress_hook.py)（~130 行）

把 AgentRunner hook 翻译为对外的回调链：
- `on_progress`：进度文本回调（`_resolve_progress_receiver` 路由到 channel/cli）
- `on_iteration`：每轮 LLM 调用后的 caller-side 回调
- `set_tool_context` / `clear_tool_context`：为 `_should_send_progress` 提供当前工具名
- `tool_hint_max_length`：截断长度
- `_device_timeout`：设备级流式保活（WebSocket 心跳）

---

## 七、Layer 5：SubagentManager

[`agent/subagent.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/subagent.py)（~360 行）

### 7.1 完整生命周期

```
spawn(task, label, origin_channel, origin_chat_id, ws_scope)
  → task_id = uuid[:8]
  → SubagentStatus(task_id, label, phase="initializing")
  → asyncio.create_task(_run_subagent(task_id, ...))
  → 返回确认消息给用户

_run_subagent:
  → _build_tools(scope="subagent")
     # 独立 ToolRegistry，不含 message/spawn/cron/sustained_goal
     # ws_scope 通过 bind_workspace_scope 注入
  → _build_subagent_prompt(workspace=root)
     # subagent_system.md 模板 + skills 摘要
  → runner.run(AgentRunSpec(
        initial_messages=[system, user_task],
        tools=subagent_tools,
        hook=_SubagentHook(task_id, status),
        fail_on_tool_error=True,
        finalize_on_max_iterations=False,
    ))
  → _announce_result → bus.publish_inbound(
        InboundMessage(
            channel="system", sender_id="subagent",
            session_key_override=origin_session_key,
        )
    )
```

### 7.2 结果回投

- 通过 `session_key_override` 对齐主 Agent 的 `effective_key`
- 注入到 pending queue（mid-turn injection），非独立 dispatch task
- 主 Agent `_process_system_message` 接收后以 `current_role="assistant"` 构建消息

### 7.3 SubagentStatus 可观察性

```python
@dataclass
class SubagentStatus:
    task_id: str
    label: str
    phase: str          # initializing / reasoning / executing / finalizing / done / error
    iteration: int
    usage: dict
    tool_events: list
    error: str | None
    stop_reason: str | None
```

`_SubagentHook` 在每个 hook 回调中更新 `status`，`SubagentManager.status(task_id)` 供外部 poll。

---

## 八、Layer 6：Model Presets

[`agent/model_presets.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/model_presets.py)（64 行）

```python
def configured_model_presets(config):
    return {**config.model_presets, "default": config.resolve_default_preset()}

def build_static_preset_snapshot(provider, name, preset):
    provider.generation = preset.to_generation_settings()
    return ProviderSnapshot(provider, model=preset.model, ...)

class ProviderSnapshot:
    provider: LLMProvider
    model: str
    context_window_tokens: int
    signature: tuple  # 用于检测预设变化（模型热切换）
```

`ProviderSnapshot.signature` 比对机制让 AgentLoop 在检测到预设切换时自动重建 provider。

---

## 九、Layer 7：Tool System 完整剖析

### 9.1 Tool 基类

[`agent/tools/base.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/base.py)（280 行）

```python
class Tool(ABC):
    # --- 必须实现 ---
    name: str           # @property, abstract
    description: str    # @property, abstract
    parameters: dict    # @property, abstract（JSON Schema）

    # --- 可选覆盖 ---
    read_only: bool = False     # 无副作用（影响 concurrency_safe）
    exclusive: bool = False     # 不允许并发
    concurrency_safe: bool      # computed: read_only and not exclusive

    # --- 插件元数据 ---
    config_key: str = ""
    _plugin_discoverable: bool = True
    _scopes: set[str] = {"core"}

    # --- 工厂 ---
    @classmethod
    def config_cls(cls) → type[BaseModel] | None: ...
    @classmethod
    def enabled(cls, ctx: ToolContext) → bool: ...
    @classmethod
    def create(cls, ctx: ToolContext) → Tool: ...

    # --- 参数处理 ---
    def cast_params(self, params) → dict: ...      # 安全类型强转
    def validate_params(self, params) → list[str]:  # JSON Schema 校验

    # --- 执行 ---
    @abstractmethod
    async def execute(self, **kwargs) → Any: ...

    # --- 序列化 ---
    def to_schema(self) → dict: ...  # OpenAI function schema
```

### 9.2 `@tool_parameters` 装饰器

```python
@tool_parameters({"type": "object", "properties": {...}, "required": [...]})
class MyTool(Tool): ...
```

把 `parameters` 从 abstract property 变成自动返回 `deepcopy(frozen)` 的 concrete property，并在 `__abstractmethods__` 中移除 `parameters`。

### 9.3 Schema 验证系统

```python
class Schema(ABC):
    @abstractmethod
    def to_json_schema(self) → dict: ...

    def validate_value(self, value, path="") → list[str]: ...

    @staticmethod
    def validate_json_schema_value(val, schema, path="") → list[str]:
        """递归校验：type / nullable / enum / minimum / maximum /
           minLength / maxLength / minItems / maxItems / required / properties"""
```

**`_cast_value` 智能强转**（`base.py:205-241`）：
- `"true"/"1"/"yes"` → `True`（boolean 目标）
- `"false"/"0"/"no"` → `False`
- `"42"` → `42`（integer 目标）
- `"3.14"` → `3.14`（number 目标）
- 已匹配类型 → 直接返回
- string → `str(val)`
- object 递归 `_cast_object`
- array 递归 `_cast_value`

### 9.4 ToolRegistry 核心 API

[`agent/tools/registry.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/registry.py)（180 行）

```python
class ToolRegistry:
    register / unregister / get / has

    get_definitions() → list[dict]:
        # stable sort: builtins 按名排序 → MCP tools 按名排序
        # 缓存到下一次 register/unregister
        # prompt-cache 友好：builtins 前缀稳定

    prepare_call(name, params) → (Tool, params, error):
        # 1. 查表 + 名称建议（_suggest_name：规范化匹配）
        # 2. _coerce_argument_value：JSON str → dict/list
        # 3. _unwrap_arguments_payload：{"arguments":{...}} 包装解开
        # 4. cast_params + validate_params → error or (tool, cast_params, None)

    execute(name, params) → Any:
        tool, params, error = prepare_call(name, params)
        if error: return error + hint
        result = await tool.execute(**params)
        return result if OK else result + hint
```

### 9.5 ToolLoader：双渠道发现

[`agent/tools/loader.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/loader.py)（116 行）

```python
class ToolLoader:
    def discover(self) → list[type[Tool]]:
        # pkgutil.iter_modules → 跳过 _SKIP_MODULES + 下划线开头的
        # 按 issubclass(Tool) + _plugin_discoverable + 无 __abstractmethods__ 过滤
        # 排序 + 去重(by id)

    def _discover_plugins(self) → dict[str, type[Tool]]:
        # entry_points(group="nanobot.tools")
        # 同条件过滤
        # 内置名优先（插件不能 shadow 内置名）

    def load(self, ctx, registry, *, scope="core") → list[str]:
        # 先加载内置，再加载插件
        # scope 过滤：tool_cls._scopes 包含 scope
        # enabled(ctx) 过滤
        # 插件与内置同名 → skip（warning）
        # 其他同名 → overwrite（warning）
```

### 9.6 工具上下文系统

[`agent/tools/context.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/context.py)（60 行）：

```python
@dataclass(frozen=True)
class RequestContext:          # per-request 上下文（上下文变量绑定）
    channel: str
    chat_id: str
    message_id: str | None
    session_key: str | None

@dataclass
class ToolContext:             # 工厂级上下文（创建工具实例时注入）
    config: Any
    workspace: str
    bus: Any | None            # MessageBus（MessageTool 的 send_callback 来源）
    subagent_manager: Any | None
    cron_service: Any | None
    sessions: Any | None
    file_state_store: Any = None
    provider_snapshot_loader: Callable | None = None
    timezone: str = "UTC"
    workspace_sandbox: Any | None
    runtime_events: Any | None


@runtime_checkable
class ContextAware(Protocol):  # 运行时注入协议
    def set_context(self, ctx: RequestContext) → None: ...
```

**两层注入设计**：
1. **工厂级**（`ToolContext`）：工具实例创建时注入只读基础设施引用
2. **运行时级**（`RequestContext`）：工具执行前通过 `ContextAware.set_context` 注入当前请求元数据

### 9.7 FileStates：读前检查与去重

[`agent/tools/file_state.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/file_state.py)（205 行）

```
FileStates  (per-session)
  ├── record_read(path, offset, limit) → 记录 mtime + content_hash
  ├── record_write(path) → 更新 mtime, can_dedup=False
  ├── check_read(path) → 返回警告或 None
  │    - 未读过 → "Read it first to verify content before editing."
  │    - mtime 变但 hash 同(touch) → 更新 mtime, pass
  │    - mtime 变且 hash 变 → "Warning: file modified since last read."
  │    - mtime 不变但 hash 变(极快的写) → "Warning: file modified..."
  ├── is_unchanged(path, offset, limit) → bool
  │    - 用于 read_file 工具决定是否跳过读取（"File unchanged since last read"）

FileStateStore (global)
  ├── for_session(key) → FileStates
  └── per-session 隔离

_context 绑定: ContextVar[FileStates]
  bind_file_states / reset_file_states / current_file_states
```

### 9.8 RuntimeState Protocol

[`agent/tools/runtime_state.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/runtime_state.py)（62 行）

```python
class RuntimeState(Protocol):
    """MyTool 对 AgentLoop 运行时状态的抽象契约"""
    model: str
    max_iterations: int
    current_iteration: int
    workspace: str
    context_window_tokens: int
    web_config: Any; exec_config: Any
    subagents: Any
    _runtime_vars: dict    # scratchpad（跨 turn 但跨重启丢失）
    _last_usage: Any       # 上次 token 使用量
    tool_names: list[str]
    ...
```

### 9.9 MyTool：运行时代理检查/修改

[`agent/tools/self.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/self.py)（484 行）

```python
class MyTool(Tool, ContextAware):
    name = "my"
    _plugin_discoverable = False  # 手动注册（需要 AgentLoop 引用）

    BLOCKED = {     # 禁止 inspect + modify
        "bus", "provider", "_running", "tools",
        "_runtime_vars", "_mcp_servers", "_mcp_stacks",
        "_pending_queues", "_session_locks", "_active_tasks",
        "restrict_to_workspace", "channels_config", ...
    }

    READ_ONLY = {   # 可 inspect、禁止 modify
        "subagents", "exec_config", "web_config", "workspace_sandbox",
    }

    RESTRICTED = {  # 可按范围 modify
        "max_iterations":        {"type": int, "min": 1,   "max": 100},
        "context_window_tokens": {"type": int, "min": 4096, "max": 1_000_000},
        "model":                 {"type": str, "min_len": 1},
    }

    _DENIED_ATTRS = {    # 所有 magic/dunder 方法
        "__class__", "__dict__", "__subclasses__", "__mro__",
        "__init__", "__new__", "__reduce__", ...
    }

    _SENSITIVE_NAMES = { # 敏感字段名（含 sub-field）
        "api_key", "secret", "password", "token", "credential", ...
    }
```

**action 分发**：
- `check`（无 key）→ `_inspect_all`：RESTRICTED 键 + workspace + web_config + exec_config + _last_usage + scratchpad
- `check(key)` → `_resolve_path(key)` 逐点解析（`.` 分割路径），格式化为友好字符串
- `set(key, value)` → `_modify`：验证 key 安全性 → RESTRICTED 范围校验 → 自由键类型匹配
- scratchpad 上限：`_MAX_RUNTIME_KEYS = 64`

---

## 十、工具全景图

### 10.1 文件系统工具

| 工具 | 文件 | 能力 |
|---|---|---|
| `read_file` | [filesystem.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/filesystem.py) | 工作区文件读取，支持 offset/limit、`FileStates.is_unchanged` 去重 |
| `write_file` | 同上 | 写文件，自动 `record_write` |
| `edit_file` | 同上 | 精确字符串置换（READ_SNIP 格式），`check_read` 读前检查 |
| `list_dir` | 同上 | 目录列表（含 .gitignore 过滤） |
| `apply_patch` | [apply_patch.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/apply_patch.py) | unified diff 多文件编辑，with_fallback |
| `grep` / `find` | [filesystem.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/filesystem.py) | 搜索 |
| `exec` (`shell`) | [shell.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/shell.py) | shell 执行 + PTH sandbox + allow/deny 模式 |
| `cli_apps` | [cli_apps.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/cli_apps.py) | CLI 子应用，可通过 JSON line 协议接入 |

### 10.2 Web 工具

| 工具 | 文件 | 能力 |
|---|---|---|
| `web_search` | [search.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/search.py) | 多 provider 搜索（Kagi/Tavily/SearxNG/...） |
| `web_fetch` | [web.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/web.py) | URL fetch + Markdown 转换 + SSRF 检测 |

### 10.3 Agent 内省工具

| 工具 | 文件 | 能力 |
|---|---|---|
| `my` (`self`) | [self.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/self.py) | 运行时配置查改（`check`/`set`），BLOCKED/READ_ONLY/RESTRICTED 三层保护 |
| `message` | [message.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/message.py) | 主动发消息 + media 附件 + inline buttons + `_sent_in_turn` 抑制最终响应 |

### 10.4 子任务工具

| 工具 | 文件 | 能力 |
|---|---|---|
| `spawn` | [spawn.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/spawn.py) | 启动后台 Subagent，`ContextAware` 注入 origin channel/chat_id |
| `long_task` | [long_task.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/long_task.py) | 标记 session 持续目标（goal_state 元数据） |
| `complete_goal` | 同上 | 结束持续目标 + 发布 GoalStateChanged runtime event |
| `image_generation` | [image_generation.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/image_generation.py) | 多 provider 图像生成 |

### 10.5 其他

| 工具 | 文件 | 能力 |
|---|---|---|
| `mcp` | [mcp.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/mcp.py) | MCP 客户端，动态 import 子模块 |
| `cron` | [cron.py](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/cron.py) | 定时任务 CRUD |

---

## 十一、Skills 系统

[`agent/skills.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/skills.py)

```python
class SkillsLoader:
    # workspace/skills/<name>/SKILL.md  ← 用户自定义
    # nanobot/skills/<name>/SKILL.md   ← 内置
    # workspace 同名覆盖内置

    def list_skills(filter_unavailable=True) → list[dict]:
        # workspace 优先 → 内置补充 → 去 disabled → 检查 requirements

    def load_skill(name) → str | None:
        # 读 SKILL.md → 剥离 YAML frontmatter → 返回 Markdown body

    def sync_skills() → int:
        # 从 builtin 目录复制 SKILL.md 到 workspace/skills/
        # 返回 copied count
```

Skill 文件格式：
```markdown
---
name: my-skill
description: 技能描述
always: false          # true → 在 system prompt 中全文注入
requires: ["tool_x"]  # 依赖工具检查
---
技能内容...
```

---

## 十二、模块间依赖关系图

```
AgentLoop (loop.py)
  ├── MessageBus (bus/)
  ├── SessionManager (session/)
  ├── ContextBuilder (context.py) ── SkillsLoader (skills.py)
  ├── AgentRunner (runner.py)
  │     ├── LLMProvider (providers/)  ← model_presets.py
  │     ├── ToolRegistry (tools/registry.py)
  │     │     └── Tool (tools/base.py)
  │     ├── AgentHook (hook.py)
  │     │     └── AgentProgressHook (progress_hook.py) ── Channel/Bus
  │     └── SubagentManager (subagent.py)
  │           └── AgentRunner (递归)
  ├── Consolidator (memory.py)
  │     └── MemoryStore (memory.py)
  ├── Dream (memory.py)
  │     └── MemoryStore (memory.py)
  ├── AutoCompact (autocompact.py)
  │     └── Consolidator (memory.py)
  └── CommandRegistry (command/)
```

---

## 十三、关键设计决策速查

| 决策 | 体现模块 | 细微之处 |
|---|---|---|
| **状态表驱动** | loop.py | `_TRANSITIONS` 表 + `TurnState` Enum，新状态只需加 handler 和一条边 |
| **messages vs messages_for_model** | runner.py | 所有 snip/microcompact 只改给 LLM 的副本，持久化历史 untouched |
| **should_execute_tools 安全门** | runner.py + providers/base.py | `finish_reason` 不在 `{tool_calls, function_call, stop}` 时拒绝执行 |
| **per-session 串行 / 跨 session 并发** | loop.py | `asyncio.Lock` + `asyncio.Semaphore`，pending queue 做注入 |
| **Checkpoint + Pending Drain** | loop.py | `/stop` 不丢上下文；残留消息不吞 |
| **两速查找** | autocompact.py | 内存 dict (hot) → session metadata (cold)，跨重启不丢摘要 |
| **工厂注入 + 运行时注入** | tools/context.py | `ToolContext`（实例创建） + `RequestContext`（执行前绑定） |
| **内置优先** | tools/loader.py | 插件不能 shadow 内置 tool name |
| **stable sort definitions** | tools/registry.py | 内置按名 → MCP 按名，前缀稳定 → prompt cache 友好 |
| **BLOCKED/READ_ONLY/RESTRICTED** | tools/self.py | MyTool 三层保护，含 magic method 黑名单和敏感字段名黑名单 |
| **content_hash 去重读** | tools/file_state.py | mtime + SHA256 双重校验，touch 不触发误报 |
| **Consolidator raw_archive 兜底** | memory.py | LLM 压缩失败 → 直接 dump 格式化文本，不丢数据 |
| **递归复用 AgentRunner** | subagent.py | 子 Agent 不是另起炉灶，同一个 Runner 独立跑 |
| **设计 markdown 注释** | subagent.py, runner.py 等 | 大量 `Why`, `Note`, `Historical` 注释解释设计决策和边界条件 |

---

## 十四、完整调用栈速查

| 我想理解… | 看这里 |
|---|---|
| AgentLoop 主循环 | `loop.py:run`（851-926 行） |
| Turn 状态机驱动 | `loop.py:_process_message`（1196-1292 行） |
| 8 个状态 handler | `loop.py:_state_restore` ~ `_state_respond` |
| checkpoint 写入 | `loop.py:_set_runtime_checkpoint` |
| checkpoint 恢复 | `loop.py:_restore_runtime_checkpoint`（1667-1719 行） |
| pending user turn 恢复 | `loop.py:_restore_pending_user_turn`（1721-1739 行） |
| turn 保存 | `loop.py:_save_turn`（1569-1614 行） |
| AgentRunner 主循环 | `runner.py:_run_core`（323-668 行） |
| 上下文治理 pipeline | `runner.py:_drop_orphan / _backfill / _microcompact / _snip / _tool_result_budget` |
| LLM 调用 | `runner.py:_request_model`（692-832 行） |
| 工具执行 | `runner.py:_execute_tools` + `_run_tool`（1028-1177 行） |
| 注入合并 | `runner.py:_try_drain_injections`（175-228 行） |
| 空响应重试 | `runner.py:_run_core` 的空响应分支 |
| 最终化 | `runner.py:_try_finalize_after_max_iterations` |
| ContextBuilder prompt | `context.py:build_system_prompt` |
| ContextBuilder messages | `context.py:build_messages` |
| MemoryStore 原子写 | `memory.py:write_file` / `append_history` |
| Consolidator 主循环 | `memory.py:maybe_consolidate_by_tokens` |
| Dream 完整流程 | `memory.py:trigger` → `_run_dream` |
| AutoCompact TTL | `autocompact.py:check_expired` + `prepare_session` |
| Subagent spawn | `subagent.py:spawn` → `_run_subagent` |
| Subagent 结果回投 | `subagent.py:_announce_result` |
| Hook 组合 | `hook.py:CompositeHook._for_each_hook_safe` |
| Progress hook 流式 | `progress_hook.py:_stream_delta` / `_stream_end` |
| Tool 基类 | `tools/base.py:Tool` |
| Tool 装饰器 | `tools/base.py:tool_parameters` |
| Schema 递归校验 | `tools/base.py:Schema.validate_json_schema_value` |
| 类型强转 | `tools/base.py:Tool._cast_value` |
| ToolRegistry 注册/查找 | `tools/registry.py` |
| prepare_call 全流程 | `tools/registry.py:prepare_call` |
| ToolLoader 发现 | `tools/loader.py:discover` + `_discover_plugins` |
| ToolLoader 加载 | `tools/loader.py:load` |
| MyTool 查/改 | `tools/self.py:_inspect` / `_modify` |
| MessageTool 发送 | `tools/message.py:execute` |
| FileStates 去重 | `tools/file_state.py:is_unchanged` |
| FileStates 读前检查 | `tools/file_state.py:check_read` |
| 上下文绑定 | `tools/context.py:bind_request_context` + `ContextAware.set_context` |
| Model preset 切换 | `model_presets.py:build_runtime_preset_snapshot` |
| Skills 加载 | `skills.py:SkillsLoader.list_skills` + `load_skill` |