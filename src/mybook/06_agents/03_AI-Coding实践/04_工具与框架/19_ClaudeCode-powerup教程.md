## Claude Code /powerup 交互式教程完全指南

### 一、/powerup 是什么？

Claude Code v2.1.90+ 内置的交互式教程，10 个课程覆盖从入门到进阶的完整学习路径。

**查看版本：**
```bash
claude --version
# 如果低于 2.1.90，需要升级
npm update -g @anthropic-ai/claude-code
```

**启动教程：**
```bash
claude
# 在输入框输入
/powerup
```

---

### 二、10 大课程速览

| 课程 | 主题 | 核心命令/操作 |
|------|------|--------------|
| 01 | 与代码库对话 | @ 引用文件 |
| 02 | 用模式驾驭 Claude | Shift+Tab 切换模式 |
| 03 | Claude 改错了？一键撤销 | Esc+Esc 或 /rewind |
| 04 | 让 Claude 在后台干活 | 后台运行命令 |
| 05 | 让 Claude 记住你的规则 | CLAUDE.md |
| 06 | 用 MCP 给 Claude 装外挂 | /mcp 管理 MCP |
| 07 | 自动化你的工作流 | Skills 和 Hooks |
| 08 | 让 Claude 的分身帮你干活 | /agents 子代理 |
| 09 | 随时随地编码 | /remote-control 和 /teleport |
| 10 | 调节 Claude 的「大脑」 | /model 和 /effort |

---

### 三、课程详解

#### 01｜与代码库对话

**@ 引用文件的用法：**

```bash
# 引用单个文件
请帮我优化这个组件的样式。@src/components/Timer.tsx

# 引用整个目录
@./src/components/

# 引用多个文件
@./src/App.tsx @./src/styles/global.css
```

**@ 的核心价值：**
- 精准指定文件，节省上下文空间
- 避免 Claude 乱翻文件导致上下文膨胀
- 让 Claude 直奔目标，不迷路

**用 permissions 屏蔽敏感文件：**
```json
// .claude/settings.json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
```

> 一句话总结：**@ 是给 Claude 发精确地址，让它直奔目标，不迷路还省油。养成习惯，能 @ 就 @。**

---

#### 02｜用模式驾驭 Claude

**四个工作模式（Shift+Tab 切换）：**

| 模式 | 编辑 | 命令 | 适用场景 |
|------|------|------|----------|
| **Normal (default)** | 需确认 | 需确认 | 刚入门，需要监督 |
| **accept edits** | 自动 | 需确认 | 日常写代码（黄金档位） |
| **Plan** | 只看不改 | 只看不改 | 复杂任务先规划 |
| **auto** | 自动 | 自动 | 长任务全自动（风险高） |

**使用建议：**
- 新手：从 default 开始
- 日常写代码：accept edits
- 复杂任务：先用 Plan 出方案
- 长重复任务：才考虑 auto

> 一句话总结：**四个模式对应四种信任级别。default 最稳、accept edits 写代码最顺、plan 复杂任务先规划、auto 长任务全自动。**

---

#### 03｜一键撤销

**两种撤销方式：**

```bash
# 方式一：连按两次 Esc
# 在输入框为空时快速连按两次

# 方式二：输入命令
/rewind
```

**回滚范围：**
- 文件内容
- 对话上下文（回滚后 Claude 会「忘记」那次操作之后的所有对话）

**更靠谱的方式：Git**
```bash
# 大改动前先存档
git add .
git commit -m "改动前的存档"

# 万一出问题
git checkout .
```

> 一句话总结：**Claude 改错了不慌，Esc+Esc 或 /rewind 一键回滚。大改动前先 git commit 存档，双重保险。**

---

#### 04｜后台运行

**直接用大白话：**
```bash
请帮我在后台运行 npm run build，跑完了告诉我结果。
```

Claude 会自动用后台模式执行，完成后主动汇报结果。

**查看后台任务：**
```bash
/tasks
```

**适用场景：**
- 项目构建（npm run build）
- 跑测试用例（npm run test）
- 安装依赖（npm install）
- 数据库迁移

