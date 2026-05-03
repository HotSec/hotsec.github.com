# RPC 入门

> 主要参考：《Go语言高级编程（第2版）》第6章 — 柴树杉、曹春晖 著

RPC（Remote Procedure Call，远程过程调用）是一种允许程序调用另一台计算机上的函数或方法的技术。调用者不需要了解底层网络细节，就像调用本地函数一样简单。

---

## 一、RPC 概述

### 1.1 什么是 RPC

RPC 的核心思想是：让远程调用看起来像本地调用一样。

```
┌─────────────────────────────────────────────────────────────┐
│                      RPC 工作原理                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  客户端                        服务端                       │
│  ┌─────────┐                   ┌─────────┐                 │
│  │ Client  │                   │ Server  │                 │
│  │  Stub   │                   │  Stub   │                 │
│  └────┬────┘                   └────┬────┘                 │
│       │                             │                       │
│       │ 1. 调用本地 Stub            │                       │
│       │    func Add(1, 2)           │                       │
│       │                             │                       │
│       │ 2. 序列化参数               │                       │
│       │    {func: "Add", args: [1,2]}                      │
│       │                             │                       │
│       │ 3. 网络传输                 │                       │
│       │ ─────────────────────────→  │                       │
│       │                             │ 4. 反序列化           │
│       │                             │ 5. 调用本地函数       │
│       │                             │    Add(1, 2) = 3      │
│       │                             │ 6. 序列化结果         │
│       │                             │                       │
│       │ 7. 接收结果                 │                       │
│       │ ←─────────────────────────  │                       │
│       │                             │                       │
│       │ 8. 反序列化                 │                       │
│       │    result: 3                │                       │
│       │                             │                       │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 RPC vs REST API

| 特性 | RPC | REST |
|------|-----|------|
| **设计理念** | 动作导向 | 资源导向 |
| **URL** | `/rpc` | `/users/123` |
| **方法** | 自定义方法名 | HTTP 方法（GET/POST/PUT/DELETE） |
| **数据格式** | 二进制（Protobuf）或 JSON | JSON/XML |
| **性能** | 高（二进制、长连接） | 中等 |
| **浏览器支持** | 需要库支持 | 原生支持 |
| **适用场景** | 微服务内部通信 | 公开 API |

### 1.3 RPC 框架对比

| 框架 | 语言 | 特点 |
|------|------|------|
| **gRPC** | 多语言 | Google 出品，HTTP/2 + Protobuf |
| **Thrift** | 多语言 | Facebook 出品，多协议支持 |
| **Dubbo** | Java | 阿里出品，服务治理完善 |
| **JSON-RPC** | 多语言 | 简单，JSON 格式 |
| **Twirp** | Go | 简单易用，支持 JSON 和 Protobuf |

---

## 二、Go 标准库 RPC

### 2.1 基本使用

Go 标准库 `net/rpc` 提供了简单的 RPC 实现：

**服务端**:
```go
package main

import (
    "errors"
    "net"
    "net/http"
    "net/rpc"
)

type Args struct {
    A, B int
}

type Quotient struct {
    Quo, Rem int
}

type Arith int

func (t *Arith) Multiply(args *Args, reply *int) error {
    *reply = args.A * args.B
    return nil
}

func (t *Arith) Divide(args *Args, quo *Quotient) error {
    if args.B == 0 {
        return errors.New("divide by zero")
    }
    quo.Quo = args.A / args.B
    quo.Rem = args.A % args.B
    return nil
}

func main() {
    // 注册服务
    arith := new(Arith)
    rpc.Register(arith)
    
    // HTTP 处理
    rpc.HandleHTTP()
    
    // 启动服务
    l, _ := net.Listen("tcp", ":1234")
    http.Serve(l, nil)
}
```

**客户端**:
```go
package main

import (
    "fmt"
    "net/rpc"
)

type Args struct {
    A, B int
}

