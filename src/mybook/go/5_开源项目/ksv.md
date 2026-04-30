# ksv

## kubevirt

一个k8s插件，提供了管理虚拟机的功能。

主要组件

* virt-operator
* virt-api
* virt-controller
* virt-handler
* virt-lancher-xxx

## ksv部署

***服务器节点必须至少具有 1 个未格式化且未分区的磁盘，或 1 个未格式化的分区。该磁盘或分区的最低配置为 100 GB，推荐配置为 200 GB。***

KSV 云原生虚拟化（KSV）是由 KubeSphere 衍生的轻量化虚拟机管理平台，支持单节点部署和多节点部署，便捷易用，满足企业级虚拟化业务需求。

安装文档： [单节点模式安装 (kubesphere.cloud)(opens new window)](https://kubesphere.cloud/docs/ksv/02-quick-start/01-install-ksv-in-single-node-mode/)

1. 下载 `curl -OL https://virtualization.kubesphere.cloud/v1.6.1/kubesphere-virtualization-x86_64-v1.6.1.tar.gz`
2. 解压 `tar -zxvf kubesphere-virtualization-x86_64-v1.6.1.tar.gz`
3. cd kubesphere-virtualization-x86_64
4. ./install -a

```text
![1700358761673](image/ksv部署/1700358761673.png)

 _  __ _______      __
| |/ // ____\ \    / /
| ' /| (___  \ \  / /
|  <  \___ \  \ \/ /
| . \ ____) |  \  /
|_|\_\_____/    \/

23:42:08 CST [GreetingsModule] Greetings
23:42:08 CST message: [u22-test]
Greetings, KubeKey!
23:42:08 CST success: [u22-test]
23:42:08 CST [NodePreCheckModule] A pre-check on nodes
23:42:09 CST success: [u22-test]
23:42:09 CST [ConfirmModule] Display confirmation form
+----------+----------------+----------+-----------+-----+--------+--------------+
| name     | virtualization | devices  | disk size | lvm | chrony | time         |
+----------+----------------+----------+-----------+-----+--------+--------------+
| u22-test | y              | /dev/sdb | 255G      | y   | y      | CST 23:42:08 |
+----------+----------------+----------+-----------+-----+--------+--------------+


23:42:09 CST [WARN] To enable high availability for Ceph, ensure that at least three nodes have available storage devices.
Continue this installation? [yes/no]: yes
23:42:12 CST success: [LocalHost]
23:42:12 CST [UnArchiveArtifactModule] Check the KubeKey artifact md5 value
23:42:12 CST success: [LocalHost]
23:42:12 CST [UnArchiveArtifactModule] UnArchive the KubeKey artifact
/root/kubesphere-virtualization-x86_64/bin/kubekey/cni/v0.9.1/amd64/cni-plugins-linux-amd64-v0.9.1.tgz
/root/kubesphere-virtualization-x86_64/bin/kubekey/crictl/v1.24.0/amd64/crictl-v1.24.0-linux-amd64.tar.gz
/root/kubesphere-virtualization-x86_64/bin/kubekey/docker/20.10.8/amd64/docker-20.10.8.tgz
/root/kubesphere-virtualization-x86_64/bin/kubekey/etcd/v3.4.13/amd64/etcd-v3.4.13-linux-amd64.tar.gz
/root/kubesphere-virtualization-x86_64/bin/kubekey/helm/v3.9.0/amd64/helm
/root/kubesphere-virtualization-x86_64/bin/kubekey/images/blobs/sha256/01067f9916d3e9a208f6dcc81908d8f16833a9949c7c55c24413033b5620753d
/root/kubesphere-virtualization-x86_64/bin/kubekey/images/blobs/sha256/0146cd2f464603565ecdfa52f078c47e18e6a5f80c2de9da371be37ba0846e6f
/root/kubesphere-virtualization-x86_64/bin/kubekey/images/blobs/sha256/0198a
....
....
....
安装比较耗时，安装完会出现以下信息
The ks-installer is running
#####################################################
###     Welcome to KubeSphere Virtualization!     ###
#####################################################

Console: http://192.168.1.23:30890
Username: admin
Password: P@88w0rd

NOTE：
Please change the default password of the admin user
after login.

#####################################################
https://kubesphere.cloud/ksv/     2023-11-19 00:02:50
#####################################################

NOTE:
Verify the installation logs and result:
   ksv logs

```

```bash
> kubectl get pods -A
NAMESPACE                          NAME                                                READY   STATUS      RESTARTS   AGE
cdi                                cdi-apiserver-768fbc48fb-sfg8h                      1/1     Running     0          10h
cdi                                cdi-deployment-6844c9df8c-jvqnr                     1/1     Running     0          10h
cdi                                cdi-operator-647d74475f-lm57n                       1/1     Running     0          10h
cdi                                cdi-uploadproxy-558c47d79d-dvn8z                    1/1     Running     0          10h
default                            virt-launcher-i-w0zokvwo-8t8t9                      1/1     Running     0          30m
default                            virt-launcher-i-ygy0xcbc-tnttp                      1/1     Running     0          30m
kube-system                        coredns-7448499f4d-s7zf6                            1/1     Running     0          10h
kube-system                        kube-multus-ds-mptjz                                1/1     Running     0          10h
kube-system                        kube-ovn-cni-mcwqh                                  1/1     Running     1          10h
kube-system                        kube-ovn-controller-7fbfc7f655-flnql                1/1     Running     0          10h
kube-system                        kube-ovn-monitor-7c98d98457-b9hnf                   1/1     Running     0          10h
kube-system                        kube-ovn-pinger-lfldv                               1/1     Running     0          10h
kube-system                        ovn-central-7b9947d7d-7qh6w                         1/1     Running     0          10h
kube-system                        ovs-ovn-cpbnp                                       1/1     Running     0          10h
kubekey-system                     kubekey-controller-manager-9b55dbfd5-m5zc2          2/2     Running     0          10h
kubesphere-controls-system         default-http-backend-5bf68ff9b8-d5jvm               1/1     Running     0          10h
kubesphere-controls-system         kubectl-admin-6667774bb-wtwrd                       1/1     Running     0          10h
kubesphere-monitoring-system       alertmanager-main-0                                 2/2     Running     0          10h
kubesphere-monitoring-system       kube-state-metrics-687d66b747-ltdz9                 3/3     Running     0          10h
kubesphere-monitoring-system       node-exporter-q65tn                                 2/2     Running     0          10h
kubesphere-monitoring-system       notification-manager-deployment-78664576cb-sblcr    2/2     Running     0          10h
kubesphere-monitoring-system       notification-manager-operator-f6c4b859b-bq988       2/2     Running     0          10h
kubesphere-monitoring-system       prometheus-k8s-0                                    2/2     Running     0          10h
kubesphere-monitoring-system       prometheus-operator-8955bbd98-5wlrp                 2/2     Running     0          10h
kubesphere-system                  ftp-server-5d95579f8f-7zp7l                         1/1     Running     0          10h
kubesphere-system                  ks-apiserver-6cd95fb98f-zbmwn                       1/1     Running     0          10h
kubesphere-system                  ks-controller-manager-5958b94c9c-2ghc8              1/1     Running     0          10h
kubesphere-system                  ks-installer-5cbb65bdf5-wrnf2                       1/1     Running     0          10h
kubesphere-system                  minio-7f687756bb-c5h9v                              1/1     Running     0          10h
kubesphere-system                  sync-images-job-zz8ch                               0/1     Completed   0          10h
kubesphere-virtualization-system   express-network-agent-58ck8                         1/1     Running     0          10h
kubesphere-virtualization-system   express-network-controller-58bbdcc7c4-69w5q         1/1     Running     0          10h
kubesphere-virtualization-system   ksv-agent-kh7q6                                     1/1     Running     0          10h
kubesphere-virtualization-system   ksv-apiserver-7548496957-pgx5d                      1/1     Running     0          10h
kubesphere-virtualization-system   ksv-console-5b7f5685f5-pbmtx                        1/1     Running     0          10h
kubesphere-virtualization-system   ksv-controller-manager-859d666b67-tcghd             1/1     Running     0          10h
kubevirt                           virt-api-659db486c-fxhjb                            1/1     Running     0          10h
kubevirt                           virt-api-659db486c-nq9dl                            1/1     Running     0          10h
kubevirt                           virt-controller-67d45fb74c-4mph9                    1/1     Running     0          10h
kubevirt                           virt-controller-67d45fb74c-5gpqp                    1/1     Running     0          10h
kubevirt                           virt-handler-c2lqr                                  1/1     Running     0          10h
kubevirt                           virt-operator-57b5955545-rkg9q                      1/1     Running     0          10h
rook-ceph                          csi-rbdplugin-provisioner-7dfb48857f-h9vnr          6/6     Running     0          10h
rook-ceph                          csi-rbdplugin-tfdr9                                 3/3     Running     0          10h
rook-ceph                          rook-ceph-crashcollector-u22-test-bdc985c77-nkbvz   1/1     Running     0          10h
rook-ceph                          rook-ceph-mgr-a-6df86f8f9c-kpwxn                    1/1     Running     0          10h
rook-ceph                          rook-ceph-mon-a-546576477f-ds8hh                    1/1     Running     0          10h
rook-ceph                          rook-ceph-operator-5fdc669785-7mlfj                 1/1     Running     0          10h
rook-ceph                          rook-ceph-osd-0-688d4c869-lfnhc                     1/1     Running     0          9h
rook-ceph                          rook-ceph-osd-prepare-u22-test-tm4d7                0/1     Completed   0          9h
rook-ceph                          rook-ceph-tools-6c55fbd449-mpr4k                    1/1     Running     0          10h
rook-ceph                          rook-discover-6tthg                                 1/1     Running     0          10h
rook-ceph                          snapshot-controller-0                               1/1     Running     0          10h
```
