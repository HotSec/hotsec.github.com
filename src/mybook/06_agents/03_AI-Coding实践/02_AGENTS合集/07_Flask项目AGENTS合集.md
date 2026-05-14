# Flask 项目 AGENTS.md / CLAUDE.md 合集

本文档专门收集**Flask相关项目**的AGENTS.md / CLAUDE.md文件。

> 重要说明（2026年5月）：经过全面搜索和检查，我们发现**Flask生态系统中拥有AGENTS.md或CLAUDE.md的项目极其罕见**。我们已检查了60+个Flask相关项目，最终成功收集到**5个**有价值的Flask项目的AGENTS.md。
>
> 核心发现：Flask框架本身及其整个扩展生态（pallets-eco组织下的所有项目）**全部没有**AGENTS.md。只有少数**使用Flask构建的大型应用**才有此文件。

---

## 一、Flask应用平台

### 1. Dify (langgenius/dify)

**技术栈**：Python (Flask) / Next.js / TypeScript / DDD架构 / Celery / Redis

**文件**：多级AGENTS.md（根目录 + api/），总计约200行

**根目录 AGENTS.md 核心结构**：
- **项目概述**：LLM应用开发平台，结合Agentic AI工作流、RAG管道、Agent能力和模型管理
- **代码库分割**：
  - Backend API (`/api`)：Python Flask应用，DDD架构
  - Frontend Web (`/web`)：Next.js + TypeScript + React
  - Docker部署 (`/docker`)：容器化部署配置
- **后端工作流**：阅读 `api/AGENTS.md` 获取详情，通过 `uv run --project api <command>` 运行
- **前端工作流**：阅读 `web/AGENTS.md` 获取详情
- **测试与质量实践**：
  - TDD：red → green → refactor
  - pytest + Arrange-Act-Assert结构
  - 强类型；避免 `Any`，优先显式类型注解
  - 自文档化代码；只添加解释意图的注释
- **语言风格**：
  - Python：保持类型提示，实现相关特殊方法（`__repr__`、`__str__`），优先 `TypedDict` 而非 `dict`
  - TypeScript：严格配置，ESLint + `pnpm type-check`，避免 `any`
- **项目约定**：
  - 后端架构遵循DDD和Clean Architecture原则
  - 异步工作通过Celery + Redis
  - 前端用户可见字符串必须使用 `web/i18n/en-US/`

**api/AGENTS.md 核心结构**（约300行，极其详细）：
- **Agent必读规则**：修改代码前必须阅读周围的docstrings和注释
- **文档分层规范**：
  - Module docstring：目的、边界、关键不变量、"gotchas"
  - Class docstring：职责、生命周期、不变量
  - Function/method docstring：行为契约、参数、返回值、副作用、异常
  - Paragraph/block comments：解释"为什么"
- **编码风格**：
  - Ruff格式化和lint，120字符行宽
  - snake_case变量/函数，PascalCase类，UPPER_CASE常量
  - 类型注解，优先 `TypedDict`，`NotRequired[...]` 处理可选键
  - 类成员变量显式声明在类体顶部
- **架构与边界**：
  - 分层架构：controller → service → core/domain
  - 复用 `core/`、`services/`、`libs/` 中的现有助手
- **SQLAlchemy模式**：
  - 模型继承 `models.base.TypeBase`
  - 上下文管理器打开session
  - 始终按 `tenant_id` 范围查询
- **Pydantic使用**：
  - Pydantic v2模型定义DTOs，默认禁止额外字段
  - `@field_validator` / `@model_validator` 处理领域规则
- **工具命令**：
  - `make format` / `make lint` / `make type-check`
  - `make test TARGET_TESTS=./api/tests/<target>`

**亮点**：
- **最详细的Flask项目AGENTS.md**，包含完整的后端开发规范
- DDD + Clean Architecture原则贯穿始终
- 多租户意识（`tenant_id` 必须贯穿每一层）
- Agent必读规则：docstrings和注释被视为规范的一部分
- SQLAlchemy session管理模式和Pydantic v2最佳实践

**链接**：
- https://github.com/langgenius/dify/blob/main/AGENTS.md
- https://github.com/langgenius/dify/blob/main/api/AGENTS.md

---

### 2. Apache Superset (apache/superset)

**技术栈**：Python (Flask) / React / TypeScript / SQLAlchemy / Flask-AppBuilder

