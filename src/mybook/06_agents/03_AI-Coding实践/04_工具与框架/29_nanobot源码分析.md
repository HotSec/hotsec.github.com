# nanobot 源码分析

> 来源：[HKUDS/nanobot](https://github.com/HKUDS/nanobot) v0.2.1（源码路径：`third/nanobot/`）
> 本文覆盖整体架构、`agent/` 目录全部 11 个顶层模块 + `tools/` 下 24 个文件的逐行分析，以及 Provider/Channel/Config 子系统。

---

## 一、一句话总览

nanobot 是一个 **"MessageBus 解耦 + 状态机驱动的 Turn 引擎 + 协议无关的 Provider/Tool/Channel 插件体系"** 三层叠加的个人 AI Agent 框架。整个进程由 **MessageBus 异步队列**串起"渠道 → AgentLoop → AgentRunner → Provider → Tools → Channel 派发"这一闭环，而 **AgentLoop 的 Turn 状态机**（`RESTORE → COMPACT → COMMAND → BUILD → RUN → SAVE → RESPOND → DONE`）是核心的"心跳"。

---

## 二、目录骨架

```
nanobot/
├── nanobot.py / __main__.py         # Python SDK 入口
├── cli/commands.py                  # Typer CLI
├── bus/
│   ├── queue.py                     # MessageBus（inbound + outbound asyncio.Queue）
│   ├── events.py                    # InboundMessage / OutboundMessage
│   └── runtime_events.py            # RuntimeEventBus（生命周期事件，与 MessageBus 隔离）
├── agent/
│   ├── loop.py                      # AgentLoop：Turn 状态机 + per-session 调度
│   ├── runner.py                    # AgentRunner：协议无关的工具调用 LLM 循环
│   ├── context.py                   # ContextBuilder：system prompt + history + runtime context
│   ├── memory.py                    # MemoryStore + Consolidator + Dream
│   ├── autocompact.py               # AutoCompact：TTL 驱动的会话清理
│   ├── subagent.py                  # SubagentManager：隔离的子 Agent 后台任务
│   ├── hook.py                      # AgentHook / CompositeHook / SDKCaptureHook
│   ├── progress_hook.py             # AgentProgressHook
│   ├── model_presets.py             # 模型预设切换
│   ├── skills.py                    # SkillsLoader
│   └── tools/
│       ├── base.py                  # Tool / Schema / @tool_parameters
│       ├── registry.py              # ToolRegistry
│       ├── loader.py                # ToolLoader（pkgutil + entry_points 双渠道）
│       ├── context.py               # ToolContext / RequestContext / ContextAware
│       ├── file_state.py            # FileStates / FileStateStore
│       ├── runtime_state.py         # RuntimeState Protocol
│       ├── schema.py                # 具体 Schema 类型
│       └── filesystem.py / shell.py / web.py / search.py / message.py
│           self.py / spawn.py / long_task.py / cron.py / mcp.py / ...
├── providers/
│   ├── base.py                      # LLMProvider 抽象 + _run_with_retry 重试引擎
│   ├── factory.py                   # make_provider / FallbackProvider
│   ├── registry.py                  # ProviderSpec 单源真理
│   └── anthropic_provider.py / openai_provider.py / ...
├── channels/
│   ├── base.py                      # BaseChannel + StreamingProtocol
│   ├── manager.py                   # ChannelManager + _dispatch_outbound
│   ├── registry.py                  # 渠道发现（pkgutil + entry_points）
│   └── telegram.py / discord.py / feishu.py / ...  # 16+ 平台
├── session/
│   ├── manager.py                   # Session / SessionManager
│   └── goal_state.py                # 跨 turn 持续目标
├── config/schema.py                 # Pydantic v2 Config（camelCase + env 插值）
└── command/ / cron/ / pairing/ / security/ / api/ ...
```

**依赖**：纯 Python 3.11+ asyncio、Typer、loguru、Pydantic v2、aiohttp、anthropic/openai SDK 直连、tiktoken。

---

## 三、Agent 核心：7 层架构

`agent/` 目录按职责切为 7 层：

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
  skills.py ─── SkillsLoader

Layer 7: Tool System (tools/)
  base.py / registry.py / loader.py / context.py / runtime_state.py / file_state.py / schema.py + 16 个具体工具
```

**调用链**：`AgentLoop.run()` → `AgentRunner` → `provider.chat_with_retry()` → 工具执行 → 结果写回 `MessageBus` → `AgentLoop._dispatch` 出站。

---

## 四、一次消息的端到端旅程

```
Channel       publish_inbound     MessageBus.inbound     consume_inbound
(Telegram)  ──────────────────► (asyncio.Queue)  ──────────────────►  AgentLoop.run()
                                                                           │
                                                                   _dispatch(msg)
                                                                   │ per-session Lock
                                                                   │ concurrency Semaphore
                                                                   ▼
                                                              _process_message(msg)
                                                              │ TurnContext 状态机
                                                              │ RESTORE→COMPACT→COMMAND→BUILD
                                                              │ →RUN→SAVE→RESPOND→DONE
                                                                   │
                                                                   ▼ _state_run
┌──────────────────────────────────────────────────────────────────────────────┐
│ AgentRunner.run(spec)                                                        │
│   _run_core: for iteration in max_iterations:                               │
│     1. 上下文治理: drop_orphan / backfill / microcompact / snip / budget    │
│     2. _request_model → Provider.chat_with_retry / chat_stream_with_retry   │
│     3. if tool_calls: build_assistant_message → _execute_tools → continue   │
│     4. 空响应重试 / length 续推 / 最终化                                     │
│     5. injection_callback drain（中途注入、goal 续推）                       │
└──────────────────────────────────────────────────────────────────────────────┘
                                                                   │
                                                                   ▼
                                          publish_outbound        MessageBus.outbound
                                         ────────────────────►  (asyncio.Queue)
                                                                       │ consume_outbound
                                                              ChannelManager._dispatch_outbound
                                                              │ 流合并 + 去重 + 路由 + 重试
                                                                       ▼
                                                              Channel.send → Telegram API
```

**三个解耦点**：MessageBus、Provider 抽象、Tool 抽象。

---

## 五、AgentLoop — Turn 状态机 + per-session 调度

[`agent/loop.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/loop.py)（~1830 行）

