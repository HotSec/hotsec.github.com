# feature-dev + ralph-loop + GSD：AI 编程完全体解决方案

## 1. 概述

### 1.1 什么是 feature-dev + ralph-loop + GSD

这三个工具构成了 Claude Code 生态中的**黄金组合**：

| 工具 | 定位 | 核心理念 |
|------|------|----------|
| **feature-dev** | 规划层 | 7 阶段系统化功能开发，从需求到交付 |
| **ralph-loop** | 执行层 | 长时间自主循环执行，持续迭代直到完成 |
| **GSD (Get Shit Done/Guidance)** | 保障层 | 提示词工程/规范驱动，确保代码质量 |

**目标**：把 AI 编程从「抽盲盒」变成「精确制导」。

### 1.2 三者协同关系

```
┌─────────────────────────────────────────────────────────────┐
│                feature-dev（7 阶段规划）                      │
│  发现 → 代码库探索 → 澄清 → 架构 → 实现 → 测试 → 审查          │
└──────────────────────────┬──────────────────────────────────┘
                           │ 输出任务清单
                           ↓
┌─────────────────────────────────────────────────────────────┐
│               ralph-loop（长时间执行）                         │
│  持续迭代执行任务，直到所有任务完成                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ 受规范约束
                           ↓
┌─────────────────────────────────────────────────────────────┐
│               GSD (Guidance/Specs)（规范保障）                  │
│  AGENTS.md / OpenSpec / Superpowers，确保质量                  │
└─────────────────────────────────────────────────────────────┘
```

**分工原则**：
- **feature-dev** 负责"做对的事"（规划和任务分解）
- **ralph-loop** 负责"把事做完"（持续执行）
- **GSD** 负责"把事做好"（代码质量和规范）

## 2. feature-dev 详解

### 2.1 什么是 feature-dev

feature-dev 是 Claude Code 的官方插件，提供**引导式 7 阶段功能开发流程**，确保每个功能都经过系统思考，避免仓促编码。

**适用场景**：新功能开发、复杂重构、架构调整

### 2.2 安装

```bash
# 在 Claude Code 中安装
/plugin marketplace add anthropics/claude-code-plugins
/plugin install feature-dev
```

### 2.3 7 阶段工作流程

| 阶段 | 阶段名 | 主要工作 |
|------|--------|----------|
| 1 | 发现 | 理解需求，明确问题 |
| 2 | 代码库探索 | 理解现有代码结构和约束 |
| 3 | 澄清问题 | 解决歧义，明确边界条件 |
| 4 | 架构设计 | 设计技术方案，确定实现路径 |
| 5 | 实现 | 编码实现功能 |
| 6 | 测试 | 编写和运行测试 |
| 7 | 代码审查 | 自我审查，确保代码质量 |

### 2.4 快速开始

```bash
# 启动 feature-dev
/feature-dev
# 或完整命令
/feature-dev-启动
```

### 2.5 阶段一：发现

在这个阶段，AI 会：
- 询问你要实现什么功能
- 了解业务背景
- 明确成功标准

**提示模板**：
```
我需要实现：[功能描述]
使用场景：[典型场景]
期望结果：[验收标准]
相关资源：[可选 - 文档链接/参考代码]
```

### 2.6 阶段二：代码库探索

AI 会：
- 自动探索项目结构
- 查找相关文件
- 理解现有架构和约束

**常见发现**：
- 现有 API 结构
- 数据库 schema
- 组件复用可能性
- 技术债务约束

### 2.7 阶段三：澄清问题

AI 会：
- 指出可能的歧义
- 问边界条件问题
- 确认需求细节

**常见问题**：
- 「极端情况 X 怎么处理？」
- 「是否需要向后兼容 Y？」
- 「性能需要达到什么级别？」

### 2.8 阶段四：架构设计

AI 会输出：
- 技术方案文档
- 文件修改清单
- 实现步骤

