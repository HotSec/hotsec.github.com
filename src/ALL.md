# 知识点总结

---

## 一、Go

### 1.1 语言基础

#### 基础语法

<details>
<summary>介绍与环境搭建</summary>

- Go 历史：2007年设计，2009年开源，2012年 Go 1.0
- 设计哲学：追求简单、原生并发、面向工程
- 开发环境：安装、GOPATH/GOROOT、IDE配置


> [📄 01_介绍与环境搭建.md](./mybook/01_go/01_语言基础/01_介绍与环境搭建.md)
</details>

<details>
<summary>入门示例</summary>

- Hello World
- 基本程序结构
- 编译运行


> [📄 02_入门示例.md](./mybook/01_go/01_语言基础/02_入门示例.md)
</details>

<details>
<summary>数据类型</summary>

- 基本类型：int8~int64/uint8~uint64/float32/float64/complex64/complex128/bool/string/byte/rune
- 类型转换（强制显式转换）/ strconv 系列
- 数组：定义/初始化/遍历/多维数组/值类型特性
- 切片详解：定义/长度容量/切片表达式/make/本质(SliceHeader)/append/copy/删除元素/避免内存泄漏
- 映射详解：定义/基本操作/判断键/遍历/delete/有序遍历/元素为map的切片/值为切片的map/并发安全(sync.Map)
- 类型别名：type NewType OldType vs type Alias = OldType


> [📄 03_数据类型.md](./mybook/01_go/01_语言基础/03_数据类型.md)
</details>

<details>
<summary>变量、常量与运算符</summary>

- var / := 短变量声明 / 批量声明 / 匿名变量 _
- 常量与 iota：枚举/跳过值/中间插队/数量级定义
- 运算符：算术/关系/逻辑/位(&|^&^<</>>)/赋值/优先级


> [📄 04_变量常量与运算符.md](./mybook/01_go/01_语言基础/04_变量常量与运算符.md)
</details>


<details>
<summary>控制语句</summary>

- if / for / switch（默认不穿透/fallthrough）/ select
- defer / panic / recover
- goto / break(标签) / continue
- **range over func**：自定义迭代器（Go 1.23+）
- **loopvar 语义调整**：循环变量作用域修复（Go 1.22+）


> [📄 05_控制语句.md](./mybook/01_go/01_语言基础/05_控制语句.md)
</details>

<details>
<summary>函数</summary>

- 多返回值、命名返回值、可变参数(...语法)
- 高阶函数：函数作为参数/返回值
- 匿名函数与闭包（捕获变量引用）
- defer 详解：LIFO/参数确定时机/执行时机/修改返回值
- 内置函数：len/cap/append/copy/delete/new/make/close/panic/recover


> [📄 06_函数.md](./mybook/01_go/01_语言基础/06_函数.md)
</details>

<details>
<summary>结构体与方法</summary>

- 结构体详解：自定义类型/实例化/构造函数/匿名字段(嵌入)/嵌套/JSON序列化Tag
- 方法接收者选择（值接收者 vs 指针接收者）
- 方法继承与重写


> [📄 07_结构体与方法.md](./mybook/01_go/01_语言基础/07_结构体与方法.md)
</details>

<details>
<summary>组合与继承</summary>

- 结构体嵌入
- 方法提升
- 组合 vs 继承


> [📄 08_组合与继承.md](./mybook/01_go/01_语言基础/08_组合与继承.md)
</details>

<details>
<summary>接口</summary>

- 隐式实现
- 类型断言与 type switch
- 空接口 interface{}
- nil 接口陷阱
- 接口设计模式


> [📄 09_接口.md](./mybook/01_go/01_语言基础/09_接口.md)
</details>

<details>
<summary>泛型</summary>

- 泛型函数与泛型类型
- 类型约束（interface 约束）
- 与反射的区别与适用场景
- 标准库泛型容器：cmp / slices / maps（Go 1.21+）


> [📄 10_泛型.md](./mybook/01_go/01_语言基础/10_泛型.md)
</details>

<details>
<summary>指针、make 与 new</summary>

- & / * 操作，Go 指针不能运算
- 指针传值：值传递 vs 指针传递
- 指针使用场景：修改外部变量/避免大结构体拷贝/修改接收者
- new：分配零值返回指针
- make：只用于 slice/map/chan，返回初始化后的引用


> [📄 11_指针-make-new.md](./mybook/01_go/01_语言基础/11_指针-make-new.md)
</details>

<details>
<summary>错误处理</summary>

- error 接口
- panic & recover
- errors.Is / errors.As / fmt.Errorf + %w


> [📄 12_错误处理.md](./mybook/01_go/01_语言基础/12_错误处理.md)
</details>

<details>
<summary>包与模块</summary>

- 包定义/标识符可见性(大写导出/小写私有)/包引入/别名导入/空白导入
- init 函数：执行顺序/多个 init/注册驱动
- go mod 包管理
- 常用命令：go mod init/tidy/download/vendor/graph/why
- GOPROXY 模块代理
- 私有仓库配置（GOPRIVATE/GONOSUMCHECK）
- Go Workspace（go.work）：多模块开发


> [📄 13_包与模块.md](./mybook/01_go/01_语言基础/13_包与模块.md)
</details>

<details>
<summary>类型系统</summary>

- 类型断言
- type switch
- 底层类型


> [📄 14_类型系统.md](./mybook/01_go/01_语言基础/14_类型系统.md)
</details>

<details>
<summary>反射基础</summary>

- reflect.Type / reflect.Value
- 反射三定律
- 结构体反射：NumField/Field/Tag.Get
- 动态调用方法
- 性能注意事项


> [📄 15_反射基础.md](./mybook/01_go/01_语言基础/15_反射基础.md)
</details>

<details>
<summary>unsafe 与内存对齐</summary>

- unsafe.Pointer 四大规则
- unsafe.Sizeof/Offsetof/Alignof
- 内存对齐规则
- 字段顺序优化


> [📄 16_unsafe与内存对齐.md](./mybook/01_go/01_语言基础/16_unsafe与内存对齐.md)
</details>

#### 工程实践

<details>
<summary>测试</summary>

- 单元测试（go test）/ 子测试(t.Run) / 表驱动测试
- 覆盖率：-cover/-covermode/-coverprofile
- 性能/基准测试（Benchmark）
- 模糊测试（Fuzzing）
- Mock 接口：手动 Mock / gomock


> [📄 17_测试.md](./mybook/01_go/01_语言基础/17_测试.md)
</details>

<details>
<summary>项目结构与规范</summary>

- gofmt 格式化
- 标识符命名规范（驼峰、导出规则）
- 推荐项目目录结构


> [📄 18_项目结构与规范.md](./mybook/01_go/01_语言基础/18_项目结构与规范.md)
</details>

<details>
<summary>内部实现原理</summary>

- **Slice 内部**：reflect.SliceHeader（Data/Len/Cap）；扩容策略
- **String 内部**：reflect.StringHeader（Data/Len）
- **Interface 内部**：eface / iface；itab 缓存
- **Channel 内部**：hchan 结构
- **Map 内部**：hmap 结构；渐进式扩容
- **defer 内部**：_defer 结构链表；开放编码优化


> [📄 19_内部实现原理.md](./mybook/01_go/01_语言基础/19_内部实现原理.md)
</details>

<details>
<summary>设计模式</summary>

- 函数选项模式（Functional Options）
- 单例模式：sync.Once
- 工厂模式
- 策略模式
- 装饰器模式
- 构建者模式


> [📄 20_设计模式.md](./mybook/01_go/01_语言基础/20_设计模式.md)
</details>

<details>
<summary>版本新特性</summary>

- **Go 1.18**：泛型/模糊测试/工作区模式/Any 别名
- **Go 1.21**：slog 结构化日志/slices/maps/cmp 标准库/min-max 内建
- **Go 1.22**：range over integer/循环变量语义修复
- **Go 1.23**：iterator 支持（range over func）
- **Go 1.24**：弱指针/finalizer 改进/工具链管理
- **Go 1.25**：Container-aware GOMAXPROCS/实验性 GreenTea GC
- **Go 1.26**：new(expr) 表达式初始化/GreenTea GC 默认启用


> [📄 21_版本新特性.md](./mybook/01_go/01_语言基础/21_版本新特性.md)
</details>

<details>
<summary>CGO 编程</summary>

- 快速入门：最简 CGO 程序、调用 C 标准库、分离 C 代码、用 Go 实现 C 函数、面向 C 接口编程
- CGO 基础：`import "C"` 规则、CGO_ENABLED 环境变量、C 代码放置方式、CGO 中的 Go 代码限制
- 类型转换：数值类型(C.int/C.double)、字符串(CString/C.GoString)、切片与 C 数组、结构体与联合体、枚举、指针与 void*、数组
- 函数调用：Go 调 C（直接调用）、C 调 Go（//export 导出）、回调函数、函数指针
- 内部机制：CGO 生成中间文件、Go 调 C 桥接流程、C 调 Go 桥接流程、CGO 调用性能开销
- 实战：封装 qsort（简单封装/类型安全封装/通用排序封装）
- CGO 内存模型：Go 访问 C 内存、C 临时访问 Go 内存、C 长期持有 Go 指针、runtime.Pinner（Go 1.21+）、导出 C 函数不能返回 Go 内存
- C++ 类封装：C++ 类到 Go 对象、Go 对象到 C++ 类、彻底解放 C++ this 指针
- 静态库和动态库：源码直接使用、链接静态库/动态库、pkg-config、导出 C 静态库/动态库
- 编译和链接参数：编译参数(CFLAGS/CXXFLAGS)、链接参数(LDFLAGS)、条件编译、${SRCDIR} 变量、CGO 编译流程
- 性能优化：减少 CGO 调用次数、避免频繁内存分配、减少类型转换、CGO 与 Goroutine
- 常见陷阱：CString 内存泄漏、Go 指针传入 C 后被移动、线程安全、交叉编译困难、构建缓存失效
- 调试技巧：查看 CGO 生成代码、环境变量(GODEBUG/CGO_CFLAGS)、常见编译错误


> [📄 22_CGO编程.md](./mybook/01_go/01_语言基础/22_CGO编程.md)
</details>

<details>
<summary>Go 汇编语言</summary>

- 快速入门：从 Go 代码看汇编输出、用汇编实现函数、编译与运行
- 计算机结构：冯·诺伊曼体系结构、指令执行流程、寄存器、内存层次
- 常量和全局变量：常量声明、全局变量、GLOBL 指令、DATA 指令、用 Go 定义变量
- 函数：定义语法(TEXT)、函数标志(NOSPLIT/NOSPLIT)、伪寄存器(FP/PC/SB/SP)、参数与返回值访问、局部变量、调用其他函数、宏函数
- 控制流：顺序执行、if/goto 跳转、for 循环
- 再论函数：栈分裂(stack split)、递归函数、闭包、可变参数
- 汇编语言的威力：系统调用、从汇编调用 C 函数、AVX2 高级指令(SIMD)、原子操作
- 例子：获取 Goroutine ID（runtime.stack/直接访问 g 结构体/getg()）
- Delve 调试器：安装、基本使用、常用命令、调试汇编代码
- 常用指令速查：数据移动(MOVQ/MOVL)、算术运算(ADDQ/SUBQ/IMULQ)、逻辑与移位、浮点运算、比较与跳转
- 条件编译：文件名后缀(_amd64.s/_arm64.s)、Build Tag
- 常见陷阱：栈分裂遗漏、参数大小计算错误、寄存器保存、Go 汇编与 Plan 9 汇编差异


> [📄 23_Go汇编语言.md](./mybook/01_go/01_语言基础/23_Go汇编语言.md)
</details>

### 1.2 并发编程

#### 调度模型

<details>
<summary>GMP 调度模型</summary>

- G（Goroutine）M（Machine/OS线程）P（Processor/逻辑处理器）
- P 的价值：限制并发数、本地队列减少锁竞争
- m0（主线程）g0（调度 goroutine）
- M 寻找 G 的流程
- 调度策略


> [📄 04_GMP调度模型.md](./mybook/01_go/02_并发编程/04_GMP调度模型.md)
</details>

#### 并发原语

<details>
<summary>Goroutine</summary>

- Goroutine 轻量线程（~2KB 栈）
- goroutine 生命周期
- goroutine 泄漏排查


> [📄 01_Goroutine.md](./mybook/01_go/02_并发编程/01_Goroutine.md)
</details>

<details>
<summary>Channel</summary>

- Channel：无缓冲/有缓冲
- 方向（只读/只写/双向）
- 关闭 channel 注意点
- 常见模式


> [📄 02_Channel.md](./mybook/01_go/02_并发编程/02_Channel.md)
</details>

<details>
<summary>select 详解</summary>

- select 多路复用
- 超时控制
- 非阻塞操作
- 常见模式


> [📄 03_select详解.md](./mybook/01_go/02_并发编程/03_select详解.md)
</details>

<details>
<summary>并发原语</summary>

- Mutex / RWMutex
- WaitGroup / Once
- atomic 原子操作


> [📄 05_并发原语.md](./mybook/01_go/02_并发编程/05_并发原语.md)
</details>

<details>
<summary>Context</summary>

- 作用：超时控制、取消传播、值传递
- Background / WithCancel / WithTimeout / WithDeadline / WithValue
- 原理与最佳实践


> [📄 06_Context.md](./mybook/01_go/02_并发编程/06_Context.md)
</details>

<details>
<summary>并发安全与竞态检测</summary>

- 竞态条件（Race Condition）
- go run -race 检测
- Go 内存模型
- Happens-Before 关系


> [📄 07_并发安全与竞态检测.md](./mybook/01_go/02_并发编程/07_并发安全与竞态检测.md)
</details>

#### 并发模式

<details>
<summary>并发编程模式</summary>

- 生产者-消费者模式
- Worker Pool（工作池）
- 扇出/扇入模式
- Pipeline 模式
- 发布订阅模型


> [📄 08_并发模式详解.md](./mybook/01_go/02_并发编程/08_并发模式详解.md)
</details>

<details>
<summary>协程池</summary>

- 手动实现协程池
- ants 等第三方库


> [📄 09_协程池.md](./mybook/01_go/02_并发编程/09_协程池.md)
</details>

<details>
<summary>errgroup</summary>

- errgroup 基本用法
- WithContext 自动取消
- SetLimit 并发控制
- 与 sync.WaitGroup 对比


> [📄 10_errgroup.md](./mybook/01_go/02_并发编程/10_errgroup.md)
</details>

<details>
<summary>限流与熔断</summary>

- 限流算法（令牌桶、漏桶）
- golang.org/x/time/rate
- 熔断器模式


> [📄 11_限流与熔断.md](./mybook/01_go/02_并发编程/11_限流与熔断.md)
</details>

<details>
<summary>conc 并发库</summary>

- pool(并发池)/stream(流式)/iter(迭代器)
- 泛型支持
- 对比 errgroup


> [📄 12_conc并发库.md](./mybook/01_go/02_并发编程/12_conc并发库.md)
</details>

<details>
<summary>网络 IO 并发模型</summary>

- BIO / NIO / IO多路复用
- Go netpoller
- 网络编程模式


> [📄 13_网络IO并发模型.md](./mybook/01_go/02_并发编程/13_网络IO并发模型.md)
</details>

### 1.3 内存管理

#### 内存分配

<details>
<summary>内存分配原理</summary>

- Go 内存模型（happens-before）
- 对象分配流程（微小对象 → mcache → mcentral → mheap）
- 内存分配器设计


> [📄 01_内存分配原理.md](./mybook/01_go/03_内存管理/01_内存分配原理.md)
</details>

<details>
<summary>栈内存管理</summary>

- 栈增长与收缩
- 连续栈
- 栈拷贝


> [📄 02_栈内存管理.md](./mybook/01_go/03_内存管理/02_栈内存管理.md)
</details>

#### 垃圾回收

<details>
<summary>GC 垃圾回收</summary>

- 三色并发标记算法
- 触发时机（内存翻倍 / 定时 / 手动 runtime.GC()）
- GC 优化策略
- Go 1.25+ GreenTea GC


> [📄 03_GC垃圾回收.md](./mybook/01_go/03_内存管理/03_GC垃圾回收.md)
</details>

<details>
<summary>混合写屏障</summary>

- 演进：Dijkstra 插入屏障 → Yuasa 删除屏障 → 混合写屏障
- 4 条规则（栈上不开启写屏障）
- 三色不变式


> [📄 04_混合写屏障.md](./mybook/01_go/03_内存管理/04_混合写屏障.md)
</details>

#### 内存分析与逃逸

<details>
<summary>内存逃逸分析</summary>

- 逃逸原因（返回指针、接口、闭包、大对象）
- 检测方法：go build -gcflags="-m"
- 如何避免逃逸


> [📄 05_内存逃逸分析.md](./mybook/01_go/03_内存管理/05_内存逃逸分析.md)
</details>

<details>
<summary>内存泄漏排查</summary>

- 常见泄漏场景：goroutine 泄漏、无限增长切片、未关闭资源
- pprof 内存分析
- 排查流程与案例


> [📄 06_内存泄漏排查实战.md](./mybook/01_go/03_内存管理/06_内存泄漏排查实战.md)
</details>

### 1.4 标准库

#### 基础包

<details>
<summary>fmt 格式化</summary>

- Printf 占位符：%v/%+v/%#v/%T/%%
- 整数：%d/%b/%o/%x/%X/%c/%U
- 浮点：%f/%.2f/%e/%E/%g
- 字符串：%s/%q/%x
- 宽度精度：%5d/%-5d/%05d/%8.2f
- Sprint/Sprintf/Fprint/Fprintf


> [📄 fmt.md](./mybook/01_go/04_标准库/01_基础/fmt.md)
</details>

<details>
<summary>time 时间包</summary>

- 时间获取：Now()/Year()/Month()/Unix()/UnixMilli()
- 格式化：Format("2006-01-02 15:04:05")/Parse()
- 时间计算：Add/Sub/Before/After/Equal
- 定时器：Timer/Ticker/Sleep/After
- Duration：常量(Nanosecond~Hour)/方法(Seconds/Milliseconds)


> [📄 time.md](./mybook/01_go/04_标准库/01_基础/time.md)
</details>

<details>
<summary>strconv / flag</summary>

- strconv：Atoi/Itoa/ParseBool/ParseInt/ParseFloat/FormatBool/FormatInt/FormatFloat
- flag：StringVar/IntVar/BoolVar/Parse/子命令(NewFlagSet)


> [📄 strconv.md](./mybook/01_go/04_标准库/01_基础/strconv.md) · [📄 flag.md](./mybook/01_go/04_标准库/01_基础/flag.md)
</details>

#### I/O与文件

<details>
<summary>io 与 bufio</summary>

- io.Reader / io.Writer 接口
- bufio 缓冲读写
- io.Copy / io.ReadAll / io.TeeReader


> [📄 io与bufio.md](./mybook/01_go/04_标准库/02_IO与文件/io与bufio.md)
</details>

<details>
<summary>文件操作（os/io）</summary>

- 读取：Open/Read/ReadFile/bufio.Scanner
- 写入：Create/Write/WriteFile/OpenFile(追加)
- 文件信息：Stat/Name/Size/IsDir/Mode/ModTime
- 目录：Mkdir/MkdirAll/Remove/RemoveAll/ReadDir/Walk
- 临时文件：MkdirTemp/CreateTemp


> [📄 文件操作.md](./mybook/01_go/04_标准库/02_IO与文件/文件操作.md)
</details>

<details>
<summary>html/template 模板</summary>

- 基本语法：{{.}}/{{.Field}}/管道
- 条件：if/else/end
- 循环：range/else
- with：切换上下文
- 自定义变量：{{$x := .Name}}
- 比较函数：eq/ne/lt/le/gt/ge
- 自定义函数：FuncMap
- 模板嵌套：define/template
- 从文件加载：ParseGlob/ParseFiles
- 安全处理：自动转义/template.HTML


> [📄 template.md](./mybook/01_go/04_标准库/02_IO与文件/template.md)
</details>

#### 网络

<details>
<summary>net/http 标准库</summary>

- HTTP 客户端/服务端
- Handler/HandlerFunc
- 中间件模式
- 文件服务
- 优雅关闭


> [📄 http标准库.md](./mybook/01_go/04_标准库/03_网络/http标准库.md)
</details>

<details>
<summary>net/url URL处理</summary>

- URL 解析与构建
- Query 参数处理
- URL 编码解码


> [📄 net-url.md](./mybook/01_go/04_标准库/03_网络/net-url.md)
</details>

<details>
<summary>httprouter</summary>

- 高性能路由
- 路由参数
- 路由优先级


> [📄 httprouter.md](./mybook/01_go/04_标准库/03_网络/httprouter.md)
</details>

#### 编码与反射

<details>
<summary>encoding/json 详解</summary>

- Marshal/Unmarshal
- Tag 选项：json:"name"/omitempty/-/-,
- 自定义 JSON：MarshalJSON/UnmarshalJSON
- json.RawMessage：延迟解析
- 流式编解码：Encoder/Decoder
- map 与 slice 的 JSON 处理
- 数字精度：UseNumber
- 空切片 vs nil 的 JSON 差异


> [📄 json.md](./mybook/01_go/04_标准库/04_编码与反射/json.md)
</details>

<details>
<summary>reflect 反射</summary>

- TypeOf/ValueOf/Kind
- 结构体反射：NumField/Field/Tag.Get/NumMethod
- 修改值：Elem/Set/CanSet
- 动态调用方法：MethodByName/Call
- 应用场景：ORM/配置解析/验证/序列化
- 注意事项：性能/类型安全/可维护性


> [📄 reflect.md](./mybook/01_go/04_标准库/04_编码与反射/reflect.md)
</details>

#### 并发与同步

<details>
<summary>sync 详解</summary>

- Mutex / RWMutex
- WaitGroup / Once
- Map / Pool / Cond


> [📄 sync详解.md](./mybook/01_go/04_标准库/05_并发与同步/sync详解.md)
</details>

<details>
<summary>atomic 原子操作</summary>

- 原子操作：Add/Load/Store/Swap/CompareAndSwap
- atomic.Value


> [📄 atomic详解.md](./mybook/01_go/04_标准库/05_并发与同步/atomic详解.md)
</details>

<details>
<summary>singleflight</summary>

- 防缓存击穿
- Do/DoChan/Forget


> [📄 singleflight.md](./mybook/01_go/04_标准库/05_并发与同步/singleflight.md)
</details>

#### 系统与信号

<details>
<summary>context 详解</summary>

- 设计理念：取消信号/超时控制/值传递
- 创建：Background/TODO/WithCancel/WithTimeout/WithDeadline/WithValue
- 传播规则：子取消不影响父/父取消级联子
- 最佳实践：第一个参数/不传nil/不存结构体/defer cancel
- 常见模式：HTTP请求超时/数据库查询超时/优雅关闭


> [📄 context.md](./mybook/01_go/04_标准库/06_系统与信号/context.md)
</details>

<details>
<summary>os/signal 信号处理</summary>

- signal.Notify
- 优雅关机基础


> [📄 os-signal.md](./mybook/01_go/04_标准库/06_系统与信号/os-signal.md)
</details>

<details>
<summary>embed 嵌入文件</summary>

- Go 1.16 嵌入文件
- embed.FS
- 静态资源打包


> [📄 embed.md](./mybook/01_go/04_标准库/06_系统与信号/embed.md)
</details>

#### 日志

<details>
<summary>log 标准日志</summary>

- 标准库 log
- 基本日志输出


> [📄 log.md](./mybook/01_go/04_标准库/07_日志/log.md)
</details>

### 1.5 第三方库

#### 配置管理

<details>
<summary>Viper 配置管理</summary>

- 读取配置文件：SetConfigName/AddConfigPath/ReadInConfig
- 读取配置值：Get/GetString/GetInt/嵌套key
- 默认值：SetDefault
- 绑定结构体：Unmarshal + mapstructure tag
- 环境变量：AutomaticEnv/SetEnvPrefix/BindEnv
- 命令行参数：BindPFlag
- 热更新：WatchConfig/OnConfigChange
- 写入配置：WriteConfig/SafeWriteConfig


> [📄 viper.md](./mybook/01_go/05_第三方库/01_配置管理/viper.md)
</details>

#### 数据库

<details>
<summary>GORM</summary>

- 安装连接/连接池配置
- 模型定义：gorm tag(primarykey/type/not null/index/uniqueIndex/default)
- 自动迁移：AutoMigrate
- CRUD：Create/First/Find/Where/Update/Updates/Delete
- 关联：Preload/Joins/foreignKey
- 事务：Transaction
- GORM Gen：类型安全ORM/代码生成


