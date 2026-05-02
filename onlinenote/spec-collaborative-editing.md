# 在线协作编辑功能规格说明书

## 1. 项目概述

为 onlinenote 思维导图应用添加实时协作编辑功能，支持多人同时编辑 Markdown 文档，并提供所见即所得的实时渲染体验。

## 2. 功能需求

### 2.1 Markdown 文档编辑功能

#### 2.1.1 编辑模式
- **入口**：点击节点后，在模态框中提供"编辑"按钮
- **编辑器类型**：分屏编辑器（左侧编辑，右侧预览）
- **编辑范围**：
  - 支持编辑当前节点对应的 Markdown 内容
  - 支持创建新节点
  - 支持删除节点
  - 支持调整节点层级

#### 2.1.2 编辑器功能
- **基础编辑**：
  - 文本输入、删除、复制、粘贴
  - 撤销/重做（Ctrl+Z / Ctrl+Y）
  - 查找替换（Ctrl+F）
- **Markdown 快捷输入**：
  - 工具栏按钮：加粗、斜体、标题、列表、链接、图片、代码块
  - 快捷键支持：Ctrl+B（加粗）、Ctrl+I（斜体）、Ctrl+K（链接）
  - 自动补全：列表、代码块、引用
- **语法高亮**：编辑器中的 Markdown 语法高亮显示

#### 2.1.3 文件操作
- **保存**：
  - 本地保存到 ALL.md
  - 自动保存（防丢失）
  - 手动保存（Ctrl+S）
- **导出**：
  - 导出为 .md 文件
  - 导出为 HTML 文件
  - 导出为 PDF（可选）

### 2.2 多人实时协作编辑

#### 2.2.1 协作架构
- **技术方案**：WebSocket + Operational Transformation (OT) 或 CRDT
- **服务器端**：
  - Node.js + WebSocket Server (Socket.io 或 ws)
  - 文档状态管理
  - 用户会话管理
  - 操作历史记录

#### 2.2.2 协作功能
- **用户管理**：
  - 用户登录/注册（可选，支持匿名协作）
  - 用户头像和昵称
  - 在线用户列表显示
- **实时同步**：
  - 文档变更实时广播
  - 光标位置同步
  - 选区高亮显示
  - 用户颜色标识
- **冲突处理**：
  - OT 算法解决并发编辑冲突
  - 操作原子性保证
  - 版本历史记录

#### 2.2.3 协作体验
- **视觉反馈**：
  - 其他用户的光标显示（带用户名）
  - 其他用户的编辑区域高亮
  - 用户进入/离开提示
- **权限控制**：
  - 只读模式
  - 编辑模式
  - 管理员模式（可选）

### 2.3 实时渲染（所见即所得）

#### 2.3.1 渲染模式
- **分屏模式**：
  - 左侧：Markdown 源码编辑器
  - 右侧：实时预览区域
  - 同步滚动
- **即时预览模式**：
  - 单栏编辑器
  - 输入即时渲染为格式化文本
  - 类似 Typora 的体验

#### 2.3.2 渲染特性
- **实时更新**：
  - 输入后 100ms 内更新预览
  - 防抖处理（避免频繁渲染）
- **渲染增强**：
  - 数学公式（KaTeX 或 MathJax）
  - 流程图（Mermaid）
  - 代码块语法高亮
  - 表格实时渲染
  - 图片预览

#### 2.3.3 交互功能
- **双向联动**：
  - 点击预览区域元素，编辑器定位到对应源码
  - 编辑器滚动，预览区域同步滚动
- **快捷操作**：
  - 点击标题可编辑
  - 点击图片可替换
  - 点击链接可修改

## 3. 技术选型

### 3.1 前端技术

