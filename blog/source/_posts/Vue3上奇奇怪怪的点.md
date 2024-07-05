---
title: Vue3上奇奇怪怪的点
date: 2024-07-05 14:26:35
tags: [vue3]
---


## Vue3上奇奇怪怪的点

Vue3新增了组合式api，所以可以实现很多Vue2无法实现的逻辑，同时，也新增了很多新的写法

<!-- more -->

### 通过watch鉴定对象，为什么回调中获取的新值和旧值是相同的？

```js
let searchForm = ref({
  key:''
})
watch(
  () => searchForm.value,
  (newValue, oldValue) => {
    console.log("oldValue: ", oldValue);
    console.log("newValue: ", newValue);
  },
  { deep: true }
);
```

此写法，第二次获取值时，newValue和oldValue会是同样的值

如果需要根据old和new的值来做业务逻辑，有两种写法:

1. 改成监听对象的某个值

```js
let searchForm = ref({
  key:''
})
watch(
  () => searchForm.value.key,
  (newValue, oldValue) => {
    console.log("oldValue: ", oldValue);
    console.log("newValue: ", newValue);
  },
 );
```

2. 改成结构的形式

```js
let searchForm = ref({
  key:''
})
watch(
  () => {
    return {...searchForm.value}
  },
  (newValue, oldValue) => {
    console.log("oldValue: ", oldValue);
    console.log("newValue: ", newValue);
  },
 ),
 {deep:true};
```
