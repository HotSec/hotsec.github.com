# AGENTS.md

## 1. 项目概述

数据质量管理平台后端是一个基于 **python3.8.20 + Django 3.2 + Django REST Framework 3.12**，项目采用 。

- **项目**：数据质量管理平台
- **后端**：python3.8.20 + Django 3.2 + Django REST Framework 3.12
- **基础设施**：Docker，MySQL 5.7 为主数据库，Redis 缓存/会话/Token存储，Uvicorn + uvloop 提供异步 ASGI 服务
- **核心约束**：所有API需要Authorization认证；会话存储使用 Redis，读取login_settings数据表中的配置（会话过期时间）。

## 2. 快速命令

### 本地开发

| 命令                                        | 说明      |
| ----------------------------------------- | ------- |
| `python manage.py runserver 0.0.0.0:8000` | 本地开发启动  |
| `python manage.py migrate`                | 执行数据库迁移 |
| `python manage.py makemigrations`         | 生成迁移文件  |

### Docker 部署

| 命令                                                              | 说明                              |
| --------------------------------------------------------------- | ------------------------------- |
| `docker-compose up -d`                                          | 启动全部服务（MySQL + Redis + Backend） |
| `docker-compose restart backend_server`                         | 重启后端服务                          |
| `docker exec -it data_quality_backend python manage.py migrate` | 容器内执行迁移                         |

## 3. 后端架构

### 包结构树示例

```
data_quality/
├── data_quality/                    # 项目配置中心
│   ├── settings.py                  # 全局配置（DB/Redis/JWT/Middleware/CORS）
│   ├── urls.py                      # 根路由注册
│   ├── asgi.py                      # ASGI 入口
│   ├── wsgi.py                      # WSGI 入口
│   ├── loging_config.py             # 日志配置（RotatingFileHandler + SysLog）
│   └── .env                         # 环境变量
│
├── apps/
│   ├── data_standard/               # 数据标准管理（核心业务）
│   │   ├── models.py                # 6个模型：StandardRegister/Codeset/CodeDetail/DictCategory/Dict/DictValue
│   │   ├── views.py                 # 标准登记视图（上传/下载/解构/导出/统计）
│   │   ├── dict_views.py            # 标准字典视图（分类/字典/字典值 CRUD + 批量导入/引用）
│   │   ├── serializers.py           # 序列化器（校验/转换/嵌套展示）
│   │   ├── filter_custom.py         # 过滤器（模糊搜索/多选/日期范围）
│   │   ├── urls.py                  # 路由注册（26个API端点）
│   │   ├── service/
│   │   │   ├── standard_service.py  # 文件上传处理（按年月分目录/UUID重命名）
│   │   │   └── dict_service.py      # 字典导入服务（Excel解析/字段校验/唯一性检查）
│   │   └── API_DOCUMENTATION.md     # API 接口文档
│   │
│   ├── users/                       # 用户管理
│   │   ├── models.py                # User 模型（继承 AbstractUser）
│   │   ├── views.py                 # 视图（当前为空）
│   │   ├── nath.py                  # 导航菜单查询（旧代码，依赖 dbconn）
│   │   └── service/
│   │       ├── user_service.py      # 用户服务（IP黑白名单/用户查询/昵称映射）
│   │       └── nath.py              # 导航服务
│   │
│   ├── logs/                        # 日志审计
│   │   ├── models.py                # 5个模型：Logs/Url_Map/Logs_Bak/Remote_Logs_Bak/Remote_Logbak_Records
│   │   ├── views.py                 # 视图（当前全部注释，功能由中间件自动完成）
│   │   ├── log_middleware.py        # 日志中间件（自动记录操作/登录日志）
│   │   ├── serivce.py               # SystemService（日志写入 + 双库同步）
│   │   ├── serializers.py           # 序列化器
│   │   └── filter_costom.py         # 日志过滤器
│   │
│   ├── utils/                       # 公共工具
│   │   ├── global_fans.py           # RespHelper 统一响应封装
│   │   ├── custom_generics.py       # 通用视图基类 + 分页器
│   │   ├── exceptions.py            # 自定义异常 + 全局异常处理器
│   │   ├── middleware.py            # ProcessMiddleware（IP校验 + JWT认证 + 会话管理）
│   │   ├── jwt_utils.py             # JWT Token 解码工具
│   │   ├── redis_conn.py            # 多 Redis 实例连接
│   │   ├── url_values.py            # URL 白名单配置
│   │   └── guardian_plat_mysql_conn.py  # MySQL 连接池工具（单例/事务/分页）
│   │
│   ├── db/                          # 数据库工具
│   │   └── db_utils.py              # MySqlConnectionPool（单例连接池/Pandas查询）
│   │
│   └── scripts/                     # 脚本工具
│       ├── url_mapper_generator.py  # URL 映射生成器
│       └── insert_url_mappings.py   # URL 映射数据插入
│
├── manage.py
└── requirements.txt
```

