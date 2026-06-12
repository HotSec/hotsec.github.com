# 应用安全测试：SAST / DAST / IAST 与 IaC 安全检查

## 一、三大安全测试技术对比

### 1.1 总览对比表

| 维度 | **SAST** | **DAST** | **IAST** |
|------|----------|----------|----------|
| **全称** | Static Application Security Testing | Dynamic Application Security Testing | Interactive Application Security Testing |
| **中文** | 静态应用安全测试 | 动态应用安全测试 | 交互式应用安全测试 |
| **测试时机** | 开发/编码阶段（白盒） | 运行阶段（黑盒） | 运行阶段（灰盒） |
| **测试方式** | 扫描源代码 | 模拟攻击运行中的应用 | 插桩到运行时监控行为 |
| **需要源码** | ✅ 必须 | ❌ 不需要 | ✅ 需要（插桩） |
| **需要应用运行** | ❌ 不需要 | ✅ 必须 | ✅ 必须 |
| **发现漏洞阶段** | 编码阶段最早发现 | 部署后才能发现 | 测试阶段（QA环境） |
| **误报率** | 高（需要调优规则） | 中低 | **最低**（实际执行路径） |
| **覆盖率** | 高（全代码路径） | 中（仅暴露端点） | 中（仅执行到的路径） |
| **SDLC位置** | 编码 → 提交 | 测试 → 预发布 | 测试 → QA |

### 1.2 SDLC 中的位置

```
编码阶段                构建阶段           测试阶段         部署阶段         运行阶段
    │                      │                  │               │               │
    ▼                      ▼                  ▼               ▼               ▼
┌────────┐           ┌────────┐        ┌────────┐      ┌────────┐      ┌────────┐
│  SAST  │  ──────▶  │ SCA依赖│ ──────▶│  IAST  │ ────▶│  DAST  │ ────▶│  RASP  │
│ 静态扫描│           │ 检查   │        │ 交互式  │      │ 动态扫描│      │ 运行时  │
└────────┘           └────────┘        └────────┘      └────────┘      └────────┘
   白盒                供应链安全          灰盒             黑盒            自保护
```

---

## 二、SAST — 静态应用安全测试

### 2.1 原理

在**不运行代码**的前提下，分析源代码、字节码或二进制文件的语法、数据流、控制流，检测潜在安全漏洞。

```
                             ┌─────────────────────┐
        源代码                 │  SAST 引擎           │
    ┌────────────┐            │                     │
    │  main.go   │──────────▶ │ 1. 词法分析 → AST   │
    │  handler/  │            │ 2. 数据流分析       │
    │  service/  │            │ 3. 控制流分析       │
    └────────────┘            │ 4. 污点追踪         │
                              │ 5. 规则匹配         │
                              └──────────┬──────────┘
                                         │
                                         ▼
                                   漏洞报告
                              ┌────────────┐
                              │ SQL注入 ×3  │
                              │ XSS ×1     │
                              │ 硬编码密钥  │
                              └────────────┘
```

### 2.2 能检测的漏洞类型

| 漏洞类别 | 示例 |
|---------|------|
| **注入类** | SQL 注入、命令注入、LDAP 注入、XPath 注入 |
| **XSS** | 反射型、存储型、DOM 型 |
| **敏感数据泄露** | 硬编码密码、API Key、Token、私钥 |
| **不安全配置** | 弱加密算法、不安全的随机数、Debug 模式开启 |
| **路径遍历** | 目录穿越、文件包含 |
| **反序列化** | 不可信数据反序列化 |
| **SSRF** | 服务端请求伪造 |

### 2.3 主流工具

| 工具 | 类型 | 语言支持 | 特点 |
|------|------|---------|------|
| **SonarQube** | 开源/商业 | 30+ 语言 | 代码质量 + 安全一体，最流行 |
| **Semgrep** | 开源 | 30+ 语言 | 规则可自定义，CI/CD 友好 |
| **CodeQL** | 开源（GitHub） | C/C++/Java/Go/JS/Python | 语义级分析，可写自定义查询 |
| **Fortify** | 商业 | 20+ 语言 | 企业级，规则最全 |
| **Checkmarx** | 商业 | 20+ 语言 | IDE 集成好 |
| **Bandit** | 开源 | Python | Python 专项 |
| **Gosec** | 开源 | Go | Go 语言专项 |
| **Brakeman** | 开源 | Ruby on Rails | Ruby 专项 |

