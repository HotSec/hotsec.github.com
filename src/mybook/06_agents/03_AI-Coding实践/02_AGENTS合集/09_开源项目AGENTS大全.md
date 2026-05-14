# 开源项目 AGENTS.md / CLAUDE.md 大全

> 整合所有现有AGENTS/CLAUDE合集文档的去重合集，共72个项目，按17个分类组织。
>
> 每个项目提取自其仓库中的 AGENTS.md、CLAUDE.md 或等效的AI编码指导文件，涵盖技术栈、核心规范与亮点。

---

## 一、前端框架与运行时

### 1. Next.js (vercel/next.js)

- **技术栈**：TypeScript / Rust(Turbopack) / pnpm monorepo
- **文件**：CLAUDE.md（软链接AGENTS.md），约300行
- **核心要点**：
  - monorepo概览与包间依赖关系
  - 测试命令矩阵（单元/集成/E2E）
  - Skill系统：`$pr-status-triage` / `$flags` / `$dce-edge` / `$react-vendoring` / `$runtime-debug`
  - 禁止"Generated with Claude Code"或co-author footers
  - `NEXT_SKIP_ISOLATE`使用场景与条件
- **亮点**：Skill系统将常见操作封装为可复用的自动化流程
- **链接**：[vercel/next.js](https://github.com/vercel/next.js)

### 2. SvelteKit (sveltejs/kit)

- **技术栈**：JavaScript(JSDoc) / pnpm monorepo
- **文件**：约150行
- **核心要点**：
  - 快速参考命令集
  - PR提交前6步检查清单
  - 代码风格示例与约定
- **亮点**：精简的6步PR检查清单确保提交质量
- **链接**：[sveltejs/kit](https://github.com/sveltejs/kit)

### 3. Astro (withastro/astro)

- **技术栈**：TypeScript / pnpm
- **文件**：约200行
- **核心要点**：
  - monorepo结构与包职责
  - 测试命令与覆盖率要求
  - 代码风格与格式规范
- **亮点**：清晰的monorepo结构文档帮助快速定位代码
- **链接**：[withastro/astro](https://github.com/withastro/astro)

### 4. Remix (remix-run/remix)

- **技术栈**：TypeScript / pnpm / React
- **文件**：约150行
- **核心要点**：
  - monorepo包组织方式
  - 测试策略与运行方式
- **亮点**：简洁的测试策略文档
- **链接**：[remix-run/remix](https://github.com/remix-run/remix)

### 5. Angular (angular/angular)

- **技术栈**：TypeScript / pnpm / Bazel
- **文件**：AGENTS.md
- **核心要点**：
  - Zoneless & Async-First测试模式
  - 禁止`fixture.detectChanges()`
  - 必须使用"Act, Wait, Assert"模式
  - `useAutoTick()`强制使用
- **亮点**：Zoneless架构下的测试范式革新，彻底告别手动change detection
- **链接**：[angular/angular](https://github.com/angular/angular)

### 6. VS Code (microsoft/vscode)

- **技术栈**：TypeScript / Node.js
- **文件**：AGENTS.md
- **核心要点**：
  - 指向详细Copilot Instructions
  - 扩展开发指南
- **亮点**：通过引用外部详细文档保持AGENTS.md精简
- **链接**：[microsoft/vscode](https://github.com/microsoft/vscode)

---

## 二、前端工具链

### 7. Bun (oven-sh/bun)

- **技术栈**：Zig / C++ / JavaScript
- **文件**：约100行
- **核心要点**：
  - Zig运行时构建流程
  - 构建命令与依赖管理
- **亮点**：Zig+C++混合运行时的构建指导
- **链接**：[oven-sh/bun](https://github.com/oven-sh/bun)

### 8. pnpm (pnpm/pnpm)

- **技术栈**：TypeScript / Node.js
- **文件**：AGENTS.md
- **核心要点**：
  - monorepo管理策略
  - pnpm workspace配置与使用
- **亮点**：包管理器自身的monorepo管理最佳实践
- **链接**：[pnpm/pnpm](https://github.com/pnpm/pnpm)

### 9. Hugo (gohugoio/hugo)

- **技术栈**：Go / HTML / CSS
- **文件**：约100行
- **核心要点**：
  - Go静态站点生成器架构
  - 构建与测试命令
- **亮点**：单二进制静态站点生成器的简洁开发流程
- **链接**：[gohugoio/hugo](https://github.com/gohugoio/hugo)

---

## 三、后端框架与CMS

### 10. Strapi (strapi/strapi)

- **技术栈**：TypeScript / Node.js
- **文件**：约200行
- **核心要点**：
  - headless CMS架构设计
  - monorepo包组织
- **亮点**：headless CMS的插件化架构指导
- **链接**：[strapi/strapi](https://github.com/strapi/strapi)

### 11. Ghost CMS (TryGhost/Ghost)

- **技术栈**：JavaScript / Node.js
- **文件**：约100行
- **核心要点**：
  - Node.js CMS开发流程
  - 主题与插件开发规范
- **亮点**：专注内容发布的CMS开发指导
- **链接**：[TryGhost/Ghost](https://github.com/TryGhost/Ghost)

---

## 四、云原生与Kubernetes（Go）

### 12. Argo CD (argoproj/argo-cd)

- **技术栈**：Go / React / TypeScript / Kubernetes
- **文件**：AGENTS.md
- **核心要点**：
  - 零垃圾政策：PR必须关联有开放批准的Issue
  - 语义PR标题（feat/fix/chore等前缀）
  - `make build` / `make codegen` / `make lint` / `make test` 必需流程
  - 代码生成与手动代码的边界
- **亮点**：零垃圾+PR授权政策确保每个PR都有据可查
- **链接**：[argoproj/argo-cd](https://github.com/argoproj/argo-cd)

### 13. Helm (helm/helm)

- **技术栈**：Go / Kubernetes / Cobra
- **文件**：AGENTS.md
- **核心要点**：
  - `make build` / `make test` 构建流程
  - `go test` 测试规范
  - DCO签名要求（Developer Certificate of Origin）
- **亮点**：DCO签名要求确保贡献者合法性
- **链接**：[helm/helm](https://github.com/helm/helm)

### 14. Kyverno (kyverno/kyverno)

- **技术栈**：Go / Kubernetes
- **文件**：AGENTS.md
- **核心要点**：
  - CRD代码生成流程
  - `make test-all` 全量测试
  - 策略引擎架构
- **亮点**：CRD代码生成确保类型安全的Kubernetes策略定义
- **链接**：[kyverno/kyverno](https://github.com/kyverno/kyverno)

### 15. Flux2 (fluxcd/flux2)

- **技术栈**：Go / Kubernetes
- **文件**：AGENTS.md
- **核心要点**：
  - GitOps持续交付模型
  - `make test` 测试流程
- **亮点**：GitOps原生Kubernetes持续交付
- **链接**：[fluxcd/flux2](https://github.com/fluxcd/flux2)

### 16. Grafana Loki (grafana/loki)

- **技术栈**：Go
- **文件**：AGENTS.md
- **核心要点**：
  - 日志聚合系统架构
  - `make test` 测试流程
- **亮点**：受Prometheus启发的日志聚合系统
- **链接**：[grafana/loki](https://github.com/grafana/loki)

### 17. Grafana Tempo (grafana/tempo)

- **技术栈**：Go
- **文件**：AGENTS.md
- **核心要点**：
  - 分布式追踪后端架构
  - 与Grafana生态集成
- **亮点**：与Loki/Prometheus无缝集成的分布式追踪
- **链接**：[grafana/tempo](https://github.com/grafana/tempo)

---

## 五、监控与可观测性

### 18. Prometheus (prometheus/prometheus)

- **技术栈**：Go
- **文件**：AGENTS.md
- **核心要点**：
  - 监控系统架构与组件
  - `go test` 测试规范
- **亮点**：云原生监控的事实标准
- **链接**：[prometheus/prometheus](https://github.com/prometheus/prometheus)

### 19. Grafana (grafana/grafana)

- **技术栈**：Go / React / TypeScript
- **文件**：约200行
- **核心要点**：
  - 可视化平台架构
  - `make build` / `make test` 流程
  - 前后端开发规范
- **亮点**：Go后端+React前端的完整开发指导
- **链接**：[grafana/grafana](https://github.com/grafana/grafana)

### 20. OpenTelemetry Python (open-telemetry/opentelemetry-python)

- **技术栈**：Python / uv monorepo
- **文件**：约80行
- **核心要点**：
  - 禁止AI生成评论
  - `tox`为唯一测试入口
  - 禁止`type:ignore`
  - Assisted-by trailer要求
- **亮点**：严格的AI贡献披露与质量门槛
- **链接**：[open-telemetry/opentelemetry-python](https://github.com/open-telemetry/opentelemetry-python)

### 21. OpenTelemetry Go (open-telemetry/opentelemetry-go)

- **技术栈**：Go
- **文件**：AGENTS.md
- **核心要点**：
  - Go可观测性SDK架构
  - 测试与贡献规范
- **亮点**：Go生态可观测性标准SDK
- **链接**：[open-telemetry/opentelemetry-go](https://github.com/open-telemetry/opentelemetry-go)

---

## 六、Web服务器与代理

### 22. Caddy (caddyserver/caddy)

- **技术栈**：Go
- **文件**：AGENTS.md
- **核心要点**：
  - Web服务器架构与配置
  - `go test` 测试规范
- **亮点**：自动HTTPS的Web服务器
- **链接**：[caddyserver/caddy](https://github.com/caddyserver/caddy)

### 23. GitHub CLI (cli/cli)

- **技术栈**：Go
- **文件**：AGENTS.md
- **核心要点**：
  - GitHub命令行工具架构
  - 扩展开发规范
- **亮点**：GitHub官方CLI工具的开发指导
- **链接**：[cli/cli](https://github.com/cli/cli)

---

## 七、数据存储

### 24. Gogs (gogs/gogs)

- **技术栈**：Go
- **文件**：AGENTS.md
- **核心要点**：
  - 轻量Git服务架构
  - 部署与开发流程
- **亮点**：极轻量的自托管Git服务
- **链接**：[gogs/gogs](https://github.com/gogs/gogs)

### 25. TiKV PD (tikv/pd)

- **技术栈**：Go
- **文件**：AGENTS.md
- **核心要点**：
  - 分布式KV存储调度器架构
  - 调度策略与测试
- **亮点**：TiKV集群的大脑——调度器开发指导
- **链接**：[tikv/pd](https://github.com/tikv/pd)

### 26. Elastic Beats (elastic/beats)

- **技术栈**：Go / Python
- **文件**：AGENTS.md
- **核心要点**：
  - 数据采集器架构
  - 多语言构建流程
- **亮点**：Elastic Stack的数据采集层
- **链接**：[elastic/beats](https://github.com/elastic/beats)

---

## 八、DevOps与基础设施

### 27. Ansible (ansible/ansible)

- **技术栈**：Python
- **文件**：约100行
- **核心要点**：
  - 自动化运维框架架构
  - 模块开发与测试规范
- **亮点**：无代理架构的自动化运维标准
- **链接**：[ansible/ansible](https://github.com/ansible/ansible)

### 28. Apache Spark (apache/spark)

- **技术栈**：Scala / Python
- **文件**：AGENTS.md
- **核心要点**：
  - 大数据处理引擎架构
  - 构建与测试流程
- **亮点**：统一大数据处理引擎的开发指导
- **链接**：[apache/spark](https://github.com/apache/spark)

### 29. OpenSearch (opensearch-project/OpenSearch)

- **技术栈**：Java
- **文件**：AGENTS.md
- **核心要点**：
  - 搜索引擎架构
  - 插件开发与测试
- **亮点**：开源搜索引擎的社区化开发指导
- **链接**：[opensearch-project/OpenSearch](https://github.com/opensearch-project/OpenSearch)

---

## 九、AI/ML框架与工具

### 30. LangChain (langchain-ai/langchain)

- **技术栈**：Python / TypeScript
- **文件**：约200行
- **核心要点**：
  - monorepo包组织（langchain/core/community/experimental）
  - poetry依赖管理
  - pytest + ruff代码质量
- **亮点**：LLM应用开发框架的monorepo管理
- **链接**：[langchain-ai/langchain](https://github.com/langchain-ai/langchain)

### 31. LlamaIndex (run-llama/llama_index)

- **技术栈**：Python
- **文件**：—
- **核心要点**：
  - RAG框架架构
  - poetry依赖管理
- **亮点**：专注RAG的LLM数据框架
- **链接**：[run-llama/llama_index](https://github.com/run-llama/llama_index)

### 32. OpenAI Agents Python (openai/openai-agents-python)

- **技术栈**：Python 3.10+ / uv
- **文件**：约300行
- **核心要点**：
  - 4个强制Skill：`$code-change-verification` / `$openai-knowledge` / `$implementation-strategy` / `$pr-draft-summary`
  - ExecPlan执行计划模式
  - Public API位置兼容性要求
  - 快照测试规范
- **亮点**：强制Skill系统确保代码变更经过完整验证
- **链接**：[openai/openai-agents-python](https://github.com/openai/openai-agents-python)

### 33. Pydantic AI (pydantic/pydantic-ai)

- **技术栈**：Python / uv workspace
- **文件**：约500行
- **核心要点**：
  - "项目优先于用户"原则（project over user）
  - DDD架构（领域驱动设计）
  - 多包monorepo组织
  - 100%测试覆盖率
  - inline-snapshot + VCR测试策略
  - `agent_docs/`编码指南
- **亮点**：DDD+100%覆盖率+inline-snapshot的工程化标杆
- **链接**：[pydantic/pydantic-ai](https://github.com/pydantic/pydantic-ai)

### 34. Google ADK Python (google/adk-python)

- **技术栈**：Python 3.10+
- **文件**：约600行
- **核心要点**：
  - Runner无状态编排模式
  - `root_agent`约定（入口Agent命名）
  - pyink格式化（2空格缩进/80字符行宽）
  - 相对导入（源码）vs 绝对导入（测试）
  - `from __future__ import annotations`必需
- **亮点**：Runner无状态编排+pyink格式化的Google风格Agent框架
- **链接**：[google/adk-python](https://github.com/google/adk-python)

### 35. Hermes Agent (NousResearch/hermes-agent)

- **技术栈**：Python
- **文件**：约800行
- **核心要点**：
  - AIAgent同步循环架构
  - 工具注册表（Tool Registry）
  - Skin/主题系统
  - 斜杠命令注册表
  - MCP客户端集成
  - 网关平台适配器
  - 提示缓存保护机制
- **亮点**：800行详尽的Agent架构文档，涵盖从工具注册到平台适配的完整设计
- **链接**：[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)

### 36. Hugging Face Transformers (huggingface/transformers)

- **技术栈**：Python
- **文件**：约200行
- **核心要点**：
  - 强制Agent贡献政策
  - 重复工作检查（避免与现有PR冲突）
  - 禁止低价值PR
  - 人类问责制（human accountability）
  - `Copied from` / modular模型机制
- **亮点**：强制Agent贡献政策+人类问责制，平衡AI效率与人类责任
- **链接**：[huggingface/transformers](https://github.com/huggingface/transformers)

### 37. scikit-learn (scikit-learn/scikit-learn)

- **技术栈**：Python / Cython
- **文件**：约50行
- **核心要点**：
  - 强制AI/Agent披露
  - PR描述需简洁明了
- **亮点**：极简但强制AI披露的规范
- **链接**：[scikit-learn/scikit-learn](https://github.com/scikit-learn/scikit-learn)

### 38. Gradio (gradio-app/gradio)

- **技术栈**：Python / Svelte / TypeScript
- **文件**：约100行
- **核心要点**：
  - PR必须关联issue
  - AI披露强制要求
  - Agent PR必须包含"kumquat"关键词
  - 禁止纯Agent PR（需人类参与）
- **亮点**："kumquat"关键词机制——用隐秘标记识别Agent PR
- **链接**：[gradio-app/gradio](https://github.com/gradio-app/gradio)

### 39. OpenAI Codex (openai/codex)

- **技术栈**：TypeScript / Node.js
- **文件**：约100行
- **核心要点**：
  - OpenAI代码生成工具架构
  - 沙箱执行环境
- **亮点**：OpenAI官方代码生成工具的开发指导
- **链接**：[openai/codex](https://github.com/openai/codex)

### 40. Karpathy Skills CLAUDE.md

- **技术栈**：—
- **文件**：约50行
- **核心要点**：
  - AI编程技能定义
  - Skill抽象与组合
- **亮点**：Karpathy风格的极简AI编程技能定义
- **链接**：[karpathy/skills](https://github.com/karpathy/skills)

---

## 十、数据科学与分析

### 41. pandas (pandas-dev/pandas)

- **技术栈**：Python / Cython
- **文件**：约50行
- **核心要点**：
  - PR前缀约定：ENH / BUG / DOC / TST / BLD / PERF / TYP / CLN
  - NumPy / numpydoc docstring规范
  - PEP 484类型提示要求
- **亮点**：严格的PR前缀分类系统，一目了然
- **链接**：[pandas-dev/pandas](https://github.com/pandas-dev/pandas)

### 42. PyCA Cryptography (pyca/cryptography)

- **技术栈**：Python + Rust(PyO3)
- **文件**：约50行
- **核心要点**：
  - `nox -e local`为唯一测试入口（禁止直接pytest/cargo test）
  - 使用uv而非pip
- **亮点**：Python+Rust(PyO3)混合项目的严格测试入口控制
- **链接**：[pyca/cryptography](https://github.com/pyca/cryptography)

### 43. Apache Superset (apache/superset)

- **技术栈**：Python(Flask) / React / TypeScript
- **文件**：约400行
- **核心要点**：
  - pre-commit强制执行
  - 前端TypeScript迁移（禁止any/JS）
  - Cypress → Playwright迁移
  - UUID迁移策略
  - Storybook MDX文档生成
- **亮点**：400行详尽的前后端迁移指导（TS迁移+Playwright迁移+UUID迁移）
- **链接**：[apache/superset](https://github.com/apache/superset)

---

## 十一、数据工程与工作流

### 44. Apache Airflow (apache/airflow)

- **技术栈**：Python(Flask) / UV workspace
- **文件**：约500+行
- **核心要点**：
  - DAG命名约定
  - `breeze`开发环境（禁止主机直接pytest）
  - 7层架构边界
  - 安全模型三级分类
  - Git远程命名约定
  - Newsfragments规则
- **亮点**：7层架构边界+breeze隔离开发环境，大型Python项目的工程化典范
- **链接**：[apache/airflow](https://github.com/apache/airflow)

### 45. Prefect (PrefectHQ/prefect)

- **技术栈**：Python / FastAPI / Pydantic v2 / SQLAlchemy 2.0
- **文件**：约300行
- **核心要点**：
  - `just`命令驱动开发
  - `hogli`统一CLI
  - 反模式列表：禁止pip / deferred imports / `--no-verify` / `--amend`
  - AGENTS.md symlink到CLAUDE.md
- **亮点**：明确的反模式列表+hogli统一CLI，减少决策疲劳
- **链接**：[PrefectHQ/prefect](https://github.com/PrefectHQ/prefect)

### 46. Dagster (dagster-io/dagster)

- **技术栈**：Python / React / TypeScript
- **文件**：约200行
- **核心要点**：
  - `make ruff`强制格式化
  - `@record`替代`@dataclass`
  - Python包位置参考
  - `gt stack`操作
  - 禁止`git push`
- **亮点**：`@record`替代`@dataclass`的设计决策，强调不可变性
- **链接**：[dagster-io/dagster](https://github.com/dagster-io/dagster)

---

## 十二、Web应用与平台

### 47. Sentry (getsentry/sentry)

- **技术栈**：Django / React / TypeScript
- **文件**：多级AGENTS.md（根+src+tests+static），约1000+行
- **核心要点**：
  - `.venv/bin/`前缀命令
  - Feature Flags（FlagPole系统）
  - IDOR防护
  - 序列化器N+1防护
  - 前后端不原子部署
- **亮点**：1000+行多级AGENTS.md，大型Django+React项目的安全与性能防护大全
- **链接**：[getsentry/sentry](https://github.com/getsentry/sentry)

### 48. PostHog (PostHog/posthog)

- **技术栈**：Django / React / TypeScript / Celery / ClickHouse
- **文件**：约500+行
- **核心要点**：
  - `hogli`统一CLI
  - Agent自动化层级：Linters → lint-staged → Skills → AGENTS.md
  - 强制Skill调用
  - `personhog`客户端
  - Temporal 2MiB限制
- **亮点**：4层Agent自动化层级（Linters→lint-staged→Skills→AGENTS.md）
- **链接**：[PostHog/posthog](https://github.com/PostHog/posthog)

### 49. Zulip (zulip/zulip)

- **技术栈**：Django / React / TypeScript / Tornado
- **文件**：约500+行
- **核心要点**：
  - "没有细节太小"原则
  - Commit纪律：每个commit最小连贯
  - `Fixes part of #123`格式
  - ~98%测试覆盖率
- **亮点**："没有细节太小"原则+98%覆盖率，极致的代码质量追求
- **链接**：[zulip/zulip](https://github.com/zulip/zulip)

### 50. Mozilla Bedrock (mozilla/bedrock)

- **技术栈**：Django / Python 3.14 / Webpack / Docker
- **文件**：约200行
- **核心要点**：
  - Wagtail CMS集成
  - LLM不列为共同作者
  - Zizmor安全检查
- **亮点**：明确"LLM不列为共同作者"的立场
- **链接**：[mozilla/bedrock](https://github.com/mozilla/bedrock)

### 51. Wagtail (wagtail/wagtail)

- **技术栈**：Django / Python
- **文件**：约100行
- **核心要点**：
  - AI披露模板
  - StreamField / StreamBlock模板访问pitfall
- **亮点**：StreamField模板访问pitfall——Django CMS特有的坑
- **链接**：[wagtail/wagtail](https://github.com/wagtail/wagtail)

### 52. Dify (langgenius/dify)

- **技术栈**：Python(Flask) / Next.js / DDD / Celery / Redis
- **文件**：多级AGENTS.md（根+api/），约500行
- **核心要点**：
  - Agent必读docstrings规则
  - DDD + Clean Architecture
  - 多租户`tenant_id`贯穿
  - SQLAlchemy session管理
  - Pydantic v2 DTOs
- **亮点**：DDD+Clean Architecture+多租户tenant_id贯穿的完整架构指导
- **链接**：[langgenius/dify](https://github.com/langgenius/dify)

### 53. Cookiecutter Django (cookiecutter/cookiecutter-django)

- **技术栈**：Python / Jinja2 / uv
- **文件**：约300行
- **核心要点**：
  - Cookiecutter模板（非Django应用本身）
  - hooks生命周期管理
  - 日历版本控制
- **亮点**：Cookiecutter模板项目的hooks生命周期管理
- **链接**：[cookiecutter/cookiecutter-django](https://github.com/cookiecutter/cookiecutter-django)

---

## 十三、AI Agent框架

### 54. OpenAI Swarm (openai/swarm)

- **技术栈**：Python
- **文件**：约50行
- **核心要点**：
  - 极简Agent框架
  - 轻量级handoff机制
- **亮点**：极简设计——Agent+handoff即全部抽象
- **链接**：[openai/swarm](https://github.com/openai/swarm)

### 55. AutoGen (microsoft/autogen)

- **技术栈**：Python
- **文件**：—
- **核心要点**：
  - 多Agent对话框架
  - Agent间通信与协作
- **亮点**：微软多Agent对话框架
- **链接**：[microsoft/autogen](https://github.com/microsoft/autogen)

### 56. CrewAI (crewAIInc/crewAI)

- **技术栈**：Python
- **文件**：—
- **核心要点**：
  - 角色扮演Agent框架
  - Crew / Agent / Task三层抽象
- **亮点**：Crew/Agent/Task三层抽象的角色扮演框架
- **链接**：[crewAIInc/crewAI](https://github.com/crewAIInc/crewAI)

### 57. Anthropic Cookbook (anthropics/anthropic-cookbook)

- **技术栈**：Python / Jupyter
- **文件**：约150行
- **核心要点**：
  - uv管理依赖
  - ruff格式化（100字符行宽）
  - Claude模型命名规则（禁止dated model IDs）
  - Bedrock模型ID格式
  - `registry.yaml`注册
- **亮点**：Claude模型命名规则——禁止dated model IDs确保兼容性
- **链接**：[anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook)

### 58. MCP Python SDK (modelcontextprotocol/python-sdk)

- **技术栈**：Python 3.10+ / uv
- **文件**：约200行
- **核心要点**：
  - main(v2) vs v1.x(稳定)分支策略
  - 仅使用uv，禁止pip
  - 100%覆盖率（`fail_under=100`）
  - 禁止`except Exception`
  - `logger.exception()`而非`logger.error()`
- **亮点**：`fail_under=100`+禁止bare except——零容忍的质量标准
- **链接**：[modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk)

### 59. FastMCP (jlowin/fastmcp)

- **技术栈**：Python 3.10+ / uv / prek
- **文件**：约500行
- **核心要点**：
  - prek hooks强制执行
  - Release流程（pun标题格式）
  - 禁止force-push
  - PR消息1-2段落
  - 功能不存在除非有文档
- **亮点**："功能不存在除非有文档"——文档即合约
- **链接**：[jlowin/fastmcp](https://github.com/jlowin/fastmcp)

---

## 十四、Python工具链

### 60. Ruff (astral-sh/ruff)

- **技术栈**：Rust（Python linter/formatter + ty type checker）
- **文件**：约200行
- **核心要点**：
  - nextest测试框架
  - `INSTA_FORCE_PASS`快照测试
  - `cargo dev generate-all`代码生成
  - Salsa增量性框架
  - 避免panic!/unwrap!
- **亮点**：Salsa增量性框架+INSTA快照测试的Rust项目工程化
- **链接**：[astral-sh/ruff](https://github.com/astral-sh/ruff)

### 61. uv (astral-sh/uv)

- **技术栈**：Rust（Python包管理器）
- **文件**：约100行
- **核心要点**：
  - insta快照测试
  - `cargo update --precise`精确依赖
  - 避免panic!/unwrap!
  - SAFETY注释要求
  - let chains优先
- **亮点**：SAFETY注释+let chains——Rust安全编码的实践
- **链接**：[astral-sh/uv](https://github.com/astral-sh/uv)

### 62. Sentry Python SDK (getsentry/sentry-python)

- **技术栈**：Python / tox
- **文件**：约80行
- **核心要点**：
  - tox为唯一测试入口
  - 自动生成文件不可手动编辑
  - 集成契约：不崩溃/不吞异常/不改变引用
  - Co-Authored-By要求
- **亮点**：集成契约三原则（不崩溃/不吞异常/不改变引用）——SDK设计的黄金法则
- **链接**：[getsentry/sentry-python](https://github.com/getsentry/sentry-python)

---

## 十五、云SDK与基础设施

### 63. Azure SDK for Python (Azure/azure-sdk-for-python)

- **技术栈**：Python
- **文件**：约400行
- **核心要点**：
  - 100+包monorepo
  - TypeSpec SDK生成工作流
  - `azpysdk`测试运行器
  - MCP服务器工具
  - 自动化边界：安全/受限/禁止操作
- **亮点**：100+包monorepo+TypeSpec代码生成——超大规模SDK的工程化
- **链接**：[Azure/azure-sdk-for-python](https://github.com/Azure/azure-sdk-for-python)

### 64. AWS CDK (aws/aws-cdk)

- **技术栈**：TypeScript（jsii生成Python绑定）
- **文件**：约500+行
- **核心要点**：
  - L1 / L2 / L3层模型
  - Mixin / Facade / Trait构建块
  - Feature Flags
  - Token安全
  - `ValidationError` + lit模板
  - Grant助手方法
- **亮点**：L1/L2/L3层模型——基础设施抽象的三层架构
- **链接**：[aws/aws-cdk](https://github.com/aws/aws-cdk)

---

## 十六、Web基础设施

### 65. Chainlit (chainlit/chainlit)

- **技术栈**：Python 3.13 / FastAPI / React / pnpm monorepo
- **文件**：约400行
- **核心要点**：
  - MCP-First原则（Context7 / Serena / GitHub MCP）
  - 向后兼容性关键
  - Co-Authored-By规范
  - Socket.IO实时通信
- **亮点**：MCP-First原则——将MCP作为核心集成方式
- **链接**：[chainlit/chainlit](https://github.com/chainlit/chainlit)

### 66. Python Slack SDK (slackapi/python-slack-sdk)

- **技术栈**：Python（零运行时依赖）
- **文件**：约200行
- **核心要点**：
  - 零运行时依赖
  - 自动代码生成
  - Web API方法模式（keyword-only参数）
- **亮点**：零运行时依赖——SDK设计的极简主义
- **链接**：[slackapi/python-slack-sdk](https://github.com/slackapi/python-slack-sdk)

### 67. Authgear Server

- **技术栈**：Go / PostgreSQL
- **文件**：约100行
- **核心要点**：
  - 身份认证服务架构
  - 多租户与OAuth集成
- **亮点**：Go+PostgreSQL的认证即服务
- **链接**：[authgear/authgear-server](https://github.com/authgear/authgear-server)

---

## 十七、其他

### 68. Kolibri (learningequality/kolibri)

- **技术栈**：Django / Vue.js 2.7
- **文件**：约400行
- **核心要点**：
  - 组合API而非选项API
  - RTL支持（从右到左语言）
  - morango UUIDField
  - ValuesViewset
- **亮点**：RTL支持——教育平台对全球语言的无障碍设计
- **链接**：[learningequality/kolibri](https://github.com/learningequality/kolibri)

### 69. Home Assistant (home-assistant/core)

- **技术栈**：Python 3.14
- **文件**：约50行
- **核心要点**：
  - Python 3.14语法支持
  - 测试参数类型注解
  - `pytest.mark.parametrize`合并测试
  - 直接key访问而非`.get()`
- **亮点**：直接key访问而非`.get()`——显式优于隐式
- **链接**：[home-assistant/core](https://github.com/home-assistant/core)

### 70. PhotoPrism (photoprism/photoprism)

- **技术栈**：Go / Vue 3
- **文件**：约500行
- **核心要点**：
  - Go后端 + Vue前端架构
  - Makefile目标为真相来源
  - 前后端开发与构建流程
- **亮点**：Makefile目标为真相来源——构建系统的单一事实来源
- **链接**：[photoprism/photoprism](https://github.com/photoprism/photoprism)

### 71. Meilisearch

- **技术栈**：Rust
- **文件**：约50行
- **核心要点**：
  - 搜索引擎架构
  - Rust构建与测试
- **亮点**：Rust搜索引擎的开发指导
- **链接**：[meilisearch/meilisearch](https://github.com/meilisearch/meilisearch)

### 72. awesome-go

- **技术栈**：Go
- **文件**：约50行
- **核心要点**：
  - Go资源列表维护
  - 贡献与分类规范
- **亮点**：awesome列表的AI辅助维护指导
- **链接**：[avelino/awesome-go](https://github.com/avelino/awesome-go)

---

## 统计表

| 分类 | 项目数 | 主要语言 |
|------|--------|----------|
| 一、前端框架与运行时 | 6 | TypeScript, JavaScript |
| 二、前端工具链 | 3 | Zig, TypeScript, Go |
| 三、后端框架与CMS | 2 | TypeScript, JavaScript |
| 四、云原生与Kubernetes | 6 | Go |
| 五、监控与可观测性 | 4 | Go, Python |
| 六、Web服务器与代理 | 2 | Go |
| 七、数据存储 | 3 | Go, Python |
| 八、DevOps与基础设施 | 3 | Python, Scala, Java |
| 九、AI/ML框架与工具 | 11 | Python, TypeScript |
| 十、数据科学与分析 | 3 | Python, Rust |
| 十一、数据工程与工作流 | 3 | Python |
| 十二、Web应用与平台 | 7 | Python(Django), TypeScript |
| 十三、AI Agent框架 | 6 | Python |
| 十四、Python工具链 | 3 | Rust, Python |
| 十五、云SDK与基础设施 | 2 | Python, TypeScript |
| 十六、Web基础设施 | 3 | Python, Go |
| 十七、其他 | 5 | Python, Go, Rust |
| **合计** | **72** | — |

---

## 跨语言模式总结

### 共性模式

1. **唯一测试入口**：几乎所有项目都指定了唯一的测试命令（`make test`、`tox`、`just test`、`go test`），禁止绕过
2. **monorepo管理**：超过60%的项目使用monorepo，pnpm workspace（前端）和uv workspace（Python）是主流
3. **AI披露要求**：约40%的项目要求披露AI/Agent参与，从简单标注到强制关键词（如Gradio的"kumquat"）
4. **禁止低质量AI输出**：禁止"Generated with AI"注释、co-author footers、AI生成评论等
5. **代码生成边界**：自动生成的代码不可手动编辑，需通过`make codegen`等命令重新生成

### Go项目特点

- `make build` / `make test` / `make lint` 三件套
- DCO签名要求（Helm）
- 零垃圾政策（Argo CD）
- 语义PR标题

### Python项目特点

- uv替代pip成为新标准
- tox / nox作为测试入口
- ruff替代flake8/black
- poetry / uv管理依赖
- 100%覆盖率要求（MCP SDK、Pydantic AI）

### Rust项目特点

- insta快照测试
- cargo nextest
- 避免panic!/unwrap!
- SAFETY注释

### TypeScript/前端项目特点

- pnpm monorepo
- Skill系统（Next.js、OpenAI Agents）
- 禁止any/JS迁移（Superset）

---

## 编写建议

基于72个项目的分析，编写高质量的AGENTS.md/CLAUDE.md建议：

### 必要内容

1. **项目概览**：一句话说明项目是什么，monorepo结构图
2. **构建与测试命令**：唯一入口，禁止绕过的方式
3. **代码风格**：格式化工具、lint规则、命名约定
4. **PR规范**：前缀、关联issue、描述要求
5. **禁止事项**：明确列出不允许的操作

### 推荐内容

6. **Skill定义**：将常见操作封装为可复用Skill
7. **架构边界**：包间依赖、层级关系
8. **反模式列表**：常见错误与避免方式
9. **安全要求**：IDOR防护、Token安全等
10. **AI参与规范**：披露要求、co-author政策

### 行数建议

| 项目规模 | 建议行数 | 参考项目 |
|----------|----------|----------|
| 小型（<10人） | 50-150行 | scikit-learn, Helm |
| 中型（10-50人） | 150-300行 | Next.js, LangChain |
| 大型（50+人） | 300-1000行 | Sentry, Airflow, Zulip |

### 反模式

- ❌ 过于简短（<30行）：缺少关键信息，AI无法有效工作
- ❌ 过于冗长（>1000行）：信息过载，AI难以定位关键规则
- ❌ 重复内容：多个文件重复相同规则
- ❌ 缺少禁止事项：只说"做什么"不说"不做什么"
- ❌ 无示例：规则没有代码示例佐证
