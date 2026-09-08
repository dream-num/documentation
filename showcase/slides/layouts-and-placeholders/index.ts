import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'slides',
  previewHeight: 1040,
  category: 'features',
  image: '/assets/showcase/slides-layouts-and-placeholders.png',
  group: { 'en-US': 'Deck structure', 'zh-CN': '演示文稿结构' },
  title: { 'en-US': 'Layouts, Masters and Placeholder Placement', 'zh-CN': '布局、母版与占位符位置' },
  description: {
    'en-US':
      'Eight community-radio pages demonstrate seven authored layouts, inherited master identity and editable slide-owned placeholders without a host control panel.',
    'zh-CN': '八页社区电台内容展示七种自定义布局、母版品牌继承与可编辑页内占位符，不提供宿主控制面板。',
  },
  tags: { 'en-US': ['Slides', 'Single feature', 'Layout inheritance'], 'zh-CN': ['幻灯片', '单功能', '布局继承'] },
  packages: [
    '@univerjs/core',
    '@univerjs/design',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs/drawing',
    '@univerjs/engine-render',
    '@univerjs/ui',
    '@univerjs-pro/engine-shape',
    '@univerjs-pro/shape-editor-ui',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/license',
    '@univerjs-pro/slides-print',
  ],
  apis: [
    'FUniver.createPresentation()',
    'FUniver.getActivePresentation()',
    'FUniver.toggleDarkMode()',
    'FUniver.setUIVisible()',
    'FUniver.syncExecuteCommand()',
    'RichTextBuilder.span()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Aster is an original fictional community-radio season: four programs, twenty volunteers and twelve pilot episodes. Eight pages use seven authored layouts. The master owns the blue stripe and footer, each layout owns a pastel backdrop and placeholder defaults, and each populated slide owns its content. Placeholder matching uses type and index rather than element IDs. Preview and export share the factory, data and six official SDK stylesheets.',
      'zh-CN':
        'Aster 是原创虚构社区电台季度方案：四档节目、二十名志愿者和十二期试播。八页内容采用七种自定义布局。母版拥有蓝色品牌条与页脚，布局拥有浅色背景块和占位符默认内容，填充页面拥有实际文本。占位符按类型和序号而非元素 ID 匹配。预览和导出共用工厂、数据与六份官方 SDK 样式。',
    },
    tryIt: {
      'en-US': [
        'Browse all eight pages using native thumbnails. Compare the shared master identity with title, stacked, comparison, section, data, quote and closing arrangements.',
        'Select a slide-owned placeholder on the canvas and explore native movement or text editing. Use the native Undo/Redo controls after an edit.',
        'Open Format Background to explore native background controls. Master graphics visibility is a separate capability from changing the page fill.',
        'Open native Print settings; final print-output fidelity remains under verification.',
        'Edit a placeholder, commit by clicking outside its text editor, then switch the site theme. The preview keeps the same document and your edits.',
        'For source-level diagnostics, createData accepts broadcast, comparison, inherited and empty. layoutSlot resolves a matching slot, while rebuildLayout returns a detached snapshot. Neither is a native Apply Layout Facade; there is no hidden fixture toolbar.',
      ],
      'zh-CN': [
        '通过原生缩略图浏览八页。比较共同的母版品牌，以及标题、上下排列、比较、章节、数据、引用和结束页布局。',
        '在画布上选择页内占位符，探索原生移动或文本编辑。编辑后使用原生撤销重做。',
        '打开背景格式面板探索原生背景控件。母版图形可见性与页面填充是不同的能力。',
        '打开原生打印设置；最终打印输出保真度仍待验收。',
        '编辑占位符后点击文本编辑区域外提交，再切换站点主题；预览保留同一份文稿和已提交编辑。',
        '源码诊断可使用 createData 的 broadcast、comparison、inherited 和 empty 参数。layoutSlot 解析匹配位置，rebuildLayout 返回独立快照。两者都不是原生 Apply Layout Facade，也没有隐藏的 fixture 工具栏。',
      ],
    },
    expected: {
      'en-US':
        'The eight pages retain different content, notes and geometry while sharing the master. Transparent placeholders show the actual layout backdrop instead of white boxes. Slide-owned placement is explicitly copied from the matching layout in data.ts; automatic field-by-field geometry inheritance is not claimed. Native thumbnail navigation adds no Undo entry. Browser reload restores authored content. The old host reconstruction, Offset/Restore/Inspect and fixture buttons are removed. FROZEN_CLOCK is an authored reference date, not a frozen SDK clock. Native layout switching/reset, complete editing and accessibility, lifecycle fault paths and print fidelity remain unverified. Trial watermarks remain.',
      'zh-CN':
        '八页保留不同内容、备注和几何排版，同时共享母版。透明占位符显示实际布局背景，不再覆盖白色文本框。data.ts 明确从匹配布局复制页内位置，不宣称逐字段自动继承。原生缩略图导航不产生撤销记录；刷新浏览器恢复初始内容。旧的宿主重建、偏移、恢复、Inspect 和 fixture 按钮均已删除。FROZEN_CLOCK 只是案例参考日期，不是冻结 SDK 时钟。原生布局切换与重置、完整编辑和无障碍、生命周期异常及打印保真度仍待验收，保留试用水印。',
    },
  },
  variants: [
    ['title', 'Opening title / Warm cream', '开场标题 / 暖奶油色'],
    ['briefing', 'Stacked briefing / Mint', '上下排列 / 薄荷绿'],
    ['comparison', 'Side-by-side / Ice blue', '并排比较 / 冰蓝'],
    ['section', 'Section opener / Lilac', '章节开场 / 丁香紫'],
    ['data', 'Pilot interpretation / Soft blue', '试播解读 / 浅蓝'],
    ['quote', 'Volunteer quotation / Rose', '志愿者引用 / 玫瑰色'],
    ['closing', 'Closing checklist / Sage', '结束清单 / 鼠尾草绿'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['navigate', 'Native thumbnails', '原生缩略图'],
    ['edit', 'Native placeholder editing', '原生占位符编辑'],
    ['history', 'Native Undo / Redo', '原生撤销 / 重做'],
    ['background', 'Native Format Background', '原生背景格式'],
    ['print', 'Native Print settings', '原生打印设置'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['default', 'Eight populated pages', '八页填充内容'],
    ['edited', 'Native content or placement edits', '原生内容或位置编辑'],
    ['diagnostic', 'Inherited / empty source-level data', '源码级继承与空数据诊断'],
    ['limitation', 'Native layout switching remains unverified', '原生布局切换仍待验收'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
