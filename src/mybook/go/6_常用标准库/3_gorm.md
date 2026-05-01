# GORM

## 一、安装

```bash
go get gorm.io/gorm
go get gorm.io/driver/mysql
```

## 二、连接

```go
dsn := "user:password@tcp(127.0.0.1:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local"
db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
if err != nil {
    panic(err)
}

sqlDB, _ := db.DB()
sqlDB.SetMaxOpenConns(100)
sqlDB.SetMaxIdleConns(10)
sqlDB.SetConnMaxLifetime(time.Hour)
```

## 三、模型定义

```go
type User struct {
    ID        uint           `gorm:"primarykey"`
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt `gorm:"index"`
    Name      string         `gorm:"type:varchar(100);not null;index"`
    Age       int            `gorm:"default:18"`
    Email     string         `gorm:"type:varchar(100);uniqueIndex"`
    Role      string         `gorm:"size:50;default:user"`
}
```

## 四、自动迁移

```go
db.AutoMigrate(&User{}, &Product{}, &Order{})
```

## 五、CRUD

### 5.1 创建

```go
user := User{Name: "Go", Age: 18, Email: "go@example.com"}
result := db.Create(&user)
fmt.Println(result.RowsAffected)

users := []User{
    {Name: "A", Age: 20},
    {Name: "B", Age: 25},
}
db.Create(&users)

db.CreateInBatches(users, 100)
```

### 5.2 查询

```go
var user User
db.First(&user, 1)
db.First(&user, "name = ?", "Go")

var users []User
db.Find(&users)
db.Where("age > ?", 18).Find(&users)
db.Where("name IN ?", []string{"Go", "Python"}).Find(&users)
db.Where("age BETWEEN ? AND ?", 18, 30).Find(&users)
db.Where("name LIKE ?", "%go%").Find(&users)

db.Not("name = ?", "Go").Find(&users)
db.Or("role = ?", "admin").Find(&users)

db.Select("name, age").Find(&users)
db.Order("age desc").Find(&users)
db.Limit(10).Offset(0).Find(&users)
db.Group("role").Having("count(*) > ?", 1).Find(&results)
db.Distinct("role").Find(&users)
```

### 5.3 更新

```go
db.Model(&user).Update("name", "NewName")
db.Model(&user).Updates(User{Name: "NewName", Age: 20})
db.Model(&user).Updates(map[string]interface{}{"name": "NewName", "age": 20})

db.Model(&User{}).Where("age < ?", 18).Update("role", "minor")
```

### 5.4 删除

```go
db.Delete(&user)
db.Delete(&User{}, 1)
db.Where("name = ?", "Go").Delete(&User{})
db.Unscoped().Delete(&user)
```

## 六、关联

```go
type User struct {
    ID    uint
    Name  string
    Cards []Card `gorm:"foreignKey:UserID"`
}

type Card struct {
    ID     uint
    Number string
    UserID uint
}

db.Preload("Cards").Find(&users)
db.Joins("Cards").Find(&users)
```

## 七、事务

```go
db.Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&User{Name: "A"}).Error; err != nil {
        return err
    }
    if err := tx.Create(&User{Name: "B"}).Error; err != nil {
        return err
    }
    return nil
})
```

## 八、GORM Gen（类型安全）

```bash
go get gorm.io/gen
```

```go
g := gen.NewGenerator(gen.Config{
    OutPath: "./dal/query",
    Mode:    gen.WithoutContext,
})

g.UseDB(db)
g.ApplyBasic(model.User{})
g.ApplyInterface(func(method) {}, model.User{})
g.Execute()
```

- Gen 生成类型安全的查询代码
- 编译时检查 SQL 错误
- 替代字符串拼接的查询方式
