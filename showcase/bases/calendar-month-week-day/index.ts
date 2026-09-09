import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'bases',
  category: 'features',
  image: '/assets/showcase/bases-calendar-month-week-day.png',
  group: { 'en-US': 'Views', 'zh-CN': 'Views' },
  title: { 'en-US': 'Calendar Month, Week and Day', 'zh-CN': 'Calendar Month, Week and Day' },
  description: {
    'en-US':
      'Compare native month, week and day schedules for seven repair-studio appointments, including overlapping sessions, a multi-day interval and an undated request.',
    'zh-CN':
      'Compare native month, week and day schedules for seven repair-studio appointments, including overlapping sessions, a multi-day interval and an undated request.',
  },
  tags: {
    'en-US': ['Bases', 'Calendar', 'Dates', 'Views'],
    'zh-CN': ['Bases', 'Calendar', 'Dates', 'Views'],
  },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBaseTableView.updateConfig()' },
    { name: 'FBaseTableRecord.setValue()' },
    { name: 'FBaseTableRecord.getValue()' },
    { name: 'FBaseTableView.getProjection()' },
  ],
  variants: ['month', 'week', 'day', 'grid'].map((id) => ({
    id,
    label: {
      'en-US': id === 'grid' ? 'Source grid' : id[0].toUpperCase() + id.slice(1),
      'zh-CN': id === 'grid' ? 'Source grid' : id[0].toUpperCase() + id.slice(1),
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
