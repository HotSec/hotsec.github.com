# CGO 编程

> 主要参考：《Go语言高级编程（第2版）》第2章 — 柴树杉、曹春晖 著

CGO 是 Go 语言与 C 语言之间的桥梁，使 Go 代码可以调用 C 函数，也可以将 Go 函数导出供 C 调用。C/C++ 经过几十年的发展积累了大量软件资产，CGO 让 Go 语言能够复用这些资源。

---

## 一、快速入门

### 1.1 最简 CGO 程序

```go
package main

import "C"

func main() {
    println("hello cgo!")
}
```

- `import "C"` 是 CGO 的标志性导入，即使不使用任何 C 代码也会触发 CGO 编译
- CGO 伪包"C"不是一个真实的 Go 包，它只是一个标识，告诉 go build 需要先用 cgo 工具预处理

### 1.2 调用 C 标准库

```go
package main

/*
#include <stdio.h>
#include <stdlib.h>

void SayHello(const char* s) {
    puts(s);
}
*/
import "C"

import "unsafe"

func main() {
    cs := C.CString("Hello, CGO!")
    defer C.free(unsafe.Pointer(cs))
    C.SayHello(cs)
}
```

### 1.3 分离 C 代码到独立文件

当 C 代码较多时，可以将其分离到独立文件：

**hello.h**
```c
#ifndef HELLO_H
#define HELLO_H

extern void SayHello(const char* s);

#endif
```

**hello.c**
```c
#include "hello.h"
#include <stdio.h>

void SayHello(const char* s) {
    puts(s);
}
```

**hello.go**
```go
package main

// #include "hello.h"
import "C"

import "unsafe"

func main() {
    cs := C.CString("Hello, CGO!")
    defer C.free(unsafe.Pointer(cs))
    C.SayHello(cs)
}
```

### 1.4 用 Go 实现 C 函数

CGO 不仅支持 Go 调 C，还支持用 Go 实现 C 函数：

**hello.go**
```go
package main

import "C"
import "fmt"

//export SayHello
func SayHello(s *C.char) {
    fmt.Println(C.GoString(s))
}

func main() {
    cs := C.CString("Hello, CGO!")
    defer C.free(unsafe.Pointer(cs))
    C.SayHello(cs)
}
```

### 1.5 面向 C 接口的 Go 编程

将 C 接口作为中间层，Go 代码只依赖 C 接口而非具体实现：

```go
package main

// void SayHello(const char* s);
import "C"

import "unsafe"

func main() {
    cs := C.CString("Hello, World\n")
    defer C.free(unsafe.Pointer(cs))
    C.SayHello(cs)
}
```

`SayHello` 的实现可以放在 C 文件中，也可以用 Go 的 `//export` 实现。这种面向接口的编程方式使得 Go 和 C 的实现可以灵活替换。

---

## 二、CGO 基础

### 2.1 `import "C"` 规则

CGO 的 `import "C"` 语句上方紧邻的注释称为**序言（preamble）**，是 CGO 识别 C 代码的标志：

```go
// 正确：序言紧邻 import "C"
/*
#include <stdio.h>
*/
import "C"

// 错误：序言和 import "C" 之间有空行
/*
#include <stdio.h>
*/

import "C"  // 编译错误！
```

关键规则：
- 序言与 `import "C"` 之间**不能有空行**
- 序言中可以包含 C 代码、头文件引用、`#cgo` 指令
- `import "C"` 必须单独一行，不能与其他包一起导入
- C 伪包中的类型、函数通过 `C.xxx` 访问

### 2.2 CGO_ENABLED 环境变量

```bash
# 启用 CGO（默认值）
CGO_ENABLED=1 go build

# 禁用 CGO（纯 Go 构建，交叉编译常用）
CGO_ENABLED=0 go build

# 查看当前设置
go env CGO_ENABLED
```

禁用 CGO 的场景：
- 交叉编译时 C 工具链不可用
- 追求最小二进制体积
- 不依赖任何 C 库的纯 Go 项目

### 2.3 C 代码的放置方式

```go
// 方式1：内联 C 代码（序言中直接写）
/*
#include <stdio.h>

static int add(int a, int b) {
    return a + b;
}
*/
import "C"

// 方式2：引用头文件
/*
#include "mylib.h"
*/
import "C"

// 方式3：同包下的 .c 文件自动参与编译
// hello.c 和 hello.go 在同一包下
```

### 2.4 CGO 中的 Go 代码限制

在 `import "C"` 所在的源文件中，**不能**在序言之前定义 Go 的包级变量、常量或函数。但可以在 `import "C"` 之后正常定义。

