---
title: 纯js实现上传视频，截取关键帧及全屏截图
date: 2020-07-12 17:16:26
tags: [js,hexo]
---

<meta name="referrer" content="no-referrer"/>

## 纯js实现上传视频，截取关键帧及全屏截图

Web端的截图(生成图片)并不算是个高频的需求，资料自然也不算多，查来查去，也不过Canvas 和 SVG两种实现方案，原理大概相似，都非真正义上的截图而是把DOM转为图片，然而实现方式却截然不同。

<!-- more -->

> context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);

### 需求

对上传的视频进行截图，生成对应帧图片。对网站页面进行截图

### 实现视频截图

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

2. 通过canvas转出img

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

### 实现网站截图

> import html2canvas from 'html2canvas'

`html2canvas.js`用法其实很简单，通常情况下只需传入需要转换的DOM对象就可以了

代码：定义公共方法

```js
import html2canvas from 'html2canvas'

export const shootAll = (dom) => {
  return new html2canvas(dom, {
    backgroundColor: '1',
    allowTaint: true,
    useCORS: true
  }).then((canvas) => {
    let canvasInfo = {
      width: canvas.getAttribute("width"),
      height: canvas.getAttribute("height"),
      url: canvas.toDataURL()
    }
    // canvas为转换后的Canvas对象
    return canvasInfo // 导出图片
  })
}
```

> 找到对应dom是关键，可以通过点击事件获取到e，e携带了全部的路径path，从path中可以获取到父级的dom，传入前做一下对象是否是dom的判断

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

