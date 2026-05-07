# AGENTS.md

[项目名称] — Django REST Framework 后台管理系统，提供 [核心业务描述]。

技术栈：Python 3.12+ / Django 5.x / DRF 3.x / PostgreSQL 16+ / Redis / Celery 5.x / drf-spectacular / django-filter / uv / ruff / pyright / pytest-django + factory_boy

## 通用原则

- **先理解再动手**：修改前先阅读相关文件，理解架构和设计意图；不假设库可用，先检查 `pyproject.toml` 依赖
- **最小变更**：只做被要求的修改，不主动添加文档/提交；遵循已有代码风格，不引入新模式
- **可验证性**：修改后运行 `make pre-commit` 验证，构建或测试失败则修复直到通过
- **依赖管理**：优先使用项目已有库，不引入新依赖；如需引入，选择社区活跃、维护良好的库

## 命令

```bash
make up              # 构建并启动所有服务
make down            # 停止所有服务
make logs            # 查看实时日志
make migrate         # 执行迁移
make makemigrations  # 生成迁移
make empty-migrate   # 空迁移 make empty-migrate app=xxx name=xxx
make test            # 全部测试
make test-filter     # 过滤测试 make test-filter args='-k "keyword"'
make test-one        # 单用例 make test-one path=tests/test_foo.py::TestX::test_y
make lint            # 格式化 + Lint + 类型检查
make check           # 校验 API Schema
make pre-commit      # 提交前全量检查（lint + check + test）
```

## 项目结构

```
[project]/
├── backend/                          # Django 后端
│   ├── config/settings/{base,development,production,testing}.py
│   ├── config/urls.py / wsgi.py / asgi.py
│   ├── apps/[app]/  {models,serializers,views,urls,permissions,filters,services,tasks,admin}.py
│   ├── core/        {permissions,pagination,exceptions,throttling,mixins}.py
│   ├── tests/       {conftest,factories}.py + test_[app]/
│   ├── scripts/     # 运维/数据迁移
│   ├── manage.py / pyproject.toml
├── frontend/                         # Vue 前端
│   └── src/ {api,views,components,layouts,router,stores,composables,utils,styles,types}/
├── docker-compose.yml / Dockerfile / Makefile / AGENTS.md
```

## 编码规范

### 分层架构（禁止跨层依赖）

- **视图层** `views.py`：请求接收、参数校验、调用服务层、返回响应 — ❌ 禁止写业务逻辑
- **服务层** `services.py`：业务逻辑、跨模型操作、文件处理 — ❌ 禁止返回 HTTP 响应
- **数据层** `models.py`：模型定义、数据库操作 — ❌ 禁止含业务逻辑
- **公共层** `core/`：权限/分页/异常/渲染 — ❌ 禁止反向依赖业务模块

### DRF 规范

- `ViewSet` + `Router`，禁止裸 `APIView`；`@extend_schema` 注解所有端点
- **业务逻辑在 `services.py`**，视图/序列化器只做参数校验和响应组装
- 序列化器按用途拆分：`ListXxxSerializer` / `CreateXxxSerializer` / `UpdateXxxSerializer`
- 禁止 `fields = "__all__"`；写操作用 `extra_kwargs` 控制必填/选填
- 验证放 `validate()` / `validate_<field>()`，禁止视图中手动校验
- 审计字段 `create_user`/`update_user` 从 `request.user` 获取，禁止前端传入
- 每个 API 必须设 `permission_classes`；多租户通过 `get_queryset()` 过滤 `tenant_id`
- 敏感操作用 `POST` + 确认参数；禁止权限类中执行数据库写操作

### Python 风格与命名

- `ruff` 格式化+lint，行上限 150；类型注解必须，优先 `list[str]`/`X | None`，禁止 `Any`/`# type: ignore`
- 导入顺序：标准库 → Django → DRF → 第三方 → 本项目（ruff 管理）；函数内导入仅用于解决循环依赖
- 异步：优先 `async/await`，避免混用线程和协程
- 命名：Model/Serializer/ViewSet=PascalCase+后缀 | URL=kebab-case | Task=`[app]_[verb]_[noun]` | 常量=UPPER_SNAKE_CASE

### 注释规范

- **必须注释**：业务逻辑意图（为什么这样做）、非显而易见的判断条件、算法实现、临时 workaround/hack
- **禁止注释**：代码本身已表达清楚的逻辑（如 `i += 1  # 加1`）、注释掉的代码（直接删除）、变更日志式注释（由 Git 承担）
- 类和公共函数使用 docstring（Google 风格），私有方法不加 docstring 除非逻辑复杂
- Model 字段使用 `help_text` 而非行注释；Serializer/ViewSet 用 `@extend_schema` 的 `summary` 代替行注释
- TODO 注释格式：`# TODO(作者): 描述`，关联 Issue 编号

### 错误处理

- DRF `ExceptionHandler` 统一响应，自定义异常继承 `APIException`
- 禁止 `except Exception` / bare `except` / 吞掉异常；用 `logger.exception()` 记录
- 统一响应格式：`{"code": "error_code", "message": "描述", "data": {...}}`
- 错误响应不暴露内部细节（堆栈、SQL、文件路径）；日志不输出敏感信息

### 数据库

- Model 必须有 `created_at`/`updated_at`；`Meta` 必须含 `ordering`/`verbose_name`/`db_table`
- 字符串字段必须 `max_length`；状态字段用 `choices` + `get_<field>_display()`
- 禁止 `--merge` 合并冲突迁移；数据迁移用 `RunPython` 不用 `RunSQL`
- 迁移必须幂等；新增列提供默认值
- 列表查询必须 `select_related`/`prefetch_related` 防 N+1，禁止循环中查库
- 频繁查询字段添加索引；写操作使用事务保证原子性

### API 设计

- URL 前缀 `/api/v1/`，Router 自动生成；列表支持分页/搜索/过滤/排序
- 状态码使用 HTTP 标准，禁止自定义；响应数据用 `data` 字段，禁止 `results`/`items`
- 批量操作用 `POST /api/v1/resources/batch-action/` 自定义 Action
- 响应字段只增不减，废弃字段标记 `deprecated` 而非直接删除

### 测试

- `tests/` 镜像 `apps/`，`pytest-django` + `factory_boy`，禁止 Django `TestCase`
- Factory 创建数据（禁止 `Model.objects.create()`），Mock 仅用于外部服务；每端点至少：正常 + 权限拒绝 + 边界
- 修改代码后运行已有测试，确保不破坏现有功能

### 安全

- 输入必须验证（Serializer `validate` + Model `clean`）；默认拒绝匿名访问
- 敏感字段 `write_only=True`；文件上传验证类型+大小，禁止可执行文件
- 限流：匿名 100/h，认证 1000/h；CORS 白名单，禁止 `allow_all_origins=True`
- 禁止硬编码密钥，用 `os.getenv()`；生产禁止 `ALLOWED_HOSTS=["*"]` 和 `DEBUG=True`
- 禁止 `eval()`/`exec()` 动态代码执行；SQL 使用 ORM 参数化，禁止拼接
- 密码使用 bcrypt/argon2 哈希；JWT 验证签名+过期时间

## Git

- Commit：`<type>(<scope>): <description>`，scope=App名，类型：feat/fix/refactor/test/chore/migration
- 每次提交只做一件事，不混合不相关修改；提交前：格式化+Lint+类型+测试全通过
- 新API必须Swagger注解+测试，数据库变更必须迁移文件
