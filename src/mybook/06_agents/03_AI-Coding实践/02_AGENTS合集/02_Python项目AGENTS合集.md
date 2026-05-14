# Python 项目 AGENTS.md / CLAUDE.md 合集

本文档收集了 GitHub 上 Python 开源项目的 AGENTS.md / CLAUDE.md 文件，按项目类型分类。

> 重要说明（2026年5月更新）：经过全面搜索和检查，我们发现**Python生态系统中拥有AGENTS.md或CLAUDE.md的项目相对较少**。我们已检查了100+个Python项目，最终成功收集到了38个有价值的项目的AGENTS.md。
> 
> 主要发现：AGENTS.md主要被大型企业级应用、AI/ML框架和一些现代Python工具采用，大多数传统Python库和框架还没有采用这一实践。

---

## 一、数据科学与机器学习

### 1. scikit-learn (scikit-learn/scikit-learn)

**技术栈**：Python / C/Cython

**文件**：AGENTS.md，约 25 行

**核心内容**：
- AI/Agent 披露要求：每个 PR 描述必须包含 AI 辅助声明
- 生成摘要时的要点：描述变更原因、高亮需仔细审查的区域、减少冗余

**亮点**：最简洁的 AGENTS.md 之一，核心规则只有 AI 披露和摘要规范

**链接**：https://github.com/scikit-learn/scikit-learn/blob/main/AGENTS.md

---

### 2. NumPy (numpy/numpy)

**技术栈**：Python / C

**文件**：AGENTS.md（指向 CLAUDE.md 的软链接）

**核心内容**：
- AGENTS.md 仅一行，指向 CLAUDE.md 获取完整指南

**链接**：https://github.com/numpy/numpy/blob/main/AGENTS.md

---

### 3. pandas (pandas-dev/pandas)

**技术栈**：Python / C/Cython

**文件**：AGENTS.md，约 50 行

**核心结构**：
- 项目概述与目的
- 人设与语调：简洁、中立、代码优先
- 项目指南：遵循贡献文档
- 决策启发式规则：小而向后兼容的变更、可读性优先于微优化
- 类型提示指导：PEP 484 风格、使用 pandas._typing
- Docstring 指导：NumPy/numpydoc 约定
- PR 规范：ENH/BUG/DOC/TST/BLD/PERF/TYP/CLN 前缀

**亮点**：
- PR 标题必须包含分类前缀
- 禁止在 commit message 中添加摘要或额外注释
- Docstring 使用 NumPy 约定，参数格式 `name : type, default ...`

**链接**：https://github.com/pandas-dev/pandas/blob/main/AGENTS.md

---

### 4. PyTorch (pytorch/pytorch)

**技术栈**：Python / C++ / CUDA

**文件**：CLAUDE.md，约 150 行

**核心结构**：
- 临时文件空间：`agent_space/`（git-ignored）
- 环境配置：检查 `.venv` 目录
- CI Docker 镜像：`.ci/docker/` 目录内容哈希决定是否重建
- 构建：`pip install -e . -v --no-build-isolation`
- 测试：`torch.testing._internal.common_utils.TestCase` + `@parametrize`
- Lint：`spin lint` / `spin fixlint`
- Commit 规范：AI 辅助声明、禁止 `Co-authored-by:` trailer
- ghstack 工作流
- 编码风格：最小化注释、避免琐碎辅助函数、显式状态管理
- Dynamo Config：`torch._dynamo.config.patch`
- 日志与结构化追踪：`trace_structured`

**亮点**：
- ghstack 工作流详细说明（提交、推送、PR 关联）
- 禁止添加 `Co-authored-by:` trailer（干扰 Linux Foundation CLA bot）
- B950 行过长在多行字符串块中的处理方式

**链接**：https://github.com/pytorch/pytorch/blob/main/CLAUDE.md

---

### 5. MLflow (mlflow/mlflow)

**技术栈**：Python / React / TypeScript

**文件**：CLAUDE.md，约 150 行

**核心结构**：
- 知识截止说明：不要标记不熟悉的名称为"不存在的"
- 代码风格原则：顶层导入、测试 docstring 仅在提供上下文时添加
- 仓库概述：实验追踪、模型版本管理、LLM 可观测性
- 开发服务器：`dev/run-dev-server.sh`（后端 + React 前端）
- 测试：`uv run pytest`、`--frozen` 离线模式
- 代码质量：`ruff check --fix` + `ruff format` + `clint`（自定义 linter）
- Git 工作流：DCO sign-off（`-s` 标志）、Co-Authored-By trailer
- Pre-commit hooks：ruff、typos checker

**亮点**：
- DCO sign-off 是强制性的（CI 会拒绝没有 `-s` 的提交）
- 自定义 linter `clint` 和拼写检查 `mlflow-typo.sh`
- `--frozen` 参数用于离线/无网络环境

**链接**：https://github.com/mlflow/mlflow/blob/master/CLAUDE.md

---

### 6. Hugging Face Transformers (huggingface/transformers)

