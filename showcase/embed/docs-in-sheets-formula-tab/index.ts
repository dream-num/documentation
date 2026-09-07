import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1120,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Cypress / Forecast Notebook', 'zh-CN': 'Cypress / 预测笔记' },
  description: {
    'en-US': 'A native document tab reads its host Sheet to separate expected closing cash from payment-date timing.',
    'zh-CN': '原生文档标签页读取宿主 Sheet，区分预计期末余额与付款时点余额。',
  },
  tags: {
    'en-US': ['Formula', 'Sheets', 'Modern Docs', 'Native tab', 'Print'],
    'zh-CN': ['公式', '表格', '现代文档', '原生标签页', '打印'],
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
    'FDocumentParagraph.setText()',
    'FUniver.executeCommand()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'An independent press expects a positive closing balance, but late collections can leave its payment-date reserve short. The Sheet owns inputs; Forecast notebook is a separate native Doc Tab. Tab placement is not a second calculation engine.',
      'zh-CN':
        '一家独立出版社预计期末余额为正，但回款延后可能使付款时储备不足。输入属于 Sheet，Forecast notebook 是独立原生 Doc Tab。标签页不是第二套计算引擎。',
    },
    tryIt: {
      'en-US': [
        'Switch between Cash forecast and Forecast notebook.',
        'Run each literal example; compare total-period and payment-date balances.',
        'Edit while the document is inactive, then return to read its native formulas.',
        'Inspect blank/zero/text, missing-source recovery, native Print and separate prose edits.',
      ],
      'zh-CN': [
        '切换 Cash forecast 和 Forecast notebook。',
        '运行原样代码，比较整个期间与付款时点余额。',
        '在文档非当前页时修改来源，再返回查看原生公式。',
        '检查空值/零值/文本、来源缺失恢复、原生打印与独立正文编辑。',
      ],
    },
    expected: {
      'en-US':
        'Opening 4,000 + collections 12,500 − payments 9,800 = closing 6,700. With only 75% collected by payment, the balance is 3,575 against a 5,000 floor. The 1,425 shortfall is visible even when period-end cash is positive.',
      'zh-CN':
        '期初 4,000 + 回款 12,500 − 支付 9,800 = 期末 6,700。付款前只收到 75% 时，余额为 3,575，相对 5,000 底线短缺 1,425；期末为正并不会隐藏时点风险。',
    },
  },
  variants: [
    ['totals', 'Movement and closing cash', '净变动与期末余额'],
    ['timing', 'Collection timing and reserve', '回款时点与储备'],
    ['errors', 'Blank / Zero / Invalid / Missing source', '空值 / 零值 / 无效 / 来源缺失'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit source assumptions', '修改来源假设'],
    ['read', 'Read the native document tab', '阅读原生文档标签页'],
    ['print', 'Print the source Sheet', '打印来源表格'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['baseline', 'Positive close / Timing gap', '期末为正 / 时点短缺'],
    ['covered', 'Timing buffer covered', '时点储备充足'],
    ['error', 'Native errors and recovery', '原生错误与恢复'],
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
