# minibot 设计文档

> 日期：2026-06-11
> 负责人：社区贡献者
> 状态：**草稿 / 待 review**
> 范围：`third/nanobot` 分叉 → `third/nanobot`（同一仓库，切分支 `minibot`）
> 仓库分支：`minibot`（新建，基于 `main` / 当前 HEAD）

---

## 1. 摘要（动机 + 背景 + 目标 + 非目标）

### 1.1 动机
nanobot 当前是一个"全渠道 Agent 平台"：
- 支持 14 种 IM Channel（Telegram/Discord/Feishu/Slack/QQ/WeChat/…）
- 内置 Web UI + Desktop + API Server + Bridge
- 20+ LLM Provider（Anthropic / OpenAI / Azure / Bedrock / Copilot / Novita / Mistral / MiniMax / DeepSeek / Gemini / XAI / LiteLLM …）
- 20+ CLI 命令、独立打包成 Docker 镜像
- 近 60 个第三方依赖

对于只想把它当作"一个会写代码的本地 Shell 助手"的用户，上述大部分能力带来的是维护成本与启动摩擦，而不是核心价值。

### 1.2 目标（minibot）
从 nanobot 派生一个**最小内核**：
- **只保留一个 LLM Provider**（OpenAI 兼容协议）→ 任何 `/chat/completions` 端点都能跑
- **只保留 CLI 入口**（交互式 `minibot agent`），删除所有 IM Channel / Web UI / Desktop / Bridge / API Server
- **保留完整 Agent 工具集**（filesystem / shell / web / search / spawn / long_task / mcp / cron / image_generation / self + 空壳 message 工具）
- **保留完整 Agent 心智**（Memory / Consolidator / Dream / AutoCompact / Subagent / Skills / Model Presets）
- **精简依赖到 ~20 个**（核心 CLI + HTTP + HTTPX + Pydantic + Jinja2 + 少量工具链）
- **文件数量从 ~450 → ~150**（砍掉 2/3 非核心文件）

### 1.3 非目标（明确不做）
- 不新增任何 feature（只删代码、不写新能力）
- 不重命名项目名或包名（Python 包名仍叫 `nanobot`，但对外命令变为 `minibot`）
- 不破坏现有核心数据结构（session / checkpoint / memory 的文件格式保持兼容）
- 不修改 core Agent Loop / Agent Runner / ContextBuilder 的业务逻辑（只删外围壳）
- 不做跨语言（保持纯 Python）

---

## 2. 功能规格

### 2.1 用户旅程（保留的只有 1 条）

```
用户终端
  └── minibot onboard          # 生成 ~/.minibot/config.yaml（只含 OpenAI 兼容字段）
  └── minibot model            # 列出 / 热切换模型 preset
  └── minibot skill            # skill 相关命令（list / load / sync）
  └── minibot status           # 显示运行时状态（session / model / skill）
  └── minibot agent            # ⭐ 主入口：交互式对话（替代 serve/gateway/channels）
```

### 2.2 `minibot agent` 主循环（保留）

```
STDIN ──► AgentRunner ──► ContextBuilder(tools + memory + skills)
                         ├── LLMProvider(OpenAI 兼容, streaming)
                         ├── ToolRegistry → Tool.execute()（filesystem/shell/web/…）
                         ├── MemoryStore(Consolidator + Dream)
                         ├── checkpoint 落盘（session 目录）
                         └── STDOUT（流式输出 + 工具调用卡片）
```

### 2.3 `message` 工具（空接口策略）

保留 `agent/tools/message.py` 文件，但 `execute()` 不依赖任何 channel：
- 检测到 `ChannelManager._dispatch_outbound` 调用时，**不抛异常**，而是：
  - 在 STDOUT 打印一条 `[message] 无可用 channel，消息已丢弃` 提示
  - 或记录到 `loguru.logger` 的 `INFO` 级别（由配置决定）
- 保持接口签名一致，便于"将来恢复 channel 能力"时只改一行

---

## 3. 技术架构

### 3.1 目录清单（保留 vs 删除）

以下内容均在 `third/nanobot/` 下：

**保留（核心骨架）**

