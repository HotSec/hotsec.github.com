# OpenCode & Claude Code 使用教程与最佳实践

终端 AI 编程工具的两大生态：OpenCode（开源多模型）和 Claude Code（Anthropic 官方），各自拥有丰富的插件和框架生态。本文系统整理两者的使用教程、多 Agent 编排方案、结构化工作流及最佳实践。

---

## 一、工具概览与对比

| 维度 | OpenCode | Claude Code |
|------|----------|-------------|
| 定位 | 开源终端 AI 编程助手 | Anthropic 官方终端 AI 编码工具 |
| 费用 | 按 API 用量（可用免费模型） | 订阅制 |
| 模型支持 | 75+ 提供商（OpenAI/Anthropic/Ollama 等） | 仅 Anthropic |
| 核心模式 | Plan / Build 双模式（Tab 切换） | 单会话 + 插件扩展 |
| 多 Agent 插件 | oh-my-opencode（OmO，11 Agent） | oh-my-claudecode（OMC，19 Agent） |
| 开源 | ✅ | ❌ |
| 上手难度 | 中（需配置 API Key） | 低 |

| 场景 | 推荐 |
|------|------|
| 多模型切换、成本敏感 | OpenCode |
| 开箱即用、深度 Anthropic 集成 | Claude Code |
| 多 Agent 协作 | 两者均可（OmO / OMC） |
| 本地模型 / 离线场景 | OpenCode + Ollama |

两者都属于 Agentic Coding 工具：不只是补全代码，而是在本地项目中读取上下文、修改文件、运行命令、形成可审查 diff。实践上可以把它们放进同一套流程：项目规则（AGENTS.md / CLAUDE.md）→ 计划 → 小步实现 → 验证 → 审查。

---

## 二、OpenCode 生态

### 2.1 OpenCode 基础

开源终端 AI 编程助手，支持 75+ 模型提供商。

**核心理念**：
- 终端优先：在项目目录里直接运行，文件修改实时生效
- Plan / Build 双模式：按 `Tab` 键切换 Plan 模式（只分析不改代码）和 Build 模式（全权限执行）
- 提供商无关：不锁定任何单一模型，自由切换

```bash
curl -fsSL https://opencode.ai/install | bash
cd your-project
opencode
```

### 2.2 oh-my-opencode（OmO）插件

给 OpenCode 装上多 Agent 协作能力的改装套件。核心思路：不同任务用不同模型，不同角色用不同 Agent。

```bash
bunx oh-my-opencode install
```

项目地址：[github.com/code-yeongyu/oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)

#### 11 个专职 Agent

| 层级 | Agent | 角色 | 职责 |
|------|-------|------|------|
| 规划 | Prometheus | 战略规划师 | Interview 模式：先问问题梳理需求，再生成详细计划 |
| 规划 | Metis | 计划顾问 | 对计划进行风险评估和补充 |
| 规划 | Momus | 计划批评者 | 专门挑毛病，查漏补缺 |
| 编排 | Sisyphus | 主编排者 | 日常任务总指挥，分解目标、调度 Agent，不达目标不罢休 |
| 编排 | Atlas | 计划执行引擎 | 把 Prometheus 的计划逐步推进，用 `boulder.json` 追踪进度，支持跨 Session 恢复 |
| 执行 | Hephaestus | 深度执行者 | 自主探索代码库，端到端完成任务 |
| 专项 | Oracle | 架构分析 + 调试 | 架构问题定位与调试 |
| 专项 | Librarian | 文档搜索 + 代码查找 | 快速检索文档和代码 |
| 专项 | Explore | 快速只读 grep | 轻量级代码库搜索 |
| 专项 | Multimodal Looker | 图像/视觉理解 | 处理截图、UI 等视觉输入 |
| 专项 | Sisyphus-Junior | 轻量备用编排者 | 小规模任务的编排代理 |

**关键设计**：规划和执行严格分离。Prometheus 只问不写，Atlas 只执行不质疑，避免"边想边改、越改越乱"。

#### 与 OpenSpec 的关系

OmO 解决“谁来做、如何分工、如何执行”的问题；OpenSpec 解决“要做什么、做到什么程度、验收标准是什么”的问题。复杂任务推荐先用 OpenSpec 或 Prometheus 形成规范和计划，再交给 Atlas / Hephaestus 执行。

#### Hashline 技术（哈希锚定编辑）

