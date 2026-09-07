import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Layout', 'zh-CN': '布局' },
  title: { 'en-US': 'Shapes in Documents', 'zh-CN': '文档中的形状' },
  description: {
    'en-US':
      'Edit native shapes in a museum access memo: geometry, label, style, placement, paragraph anchors and drawing order.',
    'zh-CN': '在博物馆无障碍路线备忘录中编辑原生形状：几何、标签、样式、位置、段落锚点与层级。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Shapes'], 'zh-CN': ['现代文档', '单功能', '形状'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/docs-shape',
    '@univerjs-pro/docs-shape-ui',
    '@univerjs-pro/engine-shape',
    '@univerjs-pro/shape-editor-ui',
    '@univerjs-pro/docs-column',
    '@univerjs-pro/docs-column-ui',
    '@univerjs-pro/docs-table',
    '@univerjs-pro/docs-table-ui',
    '@univerjs-pro/docs-chart',
    '@univerjs-pro/docs-chart-ui',
    '@univerjs-pro/engine-chart',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/license',
  ],
  apis: [
    'InsertDocShapeCommand',
    'FDocument.getShape()',
    'FShape.setShapeType()',
    'FShape.setSize()',
    'FShape.setAbsolutePosition()',
    'FShape.setRotation()',
    'FShape.setShapeData()',
    'FShape.getText()',
    'FShape.bringToFront()',
    'FShape.sendToBack()',
    'UpdateDocDrawingWrappingStyleCommand',
    'FDocument.insertText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Aster is an original fictional museum visitor-experience team. Two overlapping native shapes accompany a decision heading, two access-plan columns, a workstream table, a CC0 route sketch and a visitor chart. These independent references expose unwanted side effects.',
      'zh-CN':
        'Aster 是原创虚构博物馆访客体验团队。决策标题旁有两个叠放的原生形状，另有双栏方案、工作表格、CC0 路线图和访客图表，用于检查修改的影响范围。',
    },
    tryIt: {
      'en-US': [
        'Compare four geometries, three styles and editable labels.',
        'Resize, rotate and move the selected shape; X is page-relative and Y is anchor-relative.',
        'Compare five wrapping modes. Behind text changes the document layer; Arrange changes drawing order.',
        'Insert a note before the decision, then reload the snapshot and inspect the actual paragraph anchor and render layer.',
        'Delete and reinsert at the review checkpoint. The anchor selector applies only to insertion.',
        'Check Undo/Redo, invalid inputs, empty state, Reset and narrow-window reflow.',
      ],
      'zh-CN': [
        '比较四种形状、三种样式与可编辑标签。',
        '调整尺寸、旋转与位置；X 相对页面，Y 相对锚点。',
        '比较五种环绕；文字后方改变文档渲染层，排列改变绘图顺序。',
        '在决策前插入说明，重载快照并检查真实锚点和渲染层。',
        '删除后在复查段落重新插入；锚点选择仅用于插入。',
        '检查撤销重做、非法输入、空状态、重置与窄屏重排。',
      ],
    },
    expected: {
      'en-US':
        'Preview and copied source share the same implementation. Native shapes require docs-shape and docs-shape-ui; the extra preset registers License before replacing the core formula plugin with Pro Formula. Geometry, text, style, placement and drawing order use real SDK APIs. Reload preserves paragraph anchors, document layers and relative drawing order; numeric renderer z-index can be renumbered within a layer. Default geometry adjustments can materialize on reload without changing resolved handles. Known beta.2 SDK defect: narrow text layout reads breakType from a missing line segment and throws, leaving rendered layout at its previous width. This also occurs without shapes and without prior snapshot/history operations. Inspect retains the error; widening recovers the same document. The strict layout test remains failing. Explicit shape dimensions are retained and may overflow narrow pages. Viewport changes do not add Undo history. Documentation theme changes recreate the demo with its original fixture; the standalone entry defaults to light. This blueprint remains partial.',
      'zh-CN':
        '预览与复制源码共用实现。原生形状需注册 docs-shape、docs-shape-ui，并用额外 preset 先注册 License，再将普通公式引擎替换为 Pro Formula。几何、文字、样式、位置与排列均调用真实 SDK。重载保留段落锚点、文档层和相对排列；层内 z-index 数值可能重新编号，默认几何参数也可能显式写入，但解析后的控制点不变。已确认的 beta.2 SDK 缺陷：窄屏文字排版读取不存在行分段的 breakType 后抛错，实际布局停留在先前宽度；没有形状、没有先前快照或历史操作也会发生。Inspect 保留错误提示，加宽窗口可恢复同一份文档；严格布局测试仍失败。形状保留明确尺寸，可能超出窄页；窗口变化不增加撤销历史。文档站主题切换会重建案例并恢复初始数据，独立示例默认浅色。此蓝图仍为部分完成。',
    },
  },
  variants: [
    'rectangle',
    'rounded-rectangle',
    'ellipse',
    'diamond',
    'approved',
    'review',
    'outline',
    'inline',
    'square',
    'top-and-bottom',
    'behind-text',
    'in-front-of-text',
  ].map((id) => ({ id, label: { 'en-US': id } })),
  actions: [
    'insert',
    'type',
    'move',
    'size',
    'rotate',
    'style',
    'text',
    'wrap',
    'order',
    'prepend',
    'show',
    'chart',
    'delete',
    'undo',
    'redo',
    'inspect',
    'reload',
    'empty',
    'reset',
  ].map((id) => ({ id, label: { 'en-US': id } })),
  states: ['default', 'edited', 'empty', 'error'].map((id) => ({ id, label: { 'en-US': id } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
