import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'boards' as const,
  category: 'features' as const,
  previewHeight: 1000,
  group: { 'en-US': 'Shapes', 'zh-CN': '形状' },
  title: { 'en-US': 'Gradient, Opacity and Shadow', 'zh-CN': '渐变、透明度与阴影' },
  description: {
    'en-US': 'Compare native three-stop gradients, translucent fills and sharp or blurred outer shadows.',
    'zh-CN': '对比原生三色渐变、半透明填充，以及清晰或模糊的外阴影。',
  },
  tags: { 'en-US': ['Shapes', 'Gradient', 'Opacity', 'Shadow'], 'zh-CN': ['形状', '渐变', '透明度', '阴影'] },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui', '@univerjs-pro/engine-shape'],
  apis: [{ name: 'FShape.setGradientFill()' }, { name: 'FShape.setSolidFill()' }, { name: 'FShape.update()' }],
  variants: [
    { id: 'linear', label: { 'en-US': 'Linear 0 and 90 degrees', 'zh-CN': '0与90度线性渐变' } },
    { id: 'radial', label: { 'en-US': 'Three-stop radial gradient', 'zh-CN': '三色径向渐变' } },
    { id: 'opacity', label: { 'en-US': '100%, 55% and 20% opacity', 'zh-CN': '100%、55%与20%不透明度' } },
    { id: 'shadow', label: { 'en-US': 'No, sharp and blurred shadow', 'zh-CN': '无阴影、清晰与模糊阴影' } },
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
