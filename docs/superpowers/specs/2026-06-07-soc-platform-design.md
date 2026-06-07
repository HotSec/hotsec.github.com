# SOC Platform 安全运营中心平台 - 技术设计文档

> **文档版本**: v2.0  
> **创建日期**: 2026-06-07  
> **更新日期**: 2026-06-07  
> **项目名称**: Enterprise SOC Platform  
> **状态**: 已批准 - 优化版本

---

## 1. 项目概述

### 1.1 项目背景

构建一个**企业级安全运营中心平台（Security Operations Center Platform）**，集成网络入侵检测、主机端点检测与响应、资产测绘与漏洞扫描、日志分析与 SIEM 四大核心能力，实现安全威胁的**实时发现、关联分析、快速响应**闭环。

### 1.2 项目目标

| 目标 | 描述 |
|------|------|
| **规模支持** | 支持 1000+ 主机，500+ Syslog 来源，10GB+/天日志量 |
| **能力覆盖** | IDS + EDR + 漏洞扫描 + SIEM 四位一体 |
| **架构标准** | K3s 微服务架构，支持高可用水平扩展 |
| **技术栈** | Go 为主，Rust/C++ 高性能扩展 |
| **部署环境** | 物理机房 / 私有云 |
| **响应时效** | 威胁告警 <= 10秒，攻击链还原 <= 30秒 |

### 1.3 核心能力矩阵

| 模块 | 能力 | 技术实现 |
|------|------|---------|
| **IDS 流量监控** | 10Gbps+ 高速抓包、DPI 深度检测、规则匹配、攻击链还原 | Rust (AF_XDP) + Suricata/C++ |
| **EDR 主机监控** | 进程/文件/网络监控、行为分析、威胁猎捕、主机隔离 | Go (跨平台 Agent) |
| **资产测绘** | 主动探测、漏洞扫描、配置基线、资产画像 | Go + Nmap/Nuclei |
| **SIEM 日志分析** | Syslog 接收、深度解析、告警检测、关联分析 | Go + Kafka + ClickHouse |
| **关联分析** | 多源数据关联、MITRE ATT&CK 映射、攻击链可视化 | 滑动窗口 + 图数据库查询 |

### 1.4 性能指标

| 指标 | 目标值 | 优化后目标 |
|-----|------|---------|
| IDS 抓包吞吐量 | 10 Gbps+ | 20 Gbps+ |
| Syslog 接收速率 | 100,000+ 条/秒 | 200,000+ 条/秒 |
| 日志解析延迟 | < 100 ms | < 50 ms |
| 告警响应时间 | < 10 s | < 5 s |
| 历史查询响应时间 | < 5 s (95th percentile) | < 2 s (99th percentile) |
| ClickHouse 写入速率 | 500,000+ 行/秒 | 1,000,000+ 行/秒 |
| 支持规模 | 1000+ 主机 | 5000+ 主机 + 容器 |

### 1.5 核心优化方向

| 优化领域 | 具体措施 |
|---------|---------|
| **架构优化** | 微服务精简（13→8）、图数据库引入、存储分层 |
| **AI 赋能** | 异常检测引擎、告警降噪、智能分析 |
| **自动化响应** | SOAR Playbook、响应编排、可视化编辑器 |
| **容器监控** | eBPF 探针、运行时 API、K8s 集成 |
| **威胁猎捕** | Hunt 工作台、自动化猎捕、协作功能 |
| **开放生态** | Webhook、SDK、第三方系统集成 |

---

## 2. 系统架构

### 2.1 整体架构图

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                              用户接入层                                          │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│   │  Web UI  │    │  RESTful │    │  gRPC    │    │   CLI   │            │
│   │  React   │    │   API    │    │  接口    │    │  命令行  │            │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘            │
└────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                           K3s Ingress Layer                                     │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │   Traefik    │  │  Cert-Man    │  │    RBAC     │  │   Logging    │  │
│   │   反向代理    │  │   证书管理    │  │  权限控制   │  │   审计日志   │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                        K3s Kubernetes Cluster                                   │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      控制面 (Control Plane)                              │  │
│  │   K3s Server x 3 (高可用)  +  Traefik + Cert-Manager                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      核心业务微服务层                                    │  │
│  │                                                                       │  │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │   │   auth-svc   │  │  asset-svc   │  │   ids-svc    │               │  │
│  │   │   认证服务    │  │   资产管理    │  │   IDS 服务    │               │  │
│  │   │   (Go)       │  │   (Go)       │  │   (Go)       │               │  │
│  │   └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  │                                                                       │  │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │   │   edr-svc    │  │   vuln-svc    │  │   alert-svc  │               │  │
│  │   │   EDR 服务    │  │  漏洞扫描服务  │  │   告警服务    │               │  │
│  │   └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  │                                                                       │  │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │   │  report-svc  │  │   intel-svc   │  │   ws-svc     │               │  │
│  │   │   报表服务    │  │   情报服务    │  │  WebSocket   │               │  │
│  │   └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  │                                                                       │  │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │   │   log-svc    │  │   siem-svc   │  │correlation-svc│               │  │
│  │   │   日志收集    │  │   日志解析    │  │  关联分析服务  │               │  │
│  │   └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      数据服务层 (StatefulSets)                          │  │
│  │                                                                       │  │
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │  │
│  │   │Postgres │  │ClickHouse│  │Elastic  │  │  Redis  │  │  Kafka  │  │  │
│  │   │  主从   │  │   集群   │  │   集群   │  │  集群   │  │   集群   │  │  │
│  │   └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │  │
│  │                                                                       │  │
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐                              │  │
│  │   │  MinIO  │  │ Grafana │  │ Kibana  │                              │  │
│  │   │ 对象存储 │  │  监控   │  │  日志   │                              │  │
│  │   └─────────┘  └─────────┘  └─────────┘                              │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                          探针 / Agent 层                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐│
│  │   IDS Probe  │    │   EDR Agent │    │Scanner Agent │    │ Beats Agent ││
│  │    (Rust)    │    │     (Go)    │    │    (Go)      │    │   (Go)      ││
│  │   AF_XDP     │    │  Win/Linux  │    │   主动探测    │    │   Syslog    ││
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘│
└────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 数据流向图

```
┌──────────────────┐       ┌──────────────────┐      ┌──────────────────┐
│   IDS Probe      │       │   EDR Agent      │      │   Syslog 来源    │
│   (流量捕获)     │──────▶│   (主机监控)     │─────▶│   (日志发送)     │
└────────┬─────────┘       └────────┬─────────┘      └────────┬─────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │      Kafka      │
                            │   消息队列      │
                            └────────┬────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   siem-svc       │      │ correlation-svc  │      │   alert-svc      │
│   (日志解析)     │      │   (关联分析)     │      │   (告警通知)     │
└────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   ClickHouse     │      │   PostgreSQL     │      │   Elasticsearch  │
│   (时序数据)     │      │   (业务数据)     │      │   (全文检索)     │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

### 2.4 技术选型总表

| 组件 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **容器编排** | K3s | 1.29+ | 轻量级 Kubernetes |
| **主语言** | Go | 1.21+ | 控制面、高并发微服务 |
| **高性能抓包** | Rust | 1.75+ | AF_XDP、零拷贝 |
| **流量检测** | Suricata/C++ | 7.0+ | 规则引擎、DPI |
| **Web 框架** | Gin | v1.9+ | 高性能 REST API |
| **Web 前端** | React + TypeScript | 5.x / 18.x | 现代化 UI |
| **关系数据库** | PostgreSQL | 16+ | 核心业务数据 |
| **时序数据库** | ClickHouse | 24.x | 流量/事件存储 |
| **搜索引擎** | Elasticsearch | 8.x | 全文检索分析 |
| **消息队列** | Kafka | 3.6+ | 事件流处理 |
| **缓存** | Redis | 7.x | 会话/热点数据 |
| **对象存储** | MinIO | RELEASE | 文件/pcap 存储 |
| **Ingress** | Traefik | 3.x | 反向代理/路由 |
| **证书管理** | cert-manager | 1.14+ | TLS 自动化 |
| **负载均衡** | HAProxy | 3.x | 入口流量 |

---

## 3. 核心模块设计

### 3.1 IDS 流量监控模块

#### 3.1.1 模块架构

```
┌────────────────────────────────────────────────────────┐
│                    IDS 模块架构                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐       │
│  │ 流量接收 │───▶│ 协议解析  │───▶│ 规则匹配 │       │
│  │  (Rust) │    │   Parser │    │  Engine  │       │
│  │ AF_XDP  │    │ Rust/Npcap│    │ Suricata │       │
│  └──────────┘    └──────────┘    └────┬─────┘       │
│                                        │              │
│                                        ▼              │
│  ┌──────────┐    ┌──────────┐  ┌──────────┐      │
│  │ 威胁情报 │───▶│ 关联分析 │◀─│ 告警生成 │      │
│  │  Intel   │    │ Analyzer │  │  Alerter │      │
│  └──────────┘    └──────────┘  └──────────┘      │
│                          │                          │
│                          ▼                          │
│                    ┌──────────┐                   │
│                    │ 攻击链   │                   │
│                    │  还原    │                   │
│                    └──────────┘                   │
└────────────────────────────────────────────────────────┘
```

#### 3.1.2 核心能力

| 能力 | 说明 |
|------|------|
| **高速抓包** | 10Gbps+ 流量捕获，使用 AF_XDP 零拷贝技术 |
| **协议解析** | 支持 TCP/UDP/ICMP/DNS/HTTP/HTTPS/FTP/SMTP 等 |
| **规则检测** | 兼容 Suricata/Snort 规则格式 |
| **威胁情报** | 集成 STIX/TAXII 情报源，支持 IOC 匹配 |
| **攻击链还原** | 基于 Flow/NetFlow 的攻击链可视化 |
| **流量回溯** | PCAP 原始流量存储与回溯查询 |

#### 3.1.3 数据模型

```go
// IDS 流量日志
type IDSFlowLog struct {
    Timestamp     time.Time `json:"timestamp"`
    SrcIP         string    `json:"src_ip"`
    DstIP         string    `json:"dst_ip"`
    SrcPort       uint16    `json:"src_port"`
    DstPort       uint16    `json:"dst_port"`
    Protocol      string    `json:"protocol"`
    Action        string    `json:"action"`        // allow/deny/drop
    AlertCategory string    `json:"alert_category"`
    AlertSignature string   `json:"alert_signature"`
    ThreatLevel    int      `json:"threat_level"`  // 1-5
    RawPayload     []byte   `json:"raw_payload,omitempty"`
}

// IDS 告警事件
type IDSAlert struct {
    AlertID       string    `json:"alert_id"`
    Timestamp     time.Time `json:"timestamp"`
    SrcIP         string    `json:"src_ip"`
    DstIP         string    `json:"dst_ip"`
    SrcPort       uint16    `json:"src_port"`
    DstPort       uint16    `json:"dst_port"`
    Protocol      string    `json:"protocol"`
    RuleID        string    `json:"rule_id"`
    RuleName      string    `json:"rule_name"`
    Category      string    `json:"category"`
    Severity      string    `json:"severity"` // critical/high/medium/low/info
    Description   string    `json:"description"`
    Evidence      []byte    `json:"evidence,omitempty"`
    RelatedFlows  []string  `json:"related_flows,omitempty"`
}
```

#### 3.1.4 IDS 子模块设计

| 子模块 | 功能说明 | 技术实现 |
|------|---------|---------|
| **Packet Capture** | 流量捕获模块 | Rust + AF_XDP + eBPF |
| **Protocol Parser** | 协议解析与解码 | Rust + Suricata 引擎集成 |
| **Rule Engine** | 规则匹配引擎 | Suricata + 自定义规则引擎 |
| **Flow Collector** | 流数据聚合与统计 | Go + ClickHouse |
| **IOC Matching** | 威胁情报匹配 | Go + Redis IOC 缓存 |
| **PCAP Storage** | 原始流量存储 | MinIO |

#### 3.1.5 关键流程设计

```
1. 流量捕获流程
   ┌─────────────────────────────────────────────────────────┐
   │ 网卡 → AF_XDP → 环形缓冲区 → 用户空间 → 协议解析     │
   └─────────────────────────────────────────────────────────┘

