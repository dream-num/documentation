import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Crosshair Highlighting',
    'zh-CN': '十字高亮',
  },
  description: {
    'en-US': 'An example of crosshair highlighting in Univer Sheets, demonstrating how to highlight cells based on the current selection.',
    'zh-CN': 'Univer Sheets 中的十字高亮示例，展示了如何根据当前选择高亮显示单元格。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
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
  Preview,
}
