# Notebook 项目 Code Wiki

## 1. 项目概述

Notebook 是一个**个人知识库管理系统**，由两部分核心组成：

- **知识库内容（Knowledge Base）**：以 Markdown 文件形式组织的结构化技术笔记，涵盖 Go、Python、Lua、Web、架构、运维、Linux、安全等多个技术领域
- **在线笔记 Web 应用（OnlineNote）**：提供思维导图可视化浏览和协作式 Markdown 编辑功能的 Web 应用

### 项目定位

| 维度 | 说明 |
|------|------|
| 类型 | 个人知识库 + Web 可视化/编辑工具 |
| 核心价值 | 结构化技术知识管理 + 交互式浏览与编辑 |
| 数据格式 | Markdown（.md） |
| 部署方式 | 单机部署，SQLite 存储，零外部依赖 |

---

## 2. 项目整体架构

```
notebook/
├── src/                          # 知识库源文件
│   ├── mybook/                   # 知识库主体（按技术领域分目录）
│   │   ├── 01_go/                # Go 语言（16 个子主题）
│   │   ├── 02_python/            # Python（7 个子主题）
│   │   ├── 04_lua/               # Lua
│   │   ├── 05_web/               # 前端/Web
│   │   ├── 08_architecture/      # 架构设计
│   │   ├── 09_devops/            # 运维
│   │   ├── 10_os-linux/          # Linux 操作系统
│   │   ├── 11_other/             # 其他
│   │   └── 12_security/          # 安全
│   └── ALL.md                    # 知识库总索引（~134KB）
│
├── onlinenote/                   # 在线笔记 Web 应用
│   ├── server/                   # Go 后端服务
│   │   ├── cmd/main.go           # 服务入口
│   │   ├── config/               # 配置模块
│   │   └── internal/             # 内部模块
│   │       ├── document/         # 文档管理
│   │       ├── storage/          # 数据库存储
│   │       ├── user/             # 用户认证
│   │       └── websocket/        # WebSocket 通信
│   ├── public/                   # 前端静态文件
│   │   ├── index.html            # 思维导图页面
│   │   ├── editor.html           # 协作编辑器页面
│   │   ├── css/                  # 样式
│   │   └── js/                   # 前端 JS 模块
│   │       ├── editor/           # 编辑器模块
│   │       ├── renderer/         # 渲染模块
│   │       └── collaboration/    # 协作模块
│   └── data/                     # 运行时数据
│
├── examples/                     # Go 示例代码
│   ├── study/                    # 学习示例
│   └── zsyslog/                  # Syslog 示例项目
│
└── .trae/                        # 项目规则与规范
    └── rules/                    # 命名规范、添加笔记规则
```

### 架构分层图

