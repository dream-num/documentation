import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'slides' as const,
  category: 'features' as const,
  group: { 'en-US': 'Text', 'zh-CN': '文本' },
  title: { 'en-US': 'Paragraph Alignment and Spacing', 'zh-CN': '段落对齐与间距' },
  description: {
    'en-US':
      'Compare native paragraph alignment, line height, paragraph spacing and indentation in editable shape text.',
    'zh-CN': '在可编辑的原生形状文本中对比段落对齐、行距、段前段后间距和缩进。',
  },
  tags: { 'en-US': ['Text', 'Paragraphs', 'Spacing'], 'zh-CN': ['文本', '段落', '间距'] },
  packages: ['@univerjs-pro/slides', '@univerjs-pro/slides-ui', '@univerjs-pro/engine-shape'],
  apis: [
    { name: 'RichTextBuilder.paragraph()' },
    { name: 'FShapeText.setRichText()' },
    { name: 'FShapeText.setHorizontalAlign()' },
  ],
  variants: [
    { id: 'alignment', label: { 'en-US': 'Left, center, right and justified', 'zh-CN': '左中右与两端对齐' } },
    { id: 'line-height', label: { 'en-US': 'Line height', 'zh-CN': '行距' } },
    { id: 'paragraph-space', label: { 'en-US': 'Before and after paragraphs', 'zh-CN': '段前与段后间距' } },
    { id: 'indents', label: { 'en-US': 'First-line and leading indents', 'zh-CN': '首行与起始侧缩进' } },
  ],
  previewHeight: 950,
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
