# Claude Code 最佳实践

Claude Code 是 Anthropic 官方推出的终端 AI 编码工具，通过插件生态可以大幅提升开发效率。本文档整理了 Claude Code 的安装配置、CLAUDE.md 编写、MCP 集成、多 Agent 编排、上下文工程及最佳实践。

---

## 一、安装与启动

### 1.1 安装方式

#### 方式一：Claude Desktop App（推荐新手）

```
1. 下载 Claude Desktop App
   https://claude.ai/download

2. 登录 Claude Pro 账号
   免费账号无法使用 Claude Code

3. 在 App 中打开项目目录
```

#### 方式二：终端版（推荐进阶用户）

```bash
# 安装 Node.js 前置依赖（LTS 版本）
# 安装 Claude Code
npm install -g @anthropic-ai/claude-code

# 在项目目录启动
cd your-project
claude
```

### 1.2 核心斜杠命令

| 命令 | 功能 | 说明 |
|------|------|------|
| `/help` | 查看帮助 | 显示所有可用命令和插件 |
| `/mcp` | MCP 状态 | 查看当前连接的 MCP Server 状态 |
| `/plugin` | 插件管理 | 查看、安装、管理插件 |
| `/save` | 保存会话 | 将当前会话保存到历史 |
| `/load` | 加载会话 | 加载历史会话 |
| `/new` | 新会话 | 开启新会话 |
| `/reset` | 重置状态 | 清除当前上下文 |

---

## 二、CLAUDE.md 配置最佳实践

CLAUDE.md 是 Claude Code 的核心配置文件，放在项目根目录，启动时自动读取。其前身概念最早由 Anthropic 通过 CLAUDE.md 普及，后来演变为行业通用的 AGENTS.md 标准。

### 2.1 核心理念：地图，而非手册

CLAUDE.md 的第一原则是**渐进式披露**——它是一张地图，不是一本手册。应该控制在约 200 行以内，告诉 Agent "去哪里找什么"，详细内容放在链接的文档里。

**判断标准**：如果 AI 不知道这条信息就会写出错误的代码，放 CLAUDE.md；如果只是写出不够好的代码，放详细文档，CLAUDE.md 里放链接。

### 2.2 推荐结构

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

### 2.3 关键研究结论

苏黎世联邦理工学院研究 138 个 AGENTS.md/CLAUDE.md 文件发现：**LLM 生成的版本反而损害性能**（成本增加 20%+，Agent 多消耗 14-22% 推理 Token，解决率未提升）。

原则：**少即是多**。HumanLayer 的 CLAUDE.md 不到 60 行，只包含普遍适用的简练指令。

### 2.4 按项目规模的编写建议

| 项目规模 | 建议行数 | 必须包含 |
|----------|----------|---------|
| 个人/小型 | 30-100 行 | 命令 + 风格 + 禁止事项 |
| 中型团队 | 100-250 行 | + 架构 + PR 规范 + 测试策略 |
| 大型团队 | 250-500 行 | + 安全 + Skill 系统 + 反模式 |
| 超大型/企业 | 500-1000 行 | 多级文件 + 外部指导文件 |

### 2.5 8 大通用规则（基于 72+ 开源项目分析）

按出现频率排序：

| 排名 | 规则类别 | 出现频率 |
|------|---------|---------|
| 1 | 构建/测试命令 | 100% |
| 2 | 代码风格与格式化 | 95% |
| 3 | Commit/PR 规范 | 90% |
| 4 | 项目结构说明 | 80% |
| 5 | 禁止事项清单 | 75% |
| 6 | AI 参与规范 | 45% |
| 7 | 安全要求 | 40% |
| 8 | Skill/工作流系统 | 20% |

### 2.6 最小可用版本

```markdown
# AGENTS.md

## 项目概述
一句话说明项目是什么，技术栈，monorepo 结构。

## 命令
- Build: `make build`
- Test: `make test`
- Lint: `make lint`
- Format: `make fmt`

## 代码风格
- 匹配现有代码风格
- 使用 [formatter] 格式化
- [语言特定的关键约定]

## Commit 规范
- 每个 commit 独立编译通过测试
- 祈使句，简洁明了

## 禁止事项
- 不做超出要求的功能
- 不"改进"相邻代码
- 不添加 AI 生成标记
```

