# ailogx — 多源日志安全分析智能体 设计文档

> 版本：v1.0 · 日期：2026-06-10 · 状态：设计完成

---

## 1. 产品定位

**ailogx** 是安全分析师的终端 CLI 工具。核心理念：**宽进严出**——规则引擎放水广泛抓取线索，LLM 深度分析收口输出确凿的攻击事件。

### 1.1 一句话定义

> pipe-friendly 本地命令行安全日志分析智能体：parse 归一化 → detect 宽泛告警 → chat LLM 深度研判，最终输出高危风险与攻击事件。

### 1.2 与传统方案对比

| 维度 | SIEM/SOAR | ailogx |
|------|-----------|--------|
| 部署 | 重型平台，需集群 | 单机 CLI，一条二进制 |
| 成本 | 商业授权 + 基础设施 | 开源，仅 LLM API 费用 |
| 交互 | Web GUI | 终端管道 + 对话 |
| 规则精度 | 追求高精度，少误报 | 宽泛覆盖，宁可多报 |
| 分析深度 | 依赖分析师经验 | LLM 自动溯源+报告 |
| 知识沉淀 | 需额外配置 | 自动案例归档+IOC入库 |

---

## 2. 整体架构

```
                         ┌──────────────────────────────────────┐
                         │            知识沉淀层                  │
                         │   iocs.db  │  rules/  │  cases/       │
                         └──────────────────────────────────────┘
                                          ↑ 自动入库
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐
│  多源日志  │───→│  parse   │───→│  detect  │───→│  chat (Agent) │
│  (杂乱格式) │    │  归一化   │    │  宽泛告警  │    │  研判/溯源/叙事│
│           │    │          │    │          │    │  /反思输出事件 │
└──────────┘    └──────────┘    └──────────┘    └──────────────┘
                     │                │                │
                [插件化解析器]    [Sigma 规则库]     [LLM API]
```

### 2.1 四大核心阶段

| 阶段 | 命令 | 职责 | 输入 | 输出 |
|------|------|------|------|------|
| ① 归一化 | `parse` | 解析器插件把异构日志映射为统一事件 | 原始日志流 | 统一事件流 (JSONL) |
| ② 告警 | `detect` | Sigma 规则宽泛匹配，宁可误报不可漏报 | 统一事件流 | 告警 + neighbors 上下文 |
| ③ 分析 | `chat/ask` | LLM Agent 四阶段分析循环 | 告警列表 + 原始日志 | 攻击事件报告 |
| ④ 沉淀 | `kb` | 自动 IOC 入库、规则反哺、案例归档 | 分析结果 | 本地知识库 |

---

## 3. 命令体系

```
ailogx
├── parse    →  日志归一化，插件化解析器
├── detect   →  规则引擎匹配，输出告警
├── chat     →  交互式 LLM 分析对话
├── ask      →  单次 LLM 分析（管道友好）
├── fetch    →  从 S3/ES/Loki/本地文件拉取日志
├── hunt     →  按 ATT&CK 战术/技术做威胁狩猎
├── timeline →  多源日志时间线拼接
├── report   →  生成审计报告
└── kb       →  知识库管理 (ioc/case/rule/ti)
```

### 3.1 典型工作流

```bash
# 日常巡检
cat /var/log/suricata/eve.json \
  | ailogx parse --source suricata \
  | ailogx detect --strict \
  | ailogx ask "这些告警有真实的攻击行为吗？"

# 深入调查（交互式）
ailogx fetch /var/log/ --from "2026-06-10T00:00" --to "2026-06-10T12:00" \
  | ailogx parse --source auto \
  | ailogx detect --loose \
  > alerts.jsonl

ailogx chat alerts.jsonl
> 帮我分析所有 medium 以上告警
> 那个 45.33.32.156 相关的攻击链是怎么回事？
> 生成一份完整的报告
```

---

## 4. 统一事件 Schema

解析层把所有异构安全日志映射为统一结构。

### 4.1 Schema 定义

