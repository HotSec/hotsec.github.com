# 系统调优指南

本文档介绍如何优化系统以达到最佳的 40Gbps 捕获性能。

## 1. 内核参数调整

编辑 `/etc/sysctl.conf`:

```conf
net.core.rmem_max = 67108864
net.core.wmem_max = 67108864
net.core.rmem_default = 67108864
net.core.wmem_default = 67108864
net.core.optmem_max = 67108864

net.core.netdev_max_backlog = 100000
net.core.somaxconn = 65535

net.netfilter.nf_conntrack_max = 1000000

net.ipv4.tcp_max_syn_backlog = 100000
net.ipv4.tcp_tw_reuse = 1
net.ipv4.ip_local_port_range = 1024 65535

vm.nr_hugepages = 2048
vm.swappiness = 0
vm.dirty_ratio = 80
vm.dirty_background_ratio = 5
vm.dirty_writeback_centisecs = 100
vm.dirty_expire_centisecs = 500
```

应用配置:
```bash
sysctl -p
```

## 2. 大页配置

```bash
echo 2048 > /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages

hugetlbfs /dev/hugepages hugetlbfs defaults 0 0

mkdir -p /dev/hugepages
mount -t hugetlbfs nodev /dev/hugepages
```

## 3. 网卡配置

### 设置多队列
```bash
ethtool -L eth0 combined 4
```

### 禁用 offload
```bash
ethtool -K eth0 gro off lro off tso off gso off
ethtool -K eth0 rxhash on
```

### 设置队列长度
```bash
ifconfig eth0 txqueuelen 10000
```

## 4. CPU 隔离

编辑 `/etc/default/grub`:
```
GRUB_CMDLINE_LINUX_DEFAULT="isolcpus=0-3 nohz_full=0-3 rcu_nocbs=0-3"
```

更新 GRUB:
```bash
update-grub
```

## 5. 服务配置

创建 `/etc/systemd/system/highspeed-capture.service`:
```ini
[Unit]
Description=Highspeed Packet Capture
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/highspeed-capture
ExecStart=/opt/highspeed-capture/target/release/highspeed-capture --config /opt/highspeed-capture/config/default.toml
Restart=always
RestartSec=10
LimitMEMLOCK=infinity
LimitNOFILE=1048576
CPUAffinity=0 1 2 3

[Install]
WantedBy=multi-user.target
```

启用服务:
```bash
systemctl daemon-reload
systemctl enable highspeed-capture
systemctl start highspeed-capture
```

## 6. 性能监控

### 检查丢包
```bash
ethtool -S eth0 | grep drop
```

### 检查软中断
```bash
watch -d -n 1 cat /proc/net/softnet_stat
```

### 使用 sar
```bash
sar -n DEV 1
```