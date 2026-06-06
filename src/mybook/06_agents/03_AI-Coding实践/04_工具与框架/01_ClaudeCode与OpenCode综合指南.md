# Claude Code 与 OpenCode 综合指南

本文档整合了 Claude Code 和 OpenCode 两大终端 AI 编程生态的使用教程、最佳实践、多 Agent 编排及工作流框架。

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

### 2.1 安装与基础使用

```bash
# 安装
curl -fsSL https://opencode.ai/install | bash

# 启动
cd your-project
opencode
```

**核心模式**：按 `Tab` 键切换 Plan（只读分析）和 Build（全权限执行）模式。

### 2.2 配置最佳实践

**opencode.json 配置**：
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "apiKey": "sk-..."
}
```

**OPENCODE.md 规则文件**（类似 CLAUDE.md）：
```markdown
# 项目：MyApp
## 技术栈
Go 1.22 / Gin / PostgreSQL

## 编码规范
- 错误处理使用 fmt.Errorf("module: %w", err)
- Context 作为第一个参数

## 常用命令
- 构建：make build
- 测试：make test
```

### 2.3 oh-my-opencode（OmO）多 Agent 编排

```bash
bunx oh-my-opencode install
```

**11 个专职 Agent**：
| 层级 | Agent | 角色 |
|------|-------|------|
| 规划 | Prometheus | 战略规划师 |
| 规划 | Metis | 计划顾问 |
| 规划 | Momus | 计划批评者 |
| 编排 | Sisyphus | 主编排者 |
| 编排 | Atlas | 计划执行引擎 |
| 执行 | Hephaestus | 深度执行者 |

### 2.4 OpenCode 源码架构

OpenCode 基于 Effect-TS 的多层服务协作，核心模块包括：
- **Provider**：75+ 模型提供商适配
- **MCP**：模型上下文协议客户端
- **Session**：会话生命周期管理
- **Tools**：工具系统（read/edit/bash/grep/glob）
- **Skills**：领域能力注入
- **Permission**：权限系统（allow/deny/ask）

---

## 三、Claude Code 生态

### 3.1 安装与启动

```bash
# 终端版
npm install -g @anthropic-ai/claude-code
cd your-project
claude
```

### 3.2 CLAUDE.md 配置最佳实践

**核心原则**：渐进式披露，控制在 60-200 行以内。

```markdown
# 项目：MyApp

## 技术栈
Go 1.22 / Gin / PostgreSQL / Redis

## 编码规范
- 错误处理使用 fmt.Errorf("module: %w", err)
- Context 作为第一个参数
- 禁止全局状态

