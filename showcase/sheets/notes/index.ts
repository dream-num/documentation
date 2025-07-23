import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Annotations',
    'zh-CN': '批注',
  },
  description: {
    'en-US': 'Annotations functionality allows users to add comments in spreadsheet cells to record additional information or provide context. It supports various comment styles and operations, helping users better understand and collaborate on data.',
    'zh-CN': '批注功能允许用户在电子表格单元格中添加评论，以记录附加信息或提供上下文。它支持各种评论样式和操作，帮助用户更好地理解和协作处理数据。',
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
