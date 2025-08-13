import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Migrate From Luckysheet to Univer',
    'zh-CN': '从 Luckysheet 迁移到 Univer',
    'zh-TW': '從 Luckysheet 遷移到 Univer',
    'ja-JP': 'Luckysheet から Univer への移行',
  },
  description: {
    'en-US': 'Compared with Luckysheet, our newly designed Univer has made great improvements in terms of architecture, data structure and API, so Luckysheet can no longer be migrated 1:1 to Univer. However, we provide a migration example to help you understand how to migrate Luckysheet features to Univer.',
    'zh-CN': '与 Luckysheet 相比，我们新设计的 Univer 在架构、数据结构和 API 等方面有了很大的改进，因此 Luckysheet 无法再 1:1 迁移到 Univer。但是，我们提供了一个迁移示例，帮助您了解如何将 Luckysheet 的功能迁移到 Univer。',
    'zh-TW': '與 Luckysheet 相比，我們新設計的 Univer 在架構、數據結構和 API 等方面有了很大的改進，因此 Luckysheet 無法再 1:1 遷移到 Univer。但是，我們提供了一個遷移示例，幫助您了解如何將 Luckysheet 的功能遷移到 Univer。',
    'ja-JP': 'Luckysheet と比較して、新しく設計された Univer は、アーキテクチャ、データ構造、API の面で大きな改善を遂げているため、Luckysheet を Univer に 1:1 で移行することはできません。ただし、Luckysheet の機能を Univer に移行する方法を理解するのに役立つ移行例を提供します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
}

export const files = {
  '/src/index.ts': fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8'),
  '/src/data.ts': fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8'),
  '/src/common/const/data-verification.ts': fs.readFileSync(path.resolve(__dirname, './code/common/const/data-verification.ts'), 'utf-8'),
  '/src/common/const/font-family.ts': fs.readFileSync(path.resolve(__dirname, './code/common/const/font-family.ts'), 'utf-8'),
  '/src/common/const/locale.ts': fs.readFileSync(path.resolve(__dirname, './code/common/const/locale.ts'), 'utf-8'),
  '/src/common/interface/alternate-format.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/alternate-format.ts'), 'utf-8'),
  '/src/common/interface/authority.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/authority.ts'), 'utf-8'),
  '/src/common/interface/border.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/border.ts'), 'utf-8'),
  '/src/common/interface/calc-chain.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/calc-chain.ts'), 'utf-8'),
  '/src/common/interface/cell-data.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/cell-data.ts'), 'utf-8'),
  '/src/common/interface/cell-right-click.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/cell-right-click.ts'), 'utf-8'),
  '/src/common/interface/cell-style.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/cell-style.ts'), 'utf-8'),
  '/src/common/interface/chart.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/chart.ts'), 'utf-8'),
  '/src/common/interface/condition-format.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/condition-format.ts'), 'utf-8'),
  '/src/common/interface/data-verification.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/data-verification.ts'), 'utf-8'),
  '/src/common/interface/filter.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/filter.ts'), 'utf-8'),
  '/src/common/interface/font-list.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/font-list.ts'), 'utf-8'),
  '/src/common/interface/frozen.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/frozen.ts'), 'utf-8'),
  '/src/common/interface/hyperlink.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/hyperlink.ts'), 'utf-8'),
  '/src/common/interface/image.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/image.ts'), 'utf-8'),
  '/src/common/interface/loading.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/loading.ts'), 'utf-8'),
  '/src/common/interface/lucky-json.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/lucky-json.ts'), 'utf-8'),
  '/src/common/interface/lucky-sheet.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/lucky-sheet.ts'), 'utf-8'),
  '/src/common/interface/merge-cell.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/merge-cell.ts'), 'utf-8'),
  '/src/common/interface/pager.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/pager.ts'), 'utf-8'),
  '/src/common/interface/pivot-table.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/pivot-table.ts'), 'utf-8'),
  '/src/common/interface/postil.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/postil.ts'), 'utf-8'),
  '/src/common/interface/selection.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/selection.ts'), 'utf-8'),
  '/src/common/interface/sheet-bar.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/sheet-bar.ts'), 'utf-8'),
  '/src/common/interface/sheet-config.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/sheet-config.ts'), 'utf-8'),
  '/src/common/interface/sheet-right-click.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/sheet-right-click.ts'), 'utf-8'),
  '/src/common/interface/statistic-bar.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/statistic-bar.ts'), 'utf-8'),
  '/src/common/interface/toolbar.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/toolbar.ts'), 'utf-8'),
  '/src/common/interface/user-info.ts': fs.readFileSync(path.resolve(__dirname, './code/common/interface/user-info.ts'), 'utf-8'),
  '/src/common/utils/selection.ts': fs.readFileSync(path.resolve(__dirname, './code/common/utils/selection.ts'), 'utf-8'),
  '/src/core/utils/color-gradation-condition.ts': fs.readFileSync(path.resolve(__dirname, './code/core/utils/color-gradation-condition.ts'), 'utf-8'),
  '/src/core/utils/data-bar-condition.ts': fs.readFileSync(path.resolve(__dirname, './code/core/utils/data-bar-condition.ts'), 'utf-8'),
  '/src/core/utils/default-condition.ts': fs.readFileSync(path.resolve(__dirname, './code/core/utils/default-condition.ts'), 'utf-8'),
  '/src/core/utils/icon-set-condition.ts': fs.readFileSync(path.resolve(__dirname, './code/core/utils/icon-set-condition.ts'), 'utf-8'),
  '/src/core/border.ts': fs.readFileSync(path.resolve(__dirname, './code/core/border.ts'), 'utf-8'),
  '/src/core/cell.ts': fs.readFileSync(path.resolve(__dirname, './code/core/cell.ts'), 'utf-8'),
  '/src/core/condition-format.ts': fs.readFileSync(path.resolve(__dirname, './code/core/condition-format.ts'), 'utf-8'),
  '/src/core/data-verification.ts': fs.readFileSync(path.resolve(__dirname, './code/core/data-verification.ts'), 'utf-8'),
  '/src/core/lucky-to-univer.ts': fs.readFileSync(path.resolve(__dirname, './code/core/lucky-to-univer.ts'), 'utf-8'),
  '/src/core/workbook-property.ts': fs.readFileSync(path.resolve(__dirname, './code/core/workbook-property.ts'), 'utf-8'),
  '/src/core/worksheet-config.ts': fs.readFileSync(path.resolve(__dirname, './code/core/worksheet-config.ts'), 'utf-8'),
  '/src/core/worksheet-property.ts': fs.readFileSync(path.resolve(__dirname, './code/core/worksheet-property.ts'), 'utf-8'),
}

export default {
  metadata,
  files,
  Preview,
}
