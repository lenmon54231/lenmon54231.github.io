---
title: node使用
date: 2023-09-28 15:09:44
tags: [node]
---

## node 使用记录

<!-- more -->

### Hexo 和 Github 页面实现个人博客

云服务器到期，导致个人博客无处安放，用 GitHub 和 Hexo 做个人博客，流程如下：

<!-- more -->

#### Hexo 配置

```js
npm install -g hexo-cli
hexo init blog
hexo new test_my_site
hexo g
hexo s
```

生成项目的\_config.yml 文件中，修改配置如下：

```js
deploy:
  type: git
  repo: https://github.com/lenmon54231/lenmon54231.github.io.git
  branch: master

root: /
```

最后，配置下 git 提交的插件

```js
npm install hexo-deployer-git --save
```

以后的新增和修改了文章，就可以通过以下的命令来更新 Hexo 博客：

```js
hexo clean
hexo g
hexo d
```

经过以上命令，就可以打开 localhost:4000，来本地访问 hexo 博客

#### GitHub 配置

GitHub 需要两个仓库，1、Hexo 博客源码仓库；2、GitHub 的.github.io 仓库

1. GitHub 的.github.io 仓库
   新建一个名为你的用户名.github.io 的仓库，比如说，如果你的 github 用户名是 test，那么你就新建 test.github.io 的仓库（必须是你的用户名，其它名称无效），将来你的网站访问地址就是 http://test.github.io 了，是不是很方便？

```js
注册的邮箱一定要验证，否则不会成功；
仓库名字必须是：username.github.io，其中username是你的用户名；
仓库创建成功不会立即生效，需要过一段时间，大概10-30分钟，或者更久，我的等了半个小时才生效；
deploy:
  type: git
  repo: https://github.com/lenmon54231/lenmon54231.github.io.git
  branch: master
```

2.Hexo 博客源码仓库
这个就省略了，就是新建一个普通仓库用来放 Hexo 的源码，后面方便其他电脑的 clone。

