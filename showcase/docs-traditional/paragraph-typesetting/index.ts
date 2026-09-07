import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/docs-traditional-paragraph-typesetting.png',
  product: 'docs-traditional',
  category: 'features',
  previewHeight: 1040,
  group: { 'en-US': 'Typesetting', 'zh-CN': '排版' },
  title: { 'en-US': 'Paragraph Spacing and Indents', 'zh-CN': '段落间距与缩进' },
  description: {
    'en-US':
      'Style a museum collection note without changing its wording. Browse descriptive prose, hanging evidence entries and double-spaced editorial review across three native pages.',
    'zh-CN': '通过三页原创博物馆档案，比较藏品描述、悬挂来源条目和双倍行距审稿的排版，修改样式但保留内容。',
  },
  tags: {
    'en-US': ['Traditional Docs', 'Single feature', 'Paragraph layout'],
    'zh-CN': ['传统文档', '单功能', '段落布局'],
  },
  packages: ['@univerjs/preset-docs-core'],
  apis: [
    { name: 'FDocumentParagraph.setStyle()' },
    { name: 'FDocumentParagraph.getInfo()' },
    { name: 'FDocumentParagraph.getText()' },
    { name: 'FDocument.undo()' },
  ],
  variants: [
    { id: 'compact', label: { 'en-US': 'Compact', 'zh-CN': '紧凑段落' } },
    { id: 'book', label: { 'en-US': 'Book style', 'zh-CN': '书籍段落' } },
    { id: 'hanging', label: { 'en-US': 'Hanging indent', 'zh-CN': '悬挂缩进' } },
    { id: 'double', label: { 'en-US': 'Double spaced', 'zh-CN': '双倍行距' } },
  ],
  actions: [
    { id: 'inspect', label: { 'en-US': 'Read paragraph style', 'zh-CN': '读取段落样式' } },
    { id: 'undo', label: { 'en-US': 'Native Undo', 'zh-CN': '原生撤销' } },
    { id: 'redo', label: { 'en-US': 'Native Redo', 'zh-CN': '原生重做' } },
    { id: 'reset', label: { 'en-US': 'Restore checkpoint', 'zh-CN': '恢复快照' } },
  ],
  states: [
    { id: 'baseline', label: { 'en-US': 'Deterministic baseline', 'zh-CN': '确定性初始状态' } },
    { id: 'modified', label: { 'en-US': 'Modified model', 'zh-CN': '已修改模型' } },
    { id: 'error', label: { 'en-US': 'Visible operation error', 'zh-CN': '可见操作错误' } },
  ],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
