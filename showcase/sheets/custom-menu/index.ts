import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  image: '/assets/showcase/sheets-custom-menu.png',
  group: { 'en-US': 'Customization', 'zh-CN': '定制' },
  title: { 'en-US': 'Custom Menu', 'zh-CN': '自定义菜单', 'zh-TW': '自訂選單', 'ja-JP': 'カスタムメニュー' },
  description: {
    'en-US':
      'Custom native ribbon items and a cell context submenu share real range highlighting and approval callbacks.',
    'zh-CN': '自定义原生工具栏项与单元格右键子菜单共用真实的区域标记和审批回调。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Customization', 'Facade API'],
    'zh-CN': ['Univer Sheets', '自定义', 'Facade API'],
  },
  packages: [
    '@univerjs/presets',
    '@univerjs/preset-sheets-core',
    '@univerjs/sheets',
    '@univerjs/sheets-ui',
    '@univerjs/ui',
  ],
  apis: [
    { name: 'FUniver.createMenu()' },
    { name: 'FUniver.createSubmenu()' },
    { name: 'FMenu.appendTo()' },
    { name: 'FSubmenu.addSubmenu()' },
    { name: 'FRange.setBackground()' },
    { name: 'FRange.getBackgrounds()' },
    { name: 'FRange.setValue()' },
    { name: 'FRange.getRawValues()' },
    { name: 'FRange.activate()' },
    { name: 'FWorkbook.save()' },
    { name: 'FUniver.showMessage()' },
    { name: 'FWorkbookPermission.canEdit()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Four original orders, native Grid and shared menu callbacks. No host selection buttons, Reset, readback or layout panel.',
      'zh-CN': '保留四条原始订单、原生 Grid 与共享菜单回调；不添加宿主选区按钮、重置、读回或布局面板。',
    },
    tryIt: {
      'en-US': [
        'Select native cells within A4:E7 and toggle Review highlight in Start.',
        'Click Approved, or right-click and use the Approval submenu on multiple selected rows.',
        'Select a header or outside cells: a native error message appears and data stays unchanged.',
        'Use native Undo/Redo; run the README for menu registration, read-only, full restore and single-row layout.',
      ],
      'zh-CN': [
        '在原生表格内选择 A4:E7 中的单元格，在开始菜单切换复核标记。',
        '点击已批准，或选中多行后通过右键审批子菜单修改状态。',
        '选择表头或范围外的单元格：原生错误提示出现，数据保持不变。',
        '使用原生撤销与重做；README 提供菜单注册、只读、完整恢复与单行布局示例。',
      ],
    },
    expected: {
      'en-US':
        'Selected cells change fill; approval updates column E only. Repeated matching approval is a no-op. Themes retain the current owner; layout restoration clears history and remains subject to strict resource roundtrip verification.',
      'zh-CN':
        '所选单元格改变填充，审批只更新 E 列；重复相同审批状态不写入。主题保留当前实例；布局恢复清空历史，资源往返仍需严格核验。',
    },
  },
  variants: [
    { id: 'layout', label: { 'en-US': 'Grid / single-row ribbon', 'zh-CN': 'Grid / 单行菜单' } },
    { id: 'single', label: { 'en-US': 'One order selection', 'zh-CN': '单条订单选区' } },
    { id: 'multiple', label: { 'en-US': 'Multiple order rows', 'zh-CN': '多行订单' } },
    { id: 'boundary', label: { 'en-US': 'Outside / read-only', 'zh-CN': '越界 / 只读' } },
  ],
  actions: [
    { id: 'highlight', label: { 'en-US': 'Review highlight', 'zh-CN': '复核标记' } },
    { id: 'approve', label: { 'en-US': 'Approve selected rows', 'zh-CN': '批准所选订单行' } },
    { id: 'changes', label: { 'en-US': 'Request changes', 'zh-CN': '请求修改' } },
    { id: 'layout', label: { 'en-US': 'README: single-row layout', 'zh-CN': 'README：单行布局' } },
    { id: 'restore', label: { 'en-US': 'README: restore complete owner', 'zh-CN': 'README：恢复完整实例' } },
  ],
  states: [
    { id: 'ready', label: { 'en-US': 'Original order queue', 'zh-CN': '原始订单队列' } },
    { id: 'changed', label: { 'en-US': 'Native cells changed', 'zh-CN': '原生单元格已改变' } },
    { id: 'unchanged', label: { 'en-US': 'Approval already matches', 'zh-CN': '审批状态已匹配' } },
    { id: 'error', label: { 'en-US': 'Invalid selection / read-only', 'zh-CN': '无效选区 / 只读' } },
  ],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
  '/reference/Preview.tsx': './preview/main.tsx',
})
export default { metadata, files, Preview }