> [📄 gorm.md](./mybook/01_go/05_第三方库/02_数据库/gorm.md)
</details>

<details>
<summary>sqlx 数据库操作</summary>

- 连接：sqlx.Connect/Connect设置
- 查询：Get/Select/Queryx/StructScan/MapScan
- 增删改：Exec/NamedExec/批量插入
- 事务：Beginx/Commit/Rollback/BeginTxFunc
- 结构体映射：db tag


> [📄 sqlx.md](./mybook/01_go/05_第三方库/02_数据库/sqlx.md)
</details>

<details>
<summary>Go 操作 Redis</summary>

- go-redis 连接/配置
- 5大类型：String(SET/GET/INCR)/Hash(HSET/HGET/HGETALL)/List(LPush/RPush/LPop)/Set(SAdd/SMembers)/SortedSet(ZAdd/ZRange/ZScore)
- Pipeline：批量操作
- Lua 脚本：NewScript/Run
- 分布式锁：SetNX + Lua 释放
- 发布订阅：Subscribe/Publish


> [📄 redis.md](./mybook/01_go/05_第三方库/02_数据库/redis.md)
</details>

<details>
<summary>Go 操作 MongoDB</summary>

- mongo-driver 连接
- CRUD：InsertOne/InsertMany/FindOne/Find/UpdateOne/UpdateMany/DeleteOne/DeleteMany
- 聚合管道：Aggregate/$match/$group/$sort/$limit
- 索引：Indexes().CreateOne/CreateMany


> [📄 mongodb.md](./mybook/01_go/05_第三方库/02_数据库/mongodb.md)
</details>

<details>
<summary>ClickHouse</summary>

- Go 客户端：clickhouse-go（原生 TCP 协议）/ ch-go（高性能底层驱动）
- 连接与配置：DSN 连接串/连接池/压缩/超时/SSL
- 批量写入：Batch 模式/异步写入/缓冲区刷新策略
- 查询：Query/QueryRow/QueryContext 上下文控制
- 数据类型映射：DateTime/Decimal/Array/LowCardinality/Nullable
- 表引擎：MergeTree（核心）/ ReplacingMergeTree（去重）/ SummingMergeTree（预聚合）/ Distributed（分布式）
- 分区与排序键：PARTITION BY / ORDER BY（稀疏索引）
- 物化视图：自动聚合/增量更新
- 集群与副本：ReplicatedMergeTree + Distributed + ZooKeeper 协调


> [📄 ClickHouse.md](./mybook/01_go/05_第三方库/02_数据库/ClickHouse.md)
</details>

<details>
<summary>分库分表</summary>

- 分库分表策略
- 中间件选择
- 数据迁移


> [📄 分库分表.md](./mybook/01_go/05_第三方库/02_数据库/分库分表.md)
</details>

#### 消息队列

<details>
<summary>Go 操作 Kafka / NSQ / RabbitMQ</summary>

- **Kafka**：kafka-go/Writer(生产)/Reader(消费)/ConsumerGroup/管理操作
- **NSQ**：go-nsq/Producer(Publish)/Consumer(AddHandler)/nsqlookupd发现
- **RabbitMQ**：amqp091-go/工作队列/发布订阅(Fanout)/路由(Direct)/主题(Topic)


> [📄 kafka.md](./mybook/01_go/05_第三方库/03_消息队列/kafka.md) · [📄 nsq.md](./mybook/01_go/05_第三方库/03_消息队列/nsq.md) · [📄 rabbitmq.md](./mybook/01_go/05_第三方库/03_消息队列/rabbitmq.md)
</details>

#### 日志

<details>
<summary>Zap 日志库</summary>

- Logger/SugaredLogger
- 自定义配置
- Gin 集成
- lumberjack 日志轮转


> [📄 zap.md](./mybook/01_go/05_第三方库/04_日志/zap.md)
</details>

#### 命令行

<details>
<summary>Cobra CLI 开发</summary>

- 命令结构：Command/Use/Short/Long/Run
- 子命令：AddCommand
- 标志：PersistentFlags/Flags/IntP/StringP
- 必填标志：MarkFlagRequired
- 生命周期：PreRun/Run/PostRun
- 脚手架：cobra-cli


> [📄 cobra.md](./mybook/01_go/05_第三方库/05_命令行/cobra.md)
</details>

#### 验证与文档

<details>
<summary>validator 参数校验</summary>

- 常用标签：required/omitempty/min/max/len/gte/lte/email/url/ip/oneof
- 跨字段验证：eqfield/nefield/gtfield
- 自定义验证器：RegisterValidation
- 中文错误信息：locales/ut/translations
- Gin 集成：binding tag


> [📄 validator.md](./mybook/01_go/05_第三方库/06_验证与文档/validator.md)
</details>

<details>
<summary>Swagger</summary>

- swag init
- 主入口注解
- 接口注解(@Summary/@Param/@Success/@Router)
- Gin 集成


> [📄 swagger.md](./mybook/01_go/05_第三方库/06_验证与文档/swagger.md)
</details>

#### 缓存

<details>
<summary>gache 缓存库</summary>

- 本地缓存
- 缓存策略


> [📄 gache.md](./mybook/01_go/05_第三方库/07_缓存/gache.md)
</details>

#### 系统工具

<details>
<summary>gopsutil 系统监控</summary>

- CPU：使用率/核心数/时间统计/per-CPU 信息
- 内存：虚拟内存/交换内存/总量/可用/使用率
- 磁盘：分区信息/使用率/IO 统计（读写次数/字节/时间）
- 网络：接口信息/连接统计/IO 计数器（字节/包/错误）
- 进程：列表/详情/CPU/内存/连接/线程/环境变量
- 主机信息：hostname/uptime/操作系统/平台/用户列表
- 传感器：温度/风扇转速（Linux 支持）


> [📄 gopsutil.md](./mybook/01_go/05_第三方库/08_系统工具/gopsutil.md)
</details>

<details>
<summary>gopkg 常用工具</summary>

- 字节跳动开源 Go 工具包
- retry：指数退避重试/最大次数/可重试错误判断
- limit：并发限制器/令牌桶
- goroutine：安全 Go 启动/recovery 捕获 panic
- slice/shuffle/collection 等工具函数


> [📄 gopkg.md](./mybook/01_go/05_第三方库/08_系统工具/gopkg.md) · [📄 XPath.md](./mybook/01_go/05_第三方库/08_系统工具/XPath.md)
</details>

#### 开发工具

<details>
<summary>Air 热重载</summary>

- 热重载
- air init
- .air.toml 配置
- Docker 中使用


> [📄 air.md](./mybook/01_go/05_第三方库/09_开发工具/air.md)
</details>

### 1.6 Web框架

#### Web框架

<details>
<summary>Gin</summary>

- 路由系统：参数路由、路由组、路由优先级
- 参数绑定与验证（ShouldBind / MustBind / 自定义验证器）
- 中间件（全局/局部/洋葱模型）
- 请求响应处理（统一响应格式、异步、流式）
- 文件操作（上传/下载/静态文件）
- Cookie & Session、JWT 认证
- GORM 集成
- 安全：CSRF/XSS/SQL注入防护
- 性能优化：对象复用、gzip、连接池
- 优雅关闭与重启 / Swagger / WebSocket / SSE


> [📄 01_Gin.md](./mybook/01_go/06_Web框架/01_Gin.md)
</details>

<details>
<summary>go-zero</summary>

- goctl 代码生成：API / RPC
- ServiceContext 依赖注入
- 内置中间件：限流（tokenlimit）、熔断（breaker）、超时
- 缓存系统：Redis + 防击穿
- 数据库：模型生成 + CRUD + 事务
- 错误码统一规范 / 分布式锁 / 定时任务
- 部署：Docker / K8s / 微服务拆分


> [📁 02_go-zero/](./mybook/01_go/06_Web框架/02_go-zero/)

**详细文档**：
> [📄 01_快速入门.md](./mybook/01_go/06_Web框架/02_go-zero/01_快速入门.md) · [📄 02_API服务开发.md](./mybook/01_go/06_Web框架/02_go-zero/02_API服务开发.md) · [📄 03_RPC服务开发.md](./mybook/01_go/06_Web框架/02_go-zero/03_RPC服务开发.md) · [📄 04_数据库操作.md](./mybook/01_go/06_Web框架/02_go-zero/04_数据库操作.md) · [📄 05_配置与日志.md](./mybook/01_go/06_Web框架/02_go-zero/05_配置与日志.md) · [📄 06_缓存系统.md](./mybook/01_go/06_Web框架/02_go-zero/06_缓存系统.md) · [📄 07_中间件与拦截器.md](./mybook/01_go/06_Web框架/02_go-zero/07_中间件与拦截器.md) · [📄 08_服务治理.md](./mybook/01_go/06_Web框架/02_go-zero/08_服务治理.md) · [📄 09_错误处理.md](./mybook/01_go/06_Web框架/02_go-zero/09_错误处理.md) · [📄 10_常用功能.md](./mybook/01_go/06_Web框架/02_go-zero/10_常用功能.md) · [📄 11_部署与运维.md](./mybook/01_go/06_Web框架/02_go-zero/11_部署与运维.md)
</details>

<details>
<summary>GoFrame</summary>

- **GoFrame**：企业级 Go Web 框架，模块化设计（路由/ORM/缓存/配置/日志）
- **架构**：分层设计（Controller → Service → DAO），依赖注入/中间件
- **ORM**：gdb，支持 SQLite/MySQL/PostgreSQL，链式操作/事务/模型关联
- **缓存**：gcache，支持多种模式（LRU/LFU/超期），内存/Redis 适配器
- **配置**：gcfg，支持 YAML/TOML/INI，自动合并环境配置
- **工具**：gf CLI 代码生成工具，自动化目录结构/CRUD 生成
- **实例**：OmniWire 项目（WireGuard VPN + 端口转发网关）


> [📄 04_GoFrame.md](./mybook/01_go/06_Web框架/04_GoFrame.md)
</details>

<details>
<summary>框架对比</summary>

| 维度 | Gin | go-zero |
|------|-----|---------|
| 定位 | 轻量 HTTP 框架 | 微服务全家桶 |
| API定义 | 代码路由 | .api DSL + goctl |
| 服务治理 | 需自建 | 内置限流/熔断/降级 |
| RPC | 无 | 内置 gRPC |
| 适用 | 中小型API | 大型微服务体系 |


> [📄 10_框架对比.md](./mybook/01_go/06_Web框架/10_框架对比.md)
</details>

#### RPC与网络

<details>
<summary>gRPC</summary>

- 四种通信模式：Unary / Server Streaming / Client Streaming / Bidirectional
- 拦截器（一元/流式/拦截器链）
- 错误处理（标准错误码）与超时传播
- 安全：TLS / Token / mTLS
- 负载均衡 / 健康检查
- 性能优化：连接复用、压缩、参数调优
- 调试：grpcurl / grpcui / 反射
- gRPC vs REST 对比


> [📄 03_gRPC.md](./mybook/01_go/06_Web框架/03_gRPC.md)
</details>

<details>
<summary>Zinx</summary>

- **Zinx**：轻量 TCP 并发服务器框架
- **gnet**：高性能、轻量级网络框架（Go）；基于 epoll/kqueue 实现；支持 TCP/UDP/Unix Domain Socket；Event-Driven 架构；适用：TCP/UDP 服务器、端口转发网关、代理服务


> [📄 05_zinx.md](./mybook/01_go/06_Web框架/05_zinx.md)
</details>

#### 服务发现

<details>
<summary>etcd</summary>

- 分布式 KV
- 分布式锁
- WAL / BoltDB
- 高可用集群


> [📄 08_etcd.md](./mybook/01_go/06_Web框架/08_etcd.md)
</details>

<details>
<summary>Consul 服务注册与发现</summary>

- 服务注册：AgentServiceRegistration/健康检查
- 服务发现：Health().Service()
- KV 存储：Put/Get
- 健康检查：HTTP/TCP/gRPC
- 注销服务：ServiceDeregister


> [📄 09_consul.md](./mybook/01_go/06_Web框架/09_consul.md)
</details>

#### 依赖注入

<details>
<summary>Wire & 依赖注入</summary>

- **Wire**：Google 出品的编译时依赖注入框架；Provider/Set/Injector/Build
- 与运行时 DI 框架（dig/fx）对比：编译时检查 vs 运行时反射
- 适用场景：大型项目结构化初始化


> [📄 07_Wire依赖注入.md](./mybook/01_go/06_Web框架/07_Wire依赖注入.md)
</details>

#### 微服务

<details>
<summary>Go kit 微服务</summary>

- 代码分层：Service(业务逻辑)/Endpoint(端点)/Transport(传输)
- 中间件模式：日志/指标/链路追踪
- 支持 HTTP/gRPC 传输


> [📄 06_go-kit.md](./mybook/01_go/06_Web框架/06_go-kit.md)
</details>

### 1.7 性能优化

#### 编码优化

<details>
<summary>编码层面优化</summary>

- strings.Builder / bytes.Buffer 拼接
- 切片/Map 预分配容量
- 减少内存分配，避免逃逸到堆


> [📄 01_编码层面优化.md](./mybook/01_go/07_性能优化/01_编码层面优化.md)
</details>

<details>
<summary>并发优化</summary>

- errgroup 并发 / Worker Pool
- 连接池配置 / 批量操作 / 查询优化
- 多级缓存（本地 + Redis）/ singleflight 防击穿


> [📄 02_并发优化.md](./mybook/01_go/07_性能优化/02_并发优化.md)
</details>

#### 性能分析

<details>
<summary>性能分析工具</summary>

- pprof（CPU/Mem/Goroutine/Block）
- 火焰图
- go test -bench


> [📄 03_性能分析工具.md](./mybook/01_go/07_性能优化/03_性能分析工具.md)
</details>

<details>
<summary>trace 与火焰图</summary>

- trace 详解
- 火焰图解读


> [📄 04_trace与火焰图.md](./mybook/01_go/07_性能优化/04_trace与火焰图.md)
</details>

<details>
<summary>基准测试与压测</summary>

- benchmark
- 压测工具(wrk/hey/vegeta)


> [📄 05_基准测试与压测.md](./mybook/01_go/07_性能优化/05_基准测试与压测.md)
</details>

<details>
<summary>优化实战案例</summary>

- 综合优化案例


> [📄 06_优化实战案例.md](./mybook/01_go/07_性能优化/06_优化实战案例.md)
</details>

### 1.8 可观测性

#### 可观测性

<details>
<summary>日志规范与结构化日志</summary>

- slog/zap 规范
- 日志级别策略


> [📄 01_日志规范与结构化日志.md](./mybook/01_go/08_可观测性/01_日志规范与结构化日志.md)
</details>

<details>
<summary>OpenTelemetry</summary>

- TracerProvider/Span
- 属性/事件/错误记录
- HTTP(gin)集成/gRPC集成


> [📄 03_OpenTelemetry可观测性.md](./mybook/01_go/08_可观测性/03_OpenTelemetry可观测性.md)
</details>

<details>
<summary>Jaeger 链路追踪</summary>

- 部署(all-in-one)
- Go 集成
- 采样策略(AlwaysSample/TraceIDRatioBased)
- Web UI


> [📄 02_Jaeger链路追踪.md](./mybook/01_go/08_可观测性/02_Jaeger链路追踪.md)
</details>

<details>
<summary>Prometheus 指标监控</summary>

- Counter/Gauge/Histogram/Summary
- Gin 中间件
- PromQL 查询


> [📄 04_Prometheus指标监控.md](./mybook/01_go/08_可观测性/04_Prometheus指标监控.md)
</details>

<details>
<summary>可观测性实战</summary>

- 三大支柱整合
- 生产实践


> [📄 05_可观测性实战.md](./mybook/01_go/08_可观测性/05_可观测性实战.md)
</details>

### 1.9 分布式与微服务

#### 分布式基础

<details>
<summary>分布式基础理论</summary>

- ACID / CAP / BASE / Paxos / Raft
- 分布式一致性：强一致/最终一致/因果一致
- 分布式时钟：Lamport 时钟 / 向量时钟
- Gossip 协议 / 一致性哈希 / 虚拟节点


> [📄 01_分布式基础理论.md](./mybook/01_go/09_分布式与微服务/01_分布式基础理论.md)
</details>

<details>
<summary>服务注册与发现</summary>

- etcd/consul 整合
- 服务注册
- 健康检查


> [📄 02_服务注册与发现.md](./mybook/01_go/09_分布式与微服务/02_服务注册与发现.md)
</details>

<details>
<summary>分布式锁</summary>

- Redis 锁
- etcd 锁
- zookeeper 锁


> [📄 03_分布式锁.md](./mybook/01_go/09_分布式与微服务/03_分布式锁.md)
</details>

<details>
<summary>分布式事务</summary>

- 2PC / TCC / Saga
- 本地消息表


> [📄 04_分布式事务.md](./mybook/01_go/09_分布式与微服务/04_分布式事务.md)
</details>

<details>
<summary>分布式 ID 生成</summary>

- UUID
- 雪花算法
- Leaf


> [📄 05_分布式ID生成.md](./mybook/01_go/09_分布式与微服务/05_分布式ID生成.md)
</details>

<details>
<summary>配置中心</summary>

- etcd 配置
- nacos/apollo


> [📄 06_配置中心.md](./mybook/01_go/09_分布式与微服务/06_配置中心.md)
</details>

<details>
<summary>API 网关</summary>

- 网关模式
- 认证/限流/路由


> [📄 07_API网关.md](./mybook/01_go/09_分布式与微服务/07_API网关.md)
</details>

<details>
<summary>优雅关机与重启</summary>

- signal.Notify
- srv.Shutdown
- 超时控制
- SIGHUP 信号处理


> [📄 08_优雅关机与重启.md](./mybook/01_go/09_分布式与微服务/08_优雅关机与重启.md)
</details>

### 1.10 安全专题

#### 安全专题

<details>
<summary>TLS 与 HTTPS</summary>

- 证书
- TLS 握手
- Go TLS 配置


> [📄 01_TLS与HTTPS.md](./mybook/01_go/10_安全专题/01_TLS与HTTPS.md)
</details>

<details>
<summary>JWT 认证</summary>

- JWT
- OAuth2
- Session


> [📄 02_JWT认证.md](./mybook/01_go/10_安全专题/02_JWT认证.md)
</details>

<details>
<summary>SBOM 软件物料清单</summary>

- 标准格式：SPDX / CycloneDX
- 生成工具：Syft / Trivy
- 各语言生成 / CI/CD 集成 / 漏洞扫描（Grype / Trivy）


> [📄 03_SBOM软件物料清单.md](./mybook/01_go/10_安全专题/03_SBOM软件物料清单.md)
</details>

<details>
<summary>国密算法与证书</summary>

- SM2（非对称） / SM3（哈希） / SM4（对称）
- 国密证书格式与 TLS 握手流程 / GM/T 标准体系
- 实战：生成国密证书、SM4 加解密


> [📄 04_国密算法与证书.md](./mybook/01_go/10_安全专题/04_国密算法与证书.md)
</details>

<details>
<summary>常见安全漏洞与防护</summary>

- SQL 注入
- XSS
- CSRF
- 命令注入


> [📄 05_常见安全漏洞与防护.md](./mybook/01_go/10_安全专题/05_常见安全漏洞与防护.md)
</details>

### 1.11 工具与部署

#### 工具链

<details>
<summary>开发工具链</summary>

- go build / fmt / vet / lint / generate
- golangci-lint


> [📄 01_开发工具链.md](./mybook/01_go/11_工具与部署/01_开发工具链.md)
</details>

<details>
<summary>性能调试工具</summary>

- pprof / trace / gctrace


> [📄 02_性能调试工具.md](./mybook/01_go/11_工具与部署/02_性能调试工具.md)
</details>

<details>
<summary>交叉编译与构建优化</summary>

- CGO 交叉编译
- UPX 压缩
- 构建缓存


> [📄 03_交叉编译与构建优化.md](./mybook/01_go/11_工具与部署/03_交叉编译与构建优化.md)
</details>

#### 部署

<details>
<summary>Docker 部署</summary>

- Dockerfile 编写
- docker-compose
- 多阶段构建


> [📄 04_Docker部署.md](./mybook/01_go/11_工具与部署/04_Docker部署.md)
</details>

<details>
<summary>Kubernetes 部署</summary>

- Deployment / Service / ConfigMap
- Helm Chart


> [📄 05_Kubernetes部署.md](./mybook/01_go/11_工具与部署/05_Kubernetes部署.md)
</details>

<details>
<summary>CI/CD 实践</summary>

- GitHub Actions
- GitLab CI


> [📄 06_CI-CD实践.md](./mybook/01_go/11_工具与部署/06_CI-CD实践.md)
</details>

### 1.12 开源项目学习

#### 开源项目

<details>
<summary>项目列表</summary>

- **K3s**：源码分析（编译/运行/build/server/agent/核心依赖）
- **K8s**：Pod/Node/Service/Deployment/CNI/CSI/CRI/Scheduling Framework
- **Gin-vue-admin** / **Gin-api**
- **Packetbeat**：流量捕获与流程
- **KSV** 虚拟化 / **Memos** 笔记
- **监控面板**


> [📁 12_开源项目学习/](./mybook/01_go/12_开源项目学习/)

**详细文档**：
> [📄 02_k8s.md](./mybook/01_go/12_开源项目学习/02_k8s.md) · [📄 03_gin-vue-admin.md](./mybook/01_go/12_开源项目学习/03_gin-vue-admin.md) · [📄 04_gin-api.md](./mybook/01_go/12_开源项目学习/04_gin-api.md) · [📄 05_packetbeat.md](./mybook/01_go/12_开源项目学习/05_packetbeat.md) · [📄 06_监控面板.md](./mybook/01_go/12_开源项目学习/06_监控面板.md) · [📄 07_ksv.md](./mybook/01_go/12_开源项目学习/07_ksv.md) · [📄 08_memos.md](./mybook/01_go/12_开源项目学习/08_memos.md) · [📄 01_k3s/01_简介与安装.md](./mybook/01_go/12_开源项目学习/01_k3s/01_简介与安装.md) · [📄 01_k3s/02_源码笔记-入口.md](./mybook/01_go/12_开源项目学习/01_k3s/02_源码笔记-入口.md) · [📄 01_k3s/03_源码笔记-依赖.md](./mybook/01_go/12_开源项目学习/01_k3s/03_源码笔记-依赖.md) · [📄 01_k3s/04_源码笔记-server.md](./mybook/01_go/12_开源项目学习/01_k3s/04_源码笔记-server.md)
</details>

### 1.13 常见陷阱与最佳实践

#### 陷阱与最佳实践

<details>
<summary>语言陷阱</summary>

- 短变量声明
- for-range
- string
- break


> [📄 01_语言陷阱.md](./mybook/01_go/13_常见陷阱与最佳实践/01_语言陷阱.md)
</details>

<details>
<summary>并发陷阱</summary>

- goroutine 泄漏
- 竞态
- 死锁


> [📄 02_并发陷阱.md](./mybook/01_go/13_常见陷阱与最佳实践/02_并发陷阱.md)
</details>

<details>
<summary>内存陷阱</summary>

- 切片
- Map
- 内存泄漏


> [📄 03_内存陷阱.md](./mybook/01_go/13_常见陷阱与最佳实践/03_内存陷阱.md)
</details>

<details>
<summary>编码规范与最佳实践</summary>

- Effective Go
- 代码审查 checklist


> [📄 04_编码规范与最佳实践.md](./mybook/01_go/13_常见陷阱与最佳实践/04_编码规范与最佳实践.md)
</details>

<details>
<summary>速查手册</summary>

- Go 知识点总结


> [📄 05_速查手册.md](./mybook/01_go/13_常见陷阱与最佳实践/05_速查手册.md)
</details>

### 1.14 Go运行时

#### 运行时概览

<details>
<summary>运行时概览</summary>

- 运行时架构：调度器、内存分配器、垃圾收集器、网络轮询器
- 运行时启动流程：schedinit → mallocinit → gcinit → main
- sysmon 系统监控：死锁检测、强制 GC、抢占调度
- 运行时调试：GODEBUG 环境变量、pprof、trace


> [📄 01_运行时概览.md](./mybook/01_go/14_Go运行时/01_运行时概览.md)
</details>

#### 调度器

<details>
<summary>调度器深入</summary>

