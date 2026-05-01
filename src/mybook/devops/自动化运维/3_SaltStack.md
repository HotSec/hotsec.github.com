# SaltStack 配置管理

## 1. SaltStack 概述

SaltStack 是基于 ZeroMQ 的高速配置管理和远程执行工具，采用 Agent-Master 架构。

### 1.1 核心特性

| 特性 | 说明 |
|------|------|
| ZeroMQ 通信 | 毫秒级消息传递 |
| 并行执行 | 同时操作数千台主机 |
| 声明式配置 | SLS 文件描述期望状态 |
| 灵活匹配 | glob/PCRE/grain/pillar 复合匹配 |
| 事件驱动 | Reactor 自动响应事件 |

### 1.2 架构

```
Salt Master ←→ Salt Minion
    │               │
    ├─ Publisher     ├─ Minion Daemon
    ├─ Request Server├─ Module Executor
    ├─ File Server   ├─ Grain Collector
    └─ Pillar Engine └─ State Compiler
```

## 2. 安装部署

### 2.1 Master

```bash
yum install salt-master
systemctl enable salt-master
systemctl start salt-master

# /etc/salt/master
interface: 0.0.0.0
auto_accept: False
file_roots:
  base:
    - /srv/salt/base
  prod:
    - /srv/salt/prod
pillar_roots:
  base:
    - /srv/pillar/base
```

### 2.2 Minion

```bash
yum install salt-minion
systemctl enable salt-minion
systemctl start salt-minion

# /etc/salt/minion
master: salt-master.example.com
id: minion1.example.com
```

### 2.3 密钥管理

```bash
salt-key -L                    # 列出所有密钥
salt-key -a minion1            # 接受密钥
salt-key -A                    # 接受所有
salt-key -d minion1            # 删除密钥
salt-key -r minion1            # 拒绝密钥
```

## 3. 远程执行

### 3.1 目标匹配

```bash
salt '*' test.ping                              # 所有主机
salt 'web*' test.ping                           # glob 匹配
salt 'web[1-5]' test.ping                       # 范围匹配
salt -E 'web(1|2)\.example\.com' test.ping      # 正则匹配
salt -L 'web1,web2,db1' test.ping               # 列表匹配
salt -G 'os:CentOS' test.ping                   # Grain 匹配
salt -I 'role:webserver' test.ping              # Pillar 匹配
salt -C 'G@os:CentOS and I@role:webserver' test.ping  # 复合匹配
salt -N webservers test.ping                    # 节点组
```

### 3.2 执行模块

```bash
salt '*' cmd.run 'uptime'                       # 执行命令
salt '*' pkg.install nginx                      # 安装包
salt '*' pkg.remove nginx                       # 卸载包
salt '*' service.start nginx                    # 启动服务
salt '*' service.stop nginx                     # 停止服务
salt '*' service.restart nginx                  # 重启服务
salt '*' file.mkdir /data/app                   # 创建目录
salt '*' file.manage_file /etc/hosts source=salt://hosts
salt '*' user.add deploy uid=1001 shell=/bin/bash
salt '*' network.ip_addrs                       # 查看 IP
salt '*' disk.usage                             # 磁盘使用
salt '*' ps.proc_info                          # 进程信息
salt '*' system.reboot                          # 重启
```

## 4. State 系统

### 4.1 SLS 文件

```yaml
# /srv/salt/base/nginx/init.sls
nginx:
  pkg.installed:
    - name: nginx

nginx.conf:
  file.managed:
    - name: /etc/nginx/nginx.conf
    - source: salt://nginx/files/nginx.conf
    - user: root
    - group: root
    - mode: '0644'
    - require:
      - pkg: nginx

nginx-service:
  service.running:
    - name: nginx
    - enable: True
    - watch:
      - file: nginx.conf
```

### 4.2 常用 State 模块

| 模块 | 说明 | 示例 |
|------|------|------|
| pkg.installed | 安装包 | `pkg.installed: name: nginx` |
| pkg.removed | 卸载包 | `pkg.removed: name: nginx` |
| file.managed | 管理文件 | `file.managed: name: /etc/hosts` |
| file.directory | 管理目录 | `file.directory: name: /data/app` |
| file.symlink | 符号链接 | `file.symlink: name: /etc/app` |
| service.running | 运行服务 | `service.running: name: nginx` |
| service.dead | 停止服务 | `service.dead: name: nginx` |
| user.present | 创建用户 | `user.present: name: deploy` |
| user.absent | 删除用户 | `user.absent: name: deploy` |
| cron.present | 定时任务 | `cron.present: name: backup` |
| cmd.run | 执行命令 | `cmd.run: name: init_db.sh` |

### 4.3 依赖管理

```yaml
require:
  - pkg: nginx          # 前置依赖

watch:
  - file: nginx.conf    # 文件变更时触发

onchanges:
  - file: config.yml    # 文件变更时执行

onfail:
  - cmd: notify_failure # 失败时执行
```

### 4.4 应用 State

```bash
salt '*' state.apply                    # 应用所有 state
salt '*' state.apply nginx              # 应用 nginx state
salt '*' state.apply nginx saltenv=prod # 指定环境
salt '*' state.highstate                # 应用 highstate
salt '*' state.sls_id nginx-conf nginx  # 应用指定 ID
salt '*' state.test=True                # 测试模式（不实际执行）
```

## 5. Pillar 数据

### 5.1 配置

