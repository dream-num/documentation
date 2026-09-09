import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'bases' as const,
  category: 'features' as const,
  group: { 'en-US': 'Performance', 'zh-CN': '性能' },
  previewHeight: 950,
  title: { 'en-US': 'Large Record Set', 'zh-CN': '大规模记录样张' },
  description: {
    'en-US':
      'Explore 5,000 editable records with native scrolling, filtering, sorting and grouping. A reproducible workload, not a benchmark score.',
    'zh-CN': '通过原生滚动、筛选、排序与分组体验 5,000 条可编辑记录。可复现的数据负载，不提供虚构性能评分。',
  },
  tags: { 'en-US': ['Performance', '5,000 records', 'Native Grid'], 'zh-CN': ['性能', '5,000 条记录', '原生表格'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBaseUI.scrollToRecord()' },
    { name: 'FBaseView.setFilter()' },
    { name: 'FBaseView.setSort()' },
    { name: 'FBaseView.setGroup()' },
    { name: 'FBaseTableRecord.setValue()' },
  ],
  variants: [
    { id: 'all', label: { 'en-US': 'All 5,000 records', 'zh-CN': '全部 5,000 条记录' } },
    { id: 'north', label: { 'en-US': 'Filtered 1,000 records', 'zh-CN': '筛选 1,000 条记录' } },
    { id: 'grouped', label: { 'en-US': 'Five groups with sorted records', 'zh-CN': '五组记录与组内排序' } },
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
