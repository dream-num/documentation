import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'showcases',
  previewHeight: 1100,
  group: { 'en-US': 'Sheets host / Mixed', 'zh-CN': 'Sheets 宿主 / 综合嵌入' },
  title: { 'en-US': 'Harbor / Operations Decision Room', 'zh-CN': 'Harbor / 运营决策工作台' },
  description: {
    'en-US':
      'A reading-room pilot combines a live budget, floating briefing, supplier Base, decision memo and delivery Board in one native workspace.',
    'zh-CN': '阅读活动试点将实时预算、浮动简报、供应商 Base、决策说明和交付 Board 组合在同一原生工作区。',
  },
  tags: {
    'en-US': ['Embed', 'Sheets', 'Docs', 'Slides', 'Bases', 'Boards', 'Mixed'],
    'zh-CN': ['嵌入', '表格', '文档', '幻灯片', '多维表格', '白板', '综合'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs/sheets-ui',
    '@univerjs/docs-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/boards-ui',
    '@univerjs-pro/bases-ui',
  ],
  apis: [
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FRange.setValue()',
    'FDocumentParagraph.appendText()',
    'FBaseTableRecord.setValue()',
    'FShapeText.setText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Four weekends, eight reading sessions and 96 planned places form an original fictional pilot. One workbook owns four independently editable children. The briefing is a Float; the memo, supplier register and delivery workflow are separate native Tabs.',
      'zh-CN':
        '原创虚构试点包含 4 个周末、8 场阅读活动和 96 个计划名额。一份工作簿拥有四个独立可编辑子文档：简报使用 Float，说明、供应商登记和交付流程使用原生 Tab。',
    },
    tryIt: {
      'en-US': [
        'Change Reading kits quantity in B7 and inspect the envelope and headroom.',
        'Activate the floating briefing and navigate its three pages.',
        'Open each native tab; edit a supplier note, memo paragraph and workflow card.',
        'Return to Pilot budget and confirm that the workbook retained its values.',
      ],
      'zh-CN': [
        '修改 B7 的 Reading kits 数量，检查预算和余额。',
        '激活浮动简报并切换三张幻灯片。',
        '打开各原生 Tab，编辑供应商备注、说明段落和流程卡片。',
        '返回 Pilot budget，确认工作簿数值保留。',
      ],
    },
    expected: {
      'en-US':
        'Budget formulas recalculate locally. Selected native navigation, four literal examples, five-model history isolation, Board typing and export checks pass. Child edits remain independent; this is not Formula Shape, Formula CustomRange or an approval system. Full acceptance remains open; see README.',
      'zh-CN':
        '预算公式在本地重算。选定原生导航、四段原样示例、五文档历史隔离、Board 输入和导出检查通过。各子文档编辑独立；这不是 Formula Shape、Formula CustomRange 或审批系统。完整验收仍未完成，详见 README。',
    },
  },
  variants: [
    ['float', 'Briefing beside the budget', '预算旁的浮动简报'],
    ['tabs', 'Memo, supplier and workflow tabs', '说明、供应商与流程 Tab'],
    ['ownership', 'One host / Four independent children', '一个宿主 / 四个独立子文档'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['budget', 'Recalculate the pilot envelope', '重算试点预算'],
    ['children', 'Edit the appropriate native child', '编辑对应原生子文档'],
    ['switch', 'Switch tabs and retain edits', '切换 Tab 并保留编辑'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['reading', 'Read budget and briefing together', '同时阅读预算和简报'],
    ['editing', 'Edit one child at a time', '逐个编辑子文档'],
    ['failure', 'Source failure / Reload to retry', '资源失败 / 刷新重试'],
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
