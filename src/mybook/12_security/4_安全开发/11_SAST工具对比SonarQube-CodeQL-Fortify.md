# SAST 工具对比：SonarQube / CodeQL / Fortify

## 一、三款工具总览

| 维度 | **SonarQube** | **CodeQL** | **Fortify** |
|------|-------------|-----------|------------|
| **开发商** | SonarSource | GitHub（微软） | OpenText（原 Micro Focus） |
| **类型** | 开源/商业 | 开源（MIT） | 商业 |
| **定位** | 代码质量 + 安全 一体化 | 语义级代码分析引擎 | 企业级应用安全测试 |
| **核心思想** | 规则 + 质量门禁 | **代码即数据**（Code as Data） | 多引擎分析（数据流+控制流+语义+结构） |
| **语言支持** | 30+ | 15+ | 27+ |
| **许可证** | Community（免费）+ Enterprise（付费） | MIT（免费） | 商业许可（昂贵） |
| **CI/CD 集成** | 极好 | 原生 GitHub Actions | 好（需额外配置） |
| **特色** | 技术债务管理、质量门禁 | 自定义查询语言（QL）、变体分析 | 规则最全、企业合规报告 |

---

## 二、SonarQube

### 2.1 核心定位

SonarQube 是**代码质量 + 安全**一体化平台，而非纯安全工具。它的独特性在于：

> 不只是找漏洞，还管理**技术债务**、**代码异味**、**重复率**、**覆盖率**——让代码"干净"。

### 2.2 架构

```
┌─────────────────────────────────────────────────────┐
│                 SonarQube Server                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Compute  │  │   Web    │  │  Search  │          │
│  │ Engine   │  │  Server  │  │  Server  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│       │              │              │               │
│       └──────────────┼──────────────┘               │
│                      │                              │
│              ┌───────┴───────┐                      │
│              │  PostgreSQL   │                      │
│              └───────────────┘                      │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   SonarScanner  SonarScanner  SonarScanner
   (Java项目)    (Python项目)   (JS项目)
```

### 2.3 核心概念

| 概念 | 说明 |
|------|------|
| **Quality Gate** | 质量门禁：代码提交必须通过的指标集合 |
| **Quality Profile** | 质量配置：一组规则集合，按语言分类 |
| **Technical Debt** | 技术债务：修复所有问题所需的时间估算 |
| **Code Smell** | 代码异味：维护性问题，不是 Bug 但影响可维护性 |
| **Bug** | 确定性的错误，会导致运行时问题 |
| **Vulnerability** | 安全漏洞，可能被攻击利用 |
| **Hotspot** | 安全热点：需要人工审查的敏感代码段 |

### 2.4 安装与使用

```bash
# Docker 部署（最简方式）
docker run -d --name sonarqube \
  -p 9000:9000 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  sonarqube:lts-community

# 默认登录 admin/admin，首次登录强制修改密码
```

```bash
# 项目扫描：Maven 项目
mvn sonar:sonar \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<token>

# Gradle 项目
./gradlew sonar \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<token>

# 通用 CLI 扫描
sonar-scanner \
  -Dsonar.projectKey=myproject \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<token>
```

### 2.5 Quality Gate 配置示例

```yaml
# sonar-project.properties
sonar.projectKey=myapp
sonar.projectName=My Application
sonar.sources=src
sonar.tests=test
sonar.java.binaries=target/classes
sonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml

# Quality Gate 指标
sonar.qualitygate.conditions=new_bugs=0
sonar.qualitygate.conditions=new_vulnerabilities=0
sonar.qualitygate.conditions=new_code_smells=0
sonar.qualitygate.conditions=new_duplicated_lines_density=3
sonar.qualitygate.conditions=new_coverage=80
```

### 2.6 适用场景

