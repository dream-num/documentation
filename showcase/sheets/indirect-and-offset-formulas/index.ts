import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 1000,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'INDIRECT and OFFSET References', 'zh-CN': 'INDIRECT 与 OFFSET 动态引用' },
  description: {
    'en-US':
      'Resolve editable A1/R1C1 text addresses, quoted sheet names and variable-size OFFSET windows with visible error boundaries.',
    'zh-CN': '编辑A1/R1C1文本地址、带空格工作表名称和OFFSET窗口尺寸，比较真实计算与引用错误边界。',
  },
  tags: {
    'en-US': ['INDIRECT', 'OFFSET', 'R1C1', 'Dynamic range'],
    'zh-CN': ['INDIRECT', 'OFFSET', 'R1C1', '动态区域'],
  },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue() / setFormula() / getRawValue()' }],
  variants: [
    { id: 'text', label: { 'en-US': 'A1 and absolute R1C1', 'zh-CN': 'A1与绝对R1C1' } },
    { id: 'window', label: { 'en-US': 'Offset and rectangle size', 'zh-CN': '偏移与矩形尺寸' } },
    { id: 'errors', label: { 'en-US': 'Invalid reference boundaries', 'zh-CN': '无效引用边界' } },
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
