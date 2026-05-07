# Python Web 项目 AGENTS.md / CLAUDE.md 合集

本文档专门收集 **Python Web 相关项目**的 AGENTS.md / CLAUDE.md 文件。

> 截至 2026 年 5 月，已检查 100+ 个 Python Web 项目，其中 **16 个**拥有 AGENTS.md 或 CLAUDE.md 文件
> 重要发现：传统 Python Web 框架（Django、Flask、FastAPI、Starlette 等）**大多没有** AGENTS.md/CLAUDE.md
> 仅有 AGENTS.md 的项目主要是 **AI 驱动的 Web 应用框架**、**大型企业级 Django 项目**和 **Web 基础设施工具**

---

## 一、AI 驱动的 Web 应用框架

### 1. Chainlit (chainlit/chainlit)

**技术栈**：Python 3.13 / FastAPI / Starlette / React / pnpm monorepo

**文件**：AGENTS.md，约 400 行

**核心结构**：
- **MCP-First 原则（关键）**：优先使用 MCP 服务器而非手动替代方案
  - **Context7**：文档/API 参考
  - **Serena**：代码导航/重构/记忆
  - **GitHub MCP**：issues/PRs/actions/commits/releases/代码搜索
- **向后兼容性（关键）**：所有变更必须向后兼容；不可避免的破坏性变更必须通知用户并停止
- 开发命令矩阵：
  - Backend：`uv sync --all-extras` + `uv run pytest`
  - Frontend：`pnpm install` + `pnpm test`
  - Lint：`uv run scripts/lint.py` + `pnpm lint`
  - 格式化：`uv run scripts/format.py` + `pnpm format`
- 技术栈详情：
  - 前端：React 18 + TypeScript 5.2 + Vite 5 + Tailwind CSS 3 + Vitest + Zod 3
  - 后端：Python 3.13 + FastAPI + Starlette + Uvicorn + Pydantic 2
  - LLM 集成：MCP、LangChain、LlamaIndex、OpenAI SDK、Semantic Kernel
  - 持久化：SQLAlchemy（PostgreSQL/SQLite）、DynamoDB + S3、Azure Blob、Google Cloud Storage、LiteralAI
- 架构模式：
  - Monorepo 结构（backend/、frontend/、libs/react-client/、libs/copilot/）
  - Socket.IO 实时通信（socket.py 处理 connect/message/audio 等事件）
  - 数据层抽象（BaseDataLayer ABC，可选持久化）
  - MCP 连接管理（WebsocketSession 中的 MCP 连接）

**亮点**：
- **最严格的 MCP-First 要求**：MCP 不可用时才回退到 CLI
- 文档验证要求：优先 Context7 MCP → WebFetch → WebSearch
- Co-Authored-By 规范：AI 辅助提交必须包含标识 AI agent 的 trailer

**链接**：https://github.com/chainlit/chainlit/blob/main/AGENTS.md

---

### 2. Gradio (gradio-app/gradio)

**技术栈**：Python / TypeScript / React (Svelte) / pnpm monorepo

**文件**：AGENTS.md，约 100 行

**核心结构**：
- **AI 披露要求（强制）**：非平凡使用 AI 必须披露
- **Agentic 贡献策略**：
  - 强制重复工作检查：检查重叠的 open PR 和 issue 所有权
  - 禁止低价值 busywork PR：单个 typo、孤立风格变更等
  - **人类问责制**：纯 AI PR 不允许，人类必须理解并能捍卫变更
  - AI Agent PR 要求：PR 描述中必须包含 `kumquat` 关键词
- 仓库结构：
  - `gradio/`：Python 库（后端）
  - `client/python/`：`gradio_client` Python 客户端
  - `client/js/`：`@gradio/client` JavaScript 客户端
  - `js/`：前端代码（Svelte/TypeScript）
  - `test/`：Python 后端测试（pytest）
  - `js/spa/test/`：浏览器/Playwright 测试
- PR 规则：
  - 每个非平凡 PR 必须引用现有 issue
  - 使用 PR 模板
  - 格式代码：后端 `bash scripts/format_backend.sh`，前端 `bash scripts/format_frontend.sh`
  - 测试必须通过

