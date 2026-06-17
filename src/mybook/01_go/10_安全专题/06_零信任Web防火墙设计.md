# 零信任 Web 防火墙 - 设计规格 (ZT-WAF)

## 1. 项目概述

| 属性 | 值 |
|------|------|
| **项目名称** | ZT-WAF (Zero Trust Web Application Firewall) |
| **项目定位** | 反向代理 + WAF + 零信任安全网关 |
| **核心技术栈** | C++ (数据平面) + Go (控制平面) |
| **架构模式** | 分层架构 (Control Plane + Data Plane 分离) |
| **部署模式** | 集群部署，水平扩展 |

### 1.1 设计原则

1. **永不信任，始终验证** (Zero Trust Core)
2. **默认拒绝** (Deny by Default)
3. **最小权限原则** (Least Privilege)
4. **持续验证** (Continuous Verification)
5. **高性能，低延迟** (High Performance)
6. **安全审计完整** (Complete Audit Trail)

### 1.2 范围拆分

本项目规模较大，拆分为以下子项目，各自独立规格 → 计划 → 实现：

| 阶段 | 子项目 | 内容 |
|------|--------|------|
| **P0** | C++ 数据平面核心 | Listener + Router + Upstream（反向代理基础） |
| **P1** | WAF 引擎 | AC 自动机 + 正则引擎 + Bot 管理 + 规则热更新 |
| **P2** | 零信任引擎 | 身份认证 + 设备评估 + 风险评估 + 策略引擎 |
| **P3** | Go 控制平面 | Auth Service + Rules Engine + Risk Engine + Monitor |
| **P4** | 集群与部署 | 会话同步 + 分布式限流 + K8s 部署 + 监控集成 |

**本规格覆盖全部子项目的设计**，实现计划从 P0 开始逐步推进。

---

## 2. 整体架构

```
┌──────────────────────────────────────────────────────────────────────┐
│                        客户端请求 (Client Request)                    │
│                            HTTP/HTTPS/HTTP2                          │
└──────────────────────────────────────┬───────────────────────────────┘
                                       │
┌──────────────────────────────────────▼───────────────────────────────┐
│                        负载均衡层 (Load Balancer)                     │
│                     (Nginx / LVS / Cloud LB)                         │
│                          TCP 连接分发                                 │
└──────────────────────────────────────┬───────────────────────────────┘
                                       │
┌──────────────────────────────────────▼───────────────────────────────┐
│                     C++ 数据平面集群 (Data Plane Cluster)             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    集群节点 Node-1                              │  │
│  │                                                                │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │  │
│  │  │Listener │─▶│ Router  │─▶│ WAF     │─▶│ Zero    │         │  │
│  │  │ 监听层  │  │ 路由层  │  │ Engine  │  │ Trust   │         │  │
│  │  │         │  │         │  │(含Bot   │  │ Engine  │         │  │
│  │  │         │  │         │  │ 管理)   │  │         │         │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └────┬────┘         │  │
│  │                                               │               │  │
│  │  ┌───────────────────────────────────────────┘               │  │
│  │  │                                                            │  │
│  │  ▼                                                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐              │  │
│  │  │ Rate Limiter│─▶│ Upstream    │─▶│ 响应检测 │              │  │
│  │  │ 限流层      │  │ 转发层      │  │(WAF)    │              │  │
│  │  └─────────────┘  └─────────────┘  └─────────┘              │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │              本地缓存层 (Local Cache)                    │ │  │
│  │  │  • 令牌缓存 (JWT/Session → 用户信息, TTL 30s)           │ │  │
│  │  │  • 风险评分缓存 (用户/IP → 评分, TTL 60s)               │ │  │
│  │  │  • 规则本地副本 (从控制平面同步)                        │ │  │
│  │  │  • ML 模型本地副本 (从控制平面同步)                     │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │              Session Manager (会话管理)                  │ │  │
│  │  │  • 本地会话状态缓存                                      │ │  │
│  │  │  • Redis 会话读取/写入 (集群共享)                        │ │  │
│  │  │  • 会话过期检查                                          │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    集群节点 Node-N                            │  │
│  │           (与 Node-1 结构相同)                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  • gRPC 与控制平面通信（规则/策略/模型同步）                           │
│  • Redis 共享会话状态和分布式限流计数器                                │
└──────────────────────────────────────────────────────────────────────┘
                                          │
┌─────────────────────────────────────────┴──────────────────────────────┐
│                        Go 控制平面 (Control Plane)                      │
│                                                                      │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐   │
│  │   Auth Service   │   │   Rules Engine   │   │   Risk Engine    │   │
│  │   认证服务        │   │   规则引擎        │   │   风险引擎        │   │
│  │                  │   │                  │   │                  │   │
│  │ • 令牌签发/撤销  │   │ • WAF规则管理    │   │ • 行为分析        │   │
│  │ • OIDC/OAuth2    │   │ • 零信任策略管理  │   │ • 威胁情报        │   │
│  │ • SAML/JWT       │   │ • 规则编译/下发  │   │ • 异常检测        │   │
│  │ • 设备注册管理    │   │ • CVE漏洞库     │   │ • 信任评分计算    │   │
│  │ • 会话创建/销毁  │   │ • ML模型管理     │   │ • 评分缓存查询    │   │
│  └────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘   │
│           │                      │                      │             │
│           └──────────────────────┼──────────────────────┘             │
│                                  │                                   │
│  ┌──────────────────┐   ┌────────┴─────────┐   ┌──────────────────┐   │
│  │   Monitor/Alert  │   │   Data Store     │   │   Web UI / API   │   │
│  │   监控/告警        │   │   数据存储        │   │   管理界面/API    │   │
│  │ • 指标收集       │   │ • PostgreSQL     │   │ • REST API       │   │
│  │ • 日志管理       │   │ • Redis          │   │ • Web 管理界面    │   │
│  │ • 告警触发       │   │ • ClickHouse     │   │ • 配置管理        │   │
│  │ • 审计日志       │   │                  │   │                  │   │
│  └──────────────────┘   └──────────────────┘   └──────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                                          │
┌─────────────────────────────────────────┴──────────────────────────────┐
│                        后端应用 (Backend Application)                   │
│                             HTTP 响应                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.1 职责边界

| 组件 | 归属 | 职责边界 |
|------|------|---------|
| **C++ Session Manager** | 数据平面 | 本地会话缓存、Redis 读写、会话过期检查。**不负责**会话创建/销毁 |
| **Go Auth Service** | 控制平面 | 令牌签发/撤销、会话创建/销毁、设备注册管理。**不负责**请求级会话检查 |
| **C++ WAF Engine** | 数据平面 | 攻击检测、Bot 管理（作为 WAF 子模块）、规则匹配 |
| **Go Rules Engine** | 控制平面 | 规则存储/编译/下发、CVE 库管理、ML 模型管理 |
| **C++ Zero Trust Engine** | 数据平面 | 请求级身份验证（查本地缓存）、设备评估、策略执行 |
| **Go Risk Engine** | 控制平面 | 行为分析、威胁情报、信任评分计算（结果缓存供数据平面查询） |

---

## 3. C++ 数据平面详细设计

### 3.1 核心模块

| 模块 | 职责 | 技术实现 |
|------|------|----------|
| **Listener** | 监听端口、接收连接、TLS 终止 | epoll/IO_uring + OpenSSL |
| **Router** | 请求路由、虚拟主机匹配、路径匹配 | Radix Tree / Trie |
| **WAF Engine** | 攻击检测、规则匹配、Bot 管理（子模块）、Payload 分析 | AC 自动机 + 正则引擎 + ML |
| **Zero Trust** | 身份验证（本地缓存）、设备评估、策略执行、风险决策 | JWT 本地验证 + 策略引擎 |
| **Session Manager** | 本地会话缓存、Redis 会话读写、过期检查 | Redis + LRU 本地缓存 |
| **Rate Limiter** | 限流、熔断、流量整形 | Token Bucket + Leaky Bucket |
| **Upstream** | 上游转发、负载均衡、连接池 | HTTP/1.1 + HTTP/2 + QUIC |
| **Local Cache** | 令牌缓存、风险评分缓存、规则/模型本地副本 | LRU Cache + TTL 过期 |

### 3.2 请求处理流水线（明确顺序）

```
请求进入
    │
    ▼
