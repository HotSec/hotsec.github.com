# 唯一 ID 生成器

## 分布式唯一 ID 要求

- 全局唯一：不能出现重复 ID
- 单调递增：保证索引性能（B+Tree 友好）
- 高可用：ID 生成服务不能单点
- 高并发：支撑大量 ID 生成请求
- 信息安全：ID 不能暴露业务量（非连续）

## 常见方案

### UUID

```python
import uuid

id = uuid.uuid4()  # 随机 UUID
id = uuid.uuid1()  # 基于时间+MAC 地址
```

| 优点 | 缺点 |
|------|------|
| 本地生成，无网络开销 | 128 位，空间占用大 |
| 无单点故障 | 非单调递增，索引性能差 |
| 实现简单 | 可读性差 |

### Redis INCRBY

```python
import redis

r = redis.Redis()
next_id = r.incrby("seq_id", 1)
```

优点：简单、单调递增。缺点：依赖 Redis 可用性。

### 数据库自增主键

```sql
CREATE TABLE id_generator (
    id BIGINT AUTO_INCREMENT PRIMARY KEY
);
```

优点：严格递增。缺点：性能瓶颈，单点故障。

### 批量获取 ID

```python
# 每次从数据库获取一批 ID，缓存在本地
class SegmentIDGenerator:
    def __init__(self, step=1000):
        self.step = step
        self.current_max = 0
        self.current_id = 0

    def next_id(self):
        if self.current_id >= self.current_max:
            self.current_max = db_fetch_next_segment(self.step)
            self.current_id = self.current_max - self.step + 1
        self.current_id += 1
        return self.current_id
```

### 雪花算法（Snowflake）

64 位长整型 ID 结构：

```
| 1bit 不用 | 41bit 时间戳 | 10bit 机器ID | 12bit 序列号 |
```

```python
import time

class Snowflake:
    def __init__(self, worker_id: int, datacenter_id: int):
        self.worker_id = worker_id          # 5 bit
        self.datacenter_id = datacenter_id  # 5 bit
        self.sequence = 0
        self.last_timestamp = -1
        self.epoch = 1288834974657  # Twitter 纪元

    def next_id(self) -> int:
        timestamp = int(time.time() * 1000)
        if timestamp < self.last_timestamp:
            raise Exception("Clock moved backwards!")

        if timestamp == self.last_timestamp:
            self.sequence = (self.sequence + 1) & 0xFFF
            if self.sequence == 0:
                timestamp = self._wait_next_ms(self.last_timestamp)
        else:
            self.sequence = 0

        self.last_timestamp = timestamp
        return ((timestamp - self.epoch) << 22
                | self.datacenter_id << 17
                | self.worker_id << 12
                | self.sequence)
```

### 时钟回拨处理

- 回拨时间短（< 10ms）：阻塞等待后重试
- 回拨时间长：拒绝请求，触发告警
- 美团方案：比较实例时间与集群平均时间，关闭 NTP

## 美团 Leaf

### Leaf-segment

批量缓存思想：每次从 DB 获取一个号段（如 step=1000），缓存在内存中。

```
DB: max_id = 1000 → 服务缓存 [1, 1000] → 客户端逐个获取
DB: max_id = 2000 → 服务缓存 [1001, 2000] → ...
```

双 Buffer 优化：当前号段消耗到 10% 时，异步加载下一个号段。

### Leaf-snowflake

基于雪花算法，通过 ZooKeeper 注册 workerId，解决时钟回拨。
