import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'boards',
  category: 'features',
  previewHeight: 900,
  group: { 'en-US': 'Diagram layout', 'zh-CN': '图形布局' },
  title: { 'en-US': 'Alignment, Distribution, and Guides', 'zh-CN': '对齐、分布与辅助线' },
  description: {
    'en-US':
      'Arrange five differently sized editorial cards. Compare edge and center alignment, equal gaps, custom spacing, and native drag guides.',
    'zh-CN': '排列五张不同尺寸的编辑卡片，比较边缘和中心对齐、等距、自定义间距及原生拖拽辅助线。',
  },
  tags: { 'en-US': ['Boards', 'Single feature', 'Layout'], 'zh-CN': ['画板', '单功能', '布局'] },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui', '@univerjs-pro/license'],
  apis: [
    'FBoard.alignElements()',
    'FBoard.distributeElements()',
    'FBoard.arrangeElements()',
    'FBoard.setElementsTransform()',
    'FBoard.focusElement()',
    'FBoard.getSettings()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'A publishing workflow has five editable cards with unequal widths and heights, plus three supporting nodes and twelve connectors. Only the editorial cards participate in layout actions. Supporting nodes stay fixed.',
      'zh-CN':
        '出版流程包含五张宽高不同的编辑卡片、三个辅助节点和十二条连接线。布局操作只作用于编辑卡片，辅助节点保持位置。',
    },
    tryIt: {
      'en-US': [
        'Shift-click the five top-row cards, then right-click and use the native Align submenu. Compare six alignment directions.',
        'Use native horizontal distribution to compare equal edge gaps, not equal center distances. Supporting nodes should stay outside the selection.',
        'Run the README examples for top alignment plus distribution, or an ordered row with a 40-unit gap. Change gap to 0 or 120 and direction to vertical in source.',
        'Drag Draft close to another card edge to inspect native guides. Hold Ctrl/Cmd during the drag to bypass snapping; use native Undo/Redo.',
        'Use native zoom and object navigation. Reload restores authored data; changing theme preserves edits.',
      ],
      'zh-CN': [
        '按住 Shift 逐个选择上排五张卡片，右键打开原生 Align 子菜单，比较六种对齐方向。',
        '使用原生水平分布比较边到边的等距，而不是中心等距；不要选中下方辅助节点。',
        '运行 README 示例，对齐并分布，或创建间距为 40 的一行；在源码中把间距改为 0、120 或把方向改为纵向。',
        '将 Draft 拖近另一卡片边缘，观察原生辅助线；拖动期间按住 Ctrl/Cmd 绕过吸附，使用原生撤销重做。',
        '使用原生缩放和对象导航；刷新恢复初始内容，切换主题保留编辑。',
      ],
    },
    expected: {
      'en-US':
        'The native Board fills the preview; twelve duplicate host buttons and the inspector are removed. Equal gaps are edge-to-edge distances. The README row example issues two SDK commands, so Undo can reverse distribution and alignment separately. Soft, hard and breakaway snapping must be tested independently; a guide alone does not prove exact alignment. Fixed-grid placement is an explicit Facade batch, not a claim about native drag behavior. Source-only boundaries and current acceptance limits are documented in README.',
      'zh-CN':
        '预览空间交给原生 Board，已移除十二个重复宿主按钮和检查器。等距指边到边距离。README 的对齐加分布示例发出两条 SDK 命令，撤销可分别回退。软吸附、精确吸附与脱离需分别验证，辅助线本身不证明精确对齐。固定网格定位由明确的 Facade 批处理实现，不冒充原生拖拽能力。源码边界变体与当前验收限制见 README。',
    },
  },
  variants: [
    ['top', 'Align top edges', '顶端对齐'],
    ['middle', 'Align vertical middles', '垂直居中'],
    ['bottom', 'Align bottom edges', '底端对齐'],
    ['left', 'Align left edges', '左侧对齐'],
    ['center', 'Align horizontal centers', '水平居中'],
    ['right', 'Align right edges', '右侧对齐'],
    ['horizontal', 'Equal horizontal gaps', '水平等距'],
    ['vertical', 'Equal vertical gaps', '垂直等距'],
    ['row', 'Ordered row · custom gap', '有序行 · 自定义间距'],
    ['column', 'Ordered column · custom gap', '有序列 · 自定义间距'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['native-align', 'Native selection and alignment', '原生选择与对齐'],
    ['native-distribute', 'Native distribution and history', '原生分布与历史'],
    ['native-drag', 'Drag guides and keyboard movement', '拖拽辅助线与键盘移动'],
    ['source-spacing', 'Source example / Custom spacing', '源码示例 / 自定义间距'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['baseline', 'Original desk', '初始工作台'],
    ['arranged', 'Arranged cards', '已排列卡片'],
    ['empty', 'Empty source variant', '空白源码变体'],
    ['error', 'Missing target', '目标不存在'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
  '/reference/preview-entry.ts.txt': './preview/index.ts',
})
export default { metadata, files, Preview }
