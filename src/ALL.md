# 知识点总结

---

## 一、Go

### 1.1 语言基础

#### 基础语法

<details>
<summary>数据类型</summary>

- 基本类型：int8~int64/uint8~uint64/float32/float64/complex64/complex128/bool/string/byte/rune
- 类型转换（强制显式转换）/ strconv 系列
- 数组：定义/初始化/遍历/多维数组/值类型特性
- 切片详解：定义/长度容量/切片表达式/make/本质(SliceHeader)/append/copy/删除元素/避免内存泄漏
- 映射详解：定义/基本操作/判断键/遍历/delete/有序遍历/元素为map的切片/值为切片的map/并发安全(sync.Map)
- 类型别名：type NewType OldType vs type Alias = OldType


> [📄 2_数据类型.md](./mybook/go/2_核心概念/2_数据类型.md)
</details>

<details>
<summary>变量声明与控制结构</summary>

- var / := 短变量声明 / 批量声明 / 匿名变量 _
- 常量与 iota：枚举/跳过值/中间插队/数量级定义
- 运算符：算术/关系/逻辑/位(&|^&^<</>>)/赋值/优先级
- if / for / switch（默认不穿透/fallthrough）/ select
- defer / panic / recover
- goto / break(标签) / continue


> [📄 3_语句.md](./mybook/go/1_语言基础/3_语句.md)
</details>

<details>
<summary>函数与方法</summary>

- 多返回值、命名返回值、可变参数(...语法)
- 高阶函数：函数作为参数/返回值
- 匿名函数与闭包（捕获变量引用）
- defer 详解：LIFO/参数确定时机/执行时机/修改返回值
- 内置函数：len/cap/append/copy/delete/new/make/close/panic/recover
- 递归：阶乘/斐波那契/分金币问题
- 方法接收者选择（值接收者 vs 指针接收者）
- 结构体详解：自定义类型/实例化/构造函数/匿名字段(嵌入)/嵌套/JSON序列化Tag/方法继承与重写


> [📄 4_函数.md](./mybook/go/1_语言基础/4_函数.md) · [📄 5_方法.md](./mybook/go/1_语言基础/5_方法.md)
</details>

<details>
<summary>接口</summary>

- 隐式实现
- 类型断言与 type switch
- 空接口 interface{}
- nil 接口陷阱


> [📄 7_接口.md](./mybook/go/1_语言基础/7_接口.md)
</details>

#### 工程实践

<details>
<summary>包-模块-库</summary>

- 包定义/标识符可见性(大写导出/小写私有)/包引入/别名导入/空白导入
- init 函数：执行顺序/多个 init/注册驱动
- go mod 包管理
- 常用命令：go mod init/tidy/download/vendor/graph/why
- GOPROXY 模块代理（goproxy.cn/goproxy.io/athens）
- go.sum 校验与模块完整性
- replace / exclude / retract 指令
- 私有仓库配置（GOPRIVATE/GONOSUMCHECK）
- Go Workspace（go.work）：多模块开发
- 版本号规则：语义化版本/v2+ 路径后缀/伪版本


> [📄 11_包-模块-库.md](./mybook/go/1_语言基础/11_包-模块-库.md)
</details>

<details>
<summary>测试</summary>

- 单元测试（go test）/ 子测试(t.Run) / 表驱动测试
- 覆盖率：-cover/-covermode/-coverprofile
- 性能/基准测试（Benchmark）
- 模糊测试（Fuzzing）
- Mock 接口：手动 Mock / gomock
- monkey 打桩：gomonkey
- goconvey：BDD 风格/Web 界面
- 测试 MySQL（sqlmock）/ Redis（redismock）


> [📄 12_测试.md](./mybook/go/1_语言基础/12_测试.md)
</details>

<details>
<summary>项目结构与代码风格</summary>

- gofmt 格式化
- 标识符命名规范（驼峰、导出规则）
- 推荐项目目录结构


> [📄 13_项目结构代码风格与标识符命名.md](./mybook/go/1_语言基础/13_项目结构代码风格与标识符命名.md)
</details>

<details>
<summary>错误处理</summary>

- error 接口
- panic & recover
- errors.Is / errors.As / fmt.Errorf + %w


> [📄 10_错误和异常.md](./mybook/go/1_语言基础/10_错误和异常.md)
</details>

#### 进阶特性

<details>
<summary>设计模式</summary>

- 函数选项模式（Functional Options）：解决多参数构造问题
- 单例模式：sync.Once 保证只执行一次
- 工厂模式：根据类型创建不同实例
- 策略模式：接口+组合实现算法切换
- 装饰器模式：中间件链式调用
- 构建者模式：链式调用构建复杂对象


> [📄 16_设计模式.md](./mybook/go/1_语言基础/16_设计模式.md)
</details>

<details>
<summary>泛型</summary>

- 泛型函数与泛型类型
- 类型约束（interface 约束）
- 与反射的区别与适用场景
- 标准库泛型容器：cmp / slices / maps（Go 1.21+）


> [📄 8_泛型.md](./mybook/go/1_语言基础/8_泛型.md)
</details>

<details>
<summary>版本新特性</summary>

- **Go 1.18**：泛型/模糊测试/工作区模式（workspace）/Any 别名
- **Go 1.19**：修订内存模型/Doc Comment 新格式
- **Go 1.20**：切片转数组/PWRAP 错误包装/coverage 集成测试
- **Go 1.21**：slog 结构化日志/slices/maps/cmp 标准库/min-max 内建/PGO 优化
- **Go 1.22**：range over integer/循环变量语义修复（每次迭代新变量）/net/http 路由增强
- **Go 1.23**：iterator 支持（range over func）/unique 包/osroot
- **Go 1.24**：弱指针（weak pointer）/finalizer 改进/工具链管理 go version
- **Go 1.25**：Container-aware GOMAXPROCS（cgroup CPU 配额自动适配）/实验性 GreenTea GC/实验性 encoding/json v2/testing/synctest 并发测试/sync.WaitGroup.Go()/Core Types 移除/go doc -http/go vet 新分析器（waitgroup/hostport）
- **Go 1.26**：new(expr) 表达式初始化/泛型类型自引用/GreenTea GC 默认启用/SIMD 加速扫描/实验性 simd/archsimd 包/实验性 runtime/secret 包/crypto/hpke/errors.AsType/go fix 现代化修复器/实验性 goroutine leak profile/cgo 调用开销降低 ~30%/堆基地址随机化


> [📄 15_版本新特性.md](./mybook/go/1_语言基础/15_版本新特性.md)
</details>

<details>
<summary>内部实现原理</summary>

- **Slice 内部**：reflect.SliceHeader（Data/Len/Cap）；扩容策略（<256 双倍，>256 1.25x+）
- **String 内部**：reflect.StringHeader（Data/Len），不可变字节切片
- **Interface 内部**：eface（无方法）= type+data / iface（有方法）= tab+data；itab 缓存
- **Channel 内部**：hchan 结构（buf/sendx/recvx/qcount/dataqsiz/mutex）；有缓冲=环形队列，无缓冲=sendq/recvq 等待队列
- **Map 内部**：hmap 结构（buckets/oldbuckets/count/overflow）；渐进式扩容（等量/翻倍）；桶内 8 key-value + overflow 指针
- **defer 内部**：_defer 结构链表；栈上 defer（1.14+）/开放编码优化（1.14+）
- **内存对齐**：struct padding 规则；unsafe.Sizeof/Alignof/Offsetof


> [📄 14_内部实现原理.md](./mybook/go/1_语言基础/14_内部实现原理.md)
</details>

### 1.2 核心概念

#### 核心概念

<details>
<summary>Slice vs Array</summary>

- Array：固定长度，值类型
- Slice：动态长度，引用类型（ptr + len + cap）
- append 扩容机制


> [📄 2_数据类型.md](./mybook/go/2_核心概念/2_数据类型.md)
</details>

<details>
<summary>Map</summary>

- 底层实现（哈希表）
- 并发不安全 → sync.Map 或加锁


> [📄 2_数据类型.md](./mybook/go/2_核心概念/2_数据类型.md)
</details>

<details>
<summary>指针 & make vs new</summary>

- & / * 操作，Go 指针不能运算
- 指针传值：值传递 vs 指针传递
- 指针使用场景：修改外部变量/避免大结构体拷贝/修改接收者
- new：分配零值返回指针
- make：只用于 slice/map/chan，返回初始化后的引用
- make vs new 对比


> [📄 13_make与new.md](./mybook/go/2_核心概念/13_make与new.md)
</details>

### 1.3 并发编程（重点）

#### 调度模型

<details>
<summary>GMP 调度模型</summary>

- G（Goroutine）M（Machine/OS线程）P（Processor/逻辑处理器）
- P 的价值：限制并发数、本地队列减少锁竞争
- m0（主线程）g0（调度 goroutine）
- M 寻找 G 的流程


> [📄 7_Golang协程调度器原理-GMP模型.md](./mybook/go/3_并发编程/7_Golang协程调度器原理-GMP模型.md)
</details>

#### 并发原语

<details>
<summary>Goroutine & Channel</summary>

- Goroutine 轻量线程（~2KB 栈）
- Channel：无缓冲/有缓冲，方向（只读/只写/双向）
- select 多路复用
- 关闭 channel 注意点（只有发送方关闭；用 WaitGroup 或 Context 协调）


> [📄 9_并发.md](./mybook/go/3_并发编程/9_并发.md)
</details>

<details>
<summary>sync 包</summary>

- Mutex / RWMutex / WaitGroup / Once
- sync.Map / Cond / Pool


> [📄 9_并发.md](./mybook/go/3_并发编程/9_并发.md)
</details>

<details>
<summary>Context</summary>

- 作用：超时控制、取消传播、值传递
- Background / WithCancel / WithTimeout / WithDeadline / WithValue
- 原理与最佳实践


> [📄 20_context.md](./mybook/go/6_常用标准库/20_context.md)
</details>

