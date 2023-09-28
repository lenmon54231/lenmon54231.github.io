---
title: check知识点
date: 2021-11-24 10:49:32
tags: [three.js 小程序]
---

# Check 知识点

<!-- more -->

## CORS 简析

### 优点和缺点

#### 缺点：

IE 浏览器不能低于 10（现在项目不存在这个问题，因为多为移动端和小程序）

#### 优点：

对于开发者来说，整个开发过程和使用 Ajax 是没有区别的，当发现跨域请求，会添加附加头信息

### CORS 的实现

#### 客户端（浏览器端）

当浏览器发起一个请求，会自动在 http 的 header 中添加一个字段：origin，此字段标记了请求的来源站点

> GET https://api.website.com/users HTTP/1/1
> Origin: https://www.mywebsite.com // <- 浏览器自己加的

**客户端常用字段**
Access-Control-Allow-Origin ：必选

- （一个或者多个允许跨越的）请求头 Origin 字段的值
- \*代表接受任何域名

Access-Control-Allow-Credentials： 可选

- true：表示允许发送 cookie，此时 Access-Control-Allow-Origin 不能设置为\*，必须指定明确的，与请求网页一致的域名；
- 不设置该字段，不需要浏览器发送 cookie

Access-Control-Expose-Headers：可选

- 列出了哪些首部可以作为响应的一部分暴露给外部
- Cache-Control
- Content-Language
- Content-Type
- Expires
- Last-Modified
- Pragma

如果想让客户端可以访问到其他的首部信息，可以将他们在 Access-Control-Expose-Headers 里面列出来

#### 服务端（后端）

服务器端可以在 http 响应中添加字段 Access-Control-Allow-Origin，这个头字段的值指定了哪些站点被允许跨域访问资源。

```js
response.setHeader(
  'Access-Control-Allow-Origin':'https://www.mywebsite.com'
)
```

收到服务器返回的 response 后，浏览器的 CORS 机制会检查 Access-Control-Allow-Origin 是否等于请求中的 origin 值，
校验通过后，就会收到跨域资源

#### 简单请求和预检查请求

##### 简单请求

同时满足以下两个条件，就属于简单请求使用下列方法之一

- head
- get
- post

请求的 header 是

- AcceptAccept-Language
- Content-Language
- Content-Type(只限于三个值)
  - application/x-www-form-urlencodes
  - multipart/form-data
  - text/plain

对于简单请求，浏览器直接发出 CORS 请求。在头部字段中，增加一个 Origin 字段。（chrome 有时会隐藏这个字段）

##### 预检查请求

当有超出浏览器自带的 header 字段或者方法（比如 put/delete 方法）时，一般就会产生预检查，例如：

```js
const xhr = new XMLHttpRequest();
xhr.open("POST", "https://bar.other/resources/post-here/");
xhr.setRequestHeader("X-PINGOTHER", "pingpong");
xhr.setRequestHeader("Content-Type", "application/xml");
xhr.onreadystatechange = handler;
xhr.send("<person><name>Arun</name></person>");
```

上述请求包含了 X-PINGOTHER 和 application/xml 这些非自带的内容，则需要发起预检查

预检查步骤如下：

1. 先发起一个 option 方法请求，携带了 Access-Control-Request-Method 和 Access-Control-Request-Headers；
   1. Access-Control-Request-Headers
      用于预检查，携带着当前请求的 header
   2. Access-Control-Request-Method
      用于预检查，携带当前请求的方法
2. 服务端会返回一个没有 body 的 http 相应，包含允许的 header 和 methods；
3. 浏览器收到预检查响应，判断是否符合要求；
4. 预检查通过，发送实际请求，获取服务器资源

## new URL() / URLSearchParams() / URL.createObjectURL()

### new URL()用法

内建的 URL 类提供了用于创建和解析 URL 的便捷接口。

#### 语法

```js
new URL(url, [base]);

let url1 = new URL("https://javascript.info/profile/admin");
let url2 = new URL("/profile/admin", "https://javascript.info");

alert(url1); // https://javascript.info/profile/admin
alert(url2); // https://javascript.info/profile/admin

let url = new URL("https://javascript.info/url");
```

#### 用 URL 的好处

1. 方便的获取 url 上的值

