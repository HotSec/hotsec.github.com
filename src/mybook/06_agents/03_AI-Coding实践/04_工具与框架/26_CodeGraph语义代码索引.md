# CodeGraph：AI Agent 的语义代码知识图谱索引

CodeGraph 把 AI Agent 每次任务都要重做一遍的「摸仓库」，变成一次构建、反复查询的本地语义索引。通过 MCP 给 Claude Code、Cursor、Codex CLI、OpenCode、Hermes Agent 等 8 个查询工具，Agent 查图谱而不是每次从零 grep。

> 项目地址：https://github.com/colbymchenry/codegraph（25K Stars）
> 文档：https://colbymchenry.github.io/codegraph/

---

## 一、项目概览

| 项目信息 | 内容 |
|---------|------|
| 作者 | colbymchenry |
| 最新版本 | v0.9.4 (2026-05-24) |
| 核心语言 | TypeScript |
| 许可 | MIT |
| Stars | 25K+ |
| 官方 Slogan | ~35% cheaper · ~70% fewer tool calls · 100% local |

---

## 二、解决的核心问题

你问 Claude Code：「AuthService 是怎么被调用的？」——常见路径是 glob 扫目录、连跑几次 grep、再 Read 三四个文件，**十来次工具调用、几十万 token 才摸到答案**。真正写 patch 的时间，往往还没「摸清仓库」花得多。

CodeGraph 针对的就是这段 **discovery phase**：在你开口之前，它已经用 tree-sitter 把仓库解析成语义图——函数、类、import、调用链、继承关系——落在本机 SQLite FTS5 里。Agent 查图谱，而不是每次从零 grep。

---

## 三、四段流水线

| 阶段 | 说明 |
|------|------|
| **Extract** | tree-sitter 抽 AST，容错好——语法没写完的文件也能抽出部分结构 |
| **Store** | 符号与边进 SQLite FTS5，支持按名全文搜 |
| **Resolve** | 把「调用了名叫 X 的东西」解析成「文件 Y 第 Z 行的具体定义」，跨文件 import 在索引期搞定 |
| **Auto-Sync** | 用系统原生文件事件（macOS FSEvents / Linux inotify / Windows ReadDirectoryChangesW）+ 2 秒防抖，改代码后图谱增量更新 |

---

## 四、八个 MCP 工具

| 工具 | 用途 |
|------|------|
| `codegraph_search` | 按符号名搜 |
| `codegraph_context` | **核心**，按任务拼上下文包（入口、相关符号、代码片段） |
| `codegraph_trace` | 「X 怎么到达 Y」——调用路径，每跳的函数体内联（能跟踪动态分派，grep 做不到） |
| `codegraph_explore` | 一次性浏览多个相关符号的源码 |
| `codegraph_callers` / `codegraph_callees` | 谁调我、我调谁 |
| `codegraph_impact` | 改这个符号会影响哪一片 |
| `codegraph_node` | 单个符号详情 |
| `codegraph_files` | 已索引文件结构 |
| `codegraph_status` | 索引健康度与统计 |

**工具选择指南**：

| 意图 | 推荐工具 |
|------|---------|
| 先摸清一个任务/功能/区域 | `codegraph_context` |
| X 怎么到达 Y | `codegraph_trace` |
| 浏览多个相关符号的源码 | `codegraph_explore` |
| 按名字找符号 | `codegraph_search` |
| 谁调我/我调谁 | `codegraph_callers` / `codegraph_callees` |
| 改之前检查影响范围 | `codegraph_impact` |

---

## 五、基准测试

7 个真实开源仓库（v0.9.4，2026-05-24 复测），Claude Opus 4.7 headless，每仓同一架构问题，每臂 4 次取中位数：

**平均：35% cheaper · 57% fewer tokens · 46% faster · 71% fewer tool calls**

