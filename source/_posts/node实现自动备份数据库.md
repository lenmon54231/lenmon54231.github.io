---
title: node实现自动备份数据库
date: 2020-07-12 17:16:26
tags: [node,mongodb]
---

<meta name="referrer" content="no-referrer"/>

## node实现自动备份数据库

在Mongodb中我们使用mongodump命令来备份MongoDB数据。该命令可以导出所有数据到指定目录中。

mongodump命令可以通过参数指定导出的数据量级转存的服务器

<!-- more -->

> 手动备份比较麻烦并且没有必要。所以找了下自动备份的实现代码

### 备份命令

mongodump命令脚本语法如下：

```
>mongodump -h dbhost -d dbname -o dbdirectory
```

在mongodb/bin目录下，直接备份到当前目录可以简写：

```
>mongodump
```

### 数据恢复

mongodb使用 mongorestore 命令来恢复备份的数据。

```
>mongorestore -h <hostname><:port> -d dbname <path>
```

```
>mongorestore
```

 ### 自动备份

1. 创建一个定时任务
2. 调用cmd
3. 执行命令后打包

```js
npm install node-schedule -S
npm install child_process -S
npm i fs -S
npm i compressing -S
```

代码如下：

```js
const schedule = require('node-schedule');//引入定时任务模块
const process = require('child_process');//引入cmd模块
const fs = require('fs');//引入fs模块
const compressing = require('compressing');
//cmd执行内容
//数据库地址及端口 如:127.0.0.1:27017
//要备份的数据库名称 如:test
//备份路径如:C:\\backup
// const cmd = 'mongodump -h [数据库地址:端口] -d [要备份的数据库名称] -o [备份路径]';
const cdIn = 'cd /www/server/mongodb/bin'
const cmd = 'mongodump';

function scheduleCronstyle() {
  console.log('start....')
  schedule.scheduleJob('0 30 5 * * *', function () {  //每周日的23时整
    console.log('scheduleJob....')
    process.exec(cdIn, function (error, stdout, stderr) {  //在cmd中执行上方定义的命令
      console.log('exec....', cdIn)
      console.log('exec....', cmd)
      process.exec(cmd, function (error, stdout, stderr) {  //在cmd中执行上方定义的命令
        if (error) {
          console.log('Error:' + error); //错误
        } else if (stderr.lenght > 0) {
          console.log('Stderr:' + stderr.toString())  //标准性错误
        } else {
          //成功之后写入时间
          let year = (new Date()).getFullYear();//获取年
          let month = ((new Date()).getMonth() + 1) > 9 ? ((new Date()).getMonth() + 1) : '0' + ((new Date()).getMonth() + 1);//获取月
          let date = (new Date()).getDate() > 9 ? (new Date()).getDate() : '0' + (new Date()).getDate();//获取日
          let hour = (new Date()).getHours() > 9 ? (new Date()).getHours() : '0' + (new Date()).getHours();//获取时
          let minute = (new Date()).getMinutes() > 9 ? (new Date()).getMinutes() : '0' + (new Date()).getMinutes();//获取分
          let seconds = (new Date()).getSeconds() > 9 ? (new Date()).getSeconds() : '0' + (new Date()).getSeconds();//获取秒
          let str = `${year}-${month}-${date} ${hour}:${minute}:${seconds} 备份`
          console.log(str, 'srt')
          compressing.zip.compressDir('./dump', './' + str + '.zip')
            .then(() => {
              console.log('success');
            })
            .catch(err => {
              console.error(err);
            });
        }
      });

    });

  });
}

scheduleCronstyle();
```

将文件放入node环境下，执行node index.js,在规定时间会在当前目录下生成数据库zip压缩包

### 定时任务scheduleCronstyle

传入参数的意思:

每分钟的第30秒触发： '30 * * * * *'

每小时的1分30秒触发 ：'30 1 * * * *'

每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'

每月的1日1点1分30秒触发 ：'30 1 1 1 * *'

2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'

每周1的1点1分30秒触发 ：'30 1 1 * * 1'