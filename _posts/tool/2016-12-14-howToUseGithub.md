---
layout: post
title: 初探Github
category: Github
keywords: Github 注册 小白使用github 

---

*适用范围：初次接触github，本文会领导你初步探索一下github，因为github我也不是很熟练。。。。。*

###先放一点前辈们的教程

1. [怎样使用 GitHub？文科妹子写的 Github 入门教程](https://gold.xitu.io/entry/56e638591ea49300550885cc "教程十分基础，妹子很风趣，很好玩的哦")

2. [如何高效利用GitHub](http://www.yangzhiping.com/tech/github.html "上文中的妹纸同样也推荐了")

3. [Git教程](http://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000 "廖雪峰大牛的git教程哦,暂时可以先不看")

### Github可以做什么

1. 代码云端存储,麻麻再也不用担心我的代码丢了(此处提醒某璇)

2. 建立gh-pages分支,将自己的前端页面放到github上,可以直接通过网络访问,可以在同学面前装一个完美bi(我的这个博客就是[使用github搭建的哦](http://www.ruanyifeng.com/blog/2012/08/blogging_with_jekyll.html "最基本的jeklly用法")).

3. 用github做图床,写博客的时候再也不用担心图片没处放了~~~(我的图片有一部分放在了七牛云上)

4. 可以用来写博客.

5. 找工作的时候,一些公司会问你的github账号,到时候注意别懵逼.

...........(还可以去看看gitbook怎么玩)

还有好多,可以看一下知乎上关于这个问题的[回答](https://www.zhihu.com/question/19771598 "github可以做什么").

### 如何注册Github账号

1. 访问[github主页]("https://github.com"),点击**Sign up**,然后输入自己的用户名和密码,和注册别的账号没啥不同.


2. 然后,就会懵逼了吗..因为github是一个**英文社区**,好好锻炼你的英文吧.



3. 然后就是注册成功....登录进去后..就注册ok了..


4. 没了,是不是超级简单......

### Create a New Repo


![](http://i.imgur.com/eGLfSsk.png)

点那个`花红柳绿`的按钮**New repository**就ok.


----------

![](http://i.imgur.com/h7lKzqk.png)

填入该有的信息,比如你repo的名字,描述,设置为公共(Public)还是私有(Private),当然...私有的会收费....然后是否用一个readme去初始化(initialize)你的项目,这个我也不知道是啥,所以我也没管过.再后边的,以后再说.

然后就是点击**Create Repo**(原谅我,我不知道repo是啥意思)

----------

下面这信息量稍微大了点,你要看吗?(懒得管了^_^).
![](http://i.imgur.com/BVAxkRv.png)



### 如何将远程的repo同步到本地

使用git命令,本来接触到github的你们应该已经会了的(不过怪我,谁让我随便狂拉你们的进度条呢.....网中的宝宝们..不要打我)...

我推荐使用[jetbrains公司](www.jetbrains.com "裂墙推荐,不过pojie方法,自己找")的webstorm,超级好用,被誉为最强大的JavaScript IDE....下面就说说怎么在**webstorm中怎么配置git环境**..

因为我学习前端的时日也不是很多,ws用过的最低版本是2016.1.1...以前的版本可能会有一些不同吧,但是相信是大同小异.

闲言碎语不要讲,下面是详细的步骤(砰砰砰,啊啊啊.....黑板碎了)

1. [安装git环境](https://git-scm.com/download/win "windows"),然后一路next,反正也看不懂...**一定要记得你git的安装路径**很重要的.

	1. 其他问题自行[查看官方的wiki](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git),写的很详细的.

	2. 应该也没有别的问题了吧.....

2. 安装webstorm....没的说..安装---->激活----->**不要汉化**

3. 打开webstorm,不出意外,基本应该是...这个样子:

![](http://i.imgur.com/aRKQzwg.png) 

>点击那个小齿轮后边的Configure,进入setting(怕你们懵逼,给张图啊)

![](http://i.imgur.com/yzDz3vY.png)

把**Path to Git executable**里边的东西指向你git安装目录的cmd下的git.exe.......配置完成..

>配置Github登录信息

![](http://i.imgur.com/uV1w1Up.png)

这个就不需要我教了吧....问题是,我也没法教啊...臣妾做不到啊

>测试一下

ws同样要求你设置一个密码,记得别忘了..不然重置很费劲的...

**然后基本的配置基本的配置就完成了,可以测试一下,clone一个项目试一试啦**

###如何从github上clone一个项目.

1. 获取到项目的仓库在的github上的地址,比如react的项目.

		https://github.com/facebook/react.git

2. 打开webstorm--->Check out form Version Control-->git

3. 看图

![](http://i.imgur.com/3KZ9o6u.png)

点一下clone,然后webstorm就会去对应的地址上去下载远程仓库.

###如何将代码推送到远程服务器

![](http://i.imgur.com/iAH22eX.png)

点击那个push(向上)的箭头,出现以下场面:
