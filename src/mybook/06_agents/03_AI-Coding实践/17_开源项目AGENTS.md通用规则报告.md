# 开源项目 AGENTS.md 通用规则报告

> 基于 72+ 个开源项目的 AGENTS.md / CLAUDE.md 深度分析，提炼跨项目通用规则
>
> 数据来源：06_agents/03_AI-Coding实践路径下的系列合集文档 + GitHub 实际项目文件采集

---

## 一、通用规则总览

分析所有项目后，AGENTS.md 中的通用规则可归纳为 **8 大类别、40+ 条具体规则**。按出现频率排序：

### 频率排名

| 排名 | 规则类别 | 出现频率 | 典型项目 |
|------|---------|---------|---------|
| 1 | 构建/测试命令 | 100% | 全部项目 |
| 2 | 代码风格与格式化 | 95% | Caddy, LangChain, Hugo |
| 3 | Commit/PR 规范 | 90% | Prometheus, Argo CD, lazygit |
| 4 | 项目结构说明 | 80% | Next.js, Strapi, Airflow |
| 5 | 禁止事项清单 | 75% | Bun, Flux2, Pydantic AI |
| 6 | AI 参与规范 | 45% | Gradio, HuggingFace, scikit-learn |
| 7 | 安全要求 | 40% | Sentry, AWS CDK, Dify |
| 8 | Skill/工作流系统 | 20% | Next.js, Remix, OpenAI Agents |

---

## 二、8 大通用规则详解

### 规则 1：构建/测试命令 — 唯一入口原则

**核心规则**：所有项目都指定了唯一的测试入口命令，禁止绕过。

| 规则 | 描述 | 示例 |
|------|------|------|
| 唯一测试入口 | 指定唯一命令运行测试，禁止直接调用底层工具 | MCP SDK: `tox` 为唯一入口，禁止直接 `pytest` |
| 构建前置 | 代码变更后必须构建才能测试 | Airflow: 禁止主机直接 `pytest`，用 `breeze` 隔离环境 |
| 增量测试 | 不要运行全量测试，按包/目录运行 | pnpm: "永远不要运行所有测试，针对特定项目运行" |
| 端到端测试 | E2E 测试通常需要额外环境 | frp: `make e2e` 需要 Ginkgo 框架 |
| 竞态检测 | Go 项目默认启用 `-race` | Caddy: `go test -race -short ./...` |

**跨语言模式**：
- Go: `make build && make test` + `golangci-lint run`
- Python: `make test` 或 `tox` 或 `uv run pytest`，禁止直接 `pytest`
- TypeScript: `pnpm test` + `pnpm lint`
- Rust: `cargo nextest run` + `INSTA_FORCE_PASS=1`

**通用模板**：
```markdown
## Commands
- Build: `make build`
- Test all: `make test`
- Test single: `go test ./pkg/foo/... -run TestBar`
- Lint: `make lint`
- Format: `make fmt`
- Full check: `make pr`  # CI 本地镜像
```

---

### 规则 2：代码风格与格式化 — 匹配现有代码

**核心规则**：永远匹配周围代码的风格，即使你个人偏好不同。

| 规则 | 描述 | 出现项目 |
|------|------|---------|
| 匹配现有风格 | 新代码必须匹配周围代码的风格 | Hugo, Caddy, SvelteKit |
| 格式化工具唯一 | 使用项目指定的格式化工具 | Go: gofmt; Python: ruff; TS: Biome/Prettier |
| 行宽限制 | 明确行宽标准 | Anthropic Cookbook: 100字符; Google ADK: 80字符 |
| 缩进约定 | Tab vs Space 必须统一 | SvelteKit: Tab; Google ADK: 2空格 |
| 命名规范 | 首字母缩略词大写，变量命名风格 | Caddy: `URL`/`HTTP`/`ID`; lazygit: 禁止匈牙利命名 |
| Import 顺序 | 标准库 → 第三方 → 本地包 | Grafana Loki: 标准 Go 导入分组 |
| 类型提示风格 | 函数签名 vs docstring | LangChain: 类型在签名中，不在 docstring |

