# DevSecOps 安全开发运维一体化

## 一、DevSecOps 概述

### 1.1 什么是 DevSecOps

**DevSecOps = Development（开发） + Security（安全） + Operations（运维）**

核心理念：**将安全嵌入到 DevOps 的每一个环节，而不是在最后阶段才"补安全"。**

```
传统模式（安全是最后一道关卡）：
    开发 ──▶ 测试 ──▶ 部署 ──▶ 安全审计

DevSecOps 模式（安全左移 + 持续内嵌）：
    安全 ──▶ 安全 ──▶ 安全 ──▶ 安全 ──▶ 安全
      │        │        │        │        │
    开发 ──▶ 构建 ──▶ 测试 ──▶ 部署 ──▶ 运行
```

### 1.2 为什么需要 DevSecOps

| 传统安全模式的痛点 | DevSecOps 的解决方案 |
|-------------------|---------------------|
| 安全在发布前集中检查，发现问题时已积压大量修复工作 | **安全左移**：编码阶段就发现，修复成本指数级降低 |
| 安全团队是瓶颈，一个项目等一周才能出安全报告 | **自动化**：SAST/SCA 在 CI 中自动运行，秒级反馈 |
| 发布后暴露漏洞，紧急回滚/热修复 | **持续监控**：RASP 运行时保护 + 容器漏洞扫描 |
| 安全需求与开发速度冲突 | **安全即代码**：安全策略写成配置文件，随代码一起版本管理 |

### 1.3 安全左移（Shift Left）

```
修复成本
   │
   │  ┌────────────────────────────────────────────────┐
   │  │                                                │
   │  │  ★ 修复成本：编码阶段 $1                          │
   │  │  ★ 修复成本：测试阶段 $10                          │
   │  │  ★ 修复成本：预发布阶段 $100                       │
   │  │  ★ 修复成本：生产环境 $1000+                       │
   │  │                                                │
   │  └────────────────────────────────────────────────┘
   │
   │     ★
   │     │  ★
   │     │  │  ★
   │     │  │  │  ★
   │     │  │  │  │  ★
   │     │  │  │  │  │  ★
   └─────┴──┴──┴──┴──┴──┴──────────────▶ 时间
      编码 构建 测试 预发布 生产 事故后
```

---

## 二、DevSecOps 核心支柱

### 2.1 六大支柱

```
┌──────────────────────────────────────────────────────┐
│                    DevSecOps                         │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│ 安全左移  │ 自动化    │ 持续监控  │ 安全即代码│ 文化变革 │
│          │          │          │          │         │
│ 编码阶段  │ CI/CD 中  │ 运行时    │ 策略版本  │ 安全人人  │
│ 发现漏洞  │ 自动扫描  │ 保护      │ 管理      │ 有责     │
└──────────┴──────────┴──────────┴──────────┴─────────┘
```

### 2.2 各阶段安全能力

| SDLC 阶段 | 安全能力 | 工具 |
|-----------|---------|------|
| **编码** | IDE 安全插件、Pre-commit Hook、安全编码规范 | SonarLint、Semgrep IDE、git-secrets |
| **构建** | SAST、SCA、IaC 扫描、密钥扫描、镜像扫描 | Semgrep、Trivy、Checkov、TruffleHog |
| **测试** | IAST、DAST、Fuzz 测试、API 安全测试 | OWASP ZAP、DongTai、Nuclei |
| **部署** | 签名验证、准入控制、IaC 漂移检测 | OPA/Kyverno、Cosign、Checkov |
| **运行** | RASP、容器运行时安全、WAF、日志审计 | Falco、OpenRASP、ModSecurity、Wazuh |
| **监控** | 漏洞管理、合规扫描、SIEM、威胁情报 | DefectDojo、Trivy Operator、ELK+Splunk |

---

## 三、DevSecOps 工具链全景

### 3.1 工具链矩阵