### 5.1 TurnContext 数据结构

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

### 5.2 Turn 状态机 8 个 Handler

| 状态 | Handler | 核心逻辑 |
|---|---|---|
| `RESTORE` | `_state_restore` | ① `_restore_pending_user_turn`：崩溃补 synthetic assistant；② `_restore_runtime_checkpoint`：物化 tool_calls/results；③ `extract_documents`：PDF/Office → Markdown |
| `COMPACT` | `_state_compact` | ① `auto_compact.prepare_session()`：TTL expired session → 重载 + 获取摘要；② `Consolidator.maybe_consolidate_by_tokens()` |
| `COMMAND` | `_state_command` | ① `/command` 匹配；② 成功 → `shortcut`（跳 BUILD/RUN/SAVE）；③ 失败 → `dispatch` |
| `BUILD` | `_state_build` | ① `ContextBuilder.build_system_prompt()`；② `ContextBuilder.build_messages()`；③ 检查最后一条是否为 user |
| `RUN` | `_state_run` | ① `AgentRunner.run(spec)`；② `AgentProgressHook` 流式推送；③ 处理 `/goal` 命令回执 |
| `SAVE` | `_state_save` | ① `_save_turn`：写 session history（剥 image blocks、清 timestamp、追加 latency_ms）；② `_auto_dream` |
| `RESPOND` | `_state_respond` | ① `_build_outbound`；② `_should_suppress`：message 工具已发 → 静默；③ `_resolve_multi_recipient` |
| `DONE` | — | 结束 `_process_message`，返回 `ctx.outbound` |

状态表驱动：

```python
_TRANSITIONS = {
    (RESTORE, "ok"):        COMPACT,
    (COMPACT, "ok"):        COMMAND,
    (COMMAND, "dispatch"):  BUILD,
    (COMMAND, "shortcut"):  DONE,
    (BUILD, "ok"):          RUN,
    (RUN, "ok"):            SAVE,
    (SAVE, "ok"):           RESPOND,
    (RESPOND, "ok"):        DONE,
}
```

### 5.3 `AgentLoop.run()` 主循环

```python
async def run(self):
    await self._connect_mcp()
    while self._running:
        msg = await asyncio.wait_for(self.bus.consume_inbound(), timeout=1.0)
        # 1. runtime_control（mcp reconnect）
        # 2. 优先级命令 /stop /restart → inline dispatch
        # 3. 已有 pending queue → 消息注入
        # 4. 创建新 asyncio.Task
```

- **timeout=1s**：间隙执行 `auto_compact.check_expired`
- **per-session 串行**：`asyncio.Lock` + `asyncio.Semaphore`（默认并发=3）
- **中途注入**：新消息入 `_pending_queues[key]`（maxsize=20），不创建新 task

### 5.4 `_dispatch` 三层容错

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
            for item in drain(pending):           # 残留消息重新入 inbound
                await self.bus.publish_inbound(item)
```

### 5.5 Checkpoint 机制

**写入时机**（AgentRunner 内部回调）：
- `"awaiting_tools"` — assistant_message + 待执行的 tool_calls
- `"tools_completed"` — assistant_message + 已完成的 tool_results
- `"final_response"` — assistant_message

**恢复**（`loop.py:1667-1719`）：
1. 还原 assistant_message
2. 还原 completed_tool_results
3. 对 pending_tool_calls 插入 synthetic tool error
4. 去重：与 session.messages 末尾做重叠检测（对比 `role + content + tool_call_id + name + tool_calls + reasoning`）
5. 只追加不重叠的部分

### 5.6 `_save_turn` 持久化

- 跳过没有 content 和 tool_calls 的空 assistant message
- tool result 截断到 `max_tool_result_chars`
- `[Runtime Context]` 块被剥离
- image_url (base64) 替换为文本占位符
- 每条消息添加 `timestamp`
- 最后一条 assistant 消息追加 `latency_ms`

---

## 六、AgentRunner — 协议无关的 LLM 循环

[`agent/runner.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/runner.py)（~1650 行）—— **不依赖任何 nanobot 产品层代码**的纯工具调用 LLM 循环库。

