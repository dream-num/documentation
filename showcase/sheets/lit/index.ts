import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Lit Example',
    'zh-CN': 'Lit 示例',
    'ja-JP': 'Lit の例',
  },
  description: {
    'en-US': 'A minimal configuration example of Univer Sheets using Lit.',
    'zh-CN': '使用 Lit 的 Univer Sheets 最小配置示例',
    'ja-JP': 'Lit を使用した Univer Sheets の最小構成例です。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode', 'Web Components'],
    'zh-CN': ['Univer Sheets', '预设模式', 'Web Components'],
    'ja-JP': ['Univer Sheets', 'プリセットモード', 'Web Components'],
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
