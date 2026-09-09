import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'bases' as const,
  category: 'features' as const,
  group: { 'en-US': 'Views', 'zh-CN': '视图' },
  previewHeight: 950,
  title: { 'en-US': 'Column Summaries', 'zh-CN': '列统计汇总' },
  description: {
    'en-US':
      'Compare native sum, average, bounds and completeness statistics with empty values, zero, negative adjustments and grouped records.',
    'zh-CN': '在空值、零、负数调整和分组记录中比较原生求和、平均、极值与完整性统计。',
  },
  tags: { 'en-US': ['Statistics', 'Summary bar', 'Empty values'], 'zh-CN': ['统计', '汇总栏', '空值'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBaseView.updateConfig()' },
    { name: 'FBaseView.getConfig()' },
    { name: 'FBaseTableRecord.setValue()' },
  ],
  variants: [
    { id: 'numeric', label: { 'en-US': 'Sum, average and bounds', 'zh-CN': '求和、平均与极值' } },
    {
      id: 'completeness',
      label: { 'en-US': 'Count, filled, empty and unique', 'zh-CN': '记录、非空、空值与去重计数' },
    },
    { id: 'grouped', label: { 'en-US': 'Grouped projection', 'zh-CN': '分组投影' } },
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
