import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Slides host / Tab', 'zh-CN': 'Slides 宿主 / 白板页' },
  title: { 'en-US': 'Boards in Slides / Retrospective Tab', 'zh-CN': 'Boards 嵌入 Slides / 复盘白板标签' },
  description: {
    'en-US':
      'Switch from a facilitation deck to a full native Board page for nine editable observations and three visual themes.',
    'zh-CN': '从引导幻灯片切换到完整原生白板页，编辑九张观察卡片并探索三个视觉分组。',
  },
  tags: {
    'en-US': ['Embed', 'Slides', 'Boards', 'Tab', 'Retrospective'],
    'zh-CN': ['嵌入', '幻灯片', '白板', '标签', '复盘'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/boards',
    '@univerjs-pro/boards-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createPresentation()',
    'EmbedCreationService.prepareCreateEmbed()',
    'EmbedHostRestoreService.materializeDescriptor()',
    'EmbedHostRestoreService.restoreEmbed()',
    'FBoard.getShape()',
    'FShapeText.setText()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Kite is a fictional 45-minute volunteer retrospective: seven contributors, nine authored observations and three proposed experiments. A native Board page sits between kickoff and follow-up slides. Move and edit its shape cards using official tools; no fixture panel or duplicate toolbar is added.',
      'zh-CN':
        'Kite 是虚构的 45 分钟志愿者复盘：七位参与者、九张原创观察卡片和三个拟议实验。原生白板页位于开场与后续行动幻灯片之间。通过官方工具移动、编辑形状卡片，不添加通用测试面板或重复工具栏。',
    },
    tryIt: {
      'en-US': [
        'Open Retrospective Board from the native page list. Compare Keep, Change and Try notes.',
        'Edit Buddy trial and click outside to commit, or run the first README example. Native typing may require several Undo/Redo steps; Escape cancels editing.',
        'Select a note and move it with the native pointer or arrow keys. Columns are visual groupings, not automated fields.',
        'Return to the experiment slides, run the host README example, then switch theme and revisit the edited Board.',
      ],
      'zh-CN': [
        '从原生页面列表打开 Retrospective Board，对比 Keep、Change、Try 卡片。',
        '编辑 Buddy trial 并点击外部提交，或运行 README 第一段示例。原生输入可能需要多步撤销重做；Escape 会取消编辑。',
        '选择卡片并通过原生指针或方向键移动；列是视觉分组，不是自动更新的字段。',
        '返回实验幻灯片，运行宿主 README 示例，然后切换主题并回到已编辑白板。',
      ],
    },
    expected: {
      'en-US':
        'A real Slides page-list Board, not Float, an iframe or an image. Host slides use Grid; the Board uses its own native tools. Cards are editable shapes, not a voting app or task backend. Slide commitments are independent, not formula-linked. Native theme following may regenerate the Board palette but must preserve authored content. Reload restores initial data. Full runtime acceptance is in progress; see README.',
      'zh-CN':
        '真正的 Slides 页面列表白板，不是 Float、iframe 或图片。宿主幻灯片使用 Grid，白板使用自己的原生工具。卡片是可编辑形状，不是投票应用或任务后端。幻灯片承诺独立，不使用公式关联。原生主题跟随可能重新生成白板色表，但必须保留编写内容。刷新恢复初始数据；完整运行验收仍在进行，详见 README。',
    },
  },
  variants: [
    ['kickoff', '45-minute facilitation / Seven contributors', '45 分钟引导 / 七位参与者'],
    ['retro', 'Nine observations / Keep, change, try', '九张观察卡片 / 保留、改变、尝试'],
    ['follow-up', 'Three experiments / Two-week check-in', '三个实验 / 两周后回顾'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['open', 'Open the full native Board page', '打开完整原生白板页'],
    ['edit', 'Edit and move cards with native history', '编辑、移动卡片并使用原生历史'],
    ['navigate', 'Return to slides without replacing the Board', '返回幻灯片而不替换白板'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['host', 'Facilitation slides', '引导幻灯片'],
    ['child', 'Active retrospective Board', '激活的复盘白板'],
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
