import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Workbook and Worksheets', 'zh-CN': '工作簿与工作表' },
  title: { 'en-US': 'Worksheet Tabs and Visibility', 'zh-CN': '工作表标签与可见性' },
  description: {
    'en-US': 'Organize four worksheets with native tab names, colors and visibility, plus a public Facade ordering recipe.',
    'zh-CN': '使用原生标签名称、颜色和可见性组织四张工作表，并提供公开 Facade 排序示例。',
  },
  tags: { 'en-US': ['Worksheet tabs', 'Rename', 'Hide and unhide'], 'zh-CN': ['工作表标签', '重命名', '隐藏与恢复'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FWorksheet.setName() / setTabColor()' },
    { name: 'FWorksheet.hideSheet() / showSheet() / isSheetHidden()' },
    { name: 'FWorkbook.moveSheet()' },
  ],
  variants: [
    { id: 'identity', label: { 'en-US': 'Tab names and colors', 'zh-CN': '标签名称与颜色' } },
    { id: 'order', label: { 'en-US': 'Worksheet order', 'zh-CN': '工作表顺序' } },
    { id: 'visibility', label: { 'en-US': 'Hidden and restored worksheets', 'zh-CN': '隐藏与恢复工作表' } },
  ],
  actions: [],
  states: [],
}

const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})

export default { metadata, files, Preview }
