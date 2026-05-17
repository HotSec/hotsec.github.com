# Falco 知识点总结

## 一、Falco 概述

Falco 是 CNCF 毕业的开源云原生安全工具，为主机、容器、Kubernetes 和云环境提供运行时安全防护。它利用 eBPF 技术监控系统活动，基于自定义规则检测异常行为，并提供实时告警。

### 1.1 核心特性

| 特性 | 说明 |
|------|------|
| **云原生** | 支持容器、Kubernetes、主机和云服务 |
| **实时检测** | 实时检测意外行为、配置变更和攻击 |
| **eBPF驱动** | 使用 eBPF 监控内核事件 |
| **规则引擎** | 开箱即用的规则，支持自定义 |
| **插件扩展** | 支持 AWS CloudTrail、GitHub、Okta 等插件 |
| **多平台** | 支持 x64 & ARM CPU |

### 1.2 主要应用场景

| 场景 | 说明 |
|------|------|
| 威胁检测 | 检测主机和容器中的恶意行为 |
| 合规监控 | 云原生系统的合规性监控 |
| 配置审计 | 检测配置变更和异常 |
| 供应链安全 | 检测零日漏洞和软件供应链攻击 |

### 1.3 与同类产品对比

| 维度 | Falco | Sysdig | Aqua Tracee |
|------|-------|--------|-------------|
| 架构 | eBPF/kernel module | kernel module/driver | eBPF |
| 规则格式 | YAML | Lua/规则 | Go/JSON |
| K8s集成 | 原生支持 | 原生支持 | 原生支持 |
| 插件生态 | Falco插件 | 商业版 | 开源 |
| CNCF状态 | 毕业项目 | 沙箱项目 | 沙箱项目 |

---

## 二、核心原理

### 2.1 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      Falco 架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐                       │
│  │ Kernel      │    │ eBPF Probe  │    ← 数据采集层      │
│  │ Module      │    │ (推荐)      │                       │
│  └──────┬──────┘    └──────┬──────┘                       │
│         │                   │                             │
│         └─────────┬─────────┘                             │
│                   ↓                                         │
│         ┌─────────────────────┐                            │
│         │   Syscall Events   │    ← 系统调用事件流        │
│         │   (用户态解析)      │                            │
│         └──────────┬──────────┘                            │
│                    ↓                                        │
│         ┌─────────────────────┐                            │
│         │   Rule Engine      │    ← 规则匹配引擎         │
│         │   (YAML规则)        │                            │
│         └──────────┬──────────┘                            │
│                    ↓                                        │
│         ┌─────────────────────┐                            │
│         │   Output           │    ← 输出告警              │
│         │   (多渠道)          │                            │
│         └─────────────────────┘                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 数据采集层

Falco 支持两种数据采集方式：

| 驱动 | 说明 | 优缺点 |
|------|------|--------|
| **eBPF Probe** | 推荐方式，无需编译内核模块 | 稳定、安全、易升级 |
| **Kernel Module** | 传统方式，需编译内核模块 | 性能好，但升级内核需重新编译 |

#### eBPF 挂载点

```c
// eBPF 程序挂载到 sys_enter 跟踪点
SEC("tracepoint/syscalls/sys_enter_open")
int trace_sys_enter_open(struct trace_event_raw_sys_enter *ctx) {
    // 捕获 open 系统调用
}

// eBPF 程序挂载到 sys_exit 跟踪点
SEC("tracepoint/syscalls/sys_enter_execve")
int trace_sys_enter_execve(struct trace_event_raw_sys_enter *ctx) {
    // 捕获 execve 系统调用
}
```

### 2.3 系统调用监控

Falco 监控的核心系统调用包括：

| 类别 | 系统调用 | 检测目的 |
|------|---------|---------|
| **文件访问** | open, openat, read, write | 检测敏感文件访问 |
| **进程操作** | execve, clone, fork | 检测恶意程序执行 |
| **网络操作** | socket, connect, bind | 检测网络攻击 |
| **特权操作** | setuid, setgid, capset | 检测权限提升 |
| **容器逃逸** | unshare, mount | 检测容器逃逸尝试 |

### 2.4 事件处理流程

```
用户空间程序执行
       ↓
系统调用触发
       ↓
内核态事件捕获（eBPF/Kernel Module）
       ↓
事件过滤与聚合
       ↓
发送到用户态 Falco
       ↓
规则引擎匹配
       ↓
触发告警/响应
```

---

## 三、安装部署

### 3.1 二进制安装

