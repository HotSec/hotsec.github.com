# dpkg-deb -b 构建 deb 包

1.首先生成项目目录 `# mkdir -p one_demo/opt`

2.进入目录中 `# cd one_demo/opt`

3.生成编辑文件-简单做个 python 例子

```bash
# touch one_demo.py
# vim one_demo.py
以下是文件内容
------
#！/usr/bin/python
print "one_demo"
------
保存后退出
```

4.加执行权限 `# chmod +x one_demo.py`

5.回到 one_demo 主目录下，生成 DEBIAN 目录 `# mkdir DEBIAN`

6.编写 control 信息

```bash
# cd DEBIAN
# touch control
# vim control

以下是control内容
------
Package: one-demo  #  软件包的名字含有不是小写字母或 -+ 的字符
Version: 1.0
Section: BioInfoServ
Priority: optional
Depends:
# 此处是相关的依赖包，多个用逗号隔开，如有确切版本，则可以 python-django (= 1.11.5)
Suggests:
Architecture: amd64
Installed-Size: 4096
Maintainer: gatieme
Provides: bioinfoserv-arb
Description: A test for using dpkg cmd
------
```

7.回到 one_demo 目录

```bash
~/one_demo tree
.
├── DEBIAN
│   └── control
└── opt
    └── one_demo.py

2 directories, 2 files

```

8.接下来执行做包命令

```bash
# 回到one_demo目录上层，
# cd ..
# ls   # one_demo目录
# dpkg-deb命令 -b表示构建deb包 源文件包 构建后的deb包
~ dpkg-deb -b one-demo one-demo-1.0-linux-amd64.deb
dpkg-deb: 正在 'one-demo-1.0-linux-amd64.deb' 中构建软件包 'one-demo'。
~ ls |grep one-demo
one-demo
one-demo-1.0-linux-amd64.deb
```

9 提取对应 deb 包的 DEBIAN 目录到当前目录，内部含 control,confile,postinst 等等信息 `dpkg-deb -e one-demo-1.0-linux-amd64.deb`
