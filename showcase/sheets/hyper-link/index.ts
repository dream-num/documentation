import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-hyper-link.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Links and navigation', 'zh-CN': '链接与导航' },
  title: {
    'en-US': 'Hyperlinks',
    'zh-CN': '超链接',
    'zh-TW': '超連結',
    'ja-JP': 'ハイパーリンク',
  },
  description: {
    'en-US':
      'The Hyper Link feature allows users to insert and manage hyperlinks in spreadsheets, enhancing data interactivity and navigation.',
    'zh-CN': '超链接功能允许用户在电子表格中插入和管理超链接，以增强数据的交互性和导航性。',
    'zh-TW': '超連結功能允許用戶在電子表格中插入和管理超連結，以增強數據的互動性和導航性。',
    'ja-JP':
      'ハイパーリンク機能により、ユーザーはスプレッドシートにハイパーリンクを挿入および管理でき、データのインタラクティブ性とナビゲーションが向上します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core', '@univerjs/preset-sheets-hyper-link'],
  apis: [
    { name: 'FWorksheet.getSelection(); FSelection.getActiveRangeList()' },
    { name: 'FRange.setHyperLink() / updateHyperLink() / cancelHyperLink() / getHyperLinks()' },
    { name: 'FRange.getUrl() / activate() / getCellDataGrid() / getValues()' },
    {
      name: 'FWorksheet.getUrl(); FWorkbook.getUrlOfDefineName() / parseSheetHyperlink() / navigateToSheetHyperlink()',
    },
    { name: 'FWorkbook.save() / setActiveSheet(); FUniver.disposeUnit() / createWorkbook()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Original route cards distinguish external URLs, worksheets, ranges, defined names and two rich-text spans. Use the native link popup and editor; there is no host link form or inspector.',
      'zh-CN':
        '原创路线卡片区分外链、工作表、区域、命名范围和双富文本链接。使用原生链接弹窗及编辑器，没有宿主链接表单或检查面板。',
    },
    tryIt: {
      'en-US': [
        'Hover B2 and use its native popup. External navigation preserves the query and fragment and permits only credential-free absolute HTTP(S). Browser popup policy still applies.',
        'Follow B3, B4 and B5 through their native popups; compare whole-sheet, B3:D4 and ReservedLamps destinations.',
        'Use the native link editor on empty B7 or plain-text B8, then native Undo/Redo.',
        'Compare the two text spans in B6. getHyperLinks() currently reports only the first span per cell, not complete rich-text enumeration.',
        'Run the exported README recipes for explicit Facade insertion, update, removal and navigation.',
      ],
      'zh-CN': [
        '悬停 B2 并使用原生弹窗；外链保留参数和锚点，只允许无凭据的绝对 HTTP(S)，仍受浏览器弹窗策略约束。',
        '通过 B3、B4、B5 的原生弹窗比较整表、B3:D4 和 ReservedLamps 目标。',
        '在空白 B7 或纯文本 B8 使用原生链接编辑器，再用原生撤销与重做。',
        '比较 B6 的两段链接；getHyperLinks() 当前只返回每格第一段，不是完整富文本枚举。',
        '运行导出 README 中的 Facade 插入、更新、移除和导航示例。',
      ],
    },
    expected: {
      'en-US':
        'Native popups, navigation, same-ID recovery, EN/ZH, theme and disposal are verified. Navigation returns void; read the selected range list after paint. Strict limits remain: getHyperLinks reports only the first span, and first B7 insertion Undo removes its original null cell record. Update/removal Undo/Redo are exact.',
      'zh-CN':
        '已验证原生弹窗、导航、同 ID 恢复、中英文、主题和销毁。导航返回 void，绘制后读取选区列表。严格限制仍在：getHyperLinks 只返回第一段，首次插入 B7 后撤销会移除原始 null 单元格记录。更新和移除的撤销/重做完整一致。',
    },
  },
  variants: [
    ['external', 'External query and fragment', '外链查询参数与锚点'],
    ['sheet', 'Whole worksheet', '整工作表目标'],
    ['range', 'Specific range', '指定单元格范围'],
    ['named', 'Defined name', '命名区域'],
    ['rich', 'Two spans in one cell', '单元格中的两段链接'],
    ['scope', 'Top-left write versus range removal', '左上角写入与范围移除'],
    ['error', 'Missing name and invalid URL', '缺失命名与无效 URL'],
    ['persistence', 'Rich-text/resource round-trip', '富文本和资源保存恢复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['native-edit', 'Native link editor', '原生链接编辑'],
    ['native-follow', 'Native link navigation', '原生链接导航'],
    ['facade', 'Literal Facade recipes', 'Facade 字面示例'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['loading', 'Waiting for plugin', '等待插件'],
    ['linked', 'First reported link exists', '存在第一段已返回链接'],
    ['empty', 'Empty or plain-text target', '空目标或纯文本'],
    ['error', 'External navigation rejected', '外部导航被拒绝'],
    ['pending', 'SDK write pending', 'SDK 写入中'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
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
