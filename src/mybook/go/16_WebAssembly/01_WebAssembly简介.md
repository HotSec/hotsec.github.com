# WebAssembly 简介

> 参考：《Go语言高级编程（第2版）》第8章

WebAssembly（Wasm）是一种新的二进制指令格式，可以在现代浏览器和运行时中运行。Go 1.11 开始支持将 Go 程序编译为 WebAssembly。

---

## 一、WebAssembly 概述

### 1.1 什么是 WebAssembly

```
┌─────────────────────────────────────────────────────────────┐
│                    WebAssembly 架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  源代码 (C/C++/Rust/Go/...)                                 │
│      │                                                      │
│      ▼                                                      │
│  编译器 (clang/rustc/go build)                              │
│      │                                                      │
│      ▼                                                      │
│  WebAssembly 模块 (.wasm)                                   │
│      │                                                      │
│      ▼                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              WebAssembly 运行时                       │   │
│  │  • 浏览器 (Chrome, Firefox, Safari, Edge)            │   │
│  │  • Node.js                                          │   │
│  │  • Wasmtime (独立运行时)                             │   │
│  │  • Wasmer                                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 WebAssembly 特点

| 特点 | 说明 |
|------|------|
| 高性能 | 接近原生速度，比 JavaScript 快 |
| 安全 | 沙箱执行，内存隔离 |
| 可移植 | 跨平台，一次编译到处运行 |
| 紧凑 | 二进制格式，体积小 |
| 与 JS 互操作 | 可以与 JavaScript 代码交互 |

### 1.3 WebAssembly 文本格式 (WAT)

```wat
(module
  (func $add (param $a i32) (param $b i32) (result i32)
    local.get $a
    local.get $b
    i32.add)
  (export "add" (func $add)))
```

编译为二进制：

```bash
wat2wasm add.wat -o add.wasm
```

---

## 二、Go 与 WebAssembly

### 2.1 Go WebAssembly 支持

Go 1.11 开始支持 WebAssembly：

```bash
# 编译为 WebAssembly
GOOS=js GOARCH=wasm go build -o main.wasm main.go
```

### 2.2 第一个 Go WebAssembly 程序

```go
package main

func main() {
    println("Hello, WebAssembly!")
}
```

编译：

```bash
GOOS=js GOARCH=wasm go build -o main.wasm main.go
```

HTML 加载：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Go WebAssembly</title>
</head>
<body>
    <script src="wasm_exec.js"></script>
    <script>
        const go = new Go();
        WebAssembly.instantiateStreaming(fetch('main.wasm'), go.importObject)
            .then(result => go.run(result.instance));
    </script>
</body>
</html>
```

### 2.3 wasm_exec.js

`wasm_exec.js` 是 Go 提供的 JavaScript 支持库：

```bash
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .
```

---

## 三、Go WebAssembly 架构

### 3.1 运行时架构

```
┌─────────────────────────────────────────────────────────────┐
│                   Go WebAssembly 运行时                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Go Runtime (Wasm)                       │   │
│  │  • Scheduler (goroutines)                           │   │
│  │  • Memory Allocator                                 │   │
│  │  • Garbage Collector                                │   │
│  │  • System Calls (via JS)                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              syscall/js Package                      │   │
│  │  • js.Value                                         │   │
│  │  • js.Func                                          │   │
│  │  • DOM Access                                       │   │
│  │  • Callback System                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              wasm_exec.js                            │   │
│  │  • Go ↔ JavaScript Bridge                           │   │
│  │  • Memory Management                                │   │
│  │  • System Call Implementation                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 内存模型

```
┌─────────────────────────────────────────────────────────────┐
│                   WebAssembly 内存                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Linear Memory (可增长)                  │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │          Go Heap                             │   │   │
│  │  │  • Goroutine Stacks                         │   │   │
│  │  │  • GC Managed Objects                       │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │          Global Variables                    │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 四、syscall/js 包

### 4.1 js.Value

```go
package main

import (
    "syscall/js"
)

func main() {
    document := js.Global().Get("document")
    
    p := document.Call("createElement", "p")
    p.Set("innerText", "Hello from Go!")
    
    body := document.Call("getElementsByTagName", "body").Index(0)
    body.Call("appendChild", p)
    
    select {}
}
```

### 4.2 js.Func

```go
package main

import (
    "syscall/js"
)

func main() {
    document := js.Global().Get("document")
    button := document.Call("getElementById", "myButton")
    
    callback := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        println("Button clicked!")
        return nil
    })
    defer callback.Release()
    
    button.Call("addEventListener", "click", callback)
    
    select {}
}
```

### 4.3 类型转换

```go
package main

import (
    "syscall/js"
    "fmt"
)

func main() {
    // Go → JavaScript
    js.Global().Set("goValue", js.ValueOf(42))
    js.Global().Set("goString", js.ValueOf("hello"))
    js.Global().Set("goBool", js.ValueOf(true))
    js.Global().Set("goArray", js.ValueOf([]interface{}{1, 2, 3}))
    js.Global().Set("goMap", js.ValueOf(map[string]interface{}{
        "name": "Go",
        "age":  10,
    }))
    
    // JavaScript → Go
    val := js.Global().Get("jsValue")
    
    if val.Type() == js.TypeNumber {
        num := val.Float()
        fmt.Println("Number:", num)
    }
    
    if val.Type() == js.TypeString {
        str := val.String()
        fmt.Println("String:", str)
    }
    
    if val.Type() == js.TypeObject {
        if isArray := val.InstanceOf(js.Global().Get("Array")); isArray {
            length := val.Length()
            for i := 0; i < length; i++ {
                elem := val.Index(i)
                fmt.Println("Element:", elem)
            }
        }
    }
}
```

