import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'boards' as const,
  category: 'features' as const,
  image: '/assets/showcase/boards-text-and-sticky-notes.png',
  group: { 'en-US': 'Text and shapes', 'zh-CN': '文本与形状' },
  title: { 'en-US': 'Text and sticky notes', 'zh-CN': '文本与便签' },
  description: {
    'en-US': 'Compare standalone typography and three native sticky-note text layouts.',
    'zh-CN': '对比独立文本排版及三种原生便签文字布局。',
  },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui'],
  tags: { 'en-US': ['Text', 'Sticky notes'], 'zh-CN': ['文本', '便签'] },
  apis: ['FBoard.setTextContent()', 'FBoard.getShape()', 'FShapeText.setText()', 'FShapeText.setFontSize()'].map(
    (name) => ({ name }),
  ),
  variants: [
    ['typography', 'Standalone typography', '独立文本'],
    ['short', 'Short note', '简短便签'],
    ['multiline', 'Multiline note', '多行便签'],
    ['wide', 'Wide note', '宽便签'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
