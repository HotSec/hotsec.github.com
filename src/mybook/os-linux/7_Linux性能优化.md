# Linux 性能优化

## 1. 性能分析方法论

### 1.1 USE 方法

USE（Utilization/Saturation/Errors）方法对每个资源检查三个指标：

| 指标 | 含义 | 说明 |
|------|------|------|
| Utilization | 使用率 | 资源忙的时间百分比 |
| Saturation | 饱和度 | 资源排队/溢出的程度 |
| Errors | 错误数 | 错误事件计数 |

### 1.2 性能排查流程

```
1. 确定问题（CPU/内存/磁盘/网络）
2. 查看系统负载（uptime/top）
3. 定位瓶颈资源
4. 深入分析（perf/strace/火焰图）
5. 优化并验证
```

## 2. CPU 优化

### 2.1 监控工具

```bash
top -H -p <PID>                  # 查看进程线程
htop                              # 交互式top
vmstat 1 10                       # 虚拟内存统计
mpstat -P ALL 1 10                # 每个CPU核心统计
pidstat -u 1                      # 进程CPU使用率
sar -u 1 10                       # 历史CPU统计
```

### 2.2 上下文切换

```bash
vmstat 1
# cs 列：上下文切换次数/秒
# 超过 100000 次/秒需关注

pidstat -w 1
# cswch/s：自愿上下文切换（等待I/O/锁）
# nvcswch/s：非自愿上下文切换（时间片用完被调度）

perf stat -e context-switches -a sleep 10
```

### 2.3 perf 性能分析

```bash
perf top                          # 实时热点函数
perf record -g -p <PID> sleep 30  # 采样30秒
perf report                       # 分析采样结果
perf script                       # 脚本输出

perf stat -e cycles,instructions,cache-misses ./myapp

perf record -e cpu-clock -g -- ./myapp
perf report --stdio
```

### 2.4 火焰图

```bash
perf record -F 99 -g -p <PID> sleep 30
perf script > perf.out
# 使用 FlameGraph 工具
git clone https://github.com/brendangregg/FlameGraph
FlameGraph/stackcollapse-perf.pl perf.out | FlameGraph/flamegraph.pl > flame.svg
```

### 2.5 CPU 优化策略

```bash
# 绑定CPU核心
taskset -c 0-3 ./myapp
taskset -cp 0-3 <PID>

# 调整进程优先级
nice -n 10 ./myapp
renice -n -5 -p <PID>

# 调整调度策略
chrt -f 80 ./myapp                # SCHED_FIFO 优先级80
chrt -r 50 ./myapp                # SCHED_RR 优先级50
```

## 3. 内存优化

### 3.1 监控工具

```bash
free -h                           # 内存使用概览
vmstat 1 10                       # 虚拟内存统计
cat /proc/meminfo                 # 详细内存信息
slabtop                           # 内核slab缓存
pidstat -r 1                      # 进程内存使用
sar -r 1 10                       # 历史内存统计
pmap -x <PID>                     # 进程内存映射
```

### 3.2 关键指标

```bash
cat /proc/meminfo | grep -E "MemTotal|MemFree|MemAvailable|Buffers|Cached|SwapTotal|SwapFree"

# MemAvailable = Free + Buffers + Cached（可回收部分）
# 实际可用内存看 MemAvailable，不看 MemFree
```

### 3.3 Swap 优化

```bash
cat /proc/sys/vm/swappiness       # 默认60，值越低越少用swap
sysctl vm.swappiness=10           # 服务器建议10-30

# 临时关闭swap
swapoff -a && swapon -a

# 查看swap使用
cat /proc/swaps
swapon -s
```

### 3.4 大页内存（HugePages）

```bash
cat /proc/meminfo | grep Huge
# HugePages_Total/HugePages_Free/Hugepagesize

# 配置大页
echo 1024 > /proc/sys/vm/nr_hugepages
sysctl -w vm.nr_hugepages=1024

# 挂载 hugetlbfs
mount -t hugetlbfs nodev /mnt/hugepages
```

### 3.5 OOM Killer

