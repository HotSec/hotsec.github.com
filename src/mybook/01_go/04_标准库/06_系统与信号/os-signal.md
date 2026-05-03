# os/signal 信号处理

`os/signal` 包用于处理操作系统信号，常用于实现优雅关机。

---

## 一、常见信号

| 信号 | 值 | 含义 |
|------|---|------|
| SIGINT | 2 | 中断（Ctrl+C） |
| SIGTERM | 15 | 终止 |
| SIGHUP | 1 | 挂起 |
| SIGKILL | 9 | 强制终止（不可捕获） |
| SIGQUIT | 3 | 退出（Ctrl+\） |

---

## 二、signal.Notify

### 2.1 基本用法

```go
import (
    "os"
    "os/signal"
    "syscall"
)

func main() {
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

    sig := <-sigChan
    fmt.Println("Received signal:", sig)
}
```

### 2.2 Notify 参数

```go
signal.Notify(c, syscall.SIGINT)
signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)
signal.Notify(c)
```

- 不传信号则捕获所有信号
- 建议：明确指定需要捕获的信号

### 2.3 signal.NotifyContext

```go
func main() {
    ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
    defer stop()

    <-ctx.Done()
    fmt.Println("Shutting down...")
}
```

---

## 三、signal.Stop

```go
sigChan := make(chan os.Signal, 1)
signal.Notify(sigChan, syscall.SIGINT)

signal.Stop(sigChan)
```

- 停止向 channel 发送信号
- 不会关闭 channel

---

## 四、优雅关机示例

### 4.1 HTTP 服务优雅关机

```go
func main() {
    srv := &http.Server{Addr: ":8080"}

    go func() {
        if err := srv.ListenAndServe(); err != http.ErrServerClosed {
            log.Fatal(err)
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Shutting down server...")

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal("Server forced to shutdown:", err)
    }

    log.Println("Server exiting")
}
```

### 4.2 带超时的优雅关机

```go
func gracefulShutdown(server *http.Server, timeout time.Duration) {
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    ctx, cancel := context.WithTimeout(context.Background(), timeout)
    defer cancel()

    done := make(chan struct{})
    go func() {
        server.Shutdown(ctx)
        close(done)
    }()

    select {
    case <-done:
        log.Println("Server shutdown gracefully")
    case <-ctx.Done():
        log.Println("Server shutdown timeout, forcing close")
        server.Close()
    }
}
```

### 4.3 多服务优雅关机

```go
func main() {
    httpServer := &http.Server{Addr: ":8080"}
    grpcServer := grpc.NewServer()

    go httpServer.ListenAndServe()
    go grpcServer.Serve(lis)

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    var wg sync.WaitGroup
    wg.Add(2)

    go func() {
        defer wg.Done()
        httpServer.Shutdown(ctx)
    }()

    go func() {
        defer wg.Done()
        grpcServer.GracefulStop()
    }()

    wg.Wait()
}
```

---

## 五、注意事项

1. **SIGKILL 和 SIGSTOP 不可捕获**
2. **channel 缓冲区大小**：建议至少为 1
3. **Windows 平台**：只支持 SIGINT
4. **不要阻塞信号处理**：尽快完成或异步处理
