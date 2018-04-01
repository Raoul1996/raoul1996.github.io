---
layout: post
title: Django ORM 和 QuerySets (二)
category: Django
keywords: Python Django PyCharm ORM
---

## 前言

接续前文，上一篇文章主要涉及了 Django 项目的基础配置等，这篇主要涉及数据库相关的 ORM ，也就是 Django 中的 Model 的使用

## 基础环境

1. Pycharm 2018
2. Django 2.0.3
3. Python 3.6.4
4. [mxonline](https://github.com/Raoul1996/mxonline.git) start 分支
5. [Python升级3.6 强力Django+杀手级Xadmin打造在线教育平台](https://coding.imooc.com/class/78.html)


## ORM

代替使用原生的 SQL 语句操作数据库。

### 原生 SQL 语句操作数据库

```py
{BASE_DIR}/apps/message/models.py
import MySQLdb
def book_list(request):
    db = MySQLdb.connect(user="me", db="mydb", password="secret", host="localhost")
    cursor = db.cursor()
    cursor.execute('SELECT name FORM books ORDER BY name')
    names = [row[0] for row in cursor.fetchall()]
    db.close()
```

### 使用 Django Model

```py
{BASE_DIR}/apps/message/models.py
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
然后查看数据库是不是生成了表

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

1. ChartField 必须指定 max_length 