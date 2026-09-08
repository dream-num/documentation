import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  previewHeight: 900,
  category: 'features' as const,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Working-day Formulas', 'zh-CN': '工作日公式' },
  description: {
    'en-US':
      'Calculate deadlines and inclusive working-day counts with holidays, custom weekends and negative offsets.',
    'zh-CN': '通过假期、自定义周末和负数偏移计算截止日期与包含端点的工作日数。',
  },
  tags: { 'en-US': ['WORKDAY', 'NETWORKDAYS', 'Custom weekends'], 'zh-CN': ['WORKDAY', 'NETWORKDAYS', '自定义周末'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue()' }, { name: 'FRange.getValue()' }, { name: 'FRange.getFormula()' }],
  variants: [
    { id: 'standard', label: { 'en-US': 'Holiday-aware deadlines', 'zh-CN': '考虑假期的截止日期' } },
    { id: 'weekends', label: { 'en-US': 'Weekend codes and masks', 'zh-CN': '周末代码与掩码' } },
    { id: 'backwards', label: { 'en-US': 'Negative working-day offsets', 'zh-CN': '负工作日偏移' } },
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
