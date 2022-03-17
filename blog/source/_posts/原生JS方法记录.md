---
title: 原生JS方法记录
date: 2020-03-018 17:16:26
tags: [原生,JavaScript]
---

<meta name="referrer" content="no-referrer"/>

## 原生JS方法记录

### 记录原生JS实现的功能

通过框架实现的功能，如何通过原生JS实现，记录遇到的实现代码

<!-- more -->

### js动态添加页面的icon图标

```js
(function() {
    var link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = '/images/366/favicon.ico';
    document.getElementsByTagName('head')[0].appendChild(link);
}());
```

<meta name="referrer" content="no-referrer"/>

## 记录图片懒加载的实现

### 图片懒加载

如果是一个图片较多的网站，比如照片类网站，会涉及到打开网站后，一次性向服务器发送大量请求，所以有需求：当用户需要查看更多图片的时候再进行请求。

### 原理

1. 先将img标签的src链接设为同一张图片（比如空白图片），然后给img标签设置自定义属性（比如 data-src）,然后将真正的图片地址存储在data-src中。

2. 当JS监听到该图片元素进入可视窗口时，将自定义属性中的地址存储到src属性中。达到懒加载的效果。

<!-- more -->

### 例子

* HTML

  img图片引入地址为统一的一张图片，真正的地址存储在data-src中

``` html
    <div class="container">
        <img src="http://s4.sinaimg.cn/mw690/006uWPTUgy72CNFYNjB93&690" alt="1" data-src="http://img4.imgtn.bdimg.com/it/u=951914923,777131061&fm=26&gp=0.jpg">
        <img src="http://s4.sinaimg.cn/mw690/006uWPTUgy72CNFYNjB93&690" alt="1" data-src="http://img1.imgtn.bdimg.com/it/u=637435809,3242058940&fm=26&gp=0.jpg">
        <img src="http://s4.sinaimg.cn/mw690/006uWPTUgy72CNFYNjB93&690" alt="1" data-src="http://img1.imgtn.bdimg.com/it/u=3990342075,2367006974&fm=200&gp=0.jpg">
        <img src="http://s4.sinaimg.cn/mw690/006uWPTUgy72CNFYNjB93&690" alt="1" data-src="http://img1.imgtn.bdimg.com/it/u=1813891576,1754763093&fm=26&gp=0.jpg">
        <img src="http://s4.sinaimg.cn/mw690/006uWPTUgy72CNFYNjB93&690" alt="1" data-src="http://img4.imgtn.bdimg.com/it/u=2539922263,2810970709&fm=200&gp=0.jpg">
    </div>
```

* CSS

  ```CSS
      <style>
          .container{
              max-width: 800px;
              margin:0 auto;
          }
          .container:after{
              content:"";
              display: block;
              clear:both;
          }
          .container img{
              width:50%;
              height:260px;
              float:left;
          }
      </style>
  ```

* JS

  ```JS
          <script>
  
              // 一开始没有滚动的时候，出现在视窗中的图片也会加载
              start();
  
              // 当页面开始滚动的时候，遍历图片，如果图片出现在视窗中，就加载图片
              var clock; //函数节流
              $(window).on('scroll',function(){
                  if(clock){
                      clearTimeout(clock);
                  }
                  clock = setTimeout(function(){
                      start()
                  },200)
              })
              
              function start(){
                   $('.container img').not('[data-isLoading]').each(function () {
                      if (isShow($(this))) {
                          loadImg($(this));
                      }
                  })
              }
  
  
              // 判断图片是否出现在视窗的函数
              function isShow($node){
                  return $node.offset().top <= $(window).height()+$(window).scrollTop();
              }
  
              // 加载图片的函数，就是把自定义属性data-src 存储的真正的图片地址，赋值给src
              function loadImg($img){
                      $img.attr('src', $img.attr('data-src'));
  
                      // 已经加载的图片，我给它设置一个属性，值为1，作为标识
                      // 弄这个的初衷是因为，每次滚动的时候，所有的图片都会遍历一遍，这样有点浪费，所以做个标识，滚动的时候只遍历哪些还没有加载的图片
                      $img.attr('data-isLoading',1);
              }
  
          </script>
  ```

  

### js实现效果

