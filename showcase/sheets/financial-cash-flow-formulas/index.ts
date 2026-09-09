import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 900,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Financial Cash Flow Formulas', 'zh-CN': '财务现金流公式' },
  description: {
    'en-US':
      'Compare payment timing, interest and principal, present and future value, and inverse rate/period calculations.',
    'zh-CN': '对照付款时点、利息与本金、现值与终值，以及利率和期数的反向计算。',
  },
  tags: { 'en-US': ['PMT', 'IPMT', 'PV', 'FV', 'RATE', 'NPER'], 'zh-CN': ['PMT', 'IPMT', 'PV', 'FV', 'RATE', 'NPER'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue()' }, { name: 'FRange.getRawValue()' }],
  variants: [
    { id: 'timing', label: { 'en-US': 'Payment timing', 'zh-CN': '付款时点' } },
    { id: 'parts', label: { 'en-US': 'Interest and principal', 'zh-CN': '利息与本金' } },
    { id: 'inverse', label: { 'en-US': 'Inverse calculations', 'zh-CN': '反向计算' } },
    { id: 'zero-rate', label: { 'en-US': 'Zero interest', 'zh-CN': '零利率' } },
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
