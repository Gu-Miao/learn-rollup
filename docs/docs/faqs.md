# 常见问题

## 为什么 ES 模块比 CommonJS 模块好？

ES 模块是一个官方标准，也是 JavaScript 代码结构的明确发展方向，而 CommonJS 模块是一种特殊的传统格式，在 ES 模块被提出之前是一种权宜之计。ES 模块允许静态分析，这有助于优化，如摇树优化和范围提升，并提供高级功能，如循环引用和实时绑定。

## 什么是摇树（tree-shaking）优化？

摇树，也被称为 "活代码包含"，是 Rollup 消除在一个特定项目中没有实际使用的代码的过程。这是一种[消除死代码的形式](https://medium.com/@Rich_Harris/tree-shaking-versus-dead-code-elimination-d3765df85c80#.jnypozs9n)，但在输出大小方面比其他方法要有效得多。这个名字来自于模块的[抽象语法树](https://en.wikipedia.org/wiki/Abstract_syntax_tree)（不是模块图）。该算法首先标记所有相关的语句，然后 "摇动语法树 "以消除所有死代码。它在思想上类似于[标记和扫除的垃圾收集算法](https://en.wikipedia.org/wiki/Tracing_garbage_collection)。尽管这种算法并不局限于 ES 模块，但它们使得效率大大提高，因为它们允许 Rollup 将所有模块一起作为一个具有共享绑定的大的抽象语法树。

## 如何在 Node.js 中使用 Rollup 与 CommonJS 模块？

Rollup 努力实现 ES 模块的规范，而不一定是 Node.js、NPM、`require()` 和 CommonJS 的行为。因此，加载 CommonJS 模块和使用 Node.js 的模块位置解析逻辑都是作为可选的插件实现的，而不是默认包含在 Rollup 核心中。只要安装 [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs) 和 [@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve) 插件，然后使用 `rollup.config.js` 文件启用它们，你就可以完成所有设置。如果模块导入 JSON 文件，你还需要 [@rollup/plugin-json](https://github.com/rollup/plugins/tree/master/packages/json) 插件。

## 为什么 Node.js 模块的解析不是一个内置功能？

有两个主要原因：

1. 从哲学上讲，这是因为 Rollup 本质上是对 Node.js 和浏览器中的原生模块加载器的[垫片（polyfill）](<https://en.wikipedia.org/wiki/Polyfill_(programming)>)。在浏览器中，`import foo from 'foo'` 不能正常运行，因为浏览器不使用 Node.js 的解析算法。

2. 在实践层面上，如果这些问题被一个好的 API 整齐地分开，开发软件就会容易得多。Rollup 的核心是相当大的，所有能阻止它变大的东西都是好东西。同时，修复错误和增加功能也更容易。通过保持 Rollup 的精简，背负技术债务的可能性就很小。

请看这个[问题](https://github.com/rollup/rollup/issues/1555#issuecomment-322862209)，以获得更详细的解释。

## 为什么在代码拆分时，额外的导入会出现在我的条目块中？

默认情况下，当创建多个块时，入口块的依赖关系的导入将作为空导入添加到入口块本身。看看这个[例子](https://rollupjs.org/repl/?shareable=JTdCJTIybW9kdWxlcyUyMiUzQSU1QiU3QiUyMm5hbWUlMjIlM0ElMjJtYWluLmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmltcG9ydCUyMHZhbHVlJTIwZnJvbSUyMCcuJTJGb3RoZXItZW50cnkuanMnJTNCJTVDbmNvbnNvbGUubG9nKHZhbHVlKSUzQiUyMiUyQyUyMmlzRW50cnklMjIlM0F0cnVlJTdEJTJDJTdCJTIybmFtZSUyMiUzQSUyMm90aGVyLWVudHJ5LmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmltcG9ydCUyMGV4dGVybmFsVmFsdWUlMjBmcm9tJTIwJ2V4dGVybmFsJyUzQiU1Q25leHBvcnQlMjBkZWZhdWx0JTIwMiUyMColMjBleHRlcm5hbFZhbHVlJTNCJTIyJTJDJTIyaXNFbnRyeSUyMiUzQXRydWUlN0QlNUQlMkMlMjJvcHRpb25zJTIyJTNBJTdCJTIyZm9ybWF0JTIyJTNBJTIyZXNtJTIyJTJDJTIybmFtZSUyMiUzQSUyMm15QnVuZGxlJTIyJTJDJTIyYW1kJTIyJTNBJTdCJTIyaWQlMjIlM0ElMjIlMjIlN0QlMkMlMjJnbG9iYWxzJTIyJTNBJTdCJTdEJTdEJTJDJTIyZXhhbXBsZSUyMiUzQW51bGwlN0Q=)：

```js
// 输入
// main.js
import value from './other-entry.js';
console.log(value);

// other-entry.js
import externalValue from 'external';
export default 2 * externalValue;

// 输出
// main.js
import 'external'; // this import has been hoisted from other-entry.js
import value from './other-entry.js';
console.log(value);

// other-entry.js
import externalValue from 'external';
var value = 2 * externalValue;
export default value;
```

这并不影响代码的执行顺序或行为，但它会加快你的代码加载和解析的速度。如果没有这种优化，一个 JavaScript 引擎需要执行以下步骤来运行 `main.js`：

This does not affect code execution order or behaviour, but it will speed up how your code is loaded and parsed. Without this optimization, a JavaScript engine needs to perform the following steps to run `main.js`:

1. Load and parse `main.js`. At the end, an import to `other-entry.js` will be discovered.
2. Load and parse `other-entry.js`. At the end, an import to `external` will be discovered.
3. Load and parse `external`.
4. Execute `main.js`.

With this optimization, a JavaScript engine will discover all transitive dependencies after parsing an entry module, avoiding the waterfall:

1. Load and parse `main.js`. At the end, imports to `other-entry.js` and `external` will be discovered.
2. Load and parse `other-entry.js` and `external`. The import of `external` from `other-entry.js` is already loaded and parsed.
3. Execute `main.js`.

There may be situations where this optimization is not desired, in which case you can turn it off via the [`output.hoistTransitiveImports`](#outputhoisttransitiveimports) option. This optimization is also never applied when using the [`output.preserveModules`](#outputpreservemodules) option.

## How do I add polyfills to a Rollup bundle?

Even though Rollup will usually try to maintain exact module execution order when bundling, there are two situations when this is not always the case: code-splitting and external dependencies. The problem is most obvious with external dependencies, see the following [example](https://rollupjs.org/repl/?shareable=JTdCJTIybW9kdWxlcyUyMiUzQSU1QiU3QiUyMm5hbWUlMjIlM0ElMjJtYWluLmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmltcG9ydCUyMCcuJTJGcG9seWZpbGwuanMnJTNCJTVDbmltcG9ydCUyMCdleHRlcm5hbCclM0IlNUNuY29uc29sZS5sb2coJ21haW4nKSUzQiUyMiUyQyUyMmlzRW50cnklMjIlM0F0cnVlJTdEJTJDJTdCJTIybmFtZSUyMiUzQSUyMnBvbHlmaWxsLmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmNvbnNvbGUubG9nKCdwb2x5ZmlsbCcpJTNCJTIyJTJDJTIyaXNFbnRyeSUyMiUzQWZhbHNlJTdEJTVEJTJDJTIyb3B0aW9ucyUyMiUzQSU3QiUyMmZvcm1hdCUyMiUzQSUyMmVzbSUyMiUyQyUyMm5hbWUlMjIlM0ElMjJteUJ1bmRsZSUyMiUyQyUyMmFtZCUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyJTIyJTdEJTJDJTIyZ2xvYmFscyUyMiUzQSU3QiU3RCU3RCUyQyUyMmV4YW1wbGUlMjIlM0FudWxsJTdE):

```js
// main.js
import './polyfill.js'
import 'external'
console.log('main')

// polyfill.js
console.log('polyfill')
```

Here the execution order is `polyfill.js` → `external` → `main.js`. Now when you bundle the code, you will get

```js
import 'external'
console.log('polyfill')
console.log('main')
```

with the execution order `external` → `polyfill.js` → `main.js`. This is not a problem caused by Rollup putting the `import` at the top of the bundle—imports are always executed first, no matter where they are located in the file. This problem can be solved by creating more chunks: If `polyfill.js` ends up in a different chunk than `main.js`, [correct execution order will be preserved](https://rollupjs.org/repl/?shareable=JTdCJTIybW9kdWxlcyUyMiUzQSU1QiU3QiUyMm5hbWUlMjIlM0ElMjJtYWluLmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmltcG9ydCUyMCcuJTJGcG9seWZpbGwuanMnJTNCJTVDbmltcG9ydCUyMCdleHRlcm5hbCclM0IlNUNuY29uc29sZS5sb2coJ21haW4nKSUzQiUyMiUyQyUyMmlzRW50cnklMjIlM0F0cnVlJTdEJTJDJTdCJTIybmFtZSUyMiUzQSUyMnBvbHlmaWxsLmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmNvbnNvbGUubG9nKCdwb2x5ZmlsbCcpJTNCJTIyJTJDJTIyaXNFbnRyeSUyMiUzQXRydWUlN0QlNUQlMkMlMjJvcHRpb25zJTIyJTNBJTdCJTIyZm9ybWF0JTIyJTNBJTIyZXNtJTIyJTJDJTIybmFtZSUyMiUzQSUyMm15QnVuZGxlJTIyJTJDJTIyYW1kJTIyJTNBJTdCJTIyaWQlMjIlM0ElMjIlMjIlN0QlMkMlMjJnbG9iYWxzJTIyJTNBJTdCJTdEJTdEJTJDJTIyZXhhbXBsZSUyMiUzQW51bGwlN0Q=). However there is not yet an automatic way to do this in Rollup. For code-splitting, the situation is similar as Rollup is trying to create as few chunks as possible while making sure no code is executed that is not needed.

For most code this is not a problem, because Rollup can guarantee:

> If module A imports module B and there are no circular imports, then B will always be executed before A.

This is however a problem for polyfills, as those usually need to be executed first but it is usually not desired to place an import of the polyfill in every single module. Luckily, this is not needed:

1. If there are no external dependencies that depend on the polyfill, it is enough to add an import of the polyfill as first statement to each static entry point.
2. Otherwise, additionally making the polyfill a separate entry or [manual chunk](#outputmanualchunks) will always make sure it is executed first.

## Is Rollup meant for building libraries or applications?

Rollup is already used by many major JavaScript libraries, and can also be used to build the vast majority of applications. However if you want to use code-splitting or dynamic imports with older browsers, you will need an additional runtime to handle loading missing chunks. We recommend using the [SystemJS Production Build](https://github.com/systemjs/systemjs#browser-production) as it integrates nicely with Rollup's system format output and is capable of properly handling all the ES module live bindings and re-export edge cases. Alternatively, an AMD loader can be used as well.

## How do I run Rollup itself in a browser

While the regular Rollup build relies on some NodeJS features, there is also a browser build available that only uses browser APIs. You can install it via

```
npm install @rollup/browser
```

and in your script, import it via

```js
import { rollup } from '@rollup/browser'
```

Alternatively, you can import from a CDN, e.g. for the ES 模块 build

```js
import * as rollup from 'https://unpkg.com/@rollup/browser/dist/es/rollup.browser.js'
```

and for the UMD build

```html
<script src="https://unpkg.com/@rollup/browser/dist/rollup.browser.js"></script>
```

which will create a global variable `window.rollup`. As the browser build cannot access the file system, you need to provide plugins that resolve and load all modules you want to bundle. Here is a contrived example that does this:

```js
const modules = {
  'main.js': "import foo from 'foo.js'; console.log(foo);",
  'foo.js': 'export default 42;'
}

rollup
  .rollup({
    input: 'main.js',
    plugins: [
      {
        name: 'loader',
        resolveId(source) {
          if (modules.hasOwnProperty(source)) {
            return source
          }
        },
        load(id) {
          if (modules.hasOwnProperty(id)) {
            return modules[id]
          }
        }
      }
    ]
  })
  .then(bundle => bundle.generate({ format: 'es' }))
  .then(({ output }) => console.log(output[0].code))
```

This example only supports two imports, `"main.js"` and `"foo.js"`, and no relative imports. Here is another example that uses absolute URLs as entry points and supports relative imports. In that case, we are just re-bundling Rollup itself, but it could be used on any other URL that exposes an ES module:

```js
rollup
  .rollup({
    input: 'https://unpkg.com/rollup/dist/es/rollup.js',
    plugins: [
      {
        name: 'url-resolver',
        resolveId(source, importer) {
          if (source[0] !== '.') {
            try {
              new URL(source)
              // If it is a valid URL, return it
              return source
            } catch {
              // Otherwise make it external
              return { id: source, external: true }
            }
          }
          return new URL(source, importer).href
        },
        async load(id) {
          const response = await fetch(id)
          return response.text()
        }
      }
    ]
  })
  .then(bundle => bundle.generate({ format: 'es' }))
  .then(({ output }) => console.log(output))
```

## 谁制作了 Rollup 的标志？它很可爱。

[Julian Lloyd](https://twitter.com/jlmakes)!
