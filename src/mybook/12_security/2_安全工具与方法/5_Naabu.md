# Naabu — 快速端口扫描器

> 官网：https://projectdiscovery.io/
> 源码：https://github.com/projectdiscovery/naabu（Go）
> 许可证：MIT
> 作者：ProjectDiscovery
> Stars：5.9k

---

## 一、主要功能

Naabu 是 ProjectDiscovery 出品的快速端口扫描工具，使用 Go 编写，支持 SYN/CONNECT/UDP 三种扫描模式。其核心定位是**快速、轻量、管道化**的端口发现，并与 ProjectDiscovery 生态无缝集成。

1. **快速端口扫描**（SYN/CONNECT/UDP 三模式）
2. **CDN/WAF 感知排除**（自动识别 CDN IP，仅扫 80/443）
3. **主机发现**（ARP/ICMP/TCP 多协议 Ping）
4. **被动端口发现**（Shodan InternetDB API）
5. **Nmap 集成**（扫描结果自动调用 nmap 做服务发现）
6. **智能扫描**（基于端口关联模型的预测性扫描）

---

## 二、详细功能列表

### 2.1 输入指定

| 选项 | 说明 | 示例 |
|------|------|------|
| `-host` | 直接指定主机 | `naabu -host hackerone.com` |
| `-list, -l` | 从文件读取目标 | `naabu -l hosts.txt` |
| CIDR | 子网范围 | `naabu -host 192.168.1.0/24` |
| ASN | AS 号输入 | `echo AS14421 \| naabu` |
| STDIN | 管道输入 | `cat targets.txt \| naabu` |
| `-exclude-hosts, -eh` | 排除主机 | `naabu -eh 192.168.1.1` |
| `-exclude-file, -ef` | 从文件读取排除列表 | `naabu -ef skip.txt` |
| `-scan-all-ips, -sa` | 扫描 DNS 记录关联的所有 IP | `naabu -sa -host example.com` |
| `-ip-version, -iv` | IP 版本选择（4/6） | `naabu -iv 6` |

### 2.2 端口指定

| 选项 | 说明 | 示例 |
|------|------|------|
| `-port, -p` | 指定端口 | `-p 80,443,100-200` |
| `-top-ports, -tp` | 扫描常用端口 | `-tp 100`（默认）、`-tp 1000`、`-tp full` |
| `-p -` | 全端口扫描（1-65535） | `naabu -p - -host target` |
| `-exclude-ports, -ep` | 排除端口 | `-ep 80,443` |
| `-ports-file, -pf` | 从文件读取端口列表 | `-pf ports.txt` |
| `-port-threshold, -pts` | 端口阈值（超过则跳过该主机） | `-pts 100` |
| UDP 端口 | `u:` 前缀指定 | `-p u:53,u:161` |
| `-cp, -connect-payload` | CONNECT 扫描的自定义 UDP 载荷 | `-cp "DNS query payload"` |

**内置端口列表**：

| 选项 | 说明 |
|------|------|
| `-top-ports 100` | Nmap Top 100 端口（默认） |
| `-top-ports 1000` | Nmap Top 1000 端口 |
| `-p -` | 全端口 1-65535 |

### 2.3 扫描模式

| 选项 | 说明 |
|------|------|
| `-scan-type, -s c` | CONNECT 扫描（默认，无需 root） |
| `-scan-type, -s s` | SYN 扫描（需 root，更快更隐蔽） |
| `-scan-type, -s u` | UDP 扫描（需 root） |

**扫描模式对比**：

| 特性 | SYN 扫描 | CONNECT 扫描 | UDP 扫描 |
|------|----------|-------------|----------|
| 需要权限 | ✅ root | ❌ | ✅ root |
| 速度 | 极快 | 快 | 较慢 |
| 隐蔽性 | 高（半开） | 低（完整握手） | 中 |
| 准确度 | 高 | 高 | 中 |
| 适用场景 | 大规模快速扫描 | 无特权环境 | DNS/SNMP 等服务 |