```json
{
  "id": "uuid",
  "timestamp": "2026-06-10T14:30:00.123Z",
  "source": "suricata",
  "category": "network",
  "event_type": "alert",
  "action": "blocked",

  "src": {
    "ip": "10.0.1.5",
    "port": 44322,
    "host": "jump-box-03",
    "mac": "00:11:22:33:44:55",
    "user": "svc_scan",
    "process": "nmap"
  },

  "target": {
    "ip": "10.0.2.88",
    "port": 3389,
    "host": "dc-01",
    "service": "rdp",
    "domain": "corp.internal"
  },

  "network": {
    "protocol": "tcp",
    "bytes_sent": 2048,
    "bytes_received": 512,
    "duration_ms": 1500,
    "dns_query": null,
    "http_method": null,
    "http_host": null,
    "http_url": null,
    "http_status": null,
    "http_user_agent": null,
    "tls_sni": null,
    "tls_ja3": null
  },

  "process": {
    "pid": null,
    "ppid": null,
    "name": null,
    "cmdline": null,
    "parent_name": null,
    "parent_cmdline": null,
    "hash_md5": null,
    "hash_sha256": null,
    "signed": null,
    "signer": null
  },

  "file": {
    "path": null,
    "name": null,
    "hash_md5": null,
    "hash_sha256": null,
    "size": null,
    "type": null
  },

  "cloud": {
    "provider": null,
    "region": null,
    "account_id": null,
    "user_identity": null,
    "api": null,
    "resource": null
  },

  "raw": "{原始完整日志}",
  "alerts": [],
  "llm_verdict": null
}
```

### 4.2 内置解析器插件（首批）

| 插件 | 覆盖产品 |
|------|---------|
| `suricata` | Suricata IDS/IPS eve.json |
| `zeek` | Zeek/Bro 日志 |
| `modsecurity` | ModSecurity / Coraza WAF |
| `nginx_waf` | Nginx + ModSecurity / NAXSI |
| `auditd` | Linux Audit Daemon |
| `sysmon` | Windows Sysmon Event Log |
| `windows_event` | Windows Security Event Log |
| `cloudtrail` | AWS CloudTrail |
| `guardduty` | AWS GuardDuty |
| `gcp_audit` | GCP Cloud Audit Logs |
| `azure_monitor` | Azure Monitor / Sentinel |
| `osquery` | osquery 日志 |
| `falco` | Falco 运行时安全 |
| `crowdstrike` | CrowdStrike Falcon |
| `sentinelone` | SentinelOne |
| `paloalto` | Palo Alto Firewall / Cortex XDR |
| `fortinet` | FortiGate / FortiEDR |
| `elastic` | Elastic Security / Endgame |
| `carbonblack` | VMware Carbon Black |
| `defender` | Microsoft Defender for Endpoint |

> 解析器通过插件目录 `~/.ailogx/plugins/` 热插拔扩展，遵循统一接口。

---

## 5. Detect 引擎

### 5.1 设计哲学

**宁可 1000 条告警，不可漏 1 条攻击。** 精度由 LLM 在后续阶段负责。

### 5.2 规则来源

| 层级 | 路径 | 说明 |
|------|------|------|
| 内置 | 嵌入二进制 | 常用 Sigma 规则，开箱即用 |
| 本地 | `~/.ailogx/rules/local/` | 用户自维护，版本控制 |
| 社区 | 远程拉取 | `ailogx rule pull community/apt29` |

### 5.3 匹配策略

```bash
ailogx detect --strict    # level=high+critical  → 日常巡检
ailogx detect --default   # level>=medium         → 默认
ailogx detect --loose     # level>=low + 无level  → 深度调查，喂 LLM
```

### 5.4 告警输出结构

```json
{
  "alert_id": "uuid",
  "rule_id": "sigma/network_suspicious_rdp_connection",
  "rule_title": "Suspicious RDP Connection to Domain Controller",
  "rule_level": "medium",
  "matched_fields": {
    "target.port": 3389,
    "target.host": "dc-01",
    "src.ip": "10.0.1.5"
  },
  "timestamp": "2026-06-10T14:30:00Z",
  "event": { /* 命中的统一事件 */ },
  "neighbors": [
    { /* 同一 host ±30s 内的所有事件 */ }
  ]
}
```

**neighbors 字段**：规则命中后自动拉取该目标资产前后时间窗口（可调，默认 ±30s）内的所有事件，为 LLM 分析提供充足上下文。

### 5.5 IOC 实时匹配

detect 阶段同时查询本地 `iocs.db`，命中 IOC 时直接追加 `ioc_hit` 标签和置信度，提升告警权重。

