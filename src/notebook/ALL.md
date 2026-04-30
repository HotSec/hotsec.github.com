# 知识点总结

---

## 一、Go

### 1.1 语言基础

<details>
<summary>数据类型</summary>

- 基本类型：int, float, string, bool, byte, rune
- 复合类型：array, slice, map, struct, pointer, channel, interface
- 类型转换（强制显式转换）

</details>

<details>
<summary>变量声明与控制结构</summary>

- var / := 短变量声明
- if / for / switch / select
- defer / panic / recover

</details>

<details>
<summary>函数与方法</summary>

- 多返回值、命名返回值、可变参数
- 闭包
- 方法接收者选择（值接收者 vs 指针接收者）

</details>

<details>
<summary>接口</summary>

- 隐式实现
- 类型断言与 type switch
- 空接口 interface{}
- nil 接口陷阱

</details>

<details>
<summary>包-模块-库</summary>

- go mod 包管理
- 常用命令：go mod init/tidy/download/vendor

</details>

<details>
<summary>测试</summary>

- 单元测试（go test）
- 性能/基准测试（Benchmark）
- 模糊测试（Fuzzing）
- 集成测试

</details>

<details>
<summary>项目结构与代码风格</summary>

- gofmt 格式化
- 标识符命名规范（驼峰、导出规则）
- 推荐项目目录结构

</details>

<details>
<summary>错误处理</summary>

- error 接口
- panic & recover
- errors.Is / errors.As / fmt.Errorf + %w

</details>

<details>
<summary>泛型</summary>

- 泛型函数与泛型类型
- 类型约束（interface 约束）
- 与反射的区别与适用场景

</details>

### 1.2 核心概念

<details>
<summary>Slice vs Array</summary>

- Array：固定长度，值类型
- Slice：动态长度，引用类型（ptr + len + cap）
- append 扩容机制

</details>

<details>
<summary>Map</summary>

- 底层实现（哈希表）
- 并发不安全 → sync.Map 或加锁

</details>

<details>
<summary>指针 & make vs new</summary>

- & / * 操作，Go 指针不能运算
- new：分配零值返回指针
- make：只用于 slice/map/chan，返回初始化后的引用

</details>

### 1.3 并发编程（重点）

<details>
<summary>GMP 调度模型</summary>

- G（Goroutine）M（Machine/OS线程）P（Processor/逻辑处理器）
- P 的价值：限制并发数、本地队列减少锁竞争
- m0（主线程）g0（调度 goroutine）
- M 寻找 G 的流程

</details>

<details>
<summary>Goroutine & Channel</summary>

- Goroutine 轻量线程（~2KB 栈）
- Channel：无缓冲/有缓冲，方向（只读/只写/双向）
- select 多路复用
- 关闭 channel 注意点（只有发送方关闭；用 WaitGroup 或 Context 协调）

</details>

<details>
<summary>sync 包</summary>

- Mutex / RWMutex / WaitGroup / Once
- sync.Map / Cond / Pool

</details>

<details>
<summary>Context</summary>

- 作用：超时控制、取消传播、值传递
- Background / WithCancel / WithTimeout / WithDeadline / WithValue
- 原理与最佳实践

</details>

<details>
<summary>并发编程模式</summary>

- 生产者-消费者模式
- Worker Pool（工作池）
- 扇出/扇入模式
- Pipeline 模式
- 发布订阅模型
- 三个协程按顺序打印

</details>

<details>
<summary>协程池</summary>

- 手动实现协程池
- ants 等第三方库

</details>

<details>
<summary>限流与熔断</summary>

- 限流算法（令牌桶、漏桶）
- golang.org/x/time/rate
- 熔断器模式

</details>

<details>
<summary>并发安全退出</summary>

- Context 取消 / Channel 通知 / errgroup 错误处理

</details>

### 1.4 内存管理（重点）

<details>
<summary>内存模型与分配</summary>

