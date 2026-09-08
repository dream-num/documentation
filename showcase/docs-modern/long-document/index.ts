import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'docs-modern' as const,
  category: 'features' as const,
  group: { 'en-US': 'Performance', 'zh-CN': '性能' },
  previewHeight: 950,
  title: { 'en-US': 'Long Modern Document', 'zh-CN': '现代长文档' },
  description: {
    'en-US':
      'Explore a deterministically generated native document with 24 chapters, 315 paragraphs and editable styled field notes.',
    'zh-CN': '体验确定生成的原生文档：24 个章节、315 个段落及可编辑的带样式记录。',
  },
  tags: { 'en-US': ['Performance', 'Long document', 'Native editing'], 'zh-CN': ['性能', '长文档', '原生编辑'] },
  packages: ['@univerjs/preset-docs-core', '@univerjs-pro/license'],
  apis: [{ name: 'FDocument.save()' }, { name: 'FDocument.getTextRange()' }, { name: 'FDocumentTextRange.setText()' }],
  variants: [
    { id: 'structure', label: { 'en-US': '24 chapters and 315 paragraphs', 'zh-CN': '24 个章节与 315 个段落' } },
    { id: 'styles', label: { 'en-US': '288 styled field notes', 'zh-CN': '288 条带样式记录' } },
    { id: 'editing', label: { 'en-US': 'Distant editing and snapshot', 'zh-CN': '远端编辑与快照' } },
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
