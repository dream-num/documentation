import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/docs-modern-lists-task-items.png',
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Blocks', 'zh-CN': '内容块' },
  title: { 'en-US': 'Lists and Task Items', 'zh-CN': '列表与任务项' },
  description: {
    'en-US':
      'Nest installation steps, restart and continue numbering, format markers at three scopes, and complete opening tasks in an original museum brief.',
    'zh-CN': '在原创博物馆开幕简报中嵌套布展步骤、重启和延续编号、按三种范围设置标记并完成任务。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Lists'], 'zh-CN': ['现代文档', '单功能', '列表'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-hyper-link',
    '@univerjs-pro/docs-list',
    '@univerjs-pro/docs-list-ui',
    '@univerjs-pro/docs-callout',
    '@univerjs-pro/docs-callout-ui',
    '@univerjs-pro/docs-code',
    '@univerjs-pro/docs-code-ui',
    '@univerjs-pro/docs-quote',
    '@univerjs-pro/docs-quote-ui',
    '@univerjs-pro/license',
  ],
  apis: [
    'FDocument.insertList()',
    'FDocument.findListItems()',
    'FDocument.describeListItems()',
    'FDocumentListItem.demote()',
    'FDocumentListItem.promote()',
    'FDocumentListItem.setGlyphType()',
    'FDocumentListItem.setGlyphSymbol()',
    'FDocumentListItem.setStartNumber()',
    'FDocumentListItem.continueNumbering()',
    'FDocumentListItem.setPrefixSuffix()',
    'FDocumentListItem.select()',
    'FDocumentParagraph.setTaskChecked()',
    'FDocument.save()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Mosaic is an original fictional pop-up museum. Its six-section opening brief contains three objects, five installation steps, a separate two-step partner handoff, and three checks (one completed). A warning callout, operating code, quote, and guide link provide realistic neighboring blocks.',
      'zh-CN':
        'Mosaic 是原创虚构快闪博物馆。六节开幕简报包含三件展品、五个布展步骤、单独的两项合作方交接和三项检查（其中一项已完成），并有提示块、代码、引用和链接。',
    },
    tryIt: {
      'en-US': [
        'Edit the museum brief directly with the native Grid ribbon and canvas.',
        'Compare the nested LABEL/LIGHT preparation steps with the top-level installation and partner lists.',
        'Use native list, indent and task controls; type into an item, then use native Undo and Redo.',
        'Run the README Facade variants for item/level/list scope, decimal/letter/Roman/diamond markers, numbering and task state.',
        'Recreate edited snapshots and an empty document using the literal README examples.',
      ],
      'zh-CN': [
        '通过原生 Grid 工具栏和画布直接编辑博物馆简报。',
        '比较 LABEL/LIGHT 嵌套准备步骤、顶层布展步骤与合作方列表。',
        '使用原生列表、缩进与任务控件，输入文字后使用原生撤销和重做。',
        '运行 README 中单项/同层/整列、数字/字母/罗马/菱形标记、编号与任务状态的 Facade 变体。',
        '使用 README 逐段代码重建编辑后的快照和空文档。',
      ],
    },
    expected: {
      'en-US':
        'Real SDK lists, tasks and supporting blocks share one editable modern document. Initial UI language follows page lang; complete EN/ZH packs and official CSS ship with Preview and export. Theme changes preserve the owner and edits. README retains scope, numbering, selection, history, empty-document and snapshot variants without host controls. Strict tests compare full models and actual glyphs/pixels; the beta.2 single-item marker leak after a level edit remains a known failure until the SDK behavior passes.',
      'zh-CN':
        '真实 SDK 列表、任务与辅助内容块共用一份可编辑现代文档。初始语言跟随页面，Preview 与导出包含完整英中文语言包及官方样式；换主题保留实例和编辑。README 保留范围、编号、选择、历史、空文档与快照变体，不叠加宿主按钮。严格测试比较完整模型和实际标记/像素；beta.2 同层编辑后单项标记连带邻项的问题在 SDK 真正通过前保留失败。',
    },
  },
  variants: [
    ['item', 'Single item', '单项'],
    ['level', 'Current level', '同层'],
    ['list', 'Whole list', '整列'],
    ['decimal', 'Decimal', '数字'],
    ['letters', 'Uppercase letters', '大写字母'],
    ['roman', 'Roman numerals', '罗马数字'],
    ['diamond', 'Diamond bullet', '菱形标记'],
    ['checked', 'Completed task', '已完成任务'],
    ['unchecked', 'Open task', '待办任务'],
    ['restart', 'Restart numbering', '重启编号'],
    ['continue', 'Continue numbering', '延续编号'],
    ['prefix-suffix', 'Step n: markers', '编号前后缀'],
    ['nested', 'Nested preparation', '嵌套准备步骤'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['nest', 'Nest two preparation steps', '嵌套两个准备步骤'],
    ['format', 'Format marker prefix and suffix', '设置标记前后缀'],
    ['marker', 'Change native marker', '更改原生标记'],
    ['demote', 'Indent', '缩进'],
    ['promote', 'Outdent', '减少缩进'],
    ['restart', 'Restart numbering', '重启编号'],
    ['continue', 'Continue numbering', '延续编号'],
    ['task', 'Complete or reopen a task', '完成或重开任务'],
    ['select', 'Select a list scope', '选择列表范围'],
    ['edit', 'Edit item wording', '编辑列表文字'],
    ['undo', 'Native Undo', '原生撤销'],
    ['redo', 'Native Redo', '原生重做'],
    ['inspect', 'Read Facade descriptions in console', '控制台读取 Facade 描述'],
    ['roundtrip', 'Recreate a saved snapshot', '重建已保存快照'],
    ['empty', 'Create an empty document', '创建空文档'],
    ['reset', 'Restore captured content', '恢复已捕获内容'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['baseline', 'Opening brief', '开幕简报'],
    ['nested', 'Nested', '嵌套'],
    ['renumbered', 'Renumbered', '重新编号'],
    ['checked', 'Completed', '已完成'],
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
