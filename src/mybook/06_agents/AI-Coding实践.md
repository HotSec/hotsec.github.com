# AI Coding 实践

## AGENTS.md 编写规范

### 什么是 AGENTS.md

AGENTS.md 是项目根目录下的配置文件，指导 AI 编码助手理解项目上下文、编码规范和工作流程。

### 基本结构

```markdown
# Project: My Application

## Overview
Brief description of the project, its purpose, and architecture.

## Tech Stack
- Language: Go 1.22
- Framework: Gin
- Database: PostgreSQL 16
- Cache: Redis 7
- Message Queue: RabbitMQ
- Container: Docker + Kubernetes

## Project Structure
```
├── cmd/           # Application entrypoints
├── internal/      # Private application code
│   ├── handler/   # HTTP handlers
│   ├── service/   # Business logic
│   ├── repo/      # Data access
│   └── model/     # Domain models
├── pkg/           # Public libraries
├── api/           # API definitions (Proto/OpenAPI)
├── configs/       # Configuration files
├── deployments/   # K8s manifests
└── scripts/       # Build and deploy scripts
```

## Coding Standards
- Follow Effective Go guidelines
- Use golangci-lint with project config
- Error wrapping: fmt.Errorf("service: %w", err)
- Context as first parameter
- No global state

## Testing
- Unit tests: go test ./...
- Integration tests: make test-integration
- Coverage target: > 80%
- Table-driven tests preferred

## Git Workflow
- Branch naming: feature/JIRA-123-description
- Commit format: type(scope): description
- Types: feat, fix, refactor, docs, test, chore

## Common Commands
- Build: make build
- Run: make run
- Test: make test
- Lint: make lint
- Docker: make docker-build
```

### 最佳实践

1. **保持更新**：项目结构变化时同步更新
2. **具体明确**：避免模糊描述，给出具体命令
3. **包含示例**：关键模式提供代码示例
4. **标注例外**：特殊处理的地方要说明
5. **分层组织**：从概览到细节

***

## AI 辅助编码工作流

### 1. 需求分析

```
Prompt: 分析以下需求，拆解为技术任务
需求：用户注册功能，支持邮箱和手机号注册
```

AI 输出：
- 数据模型设计（User 表）
- API 接口定义（POST /api/v1/auth/register）
- 参数验证规则
- 密码加密策略
- 邮箱/手机验证流程
- 错误码定义

### 2. 代码生成

```
Prompt: 根据 AGENTS.md 中的项目规范，实现用户注册功能
要求：
1. 使用 internal/handler, internal/service, internal/repo 分层
2. 参数验证使用 validator
3. 密码使用 bcrypt 加密
4. 返回标准错误码
```

### 3. 代码审查

```
Prompt: 审查以下代码，关注：
1. 安全漏洞（SQL注入、XSS等）
2. 错误处理是否完善
3. 是否符合项目编码规范
4. 性能问题
5. 可测试性
```

### 4. 测试生成

```
Prompt: 为以下函数生成表驱动测试，覆盖：
1. 正常路径
2. 边界条件
3. 错误路径
4. 并发安全
```

### 5. 文档生成

```
Prompt: 根据代码生成 API 文档，格式为 OpenAPI 3.0
```

***

## Prompt 工程最佳实践

### 结构化 Prompt

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

### 常用模式

| 模式 | 描述 | 示例 |
|------|------|------|
| Chain of Thought | 分步推理 | "一步步分析..." |
| Few-shot | 提供示例 | "参考以下示例..." |
| Role Play | 角色扮演 | "你是安全专家..." |
| Self-Critique | 自我审查 | "审查你的回答..." |
| Decomposition | 任务分解 | "将需求拆解为..." |

### 代码相关 Prompt 模板

**Bug 修复**：
```
## Bug 描述
[描述问题现象]

## 复现步骤
1. ...
2. ...

## 期望行为
[描述期望的正确行为]

## 相关代码
[粘贴代码]

请分析根因并修复。
```

**重构**：
```
## 重构目标
[描述重构目的]

## 当前代码
[粘贴代码]

## 约束
1. 不改变外部行为
2. 保持向后兼容
3. 提高可测试性

请重构并说明改动。
```

