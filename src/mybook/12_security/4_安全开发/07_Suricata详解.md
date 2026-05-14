# Suricata 详解

## 概述

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
| 适用场景 | 企业级SOC、云原生安全、NDR | 传统IDS部署 | 行为分析、异常检测 |

***

## 架构原理

### 多线程流水线模型

Suricata 采用多线程流水线架构，数据包经过多个处理阶段：

```
网络流量 → Receive → Decode → StreamTCP → Detect → Verdict → Log
              ↑                                    ↓
         抓包引擎                          响应动作(drop/reject)
```

### 线程模块

| 模块 | 功能 |
|------|------|
| Receive | 抓包并封装为 Packet 对象 |
| Decode | 协议分层解析（链路层→网络层→传输层→应用层） |
| StreamTCP | TCP流重组、会话跟踪 |
| FlowWorker | 流管理、应用层协议解析（HTTP URI提取等） |
| Detect | 规则匹配（Aho-Corasick / Boyer-Moore 算法） |
| Verdict | IPS模式下执行 drop/reject 动作 |
| Log | 记录告警和流量日志 |

### 运行模式（Runmode）

| 模式 | 描述 | 适用场景 |
|------|------|---------|
| Workers | 每个线程独立完成完整流水线（捕获→解码→检测），无锁竞争 | IDS高性能场景，多核CPU |
| Autofp（默认） | RX线程负责抓包+解码，W线程负责检测+响应，通过队列通信 | IPS场景，需要精确控制流量 |
| Single | 单线程处理，仅用于调试 | 开发调试 |

```
Workers模式:
  Thread1: Receive → Decode → Detect → Log
  Thread2: Receive → Decode → Detect → Log
  Thread3: Receive → Decode → Detect → Log

Autofp模式:
  RX-Thread1: Receive → Decode ──→ Queue ──→ W-Thread1: Detect → Log
  RX-Thread2: Receive → Decode ──→ Queue ──→ W-Thread2: Detect → Log
```

### 数据包处理流程

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

### 匹配算法

| 算法 | 用途 | 特点 |
|------|------|------|
| Aho-Corasick（AC） | 多模式字符串匹配 | 线性时间复杂度，适合大量规则同时匹配 |
| Boyer-Moore（BM） | 单模式长字符串匹配 | 跳跃式匹配，长模式效率高 |
| Hyperscan | Intel高性能正则引擎 | 利用SIMD指令集，极高性能（需Intel CPU） |
| PCRE-JIT | 正则表达式匹配 | 支持复杂模式，但性能开销大 |

***

## 安装与部署

### 二进制安装（推荐）

```bash
# Ubuntu/Debian
apt-get install suricata suricata-update

# CentOS/RHEL
yum install epel-release yum-plugin-copr
yum copr enable @oisf/suricata-7.0
yum install suricata

# 验证安装
suricata --build-info
```

### 源码安装

```bash
# 安装依赖
apt-get install libjansson-dev libpcap-dev libpcre2-dev \
    libmagic-dev zlib1g-dev libyaml-dev gcc pkg-config \
    libgeoip-dev liblua5.1-dev libhiredis-dev libevent-dev

# 编译安装
tar xzvf suricata-7.0.0.tar.gz
cd suricata-7.0.0
./configure --prefix=/usr/ --sysconfdir=/etc/ \
    --localstatedir=/var/ \
    --enable-lua --enable-geoip --enable-nfqueue
make
make install
```

### 关键路径

| 路径 | 说明 |
|------|------|
| `/usr/sbin/suricata` | 主程序 |
| `/etc/suricata/suricata.yaml` | 核心配置文件 |
| `/etc/suricata/rules/` | 规则文件目录 |
| `/var/log/suricata/` | 日志目录 |
| `/etc/suricata/classification.config` | 告警分类定义 |
| `/etc/suricata/reference.config` | 引用配置 |

### 规则更新

