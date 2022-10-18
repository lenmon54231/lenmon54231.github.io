---
title: Vue 中为什么要有nextTick?
date: 2022-10-18 15:16:26
tags: [Vue, NextTick]
---

## Vue 中为什么要有 nextTick

<!-- more -->

### Vue 针对渲染的优化

Vue 会针对多次重复数据更新进行优化，如下：

```js
let num = ref(0);
for (let i = 0; i < 100000; i++) {
  num.value = i;
}
```

> 如果 num 是一个响应式变量，理论上每一次变化都会触发 Vue 的渲染。那么，以上代码会触发十万次渲染。
> 实际上，绝大部分情况下，用户需要的第一次 num：0 和最后一次 num：100000 的渲染。

Vue 针对这种情况做了优化：

1. 在一次事件循环中，将不同的变量更新存储下来。而相同的变量更新会把最新的变化保留下来，而之前的变动数据会被丢弃掉。
2. 等到同一事件循环中，所有的数据变动都完成时，再进行 Dom 的渲染更新

这种优化会导致一个问题。如果我们在数据变化后，并且在 Vue 对 Dom 更新之前，想要基于最新的 Dom 去进行某些操作。那么，我们是找不到合适的操作时机的！
举个最典型的例子：

```html
<div vif="isShowParentNode">parentNode</div>
```

```js
let isShowParentNode = ref(false);

let childrenNode = document.createElement("div");
isShowParentNode.value = true;
ParentNode.append(childrenNode);
```

以上的代码，需要在 显示 ParentNode 之后，直接为其添加 childrenNode。
实际上，代码执行时，很有可能是拿不到 ParentNode 而报错。
此时，需要 NextTick

### NextTick 作用

利用 NextTick 可以达到目标

```js
// 修改数据
vm.message = "修改后的值";
// DOM 还没有更新
console.log(vm.$el.textContent); // 原始的值
Vue.nextTick(function () {
  // DOM 更新了
  console.log(vm.$el.textContent); // 修改后的值
});
```

> 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。

### NextTick 原理

从代码上来看

```html
<div vif="isShowParentNode">parentNode</div>
```

```js
let isShowParentNode = ref(false);

let childrenNode = document.createElement("div");
isShowParentNode.value = true;
NextTick(function () {
  ParentNode.append(childrenNode);
});
```

这里的 append 操作像是在 isShowParentNode 改变为 true 之后，就直接调用了。
但是实际上，NextTick 会把 出入的回调函数 放入到任务队列中进行等待，执行的是一个异步操作。

源码位置：/src/core/util/next-tick.js

```js
export function nextTick(cb?: Function, ctx?: Object) {
  let _resolve;
  // cb 回调函数会经统一处理压入 callbacks 数组
  callbacks.push(() => {
    if (cb) {
      // 给 cb 回调函数执行加上了 try-catch 错误处理
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, "nextTick");
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  // 执行异步延迟函数 timerFunc
  if (!pending) {
    pending = true;
    timerFunc();
  }
  // 当 nextTick 没有传入函数参数的时候，返回一个 Promise 化的调用
  if (!cb && typeof Promise !== "undefined") {
    return new Promise((resolve) => {
      _resolve = resolve;
    });
  }
}
```

```js
export let isUsingMicroTask = false;
if (typeof Promise !== "undefined" && isNative(Promise)) {
  //判断1：是否原生支持Promise
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(flushCallbacks);
    if (isIOS) setTimeout(noop);
  };
  isUsingMicroTask = true;
} else if (
  !isIE &&
  typeof MutationObserver !== "undefined" &&
  (isNative(MutationObserver) ||
    MutationObserver.toString() === "[object MutationObserverConstructor]")
) {
  //判断2：是否原生支持MutationObserver
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;
} else if (typeof setImmediate !== "undefined" && isNative(setImmediate)) {
  //判断3：是否原生支持setImmediate
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  //判断4：上面都不行，直接用setTimeout
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}
```

```js
function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}
```

上面代码最主要的就是执行 timerFunc() ，而 timerFunc 就是 setTimeout(flushCallbacks, 0)，flushCallbacks 函数主要就是调用 NextTick 中传入的 Fn。

主要步骤如下：

1. 把回调函数放入 callbacks（即生成了一个由 callback 组成的数组） 等待执行，
2. （利用 setTimeout）将执行函数放到微任务或者宏任务中，
3. 事件循环到了微任务或者宏任务，执行函数依次执行 callbacks 中的回调。

### 事件循环

![事件循环](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNTU4NjUwMi00ZjJkM2Y3MWE5NGE0YTAwLnBuZw?x-oss-process=image/format,png)

