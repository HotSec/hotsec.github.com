# ATT&CK与威胁情报

## MITRE ATT&CK

### 概述

ATT&CK（Adversarial Tactics, Techniques, and Common Knowledge）是 MITRE 组织创建的攻击行为知识库，系统化地描述了攻击者在网络攻击各阶段使用的技术和子技术。

### 战术矩阵（Enterprise）

| 战术 | ID | 描述 |
|------|-----|------|
| 侦察 | TA0043 | 收集目标信息（主动/被动） |
| 资源开发 | TA0042 | 建立攻击所需资源 |
| 初始访问 | TA0001 | 进入目标网络 |
| 执行 | TA0002 | 运行恶意代码 |
| 持久化 | TA0003 | 维持访问权限 |
| 权限提升 | TA0004 | 获取更高权限 |
| 防御规避 | TA0005 | 避免被检测 |
| 凭据访问 | TA0006 | 窃取账号密码 |
| 发现 | TA0007 | 探索内网环境 |
| 横向移动 | TA0008 | 在内网中移动 |
| 收集 | TA0009 | 收集目标数据 |
| 命令与控制 | TA0011 | 建立远程控制通道 |
| 数据渗出 | TA0010 | 窃取数据外传 |

### 常见技术与检测

#### 初始访问（TA0001）

| 技术 | ID | 检测方法 |
|------|-----|---------|
| 鱼叉式钓鱼附件 | T1566.001 | 邮件附件沙箱分析、恶意文档检测 |
| 利用公开应用 | T1190 | WAF规则、漏洞利用特征匹配 |
| 信任关系利用 | T1199 | 异常VPN/合作伙伴网络访问 |
| 供应链攻击 | T1195 | 软件完整性校验、行为监控 |

#### 执行（TA0002）

| 技术 | ID | 检测方法 |
|------|-----|---------|
| PowerShell | T1059.001 | 脚本块日志、AMSI、命令行审计 |
| WMI | T1047 | WMI事件订阅检测、进程创建监控 |
| 命令行界面 | T1059 | 命令行参数审计 |
| 计划任务 | T1053.005 | 计划任务创建事件监控 |
| 服务执行 | T1569.002 | 异常服务创建和启动 |

#### 持久化（TA0003）

| 技术 | ID | 检测方法 |
|------|-----|---------|
| 注册表运行键 | T1547.001 | 注册表监控 |
| 计划任务 | T1053 | 异常计划任务检测 |
| 服务创建 | T1543.003 | 新服务创建监控 |
| 账号创建 | T1136 | 新账号创建告警 |
| Web Shell | T1505.003 | Web目录文件监控、流量特征 |

#### 横向移动（TA0008）

| 技术 | ID | 检测方法 |
|------|-----|---------|
| PsExec | T1021.002 | SMB命名管道特征 |
| RDP | T1021.001 | 异常RDP登录检测 |
| SSH | T1021.004 | 异常SSH连接 |
| Pass-the-Hash | T1550.002 | NTLM认证异常 |
| Pass-the-Ticket | T1550.003 | Kerberos票证异常 |

#### 命令与控制（TA0011）

| 技术 | ID | 检测方法 |
|------|-----|---------|
| 应用层协议 | T1071 | HTTP/DNS/SMB异常流量 |
| 加密通道 | T1573 | TLS指纹（JA3）异常 |
| 隐蔽信道 | T1105 | DNS隧道、ICMP隧道检测 |
| 域前置 | T1090.004 | TLS SNI与Host头不一致 |
| 代理 | T1090 | 多跳网络连接 |

### ATT&CK 在安全产品中的应用

| 应用 | 描述 |
|------|------|
| 告警映射 | 将告警映射到ATT&CK技术，提供攻击上下文 |
| 检测覆盖评估 | 评估产品对各技术的检测能力 |
| 攻击模拟 | 红队基于ATT&CK设计攻击路径 |
| 差距分析 | 识别检测盲区，优先建设 |
| 报告标准化 | 统一语言描述攻击行为 |

***

## 威胁情报

### 情报类型

| 类型 | 描述 | 示例 |
|------|------|------|
| 战略情报 | 宏观威胁趋势 | APT组织年度报告 |
| 战术情报 | 攻击者TTP | 攻击手法、工具、流程 |
| 运营情报 | 具体攻击事件 | 正在进行的攻击活动 |
| 技术情报 | 可机读的IOC | 恶意IP、域名、Hash |