```js	
            var clock; //函数节流            
            $(window).on('scroll',function(){
                if(clock){
                    clearTimeout(clock);
                }
                clock = setTimeout(function(){
                    start()
                },200)
            })
```

这里有用到一个节流函数，200ms只执行一次加载图片函数，里面有if的判断条件是延迟函数本身，当settimeout执行时，判断为真，当settimeout不执行，为假。

``` js	
            function start(){
                 $('.container img').not('[data-isLoading]').each(function () {
                    if (isShow($(this))) {
                        loadImg($(this));
                    }
                })
            }
```

.not 函数是jq的用法，是将对象循环，并且将符合条件的对象剔除出数组，这里data-isloading在图片的src改变后，后续有将其赋值为1了。

<meta name="referrer" content="no-referrer"/>

## 平滑上移到顶部 公共方法

### 完美平滑实现一个“回到顶部

在实际应用中，经常用到滚动到页面顶部或某个位置，一般简单用锚点处理或用js将document.body.scrollTop设置为0，结果是页面一闪而过滚到指定位置，不是特别友好。我们想要的效果是要有点缓冲效果。

现代浏览器陆续意识到了这种需求，scrollIntoView意思是滚动到可视，css中提供了scroll-behavior属性，js有Element.scrollIntoView()方法。

<!-- more -->

### scroll-behavior 纯CSS实现

**现在css支持了新的功能，scroll-behavior属性可取值auto|smooth|inherit|unset**

scroll-behavior: smooth;是我们想要的缓冲效果。在PC浏览器中，页面默认滚动是在<html>标签上，移动端大多数在<body>标签上，在我们想要实现平滑“回到顶部”，只需在这两个标签上都加上：

```css
html, body {
  scroll-behavior: smooth;
}
```

> 当然，这个实现方法现在支持度比较不友好

### Element.scrollIntoView() 新的方法

Element.scrollIntoView() 方法让当前的元素滚动到浏览器窗口的可视区域内。

**语法**

```js
element.scrollIntoView(); // 等同于element.scrollIntoView(true) 
element.scrollIntoView(alignToTop); // Boolean型参数 
element.scrollIntoView(scrollIntoViewOptions); // Object型参数
```

**参数** 

`alignToTop`可选

一个[`Boolean`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Boolean)值：

- 如果为`true`，元素的顶端将和其所在滚动区的可视区域的顶端对齐。相应的 `scrollIntoViewOptions: {block: "start", inline: "nearest"}`。这是这个参数的默认值。
- 如果为`false`，元素的底端将和其所在滚动区的可视区域的底端对齐。相应的`scrollIntoViewOptions: {block: "end", inline: "nearest"}`。

`scrollIntoViewOptions` 可选 

一个包含下列属性的对象：

- `behavior` 可选

  定义动画过渡效果， `"auto"`或 `"smooth"` 之一。默认为 `"auto"`。

- `block` 可选

  定义垂直方向的对齐， `"start"`, `"center"`, `"end"`, 或 `"nearest"`之一。默认为 `"start"`。

- `inline` 可选

  定义水平方向的对齐， `"start"`, `"center"`, `"end"`, 或 `"nearest"`之一。默认为 `"nearest"`。

**例子**

```js	
var element = document.getElementById("box");

element.scrollIntoView();
element.scrollIntoView(false);
element.scrollIntoView({block: "end"});
element.scrollIntoView({behavior: "instant", block: "end", inline: "nearest"});
```

> 当然，兼容性也是有问题的。

### 向下兼容

要达到所有浏览器都有相同（类似）效果，那就要把剩余不支持scroll-behavior属性的浏览器揪出来，用js去完成使命了。

**注意点**

1. 判断是否支持scroll-behavior属性

   ```js
   if(typeof window.getComputedStyle(document.body).scrollBehavior === 'undefined') {
     // 兼容js代码
   } else {
     // 原生滚动api
     // Element.scrollIntoView()
   }
   ```

2. 缓冲功能的实现

   原理：

   ```js	
   var position = position + (destination - position) / n;
   ```

