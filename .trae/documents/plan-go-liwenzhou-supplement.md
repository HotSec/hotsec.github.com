# 计划：总结《Go语言之路》补充缺失内容到 ALL.md 与 mybook

## 一、差距分析

通过对比李文周《Go语言之路》（书籍+博客）的内容体系与 mybook 现有 Go 目录，识别出以下缺失内容：

### 1. 语言基础缺失（高优先级）

| 缺失内容 | 说明 | 归属文件 |
|----------|------|----------|
| 变量与常量详解 | 标识符/关键字/变量声明(var/:=)/常量/iota枚举 | `1_语言基础/3_语句.md` 扩展或新建 |
| 基本数据类型详解 | 整型(int8~int64)/浮点型/复数/布尔值/字符串/byte与rune/类型转换 | `2_核心概念/2_数据类型.md` 扩展 |
| 运算符 | 算术/关系/逻辑/位/赋值运算符 | `1_语言基础/3_语句.md` 扩展 |
| 数组详解 | 定义/初始化/遍历/多维数组/值类型特性 | `2_核心概念/2_数据类型.md` 扩展 |
| 切片详解 | 定义/长度容量/切片表达式/make/本质/比较/遍历/append/copy/删除元素 | `2_核心概念/2_数据类型.md` 扩展 |
| 映射详解 | 定义/基本使用/判断键/遍历/delete/有序遍历/元素为map的切片 | `2_核心概念/2_数据类型.md` 扩展 |
| 指针详解 | 指针地址/指针类型/指针取值/指针传值 | `2_核心概念/13_make与new.md` 扩展 |
| 结构体详解 | 自定义类型/类型别名/实例化/初始化/内存布局/构造函数/匿名字段/嵌套/JSON序列化/Tag | `1_语言基础/5_方法.md` 或新建 |
| 包详解 | 包定义/标识可见性/包引入/init函数/匿名引入 | `1_语言基础/11_包-模块-库.md` 扩展 |
| 递归 | 递归函数/思考题(分金币) | `1_语言基础/4_函数.md` 扩展 |
| 内置函数 | panic/recover/close/delete/len/cap/append/copy/new/make | `1_语言基础/4_函数.md` 扩展 |

### 2. 标准库缺失（高优先级）

| 缺失内容 | 说明 | 归属文件 |
|----------|------|----------|
| fmt格式化 | Printf占位符/格式化输出 | 新建 `6_常用标准库/12_fmt.md` |
| time时间包 | 时间格式化/时间获取/定时器/Ticker/Duration | 新建 `6_常用标准库/13_time.md` |
| strconv字符串转换 | Atoi/Itoa/Parse/Format系列 | 新建 `6_常用标准库/14_strconv.md` |
| flag命令行参数 | 命令行参数解析/子命令 | 新建 `6_常用标准库/15_flag.md` |
| 文件操作(os/io) | 文件读写/目录操作/临时文件/io/ioutil | 新建 `6_常用标准库/16_文件操作.md` |
| html/template | 模板渲染/自定义函数/嵌套模板 | 新建 `6_常用标准库/17_template.md` |
| encoding/json详解 | Marshal/Unmarshal/自定义JSON/流式编解码/JSON技巧 | 新建 `6_常用标准库/18_json.md` |
| reflect反射 | 类型反射/值反射/结构体字段遍历/应用场景 | 新建 `6_常用标准库/19_reflect.md` |
| context详解 | 设计理念/取消信号/超时控制/值传递/最佳实践 | 新建 `6_常用标准库/20_context.md` |
| net/http详解 | Server端/Client端/路由/中间件/文件服务 | 扩展 `6_常用标准库/5_http标准库.md` |

### 3. 第三方库/工具缺失（中优先级）

| 缺失内容 | 说明 | 归属文件 |
|----------|------|----------|
| Viper配置管理 | 配置读取/多格式/环境变量/热更新 | 新建 `6_常用标准库/21_viper.md` |
| Zap日志库详解 | 结构化日志/配置/日志归档/Gin集成 | 扩展 `6_常用标准库/1_log.md` |
| validator校验 | 参数校验/自定义验证器/实用技巧 | 新建 `6_常用标准库/22_validator.md` |
| sqlx数据库操作 | 连接/查询/批量插入/事务 | 新建 `6_常用标准库/23_sqlx.md` |
| Air热重载 | 开发时自动编译运行 | 新建 `6_常用标准库/24_air.md` |
| Swagger接口文档 | swag安装/注解/生成文档 | 新建 `6_常用标准库/25_swagger.md` |
| Makefile | Go项目Makefile编写 | 扩展 `11_工具与调试/0_常用工具.md` |
| Cobra CLI开发 | 命令行应用开发/子命令/标志 | 新建 `6_常用标准库/26_cobra.md` |
| singleflight | 防缓存击穿/合并并发请求 | 新建 `6_常用标准库/27_singleflight.md` |

