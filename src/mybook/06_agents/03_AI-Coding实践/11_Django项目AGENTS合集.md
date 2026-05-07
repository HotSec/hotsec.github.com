# Django项目AGENTS.md / CLAUDE.md 合集

本文档专门收集**Django相关项目**的AGENTS.md / CLAUDE.md文件。

> 重要说明（2026年5月更新）：经过全面搜索和检查，我们发现**Django生态系统中拥有AGENTS.md或CLAUDE.md的项目非常罕见**。我们已经尝试了：
> - 50+个流行的Django项目
> - 检查了多个可能的文件位置（根目录、`.agents/`、`.claude/`等）
> - 最终成功收集到**8个**有价值的Django项目的AGENTS.md
>
> 这不是一个错误，而是现实情况：AGENTS.md是一个相对较新的实践（2025年才开始普及），主要被大型企业级应用采用，而大多数Django项目（包括Django框架本身）还没有采用这个实践。

> 重要发现：传统Django应用框架本身**没有**AGENTS.md/CLAUDE.md，但一些大型Django应用项目（如Sentry、PostHog、Zulip）普遍有此文件。

---

## 一、企业级Django应用

### 1. Mozilla Bedrock (mozilla/bedrock)

**技术栈：** Django / Python 3.14 / Webpack / Docker

**文件：** AGENTS.md，约200行

**核心结构：**
- **项目结构：`bedrock/`（核心Django应用）、`lib/`（共享助手）、`tests/`（测试）、`media/`（前端资源）
- **构建命令：**
  - `make preflight` - 安装Python依赖
  - `make run` - 启动Docker Compose栈
  - `npm start` - 本地开发（Django + webpack热重载
  - `pytest bedrock` - 运行后端测试
- **代码风格：**
  - Python: Ruff强制≤150字符行宽，导入顺序：Django → 第三方 → 第一方
  - JavaScript: ESLint + Prettier，使用`const`/`let`
- **Wagtail CMS集成：** 注意Wagtail文档的LLM适配文档
- **LLM辅助提交规则：** 不将LLM列为共同作者

**亮点：**
- Mozilla官方项目，高质量标准
- Wagtail CMS集成支持
- LLM辅助提交规则

**链接：** https://github.com/mozilla/bedrock/blob/main/AGENTS.md

---

### 2. Zulip (zulip/zulip)

**技术栈：** Django / Python / React / TypeScript / Tornado

**文件：** CLAUDE.md（`.claude/CLAUDE.md`），约500+行

**核心结构：**
- **哲学：** "快速前进但不破坏事物"，代码库可读性和可维护性优先
- **"没有细节太小"原则：** 视觉精度、所有状态、所有窗口大小、所有语言、所有交互路径
- **工作流：** 理解 → 提议 → 实现 → 验证
- **Commit纪律：**
  - 每个commit是一个最小连贯想法
  - 禁止：混合多个可分离变更、修复前一个commit的错误、调试代码
  - Commit消息格式：`subsystem: Summary.`
  - 链接issue：`Fixes #123.` / `Fixes part of #123.`
- **测试要求：** ~98%覆盖率、端到端测试优先
- **UI手动测试清单：** 视觉外观、响应式、国际化、功能

**亮点：**
- 最详细的Commit纪律规范
- "没有细节太小"原则适用于所有方面
- `Fixes part of #123.`而非`Partially fixes #123.`（GitHub忽略"partially"）
- CSS变更必须检查影响范围

**链接：** https://github.com/zulip/zulip/blob/main/.claude/CLAUDE.md

---

### 3. Sentry (getsentry/sentry)

**技术栈：** Django / React / TypeScript / Celery / PostgreSQL / ClickHouse

**文件：** 多级AGENTS.md（根目录 + src/ + tests/ + static/），总计1000+行

