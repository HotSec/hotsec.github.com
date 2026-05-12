# ProjectDiscovery 组织项目全览与深度分析

> 组织地址：https://github.com/projectdiscovery
> 统计时间：2026-05-10
> 仓库总数：120 个

---

## 一、组织概述

ProjectDiscovery 是一个专注于**网络安全侦察（Reconnaissance）和漏洞检测**的开源组织，其工具链覆盖了从资产发现、端口扫描、漏洞检测到结果通知的完整安全测试工作流。所有核心工具均使用 Go 语言编写，具有高性能、易扩展、管道化协作的特点。

### 核心理念

1. **管道化设计**：所有工具支持 stdin/stdout 管道，可像 Unix 哲学一样自由组合
2. **模板驱动**：nuclei 的 YAML DSL 模板系统使漏洞检测规则可社区化协作
3. **被动侦察优先**：尽可能使用被动数据源（OSINT），减少对目标的直接交互
4. **模块化架构**：公共能力抽取为独立 Go 库，各工具复用统一基础设施

---

## 二、整体架构

### 2.1 分层架构图

```
┌──────────────────────────────────────────────────────────────────────┐
│                         应用层 (CLI Tools)                           │
│                                                                      │
│  ┌─────────┐ ┌─────────┐ ┌───────────┐ ┌───────┐ ┌───────┐        │
│  │ nuclei  │ │ katana  │ │ subfinder  │ │ httpx │ │ naabu │        │
│  └─────────┘ └─────────┘ └───────────┘ └───────┘ └───────┘        │
│  ┌───────────┐ ┌─────────┐ ┌──────┐ ┌────────┐ ┌────────┐         │
│  │interactsh │ │ proxify │ │uncover│ │  dnsx  │ │  tlsx  │         │
│  └───────────┘ └─────────┘ └──────┘ └────────┘ └────────┘         │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ vulnx │ │notify │ │mapcidr│ │cdncheck│ │alterx  │ │asnmap  │  │
│  └───────┘ └───────┘ └───────┘ └────────┘ └────────┘ └────────┘  │
│  ┌──────────┐ ┌───────────┐ ┌──────┐ ┌────────┐ ┌──────────┐     │
│  │cloudlist │ │urlfinder  │ │ pdtm │ │  aix   │ │tldfinder │     │
│  └──────────┘ └───────────┘ └──────┘ └────────┘ └──────────┘     │
├──────────────────────────────────────────────────────────────────────┤
│                        工具库层 (Libraries)                          │
│                                                                      │
│  ┌──────────────────┐ ┌───────────────┐ ┌────────────────────┐     │
│  │retryablehttp-go  │ │retryabledns   │ │      dsl           │     │
│  └──────────────────┘ └───────────────┘ └────────────────────┘     │
│  ┌──────────────────┐ ┌───────────────┐ ┌────────────────────┐     │
│  │   fastdialer     │ │    hmap       │ │   ratelimit        │     │
│  └──────────────────┘ └───────────────┘ └────────────────────┘     │
│  ┌──────────────────┐ ┌───────────────┐ ┌────────────────────┐     │
│  │   goflags        │ │  gologger     │ │    mapcidr         │     │
│  └──────────────────┘ └───────────────┘ └────────────────────┘     │
│  ┌──────────────────┐ ┌───────────────┐ ┌────────────────────┐     │
│  │  wappalyzergo    │ │    tlsx       │ │    cdncheck        │     │
│  └──────────────────┘ └───────────────┘ └────────────────────┘     │
│  ┌──────────────────┐ ┌───────────────┐ ┌────────────────────┐     │
│  │    asnmap        │ │  useragent    │ │   networkpolicy    │     │
│  └──────────────────┘ └───────────────┘ └────────────────────┘     │
├──────────────────────────────────────────────────────────────────────┤
│                        基础库层 (Foundation)                         │
│                                                                      │
│  ┌──────┐ ┌──────────┐ ┌────────┐ ┌──────────┐ ┌──────────────┐   │
│  │utils │ │blackrock │ │ipranger│ │  fdmax   │ │  freeport    │   │
│  └──────┘ └──────────┘ └────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │
│  │machineid │ │ gostruct │ │  gozero  │ │ clistats │ │goconfig │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │
│  │  gcache  │ │  sarif   │ │  nvd     │ │roundrobin│ │sslcert  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│                        服务器/协议库层                                │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │
│  │ tinydns  │ │ldapserver│ │ go-smb2  │ │   smb    │ │martian  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                            │
│  │ rawhttp  │ │cleanhttp │ │   n3iwf  │                            │
│  └──────────┘ └──────────┘ └──────────┘                            │
├──────────────────────────────────────────────────────────────────────┤
│                        模板与数据资源层                               │
│                                                                      │
│  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────┐  │
│  │ nuclei-templates │ │nuclei-templates-ai│ │nuclei-templates-labs│ │
│  └──────────────────┘ └──────────────────┘ └────────────────────┘  │
│  ┌──────────────────────────┐ ┌──────────────────────────────┐     │
│  │public-bugbounty-programs │ │  awesome-search-queries      │     │
│  └──────────────────────────┘ └──────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 工具链数据流架构

```
                        ┌─────────────┐
                        │  目标域名    │
                        └──────┬──────┘
                               │
                    ┌──────────▼──────────┐
                    │     subfinder       │  被动子域名枚举
                    │  (40+ OSINT 数据源)  │
                    └──────────┬──────────┘
                               │ 子域名列表
                    ┌──────────▼──────────┐
                    │       dnsx          │  DNS 解析 + 过滤
                    │  (A/CNAME/通配符)    │
                    └──────────┬──────────┘
                               │ IP + 域名
                    ┌──────────▼──────────┐
                    │       naabu         │  端口扫描
                    │  (SYN/CONNECT/UDP)   │
                    └──────────┬──────────┘
                               │ 开放端口
                    ┌──────────▼──────────┐
                    │       httpx         │  HTTP 多维探测
                    │  (技术栈/TLS/截图)   │
                    └──────────┬──────────┘
                               │ 存活 URL
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼─────────┐ ┌───▼───────────┐ ┌──▼──────────────┐
    │      nuclei       │ │    katana     │ │    uncover      │
    │  (漏洞扫描引擎)    │ │  (爬虫框架)   │ │ (搜索引擎发现)   │
    │  YAML DSL 模板    │ │  标准+Headless│ │  Censys/Shodan  │
    └─────────┬─────────┘ └───┬───────────┘ └──┬──────────────┘
              │               │                │
              └───────────────┼────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │      notify        │  多平台通知
                    │  (Slack/Telegram/  │
                    │   Discord/邮件)    │
                    └────────────────────┘

  ┌──────────────────────────────────────────────────────────────┐
  │                    辅助工具（并行使用）                         │
  │                                                              │
  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
  │  │interactsh│  │ proxify  │  │ cloudlist│  │  mapcidr │   │
  │  │OOB 交互  │  │流量代理  │  │云资产列举│  │CIDR 操作 │   │
  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
  │  │  tlsx    │  │ cdncheck │  │  asnmap  │  │  alterx  │   │
  │  │TLS 采集  │  │CDN 检测  │  │ASN 映射  │  │字典生成  │   │
  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
  └──────────────────────────────────────────────────────────────┘
