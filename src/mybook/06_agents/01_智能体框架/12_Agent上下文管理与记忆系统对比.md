# Agent 上下文管理、压缩与记忆系统对比分析

> 参考：Claude Code、OpenClaw、Codex、OpenCode、NanoBot、PicoClaw、Harness Agent 等主流 Agent Harness 实现
> 数据来源：源码分析、Web 搜索、技术博客逆向工程

---

## 一、核心概念与术语

### 1.1 上下文管理的本质

```
LLM 的上下文窗口 = Agent 的「工作记忆」
上下文管理 = 在有限的 token 预算内，决定「保留什么、压缩什么、丢弃什么」
```

**上下文消耗的三驾马车**：
1. System Prompt + 工具定义（开局 ~5k-20k token）
2. 工具调用双倍记账（tool_use + tool_result）
3. 大文件 Read（一个源文件可达 ~10k token）

**Lost in the Middle**：上下文越长，模型对中间段信息的记忆越模糊，这是注意力机制的固有特性，与窗口大小无关。

### 1.2 记忆类型分类

| 类型 | 时效 | 载体 | 典型场景 |
|------|------|------|----------|
| **Working Memory** | 当前会话 | 消息历史 | 当前的代码改动状态 |
| **Episodic Memory** | 跨会话 | 文件/DB | 昨天修复的 bug 方案 |
| **Semantic Memory** | 长期 | 结构化存储 | Agent 身份、用户偏好 |
| **Procedural Memory** | 永久 | 技能/SOP | 如何执行 git 操作 |

### 1.3 信息半衰期

| 信息类型 | 半衰期 | 处理策略 |
|----------|--------|----------|
| 语义信息（意图、决策） | 长 | 摘要压缩 |
| 状态信息（文件、任务进度） | 短 | 附件恢复 |
| 永久信息（CLAUDE.md） | 永久 | 缓存重建 |
| 操作配置（system prompt） | 动态 | 每次重建 |

---

## 二、主流 Agent Harness 对比总览

### 2.1 框架概览

| 项目 | 语言 | 定位 | Memory 实现 | 压缩方案 | 复杂度 |
|------|------|------|-------------|----------|--------|
| **Claude Code** | TypeScript | Anthropic 官方 CLI Agent | Prompt 描述 + 自动摘要 | 7 层递进防御 | ★★★★★ |
| **OpenClaw** | TypeScript | 10万+ Stars 通用 Agent OS | Markdown 文件 + SQLite 向量 | 上下文压缩 | ★★★★ |
| **NanoBot** | Python | nanogram 团队轻量 Agent | MEMORY.md + history.jsonl | Consolidator 摘要 | ★★★★ |
| **PicoClaw** | Go | <10MB 超轻量嵌入式 | 纯文本文件 | 简化版压缩 | ★★ |
| **Codex (OpenAI)** | Python | OpenAI 官方 Coding Agent | Session Memory | 摘要压缩 | ★★★ |
| **OpenCode** | TypeScript | 开源 Code Agent | **无原生 Memory** | 上下文裁剪 | ★★ |
| **Harness Agent** | - | Harness 平台集成 | 多 Harness 集成 | 依赖底层 | - |

### 2.2 架构哲学对比

```
Claude Code   → 信息分通道管理（摘要/附件/缓存），各司其职互不干扰
OpenClaw      → 纯文本 Markdown + SQLite 向量，大道至简
NanoBot       → 双阶段 Dream + Consolidator，文件 I/O 优先
PicoClaw      → 极简主义，轻量优先，功能裁剪
Codex         → Prompt Engineering 驱动，Memory 在 Prompt 内描述
OpenCode      → 无持久 Memory，依赖外部状态
```

---

## 三、Claude Code — 7 层递进防御体系

> 基于源码逆向分析（v2.1.156），业界最复杂的上下文管理系统

### 3.1 7 层金字塔全景

