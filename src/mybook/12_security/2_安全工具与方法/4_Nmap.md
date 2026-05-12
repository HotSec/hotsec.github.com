# Nmap — 网络映射器

> 官网：https://nmap.org/
> 源码：https://github.com/nmap/nmap（C/C++ + Lua）
> 许可证：GPLv2
> 首次发布：1997 年
> 作者：Gordon "Fyodor" Lyon

---

## 一、主要功能

Nmap（Network Mapper）是一款开源的网络探测和安全审计工具，设计用于快速扫描大型网络，同时也适用于单主机扫描。其核心能力是利用原始 IP 包以创新方式确定：

1. **网络中哪些主机存活**（主机发现）
2. **哪些端口开放**（端口扫描）
3. **运行什么服务及版本**（服务/版本检测）
4. **运行什么操作系统**（OS 指纹识别）
5. **防火墙/IDS 规则特征**（防火墙规避与探测）

---

## 二、详细功能列表

### 2.1 目标指定

| 选项 | 说明 | 示例 |
|------|------|------|
| 直接指定 | 单个主机名/IP | `nmap scanme.nmap.org`、`nmap 192.168.1.1` |
| CIDR | 子网范围 | `nmap 192.168.1.0/24` |
| 范围 | IP 范围 | `nmap 192.168.1.1-100` |
| 掩码 | 子网掩码 | `nmap 192.168.1.0/255.255.255.0` |
| 多目标 | 逗号分隔 | `nmap 192.168.1.1,10,50` |
| `-iL <file>` | 从文件读取目标列表 | `nmap -iL targets.txt` |
| `-iR <n>` | 随机选择 n 个目标 | `nmap -iR 100` |
| `--exclude <host>` | 排除指定主机 | `nmap 192.168.1.0/24 --exclude 192.168.1.1` |
| `--excludefile <file>` | 从文件读取排除列表 | `nmap -iL targets.txt --excludefile skip.txt` |

### 2.2 主机发现

| 选项 | 名称 | 原理 |
|------|------|------|
| `-sL` | 列表扫描 | 仅列出目标 IP，不做任何探测，执行反向 DNS 解析 |
| `-sn` | Ping 扫描 | 仅做主机发现，不执行端口扫描 |
| `-Pn` | 跳过主机发现 | 将所有目标视为在线，直接执行端口扫描 |
| `-PS<port>` | TCP SYN Ping | 发送 SYN 包，收到 SYN/ACK 或 RST 即判定主机存活 |
| `-PA<port>` | TCP ACK Ping | 发送 ACK 包，绕过仅过滤 SYN 的无状态防火墙 |
| `-PU<port>` | UDP Ping | 发送 UDP 包，收到 ICMP port unreachable 即判定存活 |
| `-PY<port>` | SCTP INIT Ping | 发送 SCTP INIT 块，收到 INIT-ACK 或 ABORT 即判定存活 |
| `-PE` | ICMP Echo Ping | 标准 ping 请求（type 8），期望 type 0 回复 |
| `-PP` | ICMP Timestamp Ping | ICMP 时间戳请求（type 13） |
| `-PM` | ICMP Address Mask Ping | ICMP 地址掩码请求（type 17） |
| `-PR` | ARP Ping | 本地网络 ARP 请求（默认对同网段目标自动启用） |
| `--disable-arp-ping` | 禁用 ARP | 跳过本地网络的 ARP 发现 |
| `--traceroute` | 路由追踪 | 扫描完成后执行 traceroute |

**默认主机发现行为**（无 `-P*` 选项时）：
- 特权用户：ICMP Echo + TCP SYN:443 + TCP ACK:80 + ICMP Timestamp
- 非特权用户：TCP SYN:80 + TCP SYN:443（使用 connect 系统调用）
- 本地网络：自动追加 ARP 发现

### 2.3 端口扫描技术

