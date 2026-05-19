# OpenCode 最佳实践

OpenCode 是一个开源终端 AI 编程助手，支持 75+ 模型提供商，核心理念是终端优先、Plan/Build 双模式、提供商无关。本文档整理 OpenCode 的配置、使用、多 Agent 编排及最佳实践。

---

## 一、安装与启动

### 1.1 安装

```bash
curl -fsSL https://opencode.ai/install | bash
```

也可通过 Go 编译安装：

```bash
go install github.com/opencode-ai/opencode@latest
```

### 1.2 启动

```bash
cd your-project
opencode
```

### 1.3 核心模式

按 `Tab` 键切换两种模式：

| 模式 | 说明 |
|------|------|
| **Plan** | 只分析不改代码，适合需求梳理和方案设计 |
| **Build** | 全权限执行，可读写文件、运行命令 |

---

## 二、配置最佳实践

### 2.1 opencode.json 配置

项目根目录放置 `opencode.json`（全局配置在 `~/.opencode/config.json`）：

```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "apiKey": "sk-..."
}
```

使用本地模型（Ollama）：

```json
{
  "provider": "ollama",
  "model": "codellama:34b"
}
```

**配置建议**：

- 敏感信息（API Key）不要硬编码，使用环境变量
- 不同项目可使用不同配置文件
- 本地/离线场景优先使用 Ollama 提供商

### 2.2 OPENCODE.md / Rules 配置

OpenCode 支持项目级规则文件，类似于 Claude Code 的 `CLAUDE.md`。官方文档：https://opencode.ai/docs/rules/

规则文件的核心作用：
- 定义项目的技术栈和编码规范
- 提供常用命令参考
- 约束 AI 的行为边界
- 描述项目结构

**推荐结构**：

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

**编写原则**：

- 控制在 60-200 行以内，渐进式披露
- 只放"不知道就会写错代码"的信息
- 详细内容放链接文档，规则文件只放索引
- 禁止事项比建议事项更有效

### 2.3 .opencodeignore 配置

排除无关文件，避免 AI 处理不必要的上下文：

```
node_modules/
dist/
*.min.js
.env
*.key
*.pem
vendor/
__pycache__/
.git/
```

---

## 三、Prompt 最佳实践

### 3.1 精确描述任务

```
# 差
"加个更新功能"

# 好
"在 internal/service/user.go 中添加 UpdateProfile 方法"
```

### 3.2 结构化 Prompt 模板

```
## 角色
你是一个 Go 后端开发专家

## 上下文
项目使用 Gin 框架，PostgreSQL 数据库

## 任务
实现 JWT 认证中间件

## 要求
1. 支持 Access Token + Refresh Token
2. Token 黑名单机制
3. 优雅的错误响应

## 输出格式
1. 完整代码
2. 单元测试
3. 使用示例
```

### 3.3 分步执行

复杂任务拆分为多个步骤，逐步验证：

1. 先用 Plan 模式分析需求
2. 确认计划后再切换到 Build 模式执行
3. 每步完成后验证结果

### 3.4 常用 Prompt 模式

| 模式 | 描述 | 示例 |
|------|------|------|
| Chain of Thought | 分步推理 | "一步步分析..." |
| Few-shot | 提供示例 | "参考以下示例..." |
| Role Play | 角色扮演 | "你是安全专家..." |
| Self-Critique | 自我审查 | "审查你的回答..." |
| Decomposition | 任务分解 | "将需求拆解为..." |

### 3.5 任务分解原则

- 每个任务有明确的「完成标准」
- 任务之间有逻辑顺序
- 每个任务不要太大（1-2 文件）

**好任务**：

```markdown
- [ ] 在 models.py 添加 User 模型
- [ ] 在 serializers.py 添加 UserSerializer
```

**坏任务**：

```markdown
- [ ] 实现用户认证模块
```

---

## 四、MCP 服务器集成

### 4.1 内置 MCP 工具

| MCP 服务 | 用途 |
|----------|------|
| Exa | 实时网络搜索 |
| Context7 | 官方文档检索 |
| Grep.app | 跨 GitHub 代码搜索 |

### 4.2 内置工具（非 MCP 但关键）

| 工具 | 用途 |
|------|------|
| LSP Tools | 代码重命名、跳转定义、引用查找、诊断 |
| AST-Grep | 25 种语言的语法感知代码搜索和重写 |
| Tmux 集成 | Agent 在真实交互终端里跑 REPL、调试器 |
| IntentGate | 执行前分析用户真实意图，避免字面误解 |

### 4.3 MCP 集成建议

