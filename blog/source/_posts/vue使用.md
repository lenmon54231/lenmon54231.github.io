---
title: vue使用
date: 2023-09-15 11:35:24
tags: [vue]
---

## vue 使用

<!-- more -->

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
