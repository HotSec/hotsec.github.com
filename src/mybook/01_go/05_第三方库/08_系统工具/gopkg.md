# gopkg

字节跳动开源的 Go 通用工具包。

`https://github.com/bytedance/gopkg`

## 核心包

### logger

高性能结构化日志库：

```go
import "github.com/bytedance/gopkg/logger"

log := logger.New(logger.Config{
    Level: logger.InfoLevel,
})

log.Info("request processed",
    logger.String("method", "GET"),
    logger.Int("status", 200),
    logger.Duration("latency", time.Millisecond*45),
)
```

### util

通用工具函数：

```go
import "github.com/bytedance/gopkg/util"

str := util.ToString(42)
```

### collection

集合操作工具：

```go
import "github.com/bytedance/gopkg/collection"

unique := collection.Unique([]string{"a", "b", "a"})
```

## 子包一览

| 包 | 功能 |
|---|------|
| logger | 结构化日志 |
| util | 通用工具函数 |
| collection | 集合操作 |
| goroutine | 协程管理 |
| retry | 重试机制 |
| heap | 堆实现 |
| limit | 限流器 |
| syncx | 同步原语扩展 |

## retry 重试

```go
import "github.com/bytedance/gopkg/retry"

err := retry.Do(func() error {
    return callAPI()
}, retry.WithMaxAttempts(3), retry.WithDelay(time.Second))
```

## limit 限流

```go
import "github.com/bytedance/gopkg/limit"

limiter := limit.NewRateLimiter(100, time.Second)
if limiter.Allow() {
}
```

## goroutine 协程管理

```go
import "github.com/bytedance/gopkg/goroutine"

pool := goroutine.NewPool(10)
pool.Go(func() {
})
pool.Wait()
```
