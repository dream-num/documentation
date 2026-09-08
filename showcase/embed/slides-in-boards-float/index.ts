import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Canvases host / Float', 'zh-CN': 'Canvases 宿主 / 浮动' },
  title: { 'en-US': 'Slides in Canvases / Pitch Storyboard', 'zh-CN': 'Slides 嵌入 Canvases / 提案故事板' },
  description: {
    'en-US':
      'Refine a four-page night-sky pitch beside its narrative notes, with distinct layouts and independent native editing.',
    'zh-CN': '在叙事卡片旁完善四页夜空活动提案，展示不同版式和相互独立的原生编辑。',
  },
  tags: {
    'en-US': ['Embed', 'Canvases', 'Slides', 'Float', 'Pitch'],
    'zh-CN': ['嵌入', 'Canvases', '幻灯片', '浮动', '提案'],
  },
  packages: [
    '@univerjs-pro/boards',
    '@univerjs-pro/boards-ui',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createBoard()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FPresentation.getSlideById()',
    'FShapeText.setRichText()',
    'FShapeText.setText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Prism proposes eight local night-sky sessions with 160 planned places and an illustrative USD 8,400 budget. Four narrative cards stay beside a four-page native deck: invitation, visitor journey, resources and readiness. Notes and Slides have independent models.',
      'zh-CN':
        'Prism 提议八场本地夜空活动、160 个计划名额和示意性 8,400 美元预算。四张叙事卡片与邀请、体验流程、投入及准备情况四页原生演示并列；Canvases 和 Slides 模型独立。',
    },
    tryIt: {
      'en-US': [
        'Double-click the deck and enter native fullscreen.',
        'Use thumbnails to compare all four layouts.',
        'Run the README rich-text example; try native editing, movement and Undo/Redo.',
        'Return to the Canvas and refine its pending next step independently.',
      ],
      'zh-CN': [
        '双击演示并进入原生全屏。',
        '用缩略图比较四种版式。',
        '运行 README 富文本示例，尝试原生编辑、移动和撤销重做。',
        '返回 Canvases，独立完善待办事项。',
      ],
    },
    expected: {
      'en-US':
        'A native BoardFloating presentation with four distinct palettes, real rich text and official CSS. Selected native editing/history, fullscreen navigation and independent Canvas edits pass. No fixture panel, duplicate toolbar, iframe or automatic synchronization; see README for remaining acceptance.',
      'zh-CN':
        '原生 BoardFloating 演示，包含四套配色、真实富文本和官方 CSS。选定的原生编辑与撤销重做、全屏翻页及 Canvases 独立编辑通过验证。无 fixture 面板、重复工具栏、iframe 或自动同步；待验收项详见 README。',
    },
  },
  variants: [
    ['story', 'Four narrative beats / Four pages', '四个叙事节点 / 四页演示'],
    ['resources', 'USD 8,400 resource plan', '8,400 美元投入计划'],
    ['layouts', 'Dark, green, warm-white and lavender', '深色、绿色、暖白与淡紫'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Refine the native pitch', '完善原生提案'],
    ['navigate', 'Compare four slide layouts', '比较四页版式'],
    ['board', 'Update the Canvas independently', '独立更新 Canvases'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['passive', 'Deck beside narrative notes', '叙事卡片旁的演示'],
    ['active', 'Native presentation editing', '原生演示编辑'],
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
