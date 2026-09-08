import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Bases host / Tab', 'zh-CN': 'Bases 宿主 / 标签' },
  title: {
    'en-US': 'Slides in Bases / Campaign Review',
    'zh-CN': 'Slides 嵌入 Bases / 活动评审',
  },
  description: {
    'en-US':
      'Open a four-page campaign review beside eight deliverables and three linked channels in a native Base tab.',
    'zh-CN': '在八项执行物料、三个关联渠道旁，以原生 Base 标签打开四页活动评审演示稿。',
  },
  tags: {
    'en-US': ['Embed', 'Bases', 'Slides', 'Tab', 'Campaign'],
    'zh-CN': ['嵌入', '多维表格', '演示文稿', '标签', '活动'],
  },
  packages: [
    '@univerjs-pro/bases',
    '@univerjs-pro/bases-ui',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createBase()',
    'EmbedCreationService.prepareCreateEmbed()',
    'EmbedHostRestoreService.materializeDescriptor()',
    'EmbedHostRestoreService.restoreEmbed()',
    'FShapeText.setRichText()',
    'FBaseRecord.setValue()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Avenue plans nine after-work art sessions and 72 seats across three studios. Eight deliverables share a CNY 9,600 budget across three channels. Four original slide layouts explain the invitation, allocation, learning sequence and readiness questions. These are fictional planning assumptions, not measured results.',
      'zh-CN':
        'Avenue 为三家艺术工作室规划九场下班后体验课、72 个席位。八项执行物料在三个渠道间分配 9,600 元预算。四页原创布局说明邀请、分配、学习步骤与准备问题。这些是虚构计划假设，不是实测结果。',
    },
    tryIt: {
      'en-US': [
        'Open Campaign review from the native Base sidebar and visit all four slide thumbnails.',
        'Run the slide README example; use native history, edit a title and move a shape.',
        'Return to Deliverables and run the Base example without changing the deck.',
        'Rename Studio partners in Channels and inspect its three linked labels; return to the deck and change theme.',
      ],
      'zh-CN': [
        '从 Base 原生侧栏打开 Campaign review，逐页查看四个缩略图。',
        '运行 README 幻灯片示例，使用原生历史、编辑标题并移动形状。',
        '返回 Deliverables 运行 Base 示例，演示稿应保持不变。',
        '在 Channels 重命名 Studio partners，检查三个关联标签；返回演示稿并切换主题。',
      ],
    },
    expected: {
      'en-US':
        'Native Slides Grid within a Base tab, with eight official stylesheets and no duplicate toolbar. Selected text/history, shape movement, linked-label, theme and disposal checks pass. Both models remain independent; full acceptance remains partial. No publication, backend or field synchronization. Reload loses edits; see README.',
      'zh-CN':
        'Base 标签内原生 Slides Grid，包含八份官方样式，不添加重复工具栏。选定的文字历史、形状移动、关联标签、主题和销毁检查已通过。两份模型相互独立，完整验收仍为部分覆盖。没有发布、后端或字段自动同步；刷新丢失修改，详见 README。',
    },
  },
  variants: [
    ['brief', 'Deep-ocean invitation / Coral accents', '深海蓝邀请 / 珊瑚色强调'],
    ['plan', 'Channel allocation / Three learning weeks', '渠道分配 / 三周学习步骤'],
    ['review', 'Readiness questions / Independent host records', '准备问题 / 独立宿主记录'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['open', 'Navigate the native slide thumbnails', '切换原生幻灯片缩略图'],
    ['edit', 'Edit text and shapes with native history', '编辑文字与形状并使用原生历史'],
    ['return', 'Change linked channel records independently', '独立修改关联渠道记录'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['host', 'Deliverables and channel plan', '执行物料与渠道计划'],
    ['child', 'Four-page campaign review', '四页活动评审'],
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
