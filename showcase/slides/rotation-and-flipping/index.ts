import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'slides' as const,
  category: 'features' as const,
  previewHeight: 900,
  group: { 'en-US': 'Elements', 'zh-CN': '元素' },
  title: { 'en-US': 'Rotation and Flipping', 'zh-CN': '旋转与翻转' },
  description: {
    'en-US': 'Use asymmetric triangles and bent arrows to distinguish rotation, reflection and combined transforms.',
    'zh-CN': '用不对称三角形和折弯箭头区分旋转、镜像与组合变换。',
  },
  tags: { 'en-US': ['Rotation', 'Flip', 'Shapes'], 'zh-CN': ['旋转', '翻转', '形状'] },
  packages: ['@univerjs-pro/slides', '@univerjs-pro/slides-ui', '@univerjs-pro/license'],
  apis: [{ name: 'FShape.setRotation()' }, { name: 'FShape.setTransform()' }, { name: 'FShape.getTransform()' }],
  variants: [
    { id: 'quarter-turn', label: { 'en-US': 'Quarter-turn rotation', 'zh-CN': '四分之一圈旋转' } },
    { id: 'reflection', label: { 'en-US': 'Horizontal and vertical reflection', 'zh-CN': '水平与垂直镜像' } },
    { id: 'combined', label: { 'en-US': 'Half-turn and combined transforms', 'zh-CN': '半圈旋转与组合变换' } },
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
