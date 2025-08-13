import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Hyper Link',
    'zh-CN': '超链接',
    'zh-TW': '超連結',
    'ja-JP': 'ハイパーリンク',
  },
  description: {
    'en-US': 'The Hyper Link feature allows users to insert and manage hyperlinks in spreadsheets, enhancing data interactivity and navigation.',
    'zh-CN': '超链接功能允许用户在电子表格中插入和管理超链接，以增强数据的交互性和导航性。',
    'zh-TW': '超連結功能允許用戶在電子表格中插入和管理超連結，以增強數據的互動性和導航性。',
    'ja-JP': 'ハイパーリンク機能により、ユーザーはスプレッドシートにハイパーリンクを挿入および管理でき、データのインタラクティブ性とナビゲーションが向上します。',
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
