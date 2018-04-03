---
layout: post
title: Django Model View Template 之间的简单交互 (二)
category: Django
keywords: Python Django PyCharm ORM MVT
---

## 前言

接续前文，上一篇文章主要涉及了 Django 项目的基础配置等，这篇主要涉及数据库相关的 ORM ，也就是 Django 中的 Model 的使用，MVT 三层之间的交互

教程基本都是东拼西凑的，防止有些东西表述不准确，因为我之前写 JavaScript 比较多。但是里边注入了自己的理解，尽量讲清楚。

## 基础环境

1. Pycharm 2018
2. Django 2.0.3
3. Python 3.6.4
4. [mxonline](https://github.com/Raoul1996/mxonline.git) start 分支

## Django Model 配置

代替使用原生的 SQL 语句操作数据库。

### 原生 SQL 语句操作数据库

```py
# {BASE_DIR}/apps/message/models.py
import MySQLdb
def book_list(request):
    db = MySQLdb.connect(user="me", db="mydb", password="secret", host="localhost")
    cursor = db.cursor()
    cursor.execute('SELECT name FORM books ORDER BY name')
    names = [row[0] for row in cursor.fetchall()]
    db.close()
```

### 配置 Django Model

具体的一些细节知识下面会进行叙述。这里只是展示一下如何配置。

```py
# {BASE_DIR}/apps/message/models.py

# 从 Django 中引入 models
from django.db import models


# Create your models here.
class UserMessage(models.Model):
    name = models.CharField(max_length=20, verbose_name=u"用户名")
    email = models.EmailField(verbose_name=u"邮箱")
    address = models.CharField(max_length=100, verbose_name=u"联系地址")
    message = models.CharField(max_length=500, verbose_name=u"留言信息")

    class Meta:
        verbose_name = u"用户留言信息"
        verbose_name_plural = verbose_name
```

`model` 创建完成，接下来是生成数据表。

### 生成数据表

```shell
$ python manage.py makemigrations message
$ python manage.py migrate message
```
然后查看数据库是不是生成了表。

之前有十个表，分别是:

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
现在：

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
| message_usermessage        |
+----------------------------+
11 rows in set (0.00 sec)
```

```shell
mysql> desc message_usermessage;
+---------+--------------+------+-----+---------+----------------+
| Field   | Type         | Null | Key | Default | Extra          |
+---------+--------------+------+-----+---------+----------------+
| id      | int(11)      | NO   | PRI | NULL    | auto_increment |
| name    | varchar(20)  | NO   |     | NULL    |                |
| email   | varchar(254) | NO   |     | NULL    |                |
| address | varchar(100) | NO   |     | NULL    |                |
| message | varchar(500) | NO   |     | NULL    |                |
+---------+--------------+------+-----+---------+----------------+
5 rows in set (0.04 sec)

```
对应上面 Model 中的字段，完美~

### 注意事项

1. ChartField 必须指定 max_length。

## ORM 功能介绍

稍候会有完整的 Model 例子。

### 字段 Field

每一个模型都可以包含有任意数量的字段，每个字段都会对应数据表中的一个字段，我们需要指定字段的属性。

```py
name = models.CharField(max_length=20, verbose_name=u"用户名")
```

上述字段的名称是 `name`，类型是 `models.CharField`。对应到 MySQL 数据中是 `varchar` 类型。`varchar` 类型的字段都是需要去指定一个长度值，对应到 Django 的 ORM 模型上就是 `max_length` 属性。

#### 字段参数

下面列举一下目前笔者在开发中用到的一些字段：

1. max_length：指定字段的长度值，接受一个数字，`CharField` 必须指定最大长度， `TextField` 不需要。
2. verbose_name：字段标签的可读名称，接受一个字符串。如果不指定，Django 会从字段名称去推断默认的详细名称，建议每一个字段都进行指定。
3. default：字段默认值。
4. null：是否可以为 `null`，接受 `True` 或者 `False`。
5. blank： 是否可以为空，同样接受 `True` 或者 `False`。
6. primary_key：如果设置为 `Ture`，则该字段置为模型主键，如果模型中没有指定主键，则 Django 会自动为模型添加一个主键，默认为 `id`。
7. help_text：为 HTML 表单文本提供单文本标签。
8. choices：一组字段选项，提供这一项的时候，默认对应的表单不见是选择字段的盒子，而不是标准文本字段。

#### 字段类型

1. CharField：用来定义短到中等长度的字段字符串，**必须指定 max_length 属性**。
2. TextField：用于大型的任意长度字符串，不强制要求指定 `max_length` 属性，指定的 `max_length` 仅仅当该字段以表单显示才会使用，不会再数据库级别进行强制执行。
3. IntegerField：用于存储整形数据，在用于表单中验证输入的值需要时整数。
4. FloatField：用于存储浮点型数据
4. DateField 和 DateTimeField：用于存储／表示日期和日期／时间信息（分别是Python.datetime.date和datetime.datetime对象。这些字段可以另外表明（互斥）参数auto_now=Ture （在每次保存模型时将该字段设置为当前日期），auto_now_add（仅设置模型首次创建时的日期）和default（设置默认日期，可以被用户覆盖）。一般笔者选择的默认日期是 `datetime.now`。
5. EmailField：用来存储和验证电子邮件地址。
6. FileField：用于上传文件，需要提供 `upload_to` 指定上传到的地方。
7. ImageField：和上传文件表现基本相似，会额外进行是否为图像的验证。
8. AutoField：是一种 `IntegerField` 自增的特殊类型，如果模型没有指定主键的话，此类型的主键将自动添加到模型中。
9. ForeignKey：外键，用于指定与另一个数据库模型的一对多关系。关系 “一” 侧是包含密钥的模型。和 flask 指定外键的方式不同。
10. ManyToManyField：用于指定多对多关系，例如，一本书可以有几种类型，每种类型可以包含几本书）。在我们的图书馆应用程序中，我们将非常类似地使用它们ForeignKeys，但是可以用更复杂的方式来描述组之间的关系。这些具有参数on_delete来定义关联记录被删除时会发生什么（例如，值models.SET_NULL将简单地设置为值NULL）。笔者用的不是很多。

#### 元数据

通过声明 `class Meta` 来声明模型级别的元数据

```py
class UserMessage(models.Model):
	# Config Field
		
    class Meta:
    	ordering = ["id"]
       verbose_name = u"用户留言信息"
       verbose_name_plural = verbose_name

```

这里最有用的功能是可以指定模型返回数据时候的默认的顺序，更多的文档可以查看[这里](https://docs.djangoproject.com/zh-hans/2.0/ref/models/options/)

#### 方法

一个模型也可以有方法，最基本的使用就是定义一个标准的 Python 类方法： `__str__`：

```py
class UserMessage(models.Model):
	# Config Field
	
	# Config Meta
	
    def __str__(self):
       return self.message    
```

这样为每个对象返回一个人类可读的字符串。当然还有其他高级的使用，日后再说
#### 完整的 model

```py
# {BASE_DIR/apps/message/models.py}

from django.db import models


# Create your models here.
class UserMessage(models.Model):
    name = models.CharField(max_length=20, verbose_name=u"用户名")
    email = models.EmailField(verbose_name=u"邮箱")
    address = models.CharField(max_length=100, verbose_name=u"联系地址")
    message = models.CharField(max_length=500, verbose_name=u"留言信息")

    class Meta:
        ordering = ["id"]
        verbose_name = u"用户留言信息"
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.message

```

## 使用 Django ORM

之前已经定义好了数据模型的字段（Field）、元数据（Meta）、方法（Method）等。现在要做的是把页面上提交过来的数据通过 ORM 来存放到数据库中，通过 ORM 来进行数据的 CURD 操作。

### 创建数据

在 `templates` 中已经创建了 `message_form.html` 模板文件，现在进行修改，修改 `form` 的 `action` 目标地址：

```html
<form action="/" method="post" class="smart-green">
```

这里根据自己配置的 `Url` 来自行决定，由于笔者配置的是 `/`，所以这里就配置成这个样子。

这里指定的是使用 `form` 的原生事件 `post` 事件进行提交，但是在实际的开发中，为了实现更精确的控制，我们常常不会使用原生事件，而更倾向于使用 `ajax` 进行提交，当然这里的重点不是前端的逻辑，重点在于 Django 后端逻辑的处理，顾不赘述。

接下来的任务就是：**拿到 POST 发来的数据，然后存入数据库中。**

### 存储数据

之前使用 Django 的 ORM 进行了数据库中数据表的配置，现在使用 Django 的 ORM 将数据保存到数据库中。

在 Django 中，我们使用不是传统的 `MVC` 架构，我们使用的是一种叫 `MVT` 的方式。不同的 `Template（模板）` 呈现不同的 `View`。我们将在 `View（请求视层）`中获取用户提交的数据，以及将从 `Model（数据层）` 中获得的数据传递给 `Template(模板层)`。

MVT 的概念本身就来自于 Django 框架，下面进行代码的展示：

```py
# {BASE_DIR/apps/message/views.py}
from django.shortcuts import render  # 引入 render 方法
from .models import UserMessage      # 引入之前配置好的 Model


# Create your views here.

def get_form(request):
    if request.method == 'POST':
        name = request.POST.get('name', '')
        message = request.POST.get('name', '')
        address = request.POST.get('address', '')
        email = request.POST.get('email', '')
        user_message = UserMessage()
        user_message.name = name
        user_message.message = message
        user_message.address = address
        user_message.email = email
        user_message.save()
    return render(request, 'message_form.html')

```

通过 `POST` 方法提交的数据会存储到 `request` 对象的 `POST` 属性下边，通过 `Django` 提供的 `get` 方法就可以取到对应的字段。其中 `get` 接收两个参数，分别是**字段的名称**和**默认值**。

在取到 `Template` 提交过来的每一个字段之后，就可以使用 ORM 提供的方法将其存入数据库中。

实例化引入的 Model，然后将之前定义的字段进行赋值，然后就可以调用实例的 `save()` 方法将数据存入数据库。

然后就可以通过 `Navicat` 或者终端等方式查看数据是否保存到了数据库中。

### 读取数据

之前已经实现了数据的存储，这部分将实现数据的读取功能。

```py
# {BASE_DIR/apps/message/views.py}
from django.shortcuts import render
from .models import UserMessage


# Create your views here.

def get_form(request):
    message = None
    all_message = UserMessage.objects.filter(name='test')
    if all_message:
        message = all_message[0]
    return render(request, 'message_form.html', {'my_message': message})
```
这里会涉及到 Django 的 `QuerySets（查询集）`相关知识，这里捡着用的着的部分看一下。

首先先声明 `message`，值为 `None`，用于存储取到的数据。

从本质上讲，`QuerySets` 是给定对象模型（这里是 `UserModel`）的对象列表（list），允许我们从数据库中读取数据，选择以及排序。通过这种方式操作的话，就可以避免直接操作数据库。从而抹平不同数据库操作的差异，这部分由 Django 帮我们来完成。

上面的代码中有这样的一句：

```py
UserMessage.objects.filter(name='test')
```
作用是从数据库中查找 `name` 值为 `test` 的所有条目，返回的是一个 `<QuerySet>` 列表，并赋值给 `all_message`。同时我们也可以发现，`QuerySet` 可以链式调用。类似于 `JavaScript` 中的 `Promise`。

然后如果 `all_message` 不为空的话，取出列表第一项，然后传递给 `my_message` 模板。

关于 `QuerySet` 的详细知识，可以查看 Django 的官方文档的[这一部分](https://docs.djangoproject.com/zh-hans/2.0/ref/models/querysets/)

### 渲染到模板

这部分由于 jekyll 编译死活过不去，所以放到了 [Issue](https://github.com/Raoul1996/raoul1996.github.io/issues/6) 中。

## 后记

这里只是简单的介绍了一下 Django 中 Model 层、View 层、以及 Template 层之间交互的部分知识，很简略，不详细。在每部分的后边都附加了详细的官方文档地址。如果以后有时间了可以对每部分进行详细的阐述。

## 参考资料

1. [Python升级3.6 强力Django+杀手级Xadmin打造在线教育平台](https://coding.imooc.com/class/78.html)
2. [MDN 的 Django教程 ———— 设计LocalLibrary模型](https://developer.mozilla.org/zh-CN/docs/Learn/Server-side/Django/Models)
3. [Django 官方文档 Model 部分](https://docs.djangoproject.com/en/2.0/ref/models/)
4. [Django Girls 教程](https://tutorial.djangogirls.org/zh/django_orm/)


