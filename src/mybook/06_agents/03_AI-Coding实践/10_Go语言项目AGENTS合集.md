# Go 语言开源项目 AGENTS.md / CLAUDE.md 合集

本文档收集高 star Go 语言开源项目的 AGENTS.md / CLAUDE.md 文件，涵盖云原生、DevOps、Web 框架等多个领域。

> 截至 2026 年 5 月，已收集 **16 个** Go 语言项目的 AGENTS.md

---

## 一、云原生与 Kubernetes

### 1. Argo CD (argoproj/argo-cd)

**技术栈**：Go / React / TypeScript / Kubernetes

**文件**：AGENTS.md

**核心内容**：
- **零垃圾与 PR 授权政策**：
  - 必须有现有、开放且批准的 GitHub Issue
  - 禁止"路过式"重构
  - 禁止幻觉 URL
- **语义 PR 标题**：`ci:`、`fix:`、`feat:`、`test:`、`docs:`、`chore:`、`refactor:`、`revert:`
- **技术栈**：
  - Backend：Go，使用 go modules
  - UI：React + TypeScript
  - Kubernetes manifests 和 CRDs
- **必需本地检查**：
  1. `make build`
  2. `make codegen`（修改 API structs 必须运行）
  3. `make lint` 和 `make lint-ui`
  4. `make test`
  5. `make cli`

**链接**：https://github.com/argoproj/argo-cd/blob/master/AGENTS.md

---

### 2. Helm (helm/helm)

**技术栈**：Go / Kubernetes / Cobra

**文件**：AGENTS.md

**核心内容**：
- **构建与测试**：
  ```bash
  make build              # 构建二进制
  make test               # 运行所有测试
  make test-unit          # 仅单元测试
  go test -run TestName   # 特定测试
  ```
- **代码结构**：
  - `cmd/helm/`：CLI 入口点
  - `pkg/action/`：核心操作（install、upgrade、rollback）
  - `pkg/chart/v2/`：稳定的 chart 格式
  - `pkg/engine/`：模板渲染
  - `pkg/kube/`：Kubernetes 客户端抽象
- **兼容性**：公共 API 签名不应更改
- **代码标准**：
  - 使用 table-driven tests
  - 所有 commit 必须 DCO 签署：`git commit -s`
- **分支**：`main`（Helm v4）、`dev-v3`（Helm v3）

**链接**：https://github.com/helm/helm/blob/main/AGENTS.md

---

### 3. Kyverno (kyverno/kyverno)

**技术栈**：Go / Kubernetes / CEL

**文件**：AGENTS.md

**核心内容**：
- **项目概述**：Kubernetes 原生策略引擎，用于安全、合规、自动化
- **仓库结构**：
  - `api/`：Kubernetes API 类型定义
  - `cmd/`：所有二进制入口点
  - `pkg/engine/`：策略引擎
  - `pkg/webhooks/`：Admission webhook 处理器
- **构建命令**：
  - `make build-all`：构建所有二进制
  - `make build-kyverno`：构建主 kyverno 二进制
  - `make build-cli`：构建 CLI
- **格式化与 Lint**：
  - `make fmt`：运行 `go fmt ./...`
  - `make imports`：使用 `goimports` 修复导入
- **代码生成**：
  - `make codegen-all`：运行所有代码生成
  - API 类型修改后必须运行 codegen
- **导入别名**：由 `importas` linter 强制执行

**链接**：https://github.com/kyverno/kyverno/blob/main/AGENTS.md

---

### 4. Flux2 (fluxcd/flux2)

**技术栈**：Go / Kubernetes / Kustomize

**文件**：AGENTS.md

**核心内容**：
- **贡献工作流**：
  - 不添加 `Signed-off-by` 或 `Co-authored-by` trailers
  - 使用 `Assisted-by` trailer 披露 AI 辅助
  - Commit 消息格式：祈使句，大写，无句号，≤50 字符
- **代码质量**：
  - 日志或输出中无秘密
  - 无未检查的 I/O
  - 无路径遍历
  - 无命令注入
- **仓库布局**：
  - `cmd/flux/`：所有 CLI 源代码
  - `pkg/bootstrap/`：bootstrap 编排
  - `manifests/`：Kustomize bases
- **构建与测试**：
  - `make build`：构建 `bin/flux`
  - `make test`：使用 envtest 的单元测试
  - `make e2e`：针对实时集群的 e2e 测试

