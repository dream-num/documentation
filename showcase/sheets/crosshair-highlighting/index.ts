import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  image: '/assets/showcase/sheets-crosshair-highlighting.png',
  group: { 'en-US': 'Selection and reading', 'zh-CN': '选区与阅读' },
  title: { 'en-US': 'Crosshair highlighting', 'zh-CN': '十字高亮' },
  description: {
    'en-US': 'Follow native reading bands without changing cell formatting.',
    'zh-CN': '观察原生阅读色带，不改写单元格格式。',
  },
  tags: { 'en-US': ['Univer Sheets', 'Facade', 'Selection'], 'zh-CN': ['Univer Sheets', 'Facade', '选区'] },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core', '@univerjs/sheets-crosshair-highlight'],
  apis: [
    { name: 'FUniver.setCrosshairHighlightEnabled() / getCrosshairHighlightEnabled()' },
    { name: 'FUniver.addEvent(Event.CrosshairHighlightEnabledChanged)' },
    { name: 'FRange.activate()' },
    { name: 'FWorkbook.setActiveSheet() / save()' },
    { name: 'FUniver.disposeUnit() / createWorkbook()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Two small rehearsal schedules demonstrate native selection bands. The cells contain real SUM formulas, blank and zero hours; the highlight is a canvas effect, not a cell background mutation.',
      'zh-CN':
        '两张小型排练表演示原生选区色带。数据包含真实 SUM 公式、空白和零时长；高亮是画布效果，不是单元格背景修改。',
    },
    tryIt: {
      'en-US': [
        'Click, drag and use arrow keys in the native grid. Compare C4, C4:E6 and merged A11:B11.',
        'Select a whole row or column: native full-dimension selection suppresses the bands.',
        'Open View > Crosshair Highlight to toggle bands and choose native color/opacity presets.',
        'Switch weeks with native sheet tabs; instance-level highlight settings are shared.',
        'Run the literal README snippets for enable events and same-ID workbook reload.',
      ],
      'zh-CN': [
        '在原生表格点击、拖选和使用方向键，比较 C4、C4:E6 及合并的 A11:B11。',
        '选择整行或整列：原生完整维度选区会抑制色带。',
        '打开视图中的十字高亮，切换启停并选择原生颜色和透明度预设。',
        '通过原生工作表标签切换周次，实例级高亮设置共享。',
        '运行 README 字面代码，观察启停事件并以相同 ID 重载工作簿。',
      ],
    },
    expected: {
      'en-US':
        'No fixture, Reset or raw readback panel. Native Grid and both official CSS files are shared with the export; complete EN/ZH packs and same-owner themes retain edits. beta.2 exposes enable/get-state, not color/opacity setters. Palette auto-enable omits EnabledChanged; numeric Undo leaves type/style fields, and new-owner recovery changes an empty defined-name resource. These strict failures remain visible in the README. Crosshair settings are instance state, not workbook snapshot fields.',
      'zh-CN':
        '没有样本、Reset 或原始读回面板。原生 Grid、两份官方 CSS 与导出共享；完整中英文包和同实例主题切换保留编辑。beta.2 提供启停及状态读取，没有颜色/透明度 setter；调色板自动启用缺少 EnabledChanged，数字撤销遗留类型和样式字段，新实例恢复改变空的定义名称资源。这些严格失败保留在 README 中。高亮设置属于实例，不在工作簿快照中。',
    },
  },
  variants: [
    ['single', 'Single cell and native navigation', '单格与原生导航'],
    ['rectangle', 'Rectangular and merged selections', '矩形与合并选区'],
    ['dimension', 'Whole-row/column suppression', '整行列抑制'],
    ['edges', 'First/last cell and empty table', '首末单元格与空表'],
    ['scope', 'Shared instance across worksheets', '跨表实例级状态'],
    ['palette', 'Native palette and event boundary', '原生调色板及事件边界'],
    ['persistence', 'Workbook reload and instance settings', '工作簿重载与实例设置'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['enable', 'Enable bands', '启用色带'],
    ['disable', 'Disable bands', '禁用色带'],
    ['selection', 'Native selection', '原生选区'],
    ['palette', 'Native palette', '原生调色板'],
    ['reload', 'Same-ID workbook reload', '相同 ID 重载工作簿'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['enabled', 'Native bands enabled', '原生色带启用'],
    ['disabled', 'Native bands disabled', '原生色带禁用'],
    ['dimension', 'Full-dimension selection', '完整维度选区'],
    ['invalid', 'Invalid saved input rejected before mount', '挂载前拒绝无效保存输入'],
    ['reloaded', 'Same-ID unit reloaded; instance palette retained', '相同 ID 重载单元；保留实例调色板'],
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