### 2.4 CDN/WAF 排除

| 选项 | 说明 |
|------|------|
| `-exclude-cdn, -ec` | 对 CDN/WAF IP 仅扫描 80/443 端口 |
| `-display-cdn, -cdn` | 在输出中显示 CDN 信息 |

**支持的 CDN 识别**：Cloudflare、Akamai、Incapsula、Sucuri

**工作原理**：
1. cdncheck 库基于 CIDR 列表和 CNAME 规则检测 CDN IP
2. 识别为 CDN 的 IP → 仅扫描 80/443 端口（节省大量时间）
3. 非 CDN IP → 正常全端口扫描

### 2.5 主机发现

| 选项 | 说明 |
|------|------|
| `-sn, -host-discovery` | 仅做主机发现，不扫描端口 |
| `-wn, -with-host-discovery` | 启用主机发现（默认关闭） |
| `-arp, -arp-ping` | ARP Ping（局域网） |
| `-ps, -probe-tcp-syn` | TCP SYN Ping | 
| `-pa, -probe-tcp-ack` | TCP ACK Ping |
| `-pe, -probe-icmp-echo` | ICMP Echo Ping |
| `-pp, -probe-icmp-timestamp` | ICMP Timestamp Ping |
| `-pm, -probe-icmp-address-mask` | ICMP Address Mask Ping |
| `-nd, -nd-ping` | IPv6 Neighbor Discovery |
| `-rev-ptr` | 对输入 IP 做反向 PTR 查询 |

### 2.6 被动端口发现

| 选项 | 说明 |
|------|------|
| `-passive` | 使用 Shodan InternetDB API 获取开放端口 |

**原理**：查询 `https://internetdb.shodan.io/<ip>` 获取已知的开放端口信息，无需主动探测。

### 2.7 智能扫描

| 选项 | 说明 |
|------|------|
| `-ss, -smart-scan` | 启用预测性端口扫描 |
| `-pt, -prediction-threshold` | 预测置信度阈值（0-100%，默认 20%） |

**原理**：基于端口关联模型，当发现某些端口开放时，预测其他可能开放的端口并优先扫描，提高发现效率。

### 2.8 Nmap 集成

| 选项 | 说明 |
|------|------|
| `-nmap-cli <cmd>` | 对扫描结果自动执行 nmap 命令 |

**使用示例**：
```bash
naabu -host target.com -nmap-cli 'nmap -sV -oX nmap-output'
```

**工作流程**：Naabu 完成端口扫描 → 提取开放端口列表 → 自动调用 nmap 对这些端口做服务发现

### 2.9 速率与性能

| 选项 | 说明 |
|------|------|
| `-c` | 并发线程数（默认 25） |
| `-rate` | 每秒发包数（默认 1000） |
| `-retries` | 重试次数（默认 3） |
| `-timeout` | 超时毫秒数（默认 1000） |
| `-warm-up-time` | 扫描阶段间等待秒数（默认 2） |
| `-ping` | 用 ping 验证主机存活 |
| `-verify` | 用 TCP 验证端口结果 |
| `-stream` | 流模式（禁用 resume/nmap/verify/retries/shuffling） |
| `-resume` | 从 resume.cfg 恢复扫描 |

### 2.10 输出格式

| 选项 | 说明 |
|------|------|
| `-o, -output` | 输出到文件 |
| `-j, -json` | JSON Lines 格式输出 |
| `-csv` | CSV 格式输出 |
| `-silent` | 仅输出结果 |
| `-verbose, -v` | 详细输出 |
| `-debug` | 调试信息 |

**JSON 输出示例**：
```json
{"ip":"104.16.99.52","port":443}
{"ip":"104.16.99.52","port":80}
```

### 2.11 其他功能

