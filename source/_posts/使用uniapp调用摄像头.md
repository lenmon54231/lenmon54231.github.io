---
title: 使用uniapp调用摄像头
date: 2020-07-12 17:16:26
tags: [js,hexo]
---

<meta name="referrer" content="no-referrer"/>

##  使用uniapp配合H5+调用摄像头进行核销

团购优惠券类型app，有完整的券码生成、保存、校验、核销系统，使用uni开发的app需要提供核销界面的定制开发

<!-- more -->

> 需求：打开核销扫码页面，除了正常的摄像头、闪光灯和相册选项之外，还需要额外加上核销记录和手动核销文字和跳转功能

### uni提供的摄像头核销接口

uni已经封装好了摄像头扫码的接口，即

```js
uni.scanCode(OBJECT)

// 允许从相机和相册扫码
uni.scanCode({
    success: function (res) {
        console.log('条码类型：' + res.scanType);
        console.log('条码内容：' + res.result);
    }
});

// 只允许通过相机扫码
uni.scanCode({
    onlyFromCamera: true,
    success: function (res) {
        console.log('条码类型：' + res.scanType);
        console.log('条码内容：' + res.result);
    }
});

// 调起条码扫描
uni.scanCode({
    scanType: ['barCode'],
    success: function (res) {
        console.log('条码类型：' + res.scanType);
        console.log('条码内容：' + res.result);
    }
});
```

接口本身回调用摄像头，分别对应不同的样式和功能，但是不提供添加文件和跳转功能的配置项，需要寻找自定义的扫码功能

### 强大的H5+标准协议

HTML5+可以实现绝大多数开发中需要的功能，宣传页中有提到过 HTML5+有超过40万+的api（doge），常用的如二维码、语音输入、摇一摇、摄像头、文件系统、微信分享等功能，

1. 环境说明

   ```js
   uni-app,vue,开发app（不考虑H5、小程序等兼容）
   ```

