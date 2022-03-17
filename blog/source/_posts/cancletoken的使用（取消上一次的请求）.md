---
title: cancletoken的使用（取消上一次的请求）
date: 2020-07-01 17:16:26
tags: [cancletoken,vue]
---

<meta name="referrer" content="no-referrer"/>

## cancletoken的使用（取消上一次的请求）

当上一次请求没有完成时，再次发起请求，需要首先结束上一次请求。然后再发起新的请求

axios有提供cancletoken的方案，记录如下

<!-- more -->

### 需求描述

现在又个tabs切换，第一个tab请求数据较大，需要10秒获取数据，第二个tab需求请求5秒，第三个需要请求1秒。

当点击第一个时，等待1秒后，再切换第二个tab，再等待1秒，切换第三个tab。

> 数据的显示会首先显示第三次请求的数据，然后显示第二次请求的数据，最后显示到页面上渲染出来的时第一次请求到的数据。这个是不正确的，需要显示第三次请求的数据。

![需求图片](https://limengtupian.oss-cn-beijing.aliyuncs.com/canceltoken%E7%9A%84%E4%BD%BF%E7%94%A8%E8%AE%B0%E5%BD%95/cancletoken.png)

### 解决代码

```js
const service = axios.create({
  // process.env.NODE_ENV === 'development' 来判断是否开发环境
  baseURL: process.env.NODE_ENV === 'development' ? '/' : host.host,
  timeout: 60000000
});
let cancel = null;
let url = null;
service.interceptors.request.use(config => {
  // 在 cardCertificateReceive 页面中，存在tab切换发起多次请求需求，需要在本次请求时取消上次请求，故添加取消请求拦截
  if (typeof (cancel) == 'function') {
    if (url == config.url)
      cancel('强制取消了请求')
  }
  url = config.url;
  // 将cancel变成function
  config['cancelToken'] = new axios.CancelToken(function (c) {
    console.log(c, 'c')
    cancel = c
  })
  return config;
}, error => {
  return Promise.reject();
});
service.interceptors.response.use(response => {
  if (response.status === 200) {
    if (response.data.code === 200) {
      //请求成功后，将cancel置为null。以通过下次请求。
      cancel = null;
      url = null;
      return response.data;
    } 
}, error => {
});
```

### 核心

```js
config['cancelToken'] = new axios.CancelToken(function (c) {
    console.log(c, 'c')
    cancel = c
  })
```

new axios.CancelToken，函数内带了一个c这个参数。这个c打印出来是一个function，如下：

```js
cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  }
```

如若直接使用cancletoken还会导致一个结果，就是当页面初始化，需要同时发起多个请求时，会导致有些请求被‘误判’，从而被终止掉，所以又加个一个url，只判断相同的请求的情况下，才执行终止。