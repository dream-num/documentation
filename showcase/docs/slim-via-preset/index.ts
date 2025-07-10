import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Minimal Example (Plugin Mode)',
    'zh-CN': '精简示例（插件模式）',
  },
  description: {
    'en-US': 'A minimal setup example for Univer Docs, demonstrating the minimum configuration required to use Univer Docs.',
    'zh-CN': 'Univer Docs 的精简配置示例，展示了使用 Univer Docs 所需的最小配置。',
  },
  tags: {
    'en-US': ['Univer Docs', 'Preset Mode'],
    'zh-CN': ['Univer Docs', '预设模式'],
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
