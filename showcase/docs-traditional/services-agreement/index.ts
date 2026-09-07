import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/docs-traditional-services-agreement.png',
  product: 'docs-traditional' as const,
  category: 'showcases' as const,
  group: { 'en-US': 'Legal documents', 'zh-CN': '法律文档' },
  title: { 'en-US': 'Services Agreement', 'zh-CN': '服务协议' },
  description: {
    'en-US': 'Build a paged, numbered agreement and apply an idempotent clause-and-cross-reference revision.',
    'zh-CN': '构建分页编号协议，并应用幂等的条款与交叉引用修订。',
  },
  tags: { 'en-US': ['Traditional Docs', 'Contract', 'Pagination'], 'zh-CN': ['传统文档', '合同', '分页'] },
  packages: ['@univerjs/preset-docs-core'],
  apis: [
    { name: 'FUniver.createDocument()' },
    { name: 'FDocument.ensurePageFooter()' },
    { name: 'FDocumentParagraph.setText()' },
    { name: 'FDocumentParagraph.setStyle()' },
  ],
  guide: {
    overview: {
      'en-US':
        'A sixteen-clause services agreement with physical pages, footer, keep rules, a signature-page break, and linked approval text.',
      'zh-CN': '包含十六条条款、物理分页、页脚、段落保持规则、签字页分页和关联审批文本的服务协议。',
    },
    tryIt: {
      'en-US': [
        'Review reserved Clause 15 and its pending approval.',
        'Run the README clause-revision recipe against the native document.',
        'Confirm the clause and authored approval text change; inspect the dedicated signature page.',
      ],
      'zh-CN': [
        '查看保留的第 15 条及待审批状态。',
        '对原生文档执行 README 条款修订代码。',
        '确认条款和审批文本变化，并查看独立签字页。',
      ],
    },
    expected: {
      'en-US':
        'Three guarded text mutations revise Clause 15 and its authored reference; repetition is a no-op, not an atomic approval. Signatures retain a dedicated final page.',
      'zh-CN': '通过三步受保护的文本修改修订第 15 条及手写引用；重复执行不再修改，并非原子审批。签字区保留在独立末页。',
    },
  },
  variants: [
    { id: 'reserved', label: { 'en-US': 'Version 3.2 · pending', 'zh-CN': '版本 3.2 · 待定' } },
    { id: 'accepted', label: { 'en-US': 'Limitation accepted', 'zh-CN': '责任限制已接受' } },
  ],
  actions: [
    { id: 'accept-clause', label: { 'en-US': 'Accept Clause 15', 'zh-CN': '接受第 15 条' } },
    { id: 'save', label: { 'en-US': 'Save native document', 'zh-CN': '保存原生文档' } },
  ],
  states: [
    { id: 'pending', label: { 'en-US': 'Commercial approval pending', 'zh-CN': '商业审批待定' } },
    { id: 'approved', label: { 'en-US': 'Clause and reference approved', 'zh-CN': '条款和引用已批准' } },
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
