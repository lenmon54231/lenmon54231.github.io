---
title: node实现push和hexo更新
date: 2022-08-21 16:49:08
tags: [hexo, node]
---

## node 实现 push 和 hexo 更新

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