2. 告警处理流程
   ┌─────────────────────────────────────────────────────────┐
   │ 规则匹配 → 告警生成 → IOC 匹配 → 关联分析 → 通知 │
   └─────────────────────────────────────────────────────────┘

3. PCAP 回溯流程
   ┌─────────────────────────────────────────────────────────┐
   │ 查询条件 → 检索 ClickHouse → 定位时间段 →            │
   │ 从 MinIO 读取 PCAP → 回显与分析                      │
   └─────────────────────────────────────────────────────────┘
```

#### 3.1.6 IDS API 详情

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/ids/flows` | 流量日志查询（支持时间/IP/端口过滤） |
| POST | `/api/v1/ids/flows/search` | 高级搜索与聚合 |
| GET | `/api/v1/ids/alerts` | 告警列表 |
| GET | `/api/v1/ids/alerts/:id` | 告警详情 |
| PUT | `/api/v1/ids/alerts/:id` | 更新告警（状态/备注） |
| GET | `/api/v1/ids/rules` | 规则列表 |
| POST | `/api/v1/ids/rules` | 新增规则 |
| GET | `/api/v1/ids/rules/:id` | 规则详情 |
| PUT | `/api/v1/ids/rules/:id` | 更新规则 |
| DELETE | `/api/v1/ids/rules/:id` | 删除规则 |
| POST | `/api/v1/ids/rules/test` | 规则测试 |
| GET | `/api/v1/ids/probes` | 探针列表 |
| POST | `/api/v1/ids/probes` | 注册探针 |
| GET | `/api/v1/ids/probes/:id` | 探针详情 |
| GET | `/api/v1/ids/probes/:id/stats` | 探针统计 |
| GET | `/api/v1/ids/attacks/:id` | 攻击链详情 |
| GET | `/api/v1/ids/attacks/:id/timeline` | 攻击时间线 |
| POST | `/api/v1/ids/pcap/retrieve` | PCAP 回溯查询 |

---

### 3.2 EDR 主机监控模块

#### 3.2.1 模块架构

```
┌────────────────────────────────────────────────────────┐
│                    EDR 模块架构                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │              EDR Agent (部署在每台主机)           │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │
│  │  │进程监控│ │文件监控│ │网络监控│ │行为监控│ │  │
│  │  │  Fork  │ │  Read  │ │Connect │ │   YARA │ │  │
│  │  └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘ │  │
│  │       └──────────┼──────────┴──────────┘     │  │
│  │                    ▼                          │  │
│  │           ┌──────────────┐                   │  │
│  │           │  行为采集器   │                   │  │
│  │           │  Event Log   │                   │  │
│  │           └───────┬──────┘                   │  │
│  │                   │                           │  │
│  │                   ▼                           │  │
│  │           ┌──────────────┐                   │  │
│  │           │   本地缓存    │                   │  │
│  │           │  SQLite/LMDB │                   │  │
│  │           └───────┬──────┘                   │  │
│  └───────────────────┼───────────────────────────┘  │
│                       │ 加密传输                      │
└───────────────────────┼───────────────────────────────┘
                        ▼
┌────────────────────────────────────────────────────────┐
│                  EDR Server (云端)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ 数据接收 │  │ 行为分析 │  │ 威胁猎捕 │         │
│  │ Receiver │  │  Engine  │  │ Hunting  │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│        │              │              │               │
│        └──────────────┴──────────────┘               │
│                       │                              │
│                       ▼                              │
│              ┌──────────────┐                       │
│              │   响应隔离    │                       │
│              │  Containment │                       │
│              └──────────────┘                       │
└────────────────────────────────────────────────────────┘
```

#### 3.2.2 核心能力

| 能力 | 说明 |
|------|------|
| **进程监控** | 进程创建/终止/执行路径/命令行参数 |
| **文件监控** | 文件创建/读取/修改/删除/权限变更 |
| **网络监控** | TCP/UDP 连接、DNS 查询、端口扫描检测 |
| **注册表监控** | Windows 注册表键值变更（仅 Windows） |
| **行为分析** | 基于 YARA 规则的行为匹配 |
| **威胁猎捕** | 预定义狩猎查询、异常行为检测 |
| **主机隔离** | 网络隔离、进程终止、文件隔离 |
| **取证采集** | 内存镜像、进程Dump、证据收集 |

#### 3.2.3 数据模型

```go
// EDR 行为事件
type EDREvent struct {
    EventID      string    `json:"event_id"`
    Hostname     string    `json:"hostname"`
    AssetID      string    `json:"asset_id"`
    Timestamp    time.Time `json:"timestamp"`
    EventType    string    `json:"event_type"`     // process/file/network/registry
    Action       string    `json:"action"`         // create/read/write/delete
    ProcessID    uint32    `json:"process_id"`
    ProcessName  string    `json:"process_name"`
    ProcessPath  string    `json:"process_path"`
    ParentPID    uint32    `json:"parent_pid"`
    ParentName   string    `json:"parent_name"`
    User         string    `json:"user"`
    TargetPath   string    `json:"target_path,omitempty"`
    TargetIP     string    `json:"target_ip,omitempty"`
    TargetPort   uint16    `json:"target_port,omitempty"`
    ThreatLevel  int       `json:"threat_level"`    // 1-5
    RawData      []byte    `json:"raw_data,omitempty"`
}

// EDR Agent 状态
type EDRAgentStatus struct {
    AgentID         string    `json:"agent_id"`
    Hostname        string    `json:"hostname"`
    AssetID         string    `json:"asset_id"`
    Online          bool      `json:"online"`
    LastHeartbeat   time.Time `json:"last_heartbeat"`
    Version         string    `json:"version"`
    CPUUsage        float64   `json:"cpu_usage"`
    MemoryUsage     float64   `json:"memory_usage"`
    DiskUsage       float64   `json:"disk_usage"`
    NetworkUsage    float64   `json:"network_usage"`
    Status          string    `json:"status"`
    Policies        []string  `json:"policies"`
}

// 主机响应任务
type EDRResponseTask struct {
    TaskID       string    `json:"task_id"`
    AssetID      string    `json:"asset_id"`
    TaskType     string    `json:"task_type"`    // isolate/kill/collect
    Target       string    `json:"target"`
    Status       string    `json:"status"`       // pending/running/complete/failed
    CreatedBy    string    `json:"created_by"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
    Result       string    `json:"result,omitempty"`
}
```

#### 3.2.4 EDR 子模块设计

| 子模块 | 功能说明 | 技术实现 |
|------|---------|---------|
| **Process Monitor** | 进程监控模块 | eBPF (Linux) / ETW (Windows) |
| **File Monitor** | 文件监控模块 | inotify / FileSystemWatcher |
| **Network Monitor** | 网络监控模块 | libpcap / Npcap |
| **Registry Monitor** | 注册表监控 | Windows Registry API |
| **Behavior Engine** | 行为分析引擎 | YARA + ML 模型 |
| **Response Engine** | 响应隔离引擎 | Go + iptables/防火墙API |
| **Forensics Collector** | 取证采集模块 | Rust + Volatility |
| **Agent Manager** | Agent 管理 | Go + gRPC |

#### 3.2.5 关键流程设计

```
1. EDR Agent 启动流程
   ┌─────────────────────────────────────────────────────────┐
   │ 安装 → 注册 → 心跳 → 策略下发 → 开始监控          │
   └─────────────────────────────────────────────────────────┘

2. 行为分析流程
   ┌─────────────────────────────────────────────────────────┐
   │ 事件采集 → 本地过滤 → 上传 → 行为分析 → IOC匹配 → 告警 │
   └─────────────────────────────────────────────────────────┘

3. 响应隔离流程
   ┌─────────────────────────────────────────────────────────┐
   │ 告警触发 → 人工/自动决策 → 下发任务 → Agent执行 → 确认 │
   └─────────────────────────────────────────────────────────┘

4. 取证采集流程
   ┌─────────────────────────────────────────────────────────┐
   │ 任务下发 → 内存Dump/文件采集 → 加密传输 → 分析存储     │
   └─────────────────────────────────────────────────────────┘
```

#### 3.2.6 EDR API 详情

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/edr/hosts` | 主机列表 |
| GET | `/api/v1/edr/hosts/:id` | 主机详情 |
| GET | `/api/v1/edr/hosts/:id/events` | 主机事件列表 |
| GET | `/api/v1/edr/hosts/:id/status` | 主机状态 |
| POST | `/api/v1/edr/hosts/:id/isolate` | 隔离主机 |
| POST | `/api/v1/edr/hosts/:id/unisolate` | 取消隔离 |
| GET | `/api/v1/edr/events` | 事件列表（支持过滤） |
| GET | `/api/v1/edr/events/:id` | 事件详情 |
| POST | `/api/v1/edr/events/search` | 事件搜索 |
| GET | `/api/v1/edr/tasks` | 响应任务列表 |
| POST | `/api/v1/edr/tasks` | 创建响应任务 |
| GET | `/api/v1/edr/tasks/:id` | 任务详情 |
| POST | `/api/v1/edr/tasks/:id/cancel` | 取消任务 |
| GET | `/api/v1/edr/agents` | Agent 列表 |
| GET | `/api/v1/edr/agents/:id` | Agent 详情 |
| POST | `/api/v1/edr/agents/:id/upgrade` | Agent 升级 |
| GET | `/api/v1/edr/policies` | 策略列表 |
| POST | `/api/v1/edr/policies` | 创建策略 |
| GET | `/api/v1/edr/hunting` | 威胁猎捕查询 |
| POST | `/api/v1/edr/hunting/queries` | 创建猎捕查询 |
| GET | `/api/v1/edr/forensics/:id` | 取证记录详情 |

---

### 3.3 资产测绘 / 漏洞扫描模块

#### 3.3.1 模块架构

```
┌────────────────────────────────────────────────────────┐
│                 资产测绘模块架构                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │              资产发现引擎                      │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐          │    │
│  │  │主动探测│ │被动识别│ │ 协议   │          │    │
│  │  │  Nmap  │ │流量分析│ │识别    │          │    │
│  │  └────────┘ └────────┘ └────────┘          │    │
│  └──────────────────────────────────────────────┘    │
│                         │                            │
│                         ▼                            │
│  ┌──────────────────────────────────────────────┐    │
│  │              漏洞扫描引擎                    │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐         │    │
│  │  │  CVE   │ │ 配置基线│ │ Web    │         │    │
│  │  │  扫描   │ │  检查   │ │ 扫描   │         │    │
│  │  │ OpenVAS │ │   CSP   │ │ Nuclei │         │    │
│  │  └────────┘ └────────┘ └────────┘         │    │
│  └──────────────────────────────────────────────┘    │
│                         │                            │
│                         ▼                            │
│  ┌──────────────────────────────────────────────┐    │
│  │              资产画像引擎                    │    │
│  │  • 拓扑发现  • 变更追踪  • 关联分析         │    │
│  │  • 风险评分  • 合规检查                     │    │
│  └──────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

#### 3.3.2 核心能力

| 能力 | 说明 |
|------|------|
| **主动探测** | Nmap 风格的主机发现、端口扫描、服务识别 |
| **被动识别** | 基于流量的设备指纹识别、协议分析 |
| **CVE 扫描** | 集成 OpenVAS/Nuclei 的漏洞检测 |
| **配置基线** | CIS/DISA 配置合规检查 |
| **Web 扫描** | Nuclei 模板驱动的 Web 漏洞扫描 |
| **资产画像** | 自动识别 OS、Hostname、MAC、厂商等 |
| **风险评分** | CVSS + 业务重要性综合评分 |
| **变更追踪** | 资产变更实时监控与告警 |

#### 3.3.3 数据模型

```go
// 资产记录
type Asset struct {
    AssetID       string    `json:"asset_id"`
    IPAddress     string    `json:"ip_address"`
    MACAddress    string    `json:"mac_address,omitempty"`
    Hostname      string    `json:"hostname,omitempty"`
    OS            string    `json:"os"`
    OSVersion     string    `json:"os_version,omitempty"`
    AssetType     string    `json:"asset_type"`     // server/workstation/network/iot
    Vendor        string    `json:"vendor,omitempty"`
    Services      []Service `json:"services"`
    Vulnerabilities []Vuln  `json:"vulnerabilities"`
    RiskScore     float64   `json:"risk_score"`
    FirstSeen     time.Time `json:"first_seen"`
    LastSeen      time.Time `json:"last_seen"`
    Tags          []string  `json:"tags"`
    Groups        []string  `json:"groups"`
}

