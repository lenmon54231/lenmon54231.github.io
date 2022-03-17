---
title: Vue阅读文档笔记
date: 2020-07-12 17:16:26
tags: [js,hexo]
---

<meta name="referrer" content="no-referrer"/>

## Vue阅读文档笔记

### 为什么要阅读文档

从Vue的文档中，可以看到很多有趣的东西，比如：为什么要添加Vue的某个新特性，并用来解决对应的什么问题？从这些feature中就可以观察到前端工程化的一些变化。

### 风格指南

Vue提供了一种推荐的组件风格命名规则，可以在[风格指南](https://cn.vuejs.org/v2/style-guide/)中查阅到关于组件名的建议。文章很长！

### 详细阅读文档笔记

#### 组件

1. 自定义组件的小写加短横线命名规则

   在注册一个组件的时候，我们始终需要给它一个名字。比如在全局注册的时候我们已经看到了：

   ```
   Vue.component('my-component-name', { /* ... */ })
   ```

   当直接在 DOM 中使用一个组件 (而不是在字符串模板或[单文件组件](https://cn.vuejs.org/v2/guide/single-file-components.html)) 的时候，我们强烈推荐遵循 [W3C 规范](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name)中的自定义组件名 (字母全小写且必须包含一个连字符)。这会帮助你避免和当前以及未来的 HTML 元素相冲突。

   你可以在[风格指南](https://cn.vuejs.org/v2/style-guide/#基础组件名-强烈推荐)中查阅到关于组件名的其它建议。

   tips：

   1. **应用特定样式和约定的基础组件 (也就是展示类的、无逻辑的或无状态的组件) 应该全部以一个特定的前缀开头，比如 `Base`、`App` 或 `V`。**

      ```js
      components/
      |- BaseButton.vue
      |- BaseTable.vue
      |- BaseIcon.vue
      ```

   2. **只应该拥有单个活跃实例的组件应该以 `The` 前缀命名，以示其唯一性。**

      这不意味着组件只可用于一个单页面，而是*每个页面*只使用一次。

      ```js
      components/
      |- TheHeading.vue
      |- TheSidebar.vue
      ```

   3. **和父组件紧密耦合的子组件应该以父组件名作为前缀命名。**

      ```js
      components/
      |- TodoList.vue
      |- TodoListItem.vue
      |- TodoListItemButton.vue
      ```

   4. **组件名应该以高级别的 (通常是一般化描述的) 单词开头，以描述性的修饰词结尾。**

      ```js
      components/
      |- SearchButtonClear.vue
      |- SearchButtonRun.vue
      |- SearchInputQuery.vue
      |- SearchInputExcludeGlob.vue
      |- SettingsCheckboxTerms.vue
      |- SettingsCheckboxLaunchOnStartup.vue
      ```

   5. 如果你已经是 kebab-case 的重度用户，那么与 HTML 保持一致的命名约定且在多个项目中保持相同的大小写规则就可能比上述优势更为重要了。在这些情况下，**在所有的地方都使用 kebab-case 同样是可以接受的。**

      ```js
      <!-- 在单文件组件和字符串模板中 -->
      <MyComponent/>
      <!-- 在 DOM 模板中 -->
      <my-component></my-component>
      ```

   6. **组件模板应该只包含简单的表达式，复杂的表达式则应该重构为计算属性或方法。**

      ```js
      <!-- 在模板中 -->
      {{ normalizedFullName }}
      // 复杂表达式已经移入一个计算属性
      computed: {
        normalizedFullName: function () {
          return this.fullName.split(' ').map(function (word) {
            return word[0].toUpperCase() + word.slice(1)
          }).join(' ')
        }
      }
      ```

   7. **应该把复杂计算属性分割为尽可能多的更简单的 property。**

      ```js
      computed: {
        basePrice: function () {
          return this.manufactureCost / (1 - this.profitMargin)
        },
        discount: function () {
          return this.basePrice * (this.discountPercent || 0)
        },
        finalPrice: function () {
          return this.basePrice - this.discount
        }
      }
      ```

2. 111





<!-- more -->

> 