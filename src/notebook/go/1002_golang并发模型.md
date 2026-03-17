# **使用 Golang 开发高并发应用** 

---

## 一、Go 并发模型基础

### 1. 核心概念

| 概念 | 说明 |
|------|------|
| **Goroutine** | 轻量级协程，初始栈 2KB，可动态增长 |
| **Channel** | 协程间通信管道，遵循 CSP 模型 |
| **GMP 模型** | G(Goroutine) → M(Machine/Thread) → P(Processor) |

### 2. GMP 调度原理
```
┌─────────────────────────────────────────┐
│                  P (Processor)          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │  RunQ   │  │  RunQ   │  │  RunQ   │  │
│  │ [G,G,G] │  │ [G,G,G] │  │ [G,G,G] │  │
│  └────┬────┘  └────┬────┘  └────┬────┘  │
└───────┼────────────┼────────────┼───────┘
        │            │            │
        ▼            ▼            ▼
      M(1)         M(2)         M(3)
     (OS线程)     (OS线程)     (OS线程)
```

---

## 二、并发编程模式

### 1. 生产者-消费者模式
```go
func producer(ch chan<- int) {
    for i := 0; i < 100; i++ {
        ch <- i
    }
    close(ch)
}

func consumer(ch <-chan int, done chan<- struct{}) {
    for v := range ch {
        process(v)
    }
    done <- struct{}{}
}

func main() {
    ch := make(chan int, 10)
    done := make(chan struct{})
    
    go producer(ch)
    go consumer(ch, done)
    
    <-done
}
```

### 2. Worker Pool（工作池）
```go
type Task func()

func workerPool(tasks chan Task, workers int) {
    var wg sync.WaitGroup
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for task := range tasks {
                task()
            }
        }()
    }
    wg.Wait()
}

// 使用
tasks := make(chan Task, 100)
for i := 0; i < 1000; i++ {
    tasks <- func() { /* 任务逻辑 */ }
}
close(tasks)
workerPool(tasks, 10)
```

### 3. 扇出/扇入模式
```go
// 扇出：多个 goroutine 从同一 channel 读取
func fanOut(ch <-chan int, workers int) []<-chan int {
    outputs := make([]<-chan int, workers)
    for i := 0; i < workers; i++ {
        outputs[i] = processWorker(ch)
    }
    return outputs
}

// 扇入：合并多个 channel
func fanIn(channels ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    
    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for v := range c {
                out <- v
            }
        }(ch)
    }
    
    go func() {
        wg.Wait()
        close(out)
    }()
    return out
}
```

### 4. Pipeline 模式
```go
func pipeline() {
    // Stage 1: 生成数据
    gen := func(nums ...int) <-chan int {
        out := make(chan int)
        go func() {
            for _, n := range nums {
                out <- n
            }
            close(out)
        }()
        return out
    }
    
    // Stage 2: 处理数据
    sq := func(in <-chan int) <-chan int {
        out := make(chan int)
        go func() {
            for n := range in {
                out <- n * n
            }
            close(out)
        }()
        return out
    }
    
    // 使用
    for n := range sq(sq(gen(1, 2, 3))) {
        fmt.Println(n)
    }
}
```

---

## 三、并发控制与同步

### 1. sync 包核心组件
```go
// WaitGroup: 等待一组 goroutine
var wg sync.WaitGroup
wg.Add(n)
go func() {
    defer wg.Done()
    // 工作
}()
wg.Wait()

// Mutex: 互斥锁
var mu sync.Mutex
mu.Lock()
// 临界区
mu.Unlock()

// RWMutex: 读写锁（读多写少场景）
var rwmu sync.RWMutex
rwmu.RLock()   // 读锁，可多个
rwmu.RUnlock()
rwmu.Lock()    // 写锁，独占
rwmu.Unlock()

// Once: 只执行一次
var once sync.Once
once.Do(func() { /* 初始化 */ })

// Map: 并发安全 map
var m sync.Map
m.Store("key", "value")
v, ok := m.Load("key")
m.Delete("key")
```

### 2. Context 上下文控制
```go
import "context"

// 超时控制
func handler() {
    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel()
    
    result, err := doWork(ctx)
}

// 取消传播
func doWork(ctx context.Context) (Result, error) {
    select {
    case <-ctx.Done():
        return Result{}, ctx.Err()
    case result := <-process():
        return result, nil
    }
}

// 传递值
ctx := context.WithValue(context.Background(), "traceID", "123")
```

### 3. errgroup 错误处理
```go
import "golang.org/x/sync/errgroup"

func fetchAll() error {
    g, ctx := errgroup.WithContext(context.Background())
    
    var user User
    var order Order
    
    g.Go(func() error {
        user = fetchUser(ctx)
        return nil
    })
    
    g.Go(func() error {
        order = fetchOrder(ctx)
        return nil
    })
    
    if err := g.Wait(); err != nil {
        return err
    }
    // 使用 user, order
    return nil
}
```

---

## 四、限流与熔断

### 1. 限流算法
```go
// 令牌桶
type TokenBucket struct {
    rate     float64       // 令牌生成速率
    capacity float64       // 桶容量
    tokens   float64       // 当前令牌数
    mu       sync.Mutex
}

func (tb *TokenBucket) Allow() bool {
    tb.mu.Lock()
    defer tb.mu.Unlock()
    
    // 补充令牌
    now := time.Now()
    tb.tokens = math.Min(tb.capacity, 
        tb.tokens + tb.rate*now.Sub(tb.lastTime).Seconds())
    tb.lastTime = now
    
    if tb.tokens >= 1 {
        tb.tokens--
        return true
    }
    return false
}
```

