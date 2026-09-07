import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/slides-save-restore-deck.png',
  product: 'slides',
  previewHeight: 1040,
  category: 'features',
  group: { 'en-US': 'Deck structure', 'zh-CN': '演示文稿结构' },
  title: { 'en-US': 'Save and Restore a Deck', 'zh-CN': '保存与恢复演示文稿' },
  description: {
    'en-US':
      'Edit eight coastal field-briefing layouts in the native editor; preserve page order, notes, authored shapes and active-page state through a complete SDK snapshot.',
    'zh-CN': '在原生编辑器中编辑八种海岸观测简报布局，通过完整 SDK 快照保留页序、备注、形状内容和当前页状态。',
  },
  tags: { 'en-US': ['Slides', 'Native editing', 'Snapshots'], 'zh-CN': ['幻灯片', '原生编辑', '快照'] },
  packages: [
    '@univerjs/core',
    '@univerjs/design',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs/drawing',
    '@univerjs/engine-render',
    '@univerjs/ui',
    '@univerjs-pro/engine-shape',
    '@univerjs-pro/shape-editor-ui',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/license',
  ],
  apis: [
    'FUniver.createPresentation()',
    'FPresentation.save()',
    'FPresentation.setActiveSlide()',
    'FPresentation.moveSlide()',
    'FPresentation.deleteSlide()',
    'FPresentation.setName()',
    'FSlide.setSpeakerNotes()',
    'FShapeText.setText()',
    'FUniver.disposeUnit()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Tern is an original fictional coastal briefing: mission, station cards, procedure, observation windows, sample counts, quotation and handoff. Eight varied layouts contain six stations and 126 samples. Bars are slide shapes, not a chart. Use native controls; the ten executable Facade examples and restore recipe are in the exported README.',
      'zh-CN':
        'Tern 是原创虚构海岸简报，包含任务、站点卡片、流程、观测窗口、样本数、引言和交接。八种布局呈现六个站点和 126 个样本；条形由幻灯片形状组成，不是图表。直接使用原生控件；十段可执行 Facade 示例及恢复代码位于导出的 README。',
    },
    tryIt: {
      'en-US': [
        'Navigate all eight pages with the native list. Double-click a title and edit its text; inspect the distinct speaker notes.',
        'Follow README examples 1–5: review Counts, edit its title and notes, reorder two pages and rename the presentation.',
        'Save the complete checkpoint with example 6. Delete the closing page, clear notes and capture the separate audience edition.',
        'Download the original checkpoint as JSON; compare it with the current seven-page audience edition.',
        'Use the exported entry restore recipe, then navigate every restored page and perform a fresh native edit.',
        'Switch the site theme: the existing editor and edited model should remain intact. Test the independent empty variant separately.',
      ],
      'zh-CN': [
        '使用原生列表浏览八页，双击标题编辑文字，并查看各页不同的讲者备注。',
        '依次运行 README 示例 1–5：查看样本数页、修改标题和备注、重排两页并重命名文稿。',
        '使用示例 6 保存完整快照，再删除结尾页、清除备注并另存观众版本。',
        '下载原始检查点 JSON，与当前七页的观众版本比较。',
        '在导出的入口中运行恢复代码，逐页检查恢复后的内容，并继续一次原生编辑。',
        '切换站点主题时应保留同一个编辑器和已编辑模型；单独测试真正的零页变体。',
      ],
    },
    expected: {
      'en-US':
        'Preview and export share the native factory, five official CSS files and complete EN/ZH dependency locales. Theme changes do not reset data. JSON preserves every snapshot field; validate before disposing the previous owner. Restoring a snapshot is not proof that all pages paint correctly. This is not PPTX conversion, backend storage or collaborative history. No fixture, explanation, checksum or duplicate editing panel is rendered.',
      'zh-CN':
        '预览与导出共用原生工厂，包含五份官方 CSS 和完整的中英文依赖语言包。主题变化不重置数据。JSON 保留快照全部字段；先验证，再销毁旧实例。快照恢复成功并不证明每一页都正确绘制。这不是 PPTX 转换、后端存储或协同历史，不渲染 fixture、说明、校验值或重复编辑面板。',
    },
  },
  variants: [
    ['field-brief', 'Field briefing', '观测简报', 'Eight original pages with notes.', '八页原创内容及备注。'],
    [
      'review-order',
      'Review first',
      '评审优先',
      'Counts and comparison precede the narrative; page identities remain stable.',
      '样本数与对比页提前，页面标识保持不变。',
    ],
    [
      'notes-free',
      'Audience edition',
      '观众版本',
      'The same visual pages without presenter notes.',
      '相同的可视页面，不包含讲者备注。',
    ],
    [
      'empty',
      'Zero pages',
      '零页面',
      'A real empty presentation; compare its actual SDK snapshot after reconstruction.',
      '真正的空文稿，重建后比较实际 SDK 快照。',
    ],
  ].map(([id, en, zh, a, b]) => ({ id, label: { 'en-US': en, 'zh-CN': zh }, description: { 'en-US': a, 'zh-CN': b } })),
  actions: [
    [
      'native-edit',
      'Native editing',
      '原生编辑',
      'Use the page list, text editor and notes; no duplicate controls.',
      '使用页面列表、文字编辑器及备注，不增加重复控件。',
    ],
    [
      'snapshot',
      'Capture and download',
      '保存与下载',
      'Run the literal README to capture the full SDK snapshot and download that exact checkpoint.',
      '运行 README 保存完整 SDK 快照并下载同一检查点。',
    ],
    [
      'restore',
      'Restore the owner',
      '恢复实例',
      'Validate the snapshot, recreate through the same factory, then verify native paint and fresh editing.',
      '验证快照，通过同一工厂重建，再检查原生绘制及继续编辑。',
    ],
  ].map(([id, en, zh, a, b]) => ({ id, label: { 'en-US': en, 'zh-CN': zh }, description: { 'en-US': a, 'zh-CN': b } })),
  states: [
    [
      'default',
      'Original briefing',
      '初始简报',
      'Eight authored pages; opening selected.',
      '八页原创内容，默认选择封面。',
    ],
    [
      'edited',
      'Reviewed and audience editions',
      '评审及观众版本',
      'Independent snapshots retain different notes, page order and deleted-page state.',
      '独立快照保留不同的备注、页序及删除状态。',
    ],
    ['empty', 'No pages', '无页面', 'No synthetic starter page is inserted.', '不插入伪造的起始页。'],
    [
      'invalid',
      'Rejected snapshot',
      '拒绝无效快照',
      'Invalid structural references throw before the current owner is disposed.',
      '结构引用无效时先抛出错误，不销毁当前实例。',
    ],
  ].map(([id, en, zh, a, b]) => ({ id, label: { 'en-US': en, 'zh-CN': zh }, description: { 'en-US': a, 'zh-CN': b } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
