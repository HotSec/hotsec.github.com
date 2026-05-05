
# MCP（Model Context Protocol）开发指南

## 一、MCP 核心概念

### 1.1 什么是 MCP

MCP（Model Context Protocol，模型上下文协议）是 Anthropic 推出的开放标准协议，为 AI 应用提供了统一的方式来连接外部数据源和工具。你可以把 MCP 理解为 AI 世界的 "USB-C 接口"——一个协议，即可让 AI 模型访问文件系统、数据库、搜索引擎等各类外部资源。

### 1.2 架构总览

MCP 采用客户端-服务端架构，包含三个核心角色：

```
┌─────────────────────────────────────────┐
│  Host（Claude Desktop / CLI）            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ Client A │  │ Client B │  ...       │
│  └────┬─────┘  └────┬─────┘            │
└───────┼──────────────┼──────────────────┘
        │              │
   ┌────▼─────┐  ┌────▼─────┐
   │ Server A │  │ Server B │
   │(filesystem)│ │(search)  │
   └──────────┘  └──────────┘
```

| 角色 | 说明 | 示例 |
|------|------|------|
| Host（宿主） | 发起连接的 AI 应用 | Claude Desktop、Claude CLI、Cursor、VS Code Copilot 代理模式 |
| Client（客户端） | Host 内部的 MCP 客户端，负责与 Server 建立一对一连接 | Host 内部组件 |
| Server（服务端） | 轻量级程序，通过 MCP 协议向 Client 暴露特定能力 | Filesystem Server、Search Server |

### 1.3 通信方式

MCP 支持两种传输方式：

| 传输方式 | 说明 | 适用场景 |
|----------|------|----------|
| stdio | 通过标准输入/输出通信 | 本地 Server，最常用 |
| SSE | 通过 HTTP Server-Sent Events 通信 | 远程 Server，需网络访问 |

### 1.4 三大原语

MCP Server 可以向 Host 暴露三种能力：

1. **Tools（工具）**：模型可以调用的函数，例如"搜索网页"、"读取文件"、"执行 SQL"
2. **Resources（资源）**：模型可以读取的数据，类似 REST API 的 GET 端点
3. **Prompts（提示模板）**：预定义的交互模板，帮助用户快速完成特定任务

其中 Tools 是目前最常用的原语，大多数 MCP Server 都以 Tool 的形式提供能力。

---

## 二、环境准备

### 2.1 基础环境

确保你的系统已安装以下工具：

- Node.js 18+ 和 npm：用于运行基于 Node.js 的 MCP Server
- Python 3.10+ 和 uv（可选）：用于运行基于 Python 的 MCP Server
- Claude Desktop 或 Claude CLI：作为 MCP 的 Host

### 2.2 安装 Node.js

前往 [nodejs.org](https://nodejs.org/) 下载最新 LTS 版本。验证安装：

```bash
node --version
npm --version
```

### 2.3 安装 Python 和 uv（可选）

部分 MCP Server 使用 Python 编写，需要通过 uvx 运行：

```bash
# 安装 uv（Python 包管理工具）
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# 验证
uv --version
uvx --version
```

### 2.4 安装 Claude CLI

```bash
npm install -g @anthropic-ai/claude-code
```

---

## 三、在 Claude CLI 中配置 MCP

### 3.1 使用 claude mcp add 命令

```bash
# 添加 filesystem server
claude mcp add filesystem -s user -- npx -y @modelcontextprotocol/server-filesystem ~/Documents
```

| 参数 | 说明 |
|------|------|
| filesystem | Server 名称（自定义，用于标识） |
| -s user | 作用域：user（全局）或 project（当前项目） |
| -- | 分隔符，之后的内容为 Server 启动命令 |

### 3.2 常用管理命令

```bash
# 查看已配置的 MCP Server
claude mcp list

# 查看某个 Server 的详细信息
claude mcp get filesystem

# 移除某个 Server
claude mcp remove filesystem
```

### 3.3 手动编辑配置文件

Claude CLI 的 MCP 配置存储在 `settings.json` 中：

- 全局配置：`~/.claude/settings.json`（macOS/Linux）或 `C:\Users\你的用户名\.claude\settings.json`（Windows）
- 项目配置：项目根目录/.claude/settings.json

**手动添加 MCP Server 示例：**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "~/Documents"
      ]
    }
  }
}
```

### 3.4 在 CLI 中验证

启动 Claude CLI 后，使用 `/mcp` 命令查看当前连接的 MCP Server 状态：

```
/mcp
```

输出中可以看到每个 Server 的名称、状态和提供的工具数量。

---

## 四、实战演示

### 4.1 场景一：用 Filesystem MCP 管理项目文件

配置好 Filesystem Server 后，你可以直接让 Claude 操作项目文件：

```
> 读取 package.json，列出所有依赖的版本

> 在 notes 目录下创建一个 todo.md，内容是本周的工作计划

> 找出 src 目录下所有包含 "TODO" 注释的文件
```

### 4.2 场景二：用 Brave Search MCP 联网搜索

配置好 Brave Search Server 后，Claude 具备了实时联网能力：

```
> 搜索 2026 年最新的 React 状态管理方案对比

