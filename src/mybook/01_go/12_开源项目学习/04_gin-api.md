# gin-api

基于 Gin 框架的 RESTful API 项目模板。

## 项目结构

```
gin-api/
├── main.go
├── config/
│   └── config.go
├── router/
│   └── router.go
├── handler/
│   └── user.go
├── service/
│   └── user.go
├── model/
│   └── user.go
└── middleware/
    ├── auth.go
    └── logger.go
```

## 核心特性

- JWT 认证
- 请求参数验证（binding）
- 统一响应格式
- 中间件链（日志/跨域/限流）
- Swagger 文档

## 统一响应

```go
type Response struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

func Success(c *gin.Context, data interface{}) {
    c.JSON(http.StatusOK, Response{Code: 0, Message: "ok", Data: data})
}
```

## 路由分组

```go
r := gin.Default()
api := r.Group("/api/v1")
{
    api.POST("/login", handler.Login)
    api.Use(middleware.Auth())
    {
        api.GET("/users", handler.ListUsers)
        api.POST("/users", handler.CreateUser)
    }
}
```
