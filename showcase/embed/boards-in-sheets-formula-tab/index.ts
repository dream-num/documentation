import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1120,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Juniper / Sensitivity Workshop', 'zh-CN': 'Juniper / 敏感性工作坊' },
  description: {
    'en-US': 'A native Board tab compares three volume scenarios driven by shared Sheet assumptions.',
    'zh-CN': '原生 Board 标签页比较由共享 Sheet 假设驱动的三种数量情景。',
  },
  tags: {
    'en-US': ['Formula', 'Sheets', 'Boards', 'Native tab', 'Print'],
    'zh-CN': ['公式', '表格', '白板', '原生标签页', '打印'],
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
        'A making studio discusses unit contribution, volume and fixed cost. The Sheet owns six inputs; the Board compares scenarios without replacing authored notes.',
      'zh-CN': '制作工作室讨论单件贡献、数量和固定成本。Sheet 拥有六个输入，Board 比较情景而不替换手写说明。',
    },
    tryIt: {
      'en-US': [
        'Switch between Assumptions and Sensitivity workshop.',
        'Change shared contribution or fixed cost, then change just one scenario multiplier.',
        'Compare zero, blank and invalid text; repair a missing source.',
        'Edit a Board note separately and preview source Sheet Print.',
      ],
      'zh-CN': [
        '切换 Assumptions 与 Sensitivity workshop。',
        '修改共享贡献或固定成本，再只修改一个情景系数。',
        '比较零值、空值和无效文本，修复来源缺失。',
        '独立编辑 Board 说明并预览源 Sheet 打印。',
      ],
    },
    expected: {
      'en-US':
        '150 reference units at 18 contribution give base contribution 2700 and 900 after fixed cost. Changing contribution to 20 gives 3000 and 1200; scenario quantities do not change.',
      'zh-CN':
        '150 基准数量 × 18 单件贡献得到 2700，扣除固定成本剩 900。贡献改为 20 后变为 3000 和 1200；情景数量不变。',
    },
  },
  variants: [
    ['shared', 'Shared assumptions', '共享假设'],
    ['scenario', 'Independent scenario multipliers', '独立情景系数'],
    ['errors', 'Blank / Zero / Invalid / Missing source', '空值 / 零值 / 无效 / 来源缺失'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit source assumptions', '编辑来源假设'],
    ['compare', 'Compare native Board scenarios', '比较原生白板情景'],
    ['print', 'Preview source Sheet Print', '预览来源表格打印'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['baseline', 'Three positive after-cost scenarios', '三个情景扣除成本后为正'],
    ['downside', 'Downside below fixed cost', '下行情景不覆盖固定成本'],
    ['error', 'Native errors and repair', '原生错误与修复'],
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
