# Superpowers 最佳实践

Superpowers 是 Matt Pocock（Total TypeScript 作者）发布的一套 Agent Skills 集合，旨在解决 AI Coding 中反复出现的失败模式。它不是"氛围编程"（vibe coding）的工具，而是面向**真实工程**的实践框架。

> 项目地址：https://github.com/mattpocock/skills

---

## 一、为什么需要 Superpowers

AI 开发中的四类典型失败模式：

### 1. Agent 没做你想要的事 → 用 /grill-me /grill-with-docs

你心里想的和 Agent 理解的之间存在巨大的**沟通鸿沟**。解决方案不是更详细的 prompt，而是一场**盘问式对话**（grilling session）：Agent 主动向你提问，遍历决策树的每个分支，直到双方完全对齐。

### 2. Agent 过于啰嗦 → 用 CONTEXT.md 共享语言

项目初期，人和 Agent 说着不同语言。Agent 被扔进项目让它自己猜术语，于是用 20 个词表达 1 个意思。解决方案是建立**共享语言**（ubiquitous language）——CONTEXT.md 充当术语表，让 Agent 用 1 个精确术语替代 20 个模糊描述。

例如："materialization cascade" 替代 "when a lesson inside a section of a course is made 'real'"

共享语言的好处不止减少啰嗦：
- 变量、函数、文件名**命名一致**
- 代码库**更易导航**
- Agent 消耗**更少 token** 在思考上

### 3. 代码不工作 → 用 /tdd /diagnose

即使 Agent 理解正确，没有反馈闭环它就是在盲飞。传统工程实践的三大反馈机制：

| 反馈机制 | 作用 |
|---------|------|
| 静态类型 | 编译时发现错误 |
| 浏览器/运行环境 | 运行时验证 |
| 自动化测试 | 回归保护，红-绿-重构循环 |

`/tdd` 强制 Agent 走红-绿-重构循环，`/diagnose` 封装最佳调试实践。

### 4. 代码变成烂泥球 → 用 /improve-codebase-architecture

Agent 加速编码的同时也在加速**软件熵增**。代码库以前所未有的速度变得复杂。解决方案是**每天都关心代码设计**。

---

## 二、核心理念

### 2.1 小、可适配、可组合

Superpowers 刻意不做成另一个 GSD/BMAD/Spec-Kit。那些工具帮你"拥有流程"但夺走了你的控制权，而且流程中的 bug 难以修复。Superpowers 的每个技能都独立、小巧、容易修改。

### 2.2 共享语言是基石

几乎所有工程技能都依赖 CONTEXT.md（术语表）和 ADR（架构决策记录）来理解项目。这个概念贯穿整个框架。

### 2.3 深模块哲学

来自 John Ousterhout《A Philosophy of Software Design》：

```
深模块 = 小接口 + 大实现
浅模块 = 大接口 + 薄实现 → 避免
```

判断标准——**删除测试**：想象删除这个模块。如果复杂度消失了（模块只是透传），它就是浅的。如果复杂度分散到 N 个调用者中，它才真正在发挥作用。

---

## 三、工程技能（Engineering）

### 3.1 /grill-with-docs — 盘问 + 文档

**用途**：开始任何修改前，先和 Agent 进行一场结构化盘问，同时对齐术语和架构决策。

**工作流程**：
1. 逐一提问，遍历设计树的每个分支
2. 用已有 CONTEXT.md 中的术语挑战你的用词："你说的是 Customer 还是 User？那是两个概念"
3. 交叉验证代码：你说的和代码实际行为矛盾时立刻指出
4. **实时更新 CONTEXT.md**，不等攒到最后一次性更新
5. 谨慎提议 ADR——只在同时满足三个条件时：难以逆转 + 非显而易见 + 真实权衡

**CONTEXT.md 格式要点**：
- 每个术语一行定义
- 列出应避免的同义词（`_Avoid_: purchase, transaction`）
- 显示术语之间的关系（`一个 Order 产生多个 Invoice`）
- 记录已解决的歧义
- 提供示例对话
- 只包含项目特定术语，不包含通用编程概念

### 3.2 /grill-me — 纯盘问（非代码用途）

与 grill-with-docs 相同逻辑，但不更新文档。适用于非代码场景的决策梳理。

### 3.3 /tdd — 测试驱动开发

**核心原则**：测试应验证公共接口的**行为**，而非实现细节。

