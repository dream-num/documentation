import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/docs-modern-company-knowledge-base.png',
  product: 'docs-modern' as const,
  category: 'showcases' as const,
  group: { 'en-US': 'Knowledge and wiki', 'zh-CN': '知识库与 Wiki' },
  title: { 'en-US': 'Company Knowledge Base', 'zh-CN': '企业知识库' },
  description: {
    'en-US': 'Navigate a host-owned page tree while Univer mounts distinct editable modern documents.',
    'zh-CN': '在宿主维护的页面树中导航，并由 Univer 挂载不同的可编辑现代文档。',
  },
  tags: { 'en-US': ['Modern Docs', 'Knowledge Base', 'Lifecycle'], 'zh-CN': ['现代文档', '知识库', '生命周期'] },
  packages: ['@univerjs/preset-docs-core'],
  apis: [
    { name: 'FUniver.createDocument()' },
    { name: 'FUniver.disposeUnit()' },
    { name: 'FDocument.findParagraphByText()' },
    { name: 'FDocumentParagraph.setText()' },
  ],
  guide: {
    overview: {
      'en-US':
        'A three-page knowledge space with host navigation, original editable page content, and in-memory snapshots that retain edits when switching pages. The README review policy rejects the archived page; this is not an SDK read-only permission demo.',
      'zh-CN':
        '包含三个页面的知识空间，演示宿主导航、页面级数据及切页时保留编辑的内存快照。README 中的复核策略只拒绝归档页面，并非 SDK 只读权限演示。',
    },
    tryIt: {
      'en-US': [
        'Switch between all three pages.',
        'Edit a review date natively or run the literal Facade example.',
        'Compare archived policy rejection, snapshot restoration and native Undo/Redo.',
      ],
      'zh-CN': [
        '切换三个页面并保留原生编辑。',
        '原生编辑复核日期或运行逐字 Facade 示例。',
        '比较归档策略拒绝、快照恢复和原生撤销重做。',
      ],
    },
    expected: {
      'en-US':
        'Each tree item restores its local snapshot, live pages update visibly, and the README policy rejects an archived review. The editor itself remains editable. A browser reload discards all in-memory changes.',
      'zh-CN':
        '每个树节点恢复本地快照；有效页面可见更新，README 策略拒绝归档复核。编辑器本身仍可编辑。刷新浏览器会丢弃内存中的全部修改。',
    },
  },
  variants: [
    { id: 'handbook', label: { 'en-US': 'Engineering handbook', 'zh-CN': '工程手册' } },
    { id: 'api', label: { 'en-US': 'API standards', 'zh-CN': 'API 规范' } },
    { id: 'legacy', label: { 'en-US': 'Archived deployment guide', 'zh-CN': '归档部署指南' } },
  ],
  actions: [
    { id: 'open-page', label: { 'en-US': 'Open page', 'zh-CN': '打开页面' } },
    { id: 'native-edit', label: { 'en-US': 'Native text and heading editing', 'zh-CN': '原生文字与标题编辑' } },
    { id: 'literal', label: { 'en-US': 'Run 14 literal Facade examples', 'zh-CN': '运行 14 段逐字 Facade 示例' } },
  ],
  states: [
    { id: 'fresh', label: { 'en-US': 'Fresh page', 'zh-CN': '最新页面' } },
    { id: 'updated', label: { 'en-US': 'Review date updated', 'zh-CN': '复核日期已更新' } },
    {
      id: 'archived',
      label: { 'en-US': 'Archived · application review rejected', 'zh-CN': '已归档 · 应用复核被拒绝' },
    },
  ],
}

const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})

export default { metadata, files, Preview }