| 功能模块 | 技术选择 | 理由 |
|---------|---------|------|
| Markdown 编辑器 | **CodeMirror 6** 或 **Monaco Editor** | 功能强大、支持协作、插件丰富 |
| 实时渲染 | **Marked** + **highlight.js**（已有） | 保持一致性，性能优秀 |
| 所见即所得 | **Milkdown** 或 **Toast UI Editor** | 专为 WYSIWYG 设计，支持协作 |
| WebSocket 客户端 | **Socket.io Client** | 自动重连、房间管理、降级支持 |
| 状态管理 | **Zustand** 或 **Jotai** | 轻量级、易集成 |
| 数学公式 | **KaTeX** | 比 MathJax 快 10 倍 |
| 流程图 | **Mermaid** | Markdown 友好、功能完善 |

### 3.2 后端技术

| 功能模块 | 技术选择 | 理由 |
|---------|---------|------|
| 服务器框架 | **Node.js + Express** 或 **Fastify** | 轻量、高性能、生态完善 |
| WebSocket 服务 | **Socket.io** 或 **ws** | 功能完善、易于使用 |
| 协作算法 | **ShareDB** 或 **Yjs** | 成熟的 OT/CRDT 实现 |
| 数据存储 | **SQLite** 或 **PostgreSQL** | 文档存储、版本历史 |
| 文件系统 | **fs-extra** | 文件操作增强 |
| 用户认证 | **Passport.js** 或 **JWT** | 灵活的认证方案 |

### 3.3 协作算法对比

| 算法 | 代表库 | 优点 | 缺点 | 推荐度 |
|------|--------|------|------|--------|
| OT (Operational Transformation) | ShareDB | 成熟稳定、冲突处理完善 | 实现复杂、中心化 | ⭐⭐⭐⭐ |
| CRDT (Conflict-free Replicated Data Types) | Yjs | 去中心化、P2P 支持 | 学习曲线陡峭 | ⭐⭐⭐⭐⭐ |
| 自定义 OT | - | 完全可控 | 开发成本高 | ⭐⭐ |

**推荐方案**：使用 **Yjs + Socket.io**，原因：
- Yjs 提供完善的 CRDT 实现
- 性能优秀，支持大规模协作
- 与各种编辑器集成良好
- 支持离线编辑和同步

## 4. 系统架构

### 4.1 整体架构图

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
│                      服务器端 (Node.js)                       │
├────────────────────────────┼────────────────────────────────┤
│                    ┌───────┴────────┐                        │
│                    │  WebSocket 服务 │                        │
│                    │  (Socket.io)   │                        │
│                    └───────┬────────┘                        │
│         ┌──────────────────┼──────────────────┐              │
│         │                  │                  │              │
│  ┌──────┴──────┐   ┌──────┴──────┐   ┌──────┴──────┐       │
│  │  协作引擎    │   │  文档管理    │   │  用户管理    │       │
│  │  (Yjs)      │   │  (fs-extra) │   │  (JWT)      │       │
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
用户输入 → 编辑器捕获 → Yjs 文档更新 → WebSocket 广播 → 
服务器分发 → 其他客户端接收 → Yjs 合并更新 → 编辑器更新 → 渲染预览
```

#### 4.2.2 文档保存流程
```
编辑器变更 → 防抖处理 → 本地存储（自动保存）→ 
WebSocket 发送 → 服务器接收 → 文件系统写入 → 数据库记录版本
```

### 4.3 模块划分

#### 4.3.1 前端模块
```
src/
├── editor/              # 编辑器模块
│   ├── Editor.js        # 编辑器主类
│   ├── Toolbar.js       # 工具栏
│   ├── Shortcuts.js     # 快捷键
│   └── AutoComplete.js  # 自动补全
├── collaboration/       # 协作模块
│   ├── CollaborationManager.js  # 协作管理器
│   ├── CursorTracker.js         # 光标追踪
│   ├── UserPresence.js          # 用户在线状态
│   └── ConflictResolver.js      # 冲突解决
├── renderer/            # 渲染模块
│   ├── LivePreview.js   # 实时预览
│   ├── WYSIWYG.js       # 所见即所得
│   └── SyncScroll.js    # 同步滚动
├── store/               # 状态管理
│   ├── documentStore.js # 文档状态
│   ├── userStore.js     # 用户状态
│   └── settingsStore.js # 设置状态
└── utils/               # 工具函数
    ├── markdown.js      # Markdown 工具
    ├── storage.js       # 存储工具
    └── websocket.js     # WebSocket 工具
