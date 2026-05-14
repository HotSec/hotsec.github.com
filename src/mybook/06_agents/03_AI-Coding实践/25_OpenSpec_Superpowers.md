# OpenSpec + Superpowers：AI 编程双框架协同指南

## 1. 概述

### 1.1 为什么需要双框架

单一 AI 编程工具难以同时解决两个核心问题：

| 问题 | 表现 | 解决工具 |
|------|------|----------|
| **别跑偏** | 需求理解偏差、代码偏离原计划 | **OpenSpec** |
| **别乱写** | 代码不规范、行为不稳定、工程质量差 | **Superpowers** |

**OpenSpec** 管"需求和变更工件"，**Superpowers** 管"代理如何工作"。两者协同，实现从需求到代码的完整质量闭环。

### 1.2 核心定位对比

| 维度 | OpenSpec | Superpowers |
|------|----------|-------------|
| **GitHub** | fission-ai/openspec (28k ⭐) | obra/superpowers (153k ⭐) |
| **核心理念** | SDD 规范驱动开发 | Skills 行为规范框架 |
| **解决的问题** | 需求不清、实现偏离、变更无追溯 | AI 行为不稳定、代码质量差 |
| **关注点** | 工件管理（需求→规范→代码→验证） | 代理行为（如何读文件、如何改代码） |
| **工作方式** | 斜杠命令（`/opsx:*`） | YAML 配置文件 + Skills |

### 1.3 协同关系

```
┌─────────────────────────────────────────────────────────────┐
│                     OpenSpec（需求层）                        │
│  探索 → 提案 → 规范 → 设计 → 任务 → 执行 → 验证 → 归档       │
└──────────────────────────┬──────────────────────────────────┘
                           │ 产出规范文件
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Superpowers（执行层）                        │
│  读取规范 → 执行 Skill → 代码生成 → 自动验证                  │
└─────────────────────────────────────────────────────────────┘
```

**分工原则**：
- OpenSpec 负责"做什么"和"做到什么程度"
- Superpowers 负责"怎么做"和"做得规范"

## 2. Superpowers 详解

### 2.1 什么是 Superpowers

Superpowers 是一个专为 AI Coding 设计的软件开发工作流框架，通过**可组合的 Skills** 规范 AI 开发行为。

**GitHub**: https://github.com/obra/superpowers

### 2.2 核心概念

| 概念 | 说明 |
|------|------|
| **Skill** | 封装了特定行为的 YAML 配置文件，如 `READ_CODE_SKILL`、`EDIT_FILE_SKILL` |
| **Bundle** | 一组相关 Skills 的集合，如 `coding-agent`、`debugger` |
| **Profile** | 一组 Bundles 的组合，定义 AI 的完整能力集 |
| **Supermodel** | 预配置的 Profile，针对特定场景优化 |

### 2.3 安装

```bash
# 方式一：npm 安装
npm install -g @superpowers/superpowers

# 方式二：curl 安装
curl -fsSL https://superpowers.dev/install.sh | sh

# 验证安装
superpowers --version
```

### 2.4 快速开始

```bash
# 初始化项目
cd your-project
superpowers init

# 选择 Supermodel
superpowers select-model coding-agent

# 查看可用 Skills
superpowers list-skills

# 在 AI 编辑器中使用
# Superpowers 会自动读取 .superpowers/ 目录下的配置
```

### 2.5 内置 Bundles

| Bundle | 包含的 Skills | 用途 |
|--------|---------------|------|
| `coding-agent` | read_code, edit_file, search_replace, git_ops | 日常编码 |
| `debugger` | analyze_error, suggest_fix, write_test | 调试排错 |
| `reviewer` | code_review, security_scan, style_check | 代码审查 |
| `architect` | design_pattern, architecture_review | 架构设计 |

### 2.6 自定义 Skill 示例

```yaml
# .superpowers/skills/read-code-skill.yaml
name: read_code_skill
description: 安全地读取代码文件，避免路径遍历攻击

instructions: |
  当需要读取代码时：
  1. 验证文件路径在项目目录内
  2. 检查文件扩展名是否在允许列表中
  3. 使用受控的读取方法，禁止直接 eval/exec

safety_rules: |
  - 禁止读取 .env, .pem, *.key 等密钥文件
  - 禁止读取 /etc/, /root/ 等系统目录
  - 大文件（>1MB）需要分片读取

output_format: |
  返回格式：
  - 文件路径
  - 行数
  - 主要结构（类/函数列表）
  - 关键代码片段
```

