
# Agents（智能体）与 Sessions（会话）

## 1. Agents 模块

Agents 模块（src/agents/）是 OpenClaw 处理 AI 对话、工具调用、会话管理的核心。

### 1.1 核心功能

- 会话管理（Session Management）
- 上下文窗口管理（Context Window）
- 工具调用（Tool Calling）
- 技能加载与运行（Skills）
- 模型选择与调用（Model Selection）
- 记忆系统（Memory）
- 沙箱环境（Sandbox）

## 2. Context Window 管理

OpenClaw 有复杂的 ContextWindow 管理机制，用于管理对话上下文的 token 数，防止超过模型限制。src/agents/context.ts:

### 2.1 特性
 - 缓存模型的 context window
 - 配置支持配置的覆盖
 - 发现模型的元数据
 - 上下文压缩

```typescript
// src/agents/context.ts
// 核心函数
export function resolveContextTokensForModel(...) { ... }
export function lookupContextTokens(...) { ... }
```

## 3. 代理命令

代理命令是通过 `agentCommand`，在 src/commands/agent.ts：

- 发送消息
- 工具调用
- 会话管理
- 回复分发

## 4. 会话（Session）

OpenClaw 的会话是存储在 SessionStore 里，通过 SessionKey（会话密钥）标识。
