# PKI公钥基础设施

## PKI概述

PKI（Public Key Infrastructure，公钥基础设施）是通过数字证书管理公钥，实现信息加密、身份认证、数据完整性验证和不可否认性的安全基础设施体系。

### 核心能力

| 能力 | 实现方式 | 应用场景 |
|------|----------|----------|
| 身份认证 | 数字证书绑定实体身份 | HTTPS、mTLS、代码签名 |
| 数据加密 | 公钥加密/私钥解密 | 邮件加密、密钥协商 |
| 完整性验证 | 数字签名 | 软件分发、文档签名 |
| 不可否认性 | 私钥签名无法抵赖 | 电子合同、交易签名 |

### 信任建立原理

```
非对称加密基础
├── 公钥 → 公开分发，用于加密和验证签名
├── 私钥 → 私密保存，用于解密和生成签名
│
PKI信任链
├── 根CA自签名证书 → 信任锚点
├── 中间CA证书 → 由根CA签发
└── 终端实体证书 → 由中间CA签发

验证流程
证书验证 → 逐级验证签名 → 回溯至信任锚 → 建立信任
```

## 核心组件

| 组件 | 全称 | 职责 |
|------|------|------|
| CA | Certificate Authority（证书机构） | 签发/管理/撤销数字证书 |
| RA | Registration Authority（注册机构） | 证书申请身份审核与注册 |
| 证书库 | Certificate Repository | 存储已签发证书供查询下载 |
| CRL | Certificate Revocation List（证书撤销列表） | 发布已撤销证书列表 |
| OCSP | Online Certificate Status Protocol（在线证书状态协议） | 实时查询证书状态 |
| 终端实体 | End Entity | 证书持有者/使用者 |

### 组件交互关系

```
终端实体 → RA → CA → 证书库
  │                │
  │                └──→ CRL/OCSP（撤销信息发布）
  │
  └──→ 证书库（获取证书）
  └──→ CRL/OCSP（验证证书状态）
```

### CA层级

```
根CA（Root CA）
├── 自签名证书
├── 离线保存，最高安全级别
└── 仅签发中间CA证书
    │
    ├── 中间CA（Intermediate CA）
    │   ├── 由根CA签发
    │   ├── 在线运营
    │   └── 签发终端实体证书或下级中间CA
    │
    └── 签发CA（Issuing CA）
        ├── 最底层中间CA
        └── 直接签发终端实体证书
```

## 数字证书结构

### X.509 v3 证书字段

```
Certificate
├── 版本（Version）
│   └── v3（当前通用版本）
│
├── 序列号（Serial Number）
│   └── CA内唯一标识，用于撤销和追踪
│
├── 签名算法（Signature Algorithm）
│   ├── sha256WithRSAEncryption
│ ├── ecdsa-with-SHA256
│   └── sm3WithSM2（国密）
│
├── 颁发者（Issuer）
│   └── 签发CA的DN（Distinguished Name）
│       ├── CN=Let's Encrypt Authority X3
│       ├── O=Let's Encrypt
│       └── C=US
│
├── 有效期（Validity）
│   ├── Not Before（生效时间）
│   └── Not After（过期时间）
│
├── 主体（Subject）
│   └── 证书持有者的DN
│       ├── CN=example.com
│       ├── O=Example Inc.
│       └── C=CN
│
├── 主体公钥信息（Subject Public Key Info）
│   ├── 算法标识符
│   └── 公钥值
│
└── 扩展（Extensions）
    ├── 基本约束（Basic Constraints）
    ├── 密钥用途（Key Usage）
    ├── 扩展密钥用途（Extended Key Usage）
    ├── 主体备用名称（Subject Alternative Name）
    ├── CRL分发点（CRL Distribution Points）
    ├── 颁发机构信息访问（AIA）
    ├── 主体密钥标识符（SKI）
    └── 颁发机构密钥标识符（AKI）
```

### 关键扩展详解