```
编码阶段                构建阶段               测试阶段
─────────────────────────────────────────────────────
预提交检查               SAST                   IAST
├─ git-secrets          ├─ Semgrep             ├─ DongTai(洞态)
├─ pre-commit hooks     ├─ CodeQL              ├─ Contrast
├─ SonarLint            ├─ SonarQube           ├─ OpenRASP
└─ IDE Plugins          ├─ Fortify             └─ Seeker
                        │
                        │
                        SCA                   DAST
                        ├─ Trivy              ├─ OWASP ZAP
                        ├─ Snyk               ├─ Nuclei
                        ├─ OWASP Dependency-  ├─ Burp Suite
                        │  Check              └─ Acunetix
                        ├─ Dependabot
                        └─ OSV-Scanner
                        │
                        │
                        IaC 扫描              密钥扫描
                        ├─ Checkov            ├─ TruffleHog
                        ├─ tfsec              ├─ Gitleaks
                        ├─ Trivy config       ├─ detect-secrets
                        └─ KICS               └─ GitGuardian

部署阶段               运行阶段                监控与管理
─────────────────────────────────────────────────────
准入控制                运行时安全              漏洞管理
├─ OPA/Gatekeeper       ├─ Falco               ├─ DefectDojo
├─ Kyverno              ├─ OpenRASP            ├─ Dependency-Track
├─ Cosign(签名)          ├─ Tracee              ├─ Archery
└─ Vault(密钥管理)       ├─ Tetragon            └─ Trivy Operator
                        │
                        │
                        WAF                    SIEM
                        ├─ ModSecurity         ├─ Wazuh
                        ├─ Coraza              ├─ ELK Stack
                        └─ Cloudflare          └─ Splunk
```

### 3.2 核心工具详解

| 类别 | 首选工具 | 理由 |
|------|---------|------|
| SAST | **Semgrep** | 规则自定义灵活，CI/CD 友好，开源免费 |
| SCA | **Trivy** | 多合一（漏洞+IaC+密钥），速度快 |
| IaC 安全 | **Checkov** | 750+ 内置规则，支持格式最多 |
| 密钥扫描 | **TruffleHog** | 深度扫描 Git 历史，高熵检测 |
| DAST | **OWASP ZAP** | 最流行开源 DAST，社区活跃 |
| 容器安全 | **Trivy + Falco** | 扫描+运行时，互补 |
| K8s 安全 | **Kubescape + Kyverno** | 合规+准入，双保险 |
| 漏洞管理 | **DefectDojo** | 聚合多工具结果，统一管理 |

---

## 四、DevSecOps 流水线实战

### 4.1 完整 CI/CD 流水线（GitHub Actions）

```yaml
name: DevSecOps Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 0'  # 每周日全量扫描

jobs:
  # ===== 阶段 1: 预提交检查 =====
  pre-commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Detect Secrets
        run: |
          pip install detect-secrets
          detect-secrets scan --all-files > .secrets.baseline
      - name: GitLeaks
        uses: gitleaks/gitleaks-action@v2

  # ===== 阶段 2: SAST + SCA + IaC 扫描 =====
  static-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Semgrep SAST
        run: |
          pip install semgrep
          semgrep --config=auto --sarif -o semgrep.sarif .
      - name: Trivy SCA
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scanners: 'vuln,secret'
          severity: 'HIGH,CRITICAL'
          exit-code: '1'
      - name: Checkov IaC Scan
        run: |
          pip install checkov
          checkov -d . --framework terraform,dockerfile,kubernetes \
            --soft-fail-on LOW,MEDIUM
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: semgrep.sarif

  # ===== 阶段 3: 构建 + 镜像扫描 =====
  build-and-scan:
    needs: static-analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker Image
        run: docker build -t myapp:${{ github.sha }} .
      - name: Trivy Image Scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-image.sarif'
          severity: 'HIGH,CRITICAL'
      - name: Sign Image (Cosign)
        run: |
          cosign sign --key cosign.key myapp:${{ github.sha }}

  # ===== 阶段 4: 部署到 QA + DAST 扫描 =====
  deploy-and-dast:
    needs: build-and-scan
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to QA
        run: |
          kubectl apply -f k8s/qa/
          kubectl wait --for=condition=ready pod -l app=myapp --timeout=120s
      - name: OWASP ZAP Scan
        run: |
          docker run --network host owasp/zap2docker-stable zap-baseline.py \
            -t http://qa.myapp.example.com \
            -J zap-report.json
      - name: Nuclei Scan
        run: |
          nuclei -u http://qa.myapp.example.com \
            -t exposures/ -t vulnerabilities/ -t misconfiguration/ \
            -severity high,critical -json -o nuclei-report.json

  # ===== 阶段 5: 合规检查 =====
  compliance:
    needs: static-analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Kubescape K8s Compliance
        run: |
          curl -s https://raw.githubusercontent.com/kubescape/kubescape/master/install.sh | sh
          kubescape scan framework nsa --format sarif -o kubescape.sarif
```

