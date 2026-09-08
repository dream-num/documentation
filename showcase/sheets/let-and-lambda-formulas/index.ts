import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 850,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'LET and LAMBDA Formulas', 'zh-CN': 'LET 与 LAMBDA 公式' },
  description: {
    'en-US':
      'Compare local formula names, inline LAMBDA arguments, two-array MAP, row-wise BYROW and REDUCE accumulation.',
    'zh-CN': '比较局部公式名称、内联 LAMBDA 参数、双数组 MAP、逐行 BYROW 与 REDUCE 累积。',
  },
  tags: { 'en-US': ['LET', 'LAMBDA', 'MAP', 'BYROW', 'REDUCE'], 'zh-CN': ['LET', 'LAMBDA', 'MAP', 'BYROW', 'REDUCE'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue() / setFormula() / getFormula()' }],
  variants: [
    { id: 'local', label: { 'en-US': 'Local names and parameters', 'zh-CN': '局部名称与参数' } },
    { id: 'mapping', label: { 'en-US': 'Array and row callbacks', 'zh-CN': '数组与行回调' } },
    { id: 'reduce', label: { 'en-US': 'Accumulated results', 'zh-CN': '累积结果' } },
    { id: 'spill-load', label: { 'en-US': 'Spill dependency on initial load', 'zh-CN': '初始加载时的溢出依赖' } },
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
