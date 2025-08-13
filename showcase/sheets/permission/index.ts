import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Hide Permission Background Shadow',
    'zh-CN': '隐藏权限背景阴影',
    'zh-TW': '隱藏權限背景陰影',
    'ja-JP': '権限の背景影を非表示にする',
  },
  description: {
    'en-US': 'This example demonstrates how to hide the permission background shadow in Univer Sheets.',
    'zh-CN': '这个示例展示了如何在 Univer Sheets 中隐藏权限背景阴影。',
    'zh-TW': '這個範例展示了如何在 Univer Sheets 中隱藏權限背景陰影。',
    'ja-JP': 'この例では、Univer Sheets で権限の背景影を非表示にする方法を示します。',
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
