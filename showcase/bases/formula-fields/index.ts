import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'bases' as const,
  image: '/assets/showcase/bases-formula-fields.png',
  category: 'features' as const,
  group: { 'en-US': 'Fields', 'zh-CN': '字段' },
  title: { 'en-US': 'Formula fields', 'zh-CN': '公式字段' },
  description: {
    'en-US': 'Compare same-record numeric, text, date, empty and error calculations in native Relational Table fields.',
    'zh-CN': '在原生 Relational Table 字段中对比同一记录的数值、文本、日期、空值与错误计算。',
  },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/engine-formula'],
  tags: { 'en-US': ['Formula', 'Fields', 'Recalculation'], 'zh-CN': ['公式', '字段', '重算'] },
  apis: ['FField.setConfig()', 'FBaseTableRecord.setValue()', 'FBaseTableRecord.getValue()'].map((name) => ({ name })),
  variants: [
    ['cost', 'Numeric cost', '数值成本'],
    ['labels', 'Text and dates', '文本与日期'],
    ['errors', 'Empty and error', '空值与错误'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
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
