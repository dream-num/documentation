import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'pdfs' as const,
  category: 'features' as const,
  previewHeight: 1040,
  group: { 'en-US': 'Text', 'zh-CN': '文本' },
  title: { 'en-US': 'Semantic Lists and Numbering', 'zh-CN': '语义列表与编号' },
  description: {
    'en-US': 'Compare native bullets, ordered markers, starting numbers and nested list items.',
    'zh-CN': '比较原生项目符号、有序编号、起始序号与嵌套列表项。',
  },
  tags: { 'en-US': ['Lists', 'Numbering'], 'zh-CN': ['列表', '编号'] },
  packages: ['@univerjs-pro/pdfs', '@univerjs-pro/pdfs-ui', '@univerjs-pro/pdfs-editor', '@univerjs-pro/license'],
  apis: [
    { name: 'FPdfPage.insertList()' },
    { name: 'FPdfList.setPreset()' },
    { name: 'FPdfList.setStartNumber()' },
    { name: 'FPdfList.changeItemLevel()' },
  ],
  variants: [
    { id: 'bullets', label: { 'en-US': 'Round and square bullets', 'zh-CN': '圆形与方形项目符号' } },
    { id: 'numbered', label: { 'en-US': 'Ordered list starting at three', 'zh-CN': '从三开始的编号列表' } },
    { id: 'nested', label: { 'en-US': 'Nested number and letter levels', 'zh-CN': '数字与字母嵌套层级' } },
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
