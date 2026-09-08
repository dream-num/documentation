import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1000,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Reed / Operations Map', 'zh-CN': 'Reed / 运营负载地图' },
  description: {
    'en-US':
      'A Relational Table-hosted Canvas tab turns workstream load, capacity and blockers into twelve native formulas and a connected operations map.',
    'zh-CN': 'Relational Table 宿主中的 Canvas 标签页，通过十二个原生公式和连接线展示各工作流负载、容量与阻塞状态。',
  },
  tags: {
    'en-US': ['Formula', 'Canvas@Relational Table', 'Tab', 'Capacity'],
    'zh-CN': ['公式', 'Canvas@Relational Table', '标签页', '产能'],
  },
  packages: [
    '@univerjs-pro/bases',
    '@univerjs-pro/boards',
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
    'FBoard.save()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Relational Table is both host and source. The Canvas is a native editable map whose numbers follow the source, not a copied summary.',
      'zh-CN': 'Relational Table 同时是宿主和来源；Canvas 是原生可编辑地图，数字随来源更新，而不是复制的汇总。',
    },
    tryIt: {
      'en-US': [
        'Change Repair load from 9 to 12 in Workstream register.',
        'Open Operations map: total becomes 33 hours, utilization 82.5%.',
        'Reduce Repair capacity to 10: it is overloaded despite spare capacity elsewhere.',
        'Try status, empty filters, hidden edits, errors and source repair with the literal snippets.',
        'Select the source node and move it with ArrowRight; double-click to edit its text. Click outside to commit, then refocus the canvas for Undo/Redo.',
      ],
      'zh-CN': [
        '在 Workstream register 中将 Repair 负载从 9 改为 12。',
        '打开 Operations map：总负载为 33 小时，利用率为 82.5%。',
        '将 Repair 容量降到 10：即使其他工作流仍有余量，它也已经超载。',
        '使用原样代码验证状态、空筛选、隐藏编辑、错误和来源修复。',
        '选中来源节点后按右方向键移动，双击编辑文字。点击外部提交，再聚焦画布使用撤销/重做。',
      ],
    },
    expected: {
      'en-US':
        '14 + 9 + 7 = 30 hours against 40 available (75%). Load and capacity are independent; blocked status is separate from overload. Native formulas choose the review prompt.',
      'zh-CN': '14 + 9 + 7 = 30 小时，总容量 40 小时，利用率 75%。负载、容量与阻塞状态相互独立，原生公式决定评审提示。',
    },
  },
  variants: [
    ['capacity', 'Load / Capacity / Negative remainder', '负载 / 容量 / 负余量'],
    ['status', 'Blocked / Overloaded / Ready', '阻塞 / 超载 / 就绪'],
    ['projection', 'Full source / Empty view / Hidden edit', '完整来源 / 空视图 / 隐藏编辑'],
    ['boundary', 'Blank / Zero / Native error / Repair', '空值 / 零值 / 原生错误 / 修复'],
    ['recovery', 'Edited pair / Restore / Fresh calculation', '已编辑双单元 / 恢复 / 继续计算'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit native Relational Table records', '编辑原生 Relational Table 记录'],
    ['map', 'Explore native Canvas objects', '查看原生 Canvas 对象'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Connected workstream map', '联动工作流地图'],
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
