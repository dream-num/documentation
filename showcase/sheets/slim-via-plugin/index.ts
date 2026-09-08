import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'integrations' as const,
  group: { 'en-US': 'Integration modes', 'zh-CN': '集成模式' },
  packages: [
    '@univerjs/core',
    '@univerjs/design',
    '@univerjs/ui',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs/engine-render',
    '@univerjs/engine-formula',
    '@univerjs/sheets',
    '@univerjs/sheets-ui',
    '@univerjs/sheets-formula-ui',
    '@univerjs/sheets-numfmt-ui',
  ],
  apis: [
    { name: 'new Univer()' },
    { name: 'Univer.registerPlugin()' },
    { name: 'Univer.createUnit()' },
    { name: 'Univer.dispose()' },
  ],
  guide: {
    overview: {
      'en-US':
        'The smallest plugin-mode Sheets setup: construct one owning Univer, register the render, formula, UI, Docs and Sheets plugins in dependency order, then create an empty workbook.',
      'zh-CN':
        '最小化的 Sheets 插件模式配置：创建一个拥有生命周期的 Univer，按依赖顺序注册渲染、公式、UI、Docs 与 Sheets 插件，再创建一个空工作簿。',
    },
    tryIt: {
      'en-US': [
        'Edit a cell in the native grid and use the native toolbar, formula bar, Undo and Redo controls.',
        'Switch the documentation theme. The Preview updates the existing SDK owner and preserves edited cells.',
        'Open the source files: create-demo.ts contains the reusable plugin registration, while index.ts only mounts and disposes it.',
      ],
      'zh-CN': [
        '在原生表格中编辑单元格，并使用原生工具栏、公式栏以及撤销和重做控件。',
        '切换文档站主题。Preview 更新现有 SDK 实例并保留已编辑单元格。',
        '查看源码：create-demo.ts 包含可复用的插件注册，index.ts 只负责挂载与销毁。',
      ],
    },
    expected: {
      'en-US':
        'Preview and export share exactly one owner and all official SDK styles. This example intentionally adds no host controls or feature plugins; use Basic Plugin Mode for the expanded stack.',
      'zh-CN':
        'Preview 与导出共享同一个 owner，并包含全部官方 SDK 样式。本例刻意不增加宿主控件或功能插件；扩展插件栈请查看“基础插件模式”。',
    },
  },
  variants: [
    { id: 'light', label: { 'en-US': 'Light SDK theme', 'zh-CN': 'SDK 浅色主题' } },
    { id: 'dark', label: { 'en-US': 'Dark SDK theme', 'zh-CN': 'SDK 深色主题' } },
  ],
  actions: [
    { id: 'native-edit', label: { 'en-US': 'Native cell editing', 'zh-CN': '原生单元格编辑' } },
    { id: 'native-history', label: { 'en-US': 'Native Undo / Redo', 'zh-CN': '原生撤销 / 重做' } },
  ],
  states: [
    { id: 'empty', label: { 'en-US': 'New empty workbook', 'zh-CN': '新建空工作簿' } },
    { id: 'edited', label: { 'en-US': 'User-edited workbook', 'zh-CN': '用户已编辑工作簿' } },
  ],
  title: {
    'en-US': 'Minimal Example (Plugin Mode)',
    'zh-CN': '精简示例（插件模式）',
    'zh-TW': '最小範例（插件模式）',
    'ja-JP': '最小限の例（プラグインモード）',
  },
  description: {
    'en-US':
      'Build the smallest editable Univer Sheets instance with explicit plugin registration and lifecycle ownership.',
    'zh-CN': '通过显式插件注册和生命周期管理，构建最小可编辑 Univer Sheets 实例。',
    'zh-TW': '透過明確的外掛註冊與生命週期管理，建立最小可編輯 Univer Sheets 實例。',
    'ja-JP': '明示的なプラグイン登録とライフサイクル管理で、最小の編集可能な Univer Sheets を構築します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Plugin Mode'],
    'zh-CN': ['Univer Sheets', '插件模式'],
    'zh-TW': ['Univer Sheets', '外掛模式'],
    'ja-JP': ['Univer Sheets', 'プラグインモード'],
  },
}

export const files = readShowcaseFiles(import.meta.url, {
  '/reference/preview.tsx.txt': './preview/main.tsx',
  '/src/index.ts': './code/index.ts',
  '/src/data.ts': './code/data.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/styles.css': './code/styles.css',
})

export default { metadata, files, Preview }
