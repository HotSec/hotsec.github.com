# errgroup 并发编排

`errgroup` 是 `golang.org/x/sync/errgroup` 包提供的并发编排工具，用于管理一组 goroutine 的错误处理。

---

## 一、基本用法

### 1.1 简单示例

```go
import "golang.org/x/sync/errgroup"

func main() {
    g := new(errgroup.Group)

    urls := []string{
        "https://example.com/1",
        "https://example.com/2",
        "https://example.com/3",
    }

    for _, url := range urls {
        url := url
        g.Go(func() error {
            resp, err := http.Get(url)
            if err != nil {
                return err
            }
            defer resp.Body.Close()
            return process(resp)
        })
    }

    if err := g.Wait(); err != nil {
        log.Fatal(err)
    }
}
```

### 1.2 特点

- 所有 goroutine 并发执行
- 任意一个返回错误，`Wait` 立即返回该错误
- `Wait` 等待所有 goroutine 完成

---

## 二、WithContext

### 2.1 自动取消

```go
func fetchAll(ctx context.Context, urls []string) ([]string, error) {
    g, ctx := errgroup.WithContext(ctx)
    results := make([]string, len(urls))

    for i, url := range urls {
        i, url := i, url
        g.Go(func() error {
            req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
            if err != nil {
                return err
            }
            resp, err := http.DefaultClient.Do(req)
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

- `WithContext` 返回一个派生的 context
- 任意 goroutine 返回错误时，context 被取消
- 其他 goroutine 可以通过 `ctx.Done()` 感知并提前退出

---

## 三、SetLimit 并发控制

### 3.1 限制并发数

```go
func processItems(items []Item) error {
    g := new(errgroup.Group)
    g.SetLimit(10)

    for _, item := range items {
        item := item
        g.Go(func() error {
            return processItem(item)
        })
    }

    return g.Wait()
}
```

- `SetLimit(n)` 限制最多 n 个 goroutine 并发
- 当达到限制时，`Go` 会阻塞直到有 goroutine 完成

### 3.2 TryGo 非阻塞

```go
g := new(errgroup.Group)
g.SetLimit(10)

for _, item := range items {
    item := item
    for !g.TryGo(func() error {
        return processItem(item)
    }) {
        time.Sleep(100 * time.Millisecond)
    }
}
g.Wait()
```

- `TryGo` 非阻塞，返回是否成功启动
- 达到限制时返回 `false`

---

## 四、实际应用场景

### 4.1 并行请求

```go
func parallelFetch(ctx context.Context, urls []string) (map[string]string, error) {
    g, ctx := errgroup.WithContext(ctx)
    mu := sync.Mutex{}
    results := make(map[string]string)

    for _, url := range urls {
        url := url
        g.Go(func() error {
            req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
            resp, err := http.DefaultClient.Do(req)
            if err != nil {
                return err
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)

            mu.Lock()
            results[url] = string(body)
            mu.Unlock()
            return nil
        })
    }

    if err := g.Wait(); err != nil {
        return nil, err
    }
    return results, nil
}
```

### 4.2 流水线处理

```go
func pipeline(ctx context.Context, input <-chan Task) error {
    g, ctx := errgroup.WithContext(ctx)

    g.Go(func() error {
        for task := range input {
            task := task
            g.Go(func() error {
                return processTask(ctx, task)
            })
        }
        return nil
    })

    return g.Wait()
}
```

### 4.3 超时控制

```go
func withTimeout() error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    g, ctx := errgroup.WithContext(ctx)

    g.Go(func() error {
        return slowOperation(ctx)
    })

    g.Go(func() error {
        return anotherOperation(ctx)
    })

    return g.Wait()
}
```

---

## 五、errgroup vs sync.WaitGroup

| 特性 | errgroup | sync.WaitGroup |
|------|----------|----------------|
| 错误处理 | 自动收集第一个错误 | 需手动处理 |
| Context 集成 | 支持 | 不支持 |
| 并发限制 | 支持 (SetLimit) | 不支持 |
| 使用复杂度 | 简单 | 较复杂 |

---

## 六、注意事项

1. **闭包变量捕获**：循环中使用 `g.Go` 时注意 `v := v`
2. **Context 取消**：使用 `WithContext` 时确保操作检查 `ctx.Done()`
3. **并发安全**：共享数据需要加锁
4. **错误只返回第一个**：如果需要收集所有错误，使用其他方案
