# atomic 详解

`sync/atomic` 包提供底层的原子内存操作，是实现无锁数据结构的基础。

---

## 一、原子操作概述

### 1.1 为什么需要原子操作

```go
var counter int

func increment() {
    counter++
}
```

`counter++` 不是原子操作，包含三步：
1. 读取 counter
2. 加 1
3. 写回 counter

多 goroutine 并发执行会导致竞态条件。

### 1.2 原子操作 vs 互斥锁

| 特性 | atomic | Mutex |
|------|--------|-------|
| 保护范围 | 单个变量 | 代码块 |
| 性能 | 高 | 较低 |
| 适用场景 | 简单计数器 | 复杂临界区 |
| 可组合性 | 弱 | 强 |

---

## 二、基本原子操作

### 2.1 Add（加法）

```go
var counter int64

atomic.AddInt64(&counter, 1)
atomic.AddUint64(&counter, 1)

atomic.AddInt64(&counter, -1)
```

### 2.2 Load（读取）

```go
var value int64 = 42

v := atomic.LoadInt64(&value)
```

### 2.3 Store（存储）

```go
var value int64

atomic.StoreInt64(&value, 100)
```

### 2.4 Swap（交换）

```go
var value int64 = 42

old := atomic.SwapInt64(&value, 100)
```

### 2.5 CompareAndSwap（CAS）

```go
var value int64 = 42

swapped := atomic.CompareAndSwapInt64(&value, 42, 100)
```

- 如果 value == 42，则设置为 100，返回 true
- 否则不做任何操作，返回 false

---

## 三、支持的类型

| 函数前缀 | 类型 |
|---------|------|
| `Int32` | int32 |
| `Int64` | int64 |
| `Uint32` | uint32 |
| `Uint64` | uint64 |
| `Uintptr` | uintptr |
| `Pointer` | unsafe.Pointer |
| `Bool` | bool (Go 1.19+) |

---

## 四、atomic.Value

### 4.1 基本用法

```go
var config atomic.Value

config.Store(Config{Timeout: 30})

c := config.Load().(Config)
```

### 4.2 配置热更新

```go
var currentConfig atomic.Value

func init() {
    currentConfig.Store(defaultConfig)
}

func getConfig() Config {
    return currentConfig.Load().(Config)
}

func updateConfig(newConfig Config) {
    currentConfig.Store(newConfig)
}
```

### 4.3 注意事项

- Store 的值不能为 nil
- Store 的类型必须与之前一致
- 适合读多写少场景

---

## 五、Go 1.19+ 类型封装

### 5.1 atomic.Int64

```go
var counter atomic.Int64

counter.Add(1)
counter.Store(100)
v := counter.Load()
old := counter.Swap(200)
swapped := counter.CompareAndSwap(200, 300)
```

### 5.2 atomic.Pointer

```go
type Node struct {
    Value int
    Next  *Node
}

var head atomic.Pointer[Node]

head.Store(&Node{Value: 1})
n := head.Load()
```

### 5.3 优势

- 类型安全
- 不需要手动取地址
- 更清晰的 API

---

## 六、实际应用

### 6.1 原子计数器

```go
type Counter struct {
    value atomic.Int64
}

func (c *Counter) Inc() {
    c.value.Add(1)
}

func (c *Counter) Get() int64 {
    return c.value.Load()
}
```

### 6.2 单例模式

```go
var (
    instance    *Singleton
    initialized atomic.Bool
    mu          sync.Mutex
)

func GetInstance() *Singleton {
    if initialized.Load() {
        return instance
    }

    mu.Lock()
    defer mu.Unlock()

    if instance == nil {
        instance = &Singleton{}
        initialized.Store(true)
    }
    return instance
}
```

### 6.3 自旋锁

```go
type SpinLock struct {
    locked atomic.Bool
}

func (l *SpinLock) Lock() {
    for !l.locked.CompareAndSwap(false, true) {
    }
}

func (l *SpinLock) Unlock() {
    l.locked.Store(false)
}
```

---

## 七、最佳实践

1. **优先使用类型封装**：Go 1.19+ 使用 `atomic.Int64` 等
2. **明确内存语义**：原子操作提供内存屏障
3. **避免过度使用**：复杂场景使用 Mutex
4. **注意对齐**：32 位系统上 64 位变量需要 8 字节对齐