**好的测试**（集成风格）：
```typescript
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

**坏的测试**（实现细节耦合）：
```typescript
// 坏：mock 内部协作者
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```

**反模式——水平切片**：
```
错误（水平）：          正确（垂直/曳光弹）：
RED:  test1-5 全写完    RED→GREEN: test1→impl1
GREEN: impl1-5 全实现   RED→GREEN: test2→impl2
                        RED→GREEN: test3→impl3
```

一次性写完全部测试再实现是灾难：你测试的是**想象中**的行为而非**实际**行为，且提交了"还没理解实现就预设了测试结构"的错误。

**工作流**：
1. 规划 → 确认接口变更 + 识别深模块机会 + 列出要测试的行为
2. 曳光弹 → 写一个测试 + 最小实现来验证端到端畅通
3. 增量循环 → 逐行为 RED→GREEN
4. 重构 → 所有测试通过后，抽取重复、加深模块

**Mock 原则**：只在系统边界 mock（外部 API、数据库、时间/随机数），不 mock 自己的类/模块。

### 3.4 /diagnose — 结构化调试

**六个阶段**：

| 阶段 | 内容 |
|------|------|
| Phase 1 | 构建反馈闭环——这是整个技能的灵魂！没有快速、确定性、Agent 可运行的 pass/fail 信号，看再多代码也没用 |
| Phase 2 | 复现——确认复现了用户描述的**那个** bug |
| Phase 3 | 假设——生成 3-5 个可证伪的假设，格式："If X 是原因，then 改 Y 会让 bug 消失" |
| Phase 4 | 打桩——每次只改一个变量，用 `[DEBUG-xxxx]` 标签方便清理 |
| Phase 5 | 修复 + 回归测试——在正确的 seam 处写回归测试 |
| Phase 6 | 清理 + 复盘——移除 debug 代码，记录正确假设 |

**构建反馈闭环的 10 种方法**（按优先级）：
1. 失败测试
2. curl/HTTP 脚本
3. CLI 调用 + 快照对比
4. 无头浏览器脚本
5. 回放抓取的 trace
6. 一次性测试 harness
7. 属性/模糊测试循环
8. 二分定位 harness
9. 差分循环
10. HITL bash 脚本（最后手段）

**非确定性 bug**：目标不是干净复现，而是**提高复现率**。循环 100 次、加压力、缩小时间窗口——50% 复现率的 bug 可调试，1% 不行。

### 3.5 /improve-codebase-architecture — 架构改进

**查找深化机会**：将浅模块重构为深模块，目标是可测试性和 AI 可导航性。

**关键术语**：
- **Module**：任何有接口和实现的东西（函数/类/包/切片）
- **Interface**：调用者必须知道的全部信息（不仅是类型签名，还包括不变量、错误模式、排序约束）
- **Depth**：接口的杠杆——大量行为藏在简洁接口后
- **Seam**：可以不改动代码就能改变行为的地方
- **Leverage**：调用者从深度中获得的——一个实现回报 N 个调用点和 M 个测试
- **Locality**：维护者从深度中获得的——改动、bug、知识集中在一处

**核心原则**：
- **删除测试**：想象删除模块，复杂度消失 = 透传；复杂度分散到 N 个调用者 = 真正有价值
- **接口就是测试面**：调用者和测试跨同一个 seam
- **一个 adapter = 假设的 seam，两个 adapter = 真正的 seam**

**流程**：
1. 探索代码库，感知摩擦点
2. 提供深化候选列表
3. 用户选择后进入盘问对话
4. 决定结晶化时内联更新 CONTEXT.md 和 ADR

### 3.6 /to-prd — 生成 PRD

将当前对话上下文转化为 PRD 并发布到 Issue Tracker。

**不做盘问**——只综合已有内容。模板包括：问题陈述、解决方案、用户故事（大量）、实现决策、测试决策、范围外。

### 3.7 /to-issues — 拆分为 Issue

将计划/PRD 拆分为**垂直切片**（曳光弹）的独立 Issue。

**垂直切片规则**：
- 每个切片穿越所有层（schema、API、UI、tests）
- 完成即可独立演示
- 宁可多切细，不要少切粗
- 区分 AFK（Agent 可独立完成）和 HITL（需要人类交互）

### 3.8 /triage — Issue 分诊

通过状态机管理 Issue：

```
未标记 → needs-triage → needs-info（等回复）
                      → ready-for-agent（AFK 就绪）
                      → ready-for-human（需人工）
                      → wontfix（关闭）
