import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  previewHeight: 900,
  category: 'features' as const,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Conditional Summary Formulas', 'zh-CN': '条件汇总公式' },
  description: {
    'en-US': 'Compare single and combined criteria, numeric thresholds, wildcard escaping and no-match summaries.',
    'zh-CN': '比较单条件、多条件、数字阈值、通配符转义与无匹配结果的汇总。',
  },
  tags: { 'en-US': ['SUMIF', 'SUMIFS', 'COUNTIF', 'AVERAGEIF'], 'zh-CN': ['SUMIF', 'SUMIFS', 'COUNTIF', 'AVERAGEIF'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue()' }, { name: 'FRange.getRawValue()' }],
  variants: [
    { id: 'criteria', label: { 'en-US': 'Single and combined criteria', 'zh-CN': '单条件与多条件' } },
    { id: 'threshold', label: { 'en-US': 'Numeric comparison', 'zh-CN': '数字比较条件' } },
    { id: 'wildcards', label: { 'en-US': 'Wildcards and escaping', 'zh-CN': '通配符与转义' } },
    { id: 'no-match', label: { 'en-US': 'No-match results', 'zh-CN': '无匹配结果' } },
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