---

## 三、Prompt 最佳实践

### 3.1 精确描述任务

```
# 差
"帮我修个 bug"

# 好
"修复 api/users.py 第 45 行的登录逻辑，当密码错误时应该返回 401 而不是 500"
```

更具体的示例：

```
# 差
claude "加个更新功能"

# 好
claude "在 internal/service/user.go 中添加 UpdateProfile 方法"
```

### 3.2 提供充分上下文

- 先让 Claude 探索项目结构
- 提供相关文件或代码片段
- 说明现有实现方式

### 3.3 循序渐进

大任务拆成小步骤完成，不要期望一次性写完整个项目。

### 3.4 feature-dev 需求提示模板

```
我需要实现：[功能描述]
使用场景：[典型场景]
期望结果：[验收标准]
相关资源：[可选 - 文档链接/参考代码]
```

### 3.5 Prompt Engineering 的局限性

精心设计的 Prompt 也无法解决以下问题：
- 无法注入私域知识（团队规范、内部文档）
- 无法感知外部状态（当前时间、系统日志）
- 无法处理跨会话的记忆
- 无法取代权限系统、工具可用性或错误恢复逻辑

当 Prompt 质量碰到硬性天花板时，需要上升到 Context Engineering 和 Harness Engineering 层面解决。

---

## 四、MCP Server 集成

### 4.1 什么是 MCP

MCP（Model Context Protocol，模型上下文协议）是 Anthropic 推出的开放标准协议，为 AI 应用提供了统一的方式来连接外部数据源和工具。可以理解为 AI 世界的 "USB-C 接口"。

### 4.2 架构

```
Host（Claude Desktop / CLI）
  ┌──────────┐  ┌──────────┐
  │ Client A │  │ Client B │
  └────┬─────┘  └────┬─────┘
       │              │
  ┌────▼─────┐  ┌────▼─────┐
  │ Server A │  │ Server B │
  │(filesystem)│ │(search)  │
  └──────────┘  └──────────┘
```

### 4.3 在 Claude CLI 中配置 MCP

```bash
# 添加 filesystem server
claude mcp add filesystem -s user -- npx -y @modelcontextprotocol/server-filesystem ~/Documents

# 添加 Brave Search Server
claude mcp add brave-search -s user -- npx -y @modelcontextprotocol/server-brave-search YOUR_BRAVE_API_KEY

# 查看已配置的 MCP Server
claude mcp list

# 查看某个 Server 的详细信息
claude mcp get filesystem

# 移除某个 Server
claude mcp remove filesystem
```

### 4.4 手动编辑配置文件

配置存储在 `settings.json` 中：
- 全局配置：`~/.claude/settings.json`
- 项目配置：项目根目录/.claude/settings.json

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "~/Documents"]
    }
  }
}
```

### 4.5 验证 MCP 连接

启动 Claude CLI 后，使用 `/mcp` 命令查看当前连接的 MCP Server 状态。

### 4.6 MCP 最佳实践

**关键警告**：接入过多 MCP 服务器会让上下文窗口被工具描述塞满，"更快地进入降智区"。建议：

1. **只保留最常用的 2 个 MCP 工具**：工具描述膨胀是上下文饱和最常见的成因
2. 使用一组**小而可组合的工具**：Read、Write、Grep、Glob、Bash，而非膨胀的专用工具清单
3. 如果一个 MCP 服务器复制了训练数据中已有良好表征的 CLI 功能，直接让 Agent 调用 CLI 效果更好

### 4.7 常用 MCP Server

| Server | 说明 |
|--------|------|
| Filesystem | 读取和管理本地文件系统 |
| Brave Search | 网页搜索能力 |
| PostgreSQL | 连接 PostgreSQL 数据库 |
| GitHub | 访问 GitHub API |
| Memory | 本地向量数据库 |

---

## 五、模型选择与使用技巧

### 5.1 不要所有任务都用最贵的模型

| 任务类型 | 推荐模型 | 理由 |
|---------|---------|------|
| 代码库探索、简单问答 | Haiku | 速度最快，成本最低 |
| 日常实现与修改 | Sonnet | 性价比最优 |
| 架构规划、复杂评审 | Opus | 需要深度推理 |
| 前端 UI | visual-engineering 类 | 专精视觉理解 |

### 5.2 oh-my-claudecode 的模型路由策略

| 模型 | 适用场景 | 典型 Agent |
|------|---------|-----------|
| haiku | 速度与成本优先 | explore、writer |
| sonnet | 默认工作马 | executor、debugger、test-engineer |
| opus | 高价值深度推理 | architect/planner、critic/code-reviewer |

相比"所有请求都走最贵模型"，预计节省 30-50% token 成本。

### 5.3 推理预算策略

LangChain 的实验证据表明：规划用高推理模型，实现切换到低推理模型，可以在不损失质量的情况下显著降低成本。

---

## 六、插件生态

### 6.1 必装插件（黄金组合）

```bash
# 1. 添加官方插件源
/plugin marketplace add anthropics/claude-code-plugins

