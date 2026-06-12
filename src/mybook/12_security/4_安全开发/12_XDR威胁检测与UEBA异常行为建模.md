# XDR 威胁检测与 UEBA 异常行为建模技术

## 一、XDR（扩展检测与响应）

### 1.1 什么是 XDR

**XDR = Extended Detection and Response（扩展检测与响应）**

一种统一的安全运营平台，将来自**端点、网络、云工作负载、邮件、身份、数据**等多层安全数据整合到一个平台中，实现跨层威胁检测、调查和自动响应。

```
传统安全方案（数据孤岛）：
  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
  │ EDR  │  │ NDR  │  │ 邮件  │  │ 云   │
  │ 端点  │  │ 网络  │  │ 安全  │  │ 安全  │
  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘
     │         │         │         │
     ▼         ▼         ▼         ▼
   各自为政，无关联，告警疲劳，攻击者逐个击破

XDR 方案（统一平台）：
  ┌──────────────────────────────────────────┐
  │              XDR 统一平台                  │
  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
  │  │ 端点  │ │ 网络  │ │ 邮件  │ │ 云   │   │
  │  │ 遥测  │ │ 流量  │ │ 日志  │ │ 审计  │   │
  │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘   │
  │     └───────┴───────┴───────┘          │
  │              │                          │
  │     ┌────────┴────────┐                 │
  │     │  关联分析引擎    │                 │
  │     │  (UEBA + 规则)  │                 │
  │     └────────┬────────┘                 │
  │              │                          │
  │     ┌────────┴────────┐                 │
  │     │  自动化响应 SOAR │                 │
  │     └─────────────────┘                 │
  └──────────────────────────────────────────┘
```

### 1.2 XDR vs EDR / NDR / SIEM / SOAR

| 维度 | **EDR** | **NDR** | **SIEM** | **SOAR** | **XDR** |
|------|---------|---------|----------|----------|---------|
| 范围 | 端点 | 网络 | 日志（全量） | 编排响应 | **跨层全量** |
| 数据源 | 进程/文件/注册表 | 网络流量 | 任意日志 | SIEM 告警 | **端点+网络+云+邮件+身份** |
| 检测方式 | 行为+签名 | 流量+协议 | 规则关联 | 无检测 | **多源关联+AI** |
| 响应 | 端点隔离/杀进程 | 流量阻断 | 告警通知 | 剧本编排 | **全自动化响应** |
| 数据量 | 中 | 大 | 极大 | 中 | **极大（需数据湖）** |
| 运维复杂度 | 中 | 高 | 极高 | 中 | 中（统一平台简化） |

### 1.3 XDR 核心架构

