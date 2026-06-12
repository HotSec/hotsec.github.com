# PiAgent（earendil-works/pi）零件化全栈 Agent 工具链

## 一、项目概览

### 1.1 基本信息

| 指标 | 数值 |
|------|------|
| **GitHub** | [earendil-works/pi](https://github.com/earendil-works/pi)（原 badlogic/pi-mono） |
| **Stars** | **57k+**，历史增长最快的开源 Agent 工具链之一 |
| **主语言** | TypeScript（93.5%） |
| **包数量** | 7 个核心包 |
| **最新版本** | v0.77.0（2026-05-28） |
| **Releases** | 224 个，快速迭代中 |
| **贡献者** | 210 人 |
| **License** | MIT |

### 1.2 核心理念

> **"Tools for building AI agents and managing LLM deployments."**

Pi 与 LangChain/CrewAI/AutoGen 的本质区别在于**定位不同**：

| 类型 | 代表项目 | 特点 |
|------|---------|------|
| **框架** | LangChain、CrewAI、AutoGen | 一整套抽象，在框架内开发，隐藏实现细节 |
| **工具箱** | **Pi（pi）** | 零件化设计，每个包独立可用，用多少拿多少，层层透明可查 |

> 💡 **设计哲学**：不是框架，是工具箱。每一个包都可以独立使用，也可以自由组合。这让它与"框架化方案"走上了完全不同的工程路线。

---

## 二、七大核心包详解

```
packages/
├── pi-ai          # 统一 LLM API（OpenAI/Anthropic/Google/Groq 等）
├── pi-agent-core  # Agent 运行时核心（tool calling 状态机 / Session / Message History）
├── pi-coding-agent # 基于上述两个包构建的完整 CLI（开箱即用）
├── pi-mom         # 消息总线 / 中间件
├── pi-tui         # 独立终端 UI 库
├── pi-web-ui      # 独立 Web 组件库
└── pi-pods        # 扩展 / 插件系统
```

### 2.1 pi-ai — 统一 LLM API

**解决的问题**：切换 LLM 提供商时，上层代码零改动。

```typescript
import { createAI } from '@mariozechner/pi-ai';

const ai = createAI({
  provider: 'anthropic',  // 可切换为 'openai' / 'google' / 'groq' 等
  model: 'claude-sonnet-4-20250514',
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 统一接口，不因提供商而异
const response = await ai.complete({
  messages: [{ role: 'user', content: 'Hello' }],
});
```

**支持的提供商**：OpenAI / Anthropic / Google / Groq / Ollama 等。

**设计原则**：定义独立的抽象层，不跟随任何一个提供商的接口约定。覆盖最高频用途（chat completion、function calling），高级特性通过 `provider-specific options` 暴露。

### 2.2 pi-agent-core — 最小化但完整的 Agent 运行时

只做三件事，不多不少：

| 功能 | 说明 |
|------|------|
| **Tool Calling 状态机** | 管理 agent 与 tools 之间的交互状态流转 |
| **Session 管理** | 跨请求的上下文状态保持 |
| **Message History** | 对话历史的维护和压缩 |

**不绑定**：无 UI、无特定 LLM 接口、无内置 RAG、无内置 Memory。

**设计哲学**：接近 Unix 的"只做一件事"哲学——Agent 运行时的最小必要功能集，其他一切都是上游或下游的可选项。

### 2.3 pi-coding-agent — 开箱即用的完整 CLI

基于 `pi-ai` + `pi-agent-core` + `pi-tui` 构建的完整终端 AI 编程助手，可直接安装使用。

### 2.4 pi-tui — 独立终端 UI 库

与 Agent 逻辑完全解耦的终端 UI 库，可在任何场景复用。

### 2.5 pi-web-ui — 独立 Web 组件库

Web 端的 UI 组件库，同样与 Agent 逻辑无关，可独立使用。

### 2.6 pi-mom — 消息总线

Agent 内部或 Agent 之间的消息传递中间件，支持发布-订阅模式。

### 2.7 pi-pods — 扩展系统

插件化的扩展机制，支持第三方包接入。

---

## 三、零件化 vs 框架化深度对比

### 3.1 框架化方案的困境

以 LangChain 为代表的框架有两个天然缺陷：

| 问题 | 表现 |
|------|------|
| **透明性缺失** | 框架隐藏了太多实现细节，Agent 行为不符合预期时很难定位问题层级 |
| **组合灵活性差** | 需要组合不同模块（如换掉自带的 LLM 调用层）时，要么 hack，要么等官方支持 |

### 3.2 Pi 的零件化优势

```
┌─────────────────────────────────────────────────┐
│                   应用层                          │
│        （你自己写的业务逻辑）                       │
├─────────────────────────────────────────────────┤
│                  pi-tui / pi-web-ui             │
├─────────────────────────────────────────────────┤
│                pi-coding-agent                   │
├─────────────────────────────────────────────────┤
│                  pi-agent-core                   │
│         （状态机 / Session / Message History）     │
├─────────────────────────────────────────────────┤
│                    pi-ai                         │
│            （统一 LLM API，Provider 无关）          │
├─────────────────────────────────────────────────┤
│            pi-mom / pi-pods（扩展）               │
└─────────────────────────────────────────────────┘
```

**每一层都透明可查**：需要调试时，可以逐层定位——LLM API 层有没有正确调用？Agent Core 的 tool calling 逻辑对不对？CLI 层有没有引入额外问题？

### 3.3 完整对比表

| 维度 | LangChain | CrewAI | AutoGen | **Pi** |
|------|-----------|--------|---------|--------|
| 定位 | 全功能框架 | 角色+任务驱动 | 对话+群聊 | **零件化工具箱** |
| 抽象层 | 高层，隐藏实现 | 高层 | 中层 | **低层，透明可查** |
| LLM 抽象 | LangChain LLM 类 | 依赖框架 | 依赖框架 | **独立 npm 包** |
| UI 绑定 | 无内置 UI | 无 | 无 | **TUI + Web UI 独立** |
| 组合方式 | 在框架内配置 | 在框架内配置 | 在框架内配置 | **用多少拿多少** |
| 调试友好度 | 中 | 中 | 中 | **高（逐层透明）** |
| 上手速度 | 较快 | 快 | 中 | 中（需组合） |
| 定制化空间 | 中等 | 中等 | 高 | **极高** |

---

## 四、与 LangChain/AutoGen 的选型决策树

```
需要快速出原型？
    │
    ├── 是 → LangChain / CrewAI（框架抽象高，上手快）
    │
    └── 否
         │
         需要对 Agent 行为做细粒度控制？
              │
              ├── 是 → Pi（零件化，层层透明可控）
              │
              └── 否
                   │
                   需要多 LLM 提供商快速切换？
                        │
                        ├── 是 → Pi（统一 API，零改动切换）
                        │
                        └── 否
                             │
                             需要拖拽式低代码平台？
                                  │
                                  ├── 是 → Dify / Coze
                                  │
                                  └── 否 → 根据团队技术栈选择 LangChain / CrewAI / Pi
```

---

## 五、安装与快速上手

### 5.1 安装完整 CLI（pi-coding-agent）

```bash
npm install -g @mariozechner/pi-coding-agent

# 启动
pi-agent
```

### 5.2 按需安装独立包

```bash
# 仅统一 LLM API
npm install @mariozechner/pi-ai

# 仅 Agent 运行时核心
npm install @mariozechner/pi-agent-core

# 仅终端 UI
npm install @mariozechner/pi-tui

# 仅 Web UI
npm install @mariozechner/pi-web-ui
```

### 5.3 自定义组合示例（200 行代码搭建自己的 Agent）

```typescript
import { createAI } from '@mariozechner/pi-ai';
import { createAgentCore } from '@mariozechner/pi-agent-core';
import { createTUI } from '@mariozechner/pi-tui';

// 1. 创建统一的 LLM 实例
const ai = createAI({
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 2. 创建 Agent 运行时核心
const agent = createAgentCore({
  ai,
  tools: [
    {
      name: 'search',
      description: 'Search the web',
      execute: async (args) => {
        // 实现搜索逻辑
        return `Search results for: ${args.query}`;
      },
    },
  ],
});

// 3. 创建 TUI 并绑定 Agent
const tui = createTUI({ agent });
tui.start();
```

---

## 六、工程优势详解

### 6.1 monorepo 结构与版本同步

采用 `pnpm workspaces` monorepo 结构：

- **版本同步的一致性保证**：当 `pi-ai` 发布新版本时，`pi-coding-agent` 依赖的版本会通过 workspace 协议自动更新
- **兼容性在本地即可发现**，不需要等 CI 跑完才知道
- **224 个 releases**，每次破坏性变更都有清晰的版本边界

### 6.2 调试友好的分层设计

当 Agent 行为不符合预期时：

```
❌ LangChain 风格：
   "Agent 不工作了" → 不知道问题在 LLM 调用层 / 框架抽象层 / Prompt 层

✅ Pi 风格：
   1. 检查 pi-ai 层：LLM API 调用是否正确返回？
   2. 检查 pi-agent-core 层：tool calling 状态机状态对不对？
   3. 检查 pi-tui 层：UI 层有没有引入额外问题？
```

### 6.3 生产级定制化空间

| 定制需求 | Pi 如何应对 |
|---------|------------|
| 自定义 Memory 策略 | 接入任意向量数据库（pi-agent-core 不强迫用特定实现） |
| 切换 LLM 提供商 | 换 `provider` 参数即可，API 接口不变 |
| 换 UI 层 | 直接用 pi-tui 或 pi-web-ui，或完全自建 |
| 添加自定义工具 | 在 pi-agent-core 的 tools 数组中注入 |

---

## 七、适合与不适合的场景

### 7.1 ✅ 适合的场景

- 需要对 Agent 行为做**细粒度控制**的团队
- 有**多 LLM 提供商切换**需求（如同时用 Anthropic + Google + Groq）
- 自建 Agent 产品，**不想被框架绑架**，希望每层技术栈可控
- 想**学习 Agent 内部机制**的开发者（代码结构清晰，逐包研究）
- 团队有**定制化 UI**需求（不想用默认 CLI）

### 7.2 ❌ 不适合的场景

- 需要**快速出原型**（框架高层抽象更快）
- 对 LangChain Hub 等框架生态**有强依赖**
- 只想要**拖拽式低代码平台**（Dify/Coze 更适合）
- 团队没有 TypeScript/Node.js 技术栈（Pi 是 TypeScript monorepo）

---

## 八、相关知识关联

| 相关主题 | 笔记链接 |
|---------|---------|
| **OpenCode**（另一个开源终端 Agent）| [Claude Code 与 OpenCode 综合指南](./01_ClaudeCode与OpenCode综合指南.md) |
| **OpenClaw**（本地优先 Agent 操作系统）| [OpenClaw 源码分析](./08_OpenClaw/01_源码分析.md) |
| **多 Agent 协作系统** | [多 Agent 协作系统](../07_MiniMax生态/03_多Agent协作系统.md) |
| **Agent 基础概念** | [框架总览](../../01_智能体框架/01_框架总览.md) |
| **经典范式（ReAct 等）** | [经典范式构建](../../01_智能体框架/06_智能体经典范式构建.md) |
| **MCP 协议** | [MCP 开发指南](../../02_MCP协议/01_MCP开发指南.md) |

---

## 九、一句话总结

> **Pi（earendil-works/pi）是目前最彻底的零件化 Agent 工具链——7 个独立包，层层透明，任意组合。框架给你"封装好的黑盒"，Pi 给你"透明的工具箱"。适合追求每层可控、不被框架绑架的生产级 Agent 系统。**

---

## 十、参考资料

1. [earendil-works/pi - GitHub](https://github.com/earendil-works/pi)
2. [PiAgent 零件化全栈工具链设计解析](http://m.toutiao.com/group/7645841313899807284/)
3. [Pi 浏览器端移植踩坑记录](https://juejin.cn/post/7646674857891217454)
