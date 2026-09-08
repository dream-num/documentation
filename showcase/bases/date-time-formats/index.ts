import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/bases-date-time-formats.png',
  product: 'bases',
  category: 'features',
  group: { 'en-US': 'Fields', 'zh-CN': '字段' },
  title: { 'en-US': 'Date and Time Formats', 'zh-CN': '日期与时间格式' },
  description: {
    'en-US':
      'Compare date-only, day-first, 24-hour and 12-hour formats in one native grid of six studio appointments. Formatting changes presentation, not the stored time.',
    'zh-CN': '用六条工作室预约并排比较日期、日月顺序、24 小时制和 12 小时制。格式改变显示，不删除存储的时间。',
  },
  tags: {
    'en-US': ['Relational Tables', 'Date', 'Time', 'Field formatting'],
    'zh-CN': ['Relational Tables', '日期', '时间', '字段格式'],
  },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBaseTableField.setConfig()' },
    { name: 'FBaseTableRecord.setValue()' },
    { name: 'FBaseTableRecord.getValue()' },
  ],
  variants: [
    { id: 'iso', label: { 'en-US': 'ISO date', 'zh-CN': 'ISO 日期' } },
    { id: 'dayFirst', label: { 'en-US': 'Day first', 'zh-CN': '日/月/年' } },
    { id: 'clock24', label: { 'en-US': '24-hour', 'zh-CN': '24 小时制' } },
    { id: 'clock12', label: { 'en-US': '12-hour', 'zh-CN': '12 小时制' } },
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
