import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Minimal Example (Preset Mode)',
    'zh-CN': '精简示例（预设模式）',
  },
  description: {
    'en-US': 'A minimal setup example for Univer Sheets, demonstrating the minimum configuration required to use Univer Sheets.',
    'zh-CN': 'Univer Sheets 的精简配置示例，展示了使用 Univer Sheets 所需的最小配置。',
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