**关键禁止项**：
- ❌ 不"改进"相邻代码的格式/注释（Karpathy 规则 3）
- ❌ 不为单次使用创建抽象（Karpathy 规则 2）
- ❌ 不做未请求的"灵活性"或"可配置性"
- ❌ 不导入不需要的符号（Hugo）
- ❌ 不使用全局状态（Hugo）

---

### 规则 3：Commit/PR 规范 — 小而专注

**核心规则**：每个 commit 必须独立编译通过测试，保持小而专注。

| 规则 | 描述 | 出现项目 |
|------|------|---------|
| 独立编译 | 每个 commit 必须独立编译通过测试 | Prometheus, Bun, OpenSearch |
| 祈使句风格 | commit message 用祈使句 | Flux2: "大写，无句号，≤50字符" |
| 语义前缀 | PR/commit 使用语义前缀 | Argo CD: `feat:`/`fix:`/`chore:`; pandas: `ENH`/`BUG`/`DOC` |
| DCO 签署 | 部分 CNCF 项目要求 `git commit -s` | Helm, Prometheus |
| 关联 Issue | PR 必须关联已存在的开放 Issue | Argo CD, Gradio |
| Release Notes | PR 必须包含 release-notes 块 | Prometheus: `[BUGFIX]`/`[FEATURE]`/`[ENHANCEMENT]` |
| 禁止 WIP | 不允许"WIP"或不完整的 commit | lazygit |
| 消息说"为什么" | commit message 解释动机而非内容 | lazygit: "diff 已经展示了 what" |

**Lazygit 的 Commit 纪律**（最完善的 commit 规范）：
1. 不留未完成的工作不提交
2. 逻辑单元完成即提交，不等待被要求
3. 任务自然拆分为多个独立 commit 就分多次提交
4. 每个提交必须编译并通过所有测试
5. commit message 解释"为什么"，不解释"做了什么"
6. 先提交重构，再提交行为变更
7. 不使用 conventional commits，匹配项目现有的平述英语风格

---

### 规则 4：项目结构说明 — 地图而非手册

**核心规则**：提供项目结构的精简地图，不做面面俱到的文档。

| 规则 | 描述 | 出现项目 |
|------|------|---------|
| Monorepo 布局 | 列出关键目录及职责 | Next.js, Strapi, Airflow |
| 架构边界 | 说明包间依赖和层级关系 | LangChain, Sentry, Airflow |
| 入口点 | 明确主程序入口和关键文件 | act: `cmd/root.go`; Prometheus: `cmd/prometheus/` |
| 代码生成边界 | 自动生成代码不可手动编辑 | Kyverno, Argo CD, Superset |
| 公共 API 兼容 | 公共 API 变更前检查兼容性 | Helm, LangChain, OpenTelemetry |

**架构描述模式**：
```markdown
## Architecture
cmd/         → CLI 入口
pkg/api/     → HTTP API 层
pkg/service/ → 业务逻辑层
pkg/store/   → 数据访问层
proto/       → Protocol Buffers 定义
```

---

### 规则 5：禁止事项清单 — 说"不做什么"

**核心规则**：明确列出不允许的操作，比"做什么"更重要。

以下是跨项目出现频率最高的禁止项：

#### 5.1 代码行为禁止项

