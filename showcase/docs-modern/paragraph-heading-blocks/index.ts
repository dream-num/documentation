import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/docs-modern-paragraph-heading-blocks.png',
  product: 'docs-modern',
  category: 'features',
  previewHeight: 1040,
  group: { 'en-US': 'Blocks', 'zh-CN': '内容块' },
  title: { 'en-US': 'Paragraph and Heading Blocks', 'zh-CN': '段落与标题块' },
  description: {
    'en-US':
      'Change heading hierarchy and paragraph layout in a six-section field-research brief, using native text editing and formatting.',
    'zh-CN': '在六节实地研究简报中调整标题层级与段落排版，使用原生文本编辑与排版。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Headings'], 'zh-CN': ['现代文档', '单功能', '标题'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-hyper-link',
    '@univerjs-pro/docs-list',
    '@univerjs-pro/docs-list-ui',
    '@univerjs-pro/docs-callout',
    '@univerjs-pro/docs-callout-ui',
    '@univerjs-pro/docs-code',
    '@univerjs-pro/docs-code-ui',
    '@univerjs-pro/docs-quote',
    '@univerjs-pro/docs-quote-ui',
    '@univerjs-pro/license',
  ],
  apis: [
    'FDocument.getParagraphs()',
    'FDocumentParagraph.setStyle()',
    'FDocumentParagraph.appendText()',
    'FDocumentParagraph.remove()',
    'FDocument.setSelection()',
    'FDocument.insertList()',
    'FDocument.insertCallout()',
    'FDocument.insertCode()',
    'FDocument.insertQuote()',
    'FDocument.save()',
    'FDocument.undo()',
    'FDocument.redo()',
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
