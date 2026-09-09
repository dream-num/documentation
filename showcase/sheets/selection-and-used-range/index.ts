import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  previewHeight: 850,
  category: 'features' as const,
  group: { 'en-US': 'Ranges', 'zh-CN': '范围' },
  title: { 'en-US': 'Selection and Used Range', 'zh-CN': '选区与已用范围' },
  description: {
    'en-US':
      'Inspect active selections, stored-cell boundaries and the difference between values, display text and formulas.',
    'zh-CN': '检查活动选区、已存储单元格边界，以及数值、显示文本与公式的区别。',
  },
  tags: { 'en-US': ['Selection', 'Data range'], 'zh-CN': ['选区', '数据范围'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FWorksheet.getSelection()' },
    { name: 'FWorksheet.getDataRange()' },
    { name: 'FRange.getValues()' },
    { name: 'FRange.getFormulas()' },
  ],
  variants: [
    { id: 'selection', label: { 'en-US': 'Active selection and range list', 'zh-CN': '活动选区与范围列表' } },
    { id: 'styled', label: { 'en-US': 'Format-only boundary', 'zh-CN': '仅格式单元格边界' } },
    { id: 'empty', label: { 'en-US': 'Empty worksheet', 'zh-CN': '空工作表' } },
    { id: 'read', label: { 'en-US': 'Values, display text and formulas', 'zh-CN': '数值、显示文本与公式' } },
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
