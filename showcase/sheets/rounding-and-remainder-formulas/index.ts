import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 900,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Rounding and Remainder Formulas', 'zh-CN': '舍入与余数公式' },
  description: {
    'en-US':
      'Compare numeric rounding with display precision, negative-number directions, multiples and signed remainders.',
    'zh-CN': '比较数值舍入与显示精度、负数取整方向、倍数与带符号余数。',
  },
  tags: {
    'en-US': ['ROUND', 'INT', 'TRUNC', 'MOD', 'QUOTIENT', 'CEILING.MATH', 'FLOOR.MATH'],
    'zh-CN': ['ROUND', 'INT', 'TRUNC', 'MOD', 'QUOTIENT', 'CEILING.MATH', 'FLOOR.MATH'],
  },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue() / setFormula() / getCellDatas()' }],
  variants: [
    { id: 'precision', label: { 'en-US': 'Stored value versus display', 'zh-CN': '存储值与显示值' } },
    { id: 'direction', label: { 'en-US': 'Positive and negative rounding', 'zh-CN': '正负数舍入方向' } },
    { id: 'multiples', label: { 'en-US': 'Divisor signs and multiples', 'zh-CN': '除数符号与倍数' } },
    { id: 'mode', label: { 'en-US': 'Negative-number mode', 'zh-CN': '负数模式' } },
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
