# Go 操作 RabbitMQ

## 一、安装

```bash
go get github.com/rabbitmq/amqp091-go
```

## 二、连接

```go
conn, err := amqp091.Dial("amqp://guest:guest@localhost:5672/")
if err != nil {
    panic(err)
}
defer conn.Close()

ch, err := conn.Channel()
if err != nil {
    panic(err)
}
defer ch.Close()
```

## 三、工作队列

### 3.1 生产者

```go
q, _ := ch.QueueDeclare(
    "task_queue",
    true,
    false,
    false,
    false,
    nil,
)

body := "hello world"
ch.PublishWithContext(ctx,
    "",
    q.Name,
    false,
    false,
    amqp091.Publishing{
        DeliveryMode: amqp091.Persistent,
        ContentType:  "text/plain",
        Body:         []byte(body),
    },
)
```

### 3.2 消费者

```go
q, _ := ch.QueueDeclare("task_queue", true, false, false, false, nil)

ch.Qos(1, 0, false)

msgs, _ := ch.Consume(q.Name, "", false, false, false, false, nil)

for msg := range msgs {
    fmt.Printf("received: %s\n", msg.Body)
    msg.Ack(false)
}
```

## 四、发布/订阅（Fanout）

```go
err := ch.ExchangeDeclare(
    "logs",
    "fanout",
    true,
    false,
    false,
    false,
    nil,
)

ch.PublishWithContext(ctx, "logs", "", false, false, amqp091.Publishing{
    Body: []byte("log message"),
})

q, _ := ch.QueueDeclare("", false, false, true, false, nil)
ch.QueueBind(q.Name, "", "logs", false, nil)
```

## 五、路由（Direct）

```go
ch.ExchangeDeclare("logs_direct", "direct", true, false, false, false, nil)

ch.PublishWithContext(ctx, "logs_direct", "error", false, false, amqp091.Publishing{
    Body: []byte("error message"),
})

q, _ := ch.QueueDeclare("", false, false, true, false, nil)
ch.QueueBind(q.Name, "error", "logs_direct", false, nil)
ch.QueueBind(q.Name, "warning", "logs_direct", false, nil)
```

## 六、主题（Topic）

```go
ch.ExchangeDeclare("logs_topic", "topic", true, false, false, false, nil)

ch.PublishWithContext(ctx, "logs_topic", "app.error.critical", false, false, amqp091.Publishing{
    Body: []byte("critical error"),
})

q, _ := ch.QueueDeclare("", false, false, true, false, nil)
ch.QueueBind(q.Name, "app.error.*", "logs_topic", false, nil)
ch.QueueBind(q.Name, "app.#", "logs_topic", false, nil)
```

| 模式 | Exchange 类型 | 路由键 | 说明 |
|------|-------------|--------|------|
| 工作队列 | 默认 | 队列名 | 负载均衡 |
| 发布/订阅 | fanout | 忽略 | 广播 |
| 路由 | direct | 精确匹配 | 按日志级别 |
| 主题 | topic | 模式匹配 | `*` 一个词，`#` 零或多个词 |