```
┌─────────────────────────────────────────────────────┐
│                    用户界面层                         │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │  思维导图页面      │  │  协作编辑器页面            │ │
│  │  (index.html)    │  │  (editor.html)           │ │
│  │  D3.js 可视化     │  │  CodeMirror 6 编辑器     │ │
│  └────────┬─────────┘  └──────────┬───────────────┘ │
│           │                       │                  │
│  ┌────────┴───────────────────────┴───────────────┐ │
│  │            前端 JS 模块层                        │ │
│  │  Editor │ Toolbar │ Outline │ LivePreview │     │ │
│  │  SyncScroll │ CollaborationManager              │ │
│  └────────────────────┬───────────────────────────┘ │
└───────────────────────┼─────────────────────────────┘
                        │ HTTP REST + WebSocket
┌───────────────────────┼─────────────────────────────┐
│                       ▼    后端服务层                 │
│  ┌────────────────────────────────────────────────┐ │
│  │           Gin HTTP Server (main.go)            │ │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐  │ │
│  │  │ REST API │ │ WebSocket│ │ Static Files  │  │ │
│  │  │ /api/*   │ │ /ws      │ │ NoRoute       │  │ │
│  │  └────┬─────┘ └────┬─────┘ └───────────────┘  │ │
│  └───────┼────────────┼──────────────────────────┘ │
│          ▼            ▼                             │
│  ┌───────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ document  │ │   user   │ │   websocket      │  │
│  │ Manager   │ │   auth   │ │   Hub + Client   │  │
│  └─────┬─────┘ └────┬─────┘ └──────────────────┘  │
│        ▼            ▼                               │
│  ┌───────────┐ ┌──────────┐                        │
│  │  storage  │ │  config  │                        │
│  │  Database │ │  Config  │                        │
│  └─────┬─────┘ └──────────┘                        │
│        ▼                                            │
│  ┌───────────┐                                      │
│  │  SQLite   │                                      │
│  │  数据库    │                                      │
│  └───────────┘                                      │
└─────────────────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────┐
│                       ▼    数据层                     │
│  ┌────────────────────────────────────────────────┐ │
│  │              知识库 Markdown 文件                │ │
│  │  src/mybook/**/*.md + src/ALL.md               │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 3. 主要模块职责

### 3.1 知识库模块（src/mybook/）

知识库是项目的核心数据资产，采用**双数字编号 + 中文名称**的目录与文件命名规范。

| 目录 | 主题 | 子主题数 | 说明 |
|------|------|---------|------|
| `01_go/` | Go 语言 | 16 | 语言基础、并发、内存、标准库、第三方库、框架、性能、可观测性、分布式、安全、工具、开源项目、陷阱、运行时、编译器、WASM |
| `02_python/` | Python | 7 | 语言基础、Python工匠、版本演进、标准库、常用库、Web开发、第三方库 |
| `04_lua/` | Lua | 2 | 基础、高级主题（LuaJIT/FFI/OpenResty/WAF） |
| `05_web/` | 前端/Web | 4 | 前端基础、前端框架、后端与协议、工程化与工具 |
| `08_architecture/` | 架构设计 | 6 | 软考架构、数据库、分布式理论、信息系统、安全、大型网站 |
| `09_devops/` | 运维 | 1 | Hyper-V |
| `10_os-linux/` | Linux | 11 | OS基础、内存、IO模型、防火墙、性能、网络、Shell、Git、网络协议 |
| `11_other/` | 其他 | 4 | 大模型、大厂文章、研发效能、开源项目 |
| `12_security/` | 安全 | 2 | Web安全、安全工具与方法 |

**ALL.md 索引文件**：知识库的总入口，使用 `<details>/<summary>` 折叠标签组织内容，每个知识点包含摘要和指向源文件的链接。

### 3.2 后端服务模块（onlinenote/server/）

#### 3.2.1 入口与路由（cmd/main.go）

| 组件 | 职责 |
|------|------|
| `Server` 结构体 | 顶层服务容器，聚合 Config、Database、DocMgr、Hub |
| `main()` | 初始化所有组件，配置 Gin 路由，启动 HTTP 服务 |
| `handleWebSocket()` | WebSocket 连接升级，创建 Client 并注册到 Hub |
| `handleRegister()` | 用户注册（POST /api/auth/register） |
| `handleLogin()` | 用户登录（POST /api/auth/login） |
| `handleGetDocument()` | 获取文档（GET /api/documents/:id） |
| `handleSaveDocument()` | 保存文档（PUT /api/documents/:id） |
| `handleGetVersions()` | 获取文档版本列表（GET /api/documents/:id/versions） |
| `resolveSrcPath()` | 解析 Markdown 文件路径，优先从 MarkdownDir 查找 |

**API 路由表**：

| 方法 | 路径 | 处理函数 | 说明 |
|------|------|---------|------|
| POST | `/api/auth/register` | `handleRegister` | 用户注册 |
| POST | `/api/auth/login` | `handleLogin` | 用户登录 |
| GET | `/api/documents/:id` | `handleGetDocument` | 获取文档内容 |
| PUT | `/api/documents/:id` | `handleSaveDocument` | 保存文档内容 |
| GET | `/api/documents/:id/versions` | `handleGetVersions` | 获取版本列表 |
| GET | `/ws` | `handleWebSocket` | WebSocket 连接 |

#### 3.2.2 配置模块（config/config.go）

| 结构体/函数 | 职责 |
|------------|------|
| `Config` | 服务配置结构体，包含端口、数据目录、静态目录、Markdown 目录、JWT 密钥、WebSocket 缓冲区大小 |
| `Load()` | 从环境变量加载配置，提供默认值 |
| `getEnv()` | 获取字符串环境变量，支持 fallback |
| `getEnvInt()` | 获取整数环境变量，支持 fallback |

**配置项**：

| 字段 | 环境变量 | 默认值 | 说明 |
|------|---------|--------|------|
| Port | PORT | 8080 | 服务端口 |
| DataDir | DATA_DIR | ../data | 数据目录 |
| StaticDir | STATIC_DIR | ../public | 静态文件目录 |
| MarkdownDir | MARKDOWN_DIR | ../../src | Markdown 文件根目录 |
| JWTSecret | JWT_SECRET | onlinenote-secret-key-change-in-production | JWT 签名密钥 |
| WSReadSize | WS_READ_SIZE | 1048576 | WebSocket 读缓冲区 |
| WSWriteSize | WS_WRITE_SIZE | 1048576 | WebSocket 写缓冲区 |

#### 3.2.3 文档管理模块（internal/document/manager.go）

| 结构体/函数 | 职责 |
|------------|------|
| `Document` | 文档数据模型（ID、Title、Content、Path、Version） |
| `Manager` | 文档管理器，维护内存缓存 + 文件系统持久化 |
| `NewManager()` | 创建 Manager，初始化文档目录，从静态目录种子 ALL.md |
| `seedFromStatic()` | 首次启动时将 ALL.md 内容导入文档系统 |
| `Load()` | 加载文档（先查内存缓存，再读文件系统） |
| `Save()` | 保存文档（写文件 + 更新缓存 + 版本递增） |
| `SaveVersion()` | 保存文档并创建备份版本 |
| `ListVersions()` | 列出文档的所有备份版本 |
| `GetContent()` | 获取文档内容 |

**并发安全**：使用 `sync.RWMutex` 保护内存缓存，读操作用读锁，写操作用写锁。

#### 3.2.4 数据库存储模块（internal/storage/database.go）

| 结构体/函数 | 职责 |
|------------|------|
| `Database` | SQLite 数据库封装 |
| `NewDatabase()` | 初始化 SQLite 连接（WAL 模式），执行迁移 |
| `DB()` | 返回底层 *sql.DB |
| `Close()` | 关闭数据库连接 |
| `migrate()` | 执行数据库迁移，创建 users、documents、document_versions 表 |

**数据库表结构**：

```sql
-- 用户表
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    avatar TEXT,
    color TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 文档表
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    path TEXT NOT NULL DEFAULT '',
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 文档版本表
CREATE TABLE document_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    content TEXT NOT NULL,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id)
);
```

#### 3.2.5 用户认证模块（internal/user/auth.go）

| 结构体/函数 | 职责 |
|------------|------|
| `User` | 用户数据模型 |
| `Claims` | JWT Claims 结构（UserID、Username + 标准声明） |
| `GenerateID()` | 生成随机 16 位十六进制用户 ID |
| `HashPassword()` | 使用 bcrypt 哈希密码 |
| `CheckPassword()` | 验证 bcrypt 密码 |
| `GenerateToken()` | 生成 JWT Token（HS256 签名，7 天有效期） |
| `ParseToken()` | 解析验证 JWT Token |
| `AssignColor()` | 从 12 色池中分配用户颜色 |

#### 3.2.6 WebSocket 通信模块（internal/websocket/hub.go）

| 结构体/函数 | 职责 |
|------------|------|
| `Client` | WebSocket 客户端连接（Hub、Conn、Send 通道、用户信息、文档 ID） |
| `Message` | WebSocket 消息格式（type、docId、userId、userName、color、data） |
| `Hub` | WebSocket 连接中心，管理所有客户端和消息广播 |
| `BroadcastMessage` | 广播消息（docId、data、排除客户端） |
| `NewHub()` | 创建 Hub 实例 |
| `Run()` | Hub 主循环（处理注册/注销/广播） |
| `Register()` | 注册客户端 |
| `Unregister()` | 注销客户端 |
| `Broadcast()` | 向指定文档的所有客户端广播消息 |
| `GetDocUsers()` | 获取指定文档的在线用户列表 |
| `broadcastJoin()` | 广播用户加入通知 |
| `broadcastLeave()` | 广播用户离开通知 |
| `notifyUserList()` | 通知所有用户更新在线列表 |
| `ReadPump()` | 客户端读循环（60s 超时，处理 edit/cursor/selection/save 消息） |
| `WritePump()` | 客户端写循环（30s 心跳 Ping） |

**消息类型**：

| 类型 | 方向 | 说明 |
|------|------|------|
| `edit` | 客户端→服务端→广播 | 编辑操作（changes 或 fullContent） |
| `cursor` | 客户端→服务端→广播 | 光标位置同步 |
| `selection` | 客户端→服务端→广播 | 选区同步 |
| `save` | 客户端→服务端 | 保存请求 |
| `user-joined` | 服务端→广播 | 用户加入通知 |
| `user-left` | 服务端→广播 | 用户离开通知 |
| `user-list` | 服务端→广播 | 在线用户列表更新 |
| `document-saved` | 服务端→广播 | 文档保存通知 |

### 3.3 前端模块（onlinenote/public/）

#### 3.3.1 思维导图页面（index.html）

单文件应用（~1840 行），所有 CSS 和 JS 内联，外部库通过 CDN 引入。

**核心功能**：

| 功能 | 实现方式 |
|------|---------|
| 思维导图渲染 | D3.js hierarchy + 自定义布局算法 |
| 4 种布局模式 | 括号图(bracket)、鱼骨图(tree)、气泡图(bubble)、手绘风格(sketch) |
| 标题解析 | 正则匹配 `#{1,6}` 标题 + `<summary>` 标签 |
| 节点交互 | 单击展开/折叠，双击查看详情 |
| 模态弹窗 | 显示对应标题的 Markdown 渲染内容 |
| 搜索 | 标题搜索 + 下拉列表 + 节点高亮定位 |
| 快速编辑 | 模态框内编辑 + 3s 自动保存 |
| 主题切换 | 深色/浅色主题（CSS 变量 + localStorage） |
| 实时同步 | WebSocket 监听 document-saved 事件，回退 30s 轮询 |

