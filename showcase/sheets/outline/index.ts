import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Analysis', 'zh-CN': '数据分析' },
  title: { 'en-US': 'Row and column outlines', 'zh-CN': '行列分组与大纲' },
  description: {
    'en-US':
      'Explore quarterly and monthly order detail, nested column groups, native visibility, range boundaries and snapshot persistence.',
    'zh-CN': '探索季度和月份订单明细、嵌套列分组、原生可见性、范围边界与快照保存恢复。',
  },
  tags: { 'en-US': ['Univer Sheets', 'Outlines', 'Facade'], 'zh-CN': ['Univer Sheets', '大纲', 'Facade'] },
  packages: [
    '@univerjs/presets',
    '@univerjs/preset-sheets-core',
    '@univerjs-pro/license',
    '@univerjs-pro/sheets-outline',
    '@univerjs-pro/sheets-outline-ui',
  ],
  apis: [
    { name: 'FWorksheet.addRowOutline() / addColumnOutline()' },
    { name: 'FWorksheet.getDimensionOutlines() / setDimensionOutlineCollapsed()' },
    { name: 'FWorksheet.removeDimensionOutline() / clearDimensionOutlines()' },
    { name: 'FWorkbook.save(); FUniver.disposeUnit() / createWorkbook()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Alder seasonal equipment is a fictional 120-order table: four regions, six equipment categories, twelve months and Actual/Plan scenarios. Quarter and month totals are real cell formulas. Four quarter groups contain twelve monthly groups; nested D:F and E:F column groups keep Amount visible. The fixture clock is fixed at 2027-03-31T09:00:00Z, not the machine clock.',
      'zh-CN':
        'Alder 季节装备为原创虚构的 120 条订单：四个地区、六类装备、十二个月与 Actual/Plan 两种场景。季度与月份合计使用真实单元格公式。四个季度组包含十二个月份组；嵌套 D:F 与 E:F 列组保留 Amount。案例时间固定为 2027-03-31T09:00:00Z，不修改系统时间。',
    },
    tryIt: {
      'en-US': [
        'Start at Quarter summary: five populated rows remain visible. Apply Monthly summary for 17, Q2 detail for 38, or All detail for 137. The picker resets after applying a view, so the same preset can be applied again after native edits. Counts apply to the original fixture; editing or removing groups changes the result.',
        'Select a live row or column group and Toggle selected. A collapsed parent may keep an expanded child hidden; inspect both the collapsed flags and actual hidden dimensions. Native gutter buttons also update the readback.',
        'Choose All detail, then remove a parent group. Its monthly children and unrelated quarters remain. Clear Q2 months removes only the fully contained monthly groups, leaving the enclosing Q2 parent.',
        'Use one-based Start and Count to add a row/column group. The Facade receives zero-based start and count; clearDimensionOutlines uses an inclusive end instead. SDK can merge adjacent groups. Exact duplicate ranges are disabled by this host.',
        'Try a crossing, out-of-bounds or zero-count request. It calls the real Facade; compare the observed group state, not its chainable worksheet return value. The native error message explains SDK rejection.',
        'Empty table recreates a header-only sheet with no outlines. Reset restores all original records and groups. Save & reload preserves snapshot resources and hidden dimensions but clears Undo history. Native Undo/Redo can inspect individual operations; view presets are several operations, not one transaction.',
      ],
      'zh-CN': [
        '默认 Quarter summary 显示 5 个已填充行。应用 Monthly summary 为 17 行，Q2 detail 为 38 行，All detail 为 137 行。应用后选择器回到占位项，便于原生操作后再次应用同一预设。数值针对初始数据，编辑或移除分组会改变结果。',
        '选择实际行组或列组后 Toggle selected。父组折叠时，展开子组仍可能不可见；同时检查折叠标记与实际隐藏维度。原生大纲按钮也会更新读回。',
        '先 All detail，再移除父组：月份子组及其他季度保留。Clear Q2 months 仅移除完全包含的月份组，保留外层 Q2 父组。',
        '通过从 1 开始的 Start 和 Count 新增行列组。Facade 使用从 0 开始的位置与数量，而 clearDimensionOutlines 的末端是包含式索引。SDK 可能合并相邻组；宿主禁用完全重复的范围。',
        '尝试交叉、越界或零数量请求，实际调用 Facade。通过真实分组变化判断结果，不能把可链式调用的工作表返回值当作成功。SDK 拒绝时显示原生错误提示。',
        'Empty table 重建仅表头且无分组的表。Reset 恢复原始数据与分组。Save & reload 保留快照资源与隐藏状态，但清空撤销历史。原生撤销/重做针对独立操作；视图预设不是单个事务。',
      ],
    },
    expected: {
      'en-US':
        'Readback comes from getDimensionOutlines(), getValues() and save().sheets rowData/columnData, not host-hidden HTML rows. Nesting depth is derived from the returned ranges. Removing a group does not itself promise to reveal manually or previously hidden dimensions; compare readback or reset. SDK core and outline UI CSS are included in the same exported factory. No license is embedded: the native Pro trial watermark remains visible.',
      'zh-CN':
        '读回来自 getDimensionOutlines()、getValues() 及 save().sheets 的 rowData/columnData，不在宿主 HTML 模拟隐藏行。层级根据返回范围推导。移除分组不承诺自动恢复手动或先前隐藏的维度，应检查读回或重置。导出的同一工厂包含 SDK core 与 outline UI CSS。未内置许可证，原生 Pro 试用水印会正常显示。',
    },
  },
  variants: [
    ['quarters', 'Quarter / month / Q2 detail', '季度 / 月份 / Q2 明细'],
    ['columns', 'Nested column groups', '嵌套列组'],
    ['nested', 'Parent and child visibility', '父子分组可见性'],
    ['range', 'Count, inclusive end and adjacency', '数量、包含式末端与相邻组'],
    ['clear', 'Fully contained removal', '完全包含范围移除'],
    ['error', 'Rejected SDK ranges', 'SDK 范围拒绝'],
    ['empty', 'Header-only empty table', '仅表头的空表'],
    ['persistence', 'Snapshot resources and native history', '快照资源与原生历史'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    [
      'view',
      'Choose detail level',
      '选择明细层级',
      'setDimensionOutlineCollapsed() changes each row group.',
      'setDimensionOutlineCollapsed() 改变各行组。',
    ],
    [
      'target',
      'Choose live group',
      '选择实际分组',
      'getDimensionOutlines() supplies real IDs; selecting only changes the host target.',
      'getDimensionOutlines() 提供实际 ID，选择仅改变宿主目标。',
    ],
    [
      'toggle',
      'Toggle selected',
      '折叠或展开选中组',
      'setDimensionOutlineCollapsed() toggles the selected live ID.',
      'setDimensionOutlineCollapsed() 切换实际 ID 的折叠状态。',
    ],
    [
      'remove',
      'Remove selected',
      '移除选中组',
      'removeDimensionOutline() removes one group, not its children.',
      'removeDimensionOutline() 移除单组，不移除子组。',
    ],
    [
      'clear',
      'Clear Q2 months',
      '清除 Q2 月份组',
      'clearDimensionOutlines(ROW, 37, 68) removes fully contained groups.',
      'clearDimensionOutlines(ROW, 37, 68) 移除完全包含组。',
    ],
    [
      'add',
      'Group custom range',
      '分组指定范围',
      'addRowOutline() / addColumnOutline() use zero-based start plus count.',
      'addRowOutline() / addColumnOutline() 使用从零起点与数量。',
    ],
    [
      'reject',
      'Try boundary request',
      '尝试边界请求',
      'Calls addRowOutline() with the selected boundary case and compares actual state.',
      '按边界变体调用 addRowOutline() 并比较真实状态。',
    ],
    [
      'empty',
      'Empty table',
      '空表',
      'disposeUnit() / createWorkbook() load a header-only fixture.',
      'disposeUnit() / createWorkbook() 加载仅表头的案例。',
    ],
    [
      'reload',
      'Save and reload',
      '保存并重新加载',
      'save() retains outline resources and hidden dimensions.',
      'save() 保存大纲资源与隐藏维度。',
    ],
    [
      'reset',
      'Reset orders',
      '重置订单',
      'Recreate the fixed-clock fixture and original nested groups.',
      '重建固定案例时间的数据与初始嵌套分组。',
    ],
  ].map(([id, en, zh, description, zhDescription]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': description, 'zh-CN': zhDescription },
  })),
  states: [
    ['loading', 'Waiting for native plugins', '等待原生插件'],
    ['default', 'Nested groups ready', '嵌套组就绪'],
    ['empty', 'No orders or groups', '无订单或分组'],
    ['error', 'Rejected range / unchanged state', '范围被拒绝 / 状态未变'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})
export default { metadata, files, Preview }
