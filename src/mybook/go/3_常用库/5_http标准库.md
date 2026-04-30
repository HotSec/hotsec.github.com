# HTTP标准库

## server

```go
import (
    "net/http"
)

func main() {
    http.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("pong"))
    })

    http.ListenAndServe(":9527", nil)
}
```

## client

```go
package main

import (
 "bytes"
 "encoding/json"
 "fmt"
 "io"
 "net/http"
)

func main() {
    reqBody, _ := json.Marshal(map[string]string{"key1": "val1", "key2": "val2"})

    resp, _ := http.Post("http://httpbin.org/post", "application/json", bytes.NewReader(reqBody))
    defer resp.Body.Close()

    respBody, _ := io.ReadAll(resp.Body)
    fmt.Printf("resp: %s", respBody)
}
```
