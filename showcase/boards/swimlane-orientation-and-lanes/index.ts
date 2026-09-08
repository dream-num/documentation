import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/boards-swimlane-orientation-and-lanes.png',
  product: 'boards' as const,
  category: 'features' as const,
  group: { 'en-US': 'Containers and swimlanes', 'zh-CN': '容器与泳道' },
  title: { 'en-US': 'Swimlane orientation and lanes', 'zh-CN': '泳道方向与布局' },
  description: {
    'en-US': 'Compare horizontal and vertical lanes, unequal sizes and collapsed lanes with retained child records.',
    'zh-CN': '对比横向、纵向泳道，不等尺寸与保留子元素的折叠状态。',
  },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui'],
  tags: { 'en-US': ['Swimlanes', 'Orientation', 'Layout'], 'zh-CN': ['泳道', '方向', '布局'] },
  apis: [
    'FBoard.renameSwimlaneLane()',
    'FBoard.setSwimlaneLaneSize()',
    'FBoard.reorderSwimlaneLane()',
    'FBoard.setSwimlaneLaneCollapsed()',
  ].map((name) => ({ name })),
  variants: [
    ['horizontal', 'Horizontal lanes', '横向泳道'],
    ['vertical', 'Vertical lanes', '纵向泳道'],
    ['unequal', 'Unequal sizes', '不等尺寸'],
    ['collapsed', 'Collapsed with retained children', '保留子元素的折叠'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [],
  guide: {
    overview: {
      'en-US': 'Real swimlane containers and lane membership, not grouped rectangles or a host layout.',
      'zh-CN': '使用真实泳道容器与子元素归属，不以矩形组合或宿主布局替代。',
    },
    tryIt: {
      'en-US': [
        'Compare the three native containers.',
        'Right-click a lane header to rename, reorder or collapse it.',
        'Expand Review in the unequal container to reveal its retained card.',
        'Run the four literal Facade recipes in README.',
      ],
      'zh-CN': [
        '比较三个原生容器。',
        '右击泳道标题以重命名、排序或折叠。',
        '展开不等尺寸容器的 Review，查看保留的卡片。',
        '运行 README 的四段 Facade 代码。',
      ],
    },
    expected: {
      'en-US':
        'Lane IDs remain stable across names and order. Collapse retains children. Native interaction acceptance and limitations are recorded separately.',
      'zh-CN': '重命名与排序保持泳道 ID，折叠保留子元素。原生交互验收与限制单独记录。',
    },
  },
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
