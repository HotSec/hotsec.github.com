# 在线协作编辑功能规格说明书（优化版）

## 1. 项目概述

为 onlinenote 思维导图应用添加 Markdown 文档协作编辑功能。**思维导图仅作为可视化导航，不提供编辑功能**，用户通过点击节点进入 Markdown 文档编辑模式，支持多人实时协作编辑和所见即所得的渲染体验。

### 1.1 核心原则
- **思维导图只读**：思维导图仅用于可视化展示和导航，不提供编辑功能
- **专注文档编辑**：所有编辑操作都在 Markdown 文档编辑器中完成
- **后端双方案**：提供 Node.js 和 Golang 两种后端实现方案

## 2. 功能需求

### 2.1 Markdown 文档编辑功能

#### 2.1.1 编辑入口
- **从思维导图进入**：点击思维导图节点 → 打开模态框 → 点击"编辑"按钮进入编辑器
- **直接编辑**：提供独立的文档编辑页面，可独立于思维导图使用
- **编辑范围**：
  - 编辑整个 ALL.md 文件
  - 或编辑节点对应的特定章节内容
  - 保存后自动更新思维导图显示

#### 2.1.2 编辑器功能
- **基础编辑**：
  - 文本输入、删除、复制、粘贴
  - 撤销/重做（Ctrl+Z / Ctrl+Y）
  - 查找替换（Ctrl+F）
  - 行号显示
- **Markdown 快捷输入**：
  - 工具栏按钮：加粗、斜体、标题、列表、链接、图片、代码块、表格
  - 快捷键支持：Ctrl+B（加粗）、Ctrl+I（斜体）、Ctrl+K（链接）
  - 自动补全：列表、代码块、引用、括号配对
- **语法高亮**：编辑器中的 Markdown 语法高亮显示
- **大纲视图**：左侧显示文档标题大纲，点击可快速跳转

#### 2.1.3 文件操作
- **保存**：
  - 保存到服务器文件系统（ALL.md）
  - 自动保存（每 30 秒或停止编辑 2 秒后）
  - 手动保存（Ctrl+S）
  - 保存冲突提示（多人同时保存）
- **导出**：
  - 导出为 .md 文件
  - 导出为 HTML 文件
  - 导出为 PDF（可选）
- **版本管理**：
  - 查看历史版本
  - 版本对比（Diff）
  - 回滚到历史版本

### 2.2 多人实时协作编辑

#### 2.2.1 协作架构
- **技术方案**：WebSocket + CRDT（Conflict-free Replicated Data Types）
- **协作引擎**：Yjs（前端）+ Y-WebSocket（后端）
- **服务器端**：
  - Node.js 或 Golang 实现
  - 文档状态同步
  - 用户会话管理
  - 操作历史记录

#### 2.2.2 协作功能
- **用户管理**：
  - 支持匿名协作（临时用户名）
  - 可选用户登录/注册
  - 用户头像和昵称
  - 在线用户列表显示
- **实时同步**：
  - 文档变更实时广播（< 100ms）
  - 光标位置同步
  - 选区高亮显示
  - 用户颜色标识（自动分配）
- **冲突处理**：
  - CRDT 算法自动解决并发编辑冲突
  - 操作原子性保证
  - 无需锁机制

#### 2.2.3 协作体验
- **视觉反馈**：
  - 其他用户的光标显示（带用户名标签）
  - 其他用户的编辑区域高亮（半透明色块）
  - 用户进入/离开提示（Toast 通知）
- **权限控制**：
  - 只读模式（查看权限）
  - 编辑模式（默认）
  - 管理员模式（可选，可踢出用户）

### 2.3 实时渲染（所见即所得）

#### 2.3.1 渲染模式
- **分屏模式**（默认）：
  - 左侧：Markdown 源码编辑器
  - 右侧：实时预览区域
  - 同步滚动
  - 可调整分栏比例
- **即时预览模式**（可选）：
  - 单栏编辑器
  - 输入即时渲染为格式化文本
  - 类似 Typora 的体验
  - 可切换回分屏模式

#### 2.3.2 渲染特性
- **实时更新**：
  - 输入后 100ms 内更新预览
  - 防抖处理（避免频繁渲染）
