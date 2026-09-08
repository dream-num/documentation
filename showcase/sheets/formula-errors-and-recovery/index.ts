import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Formula Errors and Recovery', 'zh-CN': '公式错误与恢复' },
  description: {
    'en-US': 'Six real calculation errors, selective IFNA recovery and dependent recalculation after source edits.',
    'zh-CN': '六种真实计算错误、IFNA 选择性恢复，以及源数据修改后的依赖重算。',
  },
  tags: { 'en-US': ['Formula errors', 'IFERROR', 'IFNA'], 'zh-CN': ['公式错误', 'IFERROR', 'IFNA'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue()' }, { name: 'FRange.getValue()' }, { name: 'FRange.getFormula()' }],
  variants: [
    { id: 'errors', label: { 'en-US': 'Six formula errors', 'zh-CN': '六种公式错误' } },
    { id: 'recovery', label: { 'en-US': 'IFERROR versus IFNA', 'zh-CN': 'IFERROR 与 IFNA' } },
    { id: 'propagation', label: { 'en-US': 'Dependent results', 'zh-CN': '依赖计算结果' } },
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
