import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'docs-modern' as const,
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
        'The smallest plugin-mode Docs setup: construct one owning Univer, register the render, formula, UI and Docs plugins, then create an empty native document.',
      'zh-CN':
        '最小化的 Docs 插件模式配置：创建一个拥有生命周期的 Univer，注册渲染、公式、UI 与 Docs 插件，再创建一个空白原生文档。',
    },
    tryIt: {
      'en-US': [
        'Type and format text with the native editor controls, then use native Undo and Redo.',
        'Switch light/dark documentation themes and confirm that the SDK workbench follows the resolved theme.',
        'Open create-demo.ts to compare explicit plugin registration with the separate Minimal Preset Mode case.',
      ],
      'zh-CN': [
        '使用原生编辑器输入并格式化文本，然后使用原生撤销与重做。',
        '切换文档站明暗主题，确认 SDK 工作区跟随解析后的主题。',
        '查看 create-demo.ts，并与独立的“精简预设模式”案例比较显式插件注册。',
      ],
    },
    expected: {
      'en-US':
        'Preview and the nine-file export share the same owner, plugin graph and official Design/UI/Docs CSS. No host feature buttons are added to this minimal integration case.',
      'zh-CN':
        'Preview 与九文件导出共享同一个 owner、插件图及官方 Design/UI/Docs CSS。本最小集成案例不添加宿主功能按钮。',
    },
  },
  variants: [
    { id: 'light', label: { 'en-US': 'Light SDK theme', 'zh-CN': 'SDK 浅色主题' } },
    { id: 'dark', label: { 'en-US': 'Dark SDK theme', 'zh-CN': 'SDK 深色主题' } },
  ],
  actions: [
    { id: 'native-edit', label: { 'en-US': 'Native document editing', 'zh-CN': '原生文档编辑' } },
    { id: 'native-history', label: { 'en-US': 'Native Undo / Redo', 'zh-CN': '原生撤销 / 重做' } },
  ],
  states: [
    { id: 'empty', label: { 'en-US': 'New empty document', 'zh-CN': '新建空白文档' } },
    { id: 'edited', label: { 'en-US': 'User-edited document', 'zh-CN': '用户已编辑文档' } },
  ],
  title: {
    'en-US': 'Minimal Example (Plugin Mode)',
    'zh-CN': '精简示例（插件模式）',
    'zh-TW': '精簡範例（插件模式）',
    'ja-JP': '最小限の例（プラグインモード）',
  },
  description: {
    'en-US':
      'Build the smallest editable Univer Docs instance with explicit plugin registration and lifecycle ownership.',
    'zh-CN': '通过显式插件注册和生命周期管理，构建最小可编辑 Univer Docs 实例。',
    'zh-TW': '透過明確的外掛註冊與生命週期管理，建立最小可編輯 Univer Docs 實例。',
    'ja-JP': '明示的なプラグイン登録とライフサイクル管理で、最小の編集可能な Univer Docs を構築します。',
  },
  tags: {
    'en-US': ['Univer Docs', 'Plugin Mode'],
    'zh-CN': ['Univer Docs', '插件模式'],
    'zh-TW': ['Univer Docs', '外掛模式'],
    'ja-JP': ['Univer Docs', 'プラグインモード'],
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
