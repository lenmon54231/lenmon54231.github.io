---
title: Blender的基础入门
date: 2025-05-22 15:59:13
tags: [Blender,模型,3D]
---

## 熟悉Blender建模流程

通过MCP控制Blender建模的前提是：熟悉Blender的建模流程！在此熟悉建模流程的基础上，你才能使用正确的命令提示词让AI帮你去做Blender的命令操作。所以，学习一下Blender是很有必要的事情。

<!-- more -->


### 如何生成白模

布局模式下 》 添加 》 网格 》 立方体，此时会在游标处生成模型（快捷键：shift + A）

![生成白模](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/mesh.png)

游标如图所示

![游标](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E6%B8%B8%E6%A0%87.png)

模型大小配置参数如下：

![模型大小](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E6%A8%A1%E5%9E%8B%E5%A4%A7%E5%B0%8F.png)

### 如何给白模上色（给白模添加材质、纹理贴图）

选中需要上色的白模，并切换到编辑模式（快捷键Tab）

注意：需要在布局模式下，才可以选择和切换到编辑模式

![编辑模式](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E5%88%87%E6%8D%A2%E5%88%B0%E7%BC%96%E8%BE%91%E6%A8%A1%E5%BC%8F.png)


此时，再切换到uv编辑菜单，就能够看到左侧已经有对应的uv了

![uv](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/uv%E7%BC%96%E8%BE%91.png)


将uv图片导出
![导出](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E5%AF%BC%E5%87%BAUV%E5%9B%BE.png)


在PS中或者其他软件中，将uv图添加上对应的颜色
![加上对应的颜色](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/uv%E5%9B%BE%E4%B8%8A%E8%89%B2.png)

回到布局菜单栏，将底部左下角的时间线切换为着色编辑器
![着色编辑器](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E6%96%B0%E5%BB%BA%E6%9D%90%E8%B4%A8.png)

添加材质
![添加材质](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E6%96%B0%E5%BB%BA%E6%9D%90%E8%B4%A8.png)

将刚才填充颜色的uv图片拖拽到blender中来，blender会自动加载成图片纹理
![加载成图片纹理](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E6%8B%96%E6%8B%BD%E7%BA%B9%E7%90%86%E8%B4%B4%E5%9B%BE.png)


将图片纹理的颜色圆点连线到BSDF的基础色原点上去
![连线到BSDF的基础色](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E9%A2%9C%E8%89%B2%E8%BF%9E%E7%BA%BF.png)


右上角切换成材质预览模式，此时，柱状图已经添加了图片纹理，显示出了颜色
![显示出了颜色](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E5%88%87%E6%8D%A2%E6%9D%90%E8%B4%A8%E9%A2%84%E8%A7%88.png)

切换到纹理绘制菜单
![纹理绘制](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E7%BA%B9%E7%90%86%E7%BB%98%E5%88%B6.png)

Blender提供了多种绘制工具，类似笔刷、填充、分割等工具，此时我们试下填充工具
![填充工具](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E9%80%89%E6%8B%A9%E9%A2%9C%E8%89%B2.png)

将其对应位置填充为红色
![填充为红色](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E5%A1%AB%E5%85%85%E9%A2%9C%E8%89%B2.png)

也可以使用数位板等工具绘制
![绘制](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E7%AC%94%E5%88%B7%E7%BB%98%E5%88%B6.png)
### 如何导出正确的模型文件

导出glb模型
![导出glb模型](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E5%AF%BC%E5%87%BAglb.png)


### 要点记录

#### 如何配置纹理贴图和UV的比例

在着色编辑器中，添加映射转化器

![映射转化器](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/uv%E5%92%8C%E8%B4%B4%E5%9B%BE%E6%98%A0%E5%B0%84/%E6%98%A0%E5%B0%84.png)


映射转换器中修改缩放比例

![修改缩放比例](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/uv%E5%92%8C%E8%B4%B4%E5%9B%BE%E6%98%A0%E5%B0%84/%E6%98%A0%E5%B0%84%E6%AF%94%E4%BE%8B.png)


#### 如何导出整个模型和对应的模型纹理贴图

当场景中添加了多个模型，并将所有模型添对应的纹理贴图后，我们发现此时所有的纹理贴图都是单独的、分散的。但实际上，正常情况下，整个模型的纹理贴图都是类似以下这种样式：

![纹理贴图](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/bakedDay.jpg)

那么，这种纹理贴图是如何生成的呢？

步骤如下： 

##### 选择模型（不要将灯光等非mesh元素选择进去）

![选择模型](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E5%A6%82%E4%BD%95%E7%83%98%E7%84%99/%E9%80%89%E6%8B%A9mesh.png)

##### 确认模型已经有UV

![UV](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E5%A6%82%E4%BD%95%E7%83%98%E7%84%99/%E7%A1%AE%E4%BF%9D%E6%A8%A1%E5%9E%8Buv.png)


##### 配置烘焙

**注意： Blender中必须要使用Cycles进行烘焙，否则菜单栏不会出现烘焙按钮**

![烘焙](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E5%A6%82%E4%BD%95%E7%83%98%E7%84%99/%E7%83%98%E7%84%99%E7%B1%BB%E5%9E%8B.png)

配置好之后，点击烘焙，则底部会出现烘焙进度条，鼠标移动上去，可以查看烘焙所需时间，一般需要烘焙几个小时左右


#### 灯光篇

配置真实的灯光

3600k-温暖的灯光

5500k-日光

8000k-阴天灯光


![配置真实的灯光](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender%E5%85%A5%E9%97%A8/%E7%81%AF%E5%85%89%E7%AF%87/%E6%A8%A1%E6%8B%9F%E7%81%AF%E5%85%89.png)