```
┌─────────────────────────────────────────────────────┐
│  Layer 7: Auto-Compact 全量摘要   [API 费用最高]     │
│         触发条件: 上下文达 ~93%                       │
├─────────────────────────────────────────────────────┤
│  Layer 6: Context Collapse 读时投影 [零 API]         │
│         触发条件: 上下文达 90%/95%                    │
├─────────────────────────────────────────────────────┤
│  Layer 5: Micro-Compact 时间衰减  [零 API]           │
│         触发条件: 距上次 API 调用 > 60 分钟           │
├─────────────────────────────────────────────────────┤
│  Layer 4: Snip 砍远古消息      [零 API]             │
│         触发条件: 对话开头旧消息                      │
├─────────────────────────────────────────────────────┤
│  Layer 3: Tool Result Budget  [零 API]              │
│         触发条件: 单工具结果 > 50KB                  │
├─────────────────────────────────────────────────────┤
│  Layer 2: 大结果存磁盘       [零 API]               │
│         触发条件: 同条消息总量 > 200KB               │
├─────────────────────────────────────────────────────┤
│  Layer 1: Bootstrap Files    [零 API]              │
│         触发条件: 系统启动                           │
└─────────────────────────────────────────────────────┘
```

### 3.2 各层详细机制

#### Layer 1-2: 大结果存磁盘
- 单工具结果 > 50KB → 写临时文件，原位置留引用
- 同条消息总量 > 200KB → 全部写文件
- 零 API 开销，信息损失几乎为零

#### Layer 3: Micro-Compact 时间衰减
- 工具结果按时间衰减：距上次 API 调用 > 60 分钟开始清理
- 只清工具输出，保留 user/assistant 消息
- 不触发摘要，零 API 开销

#### Layer 4: Snip 砍远古消息
- 从对话最老的消息开始裁剪
- 保留 system prompt 和近期消息
- 适用于长时间空闲后恢复的场景

#### Layer 5: Context Collapse 读时投影
- 当上下文达到 90%/95% 阈值时触发
- 在**读取时**而非写入时动态过滤历史
- 利用模型的「近期偏好」特性

#### Layer 6-7: Auto-Compact 全量摘要

**触发时机**：绝对 token 阈值 = 有效上下文窗口 - 13k 缓冲

```typescript
// 13k 缓冲基于摘要任务 p99.99 输出长度统计
export const AUTOCOMPACT_BUFFER_TOKENS = 13_000
```

**核心设计原则**：不保留最近 N 条，而是**所有历史全量重写**

| 对比 | 大多数框架 | Claude Code |
|------|------------|-------------|
| 策略 | 保留最近 N 条，压缩旧的 | 全部重写为结构化摘要 |
| 原因 | 直觉上最近最相关 | Lost in the Middle：中间段都模糊 |
| 优势 | 保留原始细节 | 结构清晰，一眼看清全局 |

**压缩后四段式结构**：
```
┌────────────────────────────────────┐
│ 1. 边界标记 (Boundary Marker)       │  ← 时间戳/压缩前token数
├────────────────────────────────────┤
│ 2. 摘要消息 (Summary Messages)      │  ← 9 部分结构化清单
├────────────────────────────────────┤
│ 3. 附件 (Attachments)              │  ← 最近文件/异步任务/计划
├────────────────────────────────────┤
│ 4. Hook 结果 (Hook Results)         │  ← 自定义逻辑执行结果
└────────────────────────────────────┘
```

**9 部分摘要清单**：

| 序号 | 章节 | 关键要求 |
|------|------|----------|
| 1 | Primary Request and Intent | 用户主要请求和意图 |
| 2 | Key Technical Concepts | 关键技术概念 |
| 3 | Files and Code Sections | 涉及的文件和代码段 |
| 4 | Errors and Fixes | 碰到的错误和修复 |
| 5 | Problem Solving | 解决的问题 |
| 6 | **All User Messages** | **枚举所有用户消息（一个不落）** |
| 7 | Pending Tasks | 待办任务 |
| 8 | **Current Work** | **精确到函数/文件名的当前进度** |
| 9 | Optional Next Step | 下一步建议 |

