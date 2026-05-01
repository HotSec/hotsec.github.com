# Go kit 微服务

## 一、概述

Go kit 是一个微服务工具集，提供：
- 服务定义与传输层解耦
- 中间件模式（日志/指标/链路追踪）
- 代码分层（Endpoint/Service/Transport）

## 二、代码分层

```
service/     业务逻辑层
endpoint/    端点层（请求/响应结构）
transport/   传输层（HTTP/gRPC）
```

## 三、基本示例

### 3.1 Service 层

```go
type StringService interface {
    Uppercase(string) (string, error)
    Count(string) int
}

type stringService struct{}

func (s stringService) Uppercase(str string) (string, error) {
    if str == "" {
        return "", ErrEmpty
    }
    return strings.ToUpper(str), nil
}

func (s stringService) Count(str string) int {
    return len(str)
}
```

### 3.2 Endpoint 层

```go
type UppercaseRequest struct {
    S string `json:"s"`
}

type UppercaseResponse struct {
    V   string `json:"v"`
    Err string `json:"err,omitempty"`
}

func makeUppercaseEndpoint(svc StringService) endpoint.Endpoint {
    return func(ctx context.Context, request interface{}) (interface{}, error) {
        req := request.(UppercaseRequest)
        v, err := svc.Uppercase(req.S)
        if err != nil {
            return UppercaseResponse{V: v, Err: err.Error()}, nil
        }
        return UppercaseResponse{V: v}, nil
    }
}
```

### 3.3 Transport 层

```go
func MakeHTTPHandler(svc StringService) http.Handler {
    r := mux.NewRouter()
    uppercaseHandler := httptransport.NewServer(
        makeUppercaseEndpoint(svc),
        decodeUppercaseRequest,
        encodeResponse,
    )
    r.Handle("/uppercase", uppercaseHandler).Methods("POST")
    return r
}

func decodeUppercaseRequest(_ context.Context, r *http.Request) (interface{}, error) {
    var request UppercaseRequest
    if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
        return nil, err
    }
    return request, nil
}

func encodeResponse(_ context.Context, w http.ResponseWriter, response interface{}) error {
    return json.NewEncoder(w).Encode(response)
}
```

## 四、中间件

### 4.1 日志中间件

```go
type loggingMiddleware struct {
    logger log.Logger
    next   StringService
}

func (mw loggingMiddleware) Uppercase(s string) (output string, err error) {
    defer func(begin time.Time) {
        mw.logger.Log("method", "uppercase", "input", s, "output", output, "err", err, "took", time.Since(begin))
    }(time.Now())
    output, err = mw.next.Uppercase(s)
    return
}
```

### 4.2 Endpoint 中间件

```go
func loggingMiddleware(logger log.Logger) endpoint.Middleware {
    return func(next endpoint.Endpoint) endpoint.Endpoint {
        return func(ctx context.Context, request interface{}) (interface{}, error) {
            logger.Log("msg", "calling endpoint")
            defer logger.Log("msg", "called endpoint")
            return next(ctx, request)
        }
    }
}
```