#### 并发模式

<details>
<summary>并发编程模式</summary>

- 生产者-消费者模式
- Worker Pool（工作池）
- 扇出/扇入模式
- Pipeline 模式
- 发布订阅模型
- 三个协程按顺序打印


> [📄 14_并发模式详解.md](./mybook/go/3_并发编程/14_并发模式详解.md)
</details>

<details>
<summary>协程池</summary>

- 手动实现协程池
- ants 等第三方库


> [📄 11_协程池.md](./mybook/go/3_并发编程/11_协程池.md)
</details>

<details>
<summary>限流与熔断</summary>

- 限流算法（令牌桶、漏桶）
- golang.org/x/time/rate
- 熔断器模式


> [📄 15_限流与熔断.md](./mybook/go/3_并发编程/15_限流与熔断.md)
</details>

<details>
<summary>并发安全退出</summary>

- Context 取消 / Channel 通知 / errgroup 错误处理
- conc 并发库：pool(并发池)/stream(流式)/iter(迭代器)/泛型支持/对比errgroup


> [📄 16_conc.md](./mybook/go/3_并发编程/16_conc.md)
</details>

### 1.4 内存管理（重点）

#### 内存分配

<details>
<summary>内存模型与分配</summary>

- Go 内存模型（happens-before）
- 对象分配流程（微小对象 → mcache → mcentral → mheap）


> [📄 9_内存管理.md](./mybook/go/4_内存管理/9_内存管理.md)
</details>

<details>
<summary>逃逸分析</summary>

- 逃逸原因（返回指针、接口、闭包、大对象）
- 检测方法：go build -gcflags="-m"
- 如何避免逃逸


> [📄 12_Go内存逃逸.md](./mybook/go/4_内存管理/12_Go内存逃逸.md)
</details>

#### 垃圾回收

<details>
<summary>垃圾回收（GC）</summary>

- 三色并发标记算法
- 混合写屏障（Hybrid Write Barrier）— 1.8+ 默认
- 触发时机（内存翻倍 / 定时 / 手动 runtime.GC()）
- Go 1.19+ 分代扫描（实验性）/ Go 1.25 实验性 GreenTea GC / Go 1.26 GreenTea GC 默认启用（10-40% GC 开销降低）
- GC 优化策略


> [📄 8_GC-垃圾回收.md](./mybook/go/4_内存管理/8_GC-垃圾回收.md)
</details>

<details>
<summary>混合写屏障详解</summary>

- 演进：Dijkstra 插入屏障 → Yuasa 删除屏障 → 混合写屏障
- 4 条规则（栈上不开启写屏障）
- = 插入屏障 + 删除屏障
- 三色不变式


> [📄 10086_混合写屏障.md](./mybook/go/4_内存管理/10086_混合写屏障.md)
</details>

### 1.5 常见陷阱

#### 常见陷阱

<details>
<summary>循环与变量陷阱</summary>

- for range 陷阱（循环变量复用）
- 短变量声明作用域
- 循环中 defer（延迟到函数退出才执行）


> [📄 1_常见陷阱.md](./mybook/go/5_常见陷阱/1_常见陷阱.md)
</details>

<details>
<summary>类型与接口陷阱</summary>

- nil 接口 ≠ nil 具体类型（类型断言前必须判断）
- 方法接收者为 nil 时的行为


> [📄 1_常见陷阱.md](./mybook/go/5_常见陷阱/1_常见陷阱.md)
</details>

<details>
<summary>Slice 与 Map 陷阱</summary>

- slice 为 nil 与 empty 混淆
- slice append 副作用（共享底层数组）
- slice 和内存泄漏（大数组切片引用）
- Map 遍历顺序不确定


> [📄 1_常见陷阱.md](./mybook/go/5_常见陷阱/1_常见陷阱.md)
</details>

<details>
<summary>性能与标准库误用</summary>

- 字符串拼接低效（应用 strings.Builder）
- time / encoding/json / net/http 常见误用


> [📄 1_常见陷阱.md](./mybook/go/5_常见陷阱/1_常见陷阱.md)
</details>

### 1.6 常用标准库

#### 格式化与时间

<details>
<summary>fmt 格式化</summary>

- Printf 占位符：%v/%+v/%#v/%T/%%
- 整数：%d/%b/%o/%x/%X/%c/%U
- 浮点：%f/%.2f/%e/%E/%g
- 字符串：%s/%q/%x
- 宽度精度：%5d/%-5d/%05d/%8.2f
- Sprint/Sprintf/Fprint/Fprintf


> [📄 12_fmt.md](./mybook/go/6_常用标准库/12_fmt.md)
</details>

<details>
<summary>time 时间包</summary>

- 时间获取：Now()/Year()/Month()/Unix()/UnixMilli()
- 格式化：Format("2006-01-02 15:04:05")/Parse()
- 时间计算：Add/Sub/Before/After/Equal
- 定时器：Timer/Ticker/Sleep/After
- Duration：常量(Nanosecond~Hour)/方法(Seconds/Milliseconds)


> [📄 13_time.md](./mybook/go/6_常用标准库/13_time.md)
</details>

<details>
<summary>strconv / flag</summary>

- strconv：Atoi/Itoa/ParseBool/ParseInt/ParseFloat/FormatBool/FormatInt/FormatFloat
- flag：StringVar/IntVar/BoolVar/Parse/子命令(NewFlagSet)


> [📄 14_strconv.md](./mybook/go/6_常用标准库/14_strconv.md) · [📄 15_flag.md](./mybook/go/6_常用标准库/15_flag.md)
</details>

#### I/O与编码

<details>
<summary>文件操作（os/io）</summary>

- 读取：Open/Read/ReadFile/bufio.Scanner
- 写入：Create/Write/WriteFile/OpenFile(追加)
- 文件信息：Stat/Name/Size/IsDir/Mode/ModTime
- 目录：Mkdir/MkdirAll/Remove/RemoveAll/ReadDir/Walk
- 临时文件：MkdirTemp/CreateTemp
- io 工具：ReadAll/Copy


> [📄 16_文件操作.md](./mybook/go/6_常用标准库/16_文件操作.md)
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


> [📄 17_template.md](./mybook/go/6_常用标准库/17_template.md)
</details>

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


> [📄 18_json.md](./mybook/go/6_常用标准库/18_json.md)
</details>

<details>
<summary>reflect 反射</summary>

- TypeOf/ValueOf/Kind
- 结构体反射：NumField/Field/Tag.Get/NumMethod
- 修改值：Elem/Set/CanSet
- 动态调用方法：MethodByName/Call
- 应用场景：ORM/配置解析/验证/序列化
- 注意事项：性能/类型安全/可维护性


> [📄 19_reflect.md](./mybook/go/6_常用标准库/19_reflect.md)
</details>

#### 并发与底层

<details>
<summary>context 详解</summary>

- 设计理念：取消信号/超时控制/值传递
- 创建：Background/TODO/WithCancel/WithTimeout/WithDeadline/WithValue
- 传播规则：子取消不影响父/父取消级联子
- 最佳实践：第一个参数/不传nil/不存结构体/defer cancel
- 常见模式：HTTP请求超时/数据库查询超时/优雅关闭


> [📄 20_context.md](./mybook/go/6_常用标准库/20_context.md)
</details>

<details>
<summary>并发与同步</summary>

- sync / sync/atomic：Mutex / RWMutex / WaitGroup / Once / Map / Pool / Cond
- singleflight：防缓存击穿/Do/DoChan/Forget


> [📄 9_并发.md](./mybook/go/3_并发编程/9_并发.md) · [📄 27_singleflight.md](./mybook/go/6_常用标准库/27_singleflight.md)
</details>

<details>
<summary>网络与 I/O</summary>

- net/http：HTTP 客户端/服务端、Handler/HandlerFunc、中间件模式、文件服务、优雅关闭
- io / bufio / os：文件读写、缓冲 I/O、路径操作


> [📄 5_http标准库.md](./mybook/go/6_常用标准库/5_http标准库.md)
</details>

#### 第三方库

<details>
<summary>日志</summary>

- 标准库 log
- slog（Go 1.21+）：结构化日志/JSONHandler
- Zap：Logger/SugaredLogger/自定义配置/Gin集成
- lumberjack：日志轮转(MaxSize/MaxBackups/MaxAge/Compress)


> [📄 1_log.md](./mybook/go/6_常用标准库/1_log.md)
</details>

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


> [📄 21_viper.md](./mybook/go/6_常用标准库/21_viper.md)
</details>

<details>
<summary>validator 参数校验</summary>

- 常用标签：required/omitempty/min/max/len/gte/lte/email/url/ip/oneof
- 跨字段验证：eqfield/nefield/gtfield
- 自定义验证器：RegisterValidation
- 中文错误信息：locales/ut/translations
- Gin 集成：binding tag


> [📄 22_validator.md](./mybook/go/6_常用标准库/22_validator.md)
</details>

<details>
<summary>sqlx 数据库操作</summary>

- 连接：sqlx.Connect/Connect设置
- 查询：Get/Select/Queryx/StructScan/MapScan
- 增删改：Exec/NamedExec/批量插入
- 事务：Beginx/Commit/Rollback/BeginTxFunc
- 结构体映射：db tag


> [📄 23_sqlx.md](./mybook/go/6_常用标准库/23_sqlx.md)
</details>

<details>
<summary>Cobra CLI 开发</summary>

- 命令结构：Command/Use/Short/Long/Run
- 子命令：AddCommand
- 标志：PersistentFlags/Flags/IntP/StringP
- 必填标志：MarkFlagRequired
- 生命周期：PreRun/Run/PostRun
- 脚手架：cobra-cli


> [📄 26_cobra.md](./mybook/go/6_常用标准库/26_cobra.md)
</details>

<details>
<summary>Swagger / Air</summary>

