import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1000,
  group: { 'en-US': 'Cross-product formulas', 'zh-CN': '跨产品公式' },
  title: { 'en-US': 'Harbor / Fare Sensitivity', 'zh-CN': 'Harbor / 票价敏感性分析' },
  description: {
    'en-US':
      'A native Sheet Float exposes a separate fare workbook; stable-ID formula references drive a budget, scenarios and visible error recovery.',
    'zh-CN': '原生 Sheet Float 展示独立票价工作簿，通过稳定 ID 公式引用驱动预算、情景分析及可见的错误恢复。',
  },
  tags: {
    'en-US': ['Embed', 'Sheets', 'Float', 'Formulas', 'External references'],
    'zh-CN': ['嵌入', '表格', 'Float', '公式', '外部引用'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
    '@univerjs-pro/engine-formula',
    '@univerjs/sheets-ui',
    '@univerjs/preset-sheets-advanced',
  ],
  apis: [
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FFormula.upsertExternalReference()',
    'FFormula.buildReference()',
    'FRange.setValue()',
    'FRange.setFormula()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Six fare categories feed an operating budget through native VLOOKUP and bound external references. A second source worksheet supplies allowance and reserve; three demand scenarios follow the result. Reference lab exposes real errors, not fallback estimates.',
      'zh-CN':
        '六类票价通过原生 VLOOKUP 和已绑定外部引用驱动运营预算。来源的另一张工作表提供支出和备用金比例，三种需求情景继续引用结果。Reference lab 展示真实错误，不用替代估算掩盖。',
    },
    tryIt: {
      'en-US': [
        'Run the explicit-workbook-ID source edit below; beta.2 native source typing currently targets the wrong workbook.',
        'Return to Budget and compare revenue and after-reserve totals.',
        'Open Sensitivity and Reference lab through native sheet tabs.',
        'Run the six literal README examples, including invalid text and missing-source repair.',
      ],
      'zh-CN': [
        '使用下方指定工作簿 ID 的源表编辑代码；beta.2 原生源表键盘输入目前会误改宿主。',
        '返回 Budget，对比收入和扣除备用金后的合计。',
        '通过原生工作表标签打开 Sensitivity 与 Reference lab。',
        '运行 README 六段原样示例，包括无效文本和缺失来源修复。',
      ],
    },
    expected: {
      'en-US':
        'Opening gross 2525 / after-reserve 922.50. The 4.50 single fare gives 2615 / 1003.50 at opening counts. Six explicit-ID examples pass; native source editing and passive Float display fail. Do not use this case as a completed embedding reference.',
      'zh-CN':
        '初始收入2525、结余922.50；初始数量下单程票价4.50对应2615与1003.50。六段指定 ID 的示例通过，原生源表编辑和非激活 Float 显示仍失败，不应作为已完成的嵌入范例。',
    },
  },
  variants: [
    ['lookup', 'Live cross-workbook lookup', '跨工作簿实时查找'],
    ['scenarios', 'Three demand scenarios', '三种需求情景'],
    ['errors', 'Unavailable and invalid source values', '不可用与无效来源'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['fare', 'Revise the source fare', '修改源票价'],
    ['passes', 'Revise the planned pass count', '修改计划票数'],
    ['binding', 'Repair a missing source binding', '修复缺失来源绑定'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['baseline', 'Illustrative planning baseline', '示意计划基线'],
    ['invalid', 'Native formula error', '原生公式错误'],
    ['recovered', 'Repaired source and binding', '来源和绑定已修复'],
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
