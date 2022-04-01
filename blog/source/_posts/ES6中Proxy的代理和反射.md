---
title: ES6中Proxy的代理和反射
date: 2022-04-01 11:44:48
tags: [ES6]
---

## ES6 中 Proxy 的代理和反射

### Proxy 对象

EcmaScript 2015 中引入了 Proxy 代理 与 Reflect 反射 两个新的内置模块。

我们可以利用 Proxy 和 Reflect 来实现对于对象的代理劫持操作，类似于 Es 5 中 Object.defineProperty()的效果

 <!-- more -->

#### 使用 Proxy

```js
const obj = {
  name: "wang.haoyu",
};

const proxy = new Proxy(obj, {
  // get陷阱中target表示原对象 key表示访问的属性名
  get(target, key) {
    console.log("劫持你的数据访问" + key);
    return target[key];
  },
});

proxy.name; // 劫持你的数据访问name -> wang.haoyu
```

当调用 proxy.name 时，会触发 proxy 内置的 get，从而返回 target 的值

### 代理

### 反射

