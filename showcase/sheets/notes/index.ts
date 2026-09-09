import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-notes.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Review and annotation', 'zh-CN': '审阅与备注' },
  title: { 'en-US': 'Cell Notes', 'zh-CN': '单元格备注', 'zh-TW': '儲存格備註', 'ja-JP': 'セルのメモ' },
  description: {
    'en-US':
      'Native Riverside conservation notes: hover, pin, Unicode text, dimensions, top-left addressing and same-ID persistence.',
    'zh-CN': '原生 Riverside 修复备注：悬停、固定、Unicode 文本、尺寸、左上角寻址与保留 ID 的持久化。',
  },
  tags: { 'en-US': ['Univer Sheets', 'Notes', 'Preset Mode'], 'zh-CN': ['Univer Sheets', '备注', '预设模式'] },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core', '@univerjs/preset-sheets-note'],
  apis: [
    { name: 'FRange.getNote / createOrUpdateNote / deleteNote / activate / getRawValues' },
    { name: 'FWorksheet.getNotes; FWorkbook.setActiveSheet / save / undo / redo' },
    { name: 'FUniver.disposeUnit / createWorkbook / toggleDarkMode' },
    { name: 'SheetNoteAdd / SheetNoteUpdate / SheetNoteDelete / SheetNoteShow / SheetNoteHide' },
  ],
  guide: {
    overview: {
      'en-US':
        'Four original, stable-ID notes explain textile humidity, light sensitivity, lining retention and storage monitoring across two sheets. These are plain-text cell notes, not threaded comments. Native Grid and real note popups are the only editor UI.',
      'zh-CN':
        '四条原创、稳定 ID 的备注在两张表说明纺织品湿度、避光、衬里保留与储存监测。这是纯文本单元格备注，不是线程评论；编辑界面仅保留原生 Grid 与真实备注弹窗。',
    },
    tryIt: {
      'en-US': [
        'Edit the pinned B2 textarea directly; drag its native resize handle and use native Undo/Redo.',
        'Hover B3 for multiline Unicode text, or run the explicit pin/unpin variants in README.',
        'Run compact/wide dimensions and direct text changes; compare actual popup content with getNote, retaining stale-popup failures.',
        'Run B3:C4 top-left-only update/delete and an E6 note without a cell value; unrelated C4 and storage notes must survive.',
        'Run the 25 literal examples, including real events, invalid-input rejection, same-ID save/restore, a blank document and original reset.',
      ],
      'zh-CN': [
        '直接编辑固定显示的 B2 原生文本框，拖动原生缩放点，并使用原生撤销/重做。',
        '悬停 B3 查看多行 Unicode，或运行 README 中显式固定/取消固定变体。',
        '运行紧凑/宽尺寸与直接文本修改；对照真实弹窗与 getNote，保留弹窗未刷新的失败。',
        '运行 B3:C4 仅左上角的更新/删除，以及没有单元格值的 E6 备注；独立 C4 与储存备注必须保留。',
        '运行 25 段逐字示例，涵盖真实事件、无效输入拒绝、同 ID 保存恢复、空白文档与原始重置。',
      ],
    },
    expected: {
      'en-US':
        'Complete English core/note packs and official CSS are shared by Preview/export; theme keeps edits and owner. Facade note mutations bypass Undo; existing popup text/size and native Undo repaint remain known strict boundaries. No automatic reopen, fake refresh or regenerated workbook ID masks these failures.',
      'zh-CN':
        '预览与导出共享完整核心/备注中英预设及官方 CSS；主题切换保留编辑与实例。Facade 备注 mutation 不进入撤销历史，已打开弹窗文本/尺寸及原生撤销重绘仍是严格边界；不以自动重开、伪造刷新或新工作簿 ID 掩盖。',
    },
  },
  variants: [
    ['hover', 'Hover and pinned native notes', '悬停与固定原生备注'],
    ['text', 'Single-line, multiline and Unicode text', '单行、多行及 Unicode'],
    ['geometry', 'Compact and wide dimensions', '紧凑与宽尺寸'],
    ['range', 'Rectangle top-left and empty-cell note', '矩形左上角与空格备注'],
    ['events', 'Actual SDK subscriptions and cleanup', '真实 SDK 事件订阅与清理'],
    ['persistence', 'Same-ID reload, blank/restore and reset', '同 ID 重载、空白/恢复与重置'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    [
      'native',
      'Edit, resize and navigate natively',
      '原生编辑、缩放与导航',
      'Use native note popups, ribbon/context menu and sheet tabs.',
      '使用原生备注弹窗、功能区/上下文菜单与工作表标签。',
    ],
    [
      'literal',
      'Run 25 actual Facade examples',
      '运行 25 段真实 Facade 示例',
      'Keep meaningful variants in README without a duplicate target/draft/history panel.',
      '将有意义变体保留在 README，不重复设置目标/草稿/历史面板。',
    ],
  ].map(([id, en, zh, den, dzh]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': den, 'zh-CN': dzh },
  })),
  states: [
    ['pinned', 'Original humidity note pinned', '原创湿度备注固定显示'],
    ['hover', 'Unpinned note visible on hover', '取消固定的备注悬停可见'],
    ['edited', 'Native and Facade content compared separately', '分别对照原生与 Facade 内容'],
    ['invalid', 'Whitespace application input rejected', '应用层拒绝空白输入'],
    ['empty', 'Empty cell/document and full restore', '空格/空白文档与完整恢复'],
    ['boundary', 'Stale popup and Facade-history boundaries retained', '保留弹窗陈旧与 Facade 历史边界'],
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
export default { metadata, files, Preview }
