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

### Git 更新远程分支列表

```js
git remote update origin --prune
```

### Git Stash 的应用

#### 应用场景

当有新的改动加入到本地时，常常会遇到提示，让你先做 stash 缓存到本地。然后 pull 代码到本地后，再通过 git stash pop 将最近的一个 stash 合并到 本地代码
常用代码：

```js
git stash
git stash save "save message"   // 执行存储时，添加备注，方便查找，只有git stash 也要可以的，但查找时不方便识别。

git stash list //查看stash了哪些存储

git stash show //显示做了哪些改动，默认show第一个存储,如果要显示其他存贮，后面加stash@{$num}，比如第二个 git stash show stash@{1}

git stash show -p// 显示第一个存储的改动，如果想显示其他存存储，命令：git stash show  stash@{$num}  -p ，比如第二个：git stash show  stash@{1}  -p

git stash apply//应用某个存储,但不会把存储从存储列表中删除，默认使用第一个存储,即stash@{0}，如果要使用其他个，git stash apply stash@{$num} ， 比如第二个：git stash apply stash@{1}

git stash pop //命令恢复之前缓存的工作目录，将缓存堆栈中的对应stash删除，并将对应修改应用到当前的工作目录下,默认为第一个stash,即stash@{0}，如果要应用并删除其他stash，命令：git stash pop stash@{$num} ，比如应用并删除第二个：git stash pop stash@{1}

git stash drop stash@{$num} //丢弃stash@{$num}存储，从列表中删除这个存储

git stash clear //删除所有缓存的stash
```

#### 特殊情况

当配置了 Eslint 后，如果某些 代码不能通过 Eslint 的检测，就会报警。并且会出现 本次 commit 修改的代码 被全部恢复的情况，此时，可以去 stash 缓存区去查看下，一般会被自动放置到 stash 中。
![vscode中如何查看](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/vscode%E4%B8%AD%E6%9F%A5%E7%9C%8Bstash.png)

