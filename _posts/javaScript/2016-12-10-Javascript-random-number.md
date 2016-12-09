---
layout: post
title: Javascript取得一个伪随机数
category: JavaScript其实很强大
keywords: 算法 随机数 JavaScript
---


**Math.random()：返回一个介于0.0~1.0之间的[伪随机数](https://zh.wikipedia.org/wiki/%E4%BC%AA%E9%9A%8F%E6%9C%BA%E6%80%A7 "维基百科关于伪随机数的解释")**

	代码略

**Math.floor(x)：对一个数进行下舍入，返回一个小于等于x的整数，相当于数学上的取整函数（高中）**

[http://www.hubwiz.com/class/54f3ba65e564e50cfccbad4b](http://www.hubwiz.com/class/54f3ba65e564e50cfccbad4b "汇智网angularJS进阶课程")

	var repo=[1,2,4,56,7,8,9,56,3,5,6,7,3,3,5];
	var idx =Math.floor(Math.random()*repo.length);
	console.log(repo[idx]);//该用法可以随机选出数组repo中的任何一个元素