// 漏洞记录
type Vuln struct {
    VulnID        string    `json:"vuln_id"`
    CVE           string    `json:"cve,omitempty"`
    Title         string    `json:"title"`
    Description   string    `json:"description"`
    Severity      string    `json:"severity"`      // CRITICAL/HIGH/MEDIUM/LOW/INFO
    CVSS          float64   `json:"cvss"`
    AffectedService string  `json:"affected_service"`
    Port          uint16    `json:"port"`
    Solution      string    `json:"solution,omitempty"`
    ScanTime      time.Time `json:"scan_time"`
}

// 服务记录
type Service struct {
    ServiceID  string    `json:"service_id"`
    Port       uint16    `json:"port"`
    Protocol   string    `json:"protocol"`
    Name       string    `json:"name"`
    Version    string    `json:"version,omitempty"`
    Banner     string    `json:"banner,omitempty"`
    Status     string    `json:"status"`     // open/filtered/closed
    FirstSeen  time.Time `json:"first_seen"`
    LastSeen   time.Time `json:"last_seen"`
}

// 扫描任务
type ScanTask struct {
    TaskID        string    `json:"task_id"`
    TaskType      string    `json:"task_type"`    // discovery/port/vuln/web/config
    Targets       []string  `json:"targets"`
    Status        string    `json:"status"`       // pending/running/complete/failed
    CreatedBy     string    `json:"created_by"`
    CreatedAt     time.Time `json:"created_at"`
    StartedAt     *time.Time `json:"started_at,omitempty"`
    CompletedAt   *time.Time `json:"completed_at,omitempty"`
    Summary       string    `json:"summary,omitempty"`
}
```

#### 3.3.4 资产测绘子模块设计

| 子模块 | 功能说明 | 技术实现 |
|------|---------|---------|
| **Active Discovery** | 主动发现模块 | Go + Nmap + Masscan |
| **Passive Discovery** | 被动发现模块 | Go + 流量分析 + p0f |
| **Service Identification** | 服务识别模块 | Nmap NSE + banner 抓取 |
| **Vuln Scanner** | 漏洞扫描引擎 | OpenVAS + Nuclei + 自定义规则 |
| **Config Scanner** | 配置基线检查 | Ansible/Chef 合规检查 |
| **Web Scanner** | Web 扫描模块 | Nuclei + 自定义POC |
| **Risk Engine** | 风险评分引擎 | CVSS 3.1 + 业务权重 |
| **Topology Builder** | 拓扑发现引擎 | LLDP/CDP 分析 + traceroute |
| **Change Tracker** | 变更追踪模块 | PostgreSQL 触发器 + 告警 |

#### 3.3.5 关键流程设计

```
1. 资产发现流程
   ┌─────────────────────────────────────────────────────────┐
   │ 任务创建 → 主动扫描 → 被动识别 → 指纹识别 → 关联      │
   └─────────────────────────────────────────────────────────┘

2. 漏洞扫描流程
   ┌─────────────────────────────────────────────────────────┐
   │ 目标选择 → 端口扫描 → 服务识别 → 漏洞检测 → 结果分析 │
   └─────────────────────────────────────────────────────────┘

3. 风险评分流程
   ┌─────────────────────────────────────────────────────────┐
   │ 资产收集 → 漏洞评估 → 业务权重 → 风险计算 → 分级      │
   └─────────────────────────────────────────────────────────┘
```

#### 3.3.6 资产测绘 API 详情

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/assets` | 资产列表（支持搜索/过滤） |
| POST | `/api/v1/assets` | 创建资产 |
| GET | `/api/v1/assets/:id` | 资产详情 |
| PUT | `/api/v1/assets/:id` | 更新资产 |
| DELETE | `/api/v1/assets/:id` | 删除资产 |
| GET | `/api/v1/assets/:id/vulns` | 资产漏洞列表 |
| GET | `/api/v1/assets/:id/history` | 资产变更历史 |
| POST | `/api/v1/assets/discover` | 触发主动发现任务 |
| GET | `/api/v1/vulns` | 漏洞列表 |
| GET | `/api/v1/vulns/:id` | 漏洞详情 |
| PUT | `/api/v1/vulns/:id` | 更新漏洞（状态/修复进度） |
| GET | `/api/v1/scans` | 扫描任务列表 |
| POST | `/api/v1/scans` | 创建扫描任务 |
| GET | `/api/v1/scans/:id` | 扫描任务详情 |
| POST | `/api/v1/scans/:id/cancel` | 取消扫描 |
| GET | `/api/v1/scans/:id/report` | 扫描报告 |
| GET | `/api/v1/topology` | 网络拓扑图 |
| GET | `/api/v1/dashboard` | 资产测绘概览 |
| GET | `/api/v1/compliance` | 合规检查报告 |

---

### 3.4 SIEM 日志分析模块

#### 3.4.1 模块架构

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                         SIEM 日志处理流程                                        │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        1. 日志接收层                                      │  │
│  │                                                                         │  │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │   │ Syslog   │  │  Beats   │  │   API    │  │  File    │            │  │
│  │   │ UDP/TCP  │  │  客户端   │  │  接收    │  │  收集    │            │  │
│  │   │ :514/:1470│  │ Metricbeat│  │ HTTP    │  │ .tail   │            │  │
│  │   │ TLS:6514 │  │ Logbeat  │  │         │  │          │            │  │
│  │   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │  │
│  │         └─────────────┴─────────────┴─────────────┘                    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                          │
│                                    ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        2. 消息队列层                                    │  │
│  │                         Kafka Topic: syslog-*                          │  │
│  │   ┌─────────────────────────────────────────────────────────────┐      │  │
│  │   │  Partition 0 │ Partition 1 │ Partition 2 │ ... │ Partition N│      │  │
│  │   │  ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │   │ ┌─────────┐│      │  │
│  │   │  │  Raw    │ │ │  Raw    │ │ │  Raw    │ │   │ │  Raw    ││      │  │
│  │   │  │  Logs   │ │ │  Logs   │ │ │  Logs   │ │   │ │  Logs   ││      │  │
│  │   │  └─────────┘ │ └─────────┘ │ └─────────┘ │   │ └─────────┘│      │  │
│  │   └─────────────────────────────────────────────────────────────┘      │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                          │
│                    ┌───────────────┼───────────────┐                        │
│                    ▼               ▼               ▼                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        3. 解析与处理层                                   │  │
│  │                                                                         │  │
│  │   ┌──────────────────────────────────────────────────────────────┐    │  │
│  │   │                    Log Parser Workers (Go Workers)             │    │  │
│  │   │                                                                 │    │  │
│  │   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │    │  │
│  │   │  │ 设备模板 │  │  JSON    │  │ 正则     │  │ GROK    │   │    │  │
│  │   │  │ 解析器   │  │ 解析器   │  │ 解析器   │  │ 解析器  │   │    │  │
│  │   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │    │  │
│  │   │         │              │              │              │      │    │  │
│  │   │         └──────────────┼──────────────┴──────────────┘      │    │  │
│  │   │                        ▼                                     │    │  │
│  │   │               ┌──────────────┐                             │    │  │
│  │   │               │  字段标准化   │                             │    │  │
│  │   │               │  Normalizer  │                             │    │  │
│  │   │               └──────┬───────┘                             │    │  │
│  │   └──────────────────────┼─────────────────────────────────────┘    │  │
│  │                          ▼                                          │  │
│  │   ┌──────────────────────────────────────────────────────────────┐    │  │
│  │   │                    Enrichment 增强层                         │    │  │
│  │   │  • IP → 资产信息关联   • 威胁情报匹配   • 地理位置解析      │    │  │
│  │   │  • 用户信息关联        • 漏洞信息关联   • 上下文丰富        │    │  │
│  │   └──────────────────────────────────────────────────────────────┘    │  │
│  │                                                                         │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                          │
│                                    ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        4. 告警检测层                                    │  │
│  │                                                                         │  │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │   │ 规则引擎     │  │ 统计异常     │  │ 关联分析     │               │  │
│  │   │ Rule Engine  │  │ Anomaly      │  │ Correlation  │               │  │
│  │   │ Sigma/YARA   │  │ ML Detection │  │ Attack Chain │               │  │
│  │   └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  │                                                                         │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                          │
│                    ┌───────────────┴───────────────┐                        │
│                    ▼                               ▼                        │
│  ┌─────────────────────────┐     ┌─────────────────────────────────────────┐
│  │     ClickHouse           │     │     Elasticsearch                       │
│  │   原始日志存储            │     │   全文检索 + 安全分析                   │
│  └─────────────────────────┘     └─────────────────────────────────────────┘
```

#### 3.4.2 核心能力

| 能力 | 说明 |
|------|------|
| **多协议接收** | UDP :514, TCP :1470, TLS :6514, RELP :20514 |
| **设备模板解析** | Fortinet/Palo Alto/Cisco ASA/Huawei 等防火墙模板 |
| **结构化解析** | JSON/XML 自动识别、GROK 正则解析 |
| **数据增强** | 资产关联、威胁情报匹配、地理信息 |
| **规则检测** | Sigma 规则引擎、统计异常检测 |
| **关联分析** | 攻击链关联、多源事件关联 |
| **实时告警** | 秒级告警生成、WebSocket 推送 |
| **海量存储** | ClickHouse 时序存储，支持 TB 级/天 |

#### 3.4.3 支持的设备类型

| 类别 | 设备 | 模板 |
|------|------|------|
| **防火墙** | Fortinet, Palo Alto, Cisco ASA, Huawei USG | 流量日志、安全事件 |
| **交换机** | Cisco, Huawei, H3C | 端口状态、VLAN、系统日志 |
| **服务器** | Linux, Windows, AIX | 系统日志、应用日志、安全日志 |
| **数据库** | MySQL, PostgreSQL, Oracle, MSSQL | 审计日志、错误日志 |
| **Web** | Nginx, Apache, IIS | 访问日志、错误日志 |
| **容器** | Kubernetes, Docker | 审计日志、事件日志 |
| **云平台** | AWS, Azure, 阿里云 | API 日志、审计日志 |

#### 3.4.4 标准化日志格式

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "host": "192.168.1.100",
  "hostname": "fw-primary",
  "program": "fortigate",
  "facility": "local4",
  "severity": "warning",
  "message": "Traffic log: src=192.168.1.50 dst=8.8.8.8 proto=6",
  
  "normalized": {
    "device_type": "firewall",
    "device_vendor": "fortinet",
    "event_type": "traffic",
    "action": "allow",
    "src_ip": "192.168.1.50",
    "dst_ip": "8.8.8.8",
    "protocol": "TCP",
    "src_port": 54321,
    "dst_port": 443
  },
  
  "enriched": {
    "src_asset_id": "asset-001",
    "src_asset_name": "workstation-50",
    "src_os": "Windows 10",
    "src_user": "john.doe",
    "threat_intel_match": true,
    "geo_location": {
      "country": "CN",
      "city": "Beijing"
    }
  }
}
```

#### 3.4.5 SIEM 数据模型

