import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'pdfs' as const,
  category: 'features' as const,
  previewHeight: 950,
  group: { 'en-US': 'Text', 'zh-CN': '文字' },
  title: { 'en-US': 'Paragraph Layout', 'zh-CN': '段落排版' },
  description: {
    'en-US':
      'Compare semantic paragraph alignment, line and paragraph spacing, and first-line, hanging and right indents.',
    'zh-CN': '对比语义段落对齐、行距与段间距，以及首行、悬挂和右缩进。',
  },
  tags: { 'en-US': ['Paragraphs', 'Alignment', 'Spacing'], 'zh-CN': ['段落', '对齐', '间距'] },
  packages: ['@univerjs-pro/pdfs', '@univerjs-pro/pdfs-editor', '@univerjs-pro/pdfs-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FPdfPage.insertParagraph()' },
    { name: 'FPdfParagraph.setBlockStyle()' },
    { name: 'FPdfParagraph.getBlocks()' },
    { name: 'ptToEmu()' },
  ],
  variants: [
    { id: 'alignment', label: { 'en-US': 'Alignment and justification limitation', 'zh-CN': '对齐与两端对齐限制' } },
    { id: 'spacing', label: { 'en-US': 'Line height and paragraph gaps', 'zh-CN': '行距与段间距' } },
    { id: 'indents', label: { 'en-US': 'First-line, hanging and right indents', 'zh-CN': '首行、悬挂与右缩进' } },
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
