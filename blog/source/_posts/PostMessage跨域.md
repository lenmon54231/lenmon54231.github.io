---
title: PostMessage跨域
date: 2020-07-12 17:16:26
tags: [PostMessage,跨域]
---

<meta name="referrer" content="no-referrer"/>

## PostMessage跨域

***\*window.postMessage()\**** 方法可以安全地实现跨源通信。通常，对于两个不同页面的脚本，只有当执行它们的页面位于具有相同的协议（通常为https），端口号（443为https的默认值），以及主机 (两个页面的模数 [`Document.domain`](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/domain)设置为相同的值) 时，这两个脚本才能相互通信。***\*window.postMessage()\**** 方法提供了一种受控机制来规避此限制，只要正确的使用，这种方法就很安全。

<!-- more -->

### 需求

多个后台，同一个账号密码系统，需要在某一个后台登录后，直接点击切换，到另一个后台，并且免登录

### 实现

不同的后台有不同的地址，解决接口的跨域问题。

通过H5提供的新方法postMessage来传递数据.

```js
         let popup = window.open("http://localhost:8081", "_blank");
          if (popup) {
            setTimeout(function() {
              let data = sessionStorage;
              popup.postMessage(JSON.stringify(data), "http://localhost:8081");
            }, 500);
          }
```



```js
 created() {
    //测试环境监听
    window.addEventListener("message", this.receiveMessage, false);
  },
  methods: {
    receiveMessage(event) {
      if (event && event.origin && event.data) {
        // 我们能信任信息来源吗？
        if (
          event.origin !== "http://localhost:8080" ||
          event.origin !== "http://localhost:8082"
        )
          return;
        let tem = JSON.parse(event.data);
        if (tem.token) {
          sessionStorage.setItem("resources", tem.resources);
          sessionStorage.setItem("token", tem.token);
          sessionStorage.setItem("adminUserInfo", tem.adminUserInfo);
          if (process.env.VUE_APP_DEBUG == "debug") {
            window.location.href =
              "http://localhost:8081";
          } 
        }
      }
    }
  }
```

### 核心

发送消息的页面: 

1. 打开页面的同时，如果直接进行发送信息。会导致新打开的页面接收不到数据。所以给一个500ms延迟
2. popup.postMessage，需要定义一个发送地址，并且指定接收地址

接收页面：

1. 需要初始化时，监听一个事件。
2. 判断发送信息的来源，保证信息的安全性。