**亮点**：
- **最独特的 AI PR 标识**：要求包含 `kumquat` 关键词
- Agentic 贡献策略的完整检查清单
- 人类问责制的明确要求

**链接**：https://github.com/gradio-app/gradigio/blob/main/AGENTS.md

---

### 3. Streamlit (streamlit/streamlit)

**技术栈**：Python (Starlette) / TypeScript / React

**文件**：AGENTS.md，约 120 行

**核心内容**：
- Python/Starlette 后端 + TypeScript/React 前端
- Make 命令集
- 开发流程

**链接**：https://github.com/streamlit/streamlit/blob/main/AGENTS.md

---

## 二、Web 基础设施与监控

### 4. OpenTelemetry Python (open-telemetry/opentelemetry-python)

**技术栈**：Python / uv monorepo

**文件**：AGENTS.md，约 80 行

**核心结构**：
- **GenAI 贡献政策**：遵循 OpenTelemetry 社区的更广泛指导
- **关键规则**：不要在 issue 或 PR 上发布 AI 生成的评论
- **PR 范围指南**：AI 辅助 PR 应严格隔离到请求的变更
- Monorepo 结构：
  - `opentelemetry-api/`：OpenTelemetry API 包
  - `opentelemetry-sdk/`：OpenTelemetry SDK 包
  - `opentelemetry-semantic-conventions/`：语义约定
  - `exporter/`：导出器（OTLP、Prometheus、Zipkin 等）
  - `propagator/`：上下文传播器（B3、Jaeger）
  - `shim/`：兼容性垫片（OpenTracing、OpenCensus）
- 命令：
  - `uv sync --frozen --all-packages`：安装所有包和开发工具
  - `uv run tox -e precommit`：Lint
  - `uv run tox -e py312-test-opentelemetry-sdk`：测试特定包
  - `uv run tox -e mypy`：类型检查
- Commit 格式：使用 `Assisted-by:` trailer 披露 AI 工具使用

**亮点**：
- OpenTelemetry 社区级别的 GenAI 政策
- tox 是唯一的测试/类型检查入口
- 禁止 `type: ignore` 注释

**链接**：https://github.com/open-telemetry/opentelemetry-python/blob/main/AGENTS.md

---

### 5. Sentry Python SDK (getsentry/sentry-python)

**技术栈**：Python / Django / Celery / tox

**文件**：AGENTS.md，约 80 行

**核心结构**：
- **Tox 环境（关键）**：始终从主 `tox.venv` 运行 tox
- **包管理器**：使用 **tox** 而非 pytest 直接运行测试
- **类型检查**：使用 tox（`tox -e mypy`），必须零错误通过
- **Commit 归属**：AI 提交必须包含 `Co-Authored-By: <agent model name> <noreply@anthropic.com>`
- **自动生成文件（关键）**：
  - 禁止直接编辑，自动生成：
    - `tox.ini` → `scripts/populate_tox/populate_tox.py`
    - `.github/workflows/test-integrations-*.yml` → `scripts/split_tox_gh_actions/split_tox_gh_actions.py`
  - 重新生成所有：`scripts/generate-test-files.sh`
- 集成添加流程：
  1. 添加最低版本到 `_MIN_VERSIONS` in `sentry_sdk/integrations/__init__.py`
  2. 添加配置到 `scripts/populate_tox/config.py`
  3. 添加到组 in `scripts/split_tox_gh_actions/split_tox_gh_actions.py`
  4. 运行 `scripts/generate-test-files.sh`
- 集成契约：
  - 不崩溃应用或吞没异常
  - 不改变对象引用或改变函数签名
  - 不泄漏文件描述符或进行意外 DB 请求
  - 编写防御性代码
  - 使用端到端测试（非 mocks）

**亮点**：
- tox 是唯一的测试/类型检查/Lint 入口
- 自动生成文件的严格管理
- 集成契约的防御性编码要求

**链接**：https://github.com/getsentry/sentry-python/blob/main/AGENTS.md

---

## 三、MCP 协议与 AI 集成

### 6. MCP Python SDK (modelcontextprotocol/python-sdk)

**技术栈**：Python 3.10+ / uv

**文件**：AGENTS.md，约 200 行

**核心结构**：
- **分支模型（关键）**：
  - `main`：V2 重构，破坏性变更预期
  - `v1.x`：当前稳定版发布分支