## 3. 双框架协同工作流

### 3.1 完整开发流程

```
┌────────────────────────────────────────────────────────────┐
│ Phase 1: OpenSpec 规划阶段                                   │
│                                                            │
│ /opsx:new          → 创建变更目录                           │
│ /opsx:continue      → 生成 proposal.md                      │
│ /opsx:continue      → 生成 specs/ 规范                       │
│ /opsx:continue      → 生成 design.md 设计                   │
│ /opsx:continue      → 生成 tasks.md 任务                     │
└────────────────────────────┬───────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│ Phase 2: 规范写入 Superpowers                                │
│                                                            │
│ # 将 OpenSpec 规范转换为 Superpowers 配置                     │
│ superpowers import-specs openspec/specs/                    │
└────────────────────────────┬───────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│ Phase 3: Superpowers 执行阶段                                │
│                                                            │
│ superpowers run --task=tasks.md                            │
│                                                            │
│ AI 读取规范 → 按 Skills 执行 → 代码生成                      │
└────────────────────────────┬───────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│ Phase 4: OpenSpec 验证阶段                                   │
│                                                            │
│ /opsx:verify          → 验证代码是否符合规范                 │
│ /opsx:fix             → 修复发现的问题                      │
│ /opsx:sync            → 同步规范到主库                       │
│ /opsx:archive         → 归档变更                            │
└────────────────────────────────────────────────────────────┘
```

### 3.2 OpenSpec 规范导入 Superpowers

```bash
# 将 OpenSpec 的 specs/ 导入为 Superpowers 配置
superpowers import-specs openspec/specs/api-design.yaml

# 生成对应的 Skill 配置
superpowers generate-skill --from=api-design

# 查看生成的配置
cat .superpowers/skills/api-skill.yaml
```

生成的 Skill 示例：

```yaml
name: api_design_skill
description: API 设计规范（来自 OpenSpec）

imported_from: openspec/specs/api-design.yaml

rules:
  - 命名: RESTful 风格，资源用复数名词
  - 版本: URL 包含 /v1/, /v2/ 前缀
  - 错误: 统一使用 {code, message, data} 结构
  - 认证: Header 携带 Authorization

validation:
  - 接口命名是否符合规范
  - 错误码是否完整
  - 文档是否同步更新
```

### 3.3 场景一：复杂功能开发

**目标**：开发一个新的用户认证模块

#### Step 1: OpenSpec 规划

```bash
# 1. 探索需求
/opsx:explore
# 讨论：JWT vs Session、OAuth2 集成、密码加密方案

# 2. 创建变更
/opsx:new
# 生成 changes/2026-05-13-auth-module/

# 3. 逐步生成工件
/opsx:continue  # → proposal.md
/opsx:continue  # → specs/api.yaml, specs/database.yaml
/opsx:continue  # → design.md
/opsx:continue  # → tasks.md
```

#### Step 2: 导入规范到 Superpowers

```bash
# 将 OpenSpec 规范转换为 Superpowers Skills
superpowers import-specs changes/2026-05-13-auth-module/specs/

# 查看生成的 Skills
ls .superpowers/skills/
# api-skill.yaml
# database-skill.yaml
# security-skill.yaml
```

#### Step 3: Superpowers 执行

```bash
# 按任务清单执行
superpowers run --task=changes/2026-05-13-auth-module/tasks.md

# Superpowers 会：
# 1. 读取 api-skill.yaml 了解 API 规范
# 2. 按 tasks.md 逐个任务执行
# 3. 每步代码生成前检查规范
```

#### Step 4: OpenSpec 验证

```bash
# 验证代码是否符合规范
/opsx:verify

# 修复问题
/opsx:fix

# 同步规范
/opsx:sync

# 归档
/opsx:archive
```

### 3.4 场景二：快速迭代修复 Bug

**目标**：修复登录超时问题

```bash
# 1. OpenSpec 快速创建变更
/opsx:ff  # 快进生成工件

# 2. Superpowers 执行
superpowers run --skill=debugger

# 3. 验证并归档
/opsx:verify
/opsx:archive
```

### 3.5 场景三：团队规范建设

```bash
# 1. 项目启动时建立主规范库
/opsx:new --name=project-standards
# 在 specs/ 中定义：
#   - code-style.yaml（代码风格）
#   - api-design.yaml（API 设计）
#   - git-workflow.yaml（Git 工作流）

# 2. 导入到 Superpowers
superpowers import-specs openspec/specs/

# 3. 所有后续开发遵循规范
# 每次新变更自动继承主规范
```