| 选项 | 说明 |
|------|------|
| `-proxy` | SOCKS5 代理 | 
| `-proxy-auth` | SOCKS5 代理认证 |
| `-r` | 自定义 DNS 解析器 |
| `-sr, -system-resolver` | 使用系统 DNS 作为回退 |
| `-i, -interface` | 指定网络接口 |
| `-source-ip` | 指定源 IP 和端口 |
| `-mp, -metrics-port` | 指标暴露端口（默认 63636） |
| `-config` | 配置文件路径（默认 `$HOME/.config/naabu/config.yaml`） |
| `-pd, -dashboard` | 上传结果到 ProjectDiscovery Cloud |

---

## 三、核心原理

### 3.1 SYN 扫描（半开扫描）

```
Naabu                              目标端
  │                                   │
  │──── SYN ─────────────────────────>│  构造原始 TCP SYN 包
  │                                   │
  │<─── SYN/ACK ─────────────────────│  端口开放
  │──── RST ─────────────────────────>│  立即重置（不完成握手）
  │                                   │
  │         或                        │
  │                                   │
  │<─── RST ─────────────────────────│  端口关闭
  │                                   │
  │         或                        │
  │                                   │
  │  （无响应）                        │  端口被过滤
```

**实现细节**：
- 使用 `Mzack9999/gopacket`（fork 自 google/gopacket）构造和发送原始 TCP 包
- 需要 root 权限（原始套接字）
- `blackrock` 密码算法随机化扫描顺序，避免 IDS 检测
- `ipranger` 基于 masscan 逻辑的 IP/端口随机化数据结构

### 3.2 CONNECT 扫描

```
Naabu                              目标端
  │                                   │
  │──── SYN ─────────────────────────>│
  │<─── SYN/ACK ─────────────────────│  端口开放
  │──── ACK ─────────────────────────>│  完成三次握手
  │──── RST/FIN ─────────────────────>│  关闭连接
  │                                   │
  │         或                        │
  │                                   │
  │<─── RST/ACK ─────────────────────│  端口关闭（ECONNREFUSED）
```

**实现细节**：
- 使用 Go 标准 `net.Dial` 完成完整 TCP 连接
- 无需 root 权限
- 支持 `-cp` 自定义载荷（主要用于 UDP 服务探测）

### 3.3 UDP 扫描

```
Naabu                              目标端
  │                                   │
  │──── UDP (empty/payload) ─────────>│  发送 UDP 探测
  │                                   │
  │<─── ICMP Port Unreachable ───────│  端口关闭
  │                                   │
  │         或                        │
  │                                   │
  │<─── UDP Response ────────────────│  端口开放
  │                                   │
  │         或                        │
  │                                   │
  │  （无响应）                        │  open|filtered
```

**实现细节**：
- 使用 gopacket 构造原始 UDP 包
- 对常见端口（如 DNS 53）发送协议特定载荷以提高响应率
- `-cp` 选项支持自定义 UDP 载荷

### 3.4 CDN 排除原理

```
┌──────────────────────────────────────────────────────┐
│              CDN 排除流程                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. DNS 解析目标域名获取 IP                            │
│                                                      │
│  2. cdncheck 检测 IP 是否属于 CDN                      │
│     ├── 基于 CIDR 列表匹配（Cloudflare/Akamai/等）     │
│     ├── 基于 CNAME 规则匹配                            │
│     └── 基于 HTTP 响应头特征                           │
│                                                      │
│  3. 分流处理                                          │
│     ├── CDN IP → 仅扫描 80,443 端口                   │
│     │   （CDN 后端端口不可达，全端口扫描浪费时间）       │
│     └── 非 CDN IP → 正常全端口扫描                     │
│                                                      │
│  4. 输出时标记 CDN 信息（-cdn 选项）                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 3.5 智能扫描原理

```
┌──────────────────────────────────────────────────────┐
│              智能扫描流程                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. 第一阶段：扫描常用端口（Top N）                     │
│     └── 快速发现高概率开放端口                          │
│                                                      │
│  2. 端口关联分析                                      │
│     ├── 基于历史数据建立的端口关联模型                   │
│     ├── 例：发现 80 开放 → 预测 443/8080/8443 可能开放  │
│     ├── 例：发现 3306 开放 → 预测 22/80 可能开放        │
│     └── 计算每个预测端口的置信度                        │
│                                                      │
│  3. 第二阶段：扫描预测端口                              │
│     ├── 仅扫描置信度 > threshold 的端口                 │
│     └── 默认阈值 20%（可调）                           │
│                                                      │
│  4. 优势                                             │
│     ├── 减少无效扫描（跳过大概率关闭的端口）             │
│     ├── 在保持高发现率的同时提升速度                    │
│     └── 适合大规模扫描场景                             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 3.6 主机发现原理

