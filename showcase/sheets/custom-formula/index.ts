import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-custom-formula.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Formula extensions', 'zh-CN': '公式扩展' },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FFormula.registerFunction()' },
    { name: 'FFormula.registerAsyncFunction()' },
    { name: 'FFormula.executeCalculation()' },
    { name: 'FFormula.stopCalculation()' },
    { name: 'FFormula.calculationResultApplied()' },
    { name: 'FUniver.toggleDarkMode()' },
    { name: 'FWorkbook.save()' },
    { name: 'FUniver.disposeUnit() / createWorkbook()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Juniper cycle deliveries demonstrates a strict numeric sum, asynchronous scalar lookup and asynchronous spilling table. All functions are registered through Facade. The deterministic browser-only source is explicitly simulated, not a live backend or remote-worker example.',
      'zh-CN':
        'Juniper 配送案例演示严格数字求和、异步单值查询和异步溢出表格。所有函数通过 Facade 注册。数据源是明确标注的浏览器内模拟，不是在线后端或远程 Worker 示例。',
    },
    tryIt: {
      'en-US': [
        'NORTH loads a route status and a four-row stop table; B13 is 35 and the dependent B14 is 70. B15 intentionally produces a real #VALUE! error.',
        'Edit B4 to EAST in the native grid: the table shrinks to three rows. EMPTY returns only the header; it does not invent deliveries.',
        'MISSING produces #N/A, FAULT maps a simulated source failure to #VALUE!, and TIMEOUT returns #N/A after the 800ms deadline. Source request/cache/pending counts are separate from native cell results.',
        'Recalculate with cache invokes the engine without changing input. Reload source clears the local cache and forces fresh simulated work.',
        'Unregister lookups and recalculate to observe #NAME?. Register & reload snapshot recovers through a new unit because beta.2 retains stale unknown-function nodes. Cell edits are preserved, Undo history is discarded. CUSTOMSUM stays registered.',
        'Edit B9 using F2 and select-all: changing 12 to 15 makes the custom sum 38 and its dependent 76. Theme changes preserve edits and Undo history.',
        'Compare B19:B24: blank input yields 5, zero yields 0, negative/fractional input yields -1.5, numeric text and booleans yield #VALUE!, and numeric overflow yields #NUM!.',
      ],
      'zh-CN': [
        'NORTH 加载路线状态及四行站点表；B13 为 35，依赖值 B14 为 70。B15 故意产生真正的 #VALUE! 错误。',
        '在原生表格中将 B4 改为 EAST：表格缩短到三行。EMPTY 只返回表头，不编造配送记录。',
        'MISSING 返回 #N/A，FAULT 将模拟数据源故障映射为 #VALUE!，TIMEOUT 在 800ms 截止后返回 #N/A。请求、缓存命中和等待数与原生单元格结果分别显示。',
        'Recalculate with cache 不改输入而重新计算；Reload source 清空本地缓存并请求新的模拟结果。',
        '注销查询函数后重算，观察 #NAME?。Register & reload snapshot 重新注册并创建新单元，避开 beta.2 未更新的未知函数节点；保留单元格编辑，丢弃撤销历史。CUSTOMSUM 始终注册。',
        '用 F2 和全选编辑 B9：将 12 改为 15，求和应为 38，依赖结果为 76。主题切换保留编辑和撤销历史。',
        '对照 B19:B24：空区域得到 5，零得到 0，负数与小数得到 -1.5，数字文本与布尔值得到 #VALUE!，数值溢出得到 #NUM!。',
      ],
    },
    expected: {
      'en-US':
        'Scalar/table lookups share in-flight requests and successful results. A normal response takes 400ms; timeout is 800ms. Pending cells may retain their previous SDK value until calculation finishes; source counters are not replacement results. CUSTOMSUM ignores blanks, preserves zero and rejects text/booleans; it is not a SUM-compatibility implementation. Error checks use native ISERROR. Registration handles and source timers are owned by the demo. Theme changes retain the same instance.',
      'zh-CN':
        '单值和表格查询共享进行中的请求及成功缓存。正常响应 400ms，超时 800ms；等待时单元格可能保留先前 SDK 值，数据源计数不冒充结果。CUSTOMSUM 忽略空值、保留零并拒绝文本/布尔值，不宣称完全兼容 SUM。错误通过原生 ISERROR 验证。示例管理注册句柄及数据源定时器。主题切换保持同一实例。',
    },
  },
  variants: [
    { id: 'numeric', label: { 'en-US': 'Strict numeric ranges and dependencies', 'zh-CN': '严格数字区域与依赖' } },
    { id: 'scalar-table', label: { 'en-US': 'Async scalar and spilling table', 'zh-CN': '异步单值与溢出表格' } },
    { id: 'empty', label: { 'en-US': 'Empty route with header only', 'zh-CN': '仅表头的空路线' } },
    { id: 'failure', label: { 'en-US': 'Missing, failed and timed-out lookups', 'zh-CN': '缺失、失败与超时查询' } },
    { id: 'cached', label: { 'en-US': 'Cached recalculation versus reload', 'zh-CN': '缓存重算与重新加载' } },
    { id: 'registration', label: { 'en-US': 'Unregister and recover', 'zh-CN': '注销并恢复注册' } },
  ],
  actions: [
    {
      id: 'cached',
      label: { 'en-US': 'Recalculate with cache', 'zh-CN': '使用缓存重算' },
      description: {
        'en-US': 'FFormula.executeCalculation() reuses successful local source results.',
        'zh-CN': 'FFormula.executeCalculation() 复用已成功的本地结果。',
      },
    },
    {
      id: 'reload',
      label: { 'en-US': 'Reload source', 'zh-CN': '重新加载数据源' },
      description: {
        'en-US':
          'Clear the host cache, then FFormula.executeCalculation(); this is why forced calculation is meaningful.',
        'zh-CN': '清空宿主缓存，再调用 FFormula.executeCalculation()，展示强制重算的作用。',
      },
    },
    {
      id: 'registration',
      label: { 'en-US': 'Toggle lookup registration', 'zh-CN': '切换查询函数注册' },
      description: {
        'en-US':
          'Dispose registration handles; recovery calls registerAsyncFunction(), save(), disposeUnit() and createWorkbook(). Preserves cell edits, discards Undo history.',
        'zh-CN':
          '释放注册句柄；恢复调用 registerAsyncFunction()、save()、disposeUnit() 和 createWorkbook()，保留单元格编辑但丢弃撤销历史。',
      },
    },
  ],
  states: [
    { id: 'loading', label: { 'en-US': 'Local source loading', 'zh-CN': '本地数据源加载中' } },
    { id: 'applied', label: { 'en-US': 'SDK results applied', 'zh-CN': 'SDK 结果已应用' } },
    { id: 'cached', label: { 'en-US': 'Successful source cache hit', 'zh-CN': '命中成功缓存' } },
    { id: 'error', label: { 'en-US': 'Native formula error', 'zh-CN': '原生公式错误' } },
    { id: 'unregistered', label: { 'en-US': 'Lookups unregistered', 'zh-CN': '查询函数未注册' } },
  ],
  title: {
    'en-US': 'Custom Formula',
    'zh-CN': '自定义公式',
    'zh-TW': '自訂公式',
    'ja-JP': 'カスタム数式',
  },
  description: {
    'en-US':
      'An example of using custom formulas in Univer Sheets. This example demonstrates how to create and use custom formulas to extend the functionality of spreadsheets.',
    'zh-CN': '在 Univer Sheets 中使用自定义公式的示例。这个示例展示了如何创建和使用自定义公式来扩展电子表格的功能。',
    'zh-TW': '在 Univer Sheets 中使用自訂公式的範例。此範例展示了如何建立和使用自訂公式來擴展電子表格的功能。',
    'ja-JP':
      'Univer Sheets でカスタム数式を使用する例です。この例では、スプレッドシートの機能を拡張するためにカスタム数式を作成および使用する方法を示します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
}

export const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './code/README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/custom-function.ts': './code/custom-function.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})

export default {
  metadata,
  files,
  Preview,
}
