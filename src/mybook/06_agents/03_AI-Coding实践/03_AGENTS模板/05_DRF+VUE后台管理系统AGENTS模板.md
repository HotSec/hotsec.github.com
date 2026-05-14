# AGENTS.md

[项目名称] — Django REST Framework + Vue 3 后台管理系统，提供 [核心业务描述]。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Python 3.12+ / Django 5.x / DRF 3.x / PostgreSQL 16+ / Redis / Celery 5.x / drf-spectacular / django-filter / uv / ruff / pyright / pytest-django + factory_boy |
| 前端 | Vue 3.4+ / TypeScript 5.x / Vite 5.x / Element Plus / Pinia / Vue Router 4 / Axios / VXE Table（可选） / UnoCSS（可选） / unplugin-auto-import |
| 基础设施 | Docker / docker-compose / Makefile / Uvicorn + uvloop（ASGI） / Nginx |

## 通用原则

- - **先理解再动手**：修改前先阅读相关文件，理解架构和设计意图；不假设库可用，先检查 `pyproject.toml` / `package.json` 依赖
- **最小变更**：只做被要求的修改，不主动添加文档/提交；遵循已有代码风格，不引入新模式
- **依赖管理**：优先使用项目已有库，不引入新依赖；如需引入，选择社区活跃、维护良好的库
- 
## 命令

```bash
make up              # 构建并启动所有服务
make down            # 停止所有服务
make logs            # 查看实时日志
make restart         # 重启后端服务

make migrate         # 执行迁移
make makemigrations  # 生成迁移
make empty-migrate   # 空迁移 make empty-migrate app=xxx name=xxx

make test            # 全部测试
make test-filter     # 过滤测试 make test-filter args='-k "keyword"'
make test-one        # 单用例 make test-one path=tests/test_foo.py::TestX::test_y

make lint            # 格式化 + Lint + 类型检查
make check           # 校验 API Schema
make pre-commit      # 提交前全量检查（lint + check + test）

make fe-dev          # 启动前端开发服务器
make fe-build        # 前端生产构建
make fe-lint         # 前端 Lint
```

## 项目结构

```
[project]/
├── backend/                          # Django 后端
│   ├── config/settings/{base,development,production,testing}.py
│   ├── config/urls.py / wsgi.py / asgi.py
│   ├── config/logging_config.py      # 日志配置（RotatingFileHandler）
│   ├── apps/[app]/  {models,serializers,views,urls,permissions,filters,services,tasks,admin}.py
│   ├── core/        {permissions,pagination,exceptions,throttling,mixins,response,middleware,jwt_utils}.py
│   ├── tests/       {conftest,factories}.py + test_[app]/
│   ├── scripts/     # 运维/数据迁移脚本
│   ├── manage.py / pyproject.toml
├── frontend/                         # Vue 前端
│   └── src/
│       ├── api/          # 按模块拆分请求（user.ts / order.ts）
│       ├── views/        # 页面组件，按模块建子目录
│       ├── components/   # 公共组件
│       ├── layouts/      # 布局组件（SidebarLayout / BlankLayout）
│       ├── router/       # 路由配置，按模块拆分子路由
│       ├── stores/       # Pinia 状态管理（useXxxStore）
│       ├── composables/  # 组合式函数（useTable / usePermission）
│       ├── utils/        # 工具函数（request.ts / auth.ts）
│       ├── constants/    # 常量定义
│       ├── styles/       # 全局样式 / Element Plus 主题变量
│       ├── types/        # TypeScript 类型定义
│       ├── App.vue / main.ts / permission.ts
│       └── env.d.ts
│   ├── public/
│   ├── index.html / vite.config.ts / tsconfig.json / package.json
├── docker-compose.yml                # 服务编排（backend / frontend / celery / db / redis / nginx）
├── Dockerfile                        # 多阶段构建
├── Makefile                          # 统一命令入口
└── AGENTS.md
└── DOCS                             # 文档目录
```

---

## 后端编码规范

### 分层架构（禁止跨层依赖）

- **视图层** `views.py`：请求接收、参数校验、调用服务层、返回响应、单个请求方法注释 — ❌ 禁止写业务逻辑，禁止手动构造响应字典
- **服务层** `services/`：业务逻辑、跨模型操作、文件处理、数据导入导出 — ❌ 禁止返回 HTTP 响应
- **数据层** `models.py`：模型定义、数据库操作 — ❌ 禁止含业务逻辑
- **公共层** `core/`：权限/分页/异常/响应封装/中间件/JWT 工具 — ❌ 禁止反向依赖业务模块

### DRF 规范

