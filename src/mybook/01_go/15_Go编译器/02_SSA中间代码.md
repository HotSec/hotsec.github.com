# SSA 中间代码

> 参考：《Go语言高级编程（第2版）》第5章

SSA（Static Single Assignment，静态单赋值）是 Go 编译器的核心中间表示。SSA 形式的代码中，每个变量只被赋值一次，这种特性使得许多编译器优化更容易实现。

---

## 一、SSA 基础概念

### 1.1 什么是 SSA

SSA 的核心规则：**每个变量只被赋值一次**

普通代码：
```go
x = 1
x = 2
y = x
```

SSA 形式：
```
x1 = 1
x2 = 2
y1 = x2
```

### 1.2 SSA 的优势

```
┌─────────────────────────────────────────────────────────────┐
│                      SSA 优势                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 简化数据流分析                                          │
│     • 每个 def 只有一个 use                                 │
│     • 无需追踪变量的多次赋值                                 │
│                                                             │
│  2. 便于优化                                                │
│     • 常量传播：直接替换                                     │
│     • 死代码消除：无 use 即可删除                            │
│     • 公共子表达式消除：值编号                               │
│                                                             │
│  3. 高效的寄存器分配                                        │
│     • 变量生命周期清晰                                       │
│     • 干扰图构建简单                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 φ 函数

在控制流汇合点，需要 φ 函数来选择正确的值：

```go
if condition {
    x = 1
} else {
    x = 2
}
y = x
```

SSA 形式：
```
if condition {
    x1 = 1
} else {
    x2 = 2
}
x3 = φ(x1, x2)  // 根据来源选择 x1 或 x2
y1 = x3
```

---

## 二、Go SSA 结构

### 2.1 Value 类型

```go
type Value struct {
    ID       ID
    Op       Op
    Type     Type
    Aux      Aux
    Args     []*Value
    Block    *Block
    Pos      src.XPos
    Uses     int
    AuxInt   int64
    
    // 寄存器分配信息
    Reg      register
    RegArgs  []*Value
}
```

### 2.2 Block 类型

```go
type Block struct {
    ID        ID
    Kind      BlockKind
    Succs     []*Block
    Preds     []*Block
    Values    []*Value
    
    // SSA 生成信息
    Likely    BranchLikely
    Live      []*Value
}
```

Block 类型：

```go
const (
    BlockInvalid BlockKind = iota
    BlockDead
    BlockPlain
    BlockIf
    BlockDefer
    BlockReturn
    BlockExit
    BlockRetJmp
    BlockCall
    BlockFirst
)
```

### 2.3 Func 结构

```go
type Func struct {
    Name      string
    Type      *types.Type
    Blocks    []*Block
    Entry     *Block
    Bblks     []*Block
    
    // 寄存器分配
    RegAlloc  []regAlloc
    NumRegs   int
    
    // 优化信息
    FreeValues *Value
    FreeBlocks *Block
}
```

---

## 三、SSA 生成过程

### 3.1 从 AST 到 SSA

```go
func (s *state) expr(n *Node) *ssa.Value {
    switch n.Op {
    case OLITERAL:
        return s.constVal(n)
        
    case ONAME:
        return s.lookupVar(n)
        
    case OADD:
        a := s.expr(n.Left)
        b := s.expr(n.Right)
        return s.newValue2(ssa.OpAdd64, types.Int64, a, b)
        
    case OCALLFUNC:
        return s.call(n)
        
    case OIF:
        return s.ifStmt(n)
        
    case OFOR:
        return s.forStmt(n)
    }
}
```

### 3.2 示例：简单函数

Go 代码：
```go
func add(a, b int) int {
    return a + b
}
```

生成的 SSA：

```
func add(a int, b int) int:
  b1:
    v1 = Arg <int> {a}
    v2 = Arg <int> {b}
    v3 = Add64 <int> v1 v2
    Ret v3

name a: v1
name b: v2
```

### 3.3 示例：条件分支

Go 代码：
```go
func max(a, b int) int {
    if a > b {
        return a
    }
    return b
}
```

生成的 SSA：

```
func max(a int, b int) int:
  b1:
    v1 = Arg <int> {a}
    v2 = Arg <int> {b}
    v3 = Greater64 <bool> v1 v2
    If v3 → b2 b3

  b2:
    Ret v1

  b3:
    Ret v2

