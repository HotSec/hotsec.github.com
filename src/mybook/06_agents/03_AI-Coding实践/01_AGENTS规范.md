# AI Coding — AGENTS 与项目约束规范

## AGENTS.md 编写规范

### 什么是 AGENTS.md

AGENTS.md 是一个简单的开放格式，用于指导 AI Coding Agent 在项目中工作。可以理解为**给 AI 看的 README**——README.md 是给人类看的项目说明，AGENTS.md 则是给 AI Agent 看的项目指令，包含构建命令、编码规范、测试要求、安全注意事项等 AI 需要知道的上下文。

#### 前世今生

这个概念最早由 Anthropic 通过 Claude Code 的 **CLAUDE.md** 普及。Claude Code 运行时会自动加载当前目录下的 CLAUDE.md，把内容注入到发给模型的请求中。维护好一份上下文文件，Agent 的表现就会变好，形成正向循环。

随后各家 AI Coding 工具跟进了自己的版本：

| 工具 | 上下文文件 |
|------|-----------|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursorrules` / `.cursor/rules` |
| Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `GEMINI.md` |
| Cline | `.clinerules` |
| AMP (Sourcegraph) | `AGENT.md`（单数） |
| OpenAI Codex | `AGENTS.md`（复数） |

2025 年 5 月，Sourcegraph 旗下的 AMP 率先提议统一标准，OpenAI 随后宣布用 `AGENTS.md`（复数），AMP 主动对齐。最终 AGENTS.md 成为事实标准，由 Linux Foundation 下属的 Agentic AI Foundation 托管。截至 2026 年初，GitHub 上已有超过 6 万个开源项目使用这个格式。Claude Code 虽然仍用 CLAUDE.md，但内容完全通用，一个软链接即可兼容：`ln -s AGENTS.md CLAUDE.md`。

官方建议的使用方式：

1. 在仓库根目录创建 `AGENTS.md` 文件
2. 写上对 Agent 有用的内容：项目概述、构建测试命令、代码风格、安全注意事项
3. 补充额外指引：commit 规范、部署步骤、安全陷阱——任何你会告诉项目新成员的东西
4. 大型 monorepo 可以在子目录放嵌套的 AGENTS.md，Agent 会读最近的那个

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

### 核心理念：地图，而非手册

AGENTS.md 的第一原则是**渐进式披露**——它是一张地图，不是一本手册。应该大约 200 行的导航地图，告诉 Agent「去哪里找什么」，详细内容放在链接的文档里。如果把所有内容都塞进 AGENTS.md，AI 的注意力被稀释，真正关键的规则反而容易被忽略。

**写进 AGENTS.md 的内容**：

1. **AI 理解项目全貌的必要信息**——技术栈、仓库结构、核心模块、分层架构
2. **违反会直接导致问题的硬性规则**——编码规约、命名约定、禁止项

**不写进去的内容**（通过文档链接和引用指向对应文档）：

```
AGENTS.md（地图）
 → docs/architecture.md     分层架构详细说明
 → docs/development.md      开发环境搭建
 → docs/design-docs/*.md    参考项目架构与组件模式
```

判断标准：**如果 AI 不知道这条信息就会写出错误的代码，放 AGENTS.md；如果只是写出不够好的代码，放详细文档，AGENTS.md 里放链接。**

### 实践要点

#### 仓库聚合——解决上下文割裂

前后端分离的多仓库项目会导致 AI 上下文割裂。解决方案：

- **脚本聚合**：通过 `setup-repos.sh` 将前端仓库克隆到后端子目录下，`frontend/` 目录加入 `.gitignore`
- **Monorepo**：前后端代码放在同一个仓库中，AI 在同一个窗口中就能看到 Controller 接口定义和对应的前端 API 调用

```
project-root/
 server/              # 后端（Spring Boot / Go）
 web/                 # 前端（React / Vue）
 reference-projects/  # 参考项目（git submodule）
 scripts/             # 构建、启动、检查脚本
 docs/                # 架构文档、设计文档
```

#### 统一环境配置——让 AI 能启动项目

所有本地环境变量统一配置在 `~/.<project>_env` 文件中（纯 `KEY=VALUE` 格式），启动脚本自动 `source`。AGENTS.md 中明确写清楚优先级：

```
### 数据库连接
1. 先查 ~/.<project>_env（启动脚本自动 source，文件不存在则跳过）
2. 若文件不存在，回退到 application.yml 中的缺省值
```

配套一键启动脚本，AI 只需要调用一个命令：

```bash
./scripts/start-server.sh            # 构建 + 启动 + 健康检查
./scripts/start-server.sh --quick    # 服务健康则秒返回
./scripts/start-server.sh --skip-build  # 跳过构建直接重启
```

#### 验证闭环——改完代码不算完，跑通接口才算完

验证闭环是 AGENTS.md 实践中最关键的一环。核心原则：

1. **每个 curl 独立执行**——禁止串联多个 curl，一个命令只做一件事
2. **用临时文件传递数据**——curl 输出写入 `/tmp/` 下的临时文件，后续用 `python3` 独立解析
3. **Token 获取模板化**——登录 → 写文件 → 提取 token → 后续请求携带
4. **排查路径明确**——日志文件位置、数据库连接方式

```bash
# Step 1: 登录，结果写文件
curl -s -X POST http://localhost:8080/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin"}' > /tmp/login.json

# Step 2: 提取 token（独立命令）
python3 -c "import json; print(json.load(open('/tmp/login.json'))['data']['token'])" > /tmp/token.txt

# Step 3: 业务接口调用
TOKEN=$(cat /tmp/token.txt)
curl -s -X POST http://localhost:8080/providers/list \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"page":0,"size":10}' > /tmp/result.json
```

验证手段：
- **后端**：bash / curl 验证接口——启动服务，curl 调接口，解析响应，确认数据正确
- **前端**：Agent Browser 验证页面——让 Agent 自己打开浏览器、操作页面、截屏对比

#### 自动化检查——规则的执行力

AGENTS.md 中写的规则，如果没有自动化检查，AI 和人都会违反。

**分层依赖检查**示例：

```
L0 - entity/     → 只允许依赖 common
L1 - repository/ → 只允许依赖 entity, common
L2 - core/       → 横切关注点，不允许依赖业务包
L3 - config/     → 允许依赖 core, service
L4 - service/    → 业务核心层
L5 - controller/ → 只允许依赖 service, core, common
```

用 shell 脚本扫描所有文件的 import 语句，按包路径判断所属层级，检查是否违反依赖方向。违规时输出可操作的错误信息：

```
✗ service/client/impl/SomeService.java 导入了 entity.SomeEntity
  原因: 客户端实现禁止直接依赖业务 Entity，须通过 DTO 传递数据
  修复: 在编排层完成 Entity→DTO 转换，客户端只接收 DTO
```

错误信息格式：**WHAT（违规了什么）+ WHY（为什么不允许）+ HOW（怎么修复）**——AI 读到后能直接按照 HOW 的指引去修复。

集成到 `make lint-arch`，AI Agent 改完代码后可以自主运行检查，形成「改 → 检 → 修」的自动闭环。

**质量检查命令矩阵**：

```makefile
lint-arch:   ./scripts/lint-deps.sh   # 分层依赖检查
lint-format: mvn spotless:check       # 格式检查
format:      mvn spotless:apply       # 格式修复
build:       mvn package -DskipTests  # 构建
test:        mvn test                 # 测试
```

规则优先级：**能自动化检查的 > 写在 AGENTS.md 的 > 口头约定的**

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
