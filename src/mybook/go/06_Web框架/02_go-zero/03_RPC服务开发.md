# 4. RPC 服务开发

### 4.1. 创建 RPC 项目

**创建 RPC 服务**：

```bash
# 创建 RPC 项目
goctl rpc new user-rpc
cd user-rpc

# 初始化依赖
go mod tidy

# 启动服务
go run user-rpc.go -f etc/user-rpc.yaml
```

**RPC 项目结构**：

```
user-rpc/
├── etc/
│   └── user-rpc.yaml       # RPC 配置文件
├── internal/
│   ├── config/             # 配置定义
│   │   └── config.go
│   ├── server/             # RPC 服务实现
│   │   └── user_server.go
│   ├── svc/                # 服务上下文
│   │   └── servicecontext.go
│   └── logic/              # 业务逻辑
│       └── getuserlogic.go
├── pb/                     # Protobuf 生成的代码
│   ├── user.pb.go          # 消息定义
│   └── user_grpc.pb.go     # gRPC 服务定义
├── user.proto              # Protobuf 定义文件
└── user-rpc.go             # 程序入口
```

**配置文件**：

```yaml
# etc/user-rpc.yaml
Name: user-rpc
ListenOn: 0.0.0.0:8080

# 数据库配置
Mysql:
  DataSource: root:password@tcp(localhost:3306)/dbname?charset=utf8mb4&parseTime=true

# Redis 配置
Redis:
  Host: localhost:6379

# Etcd 服务注册（可选）
Etcd:
  Hosts:
    - localhost:2379
  Key: user.rpc
```

### 4.2. Protobuf 定义

**Protobuf 文件**：

```protobuf
// user.proto
syntax = "proto3";

package user;

option go_package = "./pb";

// 导入 Google 空消息
import "google/protobuf/empty.proto";

// 请求消息
message IdRequest {
    int64 id = 1;
}

message GetUserRequest {
    int64 id = 1;
}

// 响应消息
message UserResponse {
    int64 id = 1;
    string name = 2;
    string email = 3;
    int32 status = 4;
    int64 created_at = 5;
}

message CreateUserRequest {
    string name = 1;
    string email = 2;
    string password = 3;
}

message CreateUserResponse {
    int64 id = 1;
}

message UpdateUserRequest {
    int64 id = 1;
    string name = 2;
    string email = 3;
}

message ListUsersRequest {
    int32 page = 1;
    int32 page_size = 2;
}

message ListUsersResponse {
    repeated UserResponse users = 1;
    int64 total = 2;
}

// 服务定义
service User {
    // 获取用户
    rpc GetUser(GetUserRequest) returns (UserResponse);
    
    // 创建用户
    rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
    
    // 更新用户
    rpc UpdateUser(UpdateUserRequest) returns (google.protobuf.Empty);
    
    // 删除用户
    rpc DeleteUser(IdRequest) returns (google.protobuf.Empty);
    
    // 用户列表
    rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
}
```

**生成代码**：

```bash
# 方式1：从 .proto 文件生成
goctl rpc protoc user.proto --go_out=. --go-grpc_out=. --zrpc_out=.

# 方式2：使用 goctl 命令
goctl rpc protoc user.proto -src=. -dir=.

# 只生成 pb 文件（不生成项目结构）
protoc --go_out=. --go-grpc_out=. user.proto
```

**Protobuf 最佳实践**：

| 规范 | 说明 | 示例 |
|------|------|------|
| 字段编号 | 1-15 用于常用字段，节省空间 | `int64 id = 1;` |
| 命名规范 | 使用驼峰命名 | `user_name` → `userName` |
| 消息复用 | 通用消息可复用 | `IdRequest` 用于多个接口 |
| 版本管理 | 使用 package 区分版本 | `package user.v1;` |
| 注释 | 添加清晰的注释 | `// 用户ID` |

### 4.3. RPC 服务实现

**服务端实现**：

