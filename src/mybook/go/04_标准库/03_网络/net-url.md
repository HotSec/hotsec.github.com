# net/url

`net/url` 包提供 URL 解析和构建功能。

---

## 一、URL 解析

### 1.1 url.Parse

```go
u, err := url.Parse("https://example.com/path?q=hello#section")
if err != nil {
    log.Fatal(err)
}

fmt.Println("Scheme:", u.Scheme)
fmt.Println("Host:", u.Host)
fmt.Println("Path:", u.Path)
fmt.Println("RawQuery:", u.RawQuery)
fmt.Println("Fragment:", u.Fragment)
```

### 1.2 URL 结构体

```go
type URL struct {
    Scheme      string
    Opaque      string
    User        *Userinfo
    Host        string
    Path        string
    RawPath     string
    ForceQuery  bool
    RawQuery    string
    Fragment    string
}
```

### 1.3 解析相对 URL

```go
base, _ := url.Parse("https://example.com/path/")
rel, _ := base.Parse("../other")
fmt.Println(rel.String())
```

---

## 二、Query 参数

### 2.1 解析 Query

```go
u, _ := url.Parse("https://example.com?name=Alice&age=30")
q := u.Query()
fmt.Println(q.Get("name"))
fmt.Println(q["age"])
```

### 2.2 url.Values

```go
v := url.Values{}
v.Set("name", "Alice")
v.Add("tag", "go")
v.Add("tag", "web")
v.Del("tag")

fmt.Println(v.Encode())
```

### 2.3 ParseQuery

```go
v, err := url.ParseQuery("name=Alice&age=30&tag=go&tag=web")
if err != nil {
    log.Fatal(err)
}
fmt.Println(v)
```

---

## 三、URL 构建

### 3.1 手动构建

```go
u := &url.URL{
    Scheme:   "https",
    Host:     "example.com",
    Path:     "/api/users",
    RawQuery: "page=1&size=10",
}
fmt.Println(u.String())
```

### 3.2 使用 Values 构建

```go
u := &url.URL{
    Scheme: "https",
    Host:   "example.com",
    Path:   "/api/users",
}

q := u.Query()
q.Set("page", "1")
q.Set("size", "10")
u.RawQuery = q.Encode()

fmt.Println(u.String())
```

---

## 四、用户信息

### 4.1 解析用户信息

```go
u, _ := url.Parse("https://user:pass@example.com")
if u.User != nil {
    fmt.Println("Username:", u.User.Username())
    password, ok := u.User.Password()
    fmt.Println("Password:", password, ok)
}
```

### 4.2 设置用户信息

```go
u := &url.URL{
    Scheme: "https",
    Host:   "example.com",
}
u.User = url.UserPassword("user", "pass")
```

---

## 五、路径处理

### 5.1 PathEscape / PathUnescape

```go
escaped := url.PathEscape("path with spaces")
fmt.Println(escaped)

unescaped, _ := url.PathUnescape(escaped)
fmt.Println(unescaped)
```

### 5.2 QueryEscape / QueryUnescape

```go
escaped := url.QueryEscape("hello world")
fmt.Println(escaped)

unescaped, _ := url.QueryUnescape(escaped)
fmt.Println(unescaped)
```

---

## 六、实际应用

### 6.1 HTTP 请求 URL 构建

```go
func buildURL(baseURL string, params map[string]string) (string, error) {
    u, err := url.Parse(baseURL)
    if err != nil {
        return "", err
    }

    q := u.Query()
    for k, v := range params {
        q.Set(k, v)
    }
    u.RawQuery = q.Encode()

    return u.String(), nil
}

url, _ := buildURL("https://api.example.com/search", map[string]string{
    "q":    "golang",
    "page": "1",
})
```

### 6.2 解析请求 URL

```go
func handler(w http.ResponseWriter, r *http.Request) {
    u, _ := url.Parse(r.URL.String())
    q := u.Query()

    name := q.Get("name")
    page := q.Get("page")

    fmt.Fprintf(w, "Name: %s, Page: %s", name, page)
}
```
