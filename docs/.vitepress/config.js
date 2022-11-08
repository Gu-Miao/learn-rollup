export default {
  lang: 'zh_CN',
  title: 'Rollup',
  cleanUrls: 'with-subfolders',
  ignoreDeadLinks: true,
  lastUpdated: true,
  head: [['link', { rel: 'shortcut icon', href: '/logo.svg', type: 'image/svg+xml' }]],
  themeConfig: {
    siteTitle: 'Rollup',
    logo: '/logo.svg',
    nav: [
      { text: '文档', link: '/docs/introduction', activeMatch: '/docs/' },
      { text: '游乐场', link: 'https://rollupjs.org/repl/' },
      { text: 'Github', link: 'https://github.com/Gu-Miao/learn-rollup' },
      { text: '英文官网', link: 'https://rollupjs.org/' }
    ],
    outline: [2, 3],
    outlineTitle: ' ',
    sidebar: [
      {
        text: '文档',
        items: [
          { text: '介绍', link: '/docs/introduction' },
          { text: '命令行界面', link: '/docs/command-line-reference' },
          { text: 'JavaScript API', link: '/docs/javascript-api' },
          { text: 'ES Module 语法', link: '/docs/es-module-syntax' },
          { text: '教程', link: '/docs/tutorial' },
          { text: '插件开发', link: '/docs/plugin-development' },
          { text: 'FAQ', link: '/docs/faqs' },
          { text: '工具', link: '/docs/tools' },
          { text: '故障排除', link: '/docs/troubleshooting' },
          { text: '迁移', link: '/docs/migration' },
          { text: '大选项列表', link: '/docs/big-list-of-options' }
        ]
      }
    ],
    footer: {
      message: 'MIT License.',
      copyright: 'Copyright © 2022-present Gu-Miao'
    },
    lastUpdatedText: '最近更新时间',
    docFooter: {
      prev: '上一页',
      next: '下一页'
    }
  }
}
