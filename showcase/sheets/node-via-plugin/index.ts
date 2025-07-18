import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Running Headless Univer Sheets in Node.js',
    'zh-CN': '在 Node.js 运行无头 Univer Sheets',
  },
  description: {
    'en-US': 'This example demonstrates how to run Univer Sheets in a Node.js environment using a plugin. It showcases the minimal setup required to create and manipulate a workbook without a UI.',
    'zh-CN': '本示例演示了如何在 Node.js 环境中使用插件运行 Univer Sheets。它展示了在没有 UI 的情况下创建和操作工作簿所需的最小设置。',
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
