# Docker Swarm

- [1. Docker Swarm 介绍](#1-docker-swarm-介绍)
- [2. Node](#2-node)
  - [2.1. Service](#21-service)
  - [2.2. Task](#22-task)
  - [2.3. 工作流程](#23-工作流程)
- [3. Dcoker Swarm 集群部署](#3-dcoker-swarm-集群部署)
  - [3.1. 安装基础环境](#31-安装基础环境)
  - [3.2. 配置加速器](#32-配置加速器)
  - [3.3. 创建Swarm并添加节点](#33-创建swarm并添加节点)
  - [3.4. 查看集群的相关信息](#34-查看集群的相关信息)
  - [3.5. 节点上下线](#35-节点上下线)
- [4. 在Swarm中部署服务](#4-在swarm中部署服务)
  - [4.1. 调整副本数](#41-调整副本数)
  - [4.2. 模拟节点宕机](#42-模拟节点宕机)
  - [4.3. 缩小已加的副本](#43-缩小已加的副本)
  - [4.4. 更新参数镜像信息](#44-更新参数镜像信息)
  - [4.5. 删除服务](#45-删除服务)
  - [4.6. 存储卷的挂载](#46-存储卷的挂载)
  - [4.7. 创建服务使用存储卷挂载](#47-创建服务使用存储卷挂载)
  - [4.8. 测试是否成功挂载](#48-测试是否成功挂载)
- [5. 创建官方的可视化面板](#5-创建官方的可视化面板)
- [6. Docker Swarm 容器网络](#6-docker-swarm-容器网络)
  - [6.1. 查看网络详细信息](#61-查看网络详细信息)
  - [6.2. 创建测试容器](#62-创建测试容器)
  - [6.3. 进行网络测试](#63-进行网络测试)
- [7. 参考](#7-参考)

## 1. Docker Swarm 介绍

Docker Swarm 是 Docker 的原生集群管理工具。它的主要作用是将多个 Docker 主机集成到一个虚拟的 Docker 主机中，为 Docker 容器提供集群和调度功能。通过 Docker Swarm，您可以轻松地管理多个 Docker 主机，并能在这些主机上调度容器的部署。下面是 Docker Swarm 的一些核心功能和特点：

- **集群管理** ：Docker Swarm 允许您将多个 Docker 主机作为一个单一的虚拟主机来管理。这意味着您可以在多个不同的服务器上运行 Docker 容器，而这些服务器被统一管理。
- **容错和高可用性** ：Swarm 提供高可用性服务，即使集群中的一部分节点失败，服务仍然可以继续运行。
- **负载均衡** ：Swarm 自动分配容器到集群中的不同节点，从而实现负载均衡。它还可以根据需要自动扩展或缩减服务实例的数量。
- **声明式服务模型** ：Swarm 使用 Docker Compose 文件格式，使您可以以声明式方式定义应用的多个服务。
- **服务发现** ：Swarm 集群中的每个服务都可以通过服务名自动进行服务发现，这简化了不同服务之间的通信。
- **安全性** ：Swarm 集群内的通信是加密的，提供了安全的节点间通信机制。
- **易用性** ：作为 Docker 的一部分，Swarm 的使用和 Docker 非常类似，对于熟悉 Docker 的用户来说非常容易上手。

总体来说，Docker Swarm 是一种轻量级且易于使用的容器编排工具，适合那些希望利用 Docker 的强大功能，同时需要简单集群管理和服务编排功能的场景。虽然它不像 Kubernetes 那样功能强大和复杂，但对于中小型项目或者对 Kubernetes 的复杂性有所顾虑的用户来说，它是一个很好的选择。

## 2. Node

Swarm 集群由 Manager 节点（管理者角色，管理成员和委托任务）和 Worker 节点（工作者角色，运行 Swarm 服务）组成。一个节点就是 Swarm 集群中的一个实例，也就是一个 Docker 主机。你可以运行一个或多个节点在单台物理机或云服务器上，但是生产环境上，典型的部署方式是：Docker 节点交叉分布式部署在多台物理机或云主机上。节点名称默认为机器的 hostname。

- **Manager** ：负责整个集群的管理工作包括集群配置、服务管理、容器编排等所有跟集群有关的工作，它会选举出一个 leader 来指挥编排任务；
- **Worker** ：工作节点接收和执行从管理节点分派的任务（Tasks）运行在相应的服务（Services）上。

### 2.1. Service

服务（Service）是一个抽象的概念，是对要在管理节点或工作节点上执行的任务的定义。它是集群系统的中心结构，是用户与集群交互的主要根源。

### 2.2. Task

任务（Task）包括一个 Docker 容器和在容器中运行的命令。任务是一个集群的最小单元，任务与容器是一对一的关系。管理节点根据服务规模中设置的副本数量将任务分配给工作节点。一旦任务被分配到一个节点，便无法移动到另一个节点。它只能在分配的节点上运行或失败。

### 2.3. 工作流程

Swarm Manager：

1. API：接受命令并创建 service 对象（创建对象） $\Downarrow$
2. orchestrator：为 service 对象创建的 task 进行编排工作（服务编排） $\Downarrow$
3. allocater：为各个 task 分配 IP 地址（分配 IP） $\Downarrow$
4. dispatcher：将 task 分发到 nodes（分发任务） $\Downarrow$
5. scheduler：安排一个 worker 节点运行 task（运行任务） $\Downarrow$

Worker Node：

1. worker：连接到调度器，检查分配的 task（检查任务） $\Uparrow$
2. executor：执行分配给 worker 节点的 task（执行任务）

## 3. Dcoker Swarm 集群部署

机器环境
IP：192.168.1.51 主机名： Manager 担任角色： Manager

IP：192.168.1.52 主机名： Node1 担任角色： Node

IP：192.168.1.53 主机名： Node2 担任角色： Node

### 3.1. 安装基础环境

```
# 修改主机名

[root@localhost ~]# hostnamectl set-hostname Manager
[root@localhost ~]# hostnamectl set-hostname Node1
[root@localhost ~]# hostnamectl set-hostname Node2
 
 
# 设置防火墙
# 关闭三台机器上的防火墙。如果开启防火墙，则需要在所有节点的防火墙上依次放行2377/tcp（管理端口）、7946/udp（节点间通信端口）、4789/udp（overlay 网络端口）端口。

[root@localhost ~]# systemctl disable firewalld.service
[root@localhost ~]# systemctl stop firewalld.service
 
# 安装docker
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun

# 启动docker
systemctl enable docker
systemctl start docker
```

### 3.2. 配置加速器

```bash
[root@chenby ~]# cat > /etc/docker/daemon.json <<EOF
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "insecure-registries": ["z.oiox.cn:18082"],
  "registry-mirrors": [
    "https://xxxxx.mirror.aliyuncs.com"
  ],
  "max-concurrent-downloads": 10,
  "log-driver": "json-file",
  "log-level": "warn",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
    },
  "data-root": "/var/lib/docker"
}
EOF

# 重新启动docker
[root@chenby ~]# systemctl restart docker && systemctl status docker -l
```

### 3.3. 创建Swarm并添加节点

```bash
# 创建Swarm集群

[root@Manager ~]# docker swarm init --advertise-addr 192.168.1.51
Swarm initialized: current node (nuy82gjzc2c0wip9agbava3z9) is now a manager.

To add a worker to this swarm, run the following command:

    docker swarm join --token SWMTKN-1-0mbfykukl6fwl1mziipzqbakqmoo4iz1ti135uuyoj7zfgxgy2-4qbs0bm04iz0l52nm3bljvuoy 192.168.1.51:2377

To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.

[root@Manager ~]#

# 其余的Node节点执行加入操作
[root@Node1 ~]# docker swarm join --token SWMTKN-1-0mbfykukl6fwl1mziipzqbakqmoo4iz1ti135uuyoj7zfgxgy2-4qbs0bm04iz0l52nm3bljvuoy 192.168.1.51:2377
This node joined a swarm as a worker.
[root@Node1 ~]# 

[root@Node2 ~]# docker swarm join --token SWMTKN-1-0mbfykukl6fwl1mziipzqbakqmoo4iz1ti135uuyoj7zfgxgy2-4qbs0bm04iz0l52nm3bljvuoy 192.168.1.51:2377
This node joined a swarm as a worker.
[root@Node2 ~]#
```

### 3.4. 查看集群的相关信息

```bash
[root@Manager ~]# docker info
Client: Docker Engine - Community
 Version:    27.3.1
 Context:    default
 Debug Mode: false
 Plugins:
  buildx: Docker Buildx (Docker Inc.)
    Version:  v0.17.1
    Path:     /usr/libexec/docker/cli-plugins/docker-buildx
  compose: Docker Compose (Docker Inc.)
    Version:  v2.29.7
    Path:     /usr/libexec/docker/cli-plugins/docker-compose

Server:
 Containers: 0
  Running: 0
  Paused: 0
  Stopped: 0
 Images: 0
 Server Version: 27.3.1
 Storage Driver: overlay2
  Backing Filesystem: xfs
  Supports d_type: true
  Using metacopy: false
  Native Overlay Diff: true
  userxattr: false
 Logging Driver: json-file
 Cgroup Driver: systemd
 Cgroup Version: 2
 Plugins:
  Volume: local
  Network: bridge host ipvlan macvlan null overlay
  Log: awslogs fluentd gcplogs gelf journald json-file local splunk syslog
 Swarm: active
  NodeID: nuy82gjzc2c0wip9agbava3z9
  Is Manager: true
  ClusterID: hiki507c9yp8p4lrb8icp0rcs
  Managers: 1
  Nodes: 3
  Data Path Port: 4789
  Orchestration:
   Task History Retention Limit: 5
  Raft:
   Snapshot Interval: 10000
   Number of Old Snapshots to Retain: 0
   Heartbeat Tick: 1
   Election Tick: 10
  Dispatcher:
   Heartbeat Period: 5 seconds
  CA Configuration:
   Expiry Duration: 3 months
   Force Rotate: 0
  Autolock Managers: false
  Root Rotation In Progress: false
  Node Address: 192.168.1.51
  Manager Addresses:
   192.168.1.51:2377
 Runtimes: io.containerd.runc.v2 runc
 Default Runtime: runc
 Init Binary: docker-init
 containerd version: 57f17b0a6295a39009d861b89e3b3b87b005ca27
 runc version: v1.1.14-0-g2c9f560
 init version: de40ad0
 Security Options:
  seccomp
   Profile: builtin
  cgroupns
 Kernel Version: 5.14.0-503.el9.x86_64
 Operating System: CentOS Stream 9
 OSType: linux
 Architecture: x86_64
 CPUs: 1
 Total Memory: 1.921GiB
 Name: Manager
 ID: fb7ffc06-ccc6-4faf-bf8a-4e05f13c14d6
 Docker Root Dir: /var/lib/docker
 Debug Mode: false
 Experimental: false
 Insecure Registries:
  127.0.0.0/8
 Live Restore Enabled: false

WARNING: bridge-nf-call-iptables is disabled
WARNING: bridge-nf-call-ip6tables is disabled
[root@Manager ~]# 
[root@Manager ~]# 
[root@Manager ~]# 
[root@Manager ~]# docker node ls
ID                            HOSTNAME   STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
nuy82gjzc2c0wip9agbava3z9 *   Manager    Ready     Active         Leader           27.3.1
6vdnp73unqh3qe096vv3iitwm     Node1      Ready     Active                          27.3.1
9txw7h8w3wfkjj85rulu7jnen     Node2      Ready     Active                          27.3.1
[root@Manager ~]# 
[root@Manager ~]#
```

### 3.5. 节点上下线

更改节点的availablity状态

swarm集群中node的availability状态可以为 active或者drain

**active**状态下，node可以接受来自manager节点的任务分派

**drain**状态下，node节点会结束task，且不再接受来自manager节点的任务分派（也就是下线节点）

```bash
# 设置节点为Drain

[root@Manager ~]# docker node update --availability drain Node1
Node1
[root@Manager ~]# 
[root@Manager ~]# docker node ls
ID                            HOSTNAME   STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
nuy82gjzc2c0wip9agbava3z9 *   Manager    Ready     Active         Leader           27.3.1
6vdnp73unqh3qe096vv3iitwm     Node1      Ready     Drain                           27.3.1
9txw7h8w3wfkjj85rulu7jnen     Node2      Ready     Active                          27.3.1
[root@Manager ~]# 
[root@Manager ~]# 


# 删除节点
[root@Manager ~]# docker node rm --force Node1
Node1
[root@Manager ~]# 
[root@Manager ~]# docker node ls
ID                            HOSTNAME   STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
nuy82gjzc2c0wip9agbava3z9 *   Manager    Ready     Active         Leader           27.3.1
9txw7h8w3wfkjj85rulu7jnen     Node2      Ready     Active                          27.3.1
[root@Manager ~]# 



# 重新加入节点
[root@Node1 ~]# docker swarm leave -f
Node left the swarm.
[root@Node1 ~]# 
[root@Node1 ~]# 
[root@Node1 ~]# docker swarm join --token SWMTKN-1-0mbfykukl6fwl1mziipzqbakqmoo4iz1ti135uuyoj7zfgxgy2-4qbs0bm04iz0l52nm3bljvuoy 192.168.1.51:2377
This node joined a swarm as a worker.
[root@Node1 ~]# 


# 查看现有状态
[root@Manager ~]# docker node ls
ID                            HOSTNAME   STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
nuy82gjzc2c0wip9agbava3z9 *   Manager    Ready     Active         Leader           27.3.1
uec5t9039ef02emg963fean4u     Node1      Ready     Active                          27.3.1
9txw7h8w3wfkjj85rulu7jnen     Node2      Ready     Active                          27.3.1
[root@Manager ~]#
```

## 4. 在Swarm中部署服务

```bash
# 创建网络
[root@Manager ~]# docker network create -d overlay nginx_net
resh5jevjdzfawrbc0tbxpns0
[root@Manager ~]# 
[root@Manager ~]# docker network ls | grep nginx_net
resh5jevjdzf   nginx_net         overlay   swarm
[root@Manager ~]# 
 
# 部署服务
[root@Manager ~]# docker service create --replicas 1 --network nginx_net --name my_nginx -p 80:80 nginx
ry7y3p039614jmvqytshxvnb3
overall progress: 1 out of 1 tasks 
1/1: running   [==================================================>] 
verify: Service ry7y3p039614jmvqytshxvnb3 converged 
[root@Manager ~]# 

# 使用 docker service ls 查看正在运行服务的列表
[root@Manager ~]# docker service ls
ID             NAME       MODE         REPLICAS   IMAGE          PORTS
ry7y3p039614   my_nginx   replicated   1/1        nginx:latest   *:80->80/tcp
[root@Manager ~]# 


# 查询Swarm中服务的信息
# -pretty 使命令输出格式化为可读的格式，不加 --pretty 可以输出更详细的信息：
[root@Manager ~]# docker service inspect --pretty my_nginx
ID:        ry7y3p039614jmvqytshxvnb3
Name:        my_nginx
Service Mode:    Replicated
 Replicas:    1
Placement:
UpdateConfig:
 Parallelism:    1
 On failure:    pause
 Monitoring Period: 5s
 Max failure ratio: 0
 Update order:      stop-first
RollbackConfig:
 Parallelism:    1
 On failure:    pause
 Monitoring Period: 5s
 Max failure ratio: 0
 Rollback order:    stop-first
ContainerSpec:
 Image:        nginx:latest@sha256:bc5eac5eafc581aeda3008b4b1f07ebba230de2f27d47767129a6a905c84f470
 Init:        false
Resources:
Networks: nginx_net 
Endpoint Mode:    vip
Ports:
 PublishedPort = 80
  Protocol = tcp
  TargetPort = 80
  PublishMode = ingress 

[root@Manager ~]# 
 
# 查看运行状态
[root@Manager ~]# docker service ps my_nginx
ID             NAME         IMAGE          NODE      DESIRED STATE   CURRENT STATE           ERROR     PORTS
x6rn5w1hv2ip   my_nginx.1   nginx:latest   Node2     Running         Running 2 minutes ago         
[root@Manager ~]# 

# 访问测试
[root@Manager ~]# curl -I 192.168.1.53
HTTP/1.1 200 OK
Server: nginx/1.27.2
Date: Tue, 19 Nov 2024 11:00:07 GMT
Content-Type: text/html
Content-Length: 615
Last-Modified: Wed, 02 Oct 2024 15:13:19 GMT
Connection: keep-alive
ETag: "66fd630f-267"
Accept-Ranges: bytes

[root@Manager ~]#
```

### 4.1. 调整副本数

```bash
# 增加副本数
[root@Manager ~]# docker service scale my_nginx=4
my_nginx scaled to 4
overall progress: 4 out of 4 tasks 
1/4: running   [==================================================>] 
2/4: running   [==================================================>] 
3/4: running   [==================================================>] 
4/4: running   [==================================================>] 
verify: Service my_nginx converged 
[root@Manager ~]#
 
# 查看是否正常运行
[root@Manager ~]#  docker service ps my_nginx
ID             NAME         IMAGE          NODE      DESIRED STATE   CURRENT STATE            ERROR     PORTS
x6rn5w1hv2ip   my_nginx.1   nginx:latest   Node2     Running         Running 12 minutes ago         
mi0wb3e0eixi   my_nginx.2   nginx:latest   Node1     Running         Running 8 minutes ago          
grm4mtucb2io   my_nginx.3   nginx:latest   Manager   Running         Running 8 minutes ago          
u8gdmihpkqty   my_nginx.4   nginx:latest   Node1     Running         Running 8 minutes ago          
[root@Manager ~]#
```

### 4.2. 模拟节点宕机

```bash
# 模拟宕机node节点
[root@Node2 ~]# systemctl stop docker
Warning: Stopping docker.service, but it can still be activated by:
  docker.socket
[root@Node2 ~]# 

# 查看节点是否正常
[root@Manager ~]# docker node ls
ID                            HOSTNAME   STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
nuy82gjzc2c0wip9agbava3z9 *   Manager    Ready     Active         Leader           27.3.1
uec5t9039ef02emg963fean4u     Node1      Ready     Active                          27.3.1
9txw7h8w3wfkjj85rulu7jnen     Node2      Down      Active                          27.3.1
[root@Manager ~]# 

# 查看容器是否正常
# 节点异常后，容器会在其他的节点上启动起来
[root@Manager ~]#  docker service ps my_nginx
ID             NAME             IMAGE          NODE      DESIRED STATE   CURRENT STATE            ERROR     PORTS
6yf6qs3rv6gx   my_nginx.1       nginx:latest   Manager   Running         Running 18 seconds ago         
x6rn5w1hv2ip    \_ my_nginx.1   nginx:latest   Node2     Shutdown        Running 14 minutes ago         
mi0wb3e0eixi   my_nginx.2       nginx:latest   Node1     Running         Running 9 minutes ago          
grm4mtucb2io   my_nginx.3       nginx:latest   Manager   Running         Running 9 minutes ago          
u8gdmihpkqty   my_nginx.4       nginx:latest   Node1     Running         Running 9 minutes ago          
[root@Manager ~]#
```

### 4.3. 缩小已加的副本

```bash
# Swarm 动态缩容服务(scale)
[root@Manager ~]# docker service scale my_nginx=1
my_nginx scaled to 1
overall progress: 1 out of 1 tasks 
1/1: running   [==================================================>] 
verify: Service my_nginx converged 
[root@Manager ~]# 
[root@Manager ~]# 
[root@Manager ~]# docker service ls
ID             NAME       MODE         REPLICAS   IMAGE          PORTS
ry7y3p039614   my_nginx   replicated   1/1        nginx:latest   *:80->80/tcp
[root@Manager ~]# 
[root@Manager ~]# 
[root@Manager ~]# docker service ps my_nginx
ID             NAME             IMAGE          NODE      DESIRED STATE   CURRENT STATE                 ERROR     PORTS
6yf6qs3rv6gx   my_nginx.1       nginx:latest   Manager   Running         Running 4 minutes ago               
x6rn5w1hv2ip    \_ my_nginx.1   nginx:latest   Node2     Shutdown        Shutdown about a minute ago         
[root@Manager ~]#
```

### 4.4. 更新参数镜像信息

```bash
# 可以使用 update 更新参数
[root@Manager ~]# docker ps -a
CONTAINER ID   IMAGE          COMMAND                   CREATED         STATUS         PORTS     NAMES
64e2f72522a2   nginx:latest   "/docker-entrypoint.…"   6 minutes ago   Up 6 minutes   80/tcp    my_nginx.1.6yf6qs3rv6gxbnrc032mhrwf1
[root@Manager ~]# docker service update --replicas 3 my_nginx
my_nginx
overall progress: 3 out of 3 tasks 
1/3: running   [==================================================>] 
2/3: running   [==================================================>] 
3/3: running   [==================================================>] 
verify: Service my_nginx converged 
[root@Manager ~]# 
[root@Manager ~]# docker service ls
ID             NAME       MODE         REPLICAS   IMAGE          PORTS
ry7y3p039614   my_nginx   replicated   3/3        nginx:latest   *:80->80/tcp
[root@Manager ~]# 
[root@Manager ~]#
[root@Manager ~]# docker service ps my_nginx
ID             NAME             IMAGE          NODE      DESIRED STATE   CURRENT STATE            ERROR     PORTS
6yf6qs3rv6gx   my_nginx.1       nginx:latest   Manager   Running         Running 7 minutes ago          
x6rn5w1hv2ip    \_ my_nginx.1   nginx:latest   Node2     Shutdown        Shutdown 4 minutes ago         
pkc7bzqkpppz   my_nginx.2       nginx:latest   Node2     Running         Running 22 seconds ago         
jfok9cwixbi6   my_nginx.3       nginx:latest   Node1     Running         Running 23 seconds ago         
[root@Manager ~]# 
 
# 通过update参数进行升级镜像
[root@Manager ~]# docker service update --image nginx:new my_nginx
[root@Manager ~]# docker service ls
ID                  NAME                MODE                REPLICAS            IMAGE               PORTS
zs7fw4ereo5w        my_nginx            replicated          3/3                 nginx:new           *:80->80/tcp
```

### 4.5. 删除服务

```bash
[root@Manager ~]# docker service rm my_nginx
my_nginx
[root@Manager ~]# 
[root@Manager ~]# docker service ps my_nginx
no such service: my_nginx
[root@Manager ~]#
```

### 4.6. 存储卷的挂载

```bash
# Swarm中使用Volume(挂在目录，mount命令)
# 创建一个volume
[root@Manager ~]# docker volume create --name testvolume
testvolume
[root@Manager ~]# 

# 查看创建的volume
[root@Manager ~]# docker volume ls
DRIVER    VOLUME NAME
local     testvolume
[root@Manager ~]# 

# 查看volume详情
[root@Manager ~]# docker volume inspect testvolume
[
    {
        "CreatedAt": "2024-11-19T19:23:42+08:00",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/testvolume/_data",
        "Name": "testvolume",
        "Options": null,
        "Scope": "local"
    }
]
[root@Manager ~]#
```

### 4.7. 创建服务使用存储卷挂载

```bash
# 创建新的服务并挂载testvolume
[root@Manager ~]# docker service create --replicas 3 --mount type=volume,src=testvolume,dst=/usr/share/nginx/html --network nginx_net --name test_nginx -p 80:80 nginx
4ol5e2jxvs446q4mr9brs3cfk
overall progress: 3 out of 3 tasks 
1/3: running   [==================================================>] 
2/3: running   [==================================================>] 
3/3: running   [==================================================>] 
verify: Service 4ol5e2jxvs446q4mr9brs3cfk converged 
[root@Manager ~]# 
[root@Manager ~]# 


# 查看创建服务
[root@Manager ~]# docker service ls
ID             NAME         MODE         REPLICAS   IMAGE          PORTS
4ol5e2jxvs44   test_nginx   replicated   3/3        nginx:latest   *:80->80/tcp
[root@Manager ~]# 
[root@Manager ~]# 
[root@Manager ~]# docker service ps test_nginx
ID             NAME           IMAGE          NODE      DESIRED STATE   CURRENT STATE            ERROR     PORTS
jvaokj73sv0q   test_nginx.1   nginx:latest   Node2     Running         Running 35 seconds ago         
28kwulxo957w   test_nginx.2   nginx:latest   Manager   Running         Running 35 seconds ago         
odx5ejqph369   test_nginx.3   nginx:latest   Node1     Running         Running 35 seconds ago         
[root@Manager ~]#
```

### 4.8. 测试是否成功挂载

```bash
# 查看有没有挂载成功
# 写入内容到网页内容中
[root@Manager ~]# echo "192.168.1.51" > /var/lib/docker/volumes/testvolume/_data/index.html
[root@Manager ~]# 
[root@Node1 ~]# echo "192.168.1.52" > /var/lib/docker/volumes/testvolume/_data/index.html
[root@Node1 ~]# 
[root@Node2 ~]# echo "192.168.1.53" > /var/lib/docker/volumes/testvolume/_data/index.html 
[root@Node2 ~]# 

# 测试是否生效
# 访问任意的节点IP即可，会轮询到这个节点上
[root@Manager ~]# curl 192.168.1.51
192.168.1.51
[root@Manager ~]# curl 192.168.1.51
192.168.1.53
[root@Manager ~]# curl 192.168.1.51
192.168.1.52
[root@Manager ~]#
```

## 5. 创建官方的可视化面板

```bash
# 安装一个官方的可视化面板
[root@Manager ~]# docker run -it -d -p 8080:8080 -v /var/run/docker.sock:/var/run/docker.sock dockersamples/visualizer
```

## 6. Docker Swarm 容器网络

swarm模式的覆盖网络包括以下功能：

- 可以附加多个服务到同一个网络。
- 可以给每个swarm服务分配一个虚拟IP地址(vip)和DNS名称
- 使得在同一个网络中容器之间可以使用服务名称为互相连接
- 可以配置使用DNS轮循而不使用VIP
- 为了可以使用swarm的覆盖网络，在启用swarm模式之间你需要在swarm节点之间开放以下端口：

  TCP/UDP端口7946 – 用于容器网络发现

  UDP端口4789 – 用于容器覆盖网络

```bash
# 创建网络
[root@Manager ~]# docker network create --driver overlay --opt encrypted --subnet 192.168.2.0/24 cby_net
j26skr271gjkzpbx91wu1okt9
[root@Manager ~]# 
   
参数解释：
–opt encrypted  默认情况下swarm中的节点通信是加密的。在不同节点的容器之间，可选的–opt encrypted参数能在它们的vxlan流量启用附加的加密层。
--subnet 命令行参数指定overlay网络使用的子网网段。当不指定一个子网时，swarm管理器自动选择一个子网并分配给网络。


[root@Manager ~]# 
[root@Manager ~]# docker network ls
NETWORK ID     NAME              DRIVER    SCOPE
239c159fade4   bridge            bridge    local
j26skr271gjk   cby_net           overlay   swarm
ee7340b82a36   docker_gwbridge   bridge    local
82ce5e09d333   host              host      local
dkhebie7aja7   ingress           overlay   swarm
resh5jevjdzf   nginx_net         overlay   swarm
60d6545d6b8e   none              null      local
[root@Manager ~]# 

   
# 创建的容器使用此网络
[root@Manager ~]# docker service create --replicas 5 --network cby_net --name my-cby -p 8088:80 nginx
58j0x31f072f12njv8oz2ibwf
overall progress: 5 out of 5 tasks 
1/5: running   [==================================================>] 
2/5: running   [==================================================>] 
3/5: running   [==================================================>] 
4/5: running   [==================================================>] 
5/5: running   [==================================================>] 
verify: Service 58j0x31f072f12njv8oz2ibwf converged 
[root@Manager ~]# 



[root@Manager ~]# docker service ls | grep my-cby
58j0x31f072f   my-cby       replicated   5/5        nginx:latest   *:8088->80/tcp
[root@Manager ~]# 

   
在manager-node节点上，通过下面的命令查看哪些节点有处于running状态的任务：
[root@Manager ~]# docker service ps my-cby
ID             NAME       IMAGE          NODE      DESIRED STATE   CURRENT STATE                ERROR     PORTS
hrppcl25yba0   my-cby.1   nginx:latest   Node2     Running         Running about a minute ago         
xw55qx98dgby   my-cby.2   nginx:latest   Manager   Running         Running about a minute ago         
izx4jb8aen5w   my-cby.3   nginx:latest   Node1     Running         Running about a minute ago         
tdkm03dxjzv2   my-cby.4   nginx:latest   Manager   Running         Running about a minute ago         
h6lcj91v01cm   my-cby.5   nginx:latest   Node1     Running         Running about a minute ago         
[root@Manager ~]#
```

### 6.1. 查看网络详细信息

```bash
可以查询某个节点上关于my-network的详细信息：
[root@Manager ~]# docker network inspect cby_net
[
    {
        "Name": "cby_net",
        "Id": "j26skr271gjkzpbx91wu1okt9",
        "Created": "2024-11-19T20:10:07.207940854+08:00",
        "Scope": "swarm",
        "Driver": "overlay",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "192.168.2.0/24",
                    "Gateway": "192.168.2.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "2f101603351b388e2820dd576b2ab9490863b65ae04e8cb4f6a3bf2d0df2a590": {
                "Name": "my-cby.4.tdkm03dxjzv20acx6shajxhjg",
                "EndpointID": "b2a5885c2efe87370eb34b4da2103f979a8fa95fe9bff71f037eee569f1ffb0b",
                "MacAddress": "02:42:c0:a8:02:06",
                "IPv4Address": "192.168.2.6/24",
                "IPv6Address": ""
            },
            "8cbd44885c579fa9bc267bcb3eea11b8edcd696b0c75180da5c9237330afcba6": {
                "Name": "my-cby.2.xw55qx98dgbyrdi6jxt9kguvc",
                "EndpointID": "e2f04749c1b55c25b75ec677fd95cc0bd1941a58c69a9b3eed8754d2cfb6de32",
                "MacAddress": "02:42:c0:a8:02:04",
                "IPv4Address": "192.168.2.4/24",
                "IPv6Address": ""
            },
            "lb-cby_net": {
                "Name": "cby_net-endpoint",
                "EndpointID": "f93daf78ca41922a4be4c4b3dde01bb7a919d9008304a4a31950f09281ae30f9",
                "MacAddress": "02:42:c0:a8:02:0a",
                "IPv4Address": "192.168.2.10/24",
                "IPv6Address": ""
            }
        },
        "Options": {
            "com.docker.network.driver.overlay.vxlanid_list": "4098",
            "encrypted": ""
        },
        "Labels": {},
        "Peers": [
            {
                "Name": "33a2908a261b",
                "IP": "192.168.1.53"
            },
            {
                "Name": "d7847005824e",
                "IP": "192.168.1.51"
            },
            {
                "Name": "7640904bfcc4",
                "IP": "192.168.1.52"
            }
        ]
    }
]
[root@Manager ~]# 
   


[root@Node1 ~]# docker network inspect cby_net
............................................
        "Containers": {
            "01f42aaeb9667b8d07683f5e2d60f643cc61aa9ceda0d0adb8bc642d1093bfc9": {
                "Name": "my-cby.3.izx4jb8aen5wbwkvy5b7tz1lz",
                "EndpointID": "46892992ac400bc1cfc40f62610ff3321ae079929170912d861556f8d1f4645f",
                "MacAddress": "02:42:c0:a8:02:05",
                "IPv4Address": "192.168.2.5/24",
                "IPv6Address": ""
            },
            "a214a33e86c95b3ea84aae6eee705b633ac5a31854425317d2a0d9693cee00ca": {
                "Name": "my-cby.5.h6lcj91v01cmhf03644nqarxq",
                "EndpointID": "a1ec3f28877fb82ba86c2b6312c592489bb59d354caa274a6b5d98aae3c4ee17",
                "MacAddress": "02:42:c0:a8:02:07",
                "IPv4Address": "192.168.2.7/24",
                "IPv6Address": ""
            },
            "lb-cby_net": {
                "Name": "cby_net-endpoint",
                "EndpointID": "05f1e89be3036367a729c1a50430bcd6181ed4bc7ec4e37bd025ba5591b6b3bf",
                "MacAddress": "02:42:c0:a8:02:09",
                "IPv4Address": "192.168.2.9/24",
                "IPv6Address": ""
            }
        },
............................................
  
[root@Node2 ~]# docker network inspect cby_net
............................................
        "Containers": {
            "6ac3a65fa5a2501a5ad6d4183895e4e6b13beaf6b8642c360e19e9bc0849f74c": {
                "Name": "my-cby.1.hrppcl25yba05o26q1my5abmc",
                "EndpointID": "a0e8246bc74b8e9b9f964b1efb51ad59d9b7dff219b7f10fc027970145503f34",
                "MacAddress": "02:42:c0:a8:02:03",
                "IPv4Address": "192.168.2.3/24",
                "IPv6Address": ""
            },
            "lb-cby_net": {
                "Name": "cby_net-endpoint",
                "EndpointID": "aa739df579790e8147877ce79220cf5387740f11a581344756502f9212314c24",
                "MacAddress": "02:42:c0:a8:02:08",
                "IPv4Address": "192.168.2.8/24",
                "IPv6Address": ""
            }
        },
.............................................
   
# 可以通过查询服务来获得服务的虚拟IP地址，如下：
[root@Manager ~]# docker service inspect --format='{{json .Endpoint.VirtualIPs}}' my-cby
[{"NetworkID":"dkhebie7aja768y8agz4xdpwt","Addr":"10.0.0.27/24"},{"NetworkID":"j26skr271gjkzpbx91wu1okt9","Addr":"192.168.2.2/24"}]
[root@Manager ~]# 
```

### 6.2. 创建测试容器

```bash
[root@Manager ~]# docker service create --name my-by_net  --network cby_net busybox ping www.baidu.com

u7eana0p9xp9auw9p02d8z1wx
overall progress: 1 out of 1 tasks 
1/1: running   [==================================================>] 
verify: Service u7eana0p9xp9auw9p02d8z1wx converged 
[root@Manager ~]# 
[root@Manager ~]# 
[root@Manager ~]# 
[root@Manager ~]# docker service ps my-by_net
ID             NAME          IMAGE            NODE      DESIRED STATE   CURRENT STATE            ERROR     PORTS
7l1fpecym4kc   my-by_net.1   busybox:latest   Node2     Running         Running 31 seconds ago         
[root@Manager ~]# 
```

### 6.3. 进行网络测试

```bash
# 测试其他的IP的是否在容器内正常
[root@Node2 ~]# docker exec -ti 1b1a6f6c5a7b /bin/sh
/ # 
/ # ping 192.168.2.8
PING 192.168.2.8 (192.168.2.8): 56 data bytes
64 bytes from 192.168.2.8: seq=0 ttl=64 time=0.095 ms
64 bytes from 192.168.2.8: seq=1 ttl=64 time=0.073 ms
64 bytes from 192.168.2.8: seq=2 ttl=64 time=0.101 ms
^C
--- 192.168.2.8 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max = 0.073/0.089/0.101 ms
/ # ping 192.168.2.7
PING 192.168.2.7 (192.168.2.7): 56 data bytes
64 bytes from 192.168.2.7: seq=0 ttl=64 time=0.434 ms
64 bytes from 192.168.2.7: seq=1 ttl=64 time=0.430 ms
64 bytes from 192.168.2.7: seq=2 ttl=64 time=0.401 ms
64 bytes from 192.168.2.7: seq=3 ttl=64 time=0.386 ms
^C
--- 192.168.2.7 ping statistics ---
4 packets transmitted, 4 packets received, 0% packet loss
round-trip min/avg/max = 0.386/0.412/0.434 ms
/ # ping 192.168.2.2
PING 192.168.2.2 (192.168.2.2): 56 data bytes
64 bytes from 192.168.2.2: seq=0 ttl=64 time=0.081 ms
64 bytes from 192.168.2.2: seq=1 ttl=64 time=0.075 ms
64 bytes from 192.168.2.2: seq=2 ttl=64 time=0.093 ms
64 bytes from 192.168.2.2: seq=3 ttl=64 time=0.073 ms
^C
--- 192.168.2.2 ping statistics ---
4 packets transmitted, 4 packets received, 0% packet loss
round-trip min/avg/max = 0.073/0.080/0.093 ms
/ # 


# 服务发现功能
# 查询service的虚拟IP地址
/ # nslookup my-cby
Server:        127.0.0.11
Address:    127.0.0.11:53

Non-authoritative answer:

Non-authoritative answer:
Name:    my-cby
Address: 192.168.2.2

/ #
  
  
# 查询所有的容器IP
/ # nslookup tasks.my-cby
Server:        127.0.0.11
Address:    127.0.0.11:53

Non-authoritative answer:

Non-authoritative answer:
Name:    tasks.my-cby
Address: 192.168.2.73
Name:    tasks.my-cby
Address: 192.168.2.74
Name:    tasks.my-cby
Address: 192.168.2.7
Name:    tasks.my-cby
Address: 192.168.2.5
Name:    tasks.my-cby
Address: 192.168.2.3

/ 
```

## 7. 参考

> `https://ken.io/note/docker-swarm-cluster-setup-and-manage`
> `https://blog.csdn.net/weixin_41923467/article/details/122128154`