---
title: 使用uni进行APP和H5的混合开发
date: 2020-07-12 17:16:26
tags: [js,hexo]
---

<meta name="referrer" content="no-referrer"/>

## 使用Uni进行App和H5的混合开发

Uni的开发上手难度极低，基本和开发小程序没有太大区别、

<!-- more -->

> 当已有H5的功能页面时，可能会有复用H5页面的需求。即：点击App内的路由会直接跳转到浏览器的H5页面，然后在H5进行操作之后，再跳转回App

### 代码实现

1. App的前置工作

   UniApp中也提供了一个web-view容器，用来打开外部的页面

   形如下：

   ```js
   <template>
     <view>
       <web-view :webview-styles="webviewStyles" :src="src"></web-view>
     </view>
   </template>
   ```

   src即是需要跳转到的H5的页面路径。路径上可以通过拼接的方式携带对应的参数，Uni本身也提供了一种post Message的方式来传递参数

2. H5的前置工作和引用

   1. 首页引入Uni的js桥

      在public的文件夹下的index.html中，引入Uni的SDK，形如

      ```js
      <script src="<%= BASE_URL %>js/uni.js" rel="prefetch"></script>
      <!-- <script type="text/javascript" src="https://js.cdn.aliyun.dcloud.net.cn/dev/uni-app/uni.webview.1.5.1.js"></script> -->
      ```

      可以下载下来或者直接引用网络地址（不同的版本的SDK可能会有不同的bug和效果，要关注官网最新的SDK）

   2. 在对应页面进行桥事件的监听，并调用Uni的方法

      SDK提供了一个事件UniAppJSBridgeReady，可以监听桥是否完成，完成后，可以直接调用给定的uni的方法

      ```js
      document.addEventListener("UniAppJSBridgeReady", () => {
              document.querySelector(".goback").addEventListener("click", (evt) => {
                uni.navigateBack({
                  delta: 1,
                });
              });
      });
      ```

      如上述代码，当桥完成后，进行了一个绑定的操作，当点击H5中的按钮，可以直接调用uni.navigateBack，回到app

   3. 通过调用uni的路由方法，跳回App中

      在H5中，也可以直接调用Uni的路由，如下：

      ```js
      uni.navigateTo({
                url: "/pages/couponManager/couponManager",
      });
      ```


### 实际开发遇到的问题

1. UniAppJSBridgeReady方法不生效

   首先要检查UniAppJSBridgeReady的监听事件是否书写正确，然后检查sdk版本。有的版本的sdk是有bug的，会在打包后，部署到测试环境失效。一般需要使用官网的最新sdk

2. 绑定事件阻塞

   本次开发的H5页面会有较大的图片加载过程，会遇到绑定点击返回事件后，点击失效的情况，即浏览器正在加载js和下载图片，无法处理绑定的click事件，需要等图片下载完成后，再执行click事件。这里我直接通过图片初始化地址为空，然后在mounted周期给图片赋值地址来临时解决

3. 请求头

   后端有判断不同请求头走对应的接口的逻辑，所以，可以在跳转的链接中拼接hearderInfo来替换H5中的请求头，如：

   ```js
   config.headers = {
             terminalcode: headerTem.terminalcode,
             terminaltype: headerTem.terminaltype,
             devicetype: headerTem.devicetype
   };
   ```

   当从app跳转到h5时，devicetype为：APP，当用户直接用小程序或者H5访问时，devicetype为：WECHAT

4. 埋点

   需要实现编辑、修改、保存等埋点。这里的问题是，当从app跳入h5后，做一系列的操作，再返回到app这个过程中，需要在离开h5的时候发送埋点请求。而vue中通常使用的周期如：beforeDestroy无法在上述情况下触发。需要采用新的判断方法：visibilitychange

   ```js
   document.addEventListener("visibilitychange", this.compareChange);
   ```

   visibilitychange可以判断的是：当前浏览器是否被隐藏或者显示。

   当从h5跳回app时，不是销毁或者离开页面，而是直接销毁或者隐藏整个webView的浏览器，所以只会触发visibilitychange事件。

5. 待续



