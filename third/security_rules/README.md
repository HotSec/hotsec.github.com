# 开源安全产品规则库

本目录收集了常用的开源安全检测工具的规则库，用于研究和学习。

## 目录结构

```
security_rules/
├── suricata/
│   ├── hunting-rules/        # Travi B Green 狩猎规则
│   └── maltrail-rules/       # Maltrail 项目规则（含威胁情报）
├── falco/
│   └── falco-rules/          # Falco 官方规则库
├── sigma/
│   └── sigma-rules/          # Sigma 官方通用 SIEM 规则库
├── nuclei/
│   └── nuclei-templates/     # Nuclei 漏洞扫描模板（含12000+规则）
├── yara/
│   └── yara-rules/           # YARA 恶意软件检测规则（VirusTotal 社区）
├── threat_intel/
│   ├── blackbook/            # Blackbook 威胁情报（域名/IP）
│   └── phishing-db/          # 钓鱼数据库
└── apt-reports/              # APT 组织报告资料
```

## 规则库详细说明

### 1. Suricata 规则

| 目录 | 说明 |
|------|------|
| [suricata/hunting-rules/](./suricata/hunting-rules/) | 狩猎规则，包含 `hunting.rules`、`pii.rules`、`most_abused_tld.rules` |
| [suricata/maltrail-rules/](./suricata/maltrail-rules/) | Maltrail 项目（恶意流量检测），含完整的威胁情报源和 IP 黑名单（bogon_ranges.txt、whitelist.txt、worst_asns.txt） |

### 2. Falco 规则

| 目录 | 说明 |
|------|------|
| [falco/falco-rules/](./falco/falco-rules/) | Falco 官方规则库，云原生运行时安全检测规则，含容器逃逸、敏感文件访问等检测规则 |

### 3. Sigma 规则

| 目录 | 说明 |
|------|------|
| [sigma/sigma-rules/](./sigma/sigma-rules/) | Sigma 通用 SIEM 规则库，可转换为 Splunk/Elastic/Windows Defender/Google Chronicle 等平台规则 |

### 4. Nuclei 模板

| 目录 | 说明 |
|------|------|
| [nuclei/nuclei-templates/](./nuclei/nuclei-templates/) | Nuclei 官方模板库，13000+ 漏洞扫描模板，按协议分类（HTTP/DNS/SSL/Network） |

### 5. YARA 规则

| 目录 | 说明 |
|------|------|
| [yara/yara-rules/](./yara/yara-rules/) | 社区维护的 YARA 规则库，含 APT 规则（APT1/APT10/APT17/APT3102/APT9002 等）、恶意软件家族规则、利用套件、文档恶意宏、CVE 规则等 |

### 6. 威胁情报

| 目录 | 说明 |
|------|------|
| [threat_intel/blackbook/](./threat_intel/blackbook/) | 恶意域名和 IP 列表（CSV 和 TXT 格式） |
| [threat_intel/phishing-db/](./threat_intel/phishing-db/) | 钓鱼网站数据库 |
| [apt-reports/](./apt-reports/) | APT 组织报告资料库 |

## 相关知识点

详细规则说明请参考：
- [mybook/security/4_安全产品规则库/01_安全产品规则库.md](../onlinenote/public/mybook/security/4_安全产品规则库/01_安全产品规则库.md)