**文件恢复策略**：
```
POST_COMPACT_MAX_TOKENS_PER_FILE = 5_000    // 每文件最多5k
POST_COMPACT_TOKEN_BUDGET = 50_000          // 总预算50k
POST_COMPACT_MAX_FILES_TO_RESTORE = 5       // 最多5个文件
```

**CLAUDE.md 不进摘要**：通过清空 `getUserContext` 缓存，触发下一轮自动重新加载。

**熔断机制**：连续失败 3 次停止重试，防止无限循环。

### 3.3 Claude Code 记忆文件

```
~/.claude/
├── memories/                 # 记忆文件目录
│   ├── MEMORY.md            # 跨会话长期记忆（LLM 可编辑）
│   └── memory_index.json    # 记忆索引
├── projects/
│   └── [project]/
│       ├── CLAUDE.md        # 项目级指令
│       └── .claude/         # 项目级配置
└── sessions/                # 按日期组织的会话历史
    └── 2026-06-12.jsonl
```

---

## 四、OpenClaw — 纯文本 + SQLite 向量

### 4.1 记忆架构

```
workspace/
├── MEMORY.md              # 长期记忆（LLM 可编辑提炼）
├── SESSION.md             # 当前会话摘要
├── USER.md                # 用户偏好
├── SOUL.md                # Agent 身份定义
└── sessions/              # 按天的会话日志
    ├── 2026-06-10.jsonl
    ├── 2026-06-11.jsonl
    └── 2026-06-12.jsonl
```

### 4.2 上下文压缩时机

当会话大小超出模型上下文窗口限制时触发：
1. 调用 LLM 生成会话摘要
2. 用摘要替换历史消息
3. 保留必要的上下文引用

### 4.3 SQLite 向量索引

当 MEMORY.md 增长到一定规模时，使用 SQLite FTS5 + 向量扩展：
- **语义检索**：快速找到相关历史记忆
- **人类可读**：纯文本 Markdown 依然可编辑
- **可干预**：用户可直接修改 MEMORY.md

---

## 五、NanoBot — Dream + Consolidator 双机制

> Python 实现，源码结构最清晰的学习范本

### 5.1 文件结构

```
workspace/
├── MEMORY.md          # 长时记忆（LLM 可编辑）
├── SOUL.md            # Agent 身份（不可变）
├── USER.md            # 用户偏好
└── memory/
    ├── MEMORY.md      # 工作区记忆
    ├── history.jsonl  # append-only 事件日志
    ├── .cursor        # 自增游标
    └── .dream_cursor  # Dream 处理进度
```

### 5.2 Consolidator — Token Budget 驱动压缩

```python
def maybe_consolidate_by_tokens(session):
    budget = context_window - max_completion - 1024
    target = budget * consolidation_ratio  # 通常 0.5
    
    # 循环最多 5 轮
    while True:
        boundary = pick_consolidation_boundary()
        summary = LLM.summarize(chunk)
        append_history(summary, max_chars=8000)
        
        if estimate_tokens() < target:
            break
```

**关键设计**：
- 按 user-turn 边界切割（保持对话逻辑完整性）
- LLM 摘要失败 → raw_archive 兜底
- 循环最多 5 轮防止无限压缩

### 5.3 Dream — 双阶段记忆演化

**触发条件**：每 2 小时空闲时

```python
# 1. 收集未处理的 history.jsonl 条目
entries = read_recent_history(20)

# 2. 构建 Dream Prompt
dream_prompt = render("dream.md", entries=entries)

# 3. 限制工具集
dream_tools = [read, edit, write, apply_patch]
# 只能编辑: SOUL.md, USER.md, MEMORY.md, skills/

# 4. 执行后更新 .dream_cursor
```

