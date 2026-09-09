import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 1060,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Ranking and Percentiles', 'zh-CN': '排名与分位数' },
  description: {
    'en-US':
      'Compare tied ranks in both directions, inclusive and exclusive quantiles, percent-rank interpolation and finite-sample boundaries.',
    'zh-CN': '对比并列排名的升降序、包含与排除端点的分位数、百分比排位插值及有限样本边界。',
  },
  tags: {
    'en-US': ['RANK.AVG', 'PERCENTILE.EXC', 'QUARTILE', 'PERCENTRANK', 'Ties'],
    'zh-CN': ['平均排名', '排除型分位数', '四分位数', '百分比排位', '并列'],
  },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue()' }, { name: 'FRange.getRawValue()' }],
  variants: [
    { id: 'ties', label: { 'en-US': 'Ties: EQ versus AVG', 'zh-CN': '并列：相同与平均排名' } },
    { id: 'quantiles', label: { 'en-US': 'INC versus EXC boundaries', 'zh-CN': '包含与排除型边界' } },
    { id: 'percent-rank', label: { 'en-US': 'Percent-rank interpolation', 'zh-CN': '百分比排位插值' } },
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
