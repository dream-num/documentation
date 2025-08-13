import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Print',
    'zh-CN': '打印',
    'zh-TW': '列印',
    'ja-JP': '印刷',
  },
  description: {
    'en-US': 'This example demonstrates how to create and manipulate print settings in Univer Sheets',
    'zh-CN': '本示例演示了如何使用 Univer Sheets 创建和操作打印设置',
    'zh-TW': '本範例演示了如何使用 Univer Sheets 創建和操作列印設定',
    'ja-JP': 'この例では、Univer Sheets で印刷設定を作成および操作する方法を示します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
}

const indexTs = fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8')
const dataTs = fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8')

export const files = {
  '/src/index.ts': indexTs,
  '/src/data.ts': dataTs,
}

export default {
  metadata,
  files,
  Preview,
}
