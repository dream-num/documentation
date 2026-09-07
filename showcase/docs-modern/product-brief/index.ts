import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/docs-modern-product-brief.png',
  product: 'docs-modern' as const,
  category: 'showcases' as const,
  group: { 'en-US': 'Product and planning', 'zh-CN': '产品与规划' },
  title: { 'en-US': 'Product Brief', 'zh-CN': '产品简报' },
  description: {
    'en-US': 'Build an editable, block-oriented launch brief and update it through the document Facade API.',
    'zh-CN': '构建可编辑的块式发布简报，并通过文档 Facade API 更新内容。',
  },
  tags: { 'en-US': ['Modern Docs', 'Facade API', 'Product planning'], 'zh-CN': ['现代文档', 'Facade API', '产品规划'] },
  packages: ['@univerjs/preset-docs-core'],
  apis: [
    { name: 'FUniver.createDocument()' },
    { name: 'FDocument.appendParagraph()' },
    { name: 'FDocumentParagraph.setStyle()' },
  ],
  guide: {
    overview: {
      'en-US':
        'An original eight-section product proposal with pilot boundaries, owners and review evidence. Its offline review story is proposed product behavior, not an implemented synchronization feature.',
      'zh-CN':
        '原创的八章节产品提案，包含试点边界、负责人和审阅证据；离线审阅是提案中的产品设想，不代表示例实现了同步功能。',
    },
    tryIt: {
      'en-US': [
        'Edit any paragraph directly.',
        'Run the README pilot-scope edit and native Undo/Redo; the success targets must remain unchanged.',
        'Append the decision with its literal Facade block, then repeat that block to verify no duplicate section.',
        'Download the edited JSON or recreate its document using the README; no Preview-only controls are present.',
      ],
      'zh-CN': [
        '直接编辑任意段落。',
        '运行 README 的试点范围修改和原生撤销重做，确认成功指标未变化。',
        '运行添加决策的 Facade 代码，再重复一次确认没有重复章节。',
        '使用 README 下载已编辑 JSON 或重建文档；预览中没有独有的控件。',
      ],
    },
    expected: {
      'en-US':
        'Native Grid, official preset CSS and full initial EN/ZH locales. Literal edits retain unrelated prose, the decision guard avoids duplicate headings, and themes keep the owner and edits. JSON is not DOCX/PDF conversion; Print and offline synchronization are not claimed.',
      'zh-CN':
        '原生 Grid、官方预设 CSS 与完整初始中英语言包。代码修改保留无关正文，决策检查避免重复标题，切换主题保留实例和编辑。JSON 不是 DOCX/PDF 转换，本例不声称实现打印或离线同步。',
    },
  },
  variants: [
    { id: 'brief', label: { 'en-US': 'Launch brief', 'zh-CN': '发布简报' } },
    { id: 'decision', label: { 'en-US': 'Brief with decision log', 'zh-CN': '包含决策记录' } },
  ],
  actions: [
    { id: 'native-edit', label: { 'en-US': 'Native document editing', 'zh-CN': '原生文档编辑' } },
    { id: 'readme', label: { 'en-US': 'Run literal Facade examples', 'zh-CN': '运行 Facade 代码' } },
  ],
  states: [
    { id: 'baseline', label: { 'en-US': 'Baseline', 'zh-CN': '基线' } },
    { id: 'updated', label: { 'en-US': 'Decision recorded', 'zh-CN': '已记录决策' } },
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
