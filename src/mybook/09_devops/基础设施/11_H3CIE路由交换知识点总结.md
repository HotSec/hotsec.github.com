# H3CIE路由交换知识点总结

## 一、H3CIE认证体系

### 1.1 认证体系介绍

**H3C认证体系金字塔：**

| 级别 | 认证名称 | 中文全称 |
|------|----------|----------|
| 入门 | H3CNE | H3C认证网络工程师 |
| 高级 | H3CSE | H3C认证资深网络工程师 |
| 专家 | **H3CIE** | **H3C认证互联网络专家** |

**H3CIE-RS+**（H3C Certified Internetwork Expert for Routing & Switching Plus）：路由交换方向的专家级认证，新华三最高级别的网络技术认证。

> 💡 **特点：H3CIE强调网络规划设计、故障排查、综合实战能力，含金量较高，考试分为**笔试 + 机试（实验室） + 面试**三门，全部通过才能拿证。[1](http://www.h3c.com/cn/Training/Technical_Certification/Technical_Certification/Technology_Certification_System/H3CIE-RS+/)

### 1.2 报考条件

- 首次报考：**必须先参加H3CIE-RS+培训**（在H3C授权培训中心）
- 已有证书：曾经获得过H3CTE或H3CIE-RS证书，可以直接报考
- 已有培训：参加过H3CTE培训，也可以直接报考

### 1.3 考试流程

**三步考试流程：**

```
Step 1: 笔试 GB0-801 (1.5小时)
          ↓
    通过后 12个月有效期内
          ↓
Step 2: 实验室机试 HL0-201 (6小时)
          ↓
    通过后 12个月有效期内
          ↓
Step 3: 技术面试 HI0-102 (0.5小时)
          ↓
    通过所有考试 → 获得H3CIE证书
```

| 考试 | 代码 | 时长 | 考查重点 | 组织方 |
|------|------|------|----------|--------|
| 综合笔试 | GB0-801 | 1.5小时 | 理论水平、网络规划、排错思路 | ATAC考试平台 |
| 实验室考试 | HL0-201 | 6小时 | 组网配置、故障排查、实验报告 | H3C公司 |
| 技术面试 | HI0-102 | 0.5小时 | 综合能力、理论+规划+排错 | H3C公司 |

### 1.4 证书有效期

- **有效期**：2 + 1 年（2年有效期 + 1年缓冲期）
- **重认证**：有效期2年内通过重认证 → 刷新2年；缓冲期1年内通过 → 从原有效期顺延2年
- **过期**：缓冲期后证书失效 → 必须重新考三门

---

## 二、核心知识点大纲

### 2.1 二层交换技术

| 知识点 | 考查要点 |
|--------|----------|
| **VLAN** | 802.1Q、Access/Trunk/Hybrid、GVRP、VLAN聚合、Super VLAN |
| **STP/RSTP/MSTP** | 生成树原理、端口角色、端口状态、收敛过程、MSTP多实例、负载分担 |
| **链路聚合** | Eth-Trunk、手工聚合、LACP静态/动态、负载分担方式 |
| **VLAN聚合** | Super-VLAN、Sub-VLAN、ARP代理 |
| **QinQ** | 基本QinQ、灵活QinQ、VLAN标签嵌套 |
| **IRF** | 智能弹性架构、堆叠、MAD检测、IRF2 vs IRF3 |
| **二层隧道** | MAC地址隧道、CVLAN/SVLAN |

**Hybrid端口关键点：**
```
Hybrid可以配置多个VLAN，能够同时Tagged和Untagged
Access只能属于一个VLAN，总是Untagged
Trunk默认只允许VLAN1通过，允许其他VLAN Tagged
```

### 2.2 路由技术

#### 2.2.1 静态路由与路由基础

- 最长匹配原则
- 路由优先级（preference）
- 路由度量（cost/metric）
- 等价路由、负载分担
- 路由汇总、路由聚合
- 默认路由

#### 2.2.2 RIP

- 距离矢量算法、坏消息传得慢
- 跳数度量、最大跳数15
- RIP v1 vs v2（有类/无类、认证、组播）
- 水平分割、毒性逆转、触发更新
- RIPng（IPv6版本）

#### 2.2.3 OSPF

**H3CIE高频考点：**

- **区域概念**：区域0（骨干）、ABR、ASBR、区域边界
- **LSA类型**：
  - Type 1：Router LSA（每个路由器产生）
  - Type 2：Network LSA（DR产生）
  - Type 3：Network Summary LSA（ABR产生）
  - Type 4：ASBR Summary LSA（ABR产生）
  - Type 5：AS External LSA（ASBR产生）
  - Type 7：NSSA External LSA（NSSA区域ASBR产生）
- **DR/BDR选举**：接口优先级 > Router ID，广播网络才选举
- **邻居状态机**：Down → Init → 2-Way → ExStart → Exchange → Loading → Full
- **邻接关系建立条件**：区域ID一致、Hello时间一致、Dead时间一致、认证一致、子网掩码一致
- **OSPF特殊区域**：Stub、Totally Stub、NSSA、Totally NSSA
- **路由计算**：SPF算法、最短路径树
- **OSPF路由优选**： intra-area > inter-area > E1 > E2
- **OSPFv3**：支持IPv6，基于链路本地地址，LSA格式变化

#### 2.2.4 IS-IS

- 链路状态协议、CLNS基础
- Level-1、Level-2、Level-1-2路由器
- NET地址（区域ID + 系统ID + 选择符）
- DIS选举、广播网络
- LSP分段、DIS泛洪
- 路由计算：SPF算法、最短路径树
- 与OSPF对比：分层不同、扩展性更好

#### 2.2.5 BGP

**H3CIE重点考查：**

- BGP基本概念：AS号、EBGP、IBGP
- BGP消息类型：Open、Update、Keepalive、Notification、Route-refresh
- BGP邻居状态机：Idle → Connect → Active → OpenSent → OpenConfirm → Established
- BGP属性：
  - **公认必遵**：Origin、AS_Path、Next_Hop
  - **公认任意**：Local_Pref、Atomic_Aggregate
  - **可选过渡**：Aggregator、Community
  - **可选非过渡**：MED、Originator_ID、Cluster_List
- BGP路由优选原则：
  1. 优选Preferred-value最大的
  2. 优选Local_Pref最大的
  3. 优选本地聚合产生的
  4. 优选AS_Path最短的
  5. 优选Origin类型最小的（IGP < EGP < incomplete）
  6. 优选MED最小的
  7. 优选EBGP路由 > IBGP路由
  8. 优选下一跳IGP度量最小的
  9. 优选Cluster_List最短的
  10. 优选Peer地址最小的
- BGP反射器：RR、Client、Non-Client、Cluster_ID
- BGP联盟： Confederation拆分AS，保持AS路径完整性
- 团体属性：Community、路由打标记、批量控制路由策略
- BGP路由衰减：抑制震荡路由
- MP-BGP：支持多协议，传递VPNv4地址族

#### 2.2.6 路由引入与路由策略

- 路由引入（import）：不同协议之间互相引入
- 路由过滤：filter-policy、route-policy
- Route-policy语法：node permit/deny、if-match、apply
- 策略路由：PBR基于源地址选路，不看路由表
- 前缀列表：ip prefix-list，匹配前缀长度范围更灵活

### 2.3 广域网技术

#### 2.3.1 PPP和PPPoE

- PPP：LCP阶段（链路建立、协商参数、认证）→ NCP阶段（IPCP协商IP地址）
- PPP认证：PAP（明文两次握手）vs CHAP（三次握手密文）
- PPPoE：发现阶段（PADI/PADO/PADR/PADS）→ 会话阶段

#### 2.3.2 MPLS

**H3CIE核心考点：**

- MPLS基本概念：标签（Label）、LSP（标签交换路径）、FEC（等价转发类）
- MPLS转发：基于标签交换，比IP转发更快
- LDP：标签分发协议，下游分配标签
- 标签结构：20位标签 + 3位EXP + 1位S + 8位TTL
- LDP会话：发现阶段 → 会话建立 → 标签交换
- PHP（倒数第二跳弹出）：减少LER标签弹出操作

#### 2.3.3 MPLS VPN

- MPLS VPN架构：P（核心）、PE（运营商边缘）、CE（用户边缘）
- VPN实例：VRF（VPN路由转发实例），隔离不同VPN路由
- MP-BGP：PE之间传递VPNv4路由
- 地址族：VPNv4地址（RD + IPv4）
- RT属性：Route Target，import/export控制VPN路由接收
- VPN路由传递过程：
  1. CE → PE：普通路由（OSPF/BGP/静态）
  2. PE将普通路由转为VPNv4路由，打RT标签
  3. PE通过MP-BGP发给对端PE
  4. 对端PE根据RT import选择，放入对应VRF
  5. 对端PE发给本地CE

**MPLS VPN关键概念：**

| 概念 | 作用 |
|------|------|
| RD（Route Distinguisher） | 区分不同VPN，让相同IPv4前缀变为唯一VPNv4前缀 |
| RT（Route Target） | 控制VPN路由的导入导出，基于策略 |
| VRF | 每个VPN一个独立路由表，实现路由隔离 |

### 2.4 IPv6技术

- IPv6地址格式：128位，八组四位十六进制
- IPv6地址分类：
  - 单播：可聚合全球单播、链路本地地址、站点本地地址
  - 组播：一对多，FF00::/8开头
  - 任播：一对一（最近）
- ICMPv6：替代ICMPv4，包括邻居发现（ND）、PMTU发现
- 邻居发现协议（ND）：RS/RA/NS/NA，ARP换成ND
- SLAAC：无状态地址自动配置
- DHCPv6：有状态地址分配
- IPv6路由协议：OSPFv3、IS-ISv6、BGP4+、RIPng
- 6to4隧道：IPv6 over IPv4网络

### 2.5 高可用与可靠性

- **VRRP**：虚拟路由冗余协议，虚拟网关，主备切换
  - VRRP状态：Initialize → Master → Backup
  - VRRP定时器：Advertisement interval 1秒，Master down时间 3秒
  - 抢占模式：抢占/非抢占
  - VRRP负载分担：多VRRP组+不同优先级
  - VRRP跟踪：跟踪上行接口，优先级调整
- **BFD**：双向转发检测，快速检测链路故障，检测时间ms级
  - BFD与路由协议联动：BFD检测到故障通知IGP/BGP快速收敛
- **FRR**：快速重路由，预先建立备份LSP/路径，故障切换50ms内
- **GR**：平滑重启，协议重启不中断转发，保证转发连续性
- **NSF**：不中断转发，控制平面重启不影响转发

### 2.6 网络安全

- **ACL**：访问控制列表，基本（源IP）、高级（五元组）
- 包过滤：在接口inbound/outbound方向应用
- **防火墙**：安全区域、安全策略、NAT
- **802.1X**：端口认证，客户端（Supplicant）、认证者（Authenticator）、认证服务器（Radius）
- **NAT**：静态NAT、动态NAT、NAPT（PAT端口复用）、NAT hairpin
- **IPSec VPN**：AH（认证）、ESP（加密+认证）、IKE协商、隧道模式/传输模式
- **SSL VPN**：远程接入VPN，基于HTTPS，不需要客户端

### 2.7 园区网络架构设计

- **层次化设计**：
  - 接入层：终端接入、端口安全、VLAN划分
  - 汇聚层：路由聚合、ACL、VRRP网关
  - 核心层：高速转发、可靠性、负载均衡
- **扁平化架构**：AC+Fit AP无线架构，核心+接入两层
- **大二层**：数据中心，STP/VxLAN
- **VXLAN**：虚拟扩展局域网，MAC-in-UDP，大二层网络，数据中心
- **SDN**：软件定义网络，控制平面与数据平面分离，OpenFlow

### 2.8 网络优化

- **QoS**：服务质量
  - 流分类：基于ACL、IP优先级、DSCP
  - 标记：IP Precedence、DSCP
  - 队列：PQ（优先级队列）、CQ（定制队列）、WFQ（加权公平队列）、CBWFQ（基于类别加权公平）、LLQ（低延迟队列）
  - 拥塞避免：WRED（加权随机早期检测）
  - 监管：CAR（承诺访问速率），限速
  - 整形：GTS（通用流量整形）
- **流量工程**：IGP捷径、快速重路由
- **负载均衡**：链路负载分担、等价路由

---

## 三、常见面试知识点

### 3.1 基础知识类

**Q: 什么是MTU？IP分片的过程？**

> **MTU**: Maximum Transmission Unit，最大传输单元，指数据链路层能够承载的最大数据大小。以太网默认MTU = 1500字节。
>
> **IP分片过程**：当IP数据包长度 > 出接口MTU时，IP会将数据包分片，设置MF标志（More Fragment），只有最后一个分片MF=0。分片后每个分片独立路由。目的端重组分片。[5](https://download.csdn.net/download/junjiemysqldba/13460640)

**Q: TCP三次握手和四次挥手为什么是三次不是两次？**

- 三次握手：双方都要确认对方的ISN序号，同步双方序号，防止已失效的连接请求报文段被传到服务器，产生错误。
- 四次挥手：TCP是全双工，关闭连接需要双方分别关闭，FIN报文代表本方发送完数据，对方确认后关闭对方方向连接。

**Q: 为什么说OSPF是链路状态协议而RIP是距离矢量协议？**

- **链路状态**：每个路由器只泛洪发送自己的链路状态信息（连接哪些网络、度量是多少），整个区域每个路由器都有完整的链路状态数据库，每个路由器独立运行SPF算法计算最短路径。
- **距离矢量**：每个路由器只把自己的整张路由表发给邻居，邻居基于邻居路由计算路由，贝尔曼-福特算法。路由信息逐跳传递，容易产生环路，收敛慢。

**Q: OSPF中为什么需要分区域？区域0的作用是什么？**

- 分区域减少LSA泛洪范围，减小LSDB大小，降低路由器CPU和内存消耗，加快路由计算收敛。
- 区域0是骨干区域，所有非骨干区域必须连接到区域0。区域间路由必须通过区域0传递，防止区域间路由环路。

**Q: BGP为什么不直接用IGP度量，而是设计那么多优选规则？**

- BGP是EGP，用来在AS之间传递路由，IGP度量是AS内部的路径开销，在跨AS时不能直接用来选路，所以需要基于AS路径长度、起源类型、MED等属性来选路。

### 3.2 MPLS VPN类

**Q: MPLS VPN中RD和RT的作用分别是什么？**

- **RD（路由区分符）**：64位，附加在IPv4地址前，把32位IPv4变成96位VPNv4地址，使不同VPN可以使用重叠的IP地址空间，解决地址冲突问题。RD只用于路由区分，不影响路由选路。
- **RT（路由目标）**：BGP扩展团体属性，控制VPN路由的导入和导出。一个VPN路由export特定RT，只有import该RT的VPN才能接收此路由。RT实现灵活的VPN访问控制。

**Q: 为什么PE需要保存多个VRF路由表？**

- 不同VPN的用户可能使用相同的IP地址段，通过VRF隔离，每个VPN一个独立路由表，PE能区分哪个地址属于哪个VPN，防止路由混淆，实现VPN隔离。

### 3.3 故障排查思路

**Q: 某站点用户反映不能上网，你怎么排查？分层排查思路？**

**分层排查法：**

1. **物理层**：检查网线是否插好、接口是否Up、指示灯是否正常、光纤是否损坏、光功率是否正常
2. **数据链路层**：检查VLAN配置是否正确、端口模式Access/Trunk是否正确、允许的VLAN是否正确、STP状态是否正常、是否被阻塞、是否存在环路
3. **网络层**：检查IP地址配置是否正确、网关能否Ping通、路由表是否有到达目标网段的路由、下一跳是否可达、BGP/IGP路由是否正常
4. **传输层**：检查TCP连接能否建立、端口是否开放、防火墙是否拦截、ACL是否过滤、是否拥塞丢包
5. **应用层**：检查服务是否正常、DNS能否解析、服务器端口是否监听

**常见排错思路总结：**
- 从近到远：先Ping本地网关，再Ping对端网关，再Ping服务器地址
- 分层排查：物理层 → 二层 → 三层 → 高层
- 分段定位：哪个区间不通，就是哪个区间问题
- 对比测试：换个设备/换个端口试一下，排除终端问题

### 3.4 规划设计类

**Q: 一个企业有总部和多个分部，需要连接互联网，同时分部之间需要互访，你怎么设计网络方案？**

**方案一：MPLS VPN（运营商提供）**
- 总部和各分部CE设备接入运营商MPLS VPN
- 运营商PE为每个站点配置VPN实例
- 各个分部通过MPLS VPN实现互访
- 总部出口连接防火墙，连接互联网，分部访问互联网通过总部转发或者各自独立接入

**方案二：IPSec VPN（互联网+VPN）**
- 总部和各分部都接入互联网，获取公网IP
- 在总部出口路由器/防火墙配置IPSec VPN，各分部也配置VPN连接到总部
- 分部之间互访通过总部中转，或者分部之间建立Full Mesh VPN
- 优点：成本低，利用公网；缺点：稳定性依赖公网质量

**Q: 如何设计一个高可用的企业网络？**

- **设备冗余**：核心设备双机备份、汇聚层双归到核心
- **链路冗余**：双链路上联，防止单链路故障
- **网关冗余**：VRRP虚拟网关，主备切换
- **路由收敛**：BFD+IGP联动，快速检测故障，加快收敛
- **故障快速切换**：FRR快速重路由，50ms内切换
- **硬件冗余**：冗余电源、冗余风扇、支持热插拔

---

## 四、H3C设备常用命令对比（与华为不同）

| 功能 | H3C命令 | 华为命令 |
|------|---------|---------|
| 进入系统视图 | `system-view` | `system-view` | 相同
| 退出到用户视图 | `return` | `return` / `save`后`quit` | 相近
| 保存配置 | `save` | `save` | 相同
| 显示当前配置 | `display current-configuration` | `display current-configuration` | 相同
| 显示接口信息 | `display interface brief` | `display ip interface brief` | 不同
| 显示VLAN信息 | `display vlan brief` | `display vlan` | 相近
| 创建VLAN | `vlan 10` | `vlan 10` | 相同
| 配置Access端口 | `port access vlan 10` | `port default vlan 10` | **不同** |
| 配置Trunk允许VLAN | `port trunk permit vlan 10 20` | `port trunk allow-pass vlan 10 20` | **不同** |
| 查看路由表 | `display ip routing-table` | `display ip routing-table` | 相同
| 清除ARP缓存 | `reset arp all` | `reset arp all` | 相同
| 清除MAC地址表 | `reset mac-address dynamic` | `undo mac-address dynamic` | 不同
| Ping带源地址 | `ping -a 1.1.1.1 2.2.2.2` | `ping -a 1.1.1.1 2.2.2.2` | 相同
| 查看BGP对等体 | `display bgp peer` | `display bgp peer` | 相同
| 查看OSPF邻居 | `display ospf peer` | `display ospf peer` | 相同
| 查看VRRP状态 | `display vrrp` | `display vrrp` | 相同
| 开启路由功能（三层口） | `undo portswitch` | `no switchport` | 不同（思科风格）

> 💡 **注意：H3C配置Trunk允许VLAN是 `permit`，华为是 `allow-pass`，这里最容易记混。H3C配置Access端口是 `port access vlan`，华为是 `port default vlan`。**

---

## 五、备考经验与建议

### 5.1 备考资料推荐

- 官方教材：
  - 《构建中小企业网络v7.0》（H3CNE）
  - 《构建H3C高性能园区网络v2.0》
  - 《H3C大规模网络路由技术v2.0》
  - 《构建安全优化的广域网v2.0》
  - 《IPv6技术v2.0》
  - 《根叔的云图——网络故障大排查》（排错经典）[1](http://www.h3c.com/cn/Training/Technical_Certification/Technical_Certification/Technology_Certification_System/H3CIE-RS+/)

- 白皮书：路由、园区、安全与优化（面试常考）[5](https://blog.csdn.net/m0_68265458/article/details/145049658)
- 真题：2024年多套面试真题，掌握面试出题规律

### 5.2 备考步骤

```
1. 理论学习：通读全套教材，梳理知识点框架
   ↓
2. 刷题：做笔试真题，查漏补缺，理解概念
   ↓
3. 实验：多敲配置，熟悉H3C命令排错，写实验报告
   ↓
4. 面试准备：整理常见面试题，模拟面试，梳理排错思路
   ↓
5. 三门依次考：先考笔试，再过机试，最后面试
```

### 5.3 机试考试技巧

- 机试6小时：合理分配时间，先做容易得分的题目
- 排错题目：分段检查，先检查物理层和二层连通性，再检查三层路由
- 一定要写实验报告：实验报告占分数，描述清楚故障原因和解决方法
- 最后要验证：配置完一定要Ping测，确保业务通

### 5.4 面试技巧

- 面试半小时：考官会从笔试、机试中找你可能薄弱的地方问
- 保持思路清晰：回答问题按层次说，不要东拉西扯
- 不会就说不会，不要瞎编：可以说这个知识点我不太熟悉，但我理解大概是...
- 排错题要说出分层排查思路，面试官看重思路而不仅仅是答案

---

## 六、知识点思维导图

```
H3CIE-RS+
├── 认证体系
│   ├── 报考条件
│   ├── 笔试+机试+面试
│   └── 有效期与重认证
├── 二层交换
│   ├── VLAN/Trunk/Hybrid
│   ├── STP/RSTP/MSTP
│   ├── Eth-Trunk/LACP
│   ├── QinQ/IRF
├── 路由协议
│   ├── RIP/OSPF/IS-IS/BGP
│   ├── 路由策略/Route-policy
│   └── 路由引入
├── 广域网
│   ├── PPP/PPPoE
│   ├── MPLS/MPLS VPN
│   └── VRF/RD/RT
├── IPv6
│   ├── 地址格式/分类
│   ├── ND协议
│   └── OSPFv3/BGP4+
├── 高可用
│   ├── VRRP
│   ├── BFD/FRR/GR
│   └── 快速收敛
├── 网络安全
│   ├── ACL
│   ├── NAT
│   ├── IPSec VPN/SSL VPN
│   └── 802.1X
├── QoS
│   ├── 流分类/标记
│   ├── 队列/CAR/WRED
│   └── LLQ/CBWFQ
└── 规划排错
    ├── 层次化园区设计
    ├── 分层排错思路
    └── 高可用设计
```

---

## 七、参考资料

1. [H3CIE-RS+官方介绍 - 新华三大学](http://www.h3c.com/cn/Training/Technical_Certification/Technical_Certification/Technology_Certification_System/H3CIE-RS+/)
2. [新华三认证体系介绍 - Bilibili](https://www.bilibili.com/opus/1144240435155173397?bsource=toutiao_bilibilih5)
3. [H3CIE-RS+面试备考指南 - 润天教育](http://www.runtimewh.com/xwzx/25388.html)
4. [华三H3CIE-RS+面试指南 - CSDN](https://download.csdn.net/download/junjiemysqldba/13460640)
5. [2025新华三H3CIE面试资料合集 - CSDN](https://blog.csdn.net/m0_68265458/article/details/145049658)
