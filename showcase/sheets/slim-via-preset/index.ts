import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Minimal Example (Preset Mode)',
    'zh-CN': '精简示例（预设模式）',
    'zh-TW': '最小範例（預設模式）',
    'ja-JP': '最小限の例（プリセットモード）',
  },
  description: {
    'en-US': 'A minimal setup example for Univer Sheets, demonstrating the minimum configuration required to use Univer Sheets.',
    'zh-CN': 'Univer Sheets 的精简配置示例，展示了使用 Univer Sheets 所需的最小配置。',
    'zh-TW': 'Univer Sheets 的最小配置示例，展示了使用 Univer Sheets 所需的最小配置。',
    'ja-JP': 'Univer Sheets の最小限のセットアップ例で、Univer Sheets を使用するために必要な最小限の構成を示しています。',
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