| 禁止项 | 项目 | 原文 |
|--------|------|------|
| 不做超出要求的功能 | Karpathy | "不做推测性的功能" |
| 不"改进"相邻代码 | Karpathy | "不'改进'相邻代码/注释/格式" |
| 不使用 `any` 类型 | Superset | "前端 TypeScript 迁移，禁止 any/JS" |
| 不使用 `eval()`/`exec()` | LangChain | "禁止 eval()/exec()/pickle 处理用户输入" |
| 不使用 `Thread.sleep` | OpenSearch | "使用 assertBusy 或 waitUntil" |
| 不硬编码端口 | Bun | "端口必须用 port: 0" |
| 不使用 `panic!`/`unwrap!` | Ruff, uv | "避免 panic!/unwrap!" |
| 不使用 bare `except Exception` | MCP Python SDK | "禁止 `except Exception`" |
| 不添加未请求的注释 | PyTorch | "最小化注释" |
| 不使用 `.get()` 访问字典 | Home Assistant | "直接 key 访问" |
| 不使用 `fixture.detectChanges()` | Angular | "Zoneless & Async-First" |

#### 5.2 Git/协作禁止项

| 禁止项 | 项目 |
|--------|------|
| 不添加 "Generated with AI" 注释 | Next.js, Bun |
| 不添加 Co-authored-by: AI | PyTorch, Mozilla Bedrock |
| 不直接在 main 分支提交 | Gogs, Dagster |
| 不使用 force-push | FastMCP, Dagster |
| 不创建未经 Issue 授权的 PR | Argo CD |
| 不"路过式"重构 | Argo CD |
| 不幻觉 URL | Argo CD |
| 不添加 `Signed-off-by` trailer | Flux2（用 `Assisted-by` 代替） |

#### 5.3 AI 特有禁止项

| 禁止项 | 项目 |
|--------|------|
| 不添加低价值 AI 生成评论 | OpenTelemetry Python |
| 不做纯 Agent PR（需人类参与）| Gradio, HuggingFace |
| 不假设，不隐藏困惑 | Karpathy |
| 不夸大完成的工作 | Bun: "Be humble & honest" |

---

### 规则 6：AI 参与规范 — 披露与问责

**核心规则**：约 45% 的项目要求披露 AI 参与，方式从简单标注到强制关键词。

| 披露方式 | 项目 | 具体要求 |
|---------|------|---------|
| PR 描述中声明 AI 辅助 | scikit-learn, pandas | 必须包含 AI 辅助声明 |
| 强制关键词 | Gradio | PR 必须包含 "kumquat" 标记 |
| Assisted-by trailer | Flux2, OpenTelemetry Python | 用 `Assisted-by:` 替代 `Co-authored-by:` |
| AI 贡献政策 | Caddy, HuggingFace | 必须披露、完全理解、测试、许可验证 |
| 人类问责制 | HuggingFace | 人类对 AI 生成代码负最终责任 |
| 禁止 Co-authored-by | PyTorch | 干扰 Linux Foundation CLA bot |
| LLM 不列为共同作者 | Mozilla Bedrock | 明确立场 |

---

### 规则 7：安全要求 — 防护性编程

**核心规则**：后端/企业项目必须包含安全防护规则。

| 安全规则 | 项目 | 描述 |
|---------|------|------|
| IDOR 防护 | Sentry | 检查用户对资源的访问权限 |
| 序列化器 N+1 防护 | Sentry | 避免序列化器中的 N+1 查询 |
| 日志无秘密 | Flux2 | 日志或输出中无敏感信息 |
| 无路径遍历 | Flux2 | 验证文件路径 |
| 无命令注入 | Flux2 | 不拼接用户输入到 shell 命令 |
| Token 安全 | AWS CDK | Token 不可泄露到模板输出 |
| 多租户隔离 | Dify | `tenant_id` 贯穿所有数据访问 |
| SDK 契约 | Sentry Python SDK | 不崩溃/不吞异常/不改变引用 |

---

### 规则 8：Skill/工作流系统 — 可复用自动化

**核心规则**：将常见操作封装为可复用的 Skill 或工作流。

