import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Tide / Channel Comparison', 'zh-CN': 'Tide / 渠道对比' },
  description: {
    'en-US':
      'External Sheet inputs feed a visible formula range and a native two-series column chart. Change the source and compare the plotted result.',
    'zh-CN': '外部 Sheet 输入驱动可见公式区域和原生双系列柱状图，修改来源并比较真实图形。',
  },
  tags: {
    'en-US': ['Formula', 'Charts', 'Sheets', 'Float', 'Embed'],
    'zh-CN': ['公式', '图表', '表格', '浮动嵌入', '嵌入'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
    '@univerjs/preset-sheets-advanced',
    '@univerjs-pro/sheets-chart',
    '@univerjs-pro/chart-ui',
  ],
  apis: [
    'FFormula.upsertExternalReference()',
    'FWorksheet.newChart()',
    'FWorksheet.insertChart()',
    'FRange.setValue()',
    'FChart.getInfo()',
    'FChart.exportImage()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'A fictional community programme compares confirmed RSVPs with a planning baseline across Community, Partners and Newsletter. Independent workbook IDs are connected by external references; the native chart reads the calculated host range, not a JavaScript data array.',
      'zh-CN':
        '虚构社区活动按 Community、Partners、Newsletter 比较确认报名与计划。独立工作簿通过外部引用关联，原生图表读取宿主计算区域，不读取 JavaScript 拼接数据。',
    },
    tryIt: {
      'en-US': [
        'Inspect host A4:D7; the inactive source Float currently has a blank-preview defect.',
        'Run the seven literal README examples in order.',
        'Change Actual and Plan independently; compare the teal and gold bars.',
        'Compare zero values, native source interaction and chart PNG export.',
      ],
      'zh-CN': [
        '检查宿主 A4:D7；来源 Float 的非激活预览目前存在空白缺陷。',
        '按顺序运行 README 的七段原样代码。',
        '分别修改 Actual 与 Plan，比较青色和金色柱形。',
        '比较零值、原生来源交互与图表 PNG 导出。',
      ],
    },
    expected: {
      'en-US':
        'Initial Actual 120/180/90 totals 390, while Plan 140/160/100 totals 400. Changing source B6 to 210 gives Actual 420 with Plan unchanged. All seven code examples, native bar rendering and PNG export pass selected checks; source Float preview and keyboard ownership fail. See README.',
      'zh-CN':
        '初始 Actual 为 120/180/90，合计 390；Plan 为 140/160/100，合计 400。来源 B6 改为 210 后 Actual 合计 420，Plan 不变。七段代码、原生柱形渲染与 PNG 导出通过专项检查；来源 Float 预览与键盘归属未通过，详见 README。',
    },
  },
  variants: [
    ['baseline', 'External values / Native chart', '外部数值 / 原生图表'],
    ['series', 'Actual / Plan isolation', '实际 / 计划独立变化'],
    ['zero', 'Zero / All-zero / Recovery', '单项零值 / 全零 / 恢复'],
    ['export', 'Native chart PNG / Source parity', '原生图表 PNG / 源码一致性'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['actual', 'Change actual confirmations', '修改实际确认数'],
    ['plan', 'Revise the planning baseline', '修改计划基线'],
    ['inspect', 'Inspect bindings and export the chart', '检查绑定并导出图表'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Calculated range / Plotted series', '计算区域 / 图表系列'],
    ['zero', 'Zero columns / Native share errors', '零值柱形 / 原生占比错误'],
    ['failure', 'Source failure / Reload', '来源失败 / 刷新'],
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