通过 hexo d 来推送数据到 GitHub 的时候，可能会需求添加 SSH Key，参考[SSH 配置](https://lenmon54231.github.io/2021/03/21/GitHub%E7%9A%84SSH%E5%AF%86%E9%92%A5%E9%85%8D%E7%BD%AE/)

#### 通过 node 来执行重复操作

每次修改或者新增文章都会执行以下的操作

```js
hexo clean
hexo g
hexo d
git pull
git add .
git commit -m 'xxx'
git push
```

网上都是用的 GitHub 的 hook 来自动化部署，即：通过 git push 的命令来更新 hexo 博客。但是走到密钥配置这一步，发现有点问题，因为有用公司项目，不清楚如何配置。为了避免和公司项目冲突，采用 node 去代替重复操作。

通过 shelljs 的库，可以以 Promise 的形式执行 shell，代码很简单，如下：

```js
// @ts-nocheck
const shell = require("shelljs");
const program = require("commander");
// const iconv = require("iconv-lite");

const runGit = async function () {
  let currentTime = String(
    new Date().toLocaleString("chinese", { hour12: false })
  );
  let commitStr = `git commit -m "${currentTime}"`;
  shell.exec("git pull", { silent: true });
  shell.echo("git pull完成");
  shell.exec("git add .", { silent: true });
  shell.echo("git add .完成");
  shell.exec(commitStr, { silent: true });
  shell.echo("git commit完成");
  shell.exec("git push");
  shell.echo("git操作完成");
  return true;
};

const runHexo = async function () {
  // shell.exec(
  //   "ipconfig",
  //   { silent: true, encoding: "buffer" },
  //   (err, stdout, stderr) => {
  //     // @ts-ignore
  //     shell.echo(
  //       "ipconfig ---------------------------",
  //       // @ts-ignore
  //       iconv.decode(stdout, "cp936"),
  //       "ipconfig ---------------------------"
  //     );
  //   }
  // );
  if (!shell.which("hexo")) {
    //在控制台输出内容
    shell.echo("Sorry, this script requires hexo");
    shell.exit(1);
  }
  shell.cd("blog");
  shell.exec("hexo clean", { silent: true });
  shell.echo("hexo clean完成");
  shell.exec("hexo g", { silent: true });
  shell.echo("hexo g完成");
  if (shell.exec("hexo d").code !== 0) {
    shell.echo("Error: hexo d failed");
    shell.exit(1);
  }
  shell.echo("hexo操作完成");
  return true;
};

const runNewHexo = function (newPageHexoWithTitle) {
  shell.cd("blog");
  shell.exec(newPageHexoWithTitle);
};

const runHexoCI = async function () {
  try {
    program
      .version("0.0.1") //定义版本号
      .option("-g, --gitCI", "gitCI") //参数定义
      .option("-h, --hexoCI", "hexoCI")
      .option("-n, --hexoNewPage", "hexoNewPage")
      .parse(process.argv); //解析命令行参数,参数定义完成后才能调用
    if (program?._optionValues?.gitCI) {
      shell.echo("命中git");
      runGit();
    } else if (program?._optionValues?.hexoCI) {
      shell.echo("命中hexo");
      runHexo();
    } else if (program?._optionValues?.hexoNewPage) {
      shell.echo("命中新建文章页面");
      if (program?.rawArgs[3]) {
        let newPageHexoWithTitle = `hexo n "${program?.rawArgs[3]}"`;
        runNewHexo(newPageHexoWithTitle);
      } else {
        shell.echo("输入最后一个参数，即：文章名称");
      }
    } else {
      await runGit();
      await runHexo();
    }
  } catch (error) {
    shell.echo("CI流程报错!!!!!", error);
  }
};

runHexoCI();
```

### node 实现自动备份数据库

在 Mongodb 中我们使用 mongodump 命令来备份 MongoDB 数据。该命令可以导出所有数据到指定目录中。

mongodump 命令可以通过参数指定导出的数据量级转存的服务器

<!-- more -->

> 手动备份比较麻烦并且没有必要。所以找了下自动备份的实现代码

#### 备份命令

mongodump 命令脚本语法如下：

```
>mongodump -h dbhost -d dbname -o dbdirectory
```

在 mongodb/bin 目录下，直接备份到当前目录可以简写：

```
>mongodump
```

#### 数据恢复

mongodb 使用 mongorestore 命令来恢复备份的数据。

```
>mongorestore -h <hostname><:port> -d dbname <path>
```

```
>mongorestore
```

#### 自动备份

1. 创建一个定时任务
2. 调用 cmd
3. 执行命令后打包

```js
npm install node-schedule -S
npm install child_process -S
npm i fs -S
npm i compressing -S
```

代码如下：

```js
const schedule = require("node-schedule"); //引入定时任务模块
const process = require("child_process"); //引入cmd模块
const fs = require("fs"); //引入fs模块
const compressing = require("compressing");
//cmd执行内容
//数据库地址及端口 如:127.0.0.1:27017
//要备份的数据库名称 如:test
//备份路径如:C:\\backup
// const cmd = 'mongodump -h [数据库地址:端口] -d [要备份的数据库名称] -o [备份路径]';
const cdIn = "cd /www/server/mongodb/bin";
const cmd = "mongodump";

function scheduleCronstyle() {
  console.log("start....");
  schedule.scheduleJob("0 30 5 * * *", function () {
    //每周日的23时整
    console.log("scheduleJob....");
    process.exec(cdIn, function (error, stdout, stderr) {
      //在cmd中执行上方定义的命令
      console.log("exec....", cdIn);
      console.log("exec....", cmd);
      process.exec(cmd, function (error, stdout, stderr) {
        //在cmd中执行上方定义的命令
        if (error) {
          console.log("Error:" + error); //错误
        } else if (stderr.lenght > 0) {
          console.log("Stderr:" + stderr.toString()); //标准性错误
        } else {
          //成功之后写入时间
          let year = new Date().getFullYear(); //获取年
          let month =
            new Date().getMonth() + 1 > 9
              ? new Date().getMonth() + 1
              : "0" + (new Date().getMonth() + 1); //获取月
          let date =
            new Date().getDate() > 9
              ? new Date().getDate()
              : "0" + new Date().getDate(); //获取日
          let hour =
            new Date().getHours() > 9
              ? new Date().getHours()
              : "0" + new Date().getHours(); //获取时
          let minute =
            new Date().getMinutes() > 9
              ? new Date().getMinutes()
              : "0" + new Date().getMinutes(); //获取分
          let seconds =
            new Date().getSeconds() > 9
              ? new Date().getSeconds()
              : "0" + new Date().getSeconds(); //获取秒
          let str = `${year}-${month}-${date} ${hour}:${minute}:${seconds} 备份`;
          console.log(str, "srt");
          compressing.zip
            .compressDir("./dump", "./" + str + ".zip")
            .then(() => {
              console.log("success");
            })
            .catch((err) => {
              console.error(err);
            });
        }
      });
    });
  });
}

scheduleCronstyle();
```

将文件放入 node 环境下，执行 node index.js,在规定时间会在当前目录下生成数据库 zip 压缩包

#### 定时任务 scheduleCronstyle

传入参数的意思:

每分钟的第 30 秒触发： '30 \* \* \* \* \*'

每小时的 1 分 30 秒触发 ：'30 1 \* \* \* \*'

每天的凌晨 1 点 1 分 30 触发 ：'30 1 1 \* \* \*'

每月的 1 日 1 点 1 分 30 秒触发 ：'30 1 1 1 \* \*'

2016 年的 1 月 1 日 1 点 1 分 30 秒触发 ：'30 1 1 1 2016 \*'

每周 1 的 1 点 1 分 30 秒触发 ：'30 1 1 \* \* 1'

### 使用 node 上传和下载文件

前后端分离的情况下，如何上传和下载不同格式的文件，环境：node+vue+elementUI+press

<!-- more -->

> blob = new Blob([res.data], { type: 'image/png' });
>
> ​ objectUrl = URL.createObjectURL(blob);

`Blob` 对象表示一个不可变、原始数据的类文件对象。它的数据可以按文本或二进制的格式进行读取，也可以转换成 [`ReadableStream`](https://developer.mozilla.org/zh-CN/docs/Web/API/ReadableStream) 来用于数据操作

#### 上传前端

```vue
<el-upload
  class="upload-demo"
  :action="uploadUrl"
  :on-success="uploadSuccess"
  :file-list="fileList"
>
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
```

```js
    uploadUrl: "/api/infor",
    uploadSuccess(res, file, fileList) {
      if (res.code == 200) {
        this.fileList = fileList;
        this.submitForm.fileName = res.rows.originalname;
        this.submitForm.IDName = res.rows.IDName;
        this.$message.success("上传成功");
      } else if (res.code == 999) {
      } else {
        this.fileList = [];
        this.$message.error(res.msg);
      }
    },
```

1. elemengtUI 上传组件，填写 action，当上传成功后，回调函数中记录下文件**”本身名称类型“**和服务器中的**”被更改后的文件名称“**

2. file list 接收到赋值，用于回显

#### 上传后端

安装 multer

> ```
> npm install --save multer
> ```

引入 multer

```js
const objMulter = multer({ dest: "../static/files" }); //指定存放位置

app.use(objMulter.any());
```

处理上传来的文件

> Multer 会添加一个 `body` 对象 以及 `file` 或 `files` 对象 到 express 的 `request` 对象中。 `body` 对象包含表单的文本域信息，`file` 或 `files` 对象包含对象表单上传的文件信息。

```JS
//上传的文件
router.post('/api/infor', function (req, res, next) {
  console.log(req.files[0], '传递来的数据')
  const newname = req.files[0].path + path.parse(req.files[0].originalname).ext
  let fileName = req.files[0].filename + path.parse(req.files[0].originalname).ext;
  let info = {
    originalname: req.files[0].originalname,
    IDName: fileName
  }
  fs.rename(req.files[0].path, newname, function (err) {
    if (err) {
      res.send({ code: 999, msg: '上传失败' })
    } else {
      res.send({ code: 200, msg: '上传成功', rows: info })
    }
  })
})
```

1. 调用 fs 的 rename 方法，用来对文件进行重命名，保证文件的唯一性。

#### 下载前端

```js
import { exportInfo } from "../../../static/js/export.js";

download(index, row) {
      let Tem = JSON.parse(JSON.stringify(row));
      let infoTem = Tem.fileName.split(".");
      let nameTem = infoTem.reduce((a, b) => {
        return a + "." + b;
      });
      let info = {
        method: "POST",
        url: "/api/download/" + row._id,
        responseType: "blob",
        type: infoTem[infoTem.length - 1],
        name: nameTem,
      };
      exportInfo(info)
        .then((res) => {})
        .catch(() => {});
    },
```

export.js

```js
import axios from "axios";

function setUrlParam(data) {
  let _str = "";
  for (let i in data) {
    if (!isNull(data[i])) {
      _str += i + "=" + encodeURIComponent(data[i]) + "&";
    }
  }
  return "?" + _str.substring(0, _str.length - 1);
}
function isNull(e) {
  // 排除为0 或者其他情况
  let _ = String(e);
  return _ === "null" || _ === "NaN" || _ === "undefined" || _.length === 0;
}
function whatType(type) {
  //判断传过来的type类型
  let TypeObject = [
    {
      typeList: ["xlc", "xll", "xlm", "xls", "xlw", "xlsx"],
      typeOut: "excel",
    },
    {
      typeList: ["jpg", "jpeg", "png", "gif"],
      typeOut: "img",
    },
    {
      typeList: ["zip", ".tar", ".gz"],
      typeOut: "zip",
    },
    {
      typeList: ["doc", "docx"],
      typeOut: "doc",
    },
    {
      typeList: ["ppt", "pptx"],
      typeOut: "ppt",
    },
    {
      typeList: ["tar"],
      typeOut: "tar",
    },
    {
      typeList: ["gzip", "gz"],
      typeOut: "gz",
    },
  ];
  let currentType = null;
  TypeObject.forEach((v) => {
    let currentIndex = v["typeList"].findIndex((e) => e == type);
    if (currentIndex > -1) {
      currentType = v.typeOut;
    } else {
      return;
    }
  });
  return currentType;
}

export function exportInfo(info) {
  return new Promise((resolve, reject) => {
    axios({
      method: info.method,
      url: info.params ? info.url + setUrlParam(info.params) : info.url,
      data: info.params,
      responseType: info.responseType, // 优先尝试 blob
      headers: {
        Authorization: sessionStorage.getItem("token")
          ? "Bearer " + sessionStorage.getItem("token")
          : "",
      },
    })
      .then((res) => {
        console.log(info.type, whatType(info.type), "whatType(info.type)");
        let objectUrl = null,
          blob = null;
        if (whatType(info.type) === "excel") {
          blob = new Blob([res.data], {
            type: "application/vnd.ms-excel",
          });
          objectUrl = URL.createObjectURL(blob);
        } else if (whatType(info.type) === "img") {
          blob = new Blob([res.data], { type: "image/png" });
          objectUrl = URL.createObjectURL(blob);
          // objectUrl = 'data:image/png;base64,' + btoa(new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        } else if (whatType(info.type) === "zip") {
          blob = new Blob([res.data], { type: "application/zip" });
          objectUrl = URL.createObjectURL(blob);
        } else if (whatType(info.type) === "doc") {
          blob = new Blob([res.data], {
            type: "application/msword",
          });
          objectUrl = URL.createObjectURL(blob);
        } else if (whatType(info.type) === "ppt") {
          blob = new Blob([res.data], {
            type: "application/vnd.ms-powerpoint",
          });
          objectUrl = URL.createObjectURL(blob);
        } else if (whatType(info.type) === "tar") {
          blob = new Blob([res.data], {
            type: "application/x-tar",
          });
          objectUrl = URL.createObjectURL(blob);
        } else if (whatType(info.type) === "gz") {
          blob = new Blob([res.data], {
            type: "application/x-gzip",
          });
          objectUrl = URL.createObjectURL(blob);
        } else {
          blob = new Blob([res.data], {
            type: "application/octet-stream",
          });
          objectUrl = URL.createObjectURL(blob);
        }
        console.log(objectUrl, "下载地址");
        let a = document.createElement("a");
        a.href = objectUrl;
        a.download = info.name;
        //a.click();
        //下面这个写法兼容火狐
        a.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
        window.URL.revokeObjectURL(blob);
        resolve(res);
      })
      .catch((error) => {
        console.log("response: ", error);
        reject(error);
      });
  });
}
```

1. 下载需要用特定的数据格式接收-blob 和指定的 type

   ```js
   blob = new Blob([res.data], {
     type: "application/x-gzip",
   });
   objectUrl = URL.createObjectURL(blob);
   ```

2. 模拟 a 链接的行为

   ```js
   let a = document.createElement("a");
   a.href = objectUrl;
   a.download = info.name;
   ```

#### 下载后端

```js
router.post("/api/download/:id", function (req, res) {
  db.Demo.findOne({ _id: req.params.id }, function (err, docs) {
    if (err) {
      console.error(err);
      return;
    }
    if (docs) {
      console.log(req.params.id, docs.IDName);
      let filePath = "../static/files/" + docs.IDName;
      let stats = fs.statSync(filePath);
      console.log(stats);
      if (stats.isFile()) {
        res.set({
          "Content-Type": "application/octet-stream",
          "Content-Disposition": "attachment; filename=" + docs.IDName,
          "Content-Length": stats.size,
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.end(404);
      }
    }
  });
});
```

1. 数据库中查找服务器的唯一文件名称。以便拼接出 filePath 文件地址。

2. 读取对应地址的文件流，流入到 res 中，返回给前端，前端使用 blob 接收

   ```js
   fs.createReadStream(filePath).pipe(res);
   ```

#### 部署到云服务器

1. 使用宝塔安装 mongodb，pm2，nginx。

2. nginx 需要配置转发。conf 文件如下

   ```js
   user  www www;
   worker_processes auto;
   error_log  /www/wwwlogs/nginx_error.log  crit;
   pid        /www/server/nginx/logs/nginx.pid;
   worker_rlimit_nofile 51200;

   events
       {
           use epoll;
           worker_connections 51200;
           multi_accept on;
       }

   http
   {
           include       mime.types;
   		    #include luawaf.conf;

   	    	include proxy.conf;

           default_type  application/octet-stream;

           server_names_hash_bucket_size 512;
           client_header_buffer_size 32k;
           large_client_header_buffers 4 32k;
           client_max_body_size 50m;

           sendfile   on;
           tcp_nopush on;

           keepalive_timeout 60;

           tcp_nodelay on;

           fastcgi_connect_timeout 300;
           fastcgi_send_timeout 300;
           fastcgi_read_timeout 300;
           fastcgi_buffer_size 64k;
           fastcgi_buffers 4 64k;
           fastcgi_busy_buffers_size 128k;
           fastcgi_temp_file_write_size 256k;
   		    fastcgi_intercept_errors on;

           gzip on;
           gzip_min_length  1k;
           gzip_buffers     4 16k;
           gzip_http_version 1.1;
           gzip_comp_level 2;
           gzip_types     text/plain application/javascript application/x-javascript text/javascript text/css application/xml;
           gzip_vary on;
           gzip_proxied   expired no-cache no-store private auth;
           gzip_disable   "MSIE [1-6]\.";

           limit_conn_zone $binary_remote_addr zone=perip:10m;
   		    limit_conn_zone $server_name zone=perserver:10m;

           server_tokens off;
           access_log off;

   server
       {
           listen 888;
           server_name phpmyadmin;
           index index.html index.htm index.php;
           root  /www/server/phpmyadmin;

           #error_page   404   /404.html;
           include enable-php.conf;

           location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
           {
               expires      30d;
           }

           location ~ .*\.(js|css)?$
           {
               expires      12h;
           }

           location ~ /\.
           {
               deny all;
           }

           access_log  /www/wwwlogs/access.log;
       }

   server
       {
           listen 80;
           server_name limeng.website;
           index index.html index.htm index.php;
           root  /www/server/nginx/html;

           #error_page   404   /404.html;
        location / {
            try_files $uri /index.html;
        }

        location /api {
            proxy_pass http://localhost:8088;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection ‘upgrade’;
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
        location /images {
          root  /BLOG/static/files;
          autoindex on;
        }
           access_log  /www/wwwlogs/access.log;
       }
   include /www/server/panel/vhost/nginx/*.conf;
   }
   ```

   添加对应 api 的转发，将 api 的请求转发到 http://localhost:8088，8088 端口即是 之前 mongodb 的 listen 端口。

   ```js
       location /api {
            proxy_pass http://localhost:8088;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection ‘upgrade’;
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
   ```
