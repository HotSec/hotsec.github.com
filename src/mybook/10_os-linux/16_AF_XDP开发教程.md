# AF_XDP 开发教程

## 一、AF_XDP 概述

### 1.1 什么是 AF_XDP

**AF_XDP**（Address Family XDP）是 Linux 内核提供的一种高性能套接字类型，允许在**用户态**直接接收和发送网络数据包，绕过部分内核协议栈。

**定位**：介于 XDP（内核态）和 DPDK（纯用户态）之间的方案——既有 XDP 的内核集成优势，又有用户态编程的灵活性。

### 1.2 AF_XDP vs XDP vs 传统网络

```
传统网络路径：
  NIC → 内核驱动 → 网络栈 → Socket → 用户空间
         ↑ 所有处理都在内核完成

XDP 路径：
  NIC → XDP 程序（内核） → 动作（drop/redirect/pass）
         ↑ 可在内核早期处理

AF_XDP 路径：
  NIC → XDP（内核） → 重定向到用户空间套接字 → 用户空间应用
         ↑ 内核早期分流到用户态
```

### 1.3 核心优势

| 优势 | 说明 |
|------|------|
| **极低延迟** | 内核分流，无需完整协议栈 |
| **高吞吐** | 零拷贝路径，避免多次内存复制 |
| **安全隔离** | 依赖内核 BPF 沙箱 |
| **生态兼容** | 与内核网络栈共存，无需独占网卡 |
| **可编程性** | XDP 程序可定制数据包处理逻辑 |
| **资源友好** | 非持续轮询（中断驱动） |

### 1.4 典型应用场景

- **DDoS 防护**：在内核早期丢弃恶意流量
- **负载均衡**：XDP 层快速分发到多个后端
- **防火墙**：高性能包过滤
- **网络监控**：无干扰抓包分析
- **加速代理**：DNS 缓存、HTTP 加速
- **云原生网络**：Cilium CNI 的数据平面

---

## 二、工作原理

### 2.1 架构图

```
┌─────────────────────────────────────────────────────────┐
│                     用户空间                             │
│                                                         │
│   ┌─────────────────────────────────────────────────┐  │
│   │           AF_XDP 套接字                         │  │
│   │  ┌──────────┐   ┌──────────┐                   │  │
│   │  │ Fill Queue│   │Completion│                   │  │
│   │  │  (RX 供源)│   │ Queue (TX │                   │  │
│   │  └────┬─────┘   └────┬─────┘                   │  │
│   │       │              │                          │  │
│   │  ┌────▼──────────────▼─────┐                   │  │
│   │  │       UMEM（共享内存）     │                   │  │
│   │  └────────────────────────────┘                   │  │
│   └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓  (mmap 共享内存)
┌─────────────────────────────────────────────────────────┐
│                     内核空间                             │
│                                                         │
│   ┌──────────────────────────────────────────────────┐ │
│   │        XDP 程序 (BPF)                            │ │
│   │  if (match condition)                            │ │
│   │      return XDP_REDIRECT → AF_XDP 套接字         │ │
│   │  else                                            │ │
│   │      return XDP_PASS → 正常网络栈                 │ │
│   └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                     硬件                                 │
│   NIC (需要 XDP 支持: i40e, mlx5, virtio-net 等)        │
└─────────────────────────────────────────────────────────┘
```

### 2.2 UMEM 机制

**UMEM** 是 AF_XDP 中用户态和内核共享的内存区域，用于无拷贝传递数据包：

```
UMEM 内存布局（连续大块内存，通常 2M 或 1G 大页）：
┌──────────────┬──────────────┬──────────────┬──────────────┐
│    Chunk 0   │    Chunk 1   │    Chunk 2   │    Chunk N   │
│  (packet buf) │  (packet buf) │  (packet buf) │  (packet buf) │
└──────────────┴──────────────┴──────────────┴──────────────┘
        ↑                        ↑
   FQ (Fill Queue)          RX Queue 指向
   指向空闲 chunk           已接收的 chunk
```

### 2.3 队列机制

AF_XDP 使用三种队列管理 UMEM：

