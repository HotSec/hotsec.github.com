# 身份认证与IAM

## 身份认证概述

身份认证解决三个核心问题：

| 问题 | 阶段 | 说明 |
|------|------|------|
| 你是谁 | 身份识别 | 确认主体身份标识 |
| 你能做什么 | 授权访问 | 根据身份授予最小权限 |
| 你做了什么 | 审计追溯 | 记录所有访问行为 |

身份认证是安全体系的基石，所有访问控制、审计合规都建立在可靠的身份认证之上。

## 认证因子

### 知识因子（Something You Know）

- 密码
- PIN码
- 安全问题答案
- 易受暴力破解和钓鱼攻击

### 持有因子（Something You Have）

- 硬件Token（YubiKey）
- 手机（短信验证码/TOTP应用）
- 智能卡
- 可被窃取或丢失

### 生物因子（Something You Are）

- 指纹
- 面部识别
- 虹膜扫描
- 声纹识别
- 不可更改但存在隐私风险

### 多因子认证（MFA）

组合两种或以上不同类型因子：

```
MFA强度 = 因子类型多样性 × 因子独立安全性

弱MFA：密码 + 短信验证码（同属可拦截通道）
强MFA：密码 + FIDO2硬件Key（独立通道+抗钓鱼）
```

| MFA方式 | 安全等级 | 抗钓鱼 | 用户体验 |
|---------|---------|--------|---------|
| 短信OTP | 低 | 否 | 高 |
| TOTP应用 | 中 | 否 | 中 |
| 推送认证 | 中高 | 部分 | 高 |
| FIDO2/WebAuthn | 高 | 是 | 中 |

## 认证协议

### SAML 2.0

```
用户 → SP(服务提供者) → IdP(身份提供者) → 认证 → SAML Assertion → SP → 授权访问
```

- 基于XML的断言
- 主要用于企业SSO
- 支持SSO和SLO
- 浏览器重定向绑定

### OAuth 2.0

授权框架，非认证协议：

| 授权模式 | 适用场景 |
|---------|---------|
| Authorization Code | Web应用（最安全） |
| Authorization Code + PKCE | SPA/移动端 |
| Client Credentials | 服务间调用 |
| Device Code | IoT设备 |
| Refresh Token | 长期访问 |

### OIDC（OpenID Connect）

在OAuth 2.0之上增加身份层：

- ID Token（JWT格式，包含用户身份信息）
- UserInfo端点
- 标准Claims（sub/name/email）
- Discovery文档（/.well-known/openid-configuration）

### Kerberos

```
Client → AS-REQ → KDC(AS) → AS-REP(TGT) → Client
Client → TGS-REQ + TGT → KDC(TGS) → TGS-REP(Service Ticket) → Client
Client → AP-REQ + Service Ticket → Service → AP-REP → 通信建立
```

- 对称密钥体系
- 依赖时间同步
- 适用于内部网络
- Active Directory底层协议

### RADIUS

- UDP协议，端口1812/1813
- 认证+授权+计费（AAA）
- 支持PAP/CHAP/EAP
- 常用于网络设备认证（VPN/WiFi/交换机）

### LDAP

- 轻量级目录访问协议
- TCP 389（明文）/ 636（TLS）
- 目录信息树（DIT）结构
- DN（Distinguished Name）唯一标识
- 常作为统一身份源

## SSO单点登录

### 同域Cookie

```
1. 用户登录 app.example.com
2. 设置Cookie域为 .example.com
3. 访问 other.example.com 自动携带Cookie
4. 局限：仅限同主域
```

### CAS（Central Authentication Service）

```
1. 访问应用A → 重定向到CAS Server
2. CAS认证 → 生成TGC（Ticket Granting Cookie）
3. 重定向回应用A + Service Ticket
4. 应用A验证ST → 授权访问
5. 访问应用B → CAS检测TGC → 直接签发ST
```

### SAML IdP

- IdP发起或SP发起
- SAML Assertion包含身份信息
- 适合企业级跨域SSO

### OIDC SSO