| 场景 | 评价 |
|------|------|
| 代码质量 + 安全一体化管理 | ⭐⭐⭐ 最佳选择 |
| 技术债务可视化管理 | ⭐⭐⭐ 独有功能 |
| 多项目质量看板 | ⭐⭐⭐ 内置 Dashboard |
| 纯安全深度扫描 | ⭐⭐ 有但不如 Fortify 深 |
| 自定义规则 | ⭐⭐ 支持但不如 CodeQL 灵活 |

### 2.7 优点与局限

**优点**：
- 质量 + 安全一体化，一个平台看全部
- 质量门禁机制非常成熟，CI/CD 集成极好
- Community 版免费，门槛低
- 30+ 语言，覆盖面广
- 技术债务量化管理，可向管理层汇报

**局限**：
- 安全规则深度不如 Fortify
- 不提供运行时代理（无 IAST/DAST）
- Enterprise 版较贵
- 不支持自定义查询语言，规则扩展不如 CodeQL

---

## 三、CodeQL

### 3.1 核心定位

CodeQL 是 GitHub 开源（MIT）的**语义级代码分析引擎**，核心思想是：

> **Code as Data（代码即数据）**：把代码编译成关系型数据库，然后用 QL 查询语言像查 SQL 一样查漏洞。

### 3.2 原理架构

```
                    源代码
                      │
                      ▼
              ┌──────────────┐
              │  CodeQL CLI   │
              │  (提取器)      │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │  CodeQL DB    │ ← 代码的关系数据库表示
              │  (AST + CFG   │
              │   + 数据流    │
              │   + 类型信息)  │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │  QL 查询引擎  │
              │  执行 QL 查询 │
              └──────┬───────┘
                     │
                     ▼
              漏洞报告 (SARIF)
```

### 3.3 QL 查询语言

```ql
/**
 * 检测 Java SQL 注入：用户输入直接拼接到 SQL
 */
import java
import semmle.code.java.dataflow.FlowSources
import semmle.code.java.security.QueryInjection

from QueryInjectionSink sink, RemoteFlowSource source
where source.flowsTo(sink)
select sink, "发现 SQL 注入风险：用户输入流向 SQL 执行点"
```

```ql
/**
 * 检测不安全的反序列化
 */
import java
import semmle.code.java.security.UnsafeDeserializationQuery

from UnsafeDeserializationSink sink
where sink.isUnsafe()
select sink, "检测到不安全的反序列化"
```

```ql
/**
 * 检测硬编码密钥
 */
import go

from Literal lit, string secret
where
  lit.getStringValue() = secret and
  secret.regexpMatch("(?i)(api[_-]?key|secret|password|token)\\s*[:=]\\s*['\"]\\w{16,}['\"]")
select lit, "检测到硬编码密钥: " + secret
```

### 3.4 使用流程

```bash
# 1. 安装 CodeQL CLI
gh extensions install github/gh-codeql
gh codeql install

# 2. 创建数据库
codeql database create mydb --language=java --source-root=./src

# 3. 运行标准查询
codeql database analyze mydb \
  --format=sarif-latest \
  --output=results.sarif \
  java-code-scanning.qls

# 4. 运行自定义查询
codeql query run my-custom-query.ql --database=mydb

# 5. 上传到 GitHub（GitHub Actions 原生集成）
- uses: github/codeql-action/init@v3
  with:
    languages: java, python
- uses: github/codeql-action/analyze@v3
```

### 3.5 变体分析（Variant Analysis）

CodeQL 独有的能力：**写一个查询，找出所有同类漏洞的变体**。

```ql
/**
 * 变体分析示例：找出所有类似 Log4Shell 的 JNDI 注入点
 */
import java

from MethodAccess ma, Expr userInput
where
  ma.getMethod().hasName("lookup") and
  ma.getMethod().getDeclaringType().hasQualifiedName("javax.naming", "InitialContext") and
  userInput.flowsTo(ma.getAnArgument())  // 污点数据流向 lookup 参数
select ma, "发现 JNDI 注入风险（类似 Log4Shell）"
```

**实用价值**：发现一个漏洞模式后，可以一次性找出整个代码库中所有同类问题。