| 队列 | 方向 | 说明 |
|------|------|------|
| **Fill Queue (FQ)** | 用户→内核 | 通知内核空闲 chunk 的位置 |
| **RX Queue** | 内核→用户 | 内核放入已接收数据包的 chunk |
| **Completion Queue (CQ)** | 内核→用户 | 通知用户 TX 已完成的 chunk |

---

## 三、环境配置

### 3.1 内核要求

- **最低版本**：Linux 4.18+（完整 AF_XDP 支持）
- **推荐版本**：Linux 5.4+（稳定版本）
- **XDP 支持**：需要网卡驱动支持（i40e、mlx5、virtio-net 等）

### 3.2 检查 XDP 支持

```bash
# 查看内核是否支持 XDP
grep -i xdp /boot/config-$(uname -r)

# 应该看到类似输出：
# CONFIG_XDP_SOCKETS=y
# CONFIG_XDP_SOCKETS_DIAG=y

# 检查网卡 XDP 支持
ethtool -l eth0
# Multi queue supported: yes
# Combined channels: 8
```

### 3.3 安装 libbpf 和 iproute2

```bash
# Ubuntu
sudo apt install -y libbpf-dev clang llvm
sudo apt install -y iproute2  # ip 命令需要较新版本

# 或者从源码编译 libbpf
git clone https://github.com/libbpf/libbpf.git
cd libbpf/src
make
sudo make install
sudo ldconfig
```

### 3.4 验证环境

```bash
# 检查 XDP 支持状态
ip link show eth0
# 或使用 ethtool
ethtool -i eth0 | grep driver

# 测试 ip 命令（需要支持 xdpgeneric）
ip link set dev eth0 xdp object /path/to/xdp_prog.o section xdp 2>&1
```

---

## 四、快速入门示例

### 4.1 XDP 程序（数据包过滤）

用 clang 编译的 BPF 程序，加载到网卡：

```c
// xdp_prog.c
#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <bpf/bpf_helpers.h>

// 统计计数器
struct {
    __uint(type, BPF_MAP_TYPE_PERCPU_ARRAY);
    __uint(max_entries, 256);
    __type(key, __u32);
    __type(value, __u64);
} rxcnt SEC(".maps");

static __always_inline int parse_iphdr(struct xdp_md *ctx, void *data,
                                        __u64 off, void *data_end) {
    struct iphdr *iph = data + off;
    if ((void *)(iph + 1) > data_end)
        return XDP_PASS;
    
    // 丢弃特定 IP
    if (iph->saddr == __builtin_bswap32(0xC0A80001)) { // 192.168.0.1
        return XDP_DROP;
    }
    
    return XDP_PASS;
}

SEC("xdp")
int xdp_prog_main(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    struct ethhdr *eth = data;
    
    // 基础检查
    if ((void *)(eth + 1) > data_end)
        return XDP_PASS;
    
    // 只处理 IPv4
    if (eth->h_proto == __builtin_bswap16(ETH_P_IP))
        return parse_iphdr(ctx, data, sizeof(*eth), data_end);
    
    return XDP_PASS;
}

char _license[] SEC("license") = "GPL";
```

**编译**：
```bash
clang -O2 -target bpf -c xdp_prog.c -o xdp_prog.o
```

### 4.2 AF_XDP 用户态程序

