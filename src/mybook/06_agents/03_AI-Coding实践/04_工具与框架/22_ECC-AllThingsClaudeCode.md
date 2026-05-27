# ECC (Everything Claude Code)：AI 编程时代的第一个操作系统

ECC 是给 Claude Code 装上的一层"外挂操作系统"，由 Affaan Mustafa 在 Anthropic 黑客松夺冠后开源，7 个月狂揽 18.2 万 Stars，170+ 贡献者，被翻译成十几种语言。

> 项目地址：https://github.com/affaan-m/ECC

---

## 一、背景故事

### 1.1 黑客松夺冠

| 项目 | 内容 |
|------|------|
| 时间 | 2025 年 9 月 |
| 地点 | 纽约 |
| 主办方 | Anthropic × Forum Ventures |
| 主角 | Affaan Mustafa + @DRodriguezFX（两人组队） |
| 作品 | zenith.chat（实时协作聊天平台） |
| 结果 | 第一名，奖金 $15,000 |
| 关键 | 不是新奇算法，而是 10 个月打磨的 Claude Code 配置 |

### 1.2 开源爆火

- 2025 年 10 月 → 2026 年 5 月：从零冲到 18.2 万 Stars
- **增长模式**：指数级增长（用的人越多，推荐越多）
- 核心价值：解决 Claude Code 默认配置的痛点

---

## 二、ECC 包含什么

| 组件 | 数量 | 说明 |
|------|------|------|
| Agent | 60 | 专业领域 Agent 分工协作 |
| Skill | 232 | 结构化技能库 |
| Command | 75 | 快捷命令 |
| 安全检查 | 1,282 | AgentShield 安全隐患扫描 |

---

## 三、3 步安装指南

### 3.1 重要警告

**两条路只能选一条，千万别混着装！**

| 路径 | 说明 |
|------|------|
| 插件市场（推荐） | 简单快捷，但需要手动拷 rules |
| 手动安装 | 适合网络环境特殊的情况 |

**最常见翻车**：先装了插件，又跑了 `./install.sh --profile full`，结果技能重复加载，一堆诡异行为。

---

### 3.2 推荐路径：插件安装

**第一步：注册市场地址**

```
/plugin marketplace add https://github.com/affaan-m/ECC
```

**第二步：安装插件**

```
/plugin install ecc@ecc
```

这一步会把 60 个 Agent、232 个技能、75 条命令全部加载。

> **关键**：跑完插件安装后，**绝对不要再去执行** `./install.sh --profile full` 或 `npx ecc-install --profile full`！插件已经加载了所有内容，完整安装器会再往用户目录复制一遍，造成技能重复和运行时冲突。

**第三步：手动拷贝规则文件**

Claude Code 插件系统有个已知限制：不能自动分发 rules（规则文件）。

```bash
git clone https://github.com/affaan-m/ECC.git
cd ECC

# 通用规则（必须装）
mkdir -p ~/.claude/rules/ecc
cp -r rules/common ~/.claude/rules/ecc/

# 按技术栈选装，不要全拷！
cp -r rules/typescript ~/.claude/rules/ecc/
```

规则文件覆盖了 12 种语言生态：TypeScript、Python、Go、Rust、Java、Kotlin、C++、Swift、PHP、Perl 等。

> 先装 `common` 和你的主力语言，别的等你真用到了再加。每个规则文件都会占用 Claude Code 的上下文窗口，一口气全装等于自己给自己降性能。

---

### 3.3 备选路径：手动安装

如果插件市场装不上：

```bash
git clone https://github.com/affaan-m/ECC.git
cd ECC
./install.sh --profile minimal --target claude
```

同样注意：不要和插件路径混用。

---

## 四、推荐协同工具

### 4.1 claude-mem：跨会话记忆

解决 Claude Code 最大的痛点：**每次新会话都是一张白纸**。

```
/plugin install claude-mem
```

工作原理：
1. 每次会话结束时用 AI 压缩关键上下文
2. 存到 SQLite
3. 下次打开 Claude Code，自动注入相关记忆

### 4.2 superpowers：强制规划流程

解决另一个痛点：Agent 一上来就闷头写代码。

```
/plugin install superpowers
```

强制流程：头脑风暴 → 设计 → TDD → 两阶段审查，用 git worktree 隔离每个任务，防止 Agent 写飞。

> **重点**：这两个工具单独用也有价值。如果只想解决「每次从零开始」，只装 claude-mem 就够了。

---

## 五、日常使用：记住这 4 条命令

