import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  image: '/assets/showcase/sheets-sparkline-types.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Charts', 'zh-CN': '图表' },
  title: { 'en-US': 'Sparkline Types', 'zh-CN': '迷你图类型' },
  description: {
    'en-US': 'Native line, column and win-loss sparklines driven by six weekly observations.',
    'zh-CN': '由六周数据驱动的原生折线、柱形和盈亏迷你图。',
  },
  tags: { 'en-US': ['Sparkline', 'Line', 'Column', 'Win-loss'], 'zh-CN': ['迷你图', '折线', '柱形', '盈亏'] },
  packages: ['@univerjs/preset-sheets-core', '@univerjs-pro/sheets-sparkline', '@univerjs-pro/sheets-sparkline-ui'],
  apis: [
    { name: 'FWorksheet.addSparkline()' },
    { name: 'FSparklineGroup.setConfig()' },
    { name: 'FSparkline.changeDataSource()' },
  ],
  variants: [
    { id: 'line', label: { 'en-US': 'Line trends', 'zh-CN': '折线趋势' } },
    { id: 'column', label: { 'en-US': 'Column volumes', 'zh-CN': '柱形数量' } },
    { id: 'winloss', label: { 'en-US': 'Win-loss signs', 'zh-CN': '盈亏符号' } },
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
