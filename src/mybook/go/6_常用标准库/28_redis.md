# Go 操作 Redis

## 一、安装

```bash
go get github.com/redis/go-redis/v9
```

## 二、连接

```go
rdb := redis.NewClient(&redis.Options{
    Addr:     "localhost:6379",
    Password: "",
    DB:       0,
    PoolSize: 100,
})

ctx := context.Background()
err := rdb.Ping(ctx).Err()
if err != nil {
    panic(err)
}
```

## 三、基本操作

### 3.1 String

```go
rdb.Set(ctx, "key", "value", 0)
rdb.Set(ctx, "key", "value", 10*time.Minute)

val, err := rdb.Get(ctx, "key").Result()
val, err := rdb.Get(ctx, "nonexistent").Result()

rdb.SetNX(ctx, "key", "value", 10*time.Minute)

rdb.Incr(ctx, "counter")
rdb.IncrBy(ctx, "counter", 10)
rdb.Decr(ctx, "counter")

rdb.MSet(ctx, "k1", "v1", "k2", "v2")
vals, _ := rdb.MGet(ctx, "k1", "k2").Result()
```

### 3.2 Hash

```go
rdb.HSet(ctx, "user:1", "name", "Go", "age", 18)
rdb.HSet(ctx, "user:1", map[string]interface{}{"name": "Go", "age": 18})

name, _ := rdb.HGet(ctx, "user:1", "name").Result()
all, _ := rdb.HGetAll(ctx, "user:1").Result()

rdb.HIncrBy(ctx, "user:1", "age", 1)
rdb.HDel(ctx, "user:1", "age")
exists, _ := rdb.HExists(ctx, "user:1", "name").Result()
```

### 3.3 List

```go
rdb.LPush(ctx, "list", "a", "b", "c")
rdb.RPush(ctx, "list", "x", "y", "z")

val, _ := rdb.LPop(ctx, "list").Result()
val, _ := rdb.RPop(ctx, "list").Result()

vals, _ := rdb.LRange(ctx, "list", 0, -1).Result()
length, _ := rdb.LLen(ctx, "list").Result()
```

### 3.4 Set

```go
rdb.SAdd(ctx, "set", "a", "b", "c")
members, _ := rdb.SMembers(ctx, "set").Result()
exists, _ := rdb.SIsMember(ctx, "set", "a").Result()
rdb.SRem(ctx, "set", "a")
```

### 3.5 Sorted Set

```go
rdb.ZAdd(ctx, "zset", redis.Z{Score: 100, Member: "Go"})
rdb.ZAdd(ctx, "zset", redis.Z{Score: 90, Member: "Python"})

members, _ := rdb.ZRangeByScore(ctx, "zset", &redis.ZRangeBy{
    Min: "0",
    Max: "100",
}).Result()

members, _ := rdb.ZRevRangeWithScores(ctx, "zset", 0, 9).Result()
score, _ := rdb.ZScore(ctx, "zset", "Go").Result()
rank, _ := rdb.ZRank(ctx, "zset", "Go").Result()
```

## 四、Pipeline

```go
pipe := rdb.Pipeline()
setCmd := pipe.Set(ctx, "key1", "val1", 0)
getCmd := pipe.Get(ctx, "key2")
_, err := pipe.Exec(ctx)

fmt.Println(setCmd.Val())
fmt.Println(getCmd.Val())
```

## 五、Lua 脚本

```go
var luaScript = redis.NewScript(`
local current = redis.call('GET', KEYS[1])
if current == ARGV[1] then
    redis.call('SET', KEYS[1], ARGV[2])
    return 1
end
return 0
`)

result, _ := luaScript.Run(ctx, rdb, []string{"key"}, "old", "new").Int()
```

## 六、分布式锁

```go
func acquireLock(ctx context.Context, rdb *redis.Client, key string, ttl time.Duration) (bool, error) {
    return rdb.SetNX(ctx, key, "locked", ttl).Result()
}

func releaseLock(ctx context.Context, rdb *redis.Client, key string) error {
    script := redis.NewScript(`
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        end
        return 0
    `)
    _, err := script.Run(ctx, rdb, []string{key}, "locked").Result()
    return err
}
```

## 七、发布订阅

```go
sub := rdb.Subscribe(ctx, "channel1", "channel2")
ch := sub.Channel()
for msg := range ch {
    fmt.Println(msg.Channel, msg.Payload)
}

rdb.Publish(ctx, "channel1", "hello")
```
