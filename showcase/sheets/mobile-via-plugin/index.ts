import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'integrations' as const,
  group: { 'en-US': 'Mobile and touch', 'zh-CN': '移动端与触控' },
  packages: [
    '@univerjs/core',
    '@univerjs/design',
    '@univerjs/ui',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs/engine-render',
    '@univerjs/engine-formula',
    '@univerjs/sheets',
    '@univerjs/sheets-ui',
    '@univerjs/sheets-formula-ui',
    '@univerjs/sheets-numfmt-ui',
    '@univerjs/sheets-filter-ui',
    '@univerjs/sheets-data-validation',
    '@univerjs/sheets-data-validation-ui',
    '@univerjs/sheets-conditional-formatting-ui',
    '@univerjs/sheets-sort-ui',
    '@univerjs/sheets-find-replace',
    '@univerjs/find-replace',
    '@univerjs/sheets-hyper-link-ui',
    '@univerjs/thread-comment-ui',
    '@univerjs/sheets-thread-comment-ui',
    '@univerjs/sheets-table-ui',
    '@univerjs/sheets-note-ui',
    '@univerjs/watermark',
    '@univerjs/sheets-crosshair-highlight',
  ],
  apis: [
    { name: 'UniverMobileUIPlugin / UniverSheetsMobileUIPlugin' },
    { name: 'UniverSheetsFilterMobileUIPlugin' },
    { name: 'UniverSheetsDataValidationMobileUIPlugin' },
    { name: 'UniverSheetsConditionalFormattingMobileUIPlugin' },
    { name: 'Univer.createUnit() / Univer.dispose()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Run the original eight-sheet feature workbook inside the installed Mobile UI plugin stack. Preview and export share the same plain 390px mobile viewport, plugin registration, fixture and SDK CSS.',
      'zh-CN':
        '通过已安装的 Mobile UI 插件栈运行原有八工作表功能数据。Preview 与导出共享同一素净的 390px 移动视口、插件注册、fixture 和 SDK CSS。',
    },
    tryIt: {
      'en-US': [
        'Use the native bottom toolbar and sheet tabs at a real 390px editor width; the host does not substitute desktop controls.',
        'Edit a cell, select ranges and open supported mobile formatting/data surfaces from the native UI.',
        'Switch documentation themes and compare the same exported shell. The old owner and device DOM are removed before the replacement becomes active.',
      ],
      'zh-CN': [
        '在真实 390px 编辑器宽度下使用原生底部工具栏和工作表标签；宿主不会替换成桌面控件。',
        '编辑单元格、选择区域，并从原生 UI 打开支持的移动格式与数据面板。',
        '切换文档站主题并比较同一导出外壳。旧 owner 与设备 DOM 会在替换实例生效前移除。',
      ],
    },
    expected: {
      'en-US':
        'The plain white 390px viewport is host integration and is present in exported source. Editing surfaces come from Mobile UI plugins. No simulated phone chrome, duplicate host feature buttons or desktop-UI claims are added.',
      'zh-CN':
        '素净的白色 390px 视口属于宿主集成，并包含在导出源码中；编辑界面来自 Mobile UI 插件。本例不添加模拟手机外框、重复宿主功能按钮，也不声称具备桌面 UI。',
    },
  },
  variants: [
    { id: 'editor', label: { 'en-US': '390px mobile editor', 'zh-CN': '390px 移动编辑器' } },
    {
      id: 'data',
      label: { 'en-US': 'Filter / validation / conditional formatting', 'zh-CN': '筛选 / 验证 / 条件格式' },
    },
    { id: 'themes', label: { 'en-US': 'Light / dark SDK themes', 'zh-CN': 'SDK 明 / 暗主题' } },
  ],
  actions: [
    { id: 'native-edit', label: { 'en-US': 'Native touch-oriented editing', 'zh-CN': '原生触控编辑' } },
    { id: 'native-toolbar', label: { 'en-US': 'Native mobile toolbar', 'zh-CN': '原生移动工具栏' } },
    { id: 'native-tabs', label: { 'en-US': 'Native worksheet tabs', 'zh-CN': '原生工作表标签' } },
  ],
  states: [
    { id: 'original', label: { 'en-US': 'Original eight-sheet workbook', 'zh-CN': '原有八工作表工作簿' } },
    { id: 'edited', label: { 'en-US': 'User-edited workbook', 'zh-CN': '用户已编辑工作簿' } },
  ],
  title: {
    'en-US': 'Mobile Example (Plugin Mode)',
    'zh-CN': '移动端示例（插件模式）',
    'zh-TW': '行動端範例（插件模式）',
    'ja-JP': 'モバイル例（プラグインモード）',
  },
  description: {
    'en-US':
      'Use the real Mobile UI plugin stack in an identical plain-white Preview/export viewport with complete SDK styles.',
    'zh-CN': '在 Preview 与导出一致的素净白色视口中使用真实 Mobile UI 插件栈和完整 SDK 样式。',
    'zh-TW': '在 Preview 與匯出一致的素淨白色視口中使用真實 Mobile UI 外掛堆疊與完整 SDK 樣式。',
    'ja-JP':
      'Preview とエクスポートで共通の白いビューポートに、実際の Mobile UI プラグインと完全な SDK スタイルを読み込みます。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Plugin Mode', 'Mobile'],
    'zh-CN': ['Univer Sheets', '插件模式', '移动端'],
    'zh-TW': ['Univer Sheets', '外掛模式', '行動端'],
    'ja-JP': ['Univer Sheets', 'プラグインモード', 'モバイル'],
  },
}

export const files = readShowcaseFiles(import.meta.url, {
  '/reference/preview.tsx.txt': './preview/main.tsx',
  '/src/index.ts': './code/index.ts',
  '/src/data.ts': './code/data.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/styles.css': './code/styles.css',
})

export default { metadata, files, Preview }
