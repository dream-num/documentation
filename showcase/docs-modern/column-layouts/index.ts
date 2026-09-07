import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Layout', 'zh-CN': '布局' },
  title: { 'en-US': 'Two-to-Five Column Layouts', 'zh-CN': '两到五栏布局' },
  description: {
    'en-US':
      'Arrange a repair-café memo in real SDK columns, change width ratios and preserve child content through structural edits.',
    'zh-CN': '将维修咖啡馆备忘录排入真实 SDK 分栏，调整宽度比例并验证结构修改后的子内容。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Column groups'], 'zh-CN': ['现代文档', '单功能', '分栏'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/docs-column',
    '@univerjs-pro/docs-column-ui',
    '@univerjs-pro/docs-table',
    '@univerjs-pro/docs-table-ui',
    '@univerjs-pro/docs-chart',
    '@univerjs-pro/docs-chart-ui',
    '@univerjs-pro/engine-chart',
    '@univerjs-pro/license',
  ],
  apis: [
    'FDocument.insertColumnGroup()',
    'FDocument.getColumnGroups()',
    'FDocumentColumnGroup.setWidthRatios()',
    'FDocumentColumnGroup.addColumn()',
    'FDocumentColumnGroup.deleteColumn()',
    'FDocumentColumnGroup.remove()',
    'FDocumentColumn.getInsertOffset()',
    'FDocumentColumn.getContentRange()',
    'FDocumentColumn.appendParagraph()',
    'FDocumentColumn.setText()',
    'FDocument.insertTableFromData()',
    'InsertDocDrawingCommand',
    'InsertDocChartCommand',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Juniper is an original fictional neighborhood repair café. Its welcome and diagnosis columns start at 2:1. Three-, four- and five-column variants add parts, repair and return workstations. A compact booking table is inserted in the final original column; an original CC0 toolbox illustration is inserted in the welcome column. A separate handoff group and repairs chart make unintended changes observable.',
      'zh-CN':
        'Juniper 是原创虚构社区维修咖啡馆，接待与诊断两栏初始比例为 2:1；三至五栏逐步加入零件、维修、归还工作台。预约表插入最后一个原始栏目，原创 CC0 工具示意图插入接待栏。独立交接分栏和维修数量图表用于检查意外变更。',
    },
    tryIt: {
      'en-US': [
        'Compare all four layouts. Load layout rebuilds the memo; Reset always restores the original two-column fixture.',
        'Apply 1,2 or equal widths. Inspect actual column geometry as well as configured ratios; column IDs and child ownership must remain stable.',
        'Choose a column and add another to its left or right, up to five. Deleting a column removes its contents; at least two must remain.',
        'Delete the group, then reinsert it, its booking table and toolbox image. Repeated insertion must not create duplicates.',
        'Append a handoff paragraph or select the column heading for native typing. Check live offsets after each change.',
        'Test Undo/Redo, invalid ratios, missing IDs, empty documents and snapshot reload. The independent handoff group and chart must remain unchanged.',
      ],
      'zh-CN': [
        '比较四种布局；Load layout 重建备忘录，Reset 始终恢复原始双栏。',
        '应用 1,2 或均分比例，比较真实布局和配置，栏目 ID 与子内容归属应稳定。',
        '选择栏目后向左或向右增加至最多五栏。删除栏目也删除其内容，至少保留两栏。',
        '删除主分栏后重新插入分栏、预约表和工具图片；重复插入不应产生副本。',
        '追加交接段落，或选择栏目标题进行原生输入；每次修改后检查实时偏移。',
        '测试撤销重做、非法比例、缺失 ID、空文档及快照重载；独立交接分栏和图表应不变。',
      ],
    },
    expected: {
      'en-US':
        'Preview and displayed source use the same factory. Readback includes actual ColumnGroup ranges, fresh insertion offsets, nested table/image bounds, raw resource identities and chart data. Known beta.2 gaps: the image has a column anchor and layout bounds but the drawing UI hides it; deleting the group removes content anchors while retaining image/table resources, so same-ID reinsertion conflicts. The host reports these orphans before mutating content. Reset recreates the fixture, not a simulated Undo. Strict browser and SDK-only resource tests retain the failures; observed-defect mode checks other behavior and does not complete the blueprint. Setup waits for Rendered. Column creation and its initial text are separate history steps. Show layout uses real skeleton coordinates in the SDK viewport. Fit-width zoom is not text reflow. The original CC0 SVG travels with the source; trial watermarks remain.',
      'zh-CN':
        'Preview 与展示源码共用实现，回读包含真实分栏范围、实时插入偏移、嵌套表格和图片边界、原始资源 ID 与图表数据。beta.2 已知缺口：图片具有栏内锚点及布局尺寸，但绘图 UI 将其隐藏；删除分栏移除内容锚点，却保留图片与表格资源，同 ID 再插入会冲突。宿主在修改内容前明确报告残留资源，Reset 重建案例而非模拟 Undo。严格浏览器与纯 SDK 资源测试保留失败，观察模式只验证其他行为，不代表蓝图完成。绘图在 Rendered 后初始化，创建栏目与填写文字是独立历史步骤。Show layout 使用真实 SDK 布局坐标定位视口。适宽缩放并非文字重排，原创 CC0 SVG 随源码提供；试用水印保留。',
    },
  },
  variants: ['two-columns', 'three-columns', 'four-columns', 'five-columns', 'custom-ratios', 'equal-widths'].map(
    (id) => ({ id, label: { 'en-US': id } }),
  ),
  actions: [
    'load',
    'insert',
    'ratios',
    'equal',
    'add-left',
    'add-right',
    'delete-column',
    'delete-group',
    'table',
    'image',
    'paragraph',
    'select',
    'show-layout',
    'chart',
    'undo',
    'redo',
    'missing',
    'inspect',
    'roundtrip',
    'empty',
    'reset',
  ].map((id) => ({ id, label: { 'en-US': id } })),
  states: ['default', 'edited', 'deleted', 'empty', 'error'].map((id) => ({ id, label: { 'en-US': id } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
