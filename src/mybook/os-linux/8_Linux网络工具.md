# Linux 网络工具

## 1. 网络诊断工具

### 1.1 ip 命令（替代 ifconfig）

```bash
ip addr show                       # 查看所有IP地址
ip addr show eth0                  # 查看指定网卡
ip addr add 192.168.1.100/24 dev eth0   # 添加IP
ip addr del 192.168.1.100/24 dev eth0   # 删除IP

ip link show                       # 查看所有网卡
ip link set eth0 up                # 启用网卡
ip link set eth0 down              # 禁用网卡
ip link set eth0 mtu 9000          # 设置MTU

ip route show                      # 查看路由表
ip route add 10.0.0.0/8 via 192.168.1.1    # 添加路由
ip route add default via 192.168.1.1        # 添加默认路由
ip route del 10.0.0.0/8                      # 删除路由

ip neigh show                      # 查看ARP表
ip neigh del 192.168.1.1 dev eth0  # 删除ARP条目
```

### 1.2 ss 命令（替代 netstat）

```bash
ss -s                              # 连接统计
ss -t                              # TCP连接
ss -u                              # UDP连接
ss -l                              # 监听端口
ss -n                              # 不解析服务名
ss -tlnp                           # TCP监听+进程
ss -tn state established           # 已建立的TCP连接
ss -tn state time-wait | wc -l     # TIME_WAIT数量
ss -tn dst :80                     # 目标端口80的连接
ss -tn src 192.168.1.100           # 源IP的连接
ss -ti                             # TCP内部信息（RTT/拥塞窗口）
ss -to                             # 带超时信息
```

### 1.3 ping 与连通性

```bash
ping -c 4 8.8.8.8                  # 发送4个包
ping -i 0.1 8.8.8.8                # 0.1秒间隔
ping -s 1400 -M do 8.8.8.8        # MTU探测
ping -W 2 -c 1 192.168.1.1        # 超时2秒

traceroute 8.8.8.8                 # 路由追踪
traceroute -T -p 80 8.8.8.8       # TCP追踪
mtr -rwzbc 100 8.8.8.8            # 持续路由追踪
```

## 2. 流量分析工具

### 2.1 tcpdump

```bash
tcpdump -i eth0                    # 抓取eth0流量
tcpdump -i eth0 -nn                # 不解析主机名和端口名
tcpdump -i eth0 -c 100             # 抓取100个包
tcpdump -i eth0 -w capture.pcap    # 保存到文件
tcpdump -r capture.pcap            # 读取文件

tcpdump -i eth0 host 192.168.1.1   # 指定主机
tcpdump -i eth0 src 192.168.1.1    # 源地址
tcpdump -i eth0 dst 10.0.0.1       # 目标地址
tcpdump -i eth0 port 80            # 指定端口
tcpdump -i eth0 portrange 8000-9000
tcpdump -i eth0 tcp port 80        # TCP 80端口
tcpdump -i eth0 udp port 53        # UDP 53端口

tcpdump -i eth0 'tcp[tcpflags] & (tcp-syn) != 0'           # SYN包
tcpdump -i eth0 'tcp[tcpflags] & (tcp-rst) != 0'           # RST包
tcpdump -i eth0 'tcp[tcpflags] & (tcp-syn|tcp-ack) != 0'   # SYN+ACK包

tcpdump -i eth0 -nn -vvv -X port 80   # 详细输出+十六进制
tcpdump -i eth0 -G 3600 -w '%Y%m%d_%H%M%S.pcap'  # 每小时轮转
```

### 2.2 nethogs

```bash
nethogs                            # 按进程显示流量
nethogs eth0                       # 指定网卡
nethogs -t                         # tracemode
nethogs -d 2                       # 2秒刷新
```

### 2.3 iftop

```bash
iftop -i eth0                      # 指定网卡
iftop -n                           # 不解析主机名
iftop -N                           # 不解析端口名
iftop -P                           # 显示端口
iftop -F 192.168.1.0/24            # 过滤网段
```

## 3. 连接管理工具

### 3.1 nc（netcat）