> 一句话总结：**后台运行让你不用傻等，用 /tasks 查看后台任务状态。**

---

#### 05｜CLAUDE.md

**创建方式：**
```bash
/init
# Claude 会扫描项目结构，自动生成 CLAUDE.md
```

**CLAUDE.md 层级：**

| 层级 | 路径 | 作用域 |
|------|------|--------|
| 项目级 | `./CLAUDE.md` 或 `.claude/CLAUDE.md` | 当前项目 |
| 个人项目级 | `CLAUDE.local.md` | 当前项目（不提交） |
| 用户级 | `~/.claude/CLAUDE.md` | 所有项目 |

**好的 CLAUDE.md 结构：**
```markdown
# 项目名称

## 技术栈
- React 10 + TypeScript + Tailwind CSS

## 代码规范
- 使用函数式组件，不用 class 组件
- 变量命名用驼峰命名法

## 项目结构
- src/components/ - UI 组件
- src/hooks/ - 自定义 Hook
```

**原则：越精准越好，不是越长越好。**

**/memory 管理记忆：**
```bash
/memory
# 打开记忆管理界面
```

或者直接用自然语言：
```
请记住：我这个项目统一用 pnpm，不用 npm。
```

> 一句话总结：**CLAUDE.md 是给 Claude 装的「长期记忆」，写一次，永远记得。/init 快速创建，/memory 管理偏好，记得保持精简。**

---

#### 06｜MCP 扩展

**MCP = Model Context Protocol（模型上下文协议）**

可以理解为「外挂接口」，让 Claude 能调用更多外部工具。

**管理 MCP：**
```bash
/mcp
```

**添加 MCP server（命令行方式）：**
```bash
claude mcp add <名字> -- <启动命令>
```

**添加 MCP server（配置文件方式）：**
```json
// .mcp.json 或 settings.json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "对应的MCP包名"],
      "env": {
        "API密钥": "你的值"
      }
    }
  }
}
```

**实战：安装 12306-mcp**
```bash
claude mcp add 12306 -s user -- npx -y 12306-mcp

# 验证安装
claude mcp list

# 使用
帮我查 5 月 1 日北京到上海的高铁票，要二等座。
```

**移除 MCP：**
```bash
claude mcp remove 12306 -s user
```

> 一句话总结：**MCP 是给 Claude Code 装外挂的接口，用 /mcp 管理。接入不同 MCP server，让 Claude 能搜索网页、操作数据库、控制浏览器，能力无限扩展。**

---

#### 07｜Skills 和 Hooks

**Skills = 技能包**

给 Claude 装技能包，让它在特定领域更强。

```bash
# 安装 skill
/plugin install frontend-design@claude-plugins-official

# 重载插件（不重启会话）
/reload-plugins

# 卸载
/plugin uninstall frontend-design@claude-plugins-official
```

**Skill 存放位置：**
- `~/.claude/skills/<技能名>/SKILL.md` — 个人全局可用
- `.claude/skills/<技能名>/SKILL.md` — 当前项目可用

**Hooks = 操作钩子**

在操作「之前」或「之后」触发自定义脚本。

| 类型 | 时机 | 适用场景 |
|------|------|----------|
| PreToolUse | 工具执行前 | 输入校验、拦截不安全操作 |
| PostToolUse | 工具执行后 | 自动格式化、自动测试 |

**配置 Hooks：**
```json
// settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs -I {} npx prettier --write {}"
          }
        ]
      }
    ]
  }
}
```

**Hook 应用场景：**
- 自动格式化（Prettier/ESLint）
- 自动测试
- 安全检查
- 自动提交

> 一句话总结：**Skills 给 Claude 装技能包，让它在特定领域更强；Hooks 给操作加钩子，实现自动化工作流。两个配合使用，Claude Code 直接变成你的定制化开发助手。**

---

#### 08｜子代理（Subagents）

**子代理 = Claude 的「分身」**

每个子代理有独立的上下文窗口，跟主对话完全隔离。

