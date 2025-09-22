---
title: 服务器使用和Node工具链
date: 2025-09-16 11:51:19
tags: [server,node,服务器]
---

# 服务器使用和Node工具链

利用node实现前端静态资源更新和部署;利用WebHook的形式来部署前端网站和后端Node服务;后续还会有更多的功能陆续实现...

<!-- more -->

## 服务器后端Node代码自动更新

### 目标

只需要本地提交代码git push，就会自动更新服务器上的Node后端代码

### 实现

通过GitHub的WebHook + 宝塔WebHook可以轻松实现上述目标

#### 1. 首先去GitHub添加SSH Key，使服务器有git pull的权限

我们这里采用的公共SSH Key，如果不想要使用公共SSH Key的形式，可以使用Deploy keys

```shell
# 1. 切换到 www 用户
sudo -u www bash
# 2. 生成新钥匙（若已有可跳过）
ssh-keygen -t ed25519 -C "www-webhook" -N "" -f ~/.ssh/id_ed25519
# 3. 把公钥加到 GitHub Deploy keys
cat ~/.ssh/id_ed25519.pub
```

在 GitHub → Settings → SSH and GPG keys → New SSH key 里添加这把公钥（个人级别）。


##### 备选：如果你不想要将所有的仓库都赋予git pull权限，则需要使用 Deploy keys(这一步是让服务器有git pull拉取仓库代码的权限)

> 进入对应的仓库，然后在setting里找到Deploy keys菜单，将cat输出的公钥添加到Deploy keys中即可

> 但是这里的key不能重复在其他仓库中添加了，会报错，说这个key已经被使用掉了

#### 2. 去服务器中新建文件夹并从GitHub上pull 仓库到服务器上

1. 在/www/wwwroot目录下，新建api文件夹

2. 在终端中cd /www/wwwroot/api并执行git pull，建立与GitHub的仓库地址链接(其中可能会遇到git账号登录、权限之类的问题，按照正常git配置操作公钥、邮箱即可)

#### 3. 去宝塔中添加WebHook

1. 安装“宝塔WebHook”
 
2. 打开WebHook，并添加Hook

名称可以用：node-deploy

执行脚本如下：
```
#!/bin/bash
cd /www/wwwroot/api
whoami
sudo -u www git fetch --depth=1
sudo -u www git reset --hard origin/main
sudo -u www npm ci --omit=dev
sudo -u www pm2 reload app --update-env || \
sudo -u www pm2 start server.js --name app --env production --update-env
echo "-----------------------done-----------------------"
```

这里使用的是www用户，根据AI的说法，使用root用户来执行WebHook是有注入风险的

以上脚本推荐先由自己手动ssh上服务器操作一次，中间可能会遇到很多提示，需要用户手动配置，比如：

```shell
[www@VM-4-3-opencloudos api]$ git remote -v
fatal: detected dubious ownership in repository at '/www/wwwroot/api'
To add an exception for this directory, call:

        git config --global --add safe.directory /www/wwwroot/api
```

这里就会有权限问题，需要使用root账号手动操作一次，后续才能正常执行git

```shell
# 退出 www 用户
exit
# 用刚才能 sudo 的账号执行
sudo chown -R www:www /www/wwwroot/api
```

**另一个更新网站的脚本website-deploy.sh**也放在这里参考：

```shell
#!/bin/bash
cd /www/wwwroot/main-web-site || exit
echo "[$(date +"%F %T")] 进入目录：$(pwd)"

whoami
echo "[$(date +"%F %T")] 当前用户：$(whoami)"

# 给 www 用户一次性加白（不存在才加）
sudo -u www bash -c '
git config --global --get safe.directory /www/wwwroot/main-web-site &>/dev/null ||
git config --global --add safe.directory /www/wwwroot/main-web-site
'
echo "[$(date +"%F %T")] Git 安全目录配置 done"

# 拉最新代码
echo "[$(date +"%F %T")] 正在 git pull ..."
sudo -u www git pull origin main 2>&1 | while IFS= read -r line; do
  printf "[%s] %s\n" "$(date +"%F %T")" "$line"
done

sudo -u www git reset --hard origin/main
echo "[$(date +"%F %T")] git reset done"

# 装依赖 + 构建（无日志输出）
sudo -u www npm ci > /dev/null 2>&1
echo "[$(date +"%F %T")] npm ci done"

sudo -u www npm run build > /dev/null 2>&1
echo "[$(date +"%F %T")] npm run build done"

# 发布
sudo -u www rm -rf /www/wwwroot/www.3dweb.top/*
echo "[$(date +"%F %T")] 清空目标目录 done"

sudo -u www cp -r dist/* /www/wwwroot/www.3dweb.top/
echo "[$(date +"%F %T")] 拷贝文件 done"

echo "[$(date +"%F %T")] 全部流程完成"
```