**目的**：让 Agent 定期「反思」，更新长期记忆中的过时信息。

### 5.4 AutoCompact — TTL 空闲会话归档

```python
class AutoCompact:
    def check_expired(self, active_session_keys):
        for session in self.sessions.list_sessions():
            if not internal(session.key) and session.key not in active_session_keys:
                if TTL_expired(session.updated_at):
                    self._archive(session.key)  # 后台压缩
```

- 两速查找：内存 dict（热路径）→ session metadata（冷路径）
- 失败静默吞异常，不影响主流程

---

## 六、PicoClaw — Go 极简主义

### 6.1 设计理念

- 核心代码 95% 由 AI 智能体自主生成
- 灵感源自 NanoBot，Go 语言从零重构
- 面向嵌入式场景（< 10MB 内存占用）

### 6.2 记忆简化

相比 OpenClaw/NanoBot：
- **移除**：SQLite 向量索引
- **保留**：MEMORY.md 纯文本记忆
- **简化**：压缩逻辑，减少配置项

---

## 七、Codex — Prompt Engineering 驱动

### 7.1 记忆方式

Codex 的记忆主要通过 **Prompt 内描述** 实现：
- 在 system prompt 中描述项目结构
- 通过 `Instructions` 传递长期上下文
- Session Memory 通过 API 层面的 session 管理

### 7.2 上下文压缩

- 触发条件：上下文接近窗口上限
- 方式：调用 LLM 生成会话摘要
- 特点：与 Claude Code 类似，但实现更简洁

---

## 八、OpenCode — 无原生 Memory

### 8.1 设计选择

OpenCode 选择了**无持久 Memory** 的设计：
- 依赖外部状态管理
- 每次会话从干净状态开始
- 适合临时任务场景

### 8.2 上下文管理

- 滑动窗口裁剪旧消息
- 无主动压缩/摘要机制
- 适合短时任务

---

## 九、最佳实践总结

### 9.1 上下文管理决策树

```
遇到长上下文问题？
├── 大文件/大结果
│   └── 写磁盘，原位置留引用（Claude Code Layer 1-2）
├── 时间久远的工具结果
│   └── 时间衰减清理（Claude Code Layer 3）
├── 对话历史过长
│   ├── 高价值信息 → 摘要压缩 → 保留关键结构
│   └── 低价值信息 → 直接裁剪
└── 需要跨会话记忆
    └── MEMORY.md / Dream / SQLite 向量
```

### 9.2 压缩策略对比

| 策略 | 适用场景 | 代表框架 | 优点 | 缺点 |
|------|----------|----------|------|------|
| **全量重写** | 长对话、复杂任务 | Claude Code | 结构清晰、全局视角 | API 费用高 |
| **保留最近 N 条** | 简单对话 | 大多数框架 | 简单、实现成本低 | Lost in Middle |
| **时间衰减** | 多会话、间歇任务 | Claude Code | 智能清理 | 需要时间戳追踪 |
| **向量召回** | 知识检索 | RAG 系统 | 语义匹配 | 不适合时序上下文 |

### 9.3 记忆存储对比

| 存储方式 | 示例 | 优点 | 缺点 |
|----------|------|------|------|
| **纯文本 Markdown** | MEMORY.md | 人类可读、可干预、易调试 | 无结构化检索 |
| **JSONL** | history.jsonl | append-only、简单 | 无压缩、查询慢 |
| **SQLite** | OpenClaw | 支持向量搜索、事务 | 增加复杂度 |
| **向量数据库** | Qdrant/Chroma | 语义检索强 | 需要额外服务 |

### 9.4 推荐架构

