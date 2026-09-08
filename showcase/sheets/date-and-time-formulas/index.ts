import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 900,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Date and Time Formulas', 'zh-CN': '日期与时间公式' },
  description: {
    'en-US':
      'Build calendar dates and clock fractions, extract components, and compare leap years, month ends and overflowing inputs.',
    'zh-CN': '构造日期和时间小数，提取各组成部分，并比较闰年、月末与输入溢出。',
  },
  tags: {
    'en-US': ['DATE', 'TIME', 'EOMONTH', 'Date serials', 'Time components'],
    'zh-CN': ['DATE', 'TIME', 'EOMONTH', '日期序列', '时间组成'],
  },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue() / setFormula() / getCellDatas()' }],
  variants: [
    { id: 'calendar', label: { 'en-US': 'Leap years and date normalization', 'zh-CN': '闰年与日期规范化' } },
    { id: 'month-end', label: { 'en-US': 'Current and next month ends', 'zh-CN': '当月与下月月末' } },
    { id: 'clock', label: { 'en-US': 'Clock overflow and components', 'zh-CN': '时钟溢出与组成' } },
    { id: 'serial', label: { 'en-US': 'Date serial and day fraction', 'zh-CN': '日期序列与一天的小数' } },
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
