# 开源项目 AGENTS.md / CLAUDE.md 合集

本文档收集了 GitHub 上知名开源项目的 AGENTS.md / CLAUDE.md 文件，按项目类型分类，供编写自己的 AGENTS.md 时参考。

> 参考来源：各项目 GitHub 仓库，截至 2026 年 5 月

---

## 一、框架与运行时

### 1. Next.js (vercel/next.js)

**技术栈**：TypeScript / Rust (Turbopack) / pnpm monorepo

**文件特点**：CLAUDE.md 是 AGENTS.md 的软链接，约 300 行，非常详尽

**核心结构**：
- Monorepo 概览（packages/turbopack/crates/test/examples/docs/scripts）
- 核心包入口点说明（dev server / production server / build）
- 快速本地开发流程（watch mode + skip-isolate）
- 测试命令矩阵（dev-turbo / dev-webpack / start-turbo / start-webpack）
- 测试编写规范（retry() 替代 setTimeout、fixture 目录优于 inline files）
- PR 状态检查脚本（scripts/pr-status.js）
- CI 分析技巧
- 上下文高效工作流（大文件先 grep 再定向读取、批量编辑后一次构建）
- Skill 系统（$pr-status-triage / $flags / $dce-edge / $react-vendoring / $runtime-debug）

**亮点**：
- 明确区分 `NODE_ENV` vs `__NEXT_DEV_SERVER`
- `NEXT_SKIP_ISOLATE` 的使用场景和禁忌
- 测试输出一次捕获到文件再分析，避免重复运行
- 禁止添加 "Generated with Claude Code" 或 co-author footers

**链接**：https://github.com/vercel/next.js/blob/canary/AGENTS.md

---

### 2. SvelteKit (sveltejs/kit)

**技术栈**：JavaScript (JSDoc) / pnpm monorepo

**文件特点**：约 150 行，简洁实用

**核心结构**：
- 快速参考（setup / build / format / lint / check 命令）
- 测试命令（unit / integration / playwright）
- PR 提交前检查清单（6 步）
- 代码风格示例（imports / functions / error handling / TypeScript/JSDoc / formatting / comments）
- 关键包列表
- 故障排除

**亮点**：
- 强调 JSDoc 而非 TypeScript
- Tab 缩进（非 space）
- 100 字符行宽
- 禁止 default exports
- `pnpm new-test` 生成测试文件

**链接**：https://github.com/sveltejs/kit/blob/main/AGENTS.md

---

### 3. Astro (withastro/astro)

**技术栈**：TypeScript / pnpm monorepo

**文件特点**：约 120 行，强调工具链

**核心结构**：
- 风格指南（Biome 格式化）
- Monorepo 结构说明
- 测试运行方式
- Astro 快速参考
- `bgproc` 后台进程管理
- `agent-browser` 浏览器自动化
- 深入参考（Vite Dep Optimizer）

**亮点**：
- 使用 `bgproc` 管理后台 dev server
- 使用 `agent-browser` 做 UI 自动化测试
- 提供 LLM 优化文档链接（llms.txt）
- 深入参考文档（reference/）处理复杂子系统

**链接**：https://github.com/withastro/astro/blob/main/AGENTS.md

---

### 4. Remix (remix-run/remix)

**技术栈**：TypeScript / pnpm monorepo

**文件特点**：约 120 行，Skill 系统最完善

**核心结构**：
- 仓库结构（Monorepo 布局、公共 API 规范）
- 默认开发循环（lint → test:changed → typecheck:changed）
- 代码风格（import type / .ts 扩展名 / 无分号 / 单引号）
- 测试与文档
- Release Notes 规范
- Repo Skills 列表（16 个 Skill）

**亮点**：
- 16 个 Skill 覆盖完整开发流程（add-package / fix-issue / write-tests / make-pr / review-pr 等）
- `src/lib` 禁止添加 barrel re-exports
- 禁止跨包 re-export，直接从拥有包 import
- 测试从源码运行，无需构建步骤

**链接**：https://github.com/remix-run/remix/blob/main/AGENTS.md

---

### 5. Bun (oven-sh/bun)

**技术栈**：Zig / C++ / TypeScript

**文件特点**：约 350 行，最详尽的技术文档

**核心结构**：
- 构建与运行（`bun bd` 调试构建、build-then-exec 模式）
- 测试组织（test/js/bun/ / test/js/node/ / test/bundler/ 等）
- 测试编写规范（单文件 vs 多文件、tempDir、normalizeBunSnapshot）
- 代码架构（Zig / C++ / TypeScript 分层）
- JavaScript 类实现（C++ 绑定模式）
- 代码生成流程
- CI 调试（BuildKite CLI）
- PR 反馈阅读（`bun run pr:comments`）

