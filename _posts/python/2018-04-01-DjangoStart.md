---
layout: post
title: Django 项目配置初体验（一）
category: Django
keywords: Python Django PyCharm
---

## 前言

1. 推荐使用 virtualenv 创建 python 虚拟环境，防止因为使用 pip 安装依赖到全局引起版本冲突的问题，PyCharm 默认会生成一个 `venv` 目录并创建虚拟环境，使用 IDE 自带的终端也会默认激活虚拟环境
2. 使用的教程基于 Django 1.9.8，现在 Django 已经升级到了 2.0.3，所以可能会有部分写法不太常见
3. 涉及到的知识：
	- 初始化项目
	- 注册项目
	- database 配置
	- 生成 Django 默认表，没有配置 model
	- view 和 template 配置
	- url 配置（包括配置 name）
	- 静态文件路径配置

## 基础环境

1. Pycharm 2018
2. Django 2.0.3
3. Python 3.6.4
4. [mxonline](https://github.com/Raoul1996/mxonline.git) start 分支
5. [Python升级3.6 强力Django+杀手级Xadmin打造在线教育平台](https://coding.imooc.com/class/78.html)

## 目录结构

### 初始结构

直接采用 PyCharm 初始化一个 Django 项目

```shell
.
├── db.sqlite3        # 默认的 sqlite 数据库文件
├── manage.py         # 启动脚本
├── mxoline           # 主要配置存放路径
│   ├── __init__.py
│   ├── settings.py   # 全局配置
│   ├── urls.py       # url 配置文件
│   └── wsgi.py
└──  templates        # html 文件模板

```

### 新建 app

```shell
$ django-admin startapp message
```

生成的 app 结构： 

```shell
└── message          
    ├── __init__.py  
    ├── admin.py     
    ├── apps.py
    ├── migrations
    │   └── __init__.py
    ├── models.py
    ├── tests.py
    └── views.py


```

### 新建其他目录

1. log：存放 log 日志
2. static：存放静态资源
3. media：存放用户上传的媒体文件

### 最终的项目结构

防止项目过大的时候，app 过多难以管理

```shell
.
├── apps                 # app 集中存放，防止当项目规模变大难以管理
│   └── message          # 新建的 message app
├── db.sqlite3           # 默认的 sqlite 数据库
├── log                  # 存放 log 日志
├── manage.py            # 启动脚本
├── media                # 用户上传的媒体文件
├── mxoline              # 项目主要配置目录
│   ├── __init__.py      # 初始化文件
│   ├── __pycache__      # 
│   ├── settings.py      # django 框架全局配置文件
│   ├── urls.py          # url 映射关系配置文件
│   └── wsgi.py          # 
├── static               # 静态资源文件
├── templates            # 模板存放目录
└── venv                 # PyCharm 创建的虚拟 Python 环境
    ├── bin
    ├── include
    ├── lib
    ├── pip-selfcheck.json
    └── pyvenv.cfg

```

## 项目初体验

### 注册项目

每次创建一个 App，我们都需要在 `settings.py` 中进行注册：

```py
# {BASE_DIR}/mxonline/settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'apps.message'
]

```
可以看到在列表中添加了 `message` 项目。

### 配置数据库

默认使用的是 `sqlite`，我们在这里使用 `mysql`（有坑预警，昨天晚上查了好久）

进入 `setting` 文件，默认的配置情况是这个样子的：

```py
# {BASE_DIR}/mxonline/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

```

修改成这个样子：

```py
# {BASE_DIR}/mxonline/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',  # 使用mysql引擎
        'NAME': 'test_django',                 # 数据库名称
        'USER': 'root',                        # 用户
        'PASSWORD': 'root',                    # 密码
        'HOST': '127.0.0.1'                    # 地址
    }
}
```

然后需要安装 `mysql` 的驱动，mac 下会出现装不上的情况，具体可以参考[这里](https://stackoverflow.com/questions/43740481/python-setup-py-egg-info-mysqlclient, "这纯是 mysql 自己的锅啊")，自行修改 `mysql-config` 文件。

```shell
# 这里是 mac 的驱动，使用Windows 同学对不起啊。
$ pip install mysqlclient
```

Windows 上需要自行下载 mysql-python 驱动，好像也挺多坑的，按下不表。

### 生成数据表

在 `Pycharm` 中，点击 `Tools` 中的 `Run manage.py Task`，然后就可以在里边快捷的运行 `manage.py` 提供的各种脚本了。

如果在命令行中运行的话，需要在下面的命令前边加上 `python manage.py`

```shell
$ makemigrations
```
```shell
$ migrate
```
输出大概如下：

```shell
bash -cl "/Users/zhoubao/workplace/python/mxoline/venv/bin/python /Applications/PyCharm.app/Contents/helpers/pycharm/django_manage.py migrate /Users/zhoubao/workplace/python/mxoline"
(B[mTracking file by folder pattern:  migrations
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
```
可以登录自己的 mysql 数据库查看一下是不是生成了一堆数据表：

```shell
$ mysql -uroot -proot
$ change test_django
$ show tables;
```
我这里的输出是这个样子的：

```shell
+----------------------------+
| Tables_in_test_django      |
+----------------------------+
| auth_group                 |
| auth_group_permissions     |
| auth_permission            |
| auth_user                  |
| auth_user_groups           |
| auth_user_user_permissions |
| django_admin_log           |
| django_content_type        |
| django_migrations          |
| django_session             |
+----------------------------+
10 rows in set (0.00 sec)

```
当然可以使用 Navicat 进行查看，这里就不截图了。

### 查看欢迎页面

```shell
runserver
```

然后可以访问 [127.0.0.1:8000](http://127.0.0.1:8000)，查看是否进入了 django 的默认欢迎页面。


### 新建 templates

先在 `templates` 中添加一个 `form.html` 文件（也算是懒到家了，就直接用 curl 拉取了）

```shell
$ cd templates
$ curl -L https://raw.githubusercontent.com/missxiaolin/python-django/1860df7790a5daefafd2c052c1e3afedbbc48151/templates/mesage_form.html > message_form.html

```

### 在 app 中新建 view

在这里指定 view 和 template 的关系，默认的 templates 目录就是 `{BASE_DIR}/templates`

```py
# {BASE_DIR}/apps/message/views.py
from django.shortcuts import render


def getForm(request):
    return render(request, 'message_form.html')

```

### 为 template 创建 url 映射

目的是将刚才的 `form.html` 页面呈现出来。

进入生成项目的时候生成的和项目名称相同的那个目录下边的 `urls.py` 文件中，和 `settings.py` 文件同级，文件已经配置好了 `/admin` 路由：

```py
# {BASE_DIR}/mxonline/urls.py
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
]
```
需要添加自己的配置项,这里和 1.9.8 不太一样，不需要使用正则，正则对应的是 `re-path`：

```py
# {BASE_DIR}/mxonline/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('message.urls'))
]
```
#### app 内部维护 url 文件

这里的处理方式和教程中的不太一样，首先教程基于的是 Django 的 1.9.8 版本，配置路由需要使用到正则表达式相关的知识。其次教程在这里对 app 中的 url 进行了处理，我选择的方式则是在 app 自己的目录中维护自己的 url。

```shell
$ cd apps/message
$ touch urls.py
```

```py
# {BASE_URL}/apps/message/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.getForm, name="go_form")
]

```

在这里可以指定一个 `name` 参数，这个参数在后边会非常有用，因为在 `template` 中可以通过 `name` 来指定 `url`。
#### 解决模块引用问题

在配置完成 url 之后，运行 `runserver` 之后（或者在命令行中运行 `python manage.py runserver`），会报错：

```shell
ModuleNotFoundError: No module named 'message'
```
意思是找不到名字叫 `message` 的这个模块。

因为我们的 `message` app 之前已经被我们放到了 `apps` 目录下，所以我们的解决方法会有两种：

##### 不更改 settings.py

如果不想要修改 `settings.py` 的话，我们在每次引用 `apps` 下面的应用的话，需要指定路径。所以修改文件如下：

```py
# {BASE_DIR}/mxonline/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.message.urls'))
]
```
这样虽然能用，但是每次都需要写 `apps`，不太方便。

##### 将 apps 设置为模块路径

这样 Django 就会在 `apps` 中去寻找 `message` 模块（app）了：

```py
# {BASE_DIR}/mxonline/settings.py
import sys
sys.path.insert(0, os.path.join(BASE_DIR, 'apps'))
```
这里我选择的是第二种处理方式。

这样我们点击进去 [127.0.0.1:8000](http://127.0.0.1:8000) 就应该能看到 `message_form.html` 页面文件了。

### 解决 CSS 路径不正确的问题

在进入页面的时候，我们会发现 css 文件的路径不正确，所以需要在 `settings.py` 文件中设置 `static` 路径。

静态资源路径可以有多个，所以这里使用一个列表进行配置：

```py
# {BASE_DIR}/mxonline/settings.py

STATICFILES_DIRS = [
    os.path.join(BASE_DIR,'static')
]
```

再次进入 [127.0.0.1:8000](http://127.0.0.1:8000)，完美~

## 后记

现在只涉及到了项目的配置和一些基础的配置，没有涉及到 Django 请求从开始到完成的任何内容。下篇教程将集中进行记录。
