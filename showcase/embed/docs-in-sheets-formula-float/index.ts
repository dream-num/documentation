import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1140,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Saffron / Budget Explanation', 'zh-CN': 'Saffron / 预算说明' },
  description: {
    'en-US':
      'A native Doc Float inside its source Sheet explains funding, costs and reserve through twelve live inline formulas.',
    'zh-CN': '来源 Sheet 内的原生 Doc Float，用十二个实时内联公式解释收入、支出与储备。',
  },
  tags: {
    'en-US': ['Formula', 'Sheets', 'Modern Docs', 'Float', 'Print'],
    'zh-CN': ['公式', '表格', '现代文档', '浮动', '打印'],
  },
  packages: [
    '@univerjs/sheets',
    '@univerjs/docs',
    '@univerjs-pro/embed',
    '@univerjs-pro/docs-formula',
    '@univerjs-pro/docs-formula-ui',
    '@univerjs-pro/sheets-print',
  ],
  apis: [
    'FRange.setValue()',
    'FDocument.insertFormula()',
    'FDocument.getFormulas()',
    'FFormula.upsertExternalReference()',
    'FUniver.createEmbed()',
    'FUniver.executeCommand()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Saffron is an original community-kitchen budget. Sheet owns the inputs; its embedded modern document reads them. Doc@Sheet describes placement, while Sheet → Doc describes calculation. No write-back or manual refresh is implied.',
      'zh-CN':
        'Saffron 是原创社区厨房预算。输入属于 Sheet，嵌入其中的现代文档读取这些输入。Doc@Sheet 表示嵌入方向，Sheet → Doc 表示计算方向，不代表反向写入，也无需手动刷新。',
    },
    tryIt: {
      'en-US': [
        'Run the literal examples in order.',
        'Change ingredients, income, reserve and headcount independently.',
        'Inspect zero, blank, invalid text and missing-source recovery.',
        'Edit the native Sheet and read the linked document; the surrounding prose must remain unchanged.',
      ],
      'zh-CN': [
        '按顺序运行原样示例代码。',
        '分别修改食材、收入、储备比例和人数。',
        '检查零值、空值、无效文本及来源缺失恢复。',
        '编辑原生表格并阅读关联文档，周围正文应保持不变。',
      ],
    },
    expected: {
      'en-US':
        'Income 9,200 less costs 7,600 leaves 1,600. Ingredients 3,600 makes costs 8,100 and headroom 1,100. Reserve and headcount are independent assumptions. Native errors remain visible; complete acceptance is still under verification.',
      'zh-CN':
        '收入 9,200 减支出 7,600，余额为 1,600。食材改为 3,600 后，支出为 8,100、余额为 1,100。储备比例与人数是独立假设。保留原生错误，完整验收仍在进行。',
    },
  },
  variants: [
    ['inputs', 'Independent assumptions', '独立假设'],
    ['scope', 'Headroom versus reserve', '余额与储备'],
    ['errors', 'Blank / Zero / Invalid / Missing source', '空值 / 零值 / 无效 / 来源缺失'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['source', 'Edit the native budget', '编辑原生预算'],
    ['doc', 'Read or edit the native document', '阅读或编辑原生文档'],
    ['print', 'Open native Sheet Print', '打开原生表格打印'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['covered', 'Reserve covered', '储备充足'],
    ['review', 'Revisit the scope', '重新评估范围'],
    ['error', 'Native errors and explicit repair', '原生错误与明确修复'],
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