```bash
# 更新规则集（ET Open）
suricata-update

# 更新并指定源
suricata-update update-sources
suricata-update enable-source oisf/trafficid
suricata-update enable-source etnetera/aggressive
suricata-update

# 查看已启用的规则源
suricata-update list-sources
suricata-update list-enabled-sources
```

***

## 命令行使用

### 常用启动选项

| 选项 | 描述 |
|------|------|
| `-c <path>` | 指定配置文件路径 |
| `-i <interface>` | 指定监控网卡 |
| `-T` | 测试配置文件是否正确 |
| `-D` | 后台守护进程运行 |
| `-v` | 日志级别（-v:INFO, -vv:PERF, -vvv:CONFIG, -vvvv:DEBUG） |
| `-l <dir>` | 指定日志输出目录 |
| `-s <file>` | 临时追加规则文件 |
| `--set <key>=<val>` | 覆盖配置项 |

### IDS 模式

```bash
# 前台运行（调试）
suricata -c /etc/suricata/suricata.yaml -i eth0

# 后台运行
suricata -c /etc/suricata/suricata.yaml -i eth0 -D

# 测试配置
suricata -T -c /etc/suricata/suricata.yaml
```

### IPS 模式

```bash
# NFQUEUE模式（Linux）
suricata -c /etc/suricata/suricata.yaml -q 0

# 配合iptables使用
iptables -I FORWARD -j NFQUEUE --queue-num 0 --queue-bypass
iptables -I INPUT -j NFQUEUE --queue-num 0 --queue-bypass
iptables -I OUTPUT -j NFQUEUE --queue-num 0 --queue-bypass
```

### 离线分析

```bash
# 分析PCAP文件
suricata -c /etc/suricata/suricata.yaml -r capture.pcap

# 分析目录下所有PCAP（按修改时间排序）
suricata -c /etc/suricata/suricata.yaml -r /path/to/pcaps/

# 递归分析子目录
suricata -c /etc/suricata/suricata.yaml -r /path/to/pcaps/ --pcap-file-recursive

# 持续监控目录（新文件自动处理）
suricata -c /etc/suricata/suricata.yaml -r /path/to/pcaps/ --pcap-file-continuous
```

***

## 配置文件 suricata.yaml

### 核心配置结构

```yaml
%YAML 1.1
---
max-pending-packets: 1024
runmode: workers
default-packet-size: 1514

vars:
  address-groups:
    HOME_NET: "[192.168.0.0/16,10.0.0.0/8,172.16.0.0/12]"
    EXTERNAL_NET: "!$HOME_NET"
  port-groups:
    HTTP_PORTS: "80,8080"
    SSH_PORTS: "22"
    DNS_PORTS: "53"

af-packet:
  - interface: eth0
    threads: auto
    cluster-id: 99
    cluster-type: cluster_flow
    defrag: yes

default-rule-path: /etc/suricata/rules
rule-files:
  - suricata.rules

outputs:
  - eve-log:
      enabled: yes
      filetype: regular
      filename: eve.json
  - fast-log:
      enabled: yes
      filename: fast.log
  - stats:
      enabled: yes
      filename: stats.log
      interval: 8
```

### 变量配置（vars）

| 变量 | 说明 | 示例 |
|------|------|------|
| HOME_NET | 内部网络地址 | `[192.168.0.0/16,10.0.0.0/8]` |
| EXTERNAL_NET | 外部网络地址 | `!$HOME_NET` |
| HTTP_PORTS | HTTP服务端口 | `80,8080,8443` |
| SSH_PORTS | SSH服务端口 | `22` |
| DNS_PORTS | DNS服务端口 | `53` |

### 抓包引擎配置

#### AF_PACKET（Linux推荐）

```yaml
af-packet:
  - interface: eth0
    threads: auto
    cluster-id: 99
    cluster-type: cluster_flow
    defrag: yes
    use-mmap: yes
    ring-size: 65536
    tpacket-v3: yes
```