3. 贴上代码

   ```js
   <script type="javascript">
     var scrollTopSmooth = function (position) {
     // 不存在原生`requestAnimationFrame`，用`setTimeout`模拟替代
     if (!window.requestAnimationFrame) {
       window.requestAnimationFrame = function (cb) {
         return setTimeout(cb, 17);
       };
     }
     // 当前滚动高度
     var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
     // step
     var step = function () {
       var distance = position - scrollTop;
       scrollTop = scrollTop + distance / 5;
       if (Math.abs(distance) < 1) {
         window.scrollTo(0, position);
       } else {
         window.scrollTo(0, scrollTop);
         requestAnimationFrame(step);
       }
     };
     step();
   }
   $backToTop = document.querySelector('.back-to-top')
   $backToTop.addEventListener('click', function () {
     scrollTopSmooth(0);
   }, false);   
   </script>
   ```

   ### 简单封装

   上面缓冲算法和当前滚动业务代码耦合在一起了，下面单独拆解出单独一个函数。

   ```js
   /**
   * 缓冲函数
   * @param {Number} position 当前滚动位置
   * @param {Number} destination 目标位置
   * @param {Number} rate 缓动率
   * @param {Function} callback 缓动结束回调函数 两个参数分别是当前位置和是否结束
   */
   
   var easeout = function (position, destination, rate, callback) {
     if (position === destination || typeof destination !== 'number') {
       return false;
     }
     destination = destination || 0;
     rate = rate || 2;
     // 不存在原生`requestAnimationFrame`，用`setTimeout`模拟替代
     if (!window.requestAnimationFrame) {
       window.requestAnimationFrame = function (fn) {
         return setTimeout(fn, 17);
       }
     }
     var step = function () {
       position = position + (destination - position) / rate;
       if (Math.abs(destination - position) < 1) {
         callback(destination, true);
         return;
       }
       callback(position, false);
       requestAnimationFrame(step);
     };
     step();
   }
   ```

   拆分后，这个小缓冲算法就可以被重复调用啦，而且，适用于滚动到指定位置（不仅仅是到顶部）和缓冲率（控制滚动快慢），当前小demo调用：

   ```js
   var scrollTopSmooth = function (position) {
     // 当前滚动高度
     var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
     easeout(scrollTop, position, 5, function (val) {
       window.scrollTo(0, val);
     });
   }
   $backToTop = document.querySelector('.back-to-top')
   $backToTop.addEventListener('click', function () {
     scrollTopSmooth(200);
   }, false);
   ```

   

**需要放入公共方法中去：**

在main.js中，可以将公共方法添加到vue的原型上去，从而在所有的页面都可以实现调用：

```html
import common from '@/comF/common.js'
Vue.prototype.common = common

import axios from 'axios'
Vue.prototype.axios = axios
```



## 函数防抖和节流/闭包

### 函数节流和防抖

函数节流：**所谓节流，就是指连续触发事件但是在 n 秒中只执行一次函数**

函数防抖：**所谓防抖，就是指触发事件后在 n 秒内函数只能执行一次，如果在 n 秒内又触发了事件，则会重新计算函数执行时间**

<!-- more -->

### 防抖例子

防抖函数分为非立即执行版和立即执行版。

**主要实现方式就是通过执行settimeout这个函数，每次触发延迟对应时间后再执行内部函数**

* 非立即执行防抖函数

```js
function debounce(func, wait) {
    let timeout;
    return function () {
        let context = this;
        let args = arguments;

        if (timeout) clearTimeout(timeout);
        
        timeout = setTimeout(() => {
            func.apply(context, args)
        }, wait);
    }
}
content.onmousemove = debounce(count,1000); //调用函数
```

* 立即执行防抖函数

```js
function debounce(func,wait) {
    let timeout;
    return function () {
        let context = this;
        let args = arguments;

        if (timeout) clearTimeout(timeout);

        let callNow = !timeout;
        timeout = setTimeout(() => {
            timeout = null;
        }, wait)

        if (callNow) func.apply(context, args)
    }
}
content.onmousemove = debounce(count,1000); //调用函数
```

* 双剑合璧版：

```js
function debounce(func,wait,immediate) {
    let timeout;

    return function () {
        let context = this;
        let args = arguments;

        if (timeout) clearTimeout(timeout);
        if (immediate) {
            var callNow = !timeout;
            timeout = setTimeout(() => {
                timeout = null;
            }, wait)
            if (callNow) func.apply(context, args)
        }
        else {
            timeout = setTimeout(function(){
                func.apply(context, args)
            }, wait);
        }
    }
}
```

### 节流例子

