---
title: git操作
date: 2021-9-22 15:45:49
tags: [git]
---

## Git 操作

<!-- more -->

### Git 更新远程分支列表

```js
git remote update origin --prune
```

### 本地代码关联远程仓库

```js
git init

git add .

git commit -m "备注信息"

git remote add origin 你的远程仓库地址

git pull --rebase origin master

git push -u origin master
// 当push报错时：behind的错误信息代表着需要重新执行 git pull --rebase origin master
```

### Git 删除文件

```js
// 工作过程中若误提交了文件到仓库上，比如node_modules,此时想只删除远程仓库文件，不删除本地文件，可使用下面命令

 git rm --cached 文件（夹）名，此时只删除了仓库中的缓存，实际文件不会删除
 git commit -m '备注'
 git push origin 分支

```

注意：

上述 git commit -m '备注'之前不能使用 git add .命令,因为用了命令相当于把第一步已删除的文件从新添加进入了暂存区，从而形成新的

缓存。后面再使用 gitcommit 和 git push，相当于删除缓存又重新添加缓存，文件仍然存在，提交的时候会提示已经是最新的。

```js
// 若本地和远程都想删除

// 使用一开始介绍的删除文件或者文件夹的两个命令。
// 或者直接删除文件，随后会看到vscode中有个 git变动
git add .
git commit -m '备注'
git push origin 分支

```

### Git 删除分支

```js
git branch -a
git branch -d <BranchName> // 删除本地分支
git push origin --delete <BranchName> // 删除远端分支
git branch -a


```

### Git 获取其他分支的 commit

```js
// 将其他分支的commit合并到master
git checkout master
git cherry-pick 62ecb3
```

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

### git pull 拉取后冲突

有长期未使用的分支，可能已经被删除掉了，当你切换到其他分支，并且拉取 pull 后，可能会产生冲突
此时，不需要保留本地的代码，只需要同步 远程的分支代码
则需要以下操作：

> git clean -d -f // 这一步会强制清空本地的修改，应该是无法找回，需要谨慎处理
> git pull origin master

### git pull 拉取后冲突 2

本地代码如果确定修改或者不需要保存的，可以直接回退版本。

> git 仓库中复制 SHA
> git reset --hard 40a9a83

### git branch --edit-description <BranchName> 描述一个分支的情况

某些情况下，分支可能很多，并且要长时间保存，需要做一个描述记录，则可以用 description 命令

> git branch --edit-description <BranchName>
> 按下 s，输入内容（注意：前面有#代表着不显示，需要去掉#)
> 按下 esc，输入:wq，则保存完毕
> 查看命令： git config branch.<BranchName>.description

### git 修改已经 push 上去的变更

#### 获取前一次的提交 id（commitID）

```
git log <filename>
```

注意： **是上一次的 commitID**，不是最新的 commitID

#### reset 已经提交的文件

```
git reset <commit id> <filename>
```

#### 撤销对此文件的修改

```
git checkout -- <filename>
```

#### 重新 push

```
git add <file>
git commit --amend
git push origin <remote branch> --force
```

因为版本回退，导致落后于远程仓库，所以 push 需要添加--force 进行强制覆盖！该命名需要慎重使用

### git 撤销本地的所有变动

当本地有操作过 merge，回退 commit 等操作时，恢复本地初始状态可以使用

```js
git check .
```

### git 合并两个本地库

当你本地复制了一套代码作为初始备份时候，并且没有将.git 文件一起复制的话，当你做完你的新功能，需要 push 上去的时候，就需要做一些额外的操作

<!-- more -->

> ```js
> 关键词：git pull origin master --allow-unrelated-histories
> ```

#### 本地已经初始化仓库

先将本地的项目初始化为一个 git 仓库，然后再强行合并本地仓库和远程仓库，由于这两个仓库是完全不同的两个仓库，所以直接 pull 都会报错，需要在 pull 的时候假加上–allow-unrelated-histories 才可以 pull 成功。**此方法适用于本地项目已经是一个 git 仓库的情况。**

1. git init
2. git add .
3. git commit -m 'fix'
4. git remote add origin git@github.com:yuanmingchen/tensorflow_study.git
5. git pull origin master --allow-unrelated-histories
6. git push -u origin master

当然，这样你 push 上去，实际上会有很多冲突，解决冲突然后提交就欧克了。

参考如下：[将本地已有的一个项目上传到新建的 git 仓库的方法](https://www.cnblogs.com/presleyren/p/11715218.html)

### GitHub 的 SSH 密钥配置

<!-- more -->

#### 生成本地电脑的 SSH

```js
git config --global user.name "limeng"
git config --global user.email "limeng54231@163.com"
ssh-keygen -t rsa -C limeng54231@163.com
```

#### 找到本地的公钥和私钥

> C:\Users\lee\.ssh
> id_rsa.pub 文件通过记事本打开，可复制到粘贴板

#### 添加到 GitHub

```js
Settings -> 左栏点击 SSH and GPG keys -> 点击 New SSH key
```

验证是否正常工作

```js
ssh -T git@github.com
Hi xxx! You've successfully authenticated, but GitHub does not # provide shell access.
```

#### 注意事项

1. 每次电脑生成本地的 SSH，会将之前的公钥替换掉，导致之前在 github 上添加的 SSH key 失效。
   如果需要管理多个 SSH 和代码仓库的对应关系，需要做以下配置:

   ```js
    cat ~/.ssh/id_rsa.pub   //查看已生成的公钥
    ssh-keygen -t rsa -C 'limeng54231@163.com' -f ~/.ssh/gitee_id_rsa // gitee_id_rsa 为生成的公钥文件名称
   ```

   将生成的 SSH 去添加到对应的代码仓库

   ```js
    touch ~/.ssh/config // ssh文件夹下生成一个config文件
   ```

   打开 config 后，添加以下内容

   ```js
   # gitee
     Host gitee.com
     HostName gitee.com
     PreferredAuthentications publickey
     IdentityFile ~/.ssh/gitee_id_rsa
     # github
     Host github.com
     HostName github.com
     PreferredAuthentications publickey
     IdentityFile ~/.ssh/id_rsa
     //其中Host和HostName填写git服务器的域名，IdentityFile填写私钥的路径。
   ```

   使用以下命令分别测试 GitHub 和 Gitee，查看 SSH Key 是否添加成功。

   ```js
   ssh -T git@gitee.com
   ssh -T git@github.com
   ```

2. todo

### git commit 报错

如果 gitcommit 提交时，可以输入内容，但是 wq 保存后，报错。

报错类似于：

```js
// SyntaxError: Unexpected token '.'
//并且报错的文件是位于node_modules中，则考虑是node版本不正确导致
```

同时可以看下 npm install 时是否有报错，应该会有推荐 node 版本的提示

通过 nvm 下载并且安装新的 node 版本

1. 下载 node[地址](https://nodejs.org/zh-cn/download/releases)
2. 把文件夹名称改为 v14.21.3，并且放入 nvm 中(C:\nvm)
3. 执行 nvm use 14.21.3

可以正常 git commit 了
