# Python 项目 AGENTS.md 大全

本文档整合了 GitHub 上所有已收集的 Python 项目 AGENTS.md / CLAUDE.md 信息，涵盖 39 个项目，按 9 大分类组织。每个条目包含技术栈、文件类型与行数、核心要点、亮点和链接。

> 截至 2026 年 5 月，已检查 100+ 个 Python 项目，最终收集到 39 个有价值的项目的 AGENTS.md / CLAUDE.md
> 主要发现：AGENTS.md 主要被大型企业级应用、AI/ML 框架和现代 Python 工具采用，传统 Python 库和框架尚未广泛采用

---

## 一、AI/ML 框架与工具

### 1. LangChain (langchain-ai/langchain)

**技术栈**：Python / TypeScript

**文件**：AGENTS.md，约 200 行

**核心要点**：
- Monorepo 结构，多包协同管理
- Poetry 作为依赖管理工具
- pytest 测试框架，ruff 格式化
- 强调代码风格一致性和测试覆盖

**亮点**：AI 生态中最流行的编排框架，AGENTS.md 侧重工程规范

**链接**：https://github.com/langchain-ai/langchain/blob/main/AGENTS.md

---

### 2. LlamaIndex (run-llama/llama_index)

**技术栈**：Python

**文件**：AGENTS.md

**核心要点**：
- RAG（检索增强生成）框架
- Poetry 依赖管理
- 模块化架构设计

**亮点**：RAG 领域核心框架，AGENTS.md 聚焦数据处理管线

**链接**：https://github.com/run-llama/llama_index/blob/main/AGENTS.md

---

### 3. OpenAI Agents Python (openai/openai-agents-python)

**技术栈**：Python 3.10+ / uv

**文件**：AGENTS.md，约 300 行

**核心要点**：
- 强制 Skill 调用：`$code-change-verification` / `$openai-knowledge` / `$implementation-strategy` / `$pr-draft-summary`
- ExecPlan 执行计划模式
- Public API 位置兼容性约束
- 快照测试（snapshot testing）

**亮点**：最严格的 Skill 强制调用机制，4 个必调 Skill 确保代码质量

**链接**：https://github.com/openai/openai-agents-python/blob/main/AGENTS.md

---

### 4. Pydantic AI (pydantic/pydantic-ai)

**技术栈**：Python / uv workspace

**文件**：AGENTS.md，约 500 行

**核心要点**：
- "项目优先于用户"原则
- DDD（领域驱动设计）架构
- 多包 monorepo：pydantic-ai-slim / pydantic-graph / pydantic-evals / clai
- 100% 测试覆盖要求
- inline-snapshot + VCR 录制测试策略
- mkdocs 文档，agent_docs/ 目录下的编码指南

**亮点**：最完善的测试策略组合（inline-snapshot + VCR），DDD 架构在 Agent 框架中的典范实践

**链接**：https://github.com/pydantic/pydantic-ai/blob/main/AGENTS.md

---

### 5. Google ADK Python (google/adk-python)

**技术栈**：Python 3.10+

**文件**：AGENTS.md，约 600 行

**核心要点**：
- Agent Development Kit，Runner 无状态编排引擎
- Agent 目录结构约定（root_agent 入口）
- pyink 格式化（2 空格缩进 / 80 字符行宽）
- 相对导入（源码）vs 绝对导入（测试）的明确规则
- `from __future__ import annotations` 必需
- 语义版本控制（Semantic Versioning）

**亮点**：Google 官方 Agent 框架，最详细的导入规范和格式化约定

**链接**：https://github.com/google/adk-python/blob/main/AGENTS.md

---

### 6. Hermes Agent (NousResearch/hermes-agent)

**技术栈**：Python

**文件**：CLAUDE.md，约 800 行

**核心要点**：
- AIAgent 同步循环架构
- 工具注册表模式（Tool Registry Pattern）
- Skin / 主题系统
- 斜杠命令注册表
- MCP 客户端集成
- 网关平台适配器（Telegram / Discord / Slack / WhatsApp）
- 提示缓存保护机制