对于节流，一般有两种方式可以实现，分别是时间戳版和定时器版

**主要实现是通过定位时间差来判断是否执行函数**

* 时间戳

  ```js	
  function throttle(func, wait) {
      let previous = 0;
      return function() {
          let now = Date.now();
          let context = this;
          let args = arguments;
          if (now - previous > wait) {
              func.apply(context, args);
              previous = now;
          }
      }
  }
  content.onmousemove = throttle(count,1000);
  ```

* 定时器

  ```js	
  function throttle(func, wait) {
      let timeout;
      return function() {
          let context = this;
          let args = arguments;
          if (!timeout) {
              timeout = setTimeout(() => {
                  timeout = null;
                  func.apply(context, args)
              }, wait)
          }
  
      }
  }
  content.onmousemove = throttle(count,1000);
  ```

* 合并版本

  ```js	
  function throttle(func, wait ,type) {
      if(type===1){
          let previous = 0;
      }else if(type===2){
          let timeout;
      }
      return function() {
          let context = this;
          let args = arguments;
          if(type===1){
              let now = Date.now();
  
              if (now - previous > wait) {
                  func.apply(context, args);
                  previous = now;
              }
          }else if(type===2){
              if (!timeout) {
                  timeout = setTimeout(() => {
                      timeout = null;
                      func.apply(context, args)
                  }, wait)
              }
          }
      }
  }
  ```

### 区别

可以看到 ：**非立即执行防抖函数** 和 **定时器版节流函数** 比较相似。

> 主要区别是其中的判断条件：
>
> 1. 节流函数是**判断执行settime函数没有执行，则让settime函数执行，达到一定时间内只执行一次的目的**。
> 2. 防抖函数是**判断settime函数执行，则让settime函数再执行一次，达到每次触发都延迟**

### 原理

防抖是维护一个计时器，规定在delay时间后触发函数，但是在delay时间内再次触发的话，都会清除当前的 timer 然后重新设置超时调用，即重新计时。这样一来，只有最后一次操作能被触发。

节流是通过判断是否到达一定时间来触发函数，若没到规定时间则使用计时器延后，而下一次事件则会重新设定计时器。

## 防抖函数中的闭包

复制一份防止丢失

### debounce函数

debounce函数，俗称防抖函数，专治input、resize、scroll等频繁操作打爆浏览器或其他资源。前端面试几乎必考，当然肯定会做一些变化。

```js
  <script>
    var handler = function () {
      console.log(this, Date.now());
    }
    document.getElementById('input').addEventListener('input', handler);
  </script>
```

### 现状

用户每次输入操作都会触发handler调用，性能浪费。

### 目标

用户一直输入并不触发handler，直到用户停止输入500ms以上，才触发一次handler。

前提是，不修改原有的业务代码，且尽量通用。

### 思路

setTimeout实现计时
高阶函数，即function作为参数并且返回function
代码实现过程

### 第一版

```js
function debounce(fn, delay) {
  return function () {
    setTimeout(function () {
      fn();
    }, delay);
  }
}
```

给handler包上试试

document.getElementById('input').addEventListener('input', debounce(handler, 500));
明显不可以！！这样写只不过将每次触发都延时了500ms，并没有减少触发次数。不过我们至少实现了高阶函数，不会破坏原有的业务代码了。那么接下来就试着减少触发次数。

思路就是每次触发先clearTimeout把之前的计时器清掉，再重新setTimout。那么问题来了，第2次进来时，怎么获取到第1次的计时器，并清除呢？

### 第二版

```js	
function debounce(fn, delay) {
  var timer;
  return function () { // 闭包
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn();
    }, delay);
  }
}
```

试来试去，发现把timer放到“外面”最好（为什么不放到更外面？），每次调用进来，大家用的都是一个timer，完美。同时，我们的第一个主角登场了——闭包。

**闭包**
闭包就是能够读取其他函数内部变量的函数。例如在javascript中，只有函数内部的子函数才能读取局部变量，所以闭包可以理解成“定义在一个函数内部的函数“。在本质上，闭包是将函数内部和函数外部连接起来的桥梁。——百度百科

网上可以找个很多关于闭包的概念与解释，估计越看越蒙。认识事物需要一个从具象到抽象的过程，以目前的情况来看，我们只要知道，“定义在一个函数（外函数）内部的函数（内函数），并且内函数访问了外函数的变量，这个内函数就叫做闭包”。

