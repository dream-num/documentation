import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Slides host / Float', 'zh-CN': 'Slides 宿主 / 浮动嵌入' },
  title: {
    'en-US': 'Bases in Slides / Delivery Readiness',
    'zh-CN': 'Bases 嵌入 Slides / 交付就绪评审',
  },
  description: {
    'en-US':
      'Keep seven release checks and three suppliers editable beside a reading-light delivery review, inside a native floating Base.',
    'zh-CN': '在便携阅读灯交付评审旁，以原生浮动 Base 编辑七项放行检查和三家供应商。',
  },
  tags: {
    'en-US': ['Embed', 'Slides', 'Bases', 'Float', 'Readiness'],
    'zh-CN': ['嵌入', '幻灯片', '多维表格', '浮动', '就绪评审'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/bases',
    '@univerjs-pro/bases-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createPresentation()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FBase.getTableById()',
    'FBaseRecord.setValue()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Solstice keeps the review narrative visible while a native floating Base owns the checks, risk states and supplier links. Aubergine, pale yellow and mist blue distinguish decision context from evidence. This is a Float case, not the separate Base Tab example.',
      'zh-CN':
        'Solstice 保留评审叙事，同时由原生浮动 Base 管理检查、风险状态和供应商关联。深紫、浅黄和雾蓝区分决策背景与证据。这是 Float 案例，不是独立 Base Tab 示例。',
    },
    tryIt: {
      'en-US': [
        'Double-click the floating register on Delivery readiness. Inspect seven checks with different sample counts, owners, review dates and evidence.',
        'Edit Enclosure finish in the native Base, or run the README Facade example. The floating Undo/Redo and fullscreen controls currently fail runtime gates; do not assume they restore edits.',
        'Scroll inside the register to inspect evidence. Use the second README example to rename Alder Moulding to Alder Works: two linked labels should follow the same record ID. The compact float has no table tabs; the supplier directory is a source-level displayTarget variant.',
        'Visit Quality handoffs and Review boundary in the native slide list, then return to Delivery readiness. Theme changes should preserve local edits.',
      ],
      'zh-CN': [
        '双击 Delivery readiness 上的浮动表，查看七项检查及不同样品数量、负责人、审查日期和证据。',
        '在原生 Base 编辑 Enclosure finish，或运行 README 中的 Facade 示例。浮动菜单撤销重做和全屏当前未通过运行验收，不应假定它们能够恢复编辑。',
        '在表内滚动查看证据；使用 README 第二段示例将 Alder Moulding 改为 Alder Works，两条关联名称应跟随同一记录 ID。紧凑浮动视图没有表标签，供应商目录通过源码 displayTarget 变体展示。',
        '用原生页面列表查看质量交接和评审边界页，再返回 Delivery readiness；切换主题应保留局部编辑。',
      ],
    },
    expected: {
      'en-US':
        'The Base is a native slide floating object, not an iframe or host form. Child edits and history are separate from the presentation. Native fullscreen and floating-menu behavior remain explicit runtime gates: an unresolved beta.2 Slides Float issue must not be hidden by replacement controls. No backend, messages, orders, approval, product-safety certification, Exchange conversion or persistence is provided. Reload resets data; full acceptance is in progress.',
      'zh-CN':
        'Base 是幻灯片原生浮动对象，不是 iframe 或宿主表单；子单元编辑与历史独立于演示文稿。原生全屏与浮动菜单是明确验收项：不能用替代按钮隐藏 beta.2 Slides Float 的未解决问题。不提供后端、消息、订单、审批、安全认证、Exchange 转换或持久化；刷新恢复初始数据，完整验收仍在进行。',
    },
  },
  variants: [
    { id: 'checks', label: { 'en-US': 'Seven checks / Three risk states', 'zh-CN': '七项检查 / 三种风险状态' } },
    { id: 'suppliers', label: { 'en-US': 'Three suppliers / Linked evidence', 'zh-CN': '三家供应商 / 关联证据' } },
    { id: 'narrative', label: { 'en-US': 'Three slides / Independent narrative', 'zh-CN': '三页幻灯片 / 独立叙事' } },
  ],
  actions: [
    { id: 'activate', label: { 'en-US': 'Activate the native float', 'zh-CN': '激活原生浮动对象' } },
    { id: 'edit', label: { 'en-US': 'Edit checks and use native history', 'zh-CN': '编辑检查并使用原生历史' } },
    {
      id: 'navigate',
      label: { 'en-US': 'Inspect suppliers and return to the story', 'zh-CN': '查看供应商并返回叙事' },
    },
  ],
  states: [
    { id: 'host', label: { 'en-US': 'Presentation review', 'zh-CN': '演示文稿评审' } },
    { id: 'child', label: { 'en-US': 'Active supplier Base', 'zh-CN': '激活的供应商 Base' } },
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
