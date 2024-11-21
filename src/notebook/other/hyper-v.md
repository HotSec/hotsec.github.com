# hyper-v

- [1. hyper-v虚拟机开机嵌套虚拟化的流程](#1-hyper-v虚拟机开机嵌套虚拟化的流程)
- [2. hyper-v 虚拟机 lvm 扩容](#2-hyper-v-虚拟机-lvm-扩容)
  - [2.1. 流程](#21-流程)
  - [2.2. 命令记录](#22-命令记录)
  - [2.3. fdisk 使用说明](#23-fdisk-使用说明)

## 1. hyper-v虚拟机开机嵌套虚拟化的流程

PS C:\Users\Administrator> Stop-VM  fedora_default
PS C:\Users\Administrator> Get-VM

Name                      State   CPUUsage(%) MemoryAssigned(M) Uptime             Status   Version

---

fedora_default            Off     0           0                 00:00:00           正常运行 10.0

PS C:\Users\Administrator> Get-VMProcessor -VMName fedora_default | fl

ResourcePoolName                             : Primordial
Count                                        : 14
CompatibilityForMigrationEnabled             : False
CompatibilityForMigrationMode                : MinimumFeatureSet
CompatibilityForOlderOperatingSystemsEnabled : False
HwThreadCountPerCore                         : 0
ExposeVirtualizationExtensions               : False
EnablePerfmonPmu                             : False
EnablePerfmonLbr                             : False
EnablePerfmonPebs                            : False
EnablePerfmonIpt                             : False
EnableLegacyApicMode                         : False
ApicMode                                     : Default
AllowACountMCount                            : False
CpuBrandString                               :
PerfCpuFreqCapMhz                            : 0
Maximum                                      : 100
Reserve                                      : 0
RelativeWeight                               : 100
MaximumCountPerNumaNode                      : 8
MaximumCountPerNumaSocket                    : 1
EnableHostResourceProtection                 : False
OperationalStatus                            : {}
StatusDescription                            : {}
Name                                         : 处理器
Id                                           : Microsoft:878A95FA-924D-4483-8721-170D5F23D3E0\b637f346-6a0e-4dec-af52-b
                                               d70cb80a21d\0
VMId                                         : 878a95fa-924d-4483-8721-170d5f23d3e0
VMName                                       : fedora_default
VMSnapshotId                                 : 00000000-0000-0000-0000-000000000000
VMSnapshotName                               :
CimSession                                   : CimSession: .
ComputerName                                 : WIN-X99
IsDeleted                                    : False
VMCheckpointId                               : 00000000-0000-0000-0000-000000000000
VMCheckpointName                             :

PS C:\Users\Administrator> Set-VMProcessor -ExposeVirtualizationExtensions $true -VMName fedora_default
PS C:\Users\Administrator> Get-VMProcessor -VMName fedora_default | fl

ResourcePoolName                             : Primordial
Count                                        : 14
CompatibilityForMigrationEnabled             : False
CompatibilityForMigrationMode                : MinimumFeatureSet
CompatibilityForOlderOperatingSystemsEnabled : False
HwThreadCountPerCore                         : 0
ExposeVirtualizationExtensions               : True
EnablePerfmonPmu                             : False
EnablePerfmonLbr                             : False
EnablePerfmonPebs                            : False
EnablePerfmonIpt                             : False
EnableLegacyApicMode                         : False
ApicMode                                     : Default
AllowACountMCount                            : False
CpuBrandString                               :
PerfCpuFreqCapMhz                            : 0
Maximum                                      : 100
Reserve                                      : 0
RelativeWeight                               : 100
MaximumCountPerNumaNode                      : 8
MaximumCountPerNumaSocket                    : 1
EnableHostResourceProtection                 : False
OperationalStatus                            : {}
StatusDescription                            : {}
Name                                         : 处理器
Id                                           : Microsoft:878A95FA-924D-4483-8721-170D5F23D3E0\b637f346-6a0e-4dec-af52-b
                                               d70cb80a21d\0
VMId                                         : 878a95fa-924d-4483-8721-170d5f23d3e0
VMName                                       : fedora_default
VMSnapshotId                                 : 00000000-0000-0000-0000-000000000000
VMSnapshotName                               :
CimSession                                   : CimSession: .
ComputerName                                 : WIN-X99
IsDeleted                                    : False
VMCheckpointId                               : 00000000-0000-0000-0000-000000000000
VMCheckpointName                             :
PS C:\Users\Administrator> Start-VM  fedora_default

## 2. hyper-v 虚拟机 lvm 扩容

### 2.1. 流程

1. hyper-v 虚拟机对应的设置界面将磁盘扩容或者添加一块新的磁盘
2. 将磁盘分区，分区格式选择 lvm fdisk /dev/sda
3. pvcreate /dev/sda4 创建一个新的物理卷
4. vgextend vgubuntu /dev/sda4 将新的物理卷添加到卷组中
5. lvextend -l +100%FREE /dev/mapper/vgubuntu-root 将卷组的空闲空间全部扩展逻辑卷
   1. lvextend -L +100GB /dev/mapper/vgubuntu-root /dev/sda
   2. 将 pv(/dev/sda4)中的 100g 空间添加到逻辑卷(/dev/mapper/vgubuntu-root)中
   3. lvextend /dev/mapper/vgubuntu-root /dev/sdb1 #将sdb1的空闲空间全部添加到逻辑卷中
6. resize2fs /dev/mapper/vgubuntu-root 重新加载逻辑卷，使 LV 扩容生效
   1. 或者是xfs_growfs /dev/mapper/fedora-root 看分区的格式
7. df -h 查看扩容是否生效

### 2.2. 命令记录

```shell
fdisk /dev/sda
命令(输入 m 获取帮助)： p
Disk /dev/sda：300 GiB，322122547200 字节，629145600 个扇区
Disk model: Virtual Disk
单元：扇区 / 1 * 512 = 512 字节
扇区大小(逻辑/物理)：512 字节 / 4096 字节
I/O 大小(最小/最佳)：4096 字节 / 4096 字节
磁盘标签类型：gpt
磁盘标识符：29D4D5E4-55FE-4C89-950A-039052B8315E

设备            起点      末尾      扇区   大小 类型
/dev/sda1       2048      4095      2048     1M BIOS 启动
/dev/sda2       4096   1054719   1050624   513M EFI 系统
/dev/sda3    1054720 419428351 418373632 199.5G Linux LVM
/dev/sda4  419428352 629145566 209717215   100G Linux LVM

╭─[~]─[root@u22-test]─[0]─[377]
╰─[:)] # pvs
  PV         VG       Fmt  Attr PSize   PFree
  /dev/sda3  vgubuntu lvm2 a--  199.49g 4.00m
╭─[~]─[root@u22-test]─[0]─[378]
╰─[:)] # pvcreate /dev/sda4
  Physical volume "/dev/sda4" successfully created.
╭─[~]─[root@u22-test]─[0]─[379]
╰─[:)] # pvs
  PV         VG       Fmt  Attr PSize   PFree
  /dev/sda3  vgubuntu lvm2 a--  199.49g   4.00m
  /dev/sda4           lvm2 ---  100.00g 100.00g
╭─[~]─[root@u22-test]─[127]─[381]
╰─[:(] # vgs
  VG       #PV #LV #SN Attr   VSize   VFree
  vgubuntu   1   2   0 wz--n- 199.49g 4.00m
╭─[~]─[root@u22-test]─[0]─[382]
╰─[:)] # vgextend vgubuntu /dev/sda4
  Volume group "vgubuntu" successfully extended
╭─[~]─[root@u22-test]─[0]─[383]
╰─[:)] # vgs
  VG       #PV #LV #SN Attr   VSize    VFree
  vgubuntu   2   2   0 wz--n- <299.49g 100.00g
─[~]─[root@u22-test]─[3]─[389]
╰─[:(] # lvextend -l +100%FREE /dev/mapper/vgubuntu-root
  Size of logical volume vgubuntu/root changed from <198.54 GiB (50825 extents) to <298.54 GiB (76425 extents).
  Logical volume vgubuntu/root successfully resized.
╭─[~]─[root@u22-test]─[0]─[400]
╰─[:)] # resize2fs /dev/mapper/vgubuntu-root
resize2fs 1.46.5 (30-Dec-2021)
/dev/mapper/vgubuntu-root 上的文件系统已被挂载于 /；需要进行在线调整大小
old_desc_blocks = 25, new_desc_blocks = 38
/dev/mapper/vgubuntu-root 上的文件系统大小已经调整为 78259200 个块（每块 4k）。
╭─[~]─[root@u22-test]─[0]─[401]
╰─[:)] # df -h /
文件系统                   大小  已用  可用 已用% 挂载点
/dev/mapper/vgubuntu-root  293G   24G  255G    9% /

```

### 2.3. fdisk 使用说明

```shell
╰─[:(] # fdisk /dev/sda

欢迎使用 fdisk (util-linux 2.37.2)。
更改将停留在内存中，直到您决定将更改写入磁盘。
使用写入命令前请三思。

This disk is currently in use - repartitioning is probably a bad idea.
It's recommended to umount all file systems, and swapoff all swap
partitions on this disk.


命令(输入 m 获取帮助)： m

帮助：

  GPT
   M   进入 保护/混合 MBR

  常规
   d   删除分区
   F   列出未分区的空闲区
   l   列出已知分区类型
   n   添加新分区
   p   打印分区表
   t   更改分区类型
   v   检查分区表
   i   打印某个分区的相关信息

  杂项
   m   打印此菜单
   x   更多功能(仅限专业人员)

  脚本
   I   从 sfdisk 脚本文件加载磁盘布局
   O   将磁盘布局转储为 sfdisk 脚本文件

  保存并退出
   w   将分区表写入磁盘并退出
   q   退出而不保存更改

  新建空磁盘标签
   g   新建一份 GPT 分区表
   G   新建一份空 GPT (IRIX) 分区表
   o   新建一份的空 DOS 分区表
   s   新建一份空 Sun 分区表
```