1. Listener (TLS 终止, 连接管理)
    │
    ▼
2. Router (虚拟主机匹配, 路径路由)
    │
    ▼
3. WAF Engine (攻击检测 + Bot 管理)
    │  ├─ BLOCK → 返回 403
    │  ├─ CHALLENGE → 返回验证码挑战
    │  └─ PASS → 继续
    ▼
4. Zero Trust Engine (身份验证 + 策略执行)
    │  ├─ 4a. 查本地令牌缓存 → 命中则跳过 gRPC
    │  ├─ 4b. 未命中 → gRPC 验证令牌 (Go Auth Service)
    │  ├─ 4c. 查本地风险评分缓存 → 命中则跳过 gRPC
    │  ├─ 4d. 未命中 → gRPC 获取风险评分 (Go Risk Engine)
    │  ├─ 4e. Session Manager 查询会话状态 (本地 → Redis)
    │  ├─ 4f. 策略引擎评估 (条件表达式求值)
    │  └─ 决策 → ALLOW / DENY / CHALLENGE
    ▼
5. Rate Limiter (限流 + 熔断)
    │  ├─ REJECT → 返回 429
    │  └─ PASS → 继续
    ▼
6. Upstream (负载均衡, 转发到后端)
    │
    ▼
7. 响应检测 (WAF 响应检查, 敏感信息过滤)
    │
    ▼