# 2. 安装核心插件
/plugin install feature-dev
/plugin install cc-best
/plugin install ralph-loop

# 3. 重启 Claude Code 生效
```

#### 1) feature-dev：7 阶段引导式开发

**定位**：规划层，系统化需求分析和设计

```bash
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
我需要实现：用户登录功能（JWT 认证）
使用场景：用户输入邮箱密码，系统返回访问令牌
期望结果：
- POST /api/auth/login 接口
- 输入验证
- 密码加密存储
- 返回 access_token 和 refresh_token
- 错误处理规范
相关资源：参考 api/auth.py 的现有代码结构
```

#### 2) ralph-loop：持续循环执行

**定位**：执行层，让 Claude 自主完成任务直到完成

```bash
# 基本使用
/ralph-loop

# 指定任务文件
/ralph-loop --tasks=tasks.md

# 查看状态
/ralph-loop --status

# 恢复暂停的执行（Ctrl+C 暂停后）
/ralph-loop --resume

# 停止
/cancel-ralph
```

任务文件格式（feature-dev 阶段四自动生成，可直接使用）：

```markdown
# 任务清单

- [ ] 在 models.py 添加 User 模型
- [ ] 在 serializers.py 添加 UserSerializer
- [ ] 在 views.py 添加登录接口视图
- [ ] 在 urls.py 添加路由
- [ ] 编写单元测试
- [ ] 运行 pytest 验证
```

特点：
- 支持断点续传，`Ctrl+C` 暂停后状态自动保存
- 自主迭代，遇到问题自动调整
- 适合大规模、多步骤任务

#### 3) cc-best：代码质量提升

**定位**：质量层，集成最佳实践和代码规范

功能：
- 代码格式化建议
- 性能优化提示
- 安全问题检查
- 最佳实践推荐

### 6.2 其他常用插件

| 插件 | 功能 | 推荐场景 |
|------|------|---------|
| **commit-commands** | Git 提交流程自动化 | 需要规范化 Git 提交的项目 |
| **chrome-dev-tools** | 连接 Chrome 实时会话 | 前端开发、调试网络请求 |
| **frontend-design** | 前端界面设计与实现 | 快速实现 UI |
| **gopls-lsp** | Go 语言服务协议支持 | Go 项目开发 |

---

## 七、oh-my-claudecode（OMC）多 Agent 编排

### 7.1 概述

为 Claude Code 打造的多 Agent 编排层，将单一会话升级为由 19 个专用 Agent 组成的协同系统。

项目地址：https://github.com/yeachan-heo/oh-my-claudecode

### 7.2 四大架构支柱

| 支柱 | 定位 | 核心能力 |
|------|------|---------|
| **Hooks** | 第一层入口（事件拦截） | ~20 个生命周期钩子，检测魔法关键词、强制模式、注入质量门禁 |
| **Skills** | 行为注入与路由决策 | 自包含行为模块：注入系统指令、添加约束、定义路由逻辑 |
| **Agents** | 19 个专用执行角色 | 按泳道划分，每个 Agent 精选模型层级 + 受限工具集 + 角色提示词 |
| **State** | 状态与记忆 | boulder 状态机、notepad wisdom、会话摘要、回放日志 |

### 7.3 19 个 Agent 泳道划分

| 泳道 | Agent 列表 | 主要职责 |
|------|-----------|---------|
| 构建/分析 | `explore`, `analyst`, `planner`, `architect`, `debugger`, `executor`, `verifier`, `tracer` | 从代码探索、方案分析到实现、调试、验证的完整开发链路 |
| 审查 | `security-reviewer`, `code-reviewer` | 安全审查、API 契约、向后兼容性等质量门禁 |
| 领域 | `test-engineer`, `designer`, `writer`, `qa-tester`, `scientist`, `git-master`, `document-specialist`, `code-simplifier` | 测试、设计、文档、数据科学、Git 操作、代码简化等专业方向 |
| 协调 | `critic` | 负责"唱反调"：质疑计划与设计，只在找不到缺陷时放行 |

### 7.4 六大编排模式

| 模式 | 策略特点 | 典型场景 |
|------|---------|---------|
| **Team**（推荐） | 分阶段流水线：计划 → PRD → 执行 → 验证 → 修复循环 | 多子任务协同类特性开发 |
| CCG | Codex + Gemini + Claude 三模型综合 | 需要多模型视角的复杂任务 |
| Autopilot | 单主导 Agent，自主端到端执行 | 流程简单但工作量较大的开发 |
| Ultrawork | 最大化并行度，减小管理开销 | 大规模并行修复/重构 |
| Ralph | 带验证/修复循环的持久执行 | 必须保证"真正做完"的任务 |
| Ralplan | 规划优先，迭代达成共识后才执行 | 核心架构变更等需详细设计的复杂特性 |

> 需在 `~/.claude/settings.json` 中启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`

