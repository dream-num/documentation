import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Basic Example (Preset Mode)',
    'zh-CN': '基础示例（预设模式）',
  },
  description: {
    'en-US': 'A basic example of Univer Sheets in preset mode, demonstrating how to use the core features of Univer Sheets.',
    'zh-CN': 'Univer Sheets 官方预设的基础示例，展示了如何使用 Univer Sheets 的核心功能。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
  },
}

const indexTs = fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8')
const dataTs = fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8')

export const files = {
  '/src/index.ts': indexTs,
  '/src/data.ts': dataTs,
}

export default {
  metadata,
  files,
  Preview,
}