### 2.4 Semgrep 实战示例

```yaml
# rules/sqli.yaml — 自定义检测 Python SQL 注入
rules:
  - id: python-sql-string-concatenation
    patterns:
      - pattern: |
          cursor.execute("..." + $VAR)
    message: "检测到 SQL 字符串拼接，存在注入风险"
    severity: ERROR
    languages:
      - python
```

```bash
# CI 中运行
semgrep --config=auto --error .

# 仅检查严重和高危
semgrep --config=auto --severity ERROR --severity WARNING .
```

### 2.5 优缺点

| 优点 | 缺点 |
|------|------|
| 编码阶段即可发现，修复成本最低 | **误报率高**，需要人工确认和规则调优 |
| 覆盖所有代码路径 | 无法检测运行时环境问题（配置、权限） |
| 可集成到 IDE 实时提示 | 无法发现业务逻辑漏洞 |
| 扫描速度较快 | 语言/框架特定，多语言项目需多工具 |

---

## 三、DAST — 动态应用安全测试

### 3.1 原理

在应用**运行时**，模拟攻击者向运行中的系统发送恶意请求，分析响应以检测漏洞。不接触源码，纯粹黑盒测试。

```
                          ┌─────────────────────┐
     模拟攻击请求           │  DAST 扫描器          │
┌──────────────────┐      │                     │
│ GET /user?id=1   │─────▶│ 1. 爬虫发现端点      │
│ GET /user?id=1'  │      │ 2. Fuzz 参数        │
│ POST /login ...  │      │ 3. 注入攻击载荷      │
│ <script>alert()  │      │ 4. 分析响应/报错     │
└──────────────────┘      └──────────┬──────────┘
                                     │
                                     ▼
                               漏洞报告
                          ┌────────────┐
                          │ SQL注入 ×2  │
                          │ XSS ×3     │
                          │ 信息泄露    │
                          └────────────┘
```

### 3.2 能检测的漏洞类型

| 漏洞类别 | 示例 |
|---------|------|
| **注入类** | SQL 注入、命令注入、LDAP 注入、XXE |
| **XSS** | 反射型、存储型、DOM 型 |
| **CSRF** | 跨站请求伪造 |
| **配置错误** | 目录列举、Debug 页面暴露、默认密码 |
| **认证/会话** | 弱密码策略、Token 可预测、会话固定 |
| **敏感信息泄露** | 错误页面泄露堆栈、源码注释泄露 |
| **SSRF** | 服务端请求伪造（实际触发验证） |

### 3.3 主流工具

| 工具 | 类型 | 特点 |
|------|------|------|
| **OWASP ZAP** | 开源 | 最流行的开源 DAST，带自动化扫描 + 手动代理 |
| **Burp Suite Pro** | 商业 | 渗透测试行业标准，手动+自动 |
| **Nuclei** | 开源 | 基于模板的高速扫描，YAML 规则 |
| **Acunetix** | 商业 | 速度快，自动登录，支持 SPA |
| **Netsparker** | 商业 | 自动验证漏洞，误报率低 |
| **AppScan** | 商业（HCL） | 企业级 |

### 3.4 OWASP ZAP 实战

```bash
# 快速扫描（命令行）
zap-api-scan.py -t http://target.example.com -f openapi

# Docker 运行 ZAP 全扫描
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://target.example.com \
  -r zap-report.html

# CI 集成（GitHub Actions 示例）
- name: ZAP Scan
  run: |
    docker run --network host owasp/zap2docker-stable zap-baseline.py \
      -t http://localhost:8080 \
      -J zap-report.json
```

```bash
# Nuclei 扫描示例
# 扫描 OWASP Top 10 漏洞
nuclei -u https://target.com -t exposures/ -t vulnerabilities/ -t misconfiguration/

# 基于技术栈扫描
nuclei -u https://target.com -t http/technologies/ -t http/cves/
```

### 3.5 优缺点

| 优点 | 缺点 |
|------|------|
| 不需要源码，适用任何技术栈 | **只能在应用运行后**才能扫描 |
| 误报率低（实际触发验证） | 覆盖率受限于爬虫和已暴露端点 |
| 能发现运行时配置问题 | 扫描速度较慢（需等待响应） |
| 技术栈无关 | 可能触发副作用（创建/删除数据） |

---

## 四、IAST — 交互式应用安全测试

### 4.1 原理