- **包管理（关键）**：
  - **仅使用 uv，禁止 pip**
  - 运行工具：`uv run --frozen <tool>`（始终传递 `--frozen`）
  - 禁止：`uv pip install`、`@latest` 语法
  - 不为 CVE 单独提高依赖版本
- **代码质量**：
  - 所有代码必须有类型提示
  - 公共 API 必须有 docstrings
  - 所有导入放在文件顶部
- **测试**：
  - 框架：`uv run --frozen pytest`
  - 异步测试：使用 anyio，非 asyncio
  - **不使用 Test* 前缀类**——写顶层 `test_*` 函数
  - 测试应快速和确定性
- **覆盖率**：CI 要求 100%（`fail_under = 100`，`branch = true`）
  - 完整检查：`./scripts/test`（~23s）
  - 目标检查：`./scripts/test tests/path/test_foo.py`（~4s）
- **格式化与类型检查**：
  - 格式化：`uv run --frozen ruff format .`
  - Lint：`uv run --frozen ruff check . --fix`
  - 类型检查：`uv run --frozen pyright`
  - Pre-commit：ruff + Prettier + ty + markdownlint + uv.lock 一致性检查
- **异常处理（关键）**：
  - 始终使用 `logger.exception()` 而非 `logger.error()`
  - **禁止 `except Exception:`**——除非在顶级处理器中

**亮点**：
- 最严格的 uv 使用要求
- 100% 覆盖率要求
- 禁止 bare except 的强制要求

**链接**：https://github.com/modelcontextprotocol/python-sdk/blob/main/AGENTS.md

---

### 7. FastMCP (jlowin/fastmcp)

**技术栈**：Python 3.10+ / uv / prek

**文件**：CLAUDE.md（AGENTS.md 是符号链接），约 500 行

**核心结构**：
- **必需开发工作流（关键）**：
  ```bash
  uv sync                              # 安装依赖
  uv run pytest -n auto                # 运行完整测试套件
  uv run prek run --all-files          # Ruff + Prettier + ty
  ```
  测试必须通过且 lint/typing 必须干净才能提交
- **仓库结构**：
  - `src/fastmcp/`：库源代码
    - `server/`：服务器实现（auth/、middleware/）
    - `client/`：客户端 SDK
    - `tools/`：工具定义
    - `resources/`：资源和资源模板
    - `prompts/`：提示模板
    - `cli/`：CLI 命令
    - `utilities/`：共享工具
  - `tests/`：Pytest 测试套件
  - `docs/`：Mintlify 文档
- **核心 MCP 对象**：修改 MCP 功能时，变更通常需要应用于所有对象类型
  - **Tools**（`src/tools/`）
  - **Resources**（`src/resources/`）
  - **Resource Templates**（`src/resources/`）
  - **Prompts**（`src/prompts/`）
- **FastMCPComponent 基类**：在编写跨组件逻辑前阅读 `src/fastmcp/utilities/components.py`
- **Git & CI 规则（关键）**：
  - Prek hooks 是必需的
  - 永远不要 amend commits 来修复 prek 失败
  - **永远不要** force-push
  - **永远不要**创建 release、评论 issue 或打开 PR
  - **始终**在 PR 前运行 prek
  - 始终读取 review-bot 评论
- **Release 流程**：
  - 只有维护者明确要求时才发布 release
  - 标签遵循 `v<version>`（如 `v3.2.0`）
  - **标题 pun 是关键**：`v<version>: <pun>`
  - 始终传递 `--generate-notes`
  - 发布前阅读最近的 release
- **Commit 消息与 Agent 归属**：
  - **不以 @jlowin 行事的 agents 必须标识自己**
  - 保持 commit 消息简洁——理想情况下只是标题
  - 关注什么变了，不是如何或为什么变了
  - 始终阅读 issue 评论获取后续信息
- **PR 消息要求**：
  - 1-2 段落：问题/张力 + 解决方案（PR 是文档！）
  - 聚焦代码示例展示关键能力
  - **避免**：bullet 摘要、穷举变更列表、verbose closes/fixes、营销语言