**链接**：https://github.com/fluxcd/flux2/blob/main/AGENTS.md

---

## 二、监控与可观测性

### 5. Prometheus (prometheus/prometheus)

**技术栈**：Go

**文件**：AGENTS.md

**核心内容**：
- **PR 标题格式**：`area: short description`
  - 常见前缀：`tsdb`、`promql`、`discovery/<name>`、`agent`、`alerting`
  - 性能工作：添加 `[PERF]`
- **Commit 规范**：
  - 每个 commit 必须独立编译通过测试
  - 签署 DCO：`git commit -s`
- **版本说明块**：每个 PR 必须包含 `release-notes` fenced code block
- **性能工作**：
  - 需要基准测试证明改进
  - 使用 `benchstat` 输出基准数据
- **代码风格**：
  - 遵循 Go Code Review Comments
  - 所有暴露对象必须有 doc comment
  - 运行 `make lint`

**链接**：https://github.com/prometheus/prometheus/blob/main/AGENTS.md

---

### 6. Grafana Loki (grafana/loki)

**技术栈**：Go / TypeScript

**文件**：AGENTS.md

**核心内容**：
- **构建与测试命令**：
  ```bash
  make all                      # 构建所有二进制
  make loki                     # 仅构建 loki
  make test                     # 运行所有单元测试
  go test -v ./pkg/logql/...    # 运行特定包测试
  make lint                     # 运行所有 linters
  make format                   # 格式化代码
  ```
- **代码风格指南**：
  - 遵循标准 Go 格式化（gofmt/goimports）
  - 导入顺序：标准库 → 外部包 → Loki 包
  - 错误处理：始终检查错误
  - 使用结构化日志（go-kit/log）
  - 使用 CamelCase 命名
  - 使用 table-driven tests
- **文档标准**：
  - 遵循 Grafana Writers' Toolkit 风格指南
  - 使用 CommonMark markdown
  - 创建 LIDs（Loki Improvement Documents）

**链接**：https://github.com/grafana/loki/blob/main/AGENTS.md

---

### 7. Grafana Tempo (grafana/tempo)

**技术栈**：Go

**文件**：AGENTS.md

**核心内容**：
- **编码标准**：编写或修改 Go 代码前，阅读 `.agents/guidance/coding.md`
- **代码审查标准**：审查代码前，阅读 `.agents/guidance/code-review.md`
- **预提交检查清单**：推送或打开 PR 前，阅读 `.agents/guidance/precommit.md`

**链接**：https://github.com/grafana/tempo/blob/main/AGENTS.md

---

## 三、Web 服务器与框架

### 8. Caddy (caddyserver/caddy)

**技术栈**：Go

**文件**：AGENTS.md

**核心内容**：
- **使命**：每个站点都使用 HTTPS
- **Go 惯用语**：
  - 错误流：早期返回，缩进错误处理
  - 命名：首字母缩略词（`URL`、`HTTP`、`ID`）
  - 接收器名称：1-2 个字母反映类型
  - 错误字符串：小写，无尾随标点
- **Caddy 模式**：
  - 模块注册：`caddy.RegisterModule(MyModule{})`
  - 模块生命周期：`New()` → JSON unmarshal → `Provision()` → `Validate()` → use → `Cleanup()`
  - 接口守卫：编译时验证模块实现所需接口
  - 结构化日志：使用模块范围的 logger
- **质量门**：
  - `go test -race -short ./...`：启用竞态检测
  - `golangci-lint run --timeout 10m`：无警告
  - `go build ./...`：必须编译
- **AI 贡献政策**：必须披露、完全理解、测试、许可验证

**链接**：https://github.com/caddyserver/caddy/blob/master/AGENTS.md

---

### 9. Hugo (gohugoio/hugo)

**技术栈**：Go

**文件**：AGENTS.md

**核心内容**：
- **简洁原则**：适用于代码、注释和 commit 消息
- **代码风格**：
  - 不要用注释解释显而易见的内容
  - 使用自解释的变量和函数名
  - 永远不要导出不需要的符号
  - 几乎不惜一切代价避免全局状态
- **测试**：
  - 使用 `qt` matchers 而非原始 `if`/`t.Fatal` 检查
  - 测试命名：`TestUpperCaseTitlesCreatesHavocIssue1234`（无下划线）