### 4. 数据库操作缺失（中优先级）

| 缺失内容 | 说明 | 归属文件 |
|----------|------|----------|
| Go操作MySQL | database/sql/驱动/GORM CRUD/连接池/预处理/事务 | 扩展 `6_常用标准库/3_gorm.md` |
| Go操作Redis | go-redis/连接/5大类型/Lua脚本/分布式锁/Pipeline | 新建 `6_常用标准库/28_redis.md` |
| Go操作MongoDB | mongo-driver/CRUD/聚合管道 | 新建 `6_常用标准库/29_mongodb.md` |
| Go操作Kafka | kafka-go/生产者/消费者/ConsumerGroup | 新建 `6_常用标准库/30_kafka.md` |
| Go操作NSQ | NSQ消息队列/生产者/消费者 | 新建 `6_常用标准库/31_nsq.md` |
| Go操作RabbitMQ | amqp/工作队列/发布订阅/路由/RPC | 新建 `6_常用标准库/32_rabbitmq.md` |

### 5. Web开发实战缺失（中优先级）

| 缺失内容 | 说明 | 归属文件 |
|----------|------|----------|
| Cookie和Session | Cookie设置/Session管理/Redis Session | 扩展 `7_常用框架/2_gin.md` |
| JWT认证详解 | JWT原理/签名/验证/刷新Token | 扩展 `7_常用框架/2_gin.md` |
| 优雅关机/重启 | signal.Notify/Shutdown/Graceful | 新建 `6_常用标准库/33_优雅关机.md` |
| Docker部署Go应用 | Dockerfile/多阶段构建/docker-compose | 扩展 `11_工具与调试/0_常用工具.md` |
| 部署Go项目N种方法 | 二进制/Systemd/Docker/K8s | 新建 `11_工具与调试/3_部署.md` |
| Gin路由拆分与注册 | 路由分组/多文件注册 | 扩展 `7_常用框架/2_gin.md` |

### 6. 微服务与可观测性缺失（低优先级）

| 缺失内容 | 说明 | 归属文件 |
|----------|------|----------|
| Go kit微服务 | 基础示例/代码分层/中间件/gRPC/服务发现 | 新建 `7_常用框架/8_go-kit.md` |
| Protocol Buffers | 语法指南/oneof/FieldMask/选项 | 扩展 `7_常用框架/3_grpc.md` |
| 服务注册与发现 | Consul/注册/发现/健康检查 | 新建 `7_常用框架/9_consul.md` |
| Apollo配置中心 | 安装/配置/Go客户端 | 新建 `6_常用标准库/34_apollo.md` |
| OpenTelemetry | 概念/Go SDK/HTTP链路追踪/gRPC追踪 | 新建 `6_常用标准库/35_opentelemetry.md` |
| Jaeger | 安装/Go集成/采样 | 新建 `6_常用标准库/36_jaeger.md` |
| Prometheus Go | client_golang/指标类型/自定义指标 | 新建 `6_常用标准库/37_prometheus.md` |

### 7. 设计模式与最佳实践缺失（低优先级）

| 缺失内容 | 说明 | 归属文件 |
|----------|------|----------|
| 函数选项模式 | Functional Options Pattern | 新建 `1_语言基础/16_设计模式.md` |
| 单例模式 | sync.Once实现 | 新建 `1_语言基础/16_设计模式.md` |
| 单测从零到溜 | mock接口/monkey打桩/goconvey/MySQL和Redis测试 | 扩展 `1_语言基础/12_测试.md` |
| conc并发库 | 更友好的并发API/errgroup增强 | 新建 `3_并发编程/16_conc.md` |
| GORM Gen | 类型安全ORM/代码生成 | 扩展 `6_常用标准库/3_gorm.md` |
| 游标分页 | 基于游标的分页实现 | 新建 `6_常用标准库/38_游标分页.md` |

## 二、实施步骤

### 步骤1：扩展语言基础（高优先级）
1.1 扩展 `2_核心概念/2_数据类型.md` — 补充整型/浮点型/复数/布尔值/字符串/byte与rune/类型转换/数组/切片详解/映射详解
1.2 扩展 `1_语言基础/3_语句.md` — 补充运算符/变量与常量详解
1.3 扩展 `1_语言基础/4_函数.md` — 补充递归/内置函数/高阶函数/匿名函数与闭包/defer详解
1.4 扩展 `2_核心概念/13_make与new.md` — 补充指针详解(指针地址/指针类型/指针取值/指针传值)
1.5 扩展 `1_语言基础/5_方法.md` — 补充结构体详解(自定义类型/类型别名/实例化/初始化/内存布局/构造函数/匿名字段/嵌套/JSON序列化/Tag)
1.6 扩展 `1_语言基础/11_包-模块-库.md` — 补充包定义/标识可见性/包引入/init函数/匿名引入

