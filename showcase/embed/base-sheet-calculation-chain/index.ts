import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1150,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Meridian / Follow the Calculation Chain', 'zh-CN': 'Meridian / 追踪跨产品计算链' },
  description: {
    'en-US':
      'Base quantities feed a visible Sheet model, then drive a brief, three slides, a connected Board and a native chart.',
    'zh-CN': 'Base 数量进入可见的 Sheet 模型，再驱动简报、三页演示、关联白板和原生图表。',
  },
  tags: {
    'en-US': ['Formula', 'Base', 'Sheets', 'Docs', 'Slides', 'Boards', 'Charts'],
    'zh-CN': ['公式', '多维表格', '电子表格', '文档', '演示', '白板', '图表'],
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
        'An original print-studio model separates structured records, editable assumptions and editorial outputs. Every intermediate calculation is visible in the Sheet.',
      'zh-CN': '原创印刷工作室案例区分结构化记录、可编辑假设和内容输出。每一级中间计算都在 Sheet 中可见。',
    },
    tryIt: {
      'en-US': [
        'In Edition register, change Fieldnotes quantity from 60 to 80.',
        'In Production model, inspect 120 copies and 3,000; change B4 from 25 to 30.',
        'Compare Brief, all three Review deck pages, Production map and the chart.',
        'Try an on-hold edition, blank quantity and zero rate using the literal examples.',
      ],
      'zh-CN': [
        '在 Edition register 中把 Fieldnotes 数量从 60 改为 80。',
        '在 Production model 中查看数量 120 和金额 3,000，再把 B4 从 25 改为 30。',
        '比较 Brief、Review deck 三页、Production map 和图表。',
        '按原样示例体验暂缓的记录、空数量和零单价。',
      ],
    },
    expected: {
      'en-US':
        '40 + 60 copies at 25 gives 2,500. Changing 60 to 80 gives 3,000; changing the rate to 30 gives 3,600. All narrative outputs reference Sheet cells, not Base directly. See README for acceptance status.',
      'zh-CN':
        '40 + 60 份、单价 25 得到 2,500；60 改为 80 后为 3,000；单价改为 30 后为 3,600。内容输出只引用 Sheet 单元格，不直接读取 Base。验收状态见 README。',
    },
  },
  variants: [
    ['chain', 'Record quantity / Sheet rate / Derived outputs', '记录数量 / Sheet 单价 / 派生输出'],
    ['inclusion', 'Scheduled / On hold / Unrelated context', '排期中 / 暂缓 / 无关上下文'],
    ['boundary', 'Blank quantity / Zero rate / Recovery', '空数量 / 零单价 / 恢复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit native records and assumptions', '编辑原生记录和假设'],
    ['trace', 'Follow the visible calculation chain', '追踪可见计算链'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Live two-hop calculation', '实时两级计算'],
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
