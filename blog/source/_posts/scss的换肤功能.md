---

title: scss的换肤功能
date: 2020-07-12 17:16:26
tags: [js,hexo]
---

<meta name="referrer" content="no-referrer"/>

## scss的换肤功能

### scss配置文件

变量的定义文件_handle.scss

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

主题色配置文件_themes

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

### 引入使用功能

在app.vue中通过设置data数据来判断当前主题色，

```js
    window.document.documentElement.setAttribute('data-theme', 'orange')
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
  @include border_color('font_color1');
}
</style>
```

@include background_color和@include box_shadow这些变量都是通过handle文件来定义的。

注意：border这类需要多个维度来判断的class，只需要改变其中的颜色部分。会自动覆盖对应之前定义的border中的颜色#486cdc