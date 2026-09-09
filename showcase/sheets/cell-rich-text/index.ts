import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Cells', 'zh-CN': '单元格' },
  previewHeight: 950,
  title: { 'en-US': 'Cell Rich Text', 'zh-CN': '单元格富文本' },
  description: {
    'en-US':
      'Compare mixed emphasis, colors, font families, decorations and multiline content inside native sheet cells.',
    'zh-CN': '比较原生单元格内部的混合强调、颜色、字体、装饰与多行文字。',
  },
  tags: { 'en-US': ['Rich text', 'Inline styles', 'Text runs'], 'zh-CN': ['富文本', '行内样式', '文字片段'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FUniver.newRichText()' },
    { name: 'FRange.setRichTextValueForCell()' },
    { name: 'FRange.getValue()' },
  ],
  variants: [
    { id: 'emphasis', label: { 'en-US': 'Emphasis and color', 'zh-CN': '强调与颜色' } },
    { id: 'fonts', label: { 'en-US': 'Mixed fonts', 'zh-CN': '混合字体' } },
    { id: 'decorations', label: { 'en-US': 'Text decorations', 'zh-CN': '文字装饰' } },
    { id: 'multiline', label: { 'en-US': 'Multiline content', 'zh-CN': '多行内容' } },
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