---

## 三、类型转换

CGO 是 C 和 Go 双向通讯的桥梁，要想利用好 CGO，必须深入理解两种语言之间的类型映射。

### 3.1 数值类型

| C 语言类型 | CGO 类型 | Go 类型 | 字节 |
|-----------|----------|---------|------|
| char | C.char | byte | 1 |
| signed char | C.schar | int8 | 1 |
| unsigned char | C.uchar | uint8 | 1 |
| short | C.short | int16 | 2 |
| unsigned short | C.ushort | uint16 | 2 |
| int | C.int | int32 | 4 |
| unsigned int | C.uint | uint32 | 4 |
| long | C.long | int32/int64 | 4/8 |
| unsigned long | C.ulong | uint32/uint64 | 4/8 |
| long long | C.longlong | int64 | 8 |
| unsigned long long | C.ulonglong | uint64 | 8 |
| float | C.float | float32 | 4 |
| double | C.double | float64 | 8 |
| size_t | C.size_t | uint | - |
| ssize_t | C.ssize_t | int | - |
| uintptr_t | C.uintptr_t | uintptr | - |
| intptr_t | C.intptr_t | uintptr | - |

> **注意**：C.int 等类型与 Go 的 int 并不等价，C.int 固定 4 字节，Go 的 int 在 64 位系统上是 8 字节。需要显式转换：`int(C.int(x))`

### 3.2 Go 字符串与 C 字符串

```go
// Go string -> C string（C 堆分配，需手动释放）
cs := C.CString("hello")
defer C.free(unsafe.Pointer(cs))

// C string -> Go string（Go 堆拷贝，GC 管理）
goStr := C.GoString(cs)

// C string -> Go string（指定长度）
goStrN := C.GoStringN(cs, C.int(5))

// C string -> Go []byte
goBytes := C.GoBytes(unsafe.Pointer(cs), C.int(5))
```

| 函数 | 分配方 | 释放方 | 说明 |
|------|-------|-------|------|
| `C.CString` | C 堆 | 调用者 C.free | 包含末尾 '\0' |
| `C.CBytes` | C 堆 | 调用者 C.free | []byte → C 数组 |
| `C.GoString` | Go 堆 | GC | 完整 C 字符串 |
| `C.GoStringN` | Go 堆 | GC | 指定长度 |
| `C.GoBytes` | Go 堆 | GC | 指定长度的字节切片 |

### 3.3 Go 切片与 C 数组

```go
// Go 切片 -> C 数组指针
slice := []C.int{1, 2, 3, 4, 5}
cPtr := &slice[0]           // 取首元素地址
cLen := C.int(len(slice))   // 长度

// C 数组 -> Go 切片（通过反射头）
/*
#include <stdlib.h>
int* newArray(int n) {
    return (int*)malloc(n * sizeof(int));
}
*/
import "C"
import "reflect"

func cArrayToGoSlice(p *C.int, len int) []C.int {
    var s []C.int
    hdr := (*reflect.SliceHeader)(unsafe.Pointer(&s))
    hdr.Data = uintptr(unsafe.Pointer(p))
    hdr.Len = len
    hdr.Cap = len
    return s
}
```

### 3.4 结构体与联合体

```go
/*
struct Point {
    int x;
    int y;
};

union Value {
    int i;
    float f;
};
*/
import "C"

var p C.struct_Point
p.x = 10
p.y = 20

var u C.union_Value
u.i = 42
```

结构体命名规则：
- C 的 `struct Point` → Go 的 `C.struct_Point`
- C 的 `union Value` → Go 的 `C.union_Value`
- C 的 `enum Color` → Go 的 `C.enum_Color`
- C 的 `typedef Point Point` → Go 的 `C.Point`（typedef 后可直接用原名）
- 结构体字段名与 C 一致，但 C 的保留字字段会加 `_` 后缀（如 `type` → `type_`）

### 3.5 枚举类型

```go
/*
enum Color {
    RED = 0,
    GREEN = 1,
    BLUE = 2,
};
*/
import "C"

color := C.enum_Color(C.RED)
```

### 3.6 指针与 void*

```go
// void* 在 CGO 中对应 unsafe.Pointer 或特定类型指针
/*
void* malloc(size_t size);
void free(void* ptr);
*/
import "C"

// C void* -> Go unsafe.Pointer
ptr := C.malloc(1024)
C.free(ptr)

// Go 指针 -> C void*
var buf [1024]byte
C.memcpy(C.malloc(1024), unsafe.Pointer(&buf[0]), 1024)
```

### 3.7 数组类型

