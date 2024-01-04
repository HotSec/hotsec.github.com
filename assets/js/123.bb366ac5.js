(window.webpackJsonp=window.webpackJsonp||[]).push([[123],{534:function(e,l,n){"use strict";n.r(l);var t=n(56),r=Object(t.a)({},(function(){var e=this,l=e.$createElement,n=e._self._c||l;return n("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[n("h1",{attrs:{id:"负载均衡"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#负载均衡"}},[e._v("#")]),e._v(" 负载均衡")]),e._v(" "),n("h2",{attrs:{id:"入门"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#入门"}},[e._v("#")]),e._v(" 入门")]),e._v(" "),n("ul",[n("li",[n("p",[e._v("硬件负载均衡")]),e._v(" "),n("ul",[n("li",[e._v("如 F5，性能好，但是贵。一般的互联网公司都没有采集硬件负载均衡")])])]),e._v(" "),n("li",[n("p",[e._v("软件负载均衡")]),e._v(" "),n("ul",[n("li",[e._v("4 层：典型的如 LVS")]),e._v(" "),n("li",[e._v("7 层：典型的如 Nginx、HAProxy\n"),n("ul",[n("li",[e._v("目前这两个都可以实现 4 层，但是更多的还是使用 Nginx 的 7 层功能。")])])])])]),e._v(" "),n("li",[n("p",[e._v("典型的负载均衡方案")]),e._v(" "),n("ul",[n("li",[e._v("client -> LVS(4 层) -> Nginx(7层) -> server\n"),n("ul",[n("li",[e._v("nginx upstream")])])])])]),e._v(" "),n("li",[n("p",[e._v("k8s负载均衡")]),e._v(" "),n("ul",[n("li",[e._v("kube-proxy 集群内置的内部负载均衡解决方案")]),e._v(" "),n("li",[e._v("nginx-ingress-controller方案")]),e._v(" "),n("li",[e._v("云厂商Cloud provider")]),e._v(" "),n("li",[e._v("自建lb方案")])])])]),e._v(" "),n("h3",{attrs:{id:"nginx-controller"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#nginx-controller"}},[e._v("#")]),e._v(" Nginx-Controller")]),e._v(" "),n("ul",[n("li",[e._v("Nginx-Controller 就是来动态发现 Pod，然后渲染为 nginx 的 upstream；Nginx-Controller 就是一个 Nginx 再加上一个 Controller（发现 Pod 并渲染为 upstream）。")]),e._v(" "),n("li",[e._v("client -> CDN -> LVS -> Nginx-Ingress-Controller -> Pod")])]),e._v(" "),n("p",[e._v("nginx-ingress的大概流程")]),e._v(" "),n("ul",[n("li",[e._v("初始化\n"),n("ul",[n("li",[e._v("初始化任务队列，n.syncIngress为任务Handler")]),e._v(" "),n("li",[e._v("监控nginx.tmpl模板文件的变化")]),e._v(" "),n("li",[e._v("创建新任务用来重新生成nginx.conf")])])]),e._v(" "),n("li",[e._v("启动\n"),n("ul",[n("li",[e._v("通过Informer机制同步并监测k8s资源的变化")]),e._v(" "),n("li",[e._v("给nginx进程设置单独的pgid，防止收到发给controller进程的SIGTERM信号而退出。")]),e._v(" "),n("li",[e._v("启动nginx进程")]),e._v(" "),n("li",[e._v("启动任务队列：用来处理List/Watch后的资源")]),e._v(" "),n("li",[e._v("初次启动，需要触发一起配置文件同步")]),e._v(" "),n("li",[e._v("发生错误时，临时文件暂存5分钟")])])]),e._v(" "),n("li",[e._v("资源监控\n"),n("ul",[n("li",[e._v("控制器监听了Ingress、IngressClass、Endpoint、Secret、ConfigMap、Service 六种资源。")]),e._v(" "),n("li",[e._v("定义各个资源变化的处理函数：这些处理函数实际就是解析各个资源信息，然后更新nginx配置信息")]),e._v(" "),n("li",[e._v("监听到资源变化后生成Event并通过updateCh通道发送出去。")])])]),e._v(" "),n("li",[e._v("配置更新\n"),n("ul",[n("li",[e._v("从缓存中获取Ingresses")]),e._v(" "),n("li",[e._v("解析ingress")]),e._v(" "),n("li",[e._v("同当前运行的配置作比对判断配置是否有改变")]),e._v(" "),n("li",[e._v("有改变则进行如下动作")]),e._v(" "),n("li",[e._v("判断是否能够通过lua动态更新")]),e._v(" "),n("li",[e._v("不能通过lua动态更新，则生成新的nginx.conf并eload")]),e._v(" "),n("li",[e._v("通过lua动态更新配置")])])])]),e._v(" "),n("h4",{attrs:{id:"为什么需要动态更新呢"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#为什么需要动态更新呢"}},[e._v("#")]),e._v(" 为什么需要动态更新呢？")]),e._v(" "),n("ul",[n("li",[e._v("因为在一个kubernetes集群里service的endpoints可能会频率变动，如果都静态写进nginx.conf配置文件就意味着每次endpoints变动都要nginx -s reload 重新加载配置文件，在高并发下可能会导致某些请求时延变长，所以就需要借助lua-nginx-module使用lua来动态更新upstream上游节点。")])]),e._v(" "),n("h3",{attrs:{id:"traefik"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#traefik"}},[e._v("#")]),e._v(" traefik")]),e._v(" "),n("p",[e._v("K3s 中启用 Traefik Dashboard")]),e._v(" "),n("p",[n("code",[e._v('kubectl -n kube-system port-forward $(kubectl -n kube-system get pods --selector "app.kubernetes.io/name=traefik" --output=name) 9000:9000 --address 0.0.0.0')])]),e._v(" "),n("p",[n("code",[e._v("http://192.168.1.21:9000/dashboard/#/")])]),e._v(" "),n("h2",{attrs:{id:"参考"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#参考"}},[e._v("#")]),e._v(" 参考")]),e._v(" "),n("blockquote",[n("p",[n("a",{attrs:{href:"https://cloud.tencent.com/developer/article/2314178",target:"_blank",rel:"noopener noreferrer"}},[e._v("https://cloud.tencent.com/developer/article/2314178"),n("OutboundLink")],1)])])])}),[],!1,null,null,null);l.default=r.exports}}]);