| 参数 | 说明 |
|------|------|
| cluster-type: cluster_flow | 按流哈希分配到不同线程，保证同流同线程 |
| use-mmap | 使用mmap零拷贝，提升性能 |
| tpacket-v3 | 使用AF_PACKET V3，更高性能 |
| ring-size | 环形缓冲区大小 |

#### PF_RING（高性能）

```yaml
pf-ring:
  - interface: eth0
    threads: auto
    cluster-id: 99
    cluster-type: cluster_round_robin
```

#### DPDK（极高性能）

```yaml
dpdk:
  interfaces:
    - interface: 0000:01:00.0
      threads: 4
      promisc: yes
      multicast: yes
```

#### NFQUEUE（IPS模式）

```yaml
nfqueue:
  - id: 0
    threads: auto
    fail-open: yes
```

### 输出配置

#### EVE JSON（核心输出）

```yaml
outputs:
  - eve-log:
      enabled: yes
      filetype: regular
      filename: eve.json
      rotate-interval: day
      pcap-log: yes
      types:
        - alert:
            payload: yes
            payload-buffer-size: 4kb
            payload-printable: yes
            http: yes
            tls: yes
            ssh: yes
            smtp: yes
            flow: yes
            xff:
              enabled: yes
              mode: extra-data
        - http:
            extended: yes
        - dns:
            version: 2
        - tls:
            extended: yes
        - files:
            force-magic: yes
            force-hash: [md5, sha256]
        - flow
        - stats:
            totals: yes
            threads: yes
            deltas: no
```

#### EVE JSON 事件类型

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

#### EVE JSON 告警示例

```json
{
  "timestamp": "2025-02-15T01:06:51.718153+0800",
  "flow_id": 1081272915109526,
  "in_iface": "eth0",
  "event_type": "alert",
  "src_ip": "192.168.1.100",
  "src_port": 45123,
  "dest_ip": "10.0.0.1",
  "dest_port": 80,
  "proto": "TCP",
  "alert": {
    "action": "allowed",
    "gid": 1,
    "signature_id": 561001,
    "rev": 0,
    "signature": "出现404错误",
    "category": "",
    "severity": 3
  },
  "http": {
    "hostname": "10.0.0.1",
    "url": "/admin/login.php",
    "http_user_agent": "Mozilla/5.0",
    "http_method": "GET",
    "protocol": "HTTP/1.1",
    "status": 404
  },
  "app_proto": "http",
  "flow": {
    "pkts_toserver": 5,
    "pkts_toclient": 6,
    "bytes_toserver": 819,
    "bytes_toclient": 1849
  }
}
```

#### 其他日志输出

| 日志文件 | 描述 |
|---------|------|
| fast.log | 简洁告警日志（一行一条，非结构化） |
| stats.log | 运行统计信息（包数、流数、内存等） |
| suricata.log | 程序运行日志 |
| eve.json | 结构化JSON日志（核心输出） |

### 阈值与限速（threshold）

```yaml
threshold-file: /etc/suricata/threshold.config
```

threshold.config 配置：

```
# suppress：抑制特定告警
suppress gen_id 1, sig_id 561001, track by_src, ip 192.168.1.100

# threshold：在时间窗口内仅告警一次
threshold gen_id 1, sig_id 561001, type threshold, track by_src, count 1, seconds 60

# rate_filter：超过阈值后改变动作
rate_filter gen_id 1, sig_id 561001, track by_src, count 100, seconds 60, new_action drop, timeout 300

# event_filter：降低告警频率
event_filter gen_id 1, sig_id 561001, type both, track by_src, count 10, seconds 60
```

| 类型 | 描述 |
|------|------|
| threshold | 达到count后仅产生一次告警 |
| both | 达到count后产生告警，之后不再重复 |
| suppress | 完全抑制特定规则的告警 |
| rate_filter | 超过阈值后改变动作（如alert→drop） |

***

## 规则语法详解

### 规则结构

