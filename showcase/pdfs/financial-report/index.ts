import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/pdfs-financial-report.png',
  product: 'pdfs' as const,
  category: 'showcases' as const,
  group: { 'en-US': 'Finance and review', 'zh-CN': '财务与审阅' },
  title: { 'en-US': 'Financial Report Review', 'zh-CN': '财务报告审阅' },
  description: {
    'en-US':
      'Review fourteen original financial sections with native PDF text, tables and durable annotations; all work stays in the browser.',
    'zh-CN': '在浏览器中使用原生 PDF 文字、表格与持久化标注，审阅十四个原创财务章节。',
  },
  tags: { 'en-US': ['PDFs', 'Financial report', 'Native review'], 'zh-CN': ['PDF', '财务报告', '原生审阅'] },
  packages: ['@univerjs-pro/pdfs', '@univerjs-pro/pdfs-editor', '@univerjs-pro/pdfs-ui'],
  apis: [
    { name: 'FUniver.createPdf() / getActivePdf()' },
    { name: 'FPdf.getPages() / getPageByIndex() / save()' },
    { name: 'FPdfPage.insertTextBox() / insertParagraph() / insertTable()' },
    { name: 'FPdfTextBox.setText()' },
    { name: 'FPdfTableCell.getText() / setText()' },
    { name: 'FPdfParagraph.getBlocks() / getTransform()' },
    { name: 'FPdfPage.insertAnnotation()' },
    { name: 'FPdfAnnotation.getStyle() / setStyle()' },
    { name: 'FUniver.undo() / redo() / disposeUnit()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Asteria Energy is an original fictional FY2026 report: performance, three statements, operating segments, recognition, margins, liquidity, working capital, projects, currency exposure, provisions, policies and assurance discussion. No real issuer or auditor is represented. Financial figures are editable text, not a recalculating spreadsheet.',
      'zh-CN':
        'Asteria Energy 为原创虚构的 FY2026 报告，涵盖业绩、三张报表、分部、收入确认、利润率、流动性、营运资本、项目、汇率敞口、准备、政策及鉴证讨论，不代表真实发行人或审计机构。金额是可编辑文字，不会像表格公式一样重算。',
    },
    tryIt: {
      'en-US': [
        'Use native page thumbnails to compare the overview, income statement and page 7 margin reconciliation.',
        'Enter native Editing mode and edit a title or statement cell; use the native Undo and Redo commands.',
        'Use native annotation tools to review a passage, then Selection mode and View > Properties to inspect the actual annotation.',
        'Run the README Facade blocks for visible/invisible marks, rejected opacity and local JSON save/download/reload. No upload or remote conversion is registered.',
      ],
      'zh-CN': [
        '使用原生页面缩略图比较概览、利润表与第 7 页的利润率核对。',
        '进入原生编辑模式修改标题或报表单元格，使用原生撤销与重做。',
        '通过原生标注工具审阅段落，再使用选择模式及“视图 > 属性”检查实际标注。',
        '运行 README 中的 Facade 代码，验证可见与透明标记、无效透明度拒绝、本地 JSON 保存下载与恢复；未注册上传或远程转换。',
      ],
    },
    expected: {
      'en-US':
        'Native Grid UI, five official CSS bundles and complete initial EN/ZH locales. Theme changes preserve the SDK owner and edits. Fourteen different sections and tables remain original. JSON snapshots preserve editable objects but not undo history or binary PDF bytes. Binary PDF conversion, printing, threaded comments and accessibility are not certified by this case; unavailable functionality is not simulated.',
      'zh-CN':
        '使用原生 Grid UI、五套官方 CSS 与完整的初始中英文本地化；切换主题保留 SDK 实例和编辑。十四个不同章节及表格保留原创内容。JSON 快照保留可编辑对象，不包含撤销历史或二进制 PDF 字节。本例不认证二进制 PDF 转换、打印、线程评论或无障碍能力，也不模拟缺失功能。',
    },
  },
  variants: [
    {
      id: 'statements',
      label: { 'en-US': 'Financial statements', 'zh-CN': '财务报表' },
      description: {
        'en-US': 'Profit, assets/liabilities and cash flow use different rows, negative amounts and reconciled totals.',
        'zh-CN': '利润、资产负债与现金流使用不同明细、负数和相互核对的合计。',
      },
    },
    {
      id: 'notes',
      label: { 'en-US': 'Different review targets', 'zh-CN': '不同审阅目标' },
      description: {
        'en-US':
          'Revenue acceptance, operating versus EBITDA margin, debt and provisions require distinct review questions.',
        'zh-CN': '收入验收、营业与 EBITDA 利润率、债务和准备分别对应不同审阅问题。',
      },
    },
    {
      id: 'annotation-style',
      label: { 'en-US': 'Visible / invisible annotation', 'zh-CN': '可见 / 透明标记' },
      description: {
        'en-US': 'README blocks create a durable mark, change its color/opacity and retain its object at opacity zero.',
        'zh-CN': 'README 代码创建持久化标记、修改颜色与透明度，不透明度为零时仍保留对象。',
      },
    },
    {
      id: 'local-snapshot',
      label: { 'en-US': 'Local snapshot round trip', 'zh-CN': '本地快照往返' },
      description: {
        'en-US': 'save(), JSON browser download and createPdf() stay local; this is not binary PDF import/export.',
        'zh-CN': 'save()、浏览器 JSON 下载与 createPdf() 均在本地完成，不是二进制 PDF 导入导出。',
      },
    },
  ],
  actions: [
    {
      id: 'native-edit',
      label: { 'en-US': 'Native text and table editing', 'zh-CN': '原生文字与表格编辑' },
      description: {
        'en-US': 'Use the editor itself, not a host-side sample-write or history panel.',
        'zh-CN': '直接使用编辑器，不通过宿主的示例写入或历史面板。',
      },
    },
    {
      id: 'native-review',
      label: { 'en-US': 'Native annotation and Properties', 'zh-CN': '原生标注与属性' },
      description: {
        'en-US': 'Select actual PDF objects and inspect the native Properties panel.',
        'zh-CN': '选择实际 PDF 对象并查看原生属性面板。',
      },
    },
    {
      id: 'readme',
      label: { 'en-US': 'Run literal Facade examples', 'zh-CN': '运行 Facade 代码' },
      description: {
        'en-US':
          'README contains sequential runnable variants and explicit validation errors, not extra editor controls.',
        'zh-CN': 'README 提供顺序可运行变体和明确的校验错误，不新增编辑器控件。',
      },
    },
  ],
  states: [
    {
      id: 'original',
      label: { 'en-US': 'Fourteen original pages', 'zh-CN': '十四页原创内容' },
      description: {
        'en-US': 'One distinct section and native table per page; no initial review mark.',
        'zh-CN': '每页包含不同章节与原生表格，初始无审阅标记。',
      },
    },
    {
      id: 'reviewed',
      label: { 'en-US': 'Edited / annotated', 'zh-CN': '已编辑 / 已标注' },
      description: {
        'en-US': 'Native edits and durable annotations are represented in the saved document.',
        'zh-CN': '原生编辑和持久化标注体现在文档快照中。',
      },
    },
    {
      id: 'invalid',
      label: { 'en-US': 'Rejected opacity', 'zh-CN': '拒绝无效透明度' },
      description: {
        'en-US': 'The intentional README opacity 1.5 call must throw without changing the prior snapshot.',
        'zh-CN': 'README 中故意设置 1.5 的透明度必须抛错且不改变原快照。',
      },
    },
    {
      id: 'empty',
      label: { 'en-US': 'Local blank document', 'zh-CN': '本地空白文档' },
      description: {
        'en-US': 'A separate README lifecycle example opens one empty native page and restores the saved report.',
        'zh-CN': '独立的 README 生命周期示例打开一页原生空白页面，再恢复已保存报告。',
      },
    },
  ],
}

const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/README.md': './code/README.md',
  '/src/styles.css': './code/styles.css',
})

export default { metadata, files, Preview }
