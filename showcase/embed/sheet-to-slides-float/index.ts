import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Lumen / Launch Economics', 'zh-CN': 'Lumen / 首发定价模型' },
  description: {
    'en-US':
      'An embedded pricing Sheet drives nine native formulas across a three-page launch deck: revenue, cost, margin and break-even.',
    'zh-CN': '嵌入的定价 Sheet 驱动三页首发演示中的九个原生公式，展示收入、成本、利润率与盈亏临界点。',
  },
  tags: {
    'en-US': ['Formula', 'Sheets', 'Slides', 'Float', 'Embed'],
    'zh-CN': ['公式', '表格', '幻灯片', '浮动嵌入', '嵌入'],
  },
  packages: [
    '@univerjs-pro/slides',
    '@univerjs-pro/embed',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/shape-editor',
  ],
  apis: [
    'FShape.setFormula()',
    'FShape.getFormulaResult()',
    'FShape.setFormulaAnimationEnabled()',
    'FRange.setValue()',
    'FRange.setValues()',
    'FRange.clearContent()',
    'FUniver.createEmbed()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'A fictional desk-lamp launch keeps editable assumptions inside its presentation. The real Sheet calculates unit economics; native Formula Shapes read those results without rebuilding slide text or layout.',
      'zh-CN':
        '虚构台灯首发计划将可编辑假设放在演示内部。真实 Sheet 计算单位经济模型，原生公式形状读取结果，不重建幻灯片文字或布局。',
    },
    tryIt: {
      'en-US': [
        'Double-click the Sheet on the pricing page and edit amber inputs.',
        'Run the ten literal examples in order.',
        'Compare price, unit cost, fixed cost and volume independently.',
        'Inspect every page after zero, blank, text and zero-spread inputs; restore the baseline.',
      ],
      'zh-CN': [
        '双击定价页的 Sheet，编辑琥珀色输入。',
        '按顺序执行十段原样代码。',
        '分别比较单价、单位成本、固定成本和销量的影响。',
        '输入零、空白、文本与零价差后检查所有页面，再恢复基线。',
      ],
    },
    expected: {
      'en-US':
        '240 units at $45 yield $10,800; price $48 yields $11,520 across three pages. Ten examples pass selected checks. Off-page writes, fullscreen and exact Undo remain failing; see README.',
      'zh-CN':
        '240 件、单价 45 美元得到收入 10,800；单价 48 得到 11,520，三页同步。十段示例通过选定检查；跨页写入、全屏和精确撤销仍失败，详见 README。',
    },
  },
  variants: [
    ['price', 'Shared pricing assumptions', '共享定价假设'],
    ['cost', 'Variable versus fixed costs', '可变成本与固定成本'],
    ['boundary', 'Zero / Blank / Invalid text', '零值 / 空白 / 无效文本'],
    ['spread', 'Break-even / Zero unit spread', '盈亏临界点 / 零单位价差'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit the native source', '编辑原生来源'],
    ['compare', 'Compare all three pages', '比较三页结果'],
    ['recover', 'Restore planning assumptions', '恢复计划假设'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Live source and dependent results', '实时来源与依赖结果'],
    ['error', 'Native errors / Recovery', '原生错误 / 恢复'],
    ['failure', 'Source loading failure / Reload', '来源加载失败 / 刷新'],
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
