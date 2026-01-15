# Kubernetes

## 介绍

Kubernetes 也称为 K8s，是用于自动部署、扩缩和管理容器化应用程序的开源系统。

尽管Kubernetes在Linux上运行，但它与平台无关，可以在裸机，虚拟机，云实例或OpenStack上运行。最新版本的Kubernetes已经支持在Windows上运行。

* 服务发现和负载均衡
* 存储编排
* 自动部署和回滚
* 自动完成装箱计算
* 自动修复
* 密钥与配置管理

## 组件

* 控制面
  * kube-apiserver
  * kube-scheduler
  * kube-controller-manager
  * etcd
  * Dashboard(可选)
* 数据面
  * kubelet：主要的节点代理。它监视API服务器以查找已分配给其节点的Pod。 Kubelet执行任务并维护向主节点报告pod状态的反向通道。
  * 容器运行时
  * kUbe-proxy 负责维护主机上的网络规则并执行连接转发。它还负责服务中所有Pod的负载平衡。
* 附加组件
  * DNS服务器 CoreDNS
  * 网络插件
  * 日志记录代理
* CLI
  * kubeadm：用来初始化集群的指令。
  * kubectl：用来与集群通信的命令行工具。

### 在部署应用程序时，将发生以下操作：

* 你将应用程序清单提交给Kubernetes API。 API Server将清单中定义的对象写入etcd。
* 控制器会注意到新创建的对象，并创建几个新对象。
* 调度程序将Pod分配给每个工作节点。
* Kubelet注意到已分配给自己的Pod。它通过Container Runtime运行应用程序实例。
* Kube-proxy会注意到，应用程序实例已准备就绪，可以接受来自客户端的连接并为其配置负载均衡器。
* Kubelet和控制器监视系统并保持应用程序运行。

## 安装

* minikube
* kubeadm

  ```ruby
  # -*- mode: ruby -*-
  # vi: set ft=ruby :

  Vagrant.configure("2") do |config|

    config.vm.box = "generic/ubuntu2204"
    config.vm.hostname = "k8s-master"
    config.vm.disk :disk, name: "main", size: "300GB"
    config.vm.network "public_network"


    # config.vm.synced_folder "../data", "/vagrant_data"
    # config.vm.synced_folder ".", "/vagrant", disabled: true

    config.vm.provider "vmware_desktop" do |vb|
      vb.gui = true
      vb.cpus = 8
      vb.memory = "16384"
    end
    config.vm.provision "shell", inline: <<-SHELL
      lvextend /dev/ubuntu-vg/ubuntu-lv /dev/sda3
      resize2fs /dev/ubuntu-vg/ubuntu-lv
      df -h /
      sudo apt-get update -y
      sudo ufw disable
      # # 将 SELinux 设置为 permissive 模式（相当于将其禁用）
      # sudo setenforce 0
      # sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config

      #关闭swap
      sudo swapoff -a  
      sudo sed -ri 's/.*swap.*/#&/' /etc/fstab

      #允许 iptables 检查桥接流量
      sudo cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
  br_netfilter
  EOF
      sudo modprobe overlay
      sudo modprobe br_netfilter
      # 设置所需的 sysctl 参数，参数在重新启动后保持不变
      sudo cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
  net.bridge.bridge-nf-call-iptables  = 1
  net.bridge.bridge-nf-call-ip6tables = 1
  net.ipv4.ip_forward                 = 1
  EOF
      # 应用 sysctl 参数而不重新启动
      sudo sysctl --system
      # sudo mkdir -m 755 /etc/apt/keyrings
      # 安装containerd
      sudo apt-get install ca-certificates curl gnupg -y 
      sudo install -m 0755 -d /etc/apt/keyring
      sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      sudo chmod a+r /etc/apt/keyrings/docker.gpg
      echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list
      sudo apt-get update -y
      sudo apt-get install containerd.io -y 

      # wget https://github.com/containernetworking/plugins/releases/download/v1.3.0/cni-plugins-linux-amd64-v1.3.0.tgz
      # sudo  mkdir -p /opt/cni/bin
      # sudo tar Cxzvf /opt/cni/bin cni-plugins-linux-amd64-v1.3.0.tgz
      # containerd config default > /etc/containerd/config.toml

      #   [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
      # ...
      # [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
      #   SystemdCgroup = true
      # sudo systemctl restart containerd

      # sudo apt-get install -y apt-transport-https ca-certificates curl gpg
      # sudo curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
      # sudo chmod a+r /etc/apt/keyrings/docker.gpg
      # sudo echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
      # sudo apt-get update -y
      # sudo apt-get install -y kubelet kubeadm kubectl
      # sudo apt-mark hold kubelet kubeadm kubectl

      # kubeadm config images pull  --image-repository registry.aliyuncs.com/google_containers
      # ctr -n k8s.io i tag registry.aliyuncs.com/google_containers/pause:3.9 registry.k8s.io/pause:3.6 
      # sudo kubeadm init  --apiserver-advertise-address=192.168.234.156  --pod-network-cidr=192.168.0.0/16 --image-repository registry.aliyuncs.com/google_containers 

      # export KUBECONFIG=/etc/kubernetes/admin.conf


      # Your Kubernetes control-plane has initialized successfully!

      # To start using your cluster, you need to run the following as a regular user:

      #   mkdir -p $HOME/.kube
      #   sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
      #   sudo chown $(id -u):$(id -g) $HOME/.kube/config

      # Alternatively, if you are the root user, you can run:

      #   export KUBECONFIG=/etc/kubernetes/admin.conf

      # You should now deploy a pod network to the cluster.
      # Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
      #   https://kubernetes.io/docs/concepts/cluster-administration/addons/

      # Then you can join any number of worker nodes by running the following on each as root:

      # kubeadm join 192.168.234.156:6443 --token 7hmrqw.ypwg6m9z5j4v8brq \
      #         --discovery-token-ca-cert-hash sha256:5ccd48a83cfe4a810327e80f1cb9cc68f8a05095850acf3d23fae90d618b7d98


      # sudo kubeadm init --pod-network-cidr=192.168.0.0/16
      # sudo kubeadm init \
      # --apiserver-advertise-address=192.168.234.155 \
      # --control-plane-endpoint=cluster-endpoint \
      # --service-cidr=10.96.0.0/16 \
      # --pod-network-cidr=192.168.0.0/16

      kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/tigera-operator.yaml

      kubectl taint nodes --all node-role.kubernetes.io/control-plane-

    SHELL
  end

  ```

