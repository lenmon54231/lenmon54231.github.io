---
title: 本地端MCP Server + Blender生成模型
date: 2025-04-29 17:33:04
tags: [MCP,Blender,AI]
---


## 通过自然语言让Blender生成模型

正常如果我们需要展示一个模型，都需要让建模师进行建模，并导出一个OBJ模型，最终展示到客户端。

那么，我们有可能通过简单的语言描述就生成一些基础的模型么？甚至当业务需求对模型质量要求不高的情况下，我们可不可以使用自然语言生成的模型来完成整个模型需求，从而直接跳过建模师建模这个步骤！？

使用MCP+BLender尝试一下！

<!-- more -->


### 安装和配置

#### 安装软件

需要先安装以下四个模块：

> Blender 3.0 或更新版本（[blender](https://www.blender.org/)）

> Claude桌面版（部分地区有限制访问，需要挂全局代理）（[Claude](https://Claude.ai/download)）

> Python 3.10 或更高版本（[Python](https://www.python.org/downloads/)）

> uv 包管理器（[uv安装](https://docs.astral.sh/uv/getting-started/installation/?spm=5176.28197581.d_mcp.5.11e95a9eH3z9te)）
>
> 如果你使用的是 Mac，请将 uv 安装为
>```js
>brew install uv
>```
>在 Windows 上
>```js
>powershell -c "irm https://astral.sh/uv/install.ps1 | iex" 
>```
>配置PATH环境变量（这一命令在window上略有不同，无妨，命令行会给出提示）
>
>```js
>set Path=C:\Users\nntra\.local\bin;%Path%
>```

#### 配置软件


##### 配置Claude

* 转到 Claude > setting > Developer > Edit Config > Claude_desktop_config.json 以包含以下内容：

```js
{
    "mcpServers": {
        "blender": {
            "command": "uvx",
            "args": [
                "blender-mcp"
            ]
        }
    }
}
```

* 重新启动Claude

* 等待一下，应该有个更新的过程，可以看到搜索框下面有一个小锤子图标即可

![Claude配置成功](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/Claude.png)

##### 配置Blender

* 下载addon.py配置文件（blender-mcp[https://github.com/ahujasid/blender-mcp/blob/main/addon.py]）

* 打开 Blender

* 前往edit > preferences > add-ons > install from disk

![preferences配置](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/preferences.png)

* 单击“install from disk”并选择addon.py文件

* 安装完成后，应该是已经默认勾选了MCP
![勾选了MCP](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/start.png)

* 回到Blender主界面，右边有个小箭头，打开即可看到MCP工具栏
![MCP工具栏](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/blender.png)

* 开启MCP服务

![开启MCP服务](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/startBlender.png)


### 使用

回到Claude界面，输入以下文字：

> create a sphere for me in the center of the scene in Blender

等待Claude执行完成，即可看到Blender在场景中心位置生成了一个球体

![生成了一个球体](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/create.png)


### 探索（待续）

### 结论（待续）