- **Swagger**：swag init/主入口注解/接口注解(@Summary/@Param/@Success/@Router)/Gin集成
- **Air**：热重载/air init/.air.toml配置/Docker中使用


> [📄 25_swagger.md](./mybook/go/6_常用标准库/25_swagger.md) · [📄 24_air.md](./mybook/go/6_常用标准库/24_air.md)
</details>

#### 数据库操作

<details>
<summary>GORM</summary>

- 安装连接/连接池配置
- 模型定义：gorm tag(primarykey/type/not null/index/uniqueIndex/default)
- 自动迁移：AutoMigrate
- CRUD：Create/First/Find/Where/Update/Updates/Delete
- 关联：Preload/Joins/foreignKey
- 事务：Transaction
- GORM Gen：类型安全ORM/代码生成


> [📄 3_gorm.md](./mybook/go/6_常用标准库/3_gorm.md)
</details>

<details>
<summary>Go 操作 Redis</summary>

- go-redis 连接/配置
- 5大类型：String(SET/GET/INCR)/Hash(HSET/HGET/HGETALL)/List(LPush/RPush/LPop)/Set(SAdd/SMembers)/SortedSet(ZAdd/ZRange/ZScore)
- Pipeline：批量操作
- Lua 脚本：NewScript/Run
- 分布式锁：SetNX + Lua 释放
- 发布订阅：Subscribe/Publish


> [📄 28_redis.md](./mybook/go/6_常用标准库/28_redis.md)
</details>

<details>
<summary>Go 操作 MongoDB</summary>

- mongo-driver 连接
- CRUD：InsertOne/InsertMany/FindOne/Find/UpdateOne/UpdateMany/DeleteOne/DeleteMany
- 聚合管道：Aggregate/$match/$group/$sort/$limit
- 索引：Indexes().CreateOne/CreateMany


> [📄 29_mongodb.md](./mybook/go/6_常用标准库/29_mongodb.md)
</details>

<details>
<summary>Go 操作 Kafka / NSQ / RabbitMQ</summary>

- **Kafka**：kafka-go/Writer(生产)/Reader(消费)/ConsumerGroup/管理操作
- **NSQ**：go-nsq/Producer(Publish)/Consumer(AddHandler)/nsqlookupd发现
- **RabbitMQ**：amqp091-go/工作队列/发布订阅(Fanout)/路由(Direct)/主题(Topic)


> [📄 30_kafka.md](./mybook/go/6_常用标准库/30_kafka.md) · [📄 31_nsq.md](./mybook/go/6_常用标准库/31_nsq.md) · [📄 32_rabbitmq.md](./mybook/go/6_常用标准库/32_rabbitmq.md)
</details>

#### 可观测性

<details>
<summary>OpenTelemetry / Jaeger / Prometheus</summary>

- **OpenTelemetry**：TracerProvider/Span/属性/事件/错误记录/HTTP(gin)集成/gRPC集成
- **Jaeger**：部署(all-in-one)/Go集成/采样策略(AlwaysSample/TraceIDRatioBased)/Web UI
- **Prometheus Go**：Counter/Gauge/Histogram/Summary/Gin中间件/PromQL查询


> [📄 35_opentelemetry.md](./mybook/go/6_常用标准库/35_opentelemetry.md) · [📄 36_jaeger.md](./mybook/go/6_常用标准库/36_jaeger.md) · [📄 37_prometheus.md](./mybook/go/6_常用标准库/37_prometheus.md)
</details>

<details>
<summary>优雅关机与部署</summary>

- **优雅关机**：signal.Notify/srv.Shutdown/超时控制
- **优雅重启**：SIGHUP 信号处理
- **部署方式**：二进制/Systemd/Docker/K8s
- **编译优化**：-ldflags="-s -w"/版本信息注入(-X)


> [📄 33_优雅关机.md](./mybook/go/6_常用标准库/33_优雅关机.md) · [📄 3_部署.md](./mybook/go/11_工具与调试/3_部署.md)
</details>

### 1.7 常用框架

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


> [📄 2_gin.md](./mybook/go/7_常用框架/2_gin.md)
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


> [📄 1_go-zero.md](./mybook/go/7_常用框架/1_go-zero.md)
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


> [📄 6_GoFrame.md](./mybook/go/7_常用框架/6_GoFrame.md)
</details>

<details>
<summary>Gin vs go-zero 对比</summary>

| 维度 | Gin | go-zero |
|------|-----|---------|
| 定位 | 轻量 HTTP 框架 | 微服务全家桶 |
| API定义 | 代码路由 | .api DSL + goctl |
| 服务治理 | 需自建 | 内置限流/熔断/降级 |
| RPC | 无 | 内置 gRPC |
| 适用 | 中小型API | 大型微服务体系 |


> [📄 1003_gin_vs_go-zero.md](./mybook/go/7_常用框架/1003_gin_vs_go-zero.md)
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


> [📄 3_grpc.md](./mybook/go/7_常用框架/3_grpc.md)
</details>

<details>
<summary>Zinx / Etcd</summary>

- **Zinx**：轻量 TCP 并发服务器框架
- **Etcd**：分布式 KV / 分布式锁 / WAL / BoltDB / 高可用集群
- **gnet**：高性能、轻量级网络框架（Go）；基于 epoll/kqueue 实现；支持 TCP/UDP/Unix Domain Socket；Event-Driven 架构；适用：TCP/UDP 服务器、端口转发网关、代理服务


> [📄 4_zinx.md](./mybook/go/7_常用框架/4_zinx.md) · [📄 5_etcd.md](./mybook/go/7_常用框架/5_etcd.md)
</details>

#### 依赖注入

<details>
<summary>Wire & 依赖注入</summary>

- **Wire**：Google 出品的编译时依赖注入框架；Provider/Set/Injector/Build
- 与运行时 DI 框架（dig/fx）对比：编译时检查 vs 运行时反射
- 适用场景：大型项目结构化初始化


> [📄 7_Wire依赖注入.md](./mybook/go/7_常用框架/7_Wire依赖注入.md)
</details>

#### 微服务

<details>
<summary>Go kit 微服务</summary>

- 代码分层：Service(业务逻辑)/Endpoint(端点)/Transport(传输)
- 中间件模式：日志/指标/链路追踪
- 支持 HTTP/gRPC 传输


> [📄 8_go-kit.md](./mybook/go/7_常用框架/8_go-kit.md)
</details>

<details>
<summary>Consul 服务注册与发现</summary>

- 服务注册：AgentServiceRegistration/健康检查
- 服务发现：Health().Service()
- KV 存储：Put/Get
- 健康检查：HTTP/TCP/gRPC
- 注销服务：ServiceDeregister


> [📄 9_consul.md](./mybook/go/7_常用框架/9_consul.md)
</details>

### 1.8 Web接口性能优化

#### 编码优化

<details>
<summary>编码层面</summary>

- strings.Builder / bytes.Buffer 拼接
- 切片/Map 预分配容量
- 减少内存分配，避免逃逸到堆


> [📄 3_性能优化实战.md](./mybook/go/8_Web接口性能优化/3_性能优化实战.md)
</details>

<details>
<summary>并发 & 数据库 & 缓存</summary>

- errgroup 并发 / Worker Pool
- 连接池配置 / 批量操作 / 查询优化
- 多级缓存（本地 + Redis）/ singleflight 防击穿


> [📄 3_性能优化实战.md](./mybook/go/8_Web接口性能优化/3_性能优化实战.md)
</details>

#### HTTP与监控

<details>
<summary>HTTP & JSON & 监控</summary>

- Server 参数调优 / Keep-Alive / gzip 压缩
- json-iterator / 流式处理大 JSON
- pprof（CPU/Mem/Goroutine/Block）/ 火焰图 / go test -bench / Prometheus


> [📄 4_pprof性能分析.md](./mybook/go/8_Web接口性能优化/4_pprof性能分析.md) · [📄 1001_web接口性能优化.md](./mybook/go/8_Web接口性能优化/1001_web接口性能优化.md)
</details>

### 1.9 安全专题

#### 安全专题

<details>
<summary>SBOM</summary>

- 标准格式：SPDX / CycloneDX
- 生成工具：Syft / Trivy
- 各语言生成 / CI/CD 集成 / 漏洞扫描（Grype / Trivy）


> [📄 1004_sbom.md](./mybook/go/9_安全专题/1004_sbom.md)
</details>

<details>
<summary>国密算法与证书</summary>

- SM2（非对称） / SM3（哈希） / SM4（对称）
- 国密证书格式与 TLS 握手流程 / GM/T 标准体系
- 实战：生成国密证书、SM4 加解密


> [📄 1005_国密算法证书.md](./mybook/go/9_安全专题/1005_国密算法证书.md)
</details>

### 1.10 开源项目

#### 开源项目

<details>
<summary>项目列表</summary>

- Gin-vue-admin / Gin-api
- Packetbeat（流量捕获与流程）
- K3s（源码分析：编译/运行/build/server/agent/核心依赖）
- K8s（Pod/Node/Service/Deployment/CNI/CSI/CRI/Scheduling Framework）
- KSV 虚拟化 / Memos 笔记
- **OmniWire**：基于 GoFrame + Vue 3 的网络安全网关；集成 WireGuard VPN 服务端 + TCP/UDP 端口转发；gnet 高性能网络框架实现端口转发；支持 JWT 鉴权/二维码配置/流量统计


> [📁 go/10_开源项目/](./mybook/go/10_开源项目/)
</details>

### 1.11 工具 & 调试

#### 工具调试

<details>
<summary>常用工具</summary>

- go build / fmt / vet / test / doc / generate / embed / race
- golangci-lint（多 Linter 聚合）/ gomvpkg（包迁移）/ Docker 多阶段构建
- 性能调试：pprof（CPU/Mem/Goroutine/Block）/ 火焰图 / go test -bench / trace
- 部署：二进制/Systemd/Docker(docker-compose)/K8s/编译优化(-ldflags)


