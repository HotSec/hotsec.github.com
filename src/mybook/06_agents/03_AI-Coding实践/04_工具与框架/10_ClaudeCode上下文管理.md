# Claude Code 上下文管理

> 来源：[面试官皱眉："你知道 Claude Code 的上下文窗口管理吗？"](https://mp.weixin.qq.com/s/NBR6dRr3iO7KCTEChk8QUg)

本文深入剖析 Claude Code 的上下文窗口管理机制，重点拆解第 5 层 Auto-Compact 的触发时机、取舍逻辑、摘要 Prompt 设计和接续机制。

---

## 一、上下文窗口基础

### 1.1 什么是上下文窗口

大模型每次回答问题时，把 system prompt、所有历史对话、当前问题一股脑塞进去，总长度上限就是「上下文窗口」（单位：token）。

当前主流模型窗口大小：

| 模型 | 窗口大小 | 约等于 |
|------|---------|--------|
| GPT-4 早期 | 8k token | ~1万多字 |
| Claude 3.5 Sonnet | 200k token | ~30万字 |
| Claude Opus 4.7 1M版 | 1M token | ~200万字 |

### 1.2 为什么 Agent 更费窗口

三处叠加：

1. **开局就是大头**：system prompt + 工具描述 + CLAUDE.md 约 5k-10k token
2. **工具调用双倍记账**：tool_use + tool_result 两条消息都进窗口
3. **大文件 Read 杀伤力巨大**：一个源文件几千到上万 token

### 1.3 加大窗口能解决吗？

三个硬伤：

1. **钱**：上下文越长，token 消耗按几何级数上涨
2. **慢**：Attention 计算复杂度与序列长度平方相关，TTFT（首 token 延迟）线性增长
3. **Lost in the Middle**：上下文很长时，模型对首尾信息记得清楚，对中间段记忆模糊。这是注意力机制的固有特性，与窗口大小无关

---

## 二、常见方案为什么不够看

### 2.1 方案一：滑动窗口

设阈值（如 50 轮 / 100k token），从最老消息开始砍。

**问题**：
- Agent 最关键的决策往往在最开始（全局指令被砍 = 完全失控）
- 工具调用有上下文依赖，砍掉 tool_result 后续引用变成无源之水
- 本质是「用遗忘换续航」

### 2.2 方案二：每 N 轮做摘要

每过 10 轮 / 50k token 触发摘要，用总结替换原消息。

**问题**：
- 触发时机太死板（关键节点被压缩丢细节，空闲节点白压一遍）
- 摘要粒度粗（细微状态、错误修复过程、中途改的需求全压成几句话）
- 是「机械主义」方案

### 2.3 方案三：向量召回历史

把历史消息切片存向量数据库，用问题召回 top-k 相关片段。

**问题**：
- Agent 上下文是强时序依赖（向量召回不管顺序，执行顺序会乱）
- tool_use 和 tool_result 必须成对出现，切片可能切开
- top-k 一定会漏掉关键决策点
- RAG 检索文档行，Agent 上下文不行

---

## 三、5 层压缩金字塔全景

Claude Code 的上下文管理不是一招制敌，而是一套从轻到重的 **5 层金字塔**：

| 层级 | 手段 | 信息损失 | API开销 | 触发条件 |
|------|------|---------|---------|---------|
| 第1层 | 大结果存磁盘 | 几乎无 | 零 | 单工具结果 > 50KB |
| 第2层 | Snip 砍远古消息 | 少量 | 零 | 对话开头旧消息 |
| 第3层 | Micro-Compact 时间衰减 | 少量 | 零 | 距上次API调用 > 60分钟 |
| 第4层 | Context Collapse 读时投影 | 中等 | 零 | 上下文达 90%/95% |
| 第5层 | Auto-Compact 全量摘要 | 最大 | 一次API | 上下文达 ~93% |

**设计原则：能不压就不压，必须压时从最轻手段开始**

5 层里有 3 层完全零 API 开销，只在前 4 层都压不动的极端情况下才触发最贵的全量摘要。

> 前 4 层的详细机制请参阅 [Claude Code 源码架构 - 上下文窗口管理](./09_ClaudeCode源码架构.md#六上下文窗口管理五步压缩)

---

## 四、Auto-Compact 整体思路

作为金字塔最顶层的兜底机制，核心三件事：

1. **绝对阈值触发**：不按轮数、不按百分比，按 token 数距离窗口上限的固定缓冲
2. **全量重写对话**：所有历史消息，不分新旧，全部送进摘要器重新写一份
3. **关键信息走另外的恢复通道**：文件内容、记忆文件、异步任务状态靠「重新注入」

类比：老板做季度总结 — 会议记录归档（丢了），桌面换上精华版纪要（摘要），员工手册照挂（CLAUDE.md 重新加载），最近用的关键文档放桌面（文件恢复）。

---

## 五、触发时机：距离上限的固定缓冲

### 5.1 阈值计算

```typescript
export const AUTOCOMPACT_BUFFER_TOKENS = 13_000

function getAutoCompactThreshold(model: string): number {
  effectiveContextWindow = getEffectiveContextWindowSize(model)
  return effectiveContextWindow - AUTOCOMPACT_BUFFER_TOKENS
}
```

触发线 = 有效上下文窗口 - 13k

**为什么是 13k？** 基于摘要任务的 **p99.99 输出长度**算出。99.99% 分位说明 Anthropic 跑了大规模数据统计，实际数据约 17.3k，再留安全冗余。

**绝对值阈值的好处**：不管窗口扩到 500k 还是 1M，触发线永远是「上限减 13k」。如果用 80% 比例，窗口越大浪费越多。

### 5.2 手动 vs 自动触发

| 维度 | 手动 `/compact` | 自动 Auto-Compact |
|------|----------------|-------------------|
| 自定义指令 | 可传 customInstructions | 不接受用户指令 |
| suppressFollowUpQuestions | 关闭 | 开启（禁止摘要生成后续提问） |
| circuit breaker | 无 | 连续失败3次熔断 |

### 5.3 熔断机制（Circuit Breaker）

Auto-Compact 连续失败 3 次，系统停止重试。源码注释说曾有 1000+ 会话因反复重试把 API 账单当烟花放。

### 5.4 递归守卫

摘要任务本身也是子 Agent 调模型，可能再次触发 auto-compact 形成死循环。源码用来源标签解决：

```typescript
if (querySource === 'session_memory' || querySource === 'compact') {
  return false  // 不再触发压缩
}
```

---

## 六、压什么、留什么、丢什么

### 6.1 全量重写整段对话

Claude Code 的做法非常激进：**所有 200 轮全部送进摘要器，重新写一份**，不保留最近 N 条。

理由：Lost in the Middle 现象意味着保留最近 20 轮模型也看不清中间几轮，不如全部压成结构化精华。

### 6.2 压缩后的四段式结构

```typescript
buildPostCompactMessages(result: CompactionResult): Message[] {
  result.boundaryMarker,    // 压缩边界标记
  ...result.summaryMessages, // 摘要消息
  ...result.attachments,     // 文件、技能、计划等附件
  ...result.hookResults,     // hook 执行结果
}
```

| 段落 | 内容 | 作用 |
|------|------|------|
| 边界标记 | 自动/手动、压缩前token数、最后一条消息ID | 时间戳 |
| 摘要消息 | 200轮全部压缩进这里 | 语义信息 |
| 附件 | 最近文件、计划文件、技能、异步任务状态 | 状态信息 |
| hook结果 | 用户配置hooks在压缩时执行的结果 | 自定义逻辑 |

**信息半衰期对照**：

| 信息类型 | 半衰期 | 处理方式 |
|---------|--------|---------|
| 语义信息（用户意图、技术方案决策） | 长 | 走摘要 |
| 状态信息（当前改到哪个文件、子任务进度） | 短 | 走附件 |

### 6.3 Micro-Compact 预处理

Auto-Compact 真正跑之前，先把对话里占大头的「可重新获取」工具结果清空，只留元数据占位符。涉及 Read/Bash/Grep/Glob/WebFetch/WebSearch/Edit/Write。

### 6.4 文件恢复策略

```typescript
POST_COMPACT_MAX_TOKENS_PER_FILE = 5_000    // 每文件最多5k
POST_COMPACT_TOKEN_BUDGET = 50_000           // 总预算50k
POST_COMPACT_MAX_FILES_TO_RESTORE = 5        // 最多5个文件
```

按「最近活跃度」排，最近被 Read 过的优先。三个参数工程化定义死，不管对话多复杂，文件恢复开销都可控。

### 6.5 CLAUDE.md 不进摘要

CLAUDE.md 不注入压缩后消息，而是通过**清空 getUserContext 缓存**让它在下一轮自动重新加载。因为 CLAUDE.md 是「永久存活」的上下文，每轮都会自动重新加载。

### 6.6 System Prompt 和异步任务

- System Prompt 完全不参与压缩，压缩后用 `buildEffectiveSystemPrompt` 重新构造（注入最新工具列表、权限设置、MCP server 列表）
- 异步任务状态作为附件重新注入

---

## 七、摘要 Prompt 设计

摘要 Prompt 长达**两百多行**。

### 7.1 防呆设计：禁止工具调用

```
CRITICAL: Respond with TEXT ONLY. Do NOT call any tools.
- Do NOT use Read, Bash, Grep, Glob, Edit, Write, or ANY other tool.
- Tool calls will be REJECTED and will waste your only turn.
- Your entire response must be plain text.
```

在 Prompt 开头讲一遍，结尾再讲一遍（前后包夹）。因为早期 Sonnet 4.6 经常无视一次警告。

### 7.2 输出格式：XML + 9 部分清单

```xml
<analysis>
[模型的推理草稿，分析对话哪些重要]
</analysis>
<summary>
[结构化的摘要，按 9 个清单分块]
</summary>
```

`<analysis>` 是草稿区，最终被剥离不进入压缩后对话。`<summary>` 才是真正进入对话的内容。

**9 个固定章节**：

| 序号 | 章节 | 要点 |
|------|------|------|
| 1 | Primary Request and Intent | 主要请求和意图 |
| 2 | Key Technical Concepts | 关键技术概念 |
| 3 | Files and Code Sections | 涉及的文件和代码段 |
| 4 | Errors and fixes | 碰到的错误和修复方式 |
| 5 | Problem Solving | 解决的问题 |
| 6 | **All user messages** | **枚举所有用户消息（一个不能落）** |
| 7 | Pending Tasks | 待办任务 |
| 8 | **Current Work** | **最细颗粒度的当前进度** |
| 9 | Optional Next Step | 下一步建议 |

**第 6 项重点**：不是「概括」而是「枚举」。用户在第 30 轮改需求、第 80 轮提新约束、第 150 轮放弃方向，这些信号一个不能落。

**第 8 项重点**：不是「正在调试」，而是「正在调试登录模块的 token 刷新逻辑，刚发现 cookie 过期判断有 bug，正准备改 auth.ts 的 refreshToken 函数」。越细，Agent 接续工作越流畅。

### 7.3 摘要用什么模型？

用**当前对话的同一个模型**（如 Opus 4 / Sonnet 4），不省钱换小模型。原因：

1. 摘要质量要保证（小模型丢东西多，下一轮接不上）
2. Prompt Cache 复用（同一模型能复用 system prompt 的 cache，省下来的比换小模型还多）

---

## 八、压完之后怎么接续对话

### 8.1 压缩流水线五步走

1. 所有消息送进摘要器，生成摘要文本
2. 清空各种缓存（readFileState / loadedNestedMemoryPaths / getUserContext）
3. **并发**生成附件（最近文件、异步 agent 状态、技能配置等）
4. 调用 `buildPostCompactMessages` 组装新消息链
5. 新消息链替换旧的，对话继续

### 8.2 旧消息真的丢了吗？

**真的丢了**（除非开启 Kairos 模式的 transcript 备份）。压缩是一次性的、破坏性的操作。一刀切反而干净，避免维护两套消息。

### 8.3 让模型无缝接活

摘要开头包装成：

> 「本会话是从之前一次因上下文耗尽而中断的对话延续过来的。以下摘要概述了之前的对话内容。」

告诉模型：**你是接着干，不是从头开始**。

摘要末尾带 transcript 文件路径，Agent 需要时可翻底牌。

### 8.4 suppressFollowUpQuestions 开关

自动触发时打开，禁止摘要器在 Current Work 部分生成「需要进一步确认」类问题，避免打断当前任务流。手动 `/compact` 时关闭。

---

## 九、面试答题框架

### 一句话亮观点

> Claude Code 用的不是滑动窗口、定期摘要、向量召回，而是「全量重写加分通道恢复」的工程化思路。

### 四层铺细节

**第一层：触发时机**

绝对 token 阈值，公式 = 有效上下文窗口 - 13k 缓冲。13k 基于摘要任务 p99.99 输出长度算出。

**第二层：取舍逻辑**

不保留最近 N 条，所有历史消息一刀切全部送进摘要器重写。关键状态信息走「附件通道」恢复（最近5个文件，每文件5k，总预算50k；异步任务状态；当前计划文件）。CLAUDE.md 通过清空缓存让下一轮自动重新加载。

**第三层：摘要 Prompt 设计**

9 部分结构化清单约束输出。重点：「所有用户消息」必须枚举不能落；「当前正在做的事」要精确到文件和函数名。用当前对话同一模型，保证质量 + 复用 prompt cache。

**第四层：接续机制**

压缩后清空文件状态缓存、并发生成附件、用 `buildPostCompactMessages` 组装新消息链。摘要外包一句「本会话是从之前一次因上下文耗尽而中断的对话延续过来的」。自动触发时打开 suppressFollowUpQuestions 开关。

### 一句话收口

> Claude Code 这套设计反映的不是「省 token」的小聪明，而是「信息分通道管理」的工程哲学。

---

## 十、核心洞察

**上下文管理不是「省 token」，是「保信息结构」**。

不同信息有不同的半衰期，要分别管理：

- 语义信息（意图、决策）→ 走摘要
- 状态信息（文件、任务进度）→ 走附件
- 永久信息（CLAUDE.md）→ 靠缓存清理重新加载
- 操作配置（system prompt）→ 每次重建

**当未来上下文窗口扩到 1 亿 token，是否还需要 compaction？** 仍然需要。Lost in the Middle 是注意力机制的固有特性，主动管理信息结构永远不会过时。
