import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Flint / Delivery Control Room', 'zh-CN': 'Flint / 交付控制室' },
  description: {
    'en-US':
      'Relational Table statuses and effort drive nine native Canvas formulas: conditional totals, blockers, completion and independent workstreams.',
    'zh-CN': 'Relational Table 状态与工时驱动九个原生 Canvas 公式：条件汇总、阻塞数量、完成率和独立工作流。',
  },
  tags: {
    'en-US': ['Formula', 'Relational Tables', 'Canvases', 'Float', 'Embed'],
    'zh-CN': ['公式', 'Relational Tables', 'Canvases', '浮动嵌入', '嵌入'],
  },
  packages: [
    '@univerjs-pro/bases',
    '@univerjs-pro/boards',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/shape-editor',
    '@univerjs-pro/embed',
  ],
  apis: [
    'FBaseTableRecord.setValue()',
    'FBase.setName()',
    'FBase.save()',
    'FBaseTable.setName()',
    'FBaseTable.getFormulaName()',
    'FBaseTableView.setFilter()',
    'FBaseTableView.getProjection()',
    'FBoard.getShape()',
    'FShape.setFormula()',
    'FShape.getFormulaResult()',
    'FShape.setFormulaAnimationEnabled()',
    'FBoard.save()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'A fictional visitor-centre installation distinguishes open effort from retained estimates. Five structured records drive nine native results and three connected workstream cards; no JavaScript totals.',
      'zh-CN':
        '虚构访客中心项目区分未完成工时与保留估算，五条结构化记录驱动九个原生结果及三个连接的工作流卡片，不用 JavaScript 计算总数。',
    },
    tryIt: {
      'en-US': [
        'Read the Relational Table and the three dependent workstreams.',
        'Run all thirteen literal README examples in order.',
        'Compare Done, unblocked, blank and zero estimates.',
        'Compare view filtering with whole-table formulas, then restore both native snapshots.',
      ],
      'zh-CN': [
        '查看 Relational Table 和三个依赖工作流。',
        '按顺序运行 README 十三段原样代码。',
        '比较完成、解除阻塞、空白和零值估算。',
        '比较视图筛选与整表公式，再恢复两份原生快照。',
      ],
    },
    expected: {
      'en-US':
        'Initial 25 h open, 3 items, 2 blockers and 40% done. Completing the 8 h item leaves 17 h open and 60% done, while recorded estimates remain 35 h. Thirteen literal examples, selected native editing/history and two-snapshot recovery have evidence; full acceptance remains open. See README.',
      'zh-CN':
        '初始未完成 25 小时、3 条事项、2 条阻塞、完成率 40%。完成 8 小时事项后剩余 17 小时、完成率 60%，保留估算仍为 35 小时。十三段原样示例、部分原生编辑／历史和双快照恢复已有验证，完整验收仍待完成，详见 README。',
    },
  },
  variants: [
    ['baseline', 'Open work / Retained estimates', '未完成工作 / 保留估算'],
    ['condition', 'Complete / Unblock / Re-estimate', '完成 / 解除阻塞 / 重新估算'],
    ['boundary', 'Blank / Zero / Recovery', '空白 / 零值 / 恢复'],
    ['isolation', 'Workstream / Metadata isolation', '工作流 / 元数据隔离'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['status', 'Change the decision status', '修改决策状态'],
    ['estimate', 'Revise a scoped estimate', '修改指定估算'],
    ['inspect', 'Inspect native formula bindings', '检查原生公式绑定'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Conditional live results', '实时条件结果'],
    ['empty', 'Open items with no estimated effort', '无估算工时的未完成事项'],
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
