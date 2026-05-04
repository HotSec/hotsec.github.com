# lua-resty-waf

lua-resty-waf 是基于 OpenResty/Lua 的高性能 Web 应用防火墙。

## 核心功能

- SQL 注入检测
- XSS 跨站脚本检测
- CSRF 防护
- 文件上传检测
- IP 黑白名单
- CC 攻击防护
- 自定义规则引擎

## 安装

```bash
opm install p0pr0ck5/lua-resty-waf
```

## Nginx 配置

```nginx
http {
    lua_shared_dict waf_dict 10m;
    lua_package_path "/usr/local/openresty/lualib/?.lua;;";

    init_by_lua_block {
        local waf = require("resty.waf")
        waf.init()
    }

    server {
        access_by_lua_block {
            local waf = require("resty.waf")
            waf.exec()
        }

        header_filter_by_lua_block {
            local waf = require("resty.waf")
            waf.exec()
        }

        body_filter_by_lua_block {
            local waf = require("resty.waf")
            waf.exec()
        }
    }
}
```

## 规则配置

```lua
-- rules/10000_custom.json
{
    "id": 10000,
    "description": "Block specific user-agent",
    "action": "DENY",
    "operator": "REGEX",
    "pattern": "BadBot",
    "transform": "NONE",
    "col": "REQUEST_HEADERS",
    "col_key": "User-Agent"
}
```

## 运行模式

| 模式 | 说明 |
|------|------|
| ACTIVE | 拦截并记录 |
| SIMULATE | 仅记录不拦截（旁路模式） |
| INACTIVE | 完全关闭 |

## 特点

- 基于 Nginx 阶段处理，性能损耗小
- 支持动态规则加载
- 支持 Redis 共享存储
- 可扩展自定义规则