**亮点**：行数最多的 Agent 项目 AGENTS 文档，多平台适配器设计值得借鉴

**链接**：https://github.com/NousResearch/hermes-agent/blob/main/CLAUDE.md

---

### 7. Hugging Face Transformers (huggingface/transformers)

**技术栈**：Python

**文件**：AGENTS.md，约 200 行

**核心要点**：
- 强制 Agent 贡献政策
- 重复工作检查（禁止重复实现已有功能）
- 禁止低价值 PR
- 人类问责制原则
- `Copied from` / modular 模型机制
- `make style` / `make fix-repo` / `make codex` / `make claude` 命令

**亮点**：最大的 ML 模型库，AGENTS.md 强调人类审核和问责制

**链接**：https://github.com/huggingface/transformers/blob/main/AGENTS.md

---

### 8. scikit-learn (scikit-learn/scikit-learn)

**技术栈**：Python / Cython

**文件**：AGENTS.md，约 50 行

**核心要点**：
- 强制 AI/Agent 披露要求
- PR 描述必须简洁，描述变更原因和高亮审查区域

**亮点**：最简洁的 AGENTS.md 之一，核心规则只有 AI 披露和摘要规范

**链接**：https://github.com/scikit-learn/scikit-learn/blob/main/AGENTS.md

---

### 9. Gradio (gradio-app/gradio)

**技术栈**：Python / Svelte / TypeScript

**文件**：AGENTS.md，约 100 行

**核心要点**：
- PR 必须关联 issue
- AI 披露强制要求
- Agent PR 必须包含 "kumquat" 关键词
- 禁止低价值 PR
- 纯代码 Agent PR 不允许

**亮点**："kumquat" 关键词机制——独特的人类验证手段

**链接**：https://github.com/gradio-app/gradio/blob/main/AGENTS.md

---

## 二、数据科学与分析

### 10. pandas (pandas-dev/pandas)

**技术栈**：Python / Cython

**文件**：AGENTS.md，约 50 行

**核心要点**：
- PR 前缀约定：ENH / BUG / DOC / TST / BLD / PERF / TYP / CLN
- NumPy / numpydoc docstring 约定
- PEP 484 类型提示要求

**亮点**：经典的 PR 前缀分类体系，被众多项目效仿

**链接**：https://github.com/pandas-dev/pandas/blob/main/AGENTS.md

---

### 11. PyCA Cryptography (pyca/cryptography)

**技术栈**：Python + Rust (PyO3)

**文件**：AGENTS.md，约 50 行

**核心要点**：
- `nox -e local` 是唯一测试入口（禁止直接 pytest / cargo test）
- uv 而非 pip
- CFFI 绑定机制

**亮点**：Python+Rust 混合项目的测试入口规范，严格禁止绕过 nox

**链接**：https://github.com/pyca/cryptography/blob/main/AGENTS.md

---

### 12. Apache Superset (apache/superset)

**技术栈**：Python (Flask) / React / TypeScript

**文件**：AGENTS.md，约 400 行

**核心要点**：
- pre-commit 强制执行
- 前端 TypeScript 迁移（禁止 any / JS）
- Cypress → Playwright 迁移策略
- UUID 迁移规范
- `@superset-ui/core` 优先使用
- Storybook MDX 文档生成

**亮点**：最详细的前端迁移策略（Cypress→Playwright、JS→TS）

**链接**：https://github.com/apache/superset/blob/main/AGENTS.md

---

## 三、数据工程与工作流

### 13. Apache Airflow (apache/airflow)

**技术栈**：Python (Flask) / UV workspace

**文件**：AGENTS.md，约 500+ 行

**核心要点**：
- DAG 命名约定
- breeze 开发环境（禁止主机直接 pytest）
- 7 层架构边界
- 安全模型三级分类
- Git 远程命名约定（upstream / origin）
- Newsfragments 规则

**亮点**：7 层架构边界和三级安全模型是最复杂的项目治理结构

