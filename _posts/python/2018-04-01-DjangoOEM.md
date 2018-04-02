---
layout: post
title: Django ORM 和 QuerySets (二)
category: Django
keywords: Python Django PyCharm ORM
---

## 前言

接续前文，上一篇文章主要涉及了 Django 项目的基础配置等，这篇主要涉及数据库相关的 ORM ，也就是 Django 中的 Model 的使用。

## 基础环境

1. Pycharm 2018
2. Django 2.0.3
3. Python 3.6.4
4. [mxonline](https://github.com/Raoul1996/mxonline.git) start 分支
5. [Python升级3.6 强力Django+杀手级Xadmin打造在线教育平台](https://coding.imooc.com/class/78.html)
6. [MDN 的 Django教程 ———— 设计LocalLibrary模型](https://developer.mozilla.org/zh-CN/docs/Learn/Server-side/Django/Models)
7. [Django 官方文档 Model 部分](https://docs.djangoproject.com/en/2.0/ref/models/)


## ORM 简单使用

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

### 使用 Django Model

具体的一些细节知识下面会进行叙述。这里只是展示一下如何使用。

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

#### 方法

#### 完整的 model

## 模型管理

### 创建和修改记录

## 后记