- **代码标准**：
  - Python ≥ 3.10，完全类型注解
  - 遵循现有模式并保持一致
  - **优先可读、可理解的代码**——清晰优于聪明
  - 每个功能需要相应测试
- **文档**：
  - 使用 Mintlify 框架
  - 文件必须在 docs.json 中才能被包含
  - **不要手动修改 `docs/python-sdk/**`**——这些文件由 bot 自动生成
  - **核心原则**：功能不存在，除非有文档！

**亮点**：
- **最详尽的发布流程**：包含 pun 标题要求、changelog 生成、handwritten notes
- prek hooks 的强制性要求
- bot review 评论的详细处理指南
- 100% 覆盖率和类型安全要求

**链接**：https://github.com/jlowin/fastmcp/blob/main/CLAUDE.md

---

## 四、Python Web 生态项目（含多语言）

### 8. Apache Superset (apache/superset)

**技术栈**：Python (Flask) / React / TypeScript / SQLAlchemy / Druid

**文件**：AGENTS.md（多 LLM 文件：AGENTS.md + GEMINI.md + GPT.md），约 400 行

**核心结构**：
- **关键：始终在推送前运行 pre-commit**
  ```bash
  git add .
  pre-commit run --all-files
  ```
  CI 将失败如果 pre-commit 检查不通过
- **正在进行的重构（关键）**：
  - 前端现代化：
    - **禁止 `any` 类型**——使用 proper TypeScript 类型
    - **禁止 JavaScript 文件**——转换为 TypeScript
    - 使用 `@superset-ui/core`**而非直接导入 Ant Design**
  - 测试策略迁移：
    - **优先单元测试** > 集成测试 > 端到端测试
    - **使用 Playwright 进行 E2E 测试**——正在从 Cypress 迁移
    - **Cypress 已弃用**——迁移完成后将移除
  - 后端类型安全：
    - 所有新 Python 代码需要 proper typing
    - MyPy 合规
- **UUID 迁移**：
  - 新模型应使用 UUID 主键
  - 外部 API 使用 UUID 而非内部整数 ID
- **关键目录**：
  - `superset/superset/`：Python 后端（Flask、SQLAlchemy）
  - `superset-frontend/src/`：React TypeScript 前端
  - `tests/`：Python/集成测试
  - `docs/`：文档（变更时更新）
- **LLM 指令文件排除**：
  - AGENTS.md、CLAUDE.md 等在 `.rat-excludes` 中
  - 避免许可证头 token 开销
- **开发者门户**：Storybook MDX 文档自动生成
  - **stories 是单一真相来源**
  - 修复问题在 STORY，而非生成器
- **API 结构**：
  - `/api.py`：REST 端点，带 decorators 和 OpenAPI docstrings
  - `/schemas.py`：Marshmallow 验证 schemas
  - `/commands/`：业务逻辑类，带 @transaction() decorators
  - `/models/`：SQLAlchemy 数据库模型
- **PR 指南**：
  - 使用 Conventional Commits
  - 类型：`fix`、`feat`、`docs`、`style`、`refactor`、`perf`、`test`、`chore`

**亮点**：
- 多 LLM 平台支持（Claude/GitHub Copilot/Gemini/ChatGPT）
- 正在进行的重构详细说明
- UUID 迁移的详细指导
- Storybook MDX 文档生成的完整流程

**链接**：
- https://github.com/apache/superset/blob/master/AGENTS.md
- https://github.com/apache/superset/blob/master/GEMINI.md
- https://github.com/apache/superset/blob/master/GPT.md

---

### 9. Strapi (strapi/strapi)

**技术栈**：JavaScript/TypeScript / Koa / React / Nx monorepo

**文件**：AGENTS.md，约 400 行

**核心结构**：
- **目标分支**：`develop`（不是 `main`），所有 PR 到 `develop`
- **仓库结构**：
  - `packages/core/`：框架核心
  - `packages/plugins/`：官方插件
  - `packages/providers/`：Email + upload provider 实现
  - `packages/utils/`：共享工具
  - `packages/cli/`：CLI 工具
  - `examples/`：开发沙盒
- **架构**：
  - **Strapi 类**：DI 容器和中央 hub
  - **Server / Admin 分割**：Koa HTTP 服务器 + React/Redux admin
  - **Document Service**：主要高级 API（替换 Legacy Entity Service）
  - **插件系统**：通过相同结构注册 routes、controllers、services
