# OpenStar

OpenStar 是基于 OpenResty 的 WAF（Web 应用防火墙）解决方案。

## 核心功能

- 多维度 CC 攻击防护（IP/Cookie/URL）
- Web 攻击检测（SQL注入/XSS/命令注入等）
- 动态 IP 黑白名单
- 验证码人机识别
- 实时流量统计与告警
- 分布式集群支持（Redis 同步）

## 架构

```
请求 → Nginx(OpenResty) → OpenStar WAF → 后端服务
                              ↓
                          Redis（规则/统计/黑白名单）
```

## 部署

```bash
git clone https://github.com/starjun/openstar.git
cp -r openstar /usr/local/openresty/nginx/conf/
```

## Nginx 配置

```nginx
http {
    lua_package_path "/usr/local/openresty/nginx/conf/openstar/?.lua;;";
    lua_shared_dict waf_dict 100m;

    init_by_lua_file /usr/local/openresty/nginx/conf/openstar/init.lua;

    server {
        access_by_lua_file /usr/local/openresty/nginx/conf/openstar/access.lua;
        header_filter_by_lua_file /usr/local/openresty/nginx/conf/openstar/header_filter.lua;
        body_filter_by_lua_file /usr/local/openresty/nginx/conf/openstar/body_filter.lua;
    }
}
```

## 防护策略

| 策略 | 说明 |
|------|------|
| CC 防护 | 基于频率统计，支持 IP/Cookie/URL 维度 |
| Web 攻击 | 正则规则匹配，支持 ModSecurity 规则转换 |
| IP 黑白名单 | 动态管理，支持 Redis 同步 |
| 验证码 | Cookie 验证 + JS 挑战 |
| 限速 | URI 级别 QPS 限制 |

## 与 lua-resty-waf 对比

| 特性 | OpenStar | lua-resty-waf |
|------|----------|---------------|
| CC 防护 | 多维度 | 基础 |
| 管理界面 | 有 | 无 |
| 分布式 | Redis 同步 | 有限 |
| 社区活跃度 | 中文社区 | 国际社区 |