232 个技能看着吓人，但日常会用的不超过一只手：

| 命令 | 说明 |
|------|------|
| `/ecc:plan "描述需求"` | Planner Agent 拆解需求 → 分派给专门 Agent → 写代码 + 测试 |
| `/code-review` | 5 路并行检查：代码质量/安全性/可维护性/性能/测试覆盖 |
| `/security-scan` | 启动 AgentShield 安全审计 |
| `/simplify` | 重构清洁工：去死代码、提可读性 |

**示例**：
```
/ecc:plan "Add user authentication with OAuth"
```

你说「加个 OAuth 登录」，它自己规划、分任务、写代码、写测试。

---

## 六、AgentShield：三个 AI 互相盯着找漏洞

### 6.1 核心思路

不是正则匹配已知模式——而是派三个 Claude Opus 4.6 Agent 进行红蓝对抗：

| 角色 | 任务 |
|------|------|
| Attacker | 寻找可利用的漏洞链 |
| Defender | 评估现有防御措施 |
| Auditor | 综合双方报告，生成优先级风险清单 |

### 6.2 使用命令

```bash
npx ecc-agentshield scan --opus --stream
```

### 6.3 扫描范围

| 检查项 | 内容 |
|--------|------|
| CLAUDE.md | 是否有硬编码 API 密钥、可注入的指令 |
| settings.json | 权限配置是否有漏洞 |
| MCP 配置 | 服务器风险（覆盖 25+ 已知 CVE） |
| Hooks | 注入分析 |
| Agent 定义 | Prompt 注入、权限提升风险 |

### 6.4 输出示例

```
Grade: B+
Critical: 0 | High: 2 | Medium: 5 | Low: 3

HIGH: Hardcoded API key in CLAUDE.md:15
Fix: Move to environment variable
```

> **重点**：这不是简单模式匹配——三个 Agent 互相博弈，能发现那种「单独看没问题、组合起来要命」的漏洞链。

### 6.5 CI 集成

任何改了 Agent 配置的 PR 都先过 AgentShield 安检。Exit code 2 表示有严重发现，直接卡住构建。

---

## 七、持续学习系统：Claude Code 越用越懂你

### 7.1 问题与解决方案

| 传统 Claude Code | ECC 持续学习 v2 |
|----------------|----------------|
| 每次新会话都是从零开始 | 自动记录你的编码习惯 |
| 不知道你的代码风格 | 观察每次修改，总结规律 |
| 不记得你上次纠正过什么 | 置信度积累，稳定后自动应用 |

### 7.2 学习流程示例

```
Session 1:  纠正 async error 处理模式 → 置信度 0.3 → 记录
Session 5:  同样模式被反复确认 → 置信度 0.6 → 积累
Session 10: 模式稳定 → 置信度 0.9 → 自动应用
```

几周之后，Claude Code 写出来的代码自带你的编码习惯，不再是「所有人用起来都一样」的通用模型输出。

### 7.3 管理命令

```
/instinct-status    # 查看已学习的模式
/evolve             # 把相似模式聚合成新技能
/instinct-export    # 导出你的「习惯」，分享给团队
```

---

## 八、这意味着什么

### 8.1 核心趋势

**AI 编程工具的核心战场，正在从「模型能力」转向「系统集成」**。

模型本身再强，也只能在一个会话窗口里工作。真正的效率提升，来自：

- Agent 编排
- 安全门禁
- 记忆持久化
- 跨会话学习

这些「模型之外」的系统能力。

### 8.2 ECC 的本质

它是把一整套软件工程方法论，编码成了 Agent 可执行的：
- 规则
- 技能
- Hooks

### 8.3 适用人群

ECC 真正适合的是：
> 已经重度使用 AI 编程工具、觉得还能更好用、愿意花半小时配置换来长期效率提升的开发者

它**不是**给「偶尔让 AI 帮忙写个函数」的人准备的。

---

## 九、最佳实践

- 不需要一口气把 60 个 Agent 和 232 个技能全装上
- 挑你需要的，把不需要的卸载掉，保持 Claude Code 的上下文干净
- **ECC 的价值在「可定制」，不在「全都要」**

---

## 十、参考资料

| 资料 | 链接 |
|------|------|
| Reddit 原帖 | https://www.reddit.com/r/AIAgentsInAction/comments/1t84rlc/ |
| ECC GitHub | https://github.com/affaan-m/ECC |
| claude-mem | https://github.com/thedotmack/claude-mem |
| superpowers | https://github.com/obra/superpowers |
