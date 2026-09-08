import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Traditional Docs host / Block', 'zh-CN': '传统文档宿主 / 块嵌入' },
  title: { 'en-US': 'Board in Traditional Docs / Engineering Methods', 'zh-CN': 'Board 嵌入传统文档 / 工程方法' },
  description: {
    'en-US':
      'A three-chapter A4 methods note embeds an editable capture-and-review workflow with a bound exception path.',
    'zh-CN': '三个 A4 章节的方法说明内嵌可编辑采集与复核流程，异常路径使用绑定连接线。',
  },
  tags: {
    'en-US': ['Embed', 'Traditional Docs', 'Boards', 'Methods'],
    'zh-CN': ['嵌入', '传统文档', '白板', '方法'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs/docs-ui',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/boards',
    '@univerjs-pro/boards-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createDocument()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FBoard.getShape()',
    'FShapeText.setText()',
    'FDocumentParagraph.appendText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Delta is an original fictional engineering-method note. Eighteen draft images, sixteen clear labels and two open items frame a capture/review discussion. Eight cards and ten bound connectors distinguish the ordinary path, reference material, exceptions and records. No images are processed.',
      'zh-CN':
        'Delta 是原创虚构工程方法说明。18 张草稿图像、16 个 clear 标签和 2 个 open 项目构成采集与复核讨论。8 张卡片和 10 条绑定连接线区分常规路径、参考资料、异常和记录；不会处理真实图像。',
    },
    tryIt: {
      'en-US': [
        'Read the method, then activate the Board in chapter 02.',
        'Run the literal README example to change the exception status; use native Undo/Redo.',
        'Expand the Board, drag the exception card and inspect its connected routes.',
        'Edit the report title and verify that the diagram remains unchanged.',
      ],
      'zh-CN': [
        '阅读方法说明，然后激活第 02 章的 Board。',
        '运行 README 原样示例修改异常状态，使用原生撤销/重做。',
        '展开 Board，拖动异常卡片并观察绑定路径。',
        '修改报告标题，确认流程图不变。',
      ],
    },
    expected: {
      'en-US':
        'Three rendered A4 pages and a live Board body block, not a flattened picture. Selected native editing, bound routing, history and independent export checks pass. Labels and report prose remain independent; arrows do not execute services or formulas. Full acceptance remains open; see README.',
      'zh-CN':
        '三个实际渲染的 A4 页面与可编辑 Board 正文块，不是扁平图片。选定原生编辑、绑定路径、历史和独立导出检查通过。标签与报告正文独立；箭头不执行服务或公式。完整验收仍未完成，详见 README。',
    },
  },
  variants: [
    ['method', 'A4 methods / Serif report', 'A4 方法说明 / 衬线正文'],
    ['flow', 'Ordinary path / Exception return', '常规路径 / 异常返回'],
    ['canvas', 'Inline Board / Fullscreen canvas', '正文 Board / 全屏画布'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['status', 'Edit exception text', '编辑异常文字'],
    ['routing', 'Move connected cards', '移动绑定卡片'],
    ['anchor', 'Edit above the body anchor', '编辑正文锚点上方内容'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['reading', 'Paginated method reading', '分页方法阅读'],
    ['editing', 'Native Board editing', '原生 Board 编辑'],
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