| 路径 | 说明 |
|---|---|
| `nanobot/nanobot.py` | `Nanobot.from_config` + `.run` SDK 入口 |
| `nanobot/__init__.py`, `__main__.py` | 包入口 |
| `nanobot/cli/commands.py` | 精简命令集（onboard / agent / model / skill / status / version） |
| `nanobot/cli/models.py`, `stream.py` | 模型命令 / 流式 UI |
| `nanobot/agent/*`（全） | `loop`, `runner`, `context`, `memory`, `consolidator`, `dream`, `autocompact`, `hook`, `progress_hook`, `subagent`, `skills`, `model_presets`, `tools/*`（18 个工具）|
| `nanobot/bus/*` | `queue.py`, `events.py`, `runtime_events.py` |
| `nanobot/session/*` | `manager.py`, `goal_state.py` |
| `nanobot/config/*` | `schema` 精简 + `loader.py` |
| `nanobot/providers/base.py`, `factory.py`, `registry.py`, `openai_compat_provider.py` | 只保留 OpenAI 兼容 |
| `nanobot/channels/base.py`, `manager.py`, `registry.py` | 空壳架构（便于 message 工具空接口 / 将来恢复）|
| `nanobot/command/*` | 命令系统（/stop 等 slash 命令） |
| `nanobot/cron/*` | cron 工具依赖 |
| `nanobot/pairing/*` | 保留空壳 |
| `nanobot/security/*` | 工具安全纵深（BLOCKED/READ_ONLY/RESTRICTED） |
| `nanobot/utils/*`（核心 ~8 个） | `helpers.py`, `path.py`, `file_edit_events.py`, `text.py`, `http_client.py`, `version.py`, `async_utils.py`, `logging_setup.py` |
| `nanobot/templates/*` | Jinja2 模板（完整）|
| `nanobot/skills/*` | Skill 定义（完整）|
| `tests/agent/`, `tests/bus/`, `tests/providers/` | 只保留核心测试目录 |
| `tests/conftest.py` | pytest 通用夹具 |
| `pyproject.toml` | 精简依赖 |
| `README.md` | 精简版，聚焦 minibot 用法 |
| `AGENTS.md`, `SOUL.md`, `USER.md` | 保留 |

**删除（外围壳）**

| 路径 | 说明 |
|---|---|
| `webui/`（整个目录） | Web UI（React + Vite）|
| `nanobot/webui/` | Python 侧 WebUI 静态资源封装 |
| `desktop/` | Electron desktop |
| `bridge/` | WebSocket 桥接层 |
| `nanobot/api/server.py` | API server（aiohttp）|
| `nanobot/web/` | Web/HTTP 相关 |
| `nanobot/channels/` 除保留外的 14 个 channel | telegram, discord, feishu, slack, qq, weixin, wecom, email, matrix, dingtalk, napcat, mochat, msteams, signal, websocket, cli_app 等 |
| `nanobot/providers/` 除保留外的 provider | anthropic, azure, bedrock, copilot, codex, minimax, novita, mistral, deepseek, gemini, xai, litellm, together, fireworks, hyperbolic, sambanova, replicate, etc. |
| `nanobot/audio/` | 音频处理（message 工具不依赖）|
| `nanobot/utils/` 与 webui/desktop 相关的文件 | `version_check.py`, `sidebar_state.py`, `transcript.py`, 等 |
| `tests/channels/`, `tests/api/`, `tests/webui/`, `tests/providers/` 对应已删除 provider 的测试 | 删除与被删模块对应的测试 |
| `Dockerfile`, `docker-compose.yml`, `entrypoint.sh`, `.dockerignore` | Docker 相关 |
| `.github/workflows/*` 的部分 workflow | 只保留 CI（pytest + ruff）|

删除的精确文件清单见附录。

### 3.2 架构图（精简后）