### 步骤2：新建标准库文件（高优先级）
2.1 新建 `6_常用标准库/12_fmt.md` — fmt格式化输出/占位符
2.2 新建 `6_常用标准库/13_time.md` — time包/时间格式化/定时器
2.3 新建 `6_常用标准库/14_strconv.md` — 字符串与基本类型转换
2.4 新建 `6_常用标准库/15_flag.md` — 命令行参数解析
2.5 新建 `6_常用标准库/16_文件操作.md` — os/io文件读写
2.6 新建 `6_常用标准库/17_template.md` — html/template模板
2.7 新建 `6_常用标准库/18_json.md` — encoding/json详解
2.8 新建 `6_常用标准库/19_reflect.md` — reflect反射
2.9 新建 `6_常用标准库/20_context.md` — context详解
2.10 扩展 `6_常用标准库/5_http标准库.md` — 补充Server端路由/中间件/文件服务

### 步骤3：新建第三方库文件（中优先级）
3.1 新建 `6_常用标准库/21_viper.md` — Viper配置管理
3.2 扩展 `6_常用标准库/1_log.md` — 补充Zap日志库详解
3.3 新建 `6_常用标准库/22_validator.md` — validator参数校验
3.4 新建 `6_常用标准库/23_sqlx.md` — sqlx数据库操作
3.5 新建 `6_常用标准库/24_air.md` — Air热重载
3.6 新建 `6_常用标准库/25_swagger.md` — Swagger接口文档
3.7 新建 `6_常用标准库/26_cobra.md` — Cobra CLI开发
3.8 新建 `6_常用标准库/27_singleflight.md` — singleflight防击穿

### 步骤4：新建数据库操作文件（中优先级）
4.1 扩展 `6_常用标准库/3_gorm.md` — 补充GORM完整CRUD/模型定义/关联/事务/Gen
4.2 新建 `6_常用标准库/28_redis.md` — Go操作Redis
4.3 新建 `6_常用标准库/29_mongodb.md` — Go操作MongoDB
4.4 新建 `6_常用标准库/30_kafka.md` — Go操作Kafka
4.5 新建 `6_常用标准库/31_nsq.md` — Go操作NSQ
4.6 新建 `6_常用标准库/32_rabbitmq.md` — Go操作RabbitMQ

### 步骤5：补充Web开发实战（中优先级）
5.1 扩展 `7_常用框架/2_gin.md` — 补充Cookie&Session/JWT认证/路由拆分
5.2 新建 `6_常用标准库/33_优雅关机.md` — 优雅关机/重启
5.3 扩展 `11_工具与调试/0_常用工具.md` — 补充Docker部署/Makefile
5.4 新建 `11_工具与调试/3_部署.md` — 部署Go项目N种方法

### 步骤6：补充微服务与可观测性（低优先级）
6.1 新建 `7_常用框架/8_go-kit.md` — Go kit微服务
6.2 新建 `7_常用框架/9_consul.md` — 服务注册与发现
6.3 新建 `6_常用标准库/35_opentelemetry.md` — OpenTelemetry链路追踪
6.4 新建 `6_常用标准库/36_jaeger.md` — Jaeger
6.5 新建 `6_常用标准库/37_prometheus.md` — Prometheus Go客户端

### 步骤7：补充设计模式与最佳实践（低优先级）
7.1 新建 `1_语言基础/16_设计模式.md` — 函数选项模式/单例模式
7.2 扩展 `1_语言基础/12_测试.md` — 补充mock/monkey/goconvey
7.3 新建 `3_并发编程/16_conc.md` — conc并发库

### 步骤8：更新 ALL.md
在 ALL.md 的 Go 部分补充所有新增知识点条目：
- 1.1 语言基础 → 补充变量常量/运算符/数组/切片/映射/指针/结构体/包详解条目
- 1.6 常用标准库 → 补充fmt/time/strconv/flag/文件操作/template/json/reflect/context条目
- 1.6 常用标准库 → 补充Viper/Zap/validator/sqlx/Air/Swagger/Cobra/singleflight条目
- 1.6 常用标准库 → 补充GORM/Redis/MongoDB/Kafka/NSQ/RabbitMQ条目
- 1.7 常用框架 → 补充Go kit/Consul条目
- 1.6 常用标准库 → 补充OpenTelemetry/Jaeger/Prometheus条目
- 1.11 工具 & 调试 → 补充部署条目
- 1.1 语言基础 → 补充设计模式条目

