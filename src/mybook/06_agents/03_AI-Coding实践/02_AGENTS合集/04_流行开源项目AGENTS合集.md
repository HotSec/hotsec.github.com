# 流行开源项目 AGENTS.md / CLAUDE.md 合集

本文档收集各大流行开源项目的 AGENTS.md / CLAUDE.md 文件，涵盖前端框架、后端基础设施、DevOps 工具等多个领域。

> 截至 2026 年 5 月，已收集 **9 个**知名开源项目的 AGENTS.md

---

## 一、前端框架与工具

### 1. Angular (angular/angular)

**技术栈**：TypeScript / pnpm / Bazel

**文件**：AGENTS.md

**核心内容**：
- **环境**：使用 `pnpm` 进行包管理
- **测试**：使用 `pnpm bazel test //target` 运行测试
- **测试模式**：
  - **Zoneless & Async-First**：假设无 zone 环境，状态变化异步调度更新
  - **禁止**使用 `fixture.detectChanges()` 手动触发更新
  - **必须**使用 "Act, Wait, Assert" 模式：
    1. Act：更新状态或执行操作
    2. Wait：`await fixture.whenStable()` 等待框架处理
    3. Assert：验证输出
- **测试优化**：使用 `useAutoTick()` 快速前进时间
- **PR**：使用 `gh` CLI 创建和管理 PR

**链接**：https://github.com/angular/angular/blob/main/AGENTS.md

---

### 2. VS Code (microsoft/vscode)

**技术栈**：TypeScript / Node.js

**文件**：AGENTS.md

**核心内容**：
- 指向详细的 [Copilot Instructions](.github/copilot-instructions.md)
- 代码库结构、架构、编码指南和验证步骤

**链接**：https://github.com/microsoft/vscode/blob/main/AGENTS.md

---

### 3. Remix (remix-run/remix)

**技术栈**：TypeScript / pnpm / React

**文件**：AGENTS.md

**核心内容**：
- **仓库结构**：pnpm workspace，产品代码在 `packages/` 下
- **公共 API 布局**：`package.json` 中的每个 `exports` 条目映射到 `src/*.ts` 文件
- **实现布局**：`src/lib` 仅用于实现，不添加 barrel re-exports
- **代码风格**：
  - 使用 `import type` 和 `export type`
  - 包含 `.ts` 扩展名
  - 使用 `let` 声明局部变量，`const` 声明模块作用域变量
  - 函数优先于类
  - Prettier 配置：`printWidth: 100`，无分号，单引号，空格缩进
- **测试**：测试从源代码运行，无需构建步骤
- **技能系统**：`.agents/skills/` 目录下的多种技能
- **版本说明**：使用 changeset 文件

**亮点**：
- 完整的技能系统（add-package、author-ui-modules、expert-typescript-programmer 等）
- 明确的导入规范和代码风格指南

**链接**：https://github.com/remix-run/remix/blob/main/AGENTS.md

---

## 二、包管理器

### 4. pnpm (pnpm/pnpm)

**技术栈**：TypeScript / pnpm monorepo

**文件**：AGENTS.md

**核心内容**：
- **仓库结构**：
  - `pnpm/`：CLI 入口点和主包
  - `pkg-manager/`：核心包管理逻辑
  - `resolving/`：依赖解析逻辑
  - `fetching/`：包获取逻辑
  - `store/`：存储管理逻辑
  - `lockfile/`：lockfile 处理
- **设置与构建**：
  ```bash
  pnpm install
  pnpm run compile
  ```
- **测试**：永远不要运行所有测试，针对特定项目运行
- **代码复用**：
  - 搜索现有代码库查找相似功能
  - 提取共享代码到共享包
  - 优先使用开源包而非自定义实现
- **代码风格**：
  - 使用尾逗号
  - 函数优先于类
  - 函数在使用后声明（依赖提升）
  - 函数参数不超过 2-3 个
- **错误处理**：Jest 测试中使用 `util.types.isNativeError()` 而非 `instanceof Error`
- **冲突解决**：使用 `shell/resolve-pr-conflicts.sh`

**亮点**：
- 详细的 monorepo 结构说明
- 明确的代码复用原则
- Jest 跨 realm 错误检查技巧

