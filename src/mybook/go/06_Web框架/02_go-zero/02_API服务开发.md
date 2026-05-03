# 3. API 服务开发

### 3.1. API 定义文件

go-zero 使用 `.api` 文件定义 HTTP API，采用 DSL（领域特定语言）语法，清晰描述接口规范。

**基础语法**：

```go
// user.api - 用户服务 API 定义

syntax = "v1"  // API 版本

info (
    title:   "用户服务"      // 服务标题
    desc:    "用户相关接口"   // 服务描述
    author:  "yourname"     // 作者
    version: "1.0"          // 版本
)

// 定义请求类型
type (
    // 获取用户请求
    GetUserRequest {
        Id int64 `path:"id"`  // 路径参数
    }
    
    // 用户信息响应
    UserResponse {
        Id      int64  `json:"id"`
        Name    string `json:"name"`
        Email   string `json:"email"`
        Status  int    `json:"status,default=1"`
    }
    
    // 创建用户请求
    CreateUserRequest {
        Name     string `json:"name"`                // 必填
        Email    string `json:"email,optional"`      // 可选
        Password string `json:"password, minlength=6, maxlength=20"`
    }
    
    // 统一响应
    Response {
        Code    int         `json:"code"`
        Message string      `json:"message"`
        Data    interface{} `json:"data,optional"`
    }
)

// 服务定义
@server(
    prefix: /api/v1       // URL 前缀
    group:  user          // 路由分组（代码也会分组）
    jwt:    Auth          // JWT 认证
    middleware: AuthMiddleware  // 中间件
)
service user-api {
    @doc "获取用户信息"
    @handler getUser
    get /user/:id (GetUserRequest) returns (UserResponse)
    
    @doc "创建用户"
    @handler createUser
    post /user (CreateUserRequest) returns (Response)
    
    @doc "更新用户"
    @handler updateUser
    put /user/:id (UpdateUserRequest) returns (Response)
    
    @doc "删除用户"
    @handler deleteUser
    delete /user/:id (GetUserRequest) returns (Response)
}
```

**常用语法标签**：

| 标签 | 说明 | 示例 | 使用场景 |
|------|------|------|----------|
| `path:"name"` | 路径参数 | `/user/:id` | RESTful 接口 |
| `query:"page"` | 查询参数 | `?page=1` | 分页、过滤 |
| `header:"token"` | 请求头 | Header 中获取 | 认证 token |
| `json:"name"` | JSON 字段 | `{"name": "xxx"}` | POST/PUT 请求体 |
| `form:"name"` | 表单字段 | `name=xxx` | Form 表单 |
| `optional` | 可选字段 | `json:"name,optional"` | 非必填 |
| `required` | 必填字段 | `json:"name"` | 默认必填 |
| `default=1` | 默认值 | `default=1` | 参数默认值 |
| `options=a\|b` | 枚举值 | `options=male\|female` | 限定取值范围 |
| `range=[1,100]` | 数值范围 | `range=[1,100]` | 数值约束 |
| `min=2,max=20` | 长度限制 | 字符串长度 2-20 | 字符串校验 |
| `email` | 邮箱格式 | 邮箱校验 | 邮箱字段 |
| `mobile` | 手机号格式 | 手机号校验 | 手机号字段 |

**多服务定义**：

```go
// 定义多个服务（API + RPC）
service user-api {
    @handler getUser
    get /user/:id (GetUserRequest) returns (UserResponse)
}

service user-rpc {
    @handler getUserRpc
    post /rpc/user/get (GetUserRequest) returns (UserResponse)
}
```

### 3.2. 代码生成与开发流程

**开发流程**：

```
编写 .api 文件 → goctl 生成代码 → 实现 Logic → 测试验证
```

**代码生成命令**：

```bash
# 方式1：创建新项目（推荐）
goctl api new myapi
cd myapi
# 编辑 myapi.api 文件，定义接口
goctl api go -api myapi.api -dir .  # 重新生成代码

# 方式2：已有 .api 文件，生成代码
goctl api go -api user.api -dir .

# 方式3：指定生成的 Go 文件
goctl api go -api user.api -go user.go

# 格式化 API 文件
goctl api format -dir user.api

# 验证 API 文件语法
goctl api validate -api user.api
```

