import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Custom CSV Import Plugin',
    'zh-CN': '自定义 CSV 导入插件',
  },
  description: {
    'en-US': 'This example demonstrates how to create a custom plugin for Univer Sheets that allows users to import CSV files into a spreadsheet. The plugin provides a button that, when clicked, prompts the user to select a CSV file, reads its content, and populates the spreadsheet with the data from the CSV file.',
    'zh-CN': '此示例演示了如何为 Univer Sheets 创建一个自定义插件，允许用户将 CSV 文件导入电子表格。该插件提供了一个按钮，单击后会提示用户选择 CSV 文件，读取其内容，并使用 CSV 文件中的数据填充电子表格。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
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
