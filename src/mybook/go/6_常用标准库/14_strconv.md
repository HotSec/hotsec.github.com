# strconv 字符串转换

## 一、字符串与整数

```go
s := strconv.Itoa(100)
fmt.Printf("%T: %s\n", s, s)

n, err := strconv.Atoi("100")
fmt.Printf("%T: %d, err: %v\n", n, n, err)

n2, err := strconv.Atoi("abc")
fmt.Println(n2, err)
```

## 二、Parse 系列

```go
b, _ := strconv.ParseBool("true")
fmt.Println(b)

i, _ := strconv.ParseInt("100", 10, 64)
fmt.Println(i)

i2, _ := strconv.ParseInt("ff", 16, 64)
fmt.Println(i2)

u, _ := strconv.ParseUint("100", 10, 64)
fmt.Println(u)

f, _ := strconv.ParseFloat("3.14", 64)
fmt.Println(f)
```

| 函数 | 说明 |
|------|------|
| `ParseBool(str)` | "true"/"1" → true |
| `ParseInt(str, base, bitSize)` | 字符串→int64 |
| `ParseUint(str, base, bitSize)` | 字符串→uint64 |
| `ParseFloat(str, bitSize)` | 字符串→float64 |

## 三、Format 系列

```go
s1 := strconv.FormatBool(true)
fmt.Println(s1)

s2 := strconv.FormatInt(100, 10)
fmt.Println(s2)

s3 := strconv.FormatInt(255, 16)
fmt.Println(s3)

s4 := strconv.FormatUint(100, 10)
fmt.Println(s4)

s5 := strconv.FormatFloat(3.14, 'f', 2, 64)
fmt.Println(s5)
```

| 函数 | 说明 |
|------|------|
| `FormatBool(b)` | bool→字符串 |
| `FormatInt(i, base)` | int64→字符串（指定进制） |
| `FormatUint(i, base)` | uint64→字符串 |
| `FormatFloat(f, fmt, prec, bitSize)` | float64→字符串 |

### FormatFloat 的 fmt 参数

| 值 | 说明 |
|-----|------|
| `'b'` | 无小数部分，指数为 2 的幂 |
| `'e'` | 科学计数法（如 -1.234456e+78） |
| `'E'` | 科学计数法（如 -1.234456E+78） |
| `'f'` | 无指数（如 123.456） |
| `'g'` | 自动选择 %e 或 %f |
| `'G'` | 自动选择 %E 或 %f |
| `'x'` | 十六进制浮点数 |

## 四、Append 系列

```go
buf := make([]byte, 0, 128)
buf = strconv.AppendBool(buf, true)
buf = strconv.AppendInt(buf, 100, 10)
buf = strconv.AppendFloat(buf, 3.14, 'f', 2, 64)
fmt.Println(string(buf))
```

## 五、Quote 系列

```go
s := strconv.Quote(`hello "world"`)
fmt.Println(s)

s2 := strconv.QuoteToASCII("你好")
fmt.Println(s2)

s3, _ := strconv.Unquote(`"hello \"world\""`)
fmt.Println(s3)
```