## 三、文件操作清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 扩展 | `go/2_核心概念/2_数据类型.md` | +整型/浮点型/复数/布尔值/字符串/byte与rune/类型转换/数组/切片/映射 |
| 扩展 | `go/1_语言基础/3_语句.md` | +运算符/变量与常量 |
| 扩展 | `go/1_语言基础/4_函数.md` | +递归/内置函数/高阶函数/闭包/defer |
| 扩展 | `go/2_核心概念/13_make与new.md` | +指针详解 |
| 扩展 | `go/1_语言基础/5_方法.md` | +结构体详解 |
| 扩展 | `go/1_语言基础/11_包-模块-库.md` | +包定义/可见性/init/匿名引入 |
| 新建 | `go/6_常用标准库/12_fmt.md` | fmt格式化 |
| 新建 | `go/6_常用标准库/13_time.md` | time包 |
| 新建 | `go/6_常用标准库/14_strconv.md` | strconv |
| 新建 | `go/6_常用标准库/15_flag.md` | flag |
| 新建 | `go/6_常用标准库/16_文件操作.md` | os/io |
| 新建 | `go/6_常用标准库/17_template.md` | template |
| 新建 | `go/6_常用标准库/18_json.md` | json |
| 新建 | `go/6_常用标准库/19_reflect.md` | reflect |
| 新建 | `go/6_常用标准库/20_context.md` | context |
| 扩展 | `go/6_常用标准库/5_http标准库.md` | +路由/中间件/文件服务 |
| 新建 | `go/6_常用标准库/21_viper.md` | Viper |
| 扩展 | `go/6_常用标准库/1_log.md` | +Zap详解 |
| 新建 | `go/6_常用标准库/22_validator.md` | validator |
| 新建 | `go/6_常用标准库/23_sqlx.md` | sqlx |
| 新建 | `go/6_常用标准库/24_air.md` | Air |
| 新建 | `go/6_常用标准库/25_swagger.md` | Swagger |
| 新建 | `go/6_常用标准库/26_cobra.md` | Cobra |
| 新建 | `go/6_常用标准库/27_singleflight.md` | singleflight |
| 扩展 | `go/6_常用标准库/3_gorm.md` | +GORM完整CRUD/Gen |
| 新建 | `go/6_常用标准库/28_redis.md` | Redis |
| 新建 | `go/6_常用标准库/29_mongodb.md` | MongoDB |
| 新建 | `go/6_常用标准库/30_kafka.md` | Kafka |
| 新建 | `go/6_常用标准库/31_nsq.md` | NSQ |
| 新建 | `go/6_常用标准库/32_rabbitmq.md` | RabbitMQ |
| 扩展 | `go/7_常用框架/2_gin.md` | +Cookie&Session/JWT/路由拆分 |
| 新建 | `go/6_常用标准库/33_优雅关机.md` | 优雅关机 |
| 扩展 | `go/11_工具与调试/0_常用工具.md` | +Docker部署/Makefile |
| 新建 | `go/11_工具与调试/3_部署.md` | 部署N种方法 |
| 新建 | `go/7_常用框架/8_go-kit.md` | Go kit |
| 新建 | `go/7_常用框架/9_consul.md` | Consul |
| 新建 | `go/6_常用标准库/35_opentelemetry.md` | OpenTelemetry |
| 新建 | `go/6_常用标准库/36_jaeger.md` | Jaeger |
| 新建 | `go/6_常用标准库/37_prometheus.md` | Prometheus Go |
| 新建 | `go/1_语言基础/16_设计模式.md` | 函数选项/单例 |
| 扩展 | `go/1_语言基础/12_测试.md` | +mock/monkey/goconvey |
| 新建 | `go/3_并发编程/16_conc.md` | conc并发库 |
| 更新 | `ALL.md` | 补充所有新知识点条目 |

## 四、执行优先级

1. **步骤1**（语言基础扩展）— 核心基础，必须先完成
2. **步骤2**（标准库新建）— 标准库是日常开发必备
3. **步骤3**（第三方库）— 工程化必备
4. **步骤4**（数据库操作）— 后端开发核心
5. **步骤5**（Web实战）— 实战补充
6. **步骤6**（微服务可观测性）— 进阶内容
7. **步骤7**（设计模式最佳实践）— 进阶内容
8. **步骤8**（更新ALL.md）— 最后统一更新