**生成的代码结构**：

```go
// types/types.go - 自动生成
type GetUserRequest struct {
    Id int64 `path:"id"`
}

type UserResponse struct {
    Id     int64  `json:"id"`
    Name   string `json:"name"`
    Email  string `json:"email"`
    Status int    `json:"status"`
}

// handler/user/get_user_handler.go - Handler 层
func GetUserHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var req types.GetUserRequest
        if err := httpx.Parse(r, &req); err != nil {
            httpx.Error(w, err)
            return
        }
        
        l := logic.NewGetUserLogic(r.Context(), svcCtx)
        resp, err := l.GetUser(&req)
        if err != nil {
            httpx.Error(w, err)
        } else {
            httpx.OkJson(w, resp)
        }
    }
}

// logic/user/get_user_logic.go - Logic 层（需要实现）
func (l *GetUserLogic) GetUser(req *types.GetUserRequest) (resp *types.UserResponse, err error) {
    // TODO: 实现业务逻辑
    return &types.UserResponse{
        Id:   req.Id,
        Name: "张三",
    }, nil
}
```

**最佳实践**：

1. **先设计 API，后写代码**：使用 .api 文件作为接口文档
2. **版本化管理 API**：使用 `v1.api`、`v2.api` 管理版本
3. **分组管理**：使用 `group` 参数对接口分组，代码结构清晰
4. **不要修改生成的代码**：修改 .api 文件后重新生成

### 3.3. 业务逻辑层

Logic 层是业务核心，不包含 HTTP 相关代码，便于测试和复用。

**Logic 结构**：

```go
// internal/logic/user/get_user_logic.go
type GetUserLogic struct {
    logx.Logger
    ctx    context.Context
    svcCtx *svc.ServiceContext
}

func NewGetUserLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetUserLogic {
    return &GetUserLogic{
        Logger: logx.WithContext(ctx),
        ctx:    ctx,
        svcCtx: svcCtx,
    }
}

func (l *GetUserLogic) GetUser(req *types.GetUserRequest) (resp *types.UserResponse, err error) {
    // 1. 参数校验（简单校验已在 Handler 完成）
    if req.Id <= 0 {
        return nil, errors.New("用户ID无效")
    }
    
    // 2. 查询数据库
    user, err := l.svcCtx.UserModel.FindOne(l.ctx, req.Id)
    if err != nil {
        if err == model.ErrNotFound {
            return nil, errors.New("用户不存在")
        }
        return nil, err
    }
    
    // 3. 数据转换
    return &types.UserResponse{
        Id:     user.Id,
        Name:   user.Name,
        Email:  user.Email,
        Status: user.Status,
    }, nil
}
```

**复杂业务示例**：

```go
// 创建订单 Logic
func (l *CreateOrderLogic) CreateOrder(req *types.CreateOrderRequest) (*types.OrderResponse, error) {
    // 1. 使用分布式锁
    lockKey := fmt.Sprintf("lock:order:%d", req.UserId)
    lock, err := redis.Lock(l.svcCtx.Redis, lockKey, 10*time.Second)
    if err != nil {
        return nil, errors.New("系统繁忙，请稍后重试")
    }
    defer lock.Unlock()
    
    // 2. 查询商品信息
    product, err := l.svcCtx.ProductModel.FindOne(l.ctx, req.ProductId)
    if err != nil {
        return nil, err
    }
    
    // 3. 检查库存
    if product.Stock < req.Quantity {
        return nil, errors.New("库存不足")
    }
    
    // 4. 创建订单（事务）
    var orderId int64
    err = l.svcCtx.Transact(func(session sqlx.Session) error {
        // 扣减库存
        if err := l.svcCtx.ProductModel.DecrStock(l.ctx, req.ProductId, req.Quantity); err != nil {
            return err
        }
        
        // 创建订单
        order := &model.Order{
            UserId:    req.UserId,
            ProductId: req.ProductId,
            Quantity:  req.Quantity,
            Amount:    product.Price * int64(req.Quantity),
            Status:    0, // 待支付
        }
        result, err := l.svcCtx.OrderModel.Insert(l.ctx, order)
        if err != nil {
            return err
        }
        orderId, _ = result.LastInsertId()
        return nil
    })
    
    if err != nil {
        return nil, err
    }
    
    return &types.OrderResponse{
        OrderId: orderId,
        Message: "下单成功",
    }, nil
}
```

