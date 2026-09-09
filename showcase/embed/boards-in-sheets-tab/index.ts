import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  image: '/assets/showcase/embed-boards-in-sheets-tab.png',
  previewHeight: 1040,
  group: { 'en-US': 'Sheets host / Tab', 'zh-CN': 'Sheets 宿主 / 标签嵌入' },
  title: { 'en-US': 'Board in Sheets / Incident Review Tab', 'zh-CN': 'Board 嵌入 Sheets / 事故复盘标签' },
  description: {
    'en-US':
      'An incident-cost workbook opens a native Board tab with a recovery timeline, a cause hypothesis and owned follow-ups.',
    'zh-CN': '事故成本工作簿内置原生 Board 标签，展示恢复时间线、待确认原因与有责任人的改进事项。',
  },
  tags: { 'en-US': ['Embed', 'Sheets', 'Boards', 'Tab'], 'zh-CN': ['嵌入', '表格', '白板', '标签'] },
  packages: [
    '@univerjs/core',
    '@univerjs/sheets-ui',
    '@univerjs-pro/boards',
    '@univerjs-pro/boards-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createWorkbook()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FUniver.getBoard()',
    'FBoard.getShape()',
    'FShapeText.setText()',
    'FRange.setValue()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Ember models a fictional 34-minute checkout incident. Six exposure and response lines yield a $7,190 estimate plus a 15% reserve: $8,268.50. The independent Incident timeline tab contains four recovery milestones, one unconfirmed cause and two owned actions. Terracotta, cream, muted blue and sage distinguish the story; native SDK chrome stays unchanged.',
      'zh-CN':
        'Ember 以虚构的 34 分钟结算服务故障为背景。六项影响与响应成本估算为 7,190 美元，加上 15% 储备后为 8,268.50 美元。独立 Incident timeline 标签包含四个恢复节点、一个待确认原因和两项有责任人的行动。内容采用陶土、奶油、灰蓝与鼠尾草绿，保留 SDK 原生界面。',
    },
    tryIt: {
      'en-US': [
        'Review six assumptions in Loss estimate; quantities are highlighted in cream.',
        'Select Incident timeline in the native sheet bar. Edit or reposition a Board card using native controls.',
        'Return to Loss estimate and change B5 from 340 to 400. The planning envelope increases; Board edits remain independent.',
        'Open Review gates to see the linked estimate and unresolved closure evidence.',
      ],
      'zh-CN': [
        '在 Loss estimate 查看六项假设，数量单元格以奶油色标注。',
        '从原生工作表栏选择 Incident timeline，使用原生操作编辑或移动 Board 卡片。',
        '返回 Loss estimate，把 B5 从 340 改为 400；规划金额增加，Board 修改保持独立。',
        '打开 Review gates，查看关联成本与未完成的关闭证据。',
      ],
    },
    expected: {
      'en-US':
        'SheetTab is a native peer tab, not a floating overlay or iframe. Switching tabs should preserve the local Board. Recovery does not confirm the root cause or approve closure. All data is fictional, reload loses edits, and this case provides no backend or Exchange/Print conversion. Boundary, lifecycle, accessibility and performance acceptance remain open.',
      'zh-CN':
        'SheetTab 是原生同级标签，不是浮层或 iframe。切换标签应保留本地 Board。服务恢复不代表原因确认或批准关闭。数据均为虚构，刷新丢失修改；不提供后端或 Exchange/Print 转换。边界、生命周期、可访问性与性能仍待验收。',
    },
  },
  variants: [
    { id: 'cost', label: { 'en-US': 'Exposure estimate / Terracotta and cream', 'zh-CN': '影响估算 / 陶土与奶油色' } },
    {
      id: 'timeline',
      label: { 'en-US': 'Incident timeline / Native Board tab', 'zh-CN': '故障时间线 / 原生 Board 标签' },
    },
    { id: 'gates', label: { 'en-US': 'Review gates / Recovery is not closure', 'zh-CN': '复核关卡 / 恢复不等于关闭' } },
  ],
  actions: [
    { id: 'navigate', label: { 'en-US': 'Switch native workbook tabs', 'zh-CN': '切换原生工作簿标签' } },
    { id: 'edit', label: { 'en-US': 'Edit independent incident cards', 'zh-CN': '编辑独立事故卡片' } },
    { id: 'recalculate', label: { 'en-US': 'Recalculate exposure assumptions', 'zh-CN': '重算影响假设' } },
  ],
  states: [
    { id: 'host', label: { 'en-US': 'Cost and review worksheets', 'zh-CN': '成本与复核工作表' } },
    { id: 'child', label: { 'en-US': 'Native Incident timeline tab', 'zh-CN': '原生事故时间线标签' } },
    { id: 'error', label: { 'en-US': 'Source failure / reload to retry', 'zh-CN': '资源失败 / 刷新重试' } },
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