| 选项 | 名称 | 需要特权 | 原理 | 端口状态判定 |
|------|------|----------|------|-------------|
| `-sS` | TCP SYN 扫描 | ✅ root | 发送 SYN → 收到 SYN/ACK = open，收到 RST = closed | open/closed/filtered |
| `-sT` | TCP Connect 扫描 | ❌ | 使用 connect() 系统调用完成完整三次握手 | open/closed/filtered |
| `-sU` | UDP 扫描 | ✅ root | 发送 UDP 包 → 收到 ICMP port unreachable = closed | open/closed/filtered/open\|filtered |
| `-sY` | SCTP INIT 扫描 | ✅ root | 发送 INIT → 收到 INIT-ACK = open，ABORT = closed | open/closed/filtered |
| `-sN` | TCP NULL 扫描 | ✅ root | 不设置任何 TCP 标志位 | closed → RST，open → 无响应(open\|filtered) |
| `-sF` | TCP FIN 扫描 | ✅ root | 仅设置 FIN 标志位 | 同 NULL 扫描 |
| `-sX` | TCP Xmas 扫描 | ✅ root | 设置 FIN+PSH+URG 标志位 | 同 NULL 扫描 |
| `-sA` | TCP ACK 扫描 | ✅ root | 仅设置 ACK 标志位 | 用于映射防火墙规则(unfiltered/filtered) |
| `-sW` | TCP Window 扫描 | ✅ root | 同 ACK 扫描，但检查 RST 的 Window 字段 | Window>0 = open，Window=0 = closed |
| `-sM` | TCP Maimon 扫描 | ✅ root | 发送 FIN/ACK 探测 | BSD 系统开放端口丢弃该包 |
| `-sI <zombie>` | Idle 扫描（僵尸扫描） | ✅ root | 利用僵尸主机的 IP ID 递增判断端口状态 | open/closed/filtered |
| `-sO` | IP 协议扫描 | ✅ root | 发送原始 IP 包探测支持的协议 | open/closed/filtered |
| `-b` | FTP Bounce 扫描 | ❌ | 利用 FTP 代理跳板扫描（已过时） | 依赖 FTP 服务器配置 |
| `--scanflags` | 自定义 TCP 扫描 | ✅ root | 自定义任意 TCP 标志位组合 | 依赖基础扫描类型判定 |

**端口状态定义**：

| 状态 | 含义 |
|------|------|
| `open` | 应用正在监听该端口的连接/数据包 |
| `closed` | 端口可达但无应用监听 |
| `filtered` | 防火墙/过滤器阻止了探测，无法判断 open 或 closed |
| `unfiltered` | 端口可达但无法判断 open 或 closed |
| `open\|filtered` | 无法区分 open 和 filtered |
| `closed\|filtered` | 无法区分 closed 和 filtered |

### 2.4 端口指定与扫描顺序

| 选项 | 说明 | 示例 |
|------|------|------|
| `-p <port>` | 指定端口 | `-p 80`、`-p 1-65535`、`-p-`（全端口） |
| `-p U:53,T:21-25` | 按协议指定 | UDP 53 + TCP 21-25 |
| `-p-` | 扫描全部 65535 端口 | 全端口扫描 |
| `-F` | 快速模式，仅扫常用 100 端口 | 默认 1000 端口 → 100 端口 |
| `-r` | 顺序扫描 | 默认随机顺序，`-r` 改为顺序 |
| `--top-ports <n>` | 扫描最常用的 n 个端口 | `--top-ports 100` |
| `--port-ratio <ratio>` | 扫描频率大于 ratio 的端口 | `--port-ratio 0.5` |

### 2.5 服务与版本检测

| 选项 | 说明 |
|------|------|
| `-sV` | 启用版本检测 |
| `--version-intensity <0-9>` | 设置探测强度（0=最轻，9=全部），默认 7 |
| `--version-light` | 轻量模式（强度 2） |
| `--version-all` | 尝试所有探测（强度 9） |
| `--version-trace` | 跟踪版本扫描活动 |
| `--allports` | 不跳过任何端口（默认跳过 9100 等端口） |

**版本检测流程**：
1. 端口扫描发现开放端口
2. 查询 `nmap-service-probes` 数据库（650+ 协议，6500+ 模式匹配）
3. 按强度级别发送探测包（低强度先发通用探测，高强度发特定协议探测）
4. 匹配响应中的特征，提取：服务协议、应用名称、版本号、主机名、设备类型、OS 家族、CPE
5. 对 SSL/TLS 端口，自动连接获取加密层后的服务信息
6. 对 RPC 端口，自动执行 RPC grinder 确定 RPC 程序和版本号

### 2.6 操作系统检测

| 选项 | 说明 |
|------|------|
| `-O` | 启用 OS 检测 |
| `--osscan-limit` | 仅对有 open + closed 端口的主机做 OS 检测 |
| `--osscan-guess` / `--fuzzy` | 模糊匹配，更积极地猜测 OS |
| `--max-os-tries <n>` | 设置 OS 检测最大尝试次数 |

**OS 检测原理**：
- 发送一系列精心构造的 TCP/UDP 探测包
- 分析响应中的 TCP/IP 栈特征：ISN 采样、TCP 选项支持与排序、IP ID 采样、初始窗口大小、TTL 等
- 与 `nmap-os-db` 数据库（2600+ 指纹）比对
- 附加信息：TCP 序列可预测性分类、IP ID 序列生成模式、系统运行时间估算（TCP Timestamp）

### 2.7 Nmap 脚本引擎（NSE）

| 选项 | 说明 |
|------|------|
| `-sC` | 使用默认脚本集扫描 |
| `--script <script>` | 指定脚本/类别/目录/表达式 |
| `--script-args <args>` | 传递参数给脚本 |
| `--script-args-file <file>` | 从文件加载脚本参数 |
| `--script-help <script>` | 显示脚本帮助信息 |
| `--script-trace` | 跟踪脚本通信 |
| `--script-updatedb` | 更新脚本数据库 |

