import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-merge-cells.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Cell layout', 'zh-CN': '单元格布局' },
  title: { 'en-US': 'Merge Cells', 'zh-CN': '合并单元格' },
  description: {
    'en-US': 'Horizontal, row-by-row, vertical and rectangular merged-cell layouts, with a native practice sheet.',
    'zh-CN': '横向、逐行、纵向和矩形合并版式，以及可直接操作的原生练习表。',
  },
  tags: { 'en-US': ['Merge', 'Layout', 'Facade'], 'zh-CN': ['合并', '版式', 'Facade'] },
  packages: ['@univerjs/core', '@univerjs/presets', '@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.merge / mergeAcross / mergeVertically / breakApart / isMerged' }],
  variants: [
    { id: 'horizontal', label: { 'en-US': 'Horizontal title', 'zh-CN': '横向标题' } },
    { id: 'across', label: { 'en-US': 'One merge per row', 'zh-CN': '逐行独立合并' } },
    { id: 'vertical', label: { 'en-US': 'One merge per column', 'zh-CN': '逐列独立合并' } },
    { id: 'rectangle', label: { 'en-US': 'Rectangular block', 'zh-CN': '矩形块' } },
  ],
  actions: [],
  states: [
    { id: 'merged', label: { 'en-US': 'Merged', 'zh-CN': '已合并' } },
    { id: 'unmerged', label: { 'en-US': 'Unmerged', 'zh-CN': '已取消合并' } },
  ],
  guide: {
    overview: {
      'en-US':
        'Small exhibition layouts compare four merge shapes. All cells and controls are native SDK UI; no duplicate toolbar.',
      'zh-CN': '以小型展览版式对照四种合并形态，全部使用原生单元格与菜单，没有重复工具栏。',
    },
    tryIt: {
      'en-US': [
        'Compare the four colored groups on Layout gallery.',
        'Open Try it, select B3:D4 and use the native merge dropdown.',
        'Edit the merged label, unmerge, and compare Undo/Redo. Use README for the matching Facade calls.',
      ],
      'zh-CN': [
        '观察版式对照中的四组配色区域。',
        '打开动手试试，选择 B3:D4 并操作原生合并下拉菜单。',
        '编辑合并后的标签，取消合并并对照撤销/重做；README 提供对应 Facade 调用。',
      ],
    },
    expected: {
      'en-US':
        'Merge changes geometry, not a substitute for concatenating values. Only upper-left values are retained; unmerge does not reconstruct discarded values. Theme changes retain the owner and edits.',
      'zh-CN': '合并改变几何结构，不是拼接内容。只保留左上角值，取消合并不会重建被丢弃的值；切换主题保留实例与编辑。',
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
