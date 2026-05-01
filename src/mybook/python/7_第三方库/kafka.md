# Python Kafka

## 核心概念

### Topic & Partition

- Topic：消息逻辑分类
- Partition：Topic 的物理分片，有序不可变日志
- Offset：分区内消息的唯一递增标识
- 分区数影响并行度和吞吐量

### Consumer Group

- 同一组内消费者分摊分区（一个分区只被一个消费者消费）
- 组间广播：不同组独立消费同一 Topic
- Rebalance：消费者加入/离开时重新分配分区

## Python 客户端

### confluent-kafka（基于 librdkafka，高性能）

```python
from confluent_kafka import Producer, Consumer

producer = Producer({'bootstrap.servers': 'localhost:9092'})
producer.produce('my-topic', key='key', value='hello')
producer.flush()

consumer = Consumer({
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'my-group',
    'auto.offset.reset': 'earliest'
})
consumer.subscribe(['my-topic'])
while True:
    msg = consumer.poll(1.0)
    if msg and not msg.error():
        print(msg.value())
```

### kafka-python（纯 Python，易安装）

```python
from kafka import KafkaProducer, KafkaConsumer

producer = KafkaProducer(bootstrap_servers='localhost:9092')
producer.send('my-topic', b'hello')
producer.flush()

consumer = KafkaConsumer('my-topic',
    bootstrap_servers='localhost:9092',
    group_id='my-group')
for msg in consumer:
    print(msg.value)
```

## 存储原理

- 日志追加存储（Append-Only Log）
- 零拷贝（sendfile）：内核空间直接传输，无用户态拷贝
- 页面缓存（Page Cache）：利用 OS 缓存，避免 JVM GC 压力
- 顺序写：磁盘顺序写性能接近内存随机写

## Exactly-Once 语义

- 幂等生产者：`enable.idempotence=true`
- 事务：`initTransactions()` / `beginTransaction()` / `commitTransaction()`
- 消费者隔离级别：`isolation.level=read_committed`

## 分区再平衡

- 触发条件：消费者加入/离开/心跳超时
- 策略：Range / RoundRobin / Sticky / CooperativeSticky
- 避免 Rebalance：合理设置 `session.timeout.ms` / `heartbeat.interval.ms` / `max.poll.interval.ms`

## Kafka Streams / Connect 生态

- **Kafka Streams**：轻量流处理库，Java/Scala
- **Kafka Connect**：数据导入导出框架
  - Source Connector：外部系统 → Kafka
  - Sink Connector：Kafka → 外部系统
  - 常用：JDBC / Elasticsearch / S3 / MongoDB Connector