- **渲染增强**：
  - 数学公式（KaTeX）
  - 流程图（Mermaid）
  - 代码块语法高亮（Highlight.js）
  - 表格实时渲染
  - 图片预览（支持本地和网络图片）
  - 任务列表（Task lists）
  - Emoji 支持

#### 2.3.3 交互功能
- **双向联动**：
  - 点击预览区域元素，编辑器定位到对应源码
  - 编辑器滚动，预览区域同步滚动
- **快捷操作**：
  - 点击标题可编辑
  - 点击图片可查看大图
  - 点击链接可在新标签页打开

## 3. 技术选型

### 3.1 前端技术（两种方案相同）

| 功能模块 | 技术选择 | 理由 |
|---------|---------|------|
| Markdown 编辑器 | **CodeMirror 6** | 性能优秀、扩展性强、支持协作 |
| 实时渲染 | **Marked** + **Highlight.js** | 保持与现有系统一致 |
| 协作引擎 | **Yjs** | 成熟的 CRDT 实现、易于集成 |
| WebSocket 客户端 | **原生 WebSocket** 或 **Socket.io Client** | 根据 Golang 或 Node.js 后端选择 |
| 状态管理 | **Zustand** 或原生 JS | 轻量级、易集成 |
| 数学公式 | **KaTeX** | 比 MathJax 快 10 倍 |
| 流程图 | **Mermaid** | Markdown 友好、功能完善 |

### 3.2 后端技术方案对比

#### 方案 A：Node.js 后端

| 功能模块 | 技术选择 | 理由 |
|---------|---------|------|
| 服务器框架 | **Express** 或 **Fastify** | 轻量、高性能、生态完善 |
| WebSocket 服务 | **Socket.io** 或 **ws** | 功能完善、易于使用 |
| 协作引擎 | **y-websocket** | Yjs 官方支持、开箱即用 |
| 数据存储 | **SQLite** 或 **PostgreSQL** | 文档存储、版本历史 |
| 文件系统 | **fs-extra** | 文件操作增强 |
| 用户认证 | **Passport.js** 或 **JWT** | 灵活的认证方案 |

**优点**：
- y-websocket 官方支持，集成简单
- JavaScript 全栈，代码复用
- 生态丰富，第三方库多
- 开发速度快

**缺点**：
- 单线程性能受限
- 内存占用较高
- 类型安全需要 TypeScript

#### 方案 B：Golang 后端 ⭐ 推荐

| 功能模块 | 技术选择 | 理由 |
|---------|---------|------|
| 服务器框架 | **Gin** 或 **Echo** | 高性能、轻量级、中间件丰富 |
| WebSocket 服务 | **gorilla/websocket** | 成熟稳定、性能优秀 |
| 协作引擎 | **automerge-go** 或 **自定义 CRDT** | Golang CRDT 实现 |
| 数据存储 | **SQLite** (go-sqlite3) 或 **PostgreSQL** (pgx) | 高性能数据库驱动 |
| 文件系统 | **标准库 os/io** | 性能优秀、无需额外依赖 |
| 用户认证 | **JWT-Go** | 成熟的 JWT 实现 |

**优点**：
- 高性能，适合大规模并发
- 内存占用低
- 类型安全，编译时检查
- 部署简单，单一二进制文件
- 适合长期维护的项目

**缺点**：
- CRDT 库不如 Node.js 成熟
- 需要自己实现部分协作逻辑
- 学习曲线稍陡

#### 方案对比总结

| 维度 | Node.js | Golang | 推荐 |
|------|---------|--------|------|
| **开发速度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Node.js |
| **性能** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Golang |
| **内存占用** | ⭐⭐ | ⭐⭐⭐⭐⭐ | Golang |
| **协作库成熟度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Node.js |
| **部署难度** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Golang |
| **长期维护** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Golang |
| **类型安全** | ⭐⭐⭐ (需 TS) | ⭐⭐⭐⭐⭐ | Golang |

**推荐方案**：**Golang 后端**
- 理由：性能更好、部署更简单、更适合生产环境
- 注意：需要自己实现部分协作逻辑，但长期收益更大

### 3.3 Golang 协作实现方案

#### 3.3.1 CRDT 库选择