> [📄 0_常用工具.md](./mybook/go/11_工具与调试/0_常用工具.md) · [📄 2_性能调试.md](./mybook/go/11_工具与调试/2_性能调试.md) · [📄 3_部署.md](./mybook/go/11_工具与调试/3_部署.md)
</details>

### 1.12 分布式基础

#### 分布式基础

<details>
<summary>分布式理论 & 网络模型</summary>

- ACID / CAP / BASE / Paxos / Raft
- BIO / NIO / IO多路复用 / Go netpoller
- 分布式一致性：强一致/最终一致/因果一致
- 分布式时钟：Lamport 时钟 / 向量时钟
- Gossip 协议 / 一致性哈希 / 虚拟节点
- 分布式事务：2PC / 3PC / TCC / Saga / 本地消息表


> [📄 6_分布式.md](./mybook/go/12_分布式基础/6_分布式.md) · [📄 10_网络IO并发模型.md](./mybook/go/12_分布式基础/10_网络IO并发模型.md) · [📄 1000_golang知识点总结.md](./mybook/go/12_分布式基础/1000_golang知识点总结.md)
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


> [📁 cpp/C语言教程/语言基础/](./mybook/cpp/C语言教程/语言基础/)
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


> [📄 20_lua标准库.md](./mybook/lua/1_语言基础/20_lua标准库.md)
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


> [📄 C++MAP.md](./mybook/cpp/C++专题/基础语法/C++MAP.md)
</details>

#### 内存与模板

<details>
<summary>内存管理</summary>

- RAII（资源获取即初始化）
- 智能指针：unique_ptr / shared_ptr / weak_ptr
- 移动语义：左值/右值、右值引用、移动构造/移动赋值、std::move / std::forward
- 虚拟内存：分页/分段/VMA/内存映射


> [📄 1_内存管理.md](./mybook/cpp/C++专题/内存管理/1_内存管理.md)
</details>

<details>
<summary>模板</summary>

- 函数模板 / 类模板
- 模板特化 / 全特化 / 偏特化
- 可变参数模板 / 模板元编程


> [📄 1_模板.md](./mybook/cpp/C++专题/模板/1_模板.md)
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


> [📄 1_C++11特性.md](./mybook/cpp/C++专题/现代特性/1_C++11特性.md) · [📄 2_C++14-17特性.md](./mybook/cpp/C++专题/现代特性/2_C++14-17特性.md) · [📄 3_C++20-23特性.md](./mybook/cpp/C++专题/现代特性/3_C++20-23特性.md)
</details>

<details>
<summary>C++ 版本特性总览</summary>

- **C++11**：auto/range-for/lambda/move语义/智能指针/thread/atomic/constexpr/variadic template
- **C++14**：泛型lambda/返回类型推导/make_unique/[[deprecated]]
- **C++17**：结构化绑定/if constexpr/optional/variant/any/string_view/filesystem/parallel STL
- **C++20**：Concepts/Ranges/Coroutines/Modules/[[likely]]/std::format/span/source_location
- **C++23**：std::expected/std::print/std::flat_map/显式this参数(deducing this)/std::generator
- **C++26**（草案）：反射/契约/线性代数库/执行器


> [📄 1_C++11特性.md](./mybook/cpp/C++专题/现代特性/1_C++11特性.md) · [📄 2_C++14-17特性.md](./mybook/cpp/C++专题/现代特性/2_C++14-17特性.md) · [📄 3_C++20-23特性.md](./mybook/cpp/C++专题/现代特性/3_C++20-23特性.md)
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


> [📄 1_并发编程.md](./mybook/cpp/C++专题/并发与STL/1_并发编程.md)
</details>

<details>
<summary>STL</summary>

- 容器：序列（vector/list/deque/array/forward_list）/ 关联（set/map/multiset/multimap）/ 无序（unordered_set/unordered_map）/ 适配器（stack/queue/priority_queue）
- 算法：sort / find / transform / accumulate / for_each / remove_if / unique / lower_bound / upper_bound
- 迭代器：Input/Output/Forward/Bidirectional/Random Access / 迭代器失效问题
- 函数对象：functor / lambda / std::function / std::bind


> [📄 1_STL详解.md](./mybook/cpp/C++专题/并发与STL/1_STL详解.md)
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


> [📄 cmake-and-vcpkg.md](./mybook/cpp/C++专题/工具与库/cmake-and-vcpkg.md)
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


> [📁 cpp/C++专题/工具与库/](./mybook/cpp/C++专题/工具与库/)
</details>

#### 底层与安全

<details>
<summary>未定义行为 & 内存安全</summary>

- 常见未定义行为：悬空指针/越界访问/有符号溢出/空指针解引用/数据竞争/未初始化变量
- ASan（地址消毒器）/ MSan（内存消毒器）/ TSan（线程消毒器）/ UBSan
- RAII 原则与所有权语义
- 内存映射文件（mmap/CreateFileMapping）


> [📄 1_未定义行为与内存安全.md](./mybook/cpp/C++专题/底层与安全/1_未定义行为与内存安全.md)
</details>

<details>
<summary>汇编 & 调用约定</summary>

- 内联汇编 / 常见指令
- 调用约定：cdecl / stdcall / fastcall
- 函数名修饰规则


> [📄 2_汇编与调用约定.md](./mybook/cpp/C++专题/底层与安全/2_汇编与调用约定.md)
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


> [📄 Python基础_第2版.md](./mybook/python/1_语言基础/Python基础_第2版.md)
</details>

#### 风格指南

<details>
<summary>Python风格指南</summary>

- 导入规则、装饰器慎用、避免过度强大的特性
- __future__ 导入


> [📄 Python风格指南.md](./mybook/python/1_语言基础/Python风格指南.md)
</details>

### 3.2 Python工匠（最佳实践）

#### 变量与数据

<details>
<summary>善用变量</summary>

- 命名要有描述性、能猜出类型
- 避免 globals()/locals()
- 控制单个函数变量数量
- 合理使用 namedtuple/dict 返回多个值


> [📄 1-using-variables-well.md](./mybook/python/2_Python工匠/备忘/1-using-variables-well.md)
</details>

#### 控制流与函数

<details>
<summary>数值与字符串技巧</summary>

- 少写数字字面量、别在裸字符串上走太远
- 字符串拼接不慢、超长字符串可读性改善


> [📄 3-tips-on-numbers-and-strings.md](./mybook/python/2_Python工匠/备忘/3-tips-on-numbers-and-strings.md)
</details>

<details>
<summary>精通容器类型</summary>

- 写更快的代码（底层视角）/ 写扩展性更好的代码（高层视角）
- next() 函数、元组改善分支、有序字典去重
- 当心枯竭的迭代器


> [📄 4-mastering-container-types.md](./mybook/python/2_Python工匠/备忘/4-mastering-container-types.md)
</details>

<details>
<summary>循环编写技巧</summary>

- enumerate / product 扁平化 / islice 隔行 / takewhile 替代 break
- 生成器解耦循环体


> [📄 7-two-tips-on-loop-writing.md](./mybook/python/2_Python工匠/备忘/7-two-tips-on-loop-writing.md)
</details>

<details>
<summary>函数返回值技巧</summary>

- 不返回多种类型 / partial 构造新函数
- 抛出异常而非返回结果+错误
- Null Object 模式 / 生成器替代返回列表 / 限制递归


> [📄 5-function-returning-tips.md](./mybook/python/2_Python工匠/备忘/5-function-returning-tips.md)
</details>

<details>
<summary>异常处理三个习惯</summary>

- 只做最精确的异常捕获 / 别破坏抽象一致性 / 异常处理不喧宾夺主


> [📄 6-three-rituals-of-exceptions-handling.md](./mybook/python/2_Python工匠/备忘/6-three-rituals-of-exceptions-handling.md)
</details>

<details>
<summary>装饰器技巧</summary>

- 用类实现 / wrapt 模块 / functools.wraps() / nonlocal


> [📄 8-tips-on-decorators.md](./mybook/python/2_Python工匠/备忘/8-tips-on-decorators.md)
</details>

#### 面向对象与设计

<details>
<summary>SOLID 原则</summary>

- S：单一职责 → 拆大类/用函数
- O：开闭原则 → 继承/组合/IoC/数据驱动
- L：里氏替换 → 不当继承的修正
- I：接口隔离 → 接口拆分
- D：依赖倒置 → 抽象注入、单元测试


> [📄 12-write-solid-python-codes-part-1.md](./mybook/python/2_Python工匠/备忘/12-write-solid-python-codes-part-1.md) · [📄 13-write-solid-python-codes-part-2.md](./mybook/python/2_Python工匠/备忘/13-write-solid-python-codes-part-2.md) · [📄 14-write-solid-python-codes-part-3.md](./mybook/python/2_Python工匠/备忘/14-write-solid-python-codes-part-3.md)
</details>

<details>
<summary>Edge Cases 思维</summary>

- EAFP（获取原谅比许可简单）
- defaultdict / setdefault / dict.pop
- "or" 操作符陷阱 / 数据校验不要手动做


> [📄 15-thinking-in-edge-cases.md](./mybook/python/2_Python工匠/备忘/15-thinking-in-edge-cases.md)
</details>

<details>
<summary>If-else 分支思维</summary>

- 避免多层嵌套 / 封装复杂逻辑 / 留意分支重复代码
- 德摩根定律 / all()/any() / 自定义布尔
- None 值比较陷阱 / and/or 优先级


> [📄 2-if-else-block-secrets.md](./mybook/python/2_Python工匠/备忘/2-if-else-block-secrets.md)
</details>

#### 文件与工程

<details>
<summary>路径与文件操作</summary>

- pathlib 替代 os.path
- 流式读取大文件（read分块 + 生成器）
- 设计接受文件对象的函数


> [📄 11-three-tips-on-writing-file-related-codes.md](./mybook/python/2_Python工匠/备忘/11-three-tips-on-writing-file-related-codes.md)
</details>

<details>
<summary>循环导入的故事</summary>

