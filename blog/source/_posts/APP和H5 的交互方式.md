---
title: 原生 APP 和 H5 的交互桥
date: 2023-04-22 17:16:26
tags: [APP, H5]
---

<meta name="referrer" content="no-referrer"/>

## 原生 APP 和 H5 的交互桥

### 使用场景

主流 APP 应用基本都采用 APP+H5 的模式，比如支付宝 APP 中的蚂蚁森林、基金的部分页面都是采用的 H5 页面。这里需要考虑 APP 和 H5 之间的通信，即：APP 和 H5 的交互桥

<!-- more -->

现在接触的交互桥有两种，1、通过 UniApp 开发的 APP 与 H5 交互，2、原生 APP 与 H5 的交互，以下主要是：原生 APP 和 H5 的通信

### 代码实现

```js
import browserType from "/@/utils/browserType";

const setupWVJBridge = (callback): void => {
  console.log(browserType, "browserType");
  if (browserType.system === "android") {
    if (window.WebViewJavascriptBridge) {
      return callback(window.WebViewJavascriptBridge);
    } else {
      document.addEventListener(
        "WebViewJavascriptBridgeReady",
        () => callback(window.WebViewJavascriptBridge),
        false
      );
    }
  } // android

  if (browserType.system === "ios") {
    if (window.WebViewJavascriptBridge)
      return callback(window.WebViewJavascriptBridge);
    if (window.WVJBCallbacks) return window.WVJBCallbacks.push(callback);
    window.WVJBCallbacks = [callback];
    const WVJBIframe = document.createElement("iframe");
    WVJBIframe.style.display = "none";
    WVJBIframe.src = "https://__bridge_loaded__";
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(() => {
      document.documentElement.removeChild(WVJBIframe);
    }, 0);
  } // ios
};

const getBridge = () => {
  return new Promise((resolve, reject) => {
    setupWVJBridge((bridge) => {
      if (!bridge) {
        return reject(new Error("无法获取bridge"));
      }
      resolve(bridge);
    });
  });
};

export default getBridge;
```

### 判断系统

