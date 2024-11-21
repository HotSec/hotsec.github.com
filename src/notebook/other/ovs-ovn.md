# OVS

- [1. OVN](#1-ovn)
- [2. ovs-dpdk](#2-ovs-dpdk)
- [3. 编译dpdk](#3-编译dpdk)
  - [3.1. 编译ovs](#31-编译ovs)
  - [3.2. 配置大页内存](#32-配置大页内存)
  - [3.3. 使用 VFIO 设置 DPDK 设备 （可选？）](#33-使用-vfio-设置-dpdk-设备-可选)
  - [3.4. 启动ovs-dpdk](#34-启动ovs-dpdk)
  - [3.5. 验证是否成功](#35-验证是否成功)

## 1. OVN

- OVN提供了一个集中式的 OVS 控制器。这样可以从集群角度对整个网络设施进行编排
- GO-OVN
- Kube-OVN

一些特性

- Logical switches： **逻辑交换机*- ，用来做二层转发。
- L2/L3/L4 ACLs：二到四层的 ACL，可以根据报文的 MAC 地址，IP 地址，端口号来做访问控制。
- Logical routers： **逻辑路由器*- ，分布式的，用来做三层转发。
- Multiple tunnel overlays：支持多种隧道封装技术，有 Geneve，STT 和 VXLAN。
- TOR switch or software logical switch gateways：支持使用硬件 TOR switch 或者软件逻辑 switch 当作网关来连接物理网络和虚拟网络。

- **OVN和其它通用SDN控制器的主要区别**

  - OVN专注于实现云计算管理平台场景下的SDN控制器
  - OVN专注于实现二层和三层网络功能。除了在传输层实现了基于L4的ACL 外， **基本上不在L4 ~ L7层实现某些功能*- 。

CMS（Cloud Management System）

## 2. ovs-dpdk

> [使用 DPDK 打开 vSwitch — Open vSwitch 3.2.90 文档(opens new window)](https://docs.openvswitch.org/en/latest/intro/install/dpdk/)
>
> [将 Open vSwitch 与 DPDK 配合使用 — Open vSwitch 3.2.90 文档(opens new window)](https://docs.openvswitch.org/en/latest/howto/dpdk/)

## 3. 编译dpdk

```bash
dnf groupinstall "Development Tools"
dnf install python-pyelftools numactl-devel
mkdir study_dpdk
cd study_dpdk
wget https://fast.dpdk.org/rel/dpdk-22.11.1.tar.xz
tar -xf dpdk-22.11.1.tar.xz
export DPDK_DIR=/root/code/study_dpdk/dpdk-stable-22.11.1
cd $DPDK_DIR
export DPDK_BUILD=$DPDK_DIR/build
meson build
ninja
ninja -C build
ninja -C build install
ldconfig
pkg-config --modversion libdpdk
export PKG_CONFIG_PATH=/usr/local/lib64/pkgconfig
cd ../
```

### 3.1. 编译ovs

```bash
git clone https://github.com/openvswitch/ovs.git
cd ovs
./boot.sh
./configure --with-dpdk=static
make -j18
make install
export PATH=$PATH:/usr/local/share/openvswitch/scripts
```

### 3.2. 配置大页内存

- 设置大页， 共512个hugepage，每个page 2M，所以hugepages占用1G内存

```bash
echo 512 > /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages
mkdir /mnt/huge
mount -t hugetlbfs nodev /mnt/huge
# 检查是否设置成功
> # grep Huge /proc/meminfo
AnonHugePages:         0 kB
ShmemHugePages:        0 kB
FileHugePages:         0 kB
HugePages_Total:     512
HugePages_Free:      511
HugePages_Rsvd:        0
HugePages_Surp:        0
Hugepagesize:       2048 kB
Hugetlb:         1048576 kB

# 挂载
mount -t hugetlbfs none /dev/hugepages
```

### 3.3. 使用 VFIO 设置 DPDK 设备 （可选？）

使用最新版本的 DPDK 时，VFIO 优先于 UIO 驱动程序。VFIO的 支持内核和 BIOS 所需的支持。对于前者，内核 必须使用版本 > 3.6。对于后者，您必须在 BIOS 中启用 VT-d 并确保这是通过 grub 配置的。要确保通过 BIOS 启用 VT-d， 跑：

`$ dmesg | grep -e DMAR -e IOMMU` 如果 BIOS 中未启用 VT-d，请立即启用它。

要确保在内核中启用 VT-d，请运行：

$`cat /proc/cmdline | grep iommu=pt $ cat /proc/cmdline | grep intel_iommu=on `如果内核中未启用 VT-d，请立即启用它。

正确配置 VT-d 后，加载所需的模块并绑定 NIC 到 VFIO 驱动程序：

$` modprobe vfio-pci $ /usr/bin/chmod a+x /dev/vfio $ /usr/bin/chmod 0666 /dev/vfio/- $ $DPDK_DIR/usertools/dpdk-devbind.py --bind=vfio-pci eth1 $ $DPDK_DIR/usertools/dpdk-devbind.py --status`

### 3.4. 启动ovs-dpdk

```bash
export DB_SOCK=/usr/local/var/run/openvswitch/db.sock
> # echo $DB_SOCK
/usr/local/var/run/openvswitch/db.sock
> # cat /proc/cmdline
BOOT_IMAGE=(hd0,gpt2)/vmlinuz-6.5.6-200.fc38.x86_64 root=/dev/mapper/fedora-root ro biosdevname=0 no_tiora/swap net.ifnames=0
> # ovs-ctl start
Starting ovsdb-server                                      [  OK  ]
system ID not configured, please use --system-id ... failed!
Configuring Open vSwitch system IDs                        [  OK  ]
Inserting openvswitch module                               [  OK  ]
Starting ovs-vswitchd                                      [  OK  ]
Enabling remote OVSDB managers                             [  OK  ]

root@fedora ~
> # ovs-vsctl --no-wait set Open_vSwitch . other_config:dpdk-init=true

root@fedora ~
> # ovs-ctl --no-ovsdb-server --db-sock="$DB_SOCK" start
ovs-vswitchd is already running.
Enabling remote OVSDB managers                             [  OK  ]
```

### 3.5. 验证是否成功

```bash


> # ovs-vsctl get Open_vSwitch . dpdk_initialized
true

> # ovs-vswitchd --version
ovs-vswitchd (Open vSwitch) 3.2.90
DPDK 22.11.1

## 创建网桥br0，并绑定dpdk端口
> # ovs-vsctl add-br br0 -- set bridge br0 datapath_type=netdev

> # ovs-vsctl add-port br0 myportnameone -- set Interface myportnameone \
    type=dpdk options:dpdk-devargs=0000:06:00.0
> # ovs-vsctl add-port br0 myportnametwo -- set Interface myportnametwo \
    type=dpdk options:dpdk-devargs=0000:06:00.1
> # ovs-vsctl show
970a13d8-46e9-4971-962f-709ae47ed541
    Bridge br0
        datapath_type: netdev
        Port myportnameone
            Interface myportnameone
                type: dpdk
                options: {dpdk-devargs="0000:06:00.0"}
        Port br0
            Interface br0
                type: internal
        Port myportnametwo
            Interface myportnametwo
                type: dpdk
                options: {dpdk-devargs="0000:06:00.1"}
    ovs_version: "3.2.90"

> # ovs-vsctl add-port br0 dpdk-p1 -- set Interface dpdk-p1 type=dpdk \
    options:dpdk-devargs="class=eth,mac=00:11:22:33:44:56"
```