**关键函数**：

| 函数 | 职责 |
|------|------|
| `parseHeadings()` | 解析 ALL.md 提取标题树和 `<summary>` 节点 |
| `buildHeadingTree()` | 将标题列表构建为树形结构 |
| `getSectionContent()` | 获取指定标题对应的 Markdown 渲染内容 |
| `updateBracket()` | 渲染括号图布局 |
| `updateTree()` | 渲染鱼骨图布局 |
| `updateBubble()` | 渲染气泡图布局 |
| `updateSketch()` | 渲染手绘风格布局 |
| `showModal()` | 显示内容弹窗 |
| `updateMarkdownContent()` | 更新内存中的 Markdown 内容并重新渲染 |
| `saveToBackend()` | 保存内容到后端 API |

#### 3.3.2 协作编辑器页面（editor.html）

基于 ES Module 的模块化应用。

**模块组成**：

| 模块 | 文件 | 职责 |
|------|------|------|
| Editor | `js/editor/Editor.js` | CodeMirror 6 编辑器封装 |
| Toolbar | `js/editor/Toolbar.js` | Markdown 格式化工具栏 |
| Outline | `js/editor/Outline.js` | 文档大纲导航 |
| LivePreview | `js/renderer/LivePreview.js` | Markdown 实时预览渲染 |
| SyncScroll | `js/renderer/SyncScroll.js` | 编辑器与预览同步滚动 |
| CollaborationManager | `js/collaboration/CollaborationManager.js` | WebSocket 协作通信 |