### 3.6 适用场景

| 场景 | 评价 |
|------|------|
| 深度变体分析 | ⭐⭐⭐ 独有，无可替代 |
| 自定义安全规则 | ⭐⭐⭐ QL 查询语言，图灵完备 |
| GitHub 原生 CI/CD 集成 | ⭐⭐⭐ 与 Actions 无缝集成 |
| CVE 研究（找 0-day） | ⭐⭐⭐ 业界标准工具 |
| 代码质量（非安全） | ⭐ 不是主要能力 |
| 开箱即用 | ⭐⭐ 需要学习 QL 语言 |

### 3.7 优点与局限

**优点**：
- QL 查询语言极度灵活，图灵完备，可以表达任意复杂的漏洞模式
- 变体分析能力独一无二
- 开源 MIT，完全免费
- 与 GitHub Actions 深度集成，原生支持
- CVE 安全研究首选工具，业界认可度极高

**局限**：
- 学习曲线陡峭，QL 语言需要专门学习
- 语言支持较少（15+），不如 SonarQube/Fortify
- 只有 CLI/IDE 插件，无 Web 管理面板
- 属于纯 SAST，无 DAST/IAST/代码质量
- 扫描速度较慢（需要先构建数据库）

---

## 四、Fortify Static Code Analyzer（SCA）

### 4.1 核心定位

Fortify 是**企业级应用安全测试**的标杆，属于 OpenText 旗下（原 Micro Focus/HPE）。在金融、政府、军工等行业是合规审计的标配。

### 4.2 五大分析引擎

Fortify 与其他工具的最大区别：**不是单一引擎，而是五个分析引擎协同工作**。

```
┌─────────────────────────────────────────────────────┐
│                Fortify SCA 多引擎架构                   │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ 数据流    │  │ 控制流    │  │ 语义分析  │           │
│  │ 引擎      │  │ 引擎      │  │ 引擎      │           │
│  │(污点追踪)│  │(路径覆盖)│  │(类型推导)│           │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘           │
│        │             │             │                 │
│  ┌─────┴────┐  ┌─────┴────┐                          │
│  │ 结构分析  │  │ 配置引擎  │                          │
│  │ 引擎      │  │(框架/配置)│                          │
│  │(AST/调用)│  │          │                          │
│  └──────────┘  └──────────┘                          │
│                                                       │
│      五引擎协同 → 一条数据流可被多引擎验证               │
│            → 误报率大幅降低                            │
└─────────────────────────────────────────────────────┘
```

### 4.3 使用流程

```bash
# 1. 翻译阶段：将源码转成 Fortify 中间表示（NST）
sourceanalyzer -b myapp -clean
sourceanalyzer -b myapp "src/**/*.java" "src/**/*.xml"

# 2. 扫描阶段：应用安全规则
sourceanalyzer -b myapp -scan -f results.fpr

# 3. 生成报告
ReportGenerator -format pdf -f myapp-report.pdf -source results.fpr

# 4. CI 集成（Jenkins/GitHub Actions）
sourceanalyzer -b myapp -scan -format fpr -f results.fpr \
  -build-project "MyApp" -build-version "${GITHUB_SHA:0:7}"
```

### 4.4 Fortify 安全规则库

| 类别 | 规则数量 | 示例 |
|------|---------|------|
| OWASP Top 10 | 全覆盖 | SQL 注入、XSS、CSRF、SSRF |
| CWE Top 25 | 全覆盖 | 缓冲区溢出、路径遍历、命令注入 |
| PCI-DSS | 合规规则 | 加密不足、日志泄露、认证绕过 |
| HIPAA | 医疗合规 | 患者数据保护 |
| GDPR | 隐私合规 | 个人数据泄露 |
| 自定义规则 | 支持 | 基于 Rulepack SDK 扩展 |

**Fortify 安全分类体系（Fortify Taxonomy）**：