3. 宝塔webhook添加成功后，在菜单栏可以看到“查看密钥”选项，可以获取到形如：https://xx.xxx.xx.253:37874/hook?access_key=xxxxxx&param=aaa的数据

#### 4. 去GitHub中添加WebHook

1. 进入GitHub对应仓库

2. 左侧有webhook选项，进入配置：1. Payload URL（即上面在宝塔中获取的链接）；2.Content type （选择json即可）；3.SSL verification可以直接选择disabled，然后add webhook即完成


## 部署纯前端代码到服务器上去

#### package.json配置

```json
{
 "scripts": {
    "deploy": "npm run push && npm run build && node deploy",
  },
}
```

#### deploy.js

```js
import fs from 'fs';
import ora from 'ora';
import path, { dirname } from 'path';
import Client from 'ssh2-sftp-client';
import { fileURLToPath } from 'url';

let spinner = null; // 加载动画实例

// 获取当前模块的目录路径
const __dirname = dirname(fileURLToPath(import.meta.url));
// 统计目录中的文件总数
function countFiles(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      count += countFiles(filePath); // 递归统计子目录中的文件
    } else {
      count++;
    }
  });
  return count;
}
async function uploadDist() {
  spinner = ora('连接到服务器...').start();

  const sftp = new Client();
  const serverIp = 'xx.xxx.xx.xxx'; // 替换为你的服务器 IP
  const username = 'root'; // 替换为你的服务器用户名
  const password = 'xxxxxx!'; // 替换为你的服务器密码
  const localPath = path.join(__dirname, 'dist'); // 本地 dist 文件夹路径
  const remotePath = '/www/wwwroot/3dweb.top'; // 服务器上的目标文件夹路径

  let deployNum = 0;
  const totalNum = countFiles(localPath);

  try {
    await sftp.connect({
      host: serverIp,
      username: username,
      password: password,
    });
    spinner.succeed('云服务器连接成功');

    spinner.start();
    spinner.text = '开始上传dist文件夹...';

    // 监听 upload 事件
    sftp.on('upload', (info) => {
      deployNum++;
      spinner.text = `上传文件进度: (${deployNum}/${totalNum})`;
    });

    await sftp.uploadDir(localPath, remotePath);
    spinner.succeed('文件上传完成');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sftp.end();
  }
}

uploadDist();

```


## 微信小程序压缩文件并上传到服务器

微信小程序有一个很常见的需求：将静态文件放到oss或者服务器上，减少微信小程序打包体积。

这个需求很适合用Node来实现。

### 压缩文件