#### 3.3.3 Editor 类（js/editor/Editor.js）

| 方法 | 职责 |
|------|------|
| `init()` | 异步加载 CodeMirror 6 模块（通过 esm.sh CDN），初始化编辑器 |
| `scheduleChange()` | 防抖 300ms 触发 onChange，2s 后自动保存 |
| `getContent()` | 获取编辑器全文内容 |
| `applyChanges()` | 应用远程编辑变更（协作场景） |
| `setContent()` | 替换编辑器全部内容 |
| `insertAtCursor()` | 在光标处插入文本 |
| `wrapSelection()` | 包裹选中文本（加粗/斜体等） |
| `insertLine()` | 在当前行插入前缀（标题/列表等） |
| `getOutline()` | 提取文档大纲（标题 + summary 标签） |
| `scrollToLine()` | 滚动到指定行 |

**CodeMirror 6 依赖**（通过 esm.sh 动态加载）：
- `@codemirror/view@6.36.4`
- `@codemirror/state@6.5.2`
- `@codemirror/lang-markdown@6.3.2`
- `@codemirror/language-data@6.5.1`
- `@codemirror/commands@6.8.0`

#### 3.3.4 Toolbar 类（js/editor/Toolbar.js）

提供 4 组工具按钮：
1. **标题组**：H1、H2、H3
2. **格式组**：加粗(B)、斜体(I)、删除线(S)、行内代码(<>)
3. **列表组**：无序列表、有序列表、任务列表、引用
4. **插入组**：分隔线、链接、图片、代码块、表格

