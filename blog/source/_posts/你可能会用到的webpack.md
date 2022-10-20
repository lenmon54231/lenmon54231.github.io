---
title: 你可能会用到的webpack
date: 2020-07-12 17:16:26
tags: [js, hexo]
---

<meta name="referrer" content="no-referrer"/>

## 你可能会用到的 webpack

### install

```js
npm install webpack webpack-dev-server --save-dev
```

### vue.config.js

`vue.config.js` 是一个可选的配置文件，如果项目的 (和 `package.json` 同级的) 根目录中存在这个文件，那么它会被 `@vue/cli-service` 自动加载。你也可以使用 `package.json` 中的 `vue` 字段，但是注意这种写法需要你严格遵照 JSON 的格式来写。

其中经常用到的配置是本地的代理和基本 path

```js
// vue.config.js

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {
  // 部署应用时的基本 URL
  publicPath: process.env.VUE_APP_PUBLIC,
  // build时构建文件的目录 构建时传入 --no-clean 可关闭该行为
  outputDir: 'dist',
  // build时放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录
  assetsDir: '',
  // 指定生成的 index.html 的输出路径 (相对于 outputDir)。也可以是一个绝对路径。
  indexPath: 'index.html',
  // 默认在生成的静态资源文件名中包含hash以控制缓存
  filenameHashing: true,
  // 构建多页面应用，页面的配置
  pages: {
    index: {
      // page 的入口
      entry: 'src/main.js',
      // 模板来源
      template: 'public/index.html',
      // 在 dist/index.html 的输出
      filename: 'index.html',
      // 当使用 title 选项时，template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'Index Page',
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'index'],
    },
    // 所有 webpack-dev-server 的选项都支持
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_PROXY,
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': '',
        },
      },
      '/mall': {
        target: process.env.VUE_APP_HOST1,
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/mall': '',
        },
      },
    },
  },
}
```

proxy 字段中的代理类似于 nginx 的代理。可以将'/api'或者'/mall'开头的请求通过代理定向到其他的地址，并且可以对代理的链接进行重新修改（pathRewrite），

配置典型的 env 文件(.env.development)，如下：

```js
NODE_ENV=development
VUE_APP_HOST=/api
VUE_APP_MALL_HOST=/mall
VUE_APP_HOST1=http://110.168.1.1:13008/
VUE_APP_PROXY=http://110.168.1.1:13008/mallB/
VUE_APP_DEBUG=development
```

请求文件类似如下：

```js
  getGoodsConfigList(query) { //商品配置数据列表查询
        return request({
            url: '/mall/goodsConfig/getGoodsConfigList',
            method: 'POST',
            ContentType: 'application/json',
            data: JSON.stringify(query)
        })
    },
```

```js
const service = axios.create({
  baseURL: host.host,
  timeout: 60000000,
});
service.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    config.headers = token
      ? { Authorization: "Bearer " + sessionStorage.getItem("token") }
      : "";

    if (config.ContentType) {
      config.headers["Content-Type"] = config.ContentType;
      delete config.ContentType;
    }
    if (
      //本地环境情况下，需要把login的host写死。避免频繁的切换host
      process.env.VUE_APP_DEBUG === "development" &&
      config.url.split("?")[0] == "/admin/login"
    ) {
      config.baseURL = process.env.VUE_APP_HOST;
    } else {
      //测试环境或者正式环境，需要将所有的host改成环境文件中的host
      switch (config.basicUrl) {
        case "/mall":
          config.baseURL = process.env.VUE_APP_HOST1;
          break;
        default:
          config.baseURL = process.env.VUE_APP_HOST;
          break;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject();
  }
);
```

### 本地处理跨域

当使用本地 Local Host 时，请求后端 Api 地址，会产生跨域。
除了以上用 devServer 的 proxy 去本地代理之外，另一个简单粗暴的方式是：

> 取消本地浏览器的跨域安全策略
> 在 Chrome 图标的属性》快捷方式》目标后，添加：--disable-web-security --user-data-dir=~/chromeTemp
