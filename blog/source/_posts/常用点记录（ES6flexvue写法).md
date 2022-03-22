---
title: 常用点记录（ES6/flex/vue写法)
date: 2020-03-02 17:16:26
tags: [ES6,新特性]
---

<meta name="referrer" content="no-referrer"/>

## ES6新方法，VUE中样式

ES6， 全称 ECMAScript 6.0 ，是 JavaScript 的下一个版本标准，2015.06 发版。

<!-- more -->

### 样式或者vue中写法的记录问题贴

这个里主要是关于样式中的坑和vue中一些特定写法的记录，统一放入这个帖子中，方便查询

**vue中直接在style中进行判断**

```html
<el-tag        :style="'backgroundColor:white;marginLeft:20px;border:none;marginRight:20px;fontSize:14px;color:'+ (isEdit == true ? 'black': 'lightgrey') +''"
>是否续订:</el-tag>
```

> 外部用“”，内部还需要用‘’包裹，然后再内部使用拼接的写法，同时判断这个条件，还需要用括号包裹起来，并且，对应的值，也需要用‘’包裹起来。

### **Array.apply(null, { length: 20 }) 和 new Array(20)**

```js
render: function (createElement) {
  return createElement('div',
    Array.apply(null, { length: 20 }).map(function () {
      return createElement('p', 'hi')
    })
  )
}
```

> Array.apply(null, { length: 20 }) 生成的数组形式为[undifiend,undifiend,undifiend,.....],
>
> new Array(20)等价于[，，，，]

后面使用.map方法的时候，map方法的限制为：map函数并不会遍历数组中没有初始化或者被delete的元素（有相同限制还有forEach, reduce方法）。而new Array 并没有初始化。所以，需要采用官方的写法。

### ES6新方法

**使用reduce取代map和filter**

```js
let num =[20,30,40,50]
let doubleNum = num.reduce((finalNum,num)=>{
  let numTem = num*2
  if(numTem > 50){
    finalNum.push(numTem)
  }
  return finalNum
},[])
console.log(doubleNum)
```

**统计数组中相同项的个数**

```js
let name = ['tom','jerry','tony','jack','tony','jack']
let nameAsiys = name.reduce((nameObject,object)=>{
  nameObject[object] = nameObject[object] ? ++nameObject[object] : 1
},{})
console.log(nameAsiys)
```

 **删除不需要的属性**

```js
let {_lee,_meng,...others} = {_lee:'first',_meng:'last',object1:'111',object2:'222',object3:'333',object4:'444'}
console.log(others)
```

**在函数参数中解构嵌套对象**

```js
let originObject = {
  name:'lee',
  test:{
    origin:'1',
    fix:'3',
    bug:'555'
  }
}
let {name,test:{bug}} = originObject;
console.log(name,bug)
```

**数组对象去重**

```js
let person = [
     {id: 0, name: "小明"},
     {id: 1, name: "小张"},
     {id: 2, name: "小李"},
     {id: 3, name: "小孙"},
     {id: 1, name: "小周"},
     {id: 2, name: "小陈"},   
];
let personTem = {}
let finalList = person.reduce((personList,element)=>{
  personTem[element.id] ? '' : personTem[element.id] = true && personList.push(element)
  return personList;
},[])
console.log(finalList)
```

