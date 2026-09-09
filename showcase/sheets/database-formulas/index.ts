import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 950,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Database Criteria Formulas', 'zh-CN': '数据库条件公式' },
  description: {
    'en-US':
      'Use native database functions with AND/OR criteria ranges, field names or indexes, and distinct zero, blank and text amounts.',
    'zh-CN': '使用原生数据库函数比较AND/OR条件区域、字段名与索引，以及零值、空白和文本金额。',
  },
  tags: {
    'en-US': ['DSUM', 'DAVERAGE', 'DCOUNT', 'DCOUNTA', 'DMAX', 'DMIN'],
    'zh-CN': ['DSUM', 'DAVERAGE', 'DCOUNT', 'DCOUNTA', 'DMAX', 'DMIN'],
  },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue() / setFormula() / getFormula()' }],
  variants: [
    { id: 'criteria', label: { 'en-US': 'AND within rows, OR across rows', 'zh-CN': '同行AND与跨行OR' } },
    { id: 'count', label: { 'en-US': 'Numbers versus nonempty values', 'zh-CN': '数值与非空值' } },
    { id: 'field', label: { 'en-US': 'Field name and field index', 'zh-CN': '字段名与字段索引' } },
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
