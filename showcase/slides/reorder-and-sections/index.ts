import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/slides-reorder-and-sections.png',
  product: 'slides',
  previewHeight: 1040,
  category: 'features',
  group: { 'en-US': 'Deck structure', 'zh-CN': '演示文稿结构' },
  title: { 'en-US': 'Slide Order and Host Section Tags', 'zh-CN': '页面排序与宿主章节标签' },
  description: {
    'en-US':
      'Reorder eight native street-shade briefing pages while preserving content, notes and host section tags. Sections are not claimed as native SDK UI.',
    'zh-CN': '通过原生界面重排八页街道遮荫简报，保留内容、备注与宿主章节标签；不将标签冒充 SDK 原生分节界面。',
  },
  tags: { 'en-US': ['Slides', 'Native ordering', 'Host metadata'], 'zh-CN': ['幻灯片', '原生排序', '宿主元数据'] },
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
    'FPresentation.moveSlide()',
    'FPresentation.getSlides()',
    'FPresentation.setActiveSlide()',
    'FPresentation.save()',
    'FShapeText.setText()',
    'FUniver.undo()',
    'FUniver.redo()',
    'FUniver.toggleDarkMode()',
    'FUniver.disposeUnit()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Cobalt is an original fictional street-shade pilot: twelve sites, eighty-four trees, eight pages and four host narrative tags. Planting plans, paired observations and a resident quote stay distinct. Tags live in page.custom.sectionId, not a native sections API. Twelve literal examples and the full-owner restore recipe are in the exported README.',
      'zh-CN':
        'Cobalt 是原创虚构遮荫试点：十二个地点、八十四棵树、八页与四种宿主叙事标签。种植计划、配对观察和居民引语分别呈现。标签位于 page.custom.sectionId，不是原生分节 API。导出 README 提供十二段完整示例及完整 owner 恢复代码。',
    },
    tryIt: {
      'en-US': [
        'Use the native thumbnail list to visit every page and drag Context before Opening.',
        'After dragging, click the native canvas before using Undo/Redo. Read the known thumbnail keyboard limitation in the README.',
        'Follow the README endpoint, validated position and tagged-group sequences. A group sequence has one history entry per actual page move.',
        'Save the edited deck and restore a new owner using the same factory, then edit again.',
        'Try evidence-first, repeated names, one-page and zero-page startup variants in the source.',
      ],
      'zh-CN': [
        '通过原生缩略图逐页浏览，将背景页拖到开场页之前。',
        '拖拽后先点击原生画布，再使用撤销重做；缩略图键盘操作的已知限制见 README。',
        '运行 README 的端点、合法位置及标签分组示例；每次实际页移动分别进入历史。',
        '保存编辑后的文稿，通过同一工厂重建 owner，恢复后继续编辑。',
        '在源码中尝试证据优先、重名、单页及零页启动变体。',
      ],
    },
    expected: {
      'en-US':
        'Facade order matches native thumbnails while page IDs, content, notes and tags remain unchanged. Host tags do not provide native section headers, folding or atomic group history. Full snapshots restore the same ID with a new owner; themes retain edits. In the tested SDK build, thumbnails lack keyboard focus and thumbnail-only actions do not focus the document for history; click the native canvas first. Delivery performance remains unassessed.',
      'zh-CN':
        'Facade 页序与原生缩略图一致，移动保留页面 ID、内容、备注和标签。宿主标签不提供原生分节标题、折叠或原子分组历史。完整快照以相同 ID 恢复新 owner；主题变化保留编辑。当前测试 SDK 的缩略图缺少键盘焦点，且仅操作缩略图不会为历史操作聚焦文稿；请先点击原生画布。交付性能尚未评估。',
    },
  },
  variants: [
    [
      'roadmap-first',
      'Roadmap first',
      '路线图优先',
      'Eight pages in the original narrative order.',
      '八页按原始叙事排序。',
    ],
    [
      'review-first',
      'Evidence first',
      '证据优先',
      'The same pages with Review before Roadmap.',
      '内容相同，回顾位于路线图之前。',
    ],
    [
      'repeated-names',
      'Repeated names',
      '重名页面',
      'Identical navigation names with distinct stable IDs.',
      '导航名称相同，稳定页面 ID 不同。',
    ],
    [
      'single',
      'One-page decision',
      '单页决策',
      'One page; guarded endpoint moves are no-ops.',
      '仅一页，经保护的端点移动不产生修改。',
    ],
    [
      'empty',
      'Zero pages',
      '零页面',
      'A genuine zero-page owner with no host sections.',
      '真实零页 owner，不含宿主章节。',
    ],
  ].map(([id, en, zh, ed, zd]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': ed, 'zh-CN': zd },
  })),
  actions: [
    [
      'navigate',
      'Native navigation',
      '原生导航',
      'Select real pages through the thumbnail list.',
      '通过缩略图选择真实页面。',
    ],
    [
      'reorder',
      'Native drag ordering',
      '原生拖拽排序',
      'Reorder thumbnails without changing page content.',
      '拖动缩略图排序，不改页面内容。',
    ],
    [
      'position',
      'Validated page position',
      '合法页面位置',
      'Use the README Facade examples for earlier, later and endpoints.',
      '通过 README Facade 示例前移、后移或移至端点。',
    ],
    [
      'section',
      'Host-tag sequence',
      '宿主标签序列',
      'Gather tagged pages through individual native commands, not a section API.',
      '用独立原生命令聚拢标签成员，不冒充章节 API。',
    ],
    [
      'history',
      'Native history',
      '原生历史',
      'Undo and redo each actual page command.',
      '逐次撤销和重做真实页面命令。',
    ],
    [
      'restore',
      'Complete owner restore',
      '完整 owner 恢复',
      'Use the README recipe to retain the complete edited snapshot.',
      '使用 README 恢复代码保留完整编辑快照。',
    ],
  ].map(([id, en, zh, ed, zd]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': ed, 'zh-CN': zd },
  })),
  states: [
    ['default', 'Original narrative', '原始叙事'],
    ['edited', 'Reordered or split host groups', '重排或分散的宿主分组'],
    ['empty', 'Zero pages', '零页面'],
    ['error', 'Invalid position or missing group', '非法位置或缺失分组'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