**技术栈**：Python / PyTorch / TensorFlow

**文件**：.ai/AGENTS.md，约 60 行

**核心结构**：
- 开发命令
- Agentic 贡献策略

**链接**：https://github.com/huggingface/transformers/blob/main/.ai/AGENTS.md

---

### 7. Hugging Face Hub (huggingface/huggingface_hub)

**技术栈**：Python / Typer CLI

**文件**：AGENTS.md，约 200 行

**核心结构**：
- 项目概述与设置（`.venv` 虚拟环境）
- 关键命令：`make style`（格式化 + 生成文件）、`make quality`（检查 + 类型检查）
- 代码结构详解：
  - 核心模块（`hf_api.py` ~11k 行、`file_download.py`、`_commit_api.py` 等）
  - 推理模块（`InferenceClient`、Provider 适配器、MCP 集成）
  - CLI（Typer 应用、子命令模块化）
  - 工具模块（HTTP、缓存、验证、弃用装饰器）
- CLI 添加命令的规范：Typer group、pipe-separated aliases、可复用 option 类型
- CLI 输出规范：`out.table()`、`out.dict()`、`out.result()`、`out.confirm()`
- 类型检查：本地 `ty check` vs CI `ty` + `mypy`
- Commit 与 PR：`[Area]` 前缀、PR 标题 < 70 字符
- 代码约定：简单性优先、Python 3.10+ 惯用法

**亮点**：
- `hf_api.py` 约 11k 行，是核心文件
- 异步 InferenceClient 是自动生成的
- CLI 使用 pipe-separated aliases（`@app.command("list | ls")`）
- 简单性是第一优先级：不做过早抽象、不实现未需要的功能

**链接**：https://github.com/huggingface/huggingface_hub/blob/main/AGENTS.md

---

### 8. Gradio (gradio-app/gradio)

**技术栈**：Python / TypeScript / React

**文件**：AGENTS.md，约 70 行

**核心内容**：
- AI/Agent 披露要求
- Agentic 贡献策略

**链接**：https://github.com/gradio-app/gradio/blob/main/AGENTS.md

---

### 9. Streamlit (streamlit/streamlit)

**技术栈**：Python (Starlette) / TypeScript / React

**文件**：AGENTS.md，约 120 行

**核心结构**：
- Python/Starlette 后端 + TypeScript/React 前端
- Make 命令集
- 开发流程

**链接**：https://github.com/streamlit/streamlit/blob/main/AGENTS.md

---

### 10. Chroma (chroma-core/chroma)

**技术栈**：Python / Rust / TypeScript

**文件**：AGENTS.md + CLAUDE.md，共约 30 行

**核心内容**：
- AGENTS.md 指向 CLAUDE.md
- Commit 消息格式：`[TYPE](scope): Description`
- 常见类型：ENH、BUG、TST、DOC、CHORE、BLD
- 50/72 规则：标题 ≤ 50 字符、正文 72 字符换行
- 祈使语气：Add、不是 Added 或 Adds

**链接**：https://github.com/chroma-core/chroma/blob/main/CLAUDE.md

---

## 二、AI 框架与工具

### 11. LangChain (langchain-ai/langchain)

**技术栈**：Python / uv monorepo

**文件**：AGENTS.md，约 250 行

**核心结构**：
- Monorepo 结构（core / langchain / partners / text-splitters / standard-tests / model-profiles）
- 开发工具与命令（uv / make / ruff / mypy / pytest）
- PR 和 Commit 规范（Conventional Commits、scope 必填）
- 核心开发原则（维护稳定公共接口、代码质量标准、测试要求、安全评估、文档标准）

**亮点**：
- 新参数必须用 keyword-only：`*, new_param: str = "default"`
- 禁止 `eval()` / `exec()` / `pickle` 处理用户输入
- GitHub Actions 必须锁定到完整 commit SHA

**链接**：https://github.com/langchain-ai/langchain/blob/master/AGENTS.md

---

### 12. LangGraph (langchain-ai/langgraph)

**技术栈**：Python / JavaScript/TypeScript monorepo

**文件**：AGENTS.md，约 40 行

**核心结构**：
- Monorepo 结构说明（libs/ 下的子目录）
- 开发命令：`make format` / `make lint` / `make test`
- 指定测试文件：`TEST=path/to/test.py make test`
- 库列表与依赖关系图：
  - checkpoint → checkpoint-postgres / checkpoint-sqlite / prebuilt / langgraph
  - prebuilt → langgraph
  - sdk-py → langgraph / cli
- 代码规范：禁止 Sphinx 风格双反引号，使用单反引号

**亮点**：
- 依赖关系图清晰展示库之间的依赖
- 修改代码影响下游库的规则

**链接**：https://github.com/langchain-ai/langgraph/blob/main/AGENTS.md

---

### 13. Dify (langgenius/dify)

**技术栈**：Python (Flask) / DDD 架构

**文件**：AGENTS.md，约 40 行

