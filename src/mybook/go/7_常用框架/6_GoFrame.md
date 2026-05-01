# GoFrame 框架教程

---

## 一、GoFrame 简介

GoFrame 是一款模块化、企业级的 Go Web 开发框架。

### 1.1 核心特性

| 特性 | 说明 |
|------|------|
| 模块化 | 路由/ORM/缓存/配置/日志等独立模块 |
| 工程化 | 分层设计 Controller → Service → DAO |
| 代码生成 | gf CLI 自动生成 CRUD 代码 |
| 企业级 | 内置安全/国际化/错误码/链路追踪 |

### 1.2 安装

```bash
go get -u github.com/gogf/gf/v2

# 安装 CLI 工具
wget -O gf https://github.com/gogf/gf/releases/latest/download/gf_$(go env GOOS)_$(go env GOARCH) && chmod +x gf && mv gf /usr/local/bin/
```

---

## 二、快速入门

### 2.1 创建项目

```bash
gf init myapp -u
cd myapp
```

### 2.2 项目结构

```
myapp/
├── api/          # 接口定义
│   └── user/
│       └── v1/   # 版本化 API
├── internal/     # 内部包
│   ├── controller/  # 控制器
│   ├── service/     # 业务逻辑
│   ├── dao/         # 数据访问
│   ├── model/       # 数据模型
│   │   ├── entity/  # 数据库实体
│   │   └── do/      # 数据操作对象
│   └── logic/       # 业务逻辑实现
├── manifest/
│   ├── config/      # 配置文件
│   └── sql/         # SQL 文件
├── resource/        # 静态资源
└── main.go
```

### 2.3 Hello World

```go
package main

import (
    "github.com/gogf/gf/v2/frame/g"
    "github.com/gogf/gf/v2/net/ghttp"
)

func main() {
    s := g.Server()
    s.BindHandler("/", func(r *ghttp.Request) {
        r.Response.WriteJson(g.Map{
            "code": 0,
            "msg":  "Hello GoFrame!",
        })
    })
    s.Run()
}
```

---

## 三、路由系统

### 3.1 路由注册

```go
s := g.Server()

// 标准路由
s.BindHandler("/hello", handler.Hello)

// RESTful 路由
s.BindRest("/user", &controller.User{})

// 分组路由
s.Group("/api", func(group *ghttp.RouterGroup) {
    group.Middleware(middleware.Auth)
    group.GET("/user/{id}", handler.GetUser)
    group.POST("/user", handler.CreateUser)
    group.PUT("/user/{id}", handler.UpdateUser)
    group.DELETE("/user/{id}", handler.DeleteUser)
})
```

### 3.2 路由参数

```go
// 路径参数
s.BindHandler("/user/{id}", func(r *ghttp.Request) {
    id := r.Get("id").Int()
    r.Response.Writef("User ID: %d", id)
})

// 查询参数
s.BindHandler("/search", func(r *ghttp.Request) {
    keyword := r.Get("q").String()
    page := r.Get("page", 1).Int()
})

// 请求体
s.BindHandler("/user", func(r *ghttp.Request) {
    var req UserReq
    r.Parse(&req)
})
```

---

## 四、ORM (gdb)

### 4.1 配置

```yaml
# manifest/config/config.yaml
database:
  default:
    link: "mysql:root:123456@tcp(127.0.0.1:3306)/mydb"
    debug: true
    charset: "utf8mb4"
    maxIdle: 10
    maxOpen: 100
    maxLifetime: "30s"
```

### 4.2 CRUD 操作

```go
// 查询
one, err := g.Model("user").Where("id", 1).One()
all, err := g.Model("user").Where("age > ?", 18).All()
count, err := g.Model("user").Where("status", 1).Count()

// 插入
_, err := g.Model("user").Insert(g.Map{
    "name":  "张三",
    "age":   25,
    "email": "zhangsan@example.com",
})

// 批量插入
_, err := g.Model("user").Batch(100).Insert(users)

// 更新
_, err := g.Model("user").Where("id", 1).Update(g.Map{
    "age": 26,
})

// 删除
_, err := g.Model("user").Where("id", 1).Delete()

// 软删除
_, err := g.Model("user").Where("id", 1).Unscoped().Delete()
```

### 4.3 链式操作

```go
g.Model("user").
    Fields("id, name, age").
    Where("age > ?", 18).
    Where("status", 1).
    Order("id DESC").
    Page(1, 10).
    All()
```

