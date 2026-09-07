import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Modern Docs host / Block', 'zh-CN': '现代文档宿主 / 块嵌入' },
  title: { 'en-US': 'Sheets in Docs / Project Investment Block', 'zh-CN': 'Sheets 嵌入现代文档 / 项目投资块' },
  description: {
    'en-US':
      'A narrative project brief contains a working investment model. Native DocBlock anchoring keeps the workbook between scope and decision sections as text changes.',
    'zh-CN': '项目说明正文内嵌可编辑投资模型。原生 DocBlock 锚点随文字变化，保持工作簿位于项目范围和决策章节之间。',
  },
  tags: { 'en-US': ['Embed', 'Modern Docs', 'Sheets', 'Block'], 'zh-CN': ['嵌入', '现代文档', '表格', '块'] },
  packages: [
    '@univerjs/core',
    '@univerjs/docs-ui',
    '@univerjs/preset-docs-drawing',
    '@univerjs/preset-sheets-advanced',
    '@univerjs/sheets-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createDocument()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FEmbed.getDescriptor()',
    'FRange.setValue()',
    'FDocumentParagraph.appendText()',
    'FWorkbook.updatePrintConfig()',
    'FUniver.Event.SheetPrintOpen',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Northstar proposes an assisted-booking pilot for three community repair hubs. Six effort lines total $35,320; a 10% reserve makes a $38,852 planning envelope against a $45,000 ceiling. A native Sheets Block sits inside the modern document. Navy, cream and sea-glass accents distinguish editable assumptions from narrative decisions.',
      'zh-CN':
        'Northstar 为三个社区维修站规划辅助预约试点。六项投入合计 35,320 美元，加上 10% 储备后为 38,852 美元，资金上限为 45,000 美元。原生 Sheets Block 位于现代文档正文内，以海军蓝、奶油色和海玻璃绿区分可编辑假设与叙述决策。',
    },
    tryIt: {
      'en-US': [
        'Read the scope and investment assumptions, then click the workbook inside the document to activate native cell editing.',
        'Change Investment B7 from 30 to 34 days. D14 becomes 41492 and D17 becomes 3508; the draft decision remains unchanged.',
        'Use the native expand control to open Phasing. Its allocations follow the investment envelope; return to Investment and close the expanded view.',
        'Edit the document title above the block. The block follows its native text anchor while the workbook retains its values.',
        'In the expanded workbook, choose Start > Print > Print. Preview opens outside fullscreen; Cancel returns to the document. Expand the block again to continue.',
      ],
      'zh-CN': [
        '阅读范围和投资假设，点击文档内的工作簿，激活原生单元格编辑。',
        '将 Investment B7 从 30 天改为 34 天，D14 变为 41492、D17 变为 3508；草案决策保持不变。',
        '使用原生展开控件打开 Phasing，分期金额随投资总额更新；切回 Investment 后关闭展开视图。',
        '修改嵌入块上方的文档标题，块随原生文字锚点移动，工作簿数值保持不变。',
        '在展开工作簿中选择 Start > Print > Print，预览在退出全屏后显示；Cancel 返回文档，再次展开嵌入块即可继续编辑。',
      ],
    },
    expected: {
      'en-US':
        'This is a real DocBlock and workbook, not an HTML table or iframe. Native expansion exposes the sheet bar and five Grid menu tabs. Print uses the local native preview; physical printing and binary Exchange conversion are not verified. Values are fictional planning inputs, not live booking or approval. No backend is used; reload loses edits. Full history, lifecycle, accessibility and performance acceptance remain open.',
      'zh-CN':
        '本例使用真实 DocBlock 与工作簿，不是 HTML 表格或 iframe。原生展开后可使用工作表栏和五个 Grid 菜单页。Print 使用本地原生预览；实体打印和二进制 Exchange 转换尚未验证。数据为虚构规划输入，不代表实时预约或审批。不使用后端，刷新丢失修改；完整历史归属、生命周期、可访问性和性能仍待验收。',
    },
  },
  variants: [
    {
      id: 'brief',
      label: { 'en-US': 'Narrative brief / Scope and decision gates', 'zh-CN': '叙述说明 / 范围与决策关卡' },
    },
    {
      id: 'investment',
      label: { 'en-US': 'Embedded investment / Editable effort assumptions', 'zh-CN': '嵌入投资模型 / 可编辑投入假设' },
    },
    { id: 'phasing', label: { 'en-US': 'Expanded workbook / Phased allocations', 'zh-CN': '展开工作簿 / 分阶段投入' } },
  ],
  actions: [
    {
      id: 'recalculate',
      label: { 'en-US': 'Edit effort and recalculate the envelope', 'zh-CN': '修改投入并重算总额' },
    },
    {
      id: 'expand',
      label: { 'en-US': 'Expand the native workbook and switch sheets', 'zh-CN': '展开原生工作簿并切换工作表' },
    },
    { id: 'anchor', label: { 'en-US': 'Edit narrative above the anchored block', 'zh-CN': '编辑锚定块上方的正文' } },
  ],
  states: [
    {
      id: 'passive',
      label: { 'en-US': 'Document reading / Embedded workbook preview', 'zh-CN': '文档阅读 / 嵌入工作簿预览' },
    },
    {
      id: 'active',
      label: { 'en-US': 'Active cell editing / Native floating toolbar', 'zh-CN': '单元格编辑 / 原生浮动工具栏' },
    },
    { id: 'error', label: { 'en-US': 'Source failure / Reload to retry', 'zh-CN': '资源失败 / 刷新重试' } },
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
