import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Custom Canvas Rendering',
    'zh-CN': '自定义绘制',
  },
  description: {
    'en-US': 'Univer provides an extension mechanism that allows you to customize the rendering of content in a spreadsheet. This mechanism can be used to implement custom row headers, column headers, and middle content area rendering.',
    'zh-CN': 'Univer 提供了一套扩展机制，可以让你在电子表格中自定义绘制内容。这个机制可以用于实现自定义的行标题、列标题、中间内容区域的渲染。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
  },
}

const indexTs = fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8')
const extensionsMainExtensionTs = fs.readFileSync(path.resolve(__dirname, './code/extensions/main.extension.ts'), 'utf-8')
const extensionsColumnHeaderExtensionTs = fs.readFileSync(path.resolve(__dirname, './code/extensions/column-header.extension.ts'), 'utf-8')
const extensionsRowHeaderExtensionTs = fs.readFileSync(path.resolve(__dirname, './code/extensions/row-header.extension.ts'), 'utf-8')
const dataTs = fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8')
const stylesCss = fs.readFileSync(path.resolve(__dirname, './code/styles.css'), 'utf-8')
const indexHtml = fs.readFileSync(path.resolve(__dirname, './code/index.html'), 'utf-8')

export const files = {
  '/index.ts': indexTs,
  '/data.ts': dataTs,
  '/extensions/main.extension.ts': extensionsMainExtensionTs,
  '/extensions/column-header.extension.ts': extensionsColumnHeaderExtensionTs,
  '/extensions/row-header.extension.ts': extensionsRowHeaderExtensionTs,
  '/styles.css': stylesCss,
  '/index.html': indexHtml,
}

export default {
  metadata,
  files,
  Preview,
}
