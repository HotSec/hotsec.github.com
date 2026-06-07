# 容器监控模块设计方案

## 1. 概述

### 1.1 项目背景

在当前 SOC 平台中，EDR 模块已实现 Linux/Windows 主机监控能力。为支持云原生环境下的安全监控需求，需扩展容器运行时监控功能，覆盖 Docker、Containerd、Podman 等容器运行时，以及 Kubernetes 集群资源监控。

### 1.2 设计目标

- 支持多容器运行时监控（Docker/Containerd/Podman）
- 实现容器内进程、网络、文件操作监控
- 支持 Kubernetes 资源与事件监控
- 检测容器逃逸等安全威胁
- 与现有 SOC 平台无缝集成

### 1.3 监控范围

| 类别 | 监控项 |
|------|--------|
| **容器运行时** | Docker API、Containerd CRI、K8s API |
| **进程监控** | 容器内进程创建、敏感命令执行 |
| **网络监控** | 容器网络连接、异常流量 |
| **文件监控** | 敏感目录访问、挂载操作 |
| **安全检测** | 容器逃逸、特权容器、危险能力 |
| **镜像安全** | 镜像漏洞扫描、CVE 检测 |

---

## 2. 整体架构

```
┌────────────────────────────────────────────────────────────────────┐
│                    容器监控模块架构                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    数据采集层                                  │  │
│  │                                                               │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │  │
│  │  │   eBPF 探针     │  │  容器运行时 API │  │  K8s API Client│ │  │
│  │  │ (运行时行为)    │  │  (容器元数据)   │  │  (K8s 资源)   │ │  │
│  │  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘ │  │
│  │           │                   │                   │          │  │
│  └───────────┼───────────────────┼───────────────────┼──────────┘  │
│              │                   │                   │              │
│              └───────────────────┴───────────────────┘              │
│                                  │                                    │
│                                  ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    事件处理层                                  │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │                 容器事件标准化                           │  │  │
│  │  │  • 事件类型分类   • 威胁检测   • 告警生成               │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                              │                               │  │
│  │  ┌────────────────────────────┼────────────────────────────┐ │  │
│  │  │           事件分流          │                             │ │  │
│  │  │    ┌─────────┐      ┌─────────┐      ┌─────────┐       │ │  │
│  │  │    │ 进程    │      │  网络    │      │  文件   │       │ │  │
│  │  │    │ 事件    │      │  事件    │      │  事件   │       │ │  │
│  │  │    └─────────┘      └─────────┘      └─────────┘       │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                  │                                    │
│                                  ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    存储与分析层                                │  │
│  │                                                               │  │
│  │  ┌─────────────────┐  ┌─────────────────┐                   │  │
│  │  │   ClickHouse     │  │  Elasticsearch  │                   │  │
│  │  │  (时序数据)      │  │  (全文检索)      │                   │  │
│  │  └─────────────────┘  └─────────────────┘                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. 事件类型

### 3.1 容器生命周期事件

| 事件类型 | 说明 | 威胁级别 |
|---------|------|---------|
| `container_start` | 容器启动 | INFO |
| `container_stop` | 容器停止 | INFO |
| `container_create` | 容器创建 | INFO |
| `container_delete` | 容器删除 | INFO |
| `container_pause` | 容器暂停 | LOW |
| `container_unpause` | 容器恢复 | LOW |

### 3.2 进程相关事件

| 事件类型 | 说明 | 威胁级别 |
|---------|------|---------|
| `process_create` | 进程创建 | INFO |
| `process_exec` | 进程执行 | MEDIUM |
| `process_exit` | 进程退出 | INFO |
| `sensitive_command` | 敏感命令执行 | HIGH |

**敏感命令列表：** `kubectl`、`docker`、`ssh`、`scp`、`wget`、`curl`、`nc`、`ncat`、`bash`、`sh`

### 3.3 网络相关事件

| 事件类型 | 说明 | 威胁级别 |
|---------|------|---------|
| `network_connect` | 网络连接 | INFO |
| `network_accept` | 网络监听 | INFO |
| `dns_query` | DNS 查询 | LOW |
| `suspicious_dns` | 可疑 DNS | HIGH |
| `lateral_movement` | 横向移动 | CRITICAL |

### 3.4 文件系统事件

| 事件类型 | 说明 | 威胁级别 |
|---------|------|---------|
| `file_create` | 文件创建 | INFO |
| `file_write` | 文件写入 | INFO |
| `file_delete` | 文件删除 | MEDIUM |
| `file_read` | 文件读取 | LOW |
| `sensitive_path_access` | 敏感路径访问 | HIGH |

**敏感路径列表：** `/etc/shadow`、`/etc/passwd`、`/root/.ssh`、`/var/log`、`/proc/sys`

### 3.5 安全相关事件

| 事件类型 | 说明 | 威胁级别 |
|---------|------|---------|
| `container_escape_attempt` | 容器逃逸尝试 | CRITICAL |
| `privileged_container` | 特权容器 | CRITICAL |
| `dangerous_capability` | 危险能力使用 | HIGH |
| `host_path_mount` | 宿主机路径挂载 | HIGH |
| `abnormal_syscall` | 异常系统调用 | MEDIUM |

---

## 4. 数据模型

### 4.1 容器运行时信息

```go
// 容器运行时信息
type ContainerInfo struct {
    ContainerID     string            `json:"container_id"`
    ContainerName   string            `json:"container_name"`
    Image           string            `json:"image"`
    ImageTag        string            `json:"image_tag"`
    ImageDigest     string            `json:"image_digest"`
    Runtime         string            `json:"runtime"`          // docker/containerd/podman
    Status          string            `json:"status"`           // running/stopped/paused
    Created         time.Time         `json:"created"`
    Started         time.Time         `json:"started"`
    PodName         string            `json:"pod_name,omitempty"`
    Namespace       string            `json:"namespace,omitempty"`
    Labels          map[string]string `json:"labels"`
    Hosts           []string          `json:"hosts"`
    NetworkMode     string            `json:"network_mode"`
    Privileged      bool              `json:"privileged"`
    Capabilities    []string          `json:"capabilities"`
}
```

### 4.2 容器监控事件

```go
// 容器监控事件
type ContainerEvent struct {
    EventID        string            `json:"event_id"`
    Timestamp      time.Time         `json:"timestamp"`
    ContainerID    string            `json:"container_id"`
    ContainerName  string            `json:"container_name"`
    Image          string            `json:"image"`
    Hostname       string            `json:"hostname"`
    AssetID        string            `json:"asset_id"`
    EventType      string            `json:"event_type"`       // lifecycle/process/network/file/security
    Action         string            `json:"action"`           // start/stop/create/delete/exec/connect
    ProcessID      uint32            `json:"process_id,omitempty"`
    ProcessName    string            `json:"process_name,omitempty"`
    ProcessPath    string            `json:"process_path,omitempty"`
    Command        string            `json:"command,omitempty"`
    SourceIP       string            `json:"source_ip,omitempty"`
    DestIP         string            `json:"dest_ip,omitempty"`
    SourcePort     uint16            `json:"source_port,omitempty"`
    DestPort       uint16            `json:"dest_port,omitempty"`
    Protocol       string            `json:"protocol,omitempty"`
    FilePath       string            `json:"file_path,omitempty"`
    ThreatLevel    int               `json:"threat_level"`     // 1-5
    Tags           []string          `json:"tags"`
    Details        map[string]any    `json:"details,omitempty"`
    RawData        []byte            `json:"raw_data,omitempty"`
}
```

### 4.3 容器安全告警

```go
// 容器安全告警
type ContainerAlert struct {
    AlertID        string            `json:"alert_id"`
    Title          string            `json:"title"`
    Description    string            `json:"description"`
    Severity       string            `json:"severity"`         // CRITICAL/HIGH/MEDIUM/LOW
    ContainerID    string            `json:"container_id"`
    ContainerName  string            `json:"container_name"`
    Image          string            `json:"image"`
    PodName        string            `json:"pod_name,omitempty"`
    Namespace      string            `json:"namespace,omitempty"`
    EventType      string            `json:"event_type"`
    Source         string            `json:"source"`            // ebpf/runtime_api/k8s_api/falco
    MITREAttack    string            `json:"mitre_attack,omitempty"`
    Recommendation string            `json:"recommendation,omitempty"`
    Status         string            `json:"status"`           // NEW/ACKNOWLEDGED/CLOSED
    CreatedAt      time.Time         `json:"created_at"`
    AssetID        string            `json:"asset_id"`
}
```

### 4.4 Kubernetes 资源

```go
// Kubernetes 资源信息
type K8sResource struct {
    ResourceType   string            `json:"resource_type"`  // pod/deployment/service/namespace
    Name           string            `json:"name"`
    Namespace      string            `json:"namespace"`
    Labels         map[string]string `json:"labels"`
    Status         string            `json:"status"`
    CreatedAt      time.Time         `json:"created_at"`
    PodCount       int               `json:"pod_count,omitempty"`
    ContainerCount  int               `json:"container_count,omitempty"`
}

