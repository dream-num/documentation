import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Modern Docs host / Block', 'zh-CN': '现代文档宿主 / 块嵌入' },
  title: { 'en-US': 'Canvas in Docs / Architecture Decision', 'zh-CN': 'Canvas 嵌入现代文档 / 技术决策' },
  description: {
    'en-US':
      'A technical decision record embeds a native service-boundary Canvas. Edit and move connected shapes without changing the host decision.',
    'zh-CN': '技术决策记录内嵌原生服务边界 Canvas，编辑文字、拖动连接节点不会改写宿主决策。',
  },
  tags: { 'en-US': ['Embed', 'Modern Docs', 'Canvases', 'Block'], 'zh-CN': ['嵌入', '现代文档', 'Canvases', '块'] },
  packages: [
    '@univerjs/core',
    '@univerjs/docs-ui',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/boards',
    '@univerjs-pro/boards-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createDocument()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FBoard.getShape()',
    'FShapeText.setText()',
    'FDocumentParagraph.appendText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Pine proposes an exhibition reservation boundary: commit the reservation and outbox item together, then send email separately. Seven colored nodes and seven bound connectors make ownership and retries visible. This is an editable design artifact, not an operating service.',
      'zh-CN':
        'Pine 提议展览预约边界：预约和 outbox 记录一起提交，再独立发送邮件。七个彩色节点与七条绑定连接线展示职责及重试。这是可编辑设计稿，不是运行中的服务。',
    },
    tryIt: {
      'en-US': [
        'Read the proposed decision, then activate the embedded Canvas.',
        'Change Retry queue from 30 min / Open to 30 min / In review using native shape text editing. The host still says Status: proposed, not deployed.',
        'Drag the Retry queue node and use native Undo to restore it. Expand the Canvas to inspect the complete diagram.',
        'Edit the document title above the Canvas. Its native block anchor moves while the diagram remains unchanged.',
      ],
      'zh-CN': [
        '阅读拟议决策并激活内嵌 Canvas。',
        '用原生形状文字编辑将 Retry queue 的 30 min / Open 改为 30 min / In review；宿主仍显示 Status: proposed, not deployed。',
        '拖动 Retry queue 节点，并用原生 Undo 恢复；展开 Canvas 查看完整图。',
        '修改 Canvas 上方的文档标题；块锚点随正文移动，图中内容保持不变。',
      ],
    },
    expected: {
      'en-US':
        'A real Docs custom block contains a native Canvas, not an iframe or diagram image. Canvas edits do not deploy a service or rewrite the decision. All content is fictional; no backend, booking, message or Exchange/Print conversion is provided. Reload loses edits. License watermarks and broader lifecycle/performance acceptance remain open.',
      'zh-CN':
        '真实 Docs 自定义块包含原生 Canvas，不是 iframe 或图片。修改 Canvas 不会部署服务或改写决策。内容均为虚构，不提供后端、预约、消息或 Exchange / Print 转换。刷新丢失修改；授权水印与完整生命周期、性能仍待验收。',
    },
  },
  variants: [
    { id: 'decision', label: { 'en-US': 'Decision / Context and trade-offs', 'zh-CN': '决策 / 背景与取舍' } },
    { id: 'transaction', label: { 'en-US': 'Transaction / Reservation and outbox', 'zh-CN': '事务 / 预约与 outbox' } },
    {
      id: 'delivery',
      label: { 'en-US': 'Delivery / Worker, provider and retry', 'zh-CN': '投递 / Worker、服务商与重试' },
    },
  ],
  actions: [
    { id: 'edit', label: { 'en-US': 'Edit a native Canvas label', 'zh-CN': '编辑原生 Canvas 文字' } },
    { id: 'drag', label: { 'en-US': 'Move a connected shape and undo', 'zh-CN': '移动连接节点并撤销' } },
    { id: 'anchor', label: { 'en-US': 'Move the block by editing narrative', 'zh-CN': '编辑正文并移动块锚点' } },
  ],
  states: [
    { id: 'passive', label: { 'en-US': 'Read the decision and diagram', 'zh-CN': '阅读决策与图' } },
    { id: 'active', label: { 'en-US': 'Edit inline or expanded', 'zh-CN': '在正文内或展开后编辑' } },
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
