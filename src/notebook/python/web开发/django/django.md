# Django

比较适合个人或者微小团队开发。

发现一个写后台管理类的项目，使用django开发效率比其它的高多了。

## 入门

```py

$ pip install django
$ django-admin startproject mysite

(.venv) ➜  task tree
.
├── manage.py
└── mysite
    ├── asgi.py
    ├── __init__.py
    ├── settings.py
    ├── urls.py
    └── wsgi.py

1 directory, 6 files

python manage.py migrate
python manage.py runserver

python manage.py startapp learning_logs
python manage.py createsuperuser
```


## 配置文件



## 路由

## 模板

## 中间件

## 自定义中间件

1、创建中间件类

```py
class RequestExeute(object):
      
    def process_request(self,request):
        pass
    def process_view(self, request, callback, callback_args, callback_kwargs):
        i =1
        pass
    def process_exception(self, request, exception):
        pass
      
    def process_response(self, request, response):
        return response
```

2、注册中间件

```py
MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'wupeiqi.middleware.auth.RequestExeute',
)
```

## django admin

- django amdin是django提供的一个后台管理页面，改管理页面提供完善的html和css，使得你在通过Model创建完数据库表之后，就可以对数据进行增删改查，而使用django admin 则需要以下步骤：

- 创建后台管理员
- 配置url
- 注册和配置django admin后台管理页面

1. 创建后台管理员

`python manage.py createsuperuser`
2. 配置后台管理url

`url(r'^admin/', include(admin.site.urls))`

3、注册和配置django admin 后台管理页面

```py
###########################################
# 打开表之后，设定默认显示，需要在model中作如下配置

class UserType(models.Model):
    name = models.CharField(max_length=50)
  
    def __unicode__(self):
        return self.name

    # 设置数据表名称
    class Meta:
        verbose_name = '用户类型'
        verbose_name_plural = '用户类型'
############################################

from django.contrib import admin
  
from app01 import  models
  
class UserInfoAdmin(admin.ModelAdmin):
    list_display = ('username', 'password', 'email')
    search_fields = ('username', 'email') # 为数据表添加搜索功能
    list_filter = ('username', 'email') # 添加快速过滤
      
  
  
admin.site.register(models.UserType)
admin.site.register(models.UserInfo,UserInfoAdmin)
admin.site.register(models.UserGroup)
admin.site.register(models.Asset)
```

## model

关系对象映射（Object Relational Mapping) ，简称ORM。

```python
from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=30)
    email = models.EmailField()
    def __str__(self):
        return self.name
```

