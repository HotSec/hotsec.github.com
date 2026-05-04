# ClickHouse

ClickHouse 是一个开源的列式数据库管理系统（OLAP），专为在线分析处理设计，查询性能极高。

## 核心特性

- **列式存储**：只读取查询涉及的列，IO 大幅减少
- **向量化执行**：利用 CPU SIMD 指令，批量处理数据
- **分布式**：支持集群部署，水平扩展
- **实时查询**：亿级数据秒级响应
- **SQL 支持**：兼容标准 SQL 语法

## Go 客户端

### 连接

```go
import (
    "github.com/ClickHouse/clickhouse-go/v2"
)

conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{"127.0.0.1:9000"},
    Auth: clickhouse.Auth{
        Database: "default",
        Username: "default",
        Password: "",
    },
    Settings: clickhouse.Settings{
        "max_execution_time": 60,
    },
    DialTimeout:  time.Second * 30,
    ConnMaxLifetime: time.Hour,
})
```

### 建表

```go
err = conn.Exec(ctx, `
    CREATE TABLE IF NOT EXISTS events (
        timestamp DateTime,
        event_id  UUID,
        user_id   UInt64,
        event_type String,
        payload   String
    ) ENGINE = MergeTree()
    PARTITION BY toYYYYMM(timestamp)
    ORDER BY (timestamp, event_id)
`)
```

### 批量写入

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO events")
if err != nil {
    return err
}

for i := 0; i < 10000; i++ {
    batch.Append(
        time.Now(),
        uuid.New(),
        uint64(i%1000),
        "click",
        fmt.Sprintf(`{"page": "/home/%d"}`, i),
    )
}

return batch.Send()
```

### 查询

```go
rows, err := conn.Query(ctx, `
    SELECT event_type, count() as cnt
    FROM events
    WHERE timestamp >= now() - INTERVAL 1 HOUR
    GROUP BY event_type
    ORDER BY cnt DESC
    LIMIT 10
`)

for rows.Next() {
    var eventType string
    var cnt uint64
    rows.Scan(&eventType, &cnt)
    fmt.Printf("%s: %d\n", eventType, cnt)
}
rows.Close()
```

### 参数化查询

```go
row := conn.QueryRow(ctx,
    "SELECT count() FROM events WHERE user_id = ? AND event_type = ?",
    userId, "click",
)
var count uint64
row.Scan(&count)
```

## 表引擎

| 引擎 | 特点 | 适用 |
|------|------|------|
| MergeTree | 默认引擎，主键排序 | 大多数场景 |
| ReplacingMergeTree | 去重相同主键行 | 去重场景 |
| SummingMergeTree | 预聚合求和 | 聚合统计 |
| AggregatingMergeTree | 预聚合物化视图 | 复杂聚合 |
| CollapsingMergeTree | 抵消/折叠行 | 状态变更 |
| Distributed | 分布式表代理 | 集群查询 |
| ReplicatedMergeTree | 副本表 | 高可用 |

## 分区与排序

```sql
CREATE TABLE metrics (
    date       Date,
    metric_id  UInt32,
    value      Float64,
    tags       Map(String, String)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, metric_id)
TTL date + INTERVAL 90 DAY
```

- **PARTITION BY**：按月分区，便于数据管理和过期
- **ORDER BY**：排序键，决定数据存储顺序，影响查询性能
- **TTL**：自动过期删除旧数据

## 物化视图

```sql
CREATE MATERIALIZED VIEW metrics_hourly
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, metric_id, hour)
AS SELECT
    date,
    metric_id,
    toHour(timestamp) as hour,
    sum(value) as value
FROM metrics
GROUP BY date, metric_id, hour
```

## 集群配置

```xml
<clickhouse>
    <remote_servers>
        <my_cluster>
            <shard>
                <replica>
                    <host>ch01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>ch02</host>
                    <port>9000</port>
                </replica>
            </shard>
            <shard>
                <replica>
                    <host>ch03</host>
                    <port>9000</port>
                </replica>
            </shard>
        </my_cluster>
    </remote_servers>
</clickhouse>
```

```sql
CREATE TABLE events_dist ON CLUSTER my_cluster AS events
ENGINE = Distributed(my_cluster, default, events, rand())
```

## 性能优化

- **排序键选择**：高基数的过滤字段放前面
- **分区策略**：按时间分区，避免过多小分区
- **批量写入**：攒批写入，避免频繁小写入
- **避免 SELECT ***：只查需要的列
- **PREWHERE**：对过滤列优先读取
- **JOIN 优化**：小表放右侧，使用 IN 替代 JOIN
