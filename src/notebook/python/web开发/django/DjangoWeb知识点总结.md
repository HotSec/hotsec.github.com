# Django Web 开发知识点全面总结

---

## 一、Django 框架概述

Django 是 Python 世界最成熟的全功能 Web 框架，被 Instagram、Spotify、Pinterest、Mozilla 等大型产品采用。它以 **"Batteries Included"（自带电池）** 的设计哲学著称，内置了 ORM、Admin 管理后台、认证系统、缓存框架、Form 验证等企业级开发所需的全套组件 [1]。

### Django 核心特点：
| 特点 | 说明 |
|------|------|
| **完整性** | 开箱即用，提供开发者所需几乎所有功能 |
| **安全性** | 默认防护 SQL 注入、XSS、CSRF、点击劫持等 |
| **可扩展性** | "无共享"架构，各层可独立扩展 |
| **可维护性** | 遵循 DRY 原则，鼓励代码复用 |
| **可移植性** | 基于 Python，跨平台运行 |

---

## 二、MTV 架构模式

Django 采用 **MTV（Model-Template-View）** 设计模式，本质上是 MVC 的变体 [1][2]：

```
┌───────────────────────────────────────────────────────┐
│              MTV 架构交互流程                          │
│                                                       │
│  用户请求 → URLconf路由匹配 → View(业务逻辑)          │
│                                ↕                      │
│                           Model(数据层)               │
│                                ↕                      │
│                          Template(展示层)              │
│                                ↓                      │
│                          HTTP响应 → 用户               │
└───────────────────────────────────────────────────────┘
```

### MTV vs MVC 对应关系 [1][2]：

| MTV (Django) | 职责 | 对应 MVC |
|---|---|---|
| **Model** | 数据模型与数据库交互 | MVC 的 Model |
| **Template** | 页面展示（HTML渲染） | MVC 的 View |
| **View** | 业务逻辑与请求处理 | MVC 的 Controller |
| **URLconf** | URL 路由分发 | Django 额外组件 |

> **为什么 Django 用 MTV？** 框架自动处理路由和控制逻辑，开发者只需关注 Model-View-Template；模板引擎默认转义变量，避免 XSS 攻击 [2]。

---

## 三、项目结构与创建

### 3.1 项目目录结构 [3][5]：

```
myproject/
├── manage.py              # 项目管理命令行工具
├── myproject/             # 项目配置目录
│   ├── __init__.py
│   ├── settings.py        # 全局配置文件
│   ├── urls.py            # 根路由配置
│   ├── wsgi.py            # WSGI 入口
│   └── asgi.py            # ASGI 入口
└── myapp/                 # 子应用目录
    ├── __init__.py
    ├── admin.py           # 管理后台配置
    ├── apps.py            # 应用配置
    ├── models.py          # 数据模型
    ├── views.py           # 视图函数
    ├── urls.py            # 子路由
    ├── tests.py           # 测试用例
    ├── migrations/        # 数据库迁移文件
    ├── templates/         # 模板文件
    └── static/            # 静态文件
```

### 3.2 常用命令：

```bash
# 创建项目
django-admin startproject myproject

# 创建子应用
python manage.py startapp myapp

# 运行开发服务器
python manage.py runserver 0.0.0.0:8000

# 数据库迁移
python manage.py makemigrations
python manage.py migrate

# 创建超级用户
python manage.py createsuperuser

# 进入 Shell
python manage.py shell
```

---

## 四、请求生命周期

这是 Django 面试中的 **第一高频题** [1]：

```
用户请求
  → WSGI Server
    → Django WSGIHandler
      → 中间件 process_request（由上至下）
        → URLconf 路由匹配
          → 中间件 process_view
            → View 视图处理
          → 中间件 process_template_response
        → 中间件 process_response（由下至上）
      → (异常时: process_exception)
    → WSGI Server
  → 用户响应
```

---

## 五、URL 路由（URLconf）

### 5.1 路由定义 [5]：

```python
# 项目主路由 urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),  # 包含子路由
]

# 子应用路由 users/urls.py
from django.urls import path, re_path
from . import views

app_name = 'users'  # 命名空间

urlpatterns = [
    path('', views.index, name='index'),
    path('detail/<int:id>/', views.detail, name='detail'),
    re_path(r'^search/(?P<city>[a-z]+)/(?P<year>\d{4})/$', views.search),
]
```