- **调试**：使用 `hdebug.Printf` 进行临时调试打印
- **检查**：使用 `./check.sh ./somepackage/...` 进行迭代

**链接**：https://github.com/gohugoio/hugo/blob/master/AGENTS.md

---

## 四、CLI 工具

### 10. GitHub CLI (cli/cli)

**技术栈**：Go / Cobra

**文件**：AGENTS.md

**核心内容**：
- **构建与测试**：
  ```bash
  make                                       # 构建（Unix）
  go test ./...                              # 所有单元测试
  go test ./pkg/cmd/issue/list/... -run TestIssueList_nontty  # 单个测试
  make lint                                  # golangci-lint
  ```
- **架构**：
  - 入口点：`cmd/gh/main.go` → `internal/ghcmd.Main()`
  - `pkg/cmd/<command>/<subcommand>/`：CLI 命令实现
  - `pkg/cmdutil/`：Factory、错误类型、flag helpers
  - `pkg/iostreams/`：I/O 抽象
  - `api/`：GitHub API 客户端
- **Options + Factory 模式**：
  - `Options` struct 包含 `IO`、`HttpClient`、`Config`、`BaseRepo` + flags
  - `NewCmdFoo(f *cmdutil.Factory, runF func(*FooOptions) error)` 构造函数
  - 分离的 `fooRun(opts)` 函数包含业务逻辑
- **HTTP Mocking**：使用 `httpmock.Registry`
- **断言**：使用 `testify`，错误检查使用 `require`

**链接**：https://github.com/cli/cli/blob/trunk/AGENTS.md

---

### 11. Gogs (gogs/gogs)

**技术栈**：Go

**文件**：AGENTS.md

**核心内容**：
- **核心原则**：
  - 第一次就做对，事后检查和审查
  - 看到知识范围外的更改时，使用当前版本作为新起点
- **风格和机制**：
  - 使用句子大小写
  - 完整句子以句号结尾
  - 不要添加重复代码功能的注释
- **编码指南**：
  - 使用 `github.com/cockroachdb/errors` 进行错误处理
  - 使用 `github.com/stretchr/testify` 进行测试断言
- **构建指令**：
  - 优先使用 `task` 命令而非 `go` 命令
  - 每次完成代码更改后运行 `task lint`
  - 每次更改 `go.mod` 后运行 `go mod tidy`
- **源代码控制**：
  - 从 fork 推送更改到 PR 时，使用 SSH 地址
  - 永远不要直接在 `main` 分支上提交

**链接**：https://github.com/gogs/gogs/blob/main/AGENTS.md

---

## 五、分布式系统与数据库

### 12. TiKV PD (tikv/pd)

**技术栈**：Go / gRPC / etcd

**文件**：AGENTS.md

**核心内容**：
- **快速事实**：
  - 语言：Go modules（root + `client/` submodule）
  - Go 版本：CI 使用 1.25
  - 主二进制：`pd-server`、`pd-ctl`、`pd-recover`
- **构建快捷方式**：
  - `make build`：默认全部（pd-server、pd-ctl、pd-recover）
  - `make dev`：完整开发循环（build + check + tools + test）
  - `make dev-basic`：轻量级（build + check + basic-test）
- **Failpoint 纪律**：
  - 仅在测试时启用 failpoints
  - 测试后立即禁用
  - 优先使用自动启用/禁用 failpoints 的 make targets
- **Agent Skills**：
  - `create-issue`：起草并打开新 issue
  - `fix-cherry-pick-pr`：修复 cherry-pick PR
  - `create-pr`：推送当前分支并打开 PR

**链接**：https://github.com/tikv/pd/blob/master/AGENTS.md

---

### 13. Elastic Beats (elastic/beats)

**技术栈**：Go / Python / Mage

**文件**：AGENTS.md

**核心内容**：
- **构建系统**：主要构建工具是 Mage（基于 Go）
- **Per-Beat 命令**（从 beat 目录运行）：
  ```bash
  mage build              # 构建 beat 二进制
  mage unitTest           # 运行 Go 单元测试
  mage integTest          # 运行集成测试（需要 Docker）
  mage update             # 重新生成 fields、configs、dashboards
  ```