最关键的问题，闭包有什么用？从debounce这个例子，我们可以看到，闭包可以让每次触发的handler共享一个变量，通常用到高阶函数的地方，就会用到闭包。再举几个闭包的应用场景，比如给ajax请求加缓存、加锁，为一系列回调设置初始值，防止污染全局或局部变量等。可能这么说大家还是若有若无的，没关系，实践出真知，现实当中肯定会碰到能够应用闭包的地方的。我们继续debounce。

终于解决了触发频率的问题了。但是！细心的同学肯定发现了。我们handler里的console打印出来的this，是不一样的！！！之前的this是input结点，现在的this是window对象。这绝对是不行的，比如我想要在handler里打印input的value，现在怎么做呢？

### 第三版

```js	
function debounce(fn, delay) {
  // 1
  var timer;
  return function () { // 闭包
    // 2
    var ctx = this; // this上下文
    clearTimeout(timer);
    timer = setTimeout(function () {
      // 3
      fn.apply(ctx); // this上下文调用
    }, delay);
  }
}
```

解决思路也简单，就是先把正确的this保存起来，我们在这里把this称为“上下文”，大家可以细细品味一下这个词。然后用apply（或call）重新制定一下fn的上下文即可。

**上下文this**
js的this是很善变的，谁调用它，它就指向谁，所以“上下文”这个词还是很贴切的。那么，为什么在2处能够得到正确的this呢？涉及到上下文切换的地方，一共有3处，已在上面代码中标了出来。我总结了一个三步定位this法：

第一步，是否立即执行？如果是，跳过第二步！

第二步，如果不是立即执行，它一定会被转交给某个对象保管，看它被挂在了哪，或者说转交给了谁！

第三步，这个执行函数挂在谁身上，谁就是this！

我们来实践一下。

第1处：

我们需要先简单处理一下，debounce其实是挂在window全局上的，写全应该是window.debounce(handler, 500)。第一步，是立即执行的！跳过第二步！第三步，debounce挂在window上！所以this指向是window。

第2处：

先简单处理下，debounce(handler, 500)的执行结果是返回一个函数，所以下面两段代码基本上可以视为等价的

```js
document.getElementById('input').addEventListener('input', debounce(handler, 500));

document.getElementById('input').addEventListener('input', function () { // 闭包
  // 2
  var ctx = this; // this上下文
  clearTimeout(timer);
  timer = setTimeout(function () {
    // 3
    fn.apply(ctx); // this上下文调用
  }, delay);
});
```



这么一看，就具体多了。第一步，不是立即执行；第二步，addEventListener是挂在dom上的方法，所以addEventListener只能把回调挂在dom上，可以理解成input.handler = function(){}，等行为被触发时才执行。所以它被转交给了input；第三步，handler挂在input上，所以this指向了input！

第3处：

setTimeout是挂在window上的，所以在执行的时候，实际上是window.setTimeout()。我们用伪代码模拟下setTimeout的实现

```js
window.setTimeout = function(fn, delay){
  // 因为不能立即执行，所以要找个地方挂fn，就只能把fn转交给它的主子window
  // 假设window存fn的属性叫setTimeoutHandler，与input.handler类似
  window.setTimeoutHandler = fn;
  // 等待delay毫秒……
  window.setTimeoutHandler(); // 执行
}
```

仔细理解一下，可以发现这里跟dom的回调非常像。第一步，不是立即执行；第二步，setTimeout是挂在window上的方法，所以只能转交给window的某个方法保管（假设叫setTimeoutHandler，名字不重要）；第三步，setTimeoutHandler挂在window上，所以this指向window。

稳妥起见，我们再加一个例子

```js
var obj = {
  test: function(){
    console.log(this);
  }
}
obj.test(); // obj
setTimeout(obj.test,1000); // window
```

第一个很简单，立即执行，不用转交。直接可以定位this指向了obj！

第二个非立即执行，虽然传进去的是obj.test，实际上需要转交给window.setTimeoutHandler保管，即window.setTimeoutHandler = obj.test。所以this指向的是window！

总之，碰到非立即执行的函数，需要仔细分析一下。

**debounce最终版**

