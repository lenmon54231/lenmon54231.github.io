---
title: 从Vue过渡到React
date: 2022-03-23 14:20:36
tags: [Vue, React]
---

## 从 Vue 过渡到 React（16.8.0）

<!-- more -->

### Vue 的指令和 React 中对应实现方式

1. v-if、v-show 的 React 实现

   ```js
   //v-if实现方式
   isShow ? <SomeComponent> : <Other>

   //v-show实现方式
   <div style="{{display: isShow ?  'block' : 'none'}}">1</div>
   ```

2. v-for 的 React 实现
   ```js
   list.map((e) => {
     return <div>e</div>;
   });
   ```
3. computed 的 React 实现

   ```js
   import React, { useMemo, useState } from "react";
   export default function Computed() {
     const [num1, setNum1] = useState(10);
     const [num2, setNum2] = useState(10);
     const num3 = useMemo(() => {
       return num1 + num2;
     }, [num1, num2]);
     const onAdd = () => {
       setNum1(num1 + 10);
     };
     return (
       <div className="computed">
         <button onClick={onAdd}>+10</button>
         <div>计算结果：{num3}</div>
       </div>
     );
   }
   ```

4. watch 的 React 实现

   ```js
   import React, { useEffect, useState, useMemo } from "react";
   export default function Computed() {
     const [num1, setNum1] = useState(10);
     const [num2, setNum2] = useState(10);
     const num3 = useMemo(() => {
       return num1 + num2;
     }, [num1, num2]);
     useEffect(() => {
       console.log("监听num3变化");
     }, [num3]);
     const onAdd = () => {
       setNum1(num1 + 10);
     };
     return (
       <div className="computed">
         <button onClick={onAdd}>+10</button>
         <div>计算结果：{num3}</div>
       </div>
     );
   }
   ```

5. provide/inject 的 React 实现

   ```js
   //context/index
   import { createContext } from "react";

   export const UserInfoContext = createContext({
     userInfo: {
       name: "",
     },
   });
   ```

   ```js
   // App（父级）
   import { UserInfoContext } from "./context/index";
   const App = () => {
     return (
       <div>
         <UserInfoContext.Provider value={{ userInfo: { name: "前端胖头鱼" } }}>
           <div>
             <SomeComponent />
           </div>
         </UserInfoContext.Provider>
       </div>
     );
   };
   ```

   ```js
   // SomeComponent（子级）
   import React, { useContext } from "react";
   import { UserInfoContext } from "../context/index";
   export default function Provide() {
     // 通过userContext，使用定义好的UserInfoContext
     const { userInfo } = useContext(UserInfoContext);
     return <div class="provide-inject">{userInfo.name}</div>;
   }
   ```

6. slot 默认插槽 的 React 实现

   ```js
   // 子组件
   export default function (props: CardProps) {
     return (
       <div className="card">
         <div className="card__body">
           {/**每个组件都可以获取到 props.children。它包含组件的开始标签和结束标签之间的内容 */}
           {props.children}
         </div>
       </div>
     );
   }
   ```

   ```js
   // 父组件
   import React from "react";
   import Card from "./components/Card";

   export default function () {
     return (
       <div>
         <Card title="标题">
           <div>我将被放在card组件的body区域内容</div>
         </Card>
       </div>
     );
   }
   ```

7. name slot 具名插槽 的 React 实现

   > 当子组件需要根据展示多个 slot 时，就需要 具名插槽 来判断对应关系

   ```js
   //子组件
   import React from "react";
   export default function (props) {
     const { title, renderTitle } = props;
     // 如果指定了renderTtile，则使用renderTitle,否则使用默认的title
     let titleEl = renderTitle ? renderTitle() : <span>{title}</span>;
     return (
       <div className="card">
         <div className="card__title">{titleEl}</div>
       </div>
     );
   }
   ```

```js
//父组件
import React from "react";
import Card from "./components/Card";
export default function () {
  return (
    <div>
      <Card
        renderTitle={() => {
          return <span>我是自定义的标题</span>;
        }}
      >
        <div>我将被放在card组件的body区域内容</div>
      </Card>
    </div>
  );
}
```

1. scope slot 作用域插槽 的 React 实现(也叫 propsRender)

   > 子组件展示父组件传过来的数据，即默认插槽。当父组件要展示子组件的 slot 内部的数据时，即子组件数据要传递到父组件去展示时，就是 作用域插槽

   ```js
   // 子组件
   import React, { useState } from "react";
   export default function (props) {
     const [userInfo] = useState({ name: "张三", age: 25, sex: "男" });

     const content = props.renderUserInfo ? (
       props.renderUserInfo(userInfo)
     ) : (
       <div>
         <span>姓名: {userInfo.name}</span>
         <span>年龄: {userInfo.age}</span>
         <span>性别: {userInfo.sex}</span>
       </div>
     );
     return <div title="人员信息">{content}</div>;
   }
   ```

   ```js
   // 父组件
   import React from "react";
   import UserCard, { UserInfo } from "./components/UserCard";
   export default function () {
     return (
       <div>
         <UserCard
           renderUserInfo={(userInfo: UserInfo) => {
             return (
               <ul>
                 <li>姓名： {userInfo.name}</li>
               </ul>
             );
           }}
         ></UserCard>
       </div>
     );
   }
   ```

### React 上的新内容

#### useMemo 和 useEffect 的区别

1. 在 hooks 中，useEffect 用于模拟 App 的生命周期，
   useEffect 内部可以写多个函数，当监听数组为空时，类似于 mounted 周期。并且不能直接 return 数据出去，需要 return 一个函数出去。return 出去的函数内部可以调用多个函数，类似 unmounted 周期
   ```js
   useEffect(() => {
     // componentDidMount
     init();
     return () => {
       //componentWillUnmount
       leavePageCleanData();
     };
   }, []);
   ```
2. useMemo 也能做监听，并常用于性能优化。解决过度渲染的问题
   过度调用、渲染

   ```js
   // 父组件
   function App() {
     const [name, setName] = useState("名称");
     const [content, setContent] = useState("内容");
     return (
       <>
         <button onClick={() => setName(new Date().getTime())}>name</button>
         <button onClick={() => setContent(new Date().getTime())}>
           content
         </button>
         <Button name={name}>{content}</Button>
       </>
     );
   }
   ```

   ```js
   // 子组件
   function Button({ name, children }) {
     function changeName(name) {
       console.log("11");
       return name + "改变name的方法";
     }
     const otherName = changeName(name);
     return (
       <>
         <div>{otherName}</div>
         <div>{children}</div>
       </>
     );
   }
   ```

   上面的这种形式，当你点击<button onClick={() => setContent(new Date().getTime())}>方法的时候。
   正常来讲，我只调用了 setContent 的方法，子组件中，应该只会更新 content 对应的 children 的字段，而不会调用 otherName 上的 changeName 方法。但实际上子组件中都会重新渲染和调用 changeName 方法
   此时，useMemo 可以实现针对对应字段改变的监听，而不是每次渲染都调用

   ```js
   // 子组件修改如下
   import { useMemo } from "react";
   const Button = ({ name, children }) => {
     function changeName(name) {
       console.log("11");
       return name + "改变name的方法";
     }
     //此处添加useMemo
     const otherName = useMemo(() => {
       return changeName(name);
     }, [name]);
     //此处添加useMemo
     return (
       <>
         <div>{otherName}</div>
         <div>{children}</div>
       </>
     );
   };
   export default Button;
   ```

   这样，当你点击 setContent 时候，因为 otherName 监听的 name 字段未改变，所以不会调用 changeName 方法

3. on
