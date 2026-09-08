import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'bases' as const,
  category: 'features' as const,
  image: '/assets/showcase/bases-view-lifecycle.png',
  title: { 'en-US': 'View lifecycle', 'zh-CN': '视图生命周期' },
  description: {
    'en-US': 'Create, activate, rename, copy and delete projections without copying their shared table records.',
    'zh-CN': '创建、激活、重命名、复制和删除视图，保留共享数据记录。',
  },
  group: { 'en-US': 'Views and layout', 'zh-CN': '视图与布局' },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui'],
  tags: { 'en-US': ['Views', 'Lifecycle', 'Shared records'], 'zh-CN': ['视图', '生命周期', '共享记录'] },
  apis: [
    'FBaseTable.createView()',
    'FBaseUI.activateView()',
    'FBaseTableView.setName()',
    'FBaseTableView.delete()',
  ].map((name) => ({ name })),
  variants: [
    ['all', 'All items', '全部物品'],
    ['dispatch', 'Dispatch projection', '交接视图'],
    ['scratch', 'Scratch copy', '实验副本'],
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
