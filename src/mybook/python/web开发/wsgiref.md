# web框架

- 众所周知，对于所有的Web应用，本质上其实就是一个socket服务端，用户的浏览器其实就是一个socket客户端。

## demo

```html
<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title></title>
</head>
<body>
    <h1>{{name}}</h1>

    <ul>
        {% for item in user_list %}
        <li>{{item}}</li>
        {% endfor %}
    </ul>

</body>
</html>

<!-- index.html -->
```

```py
#!/usr/bin/env python
# -*- coding:utf-8 -*-
 
from wsgiref.simple_server import make_server
from jinja2 import Template
 
 
def index():
    # return 'index'
 
    # template = Template('Hello {{ name }}!')
    # result = template.render(name='John Doe')
 
    f = open('index.html')
    result = f.read()
    template = Template(result)
    data = template.render(name='John Doe', user_list=['alex', 'eric'])
    return data.encode('utf-8')
 
 
def login():
    # return 'login'
    f = open('login.html')
    data = f.read()
    return data
 
 
def routers():
 
    urlpatterns = (
        ('/index/', index),
        ('/login/', login),
    )
 
    return urlpatterns
 
 
def run_server(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/html')])
    url = environ['PATH_INFO']
    urlpatterns = routers()
    func = None
    for item in urlpatterns:
        if item[0] == url:
            func = item[1]
            break
    if func:
        return func()
    else:
        return '404 not found'
 
 
if __name__ == '__main__':
    httpd = make_server('', 8000, run_server)
    print "Serving HTTP on port 8000..."
    httpd.serve_forever()
```
