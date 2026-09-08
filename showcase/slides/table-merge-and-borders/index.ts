import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'slides' as const,
  category: 'features' as const,
  previewHeight: 950,
  group: { 'en-US': 'Tables', 'zh-CN': '表格' },
  title: { 'en-US': 'Table Merge and Borders', 'zh-CN': '表格合并与边框' },
  description: {
    'en-US':
      'Compare native horizontal and vertical cell merges, splitting, and outer, full, dashed and dotted table borders.',
    'zh-CN': '对比原生横向与纵向单元格合并、拆分，以及外框、全边框、虚线和点线。',
  },
  tags: { 'en-US': ['Tables', 'Merge', 'Borders'], 'zh-CN': ['表格', '合并', '边框'] },
  packages: [
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/slides-table',
    '@univerjs-pro/slides-table-ui',
  ],
  apis: [
    { name: 'FSlideTable.mergeCells()' },
    { name: 'FSlideTable.unmergeCell()' },
    { name: 'FSlideTable.setBorder()' },
    { name: 'FSlideTable.setTableBorder()' },
  ],
  variants: [
    { id: 'horizontal', label: { 'en-US': 'Horizontal merge', 'zh-CN': '横向合并' } },
    { id: 'vertical', label: { 'en-US': 'Vertical merge', 'zh-CN': '纵向合并' } },
    { id: 'split', label: { 'en-US': 'Merged, then split', 'zh-CN': '合并后拆分' } },
    { id: 'outer', label: { 'en-US': 'Thick outer border', 'zh-CN': '加粗外边框' } },
    { id: 'all', label: { 'en-US': 'All borders', 'zh-CN': '全边框' } },
    { id: 'horizontal-dash', label: { 'en-US': 'Dashed row separators', 'zh-CN': '虚线行分隔' } },
    { id: 'dot', label: { 'en-US': 'Dotted borders', 'zh-CN': '点线边框' } },
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