```c
// af_xdp_rx.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <sys/socket.h>
#include <linux/if_xdp.h>
#include <linux/if_ether.h>
#include <arpa/inet.h>

#define UMEM_CHUNK_SIZE 2048
#define UMEM_NUM_CHUNKS 4096
#define RX_BATCH_SIZE 64

struct xdp_umem_reg {
    __u64 addr;            // UMEM 地址
    __u64 len;             // UMEM 长度
    __u32 fill_size;       // FQ 大小
    __u32 comp_size;       // CQ 大小
    __u32 flags;           // 标志
    __u32 tx_ring_size;    // TX 环大小
    __u32 rx_ring_size;    // RX 环大小
};

// 创建 AF_XDP 套接字
int create_af_xdp_socket(const char *ifname, struct xdp_umem_reg *umem_reg) {
    int sock = socket(AF_XDP, SOCK_RAW, 0);
    if (sock < 0) {
        perror("socket(AF_XDP)");
        return -1;
    }

    // 绑定到接口
    struct sockaddr_xdp addr = {
        .sxdp_family = AF_XDP,
        .sxdp_flags = XDP_USE_NEED_WAKEUP | XDP_USE_SW_MRENE,
        .sxdp_ifindex = if_nametoindex(ifname),
        .sxdp_queue_id = 0,  // 使用队列 0
    };

    if (bind(sock, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        perror("bind");
        close(sock);
        return -1;
    }

    return sock;
}

// 初始化 UMEM
int init_umem(int sock, void **umem_area, size_t *umem_size) {
    size_t size = UMEM_CHUNK_SIZE * UMEM_NUM_CHUNKS;
    
    // 分配大页内存（推荐）或普通内存
    *umem_area = memfd_create("umem_area", MFD_HUGETLB | MFD_HUGE_2MB);
    if (*umem_area < 0) {
        // fallback 到普通内存
        *umem_area = mmap(NULL, size, PROT_READ | PROT_WRITE,
                         MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
        if (*umem_area == MAP_FAILED) {
            perror("mmap");
            return -1;
        }
    }
    *umem_size = size;

    struct xdp_umem_reg reg = {
        .addr = (__u64)*umem_area,
        .len = size,
        .fill_size = UMEM_NUM_CHUNKS / 2,
        .comp_size = UMEM_NUM_CHUNKS / 2,
        .flags = XDP_UMEM_UNALIGNED_CHUNK_FLAG, // 非对齐模式
    };

    if (setsockopt(sock, SOL_XDP, XDP_UMEM_REG, &reg, sizeof(reg)) < 0) {
        perror("setsockopt(XDP_UMEM_REG)");
        return -1;
    }

    // 设置 FQ 和 CQ
    struct xdp_mmap_offsets off;
    socklen_t optlen = sizeof(off);
    getsockopt(sock, SOL_XDP, XDP_MMAP_OFFSETS, &off, &optlen);

    // mmap FQ 和 CQ
    void *fq_map = mmap(0, UMEM_NUM_CHUNKS * sizeof(__u64) * 2,
                        PROT_READ | PROT_WRITE, MAP_SHARED, sock,
                        XDP_UMEM_PGOFF_FILL_RING);
    void *cq_map = mmap(0, UMEM_NUM_CHUNKS * sizeof(__u64) * 2,
                        PROT_READ | PROT_WRITE, MAP_SHARED, sock,
                        XDP_UMEM_PGOFF_COMPLETION_RING);

    return 0;
}

// 填充 FQ（供内核使用）
void fill_fq(int sock, void *umem_area, __u32 *indices, int count) {
    struct xdp_ring *ring = (struct xdp_ring *)((char *)umem_area + 
                          UMEM_NUM_CHUNKS * sizeof(__u64) * 0);
    __u32 *desc = (__u32 *)ring;
    
    for (int i = 0; i < count; i++) {
        desc[i] = indices[i];  // chunk index
    }
    __sync_synchronize();
    ring->producer += count;
}

// 接收数据包
int receive_packets(int sock, void *umem_area, struct xdp_ring *rx_ring) {
    unsigned int consumer = rx_ring->consumer;
    int batch = 0;
    struct xdp_desc desc_arr[RX_BATCH_SIZE];

    // 从 RX ring 读取描述符
    while (batch < RX_BATCH_SIZE) {
        __u32 idx = consumer & (UMEM_NUM_CHUNKS - 1);
        __u64 *desc = (__u64 *)((char *)rx_ring + sizeof(__u64) + idx * sizeof(__u64));
        
        if (!((*desc) & 1)) {  // 检查是否有效
            break;
        }
        
        desc_arr[batch] = *(struct xdp_desc *)desc;
        consumer++;
        batch++;
    }
    rx_ring->consumer = consumer;

    // 处理数据包
    for (int i = 0; i < batch; i++) {
        __u32 idx = desc_arr[i].addr >> 16;  // 从描述符获取 chunk index
        char *pkt = (char *)umem_area + (idx << 16);
        __u32 len = desc_arr[i].len;

        // 解析以太网头
        struct ethhdr *eth = (struct ethhdr *)pkt;
        printf("Received: %02x:%02x:%02x:%02x:%02x:%02x → %02x:%02x:%02x:%02x:%02x:%02x, len=%u\n",
               eth->h_source[0], eth->h_source[1], eth->h_source[2],
               eth->h_source[3], eth->h_source[4], eth->h_source[5],
               eth->h_dest[0], eth->h_dest[1], eth->h_dest[2],
               eth->h_dest[3], eth->h_dest[4], eth->h_dest[5],
               len);
    }

    return batch;
}

int main(int argc, char **argv) {
    const char *ifname = "eth0";
    if (argc > 1) ifname = argv[1];

    int sock = create_af_xdp_socket(ifname, NULL);
    if (sock < 0) return 1;

    void *umem_area;
    size_t umem_size;
    if (init_umem(sock, &umem_area, &umem_size) < 0) return 1;

    // 填充空闲 chunk 到 FQ
    __u32 indices[UMEM_NUM_CHUNKS / 2];
    for (int i = 0; i < UMEM_NUM_CHUNKS / 2; i++) {
        indices[i] = i;
    }
    fill_fq(sock, umem_area, indices, UMEM_NUM_CHUNKS / 2);

    printf("AF_XDP socket initialized on %s\n", ifname);

    // 主循环
    struct xdp_ring *rx_ring = (struct xdp_ring *)
        ((char *)umem_area + UMEM_NUM_CHUNKS * sizeof(__u64) * 2);

    while (1) {
        // 使用 poll 等待数据（配合 XDP_USE_NEED_WAKEUP）
        struct pollfd pfd = { .fd = sock, .events = POLLIN };
        poll(&pfd, 1, 1000);

        receive_packets(sock, umem_area, rx_ring);
    }

    close(sock);
    return 0;
}
```

