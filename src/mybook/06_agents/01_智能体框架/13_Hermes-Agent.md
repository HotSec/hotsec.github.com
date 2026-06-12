# Hermes Agent 框架教程

## 概述

Hermes Agent 是 **Nous Research** 于 2026 年 2 月发布的开源自主 AI 智能体框架（MIT 许可证）。它不是一个聊天机器人或 IDE 代码补全工具，而是一个部署在用户自己服务器上的**持久化、自我进化的数字同事**——连接消息账户、持续学习项目、自动构建技能，运行越久越聪明。

- **GitHub**：[nousresearch/hermes-agent](https://github.com/nousresearch/hermes-agent)
- **许可证**：MIT
- **语言**：Python 3.11+
- **Star**：64k+
- **定位**：自我进化的开源 AI 智能体框架

```bash
# 一键安装
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

---

## 一、核心理念

### 1.1 与普通 Agent 框架的区别

| 维度 | 传统 Agent 框架（LangGraph/CrewAI） | Hermes Agent |
|------|-----------------------------------|--------------|
| 定位 | 开发框架，需编写代码构建 Agent | 即装即用的自主智能体 |
| 学习能力 | 固定行为，需手动修改 | 自动从经验中创建技能 |
| 记忆 | 会话级，重启即丢失 | 持久化记忆，跨会话累积 |
| 运行模式 | 按需调用的函数/工作流 | 常驻后台服务，7×24 在线 |
| 部署 | 嵌入应用中 | 独立部署，消息平台接入 |
| 目标用户 | 开发者构建 Agent 系统 | 最终用户直接使用 + 开发者扩展 |

### 1.2 设计哲学

```
经验 → 技能沉淀 → 能力增长 → 更好处理新任务 → 继续积累经验
```

Hermes Agent 的核心是**闭环学习**：每完成一个任务，自动将解决过程提炼为可复用的技能文档（SKILL.md），下次遇到类似问题时直接调用，实现"越用越聪明"。

---

## 二、六大技术支柱

### 2.1 GEPA 自我进化引擎

由 UC Berkeley、Stanford、MIT 研究者联合开发的 prompt 优化引擎，以类反向传播方式优化系统提示词。

| 对比维度 | 传统强化学习 | GEPA |
|---------|------------|------|
| 评估次数 | 上万次 | 100–500 次 |
| 优化目标 | 模型权重 | Prompt 策略 |
| 迭代速度 | 慢（需 GPU 训练） | 快（文本级优化） |

**闭环流程**：
```
行为记录 → 效果评估 → 策略优化 → 技能沉淀
    ↑                                      |
    └──────────────────────────────────────┘
```

### 2.2 持久记忆架构

两个自动管理的记忆文件，底层基于 **SQLite FTS5 全文搜索 + LLM 摘要**：

| 文件 | 内容 | 示例 |
|------|------|------|
| `MEMORY.md` | 环境事实、经验教训、项目知识 | "项目使用 PostgreSQL 14，端口 5432" |
| `USER.md` | 用户偏好、习惯、约束 | "用户偏好简洁回复，讨厌 emoji" |

**关键特性**：
- 内置"定期推动机制"自动评估持久化内容质量
- Prompt 注入安全扫描
- 支持手动编辑和自动合并

### 2.3 技能自动学习系统

完成任务后自动将解决方案沉淀为 Markdown 技能文件，遵循 `agentskills.io` 开放标准。

**渐进式披露（节省上下文）**：
```
Level 0（~3000 tokens）：技能概要，快速匹配
Level 1（完整内容）：详细步骤和参数
Level 2（深入参考）：边缘案例和高级用法
```

**技能生命周期**：
```
发现问题 → 解决问题 → 提炼为 SKILL.md → 存入技能库
                                            ↓
                                    使用中持续改进
                                            ↓
                                    可发布到技能市集
```

- 内置 40+ 技能（MLOps、GitHub、图表、笔记等）
- 技能使用越频繁，质量越高
- 可从 agentskills.io 社区安装共享技能

### 2.4 200+ 模型零锁定

通过 OpenRouter 统一接入 200+ 模型，一行命令切换：

```bash
# 切换模型
hermes model claude-sonnet-4-20250514
hermes model deepseek-v3
hermes model gpt-4o

# 本地模型
hermes model ollama/llama3
hermes model vllm/qwen2.5
```

| 接入方式 | 说明 |
|---------|------|
| Nous Portal | 原生 OAuth 集成 |
| OpenRouter | API Key 访问 200+ 模型 |
| 自定义 API | 任何 OpenAI 兼容端点 |
| 本地 vLLM/Ollama | 完全离线运行 |

### 2.5 15+ 平台全接入

一个网关进程同时接入所有消息平台，统一记忆与人格：

```
                    ┌─────────────┐
                    │   Gateway   │
                    │  (单进程)    │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐
    │  Telegram   │ │   Discord   │ │   Slack     │
    └─────────────┘ └─────────────┘ └─────────────┘
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  WhatsApp   │ │   Signal    │ │ 飞书/钉钉    │
    └─────────────┘ └─────────────┘ └─────────────┘
```

- 支持 Telegram、Discord、Slack、WhatsApp、Signal
- 支持飞书、钉钉、企业微信（中文生态）
- 支持语音转录
- CLI 直接交互

### 2.6 企业级安全

| 安全机制 | 说明 |
|---------|------|
| 指令审批 | 关键操作需人工确认 |
| Docker 沙箱 | 容器隔离执行，只读根文件系统 |
| 路径遍历防护 | 防止越权文件访问 |
| SSRF 缓解 | 限制内网请求 |
| 凭证管理 | `.env` 加密存储密钥 |
| 零 CVE | 200+ 安全补丁，至今零漏洞 |

---

## 三、技术架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────┐
│                   Gateway（消息网关）              │
│  Telegram │ Discord │ Slack │ WhatsApp │ CLI ... │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────┐
│                 Hermes Core（核心引擎）            │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │  GEPA     │ │  Memory  │ │  Skill System    │ │
│  │  Engine   │ │  System  │ │  (Auto-learn)    │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │  Tool     │ │  Sub-    │ │  Cron            │ │
│  │  Router   │ │  Agents  │ │  Scheduler       │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────┐
│              Execution Backends（执行后端）        │
│  Local │ Docker │ SSH │ Daytona │ Modal │ HPC   │
└─────────────────────────────────────────────────┘
```

### 3.2 分布式子代理架构

支持生成隔离的子代理并行处理复杂工作流：

```python
# 子代理间通过 RPC 通信，将多步流水线压缩为原子操作
main_agent
    ├── sub_agent_1: 独立对话 + 独立终端
    ├── sub_agent_2: 独立对话 + 独立终端
    └── sub_agent_3: 独立对话 + 独立终端
```

**关键特性**：
- 子代理彼此隔离，故障不传播
- RPC 风格工具调用，降低上下文消耗
- 真正并发处理大规模任务

### 3.3 六种执行后端

| 后端 | 适用场景 | 特点 |
|------|---------|------|
| Local | 开发测试 | 直接本地执行 |
| Docker | 安全隔离 | 容器沙箱，保护宿主 |
| SSH | 远程部署 | 远程服务器操控 |
| Daytona | 团队协作 | Serverless，空闲休眠 |
| Singularity | 高性能计算 | HPC 集群支持 |
| Modal | 经济方案 | 按需唤醒，空闲近零成本 |

### 3.4 MCP 协议深度集成

自 v0.6.0 起原生支持 Model Context Protocol：

```
Hermes Agent ←→ MCP Client ←→ MCP Server（任何兼容工具/服务）
```

- 支持 **stdio 和 HTTP** 双传输协议
- v0.8.0 引入 MCP OAuth 2.1 认证
- 任何 MCP 兼容工具均可被 Hermes Agent 直接调用

### 3.5 API 设计

| 接口 | 说明 |
|------|------|
| OpenAI 兼容 API | 自 v0.4.0 提供，可被现有工具调用 |
| MCP 协议接口 | 标准 MCP 客户端连接 |
| Plugin 系统 | v0.8.0 引入，加载外部插件 |
| OpenRouter API | 统一密钥访问 200+ 模型 |

---

## 四、安装与部署

### 4.1 一键安装（推荐）

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

自动配置：Python 3.11、Node.js v22、ripgrep、ffmpeg 等依赖。

### 4.2 手动安装

```bash
git clone --recurse-submodules https://github.com/NousResearch/hermes-agent.git
cd hermes-agent
uv pip install -e ".[all]"
```

### 4.3 Docker 生产部署（推荐）

```bash
docker run -d --name hermes --restart unless-stopped \
  -v ~/.hermes:/opt/data \
  -e ANTHROPIC_API_KEY=your-key \
  nousresearch/hermes-agent gateway run
```

**最低资源要求**：1 GB 内存 / 1 核 CPU / 500 MB 磁盘
**推荐配置**：2–4 GB 内存 / 2 核

### 4.4 消息网关配置

```bash
# 交互式配置平台接入
hermes gateway setup

# 安装为 systemd 服务
hermes gateway install

# 启动网关
hermes gateway run
```

### 4.5 目录结构

```
~/.hermes/
├── config.yaml          # 主配置文件
├── .env                 # 密钥和环境变量
├── memories/
│   ├── MEMORY.md        # 环境知识记忆
│   └── USER.md          # 用户偏好记忆
├── skills/              # 技能库
│   ├── builtin/         # 内置 40+ 技能
│   └── learned/         # 自动学习的技能
└── sessions/            # 会话记录
```

---

## 五、常用命令

```bash
# 启动 CLI 交互
hermes

# 模型管理
hermes model                   # 查看当前模型
hermes model list              # 列出可用模型
hermes model claude-sonnet-4   # 切换模型

# 网关管理
hermes gateway setup           # 配置消息平台
hermes gateway install         # 安装 systemd 服务
hermes gateway run             # 启动网关
hermes gateway status          # 查看网关状态

# 技能管理
hermes skills list             # 列出所有技能
hermes skills install <name>   # 安装社区技能
hermes skills create <name>    # 手动创建技能

# 维护
hermes doctor                  # 诊断并修复环境问题
hermes update                  # 更新到最新版本

# 定时任务
hermes cron list               # 查看定时任务
hermes cron add "0 9 * * *" "每日晨报"  # 添加定时任务
```

---

## 六、与其他框架对比

### 6.1 定位差异

| 维度 | Hermes Agent | LangGraph | CrewAI | AutoGen |
|------|-------------|-----------|--------|---------|
| 类型 | 自主智能体 | 开发框架 | 开发框架 | 开发框架 |
| 目标用户 | 最终用户 + 开发者 | 开发者 | 开发者 | 开发者 |
| 部署方式 | 独立服务 | 嵌入代码 | pip 包 | pip 包 |
| 持久记忆 | ✅ 内置 | 🔧 需手动实现 | ❌ | ❌ |
| 自动学习 | ✅ GEPA引擎 | ❌ | ❌ | ❌ |
| 消息平台 | 15+ 内置 | ❌ | ❌ | ❌ |
| MCP 支持 | ✅ 原生 | ✅ | ❌ | ❌ |
| 定时任务 | ✅ Cron内置 | ❌ | ❌ | ❌ |
| 开源协议 | MIT | MIT | MIT | MIT |

### 6.2 适用场景选择

| 场景 | 推荐框架 | 理由 |
|------|---------|------|
| 需要即装即用的 AI 助手 | **Hermes Agent** | 一键安装，开箱即用 |
| 构建自定义 Agent 工作流 | LangGraph | 最大灵活性 |
| 角色扮演式多 Agent 协作 | CrewAI | 角色抽象清晰 |
| 对话驱动协作 | AutoGen | GroupChat 模式 |
| 需要持久记忆+自动进化 | **Hermes Agent** | 唯一内置学习循环 |
| 多平台消息接入 | **Hermes Agent** | 原生 15+ 平台 |

---

## 七、实战示例

### 7.1 基础交互

```bash
# 启动 CLI
$ hermes

> 帮我写一个 Python 脚本，监控 /var/log 目录的磁盘使用率，超过 80% 发送告警
```

Hermes Agent 会自动：
1. 分析需求
2. 编写脚本
3. 在 Docker 沙箱中测试
4. 验证功能
5. 将解决方案沉淀为技能

### 7.2 定时任务

```bash
# 每天早上 9 点生成日报并推送到 Telegram
hermes cron add "0 9 * * *" "总结过去24小时的系统日志，生成日报并发送到 Telegram"

# 每小时检查服务健康状态
hermes cron add "0 * * * *" "检查所有 Docker 容器状态，异常时通知我"
```

### 7.3 多平台协作

```bash
# 配置 Telegram
hermes gateway setup
# 选择 Telegram → 输入 Bot Token

# 配置飞书
hermes gateway setup
# 选择 Feishu → 输入 App ID 和 Secret

# 现在可以在 Telegram 和飞书中与同一个 Hermes Agent 对话
```

### 7.4 技能创建与管理

```bash
# 查看已学技能
hermes skills list

# 输出示例：
# builtin/git-workflow     - Git 分支管理和 PR 流程
# builtin/docker-deploy    - Docker 容器部署
# learned/monitor-disk     - 磁盘使用率监控（自动学习）
# learned/backup-database  - 数据库备份脚本（自动学习）

# 手动创建技能
hermes skills create deploy-app --description "应用部署流程"
```

---

## 八、版本演进

| 版本 | 日期 | 关键更新 |
|------|------|---------|
| v0.1.0 | 2026.02.25 | 首发，基础 Agent 能力 |
| v0.2.0 | 2026.03.12 | MCP 协议支持，70+ 内建技能 |
| v0.4.0 | 2026.03.23 | OpenAI 兼容 API 上线 |
| v0.7.0 | 2026.04.03 | 安全稳定性强化 |
| v0.8.0 | 2026.04.08 | 后台任务通知、MCP OAuth 2.1、Plugin 系统 |

---

## 九、最佳实践

### 9.1 何时使用 Hermes Agent

| ✅ 适合 | ❌ 不适合 |
|--------|---------|
| 需要长期运行的 AI 助手 | 一次性脚本调用 |
| 多平台消息接入需求 | 纯 API 编程接口 |
| 希望 AI 越用越聪明 | 行为需要 100% 确定性 |
| DevOps/运维自动化 | 需要深度自定义工作流 |
| 不想写代码的最终用户 | 需要嵌入现有应用的 SDK |

### 9.2 安全建议

```bash
# 使用 Docker 沙箱执行（推荐）
hermes config set execution.backend docker

# 启用指令审批
hermes config set safety.approval required

# 限制子代理数量
hermes config set subagents.max 5

# 定期审查记忆内容
cat ~/.hermes/memories/MEMORY.md
```

### 9.3 性能优化

```bash
# 小型任务使用便宜模型
hermes model openrouter/deepseek-v3

# 复杂推理使用高端模型
hermes model claude-sonnet-4-20250514

# 定期清理过期会话
hermes sessions prune --older-than 30d
```

### 9.4 技能维护

- 定期审查自动学习的技能质量：`hermes skills review`
- 删除低质量技能：`hermes skills remove <name>`
- 导出技能分享给团队：`hermes skills export <name>`
- 从社区安装高质量技能：`hermes skills install community/<name>`

---

## 十、总结

Hermes Agent 代表了 AI Agent 从"开发框架"到"自主数字同事"的范式转变。其核心差异化优势在于：

1. **闭环学习**：GEPA 引擎 + 自动技能创建，唯一真正"越用越聪明"的 Agent
2. **持久记忆**：跨会话的知识积累，不需要每次重新解释上下文
3. **即装即用**：一条 curl 命令完成安装，无需编写代码
4. **全平台覆盖**：15+ 消息平台 + CLI，统一记忆与人格
5. **企业级安全**：零 CVE、沙箱隔离、路径防护、凭证管理

对于希望快速拥有一个能自我进化的 AI 助手的团队，Hermes Agent 是当前最成熟的选择。
