# OpenCode 源码分析

> 来源：[Agent - 实例讲解(OpenCode 实战，基于真实源码)](http://m.toutiao.com/group/7631562849743061530/)、[从源码角度聊聊 Claude Code 和 OpenCode 的效果区别](http://m.toutiao.com/group/7626358946588033555/)

基于 OpenCode（sst/opencode, branch: 2.0）的真实实现，拆解一个工业级 Coding Agent 的关键模块，并与 Claude Code 进行对比分析。

---

## 一、架构总览

OpenCode 的核心不是"一个大 Agent 类"，而是多个服务协作：

| 模块 | 职责 | 源码目录 |
|------|------|---------|
| Agent | 定义代理类型及权限基线 | `packages/opencode/src/agent` |
| ToolRegistry | 组装工具池（内置 + 插件 + 特性开关） | `packages/opencode/src/tool` |
| Skill Service | 发现并加载技能目录，注入可用技能上下文 | `packages/opencode/src/skill` |
| SessionProcessor | 处理 LLM 流式事件、工具调用生命周期 | `packages/opencode/src/session` |
| Permission | 统一权限判定（allow/deny/ask） | `packages/opencode/src/permission` |
| SessionCompaction/Summary | 上下文压缩与历史摘要 | `packages/opencode/src/session` |

---

## 二、模块一：Tools（工具系统）

### 2.1 工具注册中心

`tool/registry.ts` 的 `ToolRegistry.layer`：

1. 初始化内置工具（bash/read/glob/grep/edit/write/task/todowrite/webfetch/...）
2. 扫描项目目录下 `tool/tools` 脚本，动态加载自定义工具
3. 合并插件工具（Plugin.Service）
4. 根据 Feature Flag 控制工具是否暴露（如 lsp、plan_exit）

**关键点**：OpenCode 不是把工具"写死在 prompt"，而是通过注册中心动态组装可用工具集。

### 2.2 ReadTool（tool/read.ts）

真实实现能力（并非简单 open().read()）：

- 支持文件与目录两种读取模式
- 默认行数上限：2000（`DEFAULT_READ_LIMIT`）
- 行长度截断与输出体积控制（`MAX_LINE_LENGTH`、`MAX_BYTES`）
- 二进制文件保护与图片/PDF 特殊处理（返回附件）
- 读取前触发权限询问：`ctx.ask(permission: "read")`

### 2.3 EditTool（tool/edit.ts）

真实实现链路：

1. 参数校验：filePath/oldString/newString
2. 通过 `assertExternalDirectoryEffect` 检查外部目录越权
3. 通过 `ctx.ask(permission: "edit")` 进行权限确认
4. 使用 FileTime 锁 + 断言，避免并发写冲突
5. 写入后自动格式化（Format.Service）
6. 发布文件变更事件（FileWatcher.Event.Updated）
7. 触发 LSP 诊断并把错误回给模型

### 2.4 BashTool（tool/bash.ts）

真实 Bash 工具不是直接 `shell=True`：

1. 解析命令 AST（web-tree-sitter）
2. 抽取潜在文件/目录访问路径，先做权限扫描
3. 区分 PowerShell 与 POSIX 行为
4. 执行前调用 `ctx.ask(permission: "bash")`
5. 支持 timeout / workdir / 命令描述等参数

### 2.5 任务与待办工具

- **tool/task.ts**：把任务委托给子 agent，支持 task_id 续跑
- **tool/todo.ts（todowrite）**：维护结构化 todo 列表，支持会话内状态更新

这两个工具让 Agent 具备"跨轮计划推进"能力。

---

## 三、模块二：Skills（领域能力注入）

Skills 不是"提示词片段收藏夹"，而是可发现、可治理、可加载的能力模块。

### 3.1 Skill 服务（skill/index.ts）

- 从多个来源扫描并加载 SKILL.md（全局目录、项目目录、配置路径、远程 URL）
- 校验 frontmatter（name、description）并去重同名技能
- 维护 skills 与 dirs 状态，支持 get/all/available 查询
- 按 agent 权限过滤可见技能（deny 的 skill 不会暴露给模型）

### 3.2 Skill 工具（tool/skill.ts）

1. 动态生成工具描述，列出当前可用 skills
2. 执行前走权限询问：`permission: "skill"`
3. 按技能名加载内容，返回 `<skill_content name="...">` 块
4. 同时返回技能目录和采样文件列表

### 3.3 系统提示注入（session/system.ts）

- `SystemPrompt.skills(agent)` 获取当前 agent 可用技能
- 当 skill 权限被禁用时，不注入技能段落
- 通过 `Skill.fmt(..., { verbose: true })` 输出结构化技能信息

技能是"按权限暴露、按需加载、可审计调用"的。

---

## 四、模块三：Planning（计划模式与代理切换）

OpenCode 的"规划"不是单独一个 Planner 类，而是通过 **agent mode + permission** 落地。

### 4.1 代理定义（agent/agent.ts）

内置代理：

| 代理 | 权限策略 | 用途 |
|------|---------|------|
| build | 允许工具执行与修改 | 默认执行代理 |
| plan | 默认拒绝 edit 类操作 | 规划模式 |
| general | 子代理 | 检索与并行复杂任务 |
| explore | 子代理 | 代码探索 |

### 4.2 计划完成切换（tool/plan.ts）

`plan_exit` 工具：

1. 询问用户是否从 plan 切到 build
2. 若同意，写入一条 synthetic user message
3. 引导进入"执行计划"阶段

**Plan 模式不是"魔法提示词"，而是通过权限收紧强制模型做先分析后执行的行为。**

---

## 五、模块四：Memory（会话记忆与压缩）

### 5.1 SessionSummary（session/summary.ts）

- 通过 snapshot diff 统计本会话文件改动（additions/deletions/files）
- 生成会话摘要并写入存储
- 为后续上下文压缩和回溯提供结构化基础

### 5.2 SessionCompaction（session/compaction.ts）

当上下文接近溢出时：

1. 触发 compact 流程
2. 生成"继续工作所需摘要"而非原样保留全部历史
3. 可对旧工具输出做 prune（保留必要信息，释放 token）

### 5.3 Todo 作为执行记忆

todowrite + Session 让模型保留任务进度状态：已完成/进行中/未开始，跨多轮执行一致推进。

---

## 六、模块五：Execution（执行器）

执行主循环在 `session/processor.ts`，采用流式事件驱动。

核心事件：

| 事件 | 含义 |
|------|------|
| reasoning-start/delta/end | 推理过程 |
| tool-input-start | 工具输入开始 |
| tool-call | 工具调用 |
| tool-result | 工具结果 |
| tool-error | 工具错误 |

执行器负责：

- 创建与更新 ToolPart 状态（pending/running/completed/error）
- 调用 completeToolCall / failToolCall 回写工具结果
- 处理中断、重试、上下文压缩触发
- 防止 doom loop（重复相同工具调用）

---

## 七、模块六：Permission（权限系统）

权限系统统一在 `permission/index.ts`。

### 7.1 三态决策

每条规则输出：**allow / deny / ask**

工具在执行前统一调用 `Permission.ask(...)`，再由系统发布事件并等待用户回复。

### 7.2 可持续规则

用户可回复：

| 回复 | 含义 |
|------|------|
| once | 仅本次允许 |
| always | 后续匹配自动放行 |
| reject | 拒绝执行 |

规则可持久化到项目级（数据库中的 permission 表），在安全和效率之间实现可配置平衡。

---

## 八、模块七：ReAct 循环（真实实现）

OpenCode 的 ReAct 不是字符串，而是事件化实现：

| 阶段 | 事件 |
|------|------|
| Reasoning | reasoning-* 事件流 |
| Action | tool-call |
| Observation | tool-result/tool-error |
| Next Step | 继续、停止或触发 compaction |

对应核心文件：

- `session/llm.ts`：模型流式输出与工具调用入口
- `session/processor.ts`：事件消费与状态推进

---

## 九、主流大模型 API 接口差异

### 9.1 核心接口对比

| 维度 | Anthropic (Claude) | OpenAI (GPT) | Google (Gemini) |
|------|-------------------|--------------|-----------------|
| 工具调用格式 | tool_use / tool_result | function_calling / tool_messages | functionCall / functionResponse |
| 流式协议 | SSE (content_block_delta) | SSE (choices) | SSE (candidates) |
| 系统提示 | 独立 system 参数 | messages[0].role="system" | systemInstruction 字段 |
| 推理/思考 | thinking 块 (budget_tokens) | reasoning_effort | thinkingConfig.thinkingBudget |
| 提示词缓存 | cache_control 显式标记 | 自动（>1024 tokens） | CachedContent 对象 |

### 9.2 工具调用格式差异（最常见踩坑点）

**Anthropic**：input 直接是对象，工具结果塞回 role: "user"

**OpenAI**：arguments 是 JSON 字符串（需 JSON.parse），用专用 role: "tool" 回传结果

### 9.3 推理模式差异

| Provider | 开启方式 | 思考过程可见性 |
|----------|---------|--------------|
| Anthropic | thinking: {type:"enabled", budget_tokens} | 返回 thinking 类型 content block |
| OpenAI | reasoning_effort: "low/medium/high" | 不暴露思考过程 |
| Gemini | thinkingConfig: {thinkingBudget} | 返回 thought: true 的 parts |

**工程建议**：如果 Agent 工作流依赖"看到模型推理步骤做条件分支"，目前只有 Anthropic 可靠。

### 9.4 重试与降级策略

| 错误码 | 含义 | 最佳实践 |
|--------|------|---------|
| 429 | 速率限制 | 指数退避（500ms × 2^n）+ ±25% jitter |
| 529 | 过载（Anthropic 特有） | 连续 3 次 → 自动降级到 Sonnet |
| 413/400 | token 超限 | 捕获后自动 compact 上下文再重试 |
| 503/502 | 服务不可用 | 最多重试 10 次，总等待约 2.5 分钟 |

双重看门狗（流式连接专用）：

- **Idle 看门狗**：90 秒无事件 → 强制中断并降级到非流式模式
- **Stall 检测**：两个 chunk 间隔 > 30 秒 → 记录日志

### 9.5 Provider 适配设计

```
Provider 适配层（session/llm.ts）
├── Anthropic SDK → 标准化内部事件
├── OpenAI SDK → 同上
├── Gemini SDK → 同上（部分功能受限）
└── Bedrock → 通常复用 Anthropic 格式
        ↓
session/processor.ts（只消费内部事件，不感知 provider）
```

系统提示的多 provider 适配：针对不同 provider 选择不同 prompt 模板（PROMPT_ANTHROPIC、PROMPT_GPT、PROMPT_GEMINI）。

---

## 十、OpenCode vs Claude Code 对比

### 10.1 上下文管理：差距最大的地方

| 维度 | Claude Code | OpenCode |
|------|------------|---------|
| 压缩层数 | 三层递进（Micro Compact → Session Memory → Full Compact） | 一层（overflow.ts，22行代码） |
| 零API压缩 | 有（Micro Compact） | 无 |
| 中间层 | Session Memory Compact（保留10K-40K tokens原始消息） | 无 |
| 全量摘要 | Fork 专用 agent 生成 | LLM 生成固定五段式摘要 |
| 触发机制 | 多级 token 阈值 + 熔断器 | 简单 token 超限判断 |
| 长对话质量 | 第50轮仍看到高质量信息 | 信息损失更大 |

### 10.2 提示词管理

| 维度 | Claude Code | OpenCode |
|------|------------|---------|
| 缓存优化 | DYNAMIC_BOUNDARY 标记分割静态/动态内容 | 无静态/动态分割 |
| 全局缓存 | 静态部分跨用户共享 prompt cache | 无 |
| Fork 缓存 | 复用父进程已渲染字节缓冲区 | 无 Fork 机制 |
| CLAUDE.md | 4 层加载（managed→user→project→local） | 简单配置 |
| 模板策略 | GrowthBook A/B 测试迭代 | 6 套静态模板按模型ID分发 |

### 10.3 Agent 通信

| 维度 | Claude Code | OpenCode |
|------|------------|---------|
| Agent 类型 | 3种（SubAgent/Fork/Teammate） | 1种（Task Tool） |
| 缓存共享 | Fork 共享 prompt cache | 不共享上下文 |
| 通信方式 | 文件系统邮箱 + tmux/iTerm2/in-process | 父子 session 关系 |
| 协调模式 | Coordinator Mode（调度器+worker） | 无 |

### 10.4 工具编排

| 维度 | Claude Code | OpenCode |
|------|------------|---------|
| 并行策略 | 自动并行分区（isConcurrencySafe） | Batch Tool 模式（模型手动批处理） |
| 并行上限 | 最多 10 并发 | 最多 25 并发 |
| 并行决策 | 框架自动决策 | 完全交给模型 |
| Bash 安全 | 2600 行安全验证器 | 相对基础 |

### 10.5 OpenCode 的优势

- **75+ 模型提供商支持**：可用 DeepSeek 做规划、Claude 做编码、本地模型处理敏感代码
- **完整 TUI 界面**：Zig 渲染后端，体验优于 Claude Code 的 REPL
- **Effect-TS 依赖注入**：代码可测试性更好
- **120K+ GitHub Star**：开源社区认可
- **成本敏感/多模型切换/隐私合规**场景更合适

### 10.6 差距本质

**差距不是模型能力的差距，是工程投入的差距。**

Claude Code 用 13 个文件实现三层上下文压缩，用 DYNAMIC_BOUNDARY 优化 prompt cache，用三种 Agent 类型覆盖不同协作场景，用自动并行分区提升工具执行效率。这些工程投入不体现在功能列表里，但直接决定了用户体验。

Agent 框架是模型能力的放大器，基础设施越精细，模型能力释放得越充分。

---

## 十一、最小复刻路径

如果要"从零手搓一个 OpenCode 风格 Agent"：

1. 先做 Tool 接口 + Registry（至少 read/edit/bash）
2. 再做 Permission 三态（allow/deny/ask）
3. 做 SessionProcessor 的工具状态机（pending/running/completed/error）
4. 加 Todo 工具形成任务推进闭环
5. 加 Skill Service + SkillTool，支持领域知识按需加载
6. 最后补 Context Compaction（防 token 溢出）
