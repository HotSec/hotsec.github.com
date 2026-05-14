# Sysmon for Linux

## 1. 概述

### 1.1 什么是 Sysmon for Linux

**Sysmon for Linux** 是微软官方 Sysinternals 工具套件中 Sysmon 的 Linux 移植版本，通过 **eBPF** 技术实现系统活动监控。

**GitHub**: https://github.com/microsoft/SysmonForLinux
**最新版本**: 1.5.2
**开源协议**: MIT（eBPF 程序使用 GPL2）

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| 跨重启运行 | 安装后持续监控，不受系统重启影响 |
| eBPF 驱动 | 使用内核级 eBPF 程序，性能高效 |
| 高级过滤 | 支持与 Windows 版相同格式的 XML 配置规则 |
| 统一配置 | 与 Windows Sysmon 使用相同的配置语法 |
| BTF 支持 | 支持 BTF 自动发现内核偏移量 |

### 1.3 监控范围

- 进程生命周期（创建、终止）
- 网络连接（TCP/UDP）
- 文件系统写入
- 用户切换
- 更多事件...

## 2. 安装

### 2.1 Ubuntu/Debian

```bash
# 1. 添加微软 GPG 密钥
wget -q https://packages.microsoft.com/keys/microsoft.asc -O- | sudo apt-key add -

# 2. 添加微软仓库
wget -q https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# 3. 安装 Sysmon for Linux
sudo apt update
sudo apt install sysmon

# 4. 安装可选的日志查看工具
sudo apt install sysmonlogview
```

### 2.2 RHEL/CentOS/Fedora

```bash
# 1. 添加微软仓库
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo sh -c 'echo -e "[packages-microsoft-com]\nname=packages-microsoft-com\nbaseurl=https://packages.microsoft.com/yumrepos/microsoft-rhel7-prod\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/microsoft.repo'

# 2. 安装
sudo dnf install sysmon
```

### 2.3 验证安装

```bash
# 检查版本
sysmon -v

# 检查服务状态
systemctl status sysmon
```

## 3. 配置

### 3.1 基础配置

Sysmon for Linux 使用与 Windows 版相同的 **XML 配置格式**：

```xml
<Sysmon schemaversion="4.90">
  <!-- 配置选项 -->
  <HashAlgorithms>MD5,SHA256</HashAlgorithms>

  <!-- 事件过滤 -->
  <EventFiltering>
    <!-- 监控所有进程创建 -->
    <ProcessCreate onmatch="include">
    </ProcessCreate>

    <!-- 监控所有网络连接 -->
    <NetworkConnect onmatch="include">
    </NetworkConnect>

    <!-- 监控所有文件写入 -->
    <FileCreate onmatch="include">
    </FileCreate>
  </EventFiltering>
</Sysmon>
```

### 3.2 保存配置

```bash
# 使用默认配置安装
sudo sysmon -i

# 使用指定配置文件安装
sudo sysmon -i /path/to/sysmonconfig.xml

# 仅更新配置（不重新安装）
sudo sysmon -c /path/to/sysmonconfig.xml

# 查看当前配置
sudo sysmon -c

# 卸载
sudo sysmon -u
```

## 4. 核心事件类型

### 4.1 事件 ID 对照

| 事件 ID | 事件名称 | 说明 |
|---------|----------|------|
| 1 | ProcessCreate | 进程创建 |
| 2 | FileCreateTime | 文件创建时间修改 |
| 3 | NetworkConnect | 网络连接 |
| 5 | ProcessTerminate | 进程终止 |
| 6 | DriverLoad | 内核模块/驱动加载 |
| 7 | ImageLoad | 动态库加载 |
| 8 | CreateRemoteThread | 创建远程线程 |
| 9 | RawAccessRead | 直接磁盘读取 |
| 10 | ProcessAccess | 进程访问 |
| 11 | FileCreate | 文件创建/覆盖 |
| 12 | SysmonServiceStateChanged | 服务状态更改 |
| 13 | FileCreateStreamHash | NTFS 备用数据流 |
| 15 | FileStreamCreate | 文件流创建 |
| 17 | PipeEvent | 命名管道创建 |
| 18 | PipeConnect | 命名管道连接 |
| 19 | WmiEventFilter | WMI 事件过滤器 |
| 20 | WmiEventConsumer | WMI 事件消费者 |
| 21 | WmiEventConsumerToFilter | WMI 消费者绑定 |
| 22 | DNSQuery | DNS 查询 |
| 23 | FileDelete | 文件删除 |
| 24 | ClipboardChange | 剪贴板更改 |
| 255 | Error | 错误事件 |

### 4.2 与 Windows Sysmon 的差异

| 功能 | Windows | Linux |
|------|---------|-------|
| 注册表监控 | Event ID 12-14 | 不适用 |
| 服务状态 | Event ID 12 | Event ID 12 |
| DNS 查询 | Event ID 22 | Event ID 22 |
| 剪贴板 | Event ID 24 | Event ID 24 |
| 网络连接 | Event ID 3 | Event ID 3 |