| 扩展 | OID | 说明 |
|------|-----|------|
| Basic Constraints | 2.5.29.19 | 标识CA证书或终端实体证书，CA证书含路径长度约束 |
| Key Usage | 2.5.29.15 | digitalSignature / nonRepudiation / keyEncipherment / dataEncipherment / keyAgreement / keyCertSign / cRLSign |
| Extended Key Usage | 2.5.29.37 | serverAuth / clientAuth / codeSigning / emailProtection / timeStamping |
| SAN | 2.5.29.17 | DNS名称/IP地址/邮箱/URI，替代CN成为域名验证标准 |
| CRL Distribution Points | 2.5.29.31 | CRL下载地址，用于证书撤销检查 |
| AIA | 1.3.6.1.5.5.7.1.1 | CA Issuers（获取颁发者证书）/ OCSP（在线状态查询） |
| SKI | 2.5.29.14 | 主体公钥的唯一标识，用于证书链构建 |
| AKI | 2.5.29.35 | 颁发者公钥标识，关联颁发者证书 |

### 证书PEM编码

```
-----BEGIN CERTIFICATE-----
Base64编码的DER证书数据
-----END CERTIFICATE-----

-----BEGIN PRIVATE KEY-----
Base64编码的私钥数据
-----END PRIVATE KEY-----

-----BEGIN CERTIFICATE REQUEST-----
Base64编码的CSR数据
-----END CERTIFICATE REQUEST-----
```

## 证书链与信任模型

### 单根CA模型

```
Root CA（自签名）
  └── Intermediate CA
      └── End Entity Certificate

验证路径：End Entity → Intermediate → Root（信任锚）
```

### 中间CA模型

```
Root CA（离线）
  ├── Intermediate CA 1
  │   ├── Server Cert A
  │   └── Server Cert B
  └── Intermediate CA 2
      ├── Server Cert C
      └── Server Cert D

优势：根CA离线保护，中间CA可按业务/地域划分
```

### 交叉认证

```
CA-A Root ←→ CA-B Root
  │              │
  └── Cert-A     └── Cert-B

CA-A签发证书给CA-B的公钥
CA-B签发证书给CA-A的公钥
→ 两个独立PKI域建立信任关系
```

### 桥CA模型

```
         Bridge CA
        /    |    \
   CA-A   CA-B   CA-C
    │       │       │
  用户A   用户B   用户C

桥CA不直接签发终端证书
仅作为不同PKI域之间的信任桥梁
典型应用：联邦PKI
```

### 证书链验证过程

```
1. 获取证书链
   终端证书 → 中间CA证书 → 根CA证书

2. 逐级验证
   ├── 验证签名（用上级公钥验证下级证书签名）
   ├── 验证有效期
   ├── 验证Basic Constraints（CA:TRUE + 路径长度）
   ├── 验证Key Usage（keyCertSign）
   └── 验证AKI/SKI匹配

3. 检查撤销状态
   ├── CRL检查
   └── OCSP检查

4. 回溯至信任锚
   └── 根证书在系统信任库中 → 信任建立
```

## 证书生命周期

```
申请 → 验证 → 签发 → 部署 → 监控 → 续期 → 撤销

┌─────────────────────────────────────────────────┐
│  申请阶段                                        │
│  ├── 生成密钥对                                   │
│  ├── 构造CSR（Certificate Signing Request）       │
│  │   ├── 主体DN                                  │
│  │   ├── 公钥                                    │
│  │   ├── 扩展属性                                │
│  │   └── 签名                                    │
│  └── 提交至RA/CA                                  │
│                                                   │
│  验证阶段                                        │
│  ├── DV：验证域名控制权（DNS TXT/HTTP文件/邮箱）    │
│  ├── OV：验证组织身份（营业执照/电话核实/DUNS）     │
│  └── EV：严格组织验证（律师意见书/物理验证）        │
│                                                   │
│  签发阶段                                        │
│  ├── CA验证CSR签名                                │
│  ├── CA签发证书                                   │
│  └── 发布至证书库                                  │
│                                                   │
│  部署阶段                                        │
│  ├── 安装证书至服务器                              │
│  ├── 配置中间CA证书链                              │
│  └── 配置私钥权限                                  │
│                                                   │
│  监控阶段                                        │
│  ├── 有效期监控                                    │
│  ├── 撤销状态监控                                  │
│  └── 配置合规检查                                  │
│                                                   │
│  续期阶段                                        │
│  ├── 到期前续期（通常30天内）                       │
│  ├── 可复用密钥对或生成新密钥对                     │
│  └── 重新部署证书                                  │
│                                                   │
│  撤销阶段                                        │
│  ├── 密钥泄露                                     │
│  ├── 证书信息变更                                  │
│  ├── 业务终止                                     │
│  └── CA主动撤销                                    │
└─────────────────────────────────────────────────┘
```

