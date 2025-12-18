# k3s

## Vagrantfile

```ruby
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  (1..3).each do |i|
    config.vm.define "k3s-master-#{i}" do |vb|  
      vb.vm.box = "generic/ubuntu2204"
      vb.vm.hostname = "k3s-master-#{i}"
      vb.vm.network "public_network"
      vb.vm.network "private_network", ip: "192.168.30.#{10+i}", netmask: "255.255.255.0"
      # config.vm.synced_folder "../data", "/vagrant_data"
      # config.vm.synced_folder ".", "/vagrant", disabled: true
  
      vb.vm.provider "vmware_desktop" do |v|
        v.gui = true
        v.cpus = 4
        v.memory = "4096"
      end
      vb.vm.provision "shell", inline: <<-SHELL
        lvextend /dev/ubuntu-vg/ubuntu-lv /dev/sda3
        resize2fs /dev/ubuntu-vg/ubuntu-lv
        df -h /
        # sudo apt-get update -y
        sudo ufw disable

        #关闭swap
        sudo swapoff -a  
        sudo sed -ri 's/.*swap.*/#&/' /etc/fstab
        INSTALL_K3S_MIRROR=cn
        INSTALL_K3S_EXEC="server"
        K3S_TOKEN="k3sToKeN123456"

        # 3个master，若干个worker
        # 第一个master，相当于集群初始化
        # sudo curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_MIRROR=cn K3S_TOKEN=k3sToKeN123456  sh -s - server --cluster-init  --system-default-registry "registry.cn-hangzhou.aliyuncs.com"
        # 其余两个master，加入到第一个的集群当中
        # sudo curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_MIRROR=cn K3S_TOKEN=k3sToKeN123456  sh -s - server --server https://192.168.9.201:6443  --system-default-registry "registry.cn-hangzhou.aliyuncs.com"
        # worker节点
        # sudo curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_MIRROR=cn INSTALL_K3S_EXEC="agent" K3S_TOKEN="k3sToKeN123456"  K3S_URL=https://192.168.9.201:6443 sh -
   
        # vagrant ssh k3s-master-1 -c 'sudo curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_MIRROR=cn K3S_TOKEN=k3sToKeN123456  sh -s - server --cluster-init'
        # vagrant ssh k3s-master-2 -c 'sudo curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_MIRROR=cn K3S_TOKEN=k3sToKeN123456  sh -s - server --server https://192.168.9.201:6443'
        # vagrant ssh k3s-master-3 -c 'sudo curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_MIRROR=cn K3S_TOKEN=k3sToKeN123456  sh -s - server --server https://192.168.9.201:6443'
        # vagrant ssh k3s-worker-1 -c 'sudo curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_MIRROR=cn INSTALL_K3S_EXEC="agent" K3S_TOKEN="k3sToKeN123456"  K3S_URL=https://192.168.9.201:6443 sh -'
        # vagrant ssh k3s-worker-2 -c 'sudo curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_MIRROR=cn INSTALL_K3S_EXEC="agent" K3S_TOKEN="k3sToKeN123456"  K3S_URL=https://192.168.9.201:6443 sh -'
        # vagrant ssh k3s-worker-3 -c 'sudo curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_MIRROR=cn INSTALL_K3S_EXEC="agent" K3S_TOKEN="k3sToKeN123456"  K3S_URL=https://192.168.9.201:6443 sh -'

        # 卸载
        ## 卸载 master
        # vagrant ssh k3s-worker-2 -c '/usr/local/bin/k3s-uninstall.sh'
        ## 卸载 agent
        # vagrant ssh k3s-worker-2 -c '/usr/local/bin/k3s-agent-uninstall.sh'

        # 查看节点信息
        # root@k3s-master-1:/home/vagrant# kubectl get nodes -o wide
        # NAME           STATUS   ROLES                       AGE     VERSION        INTERNAL-IP       EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION      CONTAINER-RUNTIME
        # k3s-master-1   Ready    control-plane,etcd,master   16m     v1.27.7+k3s2   192.168.234.163   <none>        Ubuntu 22.04.3 LTS   5.15.0-84-generic   containerd://1.7.7-k3s1.27
        # k3s-master-2   Ready    control-plane,etcd,master   12m     v1.27.7+k3s2   192.168.234.164   <none>        Ubuntu 22.04.3 LTS   5.15.0-84-generic   containerd://1.7.7-k3s1.27
        # k3s-master-3   Ready    control-plane,etcd,master   9m37s   v1.27.7+k3s2   192.168.234.165   <none>        Ubuntu 22.04.3 LTS   5.15.0-84-generic   containerd://1.7.7-k3s1.27
        # k3s-worker-1   Ready    <none>                      14m     v1.27.7+k3s2   192.168.234.166   <none>        Ubuntu 22.04.3 LTS   5.15.0-84-generic   containerd://1.7.7-k3s1.27
        # k3s-worker-2   Ready    <none>                      72s     v1.27.7+k3s2   192.168.234.167   <none>        Ubuntu 22.04.3 LTS   5.15.0-84-generic   containerd://1.7.7-k3s1.27
        # k3s-worker-3   Ready    <none>                      6m22s   v1.27.7+k3s2   192.168.234.168   <none>        Ubuntu 22.04.3 LTS   5.15.0-84-generic   containerd://1.7.7-k3s1.27
        # 查看pod
        # root@k3s-master-1:/home/vagrant# kubectl get pods -A -o wide
        # NAMESPACE     NAME                                     READY   STATUS      RESTARTS   AGE     IP          NODE           NOMINATED NODE   READINESS GATES
        # kube-system   coredns-77ccd57875-4rrdn                 1/1     Running     0          17m     10.42.0.4   k3s-master-1   <none>           <none>
        # kube-system   helm-install-traefik-bzpzz               0/1     Completed   1          17m     10.42.0.3   k3s-master-1   <none>           <none>
        # kube-system   helm-install-traefik-crd-4gwrd           0/1     Completed   0          17m     10.42.0.2   k3s-master-1   <none>           <none>
        # kube-system   local-path-provisioner-957fdf8bc-dphbc   1/1     Running     0          17m     10.42.0.6   k3s-master-1   <none>           <none>
        # kube-system   metrics-server-648b5df564-n8m6s          1/1     Running     0          17m     10.42.0.5   k3s-master-1   <none>           <none>
        # kube-system   svclb-traefik-00740945-2pjq4             2/2     Running     0          3m1s    10.42.5.2   k3s-worker-2   <none>           <none>
        # kube-system   svclb-traefik-00740945-9w9t2             2/2     Running     0          17m     10.42.0.7   k3s-master-1   <none>           <none>
        # kube-system   svclb-traefik-00740945-j4w59             2/2     Running     0          8m11s   10.42.4.2   k3s-worker-3   <none>           <none>
        # kube-system   svclb-traefik-00740945-pp4dr             2/2     Running     0          11m     10.42.3.2   k3s-master-3   <none>           <none>
        # kube-system   svclb-traefik-00740945-tqgl8             2/2     Running     0          14m     10.42.2.2   k3s-master-2   <none>           <none>
        # kube-system   svclb-traefik-00740945-wpcmf             2/2     Running     0          15m     10.42.1.2   k3s-worker-1   <none>           <none>
        # kube-system   traefik-768bdcdcdd-cvtm2                 1/1     Running     0          17m     10.42.0.8   k3s-master-1   <none>           <none>


        # 单master
        # sudo curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_MIRROR=cn INSTALL_K3S_EXEC="server"  K3S_TOKEN="k3sToKeN123456" sh -
        # worker节点
        # sudo curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_MIRROR=cn INSTALL_K3S_EXEC="agent" K3S_TOKEN="k3sToKeN123456"  K3S_URL=https://192.168.30.10:6443 sh -
  

        # 二进制运行
        # curl -Lo /usr/local/bin/k3s https://github.com/k3s-io/k3s/releases/download/v1.26.5+k3s1/k3s; chmod a+x /usr/local/bin/k3s
        # k3s server --write-kubeconfig-mode=644
        # k3s agent --server https://k3s.example.com --token mypassword

      SHELL
    end
  end
  (1..3).each do |i|
    config.vm.define "k3s-worker-#{i}" do |vb|  
      vb.vm.box = "generic/ubuntu2204"
      vb.vm.hostname = "k3s-worker-#{i}"
      vb.vm.network "public_network"
      vb.vm.network "private_network", ip: "192.168.30.#{20+i}", netmask: "255.255.255.0"
      # config.vm.synced_folder "../data", "/vagrant_data"
      # config.vm.synced_folder ".", "/vagrant", disabled: true
  
      vb.vm.provider "vmware_desktop" do |v|
        v.gui = true
        v.cpus = 4
        v.memory = "4096"
      end
      vb.vm.provision "shell", inline: <<-SHELL
        lvextend /dev/ubuntu-vg/ubuntu-lv /dev/sda3
        resize2fs /dev/ubuntu-vg/ubuntu-lv
        df -h /
        # sudo apt-get update -y
        sudo ufw disable
        #关闭swap
        sudo swapoff -a  
        sudo sed -ri 's/.*swap.*/#&/' /etc/fstab
        # sudo curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_MIRROR=cn INSTALL_K3S_EXEC="agent" K3S_TOKEN="k3stoekn123456"  K3S_URL=https://192.168.30.10:6443 sh -
      SHELL
    end
  end
end

```

