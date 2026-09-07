import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  product: 'sheets' as const,
  category: 'integrations' as const,
  group: { 'en-US': 'Migration and interoperability', 'zh-CN': '迁移与互操作' },
  packages: [
    '@univerjs/presets',
    '@univerjs/preset-sheets-core',
    '@univerjs/preset-sheets-conditional-formatting',
    '@univerjs/preset-sheets-data-validation',
  ],
  apis: [
    { name: 'luckyToUniver() host converter' },
    { name: 'FUniver.createWorkbook()' },
    { name: 'FUniver.Event.LifeCycleChanged / LifecycleStages.Steady' },
    { name: 'Univer.dispose()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Convert a saved Luckysheet JSON snapshot in the browser, then load the resulting workbook through the installed Univer Preset and Facade APIs. Preview and export execute the same converter and SDK factory.',
      'zh-CN':
        '在浏览器中转换已保存的 Luckysheet JSON 快照，再通过已安装的 Univer Preset 与 Facade API 加载结果。Preview 与导出执行同一转换器和 SDK factory。',
    },
    tryIt: {
      'en-US': [
        'Compare cell values, formulas, styles, borders, merges, row heights and column widths on the Cell and Formula sheets.',
        'Open ConditionalFormat and DataVerification to inspect the two converted plugin resources in native UI.',
        'Review the converter source before extending it: the sample is a field-mapping reference, not a promise of 1:1 migration for every Luckysheet feature.',
      ],
      'zh-CN': [
        '在 Cell 与 Formula 工作表中比较单元格值、公式、样式、边框、合并、行高与列宽。',
        '打开 ConditionalFormat 与 DataVerification，通过原生 UI 检查两个已转换插件资源。',
        '扩展前先查看转换器源码：本例是字段映射参考，不承诺 Luckysheet 所有功能都能 1:1 迁移。',
      ],
    },
    expected: {
      'en-US':
        'The 11-sheet source snapshot becomes a runnable Univer workbook. Unsupported legacy structures remain migration work; the demo does not fabricate Charts, images, pivots, comments or sparklines that its converter does not implement.',
      'zh-CN':
        '包含 11 个工作表的源快照会变成可运行的 Univer 工作簿。未支持的旧结构仍属于迁移工作；本例不会伪造转换器尚未实现的图表、图片、透视表、批注或迷你图。',
    },
  },
  variants: [
    { id: 'cells', label: { 'en-US': 'Cells / formulas / number formats', 'zh-CN': '单元格 / 公式 / 数字格式' } },
    {
      id: 'layout',
      label: { 'en-US': 'Borders / merges / dimensions / visibility', 'zh-CN': '边框 / 合并 / 尺寸 / 可见性' },
    },
    { id: 'conditional', label: { 'en-US': 'Conditional-format resources', 'zh-CN': '条件格式资源' } },
    { id: 'validation', label: { 'en-US': 'Data-validation resources', 'zh-CN': '数据验证资源' } },
    { id: 'unsupported', label: { 'en-US': 'Explicit unsupported-feature boundary', 'zh-CN': '明确的未支持功能边界' } },
  ],
  actions: [
    { id: 'convert', label: { 'en-US': 'Convert JSON fields', 'zh-CN': '转换 JSON 字段' } },
    { id: 'load', label: { 'en-US': 'Load via createWorkbook()', 'zh-CN': '通过 createWorkbook() 加载' } },
    { id: 'inspect', label: { 'en-US': 'Inspect through native UI', 'zh-CN': '通过原生 UI 检查' } },
  ],
  states: [
    { id: 'source', label: { 'en-US': 'Saved Luckysheet JSON', 'zh-CN': '已保存的 Luckysheet JSON' } },
    { id: 'converted', label: { 'en-US': 'Converted Univer snapshot', 'zh-CN': '已转换的 Univer 快照' } },
    { id: 'rendered', label: { 'en-US': 'Native rendered workbook', 'zh-CN': '原生渲染工作簿' } },
  ],
  title: {
    'en-US': 'Migrate From Luckysheet to Univer SDK',
    'zh-CN': '从 Luckysheet 迁移到 Univer SDK',
    'zh-TW': '從 Luckysheet 遷移到 Univer SDK',
    'ja-JP': 'Luckysheet から Univer SDK への移行',
  },
  description: {
    'en-US':
      'Compared with Luckysheet, our newly designed Univer SDK has made great improvements in terms of architecture, data structure and API, so Luckysheet can no longer be migrated 1:1 to Univer SDK. However, we provide a migration example to help you understand how to migrate Luckysheet features to Univer SDK.',
    'zh-CN':
      '与 Luckysheet 相比，我们新设计的 Univer SDK 在架构、数据结构和 API 等方面有了很大的改进，因此 Luckysheet 无法再 1:1 迁移到 Univer SDK。但是，我们提供了一个迁移示例，帮助你了解如何将 Luckysheet 的功能迁移到 Univer SDK。',
    'zh-TW':
      '與 Luckysheet 相比，我們新設計的 Univer SDK 在架構、數據結構和 API 等方面有了很大的改進，因此 Luckysheet 無法再 1:1 遷移到 Univer SDK。但是，我們提供了一個遷移示例，幫助你了解如何將 Luckysheet 的功能遷移到 Univer SDK。',
    'ja-JP':
      'Luckysheet と比較して、新しく設計された Univer SDK は、アーキテクチャ、データ構造、API の面で大きな改善を遂げているため、Luckysheet を Univer SDK に 1:1 で移行することはできません。ただし、Luckysheet の機能を Univer SDK に移行する方法を理解するのに役立つ移行例を提供します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
}

