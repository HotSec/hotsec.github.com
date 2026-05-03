# Prometheus 监控 K8s

## 1. Prometheus 架构

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Exporters   │     │ Pushgateway  │     │  AlertManager│
│ (node/cadvisor)│   │ (短时任务)    │     │  (告警管理)   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                     │
       ▼                    ▼                     │
┌──────────────────────────────────────────┐      │
│           Prometheus Server              │      │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │      │
│  │Retrieval │ │   TSDB   │ │  Rules  │ ├──────┘
│  │ (拉取)    │ │ (存储)    │ │ (告警)   │ │
│  └──────────┘ └──────────┘ └─────────┘ │
│  ┌──────────┐ ┌──────────────────────┐ │
│  │  HTTP API│ │ Service Discovery    │ │
│  └──────────┘ └──────────────────────┘ │
└──────────────────┬───────────────────────┘
                   │
                   ▼
           ┌──────────────┐
           │   Grafana    │
           │  (可视化)     │
           └──────────────┘
```

## 2. Prometheus Operator

### 2.1 CRD 资源

| CRD | 说明 |
|-----|------|
| Prometheus | Prometheus 实例定义 |
| Alertmanager | Alertmanager 实例定义 |
| ServiceMonitor | Service 级别监控目标 |
| PodMonitor | Pod 级别监控目标 |
| PrometheusRule | 告警和记录规则 |
| ThanosRuler | Thanos Ruler 实例 |

### 2.2 ServiceMonitor 工作原理

```
ServiceMonitor → 发现 Service → 选择 Endpoints → 抓取 Pod 指标
```

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-app
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app: my-app
  endpoints:
  - port: metrics
    interval: 15s
    path: /metrics
  namespaceSelector:
    matchNames:
    - default
```

## 3. kube-prometheus-stack 部署

### 3.1 Helm 安装

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  --set prometheus.prometheusSpec.retention=15d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.storageClassName=local-path \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi \
  --set grafana.adminPassword=admin123
```

### 3.2 访问服务

```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090
kubectl port-forward -n monitoring svc/kube-prometheus-stack-alertmanager 9093:9093
```

## 4. 监控指标

### 4.1 节点指标（node_exporter）

| 指标 | 说明 |
|------|------|
| `node_cpu_seconds_total` | CPU 使用时间 |
| `node_memory_MemAvailable_bytes` | 可用内存 |
| `node_filesystem_avail_bytes` | 磁盘可用空间 |
| `node_disk_read_time_seconds_total` | 磁盘读延迟 |
| `node_network_receive_bytes_total` | 网络接收字节 |

常用 PromQL：

```promql
# CPU 使用率
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 内存使用率
100 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100)

