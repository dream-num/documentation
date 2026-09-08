import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'slides' as const,
  category: 'features' as const,
  image: '/assets/showcase/slides-connectors-and-endpoints.png',
  group: { 'en-US': 'Shapes and diagrams', 'zh-CN': '形状与图示' },
  title: { 'en-US': 'Connectors and endpoints', 'zh-CN': '连接线与端点' },
  description: {
    'en-US': 'Compare real bound straight and elbow connectors with a free endpoint.',
    'zh-CN': '对比真实绑定的直线、折线连接线及自由端点。',
  },
  packages: ['@univerjs-pro/slides', '@univerjs-pro/slides-ui'],
  tags: { 'en-US': ['Connectors', 'Shapes'], 'zh-CN': ['连接线', '形状'] },
  apis: [
    'FConnectorShape.bindStart()',
    'FConnectorShape.bindEnd()',
    'FConnectorShape.unbindEnd()',
    'FConnectorShape.getRoutePoints()',
  ].map((name) => ({ name })),
  variants: [
    ['straight', 'Bound straight', '绑定直线'],
    ['elbow', 'Bound elbow', '绑定折线'],
    ['free', 'One free end', '单个自由端点'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
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
