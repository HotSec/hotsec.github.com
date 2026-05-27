# Anthropic-Cybersecurity-Skills：754 个网络安全技能库

Anthropic-Cybersecurity-Skills 是一个刚开源三个月就冲到 8401 Stars 的项目，它解决了 AI Agent 在网络安全领域的致命短板：**给 Agent 提供资深安全分析师的 Playbook，而不是碎片化的代码片段**。

> 项目地址：https://github.com/mukul975/Anthropic-Cybersecurity-Skills

---

## 一、项目核心价值

### 1.1 解决的痛点

| 问题 | 传统方式 | 此项目 |
|------|---------|--------|
| 初级分析师知道 | 用什么 Volatility3 插件、什么 Sigma 规则、如何评估云泄露 | AI 不知道——除非喂技能 |
| 现有安全库 | Wordlists、Payloads、Exploit Code（碎片化代码） | 结构化决策流程（Playbook） |
| 框架映射 | 无或单一框架 | 五框架统一映射 |

### 1.2 核心特色：五框架统一映射

每个技能同时映射到 **五个主流安全框架**：

| 框架 | 版本 | 覆盖范围 |
|------|------|---------|
| MITRE ATT&CK | v18 | 14 tactics · 200+ techniques |
| NIST CSF | 2.0 | 6 functions · 22 categories |
| MITRE ATLAS | v5.4 | 16 tactics · 84 techniques |
| MITRE D3FEND | v1.3 | 7 categories · 267 techniques |
| NIST AI RMF | 1.0 | 4 functions · 72 subcategories |

**示例映射**：技能 `analyzing-network-traffic-of-malware`

- ATT&CK: T1071
- NIST CSF: DE.CM
- ATLAS: AML.T0047
- D3FEND: D3-NTA
- AI RMF: MEASURE-2.6

---

## 二、26 个安全领域全覆盖

| 领域 | 技能数 | 核心能力 |
|------|-------|---------|
| 云安全 | 60 | AWS/Azure/GCP 加固、CSPM、云取证 |
| 威胁狩猎 | 55 | 假设驱动狩猎、LOTL 检测、行为分析 |
| 威胁情报 | 50 | STIX/TAXII、MISP、行为画像 |
| Web 安全 | 42 | OWASP Top 10、SQLi、XSS、SSRF |
| 网络安全 | 40 | IDS/IPS、防火墙规则、流量分析 |
| 恶意软件分析 | 39 | 静态/动态分析、逆向工程 |
| 数字取证 | 37 | 内存取证、时间线重建 |
| 安全运营 | 36 | SIEM 关联、告警分流 |
| IAM | 35 | IAM 策略、零信任身份、Okta |
| SOC 运营 | 33 | Playbooks、演练指标 |
| 容器安全 | - | - |
| OT/ICS 安全 | - | - |
| API 安全 | - | - |
| 漏洞管理 | - | - |
| 应急响应 | - | - |
| 红队演练 | - | - |
| 渗透测试 | - | - |
| 其他（总计 26 个） | - | - |

---

## 三、安装与使用

### 3.1 安装（两行命令）

```bash
npx skills add mukul975/Anthropic-Cybersecurity-Skills
```

或者：

```bash
git clone https://github.com/mukul975/Anthropic-Cybersecurity-Skills.git
```

### 3.2 兼容平台

- Claude Code
- GitHub Copilot
- Cursor
- Gemini CLI
- OpenAI Codex CLI
- Devin
- Replit Agent
- 26+ agentskills.io 标准兼容平台

---

## 四、AI Agent 实际工作流示例

### 场景：分析内存转储，检测凭据窃取

**用户提示**：
```
分析这个内存转储，检测凭据窃取迹象
```

**Agent 内部流程**：

1. **匹配识别**：扫描 754 个技能 frontmatter（各约 30 tokens），通过 tags/description/domain 匹配识别出 12 个相关技能
2. **加载执行**：加载前 3 个：
   - `performing-memory-forensics-with-volatility3`
   - `hunting-for-credential-dumping-lsass`
   - `analyzing-windows-event-logs-for-credential-access`
3. **执行步骤**：运行 Volatility3 插件、检查 LSASS 访问模式、关联事件日志
4. **验证结果**：确认 IOCs，映射到 ATT&CK T1003

**关键价值**：没有这些技能，Agent 会乱猜工具命令、漏掉关键步骤；有了它们，它遵循的是资深 DFIR 分析师同样的 Playbook。

---

## 五、与传统安全工具库对比

| 维度 | 传统安全工具库 | Anthropic-Cybersecurity-Skills |
|------|---------------|--------------------------------|
| 内容形式 | Wordlists、Payloads、Exploit Code | 结构化技能定义 |
| 框架映射 | 无或单一框架 | 五框架统一映射 |
| AI 适配 | 无 | agentskills.io 标准 |
| 工作流程 | 碎片化 | 完整决策流程 |
| 合规价值 | 无 | 直接对应五大框架 |

**核心区别**：传统库给的是**代码片段**，这个库给的是**决策流程**。

---

## 六、MITRE ATT&CK 覆盖

| 覆盖强度 | Tactics |
|---------|---------|
| Strong | Reconnaissance、Initial Access、Execution、Persistence、Privilege Escalation、Defense Evasion、Credential Access、Lateral Movement、Command and Control、Exfiltration、Impact |
| Moderate | Resource Development、Discovery、Collection |

> 注意：ATT&CK v19 在 2026 年 4 月 28 日发布，把 Defense Evasion 拆成了 Stealth 和 Impair Defenses 两个新战术，技能映射将在后续版本更新。

---

## 七、NIST CSF 2.0 对齐

每个功能的技能分布：

| 功能 | 技能数 |
|------|-------|
| Govern (GV) | 30+ |
| Identify (ID) | 120+ |
| Protect (PR) | 150+ |
| Detect (DE) | 200+ |
| Respond (RS) | 160+ |
| Recover (RC) | 40+ |

NIST CSF 2.0 在 2024 年 2 月新增了 Govern 功能，范围从关键基础设施扩展到所有组织。技能映射对齐了全部 22 个类别。

---

## 八、Token 成本优化设计

- 每个技能的 frontmatter 只有约 **30 tokens**
- 完整加载需要 **500-2000 tokens**
- 渐进式披露架构让 Agent 能在单次扫描中搜索所有 754 技能，**不会炸掉上下文窗口**

---

## 九、适用人群

- AI Agent 开发者：想让 Agent 具备安全分析师能力
- 安全团队 Leader：需要标准化安全操作流程
- SOC 运营人员：需要 Playbooks 和演练指标
- 红队/蓝队成员：需要技术参考和对抗演练
- 合规团队：需要框架映射证据

---

## 十、商业机会

项目作者在推进几个方向：

- Casky.ai Playground：无安装，直接体验
- 企业版定制：针对特定组织需求
- 认证体系：技能熟练度认证

> 全球网络安全人才缺口在 2024 年达到 480 万（ISC2 数据）。AI Agent 能填补这个缺口，前提是给它结构化的领域知识。

---

## 十一、技能库结构

每个技能符合 agentskills.io 标准，包含：

| 部分 | 说明 |
|------|------|
| Frontmatter | 约 30 tokens，包含 tags/description/domain，用于快速匹配 |
| Workflow | 完整决策流程步骤 |
| Verification | 验证结果的方法 |
| Framework Mapping | 五大框架的具体映射 |