**链接**：https://github.com/apache/airflow/blob/main/AGENTS.md

---

### 14. Prefect (PrefectHQ/prefect)

**技术栈**：Python / FastAPI / Pydantic v2 / SQLAlchemy 2.0

**文件**：AGENTS.md，约 300 行

**核心要点**：
- just 命令驱动开发
- hogli 统一 CLI
- 反模式列表：禁止 pip / deferred imports / --no-verify / --amend
- AGENTS.md symlink 到 CLAUDE.md

**亮点**：明确的反模式列表，AGENTS.md→CLAUDE.md symlink 双协议兼容

**链接**：https://github.com/PrefectHQ/prefect/blob/main/AGENTS.md

---

### 15. Dagster (dagster-io/dagster)

**技术栈**：Python / React / TypeScript

**文件**：CLAUDE.md，约 200 行

**核心要点**：
- `make ruff` 强制格式化
- `@record` 替代 `@dataclass`
- Python 包位置参考约定
- `gt stack` 操作
- 禁止 git push

**亮点**：`@record` 替代 `@dataclass` 的设计决策，强调不可变数据模型

**链接**：https://github.com/dagster-io/dagster/blob/main/CLAUDE.md

---

## 四、Web 应用与平台

### 16. Sentry (getsentry/sentry)

**技术栈**：Django / React / TypeScript

**文件**：多级 AGENTS.md（根 + src + tests + static），约 1000+ 行

**核心要点**：
- `.venv/bin/` 前缀命令约定
- Feature Flags（FlagPole）机制
- IDOR 防护规范
- 序列化器 N+1 查询防护
- 前后端不原子部署原则

**亮点**：行数最多的 AGENTS.md，多级文件结构（根+子目录）是最复杂的组织方式

**链接**：https://github.com/getsentry/sentry/blob/main/AGENTS.md

---

### 17. PostHog (PostHog/posthog)

**技术栈**：Django / React / TypeScript / Celery / ClickHouse

**文件**：AGENTS.md，约 500+ 行

**核心要点**：
- hogli 统一 CLI
- Agent 自动化层级：Linters → lint-staged → Skills → AGENTS.md
- 强制 Skill 调用
- personhog 客户端（禁止直接 ORM 查询）
- Temporal 2MiB 限制

**亮点**：最清晰的 Agent 自动化层级定义，personhog 客户端封装 ORM 的设计模式

**链接**：https://github.com/PostHog/posthog/blob/main/AGENTS.md

---

### 18. Zulip (zulip/zulip)

**技术栈**：Django / React / TypeScript / Tornado

**文件**：CLAUDE.md，约 500+ 行

**核心要点**：
- "没有细节太小"原则
- Commit 纪律：每个 commit 最小连贯
- `Fixes part of #123` 而非 `Partially fixes`
- ~98% 测试覆盖率

**亮点**：最严格的 commit 纪律和最高测试覆盖率要求

**链接**：https://github.com/zulip/zulip/blob/main/CLAUDE.md

---

### 19. Mozilla Bedrock (mozilla/bedrock)

**技术栈**：Django / Python 3.14 / Webpack / Docker

**文件**：AGENTS.md，约 200 行

**核心要点**：
- Wagtail CMS 集成
- LLM 不列为共同作者
- Zizmor 安全检查

**亮点**：明确禁止 LLM 作为共同作者，Zizmor 安全检查工具集成

**链接**：https://github.com/mozilla/bedrock/blob/main/AGENTS.md

---

### 20. Wagtail (wagtail/wagtail)

**技术栈**：Django / Python

**文件**：AGENTS.md，约 100 行

**核心要点**：
- AI 披露模板
- StreamField / StreamBlock 模板访问 pitfall

**亮点**：StreamField 模板访问的常见陷阱提醒

**链接**：https://github.com/wagtail/wagtail/blob/main/AGENTS.md

---

### 21. Dify (langgenius/dify)

**技术栈**：Python (Flask) / Next.js / DDD / Celery / Redis