```go
// 标准化日志记录
type NormalizedLog struct {
    ID            string            `json:"id"`
    Timestamp     time.Time         `json:"timestamp"`
    SourceID      string            `json:"source_id"`
    Host          string            `json:"host"`
    Hostname      string            `json:"hostname"`
    Program       string            `json:"program"`
    Facility      string            `json:"facility"`
    Severity      string            `json:"severity"`
    Message       string            `json:"message"`
    Normalized    *LogNormalized    `json:"normalized"`
    Enriched      *LogEnriched      `json:"enriched"`
    RawData       []byte            `json:"raw_data,omitempty"`
}

// 标准化字段
type LogNormalized struct {
    DeviceType  string `json:"device_type"`
    DeviceVendor string `json:"device_vendor"`
    EventType   string `json:"event_type"`
    Action      string `json:"action"`
    SrcIP       string `json:"src_ip"`
    DstIP       string `json:"dst_ip"`
    SrcPort     uint16 `json:"src_port,omitempty"`
    DstPort     uint16 `json:"dst_port,omitempty"`
    Protocol    string `json:"protocol,omitempty"`
    User        string `json:"user,omitempty"`
    SessionID   string `json:"session_id,omitempty"`
    RequestID   string `json:"request_id,omitempty"`
}

// 增强字段
type LogEnriched struct {
    SrcAssetID    string                 `json:"src_asset_id,omitempty"`
    DstAssetID    string                 `json:"dst_asset_id,omitempty"`
    IOCMatches    []string               `json:"ioc_matches,omitempty"`
    Geolocation   map[string]interface{} `json:"geolocation,omitempty"`
    MITREATlas    map[string]string      `json:"mitre_attlas,omitempty"`
}

// 日志源配置
type LogSource struct {
    SourceID      string    `json:"source_id"`
    Name          string    `json:"name"`
    Type          string    `json:"type"`     // syslog/beat/file/api
    Protocol      string    `json:"protocol"`  // udp/tcp/tls
    Port          uint16    `json:"port"`
    Host          string    `json:"host,omitempty"`
    ParserConfig  string    `json:"parser_config,omitempty"`
    Enabled       bool      `json:"enabled"`
    CreatedAt     time.Time `json:"created_at"`
}
```

#### 3.4.6 SIEM 子模块设计

| 子模块 | 功能说明 | 技术实现 |
|------|---------|---------|
| **Syslog Receiver** | Syslog 接收模块 | Go + UDP/TCP/TLS 服务器 |
| **Beat Collector** | Beats 收集模块 | Go + Elastic Beats 协议 |
| **API Receiver** | API 日志接收 | Gin + REST API |
| **File Collector** | 文件收集模块 | Go + 定时任务 + Filebeat |
| **Log Parser** | 日志解析引擎 | Go + GROK + 设备模板 |
| **Normalizer** | 字段标准化模块 | Go + 标准化规则 |
| **Enrichment Engine** | 数据增强引擎 | Go + Redis 缓存 |
| **Rule Engine** | 告警规则引擎 | Sigma + 自定义规则 |
| **Anomaly Detector** | 异常检测模块 | ML + 统计分析 |

#### 3.4.7 SIEM 关键流程

```
1. 日志处理流程
   ┌─────────────────────────────────────────────────────────┐
   │ 接收 → 验证 → 解析 → 标准化 → 增强 → 检测 → 存储    │
   └─────────────────────────────────────────────────────────┘

2. 规则匹配流程
   ┌─────────────────────────────────────────────────────────┐
   │ 事件到达 → 规则库查询 → 匹配条件 → 触发动作 → 通知     │
   └─────────────────────────────────────────────────────────┘
```

#### 3.4.8 SIEM API 详情

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/logs` | 日志查询（支持时间范围/源/级别过滤） |
| POST | `/api/v1/logs/search` | 高级搜索（全文检索/聚合） |
| GET | `/api/v1/logs/sources` | 日志源列表 |
| POST | `/api/v1/logs/sources` | 新增日志源 |
| GET | `/api/v1/logs/sources/:id` | 日志源详情 |
| PUT | `/api/v1/logs/sources/:id` | 更新日志源配置 |
| DELETE | `/api/v1/logs/sources/:id` | 删除日志源 |
| GET | `/api/v1/logs/sources/:id/stats` | 日志源统计 |
| GET | `/api/v1/logs/parsers` | 解析器列表 |
| POST | `/api/v1/logs/parsers` | 新增解析器 |
| GET | `/api/v1/logs/rules` | 告警规则列表 |
| POST | `/api/v1/logs/rules` | 新增告警规则 |
| GET | `/api/v1/logs/rules/:id` | 规则详情 |
| PUT | `/api/v1/logs/rules/:id` | 更新规则 |
| DELETE | `/api/v1/logs/rules/:id` | 删除规则 |
| POST | `/api/v1/logs/rules/test` | 规则测试 |
| GET | `/api/v1/logs/dashboards` | SIEM 概览面板 |
| GET | `/api/v1/logs/dashboards/:id` | 面板详情 |

---

### 3.5 关联分析模块

#### 3.5.1 模块架构

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                         关联分析模块架构                                        │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        1. 数据源接入层                                      │  │
│  │                                                                         │  │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │   │ IDS 事件 │  │ EDR 事件 │  │ 日志告警 │  │ 漏洞数据 │            │  │
│  │   │  Flow    │  │  Process │  │  Rule    │  │  CVE/Vuln│            │  │
│  │   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │  │
│  │         └─────────────┴─────────────┴─────────────┘                    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                          │
│                                    ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        2. 关联规则引擎                                      │  │
│  │                                                                         │  │
│  │   ┌──────────────────────────────────────────────────────────────┐    │  │
│  │   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │    │  │
│  │   │   │ 时序关联规则 │  │ 上下文关联 │  │ 统计关联规则 │      │    │  │
│  │   │   │ Time-based   │  │ Contextual   │  │ Statistical  │      │    │  │
│  │   │   └──────────────┘  └──────────────┘  └──────────────┘      │    │  │
│  │   │                                                                 │    │  │
│  │   │   ┌──────────────────────────────────────────────────┐        │    │  │
│  │   │   │              攻击链规则 (Kill Chain)             │        │    │  │
│  │   │   │  • Reconnaissance → Exploit → Lateral Movement   │        │    │  │
│  │   │   │  • Initial Access → Execution → Command & Control │        │    │  │
│  │   │   └──────────────────────────────────────────────────┘        │    │  │
│  │   └──────────────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                          │
│                                    ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        3. 关联匹配计算                                      │  │
│  │                                                                         │  │
│  │   ┌──────────────────────────────────────────────────────────────┐    │  │
│  │   │   ┌──────────────────────────────┐                        │    │  │
│  │   │   │  滑动窗口匹配                 │                        │    │  │
│  │   │   │  (Sliding Window)             │                        │    │  │
│  │   │   │  - 时间窗口: 5s / 1min / 1hr  │                        │    │  │
│  │   │   │  - 事件序列匹配              │                        │    │  │
│  │   │   └──────────────────────────────┘                        │    │  │
│  │   │                                                                 │    │  │
│  │   │   ┌──────────────────────────────┐                        │    │  │
│  │   │   │  状态机匹配                   │                        │    │  │
│  │   │   │  (Finite State Machine)       │                        │    │  │
│  │   │   │  - 状态迁移跟踪              │                        │    │  │
│  │   │   └──────────────────────────────┘                        │    │  │
│  │   │                                                                 │    │  │
│  │   │   ┌──────────────────────────────┐                        │    │  │
│  │   │   │  图数据库查询                 │                        │    │  │
│  │   │   │  (Graph DB)                   │                        │    │  │
│  │   │   │  - 资产→事件→威胁关系网络    │                        │    │  │
│  │   │   │  - 攻击路径发现              │                        │    │  │
│  │   │   └──────────────────────────────┘                        │    │  │
│  │   └──────────────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                          │
│                                    ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        4. 关联结果生成                                      │  │
│  │                                                                         │  │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │   │ 关联事件ID   │  │ 置信度评分   │  │ 风险提升等级 │               │  │
│  │   │ Incident ID  │  │ Confidence   │  │ Risk Level   │               │  │
│  │   └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  │                                                                         │  │
│  │   ┌──────────────────────────────────────────────────────────────┐    │  │
│  │   │   ┌──────────────────────────────────────────────────┐        │    │  │
│  │   │   │          攻击链可视化 (Kill Chain Timeline)       │        │    │  │
│  │   │   │  - 时间线展示                                  │        │    │  │
│  │   │   │  - 事件上下文                                  │        │    │  │
│  │   │   └──────────────────────────────────────────────────┘        │    │  │
│  │   └──────────────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                          │
│                                    ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        5. 告警与通知层                                      │  │
│  │                                                                         │  │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │   │ 告警工单     │  │ WebSocket    │  │ 邮件/Slack   │               │  │
│  │   │ Ticket       │  │ Push         │  │ Notification │               │  │
│  │   └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### 3.5.2 核心关联类型

| 关联类型 | 说明 | 示例 |
|---------|------|------|
| **IP 地址关联** | 同一 IP 地址在多个来源中的事件关联 | 某 IP 在防火墙被拦截，同时在 IDS 中检测到扫描，同时该 IP 出现在威胁情报中 |
| **资产关联** | 同一资产的 IDS/EDR/日志/漏洞数据关联 | 某服务器既有端口扫描告警，又有异常进程创建，又有 CVE-2024-xxxx 漏洞 |
| **时序关联** | 时间窗口内的事件序列关联 | 5 分钟内：1. 端口扫描 2. 漏洞利用尝试 3. 异常登录 4. 数据传输 |
| **用户关联** | 同一用户的多设备/多维度行为关联 | 用户 A 在一台主机上执行可疑命令，同时在另一台主机上进行异常登录 |
| **攻击链关联** | 符合 MITRE ATT&CK 框架的攻击阶段匹配 | Recon → Initial Access → Execution → Command & Control |
| **统计异常关联** | 与历史基线相比的异常活动 | 某主机在 1 小时内连接外部 IP 数量是历史平均值的 10 倍 |

#### 3.5.3 攻击链规则示例 (MITRE ATT&CK)

| 阶段 (Tactic) | 技术 (Technique) | 关联触发条件 |
|--------------|-----------------|-------------|
| **侦察 (Reconnaissance)** | T1595: Active Scanning | 多端口扫描 + Nmap 特征流量 |
| **初始访问 (Initial Access)** | T1190: Exploit Public-Facing App | 特定 CVE 漏洞扫描 + 异常入站流量 |
| **执行 (Execution)** | T1059: Command and Scripting | PowerShell 可疑命令 + 进程父子链异常 |
| **持久化 (Persistence)** | T1547: Boot or Logon Autostart | 注册表启动项修改 + 计划任务创建 |
| **权限提升 (Privilege Escalation)** | T1068: Exploitation for Privilege Escalation | 高权限进程创建 + 已知提权漏洞 CVE 存在 |
| **凭证获取 (Credential Access)** | T1003: OS Credential Dumping | LSASS 进程访问 + mimikatz 特征 |
| **横向移动 (Lateral Movement)** | T1021: Remote Services | SMB/WinRM 异常连接 + RDP 暴力破解 |
| **命令与控制 (Command & Control)** | T1071: Application Layer Protocol | 异常 DNS 查询 + 可疑 User-Agent + 威胁情报 IOC 匹配 |
| **数据渗出 (Exfiltration)** | T1048: Exfiltration Over Alternative Protocol | 大量数据上传 + 加密通道 + 异常目的地址 |

#### 3.5.4 数据模型

```go
// 关联事件 (Incident)
type CorrelationIncident struct {
    IncidentID      string           `json:"incident_id"`
    Title           string           `json:"title"`
    Description     string           `json:"description"`
    Severity        string           `json:"severity"`  // CRITICAL/HIGH/MEDIUM/LOW
    Confidence      float64          `json:"confidence"` // 0.0 - 1.0
    Status          string           `json:"status"`    // NEW/INVESTIGATING/CLOSED
    FirstSeen       time.Time        `json:"first_seen"`
    LastSeen        time.Time        `json:"last_seen"`
    
    // 关联的原始事件
    RelatedEvents   []RelatedEvent   `json:"related_events"`
    
    // 攻击链信息
    KillChain       []KillChainStep  `json:"kill_chain"`
    
    // 受影响资产
    AffectedAssets  []string         `json:"affected_assets"`
    
    // 风险标签
    Tags            []string         `json:"tags"`
}

