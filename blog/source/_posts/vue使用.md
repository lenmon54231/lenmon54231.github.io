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