**Logic 层最佳实践**：

| 实践 | 说明 | 示例 |
|------|------|------|
| 使用 Context | 始终传递 `l.ctx` | `Model.FindOne(l.ctx, id)` |
| 错误处理 | 返回明确的错误信息 | `errors.New("用户不存在")` |
| 日志记录 | 使用 `l.Logger` 记录关键信息 | `l.Infof("用户登录: %d", userId)` |
| 依赖注入 | 通过 `l.svcCtx` 获取依赖 | `l.svcCtx.UserModel` |
| 事务处理 | 使用 `Transact` 方法 | `l.svcCtx.Transact(func() {})` |

### 3.4. 服务上下文与依赖注入

ServiceContext 是依赖注入容器，管理所有资源。

**定义 ServiceContext**：

```go
// internal/svc/servicecontext.go
type ServiceContext struct {
    Config  config.Config
    Redis   *redis.Redis
    
    // 数据模型
    UserModel  model.UserModel
    OrderModel model.OrderModel
    
    // RPC 客户端
    UserRpc   user.UserClient
    OrderRpc  order.OrderClient
    
    // 其他服务
    Trans     *sqlx.Tx    // 事务管理器
}

func NewServiceContext(c config.Config) *ServiceContext {
    // 初始化数据库连接
    conn := sqlx.NewMysql(c.Mysql.DataSource)
    
    return &ServiceContext{
        Config:     c,
        Redis:      redis.New(c.Redis.Host),
        UserModel:  model.NewUserModel(conn),
        OrderModel: model.NewOrderModel(conn),
        UserRpc:    user.NewUserClient(zrpc.MustNewClient(c.UserRpc).Conn()),
        Trans:      conn,  // 事务管理
    }
}
```

**注入 RPC 客户端**：

```yaml
# etc/myapi-api.yaml
Name: myapi-api
Host: 0.0.0.0
Port: 8888

# RPC 服务配置
UserRpc:
  Etcd:
    Hosts:
      - localhost:2379
    Key: user.rpc
  
OrderRpc:
  Etcd:
    Hosts:
      - localhost:2379
    Key: order.rpc
```

```go
// config/config.go
type Config struct {
    rest.RestConf
    UserRpc  zrpc.RpcClientConf  // RPC 配置
    OrderRpc zrpc.RpcClientConf
}

// 使用 RPC 客户端
func (l *GetUserLogic) GetUser(req *types.GetUserRequest) (*types.UserResponse, error) {
    // 调用 RPC 服务
    resp, err := l.svcCtx.UserRpc.GetUser(l.ctx, &user.IdRequest{
        Id: req.Id,
    })
    if err != nil {
        return nil, err
    }
    
    return &types.UserResponse{
        Id:    resp.Id,
        Name:  resp.Name,
        Email: resp.Email,
    }, nil
}
```

**依赖注入最佳实践**：

1. **集中管理依赖**：所有依赖在 ServiceContext 中初始化
2. **懒加载**：某些依赖可以懒加载，提高启动速度
3. **配置驱动**：依赖从配置文件读取，支持多环境
4. **接口隔离**：Model 定义接口，便于 Mock 测试

**小节**：
- ✓ API 定义：使用 .api 文件定义接口，支持丰富的语法标签
- ✓ 代码生成：goctl 自动生成框架代码，专注业务实现
- ✓ Logic 层：业务核心，通过 ServiceContext 获取依赖
- ✓ 依赖注入：ServiceContext 管理所有资源，配置驱动

---
