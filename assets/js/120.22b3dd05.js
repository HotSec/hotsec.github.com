(window.webpackJsonp=window.webpackJsonp||[]).push([[120],{529:function(s,t,n){"use strict";n.r(t);var a=n(56),e=Object(a.a)({},(function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[n("h1",{attrs:{id:"_1-hyper-v-虚拟机-lvm-扩容"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_1-hyper-v-虚拟机-lvm-扩容"}},[s._v("#")]),s._v(" 1. hyper-v 虚拟机 lvm 扩容")]),s._v(" "),n("ul",[n("li",[n("a",{attrs:{href:"#1-hyper-v-%E8%99%9A%E6%8B%9F%E6%9C%BA-lvm-%E6%89%A9%E5%AE%B9"}},[s._v("1. hyper-v 虚拟机 lvm 扩容")]),s._v(" "),n("ul",[n("li",[n("a",{attrs:{href:"#11-%E6%B5%81%E7%A8%8B"}},[s._v("1.1. 流程")])]),s._v(" "),n("li",[n("a",{attrs:{href:"#12-%E5%91%BD%E4%BB%A4%E8%AE%B0%E5%BD%95"}},[s._v("1.2. 命令记录")])]),s._v(" "),n("li",[n("a",{attrs:{href:"#13-fdisk-%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E"}},[s._v("1.3. fdisk 使用说明")])])])])]),s._v(" "),n("h2",{attrs:{id:"_1-1-流程"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-流程"}},[s._v("#")]),s._v(" 1.1. 流程")]),s._v(" "),n("ol",[n("li",[s._v("hyper-v 虚拟机对应的设置界面将磁盘扩容或者添加一块新的磁盘")]),s._v(" "),n("li",[s._v("将磁盘分区，分区格式选择 lvm fdisk /dev/sda")]),s._v(" "),n("li",[s._v("pvcreate /dev/sda4 创建一个新的物理卷")]),s._v(" "),n("li",[s._v("vgextend vgubuntu /dev/sda4 将新的物理卷添加到卷组中")]),s._v(" "),n("li",[s._v("lvextend -l +100%FREE /dev/mapper/vgubuntu-root 将卷组的空闲空间全部扩展逻辑卷\n"),n("ol",[n("li",[s._v("lvextend -L +100GB /dev/mapper/vgubuntu-root /dev/sda")]),s._v(" "),n("li",[s._v("将 pv(/dev/sda4)中的 100g 空间添加到逻辑卷(/dev/mapper/vgubuntu-root)中")]),s._v(" "),n("li",[s._v("lvextend  /dev/mapper/vgubuntu-root /dev/sdb1 #将sdb1的空闲空间全部添加到逻辑卷中")])])]),s._v(" "),n("li",[s._v("resize2fs /dev/mapper/vgubuntu-root 重新加载逻辑卷，使 LV 扩容生效\n"),n("ol",[n("li",[s._v("或者是xfs_growfs /dev/mapper/fedora-root 看分区的格式")])])]),s._v(" "),n("li",[s._v("df -h 查看扩容是否生效")])]),s._v(" "),n("h2",{attrs:{id:"_1-2-命令记录"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-命令记录"}},[s._v("#")]),s._v(" 1.2. 命令记录")]),s._v(" "),n("div",{staticClass:"language-shell line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-shell"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[s._v("fdisk")]),s._v(" /dev/sda\n命令"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("输入 m 获取帮助"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("： p\nDisk /dev/sda：300 GiB，322122547200 字节，629145600 个扇区\nDisk model: Virtual Disk\n单元：扇区 / "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),s._v(" * "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("512")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("512")]),s._v(" 字节\n扇区大小"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("逻辑/物理"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("：512 字节 / "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("4096")]),s._v(" 字节\nI/O 大小"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("最小/最佳"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("：4096 字节 / "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("4096")]),s._v(" 字节\n磁盘标签类型：gpt\n磁盘标识符：29D4D5E4-55FE-4C89-950A-039052B8315E\n\n设备            起点      末尾      扇区   大小 类型\n/dev/sda1       "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("2048")]),s._v("      "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("4095")]),s._v("      "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("2048")]),s._v("     1M BIOS 启动\n/dev/sda2       "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("4096")]),s._v("   "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("1054719")]),s._v("   "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("1050624")]),s._v("   513M EFI 系统\n/dev/sda3    "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("1054720")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("419428351")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("418373632")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("199")]),s._v(".5G Linux LVM\n/dev/sda4  "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("419428352")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("629145566")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("209717215")]),s._v("   100G Linux LVM\n\n╭─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("~"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@u22-test"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("377")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n╰─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v(":"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# pvs")]),s._v("\n  PV         VG       Fmt  Attr PSize   PFree\n  /dev/sda3  vgubuntu lvm2 a--  "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("199")]),s._v(".49g "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("4")]),s._v(".00m\n╭─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("~"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@u22-test"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("378")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n╰─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v(":"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# pvcreate /dev/sda4")]),s._v("\n  Physical volume "),n("span",{pre:!0,attrs:{class:"token string"}},[s._v('"/dev/sda4"')]),s._v(" successfully created.\n╭─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("~"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@u22-test"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("379")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n╰─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v(":"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# pvs")]),s._v("\n  PV         VG       Fmt  Attr PSize   PFree\n  /dev/sda3  vgubuntu lvm2 a--  "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("199")]),s._v(".49g   "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("4")]),s._v(".00m\n  /dev/sda4           lvm2 ---  "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("100")]),s._v(".00g "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("100")]),s._v(".00g\n╭─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("~"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@u22-test"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("127")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("381")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n╰─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v(":"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# vgs")]),s._v("\n  VG       "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#PV #LV #SN Attr   VSize   VFree")]),s._v("\n  vgubuntu   "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),s._v("   "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("   "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" wz--n- "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("199")]),s._v(".49g "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("4")]),s._v(".00m\n╭─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("~"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@u22-test"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("382")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n╰─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v(":"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# vgextend vgubuntu /dev/sda4")]),s._v("\n  Volume group "),n("span",{pre:!0,attrs:{class:"token string"}},[s._v('"vgubuntu"')]),s._v(" successfully extended\n╭─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("~"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@u22-test"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("383")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n╰─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v(":"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# vgs")]),s._v("\n  VG       "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#PV #LV #SN Attr   VSize    VFree")]),s._v("\n  vgubuntu   "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("   "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("   "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" wz--n- "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("299")]),s._v(".49g "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("100")]),s._v(".00g\n─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("~"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@u22-test"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("3")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("389")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n╰─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v(":"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# lvextend -l +100%FREE /dev/mapper/vgubuntu-root")]),s._v("\n  Size of logical volume vgubuntu/root changed from "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("198.54")]),s._v(" GiB "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("50825")]),s._v(" extents"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" to "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("298.54")]),s._v(" GiB "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("76425")]),s._v(" extents"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(".\n  Logical volume vgubuntu/root successfully resized.\n╭─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("~"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@u22-test"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("400")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n╰─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v(":"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# resize2fs /dev/mapper/vgubuntu-root")]),s._v("\nresize2fs "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("1.46")]),s._v(".5 "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("30")]),s._v("-Dec-2021"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n/dev/mapper/vgubuntu-root 上的文件系统已被挂载于 /；需要进行在线调整大小\nold_desc_blocks "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("25")]),s._v(", new_desc_blocks "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("38")]),s._v("\n/dev/mapper/vgubuntu-root 上的文件系统大小已经调整为 "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("78259200")]),s._v(" 个块（每块 4k）。\n╭─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("~"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@u22-test"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("401")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n╰─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v(":"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# df -h /")]),s._v("\n文件系统                   大小  已用  可用 已用% 挂载点\n/dev/mapper/vgubuntu-root  293G   24G  255G    "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("9")]),s._v("% /\n\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br"),n("span",{staticClass:"line-number"},[s._v("8")]),n("br"),n("span",{staticClass:"line-number"},[s._v("9")]),n("br"),n("span",{staticClass:"line-number"},[s._v("10")]),n("br"),n("span",{staticClass:"line-number"},[s._v("11")]),n("br"),n("span",{staticClass:"line-number"},[s._v("12")]),n("br"),n("span",{staticClass:"line-number"},[s._v("13")]),n("br"),n("span",{staticClass:"line-number"},[s._v("14")]),n("br"),n("span",{staticClass:"line-number"},[s._v("15")]),n("br"),n("span",{staticClass:"line-number"},[s._v("16")]),n("br"),n("span",{staticClass:"line-number"},[s._v("17")]),n("br"),n("span",{staticClass:"line-number"},[s._v("18")]),n("br"),n("span",{staticClass:"line-number"},[s._v("19")]),n("br"),n("span",{staticClass:"line-number"},[s._v("20")]),n("br"),n("span",{staticClass:"line-number"},[s._v("21")]),n("br"),n("span",{staticClass:"line-number"},[s._v("22")]),n("br"),n("span",{staticClass:"line-number"},[s._v("23")]),n("br"),n("span",{staticClass:"line-number"},[s._v("24")]),n("br"),n("span",{staticClass:"line-number"},[s._v("25")]),n("br"),n("span",{staticClass:"line-number"},[s._v("26")]),n("br"),n("span",{staticClass:"line-number"},[s._v("27")]),n("br"),n("span",{staticClass:"line-number"},[s._v("28")]),n("br"),n("span",{staticClass:"line-number"},[s._v("29")]),n("br"),n("span",{staticClass:"line-number"},[s._v("30")]),n("br"),n("span",{staticClass:"line-number"},[s._v("31")]),n("br"),n("span",{staticClass:"line-number"},[s._v("32")]),n("br"),n("span",{staticClass:"line-number"},[s._v("33")]),n("br"),n("span",{staticClass:"line-number"},[s._v("34")]),n("br"),n("span",{staticClass:"line-number"},[s._v("35")]),n("br"),n("span",{staticClass:"line-number"},[s._v("36")]),n("br"),n("span",{staticClass:"line-number"},[s._v("37")]),n("br"),n("span",{staticClass:"line-number"},[s._v("38")]),n("br"),n("span",{staticClass:"line-number"},[s._v("39")]),n("br"),n("span",{staticClass:"line-number"},[s._v("40")]),n("br"),n("span",{staticClass:"line-number"},[s._v("41")]),n("br"),n("span",{staticClass:"line-number"},[s._v("42")]),n("br"),n("span",{staticClass:"line-number"},[s._v("43")]),n("br"),n("span",{staticClass:"line-number"},[s._v("44")]),n("br"),n("span",{staticClass:"line-number"},[s._v("45")]),n("br"),n("span",{staticClass:"line-number"},[s._v("46")]),n("br"),n("span",{staticClass:"line-number"},[s._v("47")]),n("br"),n("span",{staticClass:"line-number"},[s._v("48")]),n("br"),n("span",{staticClass:"line-number"},[s._v("49")]),n("br"),n("span",{staticClass:"line-number"},[s._v("50")]),n("br"),n("span",{staticClass:"line-number"},[s._v("51")]),n("br"),n("span",{staticClass:"line-number"},[s._v("52")]),n("br"),n("span",{staticClass:"line-number"},[s._v("53")]),n("br"),n("span",{staticClass:"line-number"},[s._v("54")]),n("br")])]),n("h2",{attrs:{id:"_1-3-fdisk-使用说明"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_1-3-fdisk-使用说明"}},[s._v("#")]),s._v(" 1.3. fdisk 使用说明")]),s._v(" "),n("div",{staticClass:"language-shell line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-shell"}},[n("code",[s._v("╰─"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v(":"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# fdisk /dev/sda")]),s._v("\n\n欢迎使用 "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("fdisk")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("util-linux "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("2.37")]),s._v(".2"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("。\n更改将停留在内存中，直到您决定将更改写入磁盘。\n使用写入命令前请三思。\n\nThis disk is currently "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("in")]),s._v(" use - repartitioning is probably a bad idea.\nIt's recommended to "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("umount")]),s._v(" all "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("file")]),s._v(" systems, and swapoff all swap\npartitions on this disk.\n\n\n命令"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("输入 m 获取帮助"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("： m\n\n帮助：\n\n  GPT\n   M   进入 保护/混合 MBR\n\n  常规\n   d   删除分区\n   F   列出未分区的空闲区\n   l   列出已知分区类型\n   n   添加新分区\n   p   打印分区表\n   t   更改分区类型\n   "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("v")]),s._v("   检查分区表\n   i   打印某个分区的相关信息\n\n  杂项\n   m   打印此菜单\n   x   更多功能"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("仅限专业人员"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n\n  脚本\n   I   从 sfdisk 脚本文件加载磁盘布局\n   O   将磁盘布局转储为 sfdisk 脚本文件\n\n  保存并退出\n   w   将分区表写入磁盘并退出\n   q   退出而不保存更改\n\n  新建空磁盘标签\n   g   新建一份 GPT 分区表\n   G   新建一份空 GPT "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("IRIX"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" 分区表\n   o   新建一份的空 DOS 分区表\n   s   新建一份空 Sun 分区表\n\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br"),n("span",{staticClass:"line-number"},[s._v("8")]),n("br"),n("span",{staticClass:"line-number"},[s._v("9")]),n("br"),n("span",{staticClass:"line-number"},[s._v("10")]),n("br"),n("span",{staticClass:"line-number"},[s._v("11")]),n("br"),n("span",{staticClass:"line-number"},[s._v("12")]),n("br"),n("span",{staticClass:"line-number"},[s._v("13")]),n("br"),n("span",{staticClass:"line-number"},[s._v("14")]),n("br"),n("span",{staticClass:"line-number"},[s._v("15")]),n("br"),n("span",{staticClass:"line-number"},[s._v("16")]),n("br"),n("span",{staticClass:"line-number"},[s._v("17")]),n("br"),n("span",{staticClass:"line-number"},[s._v("18")]),n("br"),n("span",{staticClass:"line-number"},[s._v("19")]),n("br"),n("span",{staticClass:"line-number"},[s._v("20")]),n("br"),n("span",{staticClass:"line-number"},[s._v("21")]),n("br"),n("span",{staticClass:"line-number"},[s._v("22")]),n("br"),n("span",{staticClass:"line-number"},[s._v("23")]),n("br"),n("span",{staticClass:"line-number"},[s._v("24")]),n("br"),n("span",{staticClass:"line-number"},[s._v("25")]),n("br"),n("span",{staticClass:"line-number"},[s._v("26")]),n("br"),n("span",{staticClass:"line-number"},[s._v("27")]),n("br"),n("span",{staticClass:"line-number"},[s._v("28")]),n("br"),n("span",{staticClass:"line-number"},[s._v("29")]),n("br"),n("span",{staticClass:"line-number"},[s._v("30")]),n("br"),n("span",{staticClass:"line-number"},[s._v("31")]),n("br"),n("span",{staticClass:"line-number"},[s._v("32")]),n("br"),n("span",{staticClass:"line-number"},[s._v("33")]),n("br"),n("span",{staticClass:"line-number"},[s._v("34")]),n("br"),n("span",{staticClass:"line-number"},[s._v("35")]),n("br"),n("span",{staticClass:"line-number"},[s._v("36")]),n("br"),n("span",{staticClass:"line-number"},[s._v("37")]),n("br"),n("span",{staticClass:"line-number"},[s._v("38")]),n("br"),n("span",{staticClass:"line-number"},[s._v("39")]),n("br"),n("span",{staticClass:"line-number"},[s._v("40")]),n("br"),n("span",{staticClass:"line-number"},[s._v("41")]),n("br"),n("span",{staticClass:"line-number"},[s._v("42")]),n("br"),n("span",{staticClass:"line-number"},[s._v("43")]),n("br"),n("span",{staticClass:"line-number"},[s._v("44")]),n("br"),n("span",{staticClass:"line-number"},[s._v("45")]),n("br"),n("span",{staticClass:"line-number"},[s._v("46")]),n("br")])])])}),[],!1,null,null,null);t.default=e.exports}}]);