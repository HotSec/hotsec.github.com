# Go pprof 性能分析

---

## 一、pprof 简介

pprof 是 Go 内置的性能分析工具，支持以下维度的分析：

| 类型 | 说明 | 采集方式 |
|------|------|----------|
| cpu | CPU 占用 | 采样 |
| heap | 堆内存分配 | 采样 |
| goroutine | 协程栈 | 全量 |
| block | 阻塞操作 | 采样 |
| mutex | 锁竞争 | 采样 |
| threadcreate | 线程创建 | 全量 |

---

## 二、net/http/pprof

### 2.1 内置到 HTTP 服务

```go
import _ "net/http/pprof"

func main() {
    go func() {
        http.ListenAndServe(":6060", nil)
    }()

    // 业务代码...
    select {}
}
```

### 2.2 Gin 集成

```go
import "github.com/gin-contrib/pprof"

func main() {
    r := gin.Default()
    pprof.Register(r)
    r.Run(":8080")
}
```

### 2.3 访问端点

```
http://localhost:6060/debug/pprof/
├── /debug/pprof/profile       # CPU profile
├── /debug/pprof/heap          # 堆内存
├── /debug/pprof/goroutine     # 协程
├── /debug/pprof/block         # 阻塞
├── /debug/pprof/mutex         # 锁竞争
└── /debug/pprof/threadcreate  # 线程创建
```

---

## 三、go tool pprof

### 3.1 CPU 分析

```bash
# 采集 30 秒 CPU profile
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30

# 命令行交互
(pprof) top 10
(pprof) list funcName
(pprof) web
```

### 3.2 堆内存分析

```bash
go tool pprof http://localhost:6060/debug/pprof/heap

# 对比两次 heap（查找内存泄漏）
go tool pprof -base heap1.prof heap2.prof
```

### 3.3 goroutine 分析

```bash
go tool pprof http://localhost:6060/debug/pprof/goroutine
```

### 3.4 常用命令

| 命令 | 说明 |
|------|------|
| `top N` | 显示 Top N 热点函数 |
| `list func` | 显示函数代码及逐行分析 |
| `web` | 生成调用图（需 graphviz） |
| `peek func` | 查看调用者和被调用者 |
| `traces` | 显示所有调用栈 |
| `svg` | 导出 SVG 图 |

---

## 四、runtime/pprof

### 4.1 离线采集

```go
import "runtime/pprof"

func main() {
    // CPU profile
    f, _ := os.Create("cpu.prof")
    pprof.StartCPUProfile(f)
    defer pprof.StopCPUProfile()

    // 业务代码
    doWork()
}
```

### 4.2 内存 profile

```go
func main() {
    f, _ := os.Create("mem.prof")
    defer f.Close()

    doWork()

    pprof.WriteHeapProfile(f)
}
```

---

## 五、火焰图分析

### 5.1 生成火焰图

```bash
# 方式一：go tool pprof 内置
go tool pprof -http=:8081 cpu.prof
# 浏览器自动打开，选择 VIEW → Flame Graph

# 方式二：使用 go-torch（已集成到 pprof）
go tool pprof -raw cpu.prof > cpu.txt
```

### 5.2 火焰图解读

```
┌──────────────────────────────────────────────┐
│              main.main                        │
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │ handleRequest │  │ processData          │  │
│  │ ┌─────┐      │  │ ┌──────┐ ┌────────┐  │  │
│  │ │parse│      │  │ │queryDB│ │compute │  │  │
│  │ └─────┘      │  │ └──────┘ └────────┘  │  │
│  └──────────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────┘

宽度 = 采样次数（CPU 时间）
颜色 = 包类型（用户代码/标准库/系统调用）
```

- **宽的块** = 热点函数，需要优化
- **平顶** = 函数本身耗时多
- **尖顶** = 调用链深但单次耗时少

---

## 六、benchmark 分析

### 6.1 基准测试

```go
func BenchmarkProcess(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Process(generateData())
    }
}
```

### 6.2 生成 profile

```bash
# CPU profile
go test -bench=BenchmarkProcess -cpuprofile=cpu.prof ./...

# 内存 profile
go test -bench=BenchmarkProcess -memprofile=mem.prof ./...

# 分析
go tool pprof cpu.prof
```

### 6.3 对比基准

```bash
# 保存基准结果
go test -bench=. -benchmem > old.txt

# 修改代码后
go test -bench=. -benchmem > new.txt

# 对比
go install golang.org/x/perf/cmd/benchstat@latest
benchstat old.txt new.txt
```

---

## 七、trace 追踪

### 7.1 采集 trace

```go
import "runtime/trace"

func main() {
    f, _ := os.Create("trace.out")
    trace.Start(f)
    defer trace.Stop()

    doWork()
}
```

### 7.2 分析 trace

```bash
go tool trace trace.out
# 浏览器打开，查看：
# - View trace：时间线视图
# - Goroutine analysis：协程分析
# - Network blocking profile：网络阻塞
# - Synchronization blocking profile：同步阻塞
```

### 7.3 net/http/trace

```bash
curl http://localhost:6060/debug/pprof/trace?seconds=5 > trace.out
go tool trace trace.out
```

---

## 八、实战案例

### 8.1 内存泄漏排查

```bash
# 1. 采集两次 heap
curl http://localhost:6060/debug/pprof/heap > heap1.prof
# 等待一段时间
curl http://localhost:6060/debug/pprof/heap > heap2.prof

# 2. 对比差异
go tool pprof -base heap1.prof heap2.prof

# 3. 查看增长最多的分配
(pprof) top
(pprof) list suspiciousFunc
```

### 8.2 CPU 热点排查

```bash
# 1. 采集 CPU profile
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30

# 2. 查看热点
(pprof) top 10
(pprof) web

# 3. 定位到具体函数
(pprof) list hotFunc
```

### 8.3 goroutine 泄漏排查

```bash
# 1. 查看协程数量
curl http://localhost:6060/debug/pprof/goroutine?debug=1

# 2. 分析协程栈
go tool pprof http://localhost:6060/debug/pprof/goroutine

# 3. 查找阻塞的协程
(pprof) traces
# 关注数量异常多的栈
```

---

## 九、性能分析检查清单

| 步骤 | 工具 | 关注点 |
|------|------|--------|
| 1. CPU 分析 | pprof cpu | 热点函数 |
| 2. 内存分析 | pprof heap | 内存分配、泄漏 |
| 3. 协程分析 | pprof goroutine | 协程泄漏 |
| 4. 阻塞分析 | pprof block | 锁竞争、channel 阻塞 |
| 5. 锁分析 | pprof mutex | 锁热点 |
| 6. 追踪分析 | trace | 调度延迟、GC 影响 |
| 7. 基准测试 | go test -bench | 性能回归 |