响应返回客户端
```

**缓存策略（解决性能问题）**：

| 缓存项 | 缓存位置 | TTL | 未命中行为 |
|--------|---------|-----|-----------|
| 令牌验证结果 | 本地 LRU | 30s | gRPC 调用 Go Auth Service |
| 风险评分 | 本地 LRU | 60s | gRPC 调用 Go Risk Engine |
| 会话状态 | 本地 LRU → Redis | 5min | Redis 查询 |
| WAF 规则 | 本地内存 | 控制平面推送更新 | 启动时全量拉取 |
| ML 模型 | 本地内存 | 控制平面推送更新 | 启动时全量拉取 |
| 零信任策略 | 本地内存 | 控制平面推送更新 | 启动时全量拉取 |

**性能预期**：缓存命中时，请求处理路径无 gRPC 调用，延迟 < 0.5ms。缓存未命中时引入 1 次 gRPC 调用（~1ms），p99 延迟 < 1ms 依赖 95%+ 缓存命中率。

### 3.3 WAF 引擎架构

```
WAF Engine
├── 规则加载器 (Rule Loader)
│   ├── 启动时从控制平面全量拉取规则
│   ├── 运行时接收 gRPC 流式增量更新
│   ├── 规则编译为高效匹配格式（AC 自动机 / 编译正则）
│   └── 热更新（读写锁切换，无锁读取）
│
├── 规则匹配引擎 (Rule Engine)
│   ├── AC 自动机（多模式字符串匹配，O(n) 复杂度）
│   ├── 正则表达式引擎（复杂模式，预编译为 DFA）
│   ├── 语义分析（SQL 注入/XSS 语义解析）
│   └── ML 模型推理（0day 检测，模型从控制平面同步）
│
├── Bot 管理 (Bot Management) — WAF 子模块
│   ├── 签名识别（User-Agent、请求特征库）
│   ├── 行为分析（请求频率、路径模式、鼠标轨迹）
│   ├── 挑战验证（JavaScript 挑战、验证码）
│   └── 指纹识别（TLS 指纹 JA3、浏览器指纹）
│
├── 规则类型
│   ├── SQL 注入规则（UNION、OR 1=1、盲注、时间盲注）
│   ├── XSS 规则（<script>、javascript:、事件处理器、DOM XSS）
│   ├── SSRF 规则（内网 IP、云元数据、DNS Rebinding）
│   ├── 命令执行规则（system、exec、bash -c、反引号）
│   ├── 文件上传规则（.php、.jsp、恶意文件特征）
│   ├── CSRF 规则（Token 验证、SameSite 检查）
│   ├── 路径遍历规则（../、%2e%2e、双重编码）
│   └── 自定义规则（用户配置）
│
└── 动作处理 (Action Handler)
    ├── BLOCK（阻断请求，返回 403）
    ├── LOG（仅记录，放行请求）
    ├── REDIRECT（重定向到指定 URL）
    ├── CAPTCHA（返回验证码挑战）
    └── CHALLENGE（JavaScript 挑战）
```

### 3.4 零信任引擎架构

```
Zero Trust Engine
├── 身份认证 (Identity Auth)
│   ├── JWT 本地验证（RS256/ES256，公钥从控制平面同步）
│   ├── 令牌缓存查询（命中跳过 gRPC，未命中调用 Go Auth Service）
│   ├── API Key 验证（本地查缓存，未命中查 Redis）
│   └── OIDC/OAuth2 令牌内省（gRPC → Go Auth Service）
│
├── 设备评估 (Device Trust)
│   ├── 设备指纹验证（浏览器指纹、硬件信息）
│   ├── TLS 证书验证（mTLS，客户端证书校验）
│   ├── 设备合规检查（查询 Go Auth Service 设备注册表）
│   └── 地理位置验证（IP 归属地，本地 GeoIP 库）
│
├── 风险评估 (Risk Assessment)
│   ├── 风险评分缓存查询（命中跳过 gRPC）
│   ├── gRPC 获取评分（Go Risk Engine 计算）
│   ├── 本地规则补充（IP 黑名单本地副本、频率检测）
│   └── 信任评分计算（0-100，综合多维因素）
│
├── 策略引擎 (Policy Engine)
│   ├── 策略匹配（按 resource 路径匹配）
│   ├── 条件表达式求值（见 3.6 节语法定义）
│   ├── 授权决策（ALLOW / DENY / CHALLENGE）
│   └── 最小权限原则（默认 DENY）
│
└── 持续验证 (Continuous Verification)
    ├── 每个请求重新评估（缓存命中时 < 0.1ms）
    ├── 会话定期刷新（TTL 过期后重新验证）
    └── 权限动态调整（信任评分变化触发策略重评估）
```

### 3.5 关键数据结构

```cpp
// 请求上下文
struct RequestContext {
    std::string client_ip;
    std::string user_id;
    std::string device_id;
    double trust_score;
    bool authenticated;
    std::string route_name;
    std::vector<std::string> matched_rules;
    uint64_t request_id;
    std::chrono::time_point<std::chrono::system_clock> start_time;
};

// WAF 规则
struct WafRule {
    std::string id;
    std::string name;
    std::string severity; // CRITICAL/HIGH/MEDIUM/LOW
    std::string category; // SQLI/XSS/SSRF/COMMAND_EXEC...
    std::string pattern;
    std::string action; // BLOCK/LOG/REDIRECT/CAPTCHA/CHALLENGE
    bool enabled;
    std::string description;
};

// 零信任策略
struct ZeroTrustPolicy {
    std::string id;
    std::string name;
    std::string resource; // URL 路径通配符，如 /api/admin/*
    std::string effect; // ALLOW/DENY
    std::vector<Condition> conditions; // 结构化条件（见 3.6）
    std::string trust_level; // HIGH/MEDIUM/LOW
};
```

### 3.6 策略条件表达式语法

策略条件使用**结构化表达式**，非自由文本字符串，避免解析歧义：

```cpp
// 条件结构
struct Condition {
    std::string field;    // 字段名
    std::string op;       // 操作符: ==, !=, >=, <=, >, <, in, not_in
    Value value;          // 值（字符串/数字/布尔/列表）
};