**文件**：多级 AGENTS.md（根 + api/），约 500 行

**核心要点**：
- Agent 必读 docstrings 规则
- DDD + Clean Architecture
- 多租户 tenant_id 贯穿
- SQLAlchemy session 管理
- Pydantic v2 DTOs

**亮点**：DDD + Clean Architecture 在 AI 平台中的完整实践，tenant_id 贯穿所有层

**链接**：https://github.com/langgenius/dify/blob/main/AGENTS.md

---

### 22. Cookiecutter Django (cookiecutter/cookiecutter-django)

**技术栈**：Python / Jinja2 / uv

**文件**：AGENTS.md，约 300 行

**核心要点**：
- Cookiecutter 模板（非 Django 应用本身）
- hooks/pre_gen_project.py 验证
- hooks/post_gen_project.py 清理
- 日历版本控制（CalVer）

**亮点**：模板项目的 AGENTS.md，hooks 生命周期管理是独特场景

**链接**：https://github.com/cookiecutter/cookiecutter-django/blob/main/AGENTS.md

---

## 五、AI Agent 框架

### 23. OpenAI Swarm (openai/swarm)

**技术栈**：Python

**文件**：AGENTS.md，约 50 行

**核心要点**：
- 极简 Agent 框架
- 轻量级 handoff 机制

**亮点**：最精简的 Agent 框架，AGENTS.md 也极简

**链接**：https://github.com/openai/swarm/blob/main/AGENTS.md

---

### 24. AutoGen (microsoft/autogen)

**技术栈**：Python

**文件**：AGENTS.md

**核心要点**：
- 多 Agent 对话框架
- Agent 间通信与协作机制

**亮点**：微软出品的多 Agent 对话框架

**链接**：https://github.com/microsoft/autogen/blob/main/AGENTS.md

---

### 25. CrewAI (crewAIInc/crewAI)

**技术栈**：Python

**文件**：AGENTS.md

**核心要点**：
- 角色扮演 Agent 框架
- Crew / Agent / Task 三层抽象

**亮点**：独特的角色扮演隐喻，降低 Agent 编程门槛

**链接**：https://github.com/crewAIInc/crewAI/blob/main/AGENTS.md

---

### 26. Anthropic Cookbook (anthropics/anthropic-cookbook)

**技术栈**：Python / Jupyter

**文件**：CLAUDE.md，约 150 行

**核心要点**：
- uv 包管理
- ruff 格式化（100 字符行宽）
- Claude 模型命名规则（禁止 dated model IDs）
- Bedrock 模型 ID 格式
- notebook 规范
- registry.yaml 注册

**亮点**：Claude 模型命名规则和 Bedrock ID 格式是 Anthropic 生态的独特规范

**链接**：https://github.com/anthropics/anthropic-cookbook/blob/main/CLAUDE.md

---

### 27. MCP Python SDK (modelcontextprotocol/python-sdk)

**技术栈**：Python 3.10+ / uv

**文件**：AGENTS.md，约 200 行

**核心要点**：
- main（v2 重构）vs v1.x（稳定）双分支策略
- 仅使用 uv，禁止 pip
- 100% 覆盖率（fail_under=100）
- 禁止 `except Exception`
- `logger.exception()` 而非 `logger.error()`

**亮点**：最严格的覆盖率要求（fail_under=100）和异常处理规范

**链接**：https://github.com/modelcontextprotocol/python-sdk/blob/main/AGENTS.md

---

### 28. FastMCP (jlowin/fastmcp)

**技术栈**：Python 3.10+ / uv / prek

**文件**：CLAUDE.md，约 500 行

**核心要点**：
- prek hooks 强制执行
- Release 流程（pun 标题格式）
- 禁止 force-push
- PR 消息 1-2 段落
- bot review 评论处理
- 功能不存在除非有文档

**亮点**："功能不存在除非有文档"原则，prek hooks 强制执行

**链接**：https://github.com/jlowin/fastmcp/blob/main/CLAUDE.md

---

## 六、Python 工具链

