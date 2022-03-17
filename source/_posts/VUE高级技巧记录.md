---
title: VUE高级技巧记录
date: 2020-07-12 17:16:26
tags: [js,hexo]
---

<meta name="referrer" content="no-referrer"/>

## 真实项目中应用VUE的进阶功能

自定义指令，混入，持续更新中

### 自定义指令

> 当你需要对普通 DOM 元素**进行底层操作**，这时候就会用到自定义指令

1. 全局注册和局部注册

   ```js
   // 注册一个全局自定义指令 `v-focus`
   Vue.directive('focus', {
     // 当被绑定的元素插入到 DOM 中时……
     inserted: function (el) {
       // 聚焦元素
       el.focus()
     }
   })
   
   //注册一个局部组件指令
   directive:{
     focus:{
        // 指令的定义
       inserted:function(el){
         el.focus()
       }
     }
   }
   ```

2. 示例（改造后台系统的权限功能）

   根据后台返回的权限数据来判断是否显示按钮

   - HTML结构

   ```js
   <div id="app">
     <span class="mr_15">
             <el-button
               :loading="isLoading"
               type="primary"
               @click="addNewItem"
               v-has:merchantsMatchActivity_add
               >新增</el-button
             >
           </span>
   </div>
   ```
   - JS

   ```js
   Vue.directive('has', {
     inserted: (el, binding, vnode) => {
       console.log(vnode, el.parentNode)
       let path = vnode.context.$route.path.split('/')[1]
       if (!checkHasPass(path, binding.arg)) {
         el.parentNode.removeChild(el)
       }
     },
   })
   
   function checkHasPass(path, name) {
     let operator = openFun(path)
     let pass = false
     for (const key in operator) {
       if (key == name) {
         pass = true
       }
     }
     return pass
   }
   ```

   ```js
   openFun是一个筛选数据的函数，如果有对应的权限字段，会返回一个对象
   let op = {};
   let oneLevelArr = [];
   function getPer(arr) {
     for (let i = 0; i < arr.length; i++) {
       //只要商客 sys:10
       if (arr[i].sys == 10) {
         if (arr[i]["children"] && arr[i]["children"].length) {
           getPer(arr[i]["children"]);
         }
         oneLevelArr.push(arr[i]);
       }
     }
   }
   const openFun = function(name) {
     console.log(name);
     op = {};
     oneLevelArr = [];
     getPer(JSON.parse(sessionStorage.getItem("resources")));
     for (let i = 0; i < oneLevelArr.length; i++) {
       if (String(oneLevelArr[i]["icon"]) === name) {
         op[oneLevelArr[i]["resourceMark"]] =
           Number(oneLevelArr[i]["resourceType"]) === 1;
       }
     }
     return op;
   };
   export default openFun;
   ```

   ```js
   resources形如:通过循环router中的children.resourceMark去判断是否有权限
   [
     {
       router: 'merchantsMatchActivity',
       resourceName: '比赛激励管理',
       sys: 10,
       children: [
         resourceMark: 'merchantsMatchActivity_add',
         icon: 'merchantsMatchActivity',
       ]
     }
   ]
   ```

   Tips:

   1. el.parentNode.removeChild(el)方法需要配合inserted周期，配置bind周期会报错，父节点为null
   2. v-has:merchantsMatchActivity_add，冒号后面的字段会通过arg来拿到，并和resource去循环判断


3. 详细说明

   1. 钩子函数

      - **bind**：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
      - **inserted**：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
      - **update**：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新。
      - **componentUpdated**：指令所在组件的 VNode 及其子 VNode 全部更新后调用。
      - **unbind**：只调用一次，指令与元素解绑时调用。

   2. 钩子函数参数

      > 除了 `el` 之外，其它参数都应该是只读的

      指令钩子函数会被传入以下参数：

      - `el`：指令所绑定的元素，可以用来直接操作 DOM 。
      - `binding`：一个对象，包含以下属性：
        - `name`：指令名，不包括 v- 前缀。
        - `value`：指令的绑定值，例如：v-my-directive="1 + 1" 中，绑定值为 2。
        - `oldValue`：指令绑定的前一个值，仅在 update 和 componentUpdated 钩子中可用。无论值是否改变都可用。
        - `expression`：字符串形式的指令表达式。例如 v-my-directive="1 + 1" 中，表达式为 "1 + 1"。
        - `arg`：传给指令的参数，可选。例如 v-my-directive:foo 中，参数为 "foo"。
        - `modifiers`：一个包含修饰符的对象。例如：v-my-directive.foo.bar 中，修饰符对象为 { foo: true, bar: true }。
      - `vnode`：Vue 编译生成的虚拟节点。
      - `oldVnode`：上一个虚拟节点，仅在 update 和 componentUpdated 钩子中可用。

   

   ### 动态路由
   
   #### 官网动态路由解释
   
   当多个router-link对应一个组件的时候，可以去使用动态路由，而不用设置多个组件一一对应
   
   ```js
   const User = {
     template: '<div>User</div>'
   }
   
   const router = new VueRouter({
     routes: [
       // 动态路径参数 以冒号开头
       { path: '/user/:id', component: User }
     ]
   })
   ```
   
   组件内部:可以通过$route.params的形式拿到数据，从而可以渲染不同的数据出来
   
   ```js
   const User = {
     template: '<div>User {{ $route.params.id }}</div>'
   }
   ```
   
   > 当使用动态路由的时候，mounted周期会失效，因为为了节省开销，VUE在你使用动态路由功能的时候会复用之前已经生成的组件，导致根本就不会进入初始化周期。为此，添加一个新的周期：beforeRouteUpdate

```js
const User = {
  template: '...',
  beforeRouteUpdate (to, from, next) {
    // react to route changes...
    // don't forget to call next()
  }
}
```

