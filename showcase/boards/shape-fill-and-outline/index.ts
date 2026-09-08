import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'boards' as const,
  category: 'features' as const,
  previewHeight: 1000,
  group: { 'en-US': 'Elements', 'zh-CN': '元素' },
  title: { 'en-US': 'Shape Fill and Outline', 'zh-CN': '形状填充与轮廓' },
  description: {
    'en-US': 'Nine native triangle specimens isolate fill, outline weight and dash style without custom controls.',
    'zh-CN': '九个原生三角形分别对照填充、轮廓宽度与线型，不增加自定义控件。',
  },
  tags: { 'en-US': ['Shapes', 'Fill', 'Stroke'], 'zh-CN': ['形状', '填充', '轮廓'] },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FShape.setSolidFill()' },
    { name: 'FShape.setNoneFill()' },
    { name: 'FShape.setGradientFill()' },
    { name: 'FShape.setStrokeWidth()' },
    { name: 'FShape.setStrokeLineDashType()' },
  ],
  variants: [
    { id: 'fills', label: { 'en-US': 'No fill / solid / linear gradient', 'zh-CN': '无填充／实色／线性渐变' } },
    { id: 'weights', label: { 'en-US': '1 / 4 / 8 pt outlines', 'zh-CN': '1／4／8 pt 轮廓' } },
    { id: 'dashes', label: { 'en-US': 'Solid / dash / round dots', 'zh-CN': '实线／虚线／圆点' } },
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
