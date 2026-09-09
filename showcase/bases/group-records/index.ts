import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/bases-group-records.png',
  product: 'bases',
  category: 'features',
  group: { 'en-US': 'Filter, sort and group', 'zh-CN': '筛选、排序与分组' },
  title: { 'en-US': 'Group Records', 'zh-CN': '记录分组' },
  description: {
    'en-US':
      'Compare seven native grid views over 16 varied records: flat, ordered and nested grouping, plus empty-group flag boundaries.',
    'zh-CN': '用 16 条不同记录比较七个原生网格视图：无分组、升降序、嵌套分组及空组设置边界。',
  },
  tags: {
    'en-US': ['Bases', 'Grouping', 'Native views'],
    'zh-CN': ['多维表格', '分组', '原生视图'],
  },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: ['FBaseTableView.setGroup()', 'FBaseTableView.getProjection()', 'FBaseRecord.setValue()', 'FBase.save()'].map(
    (name) => ({ name }),
  ),
  guide: {
    overview: {
      'en-US':
        'All native views share one compact equipment table. No host controls or computed subtotal panels are added.',
      'zh-CN': '所有原生视图共享一份精简设备表，不添加宿主控制面板或计算小计。',
    },
    tryIt: {
      'en-US': [
        'Choose a view in the native sidebar.',
        'Compare status ascending and descending, then status → owner and region → status.',
        'Click a native group arrow to collapse and expand its records.',
        'Edit a native cell or grouping menu, then switch the site theme; edits stay in the same SDK instance.',
      ],
      'zh-CN': [
        '在原生侧边栏选择视图。',
        '比较状态升降序，然后比较状态 → 负责人和区域 → 状态。',
        '点击原生组箭头折叠、展开记录。',
        '编辑原生单元格或分组菜单后切换网站主题；同一 SDK 实例保留编辑。',
      ],
    },
    expected: {
      'en-US':
        'View grouping is independent; source records are shared. Blank status/owner buckets contain real records. Known SDK gaps remain: hideEmptyGroup=false does not generate the unused Archived option group; null Number values may paint as 0.00. The two empty-group views compare stored flags, not a proven visual difference. No synthetic groups, subtotals or SDK patches are used.',
      'zh-CN':
        '各视图独立分组，共享源记录。空状态、空负责人组包含真实记录。已知 SDK 缺陷仍存在：hideEmptyGroup=false 不生成未使用的 Archived 选项组；null 数值可能显示为 0.00。两个空组视图对比保存的设置，不宣称存在已验证的显示差异。不合成分组、小计，也不修改 SDK。',
    },
  },
  variants: [
    ['none', 'No grouping', '无分组'],
    ['status', 'Status · ascending', '状态升序'],
    ['reverse', 'Status · descending', '状态降序'],
    ['nested', 'Status → owner', '状态 → 负责人'],
    ['region', 'Region → status', '区域 → 状态'],
    ['empty-shown', 'Show empty groups · SDK flag', '显示空组（SDK 设置）'],
    ['empty-hidden', 'Hide empty groups · SDK flag', '隐藏空组（SDK 设置）'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['view', 'Switch native view', '切换原生视图'],
    ['collapse', 'Collapse or expand a native group', '折叠或展开原生分组'],
    ['edit', 'Edit a native record', '编辑原生记录'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['grouped', 'Grouped records', '已分组记录'],
    ['collapsed', 'Collapsed branch', '已折叠分支'],
    ['edited', 'Edited source record', '已编辑源记录'],
    ['limitation', 'SDK empty-group limitation', 'SDK 空分组限制'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
