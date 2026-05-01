# Firewalld

## 1. Firewalld 概述

Firewalld 是 Linux 动态防火墙管理工具，提供 D-Bus 接口，支持运行时修改规则而不断开现有连接。

### 1.1 核心特性

| 特性 | 说明 |
|------|------|
| 动态管理 | 运行时修改规则，无需重启 |
| Zone 概念 | 不同网络环境使用不同规则集 |
| 服务定义 | 预定义服务，简化端口管理 |
| 富规则 | 支持复杂条件规则 |
| 永久/运行时分离 | 修改需显式 reload 才永久生效 |

### 1.2 与 iptables 的关系

```
用户 → firewall-cmd/firewall-config → Firewalld守护进程 → iptables/nftables 后端
```

- Firewalld 是 iptables/nftables 的前端管理工具
- 默认使用 nftables 后端（CentOS 8+），可选 iptables 后端
- 不直接操作 iptables 规则，避免冲突

## 2. Zone（区域）

### 2.1 预定义 Zone

| Zone | 说明 | 适用场景 |
|------|------|----------|
| trusted | 允许所有流量 | 完全信任的网络 |
| home | 拒绝入站，允许出站 | 家庭网络 |
| internal | 拒绝入站，允许出站 | 内部网络 |
| work | 拒绝入站，允许出站 | 工作网络 |
| public | 拒绝入站，允许出站（默认） | 公共网络 |
| external | 拒绝入站，允许出站，支持 masquerade | 外部网络/NAT网关 |
| dmz | 拒绝入站，仅允许 SSH | DMZ 区域 |
| block | 拒绝所有入站 | 严格隔离 |
| drop | 丢弃所有入站（不回应） | 最高安全级别 |

### 2.2 Zone 管理

```bash
firewall-cmd --get-zones                 # 列出所有zone
firewall-cmd --get-default-zone          # 查看默认zone
firewall-cmd --set-default-zone=public   # 设置默认zone
firewall-cmd --get-active-zones          # 查看活动zone
firewall-cmd --get-zone-of-interface=eth0  # 查看接口所属zone

firewall-cmd --zone=public --list-all    # 查看zone详情
firewall-cmd --zone=public --list-all --permanent  # 查看永久配置

firewall-cmd --zone=public --change-interface=eth0  # 修改接口zone
firewall-cmd --zone=trusted --add-interface=eth1    # 添加接口到zone

firewall-cmd --permanent --zone=public --add-source=192.168.1.0/24  # 绑定源地址
firewall-cmd --permanent --zone=public --remove-source=192.168.1.0/24
```

## 3. 服务与端口管理

### 3.1 服务管理

```bash
firewall-cmd --get-services              # 列出所有预定义服务
firewall-cmd --zone=public --list-services  # 查看已开放服务

firewall-cmd --permanent --zone=public --add-service=http
firewall-cmd --permanent --zone=public --add-service=https
firewall-cmd --permanent --zone=public --add-service=ssh
firewall-cmd --permanent --zone=public --add-service=dns
firewall-cmd --permanent --zone=public --add-service=mysql

firewall-cmd --permanent --zone=public --remove-service=dhcpv6-client

firewall-cmd --reload                    # 重载永久配置
```

### 3.2 自定义服务

```xml
<!-- /etc/firewalld/services/myapp.xml -->
<?xml version="1.0" encoding="utf-8"?>
<service>
  <short>MyApp</short>
  <description>My Application Service</description>
  <port protocol="tcp" port="8080"/>
  <port protocol="tcp" port="8443"/>
</service>
```

```bash
firewall-cmd --permanent --zone=public --add-service=myapp
firewall-cmd --reload
```

### 3.3 端口管理

```bash
firewall-cmd --permanent --zone=public --add-port=8080/tcp
firewall-cmd --permanent --zone=public --add-port=9000-9100/tcp
firewall-cmd --permanent --zone=public --add-port=53/udp

firewall-cmd --permanent --zone=public --remove-port=8080/tcp

firewall-cmd --zone=public --list-ports   # 查看已开放端口
```

## 4. 富规则（Rich Rules）

富规则提供更精细的流量控制，支持源/目标地址、端口、协议、日志、动作等组合。

### 4.1 语法格式

```
rule [family="ipv4|ipv6"]
     [source address="addr[/mask]" [invert="true"]]
     [destination address="addr[/mask]" [invert="true"]]
     [service name="service"]
     [port port="port" protocol="tcp|udp"]
     [protocol value="protocol"]
     [icmp-block name="icmptype"]
     [masquerade]
     [forward-port port="port" protocol="tcp|udp" to-port="port" to-addr="addr"]
     [log [prefix="prefix"] [level="level"] [limit value="rate"]]
     [audit [limit value="rate"]]
     [accept|reject|drop]
```

### 4.2 常用示例

