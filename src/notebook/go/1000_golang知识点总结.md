# Golang 知识点总结

---

## 一、语言基础

### 1. 数据类型

| 类型 | 说明 |
|------|------|
| 基本类型 | `int`, `int8/16/32/64`, `float32/64`, `string`, `bool`, `byte`, `rune` |
| 复合类型 | `array`, `slice`, `map`, `struct`, `channel`, `pointer`, `func` |
| 零值 | 数值=0, 字符串="", 布尔=false, 指针/slice/map/channel=nil |

### 2. 变量声明

```go
var x int           // 声明
x := 10             // 短声明（函数内）
const PI = 3.14     // 常量
const (             // 批量
    a = iota        // 0
    b               // 1
)
```

### 3. 控制结构

- `if-else`：条件判断，支持初始化语句
- `for`：三种形式，`for range` 遍历
- `switch`：自动 break，`fallthrough` 穿透
- `select`：channel 多路复用

---

## 二、核心概念

### 1. Slice vs Array

```go
arr := [5]int{1,2,3}     // 数组，值类型
slice := []int{1,2,3}    // 切片，引用类型
```

- **切片扩容**：<1024 翻倍，>1024 按 1.25 倍
- **切片底层数组**：共享数据，修改需注意
- **截取语法**：`s[low:high:max]`，第三个参数控制容量

### 2. Map

- **无序**：遍历顺序随机
- **非并发安全**：需加锁或用 `sync.Map`
- **零值 nil**：必须 `make` 初始化
- **扩容**：等量扩容（整理碎片）+ 增量扩容

### 3. 指针

```go
x := 10
p := &x        // 取地址
*p = 20        // 解引用
```

---

## 三、并发编程（重点⭐）

### 1. Goroutine

- 轻量级协程，初始栈 2KB，最大 1GB
- **GMP 调度模型**：
  - **G**：Goroutine（协程）
  - **M**：Machine（操作系统线程）
  - **P**：Processor（调度器）

#### GMP 调度策略

| 策略 | 说明 |
|------|------|
| 复用线程 | 避免频繁创建/销毁线程 |
| 工作窃取 | 本地队列空时从其他 P 偷取 G |
| Hand off | 系统调用阻塞时，M 释放 P 给其他 M |
| 抢占式调度 | 1.14 后基于信号的抢占 |

#### M 寻找 G 的顺序

```
本地队列 → 全局队列 → 网络轮询器 → 其他 P 本地队列
```

### 2. Channel

```go
ch := make(chan int)       // 无缓冲
ch := make(chan int, 10)   // 有缓冲

ch <- x                     // 发送
x := <-ch                   // 接收
close(ch)                   // 关闭
```

#### Channel 注意事项

| 操作 | 结果 |
|------|------|
| 关闭未初始化的 channel | panic |
| 关闭已关闭的 channel | panic |
| 向已关闭的 channel 发送 | panic |
| 从已关闭的 channel 接收 | 返回零值 + false |

#### 判断 Channel 是否关闭

```go
v, ok := <-ch
if !ok {
    // channel 已关闭
}

// 或使用 range
for v := range ch {
    // 自动在 channel 关闭时退出
}
```

### 3. sync 包

| 类型 | 用途 |
|------|------|
| `WaitGroup` | 等待一组 goroutine 完成 |
| `Mutex` | 互斥锁 |
| `RWMutex` | 读写锁 |
| `Once` | 只执行一次（单例模式） |
| `Pool` | 对象池，减少内存分配 |
| `Map` | 并发安全 map（读多写少场景） |
| `Cond` | 条件变量 |
| `atomic` | 原子操作 |

#### sync.Map 原理

- **read + dirty 双 map 实现读写分离**
- read：只读缓存，原子操作无锁
- dirty：写入区，带锁
- 当 read 连续 miss 达到阈值，dirty 提升为新的 read

### 4. Context

```go
ctx, cancel := context.WithTimeout(context.Background(), time.Second)
defer cancel()
```

