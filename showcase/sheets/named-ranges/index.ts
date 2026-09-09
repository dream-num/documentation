import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  previewHeight: 850,
  category: 'features' as const,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Named Ranges and Formulas', 'zh-CN': '命名范围与命名公式' },
  description: {
    'en-US': 'Compare ordinary addresses, workbook-scoped names and a reusable named calculation.',
    'zh-CN': '比较普通地址、工作簿级名称与可复用命名计算。',
  },
  tags: { 'en-US': ['Defined names', 'Named ranges'], 'zh-CN': ['定义名称', '命名范围'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FWorkbook.newDefinedNameBuilder()' },
    { name: 'FWorkbook.insertDefinedNameBuilder()' },
    { name: 'FRange.setValue()' },
  ],
  variants: [],
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
