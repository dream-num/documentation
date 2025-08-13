import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Annotations',
    'zh-CN': '批注',
    'zh-TW': '批註',
    'ja-JP': '注釈',
  },
  description: {
    'en-US': 'Annotations functionality allows users to add comments in spreadsheet cells to record additional information or provide context. It supports various comment styles and operations, helping users better understand and collaborate on data.',
    'zh-CN': '批注功能允许用户在电子表格单元格中添加评论，以记录附加信息或提供上下文。它支持各种评论样式和操作，帮助用户更好地理解和协作处理数据。',
    'zh-TW': '批註功能允許用戶在電子表格單元格中添加評論，以記錄附加信息或提供上下文。它支持各種評論樣式和操作，幫助用戶更好地理解和協作處理數據。',
    'ja-JP': '注釈機能により、ユーザーはスプレッドシートのセルにコメントを追加して、追加情報を記録したり、コンテキストを提供したりできます。さまざまなコメントスタイルと操作をサポートしており、ユーザーがデータをよりよく理解し、共同作業できるようにします。',
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