// 字段定义
// trust_score     → double (0-100)
// authenticated   → bool
// device.compliant → bool
// user.role       → string
// client.ip       → string
// request.method  → string
// request.path    → string
```

**YAML 配置示例**（对应结构化条件）：

```yaml
conditions:
  - field: "trust_score"
    op: ">="
    value: 80
  - field: "device.compliant"
    op: "=="
    value: true
  - field: "user.role"
    op: "in"
    value: ["admin", "superadmin"]
```

**求值规则**：
- 多个条件之间为 **AND** 关系（全部满足才 ALLOW）
- 策略匹配顺序：最长路径前缀匹配
- 默认策略：DENY ALL（无匹配策略时拒绝）

---

## 4. Go 控制平面详细设计

### 4.1 核心模块

| 模块 | 职责 | 技术实现 |
|------|------|----------|
| **Auth Service** | 令牌签发/撤销、会话创建/销毁、设备注册管理 | OIDC/OAuth2/SAML 协议实现 |
| **Rules Engine** | WAF 规则管理、零信任策略管理、规则编译下发、CVE 库、ML 模型管理 | gRPC 服务 |
| **Risk Engine** | 行为分析、异常检测、威胁情报、信任评分计算 | ML 模型 + 规则引擎 |
| **Monitor/Alert** | 监控指标、日志收集、告警触发、审计日志 | Prometheus + Loki |
| **API/UI** | REST API、管理界面、配置管理 | Gin + React |

### 4.2 认证服务架构

```
Auth Service
├── OIDC Provider
│   ├── Authorization Endpoint
│   ├── Token Endpoint
│   ├── Userinfo Endpoint
│   └── JWKS Endpoint（公钥供 C++ 本地验证 JWT）
│
├── OAuth2 Server
│   ├── Authorization Code Flow
│   ├── Client Credentials Flow
│   ├── Resource Owner Password Flow
│   └── Refresh Token Flow
│
├── SAML Service Provider
│   ├── SAML 2.0 支持
│   ├── Assertion 解析
│   └── Attribute Mapping
│
├── JWT Manager
│   ├── Token 生成（签发）
│   ├── Token 撤销（写入 Redis 黑名单）
│   ├── JWKS 公钥发布（供 C++ 数据平面同步）
│   └── 公钥轮换（定期更新，通知数据平面）
│
├── Session Manager (控制平面侧)
│   ├── 会话创建（登录成功后）
│   ├── 会话销毁（登出/过期）
│   └── 会话元数据存储（PostgreSQL）
│
└── Device Registry
    ├── 设备注册
    ├── 设备认证
    ├── 设备合规检查
    └── 设备指纹管理
```

**会话管理职责边界**：
- **Go Auth Service**：会话的**生命周期管理**（创建、销毁、元数据存储）
- **C++ Session Manager**：会话的**请求级检查**（本地缓存 → Redis 查询、过期检查）

### 4.3 规则引擎架构

```
Rules Engine
├── Rule Store
│   ├── PostgreSQL（持久化存储，规则/策略/配置）
│   ├── Redis（热数据缓存）
│   └── GitOps（规则版本管理，可选）
│
├── Rule Compiler
│   ├── YAML/JSON 规则解析（API 提交或文件导入）
│   ├── 规则优化（合并、去重、优先级排序）
│   └── 规则编译为 C++ 可执行格式（序列化 protobuf）
│
├── Rule Distributor
│   ├── gRPC 流式下发（SyncRules / SyncPolicies）
│   ├── 增量更新（仅推送变更的规则）
│   ├── 版本控制（每条规则带版本号）
│   └── 回滚机制（支持回退到上一个版本）
│
├── CVE Database
│   ├── CVE 漏洞库（定时从 NVD/GHSA 同步）
│   ├── 用途：检测后端应用响应中的组件版本，匹配已知漏洞
│   ├── 工作方式：WAF 引擎解析响应头/响应体中的组件信息
│   │             → 上报控制平面 → 匹配 CVE 库 → 生成告警
│   └── 漏洞影响评估（CVSS 评分）
│
└── ML Model Manager
    ├── 模型存储（PostgreSQL + 文件存储）
    ├── 模型版本管理
    ├── 模型下发（gRPC 流式同步到 C++ 数据平面）
    └── 模型更新（训练 → 验证 → 灰度发布 → 全量更新）
```

### 4.4 风险引擎架构

```
Risk Engine
├── Behavioral Analysis
│   ├── 用户行为建模（正常行为基线）
│   ├── 异常模式检测（偏离基线的行为）
│   ├── 会话风险评估（会话内行为分析）
│   └── 行为基线学习（离线训练 + 在线更新）
│
├── Threat Intelligence
│   ├── IP 黑名单（内置 + 外部订阅）
│   ├── 域名黑名单
│   ├── 恶意 Payload 特征
│   └── 威胁情报订阅（定时更新）
│
├── Anomaly Detection
│   ├── 统计异常检测（Z-Score / IQR）
│   ├── 机器学习异常检测（Isolation Forest / Autoencoder）
│   ├── 实时评分（流式计算）
│   └── 报警阈值管理
│
└── Trust Scoring
    ├── 多维度评分（身份 30% + 设备 30% + 行为 20% + 环境 20%）
    ├── 权重可配置（通过 API 调整）
    ├── 评分缓存（Redis，TTL 60s，供 C++ 数据平面查询）
    └── 动态调整（风险事件触发评分重计算）