## 常用命令
- 构建：make build
- 测试：make test
- Lint：make lint
```

**研究结论**：LLM 生成的 CLAUDE.md 反而损害性能（成本 +20%，Token +14-22%）。原则：少即是多。

### 3.3 核心插件：feature-dev + ralph-loop

```bash
/plugin marketplace add anthropics/claude-code-plugins
/plugin install feature-dev ralph-loop
```

**feature-dev（7 阶段规划）**：发现 → 探索 → 澄清 → 架构设计 → 实现 → 测试 → 审查

**ralph-loop（持续执行）**：
```bash
/ralph-loop --tasks=tasks.md
/ralph-loop --status
/ralph-loop --resume
```

### 3.4 oh-my-claudecode（OMC）19 Agent 编排

**四大架构支柱**：
| 支柱 | 定位 |
|------|------|
| Hooks | 事件拦截与质量门禁 |
| Skills | 行为注入与路由决策 |
| Agents | 19 个专用执行角色 |
| State | 状态与记忆管理 |

**六大编排模式**：Team、CCG、Autopilot、Ultrawork、Ralph、Ralplan

---

## 四、通用工作流框架

### 4.1 OpenSpec：规范驱动开发

```bash
npm install -g @fission-ai/openspec@latest
openspec init
```

**核心流程**：`/opsx:propose` → `/opsx:apply` → `/opsx:archive`

### 4.2 Superpowers：行为级 Skills 方法论

| Skill | 解决问题 |
|-------|----------|
| brainstorming | 防止一上来就写代码 |
| writing-plans | 把设计拆成可执行任务 |
| test-driven-development | 强制 RED-GREEN-REFACTOR |
| systematic-debugging | 先复现再定位根因 |

### 4.3 GitHub Spec Kit

**SDD 工作流**：
- `/speckit.constitution` → 定义项目宪法
- `/speckit.specify` → 定义规范
- `/speckit.plan` → 制定技术方案
- `/speckit.tasks` → 拆分任务
- `/speckit.implement` → 执行实现

---

## 五、AI 工程三层范式

### 5.1 三层递进

| 层次 | 关注点 | 核心问题 |
|------|--------|---------|
| **Prompt Engineering** | 概率空间 | 如何精确描述任务 |
| **Context Engineering** | 信息空间 | 如何管理上下文窗口 |
| **Harness Engineering** | 运行系统 | 如何构建验证与反馈循环 |

### 5.2 故障诊断框架

| 故障现象 | 问题层次 | 解决方向 |
|---------|---------|---------|
| 输出格式错误 | Prompt | 收紧指令，约束输出格式 |
| 杜撰事实 | Context | 加检索、调整记忆结构 |
| 长任务漂移 | Harness | 加 Sub-agent 隔离、循环检测 |

### 5.3 Harness Engineering 核心组件

| 组件 | 职责 |
|------|------|
| Tool Layer | 定义 Agent 能做什么 |
| Memory/Context | 管理短期和长期记忆 |
| Architectural Constraints | 确保不偏离架构设计 |
| Task Orchestration | 任务分解与编排 |
| Validation/Filtering | 质量把关 |
| Self-Correction | 自修正与熵管理 |

---

## 六、最佳实践总结

### 6.1 模型选择原则

| 任务类型 | 推荐模型 |
|---------|---------|
| 快速探索 | haiku / 轻量模型 |
| 日常实现 | sonnet / 中阶模型 |
| 架构规划 | opus / 高阶模型 |

### 6.2 任务分解原则

- ✅ 每个任务有明确的完成标准
- ✅ 任务之间有逻辑顺序
- ✅ 每个任务不超过 1-2 文件

### 6.3 生产 Harness 配置清单

- [ ] AGENTS.md 不超过 60 行
- [ ] 只保留 2-3 个 MCP 工具
- [ ] Pre-commit hook：typecheck + lint
- [ ] 循环检测：同一文件编辑 3+ 次时标记
- [ ] Sub-agent 模式：研究、代码追踪、QA

---

## 七、命令速查

### OpenCode
| 命令 | 说明 |
|------|------|
| `opencode` | 启动终端助手 |
| `ultrawork` | 启动多 Agent 协作 |
| `@plan "需求"` | 精确规划模式 |

### Claude Code
| 命令 | 说明 |
|------|------|
| `claude` | 启动终端助手 |
| `/feature-dev` | 7 阶段引导式开发 |
| `/ralph-loop` | 持续循环执行 |
| `/team` | OMC 多 Agent 流水线 |

### 通用工作流
| 命令 | 说明 |
|------|------|
| `/opsx:propose <change>` | OpenSpec 生成变更工件 |
| `/opsx:apply` | OpenSpec 执行编码 |
| `/speckit.specify` | Spec Kit 生成规范 |
| `/speckit.implement` | Spec Kit 执行实现 |

---

## 八、相关资源

| 资源 | 链接 |
|------|------|
| OpenCode | https://opencode.ai |
| oh-my-opencode | https://github.com/code-yeongyu/oh-my-openagent |
| Claude Code | https://docs.anthropic.com/en/docs/claude-code |
| oh-my-claudecode | https://github.com/yeachan-heo/oh-my-claudecode |
| OpenSpec | https://github.com/fission-ai/openspec |
| Superpowers | https://github.com/obra/superpowers |
| GitHub Spec Kit | https://github.com/github/spec-kit |