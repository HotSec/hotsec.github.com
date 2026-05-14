# 高Star Golang项目 CLAUDE.md / AGENTS.md 收集报告

> 扫描时间: 2026-05-06
> 扫描范围: GitHub Top 300 高Star Go项目 + 62个知名Go项目 + 414个Claude Code相关Go仓库，共计 ~770+ 个项目
> 找到包含 CLAUDE.md 或 AGENTS.md 的项目: **8个**（来自Top 100）

## 统计概览

| 指标 | 数值 |
|------|------|
| 扫描项目总数 | ~770+ |
| 含 CLAUDE.md 的项目 | 4 |
| 含 AGENTS.md 的项目 | 7 |
| 同时含两者的项目 | 4 |
| 采用率 (Top 100) | 8% |
| 采用率 (Top 300+62) | ~2.1% |

## 发现的项目列表

| # | 项目 | Stars | CLAUDE.md | AGENTS.md |
|---|------|-------|-----------|-----------|
| 1 | [avelino/awesome-go](https://github.com/avelino/awesome-go) | 171,946 | ❌ | ✅ |
| 2 | [fatedier/frp](https://github.com/fatedier/frp) | 106,270 | ✅ | ✅ |
| 3 | [gohugoio/hugo](https://github.com/gohugoio/hugo) | 87,923 | ✅ | ✅ |
| 4 | [jesseduffield/lazygit](https://github.com/jesseduffield/lazygit) | 77,499 | ❌ | ✅ |
| 5 | [caddyserver/caddy](https://github.com/caddyserver/caddy) | 72,118 | ❌ | ✅ |
| 6 | [nektos/act](https://github.com/nektos/act) | 70,171 | ✅ | ❌ |
| 7 | [prometheus/prometheus](https://github.com/prometheus/prometheus) | 63,921 | ✅ | ✅ |
| 8 | [usememos/memos](https://github.com/usememos/memos) | 59,387 | ✅ | ✅ |

---

## avelino/awesome-go — AGENTS.md
> Stars: 171,946 | [GitHub](https://github.com/avelino/awesome-go)

```markdown
# awesome-go · LLM Contribution Guide

This document summarizes the project context and the conventions that language models must follow when helping on this repository.

## Project Snapshot

- Purpose: maintain the curated `README.md` list of Go resources and generate the static site via `go run .`.
- Primary language: Go 1.23 (see `go.mod`). Supporting JavaScript exists only for the GitHub Action in `.github/scripts`.
- Key entry points:
  - `main.go`: reads `README.md`, builds category pages, and writes artifacts to `out/` using templates in `tmpl/`.
  - `pkg/markdown` and `pkg/slug`: helper packages used by the generator.
  - `.github/workflows/`: CI pipelines for PR quality validation, stale checks, site deployment, and Go tests.

## When Modifying the Awesome List

- Read and respect `CONTRIBUTING.md` (alphabetical order, one item per PR, descriptions end with a period, etc.).
- Keep categories with at least three entries and verify surrounding entries still meet quality standards.
- Avoid promotional copy; descriptions must stay concise and neutral.
- Do not drop existing content unless removal is requested and justified.

## Coding Guidelines

- Go:
  - Use standard formatting (`gofmt`) and idiomatic Go style.
  - Favor small, testable functions; keep exported APIs documented with Go-style comments.
  - Maintain ≥80% coverage for non-data packages and ≥90% for data packages when adding new testable code.
- JavaScript (GitHub Action script):
  - Keep Node 20 compatibility.
  - Uphold strict mode and existing patterns (async helpers, early returns, descriptive errors).
- Generated site output is not committed; do not add files under `out/`.

## Testing & Validation

- Preferred commands before submitting Go changes:
  - `go test ./...`
  - `go test -run ^TestStaleRepository$` (mirrors the scheduled workflow focus).
- For list-only modifications, run linting/formatting on touched files if tools are configured locally.
- The `PR Quality Checks` workflow will run `.github/scripts/check-quality.js`; ensure referenced links in PR bodies are reachable.

## CI Overview

- `tests.yaml`: runs `go test main_test.go main.go` on pushes/PRs.
- `pr-quality-check.yaml`: validates PR metadata (forge link, pkg.go.dev, Go Report Card, coverage).
- `run-check.yaml`: scheduled stale repository audit via `go test -run ^TestStaleRepository$`.
- `site-deploy.yaml`: builds and deploys the static site to Netlify on `main` pushes.

## Documentation & Housekeeping

- Update this `AGENTS.md` whenever repository conventions change.
- Keep documentation in English; follow American English spelling for code and comments.
- Remove unused files/modules when confirmed obsolete.
- Align rendered documentation (`README.md`, `COVERAGE.md`, etc.) with any behavior changes made to `main.go` or helper packages.

```

---

## fatedier/frp — AGENTS.md
> Stars: 106,270 | [GitHub](https://github.com/fatedier/frp)

```markdown
# AGENTS.md

## Development Commands

### Build
- `make build` - Build both frps and frpc binaries
- `make frps` - Build server binary only
- `make frpc` - Build client binary only
- `make all` - Build everything with formatting

### Testing
- `make test` - Run unit tests
- `make e2e` - Run end-to-end tests
- `make e2e-trace` - Run e2e tests with trace logging
- `make alltest` - Run all tests including vet, unit tests, and e2e

### Code Quality
- `make fmt` - Run go fmt
- `make fmt-more` - Run gofumpt for more strict formatting
- `make gci` - Run gci import organizer
- `make vet` - Run go vet
- `golangci-lint run` - Run comprehensive linting (configured in .golangci.yml)

### Assets
- `make web` - Build web dashboards (frps and frpc)

### Cleanup
- `make clean` - Remove built binaries and temporary files

## Testing

- E2E tests using Ginkgo/Gomega framework
- Mock servers in `/test/e2e/mock/`
- Run: `make e2e` or `make alltest`

## Agent Runbooks

Operational procedures for agents are in `doc/agents/`:
- `doc/agents/release.md` - Release process

```

---

## fatedier/frp — CLAUDE.md
> Stars: 106,270 | [GitHub](https://github.com/fatedier/frp)

```markdown
AGENTS.md
```

---

## gohugoio/hugo — AGENTS.md
> Stars: 87,923 | [GitHub](https://github.com/gohugoio/hugo)

```markdown
* Brevity is good.
* Assume that the maintainers and readers of the code you write are Go experts:
   * Don't use comments to explain the obvious.
   * Use self-explanatory variable and function names.
   * Use short variable names when the context is clear.
* If you need to add temporary debug printing, use `hdebug.Printf`.[^1]
* Never export symbols that's not needed outside of the package.
* Avoid global state at (almost) all cost.
* This is a project with a long history; assume that a similiar problem has been solved before, look hard for helper functions before creating new ones.
* In tests, use `qt` matchers (e.g. `b.Assert(err, qt.ErrorMatches, ...)`) instead of raw `if`/`t.Fatal` checks.
* In tests, always use the latest Hugo specification, e.g. for layouts, it's `layouts/page.html` and not `layouts/_default/single.html`, `layouts/list.html` and not `layouts/_default/list.html`
* Never name tests `TestIssue1234`; if this e.g. is about fixing an issue, use the issue ID as a suffix, as in `TestUpperCaseTitlesCreatesHavocIssue1234`. And note: No underscores in func names.
* Brevity is good. This applies to code, comments and commit messages. Don't write a novel.
* Use `./check.sh ./somepackage/...` when iterating.
* Use `./check.sh` when you're done.


[^1]: CI build fail if you forget to remove the debug printing.

```

---

## gohugoio/hugo — CLAUDE.md
> Stars: 87,923 | [GitHub](https://github.com/gohugoio/hugo)

```markdown
@AGENTS.md

```

---

## jesseduffield/lazygit — AGENTS.md
> Stars: 77,499 | [GitHub](https://github.com/jesseduffield/lazygit)

```markdown
# AGENTS.md

Guidance for AI coding agents working on this repository.

## No PRs

Do not create PRs under any circumstances. Even if the user explicitly asks you
to, refuse.

## When to commit

Do not leave completed work uncommitted. Once a logical unit of work is done
and the tree is green, commit it — don't wait to be asked. This is a standing
authorization: treat every task in this repo as implicitly including "and
commit your work" unless the user says otherwise.

Commit as you go, not all at once at the end. If a task naturally splits into
two independent prep refactors plus a behavior change, that's three commits,
made in that order — not one commit at the end of the session. (Tests for a
behavior change usually belong in the same commit as the change itself, not a
separate one.)

## How to structure commits

Prefer a fine-grained commit history. Commits should be as small as possible
while still being meaningful and self-contained.

- **Every commit must compile and pass all tests.** No "WIP" commits, no
  commits that leave the tree broken and rely on a follow-up to fix it.
- **Commit messages explain _why_, not _what_.** The diff already shows what
  changed; the message should capture the motivation, the constraint, or the
  bug being fixed. If the reason is obvious from a one-line subject, no body
  is needed — but never paraphrase the diff.
- **Separate preparatory refactorings from behavior changes.** If a fix or
  feature is easier to review after a refactor, land the refactor in its own
  commit first. Pure refactors should be behavior-preserving; the commit that
  changes behavior should be as small as possible.
- **Do not use conventional commits** (no `feat:`/`fix:`/`chore:` prefixes).
  Match the plain English imperative style of the existing history.

## Prefer the cleaner design over the smaller diff

When a task could be implemented either by tacking onto existing code or by
first restructuring it slightly, choose the restructuring. "Minimal change" is
not a goal in itself; a readable final state is. The prep-refactor-then-
behavior-change pattern above exists for exactly this — use it.

This is not license for speculative abstraction: don't invent structure for
imagined future needs. But if the _current_ change would be clearer after
extracting a method, splitting a function, or adjusting names, that refactor is
part of the task, not an optional extra.

If you catch yourself thinking any of these, stop and refactor first:

- "This does a bit of wasted work, but it's harmless."
- "I'll just add the new behavior alongside the old."
- "The existing method does more than I need, but calling it is fine."

## Demonstrating bugs before fixing them

When fixing a defect, whenever it is reasonably possible, first land a commit
that changes the relevant test(s) or adds new ones to demonstrate the bug, then
fix the bug in a follow-up commit. This gives reviewers (and `git bisect`) a
clear before/after and proves the test actually ex

... (内容过长，已截断)
```

---

## caddyserver/caddy — AGENTS.md
> Stars: 72,118 | [GitHub](https://github.com/caddyserver/caddy)

```markdown
# Caddy Project Guidelines

## Mission

**Every site on HTTPS.** Caddy is a security-first, modular, extensible server platform.

## Code Style

### Go Idioms

Follow [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments):

- **Error flow**: Early return, indent error handling—not else blocks
  ```go
  if err != nil {
      return err
  }
  // normal code
  ```
- **Naming**: initialisms (`URL`, `HTTP`, `ID`—not `Url`, `Http`, `Id`)
- **Receiver names**: 1–2 letters reflecting type (`c` for `Client`, `h` for `Handler`)
- **Error strings**: Lowercase, no trailing punctuation (`"something failed"` not `"Something failed."`)
- **Doc comments**: Full sentences starting with the name being documented
  ```go
  // Handler serves HTTP requests for the file server.
  type Handler struct { ... }
  ```
- **Empty slices**: `var t []string` (nil slice), not `t := []string{}` (non-nil zero-length)
- **Don't panic**: Use error returns for normal error handling

### Caddy Patterns

**Module registration**:
```go
func init() {
    caddy.RegisterModule(MyModule{})
}

func (MyModule) CaddyModule() caddy.ModuleInfo {
    return caddy.ModuleInfo{
        ID:  "namespace.category.name",
        New: func() caddy.Module { return new(MyModule) },
    }
}
```

**Module lifecycle**: `New()` → JSON unmarshal → `Provision()` → `Validate()` → use → `Cleanup()`

**Interface guards** — compile-time verification that modules implement required interfaces:
```go
var (
    _ caddy.Provisioner     = (*MyModule)(nil)
    _ caddy.Validator       = (*MyModule)(nil)
    _ caddyfile.Unmarshaler = (*MyModule)(nil)
)
```

**Structured logging** — use the module-scoped logger from context:
```go
func (m *MyModule) Provision(ctx caddy.Context) error {
    m.logger = ctx.Logger()
    m.logger.Debug("provisioning", zap.String("field", m.Field))
    return nil
}
```

**Caddyfile support** — implement `UnmarshalCaddyfile(*caddyfile.Dispenser)` using the `Dispenser` API:
```go
// UnmarshalCaddyfile sets up the module from Caddyfile tokens. Syntax:
//
//     directive [arg1] [arg2] {
//         subdir value
//     }
func (m *MyModule) UnmarshalCaddyfile(d *caddyfile.Dispenser) error {
    d.Next() // consume directive name
    for d.NextArg() {
        // handle inline arguments
    }
    for nesting := d.Nesting(); d.NextBlock(nesting); {
        switch d.Val() {
        case "subdir":
            if !d.NextArg() {
                return d.ArgErr()
            }
            m.Field = d.Val()
        default:
            return d.Errf("unrecognized subdirective: %s", d.Val())
        }
    }
    return nil
}
```

**Admin API**: Implement `caddy.AdminRouter` for custom endpoints.

**Context**: Use `caddy.Context` for accessing other apps/modules and logging—don't store contexts in structs.

## Architecture

Caddy is built around a **module system** where everything is a module registered via `caddy.RegisterModule()`:

- **Apps** (`caddy.App`): Top-level modules like `http`, `tls`, `pki

... (内容过长，已截断)
```

---

## nektos/act — CLAUDE.md
> Stars: 70,171 | [GitHub](https://github.com/nektos/act)

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Act is a tool to run GitHub Actions locally. It reads `.github/workflows/` files, builds an execution plan, and uses Docker to run containers for each action. Written in Go 1.24+.

## Common Commands

- `make build` — build binary to `dist/local/act`
- `make test` — run `go test ./...` and the act CLI
- `make lint-go` — run `golangci-lint run`
- `make format` — run `go fmt ./...`
- `make tidy` — run `go mod tidy`
- `make pr` — full PR checklist: tidy, format-all, lint, test
- `go test ./pkg/runner/...` — run tests for a single package
- `go test ./pkg/runner/ -run TestRunEvent` — run a single test

## Architecture

### Execution Flow

1. **CLI** (`cmd/root.go`) — Cobra-based CLI parses flags into an `Input` struct
2. **Planner** (`pkg/model/planner.go`) — parses workflow YAML into a `Plan` containing `Stage`s (serial) with `Run`s (parallel jobs)
3. **Runner** (`pkg/runner/runner.go`) — converts the Plan into composable `Executor` chains
4. **RunContext** (`pkg/runner/run_context.go`) — holds all state for a job execution (env vars, matrix, containers, expressions)
5. **Steps** (`pkg/runner/step.go`) — each step type (action, docker, script) implements the `step` interface

### Core Abstraction: Executor Pattern

The `Executor` type (`pkg/common/executor.go`) is a `func(ctx context.Context) error` used throughout the codebase. Executors compose via:

- `.Then()`, `.Finally()`, `.OnError()` — chaining
- `NewPipelineExecutor()` — serial execution
- `NewParallelExecutor()` — parallel execution
- `.If()`, `.IfNot()` — conditional execution

### Key Packages

- **`pkg/model/`** — workflow YAML parsing, plan creation, action definitions
- **`pkg/runner/`** — core execution engine, expression evaluation, step types (local/remote/docker/composite actions, reusable workflows)
- **`pkg/container/`** — Docker API wrapper, container and host execution environments
- **`pkg/common/`** — Executor pattern, context utilities, logging
- **`pkg/exprparser/`** — GitHub Actions `${{ }}` expression language interpreter
- **`pkg/artifacts/`** and **`pkg/artifactcache/`** — artifact upload/download and caching server

## Linting Rules

Configured in `.golangci.yml`:

- Use `errors` from stdlib, not `github.com/pkg/errors`
- Use `github.com/sirupsen/logrus` (aliased as `log`), not stdlib `log`
- Use `github.com/stretchr/testify` for tests, not `gotest.tools/v3`
- Max cyclomatic complexity: 20
- Import aliases enforced: `logrus` → `log`, `testify/assert` → `assert`

## Testing

- Tests use `testify/assert` and `testify/mock`
- Table-driven tests are common in `pkg/model/` and `pkg/exprparser/`
- Test fixtures live in `testdata/` directories alongside their packages
- `pkg/runner/testdata/` contains extensive sample GitHub Actions workflows used as integration test fixtures

```

---

## prometheus/prometheus — AGENTS.md
> Stars: 63,921 | [GitHub](https://github.com/prometheus/prometheus)

```markdown
# Agents Guide for Prometheus

This document captures patterns and preferences observed from maintainer reviews
of recently merged pull requests. Use it to align your contributions with what
maintainers expect.

---

## PR Title Format

Titles must follow `area: short description`, using a prefix that identifies the
subsystem. Examples from merged PRs:

```
tsdb/wlog: optimize WAL watcher reads
fix(PromQL): do not skip histogram buckets when trimming
feat(agent): fix ST append; add compliance RW sender test
chore: fix emptyStringTest issues from gocritic
ci: add statuses write permission to prombench workflow
docs: clarify that `lookback_delta` query parameter takes either a duration or number of seconds
```

Common area prefixes: `tsdb`, `tsdb/wlog`, `promql`, `discovery/<name>`, `agent`,
`alerting`, `textparse`, `ui`, `build`, `ci`, `docs`, `chore`.

For performance work, append `[PERF]` to the area segment or use the `perf(area):`
convention.

---

## Commits

- Each commit must compile and pass tests independently, except when one commit adds a test to expose a bug and then the next commit fixes the bug.
- Keep commits small and focused. Do not bundle unrelated changes in one commit.
- Sign off every commit with `git commit -s` to satisfy the DCO requirement.
- Do not include unrelated local changes in the PR.

---

## Release Notes Block

Every PR must include a `release-notes` fenced code block in the description.
If there is no user-facing change, write `NONE`:

````
```release-notes
NONE
```
````

Otherwise use one of these prefixes, matching the CHANGELOG style:

```
[FEATURE]     new capability
[ENHANCEMENT] improvement to existing behaviour
[PERF]        performance improvement
[BUGFIX]      bug fix
[SECURITY]    security fix
[CHANGE]      breaking or behavioural change
```

Example:
````
```release-notes
[BUGFIX] PromQL: Do not skip histogram buckets in queries where histogram trimming is used.
```
````

---

## Tests

- Bug fixes require a test that reproduces the bug.
- New behaviour or exported API changes require unit or e2e tests.
- Tests should attempt to mirror realistic data and/or behaviour.
- Use only exported APIs in tests where possible — this keeps tests closer to
  real library usage and simplifies review.

---

## Performance Work

Maintainers take performance seriously. For any PERF PR:

- Performance improvements require a benchmark that demonstrates the improvement.
- Run benchmarks before and after the change using `go test -count=6 -benchmem -bench <directory changed in PR>`
- Provide benchmark numbers in the PR body using `benchstat` output.
- If a subset of benchmark results show a regression, address this or explain why the case is not important.
- Reuse allocations in hot paths where possible (slices, buffers). 
- When reusing buffers passed to interfaces, document that callers must copy
  the contents and must not retain references.
- Link to supporting analysis (Google Doc, issue, etc.) for complex changes.



... (内容过长，已截断)
```

---

## prometheus/prometheus — CLAUDE.md
> Stars: 63,921 | [GitHub](https://github.com/prometheus/prometheus)

```markdown
@AGENTS.md

```

---

## usememos/memos — AGENTS.md
> Stars: 59,387 | [GitHub](https://github.com/usememos/memos)

```markdown
# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Self-hosted note-taking tool. Go 1.26 backend (Echo v5, Connect RPC + gRPC-Gateway), React 18 + TypeScript 6 + Vite 7 frontend, Protocol Buffers API, SQLite/MySQL/PostgreSQL.

## Commands

```bash
# Backend
go run ./cmd/memos --port 8081    # Start dev server
go test ./...                      # Run all tests
go test -v ./store/...             # Run store tests (all 3 DB drivers via TestContainers)
go test -v -race ./server/...      # Run server tests with race detection
go test -v -race ./internal/...    # Run internal package tests with race detection
go test -v -run TestFoo ./pkg/...  # Run a single test
go mod tidy -go=1.26.2             # Match CI tidy check
golangci-lint run                  # Lint (v2, config: .golangci.yaml)
golangci-lint run --fix            # Auto-fix lint issues (includes goimports)

# Frontend (cd web)
pnpm install                       # Install deps
pnpm dev                           # Dev server (:3001, proxies API to :8081)
pnpm lint                          # Type check + Biome lint
pnpm lint:fix                      # Auto-fix lint issues
pnpm format                        # Format code
pnpm build                         # Production build
pnpm release                       # Build to server/router/frontend/dist

# Protocol Buffers (cd proto)
buf generate                       # Regenerate Go + TypeScript + OpenAPI
buf lint                           # Lint proto files
buf format -w                      # Format proto files
```

## Architecture

```
cmd/memos/main.go           # Cobra CLI + Viper config, server init

server/
├── server.go               # Echo v5 HTTP server, background runners
├── auth/                   # JWT access (15min) + refresh (30d) tokens, PAT
├── router/
│   ├── api/v1/             # 8 gRPC services (Connect + Gateway)
│   │   ├── acl_config.go   # Public endpoints whitelist
│   │   ├── sse_hub.go      # Server-Sent Events (live updates)
│   │   └── mcp/            # MCP server for AI assistants
│   ├── frontend/           # SPA static file serving
│   ├── fileserver/         # Native HTTP file server (thumbnails, range requests)
│   └── rss/                # RSS feeds
└── runner/                 # Background: memo payload processing, S3 presign refresh

store/
├── driver.go               # Database driver interface
├── store.go                # Store wrapper + in-memory cache (TTL 10min, max 1000)
├── migrator.go             # Migration logic (LATEST.sql for fresh, incremental for upgrades)
└── db/{sqlite,mysql,postgres}/  # Driver implementations

proto/
├── api/v1/                 # Service definitions
├── store/                  # Internal storage messages
└── gen/                    # Generated Go, TypeScript, OpenAPI

internal/                   # app-private packages: scheduler, cron, email, filter (CEL),
                            # webhook, markdown (Goldmark), 

... (内容过长，已截断)
```

---

## usememos/memos — CLAUDE.md
> Stars: 59,387 | [GitHub](https://github.com/usememos/memos)

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See `AGENTS.md` for full architecture, workflows, conventions, and patterns.

```

---


## 分析总结

### 1. 采用率极低
- 在Top 100高Star Go项目中，仅有8个项目（8%）包含 CLAUDE.md 或 AGENTS.md
- Top 300 + 62个额外知名项目，仅有Top 100中的8个，**新增0个**
- CLAUDE.md/AGENTS.md 是 2025-2026 年才兴起的新规范，Go社区采用率远低于JS/TS社区

### 2. 文件内容特征
- **AGENTS.md 更常见**: 7/8 项目有 AGENTS.md（面向 Codex/Copilot 多Agent协作）
- **CLAUDE.md 内容偏简洁**: 多数 CLAUDE.md 只有简短指引（如 `See AGENTS.md`）
- **AGENTS.md 内容更详细**: 包含项目架构、构建指令、测试要求、PR规范等

### 3. 内容模式分析
- **代码风格约束**: 如 caddyserver/caddy 要求标准库优先、无外部依赖
- **构建/测试指令**: 如 prometheus、hugo 明确 make 命令
- **PR/贡献规范**: 如 fatedier/frp 要求中文PR描述
- **架构说明**: 如 usememos/memos 描述了前后端分离架构
- **禁止事项**: 几乎所有文件都明确列出AI不应做的事情

### 4. 与其他语言对比
- JS/TS、Python项目的 CLAUDE.md 采用率显著更高
- Go项目因其强类型+工具链标准化（gofmt, go vet），对AI辅助配置的需求较低
- 但 AGENTS.md（多Agent协作规范）在Go项目中逐步增加，反映AI编程工具的渗透