# ESM 语法

以下内容旨在作为 [ES2015 规范](https://www.ecma-international.org/ecma-262/6.0/) 中定义的模块行为的轻量级参考，因为正确理解导入和导出语句对于正确使用 Rollup 来说至关重要。

## 导入

导入的值不能重新赋值，尽管导入的对象和数组*可以*是可变的（导出模块和任何其他导入程序都会受到其可变性的影响）。它们的行为类似于 `const` 声明。

### 命名导入

从源模块导入一个指定项，保留其原本的名称：

```js
import { something } from './module.js'
```

从源模块导入一个指定项，使用自定义的名称：

```js
import { something as somethingElse } from './module.js'
```

### 命名空间导入

将源模块中的所有内容作为对象导入，该对象将源模块的所有命名导出作为属性和方法公开：

```js
import * as module from './module.js'
```

然后，上面的 `something` 示例将作为属性附加到导入的对象，例如 `module.sothing`。如果存在，可以通过 `module.default` 访问默认导出。

### 默认导入

从源模块导入**默认导出**：

```js
import something from './module.js'
```

### 空导入

加载模块代码，但不导入任何值：

```js
import './module.js'
```

这对于 polyfill 很有用，或者当导入代码的主要目的是修改原型链时。

### 动态导入

使用 [动态导入 API](https://github.com/tc39/proposal-dynamic-import#import) 引入模块：

```js
import('./modules.js').then(({ default: DefaultExport, NamedExport }) => {
  // ...
})
```

这对于代码拆分和动态使用模块非常有用。

## 导出

### 命名导出

导出已定义的值：

```js
const something = true
export { something }
```

导出时重命名：

```js
export { something as somethingElse }
```

在定义时导出值：

```js
// 可以在 `var`, `let`, `const`, `class` 和 `function` 前使用 export 关键字
export const something = true
```

### 默认导出

导出一个值作为源模块的默认导出：

```js
export default something
```

仅当源模块只有一个导出时，才建议使用此做法。

尽管规范允许在同一模块中同时存在默认导出和命名导出，但这是一种不好的做法。

## 绑定是怎样工作的

ESM 导出的不是值，而是*值的绑定（或者说引用，本质上每个模块都是一个闭包）*，所以可以在导入后对它们进行修改，请查看这个[例子](https://rollupjs.org/repl/?shareable=JTdCJTIybW9kdWxlcyUyMiUzQSU1QiU3QiUyMm5hbWUlMjIlM0ElMjJtYWluLmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmltcG9ydCUyMCU3QiUyMGNvdW50JTJDJTIwaW5jcmVtZW50JTIwJTdEJTIwZnJvbSUyMCcuJTJGaW5jcmVtZW50ZXIuanMnJTNCJTVDbiU1Q25jb25zb2xlLmxvZyhjb3VudCklM0IlNUNuaW5jcmVtZW50KCklM0IlNUNuY29uc29sZS5sb2coY291bnQpJTNCJTIyJTdEJTJDJTdCJTIybmFtZSUyMiUzQSUyMmluY3JlbWVudGVyLmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmV4cG9ydCUyMGxldCUyMGNvdW50JTIwJTNEJTIwMCUzQiU1Q24lNUNuZXhwb3J0JTIwZnVuY3Rpb24lMjBpbmNyZW1lbnQoKSUyMCU3QiU1Q24lNUN0Y291bnQlMjAlMkIlM0QlMjAxJTNCJTVDbiU3RCUyMiU3RCU1RCUyQyUyMm9wdGlvbnMlMjIlM0ElN0IlMjJmb3JtYXQlMjIlM0ElMjJjanMlMjIlMkMlMjJnbG9iYWxzJTIyJTNBJTdCJTdEJTJDJTIybW9kdWxlSWQlMjIlM0ElMjIlMjIlMkMlMjJuYW1lJTIyJTNBJTIybXlCdW5kbGUlMjIlN0QlMkMlMjJleGFtcGxlJTIyJTNBbnVsbCU3RA==)：

```js
// incrementer.js
export let count = 0

export function increment() {
  count += 1
}
```

```js
// main.js
import { count, increment } from './incrementer.js'

console.log(count) // 0
increment()
console.log(count) // 1

count += 1 // 错误 — 只有 incrementer.js 可以改变它
```
