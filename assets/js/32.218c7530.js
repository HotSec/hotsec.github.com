(window.webpackJsonp=window.webpackJsonp||[]).push([[32],{439:function(s,t,a){"use strict";a.r(t);var n=a(56),r=Object(n.a)({},(function(){var s=this,t=s.$createElement,a=s._self._c||t;return a("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[a("h1",{attrs:{id:"_1-nse"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-nse"}},[s._v("#")]),s._v(" 1. NSE")]),s._v(" "),a("h2",{attrs:{id:"_1-1-nse脚本运行"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-nse脚本运行"}},[s._v("#")]),s._v(" 1.1. NSE脚本运行")]),s._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[s._v("namap -sC -sV -O scanme.Nmap.org\n\n// -O 检测目标系统的操作系统\n// -sV 检测目标系统上的服务 \n// -sC 用default分类中所有脚本对目标系统进行检测 --script Default\n\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br")])]),a("p",[a("img",{attrs:{src:"nse_sCdefault.png",alt:""}})]),s._v(" "),a("p",[a("img",{attrs:{src:"img/nse_default.png",alt:""}})]),s._v(" "),a("hr"),s._v(" "),a("p",[a("em",[s._v("脚本分类")])]),s._v(" "),a("p",[a("img",{attrs:{src:"img/nse_type.png",alt:""}})]),s._v(" "),a("hr"),s._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[s._v("// 使用http-methods.nse脚本来枚举目标机器上所运行的服务\nnmap -p "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("80,443")]),s._v(" --script http-methods "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".31.1  \n\n// 使用多个分类中的脚本对目标进行扫描\nnmap --script discovery,intrusive "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".31.1\n\n// 使用多个脚本对目标进行扫描\nnmap --script filename1,filename2 "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".31.1 \n\n// 使用除了exploit、intrusive、dos分类以外的脚本对目标进行探测 \nnmap --sV --script "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"not (exploit or dos or intrusive)"')]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".31.1\n\n// 支持通配符*\nnmap --script "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"snmp-*"')]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".31.1\n\n// intrusive分类以外的 ftp-* 的脚本\nnmap --script "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"ftp-* and not (intrusive)"')]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".31.1\n\n// 使用的时候传递参数\nnmap -p "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("80")]),s._v(" --script http-methods --script-args http.useragent"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Mozilla 42"')]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".31.1\n\n// 从文件中载入脚本参数\nnmap --script http-methods --script-args-file myargs.txt "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".31.1\n\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br"),a("span",{staticClass:"line-number"},[s._v("12")]),a("br"),a("span",{staticClass:"line-number"},[s._v("13")]),a("br"),a("span",{staticClass:"line-number"},[s._v("14")]),a("br"),a("span",{staticClass:"line-number"},[s._v("15")]),a("br"),a("span",{staticClass:"line-number"},[s._v("16")]),a("br"),a("span",{staticClass:"line-number"},[s._v("17")]),a("br"),a("span",{staticClass:"line-number"},[s._v("18")]),a("br"),a("span",{staticClass:"line-number"},[s._v("19")]),a("br"),a("span",{staticClass:"line-number"},[s._v("20")]),a("br"),a("span",{staticClass:"line-number"},[s._v("21")]),a("br"),a("span",{staticClass:"line-number"},[s._v("22")]),a("br"),a("span",{staticClass:"line-number"},[s._v("23")]),a("br"),a("span",{staticClass:"line-number"},[s._v("24")]),a("br")])]),a("p",[a("img",{attrs:{src:"img/nse_myargs.txt.png",alt:""}})]),s._v(" "),a("p",[s._v("// 可以查看脚本所发送的payload"),a("br"),s._v(" "),a("code",[s._v("namp --script http-methods --script-trace 192.168.31.1")])]),s._v(" "),a("p",[a("img",{attrs:{src:"img/nse_script-trace.png",alt:""}})]),s._v(" "),a("p",[s._v("// 使用调试模式  -d[1-9] 数字越大，输出要详细")]),s._v(" "),a("p",[a("img",{attrs:{src:"img/nse_d9.png",alt:""}})]),s._v(" "),a("p",[s._v("// 使用 --packet-trace 可以查看所有发送和收到的包")]),s._v(" "),a("p",[a("code",[s._v("namp --script http-methods --packet-trace 192.168.31.1")])]),s._v(" "),a("p",[a("img",{attrs:{src:"img/nse_packettrace.png",alt:""}})]),s._v(" "),a("h2",{attrs:{id:"_1-2-nse-code基础"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-nse-code基础"}},[s._v("#")]),s._v(" 1.2. NSE code基础")]),s._v(" "),a("h3",{attrs:{id:"_1-2-1-开发环境"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-1-开发环境"}},[s._v("#")]),s._v(" 1.2.1. 开发环境")]),s._v(" "),a("p",[s._v("Halcyon 比较合适，当然用记事本也可以")]),s._v(" "),a("p",[s._v("Halcyon ide是java写的，首先要保证电脑上的java环境是ok的")]),s._v(" "),a("p",[s._v("官网地址： "),a("code",[s._v("https://halcyon-ide.org/")])]),s._v(" "),a("p",[s._v("下载完成后，执行")]),s._v(" "),a("p",[a("code",[s._v("java -jar Halcyon_IDE_v2.0.1jar")])]),s._v(" "),a("p",[s._v("一般会弹出这个框")]),s._v(" "),a("p",[a("img",{attrs:{src:"img/halcyon_config.png",alt:""}})]),s._v(" "),a("p",[s._v("点是，然后进入下一步")]),s._v(" "),a("p",[a("img",{attrs:{src:"img/nse_configure.png",alt:""}})]),s._v(" "),a("p",[s._v("设置好相关的路径， 然后点击Apply进行下一步")]),s._v(" "),a("p",[a("img",{attrs:{src:"img/halcyon_restart.png",alt:""}})]),s._v(" "),a("p",[s._v("点是，重启。")]),s._v(" "),a("p",[a("img",{attrs:{src:"img/halcyon_new.png",alt:""}})]),s._v(" "),a("p",[s._v("new一个新项目，")]),s._v(" "),a("p",[a("img",{attrs:{src:"img/halcyon_new_set.png",alt:""}})]),s._v(" "),a("p",[s._v("然后就生成了一个默认的脚本文件")]),s._v(" "),a("p",[a("img",{attrs:{src:"img/nse_default_code.png",alt:""}})]),s._v(" "),a("p",[s._v("保存，将脚本放在默认的nmap安装目录的scripts文件夹中，更新\n(点Export Script 默认会更新，其实也就是执行 nmap --script-updatedb )\n"),a("img",{attrs:{src:"img/nse_333.png",alt:""}})]),s._v(" "),a("p",[a("img",{attrs:{src:"img/nse_rule.png",alt:""}})]),s._v(" "),a("p",[s._v("来一个hello world!")]),s._v(" "),a("p",[s._v("目标机器上开放的80端口运行着HTTP服务的时候，执行action, 也就是打印个 This is WebServer!")]),s._v(" "),a("p",[a("img",{attrs:{src:"img/nse_one.png",alt:""}})]),s._v(" "),a("p",[s._v("然后直接运行 Project -> Run")]),s._v(" "),a("p",[a("img",{attrs:{src:"img/run_one.png",alt:""}})]),s._v(" "),a("p",[s._v("当然直接在namp里跑也没有问题")]),s._v(" "),a("p",[a("img",{attrs:{src:"img/nmap_one_run.png",alt:""}})]),s._v(" "),a("h2",{attrs:{id:"_1-3-nse实例-smtp-strangeport-nse"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-3-nse实例-smtp-strangeport-nse"}},[s._v("#")]),s._v(" 1.3. nse实例：smtp-strangeport.nse")]),s._v(" "),a("p",[s._v("stmp-strangeport.nse 是一个简单的nse实例，实现的功能是 对目标主机的端口进行检测，查看是否有异常端口开放了SMTP服务（其实就是端口号不等于25、465、587），最后输出异常的端口。")]),s._v(" "),a("div",{staticClass:"language-lua line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-lua"}},[a("code",[s._v("description "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("[[\nChecks if SMTP is running on a non-standard port.\n\nThis may indicate that crackers or script kiddies have set up a backdoor on the\nsystem to send spam or control the machine.\n]]")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("---")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("-- @output")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("-- 22/tcp  open   smtp")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("-- |_ smtp-strangeport: Mail server on unusual port: possible malware")]),s._v("\n\nauthor "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Diman Todorov"')]),s._v("\n\nlicense "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Same as Nmap--See https://nmap.org/book/man-legal.html"')]),s._v("\n\ncategories "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"malware"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"safe"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\nportrule "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("function")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("host"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" port"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" port"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("service "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("==")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"smtp"')]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("and")]),s._v("\n    port"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("number "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("~=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("25")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("and")]),s._v(" port"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("number "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("~=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("465")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("and")]),s._v(" port"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("number "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("~=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("587")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("and")]),s._v(" port"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("protocol "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("==")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"tcp"')]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("and")]),s._v(" port"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("state "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("==")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"open"')]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("end")]),s._v("\n\naction "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("function")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Mail server on unusual port: possible malware"')]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("end")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br"),a("span",{staticClass:"line-number"},[s._v("12")]),a("br"),a("span",{staticClass:"line-number"},[s._v("13")]),a("br"),a("span",{staticClass:"line-number"},[s._v("14")]),a("br"),a("span",{staticClass:"line-number"},[s._v("15")]),a("br"),a("span",{staticClass:"line-number"},[s._v("16")]),a("br"),a("span",{staticClass:"line-number"},[s._v("17")]),a("br"),a("span",{staticClass:"line-number"},[s._v("18")]),a("br"),a("span",{staticClass:"line-number"},[s._v("19")]),a("br"),a("span",{staticClass:"line-number"},[s._v("20")]),a("br"),a("span",{staticClass:"line-number"},[s._v("21")]),a("br"),a("span",{staticClass:"line-number"},[s._v("22")]),a("br"),a("span",{staticClass:"line-number"},[s._v("23")]),a("br"),a("span",{staticClass:"line-number"},[s._v("24")]),a("br"),a("span",{staticClass:"line-number"},[s._v("25")]),a("br"),a("span",{staticClass:"line-number"},[s._v("26")]),a("br"),a("span",{staticClass:"line-number"},[s._v("27")]),a("br"),a("span",{staticClass:"line-number"},[s._v("28")]),a("br")])]),a("h2",{attrs:{id:"_1-4-nse中的api"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-4-nse中的api"}},[s._v("#")]),s._v(" 1.4. NSE中的API")]),s._v(" "),a("p",[s._v("进行NSE开发的时，可以充分利用Nmap扫描网络时获得的关于主机和端口的信息。 NSE中的API就是连接脚本与扫描结果之间的桥梁。")]),s._v(" "),a("h3",{attrs:{id:"_1-4-1-nmap-api"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-4-1-nmap-api"}},[s._v("#")]),s._v(" 1.4.1. Nmap API")]),s._v(" "),a("p",[s._v("Nmap中API的核心功能就是向脚本提供关于主机和端口的信息。")]),s._v(" "),a("p",[s._v("Nmap中的引擎会向脚本传递如下两个Lua table类型的参数：\n- "),a("em",[s._v("host table")]),s._v("\n- "),a("em",[s._v("port table")])]),s._v(" "),a("p",[s._v("可以用以下脚本来测试host 以及 port的值, line 17  "),a("code",[s._v("return host")]),s._v(" 或者 "),a("code",[s._v("retrun port")]),s._v(" "),a("img",{attrs:{src:"img/test_host_port.png",alt:""}})]),s._v(" "),a("h4",{attrs:{id:"_1-4-1-1-host-table"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-4-1-1-host-table"}},[s._v("#")]),s._v(" 1.4.1.1. host table")]),s._v(" "),a("ol",[a("li",[s._v("host.os")]),s._v(" "),a("li",[s._v("host.ip")]),s._v(" "),a("li",[s._v("host.name")]),s._v(" "),a("li",[s._v("host.targetname")]),s._v(" "),a("li",[s._v("host.directly_connected")]),s._v(" "),a("li",[s._v("host.mac_addr")]),s._v(" "),a("li",[s._v("host.mac_addr_src")]),s._v(" "),a("li",[s._v("host.interface_mtu")]),s._v(" "),a("li",[s._v("host.bin_ip")]),s._v(" "),a("li",[s._v("host.bin_ip_src")]),s._v(" "),a("li",[s._v("host.times")]),s._v(" "),a("li",[s._v("host.traceroute  注意， 此字段只有在指定 --traceroute时才有用\n"),a("img",{attrs:{src:"img/host_traceroute.png",alt:""}})])]),s._v(" "),a("p",[a("img",{attrs:{src:"img/host_host.png",alt:""}})]),s._v(" "),a("h4",{attrs:{id:"_1-4-1-2-port-table"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-4-1-2-port-table"}},[s._v("#")]),s._v(" 1.4.1.2. port table")]),s._v(" "),a("ol",[a("li",[s._v("port.number")]),s._v(" "),a("li",[s._v("port.protocol")]),s._v(" "),a("li",[s._v("port.service")]),s._v(" "),a("li",[s._v("port.version")]),s._v(" "),a("li",[s._v("port.state")])]),s._v(" "),a("p",[a("img",{attrs:{src:"img/port_port.png",alt:""}})]),s._v(" "),a("h3",{attrs:{id:"_1-4-2-nse中的异常处理"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-4-2-nse中的异常处理"}},[s._v("#")]),s._v(" 1.4.2. NSE中的异常处理")]),s._v(" "),a("p",[s._v("// 这块有点疑问，以后在处理")]),s._v(" "),a("div",{staticClass:"language-lua line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-lua"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("local")]),s._v(" comm "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" require "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"comm"')]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("local")]),s._v(" nmap "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" require "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"nmap"')]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("local")]),s._v(" shortport "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" require "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"shortport"')]),s._v("\n\ndescription "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("[[这是一个异常处理的demo\n]]")]),s._v("\n\nauthor "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"V5"')]),s._v("\nlicense "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Same as Nmap--See http://nmap.org/book/man-legal.html"')]),s._v("\ncategories "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"default"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n\nportrule "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" shortport"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("port_or_service")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("80")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"http"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("local")]),s._v(" fun1 "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("function")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" \n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"this is catch"')]),s._v(" \n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("end")]),s._v("\n\naction "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("function")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("host"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" port"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n \n\n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("local")]),s._v(" try "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" nmap"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("new_try")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("fun1"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n\n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("try")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("comm"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("exchange")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("host"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("port"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"\\r\\n"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("lines"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("100")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" timeout"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("5000")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("end")]),s._v("\n\n\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br"),a("span",{staticClass:"line-number"},[s._v("12")]),a("br"),a("span",{staticClass:"line-number"},[s._v("13")]),a("br"),a("span",{staticClass:"line-number"},[s._v("14")]),a("br"),a("span",{staticClass:"line-number"},[s._v("15")]),a("br"),a("span",{staticClass:"line-number"},[s._v("16")]),a("br"),a("span",{staticClass:"line-number"},[s._v("17")]),a("br"),a("span",{staticClass:"line-number"},[s._v("18")]),a("br"),a("span",{staticClass:"line-number"},[s._v("19")]),a("br"),a("span",{staticClass:"line-number"},[s._v("20")]),a("br"),a("span",{staticClass:"line-number"},[s._v("21")]),a("br"),a("span",{staticClass:"line-number"},[s._v("22")]),a("br"),a("span",{staticClass:"line-number"},[s._v("23")]),a("br"),a("span",{staticClass:"line-number"},[s._v("24")]),a("br"),a("span",{staticClass:"line-number"},[s._v("25")]),a("br"),a("span",{staticClass:"line-number"},[s._v("26")]),a("br"),a("span",{staticClass:"line-number"},[s._v("27")]),a("br")])]),a("h3",{attrs:{id:"_1-4-3-nse中的注册表"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-4-3-nse中的注册表"}},[s._v("#")]),s._v(" 1.4.3. NSE中的注册表")]),s._v(" "),a("p",[s._v("NSE中的注册表是一个lua table 类型的数据文件，它用来保存在一次扫描中各个脚本之间共享的变量， 这个注册表保存在一个名为Nmap.registry的变量中。")]),s._v(" "),a("p",[s._v("举个例子，在使用脚本对目标的口令进行暴力破解时，可以使用这个注册表报已经成功的用户名和密码保存起来，以供其他脚本使用。例如，破解到了目标的用户名为admin 密码为123456,NSE就会执行一个插入操作 "),a("code",[s._v("table.insert(nmap.registry.credentials.http, {username = admin,passwdord = 123456 }")])]),s._v(" "),a("p",[s._v("-- 未完待续 --")])])}),[],!1,null,null,null);t.default=r.exports}}]);