**性能优化**：
```
## 性能问题
[描述瓶颈]

## 当前实现
[粘贴代码]

## 性能指标
- 当前 QPS: 100
- 目标 QPS: 1000
- P99 延迟: 500ms → 50ms

请优化并解释原理。
```

***

## AI Coding 工具对比

| 工具 | 类型 | 特点 |
|------|------|------|
| GitHub Copilot | IDE 插件 | 实时代码补全 |
| Cursor | IDE | 内置 AI 对话 |
| Trae | IDE | 深度代码理解 |
| Aider | CLI | 终端 AI 编码 |
| Continue | IDE 插件 | 开源，可自定义模型 |

### 工具选择建议

| 场景 | 推荐工具 |
|------|----------|
| 日常编码 | GitHub Copilot / Cursor |
| 大规模重构 | Trae / Aider |
| 代码审查 | Trae |
| 学习新技术 | 任意 + 对话模式 |
| 团队协作 | Continue + 私有模型 |

***

## 主流 AI Coding 工具详解

### Claude Code

Anthropic 推出的终端 AI 编码工具，直接在命令行中运行。

**核心特性**：
- 基于终端的交互式编码助手
- 支持多文件编辑、代码搜索、Git 操作
- 内置安全审查机制，不会自动提交代码
- 支持 MCP（Model Context Protocol）扩展

**安装与使用**：
```bash
# 安装
npm install -g @anthropic-ai/claude-code

# 在项目目录中启动
cd your-project
claude

# 常用命令
claude "解释这个项目的架构"
claude "重构 auth 模块，使用依赖注入"
claude "为 handler 层编写单元测试"
```

**CLAUDE.md 配置**：
项目根目录放置 `CLAUDE.md`，Claude Code 启动时自动读取：

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

**最佳实践**：
1. **精确描述任务**：`claude "在 internal/service/user.go 中添加 UpdateProfile 方法"` 优于 `claude "加个更新功能"`
2. **分步执行**：复杂任务拆分为多个步骤，逐步验证
3. **利用上下文**：在项目目录中运行，Claude Code 会自动读取项目文件
4. **审查输出**：始终 review 生成的代码再提交

### OpenCode

开源的终端 AI 编码工具，支持多种 LLM 后端。

**核心特性**：
- 开源免费，可自定义 LLM 后端
- 支持 OpenAI、Anthropic、本地模型（Ollama）
- TUI 界面，操作直观
- 支持多会话管理

**安装与使用**：
```bash
# 安装
go install github.com/opencode-ai/opencode@latest

# 配置模型（~/.opencode/config.json）
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "apiKey": "sk-..."
}

# 或使用本地模型
{
  "provider": "ollama",
  "model": "codellama:34b"
}

# 启动
cd your-project
opencode
```

**最佳实践**：
1. **选择合适模型**：复杂任务用 Claude/GPT-4，简单补全用本地模型
2. **配置项目上下文**：通过 `.opencodeignore` 排除无关文件
3. **会话管理**：不同任务使用不同会话，保持上下文清晰

### Trae

字节跳动推出的 AI IDE，基于 VS Code 深度定制。

**核心特性**：
- 内置 AI 对话与代码生成
- 深度代码理解，支持整个项目上下文
- Skill 系统：可定义可复用的 AI 技能
- Rules 系统：项目级 AI 行为约束
- Builder 模式：自动化多步骤任务执行

**Rules 配置**（`.trae/rules/`）：

项目级规则文件，指导 AI 助手行为：

```markdown
<!-- .trae/rules/coding-style.md -->
# 编码风格规范

## Go 代码规范
- 使用 golangci-lint
- 错误包装：fmt.Errorf("module: %w", err)
- Context 作为第一个参数
- 表驱动测试优先

## 命名规范
- 包名：小写单词，不用下划线
- 接口名：-er 后缀（Reader, Writer）
- 常量：驼峰，不全大写
```

