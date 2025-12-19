package main

import (
    "fmt"
    "sync"
    "time"
)

type TaskQueue struct {
    urls    []string
    maxSize int
    cond    *sync.Cond
}

func NewTaskQueue(max int) *TaskQueue {
    return &TaskQueue{
        urls:    make([]string, 0, max),
        maxSize: max,
        cond:    sync.NewCond(&sync.Mutex{}),
    }
}

// 生产者：添加URL
func (q *TaskQueue) Add(url string) {
    q.cond.L.Lock()
    defer q.cond.L.Unlock()
    
    // 等待队列有空位
    for len(q.urls) >= q.maxSize {
        fmt.Printf("队列已满，等待消费... 当前长度: %d\n", len(q.urls))
        q.cond.Wait()
    }
    
    q.urls = append(q.urls, url)
    fmt.Printf("添加URL: %s 队列长度: %d\n", url, len(q.urls))
    
    // 通知所有等待的消费者
    q.cond.Broadcast()
}

// 消费者：获取URL
func (q *TaskQueue) Get() string {
    q.cond.L.Lock()
    defer q.cond.L.Unlock()
    
    // 等待队列有数据
    for len(q.urls) == 0 {
        fmt.Println("队列为空，等待生产...")
        q.cond.Wait()
    }
    
    url := q.urls[0]
    q.urls = q.urls[1:]
    fmt.Printf("获取URL: %s 剩余长度: %d\n", url, len(q.urls))
    
    // 通知可能等待的生产者
    q.cond.Signal()
    
    return url
}

func main() {
    queue := NewTaskQueue(3)
    
    // 启动3个消费者
    for i := 0; i < 3; i++ {
        go func(id int) {
            for {
                url := queue.Get()
                fmt.Printf("爬虫%d 正在处理: %s\n", id, url)
                time.Sleep(500 * time.Millisecond) // 模拟爬取耗时
            }
        }(i)
    }
    
    // 模拟生产者添加URL
    urls := []string{
        "http://httpbin.org/page1",
        "http://httpbin.org/page12",
        "http://httpbin.org/page13",
        "http://httpbin.org/page14",
        "http://httpbin.org/page15",
    }
    
    for _, url := range urls {
        queue.Add(url)
        time.Sleep(200 * time.Millisecond)
    }
    
    time.Sleep(3 * time.Second)
}