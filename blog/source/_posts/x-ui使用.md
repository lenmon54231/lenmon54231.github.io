---
title: X-UI使用
date: 2025-06-03 11:37:04
tags: [x-ui]
---

## X-UI使用记录（使用Ubuntu系统）

X-UI可以快速搭建面板

<!-- more -->


### 一键DD

1. 下载脚本

```shell
curl -O https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh
```

2. 安装系统(ubuntu或者debian)

```shell
bash reinstall.sh ubuntu 22.04
```

OR

```shell
bash reinstall.sh debian 12
```

[原作者git](https://github.com/bin456789/reinstall)

### 搭建X-UI

1. 执行脚本

```shell
bash <(curl -Ls https://raw.githubusercontent.com/vaxilu/x-ui/master/install.sh)
```

2. 输入面板登录账号密码和端口（8377）

3. 打开8377端口

```shell
ufw allow 8377
```

4. 打开443端口（不知道是不是必须的，反正我执行了一次）

```shell
ufw allow 443
```

也可以使用2053（2053端口同样也支持cf转发）

5. 浏览器中打开64.176.37.182:8377（64.176.37.182替换成自己的服务器ip）


### 进行ssl证书申请

#### 去cloudflare配置

[cloudflare官网](https://www.cloudflare.com/zh-cn/)

1. 添加自己的域名，然后cf将生成的dns解析地址，将地址填写到域名厂商dns解析处

![cf地址](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/xui/cfdns.png)

![腾讯云云解析地址](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/xui/yundns.png)

2. 先只使用cf的dns解析，暂时先不使用cdn，即：暂时先不开启橙色的云的图标

![腾讯云云解析地址](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/xui/justdns.png)


3. cf 申请global API

右上角配置文件按钮 > API令牌 > API 密钥 > Global API Key 点击查看 以获取key

3. X-UI执行申请ssl证书

需要提前准备以下数据：

>1.cf注册邮箱

>2.cf Global API Key

>3.域名

* 执行脚本

```shell
x-ui
```

* 选择16,按照提示输入3dweb.top域名和其他信息

* 脚本最后会执行到成功


### X-UI面板中添加入站地址


![入站列表](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/xui/vmess.png)

之前用的是443，同样如果之前的端口改成了2053，此处配置也需要改成2053

### 使用

在X-UI的入站列表里点击查看，即可出现弹窗，点击复制链接，然后复制到ray里即可

### 开启cdn

此时可以进入cf开启cdn，即将橙色的小云朵打开
