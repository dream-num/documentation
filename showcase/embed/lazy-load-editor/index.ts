import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

function option(id: string, en: string, zh: string, enDetail: string, zhDetail: string) {
  return { id, label: { 'en-US': en, 'zh-CN': zh }, description: { 'en-US': enDetail, 'zh-CN': zhDetail } }
}
const metadata = {
  image: '/assets/showcase/embed-lazy-load-editor.png',
  product: 'embed' as const,
  category: 'features' as const,
  group: { 'en-US': 'Lifecycle', 'zh-CN': '生命周期' },
  title: { 'en-US': 'Lazy-load an Editor', 'zh-CN': '按需加载编辑器' },
  description: {
    'en-US':
      'Defer the real SDK and its CSS until a route-budget editor is visible, report module-loading failures and release the owner.',
    'zh-CN': '路线预算编辑器进入视野后才加载真实 SDK 和 CSS，报告模块加载失败，并释放实例。',
  },
  tags: { 'en-US': ['Embed', 'Lazy loading', 'Retry'], 'zh-CN': ['嵌入', '按需加载', '重试'] },
  packages: [
    '@univerjs/core',
    '@univerjs/presets',
    '@univerjs/preset-sheets-core',
    '@univerjs/sheets',
    '@univerjs/engine-formula',
  ],
  apis: [
    { name: 'FUniver.createWorkbook()' },
    { name: 'FUniver.disposeUnit()' },
    { name: 'FUniver.getWorkbook()' },
    { name: 'FUniver.addEvent()' },
    { name: 'FWorkbook.getSheetBySheetId()' },
    { name: 'FRange.setValue()' },
    { name: 'FRange.activate()' },
    { name: 'FRange.getDisplayValue()' },
    { name: 'FFormula.onCalculationResultApplied()' },
    { name: 'FWorkbook.save()' },
    {
      name: 'Univer.dispose()',
      description: {
        'en-US': 'Core SDK owner cleanup, not a Facade loading API.',
        'zh-CN': 'SDK 核心实例清理，不是 Facade 加载 API。',
      },
    },
  ],
  guide: {
    overview: {
      'en-US':
        'A lightweight Cedar Community Logistics page precedes a real twelve-route workbook. Dynamic import and visibility are host responsibilities; cells and formula results belong to the SDK.',
      'zh-CN':
        '轻量的 Cedar Community Logistics 页面位于真实的十二条路线工作簿之前。动态导入和可见性由宿主控制，单元格与公式结果由 SDK 负责。',
    },
    tryIt: {
      'en-US': [
        'Read the lightweight planning manifest before scrolling: no editor owner exists.',
        'Scroll inside the card to the editor, or activate Open route editor. Observe the English native Grid toolbar and calculated budget.',
        'Edit weekly runs directly in the native grid, use Undo/Redo, then download the current JSON.',
        'Use the README literal empty/boundary variants. Module import failures disable retry and request a page refresh after saving other page work; initialization failures can still be retried.',
        'Release or cancel a pending load. Explicit activation starts again; saved content can be restored with the README host example.',
      ],
      'zh-CN': [
        '滚动前查看轻量计划清单，此时没有编辑器实例。',
        '在卡片内滚动到编辑区域，或点击 Open route editor，查看英文原生 Grid 工具栏与公式预算。',
        '在原生网格直接修改每周班次、撤销/重做，再下载当前 JSON。',
        '运行 README 中的空和边界示例；模块导入失败会禁用重试并提示保存其他工作后刷新页面；初始化失败仍可重试。',
        '释放实例或取消尚未完成的加载；显式激活可重新开始，通过 README 宿主示例恢复保存内容。',
      ],
    },
    expected: {
      'en-US':
        'The SDK initializes only after activation. Initialization retry uses the real module; failed imports require page refresh; native writes recalculate the actual total. Cancellation prevents late owner creation, and Release removes the owner without claiming to evict browser caches.',
      'zh-CN':
        '激活后才初始化 SDK；初始化失败可重试，模块导入失败需刷新页面；原生写入触发真实总额计算。取消防止过期请求创建实例，释放销毁实例但不宣称清除浏览器缓存。',
    },
  },
  variants: [
    option(
      'visibility',
      'Visibility-triggered loading',
      '进入视野后加载',
      'IntersectionObserver activates the deferred SDK module and its official CSS.',
      'IntersectionObserver 激活延迟 SDK 模块及其官方 CSS。',
    ),
    option(
      'explicit',
      'Explicit keyboard activation',
      '显式键盘激活',
      'Open route editor uses the same import path without requiring a pointer scroll.',
      '立即加载复用相同导入路径，无需鼠标滚动。',
    ),
    option(
      'retry',
      'Real loader failure and retry',
      '真实加载失败与重试',
      'Import failure requires page refresh; initialization failure retains same-module retry.',
      '导入失败需刷新页面；初始化失败保留同模块重试。',
    ),
    option(
      'cancel',
      'Cancel and release',
      '取消与释放',
      'Invalidate pending requests or dispose real owners; cached module code is not unloaded.',
      '使待处理请求过期或销毁真实实例，不卸载缓存模块代码。',
    ),
  ],
  actions: [
    option(
      'load',
      'Load / retry editor',
      '加载 / 重试编辑器',
      'Host dynamic import creates the native workbook with createWorkbook().',
      '宿主动态导入后通过 createWorkbook() 创建原生工作簿。',
    ),
    option(
      'cancel',
      'Cancel pending load',
      '取消待处理加载',
      'Invalidate the request generation so late module resolution cannot mount it.',
      '使请求代次过期，阻止迟到的模块创建实例。',
    ),
    option(
      'release',
      'Release editor',
      '释放编辑器',
      'Dispose listeners and the core owner; keep the host and browser module cache.',
      '销毁监听器与核心实例，保留宿主及浏览器模块缓存。',
    ),
    option(
      'download',
      'Download current JSON',
      '下载当前 JSON',
      'A browser Blob contains complete FWorkbook.save() output, not binary Office conversion.',
      '浏览器 Blob 包含完整 FWorkbook.save() 输出，不是 Office 二进制转换。',
    ),
  ],
  states: [
    option(
      'default',
      'Default · 12 routes',
      '默认 · 12 条路线',
      'Varied distances, rates and weekly runs across three community hubs.',
      '三个社区站点间的不同里程、费率与每周班次。',
    ),
    option(
      'empty',
      'Empty · no routes',
      '空 · 无路线',
      'A real template with a SUM formula returning zero; the README recipe rejects missing targets.',
      '真实空模板的 SUM 返回零，README 示例拒绝缺失目标。',
    ),
    option(
      'boundary',
      'Boundary · 0 / 10000 runs',
      '边界 · 0 / 10000 班次',
      'Actual cells exercise the two allowed integer limits and decimal route costs.',
      '真实单元格展示整数上下限与小数路线费用。',
    ),
    option(
      'error',
      'Error · asset loading failure',
      '错误 · 资源加载失败',
      'Real import errors disable repeated loading and request page refresh; no synthetic failure switch is used.',
      '真实导入错误禁用重复加载并提示刷新页面，无模拟失败开关。',
    ),
  ],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/editor.ts': './code/editor.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
  '/reference/Preview.tsx': './preview/main.tsx',
})
export default { metadata, files, Preview }
