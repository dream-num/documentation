import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1120,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Ember / Release Notes', 'zh-CN': 'Ember / 发布说明' },
  description: {
    'en-US': 'A native Doc tab reads its host Base to separate completion, unfinished effort and release blockers.',
    'zh-CN': '原生 Doc 标签页读取宿主 Base，区分完成比例、剩余工作量与发布阻塞。',
  },
  tags: {
    'en-US': ['Formula', 'Bases', 'Modern Docs', 'Native tab'],
    'zh-CN': ['公式', '多维表格', '现代文档', '原生标签页'],
  },
  packages: [
    '@univerjs-pro/bases',
    '@univerjs/docs',
    '@univerjs-pro/embed',
    '@univerjs-pro/docs-formula',
    '@univerjs-pro/docs-formula-ui',
  ],
  apis: [
    'FBaseRecord.setValue()',
    'FBaseView.setFilter()',
    'FDocument.insertFormula()',
    'FDocument.getFormulas()',
    'FFormula.upsertExternalReference()',
    'FDocumentParagraph.setText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'A reading workspace prepares a release brief. Counts, estimated effort and editorial readiness tell different stories; the Base owns records, the Doc owns editable explanations.',
      'zh-CN': '阅读工作区准备发布简报。完成数量、预计工时和编辑准备状态各有含义；Base 拥有记录，Doc 拥有可编辑说明。',
    },
    tryIt: {
      'en-US': [
        'Switch between Changes and Release notes.',
        'Complete one review and revise the migration estimate.',
        'Filter the Base and edit a hidden record: whole-table formulas still include it.',
        'Inspect empty queues, missing-source recovery and independent prose edits.',
      ],
      'zh-CN': [
        '切换 Changes 和 Release notes。',
        '完成一项评审并调整迁移估算。',
        '筛选 Base 并修改隐藏记录：全表公式仍包含它。',
        '检查空队列、来源缺失恢复与独立正文编辑。',
      ],
    },
    expected: {
      'en-US':
        '9 of 12 complete, 2 in review, 1 blocked; 12.5 hours remain, including 8 blocked hours. Completing the screen-reader review changes completion to 10 of 12 but does not remove the blocker.',
      'zh-CN':
        '12 项中 9 项完成、2 项评审、1 项阻塞；剩余 12.5 小时，其中阻塞 8 小时。完成读屏评审会变成 10/12，但不会消除阻塞。',
    },
  },
  variants: [
    ['progress', 'Count versus effort', '数量与工作量'],
    ['scope', 'Whole table versus filtered view', '全表与筛选视图'],
    ['recovery', 'Empty / Invalid / Missing source', '空值 / 无效 / 来源缺失'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit release records', '编辑发布记录'],
    ['read', 'Read native document formulas', '阅读原生文档公式'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['blocked', 'Completion with an unresolved blocker', '存在阻塞的完成进度'],
    ['review', 'Review queue', '评审队列'],
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
