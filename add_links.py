#!/usr/bin/env python3
import re

LINK_MAP = {
    "数据类型": "go/2_核心概念/2_数据类型.md",
    "变量声明与控制结构": "go/1_语言基础/3_语句.md",
    "函数与方法": "go/1_语言基础/4_函数.md go/1_语言基础/5_方法.md",
    "接口": "go/1_语言基础/7_接口.md",
    "包-模块-库": "go/1_语言基础/11_包-模块-库.md",
    "测试": "go/1_语言基础/12_测试.md",
    "项目结构与代码风格": "go/1_语言基础/13_项目结构代码风格与标识符命名.md",
    "错误处理": "go/1_语言基础/10_错误和异常.md",
    "设计模式": "go/1_语言基础/16_设计模式.md",
    "泛型": "go/1_语言基础/8_泛型.md",
    "版本新特性": "go/1_语言基础/15_版本新特性.md",
    "内部实现原理": "go/1_语言基础/14_内部实现原理.md",
    "Slice vs Array": "go/2_核心概念/2_数据类型.md",
    "Map": "go/2_核心概念/2_数据类型.md",
    "指针 & make vs new": "go/2_核心概念/13_make与new.md",
    "GMP 调度模型": "go/3_并发编程/7_Golang协程调度器原理-GMP模型.md",
    "Goroutine & Channel": "go/3_并发编程/9_并发.md",
    "sync 包": "go/3_并发编程/9_并发.md",
    "Context": "go/6_常用标准库/20_context.md",
    "并发编程模式": "go/3_并发编程/14_并发模式详解.md",
    "协程池": "go/3_并发编程/11_协程池.md",
    "限流与熔断": "go/3_并发编程/15_限流与熔断.md",
    "并发安全退出": "go/3_并发编程/16_conc.md",
    "内存模型与分配": "go/4_内存管理/9_内存管理.md",
    "逃逸分析": "go/4_内存管理/12_Go内存逃逸.md",
    "垃圾回收（GC）": "go/4_内存管理/8_GC-垃圾回收.md",
    "混合写屏障详解": "go/4_内存管理/10086_混合写屏障.md",
    "循环与变量陷阱": "go/5_常见陷阱/1_常见陷阱.md",
    "类型与接口陷阱": "go/5_常见陷阱/1_常见陷阱.md",
    "Slice 与 Map 陷阱": "go/5_常见陷阱/1_常见陷阱.md",
    "性能与标准库误用": "go/5_常见陷阱/1_常见陷阱.md",
    "fmt 格式化": "go/6_常用标准库/12_fmt.md",
    "time 时间包": "go/6_常用标准库/13_time.md",
    "strconv / flag": "go/6_常用标准库/14_strconv.md go/6_常用标准库/15_flag.md",
    "文件操作（os/io）": "go/6_常用标准库/16_文件操作.md",
    "html/template 模板": "go/6_常用标准库/17_template.md",
    "encoding/json 详解": "go/6_常用标准库/18_json.md",
    "reflect 反射": "go/6_常用标准库/19_reflect.md",
    "context 详解": "go/6_常用标准库/20_context.md",
    "并发与同步": "go/3_并发编程/9_并发.md go/6_常用标准库/27_singleflight.md",
    "网络与 I/O": "go/6_常用标准库/5_http标准库.md",
    "日志": "go/6_常用标准库/1_log.md",
    "Viper 配置管理": "go/6_常用标准库/21_viper.md",
    "validator 参数校验": "go/6_常用标准库/22_validator.md",
    "sqlx 数据库操作": "go/6_常用标准库/23_sqlx.md",
    "Cobra CLI 开发": "go/6_常用标准库/26_cobra.md",
    "Swagger / Air": "go/6_常用标准库/25_swagger.md go/6_常用标准库/24_air.md",
    "GORM": "go/6_常用标准库/3_gorm.md",
    "Go 操作 Redis": "go/6_常用标准库/28_redis.md",
    "Go 操作 MongoDB": "go/6_常用标准库/29_mongodb.md",
    "Go 操作 Kafka / NSQ / RabbitMQ": "go/6_常用标准库/30_kafka.md go/6_常用标准库/31_nsq.md go/6_常用标准库/32_rabbitmq.md",
    "OpenTelemetry / Jaeger / Prometheus": "go/6_常用标准库/35_opentelemetry.md go/6_常用标准库/36_jaeger.md go/6_常用标准库/37_prometheus.md",
    "优雅关机与部署": "go/6_常用标准库/33_优雅关机.md go/11_工具与调试/3_部署.md",
    "Gin": "go/7_常用框架/2_gin.md",
    "go-zero": "go/7_常用框架/1_go-zero.md",
    "GoFrame": "go/7_常用框架/6_GoFrame.md",
    "Gin vs go-zero 对比": "go/7_常用框架/1003_gin_vs_go-zero.md",
    "gRPC": "go/7_常用框架/3_grpc.md",
    "Zinx / Etcd": "go/7_常用框架/4_zinx.md go/7_常用框架/5_etcd.md",
    "Wire & 依赖注入": "go/7_常用框架/7_Wire依赖注入.md",
    "Go kit 微服务": "go/7_常用框架/8_go-kit.md",
    "Consul 服务注册与发现": "go/7_常用框架/9_consul.md",
    "编码层面": "go/8_Web接口性能优化/3_性能优化实战.md",
    "并发 & 数据库 & 缓存": "go/8_Web接口性能优化/3_性能优化实战.md",
    "HTTP & JSON & 监控": "go/8_Web接口性能优化/4_pprof性能分析.md go/8_Web接口性能优化/1001_web接口性能优化.md",
    "SBOM": "go/9_安全专题/1004_sbom.md",
    "国密算法与证书": "go/9_安全专题/1005_国密算法证书.md",
    "项目列表": "go/10_开源项目/",
    "常用工具": "go/11_工具与调试/0_常用工具.md go/11_工具与调试/2_性能调试.md go/11_工具与调试/3_部署.md",
    "分布式理论 & 网络模型": "go/12_分布式基础/6_分布式.md go/12_分布式基础/10_网络IO并发模型.md go/12_分布式基础/1000_golang知识点总结.md",
    "语言基础": "cpp/C语言教程/语言基础/",
    "标准库": "cpp/C语言教程/标准库/",
    "基础语法": "cpp/C++专题/基础语法/C++MAP.md",
    "内存管理": "cpp/C++专题/内存管理/1_内存管理.md",
    "模板": "cpp/C++专题/模板/1_模板.md",
    "现代C++特性": "cpp/C++专题/现代特性/1_C++11特性.md cpp/C++专题/现代特性/2_C++14-17特性.md cpp/C++专题/现代特性/3_C++20-23特性.md",
    "C++ 版本特性总览": "cpp/C++专题/现代特性/1_C++11特性.md cpp/C++专题/现代特性/2_C++14-17特性.md cpp/C++专题/现代特性/3_C++20-23特性.md",
    "并发编程": "cpp/C++专题/并发与STL/1_并发编程.md",
    "STL": "cpp/C++专题/并发与STL/1_STL详解.md",
    "开发环境与工具": "cpp/C++专题/工具与库/cmake-and-vcpkg.md",
    "常用库": "cpp/C++专题/工具与库/",
    "未定义行为 & 内存安全": "cpp/C++专题/底层与安全/1_未定义行为与内存安全.md",
    "汇编 & 调用约定": "cpp/C++专题/底层与安全/2_汇编与调用约定.md",
    "核心语法": "python/1_语言基础/Python基础_第2版.md",
    "Python风格指南": "python/1_语言基础/Python风格指南.md",
    "善用变量": "python/2_Python工匠/备忘/1-using-variables-well.md",
    "数值与字符串技巧": "python/2_Python工匠/备忘/3-tips-on-numbers-and-strings.md",
    "精通容器类型": "python/2_Python工匠/备忘/4-mastering-container-types.md",
    "循环编写技巧": "python/2_Python工匠/备忘/7-two-tips-on-loop-writing.md",
    "函数返回值技巧": "python/2_Python工匠/备忘/5-function-returning-tips.md",
    "异常处理三个习惯": "python/2_Python工匠/备忘/6-three-rituals-of-exceptions-handling.md",
    "装饰器技巧": "python/2_Python工匠/备忘/8-tips-on-decorators.md",
    "SOLID 原则": "python/2_Python工匠/备忘/12-write-solid-python-codes-part-1.md python/2_Python工匠/备忘/13-write-solid-python-codes-part-2.md python/2_Python工匠/备忘/14-write-solid-python-codes-part-3.md",
    "Edge Cases 思维": "python/2_Python工匠/备忘/15-thinking-in-edge-cases.md",
    "If-else 分支思维": "python/2_Python工匠/备忘/2-if-else-block-secrets.md",
    "路径与文件操作": "python/2_Python工匠/备忘/11-three-tips-on-writing-file-related-codes.md",
    "循环导入的故事": "python/2_Python工匠/备忘/9-a-story-on-cyclic-imports.md",
    "3.6 → 3.14 新特性": "python/3_版本演进/",
    "内置类型与异常": "python/4_标准库/内置类型.md python/4_标准库/内置异常.md python/4_标准库/内置函数.md python/4_标准库/内置常量.md",
    "文本与数据处理": "python/4_标准库/文本处理服务.md python/4_标准库/文件和目录访问.md python/4_标准库/函数式编程模块.md",
    "垃圾回收": "python/4_标准库/垃圾回收.md",
    "并发执行": "python/4_标准库/并发执行.md",
    "网络和进程间通信": "python/4_标准库/网络和进程间通信.md",
    "核心": "python/5_常用库/pydantic.md python/7_第三方库/SQLAlchemy.md python/5_常用库/celery.md python/5_常用库/huey.md",
    "网络/爬虫": "python/7_第三方库/playwright.md python/7_第三方库/scrapy.md python/7_第三方库/feapder.md",
    "协程 & 性能": "python/5_常用库/gevent.md python/5_常用库/uvloop.md",
    "安全 & 包管理": "python/7_第三方库/代码保护.md python/7_第三方库/常用包.md",
    "数据处理 & 科学计算": "python/7_第三方库/NumPy.md python/7_第三方库/Pandas.md python/7_第三方库/Polars.md python/7_第三方库/数据可视化.md",
    "包分发 & C扩展": "python/7_第三方库/常用包.md python/1_语言基础/zipapp打包应用.md",
    "Django": "python/6_Web开发/django/",
    "Flask": "python/6_Web开发/flask/",
    "FastAPI / Tornado / Bottle / Quart / Sanic": "python/6_Web开发/fastapi/ python/6_Web开发/fastapi.md python/6_Web开发/tornado.md python/6_Web开发/bottle.md python/6_Web开发/quart.md python/6_Web开发/sanic.md",
    "微服务": "python/6_Web开发/微服务.md",
    "反爬与安全": "python/6_Web开发/反爬.md",
    "数据库驱动": "python/7_第三方库/pymysql.md python/7_第三方库/redis-py.md python/7_第三方库/mongodb.md",
    "消息队列 & 搜索": "python/7_第三方库/rabbitmq.md python/7_第三方库/kafka.md python/7_第三方库/Elasticsearch.md",
    "LLM & AI": "python/7_第三方库/langchain.md python/7_第三方库/litllm.md python/7_第三方库/大模型.md python/7_第三方库/大模型开发流程.md python/7_第三方库/PythonAI绘画.md python/7_第三方库/RAG系统设计.md python/7_第三方库/LangChain实战.md",
    "自动化 & 部署": "python/7_第三方库/自动化运维/ansible.md python/7_第三方库/自动化运维/fabric.md python/7_第三方库/自动化运维/terraform.md python/7_第三方库/playwright.md",
    "基础架构": "python/8_高并发设计/基础架构.md",
    "高可用": "python/8_高并发设计/高可用.md",
    "高并发": "python/8_高并发设计/高并发.md",
    "分库分表": "python/8_高并发设计/分库分表.md",
    "唯一ID": "python/8_高并发设计/唯一id.md",
    "缓存": "python/8_高并发设计/缓存.md",
    "可观测性": "python/8_高并发设计/可观测性.md",
    "海量推送系统": "python/8_高并发设计/海量推送系统.md",
    "用户登录服务": "python/8_高并发设计/用户登陆服务.md",
    "Python面试题": "python/9_面试题/面试题.md",
    "数据类型与变量": "lua/1_语言基础/02_lua数据类型与变量.md",
    "面向对象 & 环境": "lua/1_语言基础/11_面向对象.md lua/1_语言基础/12_环境.md",
    "函数": "lua/1_语言基础/08_函数.md",
    "协程": "lua/1_语言基础/14_lua_coroutine.md",
    "错误处理 & 模式匹配": "lua/1_语言基础/04_错误处理与模式匹配.md",
    "GC & 性能": "lua/1_语言基础/17_GC与性能优化.md",
    "标准库": "lua/1_语言基础/20_lua标准库.md",
    "LuaJIT & FFI": "lua/2_高级主题/15_luaJIT.md lua/2_高级主题/16_lua_FFI.md",
    "OpenResty": "lua/2_高级主题/40_openresty安装.md",
    "Lua与C++": "lua/2_高级主题/30_Lua与C++.md",
    "LuaGo": "lua/2_高级主题/50_luago.md",
    "生态": "lua/2_高级主题/21_luafilesystem.md lua/2_高级主题/60_lua_ngx_waf.md lua/2_高级主题/70_openstar.md",
    "HTML & CSS": "web/1_前端基础/1_HTML5基础.md web/1_前端基础/2_CSS布局.md",
    "JavaScript 核心": "web/1_前端基础/1_JS核心.md",
    "TypeScript": "web/1_前端基础/2_TypeScript.md",
    "React": "web/2_前端框架/React.md",
    "Vue": "web/2_前端框架/Vue.md",
    "Node.js": "web/2_前端框架/Node.js.md",
    "HTTP 协议": "web/3_后端与协议/HTTP协议.md",
    "浏览器原理": "web/3_后端与协议/浏览器原理.md",
    "Tailwind CSS": "web/4_工程化与工具/tailwind-css.md",
    "Vite": "web/4_工程化与工具/vite.md",
    "Vuepress": "web/4_工程化与工具/vuepress.md web/4_工程化与工具/vuepress-demo/",
    "VSCode插件开发": "web/4_工程化与工具/vscode/memos-vscode插件开发记录.md",
    "Markdown": "web/4_工程化与工具/vuepress-demo/markdown.md",
    "OWASP Top 10": "security/1_Web安全/1_OWASP-Top10.md",
    "Web 安全": "security/1_Web安全/3_常见漏洞.md",
    "常见认证方式": "security/1_Web安全/常见认证方式.md",
    "逻辑漏洞": "security/1_Web安全/逻辑漏洞.md",
    "渗透测试方法论": "security/2_安全工具与方法/1_方法论.md",
    "Nuclei": "security/2_安全工具与方法/3_Nuclei.md",
    "漏扫爬虫": "security/2_安全工具与方法/漏扫爬虫.md",
    "容器内信息收集": "security/3_云与容器安全/容器内信息收集.md",
    "容器 & 云安全": "security/3_云与容器安全/Docker安全.md security/3_云与容器安全/K8s安全.md",
    "数据结构": "algorithms/数据结构与算法.md algorithms/algo/",
    "算法设计": "algorithms/algo/",
    "排序算法": "algorithms/algo/chapter_sorting/",
    "复杂度分析": "algorithms/algo/chapter_computational_complexity/",
    "基础理论": "algorithms/algo/chapter_data_structure/number_encoding.md algorithms/algo/chapter_data_structure/character_encoding.md",
    "算法题分类（BM系列）": "algorithms/数据结构与算法.md",
    "操作系统基础": "os-linux/1_操作系统基础.md",
    "Linux 核心": "os-linux/",
    "iptables 与 netfilter": "os-linux/4_iptables与netfilter.md",
    "Firewalld": "os-linux/5_Firewalld.md",
    "DenyHosts 与 SSH 安全": "os-linux/6_DenyHosts与SSH安全.md",
    "Linux 性能优化": "os-linux/7_Linux性能优化.md",
    "Linux 网络工具": "os-linux/8_Linux网络工具.md",
    "Shell 编程": "os-linux/9_Shell编程.md",
    "网络协议": "os-linux/11_网络协议.md",
    "Git 高级": "os-linux/10_Git高级.md",
    "系统架构": "architecture/0_软考架构基础.md architecture/1_架构设计.md",
    "数据库": "architecture/数据库/",
    "信息系统架构": "architecture/3_信息系统架构.md architecture/0_大型网站架构演进.md",
    "未来技术": "architecture/3_信息系统架构.md",
    "安全基础": "architecture/4_安全基础.md",
    "Kubernetes 核心概念": "devops/kubernetes/1_K8s核心概念.md",
    "K8s 核心组件详解": "devops/kubernetes/6_K8s核心组件详解.md",
    "K8s 持久化存储": "devops/kubernetes/4_K8s持久化存储.md",
    "Prometheus 监控 K8s": "devops/kubernetes/5_Prometheus监控K8s.md",
    "Docker Swarm": "devops/docker-swarm.md",
    "CI/CD": "devops/cicd/1_GitHub-Actions.md devops/cicd/2_GitLab-CI.md devops/cicd/3_Jenkins.md",
    "API 设计": "devops/cicd/4_API设计.md",
    "Puppet": "devops/自动化运维/1_Puppet.md",
    "Ansible": "devops/自动化运维/2_Ansible.md",
    "SaltStack": "devops/自动化运维/3_SaltStack.md",
    "ES集群 / Redis / 监控": "devops/基础设施/4_ES集群与ELK.md devops/基础设施/5_监控系统集成.md",
    "ELK Stack": "devops/基础设施/4_ES集群与ELK.md",
    "虚拟化": "devops/基础设施/2_虚拟化.md devops/hyper-v.md devops/vagrant.md",
    "网络": "devops/基础设施/1_网络.md devops/ovs-ovn.md",
    "LVS（Linux Virtual Server）": "devops/基础设施/6_LVS.md",
    "HAProxy": "devops/基础设施/7_HAProxy.md",
    "Nginx（负载均衡与反向代理）": "devops/基础设施/8_Nginx反向代理与负载均衡.md",
    "Keepalived": "devops/基础设施/9_Keepalived.md",
    "KubeSphere": "devops/k3s集群上安装kubesphere.md",
    "OpenStack": "devops/openstack二次开发.md",
    "框架": "agents/智能体框架.md agents/AutoGen.md agents/CrewAI.md agents/LangGraph.md",
    "AI Coding 实践": "agents/AI-Coding实践.md",
    "大模型": "other/大模型.md",
    "提高研发效能": "other/提高研发效能.md",
    "大厂技术文章": "other/大厂技术文章.md",
    "Shell编程风格": "other/杂项/shell编程风格.md",
    "杂项": "other/杂项/shell编程风格.md devops/构建deb包.md python/1_语言基础/zipapp打包应用.md",
}