```bash
nc -zv 192.168.1.1 80              # 端口扫描
nc -zv 192.168.1.1 22 80 443       # 多端口扫描
nc -zv 192.168.1.1 1-1024          # 端口范围

nc -l 8080                         # 监听端口
nc 192.168.1.1 8080                # 连接端口

nc -l 8080 > received.txt          # 接收文件
nc 192.168.1.1 8080 < send.txt     # 发送文件

nc -l 8080 | tar xzf -             # 接收并解压
tar czf - /data | nc 192.168.1.1 8080  # 打包并发送

echo -e "GET / HTTP/1.0\r\nHost: example.com\r\n\r\n" | nc example.com 80
```

### 3.2 curl

```bash
curl -v https://example.com        # 详细输出
curl -I https://example.com        # 仅头部
curl -X POST -d '{"key":"value"}' -H "Content-Type: application/json" https://api.example.com
curl -o output.html https://example.com
curl -L https://example.com        # 跟随重定向
curl -k https://self-signed.badssl.com  # 忽略证书
curl -w "time_total: %{time_total}\n" -o /dev/null -s https://example.com
curl --connect-timeout 5 --max-time 10 https://example.com
curl -u user:pass https://api.example.com
curl -b "session=abc" https://example.com
curl -c cookies.txt https://example.com
```

## 4. 网络配置

### 4.1 Bridge（网桥）

```bash
ip link add br0 type bridge        # 创建网桥
ip link set br0 up                 # 启用网桥
ip link set eth0 master br0        # 添加接口到网桥
ip link set eth0 nomaster          # 从网桥移除接口
ip addr add 192.168.1.1/24 dev br0 # 配置IP

brctl show                         # 查看网桥
bridge fdb show                    # 查看MAC转发表
```

### 4.2 VLAN

```bash
ip link add link eth0 name eth0.100 type vlan id 100
ip link set eth0.100 up
ip addr add 192.168.100.1/24 dev eth0.100

vconfig add eth0 100               # 旧命令
```

### 4.3 Bonding（链路聚合）

```bash
ip link add bond0 type bond mode 802.3ad
ip link set eth0 master bond0
ip link set eth1 master bond0
ip link set bond0 up
ip addr add 192.168.1.1/24 dev bond0

cat /proc/net/bonding/bond0        # 查看bond状态
```

| 模式 | 说明 |
|------|------|
| balance-rr (0) | 轮询 |
| active-backup (1) | 主备 |
| balance-xor (2) | XOR |
| broadcast (3) | 广播 |
| 802.3ad (4) | LACP |
| balance-tlb (5) | 自适应发送 |
| balance-alb (6) | 自适应收发 |

## 5. DNS 工具

```bash
dig example.com                    # 查询A记录
dig example.com AAAA               # 查询AAAA记录
dig example.com MX                 # 查询MX记录
dig example.com NS                 # 查询NS记录
dig example.com TXT                # 查询TXT记录
dig example.com +short             # 简洁输出
dig example.com +trace             # 追踪解析过程
dig @8.8.8.8 example.com           # 指定DNS服务器
dig -x 203.0.113.1                 # 反向解析

host example.com                   # 简单查询
host -t MX example.com

nslookup example.com               # 交互式查询
nslookup example.com 8.8.8.8

resolvectl query example.com       # systemd-resolved
resolvectl status
```

## 6. 面试题

### 1. ss 和 netstat 的区别？

- ss 从内核 netlink socket 获取数据，更快
- netstat 从 /proc/net/tcp 读取，连接多时很慢
- ss 支持更多 TCP 内部信息（RTT/拥塞窗口）
- 推荐使用 ss 替代 netstat

### 2. 如何抓取 TCP 三次握手？

```bash
tcpdump -i eth0 -nn 'tcp[tcpflags] & (tcp-syn|tcp-ack) != 0 and port 80'
```

### 3. 如何排查网络延迟？

```bash
ping -c 10 target                  # 基本延迟
mtr -rwzbc 100 target              # 逐跳延迟
traceroute -T -p 80 target         # TCP层追踪
tcptraceroute target 80            # TCP路由追踪
curl -w "dns: %{time_namelookup} connect: %{time_connect} total: %{time_total}\n" -o /dev/null -s http://target
```
