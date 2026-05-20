# onlinenote 多人同时编辑功能审查报告

> 审查范围：CRDT 引擎（Go + JS）、WebSocket Hub、Editor CRDT 集成、CollaborationManager
> 审查日期：2026-05-20

---

## 严重度定义

| 等级 | 含义 |
|------|------|
| 🔴 P0 | 数据丢失 / 文档损坏 / 功能完全不可用 |
| 🟠 P1 | 协同冲突 / 状态不一致 / 明显用户体验问题 |
| 🟡 P2 | 潜在分歧 / 性能劣化 / 边界情况 |
| 🟢 P3 | 设计不足 / 功能缺失 |

---

## 🔴 P0 — 致命

### BUG-C1：WritePump 批量写导致 WebSocket 消息损坏

**文件**：`server/internal/websocket/hub.go:267-275`

```go
// WritePump
w, err := c.Conn.NextWriter(websocket.TextMessage)
w.Write(message)         // 消息 1

n := len(c.Send)
for i := 0; i < n; i++ {
    msg, ok := <-c.Send
    w.Write([]byte{'\n'})  // 换行符
    w.Write(msg)           // 消息 2, 3, ...
}
w.Close()
```

**问题**：`NextWriter` 创建**单个** WebSocket 帧。循环中把多条 JSON 消息用 `\n` 拼在一起写入同一帧。接收端 `ReadMessage()` 拿到的是：

```
{"type":"crdt-op",...}\n{"type":"cursor",...}\n{"type":"crdt-op",...}
```

→ `JSON.parse` 报错 → **整批消息全部丢弃**。

**触发条件**：多人同时编辑，Hub 广播速率超过 WebSocket 写入速率时，`c.Send` 队列堆积 ≥ 2 条消息，WritePump 启用批量路径，**整批消息损坏**。

**修复建议**：每轮循环只处理一条消息，不用批量写：
```go
case message, ok := <-c.Send:
    c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
    if !ok {
        c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
        return
    }
    w, err := c.Conn.NextWriter(websocket.TextMessage)
    if err != nil { return }
    w.Write(message)
    w.Close()
```

---

### BUG-C2：CRDT 全量替换策略破坏编辑器状态

**文件**：`public/js/editor/Editor.js:204-214` + `CollaborationManager.js:168-169`

```js
// CollaborationManager.js 收到远程 CRDT op 后：
const newContent = this.crdt.rebuild();   // 重建整个文本
this.onCRDTUpdate(newContent);            // → applyCRDTContent

// Editor.js:
applyCRDTContent(newContent) {
    this.cm.dispatch({
        changes: { from: 0, to: oldLen, insert: newContent },  // ← 全量替换
        selection: { anchor: Math.min(pos, newContent.length) },
    });
}
```

**后果**：

1. **撤销历史被覆写** — CodeMirror 的 `history()` 将全量替换记为一步撤销，用户无法撤销自己刚做的编辑
2. **光标位置不可靠** — `Math.min(pos, newContent.length)` 只能保持大致位置，在他人同时编辑附近文本时光标偏移
3. **选区丢失** — 如果用户正在选中文本，远程变更后选区被强制折叠到单点

**触发条件**：任何时候，远程 CRDT 操作到达都会触发全量替换。

**修复建议**：不直接替换全文，而是将 CRDT op 转为 CodeMirror `changes` 增量变更：
```js
// 将 remoteOperation 映射为 CodeMirror ChangeSpec
// 用 tr.changes.mapPos 保持光标位置
```

或在 `updateListener` 中检查 `applyingRemote` 标记以避免将远程变更误当本地变更重发（见 BUG-C3）。

---

### BUG-C3：远程 CRDT 操作被重新广播（反馈环）

**文件**：`public/js/editor/Editor.js:161-178`

时间线：
```
t=0:   远程 CRDT op 到达
t=0:   handleRemoteCRDTOp → applyCRDTContent(newContent)  (applyingRemote=true)
t=0:   CodeMirror dispatch → updateListener 触发
t=0:   updateListener 收集 pendingChanges
t=0:   scheduleChange() 被调用 (applyingRemote=true，但此时尚未检查)
t=0:   applyingRemote = false（同步重置）
t=300ms: debounce 触发
t=300ms: this.crdtEnabled = true && !this.applyingRemote = true
t=300ms: this.onCRDTOps(changes) → handleLocalChanges → 生成新 CRDT ops → 再次发送！
```

**问题**：虽然 `applyCRDTContent` 设置了 `applyingRemote = true`，但 `applyingRemote` 在 `scheduleChange` 的 debounce (300ms) 之前就已经重置。当 debounce 触发时，标志早已为 false。

