# django-rest-framework

## 基础

- FBV
- CBV
  - 类+反射，

drf请求流程

修改默认django配置,移除不用的功能

```python
INSTALLED_APPS = [
    # 'django.contrib.admin',
    # 'django.contrib.auth',
    # 'django.contrib.contenttypes',
    # 'django.contrib.sessions',
    # 'django.contrib.messages',
    'django.contrib.staticfiles',
    

    'rest_framework',
]
 
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # 'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    # 'django.contrib.auth.middleware.AuthenticationMiddleware',
    # 'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
 
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                # 'django.contrib.auth.context_processors.auth',
                # 'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
 
 
# drf配置
REST_FRAMEWORK = {
    "UNAUTHENTICATED_USER": None
}
```

## 序列化与反序列化

- Serializer
- ModelSerializer
- 

### 数据校验

## 视图

## 认证

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.BasicAuthentication',   # 基本认证
        'rest_framework.authentication.SessionAuthentication',  # session认证
    )
}

from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.views import APIView

class ExampleView(APIView):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    ...
```

认证失败会有两种可能的返回值：

401 Unauthorized 未认证
403 Permission Denied 权限被禁止

## 权限

```python

AllowAny 允许所有用户
IsAuthenticated 仅通过认证的用户
IsAdminUser 仅管理员用户
IsAuthenticatedOrReadOnly 认证的用户可以完全操作，否则只能 get 读取


REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    )
}


from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

class ExampleView(APIView):
    permission_classes = (IsAuthenticated,)
    ...
```

## 自定义权限 

如需自定义权限，需继承 rest_framework.permissions.BasePermission 父类，并实现以下两个任何一个方法或全部

- .has_permission(self, request, view)
  - 是否可以访问视图， view 表示当前视图对象

- .has_object_permission(self, request, view, obj)
  - 是否可以访问数据对象， view 表示当前视图， obj 为数据对象

```python
class MyPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        """控制对obj对象的访问权限，此案例决绝所有对对象的访问"""
        return False

class BookInfoViewSet(ModelViewSet):
    queryset = BookInfo.objects.all()
    serializer_class = BookInfoSerializer
    permission_classes = [IsAuthenticated, MyPermission]
```


## jwt认证

## 路由

## 分页

## filter

## 限流

- AnonRateThrottle：限制所有匿名未认证用户，使用 IP 区分用户。使用 DEFAULT_THROTTLE_RATES['anon'] 来设置频次
- UserRateThrottle：限制认证用户，使用 User id 来区分。使用 DEFAULT_THROTTLE_RATES['user'] 来设置频次
- ScopedRateThrottle：限制用户对于每个视图的访问频次，使用 ip 或 user id。

```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day'
    }
}


from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

class ExampleView(APIView):
    throttle_classes = (UserRateThrottle,)
    ...
```

## 过滤

```python
# 在配置文件中增加过滤后端的设置
INSTALLED_APPS = [
    ...
    'django_filters',  # 需要注册应用，
]

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': ('django_filters.rest_framework.DjangoFilterBackend',)
}


# 在视图中添加 filter_fields 属性，指定可以过滤的字段
class BookListView(ListAPIView):
    queryset = BookInfo.objects.all()
    serializer_class = BookInfoSerializer
    filter_fields = ('btitle', 'bread')

# 127.0.0.1:8000/books/?btitle=西游记

```

## 版本

```python
# 在配置文件中增加版本控制的设置
REST_FRAMEWORK = {
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.URLPathVersioning',
    'ALLOWED_VERSIONS': ['v1', 'v2'],
    'VERSION_PARAM': 'version',
    'DEFAULT_VERSION': 'v1'
}

# 在视图中添加 versioning_class 属性，指定版本控制的类
class BookListView(ListAPIView):
    queryset = BookInfo.objects.all()
    serializer_class = BookInfoSerializer
    versioning_class = URLPathVersioning
```

## 解析器

- JSONParser
- FormParser
- MultiPartParser
- FileUploadParser

```python
# 在配置文件中增加解析器的设置
REST_FRAMEWORK = {
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    )
}
```

## API文档

- drf-yasg
- coreapi