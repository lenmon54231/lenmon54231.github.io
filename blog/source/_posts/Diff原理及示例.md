---
title: Diff原理及示例
date: 2022-04-21 15:20:18
tags: [’Diff', "Vue"]
---

## Diff 原理及示例

### b 站讲解

![B站Diff解析](https://www.bilibili.com/video/BV1QL4y1u7Nd?p=1)
![GitHub源码](https://github.com/bubucuo/vdom)

### Vue 中的 Diff 原理介绍

#### 通过 Diff 判断出如何更新 Node

##### 从左往右查找

##### 从右往左查找

##### 新增新节点

##### 删除老节点

##### 新老节点都有，并且是乱序

### Diff 代码示例难点

#### 建立新老节点数组的下标映射关系

#### 获取最大递增序列

### 代码示例

