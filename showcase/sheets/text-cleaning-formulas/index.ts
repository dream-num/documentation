import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  previewHeight: 850,
  category: 'features' as const,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Text Cleaning Formulas', 'zh-CN': '文本清洗公式' },
  description: {
    'en-US':
      'Clean spaces and control characters, replace selected matches and join optional fields with live formulas.',
    'zh-CN': '用实时公式清理空格和控制字符、替换指定匹配项，并组合可选字段。',
  },
  tags: { 'en-US': ['TRIM', 'CLEAN', 'SUBSTITUTE', 'TEXTJOIN'], 'zh-CN': ['TRIM', 'CLEAN', 'SUBSTITUTE', 'TEXTJOIN'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue()' }, { name: 'FRange.getValue()' }, { name: 'FRange.getFormula()' }],
  variants: [
    { id: 'cleaning', label: { 'en-US': 'Clean and normalize', 'zh-CN': '清理与规范化' } },
    { id: 'joining', label: { 'en-US': 'Join optional fields', 'zh-CN': '组合可选字段' } },
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