```py
AutoField(Field)
        - int自增列，必须填入参数 primary_key=True

    BigAutoField(AutoField)
        - bigint自增列，必须填入参数 primary_key=True

        注：当model中如果没有自增列，则自动会创建一个列名为id的列
        from django.db import models

        class UserInfo(models.Model):
            # 自动创建一个列名为id的且为自增的整数列
            username = models.CharField(max_length=32)

        class Group(models.Model):
            # 自定义自增列
            nid = models.AutoField(primary_key=True)
            name = models.CharField(max_length=32)

    SmallIntegerField(IntegerField):
        - 小整数 -32768 ～ 32767

    PositiveSmallIntegerField(PositiveIntegerRelDbTypeMixin, IntegerField)
        - 正小整数 0 ～ 32767
    IntegerField(Field)
        - 整数列(有符号的) -2147483648 ～ 2147483647

    PositiveIntegerField(PositiveIntegerRelDbTypeMixin, IntegerField)
        - 正整数 0 ～ 2147483647

    BigIntegerField(IntegerField):
        - 长整型(有符号的) -9223372036854775808 ～ 9223372036854775807

    自定义无符号整数字段

        class UnsignedIntegerField(models.IntegerField):
            def db_type(self, connection):
                return 'integer UNSIGNED'

        PS: 返回值为字段在数据库中的属性，Django字段默认的值为：
            'AutoField': 'integer AUTO_INCREMENT',
            'BigAutoField': 'bigint AUTO_INCREMENT',
            'BinaryField': 'longblob',
            'BooleanField': 'bool',
            'CharField': 'varchar(%(max_length)s)',
            'CommaSeparatedIntegerField': 'varchar(%(max_length)s)',
            'DateField': 'date',
            'DateTimeField': 'datetime',
            'DecimalField': 'numeric(%(max_digits)s, %(decimal_places)s)',
            'DurationField': 'bigint',
            'FileField': 'varchar(%(max_length)s)',
            'FilePathField': 'varchar(%(max_length)s)',
            'FloatField': 'double precision',
            'IntegerField': 'integer',
            'BigIntegerField': 'bigint',
            'IPAddressField': 'char(15)',
            'GenericIPAddressField': 'char(39)',
            'NullBooleanField': 'bool',
            'OneToOneField': 'integer',
            'PositiveIntegerField': 'integer UNSIGNED',
            'PositiveSmallIntegerField': 'smallint UNSIGNED',
            'SlugField': 'varchar(%(max_length)s)',
            'SmallIntegerField': 'smallint',
            'TextField': 'longtext',
            'TimeField': 'time',
            'UUIDField': 'char(32)',

    BooleanField(Field)
        - 布尔值类型

    NullBooleanField(Field):
        - 可以为空的布尔值

    CharField(Field)
        - 字符类型
        - 必须提供max_length参数， max_length表示字符长度

    TextField(Field)
        - 文本类型

    EmailField(CharField)：
        - 字符串类型，Django Admin以及ModelForm中提供验证机制

    IPAddressField(Field)
        - 字符串类型，Django Admin以及ModelForm中提供验证 IPV4 机制

    GenericIPAddressField(Field)
        - 字符串类型，Django Admin以及ModelForm中提供验证 Ipv4和Ipv6
        - 参数：
            protocol，用于指定Ipv4或Ipv6， 'both',"ipv4","ipv6"
            unpack_ipv4， 如果指定为True，则输入::ffff:192.0.2.1时候，可解析为192.0.2.1，开启刺功能，需要protocol="both"

    URLField(CharField)
        - 字符串类型，Django Admin以及ModelForm中提供验证 URL

    SlugField(CharField)
        - 字符串类型，Django Admin以及ModelForm中提供验证支持 字母、数字、下划线、连接符（减号）

    CommaSeparatedIntegerField(CharField)
        - 字符串类型，格式必须为逗号分割的数字

    UUIDField(Field)
        - 字符串类型，Django Admin以及ModelForm中提供对UUID格式的验证

    FilePathField(Field)
        - 字符串，Django Admin以及ModelForm中提供读取文件夹下文件的功能
        - 参数：
                path,                      文件夹路径
                match=None,                正则匹配
                recursive=False,           递归下面的文件夹
                allow_files=True,          允许文件
                allow_folders=False,       允许文件夹

    FileField(Field)
        - 字符串，路径保存在数据库，文件上传到指定目录
        - 参数：
            upload_to = ""      上传文件的保存路径
            storage = None      存储组件，默认django.core.files.storage.FileSystemStorage

    ImageField(FileField)
        - 字符串，路径保存在数据库，文件上传到指定目录
        - 参数：
            upload_to = ""      上传文件的保存路径
            storage = None      存储组件，默认django.core.files.storage.FileSystemStorage
            width_field=None,   上传图片的高度保存的数据库字段名（字符串）
            height_field=None   上传图片的宽度保存的数据库字段名（字符串）

    DateTimeField(DateField)
        - 日期+时间格式 YYYY-MM-DD HH:MM[:ss[.uuuuuu]][TZ]

    DateField(DateTimeCheckMixin, Field)
        - 日期格式      YYYY-MM-DD

    TimeField(DateTimeCheckMixin, Field)
        - 时间格式      HH:MM[:ss[.uuuuuu]]

    DurationField(Field)
        - 长整数，时间间隔，数据库中按照bigint存储，ORM中获取的值为datetime.timedelta类型

    FloatField(Field)
        - 浮点型

    DecimalField(Field)
        - 10进制小数
        - 参数：
            max_digits，小数总长度
            decimal_places，小数位长度

    BinaryField(Field)
        - 二进制类型
```

### 连表结构

- 一对多：models.ForeignKey(其他表)
- 多对多：models.ManyToManyField(其他表)
- 一对一：models.OneToOneField(其他表)

应用场景：

- 一对多：当一张表中创建一行数据时，有一个单选的下拉框（可以被重复选择）
  - 例如：创建用户信息时候，需要选择一个用户类型【普通用户】【金牌用户】【铂金用户】等。
- 多对多：在某表中创建一行数据是，有一个可以多选的下拉框
  - 例如：创建用户信息，需要为用户指定多个爱好
- 一对一：在某表中创建一行数据时，有一个单选的下拉框（下拉框中的内容被用过一次就消失了
  - 例如：原有含10列数据的一张表保存相关信息，经过一段时间之后，10列无法满足需求，需要为原来的表再添加5列数据