```js
alert(url.protocol); // https:
alert(url.host); // javascript.info
alert(url.pathname); // /url
```

2. 提供了各种方法
   append(name, value) —— 按照 name 添加参数，
   delete(name) —— 按照 name 移除参数，
   get(name) —— 按照 name 获取参数，
   getAll(name) —— 获取相同 name 的所有参数（这是可行的，例如 ?user=John&user=Pete），
   has(name) —— 按照 name 检查参数是否存在，
   set(name, value) —— set/replace 参数，
   sort() —— 按 name 对参数进行排序，很少使用，

### URLSearchParams()方法

new URLSearchParams 会返回一个实例，这个实例包含众多方法

1. URLSearchParams.entries()

2. URLSearchParams.append(name, key)

3. URLSearchParams.delete(name)

4. URLSearchParams.forEach(callback)

5. URLSearchParams.get(name)

6. URLSearchParams.getAll(name)

7. URLSearchParams.has(name)

以上方法看名字可以知道大概的用法

### URL.createObjectURL()使用

可以把 File，Blob 或者 MediaSource 对象变成一个一个唯一的 blob URL。其中参数 object 可以是 File，Blob 或者 MediaSource 对象。

使用场景：

```js
var xhr = new XMLHttpRequest();
xhr.onload = function () {
  var url = URL.createObjectURL(this.response);
  var img = new Image();
  img.onload = function () {
    // 此时你就可以使用canvas对img为所欲为了
    // ... code ...
    // 图片用完后记得释放内存
    URL.revokeObjectURL(url);
  };
  img.src = url;
};
xhr.open("GET", url, true);
xhr.responseType = "blob";
xhr.send();
```

当用请求获取到一个 response 时，此时，response 实际上是一个 Blob 对象，可以将其转化为 一个 url，赋值到 img 上，并在 onload 中做各种操作

## 自动播放

1. 自动播放判断

   ```js
   var promise = document.querySelector("video").play();

   if (promise !== undefined) {
     promise
       .catch((error) => {
         // Auto-play was prevented
         // Show a UI element to let the user manually start playback
       })
       .then(() => {
         // Auto-play started
       });
   }
   ```

   不要信任浏览器会自动播放，因为这玩意就是薛定谔的猫。所以我们最好加上一个 play 方法兜底，手动触发自动播放，并在失败的时候 做些界面上的反馈。譬如出现重播或开启播放的按钮。

2. 安卓自动播放

   安卓微信内自动播放现在是不被支持的，即便 video 静音了，也不行。为什么会出现这个特殊的情况，是因为安卓微信内核为 X5 内核，猜测是它的行为并没有同步最新的 chromium。
   需要做一些兜底策略，可能如下：

   1. 如果是静音视频展示的场景，可以考虑针对安卓微信展示相同效果的 gif
   2. 非静音视频效果，默认展示明显的诱导开始播放的按钮
   3. 忽略不管，等待用户触发网页行为后，再手动开启 play 方法

3. 禁用全屏
   但如果想要禁用播放全屏，需要考虑加上 playsinline 属性以做兼容。腾讯 x5 内核下，还需要开启同层渲染 x5-video-player-type='h5-page'，避免全屏。
   ```js
   <video
     autoplay
     src={videoUrl}
     webkit-playsinline="true"
     playsinline="true"
     x5-video-player-type="h5-page"
   />
   ```

## 同层渲染

将原生组件和 webview 渲染组件放置到同一层来渲染的功能，这样就可以实现，webview 的组件覆盖原生组件的能力。
比如：将 原生视频组件 video 上覆盖一层按钮或者提示

### 某些不生效情况

一般来说，定位 (position / margin / padding) 、尺寸 (width / height) 、transform (scale / rotate / translate) 以及层级 (z-index) 相关的属性均可生效。
在原生组件外部的属性 (如 shadow、border) 一般也会生效。
但如需对组件做裁剪则可能会失败，例如：border-radius 属性应用在父节点不会产生圆角效果。

### 特殊情况

1. 只有子节点才会进入全屏
   有别于非同层渲染的原生组件，像 video 和 live-player 这类组件进入全屏时，只有其子节点会被显示。

```js
   <video>
     <view> tips </view> // 全屏时会显示
   </video>

   <view> tips </view> // 全屏时不显示

```
