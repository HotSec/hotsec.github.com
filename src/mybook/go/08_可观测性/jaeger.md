# Jaeger 分布式追踪

## 一、部署

```bash
docker run -d --name jaeger \
  -p 6831:6831/udp \
  -p 16686:16686 \
  -p 14268:14268 \
  jaegertracing/all-in-one:1.52
```

- 16686：Web UI
- 14268：HTTP 收集端点
- 6831：UDP Jaeger Agent

## 二、Go 集成

```go
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/jaeger"
    "go.opentelemetry.io/otel/sdk/resource"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
)

func initTracer() (*sdktrace.TracerProvider, error) {
    exp, err := jaeger.New(jaeger.WithCollectorEndpoint(
        jaeger.WithEndpoint("http://localhost:14268/api/traces"),
    ))
    if err != nil {
        return nil, err
    }

    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exp),
        sdktrace.WithResource(resource.NewWithAttributes(
            semconv.SchemaURL,
            semconv.ServiceNameKey.String("myapp"),
            semconv.DeploymentEnvironmentKey.String("production"),
        )),
        sdktrace.WithSampler(sdktrace.TraceIDRatioBased(0.5)),
    )

    otel.SetTracerProvider(tp)
    return tp, nil
}
```

## 三、采样策略

| 策略 | 说明 |
|------|------|
| `AlwaysSample` | 采集所有 trace |
| `NeverSample` | 不采集 |
| `TraceIDRatioBased(0.1)` | 按 10% 比例采样 |
| `ParentBased` | 根据父 span 决定 |

## 四、Span 数据模型

- TraceID：整个链路唯一 ID
- SpanID：当前操作唯一 ID
- ParentSpanID：父操作 ID
- OperationName：操作名称
- StartTime/Duration：开始时间和耗时
- Tags：键值对标签
- Logs：事件日志
- Status：状态（OK/Error）

## 五、Web UI

访问 `http://localhost:16686` 查看 Jaeger UI，可按服务/操作/时间范围搜索 trace。