```go
// internal/server/user_server.go
type UserServer struct {
    svcCtx *svc.ServiceContext
    pb.UnimplementedUserServer
}

func NewUserServer(svcCtx *svc.ServiceContext) *UserServer {
    return &UserServer{
        svcCtx: svcCtx,
    }
}

// 获取用户
func (s *UserServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.UserResponse, error) {
    // 查询数据库
    user, err := s.svcCtx.UserModel.FindOne(ctx, req.Id)
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "用户不存在")
    }
    
    return &pb.UserResponse{
        Id:        user.Id,
        Name:      user.Name,
        Email:     user.Email,
        Status:    user.Status,
        CreatedAt: user.CreatedAt.Unix(),
    }, nil
}

// 创建用户
func (s *UserServer) CreateUser(ctx context.Context, req *pb.CreateUserRequest) (*pb.CreateUserResponse, error) {
    // 参数校验
    if req.Name == "" || req.Email == "" {
        return nil, status.Errorf(codes.InvalidArgument, "参数错误")
    }
    
    // 创建用户
    user := &model.User{
        Name:     req.Name,
        Email:    req.Email,
        Password: req.Password,
    }
    
    result, err := s.svcCtx.UserModel.Insert(ctx, user)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "创建失败")
    }
    
    userId, _ := result.LastInsertId()
    return &pb.CreateUserResponse{Id: userId}, nil
}

// 更新用户
func (s *UserServer) UpdateUser(ctx context.Context, req *pb.UpdateUserRequest) (*emptypb.Empty, error) {
    user, err := s.svcCtx.UserModel.FindOne(ctx, req.Id)
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "用户不存在")
    }
    
    user.Name = req.Name
    user.Email = req.Email
    
    if err := s.svcCtx.UserModel.Update(ctx, user); err != nil {
        return nil, status.Errorf(codes.Internal, "更新失败")
    }
    
    return &emptypb.Empty{}, nil
}
```

**使用 Logic 层（推荐）**：

```go
// internal/logic/get_user_logic.go
func (l *GetUserLogic) GetUser(in *pb.GetUserRequest) (*pb.UserResponse, error) {
    user, err := l.svcCtx.UserModel.FindOne(l.ctx, in.Id)
    if err != nil {
        return nil, err
    }
    
    return &pb.UserResponse{
        Id:    user.Id,
        Name:  user.Name,
        Email: user.Email,
    }, nil
}
```

### 4.4. 服务调用与测试

**客户端调用**：

```go
// 方式1：直接连接
func main() {
    client := user.NewUserClient(zrpc.MustNewClient(zrpc.RpcClientConf{
        Endpoints: []string{"localhost:8080"},
    }).Conn())
    
    resp, err := client.GetUser(context.Background(), &pb.GetUserRequest{Id: 1})
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("User: %+v\n", resp)
}

// 方式2：通过 Etcd 服务发现
client := user.NewUserClient(zrpc.MustNewClient(zrpc.RpcClientConf{
    Etcd: discov.EtcdConf{
        Hosts: []string{"localhost:2379"},
        Key:   "user.rpc",
    },
}).Conn())

// 方式3：在 API 服务中调用（配置文件方式）
// etc/myapi-api.yaml
UserRpc:
  Etcd:
    Hosts:
      - localhost:2379
    Key: user.rpc

// internal/svc/servicecontext.go
func NewServiceContext(c config.Config) *ServiceContext {
    return &ServiceContext{
        Config:  c,
        UserRpc: user.NewUserClient(zrpc.MustNewClient(c.UserRpc).Conn()),
    }
}

// internal/logic/get_user_logic.go
func (l *GetUserLogic) GetUser(req *types.GetUserRequest) (*types.UserResponse, error) {
    resp, err := l.svcCtx.UserRpc.GetUser(l.ctx, &pb.GetUserRequest{Id: req.Id})
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

**使用 grpcurl 测试**：

```bash
# 安装 grpcurl
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest

# 查看服务列表
grpcurl -plaintext localhost:8080 list

# 查看服务方法
grpcurl -plaintext localhost:8080 list user.User

# 查看方法详情
grpcurl -plaintext localhost:8080 describe user.User.GetUser

# 调用方法
grpcurl -plaintext -d '{"id": 1}' localhost:8080 user.User/GetUser

# 响应示例
{
  "id": "1",
  "name": "张三",
  "email": "zhangsan@example.com",
  "status": 1
}
```

**错误处理**：

```go
import "google.golang.org/grpc/codes"
import "google.golang.org/grpc/status"

// 返回标准 gRPC 错误
func (s *UserServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.UserResponse, error) {
    user, err := s.svcCtx.UserModel.FindOne(ctx, req.Id)
    if err != nil {
        if err == model.ErrNotFound {
            return nil, status.Errorf(codes.NotFound, "用户不存在")
        }
        return nil, status.Errorf(codes.Internal, "内部错误")
    }
    
    return &pb.UserResponse{Id: user.Id}, nil
}

// 客户端处理错误
resp, err := client.GetUser(ctx, req)
if err != nil {
    st, ok := status.FromError(err)
    if ok {
        switch st.Code() {
        case codes.NotFound:
            log.Println("用户不存在")
        case codes.Internal:
            log.Println("内部错误")
        }
    }
}
```

**小节**：
- ✓ RPC 项目：使用 `goctl rpc new` 创建，结构清晰
- ✓ Protobuf：定义消息和服务，支持多种数据类型
- ✓ 服务实现：实现 Server 接口，处理业务逻辑
- ✓ 客户端调用：支持直连和 Etcd 服务发现
- ✓ 测试：使用 grpcurl 命令行工具测试 RPC 接口

---
