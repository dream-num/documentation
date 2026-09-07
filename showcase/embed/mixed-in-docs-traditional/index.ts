import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'showcases',
  previewHeight: 1100,
  group: { 'en-US': 'Traditional Docs host / Mixed', 'zh-CN': '传统文档宿主 / 综合嵌入' },
  title: { 'en-US': 'Estuary / Grant Review Dossier', 'zh-CN': 'Estuary / 资助评审卷宗' },
  description: {
    'en-US':
      'An A4 review dossier integrates a cost Sheet, evidence Base, hearing Slides and release Board in four native chapters.',
    'zh-CN': 'A4 评审卷宗将成本 Sheet、证据 Base、听证 Slides 和审阅 Board 嵌入四个原生章节。',
  },
  tags: {
    'en-US': ['Embed', 'Traditional Docs', 'Pagination', 'Sheets', 'Bases', 'Slides', 'Boards'],
    'zh-CN': ['嵌入', '传统文档', '分页', '表格', '多维表格', '幻灯片', '白板'],
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
        'A fictional museum exhibition proposes three listening rooms and twenty-four illustrative excerpts. A serif executive assessment and four paginated chapters keep costs, evidence, hearing material and release dependencies separate. No real recordings, applications or personal data are included.',
      'zh-CN':
        '虚构博物馆展览拟设 3 个听音展区、24 段示意摘录。衬线摘要与四个分页章节分别承载成本、证据、听证材料和审阅依赖，不包含真实录音、申请或个人数据。',
    },
    tryIt: {
      'en-US': [
        'Read the A4 chapters and expand each native block.',
        'Run the five literal README examples; only the intended unit should change.',
        'Edit transcript quantities, inspect the contingency formula and use native Print preview.',
        'Append to the cover title and inspect all four body anchors.',
      ],
      'zh-CN': [
        '阅读 A4 章节并展开各原生嵌入块。',
        '运行 README 的五段原样示例，每次仅修改目标单元。',
        '编辑转录审阅数量，检查预备费公式和原生打印预览。',
        '追加封面标题并检查四个正文锚点。',
      ],
    },
    expected: {
      'en-US':
        'Five actual A4 pages contain four independent native resources. Selected rendering, examples, anchor flow and Sheet Print preview pass. The strict first Sheet Undo snapshot still differs in empty validation metadata; see README.',
      'zh-CN':
        '实际渲染为 5 页 A4，包含四个独立原生资源。选定渲染、示例、锚点流动和 Sheet 打印预览检查通过；首次 Sheet 撤销后空验证资源的严格快照仍有差异，详见 README。',
    },
  },
  variants: [
    ['dossier', 'Read the complete dossier', '阅读完整卷宗'],
    ['resources', 'Inspect four native resources', '检查四个原生资源'],
    ['fullscreen', 'Edit in native fullscreen', '原生全屏编辑'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['cost', 'Revise transcript workload', '调整转录工作量'],
    ['evidence', 'Update a review note', '修改审阅备注'],
    ['anchors', 'Revise the cover title', '修改封面标题'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['draft', 'Draft for committee review', '委员会审阅草案'],
    ['editing', 'Independent local edits', '独立本地编辑'],
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