```js
function debounce(fn, delay) {
  var timer;
  return function () { // 闭包
    var ctx = this; // this上下文
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(ctx, args); // this上下文调用
    }, delay);
  }
}
```

最后，我们再把传参也解决一下（arguments是默认的存储所有传参的类数组对象，时间关系这里就不展开了），完成。

### 总结

debounce是一个很实用也很经典的功能函数，每一行代码都有丰富的内涵。与其类似的还有throttle，可以查查巩固一下。本文主要是想借debounce这个实用的函数引出js当中的两个比较难理解，的点this和闭包。说实话，这两个点想讲明白很难，更靠谱的办法是用大量的实践来消化。本文算是给各位同学种下一颗种子，以后碰到类似的情况时，能够很快的想起本文的内容，帮助自己更好的理解与感悟。

<meta name="referrer" content="no-referrer"/>

## 冒泡，捕获与其阻止

### js addEventListener事件捕获与冒泡,第三个参数详解,阻止事件传播

**关键点**

> element.addEventListener(event, function[, useCapture])

1. event:事件名称,如click

2. function:指定要事件触发时执行的函数,可以传入事件参数

3. useCapture:可选。布尔值，指定事件是否在捕获或冒泡阶段执行。

   * 默认false:在冒泡阶段执行指定事件

   * true:在捕获阶段执行事件

4. event.stopPropagation():阻止事件传播,用于function(event){}中

   <!-- more -->

### 捕获与冒泡

图示：

