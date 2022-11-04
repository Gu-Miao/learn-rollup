# 介绍

## 概览

Rollup 将小段代码编译成更大更复杂的东西，例如库或应用程序。它使用标准的 ES Module 方案，而不是以前的特殊解决方案，如 CommonJS 和 AMD。 ES Module 让您可以自由无缝地组合您最喜欢的库中最有用的单个函数。 Rollup 可以优化 ES Module 从而在现代浏览器中做到更快的原生加载，或者允许用当今的 ES Module 工作流输出遗留格式的代码。

## 安装

```
npm install rollup -g
```

这会全局安装 Rollup，Rollup 命令行工具也将全局可用。你可以将他安装在单独的项目中，请查看 [局部安装 rollup](/docs/tutorial#局部安装-rollup) 这一章节。

## 快速开始

Rollup 可以通过带有可选配置文件的 [命令行界面](/docs/command-line-reference) 或通过其 [JavaScript API](/docs/javascript-api) 使用。运行 `rollup --help` 以查看可用的选项和参数。

> 访问 [rollup-starter-lib](https://github.com/rollup/rollup-starter-lib) 和 [rollup-starter-app](https://github.com/rollup/rollup-starter-app) 可以查看使用 Rollup 构建库和应用的代码示例。

These commands assume the entry point to your application is named `main.js`, and that you'd like all imports compiled into a single file named `bundle.js`.

For browsers:

```
# compile to a <script> containing a self-executing function ('iife')
rollup main.js --file bundle.js --format iife
```

For Node.js:

```
# compile to a CommonJS module ('cjs')
rollup main.js --file bundle.js --format cjs
```

For both browsers and Node.js:

```
# UMD format requires a bundle name
rollup main.js --file bundle.js --format umd --name "myBundle"
```

## The Why

Developing software is usually easier if you break your project into smaller separate pieces, since that often removes unexpected interactions and dramatically reduces the complexity of the problems you'll need to solve, and simply writing smaller projects in the first place [isn't necessarily the answer](https://medium.com/@Rich_Harris/small-modules-it-s-not-quite-that-simple-3ca532d65de4). Unfortunately, JavaScript has not historically included this capability as a core feature in the language.

This finally changed with the ES6 revision of JavaScript, which includes a syntax for importing and exporting functions and data so they can be shared between separate scripts. The specification is now fixed, but it is only implemented in modern browsers and not finalised in Node.js. Rollup allows you to write your code using the new module system, and will then compile it back down to existing supported formats such as CommonJS modules, AMD modules, and IIFE-style scripts. This means that you get to _write future-proof code_, and you also get the tremendous benefits of…

## Tree-Shaking

In addition to enabling the use of ES modules, Rollup also statically analyzes the code you are importing, and will exclude anything that isn't actually used. This allows you to build on top of existing tools and modules without adding extra dependencies or bloating the size of your project.

For example, with CommonJS, the _entire tool or library must be imported_.

```js
// import the entire utils object with CommonJS
const utils = require('./utils')
const query = 'Rollup'
// use the ajax method of the utils object
utils.ajax(`https://api.example.com?search=${query}`).then(handleResponse)
```

With ES modules, instead of importing the whole `utils` object, we can just import the one `ajax` function we need:

```js
// import the ajax function with an ES6 import statement
import { ajax } from './utils'
const query = 'Rollup'
// call the ajax function
ajax(`https://api.example.com?search=${query}`).then(handleResponse)
```

Because Rollup includes the bare minimum, it results in lighter, faster, and less complicated libraries and applications. Since this approach can utilise explicit `import` and `export` statements, it is more effective than simply running an automated minifier to detect unused variables in the compiled output code.

## Compatibility

### Importing CommonJS

Rollup can import existing CommonJS modules [through a plugin](https://github.com/rollup/plugins/tree/master/packages/commonjs).

### Publishing ES Modules

To make sure your ES modules are immediately usable by tools that work with CommonJS such as Node.js and webpack, you can use Rollup to compile to UMD or CommonJS format, and then point to that compiled version with the `main` property in your `package.json` file. If your `package.json` file also has a `module` field, ES-module-aware tools like Rollup and [webpack 2+](https://webpack.js.org/) will [import the ES module version](https://github.com/rollup/rollup/wiki/pkg.module) directly.