- 序列化器按用途拆分：`ListXxxSerializer` / `CreateXxxSerializer` / `UpdateXxxSerializer`；写操作用 `extra_kwargs` 控制必填/选填
- 审计字段 `create_user`/`update_user` 从 `request.user` 获取，禁止前端传入
- 每个 API 必须设 `permission_classes`；多租户通过 `get_queryset()` 过滤 `tenant_id`
- 列表查询过滤使用 `django-filter` 的 `FilterSet`，禁止在视图中手动过滤 queryset

### 响应体封装

- 响应体由 `core/response.py` 中的 `RespHelper` 统一包装，**禁止**手动构造响应字典
- 成功响应：`RespHelper.success(message='[操作者][操作行为]成功', data={...})`
- 失败响应：`RespHelper.error(message='[操作者][操作行为]失败', error_code=1)`

### Python 风格与命名

- `ruff` 格式化+lint，行上限 150；类型注解必须，优先 `list[str]`/`X | None`，禁止 `Any`/`# type: ignore`
- 导入顺序：标准库 → Django → DRF → 第三方 → 本项目（ruff 管理）；函数内导入仅用于解决循环依赖

### 注释规范

- **必须注释**：业务逻辑意图（为什么这样做）、非显而易见的判断条件、算法实现、临时 workaround/hack
- **禁止注释**：代码本身已表达清楚的逻辑、注释掉的代码（直接删除）、变更日志式注释（由 Git 承担）
- 类和公共函数使用 docstring（Google 风格），私有方法不加 docstring 除非逻辑复杂
- Model 字段使用 `help_text` 而非行注释；Serializer/ViewSet 用 `@extend_schema` 的 `summary` 代替行注释

### 异常处理

- 业务异常统一使用自定义异常（继承 `APIException`），由 `core/exceptions.py` 统一捕获处理

### 数据库

- Model 必须有 `created_at`/`updated_at`；`Meta` 必须含 `ordering`/`verbose_name`/`db_table`
- 主键统一使用 `UUIDField`，禁止自增 ID 作为业务主键
- 禁止 `--merge` 合并冲突迁移；数据迁移用 `RunPython` 不用 `RunSQL`；迁移必须幂等
- 列表查询必须 `select_related`/`prefetch_related` 防 N+1；写操作使用事务

### API 设计

- URL 前缀 `/api/v1/`，Router 自动生成；列表支持分页/搜索/过滤/排序
- 响应数据用 `data` 字段，禁止 `results`/`items`
- 所有API需要Authorization认证（除登录外）；

### 测试

- `tests/` 镜像 `apps/`，`pytest-django` + `factory_boy`，禁止 Django `TestCase`
- 每端点至少覆盖：正常 + 权限拒绝 + 边界

### 环境变量管理

- 禁止硬编码密钥，使用 `python-dotenv` 管理环境变量
- 配置文件 `settings.py` 中的数据库连接信息、密钥等，均从环境变量获取，禁止直接写在代码中
- `.env` 文件禁止提交到版本控制，必须在 `.gitignore` 中排除；项目提供 `.env.example` 作为模板，列出所有必需变量及说明
- 敏感变量（密钥、数据库密码、第三方 API Key）与业务配置（调试开关、域名）分开管理

### 前端环境变量

- Vite 环境变量必须以 `VITE_` 前缀开头，否则无法在客户端代码中访问
- 前端 `.env` 文件同样提供 `.env.example`，禁止提交 `.env` 到版本控制
- 不同环境通过 `.env.development` / `.env.production` 区分，Vite 自动按 `mode` 加载
- 前端环境变量仅存放公开配置（API 地址、功能开关等），禁止存放任何密钥——前端代码可被用户查看

### Docker / 部署配置

- `docker-compose.yml` 中通过 `env_file` 引用 `.env`，禁止在 compose 文件中硬编码密码
- 容器镜像构建阶段不依赖运行时环境变量，运行时通过 `environment` 或 `env_file` 注入

---

## 前端编码规范

### 代码风格

- 语法：`<script setup lang="ts">` 组合式 API
- 组件命名：单文件组件使用 PascalCase
- 样式：`<style lang="scss" scoped>` 避免样式污染
- 路径别名：使用 `@/` 代替 `src/`，如 `@/components/`
- 缩进：2 空格；引号：双引号；分号：不加；行宽：120 字符

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `SidebarItem.vue`、`List.vue` |
| 变量/函数 | camelCase | `tableData`、`getTableData` |
| 常量 | UPPER_SNAKE_CASE | `ASSET_TYPE`、`DEFAULT_PAGE_SIZE` |
| 类型/接口 | PascalCase | `RuleForm`、`PaginationData` |
| Hooks | camelCase，use 前缀 | `usePagination`、`usePermission` |
| Store | camelCase，use 前缀 | `useUserStore`、`useAppStore` |
| API 函数 | camelCase，fetch/del/add/edit 前缀 | `fetchList`、`delItem` |
| 事件处理 | handle 前缀 | `handleSearch`、`handleDelete` |

