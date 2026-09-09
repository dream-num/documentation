import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-univer-pro-import-export.png',
  product: 'sheets' as const,
  category: 'integrations' as const,
  group: { 'en-US': 'Files and interoperability', 'zh-CN': '文件与互操作' },
  title: { 'en-US': 'Regional Sales: Exchange Boundary', 'zh-CN': '区域销售：Exchange 能力边界' },
  description: {
    'en-US':
      'Native regional sales editing and local snapshot JSON. Original XLSX/XLS/CSV/TSV conversion remains unavailable under the frontend-only requirement: installed Exchange uses HTTP.',
    'zh-CN':
      '原生区域销售编辑与本地 snapshot JSON。原 XLSX/XLS/CSV/TSV 转换仍未满足纯前端要求：当前 Exchange 使用 HTTP。',
  },
  tags: {
    'en-US': ['Sheets', 'Exchange', 'Integration boundary', 'JSON'],
    'zh-CN': ['表格', 'Exchange', '集成边界', 'JSON'],
  },
  packages: ['@univerjs-pro/exchange-client', '@univerjs-pro/sheets-exchange-client'],
  apis: [
    { name: 'FUniver.transformWorkbookDataToSnapshotJsonAsync()' },
    { name: 'FUniver.downloadFile()' },
    { name: 'FWorkbook.save() / FUniver.createWorkbook()' },
    { name: 'FUniver.importSheetToSnapshotAsync() — requires HTTP; disabled' },
    { name: 'FUniver.exportSheetBySnapshotAsync() — requires HTTP; disabled' },
  ],
  guide: {
    overview: {
      'en-US':
        'Five regional accounts keep the original formulas and styling. Use the native Grid, formula bar and history. README literal examples cover local protocol encoding, honestly named JSON download and complete owner restoration. None of those replaces the original Office conversion requirement.',
      'zh-CN':
        '五地区客户保留原公式与样式，使用原生 Grid、公式栏和历史。README 逐字代码展示本地协议编码、明确命名的 JSON 下载和完整 owner 恢复；这些均不替代原 Office 转换需求。',
    },
    tryIt: {
      'en-US': [
        'Edit D2 to 95 using the native name box and keyboard; F2 becomes 13889.',
        'Undo and redo through native history; review the five different regions and segments.',
        'Run README local JSON examples. XLSX/XLS/CSV/TSV conversion entries are intentionally disabled, not accepted as complete.',
      ],
      'zh-CN': [
        '用原生名称框和键盘把 D2 改为 95，F2 变为 13889。',
        '使用原生撤销重做，查看五个不同地区和客户类别。',
        '运行 README 的本地 JSON 示例。XLSX/XLS/CSV/TSV 转换入口有意禁用，未验收完成。',
      ],
    },
    expected: {
      'en-US':
        'The workbook is editable without file uploads. Official SDK CSS and all English packs are shared by Preview and export. Office import/export is explicitly blocked: the installed Exchange client requires upload/conversion/task/signed-download HTTP services. No mocked or mislabeled XLSX is provided.',
      'zh-CN':
        '工作簿无需上传文件即可编辑。Preview 与导出共享官方 CSS 和完整 English 包。Office 导入导出明确受阻：当前 Exchange 客户端需要上传、转换、任务、签名下载 HTTP 服务。不提供伪造或错误命名的 XLSX。',
    },
  },
  variants: [
    { id: 'regional-sales', label: { 'en-US': 'Five-region native workbook', 'zh-CN': '五地区原生工作簿' } },
    {
      id: 'snapshot-json',
      label: { 'en-US': 'Local snapshot JSON, not XLSX', 'zh-CN': '本地 snapshot JSON，非 XLSX' },
    },
    {
      id: 'xlsx',
      label: {
        'en-US': 'XLSX / XLS import and XLSX export — blocked',
        'zh-CN': 'XLSX / XLS 导入与 XLSX 导出 — 待实现',
      },
    },
    {
      id: 'csv',
      label: { 'en-US': 'CSV import / active-sheet export — blocked', 'zh-CN': 'CSV 导入 / 当前表导出 — 待实现' },
    },
    { id: 'tsv', label: { 'en-US': 'TSV import — blocked', 'zh-CN': 'TSV 导入 — 待实现' } },
  ],
  actions: [
    { id: 'edit', label: { 'en-US': 'Native edit and history', 'zh-CN': '原生编辑与历史' } },
    { id: 'encode', label: { 'en-US': 'Encode protocol JSON through Facade', 'zh-CN': 'Facade 编码协议 JSON' } },
    { id: 'download-json', label: { 'en-US': 'Local JSON download through Facade', 'zh-CN': 'Facade 本地下载 JSON' } },
    { id: 'restore', label: { 'en-US': 'Complete same-ID owner restoration', 'zh-CN': '完整同 ID owner 恢复' } },
    {
      id: 'import',
      label: {
        'en-US': 'Original Office import — unavailable without conversion service',
        'zh-CN': '原 Office 导入 — 缺少转换服务不可用',
      },
    },
    {
      id: 'export-xlsx',
      label: {
        'en-US': 'Original XLSX export — unavailable without conversion service',
        'zh-CN': '原 XLSX 导出 — 缺少转换服务不可用',
      },
    },
    {
      id: 'export-csv',
      label: {
        'en-US': 'Original CSV export — unavailable without conversion service',
        'zh-CN': '原 CSV 导出 — 缺少转换服务不可用',
      },
    },
  ],
  states: [
    { id: 'seeded', label: { 'en-US': 'Original regional sales workbook', 'zh-CN': '原区域销售工作簿' } },
    { id: 'edited', label: { 'en-US': 'Native edits and recalculated formulas', 'zh-CN': '原生编辑与公式重算' } },
    { id: 'restored', label: { 'en-US': 'Same-ID complete snapshot restored', 'zh-CN': '同 ID 完整 snapshot 恢复' } },
    {
      id: 'conversion-blocked',
      label: { 'en-US': 'Original binary conversion remains open', 'zh-CN': '原二进制转换仍未实现' },
    },
  ],
}

const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/config.ts': './code/config.ts',
  '/src/data.ts': './code/data.ts',
  '/src/function.ts': './code/function.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})

export default { metadata, files, Preview }
