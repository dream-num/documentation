import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  previewHeight: 850,
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Cells', 'zh-CN': '单元格' },
  title: { 'en-US': 'AutoFill Series', 'zh-CN': '自动填充序列' },
  description: {
    'en-US': 'Extend ascending, descending and weekly date seeds, or repeat a numeric pattern with COPY.',
    'zh-CN': '扩展递增、递减和每周日期种子，或使用 COPY 重复数字模式。',
  },
  tags: { 'en-US': ['AutoFill', 'Series', 'Copy'], 'zh-CN': ['自动填充', '序列', '复制'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.autoFill()' }],
  variants: [
    { id: 'numbers', label: { 'en-US': 'Ascending and descending steps', 'zh-CN': '递增与递减步长' } },
    { id: 'dates', label: { 'en-US': 'Weekly date serials', 'zh-CN': '每周日期序列' } },
    { id: 'copy', label: { 'en-US': 'Copy versus series', 'zh-CN': '复制与序列' } },
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