### 29. Ruff (astral-sh/ruff)

**技术栈**：Rust（Python linter/formatter + ty type checker）

**文件**：AGENTS.md，约 200 行

**核心要点**：
- nextest 测试运行器
- `INSTA_FORCE_PASS` 快照测试
- `cargo dev generate-all` 代码生成
- Salsa 增量性（ty 类型检查器）
- 避免 `panic!` / `unwrap!`

**亮点**：Rust 实现的 Python 工具链，Salsa 增量计算框架的应用

**链接**：https://github.com/astral-sh/ruff/blob/main/AGENTS.md

---

### 30. uv (astral-sh/uv)

**技术栈**：Rust（Python 包管理器）

**文件**：AGENTS.md，约 100 行

**核心要点**：
- insta 快照测试
- `cargo update --precise` 依赖锁定
- 避免 `panic!` / `unwrap!`
- SAFETY 注释要求
- let chains 优先

**亮点**：SAFETY 注释和 let chains 是 Rust 项目的独特规范

**链接**：https://github.com/astral-sh/uv/blob/main/AGENTS.md

---

### 31. Sentry Python SDK (getsentry/sentry-python)

**技术栈**：Python / tox

**文件**：AGENTS.md，约 80 行

**核心要点**：
- tox 唯一入口
- 自动生成文件（tox.ini / CI workflows）
- 集成契约：不崩溃 / 不吞异常 / 不改变引用
- Co-Authored-By 要求

**亮点**：集成三原则（不崩溃/不吞异常/不改变引用）是 SDK 设计的黄金法则

**链接**：https://github.com/getsentry/sentry-python/blob/main/AGENTS.md

---

## 七、云 SDK 与基础设施

### 32. Azure SDK for Python (Azure/azure-sdk-for-python)

**技术栈**：Python

**文件**：AGENTS.md，约 400 行

**核心要点**：
- 100+ 包 monorepo
- TypeSpec SDK 生成工作流
- azpysdk 测试运行器
- MCP 服务器工具
- 自动化边界：安全 / 受限 / 禁止操作
- Semantic 版本控制

**亮点**：100+ 包的超大 monorepo，TypeSpec 代码生成工作流

**链接**：https://github.com/Azure/azure-sdk-for-python/blob/main/AGENTS.md

---

### 33. AWS CDK (aws/aws-cdk)

**技术栈**：TypeScript（jsii 生成 Python 绑定）

**文件**：AGENTS.md，约 500+ 行

**核心要点**：
- L1 / L2 / L3 层模型
- Mixin / Facade / Trait 构建块
- Feature Flags
- Token 安全
- ValidationError + lit 模板
- Grant 助手方法
- Rosetta README 编译

**亮点**：L1/L2/L3 层模型是 AWS CDK 的核心架构思想，jsii 跨语言绑定

**链接**：https://github.com/aws/aws-cdk/blob/main/AGENTS.md

---

## 八、Web 基础设施

### 34. Chainlit (chainlit/chainlit)

**技术栈**：Python 3.13 / FastAPI / React / pnpm monorepo

**文件**：AGENTS.md，约 400 行

**核心要点**：
- MCP-First 原则（Context7 / Serena / GitHub MCP）
- 向后兼容性关键
- Co-Authored-By 规范
- Socket.IO 实时通信
- 数据层抽象（BaseDataLayer ABC）

**亮点**：最严格的 MCP-First 要求，MCP 不可用时才回退到 CLI

**链接**：https://github.com/chainlit/chainlit/blob/main/AGENTS.md

---

### 35. OpenTelemetry Python (open-telemetry/opentelemetry-python)

**技术栈**：Python / uv monorepo

**文件**：AGENTS.md，约 80 行

**核心要点**：
- 禁止 AI 生成评论
- tox 唯一入口
- 禁止 `type: ignore`
- Assisted-by: trailer

**亮点**：禁止 `type: ignore` 和 AI 生成评论的双重限制

**链接**：https://github.com/open-telemetry/opentelemetry-python/blob/main/AGENTS.md