> 搜索 Windows 11 最新的 PowerShell 更新内容
```

---

## 五、开发自己的 MCP Server（TypeScript）

### 5.1 快速开始：Node.js 模板

```bash
# 创建项目
mkdir my-mcp-server
cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk typescript @types/node

# 初始化 TypeScript
npx tsc --init
```

### 5.2 最小实现：echo 工具

创建 `index.ts`：

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// 创建 Server 实例
const server = new Server(
  {
    name: "my-echo-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 列出工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "echo",
        description: "Echoes back the input message",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "The message to echo",
            },
          },
          required: ["message"],
        },
      },
    ],
  };
});

// 调用工具
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "echo") {
    const message = args?.message as string;
    return {
      content: [
        {
          type: "text",
          text: `Echo: ${message}`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("My Echo Server running on stdio");
}

main().catch(console.error);
```

### 5.3 编译并运行

```bash
# 编译 TypeScript
npx tsc

# 测试运行
node index.js
```

### 5.4 配置到 Claude CLI

在 `~/.claude/settings.json` 中添加：

```json
{
  "mcpServers": {
    "my-echo-server": {
      "command": "node",
      "args": ["/path/to/my-mcp-server/index.js"]
    }
  }
}
```

---

## 六、开发自己的 MCP Server（Python）

### 6.1 Python SDK 模板

创建 `server.py`：

```python
import asyncio
import json
from typing import Any

# 使用 Python SDK（示例）
# 实际项目中可使用官方 Python SDK
class MCPServer:
    def __init__(self):
        self.name = "my-python-server"
        self.version = "1.0.0"

    def list_tools(self) -> list:
        return [
            {
                "name": "get_timestamp",
                "description": "Returns current timestamp",
                "inputSchema": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        ]

    async def call_tool(self, name: str, args: dict[str, Any]) -> dict:
        if name == "get_timestamp":
            import time
            return {
                "content": [
                    {
                        "type": "text",
                        "text": str(time.time())
                    }
                ]
            }
        raise Exception(f"Unknown tool: {name}")

async def main():
    server = MCPServer()
    # 实现 stdio 通信逻辑
    pass

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 七、MCP 消息协议详解

MCP 客户端和服务器可以交换一组标准消息：

| 消息 | 说明 |
|------|------|
| InitializeRequest | 首次连接时，客户端会向服务器发送此请求，要求它开始初始化 |
| ListToolsRequest | 由客户端发送以请求服务器拥有的工具列表 |
| CallToolRequest | 由客户端用来调用服务器提供的工具 |
| ListResourcesRequest | 客户端发送请求以获取可用的服务器资源列表 |
| ReadResourceRequest | 由客户端发送到服务器以读取特定资源 URI |
| ListPromptsRequest | 由客户端发送，从服务器请求可用提示和提示模板的列表 |
| GetPromptRequest | 由客户端用来获取服务器提供的提示 |
| PingRequest | 由服务器或客户端发送的 ping 检查对方是否仍然在线 |
| CreateMessageRequest | 服务器通过客户端对 LLM 进行采样的请求 |
| SetLevelRequest | 客户端向服务器发送的请求，用于启用或调整日志记录 |

---

## 八、常用 MCP Server 资源

### 8.1 官方和社区 MCP Server

| Server | 说明 | 来源 |
|--------|------|------|
| Filesystem | 读取和管理本地文件系统 | @modelcontextprotocol/server-filesystem |
| Brave Search | 网页搜索能力 | @modelcontextprotocol/server-brave-search |
| PostgreSQL | 连接 PostgreSQL 数据库 | 社区 |
| GitHub | 访问 GitHub API | 社区 |
| Memory | 本地向量数据库 | 社区 |

### 8.2 安装示例

```bash
# 安装 Brave Search Server
claude mcp add brave-search -s user -- npx -y @modelcontextprotocol/server-brave-search YOUR_BRAVE_API_KEY

# 安装 Memory Server（Python）
claude mcp add memory -s user -- uvx mcp-server-memory --dir ~/mcp-memory
```

---

## 九、最佳实践

1. **安全性**：
   - 避免匿名访问，除非场景明确需要
   - 妥善保管凭证，不要硬编码在代码中
   - 审查 AI 生成的代码的认证和授权逻辑

2. **错误处理**：
   - 提供有意义的错误信息
   - 错误信息格式：WHAT + WHY + HOW
   - 能够优雅降级

3. **性能优化**：
   - 使用缓存
   - 避免不必要的请求
   - 实现流式响应

---

## 十、参考资源

- [MCP 官方协议文档](https://modelcontextprotocol.io/)
- [mcp-docs.cn - 中文文档](https://mcp-docs.cn/)
- [MCP C# SDK](https://learn.microsoft.com/zh-cn/dotnet/ai/get-started-mcp)
- [Azure Functions MCP Server 示例](https://learn.microsoft.com/en-us/azure/foundry/mcp/build-your-own-mcp-server)
- [GitHub 上的 MCP 示例](https://github.com/modelcontextprotocol/servers)