### 7.5 安装与使用

**Claude Code 插件**：

```bash
/plugin marketplace add    # 添加插件源
/plugin install            # 安装 oh-my-claudecode
```

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

---

## 八、常见工作流

### 8.1 新功能开发工作流（feature-dev + ralph-loop）

```bash
# 1. 确保已安装核心插件
/plugin marketplace add anthropics/claude-code-plugins
/plugin install feature-dev ralph-loop

# 2. feature-dev 规划（7 阶段，生成 tasks.md）
/feature-dev

# 3. ralph-loop 执行
/ralph-loop --tasks=changes/2026-05-13-auth-module/tasks.md

# 4. 验证并提交
pytest
git add .
git commit -m "feat: 实现用户认证（通过 feature-dev + ralph-loop）"
```

### 8.2 快速修复工作流

```bash
# 1. 创建简单任务文件
cat > quick-fix.md << EOF
- [ ] 修复登录接口的密码验证逻辑
- [ ] 修复后运行测试
EOF

# 2. ralph-loop 执行
/ralph-loop --tasks=quick-fix.md
```

### 8.3 Bug 修复流程（Ralph Wiggum 自主循环）

Ralph Wiggum 是由 Geoffrey Huntley 提出的自主循环技术，核心理念是"不写对代码不准下班"——AI Agent 在代码未通过验证前不会停止工作。

关键转变：从"人驱动循环"变为"AI 自驱动循环"，人只需要定义目标和验收标准。

**双条件退出门**：
1. **客观条件**：所有测试通过
2. **主观条件**：AI 自信度达到阈值（如 >= 0.9）

两个条件同时满足才会退出循环。

### 8.4 多 Agent 协作工作流（oh-my-claudecode）

**Team 模式流程**：`planner`/`architect` 分析需求 → `writer`/`designer` 搭建 PRD → `executor` 分阶段实现 → `verifier`/`qa-tester`/`critic` 质量闭环

### 8.5 规范驱动开发工作流（OpenSpec + ralph-loop）

```bash
# 1. OpenSpec 规划需求
/opsx:new
/opsx:continue

# 2. 生成 tasks.md 后用 ralph-loop 执行
/ralph-loop --tasks=changes/2026-05-13-my-feature/tasks.md

# 3. OpenSpec 验证并归档
/opsx:verify
/opsx:archive
```

---

