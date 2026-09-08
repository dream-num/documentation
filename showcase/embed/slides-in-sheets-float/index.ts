import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/embed-slides-in-sheets-float.png',
  product: 'embed',
  previewHeight: 960,
  category: 'features',
  group: { 'en-US': 'Sheets host / Float', 'zh-CN': 'Sheets 宿主 / 浮动嵌入' },
  title: { 'en-US': 'Slides in Sheets / Floating Decision Brief', 'zh-CN': 'Slides 嵌入 Sheets / 浮动决策简报' },
  description: {
    'en-US':
      'Review a community-ferry budget beside its editable two-slide decision brief, using a native Sheets floating anchor.',
    'zh-CN': '在社区渡轮预算旁查看并编辑两页决策简报，使用原生 Sheets 浮动锚点。',
  },
  tags: { 'en-US': ['Embed', 'Sheets', 'Slides', 'Float'], 'zh-CN': ['嵌入', '表格', '幻灯片', '浮动'] },
  packages: [
    '@univerjs/core',
    '@univerjs/sheets',
    '@univerjs/sheets-ui',
    '@univerjs/sheets-drawing',
    '@univerjs/sheets-drawing-ui',
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
    'FEmbed.setDisplayTarget()',
    'FEmbed.remove()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Harbor is an original fictional community-ferry proposal. Twelve monthly operating costs total $29,700; the adjacent presentation explains the launch decision and review criteria. Sheets Drawing owns the floating container. A local resource provider creates the real Slides child; no iframe, screenshot or server conversion stands in for embedding. The source imports eleven official SDK stylesheets.',
      'zh-CN':
        'Harbor 是原创虚构社区渡轮方案。十二项月度运营成本合计 $29,700，旁边的演示文稿说明启动决策和复盘标准。浮动容器由 Sheets Drawing 管理，本地资源提供器创建真实 Slides 子单元，不使用 iframe、截图或服务端转换代替嵌入。源码导入十一份官方 SDK 样式。',
    },
    tryIt: {
      'en-US': [
        'Double-click the floating presentation to enter its native interaction mode.',
        'Use the native floating page controls to compare the navy decision slide with the mint review slide.',
        'Edit budget cells in the host. The SUM total recalculates; presentation prose is deliberately independent, not a Formula Shape.',
        'Inspect create-demo.ts for the local resource provider and native SheetFloating placement. Reload to restore the original story.',
      ],
      'zh-CN': [
        '双击浮动演示文稿，进入原生交互模式。',
        '使用原生浮动翻页控件，比较深蓝决策页与薄荷绿复盘页。',
        '编辑宿主预算单元格，SUM 合计随之计算。演示文稿文字刻意独立，不是 Formula Shape。',
        '在 create-demo.ts 中查看本地资源提供器和 SheetFloating 定位，刷新恢复原始案例。',
      ],
    },
    expected: {
      'en-US':
        'The host budget and child deck are distinct live units. This case demonstrates Float only; Tab and linked formulas are separate cases. Independent production export, official CSS, native navigation, Facade edits and selected disposal checks pass. Trial watermarks remain. Native full-screen, keyboard editing/history ownership, touch/accessibility, persistence, failure recovery and bundle performance require further acceptance. No Exchange or Print capability is claimed by this case.',
      'zh-CN':
        '宿主预算和子演示文稿是两个独立实时单元。本例只演示 Float，Tab 和关联公式属于独立案例。独立生产导出、官方 CSS、原生翻页、Facade 修改和选定销毁检查已通过。保留试用水印。原生全屏、键盘编辑与撤销归属、触屏及无障碍、持久化、故障恢复和包体性能仍需进一步验收。本例不宣称支持 Exchange 或 Print。',
    },
  },
  variants: [
    { id: 'decision', label: { 'en-US': 'Launch decision / Deep Ocean', 'zh-CN': '启动决策 / 深海蓝' } },
    { id: 'review', label: { 'en-US': 'Service review / Mint', 'zh-CN': '服务复盘 / 薄荷绿' } },
  ],
  actions: [
    { id: 'activate', label: { 'en-US': 'Enter native child interaction', 'zh-CN': '进入原生子单元交互' } },
    { id: 'navigate', label: { 'en-US': 'Navigate the native floating deck', 'zh-CN': '原生浮动文稿翻页' } },
    { id: 'budget', label: { 'en-US': 'Edit the host budget', 'zh-CN': '编辑宿主预算' } },
  ],
  states: [
    { id: 'default', label: { 'en-US': 'Budget and decision brief', 'zh-CN': '预算与决策简报' } },
    { id: 'active', label: { 'en-US': 'Native child interaction', 'zh-CN': '原生子单元交互' } },
    { id: 'error', label: { 'en-US': 'Source loading failure / reload to retry', 'zh-CN': '资源加载失败 / 刷新重试' } },
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