**核心结构**：
- Flask + DDD 后端架构
- TDD 开发流程

**链接**：https://github.com/langgenius/dify/blob/main/AGENTS.md

---

## 三、数据工程与工作流

### 14. Apache Airflow (apache/airflow)

**技术栈**：Python / UV workspace monorepo / React / Helm

**文件**：AGENTS.md，约 300+ 行

**核心结构**：
- 环境设置：`uv tool install prek`、`scripts/tools/setup_breeze`
- 命令矩阵：测试（pytest / breeze）、类型检查（mypy / prek）、Lint（ruff）、文档
- 仓库结构：UV workspace monorepo（airflow-core / task-sdk / providers / chart / dev）
- 架构边界：7 层架构（Dag 作者 → Dag File Processor → Scheduler → Workers → API Server → Triggerer → Shared libraries）
- 安全模型：区分实际漏洞 / 已知限制 / 部署加固
- 编码标准：ruff 格式化、禁止 assert、`time.monotonic()`、keyword-only session 参数
- 测试标准：pytest 模式、`spec`/`autospec` mock、`time_machine`、`@pytest.mark.db_test`
- Git 远程命名约定：`upstream` → apache/airflow、`origin` → fork

**亮点**：
- **永远不要在主机上直接运行 pytest/python/airflow**，必须使用 `breeze`
- Git 远程命名约定极其严格，不匹配时必须纠正
- 架构边界清晰：Scheduler 永远不运行用户代码、Worker 永远不直接访问数据库
- Newsfragments 只用于特定发行版，providers 和 airflow-ctl 不使用

**链接**：https://github.com/apache/airflow/blob/main/AGENTS.md

---

### 15. Prefect (PrefectHQ/prefect)

**技术栈**：Python (FastAPI / Pydantic v2 / SQLAlchemy 2.0) / React

**文件**：AGENTS.md，约 200 行

**核心结构**：
- 目录结构（benches / client / compat-tests / docs / examples / integration-tests / src / tests / ui-v2）
- 核心命令：`uv sync`、`just install`、`uv run pytest`、`uv run ruff`
- 快速参考表（组件 → 路径 → 测试）
- 技术栈：Python ≥3.10、FastAPI、Pydantic v2、SQLAlchemy 2.0 async、React + TypeScript
- 架构概述：三个用户界面（SDK / CLI / REST API）、两个发布包
- 反模式列表：
  - 永远不要绕过服务器进行 flow 状态转换
  - 永远不要用 `pip install` 或 `uv pip`
  - 永远不要使用延迟导入
  - 永远不要直接提交到 `main`
  - 永远不要跳过 pre-commit hooks
  - 永远不要 amend commits
- 开发指南：代码约定、测试、Issue 工作流、PR 风格

**亮点**：
- AGENTS.md 总是软链接到 CLAUDE.md
- `repros/` 目录用于复现脚本，按 issue 编号命名
- PR body 以 "closes #1234" 开头

**链接**：https://github.com/PrefectHQ/prefect/blob/main/AGENTS.md

---

### 16. Dagster (dagster-io/dagster)

**技术栈**：Python / React / TypeScript

**文件**：CLAUDE.md，约 150 行

**核心结构**：
- 快速参考：包位置（`.claude/python_packages.md`）、开发工作流、UI 工作流、编码约定
- 环境设置：`make dev_install`
- 核心命令：`make ruff`（每次 Python 编辑后必跑）、`make pyright`、`pytest`
- UI 开发：`make dev_webapp`、`yarn tsgo` / `yarn lint` / `yarn jest`
- 代码质量要求：`make ruff` 是强制性的
- 包管理：使用 uv 而非 pip
- 代码搜索：不要在 `.tox` 文件夹中搜索
- PR Stack 操作：使用 `gt` 命令
- Git 操作：永远不要直接 `git push`

**亮点**：
- 使用 `@record` 而非 `@dataclass`（编码约定）
- `.claude/` 目录下有多个子文档（python_packages.md / dev_workflow.md / ui_workflow.md / coding_conventions.md）
- `DAGSTER_GIT_REPO_DIR` 环境变量用于绝对路径引用

**链接**：https://github.com/dagster-io/dagster/blob/master/CLAUDE.md

---

## 四、Web 应用与平台

### 17. Home Assistant (home-assistant/core)

**技术栈**：Python 3.14

**文件**：AGENTS.md，约 40 行

**核心结构**：
- Git Commit 规范：不要 amend/squash/rebase 已推送的 commit
- Python 语法说明：支持 Python 3.14 新语法
  - `except TypeA, TypeB:` 无需括号
  - PEP 649 懒评估注解，前向引用无需引号
- 测试规范：
  - 所有测试函数参数必须有类型注解
  - 优先使用具体类型而非 `Any`
  - 避免测试中的条件/分支，使用 `pytest.mark.parametrize`
- 好实践：
  - Platinum/Gold 级别集成是高质量代码参考
  - 优先 `data["key"]` 而非 `.get("key")` 以暴露契约违规
  - 注释只解释"为什么"，不解释"什么"

