import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'slides' as const,
  category: 'features' as const,
  group: { 'en-US': 'Text', 'zh-CN': '文本' },
  previewHeight: 950,
  title: { 'en-US': 'Text Lists and Bullets', 'zh-CN': '项目符号与编号列表' },
  description: {
    'en-US': 'Compare native bullet, ordered and three-level lists inside editable slide shapes.',
    'zh-CN': '在可编辑幻灯片形状中比较原生项目符号、编号与三级列表。',
  },
  tags: { 'en-US': ['Bullets', 'Numbering', 'Nested lists'], 'zh-CN': ['项目符号', '编号', '多级列表'] },
  packages: ['@univerjs-pro/slides', '@univerjs-pro/slides-ui', '@univerjs-pro/engine-shape'],
  apis: [{ name: 'RichTextBuilder.listItem()' }, { name: 'FShape.getText()' }, { name: 'FShapeText.setRichText()' }],
  variants: [
    { id: 'bullets', label: { 'en-US': 'Bullet list', 'zh-CN': '项目符号' } },
    { id: 'ordered', label: { 'en-US': 'Ordered list', 'zh-CN': '编号列表' } },
    { id: 'nested', label: { 'en-US': 'Three nesting levels', 'zh-CN': '三级嵌套' } },
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
