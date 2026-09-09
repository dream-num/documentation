import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'pdfs' as const,
  category: 'features' as const,
  group: { 'en-US': 'Pages', 'zh-CN': '页面' },
  previewHeight: 950,
  title: { 'en-US': 'Page Management', 'zh-CN': '页面管理' },
  description: {
    'en-US':
      'Use native page-thumbnail actions to move, copy and delete original colored pages, then inspect stable IDs and copied content.',
    'zh-CN': '通过原生缩略图操作移动、复制和删除原创彩色页面，并检查稳定 ID 与复制内容。',
  },
  tags: { 'en-US': ['Page order', 'Copy', 'Delete'], 'zh-CN': ['页面顺序', '复制', '删除'] },
  packages: ['@univerjs-pro/pdfs', '@univerjs-pro/pdfs-editor', '@univerjs-pro/pdfs-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FPdf.getPages()' },
    { name: 'FPdf.getPageById()' },
    { name: 'FPdfPage.getId()' },
    { name: 'FPdfPage.getIndex()' },
    { name: 'FPdf.save()' },
  ],
  variants: [
    { id: 'move', label: { 'en-US': 'Move with stable IDs', 'zh-CN': '移动与稳定 ID' } },
    { id: 'copy', label: { 'en-US': 'Copy content with new IDs', 'zh-CN': '新 ID 与内容复制' } },
    { id: 'delete', label: { 'en-US': 'Delete selected page', 'zh-CN': '删除选中页面' } },
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
