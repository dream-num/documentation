import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/docs-traditional-headers-footers-and-section-links.png',
  product: 'docs-traditional',
  category: 'features',
  group: { 'en-US': 'Typesetting', 'zh-CN': '排版' },
  title: { 'en-US': 'Headers, Footers, and Section Links', 'zh-CN': '页眉、页脚与节间链接' },
  description: {
    'en-US': 'Compare first, even, and default running text with linked and independent section headers.',
    'zh-CN': '比较首页、偶数页及默认页眉页脚，以及链接和独立的节页眉。',
  },
  tags: {
    'en-US': ['Native Docs', 'Headers and footers', 'Section links'],
    'zh-CN': ['原生文档', '页眉页脚', '节链接'],
  },
  packages: ['@univerjs/preset-docs-core'],
  apis: [
    { name: 'FDocumentSection.ensureHeader()' },
    { name: 'FDocumentSection.ensureFooter()' },
    { name: 'FDocumentSection.setHeaderFooterOptions()' },
    { name: 'FDocumentSection.setHeaderLinkedToPrevious()' },
  ],
  variants: [
    { id: 'first', label: { 'en-US': 'Different first page', 'zh-CN': '不同首页' } },
    { id: 'even', label: { 'en-US': 'Different even page', 'zh-CN': '不同偶数页' } },
    { id: 'default', label: { 'en-US': 'Default running text', 'zh-CN': '默认页眉页脚' } },
    { id: 'linked', label: { 'en-US': 'Linked section', 'zh-CN': '链接的节' } },
    { id: 'independent', label: { 'en-US': 'Independent header', 'zh-CN': '独立页眉' } },
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
