# onlinenote Bug 报告

> 审查范围：全部 Go 后端 + JavaScript 前端代码
> 审查日期：2026-05-20

---

## 严重程度定义

| 等级 | 含义 |
|------|------|
| 🔴 P0 | 安全漏洞 / 数据丢失 / 服务崩溃 |
| 🟠 P1 | 功能缺陷 / 数据不一致 / 可用性影响 |
| 🟡 P2 | 潜在问题 / 边界情况 / 代码异味 |
| 🟢 P3 | 优化建议 / 代码风格 |

---

## 🔴 P0 — 严重

### BUG-1：认证完全可绕过

**文件**：`server/cmd/main.go:530`

```go
func (s *Server) getUserIdFromRequest(c *gin.Context) string {
    authHeader := c.GetHeader("Authorization")
    if authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer " {
        // JWT 校验...
    }
    return c.Query("userId")  // ← 无 token 时直接用 query param
}
```

**问题**：当请求没有 `Authorization` header（或 JWT 解析失败），直接以 `c.Query("userId")` 作为用户身份。攻击者在 URL 上加 `?userId=admin` 即可伪装为任意用户，绕过全部访问控制。

所有需要鉴权的接口（`handleSaveDocument`, `handleRollback`, `handleSetPermission` 等）都受此影响。

**修复建议**：JWT 校验失败时返回空字符串，由调用方决定是否拒绝请求，或要求必须通过 JWT 认证。

---

### BUG-2：WebSocket 无 Origin 校验

**文件**：`server/cmd/main.go:27-29`

```go
var upgrader = gws.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true  // ← 接受任意来源
    },
}
```

**问题**：任何网站都可以建立 WebSocket 连接，构成跨站 WebSocket 劫持（CSWSH）漏洞。

**修复建议**：在校验函数中检查 `Origin` header 是否在白名单内。

---

### BUG-3：硬编码的弱 JWT 密钥

**文件**：`server/config/config.go:24`

```go
JWTSecret: getEnv("JWT_SECRET", "onlinenote-secret-key-change-in-production"),
```

**问题**：虽然变量名提示了需要修改，但默认值本身是一个弱密钥，所有未修改配置的实例共享同一条密钥。

**修复建议**：启动时若 JWT_SECRET 仍为默认值，打印 WARNING，或强制要求环境变量不为空。

---

## 🟠 P1 — 高危

### BUG-4：CRDT 操作只存内存，重启后丢失

**文件**：`server/cmd/main.go:55-74` + `server/internal/crdt/document.go`

```go
hub.OnCRDTOp = func(docID string, data []byte) {
    // ... 解析 operation ...
    doc := crdtStore.Get(docID)
    for _, op := range crdtMsg.Operations {
        doc.ApplyOperation(op)  // ← 仅更新内存
    }
    // ← 从未调用 db.SaveCRDTState()
}
```

**问题**：虽然 `database.go` 提供了 `SaveCRDTState()` 方法，但 WebSocket CRDT 回调中从未调用它。所有通过 WebSocket 同步的 CRDT 操作在服务器重启后全部丢失。

**修复建议**：在 `OnCRDTOp` 回调末尾调用 `s.DB.SaveCRDTState(docID, doc.GetState(), doc.GetVector())`。

---

### BUG-5：Broadcast 慢客户端处理有竞态条件可能导致 panic

**文件**：`server/internal/websocket/hub.go:96-116`

```go
case msg := <-h.broadcast:
    h.mu.RLock()
    clients := h.docClients[msg.DocID]
    h.mu.RUnlock()   // ← 释放读锁

    for client := range clients {
        select {
        case client.Send <- msg.Data:
        default:
            // 慢客户端
            h.mu.Lock()              // ← 重新获取写锁
            close(client.Send)       // ← 可能已关闭！
            delete(h.clients, client)
            // ...
            h.mu.Unlock()
        }
    }
```