```
┌──────────────────────────────────────────────────────────────┐
│                      XDR 平台架构                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              数据采集层（Telemetry）                    │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │   │
│  │  │Endpoint│ │Network │ │ Cloud  │ │Identity│        │   │
│  │  │(EDR)   │ │(NDR)   │ │(CWP)   │ │(IAM)   │        │   │
│  │  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘        │   │
│  │  ┌────────┐ ┌────────┐                              │   │
│  │  │ Email  │ │  Data  │                              │   │
│  │  │ Gateway│ │ (DLP)  │                              │   │
│  │  └───┬────┘ └───┬────┘                              │   │
│  └──────┼──────────┼──────────┼──────────┼──────────────┘   │
│         │          │          │          │                   │
│         └──────────┴──────────┴──────────┘                   │
│                        │                                     │
│  ┌─────────────────────┴─────────────────────────────────┐  │
│  │              数据湖 / 数据总线                          │  │
│  │        (Kafka / Elasticsearch / 对象存储)              │  │
│  └─────────────────────┬─────────────────────────────────┘  │
│                        │                                     │
│  ┌─────────────────────┴─────────────────────────────────┐  │
│  │              检测分析层                                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │ 规则引擎  │  │ UEBA引擎  │  │ 威胁情报  │            │  │
│  │  │(Sigma/   │  │(ML异常)  │  │(TI Feed) │            │  │
│  │  │ YARA)   │  │          │  │          │            │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘            │  │
│  │       └─────────────┼─────────────┘                   │  │
│  │                     ▼                                 │  │
│  │              ┌──────────────┐                         │  │
│  │              │ 关联分析引擎  │  ← 攻击链聚合             │  │
│  │              │ (Alert →     │                         │  │
│  │              │  Incident)   │                         │  │
│  │              └──────┬───────┘                         │  │
│  └─────────────────────┼─────────────────────────────────┘  │
│                        │                                     │
│  ┌─────────────────────┴─────────────────────────────────┐  │
│  │              响应编排层（SOAR）                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │ 自动隔离  │  │ 阻断进程  │  │ 重置凭证  │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 1.4 攻击链视角的检测

XDR 的核心价值：**从攻击者视角完整还原攻击链（Kill Chain）**。

```
攻击阶段          XDR 数据源              检测手段
─────────────────────────────────────────────────────────
1. 侦察           外部威胁情报            扫描探测告警
2. 武器化         邮件安全网关            恶意附件检测
3. 投递           邮件日志 + 端点        钓鱼邮件 + 文件落地
4. 利用           端点 EDR              漏洞利用行为
5. 安装           端点进程树            持久化机制（计划任务/服务）
6. C2 通信        网络流量 NDR          DNS/HTTPS 异常外联
7. 横向移动       端点 + 网络 + 身份      SMB/WMI/PsExec + 异常登录
8. 数据窃取       网络流量 + 云审计      大流量外传 + 云存储异常访问
```

### 1.5 主流 XDR 平台

| 厂商 | 产品 | 特点 |
|------|------|------|
| **Microsoft** | Defender XDR | 与 Azure/M365 深度集成，身份+端点+邮件+云 App |
| **Palo Alto** | Cortex XDR | 端点+网络+云，AI 驱动分析 |
| **CrowdStrike** | Falcon XDR | 端点原生，第三方数据接入 |
| **SentinelOne** | Singularity XDR | 端点+云+身份，自主 AI 检测 |
| **深信服** | 深信服 XDR | 国内方案，网络+端点+云端联动 |
| **奇安信** | 天眼 XDR | 国内方案，流量+端点+威胁情报 |
| **亚信安全** | AI XDR | 国内首个商用 AI XDR（2025年发布） |
| **Elastic** | Elastic Security | 开源方案，SIEM+XDR 融合 |

### 1.6 XDR 检测规则示例（Sigma 格式）

```yaml
# 检测勒索软件行为链
title: Ransomware Behavior Chain
description: 检测勒索软件典型行为：大量文件重命名 + 删除卷影副本
status: experimental
detection:
  # 大量文件重命名事件
  file_rename:
    EventID: 4663
    Accesses: "WriteData"
    # 短时间内 > 100 个文件被修改
  # 删除卷影副本
  shadow_copy_delete:
    CommandLine|contains:
      - 'vssadmin delete shadows'
      - 'wmic shadowcopy delete'
  # 时间窗口内同时发生
  condition: file_rename and shadow_copy_delete | near 5m
level: critical
```

---

## 二、UEBA（用户与实体行为分析）

### 2.1 什么是 UEBA

**UEBA = User and Entity Behavior Analytics（用户与实体行为分析）**

通过机器学习建立用户和实体（设备、服务器、应用）的**行为基线**，检测偏离基线的异常行为，发现传统规则引擎无法检测的**内部威胁、账户盗用、横向移动**等高级攻击。

> UEBA 早在 2016 年就被 Gartner 评为十大信息安全技术之一，近年已演化为横跨安全分析、数据治理、数据安全的底层分析哲学。

```
传统规则检测（Signature-based）：
  已知恶意模式 → 匹配规则 → 告警
  ❌ 无法检测未知攻击
  ❌ 无法感知内部威胁

UEBA 行为检测（Behavior-based）：
  历史行为 → 建立基线 → 实时比对 → 偏离告警
  ✅ 检测未知攻击模式
  ✅ 发现内部威胁和账户盗用
  ✅ 自适应学习，持续优化基线
```

### 2.2 UEBA 核心工作流程

```
┌─────────────────────────────────────────────────────────────┐
│                     UEBA 工作流程                             │
│                                                              │
│  Step 1: 数据采集                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 认证日志 │ 网络流量 │ 文件访问 │ 进程活动 │ VPN日志  │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  Step 2: 特征工程                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 登录时间/地点/频率 │ 文件访问量/类型 │ 网络流量/目的地 │   │
│  │ 进程链/参数        │ 外发数据量      │ 权限变更       │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  Step 3: 基线建模（ML 训练）                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐     │   │
│  │ │ 统计   │  │ 聚类   │  │ 孤立   │  │ 自编码  │     │   │
│  │ │ 模型   │  │ 分析   │  │ 森林   │  │ 器     │     │   │
│  │ └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘     │   │
│  │     └───────────┴───────────┴───────────┘          │   │
│  │                       │                             │   │
│  │                       ▼                             │   │
│  │              ┌────────────────┐                     │   │
│  │              │ 综合异常评分    │                     │   │
│  │              │ 0-100 (100=最异常)│                  │   │
│  │              └────────────────┘                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  Step 4: 异常判定与告警                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 评分 > 阈值 → 产生告警 → 关联上下文 → 风险评估         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 核心算法