2. 代码说明

   1. 初始化

      ```js
      init方法：
      var pages = getCurrentPages() //获取当前的页面
      var page = pages[pages.length - 1] //获取当前的页面
      
       // #ifdef APP-PLUS
            plus.navigator.setFullscreen(true) //全屏
            var currentWebview = page.$getAppWebview()
            this.createBarcode(currentWebview) //创建二维码窗口
            this.createView(currentWebview) //创建操作按钮及tips界面
      // #endif
      ```

      初始化的时候，首先获取当前页面，然后直接调用plus对象上的全屏方法设置全屏（plus对象即HTML5+提供的全局对象，当用uni开发app时，plus对象是可以默认直接调用的），创建二维码窗口，再创建操作按钮及tips界面

   2. 创建二维码

      ```js
      plus.barcode.create
      ```

      也是plus提供的标准api，可以创建一个自定义大小和颜色等的二维码窗口，配置项比较多，可以通过手册去查看配置项

      ```js
       barcode.setFlash(this.flash)
       currentWebview.append(barcode)
       barcode.start()
      ```

      设置闪光灯、再将生成的二维码dom添加到当前页面上去、开始扫描二维码并作出动画等

   3. 创建按钮和文字并绑定事件

      第二步的时候，已经有扫码的界面的样式动画等功能了，但是我们需要定制相册的位置和icon、手电筒的样式和icon并需要添加两个对应的文字链接和跳转功能

      ```js
      createView(currentWebview) {
         var toPhotoAlbum = new plus.nativeObj.View(
              'toPhotoAlbum',
              {
                top: '70%',
                left: '80%',
                height: '10%',
                width: '20%',
              },
              [
                {
                  tag: 'img',
                  id: 'scanBar',
                  src: 'static/2.0x/ic-picture@2x.png',
                  position: {
                    width: '40%',
                    left: '30%',
                    height: '36%',
                  },
                },
                {
                  tag: 'font',
                  id: 'font',
                  text: '相册',
                  textStyles: {
                    size: '16px',
                    color: '#ffffff',
                  },
                  position: {
                    width: '80%',
                    left: '10%',
                  },
                },
              ]
            )
      }
      ```

      以其中的一个相册功能举例，

      首先，生成一个dom对象

      ```js
      new plus.nativeObj.View
      ```

      里面可以配置dom大小、图片、位置、字体等等

      然后添加触摸穿透事件的拦截

      ```js
      interceptTouchEvent(true)
      ```

      1参考：[HTML5+中原生对象说明](https://www.dcloud.io/docs/api/zh_cn/nativeobj.html)

      然后将dom添加到页面上去

      ```js
      currentWebview.append(toPhotoAlbum)
      ```

      并在dom上绑定对应的事件

      ```js
       toPhotoAlbum.addEventListener('click', (e) => {
              plus.gallery.pick(
                (path) => {
                  console.log(path)
                  plus.barcode.scan(
                    path,
                    (type, result) => {
                      // console.log('本地相册的数据', result)
                      this.getCouponInfo(result)
                    },
                    (e) => {
                      console.log('Scan failed: ' + JSON.stringify(e))
                    }
                  )
                },
                (e) => {
                  console.log('取消选择图片')
                },
                { filter: 'image' }
              )
            })
      ```

      至此，样式的功能已经梳理完毕，同理，可以添加手电筒功能、跳转功能等等。

   4. 扫码成功的回调

      当使用手机扫码后，需要根据二维码拿到对应扫码结果，即二维码代表的字符串

      创建二维码时候，绑定了一个事件onmarked，即扫码的回调事件

      ```js
      barcode.onmarked = this.onmarked
      ```

      ```js
      // 扫码成功回调
          onmarked(type, result) {
            console.log(result)
          },
      ```

      拿到对应的扫码结果后，自然可以做下一步的跳转核销等功能

   5. 完整代码如下：

      ```js
      <template>
        <view class="warpBC">
        </view>
      </template>
      ```

      ```js
      var barcode = null
      export default {
        data() {
          return {
            name: '', //要在扫码界面自定义的内容
            flash: false, //是否打开摄像头
            type: '',
            options: null, //传过来的配置
          }
        },
        onLoad(d) {
          console.log('出世法')
          this.options = JSON.parse(JSON.stringify(d))
            ? JSON.parse(JSON.stringify(d))
            : { type: 'scan-listener' }
          if (uni.getStorageSync('checkFirstHX')) {
            console.log('已经初始化过了')
          } else {
          }
          this.init(this.options)
        },
        onShow() {
          console.log('onshow出世法')
          if (uni.getStorageSync('checkFirstHX')) {
            //   this.init(this.options)
          } else {
            console.log('要通过onshow来执行')
          }
        },
        methods: {
          toOtherPage() {
            this.$u.toast('1秒后重新跳转至扫码页面，请稍等')
            uni.redirectTo({
              url: '/pages/HXassistant/HXassistant',
            })
          },
          getCouponInfo() {
          },
          init(d) {
            this.type = d.type ? d.type : 'scan-listener'
            var pages = getCurrentPages()
            var page = pages[pages.length - 1]
            // #ifdef APP-PLUS
            plus.navigator.setFullscreen(true) //全屏
            var currentWebview = page.$getAppWebview()
            this.createBarcode(currentWebview) //创建二维码窗口
            this.createView(currentWebview) //创建操作按钮及tips界面
            // #endif
            uni.setStorageSync('checkFirstHX', true)
          },
          // 扫码成功回调
          onmarked(type, result) {
            console.log(result)
            var text = '未知: '
            switch (type) {
              case plus.barcode.QR:
                text = 'QR: '
                break
              case plus.barcode.EAN13:
                text = 'EAN13: '
                break
              case plus.barcode.EAN8:
                text = 'EAN8: '
                break
            }
      
            this.getCouponInfo(result)
          },
          // 创建二维码窗口
          createBarcode(currentWebview) {
            barcode = plus.barcode.create('barcode', [plus.barcode.QR], {
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              scanbarColor: '#1DA7FF',
              position: 'static',
              frameColor: '#1DA7FF',
            })
            barcode.onmarked = this.onmarked
            barcode.setFlash(this.flash)
            currentWebview.append(barcode)
            barcode.start()
          },
          // 创建操作按钮及tips
          createView(currentWebview) {
            //相册
            var toPhotoAlbum = new plus.nativeObj.View(
              'toPhotoAlbum',
              {
                top: '70%',
                left: '80%',
                height: '10%',
                width: '20%',
              },
              [
                {
                  tag: 'img',
                  id: 'scanBar',
                  src: 'static/2.0x/ic-picture@2x.png',
                  position: {
                    width: '40%',
                    left: '30%',
                    height: '36%',
                  },
                },
                {
                  tag: 'font',
                  id: 'font',
                  text: '相册',
                  textStyles: {
                    size: '16px',
                    color: '#ffffff',
                  },
                  position: {
                    width: '80%',
                    left: '10%',
                  },
                },
              ]
            )
            //创建下方的两个图标
            var toHXrecoder = new plus.nativeObj.View(
              'toHXrecoder',
              {
                top: '90%',
                left: '30%',
                height: '10%',
                width: '30%',
              },
              [
                {
                  tag: 'font',
                  id: 'font',
                  text: '核销记录',
                  textStyles: {
                    size: '16px',
                    color: '#ffffff',
                  },
                  position: {
                    width: '80%',
                    left: '10%',
                  },
                },
              ]
            )
            var toHXByHand = new plus.nativeObj.View(
              'toHXByHand',
              {
                top: '90%',
                left: '0%',
                height: '10%',
                width: '30%',
              },
              [
                {
                  tag: 'font',
                  id: 'font',
                  text: '输码核销',
                  textStyles: {
                    size: '16px',
                    color: '#ffffff',
                  },
                  position: {
                    width: '100%',
                    left: '10%',
                  },
                },
              ]
            )
            // 创建返回原生按钮
            var backVew = new plus.nativeObj.View(
              'backVew',
              {
                top: '34px',
                left: '5px',
                height: '40px',
                width: '20%',
              },
              [
                {
                  tag: 'img',
                  id: 'backBar',
                  src: 'static/2.0x/backBar.png',
                  position: {
                    top: '2px',
                    left: '10px',
                    width: '35px',
                    height: '35px',
                  },
                },
              ]
            )
            // 创建打开手电筒的按钮
            var scanBarVew = new plus.nativeObj.View(
              'scanBarVew',
              {
                top: '70%',
                left: '40%',
                height: '10%',
                width: '20%',
              },
              [
                {
                  tag: 'img',
                  id: 'scanBar',
                  src: 'static/2.0x/scanBar.png',
                  position: {
                    width: '28%',
                    left: '36%',
                    height: '30%',
                  },
                },
                {
                  tag: 'font',
                  id: 'font',
                  text: '轻触照亮',
                  textStyles: {
                    size: '16px',
                    color: '#ffffff',
                  },
                  position: {
                    width: '80%',
                    left: '10%',
                  },
                },
              ]
            )
            // 创建展示类内容组件
            var content = new plus.nativeObj.View(
              'content',
              {
                top: '0px',
                left: '0px',
                height: '100%',
                width: '100%',
              },
              [
                {
                  tag: 'font',
                  id: 'scanTitle',
                  text: '扫码',
                  textStyles: {
                    size: '20px',
                    color: '#ffffff',
                  },
                  position: {
                    top: '34px',
                    left: '0px',
                    width: '100%',
                    height: '40px',
                  },
                },
              ]
            )
            toPhotoAlbum.interceptTouchEvent(true)
            toHXrecoder.interceptTouchEvent(true)
            toHXByHand.interceptTouchEvent(true)
            backVew.interceptTouchEvent(true)
            scanBarVew.interceptTouchEvent(true)
            currentWebview.append(content)
            currentWebview.append(scanBarVew)
            currentWebview.append(backVew)
            currentWebview.append(toHXrecoder)
            currentWebview.append(toHXByHand)
            currentWebview.append(toPhotoAlbum)
            toPhotoAlbum.addEventListener('click', (e) => {
              plus.gallery.pick(
                (path) => {
                  console.log(path)
                  plus.barcode.scan(
                    path,
                    (type, result) => {
                      // console.log('本地相册的数据', result)
                      this.getCouponInfo(result)
                    },
                    (e) => {
                      console.log('Scan failed: ' + JSON.stringify(e))
                    }
                  )
                },
                (e) => {
                  console.log('取消选择图片')
                },
                { filter: 'image' }
              )
            })
            toHXrecoder.addEventListener(
              'click',
              (e) => {
                let path = {
                  path: 'HXrecoder',
                }
                uni.navigateTo({
                  url: '/pages/HXassistant/temPage' + commonFun.joint(path),
                })
                barcode.close()
                plus.navigator.setFullscreen(false)
              },
              false
            )
            toHXByHand.addEventListener(
              'click',
              (e) => {
                uni.navigateTo({
                  url: '/pages/HXassistant/HXByHand',
                })
                barcode.close()
                plus.navigator.setFullscreen(false)
              },
              false
            )
            backVew.addEventListener(
              'click',
              (e) => {
                console.log('1111111')
                // 返回按钮
                uni.switchTab({
                  url: '/pages/index/index',
                  success: (res) => {},
                  fail: () => {},
                  complete: () => {},
                })
                barcode.close()
                plus.navigator.setFullscreen(false)
              },
              false
            )
            var temp = this
            scanBarVew.addEventListener(
              'click',
              (e) => {
                //点亮手电筒
                temp.flash = !temp.flash
                if (temp.flash) {
                  scanBarVew.draw([
                    {
                      tag: 'img',
                      id: 'scanBar',
                      src: 'static/2.0x/yellow-scanBar.png',
                      position: {
                        width: '28%',
                        left: '36%',
                        height: '30%',
                      },
                    },
                    {
                      tag: 'font',
                      id: 'font',
                      text: '轻触照亮',
                      textStyles: {
                        size: '10px',
                        color: '#ffffff',
                      },
                      position: {
                        width: '80%',
                        left: '10%',
                      },
                    },
                  ])
                } else {
                  scanBarVew.draw([
                    {
                      tag: 'img',
                      id: 'scanBar',
                      src: 'static/2.0x/scanBar.png',
                      position: {
                        width: '28%',
                        left: '36%',
                        height: '30%',
                      },
                    },
                    {
                      tag: 'font',
                      id: 'font',
                      text: '轻触照亮',
                      textStyles: {
                        size: '10px',
                        color: '#ffffff',
                      },
                      position: {
                        width: '80%',
                        left: '10%',
                      },
                    },
                  ])
                }
                if (barcode) {
                  barcode.setFlash(temp.flash)
                }
              },
              false
            )
          },
        },
        onBackPress(options) {
          // #ifdef APP-PLUS
          // 返回时退出全屏
          barcode.close()
          plus.navigator.setFullscreen(false)
          // #endif
          console.log(options)
          if (options.from == 'backbutton') {
            uni.switchTab({
              url: '/pages/index/index',
              success: (res) => {},
              fail: () => {},
              complete: () => {},
            })
          }
          return true
        },
        onUnload() {
          plus.navigator.setFullscreen(false)
        },
      }
      ```

      ```js
      <style scoped>
      .warpBC {
        background-color: white;
        min-height: 100vh;
        min-width: 100vw;
      }
      </style>
      ```

      

      