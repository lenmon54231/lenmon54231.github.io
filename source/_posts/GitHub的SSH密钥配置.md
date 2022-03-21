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

### 添加到 GitHub

```js
Settings -> 左栏点击 SSH and GPG keys -> 点击 New SSH key
```

验证是否正常工作

```js
ssh -T git@github.com
Hi xxx! You've successfully authenticated, but GitHub does not # provide shell access.
```
