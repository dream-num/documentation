import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  image: '/assets/showcase/sheets-find-replace.png',
  group: { 'en-US': 'Editing and navigation', 'zh-CN': '编辑与导航' },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core', '@univerjs/preset-sheets-find-replace'],
  apis: [
    { name: 'FUniver.getCurrentLifecycleStage() / Event.LifeCycleChanged' },
    { name: 'FUniver.createTextFinderAsync()' },
    { name: 'FTextFinder.findAll() / findNext() / findPrevious() / getCurrentMatch()' },
    { name: 'FTextFinder.matchCaseAsync() / matchEntireCellAsync() / matchFormulaTextAsync()' },
    { name: 'FTextFinder.replaceWithAsync() / replaceAllWithAsync() / ensureCompleteAsync()' },
    { name: 'FRange.activate() / getRawValues() / getFormulas()' },
    { name: 'FWorkbook.setActiveSheet(); Univer.dispose() / FUniver.createWorkbook()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Two small seed-library tables distinguish mixed case, repeated text, Unicode, zero and formula results. Use the native Find panel or the literal SDK text-finder examples; no host search engine or duplicate toolbar.',
      'zh-CN':
        '两张小型种子库表区分大小写、重复文本、Unicode、零值和公式结果。使用原生查找面板或 SDK 文本查找器字面示例，没有宿主搜索引擎或重复工具栏。',
    },
    tryIt: {
      'en-US': [
        'Focus the sheet and press Ctrl/Cmd+F to open native Find. Search draft, then compare case-sensitive and entire-cell options.',
        'Compare native match highlighting with the editing selection. The README uses FRange.activate() explicitly; E2 has two occurrences in one matched cell.',
        'Compare formula text UPPER with the calculated value DRAFT at B9; use the README formula replacement recipe.',
        'Replace a label and inspect the real cell and formula bar. Use native Undo/Redo, not host history buttons.',
        'Switch seasons through native sheet tabs. Compare 0, 海岸, missing text and empty replacement.',
      ],
      'zh-CN': [
        '聚焦表格后按 Ctrl/Cmd+F 打开原生查找，搜索 draft 并比较大小写和整格选项。',
        '比较原生命中高亮与编辑选区。README 显式使用 FRange.activate()；E2 中两次出现仍是一个命中单元格。',
        '比较 B9 中的公式文本 UPPER 与计算结果 DRAFT，运行 README 公式替换示例。',
        '替换标签后检查真实单元格及公式栏，使用原生撤销重做而非宿主历史按钮。',
        '通过原生工作表标签切换季节，比较 0、海岸、无匹配和空替换。',
      ],
    },
    expected: {
      'en-US':
        'Only native Grid, Find and worksheet tabs remain. Both official CSS files and complete EN/ZH packs ship with the shared factory; theme changes preserve the owner and edits. Counts and replacement return values come directly from the SDK. Dispose finders after their asynchronous work; no reset IDs, raw inspector or fixture panel.',
      'zh-CN':
        '仅保留原生 Grid、查找及工作表标签。共享工厂导出两份官方 CSS 和完整中英文包，主题切换保留实例与编辑。计数及替换返回值直接来自 SDK。异步操作结束后释放查找器，不重写 ID，也无原始检查器或样本面板。',
    },
  },
  variants: [
    { id: 'partial', label: { 'en-US': 'Partial text and repeated occurrences', 'zh-CN': '部分文本与重复出现' } },
    { id: 'case', label: { 'en-US': 'Case-sensitive matching', 'zh-CN': '区分大小写' } },
    { id: 'whole', label: { 'en-US': 'Entire-cell matching', 'zh-CN': '整单元格匹配' } },
    { id: 'formula', label: { 'en-US': 'Formula text versus calculated values', 'zh-CN': '公式文本与计算值' } },
    { id: 'sheets', label: { 'en-US': 'Two independent worksheet scopes', 'zh-CN': '两个独立工作表范围' } },
    {
      id: 'boundaries',
      label: { 'en-US': 'Zero, Unicode, empty and no-match inputs', 'zh-CN': '零值、Unicode、空值与无匹配' },
    },
  ],
  actions: [
    {
      id: 'search',
      label: { 'en-US': 'Find / refresh', 'zh-CN': '查找或刷新' },
      description: {
        'en-US':
          'Create a finder, await selected match options, read all/current matches and activate the native range.',
        'zh-CN': '创建查找器，等待匹配配置完成，读取全部及当前匹配并激活原生范围。',
      },
    },
    {
      id: 'previous',
      label: { 'en-US': 'Previous match', 'zh-CN': '上一匹配' },
      description: {
        'en-US': 'findPrevious() and FRange.activate() move the native selection.',
        'zh-CN': 'findPrevious() 与 FRange.activate() 移动原生选区。',
      },
    },
    {
      id: 'next',
      label: { 'en-US': 'Next match', 'zh-CN': '下一匹配' },
      description: {
        'en-US': 'findNext() and FRange.activate() move the native selection.',
        'zh-CN': 'findNext() 与 FRange.activate() 移动原生选区。',
      },
    },
    {
      id: 'replace',
      label: { 'en-US': 'Replace current', 'zh-CN': '替换当前匹配' },
      description: {
        'en-US': 'Await replaceWithAsync(), inspect actual before/after values, then refresh.',
        'zh-CN': '等待 replaceWithAsync()，检查真实前后值，再刷新结果。',
      },
    },
    {
      id: 'all',
      label: { 'en-US': 'Replace all in active sheet', 'zh-CN': '替换当前表全部匹配' },
      description: {
        'en-US': 'Await replaceAllWithAsync() and show the SDK count without modifying another sheet.',
        'zh-CN': '等待 replaceAllWithAsync() 并展示 SDK 计数，不修改另一工作表。',
      },
    },
  ],
  states: [
    { id: 'matches', label: { 'en-US': 'Matched cells and native selection', 'zh-CN': '匹配单元格及原生选区' } },
    { id: 'empty', label: { 'en-US': 'Empty query or no matches', 'zh-CN': '空查询或无匹配' } },
    { id: 'error', label: { 'en-US': 'Reported SDK failure', 'zh-CN': '已报告 SDK 错误' } },
  ],
  title: {
    'en-US': 'Find and Replace',
    'zh-CN': '查找和替换',
    'zh-TW': '查找和替换',
    'ja-JP': '検索と置換',
  },
  description: {
    'en-US':
      'The Find and Replace feature allows users to quickly locate and modify data within their spreadsheets, improving efficiency and accuracy.',
    'zh-CN': '查找和替换功能允许用户快速定位和修改电子表格中的数据，从而提高效率和准确性。',
    'zh-TW': '查找和替換功能允許用戶快速定位和修改電子表格中的數據，從而提高效率和準確性。',
    'ja-JP':
      '検索と置換機能により、ユーザーはスプレッドシート内のデータを迅速に特定して変更でき、効率と正確性が向上します。',
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
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})

export default {
  metadata,
  files,
  Preview,
}
