# context包

- context 用于设置截止日期、传递取消信号、携带请求范围的信息
  - Dealine 返回当前 context 的截止时间，没有截止时间会返回 ok=false
  - Done 返回一个只读的 channel，在 context 被取消或者到达截止时间时，该 channel 会被 close
  - Err 返回 context 被取消的原因，context 没有被取消时，Err 返回 nil
  - Value 返回 context 中存储的键值，键必须是可比较的，如果 context 中没有该键值，Value 返回 nil
  - WithCancel 返回带有新 Done channel 的 parent context 的副本，调用返回的 cancel 函数可以取消这个 context
  - WithDeadline 返回带有新 Done channel 的 parent context 的副本，新的 Done channel 在 parent context 的截止日期或者 d 之前会关闭，如果当前时间已经超过了截止日期，context 立即被取消
  - WithTimeout 和 WithDeadline 类似，不过 WithTimeout 接受的是超时时间
  - WithValue 返回带有键值对的 parent context  的副本，可以通过 context.Value(key) 获取对应的值，如果 context 没有设置该键值，context.Value(key) 返回 nil
- Background 返回一个空的 context，这个 context 不能被取消、没有值、也没有截止日期，一般作为主函数、初始化和测试代码的 Context
- TODO 返回一个空的 context，它通常在不确定的时候使用
- **本质上background与todo是不携带任何信息的Context**

- ```go
   // 用 context 包来重新实现线程安全退出或超时的控制:
  func worker(ctx context.Context, wg *sync.WaitGroup) error {
      defer wg.Done()

      for {
          select {
          default:
              fmt.Println("hello")
          case <-ctx.Done():
              return ctx.Err()
          }
      }
  }

  func main() {
      ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

      var wg sync.WaitGroup
      for i := 0; i < 10; i++ {
          wg.Add(1)
          go worker(ctx, &wg)
      }

      time.Sleep(time.Second)
      cancel()

      wg.Wait()
  }
  ```

- ```go
    package main

    import (
        "context"
        "fmt"
        "sync"
    )

    // 返回生成自然数序列的管道: 2, 3, 4, ...
    func GenerateNatural(ctx context.Context, wg *sync.WaitGroup) chan int {
        ch := make(chan int)
        go func() {
            defer wg.Done()
            defer close(ch)
            for i := 2; ; i++ {
                select {
                case <-ctx.Done():
                    return
                case ch <- i:
                }
            }
        }()
        return ch
    }

    // 管道过滤器: 删除能被素数整除的数
    func PrimeFilter(ctx context.Context, in <-chan int, prime int, wg *sync.WaitGroup) chan int {
        out := make(chan int)
        go func() {
            defer wg.Done()
            defer close(out)
            for i := range in {
                if i%prime != 0 {
                    select {
                    case <-ctx.Done():
                        return
                    case out <- i:
                    }
                }
            }
        }()
        return out
    }

    func main() {
        wg := sync.WaitGroup{}
        // 通过 Context 控制后台 Goroutine 状态
        ctx, cancel := context.WithCancel(context.Background())
        wg.Add(1)
        ch := GenerateNatural(ctx, &wg) // 自然数序列: 2, 3, 4, ...
        for i := 0; i < 100; i++ {
            prime := <-ch // 新出现的素数
            fmt.Printf("%v: %v\n", i+1, prime)
            wg.Add(1)
            ch = PrimeFilter(ctx, ch, prime, &wg) // 基于新素数构造的过滤器
        }

        cancel()
        wg.Wait()
    }
        
    ```

### Context原理

- 在close时通知所有监听它的协程，每个派生的子Context都会创建一个新的退出通道，因此只要组织好Context之间的关系，就可以实现在整个继链上的退出信号传递。