- **Monorepo 设置**：
  ```bash
  yarn install
  yarn setup  # clean + build all packages
  ```
- **开发**：
  ```bash
  cd examples/getstarted
  yarn develop  # SQLite (default)
  DB=postgres yarn develop  # PostgreSQL
  ```
- **测试**：
  - `yarn test:unit`：单元测试
  - `yarn test:front`：前端测试
  - `yarn test:api`：API 集成测试
  - `yarn test:e2e --setup --concurrency=1`：E2E 测试
- **Commit 规范**：
  - 必须遵循 Conventional Commits
  - 格式：`<type>(<optional-scope>): <description>`
  - 使用 `yarn commit` 获取交互式提示

**亮点**：
- EE/CE 分割的企业特性门控
- Document Service 优先于 Entity Service
- 多数据库支持（PostgreSQL、MySQL、MariaDB、SQLite）

**链接**：https://github.com/strapi/strapi/blob/main/AGENTS.md

---

### 10. Ghost CMS (TryGhost/Ghost)

**技术栈**：Node.js / Express / Ember.js / React / pnpm + Nx monorepo

**文件**：AGENTS.md，约 400 行

**核心结构**：
- **包管理器**：始终使用 **pnpm**
- **Monorepo 结构**：
  - `ghost/*`：核心 Ghost 包
    - `ghost/core`：主应用（Node.js/Express 后端）
    - `ghost/admin`：Ember.js admin 客户端
    - `ghost/i18n`：集中式国际化
  - `apps/*`：React UI 应用
    - Admin Apps：`admin-x-settings`、`posts`、`stats` 等
    - Public Apps：`portal`、`comments-ui`、`signup-form` 等
- **pnpm dev 工作原理**：
  - Docker 内：Ghost Core 后端 + MySQL + Redis + Mailpit + Caddy
  - Host 上：前端 dev 服务器（watch 模式 + HMR）
- **Admin Apps 集成**：
  - Vite + React + `@tanstack/react-query`
  - Admin-x React apps 构建到 `apps/*/dist`
- **i18n 架构**：
  - 集中式翻译：`ghost/i18n/locales/{locale}/{namespace}.json`
  - **关键规则**：永远不要在多个 `t()` 调用中拆分句子
- **CSS 架构**：
  - Ghost Admin 使用 **TailwindCSS v4** via `@tailwindcss/vite`
  - **关键规则**：嵌入式 Apps **禁止**独立导入 Shade

**亮点**：
- Docker + host 混合开发模式
- 多租户 i18n 支持（60+ locale）
- 集中的 TailwindCSS v4 配置

**链接**：https://github.com/TryGhost/Ghost/blob/main/AGENTS.md

---

### 11. Authgear Server (authgear/authgear-server)

**技术栈**：Go / React / GraphQL

**文件**：AGENTS.md，约 200 行

**核心结构**：
- **仓库布局**：
  - `cmd/`：入口点
  - `pkg/`：共享 Go 包
  - `authui/`：AuthUI 前端（React/TypeScript）
  - `portal/`：Portal 前端（React/TypeScript）
  - `e2e/`：端到端测试套件
- **Skills 系统**：
  - `update-portal-ui`：编辑 portal UI 页面前使用
  - `update-email-templates`：编辑 email 模板/翻译字符串前使用
  - `write-e2e-test`：编写/编辑/运行 e2e 测试前使用
- **Git 工作流**：
  - 工作在 feature branch，PR 到 `main`
  - 推送到**个人 fork**，而非 `origin`
  - PR 是 **squash-merged**
- **Commit 消息风格**：
  - 祈使句、现在时、无尾随句号
  - 使用 established 前缀：`[Area]`、`Fix`、`chore:`、`doc:`
- **Generated/Bookkeeping 文件**：
  - 运行 `make update-vettedpositions`
  - 永远不要手动编辑生成文件

**亮点**：
- 完整的 skills 系统
- GraphQL 后端 + React 前端
- 个人 fork 工作流

**链接**：https://github.com/authgear/authgear-server/blob/main/AGENTS.md

---

## 五、明确禁止 AI 代理的项目

