# Nginx 反向代理与负载均衡

## 反向代理

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering on;
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
    }
}
```

## 负载均衡

```nginx
upstream backend {
    server 10.0.0.1:8080 weight=3;
    server 10.0.0.2:8080 weight=2;
    server 10.0.0.3:8080 backup;
    max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

- `weight`：权重
- `backup`：备用服务器
- `max_fails` / `fail_timeout`：健康检查
- `keepalive`：长连接池大小

## 负载均衡算法

| 算法 | 指令 |
|------|------|
| 轮询（默认） | - |
| 最少连接 | `least_conn;` |
| IP 哈希 | `ip_hash;` |
| 通用哈希 | `hash $request_uri consistent;` |

## 性能调优

```nginx
worker_processes auto;
worker_connections 65535;

sendfile on;
tcp_nopush on;
tcp_nodelay on;

gzip on;
gzip_types text/plain application/json application/javascript;
gzip_min_length 1024;

open_file_cache max=10000 inactive=60s;
open_file_cache_valid 90s;
```

## 安全配置

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
    limit_req zone=api burst=200 nodelay;

    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

## 平滑升级

```bash
# 发送 USR2 信号启动新 master
kill -USR2 $(cat /run/nginx.pid)

# 新 master 启动后，关闭旧 worker
kill -WINCH $(cat /run/nginx.pid.oldbin)

# 确认新版本正常，退出旧 master
kill -QUIT $(cat /run/nginx.pid.oldbin)

# 回滚：退出新 master，恢复旧 master
kill -QUIT $(cat /run/nginx.pid)
kill -HUP $(cat /run/nginx.pid.oldbin)
```
