---
title: js相关使用
date: 2023-09-15 11:48:42
tags: [js]
---

## js 相关使用

<!-- more -->

### 常用判断工具

> JavaScript 有很多的判断工具，如 Lodash.js 这些库来辅助判断，里面有额外的很多对象、数组、函数。以下记录一些手写的 js 方法，包含各种判断：是否是链接，是否为空，是否是对象，是否为空等常用功能，

#### 通用判断功能

```js
const toString = Object.prototype.toString;

export function is(val: unknown, type: string) {
return toString.call(val) === `[object ${type}]`;
}

export function isDef<T = unknown>(val?: T): val is T {
return typeof val !== 'undefined';
}

export function isUnDef<T = unknown>(val?: T): val is T {
return !isDef(val);
}

export function isObject(val: any): val is Record<any, any> {
return val !== null && is(val, 'Object');
}

export function isEmpty<T = unknown>(val: T): val is T {
if (isArray(val) || isString(val)) {
return val.length === 0;
}

if (val instanceof Map || val instanceof Set) {
return val.size === 0;
}

if (isObject(val)) {
return Object.keys(val).length === 0;
}

return false;
}

export function isDate(val: unknown): val is Date {
return is(val, 'Date');
}

export function isNull(val: unknown): val is null {
return val === null;
}

export function isNullAndUnDef(val: unknown): val is null | undefined {
return isUnDef(val) && isNull(val);
}

export function isNullOrUnDef(val: unknown): val is null | undefined {
return isUnDef(val) || isNull(val);
}

export function isNumber(val: unknown): val is number {
return is(val, 'Number');
}

export function isPromise<T = any>(val: unknown): val is Promise<T> {
return is(val, 'Promise') && isObject(val) && isFunction(val.then) && isFunction(val.catch);
}

export function isString(val: unknown): val is string {
return is(val, 'String');
}

export function isFunction(val: unknown): val is Function {
return typeof val === 'function';
}

export function isBoolean(val: unknown): val is boolean {
return is(val, 'Boolean');
}

export function isRegExp(val: unknown): val is RegExp {
return is(val, 'RegExp');
}

export function isArray(val: any): val is Array<any> {
return val && Array.isArray(val);
}

export function isWindow(val: any): val is Window {
return typeof window !== 'undefined' && is(val, 'Window');
}

export function isElement(val: unknown): val is Element {
return isObject(val) && !!val.tagName;
}

export function isMap(val: unknown): val is Map<any, any> {
return is(val, 'Map');
}

export const isServer = typeof window === 'undefined';

export const isClient = !isServer;

export function isUrl(path: string): boolean {
const reg =
/(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]_)?\??(?:[-\+=&;%@.\w_]_)#?(?:[\w]\*))?)$/;
return reg.test(path);
}

```

```js
只允许输入数字(整数：小数点不能输入)

<input type="text" onkeyup="value=value.replace(/[^\d]/g,'')" >

允许输入小数(两位小数)

<input type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" >

允许输入小数(一位小数)

<input type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,1})?).*$/g, '$1')" >

开头不能为0，且不能输入小数

<input type="text" onkeyup="value=value.replace(/[^\d]/g,'').replace(/^0{1,}/g,'')" >

只能输入数字或小数且第一位不能是0和点且只能有一个点

<input type="text" onkeyup="value=value.replace(/[^1-9]{0,1}(\d*(?:\.\d{0,2})?).*$/g, '$1')" >

```

```js
// 只允许输入数字，并且只能保留两位小数，不能以小数点开头，不能以小数点结尾
let judge = /^([1-9][\d]{0,}|0)(\.[\d]{1,2})?$/; //限制小数点前无穷位，小数点后2位数
judge.test(value);
```

### 纯 js 实现上传视频，截取关键帧及全屏截图

Web 端的截图(生成图片)并不算是个高频的需求，资料自然也不算多，查来查去，也不过 Canvas 和 SVG 两种实现方案，原理大概相似，都非真正义上的截图而是把 DOM 转为图片，然而实现方式却截然不同。

<!-- more -->

> context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);

#### 需求

对上传的视频进行截图，生成对应帧图片。对网站页面进行截图

#### 实现视频截图

