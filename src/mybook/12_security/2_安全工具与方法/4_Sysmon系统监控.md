# Sysmon 系统监控工具

## 1. Sysmon 简介

### 1.1 什么是 Sysmon

Sysmon (System Monitor) 是 Windows Sysinternals 工具集中的系统活动监控工具，用于：
- 记录详细的系统事件（进程创建、网络连接、文件访问等）
- 提供高可信度的日志供安全分析
- 集成到 Windows 事件跟踪 (ETW) 框架中
- 可配置的事件规则，支持灵活监控

### 1.2 特点

- **低开销**: 作为内核驱动运行，高效轻量
- **高可信度**: 记录不可伪造的事件 ID 和 GUID
- **持久化**: 配置后自动启动，不受重启影响
- **规则驱动**: 支持自定义规则配置
- **详细记录**: 提供进程链、哈希、命令行参数等深度信息

## 2. 安装与配置

### 2.1 下载与安装

从微软官方下载最新版：  
https://learn.microsoft.com/sysinternals/downloads/sysmon

```powershell
# 使用管理员权限安装
.\Sysmon64.exe -i

# 带配置文件安装
.\Sysmon64.exe -i sysmonconfig.xml

# 卸载
.\Sysmon64.exe -u
```

### 2.2 配置文件基础

Sysmon 使用 XML 配置文件定义监控规则。最小配置示例：

```xml
<Sysmon schemaversion="4.90">
  <HashAlgorithms>MD5,SHA256</HashAlgorithms>
  <EventFiltering>
    <!-- 监控所有进程创建 -->
    <ProcessCreate onmatch="include">
    </ProcessCreate>
  </EventFiltering>
</Sysmon>
```

### 2.3 更新配置

```powershell
# 更新配置而不重启服务
.\Sysmon64.exe -c sysmonconfig.xml
```

## 3. 核心事件类型

### 3.1 事件概览

| 事件 ID | 事件名称 | 说明 |
|---------|----------|------|
| 1 | Process Create | 进程创建 |
| 2 | File Creation Time Changed | 文件创建时间修改 |
| 3 | Network Connection | 网络连接 |
| 5 | Process Terminated | 进程结束 |
| 6 | Driver Loaded | 驱动加载 |
| 7 | Image Loaded | 镜像加载 |
| 8 | CreateRemoteThread | 创建远程线程 |
| 10 | Process Access | 进程访问 |
| 11 | File Create | 文件创建/覆盖 |
| 12 | RegistryEvent | 注册表添加/删除 |
| 13 | RegistryEvent | 注册表值修改 |
| 14 | RegistryEvent | 注册表键/值重命名 |
| 15 | FileCreateStreamHash | 备用数据流创建 |
| 16 | Service Configuration Change | 服务配置更改 |
| 17 | PipeEvent | 管道创建 |
| 18 | PipeEvent | 管道连接 |
| 19 | WmiEvent | WMI 事件滤镜注册 |
| 20 | WmiEvent | WMI 消费者注册 |
| 21 | WmiEvent | WMI 滤镜/消费者绑定 |
| 22 | DNSEvent | DNS 查询 |
| 23 | FileDelete | 文件删除 |
| 24 | ClipboardChange | 剪贴板内容变化 |
| 25 | ProcessTampering | 进程篡改检测 |
| 26 | FileDeleteDetected | 文件删除检测 (不阻止) |

### 3.2 进程创建 (Event ID 1)

最常用的事件之一，记录所有新进程的详细信息：

```xml
<ProcessCreate onmatch="include">
  <Rule groupRelation="or">
    <!-- 包含所有进程 -->
  </Rule>
</ProcessCreate>
```

记录内容包括：
- 进程 GUID
- 命令行参数
- 父进程 ID
- 进程哈希值 (MD5/SHA1/SHA256/IMPHASH)
- 用户信息
- 登录会话 ID

### 3.3 网络连接 (Event ID 3)

记录所有出站和入站网络连接：

