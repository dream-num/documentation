import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'slides' as const,
  category: 'features' as const,
  group: { 'en-US': 'Text', 'zh-CN': '文本' },
  previewHeight: 950,
  title: { 'en-US': 'Text Box Insets and Vertical Alignment', 'zh-CN': '文本框内边距与垂直对齐' },
  description: {
    'en-US':
      'Compare top, middle and bottom alignment plus symmetric and asymmetric inner text margins in native slide shapes.',
    'zh-CN': '在原生幻灯片形状中比较顶部、居中与底部对齐，以及对称和非对称文本内边距。',
  },
  tags: { 'en-US': ['Text boxes', 'Insets', 'Vertical alignment'], 'zh-CN': ['文本框', '内边距', '垂直对齐'] },
  packages: ['@univerjs-pro/slides', '@univerjs-pro/slides-ui', '@univerjs-pro/engine-shape'],
  apis: [{ name: 'FShapeText.setVerticalAlign()' }, { name: 'FShapeText.setTextBoxOptions()' }],
  variants: [
    { id: 'vertical', label: { 'en-US': 'Top / middle / bottom', 'zh-CN': '顶部 / 居中 / 底部' } },
    { id: 'symmetric', label: { 'en-US': 'Zero and symmetric insets', 'zh-CN': '无内边距与对称内边距' } },
    { id: 'asymmetric', label: { 'en-US': 'Asymmetric insets', 'zh-CN': '非对称内边距' } },
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