### 4.2 安全门禁（Security Gate）

```
每个阶段设置质量门禁，不通过则阻断流水线：

┌────────────┐    通过?    ┌────────────┐    通过?    ┌────────────┐
│   SAST     │──────────▶ │   SCA      │──────────▶ │  IaC 扫描  │
│            │             │            │             │            │
│  ≤ 5 HIGH  │             │ 0 CRITICAL │             │ 0 HIGH     │
└────────────┘             └────────────┘             └────────────┘
     │ 不通过                    │ 不通过                     │ 不通过
     ▼                          ▼                           ▼
  ┌─────────────────────────────────────────────────────────┐
  │  阻断 + 通知开发者 + 自动创建 Issue + Slack 告警          │
  └─────────────────────────────────────────────────────────┘
```

### 4.3 安全门禁规则示例

```yaml
# .github/security-gates.yaml
gates:
  sast:
    max_high: 5
    max_critical: 0
    tool: semgrep

  sca:
    max_critical: 0
    max_high: 3
    tool: trivy

  iac:
    max_high: 0
    tool: checkov

  container:
    max_critical: 0
    max_high: 3
    tool: trivy

  dast:
    max_high: 0
    max_critical: 0
    tool: zap
```

---

## 五、Kubernetes 环境的 DevSecOps

### 5.1 准入控制（Admission Control）

```
API Server 请求
    │
    ▼
┌──────────────┐
│  Mutating     │  ← 修改资源（注入 sidecar、添加标签）
│  Webhook      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Validating   │  ← 拒绝不合规资源（特权容器、latest 标签）
│  Webhook      │
└──────┬───────┘
       │
       ▼
   持久化到 etcd
```

**Kyverno 策略示例**：

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-privileged-containers
spec:
  validationFailureAction: Enforce
  rules:
    - name: no-privileged
      match:
        resources:
          kinds:
            - Pod
      validate:
        message: "不允许使用特权容器"
        pattern:
          spec:
            containers:
              - =(securityContext):
                  =(privileged): "false"
```

### 5.2 运行时安全（Falco）

```yaml
# Falco 规则：检测容器内异常行为
- rule: Write below binary dir
  desc: 尝试写入 /bin 目录（可能是恶意软件）
  condition: >
    evt.dir = < and evt.type in (open, openat, creat)
    and (fd.name startswith /bin/ or fd.name startswith /sbin/)
  output: "文件写入二进制目录 (user=%user.name command=%proc.cmdline)"
  priority: CRITICAL

- rule: Contact K8s API Server From Container
  desc: 容器内访问 K8s API（可能是横向移动）
  condition: >
    evt.type=connect and container
    and fd.sip.name=kubernetes.default.svc.cluster.local
  output: "容器访问 K8s API (container=%container.name ip=%fd.rip)"
  priority: WARNING