// 关联的原始事件
type RelatedEvent struct {
    EventID       string    `json:"event_id"`
    SourceType    string    `json:"source_type"`  // IDS/EDR/LOG/VULN
    Timestamp     time.Time `json:"timestamp"`
    Summary       string    `json:"summary"`
}

// 攻击链阶段
type KillChainStep struct {
    Phase         string    `json:"phase"`
    TechniqueID   string    `json:"technique_id"` // MITRE ATT&CK ID
    TechniqueName string    `json:"technique_name"`
    Evidence      []string  `json:"evidence"`
}

// 关联规则
type CorrelationRule struct {
    RuleID        string          `json:"rule_id"`
    Name          string          `json:"name"`
    Description   string          `json:"description"`
    Type          string          `json:"type"` // TIME_BASED/SEQUENCE/STATISTICAL
    Enabled       bool            `json:"enabled"`
    
    // 时间窗口 (秒)
    TimeWindow    int             `json:"time_window"`
    
    // 事件匹配条件
    MatchPattern  string          `json:"match_pattern"` // DSL 或者 JSON
    Threshold     int             `json:"threshold"`
    
    // 风险配置
    RiskLevel     string          `json:"risk_level"`
    Confidence    float64         `json:"confidence"`
}
```

#### 3.5.5 关联分析子模块

| 子模块 | 功能说明 | 技术实现 |
|------|---------|---------|
| **Event Collector** | 事件收集器 | Kafka Consumer 消费各模块事件 |
| **State Storage** | 状态存储 | Redis + 滑动窗口状态管理 |
| **Rule Engine** | 规则匹配引擎 | 时序规则引擎 + FSM 状态机 |
| **Graph Query** | 图查询引擎 | 基于图数据库的关系查询 |
| **Confidence Scoring** | 置信度评分 | 评分算法 + 历史数据校准 |
| **Incident Generator** | 事件生成器 | 多源融合 + 优先级判定 |
| **Attack Chain Builder** | 攻击链构建 | MITRE ATT&CK 映射 |

#### 3.5.6 关键流程

```
1. 关联分析流程
   ┌─────────────────────────────────────────────────────────┐
   │ 事件收集 → 标准化 → 规则匹配 → 关联确认 → 生成Incident│
   └─────────────────────────────────────────────────────────┘

2. 攻击链构建流程
   ┌─────────────────────────────────────────────────────────┐
   │ 阶段匹配 → 技术识别 → 证据收集 → 时间线整理 → 可视化 │
   └─────────────────────────────────────────────────────────┘
```

#### 3.5.7 关联分析 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/incidents` | 事件列表（状态/严重程度/时间过滤） |
| GET | `/api/v1/incidents/:id` | 事件详情（含攻击链、证据） |
| PUT | `/api/v1/incidents/:id` | 更新事件状态 |
| POST | `/api/v1/incidents/:id/close` | 关闭事件 |
| GET | `/api/v1/incidents/:id/related` | 相关事件查询 |
| GET | `/api/v1/incidents/:id/timeline` | 时间线视图 |
| GET | `/api/v1/correlation/rules` | 关联规则列表 |
| POST | `/api/v1/correlation/rules` | 新增关联规则 |
| GET | `/api/v1/correlation/rules/:id` | 规则详情 |
| PUT | `/api/v1/correlation/rules/:id` | 更新规则 |
| DELETE | `/api/v1/correlation/rules/:id` | 删除规则 |
| POST | `/api/v1/correlation/rules/test` | 规则测试 |
| GET | `/api/v1/incidents/dashboard` | 关联分析概览 |
| GET | `/api/v1/incidents/insights` | 洞察报告 |

---

### 3.6 威胁情报模块

#### 3.6.1 数据模型

```go
// IOC 指标
type IOC struct {
    IOCID         string    `json:"ioc_id"`
    Type          string    `json:"type"`       // IP/DOMAIN/URL/Hash/EMAIL
    Value         string    `json:"value"`
    Source        string    `json:"source"`     // 情报源名称
    Severity      string    `json:"severity"`   // HIGH/MEDIUM/LOW/INFO
    Description   string    `json:"description"`
    TLP           string    `json:"tlp"`        // TLP:WHITE/GREEN/AMBER/RED
    FirstSeen     time.Time `json:"first_seen"`
    LastSeen      time.Time `json:"last_seen"`
    ExpiresAt     time.Time `json:"expires_at,omitempty"`
    Verified      bool      `json:"verified"`
    Tags          []string  `json:"tags"`
}

// 情报源配置
type IntelSource struct {
    SourceID      string    `json:"source_id"`
    Name          string    `json:"name"`
    Type          string    `json:"type"`       // STIX/TAXII/MISP/CUSTOM/API
    URL           string    `json:"url"`
    AuthType      string    `json:"auth_type"`  // NONE/API_KEY/BASIC/OAUTH
    Credentials   string    `json:"credentials,omitempty"`
    PollInterval  int       `json:"poll_interval"` // 秒
    Enabled       bool      `json:"enabled"`
    LastSync      time.Time `json:"last_sync,omitempty"`
}

// IOC 匹配记录
type IOCDetection struct {
    DetectionID   string    `json:"detection_id"`
    IOCID         string    `json:"ioc_id"`
    EventID       string    `json:"event_id"`
    EventSource   string    `json:"event_source"`
    MatchField    string    `json:"match_field"`
    MatchValue    string    `json:"match_value"`
    Timestamp     time.Time `json:"timestamp"`
}
```

#### 3.6.2 威胁情报子模块

| 子模块 | 功能说明 | 技术实现 |
|------|---------|---------|
| **Source Manager** | 情报源管理 | STIX/TAXII 协议 + 自定义 API 适配器 |
| **IOC Parser** | IOC 解析器 | MISP JSON 解析 + STIX 2.1 解析 |
| **IOC Storage** | IOC 存储引擎 | PostgreSQL + Redis 缓存 |
| **Matcher** | 实时匹配引擎 | Redis Bloom Filter + 滑动窗口匹配 |
| **Feed Poller** | 情报拉取器 | 定时任务 + 并发下载 |
| **Verifier** | 情报验证模块 | 外部信誉查询 + 验证规则 |

#### 3.6.3 威胁情报 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/intel/iocs` | IOC 列表（类型/严重程度/时间过滤） |
| POST | `/api/v1/intel/iocs` | 新增 IOC |
| GET | `/api/v1/intel/iocs/:id` | IOC 详情 |
| PUT | `/api/v1/intel/iocs/:id` | 更新 IOC |
| DELETE | `/api/v1/intel/iocs/:id` | 删除 IOC |
| POST | `/api/v1/intel/iocs/lookup` | 查询值是否命中 IOC |
| GET | `/api/v1/intel/sources` | 情报源列表 |
| POST | `/api/v1/intel/sources` | 新增情报源 |
| GET | `/api/v1/intel/sources/:id` | 情报源详情 |
| PUT | `/api/v1/intel/sources/:id` | 更新情报源 |
| POST | `/api/v1/intel/sources/:id/sync` | 触发同步 |
| GET | `/api/v1/intel/detections` | 匹配记录列表 |
| GET | `/api/v1/intel/feed` | 情报源下拉选择 |

---

### 3.7 告警通知模块

#### 3.7.1 数据模型

```go
// 告警事件
type Alert struct {
    AlertID       string            `json:"alert_id"`
    Title         string            `json:"title"`
    Description   string            `json:"description"`
    Severity      string            `json:"severity"`    // CRITICAL/HIGH/MEDIUM/LOW
    Source        string            `json:"source"`      // IDS/EDR/SIEM/VULN/CORRELATION
    SourceID      string            `json:"source_id"`
    Status        string            `json:"status"`      // NEW/ACKNOWLEDGED/ESCALATED/RESOLVED/CLOSED
    Assignee      string            `json:"assignee,omitempty"`
    Priority      int               `json:"priority"`    // 1-5
    Tags          []string          `json:"tags"`
    CreatedAt     time.Time         `json:"created_at"`
    UpdatedAt     time.Time         `json:"updated_at"`
    Details       map[string]any    `json:"details,omitempty"`
}

// 通知通道
type NotificationChannel struct {
    ChannelID     string    `json:"channel_id"`
    Name          string    `json:"name"`
    Type          string    `json:"type"`       // EMAIL/SMS/SLACK/WEBHOOK/WECHAT/DINGTALK
    Config        map[string]string `json:"config"` // 通道配置
    Enabled       bool      `json:"enabled"`
}

// 通知规则
type NotificationRule struct {
    RuleID        string    `json:"rule_id"`
    Name          string    `json:"name"`
    Condition     string    `json:"condition"`   // 匹配条件 DSL
    Channels      []string  `json:"channels"`
    Enabled       bool      `json:"enabled"`
}
```

#### 3.7.2 告警通知子模块

| 子模块 | 功能说明 | 技术实现 |
|------|---------|---------|
| **Alert Router** | 告警路由 | Kafka Consumer + 规则引擎 |
| **Notifier** | 通知发送器 | 多通道适配器 |
| **Status Tracker** | 状态追踪 | PostgreSQL 事务 |
| **Deduplicator** | 告警去重 | 指纹算法 + 时间窗口 |
| **Escalator** | 升级引擎 | SLA 规则 + 自动升级 |

#### 3.7.3 告警通知 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/alerts` | 告警列表（状态/严重程度/来源过滤） |
| GET | `/api/v1/alerts/:id` | 告警详情 |
| PUT | `/api/v1/alerts/:id` | 更新告警（状态/负责人/备注） |
| POST | `/api/v1/alerts/:id/ack` | 确认告警 |
| POST | `/api/v1/alerts/:id/escalate` | 升级告警 |
| POST | `/api/v1/alerts/:id/close` | 关闭告警 |
| GET | `/api/v1/alerts/:id/history` | 操作历史 |
| GET | `/api/v1/notifications/channels` | 通知通道列表 |
| POST | `/api/v1/notifications/channels` | 新增通知通道 |
| PUT | `/api/v1/notifications/channels/:id` | 更新通知通道 |
| DELETE | `/api/v1/notifications/channels/:id` | 删除通知通道 |
| POST | `/api/v1/notifications/channels/:id/test` | 发送测试通知 |
| GET | `/api/v1/notifications/rules` | 通知规则列表 |
| POST | `/api/v1/notifications/rules` | 新增通知规则 |
| PUT | `/api/v1/notifications/rules/:id` | 更新规则 |
| GET | `/api/v1/alerts/dashboard` | 告警概览 |

---

### 3.8 报表模块

#### 3.8.1 数据模型

```go
// 报表定义
type Report struct {
    ReportID      string    `json:"report_id"`
    Name          string    `json:"name"`
    Type          string    `json:"type"`       // SECURITY/COMPLIANCE/INVENTORY/CUSTOM
    TemplateID    string    `json:"template_id,omitempty"`
    Parameters    map[string]any `json:"parameters"`
    Schedule      string    `json:"schedule,omitempty"` // Cron 表达式
    LastRun       time.Time `json:"last_run,omitempty"`
    NextRun       time.Time `json:"next_run,omitempty"`
    Enabled       bool      `json:"enabled"`
}

// 报表模板
type ReportTemplate struct {
    TemplateID    string    `json:"template_id"`
    Name          string    `json:"name"`
    Description   string    `json:"description"`
    Type          string    `json:"type"`
    Content       string    `json:"content"`    // HTML/Markdown/Go Template
}

// 报表执行记录
type ReportExecution struct {
    ExecutionID   string    `json:"execution_id"`
    ReportID      string    `json:"report_id"`
    Status        string    `json:"status"`     // PENDING/RUNNING/SUCCESS/FAILED
    FilePath      string    `json:"file_path,omitempty"`
    FileSize      int64     `json:"file_size,omitempty"`
    Format        string    `json:"format"`     // PDF/EXCEL/HTML/CSV
    StartedAt     time.Time `json:"started_at"`
    CompletedAt   time.Time `json:"completed_at,omitempty"`
    Error         string    `json:"error,omitempty"`
}
```

