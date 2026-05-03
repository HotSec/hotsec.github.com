# conc 并发库

## 一、安装

```bash
go get github.com/sourcegraph/conc
```

## 二、pool 并发池

```go
import "github.com/sourcegraph/conc/pool"

p := pool.New().WithMaxGoroutines(10)

for i := 0; i < 100; i++ {
    i := i
    p.Go(func() {
        process(i)
    })
}

p.Wait()
```

### 带结果的 pool

```go
p := pool.NewWithResults[int]().WithMaxGoroutines(10)

for i := 0; i < 100; i++ {
    i := i
    p.Go(func() int {
        return compute(i)
    })
}

results := p.Wait()
fmt.Println(results)
```

### 带错误的 pool

```go
p := pool.NewWithErrors[error]().WithMaxGoroutines(10)

for _, url := range urls {
    url := url
    p.Go(func() error {
        return fetch(url)
    })
}

err := p.Wait()
```

### 带结果和错误的 pool

```go
p := pool.NewWithResults[string]().
    WithMaxGoroutines(10).
    WithErrors().
    WithFirstError()

for _, url := range urls {
    url := url
    p.Go(func() (string, error) {
        return fetchBody(url)
    })
}

results, err := p.Wait()
```

## 三、stream 流式处理

```go
import "github.com/sourcegraph/conc/stream"

s := stream.New().WithMaxGoroutines(10)

for _, item := range items {
    item := item
    s.Go(func() stream.Callback {
        result := process(item)
        return func() {
            fmt.Println(result)
        }
    })
}

s.Wait()
```

## 四、iter 迭代器

```go
import "github.com/sourcegraph/conc/iter"

err := iter.ForEach[int](slice, func(i *iter.Context[int]) {
    process(i.Value())
})

results := iter.Map[int, string](slice, func(i *iter.Context[int]) (string, error) {
    return transform(i.Value()), nil
})
```

## 五、对比标准库

| 特性 | conc | errgroup |
|------|------|----------|
| 限制并发数 | `WithMaxGoroutines` | 需配合 semaphore |
| 收集结果 | `WithResults` | 需手动收集 |
| 错误处理 | `WithErrors`/`WithFirstError` | 仅第一个错误 |
| 流式处理 | `stream` | 无 |
| 泛型支持 | 是 | 否 |
