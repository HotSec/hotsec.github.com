# Swagger 接口文档

## 一、安装 swag

```bash
go install github.com/swaggo/swag/cmd/swag@latest
```

## 二、Gin 集成

```bash
go get github.com/swaggo/gin-swagger
go get github.com/swaggo/files
```

## 三、主入口注解

```go
// @title           Go API
// @version         1.0
// @description     This is a sample API.
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.example.com/support
// @contact.email  support@example.com

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1

// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization

func main() {
    r := gin.Default()
    docs.SwaggerInfo.BasePath = "/api/v1"
    r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
    r.Run()
}
```

## 四、接口注解

```go
// @Summary      创建用户
// @Description  创建新用户
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        user  body      CreateUserReq  true  "用户信息"
// @Success      201   {object}  CreateUserResp
// @Failure      400   {object}  ErrorResponse
// @Router       /users [post]
func CreateUser(c *gin.Context) {}

// @Summary      获取用户
// @Description  根据ID获取用户
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "用户ID"
// @Success      200  {object}  UserResp
// @Failure      404  {object}  ErrorResponse
// @Security     Bearer
// @Router       /users/{id} [get]
func GetUser(c *gin.Context) {}

// @Summary      用户列表
// @Description  分页获取用户列表
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        page     query  int  false  "页码"  default(1)
// @Param        pageSize query  int  false  "每页数"  default(10)
// @Success      200  {object}  UserListResp
// @Router       /users [get]
func ListUsers(c *gin.Context) {}
```

## 五、生成文档

```bash
swag init
swag init -g cmd/main.go -o ./docs
swag fmt
```

## 六、常用注解

| 注解 | 说明 |
|------|------|
| `@Summary` | 简短描述 |
| `@Description` | 详细描述 |
| `@Tags` | 分组标签 |
| `@Accept` | 请求 Content-Type |
| `@Produce` | 响应 Content-Type |
| `@Param` | 参数（name type dataType required description） |
| `@Success` | 成功响应 |
| `@Failure` | 失败响应 |
| `@Router` | 路由路径和方法 |
| `@Security` | 安全认证 |

### Param 类型

| 类型 | 说明 |
|------|------|
| `query` | URL 查询参数 |
| `path` | URL 路径参数 |
| `body` | 请求体 |
| `header` | 请求头 |
| `formData` | 表单数据 |
