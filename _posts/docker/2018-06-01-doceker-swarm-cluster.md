---
layout: post
title: 使用 Docker-machine 构建最简 Swarm 集群
category: Docker
keyowrds: docker docker-machine swarm cluster
---
### 前言

请优先查看 [Docker — 从入门到实践](https://yeasy.gitbooks.io/docker_practice/)

### Docker 三剑客

1. Docker Compose
2. Docker Machine
3. Docker Swarm

`docker-compose` 解决的问题是自动化处理容器的启动问题，让开发者不必一个一个的去 pull 镜像，数据管理，配置网络等等，类似于 CI（持续集成）的概念。

`docker-machine` 可以让开发者可以在不同平台快速生成多个具有 docker 服务的虚拟机。

`docker-swarm` 可以让开发者在共享网络上快速部署 docker 集群

### 实验环境

1. MacOS 13.4
2. Docker CE 18.05
3. Docker-machine 0.14.0

在这里不会涉及到 docker-compose 相关的知识，实验的核心是使用 docker-machine 组件 Swarm 集群，并在集群部署 nginx 并启动

### 安装 Docker-Machine

对于 Mac 和 Windows 用户，安装 Docker for Mac 或者 Docker for Windows 自带 `docker-machine` 二级制包，不需要做太多处理，对于 Linux 用户，可以从 [Docker Machine](https://github.com/docker/machine) 下载二级制包，并按照文档进行安装。或者按照下面的方法:

```shell
base=https://github.com/docker/machine/releases/download/v0.14.0 &&
  curl -L $base/docker-machine-$(uname -s)-$(uname -m) >/tmp/docker-machine &&
  sudo install /tmp/docker-machine /usr/local/bin/docker-machine
```
安装完成之后，尝试运行 `docker-machine -v`，查看版本号。

### 安装驱动

这里我选择使用 macOS xhyve 驱动

```shell
brew install docker-machine-drive-xhyve
```
很快就可以安装好驱动。

### 生成本地主机实例

```shell
# 创建三个主机实例
docker-machine create -d xhyve manager && \
docker-machine create -d xhyve worker1 && \
docker-machine create -d xhyve worker2
```
### 初始化集群

```shell
# 初始化集群的节点默认为 manager
dcoker-machine ssh manager
```
进入 manager 虚拟机分配的伪终端之后，然后初始化 Swarm 控制节点：

```shell
# 由于新建的时候没有指定多个网卡，所以直接初始化是 OK 的
docker swarm init
```
然后输出如下：

```shell
Swarm initialized: current node (ps48euenpl02vxmra0r98asej) is now a manager.

To add a worker to this swarm, run the following command:

    docker swarm join --token SWMTKN-1-0eowvddzwvb3hnbcmk6nl0ssf39aa3tn28fz07okan5i6wdz6p-0izi1y9ezuihqhd4schw6eei7 192.168.64.7:2377

To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.
```
执行本条命令的节点会默认成为 `manage` 节点，可以用来管理集群，可使用 `docker node ls` 查看当前集群的节点状态：

```shell
docker node ls
```

输出如下：

```shell
ID                            HOSTNAME            STATUS              AVAILABILITY        MANAGER STATUS      ENGINE VERSION
mfrbkdyrh1h4ee44723zabult *   manager             Ready               Active              Leader              18.05.0-ce
```

这即表示当前的集群没有只有一个管理节点，下面进行的操作就是如何加入一个集群。

### 加入集群

```
# 新打开一个 terminal
docker-machine ssh worker1

# 进入 worker1 提供的伪终端，join 集群
docker swarm join --token SWMTKN-1-0eowvddzwvb3hnbcmk6nl0ssf39aa3tn28fz07okan5i6wdz6p-0izi1y9ezuihqhd4schw6eei7 192.168.64.7:2377
```

上面的 token 值是在初始化管理节点的时候拿到的，通常反馈如下：

```shell
# 该节点以 worker 的身份加入之前创建的集群
This node joined a swarm as a worker.
```

通过 `docekr-machine ssh manager` 登录管理节点后，使用 `docker node ls` 查看当前集群的节点情况：

```shell
ID                            HOSTNAME            STATUS              AVAILABILITY        MANAGER STATUS      ENGINE VERSION
mfrbkdyrh1h4ee44723zabult *   manager             Ready               Active              Leader              18.05.0-ce
r3bpuyslwc24d80mxvtrbjoty     worker1             Ready               Active                                  18.05.0-ce
```
使用相同的操作，即可将其它节点加入集群

### 在集群上部署服务

使用 ssh 连接 manager 节点后，使用如下命令在集群中的所有节点上部署 nginx：

```shell
docker service create --replicas 3 -p 80:80 --name nginx nginx
```
反馈如下：

```shell
overall progress: 3 out of 3 tasks
1/3: running
2/3: running
3/3: running
verify: Service converged
```
### 验证服务是否部署成功

登录节点，使用如下命令查看节点的 ip：

```shell
docker info | grep Node
```

然后访问节点对应 ip，看看是不是 nginx 的欢迎页面：

例如：

```shell
docker@worker1:~$ docker info | grep Node
 NodeID: r3bpuyslwc24d80mxvtrbjoty
 Node Address: 192.168.64.5
docker@worker1:~$ curl -L http://192.168.64.5
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

如此验证所有节点

### 后续内容

在 docker swarm 集群使用 docker-compose 更优雅的部署任务，基本和在单个容器中使用 docker-compose 的方法相同