### 6.1 数据结构

```python
@dataclass(slots=True)
class AgentRunSpec:
    initial_messages: list          # 初始消息（含 system prompt + history）
    tools: ToolRegistry
    model: str
    max_iterations: int = 100
    concurrent_tools: bool = False
    max_tool_result_chars: int = 20000
    hook: AgentHook                 # 生命周期回调
    injection_callback: Callable    # 中途消息注入
    checkpoint_callback: Callable   # 运行时持久化
    goal_active_predicate: Callable
    goal_continue_message: str | None
    context_window_tokens: int
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

### 6.2 `_run_core` 完整流程

```
for iteration in range(max_iterations):
    ┌─────────────────────────────────────────────────────┐
    │ 阶段 1: 上下文治理                                  │
    │  _drop_orphan_tool_results → _backfill_missing      │
    │  → _microcompact → _apply_tool_result_budget        │
    │  → _snip_history → _drop_orphan → _backfill         │
    ├─────────────────────────────────────────────────────┤
    │ 阶段 2: _request_model                              │
    │  wants_streaming? → chat_stream_with_retry           │
    │  wants_progress?  → chat_stream_with_retry(progress) │
    │  else             → chat_with_retry                  │
    ├─────────────────────────────────────────────────────┤
    │ 阶段 3a: should_execute_tools → tool execution      │
    │  emit_checkpoint("awaiting_tools")                   │
    │  _partition_tool_batches → asyncio.gather / serial  │
    │  emit_checkpoint("tools_completed") → continue       │
    ├─────────────────────────────────────────────────────┤
    │ 阶段 3b: 文本收尾                                    │
    │  空响应 → 重试(上限2次) → 最终化重试                 │
    │  length → append assistant + "Please continue"      │
    │  正常 → break                                       │
    ├─────────────────────────────────────────────────────┤
    │ 阶段 4: drain injections (4 个时机)                  │
    │  工具错误后 / 工具完成 / LLM 响应后 / max_iterations │
    │  上限: 每轮3条 / 共5轮有注入                         │
    └─────────────────────────────────────────────────────┘
```

**关键设计**：`messages` 是持久化历史（append-only），`messages_for_model` 是给 LLM 的修补版——所有 snip/microcompact/role-alternation 只改后者。

### 6.3 上下文治理 Pipeline

- **`_microcompact`**：保留最近 10 个 `_COMPACTABLE_TOOLS`（read_file/exec/grep/web_search/web_fetch/list_dir）完整结果，更早的替换为 `[tool_name result omitted from context]`。只在内容 ≥ 500 字符时替换。
- **`_snip_history`**：`budget = context_window_tokens - max_output - 1024`，从尾部向前保留。若裁剪后不以 `user` 起始 → 回溯或插 synthetic user（防 GLM/Zhipu 拒收 `system→assistant`）。
- **`_drop_orphan_tool_results`**：遍历 assistant tool_call id 集合，清不匹配的 tool 消息。
- **`_backfill_missing_tool_results`**：逆向操作——对缺 tool result 的 tool_call 插入 synthetic error。

### 6.4 `_request_model` 三种路径

```python
if wants_streaming:           # AgentHook.wants_streaming() → 全流式
    coro = provider.chat_stream_with_retry(on_content_delta=_stream)
elif wants_progress_streaming:  # progress_callback → 进度增量（去 think 块）
    coro = provider.chat_stream_with_retry(on_content_delta=_stream_progress)
else:                         # 非流式
    coro = provider.chat_with_retry(**kwargs)
outer_timeout_s = None if streaming else timeout_s
```

`_stream_progress` 用 `IncrementalThinkExtractor` 剥离 ` response...` 块；`live_file_edits` 用 `StreamingFileEditTracker` 跟踪流式 tool_call_delta。

### 6.5 工具执行安全纵深

| 防护层 | 触发条件 | 行为 |
|---|---|---|
| SSRF 检测 | 匹配 `_SSRF_MARKERS` | 不重试，返回安全说明 soft payload |
| 工作区越界（soft） | 匹配 `_WORKSPACE_VIOLATION_MARKERS` | soft block + hint |
| 工作区越界（escalation） | 相同 `(tool, target_hash)` 重复 | 更强拒绝说明 |
| 重复外访限流 | 同一 (tool, params_hash) ≥3 次 | 拒绝 + 提示寻求用户指导 |
| `fail_on_tool_error` | flag 开启 + 非 transient | fatal_error 退出 run |

`should_execute_tools` 安全门：`finish_reason in ("tool_calls", "function_call", "stop")` 才执行工具。

### 6.6 `_run_tool` 单工具执行

```
1. 重复外访限流 (_MAX_DUPLICATE_EXTERNAL_LOOKUP=3)
2. ToolRegistry.prepare_call → 名称解析 + 类型强转 + JSON Schema 校验
3. 文件编辑事件 start
4. tool.execute(**params)
5. 结果分类：SSRF/workplace_violation/fatal_error 分类
6. normalize_tool_result → maybe_persist + truncate
```

### 6.7 注入与 Goal 续推

`_try_drain_injections` 在 4 个时机触发：工具错误后、工具执行完成、LLM 正常响应后（含 goal_continue）、max_iterations 后。上限：`_MAX_INJECTIONS_PER_TURN=3`、`_MAX_INJECTION_CYCLES=5`。连续 user 消息自动合并以保持 role alternation。

---

## 七、ContextBuilder — system prompt + message 组装

[`agent/context.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/context.py)（~300 行）

