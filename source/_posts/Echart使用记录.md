---
title: Echart使用记录
date: 2020-07-12 17:16:26
tags: [echart]
---

<meta name="referrer" content="no-referrer"/>

## Echart使用记录

Apache ECharts (incubating)TM 是一个正在 [Apache Software Foundation](https://www.apache.org/) (ASF) 孵化中的项目。

<!-- more -->

### 需求

实现多折线图，柱状图，饼状图等等，需要可以点击图上的点来请求对应当前具体数据。并且可以通过不同的单位进行渲染。

### 安装

```js
npm install echarts --save
```

### 公共页面

新建一个公共页面echart.vue，方便后续调用

``` js
<template>
  <div style="padding:10px">
    <div :id="id" :style="{width: width, height: height}"></div>
  </div>
</template>

<script>
// 引入基本模板
let echarts = require("echarts/lib/echarts");
// 引入柱状图组件
require("echarts/lib/chart/bar");
require("echarts/lib/chart/line");
require("echarts/lib/chart/pie");
// 引入提示框和title组件
require("echarts/lib/component/tooltip");
require("echarts/lib/component/title");
require("echarts/lib/component/legend");
// require("echarts/config")
export default {
  name: "echart",
  mounted() {},
  data() {
    return {
      option: {},
      createdIt: false,
    };
  },
  watch: {
    //监听两个对象（1.横坐标的数据，2.纵坐标的数据）触发更新
    seriesData: function (n, o) {
      if (n.length > 0) {
        this.seriesData = n;
        this.refresh(n, 0);
      }
    },
    xAxisData: function (n, o) {
      if (n.length > 0) {
        this.xAxisData = n;
        this.refresh(n, 1);
      }
    },
  },
  props: {
    interval: {
      type: Number,
      default: null,
    },
    gridLeft: {
      type: Number,
      default: 60,
    },
    showXYxis: {
      type: Boolean,
      default: true,
    },
    labelPositon: {
      type: String,
      default: "top",
    },
    name: {
      type: String,
      default: null,
    },
    id: {
      type: String,
      default: null,
    },
    width: {
      type: String,
      default: null,
    },
    height: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
    xAxis: {
      type: String,
      default: null,
    },
    series: {
      type: String,
      default: null,
    },
    yAxis: {
      type: String,
      default: null,
    },
    tooltip: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: null,
    },
    value: {
      type: String,
      default: "value",
    },
    category: {
      type: String,
      default: "category",
    },
    isClick: {
      type: Boolean,
      default: true,
    },
    seriesData: {
      type: Array,
      default: () => [],
    },
    legendData: {
      type: Array,
      default: () => [],
    },
    xAxisData: {
      type: Array,
      default: () => [],
    },
    yAxisData: {
      type: Array,
      default: () => [],
    },
  },
  created() {},
  methods: {
    refresh(n, type) {
      this.option = {
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 0,
            end: 50,
          },
          {
            type: "inside",
            realtime: true,
            start: 0,
            end: 50,
          },
        ],
        legend: {
          data: this.legendData,//底部不同折线的文字说明
          bottom: 0,
          left: "center",
          textStyle: {
            color: "black",
          },
        },
        title: {
          text: this.title, //左上角title
          left: "center",
        },
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          show: this.showXYxis,//显示横坐标与否
          type: this.category,//横着显示还是竖着显示
          axisLabel: {
            interval: this.interval, //使x轴横坐标全部显示
          },
          data: [],
        },
        yAxis: { 
          show: this.showXYxis,//显示纵坐标与否
          type: this.value,//横着显示还是竖着显示
          data: this.yAxisData,
        },
        grid: {
          left: this.gridLeft,//左侧的文字占用的宽度
        },

        series: [],
      };
      if (type == 0) {
        this.$set(this.option.xAxis, "data", this.xAxisData);
        this.$set(this.option, "series", n);
      } else {
        this.$set(this.option.xAxis, "data", n);
        this.$set(this.option, "series", this.seriesData);
      }
      this.drawLine(this.option);
    },
    drawLine(option) {
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById(this.id));
      // 绘制图表
      myChart.setOption(option, true);
      myChart.resize();
      myChart.off("click");
      if (this.isClick) {
        myChart.on("click", (params) => {
          this.$emit("getEchartData", params);
        });
      }
    },
  },
};
</script>

<style scoped>
</style>
```

### 页面中引入

```js
       <div class="flexCenter">
          <echart
            v-if="EchartName == 'firstEchart'"
            @getEchartData="getEchartData"
            class="left"
            :id="leftid"
            :width="width"
            :height="height"
            :title="lefttitle"
            :type="lefttype"
            :seriesData="seriesData"
            :legendData="legendData"
            :xAxisData="xAxisData"
          ></echart>
        </div>
```

```
<script>
import echart from "@/components/common/echarts.vue";

export default {
  components: { echart },
  data() {
    return {
      name: "recorder",
      seriesData: [],
      labelPositon: "right",
      width: "100%",
      height: "400px",
      legendData: [
        "意见总反馈量",
        "页面报错",
        "投诉商家",
        "卡券领取使用问题",
        "未找到想要的商家",
        "其他",
      ],
      xAxisData: [], //根据请求拿到的横坐标（时间）
    };
  },
  created() {},
  computed: {},
  methods: {
    getData() {
    this.xAxisData.push(this.allxAxisData[i].x)
    this.seriesData = [
              {
                label: {
                  normal: {
                    show: true, //显示数字
                    position: "right", //这里可以自己选择位置
                    textStyle: {
                      color: "black", //顶部颜色
                    },
                  },
                },
                name: "意见总反馈量",
                overAnimation: false,
                type: "line", //折线还是柱状图
                data: allObject.yDataTem,
              },
              {
                label: {
                  normal: {
                    show: true, //显示数字
                    position: "right", //这里可以自己选择位置
                    textStyle: {
                      color: "black", //顶部颜色
                    },
                  },
                },
                name: "页面报错",
                overAnimation: false,
                type: "line", //折线还是柱状图
                data: allObject.pageErroDataTem,
              },
              {
                label: {
                  normal: {
                    show: true, //显示数字
                    position: "right", //这里可以自己选择位置
                    textStyle: {
                      color: "black", //顶部颜色
                    },
                  },
                },
                name: "投诉商家",
                overAnimation: false,
                type: "line", //折线还是柱状图
                data: allObject.complaintBusinessDataTem,
              },
              {
                label: {
                  normal: {
                    show: true, //显示数字
                    position: "right", //这里可以自己选择位置
                    textStyle: {
                      color: "black", //顶部颜色
                    },
                  },
                },
                name: "卡券领取使用问题",
                overAnimation: false,
                type: "line", //折线还是柱状图
                data: allObject.couponProblemDataTem,
              },
              {
                label: {
                  normal: {
                    show: true, //显示数字
                    position: "right", //这里可以自己选择位置
                    textStyle: {
                      color: "black", //顶部颜色
                    },
                  },
                },
                name: "未找到想要的商家",
                overAnimation: false,
                type: "line", //折线还是柱状图
                data: allObject.noBusinessFoundDataTem,
              },
              {
                label: {
                  normal: {
                    show: true, //显示数字
                    position: "right", //这里可以自己选择位置
                    textStyle: {
                      color: "black", //顶部颜色
                    },
                  },
                },
                name: "其他",
                overAnimation: false,
                type: "line", //折线还是柱状图
                data: allObject.otherDataTem,
              },
            ];
    }
  }
};
</script>
```

this.seriesData：包含具体的显示配置option，主要核心是y周的坐标，allObject.yDataTem包含了对应每个折线的y轴坐标，这个是后端给的。

this.xAxisData：横坐标，后端提供。

返回数据的格式类似如下，通过push进不同的数组进行渲染。

```js
[{complaintBusiness: 0,
couponProblem: 1,
noBusinessFound: 2,
other: 0,
pageErro: 1,
x: "2020-08-03-2020-08-09",
y: 4},{complaintBusiness: 0,
couponProblem: 0,
noBusinessFound: 1,
other: 0,
pageErro: 0,
x: "2020-08-10-2020-08-16",
y: 1,}]
```

### 核心

1. 需要监听数据的改变，从而触发echart视图的重新渲染，触发this.drawLine(this.option)

   ```js
   drawLine(option) {
         // 基于准备好的dom，初始化echarts实例
         var myChart = echarts.init(document.getElementById(this.id));
         // 绘制图表
         myChart.setOption(option, true);
         myChart.resize();
         myChart.off("click");
         if (this.isClick) {
           myChart.on("click", (params) => {
             this.$emit("getEchartData", params);
           });
         }
       },
   ```

   

2. 触发点击事件，传递对应的图表数据出去

   ```js
          myChart.on("click", (params) => {
             this.$emit("getEchartData", params);
           });
   ```

   