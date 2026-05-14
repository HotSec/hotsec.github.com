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

以下框架同时适用于 OpenCode 和 Claude Code 生态。

### 4.1 OpenSpec：SDD 结构化工作流

AI 辅助开发的结构化工作流工具，核心思想是 **"先约定，后编码"**。

```bash
npm install -g @fission-ai/openspec@latest
cd your-project
openspec init
openspec config profile    # 选择 Expanded Profile 启用完整命令
openspec update
```

#### 核心概念

| 概念 | 说明 |
|------|------|
| 变更（Change） | 一次独立的开发任务，在 `changes/` 下拥有独立目录 |
| 工件（Artifact） | 变更过程中的产出物：提案、规范、设计、任务清单、验证报告等 |
| 规范（Specs） | 项目全局或模块的设计约定，存储在 `openspec/specs/`，可被多个变更共享 |
| 快进（Fast-forward） | 一次性生成规划阶段的所有工件，跳过逐步创建 |

#### 六阶段流程

| 阶段 | 命令 | 说明 |
|------|------|------|
| 探索 | `/opsx:explore` | 只读模式讨论需求，不生成文件 |
| 规划 | `/opsx:new` → `/opsx:continue` 或 `/opsx:ff` | 生成 proposal → specs → design → tasks |
| 执行 | `/opsx:apply` | 根据任务清单编写代码 |
| 验证 | `/opsx:verify` | 检查代码是否符合规范，生成报告 |
| 同步 | `/opsx:sync` | 将变更中的规范合并到主规范库 |
| 归档 | `/opsx:archive` 或 `/opsx:bulk-archive` | 归档已完成变更 |

#### 典型场景

**复杂功能开发**：`/opsx:explore` → `/opsx:new` → `/opsx:continue` × 4 → `/opsx:apply` → `/opsx:verify` → `/opsx:sync` → `/opsx:archive`

**小型快速迭代**：`/opsx:ff` → `/opsx:apply` → `/opsx:verify` → `/opsx:archive`

### 4.2 Superpowers：行为规范框架

专为 AI Coding 设计的软件开发工作流框架，通过**可组合的 Skills** 规范 AI 开发行为。

GitHub: https://github.com/obra/superpowers

```bash
npm install -g @superpowers/superpowers
cd your-project
superpowers init
superpowers select-model coding-agent
```

#### 核心概念

| 概念 | 说明 |
|------|------|
| Skill | 封装了特定行为的 YAML 配置文件 |
| Bundle | 一组相关 Skills 的集合 |
| Profile | 一组 Bundles 的组合，定义 AI 的完整能力集 |
| Supermodel | 预配置的 Profile，针对特定场景优化 |

#### 内置 Bundles

| Bundle | 包含的 Skills | 用途 |
|--------|---------------|------|
| `coding-agent` | read_code, edit_file, search_replace, git_ops | 日常编码 |
| `debugger` | analyze_error, suggest_fix, write_test | 调试排错 |
| `reviewer` | code_review, security_scan, style_check | 代码审查 |
| `architect` | design_pattern, architecture_review | 架构设计 |

#### 自定义 Skill 示例

```yaml
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
```

### 4.3 OpenSpec + Superpowers 双框架协同

| 问题 | 表现 | 解决工具 |
|------|------|----------|
| **别跑偏** | 需求理解偏差、代码偏离原计划 | **OpenSpec**（需求层：做什么、做到什么程度） |
| **别乱写** | 代码不规范、行为不稳定、工程质量差 | **Superpowers**（执行层：怎么做、做得规范） |

**协同流程**：

1. OpenSpec 规划：`/opsx:new` → `/opsx:continue` → 生成 proposal/specs/design/tasks
2. 规范写入 Superpowers：`superpowers import-specs openspec/specs/`
3. Superpowers 执行：`superpowers run --task=tasks.md`
4. OpenSpec 验证：`/opsx:verify` → `/opsx:sync` → `/opsx:archive`

**规范冲突处理**：OpenSpec 业务规范优先 → Superpowers 补充代码质量和安全规范 → 在 `specs/README.md` 中显式声明优先级

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

### 5.5 避坑指南

| 问题 | 建议 |
|------|------|
| OMC Team 模式不生效 | 需启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` |
| 长时间任务 token 消耗大 | 合理选择模型层级，探索用 haiku，规划用 opus |
| 自定义技能不稳定 | 先从小场景验证，再推广到团队 |
| 重复劳动多 | 善用 notepad wisdom / boulder.json 积累项目经验 |
| ralph-loop 需要暂停 | `Ctrl+C` 暂停后状态自动保存，`/ralph-loop --resume` 恢复 |

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
| `/opsx:ff` | OpenSpec 快进生成工件 |
| `/opsx:apply` | OpenSpec 执行编码 |
| `/opsx:verify` | OpenSpec 验证一致性 |
| `/opsx:archive` | OpenSpec 归档变更 |
| `superpowers init` | Superpowers 初始化 |
| `superpowers run --task=x.md` | Superpowers 执行任务 |

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
| feature-dev | https://github.com/anthropics/claude-code-plugins |
