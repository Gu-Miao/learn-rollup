# 教程

## 创建您的第一个捆绑包

_在我们开始之前，您需要安装 [Node.js](https://nodejs.org)，以便您可以使用 [NPM](https://npmjs.com)。您还需要知道如何访问您机器上的 [命令行工具](https://www.codecademy.com/learn/learn-the-command-line)。_

使用 Rollup 最简单的方法是通过命令行界面。现在，我们将在全局范围内安装它（稍后我们将学习如何在你的项目中本地安装它，以便你的构建过程可以移植，但先不考虑这个问题）。在命令行中键入以下内容：

```
npm install rollup --global
# or `npm i rollup -g` for short
```

现在您可以使用 `rollup` 命令了。试试看！

```
rollup
```

由于没有传递参数，Rollup 会打印出使用说明。这与运行 `rollup --help`，或 `rollup -h` 是一样的。

让我们创建一个简单的项目：

```
mkdir -p my-rollup-project/src
cd my-rollup-project
```

首先，我们需要一个入口文件。将下面代码粘贴到一个名为 `src/main.js` 的新文件中：

```js
// src/main.js
import foo from './foo.js'
export default function () {
  console.log(foo)
}
```

然后，让我们创建入口文件中所导入的 `foo.js` 模块：

```js
// src/foo.js
export default 'hello world!'
```

现在我们准备创建一个捆绑包：

```
rollup src/main.js -f cjs
```

`-f` 选项（`--format` 的缩写）指定了我们要创建的是哪种捆绑包，在本例中是 CommonJS 格式（在 Node.js 中运行）。因为我们没有指定输出文件，它直接被打印到了标准输出流：

```js
'use strict'

const foo = 'hello world!'

const main = function () {
  console.log(foo)
}

module.exports = main
```

你可以像这样把捆绑的文件保存起来：

```
rollup src/main.js -o bundle.js -f cjs
```

(你也可以运行 `rollup src/main.js -f cjs > bundle.js`，但正如我们稍后看到的，如果你要生成 sourcemap，这就不那么灵活了)。

试着运行代码：

```
node
> var myBundle = require('./bundle.js');
> myBundle();
'hello world!'
```

恭喜你！你已经用 Rollup 创建了你的第一个捆绑包。

## 使用配置文件

到目前为止，情况还不错，但当我们开始添加更多的选项时，打出命令就变得有点麻烦了。

为了避免重复，我们可以创建一个包含所有我们需要的选项的配置文件。配置文件是用 JavaScript 编写的，比原始 CLI 更灵活。

在项目根部创建一个名为 `rollup.config.js` 的文件，并添加以下代码：

```js
// rollup.config.js
export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  }
}
```

(注意，你可以使用 CJS 模块，比如 `module.exports = {/* config */}`)

为了使用配置文件，我们需要使用 `--config` 或 `-c` 命令行参数。

```
rm bundle.js # 删掉之前的产物
rollup -c
```

你可以用相应的命令行选项来覆盖配置文件中的任何选项。

```
rollup -c -o bundle-2.js # `-o` is equivalent to `--file` (formerly "output")
```

_注意：Rollup 本身会处理配置文件，这就是为什么我们能够使用 ES 模块语法——代码没有被 Babel 或类似的东西转译，所以你只能使用你所运行的 Node.js 版本所支持的 ES2015 特性。_

如果你愿意，你可以指定一个不同于默认 `rollup.config.js` 的配置文件。

```
rollup --config rollup.config.dev.js
rollup --config rollup.config.prod.js
```

## 局部安装 rollup

当在团队或分布式环境中工作时，将 Rollup 作为一个*本地依赖项*是明智的。在本地安装 Rollup 可以避免要求多个贡献者分别安装 Rollup 的额外步骤，并确保所有贡献者使用相同版本的 Rollup。

使用 NPM 在本地安装 Rollup：

```
npm install rollup --save-dev
```

或者使用 Yarn:

```
yarn -D add rollup
```

安装完成后，您可以在项目根目录运行 Rollup：

```
npx rollup --config
```

或者使用 Yarn:

```
yarn rollup --config
```

安装完成后，通常的做法是在 `package.json` 中的 `scripts` 属性里，为所有贡献者提供一个方便的构建命令。 例如：

```json
{
  "scripts": {
    "build": "rollup --config"
  }
}
```

_注意：一旦安装到本地，NPM 和 Yarn 都会解析依赖的 bin 文件，并在从包脚本调用时执行 Rollup。_

## 使用插件

到目前为止，我们已经从一个入口文件和一个通过相对路径导入的模块创建了一个简单的捆绑包。当建立更复杂的软件包时，您往往会需要更灵活的功能，比如导入用 NPM 安装的第三方库，用 Babel 编译代码，使用 JSON 文件等等。

为此，我们可以使用*插件*，它可以在构建过程的关键点上改变 Rollup 的行为。在 [the Rollup Awesome List](https://github.com/rollup/awesome) 上有一个很棒的插件列表。

在本教程中，我们将使用 [@rollup/plugin-json](https://github.com/rollup/plugins/tree/master/packages/json)，它允许 Rollup 从 JSON 文件导入数据。

在项目根部创建一个名为 `package.json` 的文件，并添加以下内容：

```json
{
  "name": "rollup-tutorial",
  "version": "1.0.0",
  "scripts": {
    "build": "rollup -c"
  }
}
```

将 `@rollup/plugin-json` 作为一个开发依赖安装：

```
npm install --save-dev @rollup/plugin-json
```

(我们使用 `--save-dev` 而不是 `--save`，因为我们的代码在运行时实际上并不依赖该插件，即只有在我们构建捆绑包时才会用到。)

更新 `src/main.js` 文件，导入 `package.json`：

```js
// src/main.js
import { version } from '../package.json'

export default function () {
  console.log('version ' + version)
}
```

编辑你的 `rollup.config.js` 文件以包括 JSON 插件：

```js
// rollup.config.js
import json from '@rollup/plugin-json'

export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  plugins: [json()]
}
```

执行 `npm run build` 运行 Rollup。结果应该是这样的：

```js
'use strict'

var version = '1.0.0'

function main() {
  console.log('version ' + version)
}

module.exports = main
```

_注意：只有我们真正用到的数据被打包了——`name` 和 `devDependencies` 以及 `package.json` 的其他部分被忽略了。这就是**摇树优化**的作用。_

## 使用输出插件

一些插件也可以专门应用于某些输出。关于特定输出的插件能做什么的技术细节，请查看[构建时的钩子函数](/docs/plugin-development#构建时的钩子函数)一节。简而言之，那些插件只能在 Rollup 的主要分析完成后修改代码。如果一个不兼容的插件被用作输出特定插件，Rollup 会发出警告。一个可能的用例是对在浏览器中使用的代码进行压缩。

让我们扩展前面的例子，以提供一个压缩过的构建和一个未压缩的构建。为此，我们安装 `rollup-plugin-terser`。

```
npm install --save-dev rollup-plugin-terser
```

编辑您的 `rollup.config.js` 文件，添加第二个最小化的输出。作为格式，我们选择 `iife`。这种格式包装了代码，以便它可以通过浏览器中的 `script` 标签来消费，同时避免与其他代码进行不必要的交互。由于我们有一个输出，我们需要提供一个全局变量的名字，这个变量将由我们的 bundle 创建，这样其他代码就可以通过这个变量访问我们的输出。

```js
// rollup.config.js
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/main.js',
  output: [
    {
      file: 'bundle.js',
      format: 'cjs'
    },
    {
      file: 'bundle.min.js',
      format: 'iife',
      name: 'version',
      plugins: [terser()]
    }
  ],
  plugins: [json()]
}
```

除了 `bundle.js`，Rollup 现在会创建第二个文件 `bundle.min.js`。

```js
var version = (function () {
  'use strict'
  var n = '1.0.0'
  return function () {
    console.log('version ' + n)
  }
})()
```

## 代码拆分

对于代码分割，有些情况下，Rollup 会自动将代码分割成几块，比如动态加载或多个入口点，还有一种方法是通过 [`output.manualChunks`](/docs/big-list-of-options#output-manualchunks) 选项明确告诉 Rollup 哪些模块要分割成独立的几块。

为了使用代码拆分功能来实现懒惰的动态加载（一些导入的模块只在执行函数后才被加载），我们回到原来的例子，修改 `src/main.js`，现在我们会动态加载 `src/foo.js` 而非原来的静态加载：

```js
// src/main.js
export default function () {
  import('./foo.js').then(({ default: foo }) => console.log(foo))
}
```

Rollup 将使用动态导入来创建一个单独的块，只在需要时加载。为了让 Rollup 知道在哪里放置第二个数据块，我们没有使用 `--file` 选项，而是使用 `--dir` 选项设置了一个要输出的文件夹：

```
rollup src/main.js -f cjs -d dist
```

这将创建 `dist` 目录，它包含两个文件，`main.js` 和 `chunk-[hash].js`，其中 `[hash]` 是一个基于内容的哈希值。你可以通过指定 [`output.chunkFileNames`](/docs/big-list-of-options#output-chunkfilenames) 和 [`output.entryFileNames`](/docs/big-list-of-options#output-entryfilenames) 选项提供你自己的命名模式。

你仍然可以像以前一样运行你的代码，有相同的输出，尽管速度稍慢，因为只有当我们第一次调用导出的函数时，才会开始加载和解析 `./foo.js`。

```
node -e "require('./dist/main.js')()"
```

如果我们不使用 `--dir` 选项，Rollup 会再次将块打印到标准输出流，并添加注释以突出块的边界。

```js
//→ main.js:
'use strict'

function main() {
  Promise.resolve(require('./chunk-b8774ea3.js')).then(({ default: foo }) => console.log(foo))
}

module.exports = main

//→ chunk-b8774ea3.js:
;('use strict')

var foo = 'hello world!'

exports.default = foo
```

如果你想只在使用昂贵的功能时才加载和解析它们，这很有用。

代码拆分的另一个用途是能够指定几个共享某些依赖关系的入口点。我们再次扩展我们的例子，添加第二个入口点 `src/main2.js`，它静态地导入 `src/foo.js`，就像我们在原始例子中做的那样：

```js
// src/main2.js
import foo from './foo.js'
export default function () {
  console.log(foo)
}
```

如果我们向 Rollup 提供两个入口点，就会创建三个块：

```
rollup src/main.js src/main2.js -f cjs
```

这将输出：

```js
//→ main.js:
'use strict'

function main() {
  Promise.resolve(require('./chunk-b8774ea3.js')).then(({ default: foo }) => console.log(foo))
}

module.exports = main

//→ main2.js:
;('use strict')

var foo_js = require('./chunk-b8774ea3.js')

function main2() {
  console.log(foo_js.default)
}

module.exports = main2

//→ chunk-b8774ea3.js:
;('use strict')

var foo = 'hello world!'

exports.default = foo
```

注意这两个入口点是如何导入同一个共享块的。Rollup 不会重复代码，而是创建额外的块，只加载必要的最低限度。同样，通过 `--dir` 选项将把文件写到磁盘上。

你可以通过原生 ES 模块、AMD 或 SystemJS 为浏览器构建相同的代码。

例如，用 `-f es` 表示原生 ES 模块：

```
rollup src/main.js src/main2.js -f es -d dist
```

```html
<!DOCTYPE html>
<script type="module">
  import main2 from './dist/main2.js'
  main2()
</script>
```

或者，对于 SystemJS，可以用 `-f system`：

```
rollup src/main.js src/main2.js -f system -d dist
```

安装 SystemJS

```
npm install --save-dev systemjs
```

然后根据需要在一个 HTML 页面中加载任一或两个入口文件：

```html
<!DOCTYPE html>
<script src="node_modules/systemjs/dist/s.min.js"></script>
<script>
  System.import('./dist/main2.js').then(({ default: main }) => main())
</script>
```

请参阅 [rollup-starter-code-splitting](https://github.com/rollup/rollup-starter-code-splitting)，了解如何在支持原生 ES 模块的浏览器上设置网络应用，并在必要时回退到 SystemJS。