```bash
ForeignKey(ForeignObject) # ForeignObject(RelatedField)
        to,                         # 要进行关联的表名
        to_field=None,              # 要关联的表中的字段名称
        on_delete=None,             # 当删除关联表中的数据时，当前表与其关联的行的行为
                                        - models.CASCADE，删除关联数据，与之关联也删除
                                        - models.DO_NOTHING，删除关联数据，引发错误IntegrityError
                                        - models.PROTECT，删除关联数据，引发错误ProtectedError
                                        - models.SET_NULL，删除关联数据，与之关联的值设置为null（前提FK字段需要设置为可空）
                                        - models.SET_DEFAULT，删除关联数据，与之关联的值设置为默认值（前提FK字段需要设置默认值）
                                        - models.SET，删除关联数据，
                                                      a. 与之关联的值设置为指定值，设置：models.SET(值)
                                                      b. 与之关联的值设置为可执行对象的返回值，设置：models.SET(可执行对象)

                                                        def func():
                                                            return 10

                                                        class MyModel(models.Model):
                                                            user = models.ForeignKey(
                                                                to="User",
                                                                to_field="id"
                                                                on_delete=models.SET(func),)
        related_name=None,          # 反向操作时，使用的字段名，用于代替 【表名_set】 如： obj.表名_set.all()
        related_query_name=None,    # 反向操作时，使用的连接前缀，用于替换【表名】     如： models.UserGroup.objects.filter(表名__字段名=1).values('表名__字段名')
        limit_choices_to=None,      # 在Admin或ModelForm中显示关联数据时，提供的条件：
                                    # 如：
                                            - limit_choices_to={'nid__gt': 5}
                                            - limit_choices_to=lambda : {'nid__gt': 5}

                                            from django.db.models import Q
                                            - limit_choices_to=Q(nid__gt=10)
                                            - limit_choices_to=Q(nid=8) | Q(nid__gt=10)
                                            - limit_choices_to=lambda : Q(Q(nid=8) | Q(nid__gt=10)) & Q(caption='root')
        db_constraint=True          # 是否在数据库中创建外键约束
        parent_link=False           # 在Admin中是否显示关联数据


    OneToOneField(ForeignKey)
        to,                         # 要进行关联的表名
        to_field=None               # 要关联的表中的字段名称
        on_delete=None,             # 当删除关联表中的数据时，当前表与其关联的行的行为

                                    ###### 对于一对一 ######
                                    # 1. 一对一其实就是 一对多 + 唯一索引
                                    # 2.当两个类之间有继承关系时，默认会创建一个一对一字段
                                    # 如下会在A表中额外增加一个c_ptr_id列且唯一：
                                            class C(models.Model):
                                                nid = models.AutoField(primary_key=True)
                                                part = models.CharField(max_length=12)

                                            class A(C):
                                                id = models.AutoField(primary_key=True)
                                                code = models.CharField(max_length=1)

    ManyToManyField(RelatedField)
        to,                         # 要进行关联的表名
        related_name=None,          # 反向操作时，使用的字段名，用于代替 【表名_set】 如： obj.表名_set.all()
        related_query_name=None,    # 反向操作时，使用的连接前缀，用于替换【表名】     如： models.UserGroup.objects.filter(表名__字段名=1).values('表名__字段名')
        limit_choices_to=None,      # 在Admin或ModelForm中显示关联数据时，提供的条件：
                                    # 如：
                                            - limit_choices_to={'nid__gt': 5}
                                            - limit_choices_to=lambda : {'nid__gt': 5}

                                            from django.db.models import Q
                                            - limit_choices_to=Q(nid__gt=10)
                                            - limit_choices_to=Q(nid=8) | Q(nid__gt=10)
                                            - limit_choices_to=lambda : Q(Q(nid=8) | Q(nid__gt=10)) & Q(caption='root')
        symmetrical=None,           # 仅用于多对多自关联时，symmetrical用于指定内部是否创建反向操作的字段
                                    # 做如下操作时，不同的symmetrical会有不同的可选字段
                                        models.BB.objects.filter(...)

                                        # 可选字段有：code, id, m1
                                            class BB(models.Model):

                                            code = models.CharField(max_length=12)
                                            m1 = models.ManyToManyField('self',symmetrical=True)

                                        # 可选字段有: bb, code, id, m1
                                            class BB(models.Model):

                                            code = models.CharField(max_length=12)
                                            m1 = models.ManyToManyField('self',symmetrical=False)

        through=None,               # 自定义第三张表时，使用字段用于指定关系表
        through_fields=None,        # 自定义第三张表时，使用字段用于指定关系表中那些字段做多对多关系表
                                        from django.db import models

                                        class Person(models.Model):
                                            name = models.CharField(max_length=50)

                                        class Group(models.Model):
                                            name = models.CharField(max_length=128)
                                            members = models.ManyToManyField(
                                                Person,
                                                through='Membership',
                                                through_fields=('group', 'person'),
                                            )

                                        class Membership(models.Model):
                                            group = models.ForeignKey(Group, on_delete=models.CASCADE)
                                            person = models.ForeignKey(Person, on_delete=models.CASCADE)
                                            inviter = models.ForeignKey(
                                                Person,
                                                on_delete=models.CASCADE,
                                                related_name="membership_invites",
                                            )
                                            invite_reason = models.CharField(max_length=64)
        db_constraint=True,         # 是否在数据库中创建外键约束
        db_table=None,              # 默认创建第三张表时，数据库中表的名称
字段以及参数
```