```yaml
# /srv/pillar/base/top.sls
base:
  'role:webserver':
    - match: grain
    - web
  'role:dbserver':
    - match: grain
    - db
  '*':
    - common
```

### 5.2 Pillar 数据文件

```yaml
# /srv/pillar/base/web.sls
nginx:
  worker_processes: 4
  worker_connections: 4096
  server_name: www.example.com
  upstream_servers:
    - 10.0.0.1:8080
    - 10.0.0.2:8080

ssl:
  cert: /etc/ssl/certs/example.crt
  key: /etc/ssl/private/example.key
```

### 5.3 在 State 中使用 Pillar

```yaml
nginx.conf:
  file.managed:
    - name: /etc/nginx/nginx.conf
    - source: salt://nginx/files/nginx.conf.j2
    - template: jinja
    - context:
        worker_processes: {{ pillar.get('nginx:worker_processes', 'auto') }}
        worker_connections: {{ pillar.get('nginx:worker_connections', '1024') }}
```

### 5.4 Pillar 操作

```bash
salt '*' pillar.items                  # 查看所有 Pillar 数据
salt '*' pillar.get nginx:worker_processes  # 获取指定值
salt '*' saltutil.refresh_pillar       # 刷新 Pillar
```

## 6. Grains

### 6.1 内置 Grains

```bash
salt '*' grains.items                  # 查看所有 Grains
salt '*' grains.item os                # 操作系统
salt '*' grains.item os_family         # 操作系统家族
salt '*' grains.item cpu_model         # CPU 型号
salt '*' grains.item num_cpus          # CPU 核数
salt '*' grains.item mem_total         # 总内存
salt '*' grains.item ipv4              # IPv4 地址
salt '*' grains.item fqdn              # 完全限定域名
```

### 6.2 自定义 Grains

```yaml
# /etc/salt/grains
role: webserver
environment: production
datacenter: dc1
app_version: "2.1.0"
```

```bash
salt '*' saltutil.sync_grains          # 同步 Grains
salt '*' grains.item role              # 查看自定义 Grain
```

## 7. Jinja 模板

```jinja3
# /srv/salt/base/nginx/files/nginx.conf.j2
worker_processes {{ worker_processes | default('auto') }};

events {
    worker_connections {{ worker_connections | default(1024) }};
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile on;
    keepalive_timeout 65;

{% if pillar.get('nginx:ssl:enabled', False) %}
    server {
        listen 443 ssl;
        server_name {{ pillar.get('nginx:server_name') }};
        ssl_certificate {{ pillar.get('ssl:cert') }};
        ssl_certificate_key {{ pillar.get('ssl:key') }};
    }
{% else %}
    server {
        listen 80;
        server_name {{ pillar.get('nginx:server_name') }};
    }
{% endif %}

{% for upstream in pillar.get('nginx:upstream_servers', []) %}
upstream backend_{{ loop.index }} {
    server {{ upstream }};
}
{% endfor %}
}
```

## 8. Salt SSH

无 Agent 模式，通过 SSH 执行 Salt 命令。

```yaml
# /etc/salt/roster
web1:
  host: 192.168.1.10
  user: admin
  sudo: True
  priv: /home/admin/.ssh/id_ed25519

web2:
  host: 192.168.1.11
  user: admin
  sudo: True
```

```bash
salt-ssh '*' test.ping
salt-ssh '*' state.apply nginx
salt-ssh '*' cmd.run 'uptime'
```

## 9. Salt API

```bash
# 安装
yum install salt-api

# /etc/salt/master.d/api.conf
rest_cherrypy:
  host: 0.0.0.0
  port: 8000
  disable_ssl: True
  auth:
    eauth: pam

systemctl restart salt-api

# 使用
curl -sS http://localhost:8000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"secret","eauth":"pam"}'

curl -sS http://localhost:8000/minions \
  -H 'X-Auth-Token: <token>'
```

## 10. SaltStack vs Ansible vs Puppet

| 特性 | SaltStack | Ansible | Puppet |
|------|-----------|---------|--------|
| 架构 | Agent-Master | 无 Agent | Agent-Master |
| 通信 | ZeroMQ（快） | SSH（慢） | HTTPS |
| 配置语言 | YAML/Jinja | YAML/Jinja | Puppet DSL |
| 远程执行 | 原生支持 | Ad-hoc 命令 | 有限 |
| 事件驱动 | Reactor | 无 | 无 |
| 执行速度 | 极快 | 慢 | 中等 |
| 学习曲线 | 中等 | 低 | 高 |
| 社区规模 | 中等 | 最大 | 大 |
| 适用场景 | 大规模/实时 | 中小/快速 | 大规模/长期 |

## 11. 面试题

### 1. SaltStack 的 Grain 和 Pillar 的区别？

- Grain：Minion 端的静态数据（系统信息），自下而上采集
- Pillar：Master 端的变量数据（配置参数），自上而下分发
- Grain 是公开的（任何 State 可读），Pillar 可加密（敏感数据）

### 2. Salt 的 ZeroMQ 通信模型？

1. Master 发布命令到 Publisher（端口 4505）
2. Minion 订阅 Publisher 接收命令
3. Minion 执行后通过 Request Server（端口 4506）返回结果
4. 支持异步执行，不阻塞其他 Minion

### 3. State 的 require 和 watch 的区别？

- require：声明前置依赖，确保执行顺序
- watch：监听资源变更，变更时触发 handler（重启/重载）
- watch 隐含 require 的功能
