# DenyHosts 与 SSH 安全

## 1. SSH 暴力破解

### 1.1 攻击原理

暴力破解通过自动化工具尝试大量用户名/密码组合登录 SSH 服务。常见特征：
- 短时间内大量来自同一 IP 的登录失败
- 尝试常见用户名（root/admin/user/test）
- 使用常见弱密码字典

### 1.2 检测方法

```bash
grep "Failed password" /var/log/auth.log | head -20     # Debian/Ubuntu
grep "Failed password" /var/log/secure | head -20       # RHEL/CentOS

grep "Failed password" /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head -10

grep "Invalid user" /var/log/auth.log | awk '{print $10}' | sort | uniq -c | sort -rn | head -10

lastb | head -20
```

## 2. DenyHosts

### 2.1 工作原理

DenyHosts 是 Python 编写的 SSH 防暴力破解工具：
1. 定期扫描 `/var/log/auth.log` 或 `/var/log/secure`
2. 统计失败登录次数
3. 超过阈值时将攻击 IP 写入 `/etc/hosts.deny`
4. 支持 TCP Wrapper 机制阻断连接

### 2.2 安装

```bash
# Debian/Ubuntu
apt install denyhosts

# RHEL/CentOS
yum install denyhosts

# 源码安装
pip install DenyHosts
```

### 2.3 配置

```bash
# /etc/denyhosts.conf

SECURE_LOG = /var/log/auth.log
HOSTS_DENY = /etc/hosts.deny

PURGE_DENY = 1d
PURGE_THRESHOLD = 2

BLOCK_SERVICE = sshd

DENY_THRESHOLD_INVALID = 5
DENY_THRESHOLD_VALID = 10
DENY_THRESHOLD_ROOT = 3
DENY_THRESHOLD_RESTRICTED = 1

WORK_DIR = /var/lib/denyhosts
LOCK_FILE = /var/run/denyhosts.pid

ADMIN_EMAIL = admin@example.com
SMTP_HOST = localhost
SMTP_PORT = 25

AGE_RESET_INVALID = 10d
AGE_RESET_VALID = 20d
AGE_RESET_ROOT = 30d
```

### 2.4 管理

```bash
systemctl start denyhosts
systemctl enable denyhosts
systemctl status denyhosts

cat /etc/hosts.deny                      # 查看被封锁的IP
cat /var/lib/denyhosts/hosts             # 查看封锁记录
cat /var/lib/denyhosts/hosts-restricted  # 受限主机
cat /var/lib/denyhosts/hosts-root        # 尝试root登录的主机

# 手动解封IP
denyhosts-cli --allow 192.168.1.100

# 清除所有封锁
denyhosts-cli --purge
```

## 3. Fail2Ban

Fail2Ban 是比 DenyHosts 更强大的替代方案，支持多种服务。

### 3.1 工作原理

1. 监控日志文件（正则匹配）
2. 统计失败次数
3. 调用 iptables/Firewalld 封禁 IP
4. 超时后自动解封

### 3.2 安装

```bash
apt install fail2ban        # Debian/Ubuntu
yum install fail2ban        # RHEL/CentOS
pip install fail2ban        # pip
```

### 3.3 配置

```ini
# /etc/fail2ban/jail.local

[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
banaction = iptables-multiport
action = %(action_mwl)s

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200

[sshd-ddos]
enabled = true
port = ssh
filter = sshd-ddos
logpath = /var/log/auth.log
maxretry = 5

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log

[nginx-botsearch]
enabled = true
port = http,https
filter = nginx-botsearch
logpath = /var/log/nginx/access.log

[postfix]
enabled = true
port = smtp
filter = postfix
logpath = /var/log/mail.log

[dovecot]
enabled = true
port = pop3,pop3s,imap,imaps
filter = dovecot
logpath = /var/log/mail.log
```

### 3.4 管理

```bash
systemctl start fail2ban
systemctl enable fail2ban

fail2ban-client status                    # 查看所有jail
fail2ban-client status sshd               # 查看sshd jail详情
fail2ban-client set sshd banip 10.0.0.1   # 手动封禁
fail2ban-client set sshd unbanip 10.0.0.1 # 手动解封
fail2ban-client reload                    # 重载配置
fail2ban-client banned                    # 查看所有被封IP

# 查看日志
tail -f /var/log/fail2ban.log
```

### 3.5 自定义 Filter

```ini
# /etc/fail2ban/filter.d/myapp.conf

[Definition]
failregex = ^.*Authentication failure for .* from <HOST>.*$
            ^.*Failed login attempt from <HOST>.*$
ignoreregex =
```

### 3.6 使用 Firewalld 后端

