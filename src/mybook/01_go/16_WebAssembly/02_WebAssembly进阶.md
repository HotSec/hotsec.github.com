# WebAssembly 进阶

> 参考：《Go语言高级编程（第2版）》第8章

本章介绍 WebAssembly 的高级主题，包括外部函数接口、WebAssembly 虚拟机、插件系统和 Go 函数导出。

---

## 一、外部函数接口 (FFI)

### 1.1 从 JavaScript 调用 Go 函数

```go
package main

import (
    "syscall/js"
    "fmt"
)

func add(this js.Value, args []js.Value) interface{} {
    if len(args) != 2 {
        return nil
    }
    
    a := args[0].Int()
    b := args[1].Int()
    
    return a + b
}

func greet(this js.Value, args []js.Value) interface{} {
    if len(args) != 1 {
        return nil
    }
    
    name := args[0].String()
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    js.Global().Set("goAdd", js.FuncOf(add))
    js.Global().Set("goGreet", js.FuncOf(greet))
    
    select {}
}
```

JavaScript 调用：

```javascript
const result = goAdd(10, 20);
console.log(result);

const greeting = goGreet("World");
console.log(greeting);
```

### 1.2 从 Go 调用 JavaScript 函数

```go
package main

import (
    "syscall/js"
)

func main() {
    math := js.Global().Get("Math")
    
    result := math.Call("sqrt", 16)
    println("sqrt(16) =", result.Float())
    
    result = math.Call("pow", 2, 10)
    println("pow(2, 10) =", result.Float())
    
    result = math.Call("random")
    println("random() =", result.Float())
    
    select {}
}
```

### 1.3 回调函数

```go
package main

import (
    "syscall/js"
    "time"
)

func asyncOperation(callback js.Value) {
    go func() {
        time.Sleep(2 * time.Second)
        
        callback.Invoke(js.ValueOf("Operation completed!"))
    }()
}

func main() {
    js.Global().Set("goAsync", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        if len(args) != 1 {
            return nil
        }
        
        callback := args[0]
        asyncOperation(callback)
        
        return nil
    }))
    
    select {}
}
```

JavaScript 调用：

```javascript
goAsync((result) => {
    console.log(result);
});
```

---

## 二、WebAssembly 虚拟机

### 2.1 Wasmtime 运行时

Wasmtime 是一个独立的 WebAssembly 运行时：

```bash
cargo install wasmtime
```

运行 Go 编译的 WebAssembly：

```bash
GOOS=wasip1 GOARCH=wasm go build -o main.wasm main.go
wasmtime main.wasm
```

### 2.2 Wasmer 运行时

Wasmer 是另一个流行的 WebAssembly 运行时：

```bash
curl https://get.wasmer.io -sSfL | sh
```

### 2.3 WASI (WebAssembly System Interface)

WASI 是 WebAssembly 的系统接口，允许访问文件系统、网络等：

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    file, err := os.Create("hello.txt")
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    defer file.Close()
    
    file.WriteString("Hello, WASI!")
    
    fmt.Println("File created successfully")
}
```

编译和运行：

```bash
GOOS=wasip1 GOARCH=wasm go build -o main.wasm main.go
wasmtime --dir=. main.wasm
```

---

## 三、WebAssembly 插件系统

### 3.1 插件架构

```
┌─────────────────────────────────────────────────────────────┐
│                      插件架构                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              主程序 (Host)                           │   │
│  │  • 加载插件                                         │   │
│  │  • 提供宿主 API                                     │   │
│  │  • 调用插件函数                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              WebAssembly 插件                        │   │
│  │  • 沙箱隔离                                         │   │
│  │  • 安全执行                                         │   │
│  │  • 通过 FFI 与宿主通信                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 MOSN WebAssembly 插件

MOSN 支持 WebAssembly 插件扩展：

```go
package main

import (
    "syscall/js"
)

func onHttpRequestHeaders(context js.Value, headers js.Value) js.Value {
    headers.Call("Set", "X-Custom-Header", "from-wasm-plugin")
    return js.ValueOf(true)
}

func main() {
    js.Global().Set("proxy_on_http_request_headers", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        context := args[0]
        headers := args[1]
        return onHttpRequestHeaders(context, headers)
    }))
    
    select {}
}
```

### 3.3 插件配置

```yaml
wasm_plugins:
  - name: my-plugin
    vm_config:
      engine: wasmtime
    instance_num: 4
    plugin_config:
      url: file://./plugin.wasm
```

---

## 四、导出 Go 函数

### 4.1 导出函数到 WebAssembly

```go
package main

import (
    "syscall/js"
    "unsafe"
)

var memory []byte

func alloc(size int) unsafe.Pointer {
    buf := make([]byte, size)
    memory = append(memory, buf...)
    return unsafe.Pointer(&buf[0])
}

func free(ptr unsafe.Pointer) {
}

func processString(ptr unsafe.Pointer, length int) unsafe.Pointer {
    bytes := (*[1 << 30]byte)(ptr)[:length:length]
    str := string(bytes)
    
    result := "Processed: " + str
    resultPtr := alloc(len(result))
    
    resultBytes := (*[1 << 30]byte)(resultPtr)[:len(result):len(result)]
    copy(resultBytes, result)
    
    return resultPtr
}

func main() {
    js.Global().Set("alloc", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        size := args[0].Int()
        ptr := alloc(size)
        return int(uintptr(ptr))
    }))
    
    js.Global().Set("free", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        ptr := unsafe.Pointer(uintptr(args[0].Int()))
        free(ptr)
        return nil
    }))
    
    js.Global().Set("processString", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        ptr := unsafe.Pointer(uintptr(args[0].Int()))
        length := args[1].Int()
        resultPtr := processString(ptr, length)
        return int(uintptr(resultPtr))
    }))
    
    select {}
}
```