```
action protocol src_ip src_port direction dst_ip dst_port (options;)
```

### Action（动作）

| 动作 | 描述 | 模式 |
|------|------|------|
| alert | 产生告警 | IDS/IPS |
| drop | 丢弃数据包并告警 | IPS |
| reject | 发送RST/ICMP错误后丢弃 | IPS |
| pass | 放行，不告警 | IDS/IPS |

### Protocol（协议）

| 类别 | 协议 |
|------|------|
| 传输层 | tcp, udp, icmp, sctp |
| 网络层 | ip, ipv6 |
| 应用层 | http, dns, tls, ssh, smtp, ftp, smb, nfs, dhcp, rdp, snmp, modbus, dnp3, enip, ikev2, krb5, ntp, dhcp, rfb, mqtt, pgsql, rstats, sip |

### 方向

| 方向 | 描述 |
|------|------|
| `->` | 单向，从源到目标 |
| `<>` | 双向，源和目标任一方向 |

### IP地址规则

| 语法 | 含义 |
|------|------|
| `any` | 任意IP |
| `192.168.1.1` | 指定IP |
| `192.168.0.0/16` | CIDR网段 |
| `!1.1.1.1` | 排除指定IP |
| `[10.0.0.0/24, !10.0.0.5]` | 网段中排除特定IP |
| `$HOME_NET` | 引用配置变量 |
| `[$EXTERNAL_NET, !$HOME_NET]` | 变量组合 |

### 端口规则

| 语法 | 含义 |
|------|------|
| `any` | 任意端口 |
| `80` | 指定端口 |
| `[80, 443, 8080]` | 多个端口 |
| `[80:82]` | 端口范围80-82 |
| `[1024:]` | 1024到最大端口 |
| `!80` | 排除80端口 |
| `[80:100, !99]` | 范围中排除99 |

### 规则选项（Options）

#### Meta 关键字

| 关键字 | 描述 | 示例 |
|--------|------|------|
| msg | 告警消息 | `msg:"SQL Injection Attempt";` |
| sid | 规则唯一ID | `sid:1000001;` |
| rev | 规则版本号 | `rev:3;` |
| classtype | 告警分类 | `classtype:web-application-attack;` |
| priority | 优先级（1-4，1最高） | `priority:1;` |
| reference | 外部引用 | `reference:cve,CVE-2021-44228;` |
| metadata | 元数据 | `metadata:attack_target Web_Server;` |
| target | 指定攻击目标方向 | `target:dest_ip;` |

#### 内容匹配关键字

| 关键字 | 描述 | 示例 |
|--------|------|------|
| content | 内容匹配（核心） | `content:"UNION SELECT";` |
| nocase | 大小写不敏感 | `content:"admin"; nocase;` |
| depth | 匹配深度（字节） | `content:"GET"; depth:3;` |
| offset | 匹配起始偏移 | `content:"HTTP"; offset:0; depth:4;` |
| distance | 距上次匹配的偏移 | `content:"UNION"; distance:0; content:"SELECT"; distance:1;` |
| within | 距上次匹配的范围 | `content:"SELECT"; within:20;` |
| rawbytes | 匹配原始字节（忽略解码） | `content:"|00 01 02|"; rawbytes;` |
| hex | 十六进制匹配 | `content:"|3C 73 63 72 69 70 74|";` |
| startswith | 从缓冲区开头匹配 | `content:"GET"; startswith;` |
| endswith | 匹配缓冲区末尾 | `content:"|0D 0A|"; endswith;` |
| fast_pattern | 优先匹配此content | `content:"sqlmap"; fast_pattern;` |

#### PCRE 正则匹配

```
pcre:"/union\s+select/i";
pcre:"/^POST\s+\/[^\s]+\s+HTTP\/1\.[01]$/H";
```

