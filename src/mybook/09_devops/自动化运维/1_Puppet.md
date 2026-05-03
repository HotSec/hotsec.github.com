# Puppet 配置管理

## 1. Puppet 概述

Puppet 是声明式配置管理工具，采用 Agent-Master 架构，使用 DSL 描述系统期望状态。

### 1.1 架构

```
Puppet Master ←→ Puppet Agent
    │                   │
    ├─ Catalog Builder  ├─ Facter（采集系统信息）
    ├─ Hiera（数据层）   ├─ Agent（请求 Catalog）
    └─ PuppetDB（存储）  └─ Apply（执行 Catalog）
```

### 1.2 工作流程

```
1. Agent 采集 Facts（主机信息）
2. Agent 发送 Facts 给 Master
3. Master 编译 Catalog（期望状态）
4. Agent 接收并执行 Catalog
5. Agent 上报执行结果到 PuppetDB
```

## 2. 安装部署

### 2.1 Puppet Server（Master）

```bash
# RHEL/CentOS
yum install puppetserver
systemctl enable puppetserver
systemctl start puppetserver

# 配置
# /etc/puppetlabs/puppet/puppet.conf
[main]
certname = puppet-master.example.com
dns_alt_names = puppet,puppet-master.example.com

# 内存配置
# /etc/sysconfig/puppetserver
JAVA_ARGS="-Xms2g -Xmx2g"
```

### 2.2 Puppet Agent

```bash
yum install puppet-agent

# /etc/puppetlabs/puppet/puppet.conf
[main]
certname = node1.example.com
server = puppet-master.example.com

systemctl enable puppet
systemctl start puppet
```

### 2.3 证书管理

```bash
puppetserver ca list                    # 查看待签证书
puppetserver ca sign --certname node1   # 签发证书
puppetserver ca sign --all              # 签发所有
puppetserver ca revoke --certname node1 # 撤销证书
puppetserver ca clean --certname node1  # 清除证书
```

## 3. 核心概念

### 3.1 Resource（资源）

```puppet
package { 'nginx':
  ensure => installed,
}

service { 'nginx':
  ensure  => running,
  enable  => true,
  require => Package['nginx'],
}

file { '/etc/nginx/nginx.conf':
  ensure  => file,
  owner   => 'root',
  group   => 'root',
  mode    => '0644',
  source  => 'puppet:///modules/nginx/nginx.conf',
  require => Package['nginx'],
  notify  => Service['nginx'],
}

user { 'deploy':
  ensure     => present,
  uid        => 1001,
  gid        => 'deploy',
  shell      => '/bin/bash',
  home       => '/home/deploy',
  managehome => true,
}

cron { 'backup':
  ensure  => present,
  command => '/usr/local/bin/backup.sh',
  user    => 'root',
  hour    => 2,
  minute  => 0,
}

exec { 'create-data-dir':
  command => 'mkdir -p /data/app',
  path    => ['/bin', '/usr/bin'],
  creates => '/data/app',
}
```

### 3.2 常用资源类型

| 资源 | 说明 | 关键属性 |
|------|------|----------|
| package | 软件包 | ensure, name, provider |
| service | 服务 | ensure, enable, status |
| file | 文件/目录 | ensure, source, content, mode |
| user | 用户 | ensure, uid, shell, home |
| group | 用户组 | ensure, gid |
| cron | 定时任务 | ensure, command, hour, minute |
| exec | 执行命令 | command, creates, unless |
| notify | 通知 | message |
| host | /etc/hosts | ensure, ip, hostname |
| mount | 挂载点 | ensure, device, fstype |

### 3.3 资源元参数

| 元参数 | 说明 |
|--------|------|
| require | 前置依赖 |
| before | 在指定资源之前执行 |
| notify | 变更时通知 |
| subscribe | 订阅变更 |
| ensure | 期望状态（present/absent） |
| audit | 审计属性变化 |

## 4. Class（类）

```puppet
class nginx {
  package { 'nginx':
    ensure => installed,
  }

  file { '/etc/nginx/nginx.conf':
    ensure  => file,
    source  => 'puppet:///modules/nginx/nginx.conf',
    require => Package['nginx'],
    notify  => Service['nginx'],
  }

  service { 'nginx':
    ensure    => running,
    enable    => true,
    subscribe => File['/etc/nginx/nginx.conf'],
  }
}

class nginx::proxy inherits nginx {
  File['/etc/nginx/nginx.conf']:
    source => 'puppet:///modules/nginx/proxy.conf';
}
```

### 4.1 参数化类

```puppet
class nginx (
  String $worker_processes = 'auto',
  String $worker_connections = '1024',
  Boolean $proxy_mode = false,
) {
  file { '/etc/nginx/nginx.conf':
    ensure  => file,
    content => template('nginx/nginx.conf.erb'),
  }
}

# Hiera 自动查找
# nginx::worker_processes: '4'
# nginx::worker_connections: '4096'
```

## 5. Module（模块）

### 5.1 目录结构