```

---

## 三、项目分类总览

### 3.1 核心安全工具（Go CLI）

| 序号 | 项目 | Stars | 主要功能 |
|------|------|-------|----------|
| 1 | nuclei | 28k | 基于 YAML DSL 的快速漏洞扫描器 |
| 2 | katana | 17k | 下一代爬虫/蜘蛛框架 |
| 3 | subfinder | 14k | 被动子域名枚举工具 |
| 4 | httpx | 9.9k | 多功能 HTTP 探测工具包 |
| 5 | naabu | 5.9k | 快速端口扫描器 |
| 6 | interactsh | 4.3k | OOB（带外）交互收集服务器/客户端 |
| 7 | proxify | 3k | HTTP/HTTPS 流量捕获与重放代理 |
| 8 | uncover | 2.9k | 多搜索引擎暴露主机发现 |
| 9 | dnsx | 2.7k | 多功能 DNS 工具包 |
| 10 | vulnx | 2.5k | 漏洞数据探索 CLI |
| 11 | shuffledns | 1.6k | MassDNS 封装（子域爆破+解析） |
| 12 | notify | 1.6k | 多平台通知推送工具 |
| 13 | mapcidr | 1.2k | CIDR/子网操作工具 |
| 14 | pdtm | 1.1k | ProjectDiscovery 工具管理器 |
| 15 | tlsx | 1.1k | TLS 数据采集工具 |
| 16 | asnmap | 1k | ASN 网络范围映射 |
| 17 | cloudlist | 1k | 多云资产列举 |
| 18 | wappalyzergo | 1k | Wappalyzer 技术检测 Go 实现 |
| 19 | cdncheck | 963 | CDN/WAF/云技术检测 |
| 20 | alterx | 950 | DSL 驱动的子域字典生成器 |
| 21 | urlfinder | 866 | 被动 URL 发现工具 |
| 22 | chaos-client | 853 | Chaos DB API 客户端 |
| 23 | tldfinder | 321 | 私有 TLD 发现工具 |
| 24 | aix | 313 | LLM API 交互 CLI |
| 25 | openrisk | 180 | 基于 Nuclei 扫描结果的风险评分 |
| 26 | rawhttp | 167 | 原始 HTTP 客户端 |
| 27 | simplehttpserver | 537 | Go 版 SimpleHTTPServer |
| 28 | tunnelx | 69 | SOCKS5 隧道代理工具 |

### 3.2 自研 Go 基础库

| 序号 | 项目 | Stars | 功能 |
|------|------|-------|------|
| 1 | retryablehttp-go | 152 | 带自动重试和指数退避的 HTTP 客户端 |
| 2 | utils | 138 | 通用工具函数库（合并了多个子库） |
| 3 | retryabledns | 134 | 带重试的 DNS 客户端 |
| 4 | dsl | 119 | DSL 表达式引擎 |
| 5 | useragent | 116 | 分类 User-Agent 列表库 |
| 6 | gologger | 97 | 分级日志库 |
| 7 | goflags | 93 | Go flag 包装器（支持多种配置源） |
| 8 | fastdialer | 71 | 带 DNS 缓存的拨号器 |
| 9 | ipranger | 69 | IP/FQDN 数据结构（随机化端口主机） |
| 10 | ratelimit | 65 | 阻塞式限速实现 |
| 11 | hmap | 62 | 混合内存/磁盘 Map |
| 12 | tinydns | 59 | 可嵌入 DNS 服务器 |
| 13 | blackrock | 37 | 基于 masscan 的 Blackrock 密码 |
| 14 | networkpolicy | 30 | 网络策略辅助 |
| 15 | nvd | 29 | NVD CVE 数据获取库 |
| 16 | freeport | 28 | 获取空闲端口 |
| 17 | clistats | 25 | 命令行统计显示 |
| 18 | gozero | 25 | 零依赖 Go 运行时（实验性） |
| 19 | fdmax | 24 | 自动提升文件描述符限制 |
| 20 | yamldoc-go | 24 | YAML 文档生成器 |
| 21 | machineid | 22 | 获取机器唯一 ID |
| 22 | network-fingerprint | 80 | Nuclei 网络模板指纹生成 |
| 23 | collaborator | 25 | BurpSuite Collaborator 库 |
| 24 | roundrobin | 15 | 可配置轮转策略的 Round Robin |
| 25 | sslcert | 14 | SSL 证书生成 |
| 26 | sarif | 14 | SARIF 格式导出 |
| 27 | smb | 13 | SMB 协议库 |
| 28 | goconfig | 9 | 跨运行配置保存/恢复 |
| 29 | gostruct | 8 | 类 Python struct 二进制数据解释 |
| 30 | ldapserver | 7 | LDAP 服务器实现 |
| 31 | go-smb2 | 7 | SMB2/3 客户端库 |
| 32 | martian | 10 | HTTP/S 代理构建库 |
| 33 | cleanhttp | 3 | 通配符 HTTP 服务器检测与过滤 |
| 34 | fasttemplate | 5 | 简单快速模板引擎 |
| 35 | gcache | 5 | 内存缓存库（LRU/LFU/ARC） |
| 36 | govaluate | 0 | Go 表达式求值（fork 自 Knetic） |
| 37 | n3iwf | 3 | 5G N3IWF 实现 |
| 38 | rdap | 3 | RDAP 命令行客户端 |
| 39 | asyncsqs | 5 | 异步 SQS 缓冲客户端 |

### 3.3 模板与数据资源

| 项目 | Stars | 说明 |
|------|-------|------|
| nuclei-templates | 12k | 社区维护的 Nuclei 漏洞检测模板（8000+ 模板） |
| nuclei-templates-ai | 120 | AI 生成的 CVE 检测模板 |
| nuclei-templates-labs | 128 | 漏洞环境+配套模板（学习用） |
| fuzzing-templates | 91 | 模糊测试模板（已归档） |
| public-bugbounty-programs | 1.3k | 公开 Bug Bounty 项目列表 |
| awesome-search-queries | 382 | 多搜索引擎查询语句集合 |
| templates-stats | 10 | 模板元数据提取工具 |

### 3.4 集成与插件

| 项目 | Stars | 说明 |
|------|-------|------|
| nuclei-burp-plugin | 1.3k | BurpSuite Nuclei 插件（Java） |
| nuclei-ai-extension | 552 | 浏览器扩展-快速模板生成（已归档） |
| nuclei-action | 284 | GitHub Action 集成 |
| interactsh-web | 241 | Interactsh Web 仪表盘（TypeScript） |
| pd-actions | 203 | 持续侦察 GitHub Actions |
| naabu-action | 21 | 端口扫描 GitHub Action |
| subfinder-action | 20 | 子域名枚举 GitHub Action |
| httpx-action | 13 | HTTP 探测 GitHub Action |
| notify-action | 18 | 通知推送 GitHub Action |
| dnsx-action | 14 | DNS 查询 GitHub Action |
| cloudlist-action | 10 | 云资产列举 GitHub Action |
| nuclei-plugin | 5 | IDE 插件（Java） |

### 3.5 文档与其他

| 项目 | Stars | 说明 |
|------|-------|------|
| docs | 24 | 集中化文档站（MDX） |
| nuclei-docs | 86 | Nuclei 旧文档（已归档） |
| wallpapers | 34 | 壁纸集合 |
| research | 4 | 安全研究 |
| defcon32 | 11 | DEFCON 32 工作坊资料 |
| oss-bounty-program | 4 | 开源赏金计划 |
| php-app-race-condition | 22 | 竞态条件漏洞演示（PHP） |
| .github | 7 | 组织健康文件 |
| actions | 6 | 组合 Actions |
| pd-agent | 8 | ProjectDiscovery Cloud Agent |

### 3.6 已归档的子库（已合并至 utils）

| 项目 | 原功能 |
|------|--------|
| dnsprobe | DNS 查询工具 → 被 dnsx 替代 |
| mapsutil | Map 辅助函数 → 合并至 utils |
| httputil | HTTP 辅助函数 → 合并至 utils |
| sliceutil | Slice 辅助函数 → 合并至 utils |
| reflectutil | 反射辅助 → 合并至 utils |
| fileutil | 文件辅助 → 合并至 utils |
| iputil | IP 辅助 → 合并至 utils |
| stringsutil | 字符串辅助 → 合并至 utils |
| executil | 执行辅助 → 合并至 utils |
| urlutil | URL 辅助 → 合并至 utils |
| folderutil | 文件夹辅助 → 合并至 utils |
| cryptoutil | 加密辅助 → 已归档 |
| resolvercache-go | DNS 响应缓存 → 已归档 |
| expirablelru | TTL LRU 缓存 → 已归档 |
| filekv | 文件 KV 存储 → 已归档 |
| eslint-config | ESLint 配置 → 已归档 |
| js-yaml-source-map | YAML Source Map → 已归档 |
| nuclei-templates-test | 模板测试 → 已归档 |

---

## 四、核心工具详细分析

### 4.1 nuclei — 漏洞扫描器 ⭐ 28k

**主要功能**：基于 YAML DSL 模板的快速可定制漏洞扫描器，通过模拟真实攻击步骤验证漏洞，实现零误报。

**详细功能列表**：
- **模板系统**：YAML 格式定义漏洞检测规则，支持请求定义、匹配器、提取器
- **多协议支持**：HTTP（含 headless）、TCP、DNS、SSL/TLS、WebSocket、WHOIS、JavaScript、Code
- **工作流编排**：条件式工作流，模板间可依赖执行
- **Headless 浏览器**：go-rod 驱动无头浏览器进行动态页面检测
- **AI 模板生成**：通过 `-ai` 标志使用 AI 自动生成模板
- **请求聚类**：自动合并相似请求减少冗余
- **OOB 检测**：集成 interactsh 进行带外漏洞检测
- **代码执行模板**：支持 Go 代码作为检测协议
- **多输入格式**：支持 list、burp、jsonl、yaml、openapi、swagger
- **CI/CD 集成**：GitHub Action、SARIF 输出
- **多输出格式**：JSON、JSONL、Markdown、SARIF、报告数据库
- **数据库协议**：MySQL、PostgreSQL、SQLite、MSSQL、Oracle、MongoDB、Redis
- **云存储**：AWS S3、Azure Blob
- **认证协议**：Kerberos、NTLM、LDAP、SMB2/3
- **自动更新**：模板和引擎均支持自动更新
- **签名验证**：模板签名机制防止篡改

**核心原理**：
1. **模板编译**：YAML 模板 → 解析为内部协议请求对象 → 编译匹配器和提取器
2. **请求聚类**：相同目标的多个模板请求自动合并，减少重复请求
3. **并发调度**：`sizedwaitgroup` 控制模板级并发，`ratelimit` 控制请求级速率
4. **DSL 引擎**：基于 govaluate 扩展的表达式引擎，内置 100+ 安全领域辅助函数
5. **匹配器链**：支持 AND/OR 组合的多条件匹配，支持 word、regex、binary、dsl、status 多种匹配类型
6. **提取器**：支持 regex、kval、xpath、json、dsl 多种提取方式
7. **工作流引擎**：有向无环图（DAG）编排模板执行顺序，条件分支

**关键 Go 库依赖**：
| 库 | 用途 |
|----|------|
| `projectdiscovery/retryablehttp-go` | 带重试的 HTTP 客户端 |
| `projectdiscovery/rawhttp` | 原始 HTTP 请求（绕过标准库限制） |
| `projectdiscovery/fastdialer` | 带 DNS 缓存的拨号器 |
| `projectdiscovery/retryabledns` | DNS 查询与重试 |
| `projectdiscovery/interactsh` | OOB 交互检测 |
| `projectdiscovery/dsl` | DSL 表达式引擎 |
| `projectdiscovery/hmap` | 混合内存/磁盘 Map |
| `projectdiscovery/ratelimit` | 请求限速 |
| `projectdiscovery/tlsx` | TLS 数据采集 |
| `projectdiscovery/wappalyzergo` | Web 技术指纹识别 |
| `projectdiscovery/mapcidr` | CIDR 处理 |
| `projectdiscovery/networkpolicy` | 网络策略控制 |
| `projectdiscovery/useragent` | User-Agent 管理 |
| `projectdiscovery/goflags` | 命令行参数解析 |
| `projectdiscovery/gologger` | 分级日志 |
| `projectdiscovery/utils` | 通用工具函数 |
| `projectdiscovery/gostruct` | 二进制数据解析 |
| `projectdiscovery/gozero` | 零依赖运行时 |
| `projectdiscovery/gcache` | 缓存库 |
| `projectdiscovery/sarif` | SARIF 报告输出 |
| `projectdiscovery/go-smb2` | SMB2/3 协议 |
| `projectdiscovery/rdap` | RDAP 查询 |
| `go-rod/rod` | 无头浏览器驱动 |
| `miekg/dns` | DNS 协议库 |
| `Knetic/govaluate` | 表达式求值 |
| `antchfx/htmlquery` | HTML XPath 查询 |
| `antchfx/xmlquery` | XML XPath 查询 |
| `itchyny/gojq` | jq JSON 处理器 |
| `syndtr/goleveldb` | LevelDB 键值存储 |
| `valyala/fasttemplate` | 快速模板引擎 |
| `go-git/go-git/v5` | Git 操作 |
| `go-ldap/ldap/v3` | LDAP 协议 |
| `go-sql-driver/mysql` | MySQL 驱动 |
| `lib/pq` | PostgreSQL 驱动 |
| `mattn/go-sqlite3` | SQLite 驱动 |
| `microsoft/go-mssqldb` | MSSQL 驱动 |
| `redis/go-redis/v9` | Redis 客户端 |
| `go-pg/pg/v10` | PostgreSQL ORM |
| `sijms/go-ora/v2` | Oracle 驱动 |
| `go-mongodb/mongo-driver` | MongoDB 驱动 |
| `aws/aws-sdk-go-v2` | AWS S3 操作 |
| `Azure/azure-sdk-for-go` | Azure Blob 操作 |
| `labstack/echo/v4` | HTTP 服务器框架 |
| `jcmturner/gokrb5/v8` | Kerberos 认证 |
| `praetorian-inc/fingerprintx` | 服务指纹识别 |
| `zmap/zcrypto` | 密码学扩展库 |
| `weppos/publicsuffix-go` | 公共后缀列表 |
| `json-iterator/go` | 高性能 JSON |
| `remeh/sizedwaitgroup` | 限大小等待组 |

---

### 4.2 katana — 爬虫框架 ⭐ 17k

**主要功能**：下一代爬虫/蜘蛛框架，支持标准 HTTP 爬取和 Headless 浏览器渲染爬取，专注于自动化管道中的高效执行。

**详细功能列表**：
- **双模式爬取**：标准模式（纯 HTTP 请求解析）和 Headless 模式（go-rod 驱动浏览器）
- **JavaScript 解析**：使用 jsluice 从 JavaScript 中提取 URL 和 API 端点
- **自动表单填充**：Headless 模式下自动识别并填充表单（实验性）
- **XHR 提取**：Headless 模式下提取 XHR 请求的 URL 和方法
- **范围控制**：domain 过滤、正则匹配、深度限制、域名页面数限制
- **爬取策略**：支持深度优先（DFS）和广度优先（BFS）
- **已知文件爬取**：自动爬取 robots.txt、sitemap.xml
- **技术检测**：集成 wappalyzergo 识别 Web 技术栈
- **知识库分类**：对爬取结果进行知识库分类
- **相似 URL 过滤**：基于路径参数模式识别过滤相似 URL（如 /users/123 和 /users/456）
- **验证码解决**：集成 capsolver 等验证码解决服务
- **自定义输出字段**：url、path、fqdn、rdn、qurl、file、key、value 等
- **DSL 过滤**：基于 DSL 表达式匹配/过滤响应
- **页面类型检测**：error、captcha、parked 页面识别
- **TLS 指纹伪装**：实验性 JA3 随机化

**核心原理**：
1. **标准模式**：HTTP 请求 → 响应体解析（HTML DOM + JS 静态分析）→ URL 提取 → 去重 → 入队
2. **Headless 模式**：浏览器导航 → DOM 渲染完成 → 提取渲染后 URL + XHR 请求 → 与标准模式结果合并
3. **JS 解析**：jsluice 对 JavaScript 文件进行 AST 级别分析，提取 API 端点、字符串常量
4. **去重机制**：simhash 计算页面相似度 + LRU 缓存 URL 去重 + 路径参数模式识别
5. **图结构**：dominikbraun/graph 维护页面链接关系有向图
6. **范围控制**：多层过滤（field-scope → crawl-scope → match-regex → extension-filter）

**关键 Go 库依赖**：
| 库 | 用途 |
|----|------|
| `go-rod/rod` | 无头浏览器驱动 |
| `Mzack9999/jsluice` | JavaScript URL 提取 |
| `PuerkitoBio/goquery` | HTML DOM 解析 |
| `dominikbraun/graph` | 图数据结构 |
| `projectdiscovery/retryablehttp-go` | HTTP 请求 |
| `projectdiscovery/dsl` | DSL 过滤表达式 |
| `projectdiscovery/wappalyzergo` | 技术指纹识别 |
| `projectdiscovery/fastdialer` | DNS 缓存拨号 |
| `projectdiscovery/ratelimit` | 请求限速 |
| `projectdiscovery/hmap` | 混合存储 |
| `projectdiscovery/goflags` | 命令行参数 |
| `projectdiscovery/gologger` | 日志 |
| `projectdiscovery/utils` | 通用工具 |
| `projectdiscovery/networkpolicy` | 网络策略 |
| `mfonda/simhash` | SimHash 去重 |
| `hashicorp/golang-lru/v2` | LRU 缓存 |
| `valyala/fasttemplate` | 模板引擎 |
| `json-iterator/go` | 高性能 JSON |
| `remeh/sizedwaitgroup` | 并发控制 |

---

### 4.3 subfinder — 子域名枚举 ⭐ 14k

**主要功能**：被动子域名发现工具，通过聚合 40+ 数据源（API）获取子域名信息，专为被动枚举设计，不做主动探测。

**详细功能列表**：
- **被动枚举**：仅查询第三方数据源，不直接与目标交互
- **40+ 数据源聚合**：Chaos、SecurityTrails、Shodan、Censys、VirusTotal、crt.sh、GitHub 等
- **API Key 管理**：统一的 provider-config.yaml 配置管理
- **递归枚举**：可选仅使用支持递归子域的数据源
- **DNS 解析**：可选主动解析验证子域名存活状态
- **IP 输出**：可选在输出中包含解析后的 IP 地址
- **来源追踪**：可选在 JSON 输出中包含每个子域的数据来源
- **多输出格式**：标准输出、文件、JSON
- **管道兼容**：stdin/stdout 无缝管道化
- **速率控制**：全局和按数据源的速率限制
- **代理支持**：HTTP 代理配置
- **环境变量**：SUBFINDER_CONFIG、SUBFINDER_PROVIDER_CONFIG 自定义路径

**核心原理**：
1. **数据源抽象**：每个数据源实现 `Source` 接口（`Run` 方法），统一调度
2. **并发查询**：所有数据源并发查询，结果通过 channel 聚合
3. **去重**：基于 hmap 的混合内存/磁盘去重，大数据集不 OOM
4. **速率控制**：ratelimit 按数据源分别限速，避免触发 API 限制
5. **DNS 解析**：集成 dnsx 进行子域名存活验证和通配符过滤

**关键 Go 库依赖**：
| 库 | 用途 |
|----|------|
| `projectdiscovery/chaos-client` | Chaos DB API |
| `projectdiscovery/dnsx` | DNS 解析验证 |
| `projectdiscovery/ratelimit` | 请求限速 |
| `projectdiscovery/gologger` | 日志 |
| `projectdiscovery/goflags` | 命令行参数 |
| `projectdiscovery/utils` | 通用工具 |
| `projectdiscovery/fdmax` | 文件描述符提升 |
| `projectdiscovery/retryablehttp-go` | HTTP 请求 |
| `projectdiscovery/fastdialer` | DNS 缓存拨号 |
| `projectdiscovery/cdncheck` | CDN 检测 |
| `projectdiscovery/hmap` | 混合存储 |
| `json-iterator/go` | 高性能 JSON |
| `lib/pq` | PostgreSQL |

---

### 4.4 httpx — HTTP 探测工具包 ⭐ 9.9k

**主要功能**：快速多用途 HTTP 工具包，对 URL/主机进行多维度探测，支持 30+ 种探针类型。

**详细功能列表**：
- **基础探测**：URL、状态码、内容长度、内容类型、标题、Web 服务器、响应时间
- **TLS 探测**：TLS 证书信息、JARM 指纹、TLS 版本
- **网络探测**：IP 地址、CNAME、ASN 信息、CDN/WAF 检测
- **内容分析**：行数、词数、Body Hash（md5/mmh3/simhash/sha256）、Favicon Hash
- **技术识别**：基于 wappalyzergo 的 Web 技术指纹识别，支持自定义指纹文件
- **截图功能**：go-rod 驱动无头浏览器截图，支持视觉聚类
- **Headless 操作**：截图、JavaScript 执行、自定义 Chrome 选项
- **协议探测**：HTTP/2、HTTP Pipeline、WebSocket、Virtual Host
- **匹配器**：状态码、内容长度、行数、词数、Favicon、字符串、正则、CDN、DSL 条件
- **过滤器**：与匹配器对应的所有过滤条件 + 重复内容过滤 + 错误页面过滤
- **多输入格式**：主机、URL、CIDR、原始请求、Burp 文件
- **多输出格式**：JSON、JSONL、CSV、HTML、SQLite、数据库（MySQL/PostgreSQL/MongoDB）
- **流模式**：stream 模式无需排序即可处理输入
- **TLS 指纹伪装**：实验性 JA3 随机化
- **FQDN 提取**：从响应体和头部提取域名
- **HTTP API 端点**：实验性 HTTP API 服务

**核心原理**：
1. **多探针并行**：对每个目标同时执行多种探测，结果合并输出
2. **智能回退**：HTTPS 失败自动回退 HTTP
3. **技术识别**：wappalyzergo 匹配响应头+Body 中的技术特征
4. **CDN 检测**：cdncheck 基于 CIDR 列表和 CNAME 规则判断
5. **指纹哈希**：simhash 用于页面相似度，murmur3 用于 Favicon 哈希，goimagehash 用于截图感知哈希
6. **去重**：基于 Body Hash 的重复内容过滤

**关键 Go 库依赖**：
| 库 | 用途 |
|----|------|
| `projectdiscovery/retryablehttp-go` | HTTP 请求 |
| `projectdiscovery/rawhttp` | 原始 HTTP |
| `projectdiscovery/tlsx` | TLS 采集 |
| `projectdiscovery/wappalyzergo` | 技术识别 |
| `projectdiscovery/cdncheck` | CDN 检测 |
| `projectdiscovery/asnmap` | ASN 映射 |
| `projectdiscovery/fastdialer` | DNS 缓存拨号 |
| `projectdiscovery/dsl` | DSL 过滤 |
| `projectdiscovery/ratelimit` | 限速 |
| `projectdiscovery/hmap` | 混合存储 |
| `projectdiscovery/mapcidr` | CIDR 处理 |
| `projectdiscovery/useragent` | UA 管理 |
| `projectdiscovery/clistats` | 统计显示 |
| `projectdiscovery/goflags` | 命令行 |
| `projectdiscovery/gologger` | 日志 |
| `projectdiscovery/utils` | 通用工具 |
| `go-rod/rod` | 无头浏览器截图 |
| `corona10/goimagehash` | 图片感知哈希 |
| `mfonda/simhash` | SimHash 去重 |
| `hdm/jarm-go` | JARM 指纹 |
| `PuerkitoBio/goquery` | HTML 解析 |
| `microcosm-cc/bluemonday` | HTML 清理 |
| `hbakhtiyor/strsim` | 字符串相似度 |
| `spaolacci/murmur3` | MurmurHash |
| `zmap/zcrypto` | 密码学扩展 |
| `julienschmidt/httprouter` | HTTP 路由 |
| `go-mongodb/mongo-driver` | MongoDB 输出 |
| `go-sql-driver/mysql` | MySQL 输出 |
| `lib/pq` | PostgreSQL 输出 |
| `gocarina/gocsv` | CSV 输出 |
| `weppos/publicsuffix-go` | 域名后缀 |

---

### 4.5 naabu — 端口扫描器 ⭐ 5.9k

**主要功能**：快速端口扫描器，支持 SYN/CONNECT/UDP 扫描模式，集成 CDN 排除和 Nmap 服务发现。

**详细功能列表**：
- **多扫描模式**：SYN 扫描（需 root）、CONNECT 扫描（普通权限）、UDP 扫描
- **CDN/WAF 排除**：集成 cdncheck 自动识别并排除 CDN IP（仅扫 80/443）
- **主机发现**：ARP Ping、TCP SYN/ACK Ping、ICMP Echo/Timestamp/Address Mask Ping、IPv6 ND
- **被动端口发现**：通过 Shodan InternetDB API 获取开放端口
- **IPv4/IPv6**：双栈扫描支持
- **Nmap 集成**：扫描结果可自动调用 nmap 进行服务发现
- **智能扫描**：基于端口关联模型的预测性扫描
- **自定义 UDP 载荷**：CONNECT 扫描中发送自定义 UDP 数据
- **多输入格式**：STDIN、HOST、IP、CIDR、ASN
- **DNS 端口扫描**：自动 IP 去重
- **SOCKS5 代理**：支持通过代理扫描
- **扫描指标**：本地 HTTP 端口暴露扫描状态
- **云平台集成**：ProjectDiscovery Cloud 上传

**核心原理**：
1. **SYN 扫描**：基于 gopacket 构造原始 TCP SYN 包 → 发送 → 监听 SYN/ACK 响应 → 发送 RST 终止连接（半开扫描）
2. **CONNECT 扫描**：标准 TCP 三次握手 → 连接成功即端口开放
3. **随机化**：blackrock 密码算法随机化扫描顺序，避免 IDS/IPS 检测
4. **主机发现**：ARP/ICMP/TCP 多协议探测主机存活
5. **CDN 排除**：cdncheck 检测 CDN IP → 仅扫描 80/443 → 节省时间
6. **ipranger**：基于 masscan 逻辑的 IP/端口随机化数据结构

**关键 Go 库依赖**：
| 库 | 用途 |
|----|------|
| `Mzack9999/gopacket` | 原始套接字/SYN 扫描 |
| `projectdiscovery/cdncheck` | CDN 检测排除 |
| `projectdiscovery/blackrock` | 端口随机化 |
| `projectdiscovery/ipranger` | IP/端口管理 |
| `projectdiscovery/dnsx` | DNS 解析 |
| `projectdiscovery/uncover` | 搜索引擎发现 |
| `projectdiscovery/mapcidr` | CIDR 处理 |
| `projectdiscovery/retryabledns` | DNS 查询 |
| `projectdiscovery/retryablehttp-go` | HTTP 请求 |
| `projectdiscovery/ratelimit` | 限速 |
| `projectdiscovery/clistats` | 统计显示 |
| `projectdiscovery/goflags` | 命令行 |
| `projectdiscovery/gologger` | 日志 |
| `projectdiscovery/utils` | 通用工具 |
| `projectdiscovery/fdmax` | FD 限制提升 |
| `projectdiscovery/freeport` | 空闲端口 |
| `miekg/dns` | DNS 协议 |
| `armon/go-socks5` | SOCKS5 代理 |
| `Ullaakut/nmap/v3` | NMap XML 输出 |
| `remeh/sizedwaitgroup` | 并发控制 |
| `yl2chen/cidranger` | CIDR 范围查找 |

---

### 4.6 interactsh — OOB 交互收集 ⭐ 4.3k

**主要功能**：带外（Out-of-Band）交互收集服务器和客户端库，用于检测盲注漏洞（SSRF、XSS、RCE 等）。

**详细功能列表**：
- **多协议服务器**：DNS、HTTP、HTTPS、SMTP、SMTPS、LDAP、FTP
- **客户端**：CLI 客户端、Web 仪表盘、Burp Suite 插件、ZAP 插件、Caido 插件、Docker
- **唯一标识**：每个交互请求分配唯一子域名/路径，zbase32 编码
- **自动 TLS**：Caddy CertMagic 自动申请 Let's Encrypt 通配符证书
- **AES 加密**：零日志策略，交互数据 AES 加密传输
- **实时交互**：客户端轮询或 WebSocket 获取交互数据
- **会话持久化**：session-file 支持断线重连
- **认证保护**：token 认证保护自建服务器
- **多域名支持**：自建服务器支持多域名
- **自定义载荷长度**：correlation-id 长度和 nonce 长度可配置
- **云元数据 DNS**：为云元数据服务创建 DNS 条目
- **动态 HTTP 响应**：可自定义 HTTP 响应内容
- **NTLM/SMB/FTP 监听器**：自建服务器支持更多协议
- **数据驱逐**：可配置交互数据保留天数和驱逐策略
- **IPv4/IPv6**：双栈支持

**核心原理**：
1. **唯一标识生成**：zbase32 编码的 correlation-id + nonce → 唯一子域名前缀
2. **DNS 拦截**：自建 DNS 服务器匹配 `*.oast.pro` → 记录交互 → 返回攻击者 IP
3. **HTTP 拦截**：HTTP 服务器匹配 URL 路径中的 correlation-id → 记录完整请求
4. **多协议统一**：所有协议服务器共享同一套 correlation-id 解析和存储逻辑
5. **客户端轮询**：客户端定期向服务器查询自己 correlation-id 的交互记录
6. **自动证书**：CertMagic + ACME 自动申请和续期通配符 TLS 证书
7. **LevelDB 存储**：持久化存储交互记录，支持驱逐策略

**关键 Go 库依赖**：
| 库 | 用途 |
|----|------|
| `miekg/dns` | DNS 服务器 |
| `caddyserver/certmagic` | 自动 TLS 证书 |
| `projectdiscovery/ldapserver` | LDAP 服务器 |
| `git.mills.io/prologic/smtpd` | SMTP 服务器 |
| `goftp.io/server/v2` | FTP 服务器 |
| `projectdiscovery/retryabledns` | DNS 客户端 |
| `projectdiscovery/retryablehttp-go` | HTTP 客户端 |
| `projectdiscovery/asnmap` | ASN 映射 |
| `projectdiscovery/goflags` | 命令行 |
| `projectdiscovery/gologger` | 日志 |
| `projectdiscovery/utils` | 通用工具 |
| `syndtr/goleveldb` | LevelDB 存储 |
| `go.uber.org/ratelimit` | 速率限制 |
| `go.uber.org/zap` | 结构化日志 |
| `goburrow/cache` | 缓存 |
| `libdns/libdns` | DNS 记录管理 |
| `mackerelio/go-osstat` | 系统统计 |
| `gopkg.in/corvus-ch/zbase32.v1` | z-base32 编码 |

---

### 4.7 proxify — 代理工具 ⭐ 3k

**主要功能**：瑞士军刀式 HTTP/HTTPS 代理，支持流量捕获、操作、重放，可与非 HTTP 流量配合使用。

**详细功能列表**：
- **MITM 代理**：HTTP + HTTPS 中间人代理，自动生成 CA 证书
- **SOCKS5 代理**：同时运行 HTTP 和 SOCKS5 代理
- **流量捕获**：JSONL、YAML、文件三种输出格式
- **请求/响应修改**：DSL 表达式定义 Match-Replace 规则
- **流量过滤**：DSL 表达式过滤特定请求/响应
- **上游代理**：支持 HTTP/SOCKS5 链式代理，Round Robin 轮转
- **DNS 服务器**：内置 tinydns 解析，支持域名映射
- **TLS 透传**：指定域名跳过 TLS 终止
- **非 HTTP 流量**：支持不可见客户端和厚客户端流量代理
- **插件系统**：解码特定协议（XMPP/SMTP/FTP/SSH）
- **流量重放**：replay 工具将捕获流量导入 Burp Suite
- **多输出**：Elasticsearch、Kafka 输出
- **IP 白/黑名单**：allow/deny 控制代理目标

**核心原理**：
1. **MITM 代理**：martian 库构建 HTTP/HTTPS 中间人代理 → 动态生成服务器证书
2. **流量捕获**：每个请求/响应对以 JSONL 格式记录（时间戳、URL、请求头、响应头、Body）
3. **DSL 修改**：请求/响应通过 DSL 引擎 → 匹配规则触发替换 → 修改后转发
4. **DNS 劫持**：tinydns 将域名映射到指定 IP → replay 时重放流量到本地
5. **上游代理轮转**：roundrobin 库实现多上游代理的轮转策略

**关键 Go 库依赖**：
| 库 | 用途 |
|----|------|
| `projectdiscovery/martian/v3` | HTTP 代理框架 |
| `projectdiscovery/dsl` | DSL 表达式 |
| `projectdiscovery/tinydns` | DNS 服务器 |
| `projectdiscovery/roundrobin` | 上游代理轮转 |
| `projectdiscovery/fastdialer` | DNS 缓存拨号 |
| `projectdiscovery/goflags` | 命令行 |
| `projectdiscovery/gologger` | 日志 |
| `projectdiscovery/utils` | 通用工具 |
| `elazarl/goproxy` | HTTP 代理 |
| `haxii/fastproxy` | 快速代理 |
| `things-go/go-socks5` | SOCKS5 代理 |
| `Shopify/sarama` | Kafka 客户端 |
| `elastic/go-elasticsearch/v7` | Elasticsearch |
| `goccy/go-yaml` | YAML 处理 |
| `Knetic/govaluate` | 表达式求值 |

---

### 4.8 uncover — 暴露主机发现 ⭐ 2.9k

**主要功能**：通过多个搜索引擎（Censys、Shodan、Fofa、Quake 等）快速发现互联网暴露主机。

**详细功能列表**：
- **多引擎聚合**：Censys、Shodan、Fofa、Quake、Hunter、Zoomeye 等搜索引擎
- **搜索语法模板**：awesome-search-queries 提供预定义搜索语法
- **速率控制**：ratelimit 控制查询频率
- **CIDR 扩展**：mapcidr 将 IP 扩展为完整 CIDR 范围
- **多输出格式**：标准输出、JSON
- **管道兼容**：stdin/stdout 管道化

**核心原理**：
1. **Agent 接口**：每个搜索引擎实现统一 `Agent` 接口
2. **并发查询**：多引擎并发查询，结果去重合并
3. **CIDR 扩展**：单个 IP 自动扩展为 /24 CIDR 范围

**关键 Go 库依赖**：
| 库 | 用途 |
|----|------|
| `censys/censys-sdk-go` | Censys API |
| `projectdiscovery/retryablehttp-go` | HTTP 请求 |
| `projectdiscovery/mapcidr` | CIDR 处理 |
| `projectdiscovery/ratelimit` | 限速 |
| `projectdiscovery/goflags` | 命令行 |
| `projectdiscovery/gologger` | 日志 |
| `projectdiscovery/awesome-search-queries` | 搜索语法 |
| `projectdiscovery/utils` | 通用工具 |
| `hashicorp/golang-lru` | LRU 缓存 |
| `julienschmidt/httprouter` | HTTP 路由 |

---

### 4.9 dnsx — DNS 工具包 ⭐ 2.7k

**主要功能**：多功能 DNS 工具包，支持 DNS 解析、爆破、记录查询、通配符过滤。

**详细功能列表**：
- **多记录查询**：A、AAAA、CNAME、NS、TXT、MX、SOA、PTR
- **通配符检测**：多次随机子域查询检测通配符 DNS
- **DNS 爆破**：基于字典的子域名爆破
- **ASN 查询**：集成 asnmap 获取 IP 的 ASN 信息
- **CDN 检测**：集成 cdncheck 判断 CDN
- **自定义解析器**：支持自定义 DNS 解析器列表
- **响应追踪**：显示 DNS 解析链路
- **JSON 输出**：结构化输出结果

**核心原理**：
1. **retryabledns**：封装 miekg/dns，支持多 resolver 轮转和重试
2. **通配符检测**：对随机子域名（如 `randstr.example.com`）多次查询 → 若均返回相同 IP → 判定为通配符
3. **爆破模式**：字典中的每个子域前缀 + 目标域名 → 并发 DNS 查询 → 过滤通配符

**关键 Go 库依赖**：
| 库 | 用途 |
|----|------|
| `miekg/dns` | DNS 协议库 |
| `projectdiscovery/retryabledns` | DNS 查询重试 |
| `projectdiscovery/asnmap` | ASN 映射 |
| `projectdiscovery/cdncheck` | CDN 检测 |
| `projectdiscovery/mapcidr` | CIDR 处理 |
| `projectdiscovery/ratelimit` | 限速 |
| `projectdiscovery/clistats` | 统计显示 |
| `projectdiscovery/hmap` | 混合存储 |
| `projectdiscovery/goflags` | 命令行 |
| `projectdiscovery/gologger` | 日志 |
| `projectdiscovery/utils` | 通用工具 |

---

### 4.10 tlsx — TLS 数据采集 ⭐ 1.1k

**主要功能**：快速可配置的 TLS 数据采集工具，专注于 TLS 证书、协议版本、密码套件等信息收集。

**详细功能列表**：
- **JARM 指纹**：TLS JARM 主动指纹生成
- **Ja3/Ja3s 指纹**：客户端/服务端 TLS 指纹
- **证书透明度**：CT 日志查询
- **TLS 版本探测**：自动检测支持的 TLS 版本和密码套件
- **证书链分析**：完整证书链信息提取
- **SNI 支持**：自定义 TLS SNI 名称
- **证书验证**：证书有效性检查
- **TLS 混淆**：实验性客户端 Hello 随机化

**核心原理**：
1. **JARM**：发送 10 个特殊 TLS Client Hello → 收集 Server Hello 响应 → 拼接哈希
2. **zcrypto**：使用 zcrypto 扩展库获取比标准库更详细的 TLS 信息
3. **证书链**：完整解析 X.509 证书链，提取主题、颁发者、有效期、SAN 等

**关键 Go 库依赖**：
| 库 | 用途 |
|----|------|
| `zmap/zcrypto` | TLS 密码学扩展 |
| `hdm/jarm-go` | JARM 指纹生成 |
| `google/certificate-transparency-go` | CT 日志查询 |
| `cloudflare/cfssl` | CFSSL 工具 |
| `projectdiscovery/dnsx` | DNS 解析 |
| `projectdiscovery/fastdialer` | DNS 缓存拨号 |
| `projectdiscovery/retryablehttp-go` | HTTP 请求 |
| `projectdiscovery/mapcidr` | CIDR 处理 |
| `projectdiscovery/goflags` | 命令行 |
| `projectdiscovery/gologger` | 日志 |
| `projectdiscovery/utils` | 通用工具 |
| `PuerkitoBio/goquery` | HTML 解析 |
| `tylertreat/BoomFilters` | 概率数据结构 |

---

## 五、自研 Go 库体系分析

### 5.1 网络通信库

| 库 | 核心功能 | 设计原理 |
|----|----------|----------|
| `retryablehttp-go` | HTTP 客户端+重试+指数退避 | 封装 net/http，增加重试逻辑和请求/响应中间件钩子 |
| `retryabledns` | DNS 客户端+重试+多解析器 | 封装 miekg/dns，支持多 resolver 轮转和重试 |
| `rawhttp` | 原始 HTTP 客户端 | 绕过 Go 标准库 HTTP 解析，可发送畸形请求 |
| `fastdialer` | 带 DNS 缓存的拨号器 | 在 net.Dialer 基础上增加 DNS 缓存和历史记录 |
| `networkpolicy` | 网络策略控制 | 限制工具只能访问允许的网络范围 |

### 5.2 数据处理库

| 库 | 核心功能 | 设计原理 |
|----|----------|----------|
| `hmap` | 混合内存/磁盘 Map | 小数据存内存，大数据自动溢出到磁盘，避免 OOM |
| `mapcidr` | CIDR 操作工具 | 支持 CIDR 聚合、分割、包含判断、IP 枚举 |
| `dsl` | DSL 表达式引擎 | 基于 govaluate 扩展，内置安全领域辅助函数 |
| `gostruct` | 二进制数据解析 | 类 Python struct 模块，解析网络协议二进制数据 |
| `gcache` | 内存缓存 | 支持 LRU/LFU/ARC 淘汰策略 |

### 5.3 CLI 基础库

| 库 | 核心功能 | 设计原理 |
|----|----------|----------|
| `goflags` | 命令行参数解析 | 扩展标准 flag，支持配置文件、环境变量、短选项、字符串切片 |
| `gologger` | 分级日志 | 轻量级日志，支持多级别、带颜色输出 |
| `clistats` | 统计信息显示 | 实时显示扫描进度、速率等统计信息 |
| `useragent` | User-Agent 管理 | 维护分类 UA 列表，随机/轮转选择 |
| `fdmax` | FD 限制提升 | 自动提升 ulimit -n 限制 |
| `freeport` | 空闲端口获取 | 从 OS 获取可用监听端口 |

### 5.4 安全检测库

| 库 | 核心功能 | 设计原理 |
|----|----------|----------|
| `wappalyzergo` | Web 技术识别 | Wappalyzer 规则的 Go 高性能实现 |
| `cdncheck` | CDN/WAF/云检测 | 基于 CIDR 列表和 CNAME 规则的 CDN 检测 |
| `asnmap` | ASN 映射 | 通过多个数据源查询 IP 的 ASN 信息 |
| `tlsx` | TLS 采集 | TLS 握手数据采集与分析 |
| `blackrock` | 端口随机化 | 基于 masscan 的 Blackrock 加密算法 |

### 5.5 服务器/协议库

| 库 | 核心功能 | 设计原理 |
|----|----------|----------|
| `tinydns` | 可嵌入 DNS 服务器 | 轻量 DNS 服务器，用于代理场景 |
| `ldapserver` | LDAP 服务器 | 完整 LDAP 协议实现，用于 OOB 检测 |
| `go-smb2` | SMB2/3 客户端 | SMB 协议客户端，用于 nuclei SMB 检测 |
| `smb` | SMB 协议库 | SMBv1 协议实现 |
| `martian` | HTTP 代理框架 | 构建自定义 HTTP/S 代理的库 |
| `rawhttp` | 原始 HTTP 客户端 | 绕过标准库发送任意 HTTP 请求 |
| `cleanhttp` | 通配符 HTTP 检测 | 检测和过滤通配符 HTTP 响应 |

---

## 六、第三方 Go 库使用统计

### 6.1 网络协议

| 库 | 使用项目数 | 用途 |
|----|-----------|------|
| `miekg/dns` | 8+ | DNS 协议实现 |
| `go-rod/rod` | 4+ | 无头浏览器自动化 |
| `refraction-networking/utls` | 8+ | TLS 指纹伪装 |
| `zmap/zcrypto` | 5+ | 密码学扩展（TLS 分析） |
| `hdm/jarm-go` | 3+ | JARM TLS 指纹 |

### 6.2 数据处理

| 库 | 使用项目数 | 用途 |
|----|-----------|------|
| `json-iterator/go` | 8+ | 高性能 JSON 编解码 |
| `syndtr/goleveldb` | 7+ | LevelDB 嵌入式数据库 |
| `tidwall/gjson` | 6+ | JSON 路径查询 |
| `tidwall/buntdb` | 5+ | 内存 BuntDB |
| `hashicorp/golang-lru/v2` | 6+ | LRU 缓存 |
| `akrylysov/pogreb` | 5+ | 嵌入式键值存储 |
| `gaissmai/bart` | 5+ | B-ART 路由表 |

### 6.3 HTML/Web 处理

| 库 | 使用项目数 | 用途 |
|----|-----------|------|
| `PuerkitoBio/goquery` | 4+ | HTML DOM 解析（jQuery 风格） |
| `microcosm-cc/bluemonday` | 5+ | HTML 清理/消毒 |
| `andybalholm/brotli` | 5+ | Brotli 压缩 |
| `asaskevich/govalidator` | 6+ | 数据验证 |

### 6.4 CLI/终端

| 库 | 使用项目数 | 用途 |
|----|-----------|------|
| `charmbracelet/glamour` | 8+ | 终端 Markdown 渲染 |
| `charmbracelet/lipgloss` | 8+ | 终端样式 |
| `cheggaaa/pb/v3` | 6+ | 进度条 |
| `logrusorgru/aurora` | 8+ | 终端颜色 |

### 6.5 存储/输出

| 库 | 使用项目数 | 用途 |
|----|-----------|------|
| `go.etcd.io/bbolt` | 6+ | BoltDB 嵌入式数据库 |
| `klauspost/compress` | 6+ | 压缩算法 |
| `minio/selfupdate` | 6+ | 自更新机制 |
| `weppos/publicsuffix-go` | 6+ | 公共后缀列表 |

---

## 七、典型工作流程

### 7.1 完整攻击面侦察流程

```bash
# Step 1: 子域名发现
subfinder -d example.com -silent

