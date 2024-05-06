---
title: Diff原理及示例
date: 2023-04-21 15:20:18
tags: [’Diff', "Vue"]
---

## Diff 原理及示例

<!-- more -->

### b 站讲解

[B 站 Diff 解析](https://www.bilibili.com/video/BV1QL4y1u7Nd?p=1)
[GitHub 源码](https://github.com/bubucuo/vdom)

### Diff 主要是用来干啥的？

Dom 树的更新会消耗大量的资源，如果可以将之前已经渲染好的 Dom 避免更新，直接复用的话，可以节省大量的资源。如何才能知道哪些 Dom 可以复用呢？以及怎么复用速度更快，更节约性能呢？

Vue 和 React 都是通过自己的 Diff 算法实现的，通过算法去判断新、老 Dom 树差异并实现部分 Dom 更新。
下面可以看到一个简化版的 Diff 原理。

#### 示例 Dom 树

```js
oldDomArray =  [{ key: "a" },{ key: "b" },  { key: "c" },{ key: "d" },{ key: "e" },  { key: "f" },{ key: "g" }],
newDomArray =  [{ key: "a" },{ key: "b" },  { key: "d1" },{ key: "e" },{ key: "c" },{ key: "d" },{ key: "h" },{key: "f" },{ key: "g" }],
```

约定对 Dom 的标记（仅仅是标记，而不是涉及到操作，如：append、insert、removeChildren）如下：

```js
// mountElement 元素需要新增 h
// patch  元素可以复用 a b c d e f g
// unmount 元素删除
// move 元素需要移动
```

以上示例可以看出，新老数组的开头和结尾两个 Dom 都是拥有一样的 key，即可以直接复用，这也符合正常的业务情况。
比如：一般页面上 header、footer 等都是固定结构，都是可以直接复用（patch），很少会改变。
所以，第一步就是 去掉头尾两边直接可以复用的部分 dom

#### 从左往右和从右往左查找

```js
function isSameVnodeType(n1, n2) {
  return n1.key === n2.key; // && n1.type === n2.type;
}

let l1 = c1.length;
let l2 = c2.length;
let i = 0;
let e1 = l1 - 1; // 老元素的下标
let e2 = l2 - 1; // 新元素的下标

// *1 从左边往右，如果元素可以复用就继续往右边，否则就停止循环
while (i <= e1 && i <= e2) {
  const n1 = c1[i];
  const n2 = c2[i];
  if (isSameVnodeType(n1, n2)) {
    patch(n1.key);
  } else {
    break;
  }
  i++;
}

// *2 从右边往左，如果元素可以复用就继续往左边，否则就停止循环
while (i <= e1 && i <= e2) {
  const n1 = c1[e1];
  const n2 = c2[e2];
  if (isSameVnodeType(n1, n2)) {
    patch(n1.key);
  } else {
    break;
  }
  e1--;
  e2--;
}
```

通过这一步操作，我们将头尾部分 Dom 给复用 了。
并且更新了 i,e1,e2 的数值，这几个序号很重要，可以让我们获取到 除开头尾可复用 Dom 外的中间部分 Dom 数组，即：

```js
[i,i+1,....,e1-1,e1] //老Dom数组未知部分
[i,i+1,....,e2-1,e2] //新Dom数组未知部分
[ { key: "c" },{ key: "d" },{ key: "e" }]
[ { key: "d1" },{ key: "e" },{ key: "c" },{ key: "d" },{ key: "h" }]
```

> 此时，i=2,e1=4,e2=6

#### 中间未知部分的判断

##### 第一种：老节点遍历完成了，新节点还没有遍历完成（新增 Dom）

说明新节点有多出来的 Dom，即：新增 Dom

```js
if (i > e1) {
  if (i <= e2) {
    while (i <= e2) {
      const n2 = c2[i];
      mountElement(n2.key);
      i++;
    }
  }
}
```

什么情况下才能 i>e1 并且 i< =e2，举个例子：

```js
oldDomArray =  [{ key: "a" },{ key: "b" },],
newDomArray =  [{ key: "a" },{ key: "b" },  { key: "c" },{ key: 'd'}],
```

此时，i=2, e1=1,e2 = 3

**只有这种情况下**，才会符合 i>e1 并且 i< =e2!

> 只有这一种情况么？WHY?

- 如果前后有可复用的元素，那么之前的代码控制了 i 一定 小于等于 e1 并且 i 小于等于 e2

  ```js
  // *1 从左边往右，如果元素可以复用就继续往右边，否则就停止循环
  while (i <= e1 && i <= e2) {
    i++;
  }
  // *2 从右边往左，如果元素可以复用就继续往左边，否则就停止循环
  while (i <= e1 && i <= e2) {
    e1--;
    e2--;
  }
  ```

- 如果没有可复用元素：**i 一定是 0**

  ```js
  oldDomArray =  [{ key: "a" },{ key: "b" },],
  newDomArray =  [{ key: "c" },{ key: "d" },  { key: "e" },{ key: 'f'}],
  ```

  此时，i=0, e1=1,e2 = 3 (**不符合**)

- 如果只有前面有可复用元素：**i 一定等于 e1**

  ```js
  oldDomArray =  [{ key: "a" },{ key: "b" },{ key: "c" }],
  newDomArray =  [{ key: "a" },{ key: "b" },  { key: "e" },{ key: 'f'}],
  ```

  此时，i=2, e1=2,e2 = 3 (**不符合**)

- 如果只有后面有可复用元素：**i 一定是 0**

  ```js
  oldDomArray =  [{ key: "a" },{ key: "b" },{ key: "c" }],
  newDomArray =  [{ key: "d" },{ key: "e" },  { key: "f" },{ key: 'c'}],
  ```

  此时，i=0, e1=1,e2 = 2 (**不符合**)

##### 第二种：新节点遍历完了，老节点还没有遍历完成（删除 Dom）

```js
if (i > e2) {
  if (i <= e1) {
    while (i <= e1) {
      const n1 = c1[i];
      unmount(n1.key);
      i++;
    }
  }
}
```

同理：什么情况下才能 i>e2 并且 i< =e1，举个例子：

```js
oldDomArray =  [{ key: "a" },{ key: "b" },  { key: "c" },{ key: 'd'}],
newDomArray =  [{ key: "a" },{ key: "b" }],
```

此时，i=2, e1=3,e2 = 1

**只有这种情况下**，才会符合 i>e2 并且 i< =e1!

##### 新老节点都有，并且乱序(重点并且复杂的部分)

以上示例获取的中间部分如下：

```js
[i,i+1,....,e1-1,e1] //老Dom数组未知部分
[i,i+1,....,e2-1,e2] //新Dom数组未知部分
[ { key: "c" },{ key: "d" },{ key: "e" }]
[ { key: "d1" },{ key: "e" },{ key: "c" },{ key: "d" },{ key: "h" }]
```

> 此时，i=2,e1=4,e2=6

1. 遍历新数组，建立 Map 的映射关系（Map 主要用于 通过值 反查新数组对应值的下标）

   ```js
   // * 4.1 把新元素做成Map，key:value(index)
   const s1 = i;
   const s2 = i;

   const keyToNewIndexMap = new Map();
   for (i = s2; i <= e2; i++) {
     const nextChild = c2[i];
     keyToNewIndexMap.set(nextChild.key, i);
   }
   console.log("keyToNewIndexMap: ", keyToNewIndexMap);
   ```

   keyToNewIndexMap: Map(5) { 'd1' => 2, 'e' => 3, 'c' => 4, 'd' => 5, 'h' => 6 }

2. 建立一个数组，数组的初始值 均为 0（Array 主要用于建立 新数组下标和老数组下标的对应关系）
   ```js
   // *4.2 记录一下新老元素的相对下标
   const toBePatched = e2 - s2 + 1; // 剩余新元素的个数
   const newIndexToOldIndexMap = new Array(toBePatched);
   // 数组的下标记录的是新元素的相对下标，
   // value初始值是0
   // todo 在4.3中做一件事：一旦元素可以被复用，value值更新成老元素的下标+1
   // 数组的值如果还是0， 证明这个值在新元素中是要mount的
   for (i = 0; i < toBePatched; i++) {
     newIndexToOldIndexMap[i] = 0;
   }
   console.log("newIndexToOldIndexMap: ", newIndexToOldIndexMap);
   ```
   newIndexToOldIndexMap: [ 0, 0, 0, 0, 0 ]
3. **判断删除和添加复用标记**遍历老元素数组，根据 keyToNewIndexMap 的值来判断是删除还是复用，并更新 newIndexToOldIndexMap 的下标值

   ```js
   let patched = 0;

   let moved = false;
   let maxNewIndexSoFar = 0;

   for (i = s1; i <= e1; i++) {
     const prevChild = c1[i];

     if (patched >= toBePatched) {
       unmount(prevChild.key);
       continue;
     }

     const newIndex = keyToNewIndexMap.get(prevChild.key);
     console.log("newIndex: ", newIndex);

     if (newIndex === undefined) {
       // 没有找到要复用它的节点，只能删除
       unmount(prevChild.key);
     } else {
       // 节点要被复用
       //  1 2 3 5 10
       // maxNewIndexSoFar记录队伍最后一个元素的下标
       if (newIndex >= maxNewIndexSoFar) {
         maxNewIndexSoFar = newIndex;
       } else {
         // 插队
         moved = true;
       }

       // newIndex - s2是相对下标
       // i + 1老元素下标+1
       newIndexToOldIndexMap[newIndex - s2] = i + 1;
       //  tips: 问：为什么要用i+1？而不是直接用i，这样更好理解
       //  答： 因为直接用 i  ,可能会遇到 i==0 的情况，此时，无法区分这个 0 是代表该元素可复用，还是新增

       patch(prevChild.key);
       patched++;
     }
   }
   console.log(newIndexToOldIndexMap, "newIndexToOldIndexMap");
   ```

   newIndex: 4
   newIndex: 5
   newIndex: 3
   newIndexToOldIndexMap [ 0, 5, 3, 4, 0 ]
   跟之前的新元素数组比较可以发现：

   ```js
   (oldDomArray = [
     { key: "a" },
     { key: "b" },
     { key: "c" },
     { key: "d" },
     { key: "e" },
     { key: "f" },
     { key: "g" },
   ]),
     [{ key: "d1" }, { key: "e" }, { key: "c" }, { key: "d" }, { key: "h" }];
   ```

   newIndexToOldIndexMap 中下标 0 上的值： 0 代表着没有在老数组中找到对应的值，即没有更新。
   更容易理解的写法其实是这样：

   ```js
   [ 0, 5, 3, 4, 0 ] // 转化对应关系
   [
     {
       oldIndex:0,
       newIndex:0,
     },{
       oldIndex:5, //  5 表示 新数组中的第一个下标对应着老数组中的第五个值。
       newIndex:1, // 新数组中间部分的 下标
     },
     {
       oldIndex:3, //3 表示 新数组中的第二个下标对应着老数组中的第三个值。
       newIndex:2,
     },{
       oldIndex:4, //4 表示 新数组中的第三个下标对应着老数组中的第四个值。
       newIndex:3,
     }
     {
       oldIndex:0,
       newIndex:0,
     },
   ]
   ```

4. **判断新增和添加移动标记**倒着遍历新元素数组，通过判断 newIndexToOldIndexMap[i] 是否等于 0 去确定是新增还是移动

   > tips: 关于移动（move）
   > 问：如何用最小步数使数组变成规定的排序？答：获取到 最大递增序列 后，移动序列之外的元素即可实现最小移动步骤

   ```js
   // * 4.4 去遍新元素 mount、move
   const increasingNewIndexSequence = moved
     ? getSequence(newIndexToOldIndexMap)
     : [];
   let lastIndex = increasingNewIndexSequence.length - 1;
   console.log("increasingNewIndexSequence: ", increasingNewIndexSequence);
   console.log("toBePatched: ", toBePatched);
   for (i = toBePatched - 1; i >= 0; i--) {
     const nextChild = c2[s2 + i];
     // 判断节点是mount还是move
     if (newIndexToOldIndexMap[i] === 0) {
       // nextChild要新增
       mountElement(nextChild.key);
     } else {
       // 可能move
       // i 是新元素的相对下标
       // lastIndex是LIS的相对下标
       if (lastIndex < 0 || i !== increasingNewIndexSequence[lastIndex]) {
         move(nextChild.key);
       } else {
         lastIndex--;
       }
     }
   }
   ```

- 新增很好判断，如果值为 0，说明老数组中没有改元素，则需要新增
  newIndexToOldIndexMap[i] === 0
- 添加 move 的判断则比较复杂

  - 为什么 i !== increasingNewIndexSequence[lastIndex] 则需要添加 move？
    i 是 newIndexToOldIndexMap 数组 的倒序 index
    increasingNewIndexSequence[lastIndex]是不需要添加 move 的 newIndexToOldIndexMap 数组 的倒序 index
    如果这两个值不相等，就说明 当前的这个元素需要添加 move
  - 解释如下：

  ```js
  [{ key: "c" }, { key: "d" }, { key: "e" }];
  [({ key: "d1" }, { key: "e" }, { key: "c" }, { key: "d" }, { key: "h" })];
  ```

  抛开新增的元素 { key: "d1" } 和 { key: "h" }，则里面需要变动的只有 { key: "e" }，将 { key: "e" } 移动到{ key: "d" }之后，就完成了移动，所以需要将 { key: "e" } 打上 move 的标签

  - 如何找到{ key: "e" }元素？答：获取到 最大递增序列 后，反查其他元素，获取到{ key: "e" }

  ```js
  oldDomArray = [
    { key: "a" },
    { key: "b" },
    { key: "c" },
    { key: "d" },
    { key: "e" },
    { key: "f" },
    { key: "g" },
  ];
  newIndexToOldIndexMap: [0, 5, 3, 4, 0];
  increasingNewIndexSequence: [0, 2, 3];
  ```

  > increasingNewIndexSequence 就是 最大递增序列 ，对应的是不需要移动的元素。[0，2，3]对应着 newIndexToOldIndexMap 的第 0 个、第 2 个，第 3 个。值是 [0，3，4] 。
  > **0，2，3 这几个是不需要移动（move）的**。
  > newIndexToOldIndexMap 剩下的则需要 move，即[1，4]。分别对应着 newIndexToOldIndexMap 中的[5,0],0 是代表新增，则只剩下[5]。
  > **5 是需要移动的**。
  > 利用反查找得到 5 就是 oldDomArray 中的第五个 { key: "e" }。

1. 如何获取 最大可递增序列 ？

   - 什么是 最大可递增序列？
     举例：
     1、[0, 5, 3, 4, 0,]中为[0,3,4]对应的下标分别为[0,2,3]
     2、[9, 3, 7, 8, 0,]中为[3,7,8]对应的下标分别为[1,2,3]
     [力扣](https://leetcode-cn.com/problems/longest-increasing-subsequence/)
     [最大递增序列解法说明](https://leetcode-cn.com/problems/longest-increasing-subsequence/solution/dong-tai-gui-hua-he-er-fen-cha-zhao-lian-x7dh/)
     [二分插入算法](https://leetcode-cn.com/problems/N6YdxV/solution/cha-zhao-cha-ru-wei-zhi-by-leetcode-solu-inlw/)
     > (right - left) >> 1 等价于 Math.floor(((right - left) / 2))
   - 如何获取？
     通过 二分替换 实现 最大递增序列

     ```js
     function getSequence(arr) {
       // 返回的是LIS的路径
       const lis = [0];
       const len = arr.length;
       const record = arr.slice();
       for (let i = 0; i < len; i++) {
         const arrI = arr[i];
         if (arrI !== 0) {
           const last = lis[lis.length - 1];
           if (arr[last] < arrI) {
             // 新来的元素比lis最后一个元素大，直接放到lis最后
             //  1 3 5 10
             record[i] = last;
             lis.push(i);
             continue;
           }
           // 二分替换
           let left = 0,
             right = lis.length - 1;
           while (left < right) {
             const mid = (left + right) >> 1;
             if (arr[lis[mid]] < arrI) {
               // 在右边
               left = mid + 1;
             } else {
               right = mid;
             }
           }
           // 从lis里找比arrI大的最小的元素，并且替换
           if (arrI < arr[lis[left]]) {
             if (left > 0) {
               record[i] = lis[left - 1];
             }
             lis[left] = i;
           }
         }
       }
       let i = lis.length;
       let last = lis[i - 1];
       while (i-- > 0) {
         lis[i] = last;
         last = record[last];
       }
       return lis;
     }
     ```

     上面代码核心在 left 的变化

     ```js
     lis[left] = i;
     ```

### 最大可递增序列

#### 二分插入

```js
export const lengthOfLIS = (numsp) => {
  // 每堆的堆顶
  const top = [];
  // 牌堆数初始化为0
  let piles = 0;
  for (let i = 0; i < numsp.length; i++) {
    // 要处理的扑克牌
    let poker = numsp[i];
    // 左堆和最右堆进行二分搜索，因为堆顶是有序排的，最终找到该牌要插入的堆
    let left = 0,
      right = piles;
    //搜索区间是左闭右开
    while (left < right) {
      let mid = left + Math.floor((right - left) / 2);
      if (top[mid] > poker) {
        right = mid;
      } else if (top[mid] < poker) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    //  没找到合适的牌堆，新建一堆
    if (left == piles) piles++;
    // 把这张牌放到堆顶
    top[left] = poker;
  }
  return piles;
};
lengthOfLIS([9, 2, 5, 3, 7]);
```

当第一次循环的时候，left == piles 均为 0，top 为[9]，piles 赋值为 1

当第二次循环的时候，left ==0 < right ==piles =1, 执行 while 循环，mid 为 0，top[0]就是上次存的 9，大于本次 numsp[1]，则将 right 置为 0，并将 top[0] = numsp[1] == 2，top 为[2]

当第三次循环的时候，left ==0 < right ==piles =1，mid 为 0，top[0] 为 2 小于 numsp[3] == 5，执行 left = mid + 1(left = 0+1),接着执行 left == piles （1 == 1)，piles++（piles==2）执行 top[1] = numsp[3]，top 为[2,5]

第四次循环的时候，left ==0 < right ==piles =2，mid 为 1，top[1] 为 5 大于 numsp[4] == 3，right = mid == 1，然后执行 while（0<1)，mid 为 0，top[0] 为 2 小于 numsp[4] == 3，left=0+1，接着执行 top[1] = numsp[4];
top 为[2,3]

第五次循环的时候，left ==0 < right ==piles =2，mid 为 1,top[1] 为 3 小于 numsp[5] == 7，left= mid + 1 ==2，执行 piles++(piles == 3),top[2]=numsp[5] ,top 为[2,3,7]

#### 动态规划

通过 动态规划 实现 最大可递增序列

```js
// nums:[9, 2, 5, 4, 3, 7]
// return：top： [2, 3, 7]
export const selfCheck2 = (nums) => {
  let arr = nums;
  let top = [];
  let dp = new Array(arr.length).fill(1);
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    let left = 0;
    for (let innerIndex = 0; innerIndex < index; innerIndex++) {
      if (arr[innerIndex] < element) {
        dp[index] = Math.max(dp[index], dp[innerIndex] + 1);
        left = Math.max(left, dp[innerIndex]);
      }
    }
    top[left] = element;
  }
  console.log("top: ", top);
  console.log(dp, "dp");
  return top.length;
};
```

核心在于 dp 数组的变化，dp 数组的值类似于二分法中的 left 的值

### 代码示例

```

```
