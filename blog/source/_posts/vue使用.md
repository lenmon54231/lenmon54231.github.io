---
title: Vue使用
date: 2022-09-15 11:35:24
tags: [vue]
---

## Vue使用

<!-- more -->

### Vue常用库

#### toast库

```js
npm install vue-sonner
```

### $refs 的使用

有时候会访问子组件实例或子元素

```js
// 父组件
<base-input ref="usernameInput"></base-input>
```

```js
// 子组件
<input ref="input">
```

那么，我们可以通过 refs 的形式来访问子组件内容

```js
methods: {
  // 用来从父级组件聚焦输入框
  focus: function () {
    this.$refs.input.focus()
  }
}
```

#### 问题点

$refs 只会在组件渲染完成之后生效，并且它们不是响应式的。这仅作为一个用于直接操作子组件的“逃生舱”——**你应该避免在模板或计算属性中访问 $refs**

即：

```js
  computed: {
    players() {
      return this.$refs.playerRef.map((e) => {
        return e.$el;
      });
    },
  },
```

上述写法是不合理的，这种写法会导致不停的查询 ref 和渲染，导致画面抖动

### 自定义指令 loading

#### 引入

```js
import loading from "./loading/index.js";
export default {
  install(Vue) {
    Vue.directive("loading", loading);
  },
};
```

#### 绑定指令文件

```js
import Vue from "vue";
import initPageLoading from "./initPageLoading.vue";
import loading from "./normalLoading.vue";

const initPageLoadingMask = Vue.extend(initPageLoading); // 页面初始化的loading动画（KIVICUBE文字动画）
const loadingMask = Vue.extend(loading); // 数据加载中的页面动画（转圈动画）

const toggleLoading = (el, binding) => {
  if (binding.value) {
    Vue.nextTick(() => {
      el.instance.visible = true;
      insertDom(el, binding);
    });
  } else {
    el.instance.visible = false;
  }
};

const insertDom = (el, binding) => {
  const { fullscreen } = binding?.modifiers;
  if (fullscreen) {
    document.querySelector("#app").appendChild(el.mask);
  } else {
    el.appendChild(el.mask);
  }
};

const createMask = (fullscreen) => {
  if (fullscreen) {
    return new initPageLoadingMask({
      el: document.createElement("div"),
      data() {},
    });
  } else {
    return new loadingMask({
      el: document.createElement("div"),
      data() {},
    });
  }
};

const changeScreenLock = (isLockLoadDom, isLock) => {
  if (!isLockLoadDom) return; // 如果不是带有锁定滚动的loading，直接return
  document.body.style.overflow = isLock ? "hidden" : "";
  if (isLock) {
    document.addEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();
      },
      false
    );
  } else {
    document.removeEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();
      },
      false
    );
  }
};

const changeParentDomPosition = (el, isShow) => {
  el.style.position = isShow ? "relative" : "static";
};

export default {
  // 初始化绑定(el：父元素，binding：参数)
  inserted: function (el, binding) {
    console.log("el: ", el);
    const { fullscreen, lock } = binding?.modifiers;
    let mask = createMask(fullscreen);
    if (!fullscreen) {
      changeParentDomPosition(el, true);
    } else {
      changeScreenLock(lock, true);
    }
    Object.assign(el, {
      instance: mask,
      mask: mask.$el,
    });
    binding.value && toggleLoading(el, binding);
  },
  // 数据更新
  update: function (el, binding) {
    const { fullscreen, lock } = binding?.modifiers;
    if (binding.oldValue !== binding.value) {
      toggleLoading(el, binding);
      if (!fullscreen) {
        changeParentDomPosition(el, false);
      } else {
        changeScreenLock(lock, false);
      }
    }
  },
  // 离开销毁
  unbind: function (el) {
    el.instance && el.instance.$destroy();
  },
};
```

#### loading 样式

1. initPageLoading.vue

   ```vue
   <template>
     <div
       :class="[visible ? 'visibility opacity1' : 'un-visibility opacity0']"
       class="svg-container flex-center z-100"
     >
       <svg width="100%" height="100%">
         <text
           v-for="item in 3"
           :key="item"
           text-anchor="middle"
           x="50%"
           y="50%"
           class="loading-text"
           :class="`loading-text-${item}`"
           dominant-baseline="middle"
         >
           {{ loadingText }}
         </text>
       </svg>
     </div>
   </template>
   ```

   ```js
   <script>
   export default {
   data() {
    return {
      loadingText: "KIVI CUBE",
      visible: false,
    };
   },
   };
   </script>
   ```

   ```css
    <style scoped lang="scss">
    .svg-container {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: white;
      transition: all $el_entering_duration ease-out;
    }

    .loading-text {
      animation: stroke 6s infinite linear;
      fill: none;
      font-size: 48px;
      font-weight: bold;
      letter-spacing: 3px;
      stroke-dasharray: 130 270;
      stroke-width: 2px;
      text-transform: uppercase;
    }

    .loading-text-1 {
      animation-delay: -2s;
      stroke: #15c993;
      text-shadow: 0 0 5px #15c993;
    }

    .loading-text-2 {
      animation-delay: -4s;
      stroke: #04adc0;
      text-shadow: 0 0 5px #04adc0;
    }

    .loading-text-3 {
      animation-delay: -6s;
      stroke: #3ce7d0;
      text-shadow: 0 0 5px #3ce7d0;
    }

    @keyframes stroke {
      100% {
        stroke-dashoffset: -400;
      }
    }
    </style>
   ```

2. normalLoading.vue

   ```vue
   <template>
     <div
       :class="[visible ? 'visibility opacity1' : 'un-visibility opacity0']"
       class="svg-warp-container flex-center z-1"
     >
       <div class="svg-container">
         <svg>
           <circle
             class="loading-inner"
             cx="25"
             cy="25"
             r="20"
             fill="none"
             stroke="#00b2f8"
             stroke-width="3"
             stroke-linecap="round"
           />
         </svg>
       </div>
     </div>
   </template>
   ```

   ```js
    <script>
    export default {
      data() {
        return {
          visible: false,
        };
      },
    };
    </script>
   ```

   ```css
   <style scoped lang="scss">
   .svg-warp-container {
     position: absolute;
     top: 0;
     right: 0;
     bottom: 0;
     left: 0;
     box-sizing: border-box;
     background-color: rgba($color: #fff, $alpha: 0.9);
     transition: all $el_entering_duration ease-out;

     .svg-container {
       width: 50px;
       height: 50px;
     }
   }

   .loading-inner {
     animation: kf-inner 1.5s ease-in-out infinite;
   }

   @keyframes kf-inner {
     0% {
       stroke-dasharray: 1, 125;
       stroke-dashoffset: 0;
     }

     50% {
       stroke-dasharray: 100, 125;
       stroke-dashoffset: -25px;
     }

     100% {
       stroke-dasharray: 100, 125;
       stroke-dashoffset: -125px;
     }
   }
   </style>
   ```

#### main.js 中引用自定义指令

```js
import directive from "@/directive/index";
Vue.use(directive);
```

#### 使用

```html
<div class="pc-bg" v-loading.fullscreen.lock="fullscreenLoading"></div>
<div class="pc-bg" v-loading="loading"></div>
```

### 轮播图

#### 数据

```js
 const ARScenesList = [
        {
          id: 0,
          src: require("@img/pages/home/making-step/s0.jpg"),
        },
        {
          id: 1,
          src: require("@img/pages/home/making-step/s1.jpg"),
        },
        {
          id: 2,
          src: require("@img/pages/home/making-step/s2.jpg"),
        },
        {
          id: 3,
          src: require("@img/pages/home/making-step/s3.jpg"),
        },
        {
          id: 4,
          src: require("@img/pages/home/making-step/s4.jpg"),
        },
        {
          id: 5,
          src: require("@img/pages/home/making-step/s5.jpg"),
        },
        {
          id: 6,
          src: require("@img/pages/home/making-step/s6.jpg"),
        },
        {
          id: 7,
          src: require("@img/pages/home/making-step/s7.jpg"),
        },
        {
          id: 8,
          src: require("@img/pages/home/making-step/s8.jpg"),
        },
      ],
```

#### 改造携带 order

```js
const finalVideo = deepClone(ARScenesList).map((e, index) => {
  Object.assign(e, {
    order: index,
  });
  return e;
});
this.videosWithOrder.push(...finalVideo);
```

#### 渲染数据

