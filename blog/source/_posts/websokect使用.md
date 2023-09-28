---
title: websokect使用
date: 2020-07-12 17:16:26
tags: [js, hexo]
---

<meta name="referrer" content="no-referrer"/>

## WebSocket 初体验

WebSocket 是 HTML5 出的东西（协议），也就是说 HTTP 协议没有变化，或者说没关系，但 HTTP 是不支持持久连接的（长连接，循环连接的不算）首先 HTTP 有 1.1 和 1.0 之说，也就是所谓的 keep-alive，把多个 HTTP 请求合并为一个，但是 Websocket 其实是一个新协议，跟 HTTP 协议基本没有关系，只是为了兼容现有浏览器的握手规范而已，

### 需求

提供一个图片下载至服务器进度的功能，需要实时获取服务器下载图片的张数。实现方法如下：

1.直接采用轮询的方法，每隔一段时间请求图片下载数据

2.采用长连接，建立起 ws 链接后，可以直接接受到服务器发来的数据，知道有一方主动断开链接

### VUE 中使用 ws

```js
 createWS() {
      let token = sessionStorage.getItem('token')
        ? sessionStorage.getItem('token')
        : false
      if (token) {
        //判断当前浏览器是否支持WebSocket, 主要此处要更换为自己的地址
        if ('WebSocket' in window) {
          let websocket = new WebSocket(
            `ws://192.168.1.126:9527/api/litchi/${token}`
          )
          websocket.onopen = () => {
            console.log('Connection open ...')
            sessionStorage.setItem('isWSConnectioning', true)
          }
          websocket.addEventListener('close', (event) => {
            console.log(event, '关闭的回调')
          })
          websocket.addEventListener('error', (event) => {
            console.log(event, '失败的回调')
          })
          //接收到消息的回调方法
          websocket.addEventListener('message', (event) => {
            if (event.data) {
            }
          })
          websocket.onmessage = (event) => {}
        } else {
          alert('Not support websocket')
        }
      }
    },
```

使用 Tips：使用步骤非常简单。1.new WebSocket 的对象，2.调用对象上的方法，如：open、close、message。3.在对应的事件中进行数据的操作，比如改变页面的进度条和数据。

### 业务难点

实现 ws 不复杂，但是需求中有额外的要求：当用户切换到其他的页面后，再跳转回 ws 的进度条页面后，也需要进度的实时更新。

这里问题则是：1、当跳转到其他页面后，如何保持 ws 的长连接，2、如何保存当前图片下载进度，3、如何每次进入页面都能够实时更新图片的进度

解决方案：

1、因为 vue 是单页面应用，页面跳转本质是页面的路由更换而已。所有，ws 一旦建立了，不会随着页面的跳转而关闭

2、公共变量的保存一般是 1、VueX 的 store，2、SessionStorage 的浏览器缓存

3、实时的监听 1、store 的监听可以通过 watch 实现（未实际考察），2、SessionStorage 的监听可以通过‘storage’的事件监听

### 实现方案

采用 SessionStorage 的方案，监听浏览器缓存事件

```js
this.resetSetItem(
  "downCheckedImageListSuccess",
  JSON.stringify(this.downCheckedImageListSuccess)
);
```

上面写了一个自定义的事件 resetSetItem，这个事件是用来保存数据入浏览器缓存的。

为什么不用浏览器的 SessionStorage.setItem 和 window.addEventListener('storage')事件呢？

实际使用中发现，当页面跳转后再回到下载进度页面后，监听有失效的情况。没有触发页面的数据更新。（当然有可能是我自己没有搞懂）。总之，查询了搜索引擎后采用了另外一种方案:

1.main.js 中 vue 原型上添加自定义事件

```js
// 添加全局事件监控方法
Vue.prototype.resetSetItem = function (key, newVal) {
  //   if (key === 'downCheckedImageListSuccess') {
  // 创建一个StorageEvent事件
  var newStorageEvent = document.createEvent("StorageEvent");
  const storage = {
    setItem: function (k, val) {
      sessionStorage.setItem(k, val);
      // 初始化创建的事件
      newStorageEvent.initStorageEvent(
        "setItem",
        false,
        false,
        k,
        null,
        val,
        null,
        null
      );
      // 派发对象
      window.dispatchEvent(newStorageEvent);
    },
  };
  return storage.setItem(key, newVal);
  //   }
};
```

2.页面初始化时，添加监听事件

```js
window.addEventListener('setItem', () => {
 this.setNum()
  } else {
 }
})
```

当页面中有调用 resetSetItem 方法时，会触发 setItem 事件中的函数，从而触发页面的数据的更新。
