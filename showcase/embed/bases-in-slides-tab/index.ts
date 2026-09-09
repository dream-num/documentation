import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1000,
  group: { 'en-US': 'Slides host / Tab', 'zh-CN': 'Slides 宿主 / 页面嵌入' },
  title: {
    'en-US': 'Bases in Slides / Launch Workstream',
    'zh-CN': 'Bases 嵌入 Slides / 上市工作流',
  },
  description: {
    'en-US':
      'A retail pilot deck opens a native Base page with ten workstreams linked to four sales channels. Review evidence without leaving the presentation.',
    'zh-CN': '零售试点演示文稿以原生 Bases 页面呈现十条工作流和四个关联渠道，在演示文稿内审查证据。',
  },
  tags: {
    'en-US': ['Embed', 'Slides', 'Bases', 'Tab', 'Retail'],
    'zh-CN': ['嵌入', '幻灯片', '多维表格', '页面', '零售'],
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
    'EmbedCreationService.prepareCreateEmbed()',
    'EmbedHostRestoreService.materializeDescriptor()',
    'EmbedHostRestoreService.restoreEmbed()',
    'FBase.getTableById()',
    'FBaseRecord.setValue()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Copper separates the launch narrative from the live workstream register. Native Slides pages frame the channel strategy and decision gate; page two is a real two-table Base. Copper, warm ivory and blue-gray give each part a different visual role while official SDK controls remain intact.',
      'zh-CN':
        'Copper 将上市叙事与工作流登记表分开。原生 Slides 页面说明渠道策略和决策条件，第二页是真正的双表 Base。铜色、暖白和灰蓝区分内容，保留官方 SDK 控件。',
    },
    tryIt: {
      'en-US': [
        'Open Launch workstream in the native page list. Workstreams contains ten different checks, with evidence and review dates.',
        'Edit Counter demonstration in the native Base. Use Undo and Redo; narrative slides should not change.',
        'Open Channels and rename Harbor Home to Harbor Refill. Return to Workstreams: three linked channel labels should update without replacing their record IDs.',
        'Visit Channel design and Review gate, then return to the Base. The local edits remain. Changing theme should also keep the current model.',
      ],
      'zh-CN': [
        '在原生页面列表打开 Launch workstream，Workstreams 包含十项不同检查及证据、审查日期。',
        '在原生 Base 中编辑 Counter demonstration，再使用 Undo 和 Redo；叙事幻灯片不应改变。',
        '打开 Channels，将 Harbor Home 改为 Harbor Refill，再返回 Workstreams；三条关联渠道名称应更新，记录 ID 保持不变。',
        '查看渠道设计和决策条件页面，再返回 Base，局部编辑应保留；切换主题也应保持当前模型。',
      ],
    },
    expected: {
      'en-US':
        'The Base occupies its own native Slides page, not an inline float or iframe. Its table navigation, record editing and history belong to the child. Narrative slides are independent, not formula-linked. All data is fictional; no orders, approvals, messages, backend or persistence are provided. Reload restores the original data. Full acceptance remains in progress.',
      'zh-CN':
        'Base 占据独立原生 Slides 页面，不是浮动对象或 iframe。表切换、记录编辑与撤销历史属于子单元。叙事幻灯片保持独立，没有公式联动。所有数据均为虚构，不提供下单、审批、消息、后端或持久化；刷新恢复初始数据。完整验收仍在进行。',
    },
  },
  variants: [
    { id: 'narrative', label: { 'en-US': 'Narrative / Channel strategy', 'zh-CN': '叙事 / 渠道策略' } },
    { id: 'workstreams', label: { 'en-US': 'Workstreams / Ten different checks', 'zh-CN': '工作流 / 十项不同检查' } },
    { id: 'channels', label: { 'en-US': 'Channels / Linked record labels', 'zh-CN': '渠道 / 关联记录名称' } },
  ],
  actions: [
    {
      id: 'open',
      label: { 'en-US': 'Open the native Base page', 'zh-CN': '打开原生 Base 页面' },
    },
    { id: 'edit', label: { 'en-US': 'Edit records with native Undo/Redo', 'zh-CN': '编辑记录并使用原生撤销重做' } },
    { id: 'rename', label: { 'en-US': 'Rename a linked channel', 'zh-CN': '重命名关联渠道' } },
  ],
  states: [
    { id: 'host', label: { 'en-US': 'Read the launch story', 'zh-CN': '阅读上市叙事' } },
    { id: 'child', label: { 'en-US': 'Review live workstream records', 'zh-CN': '审查工作流记录' } },
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
