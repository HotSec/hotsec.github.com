# Tornado

```python
#!/usr/bin/env python
# -*- coding:utf-8 -*-
  
import tornado.ioloop
import tornado.web
  
  
class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world")
  
application = tornado.web.Application([
    (r"/index", MainHandler),
])
  
  
if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
```

异步非阻塞实例

```py
#!/usr/bin/env python
# -*- coding:utf-8 -*-

import tornado.ioloop
import tornado.web
from tornado import httpclient
from tornado.web import asynchronous
from tornado import gen

import uimodules as md
import uimethods as mt

class MainHandler(tornado.web.RequestHandler):
        @asynchronous
        @gen.coroutine
        def get(self):
            print 'start get '
            http = httpclient.AsyncHTTPClient()
            http.fetch("http://127.0.0.1:8008/post/", self.callback)
            self.write('end')

        def callback(self, response):
            print response.body

settings = {
    'template_path': 'template',
    'static_path': 'static',
    'static_url_prefix': '/static/',
    'ui_methods': mt,
    'ui_modules': md,
}

application = tornado.web.Application([
    (r"/index", MainHandler),
], **settings)


if __name__ == "__main__":
    application.listen(8009)
    tornado.ioloop.IOLoop.instance().start()

```

## 路由

- 路由系统其实就是 url 和 类 的对应关系，这里不同于其他框架，其他很多框架均是 url 对应 函数，Tornado中每个url对应的是一个类。

```py
#!/usr/bin/env python
# -*- coding:utf-8 -*-
  
import tornado.ioloop
import tornado.web
  
  
class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world")
  
class StoryHandler(tornado.web.RequestHandler):
    def get(self, story_id):
        self.write("You requested the story " + story_id)
  
class BuyHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("buy.wupeiqi.com/index")
  
application = tornado.web.Application([
    (r"/index", MainHandler),
    (r"/story/([0-9]+)", StoryHandler),
])
  
application.add_handlers('buy.wupeiqi.com$', [
    (r'/index',BuyHandler),
])
  
if __name__ == "__main__":
    application.listen(80)
    tornado.ioloop.IOLoop.instance().start()
```

## 模板

## 静态文件

## csrf

## cookie

## ajax上传文件

## 自定义session

## 自定义模型绑定