### CSR关键字段

```
Certificate Signing Request (CSR)
├── Version: 0 (PKCS#10)
├── Subject
│   ├── CN = example.com
│   ├── O = Example Inc.
│   ├── L = Beijing
│   ├── ST = Beijing
│   └── C = CN
├── Subject Public Key Info
│   ├── Algorithm: RSA 2048 / ECDSA P-256
│   └── Public Key: ...
├── Attributes
│   └── Extension Request
│       ├── subjectAltName = DNS:example.com, DNS:*.example.com
│       ├── keyUsage = digitalSignature, keyEncipherment
│       └── extendedKeyUsage = serverAuth
└── Signature Algorithm: sha256WithRSA
```

## CRL vs OCSP vs OCSP Stapling

| 维度 | CRL | OCSP | OCSP Stapling |
|------|-----|------|---------------|
| 全称 | Certificate Revocation List | Online Certificate Status Protocol | OCSP Stapling / TLS Certificate Status Request |
| 机制 | 下载完整撤销列表 | 实时查询单张证书状态 | 服务器定期获取OCSP响应并附带在TLS握手 |
| 实时性 | 低（CRL更新周期通常数小时至数天） | 高（实时查询） | 中（服务器定期刷新，通常1小时以内） |
| 隐私 | 不暴露用户访问行为 | 暴露用户访问的站点 | 不暴露（OCSP请求由服务器发起） |
| 性能 | CRL文件可能很大 | 每次握手额外RTT | 无额外RTT，响应附带在握手 |
| 缓存 | 客户端缓存CRL | 客户端可缓存OCSP响应 | 服务器缓存OCSP响应 |
| 可用性 | CRL不可用时影响有限 | OCSP不可用时可能拒绝连接 | 降级为普通CRL/OCSP检查 |
| 协议 | HTTP下载PEM/DER文件 | HTTP+OCSP协议 | TLS扩展（status_request） |

### CRL结构

```
Certificate Revocation List
├── Version: v2
├── Signature Algorithm: sha256WithRSA
├── Issuer: CN=Example CA
├── This Update: 2025-01-01 00:00:00 UTC
├── Next Update: 2025-01-08 00:00:00 UTC
├── Revoked Certificates
│   ├── Serial: 0x1234, Revocation Date: 2024-12-15, Reason: keyCompromise
│   ├── Serial: 0x5678, Revocation Date: 2024-12-20, Reason: superseded
│   └── Serial: 0x9ABC, Revocation Date: 2024-12-25, Reason: cessationOfOperation
└── CRL Extensions
    ├── CRL Number
    └── Authority Key Identifier
```

### OCSP请求与响应

```
OCSP Request
├── Request List
│   └── CertID
│       ├── Hash Algorithm
│       ├── Issuer Name Hash
│       ├── Issuer Key Hash
│       └── Serial Number
└── Optional Signature

OCSP Response
├── Response Status
│   ├── successful
│   ├── malformedRequest
│   ├── internalError
│   ├── tryLater
│   ├── unauthorized
│   └── sigRequired
│
├── Response Data (when successful)
│   ├── CertID
│   ├── Cert Status
│   │   ├── good（有效）
│   │   ├── revoked（已撤销+撤销时间+原因）
│   │   └── unknown（未知）
│   ├── This Update
│   ├── Next Update
│   └── Signature
```

### OCSP Stapling工作流程

```
1. 服务器定期向OCSP Responder查询自身证书状态
   Server → OCSP Responder: OCSP Request
   OCSP Responder → Server: OCSP Response (signed)

2. 客户端发起TLS握手
   Client → Server: ClientHello (status_request extension)

3. 服务器在ServerHello后发送证书+OCSP响应
   Server → Client: Certificate + CertificateStatus (OCSP Response)

4. 客户端验证OCSP响应签名和时效性
   无需额外向OCSP Responder发起请求
```

## 证书类型

### 按验证级别分类