- 环形依赖问题的实际案例与解决方案


> [📄 9-a-story-on-cyclic-imports.md](./mybook/python/2_Python工匠/备忘/9-a-story-on-cyclic-imports.md)
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


> [📁 python/3_版本演进/](./mybook/python/3_版本演进/)
</details>

### 3.4 标准库

#### 内置类型与异常

<details>
<summary>内置类型与异常</summary>

- 内置类型：数值/序列/映射/集合/特殊类型
- 内置异常：异常链 / 异常组 / 层次结构
- 内置函数与常量


> [📄 内置类型.md](./mybook/python/4_标准库/内置类型.md) · [📄 内置异常.md](./mybook/python/4_标准库/内置异常.md) · [📄 内置函数.md](./mybook/python/4_标准库/内置函数.md) · [📄 内置常量.md](./mybook/python/4_标准库/内置常量.md)
</details>

#### 数据处理

<details>
<summary>文本与数据处理</summary>

- 文本处理：string / re / textwrap / difflib
- 文件和目录访问：pathlib / os.path / tempfile / shutil
- functools：partial / reduce / cache / wraps / singledispatch


> [📄 文本处理服务.md](./mybook/python/4_标准库/文本处理服务.md) · [📄 文件和目录访问.md](./mybook/python/4_标准库/文件和目录访问.md) · [📄 函数式编程模块.md](./mybook/python/4_标准库/函数式编程模块.md)
</details>

#### 垃圾回收

<details>
<summary>垃圾回收</summary>

- 引用计数（主）+ 标记清除（循环引用）+ 分代回收
- 环状双向链表 refchain / 池化技术（int/small string）


> [📄 垃圾回收.md](./mybook/python/4_标准库/垃圾回收.md)
</details>

#### 并发与网络

<details>
<summary>并发执行</summary>

- multiprocessing + shared_memory
- concurrent.futures / queue / sched / contextvars
- GIL 原理与限制：CPU 密集型无法并行，I/O 密集型可并发
- 多进程 vs 多线程 vs 协程选型指南
- Python 3.13+ 自由线程（no-GIL）实验性支持


> [📄 并发执行.md](./mybook/python/4_标准库/并发执行.md)
</details>

<details>
<summary>网络和进程间通信</summary>

- asyncio：协程/Task/同步原语/子进程/Queue/超时/取消
- asyncio 深入：事件循环（uvloop/asyncio） / Task 调度 / Future / awaitable 协议
- socket / ssl / select / selectors / signal / mmap
- WSGI（同步）/ ASGI（异步）协议与服务器


> [📄 网络和进程间通信.md](./mybook/python/4_标准库/网络和进程间通信.md)
</details>

### 3.5 常用库

#### 核心库

<details>
<summary>核心</summary>

- **Pydantic**：数据校验与序列化框架，基于 Python 类型注解；Model/Field/validator/自定义验证器；v2 基于 Rust 重写，性能大幅提升
- **SQLAlchemy**：Python ORM 框架，Core（SQL表达式）+ ORM（对象映射）；Session 管理/关系映射/查询 API/异步支持
- **Celery**：分布式任务队列；Broker（Redis/RabbitMQ）+ Worker + Backend；任务链/组/和弦/定时任务（beat）；序列化/重试/限流/信号
- **Huey**：轻量任务队列；Redis/SQLite 后端；支持定时任务/重试/任务管道


> [📄 pydantic.md](./mybook/python/5_常用库/pydantic.md) · [📄 SQLAlchemy.md](./mybook/python/7_第三方库/SQLAlchemy.md) · [📄 celery.md](./mybook/python/5_常用库/celery.md) · [📄 huey.md](./mybook/python/5_常用库/huey.md)
</details>

#### 网络爬虫

<details>
<summary>网络/爬虫</summary>

- **Playwright**：浏览器自动化；同步/异步 API / 多浏览器支持 / 反检测/截图/定位器/网络拦截/移动端模拟
- **Scrapy**：爬虫框架；Spider/Item/Pipeline/Middleware/Selector；分布式爬虫（scrapy-redis）
- **Feapder**：轻量爬虫框架；支持内存/Redis 数据库；爬虫监控与报警


> [📄 playwright.md](./mybook/python/7_第三方库/playwright.md) · [📄 scrapy.md](./mybook/python/7_第三方库/scrapy.md) · [📄 feapder.md](./mybook/python/7_第三方库/feapder.md)
</details>

#### 协程性能

<details>
<summary>协程 & 性能</summary>

- **Gevent**：基于 greenlet 的协程库；猴子补丁（monkey.patch_all）将标准库替换为协程版本；事件/池/锁/信号量/Subprocess/Actors 模式
- **uvloop**：asyncio 事件循环的高性能替代，基于 libuv，性能接近 Go
- **Trio**：友好的异步并发库，结构化并发模型


> [📄 gevent.md](./mybook/python/5_常用库/gevent.md) · [📄 uvloop.md](./mybook/python/5_常用库/uvloop.md)
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


> [📄 代码保护.md](./mybook/python/7_第三方库/代码保护.md) · [📄 常用包.md](./mybook/python/7_第三方库/常用包.md)
</details>

#### 数据科学

<details>
<summary>数据处理 & 科学计算</summary>

- **NumPy**：多维数组/广播/线性代数/傅里叶变换/随机数
- **Pandas**：DataFrame/Series/数据清洗/聚合/透视表/时序处理
- **Matplotlib / Seaborn**：数据可视化
- **Polars**：Rust 编写的高性能 DataFrame 库，比 Pandas 快数倍
- **SciPy**：科学计算（优化/插值/积分/信号处理）


> [📄 NumPy.md](./mybook/python/7_第三方库/NumPy.md) · [📄 Pandas.md](./mybook/python/7_第三方库/Pandas.md) · [📄 Polars.md](./mybook/python/7_第三方库/Polars.md) · [📄 数据可视化.md](./mybook/python/7_第三方库/数据可视化.md)
</details>

#### 包分发

<details>
<summary>包分发 & C扩展</summary>

- **包分发**：setup.py / pyproject.toml / wheel / sdist / PyPI 发布
- **C 扩展**：ctypes / cffi / Cython / pybind11；编写 C 扩展模块
- **字节码**：dis 模块 / compile / exec / code object
- **性能分析**：cProfile / line_profiler / memory_profiler / py-spy


> [📄 常用包.md](./mybook/python/7_第三方库/常用包.md) · [📄 zipapp打包应用.md](./mybook/python/1_语言基础/zipapp打包应用.md)
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


> [📁 python/6_Web开发/django/](./mybook/python/6_Web开发/django/)
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


> [📁 python/6_Web开发/flask/](./mybook/python/6_Web开发/flask/)
</details>

#### FastAPI等

<details>
<summary>FastAPI / Tornado / Bottle / Quart / Sanic</summary>

- **FastAPI**：异步 ASGI 框架 + 自动 OpenAPI 文档 + Pydantic 数据校验；目录结构（api/models/schemas/db）；Sentry 错误追踪；Prometheus 指标监控
- **Tornado**：路由/模板/自定义session/异步非阻塞
- **Bottle**：轻量（路由/请求/响应/模板/SQLite），单文件即可运行
- **Quart**：Flask 异步版本，API 兼容 Flask
- **Sanic**：高性能异步 Web 框架


> [📁 python/6_Web开发/fastapi/](./mybook/python/6_Web开发/fastapi/) · [📄 fastapi.md](./mybook/python/6_Web开发/fastapi.md) · [📄 tornado.md](./mybook/python/6_Web开发/tornado.md) · [📄 bottle.md](./mybook/python/6_Web开发/bottle.md) · [📄 quart.md](./mybook/python/6_Web开发/quart.md) · [📄 sanic.md](./mybook/python/6_Web开发/sanic.md)
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


> [📄 微服务.md](./mybook/python/6_Web开发/微服务.md)
</details>

#### 反爬安全

<details>
<summary>反爬与安全</summary>

- 反爬策略：User-Agent 检测 / IP 限制 / Session 限制 / Spider Trap / 验证码（图形/滑动/行为）
- 数据保护：动态加载（Ajax/SPA）/ 数据加密 / 非可视区域遮挡 / 字体反爬 / CSS 偏移
- 绕过技术：Selenium/Playwright/请求头伪装/代理池/Cookie 池/JS 逆向


> [📄 反爬.md](./mybook/python/6_Web开发/反爬.md)
</details>

### 3.7 第三方库

#### 数据库驱动

<details>
<summary>数据库驱动</summary>

- **PyMySQL**：纯 Python MySQL 客户端；SQL 执行流程（connect → cursor → execute → fetch）/MySQL 行存储格式/连接池/事务控制
- **Redis（redis-py）**：5 大基础数据类型 + 3 大扩展类型（HyperLogLog/Bitmap/Geo）；主从/哨兵/Cluster；分布式锁（SET NX EX）/Redlock/Pipeline/发布订阅/Lua 脚本
- **MongoDB（pymongo）**：文档型 NoSQL；对比 MySQL/Redis/ES；副本集选举（Raft）；事务（4.0+）；GridFS 大文件存储；聚合管道/索引优化


> [📄 pymysql.md](./mybook/python/7_第三方库/pymysql.md) · [📄 redis-py.md](./mybook/python/7_第三方库/redis-py.md) · [📄 mongodb.md](./mybook/python/7_第三方库/mongodb.md)
</details>

#### 消息队列与搜索

<details>
<summary>消息队列 & 搜索</summary>

- **RabbitMQ**：AMQP 协议；Exchange 类型（direct/fanout/topic/headers）；生产者-消费者/发布订阅/路由/模糊匹配；消息确认/持久化/死信队列/延迟队列
- **Kafka**：高吞吐分布式消息系统；Topic/Partition/Consumer Group/Offset；日志追加存储/零拷贝/页面缓存；Exactly-Once 语义/事务/分区再平衡；Kafka Streams/Connect 生态
- **Elasticsearch**：倒排索引/分词器/映射（Mapping）；插入速度优化（bulk/refresh_interval/副本延迟）；聚合查询/向量搜索/ILM 生命周期