```js
interface browserTypeResult {
  system: string; // 系统
  systemVs: string; // 系统版本
  platform: string; // 平台
  supporter: string; // 内核
  supporterVs: string; // 内核版本
  engine: string; // 载体
  engineVs: string; // 载体版本
  shell?: string; // 外壳
  shellVs?: string; // 外壳版本
}

const browserType = (): browserTypeResult => {
  const ua = navigator.userAgent.toLowerCase();
  const testUa = (regexp: RegExp) => regexp.test(ua);
  const testVs = (regexp: RegExp) =>
    (ua.match(regexp) + "").replace(/[^0-9|_.]/gi, "").replace(/_/gi, ".");

  // 系统
  let system = "unknown";
  if (testUa(/windows|win32|win64|wow32|wow64/gi)) {
    system = "windows"; // window系统
  } else if (testUa(/macintosh|macintel/gi)) {
    system = "osx"; // osx系统
  } else if (testUa(/x11/gi)) {
    system = "linux"; // linux系统
  } else if (testUa(/android|adr/gi)) {
    system = "android"; // android系统
  } else if (testUa(/ios|iphone|ipad|ipod|iwatch/gi)) {
    system = "ios"; // ios系统
  }

  // 系统版本
  let systemVs = "unknown";
  if (system === "windows") {
    if (testUa(/windows nt 5.0|windows 2000/gi)) {
      systemVs = "2000";
    } else if (testUa(/windows nt 5.1|windows xp/gi)) {
      systemVs = "xp";
    } else if (testUa(/windows nt 5.2|windows 2003/gi)) {
      systemVs = "2003";
    } else if (testUa(/windows nt 6.0|windows vista/gi)) {
      systemVs = "vista";
    } else if (testUa(/windows nt 6.1|windows 7/gi)) {
      systemVs = "7";
    } else if (testUa(/windows nt 6.2|windows 8/gi)) {
      systemVs = "8";
    } else if (testUa(/windows nt 6.3|windows 8.1/gi)) {
      systemVs = "8.1";
    } else if (testUa(/windows nt 10.0|windows 10/gi)) {
      systemVs = "10";
    }
  } else if (system === "osx") {
    systemVs = testVs(/os x [\d._]+/gi);
  } else if (system === "android") {
    systemVs = testVs(/android [\d._]+/gi);
  } else if (system === "ios") {
    systemVs = testVs(/os [\d._]+/gi);
  }

  // 平台
  let platform = "unknow";
  if (system === "windows" || system === "osx" || system === "linux") {
    platform = "desktop"; // 桌面端
  } else if (system === "android" || system === "ios" || testUa(/mobile/gi)) {
    platform = "mobile"; // 移动端
  }

  // 内核和载体
  let engine = "unknow";
  let supporter = "unknow";
  if (testUa(/applewebkit/gi) && testUa(/safari/gi)) {
    engine = "webkit"; // webkit内核
    if (testUa(/edge/gi)) {
      supporter = "edge"; // edge浏览器
    } else if (testUa(/opr/gi)) {
      supporter = "opera"; // opera浏览器
    } else if (testUa(/chrome/gi)) {
      supporter = "chrome"; // chrome浏览器
    } else {
      supporter = "safari"; // safari浏览器
    }
  } else if (testUa(/gecko/gi) && testUa(/firefox/gi)) {
    engine = "gecko"; // gecko内核
    supporter = "firefox"; // firefox浏览器
  } else if (testUa(/presto/gi)) {
    engine = "presto"; // presto内核
    supporter = "opera"; // opera浏览器
  } else if (testUa(/trident|compatible|msie/gi)) {
    engine = "trident"; // trident内核
    supporter = "iexplore"; // iexplore浏览器
  }

  // 内核版本
  let engineVs = "unknow";
  if (engine === "webkit") {
    engineVs = testVs(/applewebkit\/[\d.]+/gi);
  } else if (engine === "gecko") {
    engineVs = testVs(/gecko\/[\d.]+/gi);
  } else if (engine === "presto") {
    engineVs = testVs(/presto\/[\d.]+/gi);
  } else if (engine === "trident") {
    engineVs = testVs(/trident\/[\d.]+/gi);
  }

  // 载体版本
  let supporterVs = "unknow";
  if (supporter === "chrome") {
    supporterVs = testVs(/chrome\/[\d.]+/gi);
  } else if (supporter === "safari") {
    supporterVs = testVs(/version\/[\d.]+/gi);
  } else if (supporter === "firefox") {
    supporterVs = testVs(/firefox\/[\d.]+/gi);
  } else if (supporter === "opera") {
    supporterVs = testVs(/opr\/[\d.]+/gi);
  } else if (supporter === "iexplore") {
    supporterVs = testVs(/(msie [\d.]+)|(rv:[\d.]+)/gi);
  } else if (supporter === "edge") {
    supporterVs = testVs(/edge\/[\d.]+/gi);
  }

  // 外壳和外壳版本
  let shell = "none";
  let shellVs = "unknow";

  if (testUa(/wanxue/gi)) {
    shell = "wanxue"; // 完美大学 app
    shellVs = testVs(/wanxue\/[\d.]+/gi);
  } else if (testUa(/micromessenger/gi)) {
    shell = "wechat"; // 微信浏览器
    shellVs = testVs(/micromessenger\/[\d.]+/gi);
  } else if (testUa(/qqbrowser/gi)) {
    shell = "qq"; // QQ浏览器
    shellVs = testVs(/qqbrowser\/[\d.]+/gi);
  } else if (testUa(/ubrowser/gi)) {
    shell = "uc"; // UC浏览器
    shellVs = testVs(/ubrowser\/[\d.]+/gi);
  } else if (testUa(/2345explorer/gi)) {
    shell = "2345"; // 2345浏览器
    shellVs = testVs(/2345explorer\/[\d.]+/gi);
  } else if (testUa(/metasr/gi)) {
    shell = "sougou"; // 搜狗浏览器
  } else if (testUa(/lbbrowser/gi)) {
    shell = "liebao"; // 猎豹浏览器
  } else if (testUa(/maxthon/gi)) {
    shell = "maxthon"; // 遨游浏览器
    shellVs = testVs(/maxthon\/[\d.]+/gi);
  } else if (testUa(/bidubrowser/gi)) {
    shell = "baidu"; // 百度浏览器
    shellVs = testVs(/bidubrowser [\d.]+/gi);
  }

  return {
    engine, // 系统
    engineVs, // 系统版本
    platform, // 平台
    supporter, // 内核
    supporterVs, // 内核版本
    system, // 载体
    systemVs, // 载体版本
    ...(shell === "none" ? {} : { shell, shellVs }), // shell:外壳 shellVs:外壳版本
  };
};

export default browserType(); // 判断当前运行环境
```

### 调用方式

```js
getBridge().then((bridge: any) => bridge.callHandler("onSwitchOpen"));
```


## 当已有H5的功能页面时，可能会有复用H5页面的需求。即：点击App内的路由会直接跳转到浏览器的H5页面，然后在H5进行操作之后，再跳转回App

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



