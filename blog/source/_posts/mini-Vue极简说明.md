---
title: mini-Vue极简说明
date: 2022-10-25 17:34:23
tags: [vue]
---

<meta name="referrer" content="no-referrer"/>

## mini-Vue 极简说明

省去一切额外开销，几句话讲出 mini-Vue 大概逻辑

<!-- more -->

### 代码示例

```js
import { reactive, effect } from "../vue3.js";

/* 
  场景 1
*/
const obj = reactive({ x: 1 });

effect(() => {
  patch();
});

setTimeout(() => {
  obj.x = 2;
}, 1000);

function patch() {
  document.body.innerText = obj.x;
}
```

当 1S 后执行 obj.x = 2 时，会触发 patch。就说明 obj 是一个响应式对象，改变他的值会触发 effect 内的函数

### 收集和触发依赖（reactive）

reactive 是一个函数，接受复杂对象为参数

```js
reactive(target) {
  return new Proxy(target, {
  get(target,key,receiver){
    const res = Reflect get(target,key,receiver)
    track()
    return res
  },
  set(target,key,receiver){
    const res = Reflect get(target,key,receiver)
    trigger()
    return res
  },
})
}
```

每当 obj.x 执行时，会触发 get，当 obj.x =2 赋值时，会触发 trigger

#### track 函数是收集依赖

```js
function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  if (dep.has(activeEffect)) return;

  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}
```

track 函数就是收集依赖，既然拿到了依赖，就必须要找个对象去存储起来。
targetMap 就是用来存储依赖的对象，是一个 weekMap，形如：

```javascript
{ // 这是一个WeakMap
  [target]: { // key是reactiveObject, value是一个Map
    [key]: [] // key是reactiveObject的键值, value是一个Set
  }
}
const obj = reactive({ x: 1 });
```

以上面的 obj 为例，target 是{ x: 1 }，key 是 x。

> **那么里面 x 对应的[]是什么呢？留到后面的 Effect 函数**

#### trigger 函数是触发依赖