> [📄 rabbitmq.md](./mybook/python/7_第三方库/rabbitmq.md) · [📄 kafka.md](./mybook/python/7_第三方库/kafka.md) · [📄 Elasticsearch.md](./mybook/python/7_第三方库/Elasticsearch.md)
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


> [📄 langchain.md](./mybook/python/7_第三方库/langchain.md) · [📄 litllm.md](./mybook/python/7_第三方库/litllm.md) · [📄 大模型.md](./mybook/python/7_第三方库/大模型.md) · [📄 大模型开发流程.md](./mybook/python/7_第三方库/大模型开发流程.md) · [📄 PythonAI绘画.md](./mybook/python/7_第三方库/PythonAI绘画.md) · [📄 RAG系统设计.md](./mybook/python/7_第三方库/RAG系统设计.md) · [📄 LangChain实战.md](./mybook/python/7_第三方库/LangChain实战.md)
</details>

#### 自动化部署

<details>
<summary>自动化 & 部署</summary>

- **Ansible**：自动化运维；Playbook/Inventory/Module/Role；幂等性/声明式配置
- **Fabric**：轻量远程执行框架；SSH 连接/批量命令/文件上传下载/任务编排
- **Terraform**：IaC 基础设施即代码；HCL 语法/Provider/State 管理/模块化
- **Playwright**：浏览器自动化；同步/异步 API/反检测/截图/定位器/网络拦截
- **Flask-PluginKit**：基于 Flask 的插件式开发工具


> [📄 ansible.md](./mybook/python/7_第三方库/自动化运维/ansible.md) · [📄 fabric.md](./mybook/python/7_第三方库/自动化运维/fabric.md) · [📄 terraform.md](./mybook/python/7_第三方库/自动化运维/terraform.md) · [📄 playwright.md](./mybook/python/7_第三方库/playwright.md)
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


> [📄 基础架构.md](./mybook/python/8_高并发设计/基础架构.md)
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


> [📄 高可用.md](./mybook/python/8_高并发设计/高可用.md)
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


> [📄 高并发.md](./mybook/python/8_高并发设计/高并发.md)
</details>

#### 分库分表与ID

<details>
<summary>分库分表</summary>

- 水平/垂直分库分表
- 分表键选择 / 分表策略（range/hash/一致性hash）
- 跨节点Join / 聚合函数 / 分页问题（全局视野法/禁止跳页/二次查询）
- 分布式ID（Snowflake / 美团Leaf）


> [📄 分库分表.md](./mybook/python/8_高并发设计/分库分表.md)
</details>

<details>
<summary>唯一ID</summary>

- 分布式唯一ID方案
- 美团Leaf（segment + snowflake）


> [📄 唯一id.md](./mybook/python/8_高并发设计/唯一id.md)
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


> [📄 缓存.md](./mybook/python/8_高并发设计/缓存.md)
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


> [📄 可观测性.md](./mybook/python/8_高并发设计/可观测性.md)
</details>

#### 业务场景

<details>
<summary>海量推送系统</summary>

- 设计要点：长连接管理 / 消息可靠性 / 推送通道选择（APNs/FCM/自建）
- 架构：网关层 → 路由层 → 推送层 → 消息队列 → 存储层
- 关键指标：在线率/到达率/延迟/吞吐量
- 优化：连接复用/批量推送/分级推送/消息压缩/断线重连


> [📄 海量推送系统.md](./mybook/python/8_高并发设计/海量推送系统.md)
</details>

<details>
<summary>用户登录服务</summary>

- 账号 / 密码保护 / 手机号邮箱登录 / 第三方登录 / 登录态管理 / 扫码登录


> [📄 用户登陆服务.md](./mybook/python/8_高并发设计/用户登陆服务.md)
</details>

<details>
<summary>微服务</summary>

- gin+grpc / 微服务框架选型


> [📄 微服务.md](./mybook/python/6_Web开发/微服务.md)
</details>

### 3.9 面试题

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


> [📄 面试题.md](./mybook/python/9_面试题/面试题.md)
</details>

---

## 四、Lua

### 4.1 语言基础

#### 基础语法

<details>
<summary>数据类型与变量</summary>

- nil / boolean / number / string / function / table / thread / userdata
- 变量作用域与解释器


> [📄 02_lua数据类型与变量.md](./mybook/lua/1_语言基础/02_lua数据类型与变量.md)
</details>

#### 面向对象

<details>
<summary>面向对象 & 环境</summary>

- 类与对象：基于 table + metatable 实现面向对象
- 元表与元方法：`__index` / `__newindex` / `__add` / `__call` / `__tostring` / `__gc`
- 继承：通过 `__index` 元方法实现单继承/多继承
- `_G` 全局环境表 / `_ENV`（Lua 5.2+）局部环境
- 模块与包：require 机制 / module 函数 / package.path/cpath


> [📄 11_面向对象.md](./mybook/lua/1_语言基础/11_面向对象.md) · [📄 12_环境.md](./mybook/lua/1_语言基础/12_环境.md)
</details>

#### 协程

<details>
<summary>函数</summary>

- 定义与调用 / 函数变量 / 可变参数 / 闭包


> [📄 08_函数.md](./mybook/lua/1_语言基础/08_函数.md)
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


> [📄 14_lua_coroutine.md](./mybook/lua/1_语言基础/14_lua_coroutine.md)
</details>

#### 错误处理

<details>
<summary>错误处理 & 模式匹配</summary>

- 错误处理：`pcall(f, ...)`（保护调用，返回 ok,result）/ `xpcall(f, handler)`（带错误处理器）
- 自定义错误对象：`error({code=500, msg="..."})`
- Lua 模式匹配（非正则）：`%d %w %a %s %l %u %p` 字符类 / `%b()` 平衡匹配 / 锚点 `^$`
- 与正则的区别：无交替符(|)/无量词{m,n}/无反向引用/更轻量更快


> [📄 04_错误处理与模式匹配.md](./mybook/lua/1_语言基础/04_错误处理与模式匹配.md)
</details>

#### GC与性能

<details>
<summary>GC & 性能</summary>

- 增量标记-清除 GC（Lua 5.1+）/ 分代 GC（Lua 5.4 默认）
- `collectgarbage("collect"/"count"/"step"/"setpause"/"setstepmul")`
- 弱引用表：`__mode = "k"/"v"/"kv"`，避免内存泄漏
- finalizer：`__gc` 元方法，对象回收前执行清理
- 性能优化：局部变量优先/减少全局访问/预分配 table/避免频繁字符串拼接


> [📄 17_GC与性能优化.md](./mybook/lua/1_语言基础/17_GC与性能优化.md)
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


> [📄 20_lua标准库.md](./mybook/lua/1_语言基础/20_lua标准库.md)
</details>

### 4.2 高级主题

#### LuaJIT

<details>
<summary>LuaJIT & FFI</summary>

- LuaJIT：Lua 的即时编译实现，性能远超标准 Lua 解释器
- JIT 编译：运行时将热点 Lua 代码编译为本地机器码
- Trace 编译器：记录执行路径（Trace），优化循环和热函数
- LuaFFI：直接在 Lua 中声明和调用 C 函数，无需编写 C 绑定代码
- `ffi.cdef` 声明 C 类型/函数签名，`ffi.C` 访问默认 C 库
- `ffi.new` / `ffi.cast` / `ffi.string` 等 FFI 辅助函数


> [📄 15_luaJIT.md](./mybook/lua/2_高级主题/15_luaJIT.md) · [📄 16_lua_FFI.md](./mybook/lua/2_高级主题/16_lua_FFI.md)
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


> [📄 40_openresty安装.md](./mybook/lua/2_高级主题/40_openresty安装.md)
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


> [📄 30_Lua与C++.md](./mybook/lua/2_高级主题/30_Lua与C++.md)
</details>

#### 生态

<details>
<summary>LuaGo</summary>

- lua chunk 文件格式


> [📄 50_luago.md](./mybook/lua/2_高级主题/50_luago.md)
</details>

<details>
<summary>生态</summary>

- **LuaFileSystem**：文件系统操作库，目录遍历/文件属性/创建删除目录
- **Lua Nginx WAF**：基于 OpenResty 的 Web 应用防火墙，规则引擎/IP 黑白名单/CC 防护
- **OpenStar**：OpenResty WAF 增强版，更灵活的规则配置/动态加载/日志分析


> [📄 21_luafilesystem.md](./mybook/lua/2_高级主题/21_luafilesystem.md) · [📄 60_lua_ngx_waf.md](./mybook/lua/2_高级主题/60_lua_ngx_waf.md) · [📄 70_openstar.md](./mybook/lua/2_高级主题/70_openstar.md)
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


> [📄 1_HTML5基础.md](./mybook/web/1_前端基础/1_HTML5基础.md) · [📄 2_CSS布局.md](./mybook/web/1_前端基础/2_CSS布局.md)
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


> [📄 1_JS核心.md](./mybook/web/1_前端基础/1_JS核心.md)
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


> [📄 2_TypeScript.md](./mybook/web/1_前端基础/2_TypeScript.md)
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


> [📄 React.md](./mybook/web/2_前端框架/React.md)
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


> [📄 Vue.md](./mybook/web/2_前端框架/Vue.md)
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


> [📄 Node.js.md](./mybook/web/2_前端框架/Node.js.md)
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


> [📄 HTTP协议.md](./mybook/web/3_后端与协议/HTTP协议.md)
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


> [📄 浏览器原理.md](./mybook/web/3_后端与协议/浏览器原理.md)
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


> [📄 tailwind-css.md](./mybook/web/4_工程化与工具/tailwind-css.md)
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


> [📄 vite.md](./mybook/web/4_工程化与工具/vite.md)
</details>