```
┌──────────────────────────────────────────────────────────────┐
│                        minibot agent                         │
│                                                              │
│  STDIN  ───►  MessageBus.inbound                             │
│               └──  AgentLoop.run(turn_state_machine)         │
│                    ├── RESTORE (加载 session)                │
│                    ├── COMPACT (记忆压缩)                    │
│                    ├── COMMAND (slash 命令解析)              │
│                    ├── BUILD (ContextBuilder)                │
│                    ├── RUN   (AgentRunner._run_core)         │
│                    ├── SAVE  (checkpoint)                    │
│                    └── RESPOND ──► MessageBus.outbound       │
│                                     └── STDOUT (print)       │
│                                                              │
│  ┌─────────────────────── 运行时  ────────────────────────┐  │
│  │  Provider(OpenAI 兼容, _run_with_retry)                │  │
│  │  ContextBuilder(system_prompt + messages + media)      │  │
│  │  ToolRegistry + 18 个 tools（含 message 空接口）        │  │
│  │  MemoryStore + Consolidator + Dream                    │  │
│  │  SkillsLoader + YAML frontmatter                       │  │
│  │  CommandRouter(/stop, /model, /clear, /skill, ...)     │  │
│  │  CronManager（cron 工具）                               │  │
│  │  SubagentManager(spawn/subagent)                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  SessionDir  ───►  checkpoint / memory / goals / skills      │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. 实施计划（里程碑 / 分步清单）

**分支操作顺序（严格从上到下）**

| 步骤 | 动作 | 风险等级 | 验收方式 |
|---|---|---|---|
| 1 | `git checkout -b minibot`（基于 main） | 低 | `git branch --show-current` → `minibot` |
| 2 | 保留 `nanobot/cli/commands.py` 核心命令，删除其余命令实现（serve / gateway / desktop / channels_* / api_*） | 中 | `minibot --help` 只显示 6 条命令 |
| 3 | 删 `webui/`, `desktop/`, `bridge/` 三个顶级目录 | 低 | `ls third/nanobot` 下不存在这三个目录 |
| 4 | 删 `nanobot/webui/`, `nanobot/api/server.py`, `nanobot/web/` | 低 | 同上 |
| 5 | 删 14 个具体 channel（保留 base/manager/registry） | 中 | `grep -rn "from nanobot.channels" third/nanobot/nanobot/agent tools/message.py` 以外无残留引用 |
| 6 | 删多余 provider（只留 base/factory/registry/openai_compat） | 高 | `ProviderFactory.list()` 只返回 `openai-compat`；对应 test 通过 |
| 7 | 删 `nanobot/audio/` 整个目录 | 低 | 同上 |
| 8 | 删 `nanobot/utils/` 与 webui/desktop 相关的文件 | 中 | `grep -rn "from nanobot.utils" nanobot/` 仅保留核心 ~8 个模块 |
| 9 | `message.py` 工具改造为空接口（`ChannelManager._dispatch_outbound` 不抛错） | 中 | 调用 `message:send` 时只打印提示，不 crash |
| 10 | `nanobot/config/schema.py` 精简：删除其他 provider 的配置段；保留 `extra=allow` | 高 | `Config.from_file("~/.minibot/config.yaml")` 解析通过；未识别字段 warning 但不报错 |
| 11 | `nanobot/channels/registry.py` 空注册（不加载任何 channel） | 低 | `ChannelRegistry.list()` 返回空列表 |
| 12 | `nanobot/utils/logging_setup.py` 移除 webui/desktop 相关 logger 名称 | 低 | 日志正常 |
| 13 | 删 `tests/` 对应被删模块的测试目录/文件 | 低 | `pytest tests/` 仍可跑（剩余测试） |
| 14 | `pyproject.toml` 依赖精简：60 → ~20（见下表） | 高 | `pip install -e .` 成功；import 无 ModuleNotFoundError |
| 15 | `README.md` 精简版（聚焦 minibot 快速开始） | 低 | 文档通顺 |
| 16 | 提交 `git commit -m "chore(minibot): strip to minibot core"` | — | — |

### 4.1 `pyproject.toml` 依赖精简（最终 ~20 个）

| 依赖 | 保留？ | 用途 |
|---|---|---|
| `typer` | ✅ | CLI 框架 |
| `prompt-toolkit` | ✅ | 交互式输入 |
| `questionary` | ✅ | 交互式选择 |
| `rich` | ✅ | 彩色输出 |
| `httpx` | ✅ | HTTP 客户端（LLM + web_fetch） |
| `openai` | ✅（保留 SDK，但核心走 openai_compat_provider） | OpenAI 兼容协议 |
| `anthropic` | ⚠️ 可选？ | 如 openai_compat 不需要 Anthropic SDK，则删除 |
| `tiktoken` | ✅ | token 估算 |
| `pydantic`, `pydantic-settings` | ✅ | 配置 schema + 数据模型 |
| `jinja2` | ✅ | MEMORY.md 模板 |
| `dulwich` | ✅ | GitStore（memory 工具） |
| `readability-lxml`, `lxml-html-clean` | ✅ | web_fetch 提取正文 |
| `ddgs` | ✅ | web_search |
| `pypdf`, `python-docx`, `openpyxl`, `python-pptx` | ✅ | document 工具 |
| `filelock` | ✅ | session 文件锁 |
| `loguru` | ✅ | 日志 |
| `json-repair` | ✅ | LLM JSON 修复 |
| `croniter` | ✅ | cron 工具 |
| `chardet` | ✅ | 文件编码检测 |
| `msgpack` | ✅ | 二进制序列化 |
| `PyYAML` | ✅ | YAML 配置 + skills |
| `socksio`, `python-socks[asyncio]` | ✅ | 代理支持 |
| `python-dateutil` | ✅ | 日期解析 |
| `pytest`, `pytest-asyncio`, `ruff` | ✅（dev） | 测试 + lint |

**删除的依赖**（全部 optional group 直接移除）：
- `aiohttp`（api / webui 需要）
- 所有 IM SDK：`python-telegram-bot`, `discord.py`, `slack-sdk`, `lark-oapi`, `qq-botpy`, `wecom-*`, `dingtalk-stream`, `matrix-nio`, `msteams`, `signal-*`
- 其他 provider SDK：`anthropic`（如 openai_compat 不依赖）、`amazon-bedrock-*`, `google-*`, `mistralai`, `cohere`, `replicate`, `openrouter`, `litellm`, `novita`, `sambanova`, `hyperbolic`, `fireworks`, `together`, `xai`, `minimax`
- Docker / WebUI 相关：移除对应 build 步骤
- `oauth-cli-kit`, `pyjwt`, `cryptography`, `qrcode`（pairing / webui 相关，若 pairing 保留空壳则这些可删）
- `mcp`（若 mcp 工具保留则需保留，**待定**——本设计"全部保留工具"，故 mcp 依赖保留）

**注意**：`mcp` SDK 保留（因为 mcp.py 工具保留）。

### 4.2 `nanobot/config/schema.py` 精简示意

保留的顶层 schema（示意，最终以实际文件为准）：

```yaml
session:
  name: ...
  path: ...
  dir: ...

