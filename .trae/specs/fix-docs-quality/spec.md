# 文档质量完善 Spec

## Why

mybook 中的文档与 ALL.md 索引不同步，需要系统性修正。

## What Changes

* 修正 ALL.md 中残留的知识错误（"Go 1.26 新特性" 未标注状态）
* 清理重复文件（nuclei.md 重复、架构设计.md 重复）
* 最小化补充 mybook 目录中缺失但 ALL.md 已索引的关键知识点

## Already Done (手动修改已完成)

以下问题已通过手动修改解决，无需再处理：

* ✅ Go 数据类型描述已补充完整（complex64/complex128、uint 系列等）
* ✅ Go 语言 "Pythonic" 误用已修正
* ✅ 章节编号冲突已修正（7.3 架构设计 / 7.4 DevOps & 基础设施 / 7.5 智能体开发 / 7.6 其它）
* ✅ mybook ALL.md 已同步为 onlinenote ALL.md 的完整版本
* ✅ onlinenote ALL.md 与 mybook ALL.md 内容完全一致
* ✅ Go 常用标准库部分已同步（fmt/time/strconv/flag/文件操作/template/json/reflect/context/singleflight/日志/Viper/validator/sqlx/Cobra/Swagger/Air/GORM/Redis/MongoDB/Kafka/NSQ/RabbitMQ/OpenTelemetry/Jaeger/Prometheus/优雅关机）
* ✅ DevOps 部分已同步（iptables/Firewalld/DenyHosts/Linux性能优化/Linux网络工具/Shell编程/LVS/HAProxy/Nginx/Keepalived/ELK Stack/K8s核心组件/K8s持久化存储/Prometheus监控K8s/API设计/自动化运维）
* ✅ 安全部分已同步（Web安全/安全工具与方法/云与容器安全 子章节分组）
* ✅ 智能体开发部分已同步（框架/AI Coding实践）

## Impact

* Affected code: `src/mybook/ALL.md`、`onlinenote/ALL.md`、`src/mybook/` 下各文档文件
* Affected specs: 文档索引体系

## ADDED Requirements

### Requirement: 残留知识错误修正

系统 SHALL 修正文档中残留的知识错误。

#### Scenario: "Go 1.26 新特性" 未标注状态

* **WHEN** mybook ALL.md 垃圾回收部分提到 "Go 1.26 新特性" 但未标注其发布状态
* **THEN** 应标注为 "Go 1.26 新特性（已发布）" 或根据实际情况调整描述

### Requirement: 重复文件清理

系统 SHALL 清理 mybook 目录中的重复文件。

#### Scenario: Nuclei 重复文件

* **WHEN** security/2\_安全工具与方法/ 下存在 nuclei.md 和 3\_Nuclei.md
* **THEN** 应合并为一个文件，删除重复（保留带编号前缀的 3\_Nuclei.md）

#### Scenario: 架构设计重复文件

* **WHEN** architecture/ 下存在 架构设计.md 和 1\_架构设计.md
* **THEN** 应检查内容差异，合并或删除重复（保留带编号前缀的 1\_架构设计.md）

### Requirement: 最小化补充缺失知识点

系统 SHALL 最小化补充 mybook 目录中缺失但 ALL.md 已索引的关键知识点文档。

#### Scenario: 补充原则

* **WHEN** ALL.md 中索引了某个知识点但 mybook 目录中没有对应文档
* **THEN** 仅补充 ALL.md 中有详细描述（非仅一行提及）的知识点，跳过仅简单列举的主题

## MODIFIED Requirements

### Requirement: 文档格式统一

mybook 中的文档 SHALL 遵循统一的格式规范：

* 文件命名：采用 `数字前缀_中文名.md` 格式
* 文件头部：使用标准 Markdown 格式，不使用 HTML 注释作为元数据
* 分隔符：统一使用 `---`
* 代码块：标注正确的语言类型
