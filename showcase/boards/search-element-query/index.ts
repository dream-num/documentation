import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'boards',
  category: 'features',
  group: { 'en-US': 'Element discovery', 'zh-CN': '元素查找' },
  title: { 'en-US': 'Search and Element Query', 'zh-CN': '搜索与元素查询' },
  description: {
    'en-US':
      'Search a release review, filter shapes or connectors, select unique results, and inspect their SDK-calculated bounding rectangle.',
    'zh-CN': '搜索发布评审白板、筛选图形或连接线、选中唯一结果，并检查 SDK 计算的包围矩形。',
  },
  tags: { 'en-US': ['Boards', 'Single feature', 'Search'], 'zh-CN': ['白板', '单功能', '搜索'] },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui', '@univerjs-pro/license'],
  apis: [
    'FBoard.findElementsByText()',
    'FBoard.describeElements()',
    'FBoard.getElementsBoundingRectByIds()',
    'FBoard.getElementsBoundsByIds()',
    'FBoard.checkElementIds()',
    'IBoardElementStateService.selectElements()',
    'IUniverInstanceService.focusUnit()',
    'FBoard.getShape()',
    'FBoard.focusElement()',
    'FShape.getText().setText()',
    'FBoard.undo()',
    'FBoard.redo()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'An original Orion sensor release review has eight nodes, two decisions, twelve routes, and one detached route. Risk appears in three shape texts and in both the name and label of one connector. The dataset distinguishes text hits from unique selectable elements.',
      'zh-CN':
        '原创 Orion 传感器发布评审包含八个节点、两个决策点、十二条路径和一条断开的路径。三张图形文字以及一条连接线的名称和标签包含 Risk，用于区分文字命中数与可选择的唯一元素数。',
    },
    tryIt: {
      'en-US': [
        'The initial Risk + Shapes query returns supply, review-a, and compliance. Its rectangle is (310, 60, 750, 320).',
        'Switch to All types and Search. One connector has two hits; Select results selects it only once.',
        'Search Approved with Connectors to find a connector label. Lowercase risk and surrounding whitespace use the same SDK matching rules.',
        'List by type ignores the search text. Compare eight shapes, twelve connectors, and all twenty elements.',
        'Select results and use the arrow keys; Refresh query reads their new bounds. Click a result to focus it.',
        'Resolve supplier risk, then Undo/Redo: re-running the SDK search must remove and restore that card.',
        'Try a blank query, an unmatched term, a missing ID, and an empty board; Reset restores the original fixture.',
      ],
      'zh-CN': [
        '初始 Risk + Shapes 查询返回 supply、review-a 与 compliance；包围矩形为 (310, 60, 750, 320)。',
        '切换 All types 后搜索。一条连接线会命中两次，Select results 只会选择一次。',
        '使用 Connectors 搜索 Approved，找到连接线标签；小写 risk 和首尾空格遵循 SDK 的相同匹配规则。',
        'List by type 忽略搜索文字；比较八个图形、十二条连接线与全部二十个元素。',
        '选择结果后用方向键移动，再 Refresh query 读取新边界；点击单条结果可以聚焦。',
        '解决供应风险后撤销/重做；重新执行 SDK 搜索会移除或恢复该卡片。',
        '测试空白查询、无匹配词、缺失 ID 与空白板；Reset 恢复原始数据。',
      ],
    },
    expected: {
      'en-US':
        'Text matching uses the SDK Find index, not a host-side replacement. Type filtering intersects those hits with describeElements(). Selection uses the exported Board UI state service; bounds use the Facade union API. Search is case-insensitive substring matching and includes names, IDs, and labels, not only visible body text. A blank text query returns no hits; List by type is the explicit alternative. Native edits require Refresh query. Empty results have null bounds, not a zero-sized rectangle. Fixture coordinates and dates are fixed.',
      'zh-CN':
        '文字匹配使用 SDK Find 索引，不以宿主字符串筛选替代。类型过滤将命中结果与 describeElements() 取交集。选择使用导出的 Board UI 状态服务，边界使用 Facade 联合包围框 API。搜索不区分大小写，使用子串匹配，范围包含名称、ID 和标签，不局限于可见正文。空白搜索返回零命中，可用 List by type 查询类型。原生编辑后需 Refresh query。空结果的包围框为 null，而非零尺寸矩形；案例坐标与日期固定。',
    },
  },
  variants: [
    ['text-shapes', 'Risk in shapes'],
    ['text-all', 'Risk across all types'],
    ['text-connectors', 'Connector labels'],
    ['type-only', 'Type-only discovery'],
  ].map(([id, label]) => ({ id, label: { 'en-US': label } })),
  actions: [
    ['search', 'Search'],
    ['type', 'List by type'],
    ['select', 'Select results'],
    ['clear', 'Clear selection'],
    ['resolve', 'Resolve supplier risk'],
    ['undo', 'Undo'],
    ['redo', 'Redo'],
    ['invalid', 'Try missing ID'],
    ['inspect', 'Refresh query'],
    ['fit', 'Fit content'],
    ['empty', 'Empty board'],
    ['reset', 'Reset'],
  ].map(([id, label]) => ({ id, label: { 'en-US': label } })),
  states: ['baseline', 'selected', 'resolved', 'no-matches', 'empty', 'error'].map((id) => ({
    id,
    label: { 'en-US': id },
  })),
}

const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