with open("/Users/m5/Desktop/notebook/src/ALL.md", "r") as f:
    content = f.read()

count = 0
missed = []

lines = content.split('\n')
i = 0
while i < len(lines):
    line = lines[i]
    summary_match = re.search(r'<summary>(.*?)</summary>', line)
    if summary_match:
        summary = summary_match.group(1).strip()
        depth = 1
        j = i + 1
        while j < len(lines) and depth > 0:
            if '<details' in lines[j]:
                depth += 1
            if '</details>' in lines[j]:
                depth -= 1
            j += 1
        closing_line_idx = j - 1
        if summary in LINK_MAP:
            link = LINK_MAP[summary]
            has_link = False
            for k in range(max(0, closing_line_idx - 2), closing_line_idx + 1):
                if '<link>' in lines[k]:
                    has_link = True
                    break
            if not has_link:
                lines[closing_line_idx] = f"<link>{link}</link>\n{lines[closing_line_idx]}"
                count += 1
        else:
            missed.append(summary)
    i += 1

result = '\n'.join(lines)

with open("/Users/m5/Desktop/notebook/src/ALL.md", "w") as f:
    f.write(result)

print(f"Added {count} <link> tags")
if missed:
    print(f"Missed {len(missed)} summaries:")
    for s in missed:
        print(f"  - {s}")