C 的固定大小数组与 Go 数组不同：

```go
/*
int arr[10];
*/
import "C"

// C 数组在 Go 中表示为 [N]C.type
var arr [10]C.int
C.memset(unsafe.Pointer(&arr[0]), 0, C.size_t(unsafe.Sizeof(arr)))
```

---

## 四、函数调用

### 4.1 Go 调用 C 函数

```go
/*
#include <math.h>
#include <stdlib.h>

static int add(int a, int b) {
    return a + b;
}
*/
import "C"

func main() {
    // 调用 C 标准库
    result := C.sqrt(16.0)
    fmt.Println(float64(result))

    // 调用自定义 C 函数
    sum := C.add(1, 2)
    fmt.Println(int(sum))
}
```

### 4.2 C 调用 Go 导出函数

通过 `//export` 注释将 Go 函数导出为 C 函数：

```go
package main

import "C"
import "fmt"

//export Add
func Add(a, b C.int) C.int {
    return a + b
}

//export PrintMessage
func PrintMessage(msg *C.char) {
    fmt.Println(C.GoString(msg))
}

func main() {}
```

导出规则：
- `//export` 注释必须紧邻函数定义
- 导出函数的参数和返回值必须是 CGO 兼容类型
- 导出后可在 C 代码中直接调用：`extern int Add(int a, int b);`
- 导出的 Go 函数会被编译为 C 调用约定的函数

### 4.3 回调函数

C 语言的高阶函数（如 qsort）需要回调，CGO 可以通过导出 Go 函数实现：

```go
package main

/*
#include <stdlib.h>

typedef void (*Callback)(int);

static Callback g_callback;

void SetCallback(Callback cb) {
    g_callback = cb;
}

void Trigger(int value) {
    if (g_callback) {
        g_callback(value);
    }
}
*/
import "C"

import "fmt"

//export onCallback
func onCallback(value C.int) {
    fmt.Printf("callback received: %d\n", int(value))
}

func main() {
    C.SetCallback(C.Callback(C.onCallback))
    C.Trigger(42)
}
```

### 4.4 函数指针

```go
/*
#include <stdio.h>

typedef void (*FuncPtr)(int);

void call_func(FuncPtr f, int v) {
    f(v);
}
*/
import "C"

//export myFunc
func myFunc(v C.int) {
    fmt.Println("called with:", int(v))
}

func main() {
    C.call_func(C.FuncPtr(C.myFunc), 42)
}
```

---

## 五、内部机制

> 本节深入分析 CGO 的工作原理，理解 cgo 工具如何生成桥接代码。

### 5.1 CGO 生成的中间文件

执行 `go tool cgo main.go` 后，CGO 会在 `_obj/` 目录下生成一系列中间文件：

```
_obj/
├── _cgo_gotypes.go      # Go 端桥接代码（类型定义、辅助函数）
├── _cgo_export.c         # C 端导出函数的桥接代码
├── _cgo_export.h         # 导出函数的 C 头文件
├── _cgo_main.c           # 临时 main 函数（用于链接检查）
├── main.cgo1.go          # 预处理后的 Go 源文件
├── main.cgo2.c           # 预处理后的 C 源文件
└── ...
```

### 5.2 Go 调 C 的桥接流程

当 Go 调用 `C.puts()` 时，实际经过以下步骤：

1. Go 代码调用 `_Cfunc_puts`（由 `_cgo_gotypes.go` 生成）
2. `_Cfunc_puts` 通过 `runtime.cgocall` 进入 C 运行时
3. C 桥接函数 `_cgo_XXXXX_Cfunc_puts` 执行实际的 `puts` 调用
4. 结果通过栈返回给 Go

```go
// _cgo_gotypes.go 中自动生成的桥接代码（简化）
func _Cfunc_puts(s *C.char) (r C.int) {
    _cgo_runtime_cgocall(
        _cgo_XXXXX_Cfunc_puts,
        uintptr(unsafe.Pointer(&s)),
    )
    return
}
```

### 5.3 C 调 Go 的桥接流程

当 C 调用 Go 导出函数 `Add` 时：

1. C 代码调用 `Add`（实际是 `_cgo_export.c` 中的包装函数）
2. 包装函数通过 `crosscall2` 切换到 Go 运行时
3. Go 桥接函数 `_cgoexp_XXXXX_Add` 被调用
4. 桥接函数解析参数，调用真正的 Go 函数 `Add`
5. 返回值通过 C 调用约定返回给 C

### 5.4 CGO 调用的性能开销

每次 CGO 调用涉及：
- 栈切换（Go 栈 → C 栈）
- Goroutine 与 OS 线程绑定（`runtime.LockOSThread`）
- 参数的序列化/反序列化
- 可能的 GC 暂停

典型开销：一次简单 CGO 调用约 50-100ns，而纯 Go 函数调用约 1-2ns。

---

## 六、实战：封装 qsort

> 参考《Go语言高级编程》2.6 节

C 标准库的 `qsort` 是一个高阶函数，支持自定义比较函数。本节演示如何用 CGO 封装一个 Go 版本的 qsort。

### 6.1 认识 qsort

```c
void qsort(
    void *base,         // 数组起始地址
    size_t nmemb,       // 元素个数
    size_t size,        // 每个元素大小
    int (*compar)(const void *, const void *)  // 比较函数
);
```

### 6.2 简单封装

```go
package qsort

/*
#include <stdlib.h>

typedef int (*qsort_func)(const void* a, const void* b);
extern int go_qsort_compare(void* a, void* b);
*/
import "C"
import "unsafe"

func Sort(base unsafe.Pointer, num, size int, cmp func(a, b unsafe.Pointer) int) {
    // 保存比较函数到全局
    goQsortCompare = cmp
    C.qsort(base, C.size_t(num), C.size_t(size),
        C.qsort_func(C.go_qsort_compare))
}

var goQsortCompare func(a, b unsafe.Pointer) int

//export go_qsort_compare
func go_qsort_compare(a, b unsafe.Pointer) C.int {
    return C.int(goQsortCompare(a, b))
}
```

### 6.3 类型安全的封装

```go
package qsort

import "unsafe"

func SortInts(nums []int) {
    if len(nums) == 0 {
        return
    }
    goQsortCompare = func(a, b unsafe.Pointer) int {
        pa := (*C.int)(a)
        pb := (*C.int)(b)
        return int(*pa - *pb)
    }
    C.qsort(
        unsafe.Pointer(&nums[0]),
        C.size_t(len(nums)),
        C.size_t(unsafe.Sizeof(C.int(0))),
        C.qsort_func(C.go_qsort_compare),
    )
}
```

### 6.4 通用排序封装

```go
package qsort

import (
    "reflect"
    "unsafe"
)

func Sort(slice interface{}, less func(i, j int) bool) {
    v := reflect.ValueOf(slice)
    if v.Kind() != reflect.Slice {
        panic("must be a slice")
    }

    n := v.Len()
    if n <= 1 {
        return
    }

    // 将 less 转换为 C 比较函数
    goQsortCompare = func(a, b unsafe.Pointer) int {
        // 计算元素索引
        elemSize := v.Type().Elem().Size()
        ia := int(uintptr(a)-uintptr(unsafe.Pointer(v.Pointer()))) / int(elemSize)
        ib := int(uintptr(b)-uintptr(unsafe.Pointer(v.Pointer()))) / int(elemSize)
        if less(ia, ib) {
            return -1
        }
        if less(ib, ia) {
            return 1
        }
        return 0
    }

    C.qsort(
        unsafe.Pointer(v.Pointer()),
        C.size_t(n),
        C.size_t(v.Type().Elem().Size()),
        C.qsort_func(C.go_qsort_compare),
    )
}
```

---

## 七、CGO 内存模型

> 参考《Go语言高级编程》2.7 节 / 第二版 2.5 节

CGO 架起了 Go 和 C 的桥梁，但两种语言的内存模型有根本差异：
- **C 内存**：分配后地址稳定不变
- **Go 内存**：GC 可能移动对象，栈可能动态伸缩导致地址变化

这是 CGO 编程中最容易出问题的领域。

### 7.1 Go 访问 C 内存

C 内存由 C 分配，地址稳定，Go 可以安全访问：

```go
/*
#include <stdlib.h>
*/
import "C"

func accessCMemory() {
    // C 分配的内存，地址稳定
    p := C.malloc(1024)
    defer C.free(p)

    // Go 安全读写 C 内存
    C.memset(p, 0, 1024)

    // 将 C 内存转为 Go 切片使用
    goSlice := C.GoBytes(p, 1024) // 拷贝到 Go 内存
    _ = goSlice
}
```

### 7.2 C 临时访问传入的 Go 内存

当 Go 调用 C 函数并传入 Go 指针时，Go 运行时会临时"钉住"（pin）该内存，确保在 C 调用期间不被 GC 移动：

