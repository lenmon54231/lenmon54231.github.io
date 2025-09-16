---
title: Canvas实现定制化图表
date: 2023-04-31 16:15:45
tags: [canvas]
---

## 通过 canvas 绘制双柱形图

<!-- more -->

### 实现样式

![双柱状图样式](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E5%8F%8C%E6%9F%B1%E5%9B%BE.png)

![横单柱状图样式](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E6%A8%AA%E6%9F%B1%E5%9B%BE.png)

![竖单柱状图样式](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E7%AB%96%E5%8D%95%E6%9F%B1%E5%9B%BE.png)

### 参考样式

实现步骤直接参考[通过 canvas 实现饼状图](https://lenmon54231.github.io/2022/03/25/%E9%80%9A%E8%BF%87canvas%E5%8E%BB%E7%BB%98%E5%88%B6%E9%A5%BC%E7%8A%B6%E5%9B%BE/)

![双柱状图样式](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E5%8F%8C%E6%9F%B1%E7%8A%B6%E5%9B%BE.png)

### 具体代码

> 代码如下:

> 父级使用

```js
    <template>
      <div ref="root">
        <canvas id="canvas"></canvas>
      </div>
    </template>

    nextTick(() => {
      drawPieChart.value = new DoubleBarChart({
        data: unref(canvasData),
        width: unref(800),
        height: unref(250),
        root: unref(root) as HTMLElement,
        setting: unref(setting),
        onEmit: (data: Source) => emit('onSelect', data),
      });
      drawPieChart.value?.init();
    });

```

> 双柱状图组件

```js
type dataObject = {
  id: number;
  title: string;
  color: string;
  total: number;
  pass: number;
  passColor: string;
  score: number;
  scoreColor: string;
  source: string;
};

export class DoubleBarChart {
  private width = 0;
  private height = 0;
  private data = [];
  private setting = {};
  private onEmit = () => {};
  private root: HTMLElement | null = null;
  private stage: any = null;

  private padding = [20, 20, 20, 40]; //幕布的边距（canvas的距离是从左上角开始）
  private paddingLeft = 0; // 双柱状图左侧距离起始坐标的距离
  private paddingRight = 0; // 双柱状图右侧距离起始坐标的距离
  private paddingTop = 0; // 双柱状图顶侧距离起始坐标的距离
  private paddingBottom = 0; // 双柱状图底侧距离起始坐标的距离
  private maxTotal = 0; // 整个data中最大的值，用来计算每个柱形的相对高度
  private totalHeight = 0; //坐标系（双柱状图）的高度
  private itemPadding = 20; // 每个柱形之间的间隔

  constructor(options) {
    const { data, width, height, root, setting, onEmit } = options;
    this.root = root; // w: canvas 父级元素
    this.width = width;
    this.height = height;
    this.totalHeight = this.height - this.padding[0] - this.padding[2];
    this.paddingLeft = Number(this.padding[3]);
    this.paddingRight = Number(this.width - this.padding[1]);
    this.paddingTop = Number(this.padding[0]);
    this.paddingBottom = Number(this.height - this.padding[2]);
    this.data = data;
    this.setting = setting;
    this.onEmit = onEmit;
    this.stage = window.omg({
      element: document.getElementById('canvas'),
      width: this.width,
      height: this.height,
      enableGlobalTranslate: false, // 关闭全局平移(可以用鼠标拖动canvas)
      enableGlobalScale: false, // 关闭全局缩放
    });
    if (this.stage) {
      this.stage.init(); // 初始化调用omg的方法
    }
  }
  init() {
    this.drawBase();
    this.stage?.show();
  }
  drawBase() {
    if (this.data.length === 0) {
      return;
    } else {
      this.bc();
      const bigOne: dataObject = this.data.sort(
        (a: dataObject, b: dataObject) => b.total - a.total,
      )[0];
      this.maxTotal = bigOne?.total;
      this.drawTick(); // 画刻度线
      this.data.forEach((item, index) => {
        this.drawTotalRectangle(item, index); // 画总分柱形
        this.drawCurrentRectangle(item, index); // 画当前分柱形
        this.drawPassLine(item, index); // 画通过率折线
        this.drawTitle(item, index); // 画标题
      });
    }
  }
  reset() {
    const canvas = this.root?.querySelector('#canvas');
    if (canvas) {
      const _canvas = document.createElement('canvas');
      _canvas.id = 'canvas';
      this.root?.removeChild(canvas);
      this.root?.appendChild(_canvas);
    }
  }
  // 画当前矩形背景图
  bc() {
    // 画背景
    const rect = this.stage.graphs.rectangle({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      radius: {
        tl: 6, // 左上
        tr: 6, // 右上
        bl: 6, // 左下
        br: 6, // 右下
      },
      color: '#fff',
    });
    this.stage.addChild(rect);
  }
  // 画刻度线
  drawTick() {
    // 画一条直线，包含横轴和纵轴
    const polyline = this.stage.graphs.line({
      matrix: [
        [this.paddingLeft, this.paddingTop],
        [this.paddingLeft, this.paddingBottom],
        [this.paddingRight, this.paddingBottom],
      ],
    });
    // 画十个纵轴刻度
    for (let index = 0; index < 10; index++) {
      const x = this.paddingLeft;
      const y = this.paddingTop + ((this.height - this.padding[0] - this.padding[2]) / 10) * index;
      const YNumber = Math.round(Number(this.maxTotal - (Number(this.maxTotal) / 10) * index));
      const YTick = this.stage.graphs.line({
        matrix: [
          [x, y],
          [x + 4, y],
        ],
      });
      const YTickText = this.stage.graphs.text({
        text: YNumber,
        x: x - 15,
        y: y - 5,
        width: 40,
        height: 40,
        color: '#000',
        fontSize: 8,
      });
      this.stage.addChild(YTickText);
      this.stage.addChild(YTick);
    }
    this.stage.addChild(polyline);
  }
  // 画总分
  drawTotalRectangle(item, index) {
    const x = this.paddingLeft + index * 40 + this.itemPadding; // 矩形的起始X坐标
    const height = this.totalHeight * (item.total / this.maxTotal); // 矩形的高度
    const y = this.paddingTop + this.totalHeight - height; // 矩形的起始Y坐标
    const rect = this.stage.graphs.rectangle({
      x: x,
      y: y,
      width: 10,
      height: height,
      radius: {
        tl: 2, // 左上
        tr: 2, // 右上
        bl: 0, // 左下
        br: 0, // 右下
      },
      color: item.scoreColor,
    });
    this.stage.addChild(rect);
  }
  // 画当前分
  drawCurrentRectangle(item, index) {
    const x = this.paddingLeft + 10 + index * 40 + this.itemPadding;
    const height = this.totalHeight * (item.total / this.maxTotal) * (item.score / item.total);
    const y = this.paddingTop + this.totalHeight - height;
    const rect = this.stage.graphs.rectangle({
      x: x,
      y: y,
      width: 10,
      height: height,
      radius: {
        tl: 2, // 左上
        tr: 2, // 右上
        bl: 0, // 左下
        br: 0, // 右下
      },
      color: item.color,
    });
    this.stage.addChild(rect);
  }
  // 画通过率线
  drawPassLine(item, index) {
    const leftX = this.paddingLeft - 5 + index * 40 + this.itemPadding;
    const Y =
      this.paddingTop +
      this.totalHeight * (1 - (item.total / this.maxTotal) * (item.pass / item.total));
    const rightX = this.paddingLeft + 25 + index * 40 + this.itemPadding;
    const polyline = this.stage.graphs.line({
      matrix: [
        [leftX, Y],
        [rightX, Y],
      ],
      color: item.passColor,
      lineWidth: 4,
      dash: [4],
    });
    this.stage.addChild(polyline);
  }
  // 画标题
  drawTitle(item, index) {
    const x = this.paddingLeft + index * 40 + this.itemPadding - 25;
    const y = this.paddingTop + this.totalHeight + 5;
    const text = this.stage.graphs.text({
      text: item.title,
      x: x,
      y: y,
      width: 40,
      color: '#000',
      fontSize: 8,
    });
    this.stage.addChild(text);
  }
}

```

### 添加动画

动画如下:

![双柱状图动画](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E5%8F%8C%E6%9F%B1%E7%8A%B6%E5%9B%BE%E5%8A%A8%E7%94%BB.gif)

#### 原理

柱状图定位是通过（x，y，width，height）定位，即:通过 x，y 确定左上角的起始点，然后通过 width 和 height 从上至下，从左至右绘制出矩形。

但是这不符合常见的图形库样式，即:从坐标轴 0 点开始逐渐升高。

所以采用 一个白色的柱形图 覆盖上，然后逐步 减少其高度，来实现 柱形图慢慢升高的动画

#### 代码如下

```js
  // 画总分
  drawTotalRectangle(item, index) {
    const x = this.paddingLeft + index * 40 + this.itemPadding; // 矩形的起始X坐标
    const height = this.totalHeight * (item.total / this.maxTotal); // 矩形的高度
    const y = this.paddingTop + this.totalHeight - height; // 矩形的起始Y坐标
    const rect = this.stage.graphs.rectangle({
      x: x,
      y: y,
      width: 10,
      height: height,
      // height: 0,
      radius: {
        tl: 2, // 左上
        tr: 2, // 右上
        bl: 0, // 左下
        br: 0, // 右下
      },
      color: item.scoreColor,
    });
    this.stage.addChild(rect); // 先画出正常的总分柱形图
    this.addAnimation(x, this.paddingTop, this.totalHeight - height); // 再画覆盖其上的白色柱形图
  }
  // 添加白色柱状图，以实现动画
  addAnimation(x, y, height) {
    const whiteRect = this.stage.graphs.rectangle({
      x: x,
      y: this.paddingTop,
      width: 10,
      height: this.totalHeight,
      radius: {
        tl: 2, // 左上
        tr: 2, // 右上
        bl: 0, // 左下
        br: 0, // 右下
      },
      color: '#fff',
    });
    whiteRect.animateTo({
      y: y,
      height: height,
    });
    this.stage.addChild(whiteRect);
  }
}
```

#### animateTo 函数说明

文档中没有说明 animateTo 函数的具体参数，只给了一个例子，大概用法如下:

```js
/**
 * @param: {keys | Object}   -- 动画结束时的值，是个对象
 * @param: {config | Object} -- 动画的一些配置项
 */
shape.animateTo(
  {
    moveX: 10,
    moveY: 10,
    radius: 100,
    startAngle: 360 / 18,
    endAngle: 360 / 18,
    x: 100,
    y: 100,
    width: 200,
    height: 200,
  },
  {
    duration: 1000, // 动画持续事件，默认 500 毫秒
    delay: 500, // 动画延迟的事件，默认 0 毫秒
    easing: "bounceOut", // 动画的补间类型，默认 'linear' （匀速）
    onStart: function (keys) {
      /**
       * @param: keys
       * keys是一个对象，存放着图形运动到当前的一些坐标和内部数据。
       * same below
       */
      console.log(keys.x, keys.y, keys.width, keys.height);
    },
    onUpdate: function (keys) {
      console.log(keys.x, keys.y, keys.width, keys.height);
    },
    onFinish: function (keys) {
      console.log(keys.x, keys.y, keys.width, keys.height);
    },
  }
);
```

- moveX:沿横坐标移动
- moveY:沿纵坐标移动
- radius: 沿半径方向移动（主要用于原型、扇形、圆弧）
- startAngle: 起始角度
- endAngle:结束角度
- 针对矩形的动画:
  x: 100,
  y: 100,
  width: 200,
  height: 200,
  通过改变 height 来实现矩形高度变化


### 实现样式

![雷达图](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E9%9B%B7%E8%BE%BE%E5%9B%BE.png)

![饼状图](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E9%A5%BC%E7%8A%B6%E5%9B%BE.png)

### 实现饼状图思路

#### 技能和文档

> 1、 [omg 文档](https://github.com/PengJiyuan/omg/blob/master/README.md)，2、 [canvas 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)，3、图表库使用经验，可以参考[G2 文档](https://antv-g2.gitee.io/zh/docs/api/general/chart)，逻辑比较相似

#### 总览

绘制顺序如下:

```js
  private drawBasic() {
    for (let index = 0; index < this.dataSource.length; index++) {
      const item: Source = this.dataSource[index];
      const endAngle = this.angle + 360 / this.dataSource.length;

      const { x, y } = this.drawTotal(item, endAngle); //绘制总分的扇形
      this.drawPass(item, endAngle); //绘制及格分的扇形
      this.drawScore(item, endAngle); //绘制得分的扇形
      this.drawTick(endAngle); //绘制刻度线
      this.drawEvent(item, endAngle); // 绑定事件，给出半透明蒙层和ToolTip的Dom显示逻辑
      this.setting.isLabel && this.drawText(item, { x, y }); //绘制周围的TitleLabel

      this.angle = endAngle; // w: 重置起始角度
    }
  }

```

#### 实现总分扇形（drawTotal-其他两个扇形类似）

```js
  private drawTotal(item: Source, endAngle: number) {
    const sector = this.stage?.graphs.arc({
      x: this.width / 2,
      y: this.height / 2,
      radius: this.radius,
      startAngle: this.angle,
      endAngle,
      color: item.color,
      strokeColor: 'rgba(50, 115, 242, .8)',
      lineWidth: 4,
      style: 'fill,stroke',
    });

    const pointLine = this.radius + 15;
    const sAngle = (Math.PI / 180) * this.angle;
    const eAngle = (Math.PI / 180) * endAngle;
    // s:计算每个扇形角度的一半
    const halfAngle = 0.5 * Math.PI + sAngle + (eAngle - sAngle) / 2;
    // s: 通过三角函数求出扇形顶点位置
    const x = Math.ceil(this.width / 2 + Math.sin(halfAngle) * pointLine);
    const y = Math.ceil(this.height / 2 - Math.cos(halfAngle) * pointLine);

    this.stage?.addChild(sector);
    this.drawList.push(sector);

    return { x, y };
  }
```

- this.stage?.graphs.arc：arc 代表扇形
- radius：扇形的半径
- startAngle,endAngle：扇形的起始角度和结束角度
  - 起始角度看起来是固定的 0，实际上每次循环后，都会将 endAngle 赋值到 startAngle
  - this.angle = endAngle; // w: 重置起始角度
- strokeColor：边框的颜色
- color: 填充颜色
- style: 'fill,stroke' // fill -- 填充， stroke -- 描边
  - 这里有改了源码用于支持同时传入两个样式 style，所以需要本地放置 omg.js 来实现
- this.stage?.addChild：将绘制的图形添加到待绘制列表中
- return { x, y }：返回 x，y 用来计算鼠标移入后，显示的 Tooltip 位置

![各种分数图片](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E6%80%BB%E5%88%86%E6%89%87%E5%BD%A2.png)

![各种分数图片](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E5%BE%97%E5%88%86%E6%89%87%E5%BD%A2.png)

![各种分数图片](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E5%8F%8A%E6%A0%BC%E5%88%86%E6%89%87%E5%BD%A2.png)

#### 圆心上的图片

通过 css 的绝对定位+after 内放置图形实现的

```less
&:after {
  --image-base: calc(var(--width) / 2.7 - var(--padding));
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--image-base);
  height: var(--image-base);
  transform: translate3d(-50%, -50%, 0);
  border-radius: 50%;
  background-image: url("/@/assets/images/energy/base@2x.jpeg");
  background-size: contain;
  background-position: center center;
  background-repeat: no-repeat;

  content: "";
}
```

#### 坐标系（刻度线）

```js
  private drawTick(endAngle: number) {
    for (let index = 0; index < this.tickMark.length; index++) {
      const item = this.tickMark[index];
      const arc = this.stage?.graphs.arc({
        x: this.width / 2,
        y: this.height / 2,
        radius: this.circleRadius * item + (this.setting.isImage ? this.radius / this.multiple : 0),
        startAngle: this.angle,
        endAngle,
        color: item === 0 ? 'rgba(50, 115, 242, 1)' : 'rgba(50, 115, 242, .8)',
        style: item === 0 ? 'fill' : 'stroke', // fill -- 填充， stroke -- 描边
        lineWidth: 4,
      });

      this.stage?.addChild(arc);
      this.drawList.push(arc);
    }
  }
```

坐标系是绘制扇形构成的，一共从内到外，绘制 10 个扇形构成的，所以一共要绘制 180 次扇形来形成极点坐标系。
当绘制第一个扇形时，直接采用的 fill 用来填充中心的颜色。

> 需要注意的是 radius 的计算

```js
this.radius = options.width / 2 - (this.setting.isLabel ? 95 : 20); // i: 40 为 canvas 内边距
if (this.setting.isImage) {
  this.circleRadius = (this.radius - this.radius / this.multiple) / 10;
} else {
  this.circleRadius = this.radius / 10;
} // i: 刻度线
multiple = 2.7; // 图表中心图片的缩小比例

radius = this.circleRadius * item + (this.setting.isImage ? this.radius / this.multiple : 0),
```

> this.circleRadius : 每一层圆圈的间隔
> (this.setting.isImage ? this.radius / this.multiple : 0):如果中心有图片 isImage，就会从半径/2.7 开始作为初始半径，一层层往外绘制，从而将中间空出来。

![刻度线图片](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E5%88%BB%E5%BA%A6%E7%BA%BF.png)

#### 合成上述组件实现饼状图

将上述的 各种得分图、坐标系图、中心图片 添加到幕布上，然后调用渲染方法，即生成饼状图

```js
this.drawBasic();
this.stage?.show();
```

#### 绑定事件

主要有三个事件：鼠标移入，鼠标移出，移动端的触摸点击
简化代码如下：

```js
const sector = this.stage?.graphs
      .arc({
        x: this.width / 2,
        y: this.height / 2,
        radius: this.radius,
        startAngle: this.angle,
        endAngle,
        color: 'transparent',
        style: 'fill',
      })
      .on('mouseenter', (cur: any) => {
        this.mutual(true, cur, data);
      })
      .on('mouseleave', (cur: any) => {
        this.mutual(false, cur, data);
      })
      .on('touchstart', (cur: any) => {
        this.mutual(true, cur, data);
        this.onEmit(data);
      });

    this.stage?.addChild(sector);
    this.drawList.push(sector);
  }
```

web 端为例：1、移入时，将显示半透明的蒙层，并在右侧显示对应的 tooltip；2、移出时，将其 remove 掉
简化代码如下：

```js
  private mutual(is: boolean, cur: any, data: Source) {
    if (is) {
      // 改成半透明
      this.stage.element.style.cursor = 'pointer';
      cur.color = 'rgba(255,255,255, 0.4)';
      cur.style = 'fill';
      this.stage?.redraw();
      // 生成一个tooltip的Dom
      const dom = this.createBubble(data);
      dom.style.display = 'block';
      this.currentCur = cur;
      this.root?.appendChild(dom);
    } else {
      // 改成透明
      this.stage.element.style.cursor = 'default';
      cur.color = 'transparent';
      cur.style = 'fill';
      this.stage?.redraw();
      // 移出对应Dom
      const dom = document.getElementById(`bubble-${data.id}`);
      if (dom) {
        dom.style.display = 'none';
        dom.parentNode?.removeChild(dom);
      }
    }
  }
```

mutual 主要做两件事

1. is 为 true 时：将 cur 当前的扇形从透明改成半透明，并且 createBubble 生成一个 tooltip 的 Dom 元素，添加到 root 父元素上
2. is 为 false 时： 将 cur 当前的扇形从半透明改成透明，并且从 root 移除 tooltip

> createBubble 是生成一个 Dom 元素，并且返回出去。Dom 元素通过 document.createElement('div')添加 InnerHTML 生成

#### 绘制移动端的 TitleLabel

圆形坐标系，周围生成的一圈 label，表示对应的 能力名称

```js
private drawText(item: Source, { x, y }) {
    const _x = x;
    const _y = y;
    const text = this.stage?.graphs.customDrawText({
      x: this.width / 2 > x ? _x - 4 : _x + 4,
      y: _y - 2,
      color: item.scoreColor,
      text: item.title,
      textAlign: this.width / 2 > x ? 'right' : 'left',
      textBaseline: 'bottom',
    });
    this.stage?.addChild(text);
    this.drawList.push(text);
  }
```

stage?.graphs.customDrawText 绘制文字，给出定位和文字排列位置

#### 可优化方向

可以看出 刻度线 是由 180 个扇形图组成的，实际上我们刻度线只需要渲染出弧形就行了。只要最后一个圆弧渲染成扇形就 ok
根据 canvas 的 api 可以看出，arc 本身是带有 弧形 的功能，即：

```js
//绘制120度的弧线，从弧线起点开始到弧线终点
ctx.beginPath();
ctx.moveTo(200, 400);
ctx.arc(100, 400, 100, (0 * Math.PI) / 180, (120 * Math.PI) / 180);
// ctx.closePath();
ctx.stroke();
```

与之相对应的是扇形：

```js
//绘制60度的扇形，顺时针绘制
ctx.beginPath();
ctx.moveTo(200, 200);
ctx.arc(200, 200, 100, (0 * Math.PI) / 180, (60 * Math.PI) / 180);
ctx.closePath();
ctx.stroke();
ctx.fillStyle = "yellow";
ctx.fill();
```

区别在于：弧形只调用了 ctx.stroke()，而扇形会 closePath()，然后.fill();

现在的项目主要是针对扇形，有多种需求：

1. 扇形-只描边（坐标系）- stroke
2. 扇形-同时描边和填充（总分扇形）-fill,stroke
3. 扇形-只填充（及格分扇形、得分扇形）-fill

但是，没有针对弧形做处理，并且已经将单独的 stroke 字段占据了。现在需要新增一个 style 字段：onlyArcStroke
修改 omg 源码如下：
before

```js
if (!isNaN(this.startAngle) && !isNaN(this.endAngle)) {
  canvas.arc(
    0,
    0,
    this.scaled_radius,
    (Math.PI / 180) * this.startAngle,
    (Math.PI / 180) * this.endAngle,
    false
  );
  canvas.save();
  canvas.rotate((Math.PI / 180) * this.endAngle);
  canvas.moveTo(this.scaled_radius, 0);
  canvas.lineTo(0, 0);
  canvas.restore();
  canvas.rotate((Math.PI / 180) * this.startAngle);
  canvas.lineTo(this.scaled_radius, 0);
} else {
  canvas.arc(0, 0, this.scaled_radius, 0, Math.PI * 2);
}
if (this.style === "fill,stroke") {
  canvas.fillStyle = this.color;
  canvas.fill();

  canvas.strokeStyle = this.strokeColor;
  canvas.lineWidth = this.lineWidth;
  canvas.stroke();
} else if (this.style === "fill") {
  canvas.fillStyle = this.color;
  canvas.fill();
} else {
  canvas.strokeStyle = this.color;
  canvas.stroke();
}
```

after

```js
if (this.style === "onlyArcStroke") {
  // 弧形
  canvas.arc(
    0,
    0,
    this.scaled_radius,
    (Math.PI / 180) * this.startAngle,
    (Math.PI / 180) * this.endAngle,
    false
  );
  canvas.strokeStyle = this.color;
  canvas.stroke();
} else {
  // 扇形
  if (!isNaN(this.startAngle) && !isNaN(this.endAngle)) {
    canvas.arc(
      0,
      0,
      this.scaled_radius,
      (Math.PI / 180) * this.startAngle,
      (Math.PI / 180) * this.endAngle,
      false
    );
    canvas.save();
    canvas.rotate((Math.PI / 180) * this.endAngle);
    canvas.moveTo(this.scaled_radius, 0);
    canvas.lineTo(0, 0);
    canvas.restore();
    canvas.rotate((Math.PI / 180) * this.startAngle);
    canvas.lineTo(this.scaled_radius, 0);
  } else {
    canvas.arc(0, 0, this.scaled_radius, 0, Math.PI * 2);
  }
  if (this.style === "fill,stroke") {
    canvas.fillStyle = this.color;
    canvas.fill();
    canvas.strokeStyle = this.strokeColor;
    canvas.lineWidth = this.lineWidth;
    canvas.stroke();
  } else if (this.style === "fill") {
    canvas.fillStyle = this.color;
    canvas.fill();
  } else {
    canvas.strokeStyle = this.color;
    canvas.stroke();
  }
}
```

当 style 为 onlyArcStroke 时，就只绘制圆弧，对应坐标轴绘制函数修改如下：

```js
  private drawTick(endAngle: number) {
    for (let index = 0; index < this.tickMark.length; index++) {
      const item = this.tickMark[index];
      const arc = this.stage?.graphs.arc({
        x: this.width / 2,
        y: this.height / 2,
        radius: this.circleRadius * item + (this.setting.isImage ? this.radius / this.multiple : 0),
        startAngle: this.angle,
        endAngle,
        color: item === 0 ? 'rgba(50, 115, 242, 1)' : 'rgba(50, 115, 242, .8)',
        style:  item === 0 ? 'fill' : item === 10 ? 'stroke' : 'onlyArcStroke', // onlyArcStroke -- 仅作弧形描边， stroke -- 描边
        lineWidth: 4,
      });

      this.stage?.addChild(arc);
      this.drawList.push(arc);
    }
  }
```

这样操作，可以避免通过渲染 180 个扇形实现坐标轴。而采用渲染 180-18 个圆弧+18 个扇形来生成坐标系

#### 失败的尝试 1-第一项扇形时绘制坐标系

基于此，还可以再次优化。如果用圆圈替换圆弧，则可以变成渲染 9 个圆圈+18 个扇形来生成坐标系，代码如下：

```js
   private drawTick(endAngle: number, dataSourceIndex: number) {
    let arc = null;
    console.log('dataSourceIndex: ', dataSourceIndex);
    if (dataSourceIndex === 0) {
      // 第1项扇形绘制时，渲染全部的图形（9个圆圈+第一项的扇形）
      for (let index = 0; index < this.tickMark.length; index++) {
        const item = this.tickMark[index];
        arc = this.stage?.graphs.arc({
          x: this.width / 2,
          y: this.height / 2,
          radius:
            this.circleRadius * item + (this.setting.isImage ? this.radius / this.multiple : 0),
          startAngle: item === 10 ? this.angle : 0,
          endAngle: item === 10 ? endAngle : 360,
          color: item === 10 ? 'rgba(50, 115, 242, 1)' : 'rgba(50, 115, 242, .8)',
          style: item === 10 ? 'stroke' : 'onlyArcStroke', // onlyArcStroke -- 仅作弧形描边， stroke -- 描边
          lineWidth: 4,
        });
        this.stage?.addChild(arc);
        this.drawList.push(arc);
      }
    } else {
      // 第2到18项扇形绘制时，只渲染扇形
      arc = this.stage?.graphs.arc({
        x: this.width / 2,
        y: this.height / 2,
        radius:
          this.circleRadius * this.tickMark[10] +
          (this.setting.isImage ? this.radius / this.multiple : 0),
        startAngle: this.angle,
        endAngle,
        color: 'rgba(50, 115, 242, 1)',
        style: 'stroke',
        lineWidth: 4,
      });
      this.stage?.addChild(arc);
      this.drawList.push(arc);
    }
  }
```

> 这种优化，会导致得分的扇形覆盖坐标系得颜色。跟之前通过 G2 引擎渲染图谱实现的效果的 bug 一致。
> 部分坐标系的横坐标轴丢失，如下图：

![优化失败尝试](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E4%BC%98%E5%8C%96%E5%A4%B1%E8%B4%A5%E5%B0%9D%E8%AF%95.png)

#### 失败的尝试 2-最后一项扇形时绘制坐标系

```js
    if (dataSourceIndex === 17) {
      ........
    }
```

> 将圆圈的绘制改成最后一项扇形时绘制，可以避免坐标系被 覆盖，但同时产生新的问题：弹窗 tooltip 只能在最外层的一圈显示，即：事件未绑定到整个扇形

![优化失败尝试2](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E5%A4%B1%E8%B4%A5er.png)

> 猜测：应该是通过 最后一项扇形的形式来绘制坐标系的时候，覆盖了之前的十七个用来绑定事件的透明扇形图层导致。所以，只有最后一个第十八项扇形可以正常的显示 tooltip。

#### 动画

饼状图动画主要是扇形，添加 radius 的变化即可

```js
  /**
   * @description 绘制得分扇形
   * @param item 数据项
   * @param endAngle 扇形结束角度
   */
  private drawScore(item: Source, endAngle: number) {
    const _radius = this.formatRadius(item.score, item.total, this.radius);
    const sector = this.stage?.graphs.arc({
      x: this.width / 2,
      y: this.height / 2,
      // radius: _radius,
      radius: 0,
      // startAngle: this.angle,
       startAngle: 0,
      endAngle,
      color: item.scoreColor,
      style: 'fill',
    });
    sector.animateTo(
      {
        radius: _radius,
        startAngle: this.angle,
      },
      {
        duration: 1000, // 动画持续事件，默认 500 毫秒
        delay: 200, // 动画延迟的事件，默认 0 毫秒
      },
    );
    this.stage?.addChild(sector);
    this.drawList.push(sector);
  }
```

#### 示例数据

```js
const data = ref([
  {
    id: 1,
    title: "多元学科通识",
    color: "rgba(255, 198, 50, 0.1)",
    pass: 1,
    passColor: "rgba(255, 198, 50, 0.4)",
    total: 2,
    score: 2,
    scoreColor: "rgba(255, 198, 50, 1)",
  },
  {
    id: 2, // 当前项的id
    title: "外语能力", // 当前项的名字
    color: "rgba(255, 198, 50, 0.1)", // 底色
    pass: 7, // 及格
    passColor: "rgba(255, 198, 50, 0.4)", // 及格颜色
    total: 10, // 满分
    score: 4, // 当前得分
    scoreColor: "rgba(255, 198, 50, 1)", // 得分颜色
  },
  {
    id: 3,
    title: "学术科研",
    color: "rgba(255, 198, 50, 0.1)",
    pass: 6,
    passColor: "rgba(255, 198, 50, 0.4)",
    total: 10,
    score: 2,
    scoreColor: "rgba(255, 198, 50, 1)",
  },
  {
    id: 4,
    title: "学习成绩",
    color: "rgba(255, 198, 50, 0.1)",
    pass: 7,
    passColor: "rgba(255, 198, 50, 0.4)",
    total: 10,
    score: 4,
    scoreColor: "rgba(255, 198, 50, 1)",
  },
  {
    id: 5,
    title: "学历层次",
    color: "rgba(255, 198, 50, 0.1)",
    pass: 7,
    passColor: "rgba(255, 198, 50, 0.4)",
    total: 10,
    score: 6,
    scoreColor: "rgba(255, 198, 50, 1)",
  },
  {
    id: 6,
    title: "学校档次",
    color: "rgba(255, 198, 50, 0.1)",
    pass: 7,
    passColor: "rgba(255, 198, 50, 0.4)",
    total: 10,
    score: 8,
    scoreColor: "rgba(255, 198, 50, 1)",
  },
  {
    id: 7,
    title: "行业专属职务能力",
    color: "rgba(255, 97, 163, 0.1)",
    pass: 7,
    passColor: "rgba(255, 97, 163, 0.4)",
    total: 10,
    score: 1,
    scoreColor: "rgba(255, 97, 163, 1)",
  },
  {
    id: 8,
    title: "行业通用职务能力",
    color: "rgba(255, 97, 163, 0.1)",
    pass: 7,
    passColor: "rgba(255, 97, 163, 0.4)",
    total: 20,
    score: 1,
    scoreColor: "rgba(255, 97, 163, 1)",
  },
  {
    id: 9,
    title: "语言表达能力",
    color: "rgba(76, 169, 255, 0.1)",
    pass: 7,
    passColor: "rgba(76, 169, 255, 0.4)",
    total: 10,
    score: 1,
    scoreColor: "rgba(76, 169, 255, 1)",
  },
  {
    id: 10,
    title: "人格魅力",
    color: "rgba(76, 169, 255, 0.1)",
    pass: 7,
    passColor: "rgba(76, 169, 255, 0.4)",
    total: 10,
    score: 2,
    scoreColor: "rgba(76, 169, 255, 1)",
  },
  {
    id: 11,
    title: "复杂任务执行能力",
    color: "rgba(76, 169, 255, 0.1)",
    pass: 7,
    passColor: "rgba(76, 169, 255, 0.4)",
    total: 10,
    score: 3,
    scoreColor: "rgba(76, 169, 255, 1)",
  },
  {
    id: 12,
    title: "复杂任务领导能力",
    color: "rgba(76, 169, 255, 0.1)",
    pass: 7,
    passColor: "rgba(76, 169, 255, 0.4)",
    total: 10,
    score: 4,
    scoreColor: "rgba(76, 169, 255, 1)",
  },
  {
    id: 13,
    title: "思维能力",
    color: "rgba(76, 169, 255, 0.1)",
    pass: 7,
    passColor: "rgba(76, 169, 255, 0.4)",
    total: 10,
    score: 5,
    scoreColor: "rgba(76, 169, 255, 1)",
  },
  {
    id: 14,
    title: "心理能量",
    color: "rgba(76, 169, 255, 0.1)",
    pass: 7,
    passColor: "rgba(76, 169, 255, 0.4)",
    total: 10,
    score: 6,
    scoreColor: "rgba(76, 169, 255, 1)",
  },
  {
    id: 15,
    title: "性格适配度",
    color: "rgba(76, 169, 255, 0.1)",
    pass: 7,
    passColor: "rgba(76, 169, 255, 0.4)",
    total: 10,
    score: 7,
    scoreColor: "rgba(76, 169, 255, 1)",
  },
  {
    id: 16,
    title: "形体魅力",
    color: "rgba(76, 169, 255, 0.1)",
    pass: 7,
    passColor: "rgba(76, 169, 255, 0.4)",
    total: 10,
    score: 8,
    scoreColor: "rgba(76, 169, 255, 1)",
  },
  {
    id: 17,
    title: "活动成果",
    color: "rgba(76, 169, 255, 0.1)",
    pass: 7,
    passColor: "rgba(76, 169, 255, 0.4)",
    total: 10,
    score: 9,
    scoreColor: "rgba(76, 169, 255, 1)",
  },
  {
    id: 18,
    title: "社团职务",
    color: "rgba(76, 169, 255, 0.1)",
    pass: 7,
    passColor: "rgba(76, 169, 255, 0.4)",
    total: 10,
    score: 10,
    scoreColor: "rgba(76, 169, 255, 1)",
  },
]);
```


### 实现思路

![柱状图](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/G2%E8%87%AA%E5%AE%9A%E4%B9%89%E6%9F%B1%E7%8A%B6%E5%9B%BE.png)

1. 普通的双柱状图已经有现成的案例：[双柱状图](https://antv-g2.gitee.io/zh/examples/interaction/element#element-highlight-by-x)
2. 上面缺少的就是每一个柱状需要增加一条横线
3. 寻找相似案例，发现如下案例：[带横线的双柱状图](https://antv-g2.gitee.io/zh/examples/column/basic#waterfall)，核心的代码如下：

   ```js
   // 自定义 Shape
   registerShape("interval", "waterfall", {
     draw(cfg, container) {
       const attrs = getFillAttrs(cfg);
       let rectPath = getRectPath(cfg.points);
       rectPath = this.parsePath(rectPath);

       const group = container.addGroup();
       group.addShape("path", {
         attrs: {
           ...attrs,
           path: rectPath,
         },
       });

       if (cfg.nextPoints) {
         let linkPath = [
           ["M", cfg.points[2].x, cfg.points[2].y],
           ["L", cfg.nextPoints[0].x, cfg.nextPoints[0].y],
         ];

         if (cfg.nextPoints[0].y === 0) {
           linkPath[1] = ["L", cfg.nextPoints[1].x, cfg.nextPoints[1].y];
         }
         linkPath = this.parsePath(linkPath);
         group.addShape("path", {
           attrs: {
             path: linkPath,
             stroke: "#8c8c8c",
             lineDash: [4, 2],
           },
         });
       }

       return group;
     },
   });

   chart.interval().position("type*money").shape("waterfall");
   ```

   可以通过改造 group 里的 path 路径来实现一个 line 的路径，X 和 Y 的定位就可以从 cfg 的 point 中获取

4. 利用上面的逻辑，可以改造我们双柱状图试试。

   ```js
   registerShape("interval", "fall-flag", {
     draw(cfg, container) {
       // console.log('cfg: ', cfg);
       const group = container.addGroup();
       let type = cfg?.data?.type;
       let currentColor = getDarkColorByName[type];
       let maxHeight =
         (Number(cfg?.y) - 35) / (1 - Number(cfg?.points[1].y)) + 35;
       let coordinateHeight = maxHeight - 35;
       let height =
         Number(cfg?.y) +
         coordinateHeight *
           Number(cfg?.points[1].y) *
           (1 - Number(cfg.data.coefficient));
       if (cfg?.points[1].y == 1) {
         height = Number(cfg?.y);
       }
       group.addShape("path", {
         attrs: {
           // ...cfg,
           path: [
             // ['M', (cfg?.x as number) - 40, cfg?.y as number],
             // ['L', (cfg?.x as number) + 40, cfg?.y as number],
             ["M", cfg?.x - 30, height],
             ["L", cfg?.x + 30, height],
           ],
           stroke: checkIndex < 9 ? currentColor : "transparent",
           // stroke: currentColor,
           lineDash: [4, 2],
           lineWidth: 2,
         },
       });
       // console.log('group: ', group);
       checkIndex++;
       return group;
     },
   });

   chart
     .interval() // 画出柱状图
     .position("type*value") // 柱状图定位
     .color("color", (value) => {
       let arr = value.split("&");
       if (arr[1] == "满分") {
         return getDarkColorByName[arr[0]];
       } else {
         return getLightColorByName[arr[0]];
       }
     }) //通过color区分颜色
     .label("value") // 柱子顶上的文字
     .size("20")
     .adjust([
       {
         type: "dodge",
         marginRatio: 0,
       },
     ]);

   chart.interval().position("type*value").shape("fall-flag");
   ```

   可以看到上面的代码，是渲染了两次 chart 的 interval 方法。
   本质上实现方式是：第一次 chart.interval()渲染出了双柱状图，第二次渲染 shape("fall-flag")只是渲染了一个只有柱状体最上面一根横线的一个双柱状图！

### 完整代码

```js
let paddingOption = [35, 35, 55, 35];
let chart = null;

const getDarkColorByName = {
  Jan: "#6970FF",
  Feb: "#6970FF",
  Mar: "#6970FF",
  Apr: "#6970FF",
  May: "#FF6600",
  Jun: "#FF6600",
  Jul: "#FF6600",
  Aug: "#00B4C3",
};
const getLightColorByName = {
  Jan: "rgb(105,112,255,.1)",
  Feb: "rgb(105,112,255,.1)",
  Mar: "rgb(105,112,255,.1)",
  Apr: "rgb(105,112,255,.1)",
  May: "rgb(255,102,0,.1)",
  Jun: "rgb(255,102,0,.1)",
  Jul: "rgb(255,102,0,.1)",
  Aug: "rgb(0,180,195,.1)",
};

const initChart = () => {
  let checkIndex = 1;
  // 实例化对象
  chart = new Chart({
    container: "DoubleHistogramContainer",
    // autoFit: true,
    width: 600,
    height: 280,
    padding: paddingOption,
  });

  // 加载数据
  // chart.data(data);
  chart.data([
    { color: "Jan&满分", type: "Jan", value: 38.9, coefficient: 0.8 },
    { color: "Feb&满分", type: "Feb", value: 28.8, coefficient: 0.2 },
    { color: "Mar&满分", type: "Mar", value: 39.3, coefficient: 0.4 },
    { color: "Apr&满分", type: "Apr", value: 100, coefficient: 1 },
    { color: "May&满分", type: "May", value: 30, coefficient: 0.8 },
    { color: "Jun&满分", type: "Jun", value: 60, coefficient: 0.8 },
    { color: "Jul&满分", type: "Jul", value: 34, coefficient: 0.8 },
    { color: "Aug&满分", type: "Aug", value: 35.6, coefficient: 0.4 },
    { color: "Jan&得分", type: "Jan", value: 12.4, coefficient: 0.8 },
    { color: "Feb&得分", type: "Feb", value: 23.2, coefficient: 0.8 },
    { color: "Mar&得分", type: "Mar", value: 34.5, coefficient: 0.8 },
    { color: "Apr&得分", type: "Apr", value: 12, coefficient: 0.8 },
    { color: "May&得分", type: "May", value: 15.6, coefficient: 0.8 },
    { color: "Jun&得分", type: "Jun", value: 25.5, coefficient: 0.8 },
    { color: "Jul&得分", type: "Jul", value: 17.4, coefficient: 0.8 },
    { color: "Aug&得分", type: "Aug", value: 22.4, coefficient: 0.8 },
  ]);

  registerShape("interval", "fall-flag", {
    draw(cfg, container) {
      // console.log('cfg: ', cfg);
      const group = container.addGroup();
      let type = cfg?.data?.type;
      let currentColor = getDarkColorByName[type];
      let maxHeight =
        (Number(cfg?.y) - 35) / (1 - Number(cfg?.points[1].y)) + 35;
      let coordinateHeight = maxHeight - 35;
      let height =
        Number(cfg?.y) +
        coordinateHeight *
          Number(cfg?.points[1].y) *
          (1 - Number(cfg.data.coefficient));
      if (cfg?.points[1].y == 1) {
        height = Number(cfg?.y);
      }
      group.addShape("path", {
        attrs: {
          // ...cfg,
          path: [
            // ['M', (cfg?.x as number) - 40, cfg?.y as number],
            // ['L', (cfg?.x as number) + 40, cfg?.y as number],
            ["M", cfg?.x - 30, height],
            ["L", cfg?.x + 30, height],
          ],
          stroke: checkIndex < 9 ? currentColor : "transparent",
          // stroke: currentColor,
          lineDash: [4, 2],
          lineWidth: 2,
        },
      });
      // console.log('group: ', group);
      checkIndex++;
      return group;
    },
  });

  // 度量（就是点击图片上面会浮现一些内容：内容就通过下面的配置项配置）
  chart.scale("value", {
    min: 0,
    alias: "数值",
    //该数据字段的显示别名，一般用于将字段的英文名称转换成中文名。
  });
  chart.legend(false);
  // chart.legend('type', {
  //   position: 'right',
  // });
  // 配置 type 对应坐标轴线
  chart.axis("type", {
    tickLine: {
      // 是否同刻度线对齐，如果值为 false，则会显示在两个刻度中间。
      alignTick: true,
    },
    label: { autoEllipsis: false, offset: 12, autoHide: false }, //横坐标上的文字
    // title: { spacing: 2 }, // 横着的坐标轴下面的文字（即type）
  });
  // 配置 value 对应坐标轴线
  chart.axis("value", {
    label: {
      offset: 12,
    },
    // title: {}, // 竖着的坐标轴下面的文字（即"数值"）
    tickLine: {
      // 是否同刻度线对齐，如果值为 false，则会显示在两个刻度中间。
      alignTick: true,
    },
  });
  chart.tooltip({
    showContent: false, // 关闭 tooltip content部分dom
  });
  chart
    .interval() // 画出柱状图
    .position("type*value") // 柱状图定位
    .color("color", (value) => {
      let arr = value.split("&");
      if (arr[1] == "满分") {
        return getDarkColorByName[arr[0]];
      } else {
        return getLightColorByName[arr[0]];
      }
    }) //通过color区分颜色
    .label("value") // 柱子顶上的文字
    .size("20")
    .adjust([
      {
        type: "dodge",
        marginRatio: 0,
      },
    ]);

  chart.interval().position("type*value").shape("fall-flag");

  // 开始渲染
  chart.render();
};

initChart();
```

