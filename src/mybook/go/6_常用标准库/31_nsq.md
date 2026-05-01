# Go 操作 NSQ

## 一、安装

```bash
go get github.com/nsqio/go-nsq
```

## 二、生产者

```go
config := nsq.NewConfig()
producer, _ := nsq.NewProducer("localhost:4150", config)

err := producer.Publish("my-topic", []byte("hello nsq"))
if err != nil {
    panic(err)
}

err = producer.DeferredPublish("my-topic", 5*time.Second, []byte("delayed message"))
producer.Stop()
```

## 三、消费者

```go
config := nsq.NewConfig()
consumer, _ := nsq.NewConsumer("my-topic", "my-channel", config)

consumer.AddHandler(nsq.HandlerFunc(func(message *nsq.Message) error {
    fmt.Printf("received: %s\n", string(message.Body))
    return nil
}))

err := consumer.ConnectToNSQD("localhost:4150")
if err != nil {
    panic(err)
}

<-consumer.StopChan
```

## 四、nsqlookupd 发现

```go
err := consumer.ConnectToNSQLookupd("localhost:4161")
```

## 五、多消费者

- 同一 topic + 不同 channel：消息广播到所有 channel
- 同一 topic + 同一 channel：消息在消费者间负载均衡
