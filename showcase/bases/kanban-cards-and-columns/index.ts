import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'bases',
  category: 'features',
  image: '/assets/showcase/bases-kanban-cards-and-columns.png',
  group: { 'en-US': 'Views', 'zh-CN': 'Views' },
  title: { 'en-US': 'Kanban Cards and Columns', 'zh-CN': 'Kanban Cards and Columns' },
  description: {
    'en-US':
      'Compare compact and labeled native Kanban cards for six instrument repairs, four status columns and an editable source Grid.',
    'zh-CN':
      'Compare compact and labeled native Kanban cards for six instrument repairs, four status columns and an editable source Grid.',
  },
  tags: {
    'en-US': ['Bases', 'Kanban', 'Cards', 'Columns'],
    'zh-CN': ['Bases', 'Kanban', 'Cards', 'Columns'],
  },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBaseTableView.updateConfig()' },
    { name: 'FBaseTableField.setConfig()' },
    { name: 'FBaseTableRecord.setValue()' },
    { name: 'FBaseUI.activateView()' },
  ],
  variants: [
    { id: 'compact', label: { 'en-US': 'Compact cards', 'zh-CN': 'Compact cards' } },
    { id: 'detailed', label: { 'en-US': 'Labeled repair cards', 'zh-CN': 'Labeled repair cards' } },
    { id: 'covers', label: { 'en-US': 'Cover cards', 'zh-CN': 'Cover cards' } },
    { id: 'source', label: { 'en-US': 'Source Grid', 'zh-CN': 'Source Grid' } },
  ],
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
