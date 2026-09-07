import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Willow / Capacity Map', 'zh-CN': 'Willow / 容量规划图' },
  description: {
    'en-US':
      'A native floating Sheet drives eight Board Formula Shapes: shared capacity, team headroom, utilization and a planning signal.',
    'zh-CN': '原生浮动 Sheet 驱动八个白板公式图形：总容量、各团队余量、利用率与规划提示。',
  },
  tags: {
    'en-US': ['Formula', 'Boards', 'Sheets', 'Float', 'Capacity', 'Embed'],
    'zh-CN': ['公式', '白板', '表格', '浮动嵌入', '容量规划', '嵌入'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs-pro/boards',
    '@univerjs-pro/boards-ui',
    '@univerjs-pro/shape-editor',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FShape.setFormula()',
    'FShape.getFormulaResult()',
    'FShape.setFormulaAnimationEnabled()',
    'FRange.setValue()',
    'FRange.setValues()',
    'FBoard.save()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'An original exhibition studio plans one week across Editorial, Production and Access. One Sheet feeds four overview cards, three team cards and a native formula-driven scope signal. Bound connectors make the shared source explicit; no JavaScript totals or refresh toolbar.',
      'zh-CN':
        '原创展览工作室按 Editorial、Production、Access 三个团队规划一周。一个 Sheet 驱动四张总览卡、三张团队卡与一个原生公式提示。绑定连线明确共同来源，不用 JavaScript 拼接统计或刷新面板。',
    },
    tryIt: {
      'en-US': [
        'Read the total and team headroom together.',
        'Double-click the Sheet and expand it for native editing.',
        'Run the nine literal README snippets in order.',
        'Compare local overload, total overload, zero capacity and recovery.',
      ],
      'zh-CN': [
        '同时阅读总余量与团队余量。',
        '双击 Sheet，再展开进行原生编辑。',
        '按顺序运行 README 的九段原样代码。',
        '比较局部超载、整体超载、零容量与恢复。',
      ],
    },
    expected: {
      'en-US':
        'Baseline: 320 available, 276 planned, 44 remaining and 86.25% utilization. Production planned hours of 128 leave local headroom -16 while the total still has 20. Nine examples, native editing and Print preview have selected evidence; full acceptance remains open.',
      'zh-CN':
        '初始可用 320、已排 276、剩余 44、利用率 86.25%。Production 已排改为 128 后，其余量为 -16，而总余量仍有 20。九段示例、原生编辑和打印预览有选定证据，尚未完整验收。',
    },
  },
  variants: [
    ['baseline', 'One source / Eight native results', '一个来源 / 八个原生结果'],
    ['local-overload', 'Total headroom / Local overload', '总量有余 / 局部超载'],
    ['total-overload', 'Rebalance the overall scope', '整体超载 / 调整范围'],
    ['error', 'Zero capacity / Native error / Recovery', '零容量 / 原生错误 / 恢复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['source', 'Revise the native capacity Sheet', '修改原生容量 Sheet'],
    ['compare', 'Compare shared and team results', '比较总量与团队结果'],
    ['inspect', 'Inspect formulas and native snapshots', '检查公式与原生快照'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['within', 'Within capacity / Inspect each team', '总量充足 / 仍需检查团队'],
    ['overload', 'Negative headroom / Rebalance scope', '余量为负 / 调整范围'],
    ['error', 'Native division error / Restore inputs', '原生除法错误 / 恢复输入'],
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