```js
// index.js
const uploadModule = require("./upload.js");

const sharp = require("sharp");
const fs = require("fs");

const fsp = fs.promises;

const path = require("path");
// 要压缩的图片文件夹路径
const inputDirectory = "../server-static";
// 压缩后的图片存放的文件夹路径
const outputDirectory = "./output/server-static";

const filterImageList = ["png", "jpg", "jpeg"];

// 递归读取目录中的所有文件
async function processFiles(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });

  for (let entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      // 如果是目录，则递归调用processFiles
      await processFiles(res);
    } else if (entry.isFile()) {
      const inputPath = path.join(
        inputDirectory,
        path.relative(inputDirectory, res)
      );

      // 如果是文件且是图片格式，则进行压缩
      const outputPath = path.join(
        outputDirectory,
        path.relative(inputDirectory, res)
      );
      const outputDir = path.dirname(outputPath);

      // 确保输出目录存在，如果不存在则创建
      await ensureDir(outputDir);

      if (filterImageList.includes(entry.name.split(".").pop())) {
        await sharp(res)
          .toFormat(entry.name.split(".").pop(), { quality: 80 }) // 可以设置你想要的格式和质量，这里以JPEG格式和80%的质量为例
          .toFile(outputPath)
          .then(() => {
            // console.log(`Image ${entry.name} has been compressed and saved to ${outputPath}`);
          })
          .catch((err) => {
            console.error(`Error compressing image ${entry.name}`, err);
          });
      } else {
        console.log(`${inputPath}该文件类型无法被压缩，直接复制到对应文件夹下`);
        fs.copyFile(res, outputPath, (err) => {
          if (err) throw err;
        });
      }
    }
  }
}

// 确保目录存在，如果不存在则创建
async function ensureDir(dir) {
  try {
    await fsp.access(dir);
  } catch (err) {
    await fsp.mkdir(dir, { recursive: true });
  }
}

// 开始处理文件
async function startProcessing() {
  try {
    console.log(`开始执行压缩`);
    await ensureDir(outputDirectory);
    await processFiles(inputDirectory);
    console.log(`压缩完成`);

    console.log("开始上传");
    await uploadModule.uploadFiles(outputDirectory);
    console.log("上传结束");
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

startProcessing();

```

### 上传图片到服务器

```js
// upload.js
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const fs = require("fs");

const fsp = fs.promises;
const outputDirectory = "./output/server-static";

// 配置请求参数
const uploadUrl = "https://www.baidu.com/api/user/upload";
let token = "1";

// 递归读取目录中的所有文件
async function uploadFiles(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });

  for (let entry of entries) {
    const fileAbsolutePath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      // 如果是目录，则递归调用processFiles
      await uploadFiles(fileAbsolutePath);
    } else if (entry.isFile()) {
      // 获取完整的相对路径
      const fileRelativePath = path.relative(outputDirectory, fileAbsolutePath);
      console.log("fileRelativePath: ", fileRelativePath);
      // 获取相对路径文件目录
      const fileRelativeDirectoryPath = path.dirname(fileRelativePath);
      const res = await upload({
        fileAbsolutePath,
        fileRelativeDirectoryPath,
        filename: entry.name,
      });
      console.log(fileRelativePath, res.data.code, res.data.msg);
      console.log("-----------------------------");
    }
  }
}

async function upload({
  fileAbsolutePath,
  fileRelativeDirectoryPath,
  filename,
}) {
  // 写入文件和请求参数
  const formData = new FormData();
  let imgFile = fs.createReadStream(fileAbsolutePath);
  formData.append("file", imgFile, filename);
  formData.append("path", fileRelativeDirectoryPath);

  // 配置请求参数
  const config = {
    headers: {
      ...formData.getHeaders(), // 自动从form-data获取正确的Content-Type
      Authorization: "Bearer" + " " + token,
      "X-Requested-With": "XMLHttpRequest",
    },
  };

  // 发起请求
  return axios.post(uploadUrl, formData, config);
}

module.exports = { uploadFiles };

```


### 依赖

package.json
```json
{
  "dependencies": {
    "axios": "^1.7.7",
    "form-data": "^4.0.1",
    "sharp": "^0.33.5"
  }
}
```




## Hexo 和 Github 页面实现个人博客

之前使用 express 和 vue 搭建的博客所使用的云服务器到期，导致个人博客无处安放，用 GitHub 和 Hexo 做个人博客，这下应该就不会再折腾博客了。

**流程如下：**

### Hexo 配置

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

### GitHub 配置

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

### 通过 node 来执行重复操作

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

## node 实现自动备份数据库

在 Mongodb 中我们使用 mongodump 命令来备份 MongoDB 数据。该命令可以导出所有数据到指定目录中。

mongodump 命令可以通过参数指定导出的数据量级转存的服务器

<!-- more -->

> 手动备份比较麻烦并且没有必要。所以找了下自动备份的实现代码

### 备份命令

mongodump 命令脚本语法如下：

```
>mongodump -h dbhost -d dbname -o dbdirectory
```

在 mongodb/bin 目录下，直接备份到当前目录可以简写：

