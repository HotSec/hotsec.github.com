# gRPC 开发知识点总结

- [1. 概述与环境准备](#1-概述与环境准备)
- [2. Protobuf 基础](#2-protobuf-基础)
- [3. 快速入门](#3-快速入门)
- [4. 四种通信模式](#4-四种通信模式)
- [5. 服务定义进阶](#5-服务定义进阶)
- [6. 拦截器（中间件）](#6-拦截器中间件)
- [7. 错误处理](#7-错误处理)
- [8. 超时与取消](#8-超时与取消)
- [9. 安全与认证](#9-安全与认证)
- [10. 负载均衡](#10-负载均衡)
- [11. 健康检查](#11-健康检查)
- [12. 流量控制](#12-流量控制)
- [13. 性能优化](#13-性能优化)
- [14. 调试与测试](#14-调试与测试)
- [15. 项目结构](#15-项目结构)
- [16. 最佳实践](#16-最佳实践)
- [17. 常见问题与解决方案](#17-常见问题与解决方案)
- [18. 总结](#18-总结)

---

## 1. 概述与环境准备

### 1.1. gRPC 简介

gRPC 是 Google 开源的高性能 RPC（Remote Procedure Call）框架，基于 HTTP/2 协议传输，使用 Protocol Buffers 作为接口定义语言和序列化格式。

| 特性 | 说明 |
|------|------|
| **高效传输** | 基于 HTTP/2，支持多路复用、头部压缩 |
| **跨语言支持** | 支持 Go、Java、Python、C++、Node.js 等 10+ 语言 |
| **强类型定义** | 使用 Protobuf 定义服务接口，类型安全 |
| **四种通信模式** | 一元、服务端流、客户端流、双向流 |
| **双向流控** | 内置流量控制机制 |
| **可扩展** | 支持拦截器、元数据、健康检查等 |

### 1.2. 安装 Protobuf 编译器

```bash
# Ubuntu/Debian
sudo apt install -y protobuf-compiler

# macOS
brew install protobuf

# 验证安装
protoc --version
```

### 1.3. 安装 Go gRPC 插件

```bash
# 安装 protoc-gen-go 和 protoc-gen-go-grpc
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# 确保 PATH 包含 Go bin 目录
export PATH="$PATH:$(go env GOPATH)/bin"
```

### 1.4. 创建项目并安装依赖

```bash
mkdir grpc-demo && cd grpc-demo
go mod init grpc-demo

# 安装 gRPC 依赖
go get google.golang.org/grpc
go get google.golang.org/protobuf
```

---

## 2. Protobuf 基础

### 2.1. 基本语法

```protobuf
syntax = "proto3";  // 指定 proto 版本

package helloworld;  // 包名

option go_package = "grpc-demo/proto/helloworld";  // Go 包路径

// 定义消息类型
message HelloRequest {
  string name = 1;
  int32 age = 2;
  repeated string hobbies = 3;  // 列表类型
  map<string, string> tags = 4;  // Map 类型
}

message HelloReply {
  string message = 1;
}
```

### 2.2. 常用数据类型

| Protobuf 类型 | Go 类型 | 说明 |
|--------------|---------|------|
| `double` | `float64` | 双精度浮点 |
| `float` | `float32` | 单精度浮点 |
| `int32`, `int64` | `int32`, `int64` | 变长整数（负数效率低） |
| `sint32`, `sint64` | `int32`, `int64` | 有符号整数（负数效率高） |
| `fixed32`, `fixed64` | `uint32`, `uint64` | 固定长度整数 |
| `bool` | `bool` | 布尔值 |
| `string` | `string` | UTF-8 字符串 |
| `bytes` | `[]byte` | 字节数组 |
| `repeated T` | `[]T` | 列表 |
| `map<K, V>` | `map[K]V` | Map |

### 2.3. 字段编号规则

- 每个字段必须有唯一的编号（1-536870911）
- 编号 1-15 只需一个字节编码，应留给频繁使用的字段
- 编号 19000-19999 保留给 Protocol Buffers 内部使用
- 使用 `reserved` 保留已删除字段的编号

```protobuf
message Example {
  reserved 2, 15, 9 to 11;  // 保留编号
  reserved "foo", "bar";    // 保留字段名
  string name = 1;
}
```

### 2.4. 枚举类型

```protobuf
enum Status {
  UNKNOWN = 0;   // 第一个值必须为 0
  ENABLED = 1;
  DISABLED = 2;
}

message User {
  string name = 1;
  Status status = 2;
}
```

### 2.5. 嵌套消息

```protobuf
message Outer {
  message Inner {
    string value = 1;
  }
  
  Inner inner = 1;
  repeated Inner inners = 2;
}
```

---

## 3. 快速入门

### 3.1. 定义服务

创建 `proto/helloworld/helloworld.proto`：

```protobuf
syntax = "proto3";

package helloworld;

option go_package = "grpc-demo/proto/helloworld";

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
```

### 3.2. 生成代码

```bash
# 在项目根目录执行
protoc --go_out=. --go-grpc_out=. proto/helloworld/helloworld.proto

# 或者使用 Makefile
# 生成后会在 proto/helloworld 目录生成：
# - helloworld.pb.go      (消息类型代码)
# - helloworld_grpc.pb.go (服务端/客户端代码)
```

### 3.3. 实现服务端

```go
package main

import (
    "context"
    "log"
    "net"

    pb "grpc-demo/proto/helloworld"
    "google.golang.org/grpc"
)

// 实现 GreeterServer 接口
type server struct {
    pb.UnimplementedGreeterServer
}

func (s *server) SayHello(ctx context.Context, in *pb.HelloRequest) (*pb.HelloReply, error) {
    log.Printf("Received: %v", in.GetName())
    return &pb.HelloReply{Message: "Hello " + in.GetName()}, nil
}

func main() {
    // 创建 TCP 监听器
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        log.Fatalf("failed to listen: %v", err)
    }

    // 创建 gRPC 服务器
    s := grpc.NewServer()
    
    // 注册服务
    pb.RegisterGreeterServer(s, &server{})

    log.Println("Server listening on :50051")
    if err := s.Serve(lis); err != nil {
        log.Fatalf("failed to serve: %v", err)
    }
}
```

### 3.4. 实现客户端

```go
package main

import (
    "context"
    "log"
    "time"

    pb "grpc-demo/proto/helloworld"
    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
)

func main() {
    // 建立连接
    conn, err := grpc.Dial("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
    if err != nil {
        log.Fatalf("did not connect: %v", err)
    }
    defer conn.Close()

    // 创建客户端
    c := pb.NewGreeterClient(conn)

    // 设置超时上下文
    ctx, cancel := context.WithTimeout(context.Background(), time.Second)
    defer cancel()

    // 调用方法
    r, err := c.SayHello(ctx, &pb.HelloRequest{Name: "World"})
    if err != nil {
        log.Fatalf("could not greet: %v", err)
    }
    log.Printf("Greeting: %s", r.GetMessage())
}
```

---

## 4. 四种通信模式

### 4.1. 一元 RPC（Unary RPC）

最简单的模式：客户端发送一个请求，服务端返回一个响应。

```protobuf
rpc SayHello (HelloRequest) returns (HelloReply) {}
```

```go
// 服务端实现
func (s *server) SayHello(ctx context.Context, req *pb.HelloRequest) (*pb.HelloReply, error) {
    return &pb.HelloReply{Message: "Hello " + req.Name}, nil
}

// 客户端调用
resp, err := client.SayHello(ctx, &pb.HelloRequest{Name: "World"})
```

### 4.2. 服务端流式 RPC（Server Streaming）

客户端发送一个请求，服务端返回消息流。

```protobuf
rpc ListFeatures (Rectangle) returns (stream Feature) {}
```

```go
// 服务端实现
func (s *server) ListFeatures(req *pb.Rectangle, stream pb.Greeter_ListFeaturesServer) error {
    for i := 0; i < 10; i++ {
        if err := stream.Send(&pb.Feature{Name: fmt.Sprintf("Feature %d", i)}); err != nil {
            return err
        }
    }
    return nil
}

// 客户端调用
stream, err := client.ListFeatures(ctx, &pb.Rectangle{})
for {
    feature, err := stream.Recv()
    if err == io.EOF {
        break
    }
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(feature)
}
```

### 4.3. 客户端流式 RPC（Client Streaming）

客户端发送消息流，服务端返回一个响应。

```protobuf
rpc RecordRoute (stream Point) returns (RouteSummary) {}
```

```go
// 服务端实现
func (s *server) RecordRoute(stream pb.Greeter_RecordRouteServer) error {
    var points []*pb.Point
    for {
        point, err := stream.Recv()
        if err == io.EOF {
            return stream.SendAndClose(&pb.RouteSummary{Count: int32(len(points))})
        }
        if err != nil {
            return err
        }
        points = append(points, point)
    }
}

// 客户端调用
stream, err := client.RecordRoute(ctx)
for i := 0; i < 5; i++ {
    stream.Send(&pb.Point{Latitude: int32(i), Longitude: int32(i)})
}
resp, err := stream.CloseAndRecv()
```

### 4.4. 双向流式 RPC（Bidirectional Streaming）

客户端和服务端都可以发送消息流。

```protobuf
rpc RouteChat (stream RouteNote) returns (stream RouteNote) {}
```

```go
// 服务端实现
func (s *server) RouteChat(stream pb.Greeter_RouteChatServer) error {
    for {
        note, err := stream.Recv()
        if err == io.EOF {
            return nil
        }
        if err != nil {
            return err
        }
        // 处理并发送响应
        stream.Send(&pb.RouteNote{Message: "Echo: " + note.Message})
    }
}

// 客户端调用
stream, err := client.RouteChat(ctx)

// 发送协程
go func() {
    for i := 0; i < 5; i++ {
        stream.Send(&pb.RouteNote{Message: fmt.Sprintf("Note %d", i)})
    }
    stream.CloseSend()
}()

// 接收循环
for {
    note, err := stream.Recv()
    if err == io.EOF {
        break
    }
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(note)
}
```

---

## 5. 服务定义进阶

### 5.1. 服务配置

```protobuf
// 空请求/响应
import "google/protobuf/empty.proto";
rpc Ping (google.protobuf.Empty) returns (google.protobuf.Empty) {}

// 任意类型
import "google/protobuf/any.proto";
message Response {
  google.protobuf.Any data = 1;
}

// 时间戳
import "google/protobuf/timestamp.proto";
message Event {
  google.protobuf.Timestamp event_time = 1;
}

// 持续时间
import "google/protobuf/duration.proto";
message Process {
  google.protobuf.Duration elapsed = 1;
}
```

### 5.2. 包组织结构

```
proto/
├── user/
│   └── user.proto
├── order/
│   └── order.proto
└── common/
    └── types.proto
```

```protobuf
// common/types.proto
syntax = "proto3";
package common;
option go_package = "grpc-demo/proto/common";

message Pagination {
  int32 page = 1;
  int32 size = 2;
}

// user/user.proto
syntax = "proto3";
package user;
option go_package = "grpc-demo/proto/user";

import "common/types.proto";

message ListUsersRequest {
  common.Pagination pagination = 1;
}
```

---

## 6. 拦截器（中间件）

### 6.1. 一元拦截器

```go
// 服务端拦截器
func UnaryServerInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    // 前置处理
    start := time.Now()
    log.Printf("[REQ] %s", info.FullMethod)

    // 调用实际方法
    resp, err := handler(ctx, req)

    // 后置处理
    log.Printf("[RESP] %s %v", info.FullMethod, time.Since(start))
    return resp, err
}

// 注册拦截器
s := grpc.NewServer(
    grpc.UnaryInterceptor(UnaryServerInterceptor),
)
```

### 6.2. 流式拦截器

```go
// 服务端流式拦截器
func StreamServerInterceptor(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
    log.Printf("[STREAM REQ] %s", info.FullMethod)
    err := handler(srv, ss)
    log.Printf("[STREAM RESP] %s, err: %v", info.FullMethod, err)
    return err
}

// 注册
s := grpc.NewServer(
    grpc.StreamInterceptor(StreamServerInterceptor),
)
```

### 6.3. 客户端拦截器

```go
func UnaryClientInterceptor(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
    start := time.Now()
    err := invoker(ctx, method, req, reply, cc, opts...)
    log.Printf("[CLIENT] %s %v", method, time.Since(start))
    return err
}

// 创建连接时注册
conn, err := grpc.Dial(
    address,
    grpc.WithUnaryInterceptor(UnaryClientInterceptor),
    grpc.WithTransportCredentials(insecure.NewCredentials()),
)
```

### 6.4. 拦截器链

```go
import "github.com/grpc-ecosystem/go-grpc-middleware"

s := grpc.NewServer(
    grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(
        LoggingInterceptor,
        RecoveryInterceptor,
        AuthInterceptor,
    )),
    grpc.StreamInterceptor(grpc_middleware.ChainStreamServer(
        StreamLoggingInterceptor,
        StreamRecoveryInterceptor,
    )),
)
```

### 6.5. 常用拦截器示例

**日志拦截器**：
```go
func LoggingInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    start := time.Now()
    resp, err := handler(ctx, req)
    
    log.Printf("method: %s, duration: %s, error: %v",
        info.FullMethod,
        time.Since(start),
        err,
    )
    return resp, err
}
```

**Recovery 拦截器**：
```go
func RecoveryInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
    defer func() {
        if r := recover(); r != nil {
            log.Printf("Panic recovered: %v", r)
            err = status.Errorf(codes.Internal, "Internal error")
        }
    }()
    return handler(ctx, req)
}
```

**认证拦截器**：
```go
func AuthInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    // 跳过不需要认证的方法
    if info.FullMethod == "/helloworld.Greeter/SayHello" {
        return handler(ctx, req)
    }

    // 从元数据获取 token
    md, ok := metadata.FromIncomingContext(ctx)
    if !ok {
        return nil, status.Error(codes.Unauthenticated, "missing metadata")
    }

    tokens := md.Get("authorization")
    if len(tokens) == 0 {
        return nil, status.Error(codes.Unauthenticated, "missing token")
    }

    // 验证 token
    userID, err := validateToken(tokens[0])
    if err != nil {
        return nil, status.Error(codes.Unauthenticated, "invalid token")
    }

    // 将用户信息放入上下文
    ctx = context.WithValue(ctx, "user_id", userID)
    return handler(ctx, req)
}
```

---

## 7. 错误处理

### 7.1. 标准错误码

```go
import "google.golang.org/grpc/codes"
import "google.golang.org/grpc/status"

// 创建错误
err := status.Error(codes.NotFound, "resource not found")

// 带详细信息的错误
st := status.New(codes.InvalidArgument, "invalid request")
st, _ = st.WithDetails(&errdetails.BadRequest{
    FieldViolations: []*errdetails.BadRequest_FieldViolation{
        {Field: "email", Description: "invalid email format"},
    },
})
err = st.Err()

// 常用错误码
codes.OK                   // 0  成功
codes.Canceled             // 1  客户端取消
codes.Unknown              // 2  未知错误
codes.InvalidArgument      // 3  无效参数
codes.DeadlineExceeded     // 4  超时
codes.NotFound             // 5  资源不存在
codes.AlreadyExists        // 6  资源已存在
codes.PermissionDenied     // 7  权限拒绝
codes.ResourceExhausted    // 8  资源耗尽
codes.FailedPrecondition   // 9  前置条件失败
codes.Aborted              // 10 操作中止
codes.OutOfRange           // 11 超出范围
codes.Unimplemented        // 12 未实现
codes.Internal             // 13 内部错误
codes.Unavailable          // 14 服务不可用
codes.DataLoss             // 15 数据丢失
codes.Unauthenticated      // 16 未认证
```

### 7.2. 错误处理最佳实践

```go
// 服务端返回错误
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    user, err := s.repo.FindUser(req.Id)
    if err != nil {
        if errors.Is(err, ErrNotFound) {
            return nil, status.Errorf(codes.NotFound, "user %d not found", req.Id)
        }
        return nil, status.Errorf(codes.Internal, "failed to get user: %v", err)
    }
    return user, nil
}

// 客户端处理错误
resp, err := client.GetUser(ctx, req)
if err != nil {
    st, ok := status.FromError(err)
    if !ok {
        log.Fatalf("non-gRPC error: %v", err)
    }
    
    switch st.Code() {
    case codes.NotFound:
        log.Println("User not found")
    case codes.Unauthenticated:
        log.Println("Please login first")
    default:
        log.Fatalf("Error: %v", st.Message())
    }
}
```

---

## 8. 超时与取消

### 8.1. 设置超时

```go
// 客户端设置超时
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

resp, err := client.SayHello(ctx, req)

// 服务端检查超时
func (s *server) SayHello(ctx context.Context, req *pb.HelloRequest) (*pb.HelloReply, error) {
    // 检查上下文是否已取消
    if err := ctx.Err(); err == context.Canceled {
        return nil, status.Error(codes.Canceled, "request canceled")
    }
    
    // 长时间操作支持取消
    result, err := s.slowOperation(ctx)
    if err != nil {
        return nil, err
    }
    return &pb.HelloReply{Message: result}, nil
}
```

### 8.2. 超时传播

```go
// 服务端作为客户端时，传播超时
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    // 使用传入的上下文（而非新建）
    resp, err := s.otherClient.GetUserInfo(ctx, &pb.GetUserInfoRequest{Id: req.Id})
    if err != nil {
        return nil, err
    }
    // ...
}
```

### 8.3. 截止时间

```go
// 设置绝对截止时间
ctx, cancel := context.WithDeadline(context.Background(), time.Now().Add(5*time.Second))
defer cancel()

// 检查剩余时间
deadline, ok := ctx.Deadline()
if ok {
    remaining := time.Until(deadline)
    log.Printf("Remaining time: %v", remaining)
}
```

---

## 9. 安全与认证

### 9.1. TLS 加密

**服务端配置**：
```go
import "google.golang.org/grpc/credentials"

creds, err := credentials.NewServerTLSFromFile("server.crt", "server.key")
if err != nil {
    log.Fatal(err)
}

s := grpc.NewServer(grpc.Creds(creds))
```

**客户端配置**：
```go
creds, err := credentials.NewClientTLSFromFile("ca.crt", "example.com")
if err != nil {
    log.Fatal(err)
}

conn, err := grpc.Dial("localhost:50051", grpc.WithTransportCredentials(creds))
```

### 9.2. Token 认证

```go
// 客户端发送 Token
type tokenAuth struct {
    token string
}

func (t tokenAuth) GetRequestMetadata(ctx context.Context, in ...string) (map[string]string, error) {
    return map[string]string{"authorization": "Bearer " + t.token}, nil
}

func (t tokenAuth) RequireTransportSecurity() bool {
    return true
}

conn, err := grpc.Dial(
    address,
    grpc.WithTransportCredentials(creds),
    grpc.WithPerRPCCredentials(tokenAuth{token: "my-token"}),
)
```

### 9.3. 服务端验证 Token

```go
func (s *server) SayHello(ctx context.Context, req *pb.HelloRequest) (*pb.HelloReply, error) {
    md, ok := metadata.FromIncomingContext(ctx)
    if !ok {
        return nil, status.Error(codes.Unauthenticated, "missing metadata")
    }

    tokens := md.Get("authorization")
    if len(tokens) == 0 {
        return nil, status.Error(codes.Unauthenticated, "missing token")
    }

    userID, err := s.validateToken(tokens[0])
    if err != nil {
        return nil, status.Error(codes.Unauthenticated, "invalid token")
    }

    return &pb.HelloReply{Message: "Hello " + userID}, nil
}
```

### 9.4. 相互 TLS（mTLS）

```go
import "crypto/tls"
import "crypto/x509"

func loadTLSCredentials() (credentials.TransportCredentials, error) {
    // 加载 CA 证书
    caCert, err := os.ReadFile("ca.crt")
    if err != nil {
        return nil, err
    }

    certPool := x509.NewCertPool()
    if !certPool.AppendCertsFromPEM(caCert) {
        return nil, fmt.Errorf("failed to add CA certificate")
    }

    // 加载服务端/客户端证书
    config := &tls.Config{
        Certificates: []tls.Certificate{cert},
        ClientAuth:   tls.RequireAndVerifyClientCert,  // 服务端需要
        ClientCAs:    certPool,                         // 服务端需要
        RootCAs:      certPool,                         // 客户端需要
        ServerName:   "example.com",                    // 客户端需要
    }

    return credentials.NewTLS(config), nil
}
```

---

## 10. 负载均衡

### 10.1. 客户端负载均衡策略

```go
import _ "google.golang.org/grpc/balancer/roundrobin"
import "google.golang.org/grpc/balancer"

// 注册自定义均衡器
balancer.Register(base.NewBalancerBuilder("custom", &customPickerBuilder{}, base.Config{}))

// 使用内置轮询策略
conn, err := grpc.Dial(
    "dns:///my-service",
    grpc.WithDefaultServiceConfig(`{"loadBalancingPolicy":"round_robin"}`),
    grpc.WithTransportCredentials(insecure.NewCredentials()),
)
```

### 10.2. 自定义负载均衡器

```go
type customPickerBuilder struct{}

func (b *customPickerBuilder) Build(info base.PickerBuildInfo) balancer.Picker {
    return &customPicker{subConns: info.ReadySCs}
}

type customPicker struct {
    subConns map[balancer.SubConn]base.SubConnInfo
}

func (p *customPicker) Pick(info balancer.PickInfo) (balancer.PickResult, error) {
    // 实现自定义选择逻辑
    for sc := range p.subConns {
        return balancer.PickResult{SubConn: sc}, nil
    }
    return balancer.PickResult{}, balancer.ErrNoSubConnSelect
}
```

---

## 11. 健康检查

### 11.1. 使用 gRPC 健康检查协议

```go
import "google.golang.org/grpc/health"
import "google.golang.org/grpc/health/grpc_health_v1"

func main() {
    s := grpc.NewServer()
    
    // 创建健康检查服务器
    healthServer := health.NewServer()
    healthServer.SetServingStatus("", grpc_health_v1.HealthCheckResponse_SERVING)
    healthServer.SetServingStatus("helloworld.Greeter", grpc_health_v1.HealthCheckResponse_SERVING)
    
    // 注册健康检查服务
    grpc_health_v1.RegisterHealthServer(s, healthServer)
    
    pb.RegisterGreeterServer(s, &server{})
    s.Serve(lis)
}
```

### 11.2. 客户端健康检查

```go
import "google.golang.org/grpc/health/grpc_health_v1"

func checkHealth(conn *grpc.ClientConn) error {
    client := grpc_health_v1.NewHealthClient(conn)
    
    ctx, cancel := context.WithTimeout(context.Background(), time.Second)
    defer cancel()
    
    resp, err := client.Check(ctx, &grpc_health_v1.HealthCheckRequest{
        Service: "helloworld.Greeter",
    })
    if err != nil {
        return err
    }
    
    if resp.GetStatus() != grpc_health_v1.HealthCheckResponse_SERVING {
        return fmt.Errorf("service unhealthy: %v", resp.GetStatus())
    }
    return nil
}
```

---

## 12. 流量控制

### 12.1. 元数据传递

```go
// 客户端发送元数据
md := metadata.Pairs("token", "my-token", "trace-id", "12345")
ctx := metadata.NewOutgoingContext(context.Background(), md)

resp, err := client.SayHello(ctx, req)

// 服务端接收元数据
func (s *server) SayHello(ctx context.Context, req *pb.HelloRequest) (*pb.HelloReply, error) {
    md, ok := metadata.FromIncomingContext(ctx)
    if ok {
        tokens := md.Get("token")
        if len(tokens) > 0 {
            fmt.Println("Token:", tokens[0])
        }
    }
    return &pb.HelloReply{Message: "Hello " + req.Name}, nil
}

// 服务端发送元数据
func (s *server) SayHello(ctx context.Context, req *pb.HelloRequest) (*pb.HelloReply, error) {
    header := metadata.Pairs("server-version", "1.0.0")
    grpc.SendHeader(ctx, header)
    
    trailer := metadata.Pairs("response-time", time.Now().String())
    grpc.SetTrailer(ctx, trailer)
    
    return &pb.HelloReply{Message: "Hello " + req.Name}, nil
}

// 客户端接收元数据
var header, trailer metadata.MD
resp, err := client.SayHello(ctx, req, grpc.Header(&header), grpc.Trailer(&trailer))
fmt.Println(header.Get("server-version"))
fmt.Println(trailer.Get("response-time"))
```

### 12.2. 流控制

```go
// 服务端流控制
func (s *server) StreamData(req *pb.Request, stream pb.Service_StreamDataServer) error {
    for i := 0; i < 1000; i++ {
        data := generateData(i)
        if err := stream.Send(data); err != nil {
            return err
        }
        
        // 检查客户端是否还在接收
        if i%100 == 0 {
            select {
            case <-stream.Context().Done():
                return stream.Context().Err()
            default:
            }
        }
    }
    return nil
}
```

---

## 13. 性能优化

### 13.1. 连接复用

```go
// 全局连接池（推荐单例模式）
var conn *grpc.ClientConn
var once sync.Once

func GetClientConn() *grpc.ClientConn {
    once.Do(func() {
        var err error
        conn, err = grpc.Dial(
            address,
            grpc.WithTransportCredentials(insecure.NewCredentials()),
            grpc.WithKeepaliveParams(keepalive.ClientParameters{
                Time:                10 * time.Second,
                Timeout:             time.Second,
                PermitWithoutStream: true,
            }),
        )
        if err != nil {
            panic(err)
        }
    })
    return conn
}
```

### 13.2. 消息大小优化

```go
// 增加最大消息大小
s := grpc.NewServer(
    grpc.MaxRecvMsgSize(1024*1024*100),  // 100MB
    grpc.MaxSendMsgSize(1024*1024*100),  // 100MB
)

// 客户端
conn, err := grpc.Dial(
    address,
    grpc.WithDefaultCallOptions(
        grpc.MaxCallRecvMsgSize(1024*1024*100),
        grpc.MaxCallSendMsgSize(1024*1024*100),
    ),
)
```

### 13.3. 连接参数调优

```go
import "google.golang.org/grpc/keepalive"

// 服务端 keepalive
kaParams := keepalive.ServerParameters{
    MaxConnectionIdle: 5 * time.Minute,
    Time:              10 * time.Second,
    Timeout:           1 * time.Second,
}

kaPolicy := keepalive.EnforcementPolicy{
    MinTime:             5 * time.Second,
    PermitWithoutStream: true,
}

s := grpc.NewServer(
    grpc.KeepaliveParams(kaParams),
    grpc.KeepaliveEnforcementPolicy(kaPolicy),
)

// 客户端 keepalive
conn, err := grpc.Dial(
    address,
    grpc.WithKeepaliveParams(keepalive.ClientParameters{
        Time:                10 * time.Second,
        Timeout:             time.Second,
        PermitWithoutStream: true,
    }),
)
```

### 13.4. 压缩

```go
import "google.golang.org/grpc/encoding/gzip"

// 客户端启用压缩
resp, err := client.SayHello(ctx, req, grpc.UseCompressor(gzip.Name))

// 服务端自动解压并压缩响应
// gRPC 默认支持 gzip，无需额外配置
```

---

## 14. 调试与测试

### 14.1. 启用反射

```go
import "google.golang.org/grpc/reflection"

func main() {
    s := grpc.NewServer()
    pb.RegisterGreeterServer(s, &server{})
    
    // 启用反射，支持 grpcurl 等工具
    reflection.Register(s)
    
    s.Serve(lis)
}
```

### 14.2. 使用 grpcurl

```bash
# 安装
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest

# 列出服务
grpcurl -plaintext localhost:50051 list

# 查看服务描述
grpcurl -plaintext localhost:50051 describe helloworld.Greeter

# 调用方法
grpcurl -plaintext -d '{"name": "World"}' localhost:50051 helloworld.Greeter/SayHello
```

### 14.3. 使用 grpcui

```bash
# 安装
go install github.com/fullstorydev/grpcui/cmd/grpcui@latest

# 启动 Web UI
grpcui -plaintext localhost:50051
```

### 14.4. 单元测试

```go
import "google.golang.org/grpc/test/bufconn"

func TestSayHello(t *testing.T) {
    // 创建内存监听器
    lis := bufconn.Listen(1024 * 1024)
    
    s := grpc.NewServer()
    pb.RegisterGreeterServer(s, &server{})
    go s.Serve(lis)
    
    // 创建客户端
    conn, err := grpc.DialContext(
        context.Background(),
        "bufnet",
        grpc.WithContextDialer(func(ctx context.Context, s string) (net.Conn, error) {
            return lis.Dial()
        }),
        grpc.WithTransportCredentials(insecure.NewCredentials()),
    )
    if err != nil {
        t.Fatal(err)
    }
    defer conn.Close()
    
    client := pb.NewGreeterClient(conn)
    resp, err := client.SayHello(context.Background(), &pb.HelloRequest{Name: "Test"})
    if err != nil {
        t.Fatal(err)
    }
    
    if resp.Message != "Hello Test" {
        t.Errorf("unexpected message: %s", resp.Message)
    }
}
```

### 14.5. Benchmark 测试

```go
func BenchmarkSayHello(b *testing.B) {
    conn, err := grpc.Dial(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
    if err != nil {
        b.Fatal(err)
    }
    defer conn.Close()
    
    client := pb.NewGreeterClient(conn)
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        client.SayHello(context.Background(), &pb.HelloRequest{Name: "Test"})
    }
}
```

---

## 15. 项目结构

### 15.1. 推荐目录结构

```
grpc-project/
├── api/
│   └── proto/
│       └── v1/
│           └── service.proto
├── cmd/
│   ├── server/
│   │   └── main.go
│   └── client/
│       └── main.go
├── internal/
│   ├── service/
│   │   └── greeter.go
│   ├── repository/
│   │   └── user_repo.go
│   └── middleware/
│       └── auth.go
├── pkg/
│   └── util/
│       └── logger.go
├── gen/
│   └── proto/
│       └── v1/
│           ├── service.pb.go
│           └── service_grpc.pb.go
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

### 15.2. Makefile 示例

```makefile
.PHONY: gen clean

gen:
	protoc --go_out=. --go-grpc_out=. api/proto/v1/*.proto

clean:
	rm -rf gen/

run-server:
	go run cmd/server/main.go

run-client:
	go run cmd/client/main.go

test:
	go test ./... -v

lint:
	golangci-lint run
```

---

## 16. 最佳实践

### 16.1. Proto 文件设计

1. **字段编号规划**：预留字段编号给未来扩展
2. **向后兼容**：
   - 不要修改已有字段的编号
   - 新增字段使用默认值兼容旧客户端
   - 删除字段使用 `reserved` 标记
3. **命名规范**：使用小写字母和下划线 `snake_case`

### 16.2. 错误处理规范

```go
// 好的做法：返回详细的 gRPC 错误
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    if req.Id == 0 {
        return nil, status.Errorf(codes.InvalidArgument, "id is required")
    }
    
    user, err := s.repo.FindByID(req.Id)
    if errors.Is(err, ErrNotFound) {
        return nil, status.Errorf(codes.NotFound, "user %d not found", req.Id)
    }
    if err != nil {
        return nil, status.Errorf(codes.Internal, "database error: %v", err)
    }
    
    return user, nil
}
```

### 16.3. 上下文传递

```go
// 好的做法：传递上下文
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    // 使用传入的上下文
    user, err := s.repo.FindByID(ctx, req.Id)
    if err != nil {
        return nil, err
    }
    
    // 调用其他服务时传递上下文
    profile, err := s.profileClient.GetProfile(ctx, &pb.GetProfileRequest{UserId: user.Id})
    if err != nil {
        return nil, err
    }
    
    user.Profile = profile
    return user, nil
}
```

### 16.4. 资源清理

```go
// 服务端：确保资源释放
func (s *server) StreamData(req *pb.Request, stream pb.Service_StreamDataServer) error {
    file, err := os.Open("data.txt")
    if err != nil {
        return err
    }
    defer file.Close()  // 确保文件关闭
    
    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        if err := stream.Send(&pb.Data{Value: scanner.Text()}); err != nil {
            return err
        }
    }
    return scanner.Err()
}

// 客户端：确保连接关闭
func main() {
    conn, err := grpc.Dial(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
    if err != nil {
        log.Fatal(err)
    }
    defer conn.Close()  // 确保连接关闭
    
    // ...
}
```

### 16.5. 避免阻塞

```go
// 流式 RPC 中避免阻塞
func (s *server) BidirectionalStream(stream pb.Service_BidirectionalStreamServer) error {
    // 使用 channel 进行异步处理
    recvChan := make(chan *pb.Request)
    errChan := make(chan error)
    
    // 接收协程
    go func() {
        for {
            req, err := stream.Recv()
            if err != nil {
                errChan <- err
                return
            }
            recvChan <- req
        }
    }()
    
    for {
        select {
        case req := <-recvChan:
            // 处理请求
            if err := stream.Send(&pb.Response{...}); err != nil {
                return err
            }
        case err := <-errChan:
            if err == io.EOF {
                return nil
            }
            return err
        case <-stream.Context().Done():
            return stream.Context().Err()
        }
    }
}
```

---

## 17. 常见问题与解决方案

### 17.1. 连接问题

**问题**：`connection refused`

**解决**：
- 检查服务端是否启动
- 检查端口是否正确
- 检查防火墙设置

### 17.2. 超时问题

**问题**：`context deadline exceeded`

**解决**：
```go
// 增加超时时间
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)

// 或使用无超时上下文
ctx := context.Background()
```

### 17.3. 消息过大

**问题**：`received message larger than max`

**解决**：
```go
// 增加消息大小限制
s := grpc.NewServer(grpc.MaxRecvMsgSize(100*1024*1024))
```

### 17.4. 编码问题

**问题**：`proto: no encoder for field`

**解决**：
- 确保所有字段都正确导出（首字母大写）
- 检查 protoc 生成的代码是否最新

### 17.5. 版本兼容

**问题**：不同版本的 protobuf 生成的代码不兼容

**解决**：
- 锁定 protoc-gen-go 和 protoc-gen-go-grpc 版本
- 使用 go.mod 管理 gRPC 依赖版本

---

## 18. 总结

### gRPC vs REST 对比

| 特性 | gRPC | REST |
|------|------|------|
| 协议 | HTTP/2 | HTTP/1.1 |
| 数据格式 | Protobuf（二进制） | JSON（文本） |
| 性能 | 高 | 一般 |
| 流支持 | 原生支持 | 需要额外实现 |
| 浏览器支持 | 需要 gRPC-Web | 原生支持 |
| 工具生态 | 发展中 | 成熟 |
| 学习曲线 | 较陡 | 平缓 |

### 适用场景

**适合使用 gRPC**：
- 微服务内部通信
- 高性能、低延迟要求
- 需要双向流通信
- 跨语言调用
- 实时数据传输

**适合使用 REST**：
- 公开 API
- 浏览器直接调用
- 简单 CRUD 操作
- 需要广泛兼容性

### 核心要点总结

1. **Protobuf 设计**：合理规划字段编号，保持向后兼容
2. **错误处理**：使用标准错误码，提供详细错误信息
3. **超时控制**：客户端设置超时，服务端检查上下文
4. **安全认证**：生产环境必须使用 TLS
5. **连接管理**：复用连接，配置合理的 keepalive
6. **拦截器**：统一处理日志、认证、限流等横切关注点
7. **监控调试**：启用反射，使用 grpcurl 调试

---

## 参考资源

- [gRPC 官方文档](https://grpc.io/docs/)
- [Protocol Buffers 指南](https://protobuf.dev/programming-guides/)
- [gRPC-Go 示例](https://github.com/grpc/grpc-go/tree/master/examples)
- [gRPC 最佳实践](https://grpc.io/docs/guides/)
