import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Traditional Docs host / Block', 'zh-CN': '传统文档宿主 / 块嵌入' },
  title: { 'en-US': 'Sheets in Traditional Docs / Grant Cost Schedule', 'zh-CN': 'Sheets 嵌入传统文档 / 资助成本表' },
  description: {
    'en-US':
      'A paginated archive grant memorandum keeps an editable six-line cost model between numbered chapters, with independent narrative decisions.',
    'zh-CN': '分页档案资助报告在编号章节间嵌入六项可编辑成本模型，正文决策保持独立。',
  },
  tags: {
    'en-US': ['Embed', 'Traditional Docs', 'Sheets', 'Block', 'Grant'],
    'zh-CN': ['嵌入', '传统文档', '表格', '块', '资助'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs/docs-ui',
    '@univerjs/preset-docs-drawing',
    '@univerjs/preset-sheets-advanced',
    '@univerjs/sheets-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createDocument()',
    'FUniver.createEmbed()',
    'FEmbed.getDescriptor()',
    'FRange.setValue()',
    'FDocumentParagraph.appendText()',
    'FWorkbook.updatePrintConfig()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Estuary is a fictional community archive grant memorandum. Traditional A4 pages, serif body text and numbered chapters separate purpose, costs and review gates. Six work packages total USD 15,820; a 7.5% reserve gives USD 17,006.50 against a USD 20,000 ceiling. A native workbook remains inside the document body.',
      'zh-CN':
        'Estuary 是虚构的社区档案资助报告。传统 A4 页面、衬线正文和编号章节区分目的、成本与审核条件。六项成本合计 15,820 美元，加 7.5% 储备后为 17,006.50 美元，上限 20,000 美元。原生工作簿位于文档正文内。',
    },
    tryIt: {
      'en-US': [
        'Scroll to chapter 02 and activate the native workbook.',
        'Change Costs B7 from 18 to 22 scanning days: D14 becomes 17952.50 and D17 becomes 2047.50.',
        'Expand the workbook, compare Phasing and try native Grid menus.',
        'Append text to the report title; the body anchor should follow without changing the workbook.',
        'Use the native sheet Print menu to explore local print preview.',
      ],
      'zh-CN': [
        '滚动至第 02 章并激活原生工作簿。',
        '将 Costs B7 从 18 改为 22 个扫描日：D14 为 17952.50，D17 为 2047.50。',
        '展开工作簿，比较 Phasing 并尝试原生 Grid 菜单。',
        '在报告标题末尾添加文字，正文锚点应跟随且不修改工作簿。',
        '用原生表格 Print 菜单探索本地打印预览。',
      ],
    },
    expected: {
      'en-US':
        'Three traditional A4 pages and a native DocBlock, not an infinite modern page or iframe. The final allocation balances rounded cents. Selected edits, Grid, print preview and ownership checks pass; full acceptance remains open. See README.',
      'zh-CN':
        '三张传统 A4 页面与原生 DocBlock，不以现代无限页面或 iframe 替代。最后一期平衡舍入后的金额。选定编辑、Grid、打印预览和实例归属检查通过；完整验收仍未完成，详见 README。',
    },
  },
  variants: [
    ['report', 'A4 report / Numbered chapters', 'A4 报告 / 编号章节'],
    ['costs', 'Six costs / 7.5% reserve', '六项成本 / 7.5% 储备'],
    ['phasing', '25%, 50%, 25% allocations', '25%、50%、25% 分期'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Edit the cost assumptions', '编辑成本假设'],
    ['expand', 'Explore the native workbook', '探索原生工作簿'],
    ['anchor', 'Edit above the native anchor', '编辑原生锚点上方的正文'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['reading', 'Traditional document reading', '传统文档阅读'],
    ['editing', 'Native workbook editing', '原生工作簿编辑'],
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