**竞态条件**：在 `h.mu.RUnlock()` 和 `h.mu.Lock()` 之间，
1. 另一个 goroutine（unregister）获取写锁，处理同一客户端，关闭了 `client.Send`
2. 然后 broadcast goroutine 获取写锁，再次 `close(client.Send)` → **panic: close of closed channel**

**修复建议**：关闭 channel 前检查客户端是否仍在 `h.clients` 中，或使用 `sync.Once` 保护 channel 关闭。

---

### BUG-6：SQLite DELETE 子查询 LIMIT 行为不确定

**文件**：`server/internal/storage/database.go:251-260`

```go
func (d *Database) CleanupOldVersions(docID string) error {
    _, err := d.db.Exec(`
        DELETE FROM document_versions
        WHERE document_id = ?
        AND id NOT IN (
            SELECT id FROM document_versions
            WHERE document_id = ?
            ORDER BY version DESC
            LIMIT ?
        )
    `, docID, docID, MaxVersionsToKeep)
```

**问题**：SQLite 中 DELETE 的子查询可能在父查询删除过程中改变结果集，导致删除行数少于预期或删除错误的行。这是 SQLite 的已知陷阱。

**修复建议**：先查询要保留的 ID 列表，再执行 DELETE：
```sql
-- 1. 查询要保留的版本
SELECT id FROM document_versions WHERE document_id = ? ORDER BY version DESC LIMIT ?
-- 2. 执行干净 DELETE（删除不在保留列表中的版本）
DELETE FROM document_versions WHERE document_id = ? AND id NOT IN (...算好的列表...)
```

---

### BUG-7：所有注册用户获取相同颜色

**文件**：`server/cmd/main.go:204`

```go
u := user.User{
    Color: user.AssignColor(0),  // ← 永远传 0，永远返回 "#FF5733"
}
```

**问题**：`AssignColor` 使用 `index % len(colorPool)` 分配颜色。`index=0` 始终返回 `colorPool[0]`，即 `#FF5733`。所有注册用户颜色相同。

**修复建议**：从数据库统计已有用户数作为 index，或用随机索引。

---

## 🟡 P2 — 中危

### BUG-8：WritePump 批量写入不检测 channel 关闭

**文件**：`server/internal/websocket/hub.go:265-269`

```go
n := len(c.Send)
for i := 0; i < n; i++ {
    w.Write([]byte{'\n'})
    w.Write(<-c.Send)  // ← channel 已关闭时返回 nil，写入垃圾分隔符
}
```

**问题**：如果 `c.Send` 在 `len(c.Send)` 和循环执行之间被关闭，`<-c.Send` 返回零值 `nil`，`w.Write(nil)` 不报错但会写入一个多余的 `\n` 分隔符。

**修复建议**：检查 `ok` 标志或使用 range 循环。

---

### BUG-9：WebSocket 颜色分配的竞态

**文件**：`server/cmd/main.go:163`

```go
color := user.AssignColor(len(s.Hub.GetDocUsers(docID)))
```

**问题**：两个用户几乎同时连接时，`GetDocUsers` 返回相同的人数，分配到相同的颜色。

**修复建议**：不是由人数推导颜色，而在 Hub 中维护已分配颜色集合，从剩余颜色中分配。

---

### BUG-10：handleSaveDocument 用 "anonymous" fallback 绕过版本追踪

**文件**：`server/cmd/main.go:354-356`

```go
if req.UserID == "" {
    req.UserID = "anonymous"
}
```

**问题**：所有未认证用户的操作都归到 `"anonymous"` 名下，版本历史中无法区分不同匿名用户。虽非严重 BUG，但结合 BUG-1（认证绕过），使得溯源更困难。

---

### BUG-11：远端变更光标位置计算可能不准确

**文件**：`public/js/editor/Editor.js:195-199`