```bash
# 允许特定IP访问SSH
firewall-cmd --permanent --zone=public --add-rich-rule='
  rule family="ipv4" source address="192.168.1.0/24" service name="ssh" accept'

# 拒绝特定IP访问
firewall-cmd --permanent --zone=public --add-rich-rule='
  rule family="ipv4" source address="10.0.0.100" reject'

# 允许特定IP访问特定端口
firewall-cmd --permanent --zone=public --add-rich-rule='
  rule family="ipv4" source address="192.168.1.100" port port="3306" protocol="tcp" accept'

# 限制连接速率
firewall-cmd --permanent --zone=public --add-rich-rule='
  rule service name="ssh" log prefix="ssh_attempts" level="notice" limit value="3/m" accept'

# 端口转发
firewall-cmd --permanent --zone=public --add-rich-rule='
  rule family="ipv4" forward-port port="80" protocol="tcp" to-port="8080"'

# 端口转发到其他主机
firewall-cmd --permanent --zone=public --add-rich-rule='
  rule family="ipv4" forward-port port="80" protocol="tcp" to-port="80" to-addr="192.168.1.100"'

# 记录并拒绝非法访问
firewall-cmd --permanent --zone=public --add-rich-rule='
  rule family="ipv4" source address="0.0.0.0/0" port port="22" protocol="tcp" log prefix="SSH_REJECT" level="warning" reject'

# 查看富规则
firewall-cmd --zone=public --list-rich-rules

# 删除富规则
firewall-cmd --permanent --zone=public --remove-rich-rule='rule ...'
```

## 5. NAT 与端口转发

```bash
# 开启 masquerade（SNAT）
firewall-cmd --permanent --zone=external --add-masquerade
firewall-cmd --permanent --zone=public --add-masquerade

# 端口转发（简单方式）
firewall-cmd --permanent --zone=public --add-forward-port=port=80:proto=tcp:toport=8080
firewall-cmd --permanent --zone=public --add-forward-port=port=80:proto=tcp:toport=80:toaddr=192.168.1.100

# 查看转发规则
firewall-cmd --zone=public --list-forward-ports
```

## 6. 直接规则

直接规则允许直接操作 iptables/nftables，绕过 Firewalld 抽象层。

```bash
firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 0 -p tcp --dport 9090 -j ACCEPT
firewall-cmd --permanent --direct --add-rule ipv4 nat PREROUTING 0 -p tcp --dport 80 -j REDIRECT --to-port 8080

firewall-cmd --direct --get-all-rules
```

## 7. 与 Docker/K8s 的兼容性

### 7.1 Docker 兼容

Docker 直接操作 iptables，与 Firewalld 可能冲突：

```bash
# 方案1：使用 iptables 后端
# /etc/firewalld/firewalld.conf
FirewallBackend=iptables

# 方案2：Docker 配置使用 Firewalld
# /etc/docker/daemon.json
{
  "iptables": false,
  "ip6tables": false
}

# 方案3：放行 Docker 网络
firewall-cmd --permanent --zone=trusted --add-source=172.17.0.0/16
firewall-cmd --reload
```

### 7.2 K8s 兼容

```bash
# kube-proxy 使用 iptables 模式时
# 确保 Firewalld 不干扰 K8s 规则

# 放行 K8s 端口
firewall-cmd --permanent --zone=public --add-port=6443/tcp  # API Server
firewall-cmd --permanent --zone=public --add-port=2379-2380/tcp  # etcd
firewall-cmd --permanent --zone=public --add-port=10250/tcp  # kubelet
firewall-cmd --permanent --zone=public --add-port=10259/tcp  # scheduler
firewall-cmd --permanent --zone=public --add-port=10257/tcp  # controller-manager
firewall-cmd --permanent --zone=public --add-port=30000-32767/tcp  # NodePort

# Calico/Flannel 网络放行
firewall-cmd --permanent --zone=trusted --add-source=10.244.0.0/16
firewall-cmd --reload
```

## 8. Firewalld vs iptables 对比

| 特性 | Firewalld | iptables |
|------|-----------|----------|
| 规则管理 | 动态，运行时修改 | 静态，需重启生效 |
| 抽象层级 | Zone/服务/富规则 | 链/规则 |
| 配置方式 | firewall-cmd / XML | 命令行 / 配置文件 |
| 适用场景 | 桌面/服务器通用 | 精细控制/脚本 |
| 学习曲线 | 较低 | 较高 |
| Docker 兼容 | 可能冲突 | 原生支持 |
| 默认系统 | CentOS 7+/Ubuntu | 传统 Linux |

## 9. 面试题

### 1. Firewalld 的运行时配置和永久配置的区别？

- 运行时配置：立即生效，重启后丢失
- 永久配置：需 `--permanent` 参数，`firewall-cmd --reload` 后生效，重启后保留
- 最佳实践：先测试运行时配置，确认无误后添加 `--permanent`

### 2. Zone 的优先级？

1. 源地址绑定的 Zone（优先级最高）
2. 接口绑定的 Zone
3. 默认 Zone

### 3. 如何调试 Firewalld 规则？

```bash
firewall-cmd --state
firewall-cmd --zone=public --list-all
journalctl -u firewalld
iptables -L -n -v  # 查看底层规则
nft list ruleset    # nftables 后端
```
