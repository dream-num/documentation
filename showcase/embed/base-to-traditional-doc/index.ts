import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Linen / Services Schedule', 'zh-CN': 'Linen / 分页服务明细' },
  description: {
    'en-US':
      'Base service records drive twelve inline formulas across a three-page A4 schedule: included fees, optional scope, hours and phase allocation.',
    'zh-CN': 'Base 服务记录驱动三页 A4 明细中的十二个行内公式：纳入费用、可选范围、工时与阶段分配。',
  },
  tags: {
    'en-US': ['Formula', 'Traditional Docs', 'Bases', 'A4', 'Inline'],
    'zh-CN': ['公式', '传统文档', '多维表格', 'A4', '行内公式'],
  },
  packages: [
    '@univerjs-pro/bases',
    '@univerjs-pro/docs-formula',
    '@univerjs-pro/docs-formula-ui',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/embed',
  ],
  apis: [
    'FUniver.createEmbed()',
    'FDocument.insertFormula()',
    'FDocument.getFormulas()',
    'FBaseTableRecord.setValue()',
    'FBaseTableView.setFilter()',
    'FFormula.upsertExternalReference()',
    'FDocument.saveFormulaDisplayTextSnapshot()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'An original community-programme studio keeps its paginated narrative linked to a native Base. No hidden Sheet, custom totals or regenerated report.',
      'zh-CN': '原创社区活动工作室将分页说明关联至原生 Base，不使用隐藏 Sheet、自算统计或重新生成的报告。',
    },
    tryIt: {
      'en-US': [
        'Read the summary, then expand the native Base block on page two.',
        'Change Workshop facilitation fee from 850 to 1000.',
        'Compare the summary and phase allocation on page three.',
        'Include optional work, filter the view, and try blank/zero and source repair using the literal examples.',
      ],
      'zh-CN': [
        '阅读摘要，再展开第二页的原生 Base 块。',
        '将 Workshop facilitation 费用从 850 改为 1000。',
        '比较摘要和第三页的阶段分配。',
        '按原样示例体验纳入可选项目、视图筛选、空值/零值及来源修复。',
      ],
    },
    expected: {
      'en-US':
        'Included fees 1200 + 850 + 450 = 2500; optional 300 is separate. Editing 850 to 1000 yields 2650 while authored prose and page boundaries stay intact. See README for tested scope.',
      'zh-CN':
        '纳入费用 1200 + 850 + 450 = 2500，可选 300 单独显示。850 改为 1000 后合计为 2650，既有正文和分页保持不变。验收范围见 README。',
    },
  },
  variants: [
    ['scope', 'Included / Optional / Phase allocation', '纳入 / 可选 / 阶段分配'],
    ['values', 'Fee / Hours / Context', '费用 / 工时 / 上下文'],
    ['filter', 'Whole table / Filtered view / Hidden edit', '全表 / 筛选视图 / 隐藏编辑'],
    ['boundary', 'Blank / Zero / Native error / Repair', '空值 / 零值 / 原生错误 / 修复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit the native service register', '编辑原生服务记录'],
    ['read', 'Compare linked report chapters', '比较关联报告章节'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Live paginated schedule', '实时分页明细'],
    ['error', 'Native errors / Explicit recovery', '原生错误 / 显式恢复'],
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