**NSE 脚本分类**：

| 类别 | 说明 | 风险等级 |
|------|------|----------|
| `auth` | 认证相关脚本（暴力破解、默认凭据） | 中-高 |
| `broadcast` | 广播发现网络主机 | 低 |
| `default` | 默认脚本集（`-sC`） | 低-中 |
| `discovery` | 网络和服务发现 | 低 |
| `dos` | 拒绝服务攻击脚本 | 高 |
| `exploit` | 漏洞利用脚本 | 高 |
| `external` | 向第三方发送数据 | 中 |
| `fuzzer` | 模糊测试脚本 | 中-高 |
| `intrusive` | 侵入性脚本 | 中-高 |
| `malware` | 恶意软件检测 | 低 |
| `safe` | 安全脚本（不会导致崩溃或大量流量） | 低 |
| `version` | 辅助版本检测 | 低 |
| `vuln` | 漏洞检测脚本 | 中 |

**脚本选择语法**：
```bash
nmap --script "http-*"                    # 通配符
nmap --script "not intrusive"             # 布尔表达式
nmap --script "default or safe"           # 或
nmap --script "default and safe"          # 与
nmap --script "(default or safe) and not http-*"  # 复合表达式
```

**常用 NSE 脚本示例**：

| 脚本 | 类别 | 用途 |
|------|------|------|
| `http-enum` | discovery | 枚举 Web 目录和常见应用 |
| `http-headers` | discovery | 获取 HTTP 响应头 |
| `http-methods` | discovery | 检测允许的 HTTP 方法 |
| `http-title` | default | 获取页面标题 |
| `ssl-heartbleed` | vuln | 检测 Heartbleed 漏洞 |
| `ssl-cert` | default | 获取 SSL 证书信息 |
| `smb-vuln*` | vuln | 检测 SMB 相关漏洞 |
| `dns-brute` | discovery | DNS 子域名爆破 |
| `auth-brute` | auth | 暴力破解认证 |
| `vuln` | vuln | 运行所有漏洞检测脚本 |

### 2.8 防火墙/IDS 规避

| 选项 | 说明 |
|------|------|
| `-f` | 分片发送数据包（8 字节/片） |
| `-f -f` | 分片发送（16 字节/片） |
| `--mtu <n>` | 自定义 MTU 偏移量（必须为 8 的倍数） |
| `-D <decoy1,decoy2,ME>` | 诱饵扫描，混淆真实来源 |
| `-S <IP>` | 伪造源地址 |
| `-e <iface>` | 指定网络接口 |
| `-g <port>` / `--source-port <port>` | 伪造源端口（利用防火墙对 53/DNS 等端口的信任） |
| `--data-length <n>` | 附加随机数据到数据包 |
| `--data <hex>` | 附加自定义二进制数据 |
| `--data-string <str>` | 附加自定义字符串 |
| `--ip-options <opts>` | 使用 IP 选项（记录路由/源路由等） |
| `--ttl <value>` | 设置 IP TTL 字段 |
| `--randomize-hosts` | 随机化目标主机顺序 |
| `--spoof-mac <addr>` | 伪造 MAC 地址 |

### 2.9 时序与性能

| 选项 | 说明 |
|------|------|
| `-T0` | Paranoid：极慢，串行扫描，5 分钟间隔 |
| `-T1` | Sneaky：隐蔽模式，15 秒间隔 |
| `-T2` | Polite：礼貌模式，0.4 秒间隔，降低带宽消耗 |
| `-T3` | Normal：默认模式 |
| `-T4` | Aggressive：激进模式，快速可靠网络 |
| `-T5` | Insane：疯狂模式，极快但可能不准确 |
| `--min-parallelism` / `--max-parallelism` | 探测并行度 |
| `--min-hostgroup` / `--max-hostgroup` | 主机分组大小 |
| `--min-rtt-timeout` / `--max-rtt-timeout` | RTT 超时范围 |
| `--host-timeout <time>` | 单主机超时（跳过慢主机） |
| `--scan-delay <time>` | 探测间延迟 |
| `--max-rate <n>` | 最大发送速率（包/秒） |
| `--min-rate <n>` | 最小发送速率 |

**时序模板参数对比**：

| 参数 | T0 | T1 | T2 | T3 | T4 | T5 |
|------|-----|-----|-----|-----|-----|-----|
| max-rtt-timeout | 1250ms | 1250ms | 1250ms | 1250ms | 1250ms | 300ms |
| scan-delay | 5min | 15s | 400ms | 0 | 0 | 0 |
| max-parallelism | 1 | 1 | - | - | - | - |
| initial-rtt-timeout | - | - | - | 1s | 500ms | 250ms |
| max-retries | - | - | - | 10 | 6 | 2 |

### 2.10 输出格式

