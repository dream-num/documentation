import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Tables', 'zh-CN': '表格' },
  title: { 'en-US': 'Table Styles and Headers', 'zh-CN': '表格样式与表头' },
  description: {
    'en-US': 'Compare native row and column bands, edge-column emphasis and built-in themes with visible headers.',
    'zh-CN': '对比原生行列条纹、首尾列强调及内置主题，保留可见表头。',
  },
  tags: { 'en-US': ['Tables', 'Styles', 'Headers'], 'zh-CN': ['表格', '样式', '表头'] },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/preset-sheets-table'],
  apis: [
    { name: 'FWorksheet.addTable()' },
    { name: 'FWorksheet.addTableTheme()' },
    { name: 'FWorksheet.getTableByCell()' },
  ],
  variants: [
    { id: 'rows', label: { 'en-US': 'Row bands and uniform body', 'zh-CN': '交替行与统一底色' } },
    { id: 'columns', label: { 'en-US': 'Column bands and edge emphasis', 'zh-CN': '交替列与首尾列强调' } },
    { id: 'defaults', label: { 'en-US': 'Built-in themes', 'zh-CN': '内置主题' } },
  ],
  previewHeight: 900,
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