**编译**：
```bash
gcc -o af_xdp_rx af_xdp_rx.c -lpthread
sudo ./af_xdp_rx eth0
```

### 4.3 加载 XDP 程序

```bash
# 方式1：ip 命令（需要 iproute2 新版本）
sudo ip link set dev eth0 xdp object xdp_prog.o section xdp

# 方式2：使用 xdp-loader（推荐，更方便）
sudo xdp-loader load -M eth0 xdp_prog.o

# 查看已加载的 XDP 程序
ip link show eth0

# 卸载
sudo ip link set dev eth0 xdp off
sudo xdp-loader unload eth0
```

---

## 五、libxdp 封装库

libxdp 提供了更简洁的编程接口：

```c
#include <xdp/libxdp.h>
#include <xdp/xdp_skinfo.h>

int main(int argc, char **argv) {
    const char *ifname = "eth0";
    const char *prog_path = "./xdp_prog.o";

    // 加载 XDP 程序
    struct xdp_program *prog = xdp_program__open_file(prog_path, "xdp", NULL);
    if (!prog) {
        perror("xdp_program__open_file");
        return 1;
    }

    // 附加到网卡
    int ifindex = if_nametoindex(ifname);
    int err = xdp_program__attach(prog, ifindex, XDP_MODE_SKB, 0);
    if (err) {
        perror("xdp_program__attach");
        return 1;
    }

    printf("XDP program loaded on %s\n", ifname);

    // 清理
    xdp_program__detach(prog, ifindex, XDP_MODE_SKB, 0);
    xdp_program__close(prog);

    return 0;
}
```

---

## 六、libbpf-bootstrap 模板

从 libbpf-bootstrap 获取基础模板：

```bash
git clone https://github.com/libbpf/libbpf-bootstrap.git
cd libbpf-bootstrap/examples/c

# 基础示例
# - minimal: 最简单的 XDP 程序
# - xdp1: XDP 转发
# - af_xdp1: AF_XDP 用户态程序
```

**minimal_xdp.bpf.c**（内核态 XDP）：
```c
#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <bpf/bpf_helpers.h>

SEC("xdp")
int xdp_prog_simple(struct xdp_md *ctx) {
    return XDP_PASS;  // 所有数据包通过
}
```