- GMP 数据结构：g、m、p、schedt
- G 状态：_Gidle/_Grunnable/_Grunning/_Gsyscall/_Gwaiting/_Gdead
- 调度流程：schedule → runqget → globrunqget → netpoll → stealWork → execute
- 工作窃取：runqsteal、窃取一半策略
- 系统调用处理：entersyscall、exitsyscall
- 抢占式调度：基于信号（SIGURG）、基于函数调用
- LockOSThread：绑定 G 到 M


> [📄 02_调度器深入.md](./mybook/01_go/14_Go运行时/02_调度器深入.md)
</details>

#### 内存分配器

<details>
<summary>内存分配器</summary>

- TCMalloc 思想：线程本地缓存、多级分配
- 核心结构：mspan、mcache、mcentral、mheap
- 对象分类：微对象(<16B)、小对象(16B~32KB)、大对象(>32KB)
- 分配流程：mallocgc → mcache → mcentral → mheap
- 内存回收：mspan.free、mcentral.uncacheSpan、mheap.freeSpan
- 内存碎片：内部碎片、外部碎片


> [📄 03_内存分配器.md](./mybook/01_go/14_Go运行时/03_内存分配器.md)
</details>

#### 垃圾收集器

<details>
<summary>垃圾收集器</summary>

- GC 演进：标记-清除 → 并发标记 → 三色并发标记 → 混合写屏障
- 三色标记：白色（未标记）、灰色（待扫描）、黑色（存活）
- 三色不变式：强三色、弱三色
- 混合写屏障：Dijkstra 插入屏障 + Yuasa 删除屏障
- GC 周期：标记准备(STW) → 并发标记 → 标记终止(STW)
- GC 触发：堆内存触发、时间触发、手动触发
- GOGC：堆增长率控制
- Go 1.19+ Soft Memory Limit
- Go 1.25+ GreenTea GC（实验性分代 GC）


> [📄 04_垃圾收集器.md](./mybook/01_go/14_Go运行时/04_垃圾收集器.md)
</details>

#### 网络轮询器

<details>
<summary>网络轮询器</summary>

- 设计目标：非阻塞 I/O、高并发网络
- 核心结构：pollDesc、pollCache
- 平台实现：epoll(Linux)、kqueue(macOS)、IOCP(Windows)
- 工作流程：非阻塞读取 → 挂起 G → 注册 epoll → 唤醒 G
- 与调度器集成：schedule、sysmon、findrunnable
- 定时器与截止时间：SetDeadline、SetReadDeadline、SetWriteDeadline


> [📄 05_网络轮询器.md](./mybook/01_go/14_Go运行时/05_网络轮询器.md)
</details>

#### 运行时性能分析

<details>
<summary>运行时性能分析</summary>

- pprof：CPU/Heap/Goroutine/Block/Mutex 分析
- trace：Goroutine 调度、GC 活动、系统调用追踪
- GODEBUG：gctrace、schedtrace、allocfreetrace
- runtime.MemStats：内存统计
- runtime/metrics：运行时指标
- 性能优化流程：基准 → 分析 → 定位 → 优化 → 验证


> [📄 06_运行时性能分析.md](./mybook/01_go/14_Go运行时/06_运行时性能分析.md)
</details>

### 1.15 序列化与RPC

#### Protobuf

<details>
<summary>Protobuf</summary>

- Protobuf 简介：二进制序列化、跨语言、强类型
- Proto 文件语法：message、enum、service、oneof、map、repeated
- 字段类型：double/float/int32/int64/string/bytes 等
- 代码生成：protoc、buf 工具
- 序列化：proto.Marshal/Unmarshal
- JSON 转换：protojson.Marshal/Unmarshal
- 高级特性：Any、Timestamp、Duration、FieldMask
- 最佳实践：字段编号规划、向后兼容更新


> [📄 01_Protobuf.md](./mybook/01_go/05_第三方库/10_序列化与RPC/01_Protobuf.md)
</details>

#### RPC

<details>
<summary>RPC 入门</summary>

- RPC 概述：远程过程调用原理
- RPC vs REST API：动作导向 vs 资源导向
- Go 标准库 RPC：net/rpc、net/rpc/jsonrpc
- 方法规则：func (t *T) MethodName(args T1, reply *T2) error
- 自定义 RPC 框架：Server、Client、连接池
- RPC 进阶：连接管理、超时控制、服务发现、负载均衡
- RPC 与 gRPC：HTTP/2、Protobuf、流式传输


> [📄 02_RPC入门.md](./mybook/01_go/05_第三方库/10_序列化与RPC/02_RPC入门.md)
</details>

### 1.16 Go编译器

#### 编译器概览

<details>
<summary>编译器概览</summary>

- 编译流程：词法分析 → 语法分析 → 类型检查 → 语义分析 → SSA生成 → 优化 → 代码生成 → 链接
- 编译器入口：cmd/compile
- 编译阶段详解：Token、AST、类型信息、IR、SSA、汇编代码、可执行文件
- 词法分析：Token类型、Scanner实现
- 语法分析：AST节点类型、Parser实现
- 查看编译器输出：AST、SSA、汇编代码
- 编译器优化：内联优化、逃逸分析、边界检查消除
- 编译器扩展：自定义分析工具、编译器指令
- 编译器调试：编译器日志、性能分析、禁用优化


> [📄 01_编译器概览.md](./mybook/01_go/15_Go编译器/01_编译器概览.md)
</details>

#### SSA中间代码

<details>
<summary>SSA中间代码</summary>

- SSA基础概念：静态单赋值、优势、φ函数
- Go SSA结构：Value类型、Block类型、Func结构
- SSA生成过程：从AST到SSA、示例代码
- SSA优化Pass：常量传播、死代码消除、公共子表达式消除
- 查看SSA：GOSSAFUNC、-S标志、go tool compile
- SSA优化技巧：边界检查消除、循环不变量外提、强度削减
- SSA与性能优化：理解优化决策、指导代码编写


> [📄 02_SSA中间代码.md](./mybook/01_go/15_Go编译器/02_SSA中间代码.md)
</details>

#### 类型检查

<details>
<summary>类型检查</summary>

- 类型系统概览：基本类型、复合类型、引用类型、特殊类型
- 类型信息结构：Type、Array、Slice、Map、Struct、Func、Interface
- 类型检查过程：类型检查入口、表达式类型检查、函数调用类型检查
- 类型推断：常量类型推断、赋值类型推断、泛型类型推断
- 类型兼容性：类型一致性、可赋值性、接口实现检查
- 类型转换：显式类型转换、隐式类型转换
- 类型断言：类型断言检查、类型switch
- 泛型类型检查：类型参数约束、类型实例化


> [📄 03_类型检查.md](./mybook/01_go/15_Go编译器/03_类型检查.md)
</details>

#### 语义分析

<details>
<summary>语义分析</summary>

- 语义分析任务：作用域分析、变量捕获、逃逸分析、控制流检查、其他语义检查
- 作用域分析：作用域结构、作用域构建、标识符解析
- 变量捕获：闭包变量捕获、捕获示例、值捕获vs引用捕获
- 逃逸分析：逃逸分析原理、逃逸原因、逃逸分析示例、查看逃逸分析
- 控制流检查：break/continue检查、defer检查、return路径检查
- 初始化顺序：包初始化、初始化顺序示例
- 方法集计算：方法集、方法集规则


> [📄 04_语义分析.md](./mybook/01_go/15_Go编译器/04_语义分析.md)
</details>

#### 编译器优化实践

<details>
<summary>编译器优化实践</summary>

- 内联优化：内联决策、内联预算、控制内联、内联优化示例
- 逃逸分析优化：减少堆分配、接口逃逸、切片逃逸、查看逃逸分析
- 边界检查消除：BCE原理、BCE示例、帮助编译器
- 死代码消除：常量条件、未使用变量、未使用函数
- 循环优化：循环不变量外提、强度削减、循环展开
- 函数调用优化：尾调用优化、函数参数优化
- 内存布局优化：结构体字段对齐、热点字段前置、False Sharing避免
- 编译器指令：常用指令、使用场景
- 性能分析工具：查看汇编、查看SSA、性能对比
- 优化最佳实践：优化原则、常见优化模式、避免反模式


> [📄 05_编译器优化实践.md](./mybook/01_go/15_Go编译器/05_编译器优化实践.md)
</details>

### 1.17 WebAssembly

#### WebAssembly简介

<details>
<summary>WebAssembly简介</summary>

- WebAssembly概述：架构、特点、文本格式(WAT)
- Go与WebAssembly：Go WebAssembly支持、第一个程序、wasm_exec.js
- Go WebAssembly架构：运行时架构、内存模型
- syscall/js包：js.Value、js.Func、类型转换
- DOM操作：基本操作、事件处理、Canvas操作
- 网络请求：Fetch API、WebSocket
- Web Workers：Worker示例
- 调试技巧：使用println、使用console.log、错误处理
- 性能优化：减少Go↔JS边界切换、使用TypedArray、内存管理


> [📄 01_WebAssembly简介.md](./mybook/01_go/16_WebAssembly/01_WebAssembly简介.md)
</details>

#### WebAssembly进阶

<details>
<summary>WebAssembly进阶</summary>

- 外部函数接口(FFI)：从JavaScript调用Go函数、从Go调用JavaScript函数、回调函数
- WebAssembly虚拟机：Wasmtime运行时、Wasmer运行时、WASI
- WebAssembly插件系统：插件架构、MOSN WebAssembly插件、插件配置
- 导出Go函数：导出函数到WebAssembly、TinyGo导出
- 内存共享：共享内存、跨线程通信
- 性能优化：减少内存拷贝、批量操作、并行处理
- 调试与测试：单元测试、性能测试、调试工具
- 部署与集成：部署到CDN、集成到Web应用、服务端WebAssembly


> [📄 02_WebAssembly进阶.md](./mybook/01_go/16_WebAssembly/02_WebAssembly进阶.md)
</details>

---

## 二、C/C++

### 2.1 C语言教程

#### 语言基础

<details>
<summary>语言基础</summary>

- **Intro**：历史、特点、版本、编译流程、Hello World
- **Types**：字符/整数/浮点/布尔、signed/unsigned、sizeof、类型转换、可移植类型
- **Variable**：变量名、声明、赋值、作用域
- **Syntax**：语句、表达式、注释、printf/scanf
- **Operator**：算术/自增/关系/逻辑/位/逗号、优先级
- **Flow Control**：if/switch/while/for/break/continue/goto
- **Function**：main、参数传递、函数指针、extern/static/const、可变参数
- **Array**：长度、多维、变长、地址、指针加减法、函数参数
- **Pointer**：基本、运算、const 指针
- **String**：声明、strlen/strcpy/strcat/strcmp/sprintf
- **Struct**：复制、指针、嵌套、位字段、弹性成员
- **Union / Enum / Typedef**
- **Multifile**：extern/static、重复加载、编译策略、make
- **Preprocessor**：宏（有参/不定参/##）、条件编译（if/ifdef/ifndef）、预定义宏
- **Memory**：malloc/free/calloc/realloc、void指针、memcpy/memmove/memcmp
- **File**：fopen/fclose/fread/fwrite/fseek/ftell/fflush/EOF
- **Io**：printf/scanf/getchar/putchar
- **Multibyte**：Unicode/宽字符/多字节处理
- **Assert / Ctype / Errno / Locale / Signal / Time**
- **CLI**：命令行参数、退出状态、环境变量


> [📁 cpp/C语言教程/语言基础/](./mybook/03_cpp/01_C语言教程/01_语言基础/)

**详细文档**：
> [📄 intro.md](./mybook/03_cpp/01_C语言教程/01_语言基础/intro.md) · [📄 syntax.md](./mybook/03_cpp/01_C语言教程/01_语言基础/syntax.md) · [📄 variable.md](./mybook/03_cpp/01_C语言教程/01_语言基础/variable.md) · [📄 types.md](./mybook/03_cpp/01_C语言教程/01_语言基础/types.md) · [📄 operator.md](./mybook/03_cpp/01_C语言教程/01_语言基础/operator.md) · [📄 flow-control.md](./mybook/03_cpp/01_C语言教程/01_语言基础/flow-control.md) · [📄 function.md](./mybook/03_cpp/01_C语言教程/01_语言基础/function.md) · [📄 array.md](./mybook/03_cpp/01_C语言教程/01_语言基础/array.md) · [📄 pointer.md](./mybook/03_cpp/01_C语言教程/01_语言基础/pointer.md) · [📄 string.md](./mybook/03_cpp/01_C语言教程/01_语言基础/string.md) · [📄 struct.md](./mybook/03_cpp/01_C语言教程/01_语言基础/struct.md) · [📄 union.md](./mybook/03_cpp/01_C语言教程/01_语言基础/union.md) · [📄 enum.md](./mybook/03_cpp/01_C语言教程/01_语言基础/enum.md) · [📄 typedef.md](./mybook/03_cpp/01_C语言教程/01_语言基础/typedef.md) · [📄 memory.md](./mybook/03_cpp/01_C语言教程/01_语言基础/memory.md) · [📄 file.md](./mybook/03_cpp/01_C语言教程/01_语言基础/file.md) · [📄 io.md](./mybook/03_cpp/01_C语言教程/01_语言基础/io.md) · [📄 cli.md](./mybook/03_cpp/01_C语言教程/01_语言基础/cli.md) · [📄 multifile.md](./mybook/03_cpp/01_C语言教程/01_语言基础/multifile.md) · [📄 preprocessor.md](./mybook/03_cpp/01_C语言教程/01_语言基础/preprocessor.md) · [📄 multibyte.md](./mybook/03_cpp/01_C语言教程/01_语言基础/multibyte.md) · [📄 specifier.md](./mybook/03_cpp/01_C语言教程/01_语言基础/specifier.md)
</details>

#### 标准库

<details>
<summary>标准库</summary>

- **stdlib.h**：abs/div、字符串→数值、rand/srand、malloc/free、qsort/bsearch、atexit/system/getenv
- **stdio.h**：标准I/O、文件操作、fflush/setvbuf/perror
- **string.h**：strchr/strstr/strtok/memchr/memset/memcmp
- **time.h**：struct tm、time/ctime/localtime/asctime/strftime
- **math.h**：三角函数/指数/对数/fmod/round/ceil/floor
- **ctype.h / wchar.h / wctype.h / stdint.h / stddef.h / stdbool.h / stdarg.h**


> [📄 11_标准库.md](./mybook/04_lua/01_语言基础/11_标准库.md)

**详细文档**：
> [📄 stdio.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/stdio.h.md) · [📄 stdlib.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/stdlib.h.md) · [📄 string.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/string.h.md) · [📄 time.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/time.h.md) · [📄 math.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/math.h.md) · [📄 ctype.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/ctype.h.md) · [📄 assert.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/assert.h.md) · [📄 stdint.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/stdint.h.md) · [📄 stddef.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/stddef.h.md) · [📄 stdbool.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/stdbool.h.md) · [📄 stdarg.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/stdarg.h.md) · [📄 errno.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/errno.h.md) · [📄 signal.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/signal.h.md) · [📄 locale.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/locale.h.md) · [📄 float.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/float.h.md) · [📄 limits.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/limits.h.md) · [📄 iso646.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/iso646.h.md) · [📄 inttypes.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/inttypes.h.md) · [📄 wchar.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/wchar.h.md) · [📄 wctype.h.md](./mybook/03_cpp/01_C语言教程/02_标准库/wctype.h.md) · [📄 C笔记.md](./mybook/03_cpp/01_C语言教程/C笔记.md)
</details>

### 2.2 C++专题

#### 基础语法

<details>
<summary>基础语法</summary>

- 类与对象：构造/析构、初始化列表、this指针、const/static修饰、友元、运算符重载
- 继承、多态（虚函数/纯虚函数/编译期多态/运行时多态）
- 委托构造、命名空间（匿名命名空间/using声明与指令）、异常处理（标准异常类/自定义异常）
- 类型转换：static_cast/dynamic_cast/const_cast/reinterpret_cast
- 函数重载：重载规则/重载解析/重载二义性
- 引用：左值引用/右值引用/引用与指针区别
- 数组与指针：多维数组/指针数组与数组指针/函数指针/nullptr
- 字符串：C风格字符串 / std::string / Raw String (C++11) / 字符串转换
- 位运算：位运算符/常用操作/位域/位运算应用
- 文件与流：文件流类/读写/打开模式/二进制文件/流操纵符/字符串流/流状态


> [📄 C++MAP.md](./mybook/03_cpp/02_C++专题/02_基础语法/C++MAP.md)
</details>

#### 内存与模板

<details>
<summary>内存管理</summary>

- RAII（资源获取即初始化）
- 智能指针：unique_ptr / shared_ptr / weak_ptr
- 移动语义：左值/右值、右值引用、移动构造/移动赋值、std::move / std::forward
- 虚拟内存：分页/分段/VMA/内存映射


> [📄 1_内存管理.md](./mybook/03_cpp/02_C++专题/01_内存管理/1_内存管理.md)
</details>

<details>
<summary>模板</summary>

- 函数模板 / 类模板
- 模板特化 / 全特化 / 偏特化
- 可变参数模板 / 模板元编程


> [📄 1_模板.md](./mybook/03_cpp/02_C++专题/06_模板/1_模板.md)
</details>

#### 现代特性

<details>
<summary>现代C++特性</summary>

- constexpr 常量表达式
- 函数式编程：functor / lambda / 泛型lambda / bind / function
- Concepts 模板约束（C++20）
- Ranges（C++20）：Views / Adaptors / Projection
- Coroutines 协程（C++20）
- Modules 模块（C++20）：替代头文件，编译隔离，加速构建
- std::expected（C++23）：错误处理替代异常
- std::print / std::format（C++23/C++20）
- std::flat_map / std::flat_set（C++23）
- **C++11**：auto/range-for/lambda/move语义/智能指针/thread/atomic/constexpr/variadic template
- **C++14**：泛型lambda/返回类型推导/make_unique/[[deprecated]]
- **C++17**：结构化绑定/if constexpr/optional/variant/any/string_view/filesystem/parallel STL
- **C++20**：Concepts/Ranges/Coroutines/Modules/[[likely]]/std::format/span/source_location
- **C++23**：std::expected/std::print/std::flat_map/显式this参数(deducing this)/std::generator
- **C++26**（草案）：反射/契约/线性代数库/执行器


> [📄 1_C++11特性.md](./mybook/03_cpp/02_C++专题/07_现代特性/1_C++11特性.md) · [📄 2_C++14-17特性.md](./mybook/03_cpp/02_C++专题/07_现代特性/2_C++14-17特性.md) · [📄 3_C++20-23特性.md](./mybook/03_cpp/02_C++专题/07_现代特性/3_C++20-23特性.md)
</details>

#### 并发与STL

<details>
<summary>并发编程</summary>

- 线程管理（std::thread）：创建/join/detach/线程 ID/硬件并发度
- 同步原语：mutex / recursive_mutex / timed_mutex / condition_variable / shared_mutex / barrier / latch / semaphore
- 原子操作 atomic + 内存模型（memory_order_relaxed/acquire/release/seq_cst）
- Futures & Promises：std::future / std::promise / std::async / std::packaged_task
- 线程池设计 / 并行算法（C++17 执行策略）/ 无锁数据结构
- 多线程调试：data race / deadlock / live lock 检测


> [📄 1_并发编程.md](./mybook/03_cpp/02_C++专题/04_并发与STL/1_并发编程.md)
</details>

<details>
<summary>STL</summary>

- 容器：序列（vector/list/deque/array/forward_list）/ 关联（set/map/multiset/multimap）/ 无序（unordered_set/unordered_map）/ 适配器（stack/queue/priority_queue）
- 算法：sort / find / transform / accumulate / for_each / remove_if / unique / lower_bound / upper_bound
- 迭代器：Input/Output/Forward/Bidirectional/Random Access / 迭代器失效问题
- 函数对象：functor / lambda / std::function / std::bind


> [📄 1_STL详解.md](./mybook/03_cpp/02_C++专题/04_并发与STL/1_STL详解.md)
</details>

#### 工具与库

<details>
<summary>开发环境与工具</summary>

- CMake + vcpkg
- 编译器（GCC / Clang / MSVC）
- 构建系统 / 调试（GDB / LLDB / Valgrind）
- 代码分析（Clang-Tidy / Cppcheck）
- 包管理（vcpkg / Conan）
- 单元测试：Google Test / Catch2


> [📄 cmake-and-vcpkg.md](./mybook/03_cpp/02_C++专题/03_工具与库/cmake-and-vcpkg.md)
</details>

<details>
<summary>常用库</summary>

- **Qt**：跨平台 GUI 框架；信号槽机制/事件处理/MVC 架构/Qt Network/Qt SQL
- **OpenCV**：计算机视觉库；图像处理/特征检测/目标识别/视频分析
- **OpenSSL**：加密库；SSL/TLS/RSA/AES/证书管理/BIO
- **nlohmann/json**：现代 C++ JSON 库；序列化/反序列化/SAX 解析
- **gRPC**：高性能 RPC 框架；Protobuf 序列化/四种通信模式
- **ZeroMQ**：高性能异步消息库；多种模式（Pub-Sub/Req-Rep/Push-Pull）
- 日志库：log4cpp / spdlog（推荐）
- 编码与本地化：icu / codecvt
- **Boost**：C++ 准标准库；asio（异步I/O）/ beast（HTTP/WebSocket）/ filesystem/program_options
- **abseil**：Google 基础库；strings/time/container/status
- **Folly**：Facebook 基础库；高性能数据结构/并发/字符串


> [📁 cpp/C++专题/工具与库/](./mybook/03_cpp/02_C++专题/03_工具与库/)

**详细文档**：
> [📄 Boost.md](./mybook/03_cpp/02_C++专题/03_工具与库/Boost.md) · [📄 Qt.md](./mybook/03_cpp/02_C++专题/03_工具与库/Qt.md) · [📄 OpenCV.md](./mybook/03_cpp/02_C++专题/03_工具与库/OpenCV.md) · [📄 zeromq.md](./mybook/03_cpp/02_C++专题/03_工具与库/zeromq.md)
</details>

#### 底层与安全

<details>
<summary>未定义行为 & 内存安全</summary>

- 常见未定义行为：悬空指针/越界访问/有符号溢出/空指针解引用/数据竞争/未初始化变量
- ASan（地址消毒器）/ MSan（内存消毒器）/ TSan（线程消毒器）/ UBSan
- RAII 原则与所有权语义
- 内存映射文件（mmap/CreateFileMapping）


> [📄 1_未定义行为与内存安全.md](./mybook/03_cpp/02_C++专题/05_底层与安全/1_未定义行为与内存安全.md)
</details>

<details>
<summary>汇编 & 调用约定</summary>

- 内联汇编 / 常见指令
- 调用约定：cdecl / stdcall / fastcall
- 函数名修饰规则


> [📄 2_汇编与调用约定.md](./mybook/03_cpp/02_C++专题/05_底层与安全/2_汇编与调用约定.md)
</details>

---

## 三、Python

### 3.1 语言基础

#### 核心语法

<details>
<summary>核心语法</summary>

