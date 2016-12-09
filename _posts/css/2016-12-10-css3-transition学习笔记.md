---
layout: post
title: css3-transform属性理解
category: css那些事儿
keywords: css3 animate
---

# css3--transition(过渡) #

*8/13/2016 11:10:49 PM *

*editor:Raoul*


----------

>综述:

早期的Web中实现中实现动画效果,都是依赖于JS和flash来完成.在css3中,增加了一个模块---transition,它可以通过一些简单的css事件来触发元素的外观变化,让效果更加细腻.简单点说,就是通过`鼠标点击`、`获取焦点`、`被点击`或者`对元素的任何改变`中触发,并平滑地以动画效果改变css的属性值

在css中创建简单的过渡效果可以通过以下几个步骤实现:

1. 在默认的样式中声明元素的`初始状态样式`
2. 声明过渡元素的`最终状态样式`,比如悬浮状态
3. 在默认样式中添加`过渡函数`,添加一些不同的样式.

**1.transition-property:过渡属性,用来指定过渡动画的css属性名称**

只有具备一个`中点値的属性`(需要产生动画的属性)才能具备过渡效果,其对应具有过渡的css属性有以下43个:

属性名称           |属性名称            |属性名称           | 属性名称 
------------------|-------------------|-------------------|-------------------          
background-color  |background-position|border-bottom-color|border-bottom-width
border-left-color |border-left-width  |border-right-color |border-right-width
border-spaclng    |border-top-color   |border-top-width   |bottom
clip              |color              |font-size          |font-weight
height            |left               |letter-spacing     |line-height
margin-bottom     |margin-left        |margin-right       |margin-top
max-height        |max-width          |min-height         |min-width
opacity           |outline-color      |outline-width      |padding-bottom
padding-left      |padding-right      |padding-top        |right
text-indent       |text-shadow        |vertical-align     |visibility
width             |word-spacing       |z-index            |

代码示例:鼠标悬停(hover)状态下,div的宽度扩大两倍,动画时间持续0.5s

	div {
  		width: 200px;
  		height: 200px;
  		background: red;
  		margin: 20px auto;

  		-webkit-transition-property: width;
  		transition-property : width;

  		-webkit-transition-duration:.5s;
  		transition-duration:.5s;
  		-webkit-transition-timing-function: ease-in;
  		transition-timing-function: ease-in;
  		-webkit-transition-delay: .18s;
  		transition-delay:.18s;
	}
	div:hover {
  		width: 400px;
	}

**2.transition-duration:过渡所需时间,旧属性过渡到新属性所需要的时间，俗称`持续时间`**

**3.transition-timing-function:过渡函数,主要用来指定浏览器的过渡速度,以及过渡期间的操作进展情况**

包括以下几种函数

![过渡函数的类型](http://i.imgur.com/60YVobg.png)

**4.transition-delay:过渡延迟时间,指定一个动画的开始执行时间,也就是说当改变元素属性值后多长时间开始执行**

**5.transtion使用综合案例**

有时候,我们需要改变多个css属性的transition效果时,只需要把几个transition效果放在一起,用`,`隔开,然后设置各自不同的延续时间和其事件的速率变化方式.值得注意的是,第一个时间值为`transition-duration`,第二个值为`transition-delay`

例如以下代码:

	a{
		transition:background 0,8s ease-in 0.3s , color 0.6s ease-out 0.3s
	}

