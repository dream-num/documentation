import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1150,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Kestrel / Planning and Actuals Workspace', 'zh-CN': 'Kestrel / 计划与实际组合工作台' },
  description: {
    'en-US':
      'Base posted expenses and an independent Sheet plan drive a brief, three review slides, a variance Board and a native chart.',
    'zh-CN': 'Base 已入账支出与独立 Sheet 计划共同驱动简报、三页演示、差异 Boards 和原生图表。',
  },
  tags: {
    'en-US': ['Formula', 'Base', 'Sheets', 'Docs', 'Slides', 'Boards', 'Charts'],
    'zh-CN': ['公式', '多维表格', '电子表格', '文档', '演示', '画板', '图表'],
  },
  packages: [
    '@univerjs-pro/embed',
    '@univerjs-pro/bases',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/docs-formula',
    '@univerjs-pro/shape-editor',
    '@univerjs-pro/sheets-chart',
  ],
  apis: [
    'FRecord.setValue()',
    'FRange.setValue()',
    'FFormula.upsertExternalReference()',
    'FDocument.insertFormula()',
    'FShape.setFormula()',
    'FWorksheet.insertChart()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'An original community maker lab separates planned funding, posted expenses and draft proposals. Native outputs read both sources without rewriting authored content.',
      'zh-CN': '原创社区创客实验室案例区分计划、已入账支出与草稿提案。原生输出读取两个数据源，不重写既有正文与布局。',
    },
    tryIt: {
      'en-US': [
        'In Expenses, change Workshop mentors from 8,000 to 9,500.',
        'Compare Brief, Review deck and Variance map in the native table list.',
        'Open Plan & chart and increase Access B7 to 16,000.',
        'Post a draft, filter the Base view, then test zero and recovery with the literal examples.',
      ],
      'zh-CN': [
        '在 Expenses 中把 Workshop mentors 从 8,000 改为 9,500。',
        '用原生表列表比较 Brief、Review deck 和 Variance map。',
        '打开 Plan & chart，把 Access 的 B7 改为 16,000。',
        '将草稿设为已入账，筛选 Base 视图，再按原样代码测试零值与恢复。',
      ],
    },
    expected: {
      'en-US':
        'Plan 48,000 less posted actuals 45,500 gives 2,500 remaining. Actuals 47,000 leave 1,000; increasing the plan to 50,000 leaves 3,000. Acceptance and known limitations are recorded in README.',
      'zh-CN':
        '计划 48,000 减已入账实际额 45,500，剩余 2,500；实际额变为 47,000 后剩余 1,000；计划再增至 50,000 后剩余 3,000。验收与已知限制见 README。',
    },
  },
  variants: [
    ['sources', 'Plan / Actual / Both sources', '计划 / 实际 / 双来源'],
    ['status', 'Posted / Draft / Filtered view', '已入账 / 草稿 / 筛选视图'],
    ['boundary', 'Blank / Zero / Over plan / Recovery', '空值 / 零值 / 超计划 / 恢复'],
    ['identity', 'Display names / Stable source bindings', '显示名称 / 稳定来源绑定'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit native source records and cells', '编辑原生记录与单元格'],
    ['compare', 'Compare four native outputs', '比较四种原生输出'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Two-source calculation', '双来源计算'],
    ['error', 'Native error / Recovery', '原生错误 / 恢复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
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