#### 实际上的动态路由应用

实际上，我们谈论动态路由的时候，更多的是说获取后端的数据、动态添加路由、从而实现权限等渲染控制。类似动态生成菜单功能

1. 后端返回的数组数据

   后端返回路由数据如下：

   ```js
   routerList = [
     {
           "path": "/other",
           "component": "Layout",
           "redirect": "noRedirect",
           "name": "otherPage",
           "meta": {
               "title": "测试",
           },
           "children": [
               {
                   "path": "a",
                   "component": "file/a",
                   "name": "a",
                   "meta": { "title": "a页面", "noCache": "true" }
               },
               {
                   "path": "b",
                   "component": "file/b",
                   "name": "b",
                   "meta": { "title": "b页面", "noCache": "true" }
               },
           ]
       }
   ]	
   ```

2. 前端静态路由

   ```js
   import Vue from 'vue'
   import Router from 'vue-router'
   import Layout from '@/layout';
   Vue.use(Router)
   // 配置项目中没有涉及权限的公共路由
   export const constantRoutes = [
       {
           path: '/login',
           component: () => import('@/views/login'),
           hidden: true
       },
       {
           path: '/404',
           component: () => import('@/views/404'),
           hidden: true
       },
   ]
   
   const createRouter = () => new Router({
       mode: 'history',
       scrollBehavior: () => ({ y: 0 }),
       routes: constantRoutes
   })
   const router = createRouter()
   
   export function resetRouter() {
       const newRouter = createRouter()
       router.matcher = newRouter.matcher
   }
   
   export default router
   ```

   静态路由就直接按照正常的写法来处理

3. 处理后台返回的路由格式

   新建一个公共的`asyncRouter.js`文件

   ```js
   // 引入路由文件这种的公共路由
   import { constantRoutes } from '../router';
   // Layout 组件是项目中的主页面，切换路由时，仅切换Layout中的组件
   import Layout from '@/layout';
   export function getAsyncRoutes(routes) {
       const res = []
       // 定义路由中需要的自定名
       const keys = ['path', 'name', 'children', 'redirect', 'meta', 'hidden']
       // 遍历路由数组去重组可用的路由
       routes.forEach(item => {
           const newItem = {};
           if (item.component) {
               // 判断 item.component 是否等于 'Layout',若是则直接替换成引入的 Layout 组件
               if (item.component === 'Layout') {
                   newItem.component = Layout
               } else {
               //  item.component 不等于 'Layout',则说明它是组件路径地址，因此直接替换成路由引入的方法
                   newItem.component = resolve => require([`@/views/${item.component}`],resolve)
                   
                   // 此处用reqiure比较好，import引入变量会有各种莫名的错误
                   // newItem.component = (() => import(`@/views/${item.component}`));
               }
           }
           for (const key in item) {
               if (keys.includes(key)) {
                   newItem[key] = item[key]
               }
           }
           // 若遍历的当前路由存在子路由，需要对子路由进行递归遍历
           if (newItem.children && newItem.children.length) {
               newItem.children = getAsyncRoutes(item.children)
           }
           res.push(newItem)
       })
       // 返回处理好且可用的路由数组
       return res
   }
   
   ```

   其中，newItem这个变量会被改造成类似如下结构：

   ```js
    {
           path: '/file',
           component: () => import('@/views/file'),
           hidden: true,
           name: "a",
           meta: { "title": "a页面", "noCache": "true" }
       },
   ```

4. 添加到router上去

   创建路由守卫：创建公共的permission.js文件，设置路由守卫

   ```js
   //  进度条引入设置如上面第一种描述一样
   import router from './router'
   import store from './store'
   import NProgress from 'nprogress' // progress bar
   import 'nprogress/nprogress.css' // progress bar style
   import { getToken } from '@/utils/auth' // get token from cookie
   import { getAsyncRoutes } from '@/utils/asyncRouter'
   
   const whiteList = ['/login'];
   router.beforeEach( async (to, from, next) => {
       NProgress.start()
       document.title = to.meta.title;
       // 获取用户token，用来判断当前用户是否登录
       const hasToken = getToken()
       if (hasToken) {
           if (to.path === '/login') {
               next({ path: '/' })
               NProgress.done()
           } else {
               //异步获取store中的路由
               let route = await store.state.addRoutes;
               const hasRouters = route && route.length>0;
               //判断store中是否有路由，若有，进行下一步
               if ( hasRouters ) {
                   next()
               } else {
                   //store中没有路由，则需要获取获取异步路由，并进行格式化处理
                   try {
                       const accessRoutes = getAsyncRoutes(await store.state.addRoutes );
                       // 动态添加格式化过的路由
                       router.addRoutes(accessRoutes);
                       next({ ...to, replace: true })
                   } catch (error) {
                       // Message.error('出错了')
                       next(`/login?redirect=${to.path}`)
                       NProgress.done()
                   }
               }
           }
       } else {
           if (whiteList.indexOf(to.path) !== -1) {
               next()
           } else {
               next(`/login?redirect=${to.path}`)
               NProgress.done()
           }
       }
   })
   
   router.afterEach(() => {
       NProgress.done()
   })
   ```

5. 在main.js中引入permission.js文件

6. 在login登录的时候将路由信息存储到store中

   ```js
   //  登录接口调用后，调用路由接口，后端返回相应用户的路由res.router，我们需要存储到store中，方便其他地方拿取
   this.$store.dispatch("addRoutes", res.router);
   ```

   到这里，整个动态路由就可以走通了，但是页面跳转、路由守卫处理是异步的，会存在动态路由添加后跳转的是空白页面，这是因为路由在执行next()时，router里面的数据还不存在，此时，你可以通过window.location.reload()来刷新路由

### 混入（mixin）

