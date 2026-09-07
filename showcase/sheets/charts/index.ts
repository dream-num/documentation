import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Charts and drawings', 'zh-CN': '图表与绘图' },
  packages: [
    '@univerjs/presets',
    '@univerjs/preset-sheets-core',
    '@univerjs/preset-sheets-drawing',
    '@univerjs/preset-sheets-advanced',
  ],
  apis: [
    { name: 'FWorksheet.newChart() / insertChart() / getCharts() / getChart()' },
    {
      name: 'FChart.getId() / getType() / getInfo() / toBuilder() / update() / remove() / exportImage() / setTitle() / setPalette() / setLegend() / setSize()',
    },
    {
      name: 'Chart builder: setSource() / setCategoryFields() / setValueFields() / setMultiLevelCategoryAxis() / setTheme() / setPalette() / setTitle() / setLegend() / setSize()',
    },
    { name: 'FRange.setValue() / clearContent() / getRawValues(); FWorksheet.scrollToCell()' },
    { name: 'FUniver.registerTheme() / undo() / redo() / disposeUnit(); FWorkbook.save()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Aster observatory uses an original 24-month energy table: grid imports and exports, demand, targets, zero, decimals and missing sensor readings. Compare native chart types and data mappings. A separate station/quarter table demonstrates a two-level category axis.',
      'zh-CN':
        'Aster 观测站采用原创的 24 个月能耗数据，包含电网输入与输出、需求、目标、零、小数和传感器缺测。对比原生图表类型和数据映射，另有站点/季度表演示两级分类轴。',
    },
    tryIt: {
      'en-US': [
        'Apply Column, Line, Bar, Area, custom theme or Station/quarter. Apply changes one existing chart; Create adds another. Compare the stable chart ID in Inspect.',
        'Switch the monthly source between all 24 months and explicit 2025/2026 header-and-value vectors. Station/quarter uses A31:D39; switching back restores monthly category/value mapping.',
        'Write or clear B4, negative B8, zero B10, blank B11 or decimal B12. Watch the source-linked native chart. C32 affects only the station/quarter chart.',
        'Apply one style property (palette, title or legend) or size through its direct Facade setter, then compare Undo/Redo. Full update (variant/source) takes three history steps in beta.2 despite the one-step API contract; its first Undo may be visually unchanged. Native editing and dragging remain available. The host target selector is not native drawing selection.',
        'Download a PNG from the native chart renderer and workbook JSON from save(). Remove leaves source data intact. Empty retains labels and station data; Reset recreates the workbook with a fresh ID.',
      ],
      'zh-CN': [
        '应用柱形、折线、条形、面积、自定义主题或站点/季度变体。Apply 修改已有图表，Create 新增图表；检查稳定的图表 ID。',
        '切换全部 24 个月与显式表头/数值向量形式的 2025、2026 数据源。站点/季度使用 A31:D39，切回月度会恢复月度分类与数值映射。',
        '写入或清空 B4、负数 B8、零 B10、缺测 B11、小数 B12，对照原生图表变化。C32 只影响站点/季度图表。',
        '通过独立 Facade setter 应用配色、标题、图例之一或尺寸，再对照撤销/重做。beta.2 的完整更新（变体/数据源）实际有三个历史步骤，与单步契约不符，第一次撤销可能无可见变化。保留原生编辑及拖动；宿主目标选择不是原生绘图选中状态。',
        '通过原生图表渲染器下载 PNG，通过 save() 下载工作簿 JSON。删除图表不删除数据；Empty 保留标签和站点数据，Reset 用新 ID 重建工作簿。',
      ],
    },
    expected: {
      'en-US':
        'Preview and exported project use the same handlers, fixtures and Core/Drawing/Advanced CSS. Host controls require no server. JSON is not XLSX export; unrelated Advanced-preset features are outside this case. beta.2 omits FSheetChart declarations, so this example types the returned live chart through its public FChart base. Theme changes discard edits. Trial limitations remain visible.',
      'zh-CN':
        '预览与导出共享处理函数、数据及 Core/Drawing/Advanced CSS，宿主控件不需要服务器。JSON 不是 XLSX 导出，Advanced 中其他功能不属于本例范围。beta.2 缺少 FSheetChart 声明，本例使用其公开 FChart 基类约束返回对象。主题切换丢弃编辑，试用限制如实保留。',
    },
  },
  variants: [
    ['column', 'Column', '柱形'],
    ['line', 'Line', '折线'],
    ['bar', 'Bar', '条形'],
    ['area', 'Area', '面积'],
    ['theme', 'Custom chart theme', '自定义图表主题'],
    ['multilevel', 'Station / quarter categories', '站点 / 季度多级分类'],
    ['source', '24 months or explicit year vectors', '24 个月或年度显式向量'],
    ['values', 'Positive / negative / zero / missing / decimal', '正数 / 负数 / 零 / 缺测 / 小数'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    [
      'chart',
      'Create / apply variant / remove',
      '创建 / 应用变体 / 删除',
      'Use native builders and stable chart IDs.',
      '使用原生构建器和稳定图表 ID。',
    ],
    [
      'source',
      'Change source / write / clear',
      '切换数据源 / 写入 / 清空',
      'Change real ranges and chart mappings.',
      '修改真实单元格区域与图表映射。',
    ],
    [
      'style',
      'Style / size / reveal',
      '样式 / 尺寸 / 定位',
      'Update chart configuration or scroll the native sheet.',
      '更新图表配置或滚动原生工作表。',
    ],
    [
      'history',
      'Undo / Redo',
      '撤销 / 重做',
      'Use SDK history for the active workbook.',
      '使用当前工作簿的 SDK 历史。',
    ],
    [
      'inspect',
      'Inspect / PNG / JSON',
      '检查 / PNG / JSON',
      'Read actual Facade state and download native results.',
      '读取实际 Facade 状态并下载原生结果。',
    ],
    [
      'reset',
      'Empty / Reset',
      '清空 / 重置',
      'Clear monthly values or recreate the original workbook.',
      '清空月度数值或重建原创工作簿。',
    ],
  ].map(([id, en, zh, de, dz]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': de, 'zh-CN': dz },
  })),
  states: [
    ['pending', 'Native operation pending', '原生操作执行中'],
    ['default', 'Source-linked chart', '数据源关联图表'],
    ['empty', 'Empty monthly readings', '月度数据为空'],
    ['removed', 'No target chart', '没有目标图表'],
    ['error', 'Invalid input or SDK failure', '输入无效或 SDK 失败'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  title: {
    'en-US': 'Charts',
    'zh-CN': '图表',
    'zh-TW': '圖表',
    'ja-JP': 'チャート',
  },
  description: {
    'en-US': 'This example demonstrates how to create and manipulate charts in Univer Sheets',
    'zh-CN': '本示例演示了如何使用 Univer Sheets 创建和操作电子表格中的图表',
    'zh-TW': '本範例演示了如何在 Univer Sheets 中創建和操作圖表',
    'ja-JP': 'この例では、Univer Sheets でチャートを作成および操作する方法を示します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
}

export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/function.ts': './code/function.ts',
  '/src/theme.json': './code/theme.json',
  '/src/data.ts': './code/data.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/styles.css': './code/styles.css',
})

export default {
  metadata,
  files,
  Preview,
}
