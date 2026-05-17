# Suricata 知识点总结

## 一、Suricata 概述

Suricata 是由 OISF（Open Information Security Foundation）开发的高性能开源网络入侵检测与防御系统，整合了 IDS、IPS、NSM 和 PCAP 处理四大功能。

| 功能 | 描述 |
|------|------|
| IDS | 入侵检测，监听流量匹配规则并告警 |
| IPS | 入侵防御，内联拦截恶意流量（NFQUEUE/IPFW） |
| NSM | 网络安全监控，记录会话日志和元数据 |
| PCAP | 离线分析已捕获的流量文件 |

### 与同类产品对比

| 维度 | Suricata | Snort | Zeek |
|------|----------|-------|------|
| 架构 | 多线程流水线 | 单线程/多线程插件 | 事件驱动 |
| 协议支持 | 全栈（含HTTP/TLS/DNS应用层解析） | 依赖插件，主要传输层/网络层 | 应用层聚焦，50+协议 |
| 性能 | 高（支持DPDK/PF_RING硬件加速） | 中等 | 低（侧重日志记录） |
| IPS能力 | 原生支持（NFQUEUE/IPFW） | 需结合iptables | 无 |
| 规则兼容 | 兼容Snort规则 | 原生 | 自有脚本语言 |
| 输出格式 | EVE JSON（结构化） | Unified2 | TSV/JSON日志 |

---

## 二、架构原理

### 2.1 多线程流水线模型

Suricata 采用多线程流水线架构，数据包经过多个处理阶段：

```
网络流量 → Receive → Decode → StreamTCP → Detect → Verdict → Log
              ↑                                    ↓
         抓包引擎                          响应动作(drop/reject)
```

### 2.2 线程模块

| 模块 | 功能 |
|------|------|
| Receive | 抓包并封装为 Packet 对象 |
| Decode | 协议分层解析（链路层→网络层→传输层→应用层） |
| StreamTCP | TCP流重组、会话跟踪 |
| FlowWorker | 流管理、应用层协议解析（HTTP URI提取等） |
| Detect | 规则匹配（Aho-Corasick / Boyer-Moore 算法） |
| Verdict | IPS模式下执行 drop/reject 动作 |
| Log | 记录告警和流量日志 |

### 2.3 运行模式（Runmode）

| 模式 | 描述 | 适用场景 |
|------|------|----------|
| Workers | 每个线程独立完成完整流水线，无锁竞争 | IDS高性能场景，多核CPU |
| Autofp（默认） | RX线程负责抓包+解码，W线程负责检测+响应 | IPS场景，需要精确控制流量 |
| Single | 单线程处理，仅用于调试 | 开发调试 |

### 2.4 数据包处理流程

```
1. 抓包引擎（pcap/AF_PACKET/PF_RING/DPDK）获取原始数据包
2. Decode 模块分层解析：
   - 链路层：Ethernet、VLAN、PPP
   - 网络层：IPv4、IPv6、ICMP、GRE
   - 传输层：TCP、UDP、SCTP
   - 应用层：HTTP、DNS、TLS、SSH、SMTP、FTP、SMB等
3. StreamTCP 模块进行TCP流重组
4. Flow 引擎跟踪会话状态（哈希表+行级锁）
5. Detect 模块进行规则匹配
6. 匹配成功则触发动作（alert/drop/reject/pass）
7. Log 模块输出日志
```

### 2.5 匹配算法

| 算法 | 用途 | 特点 |
|------|------|------|
| Aho-Corasick（AC） | 多模式字符串匹配 | 线性时间复杂度，适合大量规则同时匹配 |
| Boyer-Moore（BM） | 单模式长字符串匹配 | 跳跃式匹配，长模式效率高 |
| Hyperscan | Intel高性能正则引擎 | 利用SIMD指令集，极高性能（需Intel CPU） |
| PCRE-JIT | 正则表达式匹配 | 支持复杂模式，但性能开销大 |

---

## 三、部署与配置

### 3.1 安装方式

```bash
# Ubuntu/Debian
apt-get install suricata suricata-update

# 源码编译（启用高级功能）
./configure --prefix=/usr/ --sysconfdir=/etc/ \
    --localstatedir=/var/ \
    --enable-lua --enable-geoip --enable-nfqueue
```

### 3.2 关键路径

| 路径 | 说明 |
|------|------|
| `/usr/sbin/suricata` | 主程序 |
| `/etc/suricata/suricata.yaml` | 核心配置文件 |
| `/etc/suricata/rules/` | 规则文件目录 |
| `/var/log/suricata/` | 日志目录 |

### 3.3 抓包引擎配置

