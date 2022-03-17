---

title: 从JavaScript的构造函数讲到多态
date: 2020-07-12 17:16:26
tags: [js]
---

<meta name="referrer" content="no-referrer"/>

## 从JavaScript的构造函数到多态

### 我们为什么需要构造函数

> 在 JavaScript 中，用 new 关键字来调用的函数，称为构造函数。构造函数首字母一般大写

当某种需求下，需要创建多个属性、方法差不多的对象的时候，就需要构造函数。比如：

```jsx
function Person(name, gender, hobby) {
 this.name = name;
 this.gender = gender;
 this.hobby = hobby;
 this.age = 6;
}

var p1 = new Person('zs', '男', 'basketball');
```

上述代码，可以通过 new关键字，创建一个新对象，这个对象默认就携带了age属性，并且这属性的值是6。

### new做了什么？

其实我们可以不用new，最开始本来是这样的：

```js
let obj = {}
obj._proto_ = Fun.prototype
Fun.call(obj)
return obj
```

1. 定义一个空对象
2. 将obj对象的原型指向构造函数的原型
3. 修改obj对象的this指向，即call它一下
4. 将这个新的obj返回出去

每当我们调用构造函数生成一个新对象的时候，都需要执行一下以上的4步，这太麻烦了，不如用一个关键字来代替这四步，即 new 关键字。

### 由构造函数想到继承

通过new关键字新得到了一个实实在在的对象，但是这个对象内容是默认的。即构造函数是什么属性和方法，生成的对象也是对应的方法。

我如果要生成不同的对象，就需要重新生成对象的模板（它的构造函数）再进行实例化，这也太麻烦了。

**我能不能直接通过某种方式改变构造函数，用来生成新的对象？**

这个就是继承！

简单点说，就是以前：从模板>生成实例，现在：从模板>修改一下之前的模板>生成实例

#### 组合继承

```js
function Person(name) {
  this.name = name
  this.jump = function () {
    console.log('3m')
  }
}
Person.prototype.age = 10

function LittlePerson(name, sex) {
  this.sex = sex //重点！ 新添加了一个sex属性
  this.pet = 'dog' //重点！ 新添加了一个pet属性，他们都拥有一只狗
  this.say = function () {
    console.log('good morning')
  }
  Person.call(this, name) //构造函数继承
}
LittlePerson.prototype = new Person() //原型继承

let littleTom = new LittlePerson('Tom', 'man')
let littleLily = new LittlePerson('Lily', 'girl')
console.log(littleTom.sex, littleLily.sex)
console.log(littleLily.say(), '1111')
console.log(littleLily.jump(), '222')
console.log(littleTom.pet)
```

> 构造函数继承和原型继承，组合到一起，我们就把它叫做组合继承吧。

这里可以看到，子类中，添加了一些新的属性，sex（性别）和pet（宠物）。由LittlePerson构造函数生成的实例，默认有了新的属性sex、pet，和 Person 构造函数生成的实例有了区别。

**这样就通过对父类构造函数的修改生成新的之类构造函数，再生成特定的实例！**

### 多态

上面的继承，可以看到构造函数提供的方法处理是固定的，但是可以通过 多态 来实现 **同一个动作，不同的对象有不同的行为**

```js
function Add(){
function nothing(){
    return 0;
}
function one(a){
    return a;
}
function two(a,b){
     return a+b
}
this.add = function(){
    var length =arguments.length
    switch(length){
        case 0:
        return nothing();
        case 1:
        return one(arguments[0]);
        case 2:
        return two(arguments[0],arguments[1]);
    }
}
}
var p =new Add();
console.log(p.add());//0
console.log(p.add(10));//10
console.log(p.add(10,20));//30
```

