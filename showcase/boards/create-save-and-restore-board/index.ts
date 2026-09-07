import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/boards-create-save-and-restore-board.png',
  product: 'boards',
  category: 'features',
  group: { 'en-US': 'Canvas lifecycle', 'zh-CN': '画布生命周期' },
  title: { 'en-US': 'Create, Save, and Restore a Board', 'zh-CN': '创建、保存与恢复白板' },
  description: {
    'en-US':
      'Edit a field-station plan, checkpoint the full SDK snapshot, and recreate the board. Compare active pages, stacking order, text and transforms.',
    'zh-CN': '编辑野外站计划，保存完整 SDK 快照并重建白板，比较活动页、层叠顺序、文本和变换。',
  },
  tags: { 'en-US': ['Boards', 'Lifecycle', 'Snapshots'], 'zh-CN': ['白板', '生命周期', '快照'] },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui', '@univerjs-pro/license'],
  apis: [
    ['FUniver.createBoard()', 'Create a real board from an in-memory snapshot.', '从内存快照创建真实白板。'],
    [
      'FBoard.save()',
      'Serialize all pages and registered resources; no backend write.',
      '序列化全部页面和已注册资源，不写入后端。',
    ],
    [
      'FBoard.setElementTransform()',
      'Move a sticky through the native command and history path.',
      '通过原生命令和历史记录移动便签。',
    ],
    [
      'FBoard.setTextContent()',
      'Change a standalone heading; this API does not target sticky shape text.',
      '修改独立标题；此 API 不用于便签形状内的文本。',
    ],
    [
      'FBoard.focusElement()',
      'Select and pan to the first sticky for native keyboard or pointer edits.',
      '选中首张便签并平移视口，以便原生键盘或鼠标编辑。',
    ],
    [
      'FBoard.undo() / redo()',
      'Use SDK history; snapshot recreation starts a new history.',
      '使用 SDK 历史记录；快照重建会开启新的历史记录。',
    ],
  ].map(([name, en, zh]) => ({ name, description: { 'en-US': en, 'zh-CN': zh } })),
  guide: {
    overview: {
      'en-US':
        'Tern field station has an opening plan and an evening handover, with distinct sticky notes, standalone text, a background shape and an embedded route placeholder image. The 1920×1080 page size and authored review date are fixed; the SDK clock is not overridden. Native Boards editing and styles are retained.',
      'zh-CN':
        'Tern 野外站包含开站计划和晚班交接两页，使用不同内容的便签、独立文本、背景形状和内嵌路线占位图。页面为 1920×1080，案例日期固定，不覆盖 SDK 时钟。保留原生白板编辑和样式。',
    },
    tryIt: {
      'en-US': [
        'Drag crew stickies and double-click to edit their actual native text; use the Board toolbar and shortcuts.',
        'Run the nine executable Facade integration variants in the README; there is no duplicate host control panel.',
        'Capture an edited checkpoint, make another edit, then really dispose and reconstruct the earlier full snapshot.',
        'Reload current content and compare every page, layer, text, image and transform. Download the complete JSON locally.',
        'Construct Handover, Empty and Missing-target variants separately; theme and locale changes keep the current owner.',
      ],
      'zh-CN': [
        '拖拽人员便签，双击编辑原生文本；使用白板工具栏和快捷键。',
        'README 提供九个可执行 Facade 集成变体，不添加重复宿主控制面板。',
        '保存已编辑检查点，再编辑，然后真实销毁实例并恢复之前的完整快照。',
        '重载当前内容，比较所有页面、图层、文本、图片和变换；可本地下载完整 JSON。',
        '分别构建交接、空白和缺失目标变体；主题与语言切换保持当前实例。',
      ],
    },
    expected: {
      'en-US':
        'All serialized fields remain visible for strict comparisons, including inactive pages and native resources. Checkpoints are application-owned memory, not collaboration history or server persistence. Native pointer/text editing remains primary. Reconstruction starts fresh local history; theme changes do not reconstruct. Viewport fitting uses the public SDK service. Seven EN/ZH packs and official stylesheets use the same factory. Pointer movement and exact reconstruction pass; sticky replacement/editor errors and full heading Undo remain strict failures documented in the README.',
      'zh-CN':
        '保留所有序列化字段供严格比较，包括非活动页和原生资源。检查点属于应用内存，不是协作历史或服务端存储。以原生鼠标和文本编辑为主。重建开启新本地历史，主题切换不重建。视口适配使用公开 SDK 服务。相同工厂导出七组中英文包和官方 CSS。鼠标移动与完整重建通过；便签替换、编辑器报错及标题完整撤销仍严格失败，详情见 README。',
    },
  },
  variants: [
    [
      'movement',
      'Relative movement',
      '相对移动',
      'Compare +120/+60 and −120/−60 offsets, then Undo.',
      '比较 +120/+60 与 −120/−60 位移，再撤销。',
    ],
    [
      'text',
      'Standalone heading',
      '独立标题',
      'Apply entered heading text without changing other elements.',
      '应用输入的标题，不改变其他元素。',
    ],
    [
      'checkpoint',
      'Checkpoint versus reload',
      '检查点与重新加载',
      'Restore an earlier version or recreate the current version; both reset native history.',
      '恢复之前版本或重建当前版本，两者均重置原生历史。',
    ],
    [
      'pages',
      'Multi-page boundary',
      '多页边界',
      'Reversed page/layer order, active handover page, rotation and negative coordinates survive serialization.',
      '倒序页面/图层、交接活动页、旋转及负坐标可序列化保留。',
    ],
  ].map(([id, en, zh, den, dzh]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': den, 'zh-CN': dzh },
  })),
  actions: [
    {
      id: 'native-edit',
      label: { 'en-US': 'Edit with native Board tools', 'zh-CN': '使用原生白板工具编辑' },
      description: {
        'en-US': 'Drag, edit text, select and use local Undo/Redo without duplicate host buttons.',
        'zh-CN': '拖拽、编辑文本、选择和本地撤销/重做，不添加重复宿主按钮。',
      },
    },
    {
      id: 'source-lifecycle',
      label: { 'en-US': 'Run snapshot integration examples', 'zh-CN': '运行快照集成示例' },
      description: {
        'en-US': 'The README provides complete checkpoint, reload, download and separate data-construction code.',
        'zh-CN': 'README 提供完整检查点、重载、下载与独立数据构建代码。',
      },
    },
  ],
  states: [
    [
      'default',
      'Opening plan',
      '开站计划',
      'Two pages with eight active-page objects and distinct content.',
      '两页不同内容，活动页含八个对象。',
    ],
    [
      'empty',
      'Empty page',
      '空白页',
      'One page with no objects; save/download/reload remain meaningful.',
      '一页无对象白板，仍可保存、下载和重新加载。',
    ],
    [
      'boundary',
      'Handover boundary',
      '交接边界',
      'Reversed page order and layers; rotated sticky at negative coordinates.',
      '倒序页面和图层，负坐标处的旋转便签。',
    ],
    [
      'error',
      'Missing target',
      '缺失目标',
      'Original two-page data plus a real SDK rejection; no silent fallback.',
      '原始两页数据加真实 SDK 拒绝结果，不静默回退。',
    ],
  ].map(([id, en, zh, den, dzh]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': den, 'zh-CN': dzh },
  })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
