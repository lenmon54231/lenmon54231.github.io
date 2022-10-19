---
title: 修改vscode默认主题颜色
date: 2022-02-09 09:57:05
tags:
---

### 修改 vscode 默认主题颜色

#### 地址

C:\Users\ADMIN\AppData\Local\Programs\Microsoft VS Code\resources\app\extensions\theme-defaults\themes

#### 文件

dark_vs.json

#### 修改颜色

    {
      "scope": "invalid",
      "settings": {
        "foreground": "#569cd6"
      }
    },

### 关闭修改文件名后自动修改相关引入文件

#### 首选项——updateimport——选择 never