## 操作表

### 基础操作

```python
# 增
models.Tb1.objects.create(c1='xx', c2='oo')  增加一条数据，可以接受字典类型数据 **kwargs

obj = models.Tb1(c1='xx', c2='oo')
obj.save()

# 查
models.Tb1.objects.get(id=123)         # 获取单条数据，不存在则报错（不建议）
models.Tb1.objects.all()               # 获取全部
models.Tb1.objects.filter(name='seven') # 获取指定条件的数据

# 删
models.Tb1.objects.filter(name='seven').delete() # 删除指定条件的数据

# 改
models.Tb1.objects.filter(name='seven').update(gender='0')  # 将指定条件的数据更新，均支持 **kwargs
obj = models.Tb1.objects.get(id=1)
obj.c1 = '111'
obj.save()    # 修改单条数据

```

## Form

## CSRF

## cookie

## session

## 分页

## 自定义分页

## 缓存

## 序列化

## 信号

Django中提供了“信号调度”，用于在框架执行操作时解耦。

### django内置信号

```python
Model signals
    pre_init                    # django的modal执行其构造方法前，自动触发
    post_init                   # django的modal执行其构造方法后，自动触发
    pre_save                    # django的modal对象保存前，自动触发
    post_save                   # django的modal对象保存后，自动触发
    pre_delete                  # django的modal对象删除前，自动触发
    post_delete                 # django的modal对象删除后，自动触发
    m2m_changed                 # django的modal中使用m2m字段操作第三张表（add,remove,clear）前后，自动触发
    class_prepared              # 程序启动时，检测已注册的app中modal类，对于每一个类，自动触发
Management signals
    pre_migrate                 # 执行migrate命令前，自动触发
    post_migrate                # 执行migrate命令后，自动触发
Request/response signals
    request_started             # 请求到来前，自动触发
    request_finished            # 请求结束后，自动触发
    got_request_exception       # 请求异常后，自动触发
Test signals
    setting_changed             # 使用test测试修改配置文件时，自动触发
    template_rendered           # 使用test测试渲染模板时，自动触发
Database Wrappers
    connection_created          # 创建数据库连接时，自动触发
```

对于Django内置的信号，仅需注册指定信号，当程序执行相应操作时，自动触发注册函数：

```python
from django.core.signals import request_finished
from django.core.signals import request_started
from django.core.signals import got_request_exception
from django.db.models.signals import class_prepared
from django.db.models.signals import pre_init, post_init
from django.db.models.signals import pre_save, post_save
from django.db.models.signals import pre_delete, post_delete
from django.db.models.signals import m2m_changed
from django.db.models.signals import pre_migrate, post_migrate
from django.test.signals import setting_changed
from django.test.signals import template_rendered
from django.db.backends.signals import connection_created


def pre_init_callback(sender, **kwargs):
    print("pre_init_callback")
    print(sender,kwargs)

pre_init.connect(pre_init_callback)
# pre_init指上述导入的内容

```

### 自定义信号

```python

import django.dispatch

# 定义一个信号
my_signal = django.dispatch.Signal(providing_args=["arg1", "arg2"])

# 注册信号
def callback(sender, **kwargs):
    print("callback")
    print(sender, kwargs)

my_signal.connect(callback)

# 触发信号
my_signal.send(sender="test", arg1="hello", arg2="world")
```

## django-rest-framework

## Django-Vue-Aadmin