```
┌──────────────────────────────────────────────────────┐
│              主机发现流程                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ARP Ping (-arp)                                     │
│  ├── 发送 ARP 请求 → 收到 ARP 回复 = 主机存活          │
│  └── 仅适用于局域网（同网段）                          │
│                                                      │
│  ICMP Echo Ping (-pe)                                │
│  ├── 发送 ICMP type 8 → 收到 type 0 = 主机存活        │
│  └── 可能被防火墙阻止                                  │
│                                                      │
│  TCP SYN Ping (-ps)                                  │
│  ├── 发送 SYN 到指定端口 → 收到 SYN/ACK 或 RST = 存活  │
│  └── 可绕过仅过滤 ICMP 的防火墙                        │
│                                                      │
│  TCP ACK Ping (-pa)                                  │
│  ├── 发送 ACK 到指定端口 → 收到 RST = 存活             │
│  └── 可绕过仅过滤 SYN 的无状态防火墙                   │
│                                                      │
│  IPv6 Neighbor Discovery (-nd)                        │
│  ├── 发送 Neighbor Solicitation → 收到 Advertisement   │
│  └── IPv6 环境下的主机发现                             │
│                                                      │
│  多协议组合探测可提高发现率                              │
│  例：naabu -wn -pe -ps 80,443 -pa 80 -arp            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 四、整体架构

### 4.1 Naabu 内部架构

```
┌──────────────────────────────────────────────────────────────────┐
│                         Naabu 架构                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    命令行解析层                             │   │
│  │   goflags 解析 → 目标/端口/扫描类型/速率/输出              │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                    目标预处理层                             │   │
│  │  DNS 解析(dnsx) → CDN 检测(cdncheck) → IP 去重(ipranger) │   │
│  │  mapcidr 展开 CIDR → uncover 搜索引擎发现 → ASN 解析      │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                    扫描引擎层                               │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────┐            │   │
│  │  │ SYN 扫描  │  │ CONNECT 扫描  │  │ UDP 扫描  │            │   │
│  │  │(gopacket)│  │ (net.Dial)   │  │(gopacket)│            │   │
│  │  └──────────┘  └──────────────┘  └──────────┘            │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────┐            │   │
│  │  │主机发现   │  │ 智能扫描      │  │被动发现   │            │   │
│  │  │(ARP/ICMP)│  │(端口关联预测)  │  │(Shodan)  │            │   │
│  │  └──────────┘  └──────────────┘  └──────────┘            │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                    调度与优化层                             │   │
│  │  ratelimit  │ sizedwaitgroup │ blackrock 随机化 │ resume   │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                    输出与集成层                             │   │
│  │  JSON/CSV/TXT │ Nmap 集成 │ PD Cloud │ 管道(stdout)      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 关键 Go 库依赖

