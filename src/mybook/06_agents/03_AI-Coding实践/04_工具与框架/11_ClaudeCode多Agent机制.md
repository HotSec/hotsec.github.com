# Claude Code 多 Agent 机制

> 来源：[面试官皱眉："你知道 Claude Code 多Agent实现机制吗？"](https://mp.weixin.qq.com/s/SJ_d8UOR-i3xcXDNozFx6g)

本文从源码视角剖析 Claude Code 的多 Agent 机制，包括 Subagent 隔离机制、父子 Agent 通信、Fork Subagent 缓存优化和 Coordinator 协调者模式。

---

## 一、Multi-Agent 基础

### 1.1 为什么一个 Agent 不够用？

单 Agent（LLM + 工具 + 循环）在真实项目里有三个麻烦：

1. **上下文会爆炸**：调研 + 实现 + 评审三阶段内容全塞一个上下文
2. **职责混乱**：既当研究员又当程序员又当评审员，容易跑偏
3. **没法并发**：一次只能做一件事

### 1.2 Multi-Agent 核心思想

**把一个大任务拆给多个职责清晰的 Agent 去做，它们之间通过某种方式通信和协作。**

就像老板带团队：老板不自己扎进代码，而是把任务拆成几块派给专家，自己只看大方向、收结果、做决策。

### 1.3 三种常见形态

| 形态 | 说明 | Claude Code 对应 |
|------|------|-----------------|
| 父子型 | 主 Agent 派 subagent 搞定子问题，拿结果回来 | 常规 Subagent |
| 平级协作型 | 几个 Agent 职责对等，通过共享状态/消息协作 | — |
| 主从型（Coordinator-Worker） | 协调者不干活，只派 worker、收结果、做合成 | Coordinator 模式 |

Fork Subagent 是父子型的一个特殊优化版本（跟 cache 有关）。

### 1.4 Subagent 在 Claude Code 里长啥样？

主 Agent 调用名为 `Agent` 的工具，把任务交给内置 subagent（如 `Explore`）去跑。Explore 带着精简工具池（只读工具）+ 独立上下文，跑完把结果打包回来。

**Subagent = 主 Agent 通过特定工具派出去的另一个独立 Agent 实例**，有自己的工具池、上下文、生命周期。

---

## 二、Subagent 的隔离机制

多 Agent 系统最关键的一环：**隔离机制**。隔离做得不好，subagent 污染父 Agent 状态或调了不该调的工具，系统就乱套。

Claude Code 在 subagent 启动时把隔离做到**两个维度**：工具隔离 + 上下文隔离。

### 2.1 工具隔离：给子 Agent 发定制工具箱

主 Agent 有几十个工具，不能原封不动丢给 subagent。Claude Code 按 agent 身份走**三道准入门**：

**第一道门：所有 subagent 通用黑名单**

| 禁止的工具类型 | 原因 |
|--------------|------|
| 能派新 subagent 的工具 | 防止子再派孙的递归嵌套 |
| 能主动问用户问题的工具 | 子 Agent 不该抢主 Agent 的对话权 |
| 能切换规划模式的工具 | 规划模式是主 Agent 专属 |
| 能停止其他任务的工具 | 任务管理是主线程专属权力 |

**第二道门：自定义 Agent 多套一层黑名单**

用户自己写的 Agent（项目里配的 Markdown agent）比内置 Agent 更严，因为没经过官方审核。

**第三道门：后台异步 Agent 走白名单**

完全后台跑的 Agent 只准用事先圈定的一小批工具。白名单哲学：**默认不准用，明确列出来的才能用**。

源码实现：

```typescript
// src/tools/AgentTool/agentToolUtils.ts:70
export function filterToolsForAgent({ tools, isBuiltIn, isAsync, permissionMode }): Tools {
  return tools.filter(tool => {
    if (tool.name.startsWith('mcp__')) return true    // MCP 工具全放行
    if (ALL_AGENT_DISALLOWED_TOOLS.has(tool.name)) return false
    if (!isBuiltIn && CUSTOM_AGENT_DISALLOWED_TOOLS.has(tool.name)) return false
    if (isAsync && !ASYNC_AGENT_ALLOWED_TOOLS.has(tool.name)) return false
  })
}
```

### 2.2 上下文隔离：按字段粒度决策

父 Agent 有庞大的运行时上下文（已读文件、文件读到第几行、UI 状态、中止信号、权限状态、任务注册表等）。传给子 Agent 时，**不按「整体」决策，而是按「字段」决策**。

**四个关键决策**：

| 决策 | 字段 | 做法 | 原因 |
|------|------|------|------|
| 决策一 | 读文件缓存 | 克隆一份给子 Agent | 共享会污染父的文件视图 |
| 决策二 | 写全局状态 | 直接关闭（空操作） | 防止两边同时改同一份状态 |
| 决策三 | 注册后台任务 | 保留通路 | 不然子 Agent 起的后台进程变孤儿 |
| 决策四 | Agent ID + 深度 | 独立 ID，深度+1 | 可追踪，防失控嵌套（超5层报警） |

源码实现：

```typescript
// src/utils/forkedAgent.ts:345
createSubagentContext(parentContext, overrides): ToolUseContext {
  // 决策一：文件读缓存克隆一份
  readFileState: cloneFileStateCache(parentContext.readFileState),
  // 决策二：写全局状态直接设为空操作
  setAppState: () => {},
  // 决策三：但任务注册的通路例外保留
  setAppStateForTasks: parentContext.setAppStateForTasks ?? parentContext.setAppState,
  // 决策四：独立 ID + 深度 +1
  agentId: overrides?.agentId ?? createAgentId(),
  queryTracking: {
    chainId: randomUUID(),
    depth: (parentContext.queryTracking?.depth ?? -1) + 1,
  },
}
```

**核心洞察：上下文隔离不是一刀切地「全隔离」或「不隔离」，而是按每个状态的语义单独决策。**

---

## 三、父子 Agent 通信

### 3.1 为什么不用函数调用？

函数调用（同步阻塞）有两个致命问题：

1. subagent 跑 5 分钟，父 Agent 啥也干不了，用户说话也没反应
2. 同时派 5 个 subagent 并行调研，要么全阻塞排队，要么手动搓并发代码

Claude Code 的路子：**消息驱动**。

### 3.2 Subagent 的「员工档案」

```typescript
// src/tasks/LocalAgentTask/LocalAgentTask.tsx:116
type LocalAgentTaskState = TaskStateBase & {
  type: 'local_agent'
  agentId: string           // 子 agent 唯一 ID
  prompt: string            // 初始任务
  agentType: string
  status: TaskStatus;       // pending/running/completed/failed/killed
  result?: AgentToolResult; // 完成后的结果
  progress?: AgentProgress; // 进度
  isBackgrounded: boolean   // 是否已转后台
  pendingMessages: [];      // 信箱：父 agent 扔进来的待处理消息
  messages?: Message[];
};
```

`pendingMessages` 数组就是「信箱」。

### 3.3 父 → 子：扔字条 + 子自己来取

**第一步**：父往信箱扔字条。调用 SendMessage 工具，往目标 subagent 的信箱追加消息，立刻返回不等。

```typescript
// src/tasks/LocalAgentTask/LocalAgentTask.tsx:162
queuePendingMessage(taskId, msg, setAppState): void {
  updateTaskState<LocalAgentTaskState>(taskId, setAppState, task => ({
    ...task,
    pendingMessages: [...task.pendingMessages, msg]
  }));
}
```

**第二步**：子在循环边界自己捡字条。subagent 的 agentic loop 每轮工具调用结束后检查信箱，有新字条就作为「用户消息」注入对话历史。

**唤醒机制**：如果子 Agent 已停止（completed/killed），SendMessage 会自动唤醒它，从磁盘 transcript 恢复完整对话历史。

```typescript
// src/tools/SendMessageTool/SendMessageTool.ts:800
if (task.status === 'running') {
  queuePendingMessage(agentId, input.message, context.setAppStateForTasks)
} else {
  // 任务已停止，自动唤醒从 transcript 里恢复
  result = await resumeAgentBackground({ agentId, prompt: input.message, ... })
}
```

### 3.4 子 → 父：把通知伪装成用户消息

Subagent 把完成通知拼成 **XML 消息**，伪装成用户消息注入父 Agent 对话：

```xml
<task-notification>
  <task-id>agent-a1b</task-id>
  <output-file>/tmp/xxx.txt</output-file>
  <status>completed</status>
  <summary>Agent "Investigate auth bug" completed</summary>
  <result>Found null pointer in src/auth/validate.ts:42...</result>
  <usage>
    <total_tokens>12345</total_tokens>
    <tool_uses>8</tool_uses>
    <duration_ms>34567</duration_ms>
  </usage>
</task-notification>
```

为什么用 XML？

1. **LLM 对 XML 非常友好**：Anthropic 训练 Claude 时强调 XML 结构化表达
2. **XML 是纯文本**：可以直接塞进对话历史
3. **复用 agentic loop 逻辑**：伪装成用户消息，父 Agent 不需要额外状态机

**这种「把系统事件伪装成对话」的设计思路，在 LLM 应用里非常值得学。**

### 3.5 自动后台化（Auto-Background）

- Subagent 30 秒内跑完 → 前台阻塞等（像普通工具调用）
- 超过 2 分钟 → 自动转后台，父 Agent 可以继续干别的

```typescript
// src/tools/AgentTool/AgentTool.tsx:72
getAutoBackgroundMs(): number {
  if (isEnvTruthy(process.env.CLAUDE_AUTO_BACKGROUND_TASKS)
    || getFeatureValue_CACHED_MAY_BE_STALE('tengu_auto_background_agents')) {
    return 120_000; // 2 分钟
  }
}
```

本质：**把同步工具调用自动降级成异步通知**。

### 3.6 通信设计全貌

| 方向 | 机制 | 特点 |
|------|------|------|
| 父→子 | SendMessage 写入信箱，子下一轮循环自己读取 | 异步、不阻塞 |
| 子→父 | XML 通知伪装成用户消息注入父对话 | 复用 agentic loop |

天然支持多 subagent 并发：父 Agent 从不阻塞等子，可以同时派 5 个，谁先完成谁先通知。

---

## 四、Fork Subagent：缓存优化隐藏大招

### 4.1 Subagent 的隐藏成本

Claude Code 的 system prompt 长度**上万 token**。每派一个 subagent，如果它有独立 system prompt，LLM API 要对这一万多 token 重新从头算一遍。

Prompt 缓存命中条件：**字节级别完全相同**。一个字节不对都不行。

### 4.2 Fork 的核心思路

派一个子 Agent，但它的 API 请求前缀跟父 Agent **字节级完全一致**，让 API 走缓存。

必须对齐的五样东西：

| 对齐项 | 说明 |
|--------|------|
| 系统 prompt 内容 | 最核心，对齐第一位 |
| 用户上下文 | 拼在消息前的动态内容（如 CLAUDE.md） |
| 系统上下文 | 拼在 system prompt 后的环境信息 |
| 工具池的顺序和定义 | 序列化进 API 请求，顺序都不能变 |
| 对话历史的前缀 | 决定从哪里开始分叉 |

```typescript
// src/utils/forkedAgent.ts:57
type CacheSafeParams = {
  systemPrompt: SystemPrompt          // 必须跟父完全一致
  userContext: { [k: string]: any }   // 拼接在消息前，影响缓存
  systemContext: { [k: string]: any } // 拼接在 system prompt 后
  toolUseContext: ToolUseContext       // 工具池、模型等上下文
  forkContextMessages: Message[]      // 父 agent 的消息前缀
}
```

### 4.3 System Prompt 不重新生成

Fork Subagent 的 `getSystemPrompt` 函数**直接返回空字符串**：

```typescript
// src/tools/AgentTool/forkSubagent.ts:60
const FORK_AGENT = {
  agentType: FORK_SUBAGENT_TYPE,
  tools: ['*'],           // 用父的完整工具池
  maxTurns: 200,
  model: 'inherit',       // 继承父的模型
  permissionMode: 'bubble',
  getSystemPrompt: () => '',  // 返回空串！
} satisfies BuiltInAgentDefinition
```

不是偷懒，而是**直接用父 Agent 已经渲染好的那份字节**。如果重新生成，可能差一个字符，缓存就没了。

### 4.4 什么时候用 Fork vs 常规 Subagent

| 场景 | 选择 | 原因 |
|------|------|------|
| 需要父 Agent 完整上下文的轻量任务 | Fork | 缓存友好，成本降到 ~10% |
| 有明确专业分工的任务 | 常规 Subagent | 定制 system prompt，Fork 不适用 |

**Fork 和 Coordinator 模式互斥**：

```typescript
// src/tools/AgentTool/forkSubagent.ts:32
isForkSubagentEnabled(): boolean {
  return feature('FORK_SUBAGENT')
    && !isCoordinatorMode()   // 互斥！
    && !getIsNonInteractiveSession()
}
```

### 4.5 工程启示

**成本优化本身就是能力的一部分**。Fork 机制在缓存友好场景下能把 subagent 成本降到 ~10%，意味着可以调得更频繁，Agent 系统能力边界扩大。

---

## 五、Coordinator 模式：真正的多 Agent 并行协作

### 5.1 启用条件

需同时满足：编译时功能开关 + 运行时环境变量 `CLAUDE_CODE_COORDINATOR_MODE=1`。

```typescript
// src/coordinator/coordinatorMode.ts:36
isCoordinatorMode(): boolean {
  return feature('COORDINATOR_MODE')
    && isEnvTruthy(process.env.CLAUDE_CODE_COORDINATOR_MODE)
}
```

### 5.2 主 Agent 退化成纯协调者

常规模式：主 Agent 是全能选手。Coordinator 模式：主 Agent 只做三件事——**派 worker、收结果、合成答案**。

System Prompt 强制约束：

> You are a **coordinator**. Your job is to:
> - Help the user achieve their goal
> - Direct workers to research, implement and verify code changes
> - Synthesize results and communicate with the user
> - Answer questions directly when possible, don't delegate work that you can handle without tools

### 5.3 三大内部工具

| 工具 | 作用 |
|------|------|
| 派 worker | 派新 worker 干活，立刻返回 worker ID |
| 创建/解散团队 | 批量管理 worker 组 |
| 给 worker 发消息 | 给已派出的 worker 发后续指令（续命比重新派更省钱） |
| 合成最终输出 | 协调者合成完答案后交给用户 |
| 停止 worker | worker 跑错方向时停掉省 token |

```typescript
// src/coordinator/coordinatorMode.ts:29
const INTERNAL_WORKER_TOOLS = new Set([
  TEAM_CREATE_TOOL_NAME,
  TEAM_DELETE_TOOL_NAME,
  SEND_MESSAGE_TOOL_NAME,
  SYNTHETIC_OUTPUT_TOOL_NAME,
])
```

### 5.4 并行才是真本事

> Parallelism is your superpower. Workers are async. Launch independent workers concurrently whenever possible.

协调者在一次 LLM 回合里一口气生成多个派 worker 的工具调用，底层并发执行。

| 模式 | 耗时 |
|------|------|
| 串行 | 派 worker1 → 等 → 派 worker2 → 等 → 派 worker3... 用户等十分钟 |
| 并行 | 同时派三个 worker → 三份结果陆续到 → 用户等三分钟多一点 |

### 5.5 任务流水线四阶段

| 阶段 | 谁来做 | 目的 |
|------|--------|------|
| 调研 | Workers（并行） | 调查代码库、找文件、理解问题 |
| 合成 | 协调者本人 | 读完发现、理解问题、写实现规格 |
| 实现 | Workers | 按规格做具体修改、提交 |
| 验证 | Workers | 测试改动是否工作 |

**协调者必须「理解」而不能「转发」**。如果只是转发，就没有存在价值。

### 5.6 Continue vs Spawn 决策

| 场景 | 决策 | 原因 |
|------|------|------|
| 新任务跟 worker 现有上下文高度相关 | 续命老 worker | 已经「知道」那些文件 |
| 新任务跟 worker 上下文没关系 | 派新 worker | 避免旧上下文干扰 |
| 需要新鲜眼光的工作（如代码审查） | 派新 worker | 不能让写代码的自己审自己 |

### 5.7 Worker 的工具限制

协调者专属的内部工具不给 worker 用。这是**递归防护**：worker 不能再派 worker，系统结构保持「协调者 + worker」的扁平形态。

### 5.8 Coordinator vs 常规 Subagent 对比

| 维度 | 常规 Subagent | Coordinator 模式 |
|------|--------------|-----------------|
| 主 Agent 角色 | 全能选手 | 纯协调者 |
| subagent 执行 | 同步（2分钟后才转后台） | 默认异步 |
| 并发程度 | 偶尔并发 | 最大化并发 |
| 适合场景 | 单个任务 + 临时帮手 | 大任务 + 高并发拆解 |
| 系统形态 | 父子树 | 协调者 + worker 扁平层 |

---

## 六、5 条 Multi-Agent 设计原则

### 原则 1：上下文隔离要按字段粒度做

每个状态单独决策：读文件缓存克隆（避免污染）、写全局状态关掉（避免两边抢）、任务注册通路保留（不然孤儿进程没人回收）、深度计数+1（可追踪，防失控嵌套）。

### 原则 2：通信走消息，不走函数调用

- 父→子：写入子 Agent 的消息队列，子 Agent 下一轮循环自己读取
- 子→父：完成通知包装成 XML 消息，伪装成用户消息注入父 Agent 对话

天然异步、天然支持并发、天然兼容 agentic loop、天然持久化。

### 原则 3：工具权限要分级管控

全局黑名单（防递归、防乱问用户）→ 类型黑名单（自定义 agent 更严）→ 异步白名单（后台 agent 只能用子集）。

### 原则 4：缓存友好是一种架构能力

API 成本和延迟对生产环境 Agent 来说是**能力的一部分**。设计 subagent 时考虑 prompt 前缀能否复用父 Agent 缓存，能省 80-90% 成本。

### 原则 5：并行优先 + 协调者合成

真正的多 Agent 系统威力在**并发**。通过异步消息和消息队列做基础，通过协调者做合成，避免「大 Agent 大循环什么都自己扛」。协调者要**亲自合成**，不能当传话筒。