```

---

## 5. 数据流

### 5.1 请求数据流（含缓存策略）

```
客户端请求
    │
    ▼
1. C++ Listener (接收连接, TLS 终止)
    │
    ▼
2. C++ Router (虚拟主机匹配, 路径路由)
    │
    ▼
3. C++ WAF Engine (攻击检测 + Bot 管理)
    │  ├─ BLOCK → 返回 403
    │  ├─ CHALLENGE → 返回 JS 挑战
    │  └─ PASS → 继续
    ▼
4. C++ Zero Trust Engine
    │  ├─ 4a. JWT 本地验证 (公钥已同步, 无需 gRPC)
    │  ├─ 4b. 令牌缓存查询 → 命中: 跳过 / 未命中: gRPC → Go Auth Service
    │  ├─ 4c. Session Manager: 本地缓存 → Redis (会话状态)
    │  ├─ 4d. 风险评分缓存查询 → 命中: 跳过 / 未命中: gRPC → Go Risk Engine
    │  ├─ 4e. 策略引擎: 条件表达式求值 (本地)
    │  └─ 决策 → ALLOW / DENY / CHALLENGE
    ▼
5. C++ Rate Limiter (限流 + 熔断, Redis 分布式计数)
    │  ├─ REJECT → 返回 429
    │  └─ PASS → 继续
    ▼
6. C++ Upstream (负载均衡, 转发到后端)
    │
    ▼
后端应用
    │
    ▼
7. C++ WAF 响应检测 (敏感信息过滤, 组件指纹提取)
    │  └─ 组件指纹 → gRPC 上报 → Go Rules Engine → CVE 匹配
    ▼
客户端
```

### 5.2 控制平面数据流

```
管理员操作 (Web UI / REST API)
    │
    ▼
Go API Server (Gin)
    │
    ├─ 规则管理 → PostgreSQL (持久化) → Redis (缓存)
    ├─ 策略管理 → PostgreSQL (持久化) → Redis (缓存)
    ├─ 用户管理 → PostgreSQL
    ├─ 设备管理 → PostgreSQL
    └─ 配置管理 → PostgreSQL (配置以 API 为主要管理方式,
                              YAML 文件用于初始化导入和导出备份)
         │
         ▼
Go Rules Engine (编译规则为 protobuf 格式)
    │
    ├─ gRPC Stream → C++ Data Plane (规则/策略增量下发)
    ├─ gRPC Stream → C++ Data Plane (ML 模型同步)
    └─ gRPC Stream → C++ Data Plane (JWKS 公钥更新)
         │
         ▼
C++ Rule Loader (加载规则到本地内存)
    │
    ▼
C++ WAF/ZeroTrust Engine (生效, 无需重启)
```

### 5.3 ML 模型同步数据流

```
Go ML Model Manager
    │
    ├─ 模型训练 (离线/在线)
    ├─ 模型验证 (测试集评估)
    ├─ 灰度发布 (部分节点先更新)
    └─ 全量发布
         │
         ▼
gRPC Stream (SyncModel) → C++ Data Plane
         │
         ▼
C++ ML Engine (加载模型到内存)
    │
    ├─ 模型热切换 (读写锁, 无停机)
    └─ 版本回滚 (保留上一版本)