| 项目 | Skill 系统 | 代表性 Skill |
|------|-----------|-------------|
| Next.js | `$skill-name` | `$pr-status-triage` / `$flags` / `$dce-edge` |
| Remix | `.agents/skills/` | `add-package` / `fix-issue` / `write-tests` / `make-pr` |
| OpenAI Agents | 强制 Skill | `$code-change-verification` / `$implementation-strategy` |
| PostHog | 4 层自动化 | Linters → lint-staged → Skills → AGENTS.md |
| Prefect | 反模式列表 | 禁止 pip / deferred imports / `--no-verify` |
| TiKV PD | Agent Skills | `create-issue` / `fix-cherry-pick-pr` / `create-pr` |
| Grafana Tempo | 外部指导文件 | `.agents/guidance/coding.md` / `code-review.md` |

---

## 三、通用规则按场景分类

### 场景 A：新建 AGENTS.md

**最小可用版本**（50-100 行）：

```markdown
# AGENTS.md

## 项目概述
一句话说明项目是什么，技术栈，monorepo 结构。

## 命令
- Build: `make build`
- Test: `make test`  
- Lint: `make lint`
- Format: `make fmt`

## 代码风格
- 匹配现有代码风格
- 使用 [formatter] 格式化
- [语言特定的关键约定]

## Commit 规范
- 每个 commit 独立编译通过测试
- 祈使句，简洁明了

## 禁止事项
- 不做超出要求的功能
- 不"改进"相邻代码
- 不添加 AI 生成标记
```

### 场景 B：从零构建完整 AGENTS.md

**推荐结构**（150-300 行）：

1. **项目概述**（10%）— 一句话 + monorepo 结构图
2. **命令速查**（15%）— build/test/lint/format/CI 镜像命令
3. **架构**（15%）— 关键目录职责、核心抽象、包间依赖
4. **代码风格**（15%）— 格式化工具、命名约定、import 顺序
5. **测试规范**（10%）— 测试策略、命名约定、覆盖率要求
6. **PR/Commit 规范**（10%）— 前缀、关联 Issue、DCO 签署
7. **禁止事项**（10%）— 明确的不允许操作清单
8. **AI 参与规范**（5%）— 披露要求、co-author 政策
9. **安全要求**（5%）— 按需，后端项目必备
10. **Skill/工作流**（5%）— 按需，复杂项目推荐

### 场景 C：Python 项目专项规则

基于 Python 项目合集的统计：

| 规则 | 采用率 | 典型做法 |
|------|--------|---------|
| 使用 uv 而非 pip | 60%+ | MCP SDK, FastMCP, Google ADK |
| 使用 ruff 而非 flake8/black | 80%+ | 几乎所有新项目 |
| tox/nox 为唯一测试入口 | 40% | OpenTelemetry, PyCA Cryptography |
| 100% 覆盖率要求 | 20% | MCP SDK (`fail_under=100`), Pydantic AI |
| `from __future__ import annotations` | 15% | Google ADK |
| keyword-only 新参数 | 15% | LangChain, Python Slack SDK |

### 场景 D：Go 项目专项规则

| 规则 | 采用率 | 典型做法 |
|------|--------|---------|
| `make build/test/lint` 三件套 | 90% | 几乎所有项目 |
| `golangci-lint` | 85% | 标准 linter |
| table-driven tests | 80% | Go 测试标准模式 |
| DCO 签署 `git commit -s` | 40% | CNCF 项目要求 |
| `-race` 竞态检测 | 60% | Caddy, usememos |
| gofmt/goimports | 95% | 基本要求 |

---

## 四、规则来源的典型原文

### Karpathy 4 条行为准则（最通用）

> 1. **Think Before Coding** — 不要假设，不要隐藏困惑，呈现权衡
> 2. **Simplicity First** — 解决问题的最少代码，不做推测
> 3. **Surgical Changes** — 只触碰必须的，只清理自己的
> 4. **Goal-Driven Execution** — 定义成功标准，循环直到验证

### Bun 的关键规则（最严格）

> - 永远不用 `bun test`，必须用 `bun bd test`
> - 端口必须用 `port: 0`，禁止硬编码
> - 分支名必须以 `claude/` 开头
> - "Be humble & honest" — 永远不要夸大完成的工作

### Argo CD 的零垃圾政策（最严格的 PR 规范）

