# context 详解

## 一、设计理念

context 用于在 goroutine 之间传递：
1. **取消信号**：通知子 goroutine 停止工作
2. **超时控制**：自动取消超时的操作
3. **值传递**：在调用链中传递请求级数据

## 二、创建 context

### 2.1 Background 与 TODO

```go
ctx := context.Background()
ctx := context.TODO()
```

- `Background()`：根 context，通常在 main/init/测试中使用
- `TODO()`：不确定该用什么 context 时的占位

### 2.2 WithCancel

```go
ctx, cancel := context.WithCancel(context.Background())
defer cancel()

go func(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            fmt.Println("goroutine exit:", ctx.Err())
            return
        default:
            fmt.Println("working...")
            time.Sleep(500 * time.Millisecond)
        }
    }
}(ctx)

time.Sleep(2 * time.Second)
cancel()
time.Sleep(1 * time.Second)
```

### 2.3 WithTimeout

```go
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()

select {
case <-time.After(3 * time.Second):
    fmt.Println("work done")
case <-ctx.Done():
    fmt.Println("timeout:", ctx.Err())
}
```

### 2.4 WithDeadline

```go
deadline := time.Now().Add(2 * time.Second)
ctx, cancel := context.WithDeadline(context.Background(), deadline)
defer cancel()
```

### 2.5 WithValue

```go
type key string

const userIDKey key = "userID"

ctx := context.WithValue(context.Background(), userIDKey, 12345)

if v, ok := ctx.Value(userIDKey).(int); ok {
    fmt.Println("userID:", v)
}
```

- key 应使用自定义类型，避免冲突
- 不要用内置类型（string/int）作为 key

## 三、context 传播

```go
func handler(ctx context.Context) {
    ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
    defer cancel()

    result, err := fetchData(ctx)
}

func fetchData(ctx context.Context) (string, error) {
    req, _ := http.NewRequestWithContext(ctx, "GET", "http://example.com", nil)
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()
    return io.ReadAll(resp.Body)
}
```

- context 作为第一个参数传递
- 子 context 取消不会影响父 context
- 父 context 取消会自动取消所有子 context

## 四、最佳实践

1. **context 作为函数第一个参数**：`func Foo(ctx context.Context, ...)`
2. **不要传递 nil context**：用 `context.TODO()` 代替
3. **不要用 WithValue 传业务数据**：仅传请求级元数据（traceID/userID）
4. **WithTimeout/WithCancel 后一定要调用 cancel**：即使不主动取消，也要 defer cancel 释放资源
5. **不要把 context 存储在结构体中**：应该作为参数传递

## 五、常见模式

### 5.1 HTTP 请求超时

```go
func fetchWithTimeout(url string, timeout time.Duration) ([]byte, error) {
    ctx, cancel := context.WithTimeout(context.Background(), timeout)
    defer cancel()

    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        return nil, err
    }

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    return io.ReadAll(resp.Body)
}
```

### 5.2 数据库查询超时

```go
func queryWithTimeout(ctx context.Context, db *sql.DB, query string) (*sql.Rows, error) {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    return db.QueryContext(ctx, query)
}
```

### 5.3 优雅关闭

```go
func main() {
    ctx, cancel := context.WithCancel(context.Background())

    go worker(ctx)

    sigCh := make(chan os.Signal, 1)
    signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
    <-sigCh

    cancel()
    time.Sleep(time.Second)
}
```
