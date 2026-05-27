# Hot-Search-API：Gin 框架的 31+ 平台热搜聚合 API

Hot-Search-API 是一个基于 Gin 框架的高性能热搜聚合 API 服务，支持 30+ 中外主流平台实时数据抓取，为 hot_searches_for_apps 提供数据接口。

> 项目地址：https://github.com/iiecho1/api-for-hot-search-golang

---

## 一、项目概览

| 项目信息 | 内容 |
|---------|------|
| 作者 | iiecho1 |
| 技术栈 | Go + Gin |
| 核心理念 | 统一聚合多个平台热搜的 API 服务 |
| 特性 | 高并发、零外部依赖、健康检查 |

---

## 二、核心特性

| 特性 | 说明 |
|------|------|
| **31 个数据源** | 百度、微博、抖音、知乎、GitHub 等主流平台 |
| **高并发聚合** | `/all` 接口 goroutine 并发抓取，8 秒超时 |
| **统一工具库** | 共享 HTTP 客户端、JSON 解析、响应构建 |
| **零外部依赖** | 编译为单个二进制，开箱即用 |
| **健康检查** | 内置 `/health` 端点 |

---

## 三、API 端点

### 平台接口

| 路径 | 平台 | 路径 | 平台 |
|------|------|------|------|
| /baidu | 百度 | /weibo | 微博 |
| /douyin | 抖音 | /zhihu | 知乎 |
| /bilibili | 哔哩哔哩 | /github | GitHub |
| /toutiao | 今日头条 | /csdn | CSDN |
| /v2ex | V2EX | /douban | 豆瓣 |
| /hupu | 虎扑 | /ithome | IT之家 |
| /sougou | 搜狗 | /qqnews | 腾讯新闻 |
| /pengpai | 澎湃新闻 | /cctv | CCTV |
| /renmin | 人民网 | /wangyinews | 网易新闻 |
| /acfun | AcFun | /dongqiudi | 懂球帝 |
| /tieba | 百度贴吧 | /36kr | 36氪 |
| /lishipin | 梨视频 | /shaoshupai | 少数派 |
| /souhu | 搜狐 | /quark | 夸克 |
| /xinjingbao | 新京报 | /nanfang | 南方周末 |
| /guojiadili | 国家地理 | /history | 历史上的今天 |
| /360search | 360搜索 | **/all** | **聚合所有源** |
| /health | 健康检查 | | |

### 响应格式

```json
{
  "code": 200,
  "message": "百度",
  "icon": "https://www.baidu.com/favicon.ico",
  "obj": [
    { "index": 1, "title": "热搜标题", "url": "...", "hotValue": "12345" }
  ]
}
```

---

## 四、配置

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| PORT | 1111 | 监听端口 |
| RELEASE | false | Gin Release 模式 |
| ENV | development | 环境标识 |

---

## 五、快速开始

```bash
# 运行
go run main.go

# 或编译后运行
go build -o hot-search-api .
./hot-search-api
```

---

## 六、项目结构

```
├── main.go        # 入口 + 路由注册
├── all/all.go     # 聚合逻辑（并发 + 超时控制）
├── app/           # 30+ 数据源实现
└── utils/utils.go # 共享工具（HTTP/JSON/响应构建）
```

---

## 七、相关项目

* **hot_searches_for_apps** — 热搜归档脚本（每小时定时拉取）

---

## 八、设计亮点

1. **并发聚合**：使用 goroutine 并发抓取多个平台数据，设置超时控制（8 秒），避免单个慢源阻塞整个 API
2. **统一响应格式**：所有数据源返回相同的 JSON 结构，便于客户端处理
3. **零外部依赖**：编译为单个二进制文件，方便部署
4. **健康检查端点**：便于容器化和监控
