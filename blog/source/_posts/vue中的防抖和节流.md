---

title: vue中的防抖和节流
date: 2020-07-12 17:16:26
tags: [js,hexo]
---

<meta name="referrer" content="no-referrer"/>

## vue中的防抖和节流

### vue中防抖

```js
<script>
const delay = (function () {
 let timer = 0
 return function (callback, ms) {
  clearTimeout(timer)
  timer = setTimeout(callback, ms)
 }
})()
export default {
methods：{
fn() {
   delay(() => {
    //执行部分
   }, 500)
}
}
}
</script>
```

vue中节流

```js
```



