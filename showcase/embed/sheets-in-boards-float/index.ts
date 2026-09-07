import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Boards host / Float', 'zh-CN': 'Boards 宿主 / 浮动' },
  title: { 'en-US': 'Sheets in Boards / Workshop Budget', 'zh-CN': 'Sheets 嵌入 Boards / 工作坊预算' },
  description: {
    'en-US':
      'Plan a repair workshop with activity cards and a native floating eight-line budget, reserve scenarios and independent editing.',
    'zh-CN': '在修缮工作坊白板旁编辑八项预算，比较预备金方案，保持两个产品的数据独立。',
  },
  tags: {
    'en-US': ['Embed', 'Boards', 'Sheets', 'Float', 'Budget'],
    'zh-CN': ['嵌入', '白板', '表格', '浮动', '预算'],
  },
  packages: [
    '@univerjs-pro/boards',
    '@univerjs-pro/boards-ui',
    '@univerjs/sheets',
    '@univerjs/sheets-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createBoard()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FRange.setValue()',
    'FShapeText.setText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Ripple plans a fictional 24-person repair workshop: listen, practice and share. Eight cost lines and reserve scenarios sit inside a native BoardFloating Sheet, not an iframe. Notes and calculations are independent.',
      'zh-CN':
        'Ripple 是虚构的 24 人修缮工作坊，按倾听、实践、分享组织活动。原生 BoardFloating 表格包含八项成本与预备金方案，不使用 iframe，文案与计算相互独立。',
    },
    tryIt: {
      'en-US': [
        'Double-click the budget to activate its native editor.',
        'Run the workbook README example and inspect costs, reserve and room remaining.',
        'Try native Undo/Redo and compare rates in Sensitivity.',
        'Return to the Board and edit the pending access-support decision.',
      ],
      'zh-CN': [
        '双击预算以激活原生编辑器。',
        '运行 README 表格示例，查看成本、预备金和剩余额度。',
        '尝试原生撤销重做，在 Sensitivity 中比较不同预备金率。',
        '返回白板，编辑待确认的无障碍支持事项。',
      ],
    },
    expected: {
      'en-US':
        'Eight distinct costs, two worksheets and meaningful workshop notes. Selected native editing/history, fullscreen, reserve navigation and print-preview checks pass with official CSS. No fixture panel, fake synchronization, backend, booking or Exchange conversion; see README for remaining limits.',
      'zh-CN':
        '八项不同成本、两个工作表及具体工作坊记录；已通过选定的原生编辑、撤销重做、全屏、预备金导航和打印预览检查，包含官方 CSS。没有 fixture 面板、伪同步、后端、预约或 Exchange 转换；剩余限制详见 README。',
    },
  },
  variants: [
    ['base', 'Eight costs / 10% reserve', '八项成本 / 10% 预备金'],
    ['spares', 'Six extra material kits', '六套备用材料'],
    ['reserve', '5%, 10% and 20% reserve', '5%、10% 与 20% 预备金'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit the native budget', '编辑原生预算'],
    ['compare', 'Compare reserve scenarios', '比较预备金方案'],
    ['note', 'Update the Board decision independently', '独立更新白板事项'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['passive', 'Budget beside the workshop plan', '工作坊旁的预算'],
    ['active', 'Active worksheet editing', '激活工作表编辑'],
    ['error', 'Source failure / Reload to retry', '资源失败 / 刷新重试'],
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
