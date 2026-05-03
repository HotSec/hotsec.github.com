# 并发

- Goroutine和系统线程
- 原子操作
  
  - ```go
    import (
        "sync"
    )

    var total struct {
        sync.Mutex
        value int
    }

    func worker(wg *sync.WaitGroup) {
        defer wg.Done()

        for i := 0; i <= 100; i++ {
            total.Lock()
            total.value += i
            total.Unlock()
        }
    }

    func main() {
        var wg sync.WaitGroup
        wg.Add(2)
        go worker(&wg)
        go worker(&wg)
        wg.Wait()

        fmt.Println(total.value)
    }
    ```

  - sync.Mutex
  - sync.WaitGroup
  - sync/atomic
    - sync/atomic 包对基本的数值类型及复杂对象的读写都提供了原子操作的支持。atomic.Value 原子对象提供了 Load 和 Store 两个原子方法，分别用于加载和保存数据，返回值和参数都是 interface{} 类型，因此可以用于任意的自定义复杂类型。
    - atomic.Value
      - Store
      - Load

    - ```go
        import (
            "sync"
            "sync/atomic"
        )

        var total uint64

        func worker(wg *sync.WaitGroup) {
            defer wg.Done()

            var i uint64
            for i = 0; i <= 100; i++ {
                atomic.AddUint64(&total, i)
            }
        }

        func main() {
            var wg sync.WaitGroup
            wg.Add(2)

            go worker(&wg)
            go worker(&wg)
            wg.Wait()
        }
      ```

      - ```go
        // 原子操作配合互斥锁可以实现非常高效的单例模式。互斥锁的代价比普通整数的原子读写高很多，在性能敏感的地方可以增加一个数字型的标志位，通过原子检测标志位状态降低互斥锁的使用次数来提高性能。
        type singleton struct {}

        var (
            instance    *singleton
            initialized uint32
            mu          sync.Mutex
        )

        func Instance() *singleton {
            if atomic.LoadUint32(&initialized) == 1 {
                return instance
            }

            mu.Lock()
            defer mu.Unlock()

            if instance == nil {
                defer atomic.StoreUint32(&initialized, 1)
                instance = &singleton{}
            }
            return instance
        }
        ```

    - ```go
        var config atomic.Value // 保存当前配置信息

        // 初始化配置信息
        config.Store(loadConfig())

        // 启动一个后台线程, 加载更新后的配置信息
        go func() {
            for {
                time.Sleep(time.Second)
                config.Store(loadConfig())
            }
        }()

        // 用于处理请求的工作者线程始终采用最新的配置信息
        for i := 0; i < 10; i++ {
            go func() {
                for r := range requests() {
                    c := config.Load()
                    // ...
                }
            }()
        }

        ```

  - sync.Once
    - 一个非常好的延迟初始化的方式
    - sync.Once 只有一个 Do 方法
    - ```go
        var (
            instance *singleton
            once     sync.Once
        )

        func Instance() *singleton {
            once.Do(func() {
                instance = &singleton{}
            })
            return instance
        }
      ```

    - ```go
        type Once struct {
            m    Mutex
            done uint32
        }

        func (o *Once) Do(f func()) {
            if atomic.LoadUint32(&o.done) == 1 {
                return
            }

            o.m.Lock()
            defer o.m.Unlock()

            if o.done == 0 {
                defer atomic.StoreUint32(&o.done, 1)
                f()
            }
        }
      ```

- sync.Cond
  - sync.Cond 条件变量用来协调想要访问共享资源的那些 goroutine，当共享资源的状态发生变化的时候，它可以用来通知被互斥锁阻塞的 goroutine。
  - 
  - ```go
        cond := sync.NewCond(&sync.Mutex{})
        go func() {
            cond.L.Lock()
            cond.Wait() // 等待通知
            fmt.Println("收到通知！")
            cond.L.Unlock()
        }()
        time.Sleep(time.Second)
        cond.Signal() // 发送通知
        // cond.Broadcast() // 发送广播
   ```
- sync.Pool
  - sync.Pool 是协程安全的对象池，主要用来保存和复用临时对象，以减少内存分配和垃圾回收的开销。
  - sync.Pool 的使用方式非常简单，通过 Get 方法从池中获取对象，通过 Put 方法将对象放回池中。
  - sync.Pool 的使用注意事项
    - sync.Pool 是协程安全的，但是它的 Get 和 Put 方法并不是并发安全的，因此在并发场景下需要使用互斥锁来保证并发安全。
  - ```go
        var pool = sync.Pool{
            New: func() interface{} {
                return make([]byte, 1024)
            },
        }

        func main() {
            // 从池中获取一个对象
            data := pool.Get().([]byte)
            // 使用对象
            data[0] = 1
            // 将对象放回池中
            pool.Put(data)
        }
      ```
- 顺序一致性内存模型

- ![1695217879447](./image/9_并发/1695217879447.png)
- go func()