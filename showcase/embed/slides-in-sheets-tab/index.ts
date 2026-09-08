import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/embed-slides-in-sheets-tab.png',
  product: 'embed',
  category: 'features',
  previewHeight: 960,
  group: { 'en-US': 'Sheets host / Tab', 'zh-CN': 'Sheets 宿主 / 标签嵌入' },
  title: { 'en-US': 'Slides in Sheets / Board Review Tab', 'zh-CN': 'Slides 嵌入 Sheets / 董事会审议标签' },
  description: {
    'en-US':
      'A community arts centre reviews a monthly cost ledger, a three-page decision deck and its assumptions in separate native workbook tabs.',
    'zh-CN': '社区艺术中心在原生工作簿标签中分别查看月度费用台账、三页决策文稿及假设说明。',
  },
  tags: { 'en-US': ['Embed', 'Sheets', 'Slides', 'Tab'], 'zh-CN': ['嵌入', '表格', '幻灯片', '标签'] },
  packages: [
    '@univerjs/core',
    '@univerjs/sheets',
    '@univerjs/sheets-ui',
    '@univerjs/sheets-numfmt-ui',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createWorkbook()',
    'FUniver.createPresentation()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FEmbed.getDescriptor()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Marigold is an original fictional community arts centre. Its October plan is $42,000 and actual spend is $42,480. The review proposes moving $450 from operating reserve to live captioning. Board review is a real SheetTab embed inserted between Cost ledger and Assumptions: the Slides child occupies the main content region rather than floating over cells. All navigation uses the SDK UI; there is no external tab bar, fixture panel or iframe substitute.',
      'zh-CN':
        'Marigold 是原创虚构社区艺术中心。十月计划费用 $42,000，实际 $42,480，审议提案将 $450 运营储备转至实时字幕。Board review 是插入 Cost ledger 和 Assumptions 之间的真实 SheetTab 嵌入，Slides 子单元占据主内容区而非浮在单元格上方。全部导航使用 SDK UI，没有外部标签栏、fixture 面板或 iframe 替代。',
    },
    tryIt: {
      'en-US': [
        'Open Board review using the native bottom tab. Browse the cream overview, lilac cost analysis and coral decision pages.',
        'Edit text in the actual slide. Return to Cost ledger, change a cost, then return to the deck.',
        'Check Assumptions for scope, variance sign and the pending approval. Deck figures are authored narrative, not automatically linked formulas.',
        'Inspect create-demo.ts: SheetTab with sheetIndex 1 and sheetName Board review creates the native anchor; the local provider resolves its child.',
      ],
      'zh-CN': [
        '点击底部原生 Board review 标签，浏览奶油色概览、丁香紫成本分析与珊瑚色决策页。',
        '在实际幻灯片中编辑文本，再回到 Cost ledger 修改费用并返回文稿。',
        '查看 Assumptions 中的范围、差额方向和待审批事项。演示数字是编写的叙述，不是自动关联公式。',
        '查看 create-demo.ts：SheetTab 的 sheetIndex 为 1，sheetName 为 Board review，本地资源提供器解析真实子单元。',
      ],
    },
    expected: {
      'en-US':
        'Host and child keep separate editable state. Earlier selected checks cover native tabs, three page palettes, native Undo/Redo after a Facade text edit and host recalculation. Current independent export starts in English on either host language. This is not full native keyboard editing, persistence, failure recovery, lifecycle, narrow-layout or performance acceptance. Reload restores authored data; trial watermarks remain. Float and cross-unit formulas are separate cases. Exchange and Print are not registered.',
      'zh-CN':
        '宿主和子单元保持独立可编辑状态。早期选定检查覆盖原生标签、三页配色、Facade 文本编辑后的原生撤销重做和宿主重算；当前独立导出在两种宿主语言下均以英文启动。这不是完整键盘编辑、持久化、故障恢复、生命周期、窄屏或性能验收。刷新恢复原始数据，保留试用水印。Float 和跨单元公式另有案例，本例未注册 Exchange 或 Print。',
    },
  },
  variants: [
    { id: 'overview', label: { 'en-US': 'Purpose / Cream and gold', 'zh-CN': '目标 / 奶油金' } },
    { id: 'costs', label: { 'en-US': 'Cost analysis / Lilac', 'zh-CN': '成本分析 / 丁香紫' } },
    { id: 'decision', label: { 'en-US': 'Approval request / Coral', 'zh-CN': '审批提案 / 珊瑚色' } },
  ],
  actions: [
    { id: 'tabs', label: { 'en-US': 'Switch native host tabs', 'zh-CN': '切换原生宿主标签' } },
    { id: 'slides', label: { 'en-US': 'Browse native slide thumbnails', 'zh-CN': '浏览原生幻灯片缩略图' } },
    { id: 'edit', label: { 'en-US': 'Edit the host and child independently', 'zh-CN': '独立编辑宿主和子单元' } },
  ],
  states: [
    { id: 'ledger', label: { 'en-US': 'Native cost worksheet', 'zh-CN': '原生费用工作表' } },
    { id: 'deck', label: { 'en-US': 'Embedded Slides tab', 'zh-CN': '嵌入的 Slides 标签' } },
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