### 环境变量配置

- 配置环境变量路径：`项目名/项目名/.env_bak`
- 配置文件路径：`项目名/项目名/settings.py`
- 总路由配置路径：`项目名/项目名/urls.py`

## 4. 关键约定

### 核心约束
- 所有API需要Authorization认证（除登录外）；
- 登录接口，返回 JWT Token 并存储在 Redis 中（键：`user_id:token`，过期时间：若login_settings 配置则使用配置值，否则默认2小时，每次请求刷新过期时间）
- 重要代码加注释：业务逻辑、算法实现、非显而易见的判断条件必须用中文注释说明意图

### 异常处理

- 业务异常统一使用 `ParameterException`，禁止直接抛 `Exception` 或 `ValueError`
- 特殊场景使用 `Success`（强制成功响应）、`Error`（强制失败响应）、`DuplicateException`（重复数据）
- **禁止**在视图中手动构造错误响应，必须通过 `RespHelper.error()` 返回
- 全局异常由 `utils/exceptions.py` 中的 `exception_handler` 统一捕获处理

### 响应体封装

- 响应体由 `RespHelper` 统一包装，**禁止**手动构造响应字典
- 响应码约束：`utils/global_fans.py` 中的 `error_code_dict`
- 成功响应：`RespHelper.success(message='[操作者][操作行为]成功', data={...})`
- 失败响应：`RespHelper.error(message='[操作者][操作行为]失败', error_code=1)`


### 分层架构

- **禁止跨层依赖**：视图层 → 服务层 → 数据层，视图层不得直接操作非自身模型
- 视图层（views）：接收请求、参数校验（serializer）、调用服务层、返回响应
- 服务层（service/）：业务逻辑封装、文件处理、数据导入导出
- 数据层（models）：模型定义、数据库操作
- `utils/` 为全局共享工具，**禁止**反向依赖业务模块

### 代码风格

- Python 代码遵循 PEP 8，使用py文件注释，类注释，views.py中单个请求方法注释
- 主键统一使用 `UUIDField`，禁止自增 ID 作为业务主键
- 时间字段：创建时间 `auto_now_add=True`，更新时间 `auto_now=True`，展示格式 `%Y-%m-%d %H:%M:%S`
- 用户追踪字段：`create_user` / `update_user` 从 `request.session['user_id']` 获取，禁止前端传入
- 通用视图基类优先：新增 CRUD 接口必须继承 `utils/custom_generics.py` 中的基类（`ListAPIViews`、`ListCreateAPIViews`、`RetrieveUpdateAPIViews`、`DestroyAPIViews`、`BatchDestroyAPIViews`），禁止直接继承 DRF 原始基类
- 服务层优先：复杂业务逻辑（文件处理、数据导入、跨模型操作）必须抽取到 `service/` 层，视图层仅做参数校验和响应封装
- 序列化器校验优先：参数校验在 Serializer 的 `validate_*` 方法中完成，视图层通过 `serializer.is_valid(raise_exception=True)` 触发
- 过滤器优先：列表查询过滤使用 `django-filter` 的 `FilterSet`，禁止在视图中手动过滤 queryset
- 日志数据同时写入业务库

### 安全

- 无状态 JWT 认证，Token 存储于 Redis（db3），支持自动续期
- IP 黑白名单通过 `ip_bw` 表管理
- 文件上传限制：格式白名单（doc/docx/pdf/xlsm/xlsx/xls/csv），大小 50MB
- 媒体文件访问在生产环境需 JWT 鉴权（`protected_serve`）
- CORS 配置允许全部来源（`CORS_ORIGIN_ALLOW_ALL = True`），生产环境应限制

## 5. 本地开发及验证流程


### 1. 配置环境变量
cp data_quality/data_quality/.env_bak data_quality/data_quality/.env
**编辑** .env 中的 DATABASE_URL 和 HOST 为本地地址
### 2.进入虚拟环境

pyenv virtualenv venv
### 3. 安装依赖

pip install -r requirements.txt
### 4. 执行迁移

cd 项目名 && python manage.py migrate

### 5. 启动服务

python manage.py runserver 0.0.0.0:8000
## Docker 环境验证

### 1. 构建并启动
docker-compose up -d

### 2. 执行迁移
docker exec -it data_quality_backend python manage.py migrate
### 4. 查看日志
docker logs -f data_quality_backend


## 6. 文档导航

详情文档的索引表: ( `项目名/apps/app/docs/agents.md`)
