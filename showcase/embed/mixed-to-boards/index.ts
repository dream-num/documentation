import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1160,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Grove / Exhibition Readiness', 'zh-CN': 'Grove / 展览筹备评审' },
  description: {
    'en-US':
      'A budget Sheet and readiness Base drive sixteen native Board results: budget, cost, status, ceiling and three connected zones.',
    'zh-CN': '预算 Sheet 与筹备 Base 共同驱动十六个原生 Boards 结果：预算、成本、状态、支出阈值与三个相连分区。',
  },
  tags: {
    'en-US': ['Formula', 'Sheets', 'Bases', 'Boards', 'Float', 'Mixed sources'],
    'zh-CN': ['公式', '表格', '多维表格', '画板', '浮动嵌入', '混合数据源'],
  },
  packages: [
    '@univerjs-pro/boards',
    '@univerjs-pro/bases',
    '@univerjs/sheets',
    '@univerjs-pro/embed',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/shape-editor',
  ],
  apis: [
    'FShape.setFormula()',
    'FShape.getFormulaResult()',
    'FRange.setValue()',
    'FBaseRecord.setValue()',
    'FBaseView.setFilter()',
    'FFormula.upsertExternalReference()',
    'FBoard.save()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'An original exhibition combines two independent native sources. Six gates carry costs and readiness; three Sheet envelopes and a separate ceiling guide a connected Board conversation.',
      'zh-CN':
        '原创展览场景组合两个独立原生来源。六项筹备记录保存成本和状态，Sheet 的三个预算分区和独立阈值共同驱动 Boards 评审。',
    },
    tryIt: {
      'en-US': [
        'Run the twenty literal README snippets in order.',
        'Compare a local overrun with positive total headroom.',
        'Change status without removing cost, then tighten the ceiling.',
        'Filter the Base, edit a hidden gate, break and repair each source mapping.',
      ],
      'zh-CN': [
        '按顺序运行 README 的二十段原样代码。',
        '比较局部超支与仍有余量的总预算。',
        '只修改状态而不移除成本，再收紧支出阈值。',
        '筛选 Base、修改隐藏记录，分别断开和恢复两个来源映射。',
      ],
    },
    expected: {
      'en-US':
        '$18,000 budget, $14,600 cost, $3,400 balance; four of six gates Ready. The independent 85% ceiling has $700 headroom. A local overrun need not erase overall headroom.',
      'zh-CN':
        '预算 $18,000、成本 $14,600、余额 $3,400；六项中四项完成。独立的 85% 支出阈值还余 $700。局部超支不代表总预算已耗尽。',
    },
  },
  variants: [
    ['budget', 'Financial headroom / Local overrun', '总量有余 / 局部超支'],
    ['readiness', 'Status versus retained cost', '完成状态 / 保留成本'],
    ['ceiling', 'Independent spending ceiling', '独立支出阈值'],
    ['projection', 'Filtered view / Whole-table dependencies', '筛选视图 / 整表依赖'],
    ['sources', 'Missing mappings / Native errors / Repair', '来源缺失 / 原生错误 / 修复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit both native sources', '编辑两个原生来源'],
    ['trace', 'Follow three connected zones', '追踪三个相连分区'],
    ['inspect', 'Inspect formulas and separate snapshots', '检查公式与独立快照'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['blocked', 'Resolve blockers', '优先解决阻塞'],
    ['spending', 'Review spending', '检查支出'],
    ['review', 'Continue gate review', '继续筹备评审'],
    ['error', 'Native unavailable-source or division error', '原生来源缺失或除法错误'],
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
