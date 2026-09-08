import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'pdfs' as const,
  category: 'features' as const,
  previewHeight: 900,
  group: { 'en-US': 'Pages', 'zh-CN': '页面' },
  title: { 'en-US': 'Page Insertion', 'zh-CN': '页面插入' },
  description: {
    'en-US':
      'Insert blank pages at the beginning, middle or end of a three-page packet and inspect inherited page geometry.',
    'zh-CN': '在三页文档的开头、中间或末尾插入空白页，并检查继承的页面尺寸。',
  },
  tags: { 'en-US': ['Pages', 'Insertion', 'Page sizes'], 'zh-CN': ['页面', '插入', '页面尺寸'] },
  packages: ['@univerjs-pro/pdfs', '@univerjs-pro/pdfs-ui', '@univerjs-pro/pdfs-editor', '@univerjs-pro/license'],
  apis: [
    { name: 'FPdf.insertPage()' },
    { name: 'FPdf.getPages() / getPageById()' },
    { name: 'FPdfPage.getData() / insertTextBox()' },
  ],
  variants: [
    { id: 'position', label: { 'en-US': 'Beginning, middle and end', 'zh-CN': '开头、中间与末尾' } },
    { id: 'inheritance', label: { 'en-US': 'Inherited page geometry', 'zh-CN': '继承页面尺寸' } },
    { id: 'bounds', label: { 'en-US': 'Insertion index bounds', 'zh-CN': '插入索引边界' } },
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
