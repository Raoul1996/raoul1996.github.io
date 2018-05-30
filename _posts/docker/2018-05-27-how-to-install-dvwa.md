---
layout: post
title: 使用 Docker 安装 DVWA 漏洞测试环境
category: Docker
keywords: Dockerlize DVWA XSS CSRF SSRF MySQL PHP
---

### DVWA 是什么

[DVWA](https://github.com/ethicalhack3r/DVWA)（Dam Vulnerable Web Application）是一套使用 PHP 和 MySQL 编写的一套用于常规 WEB 漏洞教学和检测的 WEB 脆弱性测试程序。包含了 SQL 注入、XSS、盲注等常见的安全漏洞。

### 为什么使用 Docker

Docker 是一种新兴的虚拟化方式，Docker 较传统的虚拟化有很多优势，比如：

1. 更高效的利用系统资源
2. 更快的启动时间
3. 一致的运行环境

等等优点，详细了解可以阅读 [Docker — 从入门到实践](https://legacy.gitbook.com/book/yeasy/docker_practice/details)中[为什么使用 Docker](https://yeasy.gitbooks.io/docker_practice/introduction/why.html) 一节。

### 实验环境

1. MacOS 13.4 版本
2. Docker CE 18.05
3. [mysql:5.6 image](https://github.com/mysql/mysql-docker)
4. [web-dvwa:latest image](https://hub.docker.com/r/vulnerables/web-dvwa/)

### Docker 不是银弹

由于 MacOS 在运行很多程序的时候可能会有一些兼容性问题，今天在物理机上安装 anaconda3 的时候，并不能正常使用，所以只好安装了 anaconda 的 docker 镜像进行 Python 编码的练习，后来索性直接都用 docker 了。

Docker 本身就会占用一定的系统资源，所以说安装使用 Docker 并不会提高系统资源的利用率，但是相比传统的虚拟化方式，已经提高很多了，但是总体来讲，还是增加了系统的压力。这一点在使用单片机进行硬件开发中就表现的极为明显：

裸奔的代码跑的肯定会比装了嵌入式系统之后跑的快，因为使用的嵌入式系统本身就消耗了不可忽视的系统资源，但是这些系统提供了很多有用的功能，比如多任务调度啥啥的。

这部分就需要开发者自己进行权衡了，如果使用 Docker 带来的便利大于它本身的接入成本的话，用用未尝不可。

当然开发阶段，自己玩的话，另当别论。

### 环境准备

这部分以 MacOS 为例，Docker CE 的安装包请自行在官网下载并启动之后，可以参考以下命令:

```shell
# install git
brew install git

# create a workplace folder
mkdir workpalace && cd workpalce

# pull dvwa image
docker pull vulnerables/web-dvwa

# pull mysql@5.6 image
docker pull mysql:5.6
```
PS: 由于众所周知的原因，国区拉取镜像龟速，所以可以考虑使用 DaoCloud 提供的配置加速器服务，具体可以查看[这里](http://www.daocloud.io/mirror#accelerator-doc)，需要登录，github 就可以

### 配置 dvwa 数据库

由于高版本的 MySQL 默认不允许 localhost 以外的用户连接，需要对配置进行一些修改，所以这里使用了 5.6 版本，dvwa 可以直接通过用户名和密码进行连接。

dvwa 同时支持多种数据库，包括 MySQL、pg 等等。使用何种数据库以及数据库的用户名、密码、主机地址等信息需要在 dvwa 镜像中 `/var/www/html/config/config.inc.php` 中进行配置，可以在配置文件中直接修改，也可以把配置文件放到宿主机上，然后把目录映射到容器中。这里我使用了后面一种方法。

#### 宿主机目录映射到容器

这部分涉及到的内容在之前相关的文章中已经提到，这里不再赘述。[传送门](https://raoul1996.github.io/2018/02/28/HTTP2-Server-Push.html#cfylk)

```shell
cd workplace

docker container cp dvwa:/var/www .

docker run \
--rm -it \
-p 8080:80 \
-p 8081:8080 \
-v path_to_dir/www:/var/www  \
--name dvwa \
vulnerables/web-dvwa
```
然后就可以方便的修改`www` 下面的文件了

#### 启动 mysql 镜像

```shell
docker run --name mysql_data -e MYSQL_ROOT_PASSWORD="testpass" -d mysql:5.6
```
mysql 容器就启动起来了，接下来就是看一下数据库所在的地址

```shell
docker inspect mysql_docker | grep IPAddress
```
使用获得的地址，并修改上面提到的配置文件

#### 使用 link 参数

如果删除掉 `mysql_data` 容器之后，下次再启动的时候容器分配的 ip 是不定的。为了解决这个问题，我们可以在启动 dvwa 的时候使用以下命令：

```shell
# path_to_dir 请自行替换成自己使用的目录地址
docker run \
--rm \
-it \
--link mysql_data:mysql
-p 8080:80 \
-p 8081:8080 \
-v path_to_dir/www:/var/www  \
--name dvwa \
vulnerables/web-dvwa
```
在配置文件中就可以使用域名来代替 ip 进行数据库的连接。

link 参数的实现原理是修改了 dvwa 容器中 `/etc/hosts` 文件，可以通过 `docker exec -it dvwa bash` 查看容器中的 hosts 文件。

#### 验证

在镜像中 dvwa 启动在 80 端口上，通过上面的启动命令，将 dvwa 容器的 80 端口转发到了宿主机的 8080 端口，所以我们只需要访问 [http://127.0.0.1:8080](http://127.0.0.1:8080)即可。

如果连接数据库成功且正确进行安装，即可使用默认的用户名和密码登入系统。

### 换种方式运行 MySQL 容器

按照上面的步骤，理论上 dvwa 漏洞测试环境已经可以正常跑起来了，但是会存在一些问题。比如说如果把 MySQL 容器删除掉了（`docker stop mysql_data && docker rm mysql_data`），那么之前所有存到 MySQL 中的数据都会丢失，虽然这一点在使用 dvwa 的时候不是很重要，但是在其他项目中使用 MySQL 的时候却是十分重要的问题，毕竟数据无价。

#### 新建目录用来保存 MySQL 数据库内容

```shell
cd ~
mkdir -p data/mysql
```
#### 目录映射到 MySQL 容器

```shell
# 停止并删除已经启动的 MySQL 容器
docker stop mysql_data && docker rm mysql_data

# 使用 -v 将宿主环境下的目录映射到容器中，并追加 -d 参数实现后台运行
# path_to_data 请自行替换
docker run --name mysql_data \
-v path_to_data/mysql:/var/lib/mysql \
-e MYSQL_ROOT_PASSWORD="testpass" \
-d \
mysql:5.6
```

### 参考文章
1. [十大渗透测试演练系统](http://www.freebuf.com/sectool/4708.html)
2. [在docker中使用MySQL数据库](https://yq.aliyun.com/articles/583765)
3. [Docker run 命令](http://www.runoob.com/docker/docker-run-command.html)