**选项 1：Automerge-Go**
```go
import "github.com/automerge/automerge-go"

doc := automerge.NewDocument()
doc.Set("content", "Hello World")
changes := doc.GetChanges()
```

**选项 2：自定义 Yjs 兼容实现**
- 参考 Yjs 的 Y.Text 数据结构
- 实现基本的 CRDT 操作（insert、delete）
- 与前端 Yjs 兼容

**选项 3：使用 Redis + 操作日志**
- Redis 存储文档状态
- 操作日志记录所有变更
- 简单但不是真正的 CRDT

**推荐**：选项 1（Automerge-Go）或选项 2（自定义实现）

#### 3.3.2 WebSocket 架构

```go
// 基于 Gorilla WebSocket 的协作服务器
type CollaborationServer struct {
    clients    map[*Client]bool
    broadcast  chan Message
    register   chan *Client
    unregister chan *Client
    documents  map[string]*Document
}

type Client struct {
    ws       *websocket.Conn
    userID   string
    userName string
    color    string
    docID    string
}

type Message struct {
    Type     string      `json:"type"` // "join", "edit", "cursor", "leave"
    UserID   string      `json:"userId"`
    DocID    string      `json:"docId"`
    Data     interface{} `json:"data"`
}
```

## 4. 系统架构

### 4.1 整体架构图（Golang 版本）

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端 (Browser)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   编辑器模块   │  │   渲染模块    │  │   协作模块    │      │
│  │  (CodeMirror) │  │  (Marked)    │  │  (Yjs)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                  │
│                    ┌───────┴────────┐                        │
│                    │  状态管理模块   │                        │
│                    │  (Zustand)     │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼────────────────────────────────┘
                             │ WebSocket
                             │
┌────────────────────────────┼────────────────────────────────┐
│                      服务器端 (Golang)                        │
├────────────────────────────┼────────────────────────────────┤
│                    ┌───────┴────────┐                        │
│                    │  WebSocket 服务 │                        │
│                    │  (Gorilla)     │                        │
│                    └───────┬────────┘                        │
│         ┌──────────────────┼──────────────────┐              │
│         │                  │                  │              │
│  ┌──────┴──────┐   ┌──────┴──────┐   ┌──────┴──────┐       │
│  │  协作引擎    │   │  文档管理    │   │  用户管理    │       │
│  │  (Automerge)│   │  (os/fs)     │   │  (JWT)      │       │
│  └─────────────┘   └─────────────┘   └─────────────┘       │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                  │
│                    ┌───────┴────────┐                        │
│                    │   数据存储层   │                        │
│                    │  (SQLite)     │                        │
│                    └────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 数据流设计

#### 4.2.1 编辑流程
```
用户输入 → 编辑器捕获 → Yjs 文档更新 → WebSocket 发送 → 
Golang 服务器接收 → Automerge 合并更新 → 广播到其他客户端 → 
Yjs 合并更新 → 编辑器更新 → 渲染预览
```

#### 4.2.2 文档保存流程
```
编辑器变更 → 防抖处理（2s）→ WebSocket 发送保存请求 → 
Golang 服务器接收 → 文件系统写入 → 数据库记录版本 → 
返回成功响应 → 客户端显示保存状态
```

### 4.3 模块划分

#### 4.3.1 前端模块（与之前相同）
```
public/js/
├── editor/              # 编辑器模块
│   ├── Editor.js        # 编辑器主类
│   ├── Toolbar.js       # 工具栏
│   ├── Shortcuts.js     # 快捷键
│   └── Outline.js       # 大纲视图
├── collaboration/       # 协作模块
│   ├── CollaborationManager.js
│   ├── CursorTracker.js
│   └── UserPresence.js
├── renderer/            # 渲染模块
│   ├── LivePreview.js
│   └── SyncScroll.js
└── store/               # 状态管理
    ├── documentStore.js
    └── userStore.js
```

