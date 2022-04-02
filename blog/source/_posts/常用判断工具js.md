---
title: 常用判断工具
date: 2022-03-02 17:16:26
tags: [ES6, JS]
---

<meta name="referrer" content="no-referrer"/>

## 常用判断工具

> JavaScript 有很多的判断工具，如 Lodash.js 这些库来辅助判断，里面有额外的很多对象、数组、函数。以下记录一些手写的 js 方法，包含各种判断：是否是链接，是否为空，是否是对象，是否为空等常用功能，

<!-- more -->

#### 通用判断功能

```js
const toString = Object.prototype.toString;

export function is(val: unknown, type: string) {
return toString.call(val) === `[object ${type}]`;
}

export function isDef<T = unknown>(val?: T): val is T {
return typeof val !== 'undefined';
}

export function isUnDef<T = unknown>(val?: T): val is T {
return !isDef(val);
}

export function isObject(val: any): val is Record<any, any> {
return val !== null && is(val, 'Object');
}

export function isEmpty<T = unknown>(val: T): val is T {
if (isArray(val) || isString(val)) {
return val.length === 0;
}

if (val instanceof Map || val instanceof Set) {
return val.size === 0;
}

if (isObject(val)) {
return Object.keys(val).length === 0;
}

return false;
}

export function isDate(val: unknown): val is Date {
return is(val, 'Date');
}

export function isNull(val: unknown): val is null {
return val === null;
}

export function isNullAndUnDef(val: unknown): val is null | undefined {
return isUnDef(val) && isNull(val);
}

export function isNullOrUnDef(val: unknown): val is null | undefined {
return isUnDef(val) || isNull(val);
}

export function isNumber(val: unknown): val is number {
return is(val, 'Number');
}

export function isPromise<T = any>(val: unknown): val is Promise<T> {
return is(val, 'Promise') && isObject(val) && isFunction(val.then) && isFunction(val.catch);
}

export function isString(val: unknown): val is string {
return is(val, 'String');
}

export function isFunction(val: unknown): val is Function {
return typeof val === 'function';
}

export function isBoolean(val: unknown): val is boolean {
return is(val, 'Boolean');
}

export function isRegExp(val: unknown): val is RegExp {
return is(val, 'RegExp');
}

export function isArray(val: any): val is Array<any> {
return val && Array.isArray(val);
}

export function isWindow(val: any): val is Window {
return typeof window !== 'undefined' && is(val, 'Window');
}

export function isElement(val: unknown): val is Element {
return isObject(val) && !!val.tagName;
}

export function isMap(val: unknown): val is Map<any, any> {
return is(val, 'Map');
}

export const isServer = typeof window === 'undefined';

export const isClient = !isServer;

export function isUrl(path: string): boolean {
const reg =
/(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]_)?\??(?:[-\+=&;%@.\w_]_)#?(?:[\w]\*))?)$/;
return reg.test(path);
}

```

```js
只允许输入数字(整数：小数点不能输入)

<input type="text" onkeyup="value=value.replace(/[^\d]/g,'')" >

允许输入小数(两位小数)

<input type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" >

允许输入小数(一位小数)

<input type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,1})?).*$/g, '$1')" >

开头不能为0，且不能输入小数

<input type="text" onkeyup="value=value.replace(/[^\d]/g,'').replace(/^0{1,}/g,'')" >

只能输入数字或小数且第一位不能是0和点且只能有一个点

<input type="text" onkeyup="value=value.replace(/[^1-9]{0,1}(\d*(?:\.\d{0,2})?).*$/g, '$1')" >



```
