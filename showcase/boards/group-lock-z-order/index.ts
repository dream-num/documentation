import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'boards',
  category: 'features',
  group: { 'en-US': 'Element organization', 'zh-CN': '元素组织' },
  title: { 'en-US': 'Groups, Locks, and Layer Order', 'zh-CN': '分组、锁定与图层顺序' },
  description: {
    'en-US': 'Four native clusters compare overlaps, one-level groups, nested groups and locked versus movable shapes.',
    'zh-CN': '四组原生样张对照重叠层级、单层分组、嵌套分组和锁定／可移动图形。',
  },
  tags: { 'en-US': ['Boards', 'Groups', 'Layers'], 'zh-CN': ['画板', '分组', '图层'] },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui', '@univerjs-pro/license'],
  apis: [
    'FBoard.wrapElementsInContainer()',
    'FBoard.getContainerChildren()',
    'FBoard.getElementParentChain()',
    'FBoard.bringElementsToFront()',
    'FBoard.translateElement()',
    'SetBoardElementsMetadataOperation',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Simple colored shapes show organization directly. Native Board selection and contextual actions remain available; no duplicate host controls or JSON panels.',
      'zh-CN': '简单彩色图形直接展示组织能力，保留原生 Boards 选择和上下文操作，不提供重复宿主控件或 JSON 面板。',
    },
    tryIt: {
      'en-US': [
        'Select an overlapping card and use native layer actions to compare its overlap.',
        'Drag the grouped cluster; inspect the nested cluster using native group selection.',
        'Try dragging Locked and Drag me. Only the unlocked example should move.',
      ],
      'zh-CN': [
        '选择重叠卡片，使用原生图层操作比较遮挡顺序。',
        '拖动单层分组，使用原生分组选择检查嵌套组。',
        '分别拖动已锁定和拖动我，只有未锁定的样张应移动。',
      ],
    },
    expected: {
      'en-US':
        'Grouping is initialized with real FBoard Facades. beta.2 lock Facades reject valid patches, so this demo uses the exported metadata operation. A known nested-disband Undo defect can change sibling z-order; this cleanup does not claim it fixed. Theme updates retain the Board instance.',
      'zh-CN':
        '使用真实 FBoard Facade 初始化分组。beta.2 锁定 Facade 拒绝合法补丁，因此使用导出的元数据操作。撤销嵌套解组可能改变兄弟层级的缺陷仍未宣称修复；主题更新保留 Boards 实例。',
    },
  },
  variants: [
    ['layers', 'Overlapping layers', '重叠层级'],
    ['group', 'Single group', '单层分组'],
    ['nested', 'Nested groups', '嵌套分组'],
    ['locked', 'Locked and movable', '锁定与可移动'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