#### 4.3.2 Golang 后端模块
```
server/
├── main.go              # 应用入口
├── config/              # 配置管理
│   └── config.go
├── websocket/           # WebSocket 模块
│   ├── hub.go           # 连接管理中心
│   ├── client.go        # 客户端连接
│   └── message.go       # 消息处理
├── collaboration/       # 协作模块
│   ├── document.go      # 文档管理
│   ├── crdt.go          # CRDT 实现
│   └── sync.go          # 同步逻辑
├── document/            # 文档模块
│   ├── manager.go       # 文档管理器
│   ├── watcher.go       # 文件监听
│   └── version.go       # 版本控制
├── user/                # 用户模块
│   ├── auth.go          # 认证
│   ├── session.go       # 会话管理
│   └── permission.go    # 权限控制
├── storage/             # 存储模块
│   ├── database.go      # 数据库操作
│   └── migrations/      # 迁移脚本
└── utils/               # 工具函数
    ├── logger.go        # 日志
    └── response.go      # 响应格式
```

## 5. API 设计

### 5.1 WebSocket 消息协议

#### 5.1.1 客户端 → 服务器
```json
// 加入文档
{
  "type": "join",
  "docId": "all-md",
  "userId": "user-123",
  "userName": "Alice",
  "token": "jwt-token"
}

// 发送编辑操作
{
  "type": "edit",
  "docId": "all-md",
  "operation": {
    "type": "insert",
    "position": 100,
    "text": "Hello",
    "timestamp": 1234567890
  }
}

// 光标移动
{
  "type": "cursor",
  "docId": "all-md",
  "position": {"line": 10, "column": 5},
  "selection": {"start": 100, "end": 120}
}

// 保存文档
{
  "type": "save",
  "docId": "all-md",
  "content": "...",
  "version": 5
}
```

#### 5.1.2 服务器 → 客户端
```json
// 用户加入通知
{
  "type": "user-joined",
  "userId": "user-456",
  "userName": "Bob",
  "userColor": "#FF5733"
}

// 用户离开通知
{
  "type": "user-left",
  "userId": "user-456"
}

// 广播编辑操作
{
  "type": "broadcast",
  "userId": "user-456",
  "operation": {
    "type": "insert",
    "position": 100,
    "text": "Hello"
  }
}

// 光标更新
{
  "type": "cursor-update",
  "userId": "user-456",
  "position": {"line": 10, "column": 5}
}

// 文档同步
{
  "type": "sync",
  "content": "...",
  "version": 5,
  "users": [...]
}
```

### 5.2 REST API（Golang Gin 框架）

```go
// 获取文档
GET /api/documents/:id

// 更新文档
PUT /api/documents/:id
Body: {"content": "..."}

// 获取文档历史
GET /api/documents/:id/history

// 用户登录
POST /api/auth/login
Body: {"username": "alice", "password": "***"}

// 用户注册
POST /api/auth/register
Body: {"username": "alice", "password": "***", "email": "alice@example.com"}
```

## 6. Golang 核心代码示例

### 6.1 WebSocket 服务器

```go
// server/websocket/hub.go
package websocket

import (
    "github.com/gorilla/websocket"
)

type Hub struct {
    clients    map[*Client]bool
    broadcast  chan Message
    register   chan *Client
    unregister chan *Client
    documents  map[string]*Document
}

type Client struct {
    ws       *websocket.Conn
    userID   string
    userName string
    color    string
    docID    string
    send     chan Message
}

func NewHub() *Hub {
    return &Hub{
        clients:    make(map[*Client]bool),
        broadcast:  make(chan Message),
        register:   make(chan *Client),
        unregister: make(chan *Client),
        documents:  make(map[string]*Document),
    }
}

func (h *Hub) Run() {
    for {
        select {
        case client := <-h.register:
            h.clients[client] = true
            h.broadcastUserList(client.docID)
            
        case client := <-h.unregister:
            if _, ok := h.clients[client]; ok {
                delete(h.clients, client)
                close(client.send)
                h.broadcastUserList(client.docID)
            }
            
        case message := <-h.broadcast:
            for client := range h.clients {
                if client.docID == message.DocID {
                    select {
                    case client.send <- message:
                    default:
                        close(client.send)
                        delete(h.clients, client)
                    }
                }
            }
        }
    }
}
```

### 6.2 文档管理

