import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  previewHeight: 850,
  category: 'features' as const,
  group: { 'en-US': 'Formatting', 'zh-CN': '格式' },
  title: { 'en-US': 'Cell Borders and Gridlines', 'zh-CN': '单元格边框与网格线' },
  description: {
    'en-US': 'Compare outside, all-cell, dashed and double borders independently of worksheet gridlines.',
    'zh-CN': '独立于工作表网格线，对比外框、全边框、虚线与双线。',
  },
  tags: { 'en-US': ['Borders', 'Gridlines'], 'zh-CN': ['边框', '网格线'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setBorder()' }, { name: 'FWorksheet.setHiddenGridlines()' }],
  variants: [
    { id: 'outside', label: { 'en-US': 'Medium outside border', 'zh-CN': '中等外边框' } },
    { id: 'all', label: { 'en-US': 'All-cell thin borders', 'zh-CN': '全单元格细边框' } },
    { id: 'horizontal', label: { 'en-US': 'Dashed horizontal separators', 'zh-CN': '虚线水平分隔' } },
    { id: 'double', label: { 'en-US': 'Double outline and total rule', 'zh-CN': '双线外框与合计线' } },
    { id: 'gridlines', label: { 'en-US': 'Gridlines on and off', 'zh-CN': '显示与隐藏网格线' } },
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
