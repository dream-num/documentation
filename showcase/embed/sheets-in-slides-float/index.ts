import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1000,
  group: { 'en-US': 'Slides host / Float', 'zh-CN': 'Slides 宿主 / 浮动嵌入' },
  title: { 'en-US': 'Sheets in Slides / Quarterly Assumptions', 'zh-CN': 'Sheets 嵌入 Slides / 季度假设' },
  description: {
    'en-US':
      'A print-studio review keeps an editable revenue model beside its decision narrative. Test channel volume and inspect sensitivity in the native workbook.',
    'zh-CN': '印刷工作室评审在决策叙事旁保留可编辑收入模型，修改渠道数量并在原生工作簿中检查敏感性。',
  },
  tags: {
    'en-US': ['Embed', 'Slides', 'Sheets', 'Float', 'Formulas'],
    'zh-CN': ['嵌入', '幻灯片', '表格', '浮动', '公式'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs/sheets',
    '@univerjs/sheets-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createPresentation()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FRange.setValue()',
    'FRange.getRawValue()',
    'FSlide.getShape()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Tamar reviews three different revenue lines before committing a print run. The first slide contains the real Channels workbook; two further slides explain unit economics and evidence gates. Plum, cream and mint support different narrative roles without changing official SDK chrome.',
      'zh-CN':
        'Tamar 在决定印量前评审三类收入。第一页包含真实 Channels 工作簿，后两页解释单位经济与证据门槛；紫、奶油与薄荷配色区分叙事角色，保留官方 SDK UI。',
    },
    tryIt: {
      'en-US': [
        'Activate the floating workbook on the first slide. Change direct-edition units in Channels!B5 from 1600 to 1800.',
        'Revenue becomes 49,680 and operating result becomes 13,932. The slide decision remains STILL OPEN.',
        'Use native Undo/Redo. Known integration issue: the fullscreen button currently does not open the workbook; Sensitivity navigation remains pending, not verified.',
        'Return to Slides and inspect the driver cards and evidence gates. Their figures describe the authored baseline, not live formula-linked shapes.',
      ],
      'zh-CN': [
        '激活第一页浮动工作簿，将 Channels!B5 的直销数量从 1600 改为 1800。',
        '收入变为 49,680，经营结果变为 13,932；幻灯片决策仍为 STILL OPEN。',
        '使用原生 Undo/Redo。已知集成问题：展开按钮目前未打开工作簿全屏，Sensitivity 导航仍待修复与验证。',
        '返回 Slides 查看渠道卡片及证据门槛；这些数值描述初始假设，不是公式联动的形状。',
      ],
    },
    expected: {
      'en-US':
        'The child recalculates while the presentation remains independent. This is a native floating drawing, not a tab or iframe. All content is fictional; no order, backend or Exchange conversion occurs. Reload loses edits. Full lifecycle, menus and performance acceptance remains open.',
      'zh-CN':
        '子工作簿重算，演示文稿保持独立。这是原生浮动对象，不是标签页或 iframe。内容均为虚构，不产生订单、后端请求或 Exchange 转换；刷新丢失修改。完整生命周期、菜单与性能仍待验收。',
    },
  },
  variants: [
    { id: 'review', label: { 'en-US': 'Review / Narrative beside a live model', 'zh-CN': '评审 / 叙事旁的实时模型' } },
    { id: 'drivers', label: { 'en-US': 'Drivers / Three different economics', 'zh-CN': '驱动 / 三类单位经济' } },
    { id: 'sensitivity', label: { 'en-US': 'Sensitivity / Volume under uncertainty', 'zh-CN': '敏感性 / 不确定需求' } },
  ],
  actions: [
    { id: 'edit', label: { 'en-US': 'Change units and recalculate', 'zh-CN': '修改数量并重算' } },
    { id: 'history', label: { 'en-US': 'Use native child Undo/Redo', 'zh-CN': '使用原生子单元撤销重做' } },
    { id: 'expand', label: { 'en-US': 'Fullscreen / Known integration issue', 'zh-CN': '全屏 / 已知集成问题' } },
  ],
  states: [
    { id: 'passive', label: { 'en-US': 'Read the quarterly review', 'zh-CN': '阅读季度评审' } },
    { id: 'active', label: { 'en-US': 'Edit the native workbook', 'zh-CN': '编辑原生工作簿' } },
    { id: 'error', label: { 'en-US': 'Source failure / Reload to retry', 'zh-CN': '资源失败 / 刷新重试' } },
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