在应用运行时**插桩（Instrument）**，监控代码执行路径、数据流，在请求实际处理过程中实时检测安全漏洞。结合了 SAST 的深度和 DAST 的准确性。

```
                          ┌───────────────────────────┐
     正常请求                │  应用（已插桩 IAST Agent）  │
┌─────────────┐            │                           │
│ 用户请求     │───────────▶│ ┌─────────────────────┐  │
│ 测试请求     │            │ │  IAST Agent 监控      │  │
└─────────────┘            │ │  - 数据流追踪         │  │
                           │ │  - 污点传播分析       │  │
                           │ │  - HTTP 请求/响应     │  │
                           │ │  - SQL/命令执行       │  │
                           │ │  - 文件操作           │  │
                           │ └──────────┬──────────┘  │
                           └────────────┼─────────────┘
                                        │
                                        ▼
                                  实时检测报告
                              ┌─────────────────┐
                              │ 实际触发的漏洞    │
                              │ + 精确代码位置    │
                              │ + 攻击载荷       │
                              │ + 数据流路径     │
                              └─────────────────┘
```

### 4.2 与 SAST / DAST 的关键区别

| 方面 | SAST | DAST | **IAST** |
|------|------|------|----------|
| 定位精度 | 文件+行号 | URL+参数 | **文件+行号+数据流** |
| 误报率 | 高 | 中 | **极低（实际触发才报告）** |
| 漏报率 | 低 | 中高 | 中（仅执行到的路径） |
| 实时性 | 离线 | 离线 | **实时（请求处理中）** |
| 测试来源 | 静态代码 | 外部流量 | **内部插桩 + 任意流量** |

### 4.3 IAST Agent 插桩方式

| 插桩方式 | 原理 | 适用语言 |
|---------|------|---------|
| **JVM Agent** | javaagent 加载，字节码增强 | Java / Kotlin / Scala |
| **.NET Profiler** | CLR Profiler API | C# / .NET |
| **Node.js Hook** | require hook / async_hooks | Node.js |
| **PHP 扩展** | PHP 扩展注入 | PHP |
| **Python Monkey Patch** | 运行时替换敏感函数 | Python |

### 4.4 主流工具

| 工具 | 类型 | 特点 |
|------|------|------|
| **Contrast Security** | 商业 | IAST 先驱，支持 Java/.NET/Node.js/Python |
| **Seeker (Synopsys)** | 商业 | 基于 IAST + 主动验证 |
| **HCL AppScan IAST** | 商业 | 与 AppScan SAST/DAST 联动 |
| **OpenRASP/IAST** | 开源 | 百度开源，Java/PHP 支持 |
| **DongTai（洞态 IAST）** | 开源 | 火线开源，Java/Python/Go |

### 4.5 OpenRASP IAST 示例

```bash
# Java 应用启动时加载 IAST Agent
java -javaagent:dongtai-agent.jar \
     -Ddongtai.server.url=http://dongtai-server:8080 \
     -Ddongtai.app.name=myapp \
     -jar myapp.jar
```

**IAST 检测 SQL 注入的过程**：

```
1. 用户发送请求: GET /user?id=1' OR '1'='1
2. IAST Agent 捕获：参数值进入应用
3. 污点标记：将 id=1' OR '1'='1 标记为污点数据（Tainted）
4. 污点传播：跟踪污点数据流过代码
5. 触发敏感操作：污点数据到达 SQL 执行点
   cursor.execute("SELECT * FROM users WHERE id=" + id)
6. 报告漏洞：发现 SQL 注入 + 完整数据流路径
```

### 4.6 优缺点

| 优点 | 缺点 |
|------|------|
| 误报率极低（只报告实际触发的） | **需要应用运行** + Agent 部署 |
| 精确定位代码位置 + 数据流 | 仅覆盖**实际执行到的代码路径** |
| 可与功能测试 / DAST 联动 | 插桩有性能开销（通常 2-5%） |
| 实时检测，不需要额外扫描 | 对 Agent 兼容性有要求 |

---

## 五、IaC 安全检查（基础设施即代码安全）

### 5.1 什么是 IaC 安全扫描

IaC（Infrastructure as Code）安全扫描是在**部署前**或**CI/CD 流水线中**自动检测 Terraform / CloudFormation / Kubernetes / Dockerfile 等配置中的安全风险和合规问题。

### 5.2 能检测的风险类型

