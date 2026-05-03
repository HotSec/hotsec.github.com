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
