import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  previewHeight: 950,
  category: 'features' as const,
  group: { 'en-US': 'Cells', 'zh-CN': '单元格' },
  title: { 'en-US': 'Cell Text Layout', 'zh-CN': '单元格文字布局' },
  description: {
    'en-US':
      'Compare nine alignment combinations, wrapping versus clipping and overflow, and four text rotation angles.',
    'zh-CN': '比较九种对齐组合、换行与裁切及溢出，以及四种文字旋转角度。',
  },
  tags: { 'en-US': ['Alignment', 'Wrap', 'Text rotation'], 'zh-CN': ['对齐', '换行', '文字旋转'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FRange.setHorizontalAlignment()' },
    { name: 'FRange.setVerticalAlignment()' },
    { name: 'FRange.setWrapStrategy()' },
    { name: 'FRange.setTextRotation()' },
  ],
  variants: [
    { id: 'alignment', label: { 'en-US': 'Alignment', 'zh-CN': '对齐' } },
    { id: 'wrapping', label: { 'en-US': 'Wrap, clip, overflow', 'zh-CN': '换行、裁切与溢出' } },
    { id: 'rotation', label: { 'en-US': 'Text rotation', 'zh-CN': '文字旋转' } },
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