```markdown
<!-- .trae/rules/project-structure.md -->
# 项目结构规范

## 目录约定
- cmd/：应用入口
- internal/：私有代码
- pkg/：公共库
- api/：API 定义

## 分层架构
handler → service → repo → model
禁止跨层调用，禁止 handler 直接访问 repo
```

**Skill 配置**（`.trae/skills/`）：

可复用的 AI 技能定义：

```markdown
<!-- .trae/skills/api-endpoint.md -->
---
name: api-endpoint
description: 创建新的 API 端点
---

# 创建 API 端点

## 步骤
1. 在 internal/model/ 定义请求/响应结构体
2. 在 internal/handler/ 添加处理函数
3. 在 internal/service/ 添加业务逻辑
4. 在 internal/repo/ 添加数据访问
5. 在路由中注册端点
6. 编写单元测试

## 代码模板
[Handler 模板]
[Service 模板]
[Repo 模板]
[Test 模板]
```

**最佳实践**：
1. **Rules 分主题管理**：编码风格、项目结构、安全规范各一个文件
2. **Skill 模板化**：将常见开发模式定义为 Skill，确保一致性
3. **Builder 模式**：复杂任务用 Builder 自动执行多步骤
4. **上下文窗口**：大项目注意上下文窗口限制，聚焦当前模块

### Cursor

基于 VS Code 的 AI IDE，早期入局的代表产品。

**核心特性**：
- Tab 补全：智能代码补全
- Chat 模式：项目级代码对话
- Composer：多文件编辑模式
- `.cursorrules`：项目级规则配置

**.cursorrules 配置**：
```markdown
# 项目规范
技术栈：Go / Gin / PostgreSQL
编码风格：遵循 Effective Go
测试：表驱动测试，覆盖率 > 80%
```

### 工具对比总结

| 特性 | Claude Code | OpenCode | Trae | Cursor | Aider |
|------|------------|----------|------|--------|-------|
| 运行环境 | 终端 | 终端 | IDE | IDE | 终端 |
| 开源 | ❌ | ✅ | ❌ | ❌ | ✅ |
| 自定义模型 | ❌ | ✅ | ❌ | 部分 | ✅ |
| 项目规则 | CLAUDE.md | config | Rules/Skills | .cursorrules | .aider* |
| 多文件编辑 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Git 集成 | ✅ | ✅ | ✅ | ✅ | ✅ |
| MCP 支持 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 上下文理解 | 强 | 中 | 强 | 强 | 中 |
| 学习曲线 | 低 | 中 | 低 | 低 | 中 |

***

## 项目约束文档规范

### 概述

项目约束文档（Rules / AGENTS.md / CLAUDE.md 等）是 AI Coding 的核心配置，决定了 AI 助手对项目的理解深度和行为边界。

### 通用原则

1. **精确性**：避免模糊描述，给出具体命令和代码示例
2. **可操作性**：每条规则都应该是可验证的
3. **分层组织**：从概览到细节，从全局到模块
4. **持续更新**：项目演进时同步更新约束文档

### 推荐的约束文档结构

```
project/
├── AGENTS.md              # 通用项目说明（所有 AI 工具通用）
├── CLAUDE.md              # Claude Code 专用（可选）
├── .cursorrules           # Cursor 专用（可选）
├── .trae/
│   ├── rules/
│   │   ├── coding-style.md    # 编码风格
│   │   ├── project-structure.md # 项目结构
│   │   ├── security.md        # 安全规范
│   │   └── testing.md         # 测试规范
│   └── skills/
│       ├── api-endpoint.md    # 创建 API 端点
│       ├── db-migration.md    # 数据库迁移
│       └── bug-fix.md         # Bug 修复流程
└── .github/
    └── copilot-instructions.md # GitHub Copilot 专用
```

### 约束文档内容清单

**必填项**：
- [ ] 项目概述与架构
- [ ] 技术栈与版本
- [ ] 目录结构与分层约定
- [ ] 编码规范（命名、错误处理、日志）
- [ ] 常用命令（构建、测试、部署）

**推荐项**：
- [ ] Git 工作流（分支命名、提交格式）
- [ ] 测试规范（覆盖率、测试风格）
- [ ] 安全规范（认证、加密、敏感数据）
- [ ] 性能要求（延迟、吞吐量目标）
- [ ] 已知问题与特殊处理