### 2. 使用 golang.org/x/time/rate
```go
import "golang.org/x/time/rate"

limiter := rate.NewLimiter(rate.Limit(100), 10) // 100 req/s，突发10

// 阻塞等待
limiter.Wait(context.Background())

// 非阻塞
if limiter.Allow() {
    // 处理请求
}
```

### 3. 熔断器
```go
import "github.com/afex/hystrix-go/hystrix"

hystrix.ConfigureCommand("my_command", hystrix.CommandConfig{
    Timeout:               1000,  // 超时
    MaxConcurrentRequests: 100,   // 最大并发
    ErrorPercentThreshold: 50,    // 错误率阈值
})

err := hystrix.Do("my_command", func() error {
    // 业务逻辑
    return nil
}, func(err error) error {
    // 降级逻辑
    return nil
})
```

---

## 五、连接池管理

### 1. 数据库连接池
```go
db, _ := sql.Open("mysql", dsn)
db.SetMaxOpenConns(100)              // 最大连接数
db.SetMaxIdleConns(20)               // 最大空闲连接
db.SetConnMaxLifetime(time.Hour)     // 连接最大存活时间
db.SetConnMaxIdleTime(time.Minute*30) // 空闲连接超时
```

### 2. Redis 连接池
```go
import "github.com/go-redis/redis/v8"

rdb := redis.NewClient(&redis.Options{
    Addr:         "localhost:6379",
    PoolSize:     100,
    MinIdleConns: 10,
    MaxRetries:   3,
    DialTimeout:  time.Second * 5,
    ReadTimeout:  time.Second * 3,
})
```

### 3. HTTP 连接池
```go
transport := &http.Transport{
    MaxIdleConns:        100,
    MaxIdleConnsPerHost: 20,
    MaxConnsPerHost:     50,
    IdleConnTimeout:     time.Minute,
}
client := &http.Client{
    Transport: transport,
    Timeout:   time.Second * 10,
}
```

---

## 六、缓存架构

### 1. 多级缓存架构
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  请求    │ → │ 本地缓存 │ → │  Redis   │ → │  数据库  │
│         │    │  (L1)    │    │  (L2)    │    │  (L3)    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
    ↑                                      │
    └──────────────────────────────────────┘
                   异步更新
```

### 2. 本地缓存
```go
import "github.com/allegro/bigcache/v3"

cache, _ := bigcache.NewBigCache(bigcache.Config{
    Shards:           1024,               // 分片数
    LifeWindow:       10 * time.Minute,   // 过期时间
    MaxEntriesInWindow: 1000 * 10 * 60,
    MaxEntrySize:     500,
})

cache.Set("key", []byte("value"))
entry, _ := cache.Get("key")
```

### 3. 缓存防击穿
```go
import "golang.org/x/sync/singleflight"

var sf singleflight.Group

func getData(key string) (*Data, error) {
    v, err, _ := sf.Do(key, func() (interface{}, error) {
        // 只有一个请求会执行数据库查询
        return db.Query(key)
    })
    return v.(*Data), err
}
```

---

## 七、高并发 HTTP 服务

### 1. Server 配置优化
```go
server := &http.Server{
    Addr:           ":8080",
    Handler:        router,
    ReadTimeout:    5 * time.Second,
    WriteTimeout:   10 * time.Second,
    IdleTimeout:    120 * time.Second,
    MaxHeaderBytes: 1 << 20,  // 1MB
}

// 优雅关闭
quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
<-quit

ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
server.Shutdown(ctx)
```

### 2. Gin 框架配置
```go
import "github.com/gin-gonic/gin"

r := gin.New()
r.Use(gin.Recovery())
r.Use(gin.Logger())

// 中间件：限流
func RateLimitMiddleware() gin.HandlerFunc {
    limiter := rate.NewLimiter(1000, 100)
    return func(c *gin.Context) {
        if !limiter.Allow() {
            c.AbortWithStatus(429)
            return
        }
        c.Next()
    }
}
```

---

## 八、性能监控

### 1. pprof 集成
```go
import _ "net/http/pprof"

// 访问端点
// /debug/pprof/           - 概览
// /debug/pprof/profile    - CPU 分析
// /debug/pprof/heap       - 堆内存
// /debug/pprof/goroutine  - goroutine
// /debug/pprof/block      - 阻塞分析
// /debug/pprof/mutex      - 互斥锁分析
```

### 2. Prometheus 指标
```go
import "github.com/prometheus/client_golang/prometheus"

var (
    requestCounter = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total HTTP requests",
        },
        []string{"path", "method"},
    )
    
    requestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Help:    "HTTP request duration",
            Buckets: prometheus.DefBuckets,
        },
        []string{"path"},
    )
)
```

---

## 九、最佳实践清单

| 类别 | 实践要点 |
|------|---------|
| **设计** | 无状态服务、水平扩展、异步处理 |
| **并发** | 合理控制 goroutine 数量、避免泄漏、使用 context |
| **内存** | 预分配、对象池、减少逃逸、避免大对象频繁分配 |
| **网络** | 连接池、长连接、压缩、批处理 |
| **数据库** | 连接池、索引、批量操作、读写分离 |
| **缓存** | 多级缓存、预热、防穿透/击穿/雪崩 |
| **容错** | 限流、熔断、降级、重试 |
| **监控** | pprof、链路追踪、日志聚合、告警 |

---

## 十、典型面试题

1. **如何防止 goroutine 泄漏？** → context 取消、channel 关闭检测
2. **高并发下如何保证数据一致性？** → 分布式锁、事务、最终一致性
3. **如何设计一个秒杀系统？** → 限流、预热、异步处理、库存预热
4. **sync.Pool 的原理？** → 对象复用、减少 GC 压力

---

如需针对某个模块深入讲解，请告诉我！