- Go 内存模型（happens-before）
- 对象分配流程（微小对象 → mcache → mcentral → mheap）

</details>

<details>
<summary>逃逸分析</summary>

- 逃逸原因（返回指针、接口、闭包、大对象）
- 检测方法：go build -gcflags="-m"
- 如何避免逃逸

</details>

<details>
<summary>垃圾回收（GC）</summary>

- 三色并发标记算法
- 混合写屏障（Hybrid Write Barrier）— 1.8+ 默认
- 触发时机（内存翻倍 / 定时 / 手动 runtime.GC()）
- Go 1.19+ 分代扫描（实验性）/ Go 1.26 新特性
- GC 优化策略

</details>

<details>
<summary>混合写屏障详解</summary>

- 演进：Dijkstra 插入屏障 → Yuasa 删除屏障 → 混合写屏障
- 4 条规则（栈上不开启写屏障）
- = 插入屏障 + 删除屏障
- 三色不变式

</details>

### 1.5 常见陷阱

<details>
<summary>高频陷阱</summary>

- for range 陷阱（循环变量复用）
- 短变量声明作用域
- nil 接口 ≠ nil 具体类型
- slice 为 nil 与 empty 混淆
- slice append 副作用（共享底层数组）
- slice 和内存泄漏
- Map 遍历顺序不确定
- 循环中 defer
- 字符串拼接低效
- 方法接收者为 nil
- time / encoding/json / net/http 常见误用

</details>

### 1.6 常用标准库

<details>
<summary>标准库速查</summary>

- net/http | encoding/json | io/bufio/os | time
- sync/sync/atomic | context | fmt/strings/strconv
- reflect | unsafe | log | flag

</details>

### 1.7 常用框架

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

</details>

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

</details>

<details>
<summary>Zinx / Etcd</summary>

- **Zinx**：轻量 TCP 并发服务器框架
- **Etcd**：分布式 KV / 分布式锁 / WAL / BoltDB / 高可用集群

</details>

### 1.8 Web接口性能优化

<details>
<summary>编码层面</summary>

- strings.Builder / bytes.Buffer 拼接
- 切片/Map 预分配容量
- 减少内存分配，避免逃逸到堆

</details>

<details>
<summary>并发 & 数据库 & 缓存</summary>

- errgroup 并发 / Worker Pool
- 连接池配置 / 批量操作 / 查询优化
- 多级缓存（本地 + Redis）/ singleflight 防击穿

</details>

<details>
<summary>HTTP & JSON & 监控</summary>

- Server 参数调优 / Keep-Alive / gzip 压缩
- json-iterator / 流式处理大 JSON
- pprof（CPU/Mem/Goroutine/Block）/ 火焰图 / go test -bench / Prometheus

</details>

### 1.9 安全专题

<details>
<summary>SBOM</summary>

- 标准格式：SPDX / CycloneDX
- 生成工具：Syft / Trivy
- 各语言生成 / CI/CD 集成 / 漏洞扫描（Grype / Trivy）

</details>

<details>
<summary>国密算法与证书</summary>

- SM2（非对称） / SM3（哈希） / SM4（对称）
- 国密证书格式与 TLS 握手流程 / GM/T 标准体系
- 实战：生成国密证书、SM4 加解密

</details>

### 1.10 开源项目

<details>
<summary>项目列表</summary>

- Gin-vue-admin / Gin-api
- Packetbeat（流量捕获与流程）
- K3s（源码分析：编译/运行/build/server/agent/核心依赖）
- K8s（Pod/Node/Service/Deployment/CNI/CSI/CRI/Scheduling Framework）
- KSV 虚拟化 / Memos 笔记

</details>

### 1.11 工具 & 调试

<details>
<summary>常用工具</summary>

- go build / fmt / vet / test / doc / generate / embed / race
- golangci-lint / gomvpkg / Docker 多阶段构建

</details>