解决 AI 编辑代码时"改错行"的问题：每一行打上内容哈希标签，Agent 编辑时必须引用标签，哈希不匹配则编辑被拒绝。

```
11#VK| function hello() {
22#XJ| return "world";
33#MB| }
```

效果：某测试集的编辑成功率从 **6.7% 提升到 68.3%**。

#### 任务路由：模型与任务自动匹配

Sisyphus 委派任务时不选具体模型，而是选"类别"，系统自动匹配：

| 类别 | 适用场景 |
|------|---------|
| visual-engineering | 前端 · UI · 设计 |
| deep | 研究 · 自主执行 |
| quick | 单文件 · 小改动 |
| ultrabrain | 复杂逻辑 · 架构决策 |

#### 内置工具与 MCP

| 类型 | 工具 | 用途 |
|------|------|------|
| 工具 | LSP Tools | 代码重命名、跳转定义、引用查找、诊断 |
| 工具 | AST-Grep | 25 种语言的语法感知代码搜索和重写 |
| 工具 | Tmux 集成 | Agent 在真实交互终端里跑 REPL、调试器 |
| 工具 | IntentGate | 执行前分析用户真实意图，避免字面误解 |
| MCP | Exa | 实时网络搜索 |
| MCP | Context7 | 官方文档检索 |
| MCP | Grep.app | 跨 GitHub 代码搜索 |

#### 快速上手

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

---

## 三、Claude Code 生态

### 3.1 Claude Code 基础

Anthropic 推出的终端 AI 编码工具，直接在命令行中运行。

```bash
npm install -g @anthropic-ai/claude-code
cd your-project
claude
```

**CLAUDE.md 配置**：项目根目录放置 `CLAUDE.md`，Claude Code 启动时自动读取。

```markdown
# 项目：MyApp

## 技术栈
Go 1.22 / Gin / PostgreSQL / Redis

## 编码规范
- 错误处理使用 fmt.Errorf("module: %w", err)
- Context 作为第一个参数
- 禁止全局状态
- 表驱动测试

## 常用命令
- 构建：make build
- 测试：make test
- Lint：make lint

## 项目结构
cmd/          # 入口
internal/     # 私有代码
  handler/    # HTTP 处理器
  service/    # 业务逻辑
  repo/       # 数据访问
pkg/          # 公共库
```

#### 推荐基础工作流

1. **初始化上下文**：先让 Claude Code 阅读项目结构、README、CLAUDE.md / AGENTS.md 和相关测试。
2. **Plan Mode 先行**：中大型任务先要求只读分析和计划，确认后再执行。
3. **小步实现**：一次聚焦一个行为面，避免跨模块大范围重写。
4. **验证优先**：每轮改动后运行项目指定测试或构建命令。
5. **更新记忆**：重复出现的约束写回 CLAUDE.md、Skill 或团队文档。

### 3.2 oh-my-claudecode（OMC）

为 Claude Code 打造的多 Agent 编排层，将单一会话升级为由 19 个专用 Agent 组成的协同系统。

