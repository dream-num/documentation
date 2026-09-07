import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'docs-traditional',
  category: 'features',
  group: { 'en-US': 'Typesetting', 'zh-CN': '排版' },
  title: { 'en-US': 'Widow, Orphan, and Keep Rules', 'zh-CN': '孤行、寡行与分页保持' },
  description: {
    'en-US':
      'Use a compact inspection bulletin to compare natural flow, keep-with-next, keep-lines, widow/orphan control, and explicit page-break-before.',
    'zh-CN': '使用紧凑检查通报比较自然分页、与下段同页、段中不分页、孤行控制及段前分页。',
  },
  tags: {
    'en-US': ['Traditional Docs', 'Single feature', 'SDK readback'],
    'zh-CN': ['传统文档', '单功能', 'SDK 回读'],
  },
  packages: ['@univerjs/preset-docs-core'],
  apis: [
    { name: 'FDocumentParagraph.setStyle()' },
    { name: 'IParagraphStyle.keepNext' },
    { name: 'IParagraphStyle.keepLines' },
    { name: 'IParagraphStyle.widowControl' },
    { name: 'IParagraphStyle.pageBreakBefore' },
  ],
  guide: {
    overview: {
      'en-US':
        'Use a compact inspection bulletin to compare natural flow, keep-with-next, keep-lines, widow/orphan control, and explicit page-break-before.',
      'zh-CN': '使用紧凑检查通报比较自然分页、与下段同页、段中不分页、孤行控制及段前分页。',
    },
    tryIt: {
      'en-US': [
        'Start with Natural flow and inspect the small-page boundaries.',
        'Choose Keep heading with next; the heading should travel with the next paragraph when they fit.',
        'Compare Keep paragraph lines and Widow / orphan control.',
        'Choose Page break before heading, then Undo and Reset. Inspect reports model rules, while the canvas shows pagination.',
      ],
      'zh-CN': [
        '从自然分页开始，观察小页面边界。',
        '选择与下段同页，空间允许时标题应随下段一起移动。',
        '比较段中不分页与孤行控制。',
        '选择段前分页，再撤销、重置；Inspect 显示模型规则，画布展示分页。',
      ],
    },
    expected: {
      'en-US':
        'Each variant changes the persisted pagination rules of the marked heading and paragraphs. The editor reflows them on small physical pages. Oversized paragraphs may still split; Inspect does not claim to measure rendered page count.',
      'zh-CN':
        '每种变体改变标记标题与段落的分页规则，编辑器在小尺寸页面重新排版。过长段落仍可能拆页，Inspect 不宣称测量实际渲染页数。',
    },
  },
  variants: [
    { id: 'natural', label: { 'en-US': 'Natural flow' } },
    { id: 'heading', label: { 'en-US': 'Keep heading with next' } },
    { id: 'together', label: { 'en-US': 'Keep paragraph lines' } },
    { id: 'widow', label: { 'en-US': 'Widow / orphan control' } },
    { id: 'break', label: { 'en-US': 'Page break before heading' } },
  ],
  actions: [
    { id: 'inspect', label: { 'en-US': 'Inspect' } },
    { id: 'undo', label: { 'en-US': 'Undo' } },
    { id: 'redo', label: { 'en-US': 'Redo' } },
    { id: 'reset', label: { 'en-US': 'Reset' } },
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
})
export default { metadata, files, Preview }
