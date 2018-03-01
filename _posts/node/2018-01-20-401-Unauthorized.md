---
layout: post
title: 401 问题引发的一些思考
category: Node
keywords: node, Koa2
---

## 前言

*好久没有写文章了，刚写写还有些不习惯。最近在忙着翻译了一些前端的文章，提升一下自己的姿势水平。*

### 这篇文章回答了一个什么问题？

在使用 `koa-jwt` 中间件进行用户鉴权之后，当用户没有当前路由的权限或者说用户的 `JWT`（JSON Web Token）不合法的时候，我会将 `HTTP` 状态码设置为 401，然后告诉用户未经授权，但是浏览器获得响应之后 `response` 却是 `undefined`，该怎么解决？

### 涉及到的前置知识

0. HTTP
1. Koa2
2. axios
3. JWT
4. Promoise

不会上面的部分也没有关系，其实只要使用过 Node 和任何一种前端框架，基本都可以看得懂。如果 Node 也没用过，前端框架也没用过的话，那么可能暂时这篇文章不是很适合你，但是也看一围观一下我解决问题的思路。

### 希望你能

0. 访问 [google.com](https://google.com/ncr)
1. 了解常见 [HTTP 状态码](https://zh.wikipedia.org/zh-hans/HTTP%E7%8A%B6%E6%80%81%E7%A0%81)的含义
2. 了解 [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token)，并且能够有一些 Node 的使用经验
3. 保持思考的状态，随时记得本文要回答的问题

### 推荐的资料

推荐的资料：

1. [HTTP 状态码](https://zh.wikipedia.org/wiki/HTTP%E7%8A%B6%E6%80%81%E7%A0%81)的含义
2. [Angular Security - Authentication With JSON Web Tokens (JWT): The Complete Guide](https://blog.angular-university.io/angular-jwt-authentication/)，稍后会放中文翻译，英语水平有限，敬请斧正。

## 正文

### 正常的请求

在使用前端框架进行开发的时候，无论是 React 还好，或是 Vue 也罢（Angular 我基本没有接触过）。都逃离不开的一个问题是请求的集中处理，首先我们会去处理 HTTP 状态码不为 200 的非正常响应，比如服务端错误的 5xx，或者是客户端错误的 4xx。处理完这一部分之后，那么 HTTP 状态码为 200 就代表请求获得了正确的响应，然后就去处理那些 `code` 不为 0 （这个值一般是前后端进行约定,这里约定为 0）的请求，这些请求虽然获得了正确的响应，但是内容不一定是前端期望的。那么我们的故事便是从这里开始。

首先，一个最理想的响应结果（JSON）是这个样子的：

```
{
"code":0,
"data":{
	"id":18,
	"email":"test@test.com",
	"name":"test",
	"mobile":"17800987654"
	}
}
```
异常情况就数不胜数了。

### 前端处理方案

#### 不进行集中处理

这是我们在开始学习请求的时候最常见的一种处理办法，就是每次判断 `code` 是不是等于 0,不是 0 的话进行异常逻辑的处理，是 0 的话，开始处理返回回来的数据，并且正确渲染。

这样会存在什么问题

1. 代码重复的部分太多了
2. 写起来真的很烦人

那么有没有什么好一点的处理办法呢？

### 错误集中处理

因为每次我们返回的内容的结构都是相似的，都是这个样子：

```
{
code: {Number}
data: {Object}
}
```
所以我们就会想要集中处理。当然，很对库已经对此提供了 API，我们只需要去配置一下**响应拦截器**就好了。

这里以我使用的 axios 为例，毕竟是 Vue 官方推荐使用的库：

```
// config the response interceptors
axios.interceptors.response.use = instance.interceptors.response.use
instance.interceptors.response.use((config) => {
  // data 即为后端返回的数据
  const {data, data: {code}} = config
  if (code !== 0) {
     return Promise.reject(config)
  } else {
    // return 什么由具体需求决定
    return data.data
  }
}, err => {
  if (err && err.response) {
    const {response: {status}} = err
    switch (status) {
    // 处理异常逻辑  
    } else {
    err.message = '连接到服务器失败'
    }
  return Promise.reject(err)
})
```
完整的文件太长了，就不放到文章中了，可以[点击这里](https://gist.github.com/Raoul1996/afbed72183ede550799dcb5549304ca6)查看。

我们分析一下这段代码做了什么：

- 如果响应没有出错
	- 对每一个响应进行判断，如果 `code !== 0`，那么就 `reject` Promise
	- 如果 `code === 0`，那么就返回响应中的 `data` 对象，也就是不包括 `code` 的部分，方便使用 `data` 中的数据
- 如果响应出错，那么进入 `err` 部分
	- 如果有响应体，那么就查看 `err.response.status` 的值，值为 HTTP 状态码
	- 如果没有响应体，那么就为 `err` 添加 `message` 属性，值为 `'连接到服务器失败'`，这个一般是由于应用本身出现错误，如果是 HTTP 请求问题的话，正常会有响应体

那么哪里出现了问题呢？

### 当 HTTP 状态值为 401 的时候，没有 response

对，正如标题中所讲的那样，当后端返回的 HTTP 状态值为 401 的时候，`err.response === undefined`

这样就没法再 401 的时候让用户跳转到登录页面了，可是理论上应该是可以的。

虽然我现在已经解决了问题，在后文中也会给出解决问题的办法，但是还是希望你看下去，因为我会向你展示从出现 bug 到解决的全程。

首先，是不是 `axios` 本身的问题呢？

#### 检查 axios 

首先，我打印了一下 `err`



