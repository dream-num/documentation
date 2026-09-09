import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'docs-traditional' as const,
  category: 'features' as const,
  group: { 'en-US': 'Typesetting', 'zh-CN': '排版' },
  previewHeight: 950,
  title: { 'en-US': 'Anchored Images and Page Flow', 'zh-CN': '图片锚点与分页流动' },
  description: {
    'en-US': 'Compare inline, square and top-and-bottom image wrapping in a native paginated field report.',
    'zh-CN': '在原生分页实地报告中比较行内、四周及上下环绕图片。',
  },
  tags: { 'en-US': ['Images', 'Wrapping', 'Pagination'], 'zh-CN': ['图片', '环绕', '分页'] },
  packages: ['@univerjs/preset-docs-core', '@univerjs/preset-docs-drawing', '@univerjs-pro/license'],
  apis: [
    { name: 'FDocument.getImage()' },
    { name: 'FDocumentImage.setWrappingStyle()' },
    { name: 'FDocumentImage.setPositionH()' },
  ],
  variants: [
    { id: 'inline', label: { 'en-US': 'Inline flow', 'zh-CN': '行内流动' } },
    { id: 'square', label: { 'en-US': 'Square wrapping', 'zh-CN': '四周环绕' } },
    { id: 'top-bottom', label: { 'en-US': 'Top and bottom', 'zh-CN': '上下环绕' } },
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
