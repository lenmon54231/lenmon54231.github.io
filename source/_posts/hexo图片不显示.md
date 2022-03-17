---
title: Hexo链接网络图片不显示
date: 2019-12-02 17:16:26
tags: [图片地址,hexo,refer]
---

<meta name="referrer" content="no-referrer"/>

## Hexo图片不显示

### 问题

博客内需要引用一些图片，使用的是阿里云Oss，图片设置的公共读，图片地址从浏览器打开可以直接访问，但是博客内引用不能显示。

**在chrome浏览器中检查会发现有403的错误**

![403](https://limengtupian.oss-cn-beijing.aliyuncs.com/403%E5%9B%BE%E7%89%87.png)

<!-- more -->

### 解决方法

方法其实很简单，只需要文章的头部如下图所示位置添加<meta name="referrer" content="no-referrer"/>这一句话就可以完美解决问题

![referrer](https://img-blog.csdnimg.cn/20190721223929809.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L21xZHhpYW94aWFv,size_16,color_FFFFFF,t_70)

### referrer是什么

`<meta name="referrer" content="no-referrer">`


referrer是用于追踪用户是从哪个页面跳转过来，js中使用document.referrer来得到值，一般用户做移动端back按钮，如用户通过别人发送时候链接进入页面时，可以隐藏back按钮。

referrer有五种属性:

* No Referrer （永远不做记录）

* No Referrer When Downgrade（浏览器默认，当降级时候不记录，从https跳转到http）

* Origin Only（只记录 协议+ host）

* Origin When Cross-origin（仅在发生跨域访问时记录 协议+host）

* Unsafe URL（永远记录）

*参考链接* ：[[Referrer Policy 介绍](https://imququ.com/post/referrer-policy.html)]、[document.referrer的用法详解](http://www.jb51.net/article/117739.htm)

<meta name="referrer" content="no-referrer"/>

## 豆瓣api调用图片403提示

### 豆瓣api

需要搭建一个电影类的分类网站，所以会调用到豆瓣的api，现在官方没有给公共的api使用，于是网上找了下有提供备份的api使用，地址如下：[豆瓣api](https://douban.uieee.com/)

使用这个地址，可以直接访问到豆瓣的内容，但是使用过程中，发现关于电影的名字，类型，上映年份都可以直接访问，只有图片没有办法访问，有提示403错误。

### 原因

豆瓣使用了防盗链：

很多时候别人直接把我们的网站的资源拿去在他们网站展示，但是消费的是我们的流量，为了解决这种问题，才会有防盗链这个思路

这里说的只是一个简单的概念，既使用host和reffer请求头做对比，简单的做一个处理，主要是用来熟悉http头

<!-- more -->

### 解决方法

在页面中加上 <meta name="referrer" content="never">

![fangdao](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E9%98%B2%E7%9B%97%E9%93%BE.png)

实现了正常的访问！