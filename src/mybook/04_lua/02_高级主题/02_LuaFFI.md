# Lua FFI

LuaJIT FFI（Foreign Function Interface）允许直接在 Lua 中调用 C 函数和使用 C 数据结构，无需编写 C 绑定代码。

## 基础用法

### 加载 FFI

```lua
local ffi = require("ffi")
```

### 声明 C 函数和类型

```lua
ffi.cdef[[
    // 标准库函数
    int printf(const char *fmt, ...);
    int abs(int x);
    double sqrt(double x);
    size_t strlen(const char *s);

    // 自定义结构体
    typedef struct {
        int x;
        int y;
    } Point;

    // 自定义函数
    int add(int a, int b);
]]
```

### 调用 C 函数

```lua
ffi.C.printf("Hello %s!\n", "World")
print(ffi.C.abs(-42))
print(ffi.C.sqrt(2.0))
print(ffi.C.strlen("hello"))
```

## 数据类型

### 基本类型

```lua
local int_val = ffi.new("int", 42)
local double_val = ffi.new("double", 3.14)
local char_val = ffi.new("char", "A")
local bool_val = ffi.new("bool", true)
```

### 数组

```lua
local arr = ffi.new("int[10]")
arr[0] = 1
arr[1] = 2

local init_arr = ffi.new("int[3]", {1, 2, 3})

local str_arr = ffi.new("const char *[3]", {"hello", "world", "lua"})
```

### 结构体

```lua
ffi.cdef[[
    typedef struct {
        double x;
        double y;
    } Point;
]]

local p = ffi.new("Point")
p.x = 1.0
p.y = 2.0

local p2 = ffi.new("Point", {3.0, 4.0})
local p3 = ffi.new("Point", {x = 5.0, y = 6.0})
```

### 指针

```lua
local val = ffi.new("int[1]", {42})
local ptr = ffi.new("int *", val)
print(ptr[0])  -- 42

local null_ptr = ffi.new("int *")  -- NULL
if ptr ~= nil then
    print("not null")
end
```

### 联合体与枚举

```lua
ffi.cdef[[
    typedef union {
        int i;
        float f;
        char c[4];
    } Data;

    typedef enum {
        RED = 0,
        GREEN = 1,
        BLUE = 2
    } Color;
]]

local d = ffi.new("Data")
d.i = 65
print(string.byte(ffi.string(d.c, 1)))  -- 65

local color = ffi.new("Color", 1)
```

## 字符串操作

### Lua 字符串 ↔ C 字符串

```lua
-- C 字符串 → Lua 字符串
local c_str = ffi.new("char[6]", "hello")
local lua_str = ffi.string(c_str)       -- "hello"
local lua_str2 = ffi.string(c_str, 5)   -- 指定长度

-- Lua 字符串 → C 字符串
local c_str2 = ffi.new("char[?]", #lua_str + 1)
ffi.copy(c_str2, lua_str)
```

### 缓冲区

```lua
local buf = ffi.new("char[256]")
ffi.C.snprintf(buf, 256, "value = %d", 42)
print(ffi.string(buf))
```

## 加载 C 库

### 动态链接库

```lua
ffi.cdef[[
    int puts(const char *s);
    void *malloc(size_t size);
    void free(void *ptr);
]]

-- 系统库（通过 ffi.C 访问）
ffi.C.puts("hello")

-- 自定义库
local mylib = ffi.load("mylib")
ffi.cdef[[
    int my_function(int x);
]]
mylib.my_function(42)
```

### 指定路径

```lua
local lib = ffi.load("/path/to/libmylib.so")
local lib = ffi.load("./libmylib.so")
```

## 回调函数

```lua
ffi.cdef[[
    typedef int (*compare_func)(const void *, const void *);
    void qsort(void *base, size_t nmemb, size_t size, compare_func cmp);
]]

local cmp = ffi.cast("compare_func", function(a, b)
    local va = ffi.cast("int *", a)[0]
    local vb = ffi.cast("int *", b)[0]
    if va < vb then return -1 end
    if va > vb then return 1 end
    return 0
end)

local arr = ffi.new("int[5]", {5, 3, 1, 4, 2})
ffi.C.qsort(arr, 5, ffi.sizeof("int"), cmp)

for i = 0, 4 do
    print(arr[i])  -- 1, 2, 3, 4, 5
end

cmp:free()  -- 释放回调
```

## 类型信息

```lua
ffi.sizeof("int")          -- 4
ffi.sizeof("Point")        -- 16
ffi.alignof("double")      -- 8
ffi.offsetof("Point", "y") -- 8
ffi.istype("int", val)     -- true/false
ffi.typeof("int[10]")      -- 类型对象
```

## 类型转换

```lua
local n = ffi.new("int", 42)
local d = ffi.cast("double", n)   -- int → double
local p = ffi.cast("int *", arr)  -- 数组 → 指针

-- 数值转换
local num = tonumber(n)           -- cdata → Lua number
```

## GC 管理

```lua
-- 为 C 对象设置析构函数
local ptr = ffi.C.malloc(1024)
ffi.gc(ptr, ffi.C.free)  -- ptr 被 GC 回收时自动调用 free

-- 自定义析构
local file = ffi.C.fopen("test.txt", "r")
ffi.gc(file, ffi.C.fclose)
```

## 性能要点

### FFI vs 传统 C 绑定

| 特性 | FFI | 传统 C 绑定 |
|------|-----|-------------|
| 开发成本 | 低（纯 Lua） | 高（需写 C 代码） |
| 调用开销 | 极低 | 较高（Lua↔C 栈操作） |
| JIT 优化 | 可内联优化 | 难以优化 |
| 类型安全 | 弱（运行时检查） | 强（编译时检查） |

### 性能建议

- 热路径使用 FFI 数组而非 Lua table
- 避免频繁 `ffi.new`，复用缓冲区
- 回调函数有额外开销，热路径避免
- `ffi.cast` 有开销，缓存 cast 结果

```lua
-- 缓存类型对象
local int_ptr_t = ffi.typeof("int *")
local ptr = ffi.cast(int_ptr_t, arr)
```