#### 3.3.5 Outline 类（js/editor/Outline.js）

| 方法 | 职责 |
|------|------|
| `update()` | 从编辑器获取大纲并重新渲染 |
| `render()` | 渲染大纲列表，点击跳转到对应行 |

#### 3.3.6 LivePreview 类（js/renderer/LivePreview.js）

| 方法 | 职责 |
|------|------|
| `init()` | 初始化 marked 和 hljs |
| `render()` | 渲染 Markdown 为 HTML，处理 details 标签样式、.md 链接点击、代码高亮 |
| `resolveMdLink()` | 解析相对 Markdown 链接路径 |

#### 3.3.7 SyncScroll 类（js/renderer/SyncScroll.js）

| 方法 | 职责 |
|------|------|
| `init()` | 绑定编辑器和预览的滚动事件 |
| `buildHeadingMap()` | 构建编辑器行号与预览标题元素的映射 |
| `findEditorScrollTarget()` | 根据编辑器滚动位置找到对应的预览目标 |
| `findPreviewScrollTarget()` | 根据预览滚动位置找到对应的编辑器目标 |
| `update()` | 重新构建映射关系 |

#### 3.3.8 CollaborationManager 类（js/collaboration/CollaborationManager.js）

| 方法 | 职责 |
|------|------|
| `connect()` | 建立 WebSocket 连接，传递用户信息参数 |
| `handleMessage()` | 处理服务端消息（user-joined/left/list/edit/cursor/document-saved） |
| `sendEdit()` | 发送编辑操作 |
| `sendChanges()` | 发送变更列表 |
| `sendCursor()` | 发送光标位置 |
| `attemptReconnect()` | 指数退避重连（最大 10 次，基础延迟 1s，1.5 倍递增） |
| `disconnect()` | 断开连接 |

---

## 4. 依赖关系

### 4.1 后端依赖（Go）