![](https://img-blog.csdnimg.cn/20190122115236901.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2x5dF9hbmd1bGFyanM=,size_16,color_FFFFFF,t_70)

冒泡js代码：

```js
function print(e){
     console.log(this.id);
   }
   aa.addEventListener('click',print);//第三个参数默认为false
   bb.addEventListener('click',print);
   cc.addEventListener('click',print);
```

输出结果：

```js
cc
bb
aa
```

这个结果明显是从内到外去执行的，是冒泡阶段执行，因为默认的是false。

捕获js代码：

```js
 function print(e){
    console.log(this.id);
  }
  aa.addEventListener('click',print,true);//第三个参数默认为false
  bb.addEventListener('click',print,true);
  cc.addEventListener('click',print,true);
```

输出结果：

```js
aa
bb
cc
```

当改为true时，则要执行捕获阶段，从外到内去执行。

### 阻止传播行为

当有时候不需要点击激活所有的行为时，可以采用对应的方法阻止

js代码如下：

```js
 function print(e){
 	e.stopPropagation();//执行完此函数后,该事件不再继续传播
    console.log(this.id);
  }
  aa.addEventListener('click',print,true);//第三个参数默认为false
  bb.addEventListener('click',print,true);
  cc.addEventListener('click',print,true);
```

输出结果：

```js
aa
```

再点击cc时,捕获cc,执行cc的click函数, 因为print函数中有`e.stopPropagation()`,所以执行完该函数后,click事件不再传播.

### 取消默认事件

除了冒泡行为，有的时候还会遇到默认事件

什么元素有默认行为呢？如链接<a>，提交按钮<input type="submit">等。

**阻止默认事件**

```js
//假定有链接<a href="http://caibaojian.com/" id="testA" >caibaojian.com</a>
var a = document.getElementById("testA");
a.onclick =function(e){
if(e.preventDefault){
e.preventDefault();
}else{
window.event.returnValue == false;
}
}
```

### 总结

当需要停止冒泡行为时，可以使用：

```js
function stopBubble(e) { 
//如果提供了事件对象，则这是一个非IE浏览器 
if ( e && e.stopPropagation ) 
    //因此它支持W3C的stopPropagation()方法 
    e.stopPropagation(); 
else 
    //否则，我们需要使用IE的方式来取消事件冒泡 
    window.event.cancelBubble = true; 
}
```

当需要阻止默认行为时，可以使用:

```js
//阻止浏览器的默认行为 
function stopDefault( e ) { 
    //阻止默认浏览器动作(W3C) 
    if ( e && e.preventDefault ) 
        e.preventDefault(); 
    //IE中阻止函数器默认动作的方式 
    else 
        window.event.returnValue = false; 
    return false; 
}
```

<meta name="referrer" content="no-referrer"/>

## 浮动

float 属性定义元素在哪个方向浮动。以往这个属性总应用于图像，使文本围绕在图像周围，不过在 CSS 中，任何元素都可以浮动。
浮动元素会生成一个块级框，而不论它本身是何种元素。

```html
img
  {
  float:right;
  }
```

如果浮动非替换元素，则要指定一个明确的宽度；否则，它们会尽可能地窄。
***注释***：假如在一行之上只有极少的空间可供浮动元素，那么这个元素会跳至下一行，这个过程会持续到某一行拥有足够的空间为止。

## 清除浮动

### 浮动会带来什么影响？

浮动主要会影响页面的布局，给元素加上浮动后，元素会脱离文档流，从而导致以下的几个现象：

* 外层父级元素边框不能撑开;
* 外层父级元素背景不能显示;
* margin值不能正确显示;
  <!-- more -->
  图片如下:
  ![float](https://limengtupian.oss-cn-beijing.aliyuncs.com/float.jpg)
  代码如下：
  HTML

```html
<div class="outer">
    <div class="div1">1</div>
    <div class="div2">2</div>
    <div class="div3">3</div>
</div>
```

CSS

```css
.outer{border: 1px solid #ccc;background: #fc9;color: #fff; margin: 50px auto;padding: 50px;}
.div1{width: 80px;height: 80px;background: red;float: left;}
.div2{width: 80px;height: 80px;background: blue;float: left;}
.div3{width: 80px;height: 80px;background: sienna;float: left;}
```

### 如何清除浮动？

1. 添加新的元素 、应用 clear：both
   HTML

```html
<div class="outer">
    <div class="div1">1</div>
    <div class="div2">2</div>
    <div class="div3">3</div>
    <div class="clear"></div>
</div>
```

CSS

```css
.clear{clear:both; height: 0; line-height: 0; font-size: 0}
```

2. 父级div定义 overflow: auto（注意：是父级div也就是这里的  div.outer）
   HTML

```html
<div class="outer over-flow"> //这里添加了一个class
    <div class="div1">1</div>
    <div class="div2">2</div>
    <div class="div3">3</div>
    <!--<div class="clear"></div>-->
</div>
```

CSS

```css
.over-flow{
    overflow: auto; zoom: 1; //zoom: 1; 是在处理兼容性问题
}
```

***注意***:使用overflow属性来清除浮动有一点需要注意，overflow属性共有三个属性值：hidden,auto,visible。
我们可以使用hiddent和auto值来清除浮动，但切记不能使用visible值，如果使用这个值将无法达到清除浮动效果，其他两个值都可以，其区据说在于一个对seo比较友好，另个hidden对seo不是太友好，其他区别我就说不上了，也不浪费时间。

3. :after 方法：（注意：作用于浮动元素的父亲）
   HTML

```html
<div class="outer"> //这里添加了一个class
    <div class="div1">1</div>
    <div class="div2">2</div>
    <div class="div3">3</div>
    <!--<div class="clear"></div>-->
</div>
```

CSS

```css
.outer {zoom:1;}    /*==for IE6/7 Maxthon2==*/
.outer :after {clear:both;content:'.';display:block;width: 0;height: 0;visibility:hidden;}   /*==for FF/chrome/opera/IE8==*/
}
```

1) display:block 使生成的元素以块级元素显示,占满剩余空间;

2) height:0 避免生成内容破坏原有布局的高度。

3) visibility:hidden 使生成的内容不可见，并允许可能被生成内容盖住的内容可以进行点击和交互;

4）通过 content:"."生成内容作为最后一个元素，至于content里面是点还是其他都是可以的，例如oocss里面就有经典的 content:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",有些版本可能content 里面内容为空,一丝冰凉是不推荐这样做的,firefox直到7.0 content:”" 仍然会产生额外的空隙；

5）zoom：1 触发IE hasLayout。

通过分析发现，除了clear：both用来闭合浮动的，其他代码无非都是为了隐藏掉content生成的内容，这也就是其他版本的闭合浮动为什么会有font-size：0，line-height：0。

---

OVER......

<meta name="referrer" content="no-referrer"/>

## What is this？

你可能遇到过这样的 JS 面试题：

> ```html
> var obj = {
> foo: function(){
>  console.log(this)
> }
> }
> 
> var bar = obj.foo
> obj.foo() // 打印出的 this 是 obj
> bar() // 打印出的 this 是 window
> ```

<!-- more -->

