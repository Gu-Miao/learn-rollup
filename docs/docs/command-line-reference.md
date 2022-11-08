# 命令行界面

Rollup 通常在命令行中被使用。您可以提供可选的配置文件来简化命令行使用并启用高级功能。

## 配置文件

汇总配置文件是可选的，但它们功能强大且方便，因此**推荐使用配置文件**。配置文件使用 ESM 格式，要求导出一个默认的配置对象：

```js
export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  }
}
```

通常，配置文件被命名为 `rollup.config.js` 或 `rollup.config.mjs` 并且位于项目的根目录中。除非使用 [`--configPlugin`](#configplugin-plugin) 或 [`--bundleConfigAsCjs`](#bundleconfigascjs) 选项，否则 Rollup 将直接使用 Node 导入文件。请注意，有一些 [使用原生 Node ES 模块时的注意事项](#使用原生-node-es-模块时的注意事项)，因为 Rollup 将遵守 [Node ESM 语义](https://nodejs.org/docs/latest-v14.x/api/packages.html#packages_determining_module_system)。

如果您想用 CommonJS 的方式编写配置文件，可以将文件的后缀名改为 `.cjs`。

您还可以将其他语言用于您的配置文件，例如 TypeScript。为此，请安装相应的插件，例如 `@rollup/plugin-typescript` 并使用 [`--configPlugin`](#configplugin-plugin) 选项：

```
rollup --config rollup.config.ts --configPlugin typescript
```

使用 `--configPlugin` 选项将始终强制您的配置文件首先转译为 CommonJS。另请查看 [配置选项智能补全](#配置选项智能补全) 章节，了解更多在配置文件中使用 TypeScript 类型的方法。

配置文件支持下面列出的选项。有关每个选项的详细信息，请参阅 [大选项列表](/docs/big-list-of-options)：

```js
// rollup.config.js

// 可以是一个数组（对于多个输入场景）
export default {
  // 核心输入选项
  external,
  input, // 一些情况下是必须的
  plugins,

  // 高级输入选项
  cache,
  onwarn,
  preserveEntrySignatures,
  strictDeprecations,

  // 有风险的选项
  acorn,
  acornInjectPlugins,
  context,
  moduleContext,
  preserveSymlinks,
  shimMissingExports,
  treeshake,

  // 实验特性
  experimentalCacheExpiry,
  perf,

  // 必须的（可以是一个数组，应对多输出场景）
  output: {
    // 核心输出选项
    dir,
    file,
    format, // 必须的
    globals,
    name,
    plugins,

    // 高级输出选项
    assetFileNames,
    banner,
    chunkFileNames,
    compact,
    entryFileNames,
    extend,
    footer,
    hoistTransitiveImports,
    inlineDynamicImports,
    interop,
    intro,
    manualChunks,
    minifyInternalExports,
    outro,
    paths,
    preserveModules,
    preserveModulesRoot,
    sourcemap,
    sourcemapBaseUrl,
    sourcemapExcludeSources,
    sourcemapFile,
    sourcemapPathTransform,
    validate,

    // 有风险的选项
    amd,
    esModule,
    exports,
    externalLiveBindings,
    freeze,
    indent,
    namespaceToStringTag,
    noConflict,
    preferConst,
    sanitizeFileName,
    strict,
    systemNullSetters
  },

  watch: {
    buildDelay,
    chokidar,
    clearScreen,
    skipWrite,
    exclude,
    include
  }
}
```

您可以从配置文件中导出一个**数组**，以一次从多个不相关的输入构建捆绑包，即使在监视模式下也是如此。要使用相同的输入构建不同的捆绑包，您需要为每个输入提供一组输出选项：

```js
// rollup.config.js（构建多个输出产物）

export default [
  {
    input: 'main-a.js',
    output: {
      file: 'dist/bundle-a.js',
      format: 'cjs'
    }
  },
  {
    input: 'main-b.js',
    output: [
      {
        file: 'dist/bundle-b1.js',
        format: 'cjs'
      },
      {
        file: 'dist/bundle-b2.js',
        format: 'es'
      }
    ]
  }
]
```

如果你想异步地创建你的配置，Rollup 还可以处理一个解析为对象或数组的 `Promise`：

```js
// rollup.config.js
import fetch from 'node-fetch'
export default fetch('/some-remote-service-or-file-which-returns-actual-config')
```

同样，您也可以这样做：

```js
// rollup.config.js（Promise 被解析为数组）
export default Promise.all([fetch('get-config-1'), fetch('get-config-2')])
```

要通过配置文件使用 Rollup，请传递 `--config` 或 `-c` 参数：

```
# 给 Rollup 传递一个自定义配置文件路径
rollup --config my.config.js

# 如果你不传递文件名，Rollup 会尝试通过如下顺序加载配置文件：
# rollup.config.mjs -> rollup.config.cjs -> rollup.config.js
rollup --config
```

您还可以导出一个默认的函数，此函数将接收当前的命令行选项作为参数，返回上述中的配置对象。通过这种方式，您可以动态调整配置。如果以 `config` 作为前缀，您甚至可以自定义命令行选项：

```js
// rollup.config.js
import defaultConfig from './rollup.default.config.js'
import debugConfig from './rollup.debug.config.js'

export default commandLineArgs => {
  if (commandLineArgs.configDebug === true) {
    return debugConfig
  }
  return defaultConfig
}
```

如果现在运行 `rollup-config-configDebug`，将使用调试配置。

默认情况下，命令行参数将始终覆盖从配置文件导出的相应值。如果要更改此行为，可以从 `commandLineArgs` 对象中删除命令行参数，使 Rollup 忽略命令行参数：

```js
// rollup.config.js
export default commandLineArgs => {
  const inputBase = commandLineArgs.input || 'main.js';

  // 这将会忽略命令行参数
  delete commandLineArgs.input;
  return {
    input: 'src/entries/' + inputBase,
    output: {...}
  }
}
```

### 配置选项智能补全

Rollup 提供了 TypeScript 类型支持，您可以使用 JSDoc 帮助 IDE 识别您的配置对象类型：

```js
// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  /* ... */
}
export default config
```

或者，您可以使用 `defineConfig` 辅助函数，它会提供相应的类型支持并且不需要 JSDoc 注释：

```js
// rollup.config.js
import { defineConfig } from 'rollup'

export default defineConfig({
  /* ... */
})
```

除了 `RollupOptions` 和 `defineConfig` 辅助函数外，您还可以使用下列类型：

- `OutputOptions`: `output` 部分的类型
- `Plugin`：一个插件对象包括一个 `name` 属性和一些钩子函数。所有钩子函数都有完备的类型支持以方便插件开发。
- `PluginImpl`：将配置对象映射到插件对象的函数。大多数公共 Rollup 插件都遵循这种模式。

您还可以通过 [`--configPlugin`](#configplugin-plugin) 选项直接使用 TypeScript 编写配置文件。使用 TypeScript，您可以直接导入 `RollupOptions` 类型：

```ts
import type { RollupOptions } from 'rollup'

const config: RollupOptions = {
  /* ... */
}
export default config
```

## 和 JavaScript API 的不同之处

虽然配置文件提供了配置 Rollup 的简单方法，但它们也限制了如何调用和配置 Rollup。特别是如果您将 Rollup 绑定到另一个构建工具中，或者希望将其集成到高级构建过程中，那么最好直接使用编程的方式调用 Rollup。

如果您想在某个时候从配置文件切换到使用 [JavaScript API](/docs/javascript-api)，需要注意一些重要的区别：

- 在使用 JavaScript API 时，必须传递是一个对象给 `rollup.rollup`，不能传递 Promise 或函数。
- 您不能再使用配置对象数组。替代方案是，您应该对每一组 `inputOptions` 调用一次 `rollup.rollup`。
- `output` 选项将被忽略。作为替代，您应该为每组 `outputOptions` 运行一次 `bundle.generate(outputOptions)` 或 `bundle.write(outpupOptions)`。

## 从 node_modules 中加载 Rollup 配置

为了实现互操作性，Rollup 还支持从安装到 `node_modules` 中的包加载配置文件：

```
# 首先它会尝试加载 `rollup-config-my-special-config`
# 如果上面的失败了，它会再尝试加载 `my-special-config`
rollup --config node:my-special-config
```

## 使用原生 Node.js ESM 时的注意事项

尤其是从旧的 Rollup 版本升级时，在配置文件中使用原生 ESM 时，需要注意一些事项。

### 获取当前目录

使用 CommonJS，人们通常使用 `__dirname` 来访问当前目录并将相对路径解析为绝对路径。而原生 ESM 不支持此操作。相反，我们建议使用以下方法，例如为外部模块生成绝对 id：

```js
// rollup.config.js
import { fileURLToPath } from 'node:url'

export default {
  ...,
  // 为 <currentdir>/src/some-external-file.js 生成绝对路径
  external: [fileURLToPath(new URL('src/some-external-file.js', import.meta.url))]
};
```

### 导入 package.json

导入 `package.json` 通常对编写配置文件很有帮助，例如自动将依赖项标记为 `external`。根据您的 Node.js 版本，有不同的方法：

- 对于 Node.js 17.5+，可以使用导入断言：

  ```js
  import pkg from './package.json' assert { type: 'json' }

  export default {
    // 将依赖设置为 external
    external: Object.keys(pkg.dependencies)
  }
  ```

- 老版本可以使用 `createRequire`：

  ```js
  import { createRequire } from 'node:module'
  const require = createRequire(import.meta.url)
  const pkg = require('./package.json')

  // ...
  ```

- 或者直接从硬盘上读取

  ```js
  // rollup.config.mjs
  import { readFileSync } from 'node:fs'

  // 使用 import.meta.url 代替 process.cwd() 来确保路径是相对于当前源文件的
  // 深入了解 import.meta.url: https://nodejs.org/docs/latest-v16.x/api/esm.html#importmetaurl
  const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))

  // ...
  ```

## 命令行参数

许多选项具有命令行等效项。在这些情况下，如果您使用的是配置文件，那么这里传递的任何参数都将覆盖该配置文件。这是所有支持选项的列表：

```text
-c, --config <filename>     Use this config file (if argument is used but value
                              is unspecified, defaults to rollup.config.js)
-d, --dir <dirname>         Directory for chunks (if absent, prints to stdout)
-e, --external <ids>        Comma-separate list of module IDs to exclude
-f, --format <format>       Type of output (amd, cjs, es, iife, umd, system)
-g, --globals <pairs>       Comma-separate list of `moduleID:Global` pairs
-h, --help                  Show this help message
-i, --input <filename>      Input (alternative to <entry file>)
-m, --sourcemap             Generate sourcemap (`-m inline` for inline map)
-n, --name <name>           Name for UMD export
-o, --file <output>         Single output file (if absent, prints to stdout)
-p, --plugin <plugin>       Use the plugin specified (may be repeated)
-v, --version               Show version number
-w, --watch                 Watch files in bundle and rebuild on changes
--amd.id <id>               ID for AMD module (default is anonymous)
--amd.autoId                Generate the AMD ID based off the chunk name
--amd.basePath <prefix>     Path to prepend to auto generated AMD ID
--amd.define <name>         Function to use in place of `define`
--amd.forceJsExtensionForImports Use `.js` extension in AMD imports
--assetFileNames <pattern>  Name pattern for emitted assets
--banner <text>             Code to insert at top of bundle (outside wrapper)
--chunkFileNames <pattern>  Name pattern for emitted secondary chunks
--compact                   Minify wrapper code
--context <variable>        Specify top-level `this` value
--no-dynamicImportInCjs     Write external dynamic CommonJS imports as require
--entryFileNames <pattern>  Name pattern for emitted entry chunks
--environment <values>      Settings passed to config file (see example)
--no-esModule               Do not add __esModule property
--exports <mode>            Specify export mode (auto, default, named, none)
--extend                    Extend global variable defined by --name
--no-externalImportAssertions Omit import assertions in "es" output
--no-externalLiveBindings   Do not generate code to support live bindings
--failAfterWarnings         Exit with an error if the build produced warnings
--footer <text>             Code to insert at end of bundle (outside wrapper)
--no-freeze                 Do not freeze namespace objects
--generatedCode <preset>    Which code features to use (es5/es2015)
--no-hoistTransitiveImports Do not hoist transitive imports into entry chunks
--no-indent                 Don't indent result
--interop <type>            Handle default/namespace imports from AMD/CommonJS
--inlineDynamicImports      Create single bundle when using dynamic imports
--intro <text>              Code to insert at top of bundle (inside wrapper)
--no-makeAbsoluteExternalsRelative Prevent normalization of external imports
--maxParallelFileOps <value> How many files to read in parallel
--minifyInternalExports     Force or disable minification of internal exports
--noConflict                Generate a noConflict method for UMD globals
--outro <text>              Code to insert at end of bundle (inside wrapper)
--perf                      Display performance timings
--no-preserveEntrySignatures Avoid facade chunks for entry points
--preserveModules           Preserve module structure
--preserveModulesRoot       Put preserved modules under this path at root level
--preserveSymlinks          Do not follow symlinks when resolving files
--no-sanitizeFileName       Do not replace invalid characters in file names
--shimMissingExports        Create shim variables for missing exports
--silent                    Don't print warnings
--sourcemapBaseUrl <url>    Emit absolute sourcemap URLs with given base
--sourcemapExcludeSources   Do not include source code in source maps
--sourcemapFile <file>      Specify bundle position for source maps
--stdin=ext                 Specify file extension used for stdin input
--no-stdin                  Do not read "-" from stdin
--no-strict                 Don't emit `"use strict";` in the generated modules
--strictDeprecations        Throw errors for deprecated features
--no-systemNullSetters      Do not replace empty SystemJS setters with `null`
--no-treeshake              Disable tree-shaking optimisations
--no-treeshake.annotations  Ignore pure call annotations
--no-treeshake.moduleSideEffects Assume modules have no side effects
--no-treeshake.propertyReadSideEffects Ignore property access side effects
--no-treeshake.tryCatchDeoptimization Do not turn off try-catch-tree-shaking
--no-treeshake.unknownGlobalSideEffects Assume unknown globals do not throw
--waitForBundleInput        Wait for bundle input files
--watch.buildDelay <number> Throttle watch rebuilds
--no-watch.clearScreen      Do not clear the screen when rebuilding
--watch.skipWrite           Do not write files to disk when watching
--watch.exclude <files>     Exclude files from being watched
--watch.include <files>     Limit watching to specified files
--watch.onStart <cmd>       Shell command to run on `"START"` event
--watch.onBundleStart <cmd> Shell command to run on `"BUNDLE_START"` event
--watch.onBundleEnd <cmd>   Shell command to run on `"BUNDLE_END"` event
--watch.onEnd <cmd>         Shell command to run on `"END"` event
--watch.onError <cmd>       Shell command to run on `"ERROR"` event
--validate                  Validate output
```

下面列出的选项只能通过命令行界面使用。想了解所有其他对应选项，请查看 [选项大列表](/docs/big-list-of-options)。

### `-h`/`--help`

打印帮助文档。

### `-p <plugin>`, `--plugin <plugin>`

使用指定的插件。可以使用下列的方法指定插件：

- 通过相对路径：

  ```
  rollup -i input.js -f es -p ./my-plugin.js
  ```

  `my-plugin.js` 应该导出一个返回插件对象的函数。

- 通过插件名导入通过 npm 安装的 Rollup 插件包：

  ```
  rollup -i input.js -f es -p @rollup/plugin-node-resolve
  ```

  如果插件包名称不是以 `rollup-plugin-` 或 `@rollup/plugin-` 开头，Rollup 会自动尝试添加它们：

  ```
  rollup -i input.js -f es -p node-resolve
  ```

- 通过一个行内实现：

  ```
  rollup -i input.js -f es -p '{transform: (c, i) => `/* ${JSON.stringify(i)} */\n${c}`}'
  ```

如果您想加载多个插件，可以重复使用该选项或添加逗号将插件隔开：

```
rollup -i input.js -f es -p node-resolve -p commonjs,json
```

默认情况下，插件函数将在没有参数的情况下调用以创建插件。但是，您也可以传递自定义参数：

```
rollup -i input.js -f es -p 'terser={output: {beautify: true, indent_level: 2}}'
```

### `--configPlugin <plugin>`

允许指定 Rollup 插件来转换或以其他方式控制配置文件的解析。主要好处是它允许您使用非 JavaScript 配置文件。例如，如果您安装了 `@rollup/plugin-typeScript`, Rollup 将允许您用 TypeScript 编写配置文件：

```
rollup --config rollup.config.ts --configPlugin @rollup/plugin-typescript
```

注意：请确保 Rollup 配置文件被包括在 `tsconfig.json` 文件的 `include` 属性中。比如：

```
"include": ["src/**/*", "rollup.config.ts"],
```

此选项支持与 [`--plugin`](#p-plugin-plugin-plugin) 选项相同的语法，即，您可以多次指定该选项，您可以省略 `@rollup/plugin-` 前缀，只需编写 `typescript` ，您可以通过 `={…}` 指定插件选项。

使用此选项将使 Rollup 在执行配置文件之前首先将其转换为 ESM。要转换为 CommonJS，还需要传递 [`--bundleConfigAsCjs`](#bundleconfigascjs) 选项。

### `--bundleConfigAsCjs`

此选项将强制您的配置转换为 CommonJS 格式。

这允许您使用 CommonJS 惯用语法，如 `__dirname` 或 `require.resolve`，即使配置本身是使用 ESM 格式编写的。

### `-v`/`--version`

打印 Rollup 的版本号。

### `-w`/`--watch`

当磁盘上的源文件发生更改时，重新生成捆绑包。

_注意：在监视模式下，`ROLLUP_WATCH` 环境变量将由 Rollup 的命令行界面设置为 `"true"`，并可由其他进程检查。而插件应该检查 [`this.meta.watchMode`](/docs/plugin-development#this-meta) 属性，它独立于命令行界面。_

### `--silent`

不打印警告信息到控制台。如果配置文件中包含 `onwarn` 回调函数，则将调用此函数。要手动防止这种情况，您可以访问配置文件中的命令行选项，如 [配置文件](#配置文件) 末尾所述。

### `--failAfterWarnings`

构建过程不允许出现警告。如果出现任何警告，将立即退出并返回错误。

### `--environment <values>`

通过 `process.ENV` 将其他环境变量传递到配置文件。

```sh
rollup -c --environment INCLUDE_DEPS,BUILD:production
```

这将把 `process.env.INCLUDE_DEPS` 设为 `"true"` 并且把 `process.env.BUILD` 设为 `"production"`。您可以多次使用此选项。如果存在同名环境变量，后续设置的变量将覆盖先前的变量。这使您能够覆盖 `package.json` 中的环境变量：

```json
{
  "scripts": {
    "build": "rollup -c --environment INCLUDE_DEPS,BUILD:production"
  }
}
```

如果您执行这个命令：

```
npm run build -- --environment BUILD:development
```

配置文件中的 `process.env.BUILD` 将被改为 `"development"`。

### `--waitForBundleInput`

如果其中一个入口点文件不可用，Rollup 不会引发错误。相反，Rollup 将等到所有文件都存在后再开始构建。在监视模式下，当 Rollup 正在消耗另一个进程的输出的时候，这个选项尤其有用。

### `--stdin=ext`

Specify a virtual file extension when reading content from stdin. By default, Rollup will use the virtual file name `-` without an extension for content read from stdin. Some plugins, however, rely on file extensions to determine if they should process a file. See also [Reading a file from stdin](#reading-a-file-from-stdin).

### `--no-stdin`

Do not read files from `stdin`. Setting this flag will prevent piping content to Rollup and make sure Rollup interprets `-` and `-.[ext]` as a regular file names instead of interpreting these as the name of `stdin`. See also [Reading a file from stdin](#reading-a-file-from-stdin).

### `--watch.onStart <cmd>`, `--watch.onBundleStart <cmd>`, `--watch.onBundleEnd <cmd>`, `--watch.onEnd <cmd>`, `--watch.onError <cmd>`

When in watch mode, run a shell command `<cmd>` for a watch event code. See also [rollup.watch](#rollupwatch).

```sh
rollup -c --watch --watch.onEnd="node ./afterBuildScript.js"
```

## Reading a file from stdin

When using the command line interface, Rollup can also read content from stdin:

```
echo "export const foo = 42;" | rollup --format cjs --file out.js
```

When this file contains imports, Rollup will try to resolve them relative to the current working directory. When using a config file, Rollup will only use `stdin` as an entry point if the file name of the entry point is `-`. To read a non-entry-point file from stdin, just call it `-`, which is the file name that is used internally to reference `stdin`. I.e.

```js
import foo from '-'
```

in any file will prompt Rollup to try to read the imported file from `stdin` and assign the default export to `foo`. You can pass the [`--no-stdin`](#--no-stdin) CLI flag to Rollup to treat `-` as a regular file name instead.

As some plugins rely on file extensions to process files, you can specify a file extension for stdin via `--stdin=ext` where `ext` is the desired extension. In that case, the virtual file name will be `-.ext`:

```
echo '{"foo": 42, "bar": "ok"}' | rollup --stdin=json -p json
```

The JavaScript API will always treat `-` and `-.ext` as regular file names.