```bash
# 下载 Falco 二进制包
curl -L -O https://github.com/falcosecurity/falco/releases/download/0.37.0/falco-0.37.0-x86_64.tar.gz

# 解压安装
tar -xf falco-0.37.0-x86_64.tar.gz
cd falco-0.37.0-x86_64/

# 安装
sudo cp -r * /

# 安装 eBPF 驱动（推荐）
sudo falco-driver-loader
```

### 3.2 Docker 运行

```bash
# 启动 Falco（挂载宿主机的 /proc 和 /host）
docker run -d \
  --name falco \
  --privileged \
  -v /var/run/docker.sock:/host/var/run/docker.sock \
  -v /proc:/host/proc:ro \
  -v /boot:/host/boot:ro \
  -v /dev:/host/dev:ro \
  -v /etc:/host/etc:ro \
  falcosecurity/falco:latest
```

### 3.3 Kubernetes 部署（Helm）

```bash
# 添加 Helm 仓库
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update

# 安装 Falco
helm install falco falcosecurity/falco \
  --namespace falco \
  --create-namespace \
  --set driver.enabled=true \
  --set driver.kind=ebpf
```

### 3.4 检查部署状态

```bash
# 查看 Falco 运行状态
systemctl status falco

# 查看 Falco 日志
journalctl -u falco -f

# 验证 eBPF 驱动加载
falco --help
ls -la /sys/kernel/debug/tracing/events/syscalls/
```

---

## 四、源码编译

### 4.1 编译依赖

```bash
# Ubuntu/Debian 依赖
apt-get update
apt-get install -y \
    cmake \
    gcc \
    g++ \
    make \
    autoconf \
    pkg-config \
    libsystemd-dev \
    libjson-c-dev \
    libyaml-dev \
    libcurl4-openssl-dev \
    libnetfilter-queue-dev \
    libbpf-dev \
    libelf-dev \
    linux-headers-$(uname -r)

# CentOS/RHEL 依赖
yum install -y \
    cmake \
    gcc \
    gcc-c++ \
    make \
    systemd-devel \
    json-c-devel \
    yaml-devel \
    libcurl-devel \
    libnetfilter_queue-devel \
    elfutils-libelf-devel \
    kernel-headers \
    kernel-devel
```

### 4.2 编译步骤

```bash
# 克隆源码
git clone https://github.com/falcosecurity/falco.git
cd falco

# 初始化子模块
git submodule update --init --recursive

# 创建构建目录
mkdir build && cd build

# CMake 配置
cmake -DCMAKE_BUILD_TYPE=Release \
      -DBUILD_DRIVER=ON \
      -DFALCO_ENGINE_VERSION=3 \
      ..

# 编译
make -j$(nproc)

# 安装
make install
```

### 4.3 eBPF 单独编译

```bash
# 进入 eBPF 源码目录
cd falco/driver/bpf

# 编译 eBPF 程序
clang -O2 -Wall \
      -target bpf \
      -D__TARGET_ARCH_x86 \
      -I../headers \
      -c probe.bpf.c \
      -o probe.bpf.o

# 生成 CO-RE 版本（推荐）
clang -O2 -Wall \
      -target bpf \
      -D__TARGET_ARCH_x86 \
      -DUSE_BPF_SKEL \
      -I../headers \
      -c probe.bpf.c \
      -o probe.bpf.o
```

### 4.4 编译选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `-DBUILD_DRIVER` | 构建内核模块 | ON |
| `-DBUILD_FALCO_UNIT_TESTS` | 构建单元测试 | OFF |
| `-DFALCO_ENGINE_VERSION` | 规则引擎版本 | 3 |
| `-DFALCO_ENABLE_VERSIONING` | 启用版本控制 | ON |
| `-DUSE_BUNDLED_DEPS` | 使用打包的依赖 | OFF |
| `-DBUILD_LIBSSCANNER` | 构建 libsscanner | OFF |

---

## 五、规则详解

### 5.1 规则结构

```yaml
- rule: Detect Shell in Container
  desc: A shell was spawned in a container other than at container start
  condition: >
    spawned_process and
    container and
    proc.name != zsh and
    proc.name != bash and
    proc.name != sh
  output: >
    Shell spawned in container (user=%user.name container_id=%container.id
    container_name=%container.name shell=%proc.name parent=%proc.pname
    cmdline=%proc.cmdline)
  priority: WARNING
  tags: [container, shell, mitre_execution]
```

### 5.2 规则字段

| 字段 | 说明 |
|------|------|
| `rule` | 规则唯一名称 |
| `desc` | 规则描述 |
| `condition` | 触发条件（核心） |
| `output` | 输出格式 |
| `priority` | 优先级 |
| `tags` | 标签分类 |
| `exceptions` | 例外条件 |
| `enabled` | 是否启用 |

