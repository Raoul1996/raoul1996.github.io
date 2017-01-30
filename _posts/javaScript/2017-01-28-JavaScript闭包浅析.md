---
layout: post
title: JS闭包浅析
category: JavaScript
keywords: JavaScript闭包 

---

*我只是一个前端的初学者，所以我的理解方式可能不会很对，但是我想把我的理解方式记录下来，或许能给你一些启发和触动也说不定不是。。。不管正面还是负面。另外，如果我的想法错了，麻烦告诉我一声呗，谢谢看官们啦。还有，闭包这个东西，还是需要一点点JS的基础的。。。*

## 前辈们怎么看闭包？

- 今天在掘金上看了这篇文章：[JavaScript 闭包入门（译文）](https://gold.xitu.io/post/58832fe72f301e00697b672d)这篇文章中认为：

	> 在Javascript中，如果你在另一个函数中使用了function关键字，那么你就创建了一个闭包。

- 以前也断断续续的看了一些关于闭包的文章，其中老姚的文章给了我不少启示，在[最后一次说说闭包](http://www.qdfuns.com/notes/17398/9b28ba7e036240b1252f1c82b9883d94:storey-3)一文中，他认为：

	1. 调用的函数是父级作用域内部声明的
	2. 调用的函数是在父级作用域之外进行调用
	3. 调用的函数内部使用了父级作用域的内部变量

- 阮一峰老师在[学习Javascript闭包（Closure）](http://www.ruanyifeng.com/blog/2009/08/learning_javascript_closures.html)一文中，则这么认为闭包：

	> 由于在Javascript语言中，只有函数内部的子函数才能读取局部变量，因此可以把闭包简单理解成"定义在一个函数内部的函数"。

## 闭包何用？
	
1. 可以在JavaScript中实现公有，私有，特权变量。这就意味着你可以创造一些外部不可见的变量，比较安全。

2. 面试的时候会问，别的就暂时不是十分了解了。

## 什么是闭包(实例)?

**是时候，放出这个大杀器了。**

看我代码！！！！！！！

	function buildList(list) {
    var result = [];
    for (var i = 0; i < list.length; i++) {
        var item = 'item' + i;
        result.push( function() {console.log(item + ' ' + list[i])} );
    }
    return result;
	}
	function testList() {
    var fnlist = buildList([1,2,3]);
    // 使用j是为了防止搞混---可以使用i
    for (var j = 0; j < fnlist.length; j++) {
        fnlist[j]();
    }
	}
 	testList() //输出 "item2 undefined" 3 次

没错的，输出三次`item2 undefined`.
(部分前辈认为上面的例子不属于闭包，这个是变量作用域的问题。不过按闭包的方式进行分析，也没什么错吧。。)
### WHY？
	
这就是一个闭包的真实例子。在JS中，函数是具有自身的作用域。（虽然在ES2015中，JS引入了块级作用域，暂且按下不表）。JS的作用域链原理和原型链的作用原理很相似，如果这个变量在自己的作用域里边没有，就会去父级作用域找，直至顶层，在浏览器中，也就是全局。

**这一点听不懂没关系，我们换个方式：**

比如你家里有一个小女儿（儿子也成），也就不到10岁。他打了别的小朋友，打的挺严重，然后事情他自己处理不了了（自己的作用域中没有这个变量）。他必须要找爸爸妈妈去学校解决问题。恰好，爸爸妈妈暂时不在家，所以就找爷爷去学校了。

这样找是没有问题的，但是如果反过来，你们自己的事情，去找一个小孩子去解决应该是不成的。（排除爷爷奶奶去医院需要小孩的父母亲去挂号交钱之类的情况）。

这样，了解了吗，这就是JS的函数作用域链作用方式的一个比喻。


## 什么样的人，可以搞明白闭包？

看得懂这段代码：

	function sayHello(name) {
  	var text = 'Hello ' + name;
  	var say = function() { console.log(text); }
  	say();
	}
	sayHello('Joe');

我觉得就差不多。

## 开始叨叨闭包

闭包的概念并不是JS特有的，但是JS的闭包比较特殊一点罢了。

	function sayHello2(name) {
  	var text = 'Hello ' + name;
 	var say = function() { console.log(text); }
  	return say;
	}
	var say2 = sayHello2('Bob');
	say2(); // 打印日志： "Hello Bob"

这是一个比较简单的闭包的一个案例。

在C语言等大多数程序语言中，当一个函数返回以后，函数内声明的变量就被销毁了。但是**在JS中，如果你在一个函数a中，声明了一个函数b.那么你调用函数a返回后的局部变量`text`仍然是可以访问的，但是这个`text`变量对全局来说不可见，因为它是sayHello2()中声明的局部变量。**

好了，知道闭包是个什么东西了，那么我就说一下我是怎么理解闭包的。

## 换个角度理解闭包

一个函数可以有多个实例，**但是闭包现象只会发生在同一个实例上**

![](http://i.imgur.com/7iyxdYq.png)

在这个函数中，say2和say3都引用了函数sayHello2(),但是他们的作用域链是两条，互不相干。

那么，如果我们从**在变量被调用的时候，浏览器沿作用域链向上查找，如果查找到了，就立即使用**的角度去理解闭包，是一个什么情况呢？

在上上个例子中，执行到sayHello2('Bob')的时候，text的内容从*"Bob"*变到了*"Hello Bob"*。**然后say2()执行的时候，sayHello2()函数返回了function() { console.log(text); }，然后浏览器沿作用域链向上查找text变量，同时上文有提到了，在上次执行后，浏览器不会销毁局部变量text，而是保留。所以浏览器可以查询到text变量的值为***"Hello Bob"*。**既然查到了text的值，那么就可以很愉快的使用console.log()方法了啊~~~~

## 更多的实例

	var gLogNumber, gIncreaseNumber, gSetNumber;
	function setupSomeGlobals() {
  	// 局部变量num最后会保存在闭包中
  	var num = 42;
  	// 将一些对于函数的引用存储为全局变量
  	gLogNumber = function() { console.log(num); }
  	gIncreaseNumber = function() { num++; }
  	gSetNumber = function(x) { num = x; }
	}
	setupSomeGlobals();
	gIncreaseNumber();
	gLogNumber(); // 43
	gSetNumber(5);
	gLogNumber(); // 5
	var oldLog = gLogNumber;
	setupSomeGlobals();
	gLogNumber(); // 42
	oldLog() // 5

这个是这个例子在chrome中的运行截图

![](http://i.imgur.com/RI3GPEJ.png)

分析一下这个例子。

先定义一个全局函数`setupSomeGlobals()`,内部包含一个局部变量`num`,并初始为42,然后在这个全局函数中定义了3个方法`gLogNumber()`和`gIncreaseNumber()`以及`gSetNumber(x)`.在`setupSomeGlobals()`的作用域**外**调用上述的三个方法`gLogNumber()`和`gIncreaseNumber()`以及`gSetNumber(x)`.即可形成闭包.

在外部调用一次`setupSomeGlobals()`方法后,调用`gIncreaseNumber()`,但是在他自己的作用域中,不能找到变量`num`,所以浏览器便会去它的父级作用域,也就是`setupSomeGlobals()`的作用域中查找变量`num`以及它的值.成功找到后,将`num`自增1.此时,`num`的值为**43**

然后调用`gLogNumber()`方法,将43输出,使用`gSetNumber(x)`方法将`num`变为5.此时`num`的值为**5**

**然后,定义一个oldLog变量,初始值为gLogNumber.**此时,`num`的值还为**5**.

在上文已经提过,闭包只会发生在同一条作用域链上,再次运行`setupSomeGlobals()`方法后,所有变化和本轮就没有关系了,所以不用进行考虑.

代码可以进行一下简化:
	
	var oldLog = gLogNumber;
	oldLog() // 5

如果构成闭包,那么局部变量`num`在函数返回以后不会被销毁,而是被保留.执行`oldLog()`方法的时候,将会打印出`num`的值.当自己的作用域中没有这个变量的话,便会去父级作用域进行查找.此时num的值为5,进行输出.

当执行`console.log(num);`的时候，会返回undefined，num在外部是不可访问的一个变量。

## 闭包的局限

闭包的缺点就是常驻内存，会增大内存使用量，使用不当很容易造成内存泄露。

## 最后的叨叨

这篇文章也是我第一次去写关于js比较深入的东西的文章，如果有错误谢谢您的指正。




