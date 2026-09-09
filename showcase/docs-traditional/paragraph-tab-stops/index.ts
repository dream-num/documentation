import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'docs-traditional' as const,
  category: 'features' as const,
  group: { 'en-US': 'Typography', 'zh-CN': '排版' },
  previewHeight: 950,
  title: { 'en-US': 'Paragraph Tab Stops', 'zh-CN': '段落制表位' },
  description: {
    'en-US': 'Compare native start, center and end tab alignment and dotted, hyphen and underline leaders.',
    'zh-CN': '比较原生起始、居中与结束制表对齐，以及点线、短划线与下划线引导符。',
  },
  tags: { 'en-US': ['Tab stops', 'Leaders', 'Paragraphs'], 'zh-CN': ['制表位', '引导符', '段落'] },
  packages: ['@univerjs/preset-docs-core', '@univerjs-pro/license'],
  apis: [{ name: 'FDocument.getParagraphs()' }, { name: 'FDocumentParagraph.setStyle()' }],
  variants: [
    { id: 'alignment', label: { 'en-US': 'Start, center and end', 'zh-CN': '起始、居中与结束' } },
    { id: 'leaders', label: { 'en-US': 'Leader styles', 'zh-CN': '引导符样式' } },
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