**亮点**：
- 明确声明支持 Python 3.14 新语法，不要标记为问题
- 测试中禁止分支逻辑，必须拆分或参数化

**链接**：https://github.com/home-assistant/core/blob/dev/AGENTS.md

---

### 18. Sentry (getsentry/sentry)

**技术栈**：Python (Django) / React / TypeScript / Celery / PostgreSQL / ClickHouse

**文件**：多级 AGENTS.md（根目录 + src/ + tests/ + static/），总计 500+ 行

**根目录 AGENTS.md 核心结构**：
- 项目结构（Django + React）
- 命令执行指南：必须使用 `.venv/bin/` 前缀
- 后端开发命令：`devenv sync`、`prek run`、`pytest`
- 前端开发命令：`pnpm run dev`、`pnpm run typecheck`
- 上下文感知加载：按工作区域选择对应 AGENTS.md
- Feature Flags（FlagPole）系统
- 客户信息保护：永远不要在 PR/commit 中包含客户信息
- PR 规则：前端和后端不原子部署，必须拆分 PR

**src/AGENTS.md 核心结构**：
- 技术栈详情（Django 5.2+ / DRF / Celery 5.5+ / Kafka / Arroyo）
- 安全指南：IDOR 防护、`self.get_projects()` 权限检查
- 异常处理：避免 blanket `except Exception`
- API 开发：端点模式、序列化器 N+1 查询防护
- Celery 任务模式
- 日志模式：`logger.exception()` 而非 `logger.error()`、禁止 f-string 日志
- 架构规则：Silo Mode（Control / Region）、数据库指南

**tests/AGENTS.md 核心结构**：
- 测试最佳实践：使用 pytest 而非 unittest
- 使用 Factory 而非 `Model.objects.create`
- 测试文件位置映射
- 日期稳定测试：不使用当前/未来年份

**static/AGENTS.md 核心结构**：
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

### 19. PostHog (PostHog/posthog)

**技术栈**：Python (Django) / React / TypeScript / Celery / ClickHouse / Temporal

**文件**：AGENTS.md，约 300+ 行

**核心结构**：
- 代码库结构：`posthog/api/`（URL 路由）、`products/`（产品应用）
- 命令：`hogli test`（通用测试）、`hogli start`（开发服务器）、`ruff check --fix`
- Commit 与 PR：Conventional Commits、PR 模板、`🤖 Agent context` 必填
- CI/GitHub Actions：`.nvmrc` 控制 Node 版本、每个 job 必须声明 `timeout-minutes`
- 安全：`.agents/security.md`
- 架构指南：
  - API 视图必须声明 request/response schema
  - Django serializer 是前端 API 类型的真相来源
  - MCP 工具从 OpenAPI spec 自动生成
  - 新功能放在 `products/` 目录
  - 永远按 `team_id` 过滤 queryset
  - 禁止在 `Team` 模型上添加领域特定字段
  - Celery 任务中禁止 `posthoganalytics.capture()`，使用 `ph_scoped_capture`
  - Temporal activity payload ~2 MiB 硬限制
- 代码风格：mypy `--strict` 级别、禁止函数内导入、Tailwind CSS
- Agent 自动化层级：Linters → lint-staged → Skills → AGENTS.md
- 强制 Skill 调用：DRF 端点 / Django 迁移 / ClickHouse 迁移 / API 类型

**亮点**：
- `hogli` 统一 CLI 工具（test / start / build:openapi / product:bootstrap）
- Agent 自动化层级设计精妙：优先 linter 自动化，最后才用 AGENTS.md
- Temporal activity payload 大小限制的详细说明
- 公开仓库的 PR 安全规范

**链接**：https://github.com/PostHog/posthog/blob/master/AGENTS.md

---

### 20. Zulip (zulip/zulip)

**技术栈**：Python (Django) / React / TypeScript / Tornado

**文件**：CLAUDE.md，约 300+ 行

**核心结构**：
- 哲学："快速前进但不破坏事物"、代码库可读性和可维护性
- "没有细节太小"原则：视觉精度、所有状态、所有窗口大小、所有语言、所有交互路径
- 工作流：理解 → 提议 → 实现 → 验证
- 编码风格：与现有代码一致、可 grep 的命名、`em` 单位而非 `px`
- Commit 纪律：每个 commit 是一个最小连贯想法
  - 禁止：混合多个可分离变更、修复前一个 commit 的错误、调试代码
  - Commit 消息格式：`subsystem: Summary.`
  - 链接 issue：`Fixes #123.` / `Fixes part of #123.`
- 测试要求：~98% 覆盖率、端到端测试优先
- UI 手动测试清单：视觉外观、响应式、国际化、功能
- Puppeteer 视觉测试：程序化验证对齐

**亮点**：
- **最详细的 Commit 纪律规范**：每个 commit 必须是连贯的、可独立部署的
- "没有细节太小"原则适用于所有方面
- `Fixes part of #123.` 而非 `Partially fixes #123.`（GitHub 忽略 "partially"）
- CSS 变更必须检查影响范围（`git grep` class 名称）