#### 3.8.2 报表子模块

| 子模块 | 功能说明 | 技术实现 |
|------|---------|---------|
| **Scheduler** | 调度引擎 | Cron 调度器 |
| **Generator** | 报表生成器 | 模板引擎 + 图表库 |
| **Exporter** | 导出模块 | PDF/Excel/CSV 导出库 |
| **Storage** | 报表存储 | MinIO + PostgreSQL 元数据 |

#### 3.8.3 报表 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/reports` | 报表列表 |
| POST | `/api/v1/reports` | 创建报表 |
| GET | `/api/v1/reports/:id` | 报表详情 |
| PUT | `/api/v1/reports/:id` | 更新报表 |
| DELETE | `/api/v1/reports/:id` | 删除报表 |
| POST | `/api/v1/reports/:id/run` | 立即执行报表 |
| GET | `/api/v1/reports/:id/executions` | 执行历史 |
| GET | `/api/v1/reports/:id/executions/:eid/download` | 下载报表 |
| GET | `/api/v1/reports/templates` | 模板列表 |
| POST | `/api/v1/reports/templates` | 新增模板 |
| GET | `/api/v1/reports/insights` | 安全洞察报告 |
| GET | `/api/v1/reports/compliance` | 合规报告 |

---

### 3.9 知识库模块

#### 3.9.1 数据模型

```go
// 知识条目
type KnowledgeItem struct {
    ItemID        string            `json:"item_id"`
    Title         string            `json:"title"`
    Type          string            `json:"type"`       // PLAYBOOK/ARTICLE/GUIDE/TIP
    Category      string            `json:"category"`
    Tags          []string          `json:"tags"`
    Content       string            `json:"content"`    // Markdown/HTML
    RelatedAlerts []string          `json:"related_alerts,omitempty"`
    RelatedEvents []string          `json:"related_events,omitempty"`
    CreatedAt     time.Time         `json:"created_at"`
    UpdatedAt     time.Time         `json:"updated_at"`
}

// 处置预案
type Playbook struct {
    PlaybookID    string    `json:"playbook_id"`
    Name          string    `json:"name"`
    Description   string    `json:"description"`
    AlertTypes    []string  `json:"alert_types"`
    Steps         []PlaybookStep `json:"steps"`
    CreatedAt     time.Time `json:"created_at"`
}

// 预案步骤
type PlaybookStep struct {
    StepID        string    `json:"step_id"`
    Name          string    `json:"name"`
    Description   string    `json:"description"`
    Order         int       `json:"order"`
    Type          string    `json:"type"`       // CHECK/ACTION/VERIFY
}
```

#### 3.9.2 知识库子模块

| 子模块 | 功能说明 | 技术实现 |
|------|---------|---------|
| **Item Manager** | 知识条目管理 | PostgreSQL + 全文检索 |
| **Playbook Engine** | 预案引擎 | 步骤执行器 + 自动化操作 |
| **Search Engine** | 搜索引擎 | Elasticsearch 全文检索 |
| **Recommendation** | 推荐引擎 | 关联规则 + 历史匹配 |

#### 3.9.3 知识库 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/knowledge/items` | 知识条目列表 |
| POST | `/api/v1/knowledge/items` | 新增知识条目 |
| GET | `/api/v1/knowledge/items/:id` | 条目详情 |
| PUT | `/api/v1/knowledge/items/:id` | 更新条目 |
| DELETE | `/api/v1/knowledge/items/:id` | 删除条目 |
| POST | `/api/v1/knowledge/search` | 搜索 |
| GET | `/api/v1/knowledge/playbooks` | 预案列表 |
| POST | `/api/v1/knowledge/playbooks` | 新增预案 |
| GET | `/api/v1/knowledge/playbooks/:id` | 预案详情 |
| GET | `/api/v1/knowledge/playbooks/alert/:alert_id` | 根据告警推荐预案 |

---

### 3.10 容器监控模块

#### 3.10.1 模块概述

支持多容器运行时监控（Docker/Containerd/Podman），实现容器内进程、网络、文件操作监控，支持 Kubernetes 资源与事件监控，检测容器逃逸等安全威胁。

#### 3.10.2 核心能力

| 能力 | 说明 |
|------|------|
| **多运行时支持** | Docker/Containerd/Podman/K8s |
| **进程监控** | 容器内进程创建、敏感命令执行 |
| **网络监控** | 容器网络连接、异常流量 |
| **文件监控** | 敏感目录访问、挂载操作 |
| **安全检测** | 容器逃逸、特权容器、危险能力 |
| **镜像安全** | 镜像漏洞扫描、CVE 检测 |

#### 3.10.3 数据模型

```go
// 容器运行时信息
type ContainerInfo struct {
    ContainerID     string            `json:"container_id"`
    ContainerName   string            `json:"container_name"`
    Image           string            `json:"image"`
    Runtime         string            `json:"runtime"`       // docker/containerd/podman
    Status          string            `json:"status"`
    PodName         string            `json:"pod_name,omitempty"`
    Namespace       string            `json:"namespace,omitempty"`
    Privileged      bool              `json:"privileged"`
    Capabilities    []string          `json:"capabilities"`
}

// 容器监控事件
type ContainerEvent struct {
    EventID        string            `json:"event_id"`
    Timestamp      time.Time         `json:"timestamp"`
    ContainerID    string            `json:"container_id"`
    EventType      string            `json:"event_type"`    // lifecycle/process/network/file/security
    Action         string            `json:"action"`
    ThreatLevel    int               `json:"threat_level"`
    Details        map[string]any    `json:"details,omitempty"`
}
```

#### 3.10.4 技术实现

| 技术 | 说明 |
|------|------|
| **eBPF 探针** | 内核级运行时监控（进程/网络/文件） |
| **容器运行时 API** | Docker API / Containerd CRI / Podman API |
| **Kubernetes API** | Pod/Deployment/Service 监控 + 审计日志 |
| **Falco 集成** | CNCF 运行时安全规则引擎 |

#### 3.10.5 容器逃逸检测规则

| 检测类型 | 条件 | 严重程度 |
|---------|------|---------|
| **敏感路径挂载** | 挂载 /proc、/sys、/etc | CRITICAL |
| **特权容器** | --privileged 开启 | CRITICAL |
| **危险能力** | CAP_SYS_ADMIN 等 | HIGH |
| **宿主进程访问** | 访问 /host 路径 | HIGH |
| **异常系统调用** | syscall 序列异常 | MEDIUM |

#### 3.10.6 容器监控 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/containers` | 容器列表 |
| GET | `/api/v1/containers/:id` | 容器详情 |
| GET | `/api/v1/containers/:id/events` | 容器事件 |
| GET | `/api/v1/containers/images` | 镜像列表 |
| GET | `/api/v1/containers/images/:id/vulns` | 镜像漏洞 |
| GET | `/api/v1/k8s/pods` | K8s Pod 列表 |
| GET | `/api/v1/k8s/namespaces` | K8s 命名空间 |
| GET | `/api/v1/container-alerts` | 容器告警 |

---

### 3.11 AI 智能分析模块 (新增)

#### 3.11.1 模块概述

引入 AI/ML 能力，实现异常检测、告警降噪、智能分析，提升安全运营效率。

#### 3.11.2 核心能力

| 能力 | 说明 | 技术 |
|------|------|------|
| **异常检测** | 流量基线偏离、网络行为异常 | LSTM/Isolation Forest |
| **告警降噪** | 误报识别、告警分级建议 | XGBoost + 规则 |
| **用户行为分析** | 异常登录、横向移动检测 | Graph Embedding |
| **恶意进程分类** | 进程行为智能分类 | CNN + 特征工程 |

#### 3.11.3 数据模型

```go
// AI 告警分析建议
type AlertIntelligence struct {
    AlertID           string    `json:"alert_id"`
    SeverityOriginal   string    `json:"severity_original"`
    SeveritySuggested  string    `json:"severity_suggested"`  // AI 修正建议
    Confidence         float64   `json:"confidence"`          // 置信度
    FalsePositiveProb  float64   `json:"false_positive_prob"` // 误报概率
    Reasoning          string    `json:"reasoning"`           // AI 解释
    RelatedContext     map[string]any `json:"related_context"`
}
```

#### 3.11.4 AI 分析 API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/ai/analyze/alert/:id` | AI 告警分析 |
| POST | `/api/v1/ai/analyze/batch` | 批量告警分析 |
| GET | `/api/v1/ai/anomalies` | 异常检测结果 |
| GET | `/api/v1/ai/models` | AI 模型列表 |
| POST | `/api/v1/ai/models/train` | 模型训练 |

---

### 3.12 SOAR 自动化响应模块 (新增)

#### 3.12.1 模块概述

实现安全编排、自动化与响应（SOAR），通过 Playbook 自动化处理安全事件。

#### 3.12.2 核心能力

| 能力 | 说明 |
|------|------|
| **响应编排** | 拖拽式 Playbook 编辑器 |
| **自动化响应** | 网络隔离、进程终止、账户禁用 |
| **人工介入** | 审批节点、人工确认 |
| **执行历史** | 完整执行记录与回滚 |

#### 3.12.3 响应类型

| 响应类型 | 自动化操作 |
|---------|---------|
| **网络隔离** | 防火墙阻断、网络 ACL 调整 |
| **主机响应** | 进程终止、文件隔离、服务重启 |
| **账户响应** | 强制登出、密码重置、禁用账户 |
| **取证响应** | 内存 Dump、网络抓包、日志采集 |

#### 3.12.4 SOAR API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/soar/playbooks` | Playbook 列表 |
| POST | `/api/v1/soar/playbooks` | 创建 Playbook |
| POST | `/api/v1/soar/playbooks/:id/execute` | 执行 Playbook |
| GET | `/api/v1/soar/executions` | 执行历史 |
| POST | `/api/v1/soar/executions/:id/rollback` | 回滚执行 |

---

### 3.13 威胁猎捕模块 (新增)

#### 3.13.1 模块概述

提供威胁猎捕工作台，支持自定义查询、可视化分析、协作猎捕。

#### 3.13.2 核心能力

| 能力 | 说明 |
|------|------|
| **Hunt Notebooks** | Jupyter 风格分析笔记本 |
| **自定义查询** | SQL/DSL/GraphQL 多语言支持 |
| **可视化** | 时间线、热力图、攻击链图 |
| **猎捕库** | 预设猎捕查询、MITRE ATT&CK 映射 |
| **协作功能** | 共享猎捕结果、评论、版本控制 |

#### 3.13.3 威胁猎捕 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/hunt/notebooks` | 猎捕笔记本列表 |
| POST | `/api/v1/hunt/notebooks` | 创建笔记本 |
| POST | `/api/v1/hunt/queries` | 执行猎捕查询 |
| GET | `/api/v1/hunt/library` | 猎捕查询库 |
| POST | `/api/v1/hunt/schedule` | 定时猎捕任务 |

---

## 4. 微服务设计

### 4.1 微服务优化策略

将原有的 13+ 微服务精简整合为 **8 个核心服务**，降低运维复杂度：

| 原服务 | 整合方案 |
|------|---------|
| asset-svc + vuln-svc | → **asset-vuln-svc** (资产与漏洞一体化) |
| ids-svc + edr-svc + siem-svc + log-svc | → **detection-svc** (检测能力聚合) |
| intel-svc + correlation-svc | → **intelligence-svc** (情报与关联分析) |
| alert-svc + response engine | → **response-svc** (告警与响应) |
| report-svc + knowledge-svc + ws-svc | → **platform-svc** (平台能力) |

### 4.2 优化后微服务清单