---

## 6. LLM 分析 Agent（chat / ask）

### 6.1 四阶段强制循环

```
 ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
 │ ① 研判    │───→│ ② 溯源    │───→│ ③ 叙事    │───→│ ④ 反思    │
 │ 真/误报   │    │ 还原链路  │    │ 写报告    │    │ 找漏洞    │
 └──────────┘    └──────────┘    └──────────┘    └──────────┘
       ↑                                               │
       └──────────── 发现新疑点，回环重做 ───────────────┘
```

### 6.2 各阶段详述

#### ① 研判 — 真报还是误报

**输入**：告警列表 + neighbors 周边事件 + 用户关键信息  
**输出**：每条告警标记 + 理由  

| 判定 | 含义 | 触发条件示例 |
|------|------|-------------|
| `true_positive` | 确认攻击 | 异常外连 C2 + 进程创建 + 文件写入 |
| `false_positive` | 误报 | 内部扫描器定期巡检 / 已知 Pentest 团队 IP |
| `uncertain` | 不确定 | 证据不足，需更多日志 |

误报判定必须给出具体理由，如：
> `false_positive`：src.ip=10.0.5.100 为内部 Nessus 扫描器，其 User-Agent 和扫描模式与历史记录一致。时间窗口内无后续异常行为。

#### ② 溯源 — 拼出攻击链

**输入**：所有 `true_positive` 事件，按时间线排列  
**输出**：ATT&CK 战术映射的攻击步骤，每个步骤标注证据事件 ID

```
初始访问 (T1566): [event-001] 钓鱼邮件附件 macro_doc.xlsm 被打开
      │
执行 (T1059.001): [event-003] PowerShell -enc <base64> 执行下载脚本
      │
持久化 (T1053.005): [event-007] schtasks /create 创建 C2 回连计划任务
      │
发现 (T1082):      [event-012] net view /domain 探测域环境
      │
横向移动 (T1021.001): [event-015] mstsc → dc-01:3389 使用窃取凭据
      │
目标达成 (T1003.001): [event-018] lsass.exe dump → DCSync → 域凭据导出
```

#### ③ 叙事 — 安全事件报告

生成人类可读的完整报告，包含：

- **执行摘要**：一句话概括攻击事件
- **攻击时间线**：按时间排序的行为描述 + 对应日志
- **受影响资产清单**：主机名/IP/影响程度
- **攻击者 TTP 摘要**：使用的战术技术
- **IOC 清单**：提取的全部失陷指标
- **处置建议**：遏制、根除、恢复措施
- **防护建议**：规则升级、检测覆盖缺口

#### ④ 反思 — 审查分析质量

强制 Agent 反问自己：

- 是否存在归因错误？（如：把两起独立事件合并为一个攻击链）
- 有没有遗漏关键日志？（时间窗口是否足够？是否缺了其他数据源？）
- 置信度是否足够？不足够应补充什么数据？
- 是否存在其他合理解释？（如：红队演练、内部运维操作）
- 本案例应生成什么 Sigma 规则来提升检测覆盖？

反思完成后，如果发现新疑点，回环到 ② 溯源阶段重新分析。

### 6.3 交互方式

**ailogx chat（对话模式）：**
```bash
$ ailogx chat alerts.jsonl

[Agent] 已加载 847 条告警。请描述你的调查需求。

You > 重点关注 45.33.32.156 这个 IP 相关的告警

[Agent] 提取到 23 条相关告警，已按时间线排列。开始研判...

        ① 研判阶段 ─────────────────────────────
        ⚠️  true_positive: 12 条 — 异常外连/横向移动/凭据访问
        ✓   false_positive: 8 条 — 内部扫描器/已知服务
        ❓  uncertain: 3 条 — 证据不足
        
        ② 溯源阶段 ─────────────────────────────
        [攻击链图]
        
        ③ 叙事阶段 ─────────────────────────────
        [生成报告中...]
        
        ④ 反思阶段 ─────────────────────────────
        - 检测覆盖缺口：缺少进程创建日志，可能导致执行阶段遗漏
        - 建议补充 Windows Sysmon 日志后重新分析
        - 置信度：高 (85%)
        
        是否将 IOC 入库？[Y/n] 是否存档案例？[Y/n]
```

