# sqlx 数据库操作

## 一、安装

```bash
go get github.com/jmoiron/sqlx
```

## 二、连接数据库

```go
db, err := sqlx.Connect("mysql", "user:password@tcp(127.0.0.1:3306)/test?charset=utf8mb4&parseTime=True&loc=Local")
if err != nil {
    panic(err)
}
defer db.Close()

db.SetMaxOpenConns(100)
db.SetMaxIdleConns(10)
db.SetConnMaxLifetime(time.Hour)
```

## 三、查询

### 3.1 查询单行

```go
var user User
err := db.Get(&user, "SELECT id, name, age FROM users WHERE id = ?", 1)

err := db.QueryRowx("SELECT id, name, age FROM users WHERE id = ?", 1).StructScan(&user)
```

### 3.2 查询多行

```go
var users []User
err := db.Select(&users, "SELECT id, name, age FROM users WHERE age > ?", 18)
```

### 3.3 原始查询

```go
rows, err := db.Queryx("SELECT id, name FROM users")
for rows.Next() {
    var u User
    rows.StructScan(&u)
}

rows, err := db.Queryx("SELECT id, name FROM users")
for rows.Next() {
    results := make(map[string]interface{})
    rows.MapScan(results)
}
```

## 四、增删改

```go
result, err := db.Exec("INSERT INTO users (name, age) VALUES (?, ?)", "Go", 18)
id, _ := result.LastInsertId()
affected, _ := result.RowsAffected()

result, err := db.Exec("UPDATE users SET name = ? WHERE id = ?", "NewName", 1)
affected, _ := result.RowsAffected()

result, err := db.Exec("DELETE FROM users WHERE id = ?", 1)
affected, _ := result.RowsAffected()
```

### 4.1 Named Exec

```go
type User struct {
    Name string `db:"name"`
    Age  int    `db:"age"`
}

user := User{Name: "Go", Age: 18}
result, err := db.NamedExec("INSERT INTO users (name, age) VALUES (:name, :age)", user)
```

### 4.2 批量插入

```go
users := []User{
    {Name: "Go", Age: 18},
    {Name: "Python", Age: 20},
}

query, args, _ := sqlx.Named("INSERT INTO users (name, age) VALUES (:name, :age)", users)
query, args, _ = sqlx.In(query, args...)
query = db.Rebind(query)
db.Exec(query, args...)
```

## 五、事务

```go
tx, err := db.Beginx()
if err != nil {
    panic(err)
}

_, err = tx.Exec("UPDATE accounts SET balance = balance - ? WHERE id = ?", 100, 1)
if err != nil {
    tx.Rollback()
    return
}

_, err = tx.Exec("UPDATE accounts SET balance = balance + ? WHERE id = ?", 100, 2)
if err != nil {
    tx.Rollback()
    return
}

tx.Commit()
```

### 5.1 事务辅助函数

```go
err := sqlx.BeginTxFunc(ctx, db, nil, func(tx *sqlx.Tx) error {
    if _, err := tx.Exec("UPDATE accounts SET balance = balance - ? WHERE id = ?", 100, 1); err != nil {
        return err
    }
    if _, err := tx.Exec("UPDATE accounts SET balance = balance + ? WHERE id = ?", 100, 2); err != nil {
        return err
    }
    return nil
})
```

## 六、结构体映射

```go
type User struct {
    ID        int       `db:"id"`
    Name      string    `db:"name"`
    Age       int       `db:"age"`
    CreatedAt time.Time `db:"created_at"`
}
```

- 使用 `db` tag 映射数据库列名
- sqlx 自动扫描到结构体字段
