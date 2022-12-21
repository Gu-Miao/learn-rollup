# 迁移到 Rollup 3

这是你在迁移到 Rollup 3 时可能遇到的最重要的主题列表。对于完整的中断变化列表，我们建议你查阅

- [Rollup 3 更新日志](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#300)

当从 Rollup 1 或更早的版本迁移时，也请参见

- [Rollup 2 更新日志](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#200)
- [Rollup 1 更新日志](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#100)

## 先决条件

确保您至少运行 Node 14.18.0，并将你所有的 Rollup 插件更新到最新版本。

对于较大的配置，先更新到 `rollup@2.79.1`，在你的配置中添加 [`strictDeprecations`](/docs/big-list-of-options#strictdeprecations) 选项，并解决所有弹出的错误。这样您可以确保不依赖可能在 Rollup 3 中被删除的功能。如果你的插件有错误，请联系插件作者。

## 使用配置文件

如果你使用 ES 模块作为配置文件，即 `import` 和 `export` 语法，您需要确保 Node.js 将你的配置作为 ES 模块加载。

确保这一点的最简单方法是将文件扩展名改为 `.mjs`，另见[配置文件](/docs/command-line-reference#配置文件)。

在使用原生 Node.js ES 模块时，还有一些额外的注意事项，尤其是：

- 你不能简单地导入你的 `package.json` 文件
- 你不能使用 `__dirname` 来获取当前目录

阅读此篇文章 [Caveats when using native Node ES modules](#caveats-when-using-native-node-es-modules) 将给你一些处理这些事情的备选方案。

另外，你也可以通过 [`--bundleConfigAsCjs`](/docs/command-line-reference#bundleconfigascjs) 选项来强制使用旧的加载行为。

如果你使用 [`--configPlugin`](/docs/command-line-reference#configplugin-plugin) 选项，Rollup 现在会在运行前将你的配置打包为 ES 模块而不是 CommonJS。这允许你轻松地从你的配置中导入 ES 模块，但也有与使用原生 ES 模块相同的注意事项，例如，`__dirname` 将不再起作用。同样，你可以通过 [`--bundleConfigAsCjs`](/docs/command-line-reference#bundleconfigascjs) 选项来强制使用旧的加载行为。

## 更改的默认值

一些选项现在有不同的默认值。如果你认为你遇到了任何问题，试着在你的配置中加入以下内容。

```js
{
  makeAbsoluteExternalsRelative: true,
  preserveEntrySignatures: 'strict',
  output: {
    esModule: true,
    generatedCode: {
      reservedNamesAsProps: false
    },
    interop: 'compat',
    systemNullSetters: false
  }
}
```

不过，一般来说，新的默认值是我们推荐的设置。更多细节请参考每个设置的文档。

## 更多更改后的选项

- [`output.banner/output.footer`](/docs/big-list-of-options#output-banner-output-footer) 和 [`output.intro/output.outro`](/docs/big-list-of-options#output-intro-output-outro) 现在是按块调用的，因此不应该做任何性能负担种的操作。

- [`output.entryFileNames`](/docs/big-list-of-options#output-entryfilenames) 和 [`output.chunkFileNames`](/docs/big-list-of-options#output-chunkfilenames) 函数不能再通过 `modules` 访问渲染的模块信息，而只能访问包含的 `moduleIds` 列表。

- 当使用 [`output.preserveModules`](/docs/big-list-of-options#output-preservemodules) 和 `entryFileNames` 时，你不能再使用 `[ext]`、`[extName]` 和 `[assetExtName]` 文件名占位符。另外，模块的路径不再自动预置到文件名中，而是包含在 `[name]` 占位符中。

## 在 CommonJS 输出中的动态导入

默认情况下，当生成 `cjs` 输出时，Rollup 现在会在输出中保留任何外部，即非打包的动态导入作为 `import(...)` 表达式。这在从 Node 14 开始的所有 Node 版本中都被支持，并允许从生成的 CommonJS 输出中加载 CommonJS 和 ES 模块。如果你需要支持旧的 Node 版本，你可以传递 [`output.dynamicImportInCjs: false`](/docs/big-list-of-options#output-dynamicimportincjs)。

## 对插件 API 的修改

然后，一般的输出生成流程已经被重新设计了，新的插件钩子顺序见 [输出生成钩子函数](/docs/plugin-development#输出生成钩子函数) 一节的流程图。最明显的变化可能是 [`banner`](/docs/plugin-development#banner)/[`footer`](/docs/plugin-development#footer)/[`intro`](/docs/plugin-development#intro)/[`outro`](/docs/plugin-development#outro) 不再在开始时被调用一次，而是在每个 chunk 被调用。另一方面，当 hash 被创建时，[`augmentChunkHash`](/docs/plugin-development#augmentchunkhash) 现在在 [`renderChunk`](/docs/plugin-development#renderchunk) 之后被评估。

由于文件哈希值现在是基于 `renderChunk` 之后文件的实际内容，我们在生成哈希值之前不再知道确切的文件名。相反，现在的逻辑依赖于哈希值的形式 `!~{001}~`。这意味着 `renderChunk` 钩子可用的所有文件名都可能包含占位符，而且可能与最终的文件名不一致。但如果你打算在块中使用这些文件名，这并不是一个问题，因为 Rollup 会在 [`generateBundle`](/docs/plugin-development#generatebundle) 运行前替换所有占位符。

这不一定是一个破坏性的变化，但是在 [`renderChunk`](/docs/plugin-development#renderchunk) 中添加或删除导入的插件应该确保他们也会更新传递给这个钩子的相应块的信息。这将使其他插件能够依赖准确的块的信息，而不需要自己去删减块的内容。更多信息请参见 [`renderChunk`](/docs/plugin-development#renderchunk) 一节。
