### 博客使用说明

#### 源码操作

```js
git clone git@github.com:lenmon54231/hexoBlog.git
npm install
cd ./blog
npm install
hexo s
// 此时会生成一个http://localhost:4000地址
```

#### Hexo 操作

```js
hexo clean
hexo g
hexo d
```

#### node 快捷操作（替换重复工作）

```js
node d -g // 只提交源码更新
node d -h // 只更新hexo博客
node d //同时更新GitHub博客源码和hexo博客
node d -n '测试' // 新增博客文章
```
