import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'embed' as const,
  category: 'features' as const,
  image: '/assets/showcase/embed-mount-dispose-remount.png',
  group: { 'en-US': 'Lifecycle', 'zh-CN': '生命周期' },
  title: { 'en-US': 'Mount, Dispose and Remount', 'zh-CN': '挂载、销毁与重新挂载' },
  description: {
    'en-US':
      'Mount a native inventory editor in one reusable dashboard card, release its real owner and restore fresh or saved content.',
    'zh-CN': '在同一可复用仪表盘卡片中挂载原生库存编辑器，释放真实实例，并恢复初始或已保存内容。',
  },
  tags: { 'en-US': ['Embed', 'Lifecycle', 'Snapshots'], 'zh-CN': ['嵌入', '生命周期', '快照'] },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core', '@univerjs/sheets', '@univerjs/engine-formula'],
  apis: [
    { name: 'FUniver.createWorkbook()' },
    { name: 'FUniver.disposeUnit()' },
    { name: 'FUniver.getWorkbook()' },
    { name: 'FUniver.getCurrentLifecycleStage()' },
    { name: 'FUniver.addEvent()' },
    { name: 'FWorkbook.save()' },
    {
      name: 'FWorkbook.getSheetBySheetId()',
      description: {
        'en-US': 'Resolve stock by its stable ID, independently of the active tab or its display name.',
        'zh-CN': '按稳定 ID 定位库存表，不受当前标签页或显示名称影响。',
      },
    },
    { name: 'FRange.setValue()' },
    { name: 'FRange.activate()' },
    { name: 'FRange.getRawValues()' },
    { name: 'FFormula.onCalculationResultApplied()' },
    {
      name: 'FFormula.stopCalculation()',
      description: {
        'en-US': 'Requested during cleanup after a calculation wait fails; the error remains visible.',
        'zh-CN': '计算等待失败后在清理阶段请求停止计算，原始错误仍会显示。',
      },
    },
    {
      name: 'Univer.dispose()',
      description: {
        'en-US': 'Core SDK owner cleanup, not a Facade business command.',
        'zh-CN': 'SDK 核心实例清理方法，不是 Facade 业务命令。',
      },
    },
  ],
  guide: {
    overview: {
      'en-US':
        'Kestrel Trailworks demonstrates actual resource ownership with 18 original inventory records. The card survives; each editor owner does not.',
      'zh-CN': 'Kestrel Trailworks 用 18 条原创库存记录演示真实资源归属：卡片保留，编辑器实例逐次销毁。',
    },
    tryIt: {
      'en-US': [
        'Edit a quantity directly in the native grid, then try native Undo/Redo.',
        'Add or rename native worksheets. The README stable-SKU recipes target the inventory by its stable worksheet ID.',
        'Save a checkpoint, edit natively, then Remount current content. Edits remain but the previous canvas is gone.',
        'Dispose editor: the card stays and no workbook or canvas remains. Mount loads a fresh fixture; Restore checkpoint loads your saved snapshot.',
        'Download the real current JSON. Run the README empty, boundary and missing-unit examples separately.',
      ],
      'zh-CN': [
        '直接在原生网格编辑数量，并尝试原生撤销与重做。',
        '通过原生界面新建或重命名工作表；README 中的稳定 SKU 示例按工作表 ID 定位库存。',
        '保存检查点，原生编辑后重新挂载当前内容；编辑保留，旧画布销毁。',
        '销毁编辑器后卡片仍在，但工作簿和画布不在。挂载读取初始案例，恢复检查点读取保存快照。',
        '下载当前真实 JSON；在 README 中分别运行空数据、边界和缺失单元示例。',
      ],
    },
    expected: {
      'en-US':
        'The same mount element is reused, each disposed unit is absent from getWorkbook(). Full content survives explicit remount/checkpoint restoration. No CSS hiding substitutes for SDK disposal. Host integration is not the nested Pro Embed plugin.',
      'zh-CN':
        '复用同一挂载元素，每次销毁后 getWorkbook() 都查不到旧单元。显式重挂载或恢复检查点保留完整内容，不用 CSS 隐藏冒充 SDK 销毁。宿主集成不等同于 Pro Embed 插件的内部嵌套。',
    },
  },
  variants: [
    {
      id: 'fresh',
      label: { 'en-US': 'Fresh mount', 'zh-CN': '初始挂载' },
      description: {
        'en-US': 'A new SDK owner and workbook use the original default inventory in the same card.',
        'zh-CN': '新 SDK 实例和工作簿在同一卡片中使用原始默认库存。',
      },
    },
    {
      id: 'remount',
      label: { 'en-US': 'Preserve current content', 'zh-CN': '保留当前内容' },
      description: {
        'en-US': 'Full save/destroy/create retains native edits while clearing old history and selection.',
        'zh-CN': '完整保存、销毁和重建保留原生编辑，清除旧历史和选区。',
      },
    },
    {
      id: 'checkpoint',
      label: { 'en-US': 'Explicit checkpoint restoration', 'zh-CN': '显式检查点恢复' },
      description: {
        'en-US': 'A saved full snapshot can restore the editor after disposal; it is not automatic persistence.',
        'zh-CN': '已保存完整快照可在销毁后恢复编辑器，不是自动持久化。',
      },
    },
    {
      id: 'repeat',
      label: { 'en-US': 'Repeated ownership cycles', 'zh-CN': '重复实例周期' },
      description: {
        'en-US': 'Each cycle removes old canvases and subscriptions; mount/dispose no-ops are disabled.',
        'zh-CN': '每轮移除旧画布和订阅，重复挂载或销毁的无效操作禁用。',
      },
    },
    {
      id: 'recovery',
      label: { 'en-US': 'Missing-unit recovery', 'zh-CN': '缺失单元恢复' },
      description: {
        'en-US': 'The README example exposes an actual false disposal result without damaging the live workbook.',
        'zh-CN': 'README 示例展示真实的销毁失败返回值，不损坏仍在运行的工作簿。',
      },
    },
  ],
  actions: [
    {
      id: 'mount',
      label: { 'en-US': 'Mount inventory', 'zh-CN': '挂载库存' },
      description: {
        'en-US': 'createUniver() and createWorkbook() create a fresh owner; disabled while mounted.',
        'zh-CN': 'createUniver() 和 createWorkbook() 创建新实例；已有实例时禁用。',
      },
    },
    {
      id: 'dispose',
      label: { 'en-US': 'Dispose editor', 'zh-CN': '销毁编辑器' },
      description: {
        'en-US':
          'Wait for SDK settlement, unload via disposeUnit(), then release listeners and the core owner. The host element remains.',
        'zh-CN': '等待 SDK 就绪，通过 disposeUnit() 卸载，再释放监听器和核心实例；宿主元素保留。',
      },
    },
    {
      id: 'remount',
      label: { 'en-US': 'Remount current content', 'zh-CN': '重新挂载当前内容' },
      description: {
        'en-US': 'FWorkbook.save() supplies the next fresh owner, preserving content but not undo history.',
        'zh-CN': 'FWorkbook.save() 为下一新实例提供数据，保留内容但不保留撤销历史。',
      },
    },
    {
      id: 'checkpoint',
      label: { 'en-US': 'Save checkpoint', 'zh-CN': '保存检查点' },
      description: {
        'en-US': 'Store a cloned full FWorkbook.save() snapshot in host memory without changing the workbook.',
        'zh-CN': '克隆完整 FWorkbook.save() 快照到宿主内存，不修改工作簿。',
      },
    },
    {
      id: 'restore',
      label: { 'en-US': 'Restore checkpoint', 'zh-CN': '恢复检查点' },
      description: {
        'en-US':
          'Dispose any active owner and createWorkbook() from the saved snapshot; requires an explicit checkpoint.',
        'zh-CN': '销毁现有实例并从已保存快照 createWorkbook()；需要先保存检查点。',
      },
    },
    {
      id: 'download',
      label: { 'en-US': 'Download current JSON', 'zh-CN': '下载当前 JSON' },
      description: {
        'en-US': 'Browser Blob download of complete FWorkbook.save() output; no backend or binary Office conversion.',
        'zh-CN': '浏览器 Blob 下载完整 FWorkbook.save() 输出，不接后端或进行二进制 Office 转换。',
      },
    },
  ],
  states: [
    {
      id: 'default',
      label: { 'en-US': 'Default · 18 stock records', 'zh-CN': '默认 · 18 条库存' },
      description: {
        'en-US': 'Three depots, varied units and dates, fractional stock and an out-of-stock item.',
        'zh-CN': '三个仓库、不同单位和日期、小数库存及缺货物品。',
      },
    },
    {
      id: 'empty',
      label: { 'en-US': 'Empty · no SKU rows', 'zh-CN': '空 · 无 SKU 行' },
      description: {
        'en-US':
          'A real empty inventory workbook retains its title/header; the stable-SKU recipe rejects missing targets.',
        'zh-CN': '真实空库存工作簿保留标题和表头，稳定 SKU 示例会拒绝缺失目标。',
      },
    },
    {
      id: 'boundary',
      label: { 'en-US': 'Boundary · zero / million / fraction', 'zh-CN': '边界 · 零 / 百万 / 小数' },
      description: {
        'en-US': 'Actual cells contain 0, 1,000,000 and 0.125 and remain natively editable.',
        'zh-CN': '实际单元格包含 0、1,000,000 和 0.125，仍可原生编辑。',
      },
    },
    {
      id: 'error',
      label: { 'en-US': 'Error · missing workbook', 'zh-CN': '错误 · 缺失工作簿' },
      description: {
        'en-US': 'The false disposeUnit result is reported while the valid mounted inventory survives unchanged.',
        'zh-CN': '报告 disposeUnit 返回 false，同时有效已挂载库存保持不变。',
      },
    },
  ],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
  '/reference/Preview.tsx': './preview/main.tsx',
})
export default { metadata, files, Preview }
