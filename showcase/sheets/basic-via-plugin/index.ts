import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'integrations' as const,
  group: { 'en-US': 'Integration modes', 'zh-CN': '集成模式' },
  packages: [
    '@univerjs/core',
    '@univerjs/design',
    '@univerjs/ui',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs/engine-render',
    '@univerjs/engine-formula',
    '@univerjs/sheets',
    '@univerjs/sheets-ui',
    '@univerjs/sheets-formula-ui',
    '@univerjs/sheets-numfmt-ui',
    '@univerjs/sheets-sort-ui',
    '@univerjs/sheets-filter-ui',
    '@univerjs/sheets-conditional-formatting-ui',
    '@univerjs/sheets-data-validation',
    '@univerjs/sheets-data-validation-ui',
    '@univerjs/sheets-find-replace',
    '@univerjs/find-replace',
    '@univerjs/sheets-hyper-link-ui',
    '@univerjs/thread-comment-ui',
    '@univerjs/sheets-thread-comment-ui',
    '@univerjs/sheets-table-ui',
    '@univerjs/sheets-note-ui',
    '@univerjs/watermark',
    '@univerjs/sheets-crosshair-highlight',
  ],
  apis: [
    { name: 'new Univer() / Univer.registerPlugin() / Univer.createUnit() / Univer.dispose()' },
    { name: 'UniverSheetsDataValidationPlugin / UniverSheetsDataValidationUIPlugin' },
    { name: 'UniverSheetsConditionalFormattingUIPlugin / UniverSheetsFilterUIPlugin / UniverSheetsSortUIPlugin' },
    { name: 'UniverSheetsFindReplacePlugin / UniverSheetsHyperLinkUIPlugin / UniverSheetsNoteUIPlugin' },
    { name: 'UniverThreadCommentUIPlugin / UniverSheetsThreadCommentUIPlugin / UniverSheetsTableUIPlugin' },
    { name: 'UniverWatermarkPlugin / UniverSheetsCrosshairHighlightPlugin' },
  ],
  guide: {
    overview: {
      'en-US':
        'An explicit plugin-mode integration with the core editor plus validation, formatting, sort, filter, search, links, notes, comments, tables, watermark and crosshair UI. The original eight-sheet feature workbook remains intact.',
      'zh-CN':
        '显式插件模式集成：包含核心编辑器及验证、格式、排序、筛选、搜索、链接、批注、评论、表格、水印和十字高亮 UI，并完整保留原有八工作表功能工作簿。',
    },
    tryIt: {
      'en-US': [
        'Use the native sheet tabs to inspect the original eight-sheet workbook and compare values, formulas, styles and drawings.',
        'Exercise the native ribbon and context menus for sort, filter, validation, conditional formatting, links, notes, comments and tables where the fixture supports them.',
        'Switch light/dark documentation themes and inspect create-demo.ts to see the exact plugin order, locale merge and matching CSS imports used by Preview and export.',
      ],
      'zh-CN': [
        '使用原生工作表标签浏览原有八表工作簿，对比值、公式、样式和绘图。',
        '在数据支持的位置，通过原生功能区和右键菜单体验排序、筛选、验证、条件格式、链接、批注、评论与表格。',
        '切换文档站明暗主题，并查看 create-demo.ts 中 Preview 与导出共用的插件顺序、语言合并和对应 CSS。',
      ],
    },
    expected: {
      'en-US':
        'This case demonstrates explicit registration and coexistence of a broad plugin stack. It intentionally adds no duplicate host buttons; each feature has a separate focused Facade case for detailed behavior and variants.',
      'zh-CN':
        '本例演示大型插件栈的显式注册与共存，刻意不增加重复宿主按钮；每项功能的详细行为和变体由独立 Facade 案例负责。',
    },
  },
  variants: [
    { id: 'core', label: { 'en-US': 'Core editing and formulas', 'zh-CN': '核心编辑与公式' } },
    { id: 'data', label: { 'en-US': 'Validation / sort / filter', 'zh-CN': '验证 / 排序 / 筛选' } },
    { id: 'formatting', label: { 'en-US': 'Number / conditional formatting', 'zh-CN': '数字 / 条件格式' } },
    { id: 'content', label: { 'en-US': 'Links / notes / comments / tables', 'zh-CN': '链接 / 批注 / 评论 / 表格' } },
    { id: 'visual', label: { 'en-US': 'Watermark / crosshair', 'zh-CN': '水印 / 十字高亮' } },
  ],
  actions: [
    { id: 'native-ribbon', label: { 'en-US': 'Native ribbon actions', 'zh-CN': '原生功能区操作' } },
    { id: 'native-context', label: { 'en-US': 'Native context-menu actions', 'zh-CN': '原生右键菜单操作' } },
    { id: 'native-edit', label: { 'en-US': 'Native editing and history', 'zh-CN': '原生编辑与历史' } },
  ],
  states: [
    { id: 'original', label: { 'en-US': 'Original eight-sheet workbook', 'zh-CN': '原有八工作表工作簿' } },
    { id: 'edited', label: { 'en-US': 'User-edited workbook', 'zh-CN': '用户已编辑工作簿' } },
  ],
  title: {
    'en-US': 'Basic Example (Plugin Mode)',
    'zh-CN': '基础示例（插件模式）',
    'zh-TW': '基本範例（插件模式）',
    'ja-JP': '基本例（プラグインモード）',
  },
  description: {
    'en-US':
      'Register a broad Univer Sheets feature stack explicitly while preserving one shared Preview/export implementation.',
    'zh-CN': '显式注册完整的 Univer Sheets 功能栈，并让 Preview 与导出共享同一实现。',
    'zh-TW': '明確註冊完整的 Univer Sheets 功能堆疊，並讓 Preview 與匯出共用同一實作。',
    'ja-JP': '幅広い Univer Sheets 機能を明示登録し、Preview とエクスポートで同じ実装を共有します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Plugin Mode'],
    'zh-CN': ['Univer Sheets', '插件模式'],
    'zh-TW': ['Univer Sheets', '外掛模式'],
    'ja-JP': ['Univer Sheets', 'プラグインモード'],
  },
}

export const files = readShowcaseFiles(import.meta.url, {
  '/reference/preview.tsx.txt': './preview/main.tsx',
  '/src/index.ts': './code/index.ts',
  '/src/data.ts': './code/data.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/styles.css': './code/styles.css',
})

export default { metadata, files, Preview }
