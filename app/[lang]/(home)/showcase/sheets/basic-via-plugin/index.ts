import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dependencies } from './dependencies'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Univer Sheets Basic Example(Plugin Mode)',
    'zh-CN': 'Univer Sheets 基础示例（插件模式）',
  },
  description: {
    'en-US': 'A basic example of Univer Sheets, showcasing the minimal setup required to get started with Univer Sheets.',
    'zh-CN': 'Univer Sheets 的基础示例，展示了使用 Univer Sheets 所需的最小配置。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Plugin Mode'],
    'zh-CN': ['Univer Sheets', '插件模式'],
  },
}

const indexTs = fs.readFileSync(path.resolve(__dirname, './index.raw.ts'), 'utf-8')
const dataTs = fs.readFileSync(path.resolve(__dirname, './data.raw.ts'), 'utf-8')
const stylesCss = fs.readFileSync(path.resolve(__dirname, './styles.raw.css'), 'utf-8')
const indexHtml = fs.readFileSync(path.resolve(__dirname, './index.raw.html'), 'utf-8')

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
}
