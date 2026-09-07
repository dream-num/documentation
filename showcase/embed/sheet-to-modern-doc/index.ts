import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Pollen / Campaign Pulse', 'zh-CN': 'Pollen / 活动数据简报' },
  description: {
    'en-US':
      'A native Sheet drives thirteen inline formulas in a modern campaign brief: blended versus channel return, conversion and an independent learning target.',
    'zh-CN': '原生 Sheet 驱动现代活动简报中的十三个行内公式，展示整体与渠道回报、转化比例和独立学习目标。',
  },
  tags: { 'en-US': ['Formula', 'Modern Docs', 'Sheets', 'DocBlock'], 'zh-CN': ['公式', '现代文档', '表格', '文档块'] },
  packages: [
    '@univerjs-pro/docs-formula',
    '@univerjs-pro/docs-formula-ui',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/embed',
  ],
  apis: [
    'FDocument.insertFormula()',
    'FDocument.getFormulas()',
    'FDocumentFormula.getResult()',
    'FRange.setValue()',
    'FRange.setValues()',
    'FRange.clearContent()',
    'FFormula.upsertExternalReference()',
    'FDocument.saveFormulaDisplayTextSnapshot()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'A positive total can hide a weak channel. Three fictional channels feed native formulas in authored prose; the Sheet is a real editable DocBlock, not a screenshot.',
      'zh-CN':
        '正向总结果可能掩盖弱势渠道。三个虚构渠道驱动正文中的原生公式，Sheet 是真正可编辑的 DocBlock，不是截图。',
    },
    tryIt: {
      'en-US': [
        'Expand the source Sheet and change Search spend in B5 from 4800 to 6300.',
        'Read the blended return and individual channel comparison.',
        'Change G5 independently; the target changes the prompt, not campaign results.',
        'Run the seventeen literal examples for independent inputs, native errors and source repair.',
      ],
      'zh-CN': [
        '展开来源 Sheet，将 B5 的 Search 支出从 4800 改为 6300。',
        '对照整体回报与各渠道结果。',
        '独立修改 G5；目标只改变提示，不改变活动数据。',
        '运行十七段原样代码，验证独立输入、原生错误与来源修复。',
      ],
    },
    expected: {
      'en-US':
        'Spend $12,000, attributed revenue $18,600 and blended return 55.0%; Partners is negative despite the positive total. Raising Search spend to $6,300 gives 37.8% blended return. This is an illustrative attribution measure, not net profit. Partial; see README.',
      'zh-CN':
        '支出 $12,000、归因收入 $18,600，整体回报 55.0%；Partners 在总体为正时仍为负。将 Search 支出改为 $6,300 后整体回报为 37.8%。这是示例归因指标，不是净利润。仅部分验收，详见 README。',
    },
  },
  variants: [
    ['channel', 'Blended / Individual channel', '整体 / 单渠道'],
    ['target', 'Independent learning target', '独立学习目标'],
    ['inputs', 'Spend / Revenue / Visits / Orders', '支出 / 收入 / 访问 / 订单'],
    ['boundary', 'Blank / Zero / Invalid / Repair', '空白 / 零值 / 无效 / 修复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit the native channel Sheet', '编辑原生渠道 Sheet'],
    ['inspect', 'Inspect formula results and bindings', '检查公式结果和绑定'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Live values in authored prose', '正文中的实时数据'],
    ['error', 'Native calculation errors', '原生计算错误'],
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
