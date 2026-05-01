# NoSQL 数据库

---

## 一、NoSQL 分类

| 类型 | 代表 | 特点 | 适用场景 |
|------|------|------|----------|
| 键值 | Redis, Memcached | 极快读写 | 缓存、会话 |
| 文档 | MongoDB, CouchDB | 灵活 Schema | 内容管理、日志 |
| 列族 | Cassandra, HBase | 海量数据 | 时序、IoT |
| 图 | Neo4j, Nebula | 关系查询 | 社交、推荐 |
| 时序 | InfluxDB, TDengine | 时间序列 | 监控、IoT |

---

## 二、Redis

### 2.1 数据结构

| 类型 | 说明 | 典型场景 |
|------|------|----------|
| String | 字符串/数值 | 缓存、计数器 |
| List | 双向链表 | 消息队列 |
| Hash | 哈希表 | 对象存储 |
| Set | 无序集合 | 标签、去重 |
| ZSet | 有序集合 | 排行榜 |
| Stream | 消息流 | 事件流 |
| Bitmap | 位图 | 签到 |
| HyperLogLog | 基数估计 | UV 统计 |

### 2.2 Go 操作 Redis

```go
import "github.com/redis/go-redis/v9"

rdb := redis.NewClient(&redis.Options{
    Addr:     "localhost:6379",
    Password: "",
    DB:       0,
})

// String
rdb.Set(ctx, "key", "value", time.Hour)
val, err := rdb.Get(ctx, "key").Result()

// Hash
rdb.HSet(ctx, "user:1", "name", "Alice", "age", 25)
name := rdb.HGet(ctx, "user:1", "name").Val()

// Set
rdb.SAdd(ctx, "tags", "go", "redis", "cache")
members := rdb.SMembers(ctx, "tags").Val()

// ZSet
rdb.ZAdd(ctx, "leaderboard", redis.Z{Score: 95, Member: "Alice"})
rdb.ZAdd(ctx, "leaderboard", redis.Z{Score: 87, Member: "Bob"})
top3 := rdb.ZRevRangeWithScores(ctx, "leaderboard", 0, 2).Val()

// 过期
rdb.Expire(ctx, "key", 30*time.Minute)
rdb.TTL(ctx, "key")
```

### 2.3 缓存模式

```go
// Cache-Aside
func GetUser(id string) (*User, error) {
    key := "user:" + id

    // 1. 查缓存
    val, err := rdb.Get(ctx, key).Result()
    if err == nil {
        var user User
        json.Unmarshal([]byte(val), &user)
        return &user, nil
    }

    // 2. 查数据库
    user, err := db.FindUser(id)
    if err != nil {
        return nil, err
    }

    // 3. 写缓存
    data, _ := json.Marshal(user)
    rdb.Set(ctx, key, data, 30*time.Minute)

    return user, nil
}
```

---

## 三、MongoDB

### 3.1 文档模型

```json
{
    "_id": ObjectId("..."),
    "name": "Alice",
    "age": 25,
    "email": "alice@example.com",
    "address": {
        "city": "Beijing",
        "street": "Chaoyang Road"
    },
    "tags": ["go", "python"],
    "created_at": ISODate("2024-01-01")
}
```

### 3.2 Go 操作 MongoDB

```go
import "go.mongodb.org/mongo-driver/mongo"

// 插入
doc := bson.D{{"name", "Alice"}, {"age", 25}}
collection.InsertOne(ctx, doc)

// 查询
filter := bson.D{{"age", bson.D{{"$gte", 20}}}}
cursor, _ := collection.Find(ctx, filter)
var results []User
cursor.All(ctx, &results)

// 更新
update := bson.D{{"$set", bson.D{{"age", 26}}}}
collection.UpdateOne(ctx, bson.D{{"name", "Alice"}}, update)

// 聚合
pipeline := mongo.Pipeline{
    {{"$match", bson.D{{"status", "active"}}}},
    {{"$group", bson.D{{"_id", "$city"}, {"count", bson.D{{"$sum", 1}}}}}},
    {{"$sort", bson.D{{"count", -1}}}},
}
cursor, _ := collection.Aggregate(ctx, pipeline)
```

### 3.3 索引

```go
// 单字段索引
collection.Indexes().CreateOne(ctx, mongo.IndexModel{
    Keys: bson.D{{"email", 1}},
})

// 复合索引
collection.Indexes().CreateOne(ctx, mongo.IndexModel{
    Keys: bson.D{{"city", 1}, {"age", -1}},
})

// 文本索引
collection.Indexes().CreateOne(ctx, mongo.IndexModel{
    Keys: bson.D{{"content", "text"}},
})

// TTL 索引（自动过期删除）
collection.Indexes().CreateOne(ctx, mongo.IndexModel{
    Keys:    bson.D{{"created_at", 1}},
    Options: options.Index().SetExpireAfterSeconds(3600),
})
```

---

## 四、Cassandra

### 4.1 数据模型

```sql
-- 宽行存储，按分区键分布
CREATE TABLE events (
    device_id TEXT,
    event_time TIMESTAMP,
    temperature DOUBLE,
    humidity DOUBLE,
    PRIMARY KEY (device_id, event_time)
) WITH CLUSTERING ORDER BY (event_time DESC);

-- 查询必须包含分区键
SELECT * FROM events
WHERE device_id = 'sensor-001'
  AND event_time > '2024-01-01';
```

### 4.2 一致性级别

| 级别 | 说明 | 性能 |
|------|------|------|
| ONE | 一个副本确认 | 最高 |
| QUORUM | 多数副本确认 | 中等 |
| ALL | 所有副本确认 | 最低 |
| LOCAL_QUORUM | 本地 DC 多数确认 | 推荐 |

---

## 五、时序数据库

### 5.1 InfluxDB

```sql
-- 写入
INSERT cpu,host=server01,region=us-west value=0.64 1434055562000000000

-- 查询
SELECT mean(value) FROM cpu
WHERE time > now() - 1h
GROUP BY time(10m), host

-- 连续查询（降采样）
CREATE CONTINUOUS QUERY cq_10m ON mydb
BEGIN
    SELECT mean(value) INTO cpu_10m
    FROM cpu GROUP BY time(10m), host
END
```

---

## 六、SQL vs NoSQL 选型

| 维度 | SQL | NoSQL |
|------|-----|-------|
| 数据结构 | 固定 Schema | 灵活 Schema |
| 事务 | 强 ACID | 最终一致性 |
| 扩展 | 垂直扩展 | 水平扩展 |
| 查询 | 复杂 JOIN | 简单查询 |
| 适用 | 业务数据、金融 | 日志、缓存、IoT |

| 场景 | 推荐 |
|------|------|
| 用户/订单/交易 | PostgreSQL/MySQL |
| 缓存/会话/排行榜 | Redis |
| 内容管理/日志 | MongoDB |
| 海量时序数据 | InfluxDB/TDengine |
| 社交关系图谱 | Neo4j/Nebula |
| 海量写入+高可用 | Cassandra |