```go
/*
void process(void* data, int len) {
    // 在此函数执行期间，Go 内存被钉住，地址稳定
    char* p = (char*)data;
    for (int i = 0; i < len; i++) {
        p[i] = (char)i;
    }
}
*/
import "C"

func temporaryAccess() {
    buf := make([]byte, 256)
    // Go 运行时保证此调用期间 buf 不会被移动
    C.process(unsafe.Pointer(&buf[0]), C.int(len(buf)))
    // 调用返回后，buf 可能再次被 GC 移动
    fmt.Println(buf[:10])
}
```

**规则**：Go 运行时允许 C 函数临时访问传入的 Go 内存，但仅限于该 C 函数调用期间。

### 7.3 C 长期持有 Go 指针对象

**这是最危险的操作**。C 代码长期持有 Go 指针，Go GC 可能移动或回收该内存，导致 C 端访问悬空指针：

```go
// 危险！C 长期持有 Go 指针
/*
extern void store_pointer(void* ptr);
extern void use_pointer_later();
*/
import "C"

//export store_pointer
func store_pointer(ptr unsafe.Pointer) {
    // 错误：C 保存了 Go 指针，但 Go GC 可能移动该对象
    C.store_pointer(ptr)
}

//export use_pointer_later
func use_pointer_later() {
    // 此时 C 端持有的指针可能已失效
    C.use_pointer_later()
}
```

**解决方案1：拷贝到 C 内存**

```go
func safeStore(goData []byte) {
    // 将数据拷贝到 C 内存
    cData := C.CBytes(goData)
    C.store_pointer(cData) // C 持有 C 内存，安全
    // 注意：需要在适当时机调用 C.free(cData)
}
```

**解决方案2：使用 runtime.Pinner（Go 1.21+）**

```go
func pinAndStore(goData *MyStruct) {
    pinner := runtime.Pinner{}
    pinner.Pin(goData)            // 钉住 Go 对象，阻止 GC 移动
    C.store_pointer(unsafe.Pointer(goData))

    // 使用完毕后必须 Unpin
    pinner.Unpin()
}
```

### 7.4 导出 C 函数不能返回 Go 内存

Go 运行时默认检查导出函数返回的指针是否指向 Go 内存，如果是则抛出运行时异常：

```go
// 错误！导出函数返回 Go 内存
/*
extern int* getGoPtr();
*/
import "C"

//export getGoPtr
func getGoPtr() *C.int {
    var x int = 42
    return (*C.int)(unsafe.Pointer(&x)) // 运行时 panic！
    // panic: runtime error: cgo result has Go pointer
}
```

原因：Go 分配的内存可能被 GC 移动，C 端拿到指针后可能随时失效。

**正确做法**：在 C 端分配内存

```go
//export getPtr
func getPtr() *C.int {
    p := (*C.int)(C.malloc(C.size_t(unsafe.Sizeof(C.int(0)))))
    *p = C.int(42)
    return p // C 内存，安全
}
```

### 7.5 runtime.Pinner 类型（Go 1.21+）

`runtime.Pinner` 允许将 Go 对象钉在内存中，阻止 GC 移动：

```go
import "runtime"

type Pinner struct{}

func (p *Pinner) Pin(ptr interface{})
func (p *Pinner) Unpin()
```

使用场景：
- C 回调需要长期持有 Go 对象
- 将 Go 对象传递给 C 库并期望 C 库长期使用

```go
type Buffer struct {
    Data []byte
}

var globalPinner runtime.Pinner

func RegisterBuffer(buf *Buffer) {
    globalPinner.Pin(buf)
    C.register_buffer(unsafe.Pointer(buf))
}

func UnregisterBuffer(buf *Buffer) {
    C.unregister_buffer(unsafe.Pointer(buf))
    globalPinner.Unpin()
}
```

### 7.6 CGO 内存模型总结

| 场景 | 安全性 | 说明 |
|------|-------|------|
| Go 读 C 内存 | ✅ 安全 | C 内存地址稳定 |
| Go 写 C 内存 | ✅ 安全 | 同上 |
| C 临时读 Go 内存 | ✅ 安全 | 运行时自动 pin |
| C 临时写 Go 内存 | ✅ 安全 | 运行时自动 pin |
| C 长期持有 Go 指针 | ❌ 危险 | GC 可能移动对象 |
| 导出函数返回 Go 指针 | ❌ 禁止 | 运行时会检查并 panic |
| C 长期持有 Go 指针 + Pinner | ⚠️ 谨慎 | 需手动管理 Unpin |

---

## 八、C++ 类封装

> 参考《Go语言高级编程》2.8 节 / 第二版 2.6 节

CGO 是 C 和 Go 的桥梁，不直接支持 C++。但可以通过 C 接口封装 C++ 类。

### 8.1 C++ 类到 Go 语言对象