| 修饰符 | 描述 |
|--------|------|
| `i` | 大小写不敏感 |
| `s` | 单行模式（.匹配换行） |
| `m` | 多行模式 |
| `H` | 仅匹配HTTP请求头 |
| `P` | 仅匹配HTTP请求体 |
| `U` | 仅匹配HTTP URI |
| `B` | 匹配原始缓冲区 |

#### HTTP 关键字

| 关键字 | 描述 | 示例 |
|--------|------|------|
| http_uri | 匹配HTTP URI | `content:"/admin"; http_uri;` |
| http_raw_uri | 匹配原始URI（不解码） | `content:"%2e%2e"; http_raw_uri;` |
| http_method | 匹配HTTP方法 | `content:"POST"; http_method;` |
| http_request_line | 匹配完整请求行 | `content:"GET /index.html HTTP/1.1"; http_request_line;` |
| http_client_body | 匹配请求体 | `content:"password="; http_client_body;` |
| http_server_body | 匹配响应体 | `content:"error"; http_server_body;` |
| http_header | 匹配请求/响应头 | `content:"X-Forwarded-For"; http_header;` |
| http_raw_header | 匹配原始头部 | `content:"|0D 0A|"; http_raw_header;` |
| http_cookie | 匹配Cookie | `content:"sessionid="; http_cookie;` |
| http_user_agent | 匹配User-Agent | `content:"sqlmap"; http_user_agent;` |
| http_host | 匹配Host头 | `content:"evil.com"; http_host;` |
| http_content_type | 匹配Content-Type | `content:"multipart/form-data"; http_content_type;` |
| http_stat_code | 匹配状态码 | `content:"404"; http_stat_code;` |
| http_stat_msg | 匹配状态消息 | `content:"Not Found"; http_stat_msg;` |
| http_accept | 匹配Accept头 | `content:"text/html"; http_accept;` |
| http_accept_lang | 匹配Accept-Language | `content:"en-US"; http_accept_lang;` |
| http_referer | 匹配Referer | `content:"google.com"; http_referer;` |
| http_connection | 匹配Connection头 | `content:"keep-alive"; http_connection;` |
| http_content_len | 匹配Content-Length | `content:"0"; http_content_len;` |
| http_filename | 匹配上传文件名 | `content:".php"; http_filename;` |

#### TLS/SSL 关键字

| 关键字 | 描述 | 示例 |
|--------|------|------|
| tls_cert_subject | 证书主题 | `content:"CN=*.evil.com"; tls_cert_subject;` |
| tls_cert_issuer | 证书颁发者 | `content:"CN=Fake CA"; tls_cert_issuer;` |
| tls_sni | SNI服务器名称 | `content:"evil.com"; tls_sni;` |
| tls_version | TLS版本 | `content:"1.1"; tls_version;` |
| ja3_hash | JA3客户端指纹 | `content:"e7d705a3286e19ea42f587b344ee6865"; ja3_hash;` |
| ja3_string | JA3完整字符串 | `content:"769,47-53-5-10-49161-49162"; ja3_string;` |
| ja3s_hash | JA3S服务端指纹 | `content:"ae4edc6faf64d083080102ad4435964d"; ja3s_hash;` |
| tls_cert_serial | 证书序列号 | `content:"01"; tls_cert_serial;` |
| tls_cert_fingerprint | 证书指纹 | `content:"a1:b2:c3:..."; tls_cert_fingerprint;` |

#### DNS 关键字

| 关键字 | 描述 | 示例 |
|--------|------|------|
| dns_query | 匹配DNS查询域名 | `content:"evil.com"; dns_query;` |
| dns_rrname | 匹配资源记录名 | `content:"malware"; dns_rrname;` |
| dns_rrtype | 匹配记录类型 | `content:"CNAME"; dns_rrtype;` |
| dns_rcode | 匹配响应码 | `content:"NXDOMAIN"; dns_rcode;` |

#### Flow 关键字