```
生产级 Agent 上下文管理架构：

┌──────────────────────────────────────────────────────┐
│  上下文窗口                                          │
│  ┌────────────────────────────────────────────────┐  │
│  │ System Prompt │ Tools │ Attachments │ History   │  │
│  └────────────────────────────────────────────────┘  │
│           ↑                  ↑           ↑         │
│           │                  │           │         │
│  ┌────────┴──┐    ┌───────────┴──┐   ┌───┴──────┐  │
│  │ 重建/缓存 │    │ 动态附件注入  │   │ 分层压缩  │  │
│  │ (CLAUDE.md│    │ (文件/任务/  │   │(时间衰减  │  │
│  │  /权限)   │    │  计划状态)   │   │ /摘要)    │  │
│  └───────────┘    └──────────────┘   └──────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │  长期记忆层                                      ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────┐    ││
│  │  │MEMORY.md│  │SQLite/  │  │ Dream反思   │    ││
│  │  │纯文本   │  │向量索引  │  │ (定期演化)  │    ││
│  │  └─────────┘  └─────────┘  └─────────────┘    ││
│  └─────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

### 9.5 工程实现清单

| 组件 | 必需 | 推荐实现 |
|------|------|----------|
| **大结果存磁盘** | ✓ | 临时文件 + 引用占位符 |
| **时间衰减清理** | ✓ | 按 tool_result 时间戳衰减 |
| **用户边界裁剪** | ✓ | 按 user-turn 切割 |
| **LLM 摘要压缩** | 推荐 | 结构化 9 部分清单 |
| **CLAUDE.md 缓存** | 推荐 | 清缓存触发重新加载 |
| **文件恢复策略** | 推荐 | 最多 5 文件 × 5k token |
| **熔断机制** | 推荐 | 连续失败 N 次停止 |
| **长期记忆存储** | 推荐 | MEMORY.md + 可选向量 |
| **Dream 反思** | 可选 | 定期更新过时记忆 |

### 9.6 Claude Code 的 8 条设计原则

1. **分层防御**：能轻压就不重压，每层替下一层减负
2. **绝对阈值**：用 token 绝对值而非百分比，便于扩展
3. **全量重写**：不保留最近 N 条，结构化摘要优于碎片
4. **分通道管理**：不同信息走不同恢复通道
5. **Prompt Cache 优先**：同模型复用缓存，省钱又省算
6. **熔断保护**：防止无限循环导致账单爆炸
7. **人类可读**：摘要格式结构化，便于审计和干预
8. **接续暗示**：摘要开头说明「这是延续对话」，让模型知道接着干

---

## 十、面试要点

### 核心观点一句话

> Claude Code 的上下文管理不是「省 token」，而是「保信息结构」——不同信息有不同的半衰期，要分别管理：语义信息走摘要、状态信息走附件、永久信息靠缓存重建。

### 四层展开框架

1. **触发时机**：绝对 token 阈值 = 窗口 - 13k
2. **取舍逻辑**：全量重写 + 分通道恢复
3. **摘要设计**：9 部分结构化清单，用户消息枚举不遗漏
4. **接续机制**：边界标记 + 接续暗示 + 熔断保护

### 追问点

- 13k 缓冲怎么算出来的？（p99.99 统计）
- Snip vs Auto-Compact 区别？（时机 vs 手段）
- 为什么用同模型做摘要？（Prompt Cache 复用）
- Dream 机制解决什么问题？（记忆过时）

---

## 参考资源

- [Claude Code 源码逆向分析](https://github.com/anthropics/claude-code)
- [Claude Code 上下文管理深度解析](http://m.toutiao.com/group/7638447409869144628/)
- [主流 Agent Harness Memory 对比](http://m.toutiao.com/group/7647070843499184674/)
- [主流 Agent Harness Context 压缩对比](http://m.toutiao.com/group/7649220246049505828/)
- [Claude Code 7 层递进防御体系](http://m.toutiao.com/group/7625534575569060415/)
- [NanoBot 源码分析](https://github.com/nanogram-team/nanobot)
- [OpenClaw 源码](https://github.com/openclaw/openclaw)
- [Agent 记忆综述 - NUS/人大/复旦/北大](https://view.inews.qq.com/a/20251223A02JL900)