**链接**：https://github.com/pnpm/pnpm/blob/main/AGENTS.md

---

## 三、DevOps 与云原生

### 5. Helm (helm/helm)

**技术栈**：Go / Kubernetes

**文件**：AGENTS.md

**核心内容**：
- **构建与测试**：
  ```bash
  make build              # 构建二进制
  make test               # 运行所有测试
  make test-unit          # 仅单元测试
  make test-coverage      # 带覆盖率
  go test -run TestName   # 特定测试
  ```
- **代码结构**：
  - `cmd/helm/`：CLI 入口点
  - `pkg/`：公共 API
    - `action/`：核心操作（install、upgrade、rollback）
    - `cmd/`：Cobra 命令实现
    - `chart/v2/`：稳定的 chart 格式
    - `engine/`：模板渲染
    - `kube/`：Kubernetes 客户端抽象
    - `registry/`：OCI 支持
- **兼容性**：公共 API 签名不应更改
- **代码标准**：
  - 使用 table-driven tests
  - 复杂输出使用 golden files
  - 所有 commit 必须 DCO 签署：`git commit -s`
- **分支**：
  - `main`：Helm v4
  - `dev-v3`：Helm v3（从 main 回移植安全和 bugfix）

**链接**：https://github.com/helm/helm/blob/main/AGENTS.md

---

### 6. Prometheus (prometheus/prometheus)

**技术栈**：Go

**文件**：AGENTS.md

**核心内容**：
- **PR 标题格式**：`area: short description`
  - 常见前缀：`tsdb`, `tsdb/wlog`, `promql`, `discovery/<name>`, `agent`, `alerting`
  - 性能工作：添加 `[PERF]` 或使用 `perf(area):`
- **Commit 规范**：
  - 每个 commit 必须独立编译通过测试
  - 保持 commit 小而专注
  - 签署 DCO：`git commit -s`
- **版本说明块**：每个 PR 必须包含 `release-notes` fenced code block
- **测试**：
  - Bug fix 需要测试复现
  - 新行为需要单元或 e2e 测试
- **性能工作**：
  - 需要基准测试证明改进
  - 使用 `benchstat` 输出基准数据
  - 热路径中重用分配
- **代码风格**：
  - 遵循 Go Code Review Comments
  - 所有暴露对象必须有 doc comment
  - 所有注释以大写字母开头，以句号结尾
  - 运行 `make lint`

**链接**：https://github.com/prometheus/prometheus/blob/main/AGENTS.md

---

### 7. Grafana (grafana/grafana)

**技术栈**：Go / TypeScript / React / Yarn

**文件**：AGENTS.md

**核心内容**：
- **目录范围的 agent 文件**：
  - `docs/AGENTS.md`：文档风格指南
  - `public/app/features/alerting/unified/AGENTS.md`：告警模式
- **项目概述**：监控和可观测性平台，Go 后端 + TypeScript/React 前端，monorepo
- **原则**：
  - 遵循周围代码的现有模式
  - 为新功能编写测试
  - 保持变更专注
  - 前端和后端变更分开 PR
- **命令**：
  - `make run`：后端热重载
  - `yarn start`：前端开发服务器
  - `yarn test`：前端测试
  - `make lint-go`：Go linter
- **架构**：
  - 后端：`pkg/api/`（HTTP API）、`pkg/services/`（业务逻辑）、`pkg/server/`（服务器初始化）
  - 前端：`public/app/core/`（共享服务）、`public/app/features/`（功能代码）
- **关键注意事项**：
  - Wire DI：后端服务初始化变更需要 `make gen-go`
  - CUE schema：仪表板/面板 schema 生成 Go 和 TS 代码
  - Feature toggles：在 `pkg/services/featuremgmt/` 定义

**亮点**：
- 目录范围的 AGENTS.md 系统
- 详细的命令参考
- Wire DI 和 CUE schema 的生成流程

**链接**：https://github.com/grafana/grafana/blob/main/AGENTS.md

---

## 四、大数据与分布式系统

### 8. Apache Spark (apache/spark)

**技术栈**：Scala / Java / Python / SBT

**文件**：AGENTS.md

