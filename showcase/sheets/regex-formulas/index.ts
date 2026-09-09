import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  previewHeight: 950,
  title: { 'en-US': 'Regex Formulas', 'zh-CN': '正则表达式公式' },
  description: {
    'en-US':
      'Use native regex formulas to validate identifiers, extract a code, normalize separators and recover from missing matches or invalid patterns.',
    'zh-CN': '使用原生正则公式验证标识符、提取编码、规范分隔符，并比较无匹配和无效模式的恢复。',
  },
  tags: {
    'en-US': ['REGEXTEST', 'REGEXEXTRACT', 'REGEXREPLACE'],
    'zh-CN': ['REGEXTEST', 'REGEXEXTRACT', 'REGEXREPLACE'],
  },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue()' }, { name: 'FRange.getValue()' }, { name: 'FRange.getFormula()' }],
  variants: [
    { id: 'test', label: { 'en-US': 'Match and reject', 'zh-CN': '匹配与拒绝' } },
    { id: 'extract', label: { 'en-US': 'Extraction and errors', 'zh-CN': '提取与错误' } },
    { id: 'replace', label: { 'en-US': 'Replacement', 'zh-CN': '替换' } },
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
