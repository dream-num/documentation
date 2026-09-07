import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/docs-modern-quote-blocks.png',
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Blocks', 'zh-CN': '内容块' },
  title: { 'en-US': 'Quote Blocks', 'zh-CN': '引用块' },
  description: {
    'en-US':
      'Compare single-paragraph, contextual, and attributed quotes; style the left rule and text while retaining inline emphasis and block boundaries.',
    'zh-CN': '比较单段、上下文与带署名引用；独立设置引线和文字颜色，同时保留行内强调和块边界。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Quotes'], 'zh-CN': ['现代文档', '单功能', '引用'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-hyper-link',
    '@univerjs-pro/docs-quote',
    '@univerjs-pro/docs-quote-ui',
    '@univerjs-pro/docs-callout',
    '@univerjs-pro/docs-callout-ui',
    '@univerjs-pro/docs-code',
    '@univerjs-pro/docs-code-ui',
    '@univerjs-pro/docs-list',
    '@univerjs-pro/docs-list-ui',
    '@univerjs-pro/license',
  ],
  apis: [
    'FDocument.insertQuote()',
    'FDocument.getQuotes()',
    'FDocument.getQuote()',
    'FDocument.getQuoteAt()',
    'FDocument.findQuotes()',
    'FDocumentQuote.describe()',
    'FDocumentQuote.getStyle()',
    'FDocumentQuote.setStyle()',
    'FDocumentQuote.setLineColor()',
    'FDocumentQuote.setTextColor()',
    'FDocumentQuote.unwrap()',
    'FDocumentQuote.remove()',
    'FDocumentParagraph.appendText()',
    'FDocument.save()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'An original Harbor walking-guide brief with four real business quotes: editorial voice, a contrasting observation, two-paragraph community feedback and three-paragraph attributed research. Original prose, overlapping bold/italic marks, lists, tasks, caution, code and link remain.',
      'zh-CN':
        '原创 Harbor 步行指南简报包含四个真实业务引用：编辑观点、对照观察、两段社区反馈和三段署名调研。保留原文、重叠粗斜体、清单、任务、提示、代码和链接。',
    },
    tryIt: {
      'en-US': [
        'Edit with native Grid and canvas. The quote floating menu is registered, but its opening click path currently fails strict verification.',
        'Run the literal README examples for single/context/attributed scopes, separate or combined colors, guarded attribution, selection and deletion.',
        'Compare complete history snapshots and same-ID reconstruction; failures must remain visible in the independent report.',
      ],
      'zh-CN': [
        '通过原生 Grid 和画布编辑。引用悬浮菜单已注册，但当前点击打开路径未通过严格验证。',
        '运行 README 逐段代码，体验单段、上下文、署名范围、独立或组合颜色、幂等署名、选择和删除。',
        '比较完整历史快照和同 ID 重建；失败保留在独立报告中。',
      ],
    },
    expected: {
      'en-US':
        'Native-only editor, four visually distinct quotes, full EN/ZH packs and official CSS. Theme changes keep the same owner and edited data. Known combined-color Undo remains a strict beta.2 regression; a successful mutation is not proof of reversible history. Trial watermarks remain visible.',
      'zh-CN':
        '纯原生编辑器、四种不同引用、完整中英文资源与官方样式。主题切换保留同一 owner 和编辑数据。组合颜色撤销仍按 beta.2 严格回归检查；修改成功不代表历史可逆。保留试用水印。',
    },
  },
  variants: [
    ['single', 'Single paragraph', '单段引用'],
    ['context', 'With context', '带上下文'],
    ['attribution', 'With attribution', '带署名'],
    ['editorial', 'Editorial blue', '编辑蓝'],
    ['community', 'Community green', '社区绿'],
    ['research', 'Research violet', '调研紫'],
    ['contrast', 'High contrast', '高对比'],
    ['line-only', 'Line only', '仅引线'],
    ['text-only', 'Text only', '仅文字'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['wrap', 'Wrap selected scope', '包裹指定范围'],
    ['style', 'Apply style', '应用样式'],
    ['line', 'Apply line color', '更改引线颜色'],
    ['text', 'Apply text color', '更改文字颜色'],
    ['attribution', 'Append attribution', '追加署名'],
    ['select', 'Select quote text', '选择引用文字'],
    ['unwrap', 'Convert to plain text', '转为普通文本'],
    ['remove', 'Delete quote and text', '删除引用及文字'],
    ['missing', 'Query missing ID', '查询缺失 ID'],
    ['undo', 'Native Undo', '原生撤销'],
    ['redo', 'Native Redo', '原生重做'],
    ['inspect', 'Read Facade descriptions', '读取 Facade 描述'],
    ['roundtrip', 'Same-ID reconstruction', '同 ID 重建'],
    ['empty', 'Empty document', '空文档'],
    ['reset', 'Restore captured baseline', '恢复捕获基线'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['baseline', 'Original brief', '原始简报'],
    ['multi-paragraph', 'Multiple paragraphs', '多段引用'],
    ['attributed', 'Attributed', '带署名'],
    ['plain-text', 'Plain text', '普通文本'],
    ['deleted', 'Deleted', '已删除'],
    ['empty', 'Empty', '空文档'],
    ['error', 'Rejected or failed', '拒绝或失败'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
