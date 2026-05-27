# OpenSpec：规范驱动开发框架（SDD）

OpenSpec 是一个面向 AI 编程助手的规范驱动开发（Spec-Driven Development, SDD）开源框架，核心理念：**在写代码之前，先让人和 AI 在"要做什么"这个问题上达成共识**。

> 项目地址：https://github.com/Fission-AI/OpenSpec（36K Stars）

---

## 一、项目概览

| 项目信息 | 内容 |
|---------|------|
| 作者 | Fission AI |
| 最新版本 | v0.13.0 |
| 核心语言 | TypeScript |
| Node.js 要求 | ≥ 20.19.0 |
| 许可 | MIT |
| Stars | 36K+ |
| 核心定位 | 面向存量代码库的开发工具，专为在已有代码基础上开发的团队设计 |

---

## 二、解决的核心问题

| 传统 AI 编程痛点 | OpenSpec 解决方案 |
|-----------------|------------------|
| AI 靠"猜"需求，经常跑偏 | 先定义清晰的规范，再生成代码 |
| 需求描述模糊，导致反复修改 | 结构化的工作流确保需求明确 |
| 代码质量参差不齐，风格混乱 | 统一的代码风格和质量标准 |
| 聊天记录关掉后，设计决策丢失 | 规格文件提交到 Git，持久化上下文 |

---

## 三、设计哲学

OpenSpec 的 SDD 不是传统的瀑布式规范：

- **流动的**，不是死板的
- **迭代的**，不是瀑布式的
- **轻量的**，不是沉重的
- **为棕地项目设计**，不只是绿地项目
- **从个人项目到企业级**都能用

---

## 四、核心工作流

### 4.1 三阶段流程

```
提案（propose）→ 应用（apply）→ 归档（archive）
```

### 4.2 详细流程

```
你：/opsx:propose add-dark-mode

AI 自动创建：
openspec/changes/add-dark-mode/
├── proposal.md ← 为什么要做？改变什么？
├── specs/      ← 需求规格和使用场景
├── design.md   ← 技术方案设计
└── tasks.md    ← 实现任务清单
```

审查修改后：

```
你：/opsx:apply

AI 开始实现任务：
✓ 1.1 添加主题上下文 Provider
✓ 1.2 创建切换组件
✓ 2.1 添加 CSS 变量
✓ 2.2 对接 localStorage
全部任务完成！
```

```
你：/opsx:archive

AI 归档变更：
→ 已归档至 openspec/changes/archive/2025-01-23-add-dark-mode/
→ 规格已更新。准备下一个功能。
```

### 4.3 工件的依赖关系（DAG）

```
proposal ──→ specs ──→ design ──→ tasks
 │           │         │         │
 └───────────┴─────────┴─────────┘
   可以随时回来更新任何一个
```

工件形成有向无环图（DAG），依赖关系是**赋能器**而非门控器。

---

## 五、OPSX 命令全景

| 命令 | 作用 |
|------|------|
| `/opsx:propose` | 一键创建变更 + 生成规划工件（默认快速路径） |
| `/opsx:explore` | 头脑风暴、调研问题、澄清需求 |
| `/opsx:new` | 启动新的变更脚手架（扩展工作流） |
| `/opsx:continue` | 创建下一个工件（扩展工作流） |
| `/opsx:ff` | 快进生成规划工件（扩展工作流） |
| `/opsx:apply` | 实现任务，按需更新工件 |
| `/opsx:verify` | 对照工件验证实现（扩展工作流） |
| `/opsx:sync` | 同步增量规格到主规格 |
| `/opsx:archive` | 完成后归档 |
| `/opsx:bulk-archive` | 批量归档已完成的变更 |
| `/opsx:onboard` | 引导式端到端变更演练 |

---

## 六、为什么规格要放在代码库里

这是 OpenSpec 最有洞察力的设计决策之一：

其他工具只在规划阶段使用需求，然后就丢掉了。OpenSpec 将代码背后的功能需求保留为**活文档**——这样你永远知道代码**应该做什么**，而不只是它**现在在做什么**。

规格文件被提交到 Git，可以：

- 在 PR 中审查和 diff
- 作为新成员的入门文档
- 作为 AI Agent 的持久化上下文（不会因为聊天会话结束而消失）

---

## 七、安装

```bash
# npm 安装
npm install -g @fission-ai/openspec@latest

# pip 安装
pip install openspec

# conda 安装
conda install -c fission-ai openspec

# 从源码安装
git clone https://github.com/Fission-AI/OpenSpec.git
cd OpenSpec
pip install -e .
```

初始化项目：

```bash
openspec init
```

---

## 八、支持的 AI 编程工具

| 工具 | 支持状态 |
|------|---------|
| Cursor | ✅ 原生支持 |
| Claude Code | ✅ 原生支持 |
| Codex | ✅ 原生支持 |
| GitHub Copilot | ✅ 原生支持 |
| Gemini CLI | 即将支持 |
| Qwen Code | 即将支持 |

---

## 九、成本优势

| 指标 | 传统 AI 开发 | OpenSpec SDD |
|------|------------|-------------|
| 平均成本 | 8-15 美元 | ~2 美元 |
| 成本降低 | - | **75%-87%** |
| 降本原因 | - | 减少无效对话和重复生成，提升单次生成准确率 |

---

## 十、与 Spec Kit 对比

| 维度 | OpenSpec | GitHub Spec Kit |
|------|---------|----------------|
| 作者 | Fission AI | GitHub 官方 |
| 核心语言 | TypeScript | TypeScript |
| 安装方式 | npm/pip/conda | uv tool install |
| 工作流 | propose→apply→archive | constitution→specify→plan→tasks→implement |
| 棕地项目 | ✅ 专为存量代码库设计 | 更适合绿地项目 |
| 规格存储 | 代码库内 Git 管理 | specs/ 目录 |
| 扩展系统 | - | Extension + Preset |
| 哲学 | 流动、迭代、轻量 | 规范即代码、权力反转 |

---

## 十一、实战案例：厨房计时器

### Step 1：定义项目背景

在 `project.md` 中明确目标：开发简单高可见性厨房计时器，使用 HTML5+JS+CSS3 技术栈，包含 1/3/5 分钟快速计时按钮。

### Step 2：生成提案

使用 `/opsx:propose` 命令，AI 自动创建提案包：

- `proposal.md`：整体方案概述
- `design.md`：具体设计思路
- `tasks.md`：详细任务拆分
- `spec.md`：技术规范要求

### Step 3：审核并执行

审核提案后，使用 `/opsx:apply` 命令生成代码，因规范明确，代码几乎无需修改。

### Step 4：归档记录

完成后使用 `/opsx:archive` 归档，保存所有设计决策和实现细节。

---

## 十二、适用人群

- **全栈开发者**：需要快速实现完整功能模块
- **技术团队负责人**：希望统一团队的 AI 协作规范
- **个人开发者**：想要提升单兵作战效率
- **开源项目维护者**：需要规范贡献流程

---

## 十三、注意事项

1. **学习曲线**：需适应规范优先的思维方式
2. **环境依赖**：Node.js 20.19.0 或更高版本
3. **提示工程**：清晰的需求描述仍然重要
4. **工具兼容性**：不同 AI 编程助手效果可能存在差异
