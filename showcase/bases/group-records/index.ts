import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'bases',
  category: 'features',
  group: { 'en-US': 'Filter, sort and group', 'zh-CN': '筛选、排序与分组' },
  title: { 'en-US': 'Group Records', 'zh-CN': '记录分组' },
  description: {
    'en-US':
      'Group 90 equipment returns by status, owner or region; collapse branches and compare record counts and estimate subtotals.',
    'zh-CN': '将 90 条设备归还记录按状态、负责人或区域分组，折叠分支，比较记录数量与估价小计。',
  },
  tags: { 'en-US': ['Bases', 'Single feature', 'Grouping'], 'zh-CN': ['多维表格', '单功能', '分组'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    'FBaseTableView.setGroup()',
    'FBaseTableView.getProjection()',
    'IBaseUIStateService.toggleCollapsedGroupPath()',
    'buildBaseProjectedRowLayout()',
    'FBaseRecord.setValue()',
    'FBase.save()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Mistral is an original fictional touring-equipment pipeline. Ninety records include duplicate kit names, blank status and owners, missing dates and estimates, real zero estimates, and an unused Archived option. The grouped review and ungrouped reference share the same records.',
      'zh-CN':
        'Mistral 是原创虚构巡演设备流程。90 条记录包含重复套件名、空状态与负责人、缺失日期和估价、真实零估价，以及尚未使用的 Archived 选项。分组审查与无分组参考视图共享记录。',
    },
    tryIt: {
      'en-US': [
        'Compare Status ascending, descending, Status → owner and Region → status.',
        'Collapse Done, then reveal r007 or expand all; collapse does not delete source records.',
        'Change r007 from Repair to Done and check the changed group counts and subtotals; Undo and Redo.',
        'Compare the blank-status group with the unused Archived option using both empty-group flags.',
        'Switch to the reference view and confirm its grouping is unchanged.',
        'Reload a snapshot, empty the table, try a missing-record action and Reset.',
      ],
      'zh-CN': [
        '比较状态升降序、状态→负责人以及区域→状态。',
        '折叠 Done，再显示 r007 或展开所有组；折叠不会删除记录。',
        '将 r007 从 Repair 改为 Done，检查组数量与小计并撤销重做。',
        '用空组设置对比空状态记录与未使用的 Archived 选项。',
        '切换参考视图，确认分组设置未被修改。',
        '重载快照、清空表，尝试操作不存在的记录，再重置。',
      ],
    },
    expected: {
      'en-US':
        'Preview and standalone call identical code. The SDK owns Grid grouping, row layout and collapse state. Subtotals are host-computed from SDK group record IDs, not native aggregate fields. Blank estimates are excluded from numeric counts; zero is included. Do not add parent and child subtotals together. Known beta.2 gaps: hideEmptyGroup=false does not produce the zero-record Archived group, and moving its last record away removes it; native Number cells paint null estimates as 0.00, unlike the correct subtotal numeric counts. Populated blank-status groups correctly remain. Strict tests retain these unmet requirements; this capability is partial and no SDK package is patched. Collapse is transient UI state; reload expands groups. Theme changes restore the fixture; standalone defaults to light.',
      'zh-CN':
        '预览与独立示例调用同一代码。SDK 负责网格分组、行布局和折叠状态；小计由宿主根据 SDK 组记录 ID 计算，不是原生聚合字段。空估价不计入数值数量，零值计入，不能将父子组小计重复相加。已知 beta.2 限制：hideEmptyGroup=false 不生成零记录 Archived 组，移走最后一条记录后也不会保留该组；原生数值单元格把 null 估价显示为 0.00，与正确的小计数值计数存在差异。含记录的空状态组则正确保留。严格测试保留这些未满足条件，此能力仍为部分完成，未修改 SDK 包。折叠是临时 UI 状态，重载会展开所有组；主题切换恢复初始数据，独立示例默认浅色。',
    },
  },
  variants: [
    [
      'none',
      'No grouping',
      '无分组',
      'Show all 90 records without group headers.',
      '显示全部 90 条记录，不显示组标题。',
    ],
    [
      'status',
      'Status · ascending',
      '状态升序',
      'Compare populated status groups, including seven unassigned records.',
      '比较各状态组，包含 7 条未分配状态的记录。',
    ],
    [
      'reverse',
      'Status · descending',
      '状态降序',
      'Reverse group order without changing record values or membership.',
      '反转组顺序，不改变记录值或组成员。',
    ],
    [
      'nested',
      'Status → owner',
      '状态 → 负责人',
      'Expand and collapse owner groups inside each status; distinguish blank owners from blank statuses.',
      '在每个状态下展开或折叠负责人子组，区分空负责人与空状态。',
    ],
    [
      'region',
      'Region → status',
      '区域 → 状态',
      'Compare descending regions with ascending statuses inside each region.',
      '比较区域降序及各区域内部的状态升序。',
    ],
    [
      'empty-shown',
      'Show empty groups · SDK flag',
      '显示空组 · SDK 设置',
      'Request hideEmptyGroup=false. Beta.2 retains the flag but does not show the unused Archived option.',
      '请求 hideEmptyGroup=false。beta.2 保留设置，但不显示未使用的 Archived 选项组。',
    ],
    [
      'empty-hidden',
      'Hide empty groups · SDK flag',
      '隐藏空组 · SDK 设置',
      'Archived stays absent; the blank-status group remains because it contains seven records.',
      'Archived 不显示；空状态组仍显示，因为它包含 7 条记录。',
    ],
  ].map(([id, en, zh, descriptionEn, descriptionZh]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': descriptionEn, 'zh-CN': descriptionZh },
  })),
  actions: [
    [
      'group',
      'Apply grouping',
      '应用分组',
      'Apply the chosen rules to the active view and expand its groups.',
      '将所选规则应用到当前视图，并展开其分组。',
    ],
    [
      'view',
      'Activate view',
      '切换视图',
      'Compare independent view configuration over the same records.',
      '比较共享同一批记录的不同视图配置。',
    ],
    [
      'toggle',
      'Toggle group',
      '切换组折叠状态',
      'Collapse or expand the selected group without deleting records.',
      '折叠或展开选定组，不删除记录。',
    ],
    [
      'show',
      'Show group',
      '定位组',
      'Scroll to the native group header; expand its parent first if hidden.',
      '滚动到原生组标题；若父组已折叠，需先展开父组。',
    ],
    [
      'done',
      'Collapse Done',
      '折叠 Done',
      'At baseline, expanded rows drop from 90 to 69; source counts and subtotals stay unchanged.',
      '初始状态下展开行数从 90 降为 69；源记录数量和小计不变。',
    ],
    ['expand', 'Expand all', '展开全部', 'Clear collapsed paths for the active view.', '清除当前视图的折叠状态。'],
    [
      'move',
      'Change status',
      '修改状态',
      'Move r007 from Repair to Done: Done becomes 22 records / USD 5,504; Repair becomes 19 / USD 3,537.',
      '将 r007 从 Repair 移到 Done：Done 变为 22 条 / 5,504 美元，Repair 变为 19 条 / 3,537 美元。',
    ],
    [
      'reveal',
      'Reveal record',
      '定位记录',
      'Expand the selected record’s ancestor groups and scroll to its native row.',
      '展开选定记录的祖先组，并滚动到其原生行。',
    ],
    [
      'undo',
      'Undo',
      '撤销',
      'Use SDK history to undo a record-status edit; this is not Reset.',
      '通过 SDK 历史撤销记录状态修改，不等同于重置。',
    ],
    [
      'redo',
      'Redo',
      '重做',
      'Reapply the undone record-status edit and compare group totals.',
      '重做已撤销的记录状态修改，并比较分组小计。',
    ],
    [
      'inspect',
      'Inspect',
      '检查状态',
      'Read actual rules, membership, expanded rows and source values; subtotals are host-computed.',
      '读取实际规则、成员、展开行和源值；小计由宿主计算。',
    ],
    [
      'reload',
      'Reload snapshot',
      '重载快照',
      'Keep saved records and view rules, clear history and expand transient collapsed groups.',
      '保留已保存的记录和视图规则，清除历史并展开临时折叠组。',
    ],
    [
      'empty',
      'Empty table',
      '清空示例表',
      'Load an empty fixture to exercise missing-record and missing-group errors.',
      '加载空数据示例，检查记录和分组不存在时的错误。',
    ],
    [
      'reset',
      'Reset',
      '重置',
      'Restore all 90 original records and default nested grouping with fresh history.',
      '恢复全部 90 条初始记录和默认嵌套分组，清空历史。',
    ],
  ].map(([id, en, zh, descriptionEn, descriptionZh]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': descriptionEn, 'zh-CN': descriptionZh },
  })),
  states: [
    ['default', 'Original pipeline', '初始流程'],
    ['edited', 'Status changed and groups recalculated', '状态已修改，分组已重算'],
    ['empty', 'No records or populated groups', '无记录和非空组'],
    ['error', 'Missing record, missing group or no history', '记录、分组不存在或无可用历史'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
