# DPDK 开发教程

## 一、DPDK 概述

### 1.1 什么是 DPDK

**DPDK**（Data Plane Development Kit，数据平面开发套件）是 Intel 主导的开源软件库和驱动程序集合，用于快速数据包处理。

**核心理念**：绕过 Linux 内核网络协议栈，在**用户态**直接访问网卡，实现高性能数据包处理。

### 1.2 性能对比

| 指标 | 传统内核网络栈 | DPDK |
|------|--------------|------|
| 数据包处理延迟 | 毫秒级 | 微秒级 (~25-50μs) |
| 每秒数据包数 (pps) | 数十万 | 数千万 |
| CPU 利用率 | 中等 | 低（轮询模式） |
| 内核参与 | 全程参与 | 零参与（数据平面） |

### 1.3 典型应用场景

- **软件定义网络 (SDN)**：Open vSwitch 加速
- **虚拟交换机**：VMware NSX、OVS-DPDK
- **网络功能虚拟化 (NFV)**：防火墙、负载均衡器、路由器
- **高性能代理**：CGNAT、DPI、DDoS 防护
- **金融交易系统**：低延迟网络通信
- **电信基础设施**：5G UPF、VPP

---

## 二、工作原理

### 2.1 UIO / VFIO 机制

```
传统方式：
  网卡 → 内核驱动 → 内核协议栈 → 用户空间

DPDK 方式：
  网卡 → 用户空间应用（绕过内核）
```

**DPDK 使用 UIO/VFIO 技术**：
- 将网卡驱动映射到用户空间
- 网卡接收的数据包直接 DMA 到用户态内存
- 无需内核态参与数据平面

### 2.2 轮询模式驱动 (PMD)

```c
// DPDK 轮询模式：无中断，持续检查网卡
while (1) {
    struct rte_mbuf *pkts[MAX_PKT_BURST];
    uint16_t nb_rx = rte_eth_rx_burst(port_id, queue_id, pkts, MAX_PKT_BURST);
    
    for (int i = 0; i < nb_rx; i++) {
        process_packet(pkts[i]);
    }
}
```

### 2.3 核心组件架构

```
┌──────────────────────────────────────────────────────────┐
│                     用户空间                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  应用层     │  │  LPM / ACL  │  │  Flow Table     │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐│
│  │  EAL (Environment Abstraction Layer)               ││
│  │  - 内存管理 (mbuf/pool)                             ││
│  │  - CPU 亲和性                                       ││
│  │  - 大页内存                                         ││
│  │  - 多核调度                                         ││
│  └─────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│                     内核空间                             │
│  UIO/VFIO - 用户态 I/O 映射                              │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│                     硬件                                 │
│  网卡 (支持 DPDK 的 NIC)                                 │
└──────────────────────────────────────────────────────────┘
```

---

## 三、环境配置

### 3.1 系统要求

| 要求 | 说明 |
|------|------|
| CPU | 支持 SSE/AVX 指令集（Intel/AMD） |
| 内存 | 建议 4GB+ |
| 网卡 | 支持 DPDK 的网卡（Intel i40e、ixgbe、virtio 等） |
| OS | Linux 3.2+（推荐 Ubuntu 22.04+ / CentOS 8+） |

### 3.2 安装依赖

```bash
# Ubuntu
sudo apt update
sudo apt install -y build-essential pkg-config
sudo apt install -y libc6-dev-i386 libnuma-dev
sudo apt install -y linux-headers-$(uname -r)

# CentOS
sudo yum groupinstall -y "Development Tools"
sudo yum install -y kernel-devel kernel-headers numactl-devel
```

### 3.3 编译 DPDK

```bash
# 下载 DPDK（以 23.11.3 为例）
wget https://fast.dpdk.org/rel/dpdk-23.11.3.tar.xz
tar xf dpdk-23.11.3.tar.xz
cd dpdk-23.11.3

# 配置编译（使用 meson）
meson setup build
ninja -C build

# 安装
sudo ninja -C build install
sudo ldconfig
```

### 3.4 大页内存配置

**大页（Hugepages）** 是 DPDK 高性能的关键：
- 减少 TLB Miss
- 支持大内存映射
- 内存锁定（mlock）

