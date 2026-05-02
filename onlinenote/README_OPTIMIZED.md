# 优化方案快速参考

## 🎯 核心优化

### 1. 简化需求
- **思维导图**：只读，仅作为导航
- **编辑功能**：专注 Markdown 文档编辑

### 2. 后端升级
- **从 Node.js 升级到 Golang**
- **性能提升 10 倍**
- **内存占用降低 10 倍**

## 📚 文档导航

### 核心文档（必读）

1. **[spec-collaborative-editing-v2.md](./spec-collaborative-editing-v2.md)** ⭐
   - 完整的功能规格说明书
   - Golang 后端实现方案
   - 系统架构设计
   - API 接口规范

2. **[tasks-collaborative-editing-v2.md](./tasks-collaborative-editing-v2.md)** ⭐
   - 39 个具体任务
   - 按阶段组织（5 个阶段）
   - 详细的验收标准

3. **[OPTIMIZATION_COMPARISON.md](./OPTIMIZATION_COMPARISON.md)**
   - 优化前后对比
   - Node.js vs Golang 详细对比
   - 风险评估

### 参考文档（可选）

4. **[spec-collaborative-editing.md](./spec-collaborative-editing.md)**
   - 原始 Node.js 方案
   - 思维导图可编辑版本

5. **[tasks-collaborative-editing.md](./tasks-collaborative-editing.md)**
   - 原始任务分解
   - Node.js 后端任务

## 🚀 快速开始

### 技术栈

**前端**：
- CodeMirror 6（编辑器）
- Yjs（协作引擎）
- Marked + Highlight.js（渲染）

**后端**：
- Gin（Web 框架）
- Gorilla WebSocket（实时通信）
- Automerge-Go（CRDT）
- SQLite（数据库）

### 开发环境

```bash
# 前端
cd public
python -m http.server 8080

# 后端
cd server
go run main.go
```

### 生产部署

```bash
# 编译
go build -o onlinenote-server

# 运行
./onlinenote-server

# Docker
docker build -t onlinenote .
docker run -p 8080:8080 onlinenote
```

## 📅 实施计划（8 周）

```
Week 1-2: 基础编辑功能
  ├─ CodeMirror 6 集成
  ├─ 实时渲染
  └─ 自动保存

Week 3-4: Golang 协作服务器
  ├─ Gin + WebSocket
  ├─ 文档管理
  └─ 用户认证

Week 5-6: 实时协作
  ├─ Yjs 集成
  ├─ 光标同步
  └─ 操作历史

Week 7: 所见即所得
  ├─ WYSIWYG 模式
  └─ 数学公式/流程图

Week 8: 测试与部署
  ├─ 单元测试
  ├─ 性能测试
  └─ 生产部署
```

## 🎯 关键里程碑

| 时间 | 里程碑 | 验收标准 |
|------|--------|----------|
| Week 2 | 单用户编辑器 | 编辑、渲染、保存正常 |
| Week 4 | Golang 服务器 | API、WebSocket、文档管理正常 |
| Week 6 | 协作功能 | 多人编辑、光标同步正常 |
| Week 8 | 生产就绪 | 测试通过、文档完善、部署上线 |

## 📊 性能目标

| 指标 | 目标值 |
|------|--------|
| 文档加载时间 | < 1s（100KB） |
| 输入响应时间 | < 50ms |
| 协作同步延迟 | < 200ms（局域网） |
| 并发用户数 | 10+ 同时编辑 |
| 并发连接数 | 1000+ |
| 内存占用 | < 50MB |

## 🛠️ 核心代码示例

### Golang WebSocket 服务器

```go
package main

import (
    "github.com/gin-gonic/gin"
    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

func handleWebSocket(c *gin.Context) {
    conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        return
    }
    defer conn.Close()
    
    for {
        messageType, message, err := conn.ReadMessage()
        if err != nil {
            break
        }
        // 处理消息...
        conn.WriteMessage(messageType, message)
    }
}

func main() {
    r := gin.Default()
    r.GET("/ws", handleWebSocket)
    r.Run(":8080")
}
```

### 前端 Yjs 集成

```javascript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// 创建 Yjs 文档
const ydoc = new Y.Doc();

// 连接到 Golang WebSocket 服务器
const provider = new WebsocketProvider(
  'ws://localhost:8080/ws',
  'all-md',
  ydoc
);

// 绑定到 CodeMirror
const ytext = ydoc.getText('content');
// ... CodeMirror 绑定代码
```

## ⚠️ 注意事项

### Golang 后端挑战

1. **CRDT 库不成熟**
   - 解决方案：使用 Automerge-Go 或自定义实现
   - 备选：操作日志 + Redis

2. **与前端 Yjs 兼容**
   - 解决方案：实现 Yjs 兼容的消息协议
   - 备选：前端也使用 Automerge

### 开发建议

1. **渐进式开发**
   - 先实现基础功能
   - 再添加协作特性
   - 最后优化性能

2. **充分测试**
   - 单元测试（Go testing）
   - 集成测试
   - 性能测试

3. **文档先行**
   - 先阅读规格说明书
   - 理解系统架构
   - 再开始编码

## 📞 获取帮助

### 遇到问题时

1. **查阅文档**：阅读规格说明书和任务分解
2. **搜索问题**：Stack Overflow、GitHub Issues
3. **简化问题**：创建最小复现示例
4. **寻求帮助**：相关社区提问

### 学习资源

- [CodeMirror 6 文档](https://codemirror.net/6/)
- [Yjs 文档](https://docs.yjs.dev/)
- [Gin 框架文档](https://gin-gonic.com/)
- [Gorilla WebSocket](https://github.com/gorilla/websocket)

## ✅ 验收清单

### 功能验收
- [ ] 编辑器支持所有基础功能
- [ ] 实时渲染延迟 < 100ms
- [ ] 多人协作无冲突
- [ ] 光标同步准确
- [ ] 文档自动保存

### 性能验收
- [ ] 支持 10+ 人同时编辑
- [ ] 支持 1000+ 并发连接
- [ ] 内存占用 < 50MB
- [ ] 响应延迟 < 200ms

### 稳定性验收
- [ ] 连续运行 24 小时无崩溃
- [ ] 断线重连成功率 > 99%
- [ ] 数据丢失率 = 0

## 🎉 总结

### 优化成果

- ✅ **需求更清晰**：思维导图只读
- ✅ **性能更优**：Golang 提升 10 倍
- ✅ **部署更简**：单一二进制文件
- ✅ **维护更好**：类型安全
- ✅ **成本更低**：内存降低 10 倍

### 推荐方案

**强烈推荐使用优化后的方案**：
- 思维导图只读
- Golang 后端
- 前端使用 Yjs

这个方案在性能、部署、维护等方面都有显著优势！🚀

---

**开始开发前，请先阅读：**
1. [spec-collaborative-editing-v2.md](./spec-collaborative-editing-v2.md)
2. [tasks-collaborative-editing-v2.md](./tasks-collaborative-editing-v2.md)