1. 上传

   ```html\
             <el-upload
               class="upload-demo"
               :before-upload="beforeUpload"
               :action="uploadUrl"
               :on-success="uploadSuccess"
               :file-list="fileList"
             >
               <el-button size="small" type="primary">点击上传</el-button>
             </el-upload>
   ```

   ```js
       beforeUpload(file) {
         this.movieUrl = window.URL.createObjectURL(file);
       }
   ```

2. 通过 canvas 转出 img

```js
 shootIt() {
      let video = this.$refs.uploadVideo;
      let imgHeight = 0;
      let imgWidth = 0;
      let videoWidth = 0;
      let videoHeight = 0;
      let canvas = document.createElement("canvas");
      let canvasCtx = canvas.getContext("2d");
      //获取展示的video宽高作为画布的宽高和临时视频截图的宽高
      this.info.swidth = canvas.width = imgWidth = video.offsetWidth;
      this.info.sheight = canvas.height = imgHeight = video.offsetHeight;
      //获取实际视频的宽高，相当于视频分辨率吧
      videoWidth = video.videoWidth;
      videoHeight = video.videoHeight;
      //坐原图像的x,y轴坐标，大小，目标图像的x，y轴标，大小。
      canvasCtx.drawImage(
        video,
        0,
        0,
        videoWidth,
        videoHeight,
        0,
        0,
        imgWidth,
        imgHeight
      );
      //把图标base64编码后变成一段url字符串
      let dataUrl = canvas.toDataURL("image/png");
      this.shootUrl = dataUrl;
      // 获取图片的base64格式
      // let shootImage = base64ConvertFile(dataUrl, "haorooms截取视频帧");
    },
```

#### 实现网站截图

> import html2canvas from 'html2canvas'

`html2canvas.js`用法其实很简单，通常情况下只需传入需要转换的 DOM 对象就可以了

代码：定义公共方法

```js
import html2canvas from "html2canvas";

export const shootAll = (dom) => {
  return new html2canvas(dom, {
    backgroundColor: "1",
    allowTaint: true,
    useCORS: true,
  }).then((canvas) => {
    let canvasInfo = {
      width: canvas.getAttribute("width"),
      height: canvas.getAttribute("height"),
      url: canvas.toDataURL(),
    };
    // canvas为转换后的Canvas对象
    return canvasInfo; // 导出图片
  });
};
```

> 找到对应 dom 是关键，可以通过点击事件获取到 e，e 携带了全部的路径 path，从 path 中可以获取到父级的 dom，传入前做一下对象是否是 dom 的判断

```js
 assertElement(obj) {
      //判断是不是dom节点
      var d = document.createElement("div");
      try {
        d.appendChild(obj.cloneNode(true));
        return obj.nodeType == 1 ? true : false;
      } catch (e) {
        return false;
      }
    },
    shootAllPre(e) {
      let shootDom = null;
      e.path.forEach((v) => {
        //寻找到 container dom节点
        let judge = this.assertElement(v);
        if (judge && v.getAttribute("class") == "container") {
          shootDom = v;
        }
      });
      shootAll(shootDom).then((res) => {
        this.shootUrl = res.url;
        this.info.swidth = res.width;
        this.info.sheight = res.height;
      });
    },
```

```html
<el-button size="small" type="primary" @click="shootAllPre">全屏截图</el-button>
```

### ES6 的解构

### ES6 中 Proxy 的代理和反射

#### Proxy 对象

EcmaScript 2015 中引入了 Proxy 代理 与 Reflect 反射 两个新的内置模块。

我们可以利用 Proxy 和 Reflect 来实现对于对象的代理劫持操作，类似于 Es 5 中 Object.defineProperty()的效果

 <!-- more -->

##### 使用 Proxy

```js
const obj = {
  name: "wang.haoyu",
};

const proxy = new Proxy(obj, {
  // get陷阱中target表示原对象 key表示访问的属性名
  get(target, key, receiver) {
    console.log("劫持你的数据访问" + key);
    return target[key];
  },
  set(target, key, value) {
    console.log(`set ${key}, old value ${target[key]} to ${value}`);
    target[key] = value;
  },
});

proxy.name; // 劫持你的数据访问name -> wang.haoyu
```

当调用 proxy.name 时，会触发 proxy 内置的 get，从而返回 target 的值

Proxy 的第 2 个参数 handler 除了可以设置 get 和 set 方法外，还有更多丰富的方法：