**设计文档结构**：
```
1. 方案概述
2. 文件变更
3. 实现步骤
4. 风险评估
5. 测试策略
```

### 2.9 阶段五：实现

AI 按计划编码：
- 修改文件
- 添加新代码
- 遵循项目规范

### 2.10 阶段六：测试

AI 会：
- 编写单元测试
- 运行现有测试
- 确保功能正常

### 2.11 阶段七：代码审查

AI 会：
- 自我审查代码
- 检查常见问题
- 建议优化改进

## 3. ralph-loop 详解

### 3.1 什么是 ralph-loop

ralph-loop 是 Claude Code 插件，让 AI **持续、自主地迭代完成任务**，解决了 Claude Code 「单次运行就停止」的限制。

**适用场景**：长时间任务、多个子任务、需要持续迭代的工作

### 3.2 安装

```bash
# 在 Claude Code 中安装
/plugin install ralph-loop
```

### 3.3 核心特性

| 特性 | 说明 |
|------|------|
| 持续迭代 | 任务不完成不停止 |
| 状态持久化 | 可以中断和恢复 |
| 进度可视化 | 实时查看当前进度 |
| 错误恢复 | 遇到错误自动重试或调整 |

### 3.4 基本使用

```bash
# 启动 ralph-loop
/ralph-loop

# 指定任务文件
/ralph-loop --tasks=tasks.md

# 指定最大迭代次数
/ralph-loop --max-iterations=20
```

### 3.5 任务文件格式

tasks.md 格式：
```markdown
# 任务清单

- [ ] 任务 1：修改 api/users.py
- [ ] 任务 2：添加新的 UserSerializer
- [ ] 任务 3：更新数据库模型
- [ ] 任务 4：编写单元测试
- [ ] 任务 5：运行测试并验证
```

每个任务完成后自动标记为 [x]。

### 3.6 与 feature-dev 结合

feature-dev 在阶段四会生成任务清单，直接可以给 ralph-loop 使用：

```bash
# 1. 先运行 feature-dev
/feature-dev
# ... 走完 4 个阶段后 ...

# 2. feature-dev 会生成 tasks.md
cat changes/2026-05-13-auth-module/tasks.md

# 3. 直接用 ralph-loop 执行
/ralph-loop --tasks=changes/2026-05-13-auth-module/tasks.md
```

## 4. GSD (Guidance) 详解

### 4.1 GSD 的两层含义

GSD 在 AI 编程语境中有两层含义：

| 含义 | 说明 |
|------|------|
| **Get Shit Done** | 实际把活干完（靠 ralph-loop） |
| **Guidance** | 提示词工程/规范驱动（靠 AGENTS.md / OpenSpec） |

### 4.2 Guidance 提示词工程

Guidance（或 GSD 框架）是通过结构化提示词来约束 AI 行为的方法，核心包括：

1. **角色定义**：明确 AI 的身份和能力边界
2. **输出格式**：要求 AI 按固定格式输出
3. **约束条件**：明确禁止和推荐的做法
4. **验证步骤**：要求 AI 自我验证

**提示词模板**：
```
你是一个资深 Python 后端开发。

## 约束条件
- 使用 Django 3.2 + DRF 3.12
- API 返回统一格式：{code, message, data}
- 禁止使用自增 ID，使用 UUID
- 代码必须经过 ruff 格式化

## 输出格式
每次修改前先输出：
```
<<FILE: 路径>>
<<ACTION: create/edit/delete>>
```
然后是代码内容。

## 验证步骤
修改后必须：
1. 运行 ruff format
2. 运行 pytest
3. 确认测试通过
```

### 4.3 与现有工具结合

GSD 理念在现有工具中的体现：

| 工具 | 对应 GSD 理念 |
|------|--------------|
| AGENTS.md | 项目级规范约束 |
| OpenSpec | 变更级工件管理 |
| Superpowers | 行为级 Skills 规范 |

