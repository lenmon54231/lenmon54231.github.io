---
title: ES6中Proxy的代理和反射
date: 2021-04-01 11:44:48
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
  get(target, key, receiver) {
    console.log("劫持你的数据访问" + key);
    return target[key];
  },
  set(target, key, value) {
    console.log(`set ${key}, old value ${target[key]} to ${value}`);
    target[key] = value;
  },
});

proxy.name; // 劫持你的数据访问name -> wang.haoyu
```

当调用 proxy.name 时，会触发 proxy 内置的 get，从而返回 target 的值

Proxy 的第 2 个参数 handler 除了可以设置 get 和 set 方法外，还有更多丰富的方法：

- get(target, propKey, receiver)：拦截对象属性的读取，比如 proxy.foo 和 proxy['foo']。
- set(target, propKey, value, receiver)：拦截对象属性的设置，比如 proxy.foo = v 或 proxy['foo'] = v，返回一 \* 个布尔值。
- has(target, propKey)：拦截 propKey in proxy 的操作，返回一个布尔值。
- deleteProperty(target, propKey)：拦截 delete proxy[propKey]的操作，返回一个布尔值。
- ownKeys(target)：拦截 Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、Object. _ keys(proxy)、for...in 循环，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而 Object.keys()的返回结果 _ 仅包括目标对象自身的可遍历属性。
- getOwnPropertyDescriptor(target, propKey)：拦截 Object.getOwnPropertyDescriptor(proxy, propKey)，返回属 \* 性的描述对象。
- defineProperty(target, propKey, propDesc)：拦截 Object.defineProperty(proxy, propKey, propDesc）、 \* Object.defineProperties(proxy, propDescs)，返回一个布尔值。
- preventExtensions(target)：拦截 Object.preventExtensions(proxy)，返回一个布尔值。
- getPrototypeOf(target)：拦截 Object.getPrototypeOf(proxy)，返回一个对象。
- isExtensible(target)：拦截 Object.isExtensible(proxy)，返回一个布尔值。
- setPrototypeOf(target, proto)：拦截 Object.setPrototypeOf(proxy, proto)，返回一个布尔值。如果目标对象是函 \* 数，那么还有两种额外操作可以拦截。
- apply(target, object, args)：拦截 Proxy 实例作为函数调用的操作，比如 proxy(...args)、proxy.call(object, .. \* .args)、proxy.apply(...)。
- construct(target, args)：拦截 Proxy 实例作为构造函数调用的操作，比如 new proxy(...args)。

### 反射

Proxy 与 Reflect 可以说形影不离了，Reflect 里所有的方法和使用方式与 Proxy 完全一样。

例如上面 Proxy 里的 get(), set()和 deleteProperty()方法我们都是直接操作原代理对象的，这里我们改成使用 Reflect 来操作

```js
const personProxy = new Proxy(person, {
  get(target, key, receiver) {
    console.log(`get value by ${key}`);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log(`set ${key}, old value ${target[key]} to ${value}`);
    return Reflect.set(target, key, value, receiver);
  },
  deleteProperty(target, key, receiver) {
    console.log(`delete key ${key}`);
    return Reflect.deleteProperty(target, key, receiver);
  },
});
```

> 问： target[key] 和 Reflect.get(target, key, receiver) 的效果是一样的。那为什么要多一个 Reflect 反射呢？
> 答：注意到 Proxy 里头的 get 等还有一个“多余的传入参数”：receiver，它和 Reflect.get 的第三个参数是配套的。
> 如果那个你的 Proxy 里头的 target 还是一个 proxy，并且对 receiver 有自己的用途，那么只能用 Reflect.get(target,prop,receiver)，将 receiver 正确地传递进去。也就是保证 this 的指向正确性

### Vue3 的优化

Vue3 可以通过 Proxy 直接劫持数组，从而实现对应数组的监听了。

```js
const arr = [1, 2, 3, 4];
const arrProxy = new Proxy(arr, {
  get(target, key, receiver) {
    console.log("arrProxy.get", target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log("arrProxy.set", target, key, value);
    return Reflect.set(target, key, value, receiver);
  },
  deleteProperty(target, key) {
    console.log("arrProxy.deleteProperty", target, key);
    return Reflect.deleteProperty(target, key);
  },
});

arrProxy[2] = 22; // arrProxy.set (4) [1, 2, 3, 4] 2 22
arrProxy[3]; // arrProxy.get (4) [1, 2, 22, 4] 3
delete arrProxy[2]; // arrProxy.deleteProperty (4) [1, 2, 22, 4] 2
arrProxy.push(5); // push操作比较复杂，这里进行了多个get()和set()操作
arrProxy.length; // arrProxy.get (5) [1, 2, empty, 4, 5] length
```

可以看到无论获取、删除还是修改数据，都可以感知到。还有数组原型链上的一些方法，如：

- push()
- pop()
- shift()
- unshift()
- splice()
- sort()
- reverse()

也都能通过 Proxy 中的代理方法劫持到。

