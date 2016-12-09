---
layout: post
title: css3-transform属性理解
category: css那些事儿
keywords: css3 animate 
---



### css3中的transform（变换）有4个属性方法： ###

>**rotate():旋转一定角度**

	-webkit-transform:rotate(deg);
	-moz-transform:rotate(deg);
	transform:rotate(deg);
>**skew():斜拉(扭曲)一定角度**

	-webkit-transform:skew(x,y);
	-moz-transform:skew(x,y);
	transform:skew(x,y);
>**scale():缩放一定倍率**

	-webkit-transform:scale(time);
	-moz-transform:scale(time);
	transform:scale(time);
>**translate():位移(偏移)一定距离(px,percent......)**

	-webkit-transform:translate(x,y);
	-moz-transform:translate(x,y);
	transform:translate(x,y);
### css3中还有一个transform的属性方法:matrix(矩阵),并且以上四个属性操作都可以使用matrix()来实现，或者说，以上四个属性操作的实现都基于matrix()方法. ###

另外transform:matrix()进行是元素的2D平面移动变换,操作的是三阶方阵(3\*3矩阵).此外,还有matrix3d()进行3D立体移动变换,操作的就是四阶方阵(4\*4矩阵）

transform:matrix(a,b,c,d,e,f)代表了一个这样的样的三阶方阵

![](http://i.imgur.com/0NHJOSm.png)


注意，书写方向是竖着的，和线性代数同济第六版的书写方法一致。

先看看转换公式:

![](http://i.imgur.com/Tsk7OWz.png)

(A矩阵的第n行元素对应乘以B矩阵的第n列元素的和就是结果中的(n,n)元素)：

其中，x,y表示转换元素的所有坐标,ax+cy+e就是变换后的水平坐标,bx+dy+f就是变换后的垂直坐标.

>**translate()如何实现：**

示例:

	transform:matrix(1,0,0,1,30,30)
假设这个矩阵的偏移元素中心点为(0,0),即x=0,y=0.

按照上述公式,我们可以计算偏移后,中心点的横坐标和纵坐标的值:

	X=ax+cy+e=1*0+0*0+30=30
	Y=bx+dy+f=0*0+1*0+30=30
变换后,中心点的坐标变为(30,30)

其他点的坐标变为(x+e,y+f)

总结:

**translate()的实现在于改变matrix(1,0,0,1,e,f)的e和f值.**

>**scale()如何实现**


代码:

	transform:matrix(1,0,0,1,30,30)
请注意代码中有两个1,让我们改变一下,并取消偏移并计算出变换后点(x,y)的坐标:

	transform:matrix(s,0,0,s,0,0)
变换后坐标

	X=ax+cy+e=s*x+0*y+0=sx
	Y=bx+dy+f=0*x+s*y+0=sy
注意到,经过以上变换,变换元素的点(x,y)->(sx,sy),反映到元素图形上,就是元素的长和宽都变为原来的s倍

总结:

**scale()的实现在于改变matrix(a,b,c,d,e,f)的a和d值**

>**rotate():旋转的如何实现**

国际惯例,代码一段

	transform:matrix(cosθ,sinθ,-sinθ,cosθ,0,0)
变换后坐标

	X=ax+cy+e=xcosθ-ysinθ
	Y=bx+dy+f=xsinθ+ycosθ

![](http://i.imgur.com/AKxCorj.png)

一张图儿，搞定

>**skew():拉伸（斜拉）如何实现**

最后一次代码：

	transform:matrix(1,tan(θy),tan(θx),1,0,0)
对应

	transform:skew(θx+"deg",θy+"deg)
计算变换后坐标：

	X=x+ytanθx
	Y=y+xtanθy
其中θx为x轴倾斜角度（变换后图形与y轴夹角),θy为y轴倾斜角度(变换后图形与x轴夹角)

这里没图了，因为我把cad卸载了，原因是不会用。。

基于transform:matrix()还可以做出更多的变形，能力有限，暂时不继续进行，matrix 3d的变换是4阶方阵，以后有时间再研究。

虽然大一上半年学过矩阵的运算，但是现在也忘得差不多了，这才半年啊。。心痛


补充一点，今天抽时间算了一下镜像对称，过程如下。

镜像变换实现方法：

镜像变换没有被预先封装到transform的属性方法中，但是我们可以通过matrix()方法做到.

还是先给出结果,稍后给出证明:

	transform:matrix(a,b,c,d,e,f)

	a=(1-k*k)/(1+k*k)
	b=2k/(1+k*k)
	c=2k/(1+k*k)
	d=(k*k-1)/(1+k*k)
记忆规则：

	a+d=0
	b=c
证明思路：

选择合适的坐标系，设置对称轴为y=kx，求点(x,y)关于y=kx的对称点,然后根据上面的公式:X=ax+cy+eY=bx+dy+f,找出变换矩阵的结构.

证明过程:勾起了我对高中数学恐怖的回忆,由于手头木有合适的绘图工具,所以就不配图了

变换前,设点的坐标为(x,y),变换后为(X,Y),则y=kx为以(x,y)为起点,(X,Y)为终点的线段的中垂线(垂直平分线)

中垂线(垂直平分线)有这样的性质:垂直平分(或许你想说,这不是废话么.......别看不起这玩意,咱就是用这玩意解题啊)

线段的中点在中垂线上:

	k(x+X)/2=(y+Y)/2    -------①
因为线段的中点在中垂线上,所以中点符合y=kx,代入

中垂线垂直于线段:

	(Y-y,X-x)•(kx-0,x-0)=0  =>  k(Y-y)=X-x       ------②
线段的方向向量和中垂线的方向向量垂直,所以点积为0,如果不明白向量的话,(Y-y)/(X-x)=-1/k也可以,上面的方法更具有普适性.

**联立方程①和②,解出X和Y的值,根据上面的公式:X=ax+cy+e Y=bx+dy+f,即可解出上面的结果.**

参考的博客和文档：

[理解CSS3 transform中的Matrix(矩阵)](http://www.zhangxinxu.com/wordpress/2012/06/css3-transform-matrix-%E7%9F%A9%E9%98%B5/)

[矩阵的平移，缩放和旋转](http://www.voidcn.com/blog/qq792326645/article/p-4602071.html)

[mdn开发者文档](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform)