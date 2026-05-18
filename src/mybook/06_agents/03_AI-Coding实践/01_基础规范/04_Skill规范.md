# AI Coding — Skill 文档规范

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

````markdown
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
````

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

````markdown
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
````

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

### Claude Code / OMC Skill 实践

Claude Code 生态中的 Skill 更偏向“行为注入”：当任务触发某类场景时，向 Agent 注入做事顺序、边界和验证要求。它不一定生成代码模板，更强调流程约束。

适合封装为 Skill 的场景：

| 场景 | Skill 目标 |
|------|------------|
| 系统化调试 | 先复现、再定位根因、再最小修复、最后补回归测试 |
| TDD 开发 | 先写失败测试，再实现，再验证测试通过 |
| 代码审查 | 以 bug / 回归 / 安全 / 缺失测试为优先级输出问题 |
| 计划执行 | 按任务清单逐项实现，每步完成后验证 |
| 验证收尾 | 完成前必须运行指定命令并报告结果 |

示例：

```markdown
---
name: verification-before-completion
description: 在声明任务完成前运行验证命令并读取结果
---

# Verification Before Completion

## 触发条件
当准备声明“完成”“通过”“修复”或提交代码前使用。

## 步骤
1. 识别能证明当前结论的命令。
2. 运行完整命令，而不是依赖历史结果。
3. 阅读退出码和输出。
4. 如果失败，报告失败和下一步；如果通过，再声明结果。

## 禁止
- 不要用“应该可以”替代验证。
- 不要只运行部分命令就声称全部通过。
- 不要忽略失败输出。
```

编写这类 Skill 时，重点是减少 Agent 的自由发挥空间：触发条件要清楚，步骤要可执行，禁止事项要明确，完成证据要能被人类复核。
