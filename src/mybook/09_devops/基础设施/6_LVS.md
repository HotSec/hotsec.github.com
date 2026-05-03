# LVS（Linux Virtual Server）

## 三种模式

### NAT 模式

- 请求和响应都经过 Director
- RS 的网关指向 Director
- Director 压力大（响应也经过 Director）
- RS 可为任意 OS

### DR 模式（Direct Routing）

- 请求经 Director，响应直接返回客户端
- RS 配置 VIP 在 lo 上（ARP 抑制）
- Director 和 RS 必须在同一物理网段
- 性能最好，最常用

### TUN 模式（IP 隧道）

- Director 通过 IP 隧道封装转发给 RS
- RS 解封装后直接响应客户端
- RS 可跨网段
- RS 需支持 IP 隧道

## IPVS 配置

```bash
ipvsadm -A -t 192.168.1.100:80 -s wlc
ipvsadm -a -t 192.168.1.100:80 -r 10.0.0.1:80 -g -w 3
ipvsadm -a -t 192.168.1.100:80 -r 10.0.0.2:80 -g -w 2

ipvsadm -Ln
ipvsadm -Ln --stats
ipvsadm -d -t 192.168.1.100:80 -r 10.0.0.1:80
```

## 调度算法

| 算法 | 说明 |
|------|------|
| rr | 轮询 |
| wrr | 加权轮询 |
| lc | 最小连接数 |
| wlc | 加权最小连接数（推荐） |
| sh | 源地址哈希 |
| dh | 目标地址哈希 |
| lblc | 基于局部的最小连接 |
| sed | 最短期望延迟 |

## LVS + Keepalived 高可用

- Keepalived 管理 IPVS 规则
- VRRP 实现 Director 主备切换
- 健康检查自动移除故障 RS
- VIP 漂移保证服务连续性