### 4.2 TinyGo 导出

TinyGo 对 WebAssembly 有更好的支持：

```go
package main

import (
    "unsafe"
)

var buf []byte

func main() {}

//export alloc
func alloc(size int32) unsafe.Pointer {
    buf = make([]byte, size)
    return unsafe.Pointer(&buf[0])
}

//export process
func process(ptr unsafe.Pointer, length int32) int32 {
    bytes := (*[1 << 30]byte)(ptr)[:length:length]
    result := len(bytes)
    return int32(result)
}
```

编译：

```bash
tinygo build -o plugin.wasm -target wasm ./main.go
```

---

## 五、内存共享

### 5.1 共享内存

```go
package main

import (
    "syscall/js"
)

func main() {
    memory := js.Global().Get("WebAssembly").Get("Memory").New(
        js.ValueOf(map[string]interface{}{
            "initial": 256,
            "maximum": 512,
            "shared":  true,
        }),
    )
    
    buffer := memory.Get("buffer")
    bytes := js.Global().Get("Uint8Array").New(buffer)
    
    bytes.SetIndex(0, 42)
    
    value := bytes.Index(0)
    println("Value:", value)
    
    select {}
}
```

### 5.2 跨线程通信

```go
package main

import (
    "syscall/js"
    "sync/atomic"
    "unsafe"
)

var sharedData []int32

func main() {
    sharedData = make([]int32, 1024)
    
    js.Global().Set("increment", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        index := args[0].Int()
        atomic.AddInt32(&sharedData[index], 1)
        return nil
    }))
    
    js.Global().Set("get", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        index := args[0].Int()
        return atomic.LoadInt32(&sharedData[index])
    }))
    
    select {}
}
```

---

## 六、性能优化

### 6.1 减少内存拷贝

```go
func processLargeData(data js.Value) {
    length := data.Length()
    
    bytes := make([]byte, length)
    js.CopyBytesToGo(bytes, data)
    
    for i := range bytes {
        bytes[i] = bytes[i] * 2
    }
    
    js.CopyBytesToJS(data, bytes)
}
```

### 6.2 批量操作

```go
func batchProcess(items js.Value) js.Value {
    length := items.Length()
    results := js.Global().Get("Array").New()
    
    for i := 0; i < length; i++ {
        item := items.Index(i)
        result := processItem(item)
        results.Call("push", result)
    }
    
    return results
}
```

### 6.3 并行处理

```go
func parallelProcess(data []byte, workers int) []byte {
    chunkSize := len(data) / workers
    results := make(chan []byte, workers)
    
    for i := 0; i < workers; i++ {
        start := i * chunkSize
        end := start + chunkSize
        if i == workers-1 {
            end = len(data)
        }
        
        go func(chunk []byte) {
            results <- processChunk(chunk)
        }(data[start:end])
    }
    
    var result []byte
    for i := 0; i < workers; i++ {
        result = append(result, <-results...)
    }
    
    return result
}
```

---

## 七、调试与测试

### 7.1 单元测试

```go
package main

import (
    "testing"
    "syscall/js"
)

func TestAdd(t *testing.T) {
    add := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        return args[0].Int() + args[1].Int()
    })
    defer add.Release()
    
    result := add.Invoke(2, 3)
    if result.Int() != 5 {
        t.Errorf("Expected 5, got %d", result.Int())
    }
}
```

### 7.2 性能测试

```go
func BenchmarkProcess(b *testing.B) {
    data := make([]byte, 1024)
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        processData(data)
    }
}
```

### 7.3 调试工具

```bash
wasmtime --debug main.wasm
wasm-objdump -x main.wasm
wasm2wat main.wasm -o main.wat
```

---

## 八、部署与集成

### 8.1 部署到 CDN

```bash
aws s3 cp main.wasm s3://my-bucket/wasm/
aws s3 cp wasm_exec.js s3://my-bucket/wasm/
```

### 8.2 集成到 Web 应用

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Go WebAssembly App</title>
</head>
<body>
    <div id="app"></div>
    
    <script src="https://cdn.example.com/wasm/wasm_exec.js"></script>
    <script>
        const go = new Go();
        
        let wasmModule;
        
        async function init() {
            const response = await fetch('https://cdn.example.com/wasm/main.wasm');
            const bytes = await response.arrayBuffer();
            const result = await WebAssembly.instantiate(bytes, go.importObject);
            
            wasmModule = result.instance;
            go.run(wasmModule);
        }
        
        init().catch(console.error);
    </script>
</body>
</html>
```

### 8.3 服务端 WebAssembly

```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/wasm/main.wasm", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/wasm")
        http.ServeFile(w, r, "main.wasm")
    })
    
    http.HandleFunc("/wasm/wasm_exec.js", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/javascript")
        http.ServeFile(w, r, "wasm_exec.js")
    })
    
    fmt.Println("Server running on :8080")
    http.ListenAndServe(":8080", nil)
}
```

---

## 九、总结

WebAssembly 进阶主题包括：

1. **外部函数接口**：Go 与 JavaScript 双向调用
2. **WebAssembly 虚拟机**：Wasmtime、Wasmer 等运行时
3. **插件系统**：MOSN 等项目的 WebAssembly 插件
4. **函数导出**：导出 Go 函数供外部调用
5. **内存共享**：共享内存和跨线程通信
6. **性能优化**：减少内存拷贝、批量处理、并行处理
7. **部署集成**：CDN 部署、Web 应用集成
