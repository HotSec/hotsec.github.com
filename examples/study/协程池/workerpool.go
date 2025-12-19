package main

import (
    "fmt"
    "sync"
    "time"
)

type Pool struct {
    workerNum int
    taskQueue chan func()
    quit      chan struct{} // 用于优雅关闭
    wg        sync.WaitGroup
}

func NewPool(workerNum int) *Pool {
    return &Pool{
        workerNum: workerNum,
        taskQueue: make(chan func()),
        quit:      make(chan struct{}),
    }
}

func (p *Pool) AddTask(task func()) {
    p.taskQueue <- task
}

func (p *Pool) Start() {
    for i := 0; i < p.workerNum; i++ {
        p.wg.Add(1)
        go p.worker()
    }
}

func (p *Pool) worker() {
    defer p.wg.Done()
    for {
        select {
        case task := <-p.taskQueue:
            task()
        case <-p.quit:
            return
        }
    }
}

func (p *Pool) Stop() {
    close(p.quit)
    p.wg.Wait()
}

func main() {
    pool := NewPool(5)
    pool.Start()
    defer pool.Stop() // 确保main函数结束时优雅关闭

    for i := 0; i < 10; i++ {
        idx := i // 修复数据竞争
        pool.AddTask(func() {
            time.Sleep(1000 * time.Millisecond)
            fmt.Println("Task", idx)
        })
    }
}