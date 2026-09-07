import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1150,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Aurora / One Model, Four Outputs', 'zh-CN': 'Aurora / 一个模型，四种输出' },
  description: {
    'en-US':
      'One department budget drives a modern brief, a three-page review deck, a connected allocation map and a native chart.',
    'zh-CN': '同一份部门预算驱动现代简报、三页评审演示、关联分配图和原生图表。',
  },
  tags: {
    'en-US': ['Formula', 'Sheets', 'Docs', 'Slides', 'Boards', 'Charts', 'Native tabs'],
    'zh-CN': ['公式', '电子表格', '文档', '演示', '白板', '图表', '原生标签页'],
  },
  packages: [
    '@univerjs-pro/embed',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/docs-formula',
    '@univerjs-pro/slides',
    '@univerjs-pro/boards',
    '@univerjs-pro/sheets-chart',
  ],
  apis: [
    'FUniver.createEmbed()',
    'FFormula.upsertExternalReference()',
    'FDocument.insertFormula()',
    'FShape.setFormula()',
    'FWorksheet.insertChart()',
    'FRange.setValue()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'An original fictional community exhibition links four different outputs to one local Sheet. Each output keeps its own authored layout.',
      'zh-CN': '原创虚构社区展览让四种输出读取同一份本地 Sheet，同时保留各自的内容和布局。',
    },
    tryIt: {
      'en-US': [
        'Change Access B7 from 2,200 to 2,700.',
        'Visit Brief, Review deck and Allocation map using native tabs.',
        'Compare the chart, then change the ceiling independently.',
        'Try zero, blank, text and recovery using the literal README examples.',
      ],
      'zh-CN': [
        '把 Access 的 B7 从 2,200 改为 2,700。',
        '用原生标签页打开简报、评审演示和分配图。',
        '比较图表，再单独修改预算上限。',
        '按 README 原样代码体验零值、空值、文本和恢复。',
      ],
    },
    expected: {
      'en-US':
        'Baseline allocations 4,200 + 3,600 + 2,200 = 10,000. Access 2,700 changes the total to 10,500 across the outputs. Runtime acceptance is recorded in README.',
      'zh-CN':
        '初始分配 4,200 + 3,600 + 2,200 = 10,000；Access 改为 2,700 后，各处合计应为 10,500。运行验收详见 README。',
    },
  },
  variants: [
    ['source', 'Department / Ceiling / Unrelated context', '部门 / 上限 / 无关上下文'],
    ['outputs', 'Inline prose / Formula cards / Connected map / Chart', '行内正文 / 公式卡片 / 关联图 / 图表'],
    ['empty', 'Zero / Blank / Text / Recovery', '零值 / 空值 / 文本 / 恢复'],
    ['identity', 'Source display name / Stable binding', '来源显示名 / 稳定绑定'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit the native source Sheet', '编辑原生来源 Sheet'],
    ['compare', 'Compare four dependent outputs', '比较四种依赖输出'],
    ['recover', 'Restore the baseline inputs', '恢复初始输入'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Live dependent outputs', '实时依赖输出'],
    ['error', 'Native formula error / Source recovery', '原生公式错误 / 来源恢复'],
    ['load', 'Output loading failure / Reload', '输出加载失败 / 刷新'],
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