**亮点**：
- **关键规则**：永远不用 `bun test`，必须用 `bun bd test`
- 端口必须用 `port: 0`，禁止硬编码
- 禁止写检查 "no panic" 的测试（在 CI 中永远不会失败）
- 测试必须用 `USE_SYSTEM_BUN=1` 验证会失败
- 分支名必须以 `claude/` 开头
- "Be humble & honest" — 永远不要夸大完成的工作

**链接**：https://github.com/oven-sh/bun/blob/main/CLAUDE.md

---

### 6. Hugo (gohugoio/hugo)

**技术栈**：Go

**文件特点**：约 20 行，极简风格

**核心内容**：
- 简洁优先
- 假设读者是 Go 专家，不解释显而易见的内容
- 使用 `hdebug.Printf` 做临时调试（CI 会检查未清理的调试输出）
- 不导出不需要的符号
- 避免全局状态
- 测试使用 `qt` matchers
- 测试命名：`TestUpperCaseTitlesCreatesHavocIssue1234`（描述在前，Issue 在后）
- 函数名不用下划线
- 使用 `./check.sh` 迭代检查

**亮点**：最短的 AGENTS.md 之一，但每条规则都精准有效

**链接**：https://github.com/gohugoio/hugo/blob/master/AGENTS.md

---

## 二、AI 与开发者工具

### 7. OpenAI Codex (openai/codex)

**技术栈**：Rust (codex-rs) / TypeScript

**文件特点**：约 200 行，Rust 项目规范

**核心结构**：
- Crate 命名前缀 `codex-`
- Rust 代码规范（format! 内联、clippy 规则、不用 unsigned integer）
- TUI 样式规范（ratatui Stylize trait）
- 快照测试（insta）
- 集成测试工具（core_test_support::responses）
- 沙箱环境变量说明

**亮点**：
- 禁止修改 `CODEX_SANDBOX_NETWORK_DISABLED_ENV_VAR` 相关代码
- TUI 样式有详细的约定（避免 `.white()`、优先 `.into()`）
- 快照测试有完整的更新流程
- 集成测试使用 `ResponseMock` 模式

**链接**：https://github.com/openai/codex/blob/main/AGENTS.md

---

### 8. Anthropic Cookbook (anthropics/anthropic-cookbook)

**技术栈**：Python / Jupyter Notebooks / uv

**文件特点**：约 100 行，Python 项目规范

**核心结构**：
- Quick Start（uv sync / pre-commit / .env）
- 开发命令（make format / lint / check / fix / test）
- 代码风格（100 字符行宽、双引号、Ruff）
- Git 工作流（分支命名、conventional commits）
- 关键规则（API Keys / Dependencies / Models / Notebooks / Quality checks）
- Slash Commands
- 项目结构
- 添加新 Cookbook 流程

**亮点**：
- 模型 ID 规范：永远不用 dated model ID，用别名
- Bedrock 模型 ID 格式不同，单独说明
- Notebook 保留输出（演示目的）
- registry.yaml + authors.yaml 注册机制

**链接**：https://github.com/anthropics/anthropic-cookbook/blob/main/CLAUDE.md

---

### 9. LangChain (langchain-ai/langchain)

**技术栈**：Python / uv monorepo

**文件特点**：约 250 行，Python monorepo 规范

**核心结构**：
- Monorepo 结构（core / langchain / partners / text-splitters / standard-tests / model-profiles）
- 开发工具与命令（uv / make / ruff / mypy / pytest）
- PR 和 Commit 规范（Conventional Commits、scope 必填）
- 核心开发原则（维护稳定公共接口、代码质量标准、测试要求、安全评估、文档标准）
- Model Profiles（langchain-profiles CLI）
- CI/CD 基础设施

**亮点**：
- **关键原则**：任何公共 API 变更前必须检查是否破坏兼容性
- 新参数必须用 keyword-only：`*, new_param: str = "default"`
- 类型提示在函数签名中，不在 docstring 中
- 禁止 `eval()` / `exec()` / `pickle` 处理用户输入
- GitHub Actions 必须锁定到完整 commit SHA
- PR 描述不加 `# Summary` 标题

**链接**：https://github.com/langchain-ai/langchain/blob/master/AGENTS.md

---

### 10. Karpathy Skills CLAUDE.md (forrestchang/andrej-karpathy-skills)

