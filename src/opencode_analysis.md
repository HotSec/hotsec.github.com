
# OpenCode 源码分析

## 目录
1. [项目概述](#项目概述)
2. [架构设计](#架构设计)
3. [上下文管理系统](#上下文管理系统)
4. [核心模块](#核心模块)
5. [代码风格与规范](#代码风格与规范)

---

## 项目概述

**OpenCode** 是一个开源的 AI 编程助手，采用 TypeScript + Bun 技术栈开发，提供 CLI、桌面应用和 Web 应用三种使用方式。

### 主要特性
- 支持多种 LLM 提供商（OpenAI、Anthropic、Google、Azure 等）
- 内置多个专用智能代理 (Agent)
- 丰富的工具集（文件操作、搜索、终端、LSP 等）
- MCP (Model Context Protocol) 支持
- 插件系统

### 技术栈
| 技术 | 用途 |
|------|------|
| TypeScript | 主要开发语言 |
| Bun | JavaScript 运行时 |
| Effect | 函数式效果系统 |
| SolidJS | UI 框架 |
| Drizzle ORM | 数据库 ORM |

---

## 架构设计

项目采用 monorepo 结构，主要包位于 `packages/` 目录：

```
packages/
├── opencode/        # 核心 CLI 和 TUI 实现
├── app/             # Web 应用
├── console/         # 控制台应用
├── desktop/         # 桌面应用
├── llm/             # LLM 集成层
├── core/            # 核心工具和服务
├── ui/              # UI 组件库
├── plugin/          # 插件系统
└── sdk/             # SDK
```

---

## 上下文管理系统

OpenCode 的上下文管理是其核心设计之一，主要通过以下几个模块实现：

### 1. InstanceState - 按目录实例状态管理

**文件**: [packages/opencode/src/effect/instance-state.ts](file:///Volumes/SN740/code/notebook/third/opencode/packages/opencode/src/effect/instance-state.ts)

`InstanceState` 是一个按目录（工作区）隔离的状态管理器，使用 `ScopedCache` 实现：

```typescript
export interface InstanceState&lt;A, E = never, R = never&gt; {
  readonly [TypeId]: typeof TypeId
  readonly cache: ScopedCache.ScopedCache&lt;string, A, E, R&gt;
}
```

**核心功能**:
- 每个工作区目录有独立的状态实例
- 使用目录路径作为缓存键
- 自动清理（通过 `registerDisposer`）
- 支持资源作用域（Scope）

**主要方法**:
| 方法 | 描述 |
|------|------|
| `make(init)` | 创建新的实例状态 |
| `get(self)` | 获取当前目录的状态 |
| `use(self, select)` | 选择并使用状态的一部分 |
| `useEffect(self, select)` | 选择并执行状态的 Effect |
| `invalidate(self)` | 失效当前目录的缓存 |

**使用示例**（来自 [Agent 系统](file:///Volumes/SN740/code/notebook/third/opencode/packages/opencode/src/agent/agent.ts#L89-L366)）:

```typescript
const state = yield* InstanceState.make&lt;State&gt;(
  Effect.fn("Agent.state")(function* (ctx) {
    // 初始化逻辑...
    return { get, list, defaultInfo, defaultAgent }
  }),
)

// 使用状态
return Service.of({
  get: Effect.fn("Agent.get")(function* (agent: string) {
    return yield* InstanceState.useEffect(state, (s) =&gt; s.get(agent))
  }),
  // ...
})
```

### 2. InstanceContext - 实例上下文

**文件**: [packages/opencode/src/project/instance-context.ts](file:///Volumes/SN740/code/notebook/third/opencode/packages/opencode/src/project/instance-context.ts)

定义了实例的基本上下文信息：

```typescript
export interface InstanceContext {
  directory: string    // 工作目录
  worktree: string     // Git 工作树（如果是 Git 项目）
  project: Project.Info
}
```

**核心功能**:
- `containsPath()` - 检查路径是否在项目边界内
- 使用 `LocalContext` 进行上下文传播

### 3. EffectBridge - Effect 与回调桥接

**文件**: [packages/opencode/src/effect/bridge.ts](file:///Volumes/SN740/code/notebook/third/opencode/packages/opencode/src/effect/bridge.ts)

解决 Effect 代码与外部回调（如 `node-pty`、`@parcel/watcher` 等）之间的上下文传递问题：

```typescript
export interface Shape {
  readonly promise: &lt;A, E, R&gt;(effect: Effect.Effect&lt;A, E, R&gt;) =&gt; Promise&lt;A&gt;
  readonly fork: &lt;A, E, R&gt;(effect: Effect.Effect&lt;A, E, R&gt;) =&gt; Fiber.Fiber&lt;A, E&gt;
  readonly run: &lt;A, E, R&gt;(effect: Effect.Effect&lt;A, E, R&gt;) =&gt; Effect.Effect&lt;A, E&gt;
  readonly bind: &lt;Args extends readonly unknown[], Result&gt;(fn: (...args: Args) =&gt; Result) =&gt; (...args: Args) =&gt; Result
}
```

**核心机制**:
- 捕获当前 Fiber 中的 `InstanceRef` 和 `WorkspaceRef`
- 在回调执行时恢复工作区上下文
- 提供 `bind()` 方法包装普通函数，保持上下文

**关键实现**:

```typescript
function captureSync() {
  const fiber = Fiber.getCurrent()
  const instance = fiber ? Context.getReferenceUnsafe(fiber.context, InstanceRef) : undefined
  const workspace =
    (fiber ? Context.getReferenceUnsafe(fiber.context, WorkspaceRef) : undefined) ?? WorkspaceContext.workspaceID
  return { instance, workspace }
}

export const bind = &lt;Args extends readonly unknown[], Result&gt;(fn: (...args: Args) =&gt; Result) =&gt; {
  const captured = captureSync()
  return (...args: Args) =&gt;
    restoreWorkspace(captured.workspace, () =&gt;
      Effect.runSync(
        attachWith(
          Effect.sync(() =&gt; fn(...args)),
          captured,
        ),
      ),
    )
}
```

### 4. WorkspaceContext - 工作区上下文

**文件**: [packages/opencode/src/control-plane/workspace-context.ts](file:///Volumes/SN740/code/notebook/third/opencode/packages/opencode/src/control-plane/workspace-context.ts)

使用 AsyncLocalStorage 实现的全局工作区上下文管理。

### 5. 上下文管理流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户请求 / 事件                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    初始化 InstanceContext                       │
│  - directory: 工作目录                                           │
│  - worktree: Git 工作树                                          │
│  - project: 项目信息                                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              InstanceState.make(init) 创建状态                   │
│  - 以目录为键的 ScopedCache                                       │
│  - 自动注册清理函数                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Service 1    │   │  Service 2    │   │  Service 3    │
│ (Agent)       │   │ (Tool)        │   │ (Pty)         │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  外部回调（如 watcher） │
              │  使用 EffectBridge.bind │
              └─────────────────────────┘
```

---

## 核心模块

### 1. Agent 系统

**文件**: [packages/opencode/src/agent/agent.ts](file:///Volumes/SN740/code/notebook/third/opencode/packages/opencode/src/agent/agent.ts)

内置多个预配置的 Agent：

| Agent | 用途 | 特点 |
|-------|------|------|
| **build** | 默认代理 | 完全访问权限 |
| **plan** | 规划模式 | 禁止编辑操作 |
| **general** | 通用代理 | 处理复杂任务 |
| **explore** | 代码探索 | 快速搜索和分析 |
| **scout** | 文档研究 | 克隆和分析依赖库 |

每个 Agent 都有独立的权限配置和自定义 Prompt。

### 2. 工具系统

**目录**: [packages/opencode/src/tool/](file:///Volumes/SN740/code/notebook/third/opencode/packages/opencode/src/tool/)

提供丰富的工具集：
- `read`、`write`、`edit` - 文件操作
- `grep`、`glob` - 搜索
- `shell` - 终端执行
- `lsp` - 语言服务器协议
- `websearch`、`webfetch` - Web 工具
- `task`、`todo` - 任务管理

### 3. 权限系统

精细的权限控制，支持：
- 全局权限规则
- 按工具粒度控制
- 按文件路径控制
- `allow`/`ask`/`deny` 三种权限级别

---

## 代码风格与规范

**参考文件**: [AGENTS.md](file:///Volumes/SN740/code/notebook/third/opencode/AGENTS.md)

### 一般原则
- 保持函数简洁，避免过早抽象
- 使用 `Effect.gen` 进行组合
- 避免 `try/catch`，使用 Effect 的错误处理
- 使用 Bun APIs 而非 Node.js APIs（如 `Bun.file()`）
- 依赖类型推断，避免显式类型注解

### 变量与控制流
- 优先 `const` 而非 `let`
- 使用三元运算符或提前返回而非重新赋值
- 避免 `else` 语句
- 避免不必要的解构

### 模块组织
不使用 `export namespace`，使用自导出模式：

```typescript
// src/foo/foo.ts
export interface Interface { ... }
export class Service extends Context.Service&lt;Service, Interface&gt;()("@opencode/Foo") {}
export const layer = Layer.effect(Service, ...)

export * as Foo from "./foo"
```

### Effect 规则
- 使用 `Effect.fn("Domain.method")` 命名和追踪
- 使用 `Schema.TaggedErrorClass` 定义错误
- 使用 `makeRuntime` 管理服务生命周期
- 使用 `InstanceState` 管理按目录的状态
- 优先使用 Effect 服务而非直接使用平台 API

---

## 总结

OpenCode 是一个设计精良的开源 AI 编程助手，其上下文管理系统是其核心亮点：

1. **按工作区隔离** - 使用 `InstanceState` 和目录作为键
2. **Effect 驱动** - 统一使用 Effect 进行副作用管理
3. **上下文桥接** - `EffectBridge` 解决与外部回调的上下文传递
4. **类型安全** - 完整的 TypeScript 类型系统
5. **模块化设计** - 清晰的模块边界和依赖关系

这种设计使得 OpenCode 能够同时处理多个工作区，保持状态隔离，并提供强大的扩展能力。
