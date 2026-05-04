# K3S 源码笔记 - Server 流程

## Server 启动流程

```
main() → server.Run() → 启动 API Server → 启动 Controller Manager → 启动 Scheduler
```

### 关键步骤

1. **初始化配置**：解析命令行参数、加载配置文件
2. **创建数据存储**：默认使用 SQLite（可配置 etcd/MySQL/PostgreSQL）
3. **启动 API Server**：基于 kube-apiserver，注册 CRD
4. **启动 Controller Manager**：管理节点、Pod、Service 等资源
5. **启动 Scheduler**：Pod 调度
6. **Tunnel Server**：Agent 与 Server 的通信隧道

### 核心数据结构

```go
type Server struct {
    Control    *config.Control
    Config     *config.Config
    Tunnel     *tunnel.Tunnel
    StartHooks []StartHook
}
```

### 关键文件

| 文件 | 职责 |
|------|------|
| `pkg/cli/server/server.go` | Server 入口 |
| `pkg/server/server.go` | Server 核心逻辑 |
| `pkg/daemons/control/server.go` | 控制平面组件 |
| `pkg/daemons/executor/embed.go` | 嵌入式 etcd |