```bash
# 查看当前大页配置
cat /proc/meminfo | grep -i huge

# 配置 1GB 大页（需重启）
# 编辑 /etc/default/grub
GRUB_CMDLINE_LINUX="default_hugepagesz=1G hugepagesz=1G hugepages=16"

# 更新 grub 并重启
sudo update-grub
sudo reboot

# 或临时配置 2MB 大页（无需重启）
sudo sh -c 'echo 1024 > /proc/sys/vm/nr_hugepages'

# 挂载大页文件系统
sudo mkdir -p /mnt/huge
sudo mount -t hugetlbfs none /mnt/huge
# 永久挂载：在 /etc/fstab 添加：
# nodev /mnt/huge hugetlbfs pagesize=1G 0 0
```

### 3.5 网卡绑定

```bash
# 查看可用网卡
dpdk-devbind.py --status

# 绑定网卡到 vfio-pci（推荐）
echo "vfio-pci" | sudo tee /sys/module/vfio/parameters/enable_unsafe_noiommu_mode
sudo modprobe vfio-pci
sudo dpdk-devbind.py --bind=vfio-pci 0000:01:00.0

# 或绑定到 uio_pci_generic
sudo modprobe uio_pci_generic
sudo dpdk-devbind.py --bind=uio_pci_generic 0000:01:00.0

# 解绑恢复内核驱动
sudo dpdk-devbind.py --bind=igb_uio 0000:01:00.0  # 或 ixgbe
```

### 3.6 验证环境

```bash
# 运行 helloworld 示例
cd build/examples/helloworld
sudo ./helloworld -l 0-3

# 运行 l2fwd 示例（简单二层转发）
sudo ./l2fwd -l 0-1 -m 64 -- -p 0x01
```

---

## 四、快速入门示例

### 4.1 基础数据包收发

```c
#include <rte_eal.h>
#include <rte_ethdev.h>
#include <rte_mbuf.h>
#include <rte_malloc.h>

#define RX_RING_SIZE 1024
#define TX_RING_SIZE 1024
#define NUM_MBUFS 8191
#define MBUF_CACHE_SIZE 250
#define BURST_SIZE 32

// Ether header
struct ether_hdr {
    struct ether_addr dst;
    struct ether_addr src;
    uint16_t ether_type;
};

// 初始化 EAL
int init_eal(int argc, char **argv) {
    int ret = rte_eal_init(argc, argv);
    if (ret < 0) {
        rte_exit(EXIT_FAILURE, "EAL init failed\n");
    }
    return ret;
}

// 分配内存池（mbuf pool）
struct rte_mempool *create_mbuf_pool(void) {
    return rte_pktmbuf_pool_create(
        "MBUF_POOL",
        NUM_MBUFS * rte_lcore_count(),
        MBUF_CACHE_SIZE,
        0,
        RTE_MBUF_DEFAULT_BUF_SIZE,
        rte_socket_id()
    );
}

// 配置网卡
int configure_port(uint16_t port_id, struct rte_mempool *mbuf_pool) {
    struct rte_eth_conf port_conf = {
        .rxmode = { .mq_mode = ETH_MQ_RX_NONE },
        .txmode = { .mq_mode = ETH_MQ_TX_NONE },
    };

    struct rte_eth_rxconf rx_conf;
    struct rte_eth_txconf tx_conf;

    // 获取并配置默认 rx/tx 队列配置
    rx_conf = (struct rte_eth_rxconf)rte_eth_rxconf_default;
    tx_conf = (struct rte_eth_txconf)rte_eth_txconf_default;

    // 配置接收和发送队列
    if (rte_eth_rx_queue_setup(port_id, 0, RX_RING_SIZE,
                                 rte_eth_dev_socket_id(port_id),
                                 &rx_conf, mbuf_pool) < 0) {
        rte_exit(EXIT_FAILURE, "rx_queue_setup failed\n");
    }

    if (rte_eth_tx_queue_setup(port_id, 0, TX_RING_SIZE,
                                 rte_eth_dev_socket_id(port_id),
                                 &tx_conf) < 0) {
        rte_exit(EXIT_FAILURE, "tx_queue_setup failed\n");
    }

    // 启动端口
    if (rte_eth_dev_start(port_id) < 0) {
        rte_exit(EXIT_FAILURE, "dev_start failed\n");
    }

    // 开启混杂模式（用于抓包）
    rte_eth_promiscuous_enable(port_id);

    return 0;
}

// 收发包主循环
void packet_io_loop(uint16_t port_id) {
    struct rte_mbuf *rx_bufs[BURST_SIZE];
    struct rte_mbuf *tx_bufs[BURST_SIZE];

    while (1) {
        // 接收数据包
        uint16_t nb_rx = rte_eth_rx_burst(port_id, 0, rx_bufs, BURST_SIZE);

        if (nb_rx > 0) {
            // 转发收到的数据包
            uint16_t nb_tx = rte_eth_tx_burst(port_id, 0, rx_bufs, nb_rx);

            // 释放未发送的 mbuf
            if (nb_tx < nb_rx) {
                for (uint16_t i = nb_tx; i < nb_rx; i++) {
                    rte_pktmbuf_free(rx_bufs[i]);
                }
            }
        }
    }
}

int main(int argc, char **argv) {
    // 初始化 EAL
    int argc_init = init_eal(argc, argv);
    argc -= argc_init;
    argv += argc_init;

    // 创建 mbuf 池
    struct rte_mempool *mbuf_pool = create_mbuf_pool();

    // 检查网卡数量
    if (rte_eth_dev_count_avail() == 0) {
        rte_exit(EXIT_FAILURE, "No Ethernet ports found\n");
    }

    // 配置第一个网卡
    uint16_t port_id = 0;
    configure_port(port_id, mbuf_pool);

    printf("Port %u initialized\n", port_id);

    // 进入收发包主循环
    packet_io_loop(port_id);

    // 清理
    rte_eal_cleanup();
    return 0;
}
```

