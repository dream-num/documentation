import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Traditional Docs host / Block', 'zh-CN': '传统文档宿主 / 块嵌入' },
  title: {
    'en-US': 'Bases in Traditional Docs / Evidence Review',
    'zh-CN': 'Bases 嵌入传统文档 / 证据评审',
  },
  description: {
    'en-US':
      'A formal field-station review embeds seven evidence records and four linked owners, keeping its written disposition independent.',
    'zh-CN': '正式野外观测站评审报告嵌入七项证据与四位关联责任人，正文结论保持独立。',
  },
  tags: {
    'en-US': ['Embed', 'Traditional Docs', 'Bases', 'Evidence'],
    'zh-CN': ['嵌入', '传统文档', '多维表格', '证据'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs/docs-ui',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/bases',
    '@univerjs-pro/bases-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createDocument()',
    'FUniver.createEmbed()',
    'FBaseRecord.setValue()',
    'FDocumentParagraph.appendText()',
    'FEmbed.getDescriptor()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Rowan is an original fictional field-station readiness review. Numbered A4 chapters separate purpose, a native evidence register and the written conditions. Wine-colored headings, blue-gray body text and muted status colors distinguish the report from a cost workbook.',
      'zh-CN':
        'Rowan 是原创虚构观测站就绪评审。编号 A4 章节区分目的、原生证据清单与书面条件。酒红标题、蓝灰正文和柔和状态色与成本模型案例形成区别。',
    },
    tryIt: {
      'en-US': [
        'Scroll to chapter 02 and activate the native Base.',
        'Rename Calibration trace through the literal README example; try native Undo/Redo.',
        'Expand the Base, open Owners and rename Imani Cole; linked evidence labels follow.',
        'Append text to the report title: the anchor moves, but the Base stays unchanged.',
      ],
      'zh-CN': [
        '滚动到第 02 章并激活原生 Base。',
        '执行 README 示例重命名 Calibration trace，再尝试原生撤销/重做。',
        '展开 Base，打开 Owners 并重命名 Imani Cole，关联证据标签随之更新。',
        '在报告标题末尾追加文字：锚点移动，Base 保持不变。',
      ],
    },
    expected: {
      'en-US':
        'Three traditional A4 pages and a native DocBlock. Selected editing/history, linked labels and ownership checks pass; full acceptance remains open. Record labels do not certify instruments or approve deployment. See README.',
      'zh-CN':
        '三张传统 A4 页面与原生 DocBlock。选定编辑/历史、关联标签与实例归属检查通过；完整验收仍未完成。记录标签不会认证设备或批准部署，详见 README。',
    },
  },
  variants: [
    ['report', 'A4 / Numbered review chapters', 'A4 / 编号评审章节'],
    ['evidence', 'Seven evidence items / Four statuses', '七项证据 / 四种状态'],
    ['owners', 'Four linked owners / Handover notes', '四位关联责任人 / 交接说明'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit an evidence record', '编辑证据记录'],
    ['link', 'Rename a linked owner', '重命名关联责任人'],
    ['anchor', 'Edit above the body anchor', '编辑正文锚点上方内容'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['reading', 'Traditional report reading', '传统报告阅读'],
    ['editing', 'Native Base editing', '原生 Base 编辑'],
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