#### 2.3.1 统计基线模型（Z-Score）

```python
import numpy as np

class StatisticalBaseline:
    """基于统计分布的行为基线建模"""

    def __init__(self, window_days=30):
        self.window_days = window_days
        self.baselines = {}  # {user_id: {feature: (mean, std)}}

    def train(self, user_features):
        """训练每个用户的统计基线"""
        for user_id, features in user_features.items():
            self.baselines[user_id] = {}
            for feat_name, values in features.items():
                self.baselines[user_id][feat_name] = {
                    'mean': np.mean(values),
                    'std': np.std(values),
                    'median': np.median(values),
                    'q1': np.percentile(values, 25),
                    'q3': np.percentile(values, 75)
                }

    def anomaly_score(self, user_id, current_features):
        """计算当前行为与基线的偏离程度（Z-Score）"""
        if user_id not in self.baselines:
            return 0.0

        scores = []
        for feat_name, value in current_features.items():
            base = self.baselines[user_id].get(feat_name)
            if base and base['std'] > 0:
                z_score = abs(value - base['mean']) / base['std']
                scores.append(z_score)

        return np.mean(scores) if scores else 0.0
```

#### 2.3.2 孤立森林（Isolation Forest）

```python
from sklearn.ensemble import IsolationForest

class IsolationForestDetector:
    """基于孤立森林的异常检测"""

    def __init__(self, contamination=0.05):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=contamination,  # 预期异常比例
            random_state=42
        )

    def train(self, features_matrix):
        """features_matrix: 用户行为特征矩阵，每行一个用户，每列一个特征维度"""
        self.model.fit(features_matrix)

    def detect(self, features_matrix):
        """返回: -1 = 异常, 1 = 正常"""
        predictions = self.model.predict(features_matrix)
        scores = self.model.score_samples(features_matrix)
        normalized_scores = self._normalize(scores)
        return predictions, normalized_scores

    def _normalize(self, scores):
        """将异常分数归一化到 0-100"""
        min_s, max_s = scores.min(), scores.max()
        if max_s == min_s:
            return np.zeros_like(scores)
        return 100 * (1 - (scores - min_s) / (max_s - min_s))
```

#### 2.3.3 自编码器（Autoencoder）

```python
import torch
import torch.nn as nn

class AnomalyAutoencoder(nn.Module):
    """基于自编码器的异常检测：重构误差大 = 异常"""

    def __init__(self, input_dim):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 8)    # 瓶颈层
        )
        self.decoder = nn.Sequential(
            nn.Linear(8, 32),
            nn.ReLU(),
            nn.Linear(32, 64),
            nn.ReLU(),
            nn.Linear(64, input_dim)
        )

    def forward(self, x):
        return self.decoder(self.encoder(x))

    def anomaly_score(self, x):
        """异常分数 = 重构误差（MSE）"""
        self.eval()
        with torch.no_grad():
            reconstructed = self.forward(x)
            mse = nn.functional.mse_loss(reconstructed, x, reduction='none')
            return mse.mean(dim=1).numpy()
```

### 2.4 典型检测场景

| 场景 | 检测方法 | 异常特征 |
|------|---------|---------|
| **账户盗用** | 登录行为异常 | 异常地点/IP、异常时间、设备指纹变更、短时间内多地点登录 |
| **内部数据窃取** | 文件访问异常 | 非工作时间大量访问、访问量突变、访问非职责范围文件 |
| **横向移动** | 网络 + 认证异常 | 单点登录多个主机、SMB/WMI/RDP 异常连接、新凭证访问历史未接触主机 |
| **特权滥用** | 权限操作异常 | 非工作时间提权、创建异常账户、敏感组变更 |
| **数据外泄** | 网络流量异常 | 大流量外传、非标准端口外联、DNS 隧道、云存储上传突增 |
| **离职前行为** | 综合行为异常 | 邮件转发外部 + 大量下载 + 异常登录时间组合 |

### 2.5 UEBA 特征工程