**文件**：AGENTS.md（多LLM文件：AGENTS.md + GEMINI.md + GPT.md），约400行

**核心结构**：
- **关键：始终在推送前运行 pre-commit**
  ```bash
  git add .
  pre-commit run --all-files
  ```
  CI将失败如果pre-commit检查不通过
- **正在进行的重构（关键）**：
  - 前端现代化：
    - **禁止 `any` 类型**——使用proper TypeScript类型
    - **禁止JavaScript文件**——转换为TypeScript
    - 使用 `@superset-ui/core` 而非直接导入Ant Design
  - 测试策略迁移：
    - **优先单元测试** > 集成测试 > 端到端测试
    - **使用Playwright进行E2E测试**——正在从Cypress迁移
    - **Cypress已废弃**——迁移完成后将移除
  - 后端类型安全：
    - 所有新Python代码需要proper typing
    - MyPy合规
- **UUID迁移**：
  - 新模型应使用UUID主键
  - 外部API使用UUID而非内部整数ID
- **关键目录**：
  - `superset/superset/`：Python后端（Flask、SQLAlchemy）
  - `superset-frontend/src/`：React TypeScript前端
  - `tests/`：Python/集成测试
  - `docs/`：文档（变更时更新）
- **API结构**：
  - `/api.py`：REST端点，带decorators和OpenAPI docstrings
  - `/schemas.py`：Marshmallow验证schemas
  - `/commands/`：业务逻辑类，带@transaction() decorators
  - `/models/`：SQLAlchemy数据库模型
- **安全与特性**：
  - RBAC：通过Flask-AppBuilder的基于角色的访问控制
  - Feature flags：控制功能推出
  - Row-level security：基于SQL的数据访问控制
- **PR指南**：
  - 使用Conventional Commits
  - 类型：`fix`、`feat`、`docs`、`style`、`refactor`、`perf`、`test`、`chore`

**亮点**：
- 多LLM平台支持（Claude/GitHub Copilot/Gemini/ChatGPT）
- 正在进行的重构详细说明
- UUID迁移的详细指导
- Storybook MDX文档生成的完整流程
- SQLAlchemy查询最佳实践：`~Model.field` 而非 `== False`

**链接**：https://github.com/apache/superset/blob/master/AGENTS.md

---

## 二、数据工程平台（Flask后端）

### 3. Apache Airflow (apache/airflow)

**技术栈**：Python (Flask) / UV workspace monorepo / React / Helm / Celery

**文件**：AGENTS.md，约500+行

**核心结构**：
- **命名约定**：所有散文中写 **Dag**（标题大小写），仅在代码token中保持全大写或小写
- **环境设置**：
  - `uv tool install prek` 安装prek
  - `scripts/tools/setup_breeze` 安装breeze shim
  - **永远不要在主机上直接运行pytest/python/airflow**——必须使用breeze
- **命令矩阵**：
  - 单个测试：`uv run --project <PROJECT> pytest path/to/test.py::TestClass::test_method -xvs`
  - 测试文件：`uv run --project <PROJECT> pytest path/to/test.py -xvs`
  - 并行测试：`breeze testing <test_group> --run-in-parallel`
  - 类型检查：`prek run mypy-<project> --all-files`
  - Lint：`prek run ruff --from-ref <target_branch>`
  - 格式化：`prek run ruff-format --from-ref <target_branch>`
- **仓库结构**：UV workspace monorepo
  - `airflow-core/src/airflow/`：核心调度器、API、CLI、模型
  - `task-sdk/`：轻量级SDK
  - `providers/`：100+提供者包
  - `chart/`：Helm chart
- **架构边界**（7层）：
  1. 用户使用Task SDK编写Dag
  2. Dag File Processor解析Dag文件
  3. Scheduler读取序列化Dag——**永远不运行用户代码**
  4. Workers通过Task SDK执行任务——**永远不直接访问元数据DB**
  5. API Server提供React UI和处理所有客户端-数据库交互
  6. Triggerer在独立进程中评估延迟任务/传感器
  7. 共享库在 `shared` 文件夹中
- **安全模型**：区分实际漏洞 / 已知限制 / 部署加固
- **编码标准**：
  - ruff格式化后立即检查
  - 禁止 `assert` 在生产代码中
  - `time.monotonic()` 用于持续时间
  - keyword-only `session` 参数
  - Apache License header在所有新文件上
