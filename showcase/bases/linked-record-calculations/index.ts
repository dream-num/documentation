import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'bases' as const,
  category: 'features' as const,
  group: { 'en-US': 'Fields', 'zh-CN': '字段' },
  previewHeight: 950,
  title: { 'en-US': 'Linked Record Calculations', 'zh-CN': '关联记录计算' },
  description: {
    'en-US':
      'Use native Formula fields to look up a linked record and sum multiple linked costs, with editable source data and empty links.',
    'zh-CN': '使用原生公式字段查找关联记录、合计多个关联成本，并编辑源数据和空关联。',
  },
  tags: { 'en-US': ['RecordLink', 'XLOOKUP', 'Cross-table formulas'], 'zh-CN': ['关联记录', 'XLOOKUP', '跨表公式'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBaseTableRecord.setLinkedRecordIds()' },
    { name: 'FBaseTableRecord.setValue()' },
    { name: 'FBaseTableRecord.getValue()' },
  ],
  variants: [
    { id: 'lookup', label: { 'en-US': 'Single-record lookup', 'zh-CN': '单记录查找' } },
    { id: 'sum', label: { 'en-US': 'Multiple-record sum', 'zh-CN': '多记录合计' } },
    { id: 'empty', label: { 'en-US': 'Empty links and source updates', 'zh-CN': '空关联与源数据更新' } },
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