// K8s 审计事件
type K8sAuditEvent struct {
    EventID        string            `json:"event_id"`
    Timestamp      time.Time         `json:"timestamp"`
    Verb           string            `json:"verb"`             // create/delete/update
    Resource       string            `json:"resource"`
    Namespace      string            `json:"namespace"`
    User           string            `json:"user"`
    SourceIPs      []string          `json:"source_ips"`
    Result         string            `json:"result"`           // success/failure
    RequestURI     string            `json:"request_uri"`
    ThreatLevel    int               `json:"threat_level"`
}
```

---

## 5. 技术实现

### 5.1 eBPF 探针

| 探针类型 | 挂载点 | 监控内容 |
|---------|--------|---------|
| **进程监控** | `tracepoint/syscalls/proc_exec` | 容器内进程创建 |
| **网络监控** | `tracepoint/syscalls/socket_create` | 网络连接创建 |
| **文件监控** | `tracepoint/syscalls/openat` | 文件操作 |
| **系统调用** | `tracepoint/raw_syscalls/*` | 敏感系统调用 |

**eBPF 优势：**
- 零侵入式监控
- 内核级性能
- 动态可加载
- 容器感知（通过 cgroup v2）

### 5.2 容器运行时 API

| 运行时 | Socket 路径 | 监控方式 |
|-------|------------|---------|
| Docker | `unix:///var/run/docker.sock` | Docker Engine API |
| Containerd | `unix:///run/containerd/containerd.sock` | Containerd CRI |
| Podman | `unix:///run/user/0/podman/podman.sock` | Podman API |

**获取信息：**
- 容器列表与状态
- 镜像信息
- 网络配置
- 挂载卷信息
- 容器日志

### 5.3 Kubernetes API

| API 端点 | 监控内容 |
|---------|---------|
| `/api/v1/pods` | Pod 状态与事件 |
| `/api/v1/namespaces` | 命名空间 |
| `/apis/apps/v1/deployments` | Deployment 状态 |
| `/api/v1/services` | Service 配置 |
| `/api/v1/events` | K8s 事件流 |
| `/apis/audit.k8s.io/v1/auditsummaries` | 审计日志 |

### 5.4 Falco 集成

Falco 是 CNCF 孵化的运行时安全项目，提供开箱即用的安全规则：

| 规则类别 | 说明 |
|---------|------|
| **容器逃逸** | 检测敏感路径挂载、特权容器 |
| ** shell 启用** | 检测容器内 shell 启用行为 |
| **文件修改** | 检测 /etc/passwd 等敏感文件修改 |
| **网络活动** | 检测异常网络行为 |
| **系统调用** | 检测异常系统调用序列 |

---

## 6. 容器逃逸检测规则

| 检测类型 | 规则描述 | 条件 | 严重程度 |
|---------|---------|------|---------|
| **敏感路径挂载** | 挂载 /proc、/sys、/etc、/var/run | 容器配置了危险挂载 | CRITICAL |
| **特权容器** | 容器配置了 --privileged | 容器特权模式开启 | CRITICAL |
| **危险能力** | CAP_SYS_ADMIN、SYS_ADMIN | 容器添加了危险能力 | HIGH |
| **宿主进程访问** | 容器内进程访问宿主机 /host 路径 | 检测到 /host 路径访问 | HIGH |
| **异常系统调用** | 不常见的系统调用序列 | syscall 序列异常 | MEDIUM |
| **容器间通信异常** | 未经允许的跨容器通信 | 检测到跨容器网络 | MEDIUM |
| **节点资源滥用** | 容器使用大量节点资源 | CPU/内存使用异常 | LOW |
| **恶意镜像行为** | 镜像执行恶意命令 | 命令序列匹配恶意模式 | CRITICAL |

---

## 7. API 接口设计

### 7.1 容器管理 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/containers` | 容器列表 |
| GET | `/api/v1/containers/:id` | 容器详情 |
| GET | `/api/v1/containers/:id/events` | 容器事件列表 |
| GET | `/api/v1/containers/:id/stats` | 容器资源统计 |
| GET | `/api/v1/containers/:id/logs` | 容器日志 |
| POST | `/api/v1/containers/:id/stop` | 停止容器 |
| POST | `/api/v1/containers/:id/pause` | 暂停容器 |

### 7.2 镜像管理 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/containers/images` | 镜像列表 |
| GET | `/api/v1/containers/images/:id/vulns` | 镜像漏洞 |
| GET | `/api/v1/containers/images/:id/history` | 镜像历史 |

### 7.3 Kubernetes API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/k8s/pods` | K8s Pod 列表 |
| GET | `/api/v1/k8s/pods/:namespace/:name` | Pod 详情 |
| GET | `/api/v1/k8s/namespaces` | K8s 命名空间 |
| GET | `/api/v1/k8s/deployments` | Deployment 列表 |
| GET | `/api/v1/k8s/services` | Service 列表 |
| GET | `/api/v1/k8s/audit` | K8s 审计日志 |

### 7.4 告警与事件 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/container-alerts` | 容器告警列表 |
| GET | `/api/v1/container-alerts/:id` | 告警详情 |
| PUT | `/api/v1/container-alerts/:id` | 更新告警状态 |
| POST | `/api/v1/container-alerts/:id/ack` | 确认告警 |
| GET | `/api/v1/container-events` | 容器事件查询 |
| POST | `/api/v1/container-events/search` | 事件搜索 |

---

## 8. 部署架构

```
┌────────────────────────────────────────────────────────────────┐
│                    容器监控部署架构                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              宿主机 (每台物理机/节点)                      │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │              Container Monitor Agent              │   │   │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐        │   │   │
│  │  │  │  eBPF   │  │ Runtime │  │  K8s    │        │   │   │
│  │  │  │ Probe   │  │  API    │  │ Client  │        │   │   │
│  │  │  └─────────┘  └─────────┘  └─────────┘        │   │   │
│  │  │         │             │             │          │   │   │
│  │  │         └─────────────┴─────────────┘          │   │   │
│  │  │                     │                          │   │   │
│  │  │                     ▼                          │   │   │
│  │  │              ┌────────────┐                     │   │   │
│  │  │              │   Local    │                     │   │   │
│  │  │              │   Buffer   │                     │   │   │
│  │  │              │  (内存)    │                     │   │   │
│  │  │              └────────────┘                     │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                          │                              │   │
│  │                    安全传输 (TLS)                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                    K3s 集群                              │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │   │
│  │  │ container-svc │  │  Kafka       │  │ ClickHouse │ │   │
│  │  │ (Go 微服务)   │  │  (消息队列)   │  │ (时序存储) │ │   │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 8.1 组件说明

| 组件 | 部署位置 | 说明 |
|------|---------|------|
| **eBPF Probe** | 宿主机内核 | 内核模块，采集运行时行为 |
| **Runtime API Client** | 宿主机 | 连接容器运行时获取元数据 |
| **K8s Client** | 宿主机/集群 | 连接 K8s API 获取资源信息 |
| **Local Buffer** | 宿主机内存 | 事件本地缓存，防止丢失 |
| **container-svc** | K3s Pod | 容器监控微服务 |
| **Kafka** | K3s Pod | 事件消息队列 |
| **ClickHouse** | K3s Pod | 时序数据存储 |

---

## 9. 与现有 EDR 模块集成

### 9.1 集成方式

容器监控作为 EDR Agent 的扩展模块实现：

```go
// EDR Agent 扩展容器监控
type EDRContainerPlugin struct {
    // 原有 EDR 能力
    ProcessMonitor *ProcessMonitor
    FileMonitor    *FileMonitor
    NetworkMonitor *NetworkMonitor
    
    // 新增容器监控能力
    ContainerRuntime *ContainerRuntimeAPI
    BPFProbe         *BPFProbe
    K8sClient        *K8sClient
}
```

### 9.2 数据上报

容器事件通过统一的事件通道上报：

```go
// 统一事件格式
type UnifiedEvent struct {
    EventSource string  // "host" / "container"
    HostEvent   *EDREvent      // 主机事件（可选）
    ContainerEvent *ContainerEvent // 容器事件（可选）
}
```

---

## 10. 性能指标

| 指标 | 目标值 |
|------|--------|
| 事件采集延迟 | < 100ms |
| 事件上报延迟 | < 500ms |
| CPU 开销（单容器） | < 1% |
| 内存开销（单容器） | < 10MB |
| 支持容器规模 | 单主机 100+ 容器 |
| 事件吞吐量 | 10000 events/sec/host |

---

## 11. 安全考虑

### 11.1 数据安全

- 事件传输使用 TLS 加密
- 本地缓存数据加密存储
- 敏感信息脱敏处理

### 11.2 容器安全

- Agent 以非 root 权限运行
- 最小化容器能力集
- 限制文件系统访问

### 11.3 隐私保护

- 用户命令行参数可选脱敏
- 敏感文件路径过滤
- 隐私配置可关闭

---

## 12. 依赖组件

| 组件 | 版本要求 | 说明 |
|------|---------|------|
| Linux Kernel | >= 4.8 | eBPF 支持 |
| Docker | >= 20.10 | Docker 运行时 |
| Containerd | >= 1.5 | Containerd 运行时 |
| Kubernetes | >= 1.20 | K8s 集群（可选） |
| BCC | >= 0.20 | eBPF 编译器集合 |
| Go | >= 1.21 | 微服务开发 |
