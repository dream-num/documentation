import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Canvases host / Float', 'zh-CN': 'Canvases 宿主 / 浮动' },
  title: { 'en-US': 'Modern Docs in Canvases / Discovery Brief', 'zh-CN': '现代文档嵌入 Canvases / 调研提纲' },
  description: {
    'en-US':
      'Explore a library first visit with synthetic observation cards, distinct hypotheses and a native editable interview brief.',
    'zh-CN': '用虚构到馆观察、独立假设卡片和可编辑访谈提纲展示 Canvases 中的原生现代文档。',
  },
  tags: {
    'en-US': ['Embed', 'Canvases', 'Modern Docs', 'Float', 'Research'],
    'zh-CN': ['嵌入', 'Canvases', '现代文档', '浮动', '调研'],
  },
  packages: [
    '@univerjs-pro/boards',
    '@univerjs-pro/boards-ui',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createBoard()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FDocument.getParagraphs()',
    'FDocumentParagraph.setText()',
    'FShapeText.setText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Maple separates what was noticed from what might help. Three fictional observations and three hypotheses share a research Canvas with a seven-section modern interview brief. Plan six conversations without treating the synthetic notes as real evidence.',
      'zh-CN':
        'Maple 将观察与可能的解决方向分开：三条虚构观察、三条假设与七节现代文档访谈提纲同处一张调研 Canvases。计划六次交流，不把演示内容当成真实证据。',
    },
    tryIt: {
      'en-US': [
        'Double-click the brief to activate native Docs editing.',
        'Run the README title example, then try native typing and Undo/Redo.',
        'Expand and scroll to the final next-test section.',
        'Return to the Canvas and change or move a card independently.',
      ],
      'zh-CN': [
        '双击提纲，激活原生 Docs 编辑。',
        '运行 README 标题示例，尝试原生输入与撤销重做。',
        '展开文档并滚动到最后的下一轮测试部分。',
        '返回 Canvases，独立修改或移动卡片。',
      ],
    },
    expected: {
      'en-US':
        'Native modern Docs on a Canvas, with separate models and official CSS. Selected keyboard/history, fullscreen, scroll, Canvas movement and theme checks pass. No fixture panel, duplicate toolbar, iframe, recruitment or automatic card updates; see README for remaining acceptance.',
      'zh-CN':
        'Canvases 中的原生现代文档，模型独立并包含官方 CSS。已通过选定的键盘输入、撤销重做、全屏、滚动、Canvases 移动和主题检查。无 fixture 面板、重复工具栏、iframe、招募或自动卡片更新；剩余验收详见 README。',
    },
  },
  variants: [
    ['observations', 'Three observations / Three hypotheses', '三条观察 / 三条假设'],
    ['brief', 'Seven-section interview brief', '七节访谈提纲'],
    ['sample', 'New and returning readers', '新读者与回访读者'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit the native brief', '编辑原生提纲'],
    ['read', 'Expand and read the next-test section', '展开并阅读下一轮测试'],
    ['board', 'Refine a Canvas hypothesis independently', '独立完善 Canvases 假设'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['passive', 'Brief beside the observation clusters', '观察旁的访谈提纲'],
    ['active', 'Native document editing', '原生文档编辑'],
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
