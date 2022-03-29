---
title: 通过canvas去绘制饼状图
date: 2022-03-25 15:01:15
tags: [canvas, Chart]
---

## 通过 canvas 去绘制饼状图

图形是一个可以实现多层数据展示的饼状图，之前通过 G2 绘制过玫瑰图。现在改成了 canvas 绘制，记录如下

<!-- more -->

### 实现样式

![饼状图](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E9%A5%BC%E7%8A%B6%E5%9B%BE.png)

### 实现思路

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
        color: item === 10 ? 'rgba(50, 115, 242, 1)' : 'rgba(50, 115, 242, .8)',
        style: item === 10 ? 'stroke' : 'onlyArcStroke', // onlyArcStroke -- 仅作弧形描边， stroke -- 描边
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
      // 第18项扇形绘制时，渲染全部的图形（9个圆圈+第一项的扇形）
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
      // 第1到17项扇形绘制时，只渲染扇形
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

> 猜测：应该是通过 最后一项扇形的形式 来绘制坐标系的时候，覆盖了之前的十七个用来绑定事件的透明扇形图层导致。所以，只有最后一个第十八项扇形可以正常的显示 tooltip。

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