### 1.12 分布式基础

<details>
<summary>分布式理论 & 网络模型</summary>

- ACID / CAP / BASE / Paxos / Raft
- BIO / NIO / IO多路复用 / Go netpoller

</details>

---

## 二、C/C++

### 2.1 C语言教程

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

</details>

<details>
<summary>标准库</summary>

- **stdlib.h**：abs/div、字符串→数值、rand/srand、malloc/free、qsort/bsearch、atexit/system/getenv
- **stdio.h**：标准I/O、文件操作、fflush/setvbuf/perror
- **string.h**：strchr/strstr/strtok/memchr/memset/memcmp
- **time.h**：struct tm、time/ctime/localtime/asctime/strftime
- **math.h**：三角函数/指数/对数/fmod/round/ceil/floor
- **ctype.h / wchar.h / wctype.h / stdint.h / stddef.h / stdbool.h / stdarg.h**

</details>

### 2.2 C++专题

<details>
<summary>基础语法</summary>

- 类与对象：构造/析构、初始化列表、this指针、const/static修饰、友元、运算符重载
- 继承、多态（虚函数/纯虚函数/编译期多态/运行时多态）
- 委托构造、命名空间、异常处理
- 类型转换：static_cast/dynamic_cast/const_cast/reinterpret_cast

</details>

<details>
<summary>内存管理</summary>

- RAII（资源获取即初始化）
- 智能指针：unique_ptr / shared_ptr / weak_ptr
- 移动语义：左值/右值、右值引用、移动构造/移动赋值、std::move / std::forward
- 虚拟内存：分页/分段/VMA/内存映射

</details>

<details>
<summary>模板</summary>

- 函数模板 / 类模板
- 模板特化 / 全特化 / 偏特化
- 可变参数模板 / 模板元编程

</details>

<details>
<summary>现代C++特性</summary>

- constexpr 常量表达式
- 函数式编程：functor / lambda / 泛型lambda / bind / function
- Concepts 模板约束（C++20）
- Ranges（C++20）：Views / Adaptors / Projection
- Coroutines 协程（C++20）

</details>

<details>
<summary>并发编程</summary>

- 线程管理（std::thread）
- 同步：mutex / condition_variable / rwlock / barrier / latch
- 原子操作 atomic + 内存模型
- Futures & Promises
- 线程池 / 并行算法 / 无锁数据结构
- 多线程调试

</details>

<details>
<summary>STL</summary>

- 容器：vector / list / deque / set / map / unordered_map
- 算法：sort / find / transform / accumulate

</details>

<details>
<summary>开发环境与工具</summary>

- CMake + vcpkg
- 编译器（GCC / Clang / MSVC）
- 构建系统 / 调试（GDB / LLDB / Valgrind）
- 代码分析（Clang-Tidy / Cppcheck）
- 包管理（vcpkg / Conan）
- 单元测试：Google Test / Catch2

</details>

<details>
<summary>常用库</summary>

- Qt（信号槽、事件处理）
- OpenCV / OpenSSL / nlohmann/json / gRPC
- 日志库：log4cpp
- 编码与本地化

</details>

<details>
<summary>汇编 & 调用约定</summary>

- 内联汇编 / 常见指令
- 调用约定：cdecl / stdcall / fastcall
- 函数名修饰规则

</details>

---

## 三、Python

### 3.1 语言基础

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

</details>

<details>
<summary>Python风格指南</summary>

- 导入规则、装饰器慎用、避免过度强大的特性
- __future__ 导入

</details>

### 3.2 Python工匠（最佳实践）

<details>
<summary>善用变量</summary>

- 命名要有描述性、能猜出类型
- 避免 globals()/locals()
- 控制单个函数变量数量
- 合理使用 namedtuple/dict 返回多个值

</details>

<details>
<summary>数值与字符串技巧</summary>

- 少写数字字面量、别在裸字符串上走太远
- 字符串拼接不慢、超长字符串可读性改善