| 类型 | 验证内容 | 签发时间 | 浏览器标识 | 适用场景 |
|------|----------|----------|------------|----------|
| DV | 域名控制权 | 分钟级 | 锁头图标 | 个人网站、博客 |
| OV | 组织身份+域名 | 1-3天 | 锁头图标+组织信息 | 企业官网、SaaS |
| EV | 严格组织验证 | 3-7天 | 历史绿色地址栏 | 金融机构、支付 |

### 按用途分类

| 类型 | 用途 | Key Usage | Extended Key Usage |
|------|------|-----------|-------------------|
| TLS/SSL服务器证书 | HTTPS加密 | digitalSignature, keyEncipherment | serverAuth |
| 客户端证书 | 客户端认证 | digitalSignature | clientAuth |
| 代码签名证书 | 软件签名 | digitalSignature | codeSigning |
| S/MIME证书 | 邮件加密签名 | digitalSignature, keyEncipherment | emailProtection |
| 时间戳证书 | 时间戳签名 | digitalSignature | timeStamping |
| CA证书 | 签发下级证书 | keyCertSign, cRLSign | — |

### 代码签名证书

```
代码签名证书
├── 标准代码签名
│   ├── 验证组织身份
│   └── 签名后软件显示发布者名称
│
└── EV代码签名
    ├── 严格组织验证+硬件令牌
    ├── 即时获得SmartScreen信誉
    └── 签名后立即无警告运行
```

## 常见CA

| CA | 类型 | 特点 |
|----|------|------|
| Let's Encrypt | 免费、自动化 | ACME协议、90天有效期、仅DV证书、广泛信任 |
| DigiCert | 商业 | 高端品牌、OV/EV证书、收购Symantec证书业务 |
| GlobalSign | 商业 | 老牌CA、OV/EV/代码签名、企业级服务 |
| Sectigo | 商业 | 性价比高、前身Comodo、全类型证书 |
| Entrust | 商业 | 企业级PKI解决方案、政府/金融客户 |
| Cloudflare | 免费 | 边缘证书、Origin CA、集成CDN |
| 国密CA | 国密 | CFCA/BJCA/SHECA等，国密算法证书 |

### Let's Encrypt ACME流程

```
1. 客户端注册账户
   Client → Let's Encrypt: POST /acme/new-reg

2. 提交订单
   Client → Let's Encrypt: POST /acme/new-order
   请求域名：example.com

3. 获取验证挑战
   Let's Encrypt → Client: 返回挑战类型
   ├── HTTP-01: 在/.well-known/acme-challenge/放置验证文件
   ├── DNS-01: 在DNS添加TXT记录
   └── TLS-ALPN-01: 在TLS握手时响应验证

4. 完成验证
   Client → Let's Encrypt: 通知挑战已就绪
   Let's Encrypt → Client: 验证通过

5. 签发证书
   Client → Let's Encrypt: 提交CSR
   Let's Encrypt → Client: 签发证书

6. 自动续期
   到期前30天内自动重复2-5步
```

## 国密算法体系

### 国密算法

| 算法 | 类型 | 对标国际 | 说明 |
|------|------|----------|------|
| SM2 | 非对称加密/签名 | RSA/ECDSA | 基于椭圆曲线（256位），签名速度优于RSA |
| SM3 | 哈希算法 | SHA-256 | 输出256位摘要 |
| SM4 | 对称加密 | AES-128 | 128位分组密码 |
| SM9 | 标识密码 | IBC | 基于身份的加密，无需数字证书 |

### SM2 vs RSA vs ECDSA

| 维度 | SM2 | RSA-2048 | ECDSA P-256 |
|------|-----|----------|-------------|
| 密钥长度 | 256 bit | 2048 bit | 256 bit |
| 签名速度 | 快 | 慢 | 快 |
| 验证速度 | 快 | 快 | 快 |
| 安全强度 | 128 bit | 112 bit | 128 bit |
| 标准体系 | 国密GM/T | PKCS/RFC | SEC/RFC |

### 双证书体系