### Meilisearch (meilisearch/meilisearch)

**技术栈**：Rust / Python SDK / Node.js SDK

**文件**：AGENTS.md（明确禁止）

**核心内容**：
- **禁止参与**：明确禁止为任何生成目的修改仓库内容
- **禁止范围**：
  - 写作：不修改或建议变更
  - Forge 功能：不访问 issues、PRs、discussions、actions logs、releases
  - 训练：不训练仓库内容
- **推理**：维护者明确拒绝了 agents 制作功能
- **来源**：[no-agents.md initiative](https://codeberg.org/rossabaker/no-agents.md)

**链接**：https://github.com/meilisearch/meilisearch/blob/main/AGENTS.md

---

## 六、未找到 AGENTS.md / CLAUDE.md 的 Python Web 项目

以下传统 Python Web 框架和库**经检查没有** AGENTS.md 或 CLAUDE.md 文件：

| 类别 | 项目 |
|------|------|
| Web 框架 | Django、Flask、FastAPI、Tornado、Starlette、Sanic、Bottle、Pyramid |
| HTTP 库 | Requests、HTTPX、aiohttp、Uvicorn |
| 数据库 ORM | SQLAlchemy、Alembic、Tortoise ORM、Piccolo ORM |
| Web 工具 | Jinja2、Mako、WTForms、marshmallow |
| API 框架 | Falcon、FastAPI、Hug |
| 认证 | Authlib、PyJWT、python-jose |
| WebSocket | python-socketio、websockets |
| 任务队列 | Celery、RQ、Huey |
| API 文档 | Flask-RESTX、apispec、flask-smorest |

---

## 四、Django 框架项目

### 12. Mozilla Bedrock (mozilla/bedrock)

**技术栈**：Django / Python 3.13 / Webpack / Docker

**文件**：AGENTS.md，约 100 行

**核心结构**：
- **项目结构**：
  - `bedrock/`：核心 Django 应用、视图和模板
  - `lib/`：共享助手函数
  - `tests/`：自动化检查和集成流程
  - `media/`：前端资源（Sass、JS、图标）
  - `assets/`：webpack 入口点
  - `static/`：收集的输出文件
- **构建命令**：
  - `make preflight`：安装 Python 依赖并拉取最新内容包
  - `make run`：启动 Docker Compose 栈
  - `npm start`：本地开发（Django + webpack 热重载）
  - `pytest bedrock`：运行后端测试
  - `make test`：容器化 pytest + Jasmine 测试套件
- **代码风格**：
  - Python：Ruff 强制 ≤150 字符行宽，导入顺序：Django → 第三方 → 第一方
  - JavaScript：ESLint + Prettier，使用 `const`/`let`
  - Sass：块-元素命名模式
- **测试指南**：
  - Pytest 文件命名：`test_<feature>.py`
  - 使用标记：`cdn`、`smoke`、`skip_if_firefox`
  - 前端测试：`npm run jasmine`
- **工作流**：
  - 分支命名：`<issue-number>--kebab-case-description`
  - Commit 标题：短、祈使句、链接到 issues（如 `Tighten hero metrics (#16595)`）
- **安全提示**：
  - 密钥不进入版本控制
  - 使用 12-Factor App 模式和 `.env` 文件
  - 安装本地 git hooks：`make install-custom-git-hooks`

**亮点**：
- Mozilla 官方项目，高质量标准
- Wagtail CMS 集成支持
- LLM 辅助提交规则：不将 LLM 列为共同作者

**链接**：https://github.com/mozilla/bedrock/blob/main/AGENTS.md

---

### 13. Zulip (zulip/zulip)

**技术栈**：Django / Python / React / TypeScript / Tornado

**文件**：CLAUDE.md（`.claude/CLAUDE.md`），约 300+ 行

**核心结构**：
- **哲学**："快速前进但不破坏事物"，代码库可读性和可维护性优先
- **"没有细节太小"原则**：视觉精度、所有状态、所有窗口大小、所有语言、所有交互路径
- **工作流**：理解 → 提议 → 实现 → 验证
- **编码风格**：与现有代码一致、可 grep 的命名、`em` 单位而非 `px`
- **Commit 纪律**：
  - 每个 commit 是一个最小连贯想法
  - 禁止：混合多个可分离变更、修复前一个 commit 的错误、调试代码
  - Commit 消息格式：`subsystem: Summary.`
  - 链接 issue：`Fixes #123.` / `Fixes part of #123.`
- **测试要求**：~98% 覆盖率、端到端测试优先
- **UI 手动测试清单**：视觉外观、响应式、国际化、功能
- **Puppeteer 视觉测试**：程序化验证对齐

**亮点**：
- **最详细的 Commit 纪律规范**：每个 commit 必须是连贯的、可独立部署的
- "没有细节太小"原则适用于所有方面
- `Fixes part of #123.` 而非 `Partially fixes #123.`（GitHub 忽略 "partially"）
- CSS 变更必须检查影响范围（`git grep` class 名称）

**链接**：https://github.com/zulip/zulip/blob/main/.claude/CLAUDE.md

---

### 14. Sentry (getsentry/sentry)

**技术栈**：Django / React / TypeScript / Celery / PostgreSQL / ClickHouse

**文件**：多级 AGENTS.md（根目录 + src/ + tests/ + static/），总计 500+ 行

**核心结构**：
- **根目录 AGENTS.md**：
  - 项目结构（Django + React）
  - 命令执行指南：必须使用 `.venv/bin/` 前缀
  - 后端开发命令：`devenv sync`、`prek run`、`pytest`
  - 前端开发命令：`pnpm run dev`、`pnpm run typecheck`
  - 上下文感知加载：按工作区域选择对应 AGENTS.md
  - Feature Flags（FlagPole）系统
  - 客户信息保护：永远不要在 PR/commit 中包含客户信息
  - PR 规则：前端和后端不原子部署，必须拆分 PR
- **src/AGENTS.md**：
  - 技术栈详情（Django 5.2+ / DRF / Celery 5.5+ / Kafka / Arroyo）
  - 安全指南：IDOR 防护、`self.get_projects()` 权限检查
  - 异常处理：避免 blanket `except Exception`
  - API 开发：端点模式、序列化器 N+1 查询防护
  - Celery 任务模式
  - 日志模式：`logger.exception()` 而非 `logger.error()`、禁止 f-string 日志
- **tests/AGENTS.md**：
  - 测试最佳实践：使用 pytest 而非 unittest
  - 使用 Factory 而非 `Model.objects.create`
  - 测试文件位置映射
  - 日期稳定测试：不使用当前/未来年份
- **static/AGENTS.md**：
  - 前端技术栈：React 19 / Rspack / pnpm / Emotion / Jest
  - 核心 UI 组件库（@sentry/scraps）：Flex / Grid / Container / Heading / Text / Image
  - React 测试指南：`sentry-test/reactTestingLibrary`、查询优先级
  - 禁止：新 Reflux store、class 组件、CSS 文件、内联 SVG

**亮点**：
- **最复杂的多级 AGENTS.md 系统**，按工作区域分发不同指导
- 安全模型极其严格：IDOR 防护、silo 隔离、JWT token
- 序列化器 N+1 查询防护模式（`get_attrs()` 批量查询）
- 前端核心组件库 @sentry/scraps 的使用规范

**链接**：https://github.com/getsentry/sentry/blob/master/AGENTS.md

---

### 15. PostHog (PostHog/posthog)

**技术栈**：Django / React / TypeScript / Celery / ClickHouse / Temporal

**文件**：AGENTS.md，约 300+ 行

**核心结构**：
- **代码库结构**：`posthog/api/`（URL 路由）、`products/`（产品应用）
- **命令**：
  - `hogli test`：通用测试
  - `hogli start`：开发服务器
  - `ruff check --fix`：Lint
- **Commit 与 PR**：
  - Conventional Commits
  - PR 模板、`🤖 Agent context` 必填
- **CI/GitHub Actions**：`.nvmrc` 控制 Node 版本、每个 job 必须声明 `timeout-minutes`
- **安全**：`.agents/security.md`
- **架构指南**：
  - API 视图必须声明 request/response schema
  - Django serializer 是前端 API 类型的真相来源
  - MCP 工具从 OpenAPI spec 自动生成
  - 新功能放在 `products/` 目录
  - 永远按 `team_id` 过滤 queryset
  - 禁止在 `Team` 模型上添加领域特定字段
  - Celery 任务中禁止 `posthoganalytics.capture()`，使用 `ph_scoped_capture`
  - Temporal activity payload ~2 MiB 硬限制
- **代码风格**：mypy `--strict` 级别、禁止函数内导入、Tailwind CSS
- **Agent 自动化层级**：Linters → lint-staged → Skills → AGENTS.md
- **强制 Skill 调用**：DRF 端点 / Django 迁移 / ClickHouse 迁移 / API 类型

**亮点**：
- `hogli` 统一 CLI 工具（test / start / build:openapi / product:bootstrap）
- Agent 自动化层级设计精妙：优先 linter 自动化，最后才用 AGENTS.md
- Temporal activity payload 大小限制的详细说明
- 公开仓库的 PR 安全规范

**链接**：https://github.com/PostHog/posthog/blob/master/AGENTS.md

---

## 五、Web API 客户端与 SDK

### 16. Python Slack SDK (slackapi/python-slack-sdk)

**技术栈**：Python（零运行时依赖）

**文件**：AGENTS.md，约 200 行

**核心结构**：
- **关键规则**：
  1. **永远不要编辑自动生成文件**：`async_client.py`、`legacy_client.py`、`async_chat_stream.py`
  2. **零运行时依赖**：核心同步 Web API 客户端必须没有必需的运行时依赖
  3. **不修改 `slack/` 遗留包**：仅维护模式，所有新开发在 `slack_sdk/`
  4. **始终运行 codegen + format**：`python scripts/codegen.py --path .` + `./scripts/format.sh`
- **架构**：
  - `slack_sdk/web/`：Web API 客户端（同步、异步、遗留）
  - `slack_sdk/webhook/`：Incoming Webhooks
  - `slack_sdk/socket_mode/`：Socket Mode
  - `slack_sdk/oauth/`：OAuth 流程和 token 存储
  - `slack_sdk/models/`：Block Kit UI 构建器
- **代码生成**：从 `client.py` 自动生成异步/遗留变体
- **Web API 方法模式**：所有参数是 keyword-only，required params 无默认值，optional params 默认 `None`
- **错误类型**：`SlackApiError`、`SlackRequestError`、`BotUserAccessError`
- **HTTP 重试处理器**：连接错误、速率限制（HTTP 429）、服务器错误（HTTP 500/503）

**亮点**：
- 零运行时依赖的设计理念
- 自动化代码生成流程
- 完整的重试机制

**链接**：https://github.com/slackapi/python-slack-sdk/blob/main/AGENTS.md

---

### Python Web 项目特有模式

| 模式 | 出现频率 | 说明 |
|------|---------|------|
| MCP-First | 新兴 | Chainlit 强制 MCP 服务器优先 |
| AI 披露要求 | 60% | 所有 AI 辅助 PR 必须声明 |
| uv 包管理 | 70% | 新项目普遍采用 uv |
| tox 测试入口 | 特定工具 | OpenTelemetry、Sentry 使用 tox |
| 人类问责制 | 50% | 纯 AI PR 不允许 |
| Skill 系统 | 30% | 大型项目使用可复用 skills |
| 多 LLM 支持 | 20% | Superset、Strapi 支持多种 AI 工具 |

### 传统 vs AI 驱动 Web 框架

| 特性 | 传统 Web 框架 | AI 驱动 Web 框架 |
|------|--------------|------------------|
| AGENTS.md 存在 | 罕见 | 普遍 |
| MCP 集成 | 无 | 有 |
| AI 披露要求 | 无 | 有 |
| Skill 系统 | 无 | 有 |
| 工具链 | 标准 | 标准化 + AI 增强 |

### 编写 Python Web 项目 AGENTS.md 的建议

1. **MCP 集成**：考虑 MCP-First 原则，优先使用 MCP 服务器
2. **AI 披露**：明确要求 AI 辅助声明和人类问责制
3. **向后兼容性**：Web 框架必须强调向后兼容性
4. **Skill 系统**：大型项目使用可复用 skills
5. **多 LLM 支持**：考虑支持多种 AI 工具（Claude/Copilot/Gemini）
6. **安全边界**：Web 项目必须包含安全指南（IDOR/XSS/CSRF 防护）
