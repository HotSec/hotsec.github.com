# Protobuf

> 主要参考：《Go语言高级编程（第2版）》第6.2节 — 柴树杉、曹春晖 著

Protocol Buffers（Protobuf）是 Google 开发的一种语言无关、平台无关的可扩展结构化数据序列化机制。它比 XML 更小、更快、更简单，非常适合数据存储或 RPC 数据交换格式。

---

## 一、Protobuf 简介

### 1.1 什么是 Protobuf

Protobuf 是一种二进制序列化格式，具有以下特点：

| 特点 | 说明 |
|------|------|
| **高效** | 二进制格式，比 JSON/XML 小 3-10 倍，解析快 20-100 倍 |
| **跨语言** | 支持 Go、C++、Java、Python、JavaScript 等 |
| **强类型** | 通过 .proto 文件定义数据结构，编译时检查类型 |
| **向后兼容** | 新增字段不影响旧代码 |
| **自描述** | 生成的代码包含结构信息 |

### 1.2 Protobuf vs JSON

```
┌─────────────────────────────────────────────────────────────┐
│                    Protobuf vs JSON                         │
├─────────────────┬───────────────────┬───────────────────────┤
│     特性        │     Protobuf      │        JSON           │
├─────────────────┼───────────────────┼───────────────────────┤
│ 格式           │ 二进制             │ 文本                  │
│ 大小           │ 小                 │ 大                    │
│ 解析速度       │ 快                 │ 慢                    │
│ 可读性         │ 不可读             │ 可读                  │
│ 类型安全       │ 强类型             │ 弱类型                │
│ Schema         │ 必需               │ 可选                  │
│ 工具链         │ protoc 编译器      │ 无需编译              │
│ 适用场景       │ RPC、存储          │ API、配置             │
└─────────────────┴───────────────────┴───────────────────────┘
```

---

## 二、安装与配置

### 2.1 安装 protoc 编译器

```bash
# macOS
brew install protobuf

# Ubuntu/Debian
apt install -y protobuf-compiler

# 验证安装
protoc --version
```

### 2.2 安装 Go 插件

```bash
# 安装 protoc-gen-go
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest

# 安装 protoc-gen-go-grpc（用于 gRPC）
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# 确保 $GOPATH/bin 在 PATH 中
export PATH="$PATH:$(go env GOPATH)/bin"
```

### 2.3 项目结构

```
myproject/
├── proto/
│   └── hello.proto
├── pb/
│   └── hello.pb.go      # 生成的 Go 代码
└── main.go
```

---

## 三、Proto 文件语法

### 3.1 基本语法

```protobuf
// proto/hello.proto

syntax = "proto3";  // 使用 proto3 语法

package hello;      // 包名

option go_package = "myproject/pb";  // Go 包路径

// 消息定义
message HelloRequest {
    string name = 1;      // 字段名 = 字段编号
    int32 age = 2;
    repeated string hobbies = 3;  // 列表类型
}

message HelloResponse {
    string message = 1;
}
```

### 3.2 字段类型

| Proto 类型 | Go 类型 | 说明 |
|-----------|---------|------|
| double | float64 | 双精度浮点 |
| float | float32 | 单精度浮点 |
| int32 | int32 | 32位整数（变长编码） |
| int64 | int64 | 64位整数（变长编码） |
| uint32 | uint32 | 无符号32位整数 |
| uint64 | uint64 | 无符号64位整数 |
| sint32 | int32 | 有符号32位整数（更高效） |
| sint64 | int64 | 有符号64位整数（更高效） |
| fixed32 | uint32 | 固定4字节 |
| fixed64 | uint64 | 固定8字节 |
| bool | bool | 布尔值 |
| string | string | UTF-8 字符串 |
| bytes | []byte | 字节数组 |

### 3.3 复杂类型

