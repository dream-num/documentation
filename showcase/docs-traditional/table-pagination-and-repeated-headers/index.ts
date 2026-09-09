import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'docs-traditional' as const,
  category: 'features' as const,
  group: { 'en-US': 'Typesetting', 'zh-CN': '排版' },
  previewHeight: 950,
  title: { 'en-US': 'Table Pagination and Repeated Headers', 'zh-CN': '表格分页与重复表头' },
  description: {
    'en-US': 'Compare zero, one and two repeated header rows across native table page boundaries.',
    'zh-CN': '比较原生表格跨页时不重复、重复一行及重复两行表头。',
  },
  tags: { 'en-US': ['Tables', 'Pagination', 'Repeated headers'], 'zh-CN': ['表格', '分页', '重复表头'] },
  packages: ['@univerjs/preset-docs-core', '@univerjs-pro/docs-table', '@univerjs-pro/docs-table-ui'],
  apis: [
    { name: 'FDocumentTable.setHeaderRowCount()' },
    { name: 'FDocumentTable.pinHeaderRows()' },
    { name: 'FDocumentTable.getHeaderRowCount()' },
  ],
  variants: [
    { id: 'none', label: { 'en-US': 'No repeating rows', 'zh-CN': '不重复' } },
    { id: 'one', label: { 'en-US': 'One header row', 'zh-CN': '一行表头' } },
    { id: 'two', label: { 'en-US': 'Two header rows', 'zh-CN': '两行表头' } },
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