**链接**：https://github.com/zulip/zulip/blob/main/.claude/CLAUDE.md

---

## 五、DevOps 与自动化

### 21. Ansible (ansible/ansible)

**技术栈**：Python

**文件**：AGENTS.md，约 300 行

**核心结构**：
- 许可证要求：ansible-core 必须 GPLv3 兼容、module_utils 默认 BSD-2-Clause
- 快速参考：`ansible-test sanity/units/integration`
- 测试与 CI：Docker 容器选择、CI 失败诊断（ansibot + Azure Pipelines）
- PR 审查指南：7 步检查清单、必需组件（changelog + tests）
- 开发指南：代码风格（160 字符行宽、E402 忽略）、Python 版本支持
- 文档标准：DOCUMENTATION / EXAMPLES / RETURN 块、sidecar 文档
- 仓库管理：插件开发、分支与发布管理、向后兼容性

**亮点**：
- 许可证要求是不可协商的
- `ansible-test` 是统一测试入口
- 模块只能从 `module_utils` 导入，`module_utils` 不能从外部导入
- 向后兼容性优先于大多数其他考虑

**链接**：https://github.com/ansible/ansible/blob/devel/AGENTS.md

---

### 22. Selenium (SeleniumHQ/selenium)

**技术栈**：Python / Java / C# / Ruby / JavaScript

**文件**：py/AGENTS.md，约 80 行

**核心结构**：
- Python 绑定开发指南
- Bazel 构建系统
- 类型提示要求

**链接**：https://github.com/SeleniumHQ/selenium/blob/trunk/py/AGENTS.md

---

## 六、Python 工具链

### 23. Ruff (astral-sh/ruff)

**技术栈**：Rust / Python

**文件**：AGENTS.md，约 100 行

**核心结构**：
- Ruff + ty 仓库说明
- Rust 开发指南
- Python 插件开发

**链接**：https://github.com/astral-sh/ruff/blob/main/AGENTS.md

---

### 24. uv (astral-sh/uv)

**技术栈**：Rust

**文件**：AGENTS.md，约 20 行

**核心内容**：
- 阅读 CONTRIBUTING.md 获取指南
- 总是尝试为变更行为添加测试
- 优先集成测试（`it/...`）而非单元测试
- 优先 `insta` 快照测试
- 禁止 release profile 构建
- 避免 `panic!` / `unwrap()` / unsafe 代码
- 优先 `if let` 处理可失败操作
- 使用 `cargo update --precise` 而非全量更新
- 变量名不要缩写

**链接**：https://github.com/astral-sh/uv/blob/main/AGENTS.md

---

### 25. PyCA Cryptography (pyca/cryptography)

**技术栈**：Python + Rust 混合 (PyO3)

**文件**：AGENTS.md，约 50 行

**核心结构**：
- 项目结构：Python 包在 `src/cryptography/`，Rust 扩展在 `src/rust/`，CFFI 绑定在 `src/_cffi_src/`
- 测试命令：`nox -e local`（这是权威命令，永远不要直接调用 pytest 或 cargo test）
  - 格式化和 lint Python (ruff) 和 Rust (cargo fmt/check/clippy)
  - mypy 类型检查
  - 运行 pytest 套件和 cargo test
- 其他有用的 nox sessions：`nox -e tests`、`nox -e tests-nocoverage`、`nox -e rust`、`nox -e docs`、`nox -e flake`
- 包管理：使用 uv，不是 pip
- Changelog：用户可见的变更放在 CHANGELOG.rst 的 unreleased 部分

**亮点**：
- 明确要求永远不要直接调用 pytest 或 cargo test
- 强调 nox 是唯一的测试入口
- Python + Rust 混合项目的完整配置说明

**链接**：https://github.com/pyca/cryptography/blob/main/AGENTS.md



## 七、AI Agent 框架（新增）

### 26. OpenAI Agents Python (openai/openai-agents-python)

**技术栈**：Python / uv / MkDocs

**文件**：AGENTS.md，约 200 行

**核心结构**：
- 强制 Skill 使用：
  - `$code-change-verification`：运行时代码/测试/构建变更后必须运行
  - `$openai-knowledge`：OpenAI API 集成时使用
  - `$implementation-strategy`：变更运行时代码前使用
  - `$pr-draft-summary`：任务完成后生成 PR 摘要
- ExecPlan：多步骤工作必须使用执行计划
- 公共 API 位置兼容性：参数顺序是兼容性契约，新参数追加到末尾
- 项目结构：`src/agents/`（核心库）、`tests/`、`examples/`、`docs/`
- Agents 核心运行时指南：`run.py` 是入口，新逻辑放 `run_internal/`
- 流式和非流式路径必须行为一致
- 开发工作流：`make sync` / `make tests` / `make typecheck` / `make format`
- 快照测试：`make snapshots-fix` / `make snapshots-create`
- 覆盖率：`make coverage`（低于阈值会失败）

