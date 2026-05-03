# Keepalived

## VRRP 协议

- 虚拟路由冗余协议（Virtual Router Redundancy Protocol）
- Master-Backup 选举：优先级高的成为 Master
- VIP 漂移：Master 故障时 Backup 接管 VIP
- 通告间隔：默认 1 秒
- 抢占模式：优先级高的恢复后自动接管

## 配置

### global_defs

```
global_defs {
    router_id NODE_1
    vrrp_skip_check_adv_addr
    vrrp_garp_interval 0
    vrrp_gna_interval 0
}
```

### vrrp_instance

```
vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1

    authentication {
        auth_type PASS
        auth_pass 1234
    }

    virtual_ipaddress {
        192.168.1.100/24
    }

    track_script {
        chk_nginx
    }
}
```

### vrrp_script

```
vrrp_script chk_nginx {
    script "/etc/keepalived/check_nginx.sh"
    interval 2
    weight -20
    fall 3
    rise 2
}
```

- `interval`：检查间隔（秒）
- `weight`：失败时降低优先级
- `fall`：连续失败次数判定
- `rise`：连续成功次数恢复

## 与 LVS 集成

```
virtual_server 192.168.1.100 80 {
    delay_loop 6
    lb_algo wlc
    lb_kind DR
    persistence_timeout 0
    protocol TCP

    real_server 10.0.0.1 80 {
        weight 3
        TCP_CHECK {
            connect_timeout 3
        }
    }

    real_server 10.0.0.2 80 {
        weight 2
        TCP_CHECK {
            connect_timeout 3
        }
    }
}
```

## 与 HAProxy/Nginx 集成

通过 vrrp_script 检测进程状态：

```bash
#!/bin/bash
if ! pidof haproxy > /dev/null; then
    exit 1
fi
exit 0
```

进程不存在时降低优先级，触发 VIP 漂移到备用节点。

## 架构选型对比

| 维度 | LVS | HAProxy | Nginx |
|------|-----|---------|-------|
| 层级 | 四层（L4） | 四层+七层 | 七层（L7） |
| 并发能力 | 极高（10万+） | 高（5万+） | 高（3万+） |
| 功能 | 转发为主 | 丰富ACL/统计 | HTTP丰富功能 |
| 适用 | 超高并发入口 | 四七层混合 | HTTP反向代理 |