```vue
<template>
  <div
    v-for="(video, index) in videosWithOrder"
    :key="index"
    :style="checkVideoStyle(video, index)"
    @click="clickCurrentVideo(video, index)"
  >
    <img
      class="single-carousel-image pointer"
      :src="video.src"
      :alt="$t('components.VideoCarousel.videoPoster')"
    />
  </div>
</template>
```

#### 生成位置样式

```vue
<script>
 computed: {
  checkVideoStyle() {
    return (video, renderIndex) => {
      const positionList = [];
      const videosWithOrderLength = this.videosWithOrder.length - 1;
      const middleNumber = getMiddleNumber(videosWithOrderLength);
      this.videosWithOrder.forEach((e, index) => {
        positionList.push(
          this.generateTransformNumberX(
            index,
            middleNumber,
            video.order,
            renderIndex
          )
        );
      });
       const offsetX = positionList[video.order];
      const offsetY = 0;
      let style = {
        transform: `scale(1) translate3d(${offsetX}%, ${offsetY}, 0)`,
      };
      return style;
    };
  },
},
  methods: {
    generateTransformNumberX(index, middleNumber, order) {
      let transformNumberX = 0;
      if (this.type === "card") {
        // pc端卡片式轮播图
        const singleSpacing = 100 + 13; // 单个间距
        const scaleSpacing = 17; // 缩放导致初始位置靠右,需减去误差
        transformNumberX = index * singleSpacing - scaleSpacing;
        if (index >= middleNumber) {
          transformNumberX += 40;
        }
      }
      return transformNumberX;
    },
     clickCurrentVideo(item, index) {
      if (index !== this.currentPlayingVideoIndex) {
        this.transformDirection = "rightToLeft";
        this.currentPlayingVideoIndex = index;
        this.changeVideoOrderThenPlay(
          item?.order,
          this.currentPlayingVideoIndex
        );
      }
    },
   changeVideoOrderThenPlay(clickOrder, currentPlayingVideoIndex) {
       const middleIndex = getMiddleNumber(this.videosWithOrder?.length - 1)
      const switchStep = middleIndex - clickOrder;
      const totalVideoLength = this.videosWithOrder?.length;
      this.videosWithOrder.forEach((e) => {
        if (
          e.order + switchStep >= 0 &&
          e.order + switchStep <= totalVideoLength - 1
        ) {
          e.order += switchStep;
        } else if (e.order + switchStep < 0) {
          e.order = e.order + totalVideoLength + switchStep;
        } else if (e.order + switchStep > totalVideoLength - 1) {
          e.order = e.order - totalVideoLength + switchStep;
        }
      });
     },
    getMiddleNumber(totalNumber)  {
     if (typeof totalNumber === "number") {
       return Math.ceil(totalNumber / 2);
     }
}
  }
</script>
```

### 样式或者 vue 中写法的记录问题贴

这个里主要是关于样式中的坑和 vue 中一些特定写法的记录，统一放入这个帖子中，方便查询

**vue 中直接在 style 中进行判断**

```html
<el-tag
  :style="'backgroundColor:white;marginLeft:20px;border:none;marginRight:20px;fontSize:14px;color:'+ (isEdit == true ? 'black': 'lightgrey') +''"
  >是否续订:</el-tag
>
```

> 外部用“”，内部还需要用‘’包裹，然后再内部使用拼接的写法，同时判断这个条件，还需要用括号包裹起来，并且，对应的值，也需要用‘’包裹起来。

### **Array.apply(null, { length: 20 }) 和 new Array(20)**

```js
render: function (createElement) {
  return createElement('div',
    Array.apply(null, { length: 20 }).map(function () {
      return createElement('p', 'hi')
    })
  )
}
```

> Array.apply(null, { length: 20 }) 生成的数组形式为[undifiend,undifiend,undifiend,.....],
>
> new Array(20)等价于[，，，，]

后面使用.map 方法的时候，map 方法的限制为：map 函数并不会遍历数组中没有初始化或者被 delete 的元素（有相同限制还有 forEach, reduce 方法）。而 new Array 并没有初始化。所以，需要采用官方的写法。

### ES6 新方法

**使用 reduce 取代 map 和 filter**

```js
let num = [20, 30, 40, 50];
let doubleNum = num.reduce((finalNum, num) => {
  let numTem = num * 2;
  if (numTem > 50) {
    finalNum.push(numTem);
  }
  return finalNum;
}, []);
console.log(doubleNum);
```

**统计数组中相同项的个数**

```js
let name = ["tom", "jerry", "tony", "jack", "tony", "jack"];
let nameAsiys = name.reduce((nameObject, object) => {
  nameObject[object] = nameObject[object] ? ++nameObject[object] : 1;
}, {});
console.log(nameAsiys);
```

**删除不需要的属性**

```js
let { _lee, _meng, ...others } = {
  _lee: "first",
  _meng: "last",
  object1: "111",
  object2: "222",
  object3: "333",
  object4: "444",
};
console.log(others);
```

**在函数参数中解构嵌套对象**

```js
let originObject = {
  name: "lee",
  test: {
    origin: "1",
    fix: "3",
    bug: "555",
  },
};
let {
  name,
  test: { bug },
} = originObject;
console.log(name, bug);
```

**数组对象去重**

```js
let person = [
  { id: 0, name: "小明" },
  { id: 1, name: "小张" },
  { id: 2, name: "小李" },
  { id: 3, name: "小孙" },
  { id: 1, name: "小周" },
  { id: 2, name: "小陈" },
];
let personTem = {};
let finalList = person.reduce((personList, element) => {
  personTem[element.id]
    ? ""
    : (personTem[element.id] = true && personList.push(element));
  return personList;
}, []);
console.log(finalList);
```

### 监听页面离开和返回

