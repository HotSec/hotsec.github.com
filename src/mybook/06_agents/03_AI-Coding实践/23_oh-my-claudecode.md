# oh-my-claudecode（OMC）：Claude Code 多 Agent 编排系统

> 来源：[OMC - 01 用 19 个 Agent 打造你的 Claude Code"工程团队"](https://artisan.blog.csdn.net/article/details/160320170)

oh-my-claudecode（OMC）是为 Claude Code 打造的多 Agent 编排层，将单一会话升级为由 19 个专用 Agent 组成的协同系统，通过 Hooks、Skills、Agents、State 四大支柱实现可插拔、可扩展、可调试的多 Agent 编排。

## 核心定位

- 将单个 Claude Code 会话升级为"由 19 个专用 Agent 组成的团队"，覆盖探索、设计、实现、调试、测试、安全审查、文档编写等完整生命周期
- 自动检测用户意图（魔法关键词），将任务委派给合适的 Agent，并选择合适的模型层级（haiku / sonnet / opus）
- 持续执行任务直到通过自动验证，避免"看似完成、实则半拉子"的隐形失败

**项目地址**：[github.com/yeachan-heo/oh-my-claudecode](https://github.com/yeachan-heo/oh-my-claudecode)

## 四大架构支柱

### Hooks（钩子）—— 第一层入口

约 20 个生命周期钩子，覆盖会话启动、工具调用、提示提交、上下文压缩等关键事件。

- 检测"魔法关键词"（如 `ralph`、`ulw`、`autopilot`）
- 强制执行某种模式（如确保 Ralph 模式在长时间任务中保持持久）
- 注入质量门禁（如所有提交必须经过某个验证 Agent）
- 钩子以声明式写在 `hooks.json` 中，以 Node.js 脚本执行，单个钩子有 5 秒时间预算

### Skills（技能）—— 行为注入与路由决策核心

当 Hooks 检测到条件时，激活一个或多个技能。每个技能是自包含的行为模块：

- 注入系统指令（如进入 `autopilot` 模式）
- 添加约束（如"必须先生成计划再开始修改代码"）
- 定义路由逻辑（如根据任务类型挑选 Agent 或模型）

**内置技能**：
- 编排类：`autopilot`、`ralph`、`ultrawork`、`team`
- 实用类：`ask`、`trace`、`verify`
- 学习/记忆类：`learner`、`remember`

用户可在 `.omc/skills/` 或 `~/.omc/skills/` 中编写自定义技能。

### Agents（智能体）—— 19 个专用角色

| 泳道 | Agent 列表 | 主要职责 |
|------|-----------|---------|
| 构建/分析 | `explore`, `analyst`, `planner`, `architect`, `debugger`, `executor`, `verifier`, `tracer` | 从代码探索、方案分析到实现、调试、验证的完整开发链路 |
| 审查 | `security-reviewer`, `code-reviewer` | 安全审查、API 契约、向后兼容性等质量门禁 |
| 领域 | `test-engineer`, `designer`, `writer`, `qa-tester`, `scientist`, `git-master`, `document-specialist`, `code-simplifier` | 测试、设计、文档、数据科学、Git 操作、代码简化等专业方向 |
| 协调 | `critic` | 负责"唱反调"：质疑计划与设计，只在找不到缺陷时放行 |

每个 Agent 具备三类关键属性：
1. **模型层级**：精心挑选 haiku / sonnet / opus，平衡成本与能力
2. **工具集**：只暴露与其职责相关的工具，避免任务"越权"
3. **系统提示词**：让 Agent 具备清晰的角色意识与行为边界

### State（状态与记忆）

- **boulder 状态**：规划与进度追踪，"任务石块"的状态机（未开始、进行中、已完成、阻塞等）
- **notepad wisdom**：Agent 记录经验、决策理由、坑点和 TODO，后续会话可复用
- **会话摘要**：上下文压缩时保留关键信息，使长任务不会因 token 限制"失忆"
- **回放日志**：记录多 Agent 协作过程，支持调试和复盘

## 模型路由策略

| 模型 | 适用场景 | 典型 Agent |
|------|---------|-----------|
| haiku | 速度与成本优先 | `explore`（快速代码探索）、`writer`（文本生成） |
| sonnet | 默认工作马 | `executor`（日常实现）、`debugger`（调试）、`test-engineer`（测试） |
| opus | 高价值深度推理 | `architect`/`planner`（架构规划）、`critic`/`code-reviewer`（高要求评审） |

相比"所有请求都走最贵模型"，预计节省 30–50% token 成本。

## 六大编排模式

| 模式 | 策略特点 | 典型场景 |
|------|---------|---------|
| Team（推荐） | 分阶段流水线：计划 → PRD → 执行 → 验证 → 修复循环 | 多子任务协同类特性开发 |
| CCG | Codex + Gemini + Claude 三模型综合，Claude 做整合 | 需要多模型视角的复杂任务 |
| Autopilot | 单主导 Agent，自主端到端执行 | 流程简单但工作量较大的开发 |
| Ultrawork | 最大化并行度，减小 Team 管理开销 | 大规模并行修复/重构 |
| Ralph | 带验证/修复循环的持久执行模式 | 必须保证"真正做完"的任务 |
| Ralplan | 规划优先，迭代达成规划共识后才执行 | 核心架构变更等需详细设计的复杂特性 |

### Team 模式详解

最推荐的模式，典型流程：
1. `planner`/`architect` 分析需求，拆解为任务列表
2. `writer`/`designer` 搭建 PRD、接口约定、UI 草图
3. `executor` 分阶段实现代码，`debugger`/`test-engineer` 保障质量
4. `verifier`、`qa-tester` 和 `critic` 组成质量闭环，必要时触发修复循环

需在 `~/.claude/settings.json` 中启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 环境变量。

## 两种使用界面

### Claude Code 插件

```bash
/plugin marketplace add    # 添加插件源
/plugin install            # 安装 oh-my-claudecode
```

获得：斜杠命令（`/autopilot`、`/ralph`、`/team`）、Agent 和 Skills 能力、HUD 状态栏、MCP 工具集成。

### 终端 CLI

```bash
npm i -g oh-my-claude-sisyphus@latest
omc setup          # 引导配置
omc team           # Team 模式发起多 Agent 任务
omc ask            # 一次性问答或分析
omc autoresearch   # 自动化调研
omc wait           # 等待长任务完成
```

两者共享 `~/.claude/omc.jsonc` 配置文件和 `.omc/` 状态目录。

## 代码结构与扩展

核心目录：
- `src/agents/`：Agent 定义、模型路由和委派逻辑
- `src/features/`：魔法关键词、后台任务、notepad wisdom
- `src/hooks/`：钩子编排与上下文注入
- `src/skills/`：技能加载、扩展与管理
- `src/mcp/`：MCP 工具服务器
- `src/team/`：Team 流水线编排逻辑
- `src/config/`：配置加载与校验
- `src/tools/`：自定义工具实现

**典型扩展方式**：
1. 自定义技能（推荐起点）：在 `.omc/skills/` 中新建
2. 扩展 Hooks：在 `hooks.json` 中新增生命周期钩子
3. 自定义 Agent：在 `agents/` 中添加提示词文件

## 实践建议

### 模式选择

| 场景 | 推荐模式 |
|------|---------|
| 多人协同类特性开发 | Team |
| 简单但工作量大的端到端开发 | Autopilot |
| 批量 API 迁移/大规模重构 | Ultrawork |
| 必须保证"真正做完"的关键任务 | Ralph |
| 核心架构变更 | Ralplan |

### 避坑与注意事项

- Team 模式需启用实验性 Agent Teams 功能
- 长时间任务注意 token 消耗，合理选择模型层级
- 自定义技能先从小场景验证，再推广到团队
- 善用 notepad wisdom 积累项目经验，减少重复劳动
