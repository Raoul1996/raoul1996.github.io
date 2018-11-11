---
layout: post
title: Serial and Parallel Request in Javascript 
category: Http
keywords: serial request, parallel request
---

**English isn't my native language, please excuse the typing error.**

### TL;DR

Talk is cheap, show you my code.

Use `async` and `await` syntactic sugar, before u read the blog, you should have so experience on `Promise` and `window.fetch` function.

So, let's start.

First, there are some common code in the example:

```js
// for example, just send a get request
const fetchData = async (url) => await window.fetch(url)

const urls = [
    'https://raoul1996.github.io/2018/11/04/NAT-traversal.html',
    'https://raoul1996.github.io/2018/04/01/howToStart.html',
    'https://raoul1996.github.io/',
    'https://raoul1996.github.io/2018/03/18/CDN.html'
]
```

we defined the `urls list` and a `fetchData` function, which is based on `window.fetch`, it's very simple. 

#### Parallel Request 

```js
const requests = urls.map(url => fetchData(url))
const responses = await Promise.all(requests)
```
The **`Promise.all(iterable)`** method returns a single `Promise` that resolves when all of the promises in the iterable have resolved or when the iterable arguments contains no promises. It rejects with the reason of the first promise that rejects.

So it'very dangerous. so use **Seial Request** is better than it most times.

#### Serial Request

There I wiil provide 2 implement：

```js
const serialRquests = async(urls, handler) => {
  const result = [];
  for (const url of urls) {
    const ret = await handler(url);
    result.push(ret);
  }
  return result;
}
const responses = await serialRquests(urls,fetchData)
```

And other method is very intersting, and I found it form [gist](https://gist.github.com/anvk/5602ec398e4fdc521e2bf9940fd90f84), it use the `Array.reduce` methods, the hardest build-in function.

When write the blog, I find a wery powerable Promise libary in node, which named [bluebird](http://bluebirdjs.com). this libary support more methods, like `Promise.reduce`, `Promise.filter` and etc. In the next ECMAScript, developer can use `Promise.finally`, a very useful method like `try...catch...finally`

Thanks for your reading.

