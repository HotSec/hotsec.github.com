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
