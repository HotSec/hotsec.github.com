# 在线 Markdown 多人实时编辑

基于 Yjs CRDT + Golang WebSocket Hub 的实时协作编辑器。

## 技术栈

- **前端**：React + CodeMirror 6 + Yjs
- **后端**：Golang + gorilla/websocket
- **存储**：PostgreSQL + Redis
- **部署**：Docker Compose + Nginx

## 快速开始

### 本地开发

```bash
# 1. 启动基础设施
docker-compose up -d db redis

# 2. 启动后端
cd backend
go mod tidy
go run .

# 3. 启动前端（新终端）
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

### Docker 部署

```bash
docker-compose up -d
```

访问 http://localhost

## 项目结构

```
onlinemd/
├── backend/                 # Golang 后端
│   ├── main.go             # 入口 + JWT 认证
│   ├── hub.go              # Room 管理 + Redis Pub/Sub
│   ├── client.go           # WebSocket 连接处理
│   ├── store.go            # PostgreSQL 持久化
│   ├── go.mod
│   └── Dockerfile
├── frontend/                # React 前端
│   ├── src/
│   │   ├── App.tsx
│   │   ├── CollabEditor.tsx    # CodeMirror + Yjs
│   │   ├── OnlineUsers.tsx     # 在线用户列表
│   │   └── main.tsx
│   ├── package.json
│   └── Dockerfile
├── config/
│   └── nginx.conf          # Nginx 配置
├── docker-compose.yml
└── README.md
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接串 | `postgres://postgres:secret@localhost/docs?sslmode=disable` |
| `REDIS_URL` | Redis 地址 | `localhost:6379` |
| `JWT_SECRET` | JWT 签名密钥 | `dev-secret` |

## API

### WebSocket `/ws?doc={docId}&token={jwt}`

- 连接后自动发送历史快照（如有）
- 接收 Yjs 二进制消息并广播给同 Room 用户
- 每 50 次操作自动持久化到 PostgreSQL

## 测试 Token

开发环境可使用任意字符串作为 token，生产环境需替换为有效 JWT。