### 5.2 路由要点 [5]：
- **解析顺序**：先总后子，从上至下
- **正则路由**：`^` 开头 `$` 结尾，避免屏蔽效应
- **路径参数**：`<int:id>`、`<str:name>`、`<slug:slug>`
- **命名参数**：`(?P<name>pattern)`

### 5.3 反向解析（reverse）[5]：

```python
from django.urls import reverse

# 视图中使用
url = reverse('users:detail', kwargs={'id': 1})  # /users/detail/1/

# 模板中使用
<a href="{% url 'users:detail' id=1 %}">详情</a>
```

---

## 六、视图层

### 6.1 函数视图（FBV）：

```python
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect

def article_list(request):
    articles = Article.objects.all()
    return render(request, 'articles/list.html', {'articles': articles})

def api_data(request):
    data = {'city': 'shenzhen', 'skill': 'python'}
    return JsonResponse(data)
```

### 6.2 类视图（CBV）[5]：

```python
from django.views import View

class ArticleView(View):
    def get(self, request):
        # 处理 GET 请求
        return HttpResponse("GET 请求")

    def post(self, request):
        # 处理 POST 请求
        return HttpResponse("POST 请求")

# 路由配置
urlpatterns = [
    path('article/', ArticleView.as_view()),
]
```

**`as_view()` 底层原理**：调用 `as_view()` → 内部 `view()` 函数 → `dispatch()` 方法根据请求方法自动分发到对应的 `get()`/`post()` 等方法 [5]。

### 6.3 请求参数获取 [5]：

| 传参方式 | 获取方法 |
|---|---|
| **查询字符串** `?a=1&b=2` | `request.GET.get('a')` |
| **路径参数** `/detail/1/` | 视图函数参数 `def detail(request, id)` |
| **表单数据** (POST) | `request.POST.get('key')` |
| **JSON 数据** | `json.loads(request.body)` |
| **请求头** | `request.META['HTTP_HEADER_NAME']` |

### 6.4 响应类型 [5]：

```python
# HttpResponse
return HttpResponse(content, content_type='application/json', status=200)

# JsonResponse（自动设置 Content-Type）
return JsonResponse({'key': 'value'})

# 重定向
return redirect('/some/url/')
return redirect(reverse('app:name'))
```

### 6.5 类视图装饰器 [5]：

```python
from django.utils.decorators import method_decorator

# 方式一：装饰特定方法
class MyView(View):
    @method_decorator(login_required)
    def get(self, request):
        ...

# 方式二：装饰整个类（通过 dispatch）
@method_decorator(login_required, name='dispatch')
class MyView(View):
    ...

# 方式三：Mixin 扩展类
class LoginRequiredMixin(object):
    @classmethod
    def as_view(cls, *args, **kwargs):
        view = super().as_view(*args, **kwargs)
        return login_required(view)

class MyView(LoginRequiredMixin, View):
    ...
```

---

## 七、模型层与 ORM

### 7.1 模型定义 [2][3]：

```python
from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=100, verbose_name='标题')
    content = models.TextField(verbose_name='内容')
    author = models.ForeignKey('User', on_delete=models.CASCADE, related_name='articles')
    tags = models.ManyToManyField('Tag', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        db_table = 'articles'
        ordering = ['-created_at']
        verbose_name = '文章'
```

### 7.2 常用字段类型：

| 字段类型 | 说明 |
|---|---|
| `CharField` | 短文本（必须指定 max_length） |
| `TextField` | 长文本 |
| `IntegerField` | 整数 |
| `FloatField` | 浮点数 |
| `BooleanField` | 布尔值 |
| `DateTimeField` | 日期时间 |
| `ForeignKey` | 外键（多对一） |
| `ManyToManyField` | 多对多 |
| `OneToOneField` | 一对一 |
| `ImageField` | 图片 |
| `DecimalField` | 精确小数 |
| `SlugField` | URL 友好字符串 |
| `JSONField` | JSON 数据（Django 3.1+） |

### 7.3 QuerySet 核心特性 [1]：

