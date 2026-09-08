import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  image: '/assets/showcase/sheets-table-create-and-resize.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Tables', 'zh-CN': '表格' },
  title: { 'en-US': 'Create and Resize Tables', 'zh-CN': '创建与调整表格范围' },
  description: {
    'en-US': 'Create a native table from ordinary cells, expand membership and shrink without deleting data.',
    'zh-CN': '从普通单元格创建原生表格，扩展或缩小范围而不删除数据。',
  },
  tags: { 'en-US': ['Table', 'Create', 'Resize'], 'zh-CN': ['表格', '创建', '范围'] },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/preset-sheets-table'],
  apis: [
    { name: 'FWorksheet.addTable()' },
    { name: 'FWorksheet.setTableRange()' },
    { name: 'FWorksheet.getTableByCell()' },
  ],
  variants: [
    { id: 'expand', label: { 'en-US': 'Expand membership', 'zh-CN': '扩展范围' } },
    { id: 'create', label: { 'en-US': 'Create from ordinary cells', 'zh-CN': '从单元格创建' } },
    { id: 'shrink', label: { 'en-US': 'Shrink without deleting data', 'zh-CN': '缩小范围并保留数据' } },
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