| 选项 | 说明 |
|------|------|
| `-oN <file>` | 标准输出到文件 |
| `-oX <file>` | XML 输出 |
| `-oS <file>` | Script Kiddie 输出（混合大小写） |
| `-oG <file>` | Grepable 输出（便于 grep/awk 处理） |
| `-oA <basename>` | 同时输出所有格式（.nmap + .xml + .gnmap） |
| `-v` | 详细输出 |
| `-d` | 调试输出（`-dd` 更详细） |
| `--open` | 仅显示开放端口 |
| `--reason` | 显示端口状态判定原因 |
| `--packet-trace` | 跟踪所有发送/接收的数据包 |
| `--iflist` | 列出网络接口和路由 |

### 2.11 其他功能

| 选项 | 说明 |
|------|------|
| `-6` | IPv6 扫描 |
| `-A` | 激进扫描（OS 检测 + 版本检测 + 脚本扫描 + traceroute） |
| `--send-eth` | 使用原始以太网帧发送 |
| `--send-ip` | 使用原始 IP 套接字发送 |
| `--dns-servers <addr>` | 指定 DNS 服务器 |
| `-n` | 不做 DNS 解析 |
| `-R` | 始终做反向 DNS 解析 |
| `--resolve-all` | 解析主机名的所有 IP 地址（而非仅第一个） |
| `--stylesheet <path>` | 指定 XML 输出的 XSL 样式表 |

---

## 三、核心原理

### 3.1 TCP SYN 扫描（半开扫描）

```
扫描端                           目标端
  │                                │
  │──── SYN ──────────────────────>│  发送 SYN 到目标端口
  │                                │
  │<─── SYN/ACK ──────────────────│  端口开放：回应 SYN/ACK
  │──── RST ──────────────────────>│  立即重置连接（不完成握手）
  │                                │
  │         或                     │
  │                                │
  │<─── RST ──────────────────────│  端口关闭：回应 RST
  │                                │
  │         或                     │
  │                                │
  │  （无响应 / ICMP unreachable） │  端口被过滤
```

**优势**：
- 不完成三次握手，不会在应用层日志中记录连接
- 速度快，每秒可扫描数千端口
- 明确区分 open/closed/filtered 三种状态
- 对任何符合 TCP 标准的协议栈均有效

### 3.2 TCP Connect 扫描

```
扫描端                           目标端
  │                                │
  │──── SYN ──────────────────────>│
  │<─── SYN/ACK ──────────────────│  端口开放
  │──── ACK ──────────────────────>│  完成三次握手
  │──── RST ──────────────────────>│  主动关闭连接
  │                                │
  │         或                     │
  │                                │
  │<─── RST/ACK ──────────────────│  端口关闭（connect 返回 ECONNREFUSED）
```

**特点**：
- 使用操作系统 connect() 系统调用，无需 root 权限
- 完成完整三次握手，更易被日志记录
- 速度较 SYN 扫描慢（需要更多包和系统调用开销）
- 适用于无特权用户或无法使用原始套接字的场景

### 3.3 UDP 扫描

```
扫描端                           目标端
  │                                │
  │──── UDP (empty/port-specific) >│  发送 UDP 探测
  │                                │
  │<─── ICMP Port Unreachable ────│  端口关闭 (type 3, code 3)
  │                                │
  │         或                     │
  │                                │
  │<─── UDP Response ─────────────│  端口开放（少数服务会回应）
  │                                │
  │         或                     │
  │                                │
  │  （无响应）                    │  open|filtered
  │  （其他 ICMP unreachable）     │  filtered
```

**挑战**：
- UDP 无连接，大多数开放端口不回应空包 → 大量超时等待
- 许多系统限制 ICMP port unreachable 速率（Linux 默认 1 次/秒）
- 全端口 UDP 扫描可能需要 18+ 小时
- 可与 TCP 扫描组合：`-sU -sS` 同时扫描两种协议

**UDP 扫描加速技巧**：
- 优先扫描常用端口：`-sU --top-ports 100`
- 从防火墙内部扫描
- 使用 `--host-timeout` 跳过慢主机
- 并行扫描更多主机

### 3.4 NULL/FIN/Xmas 扫描（RFC 793 漏洞利用）

利用 TCP RFC 793 的规定：
- **关闭端口**收到不含 SYN/RST/ACK 的包 → 回复 RST
- **开放端口**收到不含 SYN/RST/ACK 的包 → 丢弃，不回复

```
NULL:  不设置任何标志位（TCP flag header = 0）
FIN:   仅设置 FIN
Xmas:  设置 FIN + PSH + URG（像圣诞树灯一样亮）
```

**优势**：
- 可绕过某些无状态防火墙和包过滤路由器
- 比 SYN 扫描更隐蔽

**限制**：
- Windows 系统不遵循 RFC 793，对所有探测都回复 RST，导致所有端口显示 closed
- 无法区分 open 和 filtered，只能报告 open|filtered
- 对 Cisco、BSDI、IBM OS/400 等系统同样无效

### 3.5 Idle 扫描（僵尸扫描）

