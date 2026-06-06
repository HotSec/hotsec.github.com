# Claude Code 记忆系统

> 来源：[面试官说：有 Claude Code 就够了，要什么记忆系统？](https://mp.weixin.qq.com/s/ipMjYyYFl3pxbaX9Hl1yaw)、[Claude Code 记忆系统深度分析：基于源码泄露的三层架构解密](http://m.toutiao.com/group/7624856172461392435/)、[Claude Code 记忆系统架构分析](http://m.toutiao.com/group/7627778141569745444/)

基于 Claude Code 泄露源码（约 512,000 行 TypeScript），深度拆解其「会话记忆 → 持久记忆 → 团队记忆」三层递进知识管理体系的完整架构。

---

## 一、三层记忆架构总览

Claude Code 不是简单的聊天包装器，而是一个包含自我修复记忆机制的工程级 AI Agent。其记忆系统解决的核心问题：**如何在有限的上下文窗口内，跨越时间和用户边界地保存与召回知识。**

### 1.1 LLM 记忆的根本困境

| 困境 | 具体表现 | 影响 |
|------|---------|------|
| 上下文窗口有限 | 即使百万 token 上下文，长期项目仍会超限 | 历史信息丢失 |
| 无跨会话记忆 | 每次新会话 AI 从零开始 | 重复劳动 |
| 多人协作割裂 | 不同用户积累的知识孤岛化 | 协作低效 |
| 过期信息污染 | 旧的记忆被当作事实引用 | 准确性下降 |

### 1.2 三层架构设计哲学

三层设计的本质是**时间维度的知识分层**：

| 层级 | 管什么 | 时间维度 | 作用范围 |
|------|--------|---------|---------|
| 会话记忆 | "今天" | 单次对话 | 当前会话 |
| 持久记忆 | "这个项目" | 跨会话 | 当前用户 |
| 团队记忆 | "整个团队" | 跨用户 | 团队共享 |

### 1.3 三层 vs CLAUDE.md / Memory / RAG

| 机制 | 类比 | 管什么 | 特点 |
|------|------|--------|------|
| CLAUDE.md | 员工手册 | 硬规矩（代码风格、禁止事项、架构规范） | 每次对话强制加载，写死的规则 |
| Memory | 真正的魔法 | 主观默契（偏好、背景、决策原因） | 自动总结、Dreaming 机制、越用越懂你 |
| RAG | 随查随用的图书馆 | 客观事实（API 文档、历史代码库、产品手册） | 实时检索、海量外部知识 |

**正确姿势**：铁律写死（CLAUDE.md），偏好让 AI 自己记（Memory），资料随时查（RAG）。

---

## 二、持久记忆系统

持久记忆是整个记忆系统中最复杂、最精密的一层。

### 2.1 记忆文件格式：Markdown + YAML Frontmatter

每条记忆是一个独立的 `.md` 文件，带有 YAML frontmatter：

```yaml
---
name: 用户偏好-简洁回复
description: 用户不希望在每次回复末尾加总结
type: feedback
---
不要在回复末尾总结刚做了什么，用户能看到 diff。
**Why:** 用户明确要求过 "stop summarizing what you just did"
**How to apply:** 所有回复结束时，直接结束，不加回顾性总结。
```

设计选择原因：**用户可以直接用任何文本编辑器查看、编辑、删除记忆文件，Git 可以追踪变更，跨工具使用零摩擦**——"人类可读优先"的工程哲学。

### 2.2 四种记忆类型

```typescript
const MEMORY_TYPES = ['user', 'feedback', 'project', 'reference'] as const
```

| 类型 | 核心用途 | 典型内容 | 团队模式作用域 |
|------|---------|---------|--------------|
| user | 用户角色、目标、知识背景 | "深度 Go 经验，React 新手" | 始终私有 |
| feedback | 用户对工作方式的指导 | "不要在回复末尾加总结" | 默认私有 |
| project | 项目进展、目标、里程碑 | "3月5日起移动端发布冻结" | 偏向团队共享 |
| reference | 外部系统指针 | "线上告警看板: https://grafana/xxx" | 通常团队共享 |

**feedback 和 project 类型强制要求**：必须包含 **Why:** 和 **How to apply:** 两行。没有上下文的结论容易被错误地应用。

### 2.3 六类排除项

源码中硬编码了六类即使用户明确要求也不保存的信息：

| 排除项 | 原因 |
|--------|------|
| 代码模式、项目架构和文件结构 | grep/git/CLAUDE.md 可获取 |
| Git 历史和最近改动 | git log/git blame 是权威来源 |
| 调试方案和修复方法 | 修复已在代码里 |
| CLAUDE.md 里已写的内容 | 避免重复 |
| 临时任务状态和当前对话上下文 | 会话级信息 |
| 可从代码仓库本身推导出的信息 | 记忆保存的是"人"的知识，不是"代码"的知识 |

### 2.4 MEMORY.md 索引机制

MEMORY.md 是整个持久记忆系统的"目录页"，而非记忆内容本身：

| 限制项 | 值 | 触发行为 |
|--------|-----|---------|
| 最大行数 | 200 行 | 追加截断警告 |
| 最大字节数 | 25,000 字节 | 追加截断警告 |
| 截断方式 | 按行边界 | 不会切断一行中间 |

### 2.5 存储目录结构

```
~/.claude/
  projects/
    -Users-charlesqin-Desktop-myproject/   ← sanitizePath(项目根目录)
      memory/
        MEMORY.md                          ← 索引文件
        user_role.md                       ← 私有记忆
        feedback_testing.md
        project_deadline.md
        reference_linear.md
        team/                              ← 团队记忆子目录
          MEMORY.md
          project_api_migration.md
        logs/                              ← KAIROS 每日日志
          2026/03/2026-03-31.md
```

Git worktree 场景下，所有 worktree 共享主仓库的记忆目录。

### 2.6 路径安全机制

| 安全层 | 检查内容 | 防御目标 |
|--------|---------|---------|
| 绝对路径检查 | 拒绝相对路径 | 路径遍历攻击 |
| 根路径检查 | 拒绝长度 < 3 的路径 | 写入系统根目录 |
| UNC 路径检查 | 拒绝 `\\server\share` | NTLM 凭证泄露 |
| Null 字节检查 | 拒绝包含 `\0` 的路径 | 路径截断攻击 |
| Tilde 展开限制 | 拒绝 `~`、`~/` | 匹配整个 HOME 目录 |
| 项目设置排除 | `.claude/settings.json` 不能设 autoMemoryDirectory | 恶意仓库写入 `~/.ssh` |
| NFC 规范化 | Unicode NFC 标准化 | macOS 路径不一致性 |

最关键的安全设计：即使攻击者控制了仓库并在 settings.json 中设置恶意路径，Claude Code 也不会将其用作记忆目录。

---

## 三、自动记忆提取：Fork Agent 的隔离执行

### 3.1 触发时机

在每轮对话结束后，悄悄 fork 一个子 Agent 来提取记忆，**绝不阻塞主对话流程**。

六项前置条件必须全部满足才会触发提取。

### 3.2 互斥机制

```typescript
// 如果主代理在对话中已经直接写了记忆文件，跳过自动提取
if (hasMemoryWritesSince(lastMemoryMessageUuid)) {
  lastMemoryMessageUuid = messages[messages.length - 1].uuid
  return
}
```

当用户明确告诉 Claude Code "记住这件事"，模型会直接写记忆文件；此时 Stop Hook 检测到已有写入，**主动放弃自动提取**，防止覆盖用户的主动意图。

### 3.3 Fork Agent 的工具权限白名单

Fork Agent 以"最小权限"原则运行：

- 最多执行 5 轮交互（1 轮读取 + 最多 4 轮写入）
- 只允许 Read/Grep/Glob/只读 Bash/Edit/Write（仅在记忆目录内）
- 共享主会话的 prompt cache，降低成本

### 3.4 提取节流

```typescript
// 每 N 轮查询才执行一次提取（N 由 GrowthBook 远程控制，默认=1）
const turnsBeforeExtraction = getFeatureValue('tengu_bramble_lintel', 1)
if (turnsSinceLastExtraction < turnsBeforeExtraction) {
  turnsSinceLastExtraction++
  return
}
```

提取成功后，写入的文件路径列表以 SystemMemorySavedMessage 追加到主对话中，主 Agent 下一轮能感知到"记忆已更新"。

---

## 四、AI 驱动的语义召回

### 4.1 完整召回流程

1. **扫描记忆文件**：遍历记忆目录下所有 `.md` 文件（排除 MEMORY.md），仅读取前 30 行获取 frontmatter
2. **格式化记忆清单**：将扫描结果整理成模型可读的清单，按修改时间降序排列
3. **Sonnet 做选择**：把清单 + 用户问题发给 Sonnet，返回最多 5 条相关记忆的文件名
4. **加载选中记忆**：读取完整内容，注入当前对话

设计决策：**用 Sonnet 而非 Haiku**。记忆召回需要理解语义相关性，Haiku 的推理能力不足以准确判断。

### 4.2 召回选择的三条关键规则

| 规则 | 说明 |
|------|------|
| 最多返回 5 个文件名 | 防止上下文污染 |
| 要有选择性和辨别力 | 不确定就不包含，宁缺毋滥 |
| 工具使用过滤 | 正在用的工具 API 文档不召回（已在上下文），但该工具的警告/陷阱/已知问题仍召回 |

第三条尤为精妙：API 文档已经在上下文中了，再召回一遍毫无价值；但"这个工具的已知坑"是上下文中没有的，正是应该召回的。

### 4.3 记忆新鲜度感知

```typescript
function memoryFreshnessText(mtimeMs: number): string {
  if (memoryAgeDays(mtimeMs) <= 1) return ''  // 新鲜记忆不加警告
  return `This memory is ${days} days old. Memories are point-in-time observations,
          not live state — claims about code behavior or file:line citations may be
          outdated. Verify against current code before asserting as fact.`
}
```

选择"47 days ago"而非 ISO 时间戳：实验表明，模型对相对时间的过期推理能力显著强于对绝对日期的推理。

### 4.4 召回前的强制验证要求

> "记忆说 X 存在"不等于"X 现在存在"。记忆是某个时间点的观察，不是实时状态。

---

## 五、会话记忆：专为上下文压缩而生

### 5.1 会话记忆 vs 持久记忆

| 维度 | 会话记忆 | 持久记忆 |
|------|---------|---------|
| 生命周期 | 单次会话 | 跨会话 |
| 存储位置 | 内存 / transcript | 文件系统 |
| 目的 | 为上下文压缩提供摘要基础 | 保存跨会话知识 |
| 触发条件 | 上下文达到 10K tokens 才激活 | 每轮对话结束后的 Stop Hook |

会话记忆的存在意义：当对话上下文即将被压缩时，Claude Code 会优先使用已有的会话记忆内容作为摘要基础，而不是让 Fork Agent 重新生成——这是一条**优先路径（preferred path）**。

### 5.2 精确的触发阈值

```typescript
const defaults = {
  minimumMessageTokensToInit: 10_000,   // 上下文达到 10K tokens 才激活
  minimumTokensBetweenUpdate: 5_000,    // 每增长 5K tokens 更新一次
  toolCallsBetweenUpdates: 3,
}
```

---

## 六、Dream 压缩：记忆的自我整理

### 6.1 Dream 机制

Dream 是后台定期整理记忆库的任务，类似人脑在睡眠中整理海马体：

1. **Orient**：读取现有记忆
2. **Gather**：收集新对话日志、检查过时记忆
3. **Consolidate**：合并相似记忆、删除矛盾事实
4. **Prune**：精简 MEMORY.md 索引，移除无效指针

### 6.2 触发条件

- 24 小时间隔
- 至少 5 个新会话
- 获取文件锁（避免并发冲突）

### 6.3 Dream Task State

```typescript
export type DreamTaskState = TaskStateBase & {
  type: 'dream'
  phase: 'starting' | 'updating'
  sessionsReviewing: number
  filesTouched: string[]
  turns: DreamTurn[]
  abortController?: AbortController
  priorMtime: number
}
```

---

## 七、团队记忆同步

### 7.1 同步协议

团队记忆需要跨用户同步，采用 Delta 上传 + 乐观锁 + 冲突解决：

| 机制 | 说明 |
|------|------|
| Delta 上传 | 只上传变更部分，不是全量同步 |
| 乐观锁 | 基于文件修改时间（mtimeMs）判断是否冲突 |
| 冲突解决 | 检测到冲突时回滚并重试 |

### 7.2 团队记忆限制

| 限制项 | 值 |
|--------|-----|
| 单文件最大 | 250KB |
| PUT Body 最大 | 200KB |

---

## 八、记忆系统架构层次

| 层次 | 核心文件 | 主要功能 |
|------|---------|---------|
| 记忆检索 | memoryScan.ts, findRelevantMemories.ts | 扫描记忆文件、查找相关记忆 |
| 记忆提取 | extractMemories.ts, prompts.ts | 从对话中提取持久化记忆 |
| 记忆压缩 | autoCompact.ts, compact.ts, snipCompact.ts | 自动压缩对话上下文 |
| 记忆存储 | paths.ts, memdir.ts | 管理记忆路径、文件存储 |
| 记忆整合 | autoDream.ts, consolidationPrompt.ts | 整合和优化记忆结构 |

### 层间关系

```
交互与编排层
├─ 查询开始 → 记忆检索层（加载记忆提示）
├─ 调用大模型 → 记忆压缩层（Token 预算检查）
├─ 调用大模型 → 记忆检索层（查找相关记忆）
└─ 查询结束 → 记忆提取层（提取新记忆）

记忆提取层
├─ 查询结束 → 记忆检索层（扫描现有记忆）
└─ 写入记忆 → 记忆存储层（更新文件）

记忆整合层
├─ 读取记忆 → 记忆检索层（扫描记忆文件）
└─ 整合记忆 → 记忆存储层（更新文件和索引）
```

---

## 九、主要配置与限制

| 参数 | 值 | 说明 |
|------|-----|------|
| MAX_ENTRYPOINT_LINES | 200 行 | MEMORY.md 最大行数 |
| MAX_ENTRYPOINT_BYTES | 25KB | MEMORY.md 最大字节数 |
| MAX_MEMORY_FILES | 200 个 | 最大记忆文件数 |
| MAX_RELEVANT_MEMORIES | 5 个 | 最多返回相关记忆数 |
| FRONTMATTER_MAX_LINES | 30 行 | 扫描时读取的前置元数据行数 |
| AUTOCOMPACT_BUFFER_TOKENS | 13,000 | 自动压缩缓冲 |
| MAX_OUTPUT_TOKENS_FOR_SUMMARY | 20,000 | 摘要输出限制 |
| MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES | 3 | 连续失败后停止自动压缩 |

### 特性门控

| 特性 | 门控 | 说明 |
|------|------|------|
| 自动记忆 | CLAUDE_CODE_DISABLE_AUTO_MEMORY | 默认启用 |
| 团队记忆 | tengu_herring_clock | 需要自动记忆启用 |
| 记忆提取 | tengu_passport_quail + EXTRACT_MEMORIES | 后台提取 |
| 自动整合 | tengu_onyx_plover | 定期整合 |

---

## 十、核心洞察

### 记忆系统设计三原则

1. **记该记的，不记能推导的**：四类型封闭集合 + 六类排除项，记忆保存的是"人"的知识，不是"代码"的知识
2. **存索引，按需加载详情**：MEMORY.md 常驻，具体内容按需加载
3. **用小模型做秘书，大模型做决策**：Sonnet 并行预取，Opus 做决策

### 记忆 vs 实时状态

> "记忆说 X 存在"不等于"X 现在存在"。记忆是某个时间点的观察，不是实时状态。

这是记忆系统设计中最重要的一句话。过期记忆比没有记忆更危险——因此新鲜度感知和验证要求是整个系统的安全底线。

### 工程哲学

Claude Code 的记忆系统体现了"人类可读优先"的工程哲学：纯文本 Markdown 文件、Git 可追踪、零摩擦跨工具使用。复杂的数据检索交给 SQLite，人类可读的数据留在纯文本文件里。如果记忆记错了，直接用记事本打开删掉那行即可——大道至简。
