# LuaJIT

LuaJIT 是 Lua 的即时编译（JIT）实现，性能远超标准 Lua 解释器。

## 概述

- **Just-In-Time 编译**：运行时将热点 Lua 代码编译为本地机器码
- **兼容 Lua 5.1**：API 和语法与 Lua 5.1 完全兼容
- **高性能**：比标准 Lua 快 10-100 倍
- **FFI**：直接调用 C 函数，无需编写 C 绑定
- **低延迟**：适合游戏、网络等实时场景

## 安装

```bash
# macOS
brew install luajit

# Ubuntu
apt install luajit

# 源码编译
git clone https://github.com/LuaJIT/LuaJIT.git
cd LuaJIT && make && sudo make install
```

## JIT 编译器

### 工作原理

```
Lua 代码 → 字节码 → 解释执行
                  ↓ 热点检测
              JIT 编译 → 机器码 → 直接执行
```

1. 首次执行：解释器逐条执行字节码
2. 热点检测：循环/函数调用超过阈值
3. 记录 Trace：记录执行路径
4. 编译优化：将 Trace 编译为机器码
5. 后续执行：直接运行机器码

### JIT 状态控制

```lua
jit.on()        -- 开启 JIT
jit.off()       -- 关闭 JIT
jit.flush()     -- 清除所有已编译的代码

-- 对单个函数控制
jit.off(func)   -- 关闭某函数的 JIT
jit.on(func)    -- 开启某函数的 JIT
```

### 查看编译信息

```lua
jit.status()    -- 返回 JIT 状态和优化级别
jit.version     -- LuaJIT 版本号
jit.arch        -- CPU 架构
jit.os          -- 操作系统
```

### 命令行调试

```bash
luajit -jbc script.lua       # 输出字节码
luajit -jv script.lua        # 输出 JIT 详细信息
luajit -jdump script.lua     # 输出 Trace 信息
luajit -jp script.lua        # 性能剖析
```

## Trace 编译

### Trace 条件

- 循环执行次数超过阈值（默认 56 次）
- 函数被调用次数超过阈值

### Trace 优化

- **常量折叠**：编译期计算常量表达式
- **死代码消除**：移除不可达代码
- **内联**：小函数内联展开
- **循环展开**：减少循环开销
- **类型特化**：根据运行时类型生成特化代码

### JIT 退出（NYI）

某些 Lua 特性不支持 JIT 编译，会导致 Trace 中断：

- `loadstring` / `load`
- `debug.sethook`
- `string.dump`
- `pairs`（部分情况）
- `__gc` 元方法
- 协程切换

```lua
-- 避免 NYI 导致 JIT 退出
-- 不好的写法
for k, v in pairs(t) do ... end

-- 好的写法（数值索引）
for i = 1, #t do local v = t[i] ... end
```

## 性能优化

### 数据结构选择

```lua
-- 数组部分：连续整数索引，JIT 可优化
local arr = {1, 2, 3, 4, 5}

-- 哈希部分：字符串/非连续索引，JIT 优化有限
local dict = {name = "test", value = 42}
```

### 避免的操作

```lua
-- 避免动态创建闭包（热路径中）
-- 不好的写法
for i = 1, 1000000 do
    local f = function() return i end
end

-- 好的写法
local function f(i) return i end
for i = 1, 1000000 do
    f(i)
end
```

### 数值类型

```lua
-- LuaJIT 使用双精度浮点数 + 整数优化
-- 整数运算不会溢出为浮点数（LuaJIT 特有）
local n = 0
for i = 1, 1000000 do
    n = n + 1    -- 整数加法，JIT 优化
end
```

### FFI 替代 C 绑定

```lua
-- FFI 调用比传统 C 绑定快得多
local ffi = require("ffi")
ffi.cdef[[
    int abs(int x);
    double sin(double x);
]]

print(ffi.C.abs(-42))    -- 直接调用 C 函数
print(ffi.C.sin(3.14))
```

## 与标准 Lua 的差异

| 特性 | Lua 5.1 | LuaJIT |
|------|---------|--------|
| 执行方式 | 解释执行 | JIT 编译 |
| 性能 | 基准 | 10-100x |
| FFI | 无 | 有 |
| 位运算 | 无（需库） | 内置 |
| 整数运算 | 浮点 | 真整数 |
| 最大内存 | 受限 | ~2GB（64位更多） |
| GoTo | 无 | 有 |
| Table 长度 | `#` 运算符 | 同 + 优化 |

## 64 位支持

LuaJIT 在 64 位系统上有两种模式：

- **LJ_GC64**：64 位 GC 对象引用，支持更大内存
- **默认模式**：47 位地址空间，约 128TB

```bash
# 编译 LJ_GC64 模式
make XCFLAGS='-DLUAJIT_ENABLE_GC64'
```