核心思路：用 `void*` 指针在 Go 和 C 之间传递 C++ 对象。

**myclass.h**
```cpp
#pragma once

class MyClass {
public:
    MyClass(int value);
    ~MyClass();
    int GetValue() const;
    void SetValue(int value);
    int Add(int a, int b);
};
```

**myclass_capi.h**（C 兼容接口）
```c
#pragma once

#ifdef __cplusplus
extern "C" {
#endif

typedef void* MyClassPtr;

MyClassPtr MyClass_New(int value);
void MyClass_Free(MyClassPtr p);
int MyClass_GetValue(MyClassPtr p);
void MyClass_SetValue(MyClassPtr p, int value);
int MyClass_Add(MyClassPtr p, int a, int b);

#ifdef __cplusplus
}
#endif
```

**myclass_capi.cpp**
```cpp
#include "myclass.h"
#include "myclass_capi.h"

MyClassPtr MyClass_New(int value) {
    return new MyClass(value);
}

void MyClass_Free(MyClassPtr p) {
    delete static_cast<MyClass*>(p);
}

int MyClass_GetValue(MyClassPtr p) {
    return static_cast<MyClass*>(p)->GetValue();
}

void MyClass_SetValue(MyClassPtr p, int value) {
    static_cast<MyClass*>(p)->SetValue(value);
}

int MyClass_Add(MyClassPtr p, int a, int b) {
    return static_cast<MyClass*>(p)->Add(a, b);
}
```

**myclass.go**
```go
package myclass

/*
#cgo CXXFLAGS: -std=c++11
#cgo LDFLAGS: -lstdc++

#include "myclass_capi.h"
*/
import "C"
import "unsafe"

type MyClass struct {
    ptr C.MyClassPtr
}

func NewMyClass(value int) *MyClass {
    return &MyClass{
        ptr: C.MyClass_New(C.int(value)),
    }
}

func (m *MyClass) Free() {
    C.MyClass_Free(m.ptr)
    m.ptr = nil
}

func (m *MyClass) GetValue() int {
    return int(C.MyClass_GetValue(m.ptr))
}

func (m *MyClass) SetValue(value int) {
    C.MyClass_SetValue(m.ptr, C.int(value))
}

func (m *MyClass) Add(a, b int) int {
    return int(C.MyClass_Add(m.ptr, C.int(a), C.int(b)))
}
```

### 8.2 Go 语言对象到 C++ 类

反向映射：将 Go 对象传递给 C++ 使用。

```go
package main

/*
#include <stdlib.h>

typedef void (*GoCallback)(int);

extern void GoCallback_onEvent(int);

class EventProcessor {
    GoCallback callback_;
public:
    EventProcessor(GoCallback cb) : callback_(cb) {}
    void Process(int event) {
        callback_(event);
    }
};

static EventProcessor* NewProcessor(GoCallback cb) {
    return new EventProcessor(cb);
}

static void DeleteProcessor(EventProcessor* p) {
    delete p;
}

static void ProcessEvent(EventProcessor* p, int event) {
    p->Process(event);
}
*/
import "C"
import "fmt"

//export GoCallback_onEvent
func GoCallback_onEvent(event C.int) {
    fmt.Println("Event received:", int(event))
}

func main() {
    p := C.NewProcessor(C.GoCallback(C.GoCallback_onEvent))
    defer C.DeleteProcessor(p)

    C.ProcessEvent(p, 42)
}
```

### 8.3 彻底解放 C++ 的 this 指针

将 C++ 的 this 指针与 Go 对象绑定，实现双向操作：

```go
package main

/*
#include <stdlib.h>

typedef struct {
    void* go_obj;
} CppWrapper;

static CppWrapper* NewWrapper(void* go_obj) {
    CppWrapper* w = (CppWrapper*)malloc(sizeof(CppWrapper));
    w->go_obj = go_obj;
    return w;
}

extern void CppCallback(void* go_obj, int result);
*/
import "C"
import (
    "fmt"
    "runtime/cgo"
    "unsafe"
)

type GoObject struct {
    Name string
}

//export CppCallback
func CppCallback(goObjPtr C.uintptr_t, result C.int) {
    handle := cgo.Handle(goObjPtr)
    obj := handle.Value().(*GoObject)
    fmt.Printf("%s: result = %d\n", obj.Name, int(result))
}

func main() {
    obj := &GoObject{Name: "test"}
    handle := cgo.NewHandle(obj)
    defer handle.Delete()

    w := C.NewWrapper(unsafe.Pointer(uintptr(handle)))
    defer C.free(unsafe.Pointer(w))

    C.CppCallback(C.uintptr_t(handle), 100)
}
```

