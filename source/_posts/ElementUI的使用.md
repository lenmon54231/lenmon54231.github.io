---
title: ElementUI的使用
date: 2020-01-02 17:16:26
tags: [ElementUI,form，tabs,table]
---

<meta name="referrer" content="no-referrer"/>

## ElementUI的使用记录

### ElementUI的入门-组件的使用

记录常用的组件，如Form，Tabs，Table等使用，还有一些常用的使用情况也会记录

<!-- more -->

## elementUI的下拉框返回对象

### 一般下拉框返回都是一个值，比如id，value之类的，某些情况下，需要返回对象{id：25，name：lee}之类，则需要额外参数value-key

```js
data(){
　　return{
　　　　test:'',
　　　　arr:[{id:1,name:'张三'},{id:2,name:'李四'},{id:3,name:'王五'}]
　　}

}

<el-select v-model="test" value-key="id">
　　<el-option v-for="item in arr" :label="item.name" :key="item.id" :value="item"></el-option>
</el-select>
```

## elementUI的级联器懒加载三级联动

### 典型的级联器

代码：

```html
             <div class="block">
                <el-cascader
                  v-model="editMallInfo.addressCode"
                  :props="props"
                  :options="options"
                  @change="handleChange"
                  :placeholder="addressCodePlaceholder"
                ></el-cascader>
              </div>
```



```js
data() {
    return {
       props: {
        lazy: true,
        lazyLoad(node, resolve) {
          let nodes = [];
          const { level, root, value } = node;
          if (node.level == 1) {
            api.citysByProvinceCode({ provinceCode: node.value }).then(res => {
              const nodes = Array.from(res.data).map(item => {
                return {
                  value: item.areaCode,
                  label: item.areaName,
                  leaf: level >= 2
                };
              });
              // 通过调用resolve将子节点数据返回，通知组件数据加载完成
              resolve(nodes);
            }, 1000);
          } else if (node.level == 2) {
            api.districtByCityCode({ cityCode: node.value }).then(res => {
              const nodes = Array.from(res.data).map(item => {
                return {
                  value: item.areaCode,
                  label: item.areaName,
                  leaf: level >= 2
                };
              });
              resolve(nodes);
            }, 1000);
          }
        }
      },
      options: []
    }
}
```

```js
    getCityAndProvice() {
      api
        .allProvince()
        .then(res => {
          for (let i = 0; i < res.data.length; i++) {
            res.data[i].label = res.data[i].areaName;
            res.data[i].value = res.data[i].areaCode;
            this.options.push(res.data[i]);
          }
        })
        .catch();
    },
```

通过控制prop中的leaf: level >= 2，来判断是否需要加载下一级。

## 关于el-form的清除表单数据的坑

代码：

```html
        this.$nextTick(() => {
          this.$refs["SecondLevelform"].resetFields();
        });
```

清空表单有时候会在页面报错，因为找不到对应的dom，所以需要再dom下一次更新后，再清除。

## Form的使用

### 典型的表单

```html
        <el-form
          :inline="true"
          ref="searchForm"
          :model="searchForm"
          :rules="rules"
          @keyup.enter.native="loadTableData"
        >
          <el-form-item label="日期筛选">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              clearable
              unlink-panels
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="商品ID" prop="goodsId">
            <el-input v-model="searchForm.goodsId" clearable placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="sku编号" prop="specsId">
            <el-input v-model="searchForm.specsId" clearable placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="商品类型" prop="goodsTypeId">
            <el-select v-model="searchForm.goodsTypeId" clearable placeholder="请输入" class="m_r_10">
              <el-option label="电子券商品" value="0"></el-option>
              <el-option label="虚拟商品" value="2"></el-option>
              <el-option label="实物商品" value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单号" prop="orderId">
            <el-input clearable v-model="searchForm.orderId" placeholder="请输入">
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleClickResetSearch">重置</el-button>
            <el-button type="primary" @click="handleClickSarch">查询</el-button>
          </el-form-item>
        </el-form>
<script>
  export default {
  data() {
    return {
      dateRange: "",
      searchForm: {
        orderId: null,
        brandId: null,
        goodsTypeId: null,
        specsId: null,
        goodsId: null
      },
      rules: {
        goodsId: [
            { required: true, message: '请输入商品ID', trigger: 'blur' },
            { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
          ],
        specsId: [{ required: true, validator: this.validateNumber, trigger: "change" }]
      },
      activeName: "first"
    };
  },
    methods: {
      onSubmit() {
        console.log('submit!');
      }
    }
  }
</script>
```

