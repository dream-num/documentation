import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1000,
  group: { 'en-US': 'Data-driven formulas', 'zh-CN': '数据驱动公式' },
  title: { 'en-US': 'Solstice / Scenario Review Deck', 'zh-CN': 'Solstice / 多情景复盘演示' },
  description: {
    'en-US':
      'One Sheet model drives twelve native Formula Shapes across three distinct slides in an embedded deck tab.',
    'zh-CN': '一个 Sheet 模型驱动原生演示 Tab 中三种布局、十二个公式形状。',
  },
  tags: {
    'en-US': ['Formulas', 'Sheets', 'Slides', 'Tab', 'Scenarios'],
    'zh-CN': ['公式', '表格', '幻灯片', '标签页', '情景分析'],
  },
  packages: [
    '@univerjs/sheets',
    '@univerjs-pro/slides',
    '@univerjs-pro/shape-editor',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/embed',
  ],
  apis: [
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FShape.setFormula()',
    'FShape.getFormulaResult()',
    'FShape.setFormulaAnimationEnabled()',
    'FRange.setValue()',
    'FRange.setValues()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'A fictional evening programme compares Conservative, Baseline and Expanded attendance. Shared price/cost assumptions update all three pages; a scenario-only guest edit changes only its dependents. SheetTab placement is independent of formula direction.',
      'zh-CN':
        '虚构晚间活动比较保守、基准和扩展三种人数方案。共享票价与成本影响所有页面，单个方案的人数只影响自身结果。SheetTab 嵌入方向与公式依赖独立。',
    },
    tryIt: {
      'en-US': [
        'Change shared ticket price B5 from 32 to 35.',
        'Open Scenario deck and inspect each native slide page.',
        'Change only Expanded guests B13 to 140; compare the unchanged scenarios.',
        'Set price to zero, observe three native margin errors, then recover using the literal examples.',
      ],
      'zh-CN': [
        '将共享票价 B5 从 32 改为 35。',
        '打开 Scenario deck，查看每个原生幻灯片页面。',
        '仅将扩展方案人数 B13 改为 140，对比未变化的其他方案。',
        '将票价归零，观察三个原生比例错误，再按原样代码恢复。',
      ],
    },
    expected: {
      'en-US':
        'Baseline revenues are 2560 / 3200 / 4000; ticket price 35 changes them to 2800 / 3500 / 4375. Selected formula, native Tab/history, theme and export checks pass. Full acceptance remains open; see README.',
      'zh-CN':
        '初始收入 2560 / 3200 / 4000；票价 35 时为 2800 / 3500 / 4375。公式、原生 Tab 与撤销归属、主题和导出的选定检查通过。完整验收仍有待办，见 README。',
    },
  },
  variants: [
    ['shared', 'Shared assumptions', '共享假设'],
    ['isolated', 'One scenario only', '单个情景'],
    ['cost', 'Cost sensitivity', '成本敏感性'],
    ['error', 'Zero and recovery', '归零与恢复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['input', 'Edit the native Sheet', '编辑原生 Sheet'],
    ['review', 'Review three native slides', '查看三页原生幻灯片'],
    ['restore', 'Restore original assumptions', '恢复原始假设'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['baseline', 'Three original scenarios', '三个原始情景'],
    ['changed', 'Independent dependencies', '独立依赖'],
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
