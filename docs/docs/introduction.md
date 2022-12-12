# 介绍

## 概览

Rollup 将小段代码编译成更大更复杂的东西，例如库或应用程序。它使用标准的 ESM 方案，而不是以前的特殊解决方案，如 CommonJS 和 AMD。 ESM 让您可以自由无缝地组合您最喜欢的库中最有用的函数。Rollup 可以优化 ESM 代码从而在现代浏览器中获得更快的原生加载速度，或者允许用当下的 ESM 工作流输出遗留格式的代码。

## 安装

```
npm install rollup -g
```

这会全局安装 Rollup，Rollup 命令行工具也将全局可用。您可以将他安装在单独的项目中，请查看 [局部安装 rollup](/docs/tutorial#局部安装-rollup) 这一章节。

## 快速开始

Rollup 可以通过带有可选配置文件的 [命令行界面](/docs/command-line-reference) 或通过 [JavaScript API](/docs/javascript-api) 使用。运行 `rollup --help` 以查看可用的选项和参数。

> 访问 [rollup-starter-lib](https://github.com/rollup/rollup-starter-lib) 和 [rollup-starter-app](https://github.com/rollup/rollup-starter-app) 可以查看使用 Rollup 构建库和应用的代码示例。

下面这些命令假定您的应用程序的入口文件为 `main.js`，并且您希望将所有代码打包编译到一个名为 `bundle.js` 的文件中。

将代码打包成一个立即调用函数表达式，面向浏览器环境，可以通过 `<script>` 标签引入：

```
rollup main.js --file bundle.js --format iife
```

打包成 CommonJS 格式，面向 Node.js 环境：

```
rollup main.js --file bundle.js --format cjs
```

同时支持浏览器和 Node.js 环境：

```
rollup main.js --file bundle.js --format umd --name "myBundle"
```

## 为什么

如果您将项目分成更小的独立部分，开发软件通常会更容易，因为这通常会消除意外的交互并显着降低您需要解决的问题的复杂性，并且首先简单地编写较小的项目 [不一定是最佳实践](https://medium.com/@Rich_Harris/small-modules-it-s-not-quite-that-simple-3ca532d65de4)。不幸的是，过去的 JavaScript 标准并没有将此项作为语言的核心功能包含在内。

这最终随着 JavaScript 的 ES6 修订版而改变，其中包括用于导入和导出函数和数据的语法，这使得函数和数据可以在独立的模块之间共享。该规范现已确定，但仅在现代浏览器中实现，并未在 Node.js 中最终确定。Rollup 允许您使用新的模块系统编写代码，然后将其编译回现有支持的格式，例如 CommonJS 模块、AMD 模块和 IIFE 样式的代码。这意味着您可以*编写面向未来的代码*，并且您还可以获得巨大的好处。

## 摇树优化

除了启用 ESM 之外，Rollup 还会对您正在导入的代码进行静态分析，并将排除任何实际未使用的代码。这使您可以在现有工具和模块的基础上进行构建，而无需添加额外的依赖项或增加项目的大小。

例如，当使用 CommonJS 时，_整个库必须被导入_。

```js
// 通过 CommonJS 导入完整的 utils 对象
const utils = require('./utils')
const query = 'Rollup'
// 使用 utils 对象上的 ajax 函数
utils.ajax(`https://api.example.com?search=${query}`).then(handleResponse)
```

而使用 ESM，我们可以只引入我们所需的 `ajax` 函数，而非整个 `utils` 对象：

```js
// 通过 ESM 语法引入 ajax 函数
import { ajax } from './utils'
const query = 'Rollup'
// 调用 ajax 函数
ajax(`https://api.example.com?search=${query}`).then(handleResponse)
```

由于 Rollup 包含最少的内容，因此它可以生成更轻、更快、更简单的库和应用程序。由于这种方法可以使用显式的 `import` 和 `export` 语句，因此它比简单地运行自动压缩器来检测编译输出代码中未使用的变量更有效。

## 兼容性

### 引入 CommonJS 代码

Rollup 可以 [通过一个插件](https://github.com/rollup/plugins/tree/master/packages/commonjs) 引入当前已有的 CommonJS 代码。

### 发布 ESM 代码

为确保您的 ESM 代码可以直接被使用 CommonJS 的工具（例如 Node.js 和 webpack）使用，您可以使用 Rollup 将产物编译为 UMD 或 CommonJS 格式，然后令 `package.json` 文件中的 `main` 属性指向该编译版本。如果您的 `package.json` 文件也有 `module` 属性，那么像 Rollup 和 [webpack 2+](https://webpack.js.org/) 等 ESM 感知工具将可以直接 [导入 ESM 版本](https://github.com/rollup/rollup/wiki/pkg.module)。