# Step 2: DNS 解析 + 过滤
subfinder -d example.com | dnsx -silent

# Step 3: HTTP 探测（技术栈、TLS、截图）
subfinder -d example.com | httpx -silent -td -ss -tls-grab

# Step 4: 端口扫描（排除 CDN）
subfinder -d example.com | dnsx -silent | naabu -top-ports 1000 -ec

# Step 5: 爬虫发现隐藏端点
httpx -l urls.txt -silent | katana -d 5 -jc -aff

# Step 6: 漏洞扫描
katana -u https://example.com -d 5 -jc -aff | nuclei -t cves/ -t vulnerabilities/

# Step 7: 通知推送
nuclei -t cves/ -u https://example.com | notify -slack -telegram
```

### 7.2 OOB 漏洞检测流程

```bash
# Step 1: 启动 interactsh 服务器
interactsh-server -d oast.example.com &

# Step 2: 客户端获取 OOB 载荷
interactsh-client -s oast.example.com

# Step 3: nuclei 使用 OOB 检测
nuclei -t cves/ -t vulnerabilities/ -u target.com \
  -interactsh-server oast.example.com

# Step 4: 实时通知 OOB 交互
interactsh-client -s oast.example.com | notify -slack
```

### 7.3 云资产发现流程

```bash
# Step 1: 多云资产列举
cloudlist -provider aws -provider azure -provider gcp

