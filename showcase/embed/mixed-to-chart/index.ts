import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Prism / Plan versus Actual', 'zh-CN': 'Prism / 目标与实际' },
  description: {
    'en-US':
      'Native Sheet targets and Relational Table income feed a visible reconciliation range and two real chart series.',
    'zh-CN': '原生 Sheet 目标与 Relational Table 收入共同驱动可见对账区及两组真实图表系列。',
  },
  tags: {
    'en-US': ['Formula', 'Sheets', 'Relational Table', 'Charts', 'Native tab', 'Print'],
    'zh-CN': ['公式', '表格', 'Relational Tables', '图表', '原生标签页', '打印'],
  },
  packages: [
    '@univerjs/sheets',
    '@univerjs-pro/bases',
    '@univerjs-pro/embed',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/sheets-chart',
    '@univerjs-pro/sheets-print',
  ],
  apis: [
    'FRange.setValue()',
    'FBaseTableRecord.setValue()',
    'FBaseTableView.setFilter()',
    'FFormula.upsertExternalReference()',
    'FWorksheet.insertChart()',
    'FChart.exportImage()',
    'FUniver.executeCommand()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Three native tabs separate targets, actual records and reconciliation. Actuals honor explicit period/status criteria; target edits do not mutate the Relational Table. This is an in-workbook target Sheet plus a separate Relational Table, not Sheet@Sheet embedding.',
      'zh-CN':
        '三个原生标签页分开目标、实际记录和对账。实际值遵循明确的期间/状态条件；目标修改不会写入 Relational Table。这里是工作簿内目标 Sheet 加独立 Relational Table，不是 Sheet@Sheet 嵌入。',
    },
    tryIt: {
      'en-US': [
        'Run the twenty-five literal snippets in order.',
        'Compare income edits, target edits and confirming a draft.',
        'Filter the Relational Table, edit hidden records and change reporting criteria.',
        'Inspect zero/invalid targets, missing source, native Print and PNG export.',
      ],
      'zh-CN': [
        '按顺序运行二十五段原样代码。',
        '比较收入修改、目标修改和草稿确认。',
        '筛选 Relational Table、修改隐藏记录并切换统计条件。',
        '检查零值/无效目标、来源缺失、原生打印和 PNG 导出。',
      ],
    },
    expected: {
      'en-US':
        'Baseline: actual $54,500 against target $60,000; gap $5,500. New membership income $12,500 makes actual $58,000 and gap $2,000. The native chart must repaint without reconstruction.',
      'zh-CN':
        '初始实际 $54,500、目标 $60,000、缺口 $5,500。新会员收入改为 $12,500 后，实际为 $58,000、缺口 $2,000。原生图表应直接重绘，无需重建。',
    },
  },
  variants: [
    ['sources', 'Independent targets / Actuals', '独立目标 / 实际'],
    ['criteria', 'Period and status criteria', '期间与状态条件'],
    ['projection', 'Filtered view / Hidden inputs', '筛选视图 / 隐藏输入'],
    ['errors', 'Zero and invalid inputs / Source repair', '零值与无效输入 / 来源修复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit native source tabs', '编辑原生来源标签页'],
    ['compare', 'Read the visible formula-backed chart', '查看可见公式驱动的图表'],
    ['export', 'Native Print and chart PNG', '原生打印与图表 PNG'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['below', 'Below target', '未达目标'],
    ['ahead', 'Above target', '超过目标'],
    ['empty', 'No matching records', '无匹配记录'],
    ['error', 'Native formula errors', '原生公式错误'],
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