**可选项**：
- [ ] API 设计规范
- [ ] 数据库迁移规范
- [ ] 代码审查清单
- [ ] 部署流程

### 各工具约束文档对照

| 工具 | 文件 | 格式 | 特殊能力 |
|------|------|------|----------|
| 通用 | AGENTS.md | Markdown | 所有工具通用 |
| Claude Code | CLAUDE.md | Markdown | 支持 MCP 上下文 |
| Cursor | .cursorrules | Markdown | 项目级规则 |
| Trae | .trae/rules/*.md | Markdown | 分主题管理 + Skill 系统 |
| GitHub Copilot | .github/copilot-instructions.md | Markdown | 仓库级指令 |
| Aider | .aider.conf.yml | YAML | 模型与文件配置 |

***

## Skill 文档规范

### 什么是 Skill

Skill 是 Trae 等 AI IDE 中的可复用技能定义，将常见开发模式封装为标准化流程，确保 AI 助手按照项目规范生成代码。

### Skill 文档结构

```markdown
---
name: skill-name
description: 技能描述
---

# 技能名称

## 触发条件
描述何时使用此技能

## 步骤
1. 第一步：具体操作
2. 第二步：具体操作
3. ...

## 代码模板
[相关代码模板]

## 验证
- [ ] 检查项1
- [ ] 检查项2

## 注意事项
- 注意点1
- 注意点2
```

### 推荐的 Skill 清单

| Skill | 描述 | 适用场景 |
|-------|------|----------|
| skill-creator | 创建新 Skill | 定义可复用 AI 技能 |
| init-project | 项目初始化 | 新建项目 |
| scaffold-crud | CRUD 脚手架生成 | 快速生成增删改查代码 |
| debug-troubleshoot | 调试排障 | Bug 排查与修复 |
| git-workflow | Git 工作流 | 分支/提交/PR 规范 |
| api-design | API 设计 | RESTful 接口设计 |
| db-schema-design | 数据库设计 | 表结构设计 |
| docker-containerize | 容器化 | Dockerfile 与 compose |
| ci-pipeline | CI/CD 流水线 | 自动化构建部署 |
| error-handling | 错误处理规范 | 统一错误处理 |
| config-management | 配置管理 | 配置分层与密钥管理 |
| logging-observability | 日志与可观测性 | 日志/指标/追踪 |
| frontend-component | 前端组件开发 | UI 组件创建 |
| mcp-server | MCP Server 开发 | AI 工具扩展 |
| prompt-template | Prompt 模板管理 | AI 提示词模板 |
| api-endpoint | 创建 REST API 端点 | 新增接口 |
| db-migration | 数据库迁移 | 表结构变更 |
| bug-fix | Bug 修复流程 | 问题排查 |
| refactor | 重构流程 | 代码优化 |
| add-feature | 新功能开发 | 需求实现 |
| code-review | 代码审查 | PR 审查 |
| security-audit | 安全审计 | 安全检查 |
| performance-opt | 性能优化 | 性能调优 |
| write-test | 编写测试 | 测试覆盖 |
| add-docs | 添加文档 | 文档补充 |

### 流行 AI 开发 Skill 详解

#### skill-creator：创建新 Skill

```markdown
---
name: skill-creator
description: 创建新的可复用 AI Skill
---

# 创建 Skill

## 触发条件
用户要求创建/添加一个新的 Skill

## 步骤
1. 确认 Skill 名称和描述
2. 定义触发条件（何时使用此 Skill）
3. 编写操作步骤（具体到文件路径和操作）
4. 提供代码模板（减少 AI 猜测）
5. 列出验证清单（完成后检查项）
6. 标注注意事项（例外和陷阱）
7. 保存到 .trae/skills/<skill-name>.md

## 验证
- [ ] Skill 文件格式正确（含 frontmatter）
- [ ] 步骤具体可执行
- [ ] 包含代码模板
- [ ] 有验证清单
```

#### init-project：项目初始化

```markdown
---
name: init-project
description: 初始化新项目，生成标准目录结构和配置文件
---

# 项目初始化

## 步骤
1. 确认技术栈和项目类型
2. 创建标准目录结构（cmd/internal/pkg/api/configs）
3. 生成 go.mod / package.json 等依赖文件
4. 创建 Makefile（build/test/lint/run 目标）
5. 创建 .gitignore
6. 创建 AGENTS.md 项目约束文档
7. 创建 Dockerfile 和 docker-compose.yml
8. 初始化 Git 仓库并首次提交

## 验证
- [ ] 项目可构建（make build）
- [ ] 测试可运行（make test）
- [ ] Lint 可通过（make lint）
- [ ] AGENTS.md 内容完整
```

#### scaffold-crud：CRUD 脚手架生成

```markdown
---
name: scaffold-crud
description: 根据数据模型自动生成 CRUD 全栈代码
---

# CRUD 脚手架

## 步骤
1. 获取数据模型定义（结构体/JSON Schema）
2. 生成 Model 层（数据模型 + 验证标签）
3. 生成 Repo 层（数据库操作 + 接口定义）
4. 生成 Service 层（业务逻辑 + 错误处理）
5. 生成 Handler 层（HTTP 处理 + 参数绑定）
6. 生成路由注册代码
7. 生成 Swagger 文档注解
8. 生成单元测试（表驱动测试）

## 代码模板
[按项目分层提供各层模板]

## 验证
- [ ] 所有 CRUD 接口可正常调用
- [ ] 参数验证生效
- [ ] 错误响应格式统一
- [ ] 单元测试通过
```

#### debug-troubleshoot：调试排障

```markdown
---
name: debug-troubleshoot
description: 系统化排查和修复 Bug
---

# 调试排障

## 步骤
1. 收集信息：错误日志、复现步骤、环境信息
2. 定位范围：确定问题所在模块/文件/函数
3. 分析根因：阅读相关代码，追踪调用链
4. 提出假设：列出可能的根因（优先级排序）
5. 验证假设：添加调试日志或编写最小复现代码
6. 实施修复：修改代码，确保不引入新问题
7. 回归测试：验证修复有效且无副作用
8. 补充测试：为该 Bug 添加回归测试

## 注意事项
- 不要只修症状，要找到根因
- 修复后必须添加回归测试
- 记录排查过程，方便后续参考
```

#### git-workflow：Git 工作流

```markdown
---
name: git-workflow
description: 规范化 Git 操作（分支/提交/PR）
---

# Git 工作流

## 步骤
1. 从 main 创建功能分支：feature/JIRA-123-description
2. 开发并提交，遵循 Conventional Commits：
   - feat(scope): 新功能
   - fix(scope): 修复
   - refactor(scope): 重构
   - docs(scope): 文档
   - test(scope): 测试
   - chore(scope): 构建/工具
3. 推送并创建 PR，描述变更内容和测试方法
4. 代码审查后合并，删除功能分支

## 验证
- [ ] 分支命名符合规范
- [ ] 提交信息格式正确
- [ ] PR 描述完整
- [ ] CI 通过
```

#### api-design：API 设计

```markdown
---
name: api-design
description: 设计 RESTful API 接口
---

# API 设计

## 步骤
1. 明确资源和关系（名词而非动词）
2. 定义 URL 路径（复数名词，嵌套不超过两层）
3. 选择 HTTP 方法（GET/POST/PUT/PATCH/DELETE）
4. 定义请求参数（Path/Query/Body）
5. 定义响应格式（统一信封格式）
6. 定义错误码体系
7. 编写 OpenAPI 3.0 文档
8. 生成接口 Mock

## 规范
- URL: /api/v1/resources/{id}
- 响应: { "code": 0, "message": "ok", "data": {...} }
- 分页: ?page=1&page_size=20
- 过滤: ?status=active&created_after=2024-01-01
```

#### db-schema-design：数据库设计

```markdown
---
name: db-schema-design
description: 设计数据库表结构
---

# 数据库设计

## 步骤
1. 分析业务实体和关系
2. 设计表结构（字段/类型/约束/索引）
3. 遵循命名规范（snake_case，表名复数）
4. 添加标准字段（id/created_at/updated_at/deleted_at）
5. 设计索引（主键/唯一/联合/外键）
6. 编写迁移脚本（up/down）
7. 生成 Model 代码

## 规范
- 主键：BIGINT UNSIGNED AUTO_INCREMENT
- 时间：DATETIME(3)，UTC 存储
- 软删除：deleted_at IS NULL
- 金额：DECIMAL(18,2)，禁止 FLOAT
- 状态：TINYINT + 枚举常量
```

#### docker-containerize：容器化

```markdown
---
name: docker-containerize
description: 将应用容器化
---

# 容器化

## 步骤
1. 编写多阶段 Dockerfile（构建阶段 + 运行阶段）
2. 选择精简基础镜像（alpine/distroless）
3. 配置健康检查（HEALTHCHECK）
4. 设置非 root 用户运行
5. 编写 docker-compose.yml（开发环境）
6. 配置环境变量和配置挂载
7. 优化镜像大小（.dockerignore + 层缓存）

## 验证
- [ ] 镜像可构建
- [ ] 容器可启动并健康
- [ ] 镜像大小合理（< 100MB）
- [ ] 非 root 用户运行
```

#### ci-pipeline：CI/CD 流水线

```markdown
---
name: ci-pipeline
description: 创建 CI/CD 流水线配置
---

# CI/CD 流水线

## 步骤
1. 选择 CI 平台（GitHub Actions / GitLab CI / Jenkins）
2. 定义流水线阶段（lint → test → build → deploy）
3. 配置缓存（依赖缓存加速构建）
4. 配置环境变量和密钥
5. 添加质量门禁（覆盖率/Lint/安全扫描）
6. 配置部署阶段（staging/production）
7. 添加通知（Slack/钉钉/邮件）

## 验证
- [ ] 流水线可触发运行
- [ ] 所有阶段通过
- [ ] 缓存生效
- [ ] 部署成功
```

#### error-handling：错误处理规范

```markdown
---
name: error-handling
description: 统一项目错误处理模式
---

# 错误处理规范

## 步骤
1. 定义错误码体系（全局唯一错误码）
2. 创建错误类型（业务错误/系统错误/第三方错误）
3. 实现错误包装链（fmt.Errorf("module: %w", err)）
4. 统一错误响应格式
5. 添加错误日志（结构化日志 + 错误链）
6. 配置错误监控（Sentry/告警）

## 代码模板
```go
type BizError struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Err     error  `json:"-"`
}

func (e *BizError) Unwrap() error { return e.Err }
func (e *BizError) Error() string { return fmt.Sprintf("[%d] %s: %v", e.Code, e.Message, e.Err) }
```
```

#### config-management：配置管理

```markdown
---
name: config-management
description: 统一项目配置管理方案
---

# 配置管理

## 步骤
1. 定义配置结构体（强类型）
2. 配置文件分层（默认值 < 配置文件 < 环境变量 < 命令行参数）
3. 支持热更新（Watch 配置文件变化）
4. 敏感配置加密存储（Vault/KMS）
5. 配置验证（启动时校验必填项和格式）
6. 配置文档（自动生成配置说明）

## 规范
- 配置文件：YAML 格式
- 环境变量：APP_ 前缀，下划线分隔
- 密钥管理：禁止明文存储，使用 Vault/KMS
- 默认值：开发环境开箱即用
```

#### logging-observability：日志与可观测性

```markdown
---
name: logging-observability
description: 建立项目日志和可观测性体系
---

# 日志与可观测性

## 步骤
1. 选择日志库（zap/zerolog）和格式（JSON 结构化）
2. 定义日志级别规范（DEBUG/INFO/WARN/ERROR）
3. 添加请求追踪（RequestID 贯穿调用链）
4. 配置指标采集（Prometheus metrics）
5. 配置链路追踪（OpenTelemetry/Jaeger）
6. 定义告警规则（错误率/延迟/可用性）

## 规范
- 日志格式：JSON，含 time/level/msg/request_id/trace_id
- 禁止 fmt.Println，统一使用日志库
- ERROR 级别必须触发告警
- 关键操作必须记录审计日志
```

#### frontend-component：前端组件开发

```markdown
---
name: frontend-component
description: 创建前端 UI 组件
---

# 前端组件开发

## 步骤
1. 确认组件职责和接口（Props/Events/Slots）
2. 创建组件文件（.vue/.tsx + .css/.module.css + .test.tsx）
3. 实现 Props 类型定义和默认值
4. 实现组件逻辑和模板
5. 添加样式（CSS Modules / Tailwind）
6. 编写组件测试（渲染/交互/边界）
7. 编写组件文档（Storybook / README）
8. 导出组件到 index.ts

## 验证
- [ ] Props 类型完整
- [ ] 无障碍（ARIA）属性
- [ ] 响应式适配
- [ ] 测试通过
```

#### mcp-server：MCP Server 开发

```markdown
---
name: mcp-server
description: 创建 MCP（Model Context Protocol）Server
---

# MCP Server 开发

## 步骤
1. 确认 MCP Server 提供的工具/资源/提示
2. 初始化项目（TypeScript/Python SDK）
3. 定义工具接口（名称/描述/参数 Schema）
4. 实现工具逻辑
5. 配置传输方式（stdio/SSE）
6. 编写配置说明（claude_desktop_config.json）
7. 测试工具调用

## 配置示例
```json
{
  "mcpServers": {
    "my-tool": {
      "command": "node",
      "args": ["./mcp-server/index.js"]
    }
  }
}
```
```

#### prompt-template：Prompt 模板管理

```markdown
---
name: prompt-template
description: 创建和管理 AI Prompt 模板
---

# Prompt 模板管理

## 步骤
1. 确认 Prompt 用途（代码生成/审查/测试/文档）
2. 定义模板变量（{{language}}/{{framework}}/{{task}}）
3. 编写结构化 Prompt（角色/上下文/任务/要求/输出格式）
4. 添加 Few-shot 示例
5. 测试并迭代优化
6. 保存到 prompts/ 目录

## 模板规范
- 文件名：{category}-{purpose}.md
- 变量：双花括号 {{variable}}
- 示例：至少包含 1 个正例和 1 个反例
- 版本：模板头部标注版本号和更新日期
```

### Skill 编写最佳实践

1. **步骤具体**：每步给出明确的文件路径和操作
2. **包含模板**：提供代码模板减少 AI 猜测
3. **验证清单**：列出完成后的检查项
4. **标注例外**：说明特殊情况的处理方式
5. **保持更新**：项目演进时同步更新 Skill

***

## AI Coding 最佳实践总结

### 1. 项目配置

- ✅ 始终配置项目约束文档（AGENTS.md / Rules）
- ✅ 约束文档保持更新，与项目同步
- ✅ 分主题管理规则，避免单文件过长
- ✅ 提供具体的代码示例和命令

### 2. 交互策略

- ✅ 精确描述任务，包含文件路径和函数名
- ✅ 复杂任务拆分为多步，逐步验证
- ✅ 提供上下文：相关代码、错误日志、期望行为
- ✅ 审查 AI 输出，不要盲目信任

### 3. 代码质量

- ✅ AI 生成的代码必须通过 Lint 和测试
- ✅ 安全审查：检查注入、认证、敏感数据
- ✅ 性能审查：关注 N+1 查询、内存泄漏
- ✅ 保持代码风格一致

### 4. 效率提升

- ✅ 将常见模式定义为 Skill，避免重复描述
- ✅ 利用项目约束文档减少每次对话的上下文说明
- ✅ 善用 Builder/Composer 模式处理多文件变更
- ✅ Git 集成：让 AI 帮助提交信息生成和代码审查

### 5. 安全注意事项

- ⚠️ 不要将 API Key、密码等敏感信息写入约束文档
- ⚠️ 审查 AI 生成的认证和授权代码
- ⚠️ 不要让 AI 自动提交代码到生产分支
- ⚠️ 定期审查 AI 生成的依赖项，检查已知漏洞