```
Fortify 分类
├── Input Validation and Representation（输入验证）
│   ├── Cross-Site Scripting（XSS）
│   ├── SQL Injection
│   ├── Command Injection
│   └── Path Manipulation
├── API Abuse（API 滥用）
│   ├── Dangerous Function
│   └── Directory Restriction
├── Security Features（安全特性）
│   ├── Insecure Randomness
│   ├── Weak Encryption
│   └── Password Management
├── Time and State（时间与状态）
│   ├── Race Condition
│   └── Deadlock
├── Errors（错误处理）
│   ├── Empty Catch Block
│   └── Overly Broad Catch
├── Code Quality（代码质量）
│   ├── Null Dereference
│   └── Resource Leak
└── Encapsulation（封装）
    ├── System Information Leak
    └── Trust Boundary Violation
```

### 4.5 与 Fortify 生态联动

```
┌────────────────────────────────────────────────┐
│              Fortify 应用安全平台                 │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  SCA     │  │ WebInspect│  │ Software │      │
│  │ 静态分析  │  │ 动态分析  │  │ Security │      │
│  │          │  │ (DAST)   │  │ Center   │      │
│  └────┬─────┘  └────┬─────┘  │ 集中管理  │      │
│       │             │        └────┬─────┘      │
│       └──────┬──────┘             │            │
│              ▼                    ▼            │
│       ┌─────────────────────────────────┐      │
│       │     Fortify Scan Machine         │      │
│       │  (SAST + DAST 一体化扫描)        │      │
│       └─────────────────────────────────┘      │
└────────────────────────────────────────────────┘
```

### 4.6 适用场景

| 场景 | 评价 |
|------|------|
| 金融/政府/军工等强合规行业 | ⭐⭐⭐ 行业标准 |
| 多引擎深度安全分析 | ⭐⭐⭐ 独有 |
| 合规审计报告 | ⭐⭐⭐ 内置 OWASP/CWE/PCI-DSS 报告 |
| 开源/免费使用 | ⭐ 纯商业，价格昂贵 |
| 日常开发快速反馈 | ⭐⭐ 扫描较慢 |
| 代码质量（非安全） | ⭐⭐ 有但不是强项 |

### 4.7 优点与局限

**优点**：
- 五大引擎协同，误报率最低
- 规则库最全最成熟，20+ 年积累
- 合规报告最完善（OWASP/PCI-DSS/HIPAA/GDPR）
- 企业级支持，SLA 保障
- 与 WebInspect DAST 联动，SAST+DAST 一体化

**局限**：
- **价格昂贵**（通常在 10 万-50 万美元/年级别）
- 扫描速度较慢（翻译 + 扫描两步走）
- 部署复杂，需要硬件资源
- 不开源，社区支持有限
- 更新周期较长（商业软件节奏）

---

## 五、三款工具深度对比

### 5.1 核心维度对比

| 维度 | **SonarQube** | **CodeQL** | **Fortify** |
|------|-------------|-----------|------------|
| **分析深度** | 中（模式匹配 + 数据流） | 深（语义级 + 查询语言） | 最深（五引擎协同） |
| **误报率** | 中高 | 中 | **最低** |
| **漏报率** | 中 | 低 | 低 |
| **规则数量** | 3000+ | 200+ 套查询 | 1000+ 规则分类 |
| **自定义规则** | 支持（XML/Java 插件） | **极强**（QL 查询语言） | 支持（Rulepack SDK） |
| **扫描速度** | 快 | 中（需建数据库） | 慢（翻译+扫描） |
| **学习曲线** | 低 | **高**（需学 QL 语言） | 中 |
| **价格** | 免费（Community） | **免费（MIT）** | 昂贵 |
| **Web 管理面板** | ⭐⭐⭐ | ⭐（无） | ⭐⭐（Software Security Center） |
| **代码质量** | ⭐⭐⭐ | ⭐ | ⭐⭐ |
| **安全深度** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **变体分析** | ⭐ | ⭐⭐⭐ | ⭐⭐ |
| **合规报告** | ⭐⭐ | ⭐ | ⭐⭐⭐ |