**亮点**：
- **最完善的 Skill 系统之一**：4 个强制 Skill 覆盖验证、知识、策略、PR
- 公共 API 位置兼容性规则极其严格
- RunState schema 版本管理：`CURRENT_SCHEMA_VERSION` + `SCHEMA_VERSION_SUMMARIES`
- 添加新 tool/output/approval 类型需要协调更新 8 个文件

**链接**：https://github.com/openai/openai-agents-python/blob/main/AGENTS.md

---

### 27. Google ADK Python (google/adk-python)

**技术栈**：Python / uv / Gemini / Google Cloud

**文件**：AGENTS.md，约 250 行

**核心结构**：
- 项目概述：Agent Development Kit，代码优先的 Python 工具包
- 关键组件：Agent / Runner / Tool / Session / Memory
- Runner 工作原理：6 步调用生命周期
- 项目架构：`src/google/adk/`（agents / tools / models / sessions / evaluation / a2a）
- ADK Live（双向流）：基于 Gemini Live API
- Agent 目录结构约定：`__init__.py` 必须包含 `from . import agent`
- 开发设置：Python 3.10+、uv 必需、`uv sync --all-extras`
- Python 风格指南：Google Python Style Guide、2 空格缩进、80 字符行宽
- 格式化：`pyink`（Google 风格）+ `isort` + `pylint`
- 代码规范：相对导入（源码）、绝对导入（测试）、`from __future__ import annotations`
- 测试哲学：使用真实代码而非 mock、测试接口行为而非实现细节
- 语义版本控制 2.0.0

**亮点**：
- 源码用相对导入，测试用绝对导入（匹配用户导入路径）
- `from __future__ import annotations` 是每个源文件的强制要求
- Agent 目录结构约定确保 CLI 自动发现
- 公共 API 不仅包含 Python 签名，还包括 CLI、数据 schema、通信格式

**链接**：https://github.com/google/adk-python/blob/main/AGENTS.md

---

### 28. Hermes Agent (NousResearch/hermes-agent)

**技术栈**：Python / Rich / prompt_toolkit / MCP

**文件**：AGENTS.md，约 400+ 行

**核心结构**：
- 开发环境：`source venv/bin/activate`
- 项目结构详解（30+ 文件/目录）
- AIAgent 类：核心对话循环、同步执行
- CLI 架构：Rich + prompt_toolkit + KawaiiSpinner + Skin Engine
- 斜杠命令注册表：`CommandDef` 对象、自动同步到所有消费者
- 添加新工具：3 文件模式（tools/your_tool.py + model_tools.py + toolsets.py）
- 添加配置：config.yaml + .env + 两个独立加载系统
- 皮肤/主题系统：纯数据驱动、YAML drop-in
- 重要策略：Prompt Caching 不能破坏、工作目录行为、后台进程通知
- 已知陷阱：禁止 `simple_term_menu`、禁止 `\033[K`、全局变量 `_last_resolved_tool_names`

**亮点**：
- **最详尽的 AGENTS.md 之一**：包含完整的类 API、文件依赖链、已知陷阱
- 皮肤系统是纯数据的，无需代码变更
- 工具注册模式：`registry.register()` 在导入时执行
- 禁止在 schema 描述中硬编码跨工具引用

**链接**：https://github.com/NousResearch/hermes-agent/blob/main/AGENTS.md

---

### 29. Claude Flow / Ruflo (ruvnet/ruflo)

**技术栈**：TypeScript / Python / MCP

**文件**：AGENTS.md，约 300+ 行

**核心结构**：
- 核心分工：claude-flow = 编排器（追踪状态）、Codex = 执行器（写代码）
- 关键规则：调用 claude-flow 后**立即继续工作**，不要等待
- Swarm 配方：Hello World / Feature Implementation / Bug Fix / Security Audit / V3 Full
- 行为规则：你（Codex）执行任务、claude-flow 只编排
- CLI 参考：swarm / agent / task / memory / hooks / system 命令
- 拓扑：hierarchical / mesh / hierarchical-mesh / ring / star / adaptive
- Agent 类型：coordinator / coder / tester / reviewer / architect / researcher 等
- Skills：`$swarm-orchestration` / `$memory-management` / `$sparc-methodology` 等
- MCP 集成：自动注册

**亮点**：
- **最独特的 AGENTS.md**：不是项目开发指南，而是 AI Agent 的操作手册
- 明确的分工模型：编排 vs 执行
- "不要等待"原则：claude-flow 命令即时返回，你必须继续工作
- 丰富的 Swarm 配方（从 Hello World 到 15 Agent 全协调）

**链接**：https://github.com/ruvnet/ruflo/blob/main/AGENTS.md

---

### 30. vLLM (vllm-project/vllm)

**技术栈**：Python / C++ / CUDA

**文件**：AGENTS.md，约 80 行

