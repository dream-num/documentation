import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/docs-modern-callout-blocks.png',
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Blocks', 'zh-CN': '内容块' },
  title: { 'en-US': 'Callout Blocks', 'zh-CN': '提示块' },
  description: {
    'en-US':
      'Compare warning, information, success, and critical callouts; customize icons, borders, and spacing without replacing content.',
    'zh-CN': '比较警告、信息、成功与严重提示；调整图标、边框与留白，同时保留正文。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Callouts'], 'zh-CN': ['现代文档', '单功能', '提示块'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-hyper-link',
    '@univerjs-pro/docs-callout',
    '@univerjs-pro/docs-callout-ui',
    '@univerjs-pro/docs-list',
    '@univerjs-pro/docs-list-ui',
    '@univerjs-pro/docs-code',
    '@univerjs-pro/docs-code-ui',
    '@univerjs-pro/docs-quote',
    '@univerjs-pro/docs-quote-ui',
    '@univerjs-pro/license',
  ],
  apis: [
    'FDocument.insertCallout()',
    'FDocument.getCallout()',
    'FDocument.findCallouts()',
    'FDocumentCallout.describe()',
    'FDocumentCallout.updateConfig()',
    'FDocumentCallout.setBackgroundColor()',
    'FDocumentCallout.setBorder()',
    'FDocumentCallout.setIcon()',
    'FDocumentCallout.setIconVisible()',
    'FDocumentCallout.setTextColor()',
    'FDocumentCallout.resetTextColor()',
    'FDocumentCallout.unwrap()',
    'FDocumentCallout.remove()',
    'FDocumentParagraph.appendText()',
    'FDocument.save()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Tide is an original offline language kit. Four distinct business notes explain release completeness, optional audio, approved glossary and blocked fallback labels. The original content bullets, acceptance tasks, TypeScript configuration, editorial quote and checklist link remain native blocks.',
      'zh-CN':
        'Tide 是原创离线语言包。四条不同业务说明展示发布完整性、可选音频、已审核术语与缺失回退标签导致的阻断。原有内容清单、验收任务、TypeScript 配置、编辑引用及检查链接均保留为原生块。',
    },
    tryIt: {
      'en-US': [
        'Edit the real callout text; click its body to open the native callout menu and its icon for the native icon picker.',
        'Compare the four semantic business notes and use README examples for icons, visibility, backgrounds, four borders and three densities.',
        'Use native Undo/Redo and compare complete saved models, not only visible wording.',
        'Use literal unwrap/rewrap/delete, missing-ID, invalid-color and exact same-ID snapshot examples.',
      ],
      'zh-CN': [
        '直接编辑提示块文字；点击正文打开原生提示块菜单，点击图标打开原生图标选择器。',
        '比较四条语义业务提示，通过 README 示例了解图标、可见性、背景、四种边框与三种密度。',
        '使用原生撤销/重做，并比较完整模型而非仅可见文字。',
        '运行解除包裹/重新包裹/删除、缺失 ID、非法颜色及同 ID 快照恢复代码。',
      ],
    },
    expected: {
      'en-US':
        'Native Grid and callout controls replace the host property and audit UI. All six EN/ZH packs and official CSS are shared by Preview/export; initial language follows page lang and themes retain the owner. Strict tests retain text-color Undo and padding-layout failures until actual SDK behavior passes. No state normalization or hidden repair is used.',
      'zh-CN':
        '原生 Grid 和提示块控件替代宿主属性及审计界面。Preview/导出共用六组完整英中文语言包与官方样式；初始语言跟随页面，换主题保留实例。文字颜色撤销与 padding 布局在 SDK 真正通过前保留严格失败，不做归一化或隐藏修复。',
    },
  },
  variants: [
    ['warning', 'Warning', '警告'],
    ['information', 'Information', '信息'],
    ['success', 'Success', '成功'],
    ['critical', 'Critical', '阻断'],
    ['icon-visible', 'Visible icon', '显示图标'],
    ['icon-hidden', 'Hidden icon', '隐藏图标'],
    ['solid', 'Solid', '实线'],
    ['dashed', 'Dashed', '虚线'],
    ['dotted', 'Dotted', '点线'],
    ['no-border', 'No border', '无边框'],
    ['compact', 'Compact', '紧凑'],
    ['default', 'Default', '默认'],
    ['roomy', 'Roomy', '宽松'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['style', 'Apply semantic style', '应用语义样式'],
    ['icon', 'Change icon', '更改图标'],
    ['visibility', 'Toggle icon', '切换图标'],
    ['background', 'Change background', '更改背景'],
    ['border', 'Change border', '更改边框'],
    ['density', 'Change density', '更改密度'],
    ['wrap', 'Wrap paragraph', '包裹段落'],
    ['unwrap', 'Keep plain text', '保留普通文本'],
    ['remove', 'Delete block and text', '删除块和文字'],
    ['edit', 'Edit review note', '编辑审阅说明'],
    ['select', 'Select callout text', '选择提示块文字'],
    ['text-color', 'Reset text color', '重置文字颜色'],
    ['missing', 'Query missing ID', '查询缺失 ID'],
    ['undo', 'Native Undo', '原生撤销'],
    ['redo', 'Native Redo', '原生重做'],
    ['inspect', 'Read Facade descriptions', '读取 Facade 描述'],
    ['roundtrip', 'Same-ID reconstruction', '同 ID 重建'],
    ['empty', 'Empty document', '空文档'],
    ['reset', 'Restore captured baseline', '恢复捕获的基线'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['baseline', 'Rollout brief', '发布简报'],
    ['restyled', 'Restyled', '已更改样式'],
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