---

## 九、静态库和动态库

> 参考《Go语言高级编程》2.9 节

CGO 使用 C/C++ 资源有三种形式：直接使用源码、链接静态库、链接动态库。

### 9.1 直接使用源码

```go
// 同包下的 C 源文件自动编译
/*
#include "mylib.h"
*/
import "C"
```

将 `mylib.c` 和 `mylib.h` 放在同一 Go 包目录下即可。

### 9.2 链接静态库

```go
/*
#cgo CFLAGS: -I${SRCDIR}/include
#cgo LDFLAGS: -L${SRCDIR}/lib -lmylib
#include "mylib.h"
*/
import "C"
```

编译静态库：
```bash
gcc -c -o mylib.o mylib.c
ar rcs libmylib.a mylib.o
```

### 9.3 链接动态库

```go
/*
#cgo CFLAGS: -I${SRCDIR}/include
#cgo LDFLAGS: -L${SRCDIR}/lib -lmylib -Wl,-rpath,${SRCDIR}/lib
#include "mylib.h"
*/
import "C"
```

编译动态库：
```bash
gcc -shared -fPIC -o libmylib.so mylib.c
```

### 9.4 使用 pkg-config

```go
/*
#cgo pkg-config: openssl
#include <openssl/ssl.h>
*/
import "C"
```

自定义 pkg-config：
```bash
# 创建 mylib.pc
prefix=/usr/local
libdir=${prefix}/lib
includedir=${prefix}/include

Name: mylib
Description: My Library
Version: 1.0
Libs: -L${libdir} -lmylib
Cflags: -I${includedir}
```

### 9.5 导出 C 静态库

Go 代码可以编译为 C 静态库供其他 C 程序使用：

```bash
# 编译为 C 静态库
go build -buildmode=c-archive -o mylib.a ./mypkg

# 生成 mylib.a 和 mylib.h
```

### 9.6 导出 C 动态库

```bash
# 编译为 C 动态库
go build -buildmode=c-shared -o mylib.so ./mypkg

# 生成 mylib.so 和 mylib.h
```

---

## 十、编译和链接参数

> 参考《Go语言高级编程》2.10 节

### 10.1 编译参数

```go
/*
#cgo CFLAGS: -O2 -Wall -I/usr/local/include
#cgo CPPFLAGS: -DDEBUG=1
#cgo CXXFLAGS: -std=c++17 -fexceptions
*/
import "C"
```

| 参数 | 用途 |
|------|------|
| CFLAGS | C 编译选项（优化级别、警告、头文件路径） |
| CPPFLAGS | C 预处理选项（宏定义） |
| CXXFLAGS | C++ 编译选项（标准版本、异常） |

### 10.2 链接参数

```go
/*
#cgo LDFLAGS: -L/usr/local/lib -lmylib -lm -lpthread
#cgo LDFLAGS: -Wl,-rpath,/usr/local/lib
*/
import "C"
```

### 10.3 条件编译参数

```go
/*
#cgo linux CFLAGS: -DLINUX
#cgo darwin CFLAGS: -DDARWIN
#cgo windows CFLAGS: -DWINDOWS
#cgo linux LDFLAGS: -lrt
#cgo darwin LDFLAGS: -framework CoreFoundation
*/
import "C"
```

### 10.4 ${SRCDIR} 变量

`${SRCDIR}` 是 CGO 提供的特殊变量，代表当前 Go 包的源码目录：

```go
/*
#cgo CFLAGS: -I${SRCDIR}/include
#cgo LDFLAGS: -L${SRCDIR}/lib -lmylib
*/
import "C"
```

### 10.5 CGO 编译流程

```
Go 源码 → cgo 工具预处理 → 生成中间文件
    ↓
C 源码 → C 编译器 → 目标文件
    ↓
Go 源码 → Go 编译器 → 目标文件
    ↓
目标文件 → 链接器 → 最终二进制
```

---

## 十一、性能优化

### 11.1 减少 CGO 调用次数

```go
// 差：频繁调用 CGO
for i := 0; i < 10000; i++ {
    C.small_operation(C.int(i))
}

// 好：批量处理
var items [10000]C.int
for i := range items {
    items[i] = C.int(i)
}
C.batch_process(&items[0], C.int(len(items)))
```

### 11.2 避免频繁内存分配

```go
// 差：每次调用分配
for _, s := range strings {
    cs := C.CString(s)
    C.process(cs)
    C.free(unsafe.Pointer(cs))
}

// 好：预分配缓冲区
buf := make([]byte, 4096)
for _, s := range strings {
    copy(buf, s)
    cs := (*C.char)(unsafe.Pointer(&buf[0]))
    C.process(cs)
}
```

