import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/slides-grouping-and-stacking.png',
  product: 'slides',
  category: 'features',
  group: { 'en-US': 'Elements', 'zh-CN': '元素' },
  title: { 'en-US': 'Grouping and Stacking', 'zh-CN': '组合与叠放' },
  description: {
    'en-US': 'Compare independent cards, a real native group and overlapping shapes with editable stacking order.',
    'zh-CN': '比较独立卡片、原生组合及可编辑叠放顺序的重叠形状。',
  },
  tags: { 'en-US': ['Native Slides', 'Groups', 'Stacking order'], 'zh-CN': ['原生幻灯片', '组合', '叠放顺序'] },
  packages: ['@univerjs-pro/slides', '@univerjs-pro/slides-ui', '@univerjs-pro/engine-shape'],
  apis: [
    { name: 'FSlide.group()' },
    { name: 'FGroup.ungroup()' },
    { name: 'FShape.bringToFront()' },
    { name: 'FShape.sendToBack()' },
  ],
  variants: [
    { id: 'independent', label: { 'en-US': 'Independent cards', 'zh-CN': '独立卡片' } },
    { id: 'grouped', label: { 'en-US': 'Grouped cards', 'zh-CN': '卡片组合' } },
    { id: 'stacking', label: { 'en-US': 'Overlapping cards', 'zh-CN': '重叠卡片' } },
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
