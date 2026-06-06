
# 核心架构与 Gateway 服务

## 1. 系统架构概览

OpenClaw 的核心是一个本地 AI 网关，分为以下几个主要部分：

- **Gateway 网关**（src/gateway/）：HTTP/WebSocket 服务器，提供 API、控制界面、渠道集成
- **Agents 智能体**（src/agents/）：AI 对话管理，会话管理、工具调用、技能加载
- **CLI 命令行工具**（src/cli/）：用于配置、启动、管理服务
- **Channels 渠道**（src/channels/）：各种 IM 渠道（Telegram/Discord/Slack 等的适配
- **Config 配置**（src/config/）：配置管理、验证、路径管理
- **Hooks 钩子**（src/hooks/）：扩展钩子系统
- **Cron 定时任务**（src/cron/）：定时执行任务

## 2. Gateway 服务

### 2.1 Gateway 核心功能

- HTTP API、WebSocket、控制界面、渠道连接、会话管理

```
┌─────────────────────────────────────────────────────┐
│              OpenClaw Gateway                      │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │      HTTP Server (server.impl.ts     │   │
│  │  (REST API, Control UI, MCP Proxy  │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │    WebSocket Server (events.ts, net.ts)    │   │
│  │  (Device Pairing, Live Chat    │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Channel Listeners (channels/)          │   │
│  │  (Telegram/Discord/Slack/etc │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Agents Runtime (agents/)              │   │
│  │  (Agent, Sessions, Skills, Tools │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 2.2 启动流程 (boot.ts)

Gateway 启动流程主要在 src/gateway/server.impl.ts，src/gateway/boot.ts 中有一个特殊的启动流程，它会检查 workspace 里的 BOOT.md 文件并执行引导任务。

```typescript
// src/gateway/boot.ts
async function runBootOnce(params: { ... }) { ... }
```

### 2.3 Gateway Server 主要特性

| 特性 | 说明 |
|------|------|
| HTTP Server | 提供控制界面和 API |
| WebSocket | 实时通信（设备配对、实时聊天） |
| Model API | LLM 调用抽象层 |
| MCP | Model Context Protocol 代理 |
| Cron Jobs | 定时任务管理 |
| Device Pairing | 设备配对 |

## 3. 核心入口分析

### 3.1 启动入口 (src/entry.ts)

这是 CLI 的主入口，负责：
1. 版本检查和编译缓存
2. 环境变量初始化
3. CLI 参数解析
4. 启动 runCli

```typescript
// src/entry.ts
async function runMainOrRootHelp(argv: string[]) { ... }
```

## 4. 插件 SDK (src/plugin-sdk/)

OpenClaw 使用基于 plugin-sdk 提供强大的扩展能力，包括渠道、提供者、工具等。