**最佳实践**：三者同时使用，形成多层保障。

## 5. 完整协同工作流

### 5.1 端到端流程

```bash
# ┌─────────────────────────────────────────────────────────┐
# │  Step 1: 初始化环境                                      │
# └─────────────────────────────────────────────────────────┘
# 安装必需插件
/plugin marketplace add anthropics/claude-code-plugins
/plugin install feature-dev ralph-loop cc-best

# 确保有 AGENTS.md 或 OpenSpec 规范
ls AGENTS.md  # 或 ls openspec/

# ┌─────────────────────────────────────────────────────────┐
# │  Step 2: feature-dev 规划                                │
# └─────────────────────────────────────────────────────────┘
# 启动 7 阶段规划
/feature-dev

# 走完 7 个阶段后，会生成：
#   - changes/[date]-[name]/
#   -   proposal.md
#   -   design.md
#   -   tasks.md  ← ralph-loop 的输入

# ┌─────────────────────────────────────────────────────────┐
# │  Step 3: ralph-loop 执行                                 │
# └─────────────────────────────────────────────────────────┘
# 用 ralph-loop 执行任务清单
/ralph-loop --tasks=changes/2026-05-13-my-feature/tasks.md

# ralph-loop 会：
# 1. 读取规范（AGENTS.md / OpenSpec）
# 2. 逐个执行任务
# 3. 持续迭代直到完成

# ┌─────────────────────────────────────────────────────────┐
# │  Step 4: 验证和收尾                                      │
# └─────────────────────────────────────────────────────────┘
# 检查是否完成
ls changes/2026-05-13-my-feature/tasks.md
# 查看所有 [x] 已完成

# 运行测试
pytest

# 提交代码
git status
git add .
git commit -m "feat: 实现新功能（通过 feature-dev + ralph-loop）"
```

### 5.2 场景示例：用户认证模块开发

```bash
# 1. 启动 feature-dev
/feature-dev

# 输入需求：
> 我需要实现 JWT 用户认证，包含：
> - 注册
> - 登录
> - Token 刷新
> - 密码重置

# 2. feature-dev 走完 4 阶段后生成：
#    tasks.md 包含：
#    - [ ] 修改 models.py 添加 User 模型
#    - [ ] 添加 serializers.py
#    - [ ] 添加 views.py (登录/注册/刷新)
#    - [ ] 添加 urls.py
#    - [ ] 更新 settings.py
#    - [ ] 编写测试
#    - [ ] 运行 pytest

# 3. ralph-loop 执行
/ralph-loop --tasks=changes/2026-05-13-auth-module/tasks.md

# 4. ralph-loop 自动逐个完成任务，遇到问题自动调整
```

### 5.3 场景示例：快速修复 Bug

```bash
# 对于简单 Bug，可以跳过完整 feature-dev，直接给任务
# 创建 tasks.md
cat > tasks.md << EOF
- [ ] 修复 login API 的 500 错误
- [ ] 添加错误日志
- [ ] 编写回归测试
EOF

# 直接运行 ralph-loop
/ralph-loop --tasks=tasks.md
```

## 6. 与其他工具对比

### 6.1 feature-dev vs OpenSpec

| 维度 | feature-dev | OpenSpec |
|------|-------------|----------|
| 定位 | Claude Code 插件 | 通用 SDD 框架 |
| 阶段数 | 7 阶段 | 8 阶段 |
| 交互方式 | 引导式 | 斜杠命令 |
| 输出 | tasks.md 为主 | 完整工件集 |

**可以同时使用**：feature-dev 做快速开发，OpenSpec 做重要变更的完整追踪。

### 6.2 ralph-loop vs 手动执行

| 维度 | ralph-loop | 手动执行 |
|------|------------|----------|
| 速度 | 持续工作，不疲劳 | 需要人工介入 |
| 可靠性 | 不遗忘任务 | 可能漏步骤 |
| 可恢复 | 支持断点续传 | 需要手动记录进度 |
| 自主性 | 自动调整路径 | 人工决策 |