### 5.2 分析能力对比

```
安全分析深度
     │
     │                              Fortify ████████████
     │                              (五引擎协同)
     │
     │                   CodeQL ██████████
     │                   (语义级 + QL查询)
     │
     │        SonarQube ████████
     │        (模式匹配 + 数据流)
     │
     └──────────────────────────────────────────▶
               代码质量覆盖广度

    代码质量广度
     │
     │  SonarQube ████████████████████████
     │  (技术债务 + 异味 + 覆盖率 + 重复率)
     │
     │  Fortify ████████
     │  (代码质量规则)
     │
     │  CodeQL ████
     │  (基础质量)
     │
     └──────────────────────────────────────────▶
```

### 5.3 综合评价

| 工具 | 最佳场景 | 一句话 |
|------|---------|--------|
| **SonarQube** | 日常开发，代码质量 + 安全一体化 | 让代码"干净"，技术债务可见 |
| **CodeQL** | 安全研究，深度定制，变体分析 | 把代码当数据库查，灵活度无上限 |
| **Fortify** | 企业合规，金融/政府，深度安全 | 规则最全，合规定制，贵但值 |

---

## 六、工具组合推荐

### 6.1 开源 / 中小企业方案

```
SonarQube Community（代码质量 + 基础安全）
    +
CodeQL（深度安全分析 + 变体分析）
    +
Trivy（SCA + IaC + 容器）

总成本：$0（全部开源免费）
```

### 6.2 企业级完整方案

```
SonarQube Enterprise（代码质量 + 安全 + 多项目看板）
    +
CodeQL（变体分析 + 安全研究）
    +
Fortify SCA（深度安全 + 合规报告）

总成本：$50k-$200k/年（Fortify 许可占大头）
```

### 6.3 按需求选型决策树

```
需要代码质量 + 技术债务管理？
    ├── 是 → 必选 SonarQube
    │
    └── 只关注安全？
         │
         ├── 预算充足，需要合规报告？
         │   └── 是 → 选 Fortify（金融/政府首选）
         │
         ├── 需要深度定制、变体分析？
         │   └── 是 → 选 CodeQL（安全研究首选）
         │
         └── 预算有限，快速上手？
             └── 是 → SonarQube Community + Semgrep
```

---

## 七、CI/CD 集成示例

### 7.1 SonarQube (GitHub Actions)

```yaml
- name: SonarQube Scan
  uses: SonarSource/sonarqube-scan-action@v2
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

### 7.2 CodeQL (GitHub Actions — 原生)

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: java, python, javascript
- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v3
```

### 7.3 Fortify (GitHub Actions)

```yaml
- name: Fortify Scan
  run: |
    sourceanalyzer -b myapp -clean
    sourceanalyzer -b myapp "src/**/*.java"
    sourceanalyzer -b myapp -scan -f results.fpr
- name: Upload Fortify Results
  uses: actions/upload-artifact@v4
  with:
    name: fortify-results
    path: results.fpr
```

---

## 八、一句话总结

| 工具 | 一句话 |
|------|--------|
| **SonarQube** | 代码质量管家，让技术债务可视化，开发团队日常必备 |
| **CodeQL** | 把代码变成数据库，写 SQL 一样查漏洞，安全研究员的瑞士军刀 |
| **Fortify** | 企业合规的保险柜，金融/政府的标配，贵但省心 |

---

## 九、参考资料

1. [SonarQube 官方文档](https://docs.sonarsource.com/sonarqube/latest/)
2. [CodeQL 官方文档](https://codeql.github.com/docs/)
3. [CodeQL QL 语言参考](https://codeql.github.com/docs/ql-language-reference/)
4. [Fortify Static Code Analyzer](https://www.microfocus.com/en-us/cyberres/application-security/static-code-analyzer)
5. [GitHub Code Scanning](https://docs.github.com/en/code-security/code-scanning)