### 5.3 条件语法

#### 操作符

| 操作符 | 说明 | 示例 |
|--------|------|------|
| `and` | 逻辑与 | `container and proc.name=bash` |
| `or` | 逻辑或 | `open_read or open_write` |
| `not` | 逻辑非 | `not container` |
| `=` | 等于 | `proc.name=bash` |
| `!=` | 不等于 | `proc.name!=nginx` |
| `contains` | 包含 | `proc.cmdline contains /etc/passwd` |
| `startswith` | 开头匹配 | `fd.name startswith /etc` |
| `endswith` | 结尾匹配 | `fd.name endswith .sh` |
| `in` | 在集合中 | `proc.name in (bash, sh, zsh)` |
| `pm` | 模式匹配 | `proc.name pm (bash*, sh*)` |
| `intersects` | 交集匹配 | `user.names intersects (root, admin)` |

#### 常用过滤器

| 过滤器 | 说明 |
|--------|------|
| `container` | 是否在容器中 |
| `k8s.ns.name` | Kubernetes 命名空间 |
| `k8s.pod.name` | Kubernetes Pod 名称 |
| `proc.name` | 进程名称 |
| `proc.pname` | 父进程名称 |
| `proc.cmdline` | 进程命令行 |
| `fd.name` | 文件描述符名称 |
| `fd.type` | 文件描述符类型 |
| `user.name` | 用户名 |
| `user.uid` | 用户 UID |
| `evt.type` | 事件类型 |
| `evt.dir` | 事件方向 |

### 5.4 宏定义（Macros）

```yaml
- macro: inbound
  condition: >
    (evt.type in (accept,connect) and evt.dir=<)

- macro: outbound
  condition: >
    (evt.type in (accept,connect) and evt.dir=>)

- macro: consider_all_conns
  condition: >
    (nf.conntrack.state=-1 or nf.conntrack.state=1)

- macro: bash_reading_history
  condition: >
    (proc.name in (bash,sh) and fd.name startswith (/dev/tty or /dev/pts))
```

### 5.5 列表定义（Lists）

```yaml
- list: shell_binaries
  items: [bash, csh, ksh, sh, tcsh, zsh, dash]

- list: safe_dirs
  items: [/mnt, /var, /tmp, /dev/null]

- list: scheduler_binaries
  items: [crond, atd, cron, anacron, systemd, bash]
```

### 5.6 优先级

| 优先级 | 数值 | 说明 |
|--------|------|------|
| EMERGENCY | 0 | 系统紧急 |
| ALERT | 1 | 重要告警 |
| CRITICAL | 2 | 严重威胁 |
| ERROR | 3 | 错误 |
| WARNING | 4 | 警告 |
| NOTICE | 5 | 注意 |
| INFO | 6 | 信息 |
| DEBUG | 7 | 调试 |

### 5.7 实战规则示例

#### 检测容器内执行 Shell

```yaml
- rule: Terminal shell in container
  desc: A shell was spawned in a container other than at container start
  condition: >
    spawned_process and
    container and
    proc.name in (shell_binaries)
  output: >
    Shell spawned in container (user=%user.name
    container_id=%container.id
    container_name=%container.name
    shell=%proc.name parent=%proc.pname)
  priority: WARNING
  tags: [container, shell, mitre_execution]
```

#### 检测敏感文件读写

```yaml
- rule: Read sensitive file untrusted
  desc: >
    Open of a known sensitive file for reading by nontrusted
    (non-root/非root) user
  condition: >
    open_read and
    not proc.name in (shell_binaries) and
    fd.name in (sensitive_file_names) and
    not user.name in (root,nginx,apache)
  output: >
    Read sensitive file (user=%user.name
    file=%fd.name)
  priority: WARNING
```

#### 检测网络连接异常

```yaml
- rule: Unexpected outbound connection
  desc: >
    Unexpected outbound connection to non allowed IP ranges
  condition: >
    outbound and
    not cf_allow_list and
    not proc.name in (nginx,apache,curl,wget) and
    fd.sip.name not in (allowed_ip_list)
  output: >
    Unexpected outbound connection (user=%user.name
    dest=%fd.rip:%fd.rport
    cmdline=%proc.cmdline)
  priority: WARNING
```

#### 检测容器逃逸尝试

```yaml
- rule: Detect container escape attempts
  desc: >
    Detect attempts to escape from a container
  condition: >
    (spawned_process or container) and
    (proc.name = unshare or
     proc.name = nsenter or
     (proc.name = chmod and proc.cmdline contains "777") or
     (fd.name startswith /mnt and fd.name contains /etc/passwd))
  output: >
    Container escape attempt detected
    (user=%user.name container=%container.id
    proc=%proc.name cmdline=%proc.cmdline)
  priority: CRITICAL
```

