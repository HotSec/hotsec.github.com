# iptables 与 netfilter

## 1. netfilter 架构

netfilter 是 Linux 内核级别的网络数据包过滤框架，iptables 是其用户空间配置工具。

### 1.1 五个钩子点

```
                    ┌─────────────────────────────────────────┐
                    │           Linux 内核网络栈               │
                    │                                         │
  网卡 ──→ PREROUTING ──→ 路由判断 ──→ FORWARD ──→ POSTROUTING ──→ 网卡
                            │                      ↑
                            ↓                      │
                         INPUT ──→ 本地进程 ──→ OUTPUT
```

| 钩子点 | 作用 | 触发时机 |
|--------|------|----------|
| PREROUTING | DNAT、路由前处理 | 数据包进入网卡后，路由判断前 |
| INPUT | 本地进程接收过滤 | 数据包目的地是本机 |
| FORWARD | 转发过滤 | 数据包目的地非本机，需转发 |
| OUTPUT | 本地发出过滤 | 本机进程发出的数据包 |
| POSTROUTING | SNAT、路由后处理 | 数据包离开网卡前 |

### 1.2 四张表

| 表 | 优先级 | 功能 | 包含的链 |
|----|--------|------|----------|
| raw | 1（最高） | 取消连接跟踪 | PREROUTING, OUTPUT |
| mangle | 2 | 修改数据包标记/TOS/TTL | 所有五个链 |
| nat | 3 | 地址转换（DNAT/SNAT） | PREROUTING, OUTPUT, POSTROUTING, INPUT |
| filter | 4 | 过滤（默认表） | INPUT, FORWARD, OUTPUT |

数据包处理优先级：raw → mangle → nat → filter

## 2. iptables 基本语法

### 2.1 命令格式

```bash
iptables [-t 表名] 命令 [链名] [匹配条件] [-j 动作]
```

### 2.2 管理命令

```bash
iptables -L                    # 列出所有规则
iptables -L -n                 # 不解析IP和端口（更快）
iptables -L -n -v              # 详细信息（包计数/字节计数）
iptables -L -n --line-numbers  # 显示行号
iptables -S                    # 以规则格式显示
iptables -t nat -L -n          # 查看nat表

iptables -A INPUT ...          # 追加规则到链末尾
iptables -I INPUT 2 ...        # 插入规则到第2行
iptables -R INPUT 2 ...        # 替换第2条规则
iptables -D INPUT 2            # 删除第2条规则
iptables -D INPUT -p tcp --dport 22 -j ACCEPT  # 按规则内容删除

iptables -F                    # 清空所有规则
iptables -F INPUT              # 清空INPUT链
iptables -X                    # 删除自定义空链
iptables -Z                    # 清零计数器

iptables -N MYCHAIN            # 新建自定义链
iptables -E MYCHAIN NEWCHAIN   # 重命名自定义链
iptables -X MYCHAIN            # 删除自定义空链

iptables -P INPUT DROP         # 设置默认策略
```

### 2.3 匹配条件

```bash
# 协议匹配
-p tcp
-p udp
-p icmp
-p all

# IP匹配
-s 192.168.1.0/24              # 源地址
-d 10.0.0.1                    # 目标地址
-s ! 192.168.1.1               # 取反

# 端口匹配（需 -p tcp/udp）
--sport 80                     # 源端口
--dport 22                     # 目标端口
--sport 1024:65535             # 端口范围
-m multiport --dports 80,443,8080  # 多端口

# 网卡匹配
-i eth0                        # 入站网卡（PREROUTING/INPUT/FORWARD）
-o eth1                        # 出站网卡（OUTPUT/POSTROUTING/FORWARD）

# TCP 标志
--tcp-flags SYN,RST,ACK SYN    # 匹配SYN包
--syn                          # 等同于 --tcp-flags SYN,RST,ACK SYN

# 连接状态匹配
-m state --state ESTABLISHED,RELATED
-m conntrack --ctstate ESTABLISHED,RELATED

# ICMP 类型
-p icmp --icmp-type 8          # echo-request（ping请求）
-p icmp --icmp-type 0          # echo-reply（ping回复）

# 速率限制
-m limit --limit 10/minute --limit-burst 20

# IP范围
-m iprange --src-range 192.168.1.100-192.168.1.200

# MAC地址
-m mac --mac-source 00:11:22:33:44:55

# 字符串匹配
-m string --string "example" --algo bm

# 注释
-m comment --comment "Allow SSH"
```

### 2.4 动作（Target）

```bash
-j ACCEPT                      # 接受数据包
-j DROP                        # 静默丢弃
-j REJECT --reject-with icmp-port-unreachable  # 拒绝并返回ICMP错误
-j LOG --log-prefix "IPTables: " --log-level 4  # 记录日志
-j DNAT --to-destination 10.0.0.2:8080         # 目标地址转换
-j SNAT --to-source 192.168.1.1                # 源地址转换
-j MASQUERADE                   # 动态SNAT（拨号/动态IP）
-j REDIRECT --to-port 8080     # 本地端口重定向
-j MARK --set-mark 1           # 设置数据包标记
-j RETURN                      # 返回调用链
-j MYCHAIN                     # 跳转到自定义链
```

## 3. 常用规则示例

### 3.1 基础防火墙

```bash
# 清空现有规则
iptables -F
iptables -X
iptables -Z

# 设置默认策略
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 允许回环接口
iptables -A INPUT -i lo -j ACCEPT

# 允许已建立的连接
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 允许 SSH
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -j ACCEPT

# 允许 HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -m state --state NEW -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -m state --state NEW -j ACCEPT

# 允许 ICMP（ping）
iptables -A INPUT -p icmp --icmp-type 8 -m state --state NEW -j ACCEPT

# 允许 DNS 查询
iptables -A INPUT -p udp --sport 53 -j ACCEPT

# 记录被拒绝的包
iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "iptables denied: " --log-level 4

# 最后拒绝所有其他
iptables -A INPUT -j REJECT --reject-with icmp-port-unreachable
```