| 服务 | 镜像 | 副本 | 说明 |
|------|------|------|------|
| **api-gateway** | soc/api-gateway | 2+ | 统一网关，限流/鉴权 |
| **auth-svc** | soc/auth-svc | 2+ | 认证/授权/JWT |
| **asset-vuln-svc** | soc/asset-vuln-svc | 2+ | 资产管理 + 漏洞扫描 |
| **detection-svc** | soc/detection-svc | 3+ | IDS + EDR + SIEM 检测聚合 |
| **intelligence-svc** | soc/intelligence-svc | 2+ | 威胁情报 + 关联分析 |
| **response-svc** | soc/response-svc | 2+ | 告警处理 + 自动化响应 |
| **platform-svc** | soc/platform-svc | 2+ | 报表 + 知识库 + WebSocket |
| **container-svc** | soc/container-svc | 2+ | 容器监控 (新增) |

### 4.3 服务间通信

| 通信模式 | 协议 | 场景 |
|---------|------|------|
| **同步通信** | gRPC | 服务间实时调用 |
| **异步通信** | Kafka | 事件流、日志流、告警流 |
| **服务发现** | K3s DNS | 服务间寻址 |

---

## 5. API 接口设计

### 5.1 API 分组

| 模块 | 前缀 | 说明 |
|------|------|------|
| **认证** | `/api/v1/auth` | 登录/登出/Token/用户管理 |
| **资产** | `/api/v1/assets` | CRUD/分组/标签/发现 |
| **IDS** | `/api/v1/ids` | 流量/告警/规则/探针 |
| **EDR** | `/api/v1/edr` | 主机/事件/响应/隔离 |
| **漏洞** | `/api/v1/vuln` | 扫描/结果/修复建议 |
| **日志** | `/api/v1/logs` | 日志查询/导出/解析规则 |
| **关联分析** | `/api/v1/correlation` | 关联事件/规则/攻击链 |
| **告警** | `/api/v1/alerts` | 事件/工单/通知/规则 |
| **报表** | `/api/v1/reports` | 生成/导出/计划任务 |
| **情报** | `/api/v1/intel` | 威胁情报管理/IOC |
| **系统** | `/api/v1/system` | 配置/探针管理/集群 |

### 5.2 核心 API 示例

#### 资产接口

```yaml
GET    /api/v1/assets                    # 资产列表
POST   /api/v1/assets                    # 创建资产
GET    /api/v1/assets/{id}               # 资产详情
PUT    /api/v1/assets/{id}               # 更新资产
DELETE /api/v1/assets/{id}               # 删除资产
POST   /api/v1/assets/discover           # 触发发现任务
GET    /api/v1/assets/{id}/vulns         # 资产漏洞列表
```

#### IDS 接口

```yaml
GET    /api/v1/ids/flows                 # 流量日志查询
GET    /api/v1/ids/alerts                # IDS 告警列表
POST   /api/v1/ids/rules                 # 创建检测规则
GET    /api/v1/ids/probes                # 探针列表
POST   /api/v1/ids/probes                # 注册探针
GET    /api/v1/ids/attacks/{id}          # 攻击链详情
```

#### EDR 接口

```yaml
GET    /api/v1/edr/hosts                 # 主机列表
GET    /api/v1/edr/hosts/{id}/events    # 主机事件
POST   /api/v1/edr/hosts/{id}/isolate    # 主机隔离
POST   /api/v1/edr/hosts/{id}/unisolate  # 取消隔离
POST   /api/v1/edr/hosts/{id}/kill/{pid} # 终止进程
GET    /api/v1/edr/hunting               # 威胁猎捕查询
```

#### SIEM 接口

```yaml
GET    /api/v1/logs                      # 日志查询
GET    /api/v1/logs/stats                # 日志统计
POST   /api/v1/logs/parsers              # 创建解析规则
GET    /api/v1/logs/sources              # 日志来源统计
POST   /api/v1/logs/sources              # 添加日志源
```

#### 关联分析接口

```yaml
# 关联事件 (Incidents)
GET    /api/v1/correlation/incidents          # 关联事件列表
GET    /api/v1/correlation/incidents/{id}     # 关联事件详情
PUT    /api/v1/correlation/incidents/{id}     # 更新事件状态/分配
POST   /api/v1/correlation/incidents/{id}/close # 关闭事件

# 关联规则 (Correlation Rules)
GET    /api/v1/correlation/rules              # 规则列表
POST   /api/v1/correlation/rules              # 创建规则
GET    /api/v1/correlation/rules/{id}         # 规则详情
PUT    /api/v1/correlation/rules/{id}         # 更新规则
DELETE /api/v1/correlation/rules/{id}         # 删除规则

# 攻击链可视化
GET    /api/v1/correlation/incidents/{id}/killchain # 攻击链详情
GET    /api/v1/correlation/incidents/{id}/timeline  # 事件时间线

# 相关事件查询
GET    /api/v1/correlation/incidents/{id}/related # 关联的原始事件

# 统计分析
GET    /api/v1/correlation/stats                # 关联分析统计
```

---

## 6. 数据存储设计

### 6.1 存储组件

| 组件 | 用途 | 存储类型 |
|------|------|---------|
| **PostgreSQL** | 核心业务数据 | 关系型 |
| **ClickHouse** | 时序/流量/事件 | 列式存储 |
| **Elasticsearch** | 全文检索/分析 | 文档存储 |
| **NebulaGraph** | 图关系数据 | 图数据库 (新增) |
| **Kafka** | 消息队列/事件流 | 日志存储 |
| **Redis** | 缓存/会话/队列 | 内存/KV |
| **MinIO** | 文件/pcap/镜像 | 对象存储 |

### 6.2 存储分层策略

| 数据类型 | 存储 | 保留期限 | 说明 |
|---------|------|---------|------|
| **实时告警/事件** | ClickHouse (热数据) | 90天 | 高频查询 |
| **历史数据** | MinIO (冷数据归档) | 1年 | 低频访问 |
| **全文检索** | Elasticsearch | 180天 | 日志检索 |
| **业务数据** | PostgreSQL | 永久 | 核心数据 |
| **图关系数据** | NebulaGraph | 1年 | 关系图谱 |
| **会话/缓存** | Redis | 24小时 | 临时数据 |

### 6.3 图数据库应用场景

```
┌─────────────────────────────────────────────────────┐
│                    NebulaGraph 应用场景              │
├─────────────────────────────────────────────────────┤
│  1. 资产-漏洞-告警-攻击链图谱                        │
│  2. 攻击者 IP 关系网络                               │
│  3. 用户-设备-网络访问关系图谱                       │
│  4. MITRE ATT&CK 战术-技术映射                       │
│  5. 威胁情报 IOC 关联网络                            │
└─────────────────────────────────────────────────────┘
```

### 6.4 ClickHouse 表设计

```sql
-- IDS 流量日志表
CREATE TABLE ids_flows (
    timestamp DateTime,
    src_ip IPv4,
    dst_ip IPv4,
    src_port UInt16,
    dst_port UInt16,
    protocol String,
    action String,
    alert_category String,
    threat_level UInt8,
    asset_id String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, src_ip, dst_ip);

-- EDR 行为事件表
CREATE TABLE edr_events (
    timestamp DateTime,
    event_id String,
    asset_id String,
    hostname String,
    event_type String,
    action String,
    process_name String,
    process_path String,
    target_path String,
    target_ip IPv4,
    threat_level UInt8
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, asset_id, event_type);

-- Syslog 日志表
CREATE TABLE syslog_logs (
    timestamp DateTime,
    host String,
    hostname String,
    facility String,
    severity String,
    message String,
    device_type String,
    device_vendor String,
    event_type String,
    action String,
    src_ip IPv4,
    dst_ip IPv4
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, host, event_type);
```

### 6.3 PostgreSQL 关联分析表设计

```sql
-- 关联事件表
CREATE TABLE correlation_incidents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(512),
    description TEXT,
    severity VARCHAR(32) CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    confidence NUMERIC(3,2) CHECK (confidence BETWEEN 0 AND 1),
    status VARCHAR(32) CHECK (status IN ('NEW', 'INVESTIGATING', 'CLOSED')),
    assignee VARCHAR(128),
    first_seen TIMESTAMP,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 关联规则表
CREATE TABLE correlation_rules (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256),
    description TEXT,
    type VARCHAR(64),
    enabled BOOLEAN DEFAULT true,
    time_window INTEGER,
    match_pattern TEXT,
    threshold INTEGER,
    risk_level VARCHAR(32),
    confidence NUMERIC(3,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 关联事件与原始事件关系表
CREATE TABLE incident_event_mapping (
    incident_id VARCHAR(64),
    event_id VARCHAR(64),
    event_source VARCHAR(64),
    event_timestamp TIMESTAMP,
    PRIMARY KEY (incident_id, event_id)
);

-- 攻击链阶段表
CREATE TABLE incident_kill_chain (
    id SERIAL PRIMARY KEY,
    incident_id VARCHAR(64),
    phase VARCHAR(128),
    technique_id VARCHAR(32),
    technique_name VARCHAR(256),
    evidence TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- 受影响资产表
CREATE TABLE incident_affected_assets (
    incident_id VARCHAR(64),
    asset_id VARCHAR(64),
    PRIMARY KEY (incident_id, asset_id)
);

-- 标签表
CREATE TABLE incident_tags (
    incident_id VARCHAR(64),
    tag VARCHAR(128),
    PRIMARY KEY (incident_id, tag)
);
```

---

## 7. 部署架构

### 7.1 K3s 集群规划

```
┌────────────────────────────────────────────────────────────┐
│  Master 节点 x 3 (高可用)                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ CPU: 8C+  |  RAM: 16GB+  |  Disk: 100GB+         │  │
│  │ 部署: k3s-server + etcd + control plane            │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Worker 节点 x N (按需扩展)                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │ CPU: 16C+  |  RAM: 32GB+  |  Disk: 200GB+         │  │
│  │ 部署: 微服务 + 数据存储                              │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Storage 节点 (可选)                                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │ CPU: 4C  |  RAM: 8GB  |  Disk: 500GB+ (SSD)        │  │
│  │ 部署: Longhorn/NFS 共享存储                         │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  IDS 流量节点 (高性能)                                      │
│  ┌────────────────────────────────────────────────────┐  │
│  │ CPU: 16C+  |  RAM: 32GB+  |  Disk: 1TB+           │  │
│  │ 网卡: 10Gbps+  |  DPDK/AF_XDP 支持                 │  │
│  │ 部署: IDS Probe (Rust) DaemonSet                    │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 7.2 Kubernetes 资源清单

```yaml
# API Gateway Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    spec:
      containers:
      - name: api-gateway
        image: soc/api-gateway:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "2"
            memory: "2Gi"

---
# log-svc Syslog 接收服务
apiVersion: apps/v1
kind: Deployment
metadata:
  name: log-svc
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: log-svc
        image: soc/log-svc:latest
        ports:
        - containerPort: 514
          protocol: UDP
        - containerPort: 1470
          protocol: TCP
        - containerPort: 6514
          protocol: TCP
        resources:
          requests:
            cpu: "2"
            memory: "4Gi"
          limits:
            cpu: "8"
            memory: "16Gi"

---
# siem-svc 日志分析服务
apiVersion: apps/v1
kind: Deployment
metadata:
  name: siem-svc
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: siem-svc
        image: soc/siem-svc:latest
        env:
        - name: KAFKA_BROKERS
          value: "kafka:9092"
        - name: CLICKHOUSE_URL
          value: "clickhouse:9000"
        resources:
          requests:
            cpu: "4"
            memory: "8Gi"
          limits:
            cpu: "16"
            memory: "32Gi"

---
# ClickHouse StatefulSet
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: clickhouse
spec:
  serviceName: clickhouse
  replicas: 3
  selector:
    matchLabels:
      app: clickhouse
  template:
    spec:
      containers:
      - name: clickhouse
        image: clickhouse/clickhouse-server:24.3
        ports:
        - containerPort: 9000
        - containerPort: 8123
        volumeMounts:
        - name: data
          mountPath: /var/lib/clickhouse
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: "longhorn"
      resources:
        requests:
          storage: 500Gi
