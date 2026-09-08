import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  image: '/assets/showcase/sheets-custom-event.png',
  group: { 'en-US': 'Customization', 'zh-CN': '定制' },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core', 'rxjs'],
  apis: [
    { name: 'FUniver.registerEventHandler()' },
    { name: 'FUniver.fireEvent()' },
    { name: 'FUniver.addEvent()' },
    { name: 'FUniver.Event.CellPointerDown' },
    { name: 'FWorksheet.deleteColumns()' },
    { name: 'FWorksheet.getMaxColumns()' },
    { name: 'FRange.getRawValues()' },
    { name: 'FUniver.disposeUnit()' },
    { name: 'FUniver.createWorkbook()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Aster field samples demonstrate cancelable custom events, before/after order and explicit listener disposal. Native SDK command/render services provide event sources; Facade APIs register, fire and consume events and perform column deletion. This is an event policy, not workbook security.',
      'zh-CN':
        '使用虚构采样数据演示自定义事件、取消、前后顺序与显式取消订阅。底层命令／渲染服务提供事件源，Facade 注册、触发、订阅事件并删除列。这不是工作簿安全权限。',
    },
    tryIt: {
      'en-US': [
        'Delete C: the listener cancels the command; data and column count stay unchanged.',
        'Delete F: Before precedes After, and the SDK removes the field-note column. Try native Undo.',
        'Remove guard listener, then delete C. Restore the listener to block C–E again.',
        'Right-click A1 and B2 on Samples and Archive. Only A1 suppresses its menu.',
        'Use the native column menu for deletion; the only host button removes or restores the guard.',
      ],
      'zh-CN': [
        '删除 C：监听器取消命令，数据与列数不变。',
        '删除 F：先触发 Before 再触发 After；可使用原生撤销。',
        '取消保护监听器后可删除 C，恢复监听器后再次拦截 C–E。',
        '在 Samples 与 Archive 右键 A1、B2；仅 A1 隐藏菜单。',
        '使用原生列菜单删除列；唯一宿主按钮用于移除或恢复保护监听器。',
      ],
    },
    expected: {
      'en-US':
        'The compact log retains the latest 12 delivered messages, not a raw workbook inspector. Protection follows C–E positions, not field identities or security permissions. Listener removal is explicit. Preview and standalone share official CSS and complete English packs. Theme changes retain the owner and edits. The README records raw Undo, new-owner resource and unchecked missing-column failures; its allowed-deletion recipe checks the current column count first.',
      'zh-CN':
        '简短日志保留最近 12 条实际消息，不展示原始工作簿。规则保护 C–E 位置，不跟随字段身份，也不是安全权限。通过按钮明确取消监听。预览与导出共享官方 CSS 及完整英文包；主题切换保留实例和编辑。README 保留原始撤销、新实例资源及越界删除失败；允许删除的代码先检查当前列数。',
    },
  },
  variants: [
    { id: 'cancel', label: { 'en-US': 'Canceled column deletion', 'zh-CN': '拦截删除列' } },
    { id: 'allow', label: { 'en-US': 'Allowed deletion and event order', 'zh-CN': '允许删除与事件顺序' } },
    { id: 'unsubscribe', label: { 'en-US': 'Remove / restore listener', 'zh-CN': '移除与恢复监听器' } },
    { id: 'context', label: { 'en-US': 'Right-click across two sheets', 'zh-CN': '跨工作表右键' } },
  ],
  actions: [
    {
      id: 'protected',
      label: { 'en-US': 'Delete C', 'zh-CN': '删除 C' },
      description: {
        'en-US': 'FWorksheet.deleteColumns(2, 1); an active guard cancels overlapping C–E.',
        'zh-CN': '通过 deleteColumns(2, 1) 删除，监听器拦截 C–E。',
      },
    },
    {
      id: 'allowed',
      label: { 'en-US': 'Delete F', 'zh-CN': '删除 F' },
      description: {
        'en-US': 'Check getMaxColumns() before deleteColumns(5, 1); compare the SDK column count and data.',
        'zh-CN': '先检查 getMaxColumns()，再通过 deleteColumns(5, 1) 删除并比较列数和数据。',
      },
    },
    {
      id: 'listener',
      label: { 'en-US': 'Remove / restore guard listener', 'zh-CN': '移除／恢复监听器' },
      description: {
        'en-US': 'Dispose the addEvent() handle; re-subscribe without removing before/after consumers.',
        'zh-CN': '销毁 addEvent() 返回的订阅；重新订阅，不影响前后事件的消费者。',
      },
    },
  ],
  states: [
    { id: 'guarded', label: { 'en-US': 'Guard subscribed', 'zh-CN': '已订阅保护' } },
    { id: 'canceled', label: { 'en-US': 'Canceled with unchanged data', 'zh-CN': '已取消且数据不变' } },
    { id: 'removed', label: { 'en-US': 'Column removed', 'zh-CN': '列已删除' } },
    { id: 'unsubscribed', label: { 'en-US': 'Guard unsubscribed', 'zh-CN': '已取消保护订阅' } },
    { id: 'error', label: { 'en-US': 'Requested column no longer exists', 'zh-CN': '目标列已不存在' } },
  ],
  title: {
    'en-US': 'Custom Event',
    'zh-CN': '自定义事件',
    'zh-TW': '自定義事件',
    'ja-JP': 'カスタムイベント',
  },
  description: {
    'en-US':
      'Univer SDK supports registering custom events using the `univerAPI.registerEventHandler` and `univerAPI.fireEvent` methods. This example registers a main canvas right-click event, a before-remove-column event, and an after-remove-column event.',
    'zh-CN':
      'Univer SDK 支持使用 `univerAPI.registerEventHandler` 和 `univerAPI.fireEvent` 方法注册自定义事件，本示例注册了主画布右键事件、删除列前事件和删除列后事件。',
    'zh-TW':
      'Univer SDK 支援使用 `univerAPI.registerEventHandler` 和 `univerAPI.fireEvent` 方法註冊自定義事件，本範例註冊了主畫布右鍵事件、刪除列前事件和刪除列後事件。',
    'ja-JP':
      'Univer SDK は、`univerAPI.registerEventHandler` および `univerAPI.fireEvent` メソッドを使用してカスタムイベントを登録することをサポートしています。この例では、メインキャンバスの右クリックイベント、列削除前イベント、列削除後イベントを登録します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
}

export const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './code/README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/custom-register-event.ts': './code/custom-register-event.ts',
  '/src/styles.css': './code/styles.css',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})

export default {
  metadata,
  files,
  Preview,
}