```protobuf
syntax = "proto3";

package example;

option go_package = "myproject/pb";

// 枚举
enum Status {
    STATUS_UNKNOWN = 0;  // 枚举值必须从 0 开始
    STATUS_ACTIVE = 1;
    STATUS_INACTIVE = 2;
}

// 嵌套消息
message Address {
    string street = 1;
    string city = 2;
    string country = 3;
}

// 主消息
message Person {
    int32 id = 1;
    string name = 2;
    string email = 3;
    
    // 嵌套消息字段
    Address address = 4;
    
    // 枚举字段
    Status status = 5;
    
    // 列表
    repeated string phone_numbers = 6;
    
    // Map
    map<string, string> labels = 7;
    
    // 嵌套定义
    message Metadata {
        int64 created_at = 1;
        int64 updated_at = 2;
    }
    
    Metadata metadata = 8;
    
    // oneof：只能设置其中一个
    oneof contact {
        string email_contact = 9;
        string phone_contact = 10;
    }
    
    // 时间戳（使用 google.protobuf.Timestamp）
    // google.protobuf.Timestamp created_at = 11;
}
```

### 3.4 服务定义

```protobuf
syntax = "proto3";

package hello;

option go_package = "myproject/pb";

message HelloRequest {
    string name = 1;
}

message HelloResponse {
    string message = 1;
}

// 服务定义
service HelloService {
    // 一元 RPC
    rpc SayHello(HelloRequest) returns (HelloResponse);
    
    // 服务端流式 RPC
    rpc SayHelloStream(HelloRequest) returns (stream HelloResponse);
    
    // 客户端流式 RPC
    rpc SayHelloClientStream(stream HelloRequest) returns (HelloResponse);
    
    // 双向流式 RPC
    rpc SayHelloBidirectionalStream(stream HelloRequest) returns (stream HelloResponse);
}
```

---

## 四、代码生成

### 4.1 使用 protoc 生成

```bash
# 生成 Go 代码
protoc --go_out=. --go_opt=paths=source_relative \
    proto/hello.proto

# 生成 Go + gRPC 代码
protoc --go_out=. --go_opt=paths=source_relative \
    --go-grpc_out=. --go-grpc_opt=paths=source_relative \
    proto/hello.proto
```

### 4.2 使用 buf 工具

```bash
# 安装 buf
go install github.com/bufbuild/buf/cmd/buf@latest

# 初始化
buf config init

# 生成代码
buf generate
```

**buf.yaml**:
```yaml
version: v1
breaking:
  use:
    - FILE
lint:
  use:
    - DEFAULT
```

**buf.gen.yaml**:
```yaml
version: v1
plugins:
  - name: go
    out: pb
    opt:
      - paths=source_relative
  - name: go-grpc
    out: pb
    opt:
      - paths=source_relative
```

### 4.3 生成的代码结构

```go
// pb/hello.pb.go

type HelloRequest struct {
    state         protoimpl.MessageState
    sizeCache     protoimpl.SizeCache
    unknownFields protoimpl.UnknownFields
    
    Name     string   `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
    Age      int32    `protobuf:"varint,2,opt,name=age,proto3" json:"age,omitempty"`
    Hobbies  []string `protobuf:"bytes,3,rep,name=hobbies,proto3" json:"hobbies,omitempty"`
}

func (x *HelloRequest) Reset() {
    *x = HelloRequest{}
}

func (x *HelloRequest) String() string {
    return protoimpl.X.MessageStringOf(x)
}

func (x *HelloRequest) ProtoMessage() {}

func (x *HelloRequest) GetName() string {
    if x != nil {
        return x.Name
    }
    return ""
}

func (x *HelloRequest) GetAge() int32 {
    if x != nil {
        return x.Age
    }
    return 0
}

func (x *HelloRequest) GetHobbies() []string {
    if x != nil {
        return x.Hobbies
    }
    return nil
}
```

---

## 五、使用 Protobuf

### 5.1 序列化与反序列化

```go
package main

import (
    "fmt"
    "google.golang.org/protobuf/proto"
    "myproject/pb"
)

func main() {
    // 创建消息
    req := &pb.HelloRequest{
        Name:    "Alice",
        Age:     30,
        Hobbies: []string{"reading", "coding"},
    }
    
    // 序列化
    data, err := proto.Marshal(req)
    if err != nil {
        panic(err)
    }
    fmt.Printf("Serialized size: %d bytes\n", len(data))
    
    // 反序列化
    var req2 pb.HelloRequest
    err = proto.Unmarshal(data, &req2)
    if err != nil {
        panic(err)
    }
    fmt.Printf("Name: %s, Age: %d\n", req2.GetName(), req2.GetAge())
}
```

### 5.2 JSON 转换

```go
import (
    "google.golang.org/protobuf/encoding/protojson"
)

