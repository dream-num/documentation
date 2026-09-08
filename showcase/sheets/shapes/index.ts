import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Charts and drawings', 'zh-CN': '图表与绘图' },
  title: { 'en-US': 'Shapes', 'zh-CN': '形状' },
  tags: { 'en-US': ['Univer Sheets', 'Shapes'], 'zh-CN': ['Univer Sheets', '形状'] },
  description: {
    'en-US': 'Native galleries for shape geometry, fills, text, connectors and cell anchoring.',
    'zh-CN': '通过原生画廊对比几何、填充、文字、连接线及单元格锚定。',
  },
  packages: [
    '@univerjs/presets',
    '@univerjs/preset-sheets-core',
    '@univerjs/preset-sheets-drawing',
    '@univerjs/preset-sheets-advanced',
    '@univerjs-pro/engine-shape',
    '@univerjs-pro/sheets-shape',
  ],
  apis: [
    { name: 'FWorksheet.insertShape() / getShapes()' },
    { name: 'FShape.setCustomGeometryFromSvgPath() / setAdjustValues()' },
    {
      name: 'FShape.setGradientFill() / setImageFill() / setNoneFill() / setStroke() / setRotation() / bringToFront()',
    },
    { name: 'FShape.getText(); FShapeText.setText() / setTextStyle() / setHorizontalAlign() / setVerticalAlign()' },
    { name: 'FConnectorShape.bindStart() / bindEnd() / setStartArrow() / setEndArrow(); FShape.getConnectionSites()' },
    { name: 'FSheetShape.setPlacement() / getPlacement()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Four worksheets show focused native shape variants without a duplicate control panel. Select and edit shapes with the native drawing tools.',
      'zh-CN': '四张工作表直接展示形状变体，不提供重复控制面板。选择形状，使用原生绘图工具编辑。',
    },
    tryIt: {
      'en-US': [
        'Open Geometry & fills: compare eight presets, rounded-corner adjustment and a custom SVG path. Compare image and cropped-image fills using the original inline illustration.',
        'Open Text & strokes: compare alignment, bold and italic text, dashed and translucent strokes, rotation and overlapping layers. Select a shape to reveal native drawing tools.',
        'Open Bound connectors: drag a start node to compare straight, elbow and curved routes with end-only, two-ended and no arrowheads.',
        'Open Cell anchoring: resize row 1 (before the shapes), then row 3 (inside the shapes) to compare move-only, move-and-size and fixed placement.',
      ],
      'zh-CN': [
        '打开“几何与填充”，对比八种预设、圆角调节、自定义 SVG 路径，以及原创内嵌图片的完整与裁剪填充。',
        '打开“文字与描边”，对比对齐、粗体与斜体、虚线与透明描边、旋转和层叠；选择形状显示原生绘图工具。',
        '打开“绑定连接线”，拖动起点形状，对比直线、折线和曲线，以及末端箭头、双端箭头和无箭头。',
        '打开“单元格锚定”，调整形状前方的第 1 行和内部的第 3 行高度，对比仅移动、移动并缩放、固定位置。',
      ],
    },
    expected: {
      'en-US':
        'Preview and exported source use the same factory, complete English locale packs and official Core/Drawing/Advanced CSS. Theme switches preserve edits. This is not an exhaustive preset or SmartArt catalog; trial notices remain visible.',
      'zh-CN':
        '预览与导出源码共用创建逻辑、完整英文语言包及 Core/Drawing/Advanced 官方 CSS。切换主题保留编辑。本例不声称穷举所有预设或支持 SmartArt；保留试用提示。',
    },
  },
  variants: [
    ['geometry', 'Eight presets and custom path', '八种预设与自定义路径'],
    ['fills', 'Solid / gradient / image / crop / none', '纯色 / 渐变 / 图片 / 裁剪 / 无填充'],
    ['text', 'Text, strokes, rotation and layers', '文字、描边、旋转与层叠'],
    ['connectors', 'Three bound routes and arrowheads', '三种绑定路径与箭头'],
    ['placement', 'Move / move and size / fixed', '移动 / 移动并缩放 / 固定'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [{ id: 'gallery', label: { 'en-US': 'Editable native shapes', 'zh-CN': '可编辑原生形状' } }],
}
export const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './README.md',
  '/src/index.ts': './code/index.ts',
  '/src/function.ts': './code/function.ts',
  '/src/data.ts': './code/data.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
