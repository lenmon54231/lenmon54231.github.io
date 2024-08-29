---
title: Krpano+Vue3使用
date: 2024-08-29 10:30:14
tags: [kapano,vue3,vite]
---


## Krpano+Vue3使用

Krpano语法非常古老，并且当需求有更新时（比如替换某一张全景图），需要通过Krpano提供的工具重新生成一次vtour文件，之前的代码都会被替换掉，那么，需要一种重新生成xml文件后，不被替换掉的方案，这里使用的是Vue3+Vite。

<!-- more -->


### 如何利用Krpano提供的工具生成全景图文件

1. 官网下载Krpano，这里使用的是1.21.2；

2. 解压后，打开krpano Tools.exe；

3. 在Make VTour选项界面，点击Open images，则可以选择全景图，并生成一个vtour文件夹；

4. 通过VTour Editor则可以加载tour.xml来预览全景图效果，并且添加热点这些功能；


### 上述方法存在的问题

#### 问题：

> 当我们有需求变动，比如：替换某一张全景图时，按照上述方法重新生成的vtour文件会是一个全新的文件，之前添加的热点和功能都不会保留，这种情况是无法应对真实的项目的。

#### 解决方法：

> 利用Krpano暴露出来的全局对象，结合其提供的call方法，可以通过js的形式调用Krpano内部的功能。

### 解决上述问题具体步骤

#### 简单了解Krpano全景图运作逻辑

Krpano最终生成物是一个vtour文件夹，里面包含如下内容

```
vtour/
├── panos/
├── tour.html/
├── tour.xml/
└── tour.js/
```

主要核心是tour.html文件。

里面引入了tour.js，并且调用了embedpano方法加载了tour.xml文件，从而实现html中显示全景图。

在embedpano方法中，Krpano提供了一个ready的回调函数，函数中暴露了Krpano对象，利用此对象上的call方法，即可通过js来操作Krpano全景图。

### 将vtour和Vue3结合起来

实际上，我们可以利用任何支持js的框架来实现此需求，如：React、Svelte、JQuery，或者，我们也可以直接使用HTML+JS+CSS。

此处，我们使用Vue3+Vite。

搭建Vue3+Vite的步骤跳过。

1. 将vtour放入public目录下；

2. 修改index.html入口文件；

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/jpeg" href="/panorama.jpg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>panorama</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
    <script src="./vtour/tour.js"></script>
  </body>
</html>
```

此时，在Vue项目中，已经拥有了利用embedpano加载xml全景图的能力。

3. app.vue中调用embedpano；


```vue
<template>
  <div>
    <div id="pano"></div>
  </div>
</template>

<script setup>
import { onMounted ,ref} from "vue";

onMounted(() => {
  const publicPath = ref(import.meta.env.BASE_URL);
  let xml = `${publicPath.value}vtour/tour.xml`;
  embedpano({
    xml: xml,
    target: "pano",
    html5: "auto",
    mobilescale: 1.0,
    onready: krpanoOnReady,
  });
});

let krpano = ref(null);
const krpanoOnReady = (kr) => {
  krpano.value = kr;
};
</script>
```

krpano对象即是Krpano的全局对象，可以操作整个全景图功能。

#### krpano对象有哪些方法？

- 获取 hotspot 对象

```js
krpano.hotspot.getItem(name);
```

- 设置 hotspot 对象属性

```js
krpano.value.set("hotspot1.ath", h);
```

- 移除所有 hotspot 对象

```js
krpano.value.call("loop(hotspot.count GT 0, removehotspot(0) );");
```

- 获取所有同类型 layer 对象

```js
krpano.value
  .get("layer")
  .getArray()
  .forEach((e) => {
    console.log(e, "----");
  });
krpano.value
  .get("hotspot")
  .getArray()
  .forEach((e) => {
    console.log(e, "----");
  });
```

- 场景跳转

```js
let xmlname = "scene_2-1";
krpano.value.call("loadscene(" + xmlname + ", null, MERGE, BLEND(0.5));");
```

- 旋转镜头(随机方向)

```js
krpano.call(
  "lookto(" +
    (Math.random() * 360.0 - 180.0) +
    "," +
    (Math.random() * 180.0 - 90.0) +
    "," +
    (80.0 + Math.random() * 100.0) +
    ")"
);
```

- 获取当前 view 的数据

```js
var hlookat = krpano.get("view.hlookat");
var vlookat = krpano.get("view.vlookat");
var fov = krpano.get("view.fov");
var distortion = krpano.get("view.distortion");
```

- 移除所有热点

```js
krpano.value.call("loop(hotspot.count GT 0, removehotspot(0) );");
```

- 通过名称获取热点

```js
let scene = krpano.value.get("scene[get(xml.scene)]");
let selfSpotName = "door"; // sceneOptionsList中的hotspot的name
let hotspotName = `hotspot[${scene.name}_${selfSpotName}]`;
let hotpot = krpano.value.get(hotspotName);
console.log("hotpot: ", hotpot);
```

- 绑定跳转场景事件

```js
krpano.value.set("hotspot[" + option.name + "].onclick", function() {
     krpano.value.call(
       "loadscene(" +
         option.eventOptions.sceneName +
         ", null, MERGE, BLEND(0.5));"
     );
});
```

- 添加热点

```js
krpano.value.call("addhotspot(" + option.name + ")");
```

- 设置热点样式

```js
krpano.value.set("hotspot[" + option.name + "].url", option.url);
krpano.value.set("hotspot[" + option.name + "].ath", option.ath);
krpano.value.set("hotspot[" + option.name + "].atv", option.atv);
// krpano.value.set("hotspot[" + option.name + "].distorted",true); //设置热点是否跟随场景进行3D扭曲
```


- 实现拖拽热点功能

```js
krpano.value.set("hotspot[" + hs_name + "].ondown", function (hs){
  updateHotPotPosition(hs_name);
});
krpano.value.set("hotspot[" + hs_name + "].onup", function (hs) {
  clearUpdateHotPotPosition();
});

const updateHotSpotInfo = (hs_name, event, eventOptions) => {
  let h = krpano.value.get("view.hlookat");
  let v = krpano.value.get("view.vlookat");
  krpano.value.set(
    "hotspot[" + hs_name + "].url",
    event === "loadscene" ? "/arrow.png" : "/modal.png"
  );
  krpano.value.set("hotspot[" + hs_name + "].ath", h);
  krpano.value.set("hotspot[" + hs_name + "].atv", v);
  // krpano.value.set("hotspot[" + hs_name + "].distorted", true); //设置热点是否跟随场景进行3D扭曲
  krpano.value.set("hotspot[" + hs_name + "].self_event", event);
  krpano.value.set(
    "hotspot[" + hs_name + "].self_event_options",
    JSON.stringify(eventOptions)
  );
};

// 实现拖拽热点功能
let timer = null;
let ath = ref(0);
let atv = ref(0);
const updateHotPotPosition = (hs_name) => {
  timer = setInterval(() => {
    var mx = krpano.value.get("mouse.x");
    var my = krpano.value.get("mouse.y");
    var pnt = krpano.value.screentosphere(mx, my);
    var h = pnt.x;
    var v = pnt.y;
    krpano.value.set("hotspot[" + hs_name + "].ath", h);
    krpano.value.set("hotspot[" + hs_name + "].atv", v);
    ath.value = h;
    atv.value = v;
  }, 60);
};
const clearUpdateHotPotPosition = () => {
  clearInterval(timer);
};
```
