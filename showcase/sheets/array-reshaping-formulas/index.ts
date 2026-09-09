import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 1000,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Array Reshaping Formulas', 'zh-CN': '数组重塑公式' },
  description: {
    'en-US':
      'Slice, reorder, stack, flatten and wrap native arrays while comparing blank, zero, error and mismatch padding behavior.',
    'zh-CN': '使用原生公式切片、重排、拼接、展开与折行数组，对比空白、零值、错误和尺寸填充。',
  },
  tags: {
    'en-US': ['TAKE', 'DROP', 'CHOOSECOLS', 'CHOOSEROWS', 'HSTACK', 'VSTACK', 'TOCOL', 'TOROW', 'WRAPROWS', 'WRAPCOLS'],
    'zh-CN': ['数组切片', '拼接', '展开', '折行'],
  },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue() / setFormula() / getValues()' }],
  variants: [
    { id: 'slice', label: { 'en-US': 'Slice and reorder', 'zh-CN': '切片与重排' } },
    { id: 'stack', label: { 'en-US': 'Stack and mismatch padding', 'zh-CN': '拼接与尺寸填充' } },
    { id: 'flatten', label: { 'en-US': 'Scan direction and wrapping', 'zh-CN': '扫描方向与折行' } },
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