</details>

<details>
<summary>精通容器类型</summary>

- 写更快的代码（底层视角）/ 写扩展性更好的代码（高层视角）
- next() 函数、元组改善分支、有序字典去重
- 当心枯竭的迭代器

</details>

<details>
<summary>循环编写技巧</summary>

- enumerate / product 扁平化 / islice 隔行 / takewhile 替代 break
- 生成器解耦循环体

</details>

<details>
<summary>函数返回值技巧</summary>

- 不返回多种类型 / partial 构造新函数
- 抛出异常而非返回结果+错误
- Null Object 模式 / 生成器替代返回列表 / 限制递归

</details>

<details>
<summary>异常处理三个习惯</summary>

- 只做最精确的异常捕获 / 别破坏抽象一致性 / 异常处理不喧宾夺主

</details>

<details>
<summary>装饰器技巧</summary>

- 用类实现 / wrapt 模块 / functools.wraps() / nonlocal

</details>

<details>
<summary>SOLID 原则</summary>

- S：单一职责 → 拆大类/用函数
- O：开闭原则 → 继承/组合/IoC/数据驱动
- L：里氏替换 → 不当继承的修正
- I：接口隔离 → 接口拆分
- D：依赖倒置 → 抽象注入、单元测试

</details>

<details>
<summary>Edge Cases 思维</summary>

- EAFP（获取原谅比许可简单）
- defaultdict / setdefault / dict.pop
- "or" 操作符陷阱 / 数据校验不要手动做

</details>

<details>
<summary>If-else 分支思维</summary>

- 避免多层嵌套 / 封装复杂逻辑 / 留意分支重复代码
- 德摩根定律 / all()/any() / 自定义布尔
- None 值比较陷阱 / and/or 优先级

</details>

<details>
<summary>路径与文件操作</summary>

- pathlib 替代 os.path
- 流式读取大文件（read分块 + 生成器）
- 设计接受文件对象的函数

</details>

<details>
<summary>循环导入的故事</summary>

- 环形依赖问题的实际案例与解决方案

</details>

### 3.3 Python版本演进

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

</details>

### 3.4 标准库

<details>
<summary>核心模块</summary>

- Mapping / 内置函数与常量 / 内置异常（异常链/异常组/层次结构）
- 内置类型 / 文本处理 / 文件和目录访问
- functools（partial/reduce/cache/wraps）

</details>

<details>
<summary>垃圾回收</summary>

- 引用计数（主）+ 标记清除（循环引用）+ 分代回收
- 环状双向链表 refchain / 池化技术（int/small string）

</details>

<details>
<summary>并发执行</summary>

- multiprocessing + shared_memory
- concurrent.futures / queue / sched / contextvars

</details>

<details>
<summary>网络和进程间通信</summary>

- asyncio：协程/Task/同步原语/子进程/Queue/超时/取消
- socket / ssl / select / selectors / signal / mmap

</details>

### 3.5 常用库

<details>
<summary>核心</summary>

- Pydantic（数据校验）/ SQLAlchemy（ORM）
- Celery（分布式任务队列）/ Huey（轻量任务队列）

</details>

<details>
<summary>网络/爬虫</summary>

- Playwright（浏览器自动化）/ Scrapy / Feapder

</details>

<details>
<summary>协程 & 性能</summary>

- Gevent：greenlet / 猴子补丁 / 事件/池/锁/信号量/Subprocess/Actors
- uvloop（asyncio 高性能替代）

</details>

<details>
<summary>安全 & 包管理</summary>

- pyarmor 代码保护
- poetry 依赖管理 / uv 快速包管理

</details>

### 3.6 Web开发

<details>
<summary>Django</summary>

- MTV 架构 / Django REST Framework（DRF）
- Django-Vue3-Admin

</details>

<details>
<summary>Flask</summary>