```xml
<NetworkConnect onmatch="include">
  <!-- 记录所有网络连接 -->
</NetworkConnect>
```

记录内容：
- 源 IP/端口
- 目标 IP/端口
- 协议 (TCP/UDP)
- 进程信息

### 3.4 文件创建 (Event ID 11)

监控文件的创建或覆盖：

```xml
<FileCreate onmatch="include">
  <TargetFilename condition="contains">\Temp\</TargetFilename>
  <TargetFilename condition="contains">Downloads</TargetFilename>
</FileCreate>
```

## 4. 配置规则语法

### 4.1 包含/排除

```xml
<!-- 包含所有但排除某些 -->
<ProcessCreate onmatch="exclude">
  <Image condition="is">C:\Windows\System32\svchost.exe</Image>
</ProcessCreate>

<!-- 明确包含某些 -->
<ProcessCreate onmatch="include">
  <Image condition="contains">powershell</Image>
</ProcessCreate>
```

### 4.2 条件操作符

| 条件 | 说明 |
|------|------|
| is | 完全匹配 |
| is not | 非完全匹配 |
| contains | 包含字符串 |
| excludes | 排除字符串 |
| begin with | 前缀匹配 |
| end with | 后缀匹配 |
| image | 镜像路径匹配 |

### 4.3 组合规则 (groupRelation)

```xml
<Rule groupRelation="and">
  <!-- 必须同时满足 -->
  <Image condition="contains">powershell</Image>
  <CommandLine condition="contains">-EncodedCommand</CommandLine>
</Rule>

<Rule groupRelation="or">
  <!-- 满足任一即可 -->
  <Image condition="contains">cmd.exe</Image>
  <Image condition="contains">powershell.exe</Image>
</Rule>
```

## 5. 实用配置示例

### 5.1 基础安全配置 (SwiftOnSecurity)

著名社区配置：https://github.com/SwiftOnSecurity/sysmon-config

```xml
<Sysmon schemaversion="4.80">
  <HashAlgorithms>MD5,SHA256</HashAlgorithms>

  <EventFiltering>
    <!-- 进程创建 -->
    <ProcessCreate onmatch="exclude">
      <Image condition="is">C:\Windows\System32\svchost.exe</Image>
    </ProcessCreate>

    <!-- 网络连接 -->
    <NetworkConnect onmatch="include">
    </NetworkConnect>

    <!-- 文件创建 -->
    <FileCreate onmatch="include">
      <TargetFilename condition="contains">\Temp\</TargetFilename>
      <TargetFilename condition="contains">Downloads</TargetFilename>
      <TargetFilename condition="end with">.exe</TargetFilename>
      <TargetFilename condition="end with">.dll</TargetFilename>
      <TargetFilename condition="end with">.ps1</TargetFilename>
    </FileCreate>

    <!-- 远程线程 -->
    <CreateRemoteThread onmatch="include">
    </CreateRemoteThread>

    <!-- DNS 查询 -->
    <DnsQuery onmatch="include">
    </DnsQuery>
  </EventFiltering>
</Sysmon>
```

### 5.2 检测 PowerShell 滥用

```xml
<ProcessCreate onmatch="include">
  <Rule groupRelation="or">
    <!-- 编码命令 -->
    <CommandLine condition="contains">-EncodedCommand</CommandLine>
    <CommandLine condition="contains">-e </CommandLine>
    <CommandLine condition="contains">-enc</CommandLine>
    <!-- 下载脚本 -->
    <CommandLine condition="contains">IEX</CommandLine>
    <CommandLine condition="contains">IWR</CommandLine>
    <CommandLine condition="contains">Invoke-WebRequest</CommandLine>
    <!-- Base64 编码 -->
    <CommandLine condition="contains">FromBase64String</CommandLine>
  </Rule>
</ProcessCreate>
```

### 5.3 检测恶意文档