#### 检测特权容器

```yaml
- rule: Privileged container started
  desc: >
    Detect containers running in privileged mode
  condition: >
    container and
    container.privileged=true
  output: >
    Privileged container started
    (user=%user.name
    container_name=%container.name
    image=%container.image.repository)
  priority: CRITICAL
```

#### 检测写入 /etc 目录

```yaml
- rule: Write below etc
  desc: >
    An attempt to write below /etc
  condition: >
    write_etc_common or
    (open_write and
     fd.name startswith /etc)
  output: >
    File below /etc opened for writing
    (user=%user.name
    file=%fd.name
    command=%proc.cmdline)
  priority: WARNING
```

#### 检测反弹 Shell

```yaml
- rule: Reverse shell detected
  desc: >
    Detect reverse shell connections
  condition: >
    inbound and
    proc.name != sshd and
    fd.name contains /dev/tcp/
  output: >
    Reverse shell detected
    (user=%user.name
    dest=%fd.rip:%fd.rport
    container=%container.id)
  priority: CRITICAL
```

### 5.8 异常处理（Exceptions）

```yaml
- rule: Write below etc
  desc: An attempt to write below /etc
  condition: >
    open_write and
    fd.name startswith /etc
  output: >
    File below /etc opened for writing
    (user=%user.name file=%fd.name gpid=%gproc.gpid)
  priority: WARNING
  exceptions:
    - name: update_packages
      fields: [proc.name, fd.name]
      values:
        - [apt, /etc/apt/*]
        - [yum, /etc/yum.repos.d/*]
        - [dnf, /etc/dnf/*]
```

---

## 六、工作流程

### 6.1 完整工作流程

```
┌──────────────────────────────────────────────────────────────┐
│                    Falco 工作流程                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 初始化阶段                                               │
│     ├── 加载配置文件 (falco.yaml)                          │
│     ├── 加载规则文件 (*.yaml)                               │
│     ├── 初始化规则引擎                                       │
│     └── 加载 eBPF/Kernel Module                             │
│                                                              │
│  2. 事件捕获阶段                                             │
│     ├── eBPF 捕获系统调用                                    │
│     ├── 事件过滤和聚合                                       │
│     └── 发送到用户态                                         │
│                                                              │
│  3. 规则匹配阶段                                             │
│     ├── 解析事件字段                                         │
│     ├── 条件表达式求值                                       │
│     └── 匹配规则                                             │
│                                                              │
│  4. 告警输出阶段                                             │
│     ├── 生成告警 JSON                                        │
│     ├── 应用输出过滤器                                       │
│     └── 发送到各输出渠道                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 启动流程

```bash
# Falco 启动流程
1. 解析命令行参数
2. 加载配置文件 (/etc/falco/falco.yaml)
3. 初始化日志系统
4. 检查并加载驱动 (eBPF 或 Kernel Module)
5. 加载 Falco 规则文件
6. 初始化规则引擎
7. 初始化输出插件
8. 开始事件循环
9. 持续监控直到收到停止信号
```

### 6.3 事件处理流程

```bash
# 系统调用事件处理
1. 内核态捕获事件（eBPF probe）
2. 事件过滤（丢弃不需要的事件）
3. 事件聚合（减少告警噪音）
4. 发送到用户态 Falco 进程
5. 解析事件字段
6. 规则引擎匹配
7. 生成告警
8. 输出告警到配置的目标
```

---

## 七、配置管理

### 7.1 主配置文件

```yaml
# /etc/falco/falco.yaml

# 日志配置
log_level: info
log_stderr: true
log_syslog: true
log_file: /var/log/falco/falco.log

# 告警输出
stdout_output:
  enabled: true

file_output:
  enabled: true
  keep_alive: false
  filename: /var/log/falco/falco alerts.log

syslog_output:
  enabled: true

# JSON 输出
json_output: true
json_include_output_properties: true

# 规则配置
rules_file:
  - /etc/falco/rules.d/
  - /etc/falco/falco_rules.yaml
  - /etc/falco/rules/application_rules.yaml

# 过滤配置
buffered_outputs: false
json_include_metadata: true

# gRPC 配置
grpc:
  enabled: false
  bind_address: "0.0.0.0:5060"
  threadiness: 0

# 告警优先级
priority: DEBUG

# 输出插件
plugins:
  - name: k8saudit
    library_path: libk8saudit.so
    init_config: '{"auditServerPort": 7269}'
    open_params: ""
