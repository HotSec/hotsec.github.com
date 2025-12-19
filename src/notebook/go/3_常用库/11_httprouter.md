# httprouter

## 介绍

httprouter 是一个高性能的 HTTP 路由器，它使用基数树（Radix Tree）来存储路由信息，因此查找路由的时间复杂度为 O(1)。httprouter 还支持中间件、参数路由、子路由等功能，使得它非常适合用于构建高性能的 Web 应用。

## 安装

```shell
go get -u github.com/julienschmidt/httprouter
```

## 使用

```go
package main

import (
	"fmt"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func main() {
	router := httprouter.New()

	router.GET("/", func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		fmt.Fprint(w, "Welcome!\n")
	})

	router.GET("/hello/:name", func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		fmt.Fprintf(w, "hello, %s!\n", ps.ByName("name"))
	})

	http.ListenAndServe(":8080", router)
}
```

## 路由

### 基本路由

```go
router.GET("/", handler)
router.POST("/user", handler)
router.PUT("/user/:id", handler)
router.DELETE("/user/:id", handler)
router.PATCH("/user/:id", handler)
router.OPTIONS("/user/:id", handler)
router.HEAD("/user/:id", handler)
```

### 路由参数

```go
router.GET("/user/:id", func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
    id := ps.ByName("id") // 获取路由参数
    fmt.Fprintf(w, "User ID: %s\n", id)
})
```

### 路由中间件

```go
func middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 在处理请求之前执行一些操作
        next.ServeHTTP(w, r)
        // 在处理请求之后执行一些操作
    })
}

router.GET("/user/:id", middleware(handler))
```

### 子路由

```go
subrouter := httprouter.New()
subrouter.GET("/user/:id", func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
    id := ps.ByName("id")
    fmt.Fprintf(w, "User ID: %s\n", id)
})

router.GET("/admin", subrouter)
```

## 总结

httprouter 是一个高性能的 HTTP 路由器，它使用基数树来存储路由信息，因此查找路由的时间复杂度为 O(1)。httprouter 还支持中间件、参数路由、子路由等功能，使得它非常适合用于构建高性能的 Web 应用。