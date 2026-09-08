import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'boards' as const,
  category: 'features' as const,
  group: { 'en-US': 'Images', 'zh-CN': '图片' },
  title: { 'en-US': 'Images, fit and crop', 'zh-CN': '图片、适配与裁剪' },
  description: {
    'en-US': 'Compare original wide, square and portrait Board images with a source crop and native transforms.',
    'zh-CN': '对比原创宽幅、方形与纵向 Board 图片、源图裁剪及原生变换。',
  },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui'],
  tags: { 'en-US': ['Images', 'Crop', 'Transform'], 'zh-CN': ['图片', '裁剪', '变换'] },
  apis: ['FBoard.insertImage()', 'FBoard.updateElement()', 'FBoard.setElementTransform()'].map((name) => ({ name })),
  variants: [
    ['wide', 'Wide', '宽幅'],
    ['square', 'Square', '方形'],
    ['portrait', 'Portrait', '纵向'],
    ['cropped', 'Center crop', '居中裁剪'],
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