func main() {
    req := &pb.HelloRequest{
        Name:    "Alice",
        Age:     30,
        Hobbies: []string{"reading", "coding"},
    }
    
    // Protobuf -> JSON
    jsonData, err := protojson.Marshal(req)
    if err != nil {
        panic(err)
    }
    fmt.Println(string(jsonData))
    // {"name":"Alice","age":30,"hobbies":["reading","coding"]}
    
    // JSON -> Protobuf
    var req2 pb.HelloRequest
    err = protojson.Unmarshal(jsonData, &req2)
    if err != nil {
        panic(err)
    }
}
```

### 5.3 字段默认值

```go
func main() {
    req := &pb.HelloRequest{}
    
    // proto3 中，未设置的字段返回零值
    fmt.Println(req.GetName())    // ""（空字符串）
    fmt.Println(req.GetAge())     // 0
    fmt.Println(req.GetHobbies()) // nil（空切片）
    
    // 检查字段是否设置
    // proto3 没有直接的方法检查字段是否设置
    // 可以使用 protobuf 反射
}
```

---

## 六、高级特性

### 6.1 Any 类型

```protobuf
import "google/protobuf/any.proto";

message Response {
    google.protobuf.Any data = 1;
}
```

```go
import "google.golang.org/protobuf/types/known/anypb"

func main() {
    // 打包 Any
    req := &pb.HelloRequest{Name: "Alice"}
    anyMsg, _ := anypb.New(req)
    
    resp := &pb.Response{
        Data: anyMsg,
    }
    
    // 解包 Any
    var req2 pb.HelloRequest
    _ = resp.Data.UnmarshalTo(&req2)
}
```

### 6.2 时间戳

```protobuf
import "google/protobuf/timestamp.proto";

message Event {
    string name = 1;
    google.protobuf.Timestamp created_at = 2;
}
```

```go
import "google.golang.org/protobuf/types/known/timestamppb"

func main() {
    event := &pb.Event{
        Name:      "test",
        CreatedAt: timestamppb.Now(),
    }
    
    // 转换为 time.Time
    t := event.CreatedAt.AsTime()
}
```

### 6.3 Duration

```protobuf
import "google/protobuf/duration.proto";

message Task {
    string name = 1;
    google.protobuf.Duration duration = 2;
}
```

```go
import "google.golang.org/protobuf/types/known/durationpb"

func main() {
    task := &pb.Task{
        Name:     "test",
        Duration: durationpb.New(5 * time.Second),
    }
    
    // 转换为 time.Duration
    d := task.Duration.AsDuration()
}
```

### 6.4 Well-Known Types

| 类型 | 用途 |
|------|------|
| `google.protobuf.Any` | 任意类型 |
| `google.protobuf.Timestamp` | 时间戳 |
| `google.protobuf.Duration` | 时间间隔 |
| `google.protobuf.Empty` | 空消息 |
| `google.protobuf.Wrappers` | 基本类型包装器 |
| `google.protobuf.FieldMask` | 字段掩码 |

---

## 七、最佳实践

### 7.1 字段编号规划

```protobuf
message User {
    // 预留字段编号，防止重用
    reserved 2, 15, 9 to 11;
    reserved "old_field";
    
    int32 id = 1;
    string name = 3;
    string email = 4;
}
```

### 7.2 向后兼容更新

```protobuf
// ✅ 安全的更新方式
message User {
    int32 id = 1;
    string name = 2;
    string email = 3;
    string phone = 4;  // 新增字段，不影响旧代码
}

// ❌ 不安全的更新方式
// 1. 不要修改已有字段的编号
// 2. 不要重用已删除的字段编号
// 3. 不要修改字段类型（某些类型转换除外）
```

### 7.3 命名规范

```protobuf
// 使用 snake_case 命名
message user_profile {  // ❌ 消息名使用 CamelCase
    string user_name = 1;  // ✅ 字段名使用 snake_case
    int32 user_age = 2;
}

// 正确命名
message UserProfile {
    string user_name = 1;
    int32 user_age = 2;
}
```

---

## 参考资料

- [Go语言高级编程（第2版）](https://github.com/chai2010/advanced-go-programming-book)
- [Protocol Buffers 官方文档](https://protobuf.dev/)
- [Go Protobuf 教程](https://protobuf.dev/getting-started/gotutorial/)
- [buf 工具](https://buf.build/)