**直接依赖**：

| 依赖 | 版本 | 用途 |
|------|------|------|
| `github.com/gin-gonic/gin` | v1.10.0 | HTTP Web 框架 |
| `github.com/gin-contrib/cors` | v1.7.3 | CORS 中间件 |
| `github.com/gorilla/websocket` | v1.5.3 | WebSocket 协议 |
| `github.com/golang-jwt/jwt/v5` | v5.2.2 | JWT 认证 |
| `github.com/mattn/go-sqlite3` | v1.14.24 | SQLite 驱动（CGO） |
| `golang.org/x/crypto` | v0.31.0 | bcrypt 密码哈希 |

**间接依赖**（主要）：

| 依赖 | 用途 |
|------|------|
| `github.com/bytedance/sonic` | JSON 序列化（Gin 默认） |
| `github.com/go-playground/validator/v10` | 请求参数验证 |
| `github.com/json-iterator/go` | JSON 序列化备选 |

### 4.2 前端依赖（CDN）

**思维导图页面（index.html）**：

| 依赖 | 版本 | 用途 |
|------|------|------|
| D3.js | v7 | SVG 数据可视化 |
| marked | latest | Markdown 渲染 |
| highlight.js | v11 | 代码语法高亮 |

**编辑器页面（editor.html）**：

| 依赖 | 版本 | 用途 |
|------|------|------|
| CodeMirror 6 | 6.x（esm.sh） | 代码编辑器 |
| marked | latest | Markdown 渲染 |
| highlight.js | v11 | 代码语法高亮 |

### 4.3 模块间依赖关系

```
main.go
  ├── config.Config          （配置加载）
  ├── storage.Database       （SQLite 数据库）
  │     └── mattn/go-sqlite3
  ├── document.Manager       （文档管理）
  │     ├── config.DataDir
  │     └── config.StaticDir
  ├── user                   （用户认证）
  │     ├── golang-jwt/jwt
  │     └── golang.org/x/crypto/bcrypt
  ├── websocket.Hub          （WebSocket 中心）
  │     └── gorilla/websocket
  └── gin-gonic/gin          （HTTP 框架）
        └── gin-contrib/cors

editor.html
  ├── Editor.js
  │     └── CodeMirror 6 (esm.sh CDN)
  ├── Toolbar.js
  │     └── Editor.js
  ├── Outline.js
  │     └── Editor.js
  ├── LivePreview.js
  │     ├── marked (CDN)
  │     └── highlight.js (CDN)
  ├── SyncScroll.js
  │     ├── Editor.js
  │     └── LivePreview.js
  └── CollaborationManager.js
        └── WebSocket API

index.html
  ├── D3.js (CDN)
  ├── marked (CDN)
  └── highlight.js (CDN)
```

---

## 5. 数据流

### 5.1 思维导图浏览流程

```
用户打开 index.html
    │
    ▼
尝试从 /api/documents/all-md 加载内容
    │
    ├─ 成功 → 使用 API 返回的 content
    │
    └─ 失败 → 回退到 fetch('ALL.md') 加载静态文件
    │
    ▼
parseHeadings() 解析标题层级
    │
    ▼
buildHeadingTree() 构建树形结构
    │
    ▼
D3.hierarchy() + 布局算法 → SVG 渲染思维导图
    │
    ▼
用户交互（单击展开/折叠，双击查看详情）
    │
    ▼
showModal() → getSectionContent() → marked 渲染
```

### 5.2 协作编辑流程

```
用户打开 editor.html?doc=all-md&src=./mybook/...
    │
    ▼
从 /api/documents/:id?src=... 加载文档内容
    │
    ▼
初始化 CodeMirror 6 编辑器 + LivePreview
    │
    ▼
建立 WebSocket 连接 (/ws?docId=all-md&userId=...)
    │
    ▼
用户编辑 → onChange(300ms 防抖)
    │
    ├── 本地：LivePreview 渲染 + Outline 更新
    ├── 远程：CollaborationManager.sendChanges() → WebSocket 广播
    └── 自动保存：2s 防抖 → PUT /api/documents/:id
```

