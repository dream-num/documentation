import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  image: '/assets/showcase/sheets-conditional-format-rules.png',
  category: 'features' as const,
  group: { 'en-US': 'Formatting', 'zh-CN': '格式' },
  title: { 'en-US': 'Conditional Format Rules', 'zh-CN': '条件格式规则' },
  description: {
    'en-US': 'Live numeric, text, duplicate and relative-formula rules in four native sheets.',
    'zh-CN': '四张原生工作表展示数值、文本、重复值与相对公式条件格式。',
  },
  tags: { 'en-US': ['Conditional formatting', 'Rules', 'Relative formula'], 'zh-CN': ['条件格式', '规则', '相对公式'] },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/preset-sheets-conditional-formatting'],
  apis: [{ name: 'FWorksheet.newConditionalFormattingRule()' }, { name: 'FWorksheet.getConditionalFormattingRules()' }],
  variants: [
    { id: 'numbers', label: { 'en-US': 'Numeric threshold', 'zh-CN': '数值阈值' } },
    { id: 'text', label: { 'en-US': 'Text contains', 'zh-CN': '文本包含' } },
    { id: 'duplicates', label: { 'en-US': 'Duplicate labels', 'zh-CN': '重复标签' } },
    { id: 'formula', label: { 'en-US': 'Relative formula', 'zh-CN': '相对公式' } },
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
