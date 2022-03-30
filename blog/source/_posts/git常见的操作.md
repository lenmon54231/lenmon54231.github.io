---
title: git常见的操作
date: 2022-03-22 15:45:49
tags: [git]
---

## Git 常见的操作

### Git 忽略文件失效

.gitignore 只能忽略没有被跟踪的文件(就是没有被纳入版本管理的文件),如果已经被纳入版本管理是无法忽略的。

> 全部文件重新管理

```js
git rm -r --cached .    //清除缓存区，注意最后有个"."

git add .                    //重新纳入版本管理，注意最后有个"."

git commit -m 'update .gitignore'    //提交新的忽略文件。

git push
```

> 部分文件管理

```js
git rm --cached temp.php  //表示将temp.php移除版本管理。

git commit -m 'fix'

git push
```

> .gitignore 文件忽略规则

```js
# 忽略*.o和*.a文件
*.[oa]
# 忽略*.b和*.B文件，my.b除外  -》
*.[bB]
!my.b
# 忽略dbg文件和dbg目录
dbg
# 只忽略dbg目录，不忽略dbg文件
dbg/
# 只忽略dbg文件，不忽略dbg目录
dbg
!dbg/
# 只忽略当前目录下的dbg文件和目录，子目录的dbg不在忽略范围内
/dbg
```

### Git Stash 的应用

#### 应用场景

当有新的改动加入到本地时，常常会遇到提示，让你先做 stash 缓存到本地。然后 pull 代码到本地后，再通过 git stash pop 将最近的一个 stash 合并到 本地代码

#### 特殊情况

当配置了 Eslint 后，如果某些 代码不能通过 Eslint 的检测，就会报警。并且会出现 本次 commit 修改的代码 被全部恢复的情况，此时，可以去 stash 缓存区去查看下，一般会被自动放置到 stash 中。
![vscode中如何查看](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/vscode%E4%B8%AD%E6%9F%A5%E7%9C%8Bstash.png)