- **测试标准**：pytest模式、`spec`/`autospec` mock、`time_machine`、`@pytest.mark.db_test`
- **Git远程命名约定**：`upstream` → apache/airflow、`origin` → fork
- **Commit规范**：关注用户影响而非实现细节

**亮点**：
- **最详细的架构边界说明**：7层架构，每层职责清晰
- **永远不要在主机上直接运行pytest**——必须使用breeze
- Git远程命名约定极其严格
- 安全模型的三级分类：实际漏洞 / 已知限制 / 部署加固
- Newsfragments只用于特定发行版

**链接**：https://github.com/apache/airflow/blob/main/AGENTS.md

---

## 三、Flask生态SDK

### 4. Sentry Python SDK (getsentry/sentry-python)

**技术栈**：Python / Flask / Django / Celery / tox

**文件**：AGENTS.md，约80行

**核心结构**：
- **Tox环境（关键）**：始终从主 `tox.venv` 运行tox
- **包管理器**：使用 **tox** 而非pytest直接运行测试
- **类型检查**：使用tox（`tox -e mypy`），必须零错误通过
- **Commit归属**：AI提交必须包含 `Co-Authored-By: <agent model name> <noreply@anthropic.com>`
- **自动生成文件（关键）**：
  - 禁止直接编辑，自动生成：
    - `tox.ini` → `scripts/populate_tox/populate_tox.py`
    - `.github/workflows/test-integrations-*.yml` → `scripts/split_tox_gh_actions/split_tox_gh_actions.py`
  - 重新生成所有：`scripts/generate-test-files.sh`
- **集成添加流程**：
  1. 添加最低版本到 `_MIN_VERSIONS` in `sentry_sdk/integrations/__init__.py`
  2. 添加配置到 `scripts/populate_tox/config.py`
  3. 添加到组 in `scripts/split_tox_gh_actions/split_tox_gh_actions.py`
  4. 运行 `scripts/generate-test-files.sh`
- **集成契约**：
  - 不崩溃应用或吞没异常
  - 不改变对象引用或改变函数签名
  - 不泄漏文件描述符或进行意外DB请求
  - 编写防御性代码
  - 使用端到端测试（非mocks）

**亮点**：
- tox是唯一的测试/类型检查/Lint入口
- 自动生成文件的严格管理
- 集成契约的防御性编码要求
- Flask集成是Sentry Python SDK的重要集成之一

**链接**：https://github.com/getsentry/sentry-python/blob/main/AGENTS.md

---

## 四、Flask脚手架与工具

### 5. Cookiecutter Django (cookiecutter/cookiecutter-django)

**技术栈**：Python / Jinja2模板 / uv

**文件**：AGENTS.md，约300行

**核心结构**：
- **项目性质**：这是一个**Cookiecutter模板**，生成生产级Django项目，不是Flask应用本身
- **命令**：
  - 安装依赖：`uv sync --locked`
  - 运行测试：`uv run tox run -e py` 或 `uv run pytest -n auto tests`
  - Linting：`uv run pre-commit run --all-files`
- **架构**：
  - 模板生成流程：用户运行cookiecutter → hooks/pre_gen_project.py验证 → Jinja2渲染 → hooks/post_gen_project.py清理
  - 关键文件：`cookiecutter.json`（变量和选项）、`hooks/pre_gen_project.py`（验证）、`hooks/post_gen_project.py`（清理）
- **生成项目布局**：
  - `config/settings/{base,local,test,production}.py` - 拆分设置
  - `config/urls.py` - URL路由
  - `<project_slug>/users/` - 自定义用户模型
- **约定**：
  - Python 3.14要求
  - 行长度：119字符
  - Ruff用于linting/格式化
  - 日历版本控制：`YYYY.MM.DD`

**说明**：虽然这是Django脚手架，但它展示了如何为Python Web项目编写AGENTS.md，Flask项目可以参考类似模式。

**链接**：https://github.com/cookiecutter/cookiecutter-django/blob/main/AGENTS.md

---

## 五、未找到 AGENTS.md / CLAUDE.md 的 Flask 项目

以下Flask相关项目经全面检查（包括根目录、`.agents/`、`.claude/`等位置）**没有**AGENTS.md或CLAUDE.md文件：

### Flask核心框架

