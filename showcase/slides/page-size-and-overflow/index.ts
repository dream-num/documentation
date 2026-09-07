import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/slides-page-size-and-overflow.png',
  product: 'slides',
  previewHeight: 1040,
  category: 'features',
  group: { 'en-US': 'Deck structure', 'zh-CN': '演示文稿结构' },
  title: { 'en-US': 'Rivet / Page Size and Overflow', 'zh-CN': 'Rivet / 页面尺寸与越界' },
  description: {
    'en-US':
      'Eight repair-library pages compare inherited and overridden sizes, unchanged and scaled content, exact edges and rotation in the native editor.',
    'zh-CN': '八页原创维修工具借阅简报，在原生编辑器中比较继承与单页尺寸、不变与缩放内容、贴边和旋转。',
  },
  tags: {
    'en-US': ['Slides', 'Page size', 'Overflow', 'Content scaling'],
    'zh-CN': ['幻灯片', '页面尺寸', '越界', '内容缩放'],
  },
  packages: [
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/shape-editor-ui',
    '@univerjs-pro/engine-shape',
    '@univerjs-pro/license',
  ],
  apis: [
    'FPresentation.setPageSize()',
    'FSlide.setPageSize() / getPageSize()',
    'FPresentation.setActiveSlide()',
    'FSlide.getElementById()',
    'FUniver.syncExecuteCommand()',
    'FUniver.undo() / redo()',
    'FPresentation.save()',
  ].map((name) => ({ name })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
