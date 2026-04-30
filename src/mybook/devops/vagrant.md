# vagrant

- [1. 学习资源](#1-学习资源)
- [2. 安装](#2-安装)
- [3. help](#3-help)
- [4. 创建一个虚拟机](#4-创建一个虚拟机)
- [5. 常用操作](#5-常用操作)
- [6. Vagrantfile](#6-vagrantfile)

## 1. 学习资源

* `https://developer.hashicorp.com/vagrant/tutorials/getting-started?product_intent=vagrant`
* `https://zhuanlan.zhihu.com/p/259833884`

## 2. 安装

下载安装包，并安装。 `https://releases.hashicorp.com/vagrant/2.4.0/vagrant_2.4.0_windows_amd64.msi`

`https://releases.hashicorp.com/vagrant-vmware-utility/1.0.22/vagrant-vmware-utility_1.0.22_windows_amd64.msi`

配置环境变量 `VAGRANT_HOME`，默认为 `C:\Users\用户名\.vagrant.d`,该路径用来存储下载的虚拟机镜像

检查是否配置成功

```text
PS F:\> vagrant -v
Vagrant 2.4.0
```

安装vagrant-vmware-desktop插件

```powershell
vagrant plugin install vagrant-vmware-desktop
```

## 3. help

```powershell
PS F:\> vagrant -h
Usage: vagrant [options] <command> [<args>]

    -h, --help                       Print this help.

Common commands:
     autocomplete    manages autocomplete installation on host
     box             manages boxes: installation, removal, etc.
     cloud           manages everything related to Vagrant Cloud
     destroy         stops and deletes all traces of the vagrant machine
     global-status   outputs status Vagrant environments for this user
     halt            stops the vagrant machine
     help            shows the help for a subcommand
     init            initializes a new Vagrant environment by creating a Vagrantfile
     login
     package         packages a running vagrant environment into a box
     plugin          manages plugins: install, uninstall, update, etc.
     port            displays information about guest port mappings
     powershell      connects to machine via powershell remoting
     provision       provisions the vagrant machine
     push            deploys code in this environment to a configured destination
     rdp             connects to machine via RDP
     reload          restarts vagrant machine, loads new Vagrantfile configuration
     resume          resume a suspended vagrant machine
     serve           start Vagrant server
     snapshot        manages snapshots: saving, restoring, etc.
     ssh             connects to machine via SSH
     ssh-config      outputs OpenSSH valid configuration to connect to the machine
     status          outputs status of the vagrant machine
     suspend         suspends the machine
     up              starts and provisions the vagrant environment
     upload          upload to machine via communicator
     validate        validates the Vagrantfile
     version         prints current and latest Vagrant version
     winrm           executes commands on a machine via WinRM
     winrm-config    outputs WinRM configuration to connect to the machine

For help on any individual command run `vagrant COMMAND -h`

Additional subcommands are available, but are either more advanced
or not commonly used. To see all subcommands, run the command
`vagrant list-commands`.
        --[no-]color                 Enable or disable color output
        --machine-readable           Enable machine readable output
    -v, --version                    Display Vagrant version
        --debug                      Enable debug output
        --timestamp                  Enable timestamps on log output
        --debug-timestamp            Enable debug output with timestamps
        --no-tty                     Enable non-interactive output
```

## 4. 创建一个虚拟机

```powershell
mkdir ubuntu
cd ubuntu
vagarnt init generic/ubuntu2204
vagrant up 
```

## 5. 常用操作

```text
vagrant box list #查看本地box列表
vagrant box add xx.box
vagrant up 
vagrant status
vagrant ssh
vagrant reload
vagrant destroy
```

## 6. Vagrantfile

```text
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  config.vm.hostname = "devstack"
  config.vm.box = "generic/ubuntu2204"

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # NOTE: This will enable public access to the opened port
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine and only allow access
  # via 127.0.0.1 to disable public access
  # config.vm.network "forwarded_port", guest: 80, host: 8080, host_ip: "127.0.0.1"

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  config.vm.synced_folder "./data", "/vagrant_data"

  # Disable the default share of the current code directory. Doing this
  # provides improved isolation between the vagrant box and your host
  # by making sure your Vagrantfile isn't accessable to the vagrant box.
  # If you use this you may want to enable additional shared subfolders as
  # shown above.
  # config.vm.synced_folder ".", "/vagrant", disabled: true

  config.vm.provider "vmware_desktop" do |vb|
    # Display the VirtualBox GUI when booting the machine
    vb.gui = true
    vb.cpus = 14
    # Customize the amount of memory on the VM:
    vb.memory = "14096"
  end
  config.vm.provision "shell", inline: <<-SHELL
    sudo apt-get update && apt-get upgrade && apt-get clean 
    sudo dpkg-reconfigure locales --default-priority zh_CN.UTF-8
  SHELL
end

```
