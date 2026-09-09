import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/embed-mixed-in-slides.png',
  product: 'embed',
  category: 'showcases',
  previewHeight: 1000,
  group: { 'en-US': 'Slides host / Mixed', 'zh-CN': '幻灯片宿主 / 综合嵌入' },
  title: { 'en-US': 'Beacon / Complete Executive Review', 'zh-CN': 'Beacon / 完整试点评审' },
  description: {
    'en-US':
      'A neighborhood repair pilot combines four authored slides, a floating cost Sheet and native pages for Docs, Bases and Boards.',
    'zh-CN': '社区维修试点将四页原创演示、浮动成本表以及文档、Bases、Boards 原生页面组合为完整评审。',
  },
  tags: {
    'en-US': ['Embed', 'Slides', 'Float', 'Tab', 'Sheets', 'Docs', 'Bases', 'Boards'],
    'zh-CN': ['嵌入', '幻灯片', '浮动', '页面', '表格', '文档', '多维表格', '白板'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
    '@univerjs/preset-sheets-advanced',
    '@univerjs/docs-ui',
    '@univerjs-pro/bases-ui',
    '@univerjs-pro/boards-ui',
  ],
  apis: [
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FRange.setValue()',
    'FShapeText.setText()',
    'FDocumentParagraph.appendText()',
    'FBaseTableRecord.setValue()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Three neighborhood hubs propose twelve repair clinics and 144 planned places. The deck separates scope, editable costs, evidence and a review checkpoint. Native page-list entries open three independent products; the Sheet remains on the economics slide.',
      'zh-CN':
        '三个社区站点计划举办十二场维修活动，提供 144 个计划名额。演示分别说明范围、可编辑成本、证据和评审节点；三个独立产品通过原生页面列表打开，Sheet 保留在成本页。',
    },
    tryIt: {
      'en-US': [
        'Navigate all seven native page-list entries.',
        'Open the floating Sheet on the economics slide; change replacement kits.',
        'Read the memo, linked readiness register and delivery map.',
        'Run the five literal README examples and check model ownership.',
      ],
      'zh-CN': [
        '浏览七个原生页面列表项。',
        '打开成本页浮动 Sheet，修改替换材料包数量。',
        '阅读备忘录、关联站点的审阅记录和交付流程。',
        '运行 README 的五段原样示例并核对数据归属。',
      ],
    },
    expected: {
      'en-US':
        'Seven native page-list entries preserve independent models. Selected examples, editing, async Print preview and export have evidence; native Sheet fullscreen and first-Undo metadata equality still fail. See README.',
      'zh-CN':
        '七个原生页面列表项保留独立数据。选定示例、编辑、异步打印预览和导出已有证据；Sheet 原生全屏与首次撤销元数据一致性仍未通过，详见 README。',
    },
  },
  variants: [
    ['story', 'Four distinct slide layouts', '四种演示布局'],
    ['float', 'Editable cost model in context', '上下文中的成本表'],
    ['pages', 'Three native product pages', '三个原生产品页'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [
    ['draft', 'Discussion draft', '讨论草案'],
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
