# 计划：添加新知识点

## 一、新知识点归属分析

根据 ALL.md 的知识体系结构，所有新知识点归属如下：

### 原有10个知识点

| 知识点 | 归属目录 | ALL.md 对应章节 | 说明 |
|--------|----------|----------------|------|
| LVS | `devops/基础设施/` | 7.4 基础设施/网络/负载均衡 | ALL.md 已有"LVS/NAT/DR/TUN"条目 |
| HAProxy | `devops/基础设施/` | 7.4 基础设施/网络/负载均衡 | ALL.md 已有"HAProxy"条目 |
| Keepalived | `devops/基础设施/` | 7.4 基础设施/网络 | 高可用，与 LVS 配合 |
| Nginx | `devops/基础设施/` | 7.4 基础设施/网络/负载均衡 | ALL.md 已有"Nginx Ingress Controller"条目 |
| iptables | `os-linux/` | 7.2 Linux核心/网络工具 | ALL.md 已有"iptables/nftables"条目 |
| netfilter | `os-linux/` | 7.2 Linux核心 | iptables 底层框架 |
| Firewalld | `os-linux/` | 7.2 Linux核心 | iptables 前端管理工具 |
| DenyHosts | `os-linux/` | 7.2 Linux核心 | SSH 防暴力破解 |
| Linux性能优化 | `os-linux/` | 7.2 Linux核心/性能诊断 | ALL.md 已有"性能诊断"条目 |
| ELK | `devops/基础设施/` | 7.4 基础设施/ES集群/监控 | ALL.md 已有"ES集群"条目 |

### 新增知识点

| 知识点 | 归属目录 | ALL.md 对应章节 | 说明 |
|--------|----------|----------------|------|
| K8s核心组件详解 | `devops/kubernetes/` | 7.4 容器与编排/K8s核心概念 | 现有1_K8s核心概念.md 需扩展 |
| K8s持久化存储 | `devops/kubernetes/` | 7.4 容器与编排/K8s核心概念/存储 | 现有文件缺少存储专题 |
| Prometheus监控K8s | `devops/kubernetes/` | 7.4 容器与编排/K8s运维 | 监控是K8s运维核心 |
| Shell编程 | `os-linux/` | 7.2 Linux核心/Shell脚本 | ALL.md 已有"Shell脚本"条目 |
| Puppet | `devops/` | 7.4 DevOps/自动化运维 | 配置管理工具 |
| Ansible | `devops/` | 7.4 DevOps/自动化运维 | ALL.md 已有"Ansible"条目 |
| SaltStack | `devops/` | 7.4 DevOps/自动化运维 | 配置管理工具 |

## 二、现有文件处理

1. **`devops/负载均衡.md`** — 当前内容偏 K8s Nginx Ingress Controller，需拆分：
   - 保留原文件，重命名为 `devops/基础设施/3_负载均衡.md`
   - 将 LVS/HAProxy/Nginx/Keepalived 内容整合到此文件中
2. **`devops/es集群.md`** — 当前内容极简（仅安装命令），ELK Stack 需大幅扩展
3. **`devops/监控.md`** — 当前内容极简（仅 pika monitor），需大幅扩展
4. **`devops/kubernetes/1_K8s核心概念.md`** — 已有架构/工作负载内容，需扩展核心组件详解
5. **`devops/kubernetes/2_K8s实践.md`** — 已有部署策略内容，需扩展存储和监控

## 三、实施步骤

### 步骤1：移动现有文件到规范位置
- `mv devops/负载均衡.md devops/基础设施/3_负载均衡.md`
- `mv devops/es集群.md devops/基础设施/4_ES集群与ELK.md`
- `mv devops/监控.md devops/基础设施/5_监控系统集成.md`

### 步骤2：创建 os-linux 新文件（6个知识点）

#### 2.1 `os-linux/4_iptables与netfilter.md`
内容大纲：
- netfilter 架构：5个钩子点（PREROUTING/INPUT/FORWARD/OUTPUT/POSTROUTING）
- netfilter 表与链：filter/nat/mangle/raw 四表
- iptables 语法：规则/链/表/匹配条件/动作
- iptables 常用规则示例：放行SSH/HTTP、NAT转发、端口映射
- iptables 持久化：iptables-save/iptables-restore
- iptables vs nftables 对比