Idle 扫描是一种极其隐蔽的扫描技术，完全不向目标发送任何来自真实 IP 的数据包：

```
扫描端                    僵尸主机                   目标端
  │                         │                         │
  │── SYN/ACK ────────────>│  ① 探测僵尸 IP ID       │
  │<── RST (IP ID=X) ─────│                         │
  │                         │                         │
  │                         │<── SYN (伪造自僵尸) ───│  ② 伪造 SYN 发向目标
  │                         │                         │
  │                         │── SYN/ACK ────────────>│  端口开放：目标回复 SYN/ACK
  │                         │<── RST (IP ID=X+1) ────│  僵尸回复 RST（IP ID 递增）
  │                         │                         │
  │── SYN/ACK ────────────>│  ③ 再次探测 IP ID       │
  │<── RST (IP ID=X+2) ───│  IP ID 递增了 2 → 开放   │
  │                         │                         │
  │         若端口关闭：     │                         │
  │                         │── RST ─────────────────>│  目标直接回复 RST 给僵尸
  │                         │  （僵尸不响应，IP ID 不变）│
  │── SYN/ACK ────────────>│  ③ 再次探测 IP ID       │
  │<── RST (IP ID=X+1) ───│  IP ID 仅递增 1 → 关闭   │
```

**原理**：
1. 探测僵尸主机的 IP ID 当前值
2. 伪造源地址为僵尸主机的 SYN 包发向目标
3. 再次探测僵尸主机的 IP ID 值
4. 根据 IP ID 递增幅度判断目标端口状态：
   - 递增 2 → 端口开放（僵尸收到了目标的 SYN/ACK 并回复了 RST）
   - 递增 1 → 端口关闭（目标直接回复 RST 给僵尸，僵尸不响应）

**僵尸主机选择条件**：
- IP ID 序列为递增模式（incremental）
- 空闲（不产生其他流量干扰 IP ID 计数）
- 常见候选：网络打印机、老旧路由器等

### 3.6 OS 指纹识别原理

```
┌─────────────────────────────────────────────────────┐
│              OS 指纹识别流程                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. 发送探测包序列                                    │
│     ├── TCP SYN → open port                         │
│     ├── TCP SYN → closed port                       │
│     ├── TCP NULL/FIN/Xmas → open/closed port        │
│     ├── UDP → closed port                           │
│     └── ICMP Echo/Timestamp                         │
│                                                     │
│  2. 采集 TCP/IP 栈特征                               │
│     ├── ISN（初始序列号）采样模式                      │
│     ├── TCP 选项支持与排序（MSS, Window Scale, SACK） │
│     ├── IP ID 序列生成模式                            │
│     ├── 初始窗口大小                                  │
│     ├── TTL 初始值                                   │
│     ├── RST 包特征                                   │
│     └── ICMP 响应行为                                │
│                                                     │
│  3. 与 nmap-os-db 比对（2600+ 指纹）                  │
│     ├── 精确匹配 → 输出 OS 名称 + CPE                │
│     ├── 近似匹配 → 显示置信度百分比                    │
│     └── 无匹配 → 输出指纹供提交                       │
│                                                     │
│  4. 附加信息                                         │
│     ├── TCP 序列可预测性分类                          │
│     ├── IP ID 序列生成模式                            │
│     └── 系统运行时间估算（TCP Timestamp）              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**OS 检测前提条件**：
- 至少需要一个 open 端口和一个 closed 端口
- 使用 `--osscan-limit` 可跳过不满足条件的主机以节省时间

### 3.7 版本检测原理

```
┌──────────────────────────────────────────────────────┐
│              版本检测流程                               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. 端口扫描发现开放端口                                │
│                                                      │
│  2. 查询 nmap-service-probes 数据库                    │
│     ├── 每个探测有 rarity 值（1-9）                    │
│     ├── 低 rarity = 通用探测（对多数服务有效）           │
│     └── 高 rarity = 特定协议探测                       │
│                                                      │
│  3. 按 intensity 级别发送探测                          │
│     ├── intensity 0-2：仅最通用探测                    │
│     ├── intensity 7（默认）：大多数有效探测              │
│     └── intensity 9：所有探测                          │
│                                                      │
│  4. 匹配响应特征                                      │
│     ├── 正则表达式匹配响应头/Body                      │
│     ├── 提取：服务协议/应用名/版本号/主机名/设备类型     │
│     └── 生成 CPE 标识                                 │
│                                                      │
│  5. 特殊处理                                          │
│     ├── SSL/TLS 端口：先完成 TLS 握手再探测             │
│     ├── RPC 端口：自动执行 RPC grinder                 │
│     └── open|filtered 端口：尝试探测以确认是否 open     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 3.8 NSE 脚本引擎架构