## 5. 规则配置示例

### 5.1 基础安全监控

```xml
<Sysmon schemaversion="4.90">
  <HashAlgorithms>MD5,SHA256</HashAlgorithms>

  <EventFiltering>
    <!-- 监控进程创建 -->
    <ProcessCreate onmatch="include">
      <!-- 记录所有进程 -->
    </ProcessCreate>

    <!-- 监控网络连接 -->
    <NetworkConnect onmatch="include">
    </NetworkConnect>

    <!-- 监控敏感文件写入 -->
    <FileCreate onmatch="include">
      <TargetFilename condition="end with">.exe</TargetFilename>
      <TargetFilename condition="end with">.dll</TargetFilename>
      <TargetFilename condition="end with">.so</TargetFilename>
      <TargetFilename condition="end with">.ps1</TargetFilename>
      <TargetFilename condition="end with">.sh</TargetFilename>
      <TargetFilename condition="contains">/tmp/</TargetFilename>
      <TargetFilename condition="contains">/dev/shm/</TargetFilename>
    </FileCreate>

    <!-- 监控进程终止 -->
    <ProcessTerminate onmatch="include">
    </ProcessTerminate>

    <!-- 监控 DNS 查询 -->
    <DnsQuery onmatch="include">
    </DnsQuery>
  </EventFiltering>
</Sysmon>
```

### 5.2 检测恶意活动

```xml
<Sysmon schemaversion="4.90">
  <EventFiltering>
    <!-- 检测可疑进程 -->
    <ProcessCreate onmatch="include">
      <Rule groupRelation="or">
        <!-- 检测编码命令 -->
        <CommandLine condition="contains">-EncodedCommand</CommandLine>
        <CommandLine condition="contains">-enc </CommandLine>
        <!-- 检测可疑下载 -->
        <CommandLine condition="contains">curl</CommandLine>
        <CommandLine condition="contains">wget</CommandLine>
        <CommandLine condition="contains">IEX</CommandLine>
        <CommandLine condition="contains">Invoke-WebRequest</CommandLine>
      </Rule>
    </ProcessCreate>

    <!-- 检测可疑网络连接 -->
    <NetworkConnect onmatch="include">
      <Rule groupRelation="or">
        <!-- 检测外部连接 -->
        <DestinationPort condition="is">4444</DestinationPort>
        <DestinationPort condition="is">31337</DestinationPort>
        <DestinationPort condition="is">1337</DestinationPort>
      </Rule>
    </NetworkConnect>

    <!-- 检测 SSH 密钥访问 -->
    <FileCreate onmatch="include">
      <TargetFilename condition="end with">/authorized_keys</TargetFilename>
      <TargetFilename condition="contains">/.ssh/</TargetFilename>
    </FileCreate>

    <!-- 检测 cron 任务修改 -->
    <FileCreate onmatch="include">
      <TargetFilename condition="contains">/etc/cron</TargetFilename>
      <TargetFilename condition="contains">/var/spool/cron</TargetFilename>
    </FileCreate>
  </EventFiltering>
</Sysmon>
```

### 5.3 排除噪音事件

```xml
<Sysmon schemaversion="4.90">
  <EventFiltering>
    <!-- 排除特定进程的所有事件 -->
    <ProcessCreate onmatch="exclude">
      <Image condition="is">/usr/lib/systemd/systemd</Image>
      <Image condition="is">/usr/sbin/sshd</Image>
      <Image condition="is">/usr/sbin/rsyslogd</Image>
      <Image condition="is">/usr/sbin/apache2</Image>
      <Image condition="is">/usr/sbin/nginx</Image>
    </ProcessCreate>

    <!-- 排除特定目录的文件操作 -->
    <FileCreate onmatch="exclude">
      <TargetFilename condition="contains">/var/cache/</TargetFilename>
      <TargetFilename condition="contains">/var/log/</TargetFilename>
      <TargetFilename condition="contains">/usr/share/</TargetFilename>
    </FileCreate>

    <!-- 排除特定用户的进程 -->
    <ProcessCreate onmatch="exclude">
      <User condition="is">root</User>
    </ProcessCreate>
  </EventFiltering>
</Sysmon>
```

## 6. 日志查看与分析

### 6.1 实时查看日志

```bash
# 查看 syslog 输出
sudo tail -f /var/log/syslog | grep Sysmon

# 使用 sysmonLogView 查看更易读的格式
sudo tail -f /var/log/syslog | sudo /opt/sysmon/sysmonLogView

# 仅显示特定事件
sudo tail -f /var/log/syslog | grep 'Sysmon.*EventID=1'

# 使用 sysmonLogView 过滤特定进程
sudo /opt/sysmon/sysmonLogView -i /var/log/syslog -p bash
```

### 6.2 sysmonLogView 工具

```bash
# 查看帮助
sysmonLogView --help

# 基本用法
sysmonLogView -i /var/log/syslog

# 仅显示特定事件 ID
sysmonLogView -i /var/log/syslog -e 1

# 限制输出字段
sysmonLogView -i /var/log/syslog -f Computer,EventID,Image,CommandLine

# 输出到文件
sysmonLogView -i /var/log/syslog -o output.csv
```