#### 2.2 `os-linux/5_Firewalld.md`
内容大纲：
- Firewalld 概述：动态防火墙管理工具，iptables 前端
- zone 概念：public/trusted/home/internal/dmz/work/external/block/drop
- 服务与端口管理：firewall-cmd 常用命令
- 富规则（Rich Rules）：复杂规则配置
- 直接规则：--direct 选项直接操作 iptables
- Firewalld vs iptables 对比与选择
- 与 Docker/K8s 的兼容性

#### 2.3 `os-linux/6_DenyHosts与SSH安全.md`
内容大纲：
- SSH 暴力破解原理与危害
- DenyHosts 安装配置与工作原理
- Fail2Ban 作为替代方案（更强大）
- SSH 安全加固最佳实践：密钥认证/禁用root/修改端口/白名单
- 与 iptables/Firewalld 联动

#### 2.4 `os-linux/7_Linux性能优化.md`
内容大纲：
- 性能分析方法论：USE 方法（Utilization/Saturation/Errors）
- CPU 优化：top/vmstat/mpstat/perf/火焰图/上下文切换/运行队列
- 内存优化：free/vmstat/sar/swap/页面缓存/大页内存/OOM Killer
- 磁盘I/O优化：iostat/iotop/调度器(cfq/deadline/noop)/RAID/SSD优化
- 网络优化：ss/netstat/tcpdump/连接数调优/内核参数(sysctl)
- 系统级调优：ulimit/cgroup/NUMA/IRQ 亲和性
- 常用内核参数调优（sysctl.conf）
- 性能优化清单与排查流程

#### 2.5 `os-linux/8_Linux网络工具.md`
内容大纲：
- 网络诊断：ip/ss/ping/traceroute/mtr/nslookup/dig
- 流量分析：tcpdump/wireshark/nethogs/iftop
- 连接管理：nc/curl/telnet
- 网络配置：ip route/bridge/vlan/bonding
- DNS 工具：dig/host/nslookup/resolvectl

