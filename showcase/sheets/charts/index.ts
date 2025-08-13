import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Charts',
    'zh-CN': '图表',
    'zh-TW': '圖表',
    'ja-JP': 'チャート',
  },
  description: {
    'en-US': 'This example demonstrates how to create and manipulate charts in Univer Sheets',
    'zh-CN': '本示例演示了如何使用 Univer Sheets 创建和操作电子表格中的图表',
    'zh-TW': '本範例演示了如何在 Univer Sheets 中創建和操作圖表',
    'ja-JP': 'この例では、Univer Sheets でチャートを作成および操作する方法を示します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
}

const indexTs = fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8')
const functionTs = fs.readFileSync(path.resolve(__dirname, './code/function.ts'), 'utf-8')
const themeJson = fs.readFileSync(path.resolve(__dirname, './code/theme.json'), 'utf-8')
const dataTs = fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8')

export const files = {
  '/src/index.ts': indexTs,
  '/src/function.ts': functionTs,
  '/src/theme.json': themeJson,
  '/src/data.ts': dataTs,
}

export default {
  metadata,
  files,
  Preview,
}