name a: v1
name b: v2
```

---

## 四、SSA 优化 Pass

### 4.1 优化 Pass 列表

```go
var passes = [...]pass{
    {name: "number lines", fn: numberLines},
    {name: "early phielim", fn: phielim},
    {name: "early copyelim", fn: copyelim},
    {name: "early deadcode", fn: deadcode},
    {name: "short circuit", fn: shortcircuit},
    {name: "decompose user", fn: decomposeUser},
    {name: "opt", fn: opt},
    {name: "zero arg cse", fn: cse},
    {name: "opt deadcode", fn: deadcode},
    {name: "generic cse", fn: cse},
    {name: "inline", fn: inline},
    {name: "dse", fn: dse},
    {name: "automainline", fn: autoInline},
    {name: "all deadcode", fn: deadcode},
    {name: "tighten tuple selectors", fn: tightenTupleSelectors},
    {name: "lower", fn: lower},
    {name: "addressing modes", fn: addressingModes},
    {name: "late lower", fn: lateLower},
    {name: "lowered cse", fn: cse},
    {name: "lowered deadcode", fn: deadcode},
    {name: "check bce", fn: checkbce},
    {name: "branchelim", fn: branchelim},
    {name: "critical", fn: critical},
    {name: "likelyadjust", fn: likelyadjust},
    {name: "layout", fn: layout},
    {name: "schedule", fn: schedule},
    {name: "late nilcheck", fn: lateNilcheck},
    {name: "flagalloc", fn: flagalloc},
    {name: "regalloc", fn: regalloc},
    {name: "loop rotate", fn: loopRotate},
    {name: "stackframe", fn: stackframe},
    {name: "trim", fn: trim},
}
```

### 4.2 常量传播

```go
func constProp(v *Value) {
    if v.Op == OpPhi {
        allConst := true
        var c *Value
        for _, arg := range v.Args {
            if arg.Op != OpConst64 {
                allConst = false
                break
            }
            if c == nil {
                c = arg
            } else if arg.AuxInt != c.AuxInt {
                allConst = false
                break
            }
        }
        if allConst && c != nil {
            v.reset(OpConst64)
            v.AuxInt = c.AuxInt
        }
    }
}
```

### 4.3 死代码消除

```go
func deadcode(f *Func) {
    for {
        changed := false
        
        for _, b := range f.Blocks {
            var newValues []*Value
            for _, v := range b.Values {
                if v.Uses > 0 || v.Op == OpCall || v.Op == OpDefer {
                    newValues = append(newValues, v)
                } else {
                    changed = true
                    for _, arg := range v.Args {
                        arg.Uses--
                    }
                }
            }
            b.Values = newValues
        }
        
        if !changed {
            break
        }
    }
}
```

### 4.4 公共子表达式消除

```go
func cse(f *Func) {
    values := make(map[string]*Value)
    
    for _, b := range f.Blocks {
        for _, v := range b.Values {
            key := v.key()
            if existing, ok := values[key]; ok {
                v.reset(OpCopy)
                v.AddArg(existing)
            } else {
                values[key] = v
            }
        }
    }
}

func (v *Value) key() string {
    var sb strings.Builder
    sb.WriteString(v.Op.String())
    sb.WriteString(v.Type.String())
    for _, arg := range v.Args {
        sb.WriteString(fmt.Sprintf("_%d", arg.ID))
    }
    return sb.String()
}
```

---

## 五、查看 SSA

### 5.1 使用 GOSSAFUNC

```bash
GOSSAFUNC=main go build main.go
```

这会生成 `ssa.html` 文件，可以用浏览器打开，查看每个优化 pass 的结果。

### 5.2 使用 -S 标志

```bash
go build -gcflags="-S" main.go 2>&1 | less
```

### 5.3 使用 go tool compile

```bash
go tool compile -S main.go
```

### 5.4 SSA 可视化示例

```go
package main

func sum(n int) int {
    total := 0
    for i := 0; i < n; i++ {
        total += i
    }
    return total
}

func main() {
    println(sum(10))
}
```

```bash
GOSSAFUNC=sum go build main.go
open ssa.html
```

SSA 优化过程：

```
start:
  v1 = Arg <int> {n}
  v2 = Const64 <int> [0]
  v3 = Const64 <int> [0]
  Jump → b2

b2:
  v4 = Phi <int> v3 v8  // total
  v5 = Phi <int> v2 v9  // i
  v6 = Less64 <bool> v5 v1
  If v6 → b3 b4

b3:
  v7 = Add64 <int> v4 v5
  v8 = Add64 <int> v7 v2  // total += i
  v9 = Add64 <int> v5 v2  // i++
  Jump → b2

b4:
  Ret v4
```

---

## 六、SSA 优化技巧

### 6.1 边界检查消除

```go
func sumSlice(s []int) int {
    total := 0
    for i := 0; i < len(s); i++ {
        total += s[i]
    }
    return total
}
```

编译器会自动消除 `s[i]` 的边界检查，因为 `i < len(s)` 已经保证了安全性。

### 6.2 循环不变量外提

```go
func process(data []int, scale int) int {
    total := 0
    for i := range data {
        total += data[i] * scale * scale
    }
    return total
}
```

优化后：

```go
func process(data []int, scale int) int {
    total := 0
    scale2 := scale * scale  // 外提
    for i := range data {
        total += data[i] * scale2
    }
    return total
}
```

### 6.3 强度削减

```go
func pow2(n int) int {
    return n * 2
}
```

优化为：

```go
func pow2(n int) int {
    return n << 1  // 乘法变位移
}
```

---

## 七、SSA 与性能优化

### 7.1 理解优化决策

通过查看 SSA，可以理解编译器为什么没有进行某些优化：

```go
func noInline() int {
    return 42
}

func main() {
    for i := 0; i < 100; i++ {
        noInline()
    }
}
```

查看 SSA 会发现 `noInline` 没有被内联，可能是因为：
- 函数太复杂
- 有 `//go:noinline` 指令
- 在单独的包中

### 7.2 指导代码编写

```go
func bad(s []int) int {
    var total int
    for i := 0; i < len(s); i++ {
        total += s[i]
    }
    return total
}

func good(s []int) int {
    var total int
    for _, v := range s {
        total += v
    }
    return total
}
```

通过 SSA 可以看到 `range` 形式生成的代码更简洁。

---

## 八、总结

SSA 是 Go 编译器的核心中间表示，理解 SSA 有助于：

1. **理解编译器优化**：查看优化 pass 的效果
2. **性能调优**：分析为什么某些代码没有被优化
3. **调试问题**：查看编译器生成的中间代码
4. **学习编译原理**：理解现代编译器的实现