```

---

## 6. 项目结构

```
zerotrust-waf/
├── cpp/                           # C++ 数据平面
│   ├── include/                   # 头文件
│   │   ├── listener/              # 监听层接口
│   │   ├── router/                # 路由层接口
│   │   ├── waf/                   # WAF 引擎接口 (含 Bot 管理)
│   │   ├── zerotrust/             # 零信任引擎接口
│   │   ├── session/               # 会话管理接口
│   │   ├── rate/                  # 限流接口
│   │   ├── upstream/              # 上游转发接口
│   │   └── cache/                 # 本地缓存接口
│   ├── src/                       # 源文件
│   │   ├── listener/              # 监听层实现
│   │   ├── router/                # 路由层实现
│   │   ├── waf/                   # WAF 引擎实现
│   │   │   ├── ac_automaton.cpp   # AC 自动机
│   │   │   ├── regex_engine.cpp   # 正则引擎
│   │   │   ├── ml_engine.cpp      # ML 推理
│   │   │   └── bot_manager.cpp    # Bot 管理
│   │   ├── zerotrust/             # 零信任引擎实现
│   │   │   ├── auth.cpp           # 身份认证 (JWT 本地验证)
│   │   │   ├── device.cpp         # 设备评估
│   │   │   ├── risk.cpp           # 风险评估 (缓存 + gRPC)
│   │   │   └── policy.cpp         # 策略引擎 (条件求值)
│   │   ├── session/               # 会话管理实现
│   │   ├── rate/                  # 限流实现
│   │   ├── upstream/              # 上游转发实现
│   │   ├── cache/                 # 本地缓存实现 (LRU + TTL)
│   │   ├── grpc_client/           # gRPC 客户端
│   │   └── main.cpp               # 入口
│   ├── tests/                     # 测试
│   ├── CMakeLists.txt             # 构建配置
│   └── third_party/               # 第三方库
│       ├── openssl/               # TLS
│       ├── grpc/                  # gRPC
│       ├── redis++/               # Redis 客户端
│       └── rapidjson/             # JSON 解析
│
├── go/                            # Go 控制平面
│   ├── cmd/
│   │   ├── controller/            # 控制器入口
│   │   └── api/                   # API 服务器入口
│   ├── internal/
│   │   ├── auth/                  # 认证服务
│   │   │   ├── oidc/              # OIDC 实现
│   │   │   ├── oauth2/            # OAuth2 实现
│   │   │   ├── saml/              # SAML 实现
│   │   │   ├── jwt/               # JWT 管理 (签发/撤销/JWKS)
│   │   │   └── device/            # 设备注册管理
│   │   ├── rules/                 # 规则引擎
│   │   │   ├── compiler/          # 规则编译
│   │   │   ├── distributor/       # 规则下发 (gRPC Stream)
│   │   │   ├── cve/               # CVE 数据库
│   │   │   └── model/             # ML 模型管理
│   │   ├── risk/                  # 风险引擎
│   │   │   ├── behavioral/        # 行为分析
│   │   │   ├── threat/            # 威胁情报
│   │   │   └── anomaly/           # 异常检测
│   │   ├── monitor/               # 监控服务
│   │   │   ├── metrics/           # 指标收集
│   │   │   ├── logging/           # 日志管理
│   │   │   └── alert/             # 告警服务
│   │   └── api/                   # API 路由
│   ├── pkg/
│   │   ├── proto/                 # gRPC 协议定义
│   │   ├── config/                # 配置管理
│   │   ├── database/              # 数据库操作
│   │   └── utils/                 # 工具函数
│   ├── web/                       # 前端管理界面
│   ├── go.mod
│   └── go.sum
│
├── deploy/                        # 部署配置
│   ├── docker/
│   │   ├── Dockerfile.cpp
│   │   ├── Dockerfile.go
│   │   └── docker-compose.yml
│   ├── kubernetes/
│   │   ├── data-plane.yaml
│   │   ├── control-plane.yaml
│   │   └── ingress.yaml
│   └── config/
│       ├── waf_rules.yaml         # 初始化规则 (首次导入用)
│       ├── zero_trust_policy.yaml # 初始化策略 (首次导入用)
│       └── rate_limit.yaml        # 初始化限流 (首次导入用)
│
├── docs/                          # 文档
├── LICENSE
└── README.md
```

---

## 7. 配置管理

### 7.1 配置管理方式

| 方式 | 用途 | 说明 |
|------|------|------|
| **REST API** | 主要管理方式 | 日常规则/策略/配置的增删改查 |
| **YAML 文件** | 初始化导入 / 导出备份 | 首次部署时批量导入，或定期导出备份 |
| **PostgreSQL** | 持久化存储 | 所有配置持久化到数据库 |
| **Redis** | 热数据缓存 | 规则/策略缓存，加速读取 |

**配置流程**：
1. 管理员通过 API 创建/修改规则 → 写入 PostgreSQL → 更新 Redis 缓存
2. Rules Engine 编译规则 → gRPC 推送到 C++ 数据平面
3. YAML 文件通过 `POST /api/v1/rules/import` 导入

### 7.2 WAF 规则配置（YAML 格式，用于导入/导出）

```yaml
waf:
  rules:
    - id: "sqli-001"
      name: "SQL Injection - UNION"
      severity: "CRITICAL"
      category: "SQL_INJECTION"
      pattern: "(?i)union.*select|select.*union"
      action: "BLOCK"
      description: "检测 UNION SQL 注入"

    - id: "xss-001"
      name: "XSS - Script Tag"
      severity: "HIGH"
      category: "XSS"
      pattern: "(?i)<script[^>]*>.*<\\/script>|<script[^>]*>"
      action: "BLOCK"
      description: "检测脚本标签注入"

    - id: "ssrf-001"
      name: "SSRF - Metadata"
      severity: "CRITICAL"
      category: "SSRF"
      pattern: "(?i)169\\.254\\.169\\.254|metadata\\.google\\.internal|10\\.0\\.0\\.|172\\.1[6-9]\\.|172\\.2[0-9]\\.|172\\.3[0-1]\\."
      action: "BLOCK"
      description: "检测云元数据访问"

  default_action: "LOG"
  log_level: "INFO"
