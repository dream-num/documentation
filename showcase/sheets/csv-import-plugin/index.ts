import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Custom CSV Import Plugin',
    'zh-CN': '自定义 CSV 导入插件',
    'zh-TW': '自訂 CSV 匯入插件',
    'ja-JP': 'カスタム CSV インポート プラグイン',
  },
  description: {
    'en-US': 'This example demonstrates how to create a custom plugin for Univer Sheets that allows users to import CSV files into a spreadsheet. The plugin provides a button that, when clicked, prompts the user to select a CSV file, reads its content, and populates the spreadsheet with the data from the CSV file.',
    'zh-CN': '此示例演示了如何为 Univer Sheets 创建一个自定义插件，允许用户将 CSV 文件导入电子表格。该插件提供了一个按钮，单击后会提示用户选择 CSV 文件，读取其内容，并使用 CSV 文件中的数据填充电子表格。',
    'zh-TW': '此範例展示了如何為 Univer Sheets 創建一個自訂插件，允許使用者將 CSV 檔案匯入電子表格。該插件提供了一個按鈕，單擊後會提示使用者選擇 CSV 檔案，讀取其內容，並使用 CSV 檔案中的資料填充電子表格。',
    'ja-JP': 'この例では、Univer Sheets 用のカスタム プラグインを作成して、ユーザーが CSV ファイルをスプレッドシートにインポートできるようにする方法を示します。このプラグインには、クリックするとユーザーに CSV ファイルを選択するように促すボタンがあり、その内容を読み取り、CSV ファイルのデータでスプレッドシートを埋めます。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
}

const indexTs = fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8')
const pluginTs = fs.readFileSync(path.resolve(__dirname, './code/csv-plugin/plugin.ts'), 'utf-8')
const utilsTs = fs.readFileSync(path.resolve(__dirname, './code/csv-plugin/utils.ts'), 'utf-8')
const dataTs = fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8')

export const files = {
  '/src/index.ts': indexTs,
  '/src/csv-plugin/plugin.ts': pluginTs,
  '/src/csv-plugin/utils.ts': utilsTs,
  '/src/data.ts': dataTs,
}

export default {
  metadata,
  files,
  Preview,
}