**核心结构：**
- **根目录AGENTS.md：**
  - 项目结构（Django + React）
  - 命令执行指南：必须使用`.venv/bin/`前缀
  - 后端开发命令：`devenv sync`、`prek run`、`pytest`
  - 前端开发命令：`pnpm run dev`、`pnpm run typecheck`
  - 上下文感知加载：按工作区域选择对应AGENTS.md
  - Feature Flags（FlagPole）系统
  - 客户信息保护：永远不要在PR/commit中包含客户信息
  - PR规则：前端和后端不原子部署，必须拆分PR
- **src/AGENTS.md：**
  - 技术栈详情（Django 5.2+ / DRF / Celery 5.5+ / Kafka / Arroyo）
  - 安全指南：IDOR防护、`self.get_projects()`权限检查
  - 异常处理：避免 blanket `except Exception`
  - API开发：端点模式、序列化器N+1查询防护
  - Celery任务模式
- **tests/AGENTS.md：**
  - 测试最佳实践：使用pytest而非unittest
  - 使用Factory而非`Model.objects.create`
  - 测试文件位置映射
- **static/AGENTS.md：**
  - 前端技术栈：React 19 / Rspack / pnpm / Emotion / Jest
  - 核心UI组件库（@sentry/scraps）：Flex / Grid / Container / Heading / Text / Image
  - React测试指南

**亮点：**
- 最复杂的多级AGENTS.md系统，按工作区域分发不同指导
- 安全模型极其严格：IDOR防护、silo隔离、JWT token
- 序列化器N+1查询防护模式

**链接：** https://github.com/getsentry/sentry/blob/master/AGENTS.md

---

### 4. PostHog (PostHog/posthog)

**技术栈：** Django / React / TypeScript / Celery / ClickHouse / Temporal

**文件：** AGENTS.md，约500+行

**核心结构：**
- **代码库结构：** `posthog/api/__init__.py`（URL路由）、`products/`（产品应用）
- **命令：**
  - `hogli test` - 通用测试
  - `hogli start` - 开发服务器
  - `ruff check . --fix` - Lint
- **Commit与PR：**
  - Conventional Commits
  - PR模板、`🤖 Agent context`必填
- **架构指南：**
  - API视图必须声明request/response schema
  - Django serializer是前端API类型的真相来源
  - MCP工具从OpenAPI spec自动生成
  - 新功能放在`products/`目录
  - 永远按`team_id`过滤queryset
  - 禁止在`Team`模型上添加领域特定字段
  - Celery任务中禁止`posthoganalytics.capture()`，使用`ph_scoped_capture`
  - Temporal activity payload ~2 MiB硬限制
- **Agent自动化层级：** Linters → lint-staged → Skills → AGENTS.md
- **强制Skill调用：** DRF端点 / Django迁移 / ClickHouse迁移 / API类型

**亮点：**
- `hogli`统一CLI工具
- Agent自动化层级设计精妙：优先linter自动化，最后才用AGENTS.md
- 公开仓库的PR安全规范

**链接：** https://github.com/PostHog/posthog/blob/master/AGENTS.md

---

## 二、Django CMS与内容管理

### 5. Wagtail (wagtail/wagtail)

**技术栈：** Django / Python / JavaScript

**文件：** AGENTS.md，约100行

**核心结构：**
- **PR指南：**
  - 描述变更的"为什么"，为什么提议的解决方案是正确的
  - 突出提议变更中需要仔细审查的区域
  - 始终在PR描述中添加免责声明，说明AI代理如何参与贡献
  - 不要添加与PR目的无关的commit
- **AI/Agent披露模板：**
  ```
  > 此PR包含在AI辅助下编写的代码。
  > 代码**尚未**经过人类审查。
  ```
- **Wagtail特定陷阱：**
  - StreamField和StreamBlock模板访问：使用`value`属性

**亮点：**
- 简洁的AI辅助贡献指导
- 明确的AI披露要求

**链接：** https://github.com/wagtail/wagtail/blob/main/AGENTS.md

---

## 三、Django项目脚手架

### 6. Cookiecutter Django (cookiecutter/cookiecutter-django)

