# gopsutil

gopsutil 是一个 Go 语言的系统监控库，用于获取 CPU、内存、磁盘、网络等系统信息，跨平台支持。

## 安装

```bash
go get github.com/shirou/gopsutil/v3
```

## CPU

```go
import "github.com/shirou/gopsutil/v3/cpu"

info, _ := cpu.Info()
for _, c := range info {
    fmt.Printf("CPU: %s, Cores: %d, MHz: %.0f\n", c.ModelName, c.Cores, c.Mhz)
}

percent, _ := cpu.Percent(time.Second, false)
fmt.Printf("CPU Usage: %.2f%%\n", percent[0])

counts, _ := cpu.Counts(true)
fmt.Printf("Logical Cores: %d\n", counts)
```

## 内存

```go
import "github.com/shirou/gopsutil/v3/mem"

v, _ := mem.VirtualMemory()
fmt.Printf("Total: %d MB, Used: %d MB, Usage: %.2f%%\n",
    v.Total/1024/1024, v.Used/1024/1024, v.UsedPercent)

s, _ := mem.SwapMemory()
fmt.Printf("Swap Total: %d MB, Used: %.2f%%\n", s.Total/1024/1024, s.UsedPercent)
```

## 磁盘

```go
import "github.com/shirou/gopsutil/v3/disk"

usage, _ := disk.Usage("/")
fmt.Printf("Disk Total: %d GB, Used: %.2f%%\n",
    usage.Total/1024/1024/1024, usage.UsedPercent)

partitions, _ := disk.Partitions(false)
for _, p := range partitions {
    fmt.Printf("Device: %s, Mount: %s, Fstype: %s\n", p.Device, p.Mountpoint, p.Fstype)
}

ioCounters, _ := disk.IOCounters()
for name, io := range ioCounters {
    fmt.Printf("%s: Read %d MB, Write %d MB\n",
        name, io.ReadBytes/1024/1024, io.WriteBytes/1024/1024)
}
```

## 网络

```go
import "github.com/shirou/gopsutil/v3/net"

interfaces, _ := net.Interfaces()
for _, iface := range interfaces {
    fmt.Printf("Interface: %s, MTU: %d, HardwareAddr: %s\n",
        iface.Name, iface.MTU, iface.HardwareAddr)
}

ioCounters, _ := net.IOCounters(false)
for _, io := range ioCounters {
    fmt.Printf("Sent: %d MB, Recv: %d MB\n",
        io.BytesSent/1024/1024, io.BytesRecv/1024/1024)
}

conns, _ := net.Connections("tcp")
for _, c := range conns {
    fmt.Printf("%s:%d -> %s:%d (%s)\n",
        c.Laddr.IP, c.Laddr.Port, c.Raddr.IP, c.Raddr.Port, c.Status)
}
```

## 进程

```go
import "github.com/shirou/gopsutil/v3/process"

pids, _ := process.Pids()
for _, pid := range pids {
    p, _ := process.NewProcess(pid)
    name, _ := p.Name()
    cpuPercent, _ := p.CPUPercent()
    memPercent, _ := p.MemoryPercent()
    fmt.Printf("PID: %d, Name: %s, CPU: %.2f%%, Mem: %.2f%%\n",
        pid, name, cpuPercent, memPercent)
}

self, _ := process.NewProcess(int32(os.Getpid()))
cmdline, _ := self.Cmdline()
createTime, _ := self.CreateTime()
status, _ := self.Status()
```

## 主机信息

```go
import "github.com/shirou/gopsutil/v3/host"

hostInfo, _ := host.Info()
fmt.Printf("Hostname: %s, OS: %s, Platform: %s, Kernel: %s\n",
    hostInfo.Hostname, hostInfo.OS, hostInfo.Platform, hostInfo.KernelVersion)

uptime, _ := host.Uptime()
fmt.Printf("Uptime: %d seconds\n", uptime)

users, _ := host.Users()
for _, u := range users {
    fmt.Printf("User: %s, Terminal: %s\n", u.User, u.Terminal)
}
```

## 系统负载

```go
import "github.com/shirou/gopsutil/v3/load"

avg, _ := load.Avg()
fmt.Printf("Load1: %.2f, Load5: %.2f, Load15: %.2f\n",
    avg.Load1, avg.Load5, avg.Load15)
```

## Docker 容器

```go
import "github.com/shirou/gopsutil/v3/docker"

containers, _ := docker.GetDockerStat()
for _, c := range containers {
    fmt.Printf("Container: %s, Image: %s, Status: %s\n",
        c.Name, c.Image, c.Status)
}
```

## 实用示例

### 系统监控采集

```go
type SystemMetrics struct {
    Timestamp   time.Time
    CPUPercent  float64
    MemPercent  float64
    DiskPercent float64
    NetSent     uint64
    NetRecv     uint64
}

func CollectMetrics() (*SystemMetrics, error) {
    cpuPct, _ := cpu.Percent(0, false)
    memInfo, _ := mem.VirtualMemory()
    diskInfo, _ := disk.Usage("/")
    netIO, _ := net.IOCounters(false)

    return &SystemMetrics{
        Timestamp:   time.Now(),
        CPUPercent:  cpuPct[0],
        MemPercent:  memInfo.UsedPercent,
        DiskPercent: diskInfo.UsedPercent,
        NetSent:     netIO[0].BytesSent,
        NetRecv:     netIO[0].BytesRecv,
    }, nil
}
```

### 健康检查

```go
func HealthCheck() map[string]bool {
    status := make(map[string]bool)

    cpuPct, _ := cpu.Percent(0, false)
    status["cpu_ok"] = cpuPct[0] < 80

    memInfo, _ := mem.VirtualMemory()
    status["memory_ok"] = memInfo.UsedPercent < 85

    diskInfo, _ := disk.Usage("/")
    status["disk_ok"] = diskInfo.UsedPercent < 90

    return status
}
```
