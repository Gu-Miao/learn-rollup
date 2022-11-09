# JavaScript API

Rollup 提供了一个可从 Node.js 使用的 JavaScript API。您很少需要使用它，并且可能应该使用命令行 API，除非您正在扩展 Rollup 本身或将其用于一些深奥的事情，例如以编程方式生成捆绑包。

## rollup.rollup

`rollup.rollup` 函数接收一个 `inputOption` 对象作为参数，并返回一个 Promise，该 Promise 解析为具有各种属性和方法的 `bundle` 对象，如下所示。在此步骤中，Rollup 将构建模块图并执行摇树优化，但不会生成任何输出。

在 `bundle` 对象上，可以调用 `bundle.generate` 多次并使用不同的输出配置对象在内存中生成不同的捆绑包。如果您直接想将它们写入磁盘，请改用 `bundle.write`。

使用完 `bundle` 对象后，应调用 `bundle.close()`，它将允许插件通过 [`closeBundle`](/docs/plugin-development#closebundle) 钩子函数清理其外部进程或服务。

如果在任一阶段发生错误，它将返回一个携带错误的 Promise，您可以通过它们的 `code` 属性来识别错误类型。除了 `code` 和 `message` 属性之外，许多错误还有其他属性可用于自定义报告，请参见 [`utils/error.ts`](https://github.com/rollup/rollup/blob/master/src/utils/error.ts) 获取错误和警告及其代码和属性的完整列表。

```js
import { rollup } from 'rollup';

// 有关这些选项的详细信息，请参见下文
const inputOptions = {...};

// 您可以从同一输入创建多个输出来生成不同格式的捆绑包。比如 CommonJS 和 ESM。
const outputOptionsList = [{...}, {...}];

build();

async function build() {
  let bundle;
  let buildFailed = false;
  try {
    // 创建一个捆绑包
    bundle = await rollup(inputOptions);

    // 此捆绑包所依赖的文件名数组
    console.log(bundle.watchFiles);

    await generateOutputs(bundle);
  } catch (error) {
    buildFailed = true;
    // 错误报告
    console.error(error);
  }
  if (bundle) {
    // 关闭 bundle 对象
    await bundle.close();
  }
  process.exit(buildFailed ? 1 : 0);
}

async function generateOutputs(bundle) {
  for (const outputOptions of outputOptionsList) {
    // 在内存中生成特定于输出的代码
    // 您可以对同一 bundle 对象多次调用此函数
    // 改用 bundle.write 方法可以直接将内容写入到磁盘
    const { output } = await bundle.generate(outputOptions);

    for (const chunkOrAsset of output) {
      if (chunkOrAsset.type === 'asset') {
        // 对于静态资源，这包括
        // {
        //   fileName: string,              // 静态资源文件名
        //   source: string | Uint8Array    // 静态资源文件源
        //   type: 'asset'                  // 表明这是静态资源
        // }
        console.log('Asset', chunkOrAsset);
      } else {
        // 对于代码块这包括
        // {
        //   code: string,                  // 生成的 JavaScript 代码
        //   dynamicImports: string[],      // 代码块动态导入的外部模块
        //   exports: string[],             // 导出的变量名
        //   facadeModuleId: string | null, // 代码块对应的模块的id
        //   fileName: string,              // 代码块文件名
        //   implicitlyLoadedBefore: string[]; // 只应在此代码块之后加载的条目
        //   imports: string[],             // 代码块静态导入的外部模块
        //   importedBindings: {[imported: string]: string[]} // 每个依赖项导入的绑定
        //   isDynamicEntry: boolean,       // 代码块是否为动态入口点
        //   isEntry: boolean,              // 代码块是否为静态入口点
        //   isImplicitEntry: boolean,      // 是否应该只在其他代码块之后加载此代码块
        //   map: string | null,            // sourcemap（如果存在）
        //   modules: {                     // 有关此代码块中模块的信息
        //     [id: string]: {
        //       renderedExports: string[]; // 模块导出的变量名
        //       removedExports: string[];  // 已删除的导出变量名
        //       renderedLength: number;    // 模块中仍需处理的代码的长度
        //       originalLength: number;    // 模块中代码的原始长度
        //       code: string | null;       // 模块中仍需处理的代码
        //     };
        //   },
        //   name: string                   // 命名模式中使用的该块的名称
        //   referencedFiles: string[]      // 通过 import.meta.ROLLUP_FILE_URL_<id> 引用的文件
        //   type: 'chunk',                 // 表示这是一个代码块
        // }
        console.log('Chunk', chunkOrAsset.modules);
      }
    }
  }
}
```

### inputOptions 对象

`inputOptions` 对象可以包含以下属性（有关这些属性的详细信息，请参见 [选项大列表](/docs/big-list-of-options)）：

```js
const inputOptions = {
  // 核心输入选项
  external,
  input, // 一定条件下是必须的
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

  // 实验性的
  experimentalCacheExpiry,
  perf
}
```

### outputOptions 对象

`outputOptions` 对象可以包含以下属性（有关这些属性的详细信息，请参见 [选项大列表](#选项大列表)）：

```js
const outputOptions = {
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
  externalLiveBindings,
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
  sourcemapExcludeSources,
  sourcemapFile,
  sourcemapPathTransform,
  validate,

  // 有风险的选项
  amd,
  esModule,
  exports,
  freeze,
  indent,
  namespaceToStringTag,
  noConflict,
  preferConst,
  sanitizeFileName,
  strict,
  systemNullSetters
}
```

## rollup.watch

Rollup 还提供 `rollup.watch` 函数，当它检测到磁盘上的各个模块发生变化时，它会重新构建您的包。当您使用 `--watch` 选项从命令行运行 Rollup 时，Rollup 将在内部调用 `rollup.watch` 函数。请注意，当通过 JavaScript API 使用监视模式时，您需要调用 `event.result.close()` 来响应 `BUNDLE_END` 事件，以允许插件通过 [`closeBundle`](/docs/plugin-development#closebundle) 钩子函数清理资源，参见下文。

```js
const rollup = require('rollup');

const watchOptions = {...};
const watcher = rollup.watch(watchOptions);

watcher.on('event', event => {
  // event.code 可以是下列值：
  //   START        — 观察者正在启动（重启）
  //   BUNDLE_START — 构建一个独立的捆绑包
  //                  * event.input 将会是 inputOption 对象（如果存在）
  //                  * event.output 包含生成的输出的 file 或 dir 选项值的数组
  //   BUNDLE_END   — 捆绑包构建完成
  //                  * event.input 将会是 inputOption 对象（如果存在）
  //                  * event.output 包含生成的输出的 file 或 dir 选项值的数组
  //                  * event.duration 是构建花费的时间（毫秒）
  //                  * event.result 包含一个 bundle 对象，可以通过调用 bundle.generate
  //                  或者 bundle.write 来构建其他的输出产物。这在使用 watch.skipWrite
  //                  时尤其重要。一旦构建完成，或者如果没有生成输出产物，就应该调用
  //                  event.result.close()。这将允许插件通过 closeBundle 钩子函数清理资源。
  //   END          — 所有捆绑包构建完成
  //   ERROR        — 构建时遇到错误
  //                  * event.error 包含被抛出的错误
  //                  * 当构建发生错误时 event.result 为 null，并且包含输出产物错误的 bundle
  //                  对象。与 BUNDLE_END 一样，一旦完成，就应该调用 event.result.close()。
  // 如果从事件处理程序返回 Promise，则 Rollup 将等待 Promise 完成后再继续。
});

// 这将确保在每次运行后正确关闭捆绑包
watcher.on('event', ({ result }) => {
  if (result) {
  	result.close();
  }
});

// 此外，您可以处理下列事件。返回一个 Promise 使 Rollup 在该阶段等待：
watcher.on('change', (id, { event }) => { /* 文件被修改 */ })
watcher.on('restart', () => { /* 一个新的构建被触发 */ })
watcher.on('close', () => { /* 观察者关闭了 */ })

// 停止监听
watcher.close();
```

### watchOptions

`watchOptions` 参数是要从配置文件导出的配置（或配置数组）。

```js
const watchOptions = {
  ...inputOptions,
  output: [outputOptions],
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

有关 `inputOptions` 和 `outputOptions` 的详细信息，请参见上文，或查阅 [选项大列表](/docs/big-list-of-options) 了解 `chokidar`, `include` 和 `exclude`。

### 以编程方式加载配置文件

为了帮助生成配置，Rollup 通过单独的入口在其命令行界面中暴露了用于加载配置文件的辅助函数。这个函数接收解析的 `fileName` 和一个可选的，包含命令行参数的对象作为参数：

```js
const { loadConfigFile } = require('rollup/loadConfigFile')
const path = require('node:path')
const rollup = require('rollup')

// load the config file next to the current script;
// the provided config object has the same effect as passing "--format es"
// on the command line and will override the format of all outputs
loadConfigFile(path.resolve(__dirname, 'rollup.config.js'), { format: 'es' }).then(
  async ({ options, warnings }) => {
    // "warnings" wraps the default `onwarn` handler passed by the CLI.
    // This prints all warnings up to this point:
    console.log(`We currently have ${warnings.count} warnings`)

    // 这将打印所有延迟的警告
    warnings.flush()

    // options is an array of "inputOptions" objects with an additional "output"
    // property that contains an array of "outputOptions".
    // The following will generate all outputs for all inputs, and write them to disk the same
    // way the CLI does it:
    for (const optionsObj of options) {
      const bundle = await rollup.rollup(optionsObj)
      await Promise.all(optionsObj.output.map(bundle.write))
    }

    // 您也可以直接将其传递给 rollup.watch
    rollup.watch(options)
  }
)
```
