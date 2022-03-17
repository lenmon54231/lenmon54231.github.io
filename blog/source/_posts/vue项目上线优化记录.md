---
title: vue项目上线优化记录
date: 2020-03-12 17:16:26
tags: [vue,优化]
---

<meta name="referrer" content="no-referrer"/>

## vue项目上线优化记录

项目上线，没有进行备案，所以需要架设于境外服务器，所有访问速度较慢，现在记录所作优化步骤：

1. 引用线上地址
2. 将静态资源放置于网络存储
3. 精灵图减少请求
4. 服务器开通gzip
5. 路由懒加载

<!-- more -->

### 引用线上地址

使用的是bootstrap，之前是通过下载到本地，然后引用，当build的时候，会将其一并打包，所以导致js文件过大，所以直接将引用地址改为网络请求，这样，打包后的文件会减小很多。

> <script src="https://cdn.staticfile.org/jquery/3.2.1/jquery.min.js"></script>
> <script src="https://cdn.staticfile.org/popper.js/1.15.0/umd/popper.min.js"></script>
> <script src="https://cdn.staticfile.org/twitter-bootstrap/4.3.1/js/bootstrap.min.js"></script>
> <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css">

### 将静态资源放置于网络存储

网站的大部分图片都不会改动，所以将其上传到oss网络存储然后直接引用网络地址，这里采用的是北京的oss，这样从服务器请求的时候是从北京地区请求的图片，相对速度会快一些。

> background-image: url("https://limengtupian.oss-cn-beijing.aliyuncs.com/%E9%A6%96%E9%A1%B5%E7%B2%BE%E7%81%B5%E5%9B%BE/img.png");

### 精灵图减少请求

每一张图片都会发起一次请求，所以对于一些常用的小图标，我们一般都会将其做成一张图，然后通过定位的方式，显示出其中的一部分，这样的图片就是精灵图。

### 服务器开通gzip

gzip可以直接再服务端的时候，就对要传输的数据先进行一次压缩，减少传输数据的体积，这个概念跟下载游戏文件的时候一般下载下来的都是压缩包是类似的，然后再客户端的浏览器上，会进行解压处理，这样就大大减少了文件体积，减少的传输速度。

由于是采用的vue-cli 3.0 ，查阅网上资料发现，通过3.0去构建的项目，是默认的开启gzip的，那么只需要再服务器上的配置文件修改。

采用的是nginx，所以找到对应的conf文件(/usr/local/nginx/conf)，修改如下：

> http {
>
>   gzip on;
>
>   gzip_min_length 1k;
>
>   gzip_buffers 4 16k;
>
>   \#gzip_http_version 1.0;
>
>   gzip_comp_level 6;
>
>   gzip_types text/plain application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
>
>   gzip_vary off;
>
>   gzip_disable "MSIE [1-6]\.";
>
> }

再次请求，可以通过谷歌浏览器-F12-network-点击任意文件-header内的request header中，可以看到：

**Accept-Encoding**：gzip

已经是通过了zip压缩的文件了，体积明显缩小

### 路由懒加载

单页面应用是会再首页加载的时候将所有的页面直接加载完成，所以会出现首页加载较长的情况，这样就需要采用懒加载，当页面被点击的时候再加载。那么，配置如下：

在router中配置如下：

> export default {
>
>   path: '/home',
>
>   component: () => import('@/views/Home.vue')
>
> }

将其component修改成了() => import('@/views/Home.vue')。

但是现在**路由懒加载不生效**，因为cli 3.0 是直接默认会把所有通过import()按需加载的javascript文件加上 prefetch 。

**关闭prefetch:** (官网示例)

```html	

// vue.config.js
module.exports = {
  chainWebpack: config => {
    // 移除 prefetch 插件
    config.plugins.delete('prefetch')
 
    // 或者
    // 修改它的选项：
    config.plugin('prefetch').tap(options => {
      options[0].fileBlacklist = options[0].fileBlacklist || []
      options[0].fileBlacklist.push(/myasyncRoute(.)+?\.js$/)
      return options
    })
  }
```

prefetch链接会消耗宽带，如果是在移动端，而且存在大量的chunk，那么可以关掉 prefetch 链接，手动选择要提前获取的代码区块。

