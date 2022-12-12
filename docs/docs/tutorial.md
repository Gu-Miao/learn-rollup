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

_Note: Rollup itself processes the config file, which is why we're able to use `export default` syntax – the code isn't being transpiled with Babel or anything similar, so you can only use ES2015 features that are supported in the version of Node.js that you're running._

You can, if you like, specify a different config file from the default `rollup.config.js`:

```
rollup --config rollup.config.dev.js
rollup --config rollup.config.prod.js
```

## 局部安装 rollup

When working within teams or distributed environments it can be wise to add Rollup as a _local_ dependency. Installing Rollup locally prevents the requirement that multiple contributors install Rollup separately as an extra step, and ensures that all contributors are using the same version of Rollup.

To install Rollup locally with NPM:

```
npm install rollup --save-dev
```

Or with Yarn:

```
yarn -D add rollup
```

After installing, Rollup can be run within the root directory of your project:

```
npx rollup --config
```

Or with Yarn:

```
yarn rollup --config
```

Once installed, it's common practice to add a single build script to `package.json`, providing a convenient command for all contributors. e.g.

```json
{
  "scripts": {
    "build": "rollup --config"
  }
}
```

_Note: Once installed locally, both NPM and Yarn will resolve the dependency's bin file and execute Rollup when called from a package script._

## 使用插件

So far, we've created a simple bundle from an entry point and a module imported via a relative path. As you build more complex bundles, you'll often need more flexibility – importing modules installed with NPM, compiling code with Babel, working with JSON files and so on.

For that, we use _plugins_, which change the behaviour of Rollup at key points in the bundling process. A list of awesome plugins is maintained on [the Rollup Awesome List](https://github.com/rollup/awesome).

For this tutorial, we'll use [@rollup/plugin-json](https://github.com/rollup/plugins/tree/master/packages/json), which allows Rollup to import data from a JSON file.

Create a file in the project root called `package.json`, and add the following content:

```json
{
  "name": "rollup-tutorial",
  "version": "1.0.0",
  "scripts": {
    "build": "rollup -c"
  }
}
```

Install @rollup/plugin-json as a development dependency:

```
npm install --save-dev @rollup/plugin-json
```

(We're using `--save-dev` rather than `--save` because our code doesn't actually depend on the plugin when it runs – only when we're building the bundle.)

Update your `src/main.js` file so that it imports from your package.json instead of `src/foo.js`:

```js
// src/main.js
import { version } from '../package.json'

export default function () {
  console.log('version ' + version)
}
```

Edit your `rollup.config.js` file to include the JSON plugin:

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

Run Rollup with `npm run build`. The result should look like this:

```js
'use strict'

var version = '1.0.0'

function main() {
  console.log('version ' + version)
}

module.exports = main
```

_Note: Only the data we actually need gets imported – `name` and `devDependencies` and other parts of `package.json` are ignored. That's **tree-shaking** in action._

## 使用输出插件

Some plugins can also be applied specifically to some outputs. See [plugin hooks](#build-hooks) for the technical details of what output-specific plugins can do. In a nut-shell, those plugins can only modify code after the main analysis of Rollup has completed. Rollup will warn if an incompatible plugin is used as an output-specific plugin. One possible use-case is minification of bundles to be consumed in a browser.

Let us extend the previous example to provide a minified build together with the non-minified one. To that end, we install `rollup-plugin-terser`:

```
npm install --save-dev rollup-plugin-terser
```

Edit your `rollup.config.js` file to add a second minified output. As format, we choose `iife`. This format wraps the code so that it can be consumed via a `script` tag in the browser while avoiding unwanted interactions with other code. As we have an export, we need to provide the name of a global variable that will be created by our bundle so that other code can access our export via this variable.

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

Besides `bundle.js`, Rollup will now create a second file `bundle.min.js`:

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

For code splitting, there are cases where Rollup splits code into chunks automatically, like dynamic loading or multiple entry points, and there is a way to explicitly tell Rollup which modules to split into separate chunks via the [`output.manualChunks`](#outputmanualchunks) option.

To use the code splitting feature to achieve the lazy dynamic loading (where some imported module(s) is only loaded after executing a function), we go back to the original example and modify `src/main.js` to load `src/foo.js` dynamically instead of statically:

```js
// src/main.js
export default function () {
  import('./foo.js').then(({ default: foo }) => console.log(foo))
}
```

Rollup will use the dynamic import to create a separate chunk that is only loaded on demand. In order for Rollup to know where to place the second chunk, instead of passing the `--file` option we set a folder to output to with the `--dir` option:

```
rollup src/main.js -f cjs -d dist
```

This will create a folder `dist` containing two files, `main.js` and `chunk-[hash].js`, where `[hash]` is a content based hash string. You can supply your own naming patterns by specifying the [`output.chunkFileNames`](#outputchunkfilenames) and [`output.entryFileNames`](#outputentryfilenames) options.

You can still run your code as before with the same output, albeit a little slower as loading and parsing of `./foo.js` will only commence once we call the exported function for the first time.

```
node -e "require('./dist/main.js')()"
```

If we do not use the `--dir` option, Rollup will again print the chunks to `stdout`, adding comments to highlight the chunk boundaries:

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

This is useful if you want to load and parse expensive features only once they are used.

A different use for code-splitting is the ability to specify several entry points that share some dependencies. Again we extend our example to add a second entry point `src/main2.js` that statically imports `src/foo.js` just like we did in the original example:

```js
// src/main2.js
import foo from './foo.js'
export default function () {
  console.log(foo)
}
```

If we supply both entry points to rollup, three chunks are created:

```
rollup src/main.js src/main2.js -f cjs
```

will output

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

Notice how both entry points import the same shared chunk. Rollup will never duplicate code and instead create additional chunks to only ever load the bare minimum necessary. Again, passing the `--dir` option will write the files to disk.

You can build the same code for the browser via native ES modules, an AMD loader or SystemJS.

For example, with `-f es` for native modules:

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

Or alternatively, for SystemJS with `-f system`:

```
rollup src/main.js src/main2.js -f system -d dist
```

Install SystemJS via

```
npm install --save-dev systemjs
```

And then load either or both entry points in an HTML page as needed:

```html
<!DOCTYPE html>
<script src="node_modules/systemjs/dist/s.min.js"></script>
<script>
  System.import('./dist/main2.js').then(({ default: main }) => main())
</script>
```

See [rollup-starter-code-splitting](https://github.com/rollup/rollup-starter-code-splitting) for an example on how to set up a web app that uses native ES modules on browsers that support them with a fallback to SystemJS if necessary.
