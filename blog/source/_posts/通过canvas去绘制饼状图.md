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
      this.drawEvent(item, endAngle); // 绑定事件
      this.setting.isLabel && this.drawText(item, { x, y }); //绘制鼠标移入得悬浮窗(Tooltip)

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

坐标系是直接绘制圆圈，一共从内到外，绘制 10 个圆圈构成的

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

todo

#### 自定义图形

todo

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