- 蓝图与模块化 / Flask-SQLAlchemy / Flask-RESTful / flask-restx
- 认证：JWT / API Key / Basic Auth
- 限流（Flask-Limiter）/ 熔断器 / 异步任务（Celery）
- 实时通信：SSE / WebSocket
- Gunicorn / Docker / Nginx 部署

</details>

<details>
<summary>FastAPI / Tornado / Bottle / Quart / Sanic</summary>

- FastAPI：异步 + 自动 OpenAPI + Pydantic
- Tornado：路由/模板/自定义session
- Bottle：轻量（路由/请求/响应/模板/SQLite）

</details>

<details>
<summary>微服务</summary>

- 服务发现 / 负载均衡 / 网关 / 日志集中 / Jaeger 分布式追踪 / 容错 / CI/CD

</details>

<details>
<summary>反爬与安全</summary>

- User-Agent / IP限制 / Session限制 / Spider Trap / 验证码
- 数据动态加载 / 加密 / 非可视区域遮挡

</details>

### 3.7 第三方库

<details>
<summary>数据库驱动</summary>

- PyMySQL（核心原理：SQL执行流程、MySQL行存储格式）
- Redis（数据类型 + 主从/哨兵/集群 + 分布式锁）
- MongoDB（对比MySQL/Redis/ES + 副本集选举 + 事务 + GridFS）

</details>

<details>
<summary>消息队列 & 搜索</summary>

- RabbitMQ：生产者-消费者 / 发布订阅 / 路由 / 模糊匹配
- Elasticsearch：倒排索引 / 插入速度优化

</details>

<details>
<summary>LLM & AI</summary>

- LangChain / LiteLLM / 大模型开发流程
- Python AI 绘画 / Jupyter Notebook

</details>

<details>
<summary>自动化 & 部署</summary>

- Ansible / Fabric / Terraform（IaC）
- Playwright：同步/异步/反检测/截图/定位器
- Flask-PluginKit（插件式开发）

</details>

### 3.8 高并发设计

<details>
<summary>基础架构</summary>

- 单机房 → 主备 → 同城双活 → 异地多活（两地三中心）
- DNS / LVS / 服务发现 / RPC / LSM Tree

</details>

<details>
<summary>高可用</summary>

- 衡量指标
- 重试 / 熔断 / 隔离 / 降级

</details>

<details>
<summary>高并发</summary>

- 横向扩展 / CDN
- 接口优化：批量/异步/缓存/预取/池化/回调/串行改并行/锁粒度/索引/深分页
- 微服务拆分 / 分库分表 / 主从分离 / 消息队列 / ES
- 50wQPS 未读数系统设计
- 高并发读：读写分离 / 本地缓存 / 分布式缓存 / CQRS
- 高并发写：分库分表 / 异步写与写聚合 / Kafka多Partition

</details>

<details>
<summary>分库分表</summary>

- 水平/垂直分库分表
- 分表键选择 / 分表策略（range/hash/一致性hash）
- 跨节点Join / 聚合函数 / 分页问题（全局视野法/禁止跳页/二次查询）
- 分布式ID（Snowflake / 美团Leaf）

</details>

<details>
<summary>唯一ID</summary>

- 分布式唯一ID方案
- 美团Leaf（segment + snowflake）

</details>

<details>
<summary>缓存</summary>

- 缓存穿透/击穿/雪崩
- 多级缓存架构

</details>

<details>
<summary>可观测性</summary>

- Prometheus / Grafana / Jaeger / OpenTelemetry / ELK Stack

</details>

<details>
<summary>海量推送系统</summary>

- 设计要点

</details>

<details>
<summary>用户登录服务</summary>

- 账号 / 密码保护 / 手机号邮箱登录 / 第三方登录 / 登录态管理 / 扫码登录

</details>

<details>
<summary>微服务</summary>

- gin+grpc / 微服务框架选型

</details>

### 3.9 面试题

