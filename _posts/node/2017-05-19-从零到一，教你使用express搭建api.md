---
layout: post
title: 从零到一，教你搭建支持跨域的网络请求接口
category: node
keywords: node, nodeJS express api
---

### 前言

**这是一篇给node新手或者是不熟悉express的菜鸟看的，但是需要会搭建node环境，会使用git做版本管理，知道常用的跨域方式并可以进行简单的跨域会更好。仅用作日常开发应急使用。**

先上[github地址](https://github.com/Raoul1996/expressApi.git),如果你仅仅是想找一个能支持跨域的接口，那么请尽管拿去（我是初学者，业务能力不行，代码比较乱，勿怪）
### 介绍---- express 是什么？
Node是JavaScript语言的服务器运行环境。(这句话我看不懂耶。。没关系，我也看不懂，接下来咱们说人话)

简单的说，node 把 JavaScript 又一次的带回了服务端领域。

等等，为什么说是**又一次**呢？因为JavaScript这门语言一出生的时候是作为一门服务端的脚本语言，可是当时的服务端语言多的也是到了可怕的程度，比如我们熟悉的Perl，Ruby等等，JavaScript被逼无奈，只好来到了前端一统天下。在前端领域发展的也是风生水起哈。

扯远了，express是什么捏？ 让我们看看[express官方](https://expressjs.com/)对自己的定位：

**Fast, unopinionated, minimalist web framework for [Node.js](https://nodejs.org)**

木有看懂？

咱可以去看看[中文版本](https://expressjs.com/zh-cn/):

**高度包容、快速而极简的 Node.js Web 框架**

那么貌似看懂了，这玩意就是对node进行了一系列的封装，使开发起来更爽。

就是这样。

### 环境要求

1. 不要求系统，但是最好不要用xp这种明显已经过时还用着IE6这种垃圾浏览器的电脑。Windows，Ubuntu或者是OSX，都可以。
2. 要求node版本在4以上，推荐使用6以上，现在已经更新到了7.10了吧。
3. npm推荐4版本以上吧，安装的快一点。国内请替换淘宝源或者安装cnpm，用nrm做快速切换也可以。
4. 可以使用yarn代替npm

### 安装步骤(Windows 演示)

1. 安装express的脚手架工具 `express-generator`

		npm i -g express-generator

2. 使用安装好的脚手架工具，初始化我们的第一个express project （是不是有点小激动）

		cd workpalce/node/express
		mkdir express-demo 
		cd express-demo
		express
		warning: the default view engine will not be jade in future releases
        warning: use `--view=jade' or `--help' for additional options

           create : .
           create : ./package.json
           create : ./app.js
           create : ./public
           create : ./views
           create : ./views/index.jade
           create : ./views/layout.jade
           create : ./views/error.jade
           create : ./routes
           create : ./routes/index.js
           create : ./routes/users.js
           create : ./bin
           create : ./bin/www
           create : ./public/javascripts
           create : ./public/stylesheets
           create : ./public/stylesheets/style.css

           install dependencies:
             $ cd . && npm install

           run the app:
             $ DEBUG=express-demo:* npm start

           create : ./public/images

3. 然后就是安装依赖
	
		npm i

4. 启动服务

		npm start

5.访问[本地3000端口](http://localhost:3000)

### 开始开发

PS：由于windows的命令行实在是弱鸡，这里我用了Windows的Ubuntu子系统的bash，但是启动express的时候不可以使用子系统的bash哦

	tree -L 1
	.
	├── app.js # 应用主入口文件
	├── bin # 启动脚本
	├── node_modules # 依赖的安装目录
	├── package.json # npm项目的配置文件
	├── public # 静态资源
	├── routes # 路由规则存放
	└── views # 模板文件存放目录

需要进行编辑的文件就是这个`app.js`文件了。

### 核心概念简介

#### 核心概念：路由
#### 核心概念：中间件
#### 核心概念：模板引擎

这部分请参见[Express使用手记：核心入门](http://imweb.io/topic/57c8cb417f226f687b365634)

没必要把别人的东西照搬一遍说是自己的，木有意思

### 不再浪费时间的内容

什么是跨域，，为什么跨域，跨域的方式等等，请自行搜索网络

### CORS：跨域资源共享

这个可能[阮叔的文章](http://www.ruanyifeng.com/blog/2016/04/cors.html)会对你有帮助

看文章的时候，请务必知道非简单请求的CORS请求会在请求前发一次预检（preflight），目的是为了判断实际发送的请求是否是安全的。而我的请求带了加了上了`token`字段。

#### 正是因为预检请求，所以事情变的稍有麻烦。

这个成功的请求的案例

![成功的请求案例](http://oq5td7hx8.bkt.clouddn.com/%E9%A2%84%E6%A3%80.png)

#### 看完上面的文章，我们应该写出了一些什么东西

![4个路由](http://oq5td7hx8.bkt.clouddn.com/res.png)

这四个路由应该是没问题的，如果有，可以去看一下我的代码（上面的github repo）。

#### 如何跨域？

因为下午的时候，后端小哥的服务没开，然后我们前端请求数据根本没可能。不能这个样子，我们前端的开发怎么能够这么轻易的就被去上课的后端小哥给限制住？我们要自己开自己的接口！！！！

通过日常和后端小哥们进行交流，了解到使用CORS的最重要一点就是在响应头中有`Access-Control-Allow-Origin:*`这个字段，那么就开始实践。

经过一系列的搜索

添加这么一个中间件就可以支持cors

    apiRoutes.all('*', function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', 'Content-Type, Token,Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild')
      res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
      res.header('X-Powered-By', ' 3.2.1')
      res.header('Allow', 'GET, HEAD, POST, PUT, DELETE, OPTIONS, PATCH')
      res.header('Content-Type', 'application/json;charset=utf-8')
      if (req.type === 'OPTIONS') {
        res.send(200)
      } else {
        next()
      }
    })

因为在开始实验的一个坑不见了，所以文章

### 到此结束

具体代码实现欢迎移步我的[github repo](https://github.com/Raoul1996/expressApi.git)

**我能怎么办，我也很绝望啊**