# 磁盘使用率
100 - (node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.*"} / node_filesystem_size_bytes * 100)

# 磁盘 I/O 使用率
rate(node_disk_read_time_seconds_total[5m]) + rate(node_disk_write_time_seconds_total[5m])
```

### 4.2 Pod 指标（cAdvisor）

| 指标 | 说明 |
|------|------|
| `container_cpu_usage_seconds_total` | 容器 CPU 使用 |
| `container_memory_working_set_bytes` | 容器内存使用 |
| `container_network_receive_bytes_total` | 容器网络接收 |
| `container_fs_reads_bytes_total` | 容器文件系统读 |

```promql
# Pod CPU 使用率
sum(rate(container_cpu_usage_seconds_total{container!=""}[5m])) by (pod) / sum(container_spec_cpu_quota / container_spec_cpu_period) by (pod) * 100

# Pod 内存使用
sum(container_memory_working_set_bytes{container!=""}) by (pod)

# Pod 网络流量
sum(rate(container_network_receive_bytes_total[5m])) by (pod)
```

### 4.3 集群指标（kube-state-metrics）

| 指标 | 说明 |
|------|------|
| `kube_pod_status_phase` | Pod 状态 |
| `kube_deployment_status_replicas` | Deployment 副本数 |
| `kube_node_status_condition` | Node 状态 |
| `kube_pod_container_resource_requests` | 资源请求 |
| `kube_pod_container_resource_limits` | 资源限制 |

```promql
# 不健康的 Pod
kube_pod_status_phase{phase!~"Running|Succeeded"} > 0

# 资源请求率
sum(kube_pod_container_resource_requests{resource="cpu"}) / sum(kube_node_status_allocatable{resource="cpu"}) * 100
```

### 4.4 etcd 指标

```promql
# etcd leader 变更
etcd_server_leader_changes_seen_total

# etcd 磁盘性能
etcd_disk_wal_fsync_duration_seconds

# etcd 慢查询
etcd_server_slow_apply_total
```

## 5. 告警规则

### 5.1 PrometheusRule 示例

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: k8s-alerts
  namespace: monitoring
  labels:
    release: prometheus
spec:
  groups:
  - name: node-alerts
    rules:
    - alert: NodeDown
      expr: up{job="node-exporter"} == 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Node {{ $labels.instance }} is down"

    - alert: NodeDiskFull
      expr: 100 - (node_filesystem_avail_bytes / node_filesystem_size_bytes * 100) > 85
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: "Node {{ $labels.instance }} disk {{ $labels.mountpoint }} is {{ $value }}% full"

    - alert: NodeMemoryFull
      expr: 100 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100) > 90
      for: 5m
      labels:
        severity: warning

  - name: pod-alerts
    rules:
    - alert: PodCrashLoopBackOff
      expr: kube_pod_container_status_waiting_reason{reason="CrashLoopBackOff"} > 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Pod {{ $labels.namespace }}/{{ $labels.pod }} is CrashLoopBackOff"

    - alert: PodNotReady
      expr: kube_pod_status_phase{phase="Pending"} > 0
      for: 15m
      labels:
        severity: warning

    - alert: PVCAlmostFull
      expr: 100 - (kubelet_volume_stats_available_bytes / kubelet_volume_stats_capacity_bytes * 100) > 80
      for: 5m
      labels:
        severity: warning
```

### 5.2 Alertmanager 配置

```yaml
apiVersion: monitoring.coreos.com/v1
kind: AlertmanagerConfig
metadata:
  name: default
  namespace: monitoring
spec:
  route:
    receiver: default
    groupWait: 30s
    groupInterval: 5m
    repeatInterval: 4h
    routes:
    - match:
        severity: critical
      receiver: critical
      repeatInterval: 1h
  receivers:
  - name: default
    webhookConfigs:
    - url: http://alertmanager-webhook:8080/alert
  - name: critical
    webhookConfigs:
    - url: http://alertmanager-webhook:8080/critical
```

## 6. 自定义监控

### 6.1 应用埋点（Go 示例）

```go
import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total HTTP requests",
        },
        []string{"method", "path", "status"},
    )

    httpRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Help:    "HTTP request duration",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "path"},
    )
)

func init() {
    prometheus.MustRegister(httpRequestsTotal)
    prometheus.MustRegister(httpRequestDuration)
}

func main() {
    http.Handle("/metrics", promhttp.Handler())
    http.ListenAndServe(":8080", nil)
}
```

### 6.2 ServiceMonitor 配置

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-metrics
  labels:
    app: my-app
spec:
  selector:
    app: my-app
  ports:
  - name: metrics
    port: 8080
    targetPort: 8080
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-app
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app: my-app
  endpoints:
  - port: metrics
    interval: 15s
    path: /metrics
```

## 7. 长期存储

### 7.1 方案对比

| 方案 | 特点 | 适用场景 |
|------|------|----------|
| Thanos | 全局查询/去重/压缩 | 多集群/长期存储 |
| VictoriaMetrics | 高性能/兼容PromQL | 单集群/高性能 |
| Cortex | 多租户/水平扩展 | SaaS 监控 |

### 7.2 Thanos 架构

```
Grafana → Thanos Query → Thanos Sidecar (Prometheus1)
                      → Thanos Sidecar (Prometheus2)
                      → Thanos Store Gateway (对象存储)
```

```bash
helm install thanos bitnami/thanos \
  --set objstore.config='type: S3\nconfig:\n  bucket: thanos\n  endpoint: minio:9000\n  access_key: minio\n  secret_key: minio123\n  insecure: true'
```

## 8. 面试题

### 1. Prometheus 的 Pull 和 Push 模式？

- **Pull（默认）**：Prometheus 主动拉取目标指标，适合长期运行服务
- **Push**：通过 Pushgateway 推送，适合短时任务（批处理/CronJob）
- Pull 模式优势：服务发现/健康检查/避免推送风暴

### 2. ServiceMonitor 和 PodMonitor 的区别？

- ServiceMonitor：通过 Service 发现目标，适合有 Service 的应用
- PodMonitor：直接发现 Pod，适合不需要 Service 的应用

### 3. Prometheus 数据如何持久化？

- 本地 TSDB：`--storage.tsdb.path`，默认保留 15 天
- 远程写入：`remote_write` 到 Thanos/VictoriaMetrics/Cortex
- Prometheus Operator：通过 `storageSpec.volumeClaimTemplate` 配置 PVC