---

### 36. Python Slack SDK (slackapi/python-slack-sdk)

**技术栈**：Python（零运行时依赖）

**文件**：AGENTS.md，约 200 行

**核心要点**：
- 零运行时依赖
- 自动代码生成（async_client.py / legacy_client.py）
- Web API 方法模式（keyword-only 参数）

**亮点**：零运行时依赖的极致追求，自动代码生成 + keyword-only 参数

**链接**：https://github.com/slackapi/python-slack-sdk/blob/main/AGENTS.md

---

## 九、其他

### 37. Kolibri (learningequality/kolibri)

**技术栈**：Django / Vue.js 2.7

**文件**：AGENTS.md，约 400 行

**核心要点**：
- 组合 API 而非选项 API
- RTL（从右到左）支持
- morango UUIDField
- ValuesViewset

**亮点**：RTL 国际化支持和 morango 同步框架是教育场景的独特需求

**链接**：https://github.com/learningequality/kolibri/blob/main/AGENTS.md

---

### 38. Home Assistant (home-assistant/core)

**技术栈**：Python 3.14

**文件**：AGENTS.md，约 50 行

**核心要点**：
- Python 3.14 语法支持
- 测试参数类型注解
- `pytest.mark.parametrize` 合并测试
- 直接 key 访问而非 `.get()`

**亮点**：最早采用 Python 3.14 的项目之一，直接 key 访问风格

**链接**：https://github.com/home-assistant/core/blob/main/AGENTS.md

---

### 39. PhotoPrism (photoprism/photoprism)

**技术栈**：Go / Vue 3

**文件**：AGENTS.md，约 500 行

**核心要点**：
- Go 后端 + Vue 前端
- Makefile 目标为真相来源
- 多语言项目规范

**亮点**：非 Python 项目但收录作为对比参考，Makefile 作为单一真相来源

**链接**：https://github.com/photoprism/photoprism/blob/main/AGENTS.md

---

## 统计表

| 分类 | 项目数 | 代表项目 |
|------|--------|----------|
| AI/ML 框架与工具 | 9 | LangChain, Pydantic AI, Google ADK |
| 数据科学与分析 | 3 | pandas, PyCA Cryptography, Apache Superset |
| 数据工程与工作流 | 3 | Apache Airflow, Prefect, Dagster |
| Web 应用与平台 | 7 | Sentry, PostHog, Zulip, Dify |
| AI Agent 框架 | 6 | OpenAI Swarm, AutoGen, MCP Python SDK |
| Python 工具链 | 3 | Ruff, uv, Sentry Python SDK |
| 云 SDK 与基础设施 | 2 | Azure SDK, AWS CDK |
| Web 基础设施 | 3 | Chainlit, OpenTelemetry, Python Slack SDK |
| 其他 | 3 | Kolibri, Home Assistant, PhotoPrism |
| **合计** | **39** | |

---

## Python 项目 AGENTS.md 模式总结

### 包管理工具偏好

| 工具 | 使用项目 | 趋势 |
|------|----------|------|
| uv | OpenAI Agents, Pydantic AI, Google ADK, MCP SDK, FastMCP, OpenTelemetry, Cookiecutter Django | 新项目主流选择 |
| Poetry | LangChain, LlamaIndex | 成熟项目仍在使用 |
| pip | 多数传统项目 | 逐渐被 uv 替代 |
| tox | Sentry Python SDK, OpenTelemetry, PyCA Cryptography | 测试入口封装 |

### 测试策略模式

| 模式 | 使用项目 | 说明 |
|------|----------|------|
| 快照测试 | OpenAI Agents, Ruff, uv | 输出比对，防止意外变更 |
| 100% 覆盖率 | Pydantic AI, MCP SDK | 最严格的覆盖率要求 |
| VCR 录制 | Pydantic AI | HTTP 请求录制回放 |
| inline-snapshot | Pydantic AI | 快照内联在测试代码中 |
| nox/tox 封装 | PyCA Cryptography, Sentry SDK, OpenTelemetry | 禁止直接 pytest |
| breeze 环境 | Apache Airflow | 容器化测试环境 |