---

## 五、DOM 操作

### 5.1 基本操作

```go
package main

import (
    "syscall/js"
)

func main() {
    document := js.Global().Get("document")
    
    div := document.Call("createElement", "div")
    div.Set("id", "myDiv")
    div.Set("className", "container")
    
    style := div.Get("style")
    style.Set("color", "red")
    style.Set("fontSize", "20px")
    
    text := document.Call("createTextNode", "Hello, DOM!")
    div.Call("appendChild", text)
    
    body := document.Get("body")
    body.Call("appendChild", div)
    
    select {}
}
```

### 5.2 事件处理

```go
package main

import (
    "syscall/js"
    "fmt"
)

func main() {
    document := js.Global().Get("document")
    
    input := document.Call("getElementById", "myInput")
    button := document.Call("getElementById", "myButton")
    output := document.Call("getElementById", "output")
    
    button.Call("addEventListener", "click", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        value := input.Get("value").String()
        output.Set("innerText", fmt.Sprintf("You entered: %s", value))
        return nil
    }))
    
    select {}
}
```

### 5.3 Canvas 操作

```go
package main

import (
    "syscall/js"
    "math"
)

func main() {
    document := js.Global().Get("document")
    canvas := document.Call("getElementById", "myCanvas")
    ctx := canvas.Call("getContext", "2d")
    
    width := canvas.Get("width").Float()
    height := canvas.Get("height").Float()
    
    ctx.Call("clearRect", 0, 0, width, height)
    
    ctx.Set("fillStyle", "blue")
    ctx.Call("beginPath")
    ctx.Call("arc", width/2, height/2, 50, 0, 2*math.Pi)
    ctx.Call("fill")
    
    select {}
}
```

---

## 六、网络请求

### 6.1 Fetch API

```go
package main

import (
    "syscall/js"
    "encoding/json"
    "fmt"
)

func main() {
    fetch := js.Global().Get("fetch")
    
    promise := fetch.Invoke("https://api.example.com/data")
    
    promise.Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        response := args[0]
        return response.Call("json")
    })).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        data := args[0]
        
        jsonBytes := js.Global().Get("JSON").Call("stringify", data).String()
        
        var result map[string]interface{}
        json.Unmarshal([]byte(jsonBytes), &result)
        
        fmt.Println("Data:", result)
        return nil
    })).Call("catch", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        err := args[0]
        fmt.Println("Error:", err)
        return nil
    }))
    
    select {}
}
```

### 6.2 WebSocket

```go
package main

import (
    "syscall/js"
    "fmt"
)

func main() {
    ws := js.Global().Get("WebSocket").New("wss://echo.websocket.org")
    
    ws.Call("addEventListener", "open", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        fmt.Println("WebSocket connected")
        ws.Call("send", "Hello, WebSocket!")
        return nil
    }))
    
    ws.Call("addEventListener", "message", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        event := args[0]
        data := event.Get("data").String()
        fmt.Println("Received:", data)
        return nil
    }))
    
    ws.Call("addEventListener", "error", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        fmt.Println("WebSocket error")
        return nil
    }))
    
    select {}
}
```

---

## 七、Web Workers

### 7.1 Worker 示例

主线程：

```go
package main

import (
    "syscall/js"
)

func main() {
    worker := js.Global().Get("Worker").New("worker.js")
    
    worker.Call("postMessage", map[string]interface{}{
        "type": "compute",
        "data": 42,
    })
    
    worker.Call("addEventListener", "message", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        event := args[0]
        result := event.Get("data")
        println("Result:", result)
        return nil
    }))
    
    select {}
}
```

Worker 代码 (worker.js):

```javascript
self.onmessage = function(e) {
    const { type, data } = e.data;
    
    if (type === 'compute') {
        const result = data * 2;
        self.postMessage(result);
    }
};
```

---

## 八、调试技巧

### 8.1 使用 println

```go
func main() {
    println("Debug message")
}
```

输出到浏览器控制台。

### 8.2 使用 console.log

```go
func log(args ...interface{}) {
    console := js.Global().Get("console")
    console.Call("log", args...)
}

func main() {
    log("Debug:", 42, "hello")
}
```

### 8.3 错误处理

```go
func safeCall(fn func()) {
    defer func() {
        if r := recover(); r != nil {
            console := js.Global().Get("console")
            console.Call("error", "Panic:", r)
        }
    }()
    fn()
}
```

---

## 九、性能优化

### 9.1 减少 Go ↔ JS 边界切换

```go
func bad() {
    for i := 0; i < 10000; i++ {
        js.Global().Call("someFunction", i)
    }
}

func good() {
    arr := make([]interface{}, 10000)
    for i := 0; i < 10000; i++ {
        arr[i] = i
    }
    js.Global().Call("batchFunction", arr)
}
```

### 9.2 使用 TypedArray

```go
func processImageData(data []byte) {
    arr := js.Global().Get("Uint8Array").New(len(data))
    js.CopyBytesToJS(arr, data)
    
    js.Global().Call("processArray", arr)
}
```

### 9.3 内存管理

```go
func main() {
    callback := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        return nil
    })
    
    defer callback.Release()
    
    select {}
}
```

---

## 十、总结

Go WebAssembly 让 Go 程序可以在浏览器中运行：

1. **编译简单**：`GOOS=js GOARCH=wasm go build`
2. **DOM 操作**：通过 `syscall/js` 包
3. **事件处理**：使用 `js.FuncOf`
4. **网络请求**：Fetch API 和 WebSocket
5. **性能优化**：减少边界切换，使用 TypedArray
