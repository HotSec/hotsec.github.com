# HAProxy

## 安装配置

五段配置结构：

```
global       # 全局参数（进程/性能/安全）
defaults     # 默认参数（超时/重试/日志）
frontend     # 前端（接收客户端请求）
backend      # 后端（服务器组）
listen       # 组合前端后端（统计页面等）
```

## 四层/七层代理

### 四层（TCP 模式）

```
frontend mysql_front
    bind *:3306
    default_backend mysql_back

backend mysql_back
    mode tcp
    server db1 10.0.0.1:3306 check
    server db2 10.0.0.2:3306 check
```

### 七层（HTTP 模式）

```
frontend http_front
    bind *:80
    default_backend web_back

backend web_back
    mode http
    server web1 10.0.0.1:80 check
    server web2 10.0.0.2:80 check
```

## ACL 规则

```
acl is_api path_beg /api/
acl is_static path_end .css .js .png
acl is_admin hdr(host) admin.example.com
acl is_internal src 10.0.0.0/8

use_backend api_back if is_api
use_backend static_back if is_static
use_backend admin_back if is_admin
```

匹配条件：`path_beg` / `path_end` / `hdr` / `host` / `src` / `dst`

## 负载均衡算法

| 算法 | 说明 |
|------|------|
| roundrobin | 轮询（默认） |
| static-rr | 静态加权轮询 |
| leastconn | 最少连接数 |
| source | 源 IP 哈希 |
| uri | URI 哈希 |

## 健康检查

```
option httpchk GET /health
http-check expect status 200

server web1 10.0.0.1:80 check inter 2s fall 3 rise 2
```

- `inter`：检查间隔
- `fall`：连续失败次数标记宕机
- `rise`：连续成功次数标记恢复

## 统计页面

```
listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 10s
    stats admin if LOCALHOST
```

## SSL 终结

```
frontend https_front
    bind *:443 ssl crt /etc/ssl/cert.pem
    redirect scheme https if !{ ssl_fc }
```