> - 必须有现有、开放且批准的 GitHub Issue
> - 禁止"路过式"重构
> - 禁止幻觉 URL

### Lazygit 的 Commit 纪律（最完善的 commit 规范）

> - 不留未完成的工作不提交
> - commit message 解释"为什么"，不解释"做了什么"
> - 先提交重构，再提交行为变更
> - 不使用 conventional commits

---

## 五、按项目规模的 AGENTS.md 编写建议

| 项目规模 | 建议行数 | 必须包含 | 参考项目 |
|----------|----------|---------|---------|
| 个人/小型 | 30-100 行 | 命令 + 风格 + 禁止事项 | scikit-learn (25行), Hugo (20行) |
| 中型团队 | 100-250 行 | + 架构 + PR 规范 + 测试策略 | LangChain, Caddy, Prometheus |
| 大型团队 | 250-500 行 | + 安全 + Skill 系统 + 反模式 | Next.js, Sentry, Airflow |
| 超大型/企业 | 500-1000 行 | 多级文件 + 外部指导文件 | Sentry (多级), Grafana Tempo (外部 guidance/) |

---

## 六、反模式清单

编写 AGENTS.md 时应避免的做法：

1. ❌ **过于简短**（<30 行）— 缺少关键信息，AI 无法有效工作
2. ❌ **过于冗长**（>1000 行）— 信息过载，AI 难以定位关键规则
3. ❌ **只说"做什么"不说"不做什么"** — 禁止项比正向规则更有效
4. ❌ **重复内容** — 多个文件重复相同规则（用链接代替）
5. ❌ **无示例的规则** — 规则没有代码示例佐证
6. ❌ **可从代码推断的信息** — 不要在 AGENTS.md 中重复 type signatures
7. ❌ **过度详细的 API 文档** — AGENTS.md 不是 API 参考手册
8. ❌ **忽略 AI 参与规范** — 明确披露要求比隐含规则更有效

---

## 附录：72 个分析项目列表

