---

title: 异步迭代器和await
date: 2020-07-12 17:16:26
tags: [js,hexo]
---

<meta name="referrer" content="no-referrer"/>

## 异步迭代器和await

迭代器：迭代器是一种特殊对象，它具有专有接口，所有的迭代器对象都有一个next()方法。async和await：返回一个promise对象和等待对象resolve

### async和await的应用

#### async 起什么作用？

只用记住一点：async总会返回一个promise对象！当你return一个字符串的时候，它会自动通过resolve封装成一个promis对象。

> 如果返回对象本身就是一个promise呢？当然就是直接把这个promise对象返回回去咯！

#### async能用在哪里？

当你需要一个promise对象，并且你不想每次都写new promise代码时：

```js
function getPromise(){
  return new Promise((resolve,reject)=>{
   resolve("long_time_value")
  })
}
```

那么你可以这样：

```js
async function getPromise(){
 return "long_time_value"
}
getPromise()
```

#### await的作用

await必须要和async搭配，并且她的执行分两种情况：

1. await等待的是一个普通字面量，比如字符串之类的，会直接进行下面代码的操作，也就是相当于没有进行阻塞
2. await等待的是一个promise对象，那么只有当这个promise对象resolve之后才会进行下一步的代码

### async和await的优势

看以下代码：

```js
function step1(n) {
    console.log(`step1 with ${n}`);
    return takeLongTime(n);
}

function step2(m, n) {
    console.log(`step2 with ${m} and ${n}`);
    return takeLongTime(m + n);
}

function step3(k, m, n) {
    console.log(`step3 with ${k}, ${m} and ${n}`);
    return takeLongTime(k + m + n);
}
```

普通执行方式：

```js
function doIt() {
    console.time("doIt");
    const time1 = 300;
    step1(time1)
        .then(time2 => {
            return step2(time1, time2)
                .then(time3 => [time1, time2, time3]);
        })
        .then(times => {
            const [time1, time2, time3] = times;
            return step3(time1, time2, time3);
        })
        .then(result => {
            console.log(`result is ${result}`);
            console.timeEnd("doIt");
        });
}

doIt();
```

await执行方式：

```js
async function doIt() {
    console.time("doIt");
    const time1 = 300;
    const time2 = await step1(time1);
    const time3 = await step2(time1, time2);
    const result = await step3(time1, time2, time3);
    console.log(`result is ${result}`);
    console.timeEnd("doIt");
}

doIt();
```

这里最大的区别就是 promise通过then传递参数太麻烦了。

### 迭代器

异步迭代器主要用于：当前请求需要上一个请求返回的数据。这种一部情况，一般是有一个请求数组，需要依次发起请求。并且根据上一次请求可以做相应的动作。

代码如下：

```js
let arr =[promise1,promise2]
const reqArr = {
    [Symbol.asyncIterator]: () => ({
            next: async () => {
              let res = await arr.shift()()
              if (res.code != '0000') {
                return {
                  done: true,
                  value: false,
                }
              }
              return {
                done: req.length == 0,
                value: res,
              }
            },
          }),
        }
for await (const item of reqArr) {
          console.log(item,'item')
}
```

主要的控制有两个：

1. let res = await arr.shift()() 这里的await可以控制请求的返回数据顺序
2. next:()=>{ return{ done：false，value：res}}，这实际上是一个函数。for await of 会默认调用next函数来进行遍历请求。通过返回的对象done字段的true和false来判断是否要执行下一步！