```python
# 用户行为特征向量示例
user_features = {
    # 登录维度
    'login_count_per_hour': [0, 0, 0, 0, 2, 5, 8, 12, 15, ...],  # 24小时分布
    'login_location_count': 3,        # 登录地点数
    'login_failure_rate': 0.02,       # 登录失败率
    'vpn_hours': [9, 10, 11, ...],    # VPN 连接时段

    # 文件操作维度
    'file_read_count': 150,           # 读取文件数
    'file_write_count': 20,           # 写入文件数
    'file_delete_count': 5,           # 删除文件数
    'sensitive_file_access': 3,       # 访问敏感文件数
    'file_access_after_hours': 0,     # 非工作时间访问

    # 网络维度
    'bytes_sent': 50000000,           # 外发字节数
    'bytes_received': 200000000,      # 接收字节数
    'unique_dest_ips': 45,            # 连接目标 IP 数
    'dns_query_count': 200,           # DNS 查询数
    'non_standard_port_conn': 2,      # 非标准端口连接

    # 进程维度
    'process_count': 80,              # 进程数
    'new_process_count': 3,           # 新进程数
    'cmdline_length_avg': 45,         # 平均命令行长度

    # 时间维度
    'active_hours': [9, 10, 11, 14, 15, 16],  # 活跃时段
    'session_duration_avg': 3600,     # 平均会话时长
}
```

### 2.6 异常评分融合

```python
class AnomalyScoreFusion:
    """多模型异常评分融合"""

    def __init__(self, weights=None):
        self.weights = weights or {
            'statistical': 0.3,
            'isolation_forest': 0.3,
            'autoencoder': 0.4
        }

    def fuse(self, scores):
        """
        加权融合多个模型的异常分数
        scores: {'statistical': 85, 'isolation_forest': 72, 'autoencoder': 90}
        """
        total = 0.0
        for model_name, score in scores.items():
            total += score * self.weights.get(model_name, 0.0)
        return total

    def risk_level(self, fused_score):
        """异常分数 → 风险等级"""
        if fused_score >= 80:
            return 'CRITICAL'
        elif fused_score >= 60:
            return 'HIGH'
        elif fused_score >= 40:
            return 'MEDIUM'
        elif fused_score >= 20:
            return 'LOW'
        else:
            return 'NORMAL'
```

---

## 三、XDR + UEBA 联动工作流

### 3.1 联动架构

```
┌──────────────────────────────────────────────────────────────┐
│                     XDR + UEBA 联动                            │
│                                                               │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│   │ 端点数据 │    │ 网络数据 │    │ 身份数据 │    │ 云数据  │  │
│   └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘  │
│        └──────────────┴──────────────┴──────────────┘        │
│                            │                                  │
│                            ▼                                  │
│                   ┌────────────────┐                         │
│                   │   XDR 数据湖    │                         │
│                   └───────┬────────┘                         │
│                           │                                   │
│              ┌────────────┼────────────┐                     │
│              ▼            ▼            ▼                     │
│       ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│       │ 规则引擎  │ │ UEBA引擎  │ │ 威胁情报  │               │
│       │(实时告警) │ │(行为异常) │ │(IOC匹配) │               │
│       └─────┬────┘ └─────┬────┘ └─────┬────┘               │
│             └────────────┼────────────┘                     │
│                          ▼                                   │
│                   ┌──────────────┐                          │
│                   │  关联分析引擎  │  ← 告警聚合为事件         │
│                   └──────┬───────┘                          │
│                          │                                   │
│         ┌────────────────┼────────────────┐                 │
│         ▼                ▼                ▼                 │
│   ┌──────────┐   ┌──────────┐    ┌──────────────┐         │
│   │ 自动响应  │   │ 调查面板  │    │ 安全分析师    │         │
│   │(隔离/阻断)│   │(攻击链图) │    │ (人工研判)    │         │
│   └──────────┘   └──────────┘    └──────────────┘         │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 联动场景示例

```
场景：检测数据外泄

1. UEBA 发现异常：
   - 用户 "张三" 过去30天平均下载 50MB/天
   - 今天下载了 2GB → 行为异常评分 92（CRITICAL）

2. XDR 关联分析：
   - 端点：进程 "7z.exe" 压缩了大量文件
   - 网络：端口 443 连接境外 IP（非业务相关）
   - 身份：张三的账号在非工作时间登录
   - 邮件：张三设置了邮件自动转发到外部邮箱

3. 攻击链还原：
   异常登录 → 大量文件读取 → 压缩打包 → 外发到境外服务器

4. 自动响应：
   - 隔离张三的终端
   - 禁用张三的账号
   - 阻断目标 IP 的 443 连接
   - 创建安全事件工单，通知安全团队