type Quotient struct {
    Quo, Rem int
}

func main() {
    // 连接服务端
    client, err := rpc.DialHTTP("tcp", "localhost:1234")
    if err != nil {
        panic(err)
    }
    defer client.Close()
    
    // 同步调用
    args := &Args{7, 8}
    var reply int
    err = client.Call("Arith.Multiply", args, &reply)
    if err != nil {
        panic(err)
    }
    fmt.Printf("Arith: %d*%d=%d\n", args.A, args.B, reply)
    
    // 异步调用
    divCall := client.Go("Arith.Divide", args, &Quotient{}, nil)
    replyCall := <-divCall.Done
    if replyCall.Error != nil {
        panic(replyCall.Error)
    }
    quo := replyCall.Reply.(*Quotient)
    fmt.Printf("Arith: %d/%d=%d remainder %d\n", args.A, args.B, quo.Quo, quo.Rem)
}
```

### 2.2 方法规则

RPC 方法必须满足以下规则：

```go
// 正确的方法签名
func (t *T) MethodName(args T1, reply *T2) error

// 规则：
// 1. 方法必须是导出的（首字母大写）
// 2. 方法有两个参数，都是导出类型或内置类型
// 3. 第二个参数是指针
// 4. 返回类型是 error
```

### 2.3 JSON-RPC

Go 标准库也支持 JSON-RPC：

**服务端**:
```go
package main

import (
    "net"
    "net/rpc"
    "net/rpc/jsonrpc"
)

type Args struct {
    A, B int
}

type Arith int

func (t *Arith) Multiply(args *Args, reply *int) error {
    *reply = args.A * args.B
    return nil
}

func main() {
    arith := new(Arith)
    rpc.Register(arith)
    
    l, _ := net.Listen("tcp", ":1234")
    for {
        conn, _ := l.Accept()
        go jsonrpc.ServeConn(conn)
    }
}
```

**客户端**:
```go
package main

import (
    "fmt"
    "net"
    "net/rpc/jsonrpc"
)

type Args struct {
    A, B int
}

func main() {
    conn, _ := net.Dial("tcp", "localhost:1234")
    defer conn.Close()
    
    client := jsonrpc.NewClient(conn)
    
    args := &Args{7, 8}
    var reply int
    client.Call("Arith.Multiply", args, &reply)
    
    fmt.Printf("Result: %d\n", reply)
}
```

---

## 三、自定义 RPC 框架

### 3.1 基本结构

```go
package rpc

import (
    "encoding/json"
    "net"
    "reflect"
)

type Server struct {
    services map[string]reflect.Value
}

func NewServer() *Server {
    return &Server{
        services: make(map[string]reflect.Value),
    }
}

func (s *Server) Register(name string, service interface{}) {
    s.services[name] = reflect.ValueOf(service)
}

func (s *Server) Serve(lis net.Listener) {
    for {
        conn, err := lis.Accept()
        if err != nil {
            continue
        }
        go s.handleConn(conn)
    }
}

func (s *Server) handleConn(conn net.Conn) {
    defer conn.Close()
    
    decoder := json.NewDecoder(conn)
    encoder := json.NewEncoder(conn)
    
    for {
        var req Request
        if err := decoder.Decode(&req); err != nil {
            return
        }
        
        resp := s.handleRequest(&req)
        encoder.Encode(resp)
    }
}

type Request struct {
    Service string        `json:"service"`
    Method  string        `json:"method"`
    Args    []interface{} `json:"args"`
}

type Response struct {
    Result interface{} `json:"result"`
    Error  string      `json:"error"`
}

