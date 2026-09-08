import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Relational Tables host / Tab', 'zh-CN': 'Relational Tables 宿主 / 标签' },
  title: {
    'en-US': 'Docs in Relational Tables / Editorial Playbook',
    'zh-CN': 'Docs 嵌入 Relational Tables / 编辑工作手册',
  },
  description: {
    'en-US':
      'Keep a modern editorial playbook beside eight assignments and three linked issues in a native Relational Table-list tab.',
    'zh-CN': '在八篇稿件、三个关联刊期旁，以原生 Relational Table 表列表标签打开现代文档编辑手册。',
  },
  tags: {
    'en-US': ['Embed', 'Relational Tables', 'Docs', 'Tab', 'Editorial'],
    'zh-CN': ['嵌入', 'Relational Tables', '现代文档', '标签', '编辑'],
  },
  packages: [
    '@univerjs-pro/bases',
    '@univerjs-pro/bases-ui',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createBase()',
    'EmbedCreationService.prepareCreateEmbed()',
    'EmbedHostRestoreService.materializeDescriptor()',
    'EmbedHostRestoreService.restoreEmbed()',
    'FParagraph.setText()',
    'FBaseRecord.setValue()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Fern plans eight fictional neighborhood stories across three issues. The Relational Table tracks writers, formats and next editorial checks. A native modern Docs tab holds the shared audience, evidence, voice and handoff playbook, without a fixture selector or duplicate toolbar.',
      'zh-CN':
        'Fern 为三个刊期规划八篇虚构社区稿件。Relational Table 跟踪作者、体裁和下一项编辑检查；原生现代文档标签保存共享的读者定位、证据、表达与交接手册，不添加通用测试选择器或重复工具栏。',
    },
    tryIt: {
      'en-US': [
        'Open Editorial playbook from the native Relational Table sidebar and read its six sections.',
        'Run the document README example, then use native Undo/Redo and type in a paragraph.',
        'Scroll to Handoff, return to Assignments and run the Relational Table README example; the document must stay unchanged.',
        'Rename Everyday Water in Editions, inspect its three linked assignments, and revisit the document after changing theme.',
      ],
      'zh-CN': [
        '从 Relational Table 原生侧栏打开 Editorial playbook，阅读六个章节。',
        '运行 README 文档示例，再使用原生撤销重做并在段落内输入。',
        '滚动到 Handoff，返回 Assignments 运行 Relational Table README 示例；文档应保持不变。',
        '在 Editions 重命名 Everyday Water，检查三篇关联稿件；切换主题后回到文档。',
      ],
    },
    expected: {
      'en-US':
        'A real modern Docs tab in Relational Table, with Grid and official white UI. Selected native editing/history, linked labels, scrolling, theme and disposal checks pass. Relational Table records and prose remain independent; editing a playbook is not publication, consent or approval. No backend or field synchronization. Reload loses edits. Full acceptance remains partial; see README.',
      'zh-CN':
        'Relational Table 中真正的现代 Docs 标签，使用 Grid 菜单和官方白色界面。选定的原生编辑与历史、关联标签、滚动、主题和销毁检查已通过。Relational Table 记录与正文保持独立；编辑手册不代表发布、授权或审批。没有后端和字段自动同步；刷新丢失修改。完整验收仍为部分覆盖，详见 README。',
    },
  },
  variants: [
    ['queue', 'Eight assignments / Four formats', '八篇稿件 / 四种体裁'],
    ['playbook', 'Audience, evidence, voice and handoff', '读者、证据、表达与交接'],
    ['issues', 'Three issues / Stable linked labels', '三个刊期 / 稳定的关联标签'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['open', 'Open the native modern document tab', '打开原生现代文档标签'],
    ['edit', 'Edit prose with native history', '编辑正文并使用原生历史'],
    ['return', 'Update editorial checks independently', '独立更新编辑检查'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['host', 'Assignments and editions', '稿件与刊期'],
    ['child', 'Active editorial playbook', '激活的编辑工作手册'],
    ['error', 'Source failure / Reload to retry', '资源失败 / 刷新重试'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
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
