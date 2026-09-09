import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'docs-traditional' as const,
  category: 'features' as const,
  group: { 'en-US': 'Page geometry', 'zh-CN': '页面几何' },
  previewHeight: 950,
  title: { 'en-US': 'Multi-column Layout', 'zh-CN': '多栏布局' },
  description: {
    'en-US':
      'Compare native single, double, triple and unequal-width columns, with gaps and a separator-rendering limitation.',
    'zh-CN': '比较原生单栏、双栏、三栏、不等宽栏和栏间距，并展示分隔线渲染限制。',
  },
  tags: { 'en-US': ['Columns', 'Sections', 'Text flow'], 'zh-CN': ['分栏', '分节', '文字流'] },
  packages: ['@univerjs/preset-docs-core'],
  apis: [
    { name: 'FDocumentSection.setColumns()' },
    { name: 'FDocumentSection.getColumns()' },
    { name: 'FDocumentSection.describe()' },
  ],
  variants: [
    { id: 'single', label: { 'en-US': 'Single column', 'zh-CN': '单栏' } },
    { id: 'double', label: { 'en-US': 'Two equal columns', 'zh-CN': '等宽双栏' } },
    { id: 'triple', label: { 'en-US': 'Three columns / separator requested', 'zh-CN': '三栏／请求分隔线' } },
    { id: 'unequal', label: { 'en-US': 'Unequal widths', 'zh-CN': '不等宽栏' } },
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
