import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/bases-content-pipeline.png',
  product: 'bases' as const,
  category: 'showcases' as const,
  group: { 'en-US': 'Content operations', 'zh-CN': '内容运营' },
  title: { 'en-US': 'Content Pipeline', 'zh-CN': '内容发布流程' },
  description: {
    'en-US': 'Manage a launch content calendar across grid, Kanban, and calendar views.',
    'zh-CN': '通过表格、看板和日历视图管理发布内容计划。',
  },
  tags: { 'en-US': ['Relational Tables', 'Multi-view', 'Records'], 'zh-CN': ['Relational Tables', '多视图', '记录'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui'],
  apis: [
    { name: 'FUniver.createBase()' },
    { name: 'FBaseUI.activateView()' },
    { name: 'FBaseTableRecord.setValue()' },
    { name: 'FBaseTableView.getProjection()' },
    { name: 'FBaseTableView.updateConfig()' },
    { name: 'FBaseTable.addRecords()' },
    { name: 'FBase.save()' },
  ],
  previewHeight: 1040,
  guide: {
    overview: {
      'en-US': 'A real Relational Table with typed fields, twelve varied records, and three user-visible views.',
      'zh-CN': '一个包含类型化字段、十二条差异化记录和三种可见视图的真实 Relational Table。',
    },
    tryIt: {
      'en-US': [
        'Switch among native Editorial grid, Status board, and Publishing calendar.',
        'Edit an asset, change its status, and inspect its publication date in the native UI.',
        'Use the README to add the analyst briefing, schedule undated work, and restore the complete Relational Table.',
      ],
      'zh-CN': [
        '切换原生编辑表格、状态看板与发布日历。',
        '原生编辑内容、调整状态并查看发布日期。',
        '运行 README 以添加分析师简报、安排未定日期任务及完整恢复 Relational Table。',
      ],
    },
    expected: {
      'en-US':
        'All three native views share twelve records. Status and date changes update their projections; an undated record is not a dated calendar event.',
      'zh-CN': '三个原生视图共享十二条记录。状态与日期变化更新对应投影；无日期记录不应变成有日期日历事件。',
    },
  },
  variants: [
    { id: 'grid', label: { 'en-US': 'Editorial grid', 'zh-CN': '编辑表格' } },
    { id: 'kanban', label: { 'en-US': 'Status board', 'zh-CN': '状态看板' } },
    { id: 'calendar', label: { 'en-US': 'Publishing calendar', 'zh-CN': '发布日历' } },
  ],
  actions: [
    { id: 'switch-view', label: { 'en-US': 'Switch view', 'zh-CN': '切换视图' } },
    { id: 'add-record', label: { 'en-US': 'Add record', 'zh-CN': '新增记录' } },
    { id: 'restore', label: { 'en-US': 'Full snapshot recipe', 'zh-CN': '完整快照恢复示例' } },
  ],
  states: [
    { id: 'normal', label: { 'en-US': 'Twelve varied assets', 'zh-CN': '十二项差异化内容' } },
    { id: 'updated', label: { 'en-US': 'New briefing added', 'zh-CN': '已新增简报' } },
  ],
}

const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './code/README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})

export default { metadata, files, Preview }
