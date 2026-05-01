# make 与 new

## 一、指针

### 1.1 指针基础

```go
a := 10
b := &a
fmt.Printf("a的地址: %p\n", &a)
fmt.Printf("b的值(即a的地址): %p\n", b)
fmt.Printf("b指向的值: %d\n", *b)

*b = 20
fmt.Println(a)
```

- `&` 取地址
- `*` 根据地址取值（解引用）
- 指针默认值为 `nil`

### 1.2 指针类型

```go
var p1 *int
var p2 *string
var p3 *float64

fmt.Println(p1)
fmt.Println(p2)
fmt.Println(p3)
```

### 1.3 指针传值

```go
func modify1(x int) {
    x = 100
}

func modify2(x *int) {
    *x = 100
}

func main() {
    a := 10
    modify1(a)
    fmt.Println(a)

    modify2(&a)
    fmt.Println(a)
}
```

- 值传递：函数内修改不影响外部
- 指针传递：函数内修改会影响外部
- Go 只有值传递，指针传递本质也是值传递（传递的是地址值）

### 1.4 指针使用场景

```go
// 1. 修改函数外部变量
func swap(a, b *int) {
    *a, *b = *b, *a
}

// 2. 避免大结构体拷贝
type BigStruct struct {
    Data [1024]byte
}

func process(s *BigStruct) {
    // 使用指针避免拷贝 1KB 数据
}

// 3. 实现修改接收者
func (s *Student) SetName(name string) {
    s.Name = name
}
```

## 二、new

```go
p := new(int)
fmt.Println(*p)
*p = 100
fmt.Println(*p)

type Student struct {
    Name string
    Age  int
}
s := new(Student)
s.Name = "Go"
s.Age = 18
```

- `new(Type)` 分配内存，返回 `*Type` 指针
- 分配的内存被初始化为零值
- 不常用，通常使用 `&Type{}` 语法

## 三、make

```go
s := make([]int, 0, 10)
m := make(map[string]int, 10)
ch := make(chan int, 5)
```

- `make` 仅用于 slice/map/channel
- 返回初始化后的值（不是指针）
- slice/map/channel 必须用 make 初始化后才能使用

## 四、make 与 new 对比

| 特性 | make | new |
|------|------|-----|
| 适用类型 | slice/map/channel | 任意类型 |
| 返回值 | 初始化后的值 | 指针 `*T` |
| 初始化 | 是（零值+内部结构） | 仅零值 |
| 内存分配 | 堆 | 堆 |
| 常用程度 | 常用 | 不常用 |

```go
var s1 []int
fmt.Println(s1 == nil)

s2 := new([]int)
fmt.Println(s2 == nil)
fmt.Println(*s2 == nil)

s3 := make([]int, 0)
fmt.Println(s3 == nil)
```
