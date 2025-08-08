import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Basic Example (Preset Mode)',
    'zh-CN': '基础示例（预设模式）',
    'ja-JP': '基本例（プリセットモード）',
  },
  description: {
    'en-US': 'A basic example of Univer Sheets in preset mode, demonstrating how to use the core features of Univer Sheets.',
    'zh-CN': 'Univer Sheets 官方预设的基础示例，展示了如何使用 Univer Sheets 的核心功能。',
    'ja-JP': 'プリセットモードの Unive Sheets の基本例であり、Univer Sheets のコア機能の使い方を示しています。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
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
