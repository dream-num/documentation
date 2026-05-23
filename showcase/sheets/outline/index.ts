import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Outline',
    'zh-CN': '分组',
    'zh-TW': '群組',
    'ja-JP': 'アウトライン',
  },
  description: {
    'en-US': 'This example demonstrates how to create row and column outline groups in Univer Sheets.',
    'zh-CN': '本示例演示了如何在 Univer Sheets 中创建行分组和列分组。',
    'zh-TW': '本範例演示了如何在 Univer Sheets 中建立行群組和列群組。',
    'ja-JP': 'この例では、Univer Sheets で行と列のアウトライングループを作成する方法を示します。',
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
}

export default {
  metadata,
  files,
  Preview,
}