**后果**：远程编辑被当作本地编辑，重新生成 CRDT ops 发送，形成**无限反馈环**。每个环都会被全量替换（BUG-C2），导致文档内容波动。

**修复建议**：在 `updateListener` 中而非 `scheduleChange` 中检查标志：
```js
EditorView.updateListener.of((update) => {
    if (update.docChanged && !this.applyingRemote) {  // ← 在这里过滤
        // ... 只有本地变更才收集
        this.scheduleChange();
    }
})
```

---

## 🟠 P1 — 高危

### BUG-C4：CRDT 并发插入收敛依赖消息到达顺序（非真 CRDT）

**文件**：`server/internal/crdt/document.go:47-85`

```go
func (d *Document) ApplyOperation(op Operation) {
    // ...
    if op.Type == "insert" {
        node := &Node{
            LeftID: op.LeftID,   // ← 按原样存储，不重排
            RightID: op.RightID,
        }
        d.nodes[op.NodeID] = node
    }
}
```

**问题**：Server 端 CRDT 只存节点，不做排序。当两用户同时对同一位置插入（`leftId=A, rightId=B`），不同客户端因网络延迟以不同顺序收到这两个 op。JS 端的 `_applyRemoteInsert` 会按到达顺序链接（第一个插入的修改 A.rightId，第二个插入在第一个后面），导致不同客户端 `rebuild()` 出不同文本。

**后果**：多用户同时编辑时，文档内容在不同客户端可能不相同，且**不会有任何警告或错误**。

**修复建议**：Server 端应做确定性的节点排序（如 RGA 算法的插入位置计算），或客户端在 `_applyRemoteInsert` 中使用 `compareNodeIds` 对所有并发插入做确定性排序，确保 global total order。

---

### BUG-C5：工具栏操作绕过 CRDT 管道

**文件**：`public/js/editor/Toolbar.js` + `Editor.js`

```js
// Toolbar.js 直接 dispatch 到 CodeMirror：
insertLine(prefix) {
    this.cm.dispatch({
        changes: { from, to: ..., insert: prefix },
    });
}
```

**问题**：Toolbar 的所有操作（标题、加粗、列表、表格等）直接修改 CodeMirror，触发的 `updateListener` 会走 `scheduleChange()` → `onCRDTOps` → `handleLocalChanges`。但 CRDT 的 `localInsert`/`localDelete` 是基于原始字符索引计算的，工具栏操作带来的结构性变化（如 `# ` 前缀、`**粗体**` 包裹、表格模板）会产生：

1. CRDT op 粒度是逐字符，对于"插入表格"这类大块操作，产生大量 CRDT ops
2. 部分操作（如 `insertCodeBlock` 插入 `` ```language\ncode\n``` `` ）是多行文本，`localInsert` 逐字符插入，其他用户的 CRDT 重建可能与工具栏意图不匹配

**修复建议**：工具栏在 CRDT 模式下应能批量生成操作，或禁用 CRDT 模式的工具栏（仅保留纯文本编辑）。

---

### BUG-C6：Server 不对 CRDT 操作做完整性校验

**文件**：`server/cmd/main.go:84-107`

```go
hub.OnCRDTOp = func(docID string, data []byte) {
    // 直接反序列化 → ApplyOperation → 保存。无任何校验。
    var crdtMsg struct {
        Operations []crdt.Operation `json:"operations"`
    }
    // ...
    doc := crdtStore.Get(docID)
    for _, op := range crdtMsg.Operations {
        doc.ApplyOperation(op)  // ← 未校验 SiteID / Clock / 引用完整性
    }
}
```

**缺失的校验**：
- `op.SiteID` 是否匹配 WebSocket client 的 identity
- `op.Clock` 是否单调递增
- `op.LeftID` / `op.RightID` 是否存在（至少是 BOF/EOF）
- `op.Timestamp` 是否合理

**后果**：攻击者可伪造任何 SiteID 的 CRDT op，注入其他人的文档内容。

**修复建议**：至少校验 SiteID 与 WebSocket client 的 UserID 一致，Clock 必须大于 vector[SiteID]。

---

## 🟡 P2 — 中危

### BUG-C7：CRDT 节点永不回收

**文件**：`server/internal/crdt/document.go:47-85` + `public/js/crdt/CRDTDocument.js`

Server 和 Client 的 CRDT 都只增不减：删除操作仅设 `node.Deleted = true`，从不从 Map 中移除节点。长时间编辑后 nodes map 持续膨胀。

**修复建议**：定期扫描所有已删除节点，若其左右邻居都已删除，可安全移除。

---

### BUG-C8：非 CRDT 模式下的 raw edit 无版本追踪

