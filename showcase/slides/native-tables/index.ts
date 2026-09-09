import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'slides' as const,
  category: 'features' as const,
  previewHeight: 950,
  group: { 'en-US': 'Tables', 'zh-CN': '表格' },
  title: { 'en-US': 'Native Tables', 'zh-CN': '原生表格' },
  description: {
    'en-US': 'Edit real slide-table cells and compare header contrast, cell accents, column widths and row heights.',
    'zh-CN': '编辑真正的幻灯片表格单元格，对比表头、单元格强调、列宽与行高。',
  },
  tags: { 'en-US': ['Tables', 'Cells', 'Layout'], 'zh-CN': ['表格', '单元格', '布局'] },
  packages: ['@univerjs-pro/slides', '@univerjs-pro/slides-ui', '@univerjs-pro/slides-table'],
  apis: [
    { name: 'FSlide.newTable()' },
    { name: 'FSlide.insertTable()' },
    { name: 'FSlideTableCell.setText()' },
    { name: 'FSlideTableCell.setBackgroundColor()' },
    { name: 'FSlideTable.setRowHeight()' },
    { name: 'FSlideTable.setColumnWidth()' },
  ],
  variants: [
    { id: 'headers', label: { 'en-US': 'Dark and light headers', 'zh-CN': '深浅表头' } },
    { id: 'cell-accent', label: { 'en-US': 'Individual cell accent', 'zh-CN': '单元格强调' } },
    { id: 'dimensions', label: { 'en-US': 'Compact and spacious dimensions', 'zh-CN': '紧凑与宽松尺寸' } },
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
