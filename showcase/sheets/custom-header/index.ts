import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Custom Header',
    'zh-CN': '自定义行列头',
    'zh-TW': '自定義行列頭',
    'ja-JP': 'カスタムヘッダー',
  },
  description: {
    'en-US':
      'Univer SDK allows you to customize the text and style of row and column headers using the `customizeColumnHeader` and `customizeRowHeader` APIs.',
    'zh-CN': 'Univer SDK 支持使用 `customizeColumnHeader` 和 `customizeRowHeader` API 自定义行列头的文案和样式。',
    'zh-TW': 'Univer SDK 支援使用 `customizeColumnHeader` 和 `customizeRowHeader` API 自定義行列頭的文案和樣式。',
    'ja-JP':
      'Univer SDK では、`customizeColumnHeader` および `customizeRowHeader` API を使用して、行および列ヘッダーのテキストとスタイルをカスタマイズできます。',
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
