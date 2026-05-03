# sync 包详解

`sync` 包提供了基本的同步原语，是 Go 并发编程的核心工具包。

---

## 一、Mutex（互斥锁）

### 1.1 基本用法

```go
var mu sync.Mutex
var count int

func increment() {
    mu.Lock()
    defer mu.Unlock()
    count++
}
```

### 1.2 不要复制 Mutex

```go
type SafeMap struct {
    mu sync.Mutex
    m  map[string]int
}

func bad(s SafeMap) {}

func good(s *SafeMap) {}
```

- `sync.Mutex` 不应被复制，复制后锁状态不一致
- 使用 `go vet` 可检测

### 1.3 底层实现

- **正常模式**：新来的 goroutine 直接竞争锁，有优势
- **饥饿模式**：等待超过 1ms 后切换，新来的 goroutine 排到队尾
- 饥饿模式下，锁直接交给队列头部的 goroutine

---

## 二、RWMutex（读写锁）

### 2.1 基本用法

```go
var mu sync.RWMutex
var data map[string]string

func read(key string) string {
    mu.RLock()
    defer mu.RUnlock()
    return data[key]
}

func write(key, value string) {
    mu.Lock()
    defer mu.Unlock()
    data[key] = value
}
```

### 2.2 规则

- 多个读者可以同时持有 `RLock`
- 写者持有 `Lock` 时，其他读写都被阻塞
- 写者等待时，新的读者也会被阻塞（防止写者饥饿）

---

## 三、WaitGroup

### 3.1 基本用法

```go
var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1)
    go func(id int) {
        defer wg.Done()
        doWork(id)
    }(i)
}

wg.Wait()
fmt.Println("all done")
```

### 3.2 注意事项

```go
wg.Add(1)
go func() {
    defer wg.Done()
}()
```

- `Add` 应在启动 goroutine 之前调用，不能在 goroutine 内部
- `Add` 的值必须与 `Done` 调用次数匹配
- `Add` 可以传入负数，但计数器不能为负

---

## 四、Once

### 4.1 基本用法

```go
var once sync.Once
var instance *Singleton

func GetInstance() *Singleton {
    once.Do(func() {
        instance = &Singleton{}
    })
    return instance
}
```

### 4.2 注意事项

```go
once.Do(func() {
    once.Do(func() {
        fmt.Println("deadlock!")
    })
})
```

- `Once.Do` 内部再次调用 `Do` 会死锁
- 如果 `Do` 的函数 panic，`Once` 认为已执行过

---

## 五、Cond（条件变量）

### 5.1 基本用法

```go
var mu sync.Mutex
cond := sync.NewCond(&mu)

var ready bool

func wait() {
    mu.Lock()
    for !ready {
        cond.Wait()
    }
    mu.Unlock()
    fmt.Println("proceed")
}

func signal() {
    mu.Lock()
    ready = true
    cond.Broadcast()
    mu.Unlock()
}
```

### 5.2 Wait 内部流程

1. 自动释放 `Lock`
2. 阻塞等待 `Signal` 或 `Broadcast`
3. 被唤醒后重新获取 `Lock`

### 5.3 Signal vs Broadcast

- `Signal`：唤醒一个等待的 goroutine
- `Broadcast`：唤醒所有等待的 goroutine

---

## 六、Pool（对象池）

### 6.1 基本用法

```go
var bufPool = sync.Pool{
    New: func() any {
        return new(bytes.Buffer)
    },
}

func processData(data []byte) string {
    buf := bufPool.Get().(*bytes.Buffer)
    defer func() {
        buf.Reset()
        bufPool.Put(buf)
    }()

    buf.Write(data)
    return buf.String()
}
```

### 6.2 特点

- 对象可能随时被 GC 回收
- 不保证对象一定存在
- 适合复用临时对象，减少 GC 压力
- 不适合做连接池

---

## 七、Map（并发安全 Map）

### 7.1 原理

- sync.Map **通过 read + dirty 双 map 实现读写分离，用空间换时间，专为 读多写少 场景优化**
- 底层藏着两个原生 map：
  - read：只读缓存，原子操作无锁，命中时直接返回
  - dirty：写入区，带锁，存放最新或未被 read 缓存的数据
- **当 read 连续 miss 达到一定阈值（misses ≥ len(dirty)），dirty 会被整体提升为新的 read，完成一次"缓存刷新"**
- Load：先读 read → 未命中且 amended=true → 加锁读 dirty → miss++ → 触发晋升
- Store：read 命中则 CAS 更新；否则加锁写入 dirty，并可能触发 dirty → read 复制
- Delete：优先标记 read 中 entry 为 nil；若仅存在于 dirty 则直接删除
- Range：若 read 完整则直接遍历；否则先晋升 dirty 再遍历，保证一致性

### 7.2 基本用法

```go
var m sync.Map

m.Store("key", 42)
v, ok := m.Load("key")
m.Delete("key")

m.Range(func(k, v any) bool {
    fmt.Println(k, v)
    return true
})
```

### 7.3 适用场景

- **读多写少**：key 一旦写入很少变更
- **不同 goroutine 读写不同的 key**

不适用场景：
- 频繁写入和更新同一批 key

---

## 八、atomic 包

### 8.1 基本操作

```go
var count int64

atomic.AddInt64(&count, 1)

n := atomic.LoadInt64(&count)

atomic.StoreInt64(&count, 100)

old := atomic.SwapInt64(&count, 200)

swapped := atomic.CompareAndSwapInt64(&count, 200, 300)
```

### 8.2 atomic.Value

```go
var config atomic.Value

config.Store(Config{Timeout: 30})

c := config.Load().(Config)
```

- `atomic.Value` 适合存储配置等读多写少的场景
- Store 的值不能为 nil
- Store 的类型必须与之前一致

### 8.3 Mutex vs atomic

| 特性 | Mutex | atomic |
|------|-------|--------|
| 保护范围 | 代码块 | 单个变量 |
| 性能 | 较低 | 较高 |
| 适用场景 | 复杂临界区 | 简单计数器/标志位 |
| 可组合性 | 强 | 弱 |

---

## 九、errgroup

### 9.1 基本用法

```go
import "golang.org/x/sync/errgroup"

func fetchAll(urls []string) ([]string, error) {
    g, ctx := errgroup.WithContext(context.Background())
    results := make([]string, len(urls))

    for i, url := range urls {
        i, url := i, url
        g.Go(func() error {
            resp, err := http.Get(url)
            if err != nil {
                return err
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            results[i] = string(body)
            return nil
        })
    }

    if err := g.Wait(); err != nil {
        return nil, err
    }
    return results, nil
}
```

### 9.2 并发控制

```go
g, ctx := errgroup.WithContext(context.Background())
g.SetLimit(10)

for i := 0; i < 100; i++ {
    g.Go(func() error {
        return doWork(ctx)
    })
}

err := g.Wait()
```

- `SetLimit` 限制并发 goroutine 数量
- 任何一个 goroutine 返回错误，`Wait` 立即返回该错误
- 配合 `context` 可实现错误取消
