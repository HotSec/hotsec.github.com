# CodeGraphy：插件化代码图谱引擎

CodeGraphy 是一个插件驱动的代码关系图谱引擎，通过 VS Code 扩展、MCP 服务器和 CLI 三种入口，为 AI 编程助手提供结构化的代码关系查询。核心引擎 `@codegraphy-dev/core` 负责 workspace 索引、Graph Cache 存取和图查询，语言支持通过插件按需安装。

> npm 组织：https://www.npmjs.com/~codegraphy-dev
> 作者：poleski
> 许可：MIT

---

## 一、项目概览

| 项目信息 | 内容 |
|---------|------|
| 作者 | poleski |
| 核心包 | `@codegraphy-dev/core` v0.2.1 |
| MCP 包 | `@codegraphy-dev/mcp` v1.1.1 |
| 运行时 | Node 22.22.0+ |
| 许可 | MIT |
| 存储 | LadybugDB（`.codegraphy/graph.lbug`） |

---

## 二、与 CodeGraph 的区别

| 维度 | CodeGraph（colbymchenry） | CodeGraphy（poleski） |
|------|--------------------------|----------------------|
| Stars | 25K+ | 新项目 |
| 存储引擎 | SQLite FTS5 | LadybugDB（.lbug） |
| 语言支持 | 19+ 语言内置 | 插件化按需安装 |
| 架构 | 单体 CLI | VS Code + MCP + CLI 三入口 |
| 插件系统 | 无 | 完整插件生命周期 |
| MCP 工具数 | 8 | 11 |
| 配置位置 | 项目根目录 | `.codegraphy/settings.json` |
| 框架路由识别 | 14 种框架 | 暂无 |

---

## 三、架构设计

### 3.1 三入口架构

```
@codegraphy-dev/core（无头核心引擎）
    ├── VS Code 扩展（GUI 交互）
    ├── @codegraphy-dev/mcp（MCP 服务器 + CLI）
    └── CLI 命令行（headless 操作）
```

核心包 `@codegraphy-dev/core` 是无头引擎，VS Code、MCP 和 CLI 适配器都调用它，不拥有独立的索引行为。

### 3.2 核心入口点

| 入口点 | 功能 |
|--------|------|
| Workspace 路径 | 解析 `.codegraphy/settings.json` 和 `.codegraphy/graph.lbug` |
| Workspace 设置 | 读取、规范化、写入、指纹校验 workspace-local 设置 |
| 文件发现 | 在无 VS Code API 环境下发现可分析文件和目录 |
| Tree-sitter 分析 | 解析支持语言，产出文件/符号/import/call/inherit/reference/type-import 关系 |
| 文件分析 | 缓存感知的逐文件插件分析和项目文件关系 |
| 核心索引 | 索引 workspace 路径、运行 headless 插件、构建关系图、写入 Graph Cache |
| 图投影 | 从分析结果构建文件/包/文件夹/符号的关系图节点和边 |
| Graph Cache 状态 | 报告 workspace-local Graph Cache 是否存在 |
| 图查询 | 运行节点/边/关系/符号/路径报告 |

---

## 四、插件系统

### 4.1 插件状态模型

插件安装与 workspace 启用是分离的：

| 层级 | 位置 | 说明 |
|------|------|------|
| 已安装插件 | `~/.codegraphy/plugins.json` | 用户级缓存 |
| 已启用插件 | `<workspace>/.codegraphy/settings.json` | workspace 级配置 |

### 4.2 官方插件

| 插件包 | 版本 | 说明 |
|--------|------|------|
| `@codegraphy-dev/plugin-typescript` | v2.1.0 | TypeScript 和 JavaScript 支持 |
| `@codegraphy-dev/plugin-python` | v2.1.0 | Python 支持 |
| `@codegraphy-dev/plugin-csharp` | v2.1.0 | C# 支持 |
| `@codegraphy-dev/plugin-godot` | v2.2.0 | Godot / GDScript 支持 |
| `@codegraphy-dev/plugin-markdown` | v1.1.0 | Markdown 支持（新 workspace 默认启用） |
| `@codegraphy-dev/plugin-api` | v3.0.0 | 插件类型定义 |

### 4.3 插件元数据格式

```json
{
  "name": "@codegraphy-dev/plugin-python",
  "version": "1.2.3",
  "codegraphy": {
    "type": "plugin",
    "apiVersion": "^2.0.0",
    "defaultOptions": {
      "includeTests": true
    },
    "disclosures": []
  }
}
```

### 4.4 插件生命周期

