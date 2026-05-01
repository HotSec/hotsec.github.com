# HTTP 协议详解

---

## 一、HTTP 基础

### 1.1 请求/响应格式

```
# 请求
POST /api/users HTTP/1.1
Host: example.com
Content-Type: application/json
Authorization: Bearer token123

{"name": "Alice", "age": 25}

# 响应
HTTP/1.1 201 Created
Content-Type: application/json
Cache-Control: max-age=3600

{"id": 1, "name": "Alice", "age": 25}
```

### 1.2 请求方法

| 方法 | 幂等 | 安全 | 用途 |
|------|------|------|------|
| GET | ✅ | ✅ | 获取资源 |
| POST | ❌ | ❌ | 创建资源 |
| PUT | ✅ | ❌ | 全量更新 |
| PATCH | ❌ | ❌ | 部分更新 |
| DELETE | ✅ | ❌ | 删除资源 |
| HEAD | ✅ | ✅ | 获取头部 |
| OPTIONS | ✅ | ✅ | CORS 预检 |

### 1.3 状态码

| 范围 | 类别 | 常见状态码 |
|------|------|-----------|
| 1xx | 信息 | 100 Continue |
| 2xx | 成功 | 200 OK, 201 Created, 204 No Content |
| 3xx | 重定向 | 301 永久, 302 临时, 304 Not Modified |
| 4xx | 客户端错误 | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests |
| 5xx | 服务端错误 | 500 Internal Error, 502 Bad Gateway, 503 Unavailable |

---

## 二、HTTP/1.1

### 2.1 Keep-Alive

```
# 持久连接，复用 TCP
Connection: keep-alive
Keep-Alive: timeout=60, max=100
```

### 2.2 管道化 (Pipelining)

```
请求1 → 请求2 → 请求3
响应1 → 响应2 → 响应3

# 队头阻塞 (Head-of-Line Blocking)
# 响应1 未完成，响应2/3 必须等待
```

### 2.3 缓存

```
# 强缓存
Cache-Control: max-age=3600
Expires: Wed, 30 Apr 2026 00:00:00 GMT

# 协商缓存
ETag: "abc123"
Last-Modified: Tue, 29 Apr 2025 12:00:00 GMT

# 客户端请求
If-None-Match: "abc123"
If-Modified-Since: Tue, 29 Apr 2025 12:00:00 GMT

# 304 Not Modified → 使用缓存
```

---

## 三、HTTP/2

### 3.1 核心改进

| 特性 | HTTP/1.1 | HTTP/2 |
|------|----------|--------|
| 传输格式 | 文本 | 二进制帧 |
| 多路复用 | ❌ | ✅ |
| 头部压缩 | ❌ | HPACK |
| 服务端推送 | ❌ | ✅ |
| 优先级 | ❌ | ✅ |
| 队头阻塞 | TCP 层 | TCP 层 |

### 3.2 二进制帧

```
┌──────────────────────────────────┐
│ Length (3) │ Type (1) │ Flags (1) │
│ R (1) │ Stream Identifier (31)   │
│ Payload...                       │
└──────────────────────────────────┘

帧类型:
- DATA: 请求/响应体
- HEADERS: 请求/响应头
- SETTINGS: 连接配置
- WINDOW_UPDATE: 流控
- PUSH_PROMISE: 服务端推送
- PING: 心跳
- GOAWAY: 关闭连接
```

### 3.3 多路复用

```
Stream 1: [HEADERS][DATA][DATA]
Stream 3: [HEADERS][DATA]
Stream 5: [HEADERS][DATA][DATA][DATA]

# 同一 TCP 连接上交错发送多个流
# 解决 HTTP 层队头阻塞
# TCP 层队头阻塞仍存在
```

### 3.4 HPACK 头部压缩

```
静态表: 61 个常见头部
  :method GET → index 2
  :path / → index 4

动态表: 自定义头部
  cookie: abc123 → index 62

哈夫曼编码: 压缩字符串值
```

---

## 四、HTTP/3 (QUIC)

### 4.1 核心改进

| 特性 | HTTP/2 | HTTP/3 |
|------|--------|--------|
| 传输层 | TCP | QUIC (UDP) |
| 队头阻塞 | TCP 层存在 | 完全消除 |
| 连接建立 | 1-RTT TCP + 1-RTT TLS | 1-RTT (0-RTT 恢复) |
| 连接迁移 | ❌ (IP 变化断连) | ✅ (Connection ID) |
| 拥塞控制 | 内核实现 | 用户态实现 |

### 4.2 QUIC 连接建立

```
首次连接 (1-RTT):
Client → Server: ClientHello + QUIC Config
Server → Client: ServerHello + Certificate + QUIC Config
Client → Server: HTTP Request

恢复连接 (0-RTT):
Client → Server: ClientHello + 0-RTT Data (HTTP Request)
Server → Client: ServerHello + Response
```

### 4.3 彻底消除队头阻塞

```
HTTP/2 (TCP):
Stream 1: ████░░░░ ← 丢包，等待重传
Stream 2: ....░░░░ ← 被阻塞！
Stream 3: ....░░░░ ← 被阻塞！

HTTP/3 (QUIC):
Stream 1: ████░░░░ ← 丢包，等待重传
Stream 2: ████████ ← 不受影响！
Stream 3: ████████ ← 不受影响！
```

---

## 五、HTTPS

### 5.1 TLS 握手 (1.3)

```
Client → Server: ClientHello (支持的TLS版本+密码套件+Key Share)
Server → Client: ServerHello (选定密码套件+Key Share+Certificate)
Client → Server: Finished (加密握手完成)
Client → Server: HTTP Request (加密数据)

# TLS 1.3: 1-RTT 握手
# TLS 1.2: 2-RTT 握手
```

### 5.2 密码套件

```
TLS_AES_128_GCM_SHA256
TLS_AES_256_GCM_SHA384
TLS_CHACHA20_POLY1305_SHA256

# TLS 1.3 移除了不安全的算法:
# - RC4, DES, 3DES
# - CBC 模式
# - MD5, SHA-1
# - RSA 密钥交换 (仅保留 ECDHE)
```

---

## 六、CORS (跨域资源共享)

### 6.1 简单请求

```
GET /api/data HTTP/1.1
Origin: https://frontend.com

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://frontend.com
Access-Control-Allow-Credentials: true
```

### 6.2 预检请求

```
OPTIONS /api/data HTTP/1.1
Origin: https://frontend.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://frontend.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### 6.3 Go CORS 中间件

```go
func CORS() gin.HandlerFunc {
    return func(c *gin.Context) {
        origin := c.Request.Header.Get("Origin")
        allowed := []string{"https://frontend.com", "http://localhost:3000"}
        if contains(allowed, origin) {
            c.Header("Access-Control-Allow-Origin", origin)
        }
        c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
        c.Header("Access-Control-Allow-Credentials", "true")
        c.Header("Access-Control-Max-Age", "86400")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    }
}
```

---

## 七、HTTP 版本对比

| 维度 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|--------|--------|
| 传输层 | TCP | TCP | QUIC/UDP |
| 格式 | 文本 | 二进制帧 | 二进制帧 |
| 多路复用 | ❌ | ✅ | ✅ |
| 队头阻塞 | HTTP+TCP | TCP | 无 |
| 头部压缩 | ❌ | HPACK | QPACK |
| 连接建立 | 1-RTT | 1-RTT+TLS | 1-RTT/0-RTT |
| 连接迁移 | ❌ | ❌ | ✅ |
| 服务端推送 | ❌ | ✅ | ✅ |
| 浏览器支持 | 全部 | 97%+ | 90%+ |
