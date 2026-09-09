import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'docs-modern' as const,
  category: 'features' as const,
  group: { 'en-US': 'Editing', 'zh-CN': '编辑' },
  previewHeight: 950,
  title: { 'en-US': 'Text Search and Targeted Replacement', 'zh-CN': '文本查找与精确替换' },
  description: {
    'en-US':
      'Use public paragraph queries for case-sensitive matches, repeated occurrences and fresh ranges after editing. No custom search UI.',
    'zh-CN': '通过公开段落查询比较大小写匹配、重复命中和编辑后重新定位，不模拟搜索界面。',
  },
  tags: { 'en-US': ['Text queries', 'Case sensitivity', 'Replacement'], 'zh-CN': ['文本查询', '大小写', '替换'] },
  packages: ['@univerjs/preset-docs-core', '@univerjs-pro/license'],
  apis: [
    { name: 'FDocumentParagraph.findText()' },
    { name: 'FDocumentParagraph.findAllText()' },
    { name: 'FDocumentTextRange.setText()' },
  ],
  variants: [
    { id: 'case', label: { 'en-US': 'Case-sensitive matches', 'zh-CN': '大小写匹配' } },
    { id: 'occurrence', label: { 'en-US': 'Occurrence and all matches', 'zh-CN': '指定命中与全部命中' } },
    { id: 'requery', label: { 'en-US': 'No match and fresh ranges', 'zh-CN': '未命中与重新定位' } },
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