**技术栈：** Python / Jinja2模板 / uv

**文件：** AGENTS.md，约300行

**核心结构：**
- **项目性质：** 这是一个**Cookiecutter模板**，生成生产级Django项目，不是Django应用本身
- **命令：**
  - 安装依赖：`uv sync --locked`
  - 运行测试：`uv run tox run -e py` 或 `uv run pytest -n auto tests`
  - Linting：`uv run pre-commit run --all-files`
- **架构：**
  - 模板生成流程：用户运行`cookiecutter` → `hooks/pre_gen_project.py`验证 → Jinja2渲染 → `hooks/post_gen_project.py`清理
  - 关键文件：`cookiecutter.json`（变量和选项）、`hooks/pre_gen_project.py`（验证）、`hooks/post_gen_project.py`（清理）
- **测试结构：**
  - `tests/test_cookiecutter_generation.py` - 主测试文件，使用`pytest-cookies`
- **生成项目布局：**
  - `config/settings/{base,local,test,production.py` - 拆分设置
  - `config/urls.py` - URL路由
  - `<project_slug>/users/` - 自定义用户模型
- **约定：**
  - Python 3.14要求
  - 行长度：119字符
  - Ruff用于linting/格式化
  - 日历版本控制：`YYYY.MM.DD`

**亮点：**
- 清晰的模板生成流程指南
- 详细的测试组合测试方法
- 生成项目的完整结构说明

**链接：** https://github.com/cookiecutter/cookiecutter-django/blob/main/AGENTS.md

---

## 四、教育与学习平台

### 7. Kolibri (learningequality/kolibri)

**技术栈：** Django / Python / Vue.js 2.7 / pytest / Jest

**文件：** AGENTS.md，约400行

**核心结构：**
- **快速入门：**
  ```bash
  pip install -r requirements/dev.txt
  pnpm install
  pre-commit install
  export KOLIBRI_RUN_MODE=dev
  kolibri configure setup
  ```
- **关键注意事项（⚠️）：**
  - 在编写任何Vue组件之前，先搜索现有组件
  - 使用主题令牌，而非硬编码颜色
  - 样式块而非内联——RTL依赖此
  - 组合API，而非选项API
  - 不要新的Vuex——使用组合函数
  - 使用`responsive-window`/`responsive-element`，而非媒体查询
  - 国际化所有用户可见文本
  - API调用仅通过资源类
  - 后端API：使用ValuesViewset
  - 测试是必需的
- **项目结构：**
  - `kolibri/core/` - 核心模块
  - `kolibri/plugins/` - 前端插件
  - `packages/` - JS包
- **关键约定：**
  - Python：F-strings优先。每行一个导入。`DateTimeTzField`用于时间戳。`UUIDField`来自morango用于可同步模型。描述性迁移名称。所有导入在文件顶部——内联导入仅允许防止循环导入。

**亮点：**
- 极其详细的前端开发规范
- 完整的多语言（RTL）支持指南
- 离线学习平台架构

**链接：** https://github.com/learningequality/kolibri/blob/main/AGENTS.md

---

## 五、其他Django生态相关项目

### 8. PhotoPrism (photoprism/photoprism)

**技术栈：** Go后端（主要是Go，不是Django，但值得参考）

**文件：** AGENTS.md，约500行

**核心结构：**
- **真相来源：** Makefile目标、开发者指南、贡献指南、安全指南
- **项目结构与语言：**
  - 后端：Go（`internal/`, `pkg/`, `cmd/`） + MariaDB/SQLite
  - 前端：Vue 3 + Vuetify 3（`frontend/`）
  - Docker/compose用于开发/CI
- **代码风格与Lint：**
  - Go：运行`make fmt-go swag-fmt`
  - JS/Vue：使用`frontend/package.json`中的lint/format脚本
- **测试：**
  - 完整单元测试套件：`make test`
  - 测试前端/后端：`make test-js`和`make test-go`