### 6.3 日志字段说明

Sysmon 输出的典型日志格式：

```xml
<Sysmon Event="1" Version="1.5.2" Computer="hostname" ...
  <ProcessCreate>
    <UtcTime>2026-05-13T10:30:45.123456Z</UtcTime>
    <ProcessGuid>{12345678-1234-1234-1234-123456789012}</ProcessGuid>
    <ProcessId>1234</ProcessId>
    <Image>/bin/bash</Image>
    <FileVersion>-</FileVersion>
    <Description>GNU Bash</Description>
    <Product>Bash</Product>
    <Company>Free Software Foundation</Company>
    <OriginalFileName>bash</OriginalFileName>
    <CommandLine>/bin/bash -c ls -la</CommandLine>
    <CurrentDirectory>/home/user</CurrentDirectory>
    <User>user</User>
    <LogonGuid>{12345678-1234-1234-1234-123456789013}</LogonGuid>
    <TerminalSessionId>1</TerminalSessionId>
    <IntegrityLevel>Medium</IntegrityLevel>
    <Hashes>SHA256=abc123...</Hashes>
    <ParentProcessGuid>{12345678-1234-1234-1234-123456789014}</ParentProcessGuid>
    <ParentProcessId>1000</ParentProcessId>
    <ParentImage>/usr/bin/sudo</ParentImage>
    <ParentCommandLine>sudo -u user bash</ParentCommandLine>
  </ProcessCreate>
</Sysmon>
```

## 7. 与 SIEM 集成

### 7.1 Rsyslog 转发

配置 `/etc/rsyslog.d/30-sysmon.conf`：

```bash
# 将 Sysmon 日志转发到远程 SIEM
if $programname contains 'Sysmon' then @@siem.example.com:514
& stop
```

### 7.2 Filebeat 收集

```yaml
# /etc/filebeat/filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/syslog
    fields:
      log_type: sysmon
    fields_under_root: true
    multiline.pattern: '^<Sysmon'
    multiline.negate: true
    multiline.match: after

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "sysmon-%{+yyyy.MM.dd}"
```

### 7.3 Azure Sentinel 集成

通过 Azure Monitor Agent 收集 Sysmon 日志：

```json
{
  "inputs": [
    {
      "name": "sysmon",
      "type": "LinuxSyslog",
      "syslog": {
        "facility": "user",
        "programFilter": ["Sysmon"]
      }
    }
  ]
}
```

## 8. BTF 与内核偏移量

### 8.1 BTF 支持

Sysmon for Linux 支持 BTF（BPF Type Format）自动发现内核偏移量：

```bash
# 检查系统是否支持 BTF
ls /sys/kernel/btf/vmlinux

# 使用 BTF 运行
sudo sysmon -i config.xml --btf
```

### 8.2 手动指定内核偏移量

如果自动发现失败，可以使用 `--offset` 参数：

```bash
sudo sysmon -i config.xml --offset file_operations=/path/to/offsets.txt
```

### 8.3 生成偏移量文件

使用 `getOffsets` 工具生成：

```bash
cd /opt/sysinternals/getOffsets
sudo ./getOffsets > offsets.txt
```

## 9. 故障排除

### 9.1 常见问题

| 问题 | 解决方案 |
|------|----------|
| eBPF 加载失败 | 检查内核版本是否 >= 4.18 |
| 权限不足 | 使用 sudo 运行 sysmon |
| 日志过大 | 使用 `<FieldSizes>` 限制字段长度 |
| 服务启动失败 | 检查 /var/log/syslog 中的错误信息 |

### 9.2 调试模式

```bash
# 查看详细输出
sudo sysmon -i -v config.xml

# 测试配置文件
sudo sysmon -s config.xml

# 查看服务状态
sudo systemctl status sysmon
journalctl -u sysmon -f
```

### 9.3 日志配置优化

防止 syslog 截断大事件，编辑 `/etc/rsyslog.conf`：

```bash
# 增加最大消息大小
$MaxMessageSize 64k

# 或在 /etc/rsyslog.d/ 中添加
$MaxMessageSize 65536
```

并在配置文件中使用 `FieldSizes`：

```xml
<FieldSizes>CommandLine:200,Image:50</FieldSizes>
```

## 10. 卸载

```bash
# 完全卸载
sudo sysmon -u

# 移除配置和数据
sudo rm -rf /etc/sysmon.d/
sudo rm -rf /opt/sysmon/
```

## 11. 相关资源

| 资源 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/microsoft/SysmonForLinux |
| 官方文档 | https://learn.microsoft.com/sysinternals/downloads/sysmon |
| Windows Sysmon 配置参考 | https://github.com/SwiftOnSecurity/sysmon-config |
| Sysmon 模块化配置 | https://github.com/olafhartong/sysmon-modular |
| BTFHub | https://github.com/aquasecurity/btfhub |
