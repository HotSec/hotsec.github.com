# onlinenote 过时文档清理设计

**日期**：2026-06-07
**范围**：`onlinenote/` 子项目根目录的 12 份 `.md` 文档
**目标**：删除与当前代码实现不一致的过时/历史文档，仅保留与实际架构对应的文档

---

## 1. 现状摘要

### 1.1 当前代码实现（事实）

| 层 | 技术栈 | 关键证据 |
|----|--------|----------|
| 后端 | Go 1.22 + Gin + Gorilla WebSocket + SQLite + JWT | `server/go.mod`、`server/cmd/main.go`、`server/internal/{handler,middleware,crdt,websocket,storage,document,user,errors}/` |
| 前端 - 思维导图 | `public/index.html`（d3 + marked + highlight.js） | 文件头 `知识图谱 - 思维导图` |
| 前端 - 协作编辑器 | `public/editor.html` + `public/js/{editor,collaboration,crdt,renderer}/` | 标题 `OnlineNote - 协作编辑器`，模块化分层 |
| 数据 | SQLite @ `data/onlinenote.db` | 文件存在 |
| 架构 | handler / middleware 分层 | 提交 `ecd443a refactor(server): 重构为 handler/middleware 分层架构` |

### 1.2 文档与代码的一致性矩阵

| 文档 | 行数 | 描述对象 | 一致性 |
|------|-----|----------|--------|
| `spec.md` | 139 | v0 思维导图（仅 markmap） | ⚠️ 不含协作编辑/编辑器 |
| `tasks.md` | 92 | v0 任务分解（9 任务，纯前端） | ⚠️ 不含协作编辑/编辑器 |
| `checklist.md` | 64 | v0 验收清单 | ⚠️ 不含协作编辑/编辑器验收项 |
| `spec-collaborative-editing.md` | 671 | v1 协作编辑（**Node.js + Socket.io + OT**） | ❌ 与实际 Go + CRDT 完全不一致 |
| `tasks-collaborative-editing.md` | 427 | v1 任务分解（Node.js） | ❌ 同上 |
| `spec-collaborative-editing-v2.md` | 866 | v2 协作编辑（**Go + CRDT + Yjs 协议**） | ✅ 与实际架构一致 |
| `tasks-collaborative-editing-v2.md` | 561 | v2 任务分解 | ✅ 与实际架构一致 |
| `README_OPTIMIZED.md` | 284 | 旧"优化方案快速参考" | ⚠️ 内容仍为规划态（"实施计划 8 周"等已过时） |
| `QUICKSTART.md` | 281 | 快速开始 | ❌ 命令完全错误（`npm init -y` / `npm install express socket.io ...`） |
| `OPTIMIZATION_COMPARISON.md` | 428 | Node.js vs Go 选型对比 | ⚠️ 历史决策记录，不再需要 |
| `BUG_REPORT.md` | 344 | 2026-05-20 全量 Bug 清单 | ❌ 议题已闭合（之后多轮 "fix: 修复 N 个 bug" 提交） |
| `COLLABORATIVE_EDITING_REVIEW.md` | 328 | 2026-05-20 协作审查 | ❌ 议题已闭合（之后多轮 fix 提交） |

---

## 2. 删除清单（10 份，3290 行）

| # | 文件 | 行数 | 原因 |
|---|------|-----|------|
| 1 | `onlinenote/spec.md` | 139 | v0 思维导图 spec，与当前含协作编辑/编辑器的实现脱节 |
| 2 | `onlinenote/tasks.md` | 92 | v0 任务分解（9 任务），未涵盖协作/编辑器 |
| 3 | `onlinenote/checklist.md` | 64 | v0 验收清单，未涵盖协作/编辑器 |
| 4 | `onlinenote/spec-collaborative-editing.md` | 671 | v1 方案已被 v2 取代，技术栈（Node.js + OT）与实际（Go + CRDT）不符 |
| 5 | `onlinenote/tasks-collaborative-editing.md` | 427 | v1 任务分解，依赖已废弃方案 |
| 6 | `onlinenote/README_OPTIMIZED.md` | 284 | 旧规划态快速参考；内容含 8 周计划等已过期信息 |
| 7 | `onlinenote/QUICKSTART.md` | 281 | 快速开始命令与实际 Go 项目不符（全文 Node.js 化） |
| 8 | `onlinenote/OPTIMIZATION_COMPARISON.md` | 428 | 历史选型决策记录，决策已落地，无需保留 |
| 9 | `onlinenote/BUG_REPORT.md` | 344 | 2026-05-20 bug 报告；之后提交 `7808514`/`d652acc`/`932f133`/`2cc3796`/`6e5b043` 已完成多轮修复 |
| 10 | `onlinenote/COLLABORATIVE_EDITING_REVIEW.md` | 328 | 2026-05-20 审查报告；与 BUG_REPORT.md 同批议题已闭合 |

---

## 3. 保留清单（2 份，1427 行）

| # | 文件 | 行数 | 原因 |
|---|------|-----|------|
| 1 | `onlinenote/spec-collaborative-editing-v2.md` | 866 | 描述 Go/Gin/CRDT/SQLite/JWT 架构，与实际 `server/` 目录结构一致 |
| 2 | `onlinenote/tasks-collaborative-editing-v2.md` | 561 | 任务分解与 handler/middleware 分层重构后的代码一致 |

---

## 4. 实施步骤

1. 用 `rm`（非 `git rm`）删除上述 10 份文件，让用户在工作区自行 `git add/rm` 提交
2. 删完后用 `ls onlinenote/*.md` 验证仅剩 2 份 v2 文档
3. 用 `git status` 输出供用户核对后再提交

### 4.1 保留的 v2 文档关系

- `spec-collaborative-editing-v2.md` 是单一权威 spec
- `tasks-collaborative-editing-v2.md` 是配套任务分解
- 不补 README（用户偏好"纯文档仓库"）
- 不重命名 v2 文件（保留 `-v2` 后缀以反映命名历史，避免引入额外迁移成本）

---

## 5. 不在范围内

- `onlinenote/public/mybook/` —— 内容数据，非文档
- `onlinenote/data/` —— SQLite 数据，不动
- `onlinenote/server/` 与 `onlinenote/public/` 下的代码与资源 —— 不动
- 仓库根目录 `src/`、`docs/`、`examples/`、`onlinenote/` 之外的内容 —— 不动
- 任何 git 提交 / 推送动作 —— 由用户自行执行

---

## 6. 风险与回退

- **风险等级**：低（仅删除文件，不修改代码）
- **回退方案**：`git restore` 即可恢复；本次不直接 `git rm`，让用户在 `git status` 中确认后再操作
- **协作风险**：无（本地仓库，未推送）