```

#### 4.3.2 后端模块
```
server/
├── app.js               # 应用入口
├── websocket/           # WebSocket 模块
│   ├── socketServer.js  # Socket 服务器
│   ├── roomManager.js   # 房间管理
│   └── messageHandler.js# 消息处理
├── collaboration/       # 协作模块
│   ├── yjsServer.js     # Yjs 服务器
│   ├── documentSync.js  # 文档同步
│   └── versionControl.js# 版本控制
├── document/            # 文档模块
│   ├── documentManager.js # 文档管理
│   ├── fileWatcher.js   # 文件监听
│   └── autoSave.js      # 自动保存
├── user/                # 用户模块
│   ├── auth.js          # 认证
│   ├── session.js       # 会话管理
│   └── permission.js    # 权限控制
└── storage/             # 存储模块
    ├── database.js      # 数据库
    └── migrations.js    # 迁移脚本
```

## 5. API 设计

### 5.1 WebSocket 事件

#### 5.1.1 客户端 → 服务器
```javascript
// 加入文档房间
socket.emit('join-document', { 
  documentId: 'all-md',
  userId: 'user-123',
  token: 'jwt-token'
})

// 发送编辑操作
socket.emit('edit-operation', {
  documentId: 'all-md',
  operation: { type: 'insert', position: 100, text: 'Hello' }
})

// 光标移动
socket.emit('cursor-move', {
  documentId: 'all-md',
  position: { line: 10, column: 5 },
  selection: { start: 100, end: 120 }
})

// 保存文档
socket.emit('save-document', {
  documentId: 'all-md',
  content: '...'
})
```

#### 5.1.2 服务器 → 客户端
```javascript
// 用户加入通知
socket.on('user-joined', {
  userId: 'user-456',
  userName: 'Alice',
  userColor: '#FF5733'
})

// 用户离开通知
socket.on('user-left', {
  userId: 'user-456'
})

// 接收编辑操作
socket.on('remote-operation', {
  userId: 'user-456',
  operation: { type: 'insert', position: 100, text: 'Hello' }
})

// 光标更新
socket.on('cursor-update', {
  userId: 'user-456',
  position: { line: 10, column: 5 },
  selection: { start: 100, end: 120 }
})

// 文档同步
socket.on('document-sync', {
  content: '...',
  version: 5,
  users: [...]
})
```

### 5.2 REST API

```javascript
// 获取文档
GET /api/documents/:id

// 创建文档
POST /api/documents
Body: { title: 'New Document', content: '' }

// 更新文档
PUT /api/documents/:id
Body: { content: '...' }

// 获取文档历史
GET /api/documents/:id/history

// 用户登录
POST /api/auth/login
Body: { username: 'alice', password: '***' }