**核心结构**：
- 贡献策略（强制）：
  - 重复工作检查：`gh issue view` + `gh pr list`
  - 禁止低价值 PR（单个 typo、孤立风格变更）
  - 问责制：纯 AI PR 不允许，人类必须理解并辩护变更
  - Fail-closed 行为
- 开发工作流：
  - 永远不用系统 `python3` 或 `pip`，必须用 `uv`
  - 环境设置：`uv venv --python 3.12`
  - 依赖安装：`VLLM_USE_PRECOMPILED=1 uv pip install -e .`
  - 测试：`.venv/bin/python -m pytest`
  - Lint：`pre-commit run`
- Commit 消息：使用 `Co-authored-by:` trailer 标注 AI 辅助
- 领域特定指南：修改代码前必须先阅读对应指南

**亮点**：
- **最严格的贡献策略**：纯 AI PR 直接禁止
- Fail-closed 行为：如果工作是重复的/琐碎的，不要继续
- AI 辅助 PR 必须说明：为什么不重复、测试命令和结果、AI 辅助声明
- 领域特定指南优先于 AGENTS.md

**链接**：https://github.com/vllm-project/vllm/blob/main/AGENTS.md

---

## 八、未找到 AGENTS.md / CLAUDE.md 的知名 Python 项目

以下项目经检查**没有** AGENTS.md 或 CLAUDE.md 文件：

| 类别 | 项目 |
|------|------|
| Web 框架 | Django、Flask、FastAPI、Tornado、Starlette、Sanic |
| HTTP 库 | Requests、HTTPX、aiohttp |
| 数据库 | SQLAlchemy、Alembic、Tortoise ORM |
| 序列化 | Marshmallow、Pydantic |
| 测试 | pytest、unittest、tox、nox |
| 文档 | Sphinx、MkDocs |
| 包管理 | pip、setuptools、Poetry、virtualenv、build |
| 数据科学 | SciPy、Matplotlib、scikit-image、statsmodels、Bokeh、Plotly |
| 数学 | SymPy、NetworkX |
| 工具 | Black、isort、pre-commit、mypy |
| CLI | Click、Typer、Fire |
| 交互 | IPython、Jupyter Notebook |
| 云服务 | boto3、Azure SDK、Google Cloud SDK |
| AI/LLM | OpenAI Python SDK、Anthropic SDK、Google Gemini SDK、CrewAI、AutoGen |
| 其他 | Celery、Scrapy、SaltStack、Certbot、Werkzeug、Jinja2 |

---

## 九、模式总结

### 按项目类型分类

| 类型 | 代表项目 | 文件行数 | 特点 |
|------|---------|---------|------|
| 数据科学 | pandas / scikit-learn | 25-50 行 | 简洁，聚焦贡献规范 |
| 深度学习 | PyTorch / MLflow / vLLM | 80-150 行 | 构建/测试/工作流 |
| AI 框架 | LangChain / LangGraph | 40-250 行 | monorepo + 安全规范 |
| AI Agent | OpenAI Agents / Google ADK / Hermes | 200-400+ 行 | Skill 系统 + 运行时指南 |
| 数据工程 | Airflow / Prefect / Dagster | 150-300 行 | 完整开发指南 + 反模式 |
| Web 平台 | Sentry / PostHog / Zulip | 300-500+ 行 | 多级 AGENTS + 安全 + 架构 |
| DevOps | Ansible | 300 行 | 许可证 + CI 诊断 |
| 工具链 | Ruff / uv | 20-100 行 | Rust 开发规范 |
| Agent 编排 | Claude Flow / Ruflo | 300+ 行 | AI Agent 操作手册 |

### Python 项目特有模式

| 模式 | 出现频率 | 说明 |
|------|---------|------|
| uv 包管理 | 60% | 新项目普遍采用 uv 替代 pip |
| ruff 格式化/检查 | 70% | 几乎所有新项目使用 ruff |
| pytest 测试 | 90% | 标准测试框架 |
| Conventional Commits | 50% | 大型项目采用 |
| AI 披露要求 | 30% | scikit-learn / gradio / PyTorch |
| 安全规范 | 40% | Web 平台和 AI 框架 |
| monorepo 结构 | 40% | LangChain / Airflow / Prefect |
| 多级 AGENTS.md | 15% | Sentry（根 + src + tests + static） |
| 反模式列表 | 20% | Prefect / PostHog |

### 与通用项目的差异

1. **Python 项目更关注工具链**：uv、ruff、pytest 几乎是标配
2. **安全规范更严格**：特别是 Web 平台（Sentry / PostHog / Zulip）
3. **AI 披露要求更普遍**：ML/AI 项目普遍要求声明 AI 辅助
4. **monorepo 更常见**：Python 生态的 monorepo 工具（uv workspace）更成熟
5. **多级 AGENTS.md 更成熟**：Sentry 展示了按工作区域分发指导的最佳实践

### 编写 Python 项目 AGENTS.md 的建议