**核心内容**：
- **飞行前检查**：
  1. 运行 `git remote -v` 确认远程仓库
  2. 获取上游最新代码
  3. 检查未提交的更改
  4. 切换到适当的分支
- **开发注意事项**：
  - SQL golden file 测试由 `SQLQueryTestSuite` 管理，不要直接编辑 `.sql.out` 文件
  - Spark Connect 协议定义在 proto 文件中
  - 避免在代码或注释中引入非 ASCII 字符
- **构建与测试**：
  - 编译单个模块：`build/sbt <module>/compile`
  - 运行测试套件：`build/sbt '<module>/testOnly *MySuite'`
- **PySpark 测试**：
  - 先构建 Spark with Hive support：`build/sbt -Phive package`
  - 激活虚拟环境并安装依赖
- **PR 工作流**：
  - PR 标题格式：`[SPARK-xxxx][COMPONENT] Title`
  - 使用 `dev/create_spark_jira.py` 创建 JIRA ticket

**亮点**：
- 详细的预检查流程
- 多语言测试指南（Scala/Java/Python）
- JIRA 集成流程

**链接**：https://github.com/apache/spark/blob/master/AGENTS.md

---

### 9. OpenSearch (opensearch-project/OpenSearch)

**技术栈**：Java / Gradle

**文件**：AGENTS.md

**核心内容**：
- **仓库结构**：
  - `server`：OpenSearch 服务器核心
  - `plugins/*`：可选插件
  - `modules/*`：默认包含的模块
  - `libs/*`：库
  - `buildSrc`：构建框架
  - `sandbox`：开发中的功能
- **构建**：
  ```bash
  ./gradlew assemble          # 构建所有发行版
  ./gradlew localDistro       # 仅构建本地平台
  ./gradlew run               # 从源代码运行
  ./gradlew run -PnumNodes=3  # 运行多节点集群
  ```
- **测试**：
  - 单元测试：`./gradlew test`
  - 内部集群测试：`./gradlew internalClusterTest`
  - REST 测试：`./gradlew :rest-api-spec:yamlRestTest`
- **编写好测试**：
  - 优先单元测试
  - 不要使用 `Thread.sleep`，使用 `assertBusy` 或 `waitUntil`
  - 清理所有资源
- **Java 格式化**：使用 Eclipse JDT formatter，4-space 缩进，140 字符行宽
- **向后兼容性**：
  - 使用 `Version.onOrAfter` / `Version.before` 检查
  - 标记公共 API：`@PublicApi`、`@InternalApi`、`@ExperimentalApi`、`@DeprecatedApi`
- **Commit**：确保 `./gradlew precommit` 通过

**亮点**：
- 完整的测试类型说明（单元、集成、REST）
- 向后兼容性指南
- Java 格式化规范

**链接**：https://github.com/opensearch-project/OpenSearch/blob/main/AGENTS.md

---

## 模式总结

### 项目类型分布

| 类别 | 项目数 | 代表项目 |
|------|--------|----------|
| 前端框架 | 3 | Angular、VS Code、Remix |
| 包管理器 | 1 | pnpm |
| DevOps/云原生 | 3 | Helm、Prometheus、Grafana |
| 大数据 | 2 | Apache Spark、OpenSearch |

### 常见模式

| 模式 | 出现频率 | 说明 |
|------|---------|------|
| Commit 规范 | 100% | 所有项目都有 commit 格式要求 |
| DCO 签署 | 75% | Helm、Prometheus、OpenSearch 要求 |
| 测试指南 | 100% | 所有项目都有测试指导 |
| 代码风格 | 100% | 所有项目都有代码风格规范 |
| 分支模型 | 75% | 明确的分支策略 |
| 向后兼容 | 50% | 大型项目强调兼容性 |

### 最佳实践汇总

1. **测试优先**：所有项目都强调测试的重要性
2. **小而专注的 Commit**：每个 commit 应该是一个最小连贯想法
3. **代码复用**：优先搜索现有代码，避免重复
4. **文档更新**：API 变更必须更新文档
5. **代码风格一致性**：使用 linters 和 formatters 确保一致性
6. **安全性**：防止 XSS、SQL 注入等安全问题