```bash
dmesg | grep -i "out of memory"   # 查看OOM记录
cat /proc/<PID>/oom_score         # 查看OOM分数
cat /proc/<PID>/oom_score_adj     # 调整OOM分数（-1000到1000）

echo -1000 > /proc/<PID>/oom_score_adj  # 禁止被OOM杀死
echo 1000 > /proc/<PID>/oom_score_adj   # 优先被OOM杀死

sysctl vm.overcommit_memory=0     # 默认，启发式
sysctl vm.overcommit_memory=1     # 总是允许
sysctl vm.overcommit_memory=2     # 严格限制（overcommit_ratio）
```

## 4. 磁盘 I/O 优化

### 4.1 监控工具

```bash
iostat -x 1 10                    # 磁盘I/O统计
iotop                             # 进程I/O排名
pidstat -d 1                      # 进程磁盘使用
sar -d 1 10                       # 历史磁盘统计
nfsiostat 1                       # NFS I/O统计
```

### 4.2 关键指标

```bash
iostat -x 1
# %util：设备使用率（>80%需关注）
# await：平均I/O等待时间（ms）
# svctm：平均服务时间
# avgqu-sz：平均队列长度
# r/s w/s：每秒读写次数
# rMB/s wMB/s：每秒读写吞吐量
```

### 4.3 I/O 调度器

```bash
cat /sys/block/sda/queue/scheduler  # 查看当前调度器
# [mq-deadline] cfq noop

echo noop > /sys/block/sda/queue/scheduler      # SSD推荐
echo mq-deadline > /sys/block/sda/queue/scheduler  # 数据库推荐
echo bfq > /sys/block/sda/queue/scheduler       # 桌面推荐
```

| 调度器 | 适用场景 | 特点 |
|--------|----------|------|
| noop | SSD/NVMe | 简单FIFO，无排序 |
| mq-deadline | 数据库/SSD | 保证延迟上限 |
| cfq | 传统桌面 | 公平分配带宽 |
| bfq | 桌面/交互 | 低延迟公平调度 |

### 4.4 文件系统优化

```bash
# 挂载选项优化
mount -o noatime,nodiratime /dev/sda1 /data
# noatime：不更新访问时间
# nodiratime：不更新目录访问时间

# ext4 优化
tune2fs -o journal_data_writeback /dev/sda1

# XFS 优化
mount -o allocsize=64m /dev/sda1 /data
```

## 5. 网络优化

### 5.1 监控工具

```bash
ss -s                             # 连接统计
ss -tn state established | wc -l  # 已建立连接数
netstat -s                        # 网络统计
sar -n DEV 1 10                   # 网卡流量
sar -n TCP 1 10                   # TCP统计
nethogs                           # 按进程显示流量
iftop                             # 实时流量
```

### 5.2 TCP 连接优化

```bash
sysctl -w net.core.somaxconn=65535
sysctl -w net.core.netdev_max_backlog=65535
sysctl -w net.ipv4.tcp_max_syn_backlog=65535
sysctl -w net.ipv4.tcp_tw_reuse=1
sysctl -w net.ipv4.tcp_tw_recycle=0
sysctl -w net.ipv4.tcp_fin_timeout=15
sysctl -w net.ipv4.tcp_keepalive_time=600
sysctl -w net.ipv4.tcp_keepalive_intvl=30
sysctl -w net.ipv4.tcp_keepalive_probes=3
sysctl -w net.ipv4.tcp_max_tw_buckets=65535
sysctl -w net.ipv4.ip_local_port_range="1024 65535"
```

### 5.3 TCP 缓冲区优化

```bash
sysctl -w net.core.rmem_max=16777216
sysctl -w net.core.wmem_max=16777216
sysctl -w net.ipv4.tcp_rmem="4096 87380 16777216"
sysctl -w net.ipv4.tcp_wmem="4096 65536 16777216"
sysctl -w net.ipv4.tcp_moderate_rcvbuf=1
```

### 5.4 TCP 拥塞控制

```bash
sysctl net.ipv4.tcp_available_congestion_control
sysctl -w net.ipv4.tcp_congestion_control=bbr
sysctl -w net.core.default_qdisc=fq
```

