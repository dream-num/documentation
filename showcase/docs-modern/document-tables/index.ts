import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/docs-modern-document-tables.png',
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Layout', 'zh-CN': '布局' },
  title: { 'en-US': 'Document Tables', 'zh-CN': '文档表格' },
  description: {
    'en-US':
      'Build a seed-library decision register from data, edit cells, manage owner rows, and compare actual SDK table styling and dimensions.',
    'zh-CN': '从数据生成种子图书馆决策表，编辑单元格、管理负责人行，并检查真实 SDK 样式与尺寸。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Tables'], 'zh-CN': ['现代文档', '单功能', '表格'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs-pro/docs-table',
    '@univerjs-pro/docs-table-ui',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/docs-column',
    '@univerjs-pro/docs-column-ui',
    '@univerjs-pro/docs-chart',
    '@univerjs-pro/docs-chart-ui',
    '@univerjs-pro/engine-chart',
    '@univerjs-pro/license',
  ],
  apis: [
    'FDocument.insertTableFromData()',
    'FDocument.getTables()',
    'FDocument.getTable()',
    'FDocumentTable.describe()',
    'FDocumentTable.getCellText()',
    'FDocumentTable.setCellText()',
    'FDocumentTable.appendRow()',
    'FDocumentTable.deleteRow()',
    'FDocumentTable.deleteTable()',
    'FDocumentTable.setCellBackground()',
    'FDocumentTable.setColumnWidth()',
    'FDocumentTable.setRowHeight()',
    'FDocumentTable.distributeColumns()',
    'FDocumentTable.setTableBorder()',
    'FDocumentTable.setBorder()',
    'FDocumentTable.appendColumn()',
    'FDocumentTable.deleteColumn()',
    'FDocumentTable.getCellContentRange()',
    'FDocument.insertColumnGroup()',
    'FDocumentColumn.setText()',
    'InsertDocDrawingCommand',
    'InsertDocChartCommand',
    'FDocument.getCharts()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Cedar is an original seed-library memo with packing, inventory and handoff registers together, an independent packaging comparison table, native two-column narrative, original CC0 illustration and three native charts with different packet counts.',
      'zh-CN':
        'Cedar 原创种子图书馆备忘录同时包含包装、库存和交接决策表，独立包装对照表、原生双栏叙述、原创 CC0 图片及三张数据不同的原生图表。',
    },
    tryIt: {
      'en-US': [
        'Use native Grid/table controls to edit the packing register; scroll to the other business tables, narrative, illustration and charts.',
        'Run literal README recipes for cells, body-row guards, accessibility sign-off, rows/columns, dimensions, borders and header colors.',
        'Compare actual paint and complete Undo/Redo snapshots. Explicit same-ID whole-owner recovery is not Undo.',
      ],
      'zh-CN': [
        '使用原生 Grid 和表格菜单编辑包装表；滚动查看其他业务表、叙述、图片及图表。',
        '运行 README 逐段代码，体验单元格、正文行保护、无障碍签核、行列、尺寸、边框和表头颜色。',
        '比较实际绘制与完整撤销重做快照。同 ID 整体 owner 恢复不是撤销。',
      ],
    },
    expected: {
      'en-US':
        'Native-only shared factory with five official CSS files and complete EN/ZH packs. Same-owner themes retain edits. Fixed resource IDs and original business data travel with export. No dataset loader, property/history/readback panel, internal history clearing or replacement unit IDs. Strict SDK failures remain; native zoom is available but automatic narrow fit is not claimed.',
      'zh-CN':
        '纯原生共享 factory 包含五份官方 CSS 与完整中英文资源。同 owner 主题保留编辑，确定资源 ID 和原创业务数据随导出提供。没有数据加载、属性、历史或读回面板，不清空内部历史或替换单元 ID。严格保留 SDK 失败；可用原生缩放，不宣称自动窄屏适宽。',
    },
  },
  variants: [
    ['packing', 'Packing decisions', '包装决策'],
    ['inventory', 'Inventory reconciliation', '库存核对'],
    ['handoff', 'Weekend handoff', '周末交接'],
    ['custom-header', 'Header colors', '表头配色'],
    ['resized', 'Row and column sizing', '行列尺寸'],
    ['equal-columns', 'Equal columns', '等宽列'],
    ['borders', 'Table borders', '表格边框'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['sample', 'Compare business datasets', '比较业务数据'],
    ['insert', 'Insert packing register', '插入包装表'],
    ['read-cell', 'Read cell text', '读取单元格'],
    ['edit', 'Edit cell text', '编辑单元格'],
    ['select', 'Select native content', '选择原生内容'],
    ['append', 'Add accessibility sign-off', '添加无障碍签核'],
    ['delete-row', 'Delete guarded body row', '删除受保护正文行'],
    ['delete-table', 'Delete packing register', '删除包装表'],
    ['width', 'Resize column', '调整列宽'],
    ['height', 'Resize row', '调整行高'],
    ['header', 'Style header', '设置表头'],
    ['distribute', 'Distribute columns', '均分列'],
    ['comparison', 'Read packaging comparison', '查看包装对照'],
    ['evidence', 'Read original illustration', '查看原创图片'],
    ['chart', 'Compare native charts', '比较原生图表'],
    ['undo', 'Native Undo', '原生撤销'],
    ['redo', 'Native Redo', '原生重做'],
    ['missing', 'Query missing ID', '查询缺失 ID'],
    ['inspect', 'Read Facade resources', '读取 Facade 资源'],
    ['roundtrip', 'Same-ID owner recovery', '同 ID owner 恢复'],
    ['empty', 'Empty draft', '空白草稿'],
    ['restore', 'Restore captured data', '恢复已保存数据'],
    ['border', 'Style borders', '设置边框'],
    ['column', 'Insert or delete column', '插入或删除列'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['default', 'Original memo', '原始备忘录'],
    ['edited', 'Edited', '已编辑'],
    ['owner-added', 'Sign-off added', '已添加签核'],
    ['deleted', 'Deleted', '已删除'],
    ['empty', 'Empty', '空白'],
    ['error', 'Rejected or failed', '拒绝或失败'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
