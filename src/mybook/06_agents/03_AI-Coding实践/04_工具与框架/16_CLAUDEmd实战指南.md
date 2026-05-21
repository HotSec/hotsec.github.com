## CLAUDE.md 实战指南

### 一、CLAUDE.md 到底是什么？

CLAUDE.md 是给 Claude 的「团队约定」，本质上是一个普通的 markdown 文件，放在项目根目录下。

**核心特点：**
- 每次打开 Claude Code，它都会自动读取这个文件
- 作为整个对话的「ground truth」（基准事实）
- 不是可选提示，而是默认前提

**与 README 的区别：**
- README 是写给人看的，密度低，可跳读
- CLAUDE.md 是写给 agent 看的，会被完整加载进上下文窗口

**加载机制：**
```typescript
// src/utils/claudemd.ts
const dirs: string[] = []
originalCwd = getOriginalCwd()
let currentDir = originalCwd
while (currentDir !== parse(currentDir).root) {
    dirs.push(currentDir)
    currentDir = dirname(currentDir)
}
```
从当前目录向上遍历，读取每一层的 CLAUDE.md 和 `.claude/CLAUDE.md`，全部合并喂给模型。

---

### 二、为什么写多了反而废？

**实测数据（SFEIR Institute）：**
- 200 行以内：规则遵守率约 92%
- 400 行以上：遵守率明显下降
- 拆成 5 个 30 行的模块化文件：遵守率升至 96%

**两大原因：**

1. **Token 经济**
   - CLAUDE.md 每次启动都会被完整加载进上下文窗口
   - 行数越多，消耗 token 越多，挤压对话、思考、工具调用空间

2. **注意力稀释**
   - 模型注意力有限，规则一多，每条规则的权重就被摊薄
   - 超过 300 行后，「记不住」变成常态

**三类负资产要清除：**

| 类型 | 反例 | 正确做法 |
|------|------|----------|
| 复述型 | 复制粘贴 100 行架构文档 | `项目架构详见 docs/architecture.md` |
| 愿望型 | 「我们希望测试覆盖率达到 90%」 | 只写实际执行的规则 |
| 术语表型 | 「Repo 指 repository」 | 只解释团队特有的黑话 |

---

### 三、什么样的规则才真正有效？

**四原则：短、具体、告诉为什么、持续更新**

#### 1. 短
- 控制在 200 行以内（黄金线）

#### 2. 具体（可验证）

| 模糊写法 | 具体写法 |
|----------|----------|
| 测试一下你的修改 | 提交前跑 `npm test` |
| 保持目录整洁 | API 处理函数放在 `src/api/handlers/` |
| 别把构建搞挂了 | 推代码前跑 `npm run typecheck` |
| 检查类型 | （同上） |
| 用好的命名 | 组件用 PascalCase，工具函数用 kebab-case |

#### 3. 告诉为什么（最关键）

**示例：**
- 不好：「不要在测试里写入生产数据库」
- 好：「不要在测试里写入生产数据库（去年有次测试不小心把 users 表清空了，出过事故）」

**效果：** 给 Claude 留判断空间，它能理解规则的边界，做出正确判断。

#### 4. 持续更新
- 把 CLAUDE.md 当活文档维护

---

### 四、怎么分层组织 CLAUDE.md？

**多层级加载机制：**
- 从当前目录向上遍历
- 读取每一层的 `CLAUDE.md` 和 `.claude/CLAUDE.md`
- 全部合并

**模块化建议：**
- 将规则拆成多个小文件
- 放在 `.claude/rules/` 目录下
- 每个文件 30 行左右

---

### 五、怎么用 /init 和 /memory 维护？

**/init 命令：**
- 重新加载 CLAUDE.md
- 适用于规则变更后

**/memory 命令：**
- 查看当前记忆状态
- 管理长期记忆

---

### 六、CLAUDE.md 到底该怎么写？

**结构建议：**

```markdown
# CLAUDE.md

## 1. 项目基础信息
- 技术栈：React + TypeScript + Vite
- 包管理器：yarn
- 主要命令：
  - 开发：yarn dev
  - 构建：yarn build
  - 测试：yarn test

## 2. 代码规范
- 缩进：2 个空格
- 文件命名：组件用 PascalCase，工具函数用 kebab-case
- 类型检查：提交前必须跑 `yarn typecheck`

## 3. 目录结构
- API 处理函数：`src/api/handlers/`
- 组件：`src/components/`
- 工具函数：`src/utils/`

## 4. 特殊规则
- 不要在测试里写入生产数据库（曾出过清空 users 表的事故）
- PR 提交前必须通过 lint 和测试
```

**关键要点：**
- 简洁明了，控制在 200 行内
- 规则要具体、可验证
- 每条规则最好说明原因
- 定期清理过时内容

---

### 七、总结

CLAUDE.md 不是文档，是配置。写好它的关键在于：
1. **控制长度**：200 行以内最佳
2. **规则具体**：可验证、可执行
3. **说明原因**：给 Claude 判断空间
4. **分层组织**：拆成模块化文件
5. **持续维护**：定期清理更新