| 关键字 | 描述 | 示例 |
|--------|------|------|
| flow | 流方向和状态 | `flow:established,to_server;` |
| flowbits | 流标记（跨包检测） | `flowbits:set,seen_login; flowbits:isset,seen_login;` |
| flowint | 流整数变量 | `flowint:count,+,1;` |

flow 修饰符：

| 修饰符 | 描述 |
|--------|------|
| to_server | 客户端→服务端方向 |
| to_client | 服务端→客户端方向 |
| from_server | 等同 to_client |
| from_client | 等同 to_server |
| established | 已建立连接 |
| not_established | 未建立连接 |
| stateless | 忽略连接状态 |

#### 文件关键字

| 关键字 | 描述 | 示例 |
|--------|------|------|
| file_data | 匹配文件内容 | `file_data; content:"MZ";` |
| filemagic | 文件类型识别 | `filemagic:"PE32 executable";` |
| filename | 匹配文件名 | `content:".exe"; filename;` |
| fileext | 匹配文件扩展名 | `content:"php"; fileext;` |
| filestore | 存储文件到磁盘 | `filestore:direction:both;` |

#### 逻辑修饰符

| 关键字 | 描述 |
|--------|------|
| `!content` | 否定匹配 |
| `fast_pattern` | 优先匹配此content（优化性能） |
| `fast_pattern:only` | 仅用此content做快速预筛选 |
| `fast_pattern:"chm"` | 使用CHM算法 |

#### IP/TCP 标志关键字

| 关键字 | 描述 | 示例 |
|--------|------|------|
| ttl | IP TTL值 | `ttl:128;` |
| ip_proto | IP协议号 | `ip_proto:6;` |
| id | IP标识字段 | `id:0;` |
| flags | TCP标志 | `flags:S,12;` |
| seq | TCP序列号 | `seq:0;` |
| ack | TCP确认号 | `ack:0;` |
| window | TCP窗口大小 | `window:65535;` |

***

## 规则编写实战

### SQL注入检测

```
alert http $EXTERNAL_NET any -> $HOME_NET $HTTP_PORTS (
    msg:"ET WEB_SERVER SQL Injection UNION SELECT";
    flow:established,to_server;
    content:"UNION"; nocase; http_uri;
    content:"SELECT"; nocase; http_uri;
    distance:0;
    pcre:"/union\s+(all\s+)?select/iU";
    classtype:web-application-attack;
    sid:1000001; rev:1;
)
```

### XSS攻击检测

```
alert http $EXTERNAL_NET any -> $HOME_NET $HTTP_PORTS (
    msg:"ET WEB_SERVER XSS Attempt - Script Tag";
    flow:established,to_server;
    content:"<script"; nocase; http_uri;
    pcre:"/<script[^>]*>.*?<\/script>/iU";
    classtype:web-application-attack;
    sid:1000002; rev:1;
)
```

### 命令注入检测

