import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  image: '/assets/showcase/embed-formula-customrange.png',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Estuary / Data-linked Narrative', 'zh-CN': 'Estuary / 数据联动正文' },
  description: {
    'en-US':
      'Sheet funding and Relational Table commitments drive four native inline formulas in a modern document, with both sources embedded as body blocks.',
    'zh-CN': 'Sheet 资金与 Relational Table 支出驱动现代文档中的四个原生行内公式，两个来源均作为正文块嵌入。',
  },
  tags: {
    'en-US': ['Formula', 'Modern Docs', 'Sheets', 'Relational Tables', 'Inline', 'Embed'],
    'zh-CN': ['公式', '现代文档', '表格', 'Relational Tables', '行内公式', '嵌入'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs-pro/docs-formula',
    '@univerjs-pro/docs-formula-ui',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
    '@univerjs-pro/bases-ui',
  ],
  apis: [
    'FDocument.insertFormula()',
    'FDocument.getFormulas()',
    'FDocumentFormula.getResult()',
    'FRange.setValue()',
    'FBaseTableRecord.setValue()',
    'FDocument.saveFormulaDisplayTextSnapshot()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'An original fictional listening project uses four funding contributions and five delivery commitments. Native custom ranges calculate funding, spending, balance and spending share inside a real paragraph; no JavaScript totals or manual refresh.',
      'zh-CN':
        '原创虚构社区访谈项目包含四项资金与五项支出。原生 Custom Range 在真实段落中计算资金、支出、余额和支出占比，不用 JavaScript 拼接统计数字或手动刷新。',
    },
    tryIt: {
      'en-US': [
        'Read the four inline results, then expand each native source block.',
        'Run the six literal README examples in order.',
        'Compare independent source edits and zero-denominator recovery.',
        'Inspect native save versus the detached display-text projection.',
      ],
      'zh-CN': [
        '阅读四个行内结果，再展开两个原生来源块。',
        '按顺序运行 README 的六段原样代码。',
        '比较独立来源修改及零分母恢复。',
        '比较原生保存与独立显示文字快照。',
      ],
    },
    expected: {
      'en-US':
        'Baseline: funding 16,000; commitments 9,800; balance 6,200; spending share 61.25%. Selected updates preserve prose and styles. Known beta.2 issue: #DIV/0! is displayed but reported as success; see README. Partial, not full acceptance.',
      'zh-CN':
        '初始资金 16,000、支出 9,800、余额 6,200、支出占比 61.25%。选定修改保持正文与样式。beta.2 已知问题：显示 #DIV/0! 却报告 success，详见 README。仅部分验收。',
    },
  },
  variants: [
    ['baseline', 'Two sources / Four inline results', '两个来源 / 四个行内结果'],
    ['independent', 'Independent source changes', '独立来源修改'],
    ['error', 'Zero funding / Native error / Recovery', '零资金 / 原生错误 / 恢复'],
    ['projection', 'Native save / Display-text snapshot', '原生保存 / 显示文字快照'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['funding', 'Revise funding in the Sheet', '修改 Sheet 资金'],
    ['commitments', 'Revise commitments in the Relational Table', '修改 Relational Table 支出'],
    ['inspect', 'Inspect formula bindings and results', '检查公式绑定与结果'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Calculated inline results', '已计算行内结果'],
    ['error', 'Native error with prose preserved', '原生错误且保留正文'],
    ['failure', 'Source loading failure / Reload', '来源加载失败 / 刷新'],
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