### 3.2 NAT 网关

```bash
# 开启转发
echo 1 > /proc/sys/net/ipv4/ip_forward

# SNAT：内网通过公网IP上网
iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -o eth0 -j SNAT --to-source 203.0.113.1

# MASQUERADE：动态IP的SNAT
iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -o ppp0 -j MASQUERADE

# DNAT：端口映射（外部访问内部服务）
iptables -t nat -A PREROUTING -d 203.0.113.1 -p tcp --dport 80 -j DNAT --to-destination 192.168.1.100:8080

# 本地端口重定向
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
```

### 3.3 防攻击规则

```bash
# 防 SYN Flood
iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j ACCEPT
iptables -A INPUT -p tcp --syn -j DROP

# 防 ping 洪水
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/s -j ACCEPT

# 防端口扫描
iptables -A INPUT -p tcp --tcp-flags ALL NONE -j DROP
iptables -A INPUT -p tcp --tcp-flags ALL ALL -j DROP

# 防止 Xmas 扫描
iptables -A INPUT -p tcp --tcp-flags ALL FIN,URG,PSH -j DROP

# 限制 SSH 连接速率
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --set --name SSH
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --update --seconds 60 --hitcount 4 --name SSH -j DROP
```

### 3.4 Docker/K8s 相关

```bash
# Docker 默认创建的 iptables 规则
# - DOCKER 链：容器端口映射
# - DOCKER-ISOLATION-STAGE-1/2：容器网络隔离

# 查看 Docker NAT 规则
iptables -t nat -L DOCKER -n

# 查看 Docker 过滤规则
iptables -L DOCKER -n

# K8s kube-proxy iptables 模式
# - KUBE-SERVICES 链：Service 入口
# - KUBE-SVC-XXX 链：Service 具体规则
# - KUBE-SEP-XXX 链：Endpoint 规则
# - KUBE-NODEPORTS 链：NodePort 规则

iptables -t nat -L KUBE-SERVICES -n
iptables -t nat -L KUBE-NODEPORTS -n
```

## 4. 规则持久化

### 4.1 iptables-persistent（Debian/Ubuntu）

```bash
apt install iptables-persistent

iptables-save > /etc/iptables/rules.v4
ip6tables-save > /etc/iptables/rules.v6

netfilter-persistent save
netfilter-persistent reload
```

### 4.2 iptables-services（RHEL/CentOS）

```bash
yum install iptables-services

iptables-save > /etc/sysconfig/iptables
ip6tables-save > /etc/sysconfig/ip6tables

systemctl enable iptables
systemctl start iptables
```

### 4.3 手动方式

```bash
iptables-save > /etc/iptables.rules

# /etc/rc.local 或 systemd service 中
iptables-restore < /etc/iptables.rules
```

## 5. iptables vs nftables

| 特性 | iptables | nftables |
|------|----------|----------|
| 语法 | 多命令逐条添加 | 统一语法，支持批量 |
| 性能 | 线性匹配，规则多时慢 | 字典/集合查找，更快 |
| 协议支持 | iptables/ip6tables/arptables/ebtables 分离 | 统一框架 |
| 集合 | ipset 额外工具 | 内置 set/map |
| 调试 | 规则复杂时难追踪 | 内置追踪 nft trace |
| 兼容性 | 广泛 | CentOS 8+/Ubuntu 20.04+ 默认 |

### nftables 示例

```bash
nft list ruleset

nft add table ip myfilter
nft add chain ip myfilter input '{ type filter hook input priority 0 ; policy drop ; }'
nft add rule ip myfilter input iif lo accept
nft add rule ip myfilter input ct state established,related accept
nft add rule ip myfilter input tcp dport { 22, 80, 443 } accept

nft -f /etc/nftables.conf
```

## 6. 面试题

### 1. iptables 的四表五链？

四表：raw → mangle → nat → filter（优先级从高到低）
五链：PREROUTING → INPUT → FORWARD → OUTPUT → POSTROUTING

### 2. DNAT 和 SNAT 的区别？

- DNAT（目标地址转换）：在 PREROUTING 链，修改目标 IP，用于外部访问内部服务（端口映射）
- SNAT（源地址转换）：在 POSTROUTING 链，修改源 IP，用于内网通过公网 IP 上网
- MASQUERADE 是动态 SNAT，适用于动态 IP 场景

### 3. iptables 和 Firewalld 的关系？

Firewalld 是 iptables/nftables 的前端管理工具，提供 zone 概念和动态规则管理。Firewalld 底层调用 iptables/nftables 命令。

### 4. Docker 如何使用 iptables？

Docker 自动在 iptables 中创建 DOCKER 链和 NAT 规则，实现容器端口映射和网络隔离。手动修改 iptables 可能影响 Docker 网络功能，建议使用 Docker 自带网络管理。

### 5. conntrack 表满了怎么办？

```bash
# 查看当前连接跟踪数
cat /proc/sys/net/netfilter/nf_conntrack_count

# 查看最大值
cat /proc/sys/net/netfilter/nf_conntrack_max

# 调大
sysctl -w net.netfilter.nf_conntrack_max=524288

# 查看超时时间
sysctl net.netfilter.nf_conntrack_tcp_timeout_established

# 缩短超时
sysctl -w net.netfilter.nf_conntrack_tcp_timeout_established=7200
```