```
>mongodump
```

### 数据恢复

mongodb 使用 mongorestore 命令来恢复备份的数据。

```
>mongorestore -h <hostname><:port> -d dbname <path>
```

```
>mongorestore
```

### 自动备份

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

### 定时任务 scheduleCronstyle

传入参数的意思:

每分钟的第 30 秒触发： '30 \* \* \* \* \*'

每小时的 1 分 30 秒触发 ：'30 1 \* \* \* \*'

每天的凌晨 1 点 1 分 30 触发 ：'30 1 1 \* \* \*'

每月的 1 日 1 点 1 分 30 秒触发 ：'30 1 1 1 \* \*'

2016 年的 1 月 1 日 1 点 1 分 30 秒触发 ：'30 1 1 1 2016 \*'

每周 1 的 1 点 1 分 30 秒触发 ：'30 1 1 \* \* 1'

## 使用 node 上传和下载文件

前后端分离的情况下，如何上传和下载不同格式的文件，环境：node+vue+elementUI+press

<!-- more -->

> blob = new Blob([res.data], { type: 'image/png' });
>
> ​ objectUrl = URL.createObjectURL(blob);

`Blob` 对象表示一个不可变、原始数据的类文件对象。它的数据可以按文本或二进制的格式进行读取，也可以转换成 [`ReadableStream`](https://developer.mozilla.org/zh-CN/docs/Web/API/ReadableStream) 来用于数据操作

### 上传前端

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

### 上传后端

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

### 下载前端

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

### 下载后端

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

### 部署到云服务器

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


## node基本操作


删除文件
```js
import fs from "fs/promises";
 await fs.rm('./src/assets/thumb', { recursive: true, force: true });
```


创建目录
```js
await fs.mkdir('./src/assets/thumb', { recursive: true });
```

读取所有文件和文件夹
```js
// 读取源目录中的所有文件和文件夹
  const items = await fs.readdir('./src/assets/thumb', { withFileTypes: true });
```

复制文件
```js
import path from "path";

const newDstPath = path.join("./src/assets/thumb/", 'name.jpg');
await fs.copyFile(`./src/assets/thumb/thumb.jpg`, newDstPath);
```

读取文件内容
```js
const data = await fs.readFile('./src/config/scene-options.js', "utf-8");
```

写内容到目标文件
```js
const newContent = "export { sceneOptionsList };"
await fs.writeFile('./src/config/scene-options.js', newContent, "utf-8");
```


## ffmpeg 处理视频功能

本次是因为更新 ffmpeg 处理视频功能，上传 server 后，引入的 fluent-ffmpeg 没有在 centOS 中安装。需要安装后再启动 node

1. [官网下载 linux 版本的 ffmpeg 源码包 ffmpeg-4.1.tar.xz](https://johnvansickle.com/ffmpeg/release-source/)

2. 使用 xftp 将源码包 ffmpeg-4.1.tar.xz 上传至 linux 主机，解压源码包

   ```js
   cd /usr/local/
   mkdir ffmpeg    #在usr/local目录下创建ffmpeg目录
   cd /usr/local/ffmpeg
   tar xvJf ffmpeg-4.1.tar.xz
   cd ffmpeg-4.1
   yum install gcc
   yum install yasm
   ./configure --enable-shared --prefix=/usr/local/ffmpeg
   make
   make install
   ```

3. 编译完成后，需要修改 path

   ```js
   vim / etc / ld.so.conf;
   ```

   ```js
   内容如下：
   include ld.so.conf.d/*.conf
   /usr/local/ffmpeg/lib/
   ```

   输入**ldconfig**使修改生效。

   ```js
   ldconfig;
   ```

4. 查看版本

   ```JS
   /usr/local/ffmpeg/ffmpeg-4.1/ffmpeg -version
   ```

5. 配置环境变量

   ```JS
   # vim /etc/profile
   ```

   ```js
   内容如下：
   #set ffmpeg environment
   PATH=$PATH:/usr/local/ffmpeg/bin
   export PATH
   ```

   ```js
   source /etc/profile #使配置生效
   ```

   ```js
   ffmpeg - version;
   ```

   最终：可以在任意地方使用 ffmpeg
