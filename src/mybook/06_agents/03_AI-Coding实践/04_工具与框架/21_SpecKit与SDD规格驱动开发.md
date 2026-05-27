# GitHub Spec Kit 与规格驱动开发（SDD）

GitHub Spec Kit 是 GitHub 官方开源的规格驱动开发（Specification-Driven Development, SDD）工具集，核心理念是**规范即代码**——规范不再是写给人类看的散文，而是结构化的、可被 AI Agent 精确理解和执行的"意图代码"。

> 项目地址：https://github.com/github/spec-kit

---

## 一、SDD 核心思想：权力反转

### 1.1 传统开发 vs SDD

| 维度 | 传统开发 | SDD |
|------|---------|-----|
| 真理之源 | 代码是唯一真相 | 规范是唯一真相 |
| 文档地位 | 脚手架，用完即弃 | 核心资产，持续维护 |
| 需求变更 | 手动传播到文档→设计→代码 | 修改规范→自动重新生成 |
| 开发者角色 | 敲代码的打字员 | 定义意图的设计师与指挥家 |
| 调试 | 修代码 | 修规范和实现计划 |
| 重构 | 重构代码 | 重构规范的清晰度 |
| Pivot | 灾难性重写 | 系统性重新生成 |

### 1.2 为什么 SDD 现在才可能

1. **AI 能力到达阈值**：自然语言规范可可靠地生成工作代码
2. **软件复杂度指数增长**：手动保持各层对齐越来越难
3. **变化节奏加速**：Pivot 不再是例外而是常态

### 1.3 终结"氛围编程"（Vibe Coding）

氛围编程的灾难：随口给 AI 几句提示词，几秒生成几千行代码 → 代码结构混乱、难以维护、高并发的混乱制造厂。

SDD 的解法：给 AI 提供**边界和约束**——在写代码之前，先将模糊想法转化为清晰、无歧义的结构化规范。

---

## 二、SDD 工作流

```
/speckit.constitution → 定义项目宪法（原则与指南）
        ↓
/speckit.specify      → 定义规范（做什么 + 为什么）
        ↓
/speckit.clarify      → 澄清模糊点（可选，推荐在 plan 前）
        ↓
/speckit.plan         → 制定技术方案（如何做）
        ↓
/speckit.tasks        → 拆分可执行任务列表
        ↓
/speckit.implement    → 逐任务执行实现
        ↓
/speckit.analyze      → 交叉一致性分析（可选）
```

### 2.1 Constitution（项目宪法）

创建项目治理原则和开发指南，指导所有后续开发：

```
/speckit.constitution Create principles focused on code quality, 
testing standards, user experience consistency, and performance requirements
```

### 2.2 Specify（定义规范）

将功能描述转化为结构化规范，聚焦 **What** 和 **Why**，而非 How：

```
/speckit.specify Build a photo album organizer. Albums grouped by date, 
re-organized by drag-and-drop. No nested albums. Tile-like photo preview.
```

自动完成：
- 扫描已有 spec 确定下一个编号（001, 002, ...）
- 创建语义分支名
- 生成 `specs/[branch-name]/spec.md`

### 2.3 Plan（制定计划）

AI 将规范"编译"为详细技术方案：

```
/speckit.plan Vite + vanilla HTML/CSS/JS, images not uploaded, 
metadata in local SQLite
```

自动生成：
- `plan.md` — 技术实现计划
- `research.md` — 技术选型调研
- `data-model.md` — 数据模型
- `contracts/` — API 契约
- `quickstart.md` — 验证场景

### 2.4 Tasks（拆分任务）

从计划生成可执行任务列表：
- 独立任务标记 `[P]` 可并行
- 输出 `tasks.md` 供 Task Agent 执行

### 2.5 Implement（执行实现）

逐任务执行，按规范和计划生成代码。

---

## 三、核心原则

### 3.1 六大原则

| 原则 | 含义 |
|------|------|
| 规范即通用语言 | 规范是首要产物，代码是其在特定语言/框架中的表达 |
| 可执行规范 | 规范必须精确、完整、无歧义，足以生成工作系统 |
| 持续精炼 | 一致性验证持续进行，不是一次性门控 |
| 研究驱动上下文 | 研究代理持续收集技术选项、性能影响、组织约束 |
| 双向反馈 | 生产现实（指标/事件）反馈到规范演进 |
| 分支探索 | 从同一规范生成多种实现方案，探索不同优化目标 |

### 3.2 模板如何约束 LLM 产出更高质量

**防止过早实现细节**：spec 模板明确要求聚焦 What/Why，禁止 How（技术栈/API/代码结构）。

**强制显式不确定性标记**：`[NEEDS CLARIFICATION: specific question]`，防止 LLM 做出合理但可能错误的假设。

**结构化验收标准**：每个用户故事必须有可验证的验收条件。

---

## 四、Spec Kit 命令参考

### 4.1 核心命令

| 命令 | Agent Skill | 说明 |
|------|------------|------|
| `/speckit.constitution` | `speckit-constitution` | 创建/更新项目治理原则 |
| `/speckit.specify` | `speckit-specify` | 定义功能规范（需求+用户故事） |
| `/speckit.plan` | `speckit-plan` | 创建技术实现计划 |
| `/speckit.tasks` | `speckit-tasks` | 生成可执行任务列表 |
| `/speckit.taskstoissues` | `speckit-taskstoissues` | 转换为 GitHub Issues |
| `/speckit.implement` | `speckit-implement` | 执行所有任务构建功能 |

