import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'docs-modern' as const,
  category: 'features' as const,
  group: { 'en-US': 'Formatting', 'zh-CN': '格式' },
  previewHeight: 950,
  title: { 'en-US': 'Superscript and Subscript', 'zh-CN': '上标与下标' },
  description: {
    'en-US':
      'Compare native baseline positions for exponents, chemical indices and ordinal suffixes, including combined styles and reset.',
    'zh-CN': '比较指数、化学下标和序数后缀的原生基线位置，包括组合样式和恢复基线。',
  },
  tags: { 'en-US': ['Superscript', 'Subscript', 'Text ranges'], 'zh-CN': ['上标', '下标', '文字范围'] },
  packages: ['@univerjs/preset-docs-core', '@univerjs-pro/license'],
  apis: [
    { name: 'FDocument.getTextRange()' },
    { name: 'FDocumentTextRange.setTextStyle()' },
    { name: 'FDocument.save()' },
  ],
  variants: [
    { id: 'positions', label: { 'en-US': 'Baseline positions', 'zh-CN': '基线位置' } },
    { id: 'notation', label: { 'en-US': 'Scientific and ordinal notation', 'zh-CN': '科学与序数表示' } },
    { id: 'combined', label: { 'en-US': 'Combined styles and reset', 'zh-CN': '组合样式与恢复' } },
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