| Codebase | 语言 | Cost | Tokens | Time | Tool calls |
|----------|------|------|--------|------|------------|
| **VS Code** | TypeScript · ~10k files | 26% cheaper | 78% fewer | 52% faster | 85% fewer |
| **Excalidraw** | TypeScript · ~640 | 52% cheaper | 90% fewer | 73% faster | 96% fewer |
| **Django** | Python · ~3k | 12% cheaper | 36% fewer | 19% faster | 53% fewer |
| **Tokio** | Rust · ~790 | 82% cheaper | 86% fewer | 71% faster | 92% fewer |
| **OkHttp** | Java · ~645 | 2% cheaper | 13% fewer | 31% faster | 45% fewer |
| **Gin** | Go · ~110 | 21% cheaper | 34% fewer | 27% faster | 40% fewer |
| **Alamofire** | Swift · ~110 | 47% cheaper | 64% fewer | 48% faster | 83% fewer |

**规律**：仓越大、类型系统越绕，收益越大；小项目本身 grep 就便宜，边际提升会小一些。

---

## 六、19+ 语言支持

TypeScript、JavaScript、Python、Go、Rust、Java、C#、PHP、Ruby、C、C++、Swift、Kotlin、Dart、Lua、Luau、Svelte、Liquid、Pascal/Delphi

---

## 七、14 种 Web 框架路由识别

CodeGraph 检测 Web 框架路由文件，把 URL 模式链接到 handler 函数：

| 框架 | 识别模式 |
|------|---------|
| **Django** | `path()`, `re_path()`, `url()`, `include()` |
| **Flask** | `@app.route()`, blueprint routes |
| **FastAPI** | `@app.get()`, `@router.post()` |
| **Express** | `app.get()`, `router.post()` |
| **NestJS** | `@Controller` + `@Get/@Post/...`, GraphQL `@Resolver` |
| **Laravel** | `Route::get()`, `Route::resource()` |
| **Rails** | `get '/x', to: 'users#index'` |
| **Spring** | `@GetMapping`, `@PostMapping` |
| **Gin / chi / gorilla / mux** | `r.GET()`, `router.HandleFunc()` |
| **Axum / actix / Rocket** | `.route("/x", get(handler))` |
| **ASP.NET** | `[HttpGet("/x")]` |
| **Vapor** | `app.get("x", use: handler)` |
| **React Router / SvelteKit** | Route component nodes |

---

## 八、安装与使用

### 安装

```bash
# macOS / Linux（无需 Node.js）
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.ps1 | iex

# 或 npm
npx @colbymchenry/codegraph
```

### 初始化项目

```bash
cd your-project
codegraph init -i
```

### 卸载

```bash
codegraph uninstall
```

### 支持的 Agent

- Claude Code
- Cursor
- Codex CLI
- OpenCode
- Hermes Agent

---

## 九、CI 集成：affected 命令

改了几个源文件，想知道该跑哪些测试？`codegraph affected` 沿 import 依赖图反查，只列出受影响的测试文件——大 monorepo 里把「全量测试」压成「相关子集」。

---

## 十、注意事项

1. **首次索引时间**：大仓库需要几分钟级索引时间
2. **Agent 必须真的用 MCP 工具**：若模型仍习惯 spawn Explore 子 Agent 去 Read，索引帮不上忙
3. **和可视化图谱产品的区别**：CodeGraph 不做交互大图，而是做 Agent 侧的预索引层——轻、快、本地、专供 MCP 查询
4. **README 关键建议**：要让 Agent 直接用 CodeGraph 回答，别再把探索委派给会狂读文件的子 Agent，否则索引白建

---

## 十一、核心命题

> 把 AI Agent 每次任务都要重做一遍的「摸仓库」，变成一次构建、反复查询的本地语义索引。

tree-sitter + SQLite FTS5 + 原生文件监听，技术选型务实；8 个 MCP 工具里 `codegraph_context` 是日常主力；基准数据在 VS Code、Tokio 这类大仓上说服力最强。若你已经在用 Claude Code/Cursor 且账单里「探索」占比很高，这可能是比换更强模型更便宜的提速路径。