#### 文档与插件

<details>
<summary>Vuepress</summary>

- 快速入门 / 部署到 GitHub Pages
- Markdown 配置与扩展 / 页面配置 / 组件 / 加密 / 布局


> [📄 vuepress.md](./mybook/web/4_工程化与工具/vuepress.md) · [📁 web/4_工程化与工具/vuepress-demo/](./mybook/web/4_工程化与工具/vuepress-demo/)
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


> [📄 memos-vscode插件开发记录.md](./mybook/web/4_工程化与工具/vscode/memos-vscode插件开发记录.md)
</details>

<details>
<summary>Markdown</summary>

- Markdown 介绍 / 配置 / 扩展（VuePress / 主题 / 图片增强）


> [📄 markdown.md](./mybook/web/4_工程化与工具/vuepress-demo/markdown.md)
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


> [📄 1_OWASP-Top10.md](./mybook/security/1_Web安全/1_OWASP-Top10.md)
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


> [📄 3_常见漏洞.md](./mybook/security/1_Web安全/3_常见漏洞.md)
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


> [📄 常见认证方式.md](./mybook/security/1_Web安全/常见认证方式.md)
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


> [📄 逻辑漏洞.md](./mybook/security/1_Web安全/逻辑漏洞.md)
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


> [📄 1_方法论.md](./mybook/security/2_安全工具与方法/1_方法论.md)
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


> [📄 3_Nuclei.md](./mybook/security/2_安全工具与方法/3_Nuclei.md)
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


> [📄 漏扫爬虫.md](./mybook/security/2_安全工具与方法/漏扫爬虫.md)
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


> [📄 容器内信息收集.md](./mybook/security/3_云与容器安全/容器内信息收集.md)
</details>

### 6.3 云与容器安全

<details>
<summary>容器 & 云安全</summary>

- 容器逃逸：特权容器/Cgroup逃逸/dirty cow/内核漏洞/挂载逃逸
- K8s 安全：RBAC/Pod Security Standards/NetworkPolicy/Secret 加密/etcd 安全
- 镜像安全：基础镜像选择/最小权限/镜像签名/漏洞扫描（Trivy/Snyk）
- 云安全：IAM 最小权限/VPC 隔离/安全组/密钥管理（KMS）
- 供应链安全：SBOM/软件签名/SLSA 框架/依赖锁定


> [📄 Docker安全.md](./mybook/security/3_云与容器安全/Docker安全.md) · [📄 K8s安全.md](./mybook/security/3_云与容器安全/K8s安全.md)
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


> [📄 数据结构与算法.md](./mybook/algorithms/数据结构与算法.md) · [📁 algorithms/algo/](./mybook/algorithms/algo/)
</details>

#### 算法设计与分析

<details>
<summary>算法设计</summary>

- 迭代与递归 / 分治 / 回溯
- 动态规划（0-1背包 / 完全背包 / 编辑距离 / 最长公共子序列）
- 贪心算法（分数背包 / 最大容量 / 最大乘积切割）
- 二分查找 / 搜索算法


> [📁 algorithms/algo/](./mybook/algorithms/algo/)
</details>

<details>
<summary>排序算法</summary>

- 冒泡 / 插入 / 选择 / 快速 / 归并 / 堆排序
- 桶排序 / 计数排序 / 基数排序
- 算法总览（时间/空间/稳定性对比）


> [📁 algorithms/algo/chapter_sorting/](./mybook/algorithms/algo/chapter_sorting/)
</details>

<details>
<summary>复杂度分析</summary>

- 时间复杂度 / 空间复杂度 / 性能评估
- 最差/最佳/平均时间复杂度


> [📁 algorithms/algo/chapter_computational_complexity/](./mybook/algorithms/algo/chapter_computational_complexity/)
</details>

#### 理论与刷题

<details>
<summary>基础理论</summary>

- 数字编码（原码/反码/补码/浮点数）
- 字符编码（ASCII / GBK / Unicode / UTF-8）
- 内存与缓存


> [📄 number_encoding.md](./mybook/algorithms/algo/chapter_data_structure/number_encoding.md) · [📄 character_encoding.md](./mybook/algorithms/algo/chapter_data_structure/character_encoding.md)
</details>

<details>
<summary>算法题分类（BM系列）</summary>

- 链表篇（14题）/ 二叉树篇（15题）/ 搜索与回溯篇（8题）
- 动态规划篇（11+题）/ 堆栈与队列篇（9题）
- 哈希与双指针篇 / 排序篇 / 字符串篇 / 位运算篇 / 二分查找篇
- 设计数据结构（LRU / LFU）
- 面试高频 TOP10 与知识要点


> [📄 数据结构与算法.md](./mybook/algorithms/数据结构与算法.md)
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


> [📄 1_操作系统基础.md](./mybook/os-linux/1_操作系统基础.md)
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


> [📁 os-linux/](./mybook/os-linux/)
</details>

<details>
<summary>iptables 与 netfilter</summary>

- **netfilter 架构**：5 个钩子点（PREROUTING/INPUT/FORWARD/OUTPUT/POSTROUTING）
- **四表五链**：filter（INPUT/FORWARD/OUTPUT）/nat（PREROUTING/OUTPUT/POSTROUTING）/mangle/raw
- **iptables 语法**：规则/链/表/匹配条件/动作（ACCEPT/DROP/REJECT/DNAT/SNAT/MASQUERADE）
- **常用规则**：放行 SSH/HTTP、NAT 转发、端口映射、IP 伪装
- **持久化**：iptables-save/iptables-restore/iptables-persistent
- **iptables vs nftables**：语法简化/集合/字典/兼容性


> [📄 4_iptables与netfilter.md](./mybook/os-linux/4_iptables与netfilter.md)
</details>

<details>
<summary>Firewalld</summary>

- **概述**：动态防火墙管理工具，iptables/nftables 前端
- **zone 概念**：public/trusted/home/internal/dmz/work/external/block/drop
- **服务与端口管理**：firewall-cmd 常用命令（--add-service/--add-port/--reload）
- **富规则（Rich Rules）**：复杂规则配置（source/destination/port/action/log）
- **直接规则**：--direct 选项直接操作 iptables
- **与 Docker/K8s 兼容性**：Docker 操作 iptables 导致冲突/解决方案


> [📄 5_Firewalld.md](./mybook/os-linux/5_Firewalld.md)
</details>

<details>
<summary>DenyHosts 与 SSH 安全</summary>

- **SSH 暴力破解**：原理与危害/常见攻击方式
- **DenyHosts**：安装配置/工作原理（分析日志→写入 hosts.deny）/同步服务器
- **Fail2Ban**：更强大的替代方案/正则匹配/jail 配置/action 配置
- **SSH 安全加固**：密钥认证/禁用 root/修改端口/白名单/MaxAuthTries
- **与 iptables/Firewalld 联动**：自动封禁 IP


> [📄 6_DenyHosts与SSH安全.md](./mybook/os-linux/6_DenyHosts与SSH安全.md)
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


> [📄 7_Linux性能优化.md](./mybook/os-linux/7_Linux性能优化.md)
</details>

<details>
<summary>Linux 网络工具</summary>

- **网络诊断**：ip/ss/ping/traceroute/mtr/nslookup/dig
- **流量分析**：tcpdump/wireshark/nethogs/iftop/nload
- **连接管理**：nc/curl/telnet/ssh
- **网络配置**：ip route/bridge/vlan/bonding/team
- **DNS 工具**：dig/host/nslookup/resolvectl/systemd-resolved


> [📄 8_Linux网络工具.md](./mybook/os-linux/8_Linux网络工具.md)
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


> [📄 9_Shell编程.md](./mybook/os-linux/9_Shell编程.md)
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


> [📄 11_网络协议.md](./mybook/os-linux/11_网络协议.md)
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


> [📄 10_Git高级.md](./mybook/os-linux/10_Git高级.md)
</details>

### 7.3 架构设计

#### 系统架构

<details>
<summary>系统架构</summary>

- 软件过程模型（瀑布/原型/螺旋/敏捷/RUP）
- CMM / CMMI
- 需求工程 / 结构化方法（SASD）/ 面向对象方法
- 软件架构风格 / 架构复用 / DSSA


> [📄 0_软考架构基础.md](./mybook/architecture/0_软考架构基础.md) · [📄 1_架构设计.md](./mybook/architecture/1_架构设计.md)
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


> [📁 architecture/数据库/](./mybook/architecture/数据库/)
</details>

#### 信息系统与安全

<details>
<summary>信息系统架构</summary>

- 面向服务架构（SOA）：服务契约/服务编排/ESB 企业服务总线/EDB 事件驱动总线
- 层次式架构：表现层/业务层/数据访问层/跨层通信
- 物联网架构：感知层/网络层/平台层/应用层；边缘计算/MQTT/CoAP
- 大型网站架构演进九阶段：①单体架构 → ②应用数据分离 → ③使用缓存 → ④服务集群（负载均衡） → ⑤数据库读写分离 → ⑥CDN和反向代理 → ⑦分布式文件系统和数据库 → ⑧NoSQL和搜索引擎 → ⑨业务拆分（微服务化）


> [📄 3_信息系统架构.md](./mybook/architecture/3_信息系统架构.md) · [📄 0_大型网站架构演进.md](./mybook/architecture/0_大型网站架构演进.md)
</details>

<details>
<summary>未来技术</summary>

- 机器人 / 边缘计算 / AI / 数字孪生 / 云计算与大数据


> [📄 3_信息系统架构.md](./mybook/architecture/3_信息系统架构.md)
</details>

<details>
<summary>安全基础</summary>

