# flask

## 安装

`pip install flask`

## 最小化

```python
from flask import Flask
app = Flask(__name__)
 
@app.route("/")
def hello():
    return "Hello World!"
 
if __name__ == "__main__":
    app.run()
```

## 项目结构

```bash
my_flask_app/
│
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   └── auth.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── templates/
│   │   ├── layout.html
│   │   └── home.html
│   └── static/
│       ├── css/
│       └── js/
│
├── config.py
├── requirements.txt
├── migrations/
│   └── ...
└── run.py
```


## 路由

## 视图函数

## 静态文件

## jinja

```bash
{{ 变量名 }}：用于输出变量的值。
{% 语句 %}：用于执行语句，例如循环、条件判断等。
{% raw %}...{% endraw %}：用于输出原始的 HTML 代码，不进行转义。

{% extends 'base.html' %}：用于继承其他模板文件。
{% block block_name %}...{% endblock %}：用于定义一个可被继承的块。

```

### 模板继承

base.html
```html
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}My Website{% endblock %}</title>
</head>
<body>
    {% block content %}
    <h1>Welcome to my website!</h1>
    {% endblock %}
</body>
</html>
```

```html
{% extends "base.html" %}

{% block title %}Home{% endblock %}

{% block content %}
<h1>Home</h1>
<p>Welcome to the home page!</p>
{% endblock %}
```

### 条件语句 
```html
{% if user %}
    <p>Welcome, {{ user }}!</p>
{% else %}
    <p>Please log in.</p>
{% endif %}
```
### 循环

```html
<ul>
{% for item in items %}
    <li>{{ item }}</li>
{% endfor %}
</ul>
```

### 过滤器

`{{ name|capitalize }}`：将 name 变量的值首字母大写。

`{{ price|round(2) }}`：将 price 变量的值四舍五入到小数点后两位。

### 宏和模板包含
```html
## templates/macros.html ##
{% macro render_item(item) %}
    <div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
    </div>
{% endmacro %}

## index.html ## 
{% from "macros.html" import render_item %}

<h1>Items</h1>
{% for item in items %}
    {{ render_item(item) }}
{% endfor %}
```

## 表单

templates/form.html

```html
<!DOCTYPE html>
<html>
<head>
    <title>Form Example</title>
</head>
<body>
    <form action="/submit" method="post">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name">
        <br>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email">
        <br>
        <input type="submit" value="Submit">
    </form>
</body>
</html>
```

app.py

```python
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def form():
    return render_template('form.html')

@app.route('/submit', methods=['POST'])
def submit():
    name = request.form.get('name')
    email = request.form.get('email')
    return f'Name: {name}, Email: {email}'

if __name__ == '__main__':
    app.run(debug=True)
```


### Flask-WTF

```python
from flask import Flask, render_template, redirect, url_for
from flask_wtf import FlaskForm
from wtforms import StringField, EmailField, SubmitField
from wtforms.validators import DataRequired, Email

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # 配置一个密钥来启用 CSRF 保护

class MyForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired()])
    email = EmailField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Submit')

@app.route('/', methods=['GET', 'POST'])
def form():
    form = MyForm()
    if form.validate_on_submit():
        name = form.name.data
        email = form.email.data
        return f'Name: {name}, Email: {email}'
    return render_template('form.html', form=form)

if __name__ == '__main__':
    app.run(debug=True)
```

templates/form.html

```html
<!DOCTYPE html>
<html>
<head>
    <title>Form Example</title>
</head>
<body>
    <form method="post">
        {{ form.hidden_tag() }} <!--生成隐藏字段，用于保护表单免受 CSRF 攻击。-->
        <div>
            {{ form.name.label }}<br>
            {{ form.name(size=32) }}
        </div>
        <div>
            {{ form.email.label }}<br>
            {{ form.email(size=32) }}
        </div>
        <div>
            {{ form.submit() }}
        </div>
    </form>
</body>
</html>
```

### 文件上传

templates/upload.html

```html
<!DOCTYPE html>
<html>
<head>
    <title>Upload File</title>
</head>
<body>
    <form action="/upload" method="post" enctype="multipart/form-data">
        <label for="file">File:</label>
        <input type="file" id="file" name="file">
        <br>
        <input type="submit" value="Upload">
    </form>
</body>
</html>
```

app.py

```python
from flask import Flask, request, redirect, url_for

app = Flask(__name__)
app.secret_key = 'your_secret_key'

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files.get('file') # 获取上传的文件对象。
    if file:
        filename = file.filename
        file.save(f'uploads/{filename}') # 保存文件到指定目录。
        return f'File uploaded successfully: {filename}'
    return 'No file uploaded'

if __name__ == '__main__':
    app.run(debug=True)
```

## 蓝图Blueprint

```python
# users.py
from flask import Blueprint
​
user_app=Blueprint('user_app',__name__)
​
@user_app.route('/login')
def login():
    return '''
        <form action="/index">
        <input type="text" value="123"/>
        <button type="submit">Login</button>
        <form>
    '''
@user_app.route('/get_user')
def get_users():
    return {
        'username':'张三',
        'password':'123456',
    }

# main.py
from flask import  Blueprint
from users import user_app
​
app = Flask(__name__)
app.register_blueprint(user_app)
​
@app.route('/index')
def index():
    return 'hello world'
```

## 错误处理


### 处理HTTP错误

```python
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return 'Welcome to the homepage!'

@app.route('/test/404')
def index():
    abort(404)  # abort函数 抛出404错误 

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    app.run()
```

### 处理自定义错误

```python
from flask import Flask, render_template

app = Flask(__name__)

class CustomError(Exception):
    pass

@app.route('/')
def index():
    raise CustomError('This is a custom error')

@app.errorhandler(CustomError)
def handle_custom_error(error):
    return render_template('custom_error.html'), 500

if __name__ == '__main__':
    app.run()
```

## 模板

## 数据库

## 表单

## 文件上传

## 邮件

## 日志

## 中间件

## 路由

### 路由参数

## flash闪现消息

## ProxyFix

在使用 Flask 开发 Web 应用时，如果应用部署在反向代理服务器（如 Nginx）之后，可能会遇到 `request.remote_addr` 获取到的 IP 地址不正确的问题。这是因为 Flask 默认情况下无法正确获取到客户端的真实 IP 地址，而是直接获取到反向代理服务器的 IP 地址。

为了解决这个问题，可以使用 Flask 的 `ProxyFix` 中间件来修复这个问题。`ProxyFix` 中间件会根据反向代理服务器传递过来的 HTTP 头部信息来修正 `request.remote_addr` 的值。

```python
from flask import Flask, request
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app)

@app.route('/')
def index():
    client_ip = request.remote_addr
    return f'Hello, your IP address is {client_ip}'

if __name__ == '__main__':
    app.run()
```

## 测试

## cors

## 部署

### gunicorn

`pip install gunicorn`

`gunicorn -w 4 main:app`

## 自定义扩展

添加了一个自定义响应头

myextension.py 

```python
class MyExtension:
    def __init__(self, app=None):
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        app.config.setdefault('MY_EXTENSION_CONFIG', 'default_value')
        app.after_request(self.after_request)

    def after_request(self, response):
        response.headers['X-My-Extension'] = 'MyValue'
        return response
```

app.py 

```python
from flask import Flask
from myextension import MyExtension

app = Flask(__name__)
app.config['MY_EXTENSION_CONFIG'] = 'custom_value'
app.extensions['myextension'] = MyExtension(app)

@app.route('/')
def index():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run()
```