- 解释器与运行环境
- 变量与注释（类型注解、命名原则）
- 数字与字符串
- 数据结构：list / tuple / dict / set
- 控制流（if/for/while + break/continue/else）
- 函数：定义、默认值、关键字参数、特殊参数 / *、*args/**kwargs、Lambda、注解
- 类与对象：命名空间、继承（单/多）、私有变量、迭代器、生成器
- 模块：导入方式、搜索路径、pyc/pycache、dir()
- 输入输出 / 错误和异常 / 虚拟环境 / async/await / 编码风格（PEP8）
- 结构化模式匹配（match/case，3.10+）
- 海象运算符 := （3.8+）
- 类型系统：typing 模块（Protocol/TypeVar/Generic/Callable/Union/Optional/Literal/TypeAlias）


> [📄 Python基础_第2版.md](./mybook/02_python/01_语言基础/Python基础_第2版.md) · [📄 jupyter-notebook的使用.md](./mybook/02_python/01_语言基础/jupyter-notebook的使用.md)
</details>

#### 风格指南

<details>
<summary>Python风格指南</summary>

- 导入规则、装饰器慎用、避免过度强大的特性
- __future__ 导入


> [📄 Python风格指南.md](./mybook/02_python/01_语言基础/Python风格指南.md)
</details>

### 3.2 Python工匠（最佳实践）

#### 变量与数据

<details>
<summary>善用变量</summary>

- 命名要有描述性、能猜出类型
- 避免 globals()/locals()
- 控制单个函数变量数量
- 合理使用 namedtuple/dict 返回多个值


> [📄 1-using-variables-well.md](./mybook/02_python/02_Python工匠/备忘/1-using-variables-well.md)
</details>

#### 控制流与函数

<details>
<summary>数值与字符串技巧</summary>

- 少写数字字面量、别在裸字符串上走太远
- 字符串拼接不慢、超长字符串可读性改善


> [📄 3-tips-on-numbers-and-strings.md](./mybook/02_python/02_Python工匠/备忘/3-tips-on-numbers-and-strings.md)
</details>

<details>
<summary>精通容器类型</summary>

- 写更快的代码（底层视角）/ 写扩展性更好的代码（高层视角）
- next() 函数、元组改善分支、有序字典去重
- 当心枯竭的迭代器


> [📄 4-mastering-container-types.md](./mybook/02_python/02_Python工匠/备忘/4-mastering-container-types.md)
</details>

<details>
<summary>循环编写技巧</summary>

- enumerate / product 扁平化 / islice 隔行 / takewhile 替代 break
- 生成器解耦循环体


> [📄 7-two-tips-on-loop-writing.md](./mybook/02_python/02_Python工匠/备忘/7-two-tips-on-loop-writing.md)
</details>

<details>
<summary>函数返回值技巧</summary>

- 不返回多种类型 / partial 构造新函数
- 抛出异常而非返回结果+错误
- Null Object 模式 / 生成器替代返回列表 / 限制递归


> [📄 5-function-returning-tips.md](./mybook/02_python/02_Python工匠/备忘/5-function-returning-tips.md)
</details>

<details>
<summary>异常处理三个习惯</summary>

- 只做最精确的异常捕获 / 别破坏抽象一致性 / 异常处理不喧宾夺主


> [📄 6-three-rituals-of-exceptions-handling.md](./mybook/02_python/02_Python工匠/备忘/6-three-rituals-of-exceptions-handling.md)
</details>

<details>
<summary>装饰器技巧</summary>

- 用类实现 / wrapt 模块 / functools.wraps() / nonlocal


> [📄 8-tips-on-decorators.md](./mybook/02_python/02_Python工匠/备忘/8-tips-on-decorators.md)
</details>

#### 面向对象与设计

<details>
<summary>SOLID 原则</summary>

- S：单一职责 → 拆大类/用函数
- O：开闭原则 → 继承/组合/IoC/数据驱动
- L：里氏替换 → 不当继承的修正
- I：接口隔离 → 接口拆分
- D：依赖倒置 → 抽象注入、单元测试


> [📄 12-write-solid-python-codes-part-1.md](./mybook/02_python/02_Python工匠/备忘/12-write-solid-python-codes-part-1.md) · [📄 13-write-solid-python-codes-part-2.md](./mybook/02_python/02_Python工匠/备忘/13-write-solid-python-codes-part-2.md) · [📄 14-write-solid-python-codes-part-3.md](./mybook/02_python/02_Python工匠/备忘/14-write-solid-python-codes-part-3.md)
</details>

<details>
<summary>Edge Cases 思维</summary>

- EAFP（获取原谅比许可简单）
- defaultdict / setdefault / dict.pop
- "or" 操作符陷阱 / 数据校验不要手动做


> [📄 15-thinking-in-edge-cases.md](./mybook/02_python/02_Python工匠/备忘/15-thinking-in-edge-cases.md)
</details>

<details>
<summary>If-else 分支思维</summary>

- 避免多层嵌套 / 封装复杂逻辑 / 留意分支重复代码
- 德摩根定律 / all()/any() / 自定义布尔
- None 值比较陷阱 / and/or 优先级


> [📄 2-if-else-block-secrets.md](./mybook/02_python/02_Python工匠/备忘/2-if-else-block-secrets.md)
</details>

#### 文件与工程

<details>
<summary>路径与文件操作</summary>

- pathlib 替代 os.path
- 流式读取大文件（read分块 + 生成器）
- 设计接受文件对象的函数


> [📄 11-three-tips-on-writing-file-related-codes.md](./mybook/02_python/02_Python工匠/备忘/11-three-tips-on-writing-file-related-codes.md)
</details>

<details>
<summary>循环导入的故事</summary>

- 环形依赖问题的实际案例与解决方案


> [📄 9-a-story-on-cyclic-imports.md](./mybook/02_python/02_Python工匠/备忘/9-a-story-on-cyclic-imports.md) · [📄 00-start.md](./mybook/02_python/02_Python工匠/00-start.md) · [📄 13-大型项目.md](./mybook/02_python/02_Python工匠/13-大型项目.md) · [📄 10-a-good-player-know-the-rules.md](./mybook/02_python/02_Python工匠/备忘/10-a-good-player-know-the-rules.md)
</details>

### 3.3 Python版本演进

#### 版本演进

<details>
<summary>3.6 → 3.14 新特性</summary>

- **3.6**: 类型注解、异步/await、asyncio.run/create_task/gather/wait
- **3.8**: 海象运算符 :=、位置参数 /、asyncio.run()
- **3.9**: 字典合并 |、类型提示改进
- **3.10**: 结构化模式匹配、精确类型别名
- **3.11**: 异步任务组、f-string = 调试输出
- **3.12**: 类型注解语法简化
- **3.13**: 自由线程实验性支持、函数调用优化
- **3.14**: 自由线程官方支持、标注迟延求值、模板字符串、多解释器、zstd、JIT实验


> [📁 python/3_版本演进/](./mybook/02_python/03_版本演进/)

**详细文档**：
> [📄 3.6.md](./mybook/02_python/03_版本演进/3.6.md) · [📄 3.8.md](./mybook/02_python/03_版本演进/3.8.md) · [📄 3.9.md](./mybook/02_python/03_版本演进/3.9.md) · [📄 3.10.md](./mybook/02_python/03_版本演进/3.10.md) · [📄 3.11.md](./mybook/02_python/03_版本演进/3.11.md) · [📄 3.12.md](./mybook/02_python/03_版本演进/3.12.md) · [📄 3.13.md](./mybook/02_python/03_版本演进/3.13.md) · [📄 3.14.md](./mybook/02_python/03_版本演进/3.14.md) · [📄 版本演进总结.md](./mybook/02_python/03_版本演进/版本演进总结.md)
</details>

### 3.4 标准库

#### 内置类型与异常

<details>
<summary>内置类型与异常</summary>

- 内置类型：数值/序列/映射/集合/特殊类型
- 内置异常：异常链 / 异常组 / 层次结构
- 内置函数与常量


> [📄 内置类型.md](./mybook/02_python/04_标准库/内置类型.md) · [📄 内置异常.md](./mybook/02_python/04_标准库/内置异常.md) · [📄 内置函数.md](./mybook/02_python/04_标准库/内置函数.md) · [📄 内置常量.md](./mybook/02_python/04_标准库/内置常量.md)
</details>

#### 数据处理

<details>
<summary>文本与数据处理</summary>

- 文本处理：string / re / textwrap / difflib
- 文件和目录访问：pathlib / os.path / tempfile / shutil
- functools：partial / reduce / cache / wraps / singledispatch


> [📄 文本处理服务.md](./mybook/02_python/04_标准库/文本处理服务.md) · [📄 文件和目录访问.md](./mybook/02_python/04_标准库/文件和目录访问.md) · [📄 函数式编程模块.md](./mybook/02_python/04_标准库/函数式编程模块.md) · [📄 标准库.md](./mybook/02_python/04_标准库/标准库.md) · [📄 Mapping.md](./mybook/02_python/04_标准库/Mapping.md) · [📄 类型系统.md](./mybook/02_python/04_标准库/类型系统.md)
</details>

#### 垃圾回收

<details>
<summary>垃圾回收</summary>

- 引用计数（主）+ 标记清除（循环引用）+ 分代回收
- 环状双向链表 refchain / 池化技术（int/small string）


> [📄 垃圾回收.md](./mybook/02_python/04_标准库/垃圾回收.md)
</details>

#### 并发与网络

<details>
<summary>并发执行</summary>

- multiprocessing + shared_memory
- concurrent.futures / queue / sched / contextvars
- GIL 原理与限制：CPU 密集型无法并行，I/O 密集型可并发
- 多进程 vs 多线程 vs 协程选型指南
- Python 3.13+ 自由线程（no-GIL）实验性支持


> [📄 并发执行.md](./mybook/02_python/04_标准库/并发执行.md)
</details>

<details>
<summary>网络和进程间通信</summary>

- asyncio：协程/Task/同步原语/子进程/Queue/超时/取消
- asyncio 深入：事件循环（uvloop/asyncio） / Task 调度 / Future / awaitable 协议
- socket / ssl / select / selectors / signal / mmap
- WSGI（同步）/ ASGI（异步）协议与服务器


> [📄 网络和进程间通信.md](./mybook/02_python/04_标准库/网络和进程间通信.md)
</details>

### 3.5 常用库

#### 核心库

<details>
<summary>核心</summary>

- **Pydantic**：数据校验与序列化框架，基于 Python 类型注解；Model/Field/validator/自定义验证器；v2 基于 Rust 重写，性能大幅提升
- **SQLAlchemy**：Python ORM 框架，Core（SQL表达式）+ ORM（对象映射）；Session 管理/关系映射/查询 API/异步支持
- **Celery**：分布式任务队列；Broker（Redis/RabbitMQ）+ Worker + Backend；任务链/组/和弦/定时任务（beat）；序列化/重试/限流/信号
- **Huey**：轻量任务队列；Redis/SQLite 后端；支持定时任务/重试/任务管道


> [📄 pydantic.md](./mybook/02_python/05_常用库/pydantic.md) · [📄 SQLAlchemy.md](./mybook/02_python/07_第三方库/SQLAlchemy.md) · [📄 celery.md](./mybook/02_python/05_常用库/celery.md) · [📄 huey.md](./mybook/02_python/05_常用库/huey.md) · [📄 hrq.md](./mybook/02_python/05_常用库/hrq.md)
</details>

#### 网络爬虫

<details>
<summary>网络/爬虫</summary>

- **Playwright**：浏览器自动化；同步/异步 API / 多浏览器支持 / 反检测/截图/定位器/网络拦截/移动端模拟
- **Scrapy**：爬虫框架；Spider/Item/Pipeline/Middleware/Selector；分布式爬虫（scrapy-redis）
- **Feapder**：轻量爬虫框架；支持内存/Redis 数据库；爬虫监控与报警


> [📄 playwright.md](./mybook/02_python/07_第三方库/playwright.md) · [📄 scrapy.md](./mybook/02_python/07_第三方库/scrapy.md) · [📄 feapder.md](./mybook/02_python/07_第三方库/feapder.md)
</details>

#### 协程性能

<details>
<summary>协程 & 性能</summary>

- **Gevent**：基于 greenlet 的协程库；猴子补丁（monkey.patch_all）将标准库替换为协程版本；事件/池/锁/信号量/Subprocess/Actors 模式
- **uvloop**：asyncio 事件循环的高性能替代，基于 libuv，性能接近 Go
- **Trio**：友好的异步并发库，结构化并发模型


> [📄 gevent.md](./mybook/02_python/05_常用库/gevent.md) · [📄 uvloop.md](./mybook/02_python/05_常用库/uvloop.md)
</details>

#### 安全包管理

<details>
<summary>安全 & 包管理</summary>

- **pyarmor**：代码保护/混淆/加密，防止源码泄露
- **poetry**：依赖管理 + 虚拟环境 + 构建 + 发布，pyproject.toml 配置
- **uv**：Rust 编写的极速包管理器，兼容 pip/venv，速度比 pip 快 10-100 倍
- **PySnooper**：自动 Debug 工具，@pysnooper.snoop() 装饰器追踪函数执行
- **Cerberus**：轻量数据验证库，Schema 定义验证规则
- **DrissionPage**：网页自动化工具，浏览器控制 + 数据包收发一体化


> [📄 代码保护.md](./mybook/02_python/07_第三方库/代码保护.md) · [📄 常用包.md](./mybook/02_python/07_第三方库/常用包.md) · [📄 pypiserver.md](./mybook/02_python/07_第三方库/pypiserver.md) · [📄 日志库.md](./mybook/02_python/07_第三方库/日志库.md) · [📄 并发.md](./mybook/02_python/07_第三方库/并发.md) · [📄 pygame.md](./mybook/02_python/07_第三方库/pygame.md)
</details>

#### 数据科学

<details>
<summary>数据处理 & 科学计算</summary>

- **NumPy**：多维数组/广播/线性代数/傅里叶变换/随机数
- **Pandas**：DataFrame/Series/数据清洗/聚合/透视表/时序处理
- **Matplotlib / Seaborn**：数据可视化
- **Polars**：Rust 编写的高性能 DataFrame 库，比 Pandas 快数倍
- **SciPy**：科学计算（优化/插值/积分/信号处理）


> [📄 NumPy.md](./mybook/02_python/07_第三方库/NumPy.md) · [📄 Pandas.md](./mybook/02_python/07_第三方库/Pandas.md) · [📄 Polars.md](./mybook/02_python/07_第三方库/Polars.md) · [📄 数据可视化.md](./mybook/02_python/07_第三方库/数据可视化.md)
</details>

#### 包分发

<details>
<summary>包分发 & C扩展</summary>

- **包分发**：setup.py / pyproject.toml / wheel / sdist / PyPI 发布
- **C 扩展**：ctypes / cffi / Cython / pybind11；编写 C 扩展模块
- **字节码**：dis 模块 / compile / exec / code object
- **性能分析**：cProfile / line_profiler / memory_profiler / py-spy


> [📄 zipapp打包应用.md](./mybook/02_python/01_语言基础/zipapp打包应用.md)
</details>

### 3.6 Web开发

#### Django

<details>
<summary>Django</summary>

- **MTV 架构**：Model（数据层）/ Template（展示层）/ View（业务逻辑）/ URLconf（路由分发）
- **请求生命周期**：WSGI → 中间件 process_request → URLconf 路由 → process_view → View → process_response → 响应
- **URL 路由**：`path` / `re_path`、路径参数 `<int:id>`、命名空间、`reverse` 反向解析
- **视图层**：FBV 函数视图 / CBV 类视图（`as_view` → `dispatch` 分发）、请求参数获取、类视图装饰器
- **ORM 模型**：字段类型（CharField/ForeignKey/ManyToManyField 等）、QuerySet 惰性求值/链式调用/缓存
- **N+1 优化**：`select_related`（外键 JOIN）/ `prefetch_related`（多对多二次查询）
- **F/Q 对象**：F 引用字段值（原子操作）/ Q 复杂查询条件（OR/NOT）
- **模板层 DTL**：变量/标签/过滤器、模板继承 `{% extends %}` / `{% block %}` / `{% include %}`
- **表单**：Form / ModelForm、验证流程（to_python → validate → clean_字段 → clean）
- **中间件**：五个钩子（process_request/view/template_response/response/exception）、洋葱模型执行顺序
- **认证与安全**：内置 User 模型、`login_required` 装饰器、CSRF 防护、XSS 防护（模板转义）、SQL 注入防护（ORM）
- **Cookie & Session**：Session 多后端（数据库/缓存/Redis）、`set_expiry` 过期控制
- **缓存体系**：四级缓存（全站/视图/片段/API）、Redis 后端配置
- **Admin 后台**：`list_display` / `search_fields` / `list_filter` / `fieldsets` 定制
- **DRF（Django REST Framework）**：Serializer / ViewSet / Router，快速构建 REST API
- **信号**：pre_save / post_save / pre_delete / post_delete / request_started 等内置信号 + 自定义信号
- **部署**：Gunicorn + Nginx、`check --deploy` 安全检查、多环境配置（settings/dev/prod）
- **Django-Vue3-Admin**：Django + Vue3 前后端分离管理后台模板


> [📁 python/6_Web开发/django/](./mybook/02_python/06_Web开发/django/)

**详细文档**：
> [📄 django.md](./mybook/02_python/06_Web开发/django/django.md) · [📄 DjangoWeb知识点总结.md](./mybook/02_python/06_Web开发/django/DjangoWeb知识点总结.md) · [📄 Django进阶.md](./mybook/02_python/06_Web开发/django/Django进阶.md) · [📄 drf.md](./mybook/02_python/06_Web开发/django/drf.md) · [📄 dv3a.md](./mybook/02_python/06_Web开发/django/dv3a.md)
</details>

#### Flask

<details>
<summary>Flask</summary>

- 路由与请求：路由注册/请求对象/响应对象/URL构建
- 蓝图与模块化：蓝图注册/API版本控制
- 请求验证：Marshmallow / Pydantic
- 数据库集成：Flask-SQLAlchemy / CRUD / Flask-Migrate 数据库迁移
- 认证与授权：JWT（PyJWT）/ API Key / Basic Auth（Flask-HTTPAuth）
- 文件处理：上传/下载
- 错误处理与缓存策略（Flask-Caching / Redis）
- 限流与防护：Flask-Limiter / 熔断器
- 异步任务：Celery / Dramatiq / Huey
- 实时通信：SSE / WebSocket
- 中间件 / 健康检查与监控 / 测试
- 部署：Gunicorn / Docker / Nginx
- 最佳实践：应用工厂模式 / 服务层模式 / 安全实践 / 日志规范 / API文档


> [📁 python/6_Web开发/flask/](./mybook/02_python/06_Web开发/flask/)

**详细文档**：
> [📄 flask.md](./mybook/02_python/06_Web开发/flask/flask.md) · [📄 Flask进阶.md](./mybook/02_python/06_Web开发/flask/Flask进阶.md) · [📄 flask-restful.md](./mybook/02_python/06_Web开发/flask/flask-restful.md) · [📄 flask-sqlarch.md](./mybook/02_python/06_Web开发/flask/flask-sqlarch.md) · [📄 flask-admin.md](./mybook/02_python/06_Web开发/flask/flask-admin.md) · [📄 dify_node.md](./mybook/02_python/06_Web开发/flask/dify_node.md)
</details>

#### FastAPI等

<details>
<summary>FastAPI / Tornado / Bottle / Quart / Sanic</summary>

- **FastAPI**：异步 ASGI 框架 + 自动 OpenAPI 文档 + Pydantic 数据校验；目录结构（api/models/schemas/db）；Sentry 错误追踪；Prometheus 指标监控
- **Tornado**：路由/模板/自定义session/异步非阻塞
- **Bottle**：轻量（路由/请求/响应/模板/SQLite），单文件即可运行
- **Quart**：Flask 异步版本，API 兼容 Flask
- **Sanic**：高性能异步 Web 框架


> [📁 python/6_Web开发/fastapi/](./mybook/02_python/06_Web开发/fastapi/) · [📄 fastapi.md](./mybook/02_python/06_Web开发/fastapi.md) · [📄 tornado.md](./mybook/02_python/06_Web开发/tornado.md) · [📄 bottle.md](./mybook/02_python/06_Web开发/bottle.md) · [📄 quart.md](./mybook/02_python/06_Web开发/quart.md) · [📄 sanic.md](./mybook/02_python/06_Web开发/sanic.md) · [📄 FastAPI实战.md](./mybook/02_python/06_Web开发/fastapi/FastAPI实战.md) · [📄 wsgiref.md](./mybook/02_python/06_Web开发/wsgiref.md) · [📄 Python基础_第2版.md](./mybook/02_python/06_Web开发/Python基础_第2版.md) · [📄 pynecone.md](./mybook/02_python/06_Web开发/pynecone_note/pynecone.md)
</details>

#### 微服务

<details>
<summary>微服务</summary>

- 服务发现：Consul / Eureka / Nacos / Etcd
- 负载均衡：客户端负载均衡（Ribbon）+ 服务端负载均衡（Nginx）
- 网关：Kong / APISIX / Spring Cloud Gateway / Nginx Ingress
- 日志集中：ELK Stack / Loki + Grafana
- Jaeger 分布式追踪：Span/Trace/Context 传播/采样策略
- 容错：熔断/降级/限流/重试/超时
- CI/CD：GitLab CI / GitHub Actions / Jenkins / ArgoCD


> [📄 微服务.md](./mybook/02_python/06_Web开发/微服务.md)
</details>

#### 反爬安全

<details>
<summary>反爬与安全</summary>

- 反爬策略：User-Agent 检测 / IP 限制 / Session 限制 / Spider Trap / 验证码（图形/滑动/行为）
- 数据保护：动态加载（Ajax/SPA）/ 数据加密 / 非可视区域遮挡 / 字体反爬 / CSS 偏移
- 绕过技术：Selenium/Playwright/请求头伪装/代理池/Cookie 池/JS 逆向


> [📄 反爬.md](./mybook/02_python/06_Web开发/反爬.md)
</details>

### 3.7 第三方库

#### 数据库驱动

<details>
<summary>数据库驱动</summary>

- **PyMySQL**：纯 Python MySQL 客户端；SQL 执行流程（connect → cursor → execute → fetch）/MySQL 行存储格式/连接池/事务控制
- **Redis（redis-py）**：5 大基础数据类型 + 3 大扩展类型（HyperLogLog/Bitmap/Geo）；主从/哨兵/Cluster；分布式锁（SET NX EX）/Redlock/Pipeline/发布订阅/Lua 脚本
- **MongoDB（pymongo）**：文档型 NoSQL；对比 MySQL/Redis/ES；副本集选举（Raft）；事务（4.0+）；GridFS 大文件存储；聚合管道/索引优化


> [📄 pymysql.md](./mybook/02_python/07_第三方库/pymysql.md) · [📄 redis-py.md](./mybook/02_python/07_第三方库/redis-py.md) · [📄 mongodb.md](./mybook/02_python/07_第三方库/mongodb.md) · [📄 python-memcached.md](./mybook/02_python/07_第三方库/python-memcached.md)
</details>

#### 消息队列与搜索

<details>
<summary>消息队列 & 搜索</summary>

- **RabbitMQ**：AMQP 协议；Exchange 类型（direct/fanout/topic/headers）；生产者-消费者/发布订阅/路由/模糊匹配；消息确认/持久化/死信队列/延迟队列
- **Kafka**：高吞吐分布式消息系统；Topic/Partition/Consumer Group/Offset；日志追加存储/零拷贝/页面缓存；Exactly-Once 语义/事务/分区再平衡；Kafka Streams/Connect 生态
- **Elasticsearch**：倒排索引/分词器/映射（Mapping）；插入速度优化（bulk/refresh_interval/副本延迟）；聚合查询/向量搜索/ILM 生命周期


> [📄 rabbitmq.md](./mybook/02_python/07_第三方库/rabbitmq.md) · [📄 kafka.md](./mybook/02_python/07_第三方库/kafka.md) · [📄 Elasticsearch.md](./mybook/02_python/07_第三方库/Elasticsearch.md)
</details>

#### LLM与AI

<details>
<summary>LLM & AI</summary>

- **LangChain**：6 大核心组件（Model I/O / Data Connection / Chains / Memory / Agents / Callbacks）
- **LiteLLM**：统一多模型 API，支持 OpenAI/Azure/Anthropic 等 100+ 模型；路由/负载均衡/故障转移
- **大模型开发流程**：确定目标 → 设计功能 → 搭建架构 → 建向量数据库 → Prompt Engineering → 验证迭代 → 前后端搭建 → 体验优化
- **RAG vs 微调**：RAG 更新成本低/可解释性强/降低幻觉；微调可定制风格/行为但计算成本高
- **提示词工程**：设计原则（清晰/具体/分步）/迭代优化/Bad Case 分析/Chain-of-Thought
- **推理部署**：Ollama（本地部署）/vLLM（高吞吐推理服务）/Tensor-Parallel/AWQ/GPTQ 量化
- **AI 绘画**：Stable Diffusion / ComfyUI / ControlNet
- **Python AI 工具**：Jupyter Notebook / IPython


> [📄 langchain.md](./mybook/02_python/07_第三方库/langchain.md) · [📄 litllm.md](./mybook/02_python/07_第三方库/litllm.md) · [📄 大模型.md](./mybook/02_python/07_第三方库/大模型.md) · [📄 大模型开发流程.md](./mybook/02_python/07_第三方库/大模型开发流程.md) · [📄 PythonAI绘画.md](./mybook/02_python/07_第三方库/PythonAI绘画.md) · [📄 RAG系统设计.md](./mybook/02_python/07_第三方库/RAG系统设计.md) · [📄 LangChain实战.md](./mybook/02_python/07_第三方库/LangChain实战.md)
</details>

#### 自动化部署

<details>
<summary>自动化 & 部署</summary>

- **Ansible**：自动化运维；Playbook/Inventory/Module/Role；幂等性/声明式配置
- **Fabric**：轻量远程执行框架；SSH 连接/批量命令/文件上传下载/任务编排
- **Terraform**：IaC 基础设施即代码；HCL 语法/Provider/State 管理/模块化
- **Playwright**：浏览器自动化；同步/异步 API/反检测/截图/定位器/网络拦截
- **Flask-PluginKit**：基于 Flask 的插件式开发工具


> [📄 ansible.md](./mybook/02_python/07_第三方库/自动化运维/ansible.md) · [📄 fabric.md](./mybook/02_python/07_第三方库/自动化运维/fabric.md) · [📄 terraform.md](./mybook/02_python/07_第三方库/自动化运维/terraform.md) · [📄 负载均衡.md](./mybook/02_python/07_第三方库/自动化运维/负载均衡.md)
</details>

### 3.8 高并发设计

#### 架构

<details>
<summary>基础架构</summary>

- 演进路线：单机房 → 主备 → 同城双活 → 异地多活（两地三中心）
- **DNS**：域名解析/智能 DNS/GeoDNS/全局流量管理
- **LVS**：Linux 虚拟服务器；NAT/DR/TUN 三种模式；四层负载均衡
- **服务发现**：客户端发现 / 服务端发现；注册中心（Consul/Eureka/Nacos）
- **RPC**：gRPC / Thrift / Dubbo；序列化协议/服务治理/IDL
- **LSM Tree**：写入优化数据结构；MemTable → SSTable → Compaction；适用于写密集场景
- **分布式理论**：CAP 定理（CP/AP 权衡）/ BASE 理论（最终一致性）/ 共识算法（Paxos/Raft/ZAB）
- **分布式事务**：2PC / 3PC / TCC / Saga / 本地消息表 / 可靠消息最终一致性
- **分布式ID**：UUID / 雪花算法 / 号段模式 / Redis 自增
- **分布式锁**：Redis（SETNX+Lua）/ ZooKeeper（临时顺序节点）/ etcd（Lease）
- **微服务**：服务拆分原则/通信方式（同步RPC+异步消息）/API网关/配置中心/服务治理
- **高性能**：读写分离/CQRS/异步化/批量合并/连接池/数据库优化（索引/分区/分库分表）


> [📄 基础架构.md](./mybook/02_python/08_高并发设计/基础架构.md) · [📄 微服务.md](./mybook/02_python/08_高并发设计/微服务.md) · [📄 分布式.md](./mybook/02_python/08_高并发设计/分布式.md) · [📄 高性能.md](./mybook/02_python/08_高并发设计/高性能.md)
</details>

#### 高可用

<details>
<summary>高可用</summary>

- 衡量指标：SLA（99.9%/99.99%/99.999%）、MTBF/MTTR/可用性公式
- 重试：指数退避/抖动/最大重试次数/幂等性保证
- 熔断：Closed → Open → Half-Open 状态机；阈值配置（错误率/超时率/时间窗口）
- 隔离：线程池隔离/信号量隔离/舱壁模式
- 降级：返回默认值/缓存数据/简化逻辑/开关控制
- 超时控制：连接超时/读超时/写超时/总超时


> [📄 高可用.md](./mybook/02_python/08_高并发设计/高可用.md)
</details>

#### 高并发

<details>
<summary>高并发</summary>

- 横向扩展 / CDN
- 接口优化：批量/异步/缓存/预取/池化/回调/串行改并行/锁粒度/索引/深分页
- 微服务拆分 / 分库分表 / 主从分离 / 消息队列 / ES
- 50wQPS 未读数系统设计
- 高并发读：读写分离 / 本地缓存 / 分布式缓存 / CQRS
- 高并发写：分库分表 / 异步写与写聚合 / Kafka多Partition


> [📄 高并发.md](./mybook/02_python/08_高并发设计/高并发.md)
</details>

#### 分库分表与ID

<details>
<summary>分库分表</summary>

- 水平/垂直分库分表
- 分表键选择 / 分表策略（range/hash/一致性hash）
- 跨节点Join / 聚合函数 / 分页问题（全局视野法/禁止跳页/二次查询）
- 分布式ID（Snowflake / 美团Leaf）


> [📄 分库分表.md](./mybook/02_python/08_高并发设计/分库分表.md)
</details>

<details>
<summary>唯一ID</summary>

- 分布式唯一ID方案
- 美团Leaf（segment + snowflake）


> [📄 唯一id.md](./mybook/02_python/08_高并发设计/唯一id.md)
</details>

#### 缓存

<details>
<summary>缓存</summary>

- 缓存穿透：查询不存在的数据 → 布隆过滤器/缓存空值
- 缓存击穿：热点 key 过期 → 互斥锁/永不过期/提前续期
- 缓存雪崩：大量 key 同时过期 → 过期时间随机化/多级缓存/熔断降级
- 多级缓存架构：浏览器缓存 → CDN → Nginx 本地缓存 → 应用本地缓存 → 分布式缓存 → 数据库
- 缓存一致性：Cache Aside / Read Through / Write Through / Write Behind
- 缓存预热 / 缓存更新策略（LRU/LFU/FIFO）


> [📄 缓存.md](./mybook/02_python/08_高并发设计/缓存.md)
</details>

#### 可观测性

<details>
<summary>可观测性</summary>

- **三大支柱**：Metrics（指标）/ Tracing（追踪）/ Logging（日志）
- **Prometheus**：时序数据库 + PromQL 查询语言 + Pull 模式采集 + AlertManager 告警
- **Grafana**：可视化面板，支持 Prometheus/Jaeger/Loki/ES 等数据源
- **Jaeger**：分布式追踪，OpenTracing 兼容，Span/Trace/Context 传播
- **OpenTelemetry**：统一的可观测性标准，SDK + API + Collector
- **ELK Stack**：Elasticsearch + Logstash + Kibana，日志采集/存储/搜索/可视化
- **Loki**：轻量日志聚合系统，Grafana 生态，仅索引标签


> [📄 可观测性.md](./mybook/02_python/08_高并发设计/可观测性.md)
</details>

#### 业务场景

<details>
<summary>海量推送系统</summary>

- 设计要点：长连接管理 / 消息可靠性 / 推送通道选择（APNs/FCM/自建）
- 架构：网关层 → 路由层 → 推送层 → 消息队列 → 存储层
- 关键指标：在线率/到达率/延迟/吞吐量
- 优化：连接复用/批量推送/分级推送/消息压缩/断线重连


> [📄 海量推送系统.md](./mybook/02_python/08_高并发设计/海量推送系统.md)
</details>

<details>
<summary>用户登录服务</summary>

- 账号 / 密码保护 / 手机号邮箱登录 / 第三方登录 / 登录态管理 / 扫码登录


> [📄 用户登陆服务.md](./mybook/02_python/08_高并发设计/用户登陆服务.md)
</details>

#### 面试题

<details>
<summary>Python面试题</summary>

- 语言特性：GIL/深浅拷贝/可变不可变类型/装饰器/生成器/迭代器/闭包
- 设计模式：创建型（单例/工厂/建造器）/结构型（适配器/装饰器/代理）/行为型（观察者/策略/模板方法）
- 网络编程：Socket/HTTP/TCP 三次握手四次挥手/TIME_WAIT/CLOSE_WAIT
- WSGI 与 Web 框架：WSGI 协议/Django vs Flask vs FastAPI/MVC/MTV
- ORM：SQLAlchemy/Django ORM/N+1 问题/懒加载
- 内置数据结构和算法：list/dict/set 底层实现/哈希冲突/排序算法复杂度
- Web 安全：SQL 注入/XSS/CSRF/点击劫持/文件上传漏洞
- 系统设计：短链/限流/缓存/消息队列/秒杀


> [📄 面试题.md](./mybook/02_python/09_面试题/面试题.md)
</details>

#### 工程实践

<details>
<summary>代码格式化与检查工具</summary>

- **uv**：Rust 编写的极速包管理器，替代 pip/poetry/pyenv；项目管理/虚拟环境/Python 版本管理一体化
- **ruff**：Rust 编写的全能 Linter + 格式化器，替代 black+isort+flake8；700+ 规则，自动修复
- **black**：不妥协的代码格式化器，PEP 8 标准，88 字符行宽，消除风格争论
- **isort**：导入语句自动排序，按标准库/第三方/本地模块分组
- **pylint**：深度静态分析，类型推断/数据流分析/代码评分/自定义检查器
- **推荐组合**：极简方案用 ruff 一站式；深度方案用 ruff + pylint；传统方案用 black + isort + flake8

> [📄 01_代码格式化与检查工具.md](./mybook/02_python/10_工程实践/01_代码格式化与检查工具.md)
</details>

---

## 四、Lua

### 4.1 语言基础

#### 基础语法

<details>
<summary>数据类型与变量</summary>

- nil / boolean / number / string / function / table / thread / userdata
- 变量作用域与解释器


> [📄 02_lua数据类型与变量.md](./mybook/04_lua/01_语言基础/02_数据类型与变量.md)
</details>

#### 面向对象

<details>
<summary>面向对象 & 环境</summary>

- 类与对象：基于 table + metatable 实现面向对象
- 元表与元方法：`__index` / `__newindex` / `__add` / `__call` / `__tostring` / `__gc`
- 继承：通过 `__index` 元方法实现单继承/多继承
- `_G` 全局环境表 / `_ENV`（Lua 5.2+）局部环境
- 模块与包：require 机制 / module 函数 / package.path/cpath


> [📄 11_面向对象.md](./mybook/04_lua/01_语言基础/06_面向对象.md) · [📄 12_环境.md](./mybook/04_lua/01_语言基础/07_环境.md)
</details>

#### 协程

<details>
<summary>函数</summary>

- 定义与调用 / 函数变量 / 可变参数 / 闭包


> [📄 08_函数.md](./mybook/04_lua/01_语言基础/05_函数.md)
</details>

<details>
<summary>协程</summary>

- Lua coroutine：非抢占式协作多任务
- `coroutine.create(f)`：创建协程，返回 thread 类型
- `coroutine.resume(co, ...)`：启动/恢复协程，传递参数，返回状态和返回值
- `coroutine.yield(...)`：挂起当前协程，将值返回给 resume 调用者
- `coroutine.wrap(f)`：创建并返回一个包装函数，调用即 resume，更简洁
- `coroutine.status(co)`：查看状态（suspended / running / normal / dead）
- 生产者-消费者模式：协程实现惰性迭代器
- 与线程区别：协程非抢占、由用户调度、切换代价极低


> [📄 08_协程.md](./mybook/04_lua/01_语言基础/08_协程.md)
</details>

#### 错误处理

<details>
<summary>错误处理 & 模式匹配</summary>

- 错误处理：`pcall(f, ...)`（保护调用，返回 ok,result）/ `xpcall(f, handler)`（带错误处理器）
- 自定义错误对象：`error({code=500, msg="..."})`
- Lua 模式匹配（非正则）：`%d %w %a %s %l %u %p` 字符类 / `%b()` 平衡匹配 / 锚点 `^$`
- 与正则的区别：无交替符(|)/无量词{m,n}/无反向引用/更轻量更快


> [📄 04_错误处理与模式匹配.md](./mybook/04_lua/01_语言基础/04_错误处理与模式匹配.md)
</details>

#### GC与性能

<details>
<summary>GC & 性能</summary>

- 增量标记-清除 GC（Lua 5.1+）/ 分代 GC（Lua 5.4 默认）
- `collectgarbage("collect"/"count"/"step"/"setpause"/"setstepmul")`
- 弱引用表：`__mode = "k"/"v"/"kv"`，避免内存泄漏
- finalizer：`__gc` 元方法，对象回收前执行清理
- 性能优化：局部变量优先/减少全局访问/预分配 table/避免频繁字符串拼接


> [📄 17_GC与性能优化.md](./mybook/04_lua/01_语言基础/09_GC与性能优化.md)
</details>

#### 标准库

<details>
<summary>标准库</summary>

- base：核心基础函数（print/type/pairs/ipairs/error/pcall/require 等）
- package：模块管理（require/searchers/path/cpath/loaded/preload）
- string：字符串操作（find/match/gsub/gmatch/len/sub/upper/lower/rep/format/byte/char）
- table：表操作（insert/remove/sort/concat/unpack/pack/maxn）
- math：数学计算（abs/ceil/floor/max/min/sqrt/random/randomseed/sin/cos/exp/log）
- io：文件操作（open/read/write/close/lines/tmpfile/flush），文件句柄方法
- os：操作系统（execute/remove/rename/date/time/clock/difftime/getenv/exit）
- debug：调试（traceback/getinfo/getlocal/setlocal/getupvalue/setupvalue/getmetatable/setmetatable）


> [📄 01_Lua简介.md](./mybook/04_lua/01_语言基础/01_Lua简介.md) · [📄 03_表与元表.md](./mybook/04_lua/01_语言基础/03_表与元表.md) · [📄 10_Lua设计模式.md](./mybook/04_lua/01_语言基础/10_Lua设计模式.md)
</details>

### 4.2 高级主题

#### LuaJIT

<details>
<summary>LuaJIT & FFI</summary>

- LuaJIT：Lua 的即时编译实现，性能远超标准 Lua 解释器
- JIT 编译：运行时将热点 Lua 代码编译为本地机器码
- Trace 编译器：记录执行路径（Trace），优化循环和热函数
- IR（中间表示）：Trace → IR → 机器码；Guard 守卫条件
- NYI（Not Yet Implemented）：不支持 JIT 的操作，回退到解释执行
- 性能优化：避免 NYI / 减少 Trace 中止 / 使用 `-jdump` 分析
- LuaFFI：直接在 Lua 中声明和调用 C 函数，无需编写 C 绑定代码
- `ffi.cdef` 声明 C 类型/函数签名，`ffi.C` 访问默认 C 库
- `ffi.new` / `ffi.cast` / `ffi.string` / `ffi.typeof` 等 FFI 辅助函数
- 回调：`ffi.cast` 将 Lua 函数转为 C 函数指针
- 内存管理：`ffi.gc` 注册 finalizer / 手动 `ffi.C.free`
- 与 Lua C API 对比：FFI 更简洁高效，无需编写 C 胶水代码


> [📄 01_LuaJIT.md](./mybook/04_lua/02_高级主题/01_LuaJIT.md) · [📄 02_LuaFFI.md](./mybook/04_lua/02_高级主题/02_LuaFFI.md)
</details>

#### OpenResty

<details>
<summary>OpenResty</summary>

- 基于 Nginx + LuaJIT 的高性能 Web 平台
- 安装：Fedora / Ubuntu 源码编译或包管理器安装
- Hello World：`content_by_lua` 指令内嵌 Lua 代码处理请求
- 请求处理阶段：set_by_lua → rewrite_by_lua → access_by_lua → content_by_lua → log_by_lua
- ngx API：`ngx.say` / `ngx.exit` / `ngx.redirect` / `ngx.log` / `ngx.req` / `ngx.location.capture`
- 共享字典 `ngx.shared.DICT`：Worker 间共享内存，原子操作，适用于缓存/限流/计数
- cosocket（协程套接字）：`ngx.socket.tcp` / `ngx.socket.udp`，非阻塞网络 I/O
- Worker 进程模型：每个 Worker 独立 Lua VM，无锁竞争


> [📄 40_openresty安装.md](./mybook/04_lua/02_高级主题/05_OpenResty安装.md)
</details>

#### Lua与C++

<details>
<summary>Lua与C++</summary>

- Lua C API：通过虚拟栈（Stack）与 Lua 交互
- 栈操作：`lua_push*`（压栈）/ `lua_to*`（读取）/ `lua_pop`（弹栈）/ `lua_gettop`（栈顶索引）
- 注册 C 函数：`lua_pushcfunction` / `lua_setglobal`，C 函数签名 `int (*)(lua_State*)`
- Lua 调用 C：require 加载 `.so/.dll` 动态库，`luaL_newlib` 注册函数库
- C 调用 Lua：`luaL_dostring` / `luaL_dofile` 加载脚本，`lua_pcall` 调用 Lua 函数
- 类型检查：`luaL_checkint` / `luaL_checkstring` / `luaL_checktype`
- Userdata：light userdata（指针）/ full userdata（带 GC 和元表）
- 面向对象绑定：LuaBridge（轻量）/ sol2（现代 C++）/ kaguya（简洁）
- 错误处理：`lua_pcall` 保护调用 / `lua_error` 抛出错误
- 内存管理：引用计数 vs GC / `luaL_ref` 引用管理
- 多返回值处理：`lua_gettop` 获取返回值数量


> [📄 04_Lua与C++.md](./mybook/04_lua/02_高级主题/04_Lua与C++.md)
</details>

#### 生态

<details>
<summary>LuaGo</summary>

- lua chunk 文件格式


> [📄 50_luago.md](./mybook/04_lua/02_高级主题/06_LuaGo.md)
</details>

<details>
<summary>生态</summary>

- **LuaFileSystem**：文件系统操作库，目录遍历/文件属性/创建删除目录
- **Lua Nginx WAF**：基于 OpenResty 的 Web 应用防火墙，规则引擎/IP 黑白名单/CC 防护
- **OpenStar**：OpenResty WAF 增强版，更灵活的规则配置/动态加载/日志分析


> [📄 21_luafilesystem.md](./mybook/04_lua/02_高级主题/03_LuaFileSystem.md) · [📄 60_lua_ngx_waf.md](./mybook/04_lua/02_高级主题/07_LuaNginxWAF.md) · [📄 70_openstar.md](./mybook/04_lua/02_高级主题/08_OpenStar.md)
</details>

---

## 五、Web（前端）

### 5.1 前端基础

#### HTML与CSS

<details>
<summary>HTML & CSS</summary>

- HTML5 语义标签：header/nav/main/section/article/aside/footer
- HTML5 API：Canvas / WebSocket / Geolocation / Web Storage / Web Workers / Drag & Drop
- CSS 布局：Flexbox（主轴/交叉轴/弹性项目）/ Grid（行列/区域/对齐）
- CSS 响应式：媒体查询 / rem/vw/vh / Container Queries
- CSS 动画：transition / @keyframes / animation / transform
- CSS 变量（Custom Properties）/ calc() / clamp()
- CSS 预处理器：Sass / Less / PostCSS


> [📄 1_HTML5基础.md](./mybook/05_web/01_前端基础/01_HTML5基础.md) · [📄 2_CSS布局.md](./mybook/05_web/01_前端基础/03_CSS布局.md)
</details>

#### JavaScript

<details>
<summary>JavaScript 核心</summary>

- 数据类型：原始类型（string/number/boolean/null/undefined/symbol/bigint）/ 引用类型
- 变量声明：var / let / const / 作用域 / 变量提升
- 函数：箭头函数 / 闭包 / this 指向 / call/apply/bind
- 原型链：__proto__ / prototype / Object.create / class 语法糖
- 异步编程：Callback / Promise / async-await / Generator / 事件循环（宏任务/微任务）
- ES6+ 特性：解构/展开运算符/模板字符串/Map-Set/Proxy-Reflect/Symbol/迭代器
- 模块化：ESM（import/export）/ CommonJS（require/module.exports）/ 动态 import()
- DOM 操作 / BOM / 事件机制（冒泡/捕获/委托）
- 错误处理：try-catch / Error 类型 / unhandledrejection


> [📄 1_JS核心.md](./mybook/05_web/01_前端基础/02_JS核心.md)
</details>

<details>
<summary>TypeScript</summary>

- 类型系统：基础类型/联合类型/交叉类型/字面量类型/枚举
- 接口与类型别名：interface vs type / 泛型接口
- 泛型：泛型函数/泛型类/泛型约束（extends）/条件类型/映射类型
- 工具类型：Partial/Required/Readonly/Pick/Omit/Record/Exclude/Extract/ReturnType
- 类型守卫：typeof/instanceof/in/自定义守卫
- 装饰器（experimental）/ 命名空间 / 声明文件（.d.ts）
- tsconfig.json 配置：strict/target/module/lib/paths


> [📄 2_TypeScript.md](./mybook/05_web/01_前端基础/04_TypeScript.md)
</details>

### 5.2 前端框架

#### React

<details>
<summary>React</summary>

- 核心概念：JSX / 组件（函数/类）/ Props / State
- Hooks：useState/useEffect/useContext/useReducer/useMemo/useCallback/useRef
- 自定义 Hook / Hook 规则
- 路由：React Router（BrowserRouter/Route/Link/useNavigate/useParams）
- 状态管理：Context API / Redux Toolkit / Zustand / Jotai
- 性能优化：React.memo / useMemo / useCallback / 代码分割（lazy/Suspense）
- 服务端渲染：Next.js（SSR/SSG/ISR/App Router）
- 测试：Jest / React Testing Library


> [📄 React.md](./mybook/05_web/02_前端框架/02_React.md)
</details>

#### Vue

<details>
<summary>Vue</summary>

- Vue 3 核心：Composition API / ref / reactive / computed / watch / watchEffect
- 组件：SFC（.vue）/ Props / Emit / Provide-Inject / Slot
- 模板语法：v-if/v-for/v-model/v-on/v-bind / 指令
- 路由：Vue Router（createRouter/useRouter/useRoute/导航守卫）
- 状态管理：Pinia（defineStore）/ Vuex（legacy）
- 组合式函数（Composables）
- Nuxt.js：SSR/SSG/混合渲染


> [📄 Vue.md](./mybook/05_web/02_前端框架/03_Vue.md)
</details>

### 5.3 后端与协议

#### Node.js

<details>
<summary>Node.js</summary>

- 运行时架构：V8 + libuv 事件循环
- 核心 API：fs / path / http / stream / child_process / cluster
- 包管理：npm / pnpm / yarn / npx / package.json / lock 文件
- Web 框架：Express / Koa / Fastify / NestJS
- 中间件 / 错误处理 / 日志
- 进程管理：PM2 / Docker / systemd


> [📄 Node.js.md](./mybook/05_web/02_前端框架/01_Node.js.md)
</details>

#### 网络与浏览器

<details>
<summary>HTTP 协议</summary>

- HTTP/1.1：请求方法/状态码/头部/持久连接/管线化
- HTTP/2：多路复用/头部压缩（HPACK）/服务器推送/二进制分帧
- HTTP/3（QUIC）：基于 UDP/0-RTT/连接迁移/无队头阻塞
- HTTPS：TLS 握手/证书链/密码套件
- Cookie：属性（Secure/HttpOnly/SameSite/Domain/Path）/ 第三方 Cookie 限制
- 缓存：强缓存（Cache-Control/Expires）/ 协商缓存（ETag/Last-Modified）
- 跨域：CORS（简单请求/预检请求）/ JSONP / 代理
- 认证：Bearer Token / OAuth 2.0 / Session-Cookie


> [📄 HTTP协议.md](./mybook/05_web/03_后端与协议/01_HTTP协议.md)
</details>

<details>
<summary>浏览器原理</summary>

- 渲染流程：DOM 树 → CSSOM → Render Tree → Layout → Paint → Composite
- 关键渲染路径优化
- V8 引擎：解析 → 编译（Ignition/TurboFan）→ 执行
- 垃圾回收：新生代（Scavenge）/老生代（Mark-Sweep/Mark-Compact）
- 事件循环：宏任务（setTimeout/setInterval/I/O）/微任务（Promise/MutationObserver）
- 性能优化：重排重绘最小化/虚拟列表/懒加载/预加载/CDN
- Web 安全：XSS / CSRF / CSP / CORS / 点击劫持


> [📄 浏览器原理.md](./mybook/05_web/03_后端与协议/02_浏览器原理.md)
</details>

### 5.4 工程化与工具

#### 构建与样式

<details>
<summary>Tailwind CSS</summary>

- 原子化 CSS 框架：utility-first 设计理念，通过组合工具类直接在 HTML 中编写样式
- 响应式设计：`sm:` / `md:` / `lg:` / `xl:` / `2xl:` 前缀适配不同屏幕
- 状态变体：`hover:` / `focus:` / `active:` / `dark:` / `group-hover:` 等伪类修饰
- JIT（即时编译）模式：按需生成样式，减小产物体积，支持任意值 `w-[123px]`
- 定制化：`tailwind.config.js` 配置主题（颜色/字体/间距/断点）、插件扩展
- 组件提取：`@apply` 指令将工具类组合提取为复用组件
- 常用 UI 库：DaisyUI（组件库）、Headless UI（无样式组件）、HyperUI（模板）


> [📄 tailwind-css.md](./mybook/05_web/04_工程化与工具/tailwind-css.md)
</details>

<details>
<summary>Vite</summary>

- 新一代前端构建工具：开发极快、配置简洁
- 开发模式：基于原生 ESM 的 Dev Server，无需打包即可提供服务
- HMR（热模块替换）：模块级别的精准热更新，速度与项目规模无关
- 生产构建：基于 Rollup，自动代码分割、Tree-shaking、CSS 代码分割
- 插件系统：兼容 Rollup 插件 + Vite 独有钩子（`config` / `transformIndexHtml` / `configureServer`）
- 预构建：esbuild 处理依赖预构建（CommonJS → ESM），速度极快
- 配置文件：`vite.config.ts`，支持多环境配置
- 框架支持：Vue / React / Svelte / Lit 等模板一键创建


> [📄 vite.md](./mybook/05_web/04_工程化与工具/vite.md)
</details>

#### 文档与插件

<details>
<summary>Vuepress</summary>

- 快速入门 / 部署到 GitHub Pages
- Markdown 配置与扩展 / 页面配置 / 组件 / 加密 / 布局


> [📄 vuepress.md](./mybook/05_web/04_工程化与工具/vuepress.md) · [📁 web/4_工程化与工具/vuepress-demo/](./mybook/05_web/04_工程化与工具/vuepress-demo/)
</details>

<details>
<summary>VSCode插件开发</summary>

- 开发环境搭建：Node.js + pnpm + yo code 脚手架生成模板
- Extension API 核心：`vscode` 模块提供命令/视图/语言服务/调试等 API
- 命令注册：`commands.registerCommand`，`package.json` 中声明 `contributes.commands`
- 视图与侧边栏：TreeDataProvider / WebviewView，自定义侧边栏面板
- 语言服务：DocumentProvider / CompletionItemProvider / CodeLensProvider / HoverProvider
- 状态栏与通知：`window.createStatusBarItem` / `window.showInformationMessage`
- 调试适配：DebugAdapterDescriptorFactory，支持自定义语言调试
- 打包发布：`vsce package` 打包 `.vsix`，发布到 VSCode Marketplace


> [📄 memos-vscode插件开发记录.md](./mybook/05_web/04_工程化与工具/vscode/memos-vscode插件开发记录.md)
</details>

<details>
<summary>Markdown</summary>

- Markdown 介绍 / 配置 / 扩展（VuePress / 主题 / 图片增强）


> [📄 markdown.md](./mybook/05_web/04_工程化与工具/vuepress-demo/markdown.md)
</details>

<details>
<summary>VSCode 配置备忘</summary>

- Markdown 配置粘贴文件目录
- 常用配置与快捷键


> [📄 vscode配置备忘.md](./mybook/05_web/04_工程化与工具/vscode配置备忘.md)
</details>

---

## 六、安全

### 6.1 Web安全

#### 漏洞与攻击

<details>
<summary>OWASP Top 10</summary>

- A01 权限控制失效（Broken Access Control）
- A02 加密机制失效（Cryptographic Failures）
- A03 注入（Injection）：SQL/NoSQL/OS/LDAP
- A04 不安全设计（Insecure Design）
- A05 安全配置错误（Security Misconfiguration）
- A06 脆弱过时组件（Vulnerable and Outdated Components）
- A07 身份认证失败（Identification and Authentication Failures）
- A08 软件和数据完整性失败（Software and Data Integrity Failures）
- A09 安全日志与监控失败（Security Logging and Monitoring Failures）
- A10 服务器端请求伪造（SSRF）


> [📄 1_OWASP-Top10.md](./mybook/12_security/1_Web安全/1_OWASP-Top10.md)
</details>

<details>
<summary>Web 安全</summary>

- **SQL 注入**：联合查询/报错注入/盲注（布尔/时间）/堆叠查询/二次注入；预编译防御
- **XSS**：反射型/存储型/DOM 型；CSP 防御/HttpOnly Cookie/输入输出编码
- **CSRF**：SameSite Cookie/CSRF Token/Referer 校验/双重提交 Cookie
- **SSRF**：内网探测/云元数据获取/协议走私；URL 白名单/禁用重定向/网络隔离
- **XXE**：XML 外部实体注入；禁用 DTD/外部实体/使用 JSON 替代
- **文件上传**：Webshell/双重扩展名/Content-Type 绕过；白名单/重命名/隔离存储
- **反序列化**：Java/Python/PHP 反序列化 RCE；白名单/签名校验/禁用危险类
- **点击劫持**：X-Frame-Options / CSP frame-ancestors
- **CORS 误配置**：Origin 反射/Null Origin/子域绕过
- **JWT 安全**：算法混淆/密钥爆破/None 算法/jku 注入


> [📄 3_常见漏洞.md](./mybook/12_security/1_Web安全/3_常见漏洞.md)
</details>

#### 认证与逻辑

<details>
<summary>常见认证方式</summary>

- **API Key**：在请求头/查询参数/Body 中携带密钥认证；简单但不安全，无法区分用户身份
- **Basic Auth**：`Authorization: Basic base64(user:pass)`；HTTP 明文传输不安全，需配合 HTTPS
- **Cookie**：服务端生成，客户端存储；Key-Value 形式，Value 最大 4KB；基于域名安全
- **Session**：服务端存储会话数据，客户端仅存 SessionID（通常在 Cookie 中）；支持多后端（数据库/缓存/Redis）
- **JWT（JSON Web Token）**：Header.Payload.Signature 三段式结构；无状态、跨域友好；默认不加密，不可存储敏感信息；无法主动废止 Token（需黑名单机制）；应使用 HTTPS 传输
  - Payload 标准字段：iss/exp/sub/aud/nbf/iat/jti
- **OAuth 2.0**：开放授权标准；四种授权模式：授权码（最安全）/隐式/密码/客户端凭证；通过 Access Token + Refresh Token 访问资源
- **SSO（单点登录）**：一次登录访问多个应用；CAS / SAML / OIDC 等协议；认证中心统一签发与验证令牌


> [📄 常见认证方式.md](./mybook/12_security/1_Web安全/常见认证方式.md)
</details>

<details>
<summary>逻辑漏洞</summary>

- **认证流程漏洞**：
  - 登录：验证码爆破/验证码返回异常/短信验证码与用户未绑定/前端验证/授权劫持/万能验证码/万能密码
  - 找回密码：任意用户密码重置/重置链接未绑定用户/重置凭证泄露
  - 注册流程：用户名枚举/批量注册
- **业务流程漏洞**：
  - 支付：零元购/刷虚拟币/优惠券属性篡改/无限领券/积分篡改
  - 权限绕过：水平越权/垂直越权/未授权访问
  - 拒绝服务：科学记数法攻击/资源耗尽
  - 关键信息泄漏


> [📄 逻辑漏洞.md](./mybook/12_security/1_Web安全/逻辑漏洞.md)
</details>

<details>
<summary>认证与授权</summary>

- 认证方式对比：API Key / Basic Auth / Session-Cookie / JWT / OAuth 2.0 / SSO
- API Key：请求头/查询参数携带密钥；简单但不安全
- Basic Auth：Base64 编码；需配合 HTTPS
- Session-Cookie：服务端存储会话；有状态
- JWT：Header.Payload.Signature；无状态/跨域友好/不可存储敏感信息
- OAuth 2.0：授权码/隐式/密码/客户端凭证四种模式
- SSO：CAS / SAML / OIDC；单点登录/单点登出
- 权限模型：RBAC / ABAC / ACL


> [📄 2_认证与授权.md](./mybook/12_security/1_Web安全/2_认证与授权.md)
</details>

### 6.2 安全工具与方法

#### 渗透测试

<details>
<summary>渗透测试方法论</summary>

- 信息收集：子域名/端口/指纹/目录/敏感信息泄露
- 漏洞扫描：自动化扫描 + 手工验证
- 漏洞利用：CVE 利用/EXP/提权
- 后渗透：权限维持/横向移动/数据窃取
- 报告编写：漏洞描述/复现步骤/风险评级/修复建议
- 工具链：Burp Suite / Nmap / Metasploit / Cobalt Strike / SQLMap


> [📄 1_方法论.md](./mybook/12_security/2_安全工具与方法/1_方法论.md)
</details>

<details>
<summary>Nuclei</summary>

- 基于 YAML 模板的快速漏洞扫描器（ProjectDiscovery 出品）
- 下载编译：`go build` 或下载预编译二进制
- 模板系统：YAML 定义请求/匹配/信息，社区模板库 nuclei-templates
- 使用：`nuclei -u target -t templates/`，支持标签过滤 `-tags cve`
- 集成到自己的项目：通过 Go API 创建引擎 → 设置执行器选项 → 加载模板 → 执行扫描
- 核心组件：core.Engine / catalog / loader / output / interactsh（OOB 检测）
- 模板标签：cve / cwe / fuzz / dos 等，可排除特定标签
- 输出：JSON / SARIF / Markdown 格式，支持自定义输出回调


> [📄 3_Nuclei.md](./mybook/12_security/2_安全工具与方法/3_Nuclei.md)
</details>

<details>
<summary>Nmap</summary>

- 网络映射器，开源网络探测和安全审计工具（C/C++ + Lua，1997 年首发）
- 主机发现：ARP/ICMP/TCP SYN/ACK/UDP/SCTP 多协议 Ping，支持组合探测
- 端口扫描：12 种扫描技术（SYN/Connect/UDP/SCTP/NULL/FIN/Xmas/ACK/Window/Maimon/自定义/IP协议）
- 版本检测：`-sV` 探测 650+ 协议，6500+ 模式匹配，强度可调（0-9）
- OS 检测：`-O` TCP/IP 栈指纹识别，2600+ OS 指纹数据库
- NSE 脚本引擎：Lua 脚本，600+ 内置脚本，13 个分类（auth/broadcast/default/discovery/dos/exploit/external/fuzzer/intrusive/malware/safe/version/vuln）
- 防火墙/IDS 规避：分片攻击/诱饵扫描/源端口欺骗/IP 选项/MAC 伪造/主机随机化
- 时序模板：T0（偏执）~ T5（疯狂），精细控制并行度/速率/超时

> [📄 4_Nmap.md](./mybook/12_security/2_安全工具与方法/4_Nmap.md) · [📄 4_Sysmon系统监控.md](./mybook/12_security/2_安全工具与方法/4_Sysmon系统监控.md)
</details>

<details>
<summary>Naabu</summary>

- ProjectDiscovery 出品的快速端口扫描器（Go，MIT 许可）
- 扫描模式：SYN（半开，需 root）/ CONNECT（默认，无特权）/ UDP
- CDN/WAF 感知排除：自动识别 CDN IP（Cloudflare/Akamai/Incapsula/Sucuri），仅扫 80/443
- 主机发现：ARP/ICMP/TCP SYN/ACK/IPv6 ND 多协议 Ping
- 被动端口发现：Shodan InternetDB API，无需主动探测
- 智能扫描：基于端口关联模型的预测性扫描，置信度可调
- Nmap 集成：`-nmap-cli` 自动对开放端口调用 nmap 做服务发现
- 管道化：原生 stdin/stdout，与 subfinder/httpx/nuclei 无缝协作

> [📄 5_Naabu.md](./mybook/12_security/2_安全工具与方法/5_Naabu.md) · [📄 5_Sysmon_for_Linux.md](./mybook/12_security/2_安全工具与方法/5_Sysmon_for_Linux.md)
</details>

<details>
<summary>渗透测试工具使用</summary>

- **Nmap**：网络扫描；端口扫描（-sS/-sT/-sU）/服务版本检测（-sV）/操作系统识别（-O）/脚本扫描（--script）
- **Burp Suite**：Web 渗透测试；Proxy/Scanner/Intruder/Repeater 模块
- **SQLMap**：自动化 SQL 注入检测与利用
- **Metasploit**：漏洞利用框架；exploit/payload/auxiliary 模块
- **Hydra**：在线密码爆破；支持 SSH/FTP/HTTP/MySQL 等协议
- **Dirsearch/Gobuster**：目录扫描与暴力破解
- **Wireshark**：网络流量分析；过滤器/协议解析/流量还原


> [📄 2_工具使用.md](./mybook/12_security/2_安全工具与方法/2_工具使用.md)
</details>

#### 漏扫与信息收集

<details>
<summary>漏扫爬虫</summary>

- 工作流程：爬取目标 → 构造请求 → 解析响应 → 判断漏洞 → 生成报告
- 爬取策略：广度优先/深度优先、URL 去重、子域名发现、目录扫描
- 漏洞判断：响应状态码/敏感信息泄露/错误信息/特征字符串匹配
- 报告生成：漏洞类型/位置/描述/修复建议/风险等级
- **katana**：ProjectDiscovery 出品的爬虫框架，支持标准/无头模式，JS 解析与表单自动填充
- **xrad**：轻量级资产探测与爬虫工具，支持多种协议探测
- 优化：并发控制、请求限速、定期更新规则库、遵守法律法规


> [📄 漏扫爬虫.md](./mybook/12_security/2_安全工具与方法/漏扫爬虫.md)
</details>

<details>
<summary>容器内信息收集</summary>

- 基础系统信息：/etc/os-release / hostname / 进程列表 / 网络配置
- 磁盘及挂载：df -h / mount / 存储卷类型
- 特权容器判断：是否为 PID 1 / Capabilities 完整性 / Seccomp 状态
- Capabilities：capsh --print / 常见危险 cap（CAP_SYS_ADMIN/CAP_NET_RAW/CAP_SYS_PTRACE）
- NetNamespace：ip addr / iptables / 网络隔离判断
- 本地敏感文件：/etc/shadow / .env / kubeconfig / SSH 密钥 / 云厂商凭证
- 集群信息：命名空间 / Service Account / Master IP / 内网探测 / API Server 连通性
- 判断是否为容器环境：/.dockerenv / cgroup 信息 / proc/1/cgroup


> [📄 容器内信息收集.md](./mybook/12_security/3_云与容器安全/容器内信息收集.md)
</details>

### 6.3 云与容器安全

<details>
<summary>容器 & 云安全</summary>

- 容器逃逸：特权容器/Cgroup逃逸/dirty cow/内核漏洞/挂载逃逸
- K8s 安全：RBAC/Pod Security Standards/NetworkPolicy/Secret 加密/etcd 安全
- 镜像安全：基础镜像选择/最小权限/镜像签名/漏洞扫描（Trivy/Snyk）
- 云安全：IAM 最小权限/VPC 隔离/安全组/密钥管理（KMS）
- 供应链安全：SBOM/软件签名/SLSA 框架/依赖锁定


> [📄 Docker安全.md](./mybook/12_security/3_云与容器安全/Docker安全.md) · [📄 K8s安全.md](./mybook/12_security/3_云与容器安全/K8s安全.md)
> [📄 09_Falco详解.md](./mybook/12_security/3_云与容器安全/09_Falco详解.md)
</details>

### 6.4 安全开发

<details>
<summary>网络流量安全分析</summary>

- 全流量安全分析：流量采集、协议解析、日志分析、规则检测、威胁发现、资产识别
- 协议解析：TCP/IP（握手安全、关键字段）、HTTP（注入/XSS/C2检测）、DNS（隧道/DGA/Fast Flux）、TLS（JA3指纹/SNI）、SMB（EternalBlue/横向移动）、FTP
- 流量采集：端口镜像/TAP/内核抓包/eBPF；高性能抓包（PF_RING/DPDK/AF_PACKET V3/XDP）
- 会话重组：IP分片重组→TCP流重组→协议识别→数据提取
- 元数据提取：五元组、时间、字节、包数、应用层信息

> [📄 01_网络流量安全分析.md](./mybook/12_security/4_安全开发/01_网络流量安全分析.md)
</details>

<details>
<summary>安全产品与检测体系</summary>

- IDS/IPS：签名检测/异常检测/行为分析；Suricata（多线程、EVE JSON、规则语法）、Snort
- NDR：全流量可见性、高级威胁检测、自动化响应、回溯分析、实体分析
- Zeek：事件驱动、50+协议解析器、结构化日志（conn/http/dns/ssl/files/weird/notice）
- Arkime：全流量PCAP捕获、Elasticsearch索引、Web界面检索
- SOC/SIEM：日志采集→归一化→关联分析→告警→可视化；Splunk/ELK/QRadar/Wazuh
- Nuclei：YAML模板漏洞扫描、多协议支持、社区模板库

> [📄 02_安全产品与检测体系.md](./mybook/12_security/4_安全开发/02_安全产品与检测体系.md)
</details>

<details>
<summary>告警处理与关联分析</summary>

- 告警生命周期：生成→去重→聚合→降噪→关联→溯源→处置→复盘
- 去重策略：精确去重/模糊去重/语义去重
- 聚合维度：按攻击源/目标/类型/时间窗口/攻击阶段
- 降噪方法：白名单过滤/资产上下文/置信度评分/基线对比/告警疲劳控制
- 关联分析：时序关联/因果关联/资产关联/实体关联/情报关联
- 攻击链还原：基于ATT&CK将离散告警映射到攻击阶段

> [📄 03_告警处理与关联分析.md](./mybook/12_security/4_安全开发/03_告警处理与关联分析.md)
</details>

<details>
<summary>安全数据工程</summary>

- Kafka：流量日志分发、告警事件总线、数据缓冲、采集与处理解耦
- OpenSearch/Elasticsearch：日志存储检索、告警索引、会话索引、ILM生命周期管理
- ClickHouse：大规模日志聚合查询、统计报表、行为基线、威胁狩猎
- Redis：告警去重、速率计数、会话状态、情报缓存、分布式锁
- MinIO：PCAP归档、样本存储、规则包管理
- 数据架构：Lambda架构（批处理+速度层）、实时流处理、Go检测引擎

> [📄 04_安全数据工程.md](./mybook/12_security/4_安全开发/04_安全数据工程.md)
</details>

<details>
<summary>AI在安全中的应用</summary>

- 恶意流量识别：统计/协议/行为/载荷特征；随机森林/XGBoost/DNN/1D-CNN
- DGA检测：域名特征（熵值/辅音比例/n-gram）；规则统计+深度学习（BiLSTM/CNN）
- 异常行为检测：统计基线/自编码器/Isolation Forest/LOF/时间序列；UEBA
- 告警降噪ML：分类模型（真实/误报/不确定）、排序模型（威胁程度排序）
- NLP安全应用：敏感信息识别(NER)、恶意代码分析、威胁情报提取、钓鱼检测
- 模型工程化：gRPC推理服务、特征一致性、模型更新、数据漂移监控

> [📄 05_AI在安全中的应用.md](./mybook/12_security/4_安全开发/05_AI在安全中的应用.md)
</details>

<details>
<summary>ATT&CK与威胁情报</summary>

- ATT&CK战术矩阵：侦察→资源开发→初始访问→执行→持久化→提权→防御规避→凭据访问→发现→横向移动→收集→C2→数据渗出
- 常见技术检测：初始访问(T1566/T1190)、执行(T1059/T1047)、持久化(T1547/T1053)、横向移动(T1021/T1550)、C2(T1071/T1573)
- IOC：IP/域名/URL/Hash/Email/证书；生命周期管理
- TTP：战术+技术+程序，比IOC更稳定的检测维度
- 情报源：商业情报/OSINT/社区情报/内部情报；STIX/TAXII标准
- 溯源分析：基础设施关联/样本关联/TTP关联/语言时区分析

> [📄 06_ATTCK与威胁情报.md](./mybook/12_security/4_安全开发/06_ATTCK与威胁情报.md)
</details>

<details>
<summary>Suricata详解</summary>

- 架构：多线程流水线（Workers/Autofp/Single模式），线程模块（Receive→Decode→StreamTCP→Detect→Verdict→Log）
- 匹配算法：Aho-Corasick多模式匹配、Boyer-Moore长字符串、Hyperscan Intel加速、PCRE-JIT
- 规则语法：Action(alert/drop/reject/pass) + Protocol(tcp/udp/http/dns/tls/smb等) + IP/端口 + Options
- 内容匹配：content/nocase/depth/offset/distance/within/hex/fast_pattern
- HTTP关键字：http_uri/http_method/http_client_body/http_user_agent/http_stat_code等20+
- TLS关键字：tls_sni/ja3_hash/ja3_string/tls_cert_subject/tls_cert_issuer
- Flow关键字：flow方向状态、flowbits跨包检测、flowint流变量
- 配置文件：suricata.yaml（vars/af-packet/outputs/threshold）
- EVE JSON输出：alert/http/dns/tls/ssh/files/flow/stats事件类型
- 性能优化：Workers模式+DPDK/PF_RING、fast_pattern规则优化、memcap调优
- 集成方案：ELK Stack、Zeek（Community ID关联）、Kafka、Go自研平台

> [📄 07_Suricata详解.md](./mybook/12_security/4_安全开发/07_Suricata详解.md)
> [📄 07_Suricata知识点总结.md](./mybook/12_security/4_安全开发/07_Suricata知识点总结.md)
</details>

<details>
<summary>数据库加密协议解析</summary>

- MySQL：协议内嵌TLS协商，Initial Handshake Packet→SSL Connection Request→TLS握手→Handshake Response
- PostgreSQL：独立SSLRequest包协商（Code=80877103），服务端回复'S'/'N'，还支持GSSAPI加密
- SQL Server TDS：Pre-Login协商ENCRYPTION Token（0x00~0x03），Login7认证，TDS包头8字节
- Oracle TNS：TNS协议内嵌加密协商，支持TLS/ANO/DH/RSA，sqlnet.ora配置加密策略
- Redis/MongoDB：标准TLS握手，Redis 6.0+原生支持
- 安全审计解密：证书导入、授权账户、代理模式、会话密钥提取
- Go解析：MySQL Handshake解析、PgSSLRequest识别、TDS Pre-Login解析、通用数据库协议识别

> [📄 08_数据库加密协议解析.md](./mybook/12_security/4_安全开发/08_数据库加密协议解析.md)
</details>

### 6.5 域安全与凭证提取

<details>
<summary>域凭证提取技术</summary>

- **本地凭证提取**：
  - SAM/SECURITY 注册表解密：SYSKEY 算法/Scrambler Key/PEK 解密/NTLM Hash 提取
  - LSASS 内存转储：9种方法(任务管理器/Procdump/comsvcs.dll/SilentProcessExit/MiniDumpWriteDump/SQLDumper/Createdump/ProcessExplorer/PowerShell)+PPL绕过
  - LSA Secrets：机器账户/缓存域凭据/NL$KM/DPAPI_SYSTEM/服务账户密码
- **绕过杀软技术**：
  - 白加黑 DLL：DLL劫持/侧加载/远程注入/签名程序利用/regsvr32绕过
  - Shellcode分离：C/C#/PowerShell/宏/JS五种加载器 + AES/RC4/XOR多层加密
  - 免杀：12种技术（混淆/API动态调用/系统调用/反射加载/进程镂空/环境检测等）
  - 白签名 LOLBins：MSBuild/InstallUtil/Mshta/Certutil/Bitsadmin/Wmic 等
- **域控制器凭证提取**：
  - NTDS.DIT 数据库结构：ESE 引擎/datatable/PEK密码加密/四种提取方法对比
  - DCSync：DRSUAPI协议/DRSGetNCChanges调用流程/最小权限利用/ACL滥用
- **Gadgets（攻击利用技术）**：
  - .NET Gadgets：PSRemoting/WMI/DCOM/ScheduledTask
  - Office Gadgets：VBA宏 + PowerShell加载/反射加载
  - LOLBins：8种系统工具 Lolbas 利用/MSHTA/Regsvr32/Rundll32
  - DotNetToJScript：.NET程序集转为JS/VBS绕过
- **Kerberos深度攻击**：
  - 票据类型：TGT/TGS/白银/黄金/钻石/蓝宝石
  - 域委派攻击：无约束/约束/RBCD/s4u2self/s4u2proxy
  - Kerberoasting/AS-REP Roasting/子域信任/SID History注入
- **内存 & 磁盘镜像取证提取**：
  - 内存获取：WinPMEM/DumpIt/FTK/Magnet
  - Volatility3/2：hashdump/lsadump/cachedump/procdump
  - MemProcFS：将内存挂载为文件系统直接读取
  - 磁盘镜像四步提取法：注册表→NTDS→DPAPI→浏览器/RDP凭证
- **攻击链**：初始访问→信息收集→横向移动→提权→域控攻陷→持久化
- **检测与防御**：12种攻击检测Event ID/防御四层模型/审计策略配置/防御命令
- **AD攻击面矩阵**：9大攻击面(Kerberos/ADCS/ACL/GPO/信任/委派/喷洒/中继/ADFS)

> [📄 01_域凭证提取技术.md](./mybook/12_security/5_域安全与凭证提取/01_域凭证提取技术.md)
</details>

---

## 七、通用基础

### 7.1 数据结构与算法

#### 基础数据结构

<details>
<summary>数据结构</summary>

- 数组 / 链表 / 列表 / 栈 / 队列 / 双向队列
- 哈希表 / 哈希冲突 / 哈希算法
- 二叉树 / 二叉搜索树 / AVL树 / 堆 / Top-K
- 图（邻接矩阵/邻接表/遍历）


> [📄 数据结构与算法.md](./mybook/07_algorithms/数据结构与算法.md) · [📁 algorithms/algo/](./mybook/07_algorithms/algo/)
</details>

#### 算法设计与分析

<details>
<summary>算法设计</summary>

- 迭代与递归 / 分治 / 回溯
- 动态规划（0-1背包 / 完全背包 / 编辑距离 / 最长公共子序列）
- 贪心算法（分数背包 / 最大容量 / 最大乘积切割）
- 二分查找 / 搜索算法


> [📁 algorithms/algo/](./mybook/07_algorithms/algo/)
</details>

<details>
<summary>排序算法</summary>

- 冒泡 / 插入 / 选择 / 快速 / 归并 / 堆排序
- 桶排序 / 计数排序 / 基数排序
- 算法总览（时间/空间/稳定性对比）


> [📁 algorithms/algo/chapter_sorting/](./mybook/07_algorithms/algo/chapter_sorting/)
</details>

<details>
<summary>复杂度分析</summary>

- 时间复杂度 / 空间复杂度 / 性能评估
- 最差/最佳/平均时间复杂度


> [📁 algorithms/algo/chapter_computational_complexity/](./mybook/07_algorithms/algo/chapter_computational_complexity/)
</details>

#### 理论与刷题

<details>
<summary>基础理论</summary>

- 数字编码（原码/反码/补码/浮点数）
- 字符编码（ASCII / GBK / Unicode / UTF-8）
- 内存与缓存


> [📄 number_encoding.md](./mybook/07_algorithms/algo/chapter_data_structure/number_encoding.md) · [📄 character_encoding.md](./mybook/07_algorithms/algo/chapter_data_structure/character_encoding.md)
</details>

<details>
<summary>算法题分类（BM系列）</summary>

- 链表篇（14题）/ 二叉树篇（15题）/ 搜索与回溯篇（8题）
- 动态规划篇（11+题）/ 堆栈与队列篇（9题）
- 哈希与双指针篇 / 排序篇 / 字符串篇 / 位运算篇 / 二分查找篇
- 设计数据结构（LRU / LFU）
- 面试高频 TOP10 与知识要点


</details>

### 7.2 操作系统 & Linux

#### 操作系统

<details>
<summary>操作系统基础</summary>

- 进程管理：进程状态/进程调度/进程通信（管道/消息队列/共享内存/信号量/信号/Socket）
- 线程与协程：用户级线程/内核级线程/线程模型（1:1/N:1/M:N）
- 内存管理：虚拟内存/分页/分段/页面置换算法（FIFO/LRU/Clock）/内存映射
- 文件系统：inode/目录结构/文件锁/日志文件系统
- I/O 模型：阻塞/非阻塞/I/O 多路复用（select/poll/epoll/kqueue）/信号驱动/异步 I/O
- 死锁：条件（互斥/持有并等待/不可抢占/循环等待）/预防/检测/恢复


> [📄 1_操作系统基础.md](./mybook/10_os-linux/01_操作系统基础.md)
</details>

<details>
<summary>内存管理</summary>

- 虚拟内存：地址空间/分页机制/页表/TLB
- 物理内存管理：伙伴系统/Slab 分配器/页面分配
- 页面置换算法：FIFO/LRU/Clock/OPT
- 内存映射：mmap/共享内存/匿名映射
- Swap：交换空间/换入换出/swappiness 调优
- 内存泄漏排查：valgrind/AddressSanitizer
- OOM Killer：触发机制/oom_score/oom_adj


> [📄 02_内存管理.md](./mybook/10_os-linux/02_内存管理.md)
</details>

<details>
<summary>I/O 模型</summary>

- I/O 操作流程：用户空间 ↔ 内核空间 ↔ 设备
- 五种 I/O 模型：阻塞 I/O / 非阻塞 I/O / I/O 多路复用 / 信号驱动 I/O / 异步 I/O
- I/O 多路复用：select / poll / epoll（LT/ET）
- 零拷贝：mmap / sendfile / splice
- Reactor 模式与 Proactor 模式


> [📄 03_IO模型.md](./mybook/10_os-linux/03_IO模型.md)
</details>

#### Linux与工具

<details>
<summary>Linux 核心</summary>

- 常用命令：文件/进程/网络/权限/文本处理（grep/sed/awk/find）
- 权限系统：rwx/umask/chmod/chown/ACL/SUID/SGID/Sticky bit
- 进程管理：ps/top/htop/kill/nice/renice/systemd
- 网络工具：ip/ss/netstat/tcpdump/nc/curl/dig/iptables/nftables
- Shell 脚本：变量/条件/循环/函数/数组/正则/管道/重定向
- 包管理：apt/yum/dnf/pacman/alpine
- 系统调优：ulimit/sysctl/cgroup/namespace
- 性能诊断：top/vmstat/iostat/sar/perf/strace/lsof


> [📁 os-linux/](./mybook/10_os-linux/)
</details>

<details>
<summary>iptables 与 netfilter</summary>

- **netfilter 架构**：5 个钩子点（PREROUTING/INPUT/FORWARD/OUTPUT/POSTROUTING）
- **四表五链**：filter（INPUT/FORWARD/OUTPUT）/nat（PREROUTING/OUTPUT/POSTROUTING）/mangle/raw
- **iptables 语法**：规则/链/表/匹配条件/动作（ACCEPT/DROP/REJECT/DNAT/SNAT/MASQUERADE）
- **常用规则**：放行 SSH/HTTP、NAT 转发、端口映射、IP 伪装
- **持久化**：iptables-save/iptables-restore/iptables-persistent
- **iptables vs nftables**：语法简化/集合/字典/兼容性


> [📄 4_iptables与netfilter.md](./mybook/10_os-linux/04_iptables与netfilter.md)
</details>

<details>
<summary>Firewalld</summary>

- **概述**：动态防火墙管理工具，iptables/nftables 前端
- **zone 概念**：public/trusted/home/internal/dmz/work/external/block/drop
- **服务与端口管理**：firewall-cmd 常用命令（--add-service/--add-port/--reload）
- **富规则（Rich Rules）**：复杂规则配置（source/destination/port/action/log）
- **直接规则**：--direct 选项直接操作 iptables
- **与 Docker/K8s 兼容性**：Docker 操作 iptables 导致冲突/解决方案


> [📄 5_Firewalld.md](./mybook/10_os-linux/05_Firewalld.md)
</details>

<details>
<summary>DenyHosts 与 SSH 安全</summary>

- **SSH 暴力破解**：原理与危害/常见攻击方式
- **DenyHosts**：安装配置/工作原理（分析日志→写入 hosts.deny）/同步服务器
- **Fail2Ban**：更强大的替代方案/正则匹配/jail 配置/action 配置
- **SSH 安全加固**：密钥认证/禁用 root/修改端口/白名单/MaxAuthTries
- **与 iptables/Firewalld 联动**：自动封禁 IP


> [📄 6_DenyHosts与SSH安全.md](./mybook/10_os-linux/06_DenyHosts与SSH安全.md)
</details>

<details>
<summary>Linux 性能优化</summary>

- **方法论**：USE 方法（Utilization/Saturation/Errors）
- **CPU 优化**：top/vmstat/mpstat/perf/火焰图/上下文切换/运行队列
- **内存优化**：free/vmstat/sar/swap/页面缓存/大页内存（HugePages）/OOM Killer
- **磁盘 I/O 优化**：iostat/iotop/调度器（cfq/deadline/noop/mq-deadline）/RAID/SSD 优化
- **网络优化**：ss/netstat/tcpdump/连接数调优/内核参数（sysctl）/TCP 调优
- **系统级调优**：ulimit/cgroup/NUMA/IRQ 亲和性/IRQ balance
- **常用内核参数**：net.core.somaxconn/net.ipv4.tcp_tw_reuse/vm.swappiness 等
- **性能优化清单与排查流程**


> [📄 7_Linux性能优化.md](./mybook/10_os-linux/07_Linux性能优化.md)
</details>

<details>
<summary>Linux 网络工具</summary>

- **网络诊断**：ip/ss/ping/traceroute/mtr/nslookup/dig
- **流量分析**：tcpdump/wireshark/nethogs/iftop/nload
- **连接管理**：nc/curl/telnet/ssh
- **网络配置**：ip route/bridge/vlan/bonding/team
- **DNS 工具**：dig/host/nslookup/resolvectl/systemd-resolved


> [📄 8_Linux网络工具.md](./mybook/10_os-linux/08_Linux网络工具.md)
</details>

<details>
<summary>Shell 编程</summary>

- **Shell 基础**：变量/字符串/数组/特殊变量（$?/$!/$$/$#/$@/$0）
- **条件判断**：test/[/[[/case
- **循环**：for/while/until/select/break/continue
- **函数**：定义/参数/返回值/局部变量/递归
- **文本处理三剑客**：grep（模式匹配/正则）/sed（流编辑/替换/删除/插入）/awk（字段处理/报表生成）
- **重定向与管道**：stdin/stdout/stderr/here document/进程替换
- **正则表达式**：BRE/ERE/常用模式/零宽断言
- **脚本调试**：set -x/-e/-u/-o pipefail、trap 信号处理
- **高级技巧**：并发执行（xargs/GNU parallel）/临时文件/安全编程
- **Shell 编程风格与最佳实践**
- **常用脚本模板**：日志轮转/备份/健康检查/批量部署


> [📄 9_Shell编程.md](./mybook/10_os-linux/09_Shell编程.md)
</details>

<details>
<summary>网络协议</summary>

- **TCP**：三次握手/四次挥手/滑动窗口/拥塞控制（慢启动/拥塞避免/快重传/快恢复）/流量控制
- **UDP**：无连接/不可靠/应用场景（DNS/视频/QUIC）
- **IP**：IPv4/IPv6/子网划分/NAT/路由/ICMP
- **ARP / DHCP / DNS** 解析流程
- **TLS/SSL**：握手流程/密钥协商/证书验证/会话恢复/0-RTT
- **WebSocket**：全双工/握手升级/心跳/子协议
- **gRPC 协议**：HTTP/2 + Protobuf / 四种流模式
- **WireGuard**：现代化高性能 VPN 协议；基于 UDP；Curve25519 密钥交换/Chacha20-Poly1305 加密/Poly1305 认证；内核模块（wg-go）或 Userspace（wireguard-go）实现；配置简单（Peer/Endpoint/AllowedIPs）；支持 IPv4/IPv6 双栈


> [📄 11_网络协议.md](./mybook/10_os-linux/11_网络协议.md)
</details>

<details>
<summary>Git 高级</summary>

- 分支策略：Git Flow / GitHub Flow / Trunk-Based Development
- 交互式 rebase：squash/reword/edit/fixup/drop
- cherry-pick / revert / reflog / bisect
- 子模块（submodule）/ 子树（subtree）
- Git LFS 大文件管理
- Hook 机制：pre-commit / commit-msg / pre-push
- .gitignore / .gitattributes / sparse-checkout
- 冲突解决策略与最佳实践


> [📄 10_Git高级.md](./mybook/10_os-linux/10_Git高级.md) · [📄 12_Windows驱动开发.md](./mybook/10_os-linux/12_Windows驱动开发.md) · [📄 13_Linux_eBPF.md](./mybook/10_os-linux/13_Linux_eBPF.md)
</details>

### 7.3 架构设计

#### 系统架构

<details>
<summary>系统架构</summary>

- 软件过程模型（瀑布/原型/螺旋/敏捷/RUP）
- CMM / CMMI
- 需求工程 / 结构化方法（SASD）/ 面向对象方法
- 软件架构风格 / 架构复用 / DSSA


> [📄 0_软考架构基础.md](./mybook/08_architecture/01_软考架构基础.md) · [📄 1_架构设计.md](./mybook/08_architecture/02_架构设计.md) · [📄 03_分布式理论.md](./mybook/08_architecture/03_分布式理论.md)
</details>

#### 数据库

<details>
<summary>数据库</summary>

- 关系数据库：范式设计/ER 模型/SQL 优化/索引原理（B+Tree）/事务隔离级别
- 数据库设计：概念设计/逻辑设计/物理设计/反范式化
- NoSQL：键值（Redis）/文档（MongoDB）/列族（HBase）/图（Neo4j）；CAP 权衡
- 分布式数据库：分片/复制/一致性哈希/分布式事务（2PC/3PC/TCC/Saga）
- 数据库优化：慢查询分析/执行计划/索引优化/连接池/读写分离
- Redis 分布式缓存：数据类型/持久化/集群模式/缓存策略


> [📁 architecture/数据库/](./mybook/08_architecture/01_数据库/)

**详细文档**：
> [📄 1_关系数据库.md](./mybook/08_architecture/01_数据库/1_关系数据库.md) · [📄 2_NoSQL.md](./mybook/08_architecture/01_数据库/2_NoSQL.md) · [📄 3_分布式数据库.md](./mybook/08_architecture/01_数据库/3_分布式数据库.md)
</details>

#### 信息系统与安全

<details>
<summary>信息系统架构</summary>

- 面向服务架构（SOA）：服务契约/服务编排/ESB 企业服务总线/EDA 事件驱动架构
- 层次式架构：表现层/业务层/数据访问层/跨层通信
- C/S 与 B/S 架构：客户端安装 vs 浏览器访问/性能 vs 跨平台
- 中台架构：技术中台/数据中台/业务中台
- 中间件：消息队列/缓存/搜索/配置中心/注册中心/网关/任务调度
- 物联网架构：感知层/网络层/平台层/应用层；边缘计算/MQTT/CoAP
- 大型网站架构演进九阶段：①单体架构 → ②应用数据分离 → ③使用缓存 → ④服务集群（负载均衡） → ⑤数据库读写分离 → ⑥CDN和反向代理 → ⑦分布式文件系统和数据库 → ⑧NoSQL和搜索引擎 → ⑨业务拆分（微服务化）


> [📄 3_信息系统架构.md](./mybook/08_architecture/04_信息系统架构.md) · [📄 0_大型网站架构演进.md](./mybook/08_architecture/06_大型网站架构演进.md) · [📄 07_在线文档多人实时编辑.md](./mybook/08_architecture/07_在线文档多人实时编辑.md)
</details>

<details>
<summary>未来技术</summary>

- 机器人 / 边缘计算 / AI / 数字孪生 / 云计算与大数据


</details>

<details>
<summary>安全基础</summary>

- 访问控制：DAC/MAC/RBAC/ABAC 模型；三要素（主体/客体/控制策略）；实现机制（ACM/ACL/能力表/授权关系表）
- 数字签名：RSA/ECDSA 签名与验证 / 数字证书 / CA 链；五大特性（可信/不可伪造/不可重用/不可改变/不可抵赖）
- 信息安全保障体系：五性（机密性/完整性/可用性/可控性/可检查性）
- 常见攻击与防御：SQL注入/XSS/CSRF/DDoS/中间人攻击/暴力破解
- 加密算法：对称（AES/ChaCha20）/非对称（RSA/ECC）/哈希（SHA-256/bcrypt/HMAC）
- HTTPS：TLS 1.2/1.3 握手流程/ECDHE 密钥交换/Let's Encrypt
- OAuth 2.0：授权码/隐式/密码/客户端凭证四种模式
- JWT：Header.Payload.Signature/无状态/黑名单撤销
- 安全评估：等级保护（五级：用户自主保护/系统审计保护/安全标记保护/结构化保护/访问验证）/ 风险评估（要素：脆弱性/资产/威胁/风险/安全措施）/ 渗透测试 / 安全审计
- 安全保密技术：DLP（数据泄露防护）/ 数字水印
- 安全协议：SSL/TLS / PGP / IPSec / SET / HTTPS


> [📄 4_安全基础.md](./mybook/08_architecture/05_安全基础.md)
</details>

<details>
<summary>研发技术与产品</summary>

- 研发技术总监：职责描述、技术战略规划、团队管理、技术决策
- 研发技术能力：技能矩阵、能力评估、成长路径
- 数据安全产品：产品体系、核心功能、技术架构、市场分析

> [📄 08_研发技术总监职位描述.md](./mybook/08_architecture/08_研发技术总监职位描述.md) · [📄 08_研发技术能力总结.md](./mybook/08_architecture/08_研发技术能力总结.md)
> [📄 09_数据安全产品总结.md](./mybook/08_architecture/09_数据安全产品总结.md)
</details>

### 7.4 DevOps & 基础设施

#### 容器与编排

<details>
<summary>Kubernetes 核心概念</summary>

- 工作负载：Pod / Deployment / StatefulSet / DaemonSet / Job / CronJob
- 服务与网络：Service（ClusterIP/NodePort/LoadBalancer）/ Ingress / NetworkPolicy
- 配置管理：ConfigMap / Secret / 环境变量 / 挂载
- 存储：PV / PVC / StorageClass / CSI
- 调度：NodeSelector / Affinity / Taint & Toleration / PriorityClass
- 安全：RBAC / ServiceAccount / PodSecurityPolicy（→PSP→PSA）
- Helm 包管理：Chart / Release / Values / Repository
- 运维：kubectl / 滚动更新 / 回滚 / HPA / VPA / 资源限制


> [📄 1_K8s核心概念.md](./mybook/09_devops/kubernetes/1_K8s核心概念.md) · [📄 2_K8s实践.md](./mybook/09_devops/kubernetes/2_K8s实践.md) · [📄 3_Helm包管理.md](./mybook/09_devops/kubernetes/3_Helm包管理.md)
</details>

<details>
<summary>K8s 核心组件详解</summary>

- **API Server**：REST API 入口/认证（X509/Bearer Token/OIDC/Webhook）/授权（RBAC/ABAC/Node/Webhook）/准入控制（Admission Controller）/etcd 交互/高可用部署
- **etcd**：分布式 KV 存储/RAFT 一致性协议/数据模型（revision/key-value）/备份恢复（etcdctl snapshot）/性能调优/集群运维（扩缩容/迁移）
- **Scheduler**：调度流程（过滤→打分→绑定）/调度策略（NodeSelector/NodeAffinity/PodAffinity/Taint&Toleration/Priority&Preemption）/自定义调度器/调度框架（Scheduling Framework）
- **Controller Manager**：控制器模式（Informer/Reflector/Indexer）/Deployment Controller/ReplicaSet Controller/Node Controller 工作原理
- **kubelet**：Pod 生命周期管理/CRI 容器运行时接口/PLEG（Pod Lifecycle Event Generator）/探针（Liveness/Readiness/Startup）/资源上报/静态 Pod
- **kube-proxy**：iptables 模式/IPVS 模式/userspace 模式/Service 发现与负载均衡/conntrack 表
- **CoreDNS**：集群内 DNS 解析/Service 发现/自定义 DNS 配置/StubDomain/Upstream


> [📄 6_K8s核心组件详解.md](./mybook/09_devops/kubernetes/6_K8s核心组件详解.md)
</details>

<details>
<summary>K8s 持久化存储</summary>

- **Volume 类型**：emptyDir/hostPath/nfs/configMap/secret/downwardAPI
- **PV 与 PVC**：生命周期（Available→Bound→Released）/回收策略（Retain/Delete/Recycle）/容量/访问模式（RWO/ROX/RWX）
- **StorageClass**：动态供给/默认 StorageClass/参数配置/卷扩展（AllowVolumeExpansion）
- **CSI（Container Storage Interface）**：架构设计（Node Plugin/Controller Plugin）/外部 Provisioner/Attacher/Resizer/常用 CSI 驱动
- **常见存储方案**：
  - 本地存储：local-path-provisioner/openebs-local
  - 网络存储：NFS/Ceph RBD/CephFS/GlusterFS
  - 云存储：AWS EBS/Azure Disk/GCE PD/阿里云云盘
  - 分布式存储：Rook-Ceph/Longhorn/Vitastor
- **持久化最佳实践**：StatefulSet + PVC/数据备份策略/存储选型/性能优化


> [📄 4_K8s持久化存储.md](./mybook/09_devops/kubernetes/4_K8s持久化存储.md)
</details>

<details>
<summary>Prometheus 监控 K8s</summary>

- **Prometheus 架构**：Server/Pushgateway/AlertManager/Exporters/Service Discovery
- **K8s 集成方案**：
  - Prometheus Operator：CRD（Prometheus/ServiceMonitor/PodMonitor/Alertmanager/PrometheusRule）
  - kube-prometheus-stack：完整监控栈部署（Prometheus+Grafana+AlertManager+Node Exporter+kube-state-metrics）
- **监控指标**：
  - 节点指标：CPU/内存/磁盘/网络（node_exporter）
  - Pod 指标：cAdvisor（容器 CPU/内存/网络/文件系统）
  - 集群指标：kube-state-metrics（Deployment 状态/Pod 状态/资源请求与限制）
  - etcd 指标：leader 变更/慢查询/磁盘性能
  - API Server 指标：请求延迟/错误率/etcd 延迟
- **告警规则**：节点宕机/Pod CrashLoopBackOff/资源超限/磁盘满/PVC 即将用尽
- **Grafana 仪表盘**：集群概览/节点详情/Pod 详情/网络/存储
- **自定义监控**：应用埋点（Prometheus client 库）/ServiceMonitor 配置
- **长期存储**：Thanos/VictoriaMetrics/Cortex 远程写入方案


> [📄 5_Prometheus监控K8s.md](./mybook/09_devops/kubernetes/5_Prometheus监控K8s.md)
</details>

<details>
<summary>Docker Swarm</summary>

- 集群部署 / 节点管理 / 服务部署与扩缩容
- 存储卷挂载 / 可视化面板 / 容器网络


> [📄 docker-swarm.md](./mybook/09_devops/docker-swarm.md)
</details>

#### CI/CD与API

<details>
<summary>CI/CD</summary>

- **GitHub Actions**：Workflow/Job/Step/Action/Runner/Matrix/Secrets
- **GitLab CI**：.gitlab-ci.yml / Pipeline/Stage/Artifact/Environment
- **Jenkins**：Pipeline as Code / Shared Library / Agent/Node
- **ArgoCD**：GitOps 持续交付 / Application / Sync / Rollback
- 最佳实践：流水线设计/环境管理/制品管理/安全扫描集成


> [📄 1_GitHub-Actions.md](./mybook/09_devops/cicd/1_GitHub-Actions.md) · [📄 2_GitLab-CI.md](./mybook/09_devops/cicd/2_GitLab-CI.md) · [📄 3_Jenkins.md](./mybook/09_devops/cicd/3_Jenkins.md)
</details>

<details>
<summary>API 设计</summary>

- RESTful 设计原则：资源命名/HTTP 方法语义/状态码/HATEOAS
- API 版本策略：URL 路径/Header/查询参数
- GraphQL：Schema/Query/Mutation/Subscription/Resolver/N+1 DataLoader
- gRPC vs REST vs GraphQL 选型
- API 网关：限流/认证/日志/灰度发布/协议转换
- API 文档：OpenAPI/Swagger/Protobuf


> [📄 4_API设计.md](./mybook/09_devops/cicd/4_API设计.md)
</details>

#### 自动化运维

<details>
<summary>Puppet</summary>

- **概述**：声明式配置管理/Agent-Master 架构/编译型（Catalog 预编译）
- **安装部署**：Puppet Server/Puppet Agent/PuppetDB
- **核心概念**：Manifest/Module/Class/Resource/Node/Facter（系统事实）
- **资源类型**：file/package/service/user/cron/exec/notify/file_line
- **模块开发**：目录结构（manifests/files/templates/lib/spec）/init.pp/params.pp
- **Hiera 数据分离**：层次化数据/环境配置/加密数据（eyaml）/数据绑定
- **Puppet DSL**：变量/条件/循环/模板（ERB/EPP）
- **PuppetDB**：存储 Catalog/报告/事实/查询 API
- **Puppet vs Ansible vs SaltStack 对比**


> [📄 1_Puppet.md](./mybook/09_devops/自动化运维/1_Puppet.md)
</details>

<details>
<summary>Ansible</summary>

- **概述**：无 Agent/SSH 推送/声明式 YAML/幂等性
- **安装与配置**：pip/apt/yum/ansible.cfg/hosts 清单
- **核心**：Inventory（静态/动态/Group/Host vars）/Module/Playbook/Role
- **常用模块**：ping/shell/command/copy/template/file/yum/apt/service/systemd/user/git/docker_container
- **Playbook**：任务/变量/条件（when）/循环（loop）/错误处理（block/rescue）/标签/触发器（handler）
- **变量与模板**：Jinja2 模板/变量优先级/facts/注册变量/过滤器
- **Role**：目录结构（tasks/handlers/templates/files/vars/defaults/meta）/依赖/ansible-galaxy
- **高级**：Vault 加密/异步任务/策略（strategy）/回调插件/自定义模块
- **AWX/Tower**：Web 管理界面/作业模板/工作流/RBAC
- **实战**：批量部署 Web 服务/滚动更新/配置漂移检测


> [📄 2_Ansible.md](./mybook/09_devops/自动化运维/2_Ansible.md)
</details>

<details>
<summary>SaltStack</summary>

- **概述**：Agent（Minion）+ Master 架构/ZeroMQ 通信/高速执行
- **安装部署**：salt-master/salt-minion/salt-syndic/多 Master
- **核心概念**：State/Module/Pillar/Grains/Mine/Runner/Orchestrate
- **目标匹配**：glob/PCRE/list/grain/pillar/compound/nodegroup
- **State 系统**：SLS 文件/require/watch/onchanges/onfail/命名空间
- **Pillar 数据**：加密变量/环境分离/数据渲染
- **Grains**：系统信息采集/自定义 Grains
- **Jinja 模板**：变量/条件/循环/宏/过滤器
- **Salt SSH**：无 Agent 模式/roster 文件
- **Salt API**：REST 推送/外部集成
- **SaltStack vs Ansible vs Puppet 对比**


> [📄 3_SaltStack.md](./mybook/09_devops/自动化运维/3_SaltStack.md)
</details>

#### 基础设施

<details>
<summary>ES集群 / Redis / 监控</summary>

- **ES 集群**：节点角色（Master/Data/Coordinating）/分片与副本/集群健康状态/索引模板/ILM 生命周期管理
- **Redis 运维**：主从复制/哨兵模式/Cluster 模式/内存优化/持久化（RDB/AOF）/慢查询监控/大 Key 治理
- **监控系统集成**：Prometheus + Grafana + AlertManager 全链路监控


> [📄 5_监控系统集成.md](./mybook/09_devops/基础设施/5_监控系统集成.md)
</details>

<details>
<summary>ELK Stack</summary>

- **Logstash**：安装配置/管道架构（input→filter→output）/Grok 模式/性能优化（pipeline.workers/batch.size）/多管道配置
- **Kibana**：安装配置/Discover（日志搜索与过滤）/Visualize（图表创建）/Dashboard（仪表盘）/Dev Tools（ES 查询调试）/KQL 查询语法
- **Filebeat**：轻量日志采集器/模块化配置（nginx/redis/mysql）/multiline 多行日志/与 Logstash/ES 直连/processors 处理器
- **ELK 架构实践**：
  - 方案1（标准）：Filebeat → Logstash → Elasticsearch → Kibana
  - 方案2（轻量）：Filebeat → Elasticsearch → Kibana
  - 方案3（缓冲）：Filebeat → Kafka → Logstash → Elasticsearch → Kibana
- **索引生命周期管理（ILM）**：hot（rollover）→ warm（forcemerge/shrink）→ cold → delete
- **集群规划**：Master/Data Hot/Data Warm/Data Cold/Coordinating 节点角色与规格
- **替代方案**：EFK（Fluentd，K8s 生态常用）/Loki + Grafana（仅索引标签，存储成本低）


> [📄 4_ES集群与ELK.md](./mybook/09_devops/基础设施/4_ES集群与ELK.md)
</details>

<details>
<summary>虚拟化</summary>

- **Hyper-V**：Windows 虚拟化平台；嵌套虚拟化 / LVM 扩容 / fdisk 分区管理 / Checkpoint
- **Vagrant**：开发环境自动化；Vagrantfile 配置 / 多机编排 / Provider（VirtualBox/Libvirt/Hyper-V）/ Provision 脚本
- **KSV 虚拟化**：基于 KVM 的轻量虚拟化管理平台


> [📄 2_虚拟化.md](./mybook/09_devops/基础设施/2_虚拟化.md) · [📄 hyper-v.md](./mybook/09_devops/hyper-v.md) · [📄 vagrant.md](./mybook/09_devops/vagrant.md)
</details>

<details>
<summary>网络</summary>

- **OVS（Open vSwitch）**：生产级虚拟交换机，支持 OpenFlow/NetFlow/sFlow
- **OVN**：OVS 集中式控制器；逻辑交换机（L2）/逻辑路由器（L3）/L2-L4 ACL/多种隧道封装（Geneve/STT/VXLAN）/Kube-OVN
- **ovs-dpdk**：OVS + DPDK 用户态网络，绕过内核协议栈，极低延迟；编译 DPDK/大页内存配置/VFIO 设备绑定
- **负载均衡**：四层（LVS/NAT/DR/TUN）/七层（Nginx Ingress Controller/HAProxy）；健康检查/会话保持/权重分配


> [📄 1_网络.md](./mybook/09_devops/基础设施/1_网络.md) · [📄 ovs-ovn.md](./mybook/09_devops/ovs-ovn.md) · [📄 3_负载均衡.md](./mybook/09_devops/基础设施/3_负载均衡.md)
</details>

<details>
<summary>LVS（Linux Virtual Server）</summary>

- **三种模式**：NAT（请求响应都经 Director）/DR（Direct Routing，响应直接返回）/TUN（IP 隧道封装，跨网段）
- **IPVS 配置**：ipvsadm 命令（创建虚拟服务/添加 RS/查看规则/统计）
- **调度算法**：rr/wrr/lc/wlc（推荐）/sh/dh/lblc/sed
- **LVS + Keepalived 高可用**：Keepalived 管理 IPVS 规则/健康检查/主备切换


> [📄 6_LVS.md](./mybook/09_devops/基础设施/6_LVS.md)
</details>

<details>
<summary>HAProxy</summary>

- **安装配置**：global/defaults/frontend/backend/listen 五段配置
- **四层/七层代理**：TCP 模式（mysql/redis 代理）/HTTP 模式（Web 反向代理）
- **ACL 规则**：path_beg/path_end/hdr/host/源 IP 匹配/use_backend 条件路由
- **负载均衡算法**：roundrobin/static-rr/leastconn/source/uri
- **健康检查**：option httpchk/TCP_CHECK/自定义检查脚本
- **统计页面**：listen stats/stats enable/stats uri
- **SSL 终结**：bind *:443 ssl crt/crl-file


> [📄 7_HAProxy.md](./mybook/09_devops/基础设施/7_HAProxy.md)
</details>

<details>
<summary>Nginx（负载均衡与反向代理）</summary>

- **反向代理**：proxy_pass/proxy_set_header/proxy_buffering/proxy_connect_timeout
- **负载均衡**：upstream/权重/backup/max_fails/fail_timeout/keepalive
- **负载均衡算法**：轮询（默认）/least_conn/ip_hash/hash
- **性能调优**：worker_processes/worker_connections/sendfile/tcp_nopush/gzip/open_file_cache
- **安全配置**：SSL/TLS/限流（limit_req）/安全头部（X-Frame-Options/HSTS）
- **平滑升级**：kill -USR2/kill -WINCH/回滚


> [📄 8_Nginx反向代理与负载均衡.md](./mybook/09_devops/基础设施/8_Nginx反向代理与负载均衡.md)
</details>

<details>
<summary>Keepalived</summary>

- **VRRP 协议**：虚拟路由冗余协议/Master-Backup 选举/VIP 漂移
- **配置**：global_defs/vrrp_instance/vrrp_script/virtual_ipaddress
- **健康检查脚本**：track_script/weight/fall/rise
- **与 LVS 集成**：virtual_server/real_server/TCP_CHECK
- **与 HAProxy/Nginx 集成**：vrrp_script 检测进程状态/自动故障切换
- **架构选型对比**：LVS（四层极高并发）vs HAProxy（四七层混合）vs Nginx（七层 HTTP 代理）


> [📄 9_Keepalived.md](./mybook/09_devops/基础设施/9_Keepalived.md)
</details>

<details>
<summary>KubeSphere</summary>

- K3s 集群上安装 KubeSphere


> [📄 k3s集群上安装kubesphere.md](./mybook/09_devops/k3s集群上安装kubesphere.md)
</details>

<details>
<summary>OpenStack</summary>

- 二次开发环境搭建


> [📄 openstack二次开发.md](./mybook/09_devops/openstack二次开发.md)
</details>

### 7.5 智能体开发

#### 框架

<details>
<summary>框架</summary>

- **AutoGen**：微软多智能体框架，支持 Agent 间对话协作、自定义 Agent 角色、人机协同
- **CrewAI**：角色扮演式多智能体框架，定义 Agent 角色/目标/工具，流程编排（顺序/层级）
- **QwenAgent**：通义千问智能体框架，支持 RAG / 代码解释器 / 工具调用 / 多轮对话
- **DeepAgents**：深度智能体框架，支持复杂任务分解与链式推理
- **LangGraph**：基于图的状态机多 Agent 编排，支持循环/分支/持久化
- 核心概念：Agent（角色+工具+记忆）、Tool（函数调用）、Memory（短期/长期记忆）、Workflow（编排策略）
- MCP（Model Context Protocol）：AI 模型与外部工具/数据的标准通信协议
- Function Calling / Tool Use 标准：OpenAI 兼容格式 / JSON Schema 描述


> [📁 01_智能体框架/](./mybook/06_agents/01_智能体框架/)
> [📄 01_框架总览.md](./mybook/06_agents/01_智能体框架/01_框架总览.md)
> [📄 02_AutoGen.md](./mybook/06_agents/01_智能体框架/02_AutoGen.md)
> [📄 03_CrewAI.md](./mybook/06_agents/01_智能体框架/03_CrewAI.md)
> [📄 04_LangGraph.md](./mybook/06_agents/01_智能体框架/04_LangGraph.md)
> [📄 05_Hello-Agents从零构建智能体.md](./mybook/06_agents/01_智能体框架/05_Hello-Agents从零构建智能体.md)
> [📁 02_MCP协议/](./mybook/06_agents/02_MCP协议/)
> [📄 01_MCP开发指南.md](./mybook/06_agents/02_MCP协议/01_MCP开发指南.md)
</details>

#### AI Coding 实践

<details>
<summary>AI Coding 实践</summary>

- **AGENTS.md**：给 AI Coding Agent 看的项目指令文件（README.md 给人类，AGENTS.md 给 AI）
  - 已被主流工具支持（OpenAI Codex/Gemini CLI/Copilot/Cursor/Qoder 等）
  - Linux Foundation Agentic AI Foundation 托管，成为事实标准
  - Claude Code 可用软链接兼容：`ln -s AGENTS.md CLAUDE.md`
- **核心理念**：地图而非手册；约 200 行导航地图，告诉 AI "去哪里找什么"，详细内容放链接文档
- **渐进式披露**：写进 AGENTS.md 的内容 = AI 不知道就会写出错误代码的硬性规则；详细信息通过文档链接引用
- **项目结构优化**：
  - monorepo 架构解决前后端上下文割裂
  - 统一环境配置（`~/.<project>_env`）+ 一键启动脚本封装复杂操作
  - 参考项目引入（git submodule），源码永远是最准确的文档
- **验证闭环**：「改 → 构建 → 启动 → 验证」自动化循环
  - curl 验证规范：每个 curl 独立执行，用临时文件传递数据，Token 获取模板化
  - 验证不止于编译通过，要跑通接口才算完
  - 前端用 Agent Browser 截屏验证页面渲染
- **自动化检查**：重要规则必须有自动化检查（`make lint-arch` 分层依赖检查）
  - 错误信息格式：WHAT（违规了什么）+ WHY（为什么不允许）+ HOW（怎么修复）
  - 规则优先级：能自动化检查的 > 写在 AGENTS.md 的 > 口头约定的
- **主流工具**：
  - **Claude Code**：终端 AI 编码，CLAUDE.md 配置，MCP 扩展
  - **OpenCode**：开源终端工具，支持多 LLM 后端（OpenAI/Anthropic/Ollama）
  - **Trae**：AI IDE，Rules 分主题管理 + Skill 可复用技能系统 + Builder 模式
  - **Cursor**：AI IDE，Tab 补全 + Composer 多文件编辑 + .cursorrules
  - **Aider**：开源终端工具，多模型支持，Git 深度集成
- **项目约束文档**：AGENTS.md（通用）/ CLAUDE.md / .cursorrules / .trae/rules/ / .github/copilot-instructions.md
- **Skill 文档规范**：将常见开发模式封装为标准化流程（api-endpoint / bug-fix / refactor / write-test 等）
- **实施建议**：
  - 从 `/init` 或 `harness-creator` 生成初始版本
  - Bad Case 驱动迭代：每遇到一个 AI bad case，就补一条规则
  - 团队共建：全局规则放 AGENTS.md，模块细节放对应 docs/
  - 文件目标读者标注：README.md（人）、AGENTS.md（AI为主）、docs/*.md（AI为主，人可参考）

> [📁 03_AI-Coding实践/](./mybook/06_agents/03_AI-Coding实践/)
> [📄 00_索引页.md](./mybook/06_agents/03_AI-Coding实践/00_索引页.md)
> [📁 01_基础规范/](./mybook/06_agents/03_AI-Coding实践/01_基础规范/)
> [📄 01_AGENTS规范.md](./mybook/06_agents/03_AI-Coding实践/01_基础规范/01_AGENTS规范.md)
> [📄 02_工作流与Prompt.md](./mybook/06_agents/03_AI-Coding实践/01_基础规范/02_工作流与Prompt.md)
> [📄 03_工具详解.md](./mybook/06_agents/03_AI-Coding实践/01_基础规范/03_工具详解.md)
> [📄 04_Skill规范.md](./mybook/06_agents/03_AI-Coding实践/01_基础规范/04_Skill规范.md)
> [📄 05_最佳实践.md](./mybook/06_agents/03_AI-Coding实践/01_基础规范/05_最佳实践.md)
> [📁 02_AGENTS合集/](./mybook/06_agents/03_AI-Coding实践/02_AGENTS合集/)
> [📄 01_开源项目AGENTS合集.md](./mybook/06_agents/03_AI-Coding实践/02_AGENTS合集/01_开源项目AGENTS合集.md)
> [📄 02_Python项目AGENTS合集.md](./mybook/06_agents/03_AI-Coding实践/02_AGENTS合集/02_Python项目AGENTS合集.md)
> [📄 03_Python-Web项目AGENTS合集.md](./mybook/06_agents/03_AI-Coding实践/02_AGENTS合集/03_Python-Web项目AGENTS合集.md)
> [📄 04_流行开源项目AGENTS合集.md](./mybook/06_agents/03_AI-Coding实践/02_AGENTS合集/04_流行开源项目AGENTS合集.md)
> [📄 05_Go语言项目AGENTS合集.md](./mybook/06_agents/03_AI-Coding实践/02_AGENTS合集/05_Go语言项目AGENTS合集.md)
> [📄 06_Django项目AGENTS合集.md](./mybook/06_agents/03_AI-Coding实践/02_AGENTS合集/06_Django项目AGENTS合集.md)
> [📄 07_Flask项目AGENTS合集.md](./mybook/06_agents/03_AI-Coding实践/02_AGENTS合集/07_Flask项目AGENTS合集.md)
> [📄 08_Python项目AGENTS大全.md](./mybook/06_agents/03_AI-Coding实践/02_AGENTS合集/08_Python项目AGENTS大全.md)
> [📄 09_开源项目AGENTS大全.md](./mybook/06_agents/03_AI-Coding实践/02_AGENTS合集/09_开源项目AGENTS大全.md)
> [📄 10_开源项目AGENTS.md通用规则报告.md](./mybook/06_agents/03_AI-Coding实践/02_AGENTS合集/10_开源项目AGENTS.md通用规则报告.md)
> [📄 11_Golang项目CLAUDE.md收集报告.md](./mybook/06_agents/03_AI-Coding实践/02_AGENTS合集/11_Golang项目CLAUDE.md收集报告.md)
> [📁 03_AGENTS模板/](./mybook/06_agents/03_AI-Coding实践/03_AGENTS模板/)
> [📄 01_通用Python项目AGENTS模板.md](./mybook/06_agents/03_AI-Coding实践/03_AGENTS模板/01_通用Python项目AGENTS模板.md)
> [📄 02_本地Python后台管理系统AGENTS模板.md](./mybook/06_agents/03_AI-Coding实践/03_AGENTS模板/02_本地Python后台管理系统AGENTS模板.md)
> [📄 03_DRF后台管理系统AGENTS模板.md](./mybook/06_agents/03_AI-Coding实践/03_AGENTS模板/03_DRF后台管理系统AGENTS模板.md)
> [📄 04_ZMON项目AGENTS模板.md](./mybook/06_agents/03_AI-Coding实践/03_AGENTS模板/04_ZMON项目AGENTS模板.md)
> [📄 05_DRF+VUE后台管理系统AGENTS模板.md](./mybook/06_agents/03_AI-Coding实践/03_AGENTS模板/05_DRF+VUE后台管理系统AGENTS模板.md)
> [📄 06_DRF+VUE后台管理系统前端编码规范AGENTS模板.md](./mybook/06_agents/03_AI-Coding实践/03_AGENTS模板/06_DRF+VUE后台管理系统前端编码规范AGENTS模板.md)
> [📄 07_前端AGENTS.md模板.md](./mybook/06_agents/03_AI-Coding实践/03_AGENTS模板/07_前端AGENTS.md模板.md)
> [📄 08_数据质量管理平台agents.md](./mybook/06_agents/03_AI-Coding实践/03_AGENTS模板/08_数据质量管理平台agents.md)
> [📁 04_工具与框架/](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/)
> [📄 01_ClaudeCode最佳实践.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/01_ClaudeCode最佳实践.md)
> [📄 OpenCode与ClaudeCode使用教程.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/OpenCode与ClaudeCode使用教程.md)
> [📄 02_MiniMax-Skills技能库.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/02_MiniMax-Skills技能库.md)
> [📄 03_Ralph-Wiggum自主循环.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/03_Ralph-Wiggum自主循环.md)
> [📄 04_Harness-Engineering工程范式.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/04_Harness-Engineering工程范式.md)
> [📄 05_Codex-Goal目标管理.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/05_Codex-Goal目标管理.md)
> [📄 06_哔哩哔哩智能开发工作流.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/06_哔哩哔哩智能开发工作流.md)
> [📄 07_AI工程三层范式.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/07_AI工程三层范式.md)
> [📄 08_OpenCode最佳实践.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/08_OpenCode最佳实践.md)
> [📄 09_ClaudeCode源码架构.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/09_ClaudeCode源码架构.md)
> [📄 10_ClaudeCode上下文管理.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/10_ClaudeCode上下文管理.md)
> [📄 11_ClaudeCode多Agent机制.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/11_ClaudeCode多Agent机制.md)
> [📄 12_OpenClaw源码分析.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/12_OpenClaw源码分析.md)
> [📄 13_OpenCode源码分析.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/13_OpenCode源码分析.md)
> [📄 14_ClaudeCode记忆系统.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/14_ClaudeCode记忆系统.md)
> [📄 15_OpenClaw面试题.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/15_OpenClaw面试题.md)
> [📄 16_CLAUDEmd实战指南.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/16_CLAUDEmd实战指南.md)
> [📄 17_MiniMax-Mavis-Agent-Teams.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/17_MiniMax-Mavis-Agent-Teams.md)
> [📄 18_多Agent协作系统.md](./mybook/06_agents/03_AI-Coding实践/04_工具与框架/18_多Agent协作系统.md)
> [📄 AGENTS示例.md](./mybook/06_agents/AGENTS示例.md)
</details>

#### 大模型对比

<details>
<summary>大模型对比</summary>

> [📁 04_大模型对比/](./mybook/06_agents/04_大模型对比/)
> [📄 01_2026最新大模型对比.md](./mybook/06_agents/04_大模型对比/01_2026最新大模型对比.md)
</details>

### 7.6 其它

#### 大模型

<details>
<summary>大模型</summary>

- **生态**：LangChain（6 大核心组件：Model I/O / Data Connection / Chains / Memory / Agents / Callbacks）
  - langchain-core / langchain-community / langchain / langgraph / langserve / LangSmith
- **开发流程**：确定目标 → 设计功能 → 搭建架构 → 建向量数据库 → Prompt Engineering → 验证迭代 → 前后端搭建 → 体验优化
- **RAG vs 微调**：RAG 更新成本低/可解释性强/降低幻觉；微调可定制风格/行为但计算成本高
- **提示词工程**：设计原则、迭代优化、Bad Case 分析
- **推理部署**：Ollama（本地部署）、vLLM（高吞吐推理服务）、Tensor-Parallel / AWQ 量化
- **工具**：LiteLLM（统一多模型 API + 路由/负载均衡/故障转移）、Continue（IDE 插件）、Tabby（自托管补全）
- **向量数据库**：Milvus / Qdrant / Weaviate / Chroma / Pinecone；索引类型（HNSW/IVF）
- **Embedding 模型**：text-embedding-ada-002 / bge / m3e / GTE；维度/性能/多语言
- **评估体系**：RAGAS / LLM-as-Judge / 人工评估；准确性/相关性/幻觉率
- **Agent 框架**：LangGraph（图状态机）/ CrewAI（多Agent协作）/ AutoGen（多Agent对话）/ OpenAI Assistants API
- **Function Calling**：工具定义/参数描述/模型调用/结果回传
- **多模态**：GPT-4V（图像）/ GPT-4o（实时语音+视觉）/ Claude 3 / Gemini
- **成本优化**：语义缓存/模型路由/量化（GGUF/AWQ/GPTQ）/批处理


> [📄 大模型.md](./mybook/11_other/大模型.md)
</details>

#### 研发效能

<details>
<summary>提高研发效能</summary>

- 充分设计，避免返工
- 小步快跑，先能用再好用
- 动态生成，生效代码
- 热更新 + 扩展能力，让更多人参与开发
- 让 AI 做更多的事：问答、诊断、代码生成
- 工具链：CI/CD 自动化、代码审查（CR）、自动化测试、性能基准
- 流程优化：需求评审 → 技术方案 → 开发 → 评审 → 测试 → 发布
- **AI Coding 效率提升**：
  - AGENTS.md + 文档体系 + lint 脚本 + 启动脚本 + 验证规范 → 构建完整反馈回路
  - 打开即理解（项目结构/编码规范/命令）+ 改完即验证（curl 接口验证/Agent Browser 页面验证）
  - Harness Engineering 四原则：Map not Manual / Mechanical Verification / Visible Feedback / Incremental Complexity
  - AGENTS.md 维护本身就是知识沉淀：编码规范从 Wiki/口头约定 → 结构化文档
- **代码质量**：静态分析（golangci-lint/ruff/mypy）/统一格式化/Pre-commit Hook
- **测试策略**：测试金字塔（单元 > 集成 > E2E）/关键路径覆盖/Mock 外部依赖
- **知识管理**：架构决策记录（ADR）/Wiki 知识库/On-call 手册


> [📄 提高研发效能.md](./mybook/11_other/提高研发效能.md)
</details>

#### 杂项

<details>
<summary>大厂技术文章</summary>

- 美团技术团队：高可用/分布式/中间件/架构设计
- 京东技术：供应链/物流/推荐/高并发
- 携程技术：微服务/APM/移动端/国际化
- 百度技术：搜索/AI/自动驾驶/大规模计算
- B站技术：装机系统实践/全链路Trace追踪


> [📄 大厂技术文章.md](./mybook/11_other/大厂技术文章.md) · [📄 knowledge_graph.md](./mybook/11_other/knowledge_graph.md)
</details>

<details>
<summary>Shell编程风格</summary>

- 错误信息 / 注释 / 格式化
- $() 替代反引号 / [[ ]] 替代 [ ] / 避免 eval
- 命令约定与调用


> [📄 shell编程风格.md](./mybook/11_other/杂项/shell编程风格.md)
</details>

<details>
<summary>杂项</summary>

- 构建deb包
- VSCode配置（markdown粘贴文件目录）
- zipapp打包应用
- 临时记录（爬虫/反爬/worker/代理/动态规则引擎/猴子补丁）
- 正则表达式：元字符/量词/分组/零宽断言/贪婪非贪婪/常用模式
- 编码与解码：Base64/URL编码/HTML实体/Unicode规范化
- 设计模式速查：创建型5/结构型7/行为型11；GoF 23 种模式分类
- DDD（领域驱动设计）：聚合根/值对象/领域事件/限界上下文/仓储模式


> [📄 构建deb包.md](./mybook/09_devops/构建deb包.md)
</details>
