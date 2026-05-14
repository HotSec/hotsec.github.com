# OpenSpec：AI 辅助开发的结构化工作流（SDD）

> 来源：[OpenSpec 完整使用流程笔记（SDD）](https://juejin.cn/post/7615455795724648483)

OpenSpec 是一个 AI 辅助开发的结构化工作流工具，通过斜杠命令（`/opsx:`）引导开发者与 AI 协作，从需求探索、规划、编码到验证、归档，每一步清晰可控。核心思想是 **"先约定，后编码"**——写代码前先与 AI 共同明确需求、设计规范、拆解任务；实现后再验证是否符合约定，最后归档变更形成可追溯的历史记录。

## 安装与初始化

```bash
npm install -g @fission-ai/openspec@latest
cd your-project
openspec init
```

初始化后创建 `openspec/`、`changes/` 等目录结构和配置文件。

## 启用完整工作流

默认只启用核心命令（4 个），完整功能（11 个命令）需切换配置：

```bash
openspec config profile    # 选择 Expanded Profile
openspec update            # 刷新配置
# 重启 AI 编辑器使斜杠命令生效
```

## 核心概念

| 概念 | 说明 |
|------|------|
| 变更（Change） | 一次独立的开发任务，对应一个需求或功能点，在 `changes/` 下拥有独立目录 |
| 工件（Artifact） | 变更过程中的产出物：提案、规范、设计、任务清单、代码实现、验证报告等 |
| 规范（Specs） | 项目全局或模块的设计约定，存储在 `openspec/specs/`，可被多个变更共享 |
| 快进（Fast-forward） | 一次性生成规划阶段的所有工件，跳过逐步创建的中间步骤 |

## 六阶段流程

### 1. 探索阶段：`/opsx:explore`

与 AI 进行纯粹讨论，分析需求、调研技术方案、梳理潜在风险。

- AI 进入"只读模式"，不创建任何文件，只生成讨论性回答
- 适用场景：需求模糊、技术选型不确定、需要头脑风暴

### 2. 规划阶段：从想法到任务清单

#### 启动新变更：`/opsx:new`

在 `changes/` 下创建以时间戳命名的新目录，生成基础文件框架（`proposal.md`、`tasks.md` 等占位文件）。

#### 逐步完善：`/opsx:continue`

根据当前变更进度，生成下一个缺失的工件。已有 `proposal.md` 则生成 `specs/`；再运行生成 `design.md`；再运行生成 `tasks.md`。每步可审查修改。

#### 快速完成：`/opsx:ff`（快进）

一次性生成 `proposal.md`、`specs/`、`design.md`、`tasks.md`。适合需求清晰、变更范围小的场景。

**规划阶段产出物**：

| 产出物 | 说明 |
|--------|------|
| proposal.md | 变更的背景、目标、验收标准 |
| specs/ | 详细规范（接口设计、数据结构、UI 约定等） |
| design.md | 技术设计方案（模块划分、关键算法、依赖等） |
| tasks.md | 拆解后的可执行任务清单（带复选框） |

### 3. 执行阶段：`/opsx:apply`

AI 读取 `tasks.md`，逐个任务生成代码，放到项目正确位置。每完成一个任务可确认或中断修改任务清单后继续。

### 4. 验证阶段：`/opsx:verify`

AI 分析代码，对照 `specs/` 和 `design.md` 进行一致性检查，生成验证报告（`verify-report.md`），指出符合项、不符合项、潜在问题和建议修复方案。发现问题可修改后再次运行。

### 5. 同步规范：`/opsx:sync`

将变更中新增或修改的规范文件从 `changes/<change>/specs/` 合并到 `openspec/specs/` 主规范库。变更仍处于活跃状态，可继续开发。

### 6. 归档阶段

#### 单个归档：`/opsx:archive`

- 将变更从 `changes/active/` 移到 `changes/archived/`
- 自动执行一次 `sync` 确保规范已合并
- 更新 `CHANGELOG.md`，标记变更状态为"已完成"

#### 批量归档：`/opsx:bulk-archive`

列出所有可归档的活跃变更，多选后依次归档，自动检测规范冲突并提示手动解决。

## 命令速查表

| 命令 | 阶段 | 功能 |
|------|------|------|
| `/opsx:explore` | 探索 | 只读模式讨论需求，不生成文件 |
| `/opsx:new` | 规划 | 创建新变更目录及基础文件 |
| `/opsx:continue` | 规划 | 按进度生成下一个工件 |
| `/opsx:ff` | 规划 | 快进：一次性生成所有规划工件 |
| `/opsx:apply` | 执行 | 根据任务清单编写代码 |
| `/opsx:verify` | 验证 | 检查代码是否符合规范，生成报告 |
| `/opsx:sync` | 同步 | 将变更中的规范合并到主规范库 |
| `/opsx:archive` | 归档 | 归档单个已完成变更 |
| `/opsx:bulk-archive` | 归档 | 批量归档多个变更 |
| `/opsx:onboard` | 学习 | 交互式教程（约15分钟） |

## 典型场景

### 复杂功能开发（逐步推进）

1. `/opsx:explore` → 讨论需求、技术选型
2. `/opsx:new` → 创建变更
3. `/opsx:continue` × 4 → 逐步生成 proposal → specs → design → tasks，每步审阅
4. `/opsx:apply` → 执行任务清单
5. `/opsx:verify` → 验证一致性，修复问题
6. `/opsx:sync` → 合并规范到主库
7. `/opsx:archive` → 归档变更

### 小型快速迭代

1. `/opsx:ff` → 快进生成所有规划工件
2. `/opsx:apply` → 编码
3. `/opsx:verify` → 验证
4. `/opsx:archive` → 归档

### 规范先行，团队协作

项目启动时通过 `explore` 和 `new` 建立全局规范（代码风格、API 设计原则），存放在 `openspec/specs/`。后续每个功能变更从主规范派生，开发完成后通过 `sync` 更新主规范，确保团队知识库同步。

## 常见问题

- **命令不显示**：确保运行 `openspec update`，重启编辑器，检查 `.openspec/` 和 `openspec/` 文件夹存在
- **`ff` vs `continue`**：`ff` 一次性生成所有工件，适合需求明确；`continue` 逐个生成，适合需逐步审阅的高风险变更
- **`sync` vs `archive`**：`sync` 只合并规范，变更仍活跃；`archive` 归档前自动执行 `sync`，然后归档变更
