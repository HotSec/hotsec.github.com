# HTTP 标准库

## 一、Server 端

### 1.1 基本服务

```go
func main() {
    http.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("pong"))
    })

    http.ListenAndServe(":8080", nil)
}
```

### 1.2 自定义 ServeMux（路由）

```go
mux := http.NewServeMux()

mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "home")
})

mux.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "users")
})

http.ListenAndServe(":8080", mux)
```

- Go 1.22 增强了路由匹配：支持方法+路径 `GET /api/users`
- `http.DefaultServeMux` 是默认路由器

### 1.3 请求信息

```go
func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Println("Method:", r.Method)
    fmt.Println("URL:", r.URL.String())
    fmt.Println("Host:", r.Host)
    fmt.Println("RemoteAddr:", r.RemoteAddr)
    fmt.Println("Header:", r.Header.Get("Content-Type"))
    fmt.Println("Cookie:", r.Cookies())

    r.ParseForm()
    fmt.Println("Query:", r.URL.Query())
    fmt.Println("Form:", r.Form)
    fmt.Println("PostForm:", r.PostForm)
}
```

### 1.4 响应

```go
func handler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"msg": "hello"})

    http.Redirect(w, r, "/new", http.StatusFound)
    http.Error(w, "bad request", http.StatusBadRequest)
}
```

### 1.5 中间件模式

```go
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        fmt.Printf("%s %s %v\n", r.Method, r.URL.Path, time.Since(start))
    })
}

func authMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := r.Header.Get("Authorization")
        if token == "" {
            http.Error(w, "unauthorized", http.StatusUnauthorized)
            return
        }
        next.ServeHTTP(w, r)
    })
}

mux := http.NewServeMux()
mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "hello")
})

handler := loggingMiddleware(authMiddleware(mux))
http.ListenAndServe(":8080", handler)
```

### 1.6 文件服务

```go
http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

http.HandleFunc("/download", func(w http.ResponseWriter, r *http.Request) {
    http.ServeFile(w, r, "files/report.pdf")
})
```

### 1.7 优雅关闭

```go
srv := &http.Server{Addr: ":8080", Handler: mux}

go func() {
    if err := srv.ListenAndServe(); err != http.ErrServerClosed {
        log.Fatal(err)
    }
}()

quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
<-quit

ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
srv.Shutdown(ctx)
```

## 二、Client 端

### 2.1 GET 请求

```go
resp, err := http.Get("http://httpbin.org/get")
if err != nil {
    panic(err)
}
defer resp.Body.Close()

body, _ := io.ReadAll(resp.Body)
fmt.Println(string(body))
```

### 2.2 POST 请求

```go
reqBody, _ := json.Marshal(map[string]string{"key": "value"})
resp, _ := http.Post("http://httpbin.org/post", "application/json", bytes.NewReader(reqBody))
defer resp.Body.Close()

body, _ := io.ReadAll(resp.Body)
fmt.Println(string(body))
```

### 2.3 自定义请求

```go
req, _ := http.NewRequest("PUT", "http://httpbin.org/put", bytes.NewReader(reqBody))
req.Header.Set("Content-Type", "application/json")
req.Header.Set("Authorization", "Bearer token")

ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
req = req.WithContext(ctx)

client := &http.Client{Timeout: 10 * time.Second}
resp, _ := client.Do(req)
defer resp.Body.Close()
```

### 2.4 处理响应

```go
fmt.Println("Status:", resp.StatusCode)
fmt.Println("Headers:", resp.Header)

var result map[string]interface{}
json.NewDecoder(resp.Body).Decode(&result)
```