## 九、上下文工程与性能优化

### 9.1 上下文腐蚀（Context Rot）

随着上下文窗口中的 tokens 增加，模型从上下文中准确回忆信息的能力反而下降。上下文必须被视作一种有限资源，且具有边际收益递减。

### 9.2 有效上下文设计原则

| 组件 | 设计原则 | 常见误区 |
|------|---------|---------|
| 系统提示 | 信息层级"刚刚好"，分区组织 | 过度硬编码 if-else / 过于空泛 |
| 工具 | 职责单一、低重叠、接口语义清晰 | 臃肿工具集，选哪个工具都不清楚 |
| 示例 | 精挑多样且典型的示例 | 把所有边界条件罗列塞进提示 |

### 9.3 JIT 上下文 vs 预加载

| 方式 | 做法 | 特点 |
|------|------|------|
| 预加载 | 推理前一次性检索所有相关数据 | 快但可能过时 |
| JIT 上下文 | 维护轻量化引用，运行时动态加载 | 按需获取，渐进式披露 |

混合策略更有效：前置加载少量"高价值"上下文保证速度，同时提供 glob、grep 等原语让智能体即时检索。

### 9.4 长时程任务的上下文管理

| 方法 | 适用场景 | 核心思想 |
|------|---------|---------|
| **压缩整合（Compaction）** | 需要长对话连续性 | 接近上限时高保真总结，用摘要重启新窗口 |
| **结构化笔记** | 有里程碑的迭代式开发 | 关键信息写入上下文外的持久化存储 |
| **子代理架构** | 复杂研究与分析 | 主代理规划，子代理在干净窗口中深挖 |

### 9.5 Harness Engineering：验证与反馈循环

**Hooks（确定性反馈循环）**——最有效的单项 Harness 投入：

```bash
#!/bin/bash
cd "$CLAUDE_PROJECT_DIR"
OUTPUT=$(bun run --parallel \
  "biome check . --write --unsafe || biome check . --write --unsafe" \
  "turbo run typecheck" 2>&1)

if [ $? -ne 0 ]; then
  echo "$OUTPUT" >&2
  exit 2  # 退出码 2 重新激活 Agent 来修复错误
fi
# 成功：静默。不污染上下文。
```

逻辑：**成功时保持安静，只有失败才出现**。错误变成反馈信号，而非用通过测试的输出淹没上下文窗口。

### 9.6 生产 Harness 配置清单

**Prompt 层**：
- System prompt 定义角色、范围和 Agent 不应做的事
- 输出格式约束

**Context 层**：
- AGENTS.md 不超过 60 行，只保留普遍适用的约束
- Skills：调试、重构、PR 创建、依赖审计
- MCP servers：同时只激活 2-3 个，禁用不用的
- Memory：对话缓冲区 + 结构化长期规则存储

**Harness 层**：
- Pre-commit hook：biome + typecheck
- PostToolUse hook：每次文件写入后向 Agent 报告 linter 错误
- Stop hook：只运行变更的测试文件，返回错误
- Coverage hook：覆盖率低于阈值时告警
- 循环检测：同一文件在同一会话中被编辑 3+ 次时标记
- Sub-agent 模式：研究、代码追踪、QA
- 升级规则：连续 3+ 次工具调用受阻时停止并询问

---

## 十、AI 工程三层范式

### 10.1 三层递进

| 层次 | 关注点 | 核心问题 |
|------|--------|---------|
| **Prompt Engineering** | 概率空间 | 如何精确描述任务 |
| **Context Engineering** | 信息空间 | 如何管理上下文窗口 |
| **Harness Engineering** | 运行系统 | 如何构建验证与反馈循环 |

### 10.2 三层故障诊断框架

| 故障现象 | 问题层次 | 解决方向 |
|---------|---------|---------|
| 输出格式错误、范围偏差 | Prompt Engineering | 收紧指令，补上范例，约束输出格式 |
| 杜撰代码库事实、选错工具 | Context Engineering | 加检索、修工具描述、调整记忆结构 |
| 长任务漂移、循环、破坏性改动、静默失败 | Harness Engineering | 加 Sub-agent 隔离、循环检测、权限 Hook |

