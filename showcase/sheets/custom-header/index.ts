import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  image: '/assets/showcase/sheets-custom-header.png',
  group: { 'en-US': 'Workspace customization', 'zh-CN': '工作区定制' },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FWorksheet.customizeColumnHeader() / customizeRowHeader()' },
    { name: 'FWorkbook.customizeColumnHeader() / customizeRowHeader()' },
    { name: 'FWorksheet.setColumnHeaderHeight() / setRowHeaderWidth()' },
    { name: 'FWorkbook.setActiveSheet() / save()' },
    { name: 'FRange.getRawValues()' },
    { name: 'FUniver.disposeUnit() / createWorkbook()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Lumen cinema equipment desk demonstrates native row/column header labels, per-header colors/alignment, workbook defaults and worksheet overrides. Two fictional equipment datasets include different dates/statuses, missing dates and zero deposits. No data row is used as a fake header.',
      'zh-CN':
        'Lumen 影院设备台演示原生行列头的标签、局部颜色与对齐、工作簿默认配置和工作表覆盖。两组虚构设备记录包含不同日期、状态、空日期及零押金，不使用数据行冒充表头。',
    },
    tryIt: {
      'en-US': [
        'Bookings starts with blue column headers, a purple right-aligned Deposit header, and a red Slot 3 override. Returns initially keeps native A/B/C and 1/2/3 headers.',
        'Select Labels only and Apply headers: text remains semantic but custom colors/alignment disappear. Header labels are positional, not stable equipment IDs.',
        'Set Workbook default and Apply headers. Existing worksheet overrides still win. Clear active override reveals the workbook default; compare both sheets.',
        'Compact active headers changes only the current sheet to 46px row-header width / 24px column-header height. Roomy restores 88px / 36px. Longer labels may clip in compact mode.',
        'Click native row/column headers to select their full range; edit a cell natively. Clear all headers restores native labels without losing cell edits or changing header dimensions.',
      ],
      'zh-CN': [
        'Bookings 初始显示蓝色列头、紫色右对齐 Deposit，以及红色 Slot 3。Returns 初始保留原生 A/B/C 与 1/2/3。',
        '选择 Labels only 再 Apply headers：保留业务标签，移除自定义颜色与对齐。行头标签跟随位置，不是设备固定 ID。',
        '选择 Workbook default 并应用。已有工作表覆盖仍然优先；Clear active override 清除覆盖后显示工作簿默认配置，可切换两张表比较。',
        'Compact active headers 仅将当前表行头宽度改为 46px、列头高度改为 24px；Roomy 恢复 88px / 36px。紧凑模式可能截断长标签。',
        '点击原生行列头选择整行或整列，并原生编辑单元格。Clear all headers 恢复原生标签，但保留单元格编辑和行列头尺寸。',
      ],
    },
    expected: {
      'en-US':
        'Header text/styles are render configuration, not cell contents, saved workbook fields or Undo history. Clearing a worksheet override does not remove workbook defaults. Facade has no corresponding header-style getter. Native headers stay interactive. Theme changes preserve the owner and edits.',
      'zh-CN':
        '行列头文案与样式是渲染配置，不是单元格内容、工作簿保存字段或撤销历史。清除单表覆盖不会移除工作簿默认配置。Facade 没有对应的行列头样式 getter。原生行列头仍可交互，主题切换保留实例和编辑。',
    },
  },
  variants: [
    { id: 'native', label: { 'en-US': 'Native labels after clearing', 'zh-CN': '清除后恢复原生标签' } },
    { id: 'labels', label: { 'en-US': 'Semantic labels without custom colors', 'zh-CN': '仅业务标签' } },
    { id: 'styled', label: { 'en-US': 'Global styles and individual overrides', 'zh-CN': '整体样式与局部覆盖' } },
    {
      id: 'scope',
      label: { 'en-US': 'Workbook default versus worksheet override', 'zh-CN': '工作簿默认与工作表覆盖' },
    },
    { id: 'dimensions', label: { 'en-US': 'Compact and roomy native dimensions', 'zh-CN': '紧凑与宽松原生尺寸' } },
  ],
  actions: [
    {
      id: 'apply',
      label: { 'en-US': 'Apply headers', 'zh-CN': '应用行列头' },
      description: {
        'en-US':
          'Call workbook or worksheet customizeColumnHeader() and customizeRowHeader() with the selected appearance.',
        'zh-CN': '按所选外观调用工作簿或工作表 customizeColumnHeader() 与 customizeRowHeader()。',
      },
    },
    {
      id: 'clear-sheet',
      label: { 'en-US': 'Clear active override', 'zh-CN': '清除当前表覆盖' },
      description: {
        'en-US': 'Pass empty configurations to the worksheet setters; workbook defaults remain.',
        'zh-CN': '向工作表设置方法传入空配置，保留工作簿默认设置。',
      },
    },
    {
      id: 'clear-all',
      label: { 'en-US': 'Clear all headers', 'zh-CN': '清除全部自定义行列头' },
      description: {
        'en-US': 'Clear workbook defaults and every worksheet override without modifying cells or dimensions.',
        'zh-CN': '清除工作簿默认和所有工作表覆盖，不修改单元格或尺寸。',
      },
    },
    {
      id: 'size',
      label: { 'en-US': 'Toggle active header dimensions', 'zh-CN': '切换当前表行列头尺寸' },
      description: {
        'en-US': 'setRowHeaderWidth() and setColumnHeaderHeight() change native geometry; read it back from save().',
        'zh-CN': 'setRowHeaderWidth() 与 setColumnHeaderHeight() 修改原生尺寸，通过 save() 读取结果。',
      },
    },
  ],
  states: [
    { id: 'initializing', label: { 'en-US': 'Waiting for native renderer', 'zh-CN': '等待原生渲染器' } },
    { id: 'override', label: { 'en-US': 'Worksheet override active', 'zh-CN': '工作表覆盖生效' } },
    { id: 'inherited', label: { 'en-US': 'Workbook default inherited', 'zh-CN': '继承工作簿默认配置' } },
    { id: 'native', label: { 'en-US': 'Native labels restored', 'zh-CN': '已恢复原生标签' } },
  ],
  title: {
    'en-US': 'Custom Header',
    'zh-CN': '自定义行列头',
    'zh-TW': '自定義行列頭',
    'ja-JP': 'カスタムヘッダー',
  },
  description: {
    'en-US':
      'Web SDK allows you to customize the text and style of row and column headers using the `customizeColumnHeader` and `customizeRowHeader` APIs.',
    'zh-CN': 'Web SDK 支持使用 `customizeColumnHeader` 和 `customizeRowHeader` API 自定义行列头的文案和样式。',
    'zh-TW': 'Web SDK 支援使用 `customizeColumnHeader` 和 `customizeRowHeader` API 自定義行列頭的文案和樣式。',
    'ja-JP':
      'Web SDK では、`customizeColumnHeader` および `customizeRowHeader` API を使用して、行および列ヘッダーのテキストとスタイルをカスタマイズできます。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
}

export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})

export default {
  metadata,
  files,
  Preview,
}