- 优先使用 Context7 获取官方文档，避免 AI 凭记忆编造 API
- 使用 Exa 进行实时网络搜索，获取最新信息
- Grep.app 可跨 GitHub 代码搜索，找到参考实现
- LSP Tools 是日常编码最常用的工具，确保项目 LSP 配置正确
- **同时只激活 2-3 个 MCP 工具**，工具描述膨胀是上下文饱和最常见的成因

---

## 五、模型选择技巧

### 5.1 核心原则

**不要只问"哪个模型更强"，而要问"哪个任务需要更强的模型"**。

| 任务类型 | 推荐模型层级 | 理由 |
|---------|------------|------|
| 快速代码探索 | haiku / 轻量模型 | 速度优先，成本最低 |
| 日常实现与修改 | sonnet / 中阶模型 | 性价比最优 |
| 架构规划与评审 | opus / 高阶模型 | 需要深度推理 |
| 前端 UI | visual-engineering 类 | 专精视觉理解 |

### 5.2 场景与模型匹配

| 场景 | 推荐模型 |
|------|---------|
| 多模型切换、成本敏感 | OpenCode（支持 75+ 提供商） |
| 本地模型 / 离线场景 | OpenCode + Ollama |
| 复杂逻辑、架构决策 | ultrabrain 类别模型 |
| 单文件、小改动 | quick 类别模型 |

### 5.3 OmO 任务路由

Sisyphus 委派任务时不选具体模型，而是选"类别"，系统自动匹配：

| 类别 | 适用场景 |
|------|---------|
| visual-engineering | 前端、UI、设计 |
| deep | 研究、自主执行 |
| quick | 单文件、小改动 |
| ultrabrain | 复杂逻辑、架构决策 |

---

## 六、oh-my-opencode（OmO）多 Agent 编排

### 6.1 安装

```bash
bunx oh-my-opencode install
```

项目地址：https://github.com/code-yeongyu/oh-my-openagent

### 6.2 11 个专职 Agent

| 层级 | Agent | 角色 | 职责 |
|------|-------|------|------|
| 规划 | Prometheus | 战略规划师 | Interview 模式：先问问题梳理需求，再生成详细计划 |
| 规划 | Metis | 计划顾问 | 对计划进行风险评估和补充 |
| 规划 | Momus | 计划批评者 | 专门挑毛病，查漏补缺 |
| 编排 | Sisyphus | 主编排者 | 日常任务总指挥，分解目标、调度 Agent |
| 编排 | Atlas | 计划执行引擎 | 把 Prometheus 的计划逐步推进，用 boulder.json 追踪进度 |
| 执行 | Hephaestus | 深度执行者 | 自主探索代码库，端到端完成任务 |
| 专项 | Oracle | 架构分析 + 调试 | 架构问题定位与调试 |
| 专项 | Librarian | 文档搜索 + 代码查找 | 快速检索文档和代码 |
| 专项 | Explore | 快速只读 grep | 轻量级代码库搜索 |
| 专项 | Multimodal Looker | 图像/视觉理解 | 处理截图、UI 等视觉输入 |
| 专项 | Sisyphus-Junior | 轻量备用编排者 | 小规模任务的编排代理 |

**关键设计**：规划和执行严格分离。Prometheus 只问不写，Atlas 只执行不质疑，避免"边想边改、越改越乱"。

### 6.3 Hashline 技术（哈希锚定编辑）

解决 AI 编辑代码时"改错行"的问题：每一行打上内容哈希标签，Agent 编辑时必须引用标签，哈希不匹配则编辑被拒绝。

```
11#VK| function hello() {
22#XJ| return "world";
33#MB| }
```

效果：某测试集的编辑成功率从 **6.7% 提升到 68.3%**。

### 6.4 快速上手

```bash
curl -fsSL https://opencode.ai/install | bash
bunx oh-my-opencode install
cd your-project
opencode

# 方式一：ultrawork 模式（快速启动）
ultrawork

# 方式二：精确规划后执行
@plan "帮我实现用户认证功能，支持 JWT"
# Prometheus 会开始问问题...确认计划后：
/start-work
```

诊断工具：`bunx oh-my-opencode doctor`

---

## 七、常见工作流

### 7.1 新功能开发

```bash
# 1. Plan 模式分析需求
opencode
# 按 Tab 切换到 Plan 模式
# 输入需求描述

# 2. 确认计划后切换到 Build 模式
# 按 Tab 切换到 Build 模式

# 3. 使用 OmO 多 Agent 协作
ultrawork
# 或
@plan "实现用户认证功能"
/start-work
```

### 7.2 快速修复

```bash
opencode
# 直接在 Build 模式描述修复需求
"修复 api/users.py 第 45 行的登录逻辑，当密码错误时应该返回 401 而不是 500"
```

### 7.3 代码库探索