## 4. OpenSpec 命令参考

| 命令 | 阶段 | 功能 |
|------|------|------|
| `/opsx:explore` | 探索 | 只读讨论，不生成文件 |
| `/opsx:new` | 规划 | 创建新变更目录 |
| `/opsx:continue` | 规划 | 逐步生成工件 |
| `/opsx:ff` | 规划 | 快进生成所有工件 |
| `/opsx:apply` | 执行 | 按任务清单写代码 |
| `/opsx:verify` | 验证 | 一致性检查 |
| `/opsx:sync` | 同步 | 合并规范到主库 |
| `/opsx:archive` | 归档 | 归档已完成变更 |

## 5. Superpowers 命令参考

| 命令 | 功能 |
|------|------|
| `superpowers init` | 初始化项目配置 |
| `superpowers list-skills` | 列出可用 Skills |
| `superpowers list-bundles` | 列出可用 Bundles |
| `superpowers select-model <model>` | 选择 Supermodel |
| `superpowers run --task=<file>` | 按任务文件执行 |
| `superpowers run --skill=<name>` | 执行指定 Skill |
| `superpowers import-specs <path>` | 导入 OpenSpec 规范 |
| `superpowers export-config` | 导出当前配置 |

## 6. 最佳实践

### 6.1 分工明确

| 交给 OpenSpec | 交给 Superpowers |
|---------------|------------------|
| 需求分析 | 代码格式化 |
| 规范定义 | Git 操作规范 |
| 任务拆分 | 文件操作安全 |
| 变更追踪 | 测试生成 |
| 规范同步 | 代码审查 |

### 6.2 规范冲突处理

当 OpenSpec 规范与 Superpowers Skills 冲突时：

1. **OpenSpec 优先**：OpenSpec 定义的业务规范具有最终决定权
2. **Superpowers 补充**：Superpowers 负责代码质量和安全规范
3. **显式声明**：在 `specs/README.md` 中明确规范优先级

### 6.3 团队协作建议

```bash
# 1. 统一规范库
openspec/specs/          # 项目级规范
├── code-style.yaml      # 代码风格
├── api-design.yaml      # API 设计
├── security.yaml        # 安全规范
└── README.md            # 规范索引

# 2. 统一 Superpowers 配置
.superpowers/
├── skills/              # 共享 Skills
├── bundles/             # 共享 Bundles
└── config.yaml          # 团队配置

# 3. CI/CD 集成
# 在 PR 检查中验证 OpenSpec 规范符合性
superpowers validate --specs=openspec/specs/
```

## 7. 相关资源

| 资源 | 链接 |
|------|------|
| OpenSpec GitHub | https://github.com/fission-ai/openspec |
| Superpowers GitHub | https://github.com/obra/superpowers |
| OpenSpec 官网 | https://openspec.dev |
| Superpowers 官网 | https://superpowers.dev |
| Superpowers Marketplace | https://marketplace.superpowers.dev |
| Superpowers Chrome | https://github.com/obra/superpowers-chrome |
| Superpowers Lab | https://github.com/obra/superpowers-lab |

## 8. OpenSpec 与其他工具对比

### 8.1 OpenSpec vs GSD

| 维度 | OpenSpec | GSD (Guidance) |
|------|----------|----------------|
| 定位 | 需求管理框架 | 提示词工程框架 |
| 工作方式 | 斜杠命令交互 | Python 提示词库 |
| 输出 | 工件文件 | 结构化输出 |

**OpenSpec + GSD**：前者固定规格，后者解决 context rot 和阶段化执行

### 8.2 Superpowers vs Agent 框架

| 维度 | Superpowers | LangChain/LangGraph |
|------|-------------|---------------------|
| 定位 | 行为规范层 | 流程编排层 |
| 抽象级别 | Skill（行为单元） | Action/Node（流程节点） |
| 核心价值 | 规范 AI 行为 | 定义执行流程 |

**Superpowers + OMC**：前者负责编排，后者补工程纪律

### 8.3 工具协同矩阵

| 需求 | 推荐组合 |
|------|----------|
| 需求变更管理 | OpenSpec |
| 代码质量控制 | Superpowers |
| 快速原型开发 | OpenSpec + Superpowers |
| 复杂工作流 | Superpowers + LangGraph |
| 团队规范建设 | OpenSpec + Superpowers + AGENTS.md |