* kubekey

## 命令参考

您可以参考以下 kubectl 命令。[了解更多 **(opens new window)**](https://kubernetes.io/zh/docs/reference/kubectl/overview/)[kubectl | Kubernetes(opens new window)](https://kubernetes.io/zh-cn/docs/reference/kubectl/kubectl/)

### 自定义输出

* 查看容器组的更多信息
  * `kubectl get pod <容器组名称> -o wide`
* 查看 YAML 格式的容器组详情
  * `kubectl get pod <容器组名称> -o yaml`

### 执行操作

#### 创建资源

* 使用 YAML 配置文件创建服务
  * `kubectl create -f my-service.yaml`
* 使用目录下的所有 YAML、YML 和 JSON 文件创建资源
  * `kubectl create -f <目录>`

#### 查看资源

* 查看所有容器组
  * `kubectl get pods`
* 查看所有服务
  * `kubectl get services`

#### 查看资源详情

* 查看节点详情
  * `kubectl describe nodes <节点名称>`
* 查看容器组详情
  * `kubectl describe pods <容器组名称>`

### kubectl -h

```bash
> kubectl  -h
kubectl controls the Kubernetes cluster manager.

 Find more information at: https://kubernetes.io/docs/reference/kubectl/overview/

Basic Commands (Beginner):
  create        Create a resource from a file or from stdin.
  expose        使用 replication controller, service, deployment 或者 pod 并暴露它作为一个 新的 Kubernetes
Service
  run           在集群中运行一个指定的镜像
  set           为 objects 设置一个指定的特征

Basic Commands (Intermediate):
  explain       查看资源的文档
  get           显示一个或更多 resources
  edit          在服务器上编辑一个资源
  delete        Delete resources by filenames, stdin, resources and names, or by resources and label selector

Deploy Commands:
  rollout       Manage the rollout of a resource
  scale         Set a new size for a Deployment, ReplicaSet or Replication Controller
  autoscale     Auto-scale a Deployment, ReplicaSet, StatefulSet, or ReplicationController

Cluster Management Commands:
  certificate   修改 certificate 资源.
  cluster-info  显示集群信息
  top           显示 Resource (CPU/Memory) 使用.
  cordon        标记 node 为 unschedulable
  uncordon      标记 node 为 schedulable
  drain         Drain node in preparation for maintenance
  taint         更新一个或者多个 node 上的 taints

Troubleshooting and Debugging Commands:
  describe      显示一个指定 resource 或者 group 的 resources 详情
  logs          输出容器在 pod 中的日志
  attach        Attach 到一个运行中的 container
  exec          在一个 container 中执行一个命令
  port-forward  Forward one or more local ports to a pod
  proxy         运行一个 proxy 到 Kubernetes API server
  cp            复制 files 和 directories 到 containers 和从容器中复制 files 和 directories.
  auth          Inspect authorization
  debug         Create debugging sessions for troubleshooting workloads and nodes

Advanced Commands:
  diff          Diff live version against would-be applied version
  apply         通过文件名或标准输入流(stdin)对资源进行配置
  patch         Update field(s) of a resource
  replace       通过 filename 或者 stdin替换一个资源
  wait          Experimental: Wait for a specific condition on one or many resources.
  kustomize     Build a kustomization target from a directory or URL.

Settings Commands:
  label         更新在这个资源上的 labels
  annotate      更新一个资源的注解
  completion    Output shell completion code for the specified shell (bash or zsh)

Other Commands:
  api-resources Print the supported API resources on the server
  api-versions  Print the supported API versions on the server, in the form of "group/version"
  config        修改 kubeconfig 文件
  plugin        Provides utilities for interacting with plugins.
  version       输出 client 和 server 的版本信息

Usage:
  kubectl [flags] [options]

Use "kubectl <command> --help" for more information about a given command.
Use "kubectl options" for a list of global command-line options (applies to all commands).

```

## 核心组件

### Node

### Pod

* Pod是可以在 Kubernetes 中创建和管理的、最小的可部署的计算单元。
* Pod 可以被理解成一群可以共享网络、存储和计算资源的容器化服务的集合.
* 同一个 Pod 之间的 Container 可以通过 localhost 互相访问，并且可以挂载 Pod 内所有的数据卷；但是不同的 Pod 之间的 Container 不能用 localhost 访问，也不能挂载其他 Pod 的数据卷。
* 一个 Pod 内可以有多个容器 container。
  * 标准容器 Application Container。
  * 初始化容器 Init Container。
  * 边车容器 Sidecar Container。
  * 临时容器 Ephemeral Container。

> `https://zhuanlan.zhihu.com/p/651130502`

```yaml
apiVersion: v1    # 记录k8s的apiserver版本，目前都是v1
kind: Pod        # 类型 Pod
metadata:         # 记录了pod自身的元数据
  name: memory-demo
  namespace: mem-example   # 所属的命名空间
spec:            # 记录了pod内部资源的详细信息
  containers:    # 容器信息
  - name: memory-demo-ctr
    image: polinux/stress 
    resources:    # 资源配额
      limits:
        memory: "200Mi"
      requests:
        memory: "100Mi"
    command: ["stress"] # 容器入口命令
    args: ["--vm", "1", "--vm-bytes", "150M", "--vm-hang", "1"] # 入口命令参数
    volumeMounts: # 挂载数据卷
    - name: redis-storage
      mountPath: /data/redis
  volumes:    # 数据卷信息
  - name: redis-storage
    emptyDir: {}
```

### Service

将运行在一组 Pods 上的应用程序公开为网络服务的抽象方法。

nginx-service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service	#Service 的名称
  labels:     	#Service 自己的标签
    app: nginx	#为该 Service 设置 key 为 app，value 为 nginx 的标签
spec:	    #这是关于该 Service 的定义，描述了 Service 如何选择 Pod，如何被访问
  selector:	    #标签选择器
    app: nginx	#选择包含标签 app:nginx 的 Pod
  ports:
  - name: nginx-port	#端口的名字
    protocol: TCP	    #协议类型 TCP/UDP
    port: 80	        #集群内的其他容器组可通过 80 端口访问 Service
    nodePort: 32600   #通过任意节点的 32600 端口访问 Service
    targetPort: 80	#将请求转发到匹配 Pod 的 80 端口
  type: NodePort	#Serive的类型，ClusterIP/NodePort/LoaderBalancer
```

```bash
> kubectl apply -f nginx-service.yaml 
service/nginx-service created
> kubectl get services -o wide

NAME            TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE   SELECTOR
kubernetes      ClusterIP   10.43.0.1      <none>        443/TCP        98d   <none>
mongo           ClusterIP   10.43.87.175   <none>        27017/TCP      98d   app.kubernetes.io/component=backend,app.kubernetes.io/name=mongo
nginx-service   NodePort    10.43.158.73   <none>        80:32600/TCP   33s   app=nginx
```

### Ingress

Ingress 是对集群中服务的外部访问进行管理的 API 对象，典型的访问方式是 HTTP。 Ingress 可以提供负载均衡、SSL 终结和基于名称的虚拟托管。

### ConfigMap

### Secret

### Volumes

### Deployment

Deployment 的作用是管理和控制 Pod 和 
，管控它们运行在用户期望的状态中

* 部署无状态应用

```yaml
apiVersion: apps/v1	#与k8s集群版本有关，使用 kubectl api-versions 即可查看当前集群支持的版本
kind: Deployment	#该配置的类型，我们使用的是 Deployment
metadata:	        #译名为元数据，即 Deployment 的一些基本属性和信息
  name: nginx-deployment	#Deployment 的名称
  labels:	    #标签，可以灵活定位一个或多个资源，其中key和value均可自定义，可以定义多组，目前不需要理解
    app: nginx	#为该Deployment设置key为app，value为nginx的标签
spec:	        #这是关于该Deployment的描述，可以理解为你期待该Deployment在k8s中如何使用
  replicas: 1	#使用该Deployment创建一个应用程序实例
  selector:	    #标签选择器，与上面的标签共同作用，目前不需要理解
    matchLabels: #选择包含标签app:nginx的资源
      app: nginx
  template:	    #这是选择或创建的Pod的模板
    metadata:	#Pod的元数据
      labels:	#Pod的标签，上面的selector即选择包含标签app:nginx的Pod
        app: nginx
    spec:	    #期望Pod实现的功能（即在pod中部署）
      containers:	#生成container，与docker中的container是同一种
      - name: nginx	#container的名称
        image: nginx:latest	#使用镜像nginx:1.7.9创建container，该container默认80端口可访问
```

```bash
kubectl apply -f nginx-deployment.yaml


# 查看 Deployment
kubectl get deployments

# 查看 Pod
kubectl get pods
```

### StatefulSet

* 部署有状态应用

## 架构

* kubectl
* master
  * Control plane
    * API server
    * scheduler
    * Controller Manager
      * 监控和检测故障
    * etcd
      * 存储集群中所有资源对象的信息
    * 云控制管理器（使用云服务商的集群时会有）
* Node
  * kubelet
  * kube-proxy
  * container-runtime

## CNI 容器网络接口

## CSI 容器存储接口

## CRI 容器运行时接口

* 主要的运行时
  * RunC： linux容器，比如docker
  * RunV：安全容器，轻量级虚拟机。比如kata、firecracker等
  * Wasm: 具体实现有WasmEdge

## Device Plugin

通过Device Plugin机制支持GPU、RDMA、FPGA、InfiniBand等第三方设备资源

## NRI Node资源接口

* 典型：基于NRI扩展Kubelete CPU管理能力，比如感知L3 cache的智能绑核。

<!-- ## Ingress

* 入口流量的标准规范
* Gateway API -->

## 调度器扩展 Scheduling Framework

* 离线调度方案

## CCM扩展

## API扩展 APServer + 原生资源CM扩展

* dynamic admission control 动态准入控制
* CRD+Operator
  * 定制自己的工作负载类型，支持原地升级、灰度发布等高级策略 OpenKruise
* Aggregated APIServer 客户定制api需求的解决方案
  * metrics server

### Operator SDK 工作流

开发一个新的 Operator：

1. 使用 SDK 创建一个新的 Operator 项目
2. 通过添加自定义资源（CRD）定义新的资源 API
3. 指定使用 SDK API 来 watch 的资源
4. 定义 Operator 的协调（reconcile）逻辑
5. 使用 Operator SDK 构建并生成 Operator 部署清单文件

## 排查
