import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  image: '/assets/showcase/sheets-custom-canvas.png',
  group: { 'en-US': 'Customization', 'zh-CN': '自定义' },
  title: { 'en-US': 'Custom Canvas Rendering', 'zh-CN': '自定义 Canvas 绘制' },
  description: {
    'en-US': 'Compare data-driven progress strips, row marks and column marks with the native seed-bank worksheet.',
    'zh-CN': '以种子库数据对比进度条、行列标记和原生工作表。',
  },
  tags: { 'en-US': ['Univer Sheets', 'Canvas', 'Facade'], 'zh-CN': ['Univer Sheets', 'Canvas', 'Facade'] },
  packages: ['@univerjs/core', '@univerjs/presets', '@univerjs/preset-sheets-core'],
  apis: [
    {
      name: 'FUniver.registerSheetMainExtension() / registerSheetRowHeaderExtension() / registerSheetColumnHeaderExtension()',
    },
    {
      name: 'FWorksheet.refreshCanvas() / setRowHeightsForced() / setColumnWidth() / hideRows() / showRows() / hideColumns() / showColumns()',
    },
    { name: 'FWorksheet.setFreeze() / cancelFreeze() / zoom() / scrollToCell()' },
    { name: 'FRange.setValue() / clearContent() / getRawValues() / getValues() / getFormulas()' },
    { name: 'FWorkbook.save() / undo() / redo() / setActiveSheet()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Mossbrook is an original fictional seed bank with 24 varied lots. A SheetExtension paints beneath native percentage text in C4:C27. Separate extensions mark row and column headers. Public Facade methods register the extensions; drawing uses the SDK rendering extension contract, not a replacement HTML spreadsheet.',
      'zh-CN':
        'Mossbrook 是包含 24 批不同数据的原创虚构种子库。SheetExtension 在 C4:C27 原生百分比文字下绘制图形，另外两个扩展绘制行列标记。公开 Facade 负责注册，绘制使用 SDK 扩展协议，并非 HTML 仿制表格。',
    },
    tryIt: {
      'en-US': [
        'Compare 87, 100, zero, 52.5, blank, text, negative and above-100 values. Rendering leaves data unchanged. Valid bars use teal (70–100), amber (40–69.999) or rose (below 40). Blank gets a gray dash; invalid data gets two red marks.',
        'Apply bars or dots. Dots round to the nearest 10%; native percentage text remains exact. Choose Cells only, Headers only or Native only to dispose and replace extensions.',
        'Edit percentages in the native cells and use native Undo/Redo. The literal README examples use the same Facade methods.',
        'Use native row/column sizing, visibility, freeze, zoom and scrolling to observe extension geometry.',
        'Switch to Reference: its C4 value has no custom overlay. Return to Seed lots to compare.',
        'Drawing functions are not workbook snapshot data. Theme changes keep the same owner and edits; reattach extensions when constructing another owner.',
      ],
      'zh-CN': [
        '比较 87、100、零、52.5、空白、文本、负数及超出 100 的数值。绘制不修改数据。有效进度条按 70/40 阈值显示青色、琥珀色或玫红色；空白显示灰线，无效值显示两个红色标记。',
        '切换连续进度条或圆点；圆点四舍五入至 10%，原生数字保持精确。切换仅单元格、仅表头或仅原生以释放并替换扩展。',
        '在原生单元格编辑百分比，使用原生撤销与重做。README 字面示例调用相同 Facade 方法。',
        '通过原生行列尺寸、隐藏、冻结、缩放和滚动观察扩展几何位置。',
        '切换 Reference 工作表，其 C4 不绘制图形；返回 Seed lots 对比。',
        '绘制函数不是工作簿快照数据。主题切换保留同实例和编辑；构建其他实例时需重新注册扩展。',
      ],
    },
    expected: {
      'en-US':
        'Preview and exported source include the same implementation, native UI CSS and initial EN/ZH controls. This is a rendering extension, not a custom editor, validation rule, conditional format or serialized drawing. Editor-only extensions do not claim print, image or file-export parity. Header labels remain native. Original local data needs no backend or remote assets. The README retains strict style/history, row-height Undo and new-owner resource differences; reapply extensions after same-ID unit replacement.',
      'zh-CN':
        '预览和导出包含相同实现、原生 UI CSS 及初始中英文控件。本例是绘制扩展，不是自定义编辑器、校验规则、条件格式或序列化绘图；不承诺打印、图片或文件导出一致性。保留原生表头标签。原创本地数据无需后端或远程资源。README 保留样式历史、行高撤销及新实例资源的严格差异；相同 ID 替换单元后重新应用绘制扩展。',
    },
  },
  variants: [
    ['bar', 'Continuous progress bars', '连续进度条'],
    ['dots', 'Rounded dot markers', '舍入圆点'],
    ['layers', 'Cell, row and column layers', '单元格及行列层'],
    ['native', 'Native-only comparison', '仅原生对照'],
    ['values', 'Boundary, decimal, blank and invalid data', '边界、小数、空白及无效数据'],
    ['geometry', 'Resize, hide, freeze, scroll and zoom', '尺寸、隐藏、冻结、滚动及缩放'],
    ['scope', 'Worksheet-scoped rendering', '工作表范围绘制'],
    ['reload', 'Data reload and renderer reattachment', '数据重载与扩展重新注册'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [{ id: 'render', label: { 'en-US': 'Apply / remove renderers', 'zh-CN': '应用 / 移除绘制扩展' } }],
  states: [
    ['ready', 'Native renderer ready', '原生绘制就绪'],
    ['valid', 'Valid 0–100 values', '有效 0–100 数值'],
    ['empty', 'Blank percentages', '空百分比'],
    ['invalid', 'Text or out-of-range data', '文本或越界数据'],
    ['native', 'Extensions removed or other worksheet', '扩展移除或其他工作表'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}

export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/extensions.ts': './code/extensions.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})
export default { metadata, files, Preview }