- 访问控制：DAC/MAC/RBAC/ABAC 模型；三要素（主体/客体/控制策略）；实现机制（ACM/ACL/能力表/授权关系表）
- 数字签名：RSA/ECDSA 签名与验证 / 数字证书 / CA 链；五大特性（可信/不可伪造/不可重用/不可改变/不可抵赖）
- 信息安全保障体系：五性（机密性/完整性/可用性/可控性/可检查性）
- 安全评估：等级保护（五级：用户自主保护/系统审计保护/安全标记保护/结构化保护/访问验证）/ 风险评估（要素：脆弱性/资产/威胁/风险/安全措施）/ 渗透测试 / 安全审计
- 安全保密技术：DLP（数据泄露防护）/ 数字水印
- 安全协议：SSL/TLS / PGP / IPSec / SET / HTTPS


> [📄 4_安全基础.md](./mybook/architecture/4_安全基础.md)
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


> [📄 1_K8s核心概念.md](./mybook/devops/kubernetes/1_K8s核心概念.md)
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


> [📄 6_K8s核心组件详解.md](./mybook/devops/kubernetes/6_K8s核心组件详解.md)
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


> [📄 4_K8s持久化存储.md](./mybook/devops/kubernetes/4_K8s持久化存储.md)
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


> [📄 5_Prometheus监控K8s.md](./mybook/devops/kubernetes/5_Prometheus监控K8s.md)
</details>

<details>
<summary>Docker Swarm</summary>

- 集群部署 / 节点管理 / 服务部署与扩缩容
- 存储卷挂载 / 可视化面板 / 容器网络


> [📄 docker-swarm.md](./mybook/devops/docker-swarm.md)
</details>

#### CI/CD与API

<details>
<summary>CI/CD</summary>

- **GitHub Actions**：Workflow/Job/Step/Action/Runner/Matrix/Secrets
- **GitLab CI**：.gitlab-ci.yml / Pipeline/Stage/Artifact/Environment
- **Jenkins**：Pipeline as Code / Shared Library / Agent/Node
- **ArgoCD**：GitOps 持续交付 / Application / Sync / Rollback
- 最佳实践：流水线设计/环境管理/制品管理/安全扫描集成


> [📄 1_GitHub-Actions.md](./mybook/devops/cicd/1_GitHub-Actions.md) · [📄 2_GitLab-CI.md](./mybook/devops/cicd/2_GitLab-CI.md) · [📄 3_Jenkins.md](./mybook/devops/cicd/3_Jenkins.md)
</details>

<details>
<summary>API 设计</summary>

- RESTful 设计原则：资源命名/HTTP 方法语义/状态码/HATEOAS
- API 版本策略：URL 路径/Header/查询参数
- GraphQL：Schema/Query/Mutation/Subscription/Resolver/N+1 DataLoader
- gRPC vs REST vs GraphQL 选型
- API 网关：限流/认证/日志/灰度发布/协议转换
- API 文档：OpenAPI/Swagger/Protobuf


> [📄 4_API设计.md](./mybook/devops/cicd/4_API设计.md)
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


> [📄 1_Puppet.md](./mybook/devops/自动化运维/1_Puppet.md)
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


> [📄 2_Ansible.md](./mybook/devops/自动化运维/2_Ansible.md)
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


> [📄 3_SaltStack.md](./mybook/devops/自动化运维/3_SaltStack.md)
</details>

#### 基础设施

<details>
<summary>ES集群 / Redis / 监控</summary>

- **ES 集群**：节点角色（Master/Data/Coordinating）/分片与副本/集群健康状态/索引模板/ILM 生命周期管理
- **Redis 运维**：主从复制/哨兵模式/Cluster 模式/内存优化/持久化（RDB/AOF）/慢查询监控/大 Key 治理
- **监控系统集成**：Prometheus + Grafana + AlertManager 全链路监控


> [📄 4_ES集群与ELK.md](./mybook/devops/基础设施/4_ES集群与ELK.md) · [📄 5_监控系统集成.md](./mybook/devops/基础设施/5_监控系统集成.md)
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


> [📄 4_ES集群与ELK.md](./mybook/devops/基础设施/4_ES集群与ELK.md)
</details>

<details>
<summary>虚拟化</summary>

- **Hyper-V**：Windows 虚拟化平台；嵌套虚拟化 / LVM 扩容 / fdisk 分区管理 / Checkpoint
- **Vagrant**：开发环境自动化；Vagrantfile 配置 / 多机编排 / Provider（VirtualBox/Libvirt/Hyper-V）/ Provision 脚本
- **KSV 虚拟化**：基于 KVM 的轻量虚拟化管理平台


> [📄 2_虚拟化.md](./mybook/devops/基础设施/2_虚拟化.md) · [📄 hyper-v.md](./mybook/devops/hyper-v.md) · [📄 vagrant.md](./mybook/devops/vagrant.md)
</details>

<details>
<summary>网络</summary>

- **OVS（Open vSwitch）**：生产级虚拟交换机，支持 OpenFlow/NetFlow/sFlow
- **OVN**：OVS 集中式控制器；逻辑交换机（L2）/逻辑路由器（L3）/L2-L4 ACL/多种隧道封装（Geneve/STT/VXLAN）/Kube-OVN
- **ovs-dpdk**：OVS + DPDK 用户态网络，绕过内核协议栈，极低延迟；编译 DPDK/大页内存配置/VFIO 设备绑定
- **负载均衡**：四层（LVS/NAT/DR/TUN）/七层（Nginx Ingress Controller/HAProxy）；健康检查/会话保持/权重分配


> [📄 1_网络.md](./mybook/devops/基础设施/1_网络.md) · [📄 ovs-ovn.md](./mybook/devops/ovs-ovn.md)
</details>

<details>
<summary>LVS（Linux Virtual Server）</summary>

- **三种模式**：NAT（请求响应都经 Director）/DR（Direct Routing，响应直接返回）/TUN（IP 隧道封装，跨网段）
- **IPVS 配置**：ipvsadm 命令（创建虚拟服务/添加 RS/查看规则/统计）
- **调度算法**：rr/wrr/lc/wlc（推荐）/sh/dh/lblc/sed
- **LVS + Keepalived 高可用**：Keepalived 管理 IPVS 规则/健康检查/主备切换


> [📄 6_LVS.md](./mybook/devops/基础设施/6_LVS.md)
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


> [📄 7_HAProxy.md](./mybook/devops/基础设施/7_HAProxy.md)
</details>

<details>
<summary>Nginx（负载均衡与反向代理）</summary>

- **反向代理**：proxy_pass/proxy_set_header/proxy_buffering/proxy_connect_timeout
- **负载均衡**：upstream/权重/backup/max_fails/fail_timeout/keepalive
- **负载均衡算法**：轮询（默认）/least_conn/ip_hash/hash
- **性能调优**：worker_processes/worker_connections/sendfile/tcp_nopush/gzip/open_file_cache
- **安全配置**：SSL/TLS/限流（limit_req）/安全头部（X-Frame-Options/HSTS）
- **平滑升级**：kill -USR2/kill -WINCH/回滚


> [📄 8_Nginx反向代理与负载均衡.md](./mybook/devops/基础设施/8_Nginx反向代理与负载均衡.md)
</details>

<details>
<summary>Keepalived</summary>

- **VRRP 协议**：虚拟路由冗余协议/Master-Backup 选举/VIP 漂移
- **配置**：global_defs/vrrp_instance/vrrp_script/virtual_ipaddress
- **健康检查脚本**：track_script/weight/fall/rise
- **与 LVS 集成**：virtual_server/real_server/TCP_CHECK
- **与 HAProxy/Nginx 集成**：vrrp_script 检测进程状态/自动故障切换
- **架构选型对比**：LVS（四层极高并发）vs HAProxy（四七层混合）vs Nginx（七层 HTTP 代理）


> [📄 9_Keepalived.md](./mybook/devops/基础设施/9_Keepalived.md)
</details>

<details>
<summary>KubeSphere</summary>

- K3s 集群上安装 KubeSphere


> [📄 k3s集群上安装kubesphere.md](./mybook/devops/k3s集群上安装kubesphere.md)
</details>

<details>
<summary>OpenStack</summary>

- 二次开发环境搭建


> [📄 openstack二次开发.md](./mybook/devops/openstack二次开发.md)
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


> [📄 智能体框架.md](./mybook/agents/智能体框架.md) · [📄 AutoGen.md](./mybook/agents/AutoGen.md) · [📄 CrewAI.md](./mybook/agents/CrewAI.md) · [📄 LangGraph.md](./mybook/agents/LangGraph.md)
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
- **实施建议**：
  - 从 `/init` 或 `harness-creator` 生成初始版本
  - Bad Case 驱动迭代：每遇到一个 AI bad case，就补一条规则
  - 团队共建：全局规则放 AGENTS.md，模块细节放对应 docs/
  - 文件目标读者标注：README.md（人）、AGENTS.md（AI为主）、docs/*.md（AI为主，人可参考）


> [📄 AI-Coding实践.md](./mybook/agents/AI-Coding实践.md)
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


> [📄 大模型.md](./mybook/other/大模型.md)
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


> [📄 提高研发效能.md](./mybook/other/提高研发效能.md)
</details>

#### 杂项

<details>
<summary>大厂技术文章</summary>

- 美团技术团队：高可用/分布式/中间件/架构设计
- 京东技术：供应链/物流/推荐/高并发
- 携程技术：微服务/APM/移动端/国际化
- 百度技术：搜索/AI/自动驾驶/大规模计算
- B站技术：装机系统实践/全链路Trace追踪


> [📄 大厂技术文章.md](./mybook/other/大厂技术文章.md)
</details>

<details>
<summary>Shell编程风格</summary>

- 错误信息 / 注释 / 格式化
- $() 替代反引号 / [[ ]] 替代 [ ] / 避免 eval
- 命令约定与调用


> [📄 shell编程风格.md](./mybook/other/杂项/shell编程风格.md)
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


> [📄 shell编程风格.md](./mybook/other/杂项/shell编程风格.md) · [📄 构建deb包.md](./mybook/devops/构建deb包.md) · [📄 zipapp打包应用.md](./mybook/python/1_语言基础/zipapp打包应用.md)
</details>