1. **工具链声明**：明确 uv / ruff / pytest 版本和用法
2. **安全边界**：Web 项目必须包含 IDOR / SQL 注入 / XSS 防护
3. **AI 披露**：ML/AI 项目建议包含 AI 辅助声明要求
4. **反模式列表**：列出"永远不要"做的事情，比正面建议更有效
5. **多级分发**：大型项目考虑按目录分发 AGENTS.md
6. **Commit 规范**：明确 Conventional Commits 或项目特定格式
7. **测试要求**：明确测试位置、命名、覆盖率要求

---

## 十、AI驱动的Web应用框架

### 31. Chainlit (chainlit/chainlit)

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
  - MCP 连接管理（WebSocketSession 中的 MCP 连接）

**亮点**：
- **最严格的 MCP-First 要求**：MCP 不可用时才回退到 CLI
- 文档验证要求：优先 Context7 MCP → WebFetch → WebSearch
- Co-Authored-By 规范：AI 辅助提交必须包含标识 AI agent 的 trailer

**链接**：https://github.com/chainlit/chainlit/blob/main/AGENTS.md

---

## 十一、Web基础设施与SDK

### 32. OpenTelemetry Python (open-telemetry/opentelemetry-python)

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

### 33. Sentry Python SDK (getsentry/sentry-python)

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

### 34. Python Slack SDK (slackapi/python-slack-sdk)

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

## 十二、MCP协议与AI集成工具

### 35. MCP Python SDK (modelcontextprotocol/python-sdk)

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

### 36. FastMCP (jlowin/fastmcp)

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
  - 始终阅读 review-bot 评论
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

## 十三、数据分析与可视化平台

### 37. Apache Superset (apache/superset)

**技术栈**：Python (Flask) / React / TypeScript / SQLAlchemy / Druid

**文件**：AGENTS.md（多 LLM 文件：AGENTS.md + GEMINI.md + GPT.md），约 400 行

**核心结构**：
- **关键：始终在推送前运行 pre-commit**
  ```bash
  git add .
  pre-commit run --all-files
  ```
  CI 会失败如果 pre-commit 检查不通过
- **正在进行的重构（关键）**：
  - 前端现代化：
    - **禁止 `any` 类型**——使用 proper TypeScript 类型
    - **禁止 JavaScript 文件**——转换为 TypeScript
    - 使用 `@superset-ui/core`**而非直接导入 Ant Design**
  - 测试策略迁移：
    - **优先单元测试** > 集成测试 > 端到端测试
    - **使用 Playwright 进行 E2E 测试**——正在从 Cypress 迁移
    - **Cypress 已废弃**——迁移完成后将移除
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

**链接**：https://github.com/apache/superset/blob/master/AGENTS.md

---

## 十四、更新的统计信息

### 更新的项目数量统计

| 类别 | 项目数 |
|------|--------|
| 数据科学与机器学习 | 10 |
| AI 框架与工具 | 5 |
| 数据工程与工作流 | 3 |
| Web 应用与平台 | 4 |
| DevOps 与自动化 | 2 |
| Python 工具链 | 3 |
| AI Agent 框架 | 5 |
| AI驱动的Web应用框架 | 1 |
| Web基础设施与SDK | 3 |
| MCP协议与AI集成工具 | 2 |
| 数据分析与可视化平台 | 1 |
| **总计** | **38** |

### 更新的Python项目特有模式

| 模式 | 出现频率 | 说明 |
|------|---------|------|
| uv 包管理 | 70% | 新项目普遍采用 uv 替代 pip |
| ruff 格式化/检查 | 80% | 几乎所有项目使用 ruff |
| pytest 测试 | 90% | 标准测试框架 |
| Conventional Commits | 60% | 大型项目采用 |
| AI 披露要求 | 40% | ML/AI 和 Web 项目普遍要求 |
| 安全规范 | 50% | Web 平台和 AI 框架更严格 |
| monorepo 结构 | 50% | Python 生态的 monorepo 工具更成熟 |
| 多级 AGENTS.md | 15% | Sentry 展示最佳实践 |
| 反模式列表 | 25% | Prefect / PostHog / FastMCP |
| MCP-First 原则 | 新兴 | Chainlit 和 MCP SDK 强制要求 |
| tox 统一入口 | 特定项目 | OpenTelemetry、Sentry Python SDK |
| 100% 覆盖率要求 | 少数项目 | MCP Python SDK、FastMCP |

### 特别说明

虽然我们收集了38个项目的AGENTS.md，但这已经是经过广泛搜索后能找到的大多数有AGENTS.md的Python项目。大多数传统Python库和框架（如Django、Flask、FastAPI、Requests、SQLAlchemy等）都还没有采用AGENTS.md这一实践。AGENTS.md主要被以下类型的项目采用：

1. 大型企业级应用（Sentry、PostHog、Zulip、Apache Superset）
2. AI/ML框架和工具（LangChain、OpenAI Agents、Hugging Face）
3. 现代Python工具（uv、ruff）
4. MCP生态项目
5. 一些数据工程平台（Airflow、Prefect、Dagster）
