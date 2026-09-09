import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 850,
  group: { 'en-US': 'Rows and Columns', 'zh-CN': '行与列' },
  title: { 'en-US': 'Row and Column Sizing and Visibility', 'zh-CN': '行列尺寸与显隐' },
  description: {
    'en-US': 'Resize native headers and reveal hidden data without changing the workbook calculation.',
    'zh-CN': '使用原生表头调整尺寸、恢复隐藏数据，并保持工作簿计算。',
  },
  tags: {
    'en-US': ['Row height', 'Column width', 'Hidden rows', 'Hidden columns'],
    'zh-CN': ['行高', '列宽', '隐藏行', '隐藏列'],
  },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [
    'FWorksheet.setRowHeightsForced()',
    'FWorksheet.setColumnWidth()',
    'FWorksheet.showRows()',
    'FWorksheet.showColumns()',
  ].map((name) => ({ name })),
  variants: [
    { id: 'dimensions', label: { 'en-US': 'Row height and column width', 'zh-CN': '行高与列宽' } },
    { id: 'visibility', label: { 'en-US': 'Hidden rows and columns', 'zh-CN': '隐藏行与列' } },
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
