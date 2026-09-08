import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'docs-modern' as const,
  category: 'features' as const,
  group: { 'en-US': 'Formatting', 'zh-CN': '格式' },
  previewHeight: 950,
  title: { 'en-US': 'Inline Text Formatting', 'zh-CN': '行内文字格式' },
  description: {
    'en-US':
      'Compare native emphasis, foreground color, highlight, decorations and combined styles on short editable phrases.',
    'zh-CN': '在简短可编辑文字片段中比较原生强调、文字颜色、高亮、装饰和组合样式。',
  },
  tags: { 'en-US': ['Text ranges', 'Highlight', 'Inline styles'], 'zh-CN': ['文字范围', '高亮', '行内样式'] },
  packages: ['@univerjs/preset-docs-core', '@univerjs-pro/license'],
  apis: [
    { name: 'FDocument.getTextRange()' },
    { name: 'FDocumentTextRange.setTextStyle()' },
    { name: 'FDocument.save()' },
  ],
  variants: [
    { id: 'emphasis', label: { 'en-US': 'Emphasis', 'zh-CN': '强调' } },
    { id: 'color', label: { 'en-US': 'Color and highlight', 'zh-CN': '颜色与高亮' } },
    { id: 'decorations', label: { 'en-US': 'Decorations and combinations', 'zh-CN': '装饰与组合' } },
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