- 基于OIDC协议实现SSO
- IdP维护会话
- 各RP通过IdP验证身份
- 适合云原生和移动端

## IAM体系架构

### 身份生命周期

```
创建 → 配置 → 认证 → 授权 → 审计 → 回收
 │       │       │       │       │       │
入职/   属性/   MFA/    RBAC/   日志/   离职/
注册    角色    SSO     ABAC    告警    归档
```

| 阶段 | 关键操作 | 工具/技术 |
|------|---------|----------|
| 创建 | 身份供给、账号创建 | SCIM、HR系统联动 |
| 配置 | 属性设置、角色分配 | 目录服务、RBAC引擎 |
| 认证 | 身份验证、MFA | IdP、FIDO2、SSO |
| 授权 | 权限判定、访问控制 | 策略引擎、PDP |
| 审计 | 行为记录、合规检查 | SIEM、日志分析 |
| 回收 | 账号禁用、权限回收 | 自动化工作流 |

## 授权模型

### 模型对比

| 模型 | 核心概念 | 灵活性 | 复杂度 | 适用场景 |
|------|---------|--------|--------|---------|
| ACL | 资源→主体映射 | 低 | 低 | 文件系统 |
| RBAC | 角色→权限绑定 | 中 | 中 | 企业应用 |
| ABAC | 属性→策略判定 | 高 | 高 | 云平台 |
| PBAC | 策略→动态判定 | 高 | 高 | 微服务 |
| ReBAC | 关系→权限推导 | 中高 | 中 | 社交/协作 |

### RBAC

```
用户 → 角色 → 权限

RBAC0：用户-角色-权限（基础）
RBAC1：引入角色继承
RBAC2：引入约束（互斥/基数）
RBAC3：RBAC1 + RBAC2
```

### ABAC

```
策略示例：
ALLOW WHEN
  subject.role == "doctor" AND
  resource.type == "patient_record" AND
  resource.department == subject.department AND
  action == "read" AND
  environment.time IN business_hours
```

### ReBAC

基于关系推导权限：

```
用户A 是 团队X 的成员
团队X 拥有 项目Y
→ 用户A 可以读取 项目Y

关系链：member → team → project → permission
```

## 权限最小化原则与Just-In-Time访问

### 最小权限原则

- 默认无权限，按需授予
- 定期审查权限（权限卫生）
- 分离职责（SoD）
- 紧急权限需审批

### Just-In-Time（JIT）访问

```
传统模式：
  管理员 → 永久特权 → 长期风险

JIT模式：
  管理员 → 申请 → 审批 → 限时特权 → 自动回收
                    ↓
              时间窗口（如4小时）
              权限范围（如特定服务器）
              审计记录（完整操作日志）
```

| 特性 | 永久权限 | JIT访问 |
|------|---------|---------|
| 权限持续时间 | 无限期 | 限时窗口 |
| 攻击面 | 大 | 小 |
| 审计复杂度 | 高 | 低 |
| 合规性 | 难以证明 | 天然合规 |
| 运维效率 | 高（无需审批） | 中（需审批流程） |

## 特权访问管理PAM

### PAM核心功能

```
┌─────────────────────────────────────────┐
│              PAM 体系                     │
├─────────────────────────────────────────┤
│  特权账号保管    │  密码自动轮换          │
│  会话录制        │  JIT特权提升           │
│  命令审计        │  凭证注入              │
│  审批工作流      │  风险分析              │
└─────────────────────────────────────────┘
```

### PAM实施要点

- 发现和盘点所有特权账号
- 集中保管和轮换凭证
- 所有特权会话代理和录制
- 基于审批的特权提升
- 异常行为检测和告警
- 定期合规报告

## 联邦身份与目录服务

### Active Directory

- 域控制器（DC）架构
- Kerberos + NTLM认证
- Group Policy集中管理
- 林/域/OU层级结构
- AD CS证书服务
- AD FS联合身份

### LDAP目录服务