| 引擎 | 特点 | 适用场景 |
|------|------|----------|
| AF_PACKET（Linux推荐） | 高性能，零拷贝 | 通用IDS场景 |
| PF_RING | 高性能，专用驱动 | 需要更高性能 |
| DPDK | 极高性能，专用硬件 | 10Gbps+流量 |
| NFQUEUE | IPS模式内联 | 需要阻断的场景 |

### 3.4 常用命令

```bash
# IDS模式启动
suricata -c /etc/suricata/suricata.yaml -i eth0

# IPS模式启动
suricata -c /etc/suricata/suricata.yaml -q 0

# 离线分析PCAP
suricata -c /etc/suricata/suricata.yaml -r capture.pcap

# 测试配置
suricata -T -c /etc/suricata/suricata.yaml

# 更新规则
suricata-update
```

---

## 四、规则语法

### 4.1 规则结构

```
action protocol src_ip src_port direction dst_ip dst_port (options;)
```

### 4.2 动作类型

| 动作 | 描述 | 模式 |
|------|------|------|
| alert | 产生告警 | IDS/IPS |
| drop | 丢弃数据包并告警 | IPS |
| reject | 发送RST/ICMP错误后丢弃 | IPS |
| pass | 放行，不告警 | IDS/IPS |

### 4.3 常用关键字

#### Meta 关键字

| 关键字 | 描述 | 示例 |
|--------|------|------|
| msg | 告警消息 | `msg:"SQL Injection Attempt";` |
| sid | 规则唯一ID | `sid:1000001;` |
| rev | 规则版本号 | `rev:3;` |
| classtype | 告警分类 | `classtype:web-application-attack;` |
| priority | 优先级（1-4，1最高） | `priority:1;` |

#### 内容匹配关键字

| 关键字 | 描述 | 示例 |
|--------|------|------|
| content | 内容匹配（核心） | `content:"UNION SELECT";` |
| nocase | 大小写不敏感 | `content:"admin"; nocase;` |
| depth | 匹配深度（字节） | `content:"GET"; depth:3;` |
| offset | 匹配起始偏移 | `content:"HTTP"; offset:0;` |
| distance | 距上次匹配的偏移 | `distance:0;` |
| within | 距上次匹配的范围 | `within:20;` |
| pcre | 正则表达式匹配 | `pcre:"/union\s+select/i";` |

#### HTTP 关键字

| 关键字 | 描述 |
|--------|------|
| http_uri | 匹配HTTP URI |
| http_method | 匹配HTTP方法 |
| http_client_body | 匹配请求体 |
| http_server_body | 匹配响应体 |
| http_header | 匹配请求/响应头 |
| http_user_agent | 匹配User-Agent |
| http_cookie | 匹配Cookie |

#### TLS 关键字

| 关键字 | 描述 |
|--------|------|
| tls_cert_subject | 证书主题 |
| tls_cert_issuer | 证书颁发者 |
| tls_sni | SNI服务器名称 |
| ja3_hash | JA3客户端指纹 |
| ja3s_hash | JA3S服务端指纹 |

#### DNS 关键字

| 关键字 | 描述 |
|--------|------|
| dns_query | 匹配DNS查询域名 |
| dns_rrname | 匹配资源记录名 |
| dns_rrtype | 匹配记录类型 |

#### Flow 关键字

| 关键字 | 描述 |
|--------|------|
| flow:established | 已建立连接 |
| flow:to_server | 客户端→服务端 |
| flow:to_client | 服务端→客户端 |
| flowbits | 流标记（跨包检测） |

### 4.4 实战规则示例

#### SQL注入检测

```
alert http $EXTERNAL_NET any -> $HOME_NET $HTTP_PORTS (
    msg:"SQL Injection UNION SELECT";
    flow:established,to_server;
    content:"UNION"; nocase; http_uri;
    content:"SELECT"; nocase; http_uri;
    pcre:"/union\s+(all\s+)?select/iU";
    classtype:web-application-attack;
    sid:1000001; rev:1;
)
```

#### XSS攻击检测

```
alert http $EXTERNAL_NET any -> $HOME_NET $HTTP_PORTS (
    msg:"XSS Attempt - Script Tag";
    flow:established,to_server;
    content:"<script"; nocase; http_uri;
    pcre:"/<script[^>]*>.*?<\/script>/iU";
    classtype:web-application-attack;
    sid:1000002; rev:1;
)
```

#### C2通信检测

```
alert http $HOME_NET any -> $EXTERNAL_NET any (
    msg:"Cobalt Strike HTTP Beacon";
    flow:established,to_server;
    content:"GET"; http_method;
    content:"/"; http_uri; depth:1;
    ja3_hash:"a0e9f5d64349fb13191bc781f81f42e1";
    classtype:trojan-activity;
    sid:1000010; rev:1;
)
```

#### DNS隧道检测