```

**Agent Brief 要点**：
- 描述接口和类型而非文件路径（路径会过时）
- 行为导向而非过程导向
- 必须有可验证的验收标准

关键原则：**耐久性 > 精确性**——Issue 可能在 ready-for-agent 状态躺几周，代码库已经变了。

### 3.9 /zoom-out — 放大视角

遇到不熟悉的代码区域时让 Agent 用项目术语表解释整个模块全景图：

> "I don't know this area of code well. Go up a layer of abstraction. Give me a map of all the relevant modules and callers, using the project's domain glossary vocabulary."

### 3.10 /prototype — 快速原型

**一次性代码**，只为回答一个问题。

两种分支：
- **逻辑原型**：可交互终端 App，推演状态机
- **UI 原型**：同一路由下多个截然不同的 UI 变体，通过 URL 参数切换

规则：标记为一次性、一行命令运行、无持久化、零 polish、展示完整状态、答完即删或吸收。

### 3.11 /setup-matt-pocock-skills — 初始化配置

每个仓库首次使用时运行，搭建：
- Issue Tracker 配置（GitHub/Linear/本地文件）
- Triage 标签映射
- CONTEXT.md/ADR 文档布局

---

## 四、生产力技能（Productivity）

### 4.1 /caveman — 压缩通信模式

将 token 消耗削减约 75%：
- 去掉冠词、填充词、客套话
- 允许碎片句，用短同义词
- 技术术语和代码块保持原样
- 安全警告和不可逆操作时自动退出压缩模式

示例：
> 不用："Sure! I'd be happy to help you with that. The issue you're experiencing is likely caused by..."
> 用："Bug in auth middleware. Token expiry check use `<` not `<=`. Fix:"

### 4.2 /handoff — 会话交接

将当前对话压缩为交接文档，保存到系统临时目录。下一个 Agent 可以直接继续工作。不重复已记录在 PRD/ADR/Issue 中的内容。

### 4.3 /write-a-skill — 编写新技能

创建 Skill 的规范：
- SKILL.md 控制在 100 行以内
- 超过 100 行按领域拆分引用文件
- description 是 Agent 看到的**唯一选择依据**——必须包含触发场景
- 确定性操作写成脚本而非每次生成代码

---

## 五、辅助技能（Misc）

- **git-guardrails-claude-code**：阻止危险 git 命令（push、reset --hard、clean 等）
- **setup-pre-commit**：配置 Husky pre-commit hooks

---

## 六、最佳实践总结

### 6.1 工作流全景

```
/setup-matt-pocock-skills    ← 一次性初始化
        ↓
/grill-with-docs             ← 每次修改前：对齐理解 + 建立共享语言
        ↓
/to-prd 或 /to-issues        ← 将共识转化为结构化的 Issue
        ↓
/tdd                         ← 红-绿-重构循环实现
        ↓
/diagnose                    ← 出问题时：结构化调试
        ↓
/improve-codebase-architecture ← 定期运行：防止代码腐化
        ↓
/zoom-out                    ← 遇到不熟悉代码时
        ↓
/handoff                     ← 会话切换时交接
```

### 6.2 核心思想对比

| Superpowers | 其他方案（GSD/BMAD/Spec-Kit） |
|-------------|---------------------------|
| 技能独立、可组合 | 整套流程，全部或全不 |
| 你掌控流程 | 工具掌控流程 |
| 过程 bug 可见可修复 | 过程 bug 藏于黑盒 |
| 技能可自行修改 | 不可修改 |
| 适合真实工程 | 适合原型开发 |

### 6.3 三条黄金规则

1. **反馈速度是你的速度上限** —— 没有快速反馈闭环的 Agent 就是在盲飞
2. **共享语言是一切的基础** —— CONTEXT.md 比任何 prompt 技巧都重要
3. **每天投资代码设计** —— Agent 加速熵增，你必须反向加速重构

### 6.4 与 Claude Code 的集成

通过 `npx skills@latest add mattpocock/skills` 安装，选择需要的技能和 Agent 目标。每个技能作为 `/skill-name` 命令使用。

CONTEXT.md 和 CLAUDE.md 互补：CLAUDE.md 告诉 Agent 如何行为，CONTEXT.md 告诉 Agent 用什么语言——两者都是共享上下文，但职责不同。