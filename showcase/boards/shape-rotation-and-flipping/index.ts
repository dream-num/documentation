import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'boards' as const,
  category: 'features' as const,
  previewHeight: 1000,
  group: { 'en-US': 'Elements', 'zh-CN': '元素' },
  title: { 'en-US': 'Shape Rotation and Flipping', 'zh-CN': '形状旋转与翻转' },
  description: {
    'en-US':
      'Compare native asymmetric triangles and bent arrows with rotation, axis reflections and combined transforms.',
    'zh-CN': '使用原生非对称三角形和弯折箭头，对比旋转、轴向翻转及组合变换。',
  },
  tags: { 'en-US': ['Shapes', 'Rotation', 'Flipping'], 'zh-CN': ['形状', '旋转', '翻转'] },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui', '@univerjs-pro/license'],
  apis: [{ name: 'FShape.setRotation()' }, { name: 'FShape.setTransform()' }, { name: 'FShape.getTransform()' }],
  variants: [
    { id: 'rotation', label: { 'en-US': '0 / 45 / 90 degree rotation', 'zh-CN': '0／45／90 度旋转' } },
    { id: 'reflection', label: { 'en-US': 'Horizontal / vertical / both axes', 'zh-CN': '水平／垂直／双轴翻转' } },
    { id: 'combined', label: { 'en-US': 'Bent arrow rotation and reflection', 'zh-CN': '弯折箭头的旋转与翻转组合' } },
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
