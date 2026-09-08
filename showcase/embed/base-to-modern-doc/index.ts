import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Cinder / Incident Briefing', 'zh-CN': 'Cinder / 事故交接简报' },
  description: {
    'en-US':
      'Eight Relational Table incidents drive ten native inline formulas in a modern document: status, affected sessions and a conditional handoff signal.',
    'zh-CN': '八条 Relational Table 事故记录驱动现代文档中的十个原生行内公式：状态、受影响会话与条件交接结论。',
  },
  tags: {
    'en-US': ['Formula', 'Modern Docs', 'Relational Tables', 'Inline', 'Embed'],
    'zh-CN': ['公式', '现代文档', 'Relational Tables', '行内公式', '嵌入'],
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
    'FFormula.upsertExternalReference()',
    'FFormula.removeExternalReference()',
    'FBaseTableRecord.setValue()',
    'FBaseView.setFilter()',
    'FDocument.saveFormulaDisplayTextSnapshot()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'A fictional reliability handoff reads a native Relational Table register. Counts and session totals change inside authored paragraphs; no hidden Sheet or custom totals.',
      'zh-CN':
        '虚构服务可靠性交接从原生 Relational Table 读取记录。计数与会话总量在既有段落中变化，不用隐藏 Sheet 或自算统计。',
    },
    tryIt: {
      'en-US': [
        'Read the live summary, then expand the native Relational Table block.',
        'Run seventeen literal README examples in order, including source rename and mapping repair.',
        'Compare status changes, impact corrections and a hidden resolved record.',
        'Resolve every incident, inspect the native error, then recover.',
      ],
      'zh-CN': [
        '阅读实时摘要，再展开原生 Relational Table 块。',
        '依次运行 README 的十七段代码，包括来源改名与映射修复。',
        '比较状态变化、影响数修正和隐藏的已解决记录。',
        '解决全部记录，检查原生错误，再恢复。',
      ],
    },
    expected: {
      'en-US':
        'Baseline: 3 open, 2 monitoring, 3 resolved; 180 open sessions, 40 monitored and 300 total. Explicit native mapping preserves calculations after source rename. Explore missing mapping and repair; native error status and Undo after reentry retain failures. See README.',
      'zh-CN':
        '初始 3 条未关闭、2 条监控中、3 条已解决；对应 180 个未关闭会话、40 个监控会话、300 个总会话。显式原生映射让来源改名后仍可计算；可继续体验映射缺失与修复。原生错误状态和重新进入后的撤销仍有失败，详见 README。',
    },
  },
  variants: [
    ['state', 'Open / Monitoring / Resolved', '未关闭 / 监控中 / 已解决'],
    ['impact', 'Status count / Session impact', '状态计数 / 会话影响'],
    ['scope', 'Whole table / Filtered view / Hidden edit', '整表 / 筛选视图 / 隐藏编辑'],
    ['empty', 'Unknown / Zero / Empty queue / Recovery', '未知 / 零值 / 空队列 / 恢复'],
    ['identity', 'Stable bindings / Display names / Context', '稳定绑定 / 显示名称 / 上下文'],
    ['binding', 'Idempotent mapping / Removal / Repair', '幂等映射 / 移除 / 修复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit native incidents', '编辑原生事故记录'],
    ['inspect', 'Read the dependent narrative', '阅读依赖正文'],
    ['recover', 'Restore the starting queue', '恢复初始队列'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Live inline summary', '实时行内摘要'],
    ['empty', 'Empty queue / Native average error', '空队列 / 原生平均数错误'],
    ['load', 'Source load failure / Reload', '来源加载失败 / 刷新'],
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