### 基本构成

> 外层：<el-from>
>
> 内部：<el-form-item>

### Form上的关键值

1. ref：用在获取这个form的元素后做一些操作，比如resetFields（清空）

   > this.$refs["searchForm"].resetFields();

2. :model:"表单数据对象"，这个实际上是表单内的各种选项的数据集合，比如你的item内选择了name，region等等。主要是为了rules去验证其内容。

3. :rules:校验规则，

   1. 提供普通校验规则：

              goodsId: [
                  { required: true, message: '请输入商品ID', trigger: 'blur' },
                  { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                ],

   2. 提供自定义校验规则：

      ```js
         data() {
             return {
                 rules: {
              goodsId: [
                  { required: true, message: '请输入商品ID', trigger: 'blur' },
                  { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                ],
               }
             }
         }
      ```

      ```js
      methods: {
              validateNumber(event,data,callback){
            if(data > 2){
              callback(new Error("数字大于2"))
            }else{
              callback(new Error("数字小于等于2"))
            }
          }
      }
      ```

      

4. inline:表单域变为行内的表单域，就是将表单内的item变为一行显示，通过inline-block的形式。

### Form上的方法

1. validate：对整个表单进行检验,valid为true则校验成功

   ```js
   this.$refs["searchForm"].validate(valid => {
       conso.log(valid)
   })
   ```

   

1. validateField:对表单的一部分进行校验

   一般使用场景为：比如填写了密码后，需要填写二次密码，那么填写二次密码之后，可以直接通过validateField校验第一次的密码

   ```js
   this.$refs["searchForm"].validateField('goodsId');
   ```

   

2. resetFields:清空。

3. clearValidate：移除表单项的校验结果。

### Form-item上的常用关键值

1. prop：表单域 model 字段，类似于item的名字，可以用来区分不同的item
2. label：显示文本
3. required:该item是否是必须填写的

### Form-item上的方法

1. resetField:同上
2. clearValidata:同上

## Tabs的使用

### 典型使用

```js
<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
    <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
    <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
    <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
  </el-tabs>
</template>
<script>
  export default {
    data() {
      return {
        activeName: 'second'
      };
    },
    methods: {
      handleClick(tab, event) {
        console.log(tab, event);
      }
    }
  };
</script>
```

### 典型结构

```htm
  <el-tabs v-model="activeName" @tab-click="handleClick">
  <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
  </el-tabs>
```



### Tabs上的关键值

1. value / v-model：选中选项卡的 name

2. type

3. closable

4. addable

5. tab-position

6. stretch

## table的使用

### 典型使用

```html
  <el-table
    :data="tableData"
    border
    style="width: 100%">
    <el-table-column
      prop="date"
      label="日期"
      width="180">
    </el-table-column>
    <el-table-column
      prop="name"
      label="姓名"
      width="180">
    </el-table-column>
    <el-table-column
      prop="address"
      label="地址">
    </el-table-column>
  </el-table>
```

### 特征值 

1. border
2. fit

## Slot !important

### 典型使用

```html
 <template slot-scope="scope">
          <div v-for="item in scope.row.goodsInfo"> 
            <span v-if="item.goodsTypeId === 0">电子券</span>
            <span v-if="item.goodsTypeId === 1">实物商品</span>
            <span v-if="item.goodsTypeId === 2">虚拟商品</span>
          </div>
  </template>
```

### 使用场景

1. 广泛的适用于各类form，tables中，其用法实现根据父级对象传值来显示不同的子集元素内容
2. template中使用  slot-scope， 模板内部通过 scope.row 去调用父级对象传过来的值



## 动态循环el-table

### 需求

table的第一行渲染，要根据接口的返回值，来动态的生成，并且要匹配到对应的位置。

![image-20200813144655982](C:\Users\李蒙\AppData\Roaming\Typora\typora-user-images\image-20200813144655982.png)

### 实现

需要两个接口返回数据：

1.需要返回第一行的数据

2.返回table中的具体数据

返回格式如下：

``` js
[{name: "中餐", id: 9}, {name: "西餐", id: 11}, {name: "小吃快餐", id: 263}, {name: "火锅", id: 264},…]
```

```js
[{11: 1, 263: 1, 264: 3, 471: 3, 472: 1, orderBySign: 1597161600000, x: "2020-08-12"},…]
```

对象的name用来渲染到table上，id则使用来匹配具体的数据。id对应的value即是table数据的key

el-table的渲染如下：

```html
            <el-table
              v-loading="tableLoading"
              :data="finaListSigle"
              border
              class="table"
              ref="multipleTable"
            >
              <el-table-column label="日期">
                <template slot-scope="scope">
                  <div>{{scope.row.x}}</div>
                </template>
              </el-table-column>
              <el-table-column
                v-for="(info,index) in twoTableTitle"
                :key="index"
                :property="info.id"
                :label="info.name"
              >
                <template slot-scope="scope">
                  <div>{{scope.row[scope.column.property]}}</div>
                </template>
              </el-table-column>
            </el-table>
```



### 核心

主要实现的逻辑是，如何将对应的key放到slot的插槽中去。具体代码如下：

```html
 :property="info.id"
<div>{{scope.row[scope.column.property]}}</div>
```

## 日期选择器的限制

### elementUI提供了日期选择器并提供了对应的限制选择方法

```js
一个下拉框，可以选择每月的天数   
<div>
      <el-select
        placeholder="每月开始时间（1-28）"
        v-model="submitInfo.matchStartDay"
        @change="pickDate"
      >
        <el-option
          v-for="item in matchStartDayArr"
          :label="item.label"
          :key="item.value"
          :value="item.value"
        ></el-option>
      </el-select>
    </div>
一个日期选择框，可以选择月份范围
<div class="block">
    <span class="demonstration">默认</span>
    <el-date-picker
      v-model="value1"
      type="monthrange"
      :picker-options="pickerOptions"
      range-separator="至"
      start-placeholder="开始月份"
      end-placeholder="结束月份">
    </el-date-picker>
  </div>
```

现在需要让日期选择和月份范围选择联动起来，即：选择日期如果超过今天的日期，则当月不能选择，如果未超过今天的日期，则当月范围可以选择

```js
:picker-options="pickerOptions"
let currentDate = ''
data(){
  return{
    pickerOptions: {
        disabledDate(time) {
          return time.getTime() < currentDate
        },
      },
  }
}


```

核心在于这个函数：

>         disabledDate(time) {
>           return time.getTime() < currentDate
>         },

当 time.getTime() < currentDate 为真，则当前的time会被渲染成不可选择，如果为假，则会被渲染成可以选择

currentDate的判断生成如下：

```js
 pickDate() {
      this.value1 = []
      let nowTime = Date.now()
      let nowTimeString = commonTools.timestampToString(
        JSON.parse(JSON.stringify(nowTime))
      )
      let yearTem = nowTimeString.split('-')[0]
      let mouthTem = nowTimeString.split('-')[1]
      console.log(nowTimeString.split('-'), '1111')
      let dayTem =
        this.submitInfo.matchStartDay +
        nowTimeString
          .split('-')[2]
          .substr(2, nowTimeString.split('-')[2]['length'])
      let selectTime = commonTools.stringToTimestamp(
        yearTem + '-' + mouthTem + '-' + dayTem
      )
      if (nowTime - selectTime > 0) {
        if (mouthTem + 1 > 12) {
          yearTem = parseInt(yearTem) + 1
          mouthTem = '01'
        } else {
          let mt1 = parseInt(mouthTem) + 1
          mouthTem = mt1 > 9 ? mt1 : '0' + mt1
        }
        currentDate = commonTools.stringToTimestamp(
          yearTem + '-' + mouthTem + '-01 00:00:00'
        )
      } else {
        currentDate = commonTools.stringToTimestamp(
          yearTem + '-' + mouthTem + '-01 00:00:00'
        )
      }
    },
```

Tips: 1. commonTools.timestampToString、commonTools.stringToTimestamp这些函数都是做一个转换，将时间戳转化成对应字符串或者将字符串转化成时间戳

```js
 stringToTimestamp: function stringMake(string) {
    //   字符串转化为时间戳
    // let date = '2015-03-05 17:59:00.0';
    let date = string.substring(0, 19)
    date = date.replace(/-/g, '/')
    let timestamp = new Date(date).getTime()
    return timestamp
  },
  timestampToString: function timestampMake(timestamp) {
    // 将时间戳转化为xxxx-xx-xx xx:xx:xx
    let d = new Date(timestamp * 1) //根据时间戳生成的时间对象
    let date =
      d.getFullYear() +
      '-' +
      (d.getMonth() + 1) +
      '-' +
      d.getDate() +
      ' ' +
      d.getHours() +
      ':' +
      d.getMinutes() +
      ':' +
      d.getSeconds()
    return date
  },
```