```
国密双证书体系
├── 签名证书
│   ├── 用途：数字签名、身份认证
│   ├── 算法：SM2签名 + SM3哈希
│   └── Key Usage: digitalSignature, nonRepudiation
│
└── 加密证书
    ├── 用途：密钥交换、数据加密
    ├── 算法：SM2加密 + SM4对称加密
    └── Key Usage: keyEncipherment, dataEncipherment

双证书签发流程
├── 申请者生成签名密钥对（自己保管私钥）
├── 申请者生成加密密钥对
├── 加密私钥提交CA备份（密钥托管）
├── CA签发签名证书和加密证书
└── 加密私钥由CA托管用于密钥恢复
```

### 国密TLS握手

```
ClientHello
├── 支持的密码套件：TLS_SM4_GCM_SM3
└── 支持的曲线：SM2

    ↓

ServerHello
├── 选定密码套件：TLS_SM4_GCM_SM3
└── 服务端双证书（签名证书+加密证书）

    ↓

Key Exchange
├── 客户端验证签名证书
├── 使用加密证书公钥进行密钥协商
└── 生成SM4会话密钥

    ↓

Finished
└── 使用SM4-GCM加密通信
```

## PKI实战

### HTTPS/TLS

```
Nginx配置HTTPS
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate     /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
}
```

### mTLS（双向TLS认证）

```
mTLS流程
├── 客户端验证服务端证书（标准TLS）
├── 服务端请求客户端证书（CertificateRequest）
├── 客户端发送客户端证书
├── 服务端验证客户端证书
└── 双向身份认证完成

Nginx配置mTLS
server {
    listen 443 ssl;
    server_name api.example.com;

    ssl_certificate     /etc/ssl/certs/server.crt;
    ssl_certificate_key /etc/ssl/private/server.key;

    ssl_client_certificate /etc/ssl/certs/ca.crt;
    ssl_verify_client on;
    ssl_verify_depth 2;
}

适用场景
├── 微服务间通信（Service Mesh）
├── 零信任网络
├── API网关客户端认证
└── IoT设备认证
```

### 代码签名

```
代码签名流程
├── 1. 申请代码签名证书（OV或EV）
├── 2. 使用signtool/jarsigner签名
│   ├── Windows: signtool sign /tr http://timestamp.digicert.com /td sha256 /fd sha256 /a app.exe
│   ├── Java: jarsigner -tsa http://timestamp.digicert.com -sigalg SHA256withRSA app.jar alias
│   └── macOS: codesign --timestamp --sign "Developer ID Application: Name" app.app
├── 3. 时间戳确保签名长期有效
└── 4. 用户验证签名和发布者身份

时间戳重要性
├── 签名时嵌入可信时间戳
├── 证书过期后签名仍有效（签名时证书未过期）
└── 无时间戳则证书过期后签名失效
```

### SAML

```
SAML（Security Assertion Markup Language）
├── 基于XML的联邦身份认证协议
├── 使用数字签名保证断言完整性
└── 使用XML Encryption保证断言机密性

SAML签名验证
├── IdP使用私钥签名SAML Assertion
├── SP使用IdP的公钥验证签名
├── 证书通过SAML Metadata分发
└── Metadata包含签名证书和加密证书

SAML Metadata证书配置
├── <ds:X509Certificate> 签名验证证书
├── <md:KeyDescriptor use="signing"> 签名用途
└── <md:KeyDescriptor use="encryption"> 加密用途
```

### OpenSSL常用命令

```
生成RSA私钥和CSR
openssl req -newkey rsa:2048 -nodes -keyout key.pem -out req.pem

生成EC私钥和CSR
openssl ecparam -genkey -name prime256v1 | openssl req -new -key /dev/stdin -nodes -keyout key.pem -out req.pem

自签名证书
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365

查看证书信息
openssl x509 -in cert.pem -text -noout

查看证书链
openssl s_client -connect example.com:443 -showcerts

验证证书链
openssl verify -CAfile ca.pem -untrusted intermediate.pem cert.pem

检查OCSP状态
openssl ocsp -issuer ca.pem -cert cert.pem -url http://ocsp.example.com -resp_text

检查CRL
openssl crl -in crl.pem -text -noout

证书格式转换
openssl x509 -in cert.der -inform DER -outform PEM -out cert.pem
openssl pkcs12 -export -out cert.p12 -inkey key.pem -in cert.pem -certfile ca.pem
openssl pkcs12 -in cert.p12 -nodes -out cert_and_key.pem
```