| 方法 | 用途 |
|------|------|
| `WithCancel` | 返回可取消的 context |
| `WithTimeout` | 设置超时时间 |
| `WithDeadline` | 设置截止时间 |
| `WithValue` | 传递请求范围值 |

---

## 四、函数与方法

### 1. 函数特性

```go
func add(a, b int) (int, error) {  // 多返回值
    return a + b, nil
}

func sum(nums ...int) int {         // 可变参数
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}
```

### 2. defer

- **LIFO 顺序**执行（后进先出）
- 参数在声明时确定
- 常用于资源关闭、解锁
- **注意**：不要在循环中使用 defer

### 3. 闭包

```go
func counter() func() int {
    i := 0
    return func() int {
        i++
        return i
    }
}
```

### 4. 方法接收者选择

| 场景 | 推荐类型 |
|------|----------|
| 方法不修改接收者状态 | 值接收者 |
| 接收者是小型类型 | 值接收者 |
| 方法会修改接收者状态 | 指针接收者 |
| 接收者是大型类型 | 指针接收者 |
| 避免拷贝开销 | 指针接收者 |

---

## 五、接口

### 1. 隐式实现

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type File struct{}

func (f File) Read(p []byte) (n int, err error) { ... }
// File 自动实现了 Reader
```

### 2. 类型断言

```go
// 安全断言
v, ok := i.(T)

// type switch
switch v := i.(type) {
case int:
    fmt.Println("int:", v)
case string:
    fmt.Println("string:", v)
}
```

### 3. 空接口

- `interface{}` / `any` (Go 1.18+)
- 可存储任意类型值

### 4. nil 接口陷阱

```go
// 错误：返回 nil 指针，接口不为 nil
func returnsError() error {
    var p *MyError = nil
    return p  // 接口值 = (*MyError, nil) ≠ nil
}

// 正确：显式返回 nil
func returnsError() error {
    return nil
}
```

---

## 六、内存与GC（重点⭐）

### 1. 内存模型

#### 三级缓存架构

```
mcache (P 本地，无锁)
   ↓
mcentral (按 spanClass 分组，细粒度锁)
   ↓
mheap (全局，全局锁)
```

#### 对象分配流程

| 对象大小 | 分配方式 |
|----------|----------|
| < 16B | tiny 分配器 |
| 16B ~ 32KB | size class（67 种规格） |
| > 32KB | 直接从 mheap 分配 |

### 2. 逃逸分析

#### 逃逸原因

- 返回局部变量指针
- 闭包引用外部变量
- 大对象/大小不确定
- 传递给 `interface{}` 参数

#### 检测方法

```bash
go build -gcflags "-m"
```

### 3. 垃圾回收

#### 三色标记法

| 颜色 | 含义 |
|------|------|
| 白色 | 垃圾对象（待回收） |
| 灰色 | 待扫描对象 |
| 黑色 | 存活对象 |

#### 混合写屏障（Go 1.8+）

1. GC 开始时，栈上所有对象标记为黑色
2. GC 期间栈上新对象直接为黑色
3. 被删除的对象标记为灰色
4. 被添加的对象标记为灰色

#### GC 触发条件

- 内存分配达到阈值（GOGC 参数）
- 定时触发（最长 2 分钟）
- 手动 `runtime.GC()`

#### GC 优化

- 减少对象数量（对象复用）
- 使用 `sync.Pool`
- 避免内存逃逸
- 调整 GOGC 参数

### 4. new vs make

| 特性 | new | make |
|------|-----|------|
| 适用类型 | 任意类型 | slice, map, channel |
| 返回值 | 指针 | 引用类型本身 |
| 初始化 | 零值 | 完整初始化 |

---

## 七、错误处理

### 1. error 接口

```go
type error interface {
    Error() string
}

