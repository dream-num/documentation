import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 1000,
  group: { 'en-US': 'Worksheet navigation', 'zh-CN': '工作表导航' },
  title: { 'en-US': 'Viewport and Zoom', 'zh-CN': '视口与缩放' },
  description: {
    'en-US':
      'Compare reading density, scrolling versus selection, and frozen viewport visibility at different native zoom levels.',
    'zh-CN': '通过原生缩放对比阅读密度、滚动与选区的区别，以及冻结视口的可见范围。',
  },
  tags: { 'en-US': ['Zoom', 'Viewport', 'Scrolling', 'Selection'], 'zh-CN': ['缩放', '视口', '滚动', '选区'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FWorksheet.zoom() / getZoom()' },
    { name: 'FWorksheet.scrollToCell() / getScrollState()' },
    { name: 'FWorksheet.getVisibleRange() / getVisibleRangesOfAllViewports()' },
    { name: 'FWorksheet.setActiveRange()' },
  ],
  variants: [
    { id: 'density', label: { 'en-US': '75%, 100% and 150% density', 'zh-CN': '75%、100%与150%阅读密度' } },
    { id: 'navigation', label: { 'en-US': 'Scroll versus selection', 'zh-CN': '滚动与选区' } },
    { id: 'frozen', label: { 'en-US': 'Frozen viewport zoom', 'zh-CN': '冻结视口缩放' } },
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
