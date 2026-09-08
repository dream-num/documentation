import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/docs-traditional-research-paper.png',
  product: 'docs-traditional' as const,
  category: 'showcases' as const,
  group: { 'en-US': 'Academic and technical', 'zh-CN': '学术与技术' },
  title: { 'en-US': 'Research Paper', 'zh-CN': '研究论文' },
  description: {
    'en-US': 'Create a paginated academic paper with page geometry, typography, sections, and reproducible parameters.',
    'zh-CN': '创建包含页面尺寸、学术排版、章节和可复现实验参数的分页论文。',
  },
  tags: { 'en-US': ['Traditional Docs', 'Pagination', 'Academic'], 'zh-CN': ['传统文档', '分页', '学术'] },
  packages: ['@univerjs/preset-docs-core'],
  apis: [
    { name: 'FUniver.createDocument()' },
    { name: 'DocumentFlavor.TRADITIONAL' },
    { name: 'FDocument.appendParagraph()' },
  ],
  guide: {
    overview: {
      'en-US':
        'A native paginated manuscript with the original reproduction appendix and literal Facade review variations.',
      'zh-CN': '原生分页论文，保留原始复现附录，并提供逐字 Facade 审阅变体。',
    },
    tryIt: {
      'en-US': [
        'Inspect page size and margins.',
        'Edit a result paragraph.',
        'Read Appendix A, then run the guarded Appendix B example.',
      ],
      'zh-CN': ['查看页面尺寸和页边距。', '编辑结果段落。', '阅读附录 A，再运行带模型校验的附录 B 示例。'],
    },
    expected: {
      'en-US':
        'The original paper and Appendix A remain paginated. The literal appendix guard rejects repeats; same-ID snapshots recover all content.',
      'zh-CN': '原稿和附录 A 保持分页。逐字附录示例拒绝重复追加，同 ID 快照恢复全部内容。',
    },
  },
  variants: [
    { id: 'paper', label: { 'en-US': 'Conference paper', 'zh-CN': '会议论文' } },
    { id: 'appendix', label: { 'en-US': 'Additional reviewer appendix', 'zh-CN': '追加审阅附录' } },
  ],
  actions: [],
  states: [
    { id: 'normal', label: { 'en-US': 'Normal paper', 'zh-CN': '正常论文' } },
    { id: 'long-content', label: { 'en-US': 'Multi-page content', 'zh-CN': '多页内容' } },
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