```

### 7.2 Kubernetes Audit 集成

```yaml
# k8s-audit 规则配置
- rule: Create/Modify Configmap with sensitive info
  desc: >
    Detect creation or modification of configmap containing
    potentially sensitive information
  condition: >
    k8s_audit and
    k8s.req.operation=create and
    k8s.req.object.kind=ConfigMap and
    (k8s.req.object.data contains "password" or
     k8s.req.object.data contains "secret" or
     k8s.req.object.data contains "token")
  output: >
    K8s ConfigMap with potential secret created/modified
    (user=%ka.user.name configmap=%ka.req.object.metadata.name
    ns=%ka.target.namespace action=%ka.req.operation)
  priority: WARNING
```

---

## 八、输出与集成

### 8.1 输出格式

```json
{
  "output": "Shell spawned in container (user=root container_id=abc123 shell=bash parent=docker)",
  "priority": "WARNING",
  "rule": "Terminal shell in container",
  "time": "2025-01-15T10:30:00.123456789Z",
  "output_fields": {
    "container.id": "abc123",
    "container.name": "myapp",
    "proc.name": "bash",
    "proc.pname": "docker",
    "user.name": "root"
  }
}
```

### 8.2 输出集成

#### ELK Stack

```yaml
# 配置 Falco JSON 输出到 Filebeat
file_output:
  enabled: true
  filename: /var/log/falco/falco.json

# Filebeat 配置
filebeat.inputs:
  - type: log
    paths:
      - /var/log/falco/falco.json
    json.keys_under_root: true
    processors:
      - add_kubernetes_metadata:
          host: NODE_NAME
          matchers:
            - logs_path:
                logs_path: "/var/log/falco/"

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
```

#### Prometheus

```yaml
# 启用 gRPC 输出
grpc:
  enabled: true
  bind_address: "0.0.0.0:5060"

# Prometheus 抓取配置
scrape_configs:
  - job_name: 'falco'
    static_configs:
      - targets: ['falco:8761']
```

#### Kubernetes Webhook

```yaml
# Falco webhook 配置
webhooks:
  - name: k8s-webhook
    url: http://kubernetes-webhook.default.svc.cluster.local:8080
    timeout: 10ms
    keep_alive: false
```

---

## 九、性能优化

### 9.1 系统层优化

```bash
# 增大文件描述符限制
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf

# 增大内核缓冲区
echo 262144 > /proc/sys/net/core/rmem_max
echo 262144 > /proc/sys/net/core/rmem_default

# 禁用 SELinux（如果干扰）
setenforce 0
```

### 9.2 Falco 配置优化

```yaml
# /etc/falco/falco.yaml

# 事件过滤
engine:
  rules_buf_size_optimal: 65536
  rules_buf_size_max: 16777216

# 缓冲区配置
buffered_outputs: true
max_consumers: 8
消费者数量
async_output:
  threads: 2
  queue_size: 128
```

### 9.3 规则优化

| 优化策略 | 说明 |
|---------|------|
| 减少不必要的规则 | 禁用不使用的规则 |
| 使用 exceptions | 减少误报 |
| 优化条件表达式 | 避免全表扫描 |
| 使用宏 | 提高规则可读性和复用性 |
| 合理设置优先级 | 避免低优先级规则占用资源 |

---

## 十、快速参考

### 10.1 常用命令

| 命令 | 说明 |
|------|------|
| `falco -c /etc/falco/falco.yaml` | 启动 Falco |
| `falco -r /path/to/rules.yaml` | 指定规则文件 |
| `falco --help` | 查看帮助 |
| `falco --version` | 查看版本 |
| `falco --list` | 列出所有规则 |
| `falco --dry-run` | 测试配置（不运行） |

### 10.2 规则文件位置

| 路径 | 说明 |
|------|------|
| `/etc/falco/falco.yaml` | 主配置文件 |
| `/etc/falco/falco_rules.yaml` | 默认规则 |
| `/etc/falco/rules.d/` | 自定义规则目录 |

### 10.3 日志位置

| 路径 | 说明 |
|------|------|
| `/var/log/falco/falco.log` | 运行日志 |
| `/var/log/falco/falco_alerts.json` | JSON 告警日志 |
| `/var/log/syslog` | 系统日志（syslog 输出时） |

---

## 十一、相关知识点链接

- 容器安全：[Docker安全.md](./Docker安全.md)
- Kubernetes安全：[K8s安全.md](./K8s安全.md)
- 安全产品体系：[02_安全产品与检测体系.md](./02_安全产品与检测体系.md)
- 云原生安全：[容器内信息收集.md](./容器内信息收集.md)