---
title: git合并两个本地库
date: 2020-07-12 17:16:26
tags: [github, git]
---

<meta name="referrer" content="no-referrer"/>

## git 合并两个本地库

当你本地复制了一套代码作为初始备份时候，并且没有将.git 文件一起复制的话，当你做完你的新功能，需要 push 上去的时候，就需要做一些额外的操作

<!-- more -->

> ```js
> 关键词：git pull origin master --allow-unrelated-histories
> ```

### 本地已经初始化仓库

先将本地的项目初始化为一个 git 仓库，然后再强行合并本地仓库和远程仓库，由于这两个仓库是完全不同的两个仓库，所以直接 pull 都会报错，需要在 pull 的时候假加上–allow-unrelated-histories 才可以 pull 成功。**此方法适用于本地项目已经是一个 git 仓库的情况。**

1. git init
2. git add .
3. git commit -m 'fix'
4. git remote add origin git@github.com:yuanmingchen/tensorflow_study.git
5. git pull origin master --allow-unrelated-histories
6. git push -u origin master

当然，这样你 push 上去，实际上会有很多冲突，解决冲突然后提交就欧克了。

参考如下：[将本地已有的一个项目上传到新建的 git 仓库的方法](https://www.cnblogs.com/presleyren/p/11715218.html)
