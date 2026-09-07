import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'slides',
  previewHeight: 1040,
  category: 'features',
  group: { 'en-US': 'Deck structure', 'zh-CN': '演示文稿结构' },
  title: { 'en-US': 'Slide Lifecycle and Independent Copies', 'zh-CN': '页面生命周期与独立副本' },
  description: {
    'en-US':
      'Branch a museum-night room plan, edit an independent copy and use native page order, deletion and history.',
    'zh-CN': '为博物馆夜场方案创建独立副本，比较原页与副本，核对原生页序、删除与历史。',
  },
  tags: { 'en-US': ['Slides', 'Single feature', 'Page lifecycle'], 'zh-CN': ['幻灯片', '单功能', '页面生命周期'] },
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
    '@univerjs-pro/exchange-client',
    '@univerjs-pro/slides-exchange-client',
    '@univerjs-pro/slides-print',
  ],
  apis: [
    'FPresentation.insertSlide()',
    'FPresentation.deleteSlide()',
    'FPresentation.getSlides()',
    'FSlide.getData()',
    'FShapeText.setRichText()',
    'FUniver.undo()',
    'FUniver.redo()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Northlight is an original museum-night program: eight pages, three activity spaces and nine hosts. Compare room plans through the actual Slides thumbnail menu. Fixture selectors, duplicate host buttons and diagnostic readbacks have been removed; the SDK fills the available preview.',
      'zh-CN':
        'Northlight 是原创博物馆夜场方案：八页内容、三个活动空间和九名接待员。通过真正的 Slides 缩略图菜单比较房间方案。已移除示例选择器、重复宿主按钮和诊断面板，预览空间交给 SDK。',
    },
    tryIt: {
      'en-US': [
        'Select Atrium in the native thumbnails. Right-click it, choose Copy, then right-click again and choose Paste. The new page is an independent copy after Atrium.',
        'Edit the copied title in the native editor, or use the Facade example in README. Return to the original Atrium and compare its title, room capacity and notes.',
        'Right-click the copy and choose Delete. Use native ribbon Undo/Redo to restore or remove the page.',
        'Right-click Atrium, choose Add slide below, then Blank. The native layout picker creates the page at that position.',
        'Use the native File and Print controls. Conversion and physical printing require separate verification. Browser reload restores the original deck; theme changes keep edits.',
        'For repeated names, one-page and empty starting points, change the createData argument in source; these are source variants, not hidden fixture buttons.',
      ],
      'zh-CN': [
        '在原生缩略图选择 Atrium，右键 Copy，再次右键 Paste。新页是位于 Atrium 后面的独立副本。',
        '在原生编辑器修改副本标题，或使用 README 的 Facade 示例；返回原 Atrium，对比标题、房间容量和备注。',
        '右键副本选择 Delete，再用原生菜单 Undo/Redo 恢复或移除页面。',
        '右键 Atrium，选择 Add slide below，再选择 Blank，由原生布局选择器在该位置新建页面。',
        '使用原生 File 和 Print 控件；文件转换与实际打印仍需单独验证。刷新恢复原始文稿，切换主题保留编辑。',
        '重复名称、单页和空文稿通过修改源码中的 createData 参数体验，不提供隐藏的 fixture 按钮。',
      ],
    },
    expected: {
      'en-US':
        'Preview and standalone share the factory, authored data and official CSS. Native Copy/Paste owns duplication; no custom cloning toolbar remains. Page creation/deletion and native Undo/Redo use SDK commands. The old beta.2 rich-text Undo and insertion-selection failures are not certified fixed by removing controls: strict history reproduction remains separate. Native thumbnail accessibility is still incomplete; removed host navigation is not counted as a workaround. No backend or collaborative revision history is provided.',
      'zh-CN':
        '预览与独立项目共用工厂、内容数据和官方 CSS。复制由原生 Copy/Paste 负责，不再保留自定义复制工具栏；创建、删除和撤销重做使用 SDK 命令。移除控件不代表旧 beta.2 富文本撤销和插入后选择恢复问题已修复，严格历史复现仍独立保留。原生缩略图无障碍仍不完整，移除的宿主导航不计为替代方案。不提供后端或协同版本历史。',
    },
  },
  variants: [
    [
      'night-program',
      'Night program · eight pages',
      '夜场方案 · 八页',
      'Original route, room capacities, staffing, access and closing.',
      '原始路线、房间容量、人员、无障碍和闭馆安排。',
    ],
    [
      'repeated-labels',
      'Repeated names · distinct IDs',
      '重复名称 · 不同 ID',
      'Atrium and Studio share the name Room plan but keep different IDs, content and notes.',
      '中庭与工作室同名为 Room plan，但保留不同的 ID、内容与备注。',
    ],
    [
      'single',
      'One-page handoff',
      '单页交接',
      'Exercise page creation and deletion boundaries with only the opening page.',
      '仅保留封面，测试页面创建与删除边界。',
    ],
    [
      'empty',
      'Empty starting point',
      '空文稿起点',
      'No active page; insert a lantern page to start a real presentation.',
      '没有当前页；插入灯笼活动页，开始真正的演示文稿。',
    ],
  ].map(([id, en, zh, enDescription, zhDescription]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': enDescription, 'zh-CN': zhDescription },
  })),
  actions: [
    [
      'copy',
      'Native Copy / Paste',
      '原生复制／粘贴',
      'Branch a room plan using the thumbnail context menu.',
      '通过缩略图右键菜单创建房间方案副本。',
    ],
    [
      'insert',
      'Native Add slide below',
      '原生在下方添加页面',
      'Choose a layout and create a page at the target position.',
      '选择布局，在指定位置创建页面。',
    ],
    [
      'delete',
      'Native Delete / Undo / Redo',
      '原生删除／撤销／重做',
      'Remove and restore pages with SDK-owned history.',
      '通过 SDK 历史移除和恢复页面。',
    ],
    [
      'file',
      'Native File / Print',
      '原生文件／打印',
      'Open registered Exchange and Print controls; full output acceptance remains open.',
      '打开已注册的 Exchange 和 Print 控件；完整输出验收仍待完成。',
    ],
  ].map(([id, en, zh, enDescription, zhDescription]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': enDescription, 'zh-CN': zhDescription },
  })),
  states: [
    ['default', 'Original program', '原始方案'],
    ['edited', 'Independent branch', '独立分支'],
    ['empty', 'Zero pages', '零页面'],
    ['error', 'Missing page or history boundary', '页面不存在或历史边界'],
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