// 自定义错误
type MyError struct {
    Msg string
}
func (e *MyError) Error() string { return e.Msg }
```

### 2. panic & recover

```go
func safe() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("recovered:", r)
        }
    }()
    panic("something wrong")
}
```

**注意**：recover 必须在 defer 中调用才有效

---

## 八、常见陷阱（高频考点⭐）

| 陷阱 | 说明 |
|------|------|
| for range 迭代变量重用 | 循环变量只声明一次，取地址需用索引访问 |
| map 遍历顺序随机 | 不要依赖特定顺序 |
| string 不可修改 | 只读字节切片 |
| nil 切片 vs 空切片 | `var s []string` vs `make([]string, 0)` |
| defer 在循环中 | 延迟到函数返回时执行 |
| rune vs byte | `len()` 返回字节数，`len([]rune(s))` 返回字符数 |
| 切片内存泄漏 | 切片引用大数组导致无法回收 |
| map 内存泄漏 | map 删除元素后底层数组不会收缩 |

### for range 陷阱示例

```go
// 错误：所有迭代变量指向同一地址
for i, v := range slice {
    go func() {
        fmt.Println(i, v) // 输出相同的值
    }()
}

// 正确：使用参数传递
for i, v := range slice {
    go func(i, v int) {
        fmt.Println(i, v)
    }(i, v)
}

// 正确：使用索引访问
for i := range slice {
    go func(i int) {
        fmt.Println(i, slice[i])
    }(i)
}
```

---

## 九、常用标准库

| 库 | 用途 |
|------|------|
| `fmt` | 格式化 I/O |
| `strings` | 字符串操作 |
| `strconv` | 类型转换 |
| `time` | 时间处理（格式化用 `2006-01-02 15:04:05`） |
| `encoding/json` | JSON 编解码 |
| `io` | I/O 原语 |
| `net/http` | HTTP 客户端/服务端 |
| `os` | 操作系统功能 |
| `reflect` | 反射 |

---

## 十、常用框架

### 1. Gin

- 轻量级 Web 框架
- 路由基于 httprouter

### 2. go-zero

- 微服务框架
- 内置服务发现、熔断、限流
- goctl 脚手架一键生成代码

### 3. gRPC

- 高性能 RPC 框架
- 基于 HTTP/2 + Protobuf

### 4. etcd

- 分布式键值存储
- 用于服务发现、配置管理、分布式锁

---

## 十一、性能调试

### 1. pprof

```go
import _ "net/http/pprof"

go func() {
    http.ListenAndServe(":6060", nil)
}()
```

```bash
go tool pprof http://localhost:6060/debug/pprof/profile
go tool pprof http://localhost:6060/debug/pprof/heap
```

### 2. trace

```bash
go tool trace trace.out
```

### 3. runtime 统计

```go
runtime.ReadMemStats()      // 内存统计
runtime.NumGoroutine()      // goroutine 数量
```

---

## 十二、高频面试题

### 基础

1. `make` 和 `new` 的区别？
2. 数组和切片的区别？
3. map 的底层实现？如何扩容？
4. defer 的执行顺序？
5. rune 和 byte 的区别？

### 并发

1. goroutine 和线程的区别？
2. channel 的底层原理？
3. 如何实现并发安全的 map？
4. sync.Map 的原理？
5. context 的应用场景？
6. 有缓冲和无缓冲 channel 的区别？

### 原理

1. **GMP 调度模型？**
2. **GC 的实现原理？混合写屏障？**
3. **逃逸分析的规则？**
4. interface 的底层实现？
5. 内存管理模型？

### 代码题

1. 用两个 goroutine 交替打印数字和字母
2. 实现一个并发安全的 map
3. 用 channel 实现工作池
4. 实现单例模式

---

## 十三、版本演进

| 版本 | 重要特性 |
|------|----------|
| Go 1.5 | 并发 GC，三色标记 |
| Go 1.8 | 混合写屏障，几乎消除 STW |
| Go 1.14 | 基于信号的抢占式调度 |
| Go 1.18 | 泛型 |
| Go 1.19 | 分代扫描（实验） |
| Go 1.20 | 内存整理（实验） |
| Go 1.22 | for range 改进 |

---

如需针对某个专题深入讲解，请告诉我！