#### ① 惰性求值
```python
# 以下代码不会执行 SQL
qs = Article.objects.filter(title__contains='Django')
qs = qs.filter(is_published=True)

# 直到以下操作才真正执行 SQL：
list(qs)          # 迭代
qs.count()        # 计数
qs.exists()       # 判断存在
qs.first()        # 获取第一条
len(qs)           # 取长度
```

#### ② 链式调用
```python
Article.objects.filter(is_published=True) \
    .exclude(title__contains='test') \
    .order_by('-created_at')[:10]
```

#### ③ 缓存机制
```python
qs = Article.objects.all()
# 第一次迭代，执行 SQL，结果缓存
for article in qs:
    print(article.title)
# 第二次迭代，使用缓存，不再执行 SQL
for article in qs:
    print(article.title)
```

### 7.4 常用查询 API：

```python
# 基础查询
Article.objects.all()
Article.objects.filter(title__contains='Django')
Article.objects.get(pk=1)          # 不存在抛 DoesNotExist
Article.objects.filter(pk=1).first()  # 不存在返回 None

# 查找类型
Article.objects.filter(title__exact='Hello')      # 精确匹配
Article.objects.filter(title__contains='Hello')   # 包含（LIKE '%Hello%'）
Article.objects.filter(title__icontains='hello')  # 包含（不区分大小写）
Article.objects.filter(id__gt=10)                 # 大于
Article.objects.filter(id__gte=10)                # 大于等于
Article.objects.filter(id__lt=10)                 # 小于
Article.objects.filter(id__in=[1, 2, 3])          # IN 查询
Article.objects.filter(title__startswith='Hello') # 以...开头
Article.objects.filter(title__endswith='World')   # 以...结尾
Article.objects.filter(created_at__range=(start, end))  # 范围

# 排序、去重、切片
Article.objects.order_by('-created_at')
Article.objects.distinct()
Article.objects.all()[:10]   # LIMIT 10
Article.objects.all()[5:15]  # OFFSET 5, LIMIT 10

# 聚合查询
from django.db.models import Count, Sum, Avg, Max, Min
Article.objects.aggregate(avg_views=Avg('views'))
Article.objects.values('author').annotate(count=Count('id'))

# values / values_list
Article.objects.values('title', 'author__name')   # 返回字典列表
Article.objects.values_list('title', flat=True)    # 返回扁平列表
```

### 7.5 N+1 查询优化（⭐面试高频）[1]：

```python
# ❌ N+1 问题：每访问 article.author 都会执行一次 SQL
articles = Article.objects.all()
for article in articles:
    print(article.author.name)  # N 次额外查询！

# ✅ select_related：外键/一对一，使用 JOIN 一次查询
articles = Article.objects.select_related('author').all()
for article in articles:
    print(article.author.name)  # 无额外查询

# ✅ prefetch_related：多对多/反向，使用两次查询 + Python 合并
articles = Article.objects.prefetch_related('tags').all()
for article in articles:
    print([t.name for t in article.tags.all()])  # 无额外查询
```

### 7.6 F 对象与 Q 对象 [1]：

```python
from django.db.models import F, Q

# F 对象：引用字段值（避免竞态条件）
Article.objects.filter(views__gt=F('likes') * 10)
Article.objects.update(views=F('views') + 1)  # 原子操作

# Q 对象：复杂查询条件
Article.objects.filter(
    Q(title__contains='Django') | Q(title__contains='Flask')  # OR
)
Article.objects.filter(
    Q(title__contains='Django') & ~Q(is_published=False)      # AND + NOT
)
```

### 7.7 数据库迁移：

```bash
python manage.py makemigrations   # 生成迁移文件
python manage.py migrate          # 执行迁移
python manage.py showmigrations   # 查看迁移状态
python manage.py sqlmigrate app 0001  # 查看对应 SQL
```

---

## 八、模板层

### 8.1 模板配置与使用 [5]：

```python
# settings.py
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        ...
    },
]

# 视图中渲染模板
from django.shortcuts import render

def index(request):
    context = {'city': '深圳', 'articles': articles}
    return render(request, 'index.html', context)
```

### 8.2 Django 模板语言（DTL）[2][5]：