```
DIT结构示例：
dc=example,dc=com
├── ou=people
│   ├── uid=zhangsan
│   └── uid=lisi
├── ou=groups
│   ├── cn=admins
│   └── cn=devops
└── ou=services
    └── cn=app1
```

### SCIM（System for Cross-domain Identity Management）

- RESTful API标准
- 自动化身份供给/撤销
- 跨域用户同步
- 支持Create/Read/Update/Delete/Delete by filter
- 减少手动账号管理

## 云IAM实践

### AWS IAM

```
策略结构：
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject"],
    "Resource": "arn:aws:s3:::my-bucket/*",
    "Condition": {
      "IpAddress": {"aws:SourceIp": "10.0.0.0/8"}
    }
  }]
}

核心概念：
- User / Group / Role / Policy
- 信任策略（AssumeRole）
- 实例配置文件
- 服务-linked角色
```

### Azure RBAC

```
角色定义结构：
{
  "Name": "Storage Reader",
  "Actions": ["Microsoft.Storage/storageAccounts/read"],
  "NotActions": [],
  "DataActions": [],
  "AssignableScopes": ["/subscriptions/{id}"]
}

层级：管理组 → 订阅 → 资源组 → 资源
角色：所有者/贡献者/读者/自定义角色
```

### GCP IAM

```
策略结构：
{
  "bindings": [{
    "role": "roles/storage.objectViewer",
    "members": ["user:alice@example.com"],
    "condition": {
      "title": "business_hours",
      "expression": "request.time.getHours('Asia/Shanghai') >= 9"
    }
  }]
}

特色：
- Organization → Folder → Project → Resource
- IAM Conditions（CEL表达式）
- Workload Identity（K8s联动）
- IAM Recommender（权限优化建议）
```

### 三家云IAM对比

| 特性 | AWS IAM | Azure RBAC | GCP IAM |
|------|---------|------------|---------|
| 策略语言 | JSON | JSON | JSON |
| 条件支持 | 丰富 | 中等 | CEL表达式 |
| 层级模型 | 账号/组织 | 管理组/订阅 | 组织/文件夹 |
| 临时凭证 | STS | Managed Identity | Service Account |
| 权限分析 | IAM Access Analyzer | Privileged Identity Management | IAM Recommender |
| 拒绝优先 | 显式Deny | 显式Deny | 显式Deny |

## 常见攻击与防御

### 凭证填充（Credential Stuffing）

```
攻击流程：
泄露账号密码 → 自动化尝试 → 批量登录 → 账户接管

防御：
- MFA强制启用
- 登录异常检测（IP/设备/地理位置）
- 速率限制和CAPTCHA
- 凭证泄露监控（Have I Been Pwned API）
- 设备指纹识别
```

### Pass-the-Hash

```
攻击流程：
获取LM/NTLM哈希 → 直接使用哈希认证 → 横向移动

防御：
- 禁用NTLM，强制Kerberos
- 最小权限原则
- 凭证保护（Credential Guard）
- LAPS本地管理员密码管理
- 网络分段限制横向移动
```

### Golden Ticket

```
攻击流程：
获取krbtgt哈希 → 伪造TGT → 任意身份访问 → 域控持久化

防御：
- krbtgt账号定期重置密码（双次重置）
- 域控加固和监控
- 异常TGT检测（生命周期/加密类型）
- AD CS审计
- 定期域安全评估
```

### Token窃取

```
攻击流程：
进程内存提取Token → 模拟合法Token → 提权/横向移动

防御：
- Token绑定（Token Binding）
- 条件访问策略
- Token短有效期 + Refresh Token轮换
- 异常Token使用检测
- 设备信任评估
```

### 攻击防御总览

| 攻击类型 | 核心利用 | 关键防御 |
|---------|---------|---------|
| 凭证填充 | 密码复用 | MFA + 异常检测 |
| Pass-the-Hash | 哈希直接认证 | 禁用NTLM + Credential Guard |
| Golden Ticket | krbtgt哈希 | 定期重置 + 监控 |
| Token窃取 | 进程内存Token | Token绑定 + 短有效期 |