<details>
<summary>Python面试题</summary>

- 语言特性 / 设计模式（创建型/结构型/行为型）
- 网络编程 / WSGI与Web框架 / MVC / ORM
- 内置数据结构和算法
- Web安全（SQL注入等）
- 前后端分离 / TCP三次握手四次挥手 / TIME_WAIT / CLOSE_WAIT
- 系统设计

</details>

---

## 四、Lua

### 4.1 语言基础

<details>
<summary>数据类型与变量</summary>

- nil / boolean / number / string / function / table / thread / userdata
- 变量作用域与解释器

</details>

<details>
<summary>函数</summary>

- 定义与调用 / 函数变量 / 可变参数 / 闭包

</details>

<details>
<summary>面向对象 & 环境</summary>

- 类与对象（基于 table + metatable）
- _G 全局环境表

</details>

<details>
<summary>协程</summary>

- Lua coroutine：create / resume / yield / wrap

</details>

<details>
<summary>标准库</summary>

- base / package / string / table / math / io / os / debug

</details>

### 4.2 高级主题

<details>
<summary>LuaJIT & FFI</summary>

- LuaJIT 性能优势
- LuaFFI：直接调用C函数

</details>

<details>
<summary>OpenResty</summary>

- 安装（Fedora / Ubuntu）
- Hello World

</details>

<details>
<summary>Lua与C++</summary>

- Lua C API 交互

</details>

<details>
<summary>LuaGo</summary>

- lua chunk 文件格式

</details>

<details>
<summary>生态</summary>

- LuaFileSystem
- Lua Nginx WAF / OpenStar

</details>

---

## 五、Web（前端）

<details>
<summary>Tailwind CSS</summary>

- 原子化 CSS 框架介绍

</details>

<details>
<summary>Vite</summary>

- 新一代前端构建工具

</details>

<details>
<summary>Vuepress</summary>

- 快速入门 / 部署到 GitHub Pages
- Markdown 配置与扩展 / 页面配置 / 组件 / 加密 / 布局

</details>

<details>
<summary>VSCode插件开发</summary>

- 开发环境搭建 / 开发计划

</details>

<details>
<summary>Markdown</summary>

- Markdown 介绍 / 配置 / 扩展（VuePress / 主题 / 图片增强）

</details>

---

## 六、安全

<details>
<summary>Nuclei</summary>

- 下载编译 / 使用帮助 / 集成到自己的项目

</details>

<details>
<summary>容器内信息收集</summary>

- 基础系统信息 / 磁盘及挂载 / 特权容器判断
- Capabilities / NetNamespace / 本地敏感文件
- 集群信息：命名空间 / Service Account / Master IP / 内网探测
- 判断是否为容器环境

</details>

<details>
<summary>常见认证方式</summary>

- API Key / Basic Auth / JWT / OAuth2 / SSO

</details>

<details>
<summary>漏扫爬虫</summary>

- 爬取 → 构造请求 → 解析响应 → 判断漏洞 → 生成报告

</details>

<details>
<summary>逻辑漏洞</summary>

- 认证流程：登录 / 找回密码 / 注册
- 业务流程：支付 / 其它

</details>

---

## 七、通用基础

### 7.1 数据结构与算法

<details>
<summary>数据结构</summary>

- 数组 / 链表 / 列表 / 栈 / 队列 / 双向队列
- 哈希表 / 哈希冲突 / 哈希算法
- 二叉树 / 二叉搜索树 / AVL树 / 堆 / Top-K
- 图（邻接矩阵/邻接表/遍历）

</details>

<details>
<summary>算法设计</summary>

- 迭代与递归 / 分治 / 回溯
- 动态规划（0-1背包 / 完全背包 / 编辑距离 / 最长公共子序列）
- 贪心算法（分数背包 / 最大容量 / 最大乘积切割）
- 二分查找 / 搜索算法

</details>

<details>
<summary>排序算法</summary>

