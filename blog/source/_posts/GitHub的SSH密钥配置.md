---
title: GitHub的SSH密钥配置
date: 2021-03-21 17:03:01
tags: [GitHub]
---

## GitHub 的 SSH 密钥配置

<!-- more -->

### 生成本地电脑的 SSH

```js
git config --global user.name "limeng"
git config --global user.email "limeng54231@163.com"
ssh-keygen -t rsa -C limeng54231@163.com
```

### 找到本地的公钥和私钥

> C:\Users\ADMIN\.ssh
> id_rsa.pub 文件通过记事本打开，可复制到粘贴板

### 添加到 GitHub

```js
Settings -> 左栏点击 SSH and GPG keys -> 点击 New SSH key
```

验证是否正常工作

```js
ssh -T git@github.com
Hi xxx! You've successfully authenticated, but GitHub does not # provide shell access.
```

### 注意事项

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