```js
applyChanges(changes) {
    const pos = this.cm.state.selection.main.head;
    let offset = 0;
    const adjusted = changes.map(c => {
        const adj = { from: c.from + offset, to: c.to + offset, insert: c.inserted };
        offset += (c.inserted ? c.inserted.length : 0) - (c.to - c.from);
        return adj;
    });
    this.cm.dispatch({
        changes: adjusted,
        selection: { anchor: Math.min(pos, this.cm.state.doc.length + offset) },
    });
}
```

**问题**：CodeMirror 6 的 `dispatch` 中 `selection` 是指新文档中的位置。这里用 `this.cm.state.doc.length + offset`（旧长度 + 偏移）来 clamp 光标，在复杂多区域变更场景下可能算出错误的新文档边界。应使用 CodeMirror 的 `changeSet` 来映射位置：
```js
const tr = this.cm.state.update({ changes: adjusted });
const newPos = tr.changes.mapPos(pos);
```

---

### BUG-12：CRDTDocument.loadState 递归可能导致栈溢出

**文件**：`public/js/crdt/CRDTDocument.js:468-480`

```js
const buildOrder = (parentId) => {
    const children = leftChildren.get(parentId) || [];
    // ...
    for (const childId of children) {
        result.push(childId);
        result.push(...buildOrder(childId));  // ← 递归
    }
};
```

**问题**：对深层嵌套的 CRDT 文档，`buildOrder` 递归可能导致栈溢出。对实际使用场景（Markdown 文档编辑）影响较小，因为深度通常有限。

---

### BUG-13：handleCRDTSync 是死代码

**文件**：`public/js/collaboration/CollaborationManager.js:175`

```js
handleCRDTSync(msg) { ... }
```

**问题**：`handleCRDTSync` 方法已定义但 `handleMessage` 中没有对应 case（WebSocket 消息处理在 line 75-105），永远不会被调用到。CRDT 同步走的是 AJAX 路径 (`requestCRDTSync`)，但 WebSocket 路径的 `crdt-sync` 消息被忽略。

---

### BUG-14：seedFromStatic 忽略 Save 错误

**文件**：`server/internal/document/manager.go:52`

```go
func (m *Manager) seedFromStatic(staticDir string) {
    // ...
    if doc.Content == "" {
        m.Save("all-md", string(content))  // ← 错误被忽略
    }
}
```

**问题**：`Save` 返回 error 但调用处未检查。如果磁盘已满或权限不足，种子数据静默失败。

---

## 🟢 P3 — 低优先级

### BUG-15：SyncScroll 潜在除零

**文件**：`public/js/renderer/SyncScroll.js:62`

```js
const lineAtTop = Math.floor(
    editorEl.scrollTop / (editorEl.scrollHeight / this.editor.cm.state.doc.lines)
) + 1;
```

**问题**：若文档为空或编辑器未完全挂载，`scrollHeight` 或 `doc.lines` 可能为 0，导致除零。

---

### BUG-16：LivePreview docId 生成边界情况

**文件**：`public/js/renderer/LivePreview.js:68`

```js
const docId = resolvedHref.replace(/^\.\//, '').replace(/\.md$/, '').replace(/\//g, '--');
```

**问题**：若路径中已包含 `--`，会与生成的 docId 分隔符冲突。路径大小写敏感在不同文件系统可能导致不一致。

---

## 汇总统计

| 严重等级 | 数量 | 后端 | 前端 |
|---------|------|------|------|
| 🔴 P0   | 3    | 3    | 0    |
| 🟠 P1   | 4    | 4    | 0    |
| 🟡 P2   | 7    | 3    | 4    |
| 🟢 P3   | 2    | 0    | 2    |
| **合计** | **16** | **10** | **6** |

---

## 修复优先级建议

1. **立即修复**（P0）：BUG-1（认证绕过）、BUG-2（WebSocket CSRF）、BUG-3（弱密钥）
2. **尽快修复**（P1）：BUG-4（CRDT 持久化缺失）、BUG-5（竞态 panic）、BUG-6（SQL 不确定行为）
3. **计划修复**（P2+P3）：其余问题
