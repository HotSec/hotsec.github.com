# Ralph Wiggum 自主循环

## 一、概念起源

**Ralph Wiggum** 是由 Geoffrey Huntley 提出的 Claude Code 自主循环技术，核心理念是 **"不写对代码不准下班"**——AI Agent 在代码未通过验证前不会停止工作。

这个名字来源于《辛普森家族》中 Ralph Wiggum 这个角色，暗示一种"执着地重复直到成功"的行为模式。

### 核心思想

传统 AI Coding 模式：人写 Prompt → AI 生成代码 → 人审查 → 人修改 Prompt → 循环

Ralph Wiggum 模式：人写 PRD → AI 自主循环编码 → AI 自验证 → AI 自修复 → 直到代码通过

关键转变：**从"人驱动循环"变为"AI 自驱动循环"**，人只需要定义目标和验收标准。

---

## 二、Ralph for Claude Code

**Ralph for Claude Code** 是 Ralph Wiggum 概念的开源实现，项目地址：[github.com/frankbria/ralph-claude-code](https://github.com/frankbria/ralph-claude-code)

### 2.1 工作原理

```
┌─────────────────────────────────────────┐
│           Bash 循环 (外层)               │
│  ┌───────────────────────────────────┐  │
│  │     Claude Code (内层)            │  │
│  │  读取 PRD → 编码 → 测试 → 修复    │  │
│  └───────────────────────────────────┘  │
│           ↑ 失败则重试                    │
│           ↓ 成功则退出                    │
└─────────────────────────────────────────┘
```

本质是一个 **Bash 脚本循环 + Claude Code CLI** 的组合：
- 外层 Bash 循环负责持续调用 Claude Code
- 内层 Claude Code 负责实际的编码、测试、修复
- 双条件退出门控制何时停止

### 2.2 核心特性

| 特性 | 说明 |
|------|------|
| PRD 驱动 | 以产品需求文档为输入，AI 自主理解并实现 |
| 双条件退出门 | 代码通过测试 **且** AI 自信完成时才退出 |
| 熔断机制 | 连续失败超过阈值时自动停止，防止无限循环 |
| 会话连续性 | 每次循环传递上下文，避免从零开始 |
| 速率限制 | 控制 API 调用频率，避免超限 |

### 2.3 安装与使用

```bash
# 安装
npm install -g ralph-claude-code

# 初始化项目
ralph init

# 启动自主循环
ralph start --prd requirements.md
```

### 2.4 .ralph/ 目录结构

```
.ralph/
├── config.json          # 配置文件
├── prd.md              # 产品需求文档
├── context/            # 上下文持久化
│   ├── session.md      # 会话状态
│   └── progress.md     # 进度记录
├── validation/         # 验证脚本
│   └── test.sh         # 自定义测试
└── logs/               # 运行日志
```

### 2.5 配置示例

```json
{
  "max_iterations": 50,
  "circuit_breaker": {
    "max_consecutive_failures": 5,
    "cooldown_minutes": 10
  },
  "exit_conditions": {
    "tests_pass": true,
    "ai_confidence": 0.9
  },
  "rate_limit": {
    "requests_per_minute": 20
  }
}
```

### 2.6 退出条件详解

**双条件退出门（Dual-Condition Exit Gate）**：

1. **客观条件**：所有测试通过（`tests_pass === true`）
2. **主观条件**：AI 自信度达到阈值（`ai_confidence >= 0.9`）

两个条件同时满足才会退出循环。这避免了：
- 测试通过但代码不完整的假阳性
- AI 过度自信但测试未通过的假阴性

**熔断器（Circuit Breaker）**：
- 连续 N 次失败后触发
- 进入冷却期，暂停执行
- 冷却期结束后可手动恢复

---

## 三、与其他自主循环方案的对比

| 方案 | 驱动方式 | 退出机制 | 会话管理 | 适用场景 |
|------|---------|---------|---------|---------|
| Ralph Wiggum | Bash 循环 | 双条件门 | 上下文传递 | Claude Code |
| Codex /goal | 内置命令 | 状态机 | 持久化存储 | OpenAI Codex |
| Harness Engineering | 环境约束 | 验证过滤 | 架构约束 | 大规模项目 |

---

## 四、实践要点

### 4.1 PRD 编写原则

1. **明确验收标准**：定义清晰的"完成"条件
2. **约束边界**：限定修改范围，避免 AI 漫游
3. **分阶段交付**：大需求拆分为小 PRD，逐步实现
4. **包含测试期望**：描述期望的测试行为

### 4.2 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 无限循环 | 退出条件不明确 | 完善 PRD 验收标准 |
| 上下文丢失 | 会话过长 | 分阶段执行，利用 context/ 持久化 |
| API 超限 | 循环过快 | 调整 rate_limit 配置 |
| 代码偏移 | AI 修改超出范围 | 收紧 PRD 约束边界 |

### 4.3 适用场景

- 有明确测试标准的功能开发
- Bug 修复（有复现步骤和期望行为）
- 重构任务（有行为不变性约束）
- 不适合：探索性任务、需求不明确的任务

---

## 五、参考资料

- [Ralph for Claude Code GitHub](https://github.com/frankbria/ralph-claude-code)
- Geoffrey Huntley 关于 Ralph Wiggum 的原始讨论
- [Claude Code 官方文档](https://docs.anthropic.com/en/docs/claude-code)