```
┌──────────────────────────────────────────────────────┐
│              NSE 执行流程                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  脚本预扫描阶段 (Script Pre-scanning)                  │
│  ├── 执行 prerule 脚本                                │
│  ├── 典型用途：broadcast 发现网络主机                   │
│  └── 在任何主机扫描之前运行                             │
│                                                      │
│  脚本扫描阶段 (Script Scanning)                        │
│  ├── 对每个主机执行 hostrule 脚本                      │
│  ├── 对每个端口执行 portrule 脚本                       │
│  ├── 脚本并行执行（Lua 协程）                          │
│  └── 通过 Nmap API 访问网络/目标信息                   │
│                                                      │
│  脚本后处理阶段 (Script Post-scanning)                  │
│  ├── 执行 postrule 脚本                               │
│  ├── 汇总/输出统计信息                                 │
│  └── 在所有主机扫描完成后运行                           │
│                                                      │
│  脚本钩子类型：                                        │
│  ├── prerule：扫描开始前执行（无条件）                  │
│  ├── hostrule：匹配特定主机特征时执行                   │
│  ├── portrule：匹配特定端口/服务时执行                  │
│  └── postrule：扫描结束后执行（无条件）                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**NSE 脚本基本结构**：
```lua
local nmap = require "nmap"
local shortport = require "shortport"

description = [[脚本描述]]

categories = {"default", "discovery"}

portrule = shortport.http

action = function(host, port)
    local response = nmap.fetchurl("http://" .. host.ip .. "/")
    if response then
        return "Response received"
    end
end
```

**常用 NSE Lua API**：

| 模块 | 用途 |
|------|------|
| `nmap` | 核心 API（fetchurl、new_socket、log 等） |
| `shortport` | 端口规则辅助（http、service 等） |
| `stdnse` | 标准库（sleep、format_output、verbose 等） |
| `comm` | 通用通信（连接、交换数据） |
| `http` | HTTP 客户端（get、post、head 等） |
| `snmp` | SNMP 协议交互 |
| `ssh2` | SSH 协议交互 |
| `tls` | TLS 协议交互 |
| `dns` | DNS 查询 |
| `brute` | 暴力破解框架 |

### 3.9 防火墙规避原理

```
┌──────────────────────────────────────────────────────┐
│              防火墙/IDS 规避技术                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  分片攻击 (-f / --mtu)                                │
│  ├── 将 TCP 头部分散到多个小 IP 分片中                  │
│  ├── 防火墙/IDS 可能无法重组分片 → 无法检测             │
│  └── 部分防火墙会队列重组所有分片（可防御）              │
│                                                      │
│  诱饵扫描 (-D)                                        │
│  ├── 同时从多个伪造 IP 发送探测包                       │
│  ├── 目标 IDS 看到多个来源的扫描                        │
│  ├── 使用 RND:10 生成 10 个随机诱饵 IP                 │
│  └── 注意：诱饵主机应在线，否则可能 SYN flood 目标      │
│                                                      │
│  Idle/僵尸扫描 (-sI)                                  │
│  ├── 完全不发送来自真实 IP 的探测包                     │
│  ├── 利用僵尸主机的 IP ID 递增判断端口状态              │
│  └── 极难被追踪（参见 3.5 节详细原理）                  │
│                                                      │
│  源端口欺骗 (-g / --source-port)                       │
│  ├── 利用防火墙对 DNS(53)/FTP(20) 源端口的信任          │
│  ├── 从受信任端口发送探测包                             │
│  └── 绕过基于源端口的过滤规则                           │
│                                                      │
│  IP 选项 (--ip-options)                               │
│  ├── 记录路由 (R)：获取到目标的路径                     │
│  ├── 严格/松散源路由 (S/L)：指定数据包路由              │
│  └── 绕过某些过滤规则                                  │
│                                                      │
│  MAC 地址伪造 (--spoof-mac)                            │
│  ├── 伪造源 MAC 地址                                   │
│  └── 模拟不同厂商设备                                  │
│                                                      │
│  随机化 (--randomize-hosts)                            │
│  ├── 随机化目标扫描顺序                                │
│  └── 避免扫描模式被 IDS 识别                           │
│                                                      │
│  数据填充 (--data-length)                              │
│  ├── 附加随机数据使包大小异常                           │
│  └── 干扰基于包大小的签名检测                           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 四、整体架构

### 4.1 Nmap 内部架构

