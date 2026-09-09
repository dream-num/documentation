import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 1100,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'AGGREGATE and SUBTOTAL', 'zh-CN': 'AGGREGATE 与 SUBTOTAL' },
  description: {
    'en-US':
      'Compare filtered and manually hidden rows, error options, nested subtotals and ranked aggregation using native formulas.',
    'zh-CN': '使用原生公式比较筛选与手动隐藏行、错误选项、嵌套分类汇总和排名聚合。',
  },
  tags: {
    'en-US': ['AGGREGATE', 'SUBTOTAL', 'Filter', 'Hidden rows'],
    'zh-CN': ['AGGREGATE', 'SUBTOTAL', '筛选', '隐藏行'],
  },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/preset-sheets-filter'],
  apis: [
    { name: 'FRange.createFilter()' },
    { name: 'FFilter.setColumnFilterCriteria()' },
    { name: 'FWorksheet.hideRows() / showRows()' },
  ],
  variants: [
    { id: 'visibility', label: { 'en-US': 'Filtered versus manually hidden', 'zh-CN': '筛选与手动隐藏' } },
    { id: 'options', label: { 'en-US': 'Eight error and nesting options', 'zh-CN': '八种错误与嵌套选项' } },
    { id: 'rank', label: { 'en-US': 'Second largest with errors', 'zh-CN': '含错误值的第二大值' } },
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
