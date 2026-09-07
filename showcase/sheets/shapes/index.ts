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
    '@univerjs-pro/engine-shape',
    '@univerjs-pro/sheets-shape',
  ],
  apis: [
    {
      name: 'FWorksheet.insertShape() / getShapes() / getShape() / getDrawingLayout() / setRowHeight() / scrollToCell()',
    },
    {
      name: 'FShape.getSnapshot() / getShapeData() / setShapeData() / setCustomGeometryFromSvgPath() / setAdjustValues()',
    },
    { name: 'FShape.setSolidFill() / setGradientFill() / setImageFill() / setNoneFill() / setStroke()' },
    { name: 'FShape.getText(); FShapeText.setText() / setTextStyle() / setHorizontalAlign() / setVerticalAlign()' },
    {
      name: 'FShape.setAbsolutePosition() / setSize() / setRotation() / bringToFront() / sendToBack() / setVisible() / setSelectable() / remove()',
    },
    { name: 'FSheetShape.getPlacement() / setPlacement(); FShape.getConnectionSites()' },
    {
      name: 'FConnectorShape.bindStart() / bindEnd() / unbindStart() / unbindEnd() / setShapeType() / setStartArrow() / setEndArrow() / getRoutePoints()',
    },
    { name: 'FUniver.undo() / redo() / disposeUnit(); FWorkbook.save() / setActiveSheet()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Explore an original Marlow reservoir commissioning flow using four native shapes and two bound connectors. The independent task table includes 6.5 hours, zero, a missing estimate and 3.25 hours. The original flowchart, image-fill and cropped-image reference galleries remain separate worksheets.',
      'zh-CN':
        '用四个原生形状和两条绑定连接线探索原创 Marlow 水库调试流程。独立任务表包含 6.5 小时、零、缺失估算和 3.25 小时；原有流程图、图片填充与图片裁剪参考页分别保留。',
    },
    tryIt: {
      'en-US': [
        'Choose Intake. Compare eight presets, a custom SVG path and RoundRect adjustment. Create adds another shape; applying a preset preserves the target ID. The selector is a host target, not native drawing selection.',
        'Compare solid, gradient, image, cropped-image and no-fill variants, then change stroke, editable text, text style and alignment. The original image is embedded SVG; crop values are percentages.',
        'Move, rotate, resize or overlap two shapes, then compare front/back order, visibility and selectability. Selectability is not security. Placement preserves bounds; toggle row 1 (before Intake) and row 3 (inside Intake) between 28/68px to compare one-cell, two-cell and absolute anchoring.',
        'Choose a connector and compare straight, elbow, curved and arrowhead variants. Unbind both endpoints, move Intake, then bind Intake to Sample again. Read connection sites, endpoint bindings and actual routes.',
        'Use native editing and inspect actual state. Undo/Redo applies one SDK step; a host action that calls several setters is not an atomic transaction. Empty removes shapes on the active sheet, not cells or floating images. Save JSON, reload the snapshot or reset all four sheets.',
      ],
      'zh-CN': [
        '选择 Intake，对比八种预设、自定义 SVG 路径及圆角调节。Create 新增形状，应用预设保留目标 ID。宿主目标选择不等于原生绘图选中。',
        '对比纯色、渐变、图片、裁剪图片及无填充，再修改描边、文字、文字样式与对齐。原创图片使用内嵌 SVG，裁剪参数采用百分比。',
        '移动、旋转、缩放或叠放两个形状，对比前后层级、可见性及可选中性。可选中性不是权限控制。锚定操作保留边界；将 Intake 前方的第 1 行及其内部的第 3 行在 28/68px 间切换，对比单单元格、双单元格和绝对位置。',
        '选择连接线，对比直线、折线、曲线及箭头。解绑两端后移动 Intake，再绑定 Intake 到 Sample，读取连接点、端点绑定和实际路径。',
        '使用原生编辑并检查真实状态。撤销/重做执行一个 SDK 步骤；多个 setter 组成的宿主操作不是原子事务。Empty 删除当前表的形状，不删单元格或浮动图片。保存 JSON、重新载入快照或重置全部四张表。',
      ],
    },
    expected: {
      'en-US':
        'Preview and standalone export share one implementation, fixtures, and Core/Drawing/Advanced CSS. Controls use installed public Facades without a backend or private SDK services. Reset/reload use new unit IDs; theme changes discard edits. JSON is not XLSX. Compatible controls are enabled by handle type; SmartArt and exhaustive native preset coverage remain outside this case. SDK trial restrictions are not hidden.',
      'zh-CN':
        '预览与独立导出共享实现、数据和 Core/Drawing/Advanced CSS。控件调用已安装的公开 Facade，不依赖后端或私有 SDK 服务。重置/重载使用新单元 ID，主题切换丢弃编辑。JSON 不等于 XLSX。根据句柄类型启用兼容操作；SmartArt 与全部原生预设穷举不属于本例范围，不隐藏试用限制。',
    },
  },
  variants: [
    ['presets', 'Eight basic presets', '八种基本预设'],
    ['custom', 'Custom SVG path / rounded-corner adjustment', '自定义路径 / 圆角调节'],
    ['fill', 'Solid / gradient / image / crop / none', '纯色 / 渐变 / 图片 / 裁剪 / 无填充'],
    ['stroke', 'Solid / dash / opacity', '实线 / 虚线 / 透明度'],
    ['text', 'Plain / bold / italic and alignment', '普通 / 加粗 / 斜体及对齐'],
    ['placement', 'One-cell / two-cell / absolute placement', '单单元格 / 双单元格 / 绝对锚定'],
    ['connectors', 'Straight / elbow / curved connectors', '直线 / 折线 / 曲线连接'],
    ['arrows', 'End / both / no arrowheads', '末端 / 两端 / 无箭头'],
    ['galleries', 'Flowchart / image-fill / cropped-image references', '流程图 / 图片填充 / 裁剪参考'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['geometry', 'Create / geometry / style / text', '创建 / 几何 / 样式 / 文字'],
    ['placement', 'Move / resize / rotate / anchoring', '移动 / 缩放 / 旋转 / 锚定'],
    ['order', 'Order / visibility / selectability', '层级 / 可见性 / 可选中性'],
    ['connector', 'Route / arrows / bind / unbind', '路径 / 箭头 / 绑定 / 解绑'],
    ['history', 'Remove / empty / Undo / Redo', '删除 / 清空 / 撤销 / 重做'],
    ['snapshot', 'Inspect / JSON / reload / reset', '检查 / JSON / 重载 / 重置'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['default', 'Bound workflow', '绑定流程'],
    ['hidden', 'Hidden / non-selectable target', '隐藏 / 不可选目标'],
    ['unbound', 'Free connector endpoints', '自由连接端点'],
    ['empty', 'No shapes on active sheet', '当前表无形状'],
    ['error', 'Invalid input or SDK failure', '输入无效或 SDK 失败'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  title: {
    'en-US': 'Shapes',
    'zh-CN': '形状',
    'zh-TW': '形狀',
    'ja-JP': 'シェイプ',
  },
  description: {
    'en-US': 'This example demonstrates how to create and manipulate shapes in Univer Sheets',
    'zh-CN': '本示例演示了如何使用 Univer Sheets 创建和操作形状',
    'zh-TW': '本範例演示了如何在 Univer Sheets 中創建和操作形狀',
    'ja-JP': 'この例では、Univer Sheets でシェイプを作成し、操作する方法を示します',
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
  '/src/data.ts': './code/data.ts',
  '/src/fixture.ts': './code/fixture.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/styles.css': './code/styles.css',
})

export default {
  metadata,
  files,
  Preview,
}