### 7.1 `build_system_prompt` 组装顺序

```python
parts = [
    identity       # identity.md 模板渲染（workspace, runtime, channel）
    bootstrap      # AGENTS.md / SOUL.md / USER.md
    tool_contract  # tool_contract.md 工具使用协议
    Memory         # MEMORY.md 长时记忆（仅 non-template 时注入）
    Active Skills  # always skill 原文
    Skills Summary # 可用技能列表
    Recent History # history.jsonl 最近 50 条
    Archived Context Summary  # session_summary（AutoCompact 产物）
]
return "\n\n---\n\n".join(parts)
```

### 7.2 `build_messages` 组装

```python
# 1. runtime_ctx = _build_runtime_context(channel, chat_id, time)
#    [Runtime Context]\nCurrent Time: ...\nChannel: ...\n...
# 2. user_content = _build_user_content(text, media)
#    media → [image_url_block_base64, ..., text_block]
# 3. merged = user_content + "\n\n" + runtime_ctx
#    Runtime 在尾部（每 turn 变化），user 前缀稳定 → prompt cache 友好
# 4. messages = [system, *history, {"role":user/assistant, "content":merged}]
# 5. 若最后一条 role == current_role → merge（防 consecutive same-role）
```

**媒体处理**：PDF/Office → Markdown（PyMuPDF/libreoffice），图片 → base64 data URI，保存时剥离为 `"[image: path/to/file]"`。

---

## 八、MemoryStore + Consolidator + Dream

[`agent/memory.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/memory.py)（~1100 行）

### 8.1 MemoryStore：纯文件 I/O

```
workspace/
├── MEMORY.md          # LLM 可编辑的长时记忆
├── SOUL.md            # Agent 身份（不可变）
├── USER.md            # 用户偏好
└── memory/
    ├── history.jsonl  # append-only 事件日志（带 cursor 自增）
    ├── .cursor        # 自增 cursor
    └── .dream_cursor  # Dream 已处理到的 cursor
```

- **原子写**：`tmp → flush → os.fsync → os.replace → os.fsync(dir_fd)`
- **线程安全**：`threading.Lock` 保护 cursor + append
- **GitStore**：基于 pygit2（可选），跟踪 `SOUL.md/USER.md/MEMORY.md/.dream_cursor`
- **`enforce_file_cap`**：`FILE_MAX_MESSAGES=2000` 时打包归档

### 8.2 Consolidator：token-budget 驱动压缩

```
maybe_consolidate_by_tokens(session):
  1. budget = context_window - max_completion - 1024
  2. target = budget * consolidation_ratio
  3. 循环最多 5 轮：
     a. pick_consolidation_boundary → user-turn 边界切割
     b. archive(chunk) → LLM 摘要 → append_history(max_chars=8000)
     c. LLM 失败 → raw_archive 兜底（直接 dump 格式化文本）
     d. 重新 estimate → < target 或 无边界 → break
  4. persist_last_summary → session.metadata["_last_summary"]
```

### 8.3 Dream：双阶段记忆演化

- 每 2 小时触发
- `build_dream_prompt`：取 20 条未处理 history.jsonl → 渲染 `dream.md` 模板
- `build_dream_tools`：只 read/edit/write/apply_patch，只能编辑 `SOUL.md/USER.md/MEMORY.md/skills/`
- `dream_session_key`：`dream:20260611-143000` 格式
- 完成后：更新 `.dream_cursor` → `auto_commit` → `prune_dream_sessions(keep=10)`

---

## 九、AutoCompact — TTL 空闲会话归档

[`agent/autocompact.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/autocompact.py)（96 行）

```python
class AutoCompact:
    def check_expired(self, schedule_background, active_session_keys):
        """每 tick（AgentLoop 的 1s timeout 间隙）调用"""
        # 跳过内部 session（dream:）、archiving 中、active 状态的

    async def _archive(self, key):
        summary = await self.consolidator.compact_idle_session(key, last_8_msgs)
        # 失败 → 静默吞异常

    def prepare_session(self, session, key):
        # Hot path: _summaries[mem] dict → 进程未重启
        # Cold path: session.metadata["_last_summary"] → 进程重启后
        return session, formatted_summary_or_None
```

**两速查找**：内存 dict 优先（同一进程周期），fallback session metadata（跨重启）。

---

## 十、Hook 系统

### 10.1 AgentHook 生命周期

