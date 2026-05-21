
# 配置管理与 CLI

## 1. Config 配置系统

OpenClaw 的配置系统非常强大，支持 JSON5 格式，支持验证、默认值、和修改等，位于 src/config/。

### 1.1 配置路径

OpenClaw 配置通常存储在 `~/.openclaw/openclaw.json`

### 1.2 核心功能

- 配置验证（src/config/validation.ts）
- 配置加载与保存（src/config/io.ts）
- 配置修改（src/config/mutate.ts）
- 配置路径管理（src/config/paths.ts）

### 1.3 主要函数

```typescript
// 从 src/config/config.ts re-export
import { ... } from "./io.js";
import { ... } from "./mutate.js";
```

## 2. CLI（命令行界面）

OpenClaw 的 CLI 是与用户交互的主要方式，通过 Commander 实现，位于 src/cli/：

- src/cli/program/build-program.ts
- src/commands/*.ts

### 2.1 主要命令

| Command | Description |
|---|---|
| gateway | Gateway服务 |
| agent | 代理交互 |
| config | 配置管理 |
| models | 模型管理 |
| channels | 渠道管理 |
| secrets | 密钥管理 |
| sessions | 会话管理 |
| onboarding | 引导 |
| skills | 技能管理 |
| webhooks |  |
| install | 安装守护进程 |

### 2.2 CLI 架构设计

- Commander-based CLI，使用子命令

## 3. 主要模块总结

| Module | Location |
|
|---|---|
| Config | src/config |
| CLI | src/cli |
| Commands | src/commands/ |
