import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  image: '/assets/showcase/sheets-custom-shortcuts.png',
  group: { 'en-US': 'Customization', 'zh-CN': '定制' },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FRange.clearContent()' },
    { name: 'FRange.activate()' },
    { name: 'FRange.getRawValues()' },
    { name: 'FRange.getFormulas()' },
    { name: 'FRange.getBackgrounds()' },
    { name: 'ICommandService.registerCommand()' },
    { name: 'IShortcutService.registerShortcut()' },
    { name: 'FUniver.createWorkbook()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Swift dispatch uses three distinct van assignments, rates and SDK cost formulas. A high-priority native shortcut calls FRange.clearContent() on the existing Facade instance. The installed Facade has no shortcut-registration method; ICommandService and IShortcutService provide that infrastructure.',
      'zh-CN':
        'Swift 排班包含三辆车、费率与 SDK 成本公式。高优先级原生快捷键调用现有 Facade 的 FRange.clearContent()。当前 Facade 没有注册快捷键的方法，注册基础设施使用 ICommandService 与 IShortcutService。',
    },
    tryIt: {
      'en-US': [
        'Select C3, focus that grid cell and press Delete (macOS: Backspace). All of row 3 is cleared, including its cost formula.',
        'Use native Undo to restore the row; the yellow fill stays throughout.',
        'Select B4:C5 in the grid and press the shortcut. Only those four cells clear.',
        'Press it again on an empty selection: the status reports no change.',
        'Focus the Host input or edit a cell. The custom shortcut must not clear worksheet content.',
        'Use the literal README recipes to save and recover the complete same-ID workbook, or release the custom registration.',
      ],
      'zh-CN': [
        '选择 C3 并使网格获得焦点，按 Delete（macOS 为 Backspace），清除第 3 行内容与公式。',
        '使用原生撤销恢复；黄色填充始终保留。',
        '在网格中选择 B4:C5，按快捷键，仅清除四个单元格。',
        '对空区域再次操作，状态明确提示没有变化。',
        '聚焦宿主输入框或进入单元格编辑，快捷键不得清除工作表内容。',
        '使用 README 的字面代码保存并恢复完整同 ID 工作簿，或释放自定义注册。',
      ],
    },
    expected: {
      'en-US':
        'Only C3 alone expands to its row. Other selections keep their bounds; clearing uses FRange.clearContent and native history. Host input and active cell editing are excluded. Native Grid has no selection/reset/readback toolbar. One official Core CSS bundle and complete English packs share the Preview/export factory; themes retain the current owner and edits. Full-model history and recovery differences remain strict failures, not normalized results.',
      'zh-CN':
        '仅 C3 单选扩展整行，其他选择保持原范围；FRange.clearContent 使用原生历史。宿主输入与单元格编辑不触发自定义命令。原生 Grid 无选择／重置／读回工具条。官方 Core CSS 及完整 英文包共用预览和导出工厂；主题保留当前实例与编辑。完整模型历史及恢复差异保留严格失败，不归一化。',
    },
  },
  variants: [
    { id: 'row', label: { 'en-US': 'C3 clears its whole row', 'zh-CN': 'C3 清除整行' } },
    { id: 'range', label: { 'en-US': 'Ordinary multi-cell selection', 'zh-CN': '普通多单元格选择' } },
    { id: 'empty', label: { 'en-US': 'Already-empty range', 'zh-CN': '已空区域' } },
    { id: 'focus', label: { 'en-US': 'Input and cell-editing focus', 'zh-CN': '输入框与单元格编辑焦点' } },
  ],
  actions: [
    {
      id: 'shortcut',
      label: { 'en-US': 'Delete / macOS Backspace', 'zh-CN': 'Delete／macOS Backspace' },
      description: {
        'en-US': 'The native keyboard binding calls FRange.clearContent(), retaining formatting.',
        'zh-CN': '原生按键绑定调用 FRange.clearContent() 并保留格式。',
      },
    },
    {
      id: 'row',
      label: { 'en-US': 'Select C3', 'zh-CN': '选择 C3' },
      description: {
        'en-US': 'FRange.activate() selects the special-case cell without clearing it.',
        'zh-CN': 'FRange.activate() 选择特殊单元格，不清除内容。',
      },
    },
    {
      id: 'range',
      label: { 'en-US': 'Select B4:C5', 'zh-CN': '选择 B4:C5' },
      description: {
        'en-US': 'FRange.activate() selects four cells without changing their values.',
        'zh-CN': 'FRange.activate() 选择四个单元格，不改变值。',
      },
    },
    {
      id: 'restore',
      label: { 'en-US': 'Recover saved workbook', 'zh-CN': '恢复已保存工作簿' },
      description: {
        'en-US':
          'The README disposes the owner and creates the complete saved workbook with the same ID; this is not Undo.',
        'zh-CN': 'README 销毁实例并使用同 ID 创建完整已保存工作簿；这不是撤销。',
      },
    },
  ],
  states: [
    { id: 'ready', label: { 'en-US': 'Assignments loaded', 'zh-CN': '排班已加载' } },
    { id: 'cleared', label: { 'en-US': 'Contents cleared, formatting retained', 'zh-CN': '内容已清除，格式保留' } },
    { id: 'empty', label: { 'en-US': 'Already empty; unchanged', 'zh-CN': '已为空；未改变' } },
    {
      id: 'focus',
      label: { 'en-US': 'Native text editing; shortcut inactive', 'zh-CN': '原生文本编辑；快捷键不生效' },
    },
  ],
  title: {
    'en-US': 'Custom Shortcuts',
    'zh-CN': '自定义快捷键',
    'zh-TW': '自訂快捷鍵',
    'ja-JP': 'カスタムショートカット',
  },
  description: {
    'en-US':
      'This example demonstrates how to create and use custom shortcuts in Univer Sheets. It shows how to define shortcuts for common actions, enhancing user productivity.',
    'zh-CN':
      '这个示例演示了如何在 Univer Sheets 中创建和使用自定义快捷键。它展示了如何为常见操作定义快捷键，从而提高用户的工作效率。',
    'zh-TW':
      '這個示例演示了如何在 Univer Sheets 中創建和使用自訂快捷鍵。它展示了如何為常見操作定義快捷鍵，從而提高用戶的工作效率。',
    'ja-JP':
      'この例では、Univer Sheets でカスタムショートカットを作成および使用する方法を示します。一般的なアクションのショートカットを定義する方法を示し、ユーザーの生産性を向上させます。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
}

export const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})

export default {
  metadata,
  files,
  Preview,
}
