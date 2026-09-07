import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-print.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: {
    'en-US': 'Files and output',
    'zh-CN': '文件与输出',
  },
  title: {
    'en-US': 'Print',
    'zh-CN': '打印',
    'zh-TW': '列印',
    'ja-JP': '印刷',
  },
  description: {
    'en-US': 'This example demonstrates how to create and manipulate print settings in Univer Sheets',
    'zh-CN': '本示例演示了如何使用 Univer Sheets 创建和操作打印设置',
    'zh-TW': '本範例演示了如何使用 Univer Sheets 創建和操作列印設定',
    'ja-JP': 'この例では、Univer Sheets で印刷設定を作成および操作する方法を示します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
  packages: [
    '@univerjs/preset-sheets-core',
    '@univerjs/preset-sheets-drawing',
    '@univerjs/preset-sheets-advanced',
    '@univerjs-pro/sheets-print',
  ],
  apis: [
    { name: 'FWorkbook.openPrintDialog() / closePrintDialog()' },
    { name: 'FWorkbook.updatePrintConfig() / updatePrintRenderConfig()' },
    { name: 'FWorkbook.save()' },
    { name: 'FUniver.disposeUnit() / createWorkbook()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Print five portfolio holdings with native paper, scope, orientation and scaling controls. Preview and export share the factory, complete locales and official SDK CSS; no HTTP Exchange clients are registered.',
      'zh-CN':
        '通过原生纸张、范围、方向和缩放控件打印五条投资持仓。预览与导出共享 factory、完整语言包及官方 SDK 样式；不注册 HTTP Exchange 客户端。',
    },
    tryIt: {
      'en-US': [
        'Open Print from the native ribbon; A7 is an ordinary portfolio caption.',
        'Switch between current sheet, selected range, and workbook output.',
        'Change scaling, margins, headers, and page order before printing.',
      ],
      'zh-CN': [
        '从原生功能区打开打印；A7 为普通报表标题。',
        '切换当前工作表、选区与工作簿打印范围。',
        '调整缩放、页边距、页眉和页面顺序。',
      ],
    },
    expected: {
      'en-US':
        'Cancel returns to the same edited workbook. README examples explain configuration, JSON download and complete owner recovery; native print needs no backend.',
      'zh-CN': '取消后返回同一个已编辑工作簿。README 提供配置、JSON 下载和完整 owner 重建代码；原生打印无需后端。',
    },
  },
  variants: [
    { id: 'sheet', label: { 'en-US': 'Current sheet', 'zh-CN': '当前工作表' } },
    { id: 'selection', label: { 'en-US': 'Selected range', 'zh-CN': '选定区域' } },
    { id: 'workbook', label: { 'en-US': 'Workbook', 'zh-CN': '工作簿' } },
  ],
  actions: [
    { id: 'open', label: { 'en-US': 'Open print dialog', 'zh-CN': '打开打印对话框' } },
    { id: 'restore', label: { 'en-US': 'Restore complete owner (README)', 'zh-CN': '完整重建（README）' } },
  ],
  states: [
    { id: 'normal', label: { 'en-US': 'Portfolio report', 'zh-CN': '投资组合报表' } },
    { id: 'multipage', label: { 'en-US': 'Multi-page preview', 'zh-CN': '多页预览' } },
  ],
}

export const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './code/README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})

export default { metadata, files, Preview }