### 6.3 工具选择矩阵

| 场景 | 推荐工具组合 |
|------|--------------|
| 新功能开发 | feature-dev + ralph-loop + AGENTS.md |
| 重要架构变更 | OpenSpec + ralph-loop |
| 快速修复 | ralph-loop + tasks.md |
| 日常编码 | cc-best + Superpowers |
| 完整质量闭环 | OpenSpec + Superpowers + ralph-loop |

## 7. 最佳实践

### 7.1 任务分解原则

给 ralph-loop 的任务要：
- ✅ 每个任务有明确的「完成标准」
- ✅ 任务之间有逻辑顺序
- ✅ 每个任务不要太大（1-2 文件）
- ❌ 不要一个任务写整个功能

**好任务**：
```
- [ ] 在 models.py 添加 User 模型
- [ ] 在 serializers.py 添加 UserSerializer
```

**坏任务**：
```
- [ ] 实现用户认证模块
```

### 7.2 监控 ralph-loop

ralph-loop 运行时可以：
- 查看当前进度
- 暂停执行
- 调整任务
- 中断并保存状态

```bash
# 查看状态
/ralph-loop --status

# 暂停
[Ctrl+C]  # ralph-loop 会保存状态

# 恢复
/ralph-loop --resume
```

### 7.3 规范先行

先确保有规范（AGENTS.md / OpenSpec），再运行 feature-dev/ralph-loop。没有规范时先写规范。

```bash
# 如果没有 AGENTS.md，先生成
ask: "根据项目代码，生成一份 AGENTS.md 规范文件"
```

### 7.4 组合拳建议

| 场景 | 推荐组合 |
|------|----------|
| 新项目 | feature-dev 规划 → ralph-loop 执行 |
| 已有规范 | OpenSpec 管理变更 → ralph-loop 执行 |
| 质量敏感 | OpenSpec + Superpowers + ralph-loop |

## 8. 相关资源

| 资源 | 说明 |
|------|------|
| Claude Code 官方插件 | https://github.com/anthropics/claude-code-plugins |
| feature-dev 介绍 | 搜索 "Claude Code 炼金师: Feature-Dev 插件" |
| ralph-loop 原理 | 搜索 "Ralph 深度拆解" |
| OpenSpec | [24_OpenSpec.md](file:///Volumes/SN740/code/notebook/src/mybook/06_agents/03_AI-Coding实践/24_OpenSpec.md) |
| OpenSpec + Superpowers | [25_OpenSpec_Superpowers.md](file:///Volumes/SN740/code/notebook/src/mybook/06_agents/03_AI-Coding实践/25_OpenSpec_Superpowers.md) |

## 9. 快速参考卡片

```
┌──────────────────────────────────────────────────────────┐
│    feature-dev + ralph-loop + GSD 速查卡片                │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  feature-dev (7 阶段)                                     │
│  ─────────────────                                        │
│  /feature-dev         启动引导式开发                       │
│                                                           │
│  ralph-loop (执行)                                         │
│  ─────────────────                                        │
│  /ralph-loop              启动循环执行                     │
│  /ralph-loop --tasks=x.md 指定任务文件                     │
│  /ralph-loop --status     查看状态                         │
│  /ralph-loop --resume     恢复执行                         │
│                                                           │
│  GSD (规范)                                               │
│  ─────────                                                │
│  AGENTS.md              项目级规范                         │
│  OpenSpec               变更级规范                         │
│  Superpowers            行为级规范                         │
│                                                           │
│  完整工作流                                               │
│  ─────────                                               │
│  1. /feature-dev  (生成 tasks.md)                        │
│  2. /ralph-loop --tasks=tasks.md  (执行)                  │
│  3. 检查并提交                                           │
│                                                           │
└──────────────────────────────────────────────────────────┘
```
