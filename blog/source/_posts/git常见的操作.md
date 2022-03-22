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
