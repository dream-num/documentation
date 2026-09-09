import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'boards' as const,
  category: 'features' as const,
  previewHeight: 1000,
  group: { 'en-US': 'Performance', 'zh-CN': '性能' },
  title: { 'en-US': 'Large Diagram', 'zh-CN': '大规模拓扑图' },
  description: {
    'en-US': 'Navigate and edit 144 native nodes linked by 132 connectors across twelve production lines.',
    'zh-CN': '在十二条生产流程中浏览和编辑 144 个原生节点与 132 条连接线。',
  },
  tags: { 'en-US': ['Performance', 'Diagram'], 'zh-CN': ['性能', '拓扑图'] },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBoard.describeElements()' },
    { name: 'FBoard.focusElement()' },
    { name: 'FBoard.findElementsByText()' },
    { name: 'FShape.setSolidFill()' },
  ],
  variants: [
    { id: 'scale', label: { 'en-US': '277 native elements', 'zh-CN': '277 个原生元素' } },
    { id: 'navigate', label: { 'en-US': 'Zoom, pan and locate', 'zh-CN': '缩放、平移与定位' } },
    { id: 'edit', label: { 'en-US': 'Edit a distant node', 'zh-CN': '编辑远端节点' } },
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
