import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'boards',
  category: 'features',
  group: { 'en-US': 'Element organization', 'zh-CN': '元素组织' },
  title: { 'en-US': 'Groups, Locks, and Layer Order', 'zh-CN': '分组、锁定与图层顺序' },
  description: {
    'en-US':
      'Build a deterministic two-level asset group, focus nested content, protect geometry with locks, and compare four z-order operations against the live layer list.',
    'zh-CN': '构建确定性的两级素材分组、聚焦嵌套内容、通过锁定保护几何位置，并将四种层级操作与实时图层列表比较。',
  },
  tags: { 'en-US': ['Boards', 'Single feature', 'Layers'], 'zh-CN': ['白板', '单功能', '图层'] },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui', '@univerjs-pro/license'],
  apis: [
    'FBoard.wrapElementsInContainer()',
    'FBoard.getContainerChildren()',
    'FBoard.getContainerDescendants()',
    'FBoard.getElementParentChain()',
    'FUniver.syncExecuteCommand()',
    'SetBoardElementsMetadataOperation',
    'FBoard.translateElement()',
    'FBoard.focusElement()',
    'FBoard.bringElementsToFront()',
    'FBoard.bringElementsForward()',
    'FBoard.sendElementsBackward()',
    'FBoard.sendElementsToBack()',
    'FBoard.disbandContainer()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'A museum campaign combines three overlapping media cards, a priority badge, two review decisions, publishing and archive nodes, twelve routes, and one intentionally detached route. Stable IDs make the hierarchy and order directly testable.',
      'zh-CN':
        '博物馆活动包含三张重叠素材卡、一枚优先级徽章、两个审核决策节点、发布与归档节点、十二条路径，以及一条有意断开的路径。稳定 ID 让层级和顺序可以直接验收。',
    },
    tryIt: {
      'en-US': [
        'Apply each layer variant after Reset and compare Priority in the order array.',
        'Group media, then nest the group with Priority. Inspect direct children, all descendants, and Caption’s two-level parent chain.',
        'Focus nested Caption and verify both selectedIds and focusedId in the SDK snapshot.',
        'Lock all three media cards atomically and try moving Caption; the SDK rejects the command without changing its geometry.',
        'Unlock the cards and move their group by 80 × 40, then Undo/Redo and compare every child bound.',
        'Undo and Redo grouping, nesting, and Ungroup all. Repeating Group media reuses the restored group. Compare sibling order: beta.2 has a known disband Undo defect.',
        'Test missing input and an empty board, then Reset or remount.',
      ],
      'zh-CN': [
        '每次重置后应用一种图层变体，并在顺序数组中比较 Priority 的位置。',
        '先组合素材，再把该组与 Priority 嵌套；检查直接子项、全部后代以及 Caption 的两级父链。',
        '聚焦嵌套的 Caption，并在 SDK 快照中同时验证 selectedIds 与 focusedId。',
        '一次锁定三张素材卡后尝试移动 Caption；SDK 拒绝命令，其几何位置保持不变。',
        '解锁素材卡并将所在分组移动 80 × 40，然后撤销/重做并比较所有子项边界。',
        '撤销/重做组合、嵌套与解除分组；再次组合素材会复用恢复的组。比较兄弟节点顺序：beta.2 存在解除分组撤销后的排序缺陷。',
        '测试缺失输入和空白板，然后重置或重新挂载。',
      ],
    },
    expected: {
      'en-US':
        'The order array is back-to-front: larger indexes render closer to the front. Parent chains list the nearest container first; group IDs are derived from the current SDK hierarchy, including after Undo/Redo. Group moves preserve child local transforms while changing their resolved world bounds. beta.2 locking uses the exported SetBoardElementsMetadataOperation because the corresponding Facade helpers reject valid lock patches. Undoing nested disband restores membership but changes sibling z-order; the demo reports that SDK result without correcting it. Both defects are tracked separately. Locked-card rejection and invalid IDs are successful negative demonstrations, not host-side simulations.',
      'zh-CN':
        '顺序数组从后到前排列：索引越大，渲染越靠前。父链先列出最近的容器；分组 ID 从 SDK 当前层级读取，包括撤销/重做后的状态。移动分组时子项局部变换保持不变，而解析后的世界坐标发生变化。beta.2 的锁定使用导出的 SetBoardElementsMetadataOperation，因为对应 Facade 方法会拒绝合法锁定补丁。撤销嵌套分组的解散会恢复成员关系，但会改变兄弟节点顺序；案例直接展示 SDK 结果，不进行纠正。这两个缺陷均单独跟踪。锁定拒绝和非法 ID 属于真实负向演示，并非宿主模拟。',
    },
  },
  variants: [
    ['front', 'Bring Priority to front'],
    ['forward', 'Move Priority one step forward'],
    ['backward', 'Move Priority one step backward'],
    ['back', 'Send Priority to back'],
  ].map(([id, label]) => ({ id, label: { 'en-US': label } })),
  actions: [
    ['layer', 'Apply layer action'],
    ['group', 'Group media'],
    ['nest', 'Nest group + priority'],
    ['focus', 'Focus nested Caption'],
    ['lock', 'Lock media cards'],
    ['locked-move', 'Try moving locked Caption'],
    ['unlock-move', 'Unlock and move group'],
    ['ungroup', 'Ungroup all'],
    ['invalid', 'Try missing element'],
    ['undo', 'Undo'],
    ['redo', 'Redo'],
    ['inspect', 'Inspect'],
    ['fit', 'Fit content'],
    ['empty', 'Empty board'],
    ['reset', 'Reset'],
  ].map(([id, label]) => ({ id, label: { 'en-US': label } })),
  states: ['baseline', 'grouped', 'nested', 'locked', 'empty', 'error'].map((id) => ({
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
