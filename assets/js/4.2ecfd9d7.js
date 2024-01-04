(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{406:function(a,s,_){a.exports=_.p+"assets/img/dockersec_2022-10-09-16-16-35.1d3ee4e1.png"},407:function(a,s,_){a.exports=_.p+"assets/img/dockersec_2022-10-09-16-44-50.57c5ed73.png"},408:function(a,s,_){a.exports=_.p+"assets/img/1691402429679.e1417fa1.png"},538:function(a,s,_){"use strict";_.r(s);var v=_(56),t=Object(v.a)({},(function(){var a=this,s=a.$createElement,v=a._self._c||s;return v("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[v("h1",{attrs:{id:"k8s集群安全"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#k8s集群安全"}},[a._v("#")]),a._v(" K8S集群安全")]),a._v(" "),v("h2",{attrs:{id:"攻击面"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#攻击面"}},[a._v("#")]),a._v(" 攻击面")]),a._v(" "),v("p",[v("img",{attrs:{src:_(406),alt:"攻击面"}})]),a._v(" "),v("p",[v("img",{attrs:{src:_(407),alt:"攻击点"}})]),a._v(" "),v("p",[v("img",{attrs:{src:_(408),alt:"渗透路线图"}})]),a._v(" "),v("ul",[v("li",[v("p",[a._v("镜像相关")]),a._v(" "),v("ul",[v("li",[a._v("容器镜像")]),a._v(" "),v("li",[a._v("镜像仓库")])])]),a._v(" "),v("li",[v("p",[a._v("K8S组件相关：")]),a._v(" "),v("ul",[v("li",[a._v("API Server")]),a._v(" "),v("li",[a._v("Controller Manager")]),a._v(" "),v("li",[a._v("Etcd")]),a._v(" "),v("li",[a._v("Kubelet")]),a._v(" "),v("li",[a._v("Kube-proxy")])])]),a._v(" "),v("li",[v("p",[a._v("运行时安全：")]),a._v(" "),v("ul",[v("li",[a._v("Pod内攻击")]),a._v(" "),v("li",[a._v("容器逃逸")])])]),a._v(" "),v("li",[v("p",[a._v("第三方组件")]),a._v(" "),v("ul",[v("li",[a._v("APISIX")]),a._v(" "),v("li",[a._v("Istio")]),a._v(" "),v("li",[a._v("...")])])])]),a._v(" "),v("h2",{attrs:{id:"攻击k8s组件"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#攻击k8s组件"}},[a._v("#")]),a._v(" 攻击k8s组件")]),a._v(" "),v("ul",[v("li",[a._v("api server 8080/6443")]),a._v(" "),v("li",[a._v("dashboard 8001")]),a._v(" "),v("li",[a._v("kubelet 10250/10255")]),a._v(" "),v("li",[a._v("etcd  2379")]),a._v(" "),v("li",[a._v("kube-proxy 8001")]),a._v(" "),v("li",[a._v("dockerd 2375")]),a._v(" "),v("li",[a._v("kube-scheduler 10251")]),a._v(" "),v("li",[a._v("kube-controller-manager 10252")]),a._v(" "),v("li",[a._v("未授权访问、弱口令、不安全配置等")])]),a._v(" "),v("h2",{attrs:{id:"攻击节点对外服务"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#攻击节点对外服务"}},[a._v("#")]),a._v(" 攻击节点对外服务")]),a._v(" "),v("ul",[v("li",[a._v("除了正常的对外业务，可能还会有一些“隐藏”的对外开放服务，这些服务本不该暴露在外网，这种情况或是管理员疏忽所致，亦或是为了方便管理而故意留的一些接口，总之也是一个潜在的攻击点。")])]),a._v(" "),v("p",[v("img",{attrs:{src:"dockersec_images/dockersec_2022-10-09-17-36-37.png",alt:""}})]),a._v(" "),v("h2",{attrs:{id:"攻击业务-pod"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#攻击业务-pod"}},[a._v("#")]),a._v(" 攻击业务 pod")]),a._v(" "),v("p",[a._v("在云原生环境下，上层应用程序对攻击者来说就像是集群的一个个入口，攻击应用程序的目标就是突破入口，拿到业务环境也就是业务所在 pod 的 shell。")]),a._v(" "),v("h3",{attrs:{id:"信息收集"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#信息收集"}},[a._v("#")]),a._v(" 信息收集")]),a._v(" "),v("ul",[v("li",[v("p",[v("strong",[a._v("搜集环境信息，")]),a._v(" 为后续攻击做准备")]),a._v(" "),v("ul",[v("li",[a._v("OS、Kernel、User 基本信息")]),a._v(" "),v("li",[a._v("可用的 Capabilities")]),a._v(" "),v("li",[a._v("可用的 Linux 命令")]),a._v(" "),v("li",[a._v("挂载情况")]),a._v(" "),v("li",[a._v("网络情况")]),a._v(" "),v("li",[a._v("云厂商的 metadata API 信息")])])]),a._v(" "),v("li",[v("p",[v("strong",[a._v("敏感服务发现和敏感信息扫描")])]),a._v(" "),v("ul",[v("li",[a._v("扫描内网指定网段的端口")]),a._v(" "),v("li",[a._v("K8S组件的端口")]),a._v(" "),v("li",[a._v("ssh：22")]),a._v(" "),v("li",[a._v("http：80/8080")]),a._v(" "),v("li",[a._v("https：443/8443")]),a._v(" "),v("li",[a._v("mysql：3306")]),a._v(" "),v("li",[a._v("cAdvisor：4194")]),a._v(" "),v("li",[a._v("nodeport-service：30000-32767")]),a._v(" "),v("li",[a._v("...")])])])]),a._v(" "),v("h3",{attrs:{id:"提权"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#提权"}},[a._v("#")]),a._v(" 提权")]),a._v(" "),v("ul",[v("li",[a._v("Pod内提权\n"),v("ul",[v("li",[a._v("内核漏洞提权")]),a._v(" "),v("li",[a._v("sudo 提权")]),a._v(" "),v("li",[a._v("suid 提权")]),a._v(" "),v("li",[a._v("cronjob提权")]),a._v(" "),v("li",[a._v("...")])])]),a._v(" "),v("li",[a._v("k8s提权\n"),v("ul",[v("li",[a._v("RBAC提权")]),a._v(" "),v("li",[a._v("CVE-2018-1002105")]),a._v(" "),v("li",[a._v("CVE-2020-8559")]),a._v(" "),v("li",[a._v("...")])])])]),a._v(" "),v("h3",{attrs:{id:"拒绝服务"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#拒绝服务"}},[a._v("#")]),a._v(" 拒绝服务")]),a._v(" "),v("p",[a._v("拒绝服务（Denial of Service，DOS）攻击可以从三个层面来看：业务、pod、集群。")]),a._v(" "),v("p",[a._v("对业务和 pod 的 DOS 攻击可以通过使用一些压力测试工具或方法进行，主要可从 CPU、内存、存储、网络等方面进行资源耗尽型攻击。在集群外部或 pod 内都有相应的工具或方法，读者可自行搜索。")]),a._v(" "),v("p",[a._v("在集群层面的 DOS 攻击主要可以利用 K8S 集群的软件漏洞，如 CVE-2019-11253、CVE-2019-9512、CVE-2019-9514 等。")]),a._v(" "),v("h2",{attrs:{id:"容器逃逸"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#容器逃逸"}},[a._v("#")]),a._v(" 容器逃逸")]),a._v(" "),v("h3",{attrs:{id:"不安全的配置"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#不安全的配置"}},[a._v("#")]),a._v(" 不安全的配置")]),a._v(" "),v("h4",{attrs:{id:"危险的权限"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#危险的权限"}},[a._v("#")]),a._v(" 危险的权限")]),a._v(" "),v("ul",[v("li",[a._v("特权容器  privileged权限")]),a._v(" "),v("li",[a._v("cap_sys_admin")]),a._v(" "),v("li",[a._v("cap_dac_read_search")]),a._v(" "),v("li",[a._v("cap_sys_module")]),a._v(" "),v("li",[a._v("cap_sys_ptrace && --pid=host")])]),a._v(" "),v("h4",{attrs:{id:"挂载危险目录"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#挂载危险目录"}},[a._v("#")]),a._v(" 挂载危险目录")]),a._v(" "),v("ul",[v("li",[a._v("docker.sock")]),a._v(" "),v("li",[a._v("挂载procfs")]),a._v(" "),v("li",[a._v("挂载/、/root、/etc等文件目录")]),a._v(" "),v("li",[a._v("以rw方式挂载lxcfs")]),a._v(" "),v("li",[a._v("pod挂载/var/log")])]),a._v(" "),v("h3",{attrs:{id:"相关组件漏洞"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#相关组件漏洞"}},[a._v("#")]),a._v(" 相关组件漏洞")]),a._v(" "),v("ul",[v("li",[a._v("runc\n"),v("ul",[v("li",[a._v("CVE-2019-5736")]),a._v(" "),v("li",[a._v("CVE-2019-16884")]),a._v(" "),v("li",[a._v("CVE-2021-30465")])])]),a._v(" "),v("li",[a._v("containerd\n"),v("ul",[v("li",[a._v("CVE-2020-15257")]),a._v(" "),v("li",[a._v("CVE-2022-23648")])])]),a._v(" "),v("li",[a._v("CRI-O\n"),v("ul",[v("li",[a._v("CVE-2022-0811")])])]),a._v(" "),v("li",[a._v("docker\n"),v("ul",[v("li",[a._v("CVE-2018-15664")]),a._v(" "),v("li",[a._v("CVE-2019-14271")])])]),a._v(" "),v("li",[a._v("kubectl\n"),v("ul",[v("li",[a._v("CVE-2018-1002100")]),a._v(" "),v("li",[a._v("CVE-2019-1002101")]),a._v(" "),v("li",[a._v("CVE-2019-11246")]),a._v(" "),v("li",[a._v("CVE-2019-11249")]),a._v(" "),v("li",[a._v("CVE-2019-11251")])])]),a._v(" "),v("li",[a._v("kubelet\n"),v("ul",[v("li",[a._v("CVE-2017-1002101")]),a._v(" "),v("li",[a._v("CVE-2021-25741")])])])]),a._v(" "),v("h3",{attrs:{id:"内核漏洞"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#内核漏洞"}},[a._v("#")]),a._v(" 内核漏洞")]),a._v(" "),v("ul",[v("li",[a._v("CVE-2016-5195")]),a._v(" "),v("li",[a._v("CVE-2017-1000112")]),a._v(" "),v("li",[a._v("CVE-2017-7308")]),a._v(" "),v("li",[a._v("CVE-2020-14386")]),a._v(" "),v("li",[a._v("CVE-2021-22555")]),a._v(" "),v("li",[a._v("CVE-2022-0185")]),a._v(" "),v("li",[a._v("CVE-2022-0492")]),a._v(" "),v("li",[a._v("CVE-2022-0847")])]),a._v(" "),v("h2",{attrs:{id:"横向攻击"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#横向攻击"}},[a._v("#")]),a._v(" 横向攻击")]),a._v(" "),v("h3",{attrs:{id:"攻击其他服务"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#攻击其他服务"}},[a._v("#")]),a._v(" 攻击其他服务")]),a._v(" "),v("p",[a._v("集群中往往会有一些通过 ClusterIP 暴露在内部的 Service，这些服务在集群外部是扫描不到的，但是在内部pod中通过前文提到的信息搜集方法就有可能发现一些敏感服务，比如通过扫描端口或查看环境变量等。")]),a._v(" "),v("h3",{attrs:{id:"攻击api-server"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#攻击api-server"}},[a._v("#")]),a._v(" 攻击API Server")]),a._v(" "),v("p",[a._v("K8S集群的 pod 和 API Server 通信是通过 ServiceAccount 的 token 验证身份的，这里存在一个攻击点就是如果 pod 的 ServiceAccount 权限过大，便可以以高权限和 API Server 通信，则有可能查看集群的一些敏感信息或者执行高权限操作，甚至进一步控制集群。")]),a._v(" "),v("p",[a._v("ken 默认保存在 pod的 /run/secrets/kubernetes.io/serviceaccount/token 文件，在实际攻击中，API Server 的地址一般可以在 pod 内通过环境变量直接查看")]),a._v(" "),v("p",[a._v("说到内网 ip 地址，另外补充一下，如果要在 pod 内攻击当前节点的 kubelet，ip 地址一般可以直接用 docker0 网桥的 ip：172.17.0.1")]),a._v(" "),v("h3",{attrs:{id:"中间人攻击"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#中间人攻击"}},[a._v("#")]),a._v(" 中间人攻击")]),a._v(" "),v("p",[a._v("中间人攻击是一种经典的攻击方式，我们知道在 K8S 集群中 pod 之间也需要通过网络插件如 Flannel、Calico 和 Cilium 等实现网络通信，那么 K8S 集群内部的网络通信有没有可能存在中间人攻击呢？答案是有可能的。")]),a._v(" "),v("p",[a._v("在默认配置下的 K8S 集群中，如果攻击者拿到了某个 pod 的权限，接下来就有可能通过中间人攻击，对其他 pod 实现 DNS 劫持[1]。")]),a._v(" "),v("ul",[v("li",[a._v("DNS劫持")]),a._v(" "),v("li",[a._v("CVE-2020-8554")]),a._v(" "),v("li",[a._v("CVE-2020-10749")])]),a._v(" "),v("h2",{attrs:{id:"攻击-k8s-管理平台"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#攻击-k8s-管理平台"}},[a._v("#")]),a._v(" 攻击 K8S 管理平台")]),a._v(" "),v("p",[a._v("Rancher、KubeSphere、KubeOperator")]),a._v(" "),v("p",[a._v("Dashboard未授权访问、弱口令登录")]),a._v(" "),v("p",[a._v("若通过弱口令成功登录到管理后台，后续和Dashboard 未授权一样，可以通过创建特权容器然后逃逸。")]),a._v(" "),v("h2",{attrs:{id:"镜像仓库安全"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#镜像仓库安全"}},[a._v("#")]),a._v(" 镜像仓库安全")]),a._v(" "),v("h2",{attrs:{id:"容器镜像安全"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#容器镜像安全"}},[a._v("#")]),a._v(" 容器镜像安全")]),a._v(" "),v("h3",{attrs:{id:"上传恶意镜像"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#上传恶意镜像"}},[a._v("#")]),a._v(" 上传恶意镜像")]),a._v(" "),v("ul",[v("li",[a._v("恶意后门镜像")]),a._v(" "),v("li",[a._v("恶意EXP镜像")])]),a._v(" "),v("h3",{attrs:{id:"利用-nday-攻击镜像库"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#利用-nday-攻击镜像库"}},[a._v("#")]),a._v(" 利用 Nday 攻击镜像库")]),a._v(" "),v("ul",[v("li",[a._v("Harbor")])]),a._v(" "),v("p",[v("img",{attrs:{src:"dockersec_images/dockersec_2022-10-09-17-12-57.png",alt:""}})]),a._v(" "),v("ul",[v("li",[a._v("Nexus")])]),a._v(" "),v("h2",{attrs:{id:"攻击第三方组件"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#攻击第三方组件"}},[a._v("#")]),a._v(" 攻击第三方组件")]),a._v(" "),v("p",[a._v("K8S 生态中还会使用一些第三方组件，比如服务网格、API 网关等，这些组件也有可能存在漏洞，比如开源 API 网关 Apache APISIX 的 RCE 漏洞、服务网格Istio 的未授权访问或 RCE 漏洞等")]),a._v(" "),v("h3",{attrs:{id:"apache-apisix"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#apache-apisix"}},[a._v("#")]),a._v(" Apache APISIX")]),a._v(" "),v("h3",{attrs:{id:"istio"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#istio"}},[a._v("#")]),a._v(" Istio")]),a._v(" "),v("h3",{attrs:{id:"更多"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#更多"}},[a._v("#")]),a._v(" 更多")]),a._v(" "),v("h2",{attrs:{id:"容器安全机制"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#容器安全机制"}},[a._v("#")]),a._v(" 容器安全机制")]),a._v(" "),v("h3",{attrs:{id:"seccomp"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#seccomp"}},[a._v("#")]),a._v(" Seccomp")]),a._v(" "),v("div",{staticClass:"language- line-numbers-mode"},[v("pre",{pre:!0,attrs:{class:"language-text"}},[v("code",[a._v("seccomp 是 Linux kernel 从2.6.23版本引入的一种简洁的 sandboxing 机制。\n\nseccomp安全机制能使一个进程进入到一种“安全”运行模式，该模式下的进程只能\n调用4种系统调用（system call），即 read(), write(), exit() 和 sigreturn()\n，否则进程便会被终止。\n\nSeccomp 简单来说就是一个白名单，每个进程进行系统调用的时候，内核都会检\n查对应的白名单来确认该进程是否有权限使用这个系统调用。\n")])]),a._v(" "),v("div",{staticClass:"line-numbers-wrapper"},[v("span",{staticClass:"line-number"},[a._v("1")]),v("br"),v("span",{staticClass:"line-number"},[a._v("2")]),v("br"),v("span",{staticClass:"line-number"},[a._v("3")]),v("br"),v("span",{staticClass:"line-number"},[a._v("4")]),v("br"),v("span",{staticClass:"line-number"},[a._v("5")]),v("br"),v("span",{staticClass:"line-number"},[a._v("6")]),v("br"),v("span",{staticClass:"line-number"},[a._v("7")]),v("br"),v("span",{staticClass:"line-number"},[a._v("8")]),v("br")])]),v("h3",{attrs:{id:"linux-capability"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#linux-capability"}},[a._v("#")]),a._v(" Linux capability")]),a._v(" "),v("div",{staticClass:"language- line-numbers-mode"},[v("pre",{pre:!0,attrs:{class:"language-text"}},[v("code",[a._v("Capability 机制是 Linux 内核 2.2 之后引入的。本质上是将 root \n用户的权限细分为不同的领域，可以分别的启用或者禁用。Docker 默认\n开启了14种capability，对容器内部 root权限进行了一系列限制。\n")])]),a._v(" "),v("div",{staticClass:"line-numbers-wrapper"},[v("span",{staticClass:"line-number"},[a._v("1")]),v("br"),v("span",{staticClass:"line-number"},[a._v("2")]),v("br"),v("span",{staticClass:"line-number"},[a._v("3")]),v("br")])]),v("h3",{attrs:{id:"apparmor"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#apparmor"}},[a._v("#")]),a._v(" Apparmor")]),a._v(" "),v("div",{staticClass:"language- line-numbers-mode"},[v("pre",{pre:!0,attrs:{class:"language-text"}},[v("code",[a._v("AppArmor 是 Linux 内核的一个安全模块，通过它可以指定程序是否\n可以读、写或者运行哪些文件，是否可以打开网络端口等。若可执行文\n件的路径为 /home/ubuntu/run，使用 Apparmor 对其进行访问控制，\n需要在配置文件目录 /etc/apparmor.d 下新建一个名为 home.ubuntu.run \n的文件，若修改 run 的文件名，配置文件将失效。\n")])]),a._v(" "),v("div",{staticClass:"line-numbers-wrapper"},[v("span",{staticClass:"line-number"},[a._v("1")]),v("br"),v("span",{staticClass:"line-number"},[a._v("2")]),v("br"),v("span",{staticClass:"line-number"},[a._v("3")]),v("br"),v("span",{staticClass:"line-number"},[a._v("4")]),v("br"),v("span",{staticClass:"line-number"},[a._v("5")]),v("br")])]),v("h2",{attrs:{id:"docker安全问题与逃逸漏洞复现"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#docker安全问题与逃逸漏洞复现"}},[a._v("#")]),a._v(" Docker安全问题与逃逸漏洞复现")]),a._v(" "),v("p",[a._v("Linux内核漏洞")]),a._v(" "),v("h2",{attrs:{id:"k8s安全问题与漏洞复现"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#k8s安全问题与漏洞复现"}},[a._v("#")]),a._v(" K8s安全问题与漏洞复现")]),a._v(" "),v("h2",{attrs:{id:"参考资料"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#参考资料"}},[a._v("#")]),a._v(" 参考资料")]),a._v(" "),v("blockquote",[v("p",[a._v("《K8s安全防护指导框架》")])]),a._v(" "),v("blockquote",[v("p",[a._v("https://mp.weixin.qq.com/s?__biz=MzI4NjE2NjgxMQ==&mid=2650263324&idx=1&sn=d5ee820ae70b919fbabc34049780950b&chksm=f3e27568c495fc7edf1a793cbf69a5f5c45378bf06455cc7834ecc9c57862763ddee5f718101&cur_album_id=1622333865832808452&scene=189#wechat_redirect")])]),a._v(" "),v("blockquote",[v("p",[a._v("https://mp.weixin.qq.com/s?__biz=MzI4NjE2NjgxMQ==&mid=2650263626&idx=1&sn=d3c5640d5999dcc06e8607b5642da79a&chksm=f3e26a3ec495e328cd7212d3521a3e6aa1796ea34cb0c58a05d2741decad01f8e566000247eb&cur_album_id=1622333865832808452&scene=189#wechat_redirect")])]),a._v(" "),v("blockquote",[v("p",[a._v("https://mp.weixin.qq.com/s/dcCPx0ETiT2QlRTS1ToVAw")])]),a._v(" "),v("blockquote",[v("p",[v("a",{attrs:{href:"https://mp.weixin.qq.com/s/WaRECg79Nxx08iekakrlMA",target:"_blank",rel:"noopener noreferrer"}},[a._v("容器环境红队手法总结 https://mp.weixin.qq.com/s/WaRECg79Nxx08iekakrlMA"),v("OutboundLink")],1)])])])}),[],!1,null,null,null);s.default=t.exports}}]);