---
layout: post
title: Nginx 解决跨域问题
category: Http
keyword: cross-origin nginx
---

### Nginx 简介

Nginx 是一款面向性能的轻量级开源 Http 服务器，该软件由 [lgor Sysoev](https://zh.wikipedia.org/wiki/%E4%BC%8A%E6%88%88%E7%88%BE%C2%B7%E8%B3%BD%E7%B4%A2%E8%80%B6%E5%A4%AB) 创建，于 2004 年首次公开发布。在网络上很大一部分 Web 服务器使用 Nginx，通常作为 [负载均衡器](https://zh.wikipedia.org/wiki/%E8%B4%9F%E8%BD%BD%E5%9D%87%E8%A1%A1)

### 跨域常见解决方式

跨域的解决方式大大小小有很多，使用 Nginx 可以通过以下两个角度实现，都会用到[反向代理](https://zh.wikipedia.org/wiki/%E5%8F%8D%E5%90%91%E4%BB%A3%E7%90%86)：

1. CORS，跨域资源共享
2. 重写 URL

### Nginx 跨域实现

#### [正向代理、反向代理、透明代理](http://blog.51cto.com/z00w00/1031287)

代理服务技术在计算机网络中的应用非常广，划分的标准很多，这里主要区分正向代理，反向代理，透明代理三种

#### 正向代理

一般默认的代理技术指的就是正向代理（Forward Proxy），特征就是客户端知道目标和代理的存在。最常见的应用场景就是在国内访问 [google.com](https://google.com/ncr)。如果直接访问，很可能访问失败。一般解决的方式也很简单，客户端将请求打到代理服务器，然后代理服务器代替客户端去向 google 发请求，请求到的资源再发回服务器。客户端的目标是访问 google.com，并获取到其资源。这样的目的就决定了：

**只有客户端才可以使用正向代理，而且通常需要经过一些特殊的配置**

当然正向代理的作用并不仅仅局限于此，更多的信息可以查看[这里](http://blog.51cto.com/z00w00/1031287)

##### 反向代理

反向代理和正向代理正好相反。反向代理的特征就是客户端不知道代理的存在，并不知道代理服务器如何获取资源。比较常见的一个应用场景就是负载均衡。当然反代也可以用于保护和隐藏原始资源服务器，使用其进行跨域只是负载均衡场景下的一个特例而已，因为这时只有一个服务，不需要做负载均衡。

在大规模的 WEB 应用中，单服务器性能并不能满足需求，解决方案之一就是利用多台资源服务器构成集群，通过负载均衡器按照一定的策略将服务打到不同的资源服务器上，从而实现性能的提升。当然负载均衡器本身也可以是负载均衡集群，资源服务器也不一定是物理机，一般都是容器。

对于反向代理，用户并不需要进行额外的配置，也不知道请求到的服务资源到底是从哪里来的，只需要和反向代理服务器进行通信，然后获取资源进行使用即可。

##### 透明代理

至于透明代理的话，客户端和资源服务器双方都不知道其存在，透明代理会将客户端的真实 IP 传递给资源服务器。透明代理会改编 request fields，比较常见的一个应用就是使用 Burp Suite 修改请求报文，用来分析网络请求。


#### [CORS —— 跨域资源共享](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)

出于安全原因，**浏览器**限制从脚本内部发起跨域请求。协议（http、https 或者 ftp）、域名（a.test.com、b.test.com）、端口（80、8080 或者 9000）三者有任意一项不同，都属于跨域的情形。对于跨域请求，浏览器默认会对其进行限制，除非请求的响应头中使用 CORS 头进行声明，告知浏览器服务端允许该资源允许跨域 HTTP 请求。

CORS，全称为 [corss-origin sharing standard](https://www.w3.org/TR/cors/)，是一个 W3C 标准。通过允许 Web 服务器进行跨域访问控制，来降低跨域 HTTP 请求所带来的风险，使跨域数据以安全的方式进行。**CORS 跨域需要前后端的共同协作，跨域从来不是前端或者后端单方的独角戏。**

更多内容可以参见以下内容：

1. [MDN ---- HTTP访问控制（CORS）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)
2. [大转转 FE ---- 跨域的那些事儿](https://zhuanlan.zhihu.com/p/28562290)
3. [阮一峰 ---- 跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)

PS：同源策略是浏览器自主遵守的一个安全策略，对于 Nginx，并不会遵守同源策略。Nginx 作为 Http 服务器，可以为通过其的 Http 添加 Request Header 和 Response Header。通过这样的方式，就可以实现跨域资源共享。

#### [Nginx 常用内置预定义变量](https://github.com/jaywcjlove/nginx-tutorial#%E5%86%85%E7%BD%AE%E9%A2%84%E5%AE%9A%E4%B9%89%E5%8F%98%E9%87%8F)

变量名称       |   值
---------------|---------------------------
$scheme        | 请求的协议
$host          | 如果当前请求有 Host，则为请求头 Host 值，否则为匹配到该请求的 server_name 值
$server_port   | 请求到达服务器的端口号
$request_uri   | 不带有主机名的包含请求参数的原始 URI

例如：

https://api.raoul1996.cn:80/captcha?timestemp='xxx'

变量名称       |   值
---------------|---------------------------
$scheme        | https
$host          | api.raoul1996.cn
$server_port   | 80(一般默认不写)
$request_uri   | /captcha?timestemp="xxx"

通过这些全局变量，或者称为内置预定义变量，就可以拿到请求的 URL，对于使用 CORS 的方法，只需要使用内置的 add-header 方法在响应中添加响应的 CORS 头即可。

# [Nginx 添加 CORS 头](https://github.com/jaywcjlove/nginx-tutorial#%E8%B7%A8%E5%9F%9F%E9%97%AE%E9%A2%98)

```lua
server {
  listen 80;
  server_name api.raoul1996.com;

  add_header 'Access-Control-Allow-Origin' 'https://votes.raoul1996.cn';
  add_header 'Access-Control-Allow-Credentials' 'true';
  add_header 'Access-Control-Allow-Methods' 'GET,POST,HEAD';

  location / {
    proxy_pass http://127.0.0.1:12012;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host  $http_host;
  }
}
```
#### 使用 Nginx rewrite 指令重写并反代

```lua
server {
  listen 80;
  server_name votes.raoul1996.cn;
  location / {
    root html/vote;
    index index.html index.htm
  }
  location ^~/api/ {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass http://api.raoul1996.cn;
  }
}
```
这样就不是跨域的请求了，比如访问 [http://votes.raoul1996.cn/api/captcha?timestemp="xxx"](https://votes.raoul1996.cn/api/captcha?timestemp="xxx")，反向代理服务器会从 [http://api.raoul1996.cn/captcha?timestemp="xxx"](https://api.raoul1996.cn/captcha?timestemp="xxx")拿到资源，返回给客户端，当然客户端并不知道这个过程。

### 参考资源（基本都是从这里面抄的）
[Nginx 安装维护笔记 ---- 跨域问题](https://github.com/jaywcjlove/nginx-tutorial#%E8%B7%A8%E5%9F%9F%E9%97%AE%E9%A2%9)，文章讲的很棒，但是稍有瑕疵，已经提了 [issue](https://github.com/jaywcjlove/nginx-tutorial/issues/1)，希望阅读的时候注意。