func (s *Server) handleRequest(req *Request) *Response {
    service, ok := s.services[req.Service]
    if !ok {
        return &Response{Error: "service not found"}
    }
    
    method := service.MethodByName(req.Method)
    if !method.IsValid() {
        return &Response{Error: "method not found"}
    }
    
    // 调用方法
    args := make([]reflect.Value, len(req.Args))
    for i, arg := range req.Args {
        args[i] = reflect.ValueOf(arg)
    }
    
    results := method.Call(args)
    
    if len(results) > 0 {
        return &Response{Result: results[0].Interface()}
    }
    
    return &Response{}
}
```

### 3.2 客户端

```go
package rpc

import (
    "encoding/json"
    "net"
)

type Client struct {
    conn     net.Conn
    encoder  *json.Encoder
    decoder  *json.Decoder
}

func NewClient(addr string) (*Client, error) {
    conn, err := net.Dial("tcp", addr)
    if err != nil {
        return nil, err
    }
    
    return &Client{
        conn:    conn,
        encoder: json.NewEncoder(conn),
        decoder: json.NewDecoder(conn),
    }, nil
}

func (c *Client) Call(service, method string, args []interface{}, result interface{}) error {
    req := &Request{
        Service: service,
        Method:  method,
        Args:    args,
    }
    
    if err := c.encoder.Encode(req); err != nil {
        return err
    }
    
    var resp Response
    if err := c.decoder.Decode(&resp); err != nil {
        return err
    }
    
    if resp.Error != "" {
        return fmt.Errorf(resp.Error)
    }
    
    if result != nil {
        data, _ := json.Marshal(resp.Result)
        json.Unmarshal(data, result)
    }
    
    return nil
}

func (c *Client) Close() {
    c.conn.Close()
}
```

---

## 四、RPC 进阶

### 4.1 连接管理

```go
type Pool struct {
    mu       sync.Mutex
    conns    chan net.Conn
    addr     string
    maxIdle  int
    maxOpen  int
    numOpen  int
}

func NewPool(addr string, maxIdle, maxOpen int) *Pool {
    return &Pool{
        conns:   make(chan net.Conn, maxIdle),
        addr:    addr,
        maxIdle: maxIdle,
        maxOpen: maxOpen,
    }
}

func (p *Pool) Get() (net.Conn, error) {
    p.mu.Lock()
    
    // 从池中获取
    select {
    case conn := <-p.conns:
        p.mu.Unlock()
        return conn, nil
    default:
    }
    
    // 创建新连接
    if p.maxOpen > 0 && p.numOpen >= p.maxOpen {
        p.mu.Unlock()
        return nil, errors.New("connection pool exhausted")
    }
    
    p.numOpen++
    p.mu.Unlock()
    
    conn, err := net.Dial("tcp", p.addr)
    if err != nil {
        p.mu.Lock()
        p.numOpen--
        p.mu.Unlock()
        return nil, err
    }
    
    return conn, nil
}

func (p *Pool) Put(conn net.Conn) {
    p.mu.Lock()
    defer p.mu.Unlock()
    
    select {
    case p.conns <- conn:
        // 放回池中
    default:
        // 池已满，关闭连接
        conn.Close()
        p.numOpen--
    }
}
```

### 4.2 超时控制

```go
type Client struct {
    conn    net.Conn
    timeout time.Duration
}

func (c *Client) Call(req *Request, resp *Response) error {
    // 设置写超时
    if c.timeout > 0 {
        c.conn.SetWriteDeadline(time.Now().Add(c.timeout))
    }
    
    // 发送请求
    if err := json.NewEncoder(c.conn).Encode(req); err != nil {
        return err
    }
    
    // 设置读超时
    if c.timeout > 0 {
        c.conn.SetReadDeadline(time.Now().Add(c.timeout))
    }
    
    // 接收响应
    return json.NewDecoder(c.conn).Decode(resp)
}
```

### 4.3 服务发现

```go
type Discovery interface {
    GetService(name string) ([]string, error)
    Register(name, addr string) error
    Deregister(name, addr string) error
}

// 简单的服务发现实现
type SimpleDiscovery struct {
    mu       sync.RWMutex
    services map[string][]string
}