### 组件开发

**公共组件**（`src/components/`）：
- 一个组件一个独立目录，包含 `index.vue`
- 命名具有通用性，可跨模块复用
- 通过 `defineExpose` 暴露需要外部调用的方法

**业务组件**（对应模块 `components/` 子目录）：
- 命名与业务场景相关，如 `ConfigGuideDialog.vue`、`QualityRuleDialog.vue`

### 路由配置

- 按业务模块拆分在 `src/router/modules/` 下
- 路由模式：Hash 模式
- 隐藏路由：通过 `meta.hidden: true` 控制
- 激活菜单：通过 `meta.activeMenu` 指定高亮菜单
- 使用路由懒加载（`() => import(...)`）

### API 请求

- 位置：`src/utils/request.ts`，基于 Axios 封装
- 自动清理请求参数中的空值（`''`、`null`、`undefined`、空数组）
- API 函数按业务模块分目录存放于 `src/api/`

| 操作 | 前缀 | 示例 |
|------|------|------|
| 查询 | `fetch` | `fetchList`、`fetchDetail` |
| 新增 | `add` | `addItem` |
| 编辑 | `edit` | `editItem` |
| 删除 | `del` | `delItem` |

- 文件下载设置 `responseType: "blob"`
- 文件上传通过 `onUploadProgress` 回调传递进度

#### 错误码处理

| 错误码 | 说明 |
|--------|------|
| `401` | 登录过期，跳转登录页 |
| `1001` | 登录超时 |
| `1003` | 授权过期 |
| 其他 | 通过 `ElMessage` 提示错误信息 |

### 状态管理

- 使用 Pinia Composition API 风格（Setup Store）
- Store 位置：`src/stores/`
- 命名：`useXxxStore`，使用 `defineStore("name", () => { ... })`
- Store 内使用 `ref`/`reactive` 定义状态，直接导出函数作为 actions
- 组件外使用 store 时通过 `useXxxStore()` 调用（如 axios 拦截器中）

### 样式规范

- 全局样式放在 `src/styles/`：通用工具类、CSS 变量、SCSS mixin、主题样式
- 组件样式使用 `<style lang="scss" scoped>` 限定作用域
- 穿透 UI 库样式使用 `:deep()`
- 颜色值使用十六进制

### 常用模式

#### 列表页 CRUD

1. 使用 `usePagination` 管理分页
2. `getTableData` 获取列表数据
3. `handleSearch` / `resetSearch` 处理搜索
4. `handleAdd` / `handleEdit` / `handleDelete` 处理增删改
5. 弹窗使用 `dialogVisible` 控制显隐
6. 表单使用 `ruleFormRef` + `formRules` 校验

#### 文件导入导出

- 导入使用 `ImportDialog` 组件
- 导出调用 API 获取 blob 流，使用 `download` 工具函数触发下载

#### 跨组件通信

| 场景 | 方式 |
|------|------|
| 父子组件 | Props + Emits |
| 兄弟组件/跨层级 | Pinia Store |
| 子组件暴露方法 | `defineExpose` + `ref` 调用 |

---

## 前后端协作

### 接口对接

- 后端通过 `drf-spectacular` 自动生成 OpenAPI Schema，前端通过 `/api/docs/` 查看 Swagger UI
- 前端 `src/types/` 中的 TypeScript 类型定义应与后端 Serializer 字段保持一致
- 响应格式统一：`{"code": "error_code", "message": "描述", "data": {...}}`
- 列表接口统一返回：`{"code": "0", "message": "ok", "data": {"count": N, "results": [...]}}`

### 代理配置

- 开发环境代理在 `vite.config.ts` 中配置
- API 前缀：`/api`，代理到后端 `http://localhost:8000`

---

## Git

- Commit：`<type>(<scope>): <description>`，scope=模块名，类型：feat/fix/refactor/test/chore/migration
- 提交前：后端 `make pre-commit` 全通过，前端 `npm run build` 无错误
- 新 API 必须 Swagger 注解 + 测试 + 前端类型定义同步，数据库变更必须迁移文件

## 文档导航

详情文档的索引表: ( `DOCS/xx/xx功能.md`)