```pyS
git clone https://gitee.com/liqianglog/django-vue-admin.git


├── web/                    // 前端项目
├── backend/                // 后端项目
├── docker_env/             // docker 安装配置
├── docker-compose.yml      // docker-compose 配置
├── README.md               // 项目的说明文档
├── LICENSE                 // 开源 LICENSE
└── README.md               // 说明文档


├── README.md               // 项目的说明文档
├── dist                    // build 后存放内容
├── package.json            // npm包配置文件，里面定义了项目的npm脚本，依赖包等信息
├── babel.config.js         // babel
├── public                  // 项目根目录
│   ├── image/              // 主题展示目录
│   ├── icon.ico            // ico 图标
│   └── index.html          // 首页入口文件，你可以添加一些 meta 信息或统计代码啥的。
├── src                     // 开发的目录
│   ├── App.vue             // 项目入口文件
│   ├── api                 // 系统公告 api 接口
│   ├── assets              // 项目公用资源目录（图片，ico）
│   ├── components          // 公共组件
│   ├── config              // 基本配置
│   ├── layout              // 全局 layout
│   ├── libs                // 全局公用方法
│   ├── locales             // 国际化
│   ├── menu                // 菜单权限处理
│   ├── plugin              // d2admin 前端插件
│   ├── router              // 路由
│   ├── store               // 全局 store管理
│   └── views               // views 所有页面
│       ├── dashboard       // 首页内容
│       ├── demo            // demo 示例
│       ├── plugins         // dvadmin 插件
│       ├── system          // dvadmin 系统专有视图，建议不要修改或新增内容
│       │   ├── ...
│       │   ├── login       // 登录页面
│       │   └── ...
│       ├── App.vue         // vue App 入口
│       ├── install.js      // d2admin 前端通用配置
│       ├── main.js         // vue main 入口
│       └── setting.js      // d2admin 配置
│   ├── main.js             // 项目的核心文件
│   ├── permission.js       // 页面是否登录判断权限判断，权限白名单
│   ├── settings.js         // 全局配置 
│   ├── .env.development    // 开发环境配置
│   ├── .env.staging        // 预发布环境配置
│   ├── .env.production     // 生产环境配置
│   └── ...
└── vue.config.js           // 本地跨域代理


├── application                     // 工程名称
│   ├── asgi.py                     // Django asgi 默认配置
│   ├── celery.py                   // celery 默认配置
│   ├── settings.py                 // 项目的settings配置
│   ├── urls.py                     // 项目主URL对应关系
│   └── wsgi.py                     // wsgi 默认配置
├── conf                            // 配置信息
│   ├── env.example.py              // 配置信息模板
│   └── env.py                      // 自行根据 env.example.py 复制重命名为env.py ，系统只会去读取env.py配置
├── dvadmin                         // docker 启动 celery 脚本
│   ├── system                      // dvadmin 系统app
│   └── utils                       // 全局公用方法
├── logs                            // 日志存放位置
├── media                           // 上传的文件存放位置
├── plugins                         // dvadmin 插件目录
├── └── ...                       
│── static                          // 静态文件
│   ├── drf-yasg                    // 静态文件 drf-yasg 静态文件
│   ├── ...
│   └── rest_framework              // rest_framework 静态文件
├── docker_start.sh                 // docker 启动 django 脚本
├── manage.py
└── requirements.txt                 // 项目环境依赖



├── celery                              // 后端 celery 容器配置目录
│   └── Dockerfile                      // 后端 celery Dockerfile
├── django                              // 后端 django 容器配置目录
│   ├── DockerfileBuild                 // 基础镜像Build
│   └── Dockerfile                        // 后端 django Dockerfile
├── mysql                               // Mysql 数据库容器配置目录
│   ├── conf.d                          // 数据库配置
│   │   └── my.cnf                      // 数据库 my.cnf 配置
│   ├── data                            // 数据库数据
│   ├── launch.sh                         
│   └── logs                            // 数据库日志
├── redis                               // redis 容器配置目录
│   ├── data                            // redis数据
│   ├── launch.sh
│   └── redis.conf                      // redis 配置
└── web                                 // 前端 库容器配置目录
    ├── DockerfileBuild                 // 基础镜像Build
    └── Dockerfile                      // 前端 Dockerfile
```

项目介绍

[整体结构](https://django-vue-admin.com/document/xmjs.html#%E6%95%B4%E4%BD%93%E7%BB%93%E6%9E%84)



git clone https://github.com/Tencent/CodeAnalysis