import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Modern Docs host / Block', 'zh-CN': '现代文档宿主 / 块嵌入' },
  title: { 'en-US': 'Slides in Docs / Strategy Announcement', 'zh-CN': 'Slides 嵌入现代文档 / 策略公告' },
  description: {
    'en-US':
      'A neighborhood repair strategy announcement contains an editable three-slide deck. Navigate and edit the native Slides child without rewriting the host narrative.',
    'zh-CN': '社区维修策略公告内嵌可编辑的三页演示稿，原生切页与编辑不会改写宿主正文。',
  },
  tags: { 'en-US': ['Embed', 'Modern Docs', 'Slides', 'Block'], 'zh-CN': ['嵌入', '现代文档', '演示文稿', '块'] },
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
    'FEmbed.loadAsync()',
    'FEmbed.setDisplayTarget()',
    'FShapeText.setRichText()',
    'FDocumentParagraph.appendText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Lighthouse tests a beginner repair offer over six weeks. A deep-ocean cover, warm evidence cards and a sea-green learning timeline tell different parts of the strategy. Every slide is native editable content, not a screenshot. SDK chrome keeps its official CSS and Grid layout.',
      'zh-CN':
        'Lighthouse 用六周试验新手维修服务。深海蓝封面、暖白依据卡片和海绿色学习时间线分别讲述策略的不同部分。每页都是原生可编辑内容，不是截图，SDK 界面保留官方 CSS 与 Grid 布局。',
    },
    tryIt: {
      'en-US': [
        'Read the announcement and activate the embedded presentation.',
        'Edit Start with one useful repair to Make the first repair count using native Slides text editing; the announcement remains independent.',
        'Use native Next page to visit Evidence before reach and Learn before expanding; expand to access the full Slides workspace.',
        'Edit the document title above the deck. Its block anchor moves while the presentation remains unchanged.',
      ],
      'zh-CN': [
        '阅读公告并激活内嵌演示稿。',
        '用原生 Slides 文字编辑将封面标题改为 Make the first repair count；公告正文保持独立。',
        '用原生 Next page 访问依据与学习时间线；展开后可使用完整 Slides 工作区。',
        '修改演示稿上方的文档标题，块锚点随正文移动，演示稿内容保持不变。',
      ],
    },
    expected: {
      'en-US':
        'A real Docs-owned block contains three editable native slides. This is not the Formula Shape case: text and numbers do not synchronize automatically with the host. All data is fictional; there is no backend, campaign execution or Exchange/Print conversion. Reload loses edits. License watermarks and broader lifecycle/performance acceptance remain open.',
      'zh-CN':
        '真实 Docs 块包含三页可编辑原生幻灯片。本例不是 Formula Shape，文字与数字不会自动同步到宿主。数据均为虚构，不提供后端、营销执行或 Exchange / Print 转换。刷新丢失修改；授权水印与完整生命周期、性能仍待验收。',
    },
  },
  variants: [
    { id: 'strategy', label: { 'en-US': 'Strategy / Deep-ocean cover', 'zh-CN': '策略 / 深海蓝封面' } },
    { id: 'evidence', label: { 'en-US': 'Evidence / Three planning cards', 'zh-CN': '依据 / 三张计划卡片' } },
    { id: 'learning', label: { 'en-US': 'Learning / Six-week timeline', 'zh-CN': '学习 / 六周时间线' } },
  ],
  actions: [
    { id: 'edit', label: { 'en-US': 'Edit native slide text', 'zh-CN': '编辑原生幻灯片文字' } },
    { id: 'navigate', label: { 'en-US': 'Navigate and expand the deck', 'zh-CN': '切页并展开演示稿' } },
    { id: 'anchor', label: { 'en-US': 'Move the block by editing narrative', 'zh-CN': '编辑正文并移动块锚点' } },
  ],
  states: [
    { id: 'passive', label: { 'en-US': 'Read the announcement and deck', 'zh-CN': '阅读公告与演示稿' } },
    { id: 'active', label: { 'en-US': 'Edit inline or expanded', 'zh-CN': '在正文内或展开后编辑' } },
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
