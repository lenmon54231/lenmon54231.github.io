---
title: 使用node上传和下载文件
date: 2020-07-12 17:16:26
tags: [node,express，multer]
---

<meta name="referrer" content="no-referrer"/>

## 使用node上传和下载文件

前后端分离的情况下，如何上传和下载不同格式的文件，环境：node+vue+elementUI+press

<!-- more -->

> blob = new Blob([res.data], { type: 'image/png' });
>
> ​    objectUrl = URL.createObjectURL(blob);

`Blob` 对象表示一个不可变、原始数据的类文件对象。它的数据可以按文本或二进制的格式进行读取，也可以转换成 [`ReadableStream`](https://developer.mozilla.org/zh-CN/docs/Web/API/ReadableStream) 来用于数据操作

### 上传前端

```vue
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            :on-success="uploadSuccess"
            :file-list="fileList"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
```

```js
    uploadUrl: "/api/infor",
    uploadSuccess(res, file, fileList) {
      if (res.code == 200) {
        this.fileList = fileList;
        this.submitForm.fileName = res.rows.originalname;
        this.submitForm.IDName = res.rows.IDName;
        this.$message.success("上传成功");
      } else if (res.code == 999) {
      } else {
        this.fileList = [];
        this.$message.error(res.msg);
      }
    },
```

1. elemengtUI上传组件，填写action，当上传成功后，回调函数中记录下文件**”本身名称类型“**和服务器中的**”被更改后的文件名称“**

2. file list接收到赋值，用于回显

### 上传后端

安装multer

> ```
> npm install --save multer
> ```

引入multer

```js
const objMulter = multer({ dest: '../static/files' });//指定存放位置

app.use(objMulter.any());
```

处理上传来的文件

> Multer 会添加一个 `body` 对象 以及 `file` 或 `files` 对象 到 express 的 `request` 对象中。 `body` 对象包含表单的文本域信息，`file` 或 `files` 对象包含对象表单上传的文件信息。

```JS
//上传的文件
router.post('/api/infor', function (req, res, next) {
  console.log(req.files[0], '传递来的数据')
  const newname = req.files[0].path + path.parse(req.files[0].originalname).ext
  let fileName = req.files[0].filename + path.parse(req.files[0].originalname).ext;
  let info = {
    originalname: req.files[0].originalname,
    IDName: fileName
  }
  fs.rename(req.files[0].path, newname, function (err) {
    if (err) {
      res.send({ code: 999, msg: '上传失败' })
    } else {
      res.send({ code: 200, msg: '上传成功', rows: info })
    }
  })
})
```

1. 调用fs的rename方法，用来对文件进行重命名，保证文件的唯一性。

 ### 下载前端

```js
import { exportInfo } from "../../../static/js/export.js";

download(index, row) {
      let Tem = JSON.parse(JSON.stringify(row));
      let infoTem = Tem.fileName.split(".");
      let nameTem = infoTem.reduce((a, b) => {
        return a + "." + b;
      });
      let info = {
        method: "POST",
        url: "/api/download/" + row._id,
        responseType: "blob",
        type: infoTem[infoTem.length - 1],
        name: nameTem,
      };
      exportInfo(info)
        .then((res) => {})
        .catch(() => {});
    },
```

export.js

```js
import axios from 'axios';

function setUrlParam(data) {
  let _str = '';
  for (let i in data) {
    if (!isNull(data[i])) {
      _str += i + '=' + encodeURIComponent(data[i]) + '&';
    }
  }
  return '?' + _str.substring(0, _str.length - 1);
}
function isNull(e) { // 排除为0 或者其他情况
  let _ = String(e);
  return (_ === 'null' || _ === 'NaN' || _ === 'undefined' || _.length === 0);
}
function whatType(type) {//判断传过来的type类型
  let TypeObject = [
    {
      typeList: ['xlc', 'xll', 'xlm', 'xls', 'xlw', 'xlsx'],
      typeOut: 'excel',
    },
    {
      typeList: ['jpg', 'jpeg', 'png', 'gif'],
      typeOut: 'img',
    },
    {
      typeList: ['zip', '.tar', '.gz'],
      typeOut: 'zip',
    },
    {
      typeList: ['doc', 'docx'],
      typeOut: 'doc',
    },
    {
      typeList: ['ppt', 'pptx'],
      typeOut: 'ppt',
    },
    {
      typeList: ['tar'],
      typeOut: 'tar',
    },
    {
      typeList: ['gzip', 'gz'],
      typeOut: 'gz',
    }
  ]
  let currentType = null;
  TypeObject.forEach(v => {
    let currentIndex = v['typeList'].findIndex(e => e == type)
    if (currentIndex > -1) {
      currentType = v.typeOut
    } else {
      return
    }
  })
  return currentType
}

export function exportInfo(info) {
  return new Promise((resolve, reject) => {
    axios({
      method: info.method,
      url: info.params ? info.url + setUrlParam(info.params) : info.url,
      data: info.params,
      responseType: info.responseType, // 优先尝试 blob
      headers: { 'Authorization': sessionStorage.getItem('token') ? 'Bearer ' + sessionStorage.getItem('token') : '' }
    }).then((res) => {
      console.log(info.type, whatType(info.type), 'whatType(info.type)')
      let objectUrl = null, blob = null;
      if (whatType(info.type) === 'excel') {
        blob = new Blob([res.data], {
          type: "application/vnd.ms-excel"
        });
        objectUrl = URL.createObjectURL(blob);
      } else if (whatType(info.type) === 'img') {
        blob = new Blob([res.data], { type: 'image/png' });
        objectUrl = URL.createObjectURL(blob);
        // objectUrl = 'data:image/png;base64,' + btoa(new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
      } else if (whatType(info.type) === 'zip') {
        blob = new Blob([res.data], { type: 'application/zip' });
        objectUrl = URL.createObjectURL(blob);
      } else if (whatType(info.type) === 'doc') {
        blob = new Blob([res.data], {
          type: "application/msword"
        });
        objectUrl = URL.createObjectURL(blob);
      } else if (whatType(info.type) === 'ppt') {
        blob = new Blob([res.data], {
          type: "application/vnd.ms-powerpoint"
        });
        objectUrl = URL.createObjectURL(blob);
      } else if (whatType(info.type) === 'tar') {
        blob = new Blob([res.data], {
          type: "application/x-tar"
        });
        objectUrl = URL.createObjectURL(blob);
      } else if (whatType(info.type) === 'gz') {
        blob = new Blob([res.data], {
          type: "application/x-gzip"
        });
        objectUrl = URL.createObjectURL(blob);
      } else {
        blob = new Blob([res.data], {
          type: "application/octet-stream"
        });
        objectUrl = URL.createObjectURL(blob);
      }
      console.log(objectUrl, '下载地址')
      let a = document.createElement("a");
      a.href = objectUrl;
      a.download = info.name;
      //a.click();
      //下面这个写法兼容火狐
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      window.URL.revokeObjectURL(blob);
      resolve(res)
    }).catch(error => {
      console.log("response: ", error);
      reject(error)
    })
  })
}

```

1. 下载需要用特定的数据格式接收-blob和指定的type

   ```js
           blob = new Blob([res.data], {
             type: "application/x-gzip"
           });
           objectUrl = URL.createObjectURL(blob);
   ```

2. 模拟 a 链接的行为

   ```js
   let a = document.createElement("a");
         a.href = objectUrl;
         a.download = info.name;
   ```




### 下载后端

```js
router.post('/api/download/:id', function (req, res) {
  db.Demo.findOne({ _id: req.params.id }, function (err, docs) {
    if (err) {
      console.error(err)
      return
    }
    if (docs) {
      console.log(req.params.id, docs.IDName)
      let filePath = '../static/files/' + docs.IDName
      let stats = fs.statSync(filePath);
      console.log(stats)
      if (stats.isFile()) {
        res.set({
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': 'attachment; filename=' + docs.IDName,
          'Content-Length': stats.size
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.end(404);
      }
    }
  })
})
```

1. 数据库中查找服务器的唯一文件名称。以便拼接出filePath文件地址。

2. 读取对应地址的文件流，流入到res中，返回给前端，前端使用blob接收

   ```js
   fs.createReadStream(filePath).pipe(res);
   ```

### 部署到云服务器

1. 使用宝塔安装mongodb，pm2，nginx。

2. nginx需要配置转发。conf文件如下

   ```js
   user  www www;
   worker_processes auto;
   error_log  /www/wwwlogs/nginx_error.log  crit;
   pid        /www/server/nginx/logs/nginx.pid;
   worker_rlimit_nofile 51200;
   
   events
       {
           use epoll;
           worker_connections 51200;
           multi_accept on;
       }
   
   http
   {
           include       mime.types;
   		    #include luawaf.conf;
   
   	    	include proxy.conf;
   
           default_type  application/octet-stream;
   
           server_names_hash_bucket_size 512;
           client_header_buffer_size 32k;
           large_client_header_buffers 4 32k;
           client_max_body_size 50m;
   
           sendfile   on;
           tcp_nopush on;
   
           keepalive_timeout 60;
   
           tcp_nodelay on;
   
           fastcgi_connect_timeout 300;
           fastcgi_send_timeout 300;
           fastcgi_read_timeout 300;
           fastcgi_buffer_size 64k;
           fastcgi_buffers 4 64k;
           fastcgi_busy_buffers_size 128k;
           fastcgi_temp_file_write_size 256k;
   		    fastcgi_intercept_errors on;
   
           gzip on;
           gzip_min_length  1k;
           gzip_buffers     4 16k;
           gzip_http_version 1.1;
           gzip_comp_level 2;
           gzip_types     text/plain application/javascript application/x-javascript text/javascript text/css application/xml;
           gzip_vary on;
           gzip_proxied   expired no-cache no-store private auth;
           gzip_disable   "MSIE [1-6]\.";
   
           limit_conn_zone $binary_remote_addr zone=perip:10m;
   		    limit_conn_zone $server_name zone=perserver:10m;
   
           server_tokens off;
           access_log off;
   
   server
       {
           listen 888;
           server_name phpmyadmin;
           index index.html index.htm index.php;
           root  /www/server/phpmyadmin;
   
           #error_page   404   /404.html;
           include enable-php.conf;
   
           location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
           {
               expires      30d;
           }
   
           location ~ .*\.(js|css)?$
           {
               expires      12h;
           }
   
           location ~ /\.
           {
               deny all;
           }
   
           access_log  /www/wwwlogs/access.log;
       }
   
   server
       {
           listen 80;
           server_name limeng.website;
           index index.html index.htm index.php;
           root  /www/server/nginx/html;
   
           #error_page   404   /404.html;
        location / {
            try_files $uri /index.html;
        }
          
        location /api {
            proxy_pass http://localhost:8088;
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
   include /www/server/panel/vhost/nginx/*.conf;
   }
   ```

   添加对应api 的转发，将api的请求转发到http://localhost:8088，8088端口即是 之前mongodb的listen端口。

   ```js
       location /api {
            proxy_pass http://localhost:8088;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection ‘upgrade’;
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
   ```

