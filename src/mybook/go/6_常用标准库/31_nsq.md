# Go 操作 NSQ

## 一、安装

```bash
go get github.com/nsqio/go-nsq
```

## 二、NSQ 架构

```
Producer → nsqd → Consumer
              ↕
         nsqlookupd（服务发现）
              ↕
         nsqadmin（管理界面）
```

| 组件 | 端口 | 说明 |
|------|------|------|
| nsqd | 4150(TCP)/4151(HTTP) | 消息守护进程，接收/分发/持久化消息 |
| nsqlookupd | 4160(TCP)/4161(HTTP) | 服务发现，管理 nsqd 拓扑 |
| nsqadmin | 4171(HTTP) | Web 管理界面 |

## 三、生产者

```go
config := nsq.NewConfig()
producer, err := nsq.NewProducer("localhost:4150", config)
if err != nil {
    panic(err)
}
defer producer.Stop()

err = producer.Publish("my-topic", []byte("hello nsq"))
if err != nil {
    log.Printf("publish error: %v", err)
}

err = producer.DeferredPublish("my-topic", 5*time.Second, []byte("delayed message"))
if err != nil {
    log.Printf("deferred publish error: %v", err)
}

err = producer.MultiPublish("my-topic", [][]byte{
    []byte("msg1"),
    []byte("msg2"),
})
```

### 3.1 生产者错误处理与重连

```go
func newProducer(addr string) (*nsq.Producer, error) {
    config := nsq.NewConfig()
    producer, err := nsq.NewProducer(addr, config)
    if err != nil {
        return nil, err
    }
    err = producer.Ping()
    if err != nil {
        producer.Stop()
        return nil, fmt.Errorf("ping failed: %w", err)
    }
    return producer, nil
}

func publishWithRetry(producer *nsq.Producer, topic string, body []byte, maxRetries int) error {
    var err error
    for i := 0; i < maxRetries; i++ {
        err = producer.Publish(topic, body)
        if err == nil {
            return nil
        }
        log.Printf("publish attempt %d failed: %v", i+1, err)
        time.Sleep(time.Second * time.Duration(i+1))
    }
    return fmt.Errorf("after %d retries: %w", maxRetries, err)
}
```

## 四、消费者

```go
config := nsq.NewConfig()
consumer, err := nsq.NewConsumer("my-topic", "my-channel", config)
if err != nil {
    panic(err)
}

consumer.AddHandler(nsq.HandlerFunc(func(message *nsq.Message) error {
    fmt.Printf("received: %s (attempts: %d)\n", string(message.Body), message.Attempts)
    return nil
}))

err = consumer.ConnectToNSQD("localhost:4150")
if err != nil {
    panic(err)
}

<-consumer.StopChan
```

### 4.1 消费者优雅关闭

```go
sigCh := make(chan os.Signal, 1)
signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

select {
case <-sigCh:
    log.Println("shutting down consumer...")
    consumer.Stop()
case <-consumer.StopChan:
}

<-consumer.StopChan
log.Println("consumer stopped")
```

### 4.2 消息处理失败与重试

```go
consumer.AddHandler(nsq.HandlerFunc(func(message *nsq.Message) error {
    if message.Attempts > 3 {
        log.Printf("giving up on message after %d attempts: %s", message.Attempts, message.Body)
        return nil
    }

    err := processMessage(message.Body)
    if err != nil {
        log.Printf("processing failed (attempt %d): %v", message.Attempts, err)
        return err
    }
    return nil
}))

config.MaxInFlight = 200
config.DefaultRequeueDelay = 5 * time.Second
config.MaxRequeueDelay = 30 * time.Second
```

## 五、nsqlookupd 发现

```go
err := consumer.ConnectToNSQLookupd("localhost:4161")
```

- 通过 nsqlookupd 自动发现 nsqd 节点
- 支持动态添加/移除 nsqd 节点
- 生产环境推荐使用 nsqlookupd 发现

## 六、多消费者模式

- 同一 topic + 不同 channel：消息广播到所有 channel
- 同一 topic + 同一 channel：消息在消费者间负载均衡

## 七、生产环境配置建议

| 配置项 | 建议值 | 说明 |
|--------|--------|------|
| nsqd --mem-queue-size | 10000 | 内存队列大小 |
| nsqd --data-path | /data/nsq | 持久化目录 |
| nsqd --max-msg-size | 1048576 | 最大消息 1MB |
| nsqd --max-body-size | 5242880 | 最大请求体 5MB |
| nsqd --msg-timeout | 60s | 消息超时 |
| consumer MaxInFlight | 200 | 最大并行处理数 |
