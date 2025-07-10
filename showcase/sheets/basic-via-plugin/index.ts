import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Basic Example (Plugin Mode)',
    'zh-CN': '基础示例（插件模式）',
  },
  description: {
    'en-US': 'A basic example of Univer Sheets in plugin mode, demonstrating how to use the core features of Univer Sheets.',
    'zh-CN': 'Univer Sheets 官方插件的基础示例，展示了如何使用 Univer Sheets 的核心功能。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Plugin Mode'],
    'zh-CN': ['Univer Sheets', '插件模式'],
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
