---
title: ES6的解构
date: 2020-07-12 17:16:26
tags: [ES6,解构]
---

<meta name="referrer" content="no-referrer"/>

## ES6的解构

ES6 允许按照一定模式，从数组和对象中提取值，对变量进行赋值，这被称为解构（Destructuring）。

<!-- more -->

> ```javascript
> let [a, b, c] = [1, 2, 3];
> ```

### 数组的解构用法

```js
let [foo, [[bar], baz]] = [1, [[2], 3]];
foo // 1
bar // 2
baz // 3
```

如果解构不成功，变量的值就等于`undefined`。

```js
let [foo] = [];
let [bar, foo] = [1];
```

以上两种情况都属于解构不成功，`foo`的值都会等于`undefined`。

不完全解构

```js
let [x, y] = [1, 2, 3];
x // 1
y // 2

let [a, [b], d] = [1, [2, 3], 4];
a // 1
b // 2
d // 4
```

默认值

```js
let [foo = true] = [];
foo // true

let [x, y = 'b'] = ['a']; // x='a', y='b'
let [x, y = 'b'] = ['a', undefined]; // x='a', y='b'
```

省去了提前定义变量及赋值的工作。

原理：S6 内部使用严格相等运算符（`===`），判断一个位置是否有值。所以，只有当一个数组成员严格等于`undefined`，默认值才会生效。

例子：

```js
function f() {
  console.log('aaa');
}

let [x = f()] = [1];
```

等价于

```js
let x;
if ([1][0] === undefined) {
  x = f();
} else {
  x = [1][0];
}
```

上述代码判断[1]数组的第一个值是不是undefined，不是的话，就是正常赋值，所以console不会出现

### 对象的解构

```js
let { foo, bar } = { foo: 'aaa', bar: 'bbb' };
foo // "aaa"
bar // "bbb"
```

重命名

```javascript
let { foo: baz } = { foo: 'aaa', bar: 'bbb' };
baz // "aaa"
```

嵌套解构

```javascript
let obj = {
  p: [
    'Hello',
    { y: 'World' }
  ]
};

let { p, p: [x, { y }] } = obj;
x // "Hello"
y // "World"
p // ["Hello", {y: "World"}]
```

前一个p是简写，完整模式是p：p，后一个p是用来做为对象中的匹配使用的，而不是变量。

默认值

```javascript
var {x = 3} = {};
x // 3

var {x, y = 5} = {x: 1};
x // 1
y // 5

var {x: y = 3} = {};
y // 3

var {x: y = 3} = {x: 5};
y // 5

var { message: msg = 'Something went wrong' } = {};
msg // "Something went wrong"
```

### 将数组解构成对象

上面两个例子都是将数据解构成数据，对象解构成对象，现在尝试将数组解构成对象

```javascript
let arr = [1, 2, 3];
let {0 : first, [arr.length - 1] : last} = arr;
first // 1
last // 3
```

相当于将数组的index键视为对象的key来进行匹配。

### 字符串解构

```javascript
const [a, b, c, d, e] = 'hello';
a // "h"
b // "e"
c // "l"
d // "l"
e // "o"
```

字符串本身也有length属性。所有也可以进行解构

```javascript
let {length : len} = 'hello';
len // 5
```

### 函数参数解构

```javascript
function add([x, y]){
  return x + y;
}

add([1, 2]); // 3
```

```javascript
[[1, 2], [3, 4]].map(([a, b]) => a + b);
```

比较以下两个例子：

```javascript
function move({x = 0, y = 0} = {}) {
  return [x, y];
}

move({x: 3, y: 8}); // [3, 8]
move({x: 3}); // [3, 0]
move({}); // [0, 0]
move(); // [0, 0]
```

```javascript
function move({x, y} = { x: 0, y: 0 }) {
  return [x, y];
}

move({x: 3, y: 8}); // [3, 8]
move({x: 3}); // [3, undefined]
move({}); // [undefined, undefined]
move(); // [0, 0]
```

解构很相似，看起来都是设定了默认值，实际上有很大区别

move({x: 3, y: 8})里的参数实际上是传入了function中的后面这个{}，在第一个例子中，即：

```js	
move({x: 3})运作如下
function move({x = 0, y = 0} = {x: 3}) {
  return [x, y];
}
```

第二个例子中：

```js
move({x: 3})运作如下
function move({x , y } = {x: 3}) {
  return [x, y];
}
```

这里很明显看到第二个例子中，传参被替换掉了。y找不到对应的解构对象中的y这个key。会默认为undefined

### 实际使用

**函数参数的定义**

```javascript
// 参数是一组有次序的值
function f([x, y, z]) { ... }
f([1, 2, 3]);

// 参数是一组无次序的值
function f({x, y, z}) { ... }
f({z: 3, y: 2, x: 1});
```

**提取 JSON 数据**

```javascript
let jsonData = {
  id: 42,
  status: "OK",
  data: [867, 5309]
};

let { id, status, data: number } = jsonData;

console.log(id, status, number);
// 42, "OK", [867, 5309]
```

**遍历 Map 结构**

```javascript
const map = new Map();
map.set('first', 'hello');
map.set('second', 'world');

for (let [key, value] of map) {
  console.log(key + " is " + value);
}
// first is hello
// second is world
```

map解构类似于：[[first:hello],[second:world]]

如果只想获取键名，或者只想获取键值，可以写成下面这样。

```javascript
// 获取键名
for (let [key] of map) {
  // ...
}

// 获取键值
for (let [,value] of map) {
  // ...
}
```