| 库 | 用途 |
|----|------|
| `Mzack9999/gopacket` | 原始套接字/SYN/UDP 扫描（fork 自 google/gopacket） |
| `projectdiscovery/cdncheck` | CDN/WAF/云技术检测 |
| `projectdiscovery/blackrock` | 基于 masscan 的端口随机化算法 |
| `projectdiscovery/ipranger` | IP/端口随机化数据结构 |
| `projectdiscovery/dnsx` | DNS 解析与验证 |
| `projectdiscovery/uncover` | 搜索引擎暴露主机发现 |
| `projectdiscovery/mapcidr` | CIDR 处理 |
| `projectdiscovery/ratelimit` | 请求限速 |
| `projectdiscovery/retryabledns` | DNS 查询重试 |
| `projectdiscovery/retryablehttp-go` | HTTP 请求重试 |
| `projectdiscovery/networkpolicy` | 网络策略控制 |
| `projectdiscovery/goflags` | 命令行参数解析 |
| `projectdiscovery/gologger` | 分级日志 |
| `projectdiscovery/clistats` | 统计信息显示 |
| `projectdiscovery/fdmax` | 文件描述符限制提升 |
| `projectdiscovery/freeport` | 获取空闲端口 |
| `projectdiscovery/utils` | 通用工具函数 |
| `projectdiscovery/hmap` | 混合内存/磁盘存储 |
| `projectdiscovery/fastdialer` | DNS 缓存拨号器 |
| `projectdiscovery/asnmap` | ASN 映射 |
| `miekg/dns` | DNS 协议库 |
| `armon/go-socks5` | SOCKS5 代理 |
| `Ullaakut/nmap/v3` | Nmap XML 输出解析 |
| `remeh/sizedwaitgroup` | 限大小等待组 |
| `yl2chen/cidranger` | CIDR 范围查找 |

---

## 五、工作流程

### 5.1 标准扫描流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 目标输入  │───>│ DNS 解析  │───>│ CDN 检测  │───>│ 端口扫描  │───>│ 结果验证  │
│          │    │ (dnsx)   │    │(cdncheck)│    │          │    │(verify)  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                                    │
┌──────────┐    ┌──────────┐    ┌──────────┐                        │
│ 结果输出  │<───│PD Cloud  │<───│ Nmap 集成 │<───────────────────────┘
│          │    │(可选)    │    │(可选)    │
└──────────┘    └──────────┘    └──────────┘
```

**各阶段详细说明**：

| 阶段 | 触发条件 | 说明 |
|------|----------|------|
| 目标输入 | 始终执行 | 从 STDIN/文件/参数读取目标 |
| DNS 解析 | 始终执行 | dnsx 解析域名为 IP，支持自定义解析器 |
| CDN 检测 | `-ec` 时执行 | cdncheck 检测 CDN IP，分流处理 |
| 端口扫描 | 默认执行 | SYN/CONNECT/UDP 扫描，智能扫描可选 |
| 结果验证 | `-verify` 时执行 | TCP 重新验证开放端口 |
| Nmap 集成 | `-nmap-cli` 时执行 | 对开放端口调用 nmap 做服务发现 |
| PD Cloud | `-pd` 时执行 | 上传结果到 ProjectDiscovery Cloud |
| 结果输出 | 始终执行 | JSON/CSV/TXT 格式输出 |

### 5.2 典型使用场景

#### 场景一：快速端口发现

```bash
naabu -host hackerone.com
```

流程：DNS 解析 → CONNECT 扫描 Top 100 端口 → 输出开放端口

#### 场景二：SYN 全端口扫描

```bash
sudo naabu -s s -p - -host target.com
```

流程：DNS 解析 → SYN 扫描全端口 → 输出开放端口

#### 场景三：CDN 感知扫描

```bash
naabu -host target.com -ec -cdn
```

流程：DNS 解析 → CDN 检测 → CDN IP 仅扫 80/443 → 非 CDN IP 全端口扫描 → 输出含 CDN 标记

#### 场景四：管道化协作

```bash
subfinder -d example.com | naabu -silent | httpx -silent
```

流程：子域名枚举 → 端口扫描 → HTTP 探测

#### 场景五：Nmap 服务发现

```bash
naabu -host target.com -nmap-cli 'nmap -sV -oX nmap-output'
```

流程：端口扫描 → 自动调用 nmap 对开放端口做版本检测

#### 场景六：被动端口发现

```bash
naabu -host target.com -passive
```

流程：DNS 解析 → 查询 Shodan InternetDB → 输出已知开放端口（无主动探测）

#### 场景七：智能扫描

```bash
naabu -host target.com -ss -pt 30
```

流程：扫描常用端口 → 端口关联预测 → 扫描预测端口（置信度 > 30%）

#### 场景八：主机发现

```bash
naabu -sn -pe -ps 80,443 -arp 192.168.1.0/24
```

流程：ICMP Echo + TCP SYN:80,443 + ARP Ping → 输出存活主机

#### 场景九：大规模扫描 + 详细检测

```bash
# 第一步：快速端口发现
naabu -l targets.txt -tp 1000 -rate 5000 -o ports.txt