**编译运行**：
```bash
# 编译
gcc -o pktio pktio.c \
    $(pkg-config --cflags --libs libdpdk) \
    -O3 -march=native -Wall

# 运行
sudo ./pktio -l 0-3 -m 1024 -- -p 0x01
# -l: CPU core mask
# -m: memory in MB
# -p: portmask
```

### 4.2 简单防火墙示例

```c
// 基于五元组的包过滤
int filter_packet(struct rte_mbuf *pkt) {
    struct ether_hdr *eth = rte_pktmbuf_mtod(pkt, struct ether_hdr *);
    
    if (eth->ether_type == rte_cpu_to_be_16(ETHER_TYPE_IPv4)) {
        struct ipv4_hdr *ip = (struct ipv4_hdr *)((char *)eth + sizeof(struct ether_hdr));
        uint8_t proto = ip->next_proto_id;
        uint32_t src_ip = ip->src_addr;
        uint16_t src_port = 0;

        if (proto == IPPROTO_TCP || proto == IPPROTO_UDP) {
            struct tcpudp_hdr *l4 = (struct tcpudp_hdr *)
                ((char *)ip + (ip->version_ihl & 0x0F) * 4);
            src_port = rte_be_to_cpu_16(l4->src_port);
        }

        // 简单过滤规则
        if (blocked_ip == src_ip) {
            rte_pktmbuf_free(pkt);
            return 0;
        }
    }
    return 1;
}
```

---

## 五、核心概念

### 5.1 mbuf（内存缓冲区）

mbuf 是 DPDK 中数据包的核心数据结构：

```c
struct rte_mbuf {
    struct rte_mbuf *next;         // mbuf 链表的下一个
    uint16_t data_len;             // 当前段中的数据长度
    uint16_t pkt_len;              // 总包长（包括所有段）
    void *buf_addr;                // 缓冲区起始地址
    uint16_t buf_len;              // 缓冲区总长度
    
    /* 头部信息 */
    uint64_t timestamp;
    uint32_t seqn;
    uint16_t vlan_tci;
    uint16_t ol_flags;             // 脱卸标签 (offload flags)
    
    /* 协议头部快速访问 */
    struct rte_ether_hdr *l2_hdr;
    struct rte_ipv4_hdr *l3_hdr;
    struct rte_tcp_hdr *l4_hdr;
} __rte_cache_aligned;
```

### 5.2 Memory Pool（内存池）

```c
// 创建内存池
struct rte_mempool *mbuf_pool = rte_pktmbuf_pool_create(
    "PACKET_POOL",         // 名称
    8192,                   // 对象数量
    MBUF_CACHE_SIZE,        // 每核缓存数量
    0,                      // 私有数据大小
    RTE_MBUF_DEFAULT_BUF_SIZE, // 数据区域大小
    rte_socket_id()         // NUMA 节点
);

// 从池中获取 mbuf
struct rte_mbuf *pkt = rte_pktmbuf_alloc(mbuf_pool);

// 释放 mbuf
rte_pktmbuf_free(pkt);
```

### 5.3 RSS（接收侧扩展）

RSS 通过哈希将数据包分发到不同队列：

```c
struct rte_eth_conf port_conf = {
    .rxmode = {
        .mq_mode = ETH_MQ_RX_RSS,
        .RSS_KEY = rss_key,
        .RSS_KEY_LEN = 40,
        .RSS_HF = ETH_RSS_IP | ETH_RSS_TCP | ETH_RSS_UDP,
    },
};
```

