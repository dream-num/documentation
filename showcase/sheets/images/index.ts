import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': ' Images',
    'zh-CN': '图片',
  },
  description: {
    'en-US': 'The image feature allows users to insert and manage images in spreadsheets to better present data and information. It supports various image formats and operations, helping users create richer documents.',
    'zh-CN': '图片功能允许用户在电子表格中插入和管理图片，以便更好地展示数据和信息。它支持多种图片格式和操作，帮助用户创建更丰富的文档。',
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