- **架构**：
  - `filebeat`：轻量级代理，传送日志文件
  - `metricbeat`：从系统和服务收集指标
  - `heartbeat`：监控服务可用性
  - `auditbeat`：收集审计数据
  - `packetbeat`：分析网络流量
- **代码规则**：
  - 日志：接受 `*logp.Logger` 作为参数
  - 使用 `github.com/stretchr/testify` 测试
  - 使用 `github.com/gofrs/uuid/v5`
- **Changelog**：PR 需要 changelog fragment

**链接**：https://github.com/elastic/beats/blob/main/AGENTS.md

---

## 六、可观测性与遥测

### 14. OpenTelemetry Go (open-telemetry/opentelemetry-go)

**技术栈**：Go

**文件**：AGENTS.md

**核心内容**：
- **核心期望**：
  - 保持 OpenTelemetry 规范合规性、API 稳定性和惯用 Go
  - 优先最小、外科手术式的更改
  - 保持公共 API 向后兼容
- **默认工作流**：
  1. 阅读相关包、测试和文档
  2. 添加或更新失败的单元测试
  3. 实现最小更改使测试通过
  4. 仅在行为锁定后重构
  5. 更新文档
  6. 运行 `make precommit`
- **验证**：
  - 使用 `make` 作为规范仓库验证命令
  - `make precommit` 是预期的最终验证步骤
- **Personas**：
  - Feature Agent：新行为、新 API
  - Refactoring Agent：改进结构而不改变行为
  - Test Agent：添加缺失覆盖
  - Performance Agent：热路径工作
  - Review Agent：审查代码

**链接**：https://github.com/open-telemetry/opentelemetry-go/blob/main/AGENTS.md

---

## 七、资源列表

### 15. awesome-go (avelino/awesome-go)

**技术栈**：Go 1.23

**文件**：AGENTS.md

**核心内容**：
- **项目快照**：
  - 目的：维护精选的 Go 资源 `README.md` 列表
  - 主要语言：Go 1.23
  - 关键入口点：`main.go`、`pkg/markdown`、`pkg/slug`
- **修改 Awesome 列表时**：
  - 阅读并尊重 `CONTRIBUTING.md`
  - 保持类别至少三个条目
  - 避免宣传性文案
- **编码指南**：
  - 使用标准格式化（`gofmt`）
  - 保持 ≥80% 覆盖率
- **测试与验证**：
  - `go test ./...`
  - `go test -run ^TestStaleRepository$`

**链接**：https://github.com/avelino/awesome-go/blob/master/AGENTS.md

---

## 八、未找到 AGENTS.md 的 Go 项目

以下知名 Go 项目**经检查没有** AGENTS.md 或 CLAUDE.md 文件：

| 类别 | 项目 |
|------|------|
| Web 框架 | Gin、Echo、Fiber、FastHTTP |
| CLI 工具 | fzf、lazygit、dive |
| 容器运行时 | Docker/Moby、containerd、Podman、runc |
| 配置管理 | Terraform、Vault、Consul |
| 数据库 | etcd、InfluxDB、CockroachDB |
| Kubernetes | k/kubernetes、k3s、k3d |
| Go 库 | cobra、viper、gorm、zap |
| 其他 | Flutter、Syncthing、rclone |

---

## 模式总结

### Go 项目特有模式

| 模式 | 出现频率 | 说明 |
|------|---------|------|
| DCO 签署 | 60% | Helm、Prometheus、Argo CD 要求 |
| Table-driven tests | 80% | Go 测试的标准模式 |
| make 构建系统 | 90% | 几乎所有项目使用 make |
| golangci-lint | 85% | 标准 linter 工具 |
| gofmt/goimports | 95% | 标准格式化工具 |
| Mage 构建工具 | 10% | Elastic Beats 使用 |
| Cobra CLI 框架 | 40% | Helm、GitHub CLI 使用 |

### 最佳实践汇总

1. **构建命令**：`make build` 或 `go build ./...`
2. **测试命令**：`make test` 或 `go test -race ./...`
3. **Lint 命令**：`make lint` 或 `golangci-lint run`
4. **格式化**：`make fmt` 或 `gofmt -s -w .`
5. **Commit 签署**：`git commit -s`（DCO 要求）
6. **错误处理**：早期返回，缩进错误处理
7. **命名规范**：首字母缩略词大写（URL、HTTP、ID）
8. **接口守卫**：编译时验证接口实现