```ini
# /etc/fail2ban/jail.local

[DEFAULT]
banaction = firewallcmd-rich-rules
banaction_allports = firewallcmd-ipset
```

## 4. SSH 安全加固最佳实践

### 4.1 sshd_config 加固

```bash
# /etc/ssh/sshd_config

Port 2222                              # 修改默认端口
PermitRootLogin no                     # 禁止root登录
PermitRootLogin prohibit-password      # 或仅允许密钥登录root
PasswordAuthentication no              # 禁用密码认证
PubkeyAuthentication yes               # 启用密钥认证
AuthorizedKeysFile .ssh/authorized_keys

MaxAuthTries 3                         # 最大尝试次数
LoginGraceTime 30                      # 登录超时
MaxSessions 5                          # 最大会话数
MaxStartups 3:50:10                    # 未认证连接限制

AllowUsers admin@192.168.1.0/24        # 限制用户和来源
AllowGroups ssh-users                   # 限制用户组

ClientAliveInterval 300                # 心跳检测
ClientAliveCountMax 2                  # 心跳超时次数

X11Forwarding no                       # 禁用X转发
AllowTcpForwarding no                  # 禁用TCP转发
PermitTunnel no                        # 禁用隧道
PermitEmptyPasswords no                # 禁止空密码

Banner /etc/ssh/banner                 # 登录提示
```

### 4.2 密钥认证

```bash
ssh-keygen -t ed25519 -C "admin@server"
ssh-keygen -t rsa -b 4096 -C "admin@server"

ssh-copy-id -i ~/.ssh/id_ed25519.pub admin@server
ssh-copy-id -p 2222 admin@server

# ~/.ssh/authorized_keys 安全
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 限制密钥用途
command="/usr/bin/backup.sh",no-port-forwarding,no-X11-forwarding ssh-ed25519 AAAA...
```

### 4.3 iptables/Firewalld 联动

```bash
# iptables 限制SSH连接速率
iptables -A INPUT -p tcp --dport 2222 -m conntrack --ctstate NEW -m recent --set --name SSH
iptables -A INPUT -p tcp --dport 2222 -m conntrack --ctstate NEW -m recent --update --seconds 60 --hitcount 4 --name SSH -j DROP

# Firewalld 富规则
firewall-cmd --permanent --zone=public --add-rich-rule='
  rule service name="ssh" log prefix="ssh_rate" level="notice" limit value="3/m" accept'
```

### 4.4 白名单策略

```bash
# /etc/hosts.allow
sshd: 192.168.1.0/24 : allow
sshd: 10.0.0.0/8 : allow

# /etc/hosts.deny
sshd: ALL : deny

# Firewalld 白名单
firewall-cmd --permanent --zone=public --add-rich-rule='
  rule family="ipv4" source address="192.168.1.0/24" service name="ssh" accept'
firewall-cmd --permanent --zone=public --remove-service=ssh
```

## 5. DenyHosts vs Fail2Ban

| 特性 | DenyHosts | Fail2Ban |
|------|-----------|----------|
| 支持服务 | 仅 SSH | 多种服务（SSH/Nginx/Apache/Postfix等） |
| 封禁方式 | TCP Wrapper（hosts.deny） | iptables/Firewalld/nftables |
| 正则匹配 | 固定模式 | 自定义正则 |
| 配置复杂度 | 简单 | 中等 |
| 灵活性 | 低 | 高 |
| 社区活跃度 | 低 | 高 |
| 推荐场景 | 仅需保护SSH | 需保护多种服务 |

## 6. 面试题

### 1. 如何防止 SSH 暴力破解？

1. 修改默认端口
2. 禁用密码认证，仅使用密钥
3. 禁止 root 直接登录
4. 使用 Fail2Ban/DenyHosts 自动封禁
5. 限制来源 IP（白名单）
6. 使用防火墙限制连接速率
7. 使用跳板机/堡垒机集中管理

### 2. TCP Wrapper 的工作原理？

TCP Wrapper 是基于 `/etc/hosts.allow` 和 `/etc/hosts.deny` 的访问控制机制，在服务启动时通过 `libwrap.so` 库检查访问权限。检查顺序：hosts.allow → hosts.deny，匹配即停止。仅对编译时链接了 libwrap 的服务有效（如 sshd）。

### 3. Fail2Ban 的 banaction 有哪些？

- `iptables-multiport`：使用 iptables multiport 模块
- `iptables-allports`：封禁所有端口
- `firewallcmd-rich-rules`：使用 Firewalld 富规则
- `firewallcmd-ipset`：使用 Firewalld + ipset（大量IP时更高效）
- `nftables`：使用 nftables