## [配置命令自动补全](https://hotsec.github.io/dev/k3s.html#%E9%85%8D%E7%BD%AE%E5%91%BD%E4%BB%A4%E8%87%AA%E5%8A%A8%E8%A1%A5%E5%85%A8)

```bash

安装基本的 bash 自动完成

yum install bash-completion
# apt-get install  bash-completion
添加自动完成脚本

kubectl completion bash | sudo tee /etc/bash_completion.d/kubectl > /dev/null
设置别名

echo 'alias k=kubectl' >>~/.bashrc
给别名也添加自动完成提示

echo 'complete -o default -F __start_kubectl k' >>~/.bashrc
zsh 自动完成

echo 'source <(kubectl completion zsh)' >>~/.zshrc
```

## [安装dashboard](https://hotsec.github.io/dev/k3s.html#%E5%AE%89%E8%A3%85dashboard)

> [Kubernetes 仪表盘 | Rancher文档(opens new window)](https://docs.rancher.cn/docs/k3s/installation/kube-dashboard/_index/)

```bash
root@k3s-master-1:/home/vagrant# kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
namespace/kubernetes-dashboard created
serviceaccount/kubernetes-dashboard created
service/kubernetes-dashboard created
secret/kubernetes-dashboard-certs created
secret/kubernetes-dashboard-csrf created
secret/kubernetes-dashboard-key-holder created
configmap/kubernetes-dashboard-settings created
role.rbac.authorization.k8s.io/kubernetes-dashboard created
clusterrole.rbac.authorization.k8s.io/kubernetes-dashboard created
rolebinding.rbac.authorization.k8s.io/kubernetes-dashboard created
clusterrolebinding.rbac.authorization.k8s.io/kubernetes-dashboard created
deployment.apps/kubernetes-dashboard created
service/dashboard-metrics-scraper created
deployment.apps/dashboard-metrics-scraper created
root@k3s-master-1:/home/vagrant# kubectl get pods -A -o wide
NAMESPACE              NAME                                         READY   STATUS      RESTARTS   AGE   IP          NODE           NOMINATED NODE   READINESS GATES
kube-system            coredns-77ccd57875-956rz                     1/1     Running     0          51m   10.42.0.4   k3s-master-1   <none>           <none> 
kube-system            helm-install-traefik-crd-n92vd               0/1     Completed   0          51m   10.42.0.3   k3s-master-1   <none>           <none> 
kube-system            helm-install-traefik-ndb7s                   0/1     Completed   1          51m   10.42.0.5   k3s-master-1   <none>           <none> 
kube-system            local-path-provisioner-957fdf8bc-z4pwr       1/1     Running     0          51m   10.42.0.6   k3s-master-1   <none>           <none> 
kube-system            metrics-server-648b5df564-7452s              1/1     Running     0          51m   10.42.0.2   k3s-master-1   <none>           <none> 
kube-system            svclb-traefik-71cee43e-pbt2m                 2/2     Running     0          39m   10.42.1.2   k3s-worker-1   <none>           <none> 
kube-system            svclb-traefik-71cee43e-sgv5b                 2/2     Running     0          50m   10.42.0.7   k3s-master-1   <none>           <none> 
kube-system            traefik-768bdcdcdd-hvtg2                     1/1     Running     0          50m   10.42.0.8   k3s-master-1   <none>           <none> 
kubernetes-dashboard   dashboard-metrics-scraper-5cb4f4bb9c-9wrnw   1/1     Running     0          58s   10.42.1.4   k3s-worker-1   <none>           <none> 
kubernetes-dashboard   kubernetes-dashboard-6967859bff-crs7h        1/1     Running     0          58s   10.42.1.3   k3s-worker-1   <none>           <none> 
root@k3s-master-1:/home/vagrant# kubectl edit svc kubernetes-dashboard -n kubernetes-dashboard
service/kubernetes-dashboard edited
root@k3s-master-1:/home/vagrant# kubectl get svc -A
NAMESPACE              NAME                        TYPE           CLUSTER-IP      EXTERNAL-IP                       PORT(S)                      AGE
default                kubernetes                  ClusterIP      10.43.0.1       <none>                            443/TCP                      53m  
kube-system            kube-dns                    ClusterIP      10.43.0.10      <none>                            53/UDP,53/TCP,9153/TCP       53m  
kube-system            metrics-server              ClusterIP      10.43.114.35    <none>                            443/TCP                      53m
kube-system            traefik                     LoadBalancer   10.43.164.114   192.168.234.169,192.168.234.170   80:31154/TCP,443:32454/TCP   52m  
kubernetes-dashboard   dashboard-metrics-scraper   ClusterIP      10.43.4.122     <none>                            8000/TCP                     3m31s  
kubernetes-dashboard   kubernetes-dashboard        NodePort       10.43.230.149   <none>                            443:30473/TCP                3m31s  
#创建访问账号，准备一个yaml文件； vim dash.yaml
root@k3s-master-1:/home/vagrant# cat dash.yaml 
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
root@k3s-master-1:/home/vagrant#  kubectl apply -f dash.yaml
serviceaccount/admin-user created
clusterrolebinding.rbac.authorization.k8s.io/admin-user created
root@k3s-master-1:/home/vagrant# kubectl -n kubernetes-dashboard create token admin-user --duration=2400h
eyJhbGciOiJSUzI1NiIsImtpZCI6Ik9aenFvVENlU3U5ZjMzMmNObnpqY0QxVEF2QmlGcjNOcml5eGZEREp3QVEifQ.eyJhdWQiOlsiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwiLCJrM3MiXSwiZXhwIjoxNzA5ODAyNzQ4LCJpYXQiOjE3MDExNjI3NDgsImlzcyI6Imh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Yy5jbHVzdGVyLmxvY2FsIiwia3ViZXJuZXRlcy5pbyI6eyJuYW1lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsInNlcnZpY2VhY2NvdW50Ijp7Im5hbWUiOiJhZG1pbi11c2VyIiwidWlkIjoiZDY4N2JmOGUtYTZjOS00OTk1LThmNjgtMjA3Nzg3ZjQxYTE5In19LCJuYmYiOjE3MDExNjI3NDgsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlcm5ldGVzLWRhc2hib2FyZDphZG1pbi11c2VyIn0.ZiaP56Z3Qix95cBOQKu43jFKwA_9nOeygUtVPZjLiGIf_VNMJpA9drG6K9kBHDFVBCM42PPIez7kYxvVwczftdzhcRTplmURyRCJw4wRLPtRB2Xt3aPsfw1rbtBlYx8EfawmNQ1thxbg6tRfEBv6Gv2dKZA6Nfy7s7c6ktH5KM1gXKO_Hkv_wiC0c2hHONEK42l3qs-z6nfsxDMfvSsgZ3Pt0v-pb8HoTASunDO3IGJrbsAoVSNE9EAKpXGUsQrKVX7kU-3P9Gu30SPHhctHIvrMn4shNWERfwryQwhlX0hg2B0T0Tcf67cPLFZNbyEdNcSvn0ItWbFcMdZms9q1yQ
```

要访问仪表盘，你必须创建一个安全通道到你的 K3s 集群。

`sudo k3s kubectl proxy`

现在可以通过以下网址访问仪表盘：

* `http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/`
* 使用 `admin-user` Bearer Token `Sign In`

绑定0.0.0.0，可以通过外部访问 `kubectl port-forward -n kubernetes-dashboard service/kubernetes-dashboard 10443:443 --address 0.0.0.0`

## [kubectl proxy](https://hotsec.github.io/dev/k3s.html#kubectl-proxy)

```shell
# 创建一个运行 MongoDB 的 Deployment-------------
root@k3s-master-1:/home/vagrant# 
deplyment.apps/mongo created

# 查看 Pod 状态
root@k3s-master-1:/home/vagrant# kubectl get pods 
NAME                    READY   STATUS             RESTARTS   AGE
mongo-7d96cb4cf-ql4ls   0/1     ImagePullBackOff   0          21s
root@k3s-master-1:/home/vagrant# kubectl get pods 
NAME                    READY   STATUS    RESTARTS   AGE
mongo-7d96cb4cf-ql4ls   1/1     Running   0          4m4s

# 查看 Deployment 状态
root@k3s-master-1:/home/vagrant# kubectl get deployment  
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
mongo   1/1     1            1           3m59s

# 该 Deployment 自动管理一个 ReplicaSet。查看该 ReplicaSet 的状态
root@k3s-master-1:/home/vagrant# kubectl get replicaset
NAME              DESIRED   CURRENT   READY   AGE
mongo-7d96cb4cf   1         1         1       4m13
```

```bash
# 创建一个在网络上公开的 MongoDB 服务
root@k3s-master-1:/home/vagrant# kubectl apply -f https://k8s.io/examples/application/mongodb/mongo-service.yaml
service/mongo created

# 检查所创建的 Service
root@k3s-master-1:/home/vagrant#  kubectl get service mongo
NAME    TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)     AGE
mongo   ClusterIP   10.43.9.69   <none>        27017/TCP   11s

# 验证 MongoDB 服务是否运行在 Pod 中并且在监听 27017 端口
root@k3s-master-1:/home/vagrant# kubectl get pod mongo-7d96cb4cf-ql4ls --template='{{(index (index .spec.containers 0).ports 0).containerPort}}{{"\n"}}'
27017
```

## [转发一个本地端口到 Pod 端口](https://hotsec.github.io/dev/k3s.html#%E8%BD%AC%E5%8F%91%E4%B8%80%E4%B8%AA%E6%9C%AC%E5%9C%B0%E7%AB%AF%E5%8F%A3%E5%88%B0-pod-%E7%AB%AF%E5%8F%A3)

`kubectl port-forward` 允许使用资源名称 （例如 Pod 名称）来选择匹配的 Pod 来进行端口转发

```shell
kubectl port-forward mongo-7d96cb4cf-ql4ls 28015:27017
kubectl port-forward pods/mongo-7d96cb4cf-ql4ls 28015:27017
kubectl port-forward deployment/mongo 28015:27017
kubectl port-forward replicaset/mongo-7d96cb4cf 28015:27017
kubectl port-forward service/mongo 28015:27017
```

以上所有命令效果相同。输出类似于：

```bash
root@k3s-master-1:/home/vagrant# kubectl port-forward replicaset/mongo-7d96cb4cf 28015:2701717
Forwarding from 127.0.0.1:28015 -> 27017
```

```bash
root@k3s-master-1:/home/vagrant# kubectl port-forward deployment/mongo :27017  # 让 *kubectl* 来选择本地端口
Forwarding from 127.0.0.1:33627 -> 27017
```

## QA

### lxc容器中部署k3s

**一定要是特权容器**,创建的时候设置的，创建完之后改不管用

sysctl -w net.bridge.bridge-nf-call-iptables=1

```bash
# /dev/kmsg 设备挂载

cat <<'EOF' | tee /etc/rc.local > /dev/null
#!/bin/sh -e
if [ ! -e /dev/kmsg ];then
ln -s /dev/console /dev/kmsg
fi
mount --make-rshared /

EOF

chmod +x /etc/rc.local
```

```bash
lxc.apparmor.profile: unconfined
lxc.cgroup.devices.allow: a
lxc.cap.drop:
lxc.mount.auto: "proc:rw sys:rw"
```

```bash
 cat >> /etc/rancher/k3s/registries.yaml << EOF
mirrors:
  docker.io:
    endpoint:
      - "https://docker.m.daocloud.io"

  gcr.io:
    endpoint:
      - "https://gcr.m.daocloud.io"

  quay.io:
    endpoint:
      - "https://quay.m.daocloud.io"

  registry.k8s.io:
    endpoint:
      - "https://k8s.m.daocloud.io"
EOF
```
## 升级k3s集群

```bash
# 查看当前版本
k3s --version

# 升级主master
/usr/local/bin/k3s-killall.sh 
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_CHANNEL=latest INSTALL_K3S_MIRROR=cn K3S_TOKEN=k3sToKeN123456  sh -s - server --cluster-init  --system-default-registry "registry.cn-hangzhou.aliyuncs.com"
# 剩余两个master
/usr/local/bin/k3s-killall.sh 
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  | INSTALL_K3S_CHANNEL=latest INSTALL_K3S_MIRROR=cn K3S_TOKEN=k3sToKeN123456  sh -s - server --server https://192.168.9.201:6443  --system-default-registry "registry.cn-hangzhou.aliyuncs.com"
# 3个worker
/usr/local/bin/k3s-killall.sh 
sudo curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh  |  INSTALL_K3S_CHANNEL=latest INSTALL_K3S_MIRROR=cn INSTALL_K3S_EXEC="agent" K3S_TOKEN="k3sToKeN123456"  K3S_URL=https://192.168.9.201:6443 sh -

# 查看升级后的版本
kubectl get nodes -o wide

NAME           STATUS   ROLES                       AGE    VERSION        INTERNAL-IP     EXTERNAL-IP   OS-IMAGE           KERNEL-VERSION   CONTAINER-RUNTIME
k3s-master-1   Ready    control-plane,etcd,master   137d   v1.34.2+k3s1   192.168.9.201   <none>        Ubuntu 24.04 LTS   6.17.2-1-pve     containerd://2.1.5-k3s1
k3s-master-2   Ready    control-plane,etcd,master   137d   v1.34.2+k3s1   192.168.9.202   <none>        Ubuntu 24.04 LTS   6.17.2-1-pve     containerd://2.1.5-k3s1
k3s-master-3   Ready    control-plane,etcd,master   137d   v1.34.2+k3s1   192.168.9.203   <none>        Ubuntu 24.04 LTS   6.17.2-1-pve     containerd://2.1.5-k3s1
k3s-worker-1   Ready    <none>                      137d   v1.34.2+k3s1   192.168.9.204   <none>        Ubuntu 24.04 LTS   6.17.2-1-pve     containerd://2.1.5-k3s1
k3s-worker-2   Ready    <none>                      137d   v1.34.2+k3s1   192.168.9.205   <none>        Ubuntu 24.04 LTS   6.17.2-1-pve     containerd://2.1.5-k3s1
k3s-worker-3   Ready    <none>                      137d   v1.34.2+k3s1   192.168.9.206   <none>        Ubuntu 24.04 LTS   6.17.2-1-pve     containerd://2.1.5-k3s1
```