### AI 披露与治理

| 模式 | 使用项目 | 说明 |
|------|----------|------|
| 强制 AI 披露 | scikit-learn, Gradio, Wagtail | PR 必须声明 AI 辅助 |
| 关键词验证 | Gradio（kumquat） | 人类验证手段 |
| 禁止纯 Agent PR | Gradio | 必须有人类参与 |
| Co-Authored-By | Chainlit, Sentry SDK | AI 辅助提交标识 |
| 禁止 LLM 共同作者 | Mozilla Bedrock | 明确禁止 LLM 作为作者 |
| Assisted-by trailer | OpenTelemetry | 替代 Co-Authored-By |

### 架构模式

| 模式 | 使用项目 | 说明 |
|------|----------|------|
| Monorepo | LangChain, Pydantic AI, Azure SDK, Sentry | 多包统一管理 |
| DDD | Pydantic AI, Dify | 领域驱动设计 |
| Clean Architecture | Dify | 分层架构 |
| 多级 AGENTS.md | Sentry, Dify | 根+子目录分治 |
| Symlink 双协议 | Prefect | AGENTS.md → CLAUDE.md |

### 格式化与 Lint

| 工具 | 使用项目 | 说明 |
|------|----------|------|
| ruff | LangChain, Dagster, Anthropic Cookbook, FastMCP | 新兴标准 |
| pyink | Google ADK | Google 内部 Black 分支 |
| pre-commit | Apache Superset, FastMCP | 自动化钩子 |
| make targets | Hugging Face, Dagster | Makefile 驱动 |

### 强制 Skill / 工具调用

| 项目 | 强制调用 | 说明 |
|------|----------|------|
| OpenAI Agents | 4 个 Skill | $code-change-verification 等 |
| PostHog | 多个 Skill | Linters → lint-staged → Skills → AGENTS.md |
| Chainlit | MCP-First | Context7 / Serena / GitHub MCP |

---

## 编写建议

基于 39 个项目的 AGENTS.md 分析，以下是为 Python 项目编写 AGENTS.md 的建议：

### 1. 必备内容

- **测试入口**：明确唯一的测试命令（如 `nox -e local`、`uv run pytest`），禁止绕过
- **格式化工具**：指定 ruff / black / pyink 及其配置
- **AI 披露政策**：明确是否要求 AI 辅助声明，以及声明格式
- **PR 规范**：前缀约定、关联 issue、描述要求

### 2. 推荐内容

- **反模式列表**：明确禁止的做法（如 Prefect 的禁止 pip / deferred imports）
- **架构边界**：模块间依赖规则（如 Airflow 的 7 层架构）
- **导入规范**：相对导入 vs 绝对导入的规则
- **安全约束**：IDOR 防护、Token 安全、禁止 `except Exception`

### 3. 高级内容

- **强制 Skill 调用**：定义必调 Skill 确保代码质量
- **多级文件结构**：根 + 子目录 AGENTS.md 分治
- **MCP-First 原则**：优先使用 MCP 服务器获取上下文
- **测试策略组合**：快照 + VCR + inline-snapshot

### 4. 行数建议

| 项目规模 | 建议行数 | 参考 |
|----------|----------|------|
| 小型库 | 50-100 行 | scikit-learn, Home Assistant |
| 中型项目 | 200-400 行 | LangChain, Chainlit, MCP SDK |
| 大型平台 | 400-800 行 | Pydantic AI, Airflow, PostHog |
| 企业级应用 | 800+ 行 | Sentry, Hermes Agent |

### 5. 常见反模式

- 过于简短（<30 行）：无法提供有效指导
- 过于冗长（>1000 行）：Agent 难以有效遵循
- 缺少具体命令：应提供可直接执行的命令
- 缺少禁止事项：应明确列出反模式
- 忽略 AI 治理：应包含 AI 披露和审核要求
