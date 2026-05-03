# embed 嵌入文件

Go 1.16 引入 `embed` 包，支持在编译时将文件嵌入到二进制文件中。

---

## 一、基本用法

### 1.1 嵌入单个文件

```go
import _ "embed"

//go:embed hello.txt
var content string

func main() {
    fmt.Println(content)
}
```

### 1.2 嵌入为 []byte

```go
//go:embed hello.txt
var content []byte
```

### 1.3 嵌入为 fs.FS

```go
import "embed"

//go:embed images/*
var images embed.FS

func main() {
    data, _ := images.ReadFile("images/logo.png")
}
```

---

## 二、embed.FS

### 2.1 FS 接口

```go
type FS interface {
    Open(name string) (File, error)
    ReadDir(name string) ([]DirEntry, error)
    ReadFile(name string) ([]byte, error)
}
```

### 2.2 遍历目录

```go
//go:embed static/*
var static embed.FS

func main() {
    entries, _ := static.ReadDir("static")
    for _, entry := range entries {
        fmt.Println(entry.Name())
    }
}
```

### 2.3 与 http.FileSystem 集成

```go
//go:embed static/*
var static embed.FS

func main() {
    http.Handle("/static/", http.FileServer(http.FS(static)))
    http.ListenAndServe(":8080", nil)
}
```

---

## 三、嵌入规则

### 3.1 指令格式

```go
//go:embed pattern1 pattern2 ...
```

### 3.2 模式匹配

```go
//go:embed hello.txt
//go:embed *.txt
//go:embed config/*.yaml
//go:embed images/**
```

- `*` 匹配任意非分隔符字符
- `**` 匹配任意字符包括分隔符
- 使用 `/` 作为路径分隔符

### 3.3 隐藏文件

```go
//go:embed .hidden
//go:embed .* 
```

- 以 `.` 开头的文件默认被忽略
- 需要显式指定才能嵌入

### 3.4 排除文件

```go
//go:embed images/*
//go:embed images/.gitkeep
```

---

## 四、实际应用

### 4.1 嵌入模板

```go
//go:embed templates/*.html
var templates embed.FS

func main() {
    t := template.Must(template.ParseFS(templates, "templates/*.html"))
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        t.ExecuteTemplate(w, "index.html", nil)
    })
}
```

### 4.2 嵌入配置

```go
//go:embed config.yaml
var defaultConfig []byte

func loadConfig() (*Config, error) {
    var cfg Config
    if err := yaml.Unmarshal(defaultConfig, &cfg); err != nil {
        return nil, err
    }
    return &cfg, nil
}
```

### 4.3 嵌入静态资源

```go
//go:embed static/*
var static embed.FS

func main() {
    mux := http.NewServeMux()
    mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.FS(static))))
    mux.HandleFunc("/", indexHandler)
    http.ListenAndServe(":8080", mux)
}
```

### 4.4 嵌入迁移脚本

```go
//go:embed migrations/*.sql
var migrations embed.FS

func runMigrations(db *sql.DB) error {
    entries, _ := migrations.ReadDir("migrations")
    for _, entry := range entries {
        content, _ := migrations.ReadFile("migrations/" + entry.Name())
        if _, err := db.Exec(string(content)); err != nil {
            return err
        }
    }
    return nil
}
```

---

## 五、注意事项

1. **编译时嵌入**：文件在编译时打包，运行时不依赖原文件
2. **二进制大小**：嵌入文件会增加二进制大小
3. **不可修改**：嵌入的内容是只读的
4. **相对路径**：`//go:embed` 路径相对于源文件所在目录
5. **构建约束**：被忽略的文件不会嵌入

```go
//go:build ignore
// +build ignore
```
