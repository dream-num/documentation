import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Find and Replace',
    'zh-CN': '查找和替换',
  },
  description: {
    'en-US': 'The Find and Replace feature allows users to quickly locate and modify data within their spreadsheets, improving efficiency and accuracy.',
    'zh-CN': '查找和替换功能允许用户快速定位和修改电子表格中的数据，从而提高效率和准确性。',
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
