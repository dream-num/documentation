import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/docs-modern-incident-postmortem.png',
  product: 'docs-modern' as const,
  category: 'showcases' as const,
  group: { 'en-US': 'Operations and incidents', 'zh-CN': '运营与事故' },
  title: { 'en-US': 'Incident Postmortem', 'zh-CN': '事故复盘' },
  description: {
    'en-US': 'Render a structured SEV-1 postmortem and complete a remediation item through the document Facade API.',
    'zh-CN': '呈现结构化 SEV-1 事故复盘，并通过文档 Facade API 完成整改项。',
  },
  tags: { 'en-US': ['Modern Docs', 'Postmortem', 'Workflow'], 'zh-CN': ['现代文档', '事故复盘', '工作流'] },
  packages: ['@univerjs/preset-docs-core'],
  apis: [
    { name: 'FUniver.createDocument()' },
    { name: 'FDocument.appendParagraph()' },
    { name: 'FDocumentParagraph.setText()' },
    { name: 'FDocumentParagraph.setStyle()' },
  ],
  guide: {
    overview: {
      'en-US':
        'A 42-minute incident report with impact, cause, timeline, evidence, and one idempotent remediation transition.',
      'zh-CN': '一份 42 分钟事故报告，包含影响、根因、时间线、证据和一个幂等整改状态转换。',
    },
    tryIt: {
      'en-US': [
        'Read the impact, cause, timeline and evidence.',
        'Edit the native remediation paragraph.',
        'Use the README Facade recipe to complete A-04 without replacing the report.',
      ],
      'zh-CN': [
        '阅读影响、根因、时间线和证据。',
        '直接编辑原生整改段落。',
        '使用 README 中的 Facade 代码完成 A-04，不替换整份报告。',
      ],
    },
    expected: {
      'en-US':
        'The remediation paragraph changes while the incident facts remain intact. Theme changes keep the same editor and edits; there is no external reset or activity panel.',
      'zh-CN': '整改段落变化，事故事实保持不变。主题切换保留同一编辑器和编辑，不使用外部重置或活动面板。',
    },
  },
  variants: [
    { id: 'resolved', label: { 'en-US': 'Resolved incident', 'zh-CN': '已解决事故' } },
    { id: 'action-complete', label: { 'en-US': 'All remediation complete', 'zh-CN': '整改全部完成' } },
  ],
  actions: [
    { id: 'complete-action', label: { 'en-US': 'Complete A-04', 'zh-CN': '完成 A-04' } },
    { id: 'save', label: { 'en-US': 'Save the document snapshot', 'zh-CN': '保存文档快照' } },
  ],
  states: [
    { id: 'open', label: { 'en-US': 'One action open', 'zh-CN': '一个开放任务' } },
    { id: 'complete', label: { 'en-US': 'All actions complete', 'zh-CN': '任务全部完成' } },
  ],
}

const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './code/README.md',
  '/src/styles.css': './code/styles.css',
  '/reference/preview.tsx.txt': './preview/main.tsx',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
})

export default { metadata, files, Preview }