## 6. 系统级调优

### 6.1 ulimit 资源限制

```bash
ulimit -a                         # 查看所有限制
ulimit -n 65535                   # 文件描述符
ulimit -u 65535                   # 用户进程数
ulimit -c unlimited               # core dump

# /etc/security/limits.conf 永久配置
* soft nofile 65535
* hard nofile 65535
* soft nproc 65535
* hard nproc 65535
root soft nofile 65535
root hard nofile 65535
```

### 6.2 sysctl 内核参数

```bash
# /etc/sysctl.conf 或 /etc/sysctl.d/*.conf

# 文件描述符
fs.file-max = 1048576
fs.nr_open = 1048576

# 内存
vm.swappiness = 10
vm.dirty_ratio = 20
vm.dirty_background_ratio = 5
vm.overcommit_memory = 0

# 网络
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_congestion_control = bbr
net.core.default_qdisc = fq

# 安全
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.conf.all.send_redirects = 0

# 生效
sysctl -p
```

### 6.3 NUMA 优化

```bash
numactl --hardware                # 查看NUMA拓扑
numastat                          # NUMA统计
numactl --cpunodebind=0 --membind=0 ./myapp  # 绑定NUMA节点
```

### 6.4 IRQ 亲和性

```bash
cat /proc/interrupts              # 查看中断分布
cat /proc/irq/<IRQ>/smp_affinity  # 查看IRQ亲和性
echo 0f > /proc/irq/<IRQ>/smp_affinity  # 设置IRQ亲和性

# irqbalance 服务自动平衡IRQ
systemctl status irqbalance
```

## 7. 性能优化清单

### 7.1 快速排查流程

```bash
# 1. 系统负载
uptime

# 2. CPU
top -H -n 1 | head -20
mpstat -P ALL 1 3

# 3. 内存
free -h
vmstat 1 3

# 4. 磁盘I/O
iostat -x 1 3

# 5. 网络
ss -s
sar -n DEV 1 3

# 6. 进程
pidstat -urdh 1 3
```

### 7.2 常见瓶颈与对策

| 瓶颈 | 症状 | 对策 |
|------|------|------|
| CPU | %us 高，load 高 | 优化算法/多线程/绑核 |
| CPU I/O Wait | %wa 高 | 优化磁盘I/O/减少swap |
| 内存不足 | swap 使用高 | 增加内存/优化程序/调整swappiness |
| 磁盘I/O | %util 高，await 高 | SSD/调度器/缓存/异步I/O |
| 网络瓶颈 | 丢包/高延迟 | 调整TCP参数/BBR/增加带宽 |
| 连接数满 | Cannot assign requested address | 调整端口范围/复用TIME_WAIT |

## 8. 面试题

### 1. load average 的含义？

load average 是运行队列中进程数的指数移动平均：
- 1分钟/5分钟/15分钟三个值
- 值 = CPU核数 表示满载
- 值 > CPU核数 表示有进程排队等待
- 包含 D 状态（不可中断睡眠，通常是 I/O 等待）的进程

### 2. 如何排查 CPU 100% 问题？

```bash
top -H -p <PID>        # 找到高CPU线程
printf "%x\n" <TID>    # 线程ID转十六进制
jstack <PID> | grep <HEX_TID>  # Java: 查看线程堆栈
perf top -p <PID>      # C/C++: 查看热点函数
strace -p <TID> -c     # 查看系统调用
```

### 3. OOM Killer 如何选择进程？

根据 `oom_score` 选择分数最高的进程杀死。分数基于：
- 进程使用的内存量（RSS + swap）
- 进程的子进程内存
- `oom_score_adj` 调整值（-1000 到 1000）
- 设置 `oom_score_adj = -1000` 可禁止被杀

### 4. 如何减少 TIME_WAIT 连接？

```bash
sysctl -w net.ipv4.tcp_tw_reuse=1     # 允许复用TIME_WAIT
sysctl -w net.ipv4.tcp_fin_timeout=15  # 缩短FIN_WAIT2超时
sysctl -w net.ipv4.tcp_max_tw_buckets=65535  # 增加上限
```
