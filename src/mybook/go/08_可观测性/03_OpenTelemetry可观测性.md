# OpenTelemetry 链路追踪

## 一、安装

```bash
go get go.opentelemetry.io/otel
go get go.opentelemetry.io/otel/sdk
go get go.opentelemetry.io/otel/exporters/jaeger
go get go.opentelemetry.io/otel/bridge/opentracing
```

## 二、初始化 Provider

```go
func initTracer() (*sdktrace.TracerProvider, error) {
    exp, err := jaeger.New(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint("http://localhost:14268/api/traces")))
    if err != nil {
        return nil, err
    }

    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exp),
        sdktrace.WithResource(resource.NewWithAttributes(
            semconv.SchemaURL,
            semconv.ServiceNameKey.String("myapp"),
        )),
    )

    otel.SetTracerProvider(tp)
    otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
        propagation.TraceContext{},
        propagation.Baggage{},
    ))

    return tp, nil
}
```

## 三、HTTP 链路追踪

```go
func main() {
    tp, _ := initTracer()
    defer tp.Shutdown(context.Background())

    r := gin.Default()
    r.Use(otelgin.Middleware("myapp"))

    r.GET("/api", func(c *gin.Context) {
        ctx, span := otel.Tracer("myapp").Start(c.Request.Context(), "handle-api")
        defer span.End()

        result, err := callService(ctx, "http://backend:8081/process")
        c.JSON(200, gin.H{"result": result, "err": err})
    })

    r.Run(":8080")
}
```

## 四、手动埋点

```go
func processOrder(ctx context.Context, orderID string) error {
    ctx, span := otel.Tracer("myapp").Start(ctx, "processOrder",
        trace.WithAttributes(attribute.String("order.id", orderID)),
    )
    defer span.End()

    err := validateOrder(ctx, orderID)
    if err != nil {
        span.RecordError(err)
        span.SetStatus(codes.Error, err.Error())
        return err
    }

    span.AddEvent("order_validated", trace.WithAttributes(
        attribute.String("order.id", orderID),
    ))

    return nil
}
```

## 五、gRPC 链路追踪

```go
conn, _ := grpc.Dial(
    "localhost:50051",
    grpc.WithTransportCredentials(insecure.NewCredentials()),
    grpc.WithUnaryInterceptor(otelgrpc.UnaryClientInterceptor()),
)

server := grpc.NewServer(
    grpc.UnaryInterceptor(otelgrpc.UnaryServerInterceptor()),
)
```

## 六、与 Gin 集成

```bash
go get go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin
```

```go
r := gin.Default()
r.Use(otelgin.Middleware("myapp"))
```
