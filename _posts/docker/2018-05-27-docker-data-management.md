---
layout: post
title: Docker 中数据管理的三种方式
category: Docker
keyword: Docker
---

### Docker 中常见的操作

Docker 是一种新兴的虚拟化技术，可以说 Docker 极大地解放了云计算的生产力。使用 Docker 的时候，逃避不了的操作会有以下两个：

1. 数据管理
2. 使用网络

至于集群啥啥的，我还没学到那块。

### Docker 中启动 nginx

常见的就是把宿主机的某个目录映射到容器中：

```shell
docker run \
-it \
--rm \
-p 8080:80\
--name double_dog \
nginx

```
通过上面的命令，我们启动了一个名字为二狗的 nginx 容器，并且把容器中的 80 端口映射到了本地的 8080 端口，访问宿主机 `[ip:80](http://0.0.0.0:80)` 就可以看到来自容器二狗真诚的问候，手动狗头。

启动了上述的容器并不能满足我们的需求，我们还需要改 nginx 的配置啥啥的，接下来就是把二狗中的 `/etc/nginx` 目录映射到宿主机。

### 挂载主机目录

#### 从容器中拷贝文件到宿主机

```shell
# 新建目录用于存放从二狗中拷贝出来的配置文件
mkdir -p ~/workplace/nginx/config && cd ~/workplace/nginx/config
docker container cp double_dog:/etc/nginx .

# 新建目录用于存放从二狗中拷贝出来的 html 目录
mkdir -p ~/workplace/nginx/site && cd ~/workpalce/nginx/site
docker container cp double_dog:/usr/share/nginx/html .
```

PS:

0. 必须事先启动名称为二狗容器，不然拷贝文件会失败
1. 在拷贝的时候，命令最后的那个点：`.` 的含义是当前目录，不可缺少
2. 如何判断映射那个目录到本地：

```shell
docker exec -it double_dog bash
```
然后就可以进入二狗同学提供的伪终端了。

由于之前在启动的时候，加了 `--rm` 参数，所以在停止二狗容器的时候，被停止的二狗容器会自毁，下次启动的时候还可以用这个名字，接下来就是干掉老二狗，再建立一个新的二狗：

#### 使用 -v 参数将宿主机目录挂载到容器

```shell
docker stop double_dog
docker run \
-it \
--rm \
-p 8080:80 \
-v ~/workplace/nginx/config/nginx:/etc/nginx \
-v ~/workplace/nginx/sitw/html:/usr/share/nginx/html \
--name double_dog \
nginx
```
大功告成，但是如果宿主机目录不存在，docker 会自己建立一个目录。有没有什么更优雅的方式呢？

#### 使用 --mount 参数

```shell
docker run \
-it \
--rm \
-p 8080:80 \
--mount type=bind,source=/home/raoul1996/workplace/nginx/config/nginx,target=/etc/nginx \
--mount type=bind,source=/home/raoul1996/workplace/nginx/site/html,target=/usr/share/nginx/html \
--name double_dog \
nginx
```
实现的效果和上面的命令相同，如果 mount 的 source 目录不存在，则会报错而不是自动创建，推荐使用这个方法而不是 `-v` 参数。

**注意，使用 `--mount` 的时候，source 的目录必须是绝对路径，不可以使用相对路径**

PS：运行命令之前记得销毁老的二狗容器

### 创建数据卷并挂载

```shell
# 创建数据卷：三狗
docker volume create treble_dog

# 创建容器四狗，并挂载数据卷三狗
docker run \
-it \
--rm \
--mount source=treble_dog,target=/usr/share/nginx/html/treble_dog \
-p 8080:80 \
--name penta_dog
nginx
```
数据卷可以被多个容器共同使用，容器自毁了或者被毁了数据卷也不会受到影响。

### Docker 中使用网络

#### --link 参数

上面的二狗同学可能不会需要使用网络，那这部分就下次再写。
