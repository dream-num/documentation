import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-read-only.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Permissions and protection', 'zh-CN': '权限与保护' },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FWorkbook.getWorkbookPermission()' },
    { name: 'FWorkbookPermission.setReadOnly()' },
    { name: 'FWorkbookPermission.setEditable()' },
    { name: 'FWorkbookPermission.canEdit()' },
    { name: 'FWorkbookPermission.getSnapshot()' },
    { name: 'FWorksheetPermission.getSnapshot()' },
    { name: 'FWorkbook.disableSelection()' },
    { name: 'FWorkbook.enableSelection()' },
    { name: 'FShortcut.disableShortcut()' },
    { name: 'FShortcut.enableShortcut()' },
    { name: 'FUniver.addEvent(BeforeUndo / BeforeRedo)' },
    { name: 'FRange.getRawValues()' },
    { name: 'FUniver.disposeUnit()' },
    { name: 'FUniver.createWorkbook()' },
  ],
  guide: {
    overview: {
      'en-US':
        'A fictional Tide Museum timetable separates three concerns: hidden editor chrome, selection availability and SDK editing permissions. This frontend-only demo uses the default local authorization service; it is not server-enforced access control.',
      'zh-CN':
        '虚构的 Tide 博物馆时间表区分三件事：隐藏界面控件、是否允许选择、SDK 编辑权限。本例仅使用前端默认本地授权服务，不代表服务端访问控制。',
    },
    tryIt: {
      'en-US': [
        'Display only is the initial state: mouse selection and Univer shortcuts are disabled; content remains unchanged.',
        'Switch to Selectable read-only: select E4, then try typing, Delete and paste. Values must remain unchanged.',
        'Switch to Editable comparison: select E4, press F2, select all cell text (Ctrl+A / Cmd+A), enter 7 and press Enter. The SDK formula in F4 becomes 17.',
        'Return to Selectable read-only without resetting: edits are retained; input is blocked by SDK permissions and Undo/Redo by Facade event guards.',
        'Use the literal README examples for permissions, selection, shortcuts and same-ID saved-data recovery; no reset or readback panel is added.',
      ],
      'zh-CN': [
        '初始为 Display only：鼠标选择和 Univer 快捷键被禁用，内容保持不变。',
        '切换 Selectable read-only：选择 E4，尝试输入、Delete 和粘贴，值应保持不变。',
        '切换 Editable comparison：选择 E4，按 F2，Ctrl+A / Cmd+A 全选格内文本，输入 7 并按 Enter；F4 的 SDK 公式变为 17。',
        '不重置，切回 Selectable read-only：保留编辑；SDK 权限阻止输入，Facade 事件守卫阻止撤销与重做。',
        '通过 README 逐段代码了解权限、选择、快捷键和同 ID 保存数据恢复，不添加重置或读回面板。',
      ],
    },
    expected: {
      'en-US':
        'All modes hide native toolbar, formula bar, footer and context menu. Display only disables selection/shortcuts; the other modes enable both using the same shortcut handle. Transitions await SDK permission calls and verify canEdit(); only pending transitions gate native input. BeforeUndo/BeforeRedo guards protect existing history in viewer mode. Complete EN/ZH resources and official CSS are included. Theme updates retain the same owner and edits; saved-data recovery retains the same workbook ID. No host readback or reset panel is used.',
      'zh-CN':
        '所有模式隐藏原生工具栏、公式栏、页脚和右键菜单。展示模式禁止选择和快捷键，另外两种模式使用同一个快捷键句柄启用两者。切换等待 SDK 权限并校验 canEdit，仅等待期间拦截原生输入；BeforeUndo/BeforeRedo 守卫保护只读模式的已有历史。完整中英文资源与官方 CSS 齐备。主题保留同一 owner 和编辑；保存数据恢复保留原工作簿 ID。不使用外部读回或重置面板。',
    },
  },
  variants: [
    { id: 'display', label: { 'en-US': 'Display only; selection disabled', 'zh-CN': '仅展示；禁止选择' } },
    { id: 'selectable', label: { 'en-US': 'Selectable read-only', 'zh-CN': '可选择的只读模式' } },
    { id: 'editable', label: { 'en-US': 'Editable comparison with hidden chrome', 'zh-CN': '隐藏控件的可编辑对照' } },
  ],
  actions: [
    {
      id: 'display',
      label: { 'en-US': 'Display only', 'zh-CN': '仅展示' },
      description: {
        'en-US': 'Await setReadOnly(), verify canEdit() is false, then disableSelection() and disableShortcut().',
        'zh-CN': '等待 setReadOnly()，校验 canEdit() 为 false，再调用 disableSelection() 和 disableShortcut()。',
      },
    },
    {
      id: 'selectable',
      label: { 'en-US': 'Selectable read-only', 'zh-CN': '可选择只读' },
      description: {
        'en-US': 'Await setReadOnly(), enableSelection() and enableShortcut(); Facade guards still cancel Undo/Redo.',
        'zh-CN': '等待 setReadOnly()，启用选择与快捷键；Facade 守卫仍会取消撤销和重做。',
      },
    },
    {
      id: 'editable',
      label: { 'en-US': 'Editable comparison', 'zh-CN': '可编辑对照' },
      description: {
        'en-US':
          'Await setEditable(), verify canEdit(), enable selection/shortcuts and allow history; hidden controls are unchanged.',
        'zh-CN': '等待 setEditable()，校验 canEdit()，启用选择、快捷键和历史操作；隐藏控件配置不变。',
      },
    },
    {
      id: 'restore',
      label: { 'en-US': 'Recover saved workbook', 'zh-CN': '恢复已保存工作簿' },
      description: {
        'en-US':
          'Capture the complete saved model, dispose the controller, and createDemo() with the same ID and edited data; the new owner starts safely in Display only.',
        'zh-CN':
          '捕获完整保存模型、销毁控制器，再以相同 ID 和已编辑数据调用 createDemo，新 owner 安全地从仅展示模式启动。',
      },
    },
  ],
  states: [
    {
      id: 'pending',
      label: { 'en-US': 'Applying permissions; interaction gated', 'zh-CN': '应用权限中；暂不允许交互' },
    },
    { id: 'viewer', label: { 'en-US': 'SDK viewer permissions', 'zh-CN': 'SDK 只读权限' } },
    { id: 'editor', label: { 'en-US': 'SDK editor permissions', 'zh-CN': 'SDK 编辑权限' } },
    {
      id: 'error',
      label: { 'en-US': 'Permission setup failed; interaction stays disabled', 'zh-CN': '权限设置失败；交互保持禁用' },
    },
  ],
  title: {
    'en-US': 'Read Only Demo',
    'zh-CN': '只读示例',
    'zh-TW': '只讀示例',
    'ja-JP': '読み取り専用デモ',
  },
  description: {
    'en-US':
      'This example demonstrates how to set the workbook to read-only mode, hiding the toolbar, formula bar, footer, and disabling the context menu and selection features.',
    'zh-CN': '本示例演示了如何将工作簿设置为只读模式，并隐藏了工具栏、公式栏、页脚以及禁用右键菜单和选区功能。',
    'zh-TW': '本示例演示了如何將工作簿設置為只讀模式，並隱藏了工具欄、公式欄、頁腳以及禁用右鍵菜單和選區功能。',
    'ja-JP':
      'この例では、ワークブックを読み取り専用モードに設定し、ツールバー、数式バー、フッターを非表示にし、コンテキストメニューと選択機能を無効にする方法を示します。',
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