| 风险类别 | 示例 |
|---------|------|
| **权限过大** | S3 桶公开读写、IAM 策略 `*:*` 、Security Group 0.0.0.0/0 |
| **加密缺失** | S3 未开启加密、RDS 未加密、EBS 未加密 |
| **密钥硬编码** | Terraform 中写死密码 / Token / SSH 私钥 |
| **网络暴露** | 数据库端口对公网开放、K8s Service type=LoadBalancer 不必要 |
| **容器配置** | 容器以 root 运行、特权模式、未声明只读文件系统 |
| **合规违规** | 不符合 CIS Benchmark、PCI-DSS、SOC2 要求 |
| **漂移检测** | 运行时配置与 IaC 定义不一致 |

### 5.3 主流工具

| 工具 | 类型 | 支持格式 | 特点 |
|------|------|---------|------|
| **Checkov** | 开源 | Terraform/CFN/K8s/Dockerfile/Helm/Bicep/ARM | Prisma Cloud 出品，规则最全（750+），最流行 |
| **tfsec** | 开源 | Terraform | 轻量快速，可输出 SARIF/JUnit |
| **trivy** | 开源 | Terraform/Dockerfile/K8s | 同时支持漏洞扫描和 IaC 扫描 |
| **KICS** | 开源 | Terraform/CFN/K8s/Dockerfile/Ansible | Checkmarx 出品，支持 50+ 查询 |
| **Terrascan** | 开源 | Terraform/K8s/Helm/Kustomize | Tenable 出品，支持自定义策略 |
| **Snyk IaC** | 商业 | 全格式 | 与 Snyk Open Source/Code 统一平台 |
| **Kubescape** | 开源 | K8s YAML/Helm | NSA-CISA + MITRE ATT&CK 框架，扫描 K8s 错误配置 |

### 5.4 Checkov 实战示例

```bash
# 安装
pip install checkov

# 扫描 Terraform 目录
checkov -d ./terraform

# 扫描 Dockerfile
checkov -f Dockerfile --framework dockerfile

# 输出 JSON 报告
checkov -d ./terraform -o json > checkov-report.json

# 仅检查 HIGH/CRITICAL
checkov -d ./terraform --check HIGH,CRITICAL

# 跳过特定规则
checkov -d ./terraform --skip-check CKV_AWS_20,CKV_AWS_21
```

**典型检测结果**：

```
Check: CKV_AWS_20: "Ensure S3 Bucket has access logging enabled"
	FAILED for resource: aws_s3_bucket.data_bucket
	File: /terraform/s3.tf:5-12

Check: CKV_AWS_40: "Ensure IAM policies are attached only to groups or roles"
	FAILED for resource: aws_iam_user_policy.user_policy
	File: /terraform/iam.tf:15-20

Check: CKV_K8S_2: "Do not use latest tag in containers"
	FAILED for resource: Deployment.default.myapp
	File: /k8s/deployment.yaml:10
```

### 5.5 Trivy IaC 扫描

```bash
# 扫描当前目录所有 IaC 文件
trivy config .

# 扫描特定目录
trivy config ./terraform ./k8s

# 输出 SARIF 格式（GitHub 可展示）
trivy config --format sarif -o trivy-results.sarif .

# 仅显示严重问题
trivy config --severity HIGH,CRITICAL .
```

### 5.6 S3 桶安全检查示例

```hcl
# ❌ 不安全：公开读写
resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"
  acl    = "public-read-write"  # Checkov: CKV_AWS_20
}

# ❌ 不安全：未加密
resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"
  # 缺少 server_side_encryption_configuration  # Checkov: CKV_AWS_19
}

# ✅ 安全：启用加密 + 日志 + 私密
resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.bucket
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_logging" "data" {
  bucket        = aws_s3_bucket.data.bucket
  target_bucket = aws_s3_bucket.logs.bucket
  target_prefix = "s3-access/"
}

resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.bucket

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

---

## 六、四者集成：DevSecOps 完整流水线

### 6.1 CI/CD 集成架构

```
开发者 Push 代码
    │
    ▼
