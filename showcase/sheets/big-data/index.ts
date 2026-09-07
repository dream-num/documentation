import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Performance', 'zh-CN': '性能' },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FWorksheet.getMaxRows() / getMaxColumns() / setRowCount() / getLastRow() / getLastColumn()' },
    { name: 'FWorksheet.getRange() / setActiveRange() / scrollToCell() / getVisibleRange()' },
    { name: 'FRange.setValues() / setValue() / clearContent() / getRawValues() / activate()' },
    { name: 'FUniver.undo() / redo(); FWorkbook.save()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Marlow reservoir uses a one-million-row native worksheet without allocating ten million cells during module import. One hundred varied records load initially; choose capacity, position and a 250/1,000/5,000-row deterministic window for controlled bulk-write and scroll comparisons.',
      'zh-CN':
        'Marlow 水库使用原生百万行工作表，但不会在模块导入时分配一千万个单元格。初始载入 100 条多样记录，可选择容量、位置及 250/1,000/5,000 行确定性窗口，对比可控的批量写入与滚动。',
    },
    tryIt: {
      'en-US': [
        'Switch among 10,000, 100,000 and 1,000,000 rows through setRowCount. Capacity is worksheet extent, not populated-cell count. beta.2 retains out-of-bounds data, so this host action first clears actual sparse values beyond the new capacity, including overlapping loads and native edits.',
        'Load 250, 1,000 or 5,000 × 10 values near the top, middle, bottom or a validated custom row with one setValues call. Compare IDs, decimals, zero, missing pH, negative variance, statuses and owners.',
        'Jump to the selected window using the native active range and scroll Facades. Host elapsed time is not a rendering/FPS benchmark.',
        'Edit or clear values directly in the native worksheet; use its own Undo/Redo controls.',
        'Download the current sparse workbook JSON. This is a snapshot, not XLSX conversion. Loading an overlapping window overwrites its existing values.',
      ],
      'zh-CN': [
        '通过 setRowCount 在 10,000、100,000 与 1,000,000 行间切换。容量表示工作表范围，不代表已填充单元格数。beta.2 会保留越界数据，所以该宿主操作会先清除实际稀疏快照中的越界值，覆盖重叠窗口和原生编辑。',
        '通过一次 setValues，在顶部、中部、底部或校验后的自定义行写入 250、1,000 或 5,000 × 10 个值。对比 ID、小数、零、缺失 pH、负方差、状态和负责人。',
        '通过原生活动区域与滚动 Facade 跳转到选定窗口。宿主调用耗时不是渲染或 FPS 基准。',
        '直接在原生工作表中编辑或清除值，使用原生撤销与重做。',
        '下载当前稀疏工作簿 JSON。这是快照，不是 XLSX 转换。载入重叠窗口会覆盖已有值。',
      ],
    },
    expected: {
      'en-US':
        'Preview and export share the factory, original data, Core CSS and complete EN/ZH packs. Theme changes retain the edited owner. Capacity cleanup reads actual sparse values, not a load-history cache, and covers overlapping windows and native edits. Native loading, navigation and JSON download work without a backend. Strict beta.2 history gaps remain: Undo after native typing, bulk overwrite or clearing the initial data window adds cell type fields; native typing also leaves an additional style entry. All three Redo snapshots match exactly. No model fields are normalized to claim a pass. Capacity cleanup is a compound action, not a single atomic Undo transaction. Data generation and timing are host integration; this does not claim automatic loading, ten million resident cells, FPS, memory or universal performance.',
      'zh-CN':
        '预览与导出共享工厂、原创数据、Core CSS 和完整中英文依赖包，主题切换保留已编辑实例。容量清理依据实际稀疏数值而非加载历史缓存，覆盖重叠窗口和原生编辑。原生载入、导航与 JSON 下载无需后端。beta.2 仍有严格历史缺口：原生输入、批量覆写、清空初始数据区域后的撤销会增加单元格类型字段；原生输入还留下额外样式条目。三项重做快照均精确通过，未通过归一化模型字段伪造通过。容量清理是复合操作，不是单步原子撤销事务。数据生成和计时属于宿主集成，不声称自动载入、一千万常驻单元格、FPS、内存或通用性能结论。',
    },
  },
  variants: [
    ['capacity', '10K / 100K / 1M row capacity', '1 万 / 10 万 / 100 万行容量'],
    ['windows', 'Top / middle / bottom / custom windows', '顶部 / 中部 / 底部 / 自定义窗口'],
    ['chunks', '250 / 1,000 / 5,000-row chunks', '250 / 1,000 / 5,000 行分块'],
    ['values', 'Text / numeric / zero / missing / negative / decimal', '文本 / 数值 / 零 / 缺失 / 负数 / 小数'],
    ['sparse', 'Sparse snapshot download', '稀疏快照下载'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['load', 'Capacity / bulk-load window', '容量 / 批量载入窗口'],
    ['navigation', 'Jump to window', '跳转到窗口'],
    ['edit', 'Native worksheet editing and history', '原生工作表编辑与撤销重做'],
    ['download', 'Download sparse JSON', '下载稀疏 JSON'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['default', 'One million rows / 100 records', '百万行 / 100 条记录'],
    ['loaded', 'Additional loaded windows', '更多已载入窗口'],
    ['reduced', 'Reduced worksheet capacity', '缩小工作表容量'],
    ['empty', 'Native-cleared data window / header retained', '原生清空数据区域 / 保留表头'],
    ['error', 'Invalid custom row or capacity', '自定义行或容量无效'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  title: {
    'en-US': 'Large Grid and Bulk Data',
    'zh-CN': '大网格与批量数据',
    'zh-TW': '大網格與批次資料',
    'ja-JP': '大規模グリッドと一括データ',
  },
  description: {
    'en-US':
      'Compare million-row capacity, sparse deterministic data windows, bulk writes and native navigation without preallocating ten million cells.',
    'zh-CN': '对比百万行容量、稀疏确定性数据窗口、批量写入和原生导航，避免预先分配一千万个单元格。',
    'zh-TW': '比較百萬行容量、稀疏確定性資料視窗、批次寫入和原生導覽，避免預先分配一千萬個儲存格。',
    'ja-JP': '1,000万セルを事前割り当てせず、100万行、疎な決定的データ窓、一括書き込み、ネイティブ移動を比較します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode', 'Performance'],
    'zh-CN': ['Univer Sheets', '预设模式', '性能'],
    'zh-TW': ['Univer Sheets', '預設模式', '效能'],
    'ja-JP': ['Univer Sheets', 'プリセットモード', 'パフォーマンス'],
  },
}

export const files = readShowcaseFiles(import.meta.url, {
  '/reference/preview.tsx.txt': './preview/main.tsx',
  '/src/index.ts': './code/index.ts',
  '/src/data.ts': './code/data.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})

export default { metadata, files, Preview }
