import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Lit Example',
    'zh-CN': 'Lit 示例',
  },
  description: {
    'en-US': 'A minimal configuration example of Univer Docs using Lit.',
    'zh-CN': '使用 Lit 的 Univer Docs 最小配置示例',
  },
  tags: {
    'en-US': ['Univer Docs', 'Preset Mode', 'Web Components'],
    'zh-CN': ['Univer Docs', '预设模式', 'Web Components'],
  },
}

const indexTs = fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8')
const dataTs = fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8')
const stylesCss = fs.readFileSync(path.resolve(__dirname, './code/styles.css'), 'utf-8')
const indexHtml = fs.readFileSync(path.resolve(__dirname, './code/index.html'), 'utf-8')

export const files = {
  '/index.ts': indexTs,
  '/data.ts': dataTs,
  '/styles.css': stylesCss,
  '/index.html': indexHtml,
}

export default {
  metadata,
  files,
  Preview,
}
