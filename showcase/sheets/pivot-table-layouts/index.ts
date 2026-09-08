import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 900,
  group: { 'en-US': 'Data analysis', 'zh-CN': '数据分析' },
  title: { 'en-US': 'Pivot Table Layouts', 'zh-CN': '透视表布局' },
  description: {
    'en-US':
      'Configure a native pivot with two row dimensions and channel columns; compare compact and tabular layouts, sums and counts.',
    'zh-CN': '配置两级行维度与渠道列的原生透视表，比较紧凑和表格布局、求和与计数。',
  },
  tags: {
    'en-US': ['Pivot table', 'Sum', 'Count', 'Compact', 'Tabular'],
    'zh-CN': ['透视表', '求和', '计数', '紧凑', '表格'],
  },
  packages: [
    '@univerjs/preset-sheets-core',
    '@univerjs-pro/sheets-pivot',
    '@univerjs-pro/sheets-pivot-ui',
    '@univerjs-pro/license',
  ],
  apis: [
    { name: 'FWorkbook.addPivotTable()' },
    { name: 'FPivotTable.addField() / setSubtotalType() / setLayout() / updateSourceRange()' },
  ],
  variants: [
    { id: 'sum', label: { 'en-US': 'Compact sales totals', 'zh-CN': '紧凑销售汇总' } },
    { id: 'count', label: { 'en-US': 'Tabular transaction counts', 'zh-CN': '表格事务计数' } },
    { id: 'refresh', label: { 'en-US': 'Editable source and source refresh', 'zh-CN': '可编辑源与源刷新' } },
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
