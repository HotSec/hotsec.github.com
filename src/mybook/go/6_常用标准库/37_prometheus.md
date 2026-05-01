# Prometheus Go 客户端

## 一、安装

```bash
go get github.com/prometheus/client_golang/prometheus
go get github.com/prometheus/client_golang/prometheus/promhttp
```

## 二、指标类型

### 2.1 Counter（计数器）

```go
var httpRequestsTotal = prometheus.NewCounterVec(
    prometheus.CounterOpts{
        Name: "http_requests_total",
        Help: "Total number of HTTP requests",
    },
    []string{"method", "path", "status"},
)

func init() {
    prometheus.MustRegister(httpRequestsTotal)
}

httpRequestsTotal.WithLabelValues("GET", "/api/users", "200").Inc()
```

### 2.2 Gauge（仪表盘）

```go
var activeConnections = prometheus.NewGauge(
    prometheus.GaugeOpts{
        Name: "active_connections",
        Help: "Number of active connections",
    },
)

activeConnections.Inc()
activeConnections.Dec()
activeConnections.Set(42)
```

### 2.3 Histogram（直方图）

```go
var httpDuration = prometheus.NewHistogramVec(
    prometheus.HistogramOpts{
        Name:    "http_request_duration_seconds",
        Help:    "HTTP request duration in seconds",
        Buckets: prometheus.DefBuckets,
    },
    []string{"method", "path"},
)

httpDuration.WithLabelValues("GET", "/api/users").Observe(0.1)
```

### 2.4 Summary（摘要）

```go
var requestDuration = prometheus.NewSummaryVec(
    prometheus.SummaryOpts{
        Name:       "request_duration_seconds",
        Help:       "Request duration in seconds",
        Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.99: 0.001},
    },
    []string{"method"},
)

requestDuration.WithLabelValues("GET").Observe(0.1)
```

## 三、暴露指标端点

```go
r := gin.Default()
r.GET("/metrics", gin.WrapH(promhttp.Handler()))
r.Run(":8080")
```

## 四、Gin 中间件

```go
func PrometheusMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()
        duration := time.Since(start).Seconds()
        status := strconv.Itoa(c.Writer.Status())
        httpRequestsTotal.WithLabelValues(c.Request.Method, c.FullPath(), status).Inc()
        httpDuration.WithLabelValues(c.Request.Method, c.FullPath()).Observe(duration)
    }
}
```

## 五、PromQL 查询示例

```promql
rate(http_requests_total[5m])
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
sum by (method) (rate(http_requests_total[5m]))
```
