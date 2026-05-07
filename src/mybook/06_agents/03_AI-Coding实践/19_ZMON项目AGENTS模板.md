# AGENTS.md - ZMON 项目 AI 协作指南

ZMON 是基于 Go + gRPC + SQLite + Layui 的 Server-Agent 架构服务器监控系统。

---

## 构建命令

```bash
make build              # 构建 Server + Agent (当前平台)
make build-server       # 仅 Server (需要 CGO)
make build-agent        # 仅 Agent (CGO_ENABLED=0)
make build-all          # Server + 所有平台 Agent
make test               # 运行测试 (带 race 检测)
make lint               # golangci-lint
make fmt                # 格式化
make run                # 运行 Server
```

Server 环境变量: `ZMON_HOST`, `ZMON_PORT`, `ZMON_GRPC_PORT`, `ZMON_DATA_DIR`, `ZMON_JWT_SECRET`, `ZMON_NAT_ENABLED`
Agent: `-server` (gRPC 地址), `-secret` (认证密钥), `-c` (配置文件), 或环境变量 `ZMON_SERVER`, `ZMON_SECRET`
测试机器: macmini `ssh m4` (macOS ARM64), 树莓派 `ssh pi` (Linux ARM64)

---

## 项目结构

```
cmd/
├── server/main.go          # Server 入口
└── agent/main.go           # Agent 入口 (Cobra CLI)
internal/
├── api/                     # HTTP 层: dto/ handler/ middleware/ router/
├── bootstrap/container.go  # DI 容器
├── checker/                # 监控检查器 (HTTP/TCP/ICMP/DNS)
├── config/                 # Viper 配置 (环境变量 ZMON_*)
├── cron/                   # 定时任务调度
├── event/bus.go            # 异步事件总线
├── model/                  # GORM 数据模型 + InitDB
├── module/                 # 业务模块 (agent/alert/monitor)
├── nat/                    # NAT 穿透 (TCP/UDP 隧道 + HTTP 代理)
├── notification/           # 通知发送 (Telegram/Email/Webhook/钉钉/企微)
├── repository/             # 数据访问层 (interfaces.go + *_repo.go)
├── service/                # 业务逻辑层 (interfaces.go + *_service.go)
├── scheduler/              # 监控任务调度 (分配器 + 本地执行器)
├── storage/                # 监控结果异步批量持久化
└── ws/                     # gRPC Agent 管理 + WebSocket (Dashboard/Terminal)
pkg/
├── collector/              # 系统指标采集 (gopsutil/v3)
├── logger/                 # 结构化日志 (slog + lumberjack)
├── reporter/               # Agent 端上报引擎 (gRPC + 命令安全 + 文件操作 + 监控执行)
└── tunnel/                 # Agent 端 NAT 隧道客户端
proto/                      # gRPC 协议 (agent.proto)
web/                        # 前端 (go:embed 嵌入, Layui + ECharts + xterm.js)
```

---

## 架构规则

**Handler → Service → Repository**，禁止跨层调用。所有依赖通过 DI 容器注入。**禁止直接使用 `model.DB`**，必须通过 Repository 接口访问数据。

### 数据流

```
Agent → gRPC 双向流 → handleAgentMessage()
                            ↓
                   ┌────────┼────────┐
                   ↓        ↓        ↓
              handleMetric  handleSystemInfo  handleTerminalOutput
                   ↓
              LatestMetric + MetricHistory (100条/30s 批量写入)
                   ↓
              DashboardHub (WebSocket 推送)

Scheduler → Checker (HTTP/TCP/ICMP/DNS) → ResultStorage (异步批量) → Alert Engine
```

### 事件驱动

模块间通过 Event Bus 解耦，优先使用事件发布/订阅而非直接调用。已定义事件类型：
- Agent: `connected`, `disconnected`, `registered`, `deleted`
- Monitor: `started`, `stopped`, `completed`, `failed`
- Alert: `triggered`, `resolved`, `silenced`
- Metric: `received`, `updated`

---

## 编码规范

**Go**: 接口先行（先 `interfaces.go` 再实现）| 错误用 `AppError` | 依赖通过 Container 注入 | 禁止 `init()` goroutine | mutex 保护共享状态 | `pkg/logger/` 日志 | 接口以 `Repository`/`Service` 结尾

**前端**: Layui | `api.js` 封装请求 | `websocket.js` | 默认转义防 XSS | 页面卸载清理 interval/WebSocket/ECharts

---

## 新增功能工作流

### 添加新 API 端点

1. `internal/api/dto/` — 创建请求/响应 DTO
2. `internal/repository/interfaces.go` — 定义 Repository 接口方法
3. `internal/repository/` — 实现 Repository
4. `internal/service/interfaces.go` — 定义 Service 接口方法
5. `internal/service/` — 实现 Service（薄层逻辑）
6. `internal/api/handler/` — 创建 Handler
7. `internal/api/router/router.go` — 注册路由
8. `internal/bootstrap/container.go` — 注册新依赖

### 添加新监控检查器

1. `internal/checker/` — 实现 `Checker` 接口（`Type()`, `Check()`, `Validate()`）
2. `internal/checker/registry.go` — 注册新检查器
3. `internal/api/validator/monitor_validator.go` — 添加输入校验
4. `proto/agent.proto` — 如需新配置字段，更新 `MonitorTaskData` 并重新生成
5. `pkg/reporter/checker.go` — Agent 端实现对应检查逻辑

---

## 修改注意事项

| 修改内容 | 注意事项 |
|----------|----------|
| Repository 接口 | 同步更新 `interfaces.go` 和实现文件，在 Container 中注册 |
| Proto 定义 | 重新生成 pb 文件，Server 和 Agent 都要兼容 |
| Model | GORM AutoMigrate 自动加列，删列需手动迁移 |
| 前端 | 无需构建步骤（go:embed），但需重新编译 Server |
| 定时清理 | 在 `internal/cleanup/service.go` 中注册新清理规则 |
| 通知渠道 | 在 `internal/notification/sender.go` 中实现发送逻辑 |
| Prometheus 指标 | 在 `pkg/metrics/metrics.go` 中定义 |
| Agent 侧功能 | 在 `pkg/reporter/reporter.go` 的消息分发 switch 中添加新 case |