```
┌──────────────────────────────────────────────────────────────────┐
│                         Nmap 架构                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    命令行解析层                             │   │
│  │   目标指定 → 扫描类型 → 时序模板 → 输出选项 → NSE 选项    │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                    核心引擎层                              │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │ 主机发现  │  │ 端口扫描  │  │ 版本检测  │  │ OS 检测  │ │   │
│  │  │  Engine   │  │  Engine   │  │  Engine   │  │ Engine   │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │              NSE 脚本引擎 (Lua)                       │ │   │
│  │  │  prerule → portrule/hostrule → postrule              │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                    调度与定时层                             │   │
│  │  时序模板 T0-T5 │ 并发控制 │ 速率限制 │ 超时管理          │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                    数据文件层                              │   │
│  │  nmap-services    │ nmap-service-probes │ nmap-os-db      │   │
│  │  nmap-protocols   │ nmap-rpc            │ script.db       │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                    原始包操作层                             │   │
│  │  libpcap/Npcap (抓包)  │  原始套接字 (发包)  │  libdnet    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    输出层                                  │   │
│  │  Normal │ XML │ Grepable │ Script Kiddie │ JSON (ndiff)   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 数据文件说明

| 文件 | 内容 | 条目数 |
|------|------|--------|
| `nmap-services` | 端口-服务映射及频率 | ~2,200 条 |
| `nmap-service-probes` | 版本探测规则 | 650+ 协议，6,500+ 模式 |
| `nmap-os-db` | OS 指纹数据库 | 2,600+ 指纹 |
| `nmap-protocols` | IP 协议映射 | ~260 条 |
| `nmap-rpc` | RPC 程序映射 | ~1,000 条 |
| `scripts/script.db` | NSE 脚本索引 | 600+ 脚本 |

### 4.3 Nmap 套件工具

Nmap 项目不仅包含核心扫描器，还提供一组配套工具：

| 工具 | 语言 | 功能 |
|------|------|------|
| **Nmap** | C/C++ + Lua | 核心扫描引擎 |
| **Zenmap** | Python (GTK) | 图形化前端，支持配置文件、扫描对比、可视化拓扑 |
| **Ncat** | C | 通用网络工具（替代 netcat），支持 SSL、代理、广播 |
| **Nping** | C | 网络包生成/响应分析，自定义 TCP/UDP/ICMP 探测 |
| **Ndiff** | Python | 对比两次 Nmap 扫描结果，检测网络变化 |

**Ncat 常用场景**：
```bash
ncat example.com 80                    # 连接 HTTP 端口
ncat -l 8080                           # 监听端口
ncat --ssl example.com 443             # SSL 连接
ncat --proxy proxy.example.com 8080    # 通过代理连接
ncat -l --sh-exec "echo hello"         # 监听并执行命令
ncat --broker -l 8080                  # 聊天代理模式
```

**Ndiff 使用示例**：
```bash
ndiff baseline.xml current.xml         # 对比两次扫描差异
```

**Nping 使用示例**：
```bash
nping --tcp -p 80 example.com          # TCP 探测
nping --udp -p 53 example.com          # UDP 探测
nping --icmp example.com               # ICMP 探测
nping --tcp -p 80 --flags syn example.com  # 自定义 TCP 标志
```

---

## 五、工作流程

### 5.1 标准扫描流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 目标解析  │───>│ 主机发现  │───>│ 反向 DNS  │───>│ 端口扫描  │───>│ 版本检测  │
│          │    │ (Ping)   │    │ 解析     │    │          │    │ (-sV)    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                                    │
┌──────────┐    ┌──────────┐    ┌──────────┐                        │
│ 结果输出  │<───│ NSE 脚本  │<───│ OS 检测  │<───────────────────────┘
│          │    │ 执行     │    │ (-O)     │
└──────────┘    └──────────┘    └──────────┘
```

**各阶段详细说明**：

| 阶段 | 触发条件 | 说明 |
|------|----------|------|
| 目标解析 | 始终执行 | 解析主机名为 IP，展开 CIDR/范围 |
| 主机发现 | 默认启用（`-Pn` 跳过） | 多协议 Ping 确定存活主机 |
| 反向 DNS | 默认启用（`-n` 跳过） | 对存活主机做反向 DNS 解析 |
| 端口扫描 | 默认执行 SYN 扫描 | 扫描指定端口范围 |
| 版本检测 | 需 `-sV` 或 `-A` | 对开放端口做服务/版本探测 |
| OS 检测 | 需 `-O` 或 `-A` | 对存活主机做 OS 指纹识别 |
| NSE 脚本 | 需 `-sC` 或 `--script` | 执行匹配的 NSE 脚本 |
| 结果输出 | 始终执行 | 按指定格式输出结果 |

### 5.2 典型使用场景

#### 场景一：快速网络侦察

```bash
nmap -sn 192.168.1.0/24
```

流程：ARP Ping → TCP SYN:443 + TCP ACK:80 + ICMP Echo → 输出存活主机列表

#### 场景二：全端口服务发现

```bash
nmap -sS -sV -p- -T4 192.168.1.1
```

流程：SYN 扫描全端口 → 版本检测 → 输出开放端口+服务版本

#### 场景三：全面安全审计

```bash
nmap -A -T4 -oA audit_results 192.168.1.1
```

流程：主机发现 → SYN 端口扫描 → 版本检测 → OS 检测 → NSE 默认脚本 → traceroute → 全格式输出

#### 场景四：隐蔽扫描

```bash
nmap -sS -T2 -f -D RND:10 --source-port 53 --randomize-hosts 10.0.0.0/24
```

