---
title: 利用宝塔面板实现Https
date: 2020-07-12 17:16:26
tags: [js,hexo]
---

<meta name="referrer" content="no-referrer"/>

## 利用宝塔面板实现Https

宝塔面板提供了极其方便的https部署功能，比之前部署上一个网站的https方便太多了，简单记录一下步骤

1. 阿里云申请个免费证书，一个账号可以申请20个

   下载证书 ，选择nginx版本，解压可以获取到两个文件

   ![11](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%AE%9D%E5%A1%94%E5%B8%83%E7%BD%AEHTTPS/downloadCRT.png) 

2. 打开宝塔面板，添加站点

   站点名字直接用limeng.work，没有加www

   ![](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%AE%9D%E5%A1%94%E5%B8%83%E7%BD%AEHTTPS/addWebsite.png)

3. 添加成功后，部署SSL证书

   将之前下载的证书文件，复制到对应的位置

   ![](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%AE%9D%E5%A1%94%E5%B8%83%E7%BD%AEHTTPS/copySSL.png)

4. 上传证书到nginx目录

   1. /www/server/nginx/conf目录下，新增cert文件夹
   2. 将之前解压的文件放进去

5. 修改nginx配置

   将以前的80端口监听，改为443端口监听

   ```js
   server
       {
       listen 443 ssl;
       #配置HTTPS的默认访问端口为443。
       #如果未在此处配置HTTPS的默认访问端口，可能会造成Nginx无法启动。
       #如果您使用Nginx 1.15.0及以上版本，请使用listen 443 ssl代替listen 443和ssl on。
       server_name limeng.work; #需要将yourdomain.com替换成证书绑定的域名。
       root html;
       index index.html index.htm;
       ssl_certificate cert/5274483_www.limeng.work.pem;  #需要将cert-file-name.pem替换成已上传的证书文件的名称。
       ssl_certificate_key cert/5274483_www.limeng.work.key; #需要将cert-file-name.key替换成已上传的证书密钥文件的名称。
       ssl_session_timeout 5m;
       ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
       #表示使用的加密套件的类型。
       ssl_protocols TLSv1 TLSv1.1 TLSv1.2; #表示使用的TLS协议的类型。
       ssl_prefer_server_ciphers on;
       location / {
           root html;  #站点目录。
           index index.html index.htm;
       }
       location /api {
            proxy_pass http://localhost:8088;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection ‘upgrade’;
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
       }
       location /music {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection ‘upgrade’;
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
       }
       location /images {
          root  /BLOG/static/files;
          autoindex on;
       }
           access_log  /www/wwwlogs/access.log;
       }
   ```

### 存疑

nginx配置conf文件中，有涉及到证书的配置，但是，在宝塔中的sll功能中，已经看到有对证书文件的配置，不知道是否还要单独在nginx中配置

```js
 ssl_certificate cert/5274483_www.limeng.work.pem;  #需要将cert-file-name.pem替换成已上传的证书文件的名称。
 ssl_certificate_key cert/5274483_www.limeng.work.key; #需要将cert-file-name.key替换成已上传的证书密钥文件的名称。
```

