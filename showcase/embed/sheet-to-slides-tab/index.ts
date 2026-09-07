import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: {
    'en-US': 'Formula / Data-driven composition',
    'zh-CN': 'Formula / 数据驱动组合',
  },
  title: {
    'en-US': 'Nova / Live Operating Deck',
    'zh-CN': 'Nova / 实时经营演示',
  },
  description: {
    'en-US':
      'A native Sheet data page drives thirteen formulas across three operating-review slides: channel actuals, targets, attainment and exceptions.',
    'zh-CN': '原生 Sheet 数据页驱动三页经营演示中的十三个公式，展示渠道实际值、目标、达成率与未达标情况。',
  },
  tags: {
    'en-US': ['Formula', 'Sheets', 'Slides', 'Tab', 'Embed'],
    'zh-CN': ['公式', '表格', '幻灯片', '页签', '嵌入'],
  },
  packages: [
    '@univerjs-pro/slides',
    '@univerjs-pro/embed',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/shape-editor',
  ],
  apis: [
    {
      name: 'FShape.setFormula()',
    },
    {
      name: 'FShape.getFormulaResult()',
    },
    {
      name: 'FRange.setValue()',
    },
    {
      name: 'FRange.setValues()',
    },
    {
      name: 'FRange.clearContent()',
    },
    {
      name: 'FUniver.executeCommand()',
    },
  ],
  guide: {
    overview: {
      'en-US':
        'A fictional stationery collective reviews Retail, Partners and Online. Targets and actuals live in a real Sheet inserted into the native Slides page list. This SDK Tab composition is a full data page, not a Float or an invented bottom tab.',
      'zh-CN':
        '虚构文具品牌复盘零售、合作伙伴与线上渠道。目标和实际数据位于原生 Slides 页面列表中的真实 Sheet。这个 SDK Tab 组合是独立数据页，不是 Float，也不模拟底部页签。',
    },
    tryIt: {
      'en-US': [
        'Open Operating data in the native page list.',
        'Run all ten literal examples on the data page.',
        'Inspect Overview, Channels and Decision after each edit.',
        'Compare zero targets, blank actuals and invalid text, then recover.',
      ],
      'zh-CN': [
        '从原生页面列表打开 Operating data。',
        '在数据页执行十段原样代码。',
        '每次修改后查看总览、渠道比较和决策页。',
        '比较零目标、空白实际值与无效文本，然后恢复。',
      ],
    },
    expected: {
      'en-US':
        'Initial actual 73,500 / target 70,000 = 105%. Retail actual 35,000 raises the total to 77,000 and attainment to 110%. Ten examples pass selected checks; off-page source writes and exact Undo retain known SDK failures. See README.',
      'zh-CN':
        '初始实际值 73,500 / 目标 70,000 = 105%。零售实际改为 35,000 后，总实际变为 77,000、达成率 110%。十段示例通过定向检查；跨页面写入与精确撤销仍有 SDK 问题，详见 README。',
    },
  },
  variants: [
    {
      id: 'mix',
      label: {
        'en-US': 'Channel isolation / Whole-model aggregation',
        'zh-CN': '渠道隔离 / 整体汇总',
      },
    },
    {
      id: 'target',
      label: {
        'en-US': 'Actual changes / Independent target revisions',
        'zh-CN': '实际变化 / 独立目标调整',
      },
    },
    {
      id: 'missing',
      label: {
        'en-US': 'Zero / Blank / Invalid text',
        'zh-CN': '零值 / 空白 / 无效文本',
      },
    },
    {
      id: 'ratio',
      label: {
        'en-US': 'One zero target / All zero targets',
        'zh-CN': '单渠道零目标 / 所有目标归零',
      },
    },
  ],
  actions: [
    {
      id: 'edit',
      label: {
        'en-US': 'Edit native operating data',
        'zh-CN': '编辑原生经营数据',
      },
    },
    {
      id: 'review',
      label: {
        'en-US': 'Inspect all three result pages',
        'zh-CN': '检查三页结果',
      },
    },
    {
      id: 'restore',
      label: {
        'en-US': 'Restore baseline assumptions',
        'zh-CN': '恢复基线假设',
      },
    },
  ],
  states: [
    {
      id: 'live',
      label: {
        'en-US': 'Live linked results',
        'zh-CN': '实时联动结果',
      },
    },
    {
      id: 'error',
      label: {
        'en-US': 'Native errors / Recovery',
        'zh-CN': '原生错误 / 恢复',
      },
    },
    {
      id: 'failure',
      label: {
        'en-US': 'Source loading failure / Reload',
        'zh-CN': '来源加载失败 / 刷新',
      },
    },
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