| 项目 | GitHub |
|------|--------|
| Flask | [pallets/flask](https://github.com/pallets/flask) |
| Werkzeug | [pallets/werkzeug](https://github.com/pallets/werkzeug) |
| Jinja | [pallets/jinja](https://github.com/pallets/jinja) |
| Click | [pallets/click](https://github.com/pallets/click) |
| ItsDangerous | [pallets/itsdangerous](https://github.com/pallets/itsdangerous) |
| MarkupSafe | [pallets/markupsafe](https://github.com/pallets/markupsafe) |

### Flask扩展

| 项目 | GitHub |
|------|--------|
| Flask-SQLAlchemy | [pallets-eco/flask-sqlalchemy](https://github.com/pallets-eco/flask-sqlalchemy) |
| Flask-Migrate | [pallets-eco/flask-migrate](https://github.com/pallets-eco/flask-migrate) |
| Flask-Login | [pallets-eco/flask-login](https://github.com/pallets-eco/flask-login) |
| Flask-WTF | [pallets-eco/flask-wtf](https://github.com/pallets-eco/flask-wtf) |
| Flask-CORS | [pallets-eco/flask-cors](https://github.com/pallets-eco/flask-cors) |
| Flask-RESTful | [pallets-eco/flask-restful](https://github.com/pallets-eco/flask-restful) |
| Flask-Admin | [pallets-eco/flask-admin](https://github.com/pallets-eco/flask-admin) |
| Flask-SocketIO | [pallets-eco/flask-socketio](https://github.com/pallets-eco/flask-socketio) |
| Flask-Mail | [pallets-eco/flask-mail](https://github.com/pallets-eco/flask-mail) |
| Flask-DebugToolbar | [pallets-eco/flask-debugtoolbar](https://github.com/pallets-eco/flask-debugtoolbar) |
| Flask-Bcrypt | [pallets-eco/flask-bcrypt](https://github.com/pallets-eco/flask-bcrypt) |
| Flask-Principal | [pallets-eco/flask-principal](https://github.com/pallets-eco/flask-principal) |
| Flask-Caching | [pallets-eco/flask-caching](https://github.com/pallets-eco/flask-caching) |
| Flask-JWT-Extended | [pallets-eco/flask-jwt-extended](https://github.com/pallets-eco/flask-jwt-extended) |
| Flask-HTTPAuth | [miguelgrinberg/flask-httpauth](https://github.com/miguelgrinberg/flask-httpauth) |
| Flask-Marshmallow | [marshmallow-code/flask-marshmallow](https://github.com/marshmallow-code/flask-marshmallow) |
| Flask-RESTx | [pallets-eco/flask-restx](https://github.com/pallets-eco/flask-restx) |
| APIFairy | [miguelgrinberg/APIFairy](https://github.com/miguelgrinberg/APIFairy) |

### Flask应用

| 项目 | GitHub |
|------|--------|
| Flasky | [miguelgrinberg/flasky](https://github.com/miguelgrinberg/flasky) |
| Microblog | [miguelgrinberg/microblog](https://github.com/miguelgrinberg/microblog) |
| Cookiecutter Flask | [sloria/cookiecutter-flask](https://github.com/sloria/cookiecutter-flask) |
| Flask Base | [hack4impact/flask-base](https://github.com/hack4impact/flask-base) |
| Security Monkey | [Netflix/security_monkey](https://github.com/Netflix/security_monkey) |
| Amundsen | [lyft/amundsen](https://github.com/lyft/amundsen) |
| CKAN | [ckan/ckan](https://github.com/ckan/ckan) |
| Invenio | [inveniosoftware/invenio](https://github.com/inveniosoftware/invenio) |
| Indico | [indico/indico](https://github.com/indico/indico) |
| Healthchecks | [healthchecks/healthchecks](https://github.com/healthchecks/healthchecks) |
| I Hate Money | [spiral-project/ihatemoney](https://github.com/spiral-project/ihatemoney) |
| Taiga Back | [taigaio/taiga-back](https://github.com/taigaio/taiga-back) |
| Frappe | [frappe/frappe](https://github.com/frappe/frappe) |
| ERPNext | [frappe/erpnext](https://github.com/frappe/erpnext) |
| ChatterBot | [gunthercox/ChatterBot](https://github.com/gunthercox/ChatterBot) |
| DataHub | [datahub-project/datahub](https://github.com/datahub-project/datahub) |

---

## 六、Flask项目特有模式

| 模式 | 出现频率 | 说明 |
|------|---------|------|
| DDD架构 | 高 | Dify使用DDD + Clean Architecture |
| 多级AGENTS.md | 中 | Dify（根 + api/） |
| pre-commit强制 | 高 | Superset、Airflow |
| tox统一入口 | 特定项目 | Sentry Python SDK |
| SQLAlchemy模式 | 高 | Dify、Superset、Airflow |
| 多租户意识 | 中 | Dify（tenant_id贯穿每层） |
| 类型安全迁移 | 高 | Superset（MyPy合规）、Dify（TypedDict） |
| Conventional Commits | 中 | Superset、Dify |
| AI披露要求 | 中 | Sentry Python SDK（Co-Authored-By） |
| 安全模型 | 高 | Airflow（三级分类）、Superset（RBAC） |

---

## 七、Flask vs Django 项目AGENTS.md对比

| 特性 | Flask项目 | Django项目 |
|------|----------|-----------|
| AGENTS.md存在率 | 极低（~5%） | 低（~10%） |
| 典型架构 | DDD / Clean Architecture | Django MVT + DRF |
| ORM | SQLAlchemy | Django ORM |
| API框架 | 自建 / Marshmallow | DRF |
| 前端集成 | Next.js / React | React |
| 任务队列 | Celery + Redis | Celery + Redis |
| 安全关注点 | 多租户隔离 | IDOR防护 / Silo隔离 |
| 测试工具 | pytest + tox / breeze | pytest |
| 包管理 | uv | uv / pip |

---

## 八、编写Flask项目AGENTS.md的建议

基于我们收集的5个Flask项目的AGENTS.md，以下是为Flask项目编写AGENTS.md的建议：

### 1. 必须包含的章节

```markdown
# [项目名称] - AGENTS.md

## 项目概述
- 技术栈：Flask + SQLAlchemy + Celery + Redis
- 架构模式：DDD / Clean Architecture / MVC

## 快速开始
### 环境设置
```bash
uv sync
flask db upgrade
flask run
```

### 开发命令
```bash
# 运行测试
pytest
# 或使用tox
tox -e py3.12

# 代码检查
ruff check . --fix
ruff format .

# 类型检查
mypy .
```

## 项目结构
```
project/
├── app/              # Flask应用
│   ├── api/          # API端点
│   ├── models/       # SQLAlchemy模型
│   ├── services/     # 业务逻辑
│   ├── schemas/      # 序列化/验证
│   └── tasks/        # Celery任务
├── migrations/       # 数据库迁移
├── tests/            # 测试
└── config.py         # 配置
```

## 编码风格
- Ruff格式化和lint
- 类型注解必需
- 优先TypedDict而非dict
- 分层架构：controller → service → model

## SQLAlchemy模式
- 使用上下文管理器打开session
- 始终按tenant_id范围查询
- 优先SQLAlchemy表达式而非原始SQL

## 安全指南
- 多租户隔离
- 输入验证
- SQL注入防护

## Git与PR指南
- Conventional Commits
- AI辅助声明
```

### 2. Flask项目特有的注意事项

1. **架构选择**：Flask是微框架，没有Django那样的约定。AGENTS.md必须明确项目的架构选择（DDD / MVC / 其他）
2. **SQLAlchemy模式**：Flask项目通常使用SQLAlchemy而非Django ORM，需要明确session管理模式
3. **API规范**：Flask没有内置的API框架，需要明确使用的序列化/验证方案（Marshmallow / Pydantic / 自建）
4. **多租户**：如果适用，必须明确多租户隔离策略
5. **Celery任务**：Flask项目常用Celery处理异步任务，需要明确任务模式

---

## 九、总结

虽然我们只找到了5个Flask项目的AGENTS.md，但这些项目都是非常有代表性的：

1. **Dify** - 最详细的Flask项目AGENTS.md，展示DDD + Clean Architecture
2. **Apache Superset** - 企业级数据可视化平台，展示Flask + React架构
3. **Apache Airflow** - 最详细的架构边界说明，展示7层架构
4. **Sentry Python SDK** - Flask集成SDK的规范
5. **Cookiecutter Django** - 项目脚手架参考

这些项目的AGENTS.md提供了宝贵的参考，特别是对于使用Flask构建大型应用的开发者。Flask生态中AGENTS.md的稀缺性也反映了一个现实：Flask的灵活性和简洁性意味着大多数Flask项目规模较小，不需要AGENTS.md来指导AI代理。

如果你发现了其他有AGENTS.md的Flask项目，欢迎补充！