func NewSimpleDiscovery() *SimpleDiscovery {
    return &SimpleDiscovery{
        services: make(map[string][]string),
    }
}

func (d *SimpleDiscovery) GetService(name string) ([]string, error) {
    d.mu.RLock()
    defer d.mu.RUnlock()
    
    addrs, ok := d.services[name]
    if !ok {
        return nil, errors.New("service not found")
    }
    return addrs, nil
}

func (d *SimpleDiscovery) Register(name, addr string) error {
    d.mu.Lock()
    defer d.mu.Unlock()
    
    d.services[name] = append(d.services[name], addr)
    return nil
}

func (d *SimpleDiscovery) Deregister(name, addr string) error {
    d.mu.Lock()
    defer d.mu.Unlock()
    
    addrs := d.services[name]
    for i, a := range addrs {
        if a == addr {
            d.services[name] = append(addrs[:i], addrs[i+1:]...)
            break
        }
    }
    return nil
}
```

### 4.4 负载均衡

```go
type LoadBalancer interface {
    Select(addrs []string) string
}

// 轮询
type RoundRobin struct {
    mu    sync.Mutex
    index int
}

func (lb *RoundRobin) Select(addrs []string) string {
    lb.mu.Lock()
    defer lb.mu.Unlock()
    
    if len(addrs) == 0 {
        return ""
    }
    
    addr := addrs[lb.index%len(addrs)]
    lb.index++
    return addr
}

// 随机
type Random struct{}

func (lb *Random) Select(addrs []string) string {
    if len(addrs) == 0 {
        return ""
    }
    return addrs[rand.Intn(len(addrs))]
}

// 加权轮询
type WeightedRoundRobin struct {
    mu      sync.Mutex
    index   int
    weights map[string]int
    current map[string]int
}

func (lb *WeightedRoundRobin) Select(addrs []string) string {
    lb.mu.Lock()
    defer lb.mu.Unlock()
    
    for {
        for _, addr := range addrs {
            if lb.current[addr] < lb.weights[addr] {
                lb.current[addr]++
                return addr
            }
        }
        
        // 重置计数
        for addr := range lb.current {
            lb.current[addr] = 0
        }
    }
}
```

---

## 五、RPC 与 gRPC

### 5.1 gRPC 简介

gRPC 是 Google 开源的高性能 RPC 框架：

```
┌─────────────────────────────────────────────────────────────┐
│                      gRPC 特点                               │
├─────────────────────────────────────────────────────────────┤
│  1. HTTP/2 传输：多路复用、流式传输、头部压缩               │
│  2. Protobuf 序列化：高效的二进制格式                       │
│  3. 强类型：通过 .proto 文件定义接口                        │
│  4. 多语言支持：Go、C++、Java、Python 等                    │
│  5. 四种通信模式：一元、服务端流、客户端流、双向流          │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 gRPC vs 标准库 RPC

| 特性 | 标准库 RPC | gRPC |
|------|-----------|------|
| 传输协议 | HTTP/1.1 | HTTP/2 |
| 序列化 | Gob/JSON | Protobuf |
| 流式传输 | 不支持 | 支持 |
| 多语言 | Go only | 多语言 |
| 性能 | 中等 | 高 |
| 服务治理 | 无 | 拦截器、元数据等 |

### 5.3 选择建议

```
使用标准库 RPC：
- 简单的 Go 内部服务
- 快速原型开发
- 不需要跨语言

使用 gRPC：
- 微服务架构
- 需要高性能
- 需要跨语言
- 需要流式传输
```

---

## 参考资料

- [Go语言高级编程（第2版）](https://github.com/chai2010/advanced-go-programming-book)
- [Go net/rpc 文档](https://golang.org/pkg/net/rpc/)
- [gRPC 官方文档](https://grpc.io/)
- [JSON-RPC 规范](https://www.jsonrpc.org/)
