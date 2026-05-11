import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Hide Row/Column Headers',
    'zh-CN': '隐藏行列头',
    'zh-TW': '隱藏行列頭',
    'ja-JP': '行列ヘッダーを非表示',
  },
  description: {
    'en-US': 'Demonstrates how to hide row and column headers in Univer Sheets.',
    'zh-CN': '演示如何在 Univer Sheets 中隐藏行头和列头。',
    'zh-TW': '演示如何在 Univer Sheets 中隱藏行頭和列頭。',
    'ja-JP': 'Univer Sheets で行ヘッダーと列ヘッダーを非表示する方法を示します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Header', 'Visibility'],
    'zh-CN': ['Univer Sheets', '行列头', '显示隐藏'],
    'zh-TW': ['Univer Sheets', '行列頭', '顯示隱藏'],
    'ja-JP': ['Univer Sheets', 'ヘッダー', '表示/非表示'],
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