```
nginx/
├── manifests/
│   ├── init.pp          # 主类 nginx
│   ├── params.pp        # 默认参数
│   ├── proxy.pp         # nginx::proxy
│   └── vhost.pp         # nginx::vhost
├── files/
│   └── nginx.conf       # 静态文件
├── templates/
│   ├── nginx.conf.erb   # ERB 模板
│   └── vhost.conf.epp   # EPP 模板
├── lib/                 # 自定义函数/类型
├── spec/                # 测试
├── data/                # Hiera 数据
│   └── common.yaml
├── hiera.yaml           # Hiera 配置
└── metadata.json        # 模块元数据
```

### 5.2 模块开发

```puppet
# manifests/init.pp
class nginx (
  String $worker_processes = $nginx::params::worker_processes,
  String $worker_connections = $nginx::params::worker_connections,
) inherits nginx::params {

  package { 'nginx':
    ensure => installed,
  }

  file { '/etc/nginx/nginx.conf':
    ensure  => file,
    content => template('nginx/nginx.conf.erb'),
    require => Package['nginx'],
    notify  => Service['nginx'],
  }

  service { 'nginx':
    ensure => running,
    enable => true,
  }
}

# manifests/params.pp
class nginx::params {
  $worker_processes = 'auto'
  $worker_connections = '1024'
}

# manifests/vhost.pp
define nginx::vhost (
  String $server_name,
  String $docroot,
  Integer $port = 80,
) {
  include nginx

  file { "/etc/nginx/conf.d/${name}.conf":
    ensure  => file,
    content => template('nginx/vhost.conf.erb'),
    require => Package['nginx'],
    notify  => Service['nginx'],
  }
}
```

### 5.3 ERB 模板

```erb
# templates/nginx.conf.erb
worker_processes <%= @worker_processes %>;

events {
    worker_connections <%= @worker_connections %>;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen 80;
        server_name <%= @server_name %>;
        root <%= @docroot %>;
    }
}
```

## 6. Hiera 数据分离

### 6.1 层次结构

```yaml
# hiera.yaml
version: 5
hierarchy:
  - name: "Per-node data"
    path: "nodes/%{trusted.certname}.yaml"
  - name: "Per-environment data"
    path: "environments/%{environment}.yaml"
  - name: "Per-OS data"
    path: "os/%{facts.os.family}.yaml"
  - name: "Common data"
    path: "common.yaml"
defaults:
  datadir: data
```

### 6.2 数据文件

```yaml
# data/common.yaml
nginx::worker_processes: '4'
nginx::worker_connections: '4096'

# data/nodes/web1.example.com.yaml
nginx::proxy_mode: true
nginx::upstream_servers:
  - '10.0.0.1:8080'
  - '10.0.0.2:8080'
```

### 6.3 自动查找

```puppet
class nginx (
  String $worker_processes = lookup('nginx::worker_processes'),
  String $worker_connections = lookup('nginx::worker_connections'),
) {
  # Hiera 自动绑定参数
}
```

## 7. PuppetDB

```bash
# 安装
yum install puppetdb puppetdb-terminus

# 配置
# /etc/puppetlabs/puppetdb/conf.d/database.ini
subname = //localhost:5432/puppetdb
subprotocol = org.postgresql
username = puppetdb
password = puppetdb

# Puppet 连接 PuppetDB
# /etc/puppetlabs/puppet/puppet.conf
[main]
storeconfigs_backend = puppetdb
storeconfigs = true
pdb_server = https://puppet-master:8081
```

## 8. Puppet vs Ansible vs SaltStack

| 特性 | Puppet | Ansible | SaltStack |
|------|--------|---------|-----------|
| 架构 | Agent-Master | 无 Agent | Agent-Master |
| 通信 | HTTPS | SSH | ZeroMQ |
| 语言 | Puppet DSL | YAML | YAML/Jinja |
| 学习曲线 | 陡峭 | 平缓 | 中等 |
| 执行速度 | 较慢 | 慢（SSH） | 快（ZeroMQ） |
| 扩展性 | 高 | 中 | 高 |
| 适用场景 | 大规模/长期 | 中小规模/快速 | 大规模/实时 |
| 企业支持 | Puppet Enterprise | AWX/Tower | SaltStack Enterprise |

## 9. 面试题

### 1. Puppet 的声明式和命令式的区别？

- 声明式：描述期望状态（ensure => present），Puppet 自动计算如何达到
- 命令式：描述操作步骤（先装包，再启动），需要手动编排顺序
- Puppet 是声明式，幂等执行

### 2. Hiera 的作用？

Hiera 将数据与代码分离，实现：
- 不同环境使用不同配置值
- 敏感数据加密存储（eyaml）
- 节点/操作系统级别的差异化配置
- 无需修改模块代码即可调整参数

### 3. Puppet 如何保证幂等性？

- 资源声明期望状态，Puppet 比较当前状态与期望状态
- 只有存在差异时才执行变更
- `exec` 资源需通过 `creates`/`unless`/`onlyif` 保证幂等