[`agent/hook.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/hook.py)（~170 行）

```python
class AgentHook:
    # Run 级别
    async before_run / after_run / on_error / on_finally

    # Iteration 级别
    def wants_streaming() → bool
    async before_iteration / on_stream / on_stream_end / emit_reasoning / emit_reasoning_end
    async before_execute_tools / after_iteration

    # Content
    def finalize_content(context, content) → str | None
```

### 10.2 CompositeHook

- 异步方法用 `_for_each_hook_safe` 包装：单个 hook 异常不崩主循环
- `finalize_content` 是管道（无异常隔离）
- `wants_streaming()` 是 OR 逻辑

### 10.3 AgentProgressHook

[`agent/progress_hook.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/progress_hook.py)（~130 行）

把 AgentRunner hook 翻译为对外回调链：`on_progress`（路由到 channel/cli）、`on_iteration`、`set_tool_context/clear_tool_context`（tool hint）、`_device_timeout`（WebSocket 保活）。

### 10.4 流式协议（路标系统）

`OutboundMessage.metadata` 携带 9 种路标：

| 路标 | 语义 | Channel 行为 |
|---|---|---|
| `_stream_delta` + `_stream_id` | 流式文本 chunk | 渐进渲染 |
| `_stream_end` + `_resuming` | 流段结束 | 暂停/完成卡片 |
| `_reasoning_delta` / `_reasoning_end` | 思考块 | 仅 show_reasoning=True 渠道 |
| `_progress` | 进度文本 | 仅 _should_send_progress |
| `_tool_hint` | 工具提示 | 状态栏/副标题 |
| `_file_edit_events` | 文件编辑 | WebUI 实时 diff |
| `_retry_wait` | 重试倒计时 | 用户可见等待 |
| `_streamed` | 已流式完成 | 防重复渲染 |

### 10.5 RuntimeEventBus：双总线设计

- **MessageBus**：用户消息（inbound/outbound）
- **RuntimeEventBus**：运行时生命周期事件（`session_turn_started`/`turn_completed`/`run_status_changed`/`runtime_model_changed`）

分离让 WebUI/CLI 订阅 runtime events 而不被用户消息流污染。

---

## 十一、SubagentManager

[`agent/subagent.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/subagent.py)（~360 行）

### 11.1 完整生命周期

```
spawn(task, label)
  → task_id = uuid[:8]
  → SubagentStatus(task_id, label, phase="initializing")
  → asyncio.create_task(_run_subagent(task_id, ...))

_run_subagent:
  → _build_tools(scope="subagent")  # 独立 ToolRegistry，不含 message/spawn/cron
  → _build_subagent_prompt()        # subagent_system.md 模板
  → runner.run(AgentRunSpec(
        tools=subagent_tools,
        hook=_SubagentHook(task_id, status),
        fail_on_tool_error=True,
        finalize_on_max_iterations=False,
    ))
  → _announce_result → bus.publish_inbound(
        channel="system", sender_id="subagent",
        session_key_override=origin_session_key,
    )
```

### 11.2 设计要点

- **结果回投**：通过 `session_key_override` 对齐主 Agent → 注入到 pending queue（mid-turn injection）
- **递归复用 AgentRunner**：子 Agent 不另起炉灶
- **可观察性**：`SubagentStatus`（phase/iteration/usage/tool_events/error/stop_reason），`SubagentManager.status(task_id)` 供外部 poll

---

## 十二、Model Presets

[`agent/model_presets.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/model_presets.py)（64 行）

```python
class ProviderSnapshot:
    provider: LLMProvider
    model: str
    context_window_tokens: int
    signature: tuple  # 用于检测预设变化（模型热切换）
```

`ProviderSnapshot.signature` 比对让 AgentLoop 检测到预设切换时自动重建 provider。

---

## 十三、Tool System 完整剖析

### 13.1 Tool 基类

[`agent/tools/base.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/base.py)（280 行）

```python
class Tool(ABC):
    name: str                    # @property, abstract
    description: str             # @property, abstract
    parameters: dict             # @property, abstract（JSON Schema）
    read_only: bool = False      # 影响 concurrency_safe
    exclusive: bool = False      # 不允许并发
    concurrency_safe: bool       # computed: read_only and not exclusive

    config_key: str = ""
    _plugin_discoverable: bool = True
    _scopes: set[str] = {"core"}

    @classmethod
    def enabled(cls, ctx: ToolContext) → bool: ...
    @classmethod
    def create(cls, ctx: ToolContext) → Tool: ...

    def cast_params(self, params) → dict: ...       # 类型强转
    def validate_params(self, params) → list[str]:   # JSON Schema 校验
    @abstractmethod
    async def execute(self, **kwargs) → Any: ...
    def to_schema(self) → dict: ...                  # OpenAI function schema
```

### 13.2 `@tool_parameters` 装饰器

把 `parameters` 从 abstract property 变为自动 `deepcopy(frozen)` 的 concrete property，并从 `__abstractmethods__` 中移除。

### 13.3 Schema 验证系统

```python
class Schema(ABC):
    def to_json_schema(self) → dict: ...
    @staticmethod
    def validate_json_schema_value(val, schema, path="") → list[str]:
        """递归校验：type/nullable/enum/minimum/maximum/
           minLength/maxLength/minItems/maxItems/required/properties"""
```

**`_cast_value` 智能强转**：`"true"/"1"/"yes"` → True，`"42"` → 42（integer），`"3.14"` → 3.14（number），已匹配类型直接返回。

### 13.4 ToolRegistry

[`agent/tools/registry.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/registry.py)（180 行）

