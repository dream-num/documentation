import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/embed-mixed-in-boards.png',
  product: 'embed',
  category: 'showcases',
  previewHeight: 1000,
  group: { 'en-US': 'Boards host / Mixed', 'zh-CN': 'Boards 宿主 / 综合嵌入' },
  title: { 'en-US': 'Ripple / Complete Planning Workshop', 'zh-CN': 'Ripple / 完整共创工作坊' },
  description: {
    'en-US':
      'A riverfront wayfinding workshop combines a resource Sheet, agenda Doc, review Slides and linked observation Base in four native Board Floats.',
    'zh-CN': '河岸导视共创工作坊在原生 Boards 上浮动嵌入资源预算、议程文档、方案幻灯片和关联观察记录。',
  },
  tags: {
    'en-US': ['Embed', 'Boards', 'Float', 'Sheets', 'Docs', 'Slides', 'Bases'],
    'zh-CN': ['嵌入', '白板', 'Float', '表格', '文档', '幻灯片', '多维表格'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs-pro/boards-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
    '@univerjs/preset-sheets-advanced',
    '@univerjs/docs-ui',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/bases-ui',
  ],
  apis: [
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FRange.setValue()',
    'FDocumentParagraph.appendText()',
    'FShapeText.setRichText()',
    'FBaseTableRecord.setValue()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Four native floating products surround a 90-minute discussion loop. Eight budget lines, five agenda sections, three review slides and eight linked observations provide different kinds of evidence. All data is fictional and locally owned.',
      'zh-CN':
        '四个原生浮动产品围绕 90 分钟讨论流程展开：八项预算、五节议程、三页评审和八条关联观察各自提供不同证据。数据均为虚构且本地持有。',
    },
    tryIt: {
      'en-US': [
        'Inspect the four regions, then double-click a Float to use its native editing tools.',
        'Use native fullscreen for detailed editing; return to compare the Board overview.',
        'Change feedback card quantity in Workshop budget and inspect the reserve and total.',
        'Run each literal README example after opening its product.',
      ],
      'zh-CN': [
        '浏览四个区域，双击浮动内容使用原生编辑工具。',
        '深入编辑使用原生全屏，再返回 Boards 对比整体。',
        '修改 Workshop budget 的反馈卡数量，观察备用金和合计。',
        '打开对应产品后运行 README 的原样示例。',
      ],
    },
    expected: {
      'en-US':
        'Four native fullscreens, five literal examples, local recalculation, selected Print and export have evidence. First Sheet Undo still fails strict metadata equality; complete acceptance remains open. See README.',
      'zh-CN':
        '四种原生全屏、五段原样示例、本地重算、选定打印与导出已有证据。Sheet 首次撤销仍未通过严格元数据一致性检查，完整验收尚未完成，详见 README。',
    },
  },
  variants: [
    ['overview', 'Four-region workshop overview', '四区域工作坊全景'],
    ['review', 'Three authored review layouts', '三种评审版式'],
    ['records', 'Observations linked to locations', '观察关联地点'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [
    ['baseline', 'Illustrative workshop baseline', '示意工作坊基线'],
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