```

---

## 8. 安全设计

### 8.1 认证与授权

| 机制 | 说明 |
|------|------|
| **JWT** | Access Token (15min) + Refresh Token (7天) |
| **RBAC** | 基于角色的权限控制 |
| **审计日志** | 所有操作记录审计日志 |
| **API 限流** | 基于 IP/用户的 Rate Limiting |

### 8.2 数据安全

| 机制 | 说明 |
|------|------|
| **TLS 传输** | 所有通信使用 TLS 1.3 |
| **敏感数据加密** | 密码/密钥使用 AES-256 加密存储 |
| **网络隔离** | 探针与管控平台分离 |
| **Syslog TLS** | Syslog 接收支持 TLS 加密 |

---

## 9. 监控与运维

### 9.1 监控体系

| 组件 | 用途 |
|------|------|
| **Prometheus** | 指标采集与存储 |
| **Grafana** | 可视化仪表盘 |
| **Kibana** | 日志分析与搜索 |
| **Alertmanager** | 告警通知 |
| **Jaeger** | 分布式追踪 |

### 9.2 关键监控指标

| 类别 | 指标 |
|------|------|
| **基础设施** | CPU/内存/磁盘/网络 |
| **应用** | 请求延迟/错误率/并发数 |
| **IDS** | 流量处理速率/告警数量 |
| **EDR** | Agent 在线率/事件量 |
| **SIEM** | Syslog 接收速率/解析延迟 |
| **关联分析** | 关联事件数/规则匹配率 |

---

## 10. 部署流程

### 10.1 部署阶段规划

| 阶段 | 任务 | 预计时间 |
|------|------|---------|
| **阶段1: 基础设施准备** | K3s 集群搭建、网络配置、存储准备 | 1-2天 |
| **阶段2: 数据服务部署** | PostgreSQL、ClickHouse、Elasticsearch、Kafka 等 | 2-3天 |
| **阶段3: 核心服务部署** | 认证、资产、告警、报表等微服务 | 1-2天 |
| **阶段4: 分析模块部署** | IDS、EDR、SIEM、关联分析 | 2-3天 |
| **阶段5: 探针配置** | IDS Probe、EDR Agent 部署 | 1-2天 |
| **阶段6: 测试验证** | 功能测试、性能测试、安全测试 | 2-3天 |

### 10.2 部署顺序依赖图

```
1. K3s 集群搭建
   ↓
2. 基础服务 (Traefik、cert-manager、Longhorn)
   ↓
3. 数据存储服务 (PostgreSQL、Redis、Kafka)
   ↓
4. 时序与搜索服务 (ClickHouse、Elasticsearch、MinIO)
   ↓
5. 核心微服务 (auth-svc、asset-svc、alert-svc)
   ↓
6. 分析模块 (ids-svc、siem-svc、correlation-svc)
   ↓
7. 前端与 API Gateway
   ↓
8. 探针部署 (IDS Probe、EDR Agent)
```

### 10.3 高可用性设计

| 组件 | 高可用策略 |
|------|-----------|
| **K3s Master** | 3节点 etcd 集群，Raft 一致性 |
| **微服务** | 多副本 + 健康检查 + 自动重启 |
| **PostgreSQL** | 主从复制 + 自动故障切换 |
| **ClickHouse** | 3节点集群 + Zookeeper 复制表 |
| **Elasticsearch** | 多分片 + 副本分片 |
| **Kafka** | 3节点 + 副本因子 >= 2 |
| **Redis** | 哨兵模式 + 主从复制 |

---

## 11. 安全加固

### 11.1 网络安全

| 项目 | 措施 |
|------|------|
| **网络隔离** | 管理网段、数据网段、探针网段分离 |
| **防火墙** | 严格的网络访问控制列表 (ACL) |
| **TLS 加密** | 所有内部与外部通信强制 TLS 1.3 |
| **证书管理** | cert-manager 自动化证书签发与续期 |

### 11.2 容器安全

| 项目 | 措施 |
|------|------|
| **镜像安全** | 基础镜像来自可信源 + CVE 扫描 |
| **最小权限** | 非 root 用户运行 + 只读文件系统 |
| **资源限制** | CPU/内存限制 + 网络策略 |
| **安全上下文** | SELinux/AppArmor 保护 |

### 11.3 数据安全

| 项目 | 措施 |
|------|------|
| **数据加密** | 静态数据加密 (AES-256) + 传输加密 |
| **密钥管理** | 独立的密钥管理服务 (KMS) |
| **审计日志** | 所有数据访问与修改操作记录 |
| **数据脱敏** | 敏感字段在展示时自动脱敏 |

---

## 12. 备份与恢复

### 12.1 数据备份策略

| 数据类型 | 备份频率 | 保留时间 | 存储位置 |
|---------|--------|--------|--------|
| **PostgreSQL (业务数据)** | 每日增量 + 每周全量 | 90天 | MinIO + 异地备份 |
| **ClickHouse (时序数据)** | 每日分区快照 | 365天 | 本地 + 异地备份 |
| **Elasticsearch (索引数据)** | 每日快照 | 90天 | MinIO |
| **配置与规则** | 每次变更版本化 | 永久 | Git |
| **MinIO 对象数据** | 每日复制同步 | 365天 | 异地集群 |

### 12.2 恢复目标

| 指标 | 目标值 |
|------|------|
| **RTO (恢复时间目标)** | 核心业务 < 4h，全部 < 8h |
| **RPO (恢复点目标)** | 核心业务 < 1h，时序数据 < 24h |

### 12.3 灾难恢复流程

1. 故障检测与验证
2. 启动备用基础设施
3. 数据恢复与校验
4. 服务启动与验证
5. 切换流量与监控
6. 业务验证与发布

---

## 13. 扩展性设计

### 13.1 水平扩展策略

| 组件 | 扩展方式 |
|------|---------|
| **无状态微服务** | 增加 Pod 副本数 + HPA 自动扩容 |
| **Kafka** | 增加分区数 + 增加 Broker 节点 |
| **ClickHouse** | 增加分片 + 增加副本数 |
| **Elasticsearch** | 增加数据节点 + 增加分片 |

### 13.2 性能瓶颈与优化

| 瓶颈点 | 优化方向 |
|-------|---------|
| **日志接收** | 增加 log-svc 副本 + 分区 Kafka topic |
| **关联分析** | 滑动窗口优化 + 规则分层过滤 |
| **查询性能** | ClickHouse 物化视图 + 预聚合 |
| **存储压力** | 数据分区 + 冷热数据分离 |

---

## 14. 合规性要求

| 标准 | 对应要求 |
|------|---------|
| **等级保护 2.0** | 安全审计、访问控制、数据完整性、应急响应 |
| **ISO 27001** | 安全策略、资产管理、访问控制、运维安全 |
| **PCI-DSS** | 持卡人数据保护、审计日志、访问控制 |

---

## 15. 变更记录

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|---------|------|
| v1.0 | 2026-06-07 | 初始版本，完整 SOC 设计 | SOC Team |
| v1.1 | 2026-06-07 | 优化：添加性能指标、数据流向图、部署流程、安全加固、高可用、备份、扩展性、合规性 | SOC Team |

---

## 附录

### A. 术语表

| 术语 | 说明 |
|------|------|
| SOC | Security Operations Center，安全运营中心 |
| IDS | Intrusion Detection System，入侵检测系统 |
| EDR | Endpoint Detection & Response，端点检测与响应 |
| SIEM | Security Information and Event Management，安全信息与事件管理 |
| CVE | Common Vulnerabilities and Exposures，通用漏洞披露 |
| YARA | 用于恶意软件研究的模式匹配工具 |
| Sigma | 通用的日志转换规则格式 |
| AF_XDP | Address Family XDP，Linux 高性能数据包处理框架 |
| RTO | Recovery Time Objective，恢复时间目标 |
| RPO | Recovery Point Objective，恢复点目标 |
| MITRE ATT&CK | 网络攻击行为知识库与分类框架 |

### B. 参考资料

| 资料 | 链接 |
|------|------|
| Suricata IDS/IPS | https://suricata.io/ |
| Sigma Rules | https://github.com/SigmaHQ/sigma |
| K3s Documentation | https://docs.k3s.io/ |
| ClickHouse Documentation | https://clickhouse.com/docs/ |
| Elasticsearch Security | https://www.elastic.co/guide/en/elasticsearch/reference/current/security.html |
| MITRE ATT&CK | https://attack.mitre.org/ |
| **EDR** | 主机在线率/事件数量 |
| **SIEM** | 日志接收速率/解析延迟 |
| **存储** | ClickHouse 查询延迟/写入速率 |

---

## 10. 后续计划

> 本文档为技术设计文档，实施计划将在 Implementation Plan 文档中详细描述。

### 10.1 分阶段实施建议

| 阶段 | 内容 | 时间估算 |
|------|------|---------|
| **第一阶段** | 架构优化 + 容器监控整合 | 2-3 周 |
| **第二阶段** | AI 能力 + SOAR 自动化响应 | 3-4 周 |
| **第三阶段** | 威胁猎捕 + 开放生态集成 | 2-3 周 |

### 10.2 待细化内容

- [ ] 详细的 API 接口规范（OpenAPI/Swagger）
- [ ] 数据库 DDL 脚本
- [ ] Kubernetes YAML 完整资源清单
- [ ] CI/CD 流水线设计
- [ ] 容器镜像构建规范
- [ ] 详细的测试策略
- [ ] AI 模型训练数据准备
- [ ] SOAR Playbook 示例库

### 10.3 依赖关系

```
graph LR
    A[auth-svc] --> B[所有服务]
    C[asset-vuln-svc] --> D[detection-svc]
    E[detection-svc] --> F[intelligence-svc]
    F --> G[response-svc]
    G --> H[platform-svc]
    I[container-svc] --> F
```

---

## 11. 开放生态与集成

### 11.1 开放 API 与 Webhook

| 集成方式 | 说明 |
|---------|------|
| **RESTful API** | 完整的 OpenAPI 3.0 规范 |
| **Webhook** | 告警/事件实时推送 |
| **SDK** | Go/Python/Java SDK |
| **Kafka 消费** | 原始事件流输出 |

### 11.2 第三方系统集成

| 系统类型 | 集成内容 |
|---------|---------|
| **SIEM** | Splunk/Elastic/LogRhythm |
| **ITSM** | Jira/ServiceNow/运维平台 |
| **情报源** | MISP/VirusTotal/OTX |
| **云平台** | AWS/Azure/阿里云安全中心 |

---

## 12. 可观测性增强

### 12.1 Metrics/Tracing/Logging 一体化

| 组件 | 技术 | 用途 |
|------|------|------|
| **Metrics** | Prometheus + Grafana | 性能指标、告警 |
| **Tracing** | Jaeger | 服务链路追踪 |
| **Logging** | Loki | 应用日志聚合 |

### 12.2 一键部署工具链

提供 **helm chart + Terraform + Ansible** 全链路部署：

```bash
# K3s 应用部署
helm install soc ./soc-chart

# 基础设施管理
terraform apply

# 探针部署
ansible-playbook deploy.yml
```

---

## 附录

### A. 术语表

| 术语 | 说明 |
|------|------|
| SOC | Security Operations Center，安全运营中心 |
| IDS | Intrusion Detection System，入侵检测系统 |
| EDR | Endpoint Detection & Response，端点检测与响应 |
| SIEM | Security Information and Event Management，安全信息与事件管理 |
| SIEM | Common Vulnerabilities and Exposures，通用漏洞披露 |
| YARA | 用于恶意软件研究的模式匹配工具 |
| Sigma | 通用的日志转换规则格式 |
| AF_XDP | Address Family XDP，Linux 高性能数据包处理框架 |

### B. 参考资料

- [Suricata IDS/IPS](https://suricata.io/)
- [Sigma Rules](https://github.com/SigmaHQ/sigma)
- [K3s Documentation](https://docs.k3s.io/)
- [ClickHouse Documentation](https://clickhouse.com/docs/)
- [Elasticsearch Security](https://www.elastic.co/guide/en/elasticsearch/reference/current/security.html)

---

**文档状态**: 已批准  
**下次审查**: 实施前
