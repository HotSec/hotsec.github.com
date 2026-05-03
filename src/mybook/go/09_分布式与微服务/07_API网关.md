# API 网关

API 网关是微服务架构的入口，统一处理请求路由、认证、限流等。

---

## 一、网关功能

- **路由转发**：请求分发到后端服务
- **负载均衡**：多实例负载
- **认证授权**：统一身份验证
- **限流熔断**：保护后端服务
- **协议转换**：HTTP/gRPC 转换
- **日志监控**：请求日志和指标

---

## 二、常见网关

| 网关 | 特点 |
|------|------|
| Kong | 基于 Nginx，插件丰富 |
| APISIX | Apache 项目，云原生 |
| Traefik | 自动服务发现 |
| Envoy | Service Mesh 数据面 |
| go-zero gateway | Go 原生，轻量 |

---

## 三、自定义网关实现

### 3.1 基本结构

```go
type Gateway struct {
    routes     map[string]*Route
    middleware []Middleware
    lb         LoadBalancer
}

type Route struct {
    Path    string
    Method  string
    Backend string
}

type Middleware func(http.Handler) http.Handler
```

### 3.2 路由匹配

```go
func (g *Gateway) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    route := g.matchRoute(r.Method, r.URL.Path)
    if route == nil {
        http.Error(w, "Not Found", 404)
        return
    }

    handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        g.forward(w, r, route)
    })

    for i := len(g.middleware) - 1; i >= 0; i-- {
        handler = g.middleware[i](handler)
    }

    handler.ServeHTTP(w, r)
}

func (g *Gateway) matchRoute(method, path string) *Route {
    for _, route := range g.routes {
        if route.Method == method && strings.HasPrefix(path, route.Path) {
            return route
        }
    }
    return nil
}
```

### 3.3 请求转发

```go
func (g *Gateway) forward(w http.ResponseWriter, r *http.Request, route *Route) {
    target := g.lb.Select(route.Backend)

    proxy := httputil.NewSingleHostReverseProxy(target)
    proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
        http.Error(w, "Bad Gateway", 502)
    }

    proxy.ServeHTTP(w, r)
}
```

---

## 四、中间件实现

### 4.1 认证中间件

```go
func AuthMiddleware(secret string) Middleware {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            token := r.Header.Get("Authorization")
            if token == "" {
                http.Error(w, "Unauthorized", 401)
                return
            }

            claims, err := ValidateJWT(token, secret)
            if err != nil {
                http.Error(w, "Unauthorized", 401)
                return
            }

            ctx := context.WithValue(r.Context(), "user", claims)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}
```

### 4.2 限流中间件

```go
func RateLimitMiddleware(rps int) Middleware {
    limiter := rate.NewLimiter(rate.Limit(rps), rps*2)

    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            if !limiter.Allow() {
                http.Error(w, "Too Many Requests", 429)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
}
```

### 4.3 日志中间件

```go
func LoggingMiddleware(logger *zap.Logger) Middleware {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            start := time.Now()

            wrapped := &responseWriter{ResponseWriter: w}
            next.ServeHTTP(wrapped, r)

            logger.Info("request",
                zap.String("method", r.Method),
                zap.String("path", r.URL.Path),
                zap.Int("status", wrapped.status),
                zap.Duration("latency", time.Since(start)),
            )
        })
    }
}
```

---

## 五、负载均衡

### 5.1 轮询

```go
type RoundRobin struct {
    addrs []string
    index uint32
}

func (lb *RoundRobin) Select(service string) *url.URL {
    i := atomic.AddUint32(&lb.index, 1)
    addr := lb.addrs[i%uint32(len(lb.addrs))]
    u, _ := url.Parse(addr)
    return u
}
```

### 5.2 加权轮询

```go
type WeightedRoundRobin struct {
    servers []*Server
    index   int
    current int
}

type Server struct {
    Addr   string
    Weight int
}

func (lb *WeightedRoundRobin) Select() string {
    for {
        lb.index = (lb.index + 1) % len(lb.servers)
        if lb.index == 0 {
            lb.current--
            if lb.current <= 0 {
                lb.current = lb.servers[lb.index].Weight
            }
        }
        if lb.current > 0 {
            return lb.servers[lb.index].Addr
        }
    }
}
```

---

## 六、服务发现集成

```go
type DiscoveryLoadBalancer struct {
    discovery ServiceDiscovery
    cache     sync.Map
}

func (lb *DiscoveryLoadBalancer) Select(service string) (*url.URL, error) {
    addrs, err := lb.discovery.GetInstances(service)
    if err != nil {
        return nil, err
    }

    if len(addrs) == 0 {
        return nil, errors.New("no instances")
    }

    i := rand.Intn(len(addrs))
    return url.Parse(addrs[i])
}
```

---

## 七、最佳实践

1. **配置热更新**：路由规则支持动态更新
2. **健康检查**：定期检查后端服务健康
3. **熔断降级**：后端故障时快速失败
4. **监控告警**：请求量、错误率监控
5. **安全加固**：HTTPS、WAF 防护