export const files = {
  '/reference/preview.tsx.txt': fs.readFileSync(path.resolve(__dirname, './preview/main.tsx'), 'utf-8'),
  '/src/index.ts': fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8'),
  '/src/create-demo.ts': fs.readFileSync(path.resolve(__dirname, './code/create-demo.ts'), 'utf-8'),
  '/src/styles.css': fs.readFileSync(path.resolve(__dirname, './code/styles.css'), 'utf-8'),
  '/src/data.ts': fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8'),
  '/src/common/const/data-verification.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/const/data-verification.ts'),
    'utf-8',
  ),
  '/src/common/const/font-family.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/const/font-family.ts'),
    'utf-8',
  ),
  '/src/common/const/locale.ts': fs.readFileSync(path.resolve(__dirname, './code/common/const/locale.ts'), 'utf-8'),
  '/src/common/interface/alternate-format.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/alternate-format.ts'),
    'utf-8',
  ),
  '/src/common/interface/authority.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/authority.ts'),
    'utf-8',
  ),
  '/src/common/interface/border.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/border.ts'),
    'utf-8',
  ),
  '/src/common/interface/calc-chain.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/calc-chain.ts'),
    'utf-8',
  ),
  '/src/common/interface/cell-data.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/cell-data.ts'),
    'utf-8',
  ),
  '/src/common/interface/cell-right-click.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/cell-right-click.ts'),
    'utf-8',
  ),
  '/src/common/interface/cell-style.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/cell-style.ts'),
    'utf-8',
  ),
  '/src/common/interface/chart.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/chart.ts'),
    'utf-8',
  ),
  '/src/common/interface/condition-format.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/condition-format.ts'),
    'utf-8',
  ),
  '/src/common/interface/data-verification.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/data-verification.ts'),
    'utf-8',
  ),
  '/src/common/interface/filter.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/filter.ts'),
    'utf-8',
  ),
  '/src/common/interface/font-list.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/font-list.ts'),
    'utf-8',
  ),
  '/src/common/interface/frozen.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/frozen.ts'),
    'utf-8',
  ),
  '/src/common/interface/hyperlink.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/hyperlink.ts'),
    'utf-8',
  ),
  '/src/common/interface/image.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/image.ts'),
    'utf-8',
  ),
  '/src/common/interface/loading.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/loading.ts'),
    'utf-8',
  ),
  '/src/common/interface/lucky-json.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/lucky-json.ts'),
    'utf-8',
  ),
  '/src/common/interface/lucky-sheet.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/lucky-sheet.ts'),
    'utf-8',
  ),
  '/src/common/interface/merge-cell.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/merge-cell.ts'),
    'utf-8',
  ),
  '/src/common/interface/pager.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/pager.ts'),
    'utf-8',
  ),
  '/src/common/interface/pivot-table.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/pivot-table.ts'),
    'utf-8',
  ),
  '/src/common/interface/postil.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/postil.ts'),
    'utf-8',
  ),
  '/src/common/interface/selection.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/selection.ts'),
    'utf-8',
  ),
  '/src/common/interface/sheet-bar.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/sheet-bar.ts'),
    'utf-8',
  ),
  '/src/common/interface/sheet-config.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/sheet-config.ts'),
    'utf-8',
  ),
  '/src/common/interface/sheet-right-click.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/sheet-right-click.ts'),
    'utf-8',
  ),
  '/src/common/interface/statistic-bar.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/statistic-bar.ts'),
    'utf-8',
  ),
  '/src/common/interface/toolbar.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/toolbar.ts'),
    'utf-8',
  ),
  '/src/common/interface/user-info.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/interface/user-info.ts'),
    'utf-8',
  ),
  '/src/common/utils/selection.ts': fs.readFileSync(
    path.resolve(__dirname, './code/common/utils/selection.ts'),
    'utf-8',
  ),
  '/src/core/utils/color-gradation-condition.ts': fs.readFileSync(
    path.resolve(__dirname, './code/core/utils/color-gradation-condition.ts'),
    'utf-8',
  ),
  '/src/core/utils/data-bar-condition.ts': fs.readFileSync(
    path.resolve(__dirname, './code/core/utils/data-bar-condition.ts'),
    'utf-8',
  ),
  '/src/core/utils/default-condition.ts': fs.readFileSync(
    path.resolve(__dirname, './code/core/utils/default-condition.ts'),
    'utf-8',
  ),
  '/src/core/utils/icon-set-condition.ts': fs.readFileSync(
    path.resolve(__dirname, './code/core/utils/icon-set-condition.ts'),
    'utf-8',
  ),
  '/src/core/border.ts': fs.readFileSync(path.resolve(__dirname, './code/core/border.ts'), 'utf-8'),
  '/src/core/cell.ts': fs.readFileSync(path.resolve(__dirname, './code/core/cell.ts'), 'utf-8'),
  '/src/core/condition-format.ts': fs.readFileSync(path.resolve(__dirname, './code/core/condition-format.ts'), 'utf-8'),
  '/src/core/data-verification.ts': fs.readFileSync(
    path.resolve(__dirname, './code/core/data-verification.ts'),
    'utf-8',
  ),
  '/src/core/lucky-to-univer.ts': fs.readFileSync(path.resolve(__dirname, './code/core/lucky-to-univer.ts'), 'utf-8'),
  '/src/core/workbook-property.ts': fs.readFileSync(
    path.resolve(__dirname, './code/core/workbook-property.ts'),
    'utf-8',
  ),
  '/src/core/worksheet-config.ts': fs.readFileSync(path.resolve(__dirname, './code/core/worksheet-config.ts'), 'utf-8'),
  '/src/core/worksheet-property.ts': fs.readFileSync(
    path.resolve(__dirname, './code/core/worksheet-property.ts'),
    'utf-8',
  ),
}

export default {
  metadata,
  files,
  Preview,
}
