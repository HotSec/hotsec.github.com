# select

`select` 是 Go 并发编程中的关键控制结构，用于在多个 channel 操作间进行选择，类似于通信领域的多路复用。

---

## 一、基本语法

```go
select {
case v := <-ch1:
    fmt.Println("received from ch1:", v)
case v := <-ch2:
    fmt.Println("received from ch2:", v)
case ch3 <- value:
    fmt.Println("sent to ch3")
default:
    fmt.Println("no channel ready")
}
```

- 每个 `case` 必须是 channel 的发送或接收操作
- `select` 会随机选择一个就绪的 case 执行
- 如果没有 case 就绪且有 `default`，执行 `default`
- 如果没有 case 就绪且无 `default`，**阻塞等待**

---

## 二、select 行为规则

### 2.1 随机选择

```go
ch1 := make(chan string, 1)
ch2 := make(chan string, 1)
ch1 <- "from ch1"
ch2 <- "from ch2"

select {
case v := <-ch1:
    fmt.Println(v)
case v := <-ch2:
    fmt.Println(v)
}
```

- 当多个 case 同时就绪时，**随机选择一个**执行
- 这是为了避免饥饿问题

### 2.2 阻塞等待

```go
ch := make(chan int)

select {
case v := <-ch:
    fmt.Println(v)
}
```

- 没有 `default` 时，如果所有 case 都未就绪，select 会阻塞

### 2.3 非阻塞检查

```go
select {
case v := <-ch:
    fmt.Println("got:", v)
default:
    fmt.Println("no value available")
}
```

- 有 `default` 时，如果没有 case 就绪，立即执行 `default`

---

## 三、常见模式

### 3.1 超时控制

```go
select {
case result := <-ch:
    fmt.Println("result:", result)
case <-time.After(3 * time.Second):
    fmt.Println("timeout")
}
```

### 3.2 定时执行

```go
ticker := time.NewTicker(1 * time.Second)
defer ticker.Stop()

for {
    select {
    case <-ticker.C:
        fmt.Println("tick at", time.Now())
    }
}
```

### 3.3 退出信号

```go
done := make(chan struct{})

go func() {
    time.Sleep(5 * time.Second)
    close(done)
}()

for {
    select {
    case <-done:
        fmt.Println("exiting")
        return
    default:
        doWork()
    }
}
```

### 3.4 多 channel 合并

```go
func merge(ch1, ch2 <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for ch1 != nil || ch2 != nil {
            select {
            case v, ok := <-ch1:
                if !ok {
                    ch1 = nil
                    continue
                }
                out <- v
            case v, ok := <-ch2:
                if !ok {
                    ch2 = nil
                    continue
                }
                out <- v
            }
        }
    }()
    return out
}
```

### 3.5 非阻塞发送

```go
select {
case ch <- value:
    fmt.Println("sent")
default:
    fmt.Println("channel full, dropped")
}
```

---

## 四、空 select

```go
select {}
```

- 永久阻塞当前 goroutine
- 等价于 `<-make(chan struct{})`

---

## 五、select 与 for 循环

```go
for {
    select {
    case v := <-ch1:
        process(v)
    case v := <-ch2:
        process(v)
    case <-done:
        return
    }
}
```

- `select` 只执行一次，需要 `for` 循环才能持续监听
- 注意：`for-select` 循环中，如果 channel 关闭，需要处理零值问题

### 5.1 正确处理关闭

```go
for {
    select {
    case v, ok := <-ch:
        if !ok {
            ch = nil
            if ch1 == nil && ch2 == nil {
                return
            }
            continue
        }
        process(v)
    }
}
```

---

## 六、select 底层实现

### 6.1 scase 结构

```go
type scase struct {
    c    *hchan
    elem unsafe.Pointer
    kind uint16
}
```

- `kind`：`caseRecv`、`caseSend`、`caseDefault`
- `c`：操作的 channel

### 6.2 执行流程

1. 将所有 case 随机排序
2. 按排序顺序检查每个 case 是否就绪
3. 如果有就绪的 case，执行并返回
4. 如果没有就绪的 case 且有 `default`，执行 `default`
5. 如果没有就绪的 case 且无 `default`，将当前 goroutine 挂载到所有 case 的 channel 等待队列上
6. 当某个 channel 就绪时，唤醒 goroutine，从其他 channel 的等待队列中移除

---

## 七、常见陷阱

### 7.1 goroutine 泄漏

```go
func doWork() <-chan int {
    ch := make(chan int)
    go func() {
        result := heavyComputation()
        ch <- result
    }()
    return ch
}

select {
case v := <-doWork():
    fmt.Println(v)
case <-time.After(time.Second):
    fmt.Println("timeout")
}
```

- 超时后 goroutine 仍在运行，且 `ch <- result` 永远阻塞
- 解决：使用带缓冲的 channel 或 context 取消

```go
func doWork(ctx context.Context) <-chan int {
    ch := make(chan int, 1)
    go func() {
        select {
        case ch <- heavyComputation():
        case <-ctx.Done():
        }
    }()
    return ch
}
```

### 7.2 饥饿问题

```go
for {
    select {
    case <-highPriority:
        handleHigh()
    case <-lowPriority:
        handleLow()
    }
}
```

- select 随机选择，理论上不会饥饿
- 但如果 highPriority 一直有数据，lowPriority 可能长时间得不到处理
- 解决：使用单独的 goroutine 处理或加权调度