| # | 项目 | 语言 | 文件 | 行数 |
|---|------|------|------|------|
| 1 | Next.js (vercel/next.js) | TypeScript/Rust | AGENTS.md | ~300 |
| 2 | SvelteKit (sveltejs/kit) | JavaScript | AGENTS.md | ~150 |
| 3 | Astro (withastro/astro) | TypeScript | AGENTS.md | ~200 |
| 4 | Remix (remix-run/remix) | TypeScript | AGENTS.md | ~150 |
| 5 | Angular (angular/angular) | TypeScript | AGENTS.md | — |
| 6 | VS Code (microsoft/vscode) | TypeScript | AGENTS.md | — |
| 7 | Bun (oven-sh/bun) | Zig/C++ | CLAUDE.md | ~100 |
| 8 | pnpm (pnpm/pnpm) | TypeScript | AGENTS.md | — |
| 9 | Hugo (gohugoio/hugo) | Go | AGENTS.md | ~20 |
| 10 | Strapi (strapi/strapi) | TypeScript | AGENTS.md | ~250 |
| 11 | Ghost CMS (TryGhost/Ghost) | JavaScript | — | ~100 |
| 12 | Argo CD (argoproj/argo-cd) | Go/React | AGENTS.md | — |
| 13 | Helm (helm/helm) | Go | AGENTS.md | — |
| 14 | Kyverno (kyverno/kyverno) | Go | AGENTS.md | — |
| 15 | Flux2 (fluxcd/flux2) | Go | AGENTS.md | — |
| 16 | Loki (grafana/loki) | Go | AGENTS.md | — |
| 17 | Tempo (grafana/tempo) | Go | AGENTS.md | — |
| 18 | Prometheus (prometheus/prometheus) | Go | AGENTS.md | — |
| 19 | Grafana (grafana/grafana) | Go/React | AGENTS.md | ~200 |
| 20 | OpenTelemetry Python | Python | — | ~80 |
| 21 | OpenTelemetry Go | Go | AGENTS.md | — |
| 22 | Caddy (caddyserver/caddy) | Go | AGENTS.md | — |
| 23 | GitHub CLI (cli/cli) | Go | AGENTS.md | — |
| 24 | Gogs (gogs/gogs) | Go | AGENTS.md | — |
| 25 | TiKV PD (tikv/pd) | Go | AGENTS.md | — |
| 26 | Elastic Beats (elastic/beats) | Go/Python | AGENTS.md | — |
| 27 | Ansible (ansible/ansible) | Python | — | ~100 |
| 28 | Apache Spark (apache/spark) | Scala | AGENTS.md | — |
| 29 | OpenSearch (opensearch-project/OpenSearch) | Java | AGENTS.md | — |
| 30 | LangChain (langchain-ai/langchain) | Python | AGENTS.md | ~200 |
| 31 | LlamaIndex (run-llama/llama_index) | Python | AGENTS.md | — |
| 32 | OpenAI Agents Python | Python | AGENTS.md | ~300 |
| 33 | Pydantic AI (pydantic/pydantic-ai) | Python | AGENTS.md | ~500 |
| 34 | Google ADK Python | Python | AGENTS.md | ~600 |
| 35 | Hermes Agent | Python | — | ~800 |
| 36 | HuggingFace Transformers | Python | — | ~200 |
| 37 | scikit-learn | Python | AGENTS.md | ~25 |
| 38 | Gradio | Python/Svelte | — | ~100 |
| 39 | OpenAI Codex | TypeScript | AGENTS.md | ~200 |
| 40 | Karpathy Skills CLAUDE.md | 通用 | CLAUDE.md | ~50 |
| 41 | pandas | Python | AGENTS.md | ~50 |
| 42 | PyCA Cryptography | Python+Rust | — | ~50 |
| 43 | Apache Superset | Python/React | — | ~400 |
| 44 | Apache Airflow | Python | — | ~500+ |
| 45 | Prefect | Python | AGENTS.md | ~300 |
| 46 | Dagster | Python/React | — | ~200 |
| 47 | Sentry (getsentry/sentry) | Django/React | 多级 | ~1000+ |
| 48 | PostHog | Django/React | — | ~500+ |
| 49 | Zulip | Django/React | — | ~500+ |
| 50 | Mozilla Bedrock | Django | — | ~200 |
| 51 | Wagtail | Django | — | ~100 |
| 52 | Dify | Flask/Next.js | 多级 | ~500 |
| 53 | Cookiecutter Django | Python/Jinja2 | — | ~300 |
| 54 | OpenAI Swarm | Python | — | ~50 |
| 55 | AutoGen | Python | — | — |
| 56 | CrewAI | Python | — | — |
| 57 | Anthropic Cookbook | Python | CLAUDE.md | ~150 |
| 58 | MCP Python SDK | Python | — | ~200 |
| 59 | FastMCP | Python | — | ~500 |
| 60 | Ruff | Rust | — | ~200 |
| 61 | uv | Rust | — | ~100 |
| 62 | Sentry Python SDK | Python | — | ~80 |
| 63 | Azure SDK for Python | Python | — | ~400 |
| 64 | AWS CDK | TypeScript | — | ~500+ |
| 65 | Chainlit | Python/React | — | ~400 |
| 66 | Python Slack SDK | Python | — | ~200 |
| 67 | Authgear Server | Go | — | ~100 |
| 68 | Kolibri | Django/Vue | — | ~400 |
| 69 | Home Assistant | Python | — | ~50 |
| 70 | PhotoPrism | Go/Vue | — | ~500 |
| 71 | Meilisearch | Rust | — | ~50 |
| 72 | awesome-go | Go | AGENTS.md | ~50 |

此外，FastAPI 相关项目发现 29 个含 AGENTS.md/CLAUDE.md 的项目（详见扫描数据），Go 语言项目发现 8 个（详见 golang-claude-agents-md-report.md）。