```python
class ToolRegistry:
    register / unregister / get / has

    get_definitions() → list[dict]:
        # stable sort: builtins 按名 → MCP 按名（prompt-cache 友好）

    prepare_call(name, params) → (Tool, params, error):
        # 1. 查表 + _suggest_name（规范化匹配）
        # 2. _coerce_argument_value: JSON str → dict/list
        # 3. _unwrap_arguments_payload: {"arguments":{...}} 解开
        # 4. cast_params + validate_params

    execute(name, params) → Any:
        tool, params, error = prepare_call(...)
        if error: return error + hint
        result = await tool.execute(**params)
        return result if OK else result + hint
```

### 13.5 ToolLoader：双渠道发现

[`agent/tools/loader.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/loader.py)（116 行）

- **内置**：`pkgutil.iter_modules` → 跳过 `_SKIP_MODULES` → 按 `issubclass(Tool)` + `_plugin_discoverable` + 无 `__abstractmethods__` 过滤
- **插件**：`entry_points(group="nanobot.tools")`
- **优先级**：内置名优先（插件不能 shadow 内置名）
- **scope 过滤**：`tool_cls._scopes` 决定在 core/ephemeral/subagent 等上下文中是否注册

### 13.6 两层注入设计

[`agent/tools/context.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/context.py)（60 行）

```python
@dataclass(frozen=True)
class RequestContext:          # per-request 上下文（ContextVar 绑定）
    channel / chat_id / message_id / session_key

@dataclass
class ToolContext:             # 工厂级上下文（实例创建时注入）
    config / workspace / bus / subagent_manager / cron_service
    sessions / file_state_store / provider_snapshot_loader / ...

@runtime_checkable
class ContextAware(Protocol):  # 运行时注入协议
    def set_context(self, ctx: RequestContext) → None: ...
```

### 13.7 FileStates：读前检查与去重

[`agent/tools/file_state.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/file_state.py)（205 行）

```
FileStates (per-session)
  record_read(path, offset, limit) → 记录 mtime + SHA256 hash
  record_write(path) → 更新 mtime, can_dedup=False
  check_read(path) → 未读/修改后/quick-write 检测
  is_unchanged(path) → read_file 工具去重（"File unchanged since last read"）

FileStateStore (global)
  for_session(key) → FileStates  # per-session 隔离
```

**设计要点**：mtime 变化但 content hash 相同（如 touch/editor save）→ 更新 mtime 通过，不触发误报。

### 13.8 MyTool：运行时代理检查/修改

[`agent/tools/self.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/self.py)（484 行）

```python
class MyTool(Tool, ContextAware):
    name = "my"
    _plugin_discoverable = False  # 手动注册（需 AgentLoop 引用）

    BLOCKED = {"bus","provider","_running","tools","_mcp_servers",...}  # 禁 inspect + modify
    READ_ONLY = {"subagents","exec_config","web_config","workspace_sandbox"}
    RESTRICTED = {"max_iterations":{min:1,max:100},
                  "context_window_tokens":{min:4096,max:1000000},
                  "model":{min_len:1}}
    _DENIED_ATTRS = {"__class__","__dict__","__subclasses__",...}      # magic/dunder
    _SENSITIVE_NAMES = {"api_key","secret","password","token",...}     # 敏感字段名
```

**action 分发**：`check`（全量/点路径，dot-path 友好格式化）、`set`（RESTRICTED 范围校验 / 自由键类型匹配）、scratchpad 上限 64 键。

### 13.9 MessageTool

[`agent/tools/message.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/tools/message.py)（272 行）

- `ContextAware`：注入 channel/chat_id/message_id
- `_sent_in_turn`：检测本 turn 已主动发过消息 → 抑制最终响应
- `_resolve_media`：workspace 受限环境下的路径校验
- `_suppress_delivery`：heartbeat 内部检查模式
- inline buttons 支持

---

## 十四、工具全景图

### 文件系统

| 工具 | 关键能力 |
|---|---|
| `read_file` / `write_file` / `edit_file` / `list_dir` | 工作区文件系统 + FileStates 去重 |
| `apply_patch` | unified diff 多文件编辑 |
| `grep` / `find` | 搜索 |
| `exec` (`shell`) | shell 执行 + PTH sandbox + allow/deny |
| `cli_apps` | CLI 子应用（JSON line 协议） |

### Web 工具

| 工具 | 关键能力 |
|---|---|
| `web_search` | 多 provider 搜索（Kagi/Tavily/SearxNG/...） |
| `web_fetch` | URL fetch + Markdown 转换 + SSRF 检测 |

### Agent 内省

| 工具 | 关键能力 |
|---|---|
| `my` (`self`) | 运行时配置查改，BLOCKED/READ_ONLY/RESTRICTED 三层保护 |
| `message` | 主动发消息 + media 附件 + inline buttons |

### 子任务

| 工具 | 关键能力 |
|---|---|
| `spawn` | 启动后台 Subagent |
| `long_task` / `complete_goal` | session 持续目标 + runtime event |
| `image_generation` | 多 provider 图像生成 |

### 其他

| 工具 | 关键能力 |
|---|---|
| `mcp` | MCP 客户端 |
| `cron` | 定时任务 CRUD |

---

## 十五、Skills 系统

[`agent/skills.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/agent/skills.py)

