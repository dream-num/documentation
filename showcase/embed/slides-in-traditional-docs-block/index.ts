import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Traditional Docs host / Block', 'zh-CN': '传统文档宿主 / 块嵌入' },
  title: { 'en-US': 'Slides in Traditional Docs / Conference Handout', 'zh-CN': 'Slides 嵌入传统文档 / 会议手册' },
  description: {
    'en-US':
      'A paginated route-study handout embeds four editable discussion slides, with independent narrative, rich text and geometry.',
    'zh-CN': '分页路线研究手册嵌入四页可编辑讨论幻灯片，正文、富文本与图形保持独立。',
  },
  tags: {
    'en-US': ['Embed', 'Traditional Docs', 'Slides', 'Conference'],
    'zh-CN': ['嵌入', '传统文档', '幻灯片', '会议'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs/docs-ui',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createDocument()',
    'FUniver.createEmbed()',
    'FPresentation.getSlideById()',
    'FShapeText.setRichText()',
    'FDocumentParagraph.appendText()',
    'FEmbed.getDescriptor()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Summit is an original synthetic discussion handout. Three traditional A4 chapters separate a small observation frame, four editable slides and limitations. Six stops, two time windows and three invented routes provide twelve discussion notes, not field results.',
      'zh-CN':
        'Summit 是原创虚构讨论手册。三个传统 A4 章节区分观察框架、四页可编辑幻灯片和限制。六个停靠点、两个时段和三条虚构路线构成十二条讨论记录，并非实测结果。',
    },
    tryIt: {
      'en-US': [
        'Scroll to chapter 02 and activate the deck.',
        'Use the literal README example to refine the cover title; try native Undo/Redo.',
        'Navigate four different page layouts, expand the deck and edit text or move a shape.',
        'Append text to the handout title and verify the deck is unchanged.',
      ],
      'zh-CN': [
        '滚动到第 02 章并激活演示文稿。',
        '用 README 原样示例修改封面标题，再尝试原生撤销/重做。',
        '浏览四种页面布局，展开演示文稿并编辑文字或移动图形。',
        '在手册标题末尾添加文字，确认演示文稿保持不变。',
      ],
    },
    expected: {
      'en-US':
        'Traditional pagination with a native DocBlock. Bars and labels are independent shapes, not calculated charts. Selected editing, movement and history checks pass; whole-title and line-selection probes still fail. See README for limits.',
      'zh-CN':
        '传统分页与原生 DocBlock。条形和标签是独立图形，不是计算图表。选定编辑、移动和历史检查通过；整段标题和行选择探针仍失败。限制详见 README。',
    },
  },
  variants: [
    ['cover', 'Ocean cover / Rich title', '深海蓝封面 / 富文本标题'],
    ['comparison', 'Process cards / Comparison bars', '流程卡片 / 比较条形'],
    ['report', 'A4 paper / Four-slide discussion', 'A4 手册 / 四页讨论'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['text', 'Edit native slide text', '编辑原生幻灯片文字'],
    ['geometry', 'Move native shapes', '移动原生图形'],
    ['anchor', 'Edit above the document anchor', '编辑文档锚点上方内容'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['reading', 'Paginated handout reading', '分页手册阅读'],
    ['editing', 'Native Slides editing', '原生 Slides 编辑'],
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
