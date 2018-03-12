---
layout: post
title: Vue2 生命周期钩子
category: Vue
keyword: Vue2 生命钩子
---

### 前言

早上没课在床上躺着睡觉的时候，突然一北京电话来了。前些日子投的小米公司的前端开发实习生电话面试，迷迷瞪瞪，答得并不是很好。所以面试官小姐姐十几分钟就挂断了电话。蜜汁尴尬。

问了一些关于 JavaScript 中异步的解决办法、Vue 中的生命周期等等话题。尤其是 Vue 生命周期这一块答得简直是一塌糊涂。

文章可能排版有问题，同时可以[查看这里](https://github.com/Raoul1996/raoul1996.github.io/issues/4)

### 一图胜千言

![Vue 生命周期图示](http://oq5td7hx8.bkt.clouddn.com/lifecycle.png)

图片来自[ Vue 官方文档](https://cn.vuejs.org/v2/guide/instance.html#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%BE%E7%A4%BA)

但这个是英文版的，考虑到读起来可能比较费劲，我在 [process on](https://www.processon.com) 上找到了一幅[中文版的生命周期图示](https://www.processon.com/view/5a005272e4b0f84f89779386?fromnew=1)

![中文版声明周期图示](http://oq5td7hx8.bkt.clouddn.com/Vue%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%BE%E7%A4%BA.svg)

还可以在 `processon` 上查看更多的关于 Vue 的图，对理解帮助很大。

### 生命周期钩子一共有哪些

之前在 [segmentfault](https://segmentfault.com/)上看到了[某网友的文章](https://segmentfault.com/a/1190000008010666)，文中的表格挺赞的。
![life-cycle-table](http://oq5td7hx8.bkt.clouddn.com/life-cycle-table.png)

### 生命周期执行顺序验证


在 [这篇文章](https://segmentfault.com/a/1190000008010666)中已经有了代码，我先将其放到 [gist](https://gist.github.com/Raoul1996/a2adce57c4636bd4155fec12f74aed90)。

```html
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/vue/2.1.3/vue.js"></script>
</head>
<body>

<div id="app">
     <p>{{ message }}</p>
</div>

<script type="text/javascript">
    
  var app = new Vue({
      el: '#app',
      data: {
          message : "xuxiao is boy" 
      },
       beforeCreate: function () {
                console.group('beforeCreate 创建前状态===============》');
               console.log("%c%s", "color:red" , "el     : " + this.$el); //undefined
               console.log("%c%s", "color:red","data   : " + this.$data); //undefined 
               console.log("%c%s", "color:red","message: " + this.message)  
        },
        created: function () {
            console.group('created 创建完毕状态===============》');
            console.log("%c%s", "color:red","el     : " + this.$el); //undefined
               console.log("%c%s", "color:red","data   : " + this.$data); //已被初始化 
               console.log("%c%s", "color:red","message: " + this.message); //已被初始化
        },
        beforeMount: function () {
            console.group('beforeMount 挂载前状态===============》');
            console.log("%c%s", "color:red","el     : " + (this.$el)); //已被初始化
            console.log(this.$el);
               console.log("%c%s", "color:red","data   : " + this.$data); //已被初始化  
               console.log("%c%s", "color:red","message: " + this.message); //已被初始化  
        },
        mounted: function () {
            console.group('mounted 挂载结束状态===============》');
            console.log("%c%s", "color:red","el     : " + this.$el); //已被初始化
            console.log(this.$el);    
               console.log("%c%s", "color:red","data   : " + this.$data); //已被初始化
               console.log("%c%s", "color:red","message: " + this.message); //已被初始化 
        },
        beforeUpdate: function () {
            console.group('beforeUpdate 更新前状态===============》');
            console.log("%c%s", "color:red","el     : " + this.$el);
            console.log(this.$el);   
               console.log("%c%s", "color:red","data   : " + this.$data); 
               console.log("%c%s", "color:red","message: " + this.message); 
        },
        updated: function () {
            console.group('updated 更新完成状态===============》');
            console.log("%c%s", "color:red","el     : " + this.$el);
            console.log(this.$el); 
               console.log("%c%s", "color:red","data   : " + this.$data); 
               console.log("%c%s", "color:red","message: " + this.message); 
        },
        beforeDestroy: function () {
            console.group('beforeDestroy 销毁前状态===============》');
            console.log("%c%s", "color:red","el     : " + this.$el);
            console.log(this.$el);    
               console.log("%c%s", "color:red","data   : " + this.$data); 
               console.log("%c%s", "color:red","message: " + this.message); 
        },
        destroyed: function () {
            console.group('destroyed 销毁完成状态===============》');
            console.log("%c%s", "color:red","el     : " + this.$el);
            console.log(this.$el);  
               console.log("%c%s", "color:red","data   : " + this.$data); 
               console.log("%c%s", "color:red","message: " + this.message)
        }
    })
</script>
</body>
</html>
```

打开[jsbin](https://jsbin.com/feqitos/1/edit?html,output)，然后打开 chrome 开发者工具即可看到运行结果。

