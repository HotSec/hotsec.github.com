# reflect 反射

## 一、Type 与 Value

```go
var x float64 = 3.14

fmt.Println("type:", reflect.TypeOf(x))
fmt.Println("value:", reflect.ValueOf(x))

v := reflect.ValueOf(x)
fmt.Println("kind:", v.Kind())
fmt.Println("float:", v.Float())
```

- `reflect.TypeOf()` 返回 `reflect.Type`
- `reflect.ValueOf()` 返回 `reflect.Value`
- `Type` 关注类型信息，`Value` 关注值信息

## 二、Kind 类型

```go
type MyInt int

var a MyInt = 100
fmt.Println(reflect.TypeOf(a).Kind())
fmt.Println(reflect.TypeOf(a).Name())
```

| Kind | 说明 |
|------|------|
| `Bool` | 布尔 |
| `Int`/`Int8`...`Int64` | 有符号整数 |
| `Uint`/`Uint8`...`Uint64` | 无符号整数 |
| `Float32`/`Float64` | 浮点数 |
| `String` | 字符串 |
| `Array` | 数组 |
| `Slice` | 切片 |
| `Map` | 映射 |
| `Struct` | 结构体 |
| `Ptr` | 指针 |
| `Func` | 函数 |
| `Interface` | 接口 |
| `Chan` | 通道 |

## 三、结构体反射

### 3.1 字段遍历

```go
type Student struct {
    Name string `json:"name" validate:"required"`
    Age  int    `json:"age" validate:"min=0"`
}

t := reflect.TypeOf(Student{})
for i := 0; i < t.NumField(); i++ {
    field := t.Field(i)
    fmt.Printf("Name: %s, Type: %s, Tag: %s\n",
        field.Name, field.Type, field.Tag.Get("json"))
}

v := reflect.ValueOf(Student{Name: "Go", Age: 18})
for i := 0; i < v.NumField(); i++ {
    field := v.Field(i)
    fmt.Printf("Field %d: %v\n", i, field.Interface())
}
```

### 3.2 方法遍历

```go
t := reflect.TypeOf(Student{})
for i := 0; i < t.NumMethod(); i++ {
    method := t.Method(i)
    fmt.Printf("Method: %s, Type: %s\n", method.Name, method.Type)
}
```

## 四、修改值

```go
var x float64 = 3.14
v := reflect.ValueOf(&x)
v.Elem().SetFloat(6.28)
fmt.Println(x)
```

- 必须传指针才能修改
- `Elem()` 获取指针指向的值
- `CanSet()` 判断是否可修改

```go
v := reflect.ValueOf(&x).Elem()
if v.CanSet() {
    v.SetFloat(6.28)
}
```

## 五、动态调用方法

```go
type Calculator struct{}

func (c Calculator) Add(a, b int) int {
    return a + b
}

c := Calculator{}
v := reflect.ValueOf(c)
method := v.MethodByName("Add")
args := []reflect.Value{
    reflect.ValueOf(10),
    reflect.ValueOf(20),
}
results := method.Call(args)
fmt.Println(results[0].Int())
```

## 六、应用场景

- **ORM 框架**：根据结构体 Tag 生成 SQL
- **配置解析**：根据 Tag 映射配置字段
- **验证框架**：根据 Tag 进行参数校验
- **序列化框架**：根据 Tag 自定义序列化规则
- **依赖注入**：根据类型自动注入依赖

## 七、反射注意事项

- 反射比直接调用慢 10-100 倍
- 反射绕过了编译时类型检查
- 大量使用反射使代码难以理解和维护
- 能不用反射就不用，必要时再使用
