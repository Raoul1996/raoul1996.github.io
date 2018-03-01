---
layout: post
title: Nginx HTTP/2 Server Push
category: Http
keyword Http2 protocols Server Push
---

Nginx HTTP/2 Server Push

### 前言

最近在把之前使用 koa2 框架写的 vote 后端使用阿里开源的 eggjs 重写了一遍，并沉淀出了几个小模块发布到了 npm 上，连续谢了好多天的 node 代码，都快些吐了。
前几天从掘金上看到阮一峰老师在使用 Docker 容器研究 [`HTTP/2 server push`](http://www.ruanyifeng.com/blog/2018/02/nginx-docker.html)，但是还没有真正涉及到 `server push` 的具体操作。于是照着教程做了一下，这里进行一些简单的记录，并进行一番实践。

### 操作环境

1. MacOS@12.06
2. DockerCE@18.02.0-ce-mac53
3. Nginx Image@13.9
4. Open SSL

### HTTP 服务


#### 后台运行 Nginx 容器

最种运行 Nginx 所用到的命令：

```shell
$ docker container run \
-d \
-p 8080:80 \
-p 8081:443 \
--volume "$PWD/html":/usr/share/nginx/html \
--volume "$PWD/conf":/etc/nginx \
--rm \
--name mynginx
nginx
```

上述各参数含义

- -d：在后台运行
- -o：映射端口，格式为 宿主机:容器
- --rm：容器停止后，自动删除容器文件
- --name：指定容器名称
- --volume：映射目录

#### 映射目录

由于我们所有的文件都在镜像中，改动起来十分不方便，因为 nginx 的官方镜像练 vim 都是没有提供的，所以我们把容器中的网页文件还有配置文件映射到本地，方便进行修改以及研究。

进入自己的 workplace 目录，然后新建一个目录并进入：

```shell
$ mkdir nginx-docker-demo && cd nginx-dcoker-demo
```
##### 映射 html 目录

然后再新建一个 html 目录，用来存放网页文件，并新建一个 html 文本：

```shell
$ mkdir html && cd html && echo "<h1>Hello World!</h1>" > index.html
```

我们现在的目录结构是这个样子的：

```shell
.
└── nginx-docker-demo
    └── html
```

使用上面的命令将 `/usr/share/nginx/html` 映射为本地当前操作目录下的 `html` 子目录

##### 映射 config 目录

我们需要将容器中 nginx 的配置文件拷贝到本地，将容器中的 nginx 配置目录映射到本地操作目录的 `conf` 子目录下，方便进行配置的修改

首先，拷贝整个配置文件目录并将其重名：

```shell
$ docker container cp mynginx:/etx/nginx . && mv nginx conf
```

同样上面启动容器的命令会将容器中的 `/etc/nginx` 映射为本地当前操作目录下的 `conf`

### 自签名证书

现在我们需要为容器加入 HTTPS 支持，第一件事情就是我们需要生成私钥和证书。正式的证书需要 CA 的签名，很贵很贵。为了测试，做个自签名（self-signed）证书足够了。

确定机器安装了 OpenSSL 之后，执行下面的命令就可以在当前目录生成 `crt` 和 `key` 文件

```shell
$ sudo openssl req \
-x509 \
-nodes \
-days 365 \
-newkey rsa:2048 \
-keyout example.key \
-out example.crt
```

各参数含义如下：

- req：处理证书签署请求
- -x509：生成自签名证书
- -nodes：跳过为证书设置密码的阶段，这样 Nginx 才可以直接打开证书
- -days：有效时间为多少天
- -newkey：使用什么算法生成新的私钥，这里使用的是 2048 位的 RSA 算法
- -keyout：新生成的私钥文件名称及存放地址
- -out：新生成的证书文件名称及存放地址

执行后，会跳出一堆问题来需要回答，

```shell
Output
Country Name (2 letter code) [AU]:US
State or Province Name (full name) [Some-State]:New York
Locality Name (eg, city) []:New York City
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Bouncy Castles, Inc.
Organizational Unit Name (eg, section) []:Ministry of Water Slides
Common Name (e.g. server FQDN or YOUR name) []:server_IP_address
Email Address []:admin@your_domain.com
```

重要的是 `Common Name`,正常情况下填入一个域名，这里可以填写 `127.0.0.1`

```shell
Common Name (e.g. server FQDN or YOUR name) []: 127.0.0.1
```

回答完问题之后，在当前目录新建一个 `certs` 子目录,并把生成的 `example.crt` 和 `example.key` 放入 `certs` 子目录

PS: 如果想了解更多关于自签名证书的相关知识，可以点击这里进行查阅 [DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-create-a-self-signed-ssl-certificate-for-nginx-in-ubuntu-16-04) 的教程

### HTTPS 配置

进入 nginx 配置文件目录，打开 `conf.d/default.conf` 文件，在结尾增加下面的配置：

```
server {
  listen                443 ssl http2;
  server_name           localhost;

  ssl                    on;
  # 在实际使用的时候，我们会使用一些有 CA 签名的证书，这里放证书的绝对路径就可以了
  ssl_certificate        /etc/nginx/crets/example.crt;
  ssl_certificate_key    /etc/nginx/crets/example.key;

  ssl_session_timeout    5m;
  ssl_ciphers            HIGH:!aNULL:!MD5;
  ssl_protocols          SSLv3 TLSv1 TLSv1.1 TLSv1.2
  ssl_prefer_server_ciphers on;

  location / {
    root     /usr/share/nginx/html;
    index    index.html index.htm;
  }
}

```

### HTTP/2 以及基本的 Server Push 配置

```
# Ensure that HTTP/2 is enabled for the server
# 在 nginx@1.9.5 之后 nginx 支持 http2
listen 443 ssl http2;

# 这里填写证书文件的路径即可，我这里比较喜欢写绝对路径 
ssl_certificate           ssl/certificate.crt;
ssl_certificate_key       ssl/key.key

root  /var/share/nginx/html;
# whenever a client requests demo.html, also push /style.css, /image1.jpg and /image2.jpg
location = /demo.html {
  http2_push /style.css;
  http2_push /image1.jpg;
  http2_push /image2.jpg;
}
```

### HTTP/2 启用情况验证

打开 Chrome 的开发者工具，在 `NetWork` 卡中进行查看。
![verify_http2_server_push.jpg](http://oq5td7hx8.bkt.clouddn.com/verify_http2_server_push.png)

这样的表现即视为成功。

### 存在问题

在实验成功之后，我尝试在服务器上配置 `HTTP/2` 以及 `Server Push`，由于对 openSSL 版本要求较高，但在 Ubuntu@14.04 上，Nginx@1.13.9 编译不通过，暂时正在寻找解决办法。

同时，HTTP/2 带来的 preload 还没有进行实验，有时间的话会进行更新。

### 参考文章

1. [Introducing HTTP/2 Server Push with NGINX 1.13.9](https://www.nginx.com/blog/nginx-1-13-9-http2-server-push/#configuring)
2. [Nginx 容器教程](http://www.ruanyifeng.com/blog/2018/02/nginx-docker.html)
3. [nginx.conf optmized for http/2 = HTTPS TLS (ssl)](https://gist.github.com/leandromoreira/1c655189b8fae2e24175)
4. [解决Nginx配置http2不生效，谷歌浏览器仍然采用http1.1协议问题](https://zhangge.net/5114.html)
5. [google 搜索： http2 nginx 配置不成功](https://www.google.com/search?q=http2+nginx+%E9%85%8D%E7%BD%AE%E4%B8%8D%E6%88%90%E5%8A%9F&oq=http2+&aqs=chrome.2.69i57j69i59l3j69i60l2.19112j0j4&sourceid=chrome&ie=UTF-8)

### 实现代码

[http2-server-push](https://github.com/Raoul1996/http2-server-push.git)
