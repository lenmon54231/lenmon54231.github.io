---
title: vscode配置项文件
date: 2022-02-11 09:45:08
tags: [vscode]
---

## vscode 配置项文件

<!-- more -->

```js
{
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[less]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "cSpell.userWords": [
    "aliyuncs",
    "antd",
    "antv",
    "axios",
    "breakline",
    "cnpm",
    "commitlint",
    "demi",
    "endregion",
    "gifsicle",
    "iconify",
    "Lazyload",
    "leemeng",
    "logicflow",
    "maxlength",
    "mozjpeg",
    "msapplication",
    "optipng",
    "pnpm",
    "pxtorem",
    "saas",
    "scripthost",
    "sider",
    "styl",
    "stylelint",
    "styleselect",
    "tailwindcss",
    "templ",
    "unref",
    "vant",
    "vicons",
    "viewerjs",
    "vite",
    "vitejs",
    "vuejs",
    "vuex",
    "wanxue",
    "webpackbar",
    "webstorm"
  ],
  "debug.toolBarLocation": "docked",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": false // 这个属性能够在保存时，自动调整 import 语句相关顺序，能够让你的 import 语句按照字母顺序进行排列
  },
  "editor.fontFamily": "",
  "editor.fontLigatures": true,
  "editor.fontSize": 16,
  "editor.formatOnSave": true,
  "editor.lineHeight": 0,
  "editor.maxTokenizationLineLength": 40000,
  "editor.minimap.renderCharacters": false,
  "editor.minimap.scale": 2,
  "editor.minimap.showSlider": "always",
  "editor.mouseWheelZoom": true,
  "editor.quickSuggestions": {
    "strings": true
  },
  "editor.suggestSelection": "first",
  "editor.tabCompletion": "on", // 用来在出现推荐值时，按下Tab键是否自动填入最佳推荐值
  "editor.tabSize": 2,
  "editor.unicodeHighlight.invisibleCharacters": false,
  "explorer.confirmDelete": false,
  "files.associations": {
    ".env.*": "dotenv",
    "*.js": "javascriptreact",
    "*.tsx": "javascriptreact",
    "*.jsx": "javascriptreact"
  },
  "git.autofetch": true,
  "js/ts.implicitProjectConfig.checkJs": true,
  "js/ts.implicitProjectConfig.strictFunctionTypes": false,
  "security.workspace.trust.untrustedFiles": "open",
  "terminal.explorerKind": "external",
  "terminal.external.osxExec": "iTerm.app",
  "terminal.integrated.confirmOnExit": "always",
  "terminal.integrated.cursorBlinking": true,
  "terminal.integrated.cursorStyle": "line",
  "terminal.integrated.fontFamily": "consolas",
  "terminal.integrated.fontSize": 14,
  "terminal.integrated.gpuAcceleration": "canvas",
  // #让vue中的js按"prettier"格式进行格式化
  "vetur.format.defaultFormatter.html": "js-beautify-html",
  "vetur.format.defaultFormatter.js": "prettier-eslint",
  "vetur.format.defaultFormatterOptions": {
    "js-beautify-html": {
      "end_with_newline": false,
      "semi": false,
      "singleQuote": true,
      // #vue组件中html代码格式化样式
      "wrap_attributes": "auto",
      "wrap_line_length": 200
    },
    "prettier": {
      "editor.tabSize": 2,
      "semi": false,
      "singleQuote": true
    },
    "prettyhtml": {
      "printWidth": 160,
      "singleQuote": false,
      "sortAttributes": false,
      "wrapAttributes": false
    }
  },
  "window.autoDetectColorScheme": true,
  "window.newWindowDimensions": "offset",
  "workbench.editor.decorations.colors": true,
  "workbench.editorAssociations": {
    "*.plist": "default"
  },
  "workbench.tree.renderIndentGuides": "always",
  "workbench.view.alwaysShowHeaderActions": true,
  "bracketPairColorizer.depreciation-notice": false,
  "editor.parameterHints.enabled": false,
  "vsicons.dontShowNewVersionMessage": true,
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "workbench.startupEditor": "none",
  "gitlens.defaultDateShortFormat": null,
  "editor.inlineSuggest.enabled": true,
  "explorer.sortOrder": "modified",
  "gitlens.codeLens.authors.enabled": false,
  "javascript.updateImportsOnFileMove.enabled": "never",
  "vetur.validation.script": false,
  "workbench.iconTheme": "vscode-icons",
  "typescript.updateImportsOnFileMove.enabled": "never",
  "vetur.languageFeatures.updateImportOnFileMove": false
}

```