[监听页面离开和返回](http://www.ruanyifeng.com/blog/2018/11/page_lifecycle_api.html)

### 可能用到的请求和下载

#### vue 中的 axios 请求

```js
import axios from "axios";
const host = require("./host");
import { Message } from "element-ui";

const service = axios.create({
  baseURL: host.host,
  timeout: 60000000,
});

service.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    config.headers = token
      ? { Authorization: "Bearer " + sessionStorage.getItem("token") }
      : "";

    if (config.ContentType) {
      config.headers["Content-Type"] = config.ContentType;
      delete config.ContentType;
    }
    if (
      //本地环境情况下，需要把login的host写死。避免频繁的切换host
      process.env.VUE_APP_DEBUG === "development" &&
      config.url.split("?")[0] == "/admin/login"
    ) {
      config.baseURL = process.env.VUE_APP_HOST;
    } else {
      //测试环境或者正式环境，需要将所有的host改成环境文件中的host
      switch (config.basicUrl) {
        case "/mall":
          config.baseURL = process.env.VUE_APP_HOST1;
          break;
        default:
          config.baseURL = process.env.VUE_APP_HOST;
          break;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject();
  }
);

service.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      if (response.data.code === 200) {
        return response.data;
      } else {
        Message({
          message: response.data.msg,
          type: "error",
          duration: 2 * 1000,
        });
        return Promise.reject();
      }
    } else {
      return Promise.reject();
    }
  },
  (error) => {
    if (String(error).includes("Network Error")) {
      Message({
        message: "网络出错了,请检查网络",
        type: "error",
        duration: 2 * 1000,
      });
      return Promise.reject(error);
    } else if (error.response.status === 500 || error.response.status === 403) {
      Message({
        message: "登录已失效，请重新登录",
        type: "error",
        duration: 2 * 1000,
      });
      setTimeout(function () {
        sessionStorage.removeItem("resources");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("adminUserInfo");
        window.location.href =
          process.env.NODE_ENV === "development"
            ? window.location.protocol +
              "//" +
              window.location.host +
              "/#/login"
            : window.location.protocol +
              "//" +
              window.location.host +
              process.env.VUE_APP_PUBLIC +
              "#/login";
      }, 2000);
    } else if (
      error.response.data.message === "The service or item was not found."
    ) {
      Message({
        message: "平台升级中...",
        type: "error",
        duration: 2 * 1000,
      });
      return Promise.reject(error);
    } else {
      Message({
        message: error.response.data.message,
        type: "error",
        duration: 2 * 1000,
      });
      return Promise.reject(error);
    }
  }
);

export default service;
```

#### uni 中的请求

```js
import { browser, Phone } from "@/utils/net.js";
const request = async (config) => {
  // ****************APP打包请求url配置****************
  //   @当APP进行打包后，从process.env.NODE_ENV获取得到的总是'production'，需要新加一种手动控制url的字段，by:李蒙

  // let currentEnv = 'development' //打包APP时使用测试地址
  let currentEnv = "production"; //打包APP时使用正式地址
  if (!uni.getStorageSync("currentEnv"))
    uni.setStorageSync("currentEnv", currentEnv);
  // ****************APP打包请求url配置****************

  let baseUrlDev = "http://wx.114family.cn/family-iface-dev"; //默认请求
  let bseUrlPro = "https://wechat.114family.cn/family-iface"; //默认请求
  let WXbaseUrlDev = "http://wx.114family.cn/family-iface-tiny-dev"; //微店请求
  let WXbaseUrlPro = "https://wechat.114family.cn/family-iface-tiny"; //微店请求
  let isDev = currentEnv == "production"; //true为正式环境，false为测试环境

  // 1.对基础url进行逻辑判断
  if (config.isV) {
    //是否是微店请求
    config.url = isDev ? WXbaseUrlPro + config.url : WXbaseUrlDev + config.url;
    if (!uni.getStorageSync("__urlisV__")) {
      uni.setStorageSync("__urlisV__", isDev ? WXbaseUrlPro : WXbaseUrlDev);
    }
  } else if (config.isPay) {
    //是否是支付请求
    config.url =
      "https://share.qingmh.com/wechat-pay-common/wechatpay/hjt/create";
  } else if (config.isPayQuery) {
    // 是否是支付结果查询接口
    config.url =
      "https://share.qingmh.com/wechat-pay-common/wechatpay/order/query";
  } else {
    //默认请求
    config.url = isDev ? bseUrlPro + config.url : baseUrlDev + config.url;
    if (!uni.getStorageSync("url")) {
      uni.setStorageSync("url", isDev ? bseUrlPro : baseUrlDev);
    }
  }
  config.header = {
    region: "",
    terminalcode: "", // 设备号,PC端传浏览器版本号
    terminaltype: "", // 端口类型，例如 APP,XCX,WECHAT,WEB
    stoken: "", // 授权
    devicetype: "", //所属平台,例如 IOS,ANDROID,XCX,WECHAT,WEB(浏览器名称)
  };

  //region :lat	是	string纬度,lng	是	string经度,province	是	string省,city	是	string市,district	否	string区县,
  //street	否	string街道,street_number	否	string街道号
  let platform = uni.getStorageSync("platform"); // 机型
  let stoken = uni.getStorageSync("stoken"); // 获取后台反的token
  let isfirstGetSysInfo = uni.getStorageSync("firstGetSysInfo"); //判断是否已经获取了设备的信息(某些浏览器，无法在第一次打开时获取信息，所以额外的添加了字段)
  // 2.对提供的options进行逻辑判断
  if (config.needToken) {
    //当前请求是否需要token
    if (stoken == "" || stoken == null || stoken == undefined || !stoken) {
      //当请求中没有token时，直接跳到登录页，by：李蒙
      uni.reLaunch({
        url: "/pages/Login/otherLogin",
      });
    } else {
      const region = {
        lat: "30.680905",
        lng: "104.117462",
        province: "四川省",
        city: "成都市",
      };
      // if (uni.getStorageSync('region')) {
      //   let regData = JSON.parse(uni.getStorageSync('region'))
      //   region = { ...region, ...regData }
      // }

      // config.header.region = encodeURIComponent(JSON.stringify(region))
      config.header.stoken = stoken;
    }
  }
  //新增请求头内的devicetype等信息
  if (isfirstGetSysInfo == "done") {
    //获取了手机系统信息
    config.header.terminalcode = uni.getStorageSync("model");
    config.header.terminaltype = "WAP";
    config.header.devicetype = uni.getStorageSync("platform");
  } else {
    //未获取手机系统信息
    let getSystemInfoSync = await uni.getSystemInfoSync();
    uni.setStorageSync("firstGetSysInfo", "done");
    let devicetypeTem = "android";
    let modelTem = "WAP";
    console.log(getSystemInfoSync, "2222222");
    if (getSystemInfoSync && getSystemInfoSync.platform == "other") {
      //当使用wap开发时，有可能获取不到系统信息，改用navigator.userAgent
      let ua = browser();
      let phone = Phone();
      console.log(ua, phone, "获取的浏览器数据");
      config.header.terminalcode = ua.split("/") && ua.split("/")[0];
      config.header.terminaltype = "WAP";
      config.header.devicetype = phone;
    } else {
      devicetypeTem =
        getSystemInfoSync.platform == "devtools"
          ? "ios"
          : getSystemInfoSync.platform;
      modelTem = getSystemInfoSync.model ? getSystemInfoSync.model : "android";
    }
    console.log(modelTem, "1111");
    config.header.terminalcode = modelTem;
    config.header.terminaltype = "WAP";
    config.header.devicetype = devicetypeTem;
    //本地存储，后续可能会用到
    uni.setStorageSync("model", modelTem);
    uni.setStorageSync("platform", devicetypeTem);
    uni.setStorageSync("windowWidth", getSystemInfoSync.windowWidth);
    uni.setStorageSync("windowHeight", getSystemInfoSync.windowHeight);
    uni.setStorageSync("safeAreaH", getSystemInfoSync.safeArea.height);
    uni.setStorageSync("safeAreaT", getSystemInfoSync.safeArea.top);
    uni.setStorageSync("statusBarHeight", getSystemInfoSync.statusBarHeight);
  }
  if (!config.data) {
    config.data = {};
  }
  //存储一下configHeaderInfo,当你跳转到图文海报的h5的时候，需要将header做一个替换
  if (!uni.getStorageSync("configHeaderInfo"))
    uni.setStorageSync("configHeaderInfo", config.header);
  //   console.log(config, '*****请求中携带的参数********')
  // 3.将已经配置好的uni.request作为一个promise返回
  let promise = new Promise((resolve, reject) => {
    uni
      .request(config)
      .then((responses) => {
        console.log(responses, "返回的数据");
        if (responses[0]) {
          //   if (uni.getStorageSync('firstLogin')) {
          //     reject({ message: '网络超时' })
          //   } else {
          uni.clearStorageSync();
          uni.reLaunch({
            url: "/pages/Login/otherLogin",
          });
          //   }
        } else {
          let response = responses[1].data; // 如果返回的结果是data.data的，嫌麻烦可以用这个，return res,这样只返回一个data
          if (
            (response.code === "0016" && response.message === "口令认证失败") ||
            response.code === "00909" ||
            response.message === "网络超时"
          ) {
            uni.clearStorageSync();
            uni.reLaunch({
              url: "/pages/Login/otherLogin",
              fail(e) {
                console.log(e);
              },
            });
            console.log("触发认证失败", response);
          } else {
            resolve(response);
          }
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
  return promise;
};

export default request;
```

#### 下载 oss 地址文件

```js
downLoadFile(e) {
      console.log(e, 'e')
      let str = e.name.split('.')[0]
      //   this.downloadByAxios(e.url, str)
      let urlstr = e.url.replace('http', 'https')
      console.log(urlstr, 'urlstr')
      this.download(urlstr, str)
    },
```

```js
    download(url, filename) {
      /**
       * 下载
       * @param  {String} url 目标文件地址
       * @param  {String} filename 想要保存的文件名称
       */
      this.getBlob(url, (blob) => {
        this.saveAs(blob, filename)
      })
    },
    getBlob(url, cb) {
      /**
       * 获取 blob
       * @param  {String} url 目标文件地址
       * @return {cb}
       */
      var xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'blob'
      xhr.onload = function() {
        if (xhr.status === 200) {
          cb(xhr.response)
        }
      }
      xhr.send()
    },
    saveAs(blob, filename) {
      /**
       * 保存
       * @param  {Blob} blob
       * @param  {String} filename 想要保存的文件名称
       */
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, filename)
      } else {
        var link = document.createElement('a')
        var body = document.querySelector('body')
        link.href = window.URL.createObjectURL(blob)
        link.download = filename
        // fix Firefox
        link.style.display = 'none'
        body.appendChild(link)
        link.click()
        body.removeChild(link)
        window.URL.revokeObjectURL(link.href)
      }
    },
```

#### 下载服务器文件

```js
export function exportInfo(info) {
  return new Promise((resolve, reject) => {
    axios({
      method: info.method,
      url: info.params ? info.url + setUrlParam(info.params) : info.url,
      data: info.params,
      responseType: info.responseType, // 优先尝试 blob
      headers: {
        Authorization: localStorage.getItem("token")
          ? "Bearer " + localStorage.getItem("token")
          : "",
      },
    })
      .then((res) => {
        let objectUrl = null,
          blob = null;
        if (info.type === "excel") {
          blob = new Blob([res.data], {
            type: "application/vnd.ms-excel",
          });
          objectUrl = URL.createObjectURL(blob);
        } else if (info.type === "img") {
          objectUrl =
            "data:image/png;base64," +
            btoa(
              new Uint8Array(res.data).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ""
              )
            );
        } else if (info.type === "zip") {
          blob = new Blob([res.data], { type: "application/zip" });
          objectUrl = URL.createObjectURL(blob);
        } else if (info.type === "doc") {
          blob = new Blob([res.data], {
            type: "application/msword",
          });
          objectUrl = URL.createObjectURL(blob);
        }
        let a = document.createElement("a");
        a.href = objectUrl;
        a.download = info.name;
        //a.click();
        //下面这个写法兼容火狐
        a.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
        window.URL.revokeObjectURL(blob);
        resolve(res);
      })
      .catch((error) => {
        console.log("response: ", error);
        reject(error);
      });
  });
}
```

#### 前端下载并打包 zip

```js
require("script-loader!file-saver");
import JSZip from "jszip";
import FileSaver from "file-saver";
const getFile = (url) => {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";
    xhr.onerror = function () {
      /* handle errors*/
    };
    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject({});
      }
    };
    xhr.send();
  });
};

export async function exportZip(data, zipName) {
  const zip = new JSZip();
  const cache = {};
  const promises = [];
  await data.forEach((item) => {
    const promise = getFile(item.url).then((data) => {
      // 下载文件, 并存成ArrayBuffer对象
      zip.file(item.name + ".jpg", data, {
        binary: true,
      }); // 逐个添加文件
      cache[item.name] = data;
    });
    promises.push(promise);
  });
  Promise.all(promises).then(() => {
    zip
      .generateAsync({
        type: "blob",
      })
      .then((content) => {
        // 生成二进制流
        console.log(content);
        saveAs(content, zipName + ".zip"); // 利用file-saver保存文件
      });
  });
}
```

### Vue 中为什么要有 nextTick

<!-- more -->

#### Vue 针对渲染的优化

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

#### NextTick 作用

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

#### NextTick 原理

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

#### 事件循环

![事件循环](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNTU4NjUwMi00ZjJkM2Y3MWE5NGE0YTAwLnBuZw?x-oss-process=image/format,png)

### 自定义指令

> 当你需要对普通 DOM 元素**进行底层操作**，这时候就会用到自定义指令

1. 全局注册和局部注册

   ```js
   // 注册一个全局自定义指令 `v-focus`
   Vue.directive('focus', {
     // 当被绑定的元素插入到 DOM 中时……
     inserted: function (el) {
       // 聚焦元素
       el.focus()
     }
   })

   //注册一个局部组件指令
   directive:{
     focus:{
        // 指令的定义
       inserted:function(el){
         el.focus()
       }
     }
   }
   ```

2. 示例（改造后台系统的权限功能）

   根据后台返回的权限数据来判断是否显示按钮

   - HTML 结构

   ```js
   <div id="app">
     <span class="mr_15">
             <el-button
               :loading="isLoading"
               type="primary"
               @click="addNewItem"
               v-has:merchantsMatchActivity_add
               >新增</el-button
             >
           </span>
   </div>
   ```

   - JS

   ```js
   Vue.directive("has", {
     inserted: (el, binding, vnode) => {
       console.log(vnode, el.parentNode);
       let path = vnode.context.$route.path.split("/")[1];
       if (!checkHasPass(path, binding.arg)) {
         el.parentNode.removeChild(el);
       }
     },
   });

   function checkHasPass(path, name) {
     let operator = openFun(path);
     let pass = false;
     for (const key in operator) {
       if (key == name) {
         pass = true;
       }
     }
     return pass;
   }
   ```

   ```js
   openFun是一个筛选数据的函数，如果有对应的权限字段，会返回一个对象
   let op = {};
   let oneLevelArr = [];
   function getPer(arr) {
     for (let i = 0; i < arr.length; i++) {
       //只要商客 sys:10
       if (arr[i].sys == 10) {
         if (arr[i]["children"] && arr[i]["children"].length) {
           getPer(arr[i]["children"]);
         }
         oneLevelArr.push(arr[i]);
       }
     }
   }
   const openFun = function(name) {
     console.log(name);
     op = {};
     oneLevelArr = [];
     getPer(JSON.parse(sessionStorage.getItem("resources")));
     for (let i = 0; i < oneLevelArr.length; i++) {
       if (String(oneLevelArr[i]["icon"]) === name) {
         op[oneLevelArr[i]["resourceMark"]] =
           Number(oneLevelArr[i]["resourceType"]) === 1;
       }
     }
     return op;
   };
   export default openFun;
   ```

   ```js
   resources形如:通过循环router中的children.resourceMark去判断是否有权限
   [
     {
       router: 'merchantsMatchActivity',
       resourceName: '比赛激励管理',
       sys: 10,
       children: [
         resourceMark: 'merchantsMatchActivity_add',
         icon: 'merchantsMatchActivity',
       ]
     }
   ]
   ```

   Tips:

   1. el.parentNode.removeChild(el)方法需要配合 inserted 周期，配置 bind 周期会报错，父节点为 null
   2. v-has:merchantsMatchActivity_add，冒号后面的字段会通过 arg 来拿到，并和 resource 去循环判断

3. 详细说明

   1. 钩子函数

      - **bind**：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
      - **inserted**：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
      - **update**：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新。
      - **componentUpdated**：指令所在组件的 VNode 及其子 VNode 全部更新后调用。
      - **unbind**：只调用一次，指令与元素解绑时调用。

   2. 钩子函数参数

      > 除了 `el` 之外，其它参数都应该是只读的

      指令钩子函数会被传入以下参数：

      - `el`：指令所绑定的元素，可以用来直接操作 DOM 。
      - `binding`：一个对象，包含以下属性：
        - `name`：指令名，不包括 v- 前缀。
        - `value`：指令的绑定值，例如：v-my-directive="1 + 1" 中，绑定值为 2。
        - `oldValue`：指令绑定的前一个值，仅在 update 和 componentUpdated 钩子中可用。无论值是否改变都可用。
        - `expression`：字符串形式的指令表达式。例如 v-my-directive="1 + 1" 中，表达式为 "1 + 1"。
        - `arg`：传给指令的参数，可选。例如 v-my-directive:foo 中，参数为 "foo"。
        - `modifiers`：一个包含修饰符的对象。例如：v-my-directive.foo.bar 中，修饰符对象为 { foo: true, bar: true }。
      - `vnode`：Vue 编译生成的虚拟节点。
      - `oldVnode`：上一个虚拟节点，仅在 update 和 componentUpdated 钩子中可用。

   ### 动态路由

   #### 官网动态路由解释

   当多个 router-link 对应一个组件的时候，可以去使用动态路由，而不用设置多个组件一一对应

   ```js
   const User = {
     template: "<div>User</div>",
   };

   const router = new VueRouter({
     routes: [
       // 动态路径参数 以冒号开头
       { path: "/user/:id", component: User },
     ],
   });
   ```

   组件内部:可以通过$route.params 的形式拿到数据，从而可以渲染不同的数据出来

   ```js
   const User = {
     template: "<div>User {{ $route.params.id }}</div>",
   };
   ```

   > 当使用动态路由的时候，mounted 周期会失效，因为为了节省开销，VUE 在你使用动态路由功能的时候会复用之前已经生成的组件，导致根本就不会进入初始化周期。为此，添加一个新的周期：beforeRouteUpdate

```js
const User = {
  template: "...",
  beforeRouteUpdate(to, from, next) {
    // react to route changes...
    // don't forget to call next()
  },
};
```

#### 实际上的动态路由应用

实际上，我们谈论动态路由的时候，更多的是说获取后端的数据、动态添加路由、从而实现权限等渲染控制。类似动态生成菜单功能

1. 后端返回的数组数据

   后端返回路由数据如下：

   ```js
   routerList = [
     {
       path: "/other",
       component: "Layout",
       redirect: "noRedirect",
       name: "otherPage",
       meta: {
         title: "测试",
       },
       children: [
         {
           path: "a",
           component: "file/a",
           name: "a",
           meta: { title: "a页面", noCache: "true" },
         },
         {
           path: "b",
           component: "file/b",
           name: "b",
           meta: { title: "b页面", noCache: "true" },
         },
       ],
     },
   ];
   ```

2. 前端静态路由

   ```js
   import Vue from "vue";
   import Router from "vue-router";
   import Layout from "@/layout";
   Vue.use(Router);
   // 配置项目中没有涉及权限的公共路由
   export const constantRoutes = [
     {
       path: "/login",
       component: () => import("@/views/login"),
       hidden: true,
     },
     {
       path: "/404",
       component: () => import("@/views/404"),
       hidden: true,
     },
   ];

   const createRouter = () =>
     new Router({
       mode: "history",
       scrollBehavior: () => ({ y: 0 }),
       routes: constantRoutes,
     });
   const router = createRouter();

   export function resetRouter() {
     const newRouter = createRouter();
     router.matcher = newRouter.matcher;
   }

   export default router;
   ```

   静态路由就直接按照正常的写法来处理

3. 处理后台返回的路由格式

   新建一个公共的`asyncRouter.js`文件

   ```js
   // 引入路由文件这种的公共路由
   import { constantRoutes } from "../router";
   // Layout 组件是项目中的主页面，切换路由时，仅切换Layout中的组件
   import Layout from "@/layout";
   export function getAsyncRoutes(routes) {
     const res = [];
     // 定义路由中需要的自定名
     const keys = ["path", "name", "children", "redirect", "meta", "hidden"];
     // 遍历路由数组去重组可用的路由
     routes.forEach((item) => {
       const newItem = {};
       if (item.component) {
         // 判断 item.component 是否等于 'Layout',若是则直接替换成引入的 Layout 组件
         if (item.component === "Layout") {
           newItem.component = Layout;
         } else {
           //  item.component 不等于 'Layout',则说明它是组件路径地址，因此直接替换成路由引入的方法
           newItem.component = (resolve) =>
             require([`@/views/${item.component}`], resolve);

           // 此处用reqiure比较好，import引入变量会有各种莫名的错误
           // newItem.component = (() => import(`@/views/${item.component}`));
         }
       }
       for (const key in item) {
         if (keys.includes(key)) {
           newItem[key] = item[key];
         }
       }
       // 若遍历的当前路由存在子路由，需要对子路由进行递归遍历
       if (newItem.children && newItem.children.length) {
         newItem.children = getAsyncRoutes(item.children);
       }
       res.push(newItem);
     });
     // 返回处理好且可用的路由数组
     return res;
   }
   ```

   其中，newItem 这个变量会被改造成类似如下结构：

   ```js
    {
           path: '/file',
           component: () => import('@/views/file'),
           hidden: true,
           name: "a",
           meta: { "title": "a页面", "noCache": "true" }
       },
   ```

4. 添加到 router 上去

   创建路由守卫：创建公共的 permission.js 文件，设置路由守卫

   ```js
   //  进度条引入设置如上面第一种描述一样
   import router from "./router";
   import store from "./store";
   import NProgress from "nprogress"; // progress bar
   import "nprogress/nprogress.css"; // progress bar style
   import { getToken } from "@/utils/auth"; // get token from cookie
   import { getAsyncRoutes } from "@/utils/asyncRouter";

   const whiteList = ["/login"];
   router.beforeEach(async (to, from, next) => {
     NProgress.start();
     document.title = to.meta.title;
     // 获取用户token，用来判断当前用户是否登录
     const hasToken = getToken();
     if (hasToken) {
       if (to.path === "/login") {
         next({ path: "/" });
         NProgress.done();
       } else {
         //异步获取store中的路由
         let route = await store.state.addRoutes;
         const hasRouters = route && route.length > 0;
         //判断store中是否有路由，若有，进行下一步
         if (hasRouters) {
           next();
         } else {
           //store中没有路由，则需要获取获取异步路由，并进行格式化处理
           try {
             const accessRoutes = getAsyncRoutes(await store.state.addRoutes);
             // 动态添加格式化过的路由
             router.addRoutes(accessRoutes);
             next({ ...to, replace: true });
           } catch (error) {
             // Message.error('出错了')
             next(`/login?redirect=${to.path}`);
             NProgress.done();
           }
         }
       }
     } else {
       if (whiteList.indexOf(to.path) !== -1) {
         next();
       } else {
         next(`/login?redirect=${to.path}`);
         NProgress.done();
       }
     }
   });

   router.afterEach(() => {
     NProgress.done();
   });
   ```

5. 在 main.js 中引入 permission.js 文件

6. 在 login 登录的时候将路由信息存储到 store 中

   ```js
   //  登录接口调用后，调用路由接口，后端返回相应用户的路由res.router，我们需要存储到store中，方便其他地方拿取
   this.$store.dispatch("addRoutes", res.router);
   ```

   到这里，整个动态路由就可以走通了，但是页面跳转、路由守卫处理是异步的，会存在动态路由添加后跳转的是空白页面，这是因为路由在执行 next()时，router 里面的数据还不存在，此时，你可以通过 window.location.reload()来刷新路由

### 混入（mixin）

### VueX 的基本介绍和使用

#### VueX 的基本结构

1. state

   状态存储，类似 Data。

2. getter

   可以将 getter 视为一个监听函数。可以避免重复引入一些方法，例如：每次都要对数据进行重复筛选 filter 功能，那么就要引入相同的公共函数。那么就可以用 getter 去直接筛选，并通过类似如下：

   页面中使用：

   ```js
   v-for="item in filterModuleList(searchText)"
   ```

   ```js
   computed: {
     ...mapGetters({
         filterModuleList: "mailHomePageConfig/filterModuleList"
       }),
   }
   ```

   VueX 中定义：

   ```js
   const getters = {
     filterModuleList: (state) => (searchText) => {
       if (searchText) {
         return state.moduleList.filter((item) => {
           console.log(item);
           return item["name"].indexOf(searchText) > -1;
         });
       } else {
         return state.moduleList;
       }
     },
   };
   ```

3. action

   action 实际上是一个专门用于 提供复杂业务逻辑及异步操作（如 axios 的异步请求），然后通过 commit 或者 dispatch 来触发 mutation 从而更新 state 中的数据。

4. mutation

   mutation 用于更新 state 数据，并且只用于更新数据。

#### VueX 的要点

1. ...mapState,...mapGetter

   这个是为了节省重复引入 VueX 内的 state 的字段而设计的。

   ES6 的结构方法，函数使用如下：

   ```js
    computed: {
       ...mapState({
         // 传字符串参数 'moduleList' ，可以省略后续的return
         moduleList,
         // 传字符串参数 'count' 等同于 `state => state.count`，这个是别名countAlias
         countAlias: 'count',
         operator: state => state.mailHomePageConfig.operator,
         // 为了能够使用 `this` 获取局部状态，必须使用常规函数
         countPlusLocalState (state) {
         return state.count + this.localCount
       }
       }),
       ...mapGetters({
         filterModuleList: "mailHomePageConfig/filterModuleList"
       }),
       curCity: {
         get() {
           return this.$store.state.mailHomePageConfig.curCity;
         },
         set(value) {
           this.$store.commit("mailHomePageConfig/updateCurCity", value);
         }
       }
     },
   ```

2. dispatch 和 commit

   commit 和 dispatch 的区别在于 commit 是提交 mutatious 的同步操作，dispatch 是分发 actions 的异步操作然后再手动调用 commit 更新

   dispatch：含有异步操作，例如向后台提交数据，写法： this.$store.dispatch(‘action 方法名’,值)

   dispatch 实际上是调用一个异步方法，然后再异步方法中再调用 commit 去同步更新。

   commit：同步操作，写法：this.$store.commit(‘mutations 方法名’,值)

### scss 的换肤功能

#### scss 配置文件

变量的定义文件\_handle.scss

```js
@import './_themes.scss';

//遍历主题map
@mixin themeify {
  @each $theme-name, $theme-map in $themes {
    //!global 把局部变量强升为全局变量
    $theme-map: $theme-map !global;
    //判断html的data-theme的属性值  #{}是sass的插值表达式
    //& sass嵌套里的父容器标识   @content是混合器插槽，像vue的slot
    [data-theme='#{$theme-name}'] & {
      @content;
    }
  }
}

//声明一个根据Key获取颜色的function
@function themed($key) {
  @return map-get($theme-map, $key);
}

//获取背景颜色
@mixin background_color($color) {
  @include themeify {
    background-color: themed($color) !important;
  }
}

@mixin background($color) {
  @include themeify {
    background: themed($color) !important;
  }
}
// 阴影颜色

@mixin box_shadow($color) {
  @include themeify {
    box-shadow: themed($color) !important;
  }
}

//获取字体颜色
@mixin font_color($color) {
  @include themeify {
    color: themed($color) !important;
  }
}

//获取边框颜色
@mixin border_color($color) {
  @include themeify {
    border-color: themed($color) !important;
  }
}

```

主题色配置文件\_themes

```js
//_themes.scss
//当HTML的data-theme为dark时，样式引用dark
//data-theme为其他值时，就采用组件库的默认样式
//注意一点是，每套配色方案里的key可以自定义但必须一致，不然就会混乱

$themes: (
    green: (
      //字体
      font_color1: #0BB3AC,
      font_color2: #4CCBC8,

      //背景
      background_color1: #0BB3AC,
      background_color2: rgba(11, 179, 172, 0.2),
      box_shadow3: 0px 2px 6px 0px rgba(11, 179, 172, 0.2),
      background1: linear-gradient(90deg,rgba(76,203,200,1),rgba(11,179,172,1)),
      //边框
      border_color1: #0BB3AC,
    ),
    // 橘色主题
    orange: (
        //字体
        font_color1: #FF6A47,
        font_color2: rgb(248, 138, 114),

        //背景
        background_color1: #FF6A47,
        background_color2: rgba(255,106,71,0.2),
        box_shadow3: 0px 2px 6px 0px rgba(255,106,71,0.2),
        background1: linear-gradient(90deg,rgba(245, 149, 128, 1),rgba(245, 128, 101, 1)),

        //边框
        border_color1: #FF6A47,

    ),

    blue: (
      //字体
      font_color1: #2E9CFF,
      font_color2: rgb(101, 175, 240),

      //背景
      background_color1: #2E9CFF,
      background_color2: rgba(46,156,255, 0.2),
      box_shadow3: 0px 2px 6px 0px rgba(46,156,255, 0.2),
      background1: linear-gradient(90deg,rgba(99, 172, 236, 1),rgba(46,156,255,1)),
      //边框
      border_color1: #2E9CFF,

    ),

    yellow: (
      //字体
      font_color1: #FFAF2E,
      font_color2: rgb(240, 197, 128),

      //背景
      background_color1: #FFAF2E,
      background_color2: rgba(255,175,46, 0.2),
      box_shadow3: 0px 2px 6px 0px rgba(255,175,46, 0.2),
      background1: linear-gradient(90deg,rgba(240, 186, 99, 1),rgba(255,175,46,1)),
      //边框
      border_color1: #FFAF2E,

    ),

    red: (
      //字体
      font_color1: #F52231,
      font_color2: rgb(238, 79, 90),

      //背景
      background_color1: #F52231,
      background_color2: rgba(245,34,49, 0.2),
      box_shadow3: 0px 2px 6px 0px rgba(245,34,49, 0.2),
      background1: linear-gradient(90deg,rgba(247, 198, 121, 1),rgba(245,34,49,1)),
      //边框
      border_color1: #F52231,
    )
);
```

#### 引入使用功能

在 app.vue 中通过设置 data 数据来判断当前主题色，

```js
window.document.documentElement.setAttribute("data-theme", "orange");
```

文件中引用变量设置

```js
<style lang="scss" scoped>
  @import '@/common/_handle.scss';
.btn_reject {
  //   background: $blueLinear-gradient;
  @include background_color('background_color1');
  color: #ffffff;
  box-shadow: 0 5rpx 10rpx 0 rgba(0, 29, 138, 0.3);
  @include box_shadow('box_shadow3');
  border: 2px solid #486cdc;
  @include borde_color('font_color1');
}
</style>
```

@include background_color 和@include box_shadow 这些变量都是通过 handle 文件来定义的。

注意：border 这类需要多个维度来判断的 class，只需要改变其中的颜色部分。会自动覆盖对应之前定义的 border 中的颜色#486cdc

### mini-Vue 极简说明

省去一切额外开销，几句话讲出 mini-Vue 大概逻辑

<!-- more -->

#### 代码示例

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

#### 收集和触发依赖（reactive）

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

##### track 函数是收集依赖

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

##### trigger 函数是触发依赖

### cancletoken 的使用（取消上一次的请求）

当上一次请求没有完成时，再次发起请求，需要首先结束上一次请求。然后再发起新的请求

axios 有提供 cancletoken 的方案，记录如下

<!-- more -->

#### 需求描述

现在又个 tabs 切换，第一个 tab 请求数据较大，需要 10 秒获取数据，第二个 tab 需求请求 5 秒，第三个需要请求 1 秒。

当点击第一个时，等待 1 秒后，再切换第二个 tab，再等待 1 秒，切换第三个 tab。

> 数据的显示会首先显示第三次请求的数据，然后显示第二次请求的数据，最后显示到页面上渲染出来的时第一次请求到的数据。这个是不正确的，需要显示第三次请求的数据。

![需求图片](https://limengtupian.oss-cn-beijing.aliyuncs.com/canceltoken%E7%9A%84%E4%BD%BF%E7%94%A8%E8%AE%B0%E5%BD%95/cancletoken.png)

#### 解决代码

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


## vue 项目上线优化记录

项目上线，没有进行备案，所以需要架设于境外服务器，所有访问速度较慢，现在记录所作优化步骤：

1. 引用线上地址
2. 将静态资源放置于网络存储
3. 精灵图减少请求
4. 服务器开通 gzip
5. 路由懒加载

<!-- more -->

### 引用线上地址

使用的是 bootstrap，之前是通过下载到本地，然后引用，当 build 的时候，会将其一并打包，所以导致 js 文件过大，所以直接将引用地址改为网络请求，这样，打包后的文件会减小很多。

> <script src="https://cdn.staticfile.org/jquery/3.2.1/jquery.min.js"></script>
> <script src="https://cdn.staticfile.org/popper.js/1.15.0/umd/popper.min.js"></script>
> <script src="https://cdn.staticfile.org/twitter-bootstrap/4.3.1/js/bootstrap.min.js"></script>
> <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css">

### 将静态资源放置于网络存储

网站的大部分图片都不会改动，所以将其上传到 oss 网络存储然后直接引用网络地址，这里采用的是北京的 oss，这样从服务器请求的时候是从北京地区请求的图片，相对速度会快一些。

> background-image: url("https://limengtupian.oss-cn-beijing.aliyuncs.com/%E9%A6%96%E9%A1%B5%E7%B2%BE%E7%81%B5%E5%9B%BE/img.png");

### 精灵图减少请求

每一张图片都会发起一次请求，所以对于一些常用的小图标，我们一般都会将其做成一张图，然后通过定位的方式，显示出其中的一部分，这样的图片就是精灵图。

### 服务器开通 gzip

gzip 可以直接再服务端的时候，就对要传输的数据先进行一次压缩，减少传输数据的体积，这个概念跟下载游戏文件的时候一般下载下来的都是压缩包是类似的，然后再客户端的浏览器上，会进行解压处理，这样就大大减少了文件体积，减少的传输速度。

由于是采用的 vue-cli 3.0 ，查阅网上资料发现，通过 3.0 去构建的项目，是默认的开启 gzip 的，那么只需要再服务器上的配置文件修改。

采用的是 nginx，所以找到对应的 conf 文件(/usr/local/nginx/conf)，修改如下：

> http {
>
> gzip on;
>
> gzip_min_length 1k;
>
> gzip_buffers 4 16k;
>
> \#gzip_http_version 1.0;
>
> gzip_comp_level 6;
>
> gzip_types text/plain application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
>
> gzip_vary off;
>
> gzip_disable "MSIE [1-6]\.";
>
> }

再次请求，可以通过谷歌浏览器-F12-network-点击任意文件-header 内的 request header 中，可以看到：

**Accept-Encoding**：gzip

已经是通过了 zip 压缩的文件了，体积明显缩小

### 路由懒加载

单页面应用是会再首页加载的时候将所有的页面直接加载完成，所以会出现首页加载较长的情况，这样就需要采用懒加载，当页面被点击的时候再加载。那么，配置如下：

在 router 中配置如下：

> export default {
>
> path: '/home',
>
> component: () => import('@/views/Home.vue')
>
> }

将其 component 修改成了() => import('@/views/Home.vue')。

但是现在**路由懒加载不生效**，因为 cli 3.0 是直接默认会把所有通过 import()按需加载的 javascript 文件加上 prefetch 。

**关闭 prefetch:** (官网示例)

```html
// vue.config.js module.exports = { chainWebpack: config => { // 移除 prefetch
插件 config.plugins.delete('prefetch') // 或者 // 修改它的选项：
config.plugin('prefetch').tap(options => { options[0].fileBlacklist =
options[0].fileBlacklist || []
options[0].fileBlacklist.push(/myasyncRoute(.)+?\.js$/) return options }) }
```

prefetch 链接会消耗宽带，如果是在移动端，而且存在大量的 chunk，那么可以关掉 prefetch 链接，手动选择要提前获取的代码区块。

```html
//手动选定要提前获取的代码 import(webpackPrefetch: true,
'./someAsyncComponent.vue')
```

## vue-cli 上线 代理接口报 404 修改 conf

前言： 项目使用 vue-cli 直接生成项目，然后使用 proxyTable 接口代理后， 在本地调用后台接口，一切正常，但是后期打包上线时，发现页面接口报 404，后找到解决办法为：

找到 nginx 的 conf 文件，打开后，修改里面的配置如下：

```html
server { listen 80;//监听80端口 server_name localhost; location / { root html;
index index.html index.htm; try_files $uri $uri/ /index.html;
//vue单页面应用，不能刷新，所有会设置这个，避免404 } location /v2/ {
proxy_set_header X-Real-IP $remote_addr; proxy_pass http://douban.uieee.com; }
error_page 500 502 503 504 /50x.html; location = /50x.html { root html; } }
```

里面主要添加的配置为：

```html
location /v2/ { proxy_set_header X-Real-IP $remote_addr; proxy_pass
http://douban.uieee.com; }
```

这个/v2/监听，实际上就是我 api 调用的名字，这个可以在你的 vue.config.js 里可以去设置：

```html
module.exports = { //axios域代理，解决axios跨域问题 devServer: { proxy: { '/v2':
{ target: 'https://douban.uieee.com', changeOrigin: true, ws: true, } } } }
```

我请求的 api 格式如下：

> https://douban.uieee.com/v2/movie/top250?start=0&count=12

提供的 api 文档里面可以看到，所有的 api 都带有一个相同的字符/v2/。

所以以这个字符为关键字来修改代理。

<meta name="referrer" content="no-referrer"/>

## 初始化设置和环境搭建（neginx,centOS，vue 的环境搭建）/GitHub 相关

### 安装 node.js

一般来讲, 可以用以下三种方式安装 Node.js：

- 通过安装包安装(Windows 和 Mac 用户推荐)
- 通过源码编译安装(Linux 用户推荐)
- 在 Linux 下可以通过 yum|apt-get 安装

1. 通过安装包安装：

2. 源码编译安装：

   <!-- more -->

   Linux 用户：

   ```
   curl -O https://nodejs.org/dist/v6.10.3/node-v6.10.3.tar.gz
   tar -xzvf node-v6.10.3.tar.gz
   cd  node-v6.10.3
   ./configure
   make
   make install
   ```

### 安装 cnpm 镜像（可选择）

[淘宝 NPM 镜像](https://npm.taobao.org/)是一个完整 npmjs.org 镜像，你可以用此代替官方版本(只读)，同步频率目前为 10 分钟 一次以保证尽量与官方服务同步。

```
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install [name]
```

### 使用 vue-cli

1.  安装

    如果用 npm 下载速度慢，可以使用 cnpm.

    ```
    npm install -g vue-cli
    ```

2.  init 初始模板

    目前可用的模板包括：

    - [browserify](https://github.com/vuejs-templates/browserify)–全功能的 Browserify + vueify，包括热加载，静态检测，单元测试

    - [browserify-simple](https://github.com/vuejs-templates/browserify-simple)–一个简易的 Browserify + vueify，以便于快速开始。

    - [webpack](https://github.com/vuejs-templates/webpack)–全功能的 Webpack + vueify，包括热加载，静态检测，单元测试

    - [webpack-simple](https://github.com/vuejs-templates/webpack-simple)–一个简易的 Webpack + vueify，以便于快速开始。

    - [simple](https://github.com/vuejs-templates/simple) - 单个 HTML 文件中最简单的 Vue 设置

      ```
      vue init <template-name> <project-name>
      ```

3.  运行项目

    1. 我们的项目选择 webpack,使用以下命令:

    ```
    vue init webpack vue-todos
    ```

    2. 输入下面的命令就可以运行这个项目了:

       ```
       cd vue-todos
       npm install
       npm run dev
       ```

## CentOS7 安装 Nginx

## 安装所需环境

Nginx 是 C 语言 开发，建议在 Linux 上运行，当然，也可以安装 Windows 版本，本篇则使用 [CentOS](http://www.linuxidc.com/topicnews.aspx?tid=14) 7 作为安装环境。

顺序如下：

1. **gcc 安装**

   ```
   yum install gcc-c++
   ```

2. **PCRE pcre-devel 安装**

   ```
   yum install -y pcre pcre-devel
   ```

3. **zlib 安装**

   ```
   yum install -y zlib zlib-devel
   ```

4. **OpenSSL 安装**

   ```
   yum install -y openssl openssl-devel
   ```

5. 下载`.tar.gz`安装包

   ```
   wget -c https://nginx.org/download/nginx-1.12.0.tar.gz
   ```

6. 解压

   ```
   tar -zxvf nginx-1.12.0.tar.gz
   cd nginx-1.12.0
   ```

7. **配置**

   ```
   ./configure
   ```

8. 编译安装

   ```
   make
   make install
   ```

9. 启动、停止 nginx

   ```
   cd /usr/local/nginx/sbin/
   ./nginx
   ./nginx -s stop
   ./nginx -s quit
   ./nginx -s reload
   ```

10. 重启 **nginx**

    ```
    cd /usr/local/nginx/sbin/
    ./nginx -s reload
    ```

## CSS Tools: Reset CSS 重置 css

浏览器自带的 css 属性，一般需要重置，记录如下：

```html
/* http://meyerweb.com/eric/tools/css/reset/ v2.0 | 20110126 License: none
(public domain) */ html, body, div, span, applet, object, iframe, h1, h2, h3,
h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del,
dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b,
u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table,
caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details,
embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby,
section, summary, time, mark, audio, video { margin: 0; padding: 0; border: 0;
font-size: 100%; font: inherit; vertical-align: baseline; } /* HTML5
display-role reset for older browsers */ article, aside, details, figcaption,
figure, footer, header, hgroup, menu, nav, section { display: block; } body {
line-height: 1; } ol, ul { list-style: none; } blockquote, q { quotes: none; }
blockquote:before, blockquote:after, q:before, q:after { content: ''; content:
none; } table { border-collapse: collapse; border-spacing: 0; }
```


### 记录：

- Vetur

  使用 scss 的时候，会遇到 vetur 报错的情况：

  ```html
  <style lang="scss" scoped>
      @keyframes glitch-one {
    @for $i from 20 to 30 {
      #{$i / 2}% {
        left: #{randomNum(200, -100)}px;
        clip-path: inset(#{randomNum(150, 30)}px 0 #{randomNum(150, 30)}px);
      }
    }
    }
  ```

  比如上面的这种情况，就会有红色波浪线提示，但是在浏览器中是正确的。所以需要配置如下：

  1. 文件》首选项》设置

  2. 右上角三个选项的第一个（打开设置 Json）

  3. 在大括号内添加最后四行（跟 vetur 相关的配置）

     ```html
     { "workbench.iconTheme": "vscode-icons", "[html]": {
     "editor.defaultFormatter": "vscode.html-language-features" },
     "open-in-browser.default": "chrome", "explorer.confirmDragAndDrop": false,
     "window.zoomLevel": 1, "[javascript]": { "editor.defaultFormatter":
     "vscode.typescript-language-features" }, "explorer.confirmDelete": false,
     "vsicons.dontShowNewVersionMessage": true, "editor.fontSize": 20, "[css]":
     { "editor.defaultFormatter": "esbenp.prettier-vscode" },
     "vetur.validation.template": false,
     "vetur.experimental.templateInterpolationService": false,
     "vetur.validation.style": false, "vetur.validation.script": false, }
     ```

## GitHub 相关问题

GitHub 是一个面向[开源](https://baike.baidu.com/item/开源/20720669)及私有[软件](https://baike.baidu.com/item/软件/12053)项目的托管平台，因为只支持 git 作为唯一的版本库格式进行托管，故名 GitHub。

## 初始设置 github

记录开始使用 GitHub 中三点注意：

1. 注册账号会验证邮箱，而 163 邮箱不能接受验证邮件

   **_注意_**：注册需要设置邮箱，需要选用 qq 邮箱或者 gmail 邮箱，163 邮箱发现不能接收到 GitHub 的邮件！

   新的库，需要设置 sshkeys

   1. 检查是否有 sshkeys

      ```
      ~/.ssh
      ```

   2. 创建 ssh

      首先创建一个 SSH，在 Git Bash 中输入

      ```
      $ ssh-keygen -t rsa -C “你的邮箱”
      ```

      然后他就会显示这两行

      ```
      Generating public/private rsa key pair.
      Enter file in which to save the key (/c/Users/16627/.ssh/id_rsa):
      ```

      这是让你输入一个文件名，用于保存刚才生成的 SSH key 代码。如果你不输入，直接回车，那么就会默认生成 id_rsa 和 id_rsa.pub 两个秘钥文件（如下提示）。

      ```
      Created directory ‘/c/Users/16627/.ssh’.
      ```

      紧接着又会提示你

      ```
      Enter passphrase (empty for no passphrase):
      Enter same passphrase again:
      ```

      接着又会提示你输入两次密码（该密码是你 push 文件的时候要输入的密码，而不是 github 管理者的密码），当然你还可以不输入密码，直接按回车。那么 fetch 和 push 的时候就不需要输入密码。

      ![chegngong](https://img-blog.csdn.net/20180118114145818?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

      已经创建成功

      ![chenggong](https://img-blog.csdn.net/20180118115923234?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

   3. 添加 ssh 到 GitHub

      按照以下的步骤操作：

      ![1](https://img-blog.csdn.net/20180118120316317?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

      ![2](https://img-blog.csdn.net/20180118120349241?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

      ![3](https://img-blog.csdn.net/20180118120556118?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

      title 随便给他起个名字就好。然后是 key，这时候你要打开你刚才在电脑上的 SSH key。刚才提示你建立的那段文字有 SSH key 的地址，按照地址找到你的文件，用记事本**打开 id_rsa.pub 文件，全选其中的内容粘贴到网页的 Key 中即可。**

      ![4](https://img-blog.csdn.net/20180118121323658?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

      ![5](https://img-blog.csdn.net/20180118121457269?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

      **然后你就会受到建立成功的邮件了。**

      ![6](https://img-blog.csdn.net/20180118121751176?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

   4. 测试一下 ssh key

      在 git Bash 中输入以下代码：

      ```
      ssh -T git@github.com
      注意是git@github.com，不是你的邮箱。
      ```

      然后会提示你：

      ```
      The authenticity of host ‘github.com (192.30.255.112)’ can’t be established.
      RSA key fingerprint is SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8.
      Are you sure you want to continue connecting (yes/no)?
      ```

      正常提示，你只需要 YES 就可以。如果你创建 SSH key 的时候设置了密码，接下来就会提示你输入密码，如果你没设置密码会提示你:

      ```
      Warning: Permanently added ‘github.com,192.30.255.112’ (RSA) to the list of known hosts.
      Hi “用户名”! You’ve successfully authenticated, but GitHub does not provide shell access.
      ```

2. 需要设置 config.name 和 config.email

   - 按照以下的步骤操作

     ```
     git config --global user.name "yourname" 设置用户名
     git config --global user.email myemail@qq.com 设置用户邮箱
     git config --list 查看git设置列表信息
     git config user.name  查看用户名
     ```

## git 推动 GitHub 提示 faild

在添加远程库的时候一直验证不成功，一直提示 failed to push some refs to git 的问题，经过网上查找终于解决了这个问题。

主要问题指向了 README.md 文件

### git 步骤如下

```html
1. git add . //添加到暂存区 2. git commit -m "备注内容" //添加到head 3. git push
-u origin master //添加到远程仓库
```

其中第三步出错，提示 ailed to push some refs to git

### 解决

出现错误的主要原因是 github 中的 README.md 文件不在本地代码目录中，

可以通过如下命令进行代码合并【注：pull=fetch+merge]

```html
git pull --rebase origin master
```

执行上面代码后可以看到本地代码库中多了 README.md 文件

此时再执行语句 git push -u origin master 即可完成代码上传到 github

<meta name="referrer" content="no-referrer"/>

## keep-alive 的使用与周期

### 使用 keep-alive 的时机

在搭建 vue 项目时，有某些组件没必要多次渲染，所以需要将组件在内存中进行‘持久化，此时 keep-alive 便可以派上用场了。keep-alive 可以使被包含的组件状态维持不变，即便是组件切换了，其内的状态依旧维持在内存之中。在下一次显示时，也不会重现渲染。

> PS：`与`相似，只是一个抽象组件，它不会在 DOM 树中渲染(真实或者虚拟都不会)，也不在父组件链中存在，比如：你永远在 `this.$parent` 中找不到 `keep-alive` 。

<!-- more -->

### 配合 router-view 去使用

有些时候可能需要将整个路由页面一切缓存下来，也就是将 `` 进行缓存。这种使用场景还是蛮多的

```js
<keep-alive>
    <router-view v-if="$router.meta.keepAlive"></router-view>
</keep-alive>
<router-view v-if="!$router.meta.keepAlive"></router-view>

//router配置
new Router({
    routes: [
        {
            name: 'a',
            path: '/a',
            component: A,
            meta: {
                keepAlive: true
            }
        },
        {
            name: 'b',
            path: '/b',
            component: B
        }
    ]
})
```

### keep-alive 生命周期和新属性

#### 生命周期

被包含在 ``中创建的组件，会多出两个生命周期的钩子:`activated`与`deactivated`

- activated

在组件被激活时调用，**在组件第一次渲染时也会被调用**，之后每次 keep-alive 激活时被调用。

- deactivated

在组件被停用时调用。

> 注意：只有组件被 `keep-alive` 包裹时，这两个生命周期才会被调用，如果作为正常组件使用，是不会被调用，以及在 `2.1.0` 版本之后，使用 `exclude` 排除之后，就算被包裹在 `keep-alive` 中，这两个钩子依然不会被调用！另外在服务端渲染时此钩子也不会被调用的。

#### 新属性

在 vue `2.1.0` 版本之后，`keep-alive` 新加入了两个属性: `include`(包含的组件缓存生效) 与 `exclude`(排除的组件不缓存，优先级大于 include) 。

`include` 和 `exclude` 属性允许组件有条件地缓存。二者都可以用逗号分隔字符串、正则表达式或一个数组来表示

当使用正则或者是数组时，一定要使用 `v-bind` !

```js
<!-- 逗号分隔字符串，只有组件a与b被缓存。这样使用场景变得更有意义了 -->
<keep-alive include="a,b">
  <component :is="view"></component>
</keep-alive>

<!-- 正则表达式 (需要使用 v-bind，符合匹配规则的都会被缓存) -->
<keep-alive :include="/a|b/">
  <component :is="view"></component>
</keep-alive>

<!-- Array (需要使用 v-bind，被包含的都会被缓存) -->
<keep-alive :include="['a', 'b']">
  <component :is="view"></component>
</keep-alive>
```

- 有了 include 之后，再与 `router-view` 一起使用时便方便许多了:

```js
<!-- 一个include解决了，不需要多写一个标签，也不需要在路由元中添加keepAlive了 -->
<keep-alive include='a'>
    <router-view></router-view>
</keeo-alive>
```

### 注意

1. keeo-alive 先匹配被包含组件的 `name` 字段，如果 `name` 不可用，则匹配当前组件 `components` 配置中的注册名称。

2. keeo-alive 不会在函数式组件中正常工作，因为它们没有缓存实例。

3. 当匹配条件同时在 `include` 与 `exclude` 存在时，以 `exclude` 优先级最高(当前 vue 2.4.2 version)。比如：包含于排除同时匹配到了组件 A，那组件 A 不会被缓存。

4. 包含在 keeo-alive 中，但符合 `exclude` ，不会调用`activated` 和 `deactivated`。

5. **设置了`keep-alive`,这个时候不会触发生命周期的钩子函数。**

   当页面内的数据没有发生变化时，页面内的操作比如跳转到另一个路由，是不会去经过生命周期函数的，比如：desdtroy 函数等。

   它会直接在进入的时候触发`activated` 和离开的时候触发 deactivated。

   所以，如果是有涉及到之前放入 mouted 周期中的函数，可以将其放入 activated，放入 desdtroy 周期的函数可以放入 deactivated。
