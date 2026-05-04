# LuaGo

用 Go 语言实现 Lua 解释器/虚拟机。

## 核心模块

### Lua Chunk 文件

Lua 源码编译后的二进制格式（`luac -o` 输出）。

```
Header（18字节）:
  - 签名：\x1bLua
  - 版本号
  - 格式标识
  - 平台信息（大小端/int 大小/size_t 大小等）

Function Block:
  - 源文件名
  - 行号信息
  - 指令列表（32位定长指令）
  - 常量表（nil/bool/number/string）
  - 局部变量表
  - Upvalue 表
  - 子函数原型
```

### 指令集

Lua 5.x 使用 32 位定长指令，共 47 条：

| 模式 | 位布局 | 说明 |
|------|--------|------|
| iABC | B:9 C:9 A:8 Op:6 | 三元操作 |
| iABx | Bx:18 A:8 Op:6 | 双操作数（无符号） |
| iAsBx | sBx:18 A:8 Op:6 | 双操作数（有符号） |

### 虚拟机实现

```go
type VM struct {
    stack   []Value
    pc      int
    proto   *Prototype
    globals map[string]Value
}

func (vm *VM) run() {
    for vm.pc < len(vm.proto.Code) {
        inst := vm.proto.Code[vm.pc]
        op := inst & 0x3F
        switch op {
        case OP_ADD:
            a, b, c := inst>>6&0xFF, inst>>23&0x1FF, inst>>14&0x1FF
            vm.stack[a] = vm.stack[b] + vm.stack[c]
        }
        vm.pc++
    }
}
```

### 关键挑战

- GC 实现（标记-清除 / 三色标记）
- 协程（yield/resume 状态保存）
- 闭包与 Upvalue 管理
- 元表（metatable）机制