**为什么需要子代理？**
1. **独立视角**：Claude 自己写的代码让子代理审查，不会「手下留情」
2. **保护主会话上下文**：子代理的上下文不影响主会话

**创建子代理：**
```bash
/agents
# 选择创建新的子代理，配置：
# - 作用域（Project 或 User）
# - 职责描述
# - 可用工具
# - 模型选择
# - 标识颜色
```

**使用子代理：**
```
用 code-quality-reviewer 帮我审核这个项目的代码
```

**适用场景：**
- 代码审查（独立视角）
- 写测试（不受主对话干扰）
- 查文档（总结要点汇报）
- 多文件批量修改

> 一句话总结：**子代理是 Claude 的「分身」，用 /agents 创建。它有独立的上下文空间，适合做代码审查、写测试等需要「独立视角」的任务。**

---

#### 09｜跨设备协作

**/remote-control（向外暴露）：**
```bash
/remote-control
# 或短别名
/rc
```
让本地的 Claude Code 会话可以被远程控制。

**/teleport（向内传送）：**
```bash
/teleport
# 或短别名
/tp
```
把 claude.ai 网页上的会话传送到本地终端继续。

> 一句话总结：**/remote-control 让你从浏览器遥控终端里的会话，/teleport 把云端会话拉回本地继续。一个向外暴露，一个向内传送，方向相反，搭配使用。**

---

#### 10｜调节模型和思考深度

**切换模型（/model）：**

| 模型 | 特点 | 适用场景 |
|------|------|----------|
| Sonnet | 速度和智能平衡 | 大多数日常任务 |
| Opus | 最强推理能力 | 复杂架构设计、难缠 bug |
| Haiku | 速度最快 | 简单问答、格式转换 |

**调节思考深度（/effort）：**

| 档位 | 特点 | 适用场景 |
|------|------|----------|
| low | 响应最快 | 简单明确任务，如重命名变量 |
| medium | 折中 | 日常修小 bug |
| high | 智能敏感底线 | 复杂推理、Agentic 任务 |
| xhigh | 甜点档 | 长跑编码任务（推荐默认） |
| max | 能力上限 | 真正硬的骨头（先小范围验证） |

**实用组合建议：**

| 场景 | 模型 | 思考档位 |
|------|------|----------|
| 简单代码修改 | Sonnet | medium |
| 日常编码 | Opus/Sonnet | **xhigh** |
| 复杂 bug 排查 | Opus | xhigh，必要时 max |
| 架构设计 | Opus | xhigh 或 max |
| 快速格式转换 | Haiku | low |
| 代码审查 | Sonnet | medium |

**一次性思考增强：**
```bash
请帮我分析这个性能瓶颈的根因。ultrathink
```

> 一句话总结：**/model 切换模型，Sonnet 够用、Opus 最强、Haiku 最快。/effort 设思考档位，日常编码推荐 xhigh，遇到硬骨头再切 max。简单问题别滥用，复杂问题效果拔群。**

---

### 四、补充高频命令

| 命令 | 效果 | 什么时候用 |
|------|------|----------|
| /context | 查看上下文占用 | Claude 开始犯迷糊时 |
| /compact | 压缩对话，保留关键信息 | 继续做同一个任务时 |
| /clear | 彻底清空对话 | 切换到完全不同的任务时 |
| claude --resume | 恢复历史对话 | 关掉终端后想接着干时 |
| claude -c | 直接恢复最近一次对话 | 想快速继续上次的任务 |

---

### 五、总结

/powerup 是 Anthropic 官方推出的 Claude Code 交互式教程，10 个课程覆盖：

1. **@ 引用**：精准定位文件
2. **模式切换**：四种信任级别
3. **撤销回滚**：一键恢复
4. **后台运行**：不用傻等
5. **CLAUDE.md**：长期记忆
6. **MCP**：能力扩展
7. **Skills/Hooks**：自动化工作流
8. **子代理**：独立视角
9. **跨设备**：随时随地编码
10. **模型/思考**：调节大脑

赶紧打开终端，输入 `/powerup`，开始学习！