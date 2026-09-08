import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 900,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Logical Decisions and Error Handling', 'zh-CN': '逻辑决策与错误处理' },
  description: {
    'en-US':
      'Combine shipment conditions and compare first-match policies, exact code routing, missing scores and selective error recovery.',
    'zh-CN': '组合发货条件，比较首次匹配规则、精确代码分流、缺失评分与选择性错误恢复。',
  },
  tags: {
    'en-US': ['IF', 'IFS', 'SWITCH', 'AND', 'OR', 'NOT', 'XOR', 'IFNA', 'IFERROR'],
    'zh-CN': ['IF', 'IFS', 'SWITCH', 'AND', 'OR', 'NOT', 'XOR', 'IFNA', 'IFERROR'],
  },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue() / setFormula() / getFormula()' }],
  variants: [
    { id: 'conditions', label: { 'en-US': 'Combined and exclusive conditions', 'zh-CN': '组合与互斥条件' } },
    { id: 'policy', label: { 'en-US': 'Ordered thresholds and exact routes', 'zh-CN': '有序阈值与精确分流' } },
    { id: 'empty', label: { 'en-US': 'Unassessed versus zero score', 'zh-CN': '未评分与零分' } },
    { id: 'recovery', label: { 'en-US': 'Unmatched policy versus malformed input', 'zh-CN': '未匹配规则与异常输入' } },
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
