---
layout: post
title: JS中的网络请求----从会对接口到玩玩 Promise
category: JavaScript
keywords: ajax 网络请求
---

### 前言

上篇文章，简要的提了一下 jQuery 中封装好的 $.ajax() 方法的使用，这篇文章就简要的说一下如何使用fetch，并简单的说一下怎么设置请求头，以及原因和必要性。

同样，这篇文章适合刚学会对接口，或者正在学习对接口的童鞋，对于其他童鞋，推荐去找一些其他的文章学习，就酱。

我的上一篇文章：[JS中的网络请求----从懵逼到。。。。会对接口]("https://raoul1996.github.io/2017/09/15/howToSendRequest.html")

就是这样，闲言少叙，开始正题

### fetch 和 ajax 的区别

请注意，这里的说法有不同。我们需要明白的一个事情就是，**ajax** 是什么。我一直强调的一个说法就是，jQuery对ajax进行了封装。ajax的全称是(Asynchronous JavaScript and XML),翻译过来是异步的 JavaScript 和 XML。ajax基于的是 XMLHttpRequest 对象，实现在不刷新页面的情况下调用数据。

ajax并不是一门新技术，而是对原有的技术的一种新的约定，新的规范。

而fetch则不同，fetch API 提供了一个 JavaScript 接口，并提供了一个 fetch() 方法。

或者说，ajax和fetch解决的是同一个问题，但是实现的方法不同。个人感觉fetch更加简洁也更加易用。

### [如何使用fetch]("https://github.com/github/fetch")

由于fetch这个比较新，所以古老版本的浏览器(Chrome 42, Firefox 39 以下)可能不支持，需要引入一些垫片去“垫一下”，如[whatwg-fetch]("https://google.com"),一些不支持promise的古古老浏览器可能会需要[promise-polyfill f]("https://google.com")或者[babel-polyfill]("https://google.com")。

那么如何使用fetch去发一个网络请求呢？(来自[MDN]("https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch"))

```
let myImage = document.querySelector('img');

fetch('flowers.jpg')
.then(function(response) {
    return response.blob();
})
.then(function(myBlob) {
    let objectURL = URL.createObjectURL(myBlob);
    myImage.src = objectURL;
});

```
这里我们通过网络获取一个图像并将其插入到一个 \<img\> 元素中。最简单的用法是只提供一个参数用来指明想fetch到的资源路径，然后返回一个包含响应结果的promise(一个 Response 对象)。
当然它只是一个 HTTP 响应，而不是真的图片。为了获取图片的内容，我们需要使用 blob() 方法（在Bodymixin 中定义，被 Request 和 Response 对象实现）。

这个例子的含义比较。。。嗯。。丰富。。我们来分析一下都涉及到了什么东西。
1. document.querySelector
2. es6 语法
3. and。。。。。。

暂时没有必要懂那么多。。。。

来实现一下昨天的那个登录的例子。

```
fetch('http://localhost:3000/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mobile: '1',
    password: '1',
  })
  }).then((response) => {
    console.log("the response from server is:")
    console.log(response)
  }).catch((err) =>{
    console.log(err)
  })
```

方便起见，一切从简。是不是写法和ajax还是蛮像的,只不过代码中的then和catch是不是没见过？

简单的说一下。

fetch基于 promise。 promise这个东西很有意思，他解决了我们在JS异步操作中的[回调地狱]("https://google.com")问题。每一个promise对象都会包含一个resolve回调和一个reject回调，就很类似上文中我们提到的success回调和error回调。然后每一个then都可以返回一个promise对象，到下一个then中进行处理。然后catch就是当于是reject回调。**promise** 这个对象蛮复杂，仅靠这三言两语根本说不明白啊。其实我也不是很懂啦。我们首先先会用，然后原理日后再说，好吧。

同样在上一篇文章中，我们提到了一个场景。如果问路的时候，人家向我们要信物，要暗号怎么办啊？

回到我们的正题。一般在登录的时候，后端会给我们发一个票据，就是类似于通行证的东西，可以是`cookie`，可以是`token`。由于http协议是一个无状态的协议，简单的说就是服务器不会记住你是谁，每次发请求的时候，带着这个票据就是告诉服务器：“我是刚才来的那个王二麻子，这是你刚刚发给我的通行证”，就起这个作用。

```
let token  =  window.localStorage.getItem("token") || ‘’

fetch('http://localhost:3000/users/login', {
  method: 'POST',
  headers: {
    'token':token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mobile: '1',
    password: '1',
  })
  }).then((response) => {
    console.log("the response from server is:")
    console.log(response)
  }).catch((err) =>{
    console.log(err)
  })

```
假设我们已经登录过了，已经把 token 存到了 localStorage 中。

当我们发出去请求的时候，后端就可以从request对象中取到我们设置的header，然后就能知道请求的发出者是谁了。

### 总结一下

这篇文章，我们主要说了以下内容：

1. 如何使用 fetch
2. fetch和ajax的比较
3. 简单说了几句promise
4. 如何在request中设置header，以及其必要性。

thx

2017-09-17 1:13
