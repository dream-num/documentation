import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dependencies } from './dependencies'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Univer Sheets Basic Example (Plugin Mode)',
    'zh-CN': 'Univer Sheets 基础示例（插件模式）',
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
