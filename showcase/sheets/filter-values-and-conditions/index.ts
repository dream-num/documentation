import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-filter-values-and-conditions.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Analysis', 'zh-CN': '数据分析' },
  title: { 'en-US': 'Value and Condition Filters', 'zh-CN': '值与条件筛选' },
  description: {
    'en-US':
      'Six native filter variants compare value lists, numeric AND, text wildcards, blanks, combined columns and no matches across twelve original records.',
    'zh-CN': '六种原生筛选对照使用十二条原创记录，展示值列表、数值 AND、文本通配符、空白、多列组合和无匹配。',
  },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/preset-sheets-filter'],
  tags: { 'en-US': ['Filter', 'Values', 'Conditions', 'Blanks'], 'zh-CN': ['筛选', '值', '条件', '空白'] },
  apis: [
    { name: 'FRange.createFilter() / getFilter()' },
    { name: 'FFilter.setColumnFilterCriteria() / getColumnFilterCriteria()' },
    { name: 'FFilter.getFilteredOutRows() / removeColumnFilterCriteria() / removeFilterCriteria()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Each worksheet owns the same twelve initial records and a different real SDK filter. All editing uses the native grid and header popups. Runtime content is English, including on Chinese guide pages.',
      'zh-CN':
        '每张工作表独立保存相同的十二条初始记录及不同的真实 SDK 筛选。通过原生网格和表头弹窗操作。中文站点中的演示运行时也使用英文。',
    },
    tryIt: {
      'en-US': [
        'Open the Region filter on Value list and change the checked values.',
        'Compare Numeric AND with Text wildcard; kit* is a prefix pattern, not a literal value list.',
        'Blanks keeps R07 and R11, while numeric zeros R01 and R12 remain distinct.',
        'Clear the condition on No matches using the native filter popup to reveal all twelve records.',
      ],
      'zh-CN': [
        '打开 Value list 的 Region 筛选并修改勾选值。',
        '对比数值 AND 与文本通配符，kit* 表示前缀而非值列表。',
        '空白与数值零保持区别。',
        '在 No matches 中通过原生弹窗清除条件以显示十二条记录。',
      ],
    },
    expected: {
      'en-US':
        'Filters hide rows rather than deleting or sorting source records. Worksheets are independent copies, not synchronized views. Native popup and row-paint acceptance is recorded separately in README; no backend or collaboration is included.',
      'zh-CN':
        '筛选隐藏行，不删除或排序源记录。工作表为独立副本而非同步视图。原生弹窗及行绘制验收见 README，不包含后端或协同。',
    },
  },
  actions: [],
  states: [],
  variants: [
    {
      id: 'values',
      label: { 'en-US': 'Value list', 'zh-CN': '值列表' },
      description: { 'en-US': 'North or South retains seven records.', 'zh-CN': 'North 或 South 保留七条记录。' },
    },
    {
      id: 'band',
      label: { 'en-US': 'Numeric AND', 'zh-CN': '数值 AND' },
      description: {
        'en-US': 'Inclusive 10 through 40 retains five records.',
        'zh-CN': '包含边界的 10 至 40 保留五条记录。',
      },
    },
    {
      id: 'text',
      label: { 'en-US': 'Text wildcard', 'zh-CN': '文本通配符' },
      description: {
        'en-US': 'kit* matches eight records, including the literal star value.',
        'zh-CN': 'kit* 匹配八条记录，包括字面星号值。',
      },
    },
    {
      id: 'blank',
      label: { 'en-US': 'Blanks', 'zh-CN': '空白' },
      description: {
        'en-US': 'Two empty Units values remain distinct from numeric zeros.',
        'zh-CN': '两个空白 Units 值与数值零保持区别。',
      },
    },
    {
      id: 'combined',
      label: { 'en-US': 'Two columns', 'zh-CN': '多列组合' },
      description: {
        'en-US': 'North and Ready intersect to retain two records.',
        'zh-CN': 'North 与 Ready 交集保留两条记录。',
      },
    },
    {
      id: 'none',
      label: { 'en-US': 'No matches', 'zh-CN': '无匹配' },
      description: {
        'en-US': 'Units greater than 500 hides all twelve records without deleting them.',
        'zh-CN': 'Units 大于 500 隐藏全部十二条记录，但不删除数据。',
      },
    },
  ],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
  '/reference/preview-entry.ts.txt': './preview/index.ts',
})
export default { metadata, files, Preview }
