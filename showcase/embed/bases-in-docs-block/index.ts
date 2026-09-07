import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Modern Docs host / Block', 'zh-CN': '现代文档宿主 / 块嵌入' },
  title: { 'en-US': 'Bases in Docs / Launch Responsibilities', 'zh-CN': 'Bases 嵌入现代文档 / 发布职责' },
  description: {
    'en-US':
      'A release brief embeds a real readiness register with linked owners. Edit the Base without rewriting the narrative decision, then expand to the People directory.',
    'zh-CN': '发布说明内嵌真实就绪清单与关联负责人。修改 Base 不会改写正文决策，展开后可访问人员目录。',
  },
  tags: { 'en-US': ['Embed', 'Modern Docs', 'Bases', 'Block'], 'zh-CN': ['嵌入', '现代文档', '多维表格', '块'] },
  packages: [
    '@univerjs/core',
    '@univerjs/docs-ui',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/bases',
    '@univerjs-pro/bases-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createDocument()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FBaseRecord.setValue()',
    'FDocumentParagraph.appendText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Orchard prepares a limited library collection service for 40 invited readers. Eight release checks reference five people through real Base record links. Plum narrative headings, sage readiness, amber review and rose blockers separate meaning without changing native SDK chrome.',
      'zh-CN':
        'Orchard 为 40 位受邀读者准备限量图书取件服务。八项发布检查通过真实 Base 记录关联到五位负责人。正文使用梅紫标题，以鼠尾草绿、琥珀色和玫瑰色区分就绪、审核和阻塞，不改变原生 SDK 界面。',
    },
    tryIt: {
      'en-US': [
        'Read the release conditions, then click the embedded Launch readiness register to activate native Base editing.',
        'Edit Keyboard walkthrough to Keyboard and screen-reader check. The Base changes; the document still says Decision: not released.',
        'Expand the Base, open People and rename Maya Patel to Maya Chen. Return to Readiness: linked owner labels update while record IDs remain stable.',
        'Edit the document title above the block. Its native anchor moves while Base records remain unchanged.',
      ],
      'zh-CN': [
        '阅读发布条件，点击内嵌 Launch readiness 清单，激活原生 Base 编辑。',
        '将 Keyboard walkthrough 改为 Keyboard and screen-reader check，Base 更新，正文仍保留 Decision: not released。',
        '展开 Base 并打开 People，将 Maya Patel 改为 Maya Chen；返回 Readiness，关联负责人显示更新，记录 ID 保持稳定。',
        '编辑嵌入块上方的文档标题，原生锚点随文字移动，Base 记录保持不变。',
      ],
    },
    expected: {
      'en-US':
        'This is a native DocBlock containing a real two-table Base, not an iframe or HTML grid. Record edits are not release approvals. All data is fictional; no notifications, backend, Exchange or Print conversion are provided. Reload loses edits. Full lifecycle, accessibility and performance acceptance remain open.',
      'zh-CN':
        '本例是包含真实双表 Base 的原生 DocBlock，不是 iframe 或 HTML 表格。修改记录不代表批准发布。数据均为虚构，不提供通知、后端或 Exchange / Print 转换。刷新丢失修改；完整生命周期、可访问性和性能仍待验收。',
    },
  },
  variants: [
    { id: 'brief', label: { 'en-US': 'Release brief / Conditions and decision', 'zh-CN': '发布说明 / 条件与决策' } },
    {
      id: 'readiness',
      label: { 'en-US': 'Readiness / Eight checks with linked owners', 'zh-CN': '就绪清单 / 八项检查与关联负责人' },
    },
    {
      id: 'people',
      label: { 'en-US': 'People / Responsibilities and coverage', 'zh-CN': '人员目录 / 职责与值守时段' },
    },
  ],
  actions: [
    { id: 'edit', label: { 'en-US': 'Edit a native Base record', 'zh-CN': '编辑原生 Base 记录' } },
    { id: 'link', label: { 'en-US': 'Rename a linked owner', 'zh-CN': '重命名关联负责人' } },
    { id: 'anchor', label: { 'en-US': 'Move the block by editing narrative', 'zh-CN': '编辑正文并移动块锚点' } },
  ],
  states: [
    { id: 'passive', label: { 'en-US': 'Read the document and embedded register', 'zh-CN': '阅读文档与内嵌清单' } },
    { id: 'active', label: { 'en-US': 'Edit the Base inline or expanded', 'zh-CN': '在正文内或展开后编辑 Base' } },
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
