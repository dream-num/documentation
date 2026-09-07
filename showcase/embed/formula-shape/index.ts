import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1000,
  group: { 'en-US': 'Data-driven formulas', 'zh-CN': '数据驱动公式' },
  title: { 'en-US': 'Beacon / Live Impact Cards', 'zh-CN': 'Beacon / 实时经营卡片' },
  description: {
    'en-US': 'Sheet revenue and Base costs drive eight native Formula Shapes across four distinct Slides pages.',
    'zh-CN': 'Sheet 收入与 Base 成本共同驱动四页幻灯片中的八个原生公式形状。',
  },
  tags: {
    'en-US': ['Formulas', 'Slides', 'Sheets', 'Bases', 'Embed'],
    'zh-CN': ['公式', '幻灯片', '表格', '多维表格', '嵌入'],
  },
  packages: [
    '@univerjs-pro/slides',
    '@univerjs-pro/bases',
    '@univerjs-pro/embed',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/shape-editor',
  ],
  apis: [
    'FShape.setFormula()',
    'FShape.getFormulaResult()',
    'FRange.setValue()',
    'FRange.setValues()',
    'FBaseRecord.setValue()',
    'FUniver.createEmbed()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'A fictional learning studio separates workshop revenue from delivery costs. Native formulas combine the two real data sources; source edits preserve authored slide prose and geometry.',
      'zh-CN':
        '虚构学习工作室将工作坊收入与交付成本分开管理。原生公式汇总两个真实数据源，来源修改不应改变幻灯片的说明文字和布局。',
    },
    tryIt: {
      'en-US': [
        'Inspect the four native slide pages and their source Floats.',
        'Open the revenue page and change Sheet fee C5 from 45 to 50 using the literal example.',
        'Edit the Base room amount from 1800 to 2100 in its native grid; compare with the documented Facade boundary.',
        'Set all source quantities to zero, observe the native error, then restore.',
      ],
      'zh-CN': [
        '查看四个原生幻灯片页面与来源 Float。',
        '按原样代码将 Sheet C5 票价从45改为50。',
        '将 Base 场地金额从1800改为2100。',
        '把来源数量归零，观察原生错误，再恢复。',
      ],
    },
    expected: {
      'en-US':
        'Opening revenue 10090 / cost 5600 / contribution 4490. Both source edits recalculate the overview, but Base editing currently disrupts the Slides workbench. Partial evidence only; see README.',
      'zh-CN':
        '初始收入10090、成本5600、结余4490。两个来源修改均可重算总览，但 Base 编辑目前会破坏 Slides 宿主界面。仅部分验证，详见 README。',
    },
  },
  variants: [
    ['sheet', 'Sheet-only revenue', '仅 Sheet 收入'],
    ['base', 'Base-only costs', '仅 Base 成本'],
    ['mixed', 'Combined contribution and margin', '混合结余与比例'],
    ['fractional', 'Fractional source precision', '来源小数精度'],
    ['unpriced', 'Blank versus invalid fee', '空值与无效单价'],
    ['donated', 'Donated delivery versus zero revenue', '捐赠成本与零收入边界'],
    ['context', 'Context edits preserve totals', '上下文编辑保持总额'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['fee', 'Revise workshop fee', '修改工作坊单价'],
    ['cost', 'Revise room allocation', '修改场地成本'],
    ['recover', 'Exercise zero and recover', '归零与恢复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['baseline', 'Original planning baseline', '原始计划基线'],
    ['changed', 'Independent source changes', '独立来源变更'],
    ['error', 'Native divide-by-zero and recovery', '原生除零错误与恢复'],
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
