---
title: VueX 的基本介绍和使用
date: 2021-09-04 17:16:26
tags: [VueX]
---

<meta name="referrer" content="no-referrer"/>

## VueX 的基本介绍和使用

### VueX 的基本结构

1. state

   状态存储，类似 Data。

2. getter

   可以将 getter 视为一个监听函数。可以避免重复引入一些方法，例如：每次都要对数据进行重复筛选 filter 功能，那么就要引入相同的公共函数。那么就可以用 getter 去直接筛选，并通过类似如下：

   页面中使用：

   ```js
   v-for="item in filterModuleList(searchText)"
   ```

   ```js
   computed: {
     ...mapGetters({
         filterModuleList: "mailHomePageConfig/filterModuleList"
       }),
   }
   ```

   VueX 中定义：

   ```js
   const getters = {
     filterModuleList: (state) => (searchText) => {
       if (searchText) {
         return state.moduleList.filter((item) => {
           console.log(item);
           return item["name"].indexOf(searchText) > -1;
         });
       } else {
         return state.moduleList;
       }
     },
   };
   ```

3. action

   action 实际上是一个专门用于 提供复杂业务逻辑及异步操作（如 axios 的异步请求），然后通过 commit 或者 dispatch 来触发 mutation 从而更新 state 中的数据。

4. mutation

   mutation 用于更新 state 数据，并且只用于更新数据。

### VueX 的要点

1. ...mapState,...mapGetter

   这个是为了节省重复引入 VueX 内的 state 的字段而设计的。

   ES6 的结构方法，函数使用如下：

   ```js
    computed: {
       ...mapState({
         // 传字符串参数 'moduleList' ，可以省略后续的return
         moduleList,
         // 传字符串参数 'count' 等同于 `state => state.count`，这个是别名countAlias
         countAlias: 'count',
         operator: state => state.mailHomePageConfig.operator,
         // 为了能够使用 `this` 获取局部状态，必须使用常规函数
         countPlusLocalState (state) {
         return state.count + this.localCount
       }
       }),
       ...mapGetters({
         filterModuleList: "mailHomePageConfig/filterModuleList"
       }),
       curCity: {
         get() {
           return this.$store.state.mailHomePageConfig.curCity;
         },
         set(value) {
           this.$store.commit("mailHomePageConfig/updateCurCity", value);
         }
       }
     },
   ```

2. dispatch 和 commit

   commit 和 dispatch 的区别在于 commit 是提交 mutatious 的同步操作，dispatch 是分发 actions 的异步操作然后再手动调用 commit 更新

   dispatch：含有异步操作，例如向后台提交数据，写法： this.$store.dispatch(‘action 方法名’,值)

   dispatch 实际上是调用一个异步方法，然后再异步方法中再调用 commit 去同步更新。

   commit：同步操作，写法：this.$store.commit(‘mutations 方法名’,值)