**亮点：**
- 虽然是Go后端，但提供了很好的AGENTS.md结构参考
- 详细的真相来源组织方式

**链接：** https://github.com/photoprism/photoprism/blob/develop/AGENTS.md

---

## 六、未找到AGENTS.md/CLAUDE.md的Django项目

以下Django项目经全面检查（包括根目录、`.agents/`、`.claude/`等位置）没有AGENTS.md或CLAUDE.md文件：

| 类别 | 项目 | GitHub链接 |
|------|------|------------|
| **核心框架** | Django | [django/django](https://github.com/django/django) |
| **DRF** | Django REST Framework | [encode/django-rest-framework](https://github.com/encode/django-rest-framework) |
| **CMS** | django-cms | [django-cms/django-cms](https://github.com/django-cms/django-cms) |
| **CMS** | django-oscar | [django-oscar/django-oscar](https://github.com/django-oscar/django-oscar) |
| **CMS** | django-wiki | [django-wiki/django-wiki](https://github.com/django-wiki/django-wiki) |
| **网络管理** | netbox | [netbox-community/netbox](https://github.com/netbox-community/netbox) |
| **文档管理** | paperless-ngx | [paperless-ngx/paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) |
| **安全** | DefectDojo | [defectdojo/django-DefectDojo](https://github.com/defectdojo/django-DefectDojo) |
| **监控** | healthchecks | [healthchecks/healthchecks](https://github.com/healthchecks/healthchecks) |
| **教育** | Open edX | [openedx/edx-platform](https://github.com/openedx/edx-platform) |
| **电商** | shuup | [shuup/shuup](https://github.com/shuup/shuup) |
| **工具** | django-tenants | [django-tenants/django-tenants](https://github.com/django-tenants/django-tenants) |
| **调试** | django-debug-toolbar | [jazzband/django-debug-toolbar](https://github.com/jazzband/django-debug-toolbar) |
| **测试** | pytest-django | [pytest-dev/pytest-django](https://github.com/pytest-dev/pytest-django) |
| **能源** | konnect | [octoenergy/konnect](https://github.com/octoenergy/konnect) |

---

## Django项目特有模式

| 模式 | 出现频率 | 说明 |
|------|---------|------|
| 多级AGENTS.md系统 | 中 | Sentry使用根+src+tests+static |
| 统一CLI工具 | 中 | PostHog的hogli |
| Context-Aware加载 | 中 | 按工作区域加载对应AGENTS.md |
| DRF端点规范 | 高 | PostHog、Sentry都要求API schema声明 |
| 严格Commit纪律 | 高 | Zulip的每个commit必须最小连贯 |
| 安全指南 | 高 | Sentry的IDOR防护、客户信息保护 |
| Skill系统 | 中 | PostHog的强制Skill调用 |
| Conventional Commits | 中 | PostHog、Sentry都使用 |

---

## 传统Django项目vs现代Django项目

| 特性 | 传统Django项目 | 现代Django项目（有AGENTS.md） |
|------|--------------|------------------|
| AGENTS.md存在 | 罕见 | 普遍（企业级应用） |
| 前端技术栈 | 可能Django模板 | React/Vue + TypeScript |
| API框架 | 可能DRF | DRF + OpenAPI |
| CI/CD | 可能简单 | 复杂多级 |
| 测试覆盖率要求 | 可能低 | 高（90%+） |
| 安全指南 | 可能缺失 | 详细安全最佳实践 |
| 团队协作 | 可能简单 | 详细贡献指南 |
| AI披露要求 | 无 | 普遍要求 |

---

## 编写Django项目AGENTS.md的建议

1. **多级AGENTS.md：考虑根目录+src+tests+static，按工作区域
2. **统一CLI工具：提供统一的开发、测试、lint命令
3. **DRF端点规范：要求所有API视图声明request/response schema
4. **安全指南：包含IDOR/XSS/CSRF防护、客户信息保护
5. **Commit纪律：每个commit最小连贯、Conventional Commits
6. **测试要求：高覆盖率、端到端测试优先
7. **Skill系统：大型项目使用可复用skills
8. **Context-Aware加载：按工作区域选择对应AGENTS.md

---

## 附录：Django项目AGENTS.md模板

基于我们收集的8个优秀Django项目的AGENTS.md，以下是一个可以直接使用的模板：

```markdown
# [项目名称] - AGENTS.md

> 给AI编程代理的项目指南

## 项目概述

[项目简介，技术栈，用途等]

技术栈：
- 后端：Django [版本] + Django REST Framework
- 前端：[React/Vue/其他]
- 数据库：[PostgreSQL/MySQL/SQLite]
- 缓存：[Redis/Memcached]
- 任务队列：[Celery/RQ]

## 快速开始

### 环境设置
```bash
# 克隆项目
git clone [repo-url]
cd [project-dir]

# 创建虚拟环境
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements/dev.txt

# 数据库设置
python manage.py migrate
python manage.py createsuperuser
```

### 开发命令
```bash
# 启动开发服务器
python manage.py runserver

# 运行测试
pytest
# 或
python manage.py test

# 代码检查
ruff check .
ruff format .

# 数据库迁移
python manage.py makemigrations
python manage.py migrate
```

## 项目结构

```
[project-name]/
├── config/              # Django项目配置
│   ├── settings/        # 设置文件（base/local/test/production）
│   ├── urls.py          # 主URL路由
│   └── wsgi.py
├── [app1]/              # Django应用1
├── [app2]/              # Django应用2
├── static/              # 静态文件
├── templates/           # Django模板
├── tests/               # 测试
└── manage.py
```

## 代码风格

### Python
- 使用 [Black/Ruff] 格式化
- 导入顺序：标准库 → 第三方 → 第一方
- 类型提示：使用 mypy 进行类型检查
- 行长度：[119/120] 字符

### Django特定
- 模型定义使用 [约定]
- 视图优先使用 [函数视图/类视图/ViewSet]
- 序列化器使用 DRF 序列化器
- 权限检查使用 [自定义权限类/DRF内置权限]

## 测试指南

- 测试位置：`tests/` 目录或各应用的 `tests/` 子目录
- 测试框架：pytest / Django test framework
- 测试覆盖率目标：[80%+]
- 优先编写：单元测试 → 集成测试 → 端到端测试

## 安全注意事项

- 永远不要将密钥提交到仓库
- 使用环境变量管理敏感配置
- 所有用户输入都要验证和清理
- API端点要有适当的权限检查
- 防止常见漏洞：SQL注入、XSS、CSRF、IDOR等

## Git与PR指南

- 分支命名：`feature/[描述]` 或 `bugfix/[描述]`
- Commit消息格式：遵循 Conventional Commits
- PR描述模板：
  - 变更描述
  - 相关issue
  - 测试说明
  - 截图（如适用）

## AI辅助开发

- [如果适用] 要求在PR中说明AI的使用
- [如果适用] 使用特定的技能（skills）
- [如果适用] 有特定的代理披露要求

## 更多资源

- 完整文档：[文档链接]
- 贡献指南：[CONTRIBUTING.md链接]
- 问题跟踪：[Issues链接]
```

### 如何使用此模板

1. 复制以上内容到你的Django项目根目录，保存为 `AGENTS.md`
2. 根据你的项目实际情况修改占位内容
3. 考虑创建软链接 `ln -s AGENTS.md CLAUDE.md` 以兼容其他工具
4. 对于大型项目，考虑创建多级AGENTS.md（如 `src/AGENTS.md`、`tests/AGENTS.md`等）

---

## 总结

虽然我们只找到了8个Django项目的AGENTS.md，但这些项目都是非常有代表性的企业级应用，它们的AGENTS.md提供了宝贵的参考。希望这个合集和模板能帮助你为自己的Django项目创建优秀的AGENTS.md！

如果你发现了其他有AGENTS.md的Django项目，欢迎补充！