```bash
opencode
# Plan 模式下
"解释这个项目的架构"
"找出 src 目录下所有包含 TODO 注释的文件"
"读取 package.json，列出所有依赖的版本"
```

### 7.4 OpenSpec 结构化工作流

```bash
npm install -g @fission-ai/openspec@latest
cd your-project
openspec init
openspec config profile    # 选择 Expanded Profile
openspec update
```

六阶段流程：

| 阶段 | 命令 | 说明 |
|------|------|------|
| 探索 | `/opsx:explore` | 只读模式讨论需求 |
| 规划 | `/opsx:new` → `/opsx:continue` 或 `/opsx:ff` | 生成 proposal → specs → design → tasks |
| 执行 | `/opsx:apply` | 根据任务清单编写代码 |
| 验证 | `/opsx:verify` | 检查代码是否符合规范 |
| 同步 | `/opsx:sync` | 将变更中的规范合并到主规范库 |
| 归档 | `/opsx:archive` | 归档已完成变更 |

### 7.5 Superpowers 行为规范框架

```bash
npm install -g @superpowers/superpowers
cd your-project
superpowers init
superpowers select-model coding-agent
```

---

## 八、上下文工程与性能优化

### 8.1 上下文腐蚀（Context Rot）

随着上下文窗口中的 tokens 增加，模型从上下文中准确回忆信息的能力反而下降。上下文必须被视作一种有限资源，且具有边际收益递减。

### 8.2 有效上下文设计原则

| 组件 | 设计原则 | 常见误区 |
|------|---------|---------|
| 系统提示 | 信息层级"刚刚好"，分区组织 | 过度硬编码 if-else / 过于空泛 |
| 工具 | 职责单一、低重叠、接口语义清晰 | 臃肿工具集，选哪个工具都不清楚 |
| 示例 | 精挑多样且典型的示例 | 把所有边界条件罗列塞进提示 |

### 8.3 JIT 上下文 vs 预加载

| 方式 | 做法 | 特点 |
|------|------|------|
| 预加载 | 推理前一次性检索所有相关数据 | 快但可能过时 |
| JIT 上下文 | 维护轻量化引用，运行时动态加载 | 按需获取，渐进式披露 |

混合策略更有效：前置加载少量"高价值"上下文保证速度，同时提供 glob、grep 等原语让智能体即时检索。

### 8.4 长时程任务的上下文管理

| 方法 | 适用场景 | 核心思想 |
|------|---------|---------|
| 压缩整合 | 需要长对话连续性 | 接近上限时高保真总结，用摘要重启新窗口 |
| 结构化笔记 | 有里程碑的迭代式开发 | 关键信息写入上下文外的持久化存储 |
| 子代理架构 | 复杂研究与分析 | 主代理规划，子代理在干净窗口中深挖 |

---

## 九、避坑指南

| 问题 | 建议 |
|------|------|
| 长时间任务 token 消耗大 | 合理选择模型层级，探索用 haiku，规划用 opus |
| 自定义技能不稳定 | 先从小场景验证，再推广到团队 |
| 重复劳动多 | 善用 notepad wisdom / boulder.json 积累项目经验 |
| AI 改错行 | 使用 Hashline 技术，编辑成功率从 6.7% 提升到 68.3% |
| API Key 泄露 | 不要将敏感信息写入规则文档，使用环境变量 |
| AI 盲目信任 | 始终审查 AI 输出，确保通过 Lint 和测试 |
| AI 自动提交到生产 | 不要让 AI 自动提交代码到生产分支 |
| 上下文窗口饱和 | 只保留 2-3 个 MCP 工具，规则文件控制在 60-200 行 |
| 规范缺失导致跑偏 | 先生成 AGENTS.md / OPENCODE.md 规范文件再执行 |

---

## 十、命令速查

| 命令 | 说明 |
|------|------|
| `opencode` | 启动终端助手 |
| `Tab` | 切换 Plan / Build 模式 |
| `bunx oh-my-opencode install` | 安装 OmO 插件 |
| `ultrawork` | 启动多 Agent 协作 |
| `@plan "需求"` | 精确规划模式 |
| `/start-work` | 确认计划后开始执行 |
| `bunx oh-my-opencode doctor` | 诊断工具 |

---

## 十一、相关资源

| 资源 | 链接 |
|------|------|
| OpenCode 官网 | https://opencode.ai |
| OpenCode 规则文档 | https://opencode.ai/docs/rules/ |
| oh-my-opencode (OmO) | https://github.com/code-yeongyu/oh-my-openagent |
| OpenSpec | https://github.com/fission-ai/openspec |
| Superpowers | https://github.com/obra/superpowers |
| AGENTS.md 生态 | https://agents.md |