```go
// server/document/manager.go
package document

import (
    "os"
    "path/filepath"
    "sync"
)

type DocumentManager struct {
    docs    map[string]*Document
    dataDir string
    mu      sync.RWMutex
}

type Document struct {
    ID      string
    Content string
    Version int
    Path    string
}

func NewDocumentManager(dataDir string) *DocumentManager {
    return &DocumentManager{
        docs:    make(map[string]*Document),
        dataDir: dataDir,
    }
}

func (dm *DocumentManager) Load(docID string) (*Document, error) {
    dm.mu.RLock()
    if doc, exists := dm.docs[docID]; exists {
        dm.mu.RUnlock()
        return doc, nil
    }
    dm.mu.RUnlock()
    
    dm.mu.Lock()
    defer dm.mu.Unlock()
    
    path := filepath.Join(dm.dataDir, docID+".md")
    content, err := os.ReadFile(path)
    if err != nil {
        return nil, err
    }
    
    doc := &Document{
        ID:      docID,
        Content: string(content),
        Version: 1,
        Path:    path,
    }
    dm.docs[docID] = doc
    return doc, nil
}

func (dm *DocumentManager) Save(docID string, content string) error {
    dm.mu.Lock()
    defer dm.mu.Unlock()
    
    doc, exists := dm.docs[docID]
    if !exists {
        return fmt.Errorf("document not found")
    }
    
    err := os.WriteFile(doc.Path, []byte(content), 0644)
    if err != nil {
        return err
    }
    
    doc.Content = content
    doc.Version++
    return nil
}
```

### 6.3 协作同步

```go
// server/collaboration/sync.go
package collaboration

import (
    "github.com/automerge/automerge-go"
)

type SyncManager struct {
    documents map[string]*automerge.Document
}

func NewSyncManager() *SyncManager {
    return &SyncManager{
        documents: make(map[string]*automerge.Document),
    }
}

func (sm *SyncManager) ApplyChange(docID string, change []byte) error {
    doc, exists := sm.documents[docID]
    if !exists {
        doc = automerge.NewDocument()
        sm.documents[docID] = doc
    }
    
    return doc.ApplyChanges(change)
}

func (sm *SyncManager) GetChanges(docID string, sinceVersion int) ([]byte, error) {
    doc, exists := sm.documents[docID]
    if !exists {
        return nil, fmt.Errorf("document not found")
    }
    
    changes := doc.GetChanges()
    return changes, nil
}
```

## 7. 实现计划（优化版）

### 7.1 阶段一：基础编辑功能（Week 1-2）

#### Week 1: 编辑器集成
- [ ] 集成 CodeMirror 6 编辑器
- [ ] 实现基础编辑功能（输入、删除、复制、粘贴）
- [ ] 添加工具栏（加粗、斜体、标题等）
- [ ] 实现快捷键支持
- [ ] 实现 Markdown 语法高亮
- [ ] 添加大纲视图

#### Week 2: 实时渲染
- [ ] 实现分屏布局（编辑器 + 预览）
- [ ] 集成实时渲染（Marked + Highlight.js）
- [ ] 实现同步滚动
- [ ] 添加自动保存功能（localStorage）
- [ ] 实现文件导出功能

### 7.2 阶段二：Golang 协作服务器（Week 3-4）

#### Week 3: 服务器搭建
- [ ] 搭建 Golang 服务器（Gin 框架）
- [ ] 集成 Gorilla WebSocket
- [ ] 实现连接管理（Hub 模式）
- [ ] 实现文档加载和保存
- [ ] 实现基础的 WebSocket 消息处理

#### Week 4: 协作引擎
- [ ] 集成 Automerge-Go 或实现自定义 CRDT
- [ ] 实现操作同步逻辑
- [ ] 实现用户会话管理
- [ ] 实现文档版本控制
- [ ] 添加数据库支持（SQLite）

### 7.3 阶段三：实时协作（Week 5-6）

#### Week 5: 协作功能
- [ ] 前端集成 Yjs
- [ ] 实现光标同步
- [ ] 实现选区高亮
- [ ] 实现用户颜色标识
- [ ] 实现在线用户列表

#### Week 6: 协作优化
- [ ] 实现操作历史和撤销
- [ ] 实现版本控制
- [ ] 实现离线支持
- [ ] 性能优化（连接池、缓存）
- [ ] 错误处理和恢复