```html
<!-- 变量输出（自动转义，防 XSS） -->
<h1>{{ article.title }}</h1>

<!-- 标签 -->
{% for article in articles %}
    <h2>{{ article.title }}</h2>
    {% empty %}
        <p>暂无文章</p>
{% endfor %}

{% if article.is_published %}
    <span>已发布</span>
{% else %}
    <span>草稿</span>
{% endif %}

<!-- 过滤器 -->
<p>{{ article.content|truncatewords:30 }}</p>
<p>{{ article.created_at|date:"Y-m-d H:i" }}</p>
<p>{{ article.title|default:"无标题" }}</p>
<p>{{ user_name|length }}</p>

<!-- 模板继承 -->
{% extends "base.html" %}
{% block title %}文章列表{% endblock %}
{% block content %}
    <h1>文章列表</h1>
{% endblock %}

<!-- 包含子模板 -->
{% include "sidebar.html" %}

<!-- 静态文件 -->
{% load static %}
<link rel="stylesheet" href="{% static 'css/style.css' %}">
<script src="{% static 'js/main.js' %}"></script>

<!-- URL 反向解析 -->
<a href="{% url 'articles:detail' article.id %}">查看详情</a>

<!-- CSRF Token（POST 表单必须） -->
<form method="post">
    {% csrf_token %}
    ...
</form>
```

---

## 九、表单

### 9.1 Form 表单：

```python
from django import forms

class ContactForm(forms.Form):
    name = forms.CharField(max_length=100, label='姓名')
    email = forms.EmailField(label='邮箱')
    message = forms.CharField(widget=forms.Textarea, label='消息')

    def clean_email(self):
        email = self.cleaned_data['email']
        if not email.endswith('@company.com'):
            raise forms.ValidationError('请使用公司邮箱')
        return email
```

### 9.2 ModelForm：

```python
class ArticleForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = ['title', 'content', 'author', 'tags']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 10}),
        }
```

### 9.3 视图中使用表单：

```python
def article_create(request):
    if request.method == 'POST':
        form = ArticleForm(request.POST)
        if form.is_valid():
            article = form.save(commit=False)
            article.author = request.user
            article.save()
            return redirect('articles:detail', article.pk)
    else:
        form = ArticleForm()
    return render(request, 'articles/form.html', {'form': form})
```

### 9.4 表单验证流程 [1]：
1. `form.is_valid()` 触发验证
2. 每个字段的 `to_python()` → `validate()` → `run_validators()`
3. 调用 `clean_<fieldname>()` 方法
4. 调用 `clean()` 方法（整体验证）
5. 错误存入 `form.errors` / `field.errors`

---

## 十、中间件

### 10.1 中间件概述 [1][5]：

Django 中间件是轻量级插件系统，可以介入请求和响应处理过程，修改 Django 的输入与输出。它采用 **洋葱模型**。

### 10.2 五个钩子方法 [1]：

| 钩子方法 | 触发时机 |
|---|---|
| `process_request(request)` | 请求进入时 |
| `process_view(request, view_func, args, kwargs)` | 路由匹配后，视图执行前 |
| `process_template_response(request, response)` | 模板渲染时 |
| `process_response(request, response)` | 响应返回时 |
| `process_exception(request, exception)` | 视图抛出异常时 |

### 10.3 自定义中间件：

```python
# 方式一：基于函数
def simple_middleware(get_response):
    def middleware(request):
        # 请求到达视图前的处理
        print(f"请求路径: {request.path}")
        response = get_response(request)
        # 视图返回响应后的处理
        response['X-Custom-Header'] = 'MyValue'
        return response
    return middleware

# 方式二：基于类
class CustomMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # process_request
        response = self.process_request(request)
        if response is not None:
            return response  # 短路返回

        response = self.get_response(request)
        # process_response
        response = self.process_response(request, response)
        return response

    def process_request(self, request):
        return None

    def process_response(self, request, response):
        return response

    def process_exception(self, request, exception):
        # 记录异常日志
        import logging
        logging.error(f"异常: {exception}")
        return None
```

### 10.4 执行顺序（洋葱模型）[1][5]：

```
请求 → Middleware1.process_request
     → Middleware2.process_request
     → Middleware3.process_request
     → Middleware1.process_view
     → Middleware2.process_view
     → Middleware3.process_view
     → 【View 视图执行】
     → Middleware3.process_response
     → Middleware2.process_response
     → Middleware1.process_response
     → 响应

# process_request: 由上至下
# process_response: 由下至上
```

