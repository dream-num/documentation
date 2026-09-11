import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Delta / Resource Allocation Map', 'zh-CN': 'Delta / 资源分配图' },
  description: {
    'en-US': 'A floating native Board reveals local team overload hidden by a positive Sheet capacity total.',
    'zh-CN': '浮动原生 Board 揭示 Sheet 总容量盈余掩盖的局部团队超载。',
  },
  tags: {
    'en-US': ['Formula', 'Sheets', 'Boards', 'Native float', 'Print'],
    'zh-CN': ['公式', '表格', '画板', '原生浮动', '打印'],
  },
  packages: [
    '@univerjs/sheets',
    '@univerjs-pro/boards',
    '@univerjs-pro/shape-editor',
    '@univerjs-pro/embed',
    '@univerjs-pro/sheets-print',
  ],
  apis: [
    'FRange.setValue()',
    'FRange.setValues()',
    'FBoard.getShape()',
    'FShape.setFormula()',
    'FShape.getFormulaResult()',
    'FFormula.upsertExternalReference()',
    'FUniver.executeCommand()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Three studio teams have different capacity pools. Totals, team buffers, peak utilization and a native IF prompt explain why one positive total cannot approve more scope.',
      'zh-CN': '三个工作室团队各有容量池。总量、团队余量、最高利用率与原生 IF 提示说明总量为正并不代表可以继续加任务。',
    },
    tryIt: {
      'en-US': [
        'Edit the six highlighted Sheet inputs.',
        'Double-click the Board; compare total and local buffers.',
        'Use the native fullscreen control, then return to the same edited Sheet.',
        'Try blank/zero/text, source rename, missing-source recovery and native Sheet Print.',
      ],
      'zh-CN': [
        '编辑六个高亮 Sheet 输入。',
        '双击 Board，比较总余量与团队余量。',
        '使用原生全屏，再返回同一个已编辑 Sheet。',
        '尝试空值/零值/文本、改名、来源缺失恢复与 Sheet 打印。',
      ],
    },
    expected: {
      'en-US':
        '480 available − 425 assigned = 55 total buffer, yet Build has 210 assigned against 200 available. Quality 130 makes total assignment 450 and buffer 30 without fixing Build.',
      'zh-CN':
        '480 可用 − 425 已分配 = 55 总余量，但 Build 的 210 分配超过 200 容量。Quality 改为 130 后总分配 450、余量 30，Build 超载并未消失。',
    },
  },
  variants: [
    ['local', 'Total versus local overload', '总体与局部超载'],
    ['errors', 'Blank / Zero / Text / Missing source', '空值 / 零值 / 文本 / 来源缺失'],
    ['embed', 'Native Float and fullscreen', '原生浮动与全屏'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit capacity and allocation', '修改容量与分配'],
    ['inspect', 'Inspect native Formula Shapes', '检查原生公式图形'],
    ['print', 'Preview Sheet Print', '预览表格打印'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['baseline', 'Positive total / Local overload', '总体盈余 / 局部超载'],
    ['balanced', 'No local overload', '无局部超载'],
    ['error', 'Native errors and repair', '原生错误与恢复'],
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
