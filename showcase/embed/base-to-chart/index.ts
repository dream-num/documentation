import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1080,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Moss / Support Demand', 'zh-CN': 'Moss / 支持需求对比' },
  description: {
    'en-US':
      'Native Base records feed week/channel formulas and two real chart series. Change counts or comparison weeks without rebuilding the chart.',
    'zh-CN': '原生 Base 记录驱动按周和渠道汇总的公式及两组真实图表系列。修改数量或比较周，无需重建图表。',
  },
  tags: {
    'en-US': ['Formula', 'Base', 'Sheets', 'Charts', 'Native tabs', 'Print'],
    'zh-CN': ['公式', '多维表格', '电子表格', '图表', '原生标签页', '打印'],
  },
  packages: [
    '@univerjs-pro/embed',
    '@univerjs-pro/bases',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/sheets-chart',
    '@univerjs-pro/sheets-print',
  ],
  apis: [
    'FBaseTableRecord.setValue()',
    'FBaseTableView.setFilter()',
    'FRange.setValue()',
    'FFormula.upsertExternalReference()',
    'FWorksheet.insertChart()',
    'FChart.exportImage()',
    'FWorkbook.save()',
    'FBase.save()',
    'FUniver.executeCommand()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'A fictional support studio compares six weekly channel aggregates. A visible SUMIFS layer drives the chart; view filters do not redefine its whole-table source.',
      'zh-CN': '虚构支持团队比较六条按周汇总的渠道记录。可见 SUMIFS 计算层驱动图表；视图筛选不改变整个表的数据来源。',
    },
    tryIt: {
      'en-US': [
        'Open Demand register and change Week 35 Email from 18 to 22.',
        'Return to Demand comparison: Selected becomes 40; Comparison stays 30.',
        'Edit the amber week labels to compare another period.',
        'Try filtering, hidden-record edits, blank/zero, source identity, image export and Print with the literal examples.',
      ],
      'zh-CN': [
        '打开 Demand register，把 Week 35 的 Email 从 18 改为 22。',
        '返回 Demand comparison：Selected 变为 40，Comparison 仍为 30。',
        '编辑琥珀色周标签以切换比较区间。',
        '按原样示例体验筛选、隐藏记录编辑、空值/零值、来源标识、图片导出和打印。',
      ],
    },
    expected: {
      'en-US':
        '18 + 12 + 6 = 36 selected requests, versus 14 + 10 + 6 = 30. Editing only the first selected count gives 40 and an independently unchanged comparison series. See README for tested scope.',
      'zh-CN':
        '选定周 18 + 12 + 6 = 36，对比周 14 + 10 + 6 = 30。只修改选定周第一项后合计为 40，对比系列不变。验收范围见 README。',
    },
  },
  variants: [
    ['source', 'Selected / Comparison / Week criteria', '选定周 / 对比周 / 周条件'],
    ['filter', 'Whole table / Filtered view / Hidden edit', '全表 / 筛选视图 / 隐藏记录修改'],
    ['boundary', 'Blank / Zero / Unmatched week / Recovery', '空值 / 零值 / 无匹配周 / 恢复'],
    ['identity', 'Rename / Missing binding / Repair', '重命名 / 缺失绑定 / 修复'],
    ['reconstruction', 'Save both units / Reconstruct / Continue editing', '保存双单元 / 重建 / 继续编辑'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit native records and week cells', '编辑原生记录与周单元格'],
    ['export', 'Export the native chart image', '导出原生图表图片'],
    ['print', 'Preview the calculated Sheet', '预览计算表打印效果'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Live source-linked chart', '实时来源关联图表'],
    ['empty', 'Zero / Unmatched period', '零值 / 无匹配区间'],
    ['error', 'Native error / Repair', '原生错误 / 修复'],
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