// 用户注册
POST /api/auth/register
Body: { username: 'alice', password: '***', email: 'alice@example.com' }
```

## 6. 数据模型

### 6.1 文档模型
```javascript
{
  id: 'doc-123',
  title: '知识点总结',
  content: '# 知识点总结\n...',
  path: '/ALL.md',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  version: 15,
  collaborators: ['user-123', 'user-456'],
  metadata: {
    nodeCount: 39,
    wordCount: 5000
  }
}
```

### 6.2 用户模型
```javascript
{
  id: 'user-123',
  username: 'alice',
  email: 'alice@example.com',
  avatar: 'https://...',
  color: '#FF5733',  // 协作时的标识颜色
  createdAt: '2024-01-01T00:00:00Z',
  lastActiveAt: '2024-01-15T10:30:00Z'
}
```

### 6.3 操作日志模型
```javascript
{
  id: 'op-123',
  documentId: 'doc-123',
  userId: 'user-123',
  operation: {
    type: 'insert',
    position: 100,
    text: 'Hello',
    timestamp: '2024-01-15T10:30:00Z'
  },
  version: 15
}
```

## 7. 实现计划

### 7.1 阶段一：基础编辑功能（2 周）

#### Week 1: 编辑器集成
- [ ] 集成 CodeMirror 6 编辑器
- [ ] 实现基础编辑功能（输入、删除、复制、粘贴）
- [ ] 添加工具栏（加粗、斜体、标题等）
- [ ] 实现快捷键支持
- [ ] 实现 Markdown 语法高亮

#### Week 2: 实时渲染
- [ ] 实现分屏布局（编辑器 + 预览）
- [ ] 集成实时渲染（Marked + highlight.js）
- [ ] 实现同步滚动
- [ ] 添加自动保存功能
- [ ] 实现文件导出功能

### 7.2 阶段二：协作服务器（2 周）

#### Week 3: 服务器搭建
- [ ] 搭建 Node.js 服务器
- [ ] 集成 Socket.io
- [ ] 实现房间管理
- [ ] 集成 Yjs 协作引擎
- [ ] 实现文档持久化

#### Week 4: 用户系统
- [ ] 实现用户认证（JWT）
- [ ] 实现会话管理
- [ ] 实现用户在线状态
- [ ] 实现权限控制
- [ ] 添加数据库支持（SQLite）

### 7.3 阶段三：实时协作（2 周）

#### Week 5: 协作功能
- [ ] 实现光标同步
- [ ] 实现选区高亮
- [ ] 实现用户颜色标识
- [ ] 实现操作广播
- [ ] 实现冲突解决

#### Week 6: 协作优化
- [ ] 实现操作历史和撤销
- [ ] 实现版本控制
- [ ] 实现离线支持
- [ ] 性能优化
- [ ] 错误处理和恢复

### 7.4 阶段四：所见即所得（1 周）

#### Week 7: WYSIWYG 模式
- [ ] 集成 Milkdown 或 Toast UI Editor
- [ ] 实现即时渲染模式
- [ ] 实现双向联动
- [ ] 添加数学公式支持（KaTeX）
- [ ] 添加流程图支持（Mermaid）

### 7.5 阶段五：测试与优化（1 周）

#### Week 8: 测试与部署
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能测试（多用户并发）
- [ ] 部署文档编写
- [ ] 生产环境部署

## 8. 文件结构（更新后）

```
onlinenote/
├── public/              # 静态文件
│   ├── index.html       # 主页面
│   ├── css/
│   │   ├── main.css     # 主样式
│   │   ├── editor.css   # 编辑器样式
│   │   └── collaboration.css  # 协作样式
│   └── js/
│       ├── main.js      # 主入口
│       ├── editor.js    # 编辑器模块
│       ├── collaboration.js  # 协作模块
│       └── renderer.js  # 渲染模块
├── server/              # 服务器端代码
│   ├── app.js           # 应用入口
│   ├── websocket/       # WebSocket 模块
│   ├── collaboration/   # 协作模块
│   ├── document/        # 文档模块
│   ├── user/            # 用户模块
│   └── storage/         # 存储模块
├── data/                # 数据目录
│   ├── documents/       # 文档存储
│   ├── database.sqlite  # SQLite 数据库
│   └── backups/         # 备份目录
├── tests/               # 测试文件
│   ├── unit/            # 单元测试
│   ├── integration/     # 集成测试
│   └── e2e/             # 端到端测试
├── ALL.md               # 数据源
├── config.json          # 配置文件
├── package.json         # NPM 配置
├── .env                 # 环境变量
└── README.md            # 项目文档
```

## 9. 部署方案

### 9.1 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动 WebSocket 服务器
npm run server:dev
```

