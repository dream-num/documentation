import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 900,
  group: { 'en-US': 'Formatting', 'zh-CN': '格式' },
  title: { 'en-US': 'Conditional Formatting Priority', 'zh-CN': '条件格式优先级' },
  description: {
    'en-US':
      'Compare overlapping fills, independent style properties and stop-if-true using ordered native conditional rules.',
    'zh-CN': '通过原生条件规则顺序，对比重叠填色、独立样式合并与条件为真时停止。',
  },
  tags: {
    'en-US': ['Conditional formatting', 'Priority', 'Stop if true', 'Style merge'],
    'zh-CN': ['条件格式', '优先级', '条件为真时停止', '样式合并'],
  },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/preset-sheets-conditional-formatting'],
  apis: [
    { name: 'FWorksheet.newConditionalFormattingRule()' },
    { name: 'FWorksheet.moveConditionalFormattingRule()' },
    { name: 'FWorksheet.setConditionalFormattingRule()' },
  ],
  variants: [
    { id: 'priority', label: { 'en-US': 'Competing backgrounds', 'zh-CN': '竞争背景色' } },
    { id: 'merge', label: { 'en-US': 'Independent style merge', 'zh-CN': '独立样式合并' } },
    { id: 'stop', label: { 'en-US': 'Stop-if-true boundary', 'zh-CN': '停止规则边界' } },
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