### 10.5 注册中间件（顺序很重要！）[1]：

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 自定义中间件
    'myapp.middleware.CustomMiddleware',
]
```

---

## 十一、认证与安全

### 11.1 用户认证系统：

```python
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

# 注册
from django.contrib.auth.models import User
user = User.objects.create_user('username', 'email@example.com', 'password')

# 登录
def login_view(request):
    user = authenticate(request, username='username', password='password')
    if user is not None:
        login(request, user)
        return redirect('home')

# 登出
def logout_view(request):
    logout(request)
    return redirect('login')

# 登录验证装饰器
@login_required
def profile(request):
    return render(request, 'profile.html')
```

### 11.2 CSRF 防护 [1][5]：

```python
# Django 默认开启 CSRF 防护
# 表单中必须包含 {% csrf_token %}
<form method="post">
    {% csrf_token %}
    ...
</form>

# AJAX 请求需要设置 X-CSRFToken 头
# 豁免 CSRF（仅开发环境使用）
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def api_view(request):
    ...
```

### 11.3 安全中间件 [1]：

| 中间件 | 防护目标 |
|---|---|
| `SecurityMiddleware` | SSL 重定向、HSTS 等 |
| `CsrfViewMiddleware` | 跨站请求伪造 |
| `XFrameOptionsMiddleware` | 点击劫持 |
| 模板自动转义 | XSS 攻击 |
| ORM 参数化查询 | SQL 注入 |

---

## 十二、Cookie 与 Session

### 12.1 Cookie [5]：

```python
# 设置 Cookie
response = HttpResponse("OK")
response.set_cookie('key', 'value', max_age=3600)  # max_age 单位：秒

# 读取 Cookie
value = request.COOKIES.get('key')

# 删除 Cookie
response.delete_cookie('key')
```

**Cookie 特点**：服务端生成，客户端存储；Key-Value 形式；Value 最大 4KB；不安全；基于域名安全 [5]。

### 12.2 Session [5]：

```python
# 设置 Session
request.session['key'] = value

# 读取 Session
value = request.session.get('key', 'default')

# 删除 Session
del request.session['key']           # 删除指定键
request.session.clear()              # 清除所有 Session（删除 value）
request.session.flush()              # 删除整条 Session 数据

# 设置有效期
request.session.set_expiry(3600)     # 3600 秒后过期
request.session.set_expiry(0)        # 浏览器关闭时过期
request.session.set_expiry(None)     # 使用默认值（2周）
```

### 12.3 Session 存储后端 [5]：

```python
# 数据库存储（默认）
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# 本地缓存
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'

# 混合存储（缓存 + 数据库）
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'

# Redis 存储
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"
```

---

## 十三、缓存体系

### 13.1 四级缓存 [1]：

```
1. 全站缓存      → 中间件级别
2. 视图缓存      → @cache_page 装饰器
3. 模板片段缓存  → {% cache %} 标签
4. 底层缓存 API  → cache.set() / cache.get()
```

### 13.2 缓存配置 [1]：

```python
# 开发环境：本地内存缓存
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# 生产环境：Redis
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://localhost:6379/0',
        'TIMEOUT': 300,  # 默认超时 5 分钟
        'KEY_PREFIX': 'myapp_',
    }
}
```

### 13.3 缓存使用：

```python
from django.core.cache import cache
from django.views.decorators.cache import cache_page

# 视图缓存
@cache_page(60 * 5)  # 缓存 5 分钟
def article_list(request):
    ...

# 底层 API
cache.set('key', 'value', timeout=300)
value = cache.get('key')
cache.delete('key')
cache.set_many({'k1': 'v1', 'k2': 'v2'})

# 模板片段缓存
{% load cache %}
{% cache 500 sidebar %}
    <!-- 侧边栏内容 -->
{% endcache %}
```

---

## 十四、Admin 管理后台

```python
from django.contrib import admin
from .models import Article

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'created_at', 'is_published']
    list_filter = ['is_published', 'created_at']
    search_fields = ['title', 'content']
    list_editable = ['is_published']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    fieldsets = (
        ('基本信息', {'fields': ('title', 'author')}),
        ('内容', {'fields': ('content', 'tags')}),
        ('状态', {'fields': ('is_published',)}),
    )