### 9.2 生产环境
```bash
# 构建
npm run build

# 启动生产服务器
npm start

# 使用 PM2 管理
pm2 start server/app.js --name onlinenote
```

### 9.3 Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 10. 安全考虑

### 10.1 认证与授权
- 使用 JWT 进行用户认证
- 实现 Token 刷新机制
- 设置合理的过期时间
- 实现 HTTPS 加密传输

### 10.2 数据安全
- 密码加密存储（bcrypt）
- 定期备份文档数据
- 实现版本回滚
- 防止 SQL 注入

### 10.3 协作安全
- 验证用户权限
- 限制操作频率
- 防止恶意操作
- 实现操作审计日志

## 11. 性能优化

### 11.1 前端优化
- 虚拟滚动（大文档）
- 增量渲染
- 防抖和节流
- 懒加载模块

### 11.2 后端优化
- 连接池管理
- 文档缓存
- 压缩传输数据
- 负载均衡

### 11.3 协作优化
- 操作批处理
- 增量同步
- 历史记录压缩
- 断线重连优化

## 12. 监控与日志

### 12.1 日志系统
- 操作日志
- 错误日志
- 性能日志
- 访问日志

### 12.2 监控指标
- 在线用户数
- 文档编辑频率
- 服务器响应时间
- WebSocket 连接状态

## 13. 未来扩展

### 13.1 功能扩展
- 评论和批注功能
- 文档分享和权限管理
- 版本对比和合并
- 模板系统
- AI 辅助写作

### 13.2 集成扩展
- Git 集成（版本控制）
- 云存储集成（S3、OSS）
- 第三方登录（GitHub、Google）
- Webhook 支持

## 14. 风险与挑战

### 14.1 技术风险
- **并发冲突**：使用成熟的 CRDT 算法（Yjs）降低风险
- **性能问题**：大文档编辑和渲染性能，需要虚拟滚动和增量渲染
- **网络延迟**：WebSocket 断线重连，离线缓存

### 14.2 实现挑战
- **编辑器集成**：CodeMirror 6 学习曲线陡峭
- **协作算法**：CRDT 理解和调试困难
- **实时渲染**：性能和准确性的平衡

### 14.3 解决方案
- 充分的技术调研和原型验证
- 渐进式开发，逐步完善功能
- 完善的测试和监控体系
- 详细的文档和代码注释

## 15. 验收标准

### 15.1 功能验收
- [ ] 编辑器支持所有基础编辑功能
- [ ] 实时渲染延迟 < 100ms
- [ ] 多人协作时无冲突或冲突自动解决
- [ ] 光标和选区同步准确
- [ ] 文档自动保存正常工作
- [ ] 支持至少 10 人同时编辑

### 15.2 性能验收
- [ ] 文档加载时间 < 1s（100KB 文档）
- [ ] 输入响应时间 < 50ms
- [ ] 协作同步延迟 < 200ms（局域网）
- [ ] 支持 100+ 并发连接

### 15.3 稳定性验收
- [ ] 连续运行 24 小时无崩溃
- [ ] 断线重连成功率 > 99%
- [ ] 数据丢失率 = 0
- [ ] 错误恢复时间 < 5s

## 16. 参考资料

### 16.1 技术文档
- [CodeMirror 6 官方文档](https://codemirror.net/6/)
- [Yjs 官方文档](https://docs.yjs.dev/)
- [Socket.io 官方文档](https://socket.io/docs/)
- [CRDT 技术介绍](https://crdt.tech/)

### 16.2 类似项目
- [Notion](https://www.notion.so/) - 协作文档
- [HackMD](https://hackmd.io/) - Markdown 协作
- [Typora](https://typora.io/) - 所见即所得 Markdown
- [Excalidraw](https://excalidraw.com/) - 协作白板

### 16.3 学术论文
- "Operational Transformation in Collaborative Editing Systems"
- "CRDTs for the Humanities"
- "Conflict-free Replicated Data Types"
