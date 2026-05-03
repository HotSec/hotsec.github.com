# trace 与火焰图

Go 提供了强大的追踪工具，帮助分析程序运行时的行为。

---

## 一、go tool trace

### 1.1 生成 trace 文件

```go
import (
    "os"
    "runtime/trace"
)

func main() {
    f, _ := os.Create("trace.out")
    defer f.Close()
    trace.Start(f)
    defer trace.Stop()

}
```

### 1.2 分析 trace

```bash
go tool trace trace.out
```

### 1.3 HTTP 端点

```go
import _ "net/http/pprof"

func main() {
    go func() {
        http.ListenAndServe(":6060", nil)
    }()
}
```

```bash
curl -o trace.out http://localhost:6060/debug/pprof/trace?seconds=5
go tool trace trace.out
```

---

## 二、trace 视图

### 2.1 Goroutines

- 显示 goroutine 的生命周期
- 运行、阻塞、等待状态

### 2.2 Scheduler

- P（处理器）的调度情况
- M（线程）的使用情况

### 2.3 Syscall

- 系统调用阻塞时间
- GC 暂停时间

### 2.4 GC

- GC 执行时间
- 内存分配情况

---

## 三、pprof 火焰图

### 3.1 CPU 火焰图

```bash
go tool pprof -http=:8080 http://localhost:6060/debug/pprof/profile?seconds=30
```

### 3.2 内存火焰图

```bash
go tool pprof -http=:8080 http://localhost:6060/debug/pprof/heap
```

### 3.3 goroutine 火焰图

```bash
go tool pprof -http=:8080 http://localhost:6060/debug/pprof/goroutine
```

---

## 四、火焰图解读

### 4.1 宽度

- 函数框越宽，占用 CPU 时间越多
- 优化重点在宽框

### 4.2 高度

- 调用栈深度
- 过深可能有问题

### 4.3 颜色

- 暖色：CPU 密集
- 冷色：IO 等待

---

## 五、常见问题分析

### 5.1 锁竞争

```
sync.(*Mutex).Lock
runtime.goparkunlock
```

- 大量时间在锁等待
- 考虑减少锁粒度

### 5.2 GC 压力

```
runtime.mallocgc
runtime.gcBgMarkWorker
```

- 内存分配过多
- 考虑对象池或预分配

### 5.3 系统调用

```
syscall.Read
syscall.Write
```

- IO 阻塞时间长
- 考虑异步 IO 或缓冲

### 5.4 Channel 阻塞

```
runtime.chansend
runtime.chanrecv
runtime.gopark
```

- Channel 操作阻塞
- 检查是否有死锁或缓冲不足

---

## 六、trace 高级用法

### 6.1 自定义 Region

```go
ctx, task := trace.NewTask(context.Background(), "myTask")
defer task.End()

trace.WithRegion(ctx, "step1", func() {
})

trace.WithRegion(ctx, "step2", func() {
})
```

### 6.2 自定义 Log

```go
trace.Log(ctx, "category", "message")
```

### 6.3 用户标注

```go
trace.StartRegion(ctx, "databaseQuery").End()
```

---

## 七、性能分析流程

1. **收集数据**：开启 pprof 端点或生成 trace
2. **可视化**：使用火焰图或 trace 视图
3. **定位瓶颈**：找到占用时间最多的函数
4. **分析原因**：理解为什么慢
5. **优化验证**：修改后重新分析

---

## 八、工具对比

| 工具 | 用途 | 优点 |
|------|------|------|
| pprof CPU | CPU 分析 | 找热点函数 |
| pprof heap | 内存分析 | 找内存泄漏 |
| trace | 时序分析 | 看 goroutine 调度 |
| 火焰图 | 可视化 | 直观展示调用栈 |
