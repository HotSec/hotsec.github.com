# fmt 格式化输出

## 一、Printf 占位符

### 1.1 通用占位符

| 占位符 | 说明 |
|--------|------|
| `%v` | 值的默认格式 |
| `%+v` | 类似 %v，但输出结构体时添加字段名 |
| `%#v` | Go 语法表示 |
| `%T` | 类型的 Go 语法表示 |
| `%%` | 百分号 |

```go
type Student struct {
    Name string
    Age  int
}
s := Student{"Go", 18}
fmt.Printf("%v\n", s)
fmt.Printf("%+v\n", s)
fmt.Printf("%#v\n", s)
fmt.Printf("%T\n", s)
```

### 1.2 整数

| 占位符 | 说明 |
|--------|------|
| `%b` | 二进制 |
| `%c` | 对应 Unicode 字符 |
| `%d` | 十进制 |
| `%o` | 八进制 |
| `%O` | 八进制（0o 前缀） |
| `%x` | 十六进制（小写） |
| `%X` | 十六进制（大写） |
| `%U` | Unicode 格式 U+xxxx |
| `%q` | 单引号包围的字符字面量 |

```go
fmt.Printf("%b\n", 10)
fmt.Printf("%c\n", 65)
fmt.Printf("%d\n", 10)
fmt.Printf("%o\n", 10)
fmt.Printf("%x\n", 255)
fmt.Printf("%U\n", '中')
```

### 1.3 浮点数与复数

| 占位符 | 说明 |
|--------|------|
| `%f` | 十进制小数（默认 6 位） |
| `%.2f` | 保留 2 位小数 |
| `%e` | 科学计数法（小写 e） |
| `%E` | 科学计数法（大写 E） |
| `%g` | 自动选择 %e 或 %f |

```go
fmt.Printf("%f\n", 3.1415926535)
fmt.Printf("%.2f\n", 3.1415926535)
fmt.Printf("%e\n", 31415926535.0)
fmt.Printf("%g\n", 3.1415926535)
```

### 1.4 字符串与字节

| 占位符 | 说明 |
|--------|------|
| `%s` | 字符串 |
| `%q` | 双引号包围的字符串 |
| `%x` | 十六进制字符串（小写） |
| `%X` | 十六进制字符串（大写） |

```go
fmt.Printf("%s\n", "hello")
fmt.Printf("%q\n", "hello")
fmt.Printf("%x\n", "hello")
```

### 1.5 宽度与精度

| 语法 | 说明 |
|------|------|
| `%5d` | 宽度 5，右对齐 |
| `%-5d` | 宽度 5，左对齐 |
| `%05d` | 宽度 5，前导零 |
| `%.2f` | 精度 2 位小数 |
| `%8.2f` | 宽度 8，精度 2 |

```go
fmt.Printf("|%5d|\n", 12)
fmt.Printf("|%-5d|\n", 12)
fmt.Printf("|%05d|\n", 12)
fmt.Printf("|%8.2f|\n", 3.14)
```

## 二、常用函数

```go
fmt.Println("hello", "world")
fmt.Printf("name: %s, age: %d\n", "Go", 18)

s := fmt.Sprintf("name: %s, age: %d", "Go", 18)

var name string
var age int
fmt.Sscanf("Go 18", "%s %d", &name, &age)

fmt.Fprintf(os.Stdout, "hello %s\n", "world")
```

| 函数 | 输出到 | 换行 |
|------|--------|------|
| `Print` | stdout | 否 |
| `Println` | stdout | 是 |
| `Printf` | stdout | 否 |
| `Sprint` | 字符串 | 否 |
| `Sprintf` | 字符串 | 否 |
| `Fprint` | io.Writer | 否 |
| `Fprintf` | io.Writer | 否 |
