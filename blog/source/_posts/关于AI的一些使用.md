---
title: 关于AI的一些使用
date: 2025-07-08 15:01:00
tags: [AI]
---


## 使用AI编辑器也应该有技巧

AI编辑器可以直接根据用户输入的自然语言进行代码生成，那么，如何组织好提示词或者使用一些技巧来帮助AI更准确的理解并生成代码就变得十分重要，这里需要记录一下对AI工具的一些使用技巧，目前主要使用cursor。

<!-- more -->


### 配置rules

在项目根目录下新建文件夹/.cursor/rules，里面添加如下文件

[css.mdc](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/ai/css.mdc)

[general.mdc](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/ai/general.mdc)

[react.mdc](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/ai/react.mdc)

[tailwind.mdc](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/ai/tailwind.mdc)

[css.mdc](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/ai/css.mdc)

[vue.mdc](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/ai/vue.mdc)

> 当我们配置了rules 后，cursor生成的代码则会按照mdc的规则来生成代码。

> 当然实际上测试过程中也会发生不按照规则生成的情况，这种情况可以让他重新根据规则修改。

### AI有时候会陷入死胡同

当你让AI生成某些特定功能时，AI会反复的生成一些之前的错误代码。此时，你的提示词已经无法再引导AI往正确的方向进行操作。

那么，你可以尝试这么操作：

1. 让AI新生成一个空白页面；
2. 给AI提示词，让他把最核心的功能添加进去（保持最少、最小的代码），让其运行成功，并完成你的需求后；
3. 让AI参考新页面的代码，将正确代码同步到之前的页面中去；

实际上，不止AI这么操作，如果是我们人类遇到了复杂的需求，无法在复杂的代码中直接找出问题来，我们也应该采用这种方式：

> 新起一个页面，然后将核心代码剥离出来，实现我们想要的需求后，再将正确代码移植到老页面中去


### 有代码给AI作参考会是很高效的一种方式

当你能够找到一份已经实现了功能的代码，你只是需要将其移植过来，并进行一些修改时。

这种情况下，将两个项目都放入同一个工作区（同一个文件夹下），用AI编辑器打开，AI编辑器就能够读取两个项目的文件，你可以让AI读取某些已完成的功能并进行移植。

根据实际的测试，发现AI极其擅长干这种事情，比如： 

1. 已经用vue3+tresjs实现了一个自发光的平面mesh，让AI将其改造成 react 组件；
2. 分析之前的模型效果，将其效果应用到新的项目模型中来；


### 待续...