**文件**：`public/js/collaboration/CollaborationManager.js:210-215` + `server/internal/websocket/hub.go:221-223`

```js
// 非 CRDT 模式：发送原始 CodeMirror changes
sendChanges(changes) {
    this.send({
        type: 'edit',
        data: { changes },   // ← 无版本号、无基础文档 hash
    });
}
```

**问题**：没有版本向量或文档 base hash，当多个用户同时编辑时，raw changes 直接应用到当地编辑器，无冲突检测和回滚。

**修复建议**：非 CRDT 模式应在 `edit` 消息中附带发件人的文档版本号，接收方检查版本是否匹配后再应用（如 OT 的 baseVersion 机制）。或直接移除 `edit` 模式，统一使用 CRDT。

---

### BUG-C9：重连后 CRDT 同步可能丢失并发变更

**文件**：`public/js/collaboration/CollaborationManager.js:175-200`

```js
requestCRDTSync() {
    fetch(`/api/documents/${...}/crdt/sync`, {
        body: JSON.stringify({
            operations: [],     // ← 空数组！
            vector: this.crdt.vector,
        }),
    })
}
```

**问题**：重连时发送**空 operations + 本地 vector**。Server 返回所有 `clock > vector[siteId]` 的 ops。但这里有个时序问题：

```
t=0:  客户端断开
t=1:  其他用户产生 op X, Y, Z
t=2:  客户端重连，发送 vector
t=3:  Server 返回 X, Y, Z
t=4:  客户端应用 X, Y, Z → OK
```

但如果客户端在重连过程中也有本地修改（离线编辑），这些修改的 ops 还没有发送到 Server。此时 `requestCRDTSync` 发送空 operations，Server 不知道客户端有 pending ops → Server 的 vector 不包含它们 → 下次 Server sync 不会返回这些 ops 之后的新 ops → 下次连接时可能漏掉 op。

**修复建议**：同步时带上本地未发送的 `pendingCRDTOps`，或同步完成后再 flush。

---

### BUG-C10：CRDT mode 与非 CRDT mode 混用风险

当 `crdtEnabled=false` 时，`handleLocalChanges` 走 `sendChanges`（`edit` 消息），`onCRDTOps` 不会被调用。但如果初始化时 `crdtEnabled=false` 后来改为 true（或反之），两种模式产生的消息互不理解，导致协同断裂。

**修复建议**：文档级别的 CRDT 启用标记应在 Server 端控制，客户端不得在会话中途切换。

---

## 🟢 P3 — 低优先级

### BUG-C11：无 typing indicator / 用户在场感知

WebSocket 已有 `user-joined`/`user-left`/`user-list`/`cursor` 消息，但没有 `user-typing` 事件。这意味着其他用户无法知道谁正在编辑。

---

### BUG-C12：协作消息无重传机制

WebSocket 断开后，重连期间的所有操作（包括已发送但未确认的）不重传，依赖重连后的全量 CRDT sync。如果重连时 sync 丢失 ops（见 BUG-C9），可能永久不一致。

---

## 汇总统计

| 等级 | 数量 | 位置 |
|------|------|------|
| 🔴 P0 | 3 | WritePump(Go)、全量替换(JS)、反馈环(JS) |
| 🟠 P1 | 3 | CRDT排序(Go/JS)、工具栏绕路(JS)、校验缺失(Go) |
| 🟡 P2 | 4 | 节点回收(Go/JS)、版本追踪(JS)、重连同步(JS)、模式混用(JS) |
| 🟢 P3 | 2 | typing indicator、重传 |
| **合计** | **12** | |

---

## 架构评价

| 方面 | 评价 |
|------|------|
| **双路径设计**（CRDT + raw edit） | ⚠️ 复杂度翻倍，两套代码路径需要各自维护一致性 |
| **CRDT 全量替换** | ❌ 破坏了编辑器撤销栈和光标位置，应改为增量变更 |
| **Server 端 CRDT** | ⚠️ 仅做中继+持久化，不做冲突排序，依赖客户端收敛 |
| **节点独立性** | ✅ RGA 风格逐字符节点，天然支持任意位置并发插入 |
| **LWW 删除** | ✅ Last-Write-Wins 删除语义正确 |
| **Idempotent** | ✅ 重复 apply 同一 op 被正确忽略 |

---

## 修复优先级建议

1. **立即修复**：BUG-C1（消息损坏）、BUG-C2（全量替换）、BUG-C3（反馈环）
2. **尽快修复**：BUG-C4（CRDT 排序）、BUG-C5（工具栏绕路）、BUG-C6（无校验）
3. **计划修复**：BUG-C7 ~ BUG-C10
4. **后续迭代**：BUG-C11、BUG-C12
