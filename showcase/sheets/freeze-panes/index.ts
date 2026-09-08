import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-freeze-panes.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Worksheet navigation', 'zh-CN': '工作表导航' },
  title: { 'en-US': 'Freeze Rows and Columns', 'zh-CN': '冻结行与列' },
  description: {
    'en-US': 'Compare fixed headers, fixed identity columns and a frozen corner using three native worksheet tabs.',
    'zh-CN': '用三个原生工作表对照冻结标题行、标识列和交叉窗格。',
  },
  tags: { 'en-US': ['Freeze panes', 'Scrolling', 'Facade'], 'zh-CN': ['冻结窗格', '滚动', 'Facade'] },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FWorksheet.setFrozenRows()' },
    { name: 'FWorksheet.setFrozenColumns()' },
    { name: 'FWorksheet.setFreeze()' },
    { name: 'FWorksheet.getFreeze()' },
    { name: 'FWorksheet.cancelFreeze()' },
  ],
  variants: [
    { id: 'rows', label: { 'en-US': 'Header rows', 'zh-CN': '标题行' } },
    { id: 'columns', label: { 'en-US': 'Identity columns', 'zh-CN': '标识列' } },
    { id: 'both', label: { 'en-US': 'Rows and columns', 'zh-CN': '行列交叉' } },
  ],
  actions: [],
  states: [
    { id: 'frozen', label: { 'en-US': 'Frozen', 'zh-CN': '已冻结' } },
    { id: 'unfrozen', label: { 'en-US': 'Unfrozen through View', 'zh-CN': '通过视图菜单取消冻结' } },
  ],
  guide: {
    overview: {
      'en-US':
        'Synthetic monthly rainfall keeps labels in view while scrolling. Each tab demonstrates a different freeze axis, not a separate data-management operation.',
      'zh-CN': '模拟月降雨量数据用于演示滚动时保留标签。每个标签页展示不同冻结方向，不重复数据增删改操作。',
    },
    tryIt: {
      'en-US': [
        'Scroll vertically and horizontally on Rows and columns.',
        'Switch to Header rows and Identity columns to compare.',
        'Use the native View menu to unfreeze, then freeze the current selection.',
      ],
      'zh-CN': [
        '在行列同时冻结页双向滚动。',
        '切换冻结标题行和冻结标识列进行对照。',
        '通过原生视图菜单取消冻结，再按当前选择设置冻结。',
      ],
    },
    expected: {
      'en-US':
        'Frozen labels stay anchored while the remaining cells scroll. No custom toolbar duplicates native freeze controls.',
      'zh-CN': '冻结标签保持位置，其余单元格滚动；不提供重复原生冻结菜单的额外工具栏。',
    },
  },
}
export const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})
export default { metadata, files, Preview }