# 第二步：对开放端口做详细检测
naabu -l targets.txt -p 22,80,443,3306,8080 -nmap-cli 'nmap -sV -sC'
```

### 5.3 管道化协作

Naabu 与 ProjectDiscovery 生态无缝管道化：

```bash
# 子域名 → 端口扫描 → HTTP 探测
subfinder -d example.com | naabu -silent | httpx -silent

# 子域名 → DNS 解析 → 端口扫描 → 漏洞扫描
subfinder -d example.com | dnsx -silent | naabu -silent | nuclei -t cves/

# 端口扫描 → 截图
naabu -host target.com -p 80,443 -silent | httpx -silent -ss

# CDN 排除 + 端口扫描
subfinder -d example.com | naabu -ec -silent | httpx -silent

# 被动发现 + 主动验证
naabu -host target.com -passive -silent | naabu -silent -verify

# 通过代理扫描
naabu -host target.com -proxy socks5://127.0.0.1:1080

# ASN 扫描
echo AS14421 | naabu -p 80,443 -silent
```

---

## 六、与 Nmap 对比

| 特性 | Naabu | Nmap |
|------|-------|------|
| 语言 | Go | C/C++ + Lua |
| SYN 扫描 | ✅ | ✅ |
| CONNECT 扫描 | ✅ | ✅ |
| UDP 扫描 | ✅ | ✅ |
| 版本检测 | ❌（集成 nmap） | ✅ |
| OS 检测 | ❌ | ✅ |
| 脚本引擎 | ❌ | ✅ NSE (Lua) |
| CDN 排除 | ✅ | ❌ |
| 被动发现 | ✅ Shodan InternetDB | ❌ |
| 智能扫描 | ✅ 端口关联预测 | ❌ |
| 管道化 | ✅ 原生 stdin/stdout | 部分支持 |
| 扫描速度 | 快 | 中 |
| 准确度 | 高 | 高 |
| 学习曲线 | 低 | 中-高 |
| 定位 | 快速端口发现+CDN感知 | 全面安全审计 |

**最佳实践**：
- **快速端口发现**：Naabu（速度快、CDN 感知、管道化）
- **全面安全审计**：Nmap（版本检测、OS 检测、NSE 脚本）
- **组合使用**：Naabu 快速发现端口 → `-nmap-cli` 自动调用 Nmap 做详细检测
- **大规模场景**：Naabu + httpx + nuclei 管道化

---

## 七、常用命令速查

```bash
# 基础扫描
naabu -host target.com
naabu -l targets.txt
naabu -host 192.168.1.0/24

# SYN 扫描（需 root）
sudo naabu -s s -host target.com

# 全端口扫描
naabu -p - -host target.com

# CDN 排除
naabu -host target.com -ec -cdn

# 管道化
subfinder -d example.com | naabu -silent | httpx -silent

# Nmap 集成
naabu -host target.com -nmap-cli 'nmap -sV'

# 被动发现
naabu -host target.com -passive

# 智能扫描
naabu -host target.com -ss

# 主机发现
naabu -sn -pe -ps 80,443 192.168.1.0/24

# UDP 扫描
naabu -p u:53,u:161 -host target.com

# 输出
naabu -host target.com -json -o results.json
naabu -host target.com -csv -o results.csv

# 代理扫描
naabu -host target.com -proxy socks5://127.0.0.1:1080

# ASN 扫描
echo AS14421 | naabu -p 80,443

# 速率控制
naabu -host target.com -rate 5000 -c 50

# 恢复扫描
naabu -resume
```
