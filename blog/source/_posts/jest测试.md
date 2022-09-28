---
title: jest测试
date: 2022-09-28 10:05:15
tags: [jest]
---

## jest 测试 使用方法记录

<!-- more -->

### 安装

```js
npm i @babel/preset-typescript
npm i @types/jest -D
npm i jest -D
npm i @babel/preset-env -D npm i @babel/core -D npm i @types/jest -D
npm i @babel/preset-typescript -D
```

### 根目录创建 babel.config.js 文件

```js
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
  ],
};
```

### 运行

在 npm 的 srcpit 模块加上 "test": "jest" ，

```js
npm run test
```

### 测试例子

index.ts

```js
export function add(a, b) {
  return a * b;
}
```

test.ts

```js
import { add } from "../index";

it("init", () => {
  expect(add(1, 1)).toBe(1);
});
```