```

---

## 四、大模型（LLM）在 XDR/UEBA 中的应用

### 4.1 LLM 赋能的 UEBA 升级

大模型正在从三个维度升级 UEBA 能力：

| 维度 | 传统 UEBA | LLM 增强 UEBA |
|------|----------|--------------|
| 行为理解 | 数值特征建模 | 自然语言理解行为上下文 |
| 威胁研判 | 人工分析告警 | LLM 自动分析攻击链并生成报告 |
| 调查效率 | 逐条翻阅日志 | 自然语言查询 + 自动关联 |
| 误报处理 | 阈值调优 | LLM 理解业务场景，自动降噪 |

### 4.2 典型应用场景

```
1. 自然语言查询安全事件
   "上周哪些用户从非工作时间访问了敏感文件系统？"
   → LLM 翻译为 SIEM 查询 → 返回结果 → LLM 总结

2. 攻击链自动分析
   原始告警列表 → LLM 分析关联关系 → 生成攻击时间线

3. 告警研判辅助
   告警 + 上下文 → LLM 判断是否为真实威胁 → 建议响应动作
```

---

## 五、开源工具与方案

| 工具 | 类型 | 说明 |
|------|------|------|
| **Wazuh** | XDR/EDR | 开源安全监控平台，端点检测+文件完整性+合规 |
| **Elastic Security** | SIEM/XDR | ELK Stack 安全版，规则引擎+ML异常检测 |
| **Velociraptor** | EDR/取证 | 开源端点监控与数字取证 |
| **Security Onion** | NDR/XDR | 网络安全监控一体化平台 |
| **OpenSearch Security** | SIEM | AWS 开源版，替代 Elastic |
| **StreamAlert** | 实时告警 | Airbnb 开源的无服务器告警框架 |

```bash
# Wazuh 快速部署（Docker）
git clone https://github.com/wazuh/wazuh-docker.git
cd wazuh-docker/single-node
docker-compose up -d

# 集成 UEBA 能力：Wazuh + Elastic ML
# 使用 Elastic 的 anomaly detection job 做行为基线
```

---

## 六、关键指标

| 指标 | 说明 | 目标 |
|------|------|------|
| **MTTD** | 平均检测时间（Mean Time to Detect） | < 15 分钟 |
| **MTTR** | 平均响应时间（Mean Time to Respond） | < 30 分钟 |
| **告警准确率** | 真实威胁 / 总告警数 | > 80% |
| **误报率** | 误报告警 / 总告警数 | < 5% |
| **UEBA 覆盖率** | 已建模实体 / 总实体 | 100% |
| **自动化响应率** | 自动处置 / 总告警 | > 50% |

---

## 七、实施建议

### 7.1 分阶段建设

```
第一阶段（1-3 月）：数据接入
├── 接入端点 EDR 数据
├── 接入网络流量数据
├── 接入身份认证日志
└── 建立数据湖基础

第二阶段（4-6 月）：检测能力
├── 部署 Sigma 规则检测
├── 接入威胁情报 IOC
├── 建立 UEBA 统计基线
└── 告警去重与聚合

第三阶段（7-9 月）：智能分析
├── 部署 ML 异常检测模型
├── 攻击链关联分析
├── 自动化响应编排
└── 安全运营 dashboard

第四阶段（10-12 月）：持续优化
├── UEBA 模型反馈调优
├── 威胁狩猎（Threat Hunting）
├── 红蓝对抗验证
└── 指标考核与优化
```

### 7.2 常见陷阱

| 陷阱 | 解决 |
|------|------|
| 数据接入太多，存储爆炸 | 分级存储：热数据 Elasticsearch，冷数据对象存储 |
| UEBA 初始误报高 | 基线需要 30 天以上历史数据，先用统计模型后上 ML |
| 告警疲劳 | 告警聚合 + 风险评分，非高危不通知 |
| 响应不及时 | 明确自动化范围，低风险自动处置，高风险人工研判 |

---

## 八、一句话总结

> **XDR 是"统一指挥中心"，打破数据孤岛，从攻击链视角统一检测与响应；UEBA 是"行为雷达"，用 ML 建模用户和实体的正常行为基线，发现传统规则无法检测的内部威胁和高级攻击。两者的结合，构成现代安全运营的核心引擎。**

---

## 九、参考资料

1. [深信服 XDR 技术白皮书](https://www.sangfor.com.cn/knowledge/xdr)
2. [Elastic — 什么是 XDR](https://www.elastic.co/cn/what-is/xdr)
3. [Wazuh 开源 XDR 平台](https://wazuh.com/)
4. [Elastic Security 文档](https://www.elastic.co/guide/en/security/current/es-overview.html)
5. [Sigma 规则仓库](https://github.com/SigmaHQ/sigma)
6. [MITRE ATT&CK 框架](https://attack.mitre.org/)
7. [UEBA 用户及实体行为分析 — CSDN](https://blog.csdn.net/qq_41610932/article/details/136907197)