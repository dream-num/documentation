import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'pdfs' as const,
  category: 'features' as const,
  image: '/assets/showcase/pdfs-table-themes-and-cell-styles.png',
  group: { 'en-US': 'Tables', 'zh-CN': '表格' },
  title: { 'en-US': 'Table themes and cell styles', 'zh-CN': '表格主题与单元格样式' },
  description: {
    'en-US': 'Five native PDF tables compare grid, bands, header emphasis and a cell override.',
    'zh-CN': '五张原生 PDF 表格对比网格、条纹、表头强调与单元格独立样式。',
  },
  tags: { 'en-US': ['PDFs', 'Tables', 'Themes'], 'zh-CN': ['PDF', '表格', '主题'] },
  packages: [
    '@univerjs/core',
    '@univerjs/design',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs/drawing',
    '@univerjs/drawing-ui',
    '@univerjs/engine-render',
    '@univerjs/ui',
    '@univerjs-pro/license',
    '@univerjs-pro/pdfs',
    '@univerjs-pro/pdfs-editor',
    '@univerjs-pro/pdfs-ui',
  ],
  apis: [
    'FPdfPage.insertTable()',
    'FPdfTable.getTheme() / setTheme()',
    'FPdfTableCell.setText() / setStyle()',
    'FUniver.getPdfTableThemePresets()',
  ].map((name) => ({ name })),
  variants: [
    ['plain', 'Plain grid', '普通网格'],
    ['rows', 'Row bands', '行条纹'],
    ['header', 'Strong header', '强调表头'],
    ['columns', 'Column emphasis', '列强调'],
    ['exception', 'Cell override', '单元格样式'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [{ id: 'ready', label: { 'en-US': 'Native PDF ready', 'zh-CN': '原生 PDF 就绪' } }],
  guide: {
    overview: {
      'en-US': 'Five distinct editable tables use the native PDF theme and cell-style model without a host toolbar.',
      'zh-CN': '五张独立可编辑表格使用原生 PDF 主题与单元格样式模型，不添加宿主工具栏。',
    },
    tryIt: {
      'en-US': [
        'Navigate the five native pages.',
        'Select a table and open View > Properties to compare themes and table-look options.',
        'Double-click a cell in Editing mode to change its text.',
      ],
      'zh-CN': [
        '通过原生页栏查看五个页面。',
        '选择表格并打开 View > Properties，对比主题与表格选项。',
        '在 Editing 模式下双击单元格修改文字。',
      ],
    },
    expected: {
      'en-US':
        'English runtime and complete official styles. Native interaction requires browser acceptance; no binary PDF import/export or printing is claimed.',
      'zh-CN': '英文运行界面与完整官方样式。原生交互需浏览器验收；不宣称二进制 PDF 导入导出或打印能力。',
    },
  },
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