### 5.3 文档保存流程

```
编辑器触发保存
    │
    ▼
PUT /api/documents/:id (Content-Type: application/json)
    │
    ├── 有 src 参数 → resolveSrcPath() → 直接写源 .md 文件
    │
    └── 无 src 参数 → DocMgr.Save() → 写 data/documents/:id.md
    │
    ▼
Hub.Broadcast() → 通知所有在线客户端
    │
    ▼
客户端收到 document-saved → 重新加载内容
```

---

## 6. 项目运行方式

### 6.1 环境要求

| 依赖 | 版本 | 说明 |
|------|------|------|
| Go | >= 1.22 | 后端服务（需要 CGO 支持 SQLite） |
| GCC/Clang | - | CGO 编译 SQLite 驱动 |
| 浏览器 | 现代浏览器 | 支持 ES Module、WebSocket、CSS 变量 |

### 6.2 启动后端服务

```bash
cd onlinenote/server

# 安装依赖
go mod tidy

# 编译运行
go run cmd/main.go

# 或指定配置
PORT=9090 MARKDOWN_DIR=/path/to/src go run cmd/main.go
```

服务默认监听 `:8080`，启动后访问：
- 思维导图：`http://localhost:8080/`
- 编辑器：`http://localhost:8080/editor.html`

### 6.3 环境变量配置

```bash
export PORT=8080                              # 服务端口
export DATA_DIR=../data                       # 数据存储目录
export STATIC_DIR=../public                   # 静态文件目录
export MARKDOWN_DIR=../../src                 # Markdown 文件根目录
export JWT_SECRET=your-secret-key             # JWT 签名密钥
export WS_READ_SIZE=1048576                   # WebSocket 读缓冲区大小
export WS_WRITE_SIZE=1048576                  # WebSocket 写缓冲区大小
```

### 6.4 纯静态模式

如果不需要后端服务，可以仅使用静态文件：

```bash
cd onlinenote/public
python -m http.server 8080
# 或
npx serve .
```

注意：纯静态模式下，编辑保存和协作功能不可用，仅支持浏览思维导图。

---

## 7. 知识库命名规范

项目遵循严格的目录与文件命名规范（定义在 `.trae/rules/directory-naming-convention.md`）：

- **目录编号**：双数字格式 `{编号}_{名称}`，如 `01_go/`、`02_python/`
- **文件编号**：双数字格式 `{编号}_{中文名称}.md`，如 `01_介绍与环境搭建.md`
- **编号连续性**：避免跳号，插入新内容使用小数编号（如 `02.1_类型推断.md`）
- **ALL.md 索引**：使用 `<details>/<summary>` 折叠标签 + `> [📄 文件名.md](./路径)` 链接格式
- **特殊文件**：README.md、index.md、SUMMARY.md、assets/ 目录下的文件不受编号限制

---

## 8. 关键设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 后端框架 | Gin | 轻量高性能，Go 生态主流 |
| 数据库 | SQLite (WAL) | 单机部署零依赖，WAL 模式支持并发读写 |
| 前端框架 | 无框架（原生 JS） | 轻量独立，无构建依赖 |
| 编辑器 | CodeMirror 6 (esm.sh CDN) | 动态加载避免打包，性能优秀 |
| 可视化 | D3.js 自定义布局 | 灵活控制，支持多种布局模式 |
| 实时通信 | WebSocket (gorilla/websocket) | 双向通信，支持协作编辑 |
| 认证 | JWT (HS256) | 无状态认证，7 天有效期 |
| 密码存储 | bcrypt | 安全的密码哈希算法 |
| 文档存储 | 文件系统 + 内存缓存 | 简单可靠，支持直接编辑源 .md 文件 |
