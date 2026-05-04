# gin-vue-admin

Gin + Vue + Element UI 的全栈后台管理系统。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Go + Gin + GORM |
| 前端 | Vue 3 + Element Plus |
| 数据库 | MySQL / PostgreSQL |
| 缓存 | Redis |
| 认证 | JWT + Casbin（RBAC） |

## 项目结构

```
gin-vue-admin/
├── server/          # Go 后端
│   ├── api/         # API 层
│   ├── service/     # 业务逻辑
│   ├── model/       # 数据模型
│   ├── router/      # 路由
│   └── middleware/  # 中间件
└── web/             # Vue 前端
    ├── src/
    │   ├── views/   # 页面
    │   ├── router/  # 前端路由
    │   └── api/     # API 调用
    └── public/
```

## 核心功能

- 用户管理（注册/登录/权限）
- RBAC 角色权限控制（Casbin）
- 代码生成器（自动生成 CRUD）
- 文件上传/导出
- 操作日志
- 字典管理

## 代码生成

```bash
# 通过 Web 界面配置表结构，自动生成：
# - API 接口
# - Service 层
# - 前端页面（列表/表单）
# - 路由注册
```
