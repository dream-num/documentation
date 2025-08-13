import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Lit Example',
    'zh-CN': 'Lit 示例',
    'zh-TW': 'Lit 示例',
    'ja-JP': 'Lit の例',
  },
  description: {
    'en-US': 'A minimal configuration example of Univer Docs using Lit.',
    'zh-CN': '使用 Lit 的 Univer Docs 最小配置示例',
    'zh-TW': '使用 Lit 的 Univer Docs 最小配置示例',
    'ja-JP': 'Lit を使用した Univer Docs の最小構成例です。',
  },
  tags: {
    'en-US': ['Univer Docs', 'Preset Mode', 'Web Components'],
    'zh-CN': ['Univer Docs', '预设模式', 'Web Components'],
    'zh-TW': ['Univer Docs', '預設模式', 'Web Components'],
    'ja-JP': ['Univer Docs', 'プリセットモード', 'Web Components'],
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
