import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'pdfs' as const,
  category: 'features' as const,
  previewHeight: 1040,
  group: { 'en-US': 'Objects', 'zh-CN': '对象' },
  title: { 'en-US': 'Object Rotation and Layering', 'zh-CN': '对象旋转与层级' },
  description: {
    'en-US': 'Compare editable text rotation, visual reflection and stacking with native PDF dividers.',
    'zh-CN': '对比可编辑文本旋转、视觉镜像和原生PDF分隔线的层级关系。',
  },
  tags: { 'en-US': ['Objects', 'Rotation', 'Layers'], 'zh-CN': ['对象', '旋转', '层级'] },
  packages: ['@univerjs-pro/pdfs', '@univerjs-pro/pdfs-ui', '@univerjs-pro/pdfs-editor'],
  apis: [
    { name: 'FPdfPageElement.setRotation()' },
    { name: 'FPdfPageElement.setTransform()' },
    { name: 'FPdfPageElement.bringToFront()' },
    { name: 'FPdfPageElement.sendToBack()' },
  ],
  variants: [
    { id: 'rotation', label: { 'en-US': '0, 30 and 90 degree rotations', 'zh-CN': '0、30与90度旋转' } },
    { id: 'reflection', label: { 'en-US': 'Horizontal and vertical reflection', 'zh-CN': '水平与垂直镜像' } },
    { id: 'combined', label: { 'en-US': 'Rotation plus reflection', 'zh-CN': '旋转与镜像组合' } },
    { id: 'layers', label: { 'en-US': 'Text above and below divider', 'zh-CN': '文字位于分隔线上下层' } },
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
