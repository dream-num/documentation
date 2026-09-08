import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'docs-traditional',
  image: '/assets/showcase/docs-traditional-pagination-rules.png',
  category: 'features',
  group: { 'en-US': 'Typesetting', 'zh-CN': '排版' },
  title: { 'en-US': 'Page Breaks, Sections, and Keep Rules', 'zh-CN': '分页、分节与分页保持' },
  description: {
    'en-US':
      'Compare manual page breaks and continuous/next/odd/even section starts, followed by the original keep and widow/orphan specimens.',
    'zh-CN': '比较手动分页及连续／下一页／奇数页／偶数页分节，再查看原有分页保持与孤行控制样张。',
  },
  tags: {
    'en-US': ['Traditional Docs', 'Single feature', 'Native pagination'],
    'zh-CN': ['传统文档', '单功能', '原生分页'],
  },
  packages: ['@univerjs/preset-docs-core'],
  apis: [
    { name: 'FDocument.insertSectionBreak()' },
    { name: 'FDocumentSection.setSectionType()' },
    { name: 'FDocumentParagraph.setStyle()' },
    { name: 'IParagraphStyle.keepNext' },
    { name: 'IParagraphStyle.keepLines' },
    { name: 'IParagraphStyle.widowControl' },
    { name: 'IParagraphStyle.pageBreakBefore' },
  ],
  guide: {
    overview: {
      'en-US':
        'A compact opening lab compares manual page breaks and four native section-start types. The original seven keep/widow rule specimens remain below.',
      'zh-CN': '开头的小样张比较手动分页及四种原生分节起始方式；后面保留原有七组分页保持与孤行控制样张。',
    },
    tryIt: {
      'en-US': [
        'Start with continuous, manual-page-break and next/odd/even-section specimens, then scroll to the original seven pagination rules.',
        'Compare heading-reference with heading at 270 points of lead-in spacing under either host language; compare natural/together/widow/break at 245 points.',
        'The oversized section repeats one paragraph eight times without paragraph breaks. Keeping all lines cannot fit it on one page; inspect the actual split.',
      ],
      'zh-CN': [
        '先查看连续分节、手动分页及下一页／奇数页／偶数页分节，再滚动查看原有七组分页规则样张。',
        '两种宿主语言均使用英文内容；heading-reference 与 heading 使用 270 点前置间距，其他对照使用 245 点。',
        '超长样张把正文重复八次但不分段，整段无法放进一页；检查实际拆页行为。',
      ],
    },
    expected: {
      'en-US':
        'Rules use public paragraph and section Facades. Earlier Chinese widow-control failures remain historical evidence, not a current Chinese data variant. Real page placement must be checked independently of flags.',
      'zh-CN':
        '规则使用公开段落及分节 Facade；早期中文孤行控制失败保留为历史证据，当前数据均为英文。实际页面位置需独立于模型标志验证。',
    },
  },
  variants: [
    { id: 'continuous-section', label: { 'en-US': 'Continuous section', 'zh-CN': '连续分节' } },
    { id: 'manual-page', label: { 'en-US': 'Manual page break', 'zh-CN': '手动分页' } },
    { id: 'next-section', label: { 'en-US': 'Next-page section', 'zh-CN': '下一页分节' } },
    { id: 'odd-section', label: { 'en-US': 'Odd-page section', 'zh-CN': '奇数页分节' } },
    { id: 'even-section', label: { 'en-US': 'Even-page section', 'zh-CN': '偶数页分节' } },
    { id: 'natural', label: { 'en-US': 'Natural flow', 'zh-CN': '自然分页' } },
    { id: 'heading-reference', label: { 'en-US': 'Heading reference', 'zh-CN': '标题自然分页对照' } },
    { id: 'heading', label: { 'en-US': 'Keep heading with next', 'zh-CN': '与下段同页' } },
    { id: 'together', label: { 'en-US': 'Keep paragraph lines', 'zh-CN': '段中不分页' } },
    { id: 'widow', label: { 'en-US': 'Widow / orphan control', 'zh-CN': '孤行控制' } },
    { id: 'break', label: { 'en-US': 'Page break before heading', 'zh-CN': '段前分页' } },
    { id: 'oversized', label: { 'en-US': 'Oversized paragraph', 'zh-CN': '超长段落边界' } },
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
