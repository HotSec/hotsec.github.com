# io 与 bufio

Go 的 `io` 包定义了核心 I/O 接口，`bufio` 包提供带缓冲的 I/O 操作。

---

## 一、io 核心接口

### 1.1 io.Reader

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}
```

- 从数据源读取数据到 `p`
- 返回读取的字节数和错误
- `io.EOF` 表示读取结束

### 1.2 io.Writer

```go
type Writer interface {
    Write(p []byte) (n int, err error)
}
```

- 将 `p` 中的数据写入目标
- 返回写入的字节数和错误

### 1.3 io.Closer

```go
type Closer interface {
    Close() error
}
```

### 1.4 组合接口

```go
type ReadCloser interface {
    Reader
    Closer
}

type WriteCloser interface {
    Writer
    Closer
}

type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}
```

---

## 二、io 常用函数

### 2.1 Copy

```go
n, err := io.Copy(dst, src)
```

- 从 src 复制到 dst
- 返回复制的字节数

### 2.2 CopyN

```go
n, err := io.CopyN(dst, src, n)
```

- 复制 n 个字节

### 2.3 ReadAll

```go
data, err := io.ReadAll(r)
```

- 读取所有数据

### 2.4 LimitReader

```go
r := io.LimitReader(src, 1024)
```

- 限制最多读取 1024 字节

### 2.5 TeeReader

```go
r := io.TeeReader(src, dst)
```

- 读取时同时写入 dst

### 2.6 MultiReader / MultiWriter

```go
r := io.MultiReader(r1, r2, r3)
w := io.MultiWriter(w1, w2, w3)
```

- 合并多个 Reader/Writer

### 2.7 Pipe

```go
r, w := io.Pipe()
```

- 创建同步管道
- 写入阻塞直到读取

---

## 三、bufio 缓冲读写

### 3.1 bufio.Reader

```go
r := bufio.NewReader(src)

line, err := r.ReadString('\n')
line, isPrefix, err := r.ReadLine()
b, err := r.ReadByte()
b, err := r.Peek(1)

s, err := r.ReadBytes('\n')
```

- 带缓冲的读取
- 默认缓冲区 4KB

### 3.2 bufio.Writer

```go
w := bufio.NewWriter(dst)

w.WriteString("hello")
w.WriteByte('a')
w.WriteRune('中')

w.Flush()
```

- 带缓冲的写入
- 必须调用 `Flush` 确保写入

### 3.3 bufio.Scanner

```go
scanner := bufio.NewScanner(r)
for scanner.Scan() {
    fmt.Println(scanner.Text())
}
if err := scanner.Err(); err != nil {
    log.Fatal(err)
}
```

- 按行或自定义分隔符扫描
- 适合处理大文件

自定义分隔符：

```go
scanner := bufio.NewScanner(r)
scanner.Split(bufio.ScanWords)
```

---

## 四、strings 和 bytes 包

### 4.1 strings.Reader

```go
r := strings.NewReader("hello world")
io.Copy(dst, r)
```

### 4.2 bytes.Buffer

```go
var buf bytes.Buffer
buf.WriteString("hello")
buf.Write([]byte(" world"))
s := buf.String()
```

### 4.3 bytes.Reader

```go
r := bytes.NewReader([]byte("hello"))
```

---

## 五、实际应用

### 5.1 文件复制

```go
func copyFile(src, dst string) error {
    in, err := os.Open(src)
    if err != nil {
        return err
    }
    defer in.Close()

    out, err := os.Create(dst)
    if err != nil {
        return err
    }
    defer out.Close()

    _, err = io.Copy(out, in)
    return err
}
```

### 5.2 逐行读取文件

```go
func readLines(path string) ([]string, error) {
    f, err := os.Open(path)
    if err != nil {
        return nil, err
    }
    defer f.Close()

    var lines []string
    scanner := bufio.NewScanner(f)
    for scanner.Scan() {
        lines = append(lines, scanner.Text())
    }
    return lines, scanner.Err()
}
```

### 5.3 写入文件

```go
func writeLines(path string, lines []string) error {
    f, err := os.Create(path)
    if err != nil {
        return err
    }
    defer f.Close()

    w := bufio.NewWriter(f)
    for _, line := range lines {
        w.WriteString(line)
        w.WriteByte('\n')
    }
    return w.Flush()
}
```