```
alert http $EXTERNAL_NET any -> $HOME_NET $HTTP_PORTS (
    msg:"ET WEB_SERVER Command Injection - Semicolon";
    flow:established,to_server;
    content:";"; http_uri;
    content:"|60|"; http_uri;
    pcre:"/[;\|`]\s*(ls|cat|id|whoami|wget|curl|nc|bash|sh)\b/iU";
    classtype:web-application-attack;
    sid:1000003; rev:1;
)
```

### C2通信检测

```
alert http $HOME_NET any -> $EXTERNAL_NET any (
    msg:"ET TROJAN Cobalt Strike HTTP Beacon";
    flow:established,to_server;
    content:"GET"; http_method;
    content:"/"; http_uri; depth:1;
    content:"Cookie"; http_header;
    pcre:"/^[A-Za-z0-9+/]{20,}={0,2}$/H";
    ja3_hash:"a0e9f5d64349fb13191bc781f81f42e1";
    classtype:trojan-activity;
    sid:1000010; rev:1;
)
```

### DNS隧道检测

```
alert dns $HOME_NET any -> $EXTERNAL_NET any (
    msg:"ET DNS Long DNS Query - Possible DNS Tunnel";
    flow:established,to_server;
    content:"."; dns_query;
    pcre:"/^[a-z0-9]{30,}/i";
    classtype:trojan-activity;
    sid:1000020; rev:1;
)
```

### DGA域名检测

```
alert dns $HOME_NET any -> $EXTERNAL_NET any (
    msg:"ET DNS Possible DGA Domain - High Entropy";
    flow:established,to_server;
    dns_query;
    pcre:"/^[a-z0-9]{8,}\.[a-z]{2,6}$/i";
    classtype:trojan-activity;
    sid:1000021; rev:1;
)
```

### 横向移动检测

```
alert smb $HOME_NET any -> $HOME_NET any (
    msg:"ET SMB Possible Lateral Movement - ADMIN$ Share Access";
    flow:established,to_server;
    content:"|5C|ADMIN|24|";
    classtype:suspicious-filename-detect;
    sid:1000030; rev:1;
)
```

### TLS恶意证书检测

```
alert tls $EXTERNAL_NET any -> $HOME_NET any (
    msg:"ET TROJAN Known Malicious TLS Certificate";
    flow:established,to_server;
    tls_cert_subject;
    content:"CN=*.malware-c2.com";
    classtype:trojan-activity;
    sid:1000040; rev:1;
)
```

### JA3指纹检测

```
alert tls $HOME_NET any -> $EXTERNAL_NET any (
    msg:"ET TROJAN Known Malware JA3 Fingerprint";
    flow:established,to_server;
    ja3_hash;
    content:"e7d705a3286e19ea42f587b344ee6865";
    classtype:trojan-activity;
    sid:1000041; rev:1;
)
```

### 文件传输检测

```
alert http $HOME_NET any -> $EXTERNAL_NET any (
    msg:"ET FILE Transfer of Executable File";
    flow:established,to_client;
    file_data;
    content:"MZ";
    within:2;
    content:"This program";
    distance:0;
    within:64;
    fileext:"exe";
    classtype:successful-admin;
    sid:1000050; rev:1;
)
```

### Flowbits跨包检测

```
alert http $EXTERNAL_NET any -> $HOME_NET $HTTP_PORTS (
    msg:"ET WEB Login Page Accessed";
    flow:established,to_server;
    content:"/login.php"; http_uri;
    flowbits:set,login_page;
    flowbits:noalert;
    sid:1000060; rev:1;
)

alert http $EXTERNAL_NET any -> $HOME_NET $HTTP_PORTS (
    msg:"ET WEB SQL Injection After Login Page";
    flow:established,to_server;
    flowbits:isset,login_page;
    content:"UNION"; nocase; http_client_body;
    classtype:web-application-attack;
    sid:1000061; rev:1;
)
```

***

## 与其他系统集成

### Suricata + ELK Stack

```
Suricata → eve.json → Filebeat → Logstash → Elasticsearch → Kibana
```

Filebeat 配置：

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/suricata/eve.json
    json.keys_under_root: true
    json.add_error_key: true

output.elasticsearch:
  hosts: ["localhost:9200"]
  index: "suricata-%{+yyyy.MM.dd}"
```

### Suricata + Zeek

| 组件 | 职责 |
|------|------|
| Suricata | 签名检测、IPS阻断、快速告警 |
| Zeek | 深度协议分析、行为日志、异常检测 |

两者通过 Community ID 关联同一流量的日志：

```
Suricata eve.json (flow_id + community_id) ←→ Zeek conn.log (community_id)
```

### Suricata + Kafka

```yaml
outputs:
  - eve-log:
      enabled: yes
      type: file
      filename: eve.json
  - kafka:
      enabled: yes
      brokers: ["kafka:9092"]
      topic: suricata
      compression: none
      max-message-size: 1000000
```

### Suricata + Go 自研平台

