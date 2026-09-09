import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'docs-traditional' as const,
  category: 'showcases' as const,
  image: '/assets/showcase/docs-traditional-corporate-annual-report.png',
  group: { 'en-US': 'Business reports', 'zh-CN': '商业报告' },
  title: { 'en-US': 'Corporate Annual Report', 'zh-CN': '企业年报' },
  description: {
    'en-US':
      'Explore ten original annual-report chapters with physical pages, recurring headers and footers, and an editable financial disclosure.',
    'zh-CN': '浏览十个原创年报章节，体验物理分页、重复页眉页脚及可编辑财务披露。',
  },
  tags: { 'en-US': ['Traditional Docs', 'Annual Report', 'Pagination'], 'zh-CN': ['传统文档', '年报', '分页'] },
  packages: ['@univerjs/preset-docs-core'],
  apis: [
    { name: 'FUniver.createDocument()' },
    { name: 'FDocument.ensurePageHeader()' },
    { name: 'FDocument.ensurePageFooter()' },
    { name: 'FDocumentParagraph.setStyle()' },
    { name: 'FDocumentParagraph.setText()' },
    { name: 'FDocumentSection.setPageSetup()' },
    { name: 'FDocument.save()' },
  ],
  guide: {
    overview: {
      'en-US':
        'A fictional, unaudited ten-chapter report connects financial performance with the customer journey, reliability, capital allocation, governance and reporting basis. Physical pages, recurring segments, keep-with-next and widow control use native Docs.',
      'zh-CN':
        '虚构、未经审计的十章年报将财务业绩与客户流程、可靠性、资本配置、治理和报告口径结合；物理分页、重复区段、与下段同页及孤行控制均使用原生 Docs。',
    },
    tryIt: {
      'en-US': [
        'Inspect the page margins, header, and footer.',
        'Run the README revision for both the three-year disclosure and headline.',
        'Repeat the guarded recipe and confirm the original narrative remains intact.',
      ],
      'zh-CN': [
        '查看页边距、页眉和页脚。',
        '执行 README 示例，修订三年披露及收入摘要。',
        '重复执行受保护的代码，确认原始叙述保持不变。',
      ],
    },
    expected: {
      'en-US': 'The revenue line changes from $45.0M to $46.5M once while the paged report structure remains stable.',
      'zh-CN': '收入行只从 45.0M 美元变为 46.5M 美元一次，分页报告结构保持稳定。',
    },
  },
  variants: [
    { id: 'baseline', label: { 'en-US': 'Illustrative baseline', 'zh-CN': '示例基线' } },
    { id: 'updated', label: { 'en-US': 'Updated outlook', 'zh-CN': '更新展望' } },
    { id: 'compact', label: { 'en-US': 'Compact review pages', 'zh-CN': '紧凑审阅分页' } },
  ],
  actions: [],
  states: [
    { id: 'baseline', label: { 'en-US': '$45.0M · 5.1%', 'zh-CN': '45.0M 美元 · 5.1%' } },
    { id: 'revised', label: { 'en-US': '$46.5M · 8.6%', 'zh-CN': '46.5M 美元 · 8.6%' } },
  ],
}

const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
  '/reference/Preview.tsx': './preview/main.tsx',
})

export default { metadata, files, Preview }