### IOC（失陷标示）

#### IOC 类型

| 类型 | 描述 | 检测方式 |
|------|------|---------|
| IP地址 | 恶意C2/扫描源IP | 流量匹配 |
| 域名 | 恶意域名/DGA域名 | DNS查询匹配 |
| URL | 恶意URL/钓鱼链接 | HTTP请求匹配 |
| 文件Hash | 恶意文件SHA256 | 文件提取后比对 |
| Email | 钓鱼邮件地址 | 邮件日志匹配 |
| 证书 | 恶意TLS证书 | SSL/TLS日志匹配 |

#### IOC 生命周期

```
发现 → 验证 → 评分 → 集成 → 检测 → 过期 → 归档
```

#### IOC 管理

```go
type IOC struct {
    ID          string
    Type        string
    Value       string
    Source      string
    Confidence  float64
    Severity    string
    Tags        []string
    FirstSeen   time.Time
    LastSeen    time.Time
    ExpiresAt   time.Time
    ATTCKTech   []string
}

func MatchIOC(iocRepo []IOC, event NetworkEvent) []IOC {
    var matches []IOC
    for _, ioc := range iocRepo {
        switch ioc.Type {
        case "ip":
            if event.SrcIP == ioc.Value || event.DstIP == ioc.Value {
                matches = append(matches, ioc)
            }
        case "domain":
            if event.DNSQuery == ioc.Value {
                matches = append(matches, ioc)
            }
        case "url":
            if strings.Contains(event.HTTPURI, ioc.Value) {
                matches = append(matches, ioc)
            }
        }
    }
    return matches
}
```

### TTP（战术、技术和程序）

| 维度 | 描述 |
|------|------|
| Tactics（战术） | 攻击者的目标（对应ATT&CK战术） |
| Techniques（技术） | 实现目标的方法（对应ATT&CK技术） |
| Procedures（程序） | 具体实施步骤（攻击者特有） |

TTP 比 IOC 更难改变，检测价值更高：

```
IOC（易变） < TTP（稳定）
IP/域名/Hash < 行为模式/攻击手法
```

### 情报源

| 类型 | 来源 | 示例 |
|------|------|------|
| 商业情报 | 付费订阅 | VirusTotal, Recorded Future |
| 开源情报（OSINT） | 免费公开 | AbuseIPDB, URLhaus, AlienVault OTX |
| 社区情报 | 社区共享 | MISP 社区, ISAC |
| 内部情报 | 自有数据 | 内部蜜罐、沙箱分析产出 |

### STIX/TAXII

#### STIX（结构化威胁信息表达）

标准化的威胁情报数据格式：

```json
{
  "type": "indicator",
  "id": "indicator--abc123",
  "pattern": "[ipv4-addr:value = '1.2.3.4']",
  "pattern_type": "stix",
  "valid_from": "2024-01-01T00:00:00Z",
  "valid_until": "2024-12-31T23:59:59Z",
  "labels": ["malicious-activity", "c2"],
  "confidence": 85,
  "kill_chain_phases": [
    {
      "kill_chain_name": "mitre-attack",
      "phase_name": "command-and-control"
    }
  ]
}
```

#### TAXII（可信自动化指标信息交换）

基于HTTPS的情报传输协议，支持推送和拉取模式。

***

## 溯源分析

### 溯源目标

| 目标 | 描述 |
|------|------|
| 攻击者身份 | 关联到具体组织/个人 |
| 攻击路径 | 还原完整的攻击链 |
| 影响范围 | 确定受损系统和数据 |
| 关联攻击 | 连接历史攻击活动 |

### 溯源方法

| 方法 | 描述 |
|------|------|
| 基础设施关联 | IP/域名/证书的注册信息关联 |
| 恶意样本关联 | 代码相似度、编译特征、PDB路径 |
| TTP关联 | 攻击手法与已知组织的匹配 |
| 语言/时区分析 | 恶意代码中的语言特征、活动时间规律 |
| 社交工程 | 诱饵文档、钓鱼邮件的语言风格 |

### 攻击组织画像

```
组织名称：APT-XX
活跃时间：2020-至今
目标行业：政府、金融、能源
攻击来源：XX地区
常用工具：Cobalt Strike, Mimikatz, 自研后门
ATT&CK技术：T1566.001, T1059.001, T1055, T1003, T1071.001
IOC库：[恶意IP列表, 恶意域名列表]
关联攻击：Operation XX, Event YY
```