#### 2.6 `os-linux/9_Shell编程.md`
内容大纲：
- Shell 基础：变量/字符串/数组/特殊变量（$?/$!/$$/$#/$@）
- 条件判断：test/[/[[/case
- 循环：for/while/until/select/break/continue
- 函数：定义/参数/返回值/局部变量/递归
- 文本处理三剑客：grep/sed/awk 详解与实战
- 重定向与管道：stdin/stdout/stderr/here document/进程替换
- 正则表达式：BRE/ERE/常用模式
- 脚本调试：set -x/-e/-u、trap 信号处理
- 高级技巧：并发执行(xargs/GNU parallel)/临时文件/安全编程
- Shell 编程风格与最佳实践
- 常用脚本模板：日志轮转/备份/健康检查/批量部署

### 步骤3：扩展 K8s 知识点（3个专题）

#### 3.1 扩展 `devops/kubernetes/1_K8s核心概念.md` — 核心组件详解
在现有架构/工作负载内容基础上增加：
- **API Server**：REST API 入口/认证（Token/Cert/Webhook）/授权（RBAC/ABAC）/准入控制（Admission Controller）/etcd 交互/高可用部署
- **etcd**：分布式 KV 存储/RAFT 一致性/数据模型/备份恢复/性能调优/集群运维
- **Scheduler**：调度流程（过滤→打分→绑定）/调度策略（NodeSelector/Affinity/Taint&Toleration/Priority）/自定义调度器/调度框架（Scheduling Framework）
- **Controller Manager**：控制器模式（Informer/Reflector/Indexer）/Deployment Controller/ReplicaSet Controller/Node Controller 工作原理
- **kubelet**：Pod 生命周期管理/CRI 容器运行时接口/PLEG（Pod Lifecycle Event Generator）/探针（Liveness/Readiness/Startup）/资源上报/静态 Pod
- **kube-proxy**：iptables 模式/IPVS 模式/userspace 模式/Service 发现与负载均衡/conntrack 表
- **CoreDNS**：集群内 DNS 解析/Service 发现/自定义 DNS 配置

#### 3.2 新建 `devops/kubernetes/4_K8s持久化存储.md`
内容大纲：
- **存储基础**：Volume 类型（emptyDir/hostPath/nfs/configMap/secret）
- **PV 与 PVC**：生命周期/回收策略（Retain/Delete/Recycle）/容量/访问模式（RWO/ROX/RWX）
- **StorageClass**：动态供给/默认 StorageClass/参数配置/卷扩展
- **CSI（Container Storage Interface）**：架构设计/外部 Provisioner/Attacher/常用 CSI 驱动（Ceph/NFS/Local/Cloud）
- **持久化最佳实践**：StatefulSet + PVC/数据备份策略/存储选型/性能优化
- **常见存储方案**：
  - 本地存储：local-path-provisioner/openebs-local
  - 网络存储：NFS/Ceph RBD/CephFS/GlusterFS
  - 云存储：AWS EBS/Azure Disk/GCE PD/阿里云云盘
  - 分布式存储：Rook-Ceph/Longhorn/Vitastor

#### 3.3 新建 `devops/kubernetes/5_Prometheus监控K8s.md`
内容大纲：
- **Prometheus 架构**：Server/Pushgateway/AlertManager/Exporters/Service Discovery
- **K8s 集成方案**：
  - Prometheus Operator：CRD（Prometheus/ServiceMonitor/PodMonitor/Alertmanager/PrometheusRule）
  - kube-prometheus-stack：完整监控栈部署（Prometheus+Grafana+AlertManager+Node Exporter+kube-state-metrics）
- **监控指标**：
  - 节点指标：CPU/内存/磁盘/网络（node_exporter）
  - Pod 指标：cAdvisor（容器 CPU/内存/网络/文件系统）
  - 集群指标：kube-state-metrics（Deployment 状态/Pod 状态/资源请求与限制）
  - etcd 指标：leader 变更/慢查询/磁盘性能
  - API Server 指标：请求延迟/错误率/etcd 延迟
- **告警规则**：节点宕机/Pod CrashLoopBackOff/资源超限/磁盘满/PVC 即将用尽
- **Grafana 仪表盘**：集群概览/节点详情/Pod 详情/网络/存储
- **自定义监控**：应用埋点（Prometheus client库）/ServiceMonitor 配置
- **长期存储**：Thanos/VictoriaMetrics/Cortex 远程写入方案
- **Helm 部署**：`helm install kube-prometheus-stack`

### 步骤4：创建自动化运维文件（3个知识点）

#### 4.1 新建 `devops/自动化运维/1_Puppet.md`
内容大纲：
- Puppet 概述：声明式配置管理/Agent-Master 架构
- 安装部署：Puppet Server/Puppet Agent/PuppetDB
- 核心概念：Manifest/Module/Class/Resource/Node/Facter
- 资源类型：file/package/service/user/cron/exec/notify
- 模块开发：目录结构（manifests/files/templates/lib）/init.pp/params.pp
- Hiera 数据分离：层次化数据/环境配置/加密数据（eyaml）
- Puppet DSL：变量/条件/循环/模板（ERB/EPP）
- Puppet vs Ansible vs SaltStack 对比

#### 4.2 新建 `devops/自动化运维/2_Ansible.md`
内容大纲：
- Ansible 概述：无 Agent/SSH 推送/声明式 YAML
- 安装与配置：pip/apt/yum/ansible.cfg/hosts 清单
- 核心：Inventory（静态/动态）/Module/Playbook/Role
- 常用模块：ping/shell/command/copy/template/file/yum/apt/service/systemd/user/git/docker_container
- Playbook：任务/变量/条件（when）/循环（loop）/错误处理（block/rescue）/标签/触发器（handler）
- 变量与模板：Jinja2 模板/变量优先级/facts/注册变量/过滤器
- Role：目录结构/依赖/ansible-galaxy/最佳实践
- 高级：Vault 加密/异步任务/策略（strategy）/回调插件/自定义模块
- AWX/Tower：Web 管理界面/作业模板/工作流/RBAC
- 实战：批量部署 Web 服务/滚动更新/配置漂移检测

#### 4.3 新建 `devops/自动化运维/3_SaltStack.md`
内容大纲：
- SaltStack 概述：Agent（minion）+ Master 架构/ZeroMQ 通信/高速执行
- 安装部署：salt-master/salt-minion/salt-syndic
- 核心概念：State/Module/Pillar/Grains/Mine/Runner/Orchestrate
- 目标匹配：glob/PCRE/list/grain/pillar/compound/nodegroup
- State 系统：SLS 文件/require/watch/onchanges/onfail/命名空间
- Pillar 数据：加密变量/环境分离/数据渲染
- Grains：系统信息采集/自定义 Grains
- Jinja 模板：变量/条件/循环/宏/过滤器
- Salt SSH：无 Agent 模式/roster 文件
- Salt API：REST 推送/外部集成
- 实战：批量配置管理/滚动部署/远程执行
- SaltStack vs Ansible vs Puppet 对比

### 步骤5：扩展 devops/基础设施 文件（5个知识点）

#### 5.1 扩展 `devops/基础设施/3_负载均衡.md`
在现有内容基础上增加：
- **LVS 详解**：三种模式（NAT/DR/TUN）原理与对比、IPVS 配置、调度算法（rr/wrr/lc/wlc/sh/dh）、LVS + Keepalived 高可用
- **HAProxy 详解**：安装配置、前端/后端/监听、ACL 规则、负载均衡算法、健康检查、统计页面、四层/七层代理
- **Nginx 详解**：反向代理/负载均衡（upstream）/常用模块/性能调优/安全配置/日志分析/平滑升级
- **Keepalived 详解**：VRRP 协议、安装配置、主备切换、健康检查脚本、与 LVS/HAProxy/Nginx 集成
- 架构选型对比：LVS vs HAProxy vs Nginx

#### 5.2 扩展 `devops/基础设施/4_ES集群与ELK.md`
在现有 ES 集群内容基础上增加：
- **Logstash**：安装配置/输入-过滤-输出/Grok 模式/性能优化/管道配置
- **Kibana**：安装配置/Discover/Visualize/Dashboard/Dev Tools/安全认证
- **ELK 架构实践**：日志采集方案/索引生命周期管理/集群规划/性能调优
- **Filebeat**：轻量日志采集器/模块化配置/与 Logstash/ES 直连
- **替代方案**：EFK（Fluentd）/Loki + Grafana

### 步骤6：更新 ALL.md
在 ALL.md 中补充新增知识点的详细条目：
- 7.2 Linux核心 → 新增 iptables/netfilter/Firewalld/DenyHosts/Linux性能优化/网络工具/Shell编程
- 7.4 容器与编排/K8s → 扩展核心组件/持久化存储/Prometheus监控K8s
- 7.4 基础设施/网络 → 扩展 LVS/HAProxy/Nginx/Keepalived 详细条目
- 7.4 基础设施/ES集群 → 扩展 ELK Stack 条目
- 7.4 DevOps → 新增自动化运维（Puppet/Ansible/SaltStack）

## 四、文件清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 移动 | `devops/负载均衡.md` → `devops/基础设施/3_负载均衡.md` | 规范命名 |
| 移动 | `devops/es集群.md` → `devops/基础设施/4_ES集群与ELK.md` | 合并ELK |
| 移动 | `devops/监控.md` → `devops/基础设施/5_监控系统集成.md` | 规范命名 |
| 新建 | `os-linux/4_iptables与netfilter.md` | iptables + netfilter |
| 新建 | `os-linux/5_Firewalld.md` | Firewalld |
| 新建 | `os-linux/6_DenyHosts与SSH安全.md` | DenyHosts + Fail2Ban |
| 新建 | `os-linux/7_Linux性能优化.md` | Linux 性能优化 |
| 新建 | `os-linux/8_Linux网络工具.md` | Linux 网络诊断工具 |
| 新建 | `os-linux/9_Shell编程.md` | Shell 编程详解 |
| 扩展 | `devops/kubernetes/1_K8s核心概念.md` | +核心组件详解 |
| 新建 | `devops/kubernetes/4_K8s持久化存储.md` | K8s 持久化存储 |
| 新建 | `devops/kubernetes/5_Prometheus监控K8s.md` | Prometheus 监控 K8s |
| 新建 | `devops/自动化运维/1_Puppet.md` | Puppet 配置管理 |
| 新建 | `devops/自动化运维/2_Ansible.md` | Ansible 自动化运维 |
| 新建 | `devops/自动化运维/3_SaltStack.md` | SaltStack 配置管理 |
| 扩展 | `devops/基础设施/3_负载均衡.md` | +LVS/HAProxy/Nginx/Keepalived |
| 扩展 | `devops/基础设施/4_ES集群与ELK.md` | +Logstash/Kibana/Filebeat |
| 更新 | `ALL.md` | 补充所有新知识点条目 |