```
alert dns $HOME_NET any -> $EXTERNAL_NET any (
    msg:"DNS Tunnel - Long Query";
    flow:established,to_server;
    content:"."; dns_query;
    pcre:"/^[a-z0-9]{30,}/i";
    classtype:trojan-activity;
    sid:1000020; rev:1;
)
```

---

## 五、输出与集成

### 5.1 EVE JSON 事件类型

| 事件类型 | 描述 |
|---------|------|
| alert | 告警事件（规则触发） |
| http | HTTP请求/响应日志 |
| dns | DNS查询/响应日志 |
| tls | TLS握手信息 |
| ssh | SSH连接信息 |
| smtp | SMTP邮件信息 |
| files | 文件传输信息（含哈希） |
| flow | 流会话信息 |
| stats | 统计信息 |
| anomaly | 协议异常事件 |

### 5.2 EVE JSON 告警示例

```json
{
  "timestamp": "2025-02-15T01:06:51.718153+0800",
  "flow_id": 1081272915109526,
  "event_type": "alert",
  "src_ip": "192.168.1.100",
  "src_port": 45123,
  "dest_ip": "10.0.0.1",
  "dest_port": 80,
  "proto": "TCP",
  "alert": {
    "action": "allowed",
    "signature_id": 561001,
    "signature": "SQL Injection Attempt",
    "severity": 3
  },
  "http": {
    "hostname": "10.0.0.1",
    "url": "/admin/login.php",
    "http_method": "GET",
    "status": 404
  }
}
```

### 5.3 集成架构

```
Suricata + ELK Stack:
Suricata → eve.json → Filebeat → Logstash → Elasticsearch → Kibana

Suricata + Zeek（互补组合）:
Suricata → 签名检测、IPS阻断
Zeek → 深度协议分析、行为日志

Suricata + Kafka:
Suricata → eve.json → Kafka → 实时处理平台
```

---

## 六、性能优化

### 6.1 系统层优化

```bash
# 增大文件描述符限制
ulimit -n 65535

# 网卡Ring Buffer
ethtool -G eth0 rx 4096 tx 4096

# 关闭网卡特性卸载
ethtool -K eth0 gro off lro off
```

### 6.2 关键配置

```yaml
max-pending-packets: 65535
runmode: workers

af-packet:
  - interface: eth0
    threads: 8
    cluster-type: cluster_flow
    use-mmap: yes
    ring-size: 200000
    tpacket-v3: yes

stream:
  memcap: 4gb
  reassembly:
    memcap: 2gb
    depth: 1mb

flow:
  memcap: 2gb
  hash-size: 65536
  prealloc: 10000

detect:
  profile: high
  sgh-mpm-context: full
```

### 6.3 规则优化

| 优化策略 | 描述 |
|---------|------|
| fast_pattern | 为最独特的content指定fast_pattern |
| 避免裸content | 尽量使用http_uri等限定缓冲区的关键字 |
| 减少PCRE | PCRE性能开销大，优先用content+修饰符替代 |
| 合理使用flow | 指定flow:established,to_server减少无效匹配 |

---

## 七、相关知识点链接

详细文档和相关内容：

- 详细使用文档：[07_Suricata详解.md](./07_Suricata详解.md)
- 安全产品体系：[02_安全产品与检测体系.md](./02_安全产品与检测体系.md)
- 告警处理与关联分析：[03_告警处理与关联分析.md](./03_告警处理与关联分析.md)
- 网络流量安全分析：[01_网络流量安全分析.md](./01_网络流量安全分析.md)
- AI在安全中的应用（ML检测）：[05_AI在安全中的应用.md](./05_AI在安全中的应用.md)
- ATT&CK与威胁情报：[06_ATTCK与威胁情报.md](./06_ATTCK与威胁情报.md)

---

## 八、快速参考

### 8.1 常用变量

| 变量 | 说明 |
|------|------|
| `$HOME_NET` | 内部网络地址 |
| `$EXTERNAL_NET` | 外部网络地址 |
| `$HTTP_PORTS` | HTTP服务端口 |
| `$DNS_PORTS` | DNS服务端口 |
| `$SSH_PORTS` | SSH服务端口 |

### 8.2 常用命令速查

| 命令 | 用途 |
|------|------|
| `suricata -c config.yaml -i eth0` | IDS模式启动 |
| `suricata -c config.yaml -q 0` | IPS模式启动 |
| `suricata -T -c config.yaml` | 测试配置 |
| `suricata -r file.pcap` | 离线分析 |
| `suricata-update` | 更新规则 |
| `suricatasc -c info` | 查看统计 |

### 8.3 监控指标

| 指标 | 说明 |
|------|------|
| capture.kernel_drops | 抓包丢包率 |
| detect.alert | 告警数 |
| flow.memuse | 流内存使用 |
| tcp.reassembly_memuse | 重组内存使用 |
| decoder.pkts | 解码包数 |