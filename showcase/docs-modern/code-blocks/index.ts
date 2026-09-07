import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/docs-modern-code-blocks.png',
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Blocks', 'zh-CN': '内容块' },
  title: { 'en-US': 'Code Blocks', 'zh-CN': '代码块' },
  description: {
    'en-US':
      'Switch syntax languages, inspect layout settings, and copy exact code with tabs and blank lines in an original sensor-product brief.',
    'zh-CN': '在原创传感器产品简报中切换语法语言、检查布局设置，并复制保留制表符与空行的原始代码。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Code'], 'zh-CN': ['现代文档', '单功能', '代码'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-hyper-link',
    '@univerjs-pro/docs-code',
    '@univerjs-pro/docs-code-ui',
    '@univerjs-pro/docs-callout',
    '@univerjs-pro/docs-callout-ui',
    '@univerjs-pro/docs-list',
    '@univerjs-pro/docs-list-ui',
    '@univerjs-pro/docs-quote',
    '@univerjs-pro/docs-quote-ui',
    '@univerjs-pro/license',
  ],
  apis: [
    'FDocument.insertCode()',
    'FDocument.getCode()',
    'FDocument.getCodes()',
    'FDocument.findCodes()',
    'FDocumentCode.describe()',
    'FDocumentCode.getText()',
    'FDocumentCode.getConfig()',
    'FDocumentCode.updateConfig()',
    'FDocumentCode.unwrap()',
    'FDocumentCode.remove()',
    'FDocument.insertText()',
    'FDocument.save()',
    'navigator.clipboard.writeText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Original Beacon observation brief: TypeScript ingestion, JSON manifest, Python review filter, SQL daily summary and independent SQL comparison are five native code blocks. Original prose, tabs, blank lines, long line, Unicode dash, lists, tasks, caution, quote and review link remain.',
      'zh-CN':
        '原创 Beacon 观察简报：TypeScript 采集、JSON 清单、Python 筛选、SQL 汇总与独立 SQL 对照构成五个原生代码块。保留原文、制表符、空行、长行、Unicode 破折号、清单、任务、提示、引用和链接。',
    },
    tryIt: {
      'en-US': [
        'Use native Grid and the code language picker; inspect the original business samples within one document without a loader.',
        'Run literal README examples for six languages, wrapping, line numbers, tab widths, selection, blank lines, unwrap/delete, copying and exact reconstruction.',
        'Compare actual glyphs/layout and complete history snapshots. Facade text and saved-model source are explicitly separate clipboard paths; newline loss is not hidden.',
      ],
      'zh-CN': [
        '使用原生 Grid 与代码语言菜单；在同一文档中查看原创业务代码，无需样本加载器。',
        '运行 README 逐段代码，体验六种语言、换行、行号、制表宽度、选择、空行、取消代码块、删除、复制和精确重建。',
        '比较实际字形布局和完整历史快照。Facade 文本与保存模型源码是明确区分的复制路径，不掩盖换行丢失。',
      ],
    },
    expected: {
      'en-US':
        'Native-only editor with all official CSS and EN/ZH packs, same-owner edited themes and idempotent disposal. Known beta.2 newline, language-history and code-layout issues are strict regression gates, not simulated successes. No sample executes. Trial watermarks remain.',
      'zh-CN':
        '纯原生编辑器包含完整官方样式与中英文资源，同 owner 主题保留编辑并支持幂等销毁。beta.2 换行、语言历史与代码布局问题按严格回归记录，不模拟成功，不执行样本，保留试用水印。',
    },
  },
  variants: [
    ['typescript', 'TypeScript', 'TypeScript'],
    ['javascript', 'JavaScript', 'JavaScript'],
    ['json', 'JSON', 'JSON'],
    ['python', 'Python', 'Python'],
    ['sql', 'SQL', 'SQL'],
    ['plaintext', 'Plain text', '纯文本'],
    ['wrapped', 'Wrapped lines', '自动换行'],
    ['unwrapped-lines', 'Unwrapped lines', '不自动换行'],
    ['numbered', 'Line numbers', '行号'],
    ['tab-size', 'Tab width', '制表宽度'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['sample', 'Inspect business samples', '查看业务代码'],
    ['language', 'Change language', '更改语言'],
    ['layout', 'Change code layout', '更改代码布局'],
    ['copy', 'Copy current source', '复制当前源码'],
    ['append', 'Append blank line', '追加空行'],
    ['select', 'Select code', '选择代码'],
    ['unwrap', 'Convert to plain text', '转为普通文本'],
    ['wrap', 'Wrap ingestion as code', '包裹采集代码'],
    ['remove', 'Delete code and text', '删除代码块与内容'],
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
    ['language-changed', 'Language changed', '已切换语言'],
    ['edited', 'Edited', '已编辑'],
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