流程：分片 SYN 扫描 → 10 个诱饵 IP → 源端口 53 → 慢速 → 随机顺序

#### 场景五：漏洞检测

```bash
nmap -sV --script vuln 192.168.1.1
```

流程：版本检测 → 匹配服务 → 执行 vuln 类 NSE 脚本 → 输出漏洞信息

#### 场景六：Web 服务器安全检查

```bash
nmap -sV -sC --script http-enum,http-headers,http-methods,ssl-heartbleed -p 80,443,8080 target.com
```

流程：指定端口扫描 → 版本检测 → HTTP 枚举/头部/方法检测 → SSL Heartbleed 检测

#### 场景七：僵尸主机扫描

```bash
nmap -sI zombie.example.com target.com
```

流程：探测僵尸 IP ID → 伪造 SYN → 再探测 IP ID → 判断端口状态（完全隐藏扫描者 IP）

#### 场景八：大规模快速扫描 + 详细检测

```bash
# 第一步：快速端口发现
nmap -sS -T4 --top-ports 1000 -oG fast_scan.gnmap 192.168.0.0/16

# 第二步：对开放端口做详细检测
nmap -sV -sC -A -p 22,80,443,3306,8080 -iL open_hosts.txt -oA detailed_scan
```

### 5.3 管道化协作

Nmap 可与其他安全工具管道化协作：

```bash
# Nmap 扫描 → Ndiff 对比变化
nmap -oX baseline.xml 192.168.1.0/24
nmap -oX current.xml 192.168.1.0/24
ndiff baseline.xml current.xml

# Nmap XML → Python 解析
nmap -oX - 192.168.1.1 | python3 analyze.py

# Nmap 发现开放端口 → Nc 验证
nmap -p 80 --open -oG - 192.168.1.0/24 | awk '/open/{print $2}'

# Nmap + Ncat 组合
nmap -p 443 --open 192.168.1.0/24 -oG - | awk '/open/{print $2}' | xargs -I{} ncat --ssl {} 443

# Nmap + Masscan 组合（大规模场景）
masscan -p1-65535 10.0.0.0/8 --rate=10000 -oL ports.txt
nmap -sV -sC -iL open_hosts.txt -oA detailed_scan

# Nmap Grepable → 提取特定服务
nmap -p 22 --open -oG - 192.168.1.0/24 | awk '/open/{print $2}' > ssh_hosts.txt
```

---

## 六、与同类工具对比

| 特性 | Nmap | Masscan | RustScan | Naabu |
|------|------|---------|----------|-------|
| 语言 | C/C++ + Lua | C | Rust | Go |
| SYN 扫描 | ✅ | ✅ | ✅（调用 Nmap） | ✅ |
| UDP 扫描 | ✅ | ❌ | ❌ | ✅ |
| 版本检测 | ✅ | ❌ | ❌（调用 Nmap） | ❌ |
| OS 检测 | ✅ | ❌ | ❌（调用 Nmap） | ❌ |
| 脚本引擎 | ✅ NSE (Lua) | ❌ | ❌（调用 Nmap） | ❌ |
| Idle 扫描 | ✅ | ❌ | ❌ | ❌ |
| 全端口扫描速度 | 中 | 极快（3分钟全网） | 快 | 快 |
| 准确度 | 高 | 中 | 依赖 Nmap | 高 |
| CDN 排除 | ❌ | ❌ | ❌ | ✅ |
| 定位 | 全面安全审计 | 快速端口发现 | 快速端口发现+委托Nmap | 端口扫描+CDN感知 |

**最佳实践**：
- **全面审计**：直接使用 Nmap
- **大规模快速端口发现**：Masscan/RustScan 快扫 → Nmap 对开放端口做详细检测
- **CDN 感知扫描**：Naabu 自动排除 CDN IP
- **隐蔽扫描**：Nmap Idle 扫描（`-sI`）或诱饵扫描（`-D`）

---

## 七、常用命令速查

```bash
# 基础扫描
nmap 192.168.1.1
nmap -sn 192.168.1.0/24
nmap -sS -p- 192.168.1.1

# 服务发现
nmap -sV 192.168.1.1
nmap -A 192.168.1.1

# 漏洞扫描
nmap --script vuln 192.168.1.1
nmap --script http-enum 192.168.1.1

# 规避扫描
nmap -sS -T2 -f -D RND:5 192.168.1.1

# Idle 扫描
nmap -sI zombie.example.com target.com

# 输出
nmap -oA results 192.168.1.1
nmap --open -oG - 192.168.1.0/24

# UDP 扫描
nmap -sU -sS -p U:53,161,T:21-80 192.168.1.1

# 从文件读取目标
nmap -iL targets.txt -oA scan_results

# 指定端口范围
nmap -p 22,80,443,3306,8080 192.168.1.1
nmap --top-ports 100 -T4 192.168.1.1

# 排除主机
nmap 192.168.1.0/24 --exclude 192.168.1.1-10
```
