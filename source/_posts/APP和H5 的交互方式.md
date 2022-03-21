---
title: 原生 APP 和 H5 的交互桥
date: 2022-03-02 17:16:26
tags: [APP, H5]
---

<meta name="referrer" content="no-referrer"/>

## 原生 APP 和 H5 的交互桥

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