```

### 7.3 零信任策略配置（结构化条件）

```yaml
zero_trust:
  policies:
    - id: "admin-access"
      name: "管理员访问控制"
      resource: "/api/admin/*"
      effect: "ALLOW"
      conditions:
        - field: "trust_score"
          op: ">="
          value: 80
        - field: "device.compliant"
          op: "=="
          value: true
        - field: "user.role"
          op: "in"
          value: ["admin", "superadmin"]
      trust_level: "HIGH"

    - id: "api-access"
      name: "API 访问控制"
      resource: "/api/*"
      effect: "ALLOW"
      conditions:
        - field: "trust_score"
          op: ">="
          value: 50
        - field: "authenticated"
          op: "=="
          value: true
      trust_level: "MEDIUM"

    - id: "public-access"
      name: "公开访问"
      resource: "/public/*"
      effect: "ALLOW"
      conditions: []
      trust_level: "LOW"

  default_policy: "DENY"  # 无匹配策略时默认拒绝

  trust_scoring:
    weights:
      identity: 0.3
      device: 0.3
      behavior: 0.2
      environment: 0.2
    thresholds:
      high: 80
      medium: 50
      low: 20
```

### 7.4 限流配置

```yaml
rate_limit:
  global:
    requests_per_second: 10000
    burst: 20000

  per_ip:
    requests_per_minute: 600
    burst: 1200

  per_user:
    requests_per_minute: 300
    burst: 600

  endpoints:
    - path: "/api/login"
      requests_per_minute: 10
      burst: 20

  circuit_breaker:
    failure_threshold: 50
    recovery_timeout: 300
    min_requests: 100
```

---

## 8. API 设计

### 8.1 WAF 规则 API

```http
# 获取所有规则
GET /api/v1/waf/rules

# 获取单个规则
GET /api/v1/waf/rules/:id

# 创建规则
POST /api/v1/waf/rules
{
  "name": "SQL Injection",
  "severity": "CRITICAL",
  "category": "SQL_INJECTION",
  "pattern": "union.*select",
  "action": "BLOCK"
}

# 更新规则
PUT /api/v1/waf/rules/:id

# 删除规则
DELETE /api/v1/waf/rules/:id

# 批量导入规则 (YAML/JSON)
POST /api/v1/waf/rules/import

# 导出规则 (YAML)
GET /api/v1/waf/rules/export
```

### 8.2 零信任策略 API

```http
# 获取所有策略
GET /api/v1/zero-trust/policies

# 创建策略
POST /api/v1/zero-trust/policies
{
  "name": "Admin Access",
  "resource": "/api/admin/*",
  "effect": "ALLOW",
  "conditions": [
    {"field": "trust_score", "op": ">=", "value": 80},
    {"field": "device.compliant", "op": "==", "value": true}
  ],
  "trust_level": "HIGH"
}

# 更新策略
PUT /api/v1/zero-trust/policies/:id

# 删除策略
DELETE /api/v1/zero-trust/policies/:id
```

### 8.3 认证 API

```http
# OIDC 授权
GET /oauth/authorize?response_type=code&client_id=xxx&redirect_uri=xxx

# 获取令牌
POST /oauth/token

# 用户信息
GET /oauth/userinfo

# JWKS 公钥 (供 C++ 数据平面同步)
GET /oauth/jwks

# 设备注册
POST /api/v1/devices/register

# 验证令牌 (C++ 数据平面调用)
POST /api/v1/token/validate
```

### 8.4 监控 API

```http
# 获取指标
GET /api/v1/metrics

# 获取日志
GET /api/v1/logs

# 获取告警
GET /api/v1/alerts

# 获取信任评分
GET /api/v1/risk/trust-score?user_id=xxx
```

---

## 9. gRPC 协议定义

### 9.1 控制平面 → 数据平面

```protobuf
service ControlPlane {
  // 规则同步（流式增量）
  rpc SyncRules(SyncRulesRequest) returns (stream RuleUpdate);

  // 策略同步（流式增量）
  rpc SyncPolicies(SyncPoliciesRequest) returns (stream PolicyUpdate);

  // JWKS 公钥同步（流式，公钥轮换时推送）
  rpc SyncJWKS(SyncJWKSRequest) returns (stream JWKSUpdate);

  // ML 模型同步（流式，模型更新时推送）
  rpc SyncModel(SyncModelRequest) returns (stream ModelUpdate);

  // 验证令牌（缓存未命中时调用）
  rpc ValidateToken(TokenRequest) returns (TokenResponse);

  // 获取风险评分（缓存未命中时调用）
  rpc GetRiskScore(RiskRequest) returns (RiskResponse);

  // 上报统计（数据平面 → 控制平面）
  rpc ReportStats(StatsReport) returns (StatsResponse);

  // 上报组件指纹（用于 CVE 匹配）
  rpc ReportComponentFingerprint(ComponentFingerprint) returns (ComponentFingerprintResponse);
}

message RuleUpdate {
  enum Action {
    ADD = 0;
    UPDATE = 1;
    DELETE = 2;
    FULL_SYNC = 3;  // 全量同步（启动时）
  }
  Action action = 1;
  WafRule rule = 2;
  int64 version = 3;  // 规则版本号
}

message PolicyUpdate {
  enum Action {
    ADD = 0;
    UPDATE = 1;
    DELETE = 2;
    FULL_SYNC = 3;
  }
  Action action = 1;
  ZeroTrustPolicy policy = 2;
  int64 version = 3;
}

message JWKSUpdate {
  repeated JWK keys = 1;  // JSON Web Key Set
  int64 version = 2;
}

