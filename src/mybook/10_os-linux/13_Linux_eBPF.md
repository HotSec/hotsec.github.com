# Linux eBPF

## 1. eBPF 简介

### 1.1 什么是 eBPF

eBPF (extended Berkeley Packet Filter) 是 Linux 内核中的虚拟机，允许在不修改内核源码或加载内核模块的情况下：
- 安全高效地执行程序
- 观察系统行为
- 监控网络流量
- 实现性能分析

### 1.2 eBPF 历史

- **BPF** (1992): 原始 Berkeley Packet Filter
- **eBPF** (2014): Linux 3.15 引入，扩展功能
- **现代 eBPF** (2018+): BPF 类型格式 (BTF) 支持完整的 C 结构体访问

## 2. eBPF 架构

### 2.1 组件概览

```
用户空间程序
     ↓
BPF System Calls (bpf(2))
     ↓
eBPF 验证器
     ↓
JIT 编译器
     ↓
内核程序 (Progs)
     ↓
Maps (数据存储)
```

### 2.2 程序类型

| 类型 | 用途 | 事件 |
|------|------|------|
| XDP | 网络数据包处理 | 网卡接收 |
| SockOps | Socket 操作 | socket syscall |
| Tracepoint | 内核追踪 | 预定义 tracepoint |
| Kprobe | 内核函数钩子 | 函数入口/返回 |
| Uprobe | 用户态函数钩子 | 函数入口/返回 |
| TC | 流量控制 | netfilter hooks |

## 3. 环境配置

### 3.1 检查内核版本

```bash
uname -r        # 需要 >= 4.18
bpftool version
```

### 3.2 安装工具

```bash
# Ubuntu/Debian
apt install linux-tools-$(uname -r) bpftool

# Fedora/CentOS
yum install bpftool

# Arch
pacman -S bpftool
```

### 3.3 启用 BPF 类型格式

```bash
# 检查 BTF 是否可用
ls /sys/kernel/btf/vmlinux

# 如果没有，安装内核调试信息
apt install linux-image-$(uname -r)-dbg
```

## 4. 简单的 eBPF 程序

### 4.1 Hello World - Tracepoint

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

SEC("tracepoint/syscalls/sys_enter_execve")
int tracepoint_execve(void *ctx)
{
    char fmt[] = "Hello execve!\n";
    bpf_trace_printk(fmt, sizeof(fmt));
    return 0;
}

char _license[] SEC("license") = "GPL";
```

### 4.2 编译与加载

```bash
clang -target bpf -Wall -O2 -c hello.bpf.c -o hello.bpf.o

# 加载程序
bpftool prog load hello.bpf.o /sys/fs/bpf/hello

# 附加到 tracepoint
cd /sys/kernel/debug/tracing/events/syscalls/sys_enter_execve
echo bpf > trace
echo 1 > enable

# 查看输出
cat /sys/kernel/debug/tracing/trace_pipe
```

## 5. BPF Maps

### 5.1 Hash 映射

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, __u32);    // pid
    __type(value, __u64);  // timestamp
} pid_map SEC(".maps");

SEC("tracepoint/syscalls/sys_enter_execve")
int tracepoint_execve(void *ctx)
{
    __u64 now = bpf_ktime_get_ns();
    __u32 pid = bpf_get_current_pid_tgid() >> 32;

    bpf_map_update_elem(&pid_map, &pid, &now, BPF_ANY);
    return 0;
}
```

### 5.2 Per-CPU 数组

```c
struct {
    __uint(type, BPF_MAP_TYPE_PERCPU_ARRAY);
    __uint(max_entries, 1);
    __type(key, __u32);
    __type(value, __u64);
} counter_map SEC(".maps");
```

## 6. 网络流量分析 (XDP)

### 6.1 简单的 XDP 丢包程序

```c
#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <bpf/bpf_helpers.h>

SEC("xdp")
int xdp_drop_udp(struct xdp_md *ctx)
{
    void *data = (void*)(long)ctx->data;
    void *data_end = (void*)(long)ctx->data_end;
    struct ethhdr *eth = data;
    struct iphdr *ip;

    if (data + sizeof(*eth) > data_end)
        return XDP_PASS;

    ip = data + sizeof(*eth);
    if ((void*)ip + sizeof(*ip) > data_end)
        return XDP_PASS;

    if (ip->protocol == IPPROTO_UDP)
        return XDP_DROP;

    return XDP_PASS;
}
```

### 6.2 加载到网卡

```bash
# 编译
clang -target bpf -O2 -Wall -c xdp_drop.bpf.c -o xdp_drop.bpf.o

# 加载到 eth0
ip link set dev eth0 xdp object xdp_drop.bpf.o sec xdp

# 验证
ip link show eth0
bpftool prog list

# 卸载
ip link set dev eth0 xdp off
```

## 7. 性能分析 (Kprobe)

### 7.1 统计 sys_write 调用次数

```c
struct {
    __uint(type, BPF_MAP_TYPE_PERCPU_HASH);
    __uint(max_entries, 1024);
    __type(key, __u32);
    __type(value, __u64);
} write_count SEC(".maps");

SEC("kprobe/__x64_sys_write")
int trace_write(struct pt_regs *ctx)
{
    __u32 pid = bpf_get_current_pid_tgid() >> 32;
    __u64 *count = bpf_map_lookup_elem(&write_count, &pid);

    if (count)
        (*count)++;
    else {
        __u64 initial = 1;
        bpf_map_update_elem(&write_count, &pid, &initial, BPF_ANY);
    }
    return 0;
}
```

## 8. 用户态与内核态通信

### 8.1 使用 Ring Buffer

```c
// 内核态：发送事件
struct event {
    __u32 pid;
    __u32 uid;
    char comm[16];
};

struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 1 << 24);  // 16MB
} ringbuf SEC(".maps");

// 发送事件
struct event *e = bpf_ringbuf_reserve(&ringbuf, sizeof(*e), 0);
if (e) {
    e->pid = ...;
    bpf_get_current_comm(&e->comm, sizeof(e->comm));
    bpf_ringbuf_submit(e, 0);
}
```

### 8.2 用户态读取

```python
from bcc import BPF
import ctypes

b = BPF(src_file="my_program.bpf.c")

# 回调函数处理 ringbuf 事件
def handle_event(cpu, data, size):
    event = b["events"].event(data)
    print(f"PID: {event.pid} COMM: {event.comm.decode()}")

b["events"].open_ring_buffer(handle_event)

print("Listening for events...")
while True:
    b.ring_buffer_poll()
```

## 9. 安全注意事项

- **验证器**: eBPF 程序必须通过验证器
- **无循环**: 不能有无限循环（可用 bounded loops）
- **内存安全**: 只允许访问分配的内存
- **BTF 限制**: 只允许访问指定的结构体字段

## 10. 工具链

| 工具 | 用途 |
|------|------|
| bpftool | eBPF 调试与管理 |
| bpftrace | eBPF 的 DTrace-like 脚本 |
| bcc | 高级 eBPF 开发库 |
| libbpf | 用于加载和管理 eBPF 程序 |
