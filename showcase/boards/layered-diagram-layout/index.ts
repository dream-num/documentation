import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'boards' as const,
  category: 'features' as const,
  previewHeight: 950,
  group: { 'en-US': 'Shapes', 'zh-CN': '形状' },
  title: { 'en-US': 'Layered Diagram Layout', 'zh-CN': '分层图表布局' },
  description: {
    'en-US': 'Compare horizontal and vertical layers, unequal-size cross-axis alignment and native bound connectors.',
    'zh-CN': '对比水平、垂直分层以及不等大节点跨轴对齐与原生绑定连接线。',
  },
  tags: { 'en-US': ['Boards', 'Layout', 'Connectors'], 'zh-CN': ['Boards', '布局', '连接线'] },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui', '@univerjs-pro/license'],
  apis: [{ name: 'FBoard.arrangeElementsInLayers()' }],
  variants: [
    { id: 'horizontal', label: { 'en-US': 'Horizontal layers', 'zh-CN': '水平分层' } },
    { id: 'vertical', label: { 'en-US': 'Vertical layers', 'zh-CN': '垂直分层' } },
    { id: 'unequal', label: { 'en-US': 'Unequal sizes and cross-axis alignment', 'zh-CN': '不等大节点与跨轴对齐' } },
  ],
  actions: [],
  states: [],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