1. `plugins refresh` — 扫描全局 npm 根目录中的 `@codegraphy-dev/*` 包
2. `plugins add <package>` — 记录显式命名的全局安装包
3. `plugins enable <package>` — 写入 workspace 的 `plugins` 数组
4. `index` — 导入已启用插件的运行时，合并 manifest `defaultOptions` 与 workspace-local `options`
5. 启用/禁用只改设置，插件运行时加载仍需显式执行索引

---

## 五、11 个 MCP 工具

### 5.1 管理类工具

| 工具 | 用途 |
|------|------|
| `codegraphy_status` | 报告 workspace 的 Graph Cache 状态（fresh/stale/missing） |
| `codegraphy_index` | 运行索引（无需打开 VS Code） |
| `codegraphy_plugins_refresh` | 扫描全局 npm 根目录，更新插件缓存 |
| `codegraphy_plugins_add` | 添加指定插件包到缓存 |
| `codegraphy_plugins_list` | 列出已安装和已启用的插件 |
| `codegraphy_plugins_enable` | 为 workspace 启用插件 |
| `codegraphy_plugins_disable` | 为 workspace 禁用插件 |

### 5.2 查询类工具

| 工具 | 用途 |
|------|------|
| `codegraphy_list_nodes` | 列出图节点（默认 File Nodes） |
| `codegraphy_list_edges` | 列出高层 from/to 连接，按 Edge Type 分组 |
| `codegraphy_list_relationships` | 列出详细关系，按节点对和 Edge Type 分组 |
| `codegraphy_list_symbols` | 列出声明或有关系支撑的符号证据 |
| `codegraphy_find_paths` | 在两个精确节点路径之间查找有界有向路径 |

### 5.3 查询特性

- 查询工具无需先调用 open/select
- 若 workspace 无 Graph Cache，工具响应会指示 Agent 先运行 `codegraphy_index` 再重试
- 宽泛列表调用支持 `limit` 和 `offset` 分页，默认页大小 500

---

## 六、CLI 命令

| 命令 | 用途 |
|------|------|
| `codegraphy setup` | 将 CodeGraphy MCP 条目添加到 Codex |
| `codegraphy status [workspace]` | 报告 Graph Cache 状态、过期原因、已启用插件 |
| `codegraphy index [workspace]` | 运行索引 |
| `codegraphy plugins refresh` | 扫描全局 npm 根目录更新插件缓存 |
| `codegraphy plugins add <package>` | 添加指定插件 |
| `codegraphy plugins list [workspace]` | 列出已安装和已启用插件 |
| `codegraphy plugins enable <package> [workspace]` | 启用插件 |
| `codegraphy plugins disable <package> [workspace]` | 禁用插件 |
| `codegraphy mcp` | 启动本地 stdio MCP 服务器 |

---

## 七、安装与使用

### 安装

```bash
npm install -g @codegraphy-dev/mcp
```

### 快速开始

```bash
codegraphy setup
codegraphy index
codegraphy status
codex mcp list
```

### 索引其他 workspace

```bash
codegraphy index /absolute/path/to/folder
```

### 安装语言插件

```bash
npm install -g @codegraphy-dev/plugin-python
npm install -g @codegraphy-dev/plugin-typescript
npm install -g @codegraphy-dev/plugin-csharp
codegraphy plugins refresh
codegraphy plugins enable @codegraphy-dev/plugin-python
codegraphy index
```

---

## 八、Workspace 数据结构

```
project-root/
└── .codegraphy/
    ├── settings.json     # workspace 设置（含启用插件列表）
    └── graph.lbug        # LadybugDB 图缓存
```

用户级配置：

```
~/.codegraphy/
└── plugins.json          # 已安装插件缓存
```

---

## 九、示例 Prompt

- `Use CodeGraphy to list files in this repo.`
- `Use CodeGraphy to list edges connected to packages/app/src/a.ts.`
- `Use CodeGraphy to list symbols involved in type-import relationships from packages/app/src/a.ts to packages/app/src/b.ts.`
- `Use CodeGraphy to find paths from packages/app/src/a.ts to packages/app/src/d.ts.`

---

## 十、核心命题

> 插件化的代码关系图谱引擎，让 AI Agent 通过 MCP 查询结构化代码关系，而非从零 grep。

CodeGraphy 的差异化在于插件架构——语言支持按需安装、workspace 级启用/禁用、插件生命周期完整管理。存储选用 LadybugDB 而非 SQLite，三入口（VS Code / MCP / CLI）共享同一无头核心引擎。作为新项目，语言覆盖和框架路由识别尚在扩展中，但插件化设计为社区贡献留出了清晰的扩展路径。