**技术栈**：通用（行为准则）

**文件特点**：约 50 行，最经典的 CLAUDE.md，GitHub 85K+ Star

**核心内容**（4 条行为准则）：

1. **Think Before Coding** — 不要假设，不要隐藏困惑，呈现权衡
   - 明确陈述假设，不确定就问
   - 多种理解时全部呈现，不要静默选择
   - 有更简单方案时说出来，必要时反驳
   - 不清楚就停下来，说出困惑

2. **Simplicity First** — 解决问题的最少代码，不做推测
   - 不做超出要求的功能
   - 不为单次使用创建抽象
   - 不做未请求的"灵活性"或"可配置性"
   - 不为不可能的场景写错误处理
   - 200 行能写成 50 行就重写

3. **Surgical Changes** — 只触碰必须的，只清理自己的
   - 不"改进"相邻代码/注释/格式
   - 不重构没坏的东西
   - 匹配现有风格，即使你会用不同方式
   - 只删除你的变更产生的无用代码

4. **Goal-Driven Execution** — 定义成功标准，循环直到验证
   - "添加验证" → "为无效输入写测试，然后让它们通过"
   - "修复 bug" → "写一个复现它的测试，然后让测试通过"
   - 多步任务先陈述计划

**亮点**：最简洁、最通用的 CLAUDE.md，适用于任何项目

**链接**：https://github.com/forrestchang/andrej-karpathy-skills/blob/main/CLAUDE.md

---

## 三、CMS 与后端

### 11. Strapi (strapi/strapi)

**技术栈**：TypeScript / React / Koa.js / Yarn + Nx monorepo

**文件特点**：约 250 行，企业级 CMS 项目规范

**核心结构**：
- 仓库结构（core / plugins / providers / utils / cli / examples / docs / tests）
- 架构（Strapi 类 DI 容器、Server/Admin 分离、Document Service、Plugin 系统、Content Types、EE/CE 分割）
- 开发（dev sandbox / watch 模式 / 多数据库支持）
- 构建（yarn build / build:code / nx build）
- 测试矩阵（unit / front / ts / api / cli / e2e）
- EE toggles
- 质量门禁（Conventional Commits / TypeScript / Linting & Formatting）
- 安全规范
- PR 指南

**亮点**：
- 目标分支是 `develop` 而非 `main`
- Entity Service 已废弃，必须用 Document Service
- `examples/` 只是沙箱，不提交修改
- workspace deps 用固定版本号而非 `workspace:*`
- `strapi.isLoaded` 必须为 true 才能访问服务

**链接**：https://github.com/strapi/strapi/blob/main/AGENTS.md

---

## 四、模式总结

### 按项目规模分类

| 规模 | 代表项目 | 文件行数 | 特点 |
|------|---------|---------|------|
| 极简 | Hugo | ~20 行 | 只写最关键的规则 |
| 精简 | Karpathy Skills | ~50 行 | 4 条行为准则，通用 |
| 标准 | SvelteKit / Astro / Remix | 120-150 行 | 命令 + 风格 + 测试 |
| 详尽 | Next.js / Bun / Strapi | 250-350 行 | 完整开发指南 |
| 全面 | LangChain / Codex | 200-250 行 | monorepo + CI/CD + 安全 |

### 常见章节统计

| 章节 | 出现频率 | 说明 |
|------|---------|------|
| 构建/开发命令 | 100% | 所有项目都有 |
| 测试命令 | 100% | 所有项目都有 |
| 代码风格 | 90% | 大部分项目有 |
| 项目结构 | 80% | monorepo 项目必备 |
| Git/PR 规范 | 70% | 大型项目有 |
| 安全规范 | 50% | 后端/企业项目有 |
| Skill 系统 | 20% | Next.js / Remix |
| CI/CD | 30% | 大型项目有 |
| 故障排除 | 20% | SvelteKit / Bun |

### 编写建议

1. **行数控制**：目标 100-200 行，遵循"地图而非手册"原则
2. **必须包含**：构建命令、测试命令、代码风格、项目结构
3. **按需包含**：安全规范、CI/CD、Skill 系统、故障排除
4. **避免**：过度详细的 API 文档、可从代码推断的信息
5. **链接优于内联**：详细内容放 docs/，AGENTS.md 只放链接
6. **行为准则**：参考 Karpathy 的 4 条准则作为通用基础
7. **项目特定规则**：如 Bun 的"永远用 bun bd test"、Next.js 的 NEXT_SKIP_ISOLATE 禁忌
