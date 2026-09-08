import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/bases-gallery-covers-and-card-layout.png',
  product: 'bases',
  category: 'features',
  group: { 'en-US': 'Views', 'zh-CN': 'Views' },
  title: { 'en-US': 'Gallery Covers and Card Layout', 'zh-CN': 'Gallery Covers and Card Layout' },
  description: {
    'en-US':
      'Six material samples share three native Gallery layouts and a source Grid. Compare attachment covers, an empty cover, card sizes, field order and labels.',
    'zh-CN':
      'Six material samples share three native Gallery layouts and a source Grid. Compare attachment covers, an empty cover, card sizes, field order and labels.',
  },
  tags: {
    'en-US': ['Relational Tables', 'Gallery', 'Attachments', 'Card layout'],
    'zh-CN': ['Relational Tables', 'Gallery', 'Attachments', 'Card layout'],
  },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBaseTableView.updateConfig()' },
    { name: 'FBaseTableView.getConfig()' },
    { name: 'FBaseTableRecord.setValue()' },
    { name: 'FBaseUI.activateView()' },
  ],
  variants: ['small', 'medium', 'large', 'grid'].map((id) => ({
    id,
    label: {
      'en-US': id === 'grid' ? 'Source grid' : id[0].toUpperCase() + id.slice(1) + ' cards',
      'zh-CN': id === 'grid' ? 'Source grid' : id[0].toUpperCase() + id.slice(1) + ' cards',
    },
  })),
  actions: [],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