```go
func WatchEVE(path string, handler func(EVEEvent)) {
    t, _ := tail.TailFile(path, tail.Config{Follow: true, ReOpen: true})
    for line := range t.Lines {
        var event EVEEvent
        if err := json.Unmarshal([]byte(line.Text), &event); err != nil {
            continue
        }
        handler(event)
    }
}

type EVEEvent struct {
    Timestamp  string `json:"timestamp"`
    FlowID     int64  `json:"flow_id"`
    EventType  string `json:"event_type"`
    SrcIP      string `json:"src_ip"`
    SrcPort    int    `json:"src_port"`
    DestIP     string `json:"dest_ip"`
    DestPort   int    `json:"dest_port"`
    Proto      string `json:"proto"`
    Alert      *Alert `json:"alert,omitempty"`
    HTTP       *HTTP  `json:"http,omitempty"`
    DNS        *DNS   `json:"dns,omitempty"`
    TLS        *TLS   `json:"tls,omitempty"`
}
```

***

## 性能优化

### 系统层优化

```bash
# 增大文件描述符限制
ulimit -n 65535

# 网卡Ring Buffer
ethtool -G eth0 rx 4096 tx 4096

# 关闭网卡特性卸载（避免分片）
ethtool -K eth0 gro off lro off

# CPU亲和性绑定
taskset -c 0-7 suricata -c suricata.yaml -i eth0
```

### suricata.yaml 性能配置

```yaml
max-pending-packets: 65535
runmode: workers
default-packet-size: 1514

af-packet:
  - interface: eth0
    threads: 8
    cluster-id: 99
    cluster-type: cluster_flow
    use-mmap: yes
    ring-size: 200000
    tpacket-v3: yes

stream:
  memcap: 4gb
  checksum-validation: no
  inline: no
  reassembly:
    memcap: 2gb
    depth: 1mb

defrag:
  memcap: 1gb
  hash-size: 65536
  trackers: 65535

flow:
  memcap: 2gb
  hash-size: 65536
  prealloc: 10000
  emergency-recovery: 30

detect:
  profile: high
  sgh-mpm-context: full
  inspection-recursion-limit: 3000
```

### 规则优化

| 优化策略 | 描述 |
|---------|------|
| fast_pattern | 为最独特的content指定fast_pattern，加速预筛选 |
| 避免裸content | 尽量使用http_uri等限定缓冲区的关键字 |
| 减少PCRE | PCRE性能开销大，优先用content+修饰符替代 |
| 合理使用flow | 指定flow:established,to_server减少无效匹配 |
| 规则分类 | 按协议分组规则文件，减少加载量 |
| 禁用低价值规则 | 使用threshold.config抑制已知误报 |

### 监控指标

```bash
# 查看统计信息
suricatasc -c info

# 关键指标
# - capture.kernel_drops：抓包丢包率
# - detect.alert：告警数
# - flow.memuse：流内存使用
# - tcp.reassembly_memuse：重组内存使用
# - decoder.pkts：解码包数
```

***

## 常见问题排查

### 规则不触发

```bash
# 测试规则语法
suricata -T -c /etc/suricata/suricata.yaml

# 使用PCAP回放测试
suricata -c /etc/suricata/suricata.yaml -r test.pcap -l /tmp/test/

# 检查eve.json
jq 'select(.event_type=="alert")' /tmp/test/eve.json
```

### 丢包问题

```bash
# 查看丢包统计
grep "drop" /var/log/suricata/stats.log

# 优化方案：
# 1. 增大Ring Buffer
# 2. 使用Workers模式
# 3. 启用DPDK/PF_RING
# 4. 减少规则数量
# 5. 关闭checksum校验
```

### 内存不足

```yaml
# 调整memcap
stream:
  memcap: 2gb
flow:
  memcap: 1gb
defrag:
  memcap: 512mb
```

### 日志过大

```yaml
# 配置日志轮转
outputs:
  - eve-log:
      rotate-interval: day
      max-keep: 30
  - fast-log:
      rotate-interval: day
      max-keep: 30
```
