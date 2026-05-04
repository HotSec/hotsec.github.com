# Scrapy

Scrapy 是 Python 最流行的异步爬虫框架，基于 Twisted 异步网络库。

## 安装

```bash
pip install scrapy
```

## 创建项目

```bash
scrapy startproject myproject
cd myproject
scrapy genspider example example.com
```

## Spider 示例

```python
import scrapy

class QuotesSpider(scrapy.Spider):
    name = "quotes"
    start_urls = ["https://quotes.toscrape.com"]

    def parse(self, response):
        for quote in response.css("div.quote"):
            yield {
                "text": quote.css("span.text::text").get(),
                "author": quote.css("small.author::text").get(),
                "tags": quote.css("div.tags a.tag::text").getall(),
            }

        next_page = response.css("li.next a::attr(href)").get()
        if next_page:
            yield response.follow(next_page, self.parse)
```

## 核心组件

| 组件 | 说明 |
|------|------|
| Spider | 定义爬取逻辑和解析规则 |
| Item | 结构化数据容器 |
| Pipeline | 数据清洗/验证/存储 |
| Middleware | 请求/响应中间件（UA/代理/Cookie） |
| Selector | CSS / XPath 选择器 |

## Pipeline

```python
class MongoPipeline:
    def open_spider(self, spider):
        self.client = pymongo.MongoClient()
        self.db = self.client["scrapy_db"]

    def process_item(self, item, spider):
        self.db["quotes"].insert_one(dict(item))
        return item
```

## 中间件

```python
class RotateUserAgentMiddleware:
    def process_request(self, request, spider):
        request.headers["User-Agent"] = random.choice(UA_LIST)
```

## 运行

```bash
scrapy crawl quotes -o quotes.json
scrapy crawl quotes -o quotes.csv
```
