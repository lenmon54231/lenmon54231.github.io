---
title: less使用记录
date: 2022-02-06 17:57:51
tags: [less]
---

## less 使用方法记录

<!-- more -->

### 使用 VUE 导出的变量

```html
<div :style="`--gridNumber: ${gridNumber}`">
  <div class="typeList"></div>
</div>
```

```js
//  setup中定义,并返回出去
const isChangeTypeStyle = ref(false);
return {
  isChangeTypeStyle,
};
```

```css
.typeList {
  display: grid;
  grid-template-columns: repeat(var(--gridNumber), 190px);
  grid-column-gap: 12px;
  margin-bottom: 22px;
  justify-content: center;
}
```

less 会在父级 dom 上寻找 --gridNumber ，并应用到子 Dom 的对应变量中

### 超出则...

```css
.one-line-hidden {
  overflow: hidden;
  text-overflow: ellipsis; //文本溢出显示省略号
  white-space: nowrap; //文本不会换行
}

.more-line-hidden {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
```
