import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/embed-mixed-in-docs-modern.png',
  product: 'embed',
  category: 'showcases',
  previewHeight: 1100,
  group: { 'en-US': 'Modern Docs host / Mixed', 'zh-CN': '现代文档宿主 / 综合嵌入' },
  title: { 'en-US': 'Northstar / Complete Project Brief', 'zh-CN': 'Northstar / 完整项目说明' },
  description: {
    'en-US':
      'A seed-library pilot integrates a resource Sheet, owner Base, strategy Slides and dependency Board as four native document blocks.',
    'zh-CN': '种子图书馆试点将资源 Sheet、负责人 Base、策略 Slides 和依赖 Board 作为四个原生文档块组合。',
  },
  tags: {
    'en-US': ['Embed', 'Modern Docs', 'Sheets', 'Bases', 'Slides', 'Boards', 'Mixed'],
    'zh-CN': ['嵌入', '现代文档', '表格', '多维表格', '幻灯片', '白板', '综合'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs/docs-ui',
    '@univerjs/preset-docs-drawing',
    '@univerjs/preset-sheets-advanced',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
    '@univerjs-pro/bases-ui',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/boards-ui',
  ],
  apis: [
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FRange.setValue()',
    'FBaseTableRecord.setValue()',
    'FShapeText.setText()',
    'FDocumentParagraph.appendText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'An original fictional six-week pilot uses six stations, 72 starter packs and six orientations. Resource calculations, six workstreams/four owners, three strategy slides and six dependency cards live in independent units inside one modern project narrative.',
      'zh-CN':
        '原创虚构六周试点包含 6 个站点、72 份起步材料和 6 场说明会。资源计算、6 条工作线／4 位负责人、3 张策略幻灯片和 6 张依赖卡片作为独立单元嵌入现代项目说明。',
    },
    tryIt: {
      'en-US': [
        'Scroll to each section and activate its native block.',
        'Use the five literal README examples, changing the appropriate unit only.',
        'Expand a block to use its native editing controls and Undo/Redo.',
        'Edit the host title and inspect all four moved body anchors.',
      ],
      'zh-CN': [
        '滚动至各章节并激活原生嵌入块。',
        '运行 README 的五段原样示例，每次只修改对应单元。',
        '展开嵌入块，使用原生编辑和撤销／重做。',
        '修改宿主标题并检查四个正文锚点移动。',
      ],
    },
    expected: {
      'en-US':
        'Four live native document blocks with independent data. Sheet formulas recalculate; narrative and shape labels remain authored. Selected rendering, examples, anchors and Print preview pass, but strict Sheet history snapshots still differ; see README.',
      'zh-CN':
        '四个原生文档块保持数据独立，Sheet 公式会重新计算，正文和图形标签保持独立编写。选定渲染、示例、锚点和打印预览检查通过，但 Sheet 撤销后的严格快照仍有差异，详见 README。',
    },
  },
  variants: [
    ['narrative', 'Four contextual body blocks', '四个上下文正文块'],
    ['editing', 'Inline reading / Expanded editing', '正文阅读 / 展开编辑'],
    ['ownership', 'One narrative / Four independent resources', '一份说明 / 四个独立资源'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [
    ['reading', 'Read the connected story', '阅读完整故事'],
    ['editing', 'Edit the active native resource', '编辑激活的原生资源'],
    ['failure', 'Source failure / Reload to retry', '资源失败 / 刷新重试'],
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
