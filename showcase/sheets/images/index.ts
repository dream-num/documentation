import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-images.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Images and drawings', 'zh-CN': '图片与绘图' },
  title: { 'en-US': 'Cell and floating images', 'zh-CN': '单元格与浮动图片' },
  description: {
    'en-US':
      'Native image editing and 37 executable source, crop, size, anchor, layer and cell variants in Cedar field inventory.',
    'zh-CN': '在 Cedar 野外清单体验原生图片编辑，以及 37 段来源、裁剪、尺寸、锚定、层级和单元格变体。',
  },
  tags: { 'en-US': ['Univer Sheets', 'Images', 'Facade'], 'zh-CN': ['Univer Sheets', '图片', 'Facade'] },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core', '@univerjs/preset-sheets-drawing'],
  apis: [
    {
      name: 'FWorksheet.newOverGridImage / insertImages / updateImages / getImages / getImageById / getDrawingLayout / getActiveImages',
    },
    {
      name: 'FOverGridImage.setPositionAsync / setSizeAsync / setPlacement / setForward / setBackward / setFront / setBack / remove',
    },
    {
      name: 'FOverGridImageBuilder.setImage / setSource / setCropTop / setCropLeft / setCropBottom / setCropRight / setRotate / buildAsync',
    },
    { name: 'FRange.insertCellImageAsync / saveCellImagesAsync / clearContent / getCellDataGrid' },
    {
      name: 'FWorksheet.setRowHeightsForced; FWorkbook.save / undo / redo; FUniver.createWorkbook / disposeUnit / toggleDarkMode',
    },
  ],
  guide: {
    overview: {
      'en-US':
        'Original wide, square and portrait artwork appears as three cell images and three floating drawings. The two-sheet inventory preserves zero stock, decimal mass and a separate checklist. Preview and export share native Grid, complete core/drawing EN/ZH packs and CSS; theme keeps edits.',
      'zh-CN':
        '原创宽幅、方形、竖版图同时展示为三张单元格图和三张浮动图。两表清单保留零库存、小数质量和独立检查单。预览与导出共享原生 Grid、完整中英核心/绘图预设及 CSS；主题切换保留编辑。',
    },
    tryIt: {
      'en-US': [
        'Select and drag an actual floating image; use native handles, image properties and native Undo/Redo.',
        'Run README source replacement, four-edge crop/reset, rotation, wide/square sizing and three anchor variants.',
        'Compare forced row height under each anchor, then overlap drawings and exercise all four layer operations.',
        'Run rectangle top-left and last-cell insertion, clear, cell download, and validated local PNG/JPEG examples. File selection stages only; nothing uploads.',
        'Save the full snapshot, reload with unchanged IDs, open a genuinely blank two-sheet document and restore. Keep strict reload failures visible.',
      ],
      'zh-CN': [
        '选择并拖动真实浮动图片，使用原生控制点、图片属性及原生撤销/重做。',
        '运行 README 的来源替换、四边裁剪/恢复、旋转、宽幅/方形尺寸及三种锚定变体。',
        '对比各锚定模式下的强制行高，再重叠图片并体验四种层级操作。',
        '运行矩形左上角、末格插入、清空、图片下载及带验证的本地 PNG/JPEG 代码。选文件仅准备来源，不上传。',
        '保存完整快照并保留 ID 重载，创建真正的两表空白文档再恢复；保留严格重载失败。',
      ],
    },
    expected: {
      'en-US':
        'Native model, rendered pixels and complete snapshots must agree. Earlier direct-setter paint/history, absolute reload offset and SVG/.png extension failures remain strict regressions; successful detached-builder variants do not erase them. No host fixture, property, history or audit panel is mounted. This does not claim filters, brightness, masks, image formulas or all clipboard/protection combinations.',
      'zh-CN':
        '原生模型、实际像素和完整快照必须一致。既有直接 setter 画布/历史、绝对锚定重载偏移及 SVG/.png 扩展名问题仍独立严格回归，不以构建器变体成功抹去。没有宿主案例、属性、历史或审计面板。不宣称滤镜、亮度、遮罩、图片公式或全部剪贴板/保护组合。',
    },
  },
  variants: [
    ['models', 'Cell and floating images', '单元格与浮动图片'],
    ['sources', 'Original SVG and validated local PNG/JPEG', '原创 SVG 与验证后的本地 PNG/JPEG'],
    ['geometry', 'Wide/square size, crop/reset and rotation', '宽幅/方形尺寸、裁剪/恢复与旋转'],
    ['anchors', 'Move, move-and-size, fixed; forced row heights', '随格移动、随格缩放、固定；强制行高'],
    ['layers', 'Overlap and four layer commands', '重叠与四种层级命令'],
    ['cells', 'Rectangle top-left, final cell and download', '矩形左上角、末格与下载'],
    ['lifecycle', 'Full snapshot, unchanged IDs, empty/restore', '完整快照、保留 ID、空白/恢复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    [
      'native',
      'Select, drag and edit natively',
      '原生选择、拖动与编辑',
      'Use the SDK ribbon, context properties, handles and history.',
      '使用 SDK 功能区、上下文属性、控制点和历史。',
    ],
    [
      'literal',
      'Run literal Facade variants',
      '运行逐段 Facade 变体',
      '37 README blocks preserve source, geometry, file and lifecycle examples without duplicate controls.',
      '37 段 README 保留来源、几何、文件和生命周期示例，不重复添加控件。',
    ],
  ].map(([id, en, zh, den, dzh]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': den, 'zh-CN': dzh },
  })),
  states: [
    ['ready', 'Original two-sheet image inventory', '原创两表图片清单'],
    ['edited', 'Native and Facade edits with real pixels', '原生及 Facade 编辑与真实像素'],
    ['invalid', 'Rejected invalid file or empty download', '无效文件拒绝或空单元格不下载'],
    ['boundary', 'Known direct setter, reload and format limitations', '已知直接 setter、重载及格式边界'],
    ['empty', 'Blank document and full snapshot restore', '空白文档与完整快照恢复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