- 冒泡 / 插入 / 选择 / 快速 / 归并 / 堆排序
- 桶排序 / 计数排序 / 基数排序
- 算法总览（时间/空间/稳定性对比）

</details>

<details>
<summary>复杂度分析</summary>

- 时间复杂度 / 空间复杂度 / 性能评估
- 最差/最佳/平均时间复杂度

</details>

<details>
<summary>基础理论</summary>

- 数字编码（原码/反码/补码/浮点数）
- 字符编码（ASCII / GBK / Unicode / UTF-8）
- 内存与缓存

</details>

<details>
<summary>算法题分类（BM系列）</summary>

- 链表篇（14题）/ 二叉树篇（15题）/ 搜索与回溯篇（8题）
- 动态规划篇（11+题）/ 堆栈与队列篇（9题）
- 哈希与双指针篇 / 排序篇 / 字符串篇 / 位运算篇 / 二分查找篇
- 设计数据结构（LRU / LFU）
- 面试高频 TOP10 与知识要点

</details>

### 7.2 架构设计

<details>
<summary>系统架构</summary>

- 软件过程模型（瀑布/原型/螺旋/敏捷/RUP）
- CMM / CMMI
- 需求工程 / 结构化方法（SASD）/ 面向对象方法
- 软件架构风格 / 架构复用 / DSSA

</details>

<details>
<summary>数据库</summary>

- 关系数据库 / 数据库设计 / NoSQL / 分布式数据库
- 数据库优化 / Redis 分布式缓存

</details>

<details>
<summary>信息系统架构</summary>

- 面向服务架构（SOA）/ ESB / EDB
- 层次式架构 / 物联网架构
- 大型网站系统架构实例

</details>

<details>
<summary>未来技术</summary>

- 机器人 / 边缘计算 / AI / 数字孪生 / 云计算与大数据

</details>

<details>
<summary>安全基础</summary>

- 访问控制与数字签名 / 信息安全保障体系与评估

</details>

### 7.3 DevOps & 基础设施

<details>
<summary>Docker Swarm</summary>

- 集群部署 / 节点管理 / 服务部署与扩缩容
- 存储卷挂载 / 可视化面板 / 容器网络

</details>

<details>
<summary>ES集群 / Redis / 监控</summary>

- ES 集群部署
- Redis 运维
- 监控系统集成

</details>

<details>
<summary>虚拟化</summary>

- Hyper-V：嵌套虚拟化 / LVM扩容 / fdisk使用
- Vagrant：安装 / 创建虚拟机 / Vagrantfile
- KSV 虚拟化

</details>

<details>
<summary>网络</summary>

- OVS / OVN / ovs-dpdk
- DPDK 编译 / 大页内存 / VFIO
- 负载均衡（Nginx-Controller）

</details>

<details>
<summary>KubeSphere</summary>

- K3s 集群上安装 KubeSphere

</details>

<details>
<summary>OpenStack</summary>

- 二次开发环境搭建

</details>

### 7.4 智能体开发

<details>
<summary>框架</summary>

- AutoGen / DeepAgents / CrewAI / QwenAgent

</details>

### 7.5 其它

<details>
<summary>大模型</summary>

- 生态 / 开发流程 / 提示词

</details>

<details>
<summary>提高研发效能</summary>

- 工具链 / 流程优化

</details>

<details>
<summary>大厂技术文章</summary>

- 美团 / JD / 携程 / 百度

</details>

<details>
<summary>Shell编程风格</summary>

- 错误信息 / 注释 / 格式化
- $() 替代反引号 / [[ ]] 替代 [ ] / 避免 eval
- 命令约定与调用

</details>

<details>
<summary>杂项</summary>

- 构建deb包
- VSCode配置（markdown粘贴文件目录）
- zipapp打包应用
- 临时记录（爬虫/反爬/worker/代理/动态规则引擎/猴子补丁）