### 4.2 可选命令

| 命令 | Agent Skill | 说明 |
|------|------------|------|
| `/speckit.clarify` | `speckit-clarify` | 澄清模糊点（plan 前推荐） |
| `/speckit.analyze` | `speckit-analyze` | 交叉产物一致性与覆盖分析 |
| `/speckit.checklist` | `speckit-checklist` | 生成质量检查清单（"英语的单元测试"） |

---

## 五、安装与使用

### 5.1 安装

需要 [uv](https://docs.astral.sh/uv/)：

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@vX.Y.Z
```

### 5.2 初始化项目

```bash
specify init my-project --integration copilot
cd my-project
```

### 5.3 支持的 AI 编码工具

Spec Kit 支持 30+ AI 编码工具，包括：

| 类别 | 工具 |
|------|------|
| CLI | Claude Code, Codex CLI, Aider, Cline |
| IDE | GitHub Copilot, Cursor, Windsurf, Continue |
| 其他 | Junie, Lingma, Amazon Q |

运行 `specify integration list` 查看所有可用集成。

---

## 六、扩展与预设系统

### 6.1 优先级栈

| 优先级 | 组件类型 | 位置 |
|--------|---------|------|
| ⬆ 1（最高） | 项目本地覆盖 | `.specify/templates/overrides/` |
| 2 | Preset — 定制核心和扩展 | `.specify/presets/templates/` |
| 3 | Extension — 添加新能力 | `.specify/extensions/templates/` |
| 4（最低） | Spec Kit Core | `.specify/templates/` |

模板在**运行时**按优先级从高到低解析，使用第一个匹配。

### 6.2 Extension vs Preset

| 目标 | 使用 |
|------|------|
| 添加全新命令或工作流 | Extension |
| 定制 spec/plan/tasks 的格式 | Preset |
| 集成外部工具或服务 | Extension |
| 强制组织或法规标准 | Preset |

```bash
specify extension search       # 搜索扩展
specify extension add <name>   # 安装扩展
specify preset search          # 搜索预设
specify preset add <name>      # 安装预设
```

---

## 七、实战示例：聊天功能

### 传统方式 vs SDD

| 步骤 | 传统方式 | SDD + Spec Kit |
|------|---------|----------------|
| 写 PRD | 2-3 小时 | 5 分钟 `/speckit.specify` |
| 设计文档 | 2-3 小时 | 5 分钟 `/speckit.plan` |
| 项目结构 | 30 分钟 | 自动生成 |
| 技术规范 | 3-4 小时 | 自动生成 |
| 测试计划 | 2 小时 | 自动生成 |
| **总计** | **~12 小时** | **~15 分钟** |

```bash
# Step 1: 规范（5分钟）
/speckit.specify Real-time chat with message history and user presence

# Step 2: 计划（5分钟）
/speckit.plan WebSocket for messaging, PostgreSQL for history, Redis for presence

# Step 3: 任务（5分钟）
/speckit.tasks
```

15 分钟后你拥有：
- 完整功能规范（用户故事 + 验收标准）
- 详细实现计划（技术选型 + 理由）
- API 契约和数据模型
- 测试场景
- 所有文档在特性分支中版本化

---

## 八、SDD 的开发阶段

| 阶段 | 焦点 | 关键活动 |
|------|------|---------|
| 0→1 开发（Greenfield） | 从零生成 | 高层需求→规范→实现计划→生产级应用 |
| 创意探索 | 并行实现 | 多方案探索、多技术栈/架构、UX 模式实验 |

SDD 支持从同一规范生成多个并行实现（如性能优化版、可维护版、用户体验版），这是传统开发无法做到的。

---

## 九、与其他方法论对比

| 维度 | Vibe Coding | TDD | BDD | SDD |
|------|------------|-----|-----|-----|
| 驱动源 | 随意 prompt | 测试用例 | 行为场景 | 结构化规范 |
| 核心产物 | 代码 | 测试代码 | Gherkin 特性文件 | spec.md + plan.md |
| AI 角色 | 代码生成器 | 辅助写测试 | 辅助写场景 | 规范编译器 |
| 一致性 | 低 | 中 | 中高 | 高 |
| 可追溯性 | 无 | 测试→代码 | 场景→代码 | 需求→计划→任务→代码 |
| Pivot 成本 | 极高 | 高 | 中 | 低（修改规范→重新生成） |

---

## 十、SDD 的局限与挑战

1. **规范质量决定一切**：垃圾规范 → 垃圾代码，规范编写能力成为核心技能
2. **过度规范的风险**：规范太细等于用自然语言写代码，失去 AI 的灵活性
3. **现有代码库适配难**：SDD 最适合 Greenfield 项目，棕地项目需要逆向工程先建规范
4. **团队文化转变**：从"代码为王"到"规范为王"需要组织级变革
5. **AI 生成代码的审查**：仍需人类审查逻辑完整性、安全性和规范一致性
6. **规范维护成本**：规范需要与代码同步演进，否则比没有规范更糟
