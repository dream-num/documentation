import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'docs-modern' as const,
  category: 'features' as const,
  group: { 'en-US': 'Layout', 'zh-CN': '布局' },
  previewHeight: 950,
  title: { 'en-US': 'Table Merge and Cell Styles', 'zh-CN': '表格合并与单元格样式' },
  description: {
    'en-US':
      'Compare unmerged cells with a horizontal title span and vertical room label, plus shared shading, borders and text alignment.',
    'zh-CN': '对比未合并单元格、横向标题合并与纵向组别合并，并结合底色、边框和文本对齐。',
  },
  tags: { 'en-US': ['Merge', 'Unmerge', 'Cell styles'], 'zh-CN': ['合并', '取消合并', '单元格样式'] },
  packages: ['@univerjs/preset-docs-core', '@univerjs-pro/docs-table', '@univerjs-pro/docs-table-ui'],
  apis: [
    { name: 'FDocumentTableCell.mergeTo()' },
    { name: 'FDocumentTableCell.unmerge()' },
    { name: 'FDocumentTable.setCellBackground()' },
    { name: 'FDocumentTable.setBorder()' },
  ],
  variants: [
    { id: 'horizontal', label: { 'en-US': 'Title across columns', 'zh-CN': '跨列标题' } },
    { id: 'vertical', label: { 'en-US': 'Label across rows', 'zh-CN': '跨行组别' } },
    { id: 'unmerge', label: { 'en-US': 'Unmerged reference', 'zh-CN': '未合并对照' } },
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
