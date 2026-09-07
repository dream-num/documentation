import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 960,
  group: { 'en-US': 'Data-driven formulas', 'zh-CN': '数据驱动公式' },
  title: { 'en-US': 'Atlas / Floating Quote Decision', 'zh-CN': 'Atlas / 浮动报价决策' },
  description: {
    'en-US': 'The host Sheet drives six native Formula Shapes in its embedded two-page presentation.',
    'zh-CN': '宿主 Sheet 驱动浮动嵌入的两页幻灯片中的六个原生公式形状。',
  },
  tags: { 'en-US': ['Formulas', 'Sheets', 'Slides', 'Float'], 'zh-CN': ['公式', '表格', '幻灯片', '浮动'] },
  packages: [
    '@univerjs/sheets',
    '@univerjs-pro/slides',
    '@univerjs-pro/shape-editor',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/embed',
  ],
  apis: [
    'FUniver.createEmbed()',
    'FEmbed.setDisplayTarget()',
    'FShape.setFormula()',
    'FShape.getFormulaResult()',
    'FRange.setValue()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'A fictional exhibition quote keeps the commercial model and its decision deck together. Slide@Sheet is the composition; Sheet -> Slide is the data dependency. There is no reverse write-back or copied KPI text.',
      'zh-CN':
        '虚构展陈报价将商业测算和决策演示放在同一工作区。Slide@Sheet 表示嵌入关系，Sheet → Slide 表示数据依赖，不是反向写回或复制 KPI 文字。',
    },
    tryIt: {
      'en-US': [
        'Edit equipment B8 from 2400 to 3000; compare the Sheet and slide margin.',
        'Double-click the native Float and use its page controls to inspect the warm review page.',
        'Change quote B5 to 13200, then zero, then restore it to 12000.',
        'Inspect the exact literal snippets and external references in the exported source.',
      ],
      'zh-CN': [
        '将设备成本 B8 从 2400 改为 3000，对比 Sheet 和幻灯片毛利率。',
        '双击原生 Float，使用翻页控件查看暖色复盘页。',
        '将报价 B5 改为 13200，再归零，最后恢复 12000。',
        '查看导出源码中对应的原样代码与外部引用。',
      ],
    },
    expected: {
      'en-US':
        'Baseline quote 12000, costs 8400, contribution 3600, margin 30%. Equipment +600 produces costs 9000 and margin 25%. Selected formula, native editing/fullscreen, theme and export checks pass; full acceptance remains open in the README.',
      'zh-CN':
        '初始报价 12000、成本 8400、结余 3600、毛利率 30%。设备增加 600 后成本为 9000、毛利率 25%。公式、原生编辑与全屏、主题和导出的选定检查通过；完整验收仍有待办，见 README。',
    },
  },
  variants: [
    ['baseline', 'Original quote', '初始报价'],
    ['cost', 'Equipment cost revision', '设备成本变动'],
    ['price', 'Quote negotiation', '报价调整'],
    ['error', 'Zero quote and recovery', '零报价与恢复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit the real host model', '编辑真实宿主模型'],
    ['navigate', 'Navigate native slide pages', '原生幻灯片翻页'],
    ['recover', 'Restore the quote', '恢复报价'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['ready', 'Linked decision and review', '联动决策与复盘'],
    ['changed', 'Recalculated source', '来源重算'],
    ['error', 'Native division error', '原生除零错误'],
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
