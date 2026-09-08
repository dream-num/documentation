import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  image: '/assets/showcase/sheets-sort-values-and-columns.png',
  group: { 'en-US': 'Sort and filter', 'zh-CN': '排序与筛选' },
  title: { 'en-US': 'Sort Values and Columns', 'zh-CN': '数值与多列排序' },
  description: {
    'en-US': 'Compare numeric directions, secondary keys, tied rows and blank estimates without breaking row identity.',
    'zh-CN': '比较数值升降序、次级排序键、并列记录与空值，保持完整行关联。',
  },
  tags: { 'en-US': ['Sort', 'Multiple keys', 'Row integrity'], 'zh-CN': ['排序', '多排序键', '完整行'] },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/sheets-sort', '@univerjs/sheets-sort-ui'],
  apis: [{ name: 'FRange.sort()' }, { name: 'FRange.getValues()' }],
  guide: {
    overview: {
      'en-US':
        'Three native sheets isolate numeric direction, multiple keys and blank estimates while keeping every booking row together.',
      'zh-CN': '三张原生工作表分别展示数值升降序、多排序键和空估时值，保持每条预约记录的整行关联。',
    },
    tryIt: {
      'en-US': [
        'Select A5:E12 in the name box, then open Data > Sort > Custom Sort and choose Keep range sorting.',
        'Keep the header outside the selection. Sort Column C ascending, then compare descending.',
        'On Multiple keys, sort Column B ascending and Column C descending; inspect tied booking IDs.',
        'Compare Blank estimates and run the five README recipes, including an explicit third tie-breaker.',
      ],
      'zh-CN': [
        '在名称框选择 A5:E12，打开 Data > Sort > Custom Sort，并选择 Keep range sorting。',
        '保持表头位于排序区域之外，对比 C 列升序与降序。',
        '在 Multiple keys 中先按 B 列升序、再按 C 列降序，观察并列记录的 ID。',
        '比较 Blank estimates 并运行 README 的五段代码，包括显式的第三排序键。',
      ],
    },
    expected: {
      'en-US':
        'All five cells of a booking move together; row 4 remains a header. Equal keys retain current input order unless an extra key breaks the tie. Sorting is not filtering or formula recalculation.',
      'zh-CN':
        '每条预约的五个单元格一起移动，第 4 行保持为表头。同值记录保留当前输入顺序，额外排序键可打破并列。排序不等同于筛选或公式重算。',
    },
  },
  variants: [
    { id: 'single', label: { 'en-US': 'Numeric directions', 'zh-CN': '数值升降序' } },
    { id: 'multiple', label: { 'en-US': 'Secondary keys and ties', 'zh-CN': '次级键与并列值' } },
    { id: 'blank', label: { 'en-US': 'Blank estimates', 'zh-CN': '空估时值' } },
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
