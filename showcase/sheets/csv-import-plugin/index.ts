import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-csv-import-plugin.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Import and data exchange', 'zh-CN': '导入与数据交换' },
  title: { 'en-US': 'CSV import with Facade', 'zh-CN': 'CSV 导入与 Facade' },
  description: {
    'en-US': 'Parse local CSV/TSV, inspect literal fields, and write a bounded range with native Undo.',
    'zh-CN': '解析本地 CSV/TSV，检查原始文本，再通过 Facade 写入指定区域并支持原生撤销。',
  },
  tags: { 'en-US': ['Univer Sheets', 'Facade', 'CSV'], 'zh-CN': ['Univer Sheets', 'Facade', 'CSV'] },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core', 'papaparse'],
  apis: [
    { name: 'FUniver.createMenu(); FMenu.appendTo()' },
    { name: 'FSelection.getActiveRangeList(); FRange.setValues() / getRawValues() / getCellDataGrid()' },
    { name: 'FRange.activate(); FWorksheet.scrollToCell()' },
    { name: 'FWorkbook.save(); FUniver.disposeUnit() / createWorkbook()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Kestrel repair café supplies original intake, parts and volunteer files. Papa Parse handles CSV syntax in the browser; Univer Facade writes the resulting literal text. This is an open-source custom CSV workflow, not the Exchange XLSX import API. No file is uploaded.',
      'zh-CN':
        'Kestrel 维修咖啡馆提供原创接件、零件和志愿者文件。Papa Parse 在浏览器解析 CSV 语法，Univer Facade 写入文本。这里是开源自定义 CSV 流程，不是 Exchange XLSX 导入 API，不上传文件。',
    },
    tryIt: {
      'en-US': [
        'Validate the default quoted CSV. Commas inside quotes, doubled quotes and embedded newlines remain in single cells. The browser draft normalizes CRLF to LF; downloaded samples retain original bytes. F6 already has native wrapping and a taller row for the multiline note. Validation reports dimensions without changing the workbook.',
        'Use the native name box to select B4 and Import. The first parsed record is ordinary data, not a schema header. All cells remain text: 00042, long identifiers, TRUE, dates and =1+1 are not inferred as numbers, booleans, dates or formulas.',
        'Use native Undo/Redo to inspect one range write. Existing cell styling is retained; prior formulas/rich text inside the imported rectangle are replaced. The footer and other sheet must remain untouched.',
        'Load semicolon or TSV samples; their delimiter is selected with the sample. For your own CSV file choose the correct delimiter explicitly. UTF-8 BOM is accepted; unsupported encodings and oversized files are rejected.',
        'Download a sample, then use native Open CSV. Loading only stages text; review and Import separately. Cancel leaves draft and workbook unchanged. The same file can be selected again.',
        'Toggle Skip empty lines on the uneven-row sample. Short records are padded with empty text; whitespace-only records are not silently trimmed. Empty input and malformed quotes must not write cells.',
        'Select a different cell or rectangle in the native grid. Import anchors to its top-left and does not fill the selection or clear the entire sheet. An out-of-bounds import is rejected; this fixture is 40 × 12.',
        'Source options start collapsed, leaving room for the native grid. Theme changes preserve workbook, draft and history. README explains complete same-ID owner recovery.',
      ],
      'zh-CN': [
        '验证默认引号 CSV。引号内逗号、双引号转义及字段内换行保留在同一单元格。浏览器草稿将 CRLF 规范化为 LF，下载保留原始字节。F6 已设置原生换行及较高行高以显示多行备注。验证仅报告维度，不改工作簿。',
        '使用原生名称框选择 B4 后导入。首行是普通数据，不作为字段定义。所有字段均为文本：00042、长编号、TRUE、日期和 =1+1 均不自动推断类型或执行公式。',
        '通过原生撤销/重做检查单次区域写入。保留单元格样式；导入矩形内的旧公式和富文本被替换，矩形外页脚及另一张表不应变化。',
        '加载分号或 TSV 案例时会选好分隔符。自己的 CSV 文件需明确选择分隔符。接受 UTF-8 BOM；拒绝不支持的编码与超限文件。',
        '下载案例，再用原生“打开 CSV”加载。加载仅准备草稿，需检查后另行 Import。取消保留草稿和工作簿，同一文件可以再次选择。',
        '在不等长记录案例切换 Skip empty lines。短行补空文本，纯空格记录不会被静默裁剪。空输入和未闭合引号不能写入。',
        '在原生表格选择单格或矩形。导入从左上角开始，不填充整个选区，也不清空整张表。越界会拒绝；此案例为 40 × 12。',
        '源文本选项默认折叠，为原生表格保留空间。主题切换保留工作簿、草稿与历史；README 说明完整同 ID 重建。',
      ],
    },
    expected: {
      'en-US':
        'Inspect imported data directly in the native grid. No fake CSV Facade or hand-built undo stack is used. Limits are local demo safeguards: 1 MiB, 2,000 rows, 100 columns and 10,000 parsed cells, plus destination bounds. XLSX, automatic type inference, worksheet resizing, CSV workbook export and every malformed dialect are outside this case. Preview and download share all runtime code and the SDK stylesheet.',
      'zh-CN':
        '直接在原生表格检查导入结果，不伪造 CSV Facade 或手写撤销栈。本地案例限制为 1 MiB、2,000 行、100 列、10,000 个解析单元格及目标范围。此例不覆盖 XLSX、自动类型推断、表格扩容、工作簿 CSV 导出及所有异常方言。预览与下载共用运行代码和 SDK CSS。',
    },
  },
  variants: [
    ['quoted', 'Quoted delimiters, quotes and multiline text', '分隔符、引号与多行文本'],
    ['delimiter', 'Semicolon, TSV and UTF-8 BOM', '分号、TSV 与 UTF-8 BOM'],
    ['literal', 'Literal formulas, identifiers and dates', '文本公式、编号与日期'],
    ['ragged', 'Uneven rows and empty-line policy', '不等长记录及空行策略'],
    ['target', 'Selected target and outside preservation', '选区目标及外部保留'],
    ['file', 'Local file, cancellation and re-selection', '本地文件、取消及重选'],
    ['error', 'Empty, malformed, encoding and size errors', '空值、格式、编码及容量错误'],
    ['history', 'Native history and complete recovery', '原生历史及完整恢复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['sample', 'Load sample', '加载案例', 'Host: stage a distinct CSV/TSV draft.', '宿主：准备不同 CSV/TSV 草稿。'],
    [
      'download',
      'Download sample',
      '下载案例',
      'Host: download original source text, not a workbook export.',
      '宿主：下载原始文本，不是工作簿导出。',
    ],
    [
      'file',
      'Open CSV',
      '打开 CSV',
      'Facade menu opens the browser file picker; reading does not write SDK cells.',
      'Facade 菜单打开浏览器文件选择器，读取不写 SDK 单元格。',
    ],
    [
      'validate',
      'Validate text',
      '验证文本',
      'Host parser reports dimensions/errors without writing.',
      '宿主解析器报告维度和错误，不写入。',
    ],
    [
      'import',
      'Import at selection',
      '导入到选区',
      'FRange.setValues() writes explicitly typed text into a bounded rectangle.',
      'FRange.setValues() 向有界矩形写入显式文本。',
    ],
    [
      'restore',
      'Complete recovery (README)',
      '完整重建（README）',
      'Save and recreate the complete workbook owner with the same ID.',
      '使用同一 ID 保存并重建完整工作簿 owner。',
    ],
  ].map(([id, en, zh, description, zhDescription]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': description, 'zh-CN': zhDescription },
  })),
  states: [
    ['loading', 'Editor loading / local file reading', '编辑器加载／本地文件读取'],
    ['draft', 'Uncommitted source draft', '未导入的文本草稿'],
    ['parsed', 'Validated source', '已验证的源文本'],
    ['imported', 'SDK cells written', 'SDK 单元格已写入'],
    ['error', 'Rejected input; inspect the reason', '输入被拒绝并说明原因'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/csv-plugin/utils.ts': './code/csv-plugin/utils.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
