import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/bases-gantt-timeline-and-working-days.png',
  product: 'bases',
  category: 'features',
  group: { 'en-US': 'Views', 'zh-CN': 'Views' },
  title: { 'en-US': 'Gantt Timeline and Working Days', 'zh-CN': 'Gantt Timeline and Working Days' },
  description: {
    'en-US':
      'Compare a quarter-scale overview and working-week timeline for eight exhibition-installation tasks, with progress, phase colors and an editable source Grid.',
    'zh-CN':
      'Compare a quarter-scale overview and working-week timeline for eight exhibition-installation tasks, with progress, phase colors and an editable source Grid.',
  },
  tags: {
    'en-US': ['Relational Tables', 'Gantt', 'Working days', 'View comparison'],
    'zh-CN': ['Relational Tables', 'Gantt', 'Working days', 'View comparison'],
  },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBaseTableView.updateConfig()' },
    { name: 'FBaseTableRecord.setValue()' },
    { name: 'FBaseUI.activateView()' },
  ],
  variants: [
    { id: 'overview', label: { 'en-US': 'Quarter overview', 'zh-CN': 'Quarter overview' } },
    { id: 'working-week', label: { 'en-US': 'Working week', 'zh-CN': 'Working week' } },
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
