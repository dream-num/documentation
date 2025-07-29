import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': ' Hyper Link',
    'zh-CN': '超链接',
  },
  description: {
    'en-US': 'The Hyper Link feature allows users to insert and manage hyperlinks in spreadsheets, enhancing data interactivity and navigation.',
    'zh-CN': '超链接功能允许用户在电子表格中插入和管理超链接，以增强数据的交互性和导航性。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
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