- get(target, propKey, receiver)：拦截对象属性的读取，比如 proxy.foo 和 proxy['foo']。
- set(target, propKey, value, receiver)：拦截对象属性的设置，比如 proxy.foo = v 或 proxy['foo'] = v，返回一 \* 个布尔值。
- has(target, propKey)：拦截 propKey in proxy 的操作，返回一个布尔值。
- deleteProperty(target, propKey)：拦截 delete proxy[propKey]的操作，返回一个布尔值。
- ownKeys(target)：拦截 Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、Object. _ keys(proxy)、for...in 循环，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而 Object.keys()的返回结果 _ 仅包括目标对象自身的可遍历属性。
- getOwnPropertyDescriptor(target, propKey)：拦截 Object.getOwnPropertyDescriptor(proxy, propKey)，返回属 \* 性的描述对象。
- defineProperty(target, propKey, propDesc)：拦截 Object.defineProperty(proxy, propKey, propDesc）、 \* Object.defineProperties(proxy, propDescs)，返回一个布尔值。
- preventExtensions(target)：拦截 Object.preventExtensions(proxy)，返回一个布尔值。
- getPrototypeOf(target)：拦截 Object.getPrototypeOf(proxy)，返回一个对象。
- isExtensible(target)：拦截 Object.isExtensible(proxy)，返回一个布尔值。
- setPrototypeOf(target, proto)：拦截 Object.setPrototypeOf(proxy, proto)，返回一个布尔值。如果目标对象是函 \* 数，那么还有两种额外操作可以拦截。
- apply(target, object, args)：拦截 Proxy 实例作为函数调用的操作，比如 proxy(...args)、proxy.call(object, .. \* .args)、proxy.apply(...)。
- construct(target, args)：拦截 Proxy 实例作为构造函数调用的操作，比如 new proxy(...args)。

#### 反射

Proxy 与 Reflect 可以说形影不离了，Reflect 里所有的方法和使用方式与 Proxy 完全一样。

例如上面 Proxy 里的 get(), set()和 deleteProperty()方法我们都是直接操作原代理对象的，这里我们改成使用 Reflect 来操作

```js
const personProxy = new Proxy(person, {
  get(target, key, receiver) {
    console.log(`get value by ${key}`);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log(`set ${key}, old value ${target[key]} to ${value}`);
    return Reflect.set(target, key, value, receiver);
  },
  deleteProperty(target, key, receiver) {
    console.log(`delete key ${key}`);
    return Reflect.deleteProperty(target, key, receiver);
  },
});
```

> 问： target[key] 和 Reflect.get(target, key, receiver) 的效果是一样的。那为什么要多一个 Reflect 反射呢？
> 答：注意到 Proxy 里头的 get 等还有一个“多余的传入参数”：receiver，它和 Reflect.get 的第三个参数是配套的。
> 如果那个你的 Proxy 里头的 target 还是一个 proxy，并且对 receiver 有自己的用途，那么只能用 Reflect.get(target,prop,receiver)，将 receiver 正确地传递进去。也就是保证 this 的指向正确性

#### Vue3 的优化

Vue3 可以通过 Proxy 直接劫持数组，从而实现对应数组的监听了。

```js
const arr = [1, 2, 3, 4];
const arrProxy = new Proxy(arr, {
  get(target, key, receiver) {
    console.log("arrProxy.get", target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log("arrProxy.set", target, key, value);
    return Reflect.set(target, key, value, receiver);
  },
  deleteProperty(target, key) {
    console.log("arrProxy.deleteProperty", target, key);
    return Reflect.deleteProperty(target, key);
  },
});

arrProxy[2] = 22; // arrProxy.set (4) [1, 2, 3, 4] 2 22
arrProxy[3]; // arrProxy.get (4) [1, 2, 22, 4] 3
delete arrProxy[2]; // arrProxy.deleteProperty (4) [1, 2, 22, 4] 2
arrProxy.push(5); // push操作比较复杂，这里进行了多个get()和set()操作
arrProxy.length; // arrProxy.get (5) [1, 2, empty, 4, 5] length
```

可以看到无论获取、删除还是修改数据，都可以感知到。还有数组原型链上的一些方法，如：

- push()
- pop()
- shift()
- unshift()
- splice()
- sort()
- reverse()

也都能通过 Proxy 中的代理方法劫持到。
