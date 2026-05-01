# singleflight 防缓存击穿

## 一、概述

`golang.org/x/sync/singleflight` 用于合并并发请求，确保同一时刻对同一个 key 的多个请求只执行一次，其他请求共享结果。

典型场景：缓存击穿（大量请求同时查询一个过期的缓存 key）。

## 二、基本使用

```go
import "golang.org/x/sync/singleflight"

var group singleflight.Group

func getUser(ctx context.Context, id int) (*User, error) {
    key := fmt.Sprintf("user:%d", id)

    v, err, _ := group.Do(key, func() (interface{}, error) {
        user, err := fetchUserFromDB(ctx, id)
        if err != nil {
            return nil, err
        }
        return user, nil
    })

    if err != nil {
        return nil, err
    }
    return v.(*User), nil
}
```

- `Do(key, fn)`：对同一个 key，同一时刻只执行一次 fn
- 返回值 `v` 是 fn 的返回值，`err` 是 fn 的错误
- 第三个返回值 `shared` 表示是否共享了结果

## 三、Do 与 DoChan

```go
v, err, shared := group.Do(key, fn)

ch := group.DoChan(key, fn)
result := <-ch
fmt.Println(result.Val, result.Err, result.Shared)
```

- `Do`：同步等待，阻塞直到结果返回
- `DoChan`：异步，返回 channel

## 四、Forget

```go
group.Forget(key)
```

- 清除 key 的调用记录
- 下次调用会重新执行 fn
- 可用于强制刷新

## 五、完整示例

```go
package main

import (
    "fmt"
    "sync"
    "time"
    "golang.org/x/sync/singleflight"
)

var sg singleflight.Group

func expensiveOperation(key string) (string, error) {
    fmt.Printf("executing for key: %s\n", key)
    time.Sleep(2 * time.Second)
    return "result:" + key, nil
}

func main() {
    var wg sync.WaitGroup

    for i := 0; i < 5; i++ {
        wg.Add(1)
        go func(i int) {
            defer wg.Done()
            v, err, shared := sg.Do("key1", func() (interface{}, error) {
                return expensiveOperation("key1")
            })
            fmt.Printf("goroutine %d: val=%v, err=%v, shared=%v\n", i, v, err, shared)
        }(i)
    }

    wg.Wait()
}
```

输出：`executing for key: key1` 只打印一次，5 个 goroutine 共享结果。

## 六、与缓存结合

```go
func getUserWithCache(ctx context.Context, id int) (*User, error) {
    cacheKey := fmt.Sprintf("user:%d", id)

    if cached, ok := cache.Get(cacheKey); ok {
        return cached.(*User), nil
    }

    v, err, _ := sg.Do(cacheKey, func() (interface{}, error) {
        user, err := db.GetUser(ctx, id)
        if err != nil {
            return nil, err
        }
        cache.Set(cacheKey, user, 5*time.Minute)
        return user, nil
    })

    if err != nil {
        return nil, err
    }
    return v.(*User), nil
}
```
