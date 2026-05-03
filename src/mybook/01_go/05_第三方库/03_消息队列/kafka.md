# Go 操作 Kafka

## 一、安装

```bash
go get github.com/segmentio/kafka-go
```

## 二、生产者

```go
w := &kafka.Writer{
    Addr:         kafka.TCP("localhost:9092"),
    Topic:        "my-topic",
    Balancer:     &kafka.LeastBytes{},
    BatchTimeout: 10 * time.Millisecond,
}
defer w.Close()

err := w.WriteMessages(context.Background(),
    kafka.Message{Key: []byte("key1"), Value: []byte("value1")},
    kafka.Message{Key: []byte("key2"), Value: []byte("value2")},
)
```

## 三、消费者

### 3.1 简单消费

```go
r := kafka.NewReader(kafka.ReaderConfig{
    Brokers:   []string{"localhost:9092"},
    Topic:     "my-topic",
    GroupID:   "my-group",
    MinBytes:  10e3,
    MaxBytes:  10e6,
})
defer r.Close()

for {
    m, err := r.ReadMessage(context.Background())
    if err != nil {
        break
    }
    fmt.Printf("key=%s value=%s topic=%s partition=%d offset=%d\n",
        string(m.Key), string(m.Value), m.Topic, m.Partition, m.Offset)
}
```

### 3.2 ConsumerGroup

```go
r := kafka.NewReader(kafka.ReaderConfig{
    Brokers:  []string{"localhost:9092"},
    Topic:    "my-topic",
    GroupID:  "my-group",
})
defer r.Close()

for {
    m, err := r.FetchMessage(context.Background())
    if err != nil {
        break
    }
    process(m)
    r.CommitMessages(context.Background(), m)
}
```

## 四、管理操作

```go
conn, _ := kafka.DialLeader(context.Background(), "tcp", "localhost:9092", "my-topic", 0)

partitions, _ := conn.ReadPartitions("my-topic")

conn.CreateTopics(kafka.TopicConfig{
    Topic:             "new-topic",
    NumPartitions:     3,
    ReplicationFactor: 1,
})

conn.DeleteTopics("old-topic")
```

## 五、生产者配置

```go
w := &kafka.Writer{
    Addr:         kafka.TCP("localhost:9092"),
    Topic:        "my-topic",
    Balancer:     &kafka.Hash{},
    MaxAttempts:  3,
    BatchSize:    100,
    BatchTimeout: 10 * time.Millisecond,
    ReadTimeout:  10 * time.Second,
    WriteTimeout: 10 * time.Second,
    RequiredAcks: kafka.RequireAll,
    Async:        true,
    Completion: func(messages []kafka.Message, err error) {
        if err != nil {
            log.Printf("batch error: %v", err)
        }
    },
}
```

## 六、消费者配置

```go
r := kafka.NewReader(kafka.ReaderConfig{
    Brokers:                []string{"localhost:9092"},
    Topic:                  "my-topic",
    GroupID:                "my-group",
    QueueCapacity:          100,
    MinBytes:               10e3,
    MaxBytes:               10e6,
    MaxWait:                5 * time.Second,
    ReadLagInterval:        10 * time.Second,
    HeartbeatInterval:      3 * time.Second,
    CommitInterval:         time.Second,
    SessionTimeout:         30 * time.Second,
    RebalanceTimeout:       30 * time.Second,
    RetentionTime:          7 * 24 * time.Hour,
    StartOffset:            kafka.FirstOffset,
})
```
