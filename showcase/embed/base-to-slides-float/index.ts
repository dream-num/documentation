import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Orchid / Pipeline Review', 'zh-CN': 'Orchid / 商机预测复盘' },
  description: {
    'en-US':
      'Six Relational Table opportunities drive twelve native slide formulas: face value, probability-weighted forecast, stage distribution and independent assumptions.',
    'zh-CN': '六条 Relational Table 商机驱动十二个原生幻灯片公式：名义金额、概率加权预测、阶段分布与独立假设。',
  },
  tags: {
    'en-US': ['Formula', 'Relational Tables', 'Slides', 'Float', 'Embed'],
    'zh-CN': ['公式', 'Relational Tables', '幻灯片', '浮动嵌入'],
  },
  packages: [
    '@univerjs-pro/bases',
    '@univerjs-pro/slides',
    '@univerjs-pro/embed',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/shape-editor',
  ],
  apis: [
    { name: 'FUniver.createEmbed()' },
    { name: 'FShape.setFormula()' },
    { name: 'FShape.getFormulaResult()' },
    { name: 'FBaseRecord.setValue()' },
    { name: 'FBaseView.setFilter()' },
  ],
  guide: {
    overview: {
      'en-US':
        'A fictional experience-design studio compares six opportunities. A native Relational Table Float supplies three Slides pages without a hidden Sheet or custom totals.',
      'zh-CN':
        '虚构体验设计工作室复盘六条商机。原生 Relational Table Float 驱动三页 Slides，不使用隐藏 Sheet 或自算总计。',
    },
    tryIt: {
      'en-US': [
        'Open Pipeline and double-click inside the Relational Table Float until its native toolbar appears.',
        'Run the twelve README snippets in order; return and activate the source before each snippet.',
        'Compare face value and probability-weighted forecast.',
        'Move a stage, filter the view and edit a hidden record.',
      ],
      'zh-CN': [
        '打开 Pipeline，双击 Relational Table Float 内部，直到出现原生浮动工具栏。',
        '依次运行 README 中十二段代码；每段之前返回并激活数据源。',
        '比较名义金额与概率加权预测。',
        '移动阶段、筛选视图并修改隐藏记录。',
      ],
    },
    expected: {
      'en-US':
        'Initially $80,000 nominal, $25,000 weighted and 31.25% coverage. With the source activated, all twelve snippets update all three slides. Passive/off-page writes, title Undo and fullscreen retain failures. See README.',
      'zh-CN':
        '初始名义金额 $80,000，加权金额 $25,000，比例 31.25%。激活数据源后，十二段代码均可更新三页。未激活或跨页写入、标题撤销和全屏仍有失败。详见 README。',
    },
  },
  variants: [
    { id: 'inputs', label: { 'en-US': 'Amount / Probability / Stage', 'zh-CN': '金额 / 概率 / 阶段' } },
    {
      id: 'scope',
      label: { 'en-US': 'Whole table / Filtered view / Hidden edit', 'zh-CN': '整表 / 筛选视图 / 隐藏编辑' },
    },
    {
      id: 'empty',
      label: { 'en-US': 'Null / Zero / Ratio error / Recovery', 'zh-CN': '空值 / 零值 / 比率错误 / 恢复' },
    },
    { id: 'identity', label: { 'en-US': 'Display labels / Stable references', 'zh-CN': '显示名称 / 稳定引用' } },
  ],
  actions: [
    { id: 'edit', label: { 'en-US': 'Edit native opportunity assumptions', 'zh-CN': '编辑原生商机假设' } },
    { id: 'inspect', label: { 'en-US': 'Inspect three dependent pages', 'zh-CN': '检查三页依赖结果' } },
    { id: 'recover', label: { 'en-US': 'Restore the starting pipeline', 'zh-CN': '恢复初始商机数据' } },
  ],
  states: [
    { id: 'live', label: { 'en-US': 'Live weighted results', 'zh-CN': '实时加权结果' } },
    { id: 'error', label: { 'en-US': 'Native ratio error / Recovery', 'zh-CN': '原生比率错误 / 恢复' } },
    { id: 'load', label: { 'en-US': 'Source load failure', 'zh-CN': '来源加载失败' } },
  ],
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
