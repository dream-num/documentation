import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1123,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Cobalt / Operating Review', 'zh-CN': 'Cobalt / 年度经营评审' },
  description: {
    'en-US':
      'A revenue Sheet and independent cost Base drive fourteen inline formulas across a four-page traditional operating review.',
    'zh-CN': '收入 Sheet 与独立成本 Base 共同驱动四页传统经营报告中的十四个行内公式。',
  },
  tags: {
    'en-US': ['Formula', 'Traditional Docs', 'Sheets', 'Bases', 'DocBlock'],
    'zh-CN': ['公式', '传统文档', '表格', '多维表格', '文档块'],
  },
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
    'FBaseTableRecord.setValue()',
    'FBaseView.setFilter()',
    'FFormula.upsertExternalReference()',
    'FBase.save()',
    'FDocument.save()',
    'FWorkbook.save()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Two independent data sources feed one paginated report. Scope is a record value; a view filter only changes visibility.',
      'zh-CN': '两个独立数据源驱动一份分页报告。Scope 是记录字段；视图筛选只改变可见范围。',
    },
    tryIt: {
      'en-US': [
        'Expand the Sheet and change revenue B5 to 26000.',
        'Expand the Base and revise Shared venue to 15700.',
        'Change E5 to 40%; review the target gap without changing income or costs.',
        'Run the twenty literal examples for filtering, missing values and independent binding repair.',
      ],
      'zh-CN': [
        '展开 Sheet，将收入 B5 改为 26000。',
        '展开 Base，将 Shared venue 成本改为 15700。',
        '将 E5 改为 40%，观察目标差异，收入和成本不变。',
        '运行二十段原样代码，验证筛选、缺失值及独立绑定修复。',
      ],
    },
    expected: {
      'en-US':
        'Baseline revenue $86,000; included costs $57,500; difference $28,500; retained share 33.1%; target 30%; headroom $2,700. Fictional scenario, not financial statements. Partial acceptance; see README.',
      'zh-CN':
        '基线收入 $86,000，纳入成本 $57,500，差额 $28,500，留存比例 33.1%，目标 30%，目标余量 $2,700。虚构情景，并非财务报表；仅部分验收，详见 README。',
    },
  },
  variants: [
    ['sources', 'Independent Sheet / Base inputs', '独立 Sheet / Base 输入'],
    ['scope', 'Scope / View filter / Hidden edits', '范围 / 视图筛选 / 隐藏记录修改'],
    ['target', 'Target / Gap / Discussion signal', '目标 / 差异 / 讨论提示'],
    ['binding', 'Missing source / Independent repair', '来源缺失 / 独立修复'],
    ['restore', 'Three-unit native snapshot reconstruction', '三个数据单元的原生快照重建'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit either native source', '编辑任一原生来源'],
    ['inspect', 'Inspect three native snapshots', '检查三个原生快照'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Repeated figures share live bindings', '重复数字共享实时绑定'],
    ['error', 'Native errors without fallback totals', '原生错误，无替代总数'],
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