```

### 5.3 镜像签名与信任（Cosign + Sigstore）

```bash
# 生成密钥对
cosign generate-key-pair

# 签名镜像
cosign sign --key cosign.key myregistry.com/myapp:v1.0.0

# 验证签名
cosign verify --key cosign.pub myregistry.com/myapp:v1.0.0

# K8s 中强制验证签名
# 使用 Kyverno 或 Connaisseur 准入控制器
```

---

## 六、漏洞管理生命周期

### 6.1 漏洞管理流程

```
发现 ──▶ 评估 ──▶ 修复 ──▶ 验证 ──▶ 关闭
  │        │        │        │        │
  │        │        │        │        │
  ▼        ▼        ▼        ▼        ▼
工具扫描  CVSS评分  PR+代码变更 复扫确认  DefectDojo
自动发现  影响分析  分配责任人  回归测试  记录关闭
```

### 6.2 DefectDojo 统一管理平台

```bash
# Docker 部署
docker run -d -p 8080:8080 \
  -e DD_ADMIN_USER=admin \
  -e DD_ADMIN_PASSWORD=admin123 \
  defectdojo/defectdojo-django:latest

# 导入各工具扫描结果
curl -X POST "http://defectdojo:8080/api/v2/import-scan/" \
  -H "Authorization: Token YOUR_TOKEN" \
  -F "scan_type=Semgrep JSON Report" \
  -F "engagement=1" \
  -F "file=@semgrep-report.json"

# 支持的扫描类型
# Semgrep / Trivy / Checkov / ZAP / Nuclei / Snyk / Dependency-Check ...
```

### 6.3 漏洞处理 SLA

| 严重程度 | CVSS 评分 | 修复时限 | 审批流程 |
|---------|----------|---------|---------|
| **Critical** | 9.0-10.0 | **24 小时** | 安全团队 + CTO 审批 |
| **High** | 7.0-8.9 | **7 天** | 安全团队审批 |
| **Medium** | 4.0-6.9 | **30 天** | 团队 Leader 审批 |
| **Low** | 0.1-3.9 | **90 天** | 纳入迭代计划 |

---

## 七、安全即代码（Security as Code）

### 7.1 安全策略版本化管理

```bash
# 项目结构
myapp/
├── src/
├── .github/
│   └── workflows/
│       └── devsecops.yml          # 安全流水线定义
├── security/
│   ├── semgrep-rules/             # 自定义 SAST 规则
│   │   └── custom-rules.yaml
│   ├── checkov-policies/          # IaC 安全策略
│   │   └── skip.yaml
│   ├── kyverno-policies/          # K8s 准入策略
│   │   ├── disallow-privileged.yaml
│   │   └── require-resource-limits.yaml
│   ├── security-gates.yaml        # 安全门禁规则
│   ├── threat-model.md            # 威胁建模
│   └── incident-response.md       # 应急响应
├── Dockerfile
├── k8s/
└── terraform/
```

### 7.2 密钥管理（HashiCorp Vault）

```bash
# CI 中动态获取密钥，不硬编码
vault write secret/myapp/db username=myapp password=secure123

# CI 中通过 Vault Agent 注入
- name: Get Secrets from Vault
  run: |
    export DB_PASSWORD=$(vault kv get -field=password secret/myapp/db)
    echo "::add-mask::$DB_PASSWORD"  # GitHub Actions 屏蔽敏感信息
```

---

## 八、DevSecOps 成熟度模型

### 8.1 五级成熟度

| 级别 | 名称 | 特征 |
|------|------|------|
| **Level 1** | 初始级 | 手动安全测试，上线前渗透测试，无自动化 |
| **Level 2** | 可管理级 | 引入 SAST 工具，定期扫描，漏洞跟踪用 Excel |
| **Level 3** | 已定义级 | CI/CD 集成 SAST/SCA，安全门禁，DefectDojo 管理 |
| **Level 4** | 量化级 | 全链路自动化（SAST+SCA+IAST+DAST+IaC），SLA 量化 |
| **Level 5** | 优化级 | 威胁建模自动化、AI 辅助修复、混沌安全工程、持续改进 |

### 8.2 落地路线图

```
第 1-3 月：基础建设
├── 引入 SAST（Semgrep）+ SCA（Trivy）
├── 集成到 CI/CD 流水线
└── 搭建 DefectDojo 漏洞管理平台

