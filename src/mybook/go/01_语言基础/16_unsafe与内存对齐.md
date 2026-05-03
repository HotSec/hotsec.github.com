# unsafe 与内存对齐

`unsafe` 包提供了绕过 Go 类型安全检查的能力，用于底层编程。使用时需要格外小心。

---

## 一、unsafe 包概述

### 1.1 核心类型和函数

```go
type ArbitraryType int
type Pointer *ArbitraryType

func Sizeof(x ArbitraryType) uintptr
func Offsetof(x ArbitraryType) uintptr
func Alignof(x ArbitraryType) uintptr
```

### 1.2 unsafe.Pointer 四大规则

1. 任何类型的指针都可以转换为 `unsafe.Pointer`
2. `unsafe.Pointer` 可以转换为任何类型的指针
3. `uintptr` 可以转换为 `unsafe.Pointer`
4. `unsafe.Pointer` 可以转换为 `uintptr`

```go
var i int = 42

p := unsafe.Pointer(&i)

pi := (*int)(p)
fmt.Println(*pi)

u := uintptr(p)
p2 := unsafe.Pointer(u)
```

---

## 二、unsafe.Sizeof / Offsetof / Alignof

### 2.1 Sizeof

```go
fmt.Println(unsafe.Sizeof(int(0)))
fmt.Println(unsafe.Sizeof(""))
fmt.Println(unsafe.Sizeof(struct{}{}))
```

### 2.2 Offsetof

```go
type User struct {
    Name string
    Age  int
}

fmt.Println(unsafe.Offsetof(User{}.Name))
fmt.Println(unsafe.Offsetof(User{}.Age))
```

### 2.3 Alignof

```go
fmt.Println(unsafe.Alignof(int(0)))
fmt.Println(unsafe.Alignof(""))
fmt.Println(unsafe.Alignof(User{}))
```

---

## 三、unsafe 常见用法

### 3.1 string 与 []byte 零拷贝转换

```go
func StringToBytes(s string) []byte {
    return unsafe.Slice(unsafe.StringData(s), len(s))
}

func BytesToString(b []byte) string {
    return unsafe.String(&b[0], len(b))
}
```

⚠️ 注意：
- 只读场景使用
- 修改转换后的 []byte 会导致原 string 被修改（危险）

### 3.2 访问结构体私有字段

```go
type Secret struct {
    hidden string
}

func getHidden(s *Secret) string {
    ptr := unsafe.Pointer(s)
    fieldPtr := (*string)(unsafe.Pointer(uintptr(ptr) + unsafe.Offsetof(Secret{}.hidden)))
    return *fieldPtr
}
```

### 3.3 判断大小端

```go
func IsLittleEndian() bool {
    var i int32 = 0x01020304
    b := (*[4]byte)(unsafe.Pointer(&i))
    return b[0] == 0x04
}
```

---

## 四、内存对齐

### 4.1 对齐规则

1. 变量地址必须是其对齐系数的整数倍
2. 结构体对齐系数 = 所有字段对齐系数的最大值
3. 结构体大小必须是对齐系数的整数倍

### 4.2 各类型对齐系数（64位系统）

| 类型 | 大小 | 对齐系数 |
|------|------|---------|
| bool, int8, uint8 | 1 | 1 |
| int16, uint16 | 2 | 2 |
| int32, uint32, float32 | 4 | 4 |
| int64, uint64, float64 | 8 | 8 |
| int, uint, pointer | 8 | 8 |
| string | 16 | 8 |
| slice | 24 | 8 |

### 4.3 字段顺序影响大小

```go
type Bad struct {
    a bool
    b int64
    c int8
}

type Good struct {
    b int64
    a bool
    c int8
}

fmt.Println(unsafe.Sizeof(Bad{}))
fmt.Println(unsafe.Sizeof(Good{}))
```

内存布局：

```
Bad (24 bytes):
┌───┬───────────┬───┬───────────┐
│ a │  padding   │ b │ c │ pad   │
│ 1 │    7      │ 8 │ 1 │ 7     │
└───┴───────────┴───┴───────────┘

Good (16 bytes):
┌───────────┬───┬───┬───────────┐
│     b     │ a │ c │  padding   │
│     8     │ 1 │ 1 │    6      │
└───────────┴───┴───┴───────────┘
```

### 4.4 对齐优化技巧

```go
type Optimized struct {
    d float64
    e int64
    f int32
    g int16
    h int8
    i bool
}
```

- 大字段放前面，小字段放后面
- 减少中间 padding

---

## 五、atomic 与对齐

### 5.1 32位系统的陷阱

```go
type Counter struct {
    Flag bool
    Count int64
}

var c Counter
atomic.AddInt64(&c.Count, 1)
```

- 32位系统上 `int64` 需要 8 字节对齐
- `Flag` 在前，`Count` 可能不是 8 字节对齐
- `atomic.AddInt64` 会 panic

### 5.2 解决方案

```go
type Counter struct {
    Count int64
    Flag  bool
}

type Counter struct {
    Flag  bool
    Count atomic.Int64
}
```

---

## 六、unsafe 使用原则

1. **避免使用**：除非有明确的性能需求
2. **文档注释**：说明为什么需要 unsafe
3. **隔离代码**：将 unsafe 代码封装在独立函数中
4. **测试覆盖**：确保 unsafe 代码有充分测试
5. **版本兼容**：unsafe 代码可能随 Go 版本变化

```go
func unsafeOperation() (result T) {
    return result
}
```