```html
//手动选定要提前获取的代码
import(webpackPrefetch: true, './someAsyncComponent.vue')
```

## vue-cli上线 代理接口报404 修改conf

前言： 项目使用vue-cli直接生成项目，然后使用proxyTable接口代理后， 在本地调用后台接口，一切正常，但是后期打包上线时，发现页面接口报404，后找到解决办法为：

找到nginx 的conf文件，打开后，修改里面的配置如下：

```html
    server {
        listen       80;//监听80端口
        server_name  localhost;
        location / {
            root   html;
            index  index.html index.htm;
            try_files $uri $uri/ /index.html; //vue单页面应用，不能刷新，所有会设置这个，避免404
        }
        location /v2/ {
            proxy_set_header X-Real-IP $remote_addr;
            proxy_pass  http://douban.uieee.com;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
}
```

里面主要添加的配置为：

```html
        location /v2/ {
            proxy_set_header X-Real-IP $remote_addr;
            proxy_pass  http://douban.uieee.com;
        }
```

这个/v2/监听，实际上就是我api调用的名字，这个可以在你的vue.config.js里可以去设置：

```html	
module.exports = {
    //axios域代理，解决axios跨域问题
    devServer: {
        proxy: {
            '/v2': {
                target: 'https://douban.uieee.com',
                changeOrigin: true,
                ws: true,
            }
        }
    }
}
```

我请求的api格式如下：

> https://douban.uieee.com/v2/movie/top250?start=0&count=12

提供的api文档里面可以看到，所有的api都带有一个相同的字符/v2/。

所以以这个字符为关键字来修改代理。

<meta name="referrer" content="no-referrer"/>


## 初始化设置和环境搭建（neginx,centOS，vue的环境搭建）/GitHub相关

### 安装node.js

一般来讲, 可以用以下三种方式安装 Node.js：

- 通过安装包安装(Windows 和 Mac 用户推荐)
- 通过源码编译安装(Linux用户推荐)
- 在 Linux 下可以通过 yum|apt-get 安装

1. 通过安装包安装：

2. 源码编译安装：

   <!-- more -->

   Linux用户：

   ```
   curl -O https://nodejs.org/dist/v6.10.3/node-v6.10.3.tar.gz
   tar -xzvf node-v6.10.3.tar.gz
   cd  node-v6.10.3
   ./configure
   make
   make install
   ```

