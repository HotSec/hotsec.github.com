# Go 操作 MongoDB

## 一、安装

```bash
go get go.mongodb.org/mongo-driver/v2/mongo
```

## 二、连接

```go
client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
if err != nil {
    panic(err)
}
defer client.Disconnect(context.Background())

err = client.Ping(context.Background(), nil)
if err != nil {
    panic(err)
}

db := client.Database("testdb")
col := db.Collection("users")
```

## 三、CRUD

### 3.1 插入

```go
type User struct {
    Name string `bson:"name"`
    Age  int    `bson:"age"`
}

result, _ := col.InsertOne(ctx, User{Name: "Go", Age: 18})
fmt.Println(result.InsertedID)

users := []interface{}{
    User{Name: "Python", Age: 20},
    User{Name: "Java", Age: 25},
}
results, _ := col.InsertMany(ctx, users)
```

### 3.2 查询

```go
var user User
err := col.FindOne(ctx, bson.M{"name": "Go"}).Decode(&user)

cursor, err := col.Find(ctx, bson.M{"age": bson.M{"$gte": 18}})
defer cursor.Close(ctx)
for cursor.Next(ctx) {
    var u User
    cursor.Decode(&u)
    fmt.Println(u)
}

cursor, err := col.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{"age", -1}}).SetLimit(10))
```

### 3.3 更新

```go
result, _ := col.UpdateOne(ctx,
    bson.M{"name": "Go"},
    bson.M{"$set": bson.M{"age": 19}},
)

result, _ := col.UpdateMany(ctx,
    bson.M{"age": bson.M{"$lt": 18}},
    bson.M{"$set": bson.M{"status": "minor"}},
)

result, _ := col.ReplaceOne(ctx,
    bson.M{"name": "Go"},
    User{Name: "Go", Age: 20},
)
```

### 3.4 删除

```go
result, _ := col.DeleteOne(ctx, bson.M{"name": "Go"})
result, _ := col.DeleteMany(ctx, bson.M{"age": bson.M{"$lt": 18}})
col.Drop(ctx)
```

## 四、聚合管道

```go
pipeline := mongo.Pipeline{
    {{"$match", bson.D{{"status", "active"}}}},
    {{"$group", bson.D{
        {"_id", "$category"},
        {"count", bson.D{{"$sum", 1}}},
        {"avgAge", bson.D{{"$avg", "$age"}}},
    }}},
    {{"$sort", bson.D{{"count", -1}}}},
    {{"$limit", 10}},
}

cursor, _ := col.Aggregate(ctx, pipeline)
defer cursor.Close(ctx)
for cursor.Next(ctx) {
    var result bson.M
    cursor.Decode(&result)
    fmt.Println(result)
}
```

## 五、索引

```go
col.Indexes().CreateOne(ctx, mongo.IndexModel{
    Keys: bson.D{{"name", 1}},
})

col.Indexes().CreateOne(ctx, mongo.IndexModel{
    Keys:    bson.D{{"email", 1}},
    Options: options.Index().SetUnique(true),
})

col.Indexes().CreateMany(ctx, []mongo.IndexModel{
    {Keys: bson.D{{"name", 1}}},
    {Keys: bson.D{{"age", -1}, {"status", 1}}},
})
```