**ailogx ask（管道模式）：**
```bash
echo "这个 IP 45.33.32.156 的真实威胁等级？" | ailogx ask alerts.jsonl
# 输出简短结论（JSON），适合脚本
```

### 6.4 Agent Tool 能力

LLM Agent 内部可调用以下工具：

| Tool | 功能 |
|------|------|
| `read_events` | 读取原始统一事件 |
| `search_events` | 按 IP/域名/端口/进程名搜索事件 |
| `timeline` | 构建指定资产的时间线 |
| `query_kb` | 搜索本地知识库（IOC/案例/规则） |
| `query_rules` | 搜索 Sigma 规则库 |
| `attck_lookup` | 查询 MITRE ATT&CK 矩阵 |
| `generate_rule` | 自动生成 Sigma 规则草稿 |

---

## 7. 知识沉淀引擎

### 7.1 知识库结构

```
~/.ailogx/kb/
├── iocs.db                    # IOC 数据库 (SQLite)
├── rules/local/               # 自产 Sigma 规则
├── ti/                        # 威胁情报
│   ├── apt/                   #   APT 组织 TTP
│   ├── malware/               #   恶意软件特征
│   └── campaigns/             #   攻击活动
└── cases/                     # 历史案例
    └── 2026-06-10-rdp-brute/
        ├── timeline.json      #   攻击时间线
        ├── iocs.json          #   提取的 IOC
        ├── report.md          #   分析报告
        └── verdict.json       #   研判结论
```

### 7.2 三条自动沉淀路径

#### 路径一：IOC 自动入库

LLM 分析完成后自动从日志中提取 IOC：

```
提取到 12 条 IOC：
  IP:      45.33.32.156 (C2), 103.224.182.253 (扫描器)
  Domain:  update-win[.]com, evil-cdn[.]xyz
  Hash:    e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (dropper)
  URL:     http://evil-cdn[.]xyz/payload.dll
  UA:      Mozilla/5.0 (compatible; EvilBot/2.0)

是否存入 iocs.db？[Y/n]
```

IOC 入库字段：
| 字段 | 说明 |
|------|------|
| type | ip / domain / hash / url / ua / filename |
| value | IOC 值 |
| category | c2 / scanner / phishing / malware / tool |
| confidence | high / medium / low |
| source_event | 关联事件 ID |
| first_seen | 首次发现时间 |
| last_seen | 最后发现时间 |
| tags | 自定义标签 |

后续 `parse` 和 `detect` 自动匹配 IOC 库，命中时丰富告警。

#### 路径二：规则反哺

当 LLM 确认真实攻击，且现有 Sigma 规则未覆盖关键行为时，自动生成规则草稿：

```yaml
title: PowerShell Download Cradle from Known C2
id: <auto-generated-uuid>
status: experimental
author: ailogx
date: 2026-06-10
description: Detects PowerShell download cradle connecting to confirmed C2 45.33.32.156
references:
  - internal case 2026-06-10-rdp-brute
logsource:
  category: process_creation
  product: windows
detection:
  selection_cmd:
    CommandLine|contains:
      - 'Net.WebClient'
      - 'DownloadFile'
      - 'DownloadString'
  selection_parent:
    ParentImage|endswith: '\wscript.exe'
  condition: selection_cmd and selection_parent
falsepositives:
  - Legitimate administrative scripts
level: high
tags:
  - attack.t1059.001
  - attack.execution
```

存入 `kb/rules/local/`，状态 `experimental`，用户审核后提升为 `stable`。

#### 路径三：案例归档

每次 chat 分析完成后自动打案例包：

```bash
ailogx kb case save                    # 保存当前分析为案例
ailogx kb case list                    # 列出所有历史案例
ailogx kb case show 2026-06-10-rdp    # 查看特定案例
```

未来分析时，LLM 可检索历史案例做类比。存储轻量化（JSON + Markdown），一个案例 < 1MB。

### 7.3 kb 子命令