### 4.4 事务

```go
err := g.DB().Transaction(func(tx *gdb.TX) error {
    _, err := tx.Model("user").Insert(g.Map{"name": "test"})
    if err != nil {
        return err
    }
    _, err = tx.Model("order").Insert(g.Map{"user_id": 1})
    return err
})
```

---

## 五、缓存 (gcache)

### 5.1 基本使用

```go
// 设置缓存
g.Cache().Set(ctx, "key", "value", time.Hour)

// 获取缓存
val, err := g.Cache().Get(ctx, "key")

// 删除缓存
g.Cache().Remove(ctx, "key")

// 清空缓存
g.Cache().Clear(ctx)
```

### 5.2 适配器

```yaml
# Redis 适配器
cache:
  default:
    adapter: "redis"
    address: "127.0.0.1:6379"
    db: 0
```

### 5.3 ORM 缓存

```go
// 自动缓存查询结果
g.Model("user").Cache(gdb.CacheOption{
    Duration: time.Hour,
    Name:     "user:1",
}).Where("id", 1).One()
```

---

## 六、配置 (gcfg)

### 6.1 配置文件

```yaml
# manifest/config/config.yaml
server:
  address: ":8000"
  openapiPath: "/api.json"

database:
  default:
    link: "mysql:root:123456@tcp(127.0.0.1:3306)/mydb"

logger:
  level: "all"
  stdout: true
```

### 6.2 读取配置

```go
// 获取配置
addr := g.Cfg().MustGet(ctx, "server.address").String()
dbLink := g.Cfg().MustGet(ctx, "database.default.link").String()

// 多环境配置
// config.yaml (默认)
// config.prod.yaml (生产)
// config.dev.yaml (开发)
```

---

## 七、代码生成

### 7.1 生成 DAO

```bash
# 根据数据库生成 DAO/Model/Service
gf gen dao

# 指定数据库
gf gen dao -l "mysql:root:123456@tcp(127.0.0.1:3306)/mydb" -t user,order
```

### 7.2 生成 API

```bash
# 生成 API 接口定义
gf gen api
```

### 7.3 生成 Controller

```bash
# 生成控制器
gf gen ctrl
```

---

## 八、中间件

### 8.1 内置中间件

```go
s.Use(
    ghttp.MiddlewareHandlerResponse,  // 统一响应格式
    ghttp.MiddlewareCORS,             // 跨域
)

// 鉴权中间件
s.Group("/api", func(group *ghttp.RouterGroup) {
    group.Middleware(
        middleware.Ctx,    // 上下文
        middleware.Auth,   // 鉴权
    )
})
```

### 8.2 自定义中间件

```go
func Auth(r *ghttp.Request) {
    token := r.Header.Get("Authorization")
    if token == "" {
        r.Response.WriteStatus(http.StatusUnauthorized, g.Map{
            "code": 401,
            "msg":  "unauthorized",
        })
        r.Exit()
    }
    r.Middleware.Next()
}
```

---

## 九、错误码

### 9.1 定义错误码

```go
var (
    CodeSuccess      = 0
    CodeNotFound     = 10001
    CodeUnauthorized = 10002
    CodeInvalidParam = 10003
)

var ErrMsg = map[int]string{
    CodeSuccess:      "ok",
    CodeNotFound:     "resource not found",
    CodeUnauthorized: "unauthorized",
    CodeInvalidParam: "invalid parameter",
}
```

### 9.2 使用错误码

```go
func (c *ControllerV1) GetUser(ctx context.Context, req *v1.GetUserReq) (res *v1.GetUserRes, err error) {
    user, err := service.User().GetById(ctx, req.Id)
    if err != nil {
        return nil, gerror.NewCode(CodeNotFound, ErrMsg[CodeNotFound])
    }
    return &v1.GetUserRes{User: user}, nil
}
```

---

## 十、GoFrame vs Gin 对比

| 维度 | GoFrame | Gin |
|------|---------|-----|
| 定位 | 企业级全栈框架 | 轻量 HTTP 框架 |
| ORM | 内置 gdb | 需搭配 GORM |
| 配置 | 内置 gcfg | 需搭配 viper |
| 缓存 | 内置 gcache | 需搭配 go-redis |
| 代码生成 | gf CLI | 无 |
| 分层架构 | Controller/Service/DAO | 自由组织 |
| 学习曲线 | 较陡 | 平缓 |
| 适用场景 | 中大型企业项目 | 中小型 API 服务 |
