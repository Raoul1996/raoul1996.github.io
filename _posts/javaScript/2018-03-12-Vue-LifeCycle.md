---
layout: post
title: Vue2 生命周期钩子
category: Vue
keyword: Vue2 生命钩子
---

### 前言

早上没课在床上躺着睡觉的时候，突然一北京电话来了。前些日子投的小米公司的前端开发实习生电话面试，迷迷瞪瞪，答得并不是很好。所以面试官小姐姐十几分钟就挂断了电话。蜜汁尴尬。

问了一些关于 JavaScript 中异步的解决办法、Vue 中的生命周期等等话题。尤其是 Vue 生命周期这一块答得简直是一塌糊涂。

### 一图胜千言

![Vue 生命周期图示](http://oq5td7hx8.bkt.clouddn.com/lifecycle.png)

图片来自[ Vue 官方文档](https://cn.vuejs.org/v2/guide/instance.html#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%BE%E7%A4%BA)

但这个是英文版的，考虑到读起来可能比较费劲，我在 [process on](https://www.processon.com) 上找到了一幅[中文版的生命周期图示](https://www.processon.com/view/5a005272e4b0f84f89779386?fromnew=1)

![中文版声明周期图示](http://oq5td7hx8.bkt.clouddn.com/Vue%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%BE%E7%A4%BA.svg)

还可以在 `processon` 上查看更多的关于 Vue 的图，对理解帮助很大。

### 生命周期钩子一共有哪些

之前在 [segmentfault](https://segmentfault.com/)上看到了[某网友的文章](https://segmentfault.com/a/1190000008010666)，文中的表格挺赞的。

  Vue 1.0+   |    Vue 2.0+   |                       Description
-------------|---------------|-------------------------------------------------------------
init         | beforeCreate  | 组件实例刚刚被创建，组件属性计算之前，例如 data 属性
created      | created       | 组件实例创建完成，属性已经绑定，但是 DOM 还没有生成，`$el` 属性还不存在
beforeCompile| beforeMount   | 模板编译/挂载之前
complied     | mounted       | 模板编译/挂载之后
ready        | mounted       | 模板编译/挂载之后（不保证组件已经在 document 中）
-            | beforeUpdate  | 组件更新前
-            | updated       | 组件更新后
-            | actived       | for `keep-alive`，组件被激活时调用
-            | deactived     | for `keep-alive`，组件被移除时调用
attached     | -             | 已经不用了
detached     | -             | 已经不用了
beforeDestory| beforeDestory | 组件销毁前
destoryed    | destoryed     | 组件销毁后
-            | errorCaptured | Vue@2.5.0+ 新增，子孙组件发生错误时调用
### 生命周期执行顺序验证

在 [这篇文章](https://segmentfault.com/a/1190000008010666)中已经有了代码，我先将其放到 [gist](https://gist.github.com/Raoul1996/a2adce57c4636bd4155fec12f74aed90)。
<script src="https://gist.github.com/Raoul1996/a2adce57c4636bd4155fec12f74aed90.js"></script>

打开[jsbin](https://jsbin.com/feqitos/1/edit?html,output)，然后打开 chrome 开发者工具即可看到运行结果。