```python
class SkillsLoader:
    # workspace/skills/<name>/SKILL.md  ← 用户自定义（同名覆盖内置）
    # nanobot/skills/<name>/SKILL.md   ← 内置

    def list_skills(filter_unavailable=True): ...
    def load_skill(name) → str | None: ...  # 剥离 YAML frontmatter
    def sync_skills() → int: ...            # 从 builtin 复制到 workspace
```

Skill 文件格式：YAML frontmatter（`always: true` 时全文注入 system prompt）+ Markdown body。

---

## 十六、Provider 抽象与重试系统

### 16.1 `LLMProvider` 顶层接口

```python
class LLMProvider(ABC):
    generation: GenerationSettings

    @abstractmethod
    async def chat(messages, tools, model, ...) → LLMResponse: ...
    async def chat_stream(messages, ..., on_content_delta, ...) → LLMResponse: ...

    async def chat_with_retry(messages, ..., retry_mode) → LLMResponse
    async def chat_stream_with_retry(messages, ..., on_stream_recover) → LLMResponse
```

### 16.2 `_run_with_retry` 重试引擎

[`providers/base.py:817-930`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/providers/base.py#L817-L930)：

```
while True:
    response = call(...)
    if response.finish_reason != "error": return response

    # 流式已发内容 → should_retry_guard 断点 → 新建流段重试
    # 非 transient → 图片降级重试一次 → 返回
    # persistent 模式：同错 ≥10 次 → 停止
    # standard 模式：attempt > len(delays) → 放弃
    delay = extract_retry_after(response) or (1, 2, 4)
    if persistent: delay = min(delay, 60)
    await _sleep_with_heartbeat(delay, attempt, persistent)
```

### 16.3 Transient Error 判定（三层）

1. **结构化**：`response.error_should_retry`（最高优先）
2. **HTTP 状态码**：`429` → `_is_retryable_429_response` 二分；`>=500` → transient
3. **文本模糊匹配**：`_TRANSIENT_ERROR_MARKERS`（含中文"速率限制""访问量过大"）

**429 二分**：`insufficient_quota` 类不重试，`rate_limit_exceeded` 类重试。**arrearage 检测**：HTTP 402 或无额度类 429 → 返回充值提示。

### 16.4 ProviderSpec 单源真理

[`providers/registry.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/providers/registry.py) 把模型元数据集中管理。添加新 Provider 只需在 `PROVIDERS` 列表加一条 + 在 `ProvidersConfig` 加同名字段。

### 16.5 FallbackProvider

主 Provider 抛可重试错误时按 fallback_models 列表顺序切换。

---

## 十七、ChannelManager 出站路由

[`channels/manager.py:_dispatch_outbound`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/channels/manager.py#L282-L363) 按序执行 7 步：

1. **reasoning 过滤**：仅 `show_reasoning=True` 的渠道
2. **progress 节流**：`_should_send_progress(channel, tool_hint=...)`
3. **流合并**（`_coalesce_stream_deltas`）：同一 `(channel, chat_id)` 连续 delta 合并
4. **去重**（`_should_suppress_outbound`）：`(channel, chat_id, origin_message_id)` 哈希指纹
5. **路由**：`msg.channel` → `channel.send/send_delta/...`
6. **重试**：指数退避 `(1, 2, 4)`
7. **未知渠道**：warn 但不抛

渠道发现（`channels/registry.py`）使用同 ToolLoader 的 `pkgutil + entry_points` 双渠道模式。

---

## 十八、配置系统

[`config/schema.py`](file:///Volumes/SN740/code/notebook/third/nanobot/nanobot/config/schema.py)

- `Base.model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)` — **camelCase + snake_case 双写**
- **Pydantic v2**：所有 model 继承 `Base`
- **env 插值**：`resolve_config_env_vars(load_config(path))` 在 loader 层做 `${VAR}` 替换
- **`ChannelsConfig.extra="allow"`**：任意渠道配置直接挂这里

---

## 十九、模块间依赖关系图

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

## 二十、关键设计决策速查

| 决策 | 体现模块 | 细微之处 |
|---|---|---|
| **状态表驱动** | loop.py | `_TRANSITIONS` 表 + `TurnState` Enum，新状态只需加 handler 和一条边 |
| **messages vs messages_for_model** | runner.py | snip/microcompact 只改 LLM 副本，持久化历史 untouched |
| **should_execute_tools 安全门** | runner.py + providers/base.py | `finish_reason in {tool_calls, function_call, stop}` 才执行 |
| **per-session 串行 / 跨 session 并发** | loop.py | `asyncio.Lock` + `asyncio.Semaphore`，pending queue 注入 |
| **Checkpoint + Pending Drain** | loop.py | `/stop` 不丢上下文；残留消息不吞 |
| **两速查找** | autocompact.py | 内存 dict (hot) → session metadata (cold)，跨重启不丢 |
| **工厂注入 + 运行时注入** | tools/context.py | `ToolContext`（创建时） + `RequestContext`（执行前） |
| **内置名优先** | tools/loader.py | 插件不能 shadow 内置 tool name |
| **stable sort definitions** | tools/registry.py | 内置按名 → MCP 按名，前缀稳定 → prompt cache 友好 |
| **三层保护** | tools/self.py | BLOCKED / READ_ONLY / RESTRICTED + magic method + 敏感字段黑名单 |
| **content_hash 去重读** | tools/file_state.py | mtime + SHA256 双重校验，touch 不误报 |
| **Consolidator raw_archive 兜底** | memory.py | LLM 压缩失败 → 直接 dump 格式化文本 |
| **递归复用 AgentRunner** | subagent.py | 子 Agent 用同一个 Runner 独立跑 |
| **空 content 是 null 非 ""** | runner.py | 无文本 + 有 tool_calls 的 assistant 对某些 provider 合法 |
| **图片降级** | providers/base.py | 非 transient 错误时自动去掉 base64 images 重试一次 |
| **双总线** | bus/ | MessageBus（用户消息） + RuntimeEventBus（生命周期事件） |
| **ProviderSpec 单源真理** | providers/registry.py | 添加 provider = 加一条记录 + 一个配置字段 |
| **设计注释** | 全模块 | 大量 Why/Note/Historical 注释解释设计决策和边界条件 |

---

## 二十一、完整调用栈速查

| 我想理解… | 看这里 |
|---|---|
| AgentLoop 主循环 | `loop.py:run`（851-926 行） |
| Turn 状态机驱动 | `loop.py:_process_message`（1196-1292 行） |
| 8 个状态 handler | `loop.py:_state_restore` ~ `_state_respond` |
| checkpoint 写入/恢复 | `loop.py:_set_runtime_checkpoint` / `_restore_runtime_checkpoint`（1667-1719） |
| turn 保存 | `loop.py:_save_turn`（1569-1614 行） |
| AgentRunner 主循环 | `runner.py:_run_core`（323-668 行） |
| 上下文治理 pipeline | `runner.py:_drop_orphan / _backfill / _microcompact / _snip / _tool_result_budget` |
| LLM 调用 | `runner.py:_request_model`（692-832 行）—— 3 路径分支 |
| 工具执行 | `runner.py:_execute_tools` + `_run_tool`（1028-1177 行） |
| 并发工具分区 | `runner.py:_partition_tool_batches`（1520-1543 行） |
| 注入合并 | `runner.py:_try_drain_injections`（175-228 行） |
| contextBuilder | `context.py:build_system_prompt` / `build_messages` |
| MemoryStore 原子写 | `memory.py:write_file` / `append_history` |
| Consolidator 主循环 | `memory.py:maybe_consolidate_by_tokens` |
| Dream | `memory.py:trigger` → `_run_dream` |
| AutoCompact TTL | `autocompact.py:check_expired` + `prepare_session` |
| Subagent spawn | `subagent.py:spawn` → `_run_subagent` → `_announce_result` |
| Hook 组合 | `hook.py:CompositeHook._for_each_hook_safe` |
| Progress hook 流式 | `progress_hook.py:_stream_delta / _stream_end` |
| Tool 基类 + 装饰器 | `tools/base.py:Tool` / `tool_parameters` |
| Schema 递归校验 | `tools/base.py:Schema.validate_json_schema_value` |
| 类型强转 | `tools/base.py:Tool._cast_value` |
| ToolRegistry 准备/执行 | `tools/registry.py:prepare_call` / `execute` |
| ToolLoader | `tools/loader.py:discover` + `_discover_plugins` + `load` |
| MyTool | `tools/self.py:_inspect` / `_modify` |
| MessageTool | `tools/message.py:execute` |
| FileStates | `tools/file_state.py:is_unchanged` / `check_read` |
| 上下文绑定 | `tools/context.py:bind_request_context` + `ContextAware` |
| Model preset | `model_presets.py:build_runtime_preset_snapshot` |
| Skills | `skills.py:SkillsLoader.list_skills` + `load_skill` |
| 重试主循环 | `providers/base.py:_run_with_retry`（817-930 行） |
| 429 判定 | `providers/base.py:_is_retryable_429_response` |
| FallbackProvider | `providers/factory.py:make_provider` |
| OutboundMessage 路由 | `channels/manager.py:_dispatch_outbound` |
| Channel 流合并/去重 | `channels/manager.py:_coalesce_stream_deltas` / `_should_suppress_outbound` |
| Service 入口 | `cli/commands.py:agent/gateway/serve` → `AgentLoop.from_config` |