第 4-6 月：扩展覆盖
├── IaC 安全扫描（Checkov）
├── 密钥扫描（TruffleHog/Gitleaks）
├── 容器镜像扫描（Trivy）
└── 设置安全门禁规则

第 7-9 月：深化自动化
├── DAST 集成（OWASP ZAP）
├── K8s 准入控制（Kyverno）
├── 运行时安全（Falco）
└── 漏洞修复 SLA 考核

第 10-12 月：持续优化
├── 威胁建模自动化
├── 安全培训 + 安全 Champion 制度
├── 混沌安全工程
└── 度量与 KPI 可视化
```

---

## 九、关键指标（KPI）

| 指标 | 计算方式 | 目标 |
|------|---------|------|
| **MTTR（平均修复时间）** | 漏洞发现到修复的时长 | Critical < 24h |
| **漏洞密度** | 漏洞数 / 千行代码 | 持续下降 |
| **安全扫描覆盖率** | 已扫描项目 / 总项目 | 100% |
| **SAST 阻断率** | 被安全门禁阻断的构建数 | < 10%（误报控制） |
| **漏洞复发率** | 同类漏洞再次出现的比例 | < 5% |
| **安全负债** | 逾期未修复漏洞数 | 持续下降 |

---

## 十、常见陷阱与最佳实践

### 10.1 常见陷阱

| 陷阱 | 表现 | 解决 |
|------|------|------|
| **安全成为瓶颈** | 安全团队卡流程，开发者等审核 | 安全左移，自动化，安全培训赋能开发者 |
| **工具太多无人看** | 买了 10 个工具，报警没人处理 | 收敛到少而精的核心工具，DefectDojo 统一管理 |
| **误报太多** | 大量假阳性，开发者麻木 | 逐步调优规则，先开 HIGH/CRITICAL，再逐步降低 |
| **只扫不修** | 扫描报告堆积，无人修复 | 设立 SLA，纳入绩效考核，安全负债面板 |
| **安全团队孤岛** | 安全团队独立运作，与开发脱节 | 安全 Champion 制度，安全团队嵌入开发团队 |

### 10.2 最佳实践

1. **从少到多**：先上 SAST + SCA，稳定后再加 DAST/IAST
2. **先 Critical 后 Medium**：门禁规则先只阻断 Critical，逐步收紧
3. **安全 Champion**：每个团队指定 1-2 人接受安全培训，作为安全接口人
4. **度量驱动**：用 DefectDojo 面板可视化漏洞趋势，数据驱动决策
5. **安全培训常态化**：每季度一次安全编码培训，OWASP Top 10 必讲
6. **威胁建模前置**：新功能设计阶段就做威胁建模，不是上线后补安全

---

## 十一、一句话总结

> **DevSecOps 不是一套工具，而是一种文化：把安全从"最后一道关卡"变成"所有人的责任"，通过自动化让安全跟得上开发速度，用安全左移把漏洞消灭在编码阶段。**

---

## 十二、参考资料

1. [OWASP DevSecOps Guideline](https://owasp.org/www-project-devsecops-guideline/)
2. [DefectDojo 官方文档](https://defectdojo.github.io/django-DefectDojo/)
3. [Falco 官方文档](https://falco.org/docs/)
4. [Kyverno 策略库](https://kyverno.io/policies/)
5. [CIS Kubernetes Benchmark](https://www.cisecurity.org/benchmark/kubernetes)
6. [SAFECode 安全开发最佳实践](https://safecode.org/)