### 安装cnpm镜像（可选择）

   [淘宝 NPM 镜像](https://npm.taobao.org/)是一个完整 npmjs.org 镜像，你可以用此代替官方版本(只读)，同步频率目前为 10分钟 一次以保证尽量与官方服务同步。

   ```
   npm install -g cnpm --registry=https://registry.npm.taobao.org 
   cnpm install [name]
   ```

### 使用vue-cli

   1. 安装

      如果用npm下载速度慢，可以使用cnpm.

      ```
      npm install -g vue-cli
      ```

   2. init初始模板

      目前可用的模板包括：

      - [browserify](https://github.com/vuejs-templates/browserify)–全功能的Browserify + vueify，包括热加载，静态检测，单元测试

      - [browserify-simple](https://github.com/vuejs-templates/browserify-simple)–一个简易的Browserify + vueify，以便于快速开始。

      - [webpack](https://github.com/vuejs-templates/webpack)–全功能的Webpack + vueify，包括热加载，静态检测，单元测试

      - [webpack-simple](https://github.com/vuejs-templates/webpack-simple)–一个简易的Webpack + vueify，以便于快速开始。

      - [simple](https://github.com/vuejs-templates/simple) - 单个HTML文件中最简单的Vue设置

        ```
        vue init <template-name> <project-name>
        ```

   3. 运行项目

      1. 我们的项目选择webpack,使用以下命令:

      ```
      vue init webpack vue-todos
      ```

      2. 输入下面的命令就可以运行这个项目了:

         ```
         cd vue-todos
         npm install
         npm run dev
         ```

## CentOS7安装Nginx

## 安装所需环境

Nginx 是 C语言 开发，建议在 Linux 上运行，当然，也可以安装 Windows 版本，本篇则使用 [CentOS](http://www.linuxidc.com/topicnews.aspx?tid=14) 7 作为安装环境。

顺序如下：

1. **gcc 安装**

   ```
   yum install gcc-c++
   ```

2. **PCRE pcre-devel 安装**

   ```
   yum install -y pcre pcre-devel
   ```

3. **zlib 安装**

   ```
   yum install -y zlib zlib-devel
   ```

4. **OpenSSL 安装**

   ```
   yum install -y openssl openssl-devel
   ```

5. 下载`.tar.gz`安装包

   ```
   wget -c https://nginx.org/download/nginx-1.12.0.tar.gz
   ```

6. 解压

   ```
   tar -zxvf nginx-1.12.0.tar.gz
   cd nginx-1.12.0
   ```

7. **配置**

   ```
   ./configure
   ```

8. 编译安装

   ```
   make
   make install
   ```

9. 启动、停止nginx

   ```
   cd /usr/local/nginx/sbin/
   ./nginx 
   ./nginx -s stop
   ./nginx -s quit
   ./nginx -s reload
   ```

10. 重启 **nginx**

    ```
    cd /usr/local/nginx/sbin/
    ./nginx -s reload
    ```

## CSS Tools: Reset CSS重置css

浏览器自带的css属性，一般需要重置，记录如下：



```html
/* http://meyerweb.com/eric/tools/css/reset/ 
   v2.0 | 20110126
   License: none (public domain)
*/

html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed, 
figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure, 
footer, header, hgroup, menu, nav, section {
	display: block;
}
body {
	line-height: 1;
}
ol, ul {
	list-style: none;
}
blockquote, q {
	quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
}
```

## vs code插件记录(更新中)

vscode会使用比较多的插件，记录：

1. Auto Close Tag（补充标签）
2. Auto Rename Tag（修改标签）
3. Chinese (Simplified) Language Pack for VS Code
4. Debugger for Chrome
5. Open in Browser
6. Prettier（格式化）
7. Vetur（智能提示补全代码）
8. vscode-icons（美化icon）
9. Bracket Pair Colorizer（括号颜色，快速识别括号位置）

### 记录：

* Vetur

  使用scss的时候，会遇到vetur报错的情况：

  ```html
  <style lang="scss" scoped>
      @keyframes glitch-one {
    @for $i from 20 to 30 {
      #{$i / 2}% {
        left: #{randomNum(200, -100)}px;
        clip-path: inset(#{randomNum(150, 30)}px 0 #{randomNum(150, 30)}px);
      }
    }
    }
  ```

  比如上面的这种情况，就会有红色波浪线提示，但是在浏览器中是正确的。所以需要配置如下：

  1. 文件》首选项》设置

  2. 右上角三个选项的第一个（打开设置Json）

  3. 在大括号内添加最后四行（跟vetur相关的配置）

     ```html
     {
         "workbench.iconTheme": "vscode-icons",
         "[html]": {
             "editor.defaultFormatter": "vscode.html-language-features"
         },
         "open-in-browser.default": "chrome",
         "explorer.confirmDragAndDrop": false,
         "window.zoomLevel": 1,
         "[javascript]": {
             "editor.defaultFormatter": "vscode.typescript-language-features"
         },
         "explorer.confirmDelete": false,
         "vsicons.dontShowNewVersionMessage": true,
         "editor.fontSize": 20,
         "[css]": {
             "editor.defaultFormatter": "esbenp.prettier-vscode"
         },
         "vetur.validation.template": false,
         "vetur.experimental.templateInterpolationService": false,
         "vetur.validation.style": false,
         "vetur.validation.script": false,
     }
     ```

     

## GitHub相关问题

GitHub是一个面向[开源](https://baike.baidu.com/item/开源/20720669)及私有[软件](https://baike.baidu.com/item/软件/12053)项目的托管平台，因为只支持git 作为唯一的版本库格式进行托管，故名GitHub。

## 初始设置github

记录开始使用GitHub中三点注意：

1. 注册账号会验证邮箱，而163邮箱不能接受验证邮件

   ***注意***：注册需要设置邮箱，需要选用qq邮箱或者gmail邮箱，163邮箱发现不能接收到GitHub的邮件！

   新的库，需要设置sshkeys

   1. 检查是否有sshkeys

      ```
      ~/.ssh
      ```

   2. 创建ssh

      首先创建一个SSH，在Git Bash中输入

      ``` 
      $ ssh-keygen -t rsa -C “你的邮箱”
      ```

      然后他就会显示这两行

      ``` 
      Generating public/private rsa key pair.
      Enter file in which to save the key (/c/Users/16627/.ssh/id_rsa):
      ```

      这是让你输入一个文件名，用于保存刚才生成的 SSH key 代码。如果你不输入，直接回车，那么就会默认生成id_rsa和id_rsa.pub两个秘钥文件（如下提示）。

      ```
      Created directory ‘/c/Users/16627/.ssh’.
      ```

      紧接着又会提示你

      ``` 
      Enter passphrase (empty for no passphrase):
      Enter same passphrase again:
      ```

      接着又会提示你输入两次密码（该密码是你push文件的时候要输入的密码，而不是github管理者的密码），当然你还可以不输入密码，直接按回车。那么fetch和push的时候就不需要输入密码。

      ![chegngong](https://img-blog.csdn.net/20180118114145818?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

      已经创建成功

      ![chenggong](https://img-blog.csdn.net/20180118115923234?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

   3. 添加ssh到GitHub

      按照以下的步骤操作：

      ![1](https://img-blog.csdn.net/20180118120316317?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

      ![2](https://img-blog.csdn.net/20180118120349241?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

      ![3](https://img-blog.csdn.net/20180118120556118?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

      title随便给他起个名字就好。然后是key，这时候你要打开你刚才在电脑上的SSH key。刚才提示你建立的那段文字有SSH key的地址，按照地址找到你的文件，用记事本**打开id_rsa.pub文件，全选其中的内容粘贴到网页的Key中即可。**

      ![4](https://img-blog.csdn.net/20180118121323658?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

      ![5](https://img-blog.csdn.net/20180118121457269?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

      **然后你就会受到建立成功的邮件了。**

      ![6](https://img-blog.csdn.net/20180118121751176?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzY2NjcxNzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

   4. 测试一下ssh key

      在git Bash 中输入以下代码：

      ```
      ssh -T git@github.com
      注意是git@github.com，不是你的邮箱。
      ```

      然后会提示你：

      ``` 
      The authenticity of host ‘github.com (192.30.255.112)’ can’t be established.
      RSA key fingerprint is SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8.
      Are you sure you want to continue connecting (yes/no)?
      ```

      正常提示，你只需要YES就可以。如果你创建 SSH key 的时候设置了密码，接下来就会提示你输入密码，如果你没设置密码会提示你:

      ```
      Warning: Permanently added ‘github.com,192.30.255.112’ (RSA) to the list of known hosts.
      Hi “用户名”! You’ve successfully authenticated, but GitHub does not provide shell access.
      ```

2. 需要设置config.name和config.email

   * 按照以下的步骤操作

     ``` 
     git config --global user.name "yourname" 设置用户名
     git config --global user.email myemail@qq.com 设置用户邮箱
     git config --list 查看git设置列表信息
     git config user.name  查看用户名
     ```

     

## git推动GitHub提示faild

在添加远程库的时候一直验证不成功，一直提示failed to push some refs to git的问题，经过网上查找终于解决了这个问题。

主要问题指向了README.md文件

### git步骤如下

```html
1. git add . //添加到暂存区
2. git commit -m "备注内容" //添加到head
3. git push -u origin master //添加到远程仓库
```

其中第三步出错，提示ailed to push some refs to git

### 解决

出现错误的主要原因是github中的README.md文件不在本地代码目录中，

可以通过如下命令进行代码合并【注：pull=fetch+merge]

```html
git pull --rebase origin master
```

执行上面代码后可以看到本地代码库中多了README.md文件

此时再执行语句 git push -u origin master即可完成代码上传到github

<meta name="referrer" content="no-referrer"/>

## keep-alive 的使用与周期

### 使用keep-alive的时机

在搭建 vue 项目时，有某些组件没必要多次渲染，所以需要将组件在内存中进行‘持久化，此时 keep-alive 便可以派上用场了。keep-alive  可以使被包含的组件状态维持不变，即便是组件切换了，其内的状态依旧维持在内存之中。在下一次显示时，也不会重现渲染。

> PS：`` 与 ``相似，只是一个抽象组件，它不会在DOM树中渲染(真实或者虚拟都不会)，也不在父组件链中存在，比如：你永远在 `this.$parent` 中找不到 `keep-alive` 。

<!-- more -->

### 配合router-view去使用

有些时候可能需要将整个路由页面一切缓存下来，也就是将 `` 进行缓存。这种使用场景还是蛮多的

```js
<keep-alive>
    <router-view v-if="$router.meta.keepAlive"></router-view>
</keep-alive>
<router-view v-if="!$router.meta.keepAlive"></router-view>

//router配置
new Router({
    routes: [
        {
            name: 'a',
            path: '/a',
            component: A,
            meta: {
                keepAlive: true
            }
        },
        {
            name: 'b',
            path: '/b',
            component: B
        }
    ]
})
```

### keep-alive 生命周期和新属性

#### 生命周期

被包含在 `` 中创建的组件，会多出两个生命周期的钩子: `activated` 与 `deactivated`

- activated

在组件被激活时调用，**在组件第一次渲染时也会被调用**，之后每次keep-alive激活时被调用。

- deactivated

在组件被停用时调用。

> 注意：只有组件被 `keep-alive` 包裹时，这两个生命周期才会被调用，如果作为正常组件使用，是不会被调用，以及在 `2.1.0` 版本之后，使用 `exclude` 排除之后，就算被包裹在 `keep-alive` 中，这两个钩子依然不会被调用！另外在服务端渲染时此钩子也不会被调用的。

#### 新属性

在vue `2.1.0` 版本之后，`keep-alive` 新加入了两个属性: `include`(包含的组件缓存生效) 与 `exclude`(排除的组件不缓存，优先级大于include) 。

`include` 和 `exclude` 属性允许组件有条件地缓存。二者都可以用逗号分隔字符串、正则表达式或一个数组来表示

当使用正则或者是数组时，一定要使用 `v-bind` !

```js
<!-- 逗号分隔字符串，只有组件a与b被缓存。这样使用场景变得更有意义了 -->
<keep-alive include="a,b">
  <component :is="view"></component>
</keep-alive>

<!-- 正则表达式 (需要使用 v-bind，符合匹配规则的都会被缓存) -->
<keep-alive :include="/a|b/">
  <component :is="view"></component>
</keep-alive>

<!-- Array (需要使用 v-bind，被包含的都会被缓存) -->
<keep-alive :include="['a', 'b']">
  <component :is="view"></component>
</keep-alive>
```

* 有了include之后，再与 `router-view` 一起使用时便方便许多了:

```js
<!-- 一个include解决了，不需要多写一个标签，也不需要在路由元中添加keepAlive了 -->
<keep-alive include='a'>
    <router-view></router-view>
</keeo-alive>
```

### 注意

1. keeo-alive先匹配被包含组件的 `name` 字段，如果 `name` 不可用，则匹配当前组件 `components` 配置中的注册名称。

2. keeo-alive不会在函数式组件中正常工作，因为它们没有缓存实例。

3. 当匹配条件同时在 `include` 与 `exclude` 存在时，以 `exclude` 优先级最高(当前vue 2.4.2 version)。比如：包含于排除同时匹配到了组件A，那组件A不会被缓存。

4. 包含在 keeo-alive 中，但符合 `exclude` ，不会调用`activated` 和 `deactivated`。

5. **设置了`keep-alive`,这个时候不会触发生命周期的钩子函数。**

   当页面内的数据没有发生变化时，页面内的操作比如跳转到另一个路由，是不会去经过生命周期函数的，比如：desdtroy函数等。

   它会直接在进入的时候触发`activated` 和离开的时候触发 deactivated。

   所以，如果是有涉及到之前放入mouted周期中的函数，可以将其放入activated，放入desdtroy周期的函数可以放入deactivated。