```xml
<ProcessCreate onmatch="include">
  <ParentImage condition="contains">winword.exe</ParentImage>
  <ParentImage condition="contains">excel.exe</ParentImage>
  <ParentImage condition="contains">powerpnt.exe</ParentImage>
  <Image condition="contains">cmd.exe</Image>
</ProcessCreate>
```

## 6. 日志查看

### 6.1 事件查看器

1. 打开 `Event Viewer` (eventvwr.msc)
2. 导航到：`Application and Services Logs/Microsoft/Windows/Sysmon/Operational`

### 6.2 PowerShell 查询

```powershell
# 查询所有 Sysmon 进程创建事件
Get-WinEvent -LogName "Microsoft-Windows-Sysmon/Operational" `
  -FilterXPath "*[System[(EventID=1)]]"

# 查询特定进程
Get-WinEvent -LogName "Microsoft-Windows-Sysmon/Operational" `
  -FilterXPath "*[System[(EventID=1)]]" | 
  Where-Object { $_.Message -match "powershell.exe" }

# 导出为 CSV
Get-WinEvent -LogName "Microsoft-Windows-Sysmon/Operational" `
  -FilterXPath "*[System[(EventID=1)]]" | 
  Export-Csv -Path "C:\sysmon_events.csv" -NoTypeInformation
```

## 7. 集成与使用场景

### 7.1 威胁狩猎

使用 Sysmon 数据配合工具：
- **Elasticsearch / Logstash / Kibana (ELK)**: 可视化和分析
- **Splunk**: 安全监控仪表板
- **Microsoft Sentinel**: Azure 云原生 SIEM
- **Zeek / Suricata**: 网络流量与 Sysmon 关联

### 7.2 事件响应流程

1. 检测到可疑事件（如编码 PowerShell 执行）
2. 查询 Sysmon 日志，获取完整进程链
3. 检查文件哈希值（对比 VirusTotal 或内部黑名单）
4. 查看网络连接记录
5. 保留取证证据

### 7.3 持久化检测

```xml
<RegistryEvent onmatch="include" eventtype="SetValue">
  <TargetObject condition="contains">CurrentVersion\Run</TargetObject>
  <TargetObject condition="contains">CurrentVersion\RunOnce</TargetObject>
  <TargetObject condition="contains">Winlogon</TargetObject>
</RegistryEvent>
```

## 8. 常见陷阱与最佳实践

### 8.1 性能与日志量

- **避免全量日志**: 会占用大量磁盘 I/O 和存储空间
- **优先排除噪声**: 排除常见的正常应用和系统进程
- **使用规则分组**: 提高匹配效率

### 8.2 规则冲突处理

- 更具体的规则先处理
- 排除规则优先于包含规则（取决于 onmatch 值）
- 测试规则前先在隔离环境中验证

### 8.3 取证注意事项

- 不要在受感染的机器上运行未签名的 Sysmon
- 保留原始日志文件，不修改时间戳
- 保存 Sysmon 配置文件用于重新生成
- 结合系统其他日志（安全日志、应用日志）

## 9. 高级技巧

### 9.1 检测进程空洞

```xml
<ProcessTampering onmatch="include">
</ProcessTampering>
```

### 9.2 监控备用数据流 (ADS)

```xml
<FileCreateStreamHash onmatch="include">
</FileCreateStreamHash>
```

### 9.3 结合 ETW

Sysmon 生成的 ETW 事件可以被其他工具消费：

```powershell
# 使用 logman 收集
logman create trace -n SysmonTrace -p "Microsoft-Windows-Sysmon" -o sysmon.etl -ets
```

## 10. 常用资源

| 资源 | 链接 |
|------|------|
| 官方文档 | https://learn.microsoft.com/sysinternals/downloads/sysmon |
| SwiftOnSecurity 配置 | https://github.com/SwiftOnSecurity/sysmon-config |
| Olaf Hartong 配置 | https://github.com/olafhartong/sysmon-modular |
| Sysinternals 论坛 | https://forum.sysinternals.com/ |
| MITRE ATT&CK 映射 | https://github.com/mitre-attack/ |