### 5.4 Flow Director

精确匹配流量到指定队列：

```c
struct rte_eth_fdir_flow flow;
memset(&flow, 0, sizeof(flow));
flow.input.flow_type = RTE_ETH_FLOW_IPV4;
flow.input.flow.ip4_flow.src_ip = src_ip;
flow.input.flow.ip4_flow.dst_ip = dst_ip;
// ... 配置其他字段
rte_eth_dev_fdir_add_perfect_filter(port, &flow, ...);
```

---

## 六、多核与负载均衡

### 6.1 lcores（逻辑核心）

DPDK 的 EAL 支持将线程绑定到特定 CPU 核心：

```bash
# 将应用绑定到 core 0,1,2
sudo ./app -l 0-2

# 指定主从核
sudo ./app -l 0-7 -n 4 --master-lcore 0

# 查看 lcore 分布
rte_eal_has_hugeged_link_mz() 
rte_lcore_count()
```

### 6.2 工作队列分配策略

```
物理网卡 (RSS 哈希)
       │
       ├─→ 队列0 ──→ Core 0 (lcore 0)
       ├─→ 队列1 ──→ Core 1 (lcore 1)
       ├─→ 队列2 ──→ Core 2 (lcore 2)
       └─→ 队列3 ──→ Core 3 (lcore 3)
```

### 6.3 无锁 Ring

DPDK 的 rte_ring 实现高效的无锁队列：

```c
#include <rte_ring.h>

struct rte_ring *ring = rte_ring_create(
    "PKT_RING",
    1024,          // 容量（必须是 2 的幂）
    SOCKET0_ANY,
    RING_F_SP_ENQ | RING_F_SC_DEQ  // 单生产者/单消费者模式
);

// 入队
rte_ring_sp_enqueue(ring, pkt);

// 出队
rte_ring_sc_dequeue(ring, (void **)&pkt);
```

---

## 七、常见陷阱与调试

### 7.1 性能问题排查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 低吞吐量 | 未绑定网卡 | 使用 `dpdk-devbind.py` 绑定 |
| 高延迟 | 大页未配置 | 配置 1G/2MB 大页 |
| CPU 100% | 轮询过密 | 优化 burst size |
| 丢包 | mbuf 池太小 | 增加 NUM_MBUFS |
| 内存不足 | 大页太少 | 增加 hugepages |

### 7.2 调试命令

```bash
# 查看 DPDK 端口统计
sudo ./build/app/dpdk-procinfo -- --stats

# 查看大页使用
cat /proc/meminfo | grep -i huge

# 查看网卡状态
dpdk-devbind.py --status

# 查看 NUMA
lscpu | grep NUMA
numactl --hardware
```

### 7.3 常见错误

```bash
# EAL: failed to map hugepage memory
# 原因：大页未配置或空间不足
# 解决：增加 hugepages

# EAL: probe failed: driver not managed by UIO
# 原因：网卡未绑定到 UIO 驱动
# 解决：dpdk-devbind.py --bind=uio_pci_generic <pci>

# EAL: Cannot open NUMA socket
# 原因：numactl 未安装或 NUMA 配置错误
# 解决：安装 libnuma-dev

# Port 0: Not managed by UIO driver
# 原因：需要先绑定网卡
# 解决：modprobe uio_pci_generic && dpdk-devbind.py -b uio_pci_generic <pci>
```

---

## 八、DPDK vs AF_XDP vs XDP 对比

| 维度 | DPDK | AF_XDP | XDP |
|------|------|--------|-----|
| 数据平面 | 用户态 | 用户态 | 内核态 |
| 性能 | 最高 (~50μs) | 高 (~100μs) | 最高 |
| CPU 占用 | 持续轮询 | 按需轮询 | 中断+轮询混合 |
| 生态 | 成熟庞大 | 快速发展 | 成熟 |
| 适用场景 | NFV/电信 | 云原生网络 | 快速包处理 |
| 内存占用 | 较高 | 中等 | 极低 |
| 网卡要求 | 专用驱动 | XDP 支持 | XDP 支持 |
| 安全性 | 隔离好 | 依赖内核 | 最高 |

---

## 九、参考资源

- [DPDK 官方文档](https://doc.dpdk.org/)
- [DPDK GitHub](https://github.com/DPDK/dpdk)
- [DPDK 示例程序](https://doc.dpdk.org/guides/sample_app_ug/intro.html)
- [intel/dpdk-linux/getting-started](https://doc.dpdk.org/guides/linux_gsg/)