┌────────────────────────────────────────────────────────────────┐
│                      CI/CD Pipeline                            │
│                                                                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │  SAST    │    │  IaC 扫描│    │  SCA     │    │ 镜像扫描 │ │
│  ├──────────┤    ├──────────┤    ├──────────┤    ├──────────┤ │
│  │ Semgrep  │    │ Checkov  │    │ Trivy    │    │ Trivy    │ │
│  │ CodeQL   │    │ tfsec    │    │ Snyk     │    │ Grype    │ │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘ │
│       │               │               │               │       │
│       └───────────────┴───────────────┴───────────────┘       │
│                          │                                     │
│                          ▼                                     │
│                   全部通过？                                    │
│                     │                                          │
│            ┌────────┴────────┐                                 │
│            ▼                 ▼                                 │
│          是                 否 → 阻断 + 通知开发者               │
│            │                                                   │
│            ▼                                                   │
│   ┌──────────────┐                                             │
│   │ 构建 + 部署  │                                             │
│   └──────┬───────┘                                             │
│          │                                                     │
└──────────┼─────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────┐
│  QA / 预发布环境      │
│                      │
│  ┌──────────┐       │
│  │  IAST    │       │  插桩到应用，功能测试时实时检测
│  └──────────┘       │
│                      │
│  ┌──────────┐       │
│  │  DAST    │       │  模拟攻击扫描
│  └──────────┘       │
└──────────────────────┘
```

### 6.2 GitHub Actions 示例

```yaml
name: Security Scanning

on: [push, pull_request]

jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Semgrep SAST
        run: |
          pip install semgrep
          semgrep --config=auto --error .

  iac-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Checkov IaC Scan
        run: |
          pip install checkov
          checkov -d ./terraform --soft-fail-on LOW,MEDIUM

  container-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Trivy Vulnerability Scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'config'
          severity: 'HIGH,CRITICAL'
          exit-code: '1'
```

### 6.3 安全测试金字塔

```
               ┌─────────────────────┐
               │       DAST           │  少量：预发布前完整攻击扫描
               │     (动态扫描)        │  频率：每周 / 每次大发布前
               ├───────────────────────┤
               │       IAST           │  中等：功能测试时实时分析
               │   (交互式测试)        │  频率：每次运行功能测试
               ├───────────────────────┤
               │       SAST           │  大量：代码提交时实时检测
               │   (静态分析)          │  频率：每次 Push / PR
               ├───────────────────────┤
               │  IaC 安全 + SCA      │  大量：基础设施 + 依赖扫描
               │  (配置 + 依赖检查)    │  频率：每次 Push / PR
               └───────────────────────┘
```

> 💡 **金字塔原则**：修复成本越低的阶段，扫描频率越高。SAST/IaC 在开发阶段天天跑，DAST 在预发布阶段周期跑。

---

## 七、工具选型速查表

| 场景 | 推荐工具 | 理由 |
|------|---------|------|
| Go/Python/JS 项目 SAST | Semgrep | 规则可自定义，CI 集成好 |
| 企业级多语言 SAST | SonarQube + CodeQL | 代码质量+安全一体 |
| 开源 DAST 入门 | OWASP ZAP | 最流行，社区活跃 |
| 高性能模板扫描 | Nuclei | 速度快，YAML 规则 |
| IaC 安全检查 | Checkov + Trivy | Checkov 规则最全，Trivy 多合一 |
| K8s 安全 | Kubescape + Trivy | NSA-CISA 框架 + 漏洞扫描 |
| IAST 方案 | DongTai（开源）/ Contrast（商业） | 视预算和技术栈选择 |
| 全链路一体化 | Snyk / Prisma Cloud | 商业方案，SAST+SCA+IaC+Container |

---

## 八、一句话总结

| 技术 | 一句话 |
|------|--------|
| **SAST** | 看代码找漏洞，最早发现但误报多 |
| **DAST** | 黑盒攻击找漏洞，无需源码但晚了点 |
| **IAST** | 插桩监控，精准定位，实际触发才报 |
| **IaC 安全** | 基础设施即代码也要安全检查，部署前阻断风险配置 |
| **DevSecOps** | 四种扫描串成流水线：代码提交→SAST+IaC→功能测试+IAST→预发布+DAST |

---

## 九、参考资料

1. [OWASP ZAP 官方文档](https://www.zaproxy.org/docs/)
2. [Semgrep 规则仓库](https://semgrep.dev/explore)
3. [Checkov 策略库](https://www.checkov.io/)
4. [Trivy 文档](https://aquasecurity.github.io/trivy/)
5. [DongTai 洞态 IAST](https://github.com/HXSecurity/DongTai)
6. [Nuclei 模板库](https://github.com/projectdiscovery/nuclei-templates)