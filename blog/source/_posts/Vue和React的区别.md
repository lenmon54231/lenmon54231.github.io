---
title: Vue和React的区别
date: 2022-09-16 17:22:24
tags: [Vue, React]
---

## Vue 和 React 的异同

<!-- more -->

### Vue 为什么没有 shouldComponentUpdate 周期

#### React 为什么需要 shouldComponentUpdate 周期

React 有 shouldComponentUpdate 的原因是因为 React 的 diff 不是 diff 的数据，而是 diff 的 html tag。
所以严格上来说，数据变不变，React 其实是不知道的，必须要玩家手动控制。举一个简单的例子：
你可以一直 setState 同样的数据，如果不设置 shouldComponentUpdate =>false，那这个组件就会一直 render。
然而，实际上，你是不需要 render 他的，因为他的数据没变。

因为 Vue 的响应式系统已经在初次渲染时收集了渲染依赖的数据项，也就是说 Vue 的 diff 是通过劫持数据的形式而不是通过 diff Dom 的形式，直接就能判断哪些部分需要重新 Render。通过自动的方式就能够得到相当不错的性能。不过，在一些场景下，手动控制刷新检查还是能够进一步提升渲染性能的。

> 问：什么场景下会 Vue 的手动劫持会有性能提升？

> 答：比如虚拟滚动？你有一个 60000 个元素的列表，但是每次只需要渲染 20 个（视野范围内渲染了就行）。这时候这个 20 个元素的数组会被 Vue 认为依赖这个 60000 元素的数组，每次渲染的下标变了，Vue 就会收集一遍这 60000 个元素的依赖。这时候就会慢到令人发指。你需要手动 Object.freeze 这个大数组，才能解决这个问题。

> Tips：实际更合理的方式是，更改数据的依赖收集形式。
> 比如，把对 6000 个数据的列表依赖，改成 20 个数据的展示列表依赖和 6000 个数据的普通数组，通过 JS 去执行替换展示列表的数据从而实现列表的渲染。