**关键洞察**：编码 Agent 会话中期的质量下降十次有九次源自上下文窗口饱和或反馈循环缺位，而非原始指令措辞不到位。直觉通常是重写 Prompt，但实际问题往往在更高层。

### 10.3 2026 年实战经验总结

1. **从最小 AGENTS.md 开始**：不超过 60 行，不列目录结构
2. **立刻加一个验证 Hook**：每次 Agent 停止后运行 typecheck 或 lint
3. **只保留最常用的 2 个 MCP 工具**：工具描述膨胀是上下文饱和最常见的成因
4. **只有 Agent 因同一原因失败两次时才添加 Skill**：过早加载不适用的指令会产生负面效果
5. **超过 15 次工具调用才能解决的任务，交给 Sub-agent**：上下文腐化是可量化的实际现象
6. **把 git 当作 Agent 的原生记忆**：提交消息、小粒度 diff、分支历史

---

## 十一、避坑指南

| 问题 | 建议 |
|------|------|
| ralph-loop 想暂停 | `Ctrl+C` 暂停后状态自动保存，用 `/ralph-loop --resume` 恢复 |
| 长时间任务 token 消耗大 | 合理选择模型层级，探索用 Haiku，规划用 Opus |
| Claude 跑偏 | 及时打断，用更明确的描述重新沟通 |
| 找不到相关代码 | 先让 Claude 探索项目结构，再给出具体需求 |
| OMC Team 模式不生效 | 需启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` |
| 自定义技能不稳定 | 先从小场景验证，再推广到团队 |
| 重复劳动多 | 善用 notepad wisdom / boulder.json 积累项目经验 |
| 上下文窗口饱和 | 只保留 2-3 个 MCP 工具，CLAUDE.md 控制在 60-200 行 |
| 规范缺失导致跑偏 | 先生成 CLAUDE.md / AGENTS.md 规范文件再执行 |

---

## 十二、命令速查

### 基础命令

| 命令 | 说明 |
|------|------|
| `claude` | 启动终端版 Claude Code |
| `/help` | 查看帮助 |
| `/mcp` | 查看 MCP Server 状态 |
| `/plugin` | 插件管理 |
| `/new` | 新会话 |
| `/save` | 保存会话 |
| `/load` | 加载会话 |

### 核心插件命令

| 命令 | 说明 |
|------|------|
| `/feature-dev` | 7 阶段引导式开发 |
| `/ralph-loop` | 启动循环执行 |
| `/ralph-loop --tasks=x.md` | 指定任务文件 |
| `/ralph-loop --status` | 查看执行状态 |
| `/ralph-loop --resume` | 恢复暂停的执行 |
| `/cancel-ralph` | 停止 ralph-loop |
| `/autopilot` | OMC 单 Agent 自主执行 |
| `/team` | OMC 多 Agent 流水线 |
| `/ralph` | OMC 持久验证执行 |

### MCP 命令

| 命令 | 说明 |
|------|------|
| `claude mcp add <name>` | 添加 MCP Server |
| `claude mcp list` | 列出已配置的 MCP Server |
| `claude mcp get <name>` | 查看 MCP Server 详情 |
| `claude mcp remove <name>` | 移除 MCP Server |

---

## 十三、相关资源

| 资源 | 链接 |
|------|------|
| Claude Code 官方文档 | https://docs.anthropic.com/en/docs/claude-code |
| Claude Desktop 下载 | https://claude.ai/download |
| Claude Code 官方插件 | https://github.com/anthropics/claude-code-plugins |
| MCP 官方协议文档 | https://modelcontextprotocol.io/ |
| MCP 中文文档 | https://mcp-docs.cn/ |
| oh-my-claudecode（19 Agent 编排） | https://github.com/yeachan-heo/oh-my-claudecode |
| Ralph for Claude Code（自主循环） | https://github.com/frankbria/ralph-claude-code |
| OpenSpec（规范驱动开发） | https://github.com/fission-ai/openspec |
| Superpowers（行为规范框架） | https://github.com/obra/superpowers |
| GitHub MCP 示例 | https://github.com/modelcontextprotocol/servers |