```bash
ailogx kb ioc list --type ip --confidence high     # 列出高危 IOC
ailogx kb ioc check 45.33.32.156                   # 快速查 IOC
ailogx kb ioc import threat_intel.csv               # 批量导入
ailogx kb ioc purge --older-than 90d                # 清理过期 IOC
ailogx kb case list --tag apt29                     # 按标签查案例
ailogx kb case show <id>                            # 查看案例详情
ailogx kb rule list --status experimental           # 查看待审核规则
ailogx kb rule review <id>                          # 审核 AI 规则 → stable
ailogx kb rule push <id>                            # 推送规则到社区
ailogx kb stats                                     # 知识库统计
```

---

## 8. 技术选型建议

| 层 | 推荐方案 | 理由 |
|----|---------|------|
| 语言 | Go | 单二进制分发，无运行时依赖，管道性能好 |
| 日志解析 | 内置 + wasm 插件 | Go 原生高效；wasm 支持多语言（用户可用 Rust/Python 写解析器） |
| 规则引擎 | 自研 Sigma DSL 解释器 | Sigma 事实标准，未来考虑直接对接 pySigma |
| LLM 接入 | OpenAI 兼容 API | 支持 OpenAI / Anthropic / 本地 ollama/vllm，统一接口 |
| IOC 存储 | SQLite | 零配置，配合 FTS5 全文搜索 |
| 事件存储 | JSONL 文件 + Parquet 压缩 | 简单、可管道、可归档 |
| 配置 | TOML (`~/.ailogx/config.toml`) | 可读性好，Go 原生支持 |

### 8.1 配置文件示例

```toml
# ~/.ailogx/config.toml
[llm]
provider = "openai"              # openai / anthropic / ollama / custom
model = "gpt-4o"
api_key = "${OPENAI_API_KEY}"    # 支持环境变量
endpoint = "https://api.openai.com/v1"

[detect]
default_level = "medium"         # strict / default / loose
neighbor_window_sec = 30
rule_dirs = [
  "~/.ailogx/rules/local",
  "~/.ailogx/rules/community"
]

[kb]
ioc_expire_days = 90
auto_archive_cases = true
auto_generate_rules = true

[fetch]
sources = [
  { type = "s3", bucket = "security-logs", prefix = "2026/", region = "ap-east-1" },
  { type = "elastic", endpoint = "https://es.internal:9200", index = "logs-*" }
]
```

---

## 9. 演进路线

### Phase 1 — 核心可用（MVP）
- [x] `parse`：首批 10 个解析器插件（Suricata / Zeek / ModSecurity / auditd / Sysmon / CloudTrail / Falcon / Nginx / SentinelOne / Palo Alto）
- [x] `detect`：内置 Sigma 规则库 + 三档匹配策略
- [x] `chat`：四阶段 LLM Agent（研判/溯源/叙事/反思）
- [x] `kb`：IOC 入库 + 自动规则生成 + 案例归档
- [x] `ask`：管道单次分析模式

### Phase 2 — 生态扩展
- [ ] 解析器社区市场（`ailogx plugin install`）
- [ ] 支持 Loki / Splunk 直接查询
- [ ] 多平台二进制分发（Linux / macOS / Windows）
- [ ] output 格式扩展（JSON / HTML / PDF / Slack Webhook）

### Phase 3 — 智能增强
- [ ] 无监督异常检测（基线学习 + 统计偏离）
- [ ] 攻击者画像（行为聚类 → 关联已知 APT 组织）
- [ ] 多节点协同（多个 ailogx 实例共享 IOC 库）
- [ ] 告警优先级智能排序（基于资产价值 + 攻击阶段）

---

## 10. 脑暴决策记录

| 维度 | 决策 | 日期 |
|------|------|------|
| 场景 | 安全审计 | 2026-06-10 |
| 日志源 | 主流安全产品全覆盖 | 2026-06-10 |
| 部署形态 | 本地 CLI 工具（单机 pipe-friendly） | 2026-06-10 |
| 分析引擎 | 规则引擎（粗筛）+ LLM（深度分析）双引擎 | 2026-06-10 |
| 设计哲学 | 宽进严出：规则放水 → LLM 收口 | 2026-06-10 |
| LLM Agent | 四阶段强制循环：研判→溯源→叙事→反思 | 2026-06-10 |
| 知识沉淀 | IOC 入库 + 规则反哺 + 案例归档，三路径自动化 | 2026-06-10 |
| 项目语言 | Go（单二进制） | 2026-06-10 |
| 解析器扩展 | WASM 插件机制 | 2026-06-10 |