### 11.3 减少 Go/C 类型转换

```go
// 差：频繁转换
for i := 0; i < n; i++ {
    C.process(C.int(goSlice[i])) // 每次转换
}

// 好：使用 CGO 类型工作
cSlice := make([]C.int, n)
for i := range cSlice {
    cSlice[i] = C.int(goSlice[i]) // 一次转换
}
C.batch_process(&cSlice[0], C.int(n))
```

### 11.4 CGO 调用与 Goroutine

CGO 调用会阻塞 OS 线程，大量并发 CGO 调用可能耗尽线程资源：

```go
var sem = make(chan struct{}, runtime.GOMAXPROCS(0))

func callC() {
    sem <- struct{}{}
    defer func() { <-sem }()
    C.slow_operation()
}
```

---

## 十二、常见陷阱

### 12.1 CString 内存泄漏

```go
// 错误：忘记释放
func bad() {
    cs := C.CString("leak")
    _ = cs // 泄漏！
}

// 正确：defer 释放
func good() {
    cs := C.CString("no leak")
    defer C.free(unsafe.Pointer(cs))
}
```

### 12.2 Go 指针传入 C 后被移动

```go
// 危险：Go 切片在 C 调用期间可能被移动
func dangerous() {
    slice := make([]byte, 100)
    p := unsafe.Pointer(&slice[0])
    go func() {
        slice = append(slice, make([]byte, 1000)...) // 可能重新分配
    }()
    C.use_pointer(p) // p 可能已失效
}
```

### 12.3 线程安全

CGO 调用会锁定 OS 线程，C 代码中的全局状态需要同步：

```go
/*
#include <pthread.h>
static pthread_mutex_t mu = PTHREAD_MUTEX_INITIALIZER;
static int counter = 0;
*/
import "C"

func safeIncrement() {
    C.pthread_mutex_lock(&C.mu)
    defer C.pthread_mutex_unlock(&C.mu)
    C.counter++
}
```

### 12.4 交叉编译困难

CGO 依赖 C 工具链，交叉编译需要对应平台的 C 交叉编译器：

```bash
# 禁用 CGO 进行交叉编译
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build

# 使用 CGO 交叉编译（需要 arm64 交叉编译器）
CC=aarch64-linux-gnu-gcc CGO_ENABLED=1 GOOS=linux GOARCH=arm64 go build
```

### 12.5 构建缓存失效

修改 C 代码后 Go 的构建缓存可能不会自动失效：

```bash
# 清除缓存重新构建
go clean -cache
go build
```

---

## 十三、调试技巧

### 13.1 查看 CGO 生成的代码

```bash
# 生成中间文件
go tool cgo main.go
ls _obj/

# 查看生成的 Go 桥接代码
cat _obj/_cgo_gotypes.go

# 查看生成的 C 桥接代码
cat _obj/_cgo_export.c
```

### 13.2 环境变量

```bash
# 禁用 CGO
CGO_ENABLED=0 go build

# 显示 C 编译命令
CGO_CFLAGS="-v" go build

# 指定 C 编译器
CC=clang go build

# 指定 C++ 编译器
CXX=clang++ go build

# CGO 调试
GODEBUG=cgocheck=2 go run main.go  # 严格检查 Go 指针传递
GODEBUG=cgocheck=0 go run main.go  # 关闭指针检查（危险！）
```

### 13.3 常见编译错误

```
could not determine kind of name for C.xxx
```
→ 确保 C 头文件正确包含，检查 `#include` 路径

```
undefined reference to `xxx'
```
→ 检查 LDFLAGS 是否正确链接了库

```
cgo: C compiler "gcc" not found
```
→ 安装 GCC/MinGW

---

## 十四、最佳实践

1. **最小化 CGO 边界**：尽量减少 Go/C 交互次数，批量处理
2. **明确内存所有权**：谁分配谁释放，用 defer 保障释放
3. **面向 C 接口编程**：Go 和 C 通过 C 接口解耦
4. **C++ 必须通过 C 接口封装**：用 `extern "C"` 暴露 C 接口
5. **避免长期持有 Go 指针**：拷贝到 C 内存或使用 runtime.Pinner
6. **注意线程安全**：CGO 调用锁定 OS 线程，C 全局状态需同步
7. **优先纯 Go 实现**：CGO 带来构建复杂度和性能开销
8. **充分测试**：使用 `-race` 检测竞态，`cgocheck=2` 检查指针传递
