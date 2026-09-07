import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1000,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Indigo / Portfolio Presentation', 'zh-CN': 'Indigo / 资源分配演示' },
  description: {
    'en-US':
      'A Base-hosted Slides tab reads the host portfolio through twelve native Formula Shapes: totals, project shares and concentration across three pages.',
    'zh-CN': 'Base 主工作台中的 Slides 标签页，通过十二个原生 Formula Shape 展示三页总额、项目占比与集中度。',
  },
  tags: {
    'en-US': ['Formula', 'Slides@Base', 'Tab', 'Allocation'],
    'zh-CN': ['公式', 'Slides@Base', '标签页', '资源分配'],
  },
  packages: [
    '@univerjs-pro/bases',
    '@univerjs-pro/slides',
    '@univerjs-pro/embed',
    '@univerjs-pro/shape-editor',
    '@univerjs-pro/engine-formula',
  ],
  apis: [
    'FBaseTableRecord.setValue()',
    'FBaseTableView.setFilter()',
    'FShape.setFormula()',
    'FShape.getFormulaResult()',
    'FFormula.upsertExternalReference()',
    'FBase.save()',
    'FPresentation.save()',
    'FEmbed.setDisplayTarget()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'The Base is both host and source. The native presentation tab is the output, not a second source table.',
      'zh-CN': 'Base 同时是宿主和数据源，原生演示标签页是结果，不是另一份来源表。',
    },
    tryIt: {
      'en-US': [
        'Edit Evening makers allocation from 8000 to 10000.',
        'Open Portfolio review in the native Base table list.',
        'Compare all three pages: total, individual shares and largest-project share.',
        'Try the literal examples for filters, hidden records, native errors and source recovery.',
        'Use the entry-module reconstruction example to retain both edited units and continue calculating after recovery.',
      ],
      'zh-CN': [
        '将 Evening makers 分配金额从 8000 改为 10000。',
        '在 Base 原生表列表中打开 Portfolio review。',
        '比较三页中的总额、各项目占比和最大项目占比。',
        '按原样示例验证筛选、隐藏记录、原生错误及来源恢复。',
        '使用入口模块中的重建示例保留两个单元的编辑，并在恢复后继续计算。',
      ],
    },
    expected: {
      'en-US':
        '15000 + 22000 + 8000 = 45000. Editing 8000 to 10000 yields 47000; the largest-project share changes from 48.89% to 46.81%. Authored prose and geometry stay intact.',
      'zh-CN':
        '15000 + 22000 + 8000 = 45000。8000 改为 10000 后总额为 47000，最大项目占比从 48.89% 变为 46.81%，正文与布局保持不变。',
    },
  },
  variants: [
    ['outputs', 'Total / Individual shares / Concentration', '总额 / 单项占比 / 集中度'],
    ['projection', 'Full table / Filtered view / Hidden edits', '完整表 / 筛选视图 / 隐藏编辑'],
    ['boundary', 'Blank / Zero / Native error / Recovery', '空值 / 零值 / 原生错误 / 恢复'],
    ['binding', 'Stable identity / Unavailable source / Repair', '稳定标识 / 来源失效 / 修复'],
    ['recovery', 'Serialized pair / Edited formulas / Deleted content', '双单元快照 / 修改的公式 / 删除的内容'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit native Base records', '编辑原生 Base 记录'],
    ['review', 'Navigate native presentation pages', '切换原生演示页面'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Linked portfolio', '联动分配报告'],
    ['error', 'Native formula errors', '原生公式错误'],
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
