# channel

- 关闭一个未初始化的channel会引发panic
- 关闭一个已经关闭的channel会引发panic
- 向一个已经关闭的channel发送数据会引发panic
- 从一个已经关闭的channel接收数据会立即返回该类型的零值

- len(channel)：返回 channel 中当前缓存的元素个数。
- cap(channel)：返回 channel 的缓存容量。

### 关闭channel的注意点

- 发送方负责关闭
- 重复关闭会引发 panic
- 关闭一个 nil channel 会引发 panic
- 关闭后不能再发送数据
- 关闭后可以继续接收数据

### 接收方关闭channel的正确方式

- range 循环接收数据
    - ```go
        for v := range ch {
            fmt.Println(v) // 自动在 channel 关闭时退出
        }
        ```

- 判断channel是否关闭

  - ```go
    v, ok := <-ch
    if !ok {
        // channel 已关闭
    } else {
        // 正常接收数据 v
    }
    ```

### 例子

```go
// 无缓存的 Channel 上的发送操作总在对应的接收操作完成前发生.
var done = make(chan bool)
var msg string

func aGoroutine() {
    msg = "你好, 世界"
    done <- true
}

func main() {
    go aGoroutine()
    <-done
    println(msg)
}

// 若在关闭 Channel 后继续从中接收数据，接收者就会收到该 Channel 返回的零值。
var done = make(chan bool)
var msg string

func aGoroutine() {
    msg = "你好, 世界"
    close(done)
}

func main() {
    go aGoroutine()
    <-done
    println(msg)
}

```

```go
// 根据控制 Channel 的缓存大小来控制并发执行的 Goroutine 的最大数目,
var limit = make(chan int, 3)
var work = []func(){
    func() { println("1"); time.Sleep(1 * time.Second) },
    func() { println("2"); time.Sleep(1 * time.Second) },
    func() { println("3"); time.Sleep(1 * time.Second) },
    func() { println("4"); time.Sleep(1 * time.Second) },
    func() { println("5"); time.Sleep(1 * time.Second) },
}

func main() {
    for _, w := range work {
        go func(w func()) {
            limit <- 1
            w()
            <-limit
        }(w)
    }
    select{}
}

```

### 三个协程按顺序打印

```go
package main

import (
    "sync"
)

var count = 5
func main(){

    wg:=sync.WaitGroup{}
    chanA :=make(chan struct{},1)
    chanB :=make(chan struct{},1)
    chanC :=make(chan struct{},1)


    chanA<- struct{}{}
    wg.Add(3)

    go printA(&wg,chanA,chanB)
    go printB(&wg,chanB,chanC)
    go printC(&wg,chanC,chanA)
    wg.Wait()
}

func printA(wg *sync.WaitGroup, chanA chan struct{}, chanB chan struct{}) {
    defer wg.Done()

    for i:=0;i<count;i++{
        <-chanA
        println("A")
        chanB<- struct{}{}
    }
}

func printB(wg *sync.WaitGroup, chanB chan struct{}, chanC chan struct{}) {
    defer wg.Done()

    for i:=0;i<count;i++{
        <-chanB
        println("B")
        chanC<- struct{}{}
    }
}

func printC(wg *sync.WaitGroup, chanC chan struct{}, chanA chan struct{}) {
    defer wg.Done()

    for i:=0;i<count;i++{
        <-chanC
        println("C")
        chanA<- struct{}{}
    }
}
```