# Step 2: HTTP 探测
cloudlist -provider aws | httpx -silent -td

# Step 3: 漏洞扫描
cloudlist -provider aws | httpx -silent | nuclei -t cves/
```

### 7.4 代理流量分析流程

```bash
# Step 1: 启动代理捕获
proxify -http-addr :8888 -socks-addr :10080 -output traffic.jsonl

# Step 2: DSL 过滤流量
proxify -request-dsl "contains(request,'admin')" \
  -response-dsl "contains(response,'password')"

# Step 3: 实时修改流量
proxify -request-match-replace-dsl "replace(request,'firefox','chrome')"

# Step 4: 重放到 Burp Suite
replay -output traffic.jsonl
```

### 7.5 CI/CD 自动化安全扫描

```yaml
# GitHub Actions 工作流
- name: Subdomain Discovery
  uses: projectdiscovery/subfinder-action@main
- name: HTTP Probing
  uses: projectdiscovery/httpx-action@main
- name: Vulnerability Scan
  uses: projectdiscovery/nuclei-action@main
- name: Port Scan
  uses: projectdiscovery/naabu-action@main
- name: Notify Results
  uses: projectdiscovery/notify-action@main
```

---

## 八、架构设计亮点

### 8.1 统一的基础设施层

所有工具共享同一套基础库（goflags、gologger、utils 等），确保：
- 统一的命令行参数风格（`-u`、`-l`、`-o`、`-json` 等）
- 统一的日志格式（`[INF]`、`[WRN]`、`[ERR]`）
- 统一的配置管理（`$HOME/.config/<tool>/config.yaml`）
- 统一的更新机制（minio/selfupdate）

### 8.2 管道化设计

每个工具都支持 stdin 输入和 stdout 输出，遵循 Unix 哲学：
- 输入：从文件、stdin 或管道读取目标
- 输出：以 JSON、文本等格式输出到 stdout 或文件
- 组合：工具间可自由管道连接

### 8.3 可扩展架构

- **nuclei 模板系统**：YAML DSL 让安全社区可以贡献检测规则
- **subfinder 数据源**：Provider 接口可轻松添加新数据源
- **uncover 搜索引擎**：Agent 接口可添加新搜索引擎
- **notify 通知渠道**：Provider 接口可添加新通知平台
- **proxify 插件**：Plugin 接口可添加协议解码器

### 8.4 性能优化

- **hmap**：大数据场景自动切换磁盘存储，避免 OOM
- **fastdialer**：DNS 缓存减少重复查询
- **ratelimit**：精确控制请求速率
- **blackrock**：随机化扫描顺序避免被检测
- **sizedwaitgroup**：精确控制并发度
- **请求聚类**：nuclei 自动合并相同目标的重复请求

---

## 九、项目活跃度与成熟度评估

| 项目 | Stars | 活跃度 | 成熟度 | 推荐使用 |
|------|-------|--------|--------|----------|
| nuclei | 28k | ⭐⭐⭐⭐⭐ | 生产级 | ✅ 强烈推荐 |
| katana | 17k | ⭐⭐⭐⭐⭐ | 生产级 | ✅ 强烈推荐 |
| subfinder | 14k | ⭐⭐⭐⭐⭐ | 生产级 | ✅ 强烈推荐 |
| httpx | 9.9k | ⭐⭐⭐⭐⭐ | 生产级 | ✅ 强烈推荐 |
| naabu | 5.9k | ⭐⭐⭐⭐ | 生产级 | ✅ 推荐 |
| interactsh | 4.3k | ⭐⭐⭐⭐ | 生产级 | ✅ 推荐 |
| proxify | 3k | ⭐⭐⭐ | 成熟 | ✅ 推荐 |
| uncover | 2.9k | ⭐⭐⭐⭐ | 成熟 | ✅ 推荐 |
| dnsx | 2.7k | ⭐⭐⭐⭐ | 成熟 | ✅ 推荐 |
| vulnx | 2.5k | ⭐⭐⭐ | 成长中 | ⚡ 关注 |
| cdncheck | 963 | ⭐⭐⭐⭐ | 成熟 | ✅ 推荐 |
| alterx | 950 | ⭐⭐⭐ | 成长中 | ⚡ 关注 |
| tlsx | 1.1k | ⭐⭐⭐ | 成熟 | ✅ 推荐 |
| asnmap | 1k | ⭐⭐⭐ | 成熟 | ✅ 推荐 |
| wappalyzergo | 1k | ⭐⭐⭐⭐ | 成熟 | ✅ 推荐 |
| cloudlist | 1k | ⭐⭐⭐ | 成熟 | ✅ 推荐 |
| aix | 313 | ⭐⭐ | 早期 | ⚡ 实验性 |
| tldfinder | 321 | ⭐⭐ | 早期 | ⚡ 实验性 |

---

## 十、Go 语言学习价值

ProjectDiscovery 的代码库是学习 Go 语言网络编程和安全工具开发的优秀资源：

1. **并发模式**：大量使用 goroutine + channel + sync 原语，是学习 Go 并发的实战教材
2. **网络协议实现**：从 DNS、HTTP、TLS 到 LDAP、SMB、SMTP，覆盖了主要网络协议
3. **CLI 工具开发**：goflags 展示了如何构建专业级命令行工具
4. **性能优化**：hmap、fastdialer 等展示了 Go 中处理大数据和高并发的技巧
5. **接口设计**：Provider/Agent 模式展示了 Go 接口的实际应用
6. **测试实践**：testcontainers 集成测试、模糊测试等
7. **DSL 引擎**：govaluate + 自定义函数构建领域特定语言
8. **中间人代理**：martian 库展示 HTTP 代理的完整实现
9. **无头浏览器**：go-rod 的自动化爬虫和截图实践
10. **嵌入式数据库**：LevelDB、BoltDB、Pogreb 的使用场景和选型
