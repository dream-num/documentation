import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dependencies } from './dependencies'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Univer Docs Slim Example (Preset Mode)',
    'zh-CN': 'Univer Docs 精简示例（预设模式）',
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

const indexTs = fs.readFileSync(path.resolve(__dirname, './code/index.raw.ts'), 'utf-8')
const dataTs = fs.readFileSync(path.resolve(__dirname, './code/data.raw.ts'), 'utf-8')
const stylesCss = fs.readFileSync(path.resolve(__dirname, './code/styles.raw.css'), 'utf-8')
const indexHtml = fs.readFileSync(path.resolve(__dirname, './code/index.raw.html'), 'utf-8')

export const files = {
  '/index.ts': indexTs,
  '/data.ts': dataTs,
  '/styles.css': stylesCss,
  '/index.html': indexHtml,
}

export default {
  metadata,
  files,
  dependencies,
  Preview,
}