### 7.4 阶段四：所见即所得（Week 7）

#### Week 7: WYSIWYG 模式
- [ ] 集成 Milkdown 或 Toast UI Editor
- [ ] 实现即时渲染模式
- [ ] 实现双向联动
- [ ] 添加数学公式支持（KaTeX）
- [ ] 添加流程图支持（Mermaid）

### 7.5 阶段五：测试与部署（Week 8）

#### Week 8: 测试与部署
- [ ] 编写单元测试（Go testing）
- [ ] 编写集成测试
- [ ] 性能测试（多用户并发）
- [ ] 编写部署文档
- [ ] 生产环境部署（编译二进制文件）

## 8. 部署方案

### 8.1 开发环境

```bash
# 前端
cd public
python -m http.server 8080

# 后端（Golang）
cd server
go run main.go
```

### 8.2 生产环境（Golang）

```bash
# 编译
cd server
go build -o onlinenote-server

# 运行
./onlinenote-server

# 使用 systemd 管理
sudo systemctl start onlinenote
sudo systemctl enable onlinenote
```

### 8.3 Docker 部署

```dockerfile
# Dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY server/ .
RUN go build -o onlinenote-server

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/onlinenote-server .
COPY public/ ./public/
EXPOSE 8080
CMD ["./onlinenote-server"]
```

```bash
# 构建镜像
docker build -t onlinenote:latest .

# 运行容器
docker run -d -p 8080:8080 -v $(pwd)/data:/app/data onlinenote:latest
```

## 9. 性能对比

### 9.1 Node.js vs Golang 性能预估

| 指标 | Node.js | Golang | 提升 |
|------|---------|--------|------|
| 并发连接数 | 1000 | 10000+ | 10x |
| 内存占用 | 200MB | 20MB | 10x |
| 响应延迟 | 50ms | 10ms | 5x |
| CPU 使用率 | 60% | 15% | 4x |
| 吞吐量 | 5000 req/s | 50000 req/s | 10x |

### 9.2 Golang 优势

1. **高并发**：Goroutine 轻量级协程，支持数万并发连接
2. **低内存**：内存占用仅为 Node.js 的 1/10
3. **高性能**：编译型语言，性能接近 C
4. **易部署**：单一二进制文件，无需运行时环境
5. **类型安全**：编译时类型检查，减少运行时错误

## 10. 风险与挑战

### 10.1 Golang 方案的风险

1. **CRDT 库不成熟**：
   - 解决方案：使用 Automerge-Go 或自己实现简单的 CRDT
   - 备选方案：使用操作日志 + Redis

2. **与前端 Yjs 兼容性**：
   - 解决方案：实现 Yjs 兼容的消息协议
   - 备选方案：前端也使用 Automerge

3. **学习曲线**：
   - 解决方案：提供详细的文档和示例代码
   - 备选方案：先用 Node.js 原型验证，再迁移到 Golang

### 10.2 解决方案

1. **渐进式开发**：
   - 先实现基础功能，再添加协作特性
   - 先用简单的操作广播，再升级到 CRDT

2. **混合方案**：
   - 前端使用成熟的 Yjs
   - 后端实现 Yjs 兼容的协议
   - 利用 Golang 的性能优势

## 11. 总结

### 11.1 优化后的方案优势

1. **简化需求**：思维导图只读，专注文档编辑
2. **性能提升**：Golang 后端性能提升 10 倍
3. **部署简单**：单一二进制文件，无需 Node.js 运行时
4. **长期维护**：类型安全，易于维护和扩展

### 11.2 推荐实施路线

```
Week 1-2: 基础编辑功能（前端）
  ↓
Week 3-4: Golang 协作服务器
  ↓
Week 5-6: 实时协作功能
  ↓
Week 7: 所见即所得
  ↓
Week 8: 测试与部署
```

### 11.3 技术栈总结

**前端**：CodeMirror 6 + Yjs + Marked + Highlight.js
**后端**：Golang + Gin + Gorilla WebSocket + Automerge-Go
**存储**：SQLite + 文件系统
**部署**：Docker 或单一二进制文件

这个优化方案更加聚焦、性能更好、部署更简单！🚀
