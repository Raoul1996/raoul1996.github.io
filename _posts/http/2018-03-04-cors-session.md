---
layout: post
title: 前后端分离项目中基于 Session 图片验证码功能的实现
category: Http
keyword: Http session captcha
---

早就听说 Session 是一个大坑，最近在使用 Node 做图片验证码的时候，刚好掉到了里边，所以记录一下。
### 操作环境

- Eggjs@\^2.3.0
- Vue@\^2.5.11
- [线上投票地址](https://votes.raoul1996.cn)
- [线上后台地址](https://api.raoul1996.cn)
- [后端仓库地址](https://github.com/Raoul1996/egg-vote)
- [前端仓库地址](https://github.com/Raoul1996/vue-vote)

### Session 是什么

这个问题的确是老生常谈。由于 HTTP 协议是无状态的协议，所以服务端在记录某种状态的时候，就需要使用某种机制来识别用户，这种机制就是 Session。

#### 常见的应用场景

- 购物车
- 图片验证码
- 追踪用户
- 等等

### 图片验证码如何存储到 Session

egg 中支持将 Session 存储到 Redis 数数据库中，但是由于目前只是使用 session 存储一下 captcha 的值，没必要使用 redis 进行操作了，直接放到传统的内存中就 OK 了。

### 服务端如何识别 session

这时候就不得不提一下 Cookie。同样也是一个老生常谈的问题。首先想一下我们是服务器的话，我们如何来识别客户端（Client）？

由于 HTTP 是无状态的协议，所以我们期待客户机每次访问的时候，都告诉一下我们是谁，对吧？

事实上也是这样，在第一次创建 Session 的时候，服务端就会通过某种方式来告诉客户端，需要有某种方式来记录一下 Session ID。以后每次访问的时候，都把这个 ID 发给服务端用于用户身份的识别。

Cookie 就非常适合用来处理这个工作。浏览器在访问相应域名（domain）的时候，默认会自动携带对应域名下的 Cookie，无需我们做额外处理。

所以我们就可以把 Session Id 写到 cookie 中，然后再每次发请求的时候，交给服务端验证 Session Id，识别用户的登陆状态。

#### 如果客户端禁止了 cookie 呢？

一般的处理方式是将 Session Id 添加到 url 中，供服务端识别，但是这里没有用到，故不赘述。

### 服务端如何存储 Session

Session 默认存储在服务器的内存中，然后将 Session Id 写入客户端的 Cookie 中，保证客户端碰不到 Session 中保存的关键数据，避免修改。但是在内存中务必会出现一些问题。比如说如何共享 Session，如果部署服务集群的话，存在内存中的 Session 必定是不能共享的。

#### Session 持久化存储

Session 可以存储到文件中，和各种数据库中。Node 项目的话一般选择会存储到 redis 数据库中。但是同样由于暂时没有持久化存储的需求这里先不讨论。

### 跨域携带 Cookie 前后端代码实现

后端使用 `egg-cors` 模块完成请求的响应头中的 `Access-Control-Allow-Headers`、`Access-Control-Allow-Methods`、`Access-Control-Allow-Origin`、`Access-Control-Allow-Credentials: true` 等条目的添加。

前端使用 `axios` 进行跨域请求。

#### 前端代码实现

[前端 axios 配置文件](https://github.com/Raoul1996/vue-vote/blob/master/src/service/axios.js)

关键的配置只有一行
```js
// axios.js
instance.defaults.withCredentials = true

```
如果没有定义 `axios` 的 `instance` 的话，直接添加到 `axios` 上面即可。

#### 前端配置解释

我们需要携带 Cookie 进行跨域请求，目的是让服务端识别写在 Cookie 中的 Session Id。那么现在的问题就是：

**跨域请求如何携带 Cookie？**

[`XMLHttpRequest.withCredentials`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/withCredentials) 属性是一个 `Boolean` 类型，默认值为 false。它指示了是否该使用类似cookies,authorization headers(头部授权)或者TLS客户端证书这一类资格证书来创建一个跨站点访问控制（cross-site Access-Control）请求。**在同一个站点下使用withCredentials 属性是无效的。**

**此外，这个指示也会被用做响应中cookies 被忽视的标示。默认值是false。**

意思是什么呢？

如果在发送来自其他域的 XMLHttpRequest 请求之前 `XMLHttpRequest.withCredentials` 不为 `true` 的话，那么就不能为他自己的域设置 Cookie，无论设置什么 `Access-Control-header` 都没有用，没法存储来自其他域的 Cookie。

#### 后端代码实现

[后端跨域配置](https://github.com/Raoul1996/egg-vote/blob/master/config/config.default.js#L86),[后端生产环境下域名白名单配置](https://github.com/Raoul1996/egg-vote/blob/master/config/config.prod.js#L15)

关键配置有两个地方,稍候进行解释

```js
// config.default.js
module.exports = app => {
	exports.cors = {
    	allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    	credentials: true
  	}
}
```

```
// config.prod.js
module.exports = app => {
	const domainWhiteList = []
  	const portList = [8080, 7001]
  	portList.forEach(port => {
    	domainWhiteList.push(`http://localhost:${port}`)
    	domainWhiteList.push(`http://127.0.0.1:${port}`)
  	})
  	domainWhiteList.push('https://votes.raoul1996.cn')
  	domainWhiteList.push('http://egg.raoul1996.cn')
	exports.security = {domainWhiteList}
}
```
#### 后端配置解释
在 [`config.default.js`](https://github.com/Raoul1996/egg-vote/blob/master/config/config.default.js#L86) 处的配置会为响应添加 `Access-Control-Allow-Credentials: true`，表示服务端允许跨域请求包含 Cookie

在 [`config.prod.js`](https://github.com/Raoul1996/egg-vote/blob/master/config/config.prod.js#L15) 中配置了跨域请求域名的白名单，这里会涉及到 [`egg-cors` 模块的内部实现](https://github.com/eggjs/egg-cors/blob/master/app.js)。

```js
// egg-cors 内部实现
'use strict';

module.exports = app => {
  // put before other core middlewares
  app.config.coreMiddlewares.unshift('cors');

  // if security plugin enabled, and origin config is not provided, will only allow safe domains support CORS.
  app.config.cors.origin = app.config.cors.origin || function corsOrigin(ctx) {
    const origin = ctx.get('origin');
    if (!ctx.isSafeDomain || ctx.isSafeDomain(origin)) {
      return origin;
    }
    return '';
  };
};
```

由于允许携带 Cookie 之后，浏览器不允许 `Access-Control-Allow-Origin` 值为 `*`，所以需要进行上述操作。

### 图片验证码功能实现

Egg 下的图片验证码的实现我已经封装了一个小的 [plugin](https://www.npmjs.com/package/egg-captcha)，基于 [`ccap`](https://www.npmjs.com/package/ccap)，请参阅 [这里](https://www.npmjs.com/package/egg-captcha)

### 后记

还有很多东西没有很深入的研究，比如 Session 机制的来源因果，Session 持久化的相关知识。

### 参考文章

1. [vue2 前后端分离项目ajax跨域session问题解决](https://segmentfault.com/a/1190000009208644)
2. [跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)
3. [XMLHttpRequest.withCredentials](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/withCredentials)