```

---

## 十五、静态文件管理

```python
# settings.py
STATIC_URL = 'static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# 生产环境收集静态文件
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# 媒体文件
MEDIA_URL = 'media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

模板中引用：
```html
{% load static %}
<link rel="stylesheet" href="{% static 'css/style.css' %}">
<img src="{% static 'images/logo.png' %}">
```

---

## 十六、Django REST Framework（DRF）

前后端分离开发中最常用的扩展：

```python
# serializers.py
from rest_framework import serializers

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'

# views.py
from rest_framework import viewsets

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

# urls.py
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('articles', ArticleViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
```

---

## 十七、Settings 配置体系

### 17.1 多环境配置 [1]：

```python
# settings/
├── base.py      # 公共配置
├── dev.py       # 开发环境
├── staging.py   # 预发布环境
└── prod.py      # 生产环境

# 通过环境变量切换
DJANGO_SETTINGS_MODULE=myproject.settings.prod
```

### 17.2 关键配置项 [1][5]：

```python
DEBUG = False                         # 生产必须关闭
SECRET_KEY = os.environ.get('KEY')    # 从环境变量读取
ALLOWED_HOSTS = ['example.com']       # 允许的域名
INSTALLED_APPS = [...]                # 注册应用
MIDDLEWARE = [...]                    # 中间件链
DATABASES = {...}                     # 数据库配置
CACHES = {...}                        # 缓存配置
LANGUAGE_CODE = 'zh-hans'            # 语言
TIME_ZONE = 'Asia/Shanghai'          # 时区
```

---

## 十八、部署

### 18.1 WSGI 部署：

```bash
# 使用 Gunicorn
pip install gunicorn
gunicorn myproject.wsgi:application --bind 0.0.0.0:8000 --workers 4

# Nginx 反向代理配置
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /path/to/staticfiles/;
    }

    location /media/ {
        alias /path/to/media/;
    }
}
```

### 18.2 部署检查清单：

```bash
python manage.py check --deploy
```

需要检查：
- `DEBUG = False`
- `SECRET_KEY` 安全
- `ALLOWED_HOSTS` 配置
- 静态文件收集 (`collectstatic`)
- HTTPS 配置
- 数据库安全

---

## 十九、Django 知识体系全景图

```
Django Web 开发
├── 架构
│   ├── MTV 模式
│   ├── 请求生命周期
│   └── Settings 配置体系
├── 路由层 (URLconf)
│   ├── path / re_path
│   ├── 路由参数 / 命名空间
│   └── reverse 反向解析
├── 视图层
│   ├── FBV 函数视图
│   ├── CBV 类视图
│   ├── 请求对象
│   └── 响应对象
├── 模型层 (ORM)
│   ├── 模型定义 / 字段类型
│   ├── QuerySet (惰性求值/链式调用/缓存)
│   ├── select_related / prefetch_related (N+1优化)
│   ├── F/Q 对象
│   ├── 聚合与注解
│   ├── 事务管理
│   └── 数据库迁移
├── 模板层 (DTL)
│   ├── 变量 / 标签 / 过滤器
│   ├── 模板继承与包含
│   └── 自定义标签和过滤器
├── 表单
│   ├── Form / ModelForm
│   ├── 表单验证流程
│   └── Widget 定制
├── 中间件
│   ├── 五个钩子方法
│   ├── 洋葱模型执行顺序
│   └── 自定义中间件
├── 认证与安全
│   ├── 用户认证系统
│   ├── CSRF 防护
│   ├── XSS 防护 (模板转义)
│   └── SQL 注入防护 (ORM)
├── 状态管理
│   ├── Cookie
│   └── Session (多后端)
├── 缓存体系
│   ├── 全站 / 视图 / 片段 / API 四级缓存
│   └── Redis 后端配置
├── Admin 管理后台
├── 静态文件 / 媒体文件
├── 扩展
│   ├── DRF (REST API)
│   ├── Django Channels (WebSocket)
│   └── Celery (异步任务)
└── 部署
    ├── Gunicorn + Nginx
    ├── Docker
    └── 安全检查清单
```

---

> **参考来源**：本文内容综合自 [1] Django核心机制与企业级实践、[2] Django的MVT设计模式、[3] Django框架数据库ORM模块、[4] Django官方文档、[5] Django框架概述及路由/视图/模板/中间件/Session详解 等资料。