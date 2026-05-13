# OpenCode × oh-my-opencode：终端 AI 编程梦之队

> 来源：[OpenCode × oh-my-opencode：终端里的 AI 开发梦之队](https://mdnice.com/writing/827c90b8a83a429bacd2abd7be443acb)

OpenCode 是开源终端 AI 编程助手，oh-my-opencode（OmO）是其多 Agent 协作插件，两者组合实现了规划与执行分离的多 Agent 协作架构。

## OpenCode 概述

开源终端 AI 编程助手，定位类似 Claude Code，但完全免费、支持 75+ 模型提供商。

**核心理念**：
- 终端优先：在项目目录里直接运行，文件修改实时生效
- Plan / Build 双模式：按 `Tab` 键切换 Plan 模式（只分析不改代码）和 Build 模式（全权限执行）
- 提供商无关：不锁定任何单一模型，自由切换

```bash
curl -fsSL https://opencode.ai/install | bash
cd your-project
opencode
```

## oh-my-opencode 插件

给 OpenCode 装上多 Agent 协作能力的改装套件，核心思路：不同任务用不同模型，不同角色用不同 Agent。

```bash
bunx oh-my-opencode install
ultrawork
```

## 11 个专职 Agent

### 规划三元组（Planning Triad）

| Agent | 角色 | 职责 |
|-------|------|------|
| Prometheus | 战略规划师 | Interview 模式：先问问题梳理需求，再生成详细计划 |
| Metis | 计划顾问 | 对计划进行风险评估和补充 |
| Momus | 计划批评者 | 专门挑毛病，查漏补缺 |

### 执行编排层

| Agent | 角色 | 职责 |
|-------|------|------|
| Sisyphus | 主编排者 | 日常任务总指挥，分解目标、调度 Agent，不达目标不罢休 |
| Atlas | 计划执行引擎 | 把 Prometheus 的计划逐步推进，用 `boulder.json` 追踪进度，支持跨 Session 恢复 |

### 深度执行层

| Agent | 角色 | 职责 |
|-------|------|------|
| Hephaestus | 深度执行者 | 自主探索代码库，端到端完成任务 |

### 专项子 Agent

| Agent | 职责 |
|-------|------|
| Oracle | 架构分析 + 调试 |
| Librarian | 文档搜索 + 代码查找 |
| Explore | 快速只读 codebase grep |
| Multimodal Looker | 图像/视觉理解 |
| Sisyphus-Junior | 轻量备用编排者 |

## 典型工作流

1. 用户描述需求 → Prometheus 需求访谈
2. Metis 风险评估 → Momus 计划审查
3. 用户确认计划 → `/start-work` → Atlas 接管执行
4. 任务类型路由：前端 UI / 复杂逻辑 / 快速小改 / 深度研究
5. 各 Agent 执行 → 任务完成

**关键设计**：规划和执行严格分离。Prometheus 只问不写，Atlas 只执行不质疑，避免"边想边改、越改越乱"。

## Hashline 技术（哈希锚定编辑）

解决 AI 编辑代码时"改错行"的问题：每一行打上内容哈希标签，Agent 编辑时必须引用标签，哈希不匹配则编辑被拒绝。

```
11#VK| function hello() {
22#XJ| return "world";
33#MB| }
```

效果：某测试集的编辑成功率从 **6.7% 提升到 68.3%**。

## 任务路由：模型与任务自动匹配

Sisyphus 委派任务时不选具体模型，而是选"类别"，系统自动匹配：

| 类别 | 适用场景 |
|------|---------|
| visual-engineering | 前端 · UI · 设计 |
| deep | 研究 · 自主执行 |
| quick | 单文件 · 小改动 |
| ultrabrain | 复杂逻辑 · 架构决策 |

## 内置工具与 MCP

**工具层**：
- LSP Tools：代码重命名、跳转定义、引用查找、诊断
- AST-Grep：支持 25 种语言的语法感知代码搜索和重写
- Tmux 集成：Agent 可在真实交互终端里跑 REPL、调试器
- IntentGate：执行前分析用户真实意图，避免字面误解

**内置 MCP（始终在线）**：
- Exa：实时网络搜索
- Context7：官方文档检索
- Grep.app：跨 GitHub 代码搜索

## 与 Claude Code 对比

| 特性 | OpenCode + OmO | Claude Code |
|------|---------------|-------------|
| 费用 | 按 API 用量（可用免费模型） | 订阅制 |
| 模型支持 | 75+ 提供商 | 仅 Anthropic |
| 多 Agent 协作 | ✅ 11 个专职 Agent | ❌ |
| 跨 Session 记忆 | ✅ boulder.json | ❌ |
| 开源 | ✅ | ❌ |
| 上手难度 | 中（需配置 API Key） | 低 |

## 快速上手

```bash
curl -fsSL https://opencode.ai/install | bash
bunx oh-my-opencode install
cd your-project
opencode

ultrawork
# 或精确规划后执行
@plan "帮我实现用户认证功能，支持 JWT"
# Prometheus 会开始问问题...确认计划后：
/start-work
```

诊断工具：`bunx oh-my-opencode doctor`

项目地址：[github.com/code-yeongyu/oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)
