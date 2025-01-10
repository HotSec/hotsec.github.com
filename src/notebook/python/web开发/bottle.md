# bottle

## hello world

```python
from bottle import route, run, template

@route('/hello/<name>')
def index(name):
    return template('<b>Hello {{name}}</b>!', name=name)

run(host='localhost', port=8080)
```

## 路由

### 动态路由

### 静态路由

### 路由分组

### 路由装饰器

## 请求

### 请求头

### 请求参数

### 请求体

## 响应

### 响应头

### 响应体

## 模板

### 模板语法

### 模板继承

## 中间件

## 异常处理

## 静态文件

## 数据库

## 重定向

## cookie

## 文件上传

## 模板

## 部署

## 参考

- [bottle](https://bottlepy.org/docs/dev/tutorial.html)