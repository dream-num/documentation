import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  previewHeight: 950,
  title: { 'en-US': 'Statistical Summary Formulas', 'zh-CN': '统计摘要公式' },
  description: {
    'en-US':
      'Compare center, spread, inclusive percentiles, tied ranks and numeric versus nonempty counts using a mixed sample with an outlier.',
    'zh-CN': '使用包含离群值的混合样本，比较集中趋势、离散程度、包含端点的分位数、并列排名及计数差异。',
  },
  tags: { 'en-US': ['Statistics', 'Percentiles', 'Tied ranks'], 'zh-CN': ['统计', '分位数', '并列排名'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue()' }, { name: 'FRange.getValue()' }, { name: 'FRange.getFormula()' }],
  variants: [
    { id: 'center', label: { 'en-US': 'Mean, median and mode', 'zh-CN': '平均数、中位数与众数' } },
    { id: 'spread', label: { 'en-US': 'Sample versus population', 'zh-CN': '样本与总体' } },
    { id: 'percentiles', label: { 'en-US': 'Percentiles and tied ranks', 'zh-CN': '分位数与并列排名' } },
    { id: 'counts', label: { 'en-US': 'Numbers, blanks and text', 'zh-CN': '数值、空白与文字' } },
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