JS（ES5）里面有三种函数调用形式：

```html
func(p1, p2) 
obj.child.method(p1, p2)
func.call(context, p1, p2) // 先不讲 apply
```

从看到这篇文章起，你一定要记住，第三种调用形式，才是正常调用形式：

> ```text
> func.call(context, p1, p2)
> ```

## 这样，this 就好解释了

this，就是上面代码中的 context。就这么简单。

this 是你 call 一个函数时传的 context，由于你从来不用 call 形式的函数调用，所以你一直不知道。

```html
var obj = {
  foo: function(){
    console.log(this)
  }
}

var bar = obj.foo
obj.foo() // 转换为 obj.foo.call(obj)，this 就是 obj
bar() 
// 转换为 bar.call()
// 由于没有传 context
// 所以 this 就是 undefined
// 最后浏览器给你一个默认的 this —— window 对象
```

## 更多的情况

1. Event Handler 中的 this“

   ```html
   btn.addEventListener('click' ,function handler(){
     console.log(this) // 请问这里的 this 是什么
   })
   ```

   > 通常来说this的值是触发事件的元素的引用，这种特性在多个相似的元素使用同一个通用事件监听器时非常让人满意。
   >
   > 当使用 addEventListener() 为一个元素注册事件的时候，句柄里的 this 值是该元素的引用。其与传递给句柄的 event 参数的 currentTarget 属性的值一样。

   > ```text
   > // 当事件被触发时
   > handler.call(event.currentTarget, event) 
   > // 那么 this 是什么不言而喻
   > ```

   **this**指向btn。

2. jQuery Event Handler 中的 this：

   ```html
   $ul.on(&#39;click&#39;, &#39;li&#39; , function(){
     console.log(this)
   })we
   ```

   文档：

   > 当jQuery的调用处理程序时，this关键字指向的是当前正在执行事件的元素。对于直接事件而言，this 代表绑定事件的元素。**对于代理事件而言，****this 则代表了与 selector** **相匹配的元素。**(注意，如果事件是从后代元素冒泡上来的话，那么 this 就有可能不等于 event.target。)若要使用 jQuery 的相关方法，可以根据当前元素创建一个 jQuery 对象，即使用 $(this)。

##  强制指定this的指向

```html
function handlerWrapper(event){
  function handler(){
    console.log(this) // 请问这里的 this 是什么
  }

  handler.call({name:'饥人谷'}, event)
}
btn.addEventListener('click', handlerWrapper)
```

## 内部函数的this指向

**构造函数版this：**

```
function Fn(){
    this.user = "追梦子";
}
var a = new Fn();
console.log(a.user); //追梦子
```

构造函数生成的this指向实例化的对象。

**setTimeOut()或setInterval()中的this**：

在setTimeOut()或setInterval()这样的方法中，如果传入的函数包含this, 那么，默认情况下，函数中的this会指向window对象。

改变的三种方式：

1. 将当前对象的this存为一个变量

   ```html
   function doClick(){
       var that = this;
       setInterval(function() {
         console.log(that.msg);
        }, 1000);
   }
   ```

2. 利用bind()方法

   ```html
   function doClick(){
       setInterval(function() {
         console.log(this.msg);
        }.bind(this), 1000);  //利用bind()将this绑定到这个函数上
   }
   ```

3. ES6的箭头函数

   ```html
   function doClick(){
        setInterval(() => {
          console.log(this.msg);
        }, 100);
    },
   ```

## 总结

**如何准确判断 this 指向的是什么？**

1 . 函数是否在 new 中调用 (new 绑定)，如果是，那么 this 绑定的是新创建的对象。

2 . 函数是否通过 call,apply 调用，或者使用了 bind(即硬绑定)，如果是，那么 this 绑定的就是指定的对象。

3 . 函数是否在某个上下文对象中调用 (隐式绑定)，如果是的话，this 绑定的是那个上下文对象。一般是 obj.foo()。

4 . 如果以上都不是，那么使用默认绑定。如果在严格模式下，则绑定到 undefined，否则绑定到全局对象。

5 . 如果把 Null 或者 undefined 作为 this 的绑定对象传入 call、apply 或者 bind，这些值在调用时会被忽略，实际应用的是默认绑定规则。

6 . 如果是箭头函数，箭头函数的 this 继承的是外层代码块的 this。