import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/docs-modern-responsive-width-and-zoom.png',
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Layout', 'zh-CN': '布局' },
  title: { 'en-US': 'Responsive Width and Zoom', 'zh-CN': '响应式宽度与缩放' },
  description: {
    'en-US': 'Resize an external container to reflow native paragraphs, then compare independent native view zoom.',
    'zh-CN': '调整外部容器使原生段落重新换行，再比较独立的原生视图缩放。',
  },
  tags: {
    'en-US': ['Modern Docs', 'Single feature', 'Responsive', 'Zoom'],
    'zh-CN': ['现代文档', '单功能', '响应式', '缩放'],
  },
  packages: ['@univerjs/preset-docs-core', '@univerjs-pro/license'],
  apis: ['FDocument.save()', 'FDocument.insertText()', 'RichTextEditingMutation', 'SetDocZoomRatioOperation'].map(
    (name) => ({ name }),
  ),
  guide: {
    overview: {
      'en-US':
        'A text specimen shows real paragraph wrapping without unrelated tables, charts or images. The external container selector is the only host control; native Grid and footer controls remain visible.',
      'zh-CN':
        '文字示例展示真实段落换行，不包含无关表格、图表或图片。外部容器选择器是唯一宿主控件，原生 Grid 与页脚控件保持可见。',
    },
    tryIt: {
      'en-US': [
        'Compare 960, 600, 390 and 320 pixel containers at 100% zoom.',
        'Edit a paragraph, resize the container, and verify that the text remains.',
        'Use the native footer to set 150% zoom: text grows without changing logical page width or line breaks.',
        'Switch light and dark themes without losing edits or the chosen width.',
      ],
      'zh-CN': [
        '在 100% 缩放下比较 960、600、390 和 320 像素容器。',
        '编辑段落后调整容器，确认文字保持不变。',
        '通过原生页脚设置 150%：文字放大，但逻辑页面宽度与换行不变。',
        '切换明暗主题，保留编辑与所选宽度。',
      ],
    },
    expected: {
      'en-US':
        'The host measures CSS width and explicitly updates SDK logical page width without adding history. Native zoom changes view scale only. Font sizes and document content are preserved; narrow high-zoom views can scroll horizontally. Preview and exported source share complete English/Chinese core bundles and official styles. The README distinguishes lower-level SDK operations from Facades and records previous mixed-content SDK failures without claiming fixes.',
      'zh-CN':
        '宿主测量 CSS 宽度，并显式更新 SDK 逻辑页面宽度且不增加历史。原生缩放只改变视图比例。字号与文档内容保持不变，窄屏高缩放可横向滚动。预览与导出源码共用完整中英文核心语言包和官方样式。README 区分底层 SDK 操作与 Facade，并记录此前混合内容 SDK 缺陷，不宣称已修复。',
    },
  },
  variants: [
    ['fluid', 'Fluid container', '自适应容器'],
    ['desktop', '960 px container', '960 像素容器'],
    ['tablet', '600 px container', '600 像素容器'],
    ['phone', '390 px container', '390 像素容器'],
    ['compact', '320 px container', '320 像素容器'],
    ['native-zoom', 'Native view zoom', '原生视图缩放'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['host', 'Resize external container', '调整外部容器'],
    ['zoom', 'Native footer zoom', '原生页脚缩放'],
    ['edit', 'Native text editing', '原生文字编辑'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['default', 'Text specimen', '文字示例'],
    ['edited', 'Edited text', '已编辑文字'],
    ['error', 'SDK layout failure', 'SDK 排版失败'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})
export default { metadata, files, Preview }
