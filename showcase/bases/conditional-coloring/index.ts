import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'bases' as const,
  category: 'features' as const,
  previewHeight: 900,
  group: { 'en-US': 'Views', 'zh-CN': '视图' },
  title: { 'en-US': 'Conditional Coloring', 'zh-CN': '条件着色' },
  description: {
    'en-US': 'Compare row, cell and column coloring, overlapping rule priority and filtered records.',
    'zh-CN': '对比行、单元格与整列着色，以及重叠规则优先级和筛选记录。',
  },
  tags: { 'en-US': ['Conditional coloring', 'Rule priority'], 'zh-CN': ['条件着色', '规则优先级'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBaseTableView.setConditionalColorRules()' },
    { name: 'FBaseTableView.getConditionalColorRules()' },
    { name: 'FBaseTableView.setFilter()' },
  ],
  variants: [
    { id: 'rows', label: { 'en-US': 'Entire matching rows', 'zh-CN': '匹配整行' } },
    { id: 'cells', label: { 'en-US': 'Matching cells only', 'zh-CN': '仅匹配单元格' } },
    { id: 'columns', label: { 'en-US': 'Unconditional column', 'zh-CN': '无条件整列' } },
    { id: 'priority', label: { 'en-US': 'Overlapping rule priority', 'zh-CN': '重叠规则优先级' } },
    { id: 'filter', label: { 'en-US': 'Coloring with a filter', 'zh-CN': '着色与筛选组合' } },
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