provider:
  provider: openai-compat       # 唯一选项
  model: gpt-4o-mini
  base_url: https://api.openai.com/v1
  api_key: ${MINIBOT_API_KEY}
  temperature: 0.0
  max_tokens: 4096
  max_iterations: 20
  # extra=allow，其他字段原样透传

channel:                        # 保留结构但 runtime 为空
  enabled: []

agent:
  tools: [filesystem, shell, self, web, search, spawn, subagent, long_task, mcp, cron, image_generation, message, ...]
  tool_allowlist: ...
  tool_blocklist: ...
  enable_memory: true
  enable_dream: true
  # ...

log:
  level: INFO

# 其余 section（audio / webui / desktop / pairing / security 细项）按需精简
```

---

## 5. 风险 + 开放问题

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| `message.py` 工具改造后，其他工具间接触发 `ChannelManager` 时仍有 hidden 引用 | 中 | 中 | `grep -rn "ChannelManager\|_dispatch_outbound\|publish_outbound" nanobot/agent` 扫描；加一个"空壳 manager"在 dispatch 时只打印不抛错 |
| `provider` registry / factory 有跨 provider 的通用逻辑（如 `_run_with_retry` 在 base 中），删除子类不影响 base，但需确认 factory 不硬编码 provider 名 | 高 | 高 | factory 使用 `@register_provider` 装饰器动态注册；删除后运行 `ProviderFactory.list()` 验证 |
| `config/schema.py` 有"如果没配置 anthropic 就默认 fallback 到 openai"之类逻辑 | 中 | 高 | 搜索 `anthropic` / `provider_name` 相关分支，硬编码默认改为 `openai-compat` |
| `utils/` 里某些文件被 agent 模块间接引用（如 `file_edit_events.py` 被 tools/filesystem 使用） | 中 | 中 | 精确列依赖图（见 Section 3 utils 保留清单），删除前 `grep import` 验证 |
| `tests/providers/` 里可能有对删除 provider 的 fixture 引用 | 低 | 低 | 整个删目录，保留 `tests/providers/test_openai_compat.py` + 通用 `conftest.py` |
| `skills/*` YAML 里可能写了 `provider: anthropic` 等字段 | 低 | 中 | Skills 加载时走 `provider` override，运行时会 fallback 到默认 openai-compat；加一条 warning 级日志提醒 |
| 删除 `desktop/` 影响 `nanobot/utils/sidebar_state.py` | 低 | 低 | 一起删 |
| WebSocket Bridge / API Server 的 port 硬编码在 CLI `serve` 中 | 低 | 低 | `serve` 命令一起删 |

---

## 6. 命名（目录 / 文件 / 命令）

| 对象 | 原命名 | 新命名 | 说明 |
|---|---|---|---|
| Git 分支 | （main） | `minibot` | 新分支 |
| CLI 命令 | `nanobot` | `minibot` | `pyproject.toml` 的 `[project.scripts]` 改名 |
| Python 包 | `nanobot` | `nanobot`（不变） | 避免全项目 import 重写 |
| 默认配置目录 | `~/.nanobot` | `~/.minibot` | 与 CLI 命令一致 |
| 默认环境变量 | `NANOBOT_*` | `MINIBOT_*` | 与 CLI 命令一致 |
| Session 路径 | `~/.nanobot/sessions/<name>` | `~/.minibot/sessions/<name>` | 同上 |

---

## 7. 验收标准（QA 清单）

- [ ] `git branch --show-current` → `minibot`
- [ ] `pip install -e third/nanobot` 成功
- [ ] `minibot --help` 显示 6 条命令
- [ ] `minibot onboard` 生成 `~/.minibot/config.yaml`，含 openai-compat 字段
- [ ] `minibot status` 正常输出
- [ ] `minibot model` 列出预设 + 切换成功
- [ ] `minibot agent` 能接受输入、调用工具、流式输出响应、checkpoint 落盘
- [ ] 调用 `message:send` 工具时打印提示并优雅返回，不 crash
- [ ] `pytest tests/` 剩余测试全部通过
- [ ] `ruff check .`（保留 core 目录）0 errors
- [ ] `grep -rn "from nanobot.providers.anthropic\|from nanobot.channels.telegram\|from nanobot.api\|from nanobot.webui" third/nanobot/` → **0 结果**
- [ ] 项目总文件数：nanobot 核心文件 ~150（删除前 ~450）

---

## 8. 参考

- nanobot 源码：`third/nanobot/`
- Agent 源码分析文档：`src/mybook/06_agents/03_AI-Coding实践/04_工具与框架/29_nanobot源码分析.md`

---

## 附录：精确删除文件清单

（**完整列表将在实施阶段根据实际 `find` 输出生成**，以下为粗颗粒范围）

**顶级目录（全部删除）**：
- `third/nanobot/webui/`
- `third/nanobot/desktop/`
- `third/nanobot/bridge/`

**nanobot 包内（精确到文件/目录）**：
- `third/nanobot/nanobot/webui/`（整个目录）
- `third/nanobot/nanobot/api/server.py`（仅保留空 `__init__.py` 或整个删）
- `third/nanobot/nanobot/web/`（整个目录）
- `third/nanobot/nanobot/channels/` 下除 `base.py`, `manager.py`, `registry.py`, `__init__.py` 以外所有文件
- `third/nanobot/nanobot/providers/` 下除 `base.py`, `factory.py`, `registry.py`, `openai_compat_provider.py`, `__init__.py` 以外所有文件
- `third/nanobot/nanobot/audio/`（整个目录）
- `third/nanobot/nanobot/utils/` 下非核心文件（精确列表待 `grep -rn "from nanobot.utils"` 扫描后产出）
- `third/nanobot/nanobot/cli/commands.py` 内删除 `serve()`, `gateway()`, `desktop()`, `channels_*()`, `api_*()` 等命令（精确锚点见实施阶段）

**tests 对应目录**：
- `third/nanobot/tests/channels/`（如果存在）
- `third/nanobot/tests/api/`（如果存在）
- `third/nanobot/tests/webui/`（如果存在）
- `third/nanobot/tests/providers/` 下除 `test_openai_compat.py` 和通用 fixture 外的文件

**构建/部署文件**：
- `third/nanobot/Dockerfile`
- `third/nanobot/docker-compose.yml`
- `third/nanobot/entrypoint.sh`
- `third/nanobot/.dockerignore`

---

## 下一步

- [ ] 设计文档 review 完成（本文件状态 → **Approved**）
- [ ] 切分支 `minibot`
- [ ] 按 Section 4 的 16 步顺序实施
- [ ] 提交 + 跑测试验收