项目地址：[github.com/yeachan-heo/oh-my-claudecode](https://github.com/yeachan-heo/oh-my-claudecode)

#### 四大架构支柱

| 支柱 | 定位 | 核心能力 |
|------|------|---------|
| **Hooks** | 第一层入口（事件拦截） | ~20 个生命周期钩子，检测魔法关键词（`ralph`/`ulw`/`autopilot`）、强制模式、注入质量门禁；声明式 `hooks.json` + Node.js 脚本，5s 时间预算 |
| **Skills** | 行为注入与路由决策 | 自包含行为模块：注入系统指令、添加约束、定义路由逻辑；内置编排类（autopilot/ralph/ultrawork/team）、实用类（ask/trace/verify）、记忆类（learner/remember）；自定义路径 `.omc/skills/` |
| **Agents** | 19 个专用执行角色 | 按泳道划分（见下表）；每个 Agent 精选模型层级 + 受限工具集 + 角色提示词 |
| **State** | 状态与记忆 | boulder 状态机（进度追踪）、notepad wisdom（跨会话经验）、会话摘要（防 token 失忆）、回放日志（调试复盘） |

Hooks 适合做自动化门禁，例如检测危险命令、阻止遗漏验证、提示补充上下文。Skills 适合固化“调试必须先复现”“完成前必须验证”“代码审查优先找 bug”这类行为规则。Agents 则负责把探索、实现、审查、验证拆给不同角色。

#### 19 个 Agent 泳道划分

| 泳道 | Agent 列表 | 主要职责 |
|------|-----------|---------|
| 构建/分析 | `explore`, `analyst`, `planner`, `architect`, `debugger`, `executor`, `verifier`, `tracer` | 从代码探索、方案分析到实现、调试、验证的完整开发链路 |
| 审查 | `security-reviewer`, `code-reviewer` | 安全审查、API 契约、向后兼容性等质量门禁 |
| 领域 | `test-engineer`, `designer`, `writer`, `qa-tester`, `scientist`, `git-master`, `document-specialist`, `code-simplifier` | 测试、设计、文档、数据科学、Git 操作、代码简化等专业方向 |
| 协调 | `critic` | 负责"唱反调"：质疑计划与设计，只在找不到缺陷时放行 |

#### 模型路由策略

| 模型 | 适用场景 | 典型 Agent |
|------|---------|-----------|
| haiku | 速度与成本优先 | `explore`、`writer` |
| sonnet | 默认工作马 | `executor`、`debugger`、`test-engineer` |
| opus | 高价值深度推理 | `architect`/`planner`、`critic`/`code-reviewer` |

相比"所有请求都走最贵模型"，预计节省 30–50% token 成本。

#### 六大编排模式

| 模式 | 策略特点 | 典型场景 |
|------|---------|---------|
| **Team**（推荐） | 分阶段流水线：计划 → PRD → 执行 → 验证 → 修复循环 | 多子任务协同类特性开发 |
| CCG | Codex + Gemini + Claude 三模型综合 | 需要多模型视角的复杂任务 |
| Autopilot | 单主导 Agent，自主端到端执行 | 流程简单但工作量较大的开发 |
| Ultrawork | 最大化并行度，减小管理开销 | 大规模并行修复/重构 |
| Ralph | 带验证/修复循环的持久执行 | 必须保证"真正做完"的任务 |
| Ralplan | 规划优先，迭代达成共识后才执行 | 核心架构变更等需详细设计的复杂特性 |

**Team 模式流程**：`planner`/`architect` 分析需求 → `writer`/`designer` 搭建 PRD → `executor` 分阶段实现 → `verifier`/`qa-tester`/`critic` 质量闭环

> 需在 `~/.claude/settings.json` 中启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`

#### 安装与使用

**Claude Code 插件**：

```bash
/plugin marketplace add    # 添加插件源
/plugin install            # 安装 oh-my-claudecode
```

获得：斜杠命令（`/autopilot`、`/ralph`、`/team`）、Agent 和 Skills 能力、HUD 状态栏、MCP 工具集成。

**终端 CLI**：

```bash
npm i -g oh-my-claude-sisyphus@latest
omc setup          # 引导配置
omc team           # Team 模式发起多 Agent 任务
omc ask            # 一次性问答或分析
omc autoresearch   # 自动化调研
omc wait           # 等待长任务完成
```

两者共享 `~/.claude/omc.jsonc` 配置文件和 `.omc/` 状态目录。

### 3.3 feature-dev + ralph-loop + GSD

Claude Code 生态中的黄金组合，三者分工明确：

| 工具 | 定位 | 职责 |
|------|------|------|
| **feature-dev** | 规划层 | 7 阶段系统化功能开发，"做对的事" |
| **ralph-loop** | 执行层 | 长时间自主循环执行，"把事做完" |
| **GSD** | 保障层 | 提示词工程/规范驱动，"把事做好" |

#### feature-dev：7 阶段工作流

```bash
/plugin marketplace add anthropics/claude-code-plugins
/plugin install feature-dev
/feature-dev
```

| 阶段 | 名称 | 主要工作 |
|------|------|---------|
| 1 | 发现 | 理解需求，明确问题 |
| 2 | 代码库探索 | 理解现有代码结构和约束 |
| 3 | 澄清问题 | 解决歧义，明确边界条件 |
| 4 | 架构设计 | 设计技术方案，确定实现路径 |
| 5 | 实现 | 编码实现功能 |
| 6 | 测试 | 编写和运行测试 |
| 7 | 代码审查 | 自我审查，确保代码质量 |

需求提示模板：
```
我需要实现：[功能描述]
使用场景：[典型场景]
期望结果：[验收标准]
相关资源：[可选 - 文档链接/参考代码]
```

#### ralph-loop：持续执行

```bash
/plugin install ralph-loop
/ralph-loop                        # 启动循环执行
/ralph-loop --tasks=tasks.md       # 指定任务文件
/ralph-loop --max-iterations=20    # 最大迭代次数
/ralph-loop --status               # 查看状态
/ralph-loop --resume               # 恢复执行（Ctrl+C 暂停后）
```

任务文件格式（feature-dev 阶段四生成的 tasks.md 可直接使用）：
```markdown
- [ ] 任务 1：修改 api/users.py
- [ ] 任务 2：添加新的 UserSerializer
- [ ] 任务 3：更新数据库模型
- [ ] 任务 4：编写单元测试
- [ ] 任务 5：运行测试并验证
```

#### GSD：规范保障

GSD 双重含义：**Get Shit Done**（靠 ralph-loop 把活干完）+ **Guidance**（靠 AGENTS.md / OpenSpec 规范驱动）。

GSD 理念在现有工具中的体现：

| 工具 | 对应 GSD 层面 |
|------|-------------|
| AGENTS.md | 项目级规范约束 |
| OpenSpec | 变更级工件管理 |
| Superpowers | 行为级 Skills 规范 |

#### 完整协同工作流

```bash
# 1. 安装插件
/plugin marketplace add anthropics/claude-code-plugins
/plugin install feature-dev ralph-loop

# 2. feature-dev 规划（7 阶段，生成 tasks.md）
/feature-dev

# 3. ralph-loop 执行
/ralph-loop --tasks=changes/2026-05-13-my-feature/tasks.md

# 4. 验证和收尾
pytest
git add .
git commit -m "feat: 实现新功能（通过 feature-dev + ralph-loop）"
```

---

## 四、通用工作流框架

以下框架解决的是同一类问题：**不要把复杂开发任务直接扔给 Agent，而是先建立规范、计划、任务和验证闭环**。它们可以叠加在 Claude Code、Codex、OpenCode、Cursor、Cline、Windsurf 等工具之上。

### 4.1 OpenSpec：变更级 Spec 工件管理

OpenSpec 是轻量级 Spec-Driven Development（SDD）框架，核心思想是：每次变更都先生成可审查工件，再让 Agent 按工件实现。它更像“变更管理层”，不是新的编码 Agent。

```bash
npm install -g @fission-ai/openspec@latest
cd your-project
openspec init
openspec update

# 如需启用 expanded workflow
openspec config profile
openspec update
```

#### 核心概念

| 概念 | 说明 |
|------|------|
| Change | 一次独立变更，位于 `openspec/changes/<change-name>/` |
| Artifact | proposal、specs、design、tasks 等变更工件 |
| Specs | 项目长期规范，位于 `openspec/specs/` |
| Archive | 完成后的变更归档，保留审计线索 |
| Profile | 控制可用命令集合，默认 `core`，可切换 expanded workflow |

#### 推荐流程

| 阶段 | 命令 | 说明 |
|------|------|------|
| 探索 | `/opsx:explore` | 需求不清时先讨论和读代码，不生成工件 |
| 快速规划 | `/opsx:propose add-dark-mode` | 默认 core 路径，一步生成变更所需规划工件 |
| 分步规划 | `/opsx:new` → `/opsx:continue` | expanded 路径，适合每个工件都要审查的大变更 |
| 快进规划 | `/opsx:ff` | expanded 路径，一次生成 proposal/specs/design/tasks |
| 实现 | `/opsx:apply` | 读取 `tasks.md`，逐项实现并勾选任务 |
| 验证 | `/opsx:verify` | expanded 路径，检查实现是否符合工件 |
| 同步 | `/opsx:sync` | 将 delta specs 合并到主规范 |
| 归档 | `/opsx:archive` | 归档完成变更，保留工件历史 |

#### 适合场景

- 多模块功能，需要明确需求、设计、任务和验收。
- Brownfield 项目，需要变更记录和规范同步。
- 多 Agent 协作前，需要统一“做什么”和“做到什么程度”。
- 团队希望把需求讨论沉淀成可审查 Markdown，而不是只存在聊天记录里。

#### 不适合场景

- 一两行小修复。
- 需求还处在纯探索阶段，连目标都没定。
- 团队不愿维护 spec 工件，最后只会产生过期文档。

### 4.2 Superpowers：行为级 Skills 方法论

Superpowers 是一套面向 coding agents 的软件工程方法论。它不直接定义产品需求，而是通过可组合 Skills 约束 Agent 的行为：先澄清、再设计、再计划、再 TDD、再审查、最后验证。

GitHub: https://github.com/obra/superpowers

安装方式按 Agent 平台不同而不同：Claude Code 可通过插件市场安装，Codex 可通过插件界面安装，OpenCode 有单独安装说明。

#### 核心概念

| 概念 | 说明 |
|------|------|
| Skill | 一个可触发的行为流程，如 TDD、系统化调试、代码审查 |
| Methodology | 贯穿完整开发链路的协作方式，而不是单个 Prompt |
| Subagent-driven development | 用子代理实现任务、再由主会话审查和集成 |
| Verification before completion | 完成前必须运行验证命令，不用“应该可以”代替证据 |

#### 典型 Skills

| Skill | 解决问题 |
|-------|----------|
| brainstorming | 防止一上来就写代码，先澄清目标和设计 |
| writing-plans | 把设计拆成可执行、可验证的小任务 |
| test-driven-development | 强制 RED-GREEN-REFACTOR，避免先写实现后补测试 |
| systematic-debugging | 先复现和定位根因，避免猜测式修 bug |
| requesting-code-review | 以缺陷和风险为中心做审查 |
| subagent-driven-development | 子代理分工执行，主会话做集成审查 |
| verification-before-completion | 完成前运行验证并读取结果 |

#### 适合场景

- 团队已经有 AGENTS.md / CLAUDE.md，但 Agent 仍然执行混乱。
- 希望把“先测试、再实现、最后验证”变成硬流程。
- 长任务需要子代理、审查和收尾，而不是单会话一路写到底。
- 想把个人经验变成可复用 Skill。

#### 注意点

Superpowers 会增加流程约束和上下文开销。对简单任务，它可能显得重；对复杂任务，它的价值在于减少返工和失控。

### 4.3 OpenSpec + Superpowers 双框架协同

| 问题 | 表现 | 解决工具 |
|------|------|----------|
| **别跑偏** | 需求理解偏差、代码偏离原计划 | **OpenSpec**（需求层：做什么、做到什么程度） |
| **别乱写** | 代码不规范、行为不稳定、工程质量差 | **Superpowers**（执行层：怎么做、做得规范） |

**协同流程**：

1. OpenSpec 规划：`/opsx:explore` → `/opsx:propose`，生成 proposal/specs/design/tasks。
2. 人类审查工件：确认需求、边界、验收标准和任务粒度。
3. Superpowers 执行：用 TDD、系统化调试、计划执行、代码审查和完成前验证约束 Agent。
4. OpenSpec 验证与归档：`/opsx:verify` → `/opsx:sync` → `/opsx:archive`。

**规范冲突处理**：OpenSpec 的业务规范优先；Superpowers 补充工程行为规则；AGENTS.md / CLAUDE.md 负责项目长期约束。

### 4.4 类似项目与定位

| 项目 | 类型 | 核心工件/机制 | 适合场景 | 与 OpenSpec / Superpowers 的区别 |
|------|------|---------------|----------|----------------------------------|
| GitHub Spec Kit | SDD 工具包 | constitution、spec、plan、tasks、implement | 从产品场景生成规范、计划、任务并执行 | 更偏 GitHub / Copilot 风格的完整 SDD 流程，命令为 `/speckit.*` |
| Kiro | Agentic IDE / CLI / Web | specs、steering、hooks、MCP | 想在 IDE 内原生使用 specs、steering 和 hooks | 是完整产品，不只是可移植工作流框架 |
| BMAD Method | AI-native SDLC 方法论 | agents、workflows、skills、stories | 希望按产品经理/架构师/开发/QA 等角色组织端到端开发 | 更像 AI 化敏捷流程，适合大项目，流程较重 |
| Cline Workflows | Agent 工作流 | workflow markdown、Plan/Act、MCP | 在 VS Code 里沉淀可复用操作步骤 | 偏单工具生态，适合把常用任务转成可复用 workflow |
| Cursor Rules | 持久上下文规则 | `.cursor/rules`、User Rules、Memories | 让 Cursor Agent 稳定遵守项目规则 | 主要解决“上下文和规则”，不是完整 SDD 或 TDD 流程 |
| Claude feature-dev / ralph-loop | Claude 插件 | 7 阶段开发、循环执行 | Claude Code 内部规划与长任务执行 | 更贴近 Claude Code 插件生态，可与 OpenSpec / Superpowers 叠加 |
| Archon | Agent 工作流/编排 | YAML/DAG 式工作流、计划-实现-验证 | 希望把 AI coding 流程做成确定性流水线 | 更偏工作流引擎和 harness，而不是 Markdown spec 工件 |

### 4.5 选型建议

| 目标 | 推荐 |
|------|------|
| 只想给需求建立可审查工件 | OpenSpec |
| 想让 Agent 按工程纪律做事 | Superpowers |
| 从 0 到 1 做产品功能，想要完整 spec/plan/tasks/implement | GitHub Spec Kit |
| 使用 Kiro IDE，希望 specs、steering、hooks 原生集成 | Kiro |
| 大项目需要产品/架构/开发/QA 多角色流程 | BMAD Method |
| VS Code + Cline 用户，想沉淀常用自动化步骤 | Cline Workflows |
| Cursor 用户，主要问题是规则复用和上下文稳定 | Cursor Rules |

**实用组合**：

- **轻量规范**：AGENTS.md + OpenSpec core profile。
- **工程纪律**：AGENTS.md + Superpowers。
- **复杂功能**：OpenSpec / Spec Kit + Superpowers + Claude Code / Codex / OpenCode。
- **长任务闭环**：OpenSpec tasks + ralph-loop / OmO Atlas / Codex exec。
- **团队落地**：AGENTS.md 统一长期规则，OpenSpec/Spec Kit 管理变更，Superpowers/BMAD 管理执行流程。

---

## 五、最佳实践

### 5.1 场景与工具选择

| 场景 | OpenCode 生态 | Claude Code 生态 |
|------|--------------|-----------------|
| 新功能开发 | OmO ultrawork | feature-dev + ralph-loop |
| 复杂多 Agent 协作 | OmO Team 模式 | OMC Team 模式 |
| 大规模重构 | OmO ultrawork | OMC Ultrawork / Ralph |
| 快速修复 | opencode 直接对话 | ralph-loop + tasks.md |
| 规范驱动开发 | OpenSpec | OpenSpec + AGENTS.md |
| 质量闭环 | OpenSpec + Superpowers | OpenSpec + Superpowers + OMC |
| 新项目 | — | feature-dev 规划 → ralph-loop 执行 |
| 已有规范 | OpenSpec 管理变更 → 执行 | OpenSpec 管理变更 → ralph-loop 执行 |
| 团队规范建设 | OpenSpec + Superpowers + AGENTS.md | OpenSpec + Superpowers + AGENTS.md |

### 5.1.1 工具组合建议

| 目标 | 推荐组合 | 说明 |
|------|----------|------|
| 快速试错 | OpenCode / Claude Code 直接对话 | 适合 Demo、脚本、小修小补 |
| 规范驱动开发 | OpenSpec + OpenCode / Claude Code | 先生成 proposal/spec/tasks，再执行 |
| 长任务收敛 | Claude Code + ralph-loop | 适合有任务清单、需要持续验证修复的工作 |
| 多 Agent 评审 | OMC Team / OmO Team | 适合规划、实现、审查、验证分工 |
| 团队落地 | AGENTS.md + Skills + 固定验证命令 | 减少每次对话重复说明 |

### 5.2 模型选择原则

不要只问"哪个模型更强"，而要问"哪个任务需要更强的模型"：

| 任务类型 | 推荐模型层级 | 理由 |
|---------|------------|------|
| 快速代码探索 | haiku / 轻量模型 | 速度优先，成本最低 |
| 日常实现与修改 | sonnet / 中阶模型 | 性价比最优 |
| 架构规划与评审 | opus / 高阶模型 | 需要深度推理 |
| 前端 UI | visual-engineering 类 | 专精视觉理解 |

### 5.3 任务分解原则

给 Agent / ralph-loop 的任务要：
- ✅ 每个任务有明确的「完成标准」
- ✅ 任务之间有逻辑顺序
- ✅ 每个任务不要太大（1-2 文件）
- ❌ 不要一个任务写整个功能

**好任务**：`- [ ] 在 models.py 添加 User 模型` → ` - [ ] 在 serializers.py 添加 UserSerializer`

**坏任务**：`- [ ] 实现用户认证模块`

### 5.4 规范先行

先确保有规范（AGENTS.md / OpenSpec），再运行多 Agent 编排。没有规范时先生成：

```bash
ask: "根据项目代码，生成一份 AGENTS.md 规范文件"
```

规范至少要包含：

- 项目结构和分层边界
- 唯一的构建、测试、lint 命令
- 允许和禁止的改动范围
- 安全、依赖、数据迁移规则
- 完成后必须报告的验证结果

### 5.5 避坑指南

| 问题 | 建议 |
|------|------|
| OMC Team 模式不生效 | 需启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` |
| 长时间任务 token 消耗大 | 合理选择模型层级，探索用 haiku，规划用 opus |
| 自定义技能不稳定 | 先从小场景验证，再推广到团队 |
| 重复劳动多 | 善用 notepad wisdom / boulder.json 积累项目经验 |
| ralph-loop 需要暂停 | `Ctrl+C` 暂停后状态自动保存，`/ralph-loop --resume` 恢复 |
| Agent 反复犯同类错误 | 把规则写入 AGENTS.md / CLAUDE.md / Skill，而不是继续口头提醒 |
| 多 Agent 输出互相冲突 | 先固定文件所有权和验收标准，再并行执行 |

---

## 六、命令速查

### OpenCode 生态

| 命令 | 说明 |
|------|------|
| `opencode` | 启动终端助手 |
| `bunx oh-my-opencode install` | 安装 OmO 插件 |
| `ultrawork` | 启动多 Agent 协作 |
| `@plan "需求"` | 精确规划模式 |
| `/start-work` | 确认计划后开始执行 |
| `bunx oh-my-opencode doctor` | 诊断工具 |

### Claude Code 生态

| 命令 | 说明 |
|------|------|
| `claude` | 启动终端助手 |
| `/feature-dev` | 7 阶段引导式开发 |
| `/ralph-loop` | 持续循环执行 |
| `/ralph-loop --tasks=x.md` | 指定任务文件执行 |
| `/ralph-loop --resume` | 恢复暂停的执行 |
| `/autopilot` | OMC 单 Agent 自主执行 |
| `/team` | OMC 多 Agent 流水线 |
| `/ralph` | OMC 持久验证执行 |
| `omc setup` | OMC CLI 引导配置 |
| `omc team` | OMC CLI Team 模式 |

### 通用工作流

| 命令 | 说明 |
|------|------|
| `/opsx:explore` | OpenSpec 探索需求 |
| `/opsx:propose <change>` | OpenSpec core 流程：生成变更工件 |
| `/opsx:new` / `/opsx:continue` | OpenSpec expanded 流程：分步生成工件 |
| `/opsx:ff` | OpenSpec expanded 流程：快进生成工件 |
| `/opsx:apply` | OpenSpec 执行编码 |
| `/opsx:verify` | OpenSpec 验证一致性 |
| `/opsx:sync` | OpenSpec 同步规范 |
| `/opsx:archive` | OpenSpec 归档变更 |
| `/speckit.specify` | GitHub Spec Kit 生成 feature spec |
| `/speckit.plan` | GitHub Spec Kit 生成实施计划 |
| `/speckit.tasks` | GitHub Spec Kit 生成任务清单 |
| `/speckit.implement` | GitHub Spec Kit 执行实现 |
| `superpowers` Skills | Superpowers 通过 Skill 约束 TDD、调试、审查、验证等行为 |

---

## 七、相关资源

| 资源 | 链接 |
|------|------|
| OpenCode | https://opencode.ai |
| oh-my-opencode | https://github.com/code-yeongyu/oh-my-openagent |
| Claude Code | https://docs.anthropic.com/en/docs/claude-code |
| oh-my-claudecode | https://github.com/yeachan-heo/oh-my-claudecode |
| OpenSpec | https://github.com/fission-ai/openspec |
| Superpowers | https://github.com/obra/superpowers |
| GitHub Spec Kit | https://github.com/github/spec-kit |
| Kiro | https://kiro.dev |
| BMAD Method | https://github.com/bmad-code-org/BMAD-METHOD |
| Cline | https://cline.bot |
| Cursor Rules | https://docs.cursor.com/context/rules |
| feature-dev | https://github.com/anthropics/claude-code-plugins |
