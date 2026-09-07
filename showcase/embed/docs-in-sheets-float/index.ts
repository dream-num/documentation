import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1040,
  group: { 'en-US': 'Sheets host / Float', 'zh-CN': 'Sheets 宿主 / 浮动嵌入' },
  title: { 'en-US': 'Docs in Sheets / Procurement Exception', 'zh-CN': 'Docs 嵌入 Sheets / 采购例外说明' },
  description: {
    'en-US':
      'Compare supplier cost and lead time beside an editable modern-document exception memo, using a real native floating child.',
    'zh-CN': '比较供应商报价与交期，在旁边的原生浮动现代文档中编辑采购例外说明。',
  },
  tags: { 'en-US': ['Embed', 'Sheets', 'Modern Docs', 'Float'], 'zh-CN': ['嵌入', '表格', '现代文档', '浮动'] },
  packages: [
    '@univerjs/core',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs/sheets',
    '@univerjs/sheets-drawing-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createWorkbook()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FUniver.getDocument()',
    'FDocument.getParagraphs()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Cedar Library must install 24 accessible workbenches within 16 days. Moss costs $1,350 above the lowest quote but can deliver in 12 days. A native modern-document Float records why this exception is requested and what must happen before approval. It is a separate editable Docs unit, not a screenshot or an HTML note.',
      'zh-CN':
        'Cedar 图书馆需在 16 天内安装 24 张无障碍工作台。Moss 比最低报价贵 $1,350，但能在 12 天内交付。原生现代文档 Float 说明申请例外的原因和审批前提，它是独立可编辑的 Docs 单元，不是截图或 HTML 便签。',
    },
    tryIt: {
      'en-US': [
        'Compare the three native quote rows and the calculated price premium and contingency.',
        'Double-click the document to enter native child interaction. Edit a sentence or use its native text controls.',
        'Return to the sheet and change the Moss quote in B6. The Sheet totals update; the independent memo must retain its text.',
        'Read create-demo.ts to see the local provider, native SheetFloating placement and official CSS imports.',
      ],
      'zh-CN': [
        '比较三个报价行，以及公式计算的溢价和交期余量。',
        '双击文档进入原生子单元交互，编辑句子或使用原生文本菜单。',
        '返回表格修改 B6 的 Moss 报价。表格公式更新，独立说明文档保留自己的文本。',
        '查看 create-demo.ts 中的本地资源提供器、SheetFloating 布局与官方 CSS 导入。',
      ],
    },
    expected: {
      'en-US':
        'Host formulas and child prose have distinct ownership. The approval remains pending. Reload recreates the original fictional content. This case is under verification; broad history, lifecycle, narrow-layout and export acceptance remain open. Exchange and Print are not registered. Formula-linked prose is a separate example.',
      'zh-CN':
        '宿主公式与子文档文本分别归属各自单元，审批状态仍为待审。刷新会重建原创虚构内容。本例仍在验证，完整撤销归属、生命周期、窄屏与导出尚待验收；未注册 Exchange 或 Print，公式关联文本另有案例。',
    },
  },
  variants: [
    {
      id: 'quotes',
      label: { 'en-US': 'Cost versus delivery / Sage and amber', 'zh-CN': '成本与交期 / 鼠尾草绿和琥珀色' },
    },
    {
      id: 'memo',
      label: { 'en-US': 'Exception evidence / Native modern document', 'zh-CN': '例外依据 / 原生现代文档' },
    },
  ],
  actions: [
    { id: 'activate', label: { 'en-US': 'Enter native document editing', 'zh-CN': '进入原生文档编辑' } },
    { id: 'quote', label: { 'en-US': 'Revise a supplier quote', 'zh-CN': '修改供应商报价' } },
    { id: 'review', label: { 'en-US': 'Review independent memo content', 'zh-CN': '查看独立说明内容' } },
  ],
  states: [
    { id: 'overview', label: { 'en-US': 'Quote comparison and pending exception', 'zh-CN': '报价比较与待审例外' } },
    { id: 'active', label: { 'en-US': 'Native child editing', 'zh-CN': '原生子文档编辑' } },
    { id: 'error', label: { 'en-US': 'Source load failure / reload to retry', 'zh-CN': '资源加载失败 / 刷新重试' } },
  ],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
  '/reference/preview-entry.ts.txt': './preview/index.ts',
})
export default { metadata, files, Preview }