**minimal.c**（用户态加载器）：
```c
#include <stdio.h>
#include <stdlib.h>
#include <bpf/bpf.h>
#include <bpf/libbpf.h>

int main(int argc, char **argv) {
    struct bpf_object *obj;
    struct bpf_program *prog;
    int prog_fd;
    int ifindex = if_nametoindex("eth0");

    obj = bpf_object__open_file("xdp_kern.o", NULL);
    bpf_program__set_type(
        bpf_object__find_program_by_name(obj, "xdp_prog_simple"),
        BPF_PROG_TYPE_XDP
    );
    bpf_object__load(obj);

    prog = bpf_object__find_program_by_name(obj, "xdp_prog_simple");
    prog_fd = bpf_program__fd(prog);

    bpf_set_link_xdp_fd(ifindex, prog_fd, 0);

    printf("XDP program attached\n");
    return 0;
}
```

---

## 七、性能调优

### 7.1 Socket 选项

| 选项 | 说明 | 推荐值 |
|------|------|--------|
| `XDP_USE_NEED_WAKEUP` | TX 需要 wakeup 内核 | 开启 |
| `XDP_USE_SW_MRENE` | 软件模式重定向 | 多队列场景 |
| `XDP_UMEM_UNALIGNED_CHUNK_FLAG` | 非对齐 chunk | 减少内存碎片 |

### 7.2 多队列配置

```bash
# 启用多队列（增加队列数）
ethtool -L eth0 combined 8

# 将不同队列分配给不同 CPU
# 使用 taskset 绑定进程到特定核心
taskset -c 0-7 ./af_xdp_app
```

### 7.3 大页内存

```bash
# 配置 2MB 大页
echo 1024 | sudo tee /proc/sys/vm/nr_hugepages
mkdir -p /mnt/huge
mount -t hugetlbfs nodev /mnt/huge

# 在程序中使用大页
# memfd_create 带 MFD_HUGE_2MB 标志
int fd = memfd_create("umem", MFD_HUGETLB | MFD_HUGE_2MB);
ftruncate(fd, size);
```

---

## 八、DPDK + AF_XDP 协同

### 8.1 混合架构

某些场景可以结合两者优势：

```
高速流量（已知模式）→ AF_XDP → 用户空间处理
未知流量          → XDP_PASS → 内核协议栈
特定需求          → DPDK    → 高性能 NFV
```

### 8.2 选型建议

| 场景 | 推荐方案 |
|------|----------|
| 云原生 Kubernetes | **AF_XDP**（Cilium） |
| 电信/运营商 NFV | **DPDK** |
| 快速包过滤/DDoS | **XDP**（内核） |
| 研发快速原型 | **AF_XDP** |
| 超高吞吐专用硬件 | **DPDK** |

---

## 九、常见错误与调试

### 9.1 错误排查

```bash
# 检查 dmesg 中的 XDP 错误
dmesg | grep -i xdp

# 检查网卡统计
ip -s link show eth0

# 查看 AF_XDP socket 统计
cat /proc/net/xdp/af_xdp_stats
```

### 9.2 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `XDP not supported` | 网卡驱动不支持 | 使用支持的网卡（mlx5/i40e） |
| `Umem fault` | UMEM 内存问题 | 使用大页，检查 mmap |
| `Invalid queue_id` | 队列号超范围 | 检查 `ethtool -L` |
| `Address family not supported` | 内核未编译 XDP | 重新编译内核或使用内核模块 |

### 9.3 perf 分析

```bash
# 查看 XDP 执行统计
perf stat -e xdp:* ./af_xdp_app

# 使用 bpftool 查看 map
sudo bpftool map show
sudo bpftool map dump id <id>
```

---

## 十、参考资源

- [Linux AF_XDP 文档](https://www.kernel.org/doc/html/latest/networking/af_xdp.html)
- [libxdp GitHub](https://github.com/xdp-project/xdp-tools)
- [libbpf-bootstrap](https://github.com/libbpf/libbpf-bootstrap)
- [Cilium XDP 文档](https://docs.cilium.io/en/latest/bpf/)
- [XDP 官方示例](https://github.com/xdp-project/xdp-tutorial)
- [AF_XDP 内核文档](https://www.kernel.org/doc/html/latest/networking/af_xdp_kernel.html)