message ModelUpdate {
  enum Action {
    FULL_SYNC = 0;   // 全量模型文件
    INCREMENTAL = 1; // 增量更新
    ROLLBACK = 2;    // 回滚到上一版本
  }
  Action action = 1;
  bytes model_data = 2;  // 模型文件内容
  string model_version = 3;
  string model_type = 4; // "isolation_forest" / "autoencoder" 等
}

message TokenResponse {
  bool valid = 1;
  string user_id = 2;
  map<string, string> claims = 3;
  int64 expires_at = 4;  // 令牌过期时间（用于缓存 TTL）
}

message RiskResponse {
  double trust_score = 1;
  string level = 2; // HIGH/MEDIUM/LOW
  map<string, double> factors = 3;  // 各维度评分
  int64 expires_at = 4;  // 评分过期时间（用于缓存 TTL）
}
```

### 9.2 集群会话同步机制

**主机制：Redis 共享**（默认）
- 会话状态存储在 Redis 中，所有数据平面节点共享
- C++ Session Manager 本地 LRU 缓存 + Redis 回源
- 优点：简单可靠，最终一致

**辅助机制：gRPC 直连**（低延迟场景，可选）
- 对于要求强一致的场景（如会话撤销需立即生效）
- 通过 Redis Pub/Sub 通知所有节点失效本地缓存
- 不使用 gRPC DataPlaneSync 做会话同步（避免复杂度）

**分布式限流**：
- 基于 Redis 的 Token Bucket 实现
- 每个节点本地预分配令牌，定期从 Redis 补充
- 优点：减少 Redis 调用，兼顾准确性和性能

---

## 10. 降级策略

### 10.1 控制平面不可用

| 场景 | 降级行为 |
|------|---------|
| Go Auth Service 不可用 | C++ 使用本地缓存的令牌验证结果（TTL 内有效）；缓存过期后，**放行已认证请求**（降级模式），记录告警 |
| Go Risk Engine 不可用 | C++ 使用本地缓存的风险评分；缓存过期后，**使用默认中等评分 50**，记录告警 |
| Go Rules Engine 不可用 | C++ 使用本地规则副本继续工作；规则更新暂停，记录告警 |
| Go API/UI 不可用 | 数据平面独立运行，管理操作不可用，记录告警 |

### 10.2 Redis 不可用

| 场景 | 降级行为 |
|------|---------|
| Redis 连接失败 | 会话管理退化为纯本地缓存（接受短暂不一致）；分布式限流退化为本地限流；记录告警 |
| Redis 恢复 | 自动重连，本地缓存与 Redis 同步 |

### 10.3 gRPC 调用超时

| 场景 | 降级行为 |
|------|---------|
| ValidateToken 超时 (500ms) | 返回 503 Service Unavailable，提示用户重新登录 |
| GetRiskScore 超时 (500ms) | 使用默认评分 50（中等风险），放行请求，记录告警 |
| SyncRules/SyncPolicies 断开 | 使用本地规则继续工作，自动重连 |

### 10.4 后端不可用

| 场景 | 降级行为 |
|------|---------|
| 后端超时 | 返回 504 Gateway Timeout |
| 后端 5xx | 熔断器触发，返回 503 Service Unavailable |
| 后端连接池耗尽 | 排队等待（最大 1000），超时返回 503 |

### 10.5 降级模式开关

```yaml
degradation:
  auth_service_down: "ALLOW_CACHED"  # ALLOW_CACHED / DENY_ALL
  risk_engine_down: "DEFAULT_SCORE_50"  # DEFAULT_SCORE_50 / DENY_ALL
  redis_down: "LOCAL_ONLY"  # LOCAL_ONLY / DENY_ALL
  grpc_timeout_ms: 500
```

---

## 11. 安全设计

### 11.1 加密

| 组件 | 加密方式 |
|------|---------|
| 客户端 ↔ 数据平面 | TLS 1.3 (双向认证可选) |
| 数据平面 ↔ 控制平面 | mTLS (双向认证) |
| 数据平面 ↔ Redis | TLS |
| 控制平面 ↔ 数据库 | TLS |

### 11.2 审计

- 所有操作记录审计日志
- 日志包含：操作类型、操作者、时间、IP、结果
- 日志不可篡改（写入 ClickHouse + 签名）

### 11.3 防护

- **DDoS 防护**：基于 IP 的速率限制、SYN 洪水防护
- **暴力破解防护**：登录尝试限制、验证码
- **SQL 注入防护**：WAF 规则 + 参数化查询
- **XSS 防护**：WAF 规则 + 输出编码
- **CSRF 防护**：Token 验证

---

## 12. 性能目标

| 指标 | 目标值 | 前提条件 |
|------|--------|---------|
| 吞吐量 | 100K+ QPS (单节点) | 缓存命中率 > 95% |
| 延迟 (p99) | < 1ms | 缓存命中，无 gRPC 调用 |
| 延迟 (p99.9) | < 5ms | 缓存未命中，1 次 gRPC 调用 |
| 并发连接 | 100K+ | - |
| TLS 握手 | < 100μs | 会话复用 |
| 规则匹配 | < 0.1ms/请求 | AC 自动机 + 预编译正则 |
| 缓存命中率目标 | > 95% | 令牌缓存 30s + 风险评分缓存 60s |
